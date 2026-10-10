// Deep-dives — the SQL Final "org & growth" band: hierarchy recursion,
// improvement tracking, meeting-load weeks, study spirals and recovery
// timelines (LC 3482 / 3421 / 3580 / 3611 / 3617 / 3586). Solutions are
// SQLite dialect, one statement each, engine-verified against the
// per-problem seeds (the level-5 rung, the exact-20.0 week, the 2-day-gap
// spiral and the same-day recovery are the traps).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_ORG: LcSqlDive[] = [
  {
    slug: "analyze-organization-hierarchy",
    statement:
      "An Employees table describes a company tree: each row points at its manager through manager_id, and the CEO alone has a NULL manager. For every employee report three derived numbers — their level (CEO = 1, direct reports of the CEO = 2, and so on), their team_size (every direct AND indirect report below them in the chart), and their budget (their own salary plus the salaries of everyone below them).",
    examples: [
      {
        input:
          "Employees: (1 Alice, NULL, 12000, Executive) · (2 Bob, 1, 10000, Sales) · (3 Charlie, 1, 10000, Engineering) · (4 David, 2, 7500) · (5 Eva, 2, 7500) · (6 Frank, 3, 9000) · (7 Grace, 3, 8500) · (8 Hank, 4, 6000) · (9 Ivy, 6, 7000) · (10 Judy, 6, 7000) — then the traps: (11 Ximena, 8, 5000) a level-5 rung under Hank, (12 Hattie, 5, 7000) a level-4 budget tie with Ivy and Judy",
        output:
          "(1, Alice, 1, 11, 96500) · (2, Bob, 2, 5, 43000) · (3, Charlie, 2, 4, 41500) · (6, Frank, 3, 2, 23000) · (4, David, 3, 2, 18500) · (5, Eva, 3, 1, 14500) · (7, Grace, 3, 0, 8500) · (8, Hank, 4, 1, 11000) · (12, Hattie, 4, 0, 7000) · (9, Ivy, 4, 0, 7000) · (10, Judy, 4, 0, 7000) · (11, Ximena, 5, 0, 5000)",
        explanation:
          "Alice anchors level 1 with the whole company under her (11 people, 96500 = her 12000 + 84500 of reports). Ximena stretches the tree to level 5 and promotes Hank to a 1-person team (11000); Hattie ties Ivy and Judy at 7000 on level 4 and prints first by name. The traps also fatten Bob's subtree to 5 people / 43000 — out-budgeting Charlie, so level 2 flips to Bob first.",
      },
    ],
    constraints: [
      "employee_id uniquely identifies each row; manager_id is NULL for exactly the CEO",
      "level counts edges from the CEO: CEO = 1, their direct reports = 2, and so on",
      "team_size counts ALL direct and indirect reports (0 for individual contributors); budget = own salary + every report's salary",
    ],
    breakdown: [
      "Three asks, one shape. team_size and budget are SUBTREE quantities — 'everyone below me in the chart' — while level is a ROOT-PATH quantity — 'how many edges from the CEO'. A single join Employees→Employees gets direct reports only; the moment Hank must be credited for Ximena through David, you need the transitive closure: every (ancestor, descendant) pair in the tree. Recognizing that the three outputs share one closure is the whole problem.",
      "The core mechanism is a RECURSIVE CTE. Seed it with every employee as the root of their own subtree at depth 0; the recursive step joins each current member's reports and appends them one level deeper. When it settles, the CTE holds one row per (root, member) pair — the entire reporting closure in a single table. The depth-0 self-rows are deliberate: they turn 'a manager plus everyone below them' into a plain GROUP BY root, with no NULL corner for leaf managers.",
      "Why naive shapes fail: chaining manual self-joins answers exactly as many levels as you write joins — David would see Hank but miss Ximena, and every new hire at level 6 breaks the query again. Aggregating directly on Employees reports NULL team_size for leaves (no rows to count, where the spec demands 0). And if you compute the subtree salary sum from report rows only, adding e.salary on top double-counts the manager once the closure already carries their self-row.",
      "Assembly: the closure feeds a subtotals CTE — GROUP BY root_id with team_size = COUNT(*) − 1 and budget = SUM(member salary); the self-row quietly contributes the manager's own pay, so budget needs no extra term. Level comes from the SAME closure read through the CEO's root rows: depth + 1. Join both onto Employees for names and sort level ASC, budget DESC, employee_name ASC — the mandated order that puts Bob (43000) ahead of Charlie (41500) once the traps fatten Bob's subtree.",
    ],
    edges: [
      "Leaves manage nobody: team_size must print 0, not NULL — the depth-0 self-row in the closure makes COUNT(*) − 1 safe for Grace, Ivy, Judy, Hattie and Ximena.",
      "budget includes the manager's OWN salary — the closure seeds every employee as their own depth-0 row, so SUM already carries it; adding e.salary again would double it (Alice would print 108500).",
      "Ordering inside a level is budget DESC then name ASC: Hattie, Ivy and Judy tie at 7000 on level 4 and must print alphabetically — a bare ORDER BY level, budget leaves the tie nondeterministic.",
      "The official 'Charlie before Bob at level 2' is data, not law: Ximena and Hattie fatten Bob's subtree to 43000 and the mandated budget DESC re-ranks him first.",
    ],
    ladder: [
      {
        title: "Brute force — one self-join per level of courage",
        body: "For each employee, walk down the chart with repeated self-joins (manager→report, then report→report, ...) and nested subqueries for team size and budget. Correct on a 4-level seed, unbounded on a real org chart, and O(n²) work even when it runs.",
      },
      {
        title: "The pattern — a recursive closure CTE",
        body: "A recursive CTE is SQL's answer to 'follow the edges until no new rows appear'. Seed every employee as their own subtree root, then repeatedly append manager→report hops; one closure table then answers all three metrics from a single scan.",
      },
      {
        title: "The optimal idea — aggregate the closure twice, join once",
        body: "Group the closure by root for team_size/budget, read level off the CEO-rooted rows, join onto Employees for names. Two passes over O(n·h) closure rows (h = tree height), no per-employee re-scan, no NULL corners.",
      },
    ],
    approach: "Recursive closure CTE + per-subtree aggregation",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id   INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  manager_id    INTEGER,                 -- NULL for the CEO only
  salary        INTEGER NOT NULL,
  department    TEXT NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, employee_name, manager_id, salary, department) VALUES
  (1,  'Alice',   NULL, 12000, 'Executive'),   -- official: the CEO
  (2,  'Bob',     1,    10000, 'Sales'),       -- official
  (3,  'Charlie', 1,    10000, 'Engineering'),  -- official
  (4,  'David',   2,    7500,  'Sales'),       -- official
  (5,  'Eva',     2,    7500,  'Sales'),       -- official
  (6,  'Frank',   3,    9000,  'Engineering'),  -- official
  (7,  'Grace',   3,    8500,  'Engineering'),  -- official
  (8,  'Hank',    4,    6000,  'Sales'),       -- official
  (9,  'Ivy',     6,    7000,  'Engineering'),  -- official
  (10, 'Judy',    6,    7000,  'Engineering'),  -- official
  (11, 'Ximena',  8,    5000,  'Sales'),       -- TRAP: level-5 rung under Hank
  (12, 'Hattie',  5,    7000,  'Sales');       -- TRAP: ties Ivy/Judy at 7000 on level 4`,
      tables: [
        { name: "Employees", note: "12 rows — the official 10-person tree plus a level-5 rung (Ximena) and a level-4 budget tie (Hattie)" },
      ],
    },
    code: `WITH RECURSIVE tree(root_id, member_id, depth) AS (
    -- every employee anchors their own subtree at depth 0 ...
    SELECT employee_id, employee_id, 0
    FROM Employees
    UNION ALL
    -- ... then each member pulls in their direct reports one level deeper
    SELECT t.root_id, e.employee_id, t.depth + 1
    FROM tree t
    JOIN Employees e ON e.manager_id = t.member_id
),
subtotals AS (
    -- one row per manager: everyone below them (self-row included)
    SELECT t.root_id,
           COUNT(*) - 1     AS team_size,   -- minus the manager's own self-row
           SUM(m.salary)    AS budget       -- self-row contributes the manager's own salary
    FROM tree t
    JOIN Employees m ON m.employee_id = t.member_id
    GROUP BY t.root_id
),
ceo_depth AS (
    -- re-read the same closure through the CEO's root rows: depth from the top
    SELECT t.member_id AS employee_id, t.depth
    FROM tree t
    JOIN Employees ceo ON ceo.employee_id = t.root_id AND ceo.manager_id IS NULL
)
SELECT e.employee_id,
       e.employee_name,
       cd.depth + 1          AS level,        -- CEO sits at depth 0 -> level 1
       s.team_size,
       s.budget
FROM Employees e
JOIN subtotals s  ON s.root_id = e.employee_id
JOIN ceo_depth cd ON cd.employee_id = e.employee_id
ORDER BY level ASC, budget DESC, employee_name ASC;`,
    walkthrough: [
      "The tree CTE seeds 12 self-rows — every employee is their own depth-0 root — then hops manager→report edges: Alice's root collects 12 rows (herself plus everyone down to Ximena at depth 4), Hank's root collects himself and Ximena, and a leaf like Grace collects only her own self-row.",
      "subtotals groups by root: Alice counts 12 rows → team_size 11 and SUM = 96500 (her own 12000 arriving via the depth-0 row); Grace counts 1 → team_size 0 and SUM = 8500. The self-row is why leaves print 0 instead of NULL and why budget needs no separate + e.salary term.",
      "ceo_depth re-reads the closure through the CEO's root only: Alice sits at depth 0 → level 1, Bob and Charlie at depth 1 → level 2, ..., Ximena at depth 4 → level 5. Same table, second reading.",
      "The final join and sort: level 2 prints Bob (43000) over Charlie (41500) because the traps fattened Bob's subtree; level 3 runs Frank 23000, David 18500, Eva 14500, Grace 8500; level 4's 7000 tie prints Hattie, Ivy, Judy alphabetically; Ximena closes at level 5.",
    ],
    time: "O(n·h) closure rows for n employees at tree height h (each employee appears once per ancestor), then two grouped passes over them — the per-employee self-join rewrite is O(n²) or worse",
    space: "O(n·h) — the closure CTE itself",
    followUps: [
      "Add a terminated_date column and exclude departed staff from team_size and budget — does the filter go inside the recursion or on the closure, and which choice keeps the levels right?",
      "Return the management CHAIN per employee (the CEO path as a list) instead of counts — what does the recursive CTE carry then, and what happens to the query if a data bug introduces a reporting cycle?",
    ],
    related: ["employees-earning-more-than-their-managers", "the-number-of-employees-which-report-to-each-employee", "tree-node"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-students-who-improved",
    statement:
      "Each row of Scores is one exam attempt: a student, a subject, an exam date and the score. A student has improved in a subject when they sat it on at least two different dates and their most recent score in that subject is strictly higher than their first-ever score in it. Return every qualifying (student, subject) pair together with the two scores that prove the improvement.",
    examples: [
      {
        input:
          "Scores: 101 Math 70→85 · 101 Physics 65→60 · 102 Math 80→85 · 103 Math 90 (single attempt) · 104 Physics 75→85 — traps: 105 Math 80→80 (flat), 105 Biology 40→95, 106 Physics 60→50→75 (three attempts, mid-run dip), 107 Chemistry 90→60→70 (first was the peak)",
        output:
          "(101, Math, 70, 85) · (102, Math, 80, 85) · (104, Physics, 75, 85) · (105, Biology, 40, 95) · (106, Physics, 60, 75)",
        explanation:
          "First vs latest BY DATE decides everything: 106's interior 50 is never consulted (60 → 75 counts), 105's flat 80 → 80 fails the strict bar while their Biology improves, 107's interior recovery cannot rescue a latest (70) below the first (90), 101's Physics drop and 103's single exam stay out.",
      },
    ],
    constraints: [
      "(student_id, subject, exam_date) is the primary key — at most one attempt per subject per day",
      "score is between 0 and 100 inclusive; exam_date orders the attempts",
      "improvement is strictly higher latest vs first — equal scores do not count",
    ],
    breakdown: [
      "The rule compares two specific rows per (student, subject): the score on the EARLIEST exam date and the score on the LATEST one, requiring the latter to be strictly higher — plus a gate that the pair has at least two attempts. It is not a 'best vs worst' question and not an 'every attempt must rise' question: interior attempts are invisible to the rule, and the first attempt may well be the peak (student 107 proves the difference).",
      "The core mechanism is a two-step shape. First GROUP BY student_id, subject to establish the pair set and the two boundary dates — MIN(exam_date) and MAX(exam_date) — with HAVING COUNT(*) >= 2 removing one-attempt subjects like 103's Math. Second, join Scores back twice, once on first_date and once on latest_date; the composite primary key makes each join hit exactly one row.",
      "Why naive aggregates fail: MIN(score)/MAX(score) in the same GROUP BY answers a different question — 107's Chemistry has max 70 > min 60 and would sneak in, yet its latest (70) is BELOW its first (90), so the truth is exclusion. A pairwise 'each attempt beats the previous' reading is equally wrong in the other direction: 106's 60→50→75 dip disqualifies under that rule, but the official rule only ever looks at the two endpoints.",
      "Assembly: a bounds CTE carries (student, subject, first_date, latest_date); two primary-key joins pin first_score and latest_score; WHERE l.score > f.score applies the strict bar; ORDER BY student_id, subject ASC finishes, exactly as the spec mandates.",
    ],
    edges: [
      "Equal scores are not improvement: 105's Math sits at 80 → 80 and must stay out — the comparison is strict > only.",
      "107 shows the aggregate trap: an interior dip (60) plus a partial recovery (70) still fails because the LATEST 70 is below the FIRST 90 — MIN/MAX of score would wrongly admit it.",
      "106 shows the opposite: a mid-run dip (50) is irrelevant because the rule compares endpoints only — 60 → 75 counts.",
      "103's single 90 is a great score with no story: the >= 2 attempts gate removes them before any comparison.",
    ],
    ladder: [
      {
        title: "Brute force — compare every pair of attempts",
        body: "Self-join Scores per (student, subject) across all date pairs and decide 'first' and 'latest' row by row in application logic. Quadratic pair counting for a question that only ever needs two rows per group.",
      },
      {
        title: "The pattern — group to the boundaries, join back",
        body: "GROUP BY student_id, subject with HAVING COUNT(*) >= 2 keeps subjects with history; MIN(exam_date)/MAX(exam_date) name the two boundary dates. Join the table back on each boundary to recover the two scores via the primary key.",
      },
      {
        title: "The optimal idea — endpoints in, strict compare out",
        body: "The final WHERE l.score > f.score is two index probes per surviving group. One grouped scan plus 2·g primary-key lookups for g (student, subject) groups — no windows, no pair counting, no interior rows touched.",
      },
    ],
    approach: "Group to (student, subject) date bounds + join back first/latest rows",
    schema: {
      ddl: `CREATE TABLE Scores (
  student_id INTEGER NOT NULL,
  subject    TEXT NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  exam_date  TEXT NOT NULL,              -- 'YYYY-MM-DD'
  PRIMARY KEY (student_id, subject, exam_date)
);`,
      seed: `INSERT INTO Scores (student_id, subject, score, exam_date) VALUES
  (101, 'Math',      70, '2023-01-15'),  -- official
  (101, 'Math',      85, '2023-02-15'),  -- official: improved
  (101, 'Physics',   65, '2023-01-15'),  -- official
  (101, 'Physics',   60, '2023-02-15'),  -- official: dropped
  (102, 'Math',      80, '2023-01-15'),  -- official
  (102, 'Math',      85, '2023-02-15'),  -- official: improved
  (103, 'Math',      90, '2023-01-15'),  -- official: single attempt
  (104, 'Physics',   75, '2023-01-15'),  -- official
  (104, 'Physics',   85, '2023-02-15'),  -- official: improved
  (105, 'Math',      80, '2023-01-15'),  -- TRAP: flat pair ...
  (105, 'Math',      80, '2023-02-15'),  -- ... 80 -> 80 is NOT improvement
  (105, 'Biology',   40, '2023-01-20'),  -- TRAP: same student, other subject ...
  (105, 'Biology',   95, '2023-02-20'),  -- ... improves 40 -> 95
  (106, 'Physics',   60, '2023-01-10'),  -- TRAP: three attempts, mid-run dip ...
  (106, 'Physics',   50, '2023-02-10'),  -- ... the 50 is ignored ...
  (106, 'Physics',   75, '2023-03-10'),  -- ... first 60 -> latest 75 counts
  (107, 'Chemistry', 90, '2023-01-05'),  -- TRAP: first attempt is the peak ...
  (107, 'Chemistry', 60, '2023-02-05'),  -- ... interior dip plus recovery ...
  (107, 'Chemistry', 70, '2023-03-05');  -- ... latest 70 < first 90: excluded`,
      tables: [
        { name: "Scores", note: "19 attempts across 9 (student, subject) pairs — flat, dipped, recovered and peak-first histories all present" },
      ],
    },
    code: `WITH bounds AS (
    -- one row per (student, subject) that has at least two attempts,
    -- carrying the two dates the rule actually cares about
    SELECT
        student_id,
        subject,
        MIN(exam_date) AS first_date,    -- earliest attempt
        MAX(exam_date) AS latest_date    -- most recent attempt
    FROM Scores
    GROUP BY student_id, subject
    HAVING COUNT(*) >= 2                 -- 103's single Math exam never qualifies
)
SELECT
    b.student_id,
    b.subject,
    f.score AS first_score,              -- score pinned to the FIRST date
    l.score AS latest_score              -- score pinned to the LATEST date
FROM bounds b
JOIN Scores f ON f.student_id = b.student_id
            AND f.subject    = b.subject
            AND f.exam_date  = b.first_date
JOIN Scores l ON l.student_id = b.student_id
            AND l.subject    = b.subject
            AND l.exam_date  = b.latest_date
WHERE l.score > f.score                -- strictly higher latest vs first
ORDER BY b.student_id ASC, b.subject ASC;`,
    walkthrough: [
      "bounds collapses 19 attempts into 9 (student, subject) groups and stamps each with its two boundary dates; HAVING COUNT(*) >= 2 deletes 103's lone Math row before anything else runs.",
      "The two joins pull boundary scores by primary key: 101 Math pins 70 (01-15) and 85 (02-15); 106 Physics pins 60 (01-10) and 75 (03-10) — the 50 from 02-10 is never fetched; 107 Chemistry pins 90 and 70.",
      "The strict gate l.score > f.score drops 101 Physics (60 > 65 false), 105 Math (80 > 80 false — the flat trap) and 107 Chemistry (70 > 90 false — interior recovery cannot rescue a lower latest).",
      "Five survivors print ordered by student_id then subject: 101 Math, 102 Math, 104 Physics, 105 Biology, 106 Physics — note 105 contributes one subject while failing the other, exactly the per-subject granularity the rule demands.",
    ],
    time: "O(s) — one grouped scan over s exam rows, then 2 primary-key probes per surviving group",
    space: "O(g) — one bounds row per distinct (student, subject) group",
    followUps: [
      "Change the rule to 'score rose on every attempt' (strictly monotone across all dates) — which window or self-join shape replaces the two-endpoint compare, and how does 106 fare then?",
      "Suppose regrades arrive as later-dated correction rows that should REPLACE the original attempt rather than count as a new one — how do you dedupe before computing first/latest?",
    ],
    related: ["rising-temperature", "find-drivers-with-improved-fuel-efficiency", "game-play-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-consistently-improving-employees",
    statement:
      "Performance reviews carry a date and a 1–5 rating for an employee. An employee is consistently improving when they have at least three reviews on record AND their three most recent reviews — by review_date, not row order — climb strictly, each one better than the one before. Report those employees with an improvement score: the latest rating minus the earliest rating among those three.",
    examples: [
      {
        input:
          "employees 1–5 official (Alice Johnson, Bob Smith, Carol Davis, David Wilson, Emma Brown) + 6 Frank Miller, 7 Grace Kim, 8 Heidi Lopez. Reviews: Alice 2→3→4→5 · Bob 3→2→4→5 · Carol 1→2→3→4 · David 4→4→4 · Emma 3→2 (two only) — traps: Frank 3→1→4 (dip INSIDE the last three), Grace 5→1→2→3→4 (crash BEFORE the last three), Heidi a single 4",
        output: "(2, Bob Smith, 3) · (1, Alice Johnson, 2) · (3, Carol Davis, 2) · (7, Grace Kim, 2)",
        explanation:
          "Last three by date: Bob 2→4→5 (score 3), Alice 3→4→5 and Carol 2→3→4 (score 2 each), Grace 2→3→4 — her early 5→1 crash is older than the window and invisible. David's flat 4s fail strict ascent, Frank's mid-window 1 is a fatal dip, Emma's two reviews and Heidi's one fail the count gate; the three 2s separate by name.",
      },
    ],
    constraints: [
      "ratings are integers 1–5; review_date orders each employee's history",
      "an employee needs at least 3 reviews to qualify at all",
      "only the 3 MOST RECENT reviews (by review_date) are judged — earlier history is out of scope",
    ],
    breakdown: [
      "Two independent gates stack: an eligibility gate (at least three reviews exist) and a shape gate (the three most recent, taken together, rise strictly). The output is a score, not a boolean — latest minus earliest of the trimmed window — so the query must both decide membership and measure the spread on the same three rows.",
      "The core mechanism is the window-in-CTE-then-filter idiom. ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY review_date DESC) numbers reviews newest-first; rn <= 3 trims every history to its three most recent rows in one sorted pass. Inside the trimmed set, LEAD(rating) and LEAD(rating, 2) over rn place the two OLDER ratings next to the newest, so the rn = 1 row carries the whole triple — ratings, order and count — on one line.",
      "Why naive forms fail: MIN(rating) < MAX(rating) over the window would admit 2,2,4 or 3,1,4 — a gap between the extremes says nothing about strict ascent (Frank's 3→1→4 has max > min and a fatal dip). Judging the FULL history instead of the last three would expel Grace, whose 5→1 crash predates the window the spec cares about. And COUNT(*) must be taken over the trimmed rows: it equals 3 exactly when the employee has three or more reviews, so it doubles as the eligibility gate.",
      "Assembly: ranked trims, last3 wires the leads and the count; the outer query keeps rows where kept = 3 and older2 < older1 < rating, scores them rating − older2, and sorts improvement_score DESC, name ASC — the tiebreak that separates Alice, Carol and Grace at 2. The correlated-EXISTS alternative (assert no pair of an employee's last three reviews dips, via three scalar probes per employee) decides the same set but buries the window arithmetic in per-row subqueries.",
    ],
    edges: [
      "Exactly flat is not improving: David's 4,4,4 fails 4 < 4 — any equal pair inside the last three kills the employee.",
      "Count gate before comparison: Emma (2 reviews) and Heidi (1) never reach the rating logic — their kept value is 2 and 1, not 3.",
      "Grace's early crash (5→1) is OUTSIDE the window: only the three most recent reviews are judged — a full-history reading would wrongly expel her.",
      "The three-way score tie at 2 is separated by name ASC — without that tiebreak in ORDER BY the output order is nondeterministic.",
    ],
    ladder: [
      {
        title: "Brute force — sort and eyeball, per employee",
        body: "For each employee, sort their reviews by date, take the last three, compare the three ratings pairwise, and compute the spread. Three probes and a fresh sort per employee — the correlated-EXISTS shape, correct but per-row.",
      },
      {
        title: "The pattern — trim to the last three with ROW_NUMBER",
        body: "One window pass numbers every review newest-first per employee; rn <= 3 keeps exactly the judged window. LEAD(rating)/LEAD(rating, 2) over the trimmed rows align the triple on the newest row so one boolean expression can decide everything.",
      },
      {
        title: "The optimal idea — one gate expression, one score expression",
        body: "kept = 3 AND older2 < older1 < rating decides membership; rating − older2 measures the score; ORDER BY handles the ranking and the name tiebreak. All per-employee logic collapses into a single sorted pass plus a linear filter.",
      },
    ],
    approach: "Trim to last 3 with ROW_NUMBER, gate with a LEAD chain",
    schema: {
      ddl: `CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE performance_reviews (
  review_id   INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
  review_date TEXT NOT NULL,             -- 'YYYY-MM-DD'
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
);`,
      seed: `INSERT INTO employees (employee_id, name) VALUES
  (1, 'Alice Johnson'), (2, 'Bob Smith'), (3, 'Carol Davis'),
  (4, 'David Wilson'),  (5, 'Emma Brown'),                 -- official
  (6, 'Frank Miller'),  (7, 'Grace Kim'), (8, 'Heidi Lopez'); -- traps
INSERT INTO performance_reviews (review_id, employee_id, review_date, rating) VALUES
  (1,  1, '2023-01-15', 2), (2,  1, '2023-04-15', 3),
  (3,  1, '2023-07-15', 4), (4,  1, '2023-10-15', 5),   -- official Alice: 2,3,4,5
  (5,  2, '2023-02-01', 3), (6,  2, '2023-05-01', 2),
  (7,  2, '2023-08-01', 4), (8,  2, '2023-11-01', 5),   -- official Bob: early dip, 2,4,5 late
  (9,  3, '2023-03-10', 1), (10, 3, '2023-06-10', 2),
  (11, 3, '2023-09-10', 3), (12, 3, '2023-12-10', 4),   -- official Carol: 1,2,3,4
  (13, 4, '2023-01-20', 4), (14, 4, '2023-04-20', 4),
  (15, 4, '2023-07-20', 4),                             -- official David: flat 4s
  (16, 5, '2023-02-15', 3), (17, 5, '2023-05-15', 2),   -- official Emma: only 2 reviews
  (18, 6, '2024-01-05', 3), (19, 6, '2024-02-05', 1),
  (20, 6, '2024-03-05', 4),                             -- TRAP Frank: dip inside the last three
  (21, 7, '2023-01-10', 5), (22, 7, '2023-02-10', 1),
  (23, 7, '2023-03-10', 2), (24, 7, '2023-04-10', 3),
  (25, 7, '2023-05-10', 4),                             -- TRAP Grace: crash before the last three
  (26, 8, '2023-06-01', 4);                             -- TRAP Heidi: a single review`,
      tables: [
        { name: "employees", note: "8 staff — the official 5 plus three trap employees" },
        { name: "performance_reviews", note: "26 reviews — flat, dipped-inside, dipped-outside and under-counted histories all present" },
      ],
    },
    code: `WITH ranked AS (
    -- number each employee's reviews NEWEST first (date order is the law here)
    SELECT
        employee_id,
        rating,
        ROW_NUMBER() OVER (
            PARTITION BY employee_id
            ORDER BY review_date DESC, review_id DESC
        ) AS rn
    FROM performance_reviews
),
last3 AS (
    -- keep only the three most recent reviews, then line the triple up
    SELECT
        employee_id,
        rating,                                          -- newest of the window
        LEAD(rating)    OVER (PARTITION BY employee_id ORDER BY rn) AS older1,  -- middle
        LEAD(rating, 2) OVER (PARTITION BY employee_id ORDER BY rn) AS older2,  -- oldest
        COUNT(*)        OVER (PARTITION BY employee_id)             AS kept     -- 3 iff 3+ reviews exist
    FROM ranked
    WHERE rn <= 3
)
SELECT
    e.employee_id,
    e.name,
    l.rating - l.older2 AS improvement_score   -- latest minus earliest of the three
FROM last3 l
JOIN employees e ON e.employee_id = l.employee_id
WHERE l.kept = 3                             -- eligibility: at least 3 reviews
  AND l.older2 < l.older1                    -- oldest < middle ...
  AND l.older1 < l.rating                    -- ... < newest: strict ascent
ORDER BY improvement_score DESC, e.name ASC;`,
    walkthrough: [
      "ranked numbers each history newest-first: Alice gets rn 1..4 over (5, 4, 3, 2) with the 2 from January at rn 4 — present but about to be trimmed; Grace's rn 1..5 starts at her 2023-05-10 rating 4.",
      "last3 keeps rn <= 3 and staples the leads on: Alice's window is (rating 5, older1 4, older2 3, kept 3); Bob's is (5, 4, 2) — his February 3 sits outside; Emma's two rows give kept = 2; Heidi's single row kept = 1.",
      "The gate evaluates on the rn = 1 rows: David's 4 < 4 dies immediately; Frank's triple (4, 1, 3) has older2 3 < older1 1 false — the mid-window dip disqualifies despite the 1→4 recovery; Grace's (4, 3, 2) passes because her 5→1 crash predates the window.",
      "Scoring and sorting: rating − older2 gives Bob 3, Alice 2, Carol 2, Grace 2; improvement_score DESC puts Bob first and name ASC orders the 2-tie Alice, Carol, Grace — the four rows printed.",
    ],
    time: "O(r log r) — one sort of r reviews per (employee, date DESC); trimming, leading and filtering are linear in the survivors",
    space: "O(r) — the ranked and trimmed CTEs",
    followUps: [
      "Rewrite the shape gate as a correlated NOT EXISTS over each employee's last three reviews — compare readability and plan cost against the LEAD chain, and decide which you'd defend in a review.",
      "Anchor the window to an event instead of recency (the three reviews since a promotion date) — how does the rn <= 3 filter become a date-range filter, and what happens to the count gate?",
    ],
    related: ["find-emotionally-consistent-users", "find-drivers-with-improved-fuel-efficiency", "active-users"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-overbooked-employees",
    statement:
      "Meetings log how many hours each employee spent in meetings on a given date. An employee is meeting-heavy in a Monday-to-Sunday week when their meeting hours that week exceed half of a 40-hour working week (strictly more than 20 hours). Report the employees who were meeting-heavy in at least two separate weeks, with the count of such weeks.",
    examples: [
      {
        input:
          "employees 1–5 official (Alice Johnson, Bob Smith, Carol Davis, David Wilson, Emma Brown) + 6 Fiona Garcia (Operations). Alice 21.0h in the 06-05 week + 21.0h in the 06-12 week · Bob 23.0h then 10.0h · Carol 20.5h then EXACTLY 20.0h · David 25.0h (06-05), 22.0h (06-19), 20.5h (06-26) · Emma 2.0h — traps: Fiona 21.0h on Sunday 06-11 AND 21.0h on Monday 06-12",
        output:
          "(4, David Wilson, Engineering, 3) · (1, Alice Johnson, Engineering, 2) · (6, Fiona Garcia, Operations, 2)",
        explanation:
          "David banks three heavy weeks (25.0, 22.0, 20.5 — each strictly over 20). Fiona's back-to-back Sunday/Monday 21s land in two DIFFERENT Monday-start weeks — two heavy weeks from two meetings, where a 7-day rolling window would merge them into one 42-hour stretch. Carol's exactly-20.0 second week misses the strict > 20 bar, and Bob's single heavy week fails the >= 2 gate.",
      },
    ],
    constraints: [
      "a standard work week is 40 hours, Monday through Sunday; meeting-heavy means weekly hours strictly > 20",
      "duration_hours are decimal hours; one day can hold several meetings",
      "an employee needs at least 2 meeting-heavy weeks to be reported",
    ],
    breakdown: [
      "Two thresholds stack: a per-week gate (sum of meeting hours in a Monday–Sunday week strictly above 20) and a per-employee gate (at least two such weeks). The calendar question comes first: which week does a meeting belong to? The answer is fixed by the spec — weeks start on Monday — so the query needs an explicit Monday-of-week expression, not an implicit one.",
      "The core mechanism is a date modifier chain: date(meeting_date, 'weekday 0', '-6 days') snaps a date forward to the next Sunday (staying put if it IS Sunday) and then steps back six days, landing on that week's Monday. Meeting on Sunday 06-11 and meeting on Monday 06-12 therefore map to week starts 06-05 and 06-12 — different buckets, exactly as a Monday-start calendar demands.",
      "Why naive bucketing fails: a 7-day ROLLING window over julianday spans would merge Fiona's Sunday 21 + Monday 21 into one 42-hour stretch and report one heavy week instead of two — rolling windows answer 'any 7 consecutive days', not 'calendar weeks'. String week keys like strftime('%Y-%W') hide the week-start convention in locale behavior. And >= 20 instead of > 20 would admit Carol's exactly-20.0 week and change her from a one-week near-miss into a two-week qualifier.",
      "Assembly: the weeks CTE groups meetings by (employee, Monday) with SUM(duration_hours) and a strict HAVING > 20; the tally CTE counts surviving weeks per employee with HAVING >= 2; the outer query joins employees for name and department and sorts meeting_heavy_weeks DESC, employee_name ASC — the mandated order that puts David's 3 ahead of the 2-tie.",
    ],
    edges: [
      "Strictness at the bar: Carol's 6.5 + 13.5 = exactly 20.0 does NOT count — > 20, not >= 20; she finishes with one heavy week and is excluded.",
      "Week boundaries are real: Fiona's Sunday 06-11 (21.0) and Monday 06-12 (21.0) sit in different Monday-start weeks — two heavy weeks, not one 42-hour blob.",
      "One heavy week is not enough: Bob peaks at 23.0 in week 06-05 but only 10.0 the next — the HAVING COUNT(*) >= 2 gate removes him.",
      "The count, not the hours, drives the ranking: David's three modestly-over weeks (25.0 / 22.0 / 20.5) beat Alice's and Fiona's two — ORDER BY meeting_heavy_weeks DESC.",
    ],
    ladder: [
      {
        title: "Brute force — bucket meetings in application code",
        body: "For every meeting, compute the Monday of its week in the app, accumulate hours into a hash map keyed by (employee, week), then filter and count. The SQL below is the same algorithm expressed as two GROUP BYs.",
      },
      {
        title: "The pattern — a Monday-of-week expression plus HAVING",
        body: "date(d, 'weekday 0', '-6 days') is SQLite's Monday-of-week: snap forward to Sunday, step back six days. One GROUP BY (employee, week_start) with a strict HAVING SUM > 20 yields the heavy weeks.",
      },
      {
        title: "The optimal idea — count the survivors, gate again",
        body: "A second GROUP BY employee over the heavy-week rows with HAVING COUNT(*) >= 2 finishes the logic; join the dimension table for display columns. Two small grouped passes over m meetings — no window needed at all.",
      },
    ],
    approach: "Monday-bucket weekly rollup + strict HAVING gates",
    schema: {
      ddl: `CREATE TABLE employees (
  employee_id   INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department    TEXT NOT NULL
);
CREATE TABLE meetings (
  meeting_id     INTEGER PRIMARY KEY,
  employee_id    INTEGER NOT NULL REFERENCES employees(employee_id),
  meeting_date   TEXT NOT NULL,          -- 'YYYY-MM-DD'
  meeting_type   TEXT NOT NULL CHECK (meeting_type IN ('Team','Client','Training')),
  duration_hours REAL NOT NULL
);`,
      seed: `INSERT INTO employees (employee_id, employee_name, department) VALUES
  (1, 'Alice Johnson', 'Engineering'), (2, 'Bob Smith',  'Marketing'),
  (3, 'Carol Davis',   'Sales'),       (4, 'David Wilson','Engineering'),
  (5, 'Emma Brown',    'HR'),                               -- official
  (6, 'Fiona Garcia',  'Operations');                       -- trap: the Sunday/Monday straddle
INSERT INTO meetings (meeting_id, employee_id, meeting_date, meeting_type, duration_hours) VALUES
  (1,  1, '2023-06-05', 'Team',     8.0),   -- official: Alice's 06-05 week
  (2,  1, '2023-06-06', 'Client',   6.0),
  (3,  1, '2023-06-07', 'Training', 7.0),   -- 8+6+7 = 21.0 > 20
  (4,  1, '2023-06-12', 'Team',    12.0),   -- official: Alice's 06-12 week
  (5,  1, '2023-06-13', 'Client',   9.0),   -- 12+9 = 21.0 > 20
  (6,  2, '2023-06-05', 'Team',    15.0),   -- official: Bob 23.0 in week 1
  (7,  2, '2023-06-06', 'Client',   8.0),
  (8,  2, '2023-06-12', 'Training', 10.0),  -- official: only 10.0 in week 2
  (9,  3, '2023-06-05', 'Team',     4.0),   -- official Carol base ...
  (10, 3, '2023-06-06', 'Client',   3.0),   -- ... 4+3 = 7.0
  (11, 4, '2023-06-05', 'Team',    25.0),   -- official: David 25.0 in week 1
  (12, 4, '2023-06-19', 'Client',  22.0),   -- official: David 22.0 in week 3
  (13, 5, '2023-06-05', 'Training', 2.0),   -- official: Emma far below
  (14, 3, '2023-06-06', 'Client',  13.5),   -- TRAP: Carol week 1 -> 20.5 (heavy!)
  (15, 3, '2023-06-13', 'Team',     6.5),   -- TRAP: Carol week 2 ...
  (16, 3, '2023-06-14', 'Client',  13.5),   -- ... = EXACTLY 20.0: not > 20
  (17, 6, '2023-06-11', 'Team',    21.0),   -- TRAP: Fiona SUNDAY -> week of 06-05
  (18, 6, '2023-06-12', 'Client',  21.0),   -- TRAP: Fiona MONDAY -> week of 06-12
  (19, 4, '2023-06-26', 'Team',    20.5);   -- TRAP: David's third heavy week`,
      tables: [
        { name: "employees", note: "6 staff — the official 5 plus Fiona for the week-boundary trap" },
        { name: "meetings", note: "19 meetings over four Monday-start weeks (06-05, 06-12, 06-19, 06-26) — an exact-20.0 week and a Sunday/Monday straddle included" },
      ],
    },
    code: `WITH weeks AS (
    SELECT
        m.employee_id,
        date(m.meeting_date, 'weekday 0', '-6 days') AS week_start,
        -- 'weekday 0' snaps forward to SUNDAY, '-6 days' lands on that week's MONDAY
        SUM(m.duration_hours) AS meeting_hours
    FROM meetings m
    GROUP BY m.employee_id, week_start
    HAVING SUM(m.duration_hours) > 20       -- meeting-heavy: STRICTLY over half of 40h
),
tally AS (
    SELECT employee_id, COUNT(*) AS meeting_heavy_weeks
    FROM weeks
    GROUP BY employee_id
    HAVING COUNT(*) >= 2                    -- at least two heavy weeks to be reported
)
SELECT
    e.employee_id,
    e.employee_name,
    e.department,
    t.meeting_heavy_weeks
FROM tally t
JOIN employees e ON e.employee_id = t.employee_id
ORDER BY t.meeting_heavy_weeks DESC, e.employee_name ASC;`,
    walkthrough: [
      "weeks maps every meeting to its Monday: 06-05..06-11 all land on week_start 06-05 (Fiona's Sunday 06-11 included), 06-12..06-18 on 06-12, 06-19 on 06-19, 06-26 on 06-26.",
      "Weekly sums: Alice 21.0 and 21.0; Bob 23.0 then 10.0; Carol 20.5 (4.0 + 3.0 + 13.5) then exactly 20.0 (6.5 + 13.5); David 25.0, 22.0, 20.5; Emma 2.0; Fiona 21.0 in two consecutive-but-distinct weeks.",
      "The strict HAVING > 20 prunes Carol's 20.0 week (she keeps one heavy week) and Bob's 10.0; the surviving buckets are Alice ×2, Carol ×1, David ×3, Fiona ×2.",
      "tally counts per employee and HAVING >= 2 drops Carol; the join and sort print David Wilson (3), then the 2-tie Alice Johnson before Fiona Garcia.",
    ],
    time: "O(m) — one grouped pass over m meetings for the weekly sums, a second over the surviving buckets; no sorting beyond the grouping",
    space: "O(e·w) — one bucket per (employee, week) pair",
    followUps: [
      "Report weekly load as a SHARE of the 40-hour week and rank employees by their worst week — which window over the weeks CTE computes 'worst week per employee' in one pass?",
      "Make the calendar Sunday-start (US style) — which single modifier changes, and why does the 'snap forward, step back' trick still work?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "find-golden-hour-customers", "restaurant-growth"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-students-with-study-spiral-pattern",
    statement:
      "Study sessions record which subject a student opened, on which date, for how long. A student follows the Study Spiral Pattern when their chronological session list cycles through the SAME sequence of subjects — at least 3 distinct subjects per cycle — repeated for at least 2 complete cycles (so at least 6 sessions), with no pause longer than 2 days between consecutive sessions. Report spiral students with their cycle length (distinct subjects in the rotation) and total study hours.",
    examples: [
      {
        input:
          "Alice Math→Physics→Chemistry ×2 (Oct 1–6 daily, 15.0h) · Bob Algebra→Calculus→Statistics→Geometry ×2 (Oct 1–8, 26.0h) · Carol Biology/Chemistry ×2 (only 2 subjects) · David 2 sessions 4 days apart · Emma none — traps: Felix a 3-cycle on 2-DAY gaps (12.0h), Gina a perfect 3-cycle plus one stray Art session, Hank Moon a perfect 3-cycle split by a 3-day pause, Noah only 4 sessions of a 3-cycle",
        output:
          "(2, Bob Johnson, Mathematics, 4, 26.0) · (1, Alice Chen, Computer Science, 3, 15.0) · (6, Felix Ng, Economics, 3, 12.0)",
        explanation:
          "Bob cycles 4 subjects twice, Alice 3 subjects twice, Felix 3 subjects twice with the maximum-tolerated 2-day gaps. Gina's stray Art session leaves 7 sessions over 4 subjects — an incomplete second cycle AND a period break; Hank Moon's single 3-day pause kills an otherwise perfect rotation; Noah never finishes a second cycle (4 < 6); Carol's cycle length 2 is below the floor of 3.",
      },
    ],
    constraints: [
      "cycle length = number of distinct subjects in the rotation; the minimum is 3",
      "the rotation must complete at least 2 full cycles — at least 6 sessions total",
      "consecutive sessions may be at most 2 days apart; a longer pause breaks the spiral",
    ],
    breakdown: [
      "This is periodicity detection, not streak detection. The question per student: does the ENTIRE chronological session list repeat with period k, where k equals the number of distinct subjects, k >= 3, the list runs at least 2k long, and the calendar never pauses more than 2 days? A sequence like A,B,A,C,A,B,A,C has no equal neighbors but is NOT a period-3 spiral — the test must be positional, not 'differs from previous'.",
      "Three per-student facts power the decision, and windows hand you all three cheaply. ROW_NUMBER over (session_date, session_id) fixes each session's position; LAG over the same ordering exposes the day gap between consecutive sessions, whose MAX is the worst pause; GROUP BY yields n (sessions), k (COUNT(DISTINCT subject)) and the total hours in one pass each.",
      "Why the tempting shortcuts fail: COUNT(DISTINCT subject) >= 3 AND COUNT(*) >= 6 would admit Gina (4 subjects, 7 sessions) — a pile of subjects is not a cycle. A 'no two consecutive sessions equal' LAG test would admit A,B,A,C shuffles. MIN(score)-style extremes do not exist here, but the analogous 'starts and ends with the same subject' check admits plenty of non-periodic lists. The only sound shape test is positional: in a true period-k cycle, every session at position p > k repeats the subject at position p − k.",
      "Assembly: seq CTE numbers positions; dated/gaps CTEs compute and fold the worst pause; meta CTE aggregates n, k and hours. The outer WHERE stacks the four gates — k >= 3, n >= 2k, COALESCE(max_gap, 0) <= 2, and NOT EXISTS (a position pair (p, p−k) with differing subjects) — then ORDER BY cycle_length DESC, total_study_hours DESC as mandated. One scoping detail inside the probe: the self-join itself only ties a and b to EACH OTHER, so the WHERE must also pin a.student_id to the outer student — unscoped, some other student's mismatch vetoes everyone.",
    ],
    edges: [
      "The gap boundary is inclusive: Felix's sessions every 2 days are a legal spiral (gap <= 2), while Hank Moon's single 3-day pause disqualifies an otherwise perfect 3-cycle.",
      "One stray session is fatal: Gina runs a flawless Math→Physics→Chemistry ×2 and then one Art session — 7 sessions over 4 subjects can't complete 2 cycles, and the period probe finds Art where Chemistry should repeat.",
      "An incomplete second cycle fails: Noah has 4 sessions of a valid 3-subject rotation — n = 4 < 2k = 6 excludes him despite perfect periodicity so far.",
      "A legal-but-short cycle is out of scope: Carol's Biology/Chemistry alternation IS periodic, but cycle length 2 < 3 — the spec's floor disqualifies a true 2-subject spiral.",
    ],
    ladder: [
      {
        title: "Brute force — test every candidate period by hand",
        body: "Pull each student's sessions sorted by date, try every plausible period, verify subject equality at each stride and scan the date gaps — all procedural, per student. Correct, but exactly the work the positional self-join formalizes.",
      },
      {
        title: "The pattern — positions, gaps and counts from windows",
        body: "ROW_NUMBER fixes positions, LAG exposes the day gaps, GROUP BY yields n, k and hours. The remaining question — 'does every position p repeat position p − k?' — is a self-join of the numbered list onto itself at offset k.",
      },
      {
        title: "The optimal idea — four gates, one outer WHERE",
        body: "Stack k >= 3, n >= 2k, max gap <= 2 and the no-mismatch periodicity probe as a single filter over per-student aggregates. One sort per student plus an O(s) probe — no procedural loops, no trial periods.",
      },
    ],
    approach: "Position-numbered sessions + LAG gap audit + period-k self-check",
    schema: {
      ddl: `CREATE TABLE students (
  student_id   INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL,
  major        TEXT NOT NULL
);
CREATE TABLE study_sessions (
  session_id    INTEGER PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(student_id),
  subject       TEXT NOT NULL,
  session_date  TEXT NOT NULL,           -- 'YYYY-MM-DD'
  hours_studied REAL NOT NULL
);`,
      seed: `INSERT INTO students (student_id, student_name, major) VALUES
  (1, 'Alice Chen', 'Computer Science'), (2, 'Bob Johnson', 'Mathematics'),
  (3, 'Carol Davis', 'Physics'),         (4, 'David Wilson', 'Chemistry'),
  (5, 'Emma Brown', 'Biology'),                              -- official
  (6, 'Felix Ng', 'Economics'),        (7, 'Gina Park', 'History'),
  (8, 'Hank Moon', 'Art History'),     (9, 'Noah Kim', 'Mathematics');  -- traps
INSERT INTO study_sessions (session_id, student_id, subject, session_date, hours_studied) VALUES
  (1,  1, 'Math',      '2023-10-01', 2.5),  -- official: Alice's 3-cycle, cycle 1
  (2,  1, 'Physics',   '2023-10-02', 3.0),
  (3,  1, 'Chemistry', '2023-10-03', 2.0),
  (4,  1, 'Math',      '2023-10-04', 2.5),  -- official: Alice's cycle 2
  (5,  1, 'Physics',   '2023-10-05', 3.0),
  (6,  1, 'Chemistry', '2023-10-06', 2.0),
  (7,  2, 'Algebra',   '2023-10-01', 4.0),  -- official: Bob's 4-cycle, cycle 1
  (8,  2, 'Calculus',  '2023-10-02', 3.5),
  (9,  2, 'Statistics','2023-10-03', 2.5),
  (10, 2, 'Geometry',  '2023-10-04', 3.0),
  (11, 2, 'Algebra',   '2023-10-05', 4.0),  -- official: Bob's cycle 2
  (12, 2, 'Calculus',  '2023-10-06', 3.5),
  (13, 2, 'Statistics','2023-10-07', 2.5),
  (14, 2, 'Geometry',  '2023-10-08', 3.0),
  (15, 3, 'Biology',   '2023-10-01', 2.0),  -- official: Carol, only 2 subjects
  (16, 3, 'Chemistry', '2023-10-02', 2.5),
  (17, 3, 'Biology',   '2023-10-03', 2.0),
  (18, 3, 'Chemistry', '2023-10-04', 2.5),
  (19, 4, 'Organic',   '2023-10-01', 3.0),  -- official: David, 4-day gap
  (20, 4, 'Physical',  '2023-10-05', 2.5),
  (21, 6, 'Math',      '2023-10-01', 2.5),  -- TRAP: Felix's 3-cycle on 2-day gaps
  (22, 6, 'Physics',   '2023-10-03', 2.0),
  (23, 6, 'Chemistry', '2023-10-05', 1.5),
  (24, 6, 'Math',      '2023-10-07', 2.5),
  (25, 6, 'Physics',   '2023-10-09', 2.0),
  (26, 6, 'Chemistry', '2023-10-11', 1.5),
  (27, 7, 'Math',      '2023-10-01', 2.0),  -- TRAP: Gina, perfect 3-cycle ...
  (28, 7, 'Physics',   '2023-10-02', 2.0),
  (29, 7, 'Chemistry', '2023-10-03', 2.0),
  (30, 7, 'Math',      '2023-10-04', 2.0),
  (31, 7, 'Physics',   '2023-10-05', 2.0),
  (32, 7, 'Chemistry', '2023-10-06', 2.0),
  (33, 7, 'Art',       '2023-10-07', 3.0),  -- ... plus ONE stray session
  (34, 8, 'Math',      '2023-10-01', 3.0),  -- TRAP: Hank Moon, perfect 3-cycle ...
  (35, 8, 'Physics',   '2023-10-02', 3.0),
  (36, 8, 'Chemistry', '2023-10-03', 3.0),
  (37, 8, 'Math',      '2023-10-06', 3.0),  -- ... split by a 3-DAY pause (10-03 -> 10-06)
  (38, 8, 'Physics',   '2023-10-07', 3.0),
  (39, 8, 'Chemistry', '2023-10-08', 3.0),
  (40, 9, 'Math',      '2023-10-01', 1.0),  -- TRAP: Noah, only 4 of 6 sessions
  (41, 9, 'Physics',   '2023-10-02', 1.0),
  (42, 9, 'Chemistry', '2023-10-03', 1.0),
  (43, 9, 'Math',      '2023-10-04', 1.0);`,
      tables: [
        { name: "students", note: "9 students — the official 5 plus four trap histories" },
        { name: "study_sessions", note: "43 sessions — clean 3- and 4-cycles, a 2-day-gap spiral, a stray-session break, a 3-day pause and an unfinished second cycle" },
      ],
    },
    code: `WITH seq AS (
    -- position each session within its student's chronological order
    SELECT
        student_id,
        subject,
        ROW_NUMBER() OVER (
            PARTITION BY student_id
            ORDER BY session_date, session_id
        ) AS pos
    FROM study_sessions
),
dated AS (
    -- expose the day gap between consecutive sessions per student
    SELECT
        student_id,
        julianday(session_date)
          - julianday(LAG(session_date) OVER (
                PARTITION BY student_id
                ORDER BY session_date, session_id
            )) AS gap_days
    FROM study_sessions
),
gaps AS (
    SELECT student_id, MAX(gap_days) AS max_gap   -- the worst pause on record
    FROM dated
    GROUP BY student_id
),
meta AS (
    -- sessions on record, distinct subjects, total hours — one row per student
    SELECT
        student_id,
        COUNT(*)                AS n,
        COUNT(DISTINCT subject) AS k,
        SUM(hours_studied)      AS total_study_hours
    FROM study_sessions
    GROUP BY student_id
)
SELECT
    st.student_id,
    st.student_name,
    st.major,
    m.k                  AS cycle_length,      -- distinct subjects in the rotation
    m.total_study_hours
FROM meta m
JOIN students st ON st.student_id = m.student_id
LEFT JOIN gaps g ON g.student_id = m.student_id
WHERE m.k >= 3                                  -- at least 3 rotating subjects
  AND m.n >= 2 * m.k                            -- at least 2 complete cycles (>= 6 sessions)
  AND COALESCE(g.max_gap, 0) <= 2               -- never more than 2 days between sessions
  AND NOT EXISTS (                              -- period-k probe: every session ...
        SELECT 1                                -- ... repeats the one k slots earlier
        FROM seq a
        JOIN seq b ON b.student_id = a.student_id AND b.pos = a.pos - m.k
        WHERE a.student_id = m.student_id       -- probe THIS student's positions only
          AND a.subject <> b.subject)
ORDER BY cycle_length DESC, total_study_hours DESC;`,
    walkthrough: [
      "seq numbers each history chronologically: Alice pos 1–6 cycle Math/Physics/Chemistry twice; Gina pos 1–7 with Art parked at pos 7; Noah pos 1–4 stops mid-second-cycle.",
      "dated and gaps audit the calendar: daily histories (Alice, Bob, Gina, Noah) peak at gap 1; Felix's every-2-days spacing peaks at exactly 2 — tolerated; Hank Moon's Oct 3 → Oct 6 jump peaks at 3 — fatal; David's lone gap is 4.",
      "meta aggregates the shape facts: Alice 6/3/15.0, Bob 8/4/26.0, Felix 6/3/12.0, Gina 7/4/24.0, Hank Moon 6/3/18.0, Noah 4/3/4.0, Carol 4/2, David 2/2 — Emma has no row at all.",
      "The four gates sort everyone out: k >= 3 removes Carol and David; n >= 2k removes Noah (4 < 6) and Gina (7 < 8); max_gap <= 2 removes Hank Moon (3); the NOT EXISTS probe then verifies periodicity for the survivors — Bob's positions 5–8 repeat 1–4, Alice's 4–6 repeat 1–3, Felix's repeat at stride 3. Ordered output: Bob (4, 26.0), Alice (3, 15.0), Felix (3, 12.0).",
    ],
    time: "O(s log s) — the per-student session sort drives ROW_NUMBER and LAG; the periodicity probe is O(s) position lookups per student",
    space: "O(s) — the numbered, dated and per-student aggregate CTEs",
    followUps: [
      "Find the LONGEST spiral embedded in a messier history (other sessions between spiral stretches) — gaps-and-islands over the periodicity violations, then pick the longest island per student.",
      "Relax the floor: allow 2-subject rotations but demand 3 complete cycles instead of 2 — which gate constants change, and does the period probe need any change at all?",
    ],
    related: ["find-loyal-customers", "find-users-with-persistent-behavior-patterns", "consecutive-numbers"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-covid-recovery-patients",
    statement:
      "COVID tests return Positive, Negative or Inconclusive per patient per date. A patient has recovered when at least one Positive test is followed — on a strictly LATER date — by at least one Negative test. Recovery time is the gap in days between the first positive test and the first negative test that comes after it. Report recovered patients with their recovery time.",
    examples: [
      {
        input:
          "Alice pos 01-15 → neg 01-25 · Bob pos 02-01, Inconclusive 02-05, neg 02-12 · Carol neg 01-20, pos 02-10, neg 02-20 · David positives only · Emma negatives only — traps: Frank pos 01-01 → neg 01-05, re-infected pos 02-01 → neg 02-20 · Grace pos AND neg both on 03-01, then neg 03-10 · Henry positive then Inconclusives only · Ivy pos 04-01 → neg 04-02",
        output:
          "(9, Ivy Chan, 26, 1) · (6, Frank Moore, 50, 4) · (7, Grace Lee, 33, 9) · (1, Alice Smith, 28, 10) · (3, Carol Davis, 42, 10) · (2, Bob Johnson, 35, 11)",
        explanation:
          "Recovery anchors to the FIRST positive and the first negative STRICTLY after it: Ivy's next-day flip gives 1 day, Frank's re-infection changes nothing (4, not 19), Grace's same-day negative doesn't count so 03-10 gives 9, Carol's pre-infection negative (01-20) is invisible. Henry never converts (Inconclusive twice), David stays positive, Emma was never positive.",
      },
    ],
    constraints: [
      "result is one of Positive, Negative, Inconclusive",
      "the negative must land on a LATER date than the positive — a same-day negative does not recover anyone",
      "recovery time = first negative after the first positive, measured in days",
    ],
    breakdown: [
      "The definition is a two-anchor question with a direction: anchor on the patient's FIRST positive (MIN test_date among Positives), then find the MIN negative dated strictly AFTER that anchor. Everything else in the history — earlier negatives (Carol's 01-20 screening), Inconclusive noise (Bob's 02-05), re-infection episodes (Frank's February round) — is either invisible or irrelevant to the pair.",
      "The core mechanism is two grouped CTEs and a join. first_pos computes MIN(test_date) per patient with WHERE result = 'Positive' — one anchor row per infected patient. The recovery pass joins covid_tests back on patient_id with result = 'Negative' AND test_date > pos_date and takes MIN(test_date) — the first qualifying negative. The strict > is what excludes Grace's same-day 03-01 negative.",
      "Why naive forms fail: 'patient has both a Positive and a Negative somewhere' would admit Carol via her pre-infection screen (and pair 01-20 against 02-10 for a nonsense gap); 'first negative overall' without the > pos_date gate grabs Carol's 01-20; counting a same-day negative recovers Grace one week early. And patients with no qualifying negative — David (positives only), Henry (Inconclusive after), Emma (never positive) — must fall out as absent rows, not NULLs to clean up later.",
      "Assembly: julianday(neg_date) − julianday(pos_date) turns the gap into an exact day count for ISO dates; CAST to INTEGER keeps the output column integral. Join patients for name and age, ORDER BY recovery_time ASC, patient_name ASC — the mandated order that separates Alice and Carol at 10 by name and lines Ivy's 1 up first.",
    ],
    edges: [
      "Same-day does not count: Grace's Negative on 03-01 shares a date with her Positive — 'later date' is strict, so her first qualifying negative is 03-10 and recovery is 9 days, not 0.",
      "Re-infection is invisible: Frank's second Positive (02-01) and Negative (02-20) form a 19-day episode, but the rule anchors to the FIRST positive — the answer is 4 days from the January pair.",
      "Pre-infection negatives are bait: Carol's 01-20 Negative precedes her 02-10 Positive and must not pair with it — the > pos_date join gate hides it.",
      "No qualifying pair, no row: David (never negative after positives), Henry (only Inconclusives after his positive) and Emma (never positive) all print nothing — no NULL recovery_time rows to filter later.",
    ],
    ladder: [
      {
        title: "Brute force — a cursor per patient",
        body: "Sort each patient's tests, scan to the first positive, keep scanning for the first later negative, note the gap. In SQL this shape becomes correlated subqueries re-reading the tests table once per patient.",
      },
      {
        title: "The pattern — anchor MIN plus gated MIN",
        body: "MIN(test_date) grouped per patient over Positive rows names every anchor in one pass; the recovery date is MIN(negative date) restricted to dates strictly after the anchor — a join plus a second grouped MIN.",
      },
      {
        title: "The optimal idea — two CTEs, one join, integer days",
        body: "first_pos → negatives-after-anchor → julianday difference cast to INTEGER, joined to patients and ordered. Two grouped passes over t tests with primary-key-grade joins — nothing per-row remains.",
      },
    ],
    approach: "First-positive anchor + first-negative-after join",
    schema: {
      ddl: `CREATE TABLE patients (
  patient_id   INTEGER PRIMARY KEY,
  patient_name TEXT NOT NULL,
  age          INTEGER NOT NULL
);
CREATE TABLE covid_tests (
  test_id    INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
  test_date  TEXT NOT NULL,                -- 'YYYY-MM-DD'
  result     TEXT NOT NULL CHECK (result IN ('Positive','Negative','Inconclusive'))
);`,
      seed: `INSERT INTO patients (patient_id, patient_name, age) VALUES
  (1, 'Alice Smith', 28), (2, 'Bob Johnson', 35), (3, 'Carol Davis', 42),
  (4, 'David Wilson', 31), (5, 'Emma Brown', 29),              -- official
  (6, 'Frank Moore', 50),  (7, 'Grace Lee', 33),
  (8, 'Henry Adams', 61),  (9, 'Ivy Chan', 26);                -- traps
INSERT INTO covid_tests (test_id, patient_id, test_date, result) VALUES
  (1,  1, '2023-01-15', 'Positive'),   -- official: Alice
  (2,  1, '2023-01-25', 'Negative'),   -- ... recovers in 10 days
  (3,  2, '2023-02-01', 'Positive'),   -- official: Bob
  (4,  2, '2023-02-05', 'Inconclusive'),-- ... noise between the anchors
  (5,  2, '2023-02-12', 'Negative'),   -- ... recovers in 11 days
  (6,  3, '2023-01-20', 'Negative'),   -- official: Carol's PRE-infection negative
  (7,  3, '2023-02-10', 'Positive'),
  (8,  3, '2023-02-20', 'Negative'),   -- ... first negative AFTER 02-10
  (9,  4, '2023-01-10', 'Positive'),   -- official: David, positives only
  (10, 4, '2023-01-18', 'Positive'),
  (11, 5, '2023-02-15', 'Negative'),   -- official: Emma, never positive
  (12, 5, '2023-02-20', 'Negative'),
  (13, 6, '2023-01-01', 'Positive'),   -- TRAP: Frank, first episode ...
  (14, 6, '2023-01-05', 'Negative'),   -- ... recovery 4 days
  (15, 6, '2023-02-01', 'Positive'),   -- ... re-infection ...
  (16, 6, '2023-02-20', 'Negative'),   -- ... must NOT move the answer to 19
  (17, 7, '2023-03-01', 'Positive'),   -- TRAP: Grace, same-date pair ...
  (18, 7, '2023-03-01', 'Negative'),   -- ... does NOT count ...
  (19, 7, '2023-03-10', 'Negative'),   -- ... recovery 9 days
  (20, 8, '2023-01-15', 'Positive'),   -- TRAP: Henry, never turns negative
  (21, 8, '2023-01-20', 'Inconclusive'),
  (22, 8, '2023-02-01', 'Inconclusive'),
  (23, 9, '2023-04-01', 'Positive'),   -- TRAP: Ivy, next-day recovery
  (24, 9, '2023-04-02', 'Negative');   -- ... 1 day`,
      tables: [
        { name: "patients", note: "9 patients — the official 5 plus four trap histories" },
        { name: "covid_tests", note: "24 tests — pre-infection negatives, Inconclusive noise, a same-day pair, a re-infection and a 1-day recovery" },
      ],
    },
    code: `WITH first_pos AS (
    -- anchor each infected patient on their FIRST positive test
    SELECT patient_id, MIN(test_date) AS pos_date
    FROM covid_tests
    WHERE result = 'Positive'
    GROUP BY patient_id
),
recovered AS (
    -- the first NEGATIVE dated strictly AFTER that anchor
    SELECT f.patient_id,
           f.pos_date,
           MIN(t.test_date) AS neg_date
    FROM first_pos f
    JOIN covid_tests t
      ON t.patient_id = f.patient_id
     AND t.result     = 'Negative'
     AND t.test_date  > f.pos_date        -- strict: same-day does not recover
    GROUP BY f.patient_id, f.pos_date
)
SELECT
    p.patient_id,
    p.patient_name,
    p.age,
    CAST(julianday(r.neg_date) - julianday(r.pos_date) AS INTEGER)
        AS recovery_time                  -- exact day gap between the anchors
FROM recovered r
JOIN patients p ON p.patient_id = r.patient_id
ORDER BY recovery_time ASC, p.patient_name ASC;`,
    walkthrough: [
      "first_pos anchors every infected patient: Alice 01-15, Bob 02-01, Carol 02-10, David 01-10, Frank 01-01 (not 02-01 — MIN wins), Grace 03-01, Henry 01-15, Ivy 04-01. Emma is absent — never positive, no anchor, no row later.",
      "The gated join looks for negatives STRICTLY after each anchor: Carol's 01-20 screen is before 02-10 and never matches; Grace's 03-01 negative ties her positive date and fails the strict >, leaving 03-10; Bob's Inconclusive rows never match result = 'Negative'; Frank's 01-05 and 02-20 both qualify but MIN takes 01-05.",
      "MIN per patient lands the recovery dates: Ivy 04-02, Frank 01-05, Grace 03-10, Alice 01-25, Carol 02-20, Bob 02-12. David and Henry find no qualifying negative — their rows simply do not exist in recovered.",
      "julianday differences cast to INTEGER give 1, 4, 9, 10, 10, 11 days; ORDER BY recovery_time ASC then name prints Ivy Chan, Frank Moore, Grace Lee, then the 10-day tie Alice Smith before Carol Davis, then Bob Johnson.",
    ],
    time: "O(t log t) — one grouped pass over t tests for the anchors, then index probes for the gated negatives; the final join is linear in recovered patients",
    space: "O(p) — one anchor row and one recovery row per patient",
    followUps: [
      "Report EVERY infection episode instead of the first: each Positive→Negative pair with its own gap — how does the single anchor MIN become a gaps-and-islands split on Positive rows?",
      "Tests carry timestamps (DATETIME) instead of dates — 'later date' becomes 'later instant', and the same-day exclusion disappears; what else in the recovery definition changes meaning?",
    ],
    related: ["rising-temperature", "the-latest-login-in-2020", "game-play-analysis-iv"],
    order: "exact",
    xp: 20,
  },
];
