// Deep-dives — premium SQL batch 9, file 4 of 6: org hierarchies, trapped
// water and permission bits (3 problems: 2 Hard, 1 Medium). Engine-verified
// by a bun:sqlite self-check (scripts/tmp-69b4a-check.ts). Re-authored from
// the canonical premium tasks: own tables, own seeds, original phrasing —
// never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_GRAPH: LcSqlDive[] = [
  {
    slug: "ceo-subordinate-hierarchy",
    statement:
      "Employee records a company roster as one row per person (emp_id, name, manager_id). Every employee except the chief executive reports to exactly one manager named in manager_id; the chief executive is the one employee whose manager_id is NULL. Depth is counted in people: the chief executive sits at level 1, their direct reports at level 2, the reports of those reports at level 3, and so on down the tree. Report EVERY employee with their distance from the top — columns emp_id, name, level — one row per person, ordered by level ascending, then emp_id ascending.",
    examples: [
      {
        input: "employee 1 (Nadia) is the only employee with manager_id NULL — nobody stands above her",
        output: "1 · Nadia · 1",
        explanation:
          "The anchor of the recursion is exactly this row: with no manager there is nothing to join on, so the chief executive seeds level 1 by definition.",
      },
      {
        input:
          "employee 6 (Dana) reports to employee 5 (Omar), who reports to the chief executive — and Dana's row is written into the seed before Omar's",
        output: "6 · Dana · 3",
        explanation:
          "Two hops from the anchor put Dana at level 3; the fixpoint re-scans the table every round, so a row written ahead of its manager is still placed correctly.",
      },
    ],
    constraints: [
      "every employee in Employee appears exactly once in the report; the chief executive is the unique row with manager_id NULL",
      "level counts managers on the path to the top plus one: the chief executive is 1, a direct report 2 — employee 4, three hops below the top through employee 3, is level 4",
      "columns emp_id, name, level — ordered by level ascending, then emp_id ascending",
    ],
    breakdown: [
      "Counting depth in a tree is not one join away, because the number of hops differs row by row. One self-join reaches level 2, two reach level 3 — and a query that hardcodes k self-joins only answers a k-deep company, silently dropping everyone deeper the moment the org grows. No aggregate fixes this either: a manager's level is not a SUM or COUNT over their reports, it is a property of the path from the top. The data itself is recursive — each row is defined relative to another row of the same table — so the natural engine is a query that repeats until nothing new appears.",
      "WITH RECURSIVE needs an anchor the step can never discover on its own, and that anchor is the row nobody points at: manager_id IS NULL. The probe must be IS NULL — manager_id = NULL is unknown for every row under three-valued logic, so the anchor would find nothing and starve the whole recursion. The step then joins Employee to the rows already placed and stamps each newcomer one level deeper. Each round the queue grows by exactly the next tier of the org chart, and when a round adds no rows the fixpoint is reached and the recursion stops.",
      "Insertion order plays no role, and the plant proves it: employee 6 (Dana) names manager 5 in a row written before Omar exists, yet the recursion still places her at level 3, because every round re-scans the whole table for children of whatever is already placed. A procedural top-down walk that reads rows in file order is what this punishes — it meets Dana before Omar and loses her. Termination is safe because the seed is a tree, each row carrying at most one manager and no cycles; a corrupt table where someone is their own manager would loop forever without a guard. The result-level ORDER BY level, emp_id is the reporting contract — an ORDER BY inside the CTE would neither survive nor make the outer output ordered.",
    ],
    edges: [
      "Writing the anchor as WHERE manager_id = NULL starves everything: = NULL is unknown for every row, the anchor returns zero rows, and the report ships empty — only IS NULL finds Nadia (employee 1).",
      "Seeding the anchor at level 0 shifts the whole report down: Nadia reads 0 and Elif reads 3, an off-by-one visible in every row — the spec counts people on the path, so the anchor is level 1.",
      "The plant is the row (6, 'Dana', 5), written before Omar's row: a procedural reader that walks the seed top-down meets Dana with no placed parent, while the recursive step re-scans Employee each round and pairs her with Omar whenever he appears — insertion order never enters the math.",
      "Ordering bites at level 2: Omar (5) is inserted before Boris (2), yet level, emp_id ships (2, 'Boris') first — dropping the emp_id tiebreak leaves the two level-2 rows in engine scan order, which on this seed is the reverse.",
    ],
    ladder: [
      { title: "Brute force — one self-join per level", body: "Join Employee to itself once for level 2, twice for level 3, k times for level k, then UNION the pieces. It answers only the depth you thought to write, and a deeper org silently loses rows." },
      { title: "The pattern — anchor plus step, repeated", body: "WITH RECURSIVE pairs a seed query (the row nobody points at) with a step query (children of already-placed rows); the engine alternates them until a round adds nothing." },
      { title: "The optimal idea — fixpoint equals breadth-first from the top", body: "O(n · d) for n employees at depth d. The transferable rule: any per-row depth, path or ancestor report over a self-referencing table is a queue-driven fixpoint from a NULL-manager anchor, and the recursion cannot start anywhere else." },
    ],
    approach: "WITH RECURSIVE anchored on manager_id IS NULL, each step joining children of already-placed rows at level + 1, ordered by level then emp_id",
    schema: {
      ddl: `CREATE TABLE Employee (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id INTEGER                  -- NULL for exactly one row: the chief executive
);`,
      seed: `INSERT INTO Employee (emp_id, name, manager_id) VALUES
  (1, 'Nadia', NULL),  -- the anchor the recursion must find
  (6, 'Dana', 5),      -- PLANT: names manager 5 before that row is inserted
  (5, 'Omar', 1),      -- level 2
  (2, 'Boris', 1),     -- level 2, LOWER emp_id than Omar: the ordering bite
  (7, 'Priya', 5),     -- level 3
  (3, 'Chen', 2),      -- level 3
  -- level 4, the deepest tier
  (4, 'Elif', 3);`,
      tables: [
        { name: "Employee", note: "7 employees over 4 levels — Nadia (1) is the NULL-manager anchor; Dana (6) names manager 5 before Omar is inserted" },
      ],
    },
    code: `WITH RECURSIVE chain AS (
    SELECT emp_id, name, 1 AS level          -- anchor: the row no other row points at
    FROM Employee
    WHERE manager_id IS NULL                 -- = NULL never matches — IS NULL is the only probe
    UNION ALL
    SELECT e.emp_id, e.name, c.level + 1     -- step: children of placed rows sit one deeper
    FROM Employee e
    JOIN chain c ON e.manager_id = c.emp_id
)
SELECT emp_id, name, level
FROM chain
ORDER BY level, emp_id;`,
    walkthrough: [
      "The anchor finds exactly one IS NULL row — Nadia, employee 1 — and seeds her at level 1; a manager_id = NULL probe would have found nothing.",
      "Round one places Omar (5) and Boris (2) at level 2; round two places Priya (7) and Dana (6) under Omar plus Chen (3) under Boris at level 3 — Dana's row was written before Omar's, and the re-scan pairs them anyway; round three places Elif (4) under Chen at level 4, and the next round adds nothing.",
      "ORDER BY level, emp_id ships seven rows in people order: (1, 'Nadia', 1), then (2, 'Boris', 2) before (5, 'Omar', 2), then (3, 'Chen', 3), (6, 'Dana', 3), (7, 'Priya', 3), and finally (4, 'Elif', 4).",
    ],
    time: "O(n · d) — one scan of Employee per tier until the tree bottoms out",
    space: "O(n) — every employee enters the recursion queue exactly once",
    followUps: [
      "Attach each employee's full management chain as a path string — where must the anchor seed it, and why does the step's concatenation never need a terminal row?",
      "Guard the recursion against a corrupt table where someone is their own manager — what stop condition (a depth cap, or a visited check inside the step) bounds the fixpoint, and which single seed edit triggers the loop?",
    ],
    related: ["the-number-of-employees-which-report-to-each-employee", "employees-whose-manager-left-the-company", "all-people-report-to-the-given-manager"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "calculate-trapping-rain-water",
    statement:
      "Terrain records an elevation profile as one row per position (position, height); positions are contiguous 1..N and heights are non-negative. Rain pools in the depressions: the water resting above a position is the height of the LOWER of its two banks — the tallest terrain at-or-left of it and the tallest terrain at-or-right of it, both inclusive of the position itself — minus its own height, floored at 0. Report every position that holds strictly positive water: columns position, water, ordered by position ascending.",
    examples: [
      {
        input: "positions 1-5 hold heights 3, 0, 2, 0, 4 — a bowl between the wall at position 1 and the 5-high crest at position 6",
        output: "position 2 holds 3 · position 3 holds 1 · position 4 holds 3",
        explanation:
          "Position 2's banks are 3 (at-or-left) and 5 (at-or-right, the crest) — the lower bank 3 minus floor 0 pools 3; position 3 holds 3 - 2 = 1 and position 4 pools 3.",
      },
      {
        input: "positions 10-13 hold heights 1, 3, 3, 1 in the shadow of the 5-high crest at position 6",
        output: "10 · 2",
        explanation:
          "The lower bank of position 10 is the 3-plateau at positions 11-12, so 3 - 1 = 2; the plateau tops sit AT the bank and hold nothing, so they are absent.",
      },
    ],
    constraints: [
      "water above a position is the lower of its two banks — max height at-or-left inclusive and max height at-or-right inclusive — minus its own height, never reported below 0",
      "only positions holding strictly positive water appear; every dry position (water 0) is absent",
      "columns position, water — ordered by position ascending",
    ],
    breakdown: [
      "Each position's answer depends on two contexts its own row cannot see: the tallest terrain anywhere at-or-left and the tallest anywhere at-or-right. That is a prefix maximum and a suffix maximum — the classic two-sweep shape — and in SQL each sweep is one window MAX with an unbounded frame. A GROUP BY cannot help, because the report keeps every row rather than collapsing them; a correlated subquery can compute each bank but rescans the table twice per position. The window form walks the ordered rows once per side and stamps every row with its running answer.",
      "Both frames are inclusive of the current row — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW on the left, ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING on the right — and that inclusion is load-bearing: the position's own height sits inside both banks, so the lower bank can never fall below the floor and the raw difference is provably non-negative. Excluding the row silently rewrites the geometry: at the 5-high crest (position 6) both exclusive banks drop to 4 and the raw difference prints -1, while at the two edge positions one bank disappears entirely and prints NULL. ROWS is spelled out rather than trusting the default RANGE — with ORDER BY position the two coincide only because position is unique, and the explicit frame is what documents the intent.",
      "The 0-clamp in the flood CTE makes the formula total even under reformulations where a bank can slip below the floor — with inclusive frames on this seed it never fires, but swap either window to exclude the current row and unclamped rows like (6, -1) leak into a full-terrain report. The outer WHERE water > 0 is the report's contract: exactly five pool rows ship and the eight dry positions are absent, including the plateau tops at positions 11 and 12 that sit at their own bank. The honest surprise is position 9: the descending slope 5, 4, 3, 2 is dry in isolation, but the later 3-plateau raises its right bank to 3, pooling 1 — hand-assumed geometry loses to the two-bank formula every time.",
    ],
    edges: [
      "Exclude the current row from either frame and the crest lies: position 6 (height 5) reads exclusive banks 4 and 4 and prints -1, position 12 prints -2 (left bank 5 against an exclusive right bank of 1), and positions 1 and 13 lose one bank entirely and print NULL — inclusion keeps the floor inside both maxes.",
      "The CASE clamp never fires on this seed with inclusive frames (the raw difference is provably non-negative), but it is what keeps the query total: unclamped plus one exclusive frame grows a full-terrain report rows like (6, -1) and (12, -2) instead of dry zeros.",
      "Eight of the thirteen positions are dry — 1, 5, 6, 7, 8, 11, 12, 13 — and every one sits at or above its lower bank: WHERE water > 0 keeps exactly five rows, while a >= 0 comparison would print eight junk rows.",
      "Position 9 (height 2) pools 1 because the plateau 3s at positions 11-12 raise its right bank — a hand rule that dismisses descending slopes as dry drops the row (9, 1) that the formula correctly ships.",
    ],
    ladder: [
      { title: "Brute force — scan both ways per position", body: "For each row, scan everything to its left for a max, everything to its right for a max, take the lower bank minus the floor. Correct but quadratic — two correlated scans per position." },
      { title: "The pattern — prefix and suffix maxima as window frames", body: "Two window MAXes over the position order — one unbounded-preceding-to-current, one current-to-unbounded-following — compute both banks in a single ordered pass each." },
      { title: "The optimal idea — lower bank minus floor, clamped and filtered", body: "O(n log n) for the ordered scan (O(n) if the rows arrive sorted). The transferable rule: a per-row quantity needing both directional running aggregates is two opposite unbounded window frames plus a scalar combination — never two self-joins." },
    ],
    approach: "Two unbounded inclusive window MAXes for the banks, a scalar MIN for the lower bank, a 0-clamping CASE, then WHERE water > 0 ordered by position",
    schema: {
      ddl: `CREATE TABLE Terrain (
  position INTEGER PRIMARY KEY,
  height   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Terrain (position, height) VALUES
  (1, 3),   -- left wall of the opening bowl
  (2, 0),   -- pool floor: banks 3 and 5 -> 3 units
  (3, 2),   -- submerged shelf: banks 3 and 5 -> 1 unit
  (4, 0),   -- second pool floor: banks 3 and 5 -> 3 units
  (5, 4),   -- right wall of the bowl
  (6, 5),   -- global crest: banks 5 and 5 -> dry
  (7, 4),   -- descending slope
  (8, 3),   -- descending slope
  (9, 2),   -- slope tail: the later plateau raises its right bank to 3 -> 1 unit
  (10, 1),  -- flat-valley floor: banks 5 and 3 -> 2 units
  (11, 3),  -- plateau wall
  (12, 3),  -- plateau wall
  -- right edge of the terrain, dry
  (13, 1);`,
      tables: [
        { name: "Terrain", note: "13 contiguous positions — the 3-0-2-0-4 bowl, a 5-4-3-2 slope and a 1-3-3-1 flat valley behind it" },
      ],
    },
    code: `WITH banks AS (
    SELECT
        position,
        height,
        MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS left_bank,   -- tallest at-or-left, INCLUSIVE
        MAX(height) OVER (ORDER BY position ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS right_bank  -- tallest at-or-right, INCLUSIVE
    FROM Terrain
),
flood AS (
    SELECT
        position,
        CASE
            WHEN MIN(left_bank, right_bank) - height < 0 THEN 0   -- the 0-clamp: terrain above its lower bank holds nothing
            ELSE MIN(left_bank, right_bank) - height
        END AS water
    FROM banks
)
SELECT position, water
FROM flood
WHERE water > 0        -- dry positions never reach the report
ORDER BY position;`,
    walkthrough: [
      "The banks CTE stamps each row twice: position 2 gets left bank 3 (the wall at position 1) and right bank 5 (the crest at position 6), so the lower bank 3 minus floor 0 pools 3.",
      "Position 4 pools 3 the same way, position 3 holds 3 - 2 = 1, slope rows 7 and 8 sit at their own right banks (4 and 3) and stay dry, and position 9 pools 3 - 2 = 1 against the later plateau; position 10 reads banks 5 and 3 over floor 1 and pools 2.",
      "WHERE water > 0 ships five rows in position order: (2, 3), (3, 1), (4, 3), (9, 1), (10, 2) — the eight dry positions, including the walls and the plateau tops, never appear.",
    ],
    time: "O(n log n) — one ordered scan feeding two unbounded window maxes",
    space: "O(n) — the banked rows held between CTE passes",
    followUps: [
      "Collapse the report to a single total-water row — where does the SUM sit relative to the flood CTE, and why can it not share the same pass as the window maxes?",
      "Terrain with a gap in positions (say position 7 missing) — how do the unbounded frames quietly stretch a bank across the hole, and which repair (a numbers join or a LAG-based contiguity check) restores honest banks?",
    ],
    related: ["find-cumulative-salary-of-an-employee", "rolling-average-steps", "maximize-items"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "bitwise-user-permissions-analysis",
    statement:
      "UserGrant records one permission bit per row (grant_id, user_id, perm_mask): bit 1 is read, bit 2 is write, bit 4 is execute — every row's mask is exactly one power of two, a user may hold any number of rows, and the same mask value recurs across users. A user's combined permission is the bitwise OR of all their rows' masks. Report every user whose combined mask contains all three of read, write and execute: columns user_id, combined_mask, ordered by user_id ascending.",
    examples: [
      {
        input: "user 1 holds three rows — read (1), write (2) and execute (4)",
        output: "1 · 7",
        explanation:
          "OR over disjoint powers of two sets exactly the bits their sum sets: 1 + 2 + 4 = 7, and 7 & 7 = 7 passes the all-three gate.",
      },
      {
        input: "user 5 holds four rows — read, write, execute and a fourth bit (8)",
        output: "5 · 15",
        explanation:
          "The extra bit rides into the sum (15) but the gate inspects only the low three: 15 & 7 = 7 — an unrelated permission neither helps nor disqualifies.",
      },
    ],
    constraints: [
      "each user with at least one grant row is folded to exactly one combined_mask — the OR of their rows' masks",
      "report the user only when all three of read (1), write (2), execute (4) are present: combined_mask & 7 = 7; higher bits are ignored by the gate",
      "columns user_id, combined_mask — ordered by user_id ascending",
    ],
    breakdown: [
      "The engine shape rests on an arithmetic identity, so the identity deserves its proof: every row's mask is a single power of two, the bits a user holds are therefore disjoint, and OR-ing disjoint powers of two sets exactly the bits that adding them sets — no carry can ever occur. That makes SUM(DISTINCT perm_mask) a faithful bitwise OR under the stated constraint. The equality is constraint-bound, not universal: 3 + 3 = 6 while 3 OR 3 = 3, so the moment a row carries a multi-bit mask the sum stops being the OR. The seed keeps every row one bit wide, which is what licenses the trick.",
      "DISTINCT is correctness, not cosmetics, and the plant shows why: user 3 holds read twice (grant 2 and grant 7, both mask 1) plus write (2). A plain SUM folds those to 1 + 1 + 2 = 4 — a mask that says user 3 holds execute, a permission they were never granted. DISTINCT collapses the duplicate copies so the fold reads 1 + 2 = 3. On this seed user 3 fails the three-bit gate either way, but the folded mask is a lie without DISTINCT, and the lie turns lethal the moment user 3 also holds execute: plain SUM would print 8, and 8 & 7 = 0 would silently drop a fully privileged user from the report.",
      "The gate is a single comparison by design: 7 is itself the OR of read, write and execute, so combined_mask & 7 keeps exactly those three low bits, and demanding equality with 7 — rather than any nonzero result — requires all of them. User 5's fourth bit (grant 14, mask 8) rides through the AND untouched in the reported mask, yet 15 & 7 still equals 7, so extra permissions never disqualify. Any two bits fail: user 2 folds to 5 and user 4 to 6, and neither equals 7 under the AND. The result-level ORDER BY user_id finishes a report whose grain is one row per fully privileged user.",
    ],
    edges: [
      "The plant is user 3's duplicated read (grant 2 and grant 7, both mask 1): SUM without DISTINCT folds their mask to 4 — execute, a bit they do not hold — while SUM(DISTINCT) reads 3; the duplicate never reaches the gate here, but any consumer of the folded mask inherits the lie.",
      "User 5's grant 14 (mask 8) punishes the naive gate combined_mask = 7: 15 = 7 is false and user 5 vanishes; (combined_mask & 7) = 7 keeps them because the AND inspects only the low three bits.",
      "User 2 (grants 3 and 8, masks 1 and 4, combined 5) punishes any > 0 or at-least-two-bits gate: 5 & 7 = 5, nonzero yet incomplete — equality with 7 is what demands all three.",
      "User 4 (grants 5 and 12, masks 2 and 4, combined 6) holds write and execute but no read: 6 & 7 = 6, not 7 — the second two-bit user keeps the gate honest from the other side.",
    ],
    ladder: [
      { title: "Brute force — OR in application code", body: "Pull every grant row grouped by user, loop the rows and OR their masks in the host language, then filter. It works, but it drags every row across the boundary to do folding the engine can express." },
      { title: "The pattern — fold by group with SUM(DISTINCT)", body: "GROUP BY user_id and SUM(DISTINCT perm_mask): the power-of-two constraint makes the distinct sum equal the OR, and the planted duplicate row is swallowed by DISTINCT." },
      { title: "The optimal idea — one bitwise gate over the folded mask", body: "O(n) for the grouped pass, O(u) output rows. The transferable rule: when a domain guarantees disjoint powers of two, SUM(DISTINCT) IS the bitwise OR — and an all-bits gate is (mask & full) = full, never a positivity test." },
    ],
    approach: "SUM(DISTINCT perm_mask) per user as the bitwise OR under the power-of-two constraint, gated by (mask & 7) = 7, ordered by user_id",
    schema: {
      ddl: `CREATE TABLE UserGrant (
  grant_id  INTEGER PRIMARY KEY,
  user_id   INTEGER NOT NULL,
  perm_mask INTEGER NOT NULL           -- a power of two: 1 read, 2 write, 4 execute
);`,
      seed: `INSERT INTO UserGrant (grant_id, user_id, perm_mask) VALUES
  (1, 1, 1),    -- user 1: read
  (2, 3, 1),    -- user 3: read, first copy
  (3, 2, 1),    -- user 2: read
  (4, 1, 2),    -- user 1: write
  (5, 4, 2),    -- user 4: write
  (6, 5, 1),    -- user 5: read
  (7, 3, 1),    -- user 3: read, PLANTED DUPLICATE for SUM(DISTINCT) to swallow
  (8, 2, 4),    -- user 2: execute
  (9, 3, 2),    -- user 3: write
  (10, 5, 2),   -- user 5: write
  (11, 1, 4),   -- user 1: execute
  (12, 4, 4),   -- user 4: execute
  (13, 5, 4),   -- user 5: execute
  -- user 5, the extra bit that must not disqualify
  (14, 5, 8);`,
      tables: [
        { name: "UserGrant", note: "14 grant rows over 5 users — user 3 holds read twice (the planted duplicate), user 5 carries an extra bit 8" },
      ],
    },
    code: `WITH per_user AS (
    SELECT
        user_id,
        SUM(DISTINCT perm_mask) AS combined_mask  -- OR of DISJOINT powers of two == their sum — DISTINCT swallows the planted duplicate
    FROM UserGrant
    GROUP BY user_id
)
SELECT user_id, combined_mask
FROM per_user
WHERE (combined_mask & 7) = 7   -- 7 = read | write | execute: equality demands ALL three low bits
ORDER BY user_id;`,
    walkthrough: [
      "The per_user CTE folds fourteen grant rows into five masks: user 1 gives 1 + 2 + 4 = 7, user 2 gives 1 + 4 = 5, user 3 gives DISTINCT 1, 1, 2 = 3 (a plain sum would say 4), user 4 gives 2 + 4 = 6, user 5 gives 1 + 2 + 4 + 8 = 15.",
      "The gate ANDs each mask with 7: user 1 gives 7 = 7 and user 5 gives 15 & 7 = 7 — both in; users 2, 3 and 4 give 5, 3 and 6, and none equals 7.",
      "ORDER BY user_id ships two rows: (1, 7) and (5, 15) — the extra bit 8 stays visible in user 5's reported mask but never touches the gate.",
    ],
    time: "O(n) — one grouped pass over the grant rows",
    space: "O(u) — one folded mask per user",
    followUps: [
      "Report each user's missing privileges as labels — how does a CASE per bit over (combined_mask & bit) translate the mask back into names, and what does user 3 print?",
      "If the engine shipped a real BIT_OR aggregate, which half of the constraint could be dropped — and why would a multi-bit row still demand care before any sum-based fold?",
    ],
    related: ["daily-leads-and-partners", "find-followers-count", "active-businesses"],
    order: "exact",
    xp: 20,
  },
];
