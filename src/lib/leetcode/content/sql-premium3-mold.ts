// Deep-dives — LeetCode Premium batch III, file 4 of 6: the shape-molding band —
// polynomial assembly, independent column zipping, pivot and unpivot rotations,
// gender interleaving (2 Medium, 3 Hard). Engine-verified by the batch self-check
// (scripts/tmp-67b4-check.ts). Re-authored from the canonical premium tasks:
// own tables, own seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_MOLD: LcSqlDive[] = [
  {
    slug: "build-the-equation",
    statement:
      "Term stores one row per term of a single-variable polynomial: (term_id, coefficient, exponent, variable). Every row carries the SAME variable (the seed uses 'x'), exponents are integers in 1..3, and each exponent appears at most once — the table holds the polynomial in canonical form, and constant (exponent 0) rows are never stored at all. Assemble the polynomial into a single string: order the terms by exponent descending, render each as the coefficient glued to the variable and exponent — coefficient 3 with exponent 2 renders '3x^2' — then join the terms with '+'. Two formatting laws apply: a coefficient of 1 vanishes entirely (exponent 2 with coefficient 1 renders just 'x^2'), and exponent 1 carries no '^1' marker (coefficient 3, exponent 1 renders '3x'). Output exactly one column, equation, holding the assembled string on a single row.",
    examples: [
      {
        input:
          "three terms, inserted in this order: (term_id 7, coefficient 3, exponent 1, 'x'), (term_id 2, coefficient 4, exponent 3, 'x'), (term_id 5, coefficient 1, exponent 2, 'x')",
        output: "4x^3+x^2+3x",
        explanation:
          "Exponent order decides the sequence, not term_id or insertion order: 4x^3 leads, the coefficient-1 term shows as bare x^2, and the exponent-1 term closes with no '^1'.",
      },
      {
        input: "the seed's exponent-2 row: (term_id 5, coefficient 1, exponent 2, variable 'x')",
        output: "x^2 — no digit before the variable",
        explanation:
          "Coefficient 1 contributes nothing visible: a CAST of the coefficient without the special case would print 1x^2, which is not the canonical form.",
      },
    ],
    constraints: [
      "exponent is unique in Term and ranges over 1..3; no exponent-0 (constant) row ever exists, so every term carries the variable and every equation has at least one x-factor",
      "coefficients are positive integers; coefficient 1 renders as the bare powered variable, exponent 1 renders without the '^1' marker",
      "one column equation, one row — terms in descending exponent order joined by '+', assembled without relying on table order",
    ],
    breakdown: [
      "The instinctive tool — GROUP_CONCAT — is exactly the wrong one here, and the reason is order. A polynomial has ONE legal sequence: exponents descending, and GROUP_CONCAT concatenates in whatever order the engine visits the rows — an implementation detail SQLite does not guarantee, ORDER BY or not. But this exponent axis is not just ordered, it is FINITE and KNOWN: 3, then 2, then 1. A known finite axis is a pivot, so the assembly reserves one named slot per exponent and fills each slot with the term that owns it. Slot addressing makes the sequence structural — the head slot IS exponent 3 — instead of a hope about scan order.",
      "Rendering is per-row work and belongs before any aggregation. Each term's visible form follows three rules: the coefficient digit disappears when it equals 1 (a CASE, because CAST(1 AS TEXT) will happily print '1'), the variable is glued on, and the caret-exponent appears only when the exponent exceeds 1. Build that piece once per row in a CTE, folding the '+' separator INTO the piece itself, so every surviving term arrives at the assembly stage self-contained: '+4x^3', '+x^2', '+3x'. Separators that travel with their term can never be orphaned by an absent neighbor.",
      "The aggregation step is where NULLs lie in wait. MAX(CASE WHEN exponent = 3 THEN piece END) reads the one row owning the head slot — but if that slot has no row, MAX returns NULL, and the very first NULL fed into a || chain NULLS THE ENTIRE STRING: one absent exponent and the equation collapses from a polynomial to NULL. COALESCE-ing each slot to '' is what makes a missing term simply evaporate. Then the leading '+' — every present piece carries one, so the assembled string always begins with a single stray separator — is cut off with SUBSTR(s, 2). Whether the head, middle or tail slot is empty, exactly one leading '+' exists to strip, and no '++' seam can ever form.",
    ],
    edges: [
      "The coefficient-1 row is term_id 5 (exponent 2): rendered without the CASE it would print 1x^2 — the output '4x^3+x^2+3x' shows the bare x^2 in the middle slot, proving the CASE ran.",
      "Insertion order is a decoy: term_id 7 ('3x', the LOWEST exponent) is inserted first. Any formulation that inherits scan order — a bare GROUP_CONCAT, or string built by append-as-read — could ship 3x+4x^3+x^2; the slot build never asks the table for order.",
      "The exponent-1 row (term_id 7, coefficient 3) must close the string as '+3x', not '+3x^1' — the exponent > 1 CASE is what the tail of the output proves.",
      "Kill the COALESCE and the whole build dies on a missing slot: in a variant of this seed without the exponent-2 row, MAX(CASE) yields NULL for that slot and NULL || '+3x' wipes the equation to NULL — '' per slot is what keeps '4x^3+3x' alive.",
    ],
    ladder: [
      { title: "Brute force — format in a loop", body: "Read all terms, sort by exponent descending in application code, format each with the coefficient-1 and no-caret rules, join with '+'. Correct, but the ordering lives outside the query and every consumer repeats it." },
      { title: "The pattern — render per row, pivot into fixed slots", body: "A CTE renders each term into a self-separating piece; a second CTE pivots the pieces into three fixed slots with MAX(CASE WHEN exponent = k ...), COALESCE-ing absent slots to ''." },
      { title: "The optimal idea — known axis, slot addressing, one strip", body: "O(n) — one pass to render, one pivoted scan over a 3-slot axis. The durable rule: when a concatenation axis is finite and known, abandon ordered-concat and fill named slots; fold separators into the pieces and strip the single leading one, so missing slots can never leave a seam." },
    ],
    approach: "per-row CASE renders a self-separating piece, MAX(CASE) fills fixed exponent slots with COALESCE to '', one SUBSTR strips the leading '+'",
    schema: {
      ddl: `CREATE TABLE Term (
  term_id     INTEGER NOT NULL PRIMARY KEY,
  coefficient INTEGER NOT NULL,
  exponent    INTEGER NOT NULL,  -- 1..3, unique, exponent-0 rows never stored
  variable    TEXT NOT NULL      -- one variable across the whole table
);`,
      seed: `INSERT INTO Term (term_id, coefficient, exponent, variable) VALUES
  (7, 3, 1, 'x'),   -- inserted FIRST but holds the LOWEST exponent
  (2, 4, 3, 'x'),   -- head slot: renders '4x^3'
  -- coefficient 1 renders as the bare 'x^2'
  (5, 1, 2, 'x');`,
      tables: [
        { name: "Term", note: "3 terms of one polynomial in 'x' — exponents 3, 2, 1 all present; term_id order deliberately scrambles exponent order" },
      ],
    },
    code: `WITH rendered AS (
    SELECT
        exponent,
        '+' ||                                    -- separator rides ON the piece
        CASE WHEN coefficient = 1 THEN ''         -- coefficient 1 shows no digit
             ELSE CAST(coefficient AS TEXT)
        END ||
        variable ||
        CASE WHEN exponent > 1                    -- exponent 1: no '^1' marker
             THEN '^' || CAST(exponent AS TEXT)
             ELSE ''
        END AS piece
    FROM Term
),
slots AS (
    SELECT
        COALESCE(MAX(CASE WHEN exponent = 3 THEN piece END), '') AS p3,
        COALESCE(MAX(CASE WHEN exponent = 2 THEN piece END), '') AS p2,
        COALESCE(MAX(CASE WHEN exponent = 1 THEN piece END), '') AS p1
    FROM rendered                                 -- one row per exponent, MAX is exact
)
SELECT SUBSTR(p3 || p2 || p1, 2) AS equation      -- strip the single leading '+'
FROM slots
ORDER BY equation;`,
    walkthrough: [
      "rendered turns the three rows into self-separating pieces keyed by exponent: exponent 3 yields '+4x^3', exponent 2 yields '+x^2' — the coefficient-1 CASE deleted the digit — and exponent 1 yields '+3x' with no caret. term_id 7 being read first changed nothing.",
      "slots pivots the pieces: p3 = '+4x^3', p2 = '+x^2', p1 = '+3x'. Each MAX reads exactly the one row owning its exponent; had an exponent been missing, MAX would return NULL and the COALESCE would flatten it to an empty slot.",
      "p3 || p2 || p1 assembles '+4x^3+x^2+3x', and SUBSTR(..., 2) cuts the single leading '+': equation = '4x^3+x^2+3x', one row, one column — no '++' seam anywhere, no '^1' on the tail.",
    ],
    time: "O(n) — one rendering pass plus a pivoted scan over a fixed 3-slot axis",
    space: "O(1) — three fixed slots no matter how the table grows",
    followUps: [
      "Extend to unbounded exponents — why does fixed-slot assembly stop scaling, and how does GROUP_CONCAT over an ordered subquery (or a recursive CTE walking exponents downward) take over the ordering job?",
      "Support negative coefficients and subtraction — where does '-' replace the '+' separator, what does a coefficient of -1 render as, and can a zero coefficient drop its term entirely?",
    ],
    related: ["group-sold-products-by-the-date", "fix-names-in-a-table", "count-salary-categories"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "order-two-columns-independently",
    statement:
      "Pair stores n rows: (row_id, first_col, second_col). Both columns are NOT NULL and hold distinct values within their own column. Build the output by sorting the two columns INDEPENDENTLY and zipping the results position by position: row k of the answer holds the k-th smallest first_col beside the k-th largest second_col. Report columns asc_val, desc_val — one row per position, positions 1..n — ordered by position. Nothing else ties the two sides together: the source rows are scaffolding, and no original row survives into the output as a unit.",
    examples: [
      {
        input:
          "4 rows — first_col values 41, 23, 64, 10 and second_col values 87, 12, 95, 33, inserted in row_id order (1..4) with no correlation between the two columns' orders",
        output: "10 · 95, then 23 · 87, then 41 · 33, then 64 · 12",
        explanation:
          "Position 1 pairs the smallest first_col (10) with the largest second_col (95); the zip walks both sorted sequences inward until position 4 pairs 64 with 12.",
      },
      {
        input: "row_id 1 holds first_col 41 and second_col 87",
        output: "41 and 87 land in DIFFERENT output rows",
        explanation:
          "41 sits at position 3 of the ascending sequence while 87 sits at position 2 of the descending one — source adjacency means nothing; only the derived positions pair values.",
      },
    ],
    constraints: [
      "first_col and second_col are NOT NULL and each holds n distinct values, so both sorts are total and every position 1..n is unambiguous",
      "the output has exactly n rows: position k = (k-th smallest first_col, k-th largest second_col)",
      "columns asc_val, desc_val, ordered by position — the pairing sequence, not by either value column",
    ],
    breakdown: [
      "This report destroys the row as a unit, and seeing that is most of the solve. No output row is 'the row where first_col and second_col relate' — the two values in each output row come from DIFFERENT source rows, chosen only by their ranks in two independent orderings. Any join on row_id, any pairing inherited from how the table happens to store rows, is answering a different question. What replaces the stored key is a DERIVED ordinal: ROW_NUMBER() OVER (ORDER BY first_col) numbers the ascending side, ROW_NUMBER() OVER (ORDER BY second_col DESC) numbers the descending side, and the ordinal — not row_id — is the join key. Position is manufactured data.",
      "ROW_NUMBER is the honest numbering here, and the DESC belongs inside the window. RANK or DENSE_RANK would coincide on this seed only because the values are distinct — but the pairing is positional by definition, so positions must run 1..n gapless even if a value repeated, which is exactly what ROW_NUMBER guarantees (with a deterministic tie-break to be named if duplicates were possible). The descending direction lives in the window's ORDER BY, where it shapes WHICH value gets WHICH number; the query's outer ORDER BY does a different job entirely — it sequences the output rows for the reader.",
      "The final shape is two numbered copies of the same table joined on the ordinal, printed in position order: rn = rn pairs 1-1, 2-2, and so on. Because both sides number the SAME table, both partitions hold exactly n rows, so every ordinal 1..n finds a partner and a plain inner join is already a complete pairing. The fuller construction — a 1..n spine with LEFT JOINs on both sides, or a LEFT-JOIN-pair emulating a full outer join — earns its complexity only when the two sides can have different counts, where a bare rn join would silently drop every ordinal beyond the shorter side's end. Equal lengths are a property of THIS problem; the spine is the general shape to know.",
    ],
    edges: [
      "Joining on row_id instead of the ordinal ships (41,87), (23,12), (64,95), (10,33) — the seed's stored adjacency, none of which is a legal output row; row_id 1's two values land at positions 3 and 2 respectively.",
      "The corners are the proof of independent sorting: position 1 pairs first_col's minimum 10 (row_id 4) with second_col's maximum 95 (row_id 3), and position 4 pairs 64 (row_id 3) with 12 (row_id 2) — every output row is stitched from two different source rows.",
      "Putting the DESC in the wrong place — sorting second_col ASC in the window and reading the result bottom-up, or ordering the final output by desc_val — scrambles the pairing; the direction must be baked into the numbering, because numbers, not row visits, are what the join consumes.",
      "On any correct asc/desc zip, ordering by rn, by asc_val ASC, and by desc_val DESC all coincide (both value columns are monotone along the positions) — but only rn STATES the contract; flip the zip to asc/asc and only rn still orders it correctly.",
    ],
    ladder: [
      { title: "Brute force — sort and zip in app code", body: "Fetch both columns, sort one ascending and one descending, zip by index. Works, but the pairing rule is invisible to the database and every report re-implements the walk." },
      { title: "The pattern — two numberings, join on the ordinal", body: "Two CTEs each project one column with ROW_NUMBER() OVER (ORDER BY ...), one ASC and one DESC; join the CTEs on the ordinal and print in position order." },
      { title: "The optimal idea — position is the join key", body: "O(n log n) — two sorts plus a keyed merge. The durable rule: pairing by rank means the rank IS the key — number both sides, join ordinals; when side lengths can differ, upgrade to a 1..n spine with outer joins so no position silently disappears." },
    ],
    approach: "two ROW_NUMBER numberings of the same table (ASC and DESC window ORDER BY), joined position-wise on the ordinal and emitted in position order",
    schema: {
      ddl: `CREATE TABLE Pair (
  row_id     INTEGER NOT NULL PRIMARY KEY,
  first_col  INTEGER NOT NULL,  -- distinct values, NOT NULL
  second_col INTEGER NOT NULL   -- distinct values, NOT NULL
);`,
      seed: `INSERT INTO Pair (row_id, first_col, second_col) VALUES
  -- 41 is ASC-position 3, 87 is DESC-position 2: split apart
  (1, 41, 87),
  -- 12 is the smallest second_col: DESC-position 4 (last)
  (2, 23, 12),
  -- 95 is the largest second_col: DESC-position 1 (first)
  (3, 64, 95),
  -- 10 is the smallest first_col: ASC-position 1 (first)
  (4, 10, 33);`,
      tables: [
        { name: "Pair", note: "4 rows, 8 distinct values — row_id order is scrambled against BOTH sort orders, so stored adjacency never coincides with the pairing" },
      ],
    },
    code: `WITH asc_side AS (
    SELECT
        first_col AS asc_val,
        ROW_NUMBER() OVER (ORDER BY first_col ASC) AS rn   -- smallest = position 1
    FROM Pair
),
desc_side AS (
    SELECT
        second_col AS desc_val,
        ROW_NUMBER() OVER (ORDER BY second_col DESC) AS rn -- largest = position 1
    FROM Pair
)
SELECT
    a.asc_val,
    d.desc_val
FROM asc_side a
JOIN desc_side d ON d.rn = a.rn        -- both sides number the same n rows: 1..n
ORDER BY a.rn;                         -- output by pairing position`,
    walkthrough: [
      "asc_side numbers first_col ascending: 10 → 1, 23 → 2, 41 → 3, 64 → 4. The insertion order (41, 23, 64, 10 by row_id) never entered the numbering — only the value order did.",
      "desc_side numbers second_col descending: 95 → 1, 87 → 2, 33 → 3, 12 → 4. The DESC lives in the window, so the LARGEST value takes position 1.",
      "The rn = rn join pairs position k with position k and ORDER BY a.rn ships the four rows: (10, 95), (23, 87), (41, 33), (64, 12). Row_id 1's pair (41, 87) is nowhere — its members hold positions 3 and 2 on their own sides.",
    ],
    time: "O(n log n) — two sorts, then a merge on an integer key",
    space: "O(n) — two numbered single-column copies",
    followUps: [
      "Pair k-th smallest with k-th smallest instead — which single keyword changes in the second window, and does anything else in the query move?",
      "The two sides come from DIFFERENT tables with different row counts — what does the bare rn join silently drop, and how does a 1..n recursive spine with LEFT JOINs in both directions surface each side's orphans?",
    ],
    related: ["rank-scores", "exchange-seats", "running-total-for-different-genders"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "dynamic-pivoting-of-a-table",
    statement:
      "Sale records one row per store per recorded month: (store_id, month, revenue), where month is an integer in 1..3 and a (store_id, month) pair appears at most once. Rotate the table for a fixed reporting window — months 1, 2 and 3 are known in advance, so the report can name its columns explicitly: one row per store with columns store_id, jan, feb, mar, where each month column carries the SUM of that store's revenues in that month. A store with no row for a month reports NULL in that column — unrecorded, not zero; do not coalesce. Output one row per store that appears in Sale, ordered by store_id.",
    examples: [
      {
        input: "store 2 recorded month 1 with revenue 20 and month 3 with revenue 15 — no February row exists",
        output: "20 · NULL · 15",
        explanation:
          "The feb slot aggregates a group in which every row fails the month = 2 test, and an aggregate over all-NULL input is NULL — the honest report of a month with no data.",
      },
      {
        input: "store 4's only row is (month 2, revenue 35)",
        output: "NULL · 35 · NULL",
        explanation:
          "The store still gets a row: grouping runs over the FULL table, so a single-month store survives with its one filled slot flanked by NULLs.",
      },
    ],
    constraints: [
      "one output row per store_id present in Sale, ordered by store_id; columns jan, feb, mar hold SUM of revenue for months 1, 2, 3 respectively",
      "a month with no row for that store reports NULL — the NULL is semantic (no data) and must not be coalesced to 0",
      "month ranges over 1..3 and the axis is known at query time, so fixed columns are legal; (store_id, month) is unique",
    ],
    breakdown: [
      "Pivoting rotates rows into columns along an axis, and the axis decides everything about the technique. A truly dynamic pivot discovers its axis at runtime and needs engine-specific dynamic SQL — out of reach for a single graded statement. But here the axis is known: months 1, 2, 3. A known finite axis converts the problem into conditional aggregation: reserve one output column per axis value and give each column its own aggregate that only sees the rows belonging to it. SUM(CASE WHEN month = 1 THEN revenue END) is that aggregate — the CASE maps non-matching rows to NULL, and SUM skips NULLs, so the slot totals exactly its own month.",
      "The CASE must live INSIDE the aggregate, and the two classic misplacements fail in opposite directions. Filter in a WHERE first (WHERE month = 1) and you amputate the table before grouping: store 4 — whose only row is month 2 — would vanish from the report entirely, and store 2's mar would lose its 15. Drop the CASE and aggregate raw revenue (SUM(revenue) per store), and every one of the three columns reports the store's grand total: stores 1 through 4 would each print their whole sum three times under three different month names — three identical numbers wearing three hats. Narrowing is per-slot, so the narrowing belongs in the slot's own aggregate.",
      "The NULL is the report's most precise word, and it arises from a rule worth knowing cold: SUM of an all-NULL group is NULL (the aggregate never sees a number to add), and MAX of an all-NULL group is NULL too — on this seed, where (store_id, month) is unique, SUM(CASE ...) and MAX(CASE ...) are interchangeable. They part ways only if a month could repeat within a store: SUM would add the repeats, MAX would keep one arbitrarily. The COALESCE-to-0 reflex must be resisted here because 0 and NULL mean different things to the reader — 'recorded a total of zero' versus 'no record exists' — and the output contract chose NULL.",
    ],
    edges: [
      "Store 2's feb must be NULL: an all-NULL slot aggregate returns NULL on both SUM and MAX — but write COALESCE(SUM(...), 0) and the report silently asserts a recorded zero February that never happened.",
      "WHERE month = 1 before the GROUP BY erases store 4 (no month-1 rows at all) and strips store 2's mar of its 15 — pre-filtering amputates the very rows other slots need; the full table must reach the GROUP BY.",
      "SUM(revenue) without the CASE cross-contaminates: store 1 would print 120 in jan, feb AND mar (30 + 40 + 50 under three names), and store 4 would print 35 three times — the month filter is per-slot, not per-query.",
      "Store 4's row (NULL, 35, NULL) proves the store spine: GROUP BY store_id over the full table forms a group for every store that exists, so a single-month store still ships a row with two NULL flanks.",
    ],
    ladder: [
      { title: "Brute force — one query per month", body: "Run three separate grouped queries (one per month) and stitch the results in application code by store_id. Works, but the report is three round trips plus a join the engine can do in one pass." },
      { title: "The pattern — conditional aggregation", body: "GROUP BY store_id over the whole table with one SUM(CASE WHEN month = k THEN revenue END) per output column — each slot aggregates only its own month's rows." },
      { title: "The optimal idea — narrow inside the aggregate, keep the spine whole", body: "O(n) — one grouped pass. The durable rule: a pivot slot is an aggregate over the FULL group narrowed by a CASE, never a pre-filtered table; missing axis values then surface as all-NULL slots, which is the NULL the contract wants." },
    ],
    approach: "conditional aggregation — SUM(CASE WHEN month = k THEN revenue END) per fixed month slot over a full-table GROUP BY store_id",
    schema: {
      ddl: `CREATE TABLE Sale (
  store_id INTEGER NOT NULL,
  month    INTEGER NOT NULL,  -- 1..3 and (store_id, month) is unique
  revenue  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Sale (store_id, month, revenue) VALUES
  (2, 1, 20),   -- store 2: January only here...
  (1, 3, 50),   -- store 1: all three months (insertion order scrambled on purpose)
  (4, 2, 35),   -- store 4: single-month store, jan and mar stay NULL
  (1, 1, 30),
  (3, 2, 10),   -- store 3: no March row -> mar NULL
  (2, 3, 15),   -- store 2: no February row -> feb NULL
  (3, 1, 25),
  (1, 2, 40);`,
      tables: [
        { name: "Sale", note: "8 rows over 4 stores — store 1 has all of months 1-3, store 2 misses February, store 3 misses March, store 4 records only month 2" },
      ],
    },
    code: `SELECT
    store_id,
    SUM(CASE WHEN month = 1 THEN revenue END) AS jan,  -- slot sees ONLY month 1
    SUM(CASE WHEN month = 2 THEN revenue END) AS feb,  -- all-NULL group -> NULL
    SUM(CASE WHEN month = 3 THEN revenue END) AS mar
FROM Sale
GROUP BY store_id            -- spine over the FULL table: every store survives
ORDER BY store_id;`,
    walkthrough: [
      "GROUP BY store_id builds four groups from all eight rows — insertion order (store 2 first, store 4 third) is irrelevant. Store 1's group holds months 1, 2, 3; store 2's holds months 1 and 3; store 3's holds 1 and 2; store 4's holds only month 2.",
      "Inside each group the three slot aggregates partition the rows by month: store 1 gets jan 30, feb 40, mar 50; store 2 gets jan 20, feb from an all-NULL column set → NULL, mar 15; store 3 gets jan 25, feb 10, mar NULL; store 4 gets jan NULL, feb 35, mar NULL.",
      "ORDER BY store_id ships the four rows: (1, 30, 40, 50), (2, 20, NULL, 15), (3, 25, 10, NULL), (4, NULL, 35, NULL) — two NULL slots are the missing February and March, and store 4 exists despite having no month-1 or month-3 rows at all.",
    ],
    time: "O(n) — one grouped pass over the sales rows",
    space: "O(s) — one output row per store",
    followUps: [
      "The reporting window grows to a full year — the axis still fits in columns, but what breaks at 5+ years, and what does a long-format output (store_id, month, revenue) or runtime-generated SQL buy instead?",
      "Add a total_sales column beside jan..mar — which single extra aggregate computes it correctly for every store, and why does jan + feb + mar return NULL for store 4 (NULL arithmetic) instead of 35?",
    ],
    related: ["reformat-department-table", "sales-by-day-of-the-week", "occupations-pivot"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "dynamic-unpivoting-of-a-table",
    statement:
      "QuarterStats holds one wide row per store: (store_id, q1_sales, q2_sales, q3_sales). Some cells are NULL — a quarter that was never recorded for that store; a recorded 0 is real data and must be kept. Rotate the table long: emit one row per NON-NULL cell as (store_id, quarter, sales), where quarter carries the literal label 'Q1', 'Q2' or 'Q3' naming the column the cell came from and sales carries that cell's value verbatim. Keep only the non-NULL cells — a NULL source cell contributes no row at all. Output ordered by store_id ascending, then quarter ascending.",
    examples: [
      {
        input:
          "store 2's row: q1_sales = 60, q2_sales = NULL, q3_sales = 60 — the same sales figure in two different quarters",
        output: "Q1 · 60, then Q3 · 60",
        explanation:
          "Both cells survive as separate rows because the quarter label distinguishes them — strip the label and a set-deduplicating union would fuse the two 60s into one row.",
      },
      {
        input: "store 3's row: q1_sales = 45, q2_sales = NULL, q3_sales = NULL",
        output: "Q1 · 45 — one row only",
        explanation:
          "NULL is unrecorded, not zero: the q2 and q3 cells emit nothing. Coalescing them to 0 would fabricate two quarters store 3 never had.",
      },
    ],
    constraints: [
      "one output row per non-NULL cell across the three sales columns — on the seed, 3 + 2 + 1 = 6 rows",
      "quarter is the literal 'Q1'/'Q2'/'Q3' stamped from the source column's identity; sales is that cell's value verbatim, zeros included",
      "NULL source cells drop out entirely (they are not zeros); rows ordered by store_id, then quarter",
    ],
    breakdown: [
      "Unpivoting is the inverse rotation: wide columns collapse into a long (label, value) pile, and the twist is that the column NAME becomes data. Each output row needs three ingredients — the row's key, a label saying WHICH wide column the value came from, and the value itself — and a single SELECT cannot produce that from one row, because no expression can vary a column reference by row. The engine shape is therefore one branch per source column: each branch reads exactly one column and stamps the matching literal label. Three known columns, three branches — like its pivot twin, 'dynamic' here means the axis is known at write time, and the branch-per-axis-value form is what a single statement can express.",
      "UNION ALL is the only honest connector, and the label is what makes it so. UNION deduplicates ENTIRE rows, and across branches the only thing that distinguishes otherwise-identical rows is the label — with it, no two branches can ever emit the same triple, so UNION would be pure cost (an implicit dedup sort that removes nothing). Remove the label from the SELECT and the danger turns real on this seed: store 2's Q1 and Q3 cells both hold 60, and a label-less UNION would collapse (2, 60) and (2, 60) into one row — silently deleting a quarter's worth of sales while looking like harmless tidying. The label is not cosmetic; it is load-bearing for correctness.",
      "Each branch filters its own column with IS NOT NULL, and the distinction it enforces is the semantic heart of the task: NULL means the quarter was never recorded, while 0 means a recorded total of zero — store 1's q2_sales is 0 and MUST print as (1, 'Q2', 0); a > 0 filter would 'helpfully' erase a genuine zero quarter. Ordering happens once, outside: in SQLite a compound SELECT takes at most one ORDER BY, attached after the final branch, applying to the whole union with sort keys drawn from the output columns. That single outer sort is what interleaves the three branch-runs into (store, quarter) order; branch-local ordering is not expressible, and no ORDER BY at all leaves the branch blocks in unspecified sequence.",
    ],
    edges: [
      "Store 1's q2 cell is a recorded 0 and prints as (1, 'Q2', 0) — filter with q2_sales > 0 instead of IS NOT NULL and the output shrinks to 5 rows, having erased a real zero quarter.",
      "Store 2's Q1 and Q3 both hold 60: with labels and UNION ALL the output keeps (2, 'Q1', 60) and (2, 'Q3', 60); drop the label and UNION fuses them into a single (2, 60) row — five rows instead of six, one quarter of data gone.",
      "Store 3 (q2 and q3 NULL) contributes exactly one row — COALESCE(q2_sales, 0) instead of an IS NOT NULL filter would fabricate (3, 'Q2', 0) and (3, 'Q3', 0), inflating the report to nine rows of fiction.",
      "ORDER BY inside a branch is a syntax error in a compound SELECT, and omitting the outer ORDER BY leaves the three branch-runs unordered — only ORDER BY store_id, quarter after the last branch guarantees the interleaved sequence.",
    ],
    ladder: [
      { title: "Brute force — loop the columns in app code", body: "Read each wide row, loop its three sales columns, and emit (store, label, value) for every non-NULL cell. Works, but the rotation lives outside the database and every consumer repeats it." },
      { title: "The pattern — one branch per source column", body: "Three SELECTs, each projecting (store_id, literal label, one column) filtered by IS NOT NULL, stacked with UNION ALL and sorted once by the outer ORDER BY." },
      { title: "The optimal idea — the label is the row's identity", body: "O(n) per branch. The durable rule: unpivot = branch per known axis value with the label stamped as a literal — the label keeps branch rows distinct (making UNION ALL both correct and cheap), the IS NOT NULL filter encodes 'NULL is not data', and the single outer sort interleaves the blocks." },
    ],
    approach: "three UNION ALL branches stamping 'Q1'/'Q2'/'Q3' literals, each filtered by its column IS NOT NULL, sorted once outside the compound",
    schema: {
      ddl: `CREATE TABLE QuarterStats (
  store_id INTEGER NOT NULL PRIMARY KEY,
  q1_sales INTEGER,                  -- NULL = quarter never recorded
  q2_sales INTEGER,                  -- a recorded 0 is REAL data
  q3_sales INTEGER
);`,
      seed: `INSERT INTO QuarterStats (store_id, q1_sales, q2_sales, q3_sales) VALUES
  (1, 120, 0, 95),   -- all three quarters recorded, q2 is a genuine zero
  (2, 60, NULL, 60), -- q2 unrecorded, Q1 and Q3 share the figure 60 (union trap)
  (3, 45, NULL, NULL);`,
      tables: [
        { name: "QuarterStats", note: "3 stores — store 1 has all 3 quarters (one of them 0), store 2 has 2 (Q2 NULL), store 3 has 1 (Q2 and Q3 NULL); 3 + 2 + 1 = 6 expected rows" },
      ],
    },
    code: `SELECT store_id, 'Q1' AS quarter, q1_sales AS sales   -- column names come
FROM QuarterStats                                      -- from the FIRST branch
WHERE q1_sales IS NOT NULL                             -- NULL emits no row
UNION ALL                                              -- ALL: never dedup rows
SELECT store_id, 'Q2' AS quarter, q2_sales AS sales
FROM QuarterStats
WHERE q2_sales IS NOT NULL                             -- 0 passes; NULL does not
UNION ALL
SELECT store_id, 'Q3' AS quarter, q3_sales AS sales
FROM QuarterStats
WHERE q3_sales IS NOT NULL
ORDER BY store_id, quarter;   -- ONE outer sort over the whole compound`,
    walkthrough: [
      "The Q1 branch reads q1_sales — all three stores recorded it: (1, 'Q1', 120), (2, 'Q1', 60), (3, 'Q1', 45). The Q2 branch finds 0 for store 1 (a real value), NULL for stores 2 and 3: only (1, 'Q2', 0) survives. The Q3 branch yields (1, 'Q3', 95) and (2, 'Q3', 60).",
      "UNION ALL stacks the runs: 3 + 2 + 1 = 6 rows, no dedup pass — store 2's two 60s both survive because 'Q1' and 'Q3' are different labels.",
      "The single outer ORDER BY interleaves the branch blocks into the final sequence: (1, 'Q1', 120), (1, 'Q2', 0), (1, 'Q3', 95), (2, 'Q1', 60), (2, 'Q3', 60), (3, 'Q1', 45).",
    ],
    time: "O(n) — one pass per branch over the same n-row table",
    space: "O(n) — one output row per non-NULL cell",
    followUps: [
      "Next quarter adds a q4_sales column — what exactly must change (one more branch), and what silently breaks if the new branch forgets its IS NOT NULL filter?",
      "Rotate the long output back to wide — why is this particular unpivot-to-pivot round trip lossless, and what would a store with two values for the same quarter do to the re-pivot?",
    ],
    related: ["rearrange-products-table", "products-price-for-each-store", "count-salary-categories"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "arrange-table-by-gender",
    statement:
      "Person stores one row per person: (person_id, name, gender), where gender is 'F', 'M' or 'O'. Arrange the rows in an alternating line that starts with F: position 1 holds an F, position 2 an M, position 3 an F, and so on. Within each gender the people take their seats in person_id order. When one side runs out — say there are more F rows than M rows — the remaining F rows continue on consecutive seats after the last interleaved pair. Every 'O' row appears after ALL the F and M rows, ordered by person_id. Report the FULL row set — person_id, name, gender, no rows or columns dropped — in the final arrangement order.",
    examples: [
      {
        input:
          "the seed's F and M sides: F rows by person_id are 2, 4, 7, 8; M rows by person_id are 3, 6, 9 — four Fs, three Ms",
        output: "F M F M F M F — the fourth F sits alone on seat 7",
        explanation:
          "Seats 1-6 interleave perfectly; seat 7 has no M claimant left, so F's remainder (person 8) continues alone — the arithmetic of odd seats never assumed equal side lengths.",
      },
      {
        input: "the two 'O' rows: person 1 (Cleo) and person 5 (Ivo)",
        output: "the last two rows, in the order 1 then 5",
        explanation:
          "O keys start above every F/M seat and inherit person_id order — Cleo then Ivo — regardless of where they sat in the source table.",
      },
    ],
    constraints: [
      "the alternation starts with F: odd seats hold F rows in person_id order, even seats hold M rows in person_id order; when the shorter side runs out, the longer side's remainder continues alone",
      "every gender-'O' row comes after all F and M rows, ordered by person_id",
      "the full row set (person_id, name, gender) is returned exactly once per person, in arrangement order",
    ],
    breakdown: [
      "This report asks the engine to invent SEATS, not to sort by data values — position 1 is an F, position 2 an M, and no column in the table knows that. The tool is positional arithmetic over a per-group ordinal. ROW_NUMBER() OVER (PARTITION BY gender ORDER BY person_id) hands each side its own 1..k sequence; then a CASE folds the ordinal onto one shared integer line: F takes the odd seats 2*rn - 1, M takes the even seats 2*rn. One final ORDER BY on that computed seat number lays the whole line out. The alternation is not a loop or a UNION of halves — it is two arithmetic progressions (odd and even) interleaved by a sort, which is why it never tangles.",
      "The running-out case is where this shape quietly earns its keep. With four F threads and three M threads, seats 1 through 6 pair off; seat 7 is odd, so it belongs to F's fourth row, and seat 8 has no claimant at all — the M sequence simply stops generating keys. A hand-rolled merge (cursor over each gender, alternate until one dries up, then append the remainder) must code that exhaustion explicitly; the seat-key formulation gets it for free because nothing in 2*rn - 1 assumed the even keys existed all the way up. The same arithmetic would handle ten Fs and one M without modification — the longer side just continues past the last even seat.",
      "The 'O' rows need keys above EVERY F/M seat, and the only way a row can know that ceiling is if someone tells it: MAX(CASE WHEN gender IN ('F', 'M') THEN rn END) OVER () computes the longest F/M thread length and broadcasts it onto every row — a group fact delivered as per-row context, which is exactly the job windows do that GROUP BY cannot. O keys are then 2*thread_max + person_id: strictly greater than any F/M seat (the largest F/M seat is 2*thread_max - 1), while the + person_id keeps the O block internally ordered by person_id. And determinism inside each gender is not optional — the OVER clause's ORDER BY person_id is what makes Hana (person 2), not whoever was inserted first, take F's first seat.",
    ],
    edges: [
      "The F tail: M has 3 threads, F has 4 — after Bruno (M seat 6) comes Farah (F rn 4, seat 7) with NO M between them; a query that assumes strict alternation forever, or appends 'the rest' without a rule, breaks exactly here.",
      "Swapping the two CASE branches — 2*rn for F and 2*rn - 1 for M — starts the line with M and flips every subsequent seat; the arrangement's first row (2, 'Hana', 'F') is the canary.",
      "O placement is a ceiling question: Cleo (person 1) and Ivo (person 5) get keys 2*4 + 1 = 9 and 2*4 + 5 = 13, both above the largest F/M seat 7 — a plain ORDER BY gender would instead ship three solid blocks (all F, all M, all O) and no interleave at all.",
      "Drop ORDER BY person_id from inside OVER and the rn assignment within each gender is arbitrary — Aiko (person 4) was inserted before Hana (person 2), so seats could rotate; the seed's scrambled insertion order exists to punish exactly that omission.",
    ],
    ladder: [
      { title: "Brute force — weave cursors by hand", body: "Bucket rows by gender in application code, sort each bucket by person_id, alternate F/M with a parity flag until one bucket dries up, then append the rest and the O block. Every rule hand-coded, every consumer repeating it." },
      { title: "The pattern — per-gender ordinals onto odd/even seats", body: "ROW_NUMBER() OVER (PARTITION BY gender ORDER BY person_id), then a CASE that maps F to 2*rn - 1 and M to 2*rn, with O parked at an offset above the longest thread; one ORDER BY on the computed key." },
      { title: "The optimal idea — interleaving is a shared number line", body: "O(n log n) — one windowed pass plus a sort. The durable rule: to interleave sequences, map each onto disjoint regions of one integer line (odd/even seats) and sort; to append a trailing group, give it keys beyond the maximum (offset by the thread length); determinism comes from naming the tie-break inside every partition." },
    ],
    approach: "per-gender ROW_NUMBER (person_id tie-break), CASE maps F to odd and M to even seat keys, O rows keyed past 2 * max F/M thread length, single ORDER BY on the seat key",
    schema: {
      ddl: `CREATE TABLE Person (
  person_id INTEGER NOT NULL PRIMARY KEY,
  name      TEXT NOT NULL,
  gender    TEXT NOT NULL      -- 'F', 'M' or 'O'
);`,
      seed: `INSERT INTO Person (person_id, name, gender) VALUES
  (4, 'Aiko', 'F'),
  (9, 'Bruno', 'M'),
  (1, 'Cleo', 'O'),   -- O row: must land AFTER all F/M seats
  (7, 'Dara', 'F'),
  (3, 'Emil', 'M'),
  (8, 'Farah', 'F'),  -- fourth F: the tail that outlasts the M side
  (6, 'Gustav', 'M'),
  (2, 'Hana', 'F'),   -- lowest F id: F seat 1, despite being inserted late
  (5, 'Ivo', 'O');`,
      tables: [
        { name: "Person", note: "9 people — 4 F, 3 M, 2 O; insertion order scrambled against person_id so both the seat assignment and the O offset are visible" },
      ],
    },
    code: `WITH numbered AS (
    SELECT
        person_id,
        name,
        gender,
        ROW_NUMBER() OVER (
            PARTITION BY gender
            ORDER BY person_id           -- deterministic seat order per side
        ) AS rn
    FROM Person
),
threaded AS (
    SELECT
        person_id,
        name,
        gender,
        rn,
        MAX(CASE WHEN gender IN ('F', 'M') THEN rn END) OVER () AS thread_max
        -- the longest F/M side, broadcast to EVERY row (incl. the O rows)
    FROM numbered
)
SELECT person_id, name, gender
FROM threaded
ORDER BY
    CASE gender
        WHEN 'F' THEN 2 * rn - 1          -- F owns the odd seats: 1, 3, 5, ...
        WHEN 'M' THEN 2 * rn              -- M owns the even seats: 2, 4, 6, ...
        ELSE 2 * thread_max + person_id   -- O trails every seat, person_id order
    END;`,
    walkthrough: [
      "numbered assigns side-local ranks: F side 2→1, 4→2, 7→3, 8→4 (Hana first — person_id, not insertion order); M side 3→1, 6→2, 9→3; O side 1→1, 5→2. thread_max = 4 (the F side) on every row.",
      "The CASE computes seats: Hana 1, Emil 2, Aiko 3, Gustav 4, Dara 5, Bruno 6, Farah 7 — then the M side is exhausted, and the odd-seat arithmetic keeps going without it. Cleo and Ivo get 2*4 + 1 = 9 and 2*4 + 5 = 13.",
      "ORDER BY the seat key ships all nine rows in line: (2, Hana, F), (3, Emil, M), (4, Aiko, F), (6, Gustav, M), (7, Dara, F), (9, Bruno, M), (8, Farah, F), (1, Cleo, O), (5, Ivo, O) — F M F M F M F, the F tail, then the O block.",
    ],
    time: "O(n log n) — one windowed pass plus the final seat-key sort",
    space: "O(n) — one ordinal and one key per row",
    followUps: [
      "Start the line with M instead — precisely which characters of the CASE flip, and does the O offset formula need any change (and why not)?",
      "Interleave THREE sides (say a new 'X' cycling F, M, X, F, M, X, ...) — how do modular keys (3*rn - 2, 3*rn - 1, 3*rn) generalize the odd/even trick, and where do the O rows park now?",
    ],
    related: ["running-total-for-different-genders", "exchange-seats", "the-report"],
    order: "exact",
    xp: 20,
  },
];
