// Deep-dives — HackerRank band expansion, batch 3 (6 problems).
// Re-authored from the canonical HackerRank SQL tasks: own tables,
// custom 95xx ids, original phrasing — never copied problem text.
// Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE2_HACKERRANK: LcSqlDive[] = [
  {
    slug: "type-of-triangle",
    statement:
      "Triangle stores three side lengths per row. Classify each row: 'Equilateral' when all three sides are equal, 'Isosceles' when exactly two are, 'Scalene' when all three differ — and 'Not A Triangle' when the lengths cannot form a triangle at all (any side non-positive, or a pair of sides fails to strictly exceed the third).",
    examples: [
      {
        input: "sides: 20-20-20 · 20-20-30 · 20-30-40 · 10-10-20",
        output: "Equilateral · Isosceles · Scalene · Not A Triangle",
        explanation:
          "10 + 10 = 20 fails the STRICT triangle inequality — each pair must sum to MORE than the remaining side — so the flat, degenerate shape is rejected even though two sides match.",
      },
    ],
    constraints: [
      "one class per row, one output column, rows ordered by id",
      "the triangle inequality is strict: A + B > C, A + C > B and B + C > A must ALL hold",
      "a side of 0 or less is disqualified outright, before any equality check",
    ],
    breakdown: [
      "CASE evaluates its branches top-down and stops at the first match — so the ORDER of the WHEN clauses is the entire algorithm. The validity gate must come FIRST: 10-10-20 satisfies 'A = B' and would be misclassified as Isosceles unless the inequality check has already rejected it. Every correct solution to this problem is a correct ordering of checks; every wrong one has the equality branches first.",
      "The equality ladder is shorter than it looks, thanks to transitivity: A = B AND B = C already forces A = C, so two comparisons certify all three sides equal. And because the 'Not A Triangle' and 'Equilateral' branches ran earlier, whatever reaches the final equality check is a valid triangle with exactly two equal sides — Isosceles — and the ELSE catches the all-different remainder: Scalene. The ELSE is doing real classification work, not just sweeping up errors.",
      "The degenerate case is the heart of the trap. A 'triangle' with 10, 10, 20 collapses into a straight line: 10 + 10 = 20 is not GREATER than 20. Writing A + B < C (or testing only one pairing) lets flat shapes slip through as Isosceles — the inequality must be written with <= on the failing side, and checked for all three pairings, because you never know which side is the long one.",
    ],
    edges: [
      "Branch order is load-bearing: validity BEFORE equality, or 10-10-20 reads as Isosceles.",
      "Use <=, not <: the strict inequality means A + B = C already fails — that's the degenerate row.",
      "All three pairings must be tested (A+B vs C, A+C vs B, B+C vs A) — the long side can sit in any position.",
      "Non-positive sides end the discussion immediately — fold A <= 0 OR B <= 0 OR C <= 0 into the same first branch.",
    ],
    ladder: [
      { title: "Brute force — three separate flags", body: "Compute valid, equi, iso as boolean expressions in three columns, then reconcile them in a second pass. The CASE collapses all of that into one ordered decision." },
      { title: "The pattern — an ordered decision ladder", body: "One CASE with branches in strict precedence order: reject invalid, certify equilateral, recognize isosceles, default to scalene." },
      { title: "The optimal idea — the ELSE is a branch", body: "O(n), one scan. The elegance: after earlier branches dispose of invalid and equilateral rows, 'exactly two equal' and 'all different' need no explicit NOT-equal logic — control flow already proved it." },
    ],
    approach: "One CASE, branches ordered: validity gate → equilateral → isosceles → scalene",
    schema: {
      ddl: `CREATE TABLE Triangle (
  id INTEGER PRIMARY KEY,
  A INTEGER NOT NULL,
  B INTEGER NOT NULL,
  C INTEGER NOT NULL
);`,
      seed: `INSERT INTO Triangle (id, A, B, C) VALUES
  (1,20,20,20),(2,20,20,30),(3,20,30,40),(4,1,2,10),
  (5,13,7,5),(6,0,5,5),(7,10,10,20);`,
      tables: [
        { name: "Triangle", note: "7 rows — one of each class, plus a zero side and a degenerate 10-10-20" },
      ],
    },
    code: `SELECT
    id,
    CASE
        WHEN A + B <= C OR A + C <= B OR B + C <= A
             OR A <= 0 OR B <= 0 OR C <= 0
            THEN 'Not A Triangle'      -- gate FIRST: inequality + non-positive
        WHEN A = B AND B = C
            THEN 'Equilateral'         -- transitivity makes two checks enough
        WHEN A = B OR B = C OR A = C
            THEN 'Isosceles'           -- exactly two equal (rest already ruled out)
        ELSE 'Scalene'
    END AS triangle_type
FROM Triangle
ORDER BY id;`,
    walkthrough: [
      "Row 1 (20,20,20): every pair sums to 40 > 20 and all sides positive — the gate passes; A = B AND B = C → Equilateral.",
      "Row 2 (20,20,30): valid (40 > 30); not all equal; A = B → Isosceles. Row 3 (20,30,40): valid, no equalities → falls to ELSE → Scalene.",
      "Rows 4–7 all fail the gate: 1+2=3 <= 10, 7+5=12 <= 13, A = 0, and 10+10=20 <= 20 — the degenerate flat 'triangle' that a < comparison would have waved through as Isosceles.",
    ],
    time: "O(n) — one CASE evaluation per row",
    space: "O(1) beyond the output rows",
    followUps: [
      "Count rows per class — GROUP BY the whole CASE expression (or wrap it in a CTE) and watch the four buckets.",
      "Only valid triangles should keep their ids — WHERE with the same predicate, or a CTE that computes the class once and filters on it.",
    ],
    related: ["triangle-judgement", "fix-names-in-a-table"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "the-blunder",
    statement:
      "A spreadsheet export mangled the salary column by deleting every '0' digit from each value — 1500 was exported as 15, 10000 as 1. The database still holds the true salaries. Compute the damage as one column error_amount: the CEILING of (true average salary − spreadsheet average salary), where the spreadsheet average is computed from the digit-stripped values.",
    examples: [
      {
        input: "true salaries: 1500, 2000, 3050, 4700, 10000 — sheet saw: 15, 2, 35, 47, 1",
        output: "4230",
        explanation:
          "True average 21250/5 = 4250; sheet average 100/5 = 20; ceiling(4250 − 20) = 4230.",
      },
    ],
    constraints: [
      "salaries are positive integers; the sheet value is salary with every '0' character removed",
      "the answer is the ceiling of the difference of the two AVERAGES — not the difference of ceilings",
      "exactly one row, one column: error_amount",
    ],
    breakdown: [
      "The repair is string surgery on a number. CAST(salary AS TEXT) turns 10000 into '10000', REPLACE(…, '0', '') strips every zero character to '1', and CAST back to INTEGER reads it as the number 1 — exactly what the spreadsheet did. Digits are text until you say otherwise, and REPLACE works character-by-character with no notion of place value: that is precisely why a trailing-zero-rich salary collapses so catastrophically.",
      "The math needs one clean identity. The gap of averages is (SUM(salary) − SUM(sheet)) / n — a fraction of integers. Reaching for CEIL(AVG(x) − AVG(y)) computes it in floating point, where averages of large sums can be off in the last ulp and flip a ceiling across an integer boundary. The exact alternative is integer arithmetic: for positive integers a and n, the ceiling of a/n is (a + n − 1) / n — adding n − 1 pushes any nonzero remainder across the next integer, and SQLite's integer division floors it right back down to the ceiling. One division, no floats, exact at any scale.",
      "The real lesson is broader than one formula: dirty-data repairs are pure SQL. The mangling happened outside the database, but detecting and quantifying it — reconstruct the corruption with REPLACE, compare the two worlds, aggregate the gap — happens inside one SELECT. No ETL script, no application code: the query is the audit.",
    ],
    edges: [
      "REPLACE deletes ALL zeros, not just leading or trailing ones — 10000 becomes '1', not '1000'.",
      "CAST the mangled text back to INTEGER explicitly — leaning on SQLite's implicit text-to-number coercion is a habit that breaks the moment a value like '0x1A' or '' appears.",
      "Never CEIL two floating AVGs — (a + n − 1) / n over integers is the exact ceiling, immune to float drift.",
      "No GROUP BY: aggregates run over the whole table and collapse to the single output row.",
    ],
    ladder: [
      { title: "Brute force — repair in code", body: "SELECT the salaries, strip digits in application code, average both worlds, ceil in the language. Three moving parts where one expression suffices." },
      { title: "The pattern — in-SQL string surgery", body: "REPLACE + CAST rebuilds the corrupted column inside the query; two SUMs and a COUNT are one scan apart." },
      { title: "The optimal idea — the integer ceiling identity", body: "(SUM_true − SUM_sheet + n − 1) / n with integer division: the exact ceiling of the average gap, no floats, O(n) single pass." },
    ],
    approach: "REPLACE the zeros away, then ceiling the average gap with (a + n − 1) / n integer math",
    schema: {
      ddl: `CREATE TABLE Employees (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  salary INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (id, name, salary) VALUES
  (1,'Kim',1500),(2,'Ravi',2000),(3,'Ana',3050),
  (4,'Bo',4700),(5,'Cy',10000);`,
      tables: [
        { name: "Employees", note: "5 staff; the sheet would show 15, 2, 35, 47, 1" },
      ],
    },
    code: `SELECT
    ( SUM(salary)
      - SUM(CAST(REPLACE(CAST(salary AS TEXT), '0', '') AS INTEGER))
      + COUNT(*) - 1 )
    / COUNT(*) AS error_amount      -- integer division = exact ceiling of the gap
FROM Employees;`,
    walkthrough: [
      "Per row the sheet value is REPLACE('1500')→15, '2000'→2, '3050'→35, '4700'→47, '10000'→1 — SUM(sheet) = 100, while SUM(salary) = 21250 and n = 5.",
      "The gap of averages is (21250 − 100)/5 = 21150/5 = 4230 exactly — the numerator 21150 is what the expression computes before the ceiling step.",
      "Ceiling via the identity: (21150 + 5 − 1)/5 = 21154/5 = 4230 in SQLite integer division (5 × 4230 = 21150, remainder floored away) — the true average 4250 minus the sheet average 20, error_amount = 4230.",
    ],
    time: "O(n) — one scan, string repair inline",
    space: "O(1) — aggregates only",
    followUps: [
      "How many salaries did the corruption actually change? Compare salary to its repaired value and count the mismatches.",
      "The sheet instead dropped every digit after the first — which string function family replaces REPLACE for that (SUBSTR slicing, or a WITH RECURSIVE walk)?",
    ],
    related: ["fix-names-in-a-table", "top-earners"],
    order: "any",
    xp: 20,
  },
  {
    slug: "station-shortest-longest",
    statement:
      "STATION holds weather stations with their city names and coordinates. Produce exactly two rows: the SHORTEST city name — ties broken alphabetically — tagged 'shortest', and the LONGEST city name, ties again alphabetical, tagged 'longest'. Output columns: which, city.",
    examples: [
      {
        input: "cities: Aba, Zoe, Ono, Beta, Gamma, Riverton, Springvale, Delta",
        output: "shortest · Aba  /  longest · Springvale",
        explanation:
          "Aba, Zoe and Ono all measure 3 characters — the alphabetical tie-break hands 'shortest' to Aba. Springvale, at 10 characters, stands alone as 'longest'.",
      },
    ],
    constraints: [
      "two rows total, tagged 'shortest' and 'longest' in the which column",
      "ties on name length resolve alphabetically (city ASC) at both ends",
      "length is the character count of the name (LENGTH)",
    ],
    breakdown: [
      "This is really two independent top-1 questions wearing one output: pick the city with minimal length, pick the one with maximal length, and tag each. The sort keys point in opposite directions — LENGTH ASC for the first, LENGTH DESC for the second — so no single ORDER BY over one scan can produce both winners. Two SELECTs, each with its own sort and LIMIT 1, glued together with UNION ALL, is the honest shape.",
      "The syntax trap is the whole difficulty: in a compound SELECT (UNION / UNION ALL), SQLite allows exactly ONE ORDER BY, and it must trail the LAST branch — it sorts the COMBINED result, not the branches. Writing ORDER BY LENGTH(city) after the first SELECT is a syntax error, and writing one shared ORDER BY at the end can't compute per-branch top-1s either. The escape hatch is wrapping each sorted, LIMITed branch in its own subquery: the ORDER BY + LIMIT executes inside the subquery, before the union ever sees the rows.",
      "Each branch sorts on the two-key contract — LENGTH(city) first, city ASC as the deterministic tie-breaker. Without the second key, the three-way tie at length 3 (Aba, Zoe, Ono) would be decided by whatever order the engine happens to read the table in. The tag literals ('shortest' AS which, then bare 'longest') ride along in the SELECT list and name each row's origin.",
    ],
    edges: [
      "A single trailing ORDER BY after the UNION ALL sorts the merged two rows — it cannot produce per-branch winners.",
      "The city ASC tie-break must live INSIDE each subquery — outside the sort is meaningless once LIMIT 1 has already fired.",
      "If every city had the same length, 'shortest' and 'longest' name the same city and it appears twice — deduping is a deliberate follow-up, not a bug to silently fix.",
      "UNION ALL, not UNION: the tags already make the rows distinct, and UNION would pay a dedup sort for nothing.",
    ],
    ladder: [
      { title: "Brute force — two round trips", body: "Query the shortest, query the longest, stitch and label in application code. Two queries where one compound statement suffices." },
      { title: "The pattern — wrapped top-1 branches", body: "Each branch is a subquery with its own ORDER BY + LIMIT 1; UNION ALL stacks the two tagged winners." },
      { title: "The optimal idea — sort before you merge", body: "O(n log n) across the two sorts. The learning: compound SELECTs merge RESULT SETS — any per-branch ordering must complete inside a subquery before the merge." },
    ],
    approach: "Two wrapped top-1 subqueries (opposite sort keys) stacked with UNION ALL",
    schema: {
      ddl: `CREATE TABLE STATION (
  id     INTEGER PRIMARY KEY,
  city   TEXT NOT NULL,
  lat_n  REAL NOT NULL,
  long_w REAL NOT NULL
);`,
      seed: `INSERT INTO STATION (id, city, lat_n, long_w) VALUES
  (1,'Aba',48.7,30.2),(2,'Zoe',50.3,31.9),(3,'Ono',52.9,29.5),
  (4,'Beta',56.4,33.1),(5,'Gamma',59.1,28.8),(6,'Riverton',61.2,32.4),
  (7,'Springvale',63.8,27.6),(8,'Delta',66.0,30.9);`,
      tables: [
        { name: "STATION", note: "8 stations; a 3-way length tie at the short end" },
      ],
    },
    code: `SELECT 'shortest' AS which, city
FROM (
    SELECT city FROM STATION
    ORDER BY LENGTH(city) ASC, city ASC
    LIMIT 1                      -- shortest, alphabetically-first on ties
)
UNION ALL
SELECT 'longest', city
FROM (
    SELECT city FROM STATION
    ORDER BY LENGTH(city) DESC, city ASC
    LIMIT 1                      -- longest, alphabetically-first on ties
);`,
    walkthrough: [
      "Shortest branch: lengths are Aba/Zoe/Ono 3, Beta 4, Gamma/Delta 5, Riverton 8, Springvale 10 — ORDER BY length ASC then city ASC puts Aba, Zoe, Ono in alphabetical order at the top; LIMIT 1 keeps Aba.",
      "Longest branch: sorting length DESC leaves Springvale (10) first; LIMIT 1 keeps it — the tag literals label each winner's row.",
      "UNION ALL stacks the two single-row results: ('shortest','Aba') and ('longest','Springvale') — no shared ORDER BY, because each branch's sort already fired inside its subquery.",
    ],
    time: "O(n log n) — two sorts of the station list",
    space: "O(1) beyond the two output rows",
    followUps: [
      "All cities the same length: shortest and longest coincide — rewrite so the duplicated city collapses to one row.",
      "Shortest and longest DISTINCT city names — add DISTINCT inside the inner SELECTs and predict which stations change.",
    ],
    related: ["station-median", "top-five-artists"],
    order: "any",
    xp: 20,
  },
  {
    slug: "asian-population",
    statement:
      "Two tables: COUNTRY (code, name, continent) and CITY (name, country_code, population). Report the TOTAL population of all cities located in Asian countries, as a single column asian_population.",
    examples: [
      {
        input: "Beijing 21.54M + Shanghai 26.3M (China) · Tokyo 13.96M + Osaka 2.75M (Japan) · Mumbai 20.41M + Delhi 32.9M (India) — plus French and Brazilian cities",
        output: "117860000",
        explanation:
          "The seven Asian cities sum to 117,860,000 — Paris, Lyon, Rio de Janeiro and Sao Paulo are dropped because their countries' continent is not Asia.",
      },
    ],
    constraints: [
      "the filter attribute (continent) lives on COUNTRY — join first, then filter",
      "sum city POPULATIONS, not city counts",
      "exactly one row, one column: asian_population",
    ],
    breakdown: [
      "The column you filter on is not on the table you aggregate: continent belongs to the parent COUNTRY, population to the child CITY. That mismatch forces a JOIN before the WHERE can even be written — the canonical 'filter on the joined table' pattern. The join key is the country code, and after the join each row carries both a city's population and its country's continent, so WHERE k.continent = 'Asia' becomes an ordinary row filter.",
      "INNER JOIN semantics decide who exists at all. A country with zero cities contributes nothing (there is no child row to join), and — the mirror-image trap — a city whose country_code has no COUNTRY row would vanish too. The seed keeps every Asian country populated, so nothing is lost; but in the wild this query silently shrinks whenever referential data is missing. A LEFT JOIN from CITY would only help the orphan direction; the childless-country direction is invisible either way, because SUM has no row to sum.",
      "The aggregation grain is deliberately degenerate: no GROUP BY means the filtered rows collapse into ONE global SUM. That is also why the output can't grow a city column without breaking — the moment you select a non-aggregated column alongside SUM, you've asked for a grouped query. And note the aggregate family choice: COUNT(*) over the same filtered set would answer 7 (cities), SUM(population) answers 117,860,000 (people) — same rows, different question.",
    ],
    edges: [
      "WHERE k.continent = 'Asia' references the JOINED parent — no amount of filtering on c.* alone can express it.",
      "INNER JOIN silently drops childless countries AND orphaned cities — decide whether that's the spec before trusting the total.",
      "No GROUP BY: the whole filtered set collapses to one SUM row; adding a raw column to the SELECT would change the query's shape entirely.",
      "SUM ignores NULLs but not missing rows — populations here are NOT NULL integers, so the total is exact (no float drift).",
    ],
    ladder: [
      { title: "Brute force — two queries and a merge", body: "Fetch Asian country codes, then SUM populations WHERE country_code IN (…). Two round trips; the JOIN does it in one pass." },
      { title: "The pattern — join, filter, aggregate", body: "JOIN city → country on the code, WHERE continent = 'Asia', SUM(population). Three clauses, one sentence." },
      { title: "The optimal idea — one filtered scan", body: "O(cities + countries) with a hash join. The grain insight: no GROUP BY is a decision, not an omission — one row out means a global aggregate." },
    ],
    approach: "JOIN city → country, filter continent = 'Asia', SUM the population",
    schema: {
      ddl: `CREATE TABLE COUNTRY (
  code      TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  continent TEXT NOT NULL
);
CREATE TABLE CITY (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES COUNTRY(code),
  population   INTEGER NOT NULL
);`,
      seed: `INSERT INTO COUNTRY (code, name, continent) VALUES
  ('CHN','China','Asia'),('JPN','Japan','Asia'),('IND','India','Asia'),
  ('FRA','France','Europe'),('BRA','Brazil','South America');
INSERT INTO CITY (id, name, country_code, population) VALUES
  (1,'Beijing','CHN',21540000),(2,'Shanghai','CHN',26300000),
  (3,'Tokyo','JPN',13960000),(4,'Osaka','JPN',2750000),
  (5,'Mumbai','IND',20410000),(6,'Delhi','IND',32900000),
  (7,'Paris','FRA',2148000),(8,'Lyon','FRA',516000),
  (9,'Rio de Janeiro','BRA',6748000),(10,'Sao Paulo','BRA',12330000);`,
      tables: [
        { name: "COUNTRY", note: "5 countries across 3 continents" },
        { name: "CITY", note: "10 cities; 7 sit in Asian countries" },
      ],
    },
    code: `SELECT
    SUM(c.population) AS asian_population
FROM CITY c
JOIN COUNTRY k ON k.code = c.country_code   -- continent lives on the parent
WHERE k.continent = 'Asia';`,
    walkthrough: [
      "The join attaches each city to its country's row — Beijing rides with ('CHN','China','Asia'), Paris with ('FRA','France','Europe').",
      "WHERE k.continent = 'Asia' keeps exactly the 7 cities of CHN, JPN and IND; the French and Brazilian rows are filtered out after the join.",
      "SUM over the survivors with no GROUP BY: 21,540,000 + 26,300,000 + 13,960,000 + 2,750,000 + 20,410,000 + 32,900,000 = 117,860,000 — one row, one column.",
    ],
    time: "O(cities + countries) — one hash-joined scan",
    space: "O(1) — a single aggregate row",
    followUps: [
      "Per-continent totals — GROUP BY k.continent; which continents vanish from the output entirely, and why?",
      "COUNT(*) vs SUM(population) over the same filtered join — what distinct business question does each answer?",
    ],
    related: ["company-hierarchy-counts", "all-people-report-to-the-given-manager"],
    order: "any",
    xp: 10,
  },
  {
    slug: "challenges",
    statement:
      "Hackers create challenges: a Challenges log references the creator's hacker_id. Report every hacker with the number of challenges they created — with one twist: if several hackers TIE for the maximum count, ALL of them are excluded from the report; a maximum held by exactly one hacker stays. Hackers with zero challenges still appear.",
    examples: [
      {
        input: "counts: Ada 5 · Ben 3 · Cy 3 · Dee 2 · Fay 0",
        output: "Ada 5 · Ben 3 · Cy 3 · Dee 2 · Fay 0",
        explanation:
          "The maximum of 5 belongs to Ada alone, so nobody is excluded. Had the top count been 3, Ben and Cy would both be tied at the max — and both would vanish.",
      },
    ],
    constraints: [
      "every hacker appears exactly once, including hackers with zero challenges",
      "exclusion applies ONLY to hackers tied AT the maximum — ties below the max stay",
      "order by created DESC, then hacker_id",
    ],
    breakdown: [
      "Zero-count survival is a join-shape decision before it's a filter decision: Hackers LEFT JOIN Challenges keeps Fay's row with no challenge match, and COUNT(c.challenge_id) over the NULL match reads 0 — the LEFT JOIN manufactures the zero row and counting the RIGHT side's column is what measures it. An INNER JOIN would delete Fay before any logic runs, and no WHERE could bring her back.",
      "The exclusion needs MAX of a COUNT — an aggregate of an aggregate, which WHERE and HAVING cannot see (HAVING filters per-group; this compares a group against the max ACROSS groups). The derived-table pattern is the only honest route: a counts CTE produces one row per hacker, and a maxc CTE takes MAX(created) over those rows. Two stacked grains, each doing one job.",
      "The predicate itself has two branches: keep rows with created < max unconditionally, and keep rows with created = max only when the max bucket holds exactly ONE row — (SELECT COUNT(*) FROM counts WHERE created = max) = 1. Reading the max twice via scalar subqueries re-evaluates it per row, which is harmless at report scale; the point is the logic: tied-max players vote each other off, a lone leader survives. Test any implementation against BOTH worlds — unique max and shared max — before trusting it.",
    ],
    edges: [
      "LEFT JOIN, not JOIN — an inner join erases the zero-count hacker and the report undercounts.",
      "COUNT(c.challenge_id), the right side's column — COUNT(*) agrees here but is the wrong reflex once the join can fan out.",
      "Ties BELOW the maximum survive untouched — only the top bucket is subject to the exclusion vote.",
      "A shared max must remove ALL tied rows and only those — seed a second max-holder and re-check before shipping.",
    ],
    ladder: [
      { title: "Brute force — eyeball the max", body: "Query the counts, look at the top value, hard-code a filter. Breaks the moment the data changes — the max must be computed, not observed." },
      { title: "The pattern — CTE counts, CTE max", body: "counts groups per hacker (LEFT JOIN keeps zeros); maxc takes MAX over counts. WHERE can then read the scalar max." },
      { title: "The optimal idea — a two-branch predicate", body: "created < max OR (created = max AND the max bucket is a singleton). O(n log n) for the final sort; the window version (MAX() OVER ()) trades subqueries for a single pass." },
    ],
    approach: "LEFT JOIN counts in a CTE, then a two-branch WHERE that spares only a unique max",
    schema: {
      ddl: `CREATE TABLE Hackers (
  hacker_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Challenges (
  challenge_id INTEGER PRIMARY KEY,
  hacker_id    INTEGER NOT NULL REFERENCES Hackers(hacker_id)
);`,
      seed: `INSERT INTO Hackers (hacker_id, name) VALUES
  (1,'Ada'),(2,'Ben'),(3,'Cy'),(4,'Dee'),(5,'Fay');
INSERT INTO Challenges (challenge_id, hacker_id) VALUES
  (11,1),(12,1),(13,1),(14,1),(15,1),
  (21,2),(22,2),(23,2),(31,3),(32,3),(33,3),
  (41,4),(42,4);`,
      tables: [
        { name: "Hackers", note: "5 hackers; Fay has created nothing" },
        { name: "Challenges", note: "13 challenges — Ada 5, Ben 3, Cy 3, Dee 2" },
      ],
    },
    code: `WITH counts AS (
    SELECT
        h.hacker_id,
        h.name,
        COUNT(c.challenge_id) AS created   -- right side: 0 when no match
    FROM Hackers h
    LEFT JOIN Challenges c ON c.hacker_id = h.hacker_id
    GROUP BY h.hacker_id, h.name
),
maxc AS (
    SELECT MAX(created) AS m FROM counts   -- max of a max-of-counts: CTE stacked on CTE
)
SELECT hacker_id, name, created
FROM counts
WHERE created < (SELECT m FROM maxc)
   OR (   created = (SELECT m FROM maxc)
      AND (SELECT COUNT(*) FROM counts WHERE created = (SELECT m FROM maxc)) = 1 )
ORDER BY created DESC, hacker_id;`,
    walkthrough: [
      "counts: the LEFT JOIN pairs every hacker with their challenges — Ada 5, Ben 3, Cy 3, Dee 2, and Fay's unmatched row counts COUNT(challenge_id) = 0.",
      "maxc: MAX over those counts is 5 — and the inner COUNT(*) finds exactly ONE row sitting at 5, so the unique-max branch is armed.",
      "The WHERE admits Ben, Cy, Dee, Fay via created < 5, and Ada via created = 5 with a singleton bucket — all five rows survive, ordered 5, 3, 3, 2, 0 (Ben before Cy by hacker_id).",
    ],
    time: "O(n log n) — the final ORDER BY dominates",
    space: "O(h) — one row per hacker in the CTE",
    followUps: [
      "Seed a second 5 for Ben — verify both 5s vanish and the report now starts at 3.",
      "Rewrite the exclusion with windows: MAX(created) OVER () and COUNT(*) OVER (PARTITION BY created) — no scalar subqueries, one pass.",
    ],
    related: ["top-earners", "company-hierarchy-counts"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "occupations-pivot",
    statement:
      "Occupations lists people one per row as a Doctor, Professor, Singer or Actor. Reshape it: one output row per alphabetical rank within each occupation, one column per occupation — names sorted alphabetically down each column, and NULL wherever an occupation runs out of people. Output columns: Doctor, Professor, Singer, Actor.",
    examples: [
      {
        input: "Doctors: Alice, Bob · Professors: Carol, Dave, Eve · Singers: Frank, Grace · Actors: Henry, Ivy, Jack",
        output: "Alice · Carol · Frank · Henry  /  Bob · Dave · Grace · Ivy  /  NULL · Eve · NULL · Jack",
        explanation:
          "Professors and Actors have a third alphabetical member; the two-name occupations pad their third row with NULL.",
      },
    ],
    constraints: [
      "names are alphabetical WITHIN each occupation column",
      "row k of the output holds every occupation's k-th name — the rank is the row axis",
      "shorter occupations pad with NULL, never with blanks or dummy names",
    ],
    breakdown: [
      "Engines without a PIVOT keyword build one in two steps, and this problem is the canonical demo. Step 1 manufactures the ROW AXIS: the tall table has no notion of 'first Doctor', so ROW_NUMBER() OVER (PARTITION BY occupation ORDER BY name) assigns every name its alphabetical position within its occupation. That rank is what the output's rows will be grouped by — the reshape happens the moment each name receives one.",
      "Step 2 is conditional aggregation: GROUP BY rn, and for each occupation a CASE WHEN occupation = 'Doctor' THEN name END — NULL for every non-Doctor row in the group. MAX() over that column collapses the group and picks the single surviving non-NULL value, or NULL if the occupation has no k-th member at all. The padding is free: NULL falls out of the CASE default, no IFNULL or COALESCE scaffolding needed. MAX vs MIN is irrelevant here — each cell holds at most one name — but an aggregate is REQUIRED: a bare CASE in the SELECT would demand the column in GROUP BY and destroy the pivot.",
      "This query is one member of a reshape family worth recognizing on sight: a fixed-column pivot (this one, like reformat-department-table), a UNION-based reshape where each branch becomes a row, and de-pivots that melt columns back down. The axis trick generalizes — whatever integer you can compute per row (rank, date offset, bucket number) can become the new row identity, and conditional aggregation builds the new columns on top of it.",
    ],
    edges: [
      "GROUP BY rn — not by name: after ranking, the rank is the row's identity, and names must stay free to move into columns.",
      "ORDER BY rn in the outer query — without it the output row order is whatever the grouping pass leaves behind.",
      "MAX is doing structural work, not comparison work — each (rn, occupation) cell holds at most one name, and the aggregate exists to collapse the group.",
      "The partition is per occupation: a person listed under two occupations earns two independent ranks and can legitimately appear in two columns.",
    ],
    ladder: [
      { title: "Brute force — four queries and a zip", body: "Select each occupation's names ordered, then interleave and NULL-pad in application code. Four round trips and fragile alignment logic." },
      { title: "The pattern — rank axis + conditional aggregation", body: "ROW_NUMBER per occupation builds the row axis; GROUP BY rank with a MAX(CASE) per column pivots in one statement." },
      { title: "The optimal idea — the two-step PIVOT idiom", body: "O(n log n) for the partition sorts. The learning: any 'rows → columns' request decomposes into 'invent the new row key, then aggregate across the old rows'." },
    ],
    approach: "ROW_NUMBER per occupation, then conditional MAX aggregation grouped by rank",
    schema: {
      ddl: `CREATE TABLE Occupations (
  name       TEXT NOT NULL,
  occupation TEXT NOT NULL
);`,
      seed: `INSERT INTO Occupations (name, occupation) VALUES
  ('Alice','Doctor'),('Bob','Doctor'),
  ('Carol','Professor'),('Dave','Professor'),('Eve','Professor'),
  ('Frank','Singer'),('Grace','Singer'),
  ('Henry','Actor'),('Ivy','Actor'),('Jack','Actor');`,
      tables: [
        { name: "Occupations", note: "10 people in 4 occupations; Professors and Actors reach rank 3" },
      ],
    },
    code: `WITH numbered AS (
    SELECT
        name,
        occupation,
        ROW_NUMBER() OVER (PARTITION BY occupation ORDER BY name) AS rn
    FROM Occupations
)
SELECT
    MAX(CASE WHEN occupation = 'Doctor'    THEN name END) AS Doctor,
    MAX(CASE WHEN occupation = 'Professor' THEN name END) AS Professor,
    MAX(CASE WHEN occupation = 'Singer'    THEN name END) AS Singer,
    MAX(CASE WHEN occupation = 'Actor'     THEN name END) AS Actor
FROM numbered
GROUP BY rn
ORDER BY rn;`,
    walkthrough: [
      "numbered ranks within each partition: Doctor Alice 1, Bob 2 · Professor Carol 1, Dave 2, Eve 3 · Singer Frank 1, Grace 2 · Actor Henry 1, Ivy 2, Jack 3.",
      "GROUP BY rn assembles rank rows: rank 1 holds one name per occupation, rank 3 holds only Eve and Jack — every other (rn, occupation) cell is NULL because the CASE returned NULL.",
      "MAX collapses each group's single survivor per column: row 1 (Alice, Carol, Frank, Henry), row 2 (Bob, Dave, Grace, Ivy), row 3 (NULL, Eve, NULL, Jack) — NULL padding straight from the CASE default, ordered by rn.",
    ],
    time: "O(n log n) — the per-partition sorts",
    space: "O(n) — the ranked CTE",
    followUps: [
      "A fifth occupation arrives tomorrow — enumerate everything in this query you must touch, and why one statement can't invent new columns dynamically.",
      "Rank by name LENGTH within occupation instead of alphabetically — which single clause changes, and what new ties appear?",
    ],
    related: ["reformat-department-table", "station-median", "ratings-histogram"],
    order: "exact",
    xp: 20,
  },
];
