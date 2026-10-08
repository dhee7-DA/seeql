// Deep-dives — LeetCode Premium batch IX, file 6 of 6 (the finale file): exam
// retakes and all-pass gates, shift overlap pairs and sweep-line concurrency,
// NULL-aware shelf tallies and recursive string surgery (6 problems: 1 Easy,
// 2 Medium, 3 Hard). Engine-verified by scripts/tmp-69b6-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_FINALS: LcSqlDive[] = [
  {
    slug: "find-top-scoring-students",
    statement:
      "ExamScore logs every exam attempt as one row (exam_id, student_id, subject, score), and a student may sit the same subject more than once. A student's score in a subject is their MAX over that subject's attempts, and they PASS a subject when that score reaches 80 or more. Report the students who pass AT LEAST two subjects: columns student_id, passed_subjects — the count of subjects they pass — ordered by passed_subjects descending, then student_id ascending. Students passing fewer than two subjects do not appear.",
    examples: [
      {
        input:
          "student 3 sits Algebra twice — 85 first, then a 70 retake — and scores 90 in Biology and 88 in Chemistry",
        output: "3 · 3",
        explanation:
          "The retake never drags Algebra down: the subject score is the best attempt, 85, so all three subject scores clear 80 and the count is 3.",
      },
      {
        input: "student 2 scores exactly 80 in Physics and exactly 80 in Chemistry",
        output: "2 · 2",
        explanation:
          "80 itself passes — the threshold is inclusive — so both boundary subjects count and student 2 ships with 2.",
      },
    ],
    constraints: [
      "one row per student who passes at least two subjects; everyone else is absent",
      "a subject is passed when the student's MAX score in that subject is 80 or above — the boundary itself passes",
      "columns student_id, passed_subjects, ordered by passed_subjects descending then student_id ascending",
    ],
    breakdown: [
      "The pass rule lives at the (student, subject) grain, not the exam grain, and that mismatch is the whole problem. ExamScore holds one row per attempt, but a subject is passed or failed once per student, so the query must first collapse attempts into subject scores with GROUP BY student_id, subject and MAX(score). Only after that collapse can the pass filter run: WHERE top_score >= 80 keeps whole subjects, and a second GROUP BY student_id counts the survivors. Skipping the first stage and filtering raw exam rows cannot see subjects at all — it sees attempts, and attempts are the wrong unit for 'passed a subject'.",
      "The aggregate that produces the subject score must be chosen for its failure mode, and MAX is the only defensible pick. Student 3 sat Algebra twice — 85 then a 70 retake — and an AVG-per-subject engine shape would report 77.5, fail the 80 threshold, and quietly demote student 3 from three passing subjects to two. MAX is also the semantic truth of 'a student's subject score' here: the retake was worse, and the report asks about the best evidence, not the mean of all attempts. The same reasoning explains why the pass filter sits in the subject-stage query's WHERE clause without a HAVING: top_score is an ordinary column by then.",
      "The output contract is a two-key sort, and both keys earn their place. passed_subjects DESC puts the strongest student first — student 3's 3 before the 2-subject rows — and student_id ASC makes the 2-2 tie between students 1 and 2 deterministic instead of engine-dependent; ordering by student_id alone would bury student 3's three-subject row at the bottom, because 3 is the highest id in the seed. The 80 threshold is inclusive on purpose: student 2's two subjects sit exactly on 80, so a strict greater-than filter erases the whole student from the report. Boundary values and tie keys are the two places where a nearly-correct query and a correct query diverge, and the seed plants both.",
    ],
    edges: [
      "Student 2's Physics 80 and Chemistry 80 are the >= boundary planted twice — a strict > 80 filter passes neither subject and student 2 vanishes from the output, leaving only (3, 3) and (1, 2).",
      "Student 3's Algebra retake (exam 7, a 70 after an 85) is the aggregate trap — AVG(score) per subject reads 77.5, fails the threshold, and ships (1, 2), (2, 2), (3, 2) instead of the truth.",
      "Student 5's two Physics rows (100 and 97) both clear 80 — a query that filters raw exam rows and counts rows per student reports 2 for student 5 and wrongly admits them; counting subject groups is what keeps one subject as one pass.",
      "Student 4 passes exactly one subject (Algebra 99) and student 5 holds exactly one subject group — the HAVING COUNT(*) >= 2 gate is what excludes both; dropping it re-admits them as 1-pass rows.",
    ],
    ladder: [
      { title: "Brute force — tally by hand", body: "Walk each student's exams, note their best score per subject, count subjects at 80 or above, and sort by hand. The engine expresses the same two passes as two nested GROUP BYs." },
      { title: "The pattern — two grouped stages", body: "A CTE collapses attempts to (student_id, subject, top_score) with MAX; the outer query filters top_score >= 80, groups by student, counts survivors, and applies the >= 2 gate in HAVING." },
      { title: "The optimal idea — filter at the grain where the rule lives", body: "O(n log n). The durable rule: a threshold on 'a student's score in a subject' can only be tested at the (student, subject) grain — collapse first, then filter, then count — and the counting aggregate must see subjects, not attempts." },
    ],
    approach: "MAX per (student_id, subject) in a CTE, then WHERE >= 80, GROUP BY student_id with HAVING COUNT(*) >= 2, double-keyed ORDER BY",
    schema: {
      ddl: `CREATE TABLE ExamScore (
  exam_id    INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject    TEXT NOT NULL,
  score      INTEGER NOT NULL
);`,
      seed: `INSERT INTO ExamScore (exam_id, student_id, subject, score) VALUES
  (1, 1, 'Algebra', 82),
  (2, 1, 'Biology', 95),
  (3, 1, 'Chemistry', 60),   -- student 1 passes exactly 2 subjects
  (4, 2, 'Physics', 80),     -- the >= boundary, planted twice
  (5, 2, 'Chemistry', 80),   -- 80 itself passes
  (6, 3, 'Algebra', 85),
  (7, 3, 'Algebra', 70),     -- a WORSE retake: MAX keeps 85, AVG would read 77.5
  (8, 3, 'Biology', 90),
  (9, 3, 'Chemistry', 88),   -- student 3 passes 3 subjects
  (10, 4, 'Algebra', 99),
  (11, 4, 'Biology', 55),    -- student 4 passes only 1 subject: excluded
  (12, 5, 'Physics', 100),   -- same subject twice: 1 subject group, both rows >= 80
  (13, 5, 'Physics', 97);`,
      tables: [
        { name: "ExamScore", note: "13 attempts over 5 students — student 3 retakes Algebra, student 2 sits on the 80 boundary twice, student 5 doubles up in one subject" },
      ],
    },
    code: `WITH subject_scores AS (
    SELECT
        student_id,
        subject,
        MAX(score) AS top_score      -- the student's score in the subject
    FROM ExamScore
    GROUP BY student_id, subject     -- collapse attempts to the subject grain
)
SELECT
    student_id,
    COUNT(*) AS passed_subjects      -- surviving subject groups
FROM subject_scores
WHERE top_score >= 80                -- inclusive: 80 itself passes
GROUP BY student_id
HAVING COUNT(*) >= 2                 -- at least two subjects passed
ORDER BY passed_subjects DESC, student_id ASC;`,
    walkthrough: [
      "The CTE collapses 13 attempts into 10 subject groups: student 1 holds three subjects (82, 95, 60), student 3's two Algebra attempts fold into one group whose MAX is 85, and student 5's two Physics attempts fold into one group whose MAX is 100.",
      "The WHERE keeps subject groups scoring 80 or above — student 1 keeps Algebra 82 and Biology 95, student 2 keeps both boundary 80s, student 3 keeps all three groups — while student 5's single Physics group survives and student 4 keeps only Algebra 99.",
      "The outer count ships three rows: (3, 3) first, then the 2-2 tie broken by id as (1, 2) and (2, 2) — student 4 (one pass) and student 5 (one subject group) fall to the HAVING gate.",
    ],
    time: "O(n log n) — two grouped passes with a sort at each stage",
    space: "O(s) — one row per distinct (student_id, subject) pair in the CTE",
    followUps: [
      "Report every student with their pass count, including the zeros — which join or aggregate change keeps students with zero passing subjects, and why does GROUP BY alone never produce their row?",
      "Rank students by passed_subjects with ties sharing a rank — how does RANK() OVER (ORDER BY passed_subjects DESC) change the output compared to the flat double-key sort?",
    ],
    related: ["students-and-examinations", "classes-more-than-5-students", "game-play-analysis-iv"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-top-scoring-students-ii",
    statement:
      "ExamScore logs exam attempts as one row per attempt (exam_id, student_id, subject, score); a student's score in a subject is the MAX over that subject's attempts. Report every student who PASSED EVERY SUBJECT THEY ATTEMPTED — scoring 80 or more in each subject they hold any attempt in — and who attempted at least two distinct subjects. Output columns student_id, subjects_attempted (their count of distinct attempted subjects) and min_subject_score (their lowest subject score), ordered by student_id ascending.",
    examples: [
      {
        input:
          "student 505 scores 82 in Biology, retakes Biology for 58, and scores 90 in Physics",
        output: "505 · 2 · 82",
        explanation:
          "Biology's subject score is the best attempt, 82, so the bad retake is absorbed; both subject scores (82 and 90) clear 80 and two distinct subjects were attempted.",
      },
      {
        input: "student 502 scores 84 in Algebra, 79 in Biology and 91 in Chemistry",
        output: "(no row — student 502 is absent)",
        explanation:
          "One subject sits a single point below the threshold, and all-pass means every attempted subject, not most of them.",
      },
    ],
    constraints: [
      "a student qualifies only when their MAX score in EVERY subject they attempted is 80 or above",
      "at least two distinct attempted subjects are required — two attempts in one subject are still one subject",
      "columns student_id, subjects_attempted, min_subject_score, ordered by student_id ascending",
    ],
    breakdown: [
      "All-pass is a MIN over the right grain — and naming that grain is the entire solution. The per-(student, subject) CTE collapses attempts into subject scores with MAX(score), exactly as in any per-subject roll-up; after that collapse, 'passed every attempted subject' is simply MIN(top_score) >= 80 over the student's subject groups. The gate 'attempted at least two subjects' is COUNT(*) >= 2 at the same grain, where each row already is one distinct subject. Both conditions are evaluated per student after the grouping, so they belong in HAVING, not WHERE.",
      "The two-stage shape is not a style choice — the naive single-stage query is wrong twice on this seed. Grouping raw attempts per student and testing MIN(score) >= 80 reads student 505's Biology 58 retake directly and exiles a student whose real subject scores are 82 and 90. The same raw grouping counts attempts, so student 504's two Algebra rows (95 and 91) read as two 'subjects' with a minimum of 91, and a student with exactly one subject slips through the gate as a fake all-pass of two. Only the per-subject stage fixes both directions at once: MAX absorbs the retake, and COUNT(*) counts subjects, not rows.",
      "The boundary is inclusive and the seed parks a student exactly on it. Student 503 scores exactly 80 in both Physics and Chemistry: MIN(top_score) is 80, so >= 80 admits them and any strict greater-than filter would silently delete a legitimately on-threshold student. min_subject_score is a reporting column, not a filter — it is the same MIN(top_score) the HAVING tests, surfaced so the reader can see how close each qualifier came to the line. That dual use is worth noticing: the aggregate that guards the row and the aggregate the row reports are one and the same computation.",
    ],
    edges: [
      "Student 505's Biology 58 (exam 12, a retake below the first attempt's 82) is the raw-MIN punisher — a single-stage GROUP BY student_id with MIN(score) reads 58, fails the threshold, and drops a qualifying student.",
      "Student 504's two Algebra rows (95 and 91) are the attempt-vs-subject punisher — the naive raw grouping reports subjects_attempted 2 and min_subject_score 91, admitting a one-subject student; the per-subject CTE counts 1 and the gate removes them.",
      "Student 503's pair of exactly-80 subject scores is the inclusive boundary — a strict > 80 filter deletes them even though their subject MIN is 80.",
      "Student 502's Biology 79 is the one-point exile — every other score they hold is fine (84 and 91), which is exactly why the all-pass rule must be MIN-based and unforgiving.",
    ],
    ladder: [
      { title: "Brute force — inspect each student", body: "List each student's subjects with their best score per subject, check that every subject is 80 or above, then count the subjects. Two hand-built roll-ups the engine composes as one CTE plus a grouped query." },
      { title: "The pattern — per-subject MAX, then student-level HAVING", body: "A CTE produces (student_id, subject, top_score); the outer GROUP BY student_id carries MIN(top_score) and COUNT(*) with HAVING MIN(top_score) >= 80 AND COUNT(*) >= 2." },
      { title: "The optimal idea — grain decides semantics", body: "O(n log n). The durable rule: 'every' and 'at least two' are statements about SUBJECTS, so the aggregation grain must be (student, subject) before any all-pass logic runs — aggregating raw attempts answers questions about exam rows, which is a different report." },
    ],
    approach: "Per-(student_id, subject) MAX in a CTE, then GROUP BY student_id with HAVING MIN(top_score) >= 80 AND COUNT(*) >= 2",
    schema: {
      ddl: `CREATE TABLE ExamScore (
  exam_id    INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject    TEXT NOT NULL,
  score      INTEGER NOT NULL
);`,
      seed: `INSERT INTO ExamScore (exam_id, student_id, subject, score) VALUES
  (1, 501, 'Algebra', 92),
  (2, 501, 'Biology', 85),
  (3, 501, 'Chemistry', 88),   -- clean all-pass, min subject score 85
  (4, 502, 'Algebra', 84),
  (5, 502, 'Biology', 79),     -- the one-point exile
  (6, 502, 'Chemistry', 91),
  (7, 503, 'Physics', 80),     -- exactly 80 everywhere
  (8, 503, 'Chemistry', 80),   -- the inclusive boundary, planted twice
  (9, 504, 'Algebra', 95),
  (10, 504, 'Algebra', 91),    -- two ATTEMPTS, one subject: the gate
  (11, 505, 'Biology', 82),
  (12, 505, 'Biology', 58),    -- worse retake: MAX shields it, raw MIN reads 58
  -- exam 13: student 505 all-passes 2 subjects
  (13, 505, 'Physics', 90);`,
      tables: [
        { name: "ExamScore", note: "13 attempts over 5 students — 501 clean, 502 one point short, 503 on the boundary, 504 single-subject, 505 with a worse retake" },
      ],
    },
    code: `WITH subject_tops AS (
    SELECT
        student_id,
        subject,
        MAX(score) AS top_score     -- per-subject score absorbs worse retakes
    FROM ExamScore
    GROUP BY student_id, subject
),
all_pass AS (
    SELECT
        student_id,
        COUNT(*) AS subjects_attempted,        -- one row = one distinct subject
        MIN(top_score) AS min_subject_score    -- their weakest subject score
    FROM subject_tops
    GROUP BY student_id
    HAVING MIN(top_score) >= 80               -- EVERY subject passed
       AND COUNT(*) >= 2                      -- at least two distinct subjects
)
SELECT student_id, subjects_attempted, min_subject_score
FROM all_pass
ORDER BY student_id;`,
    walkthrough: [
      "The CTE folds 13 attempts into 10 subject groups: 505's two Biology attempts become one group with top_score 82, and 504's two Algebra attempts become one group with top_score 95.",
      "The per-student pass reads MIN(top_score) and COUNT(*) per student: 501 has 3 and 85, 502 has 3 and 79, 503 has 2 and 80, 504 has 1 and 95, 505 has 2 and 82.",
      "HAVING keeps 501 (85 >= 80, 3 >= 2), 503 (80 >= 80 on the inclusive boundary) and 505 (82 >= 80) — 502 fails on 79 and 504 fails the two-subject gate — and ORDER BY student_id ships (501, 3, 85), (503, 2, 80), (505, 2, 82).",
    ],
    time: "O(n log n) — one grouped collapse plus one grouped pass with a final sort",
    space: "O(s) — one row per distinct (student_id, subject) pair",
    followUps: [
      "Report the near-misses: students who fail only the all-pass test but attempted two or more subjects — how does the query change when the threshold filter moves from HAVING into a CASE column?",
      "Add best_subject beside min_subject_score — which join-back over subject_tops produces the subject name carrying the MAX, and why is a second aggregate not the answer?",
    ],
    related: ["active-users", "countries-you-can-safely-invest-in", "department-top-three-salaries"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-overlapping-shifts",
    statement:
      "Shift stores one row per scheduled work shift: (shift_id, employee_id, start_time, end_time) with timestamps as 'YYYY-MM-DD HH:MM' text and end_time strictly after start_time. Two shifts of the same employee OVERLAP when they run at the same time: a.start_time < b.end_time AND b.start_time < a.end_time. The comparison is strict, so a shift that ends exactly when another begins does NOT overlap it. Report every overlapping pair of shifts: columns employee_id, shift_id_a, shift_id_b, with shift_id_a < shift_id_b so each pair appears once, ordered by employee_id, then shift_id_a, then shift_id_b.",
    examples: [
      {
        input:
          "employee 33 works shift 5 from 08:00 to 16:00 and shift 6 from 10:00 to 11:00, fully inside it",
        output: "33 · 5 · 6",
        explanation:
          "Containment is overlap: 10:00 < 16:00 and 08:00 < 11:00, so the nested shift pairs with its container exactly once, 5 before 6.",
      },
      {
        input: "employee 22 works shift 3 from 08:00 to 10:00 and shift 4 from 10:00 to 13:00",
        output: "(no row — the pair does not overlap)",
        explanation:
          "The shifts touch at 10:00: b.start_time < a.end_time reads 10:00 < 10:00, which is false — touching endpoints are not a double-booking.",
      },
    ],
    constraints: [
      "only pairs of the same employee are considered, and each unordered pair is reported once (shift_id_a < shift_id_b)",
      "overlap is strict on both comparisons — an endpoint that merely touches does not overlap",
      "columns employee_id, shift_id_a, shift_id_b, ordered by employee_id, shift_id_a, shift_id_b",
    ],
    breakdown: [
      "Pair reports are self-joins, and the first job is keeping the pairs honest. Joining Shift to itself on employee_id alone produces every ordered combination — each shift paired with itself, every pair twice in both directions — so the guard a.shift_id < b.shift_id is what turns the cross mess into each unordered pair exactly once. The guard also makes the output's id ordering a byproduct of the join rather than something the final ORDER BY has to repair. Employee 33's nested shifts 5 and 6 still surface — containment satisfies the id guard and the overlap test in one direction — but the self-pairs and the reversed twins are gone.",
      "The overlap test itself is a strict interval intersection, and each comparison kills one way two shifts can miss each other. a.start_time < b.end_time says shift a began before shift b finished, and b.start_time < a.end_time says shift b began before shift a finished; if either fails, one shift is entirely after the other. Strictness on BOTH comparisons is what encodes the touching rule: at employee 22's shared 10:00 boundary, b.start_time < a.end_time reads 10:00 < 10:00 and fails, so back-to-back shifts are not a double-booking. Relax either comparison to <= and the seed grows a phantom pair (22, 3, 4) that was never worked twice.",
      "Timestamps stored as 'YYYY-MM-DD HH:MM' text make all of this portable, because lexicographic order on that format IS chronological order — every comparison above is a plain string comparison with no date functions, no casting and no timezone reasoning. That is why the seed's timestamps are zero-padded and date-first: '2024-07-02 10:00' compares correctly against '2024-07-02 13:00' and across days alike. The half-open reading — a shift owns the instants from its start up to but not including its end — is the semantic that makes the strict test coherent, and it belongs in the report rather than left implied. Employee 44's disjoint shifts prove the test rejects genuine separation, not just touching.",
    ],
    edges: [
      "Employee 22's shifts 3 and 4 touch at exactly 10:00 — closed-interval logic (<=) fabricates the pair (22, 3, 4) that the strict query correctly omits.",
      "Without a.shift_id < b.shift_id, every shift self-pairs — (11, 1, 1), (22, 3, 3), (44, 8, 8) — and the contained pair ships twice, as (33, 5, 6) and (33, 6, 5); the id guard is the pair contract, not cosmetics.",
      "Employee 33's shift 6 (10:00 to 11:00) is fully contained in shift 5 — containment still yields exactly ONE pair, which punishes formulations that special-case nesting separately from partial overlap.",
      "Employee 44's shifts 7 and 8 sit four hours apart with a real gap — a buggy shortcut (same day implies overlap, or OR-ing the two comparisons instead of AND-ing them) would resurrect a phantom (44, 7, 8) pair alongside every touch pair.",
    ],
    ladder: [
      { title: "Brute force — compare every pair by hand", body: "Loop each employee's shifts, compare start and end times pairwise, write down pairs where both ranges intersect, and remember to dedupe orderings. The engine does the loop as one self-join." },
      { title: "The pattern — self-join with an id-order guard and two strict comparisons", body: "FROM Shift a JOIN Shift b ON same employee AND a.shift_id < b.shift_id AND a.start_time < b.end_time AND b.start_time < a.end_time." },
      { title: "The optimal idea — encode the boundary policy in the comparison operators", body: "O(n^2) pair tests at worst. The durable rule: interval intersection is 'each starts before the other ends', strict operators declare touching to be non-overlap, and the id guard dedupes the join's mirrored output in the same breath." },
    ],
    approach: "Self-join Shift on employee_id with a.shift_id < b.shift_id and the strict pair a.start_time < b.end_time AND b.start_time < a.end_time",
    schema: {
      ddl: `CREATE TABLE Shift (
  shift_id    INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  start_time  TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM'
  end_time    TEXT NOT NULL   -- strictly after start_time
);`,
      seed: `INSERT INTO Shift (shift_id, employee_id, start_time, end_time) VALUES
  (1, 11, '2024-07-01 08:00', '2024-07-01 12:00'),
  (2, 11, '2024-07-01 10:00', '2024-07-01 14:00'),  -- runs beside shift 1: overlap
  (3, 22, '2024-07-02 08:00', '2024-07-02 10:00'),
  (4, 22, '2024-07-02 10:00', '2024-07-02 13:00'),  -- touches shift 3 at 10:00: NOT overlap
  (5, 33, '2024-07-03 08:00', '2024-07-03 16:00'),
  (6, 33, '2024-07-03 10:00', '2024-07-03 11:00'),  -- fully inside shift 5: one pair
  (7, 44, '2024-07-04 08:00', '2024-07-04 10:00'),
  -- shift 8 is disjoint from shift 7: absent
  (8, 44, '2024-07-04 12:00', '2024-07-04 14:00');`,
      tables: [
        { name: "Shift", note: "8 shifts over 4 employees — one clean overlap, one touching pair, one contained shift, one disjoint pair" },
      ],
    },
    code: `SELECT
    a.employee_id,
    a.shift_id AS shift_id_a,      -- the lower id: each unordered pair once
    b.shift_id AS shift_id_b
FROM Shift a
JOIN Shift b
  ON a.employee_id = b.employee_id  -- pairs live inside one employee
 AND a.shift_id    < b.shift_id     -- dedupe the join's mirrored output
 AND a.start_time  < b.end_time     -- a began before b finished
 AND b.start_time  < a.end_time     -- b began before a finished (strict: touch is not overlap)
ORDER BY a.employee_id, shift_id_a, shift_id_b;`,
    walkthrough: [
      "The self-join pairs each employee's shifts under the id guard: employee 11 yields the candidate (1, 2), employee 22 yields (3, 4), employee 33 yields (5, 6), employee 44 yields (7, 8).",
      "The two strict comparisons keep only real double-bookings: (1, 2) passes (10:00 < 14:00 and 10:00 < 12:00), (5, 6) passes as containment (10:00 < 16:00 and 08:00 < 11:00), while (3, 4) fails on 10:00 < 10:00 and (7, 8) fails both ways.",
      "ORDER BY employee_id, shift_id_a, shift_id_b ships exactly two rows: (11, 1, 2) and (33, 5, 6) — no self-pairs, no reversed twins, no touch pair.",
    ],
    time: "O(n^2) pair tests in the worst case (one employee with many shifts)",
    space: "O(p) — one row per reported pair",
    followUps: [
      "Report the TOUCHING pairs too, labelled — what single operator change admits (22, 3, 4), and how would a separate 'gap' flag distinguish it from the true overlaps?",
      "For each pair, add the overlap duration in minutes — which expression (julianday or strftime arithmetic) computes it, and what does containment mean for that value?",
    ],
    related: ["symmetric-coordinates", "consecutive-available-seats", "all-the-pairs-with-the-maximum-number-of-common-followers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-overlapping-shifts-ii",
    statement:
      "Shift stores one row per scheduled work shift: (shift_id, employee_id, start_time, end_time), timestamps as 'YYYY-MM-DD HH:MM' text, end strictly after start. A shift is running over the half-open span from its start_time up to but not including its end_time. Report each employee's MAXIMUM number of simultaneously running shifts at any instant: columns employee_id, max_concurrent, ordered by employee_id. Employees with no overlapping shifts report 1 — every shift overlaps itself, so a lone shift is a concurrency of one. Where several events share one timestamp, a shift ENDING at that instant frees its slot before a shift STARTING at it takes one: back-to-back shifts never stack.",
    examples: [
      {
        input:
          "employee 11 works shifts 1, 2 and 3 — 08:00 to 12:00, 10:00 to 14:00 and 11:00 to 13:00 on the same day",
        output: "11 · 3",
        explanation:
          "From 11:00 until 12:00 all three shifts run at once; the sweep adds one at each start and peaks at 3.",
      },
      {
        input: "employee 22 works shift 4 from 08:00 to 10:00 and shift 5 from 10:00 to 13:00",
        output: "22 · 1",
        explanation:
          "The shifts touch at 10:00 — the end event at 10:00 is processed before the start event, so the count drops before it can rise and the peak stays 1.",
      },
    ],
    constraints: [
      "one row per employee appearing in Shift; max_concurrent is at least 1 for every employee (a shift runs beside itself)",
      "an instant where one shift ends and another starts counts as a changeover, not a stack — the end applies first",
      "columns employee_id, max_concurrent, ordered by employee_id ascending",
    ],
    breakdown: [
      "Counting the deepest pile of intervals is a sweep-line, and SQL expresses the sweep as three familiar steps. Every shift contributes two events — a +1 at its start and a -1 at its end — UNIONed into one event stream; the window SUM(delta) OVER (PARTITION BY employee_id ORDER BY ...) replays the events in time order and keeps a running total of how many shifts are running; and MAX(active) per employee reads the deepest point of each replay. No join and no pair enumeration is needed anywhere in that pipeline. A pair-counting shortcut reports overlap RELATIONSHIPS, not simultaneous DEPTH — employee 11 holds three overlapping pairs but a depth of 3, and employees 22 and 33 hold no pairs at all, so a grouped pair-count drops them entirely instead of reporting 1.",
      "The tie rule is the load-bearing decision, and it must be stated in the ORDER BY. At 10:00 employee 22 has a -1 (shift 4 ends) and a +1 (shift 5 starts) sharing one timestamp; ordering events by (ts, delta) processes the -1 first, so the running count falls to 0 before rising to 1 and the touch never stacks. Flip that to delta DESC and the +1 lands first — the count hits 2 at a moment when, by the half-open semantics, only one shift is running — and employee 22 reports 2. The rule is the sweep-line twin of strict interval overlap: an ending shift frees its slot at the instant, and a starting shift occupies one only after.",
      "Two quiet details keep the replay honest. The frame must be ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — with ties in the ordering, the default RANGE would lump equal-keyed events into value groups and blur the per-event walk, and on this seed that choice happens to survive only because no employee has two events sharing BOTH ts and delta. And 'no ORDER BY at all' is a real failure mode, not a hypothetical: SUM(delta) OVER (PARTITION BY employee_id) without ordering totals each employee's deltas to 0, confidently reporting zeros where the truth is 3, 1 and 1. The baseline of 1 needs no special case — the sweep's count rises through 1 at every employee's first start event, so lone-shift employee 33 and touch-only employee 22 land on 1 naturally.",
    ],
    edges: [
      "Employee 22's touch pair (shifts 4 and 5) is the tie-rule plant — delta DESC in the window ORDER BY reports 2, double the truth.",
      "Dropping the window's ORDER BY entirely sums each employee's deltas to 0 and reports (11, 0), (22, 0), (33, 0) — a running total needs the walk, not the net.",
      "A pair-counting shortcut reports employee 11 as 4 (three overlapping pairs plus one) and silently omits employees 22 and 33, whose zero pairs form no group — depth is not relationship count, and the >= 1 baseline must come from the sweep itself.",
      "Employee 33's single shift 6 (09:00 to 17:00) is the baseline anchor — every correct shape reports 1 for them, which is exactly the every-shift-overlaps-itself floor.",
    ],
    ladder: [
      { title: "Brute force — test instants", body: "Sample every start time, count how many intervals cover it per employee, take the max. Correct, but it re-scans the table per instant and re-derives what one ordered pass computes." },
      { title: "The pattern — event stream plus running sum", body: "UNION ALL each shift into a +1 start event and a -1 end event, then SUM(delta) OVER (PARTITION BY employee_id ORDER BY ts, delta ROWS UNBOUNDED PRECEDING through CURRENT ROW)." },
      { title: "The optimal idea — the tie rule encodes the boundary policy", body: "O(n log n). The durable rule: a sweep is (events, order, running aggregate, per-group max), and the ORDER BY tie key is where the half-open end-before-start policy lives — flip it and you define touching as stacking." },
    ],
    approach: "UNION ALL start(+1)/end(-1) events, running SUM OVER (PARTITION BY employee_id ORDER BY ts, delta ROWS UNBOUNDED PRECEDING through CURRENT ROW), then MAX per employee",
    schema: {
      ddl: `CREATE TABLE Shift (
  shift_id    INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  start_time  TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM'
  end_time    TEXT NOT NULL   -- strictly after start_time
);`,
      seed: `INSERT INTO Shift (shift_id, employee_id, start_time, end_time) VALUES
  (1, 11, '2024-08-05 08:00', '2024-08-05 12:00'),
  (2, 11, '2024-08-05 10:00', '2024-08-05 14:00'),  -- stacks with shift 1 from 10:00
  (3, 11, '2024-08-05 11:00', '2024-08-05 13:00'),  -- all three run 11:00 to 12:00
  (4, 22, '2024-08-06 08:00', '2024-08-06 10:00'),
  -- shift 5 touches shift 4: must stay at 1
  (5, 22, '2024-08-06 10:00', '2024-08-06 13:00'),
  -- shift 6 is a lone shift: baseline 1
  (6, 33, '2024-08-07 09:00', '2024-08-07 17:00');`,
      tables: [
        { name: "Shift", note: "6 shifts over 3 employees — one triple-stack, one touching pair, one lone shift" },
      ],
    },
    code: `WITH events AS (
    SELECT employee_id, start_time AS ts, 1  AS delta FROM Shift  -- a shift arrives
    UNION ALL
    SELECT employee_id, end_time   AS ts, -1 AS delta FROM Shift  -- a shift departs
),
sweep AS (
    SELECT
        employee_id,
        ts,
        delta,
        SUM(delta) OVER (
            PARTITION BY employee_id
            ORDER BY ts ASC, delta ASC   -- ties: END (-1) before START (+1)
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS active                      -- shifts running after this event
    FROM events
)
SELECT
    employee_id,
    MAX(active) AS max_concurrent        -- the deepest point of the replay
FROM sweep
GROUP BY employee_id
ORDER BY employee_id;`,
    walkthrough: [
      "The UNION turns 6 shifts into 12 events; for employee 11 the ordered walk runs +1 at 08:00 (1), +1 at 10:00 (2), +1 at 11:00 (3), then walks back down through the ends at 12:00, 13:00 and 14:00.",
      "Employee 22's events at 10:00 are a -1 and a +1; delta ASC processes the end first, so the walk goes 08:00 (1), 10:00 (0), 10:00 (1), 13:00 (0) — the count never exceeds 1 and the touch never stacks.",
      "MAX per employee ships (11, 3), (22, 1) and (33, 1) — the triple-stack peaks at 3, and both the touch pair and the lone shift land on the every-shift-overlaps-itself baseline of 1.",
    ],
    time: "O(n log n) — sorting 2n events per partition feeds one window pass",
    space: "O(n) — two events per shift held in the CTE",
    followUps: [
      "Report the exact instant where each employee's concurrency peaks — how would you carry the ts column through the MAX, and which tie-break keeps it deterministic when several instants share the peak?",
      "Rewrite the sweep under the opposite policy (closed spans, starts before ends) and confirm employee 22 flips to 2 — what else in the seed changes with that flip?",
    ],
    related: ["find-peak-calling-hours-for-each-city", "report-contiguous-dates", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "books-with-null-ratings",
    statement:
      "Book stores one row per title: (book_id, title, rating) where rating is an INTEGER from 0 to 10 — or NULL when the book has never been rated. NULL means 'no rating exists', which is not the same as a rating of 0. Produce the collection's one-row report: rated_count is how many books hold a non-NULL rating, unrated_count is how many hold NULL, and avg_rated is the average rating over the RATED books only, rounded to 2 decimal places. Output exactly one row with columns rated_count, unrated_count, avg_rated.",
    examples: [
      {
        input: "five books — four carry ratings 8, 7, 9 and 0, and one carries NULL",
        output: "4 · 1 · 6.0",
        explanation:
          "COUNT(rating) skips the NULL (4), the remainder is 1, and AVG(rating) averages only the four rated values: (8 + 7 + 9 + 0) / 4 = 6.0.",
      },
      {
        input: "book 4, 'Basalt Ridge', holds rating 0",
        output: "counted in rated_count — and its zero drags the average from 8.0 (without it) down to 6.0",
        explanation:
          "A 0 is a real rating, not an absence: collapsing it into the unrated bucket miscounts the shelf and flatters the average.",
      },
    ],
    constraints: [
      "COUNT(rating) counts non-NULL ratings only; COUNT(*) counts every row — unrated_count is the difference",
      "AVG(rating) ignores NULL rows entirely; the average runs over rated books only and is rounded to 2 places",
      "exactly one output row, columns rated_count, unrated_count, avg_rated",
    ],
    breakdown: [
      "NULL means 'unknown or absent', and every aggregate in this report makes a decision about it — the query is honest only when those decisions are explicit. COUNT(rating) counts the values that exist, which is exactly rated_count; COUNT(*) counts rows, which is the whole shelf; the difference is the unrated remainder without any extra scan. AVG(rating) silently skips NULL rows and divides by the count of non-NULL values, so the rated-only average falls out of the default NULL handling rather than a filter. The single-row grain needs no GROUP BY at all — aggregating the whole table in one pass produces the one report row directly.",
      "The seeded zero is the trap that separates the three counts. Book 4's rating of 0 is a real rating: COUNT(rating) must include it, the average must absorb it — (8 + 7 + 9 + 0) / 4 = 6.0, not 8.0 over three books — and only the NULL book stays outside. A query that 'helpfully' NULLs zeros with NULLIF(rating, 0) reports 3 rated, 2 unrated and an average of 8.0, making the shelf look better reviewed and better liked than it is. The same instinct in reverse, COALESCE(rating, 0), folds the genuinely unrated book into the average and reports 4.8 over five values, which is wrong in the dilute-the-denominator direction. Zeros and NULLs answer different questions and must never be silently interchanged.",
      "Ordering a single row feels like a formality, but the report still ships under an exact-order contract, so the query carries a nominal ORDER BY over one of its own output columns. More interesting is the arithmetic discipline: rounding to 2 places happens AFTER the average, on the final value — the seed's exact 6.0 hides nothing, but a shelf rated (8, 7, 9, 1) must report 6.25 and not a truncated 6. A hand-rolled SUM(rating) / COUNT(rating) divides INTEGER by INTEGER and floors toward zero in SQLite, silently wrecking that rounding before ROUND ever runs. AVG returns REAL, and the column aliases — not the table's internals — pin the report's public column names.",
    ],
    edges: [
      "Book 4's 0 rating (row 4) is the real-zero plant — NULLIF(rating, 0) misreports 3 rated, 2 unrated and 8.0, flattering both counts and the average.",
      "Book 5's NULL (row 5) is the unrated anchor — COUNT(*) alone reports 5 rated and 0 unrated; only COUNT(*) - COUNT(rating) yields the true 4 and 1.",
      "COALESCE(rating, 0) drags the NULL into the mean and reports 4.8 over five values instead of 6.0 over four — AVG's NULL-skip is the correct default, not a bug to patch.",
      "The exact-6.0 seed hides the arithmetic trap — the same ratings shifted to (8, 7, 9, 1) would expose 6.25 from AVG against a floored 6 from SUM(rating) / COUNT(rating).",
    ],
    ladder: [
      { title: "Brute force — two passes and a calculator", body: "Scan the shelf, write down which books have ratings, sum and divide those, count the rest. One grouped pass replaces all of it — if the NULL decisions are made consciously." },
      { title: "The pattern — three aggregates, one pass, no GROUP BY", body: "COUNT(rating), COUNT(*) - COUNT(rating) and ROUND(AVG(rating), 2) over the whole table: each aggregate states its own NULL policy." },
      { title: "The optimal idea — let the aggregate's NULL semantics do the work", body: "O(n). The durable rule: COUNT(column) counts values, COUNT(*) counts rows, AVG(column) means over existing values — and any 0-vs-NULL merging must be a deliberate, documented decision, never a silent patch." },
    ],
    approach: "COUNT(rating), COUNT(*) - COUNT(rating) and ROUND(AVG(rating), 2) over the whole Book table — one ungrouped pass",
    schema: {
      ddl: `CREATE TABLE Book (
  book_id INTEGER PRIMARY KEY,
  title   TEXT NOT NULL,
  rating  INTEGER           -- 0..10, or NULL when never rated
);`,
      seed: `INSERT INTO Book (book_id, title, rating) VALUES
  (1, 'Delta Fields', 8),
  (2, 'Copper Harbor', 7),
  (3, 'Ember Lane', 9),      -- 8 + 7 + 9 = 24 so far
  (4, 'Basalt Ridge', 0),    -- a REAL zero rating, not an absence
  -- book 5 is the only unrated one
  (5, 'Fallow Marsh', NULL);`,
      tables: [
        { name: "Book", note: "5 books — four rated (8, 7, 9 and a real 0) and one unrated (NULL)" },
      ],
    },
    code: `SELECT
    COUNT(rating) AS rated_count,                 -- counts non-NULL ratings only (4)
    COUNT(*) - COUNT(rating) AS unrated_count,    -- rows minus rated rows (1)
    ROUND(AVG(rating), 2) AS avg_rated            -- AVG skips NULLs: 24 / 4 = 6.0
FROM Book
ORDER BY avg_rated;                               -- single-row report, nominal exact-order key`,
    walkthrough: [
      "The scan sees five rows: four ratings (8, 7, 9, 0) and one NULL — COUNT(rating) counts the four existing values, COUNT(*) counts all five rows, and the difference is 1.",
      "AVG(rating) runs over the four non-NULL values only: 24 / 4 = 6.0, with the real zero dragging the mean down from the 8.0 it would be without book 4.",
      "ROUND pins 2 decimal places and the query ships its single ordered row: (4, 1, 6.0) — the COALESCE variant would have printed 4.8 and the NULLIF variant 8.0, both wrong.",
    ],
    time: "O(n) — one scan, three aggregates",
    space: "O(1) — one output row",
    followUps: [
      "Break the report down per shelf or per author — where does the GROUP BY go, and what does COUNT(rating) report for a group whose books are all unrated?",
      "Report the median rating beside the mean — which SQLite tools (window functions over ordered ratings) get you there, and how do NULLs and the real zero interact with a median?",
    ],
    related: ["count-salary-categories", "calculate-special-bonus", "employee-bonus"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "first-letter-capitalization",
    statement:
      "Entry stores one row per text snippet: (entry_id, content). Each content is lowercase words separated by exactly one space — no leading or trailing spaces, no punctuation. Rewrite each entry capitalizing the FIRST letter of every word that sits at an EVEN zero-based index (the first word is index 0, the next is 1, and so on), and leaving every word at an ODD index untouched. Report columns entry_id, transformed — the rewritten content with the same words in the same order, joined by single spaces — ordered by entry_id ascending.",
    examples: [
      {
        input: "entry 1: 'hello world again today'",
        output: "Hello world Again today",
        explanation:
          "Indexes 0 and 2 ('hello' and 'again') are capitalized; indexes 1 and 3 ('world' and 'today') stay lowercase — every OTHER word starting from the first.",
      },
      {
        input: "entry 3: 'once upon a time today'",
        output: "Once upon A time Today",
        explanation:
          "Five words put the last word at index 4 — even — so it capitalizes too; a five-word entry begins and ends capitalized.",
      },
    ],
    constraints: [
      "one row per entry, ordered by entry_id ascending",
      "transformed preserves the words and their order exactly, joined by exactly one space each",
      "capitalization applies to even indexes only (0, 2, 4 and so on); odd-index words remain fully lowercase",
    ],
    breakdown: [
      "String surgery over a delimiter is a token problem wearing a text costume, and the recursive CTE is SQLite's built-in loop for it. The anchor consumes each entry's first word — substr up to the first space — and each recursive step consumes the next word from the remainder until nothing is left. The padding trick instr(content || ' ', ' ') matters at the boundary: the last word has no trailing space in the raw content, and concatenating one space to the scanned text lets the SAME expression find it, keeping the anchor and the step one shape. Termination is the WHERE rest <> '' guard — the step that empties rest is the one holding the final word, and the recursion stops there.",
      "Reassembly is where this problem quietly gets hard, and folding the string DURING the walk is what makes it deterministic. GROUP_CONCAT looks tempting — split to words, CASE the capitalization, then concatenate back together — but SQLite does not guarantee the order in which GROUP_CONCAT visits a group's rows, and the recursion's natural arrival order (every anchor row lands before any step row) must not be trusted to sort itself. The fold carries the built string as a fifth column instead: each step appends one space plus the cased word, so the row where rest empties holds the finished text and no post-aggregation ordering exists to get wrong. Determinism here is a design property, not a hope — the same query on the same seed must produce the same string every run.",
      "The parity CASE is the report's contract, so its indexing must be exact. The anchor's word is index 0 and capitalizes; the step capitalizes only when (idx + 1) % 2 = 0 — the NEXT word's index — because the step's CASE sees the CURRENT idx of the parent row. One-off errors here are the signature bug: capitalizing on odd indexes instead produces 'hello World again Today', which looks plausible and is entirely wrong. The single-word entry is the anchor-only path: rest empties immediately, the step never runs, and 'hello' still becomes 'Hello' — a splitter whose recursion requires at least one space would silently lose that row.",
    ],
    edges: [
      "Entry 1 ('hello world again today') is the parity plant — a capitalize-every-word query returns 'Hello World Again Today', wrong at indexes 1 and 3.",
      "Entry 2 ('hello') is the anchor-only plant — a splitter whose step assumes more words exist (or whose termination needs a space to find) drops the row or never terminates; rest empties at once and 'Hello' still ships.",
      "Entry 3's last word 'today' lands on index 4, which is even — a naive capitalize-only-the-first-word rule (or an off-by-one parity) leaves it lowercase and misreports the row as 'Once upon A time today'.",
      "The reassembly spacing is one space exactly — a fold that appends the word without the separator reads 'Helloworld Again today', and a splitter that keeps the consumed space doubles it.",
    ],
    ladder: [
      { title: "Brute force — split, flag, restitch", body: "Split each entry on spaces in application code, number the words, uppercase the even ones and rejoin. The recursive CTE is the SQL statement of that loop, folding as it walks." },
      { title: "The pattern — recursive splitter with a carried accumulator", body: "Anchor: the first word plus a built string. Step: consume the next word from rest, append one space plus its cased form, and stop when rest is empty." },
      { title: "The optimal idea — fold during the walk, never reassemble order-dependently", body: "O(m) in the total text length. The durable rule: when output order depends on processing order, carry the result through the recursion instead of reassembling after — the terminal row IS the answer, and determinism is structural." },
    ],
    approach: "WITH RECURSIVE fold consuming one word per step, CASE on index parity appending to a built string, terminal rows carry the transformed text",
    schema: {
      ddl: `CREATE TABLE Entry (
  entry_id INTEGER PRIMARY KEY,
  content  TEXT NOT NULL    -- lowercase words, single-spaced, no edge spaces
);`,
      seed: `INSERT INTO Entry (entry_id, content) VALUES
  (1, 'hello world again today'),
  (2, 'hello'),                  -- single word: anchor-only path
  -- 5 words: the last word sits at index 4
  (3, 'once upon a time today');`,
      tables: [
        { name: "Entry", note: "3 snippets — a 4-word parity plant, a single word, a 5-word entry ending on an even index" },
      ],
    },
    code: `WITH RECURSIVE fold AS (
    SELECT
        entry_id,
        0 AS idx,                                            -- the first word is index 0
        substr(content, 1, instr(content || ' ', ' ') - 1) AS word,
        substr(content, instr(content || ' ', ' ') + 1) AS rest,
        upper(substr(substr(content, 1, instr(content || ' ', ' ') - 1), 1, 1))
          || substr(substr(content, 1, instr(content || ' ', ' ') - 1), 2) AS built
    FROM Entry
    UNION ALL
    SELECT
        entry_id,
        idx + 1,
        substr(rest, 1, instr(rest || ' ', ' ') - 1),
        substr(rest, instr(rest || ' ', ' ') + 1),
        built || ' ' ||
        CASE WHEN (idx + 1) % 2 = 0                          -- the NEXT word is even
             THEN upper(substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 1, 1))
                  || substr(substr(rest, 1, instr(rest || ' ', ' ') - 1), 2)
             ELSE substr(rest, 1, instr(rest || ' ', ' ') - 1)  -- odd: leave lowercase
        END
    FROM fold
    WHERE rest <> ''                                         -- stop when nothing remains
)
SELECT entry_id, built AS transformed
FROM fold
WHERE rest = ''                                              -- the terminal step holds the full text
ORDER BY entry_id;`,
    walkthrough: [
      "The anchor consumes each entry's first word at index 0 and capitalizes it: 'Hello', 'Hello' and 'Once', with remainders 'world again today', '' and 'upon a time today'.",
      "Each step appends the next word cased by parity — entry 1 walks 'Hello world', then 'Hello world Again' at index 2, then 'Hello world Again today' at index 3 left lowercase; entry 3 ends 'Once upon A time Today' with 'Today' capitalized at index 4.",
      "Only terminal rows (rest empty) survive the outer filter, shipping (1, 'Hello world Again today'), (2, 'Hello') and (3, 'Once upon A time Today') in entry_id order — the same rows, byte for byte, on every run.",
    ],
    time: "O(m) — one walk per word across all entries (m = total text length)",
    space: "O(w) — the recursion queue holds one row per in-flight word position",
    followUps: [
      "Add a word_count column beside transformed — where in the fold does the count live, and how does the terminal row surface it without a second pass?",
      "Rewrite the transform as a split CTE with ROW_NUMBER over (entry_id, idx) and a concatenating aggregate — what has to be true about your engine's ordered-aggregate support before you trust the reassembly?",
    ],
    related: ["fix-names-in-a-table", "patients-with-a-condition", "count-occurrences-in-text"],
    order: "exact",
    xp: 35,
  },
];
