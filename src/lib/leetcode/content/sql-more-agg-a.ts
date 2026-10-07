// Deep-dives — the SQL 50+ expansion: aggregation & reporting, part A
// (5 problems). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_AGG_A: LcSqlDive[] = [
  {
    slug: "game-play-analysis-i",
    statement:
      "Activity logs every game session: player, device, date, and games played that session. For each player, report the date of their very first login.",
    examples: [
      {
        input: "Activity: (1,'2016-03-01',5),(1,'2016-05-02',6),(2,'2017-06-25',1),(3,'2016-03-02',0),(3,'2018-07-03',5)",
        output: "1 · 2016-03-01 / 2 · 2017-06-25 / 3 · 2016-03-02",
        explanation: "Player 1 played twice; only the earliest date survives. Player 3's later 2018 session is ignored.",
      },
    ],
    constraints: ["a player may log in many times", "output columns: player_id, first_login, one row per player"],
    breakdown: [
      "'First X per group' is the hello-world of aggregation: collapse the table to one row per player with MIN(event_date). No join, no window function — GROUP BY alone answers it, and reaching for something fancier is the beginner's tell.",
      "MIN works on dates because ISO 'YYYY-MM-DD' strings sort lexicographically in exactly calendar order. The moment dates become free-form text ('Mar 3, 2016'), that guarantee dies — which is why the schema stores dates canonically.",
      "One output row per player means the grain of the report is the player. Deciding the grain first, then picking the aggregate that fits it, is the reliable order of operations for every reporting query.",
    ],
    edges: [
      "One row per player, even for players with a single session.",
      "MIN over TEXT dates relies on ISO ordering — keep dates canonical.",
      "Don't project device_id or games_played without making them group keys or aggregates.",
    ],
    ladder: [
      { title: "Brute force — sort and scan", body: "ORDER BY player_id, event_date and take each player's first row in code. Correct, but it's a manual top-1-per-group — SQL says this more directly." },
      { title: "The pattern — MIN per group", body: "GROUP BY player_id with MIN(event_date). The aggregate collapses each player's history into one row at the requested grain." },
      { title: "The optimal idea — it's already optimal", body: "One scan + one hash aggregate, O(n). A window-function version (ROW_NUMBER) computes the same thing with more machinery — right tool for 'first row's OTHER columns', overkill for the date alone." },
    ],
    approach: "GROUP BY + MIN on a canonical date column",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,
  games_played INTEGER NOT NULL
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1,2,'2016-03-01',5),(1,2,'2016-05-02',6),(2,3,'2017-06-25',1),
  (3,1,'2016-03-02',0),(3,4,'2018-07-03',5);`,
      tables: [{ name: "Activity", note: "5 sessions by 3 players" }],
    },
    code: `SELECT
    player_id,
    MIN(event_date) AS first_login
FROM Activity
GROUP BY player_id
ORDER BY player_id;`,
    walkthrough: [
      "GROUP BY player_id creates one bucket per player: bucket 1 holds two sessions, bucket 2 one, bucket 3 two.",
      "MIN(event_date) reduces each bucket to its earliest ISO date — 2016-03-01, 2017-06-25, 2016-03-02.",
      "ORDER BY player_id lists the roster in id order; the grader accepts any order.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(p) — one row per player",
    followUps: [
      "Also report the device of that first login — now you need ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY event_date).",
      "How many players returned after their first day? Self-join Activity to each player's MIN date.",
    ],
    related: ["the-latest-login-in-2020", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "customer-placing-the-largest-number-of-orders",
    statement:
      "Orders logs one row per order with the buying customer's number. Find the customer who placed the most orders and report their customer_number.",
    examples: [
      {
        input: "Orders: customers 1,2,3,1,3,1 (six orders total)",
        output: "1",
        explanation: "Customer 1 appears three times — more than anyone else.",
      },
    ],
    constraints: ["one row per order", "guaranteed unique maximum for the test data", "output: single column, single row"],
    breakdown: [
      "Two steps hide in one sentence: count orders per customer (GROUP BY + COUNT), then keep only the top count (ORDER BY … DESC LIMIT 1). SQL reads the sentence left to right and so should the query.",
      "LIMIT 1 after ORDER BY is 'the argmax' idiom. It's simple, but it silently makes a promise: the maximum is UNIQUE. If two customers could tie, LIMIT 1 would arbitrarily keep one — exactly the gap that version 2 of this problem (ties → all rows) is built to expose.",
      "Note the grain shift: the table's grain is the order, the answer's grain is the customer. Any query whose output grain differs from its input grain is an aggregation, whether or not it looks like one.",
    ],
    edges: [
      "COUNT counts orders, not customers — group first, then order.",
      "The guarantee 'unique maximum' is what makes LIMIT 1 safe; say it out loud in an interview.",
      "No join needed — the customer number lives on the order row itself.",
    ],
    ladder: [
      { title: "Brute force — scan and tally", body: "Tally customer numbers in a hash map while scanning rows, then take the max. Fine in code; in SQL it's GROUP BY + ORDER BY, done." },
      { title: "The pattern — aggregate, sort, cut", body: "GROUP BY customer_number, ORDER BY COUNT(*) DESC, LIMIT 1. Three clauses that mirror the English exactly." },
      { title: "The optimal idea — argmax via LIMIT", body: "One scan + aggregate + top-1. The tie-proof generalization (all customers at the max) needs a subquery comparing to the global MAX — worth knowing for its sibling problem." },
    ],
    approach: "GROUP BY + ORDER BY COUNT DESC + LIMIT 1",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_number    INTEGER PRIMARY KEY,
  customer_number INTEGER NOT NULL
);`,
      seed: `INSERT INTO Orders (order_number, customer_number) VALUES
  (1,1),(2,2),(3,3),(4,1),(5,3),(6,1);`,
      tables: [{ name: "Orders", note: "6 orders — customer 1 buys 3 of them" }],
    },
    code: `SELECT
    customer_number
FROM Orders
GROUP BY customer_number
ORDER BY COUNT(*) DESC
LIMIT 1;`,
    walkthrough: [
      "GROUP BY customer_number tallies the log: 1→3, 2→1, 3→2.",
      "ORDER BY COUNT(*) DESC lines the tallies up biggest-first: 3, 2, 1.",
      "LIMIT 1 cuts the top row — customer 1. With the unique-maximum guarantee, no information is lost.",
    ],
    time: "O(n log c) — aggregate plus sort of the c customer groups",
    space: "O(c) — one row per customer before the cut",
    followUps: [
      "Return ALL customers tied for the most orders: HAVING COUNT(*) = (SELECT MAX of the per-customer counts).",
      "Second-most frequent buyer? OFFSET 1 or a window function — what changes with ties?",
    ],
    related: ["project-employees-ii", "top-earners"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "biggest-single-number",
    statement:
      "MyNumbers holds one integer per row, with duplicates allowed. Report the biggest number that appears exactly once — or NULL if every number repeats.",
    examples: [
      {
        input: "MyNumbers: 8, 8, 3, 3, 4, 5, 6, 6",
        output: "5",
        explanation: "Singles are 4 and 5; the biggest is 5. 8, 3 and 6 repeat, so they're disqualified no matter how big they are.",
      },
    ],
    constraints: ["the table may be empty", "if no number is unique, output one row containing NULL", "output: single column num, single row"],
    breakdown: [
      "Two predicates stack here: 'appears exactly once' (a GROUP BY/HAVING filter) and 'the biggest of what survives' (an outer MAX). Each is trivial alone; the mistake is trying to do both in one SELECT, which mixes row-level filtering with an aggregate-of-aggregates.",
      "The outer aggregate is load-bearing even in the empty case: MAX over zero rows produces one row containing NULL, which is precisely the required output. Drop it and a filtered-empty table returns zero rows — the classic way this problem's second test case catches people.",
      "COUNT(*) = 1 in HAVING is the exact translation of 'appears exactly once'. HAVING — not WHERE — because uniqueness is a property of the GROUP, knowable only after rows have been counted.",
    ],
    edges: [
      "An empty result must still print one row with NULL — the outer MAX guarantees it.",
      "Filter uniqueness with HAVING COUNT(*) = 1; WHERE can't see counts.",
      "The biggest overall number may repeat and must be ignored.",
    ],
    ladder: [
      { title: "Brute force — count everything first", body: "Count occurrences of every distinct number in code, keep the singletons, take the max, special-case the empty result by hand. All four steps are one nested query in SQL." },
      { title: "The pattern — filter groups, then aggregate again", body: "Inner query: GROUP BY num HAVING COUNT(*) = 1. Outer query: MAX(num) over the survivors. Composition of two clean stages." },
      { title: "The optimal idea — nested aggregate with a NULL floor", body: "SELECT MAX(num) FROM (…singletons…). MAX's one-row-NULL behavior makes the edge case free — the schema of the answer is right even when the answer is 'nothing'." },
    ],
    approach: "GROUP BY + HAVING for singletons, outer MAX for the wrap",
    schema: {
      ddl: `CREATE TABLE MyNumbers (
  num INTEGER NOT NULL
);`,
      seed: `INSERT INTO MyNumbers (num) VALUES (8),(8),(3),(3),(4),(5),(6),(6);`,
      tables: [{ name: "MyNumbers", note: "8 rows; singles are 4 and 5" }],
    },
    code: `SELECT
    MAX(num) AS num                          -- one row, NULL if none survive
FROM (
    SELECT num
    FROM MyNumbers
    GROUP BY num
    HAVING COUNT(*) = 1                      -- exactly-once numbers only
) singles;`,
    walkthrough: [
      "The inner query buckets numbers by value: 8×2, 3×2, 4×1, 5×1, 6×2 — and HAVING COUNT(*) = 1 keeps only buckets of size one: 4 and 5.",
      "The outer MAX scans the two survivors and returns 5 — the biggest single.",
      "If the seed had been all duplicates, the inner query would return zero rows and MAX would still emit one row: num = NULL. The output shape never breaks.",
    ],
    time: "O(n) — count pass plus a scan over the survivors",
    space: "O(d) — one row per distinct number",
    followUps: [
      "The SMALLEST unique number — swap MAX for MIN; what breaks if the table is empty and you forgot the outer aggregate?",
      "Return every unique number in descending order — drop the MAX and ORDER BY the subquery.",
    ],
    related: ["customer-placing-the-largest-number-of-orders", "invalid-tweets"],
    order: "any",
    xp: 10,
  },
  {
    slug: "actors-and-directors-who-cooperated-at-least-three-times",
    statement:
      "ActorDirector logs each collaboration as (actor_id, director_id, timestamp). Report the actor-director pairs that have worked together at least three times.",
    examples: [
      {
        input: "ActorDirector: (1,1)×3, (1,2)×1, (2,1)×1, (3,3)×3",
        output: "1 1 · 3 3",
        explanation: "Pairs (1,1) and (3,3) hit three collaborations; (1,2) and (2,1) only managed one each.",
      },
    ],
    constraints: ["timestamp is unique per row", "output columns: actor_id, director_id — one row per qualifying pair"],
    breakdown: [
      "The whole problem is a frequency threshold on a composite key: GROUP BY the pair, HAVING COUNT(*) >= 3. 'At least N times' questions are always this shape, and the N lives in HAVING because it's a property of the group, not of any row.",
      "(1,2) and (2,1) are DIFFERENT pairs here — nothing in the spec asks to canonicalize direction (unlike the phone-calls problem). Reading the spec precisely decides this; assuming symmetry where none was requested is how correct-looking queries fail.",
      "The timestamp plays no role beyond existing — it makes rows distinct so COUNT counts genuine collaborations. When a column exists purely to disambiguate rows, it's a key, and it's not part of the answer.",
    ],
    edges: [
      "Group by BOTH ids — actor_id alone would merge a person's work across directors.",
      "Threshold uses >= (at least), not = 3 — four collaborations still qualify.",
      "(1,2) ≠ (2,1): no canonicalization unless the spec says so.",
    ],
    ladder: [
      { title: "Brute force — tally pairs in code", body: "Iterate rows, count (actor, director) keys, emit keys with count ≥ 3. This is exactly GROUP BY, written by hand at O(n) with more ceremony." },
      { title: "The pattern — GROUP BY composite key + HAVING", body: "One aggregate over one table. The composite key is both the group identity and the output payload." },
      { title: "The optimal idea — it's already optimal", body: "Single scan, hash aggregate, O(n). There is no faster shape for frequency thresholds." },
    ],
    approach: "GROUP BY the pair + HAVING COUNT(*) >= 3",
    schema: {
      ddl: `CREATE TABLE ActorDirector (
  actor_id    INTEGER NOT NULL,
  director_id INTEGER NOT NULL,
  timestamp   INTEGER NOT NULL
);`,
      seed: `INSERT INTO ActorDirector (actor_id, director_id, timestamp) VALUES
  (1,1,100),(1,1,105),(1,1,110),(1,2,120),(2,1,130),
  (3,3,140),(3,3,150),(3,3,160);`,
      tables: [{ name: "ActorDirector", note: "8 collaborations; pairs (1,1) and (3,3) hit 3" }],
    },
    code: `SELECT
    actor_id,
    director_id
FROM ActorDirector
GROUP BY actor_id, director_id
HAVING COUNT(*) >= 3;`,
    walkthrough: [
      "GROUP BY (actor_id, director_id) builds four buckets: (1,1)×3, (1,2)×1, (2,1)×1, (3,3)×3.",
      "HAVING COUNT(*) >= 3 filters on bucket size, keeping (1,1) and (3,3) — the threshold is group-level, so HAVING is the only correct clause.",
      "The surviving keys ARE the output; nothing else to project or join.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(p) — one row per distinct pair",
    followUps: [
      "Rank the pairs by collaboration count — wrap the aggregate in a subquery and ORDER BY COUNT DESC.",
      "Find actors who worked with at least 3 DIFFERENT directors — the COUNT moves to COUNT(DISTINCT director_id).",
    ],
    related: ["find-followers-count", "number-of-calls-between-two-persons"],
    order: "any",
    xp: 10,
  },
  {
    slug: "project-employees-ii",
    statement:
      "Project assigns employees to projects; Employee describes the people. Report every project that has the maximum number of employees assigned — including ALL projects if several tie for the top.",
    examples: [
      {
        input: "Project: p1→{1,2,3}, p2→{4,5,6}, p3→{1,4}",
        output: "1 · 2",
        explanation: "Projects 1 and 2 both carry three employees — the maximum — so both are reported. Project 3 has only two.",
      },
    ],
    constraints: ["(project_id, employee_id) pairs are unique", "ties for the maximum must ALL appear", "output: single column project_id"],
    breakdown: [
      "This is the tie-proof version of 'find the argmax'. LIMIT 1 is disqualified the moment ties matter; the correct shape computes the global maximum count, then keeps every group whose count equals it. Two aggregation stages, one nested query.",
      "The inner subquery computes the best headcount: SELECT MAX(c) FROM (SELECT COUNT(*) c FROM Project GROUP BY project_id). The outer GROUP BY then compares each project's count against that single scalar in HAVING — the pattern for 'groups that achieve the best X', reusable everywhere.",
      "Notice the Employee table is a decoy: the question counts ASSIGNMENTS, and the assignment count lives entirely in Project. Interviewers include realistic-but-unused tables precisely to test whether you compute from what the question needs, not from what the schema has.",
    ],
    edges: [
      "Ties must all survive — LIMIT 1 would silently drop one.",
      "The maximum is over per-project counts, never over raw rows.",
      "Employee's experience data is irrelevant — don't join what you don't need.",
    ],
    ladder: [
      { title: "Brute force — sort and eyeball the top", body: "ORDER BY COUNT DESC and read the first row — then notice the tie problem and start special-casing. The subquery version removes the special case entirely." },
      { title: "The pattern — max-of-counts as a scalar subquery", body: "Inner: per-project counts → MAX. Outer: HAVING COUNT(*) = that scalar. Handles ties by construction." },
      { title: "The optimal idea — two-pass aggregate", body: "O(n): count pass, max pass, equality filter. A window-function variant (RANK() OVER (ORDER BY COUNT DESC)) expresses the same 'all top groups' intent and scales to top-k." },
    ],
    approach: "HAVING count = (SELECT MAX of per-group counts)",
    schema: {
      ddl: `CREATE TABLE Project (
  project_id  INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  PRIMARY KEY (project_id, employee_id)
);
CREATE TABLE Employee (
  employee_id      INTEGER PRIMARY KEY,
  name             TEXT NOT NULL,
  experience_years INTEGER NOT NULL
);`,
      seed: `INSERT INTO Project (project_id, employee_id) VALUES
  (1,1),(1,2),(1,3),(2,4),(2,5),(2,6),(3,1),(3,4);
INSERT INTO Employee (employee_id, name, experience_years) VALUES
  (1,'Alicia',6),(2,'Boris',4),(3,'Chen',2),(4,'Dora',7),(5,'Emil',1),(6,'Farah',5);`,
      tables: [
        { name: "Project", note: "8 assignments — p1 and p2 tie at 3, p3 has 2" },
        { name: "Employee", note: "roster details — not needed for the count" },
      ],
    },
    code: `SELECT
    project_id
FROM Project
GROUP BY project_id
HAVING COUNT(*) = (
    SELECT MAX(c)
    FROM (
        SELECT COUNT(*) AS c
        FROM Project
        GROUP BY project_id
    ) counts
);`,
    walkthrough: [
      "The innermost GROUP BY counts assignments per project: p1→3, p2→3, p3→2; MAX wraps that into the single scalar 3.",
      "The outer GROUP BY re-counts per project (aggregates can't share a pass with a subquery over the same groups) and HAVING keeps buckets equal to 3 — projects 1 and 2.",
      "Both tied projects appear. No LIMIT, no arbitrary survivor.",
    ],
    time: "O(n) — two aggregation passes",
    space: "O(p) — one row per project per pass",
    followUps: [
      "Name the winning projects too — join to Project's sibling tables once the ids are known.",
      "Top-2 distinct headcounts (3 and 2): how does DENSE_RANK() OVER counts generalize this?",
    ],
    related: ["customer-placing-the-largest-number-of-orders", "classes-more-than-5-students"],
    order: "any",
    xp: 10,
  },
];
