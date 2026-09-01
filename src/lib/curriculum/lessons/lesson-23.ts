import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson23: Lesson = {
  id: "lesson-23",
  num: 23,
  title: "CASE at work: counters, pivots, custom sorts",
  blurb: "Conditional aggregation, rows into columns, and ORDER BY that obeys your rules",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "Inside aggregates, CASE stops being a label maker and becomes a **counting machine**: one pass over the table, one column per rule. This is the pattern behind every dashboard KPI and every cross-tab report.",
    },
    { kind: "diagram", figure: "s7-case-agg" },
    {
      kind: "code",
      caption: "Three counters, one scan",
      sql: `SELECT COUNT(*)  AS all_orders,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending
FROM orders;      -- 103 · 52 · 14`,
    },
    { kind: "h", text: "One pass, many counters" },
    {
      kind: "bullets",
      items: [
        "`SUM(CASE WHEN rule THEN 1 ELSE 0 END)` adds a 1 for rows matching the rule and 0 otherwise — the SUM *is* the count. Three rules in the SELECT cost **one table scan**, not three queries.",
        "`COUNT(CASE WHEN rule THEN 1 END)` also works: non-matching rows produce NULL, and **COUNT skips NULLs**. Same answer — both spellings return **52** delivered here. The `SUM + ELSE 0` form makes the 0 explicit; the `COUNT` form fails *loudly* if you forget WHEN's NULLness.",
        "Because averages are sums in disguise, `AVG(CASE WHEN rule THEN 1.0 ELSE 0 END)` computes a **share**: ×100 → **50.5%** of all orders on this store are delivered.",
      ],
    },
    { kind: "code",
      caption: "The share, per region — LATAM perfect, US struggling",
      sql: `SELECT c.region,
       ROUND(AVG(CASE WHEN o.status = 'delivered'
                      THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY delivered_pct DESC;   -- LATAM 100 · APAC 56.8 · EU 53.3 · US 26.3`,
    },
    { kind: "h", text: "Rows into columns — the pivot" },
    {
      kind: "bullets",
      items: [
        "`GROUP BY region` plus **one conditional column per status** turns 103 order rows into the classic cross-tab: 4 regions × 4 statuses, one query, no spreadsheet.",
        "Read the matrix and the business appears: EU moves the most volume (24 delivered of 45), the US ships more than it delivers (10 shipped vs 5 delivered), and LATAM's entire book is Bruno's **2** delivered orders.",
        "Column sums must reconcile: 24+21+5+2 delivered = **52**, and 45+37+19+2 total = **103**. A pivot that does not add up to the GROUP-less counts has a WHERE leak.",
      ],
    },
    { kind: "code",
      caption: "Region × status — the full matrix",
      sql: `SELECT c.region,
  SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered,
  SUM(CASE WHEN o.status='shipped'   THEN 1 ELSE 0 END) AS shipped,
  SUM(CASE WHEN o.status='pending'   THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
  COUNT(*) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY c.region;`,
    },
    { kind: "diagram", figure: "s15-pivot-build" },
    { kind: "h", text: "CASE in ORDER BY — your sort, your rules" },
    {
      kind: "bullets",
      items: [
        "Alphabetical status order is noise for an ops queue. `ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END, id` sorts by **business meaning**: the 14 pending orders surface first, cancelled sink to the bottom.",
        "The CASE is just an expression — it can mix with plain columns in the same ORDER BY (rule first, tiebreak second).",
        "In WHERE, CASE works but is rarely the cleanest tool — a boolean expression usually says it shorter. CASE in WHERE earns its keep only when the rule itself branches per row.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "`SUM(CASE …)` conditional aggregation is **fully portable** — SQLite, Postgres and MySQL all behave identically. It is the single most copied reporting pattern in SQL.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "**MySQL** shortcut: `SUM(status = 'delivered')` — booleans are 0/1 there. Clever, non-portable. **Postgres** has the elegant `COUNT(*) FILTER (WHERE status = 'delivered')` — SQLite supports `FILTER` too since 3.30; **MySQL** lacks it.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Large-scale pivots get engine-specific tooling (SQL Server `PIVOT`, Postgres `crosstab` extension) — but the CASE pivot is the core they compile down to, and the only one that runs everywhere.",
    },
    {
      kind: "tip",
      text: "When computing shares, make the 1 a 1.0: AVG over integers can floor to 0 or 1 in typed engines. `THEN 1.0 ELSE 0.0` is the habit that survives porting.",
    },
  ],
  mcqs: [
    {
      id: "l23-q1",
      prompt: "Why does `COUNT(CASE WHEN status = 'delivered' THEN 1 END)` equal `SUM(CASE WHEN … THEN 1 ELSE 0 END)`?",
      choices: [
        "COUNT treats missing ELSE as 0",
        "COUNT ignores NULLs, so non-matching rows (NULL) are skipped — the same rows SUM counts as 0",
        "Both always equal COUNT(*)",
        "They only match when every order is delivered",
      ],
      answer: 1,
      why: "Without ELSE the CASE yields NULL for non-matches; COUNT skips NULLs while SUM adds ELSE 0 for them. Both isolate the same 52 delivered orders.",
      notes: [
        { choice: 0, why: "That's the SUM spelling doing the work, not COUNT — COUNT never sees a 0; it sees NULL for every non-matching row and simply skips it." },
      ],
    },
    {
      id: "l23-q2",
      prompt: "Which region's delivered share is 26.3% — and what does that reveal?",
      choices: [
        "US — it ships far more than it delivers (10 shipped vs 5 delivered)",
        "EU — highest volume, lowest share",
        "LATAM — only two orders",
        "APAC — most cancelled orders",
      ],
      answer: 0,
      why: "US: 5 of 19 orders delivered = 26.3%, with 10 still in transit. LATAM is 100%, APAC 56.8%, EU 53.3% — the share makes the queue visible.",
      notes: [
        { choice: 1, why: "EU moves the most volume (45 orders) but sits mid-pack at 53.3% — it's the US's 26.3% (5 of 19, with 10 still in transit) that flags a stuck queue." },
      ],
    },
    {
      id: "l23-q3",
      prompt: "A region × status pivot has 4 SUM(CASE…) columns and one COUNT(*). Why must their row sums reconcile?",
      choices: [
        "They need not — pivots are independent queries",
        "Every order row lands in exactly one status bucket, so the buckets plus COUNT(*) must total the same 103",
        "SQLite requires it or the query errors",
        "Because GROUP BY region sorts the rows",
      ],
      answer: 1,
      why: "The buckets partition the rows: 52+30+14+7 = 103 and 45+37+19+2 = 103. A mismatch means a WHERE or rule leak — the cheapest self-audit in reporting.",
      notes: [
        { choice: 0, why: "The buckets aren't independent — all four SUM(CASE…)s and the COUNT(*) receive the same grouped rows, and each order lands in exactly one bucket, so the buckets must rebuild the same total." },
      ],
    },
    {
      id: "l23-q4",
      prompt: "Which engine lets you write `COUNT(*) FILTER (WHERE status = 'delivered')`?",
      choices: ["All three", "SQLite only", "MySQL only", "Postgres only"],
      answer: 3,
      why: "FILTER is Postgres sugar for conditional counting — SQLite has supported it too since 3.30 (MySQL still lacks it). The fully portable spelling remains SUM(CASE WHEN … THEN 1 ELSE 0 END).",
      notes: [
        { choice: 0, why: "MySQL is the holdout — it has no FILTER clause at all, so 'all three' overstates portability; SUM(CASE WHEN … THEN 1 ELSE 0 END) is the spelling that runs everywhere." },
      ],
    },
    {
      id: "l23-q5",
      prompt: "Why do COUNT(CASE WHEN status = 'delivered' THEN 1 END) and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) always agree?",
      choices: [
        "COUNT ignores NULLs; SUM ignores zeros — the CASE leaves exactly those",
        "they don't — COUNT is always 1 higher",
        "both round to integers",
        "COUNT converts NULL to 0 first",
      ],
      answer: 0,
      why: "Without ELSE the CASE yields NULL for non-matches, and COUNT skips NULLs; with ELSE 0 the CASE yields 0 for non-matches, and SUM adds nothing for zeros. Different mechanics, same tally — the flag design (1/0 vs 1/NULL) is what matters.",
      notes: [
        { choice: 1, why: "Both count exactly the matching rows — the difference is only in what the non-matching rows contribute: nothing (via NULL or via 0)." },
      ],
    },
    {
      id: "l23-q6",
      prompt: "Your custom sort CASE says WHEN 'deliverd' THEN 0 — one letter off. Where do those rows land?",
      choices: [
        "they error out",
        "they fall to the ELSE rank — silently sorted as if the branch didn't exist",
        "SQLite corrects the typo",
        "they appear twice",
      ],
      answer: 1,
      why: "The WHEN compares literal strings; 'deliverd' matches no real status, so every delivered order drops to the ELSE branch's rank. No error, no warning — the queue is just quietly mis-sorted. Match the WHEN values to the data exactly.",
      notes: [
        { choice: 2, why: "Nothing corrects SQL typos — the comparison is byte-for-byte, and a miss falls through to the next branch or ELSE." },
      ],
    },
    {
      id: "l23-q7",
      prompt: "The pivot groups by c.region, which arrives through the join. Is that legal?",
      choices: [
        "no — GROUP BY only accepts columns of the first table",
        "yes — any column available after the joins can be the bucket key",
        "only if you also SELECT c.id",
        "only in SQLite",
      ],
      answer: 1,
      why: "GROUP BY buckets by any expression visible at grouping time — joined columns included. The pivot is per customer-region precisely because the region rides in on the join; each of the 103 joined rows carries its region.",
      notes: [
        { choice: 2, why: "Adding c.id to the SELECT would change the grain to per-customer — the bucket key alone defines the groups." },
      ],
    },
    {
      id: "l23-q8",
      prompt: "You compute the pending share: ROUND(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) * 100 / COUNT(*), 1). SQLite answers 13.0. The true share is 13.6. Why?",
      choices: [
        "ROUND is broken in SQLite",
        "100 is an integer, so the division is integer division — 14 * 100 / 103 floors to 13 before ROUND ever runs",
        "the CASE miscounted the pending orders",
        "COUNT(*) counts NULLs",
      ],
      answer: 1,
      why: "14 × 100 / 103 evaluates left to right in integers: 1400 / 103 = 13 (floored), and ROUND(13, 1) is still 13. Write 100.0 (or multiply by 1.0) to force decimal division, and the share lands on 13.6.",
      notes: [
        { choice: 2, why: "The CASE counted the 14 pending orders correctly — the damage happens later, in the integer arithmetic." },
      ],
    },
  ],
  problems: [
    {
      id: "l23-p1",
      title: "The KPI row",
      brief: "One row, three numbers: `all_orders` (all orders), `delivered`, `pending` — using conditional SUMs, not three queries.",
      hints: [
        "Three aggregates side by side over the whole table: one COUNT(*) for the total, one SUM(CASE …) per bucket — no GROUP BY, no second query.",
        "Shape: SELECT COUNT(*) AS <alias>, SUM(CASE WHEN <cond> THEN 1 ELSE 0 END) AS <alias>, … FROM orders;",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS all_orders,\n  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n  SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending\nFROM orders;",
      mistakes: [
        { test: "\\bcase\\b(?![^;]*\\bend\\b)", message: "Each conditional SUM wraps its own CASE … END — an unterminated CASE breaks the whole SELECT list." },
        { test: "^(?![^;]*\\(\\s*select\\b)[^;]*\\bwhere\\b[^;]*\\bstatus\\b", message: "A WHERE clause shrinks the table before any counting — all_orders would no longer be 103. Keep every row and let each SUM(CASE WHEN …) pick its own bucket." },
        { test: "\\bgroup\\s+by\\b", message: "GROUP BY splits the KPI row into one row per group — the brief wants a single row, so the bucketing lives inside the SUM(CASE …)s, not in a GROUP BY." },
      ],
      expected: EXPECTED["l23-p1"],
    },
    {
      id: "l23-p2",
      title: "The region × status matrix",
      brief: "Build the full pivot: for each `region`, columns `delivered`, `shipped`, `pending`, `cancelled`, `total`. Ordered by `region`.",
      hints: [
        "region lives on customers, so join first; then one SUM(CASE WHEN o.status = … THEN 1 ELSE 0 END) column per status, with COUNT(*) as the row total.",
        "Shape: SELECT c.region, SUM(CASE WHEN o.status = '<status>' THEN 1 ELSE 0 END) AS <alias>, …, COUNT(*) AS total FROM orders o JOIN customers c ON <join> GROUP BY c.region ORDER BY c.region;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.region,\n  SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered,\n  SUM(CASE WHEN o.status='shipped'   THEN 1 ELSE 0 END) AS shipped,\n  SUM(CASE WHEN o.status='pending'   THEN 1 ELSE 0 END) AS pending,\n  SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled,\n  COUNT(*) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY c.region;",
      mistakes: [
        { test: "^(?=[^;]*\\bregion\\b)(?![^;]*\\bjoin\\b)", message: "region lives on customers, not orders — join customers (ON c.id = o.customer_id) before you can group by it." },
        { test: "^(?=[^;]*\\bcount\\s*\\()(?![^;]*\\bgroup by\\b)", message: "COUNT(*) without GROUP BY collapses everything into one row — the matrix needs one row per region: GROUP BY c.region." },
        { test: "\\bwhere\\b[^;]*\\bstatus\\b", message: "Filtering on status leaks rows from the pivot — every one of the 103 orders must land in exactly one bucket. Put the condition inside each SUM(CASE WHEN …), not in a WHERE." },
      ],
      expected: EXPECTED["l23-p2"],
      ordered: true,
    },
    {
      id: "l23-p3",
      title: "Delivered share by region",
      brief: "Per region: `region`, `delivered_pct` — the delivered share of that region's orders, rounded to 1 decimal, ×100. Highest first, ties by region.",
      hints: [
        "A share is an average in disguise: AVG(CASE WHEN … THEN 1.0 ELSE 0 END) is the delivered fraction — scale it to a percentage and round.",
        "Shape: SELECT c.region, ROUND(AVG(CASE WHEN <cond> THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct FROM orders o JOIN customers c ON <join> GROUP BY c.region ORDER BY delivered_pct DESC, c.region;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.region,\n  ROUND(AVG(CASE WHEN o.status = 'delivered'\n                 THEN 1.0 ELSE 0 END) * 100, 1) AS delivered_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY delivered_pct DESC, c.region;",
      mistakes: [
        { test: "^(?=[^;]*\\bregion\\b)(?![^;]*\\bjoin\\b)", message: "region lives on customers — join orders to customers first (ON c.id = o.customer_id), then group by c.region." },
        { test: "^(?=[^;]*\\bavg\\s*\\()(?![^;]*\\bgroup by\\b)", message: "AVG without GROUP BY averages all 103 orders into one row — the share is per region: GROUP BY c.region." },
        { test: "^(?=[^;]*\\bavg\\s*\\()(?![^;]*100\\b)", message: "AVG(CASE …) yields the fraction (about 0.53 for EU) — the brief wants a percentage: multiply by 100 before ROUND(…, 1)." },
      ],
      expected: EXPECTED["l23-p3"],
      ordered: true,
    },
    {
      id: "l23-p4",
      title: "The ops queue order",
      brief: "All orders sorted by business meaning: pending first, then shipped, then delivered, cancelled last; ties by `id` ascending. Output `id`, `status`, `total` — first 8 rows only.",
      hints: [
        "ORDER BY takes any expression — hand it a CASE that ranks each status by business meaning, then let id break the ties.",
        "Shape: SELECT id, status, total FROM orders ORDER BY CASE status WHEN '<status>' THEN <rank> … ELSE <rank> END, id LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT id, status, total FROM orders\nORDER BY CASE status\n            WHEN 'pending'  THEN 0\n            WHEN 'shipped'  THEN 1\n            WHEN 'delivered' THEN 2\n            ELSE 3\n          END, id\nLIMIT 8;",
      mistakes: [
        { test: "\\border\\s+by\\s+status\\b", message: "ORDER BY status sorts alphabetically — delivered would surface first, exactly backwards for an ops queue. Rank the statuses with a CASE expression instead." },
        { test: "\\bcase\\b(?![^;]*\\bend\\b)", message: "The ranking CASE must close with END before the tiebreaker ', id' — an unterminated CASE is a syntax error." },
        { test: "\\bend\\b\\s*(;|limit\\b)", message: "The CASE ranks the statuses but leaves ties unordered — append ', id' after the END so equal-rank rows order by id ascending." },
      ],
      expected: EXPECTED["l23-p4"],
      ordered: true,
    },
    {
      id: "l23-p5",
      title: "Berlin pivot",
      brief: "One city under the microscope: our Berlin customers' 24 orders, pivoted into ONE row — `delivered`, `shipped`, `pending`, `cancelled`, `total`.",
      hints: [
        "The KPI-row shape with a scope: join customers for the city, filter WHERE c.city = 'Berlin', and let the conditional SUMs build the columns — no GROUP BY, one row out.",
        "Shape: SELECT SUM(CASE WHEN o.status = '<s1>' THEN 1 ELSE 0 END) AS delivered, …, COUNT(*) AS total FROM orders o JOIN customers c ON <join> WHERE c.city = '<city>';",
      ],
      difficulty: "medium",
      solution:
        "SELECT\n  SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n  SUM(CASE WHEN o.status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,\n  SUM(CASE WHEN o.status = 'pending'   THEN 1 ELSE 0 END) AS pending,\n  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n  COUNT(*) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.city = 'Berlin';",
      mistakes: [
        { test: "city\\s*=\\s*'(?!berlin')[^']*'", message: "The lens is Berlin — WHERE c.city = 'Berlin'." },
        { test: "\\bgroup\\s+by\\b", message: "One city, one row — the pivot's buckets live inside the SUM(CASE …)s; GROUP BY would split the single Berlin row apart." },
        { test: "^(?![^;]*\\bjoin\\b)", message: "The city lives on customers — join orders to customers (ON c.id = o.customer_id) before filtering on it." },
      ],
      expected: EXPECTED["l23-p5"],
    },
    {
      id: "l23-p6",
      title: "EU status row",
      brief: "Same microscope, wider lens: the EU customers' orders in one row — `delivered`, `shipped`, `pending`, `cancelled`, `total`.",
      hints: [
        "Identical pivot, different scope: the WHERE swaps city for region — the conditional SUMs don't change at all.",
        "Shape: SELECT SUM(CASE WHEN o.status = '<s>' THEN 1 ELSE 0 END) AS delivered, …, COUNT(*) AS total FROM orders o JOIN customers c ON <join> WHERE c.region = '<region>';",
      ],
      difficulty: "medium",
      solution:
        "SELECT\n  SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n  SUM(CASE WHEN o.status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,\n  SUM(CASE WHEN o.status = 'pending'   THEN 1 ELSE 0 END) AS pending,\n  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n  COUNT(*) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.region = 'EU';",
      mistakes: [
        { test: "region\\s*=\\s*'(?!eu')[^']*'", message: "The lens is the EU — WHERE c.region = 'EU'." },
        { test: "city\\s*=", message: "The EU is a region, not a city — filter c.region = 'EU'." },
        { test: "\\bgroup\\s+by\\b", message: "One region, one row — the buckets live inside the SUM(CASE …)s, not in a GROUP BY." },
      ],
      expected: EXPECTED["l23-p6"],
    },
    {
      id: "l23-p7",
      title: "Pending pressure points",
      brief: "Which regions carry more OPEN work than LOST work? Per region: `region`, `pending`, `cancelled` — keeping only regions where pending outweighs cancelled. Output ordered by `region`.",
      hints: [
        "Build the two counting columns with conditional SUMs, then compare them per bucket — the comparison of aggregates is HAVING's job.",
        "Shape: SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders o JOIN customers c ON <join> GROUP BY c.region HAVING SUM(CASE … pending …) > SUM(CASE … cancelled …) ORDER BY c.region;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.region,\n  SUM(CASE WHEN o.status = 'pending'   THEN 1 ELSE 0 END) AS pending,\n  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) >\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\nORDER BY c.region;",
      mistakes: [
        { test: "\\bwhere\\b[^;]*\\bstatus\\b", message: "The comparison happens per GROUP, not per row — a WHERE would delete orders before they reach their buckets. Compare the two conditional SUMs in HAVING." },
        { test: "having[^;]*>\\s*[0-9]", message: "The bar is relative — pending must EXCEED cancelled in the same region — compare the two conditional SUMs, not a fixed number." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The pressure points come out in region order — append ORDER BY c.region." },
      ],
      expected: EXPECTED["l23-p7"],
      ordered: true,
    },
    {
      id: "l23-p8",
      title: "Big-order leaders",
      brief: "Who keeps landing the big baskets? Per customer: `name`, `big` (orders with total > 500, via conditional SUM), `n` (all their orders) — the five biggest `big` counts first, ties by name.",
      hints: [
        "Two aggregates per bucket: the conditional SUM counts the big ones, COUNT(*) counts them all — then rank by the conditional one.",
        "Shape: SELECT c.name, SUM(CASE WHEN o.total > <bar> THEN 1 ELSE 0 END) AS big, COUNT(*) AS n FROM orders o JOIN customers c ON <join> GROUP BY c.id ORDER BY big DESC, c.name LIMIT <n>;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name,\n  SUM(CASE WHEN o.total > 500 THEN 1 ELSE 0 END) AS big,\n  COUNT(*) AS n\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY big DESC, c.name\nLIMIT 5;",
      mistakes: [
        { test: "total\\s*>=\\s*500", message: "The bar is strict — orders OVER 500: o.total > 500." },
        { test: "^(?![^;]*\\bjoin\\b)", message: "The name lives on customers — join orders to customers (ON c.id = o.customer_id) before grouping by the buyer." },
        { test: "^select\\b(?:(?!\\blimit\\b).)*$", message: "The brief wants the top five — append ORDER BY big DESC, c.name LIMIT 5." },
      ],
      expected: EXPECTED["l23-p8"],
      ordered: true,
    },
  ],
  takeaway: "SUM(CASE WHEN rule THEN 1 ELSE 0 END) turns one table scan into a counting machine — KPI rows, per-group shares, full pivots — and a CASE in ORDER BY sorts by business meaning instead of the alphabet.",
};
