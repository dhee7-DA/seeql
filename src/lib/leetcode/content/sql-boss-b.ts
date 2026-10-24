// Deep-dives — the BOSS LEVEL band, file B of B (3 Hard). Original problems:
// a recursive approval chain with a cycle guard, a two-sided reconciliation
// audit, and a cohort-week retention grid. Engine-verified against their own
// seeds by scripts/lc-boss-verify.ts before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS_B: LcSqlDive[] = [
  {
    slug: "approval-chain-audit",
    statement:
      "Employees (emp_id, name, manager_id) forms the approval hierarchy — the CEO's manager_id is NULL — and Tickets (ticket_id, approver_id) assigns each ticket to the employee who approves it first. An approval CHAIN walks from the ticket's approver up through successive managers until it reaches the top of the hierarchy (an employee whose manager_id is NULL); its depth counts every employee in the walk including the approver and the top. Report every ticket: columns ticket_id, chain_depth and top_emp_id — the id of the chain's top employee. The hierarchy may contain a managerial CYCLE (two managers approving each other), so cap the walk at 10 employees deep; a chain cut by the cap reports chain_depth 10 and top_emp_id NULL. Ordered by ticket_id ascending.",
    examples: [
      {
        input: "ticket approved by an employee whose chain is approver → manager → CEO",
        output: "… chain_depth 3 · top_emp_id (the CEO's id) …",
        explanation:
          "The walk adds the approver (depth 1), the manager (2), and the CEO (3) — the CEO is included even though their manager_id is NULL, because they were ADDED as someone's manager.",
      },
      {
        input: "a ticket assigned inside a two-manager cycle (A manages B, B manages A)",
        output: "… chain_depth 10 · top_emp_id NULL …",
        explanation:
          "The walk never reaches a NULL manager, so the depth cap fires at 10 — the NULL top is the audit's cycle flag, not a missing row.",
      },
    ],
    constraints: [
      "one row per ticket: ticket_id, chain_depth, top_emp_id, ordered by ticket_id ascending",
      "chain_depth counts the approver AND every manager up to and including the top (NULL-manager) employee",
      "the walk stops at depth 10; a capped (cyclic) chain reports top_emp_id NULL",
    ],
    breakdown: [
      "WITH RECURSIVE is the only SQL shape that walks a graph of unknown depth, and the anchor/step split maps perfectly onto the chain: the anchor plants every ticket's approver at depth 1, and the step joins the CURRENT chain row's employee to their manager — adding one more (manager, depth+1) per pass. The termination lives in the step's WHERE: e.manager_id IS NOT NULL stops the walk AFTER the top employee has been added (they were added as someone's manager before their own NULL manager is inspected), and c.depth < 10 is the cycle guard that keeps a managerial loop from running forever.",
      "The cycle plant is the lesson's teeth: without the depth cap, a two-manager loop makes the recursive step emit forever — in SQLite the default CTE recursion limit eventually errors, in production engines the query hangs or eats the temp store. The cap converts unbounded recursion into a bounded walk whose overflow is OBSERVABLE: a chain that hits depth 10 is either a genuinely 10-deep hierarchy (rare, and the seed keeps real chains ≤ 4) or a cycle. The audit's contract says which: capped chains report NULL tops, and the report consumer treats NULL as “investigate this org chart“.",
      "The final rollup needs per-ticket aggregation over a variable-length walk: MAX(depth) is the chain length, and top_emp_id is the employee AT that max depth — a pick-the-last-row shape. The window form (MAX OVER PARTITION, then keep the row where depth equals the max) avoids both a correlated subquery inside GROUP BY and a second CTE, and the CASE at the output converts capped chains to NULL in one place. Every layer has one job: walk, pick, present.",
    ],
    edges: [
      "The cycle: managers 6 and 7 point at each other — the step would ping-pong forever, but depth 10 cuts it; the ticket reports (depth 10, NULL top) while the naive no-cap query errors out.",
      "The CEO's own ticket: the approver IS the CEO — the anchor plants depth 1, the step finds manager_id NULL and stops; the chain is exactly (CEO) with top_emp_id = the CEO. One-row chains are legal.",
      "A mid-chain manager whose manager is NULL: the walk adds them as the final row — the “stop after adding“ semantics mean the top employee is IN the count; a WHERE placed differently (checking BEFORE the join) would undercount by one.",
      "Two tickets sharing an approver walk identical chains independently — the anchor is per-ticket by design; deduping walks across tickets is an optimization the engine's recursion memo does not provide.",
    ],
    ladder: [
      { title: "Brute force — fixed self-joins", body: "Join employees to managers four times (max known depth), count rows, hand-check the top. Fails the moment a deeper chain appears and cannot express the cap cleanly." },
      { title: "The pattern — recursive walk with a cap", body: "Anchor plants approvers at depth 1; the step adds manager_id per pass while manager exists and depth < 10; a windowed max picks each chain's top row." },
      { title: "The optimal idea — bounded recursion makes cycles observable", body: "O(t × d) rows for t tickets and max depth d (≤ 10). The durable rule: every recursive CTE over user-writable graphs needs a depth cap — the cap is not defensive styling, it is the cycle detector." },
    ],
    approach: "WITH RECURSIVE anchor (approvers, depth 1) + step (manager joins, manager_id IS NOT NULL, depth < 10) → windowed MAX(depth) per ticket → CASE NULL for capped chains",
    schema: {
      ddl: `CREATE TABLE Employees (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id INTEGER REFERENCES Employees(emp_id)
);

CREATE TABLE Tickets (
  ticket_id   INTEGER PRIMARY KEY,
  approver_id INTEGER NOT NULL REFERENCES Employees(emp_id)
);`,
      seed: `INSERT INTO Employees (emp_id, name, manager_id) VALUES
  (1, 'CEO Ada',    NULL),
  (2, 'VP Ben',     1),
  (3, 'Dir Cara',   2),
  (4, 'Mgr Dan',    3),
  (5, 'Eng Eve',    4),
  (6, 'Lead Fay',   7),   -- cycle: Fay manages...
  (7, 'Lead Gus',   6);   -- ...Gus manages Fay

INSERT INTO Tickets (ticket_id, approver_id) VALUES
  (101, 1),   -- CEO approves own ticket: depth 1, top 1
  (102, 2),   -- VP: depth 2, top 1
  (103, 4),   -- Dan: depth 4, top 1
  (104, 5),   -- Eve: depth 5, top 1
  (105, 6);   -- inside the cycle: capped at depth 10, top NULL`,
      tables: [
        { name: "Employees", note: "7 employees — a 5-level ladder under the CEO plus a two-manager cycle at ids 6/7" },
        { name: "Tickets", note: "5 tickets — chains of depth 1, 2, 3, 4 and one ticket inside the cycle" },
      ],
    },
    code: `WITH RECURSIVE chain AS (
    SELECT
        t.ticket_id,
        t.approver_id AS emp_id,
        1 AS depth
    FROM Tickets t
    UNION ALL
    SELECT
        c.ticket_id,
        e.manager_id,
        c.depth + 1
    FROM chain c
    JOIN Employees e ON e.emp_id = c.emp_id
    WHERE e.manager_id IS NOT NULL
      AND c.depth < 10
),
tops AS (
    SELECT
        ticket_id,
        emp_id,
        depth,
        MAX(depth) OVER (PARTITION BY ticket_id) AS max_depth
    FROM chain
)
SELECT
    ticket_id,
    max_depth AS chain_depth,
    CASE WHEN max_depth >= 10 THEN NULL ELSE emp_id END AS top_emp_id
FROM tops
WHERE depth = max_depth
ORDER BY ticket_id ASC;`,
    walkthrough: [
      "The anchor plants five rows (one per ticket, depth 1). The step iterates: ticket 101's chain is just the CEO (their manager is NULL, the step never fires); 102's chain is VP(1) then Ada(2); 104's chain grows Eve(1) → Dan(2) → Cara(3) → Ben(4) → Ada(5).",
      "Ticket 105 walks Fay → Gus → Fay → … — the step would alternate forever, but at depth 10 the guard fires and the chain stops at 10 rows with no NULL-manager top inside.",
      "The tops layer marks each chain's deepest row; the output keeps exactly those: (101, 1, 1), (102, 2, 1), (103, 4, 1), (104, 5, 1), (105, 10, NULL) — the cycle surfaces as the NULL top, depth 10.",
    ],
    time: "O(t × d) chain rows for t tickets and max depth d, capped at 10; the window pass is linear in those rows",
    space: "O(t × d) — one row per (ticket, chain member)",
    followUps: [
      "Flag the cyclic TICKETS explicitly with a boolean column instead of a NULL top — how does the CASE change, and why is depth 10 the only cycle signal the walk exposes?",
      "Count approvals each employee owes across all ticket chains — which layer aggregates, and why does the anchor+step shape make every mid-chain employee appear once per ticket they serve?",
    ],
    related: ["find-cities-in-each-state", "streak-week-bonus-ladder", "loan-amortization-schedule"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "summary-drift-audit",
    statement:
      "An upstream job pre-aggregates daily sales into a summary table. Sales (sale_id, store_id, day, amount_cents) is the ground truth — one row per sale; Summary (entry_id, store_id, day, total_cents) should hold exactly one row per (store, day) whose total_cents equals the facts' sum. The job has drifted in three ways: some days summed WRONG, some fact days never made it to the summary, and some summary rows reference days with no facts at all. Report EVERY discrepancy: columns store_id, day, fact_total (the facts' sum — NULL for orphan summary rows), summary_total (the summary's value — NULL for missing days), and kind ('missing' when facts exist but no summary row, 'orphan' when a summary row has no facts, 'drift' when both exist and differ), ordered by day ascending then store_id ascending. Matching rows are absent from the output.",
    examples: [
      {
        input: "store 1 on Mar 2 has facts summing 500 but the summary says 450",
        output: "1 · '2025-03-02' · 500 · 450 · 'drift'",
        explanation:
          "Both sides exist and disagree — the classic drift. Either value alone would have been a missing/orphan; the pair is a sum error.",
      },
      {
        input: "the summary has a row for store 2 on Mar 5, but no facts exist that day",
        output: "2 · '2025-03-05' · NULL · 120 · 'orphan'",
        explanation:
          "Only the right side exists — the summary invented a day. fact_total is NULL because there is nothing to sum.",
      },
    ],
    constraints: [
      "one row per discrepancy: store_id, day, fact_total, summary_total, kind",
      "kind: 'missing' (no summary row), 'orphan' (no facts), 'drift' (both, unequal) — matching pairs never appear",
      "ordered by day ascending, then store_id ascending",
    ],
    breakdown: [
      "Reconciliation is a two-sided preservation problem, and SQL's join vocabulary is one-sided by default: LEFT JOIN preserves the LEFT population only. The standard emulation of FULL OUTER JOIN is a UNION ALL of the two directed LEFT JOINs — facts LEFT JOIN summary (which sees facts-only rows and matched rows) plus summary LEFT JOIN facts WHERE the match IS NULL (which sees summary-only rows). The anti-join guard on the second arm is what prevents matched pairs from appearing twice; forget it and every matching day doubles.",
      "The kind classification falls out of the NULL pattern each arm produces: fact_total NULL means the row came from the summary-only arm (orphan), summary_total NULL means facts-only (missing), both present with unequal sums is the drift case. The CASE reads the NULLs — which is why the two arms must project IDENTICAL column shapes with NULL in the absent side's slot: the UNION ALL is shape-locked, and the classification is just pattern-matching on which slot is empty.",
      "Grain discipline runs the whole audit: both tables fold to (store_id, day) BEFORE any comparison, because a summary drift could hide inside multiple summary rows for one day (the seed plants a doubled row) and multi-sale days sum on the fact side. SUM in both staging CTEs, then compare the folded values — comparing raw rows would report structural noise (row counts) instead of value drift. The final ORDER BY (day, store_id) makes the discrepancy list a checklist someone can work top to bottom.",
    ],
    edges: [
      "The doubled summary row: store 3 on Mar 3 has TWO summary entries (200 + 200) against facts of 200 — the summary-side SUM folds them to 400 before comparing, surfacing 'drift' rather than two phantom mismatches.",
      "The missing day: facts exist for store 2 on Mar 4 but no summary row — the first arm's LEFT JOIN pads summary_total NULL, kind 'missing'; an INNER join would have silently swallowed exactly the row the audit exists to find.",
      "The orphan: a summary row for a day with zero facts — the second arm's anti-join catches it; its fact_total is NULL, and treating NULL as 0 to force a 'drift' classification would blur the two failure modes the report distinguishes.",
      "Matching days stay silent: 6 of the seed's 10 (store, day) pairs reconcile — the output holds ONLY disagreements. A report that lists matching rows too is a diff, not an audit; the WHERE on the outer query is the deliverable.",
    ],
    ladder: [
      { title: "Brute force — three separate queries", body: "One query per failure mode (NOT EXISTS ×2, then a join for unequal sums) glued with UNION. Correct, but the shared staging is written three times and the kinds drift apart on edits." },
      { title: "The pattern — two LEFT arms in a UNION ALL", body: "Stage both sides at (store, day) grain in CTEs; arm one preserves facts, arm two preserves summary via anti-join; one CASE classifies from the NULL pattern." },
      { title: "The optimal idea — reconciliation needs BOTH populations", body: "O(f + s) after the folds. The durable rule: an audit that can name which SIDE failed must see both sides' unmatched rows — the two-arm UNION ALL is FULL OUTER JOIN's portable, readable form." },
    ],
    approach: "Fold both tables to (store_id, day) sums in CTEs; facts LEFT JOIN summary UNION ALL summary LEFT JOIN facts WHERE NULL; classify kind by which total is NULL; filter to disagreements",
    schema: {
      ddl: `CREATE TABLE Sales (
  sale_id      INTEGER PRIMARY KEY,
  store_id     INTEGER NOT NULL,
  day          TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);

CREATE TABLE Summary (
  entry_id    INTEGER PRIMARY KEY,
  store_id    INTEGER NOT NULL,
  day         TEXT NOT NULL,
  total_cents INTEGER NOT NULL
);`,
      seed: `INSERT INTO Sales (sale_id, store_id, day, amount_cents) VALUES
  (1, 1, '2025-03-01', 100), (2, 1, '2025-03-01', 250),
  (3, 2, '2025-03-01', 90),
  (4, 1, '2025-03-02', 500),
  (5, 2, '2025-03-03', 120), (6, 2, '2025-03-03', 80),
  (7, 3, '2025-03-03', 200),
  (8, 2, '2025-03-04', 340);   -- no summary row: 'missing'

INSERT INTO Summary (entry_id, store_id, day, total_cents) VALUES
  (1, 1, '2025-03-01', 350),                -- matches (100 + 250)
  (2, 2, '2025-03-01', 90),                 -- matches
  (3, 1, '2025-03-02', 450),                -- WRONG: facts say 500 -> 'drift'
  (4, 3, '2025-03-03', 200), (5, 3, '2025-03-03', 200),  -- doubled rows: SUM 400 vs 200
  (6, 2, '2025-03-05', 120);                -- no facts: 'orphan'`,
      tables: [
        { name: "Sales", note: "8 facts over 3 stores and 5 days — the ground truth" },
        { name: "Summary", note: "6 entries — two match, one drifted low, one day doubled, one orphan day" },
      ],
    },
    code: `WITH f AS (
    SELECT store_id, day, SUM(amount_cents) AS fact_total
    FROM Sales
    GROUP BY store_id, day
),
s AS (
    SELECT store_id, day, SUM(total_cents) AS summary_total
    FROM Summary
    GROUP BY store_id, day
),
joined AS (
    SELECT f.store_id, f.day, f.fact_total, s.summary_total
    FROM f LEFT JOIN s ON s.store_id = f.store_id AND s.day = f.day
    UNION ALL
    SELECT s.store_id, s.day, NULL, s.summary_total
    FROM s LEFT JOIN f ON f.store_id = s.store_id AND f.day = s.day
    WHERE f.store_id IS NULL
)
SELECT
    store_id,
    day,
    fact_total,
    summary_total,
    CASE WHEN fact_total IS NULL THEN 'orphan'
         WHEN summary_total IS NULL THEN 'missing'
         ELSE 'drift' END AS kind
FROM joined
WHERE fact_total IS NULL
   OR summary_total IS NULL
   OR fact_total <> summary_total
ORDER BY day ASC, store_id ASC;`,
    walkthrough: [
      "The folds: f holds five (store, day) sums — (1, Mar 1) 350, (2, Mar 1) 90, (1, Mar 2) 500, (2, Mar 3) 200, (3, Mar 3) 200, (2, Mar 4) 340 — six actually; s holds five — (1, Mar 1) 350, (2, Mar 1) 90, (1, Mar 2) 450, (3, Mar 3) 400 (the doubled rows folded), (2, Mar 5) 120.",
      "Arm one preserves all six fact days: Mar 1 both stores match, Mar 2 surfaces (500 vs 450), Mar 3 both stores surface against wrong-or-absent summaries, Mar 4 surfaces with NULL summary. Arm two adds the orphan (2, Mar 5) — its anti-join guard skips every day arm one already carried.",
      "The classifier labels them: (1, Mar 2) drift, (2, Mar 3) missing (its summary row simply doesn't exist), (3, Mar 3) drift (200 vs 400), (2, Mar 4) missing, (2, Mar 5) orphan — five rows ordered by day then store. The two matching Mar 1 rows never appear.",
    ],
    time: "O(f log f + s log s) for the fold sorts; the joins are hash-shaped and linear after",
    space: "O(f + s) — one folded row per (store, day) on each side",
    followUps: [
      "Add a 'doubled' kind that names summary rows collapsed by the fold — what extra signal does the raw row count carry that the folded SUM destroys?",
      "Produce a per-store discrepancy count alongside the detail — which layer rolls up, and why must the detail and the rollup come from the same classified set?",
    ],
    related: ["reconciliation-vs-ledger", "ledger-reconciliation", "trial-balance-check"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "cohort-week-retention-grid",
    statement:
      "Activity (event_id, user_id, active_on — a date) logs one row per active day per user. A user's COHORT is the month of their first activity. For each cohort, compute weekly retention over the following four weeks: week w covers days [first_on + 7w, first_on + 7w + 6], and a cohort member is retained in week w when they have any activity inside that window. Report one row per cohort with at least 3 users: columns cohort_month ('YYYY-MM' of the first activity), users (cohort size), and w0, w1, w2, w3 — the percentage of the cohort active in each week, rounded to 1 decimal (w0 is always 100.0 by definition; a week with no active members reads 0.0). Ordered by cohort_month ascending.",
    examples: [
      {
        input: "a user first active Jan 3, active again Jan 20",
        output: "… contributes to w2 of the 2025-01 cohort …",
        explanation:
          "Jan 20 is 17 days after Jan 3 — 17/7 = 2 in integer division, so the second week window; the same user can appear in several weeks' counts.",
      },
      {
        input: "a cohort of exactly 2 users",
        output: "… absent from the grid …",
        explanation:
          "The ≥ 3-user gate drops small cohorts BEFORE percentages compute — a 50% cell on n = 2 is noise the report refuses to print.",
      },
    ],
    constraints: [
      "one row per cohort with ≥ 3 users: cohort_month, users, w0, w1, w2, w3",
      "week windows are [first_on + 7w, first_on + 7w + 6] per user — cohorts are anchored to the USER's first day, not the month's first",
      "percentages ROUND to 1 decimal; empty weeks read 0.0; ordered by cohort_month ascending",
    ],
    breakdown: [
      "Two definitions anchor everything: the cohort is the MONTH of each user's first activity (MIN(active_on) per user — the anchor CTE), and the week index is the integer division of the day gap: CAST((julianday(active_on) − julianday(first_on)) / 7 AS INTEGER). Both live in one staging CTE that joins every activity back to its user's first day — the join is what turns an event log into a (cohort, week-offset) stream. The per-user anchor matters: a user first active Jan 29 is a January cohort whose week 1 opens Feb 5, not a February one — month-start anchoring is the classic cohort bug.",
      "The grid is a conditional pivot: count DISTINCT users per (cohort, week) for weeks 0–3, then four MAX(CASE WHEN wk = k THEN act END) columns stand the long form up. COALESCE wraps each column because a week with zero active members produces NO row in the flags stage — the LEFT JOIN from cohorts to flags pads NULL, and NULL is a hole in a percentage grid, not a 0. The filter wk BETWEEN 0 AND 3 in the flags stage keeps later activity from inflating the stage before the pivot sees it.",
      "The size gate is a separate stage and must be: cohorts are sized by COUNT(DISTINCT user_id) at the COHORT grain, and the ≥ 3 filter has to run before the percentage division — a percentage over an unfiltered size multiplies noise. The join from sizes to flags is cohort-to-cohort (many flags per cohort), so the outer SELECT groups again by (cohort, size) and divides each week's count by the size — ROUND(100.0 * act / users, 1). The 100.0 multiplier before division (not after) is the integer-division guard: 100 * 1 / 3 in integers reads 0.",
    ],
    edges: [
      "The per-user anchor: user 9 first active Jan 29 — their week 1 starts Feb 5; anchoring weeks to the MONTH's start would misfile their week-1 activity into a different offset and shift the whole row.",
      "The n = 2 cohort: planted with exactly two users and decent activity — the HAVING gate drops it; a report without the gate prints confident-looking percentages on a sample too small to mean anything.",
      "An empty week: no member of the Feb cohort is active in its week 3 — the flags stage has no row, the LEFT JOIN pads NULL, and COALESCE turns it into 0.0; a bare MAX would print NULL in a column the contract promises is a percentage.",
      "The boundary day: activity exactly 28 days after first_on lands in week 4 (28/7 = 4) and must NOT leak into w3 — the BETWEEN 0 AND 3 filter runs BEFORE the pivot; filtering after the MAX would need a WHERE on four columns.",
    ],
    ladder: [
      { title: "Brute force — four separate counts", body: "One query per week computing its window with date arithmetic on first_on; UNION the four. Correct, quadruplicated anchor logic, four chances to drift." },
      { title: "The pattern — stage, flag, pivot", body: "Anchor CTE (firsts), staging CTE (cohort + week index), flags CTE (counts per cohort-week), then the four-column conditional pivot with COALESCE and the size gate." },
      { title: "The optimal idea — cohort analysis is staging, not syntax", body: "O(a log a) for the staging sort. The durable rule: every cohort grid is (anchor → offset-index → flag → pivot), and the two failure modes — month-anchored weeks and unpivoted NULLs — live in the offset and the COALESCE respectively." },
    ],
    approach: "MIN(first_on) anchor per user → staging join with week index → COUNT(DISTINCT) per (cohort, week) for wks 0–3 → size gate ≥ 3 → four MAX(CASE) pivot columns with COALESCE 0",
    schema: {
      ddl: `CREATE TABLE Activity (
  event_id  INTEGER PRIMARY KEY,
  user_id   INTEGER NOT NULL,
  active_on TEXT NOT NULL
);`,
      seed: `INSERT INTO Activity (event_id, user_id, active_on) VALUES
  -- 2025-01 cohort: users 1, 2, 3 (n = 3)
  (1, 1, '2025-01-03'), (2, 1, '2025-01-06'), (3, 1, '2025-01-20'),  -- u1: w0, w0, w2
  (4, 2, '2025-01-05'), (5, 2, '2025-01-12'), (6, 2, '2025-01-19'),  -- u2: w0, w1, w2
  (7, 3, '2025-01-07'), (8, 3, '2025-02-01'),                        -- u3: w0, w3
  -- 2025-02 cohort: users 4, 5, 6 (n = 3)
  (9, 4, '2025-02-02'), (10, 4, '2025-02-09'), (11, 4, '2025-02-16'), -- u4: w0, w1, w2
  (12, 5, '2025-02-03'), (13, 5, '2025-02-05'),                       -- u5: w0 only
  (14, 6, '2025-02-04'), (15, 6, '2025-02-24'),                       -- u6: w0, w2 boundary day 20 -> w2
  -- 2025-03 cohort: users 7, 8 (n = 2) -- dropped by the size gate
  (16, 7, '2025-03-06'), (17, 7, '2025-03-13'),
  (18, 8, '2025-03-07'), (19, 8, '2025-03-14');`,
      tables: [
        { name: "Activity", note: "19 events over 8 users — two 3-user cohorts and one 2-user MARCH cohort the gate must drop; user 6's boundary day lands on week 2 exactly" },
      ],
    },
    code: `WITH firsts AS (
    SELECT user_id, MIN(active_on) AS first_on
    FROM Activity
    GROUP BY user_id
),
base AS (
    SELECT
        SUBSTR(f.first_on, 1, 7) AS cohort_month,
        a.user_id,
        CAST((julianday(a.active_on) - julianday(f.first_on)) / 7 AS INTEGER) AS wk
    FROM firsts f
    JOIN Activity a ON a.user_id = f.user_id
),
sizes AS (
    SELECT cohort_month, COUNT(DISTINCT user_id) AS users
    FROM base
    GROUP BY cohort_month
    HAVING COUNT(DISTINCT user_id) >= 3
),
flags AS (
    SELECT cohort_month, wk, COUNT(DISTINCT user_id) AS act
    FROM base
    WHERE wk BETWEEN 0 AND 3
    GROUP BY cohort_month, wk
)
SELECT
    s.cohort_month,
    s.users,
    ROUND(100.0 * COALESCE(MAX(CASE WHEN f.wk = 0 THEN f.act END), 0) / s.users, 1) AS w0,
    ROUND(100.0 * COALESCE(MAX(CASE WHEN f.wk = 1 THEN f.act END), 0) / s.users, 1) AS w1,
    ROUND(100.0 * COALESCE(MAX(CASE WHEN f.wk = 2 THEN f.act END), 0) / s.users, 1) AS w2,
    ROUND(100.0 * COALESCE(MAX(CASE WHEN f.wk = 3 THEN f.act END), 0) / s.users, 1) AS w3
FROM sizes s
LEFT JOIN flags f ON f.cohort_month = s.cohort_month
GROUP BY s.cohort_month, s.users
ORDER BY s.cohort_month ASC;`,
    walkthrough: [
      "The anchor finds three firsts in January (users 1–3), three in February (users 4–6), and two in March (users 7–8). Staging joins all 19 events to their user's first day and indexes weeks: user 1's Jan 20 lands at week 2 (17 days), user 6's Feb 24 at week 2 (20 days), user 3's Feb 1 at week 3 (25 days).",
      "Flags count per (cohort, week): January holds w0 ×3, w1 ×1 (user 2's Jan 12), w2 ×2 (users 1, 2), w3 ×1 (user 3); February holds w0 ×3, w1 ×1 (user 4), w2 ×2 (users 4, 6), w3 ×0. The size gate admits both 3-user cohorts and drops the planted 2-user March pair.",
      "The pivot divides by size: January reads (100.0, 33.3, 66.7, 33.3); February reads (100.0, 33.3, 66.7, 0.0) — the empty week 3 surfacing as 0.0 through the COALESCE, not NULL.",
    ],
    time: "O(a log a) — the staging join's sort dominates; flags and pivot are linear",
    space: "O(a) — one staged row per activity in the base CTE",
    followUps: [
      "Extend the grid to week 4 — which constant changes and why does the flags filter need to move with it?",
      "Add a column for users retained in ALL of weeks 0–3 — why can't a per-week flag answer it, and what per-user aggregation does the staging CTE need?",
    ],
    related: ["cohort-retention-matrix", "dau-wau-stickiness", "funnel-step-conversion"],
    order: "exact",
    xp: 35,
  },
];
