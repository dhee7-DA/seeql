// Deep-dives — the SQL final classics band A: the NULL-handling warm-ups and
// ranking evergreens (LC 177 / 197 / 584 / 586 / 619). Solutions are SQLite
// dialect, one statement each, engine-verified against the per-problem seeds
// (the NULL referees, gap days, decoy counts and doubled maxima are the traps).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_CLASSICS_A: LcSqlDive[] = [
  {
    slug: "nth-highest-salary",
    statement:
      "A payroll table stores one salary per employee and nothing promises the values differ. Report the Nth highest DISTINCT salary — repeated values rank once — and return null when fewer than N distinct salaries exist; the sandbox grades the N = 3 variant, so the single output column must be aliased exactly getNthHighestSalary(3).",
    examples: [
      {
        input:
          "Employee: (1,300),(2,100),(3,500),(4,200),(5,400) — five DISTINCT salaries, ids deliberately scrambled · N = 3",
        output: "getNthHighestSalary(3): 300",
        explanation:
          "Sorted descending the distinct salaries run 500 · 400 · 300 · 200 · 100, and the third rung is 300. The ids prove storage order is salary-random — id 3 happens to hold the TOP salary while id 1 holds the third — so only an explicit sort can rank.",
      },
      {
        input:
          "A table holding just 200, 200 and 100 — three rows, only TWO distinct values · N = 3",
        output: "getNthHighestSalary(3): null",
        explanation:
          "The second-highest distinct salary is 100; no third exists, and the spec answers with the NULL ROW — not an empty table. The scalar-subquery wrapper in the solution produces exactly this shape (verified in the self-check).",
      },
    ],
    constraints: [
      "id is the primary key; each row carries exactly one employee's salary",
      "salaries may repeat — duplicates collapse to one rank",
      "fewer than N distinct salaries means the result is one row containing NULL",
    ],
    breakdown: [
      "Name what is actually being ranked: VALUES, not rows. Three employees earning 500 mean one salary of 500; a table where 400 is stored twice has four rungs on its ladder, not five. So the first move is DISTINCT — collapse duplicates before any ranking happens, or every offset below is wrong by however many twins a value has.",
      "The ranking idiom is sort-and-slice: ORDER BY salary DESC puts the biggest value first, LIMIT 1 takes one value, OFFSET N−1 skips the N−1 values above it. For the graded N = 3 that is OFFSET 2: skip 500 and 400, land on 300. The off-by-one is the classic stumble — OFFSET counts SKIPPED rows from the top and is zero-based, so it is N−1, never N.",
      "Two spec details shape the wrapper. The official problem is phrased as a function getNthHighestSalary(N), but the sandbox grades ONE fixed statement — N is baked in as 3, and the output column must carry the literal header getNthHighestSalary(3), which needs quotes in SQLite because of the parentheses. And when fewer than N distinct salaries exist, the spec demands null — one row containing NULL, not an empty result.",
      "A bare sorted-LIMIT query returns zero rows when the offset runs past the end of the list, failing that last rule. The repair is free: wrap the sort-and-slice as a SCALAR subquery in the SELECT list. A scalar subquery over an empty result is NULL by definition, so the very shape that answers the happy path also delivers the null row on the shortfall path — no CASE, no UNION, no extra branch.",
    ],
    edges: [
      "Twins count once: a doubled 400 is still one rung — DISTINCT must run before the sort-and-slice, or the OFFSET skips the wrong number of better-paid values.",
      "Shortfall means a NULL row, not zero rows: with only two distinct salaries the inner query finds nothing and the scalar wrapper prints NULL (a bare LIMIT query would print nothing at all).",
      "The alias is graded: exactly getNthHighestSalary(3), quoted — the parentheses make it illegal as a bare identifier, and graders compare headers, not just cells.",
      "OFFSET is zero-based: N−1 = 2 for N = 3 — OFFSET 3 would skip 300 too and return 200 on this seed.",
    ],
    ladder: [
      {
        title: "Brute force — count the richer",
        body: "Rank each distinct salary by how many DISTINCT salaries are strictly greater, and keep the one with exactly N−1 above it. A correlated COUNT(DISTINCT) subquery per value — correct, but it rescans per row and is easy to write against raw rows instead of distinct values.",
      },
      {
        title: "The pattern — sort, skip, take",
        body: "ORDER BY salary DESC LIMIT 1 OFFSET N−1 is the whole algorithm: one sorted pass, then arithmetic. Short, index-friendly, and the form interviewers expect to hear.",
      },
      {
        title: "The optimal idea — make emptiness mean NULL",
        body: "Wrap it as a scalar subquery so a short table yields the null row automatically. The window alternative — DENSE_RANK() OVER (ORDER BY salary DESC) over SELECT DISTINCT salary, filtered to rank = N — generalizes cleanly when several Ns are needed at once.",
      },
    ],
    approach: "Scalar subquery: distinct salaries sorted DESC, LIMIT 1 OFFSET N−1",
    schema: {
      ddl: `CREATE TABLE Employee (
  id     INTEGER PRIMARY KEY,
  salary INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (id, salary) VALUES
  (1, 300),   -- the answer: third-highest distinct salary
  (2, 100),   -- lowest
  (3, 500),   -- trap: the TOP salary hides behind a low-ish id
  (4, 200),
  (5, 400);   -- ids are scrambled: id order says nothing about rank`,
      tables: [
        { name: "Employee", note: "5 rows — salaries 100..500 all distinct, ids deliberately NOT in salary order" },
      ],
    },
    code: `-- The official header getNthHighestSalary(N) grades here as N = 3: one
-- statement, one column, aliased EXACTLY like the official output header.
SELECT (
    SELECT DISTINCT salary          -- duplicates collapse: rank VALUES, not rows
    FROM Employee
    ORDER BY salary DESC            -- highest first
    LIMIT 1                         -- take the single value we land on...
    OFFSET 2                        -- ...after skipping N-1 = 2 better-paid values
-- scalar wrapper: a missing 3rd value yields the NULL row, not zero rows
) AS "getNthHighestSalary(3)";`,
    walkthrough: [
      "The subquery sorts the seed's distinct salaries in one pass: 500 (id 3), 400 (id 5), 300 (id 1), 200 (id 4), 100 (id 2) — the id sequence shows storage order is salary-random, which is exactly why the explicit DESC sort is load-bearing.",
      "OFFSET 2 discards 500 and 400; LIMIT 1 keeps the next value, 300. The quoted alias stamps the header getNthHighestSalary(3) onto the single-cell result.",
      "Shortfall drill (probed in the self-check): on a table holding only 200, 200 and 100 there are two distinct values — the inner sort-and-slice returns nothing, and the scalar wrapper turns that emptiness into the required one-row NULL.",
    ],
    time: "O(n log n) — one scan plus the descending sort of the distinct salaries",
    space: "O(n) — the deduplicated salary list the subquery sorts",
    followUps: [
      "Rewrite with DENSE_RANK() OVER (ORDER BY salary DESC) over SELECT DISTINCT salary and filter rank = 3 — then argue why DENSE_RANK (not RANK or ROW_NUMBER) is the exact semantics of 'Nth distinct salary'.",
      "Return the EMPLOYEE earning the Nth highest salary by joining back on salary — what breaks when several employees tie on that salary, and which clause decides how many rows you owe?",
    ],
    related: ["second-highest-salary", "department-top-three-salaries", "rank-scores"],
    order: "any",
    xp: 20,
  },
  {
    slug: "rising-temperature",
    statement:
      "A Weather table logs one temperature reading per calendar day. Report the ids of the days that were strictly warmer than the previous CALENDAR day — yesterday by the calendar, whether or not that day has a row — in any order.",
    examples: [
      {
        input:
          "Weather: (1,'2015-01-01',10),(2,'2015-01-02',25),(3,'2015-01-03',20),(4,'2015-01-04',30) — the official four · traps: (5,'2015-01-31',12),(6,'2015-02-01',15) the month boundary · (7,'2015-12-31',18),(8,'2016-01-01',21) the year boundary · (9,'2016-03-10',40),(10,'2016-03-12',45) a GAP day between · (11,'2016-05-01',33),(12,'2016-05-02',33) an equal next day",
        output: "id: 2 · 4 · 6 · 8",
        explanation:
          "2 and 4 are the official warm-ups. 6 beats its yesterday because Jan 31 → Feb 1 IS consecutive — date arithmetic knows the month rolled. 8 beats its yesterday across New Year. 10 is warmer than 9 but 2016-03-11 never happened in the log, so no yesterday exists to beat; and 12 merely TIES 11 — tying is not beating.",
      },
    ],
    constraints: [
      "id is unique and no two rows share a recordDate",
      "'previous day' means the previous CALENDAR date — the log may skip days",
      "warmer is strict: an equal temperature does not qualify",
      "output rows may appear in any order",
    ],
    breakdown: [
      "Define 'previous' before writing any join: it means the previous CALENDAR day, whether or not that day was logged. The trap pair 2016-03-10 → 2016-03-12 has a silent 03-11 between them, so adjacency is a property of DATES, not of neighboring rows or of id±1. A day qualifies only if a row exists for exactly yesterday AND today's temperature beats it.",
      "The mechanism is a self-join whose ON clause IS the calendar: pair every Weather row (playing yesterday) with the row whose recordDate equals date(recordDate, '+1 day') (playing today). SQLite's date() modifier does the arithmetic — it knows 2015-01-31 + 1 = 2015-02-01 and 2015-12-31 + 1 = 2016-01-01, which string slicing and month-number comparisons do not.",
      "Why the naive shapes fail: matching on id±1 assumes ids walk day by day — one missing day mispairs everything after it. LAG(temperature) OVER (ORDER BY recordDate) pairs each row with the previous ROW, so 03-12 would 'beat' 03-10 despite the gap; it needs an explicit date guard to be correct. And the comparison must be strictly greater — the equal pair (33 on 05-01, 33 on 05-02) qualifies for nothing.",
      "Assembly: inner-join Weather to itself on the +1-day condition, keep pairs where today > yesterday, project today's id. The inner join's semantics quietly do real work: a day with no yesterday row (the log's first day, or the day after a gap) has no partner and drops out — which is exactly the spec.",
    ],
    edges: [
      "Month boundary: 2015-01-31 → 2015-02-01 is consecutive — date('+1 day') rolls the month; SUBSTR-style month comparisons call it a gap.",
      "Year boundary: 2015-12-31 → 2016-01-01 must roll the YEAR as well as the month.",
      "Gap day: 2016-03-12 is warmer than 2016-03-10, but 03-11 has no row — no yesterday exists, so id 10 must NOT appear (this is exactly where LAG-without-a-guard dies).",
      "Ties are not rises: 33 vs 33 across 05-01 → 05-02 fails the strict >.",
    ],
    ladder: [
      {
        title: "Brute force — probe for yesterday",
        body: "For each row, scan the whole table for a row dated exactly one day earlier and compare temperatures. O(n²) with a re-read per row — but it is the mental model the join mechanizes.",
      },
      {
        title: "The pattern — the calendar self-join",
        body: "JOIN Weather prev ON cur.recordDate = date(prev.recordDate, '+1 day') pairs every (yesterday, today) couple in one pass; WHERE cur.temperature > prev.temperature keeps the rises.",
      },
      {
        title: "The optimal idea — bake adjacency into ON",
        body: "The join is already the optimal pass; the discipline is WHERE the adjacency check lives. In the ON clause a gap pair can never form; with LAG you must add the guard yourself (prev_date = date(recordDate, '-1 day')) or a gapped log silently corrupts the answer.",
      },
    ],
    approach: "Self-join on date(prev, '+1 day') + strict temperature comparison",
    schema: {
      ddl: `CREATE TABLE Weather (
  id          INTEGER PRIMARY KEY,
  recordDate  TEXT NOT NULL,     -- LeetCode's DATE; SQLite keeps 'YYYY-MM-DD' strings
  temperature INTEGER NOT NULL
);`,
      seed: `INSERT INTO Weather (id, recordDate, temperature) VALUES
  (1,  '2015-01-01', 10),   -- official rows: the classic warm-up pair
  (2,  '2015-01-02', 25),   -- official: 25 > 10, consecutive — qualifies
  (3,  '2015-01-03', 20),   -- official: cooler than the day before — misses
  (4,  '2015-01-04', 30),   -- official: 30 > 20 — qualifies
  (5,  '2015-01-31', 12),   -- trap: month-boundary yesterday
  (6,  '2015-02-01', 15),   -- trap: Jan 31 -> Feb 1 IS consecutive; 15 > 12 — qualifies
  (7,  '2015-12-31', 18),   -- trap: year-boundary yesterday
  (8,  '2016-01-01', 21),   -- trap: Dec 31 -> Jan 1 IS consecutive; 21 > 18 — qualifies
  (9,  '2016-03-10', 40),   -- trap: 03-11 is MISSING from the log...
  (10, '2016-03-12', 45),   -- trap: ...so 45 is warmer, but NOT warmer than YESTERDAY
  (11, '2016-05-01', 33),   -- trap: equal-temperature pair
  (12, '2016-05-02', 33);   -- trap: equal is not higher — misses`,
      tables: [
        { name: "Weather", note: "12 rows — the official four, plus month-boundary, year-boundary, gap-day and equal-day traps" },
      ],
    },
    code: `SELECT cur.id                     -- id of the WARMER (today) day
FROM Weather cur
JOIN Weather prev
  ON cur.recordDate = date(prev.recordDate, '+1 day')  -- prev is YESTERDAY on the calendar
WHERE cur.temperature > prev.temperature               -- strictly higher: ties never qualify
-- spec allows any order; id order keeps the snapshot stable
ORDER BY cur.id;`,
    walkthrough: [
      "The ON clause pairs six (prev, cur) couples from the twelve rows: (1,2), (2,3), (3,4), (5,6), (7,8) and (11,12). Row 9 finds no partner because 2016-03-11 never happened — the tempting 03-10 → 03-12 'rise' never even forms.",
      "The temperature gate: 25 > 10 keeps id 2; 20 > 25 drops; 30 > 20 keeps id 4; 15 > 12 keeps id 6; 21 > 18 keeps id 8; 33 > 33 fails, killing id 12.",
      "The calendar did the heavy lifting invisibly: date('2015-01-31','+1 day') = '2015-02-01' matched id 6 to id 5 across the month turn, and date('2015-12-31','+1 day') = '2016-01-01' matched id 8 to id 7 across New Year.",
      "The survivors are ids 2, 4, 6, 8 — printed in id order by the trailing ORDER BY (the spec itself allows any order).",
    ],
    time: "O(n log n) — the pairing is a sort-merge on recordDate; the brute-force probe is O(n²)",
    space: "O(n) — the joined (yesterday, today) pairs",
    followUps: [
      "Rewrite with LAG(temperature) OVER (ORDER BY recordDate) plus the guard that the lagged date equals date(recordDate, '-1 day') — then run it with the guard removed and watch id 10 sneak in.",
      "Find the longest unbroken warming streak (consecutive days, each warmer than the last) — a gaps-and-islands chain over date(recordDate, '+1 day').",
    ],
    related: ["average-time-of-process-per-machine", "the-latest-login-in-2020", "restaurant-growth"],
    order: "any",
    xp: 10,
  },
  {
    slug: "find-customer-referee",
    statement:
      "A customer table lists each shopper plus, when it exists, the id of the customer who referred them. Return the names of customers who were either referred by someone other than customer 2 or not referred by anyone at all.",
    examples: [
      {
        input:
          "Customer: (1,'Will',null),(2,'Jane',null),(3,'Alex',2),(4,'Bill',null),(5,'Zack',1),(6,'Mark',2) — the official six · traps: (7,'Ruth',5) referred by a NON-2 customer · (8,'Omar',null) one more NULL referee",
        output: "name: Will · Jane · Bill · Zack · Ruth · Omar",
        explanation:
          "The NULL referees (Will, Jane, Bill — plus trap Omar) were never referred, so they pass. Zack and Ruth were referred by 1 and 5 — anyone except customer 2 passes. Alex and Mark were referred BY customer 2 and are the only exclusions.",
      },
    ],
    constraints: [
      "id is the primary key; referee_id is nullable — NULL means 'not referred by anyone'",
      "the only forbidden referral is referee_id = 2; every other referee passes",
      "output rows may appear in any order",
    ],
    breakdown: [
      "Sort the request into its two buckets first: customers referred by anyone EXCEPT customer 2, and customers with no referrer at all. The seed has both kinds — Zack (referee 1) and Ruth (referee 5) in the first bucket; Will, Jane, Bill and Omar (NULL) in the second. Only Alex and Mark, referred by 2, are excluded.",
      "The trap is three-valued logic. referee_id <> 2 looks like it covers 'not referred by 2', but on a NULL referee_id the comparison evaluates to NULL — neither true nor false — and WHERE keeps only true rows. So the naive one-liner silently deletes every never-referred customer: on this seed it returns just Zack and Ruth, losing four of the eight answers without any error.",
      "The repair is to make absence explicit: referee_id IS NULL OR referee_id <> 2 gives every row a true arm — NULL rows pass the first arm, referred-by-someone-else rows pass the second. SQLite also offers the NULL-aware comparison directly: referee_id IS DISTINCT FROM 2 is true exactly when the value exists and differs, collapsing the two arms into one predicate.",
      "Assembly is minimal — one table, one WHERE, one projected column. The problem is a litmus test for whether you reach for IS NULL before the grader does; nothing else in it is hard.",
    ],
    edges: [
      "NULL referees: four of the eight seed rows — the bare <> 2 filter erases them all with no error, just missing names.",
      "NULL <> 2 evaluates to NULL (unknown), not FALSE — three-valued logic drops the row, which is the opposite of what the English asks for.",
      "Referees 1 and 5 must stay: the blacklist is customer 2 only — answering IS NULL-only loses Zack and Ruth.",
      "One-predicate alternative: referee_id IS DISTINCT FROM 2 (or SQLite's IS NOT 2) — NULL-safe inequality in a single term.",
    ],
    ladder: [
      {
        title: "Brute force — two passes, unioned",
        body: "Query the never-referred with IS NULL, query the referred-but-not-2 with <> 2, glue with UNION. Correct and explicit — but the two arms are exactly one WHERE's OR apart.",
      },
      {
        title: "The pattern — one WHERE, two arms",
        body: "WHERE referee_id IS NULL OR referee_id <> 2 — every row finds a true arm, NULLs included. The canonical interview answer.",
      },
      {
        title: "The optimal idea — NULL-safe inequality",
        body: "referee_id IS DISTINCT FROM 2 says 'not equal, and NULL counts as different' in one predicate. Same single scan, fewer moving parts, and it composes into bigger filters without an OR arm per nullable column.",
      },
    ],
    approach: "NULL-safe WHERE: IS NULL OR <> 2 (or IS DISTINCT FROM)",
    schema: {
      ddl: `CREATE TABLE Customer (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  referee_id INTEGER            -- nullable: NULL = referred by nobody
);`,
      seed: `INSERT INTO Customer (id, name, referee_id) VALUES
  (1, 'Will', NULL),   -- official: never referred
  (2, 'Jane', NULL),   -- official
  (3, 'Alex', 2),      -- official: referred BY customer 2 — the only exclusion kind
  (4, 'Bill', NULL),   -- official
  (5, 'Zack', 1),      -- official: referred by 1 ≠ 2 — kept
  (6, 'Mark', 2),      -- official: referred by 2 — excluded
  (7, 'Ruth', 5),      -- trap: referred by a NON-2 customer — the filter is about 2 only
  (8, 'Omar', NULL);   -- trap: one more NULL referee — the <> 2 trap's favorite victim`,
      tables: [
        { name: "Customer", note: "8 rows — four NULL referees, two referred by 2 (excluded), two referred by others (kept)" },
      ],
    },
    code: `-- NULL-safe filter: the OR's first arm rescues the customers that <> 2 erases.
-- (SQLite also accepts the single predicate referee_id IS DISTINCT FROM 2.)
SELECT name
FROM Customer
WHERE referee_id IS NULL          -- never referred: NULL fails every <> comparison...
   OR referee_id <> 2             -- ...so this arm alone would silently drop them
-- spec allows any order; alphabetical keeps the snapshot stable
ORDER BY name;`,
    walkthrough: [
      "Walk the WHERE row by row: Will, Jane, Bill and Omar evaluate referee_id IS NULL to true and pass on arm one; Zack (referee 1) and Ruth (referee 5) fail arm one but pass referee_id <> 2 on arm two.",
      "Alex (2) and Mark (2) fail arm one (not NULL) and arm two (2 <> 2 is false) — the only two rows dropped from the eight.",
      "Compare with the naive predicate: WHERE referee_id <> 2 alone passes only Zack and Ruth — Will, Jane, Bill and Omar vanish because their comparisons came back NULL, not true. The OR arm is the entire fix (the self-check probes this).",
      "The projection is just name, so the output is six names; the statement orders them alphabetically for a stable snapshot even though the spec allows any order.",
    ],
    time: "O(n) — one filter scan over the table",
    space: "O(1) beyond the output — no join, no sort input",
    followUps: [
      "Verify all three forms agree on this seed: IS NULL OR <> 2, IS DISTINCT FROM 2, and IS NOT 2 — then explain why NOT IN (SELECT 2) is a different beast when the subquery itself can return NULLs.",
      "Report referral counts per referee with a 'no referral' bucket — GROUP BY COALESCE(referee_id, 0) or CASE, and why the NULL bucket needs a label to be readable.",
    ],
    related: ["customers-who-never-order", "not-boring-movies", "confirmation-rate"],
    order: "any",
    xp: 10,
  },
  {
    slug: "customer-placing-the-largest-number-of-orders",
    statement:
      "An orders ledger stores one row per order with the buying customer's number. Report the customer_number of the customer with the most orders; the data guarantees exactly one such leader.",
    examples: [
      {
        input:
          "Orders: (1,1),(2,2),(3,3),(4,3) — the official four · traps: (5,3) the leader's third order · (6,7),(7,7) decoy customer 7, whose two orders would have WON the official data",
        output: "customer_number: 3",
        explanation:
          "Counts: customer 3 → three orders, customer 7 → two (one short), customers 1 and 2 → one each. The guarantee says a single strict winner exists, so the leader is unambiguous; the decoy exists to make 'largest' mean LARGEST, not 'first count above one'.",
      },
    ],
    constraints: [
      "order_number is the primary key; one row per order",
      "exactly one customer has strictly more orders than every other customer",
      "the answer is that single customer_number — nothing else",
    ],
    breakdown: [
      "The problem is a grain shift: the table is one row per ORDER, the question needs one row per CUSTOMER's tally, and then an argmax over those tallies. So the shape is: group, count, sort, take. Everything else is trap-dodging.",
      "GROUP BY customer_number collapses the seed's seven rows into four buckets — customers 1, 2, 3 and 7 with counts 1, 1, 3 and 2. ORDER BY COUNT(*) DESC puts the busiest bucket first and LIMIT 1 takes it: customer 3. The LIMIT is not a hack; the guarantee ('exactly one customer will have placed more orders than any other') is precisely the license to take one row.",
      "Why the naive shapes fail: MAX(customer_number) returns the largest ID (7 here), not the busiest customer — ids carry no count. Skipping the sort and grabbing an arbitrary grouped row is equally wrong, because customers 1 and 2 sit in the same result set with one order apiece. And DISTINCT adds nothing: the buckets are already distinct.",
      "The decoy customer 7 with two orders is the stress test: on the raw official four rows any count above one wins outright, but with 7 in play a tally of two is no longer a winning tally — so a solution that merely finds 'a customer with more than one order' hands back the wrong customer. The tie-proof variant — HAVING COUNT(*) = (SELECT MAX(cnt) FROM (per-customer counts)) — is the official follow-up and returns every winner the moment the guarantee is lifted.",
    ],
    edges: [
      "Decoy count: customer 7's two orders would have won the official data — proof that 'largest' needs the full ranking, not a threshold check.",
      "LIMIT 1 under a tie picks arbitrarily — only the single-winner guarantee makes it deterministic; the HAVING = MAX(count) subquery is the tie-safe rewrite.",
      "MAX(customer_number) is the biggest ID, not the busiest shopper — aggregates over ids answer identity questions, not count questions.",
      "The output is customer_number only — projecting COUNT(*) alongside fails the header check.",
    ],
    ladder: [
      {
        title: "Brute force — count per candidate",
        body: "For each customer, run a correlated (SELECT COUNT(*) FROM Orders o2 WHERE o2.customer_number = o1.customer_number), then keep the customer with the maximum tally. O(n²) over order rows, logically exact.",
      },
      {
        title: "The pattern — group, sort, take one",
        body: "GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1 — one grouped pass and a sort. The guarantee licenses LIMIT 1.",
      },
      {
        title: "The optimal idea — make the winner tie-proof",
        body: "HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT COUNT(*) AS cnt FROM Orders GROUP BY customer_number)) returns ALL top customers with no LIMIT — the shape to reach for the moment the guarantee is dropped. A RANK() window over the counts is the same idea in window dress.",
      },
    ],
    approach: "GROUP BY customer + ORDER BY COUNT(*) DESC LIMIT 1",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_number    INTEGER PRIMARY KEY,
  customer_number INTEGER NOT NULL
);`,
      seed: `INSERT INTO Orders (order_number, customer_number) VALUES
  (1, 1),   -- official: customer 1 orders once
  (2, 2),   -- official: customer 2 orders once
  (3, 3),   -- official: customer 3's first order
  (4, 3),   -- official: customer 3's second — the official winner
  (5, 3),   -- trap: a third order — the leader pulls further ahead
  (6, 7),   -- trap: decoy customer 7's first order
  (7, 7);   -- trap: decoy's second — under the OFFICIAL four rows this tally would win`,
      tables: [
        { name: "Orders", note: "7 rows — customer 3 leads with 3 orders, decoy customer 7 has 2, customers 1 and 2 have 1 each" },
      ],
    },
    code: `SELECT customer_number
FROM Orders
GROUP BY customer_number        -- one bucket per customer
ORDER BY COUNT(*) DESC          -- busiest bucket first
-- legal ONLY because the data guarantees a single winner
LIMIT 1;`,
    walkthrough: [
      "GROUP BY builds four buckets: customer 1 holds order 1, customer 2 holds order 2, customer 3 holds orders 3, 4 and 5, customer 7 holds orders 6 and 7.",
      "The counts read 1, 1, 3, 2; ORDER BY COUNT(*) DESC lines them up as customer 3, customer 7, then the two single-order customers.",
      "LIMIT 1 returns customer 3 — and the decoy is what makes the sort earn its keep: customer 7's tally of two beats everything EXCEPT the leader, so any shortcut that stops at the first count above one hands back 7.",
      "Tie drill (probed in the self-check): inserting an eighth order for customer 7 would leave LIMIT 1 guessing between 3 and 7; the HAVING-equals-MAX form returns both — that is the official follow-up, answered.",
    ],
    time: "O(n log n) — the grouping pass plus the count sort; the correlated brute force is O(n²)",
    space: "O(k) — one row per distinct customer in the grouped intermediate",
    followUps: [
      "The official follow-up: find EVERY customer tied for the most orders — HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT COUNT(*) AS cnt FROM Orders GROUP BY customer_number)) — and explain why MAX(COUNT(*)) cannot nest directly inside HAVING.",
      "Same answer with windows: COUNT(*) OVER (PARTITION BY customer_number), then RANK() OVER (ORDER BY the count DESC) — where does the dedupe go?",
    ],
    related: ["friend-requests-ii-who-has-the-most-friends", "sales-analysis-i", "classes-more-than-5-students"],
    order: "any",
    xp: 10,
  },
  {
    slug: "biggest-single-number",
    statement:
      "A number table has no primary key, so values may repeat any number of times; a single number is one that appears exactly once. Report the largest single number — and if nothing is single, report null as one row carrying NULL, never an empty result.",
    examples: [
      {
        input:
          "MyNumbers: 8, 8, 3, 3, 1, 4, 5, 6 — the official example: 8 and 3 doubled, the rest single",
        output: "num: 6",
        explanation:
          "The singles are 1 · 4 · 5 · 6, and the largest is 6. Note 8 is the largest value in the table yet appears TWICE — biggest and single are separate gates, and 8 fails the second one.",
      },
    ],
    constraints: [
      "MyNumbers has NO primary key — a value can appear many times",
      "a single number appears exactly once",
      "no single number means one output row containing NULL",
    ],
    breakdown: [
      "Two gates run in sequence: first UNIQUENESS (a value must occur exactly once), then MAXIMUM over whatever survives. The seed makes the order matter: 8 is the largest value in the table but occurs twice, so it fails gate one and never reaches gate two — 'biggest' and 'single' are independent filters.",
      "Gate one is a grouped query: GROUP BY num HAVING COUNT(*) = 1 turns the eight seed rows into the singles set {1, 4, 5, 6} (8 and 3 have counts of 2). Gate two is an aggregate over that set: MAX(num) reads 6.",
      "The NULL clause is what separates the solvers. When NO number is single — the official second example (8, 8, 7, 7, 3, 3, 3) — the grouped query returns ZERO rows: HAVING filters every bucket out. But the spec says report null, meaning one row carrying NULL. A grouped query cannot produce a row that belongs to no group; an aggregate with NO GROUP BY always produces exactly one row — and MAX over an empty set is the canonical NULL factory.",
      "So the winning shape inverts the naive one: make the singles a subquery and put MAX on the outside — SELECT MAX(num) FROM (…GROUP BY num HAVING COUNT(*) = 1). The outer query has no GROUP BY, hence always one row; its value is the biggest single, or NULL when the subquery is empty. Alias it AS num so the header matches.",
    ],
    edges: [
      "Doubled maximum: 8 appears twice and is excluded — computing MAX before the HAVING (over the whole table) returns 8 and is wrong.",
      "No singles means a NULL row, not an empty result: the official example-2 seed (8,8,7,7,3,3,3) must print one row with NULL (probed in the self-check).",
      "The bare GROUP BY/HAVING answer and the ORDER BY num DESC LIMIT 1 answer BOTH return zero rows on the empty case — only the outer aggregate converts emptiness into NULL.",
      "Header check: the output column is num — alias MAX(num) AS num or the grader sees a different name.",
    ],
    ladder: [
      {
        title: "Brute force — count per value",
        body: "For each distinct value, count its occurrences with a correlated subquery, keep the values with count 1, and take the max. O(n²)-ish — and it still has to solve the NULL-row contract on top.",
      },
      {
        title: "The pattern — HAVING the singles",
        body: "GROUP BY num HAVING COUNT(*) = 1 is the singles set in one grouped pass. Elegant — and quietly wrong as a final answer, because it collapses to zero rows exactly when the spec demands a NULL.",
      },
      {
        title: "The optimal idea — aggregate on the outside",
        body: "SELECT MAX(num) FROM (the singles) — one row by construction, NULL-capable for free. The lesson generalizes: whenever a spec says 'report null when empty', reach for an outer aggregate, not LIMIT.",
      },
    ],
    approach: "GROUP BY + HAVING COUNT(*) = 1, then MAX over the singles",
    schema: {
      ddl: `CREATE TABLE MyNumbers (
  num INTEGER NOT NULL   -- no primary key: duplicates are the whole point
);`,
      seed: `INSERT INTO MyNumbers (num) VALUES
  (8), (8),   -- official: the biggest value overall — but it appears TWICE
  (3), (3),   -- official: also doubled
  (1),        -- official: single but small
  (4),        -- official: single
  (5),        -- official: single
  (6);        -- official: the largest SINGLE number — the answer`,
      tables: [
        { name: "MyNumbers", note: "8 rows, no key — 8 and 3 doubled; singles are 1, 4, 5, 6" },
      ],
    },
    code: `SELECT MAX(num) AS num              -- MAX over an EMPTY set prints NULL, not zero rows
FROM (
    SELECT num
    FROM MyNumbers
    GROUP BY num
    HAVING COUNT(*) = 1             -- keep values that occur EXACTLY once
-- no GROUP BY outside: the answer is ALWAYS one row, NULL-capable
) singles;`,
    walkthrough: [
      "GROUP BY buckets the seed: 8 → two rows, 3 → two rows, and 1, 4, 5, 6 → one row each.",
      "HAVING COUNT(*) = 1 keeps {1, 4, 5, 6}; 8's bucket dies at count 2 — the table's largest value never becomes a candidate at all.",
      "The outer MAX reads {1, 4, 5, 6} and prints 6 under the header num.",
      "Empty drill (probed in the self-check): on the official example-2 rows 8,8,7,7,3,3,3 the HAVING kills every bucket, the derived table is empty, and MAX over nothing still emits exactly one row — NULL, as mandated.",
    ],
    time: "O(n) — one grouped count pass; the MAX rides on its k-row output",
    space: "O(k) — one row per distinct value in the subquery",
    followUps: [
      "Why does the window rewrite — COUNT(*) OVER (PARTITION BY num) = 1, then MAX — still need the outer aggregate? Trace what the inner query returns on the no-singles seed.",
      "Change 'single' to 'occurs exactly twice': which tokens move, and does the NULL-when-empty contract survive? (It does — the shape is the point.)",
    ],
    related: ["duplicate-emails", "second-highest-salary", "classes-more-than-5-students"],
    order: "any",
    xp: 10,
  },
];
