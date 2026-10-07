// Deep-dives — the SQL 50+ expansion: dates & times (3 problems).
// Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_DATES: LcSqlDive[] = [
  {
    slug: "monthly-transactions-i",
    statement:
      "Transactions records each payment with a country, a state ('approved' or 'declined'), an amount, and a full timestamp. For each country and month, report the total transaction count, the approved count, the total amount, and the approved amount — with month formatted as 'YYYY-MM'.",
    examples: [
      {
        input: "2019-01: US 2 approved of 3 (amounts 1000, 1200, 2000 approved 1000+1200=2200? …) — see seeded data",
        output: "one row per (month, country) with the four metrics",
        explanation: "Approved metrics track only state='approved' rows; the totals track everything. Both live in the same GROUP BY pass.",
      },
    ],
    constraints: ["trans_date is 'YYYY-MM-DD' text", "state is 'approved' or 'declined'", "order by month, then country"],
    breakdown: [
      "Four metrics from one pass: two unconditional (COUNT(*), SUM(amount)) and two conditional (approved only). Conditional aggregation — SUM(CASE WHEN state='approved' THEN … END) — computes a subset metric inside the same GROUP BY as the total. This is the pattern behind every funnel, dashboard and reconciliation report.",
      "The month is derived: SUBSTR(trans_date, 1, 7) slices 'YYYY-MM-DD' to 'YYYY-MM'. ISO dates slice cleanly by character position — one more payoff of canonical date storage. Group by the derived month, not the raw day.",
      "COUNT(*) vs SUM(CASE…): the conditional count is a sum of 0/1 flags, which is why CASE must return 1 or 0 explicitly (or rely on ELSE NULL with SUM ignoring NULLs — but explicit beats clever under pressure).",
    ],
    edges: [
      "Group by (month, country) — derived month first, country second.",
      "Approved AMOUNT ignores declined rows; approved COUNT is 1/0 flags, not COUNT(*) of a filtered join.",
      "Missing approved rows must show 0, not NULL — CASE with ELSE 0 guarantees it.",
    ],
    ladder: [
      { title: "Brute force — two passes", body: "Query totals per month/country, then query approved-only, then merge in code. Two scans and a merge — the classic thing conditional aggregation replaces." },
      { title: "The pattern — CASE inside SUM", body: "One GROUP BY, four aggregates, two of them CASE-gated. Single scan, single bucket per (month, country)." },
      { title: "The optimal idea — flags as 0/1", body: "SUM(CASE WHEN cond THEN 1 ELSE 0 END) counts; SUM(CASE WHEN cond THEN amount ELSE 0 END) sums. O(n), and the SELECT reads like the report's column headers." },
    ],
    approach: "Conditional aggregation with SUBSTR month bucketing",
    schema: {
      ddl: `CREATE TABLE Transactions (
  id         INTEGER PRIMARY KEY,
  country    TEXT NOT NULL,
  state      TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  trans_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Transactions (id, country, state, amount, trans_date) VALUES
  (1,'US','approved',1000,'2019-01-21'),
  (2,'US','declined',2000,'2019-01-30'),
  (3,'US','approved',1200,'2019-02-05'),
  (4,'DE','declined',2000,'2019-01-25'),
  (5,'DE','approved',2000,'2019-02-14'),
  (6,'UK','approved',1500,'2019-02-17'),
  (7,'US','declined',700,'2019-02-27');`,
      tables: [{ name: "Transactions", note: "7 payments across 2 months, 3 countries" }],
    },
    code: `SELECT
    SUBSTR(trans_date, 1, 7) AS month,
    country,
    COUNT(*)                                          AS trans_count,
    SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,
    SUM(amount)                                         AS trans_total_amount,
    SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount
FROM Transactions
GROUP BY month, country
ORDER BY month, country;`,
    walkthrough: [
      "SUBSTR trims each date to its month: 2019-01 and 2019-02. Groups form per (month, country) — six of them from the seed.",
      "2019-01 / US: total 2 transactions, amounts 1000+2000=3000; the approved flag counts row 1 only → 1, approved amount 1000.",
      "2019-01 / DE: one declined row — trans_count 1, trans_total 2000, approved metrics 0 and 0 (the ELSE 0 branches fire).",
      "ORDER BY month, country prints the ledger chronologically within each month.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(m × c) — one row per (month, country)",
    followUps: [
      "Add a chargeback state — the CASE list grows, the shape doesn't.",
      "Pivot countries into columns per month (the sibling problem 1179 does exactly this with department months).",
    ],
    related: ["reformat-department-table", "reported-posts"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "fix-product-name-format",
    statement:
      "Sales logs purchases, but operators type product names inconsistently — mixed case, stray spaces ('  LCPhone', 'lcPhone ', 'Lcphone' are one product). Normalize each name to capitalized form (first letter upper, rest lower, trimmed), bucket each sale into its 'YYYY-MM' month, and report total revenue (SUM of quantity × price, rounded to 2 decimals) per product per month.",
    examples: [
      {
        input: "'  LCPhone' ×2 @14.00 and 'lcPhone ' ×3 @14.00 in 2020-01 → one Lcphone / 2020-01 row",
        output: "Lcphone 2020-01 70.0",
        explanation: "Both spelling variants normalize to 'Lcphone' and merge into one monthly bucket: (2+3) × 14.00 = 70.00.",
      },
    ],
    constraints: ["price is a decimal; round the monthly total to 2 dp", "the same product's variants must merge into ONE group", "order by product name, then month"],
    breakdown: [
      "Group keys must be computed BEFORE grouping: normalize the name in an inner SELECT, then GROUP BY the clean column. Grouping by the raw column would keep ' LCPhone' and 'lcPhone ' as separate buckets — the data-cleaning bug this problem exists to teach.",
      "SQLite has no INITCAP, so capitalization is built by hand: UPPER(first letter) || LOWER(rest). String slicing (SUBSTR) + concatenation (||) compose into any formatting rule the report needs — and the TRIM must happen first, or the 'first letter' is a space.",
      "The revenue metric is itself derived twice: per-row (quantity × price), then SUM per bucket, then ROUND to the reporting precision. Rounding LAST — after aggregation — is the rule; rounding per row then summing accumulates error.",
    ],
    edges: [
      "TRIM before slicing — leading spaces would become the 'first letter'.",
      "Group by the NORMALIZED name; raw names must merge.",
      "ROUND after SUM, to 2 dp — never round the per-row products.",
    ],
    ladder: [
      { title: "Brute force — clean outside SQL", body: "Export rows, normalize names in application code, then aggregate. Drags the whole table over the wire and lets every downstream tool see dirty names." },
      { title: "The pattern — clean in a subquery, group after", body: "Inner SELECT computes product_name (capitalized, trimmed) and sale_date ('YYYY-MM'); outer SELECT groups those clean columns and sums revenue." },
      { title: "The optimal idea — normalize once, aggregate once", body: "O(n): one cleaning pass feeding one grouped SUM. The subquery boundary is the contract: everything below is dirty, everything above is report-ready." },
    ],
    approach: "Normalize in a subquery, then GROUP BY the clean columns",
    schema: {
      ddl: `CREATE TABLE Sales (
  sale_id      INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  sale_date    TEXT NOT NULL,
  quantity     INTEGER NOT NULL,
  price        REAL NOT NULL
);`,
      seed: `INSERT INTO Sales (sale_id, product_name, sale_date, quantity, price) VALUES
  (1,'  LCPhone','2020-01-08',2,14.00),
  (2,'lcPhone ','2020-01-15',3,14.00),
  (3,'Lcphone','2020-02-01',1,14.50),
  (4,' Lckey','2020-02-14',2,12.50),
  (5,'LCKEY','2020-02-25',4,12.50),
  (6,'lc key','2020-02-28',1,12.50);`,
      tables: [{ name: "Sales", note: "6 sales — note the messy, inconsistent product names" }],
    },
    code: `SELECT
    product_name,
    sale_date,
    ROUND(SUM(quantity * price), 2) AS total_amount
FROM (
    SELECT
        UPPER(SUBSTR(TRIM(product_name), 1, 1)) ||
        LOWER(SUBSTR(TRIM(product_name), 2))    AS product_name,  -- Capitalized
        SUBSTR(sale_date, 1, 7)                 AS sale_date,     -- 'YYYY-MM'
        quantity,
        price
    FROM Sales
) cleaned
GROUP BY product_name, sale_date
ORDER BY product_name, sale_date;`,
    walkthrough: [
      "The inner pass TRIMs each name, then rebuilds it as UPPER(first) + LOWER(rest): '  LCPhone' → 'Lcphone', 'LCKEY' → 'Lckey'. Dates slice to 'YYYY-MM'.",
      "The clean rows group into four buckets: Lcphone/2020-01 (2×14 + 3×14), Lcphone/2020-02 (1×14.50), Lckey/2020-02 (2×12.5 + 4×12.5), and Lc key/2020-02.",
      "Wait — 'lc key' normalizes to 'Lc key', a DIFFERENT product from 'Lckey': a space inside a name is content, not noise. Its 12.50 lands in its own bucket, which is exactly why only TRIM (edges) is applied, never REPLACE (interior).",
      "SUM computes 70.0, 14.5, 75.0 and 12.5; ROUND(…, 2) formats each. ORDER BY name then month.",
    ],
    time: "O(n) — one cleaning pass + one aggregate",
    space: "O(p × m) — one row per product per month",
    followUps: [
      "Months with zero sales of a product won't appear — how would a calendar table fill the gaps?",
      "Standardize further: collapse interior whitespace with REPLACE(name, ' ', '') — when is that safe, when does it merge genuinely different products?",
    ],
    related: ["monthly-transactions-i", "invalid-tweets"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "the-latest-login-in-2020",
    statement:
      "Logins records every sign-in with a timestamp. For each user, report their most recent login that happened in 2020 — and only users who actually logged in during 2020 should appear.",
    examples: [
      {
        input: "user 1: '2020-11-12 13:15:00' and '2019-12-31 23:59:59' · user 2: two 2020 logins · user 3: only a 2019 login",
        output: "1 · 2020-11-12 13:15:00 / 2 · 2020-12-20 07:30:00",
        explanation: "User 1's 2019 login is filtered out before the MAX; user 3 has no 2020 login at all and is excluded entirely.",
      },
    ],
    constraints: ["time_stamp is 'YYYY-MM-DD HH:MM:SS' text", "users with no 2020 login are excluded", "output columns: user_id, last_stamp, ordered by user_id"],
    breakdown: [
      "Two operations compose: filter the year, then take MAX per user. The ORDER matters — filtering to 2020 rows BEFORE the aggregate is what excludes user 3 automatically, with no HAVING gymnastics. Row-level conditions go in WHERE; they're cheaper and simpler than group-level ones.",
      "The year boundary is a half-open range: time_stamp >= '2020-01-01' AND time_stamp < '2021-01-01'. String comparison works because the format is fixed-width ISO. Comparing to '2020-12-31' would silently drop everything on the last day after 00:00:00 — the classic inclusive-date bug.",
      "MAX on 'YYYY-MM-DD HH:MM:SS' text is calendar-ordered lexicographically — fixed width is what makes text timestamps sortable. Truncate one digit ('YYYY-M-D') and '2020-9-1' > '2020-10-1' becomes a lie.",
    ],
    edges: [
      "Half-open range [< next year] captures every second of 2020.",
      "Users without a 2020 login vanish via WHERE — they should not appear with NULL.",
      "MAX over the filtered rows is the latest 2020 stamp, not the latest ever.",
    ],
    ladder: [
      { title: "Brute force — extract and compare", body: "Pull all logins, parse years in code, track max per user. A filtered hash aggregate re-implemented by hand." },
      { title: "The pattern — WHERE the range, MAX per group", body: "WHERE inside 2020, GROUP BY user_id, MAX(time_stamp). Filter-then-aggregate, in that order." },
      { title: "The optimal idea — half-open text range", body: "Two comparisons on ISO text, one scan, one hash aggregate. O(n), and user 3's exclusion falls out for free." },
    ],
    approach: "Half-open 2020 range filter + MAX per user",
    schema: {
      ddl: `CREATE TABLE Logins (
  user_id    INTEGER NOT NULL,
  time_stamp TEXT NOT NULL
);`,
      seed: `INSERT INTO Logins (user_id, time_stamp) VALUES
  (1,'2020-11-12 13:15:00'),(2,'2020-12-20 07:30:00'),(3,'2019-05-09 22:00:00'),
  (1,'2019-12-31 23:59:59'),(2,'2020-06-01 12:00:00'),(4,'2021-01-01 00:00:00');`,
      tables: [{ name: "Logins", note: "6 sign-ins; user 3 has no 2020 login, user 4 only 2021" }],
    },
    code: `SELECT
    user_id,
    MAX(time_stamp) AS last_stamp
FROM Logins
WHERE time_stamp >= '2020-01-01'
  AND time_stamp <  '2021-01-01'      -- half-open: all of 2020, nothing else
GROUP BY user_id
ORDER BY user_id;`,
    walkthrough: [
      "WHERE keeps only rows inside [2020-01-01, 2021-01-01): user 1's 2020 stamp, both of user 2's, and nothing else — the 2019 pair and the 2021 boundary row drop out.",
      "User 3 and user 4 have no surviving rows, so no bucket forms for them — they're excluded without a HAVING or an explicit check.",
      "MAX picks the later stamp per surviving user: 1 → 2020-11-12 13:15:00, 2 → 2020-12-20 07:30:00.",
    ],
    time: "O(n) — one filtered scan + hash aggregate",
    space: "O(u) — one row per 2020-active user",
    followUps: [
      "Also show how many 2020 logins each user made — add COUNT(*) beside the MAX.",
      "Users whose LAST login ever was in 2020 (they churned): compare each user's global MAX against the 2020 MAX.",
    ],
    related: ["game-play-analysis-i", "monthly-transactions-i"],
    order: "exact",
    xp: 10,
  },
];
