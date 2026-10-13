// Deep-dives — the SQL Extras windows band: consecutive runs & window
// classics (LC 180 / 1204 / 1454 / 1321). Solutions are SQLite dialect, one
// statement each, engine-verified against the per-problem seeds (the
// same-day duplicates, boundary weights, 4-runs and gap days are the traps).
import type { LcSqlDive } from "../types";

export const SQL_EXTRAS_WINDOWS: LcSqlDive[] = [
  {
    slug: "consecutive-numbers",
    statement:
      "A log stream carries one number per record, and record ids grow by exactly one with each entry. Report every number that shows up in at least three back-to-back records — somewhere in the stream, three adjacent ids carry the same num.",
    examples: [
      {
        input:
          "Logs: (1,1),(2,1),(3,1),(4,2),(5,1),(6,2),(7,2) — then the traps: (8,3),(9,3),(10,3),(11,3) a 4-run, (12,4) a loner, (13,5),(14,5),(15,5) another 3-run",
        output: "ConsecutiveNums: 1 · 3 · 5",
        explanation:
          "ids 1–3 carry three straight 1s; ids 8–11 are FOUR straight 3s — rows 8 and 9 both anchor a qualifying window, and DISTINCT merges them into one 3; ids 13–15 run 5s. The 2-run at ids 6–7 and the lone 4 never reach three.",
      },
    ],
    constraints: [
      "id is the primary key and increases by 1 per record",
      "num may repeat anywhere in the stream, runs and otherwise",
      "a run of 3+ qualifies the NUMBER once — not each contributing row",
    ],
    breakdown: [
      "Define 'consecutive' before touching SQL: ids increment by one per record, so three back-to-back records are ids i, i+1, i+2 — adjacency in the id column. Note what the answer IS: a set of num values, not rows. That simplification earns a lot — you need one qualifying window per run, not every row of it.",
      "The classic machine is the three-way self-join: three copies of Logs where copy two sits at id+1 and copy three at id+2, and the WHERE demands all three nums equal. Each row of Logs gets tried as a window START. It's the pre-window-function idiom, it's still the most common interview answer, and it's worth being able to write cold.",
      "The window rewrite sorts by id once and staples the next two numbers onto every row: LEAD(num,1) and LEAD(num,2) OVER (ORDER BY id). 'This row starts a run of three' collapses to num = next1 AND next1 = next2 — one pass, no alias juggling, and (unlike the id+1 arithmetic) it survives gapped ids because it trusts row order, not subtraction.",
      "DISTINCT is not decoration. A run of k fires k−2 start-windows: the seed's 4-run of 3s makes BOTH row 8 and row 9 pass the gate, printing 3 twice without the dedupe. The flip side: because the answer is a set of numbers, only the START position is needed — the sibling Stadium problem (601) returns rows, so it needs start/middle/end gates on top of its own dedupe.",
    ],
    edges: [
      "A 4-run qualifies via two overlapping windows — DISTINCT is what turns many firings into one number (drop it and 3 prints twice).",
      "2-runs (ids 6–7) and loners (id 12) must not appear; the third equality is exactly what kills them.",
      "Tail rows have NULL neighbours — next2 is NULL on the last row, and NULL = x is never true, so the gate fails for free.",
      "The output column must be aliased exactly ConsecutiveNums; graders compare column names, not just values.",
    ],
    ladder: [
      {
        title: "Brute force — hunt successors per row",
        body: "For each log row, scan for a row with id+1 and one with id+2 carrying the same num — two correlated EXISTS probes per row, O(n²)-ish and unreadable. The set-based forms below do the same hunt in one pass.",
      },
      {
        title: "The pattern — consecutive as a self-join on offsets",
        body: "FROM Logs l1 JOIN Logs l2 ON l2.id = l1.id + 1 JOIN Logs l3 ON l3.id = l1.id + 2 WHERE l1.num = l2.num AND l2.num = l3.num, wrapped in DISTINCT. Three anchors, one window shape, O(n) with the PK index.",
      },
      {
        title: "The optimal idea — bring neighbours to the row with LEAD",
        body: "One ordered pass: LEAD(num,1)/LEAD(num,2) OVER (ORDER BY id), then a two-term equality gate. Same O(n) but a single table scan, and the same DISTINCT discipline applies — the run length, not the technique, creates the duplicates.",
      },
    ],
    approach: "LEAD(1)/LEAD(2) window over id order + DISTINCT",
    schema: {
      ddl: `CREATE TABLE Logs (
  id  INTEGER PRIMARY KEY,
  num INTEGER NOT NULL
);`,
      seed: `INSERT INTO Logs (id, num) VALUES
  (1,1),(2,1),(3,1),          -- official run of three 1s
  (4,2),
  (5,1),
  (6,2),(7,2),                -- run of only TWO 2s: must not qualify
  (8,3),(9,3),(10,3),(11,3),  -- engineered 4-run: two windows fire, DISTINCT merges
  (12,4),                     -- a loner between runs
  (13,5),(14,5),(15,5);       -- second qualifying run`,
      tables: [
        { name: "Logs", note: "15 records — two clean 3-runs, one 4-run, one 2-run, one loner" },
      ],
    },
    code: `SELECT DISTINCT
    num AS ConsecutiveNums     -- a k-run fires k-2 windows; DISTINCT is the dedupe
FROM (
    SELECT
        num,
        LEAD(num, 1) OVER (ORDER BY id) AS next1,   -- the next record's number
        LEAD(num, 2) OVER (ORDER BY id) AS next2    -- and the one after that
    FROM Logs
) w
WHERE num = next1              -- this row starts a run...
  AND next1 = next2            -- ...at least three records long
ORDER BY ConsecutiveNums;`,
    walkthrough: [
      "The subquery walks Logs in id order and staples next1/next2 onto every row: id 1 carries (1,1), id 6 carries (2,3), id 8 carries (3,3) — and so does id 9, because the 4-run has a second start.",
      "The gate num = next1 AND next1 = next2 keeps ids 1 (the 1-run), 8 and 9 (the 3-run firing twice) and 13 (the 5-run) — four rows carrying three distinct numbers.",
      "id 6 dies because its next2 is the 3 at id 8: a run of two 2s cannot fake a third. id 12 sits between a 3-run and a 5-run — neighbours unequal in every direction.",
      "DISTINCT collapses {1, 3, 3, 5} to {1, 3, 5}; the duplicate 3 existed precisely because ids 8–11 run longer than three.",
    ],
    time: "O(n log n) — one pass plus the window's ORDER BY id sort (a primary key, so nearly free); the three-way self-join is also O(n) but scans three aliases",
    space: "O(n) — the windowed subquery",
    followUps: [
      "Rewrite it as the classic three-way self-join on l2.id = l1.id + 1 / l3.id = l1.id + 2 — then ask which version still works if ids can have gaps (LEAD does: it trusts row order, not arithmetic).",
      "Return the streak ROWS instead of the numbers (cf. Human Traffic of Stadium) — why does that force start/middle/end gates AND a different dedupe story?",
    ],
    related: ["human-traffic-of-stadium", "active-users", "exchange-seats"],
    order: "any",
    xp: 20,
  },
  {
    slug: "last-person-to-fit-in-the-bus",
    statement:
      "People queue for a gondola rated at 1000 kg and board strictly in turn order, starting at turn 1. Name the last passenger who actually boards — boarding stops the moment letting the next person aboard would push the accumulated weight past the limit.",
    examples: [
      {
        input:
          "Queue: (5,'Alice',250,turn 1) · (1,'Alex',350,2) · (7,'Chir',400,3) · (4,'Bolt',100,4) · (2,'Dina',150,5) — gondola limit 1000 kg",
        output: "Chir",
        explanation:
          "Prefix sums by turn: 250 → 600 → 1000 (exactly at the limit — still fits) → 1100 → 1250. Chir boards last; Bolt's light 100 kg doesn't save him because the gondola is already full, and Dina behind him is out for the same reason.",
      },
    ],
    constraints: [
      "turn values are unique and start at 1 — boarding order is turn, not person_id",
      "weights are positive; the limit is exactly 1000",
      "a passenger boards iff the running total WITH them stays <= 1000",
    ],
    breakdown: [
      "The queue is a sequence, and the natural primitive for a sequence is a running total. 'Would the gondola still fit if I boarded?' translates per-row into: the sum of weights over all turns up to mine is <= 1000. Phrase the question that way and the running aggregate writes itself.",
      "The boarding timeline is turn — NOT row order, NOT person_id. The seed deliberately scatters ids (5, 1, 7, 4, 2) while turns run 1..5; every wrong answer to this problem starts with an ORDER BY person_id or a self-join that forgot to compare turns. SUM(weight) OVER (ORDER BY turn) makes turn the timeline explicitly.",
      "The last person aboard is the MAX turn whose running total still fits. Because every weight is positive, the running total only climbs — the fitting rows are exactly the prefix turns 1..k, so 'max fitting turn' and 'where the queue stops' are the same k. (Weights of zero would keep the prefix shape; there are none, and negative weights don't exist.)",
      "Mechanically, the running total can't live in WHERE — window functions aren't visible until after SELECT — so a CTE computes the prefix sums and the outer query filters and picks. This 'window in a CTE, filter outside' shape is the same move as every top-k-per-group problem.",
    ],
    edges: [
      "The boundary is <=: Chir lands the total on EXACTLY 1000 and boards — a strict < drops the correct answer.",
      "person_id order is bait: Alice (id 5) boards first, Dina (id 2) last.",
      "After the first overload (Bolt, 1100) later passengers stay out too — even light ones (Dina, 150). The answer is the last fitting turn, not 'the lightest latecomer'.",
      "The output is ONE name, not the manifest — pick the max fitting turn (ORDER BY turn DESC LIMIT 1).",
    ],
    ladder: [
      {
        title: "Brute force — pair-count every prefix",
        body: "For each passenger, add up everyone with a smaller-or-equal turn: a self-join on t2.turn <= t1.turn grouped by passenger, HAVING the sum fit. O(n²) pair counting, but logically exact — and the classic pre-window answer.",
      },
      {
        title: "The pattern — the running-aggregate window",
        body: "SUM(weight) OVER (ORDER BY turn) computes ALL prefix sums in one sorted pass. It is literally the self-join's output produced in O(n log n); every 'running total' request in SQL is this function.",
      },
      {
        title: "The optimal idea — window, gate, pick",
        body: "Prefix sums <= 1000 keep exactly turns 1..k; ORDER BY turn DESC LIMIT 1 returns passenger k. One CTE, one sort, no join — the minimal expression of the whole problem.",
      },
    ],
    approach: "Running SUM OVER (ORDER BY turn) + last fitting turn",
    schema: {
      ddl: `CREATE TABLE Queue (
  person_id   INTEGER PRIMARY KEY,
  person_name TEXT NOT NULL,
  weight      INTEGER NOT NULL,
  turn        INTEGER NOT NULL UNIQUE
);`,
      seed: `INSERT INTO Queue (person_id, person_name, weight, turn) VALUES
  (5, 'Alice', 250, 1),   -- official rows: id order != boarding order
  (1, 'Alex',  350, 2),
  (7, 'Chir',  400, 3),   -- running total lands on exactly 1000: the <= boundary
  (4, 'Bolt',  100, 4),   -- 1100: first overload, despite a tiny weight
  (2, 'Dina',  150, 5);   -- trap: light, but the gondola is already full`,
      tables: [
        { name: "Queue", note: "5 passengers; prefix sums 250 / 600 / 1000 / 1100 / 1250 — only turns 1–3 fit" },
      ],
    },
    code: `WITH boarded AS (
    SELECT
        person_name,
        turn,
        SUM(weight) OVER (ORDER BY turn) AS running_weight  -- turn is the boarding timeline
    FROM Queue
)
SELECT person_name
FROM boarded
WHERE running_weight <= 1000   -- exactly 1000 still fits — the seed hits it
ORDER BY turn DESC
LIMIT 1;                       -- the LAST passenger the running total allows`,
    walkthrough: [
      "The window sorts the five passengers by turn and stamps prefix sums onto each row: Alice 250, Alex 600, Chir 1000, Bolt 1100, Dina 1250.",
      "The CTE hands those rows to the outer filter, which keeps running_weight <= 1000: turns 1–3 survive. Chir sits exactly ON the limit — the <= is doing real work.",
      "Bolt's 100 kg looks harmless alone, but the running total says 1100 — the gondola is full — and Dina after him inherits the same verdict. Any check keyed on individual weights boards one of them wrongly.",
      "ORDER BY turn DESC + LIMIT 1 hands back turn 3: Chir, the last name on the manifest.",
    ],
    time: "O(n log n) — the running-sum window's ORDER BY turn sort; the self-join rewrite is O(n²) pair counting",
    space: "O(n) — the CTE holding prefix sums",
    followUps: [
      "Drop the LIMIT and return the whole boarding manifest — every passenger with their running weight (that query is already written by the CTE).",
      "What if a weight could be 0 (a toddler rides free)? The total stops being strictly increasing — does 'max fitting turn' still equal 'where the queue stops'?",
    ],
    related: ["restaurant-growth", "game-play-analysis-iii", "average-selling-price"],
    order: "any",
    xp: 20,
  },
  {
    slug: "active-users",
    statement:
      "An app stores one row per sign-in, and nothing stops an account from signing in several times on the same date. List the names of accounts that signed in on five or more CONSECUTIVE calendar days — a streak measured in distinct days, not raw rows.",
    examples: [
      {
        input:
          "Accounts: (1,'Winston'),(7,'Jonathan'),(3,'Maya'),(9,'Ravi') · Logins: Jonathan 05-30, 05-31, 06-01, 06-02, 06-02 AGAIN, 06-03 · Maya 06-10..06-15 daily · Winston 05-30, 06-05, 06-07 · Ravi 07-01..07-04 (07-02 twice) then 07-08..07-10",
        output: "Jonathan · Maya",
        explanation:
          "Jonathan's DISTINCT dates span 05-30 to 06-03 — five straight days across the month boundary despite the double 06-02. Maya's six straight days anchor two overlapping 5-windows; DISTINCT prints her once. Ravi tops out at four; Winston never links two.",
      },
    ],
    constraints: [
      "Logins.id is NOT unique — the same account may log in several times a day",
      "login_date is a YYYY-MM-DD string; streaks run on distinct calendar days",
      "five consecutive days means d, d+1, d+2, d+3, d+4 all present for some d",
    ],
    breakdown: [
      "Read the schema warning first: Logins has NO key on id. Several rows per (id, date) are legal, and the seed contains exactly that — Jonathan logs in twice on 06-02. Any streak logic that walks raw rows treats that duplicate as two calendar days; row-counts inflate while day-counts don't, and the math fails in ways that are maddening to debug.",
      "Normalize the grain before measuring anything. A streak is a property of DISTINCT (id, date) pairs, so CTE one is SELECT DISTINCT id, login_date FROM Logins. After that, each user's dates form a sorted set of calendar days and 'the next date' finally means something.",
      "The streak test, window style: PARTITION BY id, ORDER BY login_date, and let LEAD(login_date, k) fetch the k-th next DISTINCT date. Requiring d+1, d+2, d+3 and d+4 to all be present is exactly 'five consecutive days'. date(x, '+1 day') does the calendar arithmetic — it knows 05-31 → 06-01; string tricks and numeric subtraction don't.",
      "The final DISTINCT is load-bearing: a 6-day run anchors TWO overlapping 5-windows (Maya fires at 06-10 and 06-11), an 8-day run anchors four. The question asks WHO, so overlapping anchors must collapse to one row per user. The EXISTS/self-join variant on date arithmetic happens to be duplicate-immune for detection — but it needs the output dedupe just as much.",
    ],
    edges: [
      "Same-day duplicates must die BEFORE windowing: LEAD over raw Logins makes Jonathan's 4th lead land back on 06-02 instead of 06-03, and the streak evaporates.",
      "Runs longer than five (Maya's 6 days) fire multiple anchors — the trailing DISTINCT is not cosmetic.",
      "Month boundaries are real: the streak crosses 05-31 → 06-01; date(x,'+1 day') handles it, lexicographic string arithmetic doesn't.",
      "Near-misses must stay out: Ravi has a 4-day run and a separate 3-day run — neither qualifies, and the dup 07-02 must not extend anything.",
    ],
    ladder: [
      {
        title: "Brute force — probe four future days per login",
        body: "Dedupe to (id, date), then for each date check with four correlated EXISTS probes that d+1..d+4 exist for the same id. Correct but four subqueries per row — O(n²)-ish, and easy to write against the RAW table by mistake.",
      },
      {
        title: "The pattern — dedupe, then chain the calendar",
        body: "WITH daily AS (SELECT DISTINCT id, login_date FROM Logins) is non-negotiable. From there the streak is either a self-join chain on date(d,'+1 day') (the pre-window idiom) or LEADs over the per-user day sequence.",
      },
      {
        title: "The optimal idea — LEAD ×4 over each user's calendar",
        body: "One window pass over the deduped days: four LEAD columns, four equality gates against date arithmetic, a join to Accounts for the name, and a final DISTINCT. O(n log n) with the sort shared by dedupe and window.",
      },
    ],
    approach: "Dedupe to distinct (id, date) days, then LEAD over each user's calendar",
    schema: {
      ddl: `CREATE TABLE Accounts (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Logins (
  id         INTEGER NOT NULL REFERENCES Accounts(id),  -- deliberately NOT unique
  login_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Accounts (id, name) VALUES
  (1, 'Winston'), (7, 'Jonathan'), (3, 'Maya'), (9, 'Ravi');
INSERT INTO Logins (id, login_date) VALUES
  (7, '2020-05-30'), (7, '2020-05-31'), (7, '2020-06-01'),
  (7, '2020-06-02'), (7, '2020-06-02'), (7, '2020-06-03'),  -- same-day duplicate: the trap
  (3, '2020-06-10'), (3, '2020-06-11'), (3, '2020-06-12'),
  (3, '2020-06-13'), (3, '2020-06-14'), (3, '2020-06-15'),  -- 6-day run: anchors 2 windows
  (1, '2020-05-30'), (1, '2020-06-05'), (1, '2020-06-07'),  -- scattered: never links
  (9, '2020-07-01'), (9, '2020-07-02'), (9, '2020-07-02'),
  (9, '2020-07-03'), (9, '2020-07-04'),                     -- dup + 4-day near-miss
  (9, '2020-07-08'), (9, '2020-07-09'), (9, '2020-07-10');  -- separate 3-day run`,
      tables: [
        { name: "Accounts", note: "4 accounts" },
        { name: "Logins", note: "23 raw rows, NO unique key — Jonathan doubles 06-02, Ravi doubles 07-02; only Jonathan and Maya own a 5+ day streak" },
      ],
    },
    code: `WITH daily AS (
    -- the trap: Logins.id is not unique — same-day repeats must die HERE
    SELECT DISTINCT id, login_date
    FROM Logins
),
streaks AS (
    SELECT
        id,
        login_date,
        LEAD(login_date, 1) OVER (PARTITION BY id ORDER BY login_date) AS d1,
        LEAD(login_date, 2) OVER (PARTITION BY id ORDER BY login_date) AS d2,
        LEAD(login_date, 3) OVER (PARTITION BY id ORDER BY login_date) AS d3,
        LEAD(login_date, 4) OVER (PARTITION BY id ORDER BY login_date) AS d4
    FROM daily
)
SELECT DISTINCT a.name              -- a 6-day streak anchors two windows; print once
FROM streaks s
JOIN Accounts a ON a.id = s.id
WHERE s.d1 = date(s.login_date, '+1 day')
  AND s.d2 = date(s.login_date, '+2 day')
  AND s.d3 = date(s.login_date, '+3 day')
  AND s.d4 = date(s.login_date, '+4 day')
ORDER BY a.name;`,
    walkthrough: [
      "daily collapses Logins: Jonathan's double 06-02 becomes one row (6 logins → 5 distinct dates) and Ravi's double 07-02 dies too (his 4-day run stays 4 days).",
      "The window partitions by id and orders by date. Jonathan's anchor 05-30 sees d1..d4 = 05-31, 06-01, 06-02, 06-03 — each exactly +1..+4 away, month boundary included. All four gates fire.",
      "Maya's 6-day run anchors at BOTH 06-10 (sees 11–14) and 06-11 (sees 12–15) — two qualifying rows. Ravi's best anchor 07-01 needs d4 = 07-05 but sees 07-08: dead.",
      "The join fetches names, DISTINCT merges Maya's two anchors, and the output is exactly Jonathan and Maya.",
    ],
    time: "O(n log n) — the DISTINCT dedupe plus the per-user window sort over n logins",
    space: "O(n) — the deduped day calendar",
    followUps: [
      "Detect the streak with the self-join idiom — daily d1 JOIN daily d2 ON d2.login_date = date(d1.login_date, '+1 day') chained four deep — and explain why duplicates can't fool it once daily exists.",
      "Report each user's LONGEST streak length: the gaps-and-islands trick (date arithmetic minus ROW_NUMBER) turns every run into one groupable key.",
    ],
    related: ["consecutive-numbers", "human-traffic-of-stadium", "average-time-of-process-per-machine"],
    order: "any",
    xp: 20,
  },
  {
    slug: "restaurant-growth",
    statement:
      "A café records every visit with the amount spent. Build its running weekly report: for each day that already has a full trailing week on file, show the total revenue of the seven CALENDAR days ending that day, plus the average per day derived from that total.",
    examples: [
      {
        input:
          "Customer visits: 01-01 100 · 01-02 110 · 01-03 120 · 01-04 130 · 01-05 110 · 01-06 140 · 01-07 150 · 01-08 80 · 01-09 closed (no rows) · 01-10 180 + 190 (two visits)",
        output: "2019-01-07 · 860 · 122.86 / 2019-01-08 · 840 · 120.00 / 2019-01-10 · 980 · 140.00",
        explanation:
          "01-07 is the first day with a full week behind it (01-01..01-07 = 860). 01-10's window spans 01-04..01-10: the closed 01-09 contributes nothing and both same-day visits count (370 total), so 980. Days 01-01..01-06 lack seven days of history and never appear.",
      },
    ],
    constraints: [
      "one row per visit; a single day may carry several visits",
      "a day with no visits has no rows but still occupies its slot in other days' windows",
      "the report starts at MIN(visited_on) + 6 — earlier days have no full week",
    ],
    breakdown: [
      "Two grains collide: the log is per-VISIT (01-10 carries two rows) but the report is per-DAY. Window functions run after grouping, so fold the log first — a per_day CTE with GROUP BY visited_on, SUM(amount) — and let the frame slide over DAYS, not visits. Skip this and the frame advances per visit row, which wrecks both the window boundaries and any sense of 'per day'.",
      "The gap is the real exam. 01-09 has NO rows. A ROWS frame counts present rows, so '6 PRECEDING' over the grouped days reaches back to 01-03 — a window spanning eight calendar days that reports 1100 for 01-10 instead of 980. A RANGE frame compares VALUES: RANGE BETWEEN 6 PRECEDING over a NUMERIC date includes exactly [today − 6, today]; the empty day simply contributes nothing. SQLite can't RANGE-offset TEXT dates, hence julianday(visited_on) as the sort key.",
      "Full-history gating: days 01-01..01-06 would average over partial windows. The spec pins the start at MIN(visited_on) + 6, computed once as a scalar subquery and compared with date(first_day, '+6 day').",
      "The average is per-DAY: total ÷ 7, always seven, not AVG() over visit rows (which would shrink on quiet days) and not ÷ the number of non-empty days. And it must be ÷ 7.0 — integer division floors 860/7 to 122, and ROUND(122, 2) is still 122, not 122.86.",
    ],
    edges: [
      "Same-day duplicates: fold visits to day-grain FIRST, or the frame slides per visit (01-10 has two rows).",
      "Gap days: ROWS 6 PRECEDING silently spans eight calendar days around the closed 01-09 (it reports 1100 for 01-10); RANGE over a numeric date is calendar-true (980).",
      "average_amount = SUM / 7.0 — AVG() over visits and integer /7 both print wrong money.",
      "The closed 01-09 produces no OUTPUT row (it has none to produce) even though it sits inside 01-10's window; the first six days are cut by the MIN + 6 gate.",
    ],
    ladder: [
      {
        title: "Brute force — rescan the table per day",
        body: "For each day, scan every visit and sum those within [d − 6, d]: a correlated aggregate costing O(days × visits). Correct, and it quietly handles gaps and duplicates — but it re-reads everything per output row.",
      },
      {
        title: "The pattern — group to days, then slide a frame",
        body: "GROUP BY visited_on first, then SUM(day_total) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). The self-join variant (c2.visited_on BETWEEN c1 − 6 AND c1) is the same shape pre-windows. Both are exact ONLY on gapless calendars.",
      },
      {
        title: "The optimal idea — a RANGE frame over julian dates",
        body: "Switch the frame from ROWS to RANGE with julianday(visited_on) as the order key: the window now means 'within six units of today', empty days cost nothing, and the frame stays O(d) amortized. Gate on MIN + 6, divide by 7.0.",
      },
    ],
    approach: "Per-day rollup + RANGE 6-day frame over julian dates",
    schema: {
      ddl: `CREATE TABLE Customer (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  visited_on TEXT NOT NULL,
  amount     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Customer (id, name, visited_on, amount) VALUES
  (1,  'Jhon',    '2019-01-01', 100),
  (2,  'Daniel',  '2019-01-02', 110),
  (3,  'Jade',    '2019-01-03', 120),
  (4,  'Khaled',  '2019-01-04', 130),
  (5,  'Winston', '2019-01-05', 110),
  (6,  'Elvis',   '2019-01-06', 140),
  (7,  'Anna',    '2019-01-07', 150),
  (8,  'Maria',   '2019-01-08', 80),
  (9,  'Jhon',    '2019-01-10', 180),  -- 01-09 is CLOSED: a gap day with no rows
  (10, 'Jhon',    '2019-01-10', 190);  -- two visits the SAME day: day-grain trap`,
      tables: [
        { name: "Customer", note: "10 visits over 9 distinct days; 01-09 missing (gap), 01-10 doubled (370 that day)" },
      ],
    },
    code: `WITH per_day AS (
    -- fold same-day visits (01-10 has two) into one row per CALENDAR day
    SELECT visited_on, SUM(amount) AS day_total
    FROM Customer
    GROUP BY visited_on
),
rolling AS (
    SELECT
        visited_on,
        SUM(day_total) OVER (
            ORDER BY julianday(visited_on)         -- numeric date so RANGE can offset by days
            RANGE BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS amount                                 -- the true 7-CALENDAR-day sum; gaps add 0
    FROM per_day
)
SELECT
    visited_on,
    amount,
    ROUND(amount / 7.0, 2) AS average_amount        -- per-DAY average; integer /7 would floor
FROM rolling
WHERE visited_on >= date((SELECT MIN(visited_on) FROM Customer), '+6 day')
ORDER BY visited_on;`,
    walkthrough: [
      "per_day folds the 10 visit rows into 9 day-rows: the two 01-10 visits merge into 370, and 01-09 is simply absent — the CTE has no row for it.",
      "The window sorts the 9 days by julian date. For 01-07 the RANGE frame reaches back exactly to 01-01: 100+110+120+130+110+140+150 = 860. For 01-10 the frame spans 01-04..01-10 — the missing 01-09 contributes no row, and the day sums land on 980 (a ROWS frame would have grabbed 01-03 and printed 1100).",
      "The WHERE keeps only days at least MIN + 6 = 01-07: the first six days vanish, their windows leaning on history the café doesn't have.",
      "ROUND(amount / 7.0, 2): 860/7 → 122.86, 840/7 → 120.00, 980/7 → 140.00, and ORDER BY visited_on prints the three-row report.",
    ],
    time: "O(n + d log d) — one pass to fold n visits into d distinct days, then the window sort; the self-join rewrite is O(n·d)",
    space: "O(d) — the per-day CTE and the frame buffer",
    followUps: [
      "Rewrite it as the self-join c2.visited_on BETWEEN date(c1.visited_on, '-6 day') AND c1.visited_on, GROUP BY c1's day — then compare its cost against the frame on a year of data.",
      "Make empty days visible: build a gapless calendar (recursive CTE) LEFT JOINed onto per_day so 01-09 prints 0 · 0.00 — what does the MIN + 6 gate become then?",
    ],
    related: ["last-person-to-fit-in-the-bus", "rank-scores", "game-play-analysis-iii"],
    order: "exact",
    xp: 20,
  },
];
