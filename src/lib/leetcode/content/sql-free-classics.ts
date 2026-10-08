// Deep-dives — the free classics, file 1 of 5: the founding five (2 Medium,
// 3 Easy) — tier hunting, runs, warmth, referrals and size thresholds.
// Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical starter tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_FREE_CLASSICS: LcSqlDive[] = [
  {
    slug: "nth-highest-salary",
    statement:
      "Income holds one row per employee: (emp_id, name, salary). Report the second-highest DISTINCT salary in the whole table as a single row with a single column, second_highest. Tiers are distinct VALUES, not rows — several employees can share the top tier. If fewer than two distinct salary values exist, the single row must still appear, carrying NULL.",
    examples: [
      {
        input: "Amara and Boris both earn 98000 — the top tier holds two rows; Celia earns 89000",
        output: "89000",
        explanation:
          "The duplicate top collapses to one distinct value, so the runner-up tier is 89000 — not the second 98000 row.",
      },
      {
        input: "Dov's 74000 is the lowest salary on the payroll",
        output: "(not this report — 74000 is the floor)",
        explanation:
          "The direction matters: second-highest reads from the top down. Dov's row keeps the tier list at three values (98000, 89000, 74000), so the runner-up tier is unambiguous; shrink the table to two tiers and the answer becomes the lower tier, and to one tier and the mandated answer is NULL.",
      },
    ],
    constraints: [
      "the count is over DISTINCT salary values — two employees earning 98000 form one tier, and the answer is the tier below it",
      "fewer than two distinct values must still yield the single output row, carrying NULL — never an error, never an empty result set",
      "output is exactly one row and one column, named second_highest",
    ],
    breakdown: [
      "The question counts VALUES while the table stores ROWS, and the difference is the entire trap. ORDER BY salary DESC sorts rows — Amara's 98000 and Boris's 98000 occupy two physical positions — while the answer must treat them as one tier. So LIMIT 1 OFFSET 1 over the raw table skips Amara's row, lands on Boris's row and reports 98000 as its own runner-up. The fix is to make the engine think in tiers first: DISTINCT salary collapses the duplicate 98000 into one value before any skipping happens. Every nth-highest question is really two questions — deduplicate, then walk — in that order.",
      "The skipping itself is OFFSET arithmetic with a boundary story. SQLite's LIMIT/OFFSET counts from zero, so OFFSET 1 means 'after the first row', which is exactly the runner-up tier over a DISTINCT-sorted set. The elegant part is the failure mode: when the set holds fewer rows than the offset demands, LIMIT 1 OFFSET 1 returns no row at all — and a scalar subquery that finds no row evaluates to NULL, not to an error. A payroll where everyone earns the same salary therefore produces the mandated NULL row with zero extra code: the empty result IS the null-safe answer. That is why the scalar-subquery shape is preferred here over joining the sorted set back, which would have to be taught about emptiness.",
      "The tempting shortcut is MAX, and it answers the wrong question by construction: MAX(salary) is the top tier — 98000 here — so 'MAX, then exclude it' needs a second round-trip (a NOT IN or a second aggregate) merely to reach 89000. The other honest shape is DENSE_RANK() OVER (ORDER BY salary DESC) = 2, which numbers tiers 1, 2, 3 and keeps tier 2 — equivalent on this seed, and worth knowing because a rank filter generalises to the k-th tier without rewriting an offset. What both correct shapes share is deduplicating before ranking or skipping; what both wrong shapes share is letting row multiplicity leak into value logic.",
    ],
    edges: [
      "The duplicate top is the planted trap: Amara's and Boris's rows both hold 98000, so ORDER BY salary DESC LIMIT 1 OFFSET 1 WITHOUT the DISTINCT skips into Boris's row and reports 98000 — the top tier wearing its own runner-up's name.",
      "MAX(salary) reports 98000: the aggregate sees values but cannot count tiers, so 'the max' and 'the second-highest' differ by exactly the deduplication that MAX never applies.",
      "The one-tier case is documented, not seeded: a payroll with a single distinct salary would leave the DISTINCT-sorted subquery one row short, OFFSET 1 would fall past the end, and the scalar subquery would evaluate to NULL — the contract's NULL row arrives with no extra branch.",
      "Dov's 74000 guards the floor: a query that misreads 'second-highest' as 'second-lowest' (ORDER BY salary ASC LIMIT 1 OFFSET 1) returns 89000 on this seed by the coincidence of exactly three tiers — flip the tier order and it answers a different question for the wrong reason.",
    ],
    ladder: [
      { title: "Brute force — sort and point", body: "Pull every salary, deduplicate by eye, sort descending and read the second line. Works once, teaches nothing about where the NULL should come from, and collapses on any table change." },
      { title: "The pattern — DISTINCT, then OFFSET", body: "A scalar subquery runs SELECT DISTINCT salary ORDER BY salary DESC LIMIT 1 OFFSET 1: tiers are built before the skip, and the skip lands on tier two." },
      { title: "The optimal idea — an empty set IS the NULL", body: "O(n log n). The durable rule: a scalar subquery over an empty result evaluates to NULL, so 'not enough tiers' needs no CASE, no COALESCE and no UNION — the offset falling past the end is the specification's NULL row." },
    ],
    approach: "DISTINCT-sorted scalar subquery, LIMIT 1 OFFSET 1 — an empty subquery degrades to the mandated NULL",
    schema: {
      ddl: `CREATE TABLE Income (
  emp_id INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  salary INTEGER NOT NULL
);`,
      seed: `INSERT INTO Income (emp_id, name, salary) VALUES
  (1, 'Amara', 98000),  -- top tier, row one of two
  (2, 'Boris', 98000),  -- the DUPLICATE top: one tier, two rows
  (3, 'Celia', 89000),  -- the true runner-up tier
  (4, 'Dov',   74000);`,
      tables: [
        { name: "Income", note: "4 employees, 3 distinct tiers — 98000 held twice, then 89000, then 74000" },
      ],
    },
    code: `SELECT (
    SELECT DISTINCT salary
    FROM Income
    ORDER BY salary DESC   -- tiers from the top down
    LIMIT 1 OFFSET 1       -- 0-based: skip tier one, keep tier two
) AS second_highest        -- empty subquery -> NULL, the mandated row
ORDER BY second_highest;`,
    walkthrough: [
      "The scalar subquery deduplicates first: four rows become three tiers — 98000, 89000, 74000 — because Amara's and Boris's rows share one value.",
      "Ordered descending and read from zero, OFFSET 1 skips the 98000 tier and LIMIT 1 keeps 89000; had the DISTINCT been missing, the sorted ROWS would read 98000, 98000, 89000, 74000 and the same skip would land on Boris's 98000.",
      "The outer query labels the scalar result second_highest and ships one row — (89000) — under a nominal ORDER BY that pins the single-row contract; on a one-tier payroll the subquery would come back empty and the row would read NULL.",
    ],
    time: "O(n log n) — one sort of the deduplicated salaries",
    space: "O(d) — one row per distinct tier inside the subquery",
    followUps: [
      "Rewrite the filter as DENSE_RANK() OVER (ORDER BY salary DESC) = 2 — what does each form return on a one-tier payroll, and why does ROW_NUMBER() = 2 answer a different question on this seed?",
      "Generalise to the k-th tier with LIMIT 1 OFFSET k - 1 — for which k does the row turn NULL here, and how would you distinguish 'no such tier' from 'a tier whose salary is genuinely NULL' if salaries could be NULL?",
    ],
    related: ["second-highest-salary", "department-highest-salary", "biggest-single-number"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "consecutive-numbers",
    statement:
      "LogEntry is an append-only event stream: (entry_id, value), one row per event, entry_id unique. A value is on a streak when it appears in at least THREE CONSECUTIVE rows — three rows whose entry_ids are adjacent. Report every value that is on a streak: single column value, ordered by value ascending. A value that reaches three-in-a-row in several places still ships once.",
    examples: [
      {
        input: "ids 1, 2 and 3 all carry value 7",
        output: "7",
        explanation:
          "Three adjacent rows share the value, and the run is exactly three long — the boundary case still qualifies.",
      },
      {
        input: "value 2 appears four times — ids 4 and 5 together, then ids 7 and 8 together after value 9 interrupts",
        output: "(absent — four appearances, never three adjacent)",
        explanation:
          "The classic impostor: raw frequency matches the qualifying four-run of value 5, but adjacency is the test, and 2 never strings three rows together.",
      },
    ],
    constraints: [
      "consecutive means adjacent entry_ids — id, id+1, id+2; this seed's ids are contiguous 1..12, so that arithmetic walks real neighbours",
      "a value hitting the pattern in overlapping windows appears exactly once in the report",
      "single column value, ordered by value ascending",
    ],
    breakdown: [
      "Consecutiveness is a relation between neighbouring ROWS, and neither GROUP BY nor COUNT can see it: grouping treats the table as a bag of values, and a bag has no order, so value 2's four scattered appearances and value 5's four appearances are indistinguishable to any frequency-based query — which is exactly the wrong answer this seed is built to catch. The information lives in row position. Two shapes read it: a window that looks backwards (LAG over the entry_id order) or a join that walks ids (each row matched by a partner at id+1 and another at id+2). Both turn 'three in a row' into a row-level predicate instead of a group-level statistic.",
      "The LAG shape reads cleanly: LAG(value) OVER (ORDER BY entry_id) paints each row with its predecessor's value, LAG(value, 2) adds the one before that, and a row qualifies when its value equals both painted neighbours — the last row of any qualifying triple anchors one hit. The DISTINCT is not decoration: value 5's four-run contains two overlapping triples (ids 9-10-11 and 10-11-12), and without the dedupe the report prints 5 twice. Note what the window's ORDER BY is doing there: it defines 'previous' for the lookback and is not the report's ordering, which the outer ORDER BY value supplies separately. Positional lookbacks and result ordering are two different jobs that both happen to say ORDER BY.",
      "The id-gap trap deserves honesty because the shapes fail differently. On contiguous ids 1..12, entry_id + 1 always names the next row and the self-join is safe; with gaps, the join stays correct (a missing id simply finds no partner) while the positional LAG can forge adjacency across the hole, because 'previous row' and 'previous id' stop coinciding. The seed states its contiguity so the simpler arithmetic reading is trustworthy, but the durable habit is to audit any positional lookback against the keys it walks.",
    ],
    edges: [
      "The planted impostor: value 2 occupies ids 4, 5, 7 and 8 — four rows, two separate runs — so HAVING COUNT(*) >= 3 (any frequency test) admits 2 alongside 5 and 7; adjacency alone exiles it.",
      "The dedupe is load-bearing: value 5's run of four spans two overlapping triples, so the LAG query without DISTINCT ships the row (5) twice — and a self-join without DISTINCT ships one row per qualifying anchor.",
      "The boundary run: value 7's streak is exactly three (ids 1-3), so a > 3 or 'at least four' gate erases it; value 9's lone row at id 6 shows the other extreme — no run at all, no handling needed.",
      "Contiguity is stated, not assumed: ids run 1..12 with no holes, which is what licenses entry_id + 1 as 'the next row' — a seed with a gap would need the positional LAG audited for forged adjacency (or an id-delta check added beside it).",
    ],
    ladder: [
      { title: "Brute force — walk the runs", body: "Sort by entry_id, sweep once counting the current run length, and collect values whose run reaches three, deduplicating by hand. The engine expresses the same sweep as a lookback window or a double self-join." },
      { title: "The pattern — look back twice, then dedupe", body: "LAG(value) and LAG(value, 2) over the entry_id order mark every row whose value matches both predecessors; DISTINCT collapses the overlapping-window repeats and ORDER BY value finishes the contract." },
      { title: "The optimal idea — adjacency is positional, frequency is not", body: "O(n). The durable rule: 'in a row' is information about row ORDER, so it needs a neighbour relation — LAG or a keyed self-join — and any COUNT-shaped answer answers a different question, as value 2's four scattered rows prove." },
    ],
    approach: "LAG(value) twice over entry_id order, keep rows equal to both predecessors, DISTINCT + ORDER BY value",
    schema: {
      ddl: `CREATE TABLE LogEntry (
  entry_id INTEGER PRIMARY KEY,
  value    INTEGER NOT NULL
);`,
      seed: `INSERT INTO LogEntry (entry_id, value) VALUES
  (1, 7),
  (2, 7),
  (3, 7),   -- 7's run: exactly three in a row
  (4, 2),
  (5, 2),   -- 2-run #1 for value 2
  (6, 9),   -- singleton: no run at all
  (7, 2),
  (8, 2),   -- 2-run #2: value 2 totals four rows, never three adjacent
  (9, 5),   -- 5's run starts: four in a row, two overlapping triples
  (10, 5),
  (11, 5),
  (12, 5);`,
      tables: [
        { name: "LogEntry", note: "12 events, ids contiguous 1..12 — 7 runs three, 5 runs four, 2 appears four times in two pairs, 9 once" },
      ],
    },
    code: `SELECT DISTINCT value                  -- collapse overlapping windows: one row per value
FROM (
    SELECT
        value,
        LAG(value)    OVER (ORDER BY entry_id) AS prev1,  -- one row back
        LAG(value, 2) OVER (ORDER BY entry_id) AS prev2   -- two rows back
    FROM LogEntry
) triples
WHERE value = prev1 AND value = prev2  -- this row and BOTH predecessors agree
ORDER BY value;`,
    walkthrough: [
      "The window walks the twelve rows in entry_id order and paints each with its two predecessors; exactly three rows see a triple match — id 3 (7, 7, 7), id 11 (5, 5, 5) and id 12 (5, 5, 5).",
      "Value 2's candidates fail at the seams: id 5's predecessors read (7, 2) and id 8's read (9, 2), so both 2-rows die despite the value's four appearances — and id 6's 9 has no run to join.",
      "DISTINCT folds ids 11 and 12 into one row, and ORDER BY value ships the report — (5), then (7) — once each.",
    ],
    time: "O(n) — one ordered pass feeding two lookbacks",
    space: "O(n) — the painted rows held for the filter",
    followUps: [
      "Rebuild the query as a double self-join on entry_id + 1 and + 2 — which shape survives a GAP in the ids, and what would each ship on ids 1, 2, 3 (value 7) followed by ids 10, 11, 12 (value 9): does either fabricate a streak, and which one would fabricate if the two sides shared a value?",
      "Report each qualifying value beside its LONGEST run length — how do runs-and-islands (or a counting window over the equal-neighbours flag) upgrade the boolean test into a measurement, and what does value 5's four read against value 7's three?",
    ],
    related: ["consecutive-available-seats", "consecutive-available-seats-ii", "actors-and-directors-who-cooperated-at-least-three-times"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "rising-temperature",
    statement:
      "DailyWeather holds one temperature reading per day: (day, temp), with day numbered consecutively from 1 upward and no gaps. Report the day number of every day whose temp was strictly HIGHER than the PREVIOUS day's temp. Output: single column day, ordered by day ascending. Day 1 has no previous day and can never qualify.",
    examples: [
      {
        input: "day 1 reads 21 and day 2 reads 25",
        output: "2",
        explanation:
          "25 is strictly above 21, so day 2 is a rise — the first of the two warm fronts in this seed.",
      },
      {
        input: "day 2 reads 25 and day 3 also reads 25",
        output: "(absent — equal is not higher)",
        explanation:
          "The planted flat: a >= comparison would admit day 3, but 'higher than' is strict, and the flat day must stay out.",
      },
    ],
    constraints: [
      "strictly higher — a day whose temp equals the previous day's is NOT a rise",
      "days are contiguous integers (1..8 here), so day - 1 is exactly the previous day",
      "single column day, ordered by day ascending",
    ],
    breakdown: [
      "The question binds each row to one specific neighbour: the row whose day is one less. A self-join states that relation literally — DailyWeather today joined to DailyWeather yesterday ON yesterday.day = today.day - 1 — and the WHERE compares the two temps. The join is only honest because the days are contiguous: if day 5 were missing, today.day - 1 would name a day that never happened and the comparison would silently vanish rather than err loudly. LAG(temp) OVER (ORDER BY day) is the window alternative, which reads 'previous row' instead of 'previous day' — the same thing here precisely because the seed is gapless.",
      "Strictness is the whole grading. 'Higher than' maps to >, and the seed plants an equality pair — days 2 and 3 both read 25 — so the >= variant reports day 3 as a rise that never was, inflating the output to days 2, 3 and 4. Equality feels like a corner case until a sensor repeats a reading, and then it is silently the most common row in the table. The fix costs one character, and the discipline costs one sentence of thought: when a report says higher, lower, more or fewer, write the strict operator and test the equal case on purpose.",
      "Day 1 shows why the join shape needs no special guard: the inner join finds no yesterday for day 1, so the first day drops out by construction — which is correct, because nothing can be higher than a day that does not exist. The same holds under LAG: day 1's painted prev_temp is NULL, and temp > NULL is UNKNOWN, so the row filters itself. Both shapes derive the boundary from the data instead of hardcoding 'start at day 2', which is the difference between a query and a coincidence.",
    ],
    edges: [
      "The planted flat: days 2 and 3 both read 25, so WHERE today.temp >= yesterday.temp ships (2), (3), (4) instead of (2), (4) — the one-character bug this seed exists to catch.",
      "Day 1 (temp 21) has no predecessor: the inner join finds no partner and LAG yields NULL — both shapes leave it out without a special case, and any 'start from day 2' hardcode is a symptom, not a fix.",
      "The fall streak days 5-8 read 20, 14, 10, 6 — four straight declines with no rise hiding among them; a sign-flipped comparison (temp < prev) reports all four instead, which is how the operator's direction gets audited.",
      "Contiguity is stated (days 1..8), so the day - 1 join keys walk real neighbours; with a missing day the join would skip silently while positional LAG would compare across the hole — one shape fails loud, the other fails wrong.",
    ],
    ladder: [
      { title: "Brute force — walk the array", body: "Read the temps in day order and loop from the second day, keeping every index where temps[i] > temps[i-1]. The engine runs the same loop as a keyed join or a window lookback." },
      { title: "The pattern — neighbour join, strict compare", body: "Self-join DailyWeather to itself on yesterday.day = today.day - 1 and filter today.temp > yesterday.temp; LAG(temp) OVER (ORDER BY day) is the window spelling of the same neighbour relation." },
      { title: "The optimal idea — let the data state the boundary", body: "O(n). The durable rules: 'previous day' is a join key (or a window order), strictness is an operator choice the seed must punish, and the first row's missing neighbour should eliminate it structurally — never by hardcoding where the loop starts." },
    ],
    approach: "self-join yesterday.day = today.day - 1, keep today.temp > yesterday.temp, ORDER BY day",
    schema: {
      ddl: `CREATE TABLE DailyWeather (
  day  INTEGER PRIMARY KEY,  -- contiguous 1..N: no gaps
  temp INTEGER NOT NULL
);`,
      seed: `INSERT INTO DailyWeather (day, temp) VALUES
  (1, 21),  -- no previous day: can never rise
  (2, 25),  -- rise #1 (21 -> 25)
  (3, 25),  -- the planted flat: equal, NOT a rise
  (4, 28),  -- rise #2 (25 -> 28), right after the flat
  (5, 20),  -- the fall streak begins
  (6, 14),
  (7, 10),
  (8,  6);`,
      tables: [
        { name: "DailyWeather", note: "8 contiguous days — two rises (days 2, 4), one flat (day 3), four straight falls (days 5-8)" },
      ],
    },
    code: `SELECT today.day
FROM DailyWeather today
JOIN DailyWeather yesterday
  ON yesterday.day = today.day - 1  -- contiguity makes day-1 the previous day
WHERE today.temp > yesterday.temp   -- strictly higher: equal is not a rise
ORDER BY today.day;`,
    walkthrough: [
      "The join pairs each day with its predecessor: day 2 meets day 1 (25 vs 21) and day 4 meets day 3 (28 vs 25) — both comparisons are strict wins.",
      "Day 3 meets day 2 at 25 vs 25 and fails the strict test; days 5 through 8 lose to their predecessors (20, 14, 10, 6 against 28, 20, 14, 10), so the whole fall streak stays out.",
      "ORDER BY day ships the two survivors — (2), then (4) — and day 1 never entered the join because no row owns day 0.",
    ],
    time: "O(n) — one scan with a keyed neighbour lookup",
    space: "O(n) — the paired rows held for the filter",
    followUps: [
      "Report the temperature DELTA beside each rise (columns day, change) — what does day 1's row become under a LEFT JOIN, and which COALESCE keeps the report readable?",
      "Find the LONGEST falling streak in the log — how do runs-and-islands over the day-over-day sign upgrade this pairwise query, and what does the streak read here (four declines spanning days 4 through 8)?",
    ],
    related: ["average-time-of-process-per-machine", "second-day-verification", "game-play-analysis-iv"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-customer-referee",
    statement:
      "Shopper lists a marketplace's shoppers: (shopper_id, name, referee_id). referee_id names the shopper who referred them — or holds NULL when nobody did. Report the name of every shopper whose referee is NOT shopper 2, and shoppers with no referee at all MUST appear. Output: single column name, ordered by name ascending.",
    examples: [
      {
        input: "shopper 3 (Cy) and shopper 5 (Elif) have referee_id NULL — nobody referred them",
        output: "Cy · Elif",
        explanation:
          "Absence of a referee can never equal 2, so both NULL rows belong in the report — but only if the query says so explicitly; the NULL rows are the canonical casualty of the one-line filter.",
      },
      {
        input: "shopper 1 (Ada) and shopper 4 (Dee) were both referred by shopper 2",
        output: "(both absent)",
        explanation:
          "The exclusion is exact: only a literal referee_id of 2 disqualifies a row, and these are the only two rows it disqualifies.",
      },
    ],
    constraints: [
      "NULL referee_id means nobody referred the shopper — such shoppers always qualify for the report",
      "the only excluded shoppers are those whose referee_id is exactly 2",
      "single column name, ordered by name ascending",
    ],
    breakdown: [
      "The English sentence 'referee is not shopper 2' hides a three-valued trap. SQL evaluates referee_id <> 2 row by row, and for a NULL referee the comparison is neither TRUE nor FALSE — it is UNKNOWN, and a WHERE keeps only rows whose predicate is TRUE. So the one-line filter referee_id <> 2 silently deletes Cy and Elif, exactly the shoppers the statement explicitly protects. The predicate is not wrong so much as incomplete: 'not 2' must be spelled as 'IS NULL, or not 2', because SQL splits UNKNOWN away from both yes and no.",
      "The explicit OR arm is the portable fix, and the alternatives are worth naming because they encode the same null-safety differently. WHERE referee_id IS NULL OR referee_id <> 2 says the two cases out loud; SQLite's null-safe referee_id IS NOT 2 folds them into one operator; COALESCE(referee_id, 0) <> 2 substitutes a sentinel that no real referee carries, with the caveat that a sentinel only works while the domain avoids it. Whichever form ships, the test that matters is the same: run it on a table where NULL rows exist, because on an all-referred table every spelling agrees and the bug waits for production.",
      "Note the mirrored trap on the other side: WHERE NOT (referee_id = 2) looks like a harmless rewrite, but NOT flips FALSE to TRUE while UNKNOWN stays UNKNOWN — the NULL rows die again. Three-valued logic is infectious: every operator that touches NULL produces NULL, and only IS NULL and the null-safe equals family can certify it. The problem is small enough to write in ten seconds and precise enough to fail a third of interviews — the predicate's truth table, not the table, is the exam.",
    ],
    edges: [
      "The canonical trap: shoppers 3 and 5 hold NULL, so WHERE referee_id <> 2 alone ships only (Bo) — Cy and Elif vanish without an error, the exact rows the statement demands.",
      "The IS NULL arm is load-bearing the other way too: shoppers 1 and 4 (referee 2) must stay out, and the NULL arm cannot rescue them — an inverted connector (IS NULL AND ...) or a misplaced parenthesis re-admits them.",
      "WHERE NOT (referee_id = 2) fails identically to <>: NOT turns FALSE into TRUE but leaves UNKNOWN as UNKNOWN, so the NULL rows die again — rewriting the operator is not null-safety.",
      "Bo (shopper 2, referred by shopper 3) is IN the report: an id that appears as a referee value elsewhere is still an ordinary shopper here — filtering by 'was referred at all' or confusing the referee role with the shopper role misroutes the row.",
    ],
    ladder: [
      { title: "Brute force — read and sort", body: "Scan the five rows, keep those with an empty referee cell or a referee other than 2, sort the names. The engine runs the same decision as one WHERE with an explicit NULL arm." },
      { title: "The pattern — spell out both cases", body: "WHERE referee_id IS NULL OR referee_id <> 2 keeps 'no referee' and 'referee other than 2' as separate TRUE cases, so UNKNOWN never has to decide the outcome." },
      { title: "The optimal idea — null-safety is explicit or it is absent", body: "O(n). The durable rule: any comparison against a NULL is UNKNOWN and WHERE discards it, so 'is not X' over a nullable column must either enumerate the NULL case or use a null-safe operator — never trust <> to cover absence." },
    ],
    approach: "WHERE referee_id IS NULL OR referee_id <> 2 — the NULL arm IS the report",
    schema: {
      ddl: `CREATE TABLE Shopper (
  shopper_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  referee_id INTEGER           -- NULL: nobody referred this shopper
);`,
      seed: `INSERT INTO Shopper (shopper_id, name, referee_id) VALUES
  (1, 'Ada',  2),      -- referred by shopper 2: OUT
  (2, 'Bo',   3),      -- referred by shopper 3: IN
  (3, 'Cy',   NULL),   -- no referee: IN (the trap row)
  (4, 'Dee',  2),      -- referred by shopper 2 again: OUT
  (5, 'Elif', NULL);`,
      tables: [
        { name: "Shopper", note: "5 shoppers — Ada and Dee referred by shopper 2 (out), Bo by shopper 3 (in), Cy and Elif NULL (in)" },
      ],
    },
    code: `SELECT name
FROM Shopper
WHERE referee_id IS NULL   -- nobody referred them: can never be shopper 2
   OR referee_id <> 2      -- referred, but by someone else
ORDER BY name;`,
    walkthrough: [
      "The predicate splits the five rows into three TRUE cases and two FALSE cases: Bo (referee 3), Cy (NULL) and Elif (NULL) pass; Ada and Dee (both referee 2) fail.",
      "The NULL rows survive only through the IS NULL arm — under referee_id <> 2 alone, NULL <> 2 is UNKNOWN and Cy and Elif would silently drop, shipping a one-row report.",
      "ORDER BY name ships (Bo), (Cy), (Elif) — the two excluded shoppers are exactly the two whose referee is literally 2.",
    ],
    time: "O(n) — one filtered scan",
    space: "O(k) — one output row per qualifying shopper",
    followUps: [
      "Rewrite the filter three ways — referee_id IS NOT 2 (SQLite null-safe), referee_id IS DISTINCT FROM 2, COALESCE(referee_id, 0) <> 2 — decide which port to other engines, and what breaks in the COALESCE form if shopper 0 ever exists?",
      "Report each shopper beside their referee's NAME via a self-join — what prints for Cy and Elif under a LEFT JOIN, and how many rows does an INNER join lose?",
    ],
    related: ["customers-who-never-order", "invalid-tweets", "calculate-special-bonus"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "big-countries",
    statement:
      "Nation catalogs countries: (nation_id, name, continent, area, population). A country is BIG when area is at least 3,000,000 OR population is at least 25,000,000 — either threshold alone qualifies. Report name, continent, area and population of every big country, ordered by name ascending.",
    examples: [
      {
        input: "Cindralon spans 9,900,000 and holds 130,000,000 people — over both thresholds",
        output: "Cindralon · Equatoria · 9900000 · 130000000",
        explanation:
          "Both arms fire, yet the report holds one row per country: a WHERE never duplicates a row, no matter how many predicates it satisfies.",
      },
      {
        input: "Drakmara spans 2,999,999 with 24,999,999 people",
        output: "(absent — one short on both)",
        explanation:
          "The planted near-miss: it fails both thresholds by the smallest possible margin, so it punishes every boundary slip — a mistyped literal above all.",
      },
    ],
    constraints: [
      "big = area >= 3,000,000 OR population >= 25,000,000 — either arm alone qualifies, and both arms is still just big",
      "one row per qualifying country, carrying name, continent, area, population",
      "ordered by name ascending",
    ],
    breakdown: [
      "The report is a disjunction, and the OR is the entire difficulty. WHERE area >= 3000000 OR population >= 25000000 keeps a row when EITHER arm is TRUE — Aurelia qualifies on area alone with 12,000,000 people, Borealia on population alone with 900,000 area — while the accidental AND, the most common corruption of this query, keeps only rows where both hold and collapses the report to Cindralon. The two readings look similar and differ by two countries; the statement's 'either threshold alone' is the sentence that decides it.",
      "Duplication is a non-worry worth understanding rather than coding against. Cindralon satisfies both predicates, but predicates do not multiply rows — a WHERE is a per-row keep-or-drop decision, and a row that passes passes once. Rows duplicate when a JOIN fans out or when two half-reports are UNIONed together, which is why join- or union-based implementations of 'match any criterion' need dedupe discipline that the single flat predicate never does. Choosing the one-pass WHERE over the UNION is itself the lesson.",
      "The boundary is planted where it hurts. Drakmara misses both thresholds by the smallest possible margin — 2,999,999 and 24,999,999 — so it stays out under the stated >= tests, but a single dropped zero in a literal (300000 in place of 3000000) would sweep it in alongside half the catalogue. Large literals are a readability risk in their own right: counting zeros is how the near-miss row earns its keep, and the durable habit is to test any threshold predicate against the row one unit below it. That is exactly the job this seed's tail does — Drakmara punishes the typo, Emberton proves the small rows were never in play.",
    ],
    edges: [
      "The OR-to-AND corruption keeps only Cindralon — Aurelia (population 12,000,000) and Borealia (area 900,000) die with it, and the report silently loses two of its three rows.",
      "Cindralon satisfies both arms and still ships exactly one row — predicates filter, they never fan out; only a join or a UNION of half-reports duplicates it, and then DISTINCT becomes load-bearing instead of decorative.",
      "Drakmara at 2,999,999 / 24,999,999 is the boundary row: it fails the stated >= tests AND would fail strict > versions too, so flipping the operator changes nothing here — the near-miss audits the CONSTANTS, where one dropped zero admits it.",
      "Emberton (400,000, 8,000,000) is under both thresholds by a wide margin — it exists so the report is not 'everything except the near-miss', keeping the exclusion honest.",
    ],
    ladder: [
      { title: "Brute force — eyeball both columns", body: "Read each row, check area against 3,000,000, then population against 25,000,000, keep the hits, sort by name. The engine runs the same pass as one WHERE with an OR." },
      { title: "The pattern — one WHERE, two arms", body: "WHERE area >= 3000000 OR population >= 25000000 keeps each row that passes either test; the projection picks the four report columns and ORDER BY name finishes the contract." },
      { title: "The optimal idea — disjunction is one pass, not two", body: "O(n). The durable rules: an OR keeps rows an AND cannot (either arm suffices), a WHERE never duplicates a doubly-qualifying row, and every threshold literal deserves a planted row one unit below it." },
    ],
    approach: "WHERE area >= 3000000 OR population >= 25000000, projected to the four report columns, ORDER BY name",
    schema: {
      ddl: `CREATE TABLE Nation (
  nation_id  INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  continent  TEXT NOT NULL,
  area       INTEGER NOT NULL,
  population INTEGER NOT NULL
);`,
      seed: `INSERT INTO Nation (nation_id, name, continent, area, population) VALUES
  (1, 'Aurelia',  'Meridia',   3500000,  12000000),  -- qualifies on area alone
  (2, 'Borealia', 'Boreala',    900000,  41000000),  -- qualifies on population alone
  (3, 'Cindralon','Equatoria', 9900000, 130000000),  -- both arms: still one row
  (4, 'Drakmara', 'Australis', 2999999,  24999999),  -- one short on BOTH: out
  (5, 'Emberton', 'Polaris',    400000,   8000000);`,
      tables: [
        { name: "Nation", note: "5 countries — three big (two single-arm, one double), Drakmara one short on both thresholds, Emberton small" },
      ],
    },
    code: `SELECT
    name,
    continent,
    area,
    population
FROM Nation
WHERE area >= 3000000         -- either threshold alone qualifies
   OR population >= 25000000  -- the OR is the whole report
ORDER BY name;`,
    walkthrough: [
      "The predicate tests each of the five rows: Aurelia passes the area arm (3,500,000 >= 3,000,000) despite 12,000,000 people; Borealia passes the population arm (41,000,000) despite 900,000 area.",
      "Cindralon passes both arms and is kept once; Drakmara fails both by one unit (2,999,999, 24,999,999) and Emberton fails both by a mile — neither survives.",
      "ORDER BY name ships three rows — Aurelia, Borealia, Cindralon — each carrying all four report columns; the AND corruption would have shipped only Cindralon.",
    ],
    time: "O(n) — one scan, two comparisons per row",
    space: "O(k) — one output row per qualifying country",
    followUps: [
      "Report the COMPLEMENT — countries failing both thresholds — and prove De Morgan: NOT (area >= A OR population >= P) versus (area < A AND population < P); which two rows survive, and do the formulations agree on this seed?",
      "Add a big_class label ('area', 'population', 'both') beside every country — how does a CASE over the two predicates classify each row, and what does the label read for Drakmara and Emberton?",
    ],
    related: ["not-boring-movies", "article-views-i", "daily-leads-and-partners"],
    order: "exact",
    xp: 10,
  },
];
