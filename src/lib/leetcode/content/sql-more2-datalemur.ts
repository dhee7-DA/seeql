// Deep-dives — the SQL band expansion batch 3: DataLemur classics (3 problems,
// re-authored from the canonical tasks). Custom 95xx ids (not LeetCode
// numbers). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE2_DATALEMUR: LcSqlDive[] = [
  {
    slug: "uber-first-transaction",
    statement:
      "riders lists an app's registered riders; rides logs every completed trip with its date, type and fare. For each rider, find their FIRST ride — the earliest ride_date — and if a rider took several rides on that first day, the one with the smaller ride_id. Report user_id, the rider's first_name, ride_date and ride_type, ordered by user_id.",
    examples: [
      {
        input: "Ben's rides: (102, 2024-01-04, Economy) and (106, 2024-01-04, Premium) — same day",
        output: "2 · Ben · 2024-01-04 · Economy",
        explanation: "Both rides sit on Ben's earliest date, so the tie-break decides: the smaller ride_id (102) wins, making Economy the reported type.",
      },
    ],
    constraints: [
      "first ride = earliest ride_date; same-day ties broken by the SMALLER ride_id",
      "exactly one row per rider, no matter how many rides they took",
      "output columns: user_id, first_name, ride_date, ride_type — ordered by user_id",
    ],
    breakdown: [
      "'First per group' is a per-partition extremum, and ROW_NUMBER is the direct tool: partition rides by user_id, and inside each partition sort by (ride_date, ride_id). The row numbered 1 is definitionally the first ride under the spec's contract — earliest date, smallest id breaking same-day ties. One window expression replaces what would otherwise be a per-rider MIN plus a re-join to recover the ride_type.",
      "The tie-break must live INSIDE the window's ORDER BY, not in the outer query. A single-key sort (ride_date alone) leaves the two same-day rows in engine-dependent order — Ben's 'first ride' could flip between Economy and Premium across runs. The pair (ride_date ASC, ride_id ASC) is a total order because ride_id is unique, so the ranking — and therefore the answer — is fully deterministic. When a spec names a tie-break, that key belongs in the ranking, not bolted on afterwards.",
      "fare rides along in the schema and never enters the query — real interview tables always carry more columns than the question needs, and part of the skill is selecting the three the contract mentions (user_id, ride_date, ride_type) and ignoring the rest. The same problem has two classic alternatives worth naming: MIN(ride_date) OVER (PARTITION BY user_id) with a second pick for the smallest ride_id at that date, or a correlated subquery — both correct, both clumsier than one ranked CTE.",
    ],
    edges: [
      "Tie-break inside the window: ORDER BY ride_date, ride_id — date alone leaves same-day ties to the engine's mood.",
      "WHERE rn = 1 filters the NUMBERED rows, so it sits outside the CTE — window functions can't appear in WHERE at their own level.",
      "The join to riders is 1:1 on user_id and can't change which ride is 'first' — it only decorates rows with names.",
      "One row per rider by construction: PARTITION BY user_id restarts the numbering for each rider.",
    ],
    ladder: [
      { title: "Brute force — per-rider MIN in a loop", body: "Query each rider's MIN(ride_date), then a second query per rider to fetch the ride_type (and the ride_id tie-break) at that date — N+1 queries, with the determinism problem still unsolved." },
      { title: "The pattern — window ranking per rider", body: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ride_date, ride_id) numbers each rider's rides in the contract's order; rn = 1 is the first ride, exactly one per partition." },
      { title: "The optimal idea — one ranked pass", body: "O(n log n) for the per-partition sort. MIN() OVER (PARTITION BY user_id) or a correlated subquery also work — both need extra steps to resolve the same-day tie that the two-key window ORDER BY settles for free." },
    ],
    approach: "ROW_NUMBER over (ride_date, ride_id) per rider; keep rn = 1",
    schema: {
      ddl: `CREATE TABLE riders (
  user_id    INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL
);
CREATE TABLE rides (
  ride_id   INTEGER PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES riders(user_id),
  ride_date TEXT NOT NULL,
  ride_type TEXT NOT NULL,
  fare      REAL NOT NULL
);`,
      seed: `INSERT INTO riders (user_id, first_name) VALUES
  (1,'Ana'),(2,'Ben'),(3,'Cy'),(4,'Dee'),(5,'Ed');
INSERT INTO rides (ride_id, user_id, ride_date, ride_type, fare) VALUES
  (101,1,'2024-01-03','Premium',24.0),
  (105,1,'2024-01-05','Economy',12.5),
  (102,2,'2024-01-04','Economy',9.0),
  (106,2,'2024-01-04','Premium',20.0),
  (103,3,'2024-02-01','Premium',31.0),
  (104,4,'2024-01-10','Economy',8.0),
  (107,4,'2024-01-12','Economy',11.0),
  (108,5,'2024-03-03','Premium',27.5);`,
      tables: [
        { name: "riders", note: "5 riders, ids 1–5" },
        { name: "rides", note: "8 trips; Ben took two on 2024-01-04 (ids 102, 106)" },
      ],
    },
    code: `WITH firsts AS (
    SELECT
        user_id,
        ride_date,
        ride_type,
        ROW_NUMBER() OVER (PARTITION BY user_id
                           ORDER BY ride_date, ride_id) AS rn
    FROM rides
)
SELECT
    f.user_id,
    r.first_name,
    f.ride_date,
    f.ride_type
FROM firsts f
JOIN riders r ON r.user_id = f.user_id
WHERE f.rn = 1
ORDER BY f.user_id;`,
    walkthrough: [
      "firsts numbers each rider's rides: Ana 101→1; Ben 102→1, 106→2 (same date, so the ride_id tie-break puts 102 first); Cy 103→1; Dee 104→1, 107→2; Ed 108→1.",
      "WHERE rn = 1 keeps five rows: Ana 2024-01-03 Premium, Ben 2024-01-04 Economy, Cy 2024-02-01 Premium, Dee 2024-01-10 Economy, Ed 2024-03-03 Premium.",
      "The 1:1 join adds first_name (Ana, Ben, Cy, Dee, Ed) and ORDER BY user_id hands the report over in rider order — Ben's answer is Economy because 102 < 106.",
    ],
    time: "O(n log n) — one sort of rides by (user_id, ride_date, ride_id)",
    space: "O(n) — the ranked CTE",
    followUps: [
      "Each rider's first PREMIUM ride — where does the ride_type predicate go, and what happens to riders with none?",
      "Riders who never took a ride — which join keeps them, and what do their first-ride columns read?",
    ],
    related: ["department-highest-salary", "top-five-artists"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "linkedin-power-creators",
    statement:
      "employees stores a company's staff; each person's manager_id points at another row in the SAME table (the CEO's manager_id is NULL). 'Power creators' were hired BEFORE their own manager. Report each power creator's name, title, hired_date and their manager's name, earliest hires first.",
    examples: [
      {
        input: "Lena (Director, 2016-06-15) reports to Priya (CEO, 2017-01-01) · Ivy (Manager, 2018-09-01) reports to Omar (Director, 2019-03-01) · Sam (Manager, 2020-04-01) reports to Omar (2019-03-01)",
        output: "Lena · Director · 2016-06-15 · Priya / Ivy · Manager · 2018-09-01 · Omar",
        explanation: "Lena and Ivy predate their managers; Sam, Bo and Kim all joined after theirs — and Priya, with no manager, can't qualify by construction.",
      },
    ],
    constraints: [
      "manager_id references employees.employee_id — a manager is just another row of the same table",
      "the CEO's manager_id is NULL; employees with no manager cannot qualify",
      "output columns: employee_name, title, hired_date, manager_name — ordered by hired_date ascending",
    ],
    breakdown: [
      "The self-join is the whole mechanism: one physical table, two aliases playing two roles. e is the employee under evaluation, m is e's manager, and ON m.employee_id = e.manager_id converts the self-reference column into a row-level pairing — suddenly both hire dates sit side by side on one joined row, comparable with an ordinary < operator.",
      "INNER JOIN silently drops the CEO (a NULL manager_id matches nothing) — and that drop is SAFE here, not lazy: an employee with no manager cannot be 'hired before their manager', so the missing rows are exactly the non-qualifying ones. Saying WHY the drop is safe is part of the interview answer — the moment the question becomes 'every employee WITH their manager, even if none', the same query must switch to LEFT JOIN.",
      "The predicate turns an org chart into a timeline race: e.hired_date < m.hired_date keeps the pairs where the report beat the boss to the door. This is the sibling of employees-earning-more-than-their-managers — identical skeleton, numeric predicate instead of a date one; any 'X relative to their manager' question is this pattern with a different comparison. No fan-out risk either: each employee has exactly one manager, so the join is 1:1 and duplicates can't appear.",
    ],
    edges: [
      "Two aliases are mandatory — employees JOIN employees without aliases is a parse error.",
      "The CEO vanishes via INNER JOIN; safe ONLY because a NULL-manager row can't qualify — articulate that in the interview.",
      "ISO 'YYYY-MM-DD' strings compare correctly as text — but only because the format is fixed-width; don't CAST.",
      "One manager per employee means no join fan-out — adding DISTINCT here would be a smell.",
    ],
    ladder: [
      { title: "Brute force — app-side lookups", body: "Scan employees, look up each manager by id in code, compare dates per pair — N+1 queries for what one join does in a single pass." },
      { title: "The pattern — two aliases, two roles", body: "employees e JOIN employees m ON m.employee_id = e.manager_id puts every employee beside their manager on one row." },
      { title: "The optimal idea — predicate on the pair", body: "WHERE e.hired_date < m.hired_date, ORDER BY hired_date. O(n) with a hash join — the same shape as employees-earning-more-than-their-managers, one comparison swapped." },
    ],
    approach: "Self-join with two aliases; keep employees hired before their manager",
    schema: {
      ddl: `CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  title       TEXT NOT NULL,
  hired_date  TEXT NOT NULL,
  manager_id  INTEGER REFERENCES employees(employee_id)
);`,
      seed: `INSERT INTO employees (employee_id, name, title, hired_date, manager_id) VALUES
  (1,'Priya','CEO','2017-01-01',NULL),
  (2,'Omar','Director','2019-03-01',1),
  (3,'Lena','Director','2016-06-15',1),
  (4,'Sam','Manager','2020-04-01',2),
  (5,'Ivy','Manager','2018-09-01',2),
  (6,'Bo','Analyst','2021-02-01',4),
  (7,'Kim','Analyst','2020-11-01',5);`,
      tables: [
        { name: "employees", note: "7 staff, self-referencing manager_id; Lena and Ivy predate their managers" },
      ],
    },
    code: `SELECT
    e.name AS employee_name,
    e.title,
    e.hired_date,
    m.name AS manager_name
FROM employees e
JOIN employees m ON m.employee_id = e.manager_id
WHERE e.hired_date < m.hired_date
ORDER BY e.hired_date;`,
    walkthrough: [
      "The self-join pairs each employee with their manager: Omar→Priya, Lena→Priya, Sam→Omar, Ivy→Omar, Bo→Sam, Kim→Ivy; Priya's NULL manager_id matches nothing, so she drops.",
      "The date race on each pair: Lena 2016-06-15 beats Priya 2017-01-01; Ivy 2018-09-01 beats Omar 2019-03-01; Omar, Sam, Bo and Kim all joined after their managers and lose.",
      "Two survivors, ordered by hired_date: Lena (2016-06-15) with manager Priya, then Ivy (2018-09-01) with manager Omar.",
    ],
    time: "O(n) — one hash-joined scan",
    space: "O(n) — the joined pairs",
    followUps: [
      "Every employee listed WITH their manager, including the CEO — which join keyword changes, and what does IFNULL(m.name, '—') add?",
      "Power creators per manager — GROUP BY m.name over the same join; which manager has the most?",
    ],
    related: ["employees-earning-more-than-their-managers", "market-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "compressed-mode",
    statement:
      "measurements logs sensor readings. Find the MODE of value — the value that occurs most often — and when several values tie for the highest frequency, report the SMALLEST of them. Output one row, one column: mode_value.",
    examples: [
      {
        input: "values: 3, 5, 3, 5, 7, 8, 3, 2, 5",
        output: "3",
        explanation: "3 and 5 both occur three times — the tie for highest frequency is broken toward the smaller value, 3.",
      },
    ],
    constraints: [
      "the mode is the value with the highest FREQUENCY, not the highest value",
      "frequency ties are broken toward the smallest value",
      "output exactly one row with one column, mode_value",
    ],
    breakdown: [
      "Aggregate-of-aggregates: count per value (GROUP BY value), then take MAX over those counts. The two stages work at different grains — value-grain first, whole-set-grain second — and SQL forbids nesting them in one expression, so the counts live in their own CTE the outer query can consume. This two-layer shape is the standard answer whenever a question asks for an aggregate OF an aggregate.",
      "WHERE can't reference an aggregate at its own level — WHERE freq = MAX(freq) is illegal by design, because WHERE runs before groups exist. The max therefore lives in a tiny CTE (or scalar subquery) of its own, and the outer WHERE freq = (SELECT m FROM top) filters the value-grain rows down to the winners. The awkwardness is the lesson: SQL's clause evaluation order forces aggregate-of-aggregate questions through an explicit intermediate.",
      "The tie policy is ONE keyword: MIN(value) over the surviving set. Every survivor shares the same top frequency, so MIN picks the spec-mandated smallest deterministically — no ORDER BY, no LIMIT, no rank juggling. And unlike biggest-single-number, this query always answers on a non-empty table: every value in a non-empty table has a count, and the max of those counts is achieved — the empty-table edge is a follow-up worth rehearsing.",
    ],
    edges: [
      "MAX(freq) over the COUNTS, not MAX(value) — the mode is about frequency.",
      "The max lives in a subquery: aggregates can't nest and can't appear in WHERE at their own level.",
      "MIN(value) IS the tie policy — smallest among the tied winners, decided after the filter, not in a sort.",
      "COUNT(*) counts occurrences per value — GROUP BY value collapsed the duplicates first.",
    ],
    ladder: [
      { title: "Brute force — sort and take row one", body: "SELECT value, COUNT(*) … ORDER BY freq DESC, value ASC LIMIT 1 — correct, but it hides the tie logic inside sort order and returns a row-picking trick instead of the aggregate story." },
      { title: "The pattern — two stacked grains", body: "A CTE counts occurrences per value; a second CTE (or scalar subquery) takes MAX(freq) over those counts. Two grains, two clean layers." },
      { title: "The optimal idea — filter to the winners, MIN the rest", body: "WHERE freq = top-frequency, then MIN(value) — the tie policy is a single aggregate over the surviving set. Two linear passes, O(n)." },
    ],
    approach: "Count per value, MAX the counts in a CTE, MIN(value) among the winners",
    schema: {
      ddl: `CREATE TABLE measurements (
  measurement_id INTEGER PRIMARY KEY,
  value          INTEGER NOT NULL
);`,
      seed: `INSERT INTO measurements (measurement_id, value) VALUES
  (1,3),(2,5),(3,3),(4,5),(5,7),(6,8),(7,3),(8,2),(9,5);`,
      tables: [{ name: "measurements", note: "9 readings; 3 and 5 tie at frequency 3" }],
    },
    code: `WITH counts AS (
    SELECT
        value,
        COUNT(*) AS freq
    FROM measurements
    GROUP BY value
),
top AS (
    SELECT MAX(freq) AS m
    FROM counts
)
SELECT MIN(value) AS mode_value
FROM counts
WHERE freq = (SELECT m FROM top);`,
    walkthrough: [
      "counts tallies per value: 2→1, 3→3, 5→3, 7→1, 8→1.",
      "top collapses the counts to one scalar: MAX(freq) = 3.",
      "WHERE freq = 3 keeps values 3 and 5; MIN(value) returns 3 — the smaller tied winner — as the single output row mode_value = 3.",
    ],
    time: "O(n) — two aggregation passes",
    space: "O(d) — one count row per distinct value",
    followUps: [
      "What happens on an EMPTY measurements table — trace MAX of nothing, the empty WHERE, and the NULL row MIN returns.",
      "Report ALL modes, not just the smallest — which one keyword in the final SELECT changes?",
    ],
    related: ["ratings-histogram", "biggest-single-number"],
    order: "any",
    xp: 20,
  },
];
