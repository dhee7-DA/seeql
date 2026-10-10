// Deep-dives — the SQL 50+ expansion: strings & CASE additions (3 problems,
// one of them a write). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_STRINGS: LcSqlDive[] = [
  {
    slug: "invalid-tweets",
    statement:
      "Tweets holds one row per post with its content. A tweet is invalid when its content is strictly longer than 15 characters. Report the ids of all invalid tweets.",
    examples: [
      {
        input: "Tweets: (1,'Vote for Boris'),(2,'Let us make coding great again!')",
        output: "2",
        explanation: "Tweet 1 is 14 characters — under the limit, so it's valid. Tweet 2 is 31 and invalid.",
      },
    ],
    constraints: ["content length counts every character including spaces", "strictly longer than 15 — exactly 15 is valid", "output: single column tweet_id"],
    breakdown: [
      "The whole task is one row-level predicate: LENGTH(content) > 15. No grouping, no joining — a filter. Problems this small are where clause-choice (WHERE vs HAVING) and boundary semantics (strict >) get tested, not query architecture. The seed's four rows split two-and-two across the line — 14 and 15 stay, 31 and 40 go — so a single mistyped operator visibly reshuffles half the answer.",
      "LENGTH in SQLite counts CHARACTERS of a TEXT value, which matches how a tweet limit works. In other engines LENGTH can mean bytes (Oracle) — multibyte content then breaks the count. Knowing your dialect's length function is the real content of this problem.",
      "The boundary is the test: exactly 15 characters is VALID because the rule says strictly longer. The seed plants tweet 3 ('Fifteen chars!!') precisely on the line at 15 characters — with a >= comparison it would wrongly join the invalid list, failing a test case written for exactly this purpose. Checking the boundary row against the spec, not just the obviously-long ones, is the habit that catches these.",
    ],
    edges: [
      "Strictly longer: > 15, not >= 15 — the 15-character tweet must survive.",
      "Spaces count toward the length.",
      "SQLite LENGTH is character-based for TEXT — byte-based in some other dialects.",
    ],
    ladder: [
      { title: "Brute force — measure in code", body: "SELECT everything, check content.length > 15 in the app. Works; pushes a filter the database can do for free over the wire." },
      { title: "The pattern — LENGTH in WHERE", body: "WHERE LENGTH(content) > 15. The predicate runs per row during the scan; only invalid tweets leave the engine." },
      { title: "The optimal idea — it's already optimal", body: "O(n) single scan. The only thinking is boundary direction and character-vs-byte semantics." },
    ],
    approach: "LENGTH predicate in WHERE",
    schema: {
      ddl: `CREATE TABLE Tweets (
  tweet_id INTEGER PRIMARY KEY,
  content  TEXT NOT NULL
);`,
      seed: `INSERT INTO Tweets (tweet_id, content) VALUES
  (1,'Vote for Boris'),
  (2,'Let us make coding great again!'),
  (3,'Fifteen chars!!'),(4,'this one is way way too long to be valid');`,
      tables: [{ name: "Tweets", note: "tweet 3 is exactly 15 chars — the boundary case" }],
    },
    code: `SELECT
    tweet_id
FROM Tweets
WHERE LENGTH(content) > 15;      -- strictly longer than the limit`,
    walkthrough: [
      "LENGTH measures each row's content: 14, 31, 15, 40 characters for tweets 1–4.",
      "The predicate keeps rows with length strictly above 15: tweets 2 and 4.",
      "Tweet 3 sits exactly ON the limit (15) and survives — the boundary case the seed was built to catch.",
    ],
    time: "O(n) — one scan with a length check",
    space: "O(k) — the invalid rows' ids",
    followUps: [
      "Return the content truncated to 15 characters plus an ellipsis — SUBSTR(content, 1, 15) || '…'.",
      "Index it: would an expression index on LENGTH(content) help, or is a scan inevitable?",
    ],
    related: ["fix-product-name-format", "calculate-special-bonus"],
    order: "any",
    xp: 10,
  },
  {
    slug: "calculate-special-bonus",
    statement:
      "Employees holds id, name and salary. Pay a special bonus equal to 100% of salary — but only to employees whose id is ODD and whose name does NOT start with 'M'. Everyone else's bonus is 0. Report employee_id, name and bonus.",
    examples: [
      {
        input: "(2,'Meir',3000) — even id, bonus 0 · (3,'Michael',1500) — odd but name starts with M, bonus 0 · (7,'Addilyn',7400) — odd, no M → bonus 7400",
        output: "one row per employee with their bonus",
        explanation: "Both conditions must hold; failing either one zeroes the bonus.",
    },
    ],
    constraints: ["odd id = id % 2 = 1", "names starting with 'M' (uppercase) never get the bonus", "output columns: employee_id, name, bonus, all employees"],
    breakdown: [
      "One CASE expression IS the business rule: WHEN id is odd AND name avoids 'M' THEN salary ELSE 0. Conditional logic belongs in the SELECT when it produces a value per row — this is CASE's native habitat, no joins or groups anywhere. The seed exercises the outcome grid: odd + M (Michael) and even + non-M both fall to ELSE 0, while odd + non-M (Addilyn) collects the salary — two conditions, four combinations, one expression.",
      "The name test is LIKE 'M%' — anchored at the start. A name CONTAINING M (like 'Ramina') still qualifies; only the first character matters. LIKE patterns are sentences: 'M%' reads 'starts with M', '%M%' would read 'contains M' — different contracts.",
      "Parity via id % 2 = 1 is dialect-neutral (MOD(id, 2) elsewhere). Note the trap in NOT (odd AND no-M): an id that's even with a non-M name still gets 0 — the ELSE branch, not a NULL. With no ELSE, CASE returns NULL and a bonus column of NULLs would fail the grader.",
    ],
    edges: [
      "Both conditions required — AND, not two separate CASEs.",
      "LIKE 'M%' anchors the M at the start; '%M%' would be wrong.",
      "ELSE 0 — never let the bonus column go NULL.",
    ],
    ladder: [
      { title: "Brute force — two passes", body: "UPDATE everyone's bonus to 0, then UPDATE the qualifying subset to salary. Two writes where one CASE computes the same column read-only." },
      { title: "The pattern — CASE in the SELECT", body: "One scan, one expression: WHEN id % 2 = 1 AND name NOT LIKE 'M%' THEN salary ELSE 0." },
      { title: "The optimal idea — pure projection", body: "O(n), no writes, no filtering — every employee appears, each with a computed bonus. The SELECT-clause CASE is the cleanest expression of row-conditional values." },
    ],
    approach: "Single CASE expression with an anchored NOT LIKE",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name, salary) VALUES
  (2,'Meir',3000),(3,'Michael',1500),(7,'Addilyn',7400),(8,'Juan',6100),(9,'Kannon',7700);`,
      tables: [{ name: "Employees", note: "5 employees — two disqualified by design" }],
    },
    code: `SELECT
    employee_id,
    name,
    CASE
        WHEN employee_id % 2 = 1 AND name NOT LIKE 'M%'
        THEN salary        -- odd id and a name that doesn't start with M
        ELSE 0             -- everyone else: no bonus (0, never NULL)
    END AS bonus
FROM Employees
ORDER BY employee_id;`,
    walkthrough: [
      "Meir (id 2): even → ELSE 0. Michael (id 3): odd but 'Michael' starts with M → the NOT LIKE fails → ELSE 0.",
      "Addilyn (7, odd, no M) → 7400. Juan (8): even → 0. Kannon (9): odd, 'Kannon' contains no leading M → 7700.",
      "Every employee appears with a concrete number — the ELSE 0 branch is what keeps the column total and the grader happy.",
    ],
    time: "O(n) — one scan, per-row expression",
    space: "O(n) — one output row per employee",
    followUps: [
      "Make it a write: UPDATE Employees SET salary = CASE WHEN … THEN salary * 2 ELSE salary END — compare with the read version.",
      "Case-insensitive names: how does SQLite's LIKE case behavior change the 'M' rule for 'michael'?",
    ],
    related: ["swap-salary", "invalid-tweets"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "swap-salary",
    statement:
      "Salary holds one row per person with their name and sex ('m' or 'f'). In one UPDATE statement, swap the values: every 'm' becomes 'f' and every 'f' becomes 'm'. Nothing else may change.",
    examples: [
      {
        input: "(1,'Aisha','f'),(2,'Boris','m'),(3,'Chen','f')",
        output: "after the update: Aisha 'm', Boris 'f', Chen 'm' — 3 rows affected",
        explanation: "Every row flips; the writeVerify SELECT reports the post-update table.",
      },
    ],
    constraints: ["a single UPDATE statement only", "sex values are exactly 'm' and 'f'", "the grader checks the post-update rows and the affected-row count"],
    breakdown: [
      "The naive instinct — UPDATE SET sex = 'f' WHERE sex = 'm' followed by the reverse — violates the one-statement rule AND destroys the data: after the first pass, 'm' rows are 'f', and the second pass flips them right back. Immutable-in-one-statement is the whole puzzle.",
      "The single-statement answer computes each row's NEW value from its OLD value inside one SET: sex = CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END. The CASE reads the pre-update row while producing the post-update value — every row is transformed simultaneously, so nothing flips twice.",
      "This is the write-problem sibling of the bonus problem's CASE — same expression, applied as a mutation. Write problems add two grading duties: the rows you changed (writeVerify SELECT) and how many you changed (the affected count, expected to equal every row in the table).",
    ],
    edges: [
      "One statement only — two sequential UPDATEs are both illegal and wrong.",
      "The ELSE branch must flip 'f' → 'm' (not keep it): every row changes.",
      "The grader compares post-write rows AND the affected count.",
    ],
    ladder: [
      { title: "Brute force — two UPDATEs through a temp value", body: "Swap via a third value ('x'): three statements, or a temp column. Legal in batch scripts, illegal here — and each extra write is a failure mode." },
      { title: "The pattern — self-inverse CASE in one SET", body: "SET sex = CASE WHEN sex='m' THEN 'f' ELSE 'm' END. Each row reads its old value exactly once and writes its new value." },
      { title: "The optimal idea — simultaneous per-row transform", body: "O(n) single pass. The mental model: UPDATE assigns every row its new value in one atomic sweep — there is no 'order' between rows to exploit or trip on." },
    ],
    approach: "One UPDATE with a self-inverse CASE in SET",
    schema: {
      ddl: `CREATE TABLE Salary (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sex  TEXT NOT NULL
);`,
      seed: `INSERT INTO Salary (id, name, sex) VALUES
  (1,'Aisha','f'),(2,'Boris','m'),(3,'Chen','f'),(4,'Dmitri','m');`,
      tables: [{ name: "Salary", note: "4 rows — all must flip" }],
    },
    code: `UPDATE Salary
SET sex = CASE
    WHEN sex = 'm' THEN 'f'    -- read the OLD value, write the NEW one
    ELSE 'm'                   -- 'f' flips too — every row changes
END;`,
    writeVerify: `SELECT id, name, sex FROM Salary ORDER BY id;`,
    walkthrough: [
      "The UPDATE sweeps all 4 rows in one pass: Aisha 'f'→'m', Boris 'm'→'f', Chen 'f'→'m', Dmitri 'm'→'f'.",
      "The CASE evaluates against each row's pre-update value, so there's no double-flip — the 'simultaneous' semantics of a single statement make the swap safe.",
      "writeVerify SELECTs the whole table post-write: the grader sees every flipped row plus the affected count of 4.",
    ],
    time: "O(n) — one update pass over every row",
    space: "O(1) — no extra storage beyond the write",
    followUps: [
      "SQLite's IIF(sex='m','f','m') compresses the CASE to one line — when is the verbose form still better?",
      "Swap two NUMERIC columns' values in one statement — same trick, different data type.",
    ],
    related: ["calculate-special-bonus", "delete-duplicate-emails"],
    order: "any",
    xp: 10,
  },
];
