// Deep-dives — the SQL 50 subqueries band (7 problems, including both Hard
// problems of the list: day-1 retention cohorts and departmental top-three
// salaries). Solutions are SQLite dialect, one statement each, and are
// engine-verified by scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_SUBQUERIES: LcSqlDive[] = [
  {
    slug: "employees-whose-manager-left-the-company",
    statement:
      "Each row of Employees names an employee and, for everyone below the top, points at their manager via manager_id. When a manager leaves the company their row is deleted, but the people they managed keep pointing at the departed id — a dangling reference, with no 'departed' flag anywhere. Report the id and name of every employee whose manager has left: they have a manager_id, and no row carrying that employee_id exists.",
    examples: [
      {
        input:
          "Employees: (3,'Brad',NULL,4000),(1,'John',3,1000),(2,'Dan',3,2000),(4,'Thomas',3,4000),(9,'Zara',2,9000),(8,'Maya',6,5000),(7,'Omar',12,4500)",
        output: "7 Omar · 8 Maya",
        explanation:
          "John, Dan, Thomas and Zara point at ids (3 or 2) still on staff, and Brad has no manager at all. Maya and Omar point at ids 6 and 12, which exist nowhere in the table — their managers left.",
      },
    ],
    constraints: [
      "manager_id is NULL for top-level managers only",
      "a manager_id may reference an employee_id no longer present — that dangling reference is the signal",
      "output columns: employee_id, name",
    ],
    breakdown: [
      "Translate 'manager left the company' literally: the employee's manager_id still points somewhere, but no row in Employees carries that employee_id anymore. It's a dangling foreign key — the data model has no departed flag, so absence is the only signal. Once phrased that way the query writes itself: keep rows whose manager_id is not NULL and does not appear in the set of live ids.",
      "This is an anti-join — 'rows of A with no partner in B'. SQL gives three spellings: NOT IN (subquery), NOT EXISTS, and LEFT JOIN + IS NULL. They agree only when NULLs are kept out of the picture, and this schema deliberately contains one: Brad's manager_id. A subquery over manager_id (instead of employee_id) hands NOT IN a NULL, and NULL poisons the comparison — x NOT IN (3, NULL) is never TRUE, not even for x = 1, so one stray NULL empties the whole result.",
      "The safe NOT IN targets employee_id, which is a primary key and can never be NULL. The IS NOT NULL guard on the outer query isn't strictly required for the grade — a NULL manager_id fails NOT IN anyway — but writing it states the intent ('top managers don't qualify because they have no manager, not because theirs left') and keeps the query honest under refactoring.",
    ],
    edges: [
      "Subquery the wrong column — SELECT manager_id — and Brad's NULL enters the list: NOT IN with a NULL member rejects every row and the output is silently empty. Select employee_id (a PK, never NULL) or use NOT EXISTS.",
      "manager_id IS NULL rows are top managers, not orphans — exclude them explicitly; their managers didn't leave, they never existed.",
      "Zara reports to 2, who reports to 3: a live chain. Only the DIRECT manager's presence matters, not the whole ancestry.",
      "Dangling manager references are data here, not corruption — those rows are exactly the answer.",
    ],
    ladder: [
      {
        title: "Brute force — probe each manager by hand",
        body: "For every employee, look up whether any row has employee_id = my manager_id. In app code that's N queries; as a correlated subquery it's N index probes. Correct, but you're hand-rolling an anti-join.",
      },
      {
        title: "The pattern — set membership and its negation",
        body: "Collect the live ids once (SELECT employee_id FROM Employees) and ask manager_id NOT IN that set. Membership tests turn per-row lookups into one set comparison per row.",
      },
      {
        title: "The optimal idea — NULL-proof anti-join",
        body: "NOT IN over the PK column (NULL-impossible), with the outer IS NOT NULL stating intent. NOT EXISTS is the fully NULL-proof spelling and performs identically with an index on employee_id.",
      },
    ],
    approach: "NULL-guarded NOT IN anti-join",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  manager_id  INTEGER REFERENCES Employees(employee_id),
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name, manager_id, salary) VALUES
  (3,'Brad',NULL,4000),   -- top of the chain: no manager, never qualifies
  (1,'John',3,1000),      -- manager 3 on staff
  (2,'Dan',3,2000),       -- manager 3 on staff
  (4,'Thomas',3,4000),    -- manager 3 on staff
  (9,'Zara',2,9000),      -- manager 2 exists (2 herself reports to 3): chain, not absence
  (8,'Maya',6,5000),      -- manager 6 gone -> qualifies
  (7,'Omar',12,4500);     -- manager 12 gone -> qualifies`,
      tables: [
        { name: "Employees", note: "7 staff on one reporting tree — ids 6 and 12 are pointed at but absent: they left" },
      ],
    },
    code: `SELECT
    e.employee_id,
    e.name
FROM Employees e
WHERE e.manager_id IS NOT NULL        -- top managers: nobody could have "left" them
  AND e.manager_id NOT IN (
        -- every employee id STILL ON STAFF. Select manager_id here instead and
        -- Brad's NULL enters the list: x NOT IN (..., NULL) is never TRUE,
        -- which wipes out every row of the answer.
        SELECT m.employee_id
        FROM Employees m
      )
ORDER BY e.employee_id;`,
    walkthrough: [
      "Employees e is scanned once per candidate row; the WHERE clause is the entire logic. The first condition removes Brad-style rows — a NULL manager means 'reports to no one', so no manager can have left them.",
      "The subquery builds the set of live ids {1, 2, 3, 4, 7, 8, 9} — one pass over the same table under a different alias. manager_id NOT IN that set keeps only Maya (6 absent) and Omar (12 absent); John, Dan, Thomas (→3) and Zara (→2) fail the test because their managers are in the set.",
      "The NULL-poisoning trap is worth restating: had the subquery selected manager_id, the list would contain NULL (Brad's), and SQL's three-valued logic turns every x NOT IN (..., NULL) into UNKNOWN — zero rows out, no error, just an empty answer that looks like 'nobody's manager left'. Selecting the PK makes the list NULL-proof by construction.",
      "NOT EXISTS (SELECT 1 FROM Employees m WHERE m.employee_id = e.manager_id) is the dialect-independent spelling of the same anti-join, immune to NULLs even in the probed column; ORDER BY employee_id just presents the two survivors in id order.",
    ],
    time: "O(n) — one pass to build the live-id set, one indexed pass to filter",
    space: "O(n) — the in-memory set of live ids",
    followUps: [
      "Rewrite as NOT EXISTS and as LEFT JOIN + IS NULL; then delete the IS NOT NULL guard and confirm which spellings still handle Brad's NULL correctly.",
      "Each departed manager stranded a team: report the departed manager_id and how many direct reports still point at it.",
    ],
    related: ["customers-who-never-order", "managers-with-at-least-5-direct-reports", "market-analysis-i"],
    order: "any",
    xp: 10,
  },
  {
    slug: "game-play-analysis-iv",
    statement:
      "The Activity table logs every login a player makes: who, on which device, on which date, and how many games they played that day. A player counts as retained if some login falls on the day immediately after their very first login. Report the fraction of players who are retained, rounded to 2 decimal places.",
    examples: [
      {
        input:
          "9 players: 1 (2016-03-01 → 03-02) · 2 (2017-06-25 only) · 3 (2016-03-02 → next 2018-07-03) · 4 (2019-01-01 → 01-02 → 01-03) · 5 (2019-05-10 → 05-12) · 6 (2020-02-28 → 02-29) · 7 (2021-02-28 → 2021-03-01) · 8 (2021-01-31 → 2021-02-01) · 9 (2022-12-31 → 2023-01-01)",
        output: "0.67",
        explanation:
          "Players 1, 4, 6, 7, 8 and 9 log in exactly one day after their first login; 2 never returns, 3 returns two years later, 5 skips exactly one day (05-11 is missing). 6/9 = 0.6667 → 0.67.",
      },
    ],
    constraints: [
      "PRIMARY KEY (player_id, event_date) — one login row per player per day",
      "the denominator is every player present in Activity",
      "result rounded to exactly 2 decimal places",
    ],
    breakdown: [
      "Two facts must be manufactured before any arithmetic happens: each player's first login date, and whether a login exists exactly one day later. The first is a GROUP BY player_id with MIN(event_date); the second is a join of that result back to Activity with the join key computed as date(first_date, '+1 day'). Both are CTE-sized steps, each independently checkable.",
      "The fraction itself is where grades die: COUNT(...) / COUNT(...) on two integers is INTEGER division in SQLite — 6/9 evaluates to 0. Multiplying one side by 1.0 forces float division, and only then does ROUND(x, 2) produce 0.67. The denominator (every distinct player in Activity) is safest as its own one-row CTE rather than a correlated count.",
      "'Returned' means returned the NEXT day, not 'returned at all': player 5 comes back on 2019-05-12 after a 2019-05-10 first login and must not count, because 05-11 is missing. And the matched side needs COUNT(DISTINCT player_id) — player 4 logs in three days running, and a join that produces multiple matching rows must not promote him to three retained players.",
    ],
    edges: [
      "COUNT(a)/COUNT(b) with two integer counts is integer division in SQLite: 6/9 = 0. Multiply by 1.0 before dividing.",
      "'Next day' is literal: date(f.first_date, '+1 day'), never 'any later date' — player 5 (05-10 → 05-12) returns but doesn't count.",
      "COUNT(DISTINCT a.player_id) on the matched side — multi-day streaks must not multi-count a player.",
      "Calendar arithmetic is date()'s job: leap day (2020-02-28 → 02-29), month end (2021-01-31 → 02-01) and year end (2022-12-31 → 2023-01-01) all roll correctly in the seed.",
    ],
    ladder: [
      {
        title: "Brute force — two passes in app code",
        body: "Pull every player's MIN(event_date) into a map, then scan Activity for each player's first_date + 1 day. Correct; two round trips and hand-written date math.",
      },
      {
        title: "The pattern — anchor CTE + computed-key join",
        body: "A first_login CTE makes the anchor explicit; joining Activity back ON event_date = date(first_date, '+1 day') moves the date math into the engine's calendar-aware date() — leap years and month rolls included.",
      },
      {
        title: "The optimal idea — count, guard the division",
        body: "COUNT(DISTINCT matched player) over COUNT(DISTINCT all player), forced to float with * 1.0, wrapped in ROUND(x, 2). One statement, no intermediate tables.",
      },
    ],
    approach: "First-login CTE + next-day join + guarded fraction",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,
  games_played INTEGER NOT NULL,
  PRIMARY KEY (player_id, event_date)
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1,2,'2016-03-01',5),(1,2,'2016-03-02',6),                        -- day-1 return
  (2,3,'2017-06-25',1),                                             -- one-and-done
  (3,1,'2016-03-02',0),(3,4,'2018-07-03',5),                        -- comes back, two years later
  (4,5,'2019-01-01',3),(4,5,'2019-01-02',2),(4,5,'2019-01-03',8),   -- streak: still ONE retained player
  (5,6,'2019-05-10',4),(5,6,'2019-05-12',1),                        -- near miss: 05-11 missing
  (6,7,'2020-02-28',2),(6,7,'2020-02-29',3),                        -- leap day: date() gets it right
  (7,8,'2021-02-28',1),(7,8,'2021-03-01',2),                        -- non-leap: Feb 28 +1 = Mar 1
  (8,9,'2021-01-31',6),(8,9,'2021-02-01',4),                        -- month rollover
  (9,10,'2022-12-31',1),(9,10,'2023-01-01',2);                      -- year rollover`,
      tables: [
        { name: "Activity", note: "9 players, 18 logins; players 6-9 sit on leap-day, month-end and year-end boundaries on purpose" },
      ],
    },
    code: `WITH first_login AS (
    -- anchor fact: the day each player first showed up (their MIN event_date)
    SELECT player_id, MIN(event_date) AS first_date
    FROM Activity
    GROUP BY player_id
),
came_back AS (
    -- how many players have a login EXACTLY one day after that anchor
    SELECT COUNT(DISTINCT a.player_id) AS players
    FROM first_login f
    JOIN Activity a
      ON a.player_id  = f.player_id
     AND a.event_date = date(f.first_date, '+1 day')  -- calendar-aware +1
),
total AS (
    SELECT COUNT(DISTINCT player_id) AS players FROM Activity
)
SELECT ROUND(came_back.players * 1.0 / total.players, 2) AS fraction
FROM came_back, total;  -- two one-row CTEs: a safe cross join`,
    walkthrough: [
      "first_login collapses Activity to the anchor: one row per player with MIN(event_date). Player 3's two logins (2016-03-02 and 2018-07-03) become one row with first_date 2016-03-02 — the later login is deliberately NOT the anchor.",
      "came_back rejoins Activity with the join key computed by date(f.first_date, '+1 day'). SQLite's date() rolls over months, leap days and years — which is exactly how players 6, 7, 8 and 9 qualify on boundaries where naive string surgery (substr, concatenation) would break. Player 5's 2019-05-12 is a near miss: the probe date is 2019-05-11 and no row matches.",
      "total is a one-row CTE counting every distinct player (9). came_back and total cross-join into one row holding 6 and 9 — the multiplication by 1.0 before the division is what stops SQLite's integer arithmetic from reporting 6/9 as 0.",
      "ROUND(..., 2) then emits 0.67. Note the shape: no window functions, no correlated subqueries — three small named steps, each of which you can run alone and eyeball.",
    ],
    time: "O(n) — two grouped passes plus one hash join on (player, date)",
    space: "O(p) — one row per player in the first_login CTE",
    followUps: [
      "Generalize to day-2 and day-7 retention by swapping '+1 day' for '+2 day' / '+7 day' — which window shrinks fastest?",
      "Split the fraction by first-login month: GROUP BY strftime('%Y-%m', f.first_date) over the same skeleton.",
    ],
    related: ["game-play-analysis-v", "market-analysis-i"],
    order: "any",
    xp: 20,
  },
  {
    slug: "exchange-seats",
    statement:
      "Students sit in a hall of numbered seats — one row per seat, ids 1..n, each holding a student's name. Before the exam the hall re-pairs itself: seats 1 and 2 swap occupants, 3 and 4 swap, and so on down the hall. When n is odd the final seat is odd-numbered and partnerless, and it keeps its student. Output the new seating as id, student, sorted by id.",
    examples: [
      {
        input: "Seat: (1,'Abbot'),(2,'Doris'),(3,'Emerson'),(4,'Green'),(5,'Jeames'),(6,'Khan'),(7,'Lola')",
        output: "(1,'Doris'),(2,'Abbot'),(3,'Green'),(4,'Emerson'),(5,'Khan'),(6,'Jeames'),(7,'Lola')",
        explanation:
          "Three pairs swap (1↔2, 3↔4, 5↔6); seat 7 is odd and last, so Lola stays put. The official five-seat variant of this same setup ends with Jeames unpaired — identical rule, one fewer pair.",
      },
    ],
    constraints: [
      "seat ids form 1..n with no gaps",
      "id values are unique",
      "an odd-numbered final seat keeps its student",
    ],
    breakdown: [
      "Every seat's new id depends only on its own parity — except the last seat, which depends on whether it has a partner. Odd seats move to id+1, even seats move to id-1, and the single unpaired odd seat (which exists exactly when n is odd) stays put. That's a textbook CASE WHEN with a guard condition, computed per row.",
      "The guard needs the hall size: (SELECT COUNT(*) FROM Seat). An odd id qualifies for id+1 only when id < n; when id = n (odd, last), the second branch keeps it. Branch order is semantics — the generic 'odd' rule must not fire before the guarded 'odd with a partner' rule, so the guarded test comes first.",
      "SQLite has no MOD() function — parity is the % operator, id % 2 = 1. And the output column is the NEW id (aliased id), not the old one, with ORDER BY id making the renumbered hall display in seat order. The grader checks exact order here because 'sorted by seat' is the point of the exercise.",
    ],
    edges: [
      "The last odd seat: guard the +1 branch with id < (SELECT COUNT(*) FROM Seat), or the final student gets assigned to a seat that doesn't exist.",
      "Branch order in CASE is semantics: test 'odd AND id < n' before plain 'odd', or every odd seat takes the fall-through wrongly.",
      "No MOD() in SQLite — the parity test is id % 2 = 1.",
      "This problem is graded order: exact — ORDER BY id over the NEW ids is part of the answer.",
    ],
    ladder: [
      {
        title: "Brute force — rewrite rows one by one",
        body: "Read every seat, compute the partner's id in application code, write new ids back one UPDATE at a time. The SELECT-level CASE computes the whole renumbering in a single pass instead.",
      },
      {
        title: "The pattern — parity CASE with a boundary guard",
        body: "CASE WHEN odd and has partner THEN id+1 WHEN odd THEN id ELSE id-1 END. The 'has partner' half is the insight: it needs the row count as a scalar subquery.",
      },
      {
        title: "The optimal idea — one pass, sorted",
        body: "Per-row arithmetic plus ORDER BY id: O(n log n) for the sort and nothing else. The mapping is a bijection, so sorting the new ids reconstructs the hall.",
      },
    ],
    approach: "Parity CASE swap with a last-seat guard",
    schema: {
      ddl: `CREATE TABLE Seat (
  id      INTEGER PRIMARY KEY,
  student TEXT NOT NULL
);`,
      seed: `INSERT INTO Seat (id, student) VALUES
  (1,'Abbot'),(2,'Doris'),(3,'Emerson'),(4,'Green'),(5,'Jeames'),  -- the official five
  (6,'Khan'),(7,'Lola');  -- engineered: an odd hall, so seat 7 has no partner`,
      tables: [
        { name: "Seat", note: "7 seats — an odd hall, so the last seat (7) has no partner and keeps Lola" },
      ],
    },
    code: `SELECT
    CASE
        -- odd seat with a partner: take the NEXT seat number
        WHEN id % 2 = 1 AND id < (SELECT COUNT(*) FROM Seat) THEN id + 1
        -- odd LAST seat: no partner exists, stay put
        WHEN id % 2 = 1 THEN id
        -- even seat: always take the seat before it
        ELSE id - 1
    END AS id,    -- the output id is the NEW numbering
    student
FROM Seat
ORDER BY id;      -- the renumbered hall must display in seat order`,
    walkthrough: [
      "The scalar subquery (SELECT COUNT(*) FROM Seat) fixes n = 7 for the whole query. Each row then walks the CASE top to bottom, and branch order is load-bearing: the guarded odd test must run before the bare odd test, or every odd seat — including the last — would try to move up.",
      "Row by row: id 1 is odd and 1 < 7, so Abbot's seat becomes 2; id 2 falls through to ELSE and becomes 1 — Doris and Abbot trade. The same happens for 3/4 (Emerson/Green) and 5/6 (Jeames/Khan).",
      "Id 7 is odd, but 7 < 7 is false, so the second branch keeps it at 7 and Lola stays. Drop the guard and the CASE would emit 8 — a seat that doesn't exist — leaving a hole in the numbering and a phantom row in the output.",
      "The alias AS id renames the computed column to id (the grader expects id, student), and ORDER BY id sorts by that NEW value — exactly seat order 1..7, since the swap is a bijection on ids.",
    ],
    time: "O(n log n) — the final sort dominates; the CASE is O(1) per row",
    space: "O(n) — the output",
    followUps: [
      "Write the UPDATE that makes the swap permanent — pair each seat with its partner via id IN (id+1, id-1) and exchange the student names.",
      "DELETE an interior row first so ids have a gap: does id±1 still pair the right students, or must the swap key become ROW_NUMBER() over the remaining seats?",
    ],
    related: ["rank-scores", "market-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "game-play-analysis-v",
    statement:
      "A player's install date is the first day they ever logged in. For each install date, report how many players installed the game that day and how many of those came back the very next day — the classic day-1 retention pair. Return install_date, installs and Day1_retention, one row per install date, in any order.",
    examples: [
      {
        input:
          "Player 1 installs 2016-03-01, returns 03-02 · player 2 installs 2017-06-25, never returns · player 3 installs 2016-03-02, next login 2018-07-03 · players 4 and 5 install 2019-01-01, only 4 returns 01-02 · players 6 and 7 install 2020-05-01, neither returns · player 8 installs 2021-01-01, logs in 01-02 and 01-03",
        output:
          "2016-03-01 · 1 · 1 / 2016-03-02 · 1 · 0 / 2017-06-25 · 1 · 0 / 2019-01-01 · 2 · 1 / 2020-05-01 · 2 · 0 / 2021-01-01 · 1 · 1",
        explanation:
          "installs counts the cohort — one firsts row per player; Day1_retention counts only next-day matches. The 2020-05-01 cohort is the trap: two installs, zero retained, and the row must still appear (a zero, not a deletion).",
      },
    ],
    constraints: [
      "one Activity row per (player_id, event_date)",
      "a player's install date is their MIN(event_date)",
      "retention means a login exactly install_date + 1 day",
    ],
    breakdown: [
      "Installs and retention are two different counts over the same rows, and the LEFT JOIN is what makes both possible at once. The firsts CTE collapses Activity to one row per player (player_id, install_date); LEFT JOINing Activity on 'same player, event_date = install_date + 1 day' attaches either the next-day login or a row of NULLs.",
      "After GROUP BY install_date, COUNT(*) and COUNT(a.event_date) answer two different questions about the same group: COUNT(*) counts scaffold rows — one per player who installed — so it's the cohort size (installs); COUNT(a.event_date) skips NULLs, so it counts only players whose next-day login actually matched (Day1_retention). Swap them and every zero-retention cohort lies.",
      "This is why the join must be LEFT even though 'we only care about returners': an INNER JOIN deletes the unmatched cohort rows, and the 2020-05-01 group — two installs, zero retained — would vanish instead of reporting 0. Zero is information; deleting it is precisely the bug the problem is built to catch.",
    ],
    edges: [
      "COUNT(*) vs COUNT(a.event_date) is the whole game: the former counts installs, the latter retention — misplace the asterisk and zero cohorts report fake retentions.",
      "LEFT JOIN, not INNER — the 2020-05-01 cohort must output 0, not disappear.",
      "The join key is computed from the CTE's install date (date(f.install_date, '+1 day')), never from the row's own event_date.",
      "A player with a three-day streak (player 8) is still exactly 1 install + 1 retained: one firsts row, one next-day match.",
    ],
    ladder: [
      {
        title: "Brute force — two queries and a merge",
        body: "Query 1 computes install dates and cohort sizes; query 2 computes survivors per cohort; the application stitches them together by date. Two scans, a merge, and no zero rows unless you remember to outer-join the pieces.",
      },
      {
        title: "The pattern — firsts CTE + next-day LEFT JOIN",
        body: "firsts (MIN per player) is the anchor; LEFT JOIN Activity on install+1 attaches survivors and NULL-synthesizes the absentees into one dataset.",
      },
      {
        title: "The optimal idea — two counts, one GROUP BY",
        body: "COUNT(*) = installs, COUNT(a.event_date) = retention, GROUP BY install_date — a single statement. The NULL-vs-scaffold distinction does all the work.",
      },
    ],
    approach: "Firsts CTE + LEFT JOIN + COUNT(*) vs COUNT(column)",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,
  games_played INTEGER NOT NULL,
  PRIMARY KEY (player_id, event_date)
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1,2,'2016-03-01',5),(1,2,'2016-03-02',6),    -- cohort 03-01: retained
  (3,1,'2016-03-02',0),(3,4,'2018-07-03',5),    -- cohort 03-02: next login far away
  (2,3,'2017-06-25',1),                         -- cohort 06-25: one-and-done
  (4,5,'2019-01-01',3),(4,5,'2019-01-02',1),    -- cohort 01-01: 4 returns...
  (5,6,'2019-01-01',2),                         -- ...5 doesn't: installs 2, retention 1
  (6,7,'2020-05-01',4),(7,8,'2020-05-01',9),    -- ZERO cohort: installs 2, retention 0
  (8,9,'2021-01-01',7),(8,9,'2021-01-02',3),(8,9,'2021-01-03',2);  -- 3-day streak: 1 install, 1 retained`,
      tables: [
        { name: "Activity", note: "8 players, 13 logins, 6 install cohorts; the 2020-05-01 pair is the zero-retention cohort" },
      ],
    },
    code: `WITH firsts AS (
    -- one row per player: the day they installed
    SELECT player_id, MIN(event_date) AS install_date
    FROM Activity
    GROUP BY player_id
)
SELECT
    f.install_date,
    COUNT(*)            AS installs,        -- every firsts row = one install
    COUNT(a.event_date) AS Day1_retention   -- NULLs (no next-day login) are skipped -> true zeros
FROM firsts f
LEFT JOIN Activity a
       ON a.player_id  = f.player_id
      AND a.event_date = date(f.install_date, '+1 day')
GROUP BY f.install_date;`,
    walkthrough: [
      "firsts reduces 13 logins to 8 anchor rows. Player 8's three-day streak (01-01, 01-02, 01-03) becomes one row with install_date 2021-01-01; player 5's single login makes a cohort-of-one that will never be retained.",
      "The LEFT JOIN probes each player for a login on install_date + 1 day. Player 4 matches (2019-01-02); player 5 does not, so the join synthesizes a row with a.event_date = NULL. Both rows still exist after the join — that is what LEFT buys.",
      "GROUP BY install_date then asks two different questions of each group: COUNT(*) counts rows (every player who installed that day — 2 for the 2019-01-01 and 2020-05-01 cohorts), while COUNT(a.event_date) skips the NULLs (1 and 0 respectively). Same rows, two honest numbers.",
      "Watch the 2020-05-01 line: installs 2, Day1_retention 0. An INNER JOIN would have deleted that cohort outright; COUNT(*) in place of COUNT(a.event_date) for retention would have reported 2. Both mistakes are the same error — treating absence as presence.",
    ],
    time: "O(n log n) — one grouped pass for firsts, one date-keyed join, one regroup",
    space: "O(p) — one row per player, then one per cohort",
    followUps: [
      "Add a Day1_rate column: retained / installs, rounded to 2 — what does the zero cohort divide by, and how should that row be labeled?",
      "Report average day-2 games_played per install date, COALESCE'd to 0 for cohorts with no survivor.",
    ],
    related: ["game-play-analysis-iv", "market-analysis-i"],
    order: "any",
    xp: 35,
  },
  {
    slug: "investments-in-2016",
    statement:
      "An insurance table tracks, per policyholder, their total investment value in 2015 (tiv_2015), their total investment value in 2016 (tiv_2016), and the coordinates of their insured location. Report the sum of tiv_2016 — rounded to 2 decimals — over the policyholders who satisfy both of these: their tiv_2015 value equals at least one other policyholder's, and their (lat, lon) location is not shared with any other policyholder.",
    examples: [
      {
        input:
          "Insurance: (1,10,5,10,10),(2,20,20,20,20),(3,10,30,20,20),(4,10,40,40,40),(5,30,15,1,1),(6,30,25,2,2),(7,30,35,50,50),(8,40,60,3,3),(9,40,70,3,3),(10,50,80,60,60)",
        output: "120.0",
        explanation:
          "In the shared-10 group, pids 1 and 4 sit alone on the map (in) while pid 3 shares (20,20) with pid 2 (out). The whole 30-group qualifies. Pids 8 and 9 share tiv_2015 AND coordinates — both out; pids 2 and 10 hold unique tiv_2015 values — out regardless of location. 5 + 40 + 15 + 25 + 35 = 120.00.",
      },
    ],
    constraints: [
      "pid is the primary key",
      "tiv_2015 may repeat; qualifying rows' (lat, lon) must be unique to one policyholder",
      "answer rounded to 2 decimal places",
    ],
    breakdown: [
      "Two membership tests, one sum. 'Same tiv_2015 as at least one other policyholder' is a GROUP BY tiv_2015 HAVING COUNT(*) > 1 — the set of duplicated values. 'Located in a city of their own' is the opposite shape: GROUP BY lat, lon HAVING COUNT(*) = 1 — coordinates held by exactly one person. A row qualifies when it is in the first set and in the second.",
      "The location test must treat (lat, lon) as one composite key. Testing lat and lon in separate IN subqueries would mix and match: a row could pass with one policyholder's latitude and a different one's longitude. SQLite supports row values — (lat, lon) IN (SELECT lat, lon FROM ...) — which compares the pair atomically.",
      "Only after both filters survive does SUM(tiv_2016) run, wrapped in ROUND(..., 2) because money wants two decimals. Note what the official example smuggles in: pid 2 proves the conditions are AND, not OR (unique spot, but unique tiv_2015 → out), and pids 8+9 prove that sharing tiv_2015 does not rescue a shared address.",
    ],
    edges: [
      "Composite key: filter (lat, lon) as a pair via a row-value IN (or EXISTS) — separate lat and lon IN-tests let rows mix one policyholder's latitude with another's longitude.",
      "The two conditions are independent ANDs — pid 2 (unique spot, unique tiv_2015) and pids 8/9 (shared tiv_2015, shared spot) both fail, for opposite halves of the clause.",
      "HAVING COUNT(*) = 1 defines 'uniquely shared' — a group of one; COUNT(*) > 1 defines the tiv_2015 crowd.",
      "Counting rows per (lat, lon) counts policyholders — pid is the PK, so two rows on one spot are always two different people.",
    ],
    ladder: [
      {
        title: "Brute force — double self-join",
        body: "Join Insurance to itself on tiv_2015 (proves company) and anti-join on (lat, lon) (proves solitude), then DISTINCT before summing. Works, but multiplies rows and is easy to double-count.",
      },
      {
        title: "The pattern — aggregate the two condition-sets first",
        body: "Turn each condition into a precomputed set with GROUP BY + HAVING: duplicated tiv_2015 values, solo coordinates. Set membership replaces row multiplication.",
      },
      {
        title: "The optimal idea — two IN subqueries, one SUM",
        body: "WHERE tiv_2015 IN (...) AND (lat, lon) IN (...), then ROUND(SUM(...), 2). Each subquery is independently runnable — eyeball both sets before trusting the sum.",
      },
    ],
    approach: "Two GROUP BY/HAVING sets + row-value IN filters",
    schema: {
      ddl: `CREATE TABLE Insurance (
  pid      INTEGER PRIMARY KEY,
  tiv_2015 REAL NOT NULL,
  tiv_2016 REAL NOT NULL,
  lat      REAL NOT NULL,
  lon      REAL NOT NULL
);`,
      seed: `INSERT INTO Insurance (pid, tiv_2015, tiv_2016, lat, lon) VALUES
  (1, 10,  5, 10, 10),   -- tiv_2015 shared (the 10 group), spot unique -> in
  (2, 20, 20, 20, 20),   -- tiv_2015 unique -> out, whatever the spot
  (3, 10, 30, 20, 20),   -- tiv_2015 shared BUT spot shared with 2 -> out
  (4, 10, 40, 40, 40),   -- in
  (5, 30, 15,  1,  1),   -- the 30 group of three: all spots unique, 5/6/7 all in
  (6, 30, 25,  2,  2),
  (7, 30, 35, 50, 50),
  (8, 40, 60,  3,  3),   -- shares tiv_2015 AND coordinates with 9 -> both out
  (9, 40, 70,  3,  3),
  (10,50, 80, 60, 60);   -- fully unique -> out`,
      tables: [
        { name: "Insurance", note: "10 policies — a shared-30 trio (all in), a shared-tiv-and-spot pair 8/9 (both out), and pid 3 as the one-sided trap" },
      ],
    },
    code: `WITH shared_tiv AS (
    -- tiv_2015 values held by two or more policyholders
    SELECT tiv_2015
    FROM Insurance
    GROUP BY tiv_2015
    HAVING COUNT(*) > 1
),
solo_spot AS (
    -- coordinates held by exactly one policyholder
    SELECT lat, lon
    FROM Insurance
    GROUP BY lat, lon
    HAVING COUNT(*) = 1
)
SELECT
    ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM Insurance
WHERE tiv_2015  IN (SELECT tiv_2015 FROM shared_tiv)      -- in a tiv_2015 crowd...
  AND (lat, lon) IN (SELECT lat, lon FROM solo_spot);     -- ...but alone on the map`,
    walkthrough: [
      "shared_tiv groups by the investment value: {10 (pids 1, 3, 4), 30 (5, 6, 7), 40 (8, 9)} survive HAVING COUNT(*) > 1. solo_spot groups by the coordinate pair: (10,10), (40,40), (1,1), (2,2), (50,50) and (60,60) are singletons, while (20,20) and (3,3) each have two occupants and drop out.",
      "The WHERE clause intersects the two memberships row by row. pid 3 fails the second test ((20,20) is shared) despite its shared tiv_2015; pids 8 and 9 fail it too — their tiv_2015 = 40 crowd doesn't rescue a shared address. Five survivors: pids 1, 4, 5, 6, 7.",
      "(lat, lon) IN (SELECT lat, lon ...) is a row-value comparison — the pair is matched atomically. Written as two separate IN tests on lat and lon, a row could pass with one policyholder's latitude and a different one's longitude, quietly corrupting the geography.",
      "SUM over the survivors' tiv_2016 gives 120, and ROUND(..., 2) presents it as money. Both CTEs run fine on their own — check the two sets before trusting the sum.",
    ],
    time: "O(n) — two hash-grouped passes to build the sets, one pass to filter and sum",
    space: "O(n) — the two membership sets",
    followUps: [
      "List the qualifying pid values with GROUP_CONCAT instead of the sum — which pids does the engine credit?",
      "Redefine 'same city' as coordinates within 0.001 of each other: IN dies, and a self-join with range predicates takes over.",
    ],
    related: ["market-analysis-i", "second-highest-salary"],
    order: "any",
    xp: 20,
  },
  {
    slug: "department-top-three-salaries",
    statement:
      "Employees carry a salary and a department; departments live in a small lookup table. A department's top earners are every employee whose salary is one of the three highest DISTINCT salaries within that department — a tie counts once as a salary, but every tied earner is reported. List department name, employee name and salary for the top earners of every department.",
    examples: [
      {
        input:
          "Department 1 'Engineering' — Max 90000, Joe 85000, Randy 85000, Henry 80000, Will 70000, Janet 69000, Sam 60000",
        output:
          "Engineering · Max · 90000 / Engineering · Joe · 85000 / Engineering · Randy · 85000 / Engineering · Henry · 80000",
        explanation:
          "The three distinct top salaries are 90000, 85000 and 80000; both 85k earners appear (85k is one salary with two holders), and 70k and below miss the cut.",
      },
      {
        input:
          "Department 3 'Support' — Di 30000, Eli 30000, Fay 30000, Gus 22000 · Department 2 'Sales' — Ana 75000, Bo 75000, Cy 52000",
        output:
          "Support · Di · 30000 / Support · Eli · 30000 / Support · Fay · 30000 / Support · Gus · 22000 / Sales · Ana · 75000 / Sales · Bo · 75000 / Sales · Cy · 52000",
        explanation:
          "Support owns only two distinct salaries, so 'top three' caps out and all four earners qualify; Sales' 75k tie keeps both holders plus Cy's 52k.",
      },
    ],
    constraints: [
      "ranking is per department, over DISTINCT salaries",
      "every holder of a top-3 distinct salary is reported",
      "Employee.departmentId references Department.id",
    ],
    breakdown: [
      "'Top three salaries' means top three DISTINCT salaries — a ranking over the set of values, where ties collapse to one rank but every tied earner is still printed. That exact contract is DENSE_RANK: ties share a rank, the next distinct value gets the very next integer, no gaps.",
      "Run the alternatives on Engineering's 85k tie and both fail visibly. ROW_NUMBER deals 1,2,3,4 — the two 85k earners occupy ranks 2 and 3, and Henry's genuine 80k (third distinct salary) is pushed to 4 and cut. RANK deals 1,2,2,4 — 80k again lands at 4 and is cut even though only two distinct salaries beat it. DENSE_RANK deals 1,2,2,3 and Henry survives.",
      "Mechanically: DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) in a CTE (window functions can't be filtered in WHERE directly), then join Department for the display name and keep rnk <= 3. PARTITION BY department is what restarts the contest per department — forget it and you rank the whole company.",
    ],
    edges: [
      "ROW_NUMBER breaks ties (1,2,3): Engineering keeps both 85k earners but loses 80k — the row count looks fine and the salaries are wrong.",
      "RANK leaves gaps after ties (1,2,2,4): 80k sits at rank 4 and is cut although only two distinct salaries beat it.",
      "DENSE_RANK <= 3 is the spec verbatim — a department can output MORE than three rows (Support: four earners, three-way tie at the top).",
      "PARTITION BY departmentId — without it the ranking is company-wide and every department but the richest one dies.",
    ],
    ladder: [
      {
        title: "Brute force — correlated count",
        body: "Keep an employee when (SELECT COUNT(DISTINCT e2.salary) ... WHERE e2.salary > e1.salary AND same department) < 3. Correct and a great sanity check; O(n squared) probes.",
      },
      {
        title: "The pattern — window ranking per group",
        body: "DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) computes that count once per row, sorted. The ranking function IS the correlated subquery, pre-computed.",
      },
      {
        title: "The optimal idea — CTE, then filter the rank",
        body: "Window functions can't live in WHERE, so rank in a CTE and filter rnk <= 3 outside. Join Department last, for the display name only.",
      },
    ],
    approach: "DENSE_RANK per department, keep rank <= 3",
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
      seed: `INSERT INTO Department (id, name) VALUES (1,'Engineering'),(2,'Sales'),(3,'Support');
INSERT INTO Employee (id, name, salary, departmentId) VALUES
  (4,'Max',90000,1),(1,'Joe',85000,1),(6,'Randy',85000,1),(2,'Henry',80000,1),  -- 85k tie inside the top 3
  (7,'Will',70000,1),(5,'Janet',69000,1),(3,'Sam',60000,1),
  (8,'Ana',75000,2),(9,'Bo',75000,2),(10,'Cy',52000,2),                         -- tie at the very top
  (11,'Di',30000,3),(12,'Eli',30000,3),(13,'Fay',30000,3),(14,'Gus',22000,3);   -- 3-way tie: 4 earners qualify`,
      tables: [
        { name: "Department", note: "3 departments" },
        { name: "Employee", note: "Engineering carries the official 85k tie inside its top 3; Support is a 3-way tie at the top (4 earners qualify); Sales ties at rank 1" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        departmentId,
        name,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY departmentId      -- the contest is INSIDE each department
            ORDER BY salary DESC           -- best salary first; ties share a rank, no gaps
        ) AS rnk
    FROM Employee
)
SELECT
    d.name   AS Department,
    r.name   AS Employee,
    r.salary AS Salary
FROM ranked r
JOIN Department d ON d.id = r.departmentId
WHERE r.rnk <= 3                    -- top three DISTINCT salaries
ORDER BY d.name, r.salary DESC, r.name;`,
    walkthrough: [
      "ranked assigns each employee a per-department countdown. In Engineering the salaries sort 90000, 85000, 85000, 80000, ... and DENSE_RANK hands out 1, 2, 2, 3 — the two 85k earners share rank 2, and Henry's 80k, the third DISTINCT salary, gets the very next integer, 3.",
      "That no-gap behavior is the entire spec. ROW_NUMBER would have dealt 1, 2, 3, 4 — keeping both 85k earners while pushing 80k out; RANK would have dealt 1, 2, 2, 4 — cutting 80k at rank 4 even though only two distinct salaries beat it. Both are plausible-looking and both are wrong.",
      "The CTE exists because SQLite (like every engine) refuses window functions inside WHERE — rank first, filter outside. WHERE r.rnk <= 3 keeps 11 of the 14 employees: 4 from Engineering, all 3 from Sales (75k, 75k, 52k — two distinct salaries), and all 4 from Support (30k three ways shares rank 1, 22k takes rank 2).",
      "The join to Department is pure decoration — the display name — and the ORDER BY just presents each department's earners best-first; the grader compares rows as a set.",
    ],
    time: "O(n log n) — the window's partitioned sort; the filter is O(n)",
    space: "O(n) — the ranked CTE",
    followUps: [
      "Change the rule to 'top three PEOPLE' (three employees regardless of ties) — ROW_NUMBER takes over; which Support earners survive then?",
      "Add each earner's gap from the department maximum: another window over the ranked CTE (MAX(salary) per partition minus salary).",
    ],
    related: ["department-highest-salary", "rank-scores", "product-sales-analysis-iii"],
    order: "any",
    xp: 35,
  },
  {
    slug: "average-salary-of-departments",
    statement:
      "Payroll rows record each employee's pay amount and pay date; a separate table maps employees to departments. For every month and every department, compare that department's average salary in the month against the whole company's average in the same month, and label it 'higher', 'lower' or 'same'. Output pay_month (as YYYY-MM), department_id and the label.",
    examples: [
      {
        input:
          "Feb 2017 (pay_date 2017-02-28): dept 1 pays 7000 · dept 2 pays 6000 + 8000 · Mar 2017 (2017-03-31): dept 1 pays 9000 + 11000 · dept 2 pays 6000 + 10000 · Apr 2017 (2017-04-30): dept 1 pays 10000 · dept 2 pays 4000 + 6000",
        output:
          "2017-02 · 1 · same / 2017-02 · 2 · same / 2017-03 · 1 · higher / 2017-03 · 2 · lower / 2017-04 · 1 · higher / 2017-04 · 2 · lower",
        explanation:
          "February ties everywhere: each department averages 7000 against a company average of 7000. March: dept 1 averages 10000 against the company's 9000, dept 2 has 8000. April: the company pools all three pay rows to 6666.67 — the average of the department averages (7500) is NOT the company average.",
      },
    ],
    constraints: [
      "Salary.employee_id references Employee.employee_id",
      "the company average pools every pay row in the month, across departments",
      "months with no pay rows produce no output rows",
    ],
    breakdown: [
      "Two averages per month, computed at two different grains: department-by-month and company-by-month. Each needs its own GROUP BY, so the shape is two CTEs — monthly (join Salary to Employee for department_id, group by month + department, AVG(amount)) and company (group Salary by month alone) — joined on the month string.",
      "The month itself must be manufactured: strftime('%Y-%m', pay_date) truncates a date to its month key. Group by the raw pay_date and 2017-02-27 and 2017-02-28 become two 'months'; group by the truncated string and every February payday collapses to '2017-02'.",
      "The label is a three-way CASE on the comparison, and 'same' is the branch people forget — the official example is built around February, where every average lands on exactly 7000. Note what the company average is NOT: it pools every pay row, so it's a headcount-weighted mean of the department averages — April's is 6666.67 even though the two department averages (10000, 5000) would average to 7500.",
    ],
    edges: [
      "Company average = pooled AVG over all pay rows (weighted by headcount), NOT the average of department averages — April: 6666.67, not 7500.",
      "February ties at 7000 everywhere: drop the CASE's ELSE branch and both departments print NULL instead of 'same'.",
      "Truncate with strftime('%Y-%m', pay_date); grouping by raw pay_date splits one month per payday.",
      "Both CTEs group by month independently, then join ON the month string — aggregating once over a joined pair cannot produce the company-wide denominator per department.",
    ],
    ladder: [
      {
        title: "Brute force — per-month, per-department loops",
        body: "For each month, for each department, run one query for the department average and one for the company average. 2 x months x departments round trips; the shape is right, the packaging is wrong.",
      },
      {
        title: "The pattern — two CTEs, two grains",
        body: "monthly (department grain) and company (company grain) each get a clean GROUP BY; joining on the month string lines the grains up. Aggregate first, compare second.",
      },
      {
        title: "The optimal idea — join on month, label with CASE",
        body: "JOIN company c ON c.pay_month = m.pay_month, then a CASE emits 'higher'/'lower'/'same'. One statement; the comparison logic is data, not code.",
      },
    ],
    approach: "Two-grain CTEs joined on the month key",
    schema: {
      ddl: `CREATE TABLE Employee (
  employee_id   INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL
);
CREATE TABLE Salary (
  id          INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES Employee(employee_id),
  amount      INTEGER NOT NULL,
  pay_date    TEXT NOT NULL
);`,
      seed: `INSERT INTO Employee (employee_id, department_id) VALUES (1,1),(2,2),(3,2),(4,1);
INSERT INTO Salary (id, employee_id, amount, pay_date) VALUES
  (4,1,7000,'2017-02-28'),(5,2,6000,'2017-02-28'),(6,3,8000,'2017-02-28'),  -- Feb: everything averages 7000 -> 'same' twice
  (1,1,9000,'2017-03-31'),(7,4,11000,'2017-03-31'),(2,2,6000,'2017-03-31'),(3,3,10000,'2017-03-31'),
  (8,1,10000,'2017-04-30'),(9,2,4000,'2017-04-30'),(10,3,6000,'2017-04-30'); -- Apr: pooled avg 6666.67, not 7500`,
      tables: [
        { name: "Employee", note: "4 employees — emp 4 (dept 1) has pay rows from March onward only" },
        { name: "Salary", note: "10 pay rows over 3 months; February is the engineered all-tie month" },
      ],
    },
    code: `WITH monthly AS (
    -- grain 1: one row per (month, department) with the department's average
    SELECT
        strftime('%Y-%m', s.pay_date) AS pay_month,
        e.department_id,
        AVG(s.amount) AS dept_avg
    FROM Salary s
    JOIN Employee e ON e.employee_id = s.employee_id
    GROUP BY strftime('%Y-%m', s.pay_date), e.department_id
),
company AS (
    -- grain 2: one row per month with the pooled company average
    SELECT
        strftime('%Y-%m', pay_date) AS pay_month,
        AVG(amount) AS company_avg
    FROM Salary
    GROUP BY strftime('%Y-%m', pay_date)
)
SELECT
    m.pay_month,
    m.department_id,
    CASE
        WHEN m.dept_avg > c.company_avg THEN 'higher'
        WHEN m.dept_avg < c.company_avg THEN 'lower'
        ELSE 'same'                     -- February hits this twice
    END AS comparison
FROM monthly m
JOIN company c ON c.pay_month = m.pay_month;   -- line the two grains up by month`,
    walkthrough: [
      "monthly joins each pay row to its department and groups by truncated month plus department. March produces two rows — dept 1 averaging (9000+11000)/2 = 10000, dept 2 averaging (6000+10000)/2 = 8000 — while February's three rows collapse to 7000 and 7000.",
      "company is the same table grouped by month alone: February (7000+6000+8000)/3 = 7000, March 36000/4 = 9000, April 20000/3 = 6666.67. Because it pools every row, it is a headcount-weighted mean of the department averages — April's 6666.67, not the 7500 you'd get by averaging 10000 and 5000.",
      "strftime('%Y-%m', pay_date) is the month key in both CTEs — grouping by raw pay_date would give every payday its own 'month' and every comparison would run against a one-day company. The join ON c.pay_month = m.pay_month aligns the two grains; each department-month meets its own month's denominator.",
      "The CASE labels each pair. February is the engineered trap: 7000 > 7000 and 7000 < 7000 are both false, so the ELSE branch fires 'same' twice — drop the ELSE and those cells come out NULL instead.",
    ],
    time: "O(n log n) — two GROUP BY passes plus a hash join on the month key",
    space: "O(d · m) — one row per department per month",
    followUps: [
      "Add a per-month ranking of departments by their gap (dept_avg - company_avg) using a window over the joined rows.",
      "Report the pooled company average and the mean of department averages side by side, and name the month where they disagree by the widest margin.",
    ],
    related: ["department-highest-salary", "market-analysis-i"],
    order: "any",
    xp: 20,
  },
];
