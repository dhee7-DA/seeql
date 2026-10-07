// Deep-dives — the SQL 50+ expansion: joins & relationships (4 problems).
// SQLite dialect, one statement each, engine-verified by
// scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_MORE_JOINS: LcSqlDive[] = [
  {
    slug: "npv-queries",
    statement:
      "A finance team keeps a lookup table NPV of each (id, year) pair's net present value, and a separate Queries list of (id, year) pairs the analysts asked about. For every queried pair, show the NPV — or 0 when the lookup has no row for that pair.",
    examples: [
      {
        input: "NPV: (1,2018,100),(1,2019,100),(2,2018,200),(2,2019,1000),(3,2019,600) · Queries: (1,2018),(1,2019),(1,2020),(2,2018),(2,2019),(3,2019),(4,2019)",
        output: "1 2018 100 · 1 2019 100 · 1 2020 0 · 2 2018 200 · 2 2019 1000 · 3 2019 600 · 4 2019 0",
        explanation: "The pairs (1,2020) and (4,2019) were queried but never valued — they still appear, with npv 0.",
      },
    ],
    constraints: ["NPV has at most one row per (id, year)", "Queries may contain pairs absent from NPV", "both tables may repeat the same id across different years"],
    breakdown: [
      "The shape of this problem is a left join wearing a costume: Queries is the driving table (every question must appear in the answer), NPV is an optional lookup. Whenever 'every row of A, plus matching data from B if it exists' appears, LEFT JOIN is the tool.",
      "The composite key matters: a pair matches only when BOTH id and year agree. Joining on id alone would multiply rows (id 1 has two NPV years) and attach the wrong values — the classic fan-out bug that composite keys prevent.",
      "Missing matches surface as NULL, but the spec wants 0 — a business convention, not a data fact. That is COALESCE/IFNULL's whole job: convert 'no data' into the neutral value the report promises.",
    ],
    edges: [
      "Join on BOTH id and year — id alone fans out (id 1 has two years).",
      "NULL means 'no valuation'; the grader wants literal 0.",
      "Every queried pair appears exactly once, even pairs with no NPV row.",
    ],
    ladder: [
      { title: "Brute force — probe per row", body: "For each query row, run a scalar subquery SELECT npv FROM NPV WHERE id=… AND year=… and COALESCE it to 0. Correct, but it re-scans NPV once per query row." },
      { title: "The pattern — optional lookup = left join", body: "Queries LEFT JOIN NPV on the full composite key keeps every query row and attaches npv where a valuation exists, in a single pass." },
      { title: "The optimal idea — LEFT JOIN + IFNULL", body: "Wrap the joined column in IFNULL(npv, 0). Hash join on (id, year), one scan per table — nothing better exists." },
    ],
    approach: "LEFT JOIN on the composite key + IFNULL default",
    schema: {
      ddl: `CREATE TABLE NPV (
  id   INTEGER NOT NULL,
  year INTEGER NOT NULL,
  npv  INTEGER NOT NULL,
  PRIMARY KEY (id, year)
);
CREATE TABLE Queries (
  id   INTEGER NOT NULL,
  year INTEGER NOT NULL,
  PRIMARY KEY (id, year)
);`,
      seed: `INSERT INTO NPV (id, year, npv) VALUES (1,2018,100),(1,2019,100),(2,2018,200),(2,2019,1000),(3,2019,600);
INSERT INTO Queries (id, year) VALUES (1,2018),(1,2019),(1,2020),(2,2018),(2,2019),(3,2019),(4,2019);`,
      tables: [
        { name: "NPV", note: "valuations keyed by (id, year) — the optional side" },
        { name: "Queries", note: "every pair that must appear in the output" },
      ],
    },
    code: `SELECT
    q.id,
    q.year,
    IFNULL(n.npv, 0) AS npv   -- unvalued pairs report 0, not NULL
FROM Queries q
LEFT JOIN NPV n ON n.id = q.id AND n.year = q.year
ORDER BY q.id, q.year;`,
    walkthrough: [
      "Queries drives the join: all 7 asked pairs survive, each exactly once, because (id, year) is Queries' primary key.",
      "The composite condition n.id = q.id AND n.year = q.year matches at most one NPV row — the PK forbids duplicates — so no fan-out is possible.",
      "(1,2020) and (4,2019) match nothing: LEFT JOIN synthesizes NULL, and IFNULL turns that NULL into the 0 the report promises.",
      "ORDER BY id, year prints the valuation sheet in reading order; the grader accepts any order but the sort is free.",
    ],
    time: "O(q + n) — one hash join over both tables",
    space: "O(q) — the output",
    followUps: [
      "Return the queried pairs that have no valuation — LEFT JOIN + WHERE n.id IS NULL, the anti-join shape again.",
      "Suppose NPV could hold multiple rows per (id, year): how would you dedupe or aggregate before joining?",
    ],
    related: ["replace-employee-id-with-unique-identifier", "bank-account-summary-ii"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "bank-account-summary-ii",
    statement:
      "Users holds one row per account holder and Transactions logs every movement as a signed amount (credits positive, debits negative) tied to an account. Report the name and total balance of every user whose balance exceeds 10000.",
    examples: [
      {
        input: "Users: (1,'Alicia'),(2,'Boris'),(3,'Chandra') · Transactions: Alicia +5000,+6000 · Boris +9000,-1500 · Chandra +1000,+200",
        output: "Alicia 11000",
        explanation: "Alicia sums to 11000 (> 10000). Boris lands at 7500 and Chandra at 1200 — both fall short.",
      },
    ],
    constraints: ["amount can be negative (debits)", "a user with no transactions has no balance row here — decide what that means", "output columns: name, balance"],
    breakdown: [
      "A 'balance' is not stored anywhere — it only exists after aggregation. SUM(amount) grouped by account turns a transaction log into a number per person; that computed value is what HAVING filters, because WHERE runs before aggregation exists and cannot see it.",
      "The join direction is inner by design: the threshold report asks about people whose balance is KNOWN, and a user with no transactions has none. (If the spec wanted zero-balance users too, the join would flip to LEFT and COALESCE the sum.)",
      "Group by the identity (account), carry the label (name) along. Grouping by name alone would merge two customers who happen to share a name — grouping keys must be unique identifiers, never display labels.",
    ],
    edges: [
      "Negative amounts must subtract — SUM handles it, but only if you never pre-filtered them out.",
      "Filter the AGGREGATE with HAVING, not WHERE — WHERE > 10000 on a single transaction is a different (wrong) question.",
      "Two users with the same name must stay separate — group by account.",
    ],
    ladder: [
      { title: "Brute force — sum per account in code", body: "Join, pull every transaction, sum per account in application code, then filter. Works, but ships all rows over the wire to do relational work by hand." },
      { title: "The pattern — aggregate then filter", body: "GROUP BY account with SUM, then HAVING SUM(amount) > 10000. WHERE filters rows before grouping; HAVING filters groups after." },
      { title: "The optimal idea — JOIN + GROUP BY + HAVING", body: "One pass: hash join users to transactions, aggregate, threshold. The database does the reduction and returns a handful of rows." },
    ],
    approach: "JOIN + GROUP BY + HAVING on the aggregate",
    schema: {
      ddl: `CREATE TABLE Users (
  account INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);
CREATE TABLE Transactions (
  trans_id   INTEGER PRIMARY KEY,
  account    INTEGER NOT NULL REFERENCES Users(account),
  amount     INTEGER NOT NULL,
  trans_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (account, name) VALUES (1,'Alicia'),(2,'Boris'),(3,'Chandra');
INSERT INTO Transactions (trans_id, account, amount, trans_date) VALUES
  (7,1,5000,'2021-01-04'),(8,1,6000,'2021-02-11'),
  (9,2,9000,'2021-01-19'),(10,2,-1500,'2021-03-01'),
  (11,3,1000,'2021-01-27'),(12,3,200,'2021-02-14');`,
      tables: [
        { name: "Users", note: "3 accounts — the identity side" },
        { name: "Transactions", note: "signed amounts; balance = SUM(amount)" },
      ],
    },
    code: `SELECT
    u.name,
    SUM(t.amount) AS balance
FROM Users u
JOIN Transactions t ON t.account = u.account
GROUP BY u.account, u.name
HAVING SUM(t.amount) > 10000;`,
    walkthrough: [
      "JOIN attaches each transaction to its owner; all 6 movements survive because every account has at least one.",
      "GROUP BY account collapses the log into one row per person: Alicia 11000, Boris 7500, Chandra 1200. Carrying name in GROUP BY keeps it selectable without breaking the grouping.",
      "HAVING SUM(amount) > 10000 runs after the sums exist and keeps only Alicia — this is the row-level WHERE's big brother.",
      "The output is just name and balance; the account id was only ever the grouping key.",
    ],
    time: "O(t) — one join + one aggregation pass",
    space: "O(u) — one row per account before HAVING",
    followUps: [
      "Include users with no transactions as balance 0 — flip to LEFT JOIN and wrap the SUM in COALESCE.",
      "Extend the report to a monthly statement: group by (account, month) with SUBSTR on the date.",
    ],
    related: ["number-of-rich-customers", "monthly-transactions-i"],
    order: "any",
    xp: 10,
  },
  {
    slug: "number-of-calls-between-two-persons",
    statement:
      "Calls logs phone traffic as (from_id, to_id, duration) — and a call from A to B is the same relationship as a call from B to A. For each unordered pair of people, report the number of calls between them and the total time, treating both directions as one pair.",
    examples: [
      {
        input: "Calls: (1,2,60),(2,1,45),(1,3,100),(3,1,150),(2,4,80),(4,2,80),(1,2,30)",
        output: "1 2 · 3 calls · 135 · / 1 3 · 2 calls · 250 · / 2 4 · 2 calls · 160",
        explanation: "(1,2) and (2,1) are the same pair: calls 60+45+30 and durations sum to 135. Direction never creates a second row.",
      },
    ],
    constraints: ["from_id ≠ to_id in every row", "the pair {A,B} is unordered — one output row per pair", "output columns: person1, person2, call_count, total_duration"],
    breakdown: [
      "The entire problem is one normalization move: rewrite each row's endpoints as (smaller, larger). Then 1→2 and 2→1 both become (1,2), and a plain GROUP BY counts what direction used to split apart. Canonicalization before grouping — the same trick normalizes edges in graphs and URLs in analytics.",
      "SQLite's scalar min(a, b) / max(a, b) take two arguments and return the smaller/larger — a two-column comparator, not the aggregate. This is the moment to learn they exist; writing two CASE branches for the same job is noise.",
      "Why MIN and MAX are safe as pair-identities: they're deterministic and symmetric, so both directions of a call always collapse to the same key. Any formula with those two properties works; these are simply the cheapest.",
    ],
    edges: [
      "Direction must NOT split a pair — (1,2) and (2,1) are one row.",
      "Aggregate COUNT/SUM run AFTER canonicalization, not before.",
      "SQLite's scalar min/max (2 args) ≠ the aggregate MIN/MAX over a column.",
    ],
    ladder: [
      { title: "Brute force — count both directions", body: "GROUP BY from_id, to_id, then manually merge (a,b) with (b,a) rows in application code. Doubles the grouping work and pushes the hard part out of the database." },
      { title: "The pattern — canonicalize the pair", body: "Project each row to (LEAST(from,to), GREATEST(from,to)) — in SQLite, MIN(x,y)/MAX(x,y) — then group by that pair. Direction disappears before any counting starts." },
      { title: "The optimal idea — canonical keys + GROUP BY", body: "One scan: canonicalize, group, aggregate. O(n) with no joins at all — the whole problem lives in one table." },
    ],
    approach: "Canonicalize the unordered pair with scalar MIN/MAX, then group",
    schema: {
      ddl: `CREATE TABLE Calls (
  from_id  INTEGER NOT NULL,
  to_id    INTEGER NOT NULL,
  duration INTEGER NOT NULL
);`,
      seed: `INSERT INTO Calls (from_id, to_id, duration) VALUES
  (1,2,60),(2,1,45),(1,3,100),(3,1,150),(2,4,80),(4,2,80),(1,2,30);`,
      tables: [{ name: "Calls", note: "7 directed rows — 3 unordered pairs hiding inside" }],
    },
    code: `SELECT
    MIN(from_id, to_id) AS person1,   -- scalar min: smaller endpoint
    MAX(from_id, to_id) AS person2,   -- scalar max: larger endpoint
    COUNT(*)       AS call_count,
    SUM(duration)  AS total_duration
FROM Calls
GROUP BY person1, person2
ORDER BY person1, person2;`,
    walkthrough: [
      "The SELECT projects each row to its canonical pair: (1,2) stays (1,2); (2,1) also becomes (1,2). Seven directed rows are now three keys.",
      "GROUP BY person1, person2 collapses the canonical rows: (1,2) collects calls 60, 45, 30; (1,3) collects 100, 150; (2,4) collects 80, 80.",
      "COUNT and SUM read off the answer: 3/135, 2/250, 2/160 — SQLite allows grouping by the SELECT aliases since they were computed in the same statement.",
      "ORDER BY person1, person2 makes the pair list deterministic.",
    ],
    time: "O(n) — single scan, no joins",
    space: "O(p) — one row per unordered pair",
    followUps: [
      "Which pair talked longest? ORDER BY total_duration DESC LIMIT 1.",
      "Extend to a 3-way call graph: how would you canonicalize triples {a,b,c}?",
    ],
    related: ["bank-account-summary-ii", "employees-with-missing-information"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "employees-with-missing-information",
    statement:
      "HR keeps two tables: Employees (ids and names) and Salaries (ids and pay). The data entry team is imperfect, so some ids exist in only one of the two tables. Report every id that is missing from either table, sorted by id.",
    examples: [
      {
        input: "Employees: (1,'Alicia'),(2,'Boris'),(3,'Chen'),(4,'Dora') · Salaries: (1,9500),(2,7800),(4,12000),(5,6300)",
        output: "3 · 5",
        explanation: "Id 3 has a name but no salary; id 5 has a salary but no name. Both are 'incomplete' and both belong in the report.",
      },
    ],
    constraints: ["employee_id is unique within each table", "an id may be missing from Employees, from Salaries, or in both — never report ids present in both", "output: single column employee_id, sorted"],
    breakdown: [
      "SQL has no FULL OUTER JOIN in SQLite, and this problem is exactly a full outer join's null side: ids present in one table but not the other. The portable answer is the symmetric difference — rows from A absent in B, UNIONed with rows from B absent in A.",
      "Two anti-joins do the detecting. LEFT JOIN … WHERE right.id IS NULL keeps left rows with no match; run it once in each direction and the two halves together cover both failure modes. UNION (not UNION ALL) is a free safety net: an id can't be in both halves anyway, but dedupe costs nothing here.",
      "This pattern is the interview-favorite way to say 'find records that failed to sync between two systems'. Once you can rebuild FULL OUTER JOIN from two LEFT JOINs, outer joins stop being syntax and become a shape you control.",
    ],
    edges: [
      "Only ids in EXACTLY one table qualify — an id in both tables is fine and must not appear.",
      "Check the right column in each anti-join: WHERE s.salary IS NULL only works if salary is NOT NULL in real data.",
      "One ORDER BY at the very end sorts the combined result — sorting each half separately is not the same.",
    ],
    ladder: [
      { title: "Brute force — two NOT IN subqueries", body: "SELECT id FROM Employees WHERE id NOT IN (SELECT id FROM Salaries), UNION ALL the mirror. Correct, but NOT IN has the NULL trap: if the subquery ever returns NULL, the whole NOT IN returns nothing." },
      { title: "The pattern — symmetric anti-join", body: "Two LEFT JOIN + IS NULL halves, one per direction. NULL-safe, index-friendly, and each half reads as a sentence: 'names without pay' and 'pay without names'." },
      { title: "The optimal idea — UNION of both halves", body: "UNION the halves and ORDER BY once at the end. Same complexity as either half — O(n + m) — and it emulates FULL OUTER JOIN portably." },
    ],
    approach: "Symmetric difference: two anti-joins UNIONed",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE Salaries (
  employee_id INTEGER PRIMARY KEY,
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name) VALUES (1,'Alicia'),(2,'Boris'),(3,'Chen'),(4,'Dora');
INSERT INTO Salaries (employee_id, salary) VALUES (1,9500),(2,7800),(4,12000),(5,6300);`,
      tables: [
        { name: "Employees", note: "ids 1–4; id 3 has no salary row" },
        { name: "Salaries", note: "ids 1,2,4,5; id 5 has no employee row" },
      ],
    },
    code: `SELECT e.employee_id
FROM Employees e
LEFT JOIN Salaries s ON s.employee_id = e.employee_id
WHERE s.salary IS NULL            -- a name with no pay
UNION
SELECT s.employee_id
FROM Salaries s
LEFT JOIN Employees e ON e.employee_id = s.employee_id
WHERE e.name IS NULL              -- pay with no name
ORDER BY 1;                       -- ordinal: the union's only output column`,
    walkthrough: [
      "First half: every employee is kept; salaries attach where present. The WHERE keeps only unmatched rows — id 3.",
      "Second half runs the mirror image over Salaries — unmatched there means no employee row — keeping id 5.",
      "UNION merges the two single-row halves and dedupes (defensive; the halves are disjoint by construction).",
      "The trailing ORDER BY sorts the union as a whole: 3 then 5.",
    ],
    time: "O(n + m) — two hash anti-joins",
    space: "O(d) — one row per defective id",
    followUps: [
      "Repair the data: write UPDATEs that insert placeholder rows for the missing halves.",
      "How would SQLite emulate a full FULL OUTER JOIN if both tables had multiple columns to show? (LEFT JOIN both ways + UNION, exposing which side is NULL.)",
    ],
    related: ["npv-queries", "combine-two-tables"],
    order: "exact",
    xp: 10,
  },
];
