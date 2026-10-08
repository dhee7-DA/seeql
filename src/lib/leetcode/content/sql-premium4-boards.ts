// Deep-dives — LeetCode Premium batch IV, file 5 of 6: department boards,
// weighted means, transaction thirds, regional rankings, percentiles, staffing
// rosters and skill gates (7 problems: 2 Easy, 3 Medium, 2 Hard). All read
// problems, order:"exact". Engine-verified by scripts/tmp-68b5-check.ts (the
// lead's lc-sql-verify.ts run regenerates sql-expected.ts after wiring).
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_BOARDS: LcSqlDive[] = [
  {
    slug: "manager-of-the-largest-department",
    statement:
      "Three tables model a company. People lists the managers by id and name. Department lists faculties (dept_id, dept_name, manager_id), where manager_id references People.people_id. Employee lists staff (emp_id, name, dept_id) — emp_id is its own key space, unrelated to people_id. Report the manager of the department with the MOST employees: columns dept_id, dept_name, manager_id, manager_name — one row per department tied for the largest headcount (ties report every tied department), ordered by dept_id ascending.",
    examples: [
      {
        input:
          "Department 1 'Harbor Operations' (manager 11) holds 4 employees (101-104); Design Studio and Field Support hold 1 each; Research Lab holds none",
        output: "1 · Harbor Operations · 11 · Ada",
        explanation:
          "4 is the strict maximum, so only department 1 ships. Manager 11 resolves through People to 'Ada' — Employee's emp_id 11 belongs to 'June', a Field Support worker, and is a different id space entirely.",
      },
      {
        input: "Department 4 'Research Lab' exists with manager 14 but has no Employee rows",
        output: "(absent — an empty department cannot win)",
        explanation:
          "GROUP BY forms a headcount group only for departments that have employees, and 0 can never equal the global maximum of 4 — no special case is needed.",
      },
    ],
    constraints: [
      "one row per department whose headcount equals the largest headcount across ALL departments; this seed's headcounts are 4, 1, 1 and 0, so exactly one row ships",
      "manager_name is the People name of Department.manager_id — managers are not Employee rows, and the two id spaces (people_id, emp_id) never refer to each other",
      "columns dept_id, dept_name, manager_id, manager_name — ordered by dept_id ascending, which also orders the output deterministically if several departments tie at the top",
    ],
    breakdown: [
      "The report is an argmax over groups, and the hard part is that the winner's count is a GLOBAL fact, not a per-group fact. GROUP BY dept_id over Employee computes every headcount in one pass, but the question 'is 4 the largest?' cannot be answered inside that same grouped query — a maximum of counts would be an aggregate over aggregates, which SQL does not nest. The counts have to be materialised first (a CTE or subquery), and the global maximum computed from those grouped rows in a second step. The winner test then compares each group's headcount against that global maximum.",
      "Empty departments need no handling, but only because of how GROUP BY works. Research Lab has no Employee rows, so no (dept_id = 4) group ever forms — a group cannot exist without at least one contributing row, and an absent group cannot equal a maximum that is at least 1. The join from Department to the counts CTE can therefore stay an INNER join — department 4 has no group to join against — and even a LEFT JOIN variant would only hand it a zero, which loses to 4 anyway. Note the reverse direction: a department CAN win with a single employee, so the rule is 'empties cannot win', never 'small departments cannot win'.",
      "The manager's name is a lookup, and the choice of lookup table is the trap. Department.manager_id references People.people_id, so the name comes from a keyed join onto People. Employee looks tempting because it also carries names — but its emp_id is a different id space: employee 11 is June, a Field Support worker, while people 11 is Ada, Harbor Operations' manager. A join onto Employee on emp_id = manager_id does not error — it silently resolves department 1's manager to the wrong person's name. Whenever two tables both hold a name column, the foreign key decides which one to read.",
    ],
    edges: [
      "The id collision is deliberate: Employee row (11, 'June', 3) shares its number with department 1's manager_id 11, so JOIN Employee ON emp_id = manager_id reports (1, 'Harbor Operations', 11, 'June') — a wrong row with no error. The correct join reads People and reports 'Ada'.",
      "Department 4 has zero employees and forms no group in the counts CTE — a HAVING COUNT(*) = (global max) formulation likewise keeps it out — and a LEFT JOIN with COALESCE(headcount, 0) still cannot win, because 0 never equals 4.",
      "The tie rule lives at the TOP only: Design Studio and Field Support tie at 1 each, and a query that tie-breaks or deduplicates groups before finding the maximum (or reports every department sharing second place) answers a different question. The comparison is headcount = global max, evaluated per department.",
      "If every department were empty, the counts CTE would hold no rows and MAX(headcount) would return NULL — an equality test against NULL is never true, so the report would correctly ship zero rows rather than guessing.",
    ],
    ladder: [
      { title: "Brute force — count by hand", body: "Tally each department's employees on paper, spot the largest tally, then look up that department's manager in the People roster. Three manual steps the engine folds into a grouped pass plus one equality test." },
      { title: "The pattern — group, then compare against the global max", body: "A counts CTE reduces Employee to (dept_id, headcount); a one-row MAX over those rows is the global maximum; joining Department to counts and keeping headcount = max picks the winner, and a keyed join onto People restores the manager's name." },
      { title: "The optimal idea — global facts need a second pass", body: "O(e + d). The durable rule: a question about a GROUP's relation to ALL groups ('is my count the biggest?') can never be answered inside one GROUP BY — materialise the groups, aggregate over them, then compare." },
    ],
    approach: "counts CTE over Employee, MAX over the counts as the global bar, join Department keeping headcount = max, name via People",
    schema: {
      ddl: `CREATE TABLE Department (
  dept_id    INTEGER PRIMARY KEY,
  dept_name  TEXT NOT NULL,
  manager_id INTEGER NOT NULL REFERENCES People(people_id)
);
CREATE TABLE People (
  people_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Employee (
  emp_id  INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  dept_id INTEGER NOT NULL REFERENCES Department(dept_id)
);`,
      seed: `INSERT INTO People (people_id, name) VALUES
  (11, 'Ada'),
  (12, 'Bram'),
  (13, 'Cleo'),
  (14, 'Dmitri');
INSERT INTO Department (dept_id, dept_name, manager_id) VALUES
  (1, 'Harbor Operations', 11),
  (2, 'Design Studio', 12),
  (3, 'Field Support', 13),
  (4, 'Research Lab', 14);
INSERT INTO Employee (emp_id, name, dept_id) VALUES
  (101, 'Esme', 1),
  (102, 'Farid', 1),
  (103, 'Gina', 1),
  (104, 'Hana', 1),
  (105, 'Ivan', 2),
  -- emp_id 11 collides with department 1's manager people_id 11
  (11, 'June', 3);`,
      tables: [
        { name: "Department", note: "4 faculties — Research Lab (4) has a manager but no employees" },
        { name: "People", note: "the 4 managers — the only names the manager lookup needs" },
        { name: "Employee", note: "6 staff rows — Harbor Operations 4, Design Studio 1, Field Support 1; emp_id 11 is June (Field Support), a different id space from people_id 11 (Ada)" },
      ],
    },
    code: `WITH counts AS (
    SELECT
        dept_id,
        COUNT(*) AS headcount           -- one group per department WITH employees
    FROM Employee
    GROUP BY dept_id
),
top AS (
    SELECT MAX(headcount) AS max_hc     -- the GLOBAL maximum over the groups
    FROM counts
)
SELECT
    d.dept_id,
    d.dept_name,
    d.manager_id,
    p.name AS manager_name              -- manager names live in People, not Employee
FROM Department d
JOIN counts c ON c.dept_id = d.dept_id
JOIN top ON c.headcount = top.max_hc    -- keep every department AT the global max
JOIN People p ON p.people_id = d.manager_id
ORDER BY d.dept_id;`,
    walkthrough: [
      "The counts CTE collapses six Employee rows into three groups: Harbor Operations 4, Design Studio 1, Field Support 1. Research Lab forms no group — GROUP BY counts only rows that exist.",
      "top reduces those groups to one number, 4; the join keeps the department whose headcount equals it — department 1 — and the keyed lookup onto People turns manager_id 11 into 'Ada'. The 1-1 tie below never enters the comparison.",
      "One row ships: (1, 'Harbor Operations', 11, 'Ada'). The Employee-side wrong join would have printed manager 'June' — employee 11, not people 11.",
    ],
    time: "O(e + d) — one grouped pass over Employee plus keyed joins on departments and managers",
    space: "O(d) — one headcount row per department holding employees",
    followUps: [
      "Report every department beside its headcount and an is_largest flag — how does MAX(headcount) OVER () replace the top CTE, and what flag value does the empty department need (and from which join)?",
      "Report the manager of the SECOND-largest department too, ties included — which comparison changes, and why does a LIMIT 1 OFFSET 1 style shortcut break the moment two departments tie at the top?",
    ],
    related: ["department-highest-salary", "managers-with-at-least-5-direct-reports", "count-student-number-in-departments"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "calculate-compressed-mean",
    statement:
      "SalaryBucket stores pay bands as one row per bucket: (bucket_id, hourly_wage, worker_count) — hourly_wage is the flat wage every worker in that bucket earns, and worker_count is how many workers sit in it. Report the compressed (worker-weighted) mean wage across all buckets: a single column mean_wage, a single row, holding the sum over buckets of wage times worker count, divided by the total number of workers, rounded to two decimal places.",
    examples: [
      {
        input: "bucket 1 pays 360/hour to 4 workers, bucket 2 pays 380 to 3, bucket 3 pays 390 to 3, bucket 4 pays 400 to 1",
        output: "377.27",
        explanation:
          "Weighted sum 360*4 + 380*3 + 390*3 + 400*1 = 4150 over 11 workers: 4150/11 = 377.2727..., rounded to 377.27.",
      },
      {
        input: "the same four buckets read as four equal rows — 360, 380, 390, 400 — averaged directly",
        output: "382.5 (the trap, not the answer)",
        explanation:
          "AVG(hourly_wage) gives every bucket a quarter of the weight; the true weighting gives bucket 1's wage four elevenths. The two means disagree by more than 5.",
      },
    ],
    constraints: [
      "single column mean_wage, single row — the worker-weighted mean over every bucket, rounded to 2 decimal places",
      "the wage stored on a bucket applies to every worker in it — a bucket's contribution is wage * worker_count, and the divisor is SUM(worker_count), not COUNT(*)",
      "the division must be floating point before rounding: both sums are integers, so an unguarded integer division truncates the fraction away first",
    ],
    breakdown: [
      "The word compressed is the tell: the table has already compressed many workers into one row per bucket, and un-bucketing means weighting each wage by how many workers it speaks for. SUM(hourly_wage * worker_count) accumulates the full payroll per hour, and SUM(worker_count) recovers the true headcount; their ratio is the mean wage of a person drawn uniformly from the workforce. AVG(hourly_wage) answers a different question — the mean BUCKET wage — and treats a 400/hour bucket holding one worker the same as a 360/hour bucket holding four. On this seed the plain average is 382.5 while the weighted truth is 377.27: the discrepancy is the whole exercise.",
      "The 1.0 promotion is not decoration. SQLite divides two INTEGER operands with integer division — 4150/11 evaluates to 377, the fraction discarded before ROUND ever sees it — so the numerator must become REAL before the slash: multiply it by 1.0 or CAST it, and the division then promotes the denominator along with it. Placement matters as much as presence: writing the integer division first and multiplying by 1.0 afterwards promotes the already-truncated 377, and rounding 377.0 changes nothing. The promotion belongs on the numerator, inside the division.",
      "ROUND(x, 2) is the contract's last inch, and it only means something once the value is REAL. The exact quotient here is the repeating decimal 377.2727..., which no finite decimal column can carry, so the report pins the display precision at two places. Rounding earlier — say, the per-bucket products before summing — would corrupt the numerator; the only safe order is divide in floating point, then round the single quotient. One row in, one row out: an aggregate query with no GROUP BY folds the whole table into the answer.",
    ],
    edges: [
      "Drop the 1.0 and SQLite prints 377: 4150/11 is integer division, the 0.2727 gone before ROUND runs — and ROUND(377, 2) is still 377. The naive query is wrong by more than a quarter of a wage step yet looks plausible.",
      "Promote too late and the damage is already done: SUM(hourly_wage * worker_count) / SUM(worker_count) * 1.0 is 377.0, not 377.27 — the truncation happened at the slash, and no later multiplication restores lost digits.",
      "AVG(hourly_wage) reports 382.5 on this seed — every bucket equal-weighted — while the compressed mean is 377.27; the 400/hour bucket weighs one eleventh of the workforce, not one quarter of the rows.",
      "COUNT(*) as the divisor gives 4150/4 = 1037.5 — the number of BUCKETS is not the number of workers; only SUM(worker_count) = 11 reconstructs the headcount the compression erased.",
    ],
    ladder: [
      { title: "Brute force — expand the buckets", body: "Write out each bucket's workers as individual wage rows (four rows of 360, three of 380, and so on), then average the 11 values. Correct, and exactly the work the weighted sum performs in one expression." },
      { title: "The pattern — weighted SUM over SUM", body: "SUM(hourly_wage * worker_count) is the total payroll-hour; SUM(worker_count) is the headcount; the ratio, promoted to floating point, is the compressed mean." },
      { title: "The optimal idea — respect the compression, guard the division", body: "O(b). The durable rules: when rows are pre-aggregated with a count column, every mean is SUM(product)/SUM(weight), never AVG of the stored values — and on integer columns the promotion to REAL must precede the slash or the fraction is gone." },
    ],
    approach: "SUM(wage * count) promoted to REAL, divided by SUM(count), rounded to 2 decimals in one ungrouped aggregate",
    schema: {
      ddl: `CREATE TABLE SalaryBucket (
  bucket_id    INTEGER PRIMARY KEY,
  hourly_wage  INTEGER NOT NULL,
  worker_count INTEGER NOT NULL
);`,
      seed: `INSERT INTO SalaryBucket (bucket_id, hourly_wage, worker_count) VALUES
  (1, 360, 4),   -- payroll share 1440
  (2, 380, 3),   -- 1140
  (3, 390, 3),   -- 1170
  -- bucket 4 adds 400: the totals are 4150 over 11 workers
  (4, 400, 1);`,
      tables: [
        { name: "SalaryBucket", note: "4 buckets, 11 workers — wages 360/380/390/400 with counts 4/3/3/1" },
      ],
    },
    code: `SELECT
    ROUND(
        SUM(hourly_wage * worker_count) * 1.0 / SUM(worker_count),
        2
    ) AS mean_wage               -- promotion BEFORE the slash: 4150.0 / 11
FROM SalaryBucket
ORDER BY mean_wage;              -- one row, so the order is nominal but stated`,
    walkthrough: [
      "The ungrouped aggregate folds all four buckets into one row: the payroll-hour sum is 1440 + 1140 + 1170 + 400 = 4150, and the worker sum is 4 + 3 + 3 + 1 = 11.",
      "The numerator promotes to REAL before the slash: 4150.0/11 = 377.2727... — integer division would have stopped at 377.",
      "ROUND pins the quotient to two decimals and the report ships a single row: 377.27. AVG(hourly_wage) would have shipped 382.5, and a COUNT(*) divisor would have shipped 1037.5.",
    ],
    time: "O(b) — one pass over the buckets for both sums",
    space: "O(1) — two accumulators and one quotient",
    followUps: [
      "Add a share column giving each bucket's slice of the total payroll as a percentage — where does the grand total come from (a window over the rows, or a scalar subquery), and does the promotion rule change?",
      "Report the worker-weighted MEDIAN wage instead of the mean — why does a single SUM-over-SUM expression not stretch to medians, and which ordering window would you reach for?",
    ],
    related: ["average-selling-price", "queries-quality-and-percentage", "top-travellers"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-third-transaction",
    statement:
      "Payment logs one row per transaction: (tx_id, user_id, amount, paid_at). For each user, report their THIRD transaction in chronological order — earliest paid_at first, and if two of their transactions share a timestamp the smaller tx_id comes first. Users with fewer than three transactions do not appear at all. Output columns user_id, third_amount, third_time — third_time is that transaction's paid_at — ordered by user_id ascending.",
    examples: [
      {
        input: "user 2 pays on five dates — 2024-05-01 (10), 05-02 (20), 05-03 (30), 05-04 (40), 05-05 (50)",
        output: "2 · 30 · 2024-05-03",
        explanation:
          "The third transaction is mid-sequence: 30 on 05-03, with 40 and 50 still to come — a largest-amount or last-row shortcut reports 50.",
      },
      {
        input: "user 4 pays 15 on 2024-05-01, then twice on 2024-05-02 — tx 10 for 35 and tx 12 for 25",
        output: "4 · 25 · 2024-05-02",
        explanation:
          "The shared timestamp is broken by tx_id: tx 10 lands second, tx 12 third. Ordering by tx_id alone would instead make tx 13 (the earliest date, the largest id) the third.",
      },
    ],
    constraints: [
      "one row per user holding three or more transactions — the row is exactly the position-3 one, and users with one or two transactions are absent",
      "chronological order is (paid_at, tx_id): timestamps are broken by id, so the ranking is fully deterministic",
      "columns user_id, third_amount, third_time — ordered by user_id ascending",
    ],
    breakdown: [
      "This is a top-k-per-group request with k = 3, and the engine shape is a window ranking, not an aggregate. ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY paid_at, tx_id) gives every transaction a position inside its user's private timeline, and the outer filter keeps position 3. Aggregates cannot play: a user's third amount is neither a SUM, a MAX, nor any other collapse of their rows — it is a plain column of one specific row, reachable only once the rows are ordered.",
      "The ORDER BY inside OVER needs both keys, and the seed proves why. User 4's second and third payments share the timestamp 2024-05-02, so paid_at alone leaves their order to the engine — the ranking must name tx_id as the tiebreak to be deterministic at all. The reverse shortcut fails too: ordering by tx_id alone ignores dates, and user 4's earliest payment is tx 13, their LARGEST id, so an id-first ranking puts amount 15 from 05-01 in third place. The key is (paid_at, tx_id) — date first, id as tiebreak — and neither ordering of those priorities is interchangeable.",
      "The filter is equality, not a range. WHERE rn = 3 keeps exactly the third transaction; WHERE rn <= 3 keeps the first three, and on this seed it would ship eleven rows — every transaction of users 1, 2 and 4 plus user 3's two — instead of three. And absence needs no code: user 3 holds two transactions, their partition simply has no row numbered 3, so they drop out of the ranked set before any filter runs. Users falling out by construction is the quiet benefit of ranking over joining.",
    ],
    edges: [
      "The timestamp tie sits exactly at the boundary: user 4's tx 10 and tx 12 share 2024-05-02 and straddle positions 2 and 3, so the tx_id tiebreak decides the ANSWER (tx 12, 25) — drop the tiebreak and the pair's order is engine-dependent.",
      "Order by tx_id alone and user 4's third becomes tx 13 — amount 15 on 2024-05-01 — because their earliest payment carries the largest id; date order and id order agree only for users 1 and 2.",
      "rn <= 3 reports eleven rows here (users 1, 2 and 4 in full, plus user 3's two) — the question asks for the third, not the first three.",
      "User 3's two transactions never reach the output: no LAG-of-LAG chain or LEFT JOIN filler is needed — the missing position 3 is filtered by construction.",
    ],
    ladder: [
      { title: "Brute force — sort and index", body: "Pull each user's rows, sort by (date, id), and read the third one in application code, skipping users with fewer than three. The engine expresses the same walk as one window ranking plus a filter." },
      { title: "The pattern — ROW_NUMBER partitioned by user", body: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY paid_at, tx_id) numbers each timeline; keeping rn = 3 selects the third transaction per user." },
      { title: "The optimal idea — rank per partition, filter exact", body: "O(n log n). The durable rules: a k-th-per-group ask is a window ranking, the ranking key must state its tiebreak, and the filter is rn = k exactly — rn <= k answers 'first k', a different report." },
    ],
    approach: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY paid_at, tx_id), keep rn = 3 exactly",
    schema: {
      ddl: `CREATE TABLE Payment (
  tx_id   INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount  INTEGER NOT NULL,
  paid_at TEXT NOT NULL   -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Payment (tx_id, user_id, amount, paid_at) VALUES
  (1, 1, 40, '2024-05-01'),
  (5, 1, 90, '2024-05-02'),   -- user 1 holds exactly three transactions
  (9, 1, 80, '2024-05-03'),
  (2, 2, 10, '2024-05-01'),
  (4, 2, 20, '2024-05-02'),
  (6, 2, 30, '2024-05-03'),
  (7, 2, 40, '2024-05-04'),
  (11, 2, 50, '2024-05-05'),  -- user 2 holds five: the third is mid-sequence
  (3, 3, 70, '2024-05-01'),
  (8, 3, 90, '2024-05-02'),   -- user 3 holds two: absent from the report
  -- user 4: tx 10 and tx 12 share 2024-05-02, and tx 13 is the earliest date
  (13, 4, 15, '2024-05-01'),
  (10, 4, 35, '2024-05-02'),
  (12, 4, 25, '2024-05-02');`,
      tables: [
        { name: "Payment", note: "13 transactions over 4 users — user 1 has 3, user 2 has 5, user 3 has 2, user 4 has 3 (with a shared timestamp at positions 2-3)" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        user_id,
        amount,
        paid_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY paid_at, tx_id      -- date first, tx_id breaks timestamp ties
        ) AS rn
    FROM Payment
)
SELECT
    user_id,
    amount  AS third_amount,
    paid_at AS third_time
FROM ranked
WHERE rn = 3                          -- exactly the third, not the first three
ORDER BY user_id;`,
    walkthrough: [
      "PARTITION BY user_id builds four timelines and ORDER BY paid_at, tx_id sorts each — user 2's five payments run 10 through 50, and user 4's 05-02 pair resolves to tx 10 then tx 12.",
      "Position 3 falls differently per user: user 1's third is tx 9 (80 on 05-03), user 2's is tx 6 (30 on 05-03) with 40 and 50 still ahead, user 4's is tx 12 (25 on 05-02) — the timestamp tie pushed it into the slot.",
      "User 3's timeline ends at position 2, so no row of theirs survives to the filter, and ORDER BY user_id ships three rows: (1, 80, 2024-05-03), (2, 30, 2024-05-03), (4, 25, 2024-05-02).",
    ],
    time: "O(n log n) — one sort per user partition feeding the row numbers",
    space: "O(n) — every transaction carries its rank until the filter",
    followUps: [
      "Report each user's third-LARGEST amount instead of their third transaction — which part of the OVER clause flips, and does the timestamp tiebreak still make sense after the flip?",
      "Report the second-to-last transaction per user beside the last one — how do two ranked copies (or a LAG over the reverse timeline) produce both, and what does a two-transaction user show?",
    ],
    related: ["game-play-analysis-iii", "find-cumulative-salary-of-an-employee", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "top-three-wineries",
    statement:
      "Wine lists wineries as one row each: (winery_id, winery_name, region, rating). Per region, report the wineries that occupy the top two RANKS by rating: rank 1 goes to the region's highest rating, tied wineries share the rank, and a rank skips after a tie — so after a shared second place the next rating is fourth. Output columns region, winery_name, rating, rnk — rnk is the winery's rank inside its region — ordered by region ascending, then rating descending, then winery_name ascending.",
    examples: [
      {
        input: "Mosel holds Weingut Falk at 90, Stern Lay at 85 and Kupfer Grube at 85",
        output: "Mosel · Weingut Falk · 90 · 1 · Mosel · Kupfer Grube · 85 · 2 · Mosel · Stern Lay · 85 · 2",
        explanation:
          "The two 85s share second place and both ship: RANK stamps them both 2 because one winery (the 90) precedes the pair.",
      },
      {
        input: "Rioja holds Bodega Luna at 90, Bodega Sol at 90 and Bodega Mar at 80",
        output: "Rioja · Bodega Luna · 90 · 1 · Rioja · Bodega Sol · 90 · 1",
        explanation:
          "The 90s tie at first — both reported — and Bodega Mar's 80 lands at rank 3, outside the top two, so it is excluded.",
      },
    ],
    constraints: [
      "a region contributes one row per winery whose region-local rank is 1 or 2 — a tie at the boundary reports both wineries, so a region may ship three rows",
      "rank is computed per region as RANK() OVER (PARTITION BY region ORDER BY rating DESC) — ties share the rank, the following rank skips",
      "columns region, winery_name, rating, rnk — ordered by region, then rating descending, then winery_name",
    ],
    breakdown: [
      "'Top two, ties included' is a statement about RANKS, not about rows, and the three ranking functions disagree exactly here. RANK() gives tied ratings the same number and skips the next — 90, 90, 80 becomes 1, 1, 3 — so a cut at rank <= 2 keeps both 90s and drops the 80, which is the rule as stated. ROW_NUMBER() hands out 1, 2, 3 with ties broken arbitrarily: on Mosel it would keep one 85 and discard the other, and the shared second place evaporates. DENSE_RANK() numbers ties without skipping — 90, 90, 80 becomes 1, 1, 2 — so on Rioja the 80 would masquerade as rank 2 and sneak into the report.",
      "So RANK() is not a style choice: it is the only function whose numbering matches the rule 'top two PLACINGS with ties sharing a placing'. The seed is built to punish both alternatives — Mosel's 85/85 pair sits exactly at the second placing, and Rioja's 80 sits exactly where DENSE_RANK would falsely rescue it. The phrase 'ties included' in a spec is the hint that ranking (not row numbering) governs the cut. Whenever a rule says ties share a place, RANK is the function; whenever it says strictly the first k rows, ROW_NUMBER is.",
      "The window must see the whole region before any cutting happens, which is why the rank is computed in one pass and filtered outside. Filtering Wine to high ratings first (say, ratings above the region average) cannot express 'second place' — the second-best rating is another per-region fact that only exists after the region is ranked. And the single-winery region rides free: Douro's lone Quinta Alma gets rank 1 and ships one row, because nothing in the rule demands a region prove it has two wineries. Rules about placings degrade gracefully on small groups only if the cut is on the rank value, never on a row count.",
    ],
    edges: [
      "Mosel's 85/85: ROW_NUMBER() would keep exactly one of Kupfer Grube or Stern Lay — chosen by an arbitrary tiebreak — reporting two rows for the region instead of three.",
      "Rioja's 80: DENSE_RANK() stamps Bodega Mar rank 2 and the wrong query ships it; RANK() stamps it 3 because two wineries outrank it, and the row is excluded.",
      "Douro holds one winery and still reports (Douro, Quinta Alma, 88, 1) — a formulation needing two rows per region (a self-join on second place, a HAVING COUNT(*) >= 2) would erase the region.",
      "The output order must break the ties it reports: the two Rioja 90s share a rating, so winery_name ascending decides — Luna before Sol — and without that key the pair ships in engine-dependent order.",
    ],
    ladder: [
      { title: "Brute force — place each region by hand", body: "Sort each region's wineries by rating, walk down assigning placings with ties sharing a place and the next place skipping, and keep places 1-2. The engine ships this as one ranking window." },
      { title: "The pattern — RANK per region, cut at 2", body: "RANK() OVER (PARTITION BY region ORDER BY rating DESC) numbers placings with shared ranks and gaps; the outer query keeps rnk <= 2." },
      { title: "The optimal idea — ties decide the function, not the filter", body: "O(n log n). The durable rule: 'ties share a place' selects RANK, 'ties broken' selects ROW_NUMBER, 'no gaps after ties' selects DENSE_RANK — the filter expression only encodes whichever numbering the spec named." },
    ],
    approach: "RANK() OVER (PARTITION BY region ORDER BY rating DESC), keep rnk <= 2, order by region, rating DESC, winery_name",
    schema: {
      ddl: `CREATE TABLE Wine (
  winery_id   INTEGER PRIMARY KEY,
  winery_name TEXT NOT NULL,
  region      TEXT NOT NULL,
  rating      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Wine (winery_id, winery_name, region, rating) VALUES
  (1, 'Chateau Lumiere', 'Loire', 90),
  (2, 'Clos Rene', 'Loire', 80),
  (3, 'Weingut Falk', 'Mosel', 90),
  (4, 'Stern Lay', 'Mosel', 85),
  -- Kupfer Grube ties Stern Lay at 85: Mosel's second place is shared
  (5, 'Kupfer Grube', 'Mosel', 85),
  (6, 'Bodega Sol', 'Rioja', 90),
  (7, 'Bodega Luna', 'Rioja', 90),
  -- Bodega Mar at 80 is Rioja's rank 3: excluded by the top-two rule
  (8, 'Bodega Mar', 'Rioja', 80),
  -- Douro holds a single winery and still reports one row
  (9, 'Quinta Alma', 'Douro', 88);`,
      tables: [
        { name: "Wine", note: "9 wineries over 4 regions — Loire 90/80, Mosel 90/85/85 (shared second), Rioja 90/90/80 (shared first), Douro 88 alone" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        region,
        winery_name,
        rating,
        RANK() OVER (
            PARTITION BY region
            ORDER BY rating DESC            -- ties share a rank, the next one skips
        ) AS rnk
    FROM Wine
)
SELECT region, winery_name, rating, rnk
FROM ranked
WHERE rnk <= 2                         -- top two PLACINGS, ties included
ORDER BY region, rating DESC, winery_name;`,
    walkthrough: [
      "The window partitions nine wineries into four regions and ranks each by rating descending: Loire 1, 2; Mosel 1, 2, 2; Rioja 1, 1, 3; Douro 1 — the two 85s share rank 2, and Rioja's 80 skips to 3.",
      "WHERE rnk <= 2 keeps eight of the nine rows and drops exactly one: Bodega Mar, rank 3 behind the tied 90s — Mosel keeps BOTH 85s.",
      "ORDER BY region, rating DESC, winery_name ships eight rows, with the name key splitting every rating tie: Kupfer Grube before Stern Lay, Bodega Luna before Bodega Sol.",
    ],
    time: "O(n log n) — one sort per region feeding the ranks",
    space: "O(n) — every winery carries its rank until the filter",
    followUps: [
      "Report each winery's national rank beside its regional rank — how do two ranking windows over different partitions compose in one SELECT, and what new tie orders appear?",
      "Re-run the cut with DENSE_RANK and diff the two reports — which region grows a row, and what does that tell you about which function the phrase 'top two placings' actually names?",
    ],
    related: ["department-top-three-salaries", "rank-scores", "second-highest-salary"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "top-percentile-fraud",
    statement:
      "Txn records card transactions: (tx_id, state, amount). A transaction is suspicious if its amount sits in the TOP 5 percent of its own state — each row is compared against the rows of the SAME state only. A row's percentile is its percent rank inside the state: the smallest amount scores 0, the largest scores 1, and rows in between share out the scale. Report every transaction whose in-state percent rank is at least 0.95: columns state, tx_id, amount, ordered by state ascending, then amount descending, then tx_id ascending.",
    examples: [
      {
        input: "Oregon holds ten transactions with amounts 100, 90, 80, ..., 10 (each ten lower than the last)",
        output: "Oregon · 21 · 100",
        explanation:
          "With ten rows the percent-rank steps are 1/9: the 90 row scores 8/9 ≈ 0.889 and misses 0.95, while the unique maximum scores 9/9 = 1.",
      },
      {
        input: "Nevada holds twenty transactions with amounts 200, 190, ..., 10",
        output: "Nevada · 1 · 200",
        explanation:
          "Twenty rows give steps of 1/19 ≈ 0.053: the runner-up at 190 scores 18/19 ≈ 0.947 — three thousandths short — so only the maximum clears the bar.",
      },
    ],
    constraints: [
      "percent ranks are computed per state (PARTITION BY state) ordered by amount ascending, so the maximum row of every non-empty state scores exactly 1",
      "the cutoff is >= 0.95 evaluated against the in-state percent rank — a state can report one row, several, or (with a tie at the very top) none",
      "columns state, tx_id, amount — ordered by state, then amount descending, then tx_id",
    ],
    breakdown: [
      "PERCENT_RANK() answers 'how far up the sorted pile does this row sit, scaled from 0 to 1' — precisely (rank minus 1) divided by (rows minus 1), computed over the partition. Ordered by amount ASCENDING, the largest amount lands at rank = rows, so its percent rank is (n-1)/(n-1) = 1 and it always clears 0.95, while the runner-up of an n-row state scores (n-2)/(n-1). The top-5-percent test is therefore a threshold on a scaled rank, and the ORDER BY direction matters: descending order would flip the scale and send you hunting for pr <= 0.05, a formulation that behaves far worse once ties appear.",
      "The partition clause is the entire security model. Fraud is judged WITHIN a state — Nevada's 190 competes against nineteen other Nevada rows and scores 18/19 ≈ 0.947, missing the bar — but pooled across both states it competes against twenty-nine rows and scores 28/29 ≈ 0.966, sailing through. A PERCENT_RANK() OVER (ORDER BY amount) with no PARTITION BY reports exactly this wrong second row on the seed. Forgetting a partition does not error — it silently changes the population every row is measured against.",
      "The boundary is not 'the top 5 percent of the rows', and small partitions are where the difference bites. A 20-row state has steps of 1/19 ≈ 0.053, and 18/19 ≈ 0.947 just misses 0.95 — so exactly one row qualifies, matching the intuition only by luck. From 21 rows up, the runner-up scores 19/20 = 0.95 exactly and two rows qualify; and ties drag the tied pair DOWN, never up — two rows sharing a state's maximum both take rank n-1 and score (n-2)/(n-1), so a two-way tie at the top of a 10-row state would push the maximum itself below the bar and report nothing. The engine semantics, not the percentage phrase, decide the rows.",
    ],
    edges: [
      "Nevada's runner-up (tx 2, amount 190) scores 18/19 ≈ 0.947 — but the unpartitioned version of the query scores it 28/29 ≈ 0.966 against all thirty rows and wrongly reports it: the seed's planted leak.",
      "Oregon's ten rows make steps of 1/9: the 90 row (tx 22) scores 8/9 ≈ 0.889 and misses, while tx 21's 100 scores 1 and ships — the visible boundary.",
      "Tie surprise: were Oregon's tx 22 a second 100, both 100-rows would share rank 9 and score 8/9 ≈ 0.889 — Oregon would report NOTHING, because a tie at the maximum demotes the maximum itself; the pair clears 0.95 only from 21 rows up.",
      "A MAX(amount) per state with a join-back returns one row per state and can see neither thresholds nor ties — here it coincides (both maxima are unique), which is exactly why that bug survives until a tied or thin state appears.",
    ],
    ladder: [
      { title: "Brute force — sort and eyeball", body: "Sort each state's amounts, count rows, and compute each row's (rank-1)/(n-1) by hand against the 0.95 line. The engine computes the same scaled rank as one window function." },
      { title: "The pattern — PERCENT_RANK partitioned by state", body: "PERCENT_RANK() OVER (PARTITION BY state ORDER BY amount) scores every row inside its own state; the outer filter keeps pr >= 0.95." },
      { title: "The optimal idea — thresholds live on scaled ranks, populations live in partitions", body: "O(n log n). The durable rules: a percentile ask is a PERCENT_RANK threshold, the PARTITION BY defines the population being compared against, and the maximum's guaranteed 1.0 is the one row every non-empty partition reports." },
    ],
    approach: "PERCENT_RANK() OVER (PARTITION BY state ORDER BY amount), filter pr >= 0.95",
    schema: {
      ddl: `CREATE TABLE Txn (
  tx_id  INTEGER PRIMARY KEY,
  state  TEXT NOT NULL,
  amount INTEGER NOT NULL
);`,
      seed: `INSERT INTO Txn (tx_id, state, amount) VALUES
  (1, 'Nevada', 200),
  (2, 'Nevada', 190),   -- scores 18/19 within Nevada: just below the bar
  (3, 'Nevada', 180),
  (4, 'Nevada', 170),
  (5, 'Nevada', 160),
  (6, 'Nevada', 150),
  (7, 'Nevada', 140),
  (8, 'Nevada', 130),
  (9, 'Nevada', 120),
  (10, 'Nevada', 110),
  (11, 'Nevada', 100),
  (12, 'Nevada', 90),
  (13, 'Nevada', 80),
  (14, 'Nevada', 70),
  (15, 'Nevada', 60),
  (16, 'Nevada', 50),
  (17, 'Nevada', 40),
  (18, 'Nevada', 30),
  (19, 'Nevada', 20),
  (20, 'Nevada', 10),
  (21, 'Oregon', 100),
  (22, 'Oregon', 90),   -- scores 8/9 within Oregon: the visible miss
  (23, 'Oregon', 80),
  (24, 'Oregon', 70),
  (25, 'Oregon', 60),
  (26, 'Oregon', 50),
  (27, 'Oregon', 40),
  (28, 'Oregon', 30),
  (29, 'Oregon', 20),
  (30, 'Oregon', 10);`,
      tables: [
        { name: "Txn", note: "30 transactions — Nevada 20 rows (200 down to 10 by ten), Oregon 10 rows (100 down to 10 by ten); all amounts distinct" },
      ],
    },
    code: `WITH scored AS (
    SELECT
        tx_id,
        state,
        amount,
        PERCENT_RANK() OVER (
            PARTITION BY state
            ORDER BY amount                 -- ascending: the max row lands at 1.0
        ) AS pr
    FROM Txn
)
SELECT state, tx_id, amount
FROM scored
WHERE pr >= 0.95                        -- the top 5 percent WITHIN the state
ORDER BY state, amount DESC, tx_id;`,
    walkthrough: [
      "PARTITION BY state builds two populations — Nevada's twenty rows and Oregon's ten — and each row is scored only against its own: steps of 1/19 in Nevada, 1/9 in Oregon.",
      "Nevada's maximum (tx 1, 200) scores 19/19 = 1 and ships; its runner-up (tx 2, 190) scores 18/19 ≈ 0.947 and misses by three thousandths. Oregon's tx 21 (100) scores 1 and ships while tx 22 (90) scores 8/9 ≈ 0.889.",
      "ORDER BY state, amount DESC, tx_id ships two rows: (Nevada, 1, 200) then (Oregon, 21, 100) — and the unpartitioned version of the same query would have leaked Nevada's tx 2 as a second row.",
    ],
    time: "O(n log n) — one sort per state partition feeding the percent ranks",
    space: "O(n) — every transaction carries its score until the filter",
    followUps: [
      "Report each state's 95th-percentile threshold value (the smallest amount whose percent rank clears the bar) beside the flagged rows — how does MIN(amount) over the qualifying rows express it, and what does an all-tied state show?",
      "Flag the bottom 5 percent too, in the same query — which comparison flips, and why does the smallest row's guaranteed 0.0 make the low end behave differently from the high end?",
    ],
    related: ["immediate-food-delivery-ii", "rank-scores", "queries-quality-and-percentage"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "employees-project-allocation",
    statement:
      "Two tables hold staffing data. EmployeeSkill lists one row per (employee, skill): (employee_id, skill, experience_years) — an employee may hold many skills, and a skill may in principle be listed more than once. ProjectEmployee lists one row per staffing assignment: (project_id, employee_id, role). For every assignment, report the employee's STRONGEST skill — the skill with the most experience years; if two skills tie on years, the alphabetically smaller skill wins. Output columns project_id, employee_id, role, best_skill, years, one row per assignment, ordered by project_id ascending then employee_id ascending.",
    examples: [
      {
        input: "employee 102, staffed on project 1 as 'builder', holds Go 5 years, Rust 5 years and C 2 years",
        output: "1 · 102 · builder · Go · 5",
        explanation:
          "Go and Rust tie at 5, and the alphabetically smaller skill wins the tie — Rust at 5 never appears despite matching the max.",
      },
      {
        input: "employee 103 is staffed twice — project 1 as 'builder' and project 2 as 'reviewer' — holding SQL 4 (listed twice) and Java 2",
        output: "1 · 103 · builder · SQL · 4 · 2 · 103 · reviewer · SQL · 4",
        explanation:
          "One output row per assignment: the duplicate SQL listing is harmless (both copies say 4), and the same best skill reports under both roles.",
      },
    ],
    constraints: [
      "one output row per ProjectEmployee assignment — an employee with no assignment (however strong) appears nowhere",
      "best_skill is the argmax over experience_years with the alphabetically smallest skill breaking ties, evaluated per (project, employee)",
      "columns project_id, employee_id, role, best_skill, years — ordered by project_id, then employee_id",
    ],
    breakdown: [
      "The unit of work is the assignment, not the employee: employee 103 sits on two projects and must surface twice, once per role, so the driving table is ProjectEmployee and the partition is (project_id, employee_id) — not employee_id alone. Partitioning by project only would paint every member of project 1 with its strongest overall skill (101's Python 6), and the per-person argmax disappears. Partitioning by employee only happens to give the right skill here (skills do not vary by project) but collapses the two assignments into one ranking and drags the role and project output with it. The grain of the output decides both the driving join and the partition key.",
      "The argmax itself is a two-step: MAX(experience_years) per (project, employee), then a join-back to the skill rows that hit the max, then MIN(skill) over those survivors. The MIN is not decoration — it IS the tie rule: Go and Rust both reach 5 for employee 102, and MIN(skill) keeps 'Go'. It also quietly dedupes: employee 103's SQL is listed twice, both copies at 4, so the join-back meets two identical rows and MIN returns the same 'SQL' either way — no DISTINCT panic needed. A window formulation would need an ORDER BY years DESC, skill ASC plus an explicit dedupe, because tied duplicate rows both take rank 1.",
      "Join direction is the exclusion mechanism. Employee 106 holds SQL 5 and Python 5 — strong enough to tie — but appears in no ProjectEmployee row, and the query starts FROM ProjectEmployee, so no group ever forms for them. Building FROM EmployeeSkill instead (then joining assignments) would fabricate a project-less row for 106 or lose the per-assignment grain entirely. Every join in the chain keys back to (project_id, employee_id) so the role rides along from the driving row without ambiguity.",
    ],
    edges: [
      "Employee 102's Go/Rust tie at 5: a formulation without the alphabetical key (an unordered top-1, or 'keep the first row seen') picks between Go and Rust engine-dependently — MIN(skill) pins 'Go'.",
      "Employee 103's SQL is listed twice at 4 years: a RANK() = 1 formulation over the raw rows returns BOTH copies — tied on years and skill — and duplicates the output row; the GROUP BY/MIN shape is immune.",
      "Employee 106 holds SQL 5 and Python 5 but no assignment — a query driven from EmployeeSkill ships a seventh row for them; from ProjectEmployee they cannot appear.",
      "Partitioning by project alone reports 'Python' for all of project 1 — 101's Python 6 — instead of each member's own best: Go for 102, SQL for 103.",
    ],
    ladder: [
      { title: "Brute force — per assignment, scan the person", body: "For each row of ProjectEmployee, pull that employee's skill rows, find the max years, break ties by name, and print. Six manual scans that the engine folds into two grouped passes." },
      { title: "The pattern — max CTE, join-back, MIN over survivors", body: "tops computes MAX(experience_years) per (project, employee); named joins back to the rows AT that max and takes MIN(skill) as the tie rule; the final join restores the role." },
      { title: "The optimal idea — argmax needs a tie policy and the right grain", body: "O(s + a). The durable rules: an argmax over non-unique keys must name its tiebreak (MIN(skill)), duplicate rows make window top-1s leak, and the driving table decides who exists in the output at all." },
    ],
    approach: "MAX years per (project, employee) CTE, join back at the max, MIN(skill) breaks ties, roles from ProjectEmployee",
    schema: {
      ddl: `CREATE TABLE EmployeeSkill (
  employee_id      INTEGER NOT NULL,
  skill            TEXT NOT NULL,
  experience_years INTEGER NOT NULL
);
CREATE TABLE ProjectEmployee (
  project_id  INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  role        TEXT NOT NULL
);`,
      seed: `INSERT INTO EmployeeSkill (employee_id, skill, experience_years) VALUES
  (101, 'Python', 6),   -- clear max over SQL 3 and R 1
  (101, 'SQL', 3),
  (101, 'R', 1),
  (102, 'Go', 5),
  (102, 'Rust', 5),     -- ties Go at 5: the alphabetically smaller skill wins
  (102, 'C', 2),
  (103, 'SQL', 4),
  (103, 'SQL', 4),      -- the same skill listed twice: dedupe must be harmless
  (103, 'Java', 2),
  (104, 'Scala', 7),    -- a single-skill employee
  (105, 'Kotlin', 2),
  (105, 'Python', 9),
  (106, 'SQL', 5),      -- skilled but staffed NOWHERE: excluded by join direction
  (106, 'Python', 5);
INSERT INTO ProjectEmployee (project_id, employee_id, role) VALUES
  (1, 101, 'lead'),
  (1, 102, 'builder'),
  (1, 103, 'builder'),
  (2, 103, 'reviewer'),  -- 103 sits on both projects: the partition is composite
  (2, 104, 'lead'),
  (2, 105, 'builder');`,
      tables: [
        { name: "EmployeeSkill", note: "14 rows over 6 employees — a Go/Rust tie at 5, a duplicated SQL row, a one-skill employee, and a project-less 106" },
        { name: "ProjectEmployee", note: "6 assignments over 2 projects — employee 103 staffed on both" },
      ],
    },
    code: `WITH tops AS (
    SELECT
        pe.project_id,
        pe.employee_id,
        MAX(es.experience_years) AS years   -- the max PER (project, employee)
    FROM ProjectEmployee pe
    JOIN EmployeeSkill es ON es.employee_id = pe.employee_id
    GROUP BY pe.project_id, pe.employee_id
),
named AS (
    SELECT
        t.project_id,
        t.employee_id,
        MIN(es.skill) AS best_skill         -- tie rule: alphabetically smallest
    FROM tops t
    JOIN EmployeeSkill es
      ON es.employee_id = t.employee_id
     AND es.experience_years = t.years      -- only rows AT the max survive
    GROUP BY t.project_id, t.employee_id
)
SELECT
    pe.project_id,
    pe.employee_id,
    pe.role,
    n.best_skill,
    t.years AS years
FROM ProjectEmployee pe
JOIN tops t  ON t.project_id = pe.project_id AND t.employee_id = pe.employee_id
JOIN named n ON n.project_id = pe.project_id AND n.employee_id = pe.employee_id
ORDER BY pe.project_id, pe.employee_id;`,
    walkthrough: [
      "tops groups the six assignments into six (project, employee) partitions and records each person's peak: 101 gives 6, 102 gives 5, 103 gives 4 (once per project), 104 gives 7, 105 gives 9. Employee 106 forms no group.",
      "named joins back to the skill rows AT each peak and takes the alphabetically smallest: 102's survivors are Go and Rust, so 'Go'; 103's survivors are two identical SQL rows, so 'SQL'; the others are single survivors.",
      "The final join restores roles and ORDER BY project, employee ships six rows: (1, 101, lead, Python, 6), (1, 102, builder, Go, 5), (1, 103, builder, SQL, 4), (2, 103, reviewer, SQL, 4), (2, 104, lead, Scala, 7), (2, 105, builder, Python, 9).",
    ],
    time: "O(s + a) — one grouped pass over skill rows plus keyed joins per assignment",
    space: "O(a) — one peak row per assignment",
    followUps: [
      "Report the top TWO skills per assignment, ties included — which CTE grows a RANK and which comparison changes, and how does the duplicated SQL row behave at the boundary?",
      "Include employees with no skills at all (a LEFT JOIN from ProjectEmployee) — what should best_skill and years show, and which aggregate over an empty survivor set produces it?",
    ],
    related: ["project-employees-iii", "project-employees-i", "department-highest-salary"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-candidates-for-data-scientist-position",
    statement:
      "Candidate stores one row per (candidate, skill): (candidate_id, name, years_of_experience, skill) — a candidate appears once per skill they hold. A candidate QUALIFIES for the opening only if they hold BOTH a 'Python' row with more than 2 years AND a 'SQL' row with more than 2 years — two separate rows, each passing its own bar. Report the qualifying candidates: a single column candidate_id, ordered by candidate_id ascending.",
    examples: [
      {
        input: "candidate 4 'Dov' holds Python 3 years, SQL 3 years and R 1 year",
        output: "4",
        explanation:
          "Both Python and SQL clear the more-than-2 bar; the R row is irrelevant to the test and neither helps nor hurts.",
      },
      {
        input: "candidate 3 'Cleo' holds SQL 5 years and Python 2 years",
        output: "(absent — the Python row misses the bar)",
        explanation:
          "The SQL side passes, but 2 years is not MORE than 2: the boundary is strict, and one failing skill disqualifies the candidate regardless of the other.",
      },
    ],
    constraints: [
      "qualification needs BOTH skills over 2 years, each on its own row — a single skill, or either row at or under the bar, never qualifies",
      "the bar is strict: strictly more than 2 years (3 and up qualify, 2 does not)",
      "single column candidate_id, each qualifying candidate exactly once, ordered by candidate_id ascending",
    ],
    breakdown: [
      "The condition is a property of the CANDIDATE, but the evidence lives on scattered ROWS, and that mismatch is the whole problem. A WHERE clause filters rows; 'holds Python over 2 years AND SQL over 2 years' is not true or false of any single row — it is true of a SET of rows. Any honest solution must therefore either test row existence twice (two correlated EXISTS against the same table under different skill predicates) or filter to the two skills, group per candidate, and count DISTINCT skills that passed. Both shapes encode 'all of the above' over rows.",
      "The strictness of the boundary does real work. Cleo's Python row has exactly 2 years, and 'more than 2' excludes it — a >= 2 formulation would qualify her on the strength of a row the spec rejects. The same row-level care applies to the skill filter itself: it must run BEFORE any counting, because a candidate's R row or a 2-year Python row must not inflate a tally that then pretends to be evidence. Cleo again shows why: she holds two rows with a 5-year maximum, so a bare 'at least two rows, max over 2' test passes her although her Python evidence fails the bar.",
      "The EXISTS shape reads directly from the rule: for each candidate row, ask twice whether corroborating rows exist — once for Python over 2, once for SQL over 2 — and the candidate survives only when both answers are yes. Because the outer table holds one row per (candidate, skill), a qualifying candidate's own rows both pass the WHERE and would print twice, so DISTINCT collapses them to one id. The group-by shape — filter to the two skills and the bar, GROUP BY candidate, HAVING COUNT(DISTINCT skill) = 2 — reaches the same ids, and the DISTINCT inside the count is what stops a duplicated skill row from faking the second skill.",
    ],
    edges: [
      "Candidate 3's Python 2 is the boundary: >= 2 qualifies her (wrongly) — the strict > 2 is what keeps the report at candidates 1 and 4.",
      "Candidate 2 holds Python 3 and no SQL row at all: one EXISTS passes and the other fails — a single-skill filter (or one EXISTS alone) reports him, which is the both-skills rule failing softly.",
      "Group by candidate with HAVING COUNT(*) >= 2 AND MAX(years_of_experience) > 2 and no skill filter: candidate 3 passes on raw row count and her SQL-driven max — three ids ship instead of two.",
      "Candidate 4's R row must stay out of the evidence: a HAVING COUNT(DISTINCT skill) = 2 over ALL rows (no skill filter) counts R toward the tally — the WHERE skill IN ('Python', 'SQL') gate is what makes the count mean anything.",
    ],
    ladder: [
      { title: "Brute force — index cards", body: "Sort the rows by candidate, lay out each person's skill cards, and check by hand that a Python card over 2 and a SQL card over 2 both exist. The engine does the same two existence probes per candidate." },
      { title: "The pattern — two EXISTS", body: "For each Candidate row, correlate two EXISTS subqueries on candidate_id — one demanding a Python row over 2 years, one demanding a SQL row over 2 — and keep rows where both hold, deduplicated to ids." },
      { title: "The optimal idea — row-scattered ANDs become double existence or counted distinct", body: "O(r log r). The durable rule: an AND over conditions that live on DIFFERENT rows cannot be a WHERE — it is two EXISTS, or a filtered GROUP BY with COUNT(DISTINCT) equal to the number of required skills." },
    ],
    approach: "two correlated EXISTS (Python > 2 and SQL > 2) per candidate, DISTINCT ids, ordered by id",
    schema: {
      ddl: `CREATE TABLE Candidate (
  candidate_id        INTEGER NOT NULL,
  name                TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  skill               TEXT NOT NULL
);`,
      seed: `INSERT INTO Candidate (candidate_id, name, years_of_experience, skill) VALUES
  (1, 'Ada', 3, 'Python'),
  (1, 'Ada', 4, 'SQL'),
  -- Ada clears both bars. Bram holds Python only. Cleo's Python is exactly 2.
  (2, 'Bram', 3, 'Python'),
  (3, 'Cleo', 5, 'SQL'),
  (3, 'Cleo', 2, 'Python'),
  (4, 'Dov', 3, 'Python'),
  (4, 'Dov', 3, 'SQL'),
  -- Dov's R row is irrelevant to the test: only Python and SQL carry bars
  (4, 'Dov', 1, 'R');`,
      tables: [
        { name: "Candidate", note: "8 rows over 4 candidates — Ada (Python 3, SQL 4), Bram (Python 3 only), Cleo (SQL 5, Python 2), Dov (Python 3, SQL 3, R 1)" },
      ],
    },
    code: `SELECT DISTINCT c.candidate_id        -- one row per skill would print twice
FROM Candidate c
WHERE EXISTS (
        SELECT 1
        FROM Candidate p
        WHERE p.candidate_id = c.candidate_id
          AND p.skill = 'Python'
          AND p.years_of_experience > 2   -- strictly more than 2
      )
  AND EXISTS (
        SELECT 1
        FROM Candidate s
        WHERE s.candidate_id = c.candidate_id
          AND s.skill = 'SQL'
          AND s.years_of_experience > 2
      )
ORDER BY c.candidate_id;`,
    walkthrough: [
      "Candidate 1 (Ada) passes both probes: a Python row at 3 years and a SQL row at 4 years exist, so both of her rows survive the WHERE and DISTINCT folds them into one id.",
      "Candidate 3 (Cleo) fails the first probe — her Python row is 2 years, and 2 is not MORE than 2 — so her strong SQL row never matters. Candidate 2 (Bram) fails the second probe: no SQL row exists at all.",
      "Candidate 4 (Dov) passes both probes (Python 3, SQL 3), his R row carrying no weight, and ORDER BY candidate_id ships two rows: 1, then 4.",
    ],
    time: "O(r log r) with an index on (candidate_id, skill), O(r^2) without — r = Candidate rows",
    space: "O(c) — one id per qualifying candidate",
    followUps: [
      "Add a third requirement — an 'R' row with more than 1 year — how does the EXISTS chain grow, and at what point does the filtered-GROUP BY shape become the more maintainable of the two?",
      "Report each candidate's qualifying skill count beside their id (0, 1 or 2) — how does a conditional COUNT over a grouped scan express it without EXISTS?",
    ],
    related: ["find-interview-candidates", "students-and-examinations", "the-winner-university"],
    order: "exact",
    xp: 10,
  },
];
