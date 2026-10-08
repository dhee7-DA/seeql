// Deep-dives — SeeQL free batch 10, file 4 of 5: org charts, trial funnels,
// rotas, recoveries and shelves (5 problems: 1 Easy, 3 Medium, 1 Hard).
// Re-authored from the canonical free tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_FREE_ORG: LcSqlDive[] = [
  {
    slug: "analyze-organization-hierarchy",
    statement:
      "Staff lists every member of a company: staff_id, name, manager_id, salary — manager_id is NULL only for the CEO, and everyone else reports to exactly one listed staff member. For EVERY staff member report the columns staff_id, name, level, subordinates, subtree_salary, ordered by staff_id ascending. level counts hops from the top: the CEO sits at level 1, their direct reports at level 2, and so on down the tree. subordinates is how many staff members sit anywhere below them in the reporting tree, EXCLUDING the person themself. subtree_salary is the sum of salaries across the person's entire subtree, INCLUDING the person themself — the two columns deliberately measure different scopes.",
    examples: [
      {
        input:
          "the CEO, staff 1 Nadia (salary 200), heads a company of seven across four levels: two direct reports, three second-level staff and one third-level staffer",
        output: "1 · Nadia · 1 · 6 · 820",
        explanation:
          "Everyone except Nadia sits somewhere in her subtree: 6 subordinates, and all seven salaries — hers included — sum to 820.",
      },
      {
        input:
          "staff 4 Quinn (salary 100) manages exactly one person, Tara (staff 7, salary 60), who manages nobody",
        output: "4 · Quinn · 3 · 1 · 160",
        explanation:
          "The count excludes Quinn herself (1), the salary includes her (100 + 60 = 160): the asymmetry in a single row.",
      },
    ],
    constraints: [
      "level counts hops from the top: the CEO (manager_id IS NULL) sits at level 1 and each report below adds one",
      "subordinates EXCLUDES the person themself; subtree_salary INCLUDES them — different scopes by design",
      "one row for every staff member, leaves included — columns staff_id, name, level, subordinates, subtree_salary, ordered by staff_id ascending",
    ],
    breakdown: [
      "The report asks, for every person, about people no single hop can see: manager_id names exactly one boss, so a self-join on manager_id answers 'who reports directly to me' and stops there. Tara sits below Omar only through Quinn, so Omar's row must aggregate a subtree, not a neighborhood. The engine shape for reachability is a recursive CTE that emits every (ancestor, descendant) pair: seed it with one self-pair per staff member, then keep adopting children (child.manager_id = current descendant) until a pass adds nothing new. Grouping that closure by ancestor turns 'who can I reach downward' into per-person aggregates — count the pairs for headcount, sum the descendants' salaries for money.",
      "The two measured columns have opposite scopes, and writing them symmetrically is the natural way to corrupt one of them. The subordinates column counts the pairs anchored at the person and then subtracts exactly one — the self-pair the recursion seeded — because the brief says EXCLUDING themselves. The subtree_salary column sums the anchored pairs' salaries and subtracts nothing, because the brief says INCLUDING themselves. A query that 'fixes' both columns the same way breaks one silently: a salary excluding self reports 620 for the CEO instead of 820, and a headcount including self inflates every manager by exactly one.",
      "Level is a separate little recursion because it is a property of the PATH from the root, not of the subtree underneath. Quinn and Rhea both sit at level 3, yet their subtrees differ — one carries 160 in salary, the other 90 — so no aggregate over descendants can reconstruct the hop count. Seeding from manager_id IS NULL makes the CEO the unique level-1 row and every recursive step adds one, landing Tara at level 4. The GROUP BY also keeps leaves in the report for free: their only pair is the self-pair, so they ship 0 subordinates and their own salary with no HAVING filter and no UNION.",
    ],
    edges: [
      "The CEO row is the headline: Nadia reports 6 subordinates and 820 subtree salary — a direct-reports-only count reads 2, and a salary excluding self reads 620.",
      "Omar and Priya tie on every aggregate except their id: both report 2 subordinates and 310 subtree salary — ORDER BY staff_id is the only key separating them, and level (both 2) never splits the pair.",
      "The leaves (Rhea, Sami, Tara) ship 0 subordinates and their own salary exactly — they exist only because the closure seeds a self-pair per member; a recursion emitting only child edges leaves them with no group at all.",
      "Insertion order is a decoy: Rhea's row (manager 3) is inserted before Priya's row exists — the recursion walks manager_id edges, never physical order, so the scrambled seed neither starves a branch nor needs re-sorting.",
    ],
    ladder: [
      { title: "Brute force — walk the tree per person", body: "For each staff member, expand direct reports level by level in application code until a pass adds nobody, tallying heads and salaries separately with opposite self-rules. Correct, but shared subtrees are re-walked (Omar's walk and Quinn's walk both visit Tara) and the asymmetric counting lives in never-tested code." },
      { title: "The pattern — transitive closure, grouped per ancestor", body: "One recursive CTE emits every (ancestor, descendant) pair from self-pairs downward; a second tracks level from the NULL-manager root. GROUP BY ancestor then counts pairs (minus one) and sums descendant salaries." },
      { title: "The optimal idea — closure once, every column states its own scope", body: "O(n × d) pairs. The durable rule: reachability needs the pair set, not repeated single-hop joins — and each output column must declare its own inclusion rule (subordinates − self, salary + self) because the same closure happily serves both." },
    ],
    approach: "recursive (ancestor, descendant) closure grouped per ancestor; subordinates = COUNT(pairs) − 1, subtree_salary = SUM(descendant salaries) untouched",
    schema: {
      ddl: `CREATE TABLE Staff (
  staff_id   INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id INTEGER,            -- NULL for the CEO only
  salary     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Staff (staff_id, name, manager_id, salary) VALUES
  (1, 'Nadia', NULL, 200),  -- the CEO: no manager
  (2, 'Omar',  1,    150),
  (4, 'Quinn', 2,    100),
  (5, 'Rhea',  3,     90),  -- inserted BEFORE her manager (staff 3) on purpose
  (3, 'Priya', 1,    140),
  (6, 'Sami',  3,     80),
  (7, 'Tara',  4,     60);`,
      tables: [
        { name: "Staff", note: "7 staff, 4 levels — Nadia (CEO) → Omar & Priya → Quinn, Rhea & Sami → Tara; subtree salaries run 60 to 820" },
      ],
    },
    code: `WITH RECURSIVE
pairs(ancestor, descendant) AS (
    -- every (ancestor, descendant) pair: seed each member with themselves,
    -- then keep adopting children until no new ones appear
    SELECT staff_id, staff_id
    FROM Staff
    UNION ALL
    SELECT p.ancestor, s.staff_id
    FROM pairs p
    JOIN Staff s ON s.manager_id = p.descendant
),
levels(staff_id, lvl) AS (
    -- chain depth from the top: the NULL-manager row starts at 1
    SELECT staff_id, 1
    FROM Staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT s.staff_id, l.lvl + 1
    FROM levels l
    JOIN Staff s ON s.manager_id = l.staff_id
)
SELECT
    s.staff_id,
    s.name,
    l.lvl AS level,
    COUNT(p.descendant) - 1 AS subordinates,   -- subtract the seeded self-pair
    SUM(d.salary)           AS subtree_salary  -- own salary rides INSIDE the sum
FROM Staff s
JOIN levels l ON l.staff_id = s.staff_id
JOIN pairs  p ON p.ancestor = s.staff_id
JOIN Staff  d ON d.staff_id = p.descendant
GROUP BY s.staff_id, s.name, l.lvl
ORDER BY s.staff_id;`,
    walkthrough: [
      "The pairs CTE fans seven self-pairs out to the full closure — eleven child edges bring the total to 18 pairs, and the deepest chain (Nadia → Omar → Quinn → Tara) makes Tara a descendant of four ancestors.",
      "Grouping per ancestor: Nadia's group holds 7 pairs → 7 − 1 = 6 subordinates and 820 in salaries; Omar's holds 3 (himself, Quinn, Tara) → 2 and 310; Tara's holds only her self-pair → 0 and 60.",
      "levels stamps Nadia 1, Omar and Priya 2, Quinn, Rhea and Sami 3, Tara 4, and ORDER BY staff_id ships the seven rows — 1 / 6 / 820 at the top, 7 / 0 / 60 at the bottom, Omar and Priya tied at 2 / 310.",
    ],
    time: "O(n × d) — the closure emits one pair per (member, ancestor) combination, d = tree depth",
    space: "O(n × d) — the pair set dominates",
    followUps: [
      "Report only managers whose subtree is large for their rank — say, subordinates > 2 × level — where does that filter live (HAVING vs an outer WHERE), and which seed rows survive it?",
      "Add each manager's deepest subordinate level as a column — can the pairs CTE carry a depth counter so MAX(depth) per ancestor answers it, and what does a leaf's own row show?",
    ],
    related: ["ceo-subordinate-hierarchy", "employees-earning-more-than-their-managers", "the-number-of-employees-which-report-to-each-employee"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "analyze-subscription-conversion",
    statement:
      "A two-step signup tracks testers in two tables. TrialUser lists every trial with (user_id, trial_start), trial_start as 'YYYY-MM-DD' text. PaidConversion lists (user_id, paid_date) for users who started paying, paid_date in the same text format. A user CONVERTED iff they own a PaidConversion row. Report columns user_id, trial_start, converted, days_to_convert — one row per TrialUser, ordered by user_id ascending — where converted is 'yes' or 'no', and days_to_convert is the whole number of days from trial_start to paid_date. Users who never converted still report, with converted 'no' and days_to_convert NULL.",
    examples: [
      {
        input: "user 203 starts a trial on 2024-03-28 and first pays on 2024-04-30",
        output: "203 · 2024-03-28 · yes · 33",
        explanation:
          "The span crosses the March/April boundary: 3 days finish March and 30 more finish April — calendar arithmetic, not string subtraction, produces 33.",
      },
      {
        input: "user 204 starts a trial on 2024-01-15 and never appears in PaidConversion",
        output: "204 · 2024-01-15 · no · NULL",
        explanation:
          "The LEFT JOIN keeps the row with NULLs on the paid side; 'no' falls out of the CASE, and no day count exists to print.",
      },
    ],
    constraints: [
      "one row per TrialUser — a user with no PaidConversion row reports 'no' with a NULL day count",
      "days_to_convert is whole days from trial_start to paid_date; a same-day conversion reports 0",
      "columns user_id, trial_start, converted, days_to_convert — ordered by user_id ascending",
    ],
    breakdown: [
      "The output population is defined by the trial table, and that decision is made in the FROM clause before any expression runs. Every TrialUser row must surface — converted or not — so the join is TrialUser LEFT JOIN PaidConversion: user 204 keeps their row with NULLs on the paid side, and the 'no' bucket exists because the LEFT keyword said so. An INNER join silently deletes the non-converter, who is the one user the report exists to surface. Starting from PaidConversion instead answers a different question — paid user 205, who never had a trial, would appear with NULL trial data while 204 vanished.",
      "Presence is a NULL test, not an aggregate: the paid side is unique per user (its primary key), so at most one row matches and no fan-out can occur. CASE WHEN p.paid_date IS NOT NULL THEN 'yes' ELSE 'no' END reads the join result directly; a COUNT-based presence check would drag a GROUP BY into a row-level report for no benefit. The NULL arm is also what makes days_to_convert behave: every expression over a NULL paid_date stays NULL, so non-converters print NULL with no special case anywhere.",
      "Day arithmetic must go through julianday because the dates are TEXT: julianday('2024-04-30') minus julianday('2024-03-28') is exactly 33 whole days across the March/April boundary, and user 202's same-day conversion lands on 0. Subtracting the raw strings coerces both operands to their leading integer — 2024 − 2024 = 0 — and every row on this seed would read 0 regardless of the true gap. The CAST to INTEGER turns the REAL difference into a clean day count; midnight-aligned dates give exact values, so no truncation error can hide inside.",
    ],
    edges: [
      "Same-day boundary: user 202 pays on their 2024-02-05 trial start — julianday gives 0.0 and the report prints 0; any '+1 day' correction or 'at least a day' assumption fabricates 1.",
      "The month-span: user 203's 2024-03-28 → 2024-04-30 is 33 days — raw text subtraction prints 0 for every row on this seed, and day-of-month arithmetic (30 − 28 = 2) never leaves March.",
      "The NULL arm: user 204 reports 'no' with NULL days — an INNER join or a HAVING over a count deletes the row instead of printing it.",
      "The orphan: PaidConversion's user 205 (paid 2024-05-02, no trial row) must stay absent — the report is trial-driven, and a right-side or full join resurrects them with a NULL trial_start.",
    ],
    ladder: [
      { title: "Brute force — eyeball two lists", body: "Look up each trial user in the paid list, write 'no' when absent, and count days on a calendar when present. The engine expresses the lookup as one LEFT JOIN and the count as a date difference." },
      { title: "The pattern — LEFT JOIN plus a CASE presence test", body: "FROM TrialUser LEFT JOIN PaidConversion ON user_id; converted = CASE WHEN paid_date IS NOT NULL THEN 'yes' ELSE 'no' END; days = CAST(julianday(paid) − julianday(trial) AS INTEGER)." },
      { title: "The optimal idea — the FROM table owns the population", body: "O(t + p). The durable rules: the LEFT table decides who exists (204 in, 205 out), presence is a NULL test rather than a count, and date math goes through julianday because text dates subtract as their leading integer." },
    ],
    approach: "TrialUser LEFT JOIN PaidConversion; 'yes'/'no' via NULL test; CAST(julianday(paid) − julianday(trial) AS INTEGER) as the day count",
    schema: {
      ddl: `CREATE TABLE TrialUser (
  user_id     INTEGER PRIMARY KEY,
  trial_start TEXT NOT NULL       -- 'YYYY-MM-DD'
);
CREATE TABLE PaidConversion (
  user_id   INTEGER PRIMARY KEY,
  paid_date TEXT NOT NULL         -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO TrialUser (user_id, trial_start) VALUES
  (201, '2024-01-10'),
  (202, '2024-02-05'),
  (203, '2024-03-28'),
  (204, '2024-01-15');
INSERT INTO PaidConversion (user_id, paid_date) VALUES
  (201, '2024-01-13'),  -- 3 days after the trial start
  (202, '2024-02-05'),  -- same-day: the 0-day boundary
  (203, '2024-04-30'),  -- 33 days across the month boundary
  -- orphan: no TrialUser row at all
  (205, '2024-05-02');`,
      tables: [
        { name: "TrialUser", note: "4 trials — user 204 never converts; 202 converts the day the trial starts" },
        { name: "PaidConversion", note: "4 paid rows — 201/202/203 convert, 205 is an orphan with no trial row" },
      ],
    },
    code: `SELECT
    t.user_id,
    t.trial_start,
    CASE WHEN p.paid_date IS NOT NULL
         THEN 'yes' ELSE 'no'
    END AS converted,
    CAST(julianday(p.paid_date) - julianday(t.trial_start) AS INTEGER)
        AS days_to_convert       -- whole days, NULL while never converted
FROM TrialUser t
LEFT JOIN PaidConversion p
  ON p.user_id = t.user_id      -- trial-only users survive with NULLs
ORDER BY t.user_id;`,
    walkthrough: [
      "The LEFT JOIN threads all four trial users through: 201, 202 and 203 match their paid rows; 204 keeps its row with NULLs; 205's paid row never joins because nothing in TrialUser points at it.",
      "The CASE stamps 'yes' on the three matched rows and 'no' on 204; the day arithmetic yields 3.0 → 3, 0.0 → 0 (same-day), and 33.0 → 33 across the March/April boundary.",
      "ORDER BY user_id ships (201, 2024-01-10, yes, 3), (202, 2024-02-05, yes, 0), (203, 2024-03-28, yes, 33), (204, 2024-01-15, no, NULL) — and 205 stays absent.",
    ],
    time: "O(t + p) — one hash join over the two lists",
    space: "O(t) — one output row per trial user",
    followUps: [
      "Split the converted bucket by speed — same-day (0 days), fast (1–7), slow (8+) — where does that CASE nest, and which bucket catches user 203's 33-day crawl?",
      "Report the conversion RATE per trial-start week — what is the denominator (all triallists or paid users), and how does keeping the LEFT JOIN stop the rate from reading 100%?",
    ],
    related: ["ads-funnel", "loan-types", "second-day-confirmation"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-overbooked-employees",
    statement:
      "A shift rota logs every scheduled shift as one row in RotaEntry: entry_id, employee_id, start_time, end_time — both times 'YYYY-MM-DD HH24:MI' text, and end_time is strictly after start_time. An employee is OVERBOOKED when some pair of their own shifts overlaps: the two shifts share real time, not merely an endpoint. Shifts that touch (one ending exactly when the next starts) are legal back-to-back scheduling, not overlap. Report one column, employee_id — every overbooked employee exactly once, ordered by employee_id ascending.",
    examples: [
      {
        input: "employee 31 is rostered 09:00–11:30, 10:15–12:45 and 11:00–14:00 on the same day",
        output: "31",
        explanation:
          "All three shifts pairwise share real minutes — 10:15–11:30, 11:00–11:30, 11:00–12:45 — so three separate pairs qualify and DISTINCT collapses them to one row.",
      },
      {
        input: "employee 32 works 09:00–11:00 and then 11:00–13:00",
        output: "(no row)",
        explanation:
          "The shifts touch at exactly 11:00 but never run simultaneously; the strict test finds no qualifying pair and 32 stays out of the report.",
      },
    ],
    constraints: [
      "overlap is strict and two-sided: a.start < b.end AND b.start < a.end — shifts whose endpoints merely touch do not count",
      "each overbooked employee appears exactly once, no matter how many of their shift pairs overlap",
      "one column employee_id — ordered by employee_id ascending",
    ],
    breakdown: [
      "Interval overlap is inherently a two-sided question: [a.start, a.end) meets [b.start, b.end) exactly when each starts before the other finishes — a.start < b.end AND b.start < a.end. Both halves are load-bearing. A one-sided variant ('the second shift starts inside the first') misses engulfing pairs: employee 33's long shift (08:00–16:00) carries the HIGHER entry_id, so tested from the short shift (10:00–11:30) the engulfed-side check never fires — the long shift starts before, not inside. Loosening either strict < to <= admits shifts that merely touch, which the brief explicitly legalizes.",
      "The self-join needs pairing discipline before any interval test matters. Joined on employee_id alone, every shift matches itself (a.start < a.end is true by the schema's own constraint) and every pair appears twice, as (x, y) and again as (y, x). The id guard a.entry_id < b.entry_id kills both defects at once: the diagonal cannot satisfy a strict less-than against itself, and only one of each mirrored pair survives. After that, DISTINCT collapses employee 31's three qualifying pairs — (1,2), (1,3) and (2,3) — into the single report row the brief demands.",
      "The boundary is the report's entire value: back-to-back handovers are the normal rhythm of shift work, so a query that flags every touch cries wolf and gets ignored. Employee 32's day (09:00–11:00 then 11:00–13:00) is perfectly sequenced — the strict test finds no pair and 32 stays out. Fixed-format 'YYYY-MM-DD HH24:MI' strings compare correctly character by character — the date prefix dominates, so even shifts on different days order properly — and the predicate needs no casting and no date functions.",
    ],
    edges: [
      "The touch: employee 32's shifts (entry 4) 09:00–11:00 and (entry 5) 11:00–13:00 share only the 11:00 endpoint — one <= anywhere in the test fabricates a row for 32.",
      "Containment, scrambled: employee 33's entry 6 (10:00–11:30) sits inside entry 7 (08:00–16:00), and the SHORT shift holds the lower id — a one-sided starts-inside test misses the pair under this ordering; the symmetric strict test catches it from either side.",
      "DISTINCT over pairs: employee 31 forms three overlapping pairs — without DISTINCT the report prints 31 three times.",
      "Employee 34's shifts (08:00–09:30, 14:00–15:30) are hours apart and form no pair — but dropping the employee_id join lets 34's morning shift collide with OTHER employees' shifts and flags everyone.",
    ],
    ladder: [
      { title: "Brute force — sort and eyeball each rota", body: "Print every employee's shifts sorted by start time and scan for collisions by hand, remembering that touching shifts are fine. The engine expresses the same scan as one self-join carrying an interval predicate." },
      { title: "The pattern — self-join with an id guard and a strict test", body: "JOIN RotaEntry b ON the same employee AND a.entry_id < b.entry_id AND a.start < b.end AND b.start < a.end; SELECT DISTINCT employee_id keeps one row per offender." },
      { title: "The optimal idea — two-sided strictness plus a pairing contract", body: "O(n²) same-employee pairs worst case. The durable rules: overlap is two-sided (containment is invisible from one end), the id guard IS the dedupe (no self-pairs, no mirrors), and strictness encodes the touch policy." },
    ],
    approach: "self-join per employee with entry_id guard, strict two-sided interval test, DISTINCT employee_id",
    schema: {
      ddl: `CREATE TABLE RotaEntry (
  entry_id    INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  start_time  TEXT NOT NULL,      -- 'YYYY-MM-DD HH24:MI'
  end_time    TEXT NOT NULL       -- end_time is strictly after start_time
);`,
      seed: `INSERT INTO RotaEntry (entry_id, employee_id, start_time, end_time) VALUES
  (1, 31, '2025-06-02 09:00', '2025-06-02 11:30'),  -- 31: overlaps 2 and 3
  (2, 31, '2025-06-02 10:15', '2025-06-02 12:45'),  -- overlaps 1 and 3
  (3, 31, '2025-06-02 11:00', '2025-06-02 14:00'),  -- overlaps 1 and 2
  (4, 32, '2025-06-03 09:00', '2025-06-03 11:00'),
  (5, 32, '2025-06-03 11:00', '2025-06-03 13:00'),  -- touches at 11:00 exactly
  (6, 33, '2025-06-04 10:00', '2025-06-04 11:30'),  -- SHORT shift, lower id
  (7, 33, '2025-06-04 08:00', '2025-06-04 16:00'),  -- engulfing shift, HIGHER id
  (8, 34, '2025-06-05 08:00', '2025-06-05 09:30'),
  -- hours apart: no pair
  (9, 34, '2025-06-05 14:00', '2025-06-05 15:30');`,
      tables: [
        { name: "RotaEntry", note: "9 shifts over 4 employees — 31 triple-booked, 32 back-to-back, 33 short-inside-long (inserted long-second), 34 clean" },
      ],
    },
    code: `SELECT DISTINCT
    a.employee_id
FROM RotaEntry a
JOIN RotaEntry b
  ON  b.employee_id = a.employee_id   -- pairs live inside ONE person's rota
 AND  a.entry_id    < b.entry_id      -- each unordered pair once, no self-pairs
 AND  a.start_time  < b.end_time      -- strict on BOTH sides:
 AND  b.start_time  < a.end_time      -- endpoints may touch, never overlap
ORDER BY a.employee_id;`,
    walkthrough: [
      "The self-join forms every same-employee pair once: 31 contributes (1,2), (1,3), (2,3); 32 contributes (4,5); 33 contributes (6,7); 34 contributes (8,9).",
      "The strict interval test keeps 31's three pairs (real shared minutes each) and 33's contained pair (10:00–11:30 inside 08:00–16:00); it rejects 32's (4,5) — 11:00 < 11:00 fails — and 34's far-apart (8,9).",
      "DISTINCT collapses 31's three surviving pairs to one row, and ORDER BY employee_id ships (31), (33) — the touching 32 and the disjoint 34 never surface.",
    ],
    time: "O(n²) worst case — every same-employee pair is tested once",
    space: "O(p) — the surviving pairs held before DISTINCT",
    followUps: [
      "Report each overbooked employee WITH their number of conflicting pairs — what changes in the SELECT and GROUP BY, and what does employee 31's count read (three pairs, not three shifts)?",
      "Flag the deepest stack instead — the employee with three shifts live at once — how does a sweep of per-row +1/−1 deltas with a running SUM find depth 3, and why can pair counting never recover that depth?",
    ],
    related: ["find-overlapping-shifts", "employee-task-duration-and-concurrent-tasks", "merge-overlapping-events-in-the-same-hall"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-covid-recovery-patients",
    statement:
      "TestResult logs one row per test: test_id, patient_id, tested_on ('YYYY-MM-DD' text), result ('positive' or 'negative'); a patient has at most one test per day. A patient is RECOVERED when they tested positive at some point and later tested negative on a strictly later date. Report columns patient_id, positive_date, recovery_date — one row per recovered patient, ordered by patient_id ascending — where positive_date is the patient's FIRST positive test and recovery_date is their FIRST negative test dated after that positive. Patients with no positive at all, or no negative after their positive, appear nowhere in the report.",
    examples: [
      {
        input: "patient 42 tests negative on 2024-02-01, positive on 2024-02-10, negative again on 2024-02-20",
        output: "42 · 2024-02-10 · 2024-02-20",
        explanation:
          "The 02-01 negative predates the infection and is skipped: recovery anchors to the FIRST positive, and only negatives strictly after 02-10 qualify.",
      },
      {
        input: "patient 43 tests positive on 2024-03-03, positive again on 2024-03-08, negative on 2024-03-15",
        output: "43 · 2024-03-03 · 2024-03-15",
        explanation:
          "Still exactly one row: the report shows the first positive even though a second positive intervened, and the 03-15 negative answers it.",
      },
    ],
    constraints: [
      "recovery_date must be STRICTLY later than positive_date — a patient's earliest negative overall is not necessarily their recovery",
      "one row per recovered patient; a positive with no later negative, and a negative-only history, ship nothing",
      "columns patient_id, positive_date, recovery_date — ordered by patient_id ascending",
    ],
    breakdown: [
      "Two minima are requested, but they are not independent: which negative counts as recovery DEPENDS on which positive anchors it. Taking MIN over all negatives per patient ignores that dependency — patient 42's earliest negative (2024-02-01) predates their first positive (2024-02-10), and 'recovered nine days before infection' is not a row the report may print. The engine shape is therefore a chain: a CTE reduces each patient to their first positive, then the main query minimizes over negatives strictly AFTER that anchor date. The dependency is encoded physically: the anchor value from the CTE sits inside the second stage's join, gating which rows the MIN ever sees.",
      "The joins are INNER at every stage because the output population is exactly the patients who complete both stages. Patient 44 tests positive but never negative afterwards: they form an anchor row, find no qualifying negative, and their grouped join produces no group at all. Patient 45 never tests positive and never enters stage one. A LEFT JOIN would print 44 with a NULL recovery_date — a row asserting a recovery that never happened, which in a clinical report is strictly worse than absence.",
      "Strictness lives in one character: t.tested_on > f.positive_date, not >=. With at most one test per patient per day a same-day negative is impossible anyway, but >= documents the wrong contract and breaks the moment the schema allows twice-daily tests. Patient 43's second positive (2024-03-08) is a decoy for pairing logic: anchoring on the FIRST positive yields one chain per patient, while pairing EVERY positive with the first later negative fabricates a second row for 43. GROUP BY the anchor (patient, positive_date) keeps the report at patient grain.",
    ],
    edges: [
      "The pre-positive negative: patient 42's 2024-02-01 test is their global earliest negative — dropping the > anchor filter reports recovery on 02-01, nine days BEFORE the 02-10 positive it supposedly cures.",
      "The double positive: patient 43's 03-03 and 03-08 positives — a per-positive pairing ships 43 twice (both chains end at 03-15); anchoring on the first positive ships one row.",
      "The absent arms: patient 44 (positive 2024-04-02, no later negative) and patient 45 (negative only) ship nothing — a LEFT JOIN dresses 44 up as recovered with a NULL recovery_date.",
      "Patient 41 is the happy path where global-first-negative and first-later-negative coincide (01-05 → 01-12) — a seed of only clean recoveries would hide the filter bug entirely.",
    ],
    ladder: [
      { title: "Brute force — sort and scan per patient", body: "Sort each patient's tests by date, find the first positive, keep scanning for the first negative after it. The engine expresses the walk as two grouped MIN passes joined through the anchor date." },
      { title: "The pattern — first-positive CTE, then a gated MIN", body: "CTE: MIN(tested_on) WHERE result = 'positive' GROUP BY patient_id. Stage two: join tests on patient, result = 'negative', tested_on > positive_date, and MIN(tested_on) is the recovery." },
      { title: "The optimal idea — dependent minima chain through their anchor", body: "O(n log n). The durable rule: when one minimum's DEFINITION references another, chain them — compute the anchor first, then minimize over the gated remainder — and let INNER joins encode 'must exist'." },
    ],
    approach: "per-patient MIN over positives, then MIN over negatives strictly after that anchor; INNER join keeps only recovered patients",
    schema: {
      ddl: `CREATE TABLE TestResult (
  test_id    INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  tested_on  TEXT NOT NULL,       -- 'YYYY-MM-DD'
  result     TEXT NOT NULL        -- 'positive' or 'negative'
);`,
      seed: `INSERT INTO TestResult (test_id, patient_id, tested_on, result) VALUES
  (1, 41, '2024-01-05', 'positive'),
  (2, 41, '2024-01-12', 'negative'),  -- clean recovery
  (3, 42, '2024-02-01', 'negative'),  -- BEFORE the positive: must be skipped
  (4, 42, '2024-02-10', 'positive'),
  (5, 42, '2024-02-20', 'negative'),  -- the real recovery
  (6, 43, '2024-03-03', 'positive'),  -- FIRST positive: the one reported
  (7, 43, '2024-03-08', 'positive'),  -- second positive: decoy
  (8, 43, '2024-03-15', 'negative'),
  (9, 44, '2024-04-02', 'positive'),  -- no later negative: absent
  -- never positive: absent
  (10, 45, '2024-04-09', 'negative');`,
      tables: [
        { name: "TestResult", note: "10 tests over 5 patients — 41 clean, 42 negative-first, 43 double-positive, 44 positive-only, 45 negative-only" },
      ],
    },
    code: `WITH first_positive AS (
    SELECT
        patient_id,
        MIN(tested_on) AS positive_date   -- the anchor every recovery hangs from
    FROM TestResult
    WHERE result = 'positive'
    GROUP BY patient_id
)
SELECT
    f.patient_id,
    f.positive_date,
    MIN(t.tested_on) AS recovery_date     -- earliest negative AFTER the anchor
FROM first_positive f
JOIN TestResult t
  ON  t.patient_id = f.patient_id
 AND  t.result     = 'negative'
 AND  t.tested_on  > f.positive_date     -- strictly later: skips pre-positive negatives
GROUP BY f.patient_id, f.positive_date
ORDER BY f.patient_id;`,
    walkthrough: [
      "first_positive reduces ten tests to four anchors: 41 → 2024-01-05, 42 → 2024-02-10, 43 → 2024-03-03, 44 → 2024-04-02; patient 45 has no positive and enters nothing.",
      "Stage two scans negatives after each anchor: 41's only negative (01-12) qualifies; 42's 02-01 fails the > gate while 02-20 passes; 43's 03-15 passes; 44 finds no negative and its group empties out.",
      "The INNER join ships exactly the completed chains, ordered: (41, 2024-01-05, 2024-01-12), (42, 2024-02-10, 2024-02-20), (43, 2024-03-03, 2024-03-15) — 44 and 45 are absent.",
    ],
    time: "O(n log n) — two grouped passes with a keyed join between them",
    space: "O(p) — one anchor row per ever-positive patient",
    followUps: [
      "Report each recovered patient's infection SPAN (recovery_date − positive_date) beside the dates — what does julianday arithmetic add, and which patient carries the longest span on this seed?",
      "Handle reinfection: a patient who goes positive AGAIN after a recovery starts a new episode — how would ordered-test islands split each history into episodes, and does this seed contain one?",
    ],
    related: ["patients-with-a-condition", "second-day-verification", "second-most-recent-activity"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-books-with-no-available-copies",
    statement:
      "A library tracks stock in two tables. LibraryBook lists (book_id, title, total_copies). Loan lists every lending event as (loan_id, book_id, returned), where returned is 0 while the copy is still out and 1 once it is back. A book has NO available copies iff the number of its UNRETURNED loans equals total_copies — every owned copy is on loan somewhere. Report columns book_id, title for exactly those books, ordered by book_id ascending; books with a copy to spare, or none on loan, are not reported.",
    examples: [
      {
        input: "book 61 'Chain of Office' owns 2 copies and both are on unreturned loans",
        output: "61 · Chain of Office",
        explanation:
          "2 unreturned = 2 total: zero headroom, so the book ships in the report.",
      },
      {
        input: "book 64 'Salt and Ember' owns 2 copies; one loan is still out and one came back",
        output: "(no row)",
        explanation:
          "Only the returned = 0 loan occupies stock: 1 unreturned < 2 total, so a copy is available and 64 stays out of the report.",
      },
    ],
    constraints: [
      "only loans with returned = 0 occupy a copy; a returned loan frees its copy immediately",
      "a book with zero loans has every copy available — it never qualifies, whatever total_copies says",
      "columns book_id, title — ordered by book_id ascending",
    ],
    breakdown: [
      "Two tables at different grains meet: one row per book, many loans per book, and the question is a per-book comparison of a count against a stored total. The count is built by joining Loan onto LibraryBook and keeping only returned = 0 rows, so each book's group holds exactly its still-out loans. The LEFT JOIN is the shape that generalizes: books with no surviving loans keep a row whose loan-side columns are NULL, so a count over a loan column reads 0 and the report never invents phantom stock. On this seed the final answer would survive an INNER join too (book 65 does not qualify anyway), but the LEFT shape keeps the aggregate honest for every book, not just the reported ones.",
      "The aggregate choice is the whole bug class. COUNT(l.loan_id) counts non-NULL loan ids: book 65's phantom left-joined row carries no id and counts as nothing, so a never-lent book reads 0. COUNT(*) counts ROWS — book 65's phantom row is a real row, so a book with zero loans reads 1 and, against total_copies = 1, qualifies absurdly. And the returned filter guards books 63 and 64 from a subtler failure: drop returned = 0 and their raw loan counts (3 and 2) equal their stocks, so two books with copies on the shelf get reported.",
      "The comparison itself is an aggregate-versus-column test, so it belongs in HAVING, and it is equality: unreturned equals total. More unreturned loans than copies is impossible data, so >= reads the same here — equality simply states the contract without leaning on that invariant. GROUP BY must carry total_copies (and title) beside the id so the HAVING can reference them and two same-named books never merge. ORDER BY book_id finishes the exact-order contract with a unique key.",
    ],
    edges: [
      "Book 64's returned loan (loan 8): the ONLY thing keeping 64 out is counting returned = 0 rows — an unfiltered COUNT reads 2 loans against 2 copies and reports a book with a copy on the shelf.",
      "Book 65 (zero loans, total 1): the LEFT JOIN's phantom row makes COUNT(*) report 1 — a book never lent reads as fully loaned; COUNT(l.loan_id) sees NULL and reports 0.",
      "Book 63 (total 3, 2 out, 1 back): headroom exists, but its raw loan count (3) equals its stock — the returned filter is the only defense.",
      "Books 61 and 62 pin the qualifying boundary at equality (2 = 2 and 1 = 1): a HAVING of COUNT > total would report nothing at all.",
    ],
    ladder: [
      { title: "Brute force — audit the shelf by hand", body: "For each title, walk the loan cards, tally the ones not yet returned, and compare against the copy count. The engine does it in one LEFT JOIN, one grouped count, one HAVING." },
      { title: "The pattern — LEFT JOIN, conditional count, HAVING equality", body: "LEFT JOIN Loan ON book_id AND returned = 0, GROUP BY the book, COUNT over a loan-side column, and keep groups where the count equals total_copies." },
      { title: "The optimal idea — the counting aggregate encodes the contract", body: "O(b + l). The durable rules: COUNT(column) ignores the NULLs a LEFT JOIN creates while COUNT(*) counts the phantom row itself, the returned filter defines what 'occupies stock' means, and equality in HAVING states the condition exactly." },
    ],
    approach: "LEFT JOIN unreturned loans per book; HAVING COUNT(loan column) = total_copies; ordered by book_id",
    schema: {
      ddl: `CREATE TABLE LibraryBook (
  book_id      INTEGER PRIMARY KEY,
  title        TEXT NOT NULL,
  total_copies INTEGER NOT NULL
);
CREATE TABLE Loan (
  loan_id  INTEGER PRIMARY KEY,
  book_id  INTEGER NOT NULL,
  returned INTEGER NOT NULL       -- 1 = back on the shelf, 0 = still out
);`,
      seed: `INSERT INTO LibraryBook (book_id, title, total_copies) VALUES
  (61, 'Chain of Office', 2),
  (62, 'Quiet Ledger', 1),
  (63, 'The Long Walk', 3),
  (64, 'Salt and Ember', 2),
  (65, 'Glass Harbor', 1);
INSERT INTO Loan (loan_id, book_id, returned) VALUES
  (1, 61, 0),  -- both of 61's copies are out
  (2, 61, 0),
  (3, 62, 0),  -- the single copy out: qualifies
  (4, 63, 0),
  (5, 63, 0),
  (6, 63, 1),  -- one of three back: headroom stays
  (7, 64, 0),
  -- the returned loan must NOT count
  (8, 64, 1);`,
      tables: [
        { name: "LibraryBook", note: "5 books — 61 and 62 have zero headroom; 63, 64 and 65 all have a free copy" },
        { name: "Loan", note: "8 loans — 6 still out, 2 returned; book 65 has never been lent" },
      ],
    },
    code: `SELECT
    b.book_id,
    b.title
FROM LibraryBook b
LEFT JOIN Loan l
  ON  l.book_id  = b.book_id
 AND  l.returned = 0              -- only still-out loans occupy a copy
GROUP BY b.book_id, b.title, b.total_copies
HAVING COUNT(l.loan_id) = b.total_copies   -- phantom rows count as nothing
ORDER BY b.book_id;`,
    walkthrough: [
      "The LEFT JOIN with the returned = 0 clause gives every book a group holding only its still-out loans: 61 → 2, 62 → 1, 63 → 2 (returned loan 6 never joins), 64 → 1 (loan 8 returned), 65 → one row with no loan at all.",
      "COUNT(l.loan_id) turns those into 2, 1, 2, 1, 0 and HAVING compares each against stock: 2 = 2 for 61 and 1 = 1 for 62 qualify; 2 < 3 (63), 1 < 2 (64) and 0 < 1 (65) fail.",
      "ORDER BY book_id ships (61, 'Chain of Office') and (62, 'Quiet Ledger') — COUNT(*) over the filtered join would have added 65 (its phantom row reads 1 against 1), and dropping the returned filter would have added 63 and 64.",
    ],
    time: "O(b + l) — one scan of loans hashed onto books",
    space: "O(b) — one group per book",
    followUps: [
      "Report every book WITH its available-copy count (total minus unreturned) — what does the SELECT add, what does book 65 print, and can the count ever go negative on bad data?",
      "Treat a copy as lost when its loan is older than 30 days — where does that date test join the returned filter, and does it change any qualifying book on this seed?",
    ],
    related: ["books-with-null-ratings", "unpopular-books", "average-selling-price"],
    order: "exact",
    xp: 10,
  },
];
