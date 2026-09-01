import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson30: Lesson = {
  id: "lesson-30",
  num: 30,
  title: "Dates & buckets — slicing the calendar",
  blurb: "strftime format codes, date arithmetic with julianday, and GROUP BY over time buckets",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "On this store, dates are **TEXT in ISO form** — `'2024-05-09'` — and that choice quietly does half the work: ISO strings sort correctly as plain text, so `ORDER BY created_at` is already chronological. But *Which month? Which weekday? How many days to ship?* need calendar math, and that's what SQLite's date functions provide: slice with `strftime`, shift with `date(…, '+N days')`, measure with `julianday`.",
    },
    { kind: "diagram", figure: "t2-calendar" },
    {
      kind: "code",
      caption: "The bucket-and-count skeleton: 103 orders across 14 months",
      sql: `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n
FROM orders
GROUP BY mon
ORDER BY mon;   -- 2024-01: 8 … 2025-02: 7`,
    },
    { kind: "h", text: "The format mini-language" },
    {
      kind: "table",
      headers: ["code", "meaning", "example on '2024-05-09'"],
      rows: [
        ["%Y", "4-digit year", "2024"],
        ["%m", "month, zero-padded", "05"],
        ["%d", "day of month", "09"],
        ["%w", "weekday — 0 is Sunday", "4 (Thursday)"],
        ["%j", "day of year", "130"],
        ["%H:%M:%S", "time part (here: zeros)", "00:00:00"],
      ],
      caption: "strftime('%…', value) — compose codes like '%Y-%m' or '%Y-%w'",
    },
    {
      kind: "bullets",
      items: [
        "`%w` is the C-strftime convention: **0 = Sunday** through 6 = Saturday. On this store Monday (`1`) leads with 20 orders and Saturday (`6`) is quietest at 8.",
        "`GROUP BY mon` (the alias) works in SQLite and MySQL; PostgreSQL wants the expression repeated — `GROUP BY strftime('%Y-%m', created_at)`. Write the portable form when in doubt.",
        "Buckets only exist for data that's IN them — a zero-order month won't appear unless you manufacture its row (a calendar table cross-joined in; a module-6 trick).",
      ],
    },
    { kind: "h", text: "Arithmetic on days" },
    {
      kind: "code",
      caption: "How long does fulfillment take? julianday turns dates into numbers",
      sql: `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_lead_days
FROM orders
WHERE shipped_at IS NOT NULL;   -- 2.98 days (min 2, max 4)`,
    },
    {
      kind: "bullets",
      items: [
        "`julianday(x)` converts a date to a fractional day count — subtracting two of them yields the gap in days, decimals included.",
        "`date('2024-05-09', '+2 days')`, `'+1 month'`, `'-1 year'`, `'weekday 1'` — modifiers chain: `date(d, '+1 month', '-1 day')` is the classic *end of month* recipe.",
        "Need whole days for a report column? Wrap the difference: `CAST(julianday(a) - julianday(b) AS INTEGER)`.",
      ],
    },
    { kind: "diagram", figure: "t6-month-buckets" },
    { kind: "h", text: "The year in two rows" },
    {
      kind: "code",
      caption: "One bucket per year — the same skeleton, coarser slice",
      sql: `SELECT strftime('%Y', created_at) AS y,
       COUNT(*) AS n, ROUND(SUM(total), 2) AS rev
FROM orders GROUP BY y ORDER BY y;
-- 2024: 90 orders · 30773.25
-- 2025: 13 orders ·  4060.03`,
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Date functions are built in and operate on ISO-8601 TEXT, real numbers (julian days), or integers (unix epochs). There is no dedicated DATE type — the zero-padded ISO convention IS the type system.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has a true DATE/TIMESTAMP type: `date_trunc('month', ts)`, `EXTRACT(year FROM ts)`, `ts + INTERVAL '2 days'`, and `AGE(a, b)` — richer, stricter, and pickier about input format.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL: `DATE_FORMAT(created_at, '%Y-%m')` plays the strftime role, `DATE_ADD(d, INTERVAL 2 DAY)` does arithmetic, `DATEDIFF(a, b)` the gap. The % codes are near-twins — but named functions, not one swiss-army knife.",
    },
    {
      kind: "warn",
      text: "ISO discipline is load-bearing: `'2024-3-1'` (no zero-padding) sorts AFTER `'2024-10-12'` as text and can return NULL from date functions. Store zero-padded ISO or a real date type — anything else is a time bomb.",
    },
    {
      kind: "tip",
      text: "Bucket, count, then sort by bucket — three lines that answer a third of all business questions ('how are we trending?'). The next two lessons bolt ranking and month-over-month deltas onto exactly this skeleton.",
    },
  ],
  mcqs: [
    {
      id: "l30-q1",
      prompt: "What does `strftime('%Y-%m', '2024-05-09')` return?",
      choices: ["'2024-05'", "'2024-05-09'", "'05-2024'", "2024.05"],
      answer: 0,
      why: "The format string keeps exactly what it names: 4-digit year, dash, zero-padded month — the canonical bucket key for time series.",
      notes: [
        { choice: 1, why: "That's the input, not the output — strftime reformats, and '%Y-%m' asks for year and month only." },
      ],
    },
    {
      id: "l30-q2",
      prompt: "`strftime('%w', d)` returns 4. Which weekday is that?",
      choices: ["Wednesday — 1-based from Monday", "Thursday — 0 is Sunday", "Friday", "It's the week number, not a weekday"],
      answer: 1,
      why: "%w follows the C convention: 0 = Sunday … 6 = Saturday. 4 is Thursday. (Week number is %j's cousin territory — %W — not %w.)",
      notes: [
        { choice: 0, why: "Monday-first intuition is ISO's; C strftime is Sunday-first. On this store Monday leads at 20 orders — as '1', not '0'." },
      ],
    },
    {
      id: "l30-q3",
      prompt: "Why does TEXT-ISO `ORDER BY created_at` already sort chronologically?",
      choices: [
        "SQLite detects date strings and special-cases them",
        "Zero-padded ISO orders identically as text and as time — biggest unit first",
        "TEXT always sorts numerically in SQLite",
        "It doesn't — you must always wrap in date()",
      ],
      answer: 1,
      why: "'2024-05-09' vs '2024-10-12': text comparison compares year, then month, then day — exactly the chronological order, provided every field is zero-padded to fixed width.",
      notes: [
        { choice: 0, why: "No detection happens — plain string comparison. The magic is in the FORMAT's discipline, which is why '2024-3-1' breaks it." },
      ],
    },
    {
      id: "l30-q4",
      prompt: "`julianday(shipped_at) - julianday(created_at)` gives 2.5. What does that number mean?",
      choices: [
        "An error — dates can't subtract",
        "Two and a half days between the two dates",
        "February 5th minus something",
        "2.5 weeks",
      ],
      answer: 1,
      why: "julianday maps a date to a fractional day count — the difference is the gap in days, decimals and all. CAST to INTEGER for whole-day reporting.",
      notes: [
        { choice: 0, why: "Dates-as-TEXT can't subtract, but julianday has already converted both sides into numbers — that's its entire job." },
      ],
    },
    {
      id: "l30-q5",
      prompt: "`date('2024-01-31', '+1 month')` returns…",
      choices: ["'2024-02-29' — clamped to month end", "'2024-03-02' — overflow spills", "'2024-02-31' — literal", "NULL — invalid date"],
      answer: 1,
      why: "SQLite computes Feb 31, which doesn't exist, and normalizes the overflow: 2024 is a leap year (Feb 29), so the extra 2 days land on March 2. Month arithmetic has edges — test them.",
      notes: [
        { choice: 0, why: "Clamping to month-end is what many application libraries do — SQLite spills instead. Neither is wrong; they differ, and reports differ with them." },
      ],
    },
    {
      id: "l30-q6",
      prompt: "Which GROUP BY is portable across SQLite, Postgres and MySQL?",
      choices: [
        "GROUP BY mon — the alias",
        "GROUP BY strftime('%Y-%m', created_at) — the expression",
        "GROUP BY 1 — the position",
        "All three, everywhere",
      ],
      answer: 1,
      why: "Postgres rejects alias-based and (historically) position-based grouping references in this context; repeating the expression works on all three engines, always.",
      notes: [
        { choice: 0, why: "SQLite and MySQL accept the alias — which is exactly why the habit spreads and then breaks on Postgres. Expression in GROUP BY, alias in ORDER BY." },
      ],
    },
    {
      id: "l30-q7",
      prompt: "The month bucket report shows 14 rows for this store. Why never 15 — with a zero-order month at 0?",
      choices: [
        "SQLite caps GROUP BY at 14 groups",
        "Buckets materialize from data — a month with no rows leaves no group",
        "Zero-counts are filtered automatically by COUNT",
        "There are only 14 months with orders possible",
      ],
      answer: 1,
      why: "GROUP BY divides EXISTING rows — nothing produces a 0 bucket. Manufacturing empty months needs a calendar table joined in (a cross-join move from module 6).",
      notes: [
        { choice: 2, why: "COUNT doesn't filter — there's simply no row for it to count. The empty bucket must be supplied from outside the data." },
      ],
    },
    {
      id: "l30-q8",
      prompt: "Fulfillment: avg lead 2.98 days, min 2, max 4. The report wants ONLY orders that took MORE than 3 days. What's the WHERE clause?",
      choices: [
        "WHERE julianday(shipped_at) - julianday(created_at) > 3",
        "WHERE shipped_at - created_at > 3",
        "WHERE julianday(shipped_at) > 3",
        "HAVING lead > 3 — no WHERE allowed on computed values",
      ],
      answer: 0,
      why: "Compute the gap per row in WHERE and compare to 3. Subtracting raw TEXT dates gives string nonsense; julianday(one date) alone compares a date to 3 days — meaningless without the anchor.",
      notes: [
        { choice: 3, why: "WHERE handles computed per-row values fine — HAVING is for post-aggregation. The gap is a row-level expression." },
      ],
    },
  ],
  problems: [
    {
      id: "l30-p1",
      title: "Orders per month",
      brief: "The trend line, bucket by month: output `mon` (like `2024-01`) and `n`, calendar order.",
      hints: [
        "strftime slices the bucket, COUNT fills it, ORDER BY the bucket key walks the calendar.",
        "Shape: SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon;",
      ],
      difficulty: "easy",
      solution:
        "SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\nFROM orders\nGROUP BY mon\nORDER BY mon;",
      mistakes: [
        { test: "\\bgroup\\s+by\\s+created_at\\b", message: "Grouping by the raw timestamp creates a bucket per instant — slice with strftime('%Y-%m', created_at) first so all of a month's orders land in one bucket." },
        { test: "order\\s+by\\s+n\\s+desc", message: "Sorting by count answers 'busiest months' — the brief wants the calendar walk: ORDER BY mon." },
        { test: "\\bshipped_at\\b", message: "created_at is the order date — shipped_at is 21 NULLs away from covering the same 103 orders." },
      ],
      expected: EXPECTED["l30-p1"],
      ordered: true,
    },
    {
      id: "l30-p2",
      title: "The year split",
      brief: "Two buckets, one per year: output `y`, `n`, and `rev` = ROUND(SUM(total), 2), chronological.",
      hints: [
        "Same skeleton, '%Y' format — and the bucket can carry several aggregates at once.",
        "Shape: SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY y ORDER BY y;",
      ],
      difficulty: "easy",
      solution:
        "SELECT strftime('%Y', created_at) AS y,\n  COUNT(*) AS n, ROUND(SUM(total), 2) AS rev\nFROM orders\nGROUP BY y\nORDER BY y;",
      mistakes: [
        { test: "%m", message: "%m slices months — the brief wants years: '%Y' alone." },
        { test: "\\bavg\\s*\\(", message: "The brief wants order count AND revenue — COUNT plus SUM, not averages." },
        { test: "round\\s*\\(\\s*sum\\s*\\(\\s*total\\s*\\)\\s*\\)\\s+as\\s+rev\\s+from", message: "ROUND needs the 2-decimal argument: ROUND(SUM(total), 2)." },
      ],
      expected: EXPECTED["l30-p2"],
      ordered: true,
    },
    {
      id: "l30-p3",
      title: "The weekday ledger",
      brief: "Which days do orders land on? Output `dow` (strftime '%w', as text) and `n`, ordered by dow — Sunday first, C-style.",
      hints: [
        "'%w' yields '0'..'6' with 0 = Sunday; group and count, sort by the code.",
        "Shape: SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n FROM orders GROUP BY dow ORDER BY dow;",
      ],
      difficulty: "medium",
      solution:
        "SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n\nFROM orders\nGROUP BY dow\nORDER BY dow;",
      mistakes: [
        { test: "%w[^;]*order\\s+by\\s+n\\s+desc", message: "Two questions — the brief sorts by dow (Sunday-first walk), not by busiest day." },
        { test: "case\\s+when", message: "No relabeling asked — the raw '%w' codes '0'..'6' are the output contract." },
        { test: "'%d'", message: "%d is the day-of-MONTH — 30 buckets that repeat every month. The weekday code is %w: '0'..'6' with 0 = Sunday." },
      ],
      expected: EXPECTED["l30-p3"],
      ordered: true,
    },
    {
      id: "l30-p4",
      title: "Fulfillment speed",
      brief: "Average days from order to shipment: output one column `avg_lead_days` — the rounded (2 decimals) mean of julianday(shipped_at) − julianday(created_at) over shipped orders.",
      hints: [
        "julianday converts both dates to numbers; the difference is the gap. Skip the 21 never-shipped orders with IS NOT NULL.",
        "Shape: SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_lead_days FROM orders WHERE shipped_at IS NOT NULL;",
      ],
      difficulty: "medium",
      solution:
        "SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_lead_days\nFROM orders\nWHERE shipped_at IS NOT NULL;",
      mistakes: [
        { test: "shipped_at\\s*-\\s*created_at", message: "TEXT dates can't subtract — julianday() converts each side first, then the difference is days." },
        { test: "\\bis\\s+null\\s*;", message: "IS NULL selects the never-shipped orders — their julianday is NULL and would poison the average. Filter them OUT with IS NOT NULL." },
        { test: "coalesce\\s*\\(\\s*shipped_at\\s*,", message: "COALESCE would substitute a fake ship date and silently drag the average toward zero — exclusion, not invention, is honest here." },
      ],
      expected: EXPECTED["l30-p4"],
    },
    {
      id: "l30-p5",
      title: "Revenue by month",
      brief: "Money per month: output `mon` and `rev` = ROUND(SUM(total), 2), calendar order. Fourteen rows.",
      hints: [
        "The bucket skeleton again — the aggregate swapped from COUNT to SUM.",
        "Shape: SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\nFROM orders\nGROUP BY mon\nORDER BY mon;",
      mistakes: [
        { test: "\\bcount\\s*\\(", message: "Counts answer 'how many orders' — the brief wants money: SUM(total), rounded to the cent." },
        { test: "\\bsum\\s*\\(\\s*quantity\\b", message: "That's units sold — the ledger figure is SUM(o.total), the order-level total." },
        { test: "order\\s+by\\s+rev\\s+desc", message: "Biggest-first answers 'best months' — the brief walks the calendar: ORDER BY mon." },
      ],
      expected: EXPECTED["l30-p5"],
      ordered: true,
    },
    {
      id: "l30-p6",
      title: "The golden month",
      brief: "Which month earned the most? Output `mon` and `rev` (2 decimals) — the single top row, ties broken by earlier month.",
      hints: [
        "Bucket revenue as before, then ORDER BY rev DESC, mon ASC with LIMIT 1.",
        "Shape: SELECT mon, rev FROM (<bucket query>) d ORDER BY rev DESC, mon LIMIT 1; — or the direct GROUP BY form with the same ORDER BY and LIMIT.",
      ],
      difficulty: "hard",
      solution:
        "SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\nFROM orders\nGROUP BY mon\nORDER BY rev DESC, mon\nLIMIT 1;",
      mistakes: [
        { test: "\\bmax\\s*\\(\\s*sum", message: "Nested aggregates (MAX(SUM(…))) don't parse — bucket first, then sort and take the top row." },
        { test: "limit\\s+1[^;]*\\bfrom\\b", message: "LIMIT belongs at the very END of the query, after the ORDER BY — placing it earlier truncates before the sort." },
        { test: "order\\s+by\\s+rev\\s+asc", message: "Ascending finds the WORST month (July, 1193.86) — the brief wants the biggest: DESC." },
      ],
      expected: EXPECTED["l30-p6"],
      ordered: true,
    },
    {
      id: "l30-p7",
      title: "Signup cohorts",
      brief: "Customer acquisition by month: bucket `customers.created_at` by month. Output `mon` and `n`, chronological. Nine buckets from 2023-11 through 2024-07.",
      hints: [
        "Same strftime skeleton — but FROM customers. The first buckets are 2023-11 and 2023-12.",
        "Shape: SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon ORDER BY mon;",
      ],
      difficulty: "hard",
      solution:
        "SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\nFROM customers\nGROUP BY mon\nORDER BY mon;",
      mistakes: [
        { test: "\\bfrom\\s+orders\\b", message: "Acquisition counts CUSTOMERS — the orders table would count purchases, not signups." },
        { test: "\\bsubstr\\s*\\(\\s*created_at", message: "SUBSTR slicing is lesson 29's string tool — dates deserve the date-aware slice: strftime('%Y-%m', created_at) reads the calendar, not character offsets." },
        { test: "\\bregion\\b|\\bgroup\\s+by\\s+region", message: "No regional split asked — one global acquisition line, bucketed by signup month." },
      ],
      expected: EXPECTED["l30-p7"],
      ordered: true,
    },
    {
      id: "l30-p8",
      title: "Slow boats",
      brief: "The slow shipments: orders that took **more than 3 days** from order to ship. Output `id` and `lead_days` = the CAST-to-INTEGER gap, ordered by id.",
      hints: [
        "Compute the gap per row in WHERE, guard against NULLs, and reuse the same expression (cast to INTEGER) as the output column.",
        "Shape: SELECT id, CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS lead_days FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) > <bar> ORDER BY id;",
      ],
      difficulty: "hard",
      solution:
        "SELECT id,\n  CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS lead_days\nFROM orders\nWHERE shipped_at IS NOT NULL\n  AND julianday(shipped_at) - julianday(created_at) > 3\nORDER BY id;",
      mistakes: [
        { test: ">\\s*=\\s*3", message: "Boundary — 'more than 3' excludes exactly-3-day shipments; >= would keep them." },
        { test: "^select\\b(?:(?!\\bis\\s+not\\s+null\\b).)*\\bis\\s+null\\b", message: "IS NULL keeps the never-shipped orders — julianday(NULL) is NULL and they'd vanish or poison the comparison. Filter them out with IS NOT NULL." },
        { test: "\\bround\\s*\\(", message: "No rounding — the brief wants the CAST to INTEGER for whole days (2.98-average territory stays out of the ledger)." },
      ],
      expected: EXPECTED["l30-p8"],
      ordered: true,
    },
  ],
  takeaway: "ISO-TEXT dates sort themselves; strftime slices them into buckets, julianday measures the gaps, and bucket-plus-count is the skeleton every trend report grows from.",
};
