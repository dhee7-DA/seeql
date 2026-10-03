// Deep-dives — the SQL 50 "Sorting and Grouping" band: string shaping, a
// write-problem dedup, group maxima, ranking windows, HAVING filters, string
// aggregation and a first-order percentage. Solutions are SQLite dialect, one
// statement each (the write problem carries a writeVerify SELECT so the
// grader can inspect the post-mutation table).
import type { LcSqlDive } from "../types";

export const SQL_GROUP: LcSqlDive[] = [
  {
    slug: "fix-names-in-a-table",
    statement:
      "Usernames were typed with inconsistent casing: some start lowercase, some are ALL CAPS, some are mixed mid-word. Normalize every name so only its first character is uppercase and the remaining characters are lowercase. Return each user's id next to the cleaned-up name.",
    examples: [
      {
        input: "Users: (1,'aLice'),(2,'bOB')",
        output: "1 Alice · 2 Bob",
        explanation: "'aLice' → 'Alice' (first letter up, rest down); 'bOB' → 'Bob'.",
      },
      {
        input: "Users: (3,'ABC')",
        output: "3 Abc",
        explanation: "All-caps names get the same positional treatment — the rule applies to every row, not just 'broken-looking' ones.",
      },
    ],
    constraints: [
      "names contain only upper- and lowercase English letters (no spaces or digits)",
      "user_id values are unique",
      "output user_id and the fixed name aliased user_name",
    ],
    breakdown: [
      "The transformation is positional: character 1 gets UPPER, characters 2..end get LOWER. SQL has no title-case function — you build one from three primitives: SUBSTR to slice the name into head and tail, UPPER/LOWER to shift each half's case, and || to glue them back together. (SQLite concatenates with ||; CONCAT is MySQL's spelling.)",
      "SUBSTR(name, 1, 1) is exactly the first character; SUBSTR(name, 2) with the length argument omitted means 'from position 2 to the end of the string'. UPPER and LOWER are no-ops on characters already in the target case, which is why the same expression also passes correctly-typed names through untouched.",
      "One row in, one row out — there is no join, no group, no filter. This problem is really 'learn the string toolkit' dressed up as a task, and the only structure beyond the expression is the ORDER BY user_id that presents the listing in id order.",
    ],
    edges: [
      "Single-character names: SUBSTR(name, 2) yields the empty string, not NULL, so 'w' becomes 'W' cleanly.",
      "Names already correct or fully uppercase must pass through the same formula — UPPER/LOWER are idempotent, so they do.",
      "SQLite has no INITCAP and no CONCAT by default — || is the joiner, and forgetting it is the #1 syntax stumble here.",
      "ORDER BY user_id in the reference solution; grading compares rows as a set.",
    ],
    ladder: [
      { title: "Brute force — fix names in app code", body: "Read every row, split the name, uppercase index 0, lowercase the rest, write it back. Works, but drags N rows over the wire for a transformation the engine does natively in one pass." },
      { title: "The pattern — slice, shift, glue", body: "Head = SUBSTR(name,1,1) → UPPER; tail = SUBSTR(name,2) → LOWER; result = head || tail. Composing tiny string primitives is the standard SQL answer to formatting asks." },
      { title: "The optimal idea — one expression, one pass", body: "SELECT user_id, UPPER(SUBSTR(name,1,1)) || LOWER(SUBSTR(name,2)) AS user_name FROM Users ORDER BY user_id. Nothing to tune — O(total characters)." },
    ],
    approach: "Slice-shift-glue string normalization",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, name) VALUES
  (1,'aLice'),
  (2,'bOB'),
  (3,'ABC'),      -- all caps
  (4,'w'),        -- single character
  (5,'jOHn');     -- mixed mid-word`,
      tables: [
        { name: "Users", note: "5 users — the official pair plus all-caps, single-letter and mixed-case trap rows" },
      ],
    },
    code: `SELECT
    user_id,
    UPPER(SUBSTR(name, 1, 1))   -- capitalize the first character...
    || LOWER(SUBSTR(name, 2))   -- ...and glue the lowercased rest onto it
    AS user_name
FROM Users
ORDER BY user_id;`,
    walkthrough: [
      "SUBSTR(name, 1, 1) slices exactly one character from position 1 — the initial. UPPER lifts it to uppercase no matter how it was typed: 'aLice' contributes 'A', 'ABC' contributes 'A'.",
      "SUBSTR(name, 2) omits the length, meaning 'to the end'. LOWER flattens the remainder — 'Lice' → 'lice', 'BC' → 'bc'. For the single-letter 'w' the tail is the empty string, and || happily glues nothing.",
      "|| concatenates the halves into user_name: 'aLice' → 'Alice', 'bOB' → 'Bob', 'ABC' → 'Abc', 'jOHn' → 'John'. Every row is transformed independently — the expression never looks at other rows.",
      "ORDER BY user_id presents the listing in id order; the grader accepts any row order, so the sort is presentation, not correctness.",
    ],
    time: "O(n · L) — every character of every name is touched once",
    space: "O(n · L) — the output strings themselves",
    followUps: [
      "Names with spaces ('MARY jane') would need per-word capitalization — think about finding word boundaries with INSTR and SUBSTR in a loop.",
      "Count how many names were stored non-canonically: compare name against the fixed expression with name <> UPPER(SUBSTR(...)) || LOWER(SUBSTR(...)).",
    ],
    related: ["patients-with-a-condition", "not-boring-movies"],
    order: "any",
    xp: 10,
  },
  {
    slug: "patients-with-a-condition",
    statement:
      "Patients carries each patient's conditions as one string of space-separated codes, like 'ASTHMA DIAB1'. Return every patient who has a condition beginning with DIAB1 — either the whole string starts with that prefix, or DIAB1 appears after a space as a later word. Show patient_id, patient_name and the conditions string exactly as stored.",
    examples: [
      {
        input: "Patients: (1,'Daniel','SADIAB100'),(2,'Alice','DIAB100')",
        output: "2 Alice · DIAB100",
        explanation: "'SADIAB100' CONTAINS DIAB1 but not at the start of a word — no space before it — so Daniel is out; Alice's string starts with the prefix, so she is in.",
      },
      {
        input: "Patients: (3,'Carol','SLE DIAB1'),(4,'David','DIAB2 X')",
        output: "3 Carol · SLE DIAB1",
        explanation: "Carol's DIAB1 is a later word, caught by the space-anchored arm; David's codes start with DIAB2, which does not begin with DIAB1.",
      },
    ],
    constraints: [
      "1-10 space-separated condition codes per patient",
      "codes mix letters and digits; matching is case-sensitive",
      "output patient_id, patient_name, conditions (raw string, unmodified)",
    ],
    breakdown: [
      "The trap is containment versus word-start. A naive LIKE '%DIAB1%' matches 'SADIAB100' — DIAB1 buried inside another code — which is exactly the false positive this problem is built around. In a space-separated list, a code can only begin at position 1 or immediately after a space; any other occurrence is a substring of a bigger code and must not count.",
      "So the WHERE clause gets two arms: conditions LIKE 'DIAB1%' fires when the FIRST word begins with the prefix, and conditions LIKE '% DIAB1%' fires when a LATER word does — the literal leading space is the word-boundary marker. Together the two arms cover every word position without splitting the string into a list.",
      "Note prefix, not equality: DIAB100 and DIAB12 both match, because the grader's rule is 'a code that starts with DIAB1' — the canonical accepted solution is precisely these two LIKE arms. And the output echoes the raw conditions column; no trimming, no rebuilding.",
    ],
    edges: [
      "'DIAB100' matches (prefix rule, not exact code); 'DIAB2 X' does not.",
      "'SADIAB100' must NOT match — '%DIAB1%' without the boundary space is the classic wrong answer.",
      "A code buried mid-list ('ASTHMA DIAB100 YFEV') is caught by the second arm.",
      "One row per matching patient — both arms live in a single WHERE on a single row, so OR can never double-count (unlike two queries UNIONed).",
    ],
    ladder: [
      { title: "Brute force — split in application code", body: "conditions.split(' ').some(c => c.startsWith('DIAB1')) per patient. Fine in a host language, but the exercise is expressing a word boundary in SQL pattern matching." },
      { title: "The pattern — anchored alternation", body: "LIKE 'PREFIX%' covers word one; LIKE '% PREFIX%' covers the rest, with the space doubling as the boundary detector. Two patterns, no parsing." },
      { title: "The optimal idea — two-arm OR", body: "WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%'. One pass, two substring scans per row; a leading-wildcard LIKE can't use an index and doesn't need to at this scale." },
    ],
    approach: "Two-arm LIKE with a space as the word boundary",
    schema: {
      ddl: `CREATE TABLE Patients (
  patient_id   INTEGER PRIMARY KEY,
  patient_name TEXT NOT NULL,
  conditions   TEXT NOT NULL
);`,
      seed: `INSERT INTO Patients (patient_id, patient_name, conditions) VALUES
  (1,'Daniel','SADIAB100'),        -- buried: contains DIAB1, no boundary
  (2,'Alice','DIAB100'),           -- starts with the prefix
  (3,'Bob','DIAB1'),               -- exact code
  (4,'Carol','SLE DIAB1'),         -- later word
  (5,'David','DIAB2 X'),           -- different code family
  (6,'Eve','ASTHMA DIAB100 YFEV'), -- mid-list
  (7,'Frank','DIAB12');            -- prefix DIAB1, different digits`,
      tables: [
        { name: "Patients", note: "7 patients — SADIAB100 (buried) and DIAB2 X (wrong code) are the must-exclude traps; DIAB100, DIAB1, DIAB12 and mid-string hits are the must-include traps" },
      ],
    },
    code: `SELECT
    patient_id,
    patient_name,
    conditions              -- echoed exactly as stored
FROM Patients
WHERE conditions LIKE 'DIAB1%'     -- the FIRST word starts with DIAB1
   OR conditions LIKE '% DIAB1%'   -- a LATER word does: the space is the boundary
ORDER BY patient_id;`,
    walkthrough: [
      "Arm one, 'DIAB1%', is anchored at position 1: it fires when the string's first characters are DIAB1 — so Alice's 'DIAB100', Bob's 'DIAB1' and Frank's 'DIAB12' all qualify (the prefix rule, not exact equality).",
      "Arm two, '% DIAB1%', matches any string containing a space followed by DIAB1 — the leading % swallows earlier words and the literal space guarantees the match sits at a word start. Carol's 'SLE DIAB1' and Eve's 'ASTHMA DIAB100 YFEV' arrive through this arm.",
      "Daniel's 'SADIAB100' fails both arms: it does not start with DIAB1, and its only DIAB1 has no space in front. David's 'DIAB2 X' fails the prefix test on its first word and never contains ' DIAB1' — five rows survive out of seven.",
      "ORDER BY patient_id keeps the listing tidy; the grader compares the matching rows as a set.",
    ],
    time: "O(n · L) — substring scan of the conditions string per row",
    space: "O(k) — the k matching rows",
    followUps: [
      "Count patients per condition prefix — derive the code with SUBSTR + INSTR and GROUP BY it.",
      "Hunt the near-miss in tests: write the query with '%DIAB1%' and confirm on this seed that Daniel wrongly reappears.",
    ],
    related: ["fix-names-in-a-table", "not-boring-movies"],
    order: "any",
    xp: 10,
  },
  {
    slug: "delete-duplicate-emails",
    statement:
      "The Person table collects sign-ups, and weak validation let the same email register several times under different ids. Write a single DELETE that removes every duplicate email row, keeping only the row with the smallest id for each email. The grader inspects the remaining rows of Person afterwards.",
    examples: [
      {
        input: "Person: (1,'john@example.com'),(2,'bob@example.com'),(3,'john@example.com')",
        output: "after the delete: (1,'john@example.com'),(2,'bob@example.com')",
        explanation: "john@example.com sits at ids 1 and 3; id 1 is smaller, so id 3 is deleted. bob@example.com is unique and untouched.",
      },
      {
        input: "add (4,'ada@example.com'),(5,'ada@example.com'),(6,'ada@example.com') — a triple",
        output: "only (4,'ada@example.com') survives of the three",
        explanation: "Duplicates come in groups of any size; keep-MIN prunes a triple down to one row exactly as it prunes a pair.",
      },
    ],
    constraints: [
      "a duplicate is an exact email match; one email may appear many times",
      "keep the row with the smallest id per email — every other row of that email is deleted",
      "one DELETE statement; the grader compares the post-delete table",
    ],
    breakdown: [
      "This is the write cousin of Duplicate Emails (#182). The SELECT version lists emails with COUNT(*) > 1; the DELETE version must remove every row of a duplicate group EXCEPT the smallest id. Rephrased set-wise: delete rows whose id is not their email group's MIN(id).",
      "Build the keep-set first. SELECT MIN(id) FROM Person GROUP BY email returns one survivor id per email — and for unique emails that is the row itself, so the expression is safe across the whole table, not just the duplicated part. Then DELETE FROM Person WHERE id NOT IN (that set) removes exactly the non-survivors: the canonical SQLite pattern for this problem.",
      "SQLite evaluates the subquery (materializes it) before deleting, so the statement never reads and writes the same row set at the same time — it runs directly, no temp table, no procedure. In engines with stricter same-table semantics you would wrap the MIN query in a derived table; the group-then-complement shape stays identical.",
    ],
    edges: [
      "Groups can be larger than pairs — the seed's triple collapses to its MIN(id) row.",
      "Unique emails are untouched: their id IS the MIN of a one-row group.",
      "MIN vs MAX is the whole spec — flip to MAX and the same statement silently keeps the wrong survivor.",
      "Write problems grade the post-delete table (writeVerify: SELECT id, email FROM Person ORDER BY id), so deleting too little or too much both fail.",
    ],
    ladder: [
      { title: "Brute force — delete per surplus id", body: "Read all rows, find duplicate emails in app code, issue one DELETE per surplus id. N round-trips, and the read-then-delete sequence races with concurrent writes." },
      { title: "The pattern — group, keep, complement", body: "GROUP BY email with MIN(id) computes the survivor set; NOT IN turns it into the victim set. 'Aggregate the keepers, delete the complement' is the reusable shape." },
      { title: "The optimal idea — one self-referencing DELETE", body: "DELETE ... WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email). One pass to build the id set, one pass to delete; the PRIMARY KEY index makes each membership check cheap." },
    ],
    approach: "Group-keeper DELETE — id NOT IN (SELECT MIN(id) GROUP BY email)",
    schema: {
      ddl: `CREATE TABLE Person (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);`,
      seed: `INSERT INTO Person (id, email) VALUES
  (1,'john@example.com'),
  (2,'bob@example.com'),
  (3,'john@example.com'),   -- duplicate of id 1
  (4,'ada@example.com'),
  (5,'ada@example.com'),    -- triple: ids 4-6
  (6,'ada@example.com'),
  (7,'eve@example.com'),
  (8,'eve@example.com');    -- pair: ids 7-8`,
      tables: [
        { name: "Person", note: "8 rows — john duplicated once, ada tripled, eve paired; the survivors are ids 1, 2, 4 and 7" },
      ],
    },
    code: `DELETE FROM Person
WHERE id NOT IN (
    SELECT MIN(id)      -- the one survivor per email group
    FROM Person
    GROUP BY email
);`,
    writeVerify: "SELECT id, email FROM Person ORDER BY id;",
    walkthrough: [
      "The subquery groups all 8 rows by email and keeps MIN(id) per group: john → 1, bob → 2, ada → 4, eve → 7. Four ids form the keep-set, computed from a consistent pre-delete snapshot because SQLite materializes the subquery before touching any rows.",
      "NOT IN then scans Person and deletes every row whose id is outside that set — ids 3, 5, 6 and 8, one per surplus member of each duplicate group. Four rows are removed, and the changes count the grader reports should read exactly 4.",
      "Why MIN and not MAX? The spec says keep the smallest id. MAX would compile and run and leave a plausible-looking table — with the wrong survivor in every group, which the post-delete verification (and any audit trail) would catch.",
      "The writeVerify SELECT displays the resulting table: one row per email, ids 1, 2, 4, 7 in id order — precisely the state the grader compares against.",
    ],
    time: "O(n) — one pass to group, one pass to delete",
    space: "O(d) — one survivor id per distinct email",
    followUps: [
      "The read-only twin (#182 Duplicate Emails): list the email values that are duplicated — GROUP BY email HAVING COUNT(*) > 1.",
      "Keep the LATEST sign-up instead (MAX(id)): one keyword changes — predict which ids survive on this seed, then run it.",
    ],
    related: ["classes-more-than-5-students", "the-number-of-employees-which-report-to-each-employee"],
    order: "any",
    xp: 20,
  },
  {
    slug: "second-highest-salary",
    statement:
      "Employee holds one row per employee with their salary; duplicate salary values are normal, since many people can earn the same. Report the second highest DISTINCT salary. If no second distinct value exists — a single employee, or everyone earning the same — the answer is one row containing NULL, never an empty result.",
    examples: [
      {
        input: "Employee: (1,100),(2,200),(3,300)",
        output: "200",
        explanation: "Distinct salaries, descending: 300, 200, 100. The second one is 200.",
      },
      {
        input: "Employee: (1,100),(2,200),(3,300),(4,300),(5,200) — the top values duplicated",
        output: "200",
        explanation: "Duplicates create no new ranks: 300 twice is still one value, so 200 remains the second DISTINCT salary.",
      },
    ],
    constraints: [
      "Employee holds one row per employee; salaries may repeat",
      "'second highest' means second highest DISTINCT value, not the second row",
      "when no second distinct value exists, return one row with NULL",
    ],
    breakdown: [
      "Two traps in one problem. First, DISTINCT: for salaries 300, 300, 200 there is no 'second highest row' of 300 — ranks run over distinct values, so the answer is 200. ORDER BY salary DESC LIMIT 1 OFFSET 1 over the raw table returns 300 and is wrong; the DISTINCT must happen before the skip.",
      "Second, the empty case. If the table holds a single distinct salary, LIMIT/OFFSET matches zero rows — but the caller expects one row containing NULL. A bare SELECT cannot turn 'no rows' into 'a row with a NULL in it'.",
      "The fix is wrapping the query in a scalar subquery: SELECT (SELECT DISTINCT salary ... LIMIT 1 OFFSET 1). A scalar subquery that matches no rows yields NULL by definition, and the outer SELECT projects exactly one row around it. The wrapper is not decoration — it IS the NULL generator. (The MAX-flavored alternative — the largest salary strictly below the global max — is NULL-safe natively, because MAX of an empty set is NULL.)",
    ],
    edges: [
      "All-equal salaries (300, 300, 300) → NULL: the offset walks past the only distinct value.",
      "A duplicated top salary must not shift the answer — DISTINCT before ordering.",
      "An empty table also yields NULL — a scalar subquery over zero rows is NULL.",
      "Exactly one distinct salary → NULL; the OFFSET has nothing to land on.",
    ],
    ladder: [
      { title: "Brute force — sort in app code", body: "Fetch distinct salaries, sort descending, take index 1, emit NULL when the list is short. All three steps are things SQL expresses in one statement." },
      { title: "The pattern — DISTINCT + ORDER BY + LIMIT/OFFSET", body: "'Skip the best, take the next' is exactly LIMIT 1 OFFSET 1 over DISTINCT salary DESC. The OFFSET is the 'second' in 'second highest'." },
      { title: "The optimal idea — the scalar-subquery wrapper", body: "SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1). Zero matches inside → NULL outside, one row always. Equivalent: MAX(salary) WHERE salary < (SELECT MAX(salary))." },
    ],
    approach: "Scalar-subquery wrapper over DISTINCT + LIMIT/OFFSET",
    schema: {
      ddl: `CREATE TABLE Employee (
  id     INTEGER PRIMARY KEY,
  salary INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (id, salary) VALUES
  (1,100),
  (2,200),
  (3,300),
  (4,300),   -- duplicate of the top salary
  (5,200);   -- duplicate of the second salary`,
      tables: [
        { name: "Employee", note: "5 employees but only 3 distinct salaries — 300 and 200 each appear twice; the answer is still 200 (the one-distinct-salary → NULL case is covered in the breakdown text)" },
      ],
    },
    code: `SELECT
    (
        SELECT DISTINCT salary       -- ranks are over distinct VALUES...
        FROM Employee
        ORDER BY salary DESC         -- ...best first...
        LIMIT 1 OFFSET 1             -- ...and we skip the best
    ) AS SecondHighestSalary;        -- zero matches here → NULL, not an empty result`,
    walkthrough: [
      "The inner subquery DISTINCTs the five salaries down to {100, 200, 300}, sorts them descending, skips the top value with OFFSET 1, and returns the next one: 200.",
      "The outer SELECT wraps that scalar result as its single column, aliased SecondHighestSalary. If the inner query had matched nothing — one distinct salary, or an empty table — the scalar subquery evaluates to NULL and the outer row still exists with one cell.",
      "That wrapper is the whole lesson: LIMIT/OFFSET alone returns an empty SET in the NULL case, and an empty set fails a grader expecting one row. Scalar subqueries are the standard SQL idiom for 'a computed value that may be absent'.",
      "The equivalent formulation is worth knowing: SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee) — 'the biggest salary strictly below the biggest'. MAX over an empty group is NULL natively, so it survives the empty case without a wrapper.",
    ],
    time: "O(n log n) — DISTINCT + sort of the salary column",
    space: "O(d) — d distinct salaries in flight",
    followUps: [
      "Generalize to the Nth distinct salary: OFFSET takes n-1 — what does an oversized offset return inside the scalar wrapper?",
      "Rewrite with windows: DENSE_RANK() OVER (ORDER BY salary DESC) = 2 — compare it with RANK() = 2 when the top salary is duplicated on this seed.",
    ],
    related: ["rank-scores", "department-highest-salary", "department-top-three-salaries"],
    order: "any",
    xp: 20,
  },
  {
    slug: "department-highest-salary",
    statement:
      "Employee rows carry each worker's salary and the department they belong to; Department holds the department names. For every department, report its highest-paid employees — all of them: if two people tie for the department max, both appear. Output the department name, the employee name and the salary.",
    examples: [
      {
        input: "Employee: Joe 85000 @IT, Henry 80000 @IT · Max 90000 @Sales, Randy 85000 @Sales",
        output: "IT · Joe · 85000 / Sales · Max · 90000",
        explanation: "Each department's max is computed within that department: 85000 tops IT, 90000 tops Sales; Randy's 85000 ties IT's top but he is in Sales, so he drops out.",
      },
      {
        input: "HR: Nina 70000, Omar 70000",
        output: "HR · Nina · 70000 / HR · Omar · 70000",
        explanation: "A tie at the max keeps BOTH earners — collapsing to one row per department is the classic wrong answer.",
      },
    ],
    constraints: [
      "each employee belongs to exactly one department",
      "all employees tied at the department max are reported",
      "output department name, employee name, salary",
    ],
    breakdown: [
      "The question is per-group extremum WITH membership: for each department find max(salary), then keep every employee who matches it. An aggregate alone cannot do this — GROUP BY departmentId returns the max VALUE but discards WHO earned it, and arbitrarily picking one row per group breaks the tie rule.",
      "The set-based translation: compute the (departmentId, max salary) pairs once in a subquery, then keep employees whose (departmentId, salary) pair is IN that set. SQLite supports row-value comparison, so WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId) reads exactly like the English sentence.",
      "The join to Department is pure naming — it turns departmentId 1 into 'IT'. The tie behavior falls out for free: membership testing has no row limit, so one, two or five max-earners all survive. The trap is any solution that collapses to one row per department (a DISTINCT, a per-group LIMIT, or MAX without a join back to the employee rows).",
    ],
    edges: [
      "Two employees tied at the max BOTH appear — the seed's HR pair pins this.",
      "The max is per-department: Randy's 85000 ties IT's top, but he is in Sales whose max is 90000.",
      "Every department with employees appears, even when its max is a single earner.",
      "Row-value order matters: (departmentId, salary), never (salary, departmentId) — the pairs must align with the subquery's columns.",
    ],
    ladder: [
      { title: "Brute force — two queries per department", body: "For each department, SELECT MAX(salary) WHERE departmentId = ?, then SELECT the employees at that salary. Correct, but two correlated scans per group — O(groups × n)." },
      { title: "The pattern — precompute the max-set, then match", body: "One GROUP BY produces every department's (id, max) pair; the employee table is then filtered against that shared set instead of re-querying per group." },
      { title: "The optimal idea — row-value IN over the max pairs", body: "(departmentId, salary) IN (SELECT departmentId, MAX(salary) ... GROUP BY departmentId), joined to Department for names. The window twin — RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) = 1 — returns the same rows." },
    ],
    approach: "Pair-set membership — (dept, salary) IN (SELECT dept, MAX(salary) GROUP BY dept)",
    schema: {
      ddl: `CREATE TABLE Department (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Employee (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  salary       INTEGER NOT NULL,
  departmentId INTEGER NOT NULL REFERENCES Department(id)
);`,
      seed: `INSERT INTO Department (id, name) VALUES (1,'IT'),(2,'Sales'),(3,'HR');
INSERT INTO Employee (id, name, salary, departmentId) VALUES
  (1,'Joe',85000,1),
  (2,'Henry',80000,1),
  (3,'Sam',60000,2),
  (4,'Max',90000,2),
  (5,'Janet',69000,2),
  (6,'Randy',85000,2),   -- ties IT's top salary but lives in Sales
  (7,'Nina',70000,3),    -- HR tie...
  (8,'Omar',70000,3);    -- ...two max earners`,
      tables: [
        { name: "Department", note: "3 departments" },
        { name: "Employee", note: "8 employees — HR has TWO earners tied at 70000 (both must appear); Randy's 85000 ties IT's top from the wrong department" },
      ],
    },
    code: `SELECT
    d.name   AS department,
    e.name   AS employee,
    e.salary AS salary
FROM Employee e
JOIN Department d ON d.id = e.departmentId
WHERE (e.departmentId, e.salary) IN (
    SELECT departmentId, MAX(salary)   -- each department's max salary...
    FROM Employee
    GROUP BY departmentId              -- ...computed per department
)
ORDER BY d.name, e.salary DESC;`,
    walkthrough: [
      "The subquery aggregates Employee to one row per department: (1, 85000), (2, 90000), (3, 70000). These three pairs are the 'department max' set, computed in a single grouping pass.",
      "The WHERE clause tests each employee's (departmentId, salary) pair against that set — a row-value IN, the two-column extension of the scalar IN you already know. Joe's (1, 85000) matches; Henry's (1, 80000) does not; Nina and Omar's (3, 70000) BOTH match, because membership has no row limit — that is what keeps ties alive.",
      "The JOIN to Department contributes only the department name — without it you would print opaque ids. It is an inner join, safe because every employee's departmentId resolves to a department row.",
      "Four rows come out: Joe (IT), Max (Sales), Nina and Omar (HR). ORDER BY department then salary DESC is presentational; the grader compares the rows as a set.",
    ],
    time: "O(n log n) — one grouping pass, then membership probes",
    space: "O(d) — one max pair per department",
    followUps: [
      "Rewire with windows: RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) = 1 — confirm it returns the same four rows on this seed.",
      "Department Top Three Salaries (#185) extends the idea to the top three distinct ranks per department — DENSE_RANK earns its keep there.",
    ],
    related: ["second-highest-salary", "department-top-three-salaries"],
    order: "any",
    xp: 20,
  },
  {
    slug: "rank-scores",
    statement:
      "Scores holds one row per contestant with their score, and values repeat freely. Rank every row: the highest score gets rank 1, equal scores share the same rank, and a gap follows a tie — the next distinct score's rank jumps past the rows already used. Output each score next to its rank.",
    examples: [
      {
        input: "Scores: (1,3.50),(2,3.65),(3,4.00),(4,3.85),(5,4.00),(6,3.65) — the official six",
        output: "4.00 · 1 / 4.00 · 1 / 3.85 · 3 / 3.65 · 4 / 3.65 · 4 / 3.50 · 6",
        explanation: "The two 4.00s share rank 1; 3.85 is rank 3 — not 2 — because two rows finished above it. The gap is what RANK means.",
      },
      {
        input: "extend the table with (7,4.00) and (8,3.50) — the seed's trap rows",
        output: "the 4.00 trio shares rank 1 and 3.85 drops to rank 4; the 3.50 pair shares rank 7",
        explanation: "Bigger ties stretch the gaps further: three rows at the top push the next distinct score to rank 4.",
      },
    ],
    constraints: [
      "scores repeat freely; one output row per input row",
      "equal scores share a rank; the rank after a tie skips ahead by the tie size",
      "output columns: score, rank",
    ],
    breakdown: [
      "This is the canonical RANK() showcase. The three ranking siblings differ only in tie handling: ROW_NUMBER gives every row a fresh number (1,2,3…), RANK gives ties the same number and then skips (1,1,3), DENSE_RANK gives ties the same number without skipping (1,1,2). The spec — share a rank, then jump — is RANK's exact contract.",
      "RANK() OVER (ORDER BY score DESC) is the entire computation: the window's ORDER BY defines the ranking order (best first), and because there is no PARTITION BY, all rows form one ranking group. A window function decorates rows without collapsing them, so the output keeps one row per contestant — GROUP BY score would merge the tied rows and break the contract.",
      "Side note on naming: 'rank' is a perfectly legal column alias in SQLite — no quoting required — and ORDER BY can reference it like any other output column.",
    ],
    edges: [
      "Two 4.00s → both rank 1; the next distinct score is 3 (two rows precede it).",
      "A three-way tie (the added 4.00) leaves a gap of three — 3.85 lands at rank 4.",
      "DENSE_RANK would output 1,1,1,4,5,5,7,7-shaped numbers with NO gaps and fail; ROW_NUMBER would output 1..6…1..8 flat.",
      "No PARTITION BY here — adding one by accident would restart the numbering per score value.",
    ],
    ladder: [
      { title: "Brute force — hand-rolled ranking", body: "Sort scores descending in app code, walk the list assigning numbers and skipping after ties. Reimplementing RANK by hand is educational exactly once." },
      { title: "The pattern — window function with OVER (ORDER BY)", body: "'Rank the rows by this ordering' maps one-to-one onto RANK() OVER (ORDER BY score DESC). The OVER clause is where the ranking semantics live." },
      { title: "The optimal idea — RANK, aliased, sorted", body: "SELECT score, RANK() OVER (ORDER BY score DESC) AS rank FROM Scores. One sort, one numbering pass — nothing further to optimize." },
    ],
    approach: "Window ranking — RANK() OVER (ORDER BY score DESC)",
    schema: {
      ddl: `CREATE TABLE Scores (
  id    INTEGER PRIMARY KEY,
  score REAL NOT NULL
);`,
      seed: `INSERT INTO Scores (id, score) VALUES
  (1,3.50),
  (2,3.65),
  (3,4.00),
  (4,3.85),
  (5,4.00),   -- official tie pair begins here
  (6,3.65),
  (7,4.00),   -- trap: makes the top tie a TRIPLE
  (8,3.50);   -- trap: pairs the bottom score`,
      tables: [
        { name: "Scores", note: "8 rows — a three-way tie at 4.00 and a pair at 3.50 make the rank gaps visible" },
      ],
    },
    code: `SELECT
    score,
    RANK() OVER (ORDER BY score DESC) AS rank   -- ties share a rank, then GAP
FROM Scores
ORDER BY rank, score DESC;`,
    walkthrough: [
      "The window sorts all eight rows by score DESC — 4.00, 4.00, 4.00, 3.85, 3.65, 3.65, 3.50, 3.50 — and numbers them with the RANK rule: ties share a number, then skip past the rows consumed.",
      "The three 4.00s occupy positions 1-3 collectively, so all three display rank 1; 3.85 lands at rank 4; the 3.65 pair shares positions 5-6 and both display 5; the 3.50 pair displays 7. Gaps grow with tie size — the fingerprint that separates RANK from DENSE_RANK.",
      "Because a window function decorates rows without collapsing them, the output has exactly eight rows, one per contestant. GROUP BY score would have fused the tied rows and shrunk the table.",
      "ORDER BY rank, score DESC presents the leaderboard top-down; grading treats the rows as a set, so the ordering is courtesy, not correctness.",
    ],
    time: "O(n log n) — the window's sort",
    space: "O(n) — the sorted window",
    followUps: [
      "Run DENSE_RANK and ROW_NUMBER beside RANK on this seed — one query, three columns, a permanent cheat sheet for the siblings.",
      "Partitioned variant: add a league column and PARTITION BY it — watch the numbering restart inside each partition.",
    ],
    related: ["department-highest-salary", "second-highest-salary", "department-top-three-salaries"],
    order: "any",
    xp: 20,
  },
  {
    slug: "classes-more-than-5-students",
    statement:
      "Courses records one row per (student, class) enrollment. List every class that has at least five students. Report just the class name.",
    examples: [
      {
        input: "Courses: Math ×6 (A, C, E, G, H, I) · English ×1 (B) · Biology ×1 (D) · Computer ×1 (F)",
        output: "Math",
        explanation: "Math is the only class with six enrollments — at least five; the others have one.",
      },
      {
        input: "Physics with exactly 5 enrollments · Art with 4",
        output: "Physics (yes) · Art (no)",
        explanation: "'At least five' includes five itself — HAVING COUNT(*) >= 5, not > 5. Art misses by exactly one.",
      },
    ],
    constraints: [
      "each (student, class) pair appears at most once",
      "a class qualifies at 5 or more enrolled students",
      "output the class name only",
    ],
    breakdown: [
      "'Count per group, then filter by the group total' is the GROUP BY + HAVING poster child. WHERE filters ROWS before grouping; HAVING filters GROUPS after aggregation — and 'classes with at least five students' is a condition on groups, so HAVING is not stylistic preference, it is the only correct clause.",
      "GROUP BY class collapses the enrollments into one group per class, COUNT(*) tallies each group's rows, and HAVING COUNT(*) >= 5 keeps only the big ones. Putting COUNT(*) >= 5 into WHERE is a hard error — aggregates do not exist yet before grouping. Remembering which clause owns aggregate conditions is the entire lesson of this problem.",
      "COUNT(*) counts enrollment rows; COUNT(DISTINCT student) counts distinct people. With the pair-uniqueness constraint they agree — but in messier data a student enrolled twice in one class would split them, and the DISTINCT form is the defensive choice worth knowing before a follow-up asks.",
    ],
    edges: [
      "Boundary: exactly 5 qualifies (>=, not >) — the seed's Physics class pins this.",
      "A class of 4 stays out — Art is the near-miss control row.",
      "Output only the class name — leaking a count column fails the grader.",
      "Ties between qualifying classes: any order is accepted.",
    ],
    ladder: [
      { title: "Brute force — tally in a map", body: "Pull all rows, accumulate class → count in application code, filter by value. An application-side GROUP BY + HAVING, one round-trip per concern." },
      { title: "The pattern — aggregate, then filter groups", body: "GROUP BY class + HAVING COUNT(*) >= 5. Naming the WHERE-vs-HAVING split out loud is the interview point of this problem." },
      { title: "The optimal idea — one grouping pass", body: "A single GROUP BY with a HAVING predicate. With an index on (class, student) the engine can even count without a full sort." },
    ],
    approach: "GROUP BY + HAVING COUNT(*) >= 5",
    schema: {
      ddl: `CREATE TABLE Courses (
  student TEXT NOT NULL,
  class   TEXT NOT NULL
);`,
      seed: `INSERT INTO Courses (student, class) VALUES
  ('A','Math'),('B','English'),('C','Math'),('D','Biology'),('E','Math'),
  ('F','Computer'),('G','Math'),('H','Math'),('I','Math'),
  ('P1','Physics'),('P2','Physics'),('P3','Physics'),('P4','Physics'),('P5','Physics'),
  ('A1','Art'),('A2','Art'),('A3','Art'),('A4','Art');`,
      tables: [
        { name: "Courses", note: "18 enrollments — Math has 6, Physics exactly 5 (the boundary), Art 4 (the near-miss), plus three one-off classes" },
      ],
    },
    code: `SELECT
    class
FROM Courses
GROUP BY class
HAVING COUNT(*) >= 5        -- group-level filter: runs AFTER aggregation
ORDER BY class;`,
    walkthrough: [
      "GROUP BY class fans the 18 enrollment rows into six groups — one per distinct class name. Each group is the set of rows sharing that class.",
      "COUNT(*) measures every group's size: Math 6, Physics 5, Art 4, and 1 each for English, Biology and Computer.",
      "HAVING then keeps the groups of size 5 or more — Math and Physics. The boundary matters: >= admits Physics; a careless > 5 drops exactly the class the grader is checking.",
      "The SELECT list carries only class, so the output is the two names and nothing else; the grader accepts any order.",
    ],
    time: "O(n) with a hash grouping, O(n log n) with a sort — tiny either way",
    space: "O(c) — one row per distinct class",
    followUps: [
      "Count DISTINCT students instead of rows: build a seed where one student enrolls twice in a class and show the two counts diverge.",
      "Also report the counts, ordered descending — a class-size leaderboard; then filter with a parameterized threshold.",
    ],
    related: ["group-sold-products-by-the-date", "the-number-of-employees-which-report-to-each-employee"],
    order: "any",
    xp: 10,
  },
  {
    slug: "group-sold-products-by-the-date",
    statement:
      "Activities logs each product sale with its sell date; the same product can sell many times on one date. For each date, report how many DISTINCT products were sold and the names of those products comma-joined in alphabetical order. Output columns: sell_date, num_sold, products.",
    examples: [
      {
        input: "Activities: 2020-05-30 sold Headphone, Basketball, T-Shirt · 2020-06-01 sold Pencil, Bible · 2020-06-02 sold Mask three times",
        output: "2020-05-30 · 3 · Basketball,Headphone,T-Shirt / 2020-06-01 · 2 · Bible,Pencil / 2020-06-02 · 1 · Mask",
        explanation: "Mask's three rows collapse to one distinct product; each name list is alphabetical and joined with bare commas.",
      },
      {
        input: "2020-06-01 also sold Mask — twice",
        output: "2020-06-01 · 3 · Bible,Mask,Pencil",
        explanation: "DISTINCT is per (date, product): Mask already counted on 06-02 counts separately here, and within the date it counts once.",
      },
    ],
    constraints: [
      "one row per sale; (sell_date, product) may repeat",
      "num_sold counts distinct products per date; products is the comma-joined distinct names",
      "one output row per distinct sell_date",
    ],
    breakdown: [
      "Two aggregates at once: COUNT(DISTINCT product) for the tally and GROUP_CONCAT(DISTINCT product) for the name list. GROUP_CONCAT is SQLite's string-aggregation primitive — it concatenates each group's values with ',' (the default separator) — the same job MySQL's GROUP_CONCAT or Postgres' string_agg does.",
      "The portability trap: GROUP_CONCAT has NO guaranteed output order in any engine — it concatenates in whatever order rows arrive at the aggregate. The fix used here is to pre-sort inside a subquery (GROUP BY sell_date, product, then ORDER BY sell_date, product), so the outer aggregation receives a deduped, alphabetically-sorted stream and the concatenated names land in order. SQLite 3.44+ also accepts an ORDER BY inside the aggregate itself, but the subquery form is the idiom every engine and every planner honors.",
      "Why dedupe in the subquery at all, when GROUP_CONCAT(DISTINCT ...) already dedupes? Because the early GROUP BY (sell_date, product) collapses the stream to exactly one row per pair BEFORE sorting pins the order — count and concat then provably agree, and the result no longer depends on scan luck.",
    ],
    edges: [
      "Duplicate (date, product) rows — Mask ×3 on 06-02 — count once.",
      "The same product on different dates counts once per date: distinctness lives inside the group.",
      "The separator defaults to ',' with no spaces — 'Bible,Mask,Pencil', not 'Bible, Mask, Pencil'.",
      "Without the pre-sort, SQLite's concat order follows scan order — this seed's insertion order ('Headphone' before 'Basketball') would leak straight into the output.",
    ],
    ladder: [
      { title: "Brute force — build the lists in app code", body: "SELECT rows ordered by date, accumulate per-date lists in a map, join with commas. Works, but string aggregation is exactly what GROUP_CONCAT exists for." },
      { title: "The pattern — one grouping, two aggregates", body: "GROUP BY sell_date with COUNT(DISTINCT product) and GROUP_CONCAT(DISTINCT product): the tally and the name list come out of a single grouping pass." },
      { title: "The optimal idea — sort BEFORE you aggregate", body: "Dedupe and sort in an inner subquery, aggregate in the outer query — deterministic alphabetical lists on any engine that honors a subquery's ORDER BY." },
    ],
    approach: "Pre-sorted subquery + COUNT(DISTINCT) / GROUP_CONCAT(DISTINCT)",
    schema: {
      ddl: `CREATE TABLE Activities (
  sell_date DATE NOT NULL,
  product   TEXT NOT NULL
);`,
      seed: `INSERT INTO Activities (sell_date, product) VALUES
  ('2020-05-30','Headphone'),   -- deliberately inserted out of
  ('2020-06-01','Pencil'),      -- alphabetical order to expose
  ('2020-06-02','Mask'),        -- any scan-order leakage
  ('2020-05-30','Basketball'),
  ('2020-06-01','Bible'),
  ('2020-06-02','Mask'),        -- Mask again, same date
  ('2020-05-30','T-Shirt'),
  ('2020-06-01','Mask'),        -- Mask on a DIFFERENT date...
  ('2020-06-01','Mask');        -- ...twice`,
      tables: [
        { name: "Activities", note: "9 sales across 3 dates — Mask sells on all three dates and twice on 06-01, so dedup must be per (date, product)" },
      ],
    },
    code: `SELECT
    sell_date,
    COUNT(DISTINCT product)        AS num_sold,
    GROUP_CONCAT(DISTINCT product) AS products
FROM (
    -- dedupe to one row per (date, product) AND fix the arrival order:
    -- GROUP_CONCAT concatenates in scan order, so the sort must happen
    -- BEFORE the aggregation (portable across engines)
    SELECT sell_date, product
    FROM Activities
    GROUP BY sell_date, product
    ORDER BY sell_date, product
) sold
GROUP BY sell_date
ORDER BY sell_date;`,
    walkthrough: [
      "The inner subquery collapses Activities to one row per (sell_date, product) — Mask's three rows on 06-02 and two on 06-01 each become one — and sorts the stream by date, then product name.",
      "The outer GROUP BY sell_date consumes that stream date by date. Because it is pre-sorted, each date's products arrive alphabetically, and GROUP_CONCAT joins them with the default bare-comma separator.",
      "COUNT(DISTINCT product) is now belt-and-braces — the subquery already deduped — but keeping DISTINCT makes the query robust if someone later simplifies the inner GROUP BY away.",
      "Without the subquery's ORDER BY the grouping would still work, but the concatenation would follow scan order: this seed inserts 'Headphone' before 'Basketball', so the unsorted variant leaks that into products and fails a strict comparison. Sort-then-aggregate is the discipline.",
    ],
    time: "O(n log n) — the dedupe + sort dominates",
    space: "O(d) — d distinct (date, product) pairs",
    followUps: [
      "Swap the separator: GROUP_CONCAT(product, '; ') — when does a custom separator matter in real exports?",
      "Products sold on EVERY day: GROUP BY product HAVING COUNT(DISTINCT sell_date) = (number of distinct dates) — relational division, the cousin of this query.",
    ],
    related: ["classes-more-than-5-students", "movie-rating"],
    order: "any",
    xp: 10,
  },
  {
    slug: "immediate-food-delivery-ii",
    statement:
      "Delivery logs each food order with the date it was placed (order_date) and the date the customer preferred (customer_pref_delivery_date). An order is immediate when it was placed on the preferred date itself, and scheduled otherwise. Considering each customer's FIRST order only, report the percentage of first orders that were immediate — rounded to two decimals, as immediate_percentage.",
    examples: [
      {
        input: "Customer 1: first order 2019-08-01, preferred 2019-08-02 (scheduled) · Customer 2: first 2019-08-02 = preferred (immediate) · Customer 3: first 2019-08-21 (scheduled — their 08-24 order is NOT first) · Customer 4: first order immediate",
        output: "50.0",
        explanation: "First orders: 1 scheduled, 2 immediate, 3 scheduled, 4 immediate → 2 of 4 = 50.00%. Customer 3 is the trap: first means MIN(order_date), not the lowest delivery_id.",
      },
      {
        input: "add customer 5 (first order immediate) and customer 6 (rows stored newest-first; first date 2019-09-01, immediate)",
        output: "66.67",
        explanation: "4 of 6 first orders are immediate → 66.666…% → 66.67 after rounding.",
      },
    ],
    constraints: [
      "a customer's first order is their MIN(order_date)",
      "immediate ⇔ order_date = customer_pref_delivery_date",
      "one row out: immediate_percentage = 100 × immediate first orders / customers, rounded to 2dp",
    ],
    breakdown: [
      "Reading order matters: 'for each customer's first order' comes before any percentage. Stage one is per-customer: find MIN(order_date), keep that single row, and test order_date = customer_pref_delivery_date on it. Computing the percentage over ALL rows first is the trap — customer 3's 08-24 delivery is immediate but is NOT their first order, so it must not vote.",
      "Stage two is a ratio over one row per customer: SUM(first-order-is-immediate) / COUNT(*). In SQLite a boolean comparison evaluates to 1 or 0, so SUM(order_date = customer_pref_delivery_date) totals the immediate first orders. And the multiplier must be 100.0, not 100 — integer/integer division truncates, and 4/6 in pure integers is 0 before any rounding can save it.",
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, delivery_id) numbers each customer's rows 1, 2, 3… in date order; rn = 1 IS the first order — the window spelling of the GROUP BY customer_id + MIN(order_date) subquery. The delivery_id tiebreak keeps the pick deterministic if a customer ever has two rows on the same first date, and it guarantees exactly one row per customer where a MIN-join could double-count.",
    ],
    edges: [
      "First = earliest ORDER DATE, not smallest delivery_id — customer 3's ids run opposite to their dates.",
      "4/6 = 66.666…% → ROUND(..., 2) = 66.67; integer division would report 0.",
      "One row per customer: ROW_NUMBER (not RANK) guarantees exactly one rn = 1 even with same-day ties.",
      "The denominator is customers, not deliveries — six customers across eleven rows.",
    ],
    ladder: [
      { title: "Brute force — per customer in app code", body: "Loop customers, fetch their orders, sort by date, test the first row, accumulate two counters. Three nested concerns hand-rolled outside the database." },
      { title: "The pattern — reduce to one row per customer, then aggregate", body: "CTE stage 1: pick each customer's first order (window or GROUP BY MIN). Stage 2: turn its immediate flag into a percentage. Two passes, each independently checkable." },
      { title: "The optimal idea — ROW_NUMBER + boolean ratio", body: "ROW_NUMBER partitioned by customer filtered to rn = 1, then ROUND(100.0 * SUM(flag) / COUNT(*), 2). O(n log n) for the partition sort, one exact row per customer." },
    ],
    approach: "Per-customer first order via ROW_NUMBER, then a boolean ratio",
    schema: {
      ddl: `CREATE TABLE Delivery (
  delivery_id                 INTEGER PRIMARY KEY,
  customer_id                 INTEGER NOT NULL,
  order_date                  TEXT NOT NULL,
  customer_pref_delivery_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Delivery (delivery_id, customer_id, order_date, customer_pref_delivery_date) VALUES
  (1, 1, '2019-08-01', '2019-08-02'),   -- c1 first: scheduled
  (2, 2, '2019-08-02', '2019-08-02'),   -- c2 first: immediate
  (3, 1, '2019-08-11', '2019-08-12'),   -- c1 later order (ignored)
  (4, 3, '2019-08-24', '2019-08-24'),   -- c3: immediate but NOT first (id trap)
  (5, 3, '2019-08-21', '2019-08-22'),   -- c3 first: scheduled
  (6, 2, '2019-08-20', '2019-08-20'),   -- c2 later (ignored)
  (7, 4, '2019-08-09', '2019-08-09'),   -- c4 first: immediate
  (8, 5, '2019-08-03', '2019-08-03'),   -- c5 first: immediate
  (9, 5, '2019-08-05', '2019-08-06'),   -- c5 later (ignored)
  (10, 6, '2019-09-10', '2019-09-11'),  -- c6: stored BEFORE the first date...
  (11, 6, '2019-09-01', '2019-09-01');  -- c6 first: immediate (date < id)`,
      tables: [
        { name: "Delivery", note: "11 deliveries, 6 customers — customer 3's first ORDER (08-21) is not their lowest id (4); customer 6's rows are stored newest-first" },
      ],
    },
    code: `WITH ranked AS (
    -- number each customer's deliveries by order date: rn = 1 IS the first order
    SELECT
        customer_id,
        order_date,
        customer_pref_delivery_date,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY order_date, delivery_id   -- date first; id breaks same-day ties
        ) AS rn
    FROM Delivery
)
SELECT
    ROUND(
        100.0 * SUM(order_date = customer_pref_delivery_date)  -- 1 if immediate
              / COUNT(*)                                       -- one row = one customer
    , 2) AS immediate_percentage
FROM ranked
WHERE rn = 1;`,
    walkthrough: [
      "ranked decorates all eleven rows with a per-customer sequence ordered by order_date — customer 3's 08-21 row gets rn = 1 even though delivery_id 5 > 4, because ordering is by DATE, not id. Customer 6's 09-01 row wins the same way despite being stored second.",
      "WHERE rn = 1 keeps exactly one row per customer — six rows. That is the 'first order' population, and each of them contributes one unit to the denominator.",
      "On those six rows, order_date = customer_pref_delivery_date evaluates to 1 or 0: customers 2, 4, 5 and 6 are immediate (1), customers 1 and 3 are scheduled (0). SUM totals 4 — and note customer 3's OTHER row, an immediate 08-24 delivery, never gets a vote.",
      "100.0 * 4 / 6 = 66.666…, ROUND(..., 2) → 66.67, aliased immediate_percentage. The .0 in 100.0 is not cosmetic: without it SQLite divides integers and reports 0, and the grader sees a wrong number that still 'looks like a percentage'.",
    ],
    time: "O(n log n) — the PARTITION BY sort",
    space: "O(n) — the ranked CTE",
    followUps: [
      "Immediate Food Delivery I (#1173) asks the same immediate percentage over ALL orders — drop the rn filter and explain why the number moves.",
      "Per-customer immediate rate as a listing — GROUP BY customer_id with AVG of the boolean, ordered worst-first.",
    ],
    related: ["immediate-food-delivery-i", "rank-scores"],
    order: "any",
    xp: 20,
  },
];
