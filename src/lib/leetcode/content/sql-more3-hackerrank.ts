// Deep-dives — HackerRank band expansion, batch 4 (6 problems).
// Re-authored from the canonical HackerRank SQL tasks: own tables,
// custom 95xx ids, original phrasing — never copied problem text.
// Registry id map: 9515 the-report · 9516 top-competitors · 9517 the-pads ·
// 9518 placements · 9519 symmetric-pairs · 9520 fifteen-days-of-learning.
// Engine-verified by scripts/lc-sql-verify.ts; self-checked via bun:sqlite
// at authoring time.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_HACKERRANK: LcSqlDive[] = [
  {
    slug: "the-report",
    statement:
      "Students holds one row per student: id, name and marks; Grades maps each mark band to a grade through min_mark and max_mark, both bounds inclusive. Produce the grade sheet: every student's grade, their name — but ONLY when the grade is 8 or higher; lower grades print NULL instead — and their marks. The NULL is a display rule, not a missing join: low scorers must still appear. Order by grade descending, then name, then marks.",
    examples: [
      {
        input:
          "students: Kristeen 90 · Priya 80 · Heraldo 74 · Julia 65 · Amina 21 · Samantha 25 — grade 8 covers 70-79, grade 9 covers 80-100",
        output: "9 Kristeen 90 · 9 Priya 80 · 8 Heraldo 74 · 7 (null) 65 · 3 (null) 21 · 3 (null) 25",
        explanation:
          "Heraldo's 74 lands in grade 8 — the first band where names appear. Julia, Amina and Samantha sit below the line: their grades print, their names print as NULL, their rows never disappear.",
      },
    ],
    constraints: [
      "each student's marks fall in exactly one band: BETWEEN matches min_mark AND max_mark inclusively",
      "names appear only for grade >= 8; every lower grade keeps its row with a NULL name",
      "order by grade DESC, then name, then marks",
    ],
    breakdown: [
      "The grade lookup has no single join key: a student's marks match a RANGE of the Grades table, so the join predicate is s.marks BETWEEN g.min_mark AND g.max_mark. That makes it a non-equi join — no equality anywhere in the ON clause, so the engine pairs every student with every grade and keeps only the bands that bracket the score. The result is only as trustworthy as the band design: the seed's nine bands tile 0-100 with no gaps and no overlaps, which is what guarantees one grade row per student. Move one boundary and a student either falls through the cracks (no matching grade — silently dropped by the inner join) or fans out into two rows (overlapping bands both claim the score).",
      "The name-or-NULL column is a CASE in the SELECT list: CASE WHEN g.grade >= 8 THEN s.name END — with no ELSE, so every grade below 8 yields NULL by default. The famous property of this report is that the low scorers are NOT filtered away: the CASE only masks the name, the row itself survives, and a WHERE that removed low grades would be answering a different question entirely. Reading it back, a NULL name in this output is information — 'this student scored below the name threshold' — not a data defect. That inversion, NULL as a designed display state, is why the conditional-column pattern shows up in every report that must render absence without deleting it.",
      "The ORDER BY has three keys and the middle one can be NULL. SQLite sorts NULLs first within an ascending key (verified in the sandbox: NULL comes before every string), so a NULL name would sit at the TOP of any band it shared with real names — here every row below grade 8 carries one, and inside a grade the NULL rows are ordered entirely by the marks tail: 21 before 25. Portability note: some engines default NULLs LAST in ascending order, so the same query can order its NULL band differently elsewhere — pin it explicitly with NULLS FIRST/LAST or a COALESCE sentinel when the contract matters. In this output the grade key quarantines the question anyway, since all rows of one grade share the same NULL-ness; the engine-verified order is grade DESC, then name ASC with NULLs first, then marks ASC.",
    ],
    edges: [
      "CASE without ELSE yields NULL — exactly the display rule wanted here; adding ELSE '' would print empty strings, which reads as corrupt data instead of a deliberate mask.",
      "BETWEEN is inclusive on BOTH bounds: 80 belongs to the 80-100 band (grade 9), not grade 8 — and the bands must not overlap, or a student fans out into two output rows.",
      "A marks value outside every band (say 101) silently drops — the inner join keeps only bracketed students; a LEFT JOIN from Students would keep it with a NULL grade.",
      "SQLite sorts NULLs first in ASC (engine-verified): the NULL-name rows inside a grade are therefore decided by the marks tail, 21 then 25.",
    ],
    ladder: [
      { title: "Brute force — band lookup in code", body: "Fetch both tables, scan the grade bands per student in application code, mask names below 8 while printing. Three loops and a formatting rule where one predicate and one CASE do the work." },
      { title: "The pattern — range join + conditional column", body: "JOIN Grades ON marks BETWEEN min_mark AND max_mark, then CASE WHEN grade >= 8 THEN name END builds the masked column in the same pass." },
      { title: "The optimal idea — masking is not deleting", body: "O(students × grades) nested loop at interview scale — the banding table is tiny. The transferable idea: a lookup by RANGE is still a join, and a conditional column is a CASE in the SELECT, never a WHERE." },
    ],
    approach: "Non-equi join on the mark band, then a CASE column that masks names below grade 8",
    schema: {
      ddl: `CREATE TABLE Students (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  marks INTEGER NOT NULL
);
CREATE TABLE Grades (
  grade    INTEGER PRIMARY KEY,
  min_mark INTEGER NOT NULL,
  max_mark INTEGER NOT NULL
);`,
      seed: `INSERT INTO Students (id, name, marks) VALUES
  (1,'Kristeen',90),(2,'Priya',80),(3,'Heraldo',74),
  (4,'Julia',65),(5,'Amina',21),(6,'Samantha',25);
INSERT INTO Grades (grade, min_mark, max_mark) VALUES
  (1,0,9),(2,10,19),(3,20,29),(4,30,39),(5,40,49),
  (6,50,59),(7,60,69),(8,70,79),(9,80,100);`,
      tables: [
        { name: "Students", note: "6 students — Priya's 80 sits exactly on the grade-9 floor, Heraldo's 74 is the grade-8 band where names start showing, Amina and Samantha share grade 3 under NULL names" },
        { name: "Grades", note: "9 bands tiling 0-100 with no gaps and no overlaps — the tiling is what keeps the BETWEEN join 1:1" },
      ],
    },
    code: `SELECT
    g.grade,
    CASE WHEN g.grade >= 8 THEN s.name END AS name,  -- masked, not deleted
    s.marks
FROM Students s
JOIN Grades g
  ON s.marks BETWEEN g.min_mark AND g.max_mark       -- range (non-equi) join
ORDER BY g.grade DESC, name, s.marks;`,
    walkthrough: [
      "The join brackets each student: 90 and 80 land in grade 9 (80 is the band's inclusive floor), 74 in grade 8, 65 in grade 7, and 21 and 25 in grade 3 — one grade row per student because the bands tile cleanly.",
      "The CASE prints names for grades 8 and 9 — Kristeen, Priya, Heraldo — and returns NULL for Julia, Amina and Samantha; their rows survive the projection untouched, which is the whole point of the mask.",
      "ORDER BY grade DESC gives the band sequence 9, 9, 8, 7, 3, 3; then name (Kristeen before Priya; the NULL bands ordered by the marks tail — SQLite sorts NULLs first in ASC, verified in the engine), then marks: (9,'Kristeen',90), (9,'Priya',80), (8,'Heraldo',74), (7,NULL,65), (3,NULL,21), (3,NULL,25).",
    ],
    time: "O(students × grades) — a non-equi join is a filtered nested loop; 6 × 9 pairings here",
    space: "O(1) beyond the output rows",
    followUps: [
      "Count students per grade — GROUP BY g.grade and compare the band sizes; which grades would vanish entirely if a cohort skipped a band?",
      "Rewrite the name rule with COALESCE(..., 'REDACTED') — then explain why that changes the sort position of low scorers once ORDER BY name leads the key chain.",
    ],
    related: ["asian-population", "type-of-triangle"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "top-competitors",
    statement:
      "Four tables describe a contest: Hackers (hacker_id, name), Challenges (challenge_id, hacker_id, difficulty_level), Difficulty (difficulty_level, score — the FULL score for that level) and Submissions (submission_id, hacker_id, challenge_id, score). A submission earns a full score when its score EQUALS the full score of its challenge's difficulty level. Report every hacker who achieved a full score on more than one challenge: their hacker_id, name and the number of full-score submissions. Order by that count descending, then hacker_id ascending.",
    examples: [
      {
        input: "full scores: Denise on challenges 101 and 102 · Oscar on 107 and 108 · Ivan on 103 only · Marta and Talia never",
        output: "1 Denise 2 · 4 Oscar 2",
        explanation:
          "Ivan's single full score fails the 'more than one' bar — including him is the most common wrong answer. Denise and Oscar tie at 2, and the hacker_id tail puts Denise first.",
      },
    ],
    constraints: [
      "a full score means submission.score equals the FULL score of the challenge's difficulty level — the bar varies by level and can never be hard-coded",
      "more than one: a hacker with exactly one full score does NOT qualify (HAVING COUNT(*) > 1)",
      "order by full_score_count DESC, then hacker_id ASC",
    ],
    breakdown: [
      "The word 'full' cannot be evaluated on Submissions alone: a 100 might be perfect on level 4 and a disaster on level 1. The chain is Submissions → Challenges (on challenge_id, which also carries the difficulty_level stamp) → Difficulty (on difficulty_level, which supplies that level's full score), plus Hackers for the name. Four tables, three equalities, one row per submission carrying both its actual score and the bar it must clear. This is the canonical chain join: each hop adds one attribute the previous hop could not see, and the final comparison — score meets bar — only becomes writable at the end of the chain.",
      "'More than one' is a group-level property, which is precisely what HAVING exists for: WHERE filters rows before grouping, HAVING filters groups after aggregation. The inner query keeps only full-score submissions, GROUP BY hacker collapses them, and HAVING COUNT(*) > 1 keeps hackers holding two or more — Ivan's single full score falls out, and that is the trap the problem is built around: any reading like 'best score on more than one challenge' or a >= 1 slip admits him. COUNT(*) over the filtered rows counts full-score submissions; if the same challenge could be aced twice, COUNT(DISTINCT challenge_id) would be the stricter contract — a one-word decision the wording forces you to notice.",
      "The output contract is count DESC then hacker_id ASC, and the seed deliberately ties: Denise and Oscar both hold two. Without the id tail, the engine emits the tie in whatever order its plan produces — an order-exact grader calls that wrong even when the values are right, so any top-N report graded on order needs a total sort-key chain with the row id as the conventional final key. Note also who VANISHES: hackers with zero full scores contribute no rows to the filtered set, so the inner-join pipeline never sees Marta or Talia — no LEFT JOIN is wanted here, because the report is defined only over full scorers and padding it with zeros would be a different question.",
    ],
    edges: [
      "Ivan is the planted trap: one full score is not 'more than one' — HAVING COUNT(*) > 1, never >= 1.",
      "The bar is per level: 100 is full on level 4 but 30 is full on level 2 — hard-coding 100 would throw away Oscar's level-2 ace.",
      "Challenges.hacker_id (the creator) and Submissions.hacker_id (the submitter) share a column name and are different people in the seed — submissions link through challenge_id, never through the creator's id.",
      "Two hackers tie at two full scores: the hacker_id tail is what makes the output order deterministic.",
    ],
    ladder: [
      { title: "Brute force — eyeball the perfect scores", body: "Pull every submission, manually match each to its challenge's level max, tally per hacker in a spreadsheet. The engine does all three steps in one chained pass." },
      { title: "The pattern — chain join, filter, group, HAVING", body: "Submissions ⋈ Challenges ⋈ Difficulty (⋈ Hackers for the name), WHERE score = level score, GROUP BY hacker, HAVING COUNT(*) > 1." },
      { title: "The optimal idea — filter early, count survivors", body: "Comparing score to the level's max before the grouping shrinks the aggregated set to full scores only, so the COUNT counts survivors, not candidates. O(submissions) with hash joins; a window version would add nothing but noise." },
    ],
    approach: "Chain Submissions → Challenges → Difficulty, keep score = level max, GROUP BY hacker, HAVING COUNT(*) > 1",
    schema: {
      ddl: `CREATE TABLE Hackers (
  hacker_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Challenges (
  challenge_id     INTEGER PRIMARY KEY,
  hacker_id        INTEGER NOT NULL REFERENCES Hackers(hacker_id),
  difficulty_level INTEGER NOT NULL
);
CREATE TABLE Difficulty (
  difficulty_level INTEGER PRIMARY KEY,
  score            INTEGER NOT NULL
);
CREATE TABLE Submissions (
  submission_id INTEGER PRIMARY KEY,
  hacker_id     INTEGER NOT NULL REFERENCES Hackers(hacker_id),
  challenge_id  INTEGER NOT NULL REFERENCES Challenges(challenge_id),
  score         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Hackers (hacker_id, name) VALUES
  (1,'Denise'),(2,'Ivan'),(3,'Marta'),(4,'Oscar'),
  (5,'Talia'),(6,'Priya'),(7,'Quinn');
INSERT INTO Difficulty (difficulty_level, score) VALUES
  (1,20),(2,30),(3,50),(4,100);
INSERT INTO Challenges (challenge_id, hacker_id, difficulty_level) VALUES
  (101,6,4),(102,6,3),(103,7,4),(104,7,2),
  (105,6,3),(106,7,4),(107,6,2),(108,7,4),(109,6,1);
INSERT INTO Submissions (submission_id, hacker_id, challenge_id, score) VALUES
  (1,1,101,100),(2,1,102,50),
  (3,2,103,100),(4,2,104,25),
  (5,3,105,45),(6,3,106,90),
  (7,4,107,30),(8,4,108,100),
  (9,5,109,15),(10,5,103,85);`,
      tables: [
        { name: "Hackers", note: "7 rows — five submitters (1-5) plus two challenge authors (6, 7) who never submit" },
        { name: "Challenges", note: "9 challenges; hacker_id here is the CREATOR, not the submitter" },
        { name: "Difficulty", note: "4 levels; score IS that level's full mark (level 2 → 30, level 4 → 100)" },
        { name: "Submissions", note: "10 submissions — Denise and Oscar ace two each, Ivan exactly one (the trap), Marta and Talia none" },
      ],
    },
    code: `WITH full_scores AS (
    SELECT s.hacker_id, h.name
    FROM Submissions s
    JOIN Challenges c
      ON c.challenge_id = s.challenge_id               -- hop 1: which challenge
    JOIN Difficulty d
      ON d.difficulty_level = c.difficulty_level       -- hop 2: its level's bar
    JOIN Hackers h
      ON h.hacker_id = s.hacker_id                     -- hop 3: the submitter's name
    WHERE s.score = d.score                            -- full score: meets the bar
)
SELECT
    hacker_id,
    name,
    COUNT(*) AS full_score_count
FROM full_scores
GROUP BY hacker_id, name
HAVING COUNT(*) > 1                    -- MORE than one, not "at least one"
ORDER BY full_score_count DESC, hacker_id;`,
    walkthrough: [
      "The chain attaches a bar to every submission: submission 1 (score 100) rides challenge 101 → level 4 → bar 100 → full; submission 4 (score 25) rides challenge 104 → level 2 → bar 30 → short.",
      "The WHERE keeps exactly the full scores: submissions 1 and 2 (Denise), 3 (Ivan), 7 and 8 (Oscar) — five rows — while Ivan's 25, Marta's 45 and 90, and Talia's 15 and 85 fall short of their bars.",
      "Groups: Denise 2, Ivan 1, Oscar 2. HAVING > 1 evicts Ivan; the tie between Denise (id 1) and Oscar (id 4) resolves by hacker_id: (1,'Denise',2), (4,'Oscar',2).",
    ],
    time: "O(submissions) for the chained joins plus O(full scores) for the grouping",
    space: "O(full scores) — the filtered chain before grouping",
    followUps: [
      "Denise aces challenge 101 twice (two submissions, both 100): decide between COUNT(*) and COUNT(DISTINCT challenge_id) and defend which one the wording wants.",
      "Report every hacker's full-score count INCLUDING zeros — which join shape brings Marta and Talia back, and what does COUNT do to their row?",
    ],
    related: ["challenges", "classes-more-than-5-students"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "the-pads",
    statement:
      "Occupations lists people one per row: name and occupation. Build one combined report with two shapes of rows. For every PERSON: their name followed by the first letter of their occupation in parentheses, like Sam(D), ordered by name. For every OCCUPATION: one sentence per occupation — 'There are a total of N singers.' — lowercase, pluralized, carrying its head-count, ordered by count then occupation name. All rows come out of one query, person rows first.",
    examples: [
      {
        input: "people: Amina(Actor) · Rose(Doctor), Sam(Doctor) · Peter(Singer), Jane(Singer), Alex(Singer)",
        output: "Alex(S) · Amina(A) · Jane(S) · Peter(S) · Rose(D) · Sam(D) · There are a total of 1 actors. · There are a total of 2 doctors. · There are a total of 3 singers.",
        explanation:
          "Six person rows at row grain, then three sentences at group grain — the counts are distinct (1, 2, 3), so the sentence order is decided without ties.",
      },
    ],
    constraints: [
      "person line: name + '(' + first letter of the occupation + ')' — SUBSTR(occupation, 1, 1)",
      "occupation line: 'There are a total of ' + count + ' ' + LOWER(occupation) + 's.' — exactly one per occupation",
      "one result set from one statement: person rows ordered by name, then occupation rows ordered by count, then occupation",
    ],
    breakdown: [
      "SQLite has no CONCAT — string building is the || operator, which chains as many pieces as the sentence needs: name || '(' || SUBSTR(occupation, 1, 1) || ')' assembles the person tag from four parts, and SUBSTR's 1-based indexing makes 'first letter' a two-argument slice. LOWER handles the sentence's casing, and the plural is nothing more glamorous than the literal 's.' appended at the end. The one silent hazard of || is NULL: concatenate anything with NULL and the whole expression collapses to NULL — harmless here because every column is NOT NULL, fatal the moment a nullable column joins the chain.",
      "The famous trick is the grain shift inside one result set: the first branch of a UNION ALL emits one row per person (raw table grain), while the second emits one row per occupation (GROUP BY grain) — the counts subquery. UNION ALL, not UNION: the two streams never collide (a sentence cannot equal a name tag), and UNION would pay a dedup pass for nothing. Engines allow exactly ONE ORDER BY in a compound SELECT and it must trail the last branch, sorting the merged result — per-branch ORDER BYs are simply ignored, so the two different orderings have to be manufactured some other way.",
      "The resolution is to make ordering into DATA: give every row a sort key as a column. Stream A rows carry (0, name, 0, '') and stream B rows carry (1, '', count, occupation); wrap the whole UNION ALL in an outer SELECT that projects only the display line and ORDER BY grp, k1, k2, k3. Group 0 sorts before group 1 — all person rows first, alphabetical — and inside group 1 the constant empty-string k1 ties everywhere, handing control to count then occupation. Verify the result in the engine (done here): the key-column trick sidesteps both compound-SELECT ordering rules with plain, portable SQL, and the same idea reappears whenever one output must interleave rows of different shapes.",
    ],
    edges: [
      "|| with a NULL operand yields NULL — every column feeding the concatenations here is NOT NULL, and that is a load-bearing assumption.",
      "Per-branch ORDER BY inside a compound SELECT is ignored by SQLite — branch sorts must become key columns instead.",
      "The counts must not tie for the sentence order to be fully deterministic — the seed's distinct 1, 2, 3 counts guarantee it.",
      "SUBSTR is 1-based (engine-verified): SUBSTR(occupation, 1, 1) is the first letter, while a 0 start returns an empty string and every tag would end in '()'.",
    ],
    ladder: [
      { title: "Brute force — two queries, stitched in code", body: "One SELECT for people, one GROUP BY for sentences, then merge and interleave in the application. The merge logic is exactly the ORDER BY you are avoiding." },
      { title: "The pattern — UNION ALL over two grains with key columns", body: "Each stream carries its own sort key (0 + name versus 1 + count + occupation); one outer ORDER BY consumes them." },
      { title: "The optimal idea — ordering as data", body: "O(n) string building plus O(n log n) for the final sort. The transferable idea: when one output must interleave rows of different shapes, invent columns encoding each shape's position — sorting becomes an ordinary projection." },
    ],
    approach: "UNION ALL of two grains (row + group) with synthetic sort-key columns, one outer ORDER BY",
    schema: {
      ddl: `CREATE TABLE Occupations (
  name       TEXT NOT NULL,
  occupation TEXT NOT NULL
);`,
      seed: `INSERT INTO Occupations (name, occupation) VALUES
  ('Amina','Actor'),
  ('Rose','Doctor'),('Sam','Doctor'),
  ('Peter','Singer'),('Jane','Singer'),('Alex','Singer');`,
      tables: [
        { name: "Occupations", note: "6 people in 3 occupations with deliberately distinct counts — Actor 1, Doctor 2, Singer 3 — so the sentence order never ties" },
      ],
    },
    code: `SELECT line
FROM (
    -- stream A: one row per person (row grain), key 0 = sorts first
    SELECT
        0 AS grp,
        name AS k1, 0 AS k2, '' AS k3,   -- A sorts alphabetically by name
        name || '(' || SUBSTR(occupation, 1, 1) || ')' AS line
    FROM Occupations
    UNION ALL
    -- stream B: one sentence per occupation (group grain), key 1 = sorts last
    SELECT
        1 AS grp,
        '' AS k1,
        cnt AS k2,                       -- B sorts by count...
        occupation AS k3,                -- ...then occupation name
        'There are a total of ' || cnt || ' ' || LOWER(occupation) || 's.' AS line
    FROM (
        SELECT occupation, COUNT(*) AS cnt
        FROM Occupations
        GROUP BY occupation
    )
)
ORDER BY grp, k1, k2, k3;                -- one ORDER BY for both streams`,
    walkthrough: [
      "Stream A builds six tags: Alex(S), Amina(A), Jane(S), Peter(S), Rose(D), Sam(D) — each keyed (0, name, 0, '').",
      "Stream B groups into three sentences: Actor 1, Doctor 2, Singer 3 — 'There are a total of 1 actors.', 'There are a total of 2 doctors.', 'There are a total of 3 singers.' — keyed (1, '', count, occupation).",
      "The outer ORDER BY sorts group 0 before group 1: the six name tags alphabetical, then the three sentences by count 1, 2, 3 — nine rows, one column, verified in the engine.",
    ],
    time: "O(n log n) — the final sort dominates the string building",
    space: "O(n) — the merged stream",
    followUps: [
      "An occupation arrives whose name already ends in 's' — decide whether naive 's.' pluralization is acceptable or the sentence needs a smarter rule.",
      "Sort the sentences by occupation name instead of count — which key column changes, and what new tie-breaks appear?",
    ],
    related: ["occupations-pivot", "station-shortest-longest"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "placements",
    statement:
      "Students holds each student's id, name and salary; Friends holds one row per friendship as (id, friend_id), where id is a student and friend_id is the student they befriended. A student is out-earned when their friend's salary is strictly HIGHER than their own. Print the NAME of the friend for every out-earned student, ordered by name.",
    examples: [
      {
        input: "salaries: Aiko 3000 · Ben 5000 · Cleo 7000 · Dev 5000 · Wren 9000 — friendships: Aiko→Ben, Ben→Cleo, Cleo→Aiko, Dev→Cleo, Aiko→Wren, Wren→Aiko, Ben→Dev",
        output: "Ben · Cleo · Cleo · Wren",
        explanation:
          "Cleo out-earns both Ben and Dev, so her name prints twice — once per qualifying friendship. Cleo→Aiko and Wren→Aiko point DOWN the salary ladder, and Ben→Dev is an exact tie: 5000 is not strictly higher than 5000.",
      },
    ],
    constraints: [
      "Friends is a bridge table: (id, friend_id) both reference Students.id — it carries no salaries of its own",
      "strictly higher: fr.salary > s.salary; an exact tie never qualifies",
      "one output row per qualifying friendship — a friend who out-earns two students prints twice — ordered by the friend's name",
    ],
    breakdown: [
      "Friends carries no facts of its own — it is a pure bridge whose two foreign keys both point into the same table. Following a friendship therefore takes TWO joins: Students s (the earner's own row, for their salary) → Friends f ON f.id = s.id (the bridge) → Students fr ON fr.id = f.friend_id (the friend's own row, for their name and salary). The second join re-uses Students under a second alias — the same physical table playing two roles in one query, which is the defining mark of a self-join chain. Without the bridge, 'my friend's salary' is not a column anywhere; it exists only as a path.",
      "The comparison crosses the bridge: fr.salary > s.salary compares a column from the third hop against a column from the first. Reading the aliases is the whole skill — s is always the person whose friendship is being tested, fr is always the person at the other end. Flip the inequality and the report silently answers the opposite question ('students who out-earn their friend') with the same joins and one flipped character: the direction of the comparison IS the spec. Equal salaries are excluded by the strictness — Ben(5000) → Dev(5000) produces nothing, which is why the seed plants that tie.",
      "One row prints per qualifying friendship, so a popular rich friend appears once per victim rather than once total: Cleo appears twice because two students point at her. Collapsing with DISTINCT would answer 'which distinct people out-earn someone?' — a different report with a different row count. And the output column is fr.name, the friend's name only; dragging s.name into the SELECT is tempting for readability but changes the graded shape. When in doubt, re-read the contract: the friend's name, ordered by name.",
    ],
    edges: [
      "Two aliases of Students in one query: s = the student, fr = the friend — mix them up once and every comparison inverts.",
      "Direction trap: Cleo→Aiko and Wren→Aiko are friendships where the STUDENT out-earns — they must NOT print, because the friend earns less.",
      "Strict inequality: the Ben→Dev 5000 = 5000 tie fails, and >= would wrongly admit it.",
      "Cleo legitimately appears twice — one row per qualifying friendship; DISTINCT would under-report.",
    ],
    ladder: [
      { title: "Brute force — two lookups per student", body: "Query each student's friends, fetch every friend's salary in a loop, compare in code. N+1 queries where one three-hop join finishes in a single pass." },
      { title: "The pattern — bridge + second alias", body: "Students s ⋈ Friends f ON f.id = s.id ⋈ Students fr ON fr.id = f.friend_id, WHERE fr.salary > s.salary." },
      { title: "The optimal idea — read the aliases, not the tables", body: "O(friendships) with a primary-key lookup on every hop. The transferable skill: in any self-join chain, name the roles (earner, bridge, friend) and every clause writes itself." },
    ],
    approach: "Students → Friends bridge → second Students alias; keep rows where the friend's salary strictly exceeds the student's",
    schema: {
      ddl: `CREATE TABLE Students (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  salary INTEGER NOT NULL
);
CREATE TABLE Friends (
  id        INTEGER NOT NULL REFERENCES Students(id),
  friend_id INTEGER NOT NULL REFERENCES Students(id)
);`,
      seed: `INSERT INTO Students (id, name, salary) VALUES
  (1,'Aiko',3000),(2,'Ben',5000),(3,'Cleo',7000),
  (4,'Dev',5000),(5,'Wren',9000);
INSERT INTO Friends (id, friend_id) VALUES
  (1,2),(2,3),(3,1),(4,3),(1,5),(5,1),(2,4);`,
      tables: [
        { name: "Students", note: "5 students; salaries 3000-9000 with a deliberate 5000 = 5000 tie (Ben and Dev)" },
        { name: "Friends", note: "7 friendships — 4 out-earned qualifiers, 2 pointing down the ladder (direction trap), 1 exact tie (strict > trap)" },
      ],
    },
    code: `SELECT fr.name
FROM Students s
JOIN Friends f  ON f.id = s.id           -- hop 1: the bridge row for s
JOIN Students fr ON fr.id = f.friend_id  -- hop 2: the friend's OWN row
WHERE fr.salary > s.salary               -- the comparison CROSSES the bridge
ORDER BY fr.name;`,
    walkthrough: [
      "The bridge expands each friendship into a pair of full student rows: Aiko(3000)→Ben(5000), Ben(5000)→Cleo(7000), Cleo(7000)→Aiko(3000), Dev(5000)→Cleo(7000), Aiko(3000)→Wren(9000), Wren(9000)→Aiko(3000), Ben(5000)→Dev(5000).",
      "The WHERE keeps pairs where the friend strictly out-earns: Aiko→Ben, Ben→Cleo, Dev→Cleo and Aiko→Wren survive; the two downward friendships and the 5000 tie are dropped.",
      "Projecting fr.name and sorting: Ben, Cleo, Cleo, Wren — Cleo twice, once per student she out-earns.",
    ],
    time: "O(friendships) — every hop rides a primary-key lookup",
    space: "O(1) beyond the qualifying rows",
    followUps: [
      "Print (student, friend) pairs instead — which alias feeds which column, and how does the row count change?",
      "Friends is one-way in this data: Aiko→Ben does not imply Ben→Aiko. Rewrite assuming symmetric friendship and predict which qualifiers double.",
    ],
    related: ["employees-earning-more-than-their-managers", "sales-person"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "symmetric-pairs",
    statement:
      "Functions logs one row per observation: an id, x and y. Two rows form a SYMMETRIC pair when one holds (x, y) and another holds (y, x) — a mirrored couple. Report every row with x <= y that belongs to a symmetric pair, with one refinement: a row where x = y (a diagonal point) counts only if a SECOND row holds the same (x, y) — a lone diagonal is nobody's mirror. Output x and y, ordered by x, then y.",
    examples: [
      {
        input: "rows: (1,2), (2,1), (4,5), (5,4), (20,20), (20,20), (13,13), (11,17)",
        output: "(1,2) · (4,5) · (20,20) · (20,20)",
        explanation:
          "The off-diagonal couples report from their smaller-x side only: (2,1) and (5,4) sit out because x > y. The doubled (20,20) qualifies twice — each copy witnesses the other — while the lone (13,13) has no witness and the unmirrored (11,17) has no mirror at all.",
      },
    ],
    constraints: [
      "a mirrored couple: some OTHER row holds exactly (y, x) when this row holds (x, y)",
      "only rows with x <= y are reported — each couple appears once, from its smaller-x side",
      "diagonal rows (x = y) need a second row with the SAME (x, y) and a different id",
    ],
    breakdown: [
      "Reporting each couple 'once' needs a decision rule, and x <= y is it: the smaller-x side is the couple's representative, the larger-x side is suppressed. For an off-diagonal couple exactly one side satisfies x < y — the mirror (y, x) necessarily has x > y — so a single filter deduplicates without any DISTINCT. The diagonal is the leak in that rule: (20,20) mirrors itself in the trivial sense, because its (y, x) equals its own (x, y), so 'some row holds the mirror' is always true and a lone diagonal would slip through unqualified. Hence the two-case shape of the query.",
      "The WHERE runs (x < y AND EXISTS a mirror) OR (x = y AND EXISTS a same-coordinate row with a DIFFERENT id). The first branch is the ordinary couple: f2.x = f1.y AND f2.y = f1.x finds the mirrored row. The second branch is the diagonal's witness test: same (x, y) but f2.id <> f1.id — and because id is the primary key the <> test is exact, with no ties and no NULLs to reason about. EXISTS beats a join-plus-DISTINCT here precisely because of the diagonal: a join emits one output row per WITNESS, and the doubled diagonal — two witnesses — would collapse under DISTINCT into a single (20,20), silently breaking the spec.",
      "A test seed for this problem must plant the trap on BOTH sides: the lone (13,13) must stay OUT — a naive 'EXISTS a mirror' solution reports it — and the doubled (20,20) must appear TWICE — a DISTINCT-based solution reports it once. Between those, the off-diagonal couple (4,5)/(5,4) checks the canonicalization (only (4,5) prints) and the unmirrored (11,17) checks the ordinary membership test. Four planted rows, four different fates — when every edge case gets a named row, the walkthrough becomes a proof rather than a hope.",
    ],
    edges: [
      "The lone diagonal (13,13) is the trap: 'a row that mirrors something' is vacuously true for every diagonal — only the different-id witness makes it qualify.",
      "The doubled diagonal must print twice: f1 row 1 witnesses f1 row 2 and vice versa; DISTINCT would destroy the second copy.",
      "x <= y is the dedup: (5,4) is the mirror OF (4,5) and is suppressed by the same filter that reports (4,5).",
      "id <> id is exact because id is a PRIMARY KEY — a keyless table would need a rowid or a synthetic key before the witness test could be written.",
    ],
    ladder: [
      { title: "Brute force — sort, scan, special-case", body: "Order all rows, walk candidate couples, hand-code the equal-coordinates exception. The EXISTS formulation replaces the walk with two declarative membership tests." },
      { title: "The pattern — canonical side + two-case EXISTS", body: "WHERE x <= y AND ((x < y AND EXISTS mirror) OR (x = y AND EXISTS same-coords-other-id))." },
      { title: "The optimal idea — one probe per candidate", body: "O(n) with an index on (x, y) — each row probes the mirror set once. The self-join twin (JOIN f2 ON f2.x = f1.y AND f2.y = f1.x, deliberately WITHOUT DISTINCT) returns the same multiset; choose by readability, not speed." },
    ],
    approach: "Keep x <= y rows that either mirror a real couple or share their coordinates with a different-id witness",
    schema: {
      ddl: `CREATE TABLE Functions (
  id INTEGER PRIMARY KEY,
  x  INTEGER NOT NULL,
  y  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Functions (id, x, y) VALUES
  (1,20,20),(2,20,20),(3,13,13),
  (4,4,5),(5,5,4),
  (6,11,17),
  (7,1,2),(8,2,1);`,
      tables: [
        { name: "Functions", note: "8 rows — a doubled (20,20), a lone (13,13) trap, two mirrored couples, and one unmirrored (11,17)" },
      ],
    },
    code: `SELECT f1.x, f1.y
FROM Functions f1
WHERE f1.x <= f1.y                       -- report each couple from its smaller-x side
  AND (
        (f1.x < f1.y
         AND EXISTS (SELECT 1 FROM Functions f2
                     WHERE f2.x = f1.y AND f2.y = f1.x))   -- the mirrored row
     OR (f1.x = f1.y
         AND EXISTS (SELECT 1 FROM Functions f2
                     WHERE f2.x = f1.x AND f2.y = f1.y    -- same coordinates...
                           AND f2.id <> f1.id))           -- ...but a DIFFERENT row
      )
ORDER BY f1.x, f1.y;`,
    walkthrough: [
      "The x <= y gate admits (4,5), the two (20,20)s, (13,13) and (1,2) — and rejects (5,4) and (2,1), which are the larger-x sides of their couples.",
      "Off-diagonal survivors probe for a mirror: (4,5) finds (5,4) and (1,2) finds (2,1). Diagonal survivors probe for a same-coordinate witness with a different id: (20,20) id 1 finds id 2 and id 2 finds id 1, but (13,13) finds only itself — rejected.",
      "Ordered by x, then y: (1,2), (4,5), (20,20), (20,20) — the doubled diagonal prints twice, the lone diagonal prints never.",
    ],
    time: "O(n) probes with an (x, y) index; O(n²) worst case on a table scan",
    space: "O(1) beyond the output rows",
    followUps: [
      "Collapse the two branches into one EXISTS with the id condition folded inside — then argue which version a reviewer would rather read.",
      "Write the self-join twin with no DISTINCT and confirm it returns the doubled diagonal twice; then add DISTINCT and watch it break.",
    ],
    related: ["customers-who-bought-a-and-b-not-c", "sales-person"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "fifteen-days-of-learning",
    statement:
      "A contest keeps a submission log: Submissions records (submission_id, submission_date, hacker_id) — a hacker may submit several times on one day — and Hackers holds (hacker_id, name). The log spans a 10-day window whose day 1 is the earliest logged date. For each day D from 1 through 10, report four columns: the day number, how many hackers are on a FULL streak (they have a submission on EVERY day from day 1 through day D), and the day's leader — the hacker with the most submissions ON day D, ties broken by the lowest hacker_id — with their name. Order by day.",
    examples: [
      {
        input: "Milo submits on days 1-4, skips day 5, returns on day 6 · Nora submits every day",
        output: "day 4: Milo still counted · day 5: Milo dropped",
        explanation:
          "A full streak through day D needs EVERY day from day 1 — one skipped day ends the streak permanently, even though the hacker returns the next day. Nora never misses, so she stays counted through day 10.",
      },
      {
        input: "day 10 submissions: Milo 2 · Raj 2 · Nora 1 · Pia 1",
        output: "leader = Milo (lower hacker_id)",
        explanation:
          "Two hackers tie at 2 submissions on day 10; the tie-break is the lowest hacker_id, not the longest streak and not the alphabetical name.",
      },
    ],
    constraints: [
      "the window is days 1 through 10; day 1 is the earliest submission date in the log",
      "full streak through D: a submission exists on EVERY day 1..D — missing any single day disqualifies for that day and all later ones",
      "leader per day: most submissions THAT day, ties to the lowest hacker_id; order the report by day",
    ],
    breakdown: [
      "'On a full streak through day D' is a negated existence question: the hacker is on a streak exactly when NO day between 1 and D is missing from their log. Two nested NOT EXISTS express it directly — enumerate days D, and for each test whether a missing day d2 <= D can be found for the hacker. The arithmetic alternative (COUNT(DISTINCT date) over days <= D equals D) is equivalent, but it hides the entry fee in plain sight: a hacker who joins on day 3 and submits daily forever still never passes, because days 1 and 2 are missing — distinct-day counting only matches the definition because the count is taken from day 1 inclusive. The NOT EXISTS version states the rule verbatim and needs no cleverness.",
      "The leader is a per-day argmax over submission counts, and counts come from grouping the raw log by (day, hacker): one row per hacker per active day, with Zed's four submissions on day 1 collapsing into a single row with cnt = 4. ROW_NUMBER() OVER (PARTITION BY day ORDER BY cnt DESC, hacker_id) assigns rank 1 to exactly the right hacker, tie-break included, and filtering rn = 1 keeps one leader per day. The classic wrong turn is MAX(cnt) joined back on cnt — a tie then emits TWO leaders for that day — and the subtler one is joining the leader back to the RAW log: the leader made several submissions that day, and the fan-out multiplies the report's rows unless a DISTINCT papers over it. Numbering each group once and filtering the rank sidesteps both.",
      "The report needs two independent per-day computations — the streak census and the leader — and CTEs make the decomposition literal. A recursive days CTE builds the calendar from the log's earliest date, day_counts regroups the log, leader and streakers each answer one question per day, and the final SELECT stitches the results by day number. Note what the stitch does NOT do: the two columns are computed independently, so a day whose leader is not on a full streak (day 5, where Pia leads despite joining on day 3) is still reported correctly. The leader column and the streak column answer different questions and must never be coupled through one aggregate.",
    ],
    edges: [
      "Milo starts on day 1 and never misses until day 5 — counted through day 4, dropped forever after: one skipped day is permanent.",
      "Late joiners (Pia from day 3, Raj from day 6) NEVER reach a full streak, no matter how daily they are afterward — day 1 attendance is the entry fee.",
      "Day 5's leader is Pia (2 submissions) while the streak count is 1 (Nora alone): the leader column and the streak column are independent answers.",
      "Zed makes 4, 3 and 2 submissions on days 1-3 and leads all three days — a multi-submission leader must count as ONE leader, not one row per submission.",
    ],
    ladder: [
      { title: "Brute force — per day, in application code", body: "For each day, scan the log for who submitted on days 1..D, then find the day's busiest hacker. O(days × log) round trips, and the tie-break logic is all yours." },
      { title: "The pattern — one CTE per question", body: "Recursive calendar; day_counts GROUP BY (day, hacker); NOT EXISTS census for streaks; ROW_NUMBER argmax for leaders; stitch on day." },
      { title: "The optimal idea — one pass per grain", body: "O(log size) for the grouping plus O(days × hackers) census probes. The transferable idea: multi-question reports decompose into per-question CTEs joined on their shared key — never force one aggregate to answer two questions." },
    ],
    approach: "Recursive day calendar; NOT EXISTS missing-day census for streaks; ROW_NUMBER (cnt DESC, hacker_id) for the daily leader",
    schema: {
      ddl: `CREATE TABLE Hackers (
  hacker_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Submissions (
  submission_id   INTEGER PRIMARY KEY,
  submission_date TEXT NOT NULL,
  hacker_id       INTEGER NOT NULL REFERENCES Hackers(hacker_id)
);`,
      seed: `INSERT INTO Hackers (hacker_id, name) VALUES
  (101,'Nora'),(202,'Milo'),(303,'Pia'),(404,'Raj'),(505,'Zed');
INSERT INTO Submissions (submission_id, submission_date, hacker_id) VALUES
  -- day 1 (2024-03-01): Zed 4, Nora 1, Milo 1
  (1,'2024-03-01',505),(2,'2024-03-01',505),(3,'2024-03-01',505),(4,'2024-03-01',505),
  (5,'2024-03-01',101),(6,'2024-03-01',202),
  -- day 2 (2024-03-02): Zed 3, Milo 2, Nora 1
  (7,'2024-03-02',505),(8,'2024-03-02',505),(9,'2024-03-02',505),
  (10,'2024-03-02',202),(11,'2024-03-02',202),(12,'2024-03-02',101),
  -- day 3 (2024-03-03): Zed 2, Nora 1, Milo 1, Pia 1 (Pia's first day)
  (13,'2024-03-03',505),(14,'2024-03-03',505),
  (15,'2024-03-03',101),(16,'2024-03-03',202),(17,'2024-03-03',303),
  -- day 4 (2024-03-04): Nora 2, Milo 1, Pia 1 (Zed's last day)
  (18,'2024-03-04',101),(19,'2024-03-04',101),(20,'2024-03-04',202),(21,'2024-03-04',303),
  -- day 5 (2024-03-05): Pia 2, Nora 1 (Milo SKIPS - the streak trap)
  (22,'2024-03-05',303),(23,'2024-03-05',303),(24,'2024-03-05',101),
  -- day 6 (2024-03-06): four-way tie at 1 (Raj's first day)
  (25,'2024-03-06',101),(26,'2024-03-06',202),(27,'2024-03-06',303),(28,'2024-03-06',404),
  -- day 7 (2024-03-07): Raj 2, others 1
  (29,'2024-03-07',404),(30,'2024-03-07',404),
  (31,'2024-03-07',101),(32,'2024-03-07',202),(33,'2024-03-07',303),
  -- day 8 (2024-03-08): Nora 3, others 1
  (34,'2024-03-08',101),(35,'2024-03-08',101),(36,'2024-03-08',101),
  (37,'2024-03-08',202),(38,'2024-03-08',303),(39,'2024-03-08',404),
  -- day 9 (2024-03-09): four-way tie at 1
  (40,'2024-03-09',101),(41,'2024-03-09',202),(42,'2024-03-09',303),(43,'2024-03-09',404),
  -- day 10 (2024-03-10): Milo 2, Raj 2, Nora 1, Pia 1
  (44,'2024-03-10',202),(45,'2024-03-10',202),
  (46,'2024-03-10',404),(47,'2024-03-10',404),
  (48,'2024-03-10',101),(49,'2024-03-10',303);`,
      tables: [
        { name: "Hackers", note: "5 hackers — Nora never misses; Milo starts day 1 but skips day 5 (the streak trap); Pia (day 3) and Raj (day 6) join late; Zed submits in bursts and vanishes after day 3" },
        { name: "Submissions", note: "49 submissions over 2024-03-01..10 — Zed's 4/3/2 bursts lead days 1-3; days 6, 9 and 10 end in ties (lowest id wins); Pia leads day 5 without being on a streak" },
      ],
    },
    code: `WITH RECURSIVE
days(d, dt) AS (                         -- the 10-day calendar, day 1 = earliest log date
    SELECT 1, (SELECT MIN(submission_date) FROM Submissions)
    UNION ALL
    SELECT d + 1, DATE(dt, '+1 day') FROM days WHERE d < 10
),
day_counts AS (                          -- per day, per hacker: how many submissions
    SELECT d.d AS d, s.hacker_id AS hacker_id, COUNT(*) AS cnt
    FROM days d
    JOIN Submissions s ON s.submission_date = d.dt
    GROUP BY d.d, s.hacker_id
),
leader AS (                              -- argmax per day, ties -> lowest id
    SELECT
        d, hacker_id, cnt,
        ROW_NUMBER() OVER (PARTITION BY d ORDER BY cnt DESC, hacker_id) AS rn
    FROM day_counts
),
streakers AS (                           -- census: hackers with NO missing day in 1..D
    SELECT d.d AS d, COUNT(*) AS streakers
    FROM days d
    JOIN (SELECT DISTINCT hacker_id FROM Submissions) hs
      ON NOT EXISTS (
            SELECT 1 FROM days d2
            WHERE d2.d <= d.d            -- every day from 1 through D...
              AND NOT EXISTS (SELECT 1 FROM Submissions s
                              WHERE s.hacker_id = hs.hacker_id
                                AND s.submission_date = d2.dt)  -- ...must have a submission
         )
    GROUP BY d.d
)
SELECT
    st.d AS day,
    st.streakers AS full_streak,
    l.hacker_id AS leader_id,
    h.name AS leader_name
FROM streakers st
JOIN leader l ON l.d = st.d AND l.rn = 1
JOIN Hackers h ON h.hacker_id = l.hacker_id
ORDER BY st.d;`,
    walkthrough: [
      "day_counts collapses the 49-row log into 35 (day, hacker) counts: Zed 4/3/2 on days 1-3, Nora's peaks of 2 and 3 on days 4 and 8, Pia's 2 on day 5, Raj's 2 on day 7, and Milo's and Raj's 2s tying day 10.",
      "leader ranks each day by cnt DESC then hacker_id: Zed (505) takes days 1-3, Nora days 4 and 8, Pia day 5 (she is NOT on a full streak — leader status is independent), Nora on the four-way ties of days 6 and 9, Raj day 7, and Milo day 10 over the 2-2 tie with Raj (202 < 404).",
      "streakers: 3 (Nora, Milo, Zed) through day 3, 2 on day 4 (Zed misses it), then 1 from day 5 on (Milo skips day 5; only Nora has days 1..D complete). Final rows, ordered by day: (1,3,505,'Zed'), (2,3,505,'Zed'), (3,3,505,'Zed'), (4,2,101,'Nora'), (5,1,303,'Pia'), (6,1,101,'Nora'), (7,1,404,'Raj'), (8,1,101,'Nora'), (9,1,101,'Nora'), (10,1,202,'Milo').",
    ],
    time: "O(log × hackers × days) for the census probes plus O(log size) for the grouping",
    space: "O(days × hackers) — the per-day count grid",
    followUps: [
      "Add the number of DISTINCT hackers who submitted on day D as a fifth column — which CTE grows, and what happens on a day with zero submissions?",
      "Extend the window to the whole log (loop while the generated date is under the max) — which WHERE clause changes, and what does the streak census do beyond day 10?",
    ],
    related: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports"],
    order: "exact",
    xp: 35,
  },
];
