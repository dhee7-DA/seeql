// Deep-dives — the SQL 50+ "pivots & text" extras: the conditional-column
// pivot, pattern-gated e-mails, a length-boundary filter and a zero-filled
// category report. Solutions are SQLite dialect, one statement each,
// engine-verified against the seeds (bun self-check; snapshotted by
// scripts/lc-sql-verify.ts once wired into content.ts).
import type { LcSqlDive } from "../types";

export const SQL_EXTRAS_PIVOTS: LcSqlDive[] = [
  {
    slug: "reformat-department-table",
    statement:
      "A company stores one revenue row per department per month — six possible months, Jan through Jun. Reshape the tall layout into a wide one: a single row per department whose columns are that department's revenue month by month (Jan_Revenue … Jun_Revenue), with NULL wherever the department never reported that month.",
    examples: [
      {
        input:
          "Department: (1,8000,'Jan'),(1,7000,'Feb'),(1,6000,'Mar'),(1,6000,'Apr'),(1,4600,'May'),(1,4600,'Jun') · (2,7000,'Jan'),(2,7000,'Feb'),(2,8000,'Mar'),(2,8000,'Apr'),(2,9000,'May'),(2,9000,'Jun') · (3,1000,'Feb'),(3,2000,'Apr'),(3,3000,'Jun') · (4,500,'Jan')",
        output:
          "id 1: 8000,7000,6000,6000,4600,4600 · id 2: 7000,7000,8000,8000,9000,9000 · id 3: NULL,1000,NULL,2000,NULL,3000 · id 4: 500,NULL,NULL,NULL,NULL,NULL",
        explanation:
          "Departments 1 and 2 reported all six months. Department 3 has no Jan, Mar or May rows — those columns fold to NULL. Department 4 reported a single month, so five of its six columns are NULL.",
      },
    ],
    constraints: [
      "the input holds one row per department per month it reported; absent months simply have no row",
      "output columns exactly: id, Jan_Revenue, Feb_Revenue, Mar_Revenue, Apr_Revenue, May_Revenue, Jun_Revenue",
      "a month a department never reported must surface as NULL, not as 0",
    ],
    breakdown: [
      "The shape change IS the problem. The input grain is (department, month); the output grain is department. Going from many rows per key to one row per key is aggregation by definition — GROUP BY id is not optional plumbing here, it is the collapse the whole exercise is about, and it means every displayed column must be produced by an aggregate function.",
      "The pivot idiom is one CASE expression per output column. CASE WHEN month = 'Jan' THEN revenue END returns the revenue on Jan rows and NULL on every other row of the group. MAX() then folds the group down to a single value: within one department's group at most one row feeds the Jan CASE with a non-NULL, MAX ignores NULLs, and the result is that revenue — or NULL when the department has no Jan row at all.",
      "Why MAX and not SUM? Both work while (id, month) is unique — SUM over one value plus NULLs is that value. MAX is the defensive habit: if dirty data ever held two rows for the same month, SUM would silently add two revenues while MAX at least returns one of them. And crucially, MAX over an all-NULL group returns NULL — that is exactly how the missing-month NULL survives into the output. COALESCE(..., 0) would erase the distinction the grader checks.",
      "The month axis is closed: Jul–Dec never occur, and the spec fixes the six columns. So the column list is written by hand, one expression per month. Pivots with a DYNAMIC axis are a different beast — they need a reporting layer or dynamic SQL, because a single static statement can only enumerate the columns it knows about in advance.",
    ],
    edges: [
      "MAX(CASE … END) over a month the id never has is MAX(all-NULL) = NULL — keep it; COALESCE to 0 would report revenue that never existed.",
      "Without the GROUP BY wrapper there is no collapse: SQLite would emit one row per month-row per id, with bare columns — the exact wrong-shape answer this problem hunts.",
      "(id, month) is assumed unique; if it weren't, MAX picks the largest conflicting revenue rather than adding them (SUM's silent double-count).",
      "Column names are graded exactly: alias each expression AS \"Jan_Revenue\" etc. — six aliases, in the spec's order.",
    ],
    ladder: [
      {
        title: "Brute force — six queries and glue",
        body: "Run SELECT id, revenue FROM Department WHERE month = 'Jan' … once per month, pull them into application code, and stitch the six results together by id. Correct, six round-trips — and the stitching is exactly what GROUP BY does in one set-based pass.",
      },
      {
        title: "The pattern — GROUP BY + conditional aggregate",
        body: "One aggregate per output column: MAX(CASE WHEN month = 'X' THEN revenue END). The CASE turns a row filter into a per-column projection; the aggregate turns per-column projections into one row per group. This shape is the workhorse behind every 'wide report from tall rows' request.",
      },
      {
        title: "The optimal idea — enumerate the closed axis",
        body: "GROUP BY id with exactly six MAX(CASE) expressions, aliases in the spec's order, ORDER BY id for reading. One O(n) scan — there is nothing further to optimize; the only generalization beyond a fixed axis is dynamic SQL.",
      },
    ],
    approach: "Conditional-aggregation pivot — GROUP BY id + one MAX(CASE WHEN month…) per output column",
    schema: {
      ddl: `CREATE TABLE Department (
  id      INTEGER NOT NULL,
  revenue INTEGER NOT NULL,
  month   TEXT NOT NULL
);`,
      seed: `INSERT INTO Department (id, revenue, month) VALUES
  (1, 8000, 'Jan'),(1, 7000, 'Feb'),(1, 6000, 'Mar'),(1, 6000, 'Apr'),(1, 4600, 'May'),(1, 4600, 'Jun'),
  (2, 7000, 'Jan'),(2, 7000, 'Feb'),(2, 8000, 'Mar'),(2, 8000, 'Apr'),(2, 9000, 'May'),(2, 9000, 'Jun'),
  (3, 1000, 'Feb'),(3, 2000, 'Apr'),(3, 3000, 'Jun'),   -- trap: no Jan (and no Mar, no May)
  (4, 500, 'Jan');                                      -- trap: a single-month department`,
      tables: [
        { name: "Department", note: "16 rows — depts 1–2 report all six months, dept 3 only Feb/Apr/Jun, dept 4 only Jan" },
      ],
    },
    code: `SELECT
    id,
    MAX(CASE WHEN month = 'Jan' THEN revenue END) AS "Jan_Revenue",   -- NULL if the id has no Jan row
    MAX(CASE WHEN month = 'Feb' THEN revenue END) AS "Feb_Revenue",
    MAX(CASE WHEN month = 'Mar' THEN revenue END) AS "Mar_Revenue",
    MAX(CASE WHEN month = 'Apr' THEN revenue END) AS "Apr_Revenue",
    MAX(CASE WHEN month = 'May' THEN revenue END) AS "May_Revenue",
    MAX(CASE WHEN month = 'Jun' THEN revenue END) AS "Jun_Revenue"
FROM Department
GROUP BY id        -- the aggregate wrapper: N month-rows collapse to one row per department
ORDER BY id;`,
    order: "any",
    walkthrough: [
      "GROUP BY id carves the 16 rows into four groups — one per department. Everything in the SELECT list is now evaluated per group, never per row.",
      "Department 3 contributes three rows (Feb 1000, Apr 2000, Jun 3000). The Jan CASE returns NULL on all three, so MAX sees only NULLs and yields NULL — same for Mar and May. The Feb CASE yields 1000 on one row and NULL on the rest, and MAX ignores the NULLs: 1000. Row: (3, NULL, 1000, NULL, 2000, NULL, 3000).",
      "Department 4 has a single row: the Jan CASE yields 500 → MAX 500; every other column is MAX over one NULL → NULL. (4, 500, NULL, NULL, NULL, NULL, NULL).",
      "Departments 1 and 2 reported every month, so each of their six columns folds to its single revenue — the tall rows reappear side by side, wide. ORDER BY id lines the departments up for reading; grading compares rows as a set.",
    ],
    time: "O(n) — one scan of the month-rows; the six CASE expressions are evaluated per row inside the single aggregation pass",
    space: "O(d) — one output row per department",
    followUps: [
      "Un-pivot the wide result back to tall: a months VALUES spine cross-joined to the wide rows, or a UNION ALL of six SELECTs each picking one column — the reverse-ETL direction every pivot forces on you eventually.",
      "What happens to a stray (7, 9999, 'Jul') row? It vanishes — no output column enumerates Jul. Decide whether to validate the axis or let the pivot drop it.",
      "Monthly Transactions I (SQL Extras) is the same conditional-aggregation machinery used for per-month counts instead of columns.",
    ],
    related: ["group-sold-products-by-the-date", "monthly-transactions-i", "count-salary-categories", "students-and-examinations"],
    xp: 10,
  },
  {
    slug: "find-users-with-valid-e-mails",
    statement:
      "Every account row carries the user's name and an e-mail address. An address is valid when it ends in the exact domain @leetcode.com and everything before the @ starts with a letter and then contains only letters, digits, underscores and dots. Return the rows whose address passes — id, name and mail.",
    examples: [
      {
        input:
          "Users: (1,'Winston','winston@leetcode.com') · (2,'Jonathan','jonathanisgreat') · (3,'Annabelle','bella-@leetcode.com') · (4,'Sally','sally.come@leetcode.com') · (5,'Marwan','quarz#2020@leetcode.com') · (6,'David','david69@gmail.com') · (7,'Shapiro','.shapo@leetcode.com') · (8,'Umbra','_umbra@leetcode.com') · (9,'Nia','9nia@leetcode.com') · (10,'Pixel','pix_el.dot7@leetcode.com')",
        output: "1 Winston winston@leetcode.com · 4 Sally sally.come@leetcode.com · 10 Pixel pix_el.dot7@leetcode.com",
        explanation:
          "Winston and Sally pass; Pixel's underscore, dot and digits all sit mid-prefix, which is legal. Every other row fails exactly one rule: no domain (2), hyphen (3), # (5), wrong domain (6), no leading letter (7, 8, 9).",
      },
    ],
    constraints: [
      "prefix: starts with a letter, then only letters, digits, underscores and dots",
      "domain: exactly @leetcode.com — case-sensitive, nothing before it but the prefix and nothing after it",
      "output user_id, name, mail for every row whose address passes",
    ],
    breakdown: [
      "Decompose 'valid' into three independent facts: the first character is a letter; every character before the @ belongs to the allowed set {letters, digits, _, .}; and the string ends with the exact characters @leetcode.com. A correct query must enforce all three — and each invalid row in the example fails exactly one of them, which is how you know the checklist is complete.",
      "Portability first: SQLite ships without REGEXP — the function simply does not exist in a vanilla build, so the regex one-liner MySQL and PostgreSQL answers use dies with 'no such function: regexp' in this sandbox. The tools that do exist: LIKE, whose wildcards are only % and _ (no character classes, and it folds case), and GLOB, which has Unix-style character classes like [A-Za-z], is case-sensitive, and must match the WHOLE string — so both ends are anchored for free.",
      "The naive GLOB looks finished but isn't: mail GLOB '[A-Za-z]*@leetcode.com' means 'first char is a letter and the string ends with the domain' — but GLOB's * is an any-anything wildcard, NOT a regex quantifier. [A-Za-z] covers exactly one character, and the * then happily matches bella- on its way to the @. The domain gate passes the hyphen row straight through; the prefix constraint is simply not enforced by it.",
      "The fix is a negative gate. '*[^A-Za-z0-9_.]*@leetcode.com' fires exactly when some forbidden character — space, hyphen, #, a second @ — sits anywhere before the trailing domain; NOT GLOB turns that match into a veto. The two gates together are precisely the official regex ^[a-zA-Z]+[a-zA-Z0-9_.]*@leetcode\\.com$ rebuilt from wildcards: the positive gate supplies the leading letter and the domain, the negative gate polices every character in between. And because @ itself is forbidden, any second @ makes the veto fire — double-@ addresses are rejected for free.",
    ],
    edges: [
      "GLOB is case-sensitive — '@LeetCode.com' fails the domain gate, which the spec wants; LIKE would fold case and wave it through.",
      "'.shapo@leetcode.com' is invalid because dots are allowed mid-prefix, never FIRST — same for '_umbra' and '9nia'.",
      "A one-letter prefix is valid ('a@leetcode.com' passes both gates); an EMPTY prefix is not — without a leading letter the first gate cannot fire.",
      "REGEXP portability: MySQL needs the ^…$ anchors — unanchored, '#y@leetcode.com' matches [a-zA-Z]+[a-zA-Z0-9_.]*@leetcode.com because the engine happily finds 'y@leetcode.com' inside it.",
    ],
    ladder: [
      {
        title: "Brute force — validate in application code",
        body: "SELECT every row, run each mail through a host-language regex, filter there. Works — but it ships the whole table over the wire and moves a data-quality rule out of the database where no other client can reuse it.",
      },
      {
        title: "The pattern — two complementary GLOB gates",
        body: "A positive full-string gate ('[A-Za-z]*@leetcode.com') for the anchors — leading letter and trailing domain — plus a negative gate (NOT GLOB '*[^A-Za-z0-9_.]*@leetcode.com') for the allowed-character rule. It's De Morgan's law as a pattern: 'all characters allowed' = 'not (some character disallowed)'.",
      },
      {
        title: "The optimal idea — one scan, two pattern checks",
        body: "WHERE mail GLOB … AND mail NOT GLOB …, ORDER BY user_id. A single pass over the table; each pattern check is O(length of the mail). Nothing further to optimize in pure SQL — an index can't serve a predicate on the content of the column anyway.",
      },
    ],
    approach: "Double GLOB gate — positive anchor pattern + NOT GLOB veto over the allowed character set",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  mail    TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, name, mail) VALUES
  (1, 'Winston',   'winston@leetcode.com'),      -- official: valid, letters-only prefix
  (2, 'Jonathan',  'jonathanisgreat'),           -- official: no domain at all
  (3, 'Annabelle', 'bella-@leetcode.com'),       -- official: hyphen is not an allowed char
  (4, 'Sally',     'sally.come@leetcode.com'),   -- official: valid, dot mid-prefix
  (5, 'Marwan',    'quarz#2020@leetcode.com'),   -- official: '#' is not an allowed char
  (6, 'David',     'david69@gmail.com'),         -- official: right shape, wrong domain
  (7, 'Shapiro',   '.shapo@leetcode.com'),       -- official: prefix must START with a letter
  (8, 'Umbra',     '_umbra@leetcode.com'),       -- trap: underscore legal later, never first
  (9, 'Nia',       '9nia@leetcode.com'),         -- trap: digit-leading prefix
  (10, 'Pixel',    'pix_el.dot7@leetcode.com');  -- trap-buster: _, . and digits mid-prefix → valid`,
      tables: [
        { name: "Users", note: "10 addresses — only Winston, Sally and Pixel pass; every failure mode of the rule appears once" },
      ],
    },
    code: `SELECT
    user_id,
    name,
    mail
FROM Users
WHERE mail GLOB '[A-Za-z]*@leetcode.com'             -- first char a letter, string ends with the exact domain
  AND mail NOT GLOB '*[^A-Za-z0-9_.]*@leetcode.com'  -- veto: a forbidden char somewhere before that @
ORDER BY user_id;`,
    order: "any",
    walkthrough: [
      "Gate one is a full-string match: [A-Za-z] must consume the FIRST character and the literal @leetcode.com the LAST thirteen; the * between them may match anything. jonathanisgreat (no domain), david69@gmail.com (wrong domain) and _umbra / 9nia / .shapo (no leading letter) all die here.",
      "The survivors include bella-@leetcode.com and quarz#2020@leetcode.com — gate one's * cannot see what it steps over. Gate two re-reads each survivor looking for a forbidden character followed by anything and the trailing domain: bella-'s hyphen and quarz's # both trip it, and both are gone.",
      "winston, sally.come and pix_el.dot7 hold no forbidden character before the final @ — the @ itself sits inside the reserved domain suffix where the veto pattern cannot reach — so all three pass both gates.",
      "ORDER BY user_id prints rows 1, 4, 10 — deterministic and readable, though grading compares the rows as a set.",
    ],
    time: "O(n · m) for n rows of average mail length m — two pattern scans per row; no index can serve a predicate on a column's contents",
    space: "O(k) for the k surviving rows",
    followUps: [
      "MySQL's answer is REGEXP '^[a-zA-Z]+[a-zA-Z0-9_.]*@leetcode\\\\.com$' — run both against a row with a trailing space or a doubled domain and compare which gate is stricter (GLOB is whole-string; unanchored REGEXP matches substrings).",
      "Some SQLite builds can .load a REGEXP extension or register a user function — which is exactly why a query that works on a laptop can die with 'no such function' inside a locked-down sandbox; GLOB is the habit that travels.",
    ],
    related: ["fix-names-in-a-table", "patients-with-a-condition", "invalid-tweets"],
    xp: 10,
  },
  {
    slug: "invalid-tweets",
    statement:
      "A micro-blogging service enforces its post cap by measuring every post's text: anything longer than 15 characters is over the limit. From the posts table, list the ids of the offending posts.",
    examples: [
      {
        input:
          "Tweets: (1, 'Let us Code') — 11 chars · (2, 'More than fifteen chars are here!') — 33 chars · (3, 'Exactly fifteen') — 15 chars · (4, 'Exactly fifteen!') — 16 chars · (5, 'Fourteen only!') — 14 chars",
        output: "2 · 4",
        explanation:
          "Only posts 2 (33 chars) and 4 (16 chars) exceed the cap. Post 3 sits exactly ON the limit and stays valid — the rule is strictly greater than 15.",
      },
    ],
    constraints: [
      "content is text; the length that matters counts CHARACTERS, not bytes",
      "invalid ⇔ length of content > 15 — strictly greater",
      "output just tweet_id; any order accepted (the reference sorts by id)",
    ],
    breakdown: [
      "The whole problem is one predicate, but it hides three small decisions. First, the function: SQLite's LENGTH() on TEXT counts characters, not bytes — a four-byte emoji counts as one character — which matches how a character cap is defined. (On other types it differs: LENGTH of a number is the digit count of its text form, and LENGTH of a BLOB is bytes. content is TEXT, so we are on the character path.)",
      "Second, the boundary: 'longer than 15' is strictly greater, so 15 is legal and 16 is not. Off-by-one on a documented boundary is the #1 failure mode of easy SQL problems — pin the comparison to named rows: 'Exactly fifteen' must stay, 'Exactly fifteen!' must go. >= 16 would work here by coincidence but reads as a magic number; >= 15 would wrongly exile the on-the-limit row.",
      "Third, the shape: one column out, no grouping, no join — this is FILTER, not GROUP. And note the query-plan aside that makes this problem a favorite: a function-on-column predicate like LENGTH(content) > 15 is index-hostile. Even with an index on content, SQLite scans, because the index stores raw strings, not their lengths. Harmless at tweet scale; a real design conversation at platform scale (where generated columns or search indexes enter).",
    ],
    edges: [
      "Exactly 15 passes — > 15, never >= 15. The 15-char trap row is the entire test.",
      "Whitespace counts: spaces are characters, so padded text tips over the boundary even when it looks short.",
      "LENGTH() counts characters (code points) for TEXT — multibyte characters are one each; only BLOBs get a byte count.",
      "NULL content drops out silently (NULL > 15 is NULL, not true) — decide whether a missing text is 'valid' or a schema violation before relying on that.",
    ],
    ladder: [
      {
        title: "Brute force — ship every row, measure in the app",
        body: "SELECT tweet_id, content for all rows, count characters in code, filter there. It answers the question at the cost of moving the whole table — and re-answering it on every request.",
      },
      {
        title: "The pattern — push the predicate down",
        body: "WHERE LENGTH(content) > 15. Scalar functions compose into predicates; the row set shrinks inside the engine, before anything reaches the network. This 'do the filtering where the data lives' step is the first performance lesson in every SQL course.",
      },
      {
        title: "The optimal idea — the predicate IS the answer",
        body: "SELECT tweet_id FROM Tweets WHERE LENGTH(content) > 15 ORDER BY tweet_id. One scan with O(m) counting per row; within the official constraints nothing beats it. The only scaling play is a computed-length column you can index.",
      },
    ],
    approach: "LENGTH() predicate with a strictly-greater boundary",
    schema: {
      ddl: `CREATE TABLE Tweets (
  tweet_id INTEGER PRIMARY KEY,
  content  TEXT
);`,
      seed: `INSERT INTO Tweets (tweet_id, content) VALUES
  (1, 'Let us Code'),                        -- 11 chars → fine
  (2, 'More than fifteen chars are here!'),  -- 33 chars → invalid
  (3, 'Exactly fifteen'),                    -- trap: EXACTLY 15 → still valid
  (4, 'Exactly fifteen!'),                   -- 16 chars → invalid (strictly greater)
  (5, 'Fourteen only!');                     -- 14 chars → fine`,
      tables: [
        { name: "Tweets", note: "5 posts — lengths 11, 33, 15, 16, 14; only 2 and 4 cross the cap" },
      ],
    },
    code: `SELECT
    tweet_id
FROM Tweets
WHERE LENGTH(content) > 15   -- strictly greater: a 15-char post is still legal
ORDER BY tweet_id;`,
    order: "any",
    walkthrough: [
      "The scan touches all five rows and evaluates LENGTH(content) once per row: 11, 33, 15, 16, 14.",
      "The predicate > 15 keeps 33 and 16 and drops 11, 15 and 14 — row 3 is the boundary case, and the strictness of > is precisely what keeps it.",
      "Two rows survive, ids 2 and 4; ORDER BY tweet_id displays them 2, 4 (the grader compares rows as a set).",
      "Note what never happened: no GROUP BY, no join, no CASE. The entire difficulty was choosing the right scalar function and the right comparison — which is where easy problems actually live.",
    ],
    time: "O(n) rows with O(m) character counting per row of length m",
    space: "O(k) for the k offending ids",
    followUps: [
      "Make the cap per-account (verified users get 280): join a limits table and compare LENGTH(content) > l.max_len — same predicate, per-row threshold.",
      "At platform scale the filter cannot use a plain index on content — sketch the generated-column fix: store LENGTH(content) in an indexed column (kept fresh by the engine) and filter on that.",
    ],
    related: ["patients-with-a-condition", "fix-names-in-a-table", "find-users-with-valid-e-mails"],
    xp: 10,
  },
  {
    slug: "count-salary-categories",
    statement:
      "Every account row carries a yearly income figure, and the company reports salaries in three buckets: Low under 20,000; Average from 20,000 through 50,000 inclusive; High above 50,000. Produce the full report — one row per bucket with the number of accounts in it — where a bucket that happens to be empty must still appear, with a count of zero.",
    examples: [
      {
        input: "Accounts: (3, 108939) · (2, 12747) · (8, 87709) · (6, 91796) · (7, 19999) · (5, 50001)",
        output: "Low Salary · 2 / Average Salary · 0 / High Salary · 4",
        explanation:
          "12747 and 19999 are Low (19999 sits one under the Average floor). No account lands in Average — the bucket must still be reported, with 0. 108939, 87709, 91796 and 50001 are High (50001 sits one over the Average ceiling).",
      },
    ],
    constraints: [
      "Low Salary: income < 20000 · Average Salary: 20000 <= income <= 50000 · High Salary: income > 50000",
      "the output has exactly three rows — one per category — even when a category has no accounts",
      "columns: category, accounts_count; categories print in the report order Low, Average, High",
    ],
    breakdown: [
      "The request looks like GROUP BY, but the required output contradicts it: GROUP BY can only report buckets that EXIST in the data. With no Average accounts, no Average group is ever formed and the row silently vanishes — no error, just a missing line that a report reader will interpret as 'no data'. The correct mental model: the three categories belong to the QUESTION, not to the data, so the query must carry its own list of buckets.",
      "Build the spine. A VALUES CTE (a UNION ALL of three one-row SELECTs is the same idea) declares the category axis up front — with a fixed sort key riding along, because category names sort alphabetically (Average, High, Low) and the report wants Low, Average, High. This is the same scaffold-then-enrich move as Students × Subjects in the SQL 50: manufacture the expected grid first, hang the observed numbers onto it second.",
      "Bucket every account with a CASE that files each row into exactly one category, aggregate to counts, then LEFT JOIN the counts onto the spine. The join DIRECTION is the whole trick: spine LEFT JOIN counts — the spine drives and the counts decorate. Reverse it and the empty Average row disappears again, because it exists only on the spine side.",
      "The zero-fill itself is COALESCE(c.accounts_count, 0): an unmatched spine row carries NULL through the join, and a NULL count in a report is a defect. A second idiom exists — LEFT JOIN the raw bucketed rows onto the spine and use COUNT(b.account_id), which is 0 for empty buckets because COUNT(column) skips NULLs. Same scaffold, different place to do the counting; pick the one your readers will understand.",
    ],
    edges: [
      "Average Salary is EMPTY in the seed (the official example's own shape): a GROUP BY-only answer returns two rows and fails; the spine forces the third row with 0.",
      "The boundaries belong to Average: 20000 and 50000 are BOTH Average (the middle bucket is closed on both sides). The seed's 19999 and 50001 sit one step outside on each side — if your CASE says income <= 20000 → Low or income >= 50000 → High, an exact-boundary row would be misfiled.",
      "ORDER BY the spine's sort key, never the category name — alphabetical order prints Average, High, Low.",
      "COALESCE the count to 0 AFTER the outer join — there is no row inside counts to coalesce; the hole only exists on the spine side.",
    ],
    ladder: [
      {
        title: "Brute force — three queries and glue",
        body: "Run one COUNT per category, each with its own WHERE, and merge the three scalars in application code. Correct, three round-trips — and the merge is exactly the fixed three-row axis the spine builds set-based.",
      },
      {
        title: "The pattern — GROUP BY + CASE buckets … then notice the hole",
        body: "SELECT CASE…END AS category, COUNT(*) … GROUP BY 1 files every account correctly — but it cannot manufacture an empty row. The moment a category CAN be empty, GROUP BY is insufficient; that realization is the actual lesson of the problem.",
      },
      {
        title: "The optimal idea — spine + LEFT JOIN zero-fill",
        body: "A VALUES spine with a sort key; a CASE bucketing CTE; a counts CTE; then counts LEFT-JOINed onto the spine with COALESCE filling the holes. O(n) to bucket plus a constant-size 3-row axis — the report's shape is guaranteed by construction.",
      },
    ],
    approach: "Category spine (VALUES CTE) + LEFT JOIN zero-fill",
    schema: {
      ddl: `CREATE TABLE Accounts (
  account_id INTEGER PRIMARY KEY,
  income     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Accounts (account_id, income) VALUES
  (3, 108939),  -- official → High
  (2, 12747),   -- official → Low
  (8, 87709),   -- official → High
  (6, 91796),   -- official → High
  (7, 19999),   -- trap: one UNDER the Average floor → still Low
  (5, 50001);   -- trap: one OVER the Average ceiling → High; Average Salary stays EMPTY`,
      tables: [
        { name: "Accounts", note: "6 accounts — 2 Low, 0 Average (the zero-fill trap), 4 High" },
      ],
    },
    code: `WITH spine(category, rk) AS (
    VALUES                    -- the report's row axis, declared up front
        ('Low Salary', 1),
        ('Average Salary', 2),
        ('High Salary', 3)
),
buckets AS (
    -- file every account into exactly one bucket
    SELECT
        CASE
            WHEN income <  20000 THEN 'Low Salary'
            WHEN income <= 50000 THEN 'Average Salary'   -- closed on BOTH sides: 20000 and 50000 land here
            ELSE                      'High Salary'
        END AS category
    FROM Accounts
),
counts AS (
    -- GROUP BY alone reports only the buckets that exist — the silent drop
    SELECT category, COUNT(*) AS accounts_count
    FROM buckets
    GROUP BY category
)
SELECT
    s.category,
    COALESCE(c.accounts_count, 0) AS accounts_count   -- zero-fill: an empty bucket has no counts row at all
FROM spine s
LEFT JOIN counts c ON c.category = s.category
ORDER BY s.rk;   -- Low, Average, High — the report's mandated order`,
    order: "exact",
    walkthrough: [
      "buckets files each of the 6 accounts: 12747 → Low, 108939/87709/91796 → High, 19999 → Low (one under the floor), 50001 → High (one over the ceiling). No account lands in Average — deliberately.",
      "counts collapses buckets to two rows: Low 2, High 4. The Average row never forms — GROUP BY's silent drop, visible right here in the intermediate CTE.",
      "The spine drives the final join: all three of its rows survive the LEFT JOIN. Low and High pick up their counts; Average matches nothing and carries NULL, which COALESCE turns into 0.",
      "ORDER BY s.rk emits Low Salary · 2, Average Salary · 0, High Salary · 4 — the exact report shape in the mandated order, so the grader can check row order too.",
    ],
    time: "O(n) — one pass to bucket and count the accounts, then a constant-size (3-row) spine join",
    space: "O(n) worst case for the bucketed CTE; the spine is O(3)",
    followUps: [
      "One-join variant: LEFT JOIN the raw Accounts rows onto the spine (ON the CASE category matches) and use COUNT(a.account_id) — the 0 comes from COUNT skipping NULLs instead of COALESCE. Which reads better in your codebase?",
      "Percentage edition: append 100.0 * accounts_count / (SELECT COUNT(*) FROM Accounts) — and watch it collapse to 0 if you drop the 100.0 (integer division).",
      "Empty Accounts table: the spine still prints all three rows with 0 — a GROUP BY-only answer prints nothing. That resilience is why reporting layers love scaffolds.",
    ],
    related: ["students-and-examinations", "reformat-department-table", "group-sold-products-by-the-date", "monthly-transactions-i"],
    xp: 20,
  },
];
