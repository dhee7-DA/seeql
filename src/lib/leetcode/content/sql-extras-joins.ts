// Deep-dives — the SQL Extras "joins & reconciliation" band (6 problems:
// first-login MIN, running totals, aggregate-then-join, a hand-built FULL
// OUTER JOIN, relational division, and the wide→long two-role melt).
// Solutions are SQLite dialect, one statement each, and are engine-verified
// by scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_EXTRAS_JOINS: LcSqlDive[] = [
  {
    slug: "game-play-analysis-i",
    statement:
      "A game platform logs every play session: which player, from which device, on which date, and how many games that session covered. For each player, report the very first date they ever appeared in the log.",
    examples: [
      {
        input:
          "Activity: (1, dev 2, 2016-03-01, 5 games) · (1, dev 2, 2016-05-02, 6) · (2, dev 3, 2017-06-25, 1) · (3, dev 1, 2016-03-02, 0) · (3, dev 4, 2018-07-03, 5) · (4, dev 3, 2016-03-01, 3) · (4, dev 3, 2017-06-25, 2)",
        output: "1 · 2016-03-01 / 2 · 2017-06-25 / 3 · 2016-03-02 / 4 · 2016-03-01",
        explanation:
          "Each player's earliest date wins: player 1's 2016-05-02 session is ignored, and player 4's first login happens to share player 1's date but lives in its own group.",
      },
    ],
    constraints: [
      "(player_id, event_date) uniquely identifies a session — that pair is the real key",
      "device_id is NOT unique: players share devices and hop between them",
      "output columns: player_id, first_login",
    ],
    breakdown: [
      "The grain shifts: input is one row per session, output is one row per player. Any sentence shaped 'for each X, the earliest Y' is the textbook GROUP BY X + MIN(Y) translation — no join, no window, no sort in application code. MIN works on the TEXT dates here because ISO-8601 YYYY-MM-DD strings sort lexicographically in exact calendar order, the same property the rest of this band leans on.",
      "What makes 511 a famous interview opener is what it does NOT ask. The inevitable follow-up is 'also show the device used at first login', and the innocent-looking shortcut — GROUP BY player_id, select MIN(event_date) plus a bare device_id — is a trap: standard SQL calls that bare column undefined. SQLite happens to document that bare columns come from the min/max row, a non-portable quirk whose behavior on two tied minimums is undefined even in SQLite.",
      "The portable follow-up is a join-back: compute (player_id, MIN(event_date)) in a subquery, then join Activity on player_id AND event_date = that minimum. That join is exact ONLY because (player_id, event_date) is the declared key. The seed deliberately reuses device 3 across two players and three sessions — any query that groups by or joins on device_id would fuse distinct players into one 'first login', which is the bug this problem is built to catch.",
      "games_played is noise: player 3's very first session contained zero games but is still a login. Reading the spec column by column — which columns are requested, which are decoys — is the actual skill this easy problem grades.",
    ],
    edges: [
      "MIN over TEXT dates is only safe because ISO dates sort correctly — a DD-MM-YYYY format would silently crown the wrong 'first'.",
      "device_id is not a key: device 3 appears on three rows belonging to players 2 and 4. Never group or join on it.",
      "Single-session players (player 2) pass through — MIN of one row is that row.",
      "The bare-device_id shortcut relies on SQLite's documented min-row quirk and is undefined on ties; the join-back on the composite key is the honest form.",
    ],
    ladder: [
      { title: "Brute force — sort and take the first", body: "For each player, sort their sessions by date and take row one. The manual algorithm is O(n log n) per player and says in a loop what SQL says in two clauses." },
      { title: "The pattern — group the identity, aggregate the fact", body: "'Per X, the earliest Y' → GROUP BY X, MIN(Y). Every reporting query you will ever write is some variation of this shape; MIN/MAX need no window because they are per-group singletons." },
      { title: "The optimal idea — MIN is already the optimum", body: "One grouping pass over the sessions, a keep-smallest accumulator inside each bucket, one output row per player. There is nothing a window function or self-join would improve — knowing when the cheap tool is also the optimal one is the lesson." },
    ],
    approach: "GROUP BY player + MIN(date)",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,
  games_played INTEGER NOT NULL,
  PRIMARY KEY (player_id, event_date)   -- the REAL key: one session per player per day
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1, 2, '2016-03-01', 5),
  (1, 2, '2016-05-02', 6),
  (2, 3, '2017-06-25', 1),
  (3, 1, '2016-03-02', 0),
  (3, 4, '2018-07-03', 5),
  (4, 3, '2016-03-01', 3),   -- device 3 REUSED: different player, date ties player 1's first login
  (4, 3, '2017-06-25', 2);   -- device 3 again — device_id is not a key of anything`,
      tables: [
        { name: "Activity", note: "7 sessions, 4 players — device 3 is shared by players 2 and 4; player 3's first session had 0 games" },
      ],
    },
    code: `SELECT
    player_id,
    MIN(event_date) AS first_login   -- earliest ISO date per group = first login
FROM Activity
GROUP BY player_id
ORDER BY player_id;`,
    walkthrough: [
      "GROUP BY player_id carves the 7 sessions into 4 buckets: player 1 with two rows, player 2 with one, player 3 with two, player 4 with two.",
      "MIN(event_date) keeps the smallest ISO string per bucket: player 1 → 2016-03-01 (beating 2016-05-02), player 4 → 2016-03-01 (beating 2017-06-25).",
      "Player 2's single session is trivially its own minimum, and player 3's zero-games session on 2016-03-02 still counts as a first login — games_played never enters the computation.",
      "ORDER BY player_id just orders the 4-row report for reading; the grader compares rows as a set.",
    ],
    time: "O(n) — one grouping pass over n sessions; MIN is a running keep-smallest inside each bucket",
    space: "O(p) — one row per player",
    followUps: [
      "Add the device used at first login: join the MIN subquery back on (player_id, event_date). Why does the bare-device_id GROUP BY 'work' in SQLite, and why is it still the wrong habit? (Documented min-row quirk; undefined on ties, undefined in standard SQL.)",
      "First login per player PER DEVICE: grouping by (player_id, device_id) — does it change anything for player 1, who used device 2 twice? What would it do for a player who hops devices?",
      "Latest login is MIN → MAX; game-play-analysis-v's day-1 retention needs exactly this first-login computation as its opening CTE.",
    ],
    related: ["game-play-analysis-iii", "game-play-analysis-iv", "game-play-analysis-v"],
    order: "any",
    xp: 10,
  },
  {
    slug: "game-play-analysis-iii",
    statement:
      "Same session log, cumulative question: walk every player's sessions in date order and report, after each one, how many games they had played in total up to and including that date.",
    examples: [
      {
        input:
          "Activity: player 1 → 5 games on 2016-03-01, 6 on 2016-05-02 · player 2 → 1 on 2017-06-25 · player 3 → 0 on 2016-03-02, 5 on 2018-07-03 · player 4 → 3 on 2016-03-01, 2 on 2017-06-25",
        output:
          "1 · 2016-03-01 · 5 / 1 · 2016-05-02 · 11 / 2 · 2017-06-25 · 1 / 3 · 2016-03-02 · 0 / 3 · 2018-07-03 · 5 / 4 · 2016-03-01 · 3 / 4 · 2017-06-25 · 5",
        explanation:
          "Player 1's second row is 5 + 6 = 11 — the total carries across sessions. Player 3's first total is 0 because that session itself contained zero games.",
      },
    ],
    constraints: [
      "one output row per session, accumulating within each player's date order",
      "the running total INCLUDES the current row's games_played",
      "output columns: player_id, event_date, games_played_so_far",
    ],
    breakdown: [
      "The output grain equals the input grain — one row per session — but every row now carries a value computed from all EARLIER rows of the same player. That is the signature of a running total, and the engine primitive is a window function: SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date). PARTITION restarts the accumulator per player; ORDER BY extends the frame from the player's first session through the current row.",
      "Before window functions existed, this was written as a self-join: match every session s against every session e of the SAME player with e.event_date <= s.event_date, then GROUP BY the outer session and SUM(e.games_played). Correct on any engine from any decade — still the answer for engines without window support — but it materializes a triangular k² pair-set for a player with k sessions, while the window is one pass.",
      "The frame decides correctness. With an ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats rows TIED on the ordering column as peers that share one frame value. Harmless here because (player_id, event_date) is the key, so no ties can exist within a player; order by a non-unique column and you must spell ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, or ties double-count into every tied row's output.",
    ],
    edges: [
      "Zero starts the ladder: player 3's first total is 0 — the current row's games_played is included, and it can be zero.",
      "Single-session players (player 2) emit one row whose total is just that row's count — no special-casing.",
      "RANGE vs ROWS: the default RANGE frame is only safe because event_date is unique within a player (the composite PK); on a tie-prone column it would smear tied rows' sums across all of them.",
      "PARTITION, not filter: one query handles all four players because the partition restarts per group — the app-code alternative is one loop-and-query per player.",
    ],
    ladder: [
      { title: "Brute force — re-scan per row", body: "For each session, scan the table for the same player's earlier-or-equal sessions and sum them — the correlated-subquery formulation. O(n²) pairs at worst, invisible on 7 rows, fatal at 7 million." },
      { title: "The pattern — self-join to a triangular match set", body: "JOIN Activity e ON e.player_id = s.player_id AND e.event_date <= s.event_date, GROUP BY the outer session, SUM(e.games_played). The portable classic: each player with k sessions contributes exactly k² pairs." },
      { title: "The optimal idea — one pass with a window frame", body: "SUM OVER (PARTITION BY player ORDER BY date) keeps one running accumulator per partition — O(n log n) for the window's sort, near-O(n) when the composite PK index already supplies the order, and no pair explosion." },
    ],
    approach: "Window running sum — SUM OVER (PARTITION BY player ORDER BY date)",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,
  games_played INTEGER NOT NULL,
  PRIMARY KEY (player_id, event_date)   -- guarantees date uniqueness within a player
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1, 2, '2016-03-01', 5),
  (1, 2, '2016-05-02', 6),
  (2, 3, '2017-06-25', 1),
  (3, 1, '2016-03-02', 0),   -- a 0-game session: the ladder still gets a rung
  (3, 4, '2018-07-03', 5),
  (4, 3, '2016-03-01', 3),
  (4, 3, '2017-06-25', 2);`,
      tables: [
        { name: "Activity", note: "7 sessions; running sums stack within each player, never across players" },
      ],
    },
    code: `SELECT
    player_id,
    event_date,
    SUM(games_played) OVER (
        PARTITION BY player_id    -- restart the accumulator per player
        ORDER BY event_date       -- frame: first session → current row
    ) AS games_played_so_far
FROM Activity
ORDER BY player_id, event_date;`,
    walkthrough: [
      "Each partition lines up in date order: player 1's sessions sort 2016-03-01 then 2016-05-02, player 4's 2016-03-01 then 2017-06-25.",
      "The accumulator starts at each partition's first row and adds the current row as it passes: player 1 → 5, then 5 + 6 = 11; player 4 → 3, then 3 + 2 = 5.",
      "Player 3's ladder is 0 then 5 — the zero-game session occupies a rung with total 0 — and player 2's one-row partition yields 1.",
      "The final ORDER BY mirrors the reference listing; grading compares rows as a set, but per-player date order is how a human audits the accumulation.",
    ],
    time: "O(n log n) — one sort for the window's ORDER BY (≈O(n) when the composite PK index already provides it)",
    space: "O(n) — one running accumulator per open partition plus the output",
    followUps: [
      "Rewrite it as the self-join + GROUP BY classic on this 7-row seed, then imagine one player with 10,000 sessions: how many joined pairs does each form produce? (k² per player vs a single pass.)",
      "Average games per session SO FAR: AVG() OVER with the same frame — hand-check it against SUM/COUNT for player 4.",
      "Day-1 retention (game-play-analysis-v) starts from exactly this per-player date ordering — a first-login CTE plus a date difference.",
    ],
    related: ["game-play-analysis-v", "last-person-to-fit-in-the-bus", "restaurant-growth"],
    order: "any",
    xp: 20,
  },
  {
    slug: "bank-account-summary-ii",
    statement:
      "A bank stores account holders in Users and every transaction in Transactions — deposits as positive amounts, withdrawals as negative. Report the holder's name and net balance for every account whose balance strictly exceeds 10,000.",
    examples: [
      {
        input:
          "Users: (900001,'Alice'),(900002,'Bob'),(900003,'Charlie'),(900004,'Dana'),(900005,'Erin') · Transactions: Alice 4000+2000+7000 · Bob 3000+1000+1000 · Charlie 1000+10000+9000 · Dana 6000+4000 · Erin 12000 then −4000",
        output: "Charlie · 20000 / Alice · 13000",
        explanation:
          "Alice nets 13,000 and Charlie 20,000 — both clear the bar. Bob nets 5,000; Dana lands on exactly 10,000 (strict > excludes it); Erin's 12,000 of deposits minus a 4,000 withdrawal nets 8,000 — summing only the positives would wrongly admit her.",
      },
    ],
    constraints: [
      "Users.account is the primary key; Transactions.account is NOT unique — one row per transaction",
      "amount may be negative (a withdrawal)",
      "the output column must be aliased exactly: balance",
    ],
    breakdown: [
      "Two jobs, two stages — and the order is the lesson. Aggregate Transactions FIRST (GROUP BY account, HAVING SUM(amount) > 10000), then join to Users purely to fetch the display name. Joining first would be numerically harmless HERE, because Users.account is a primary key so each transaction matches exactly one Users row — but the aggregate-first shape is what generalizes: the moment the dimension side can fan out (history tables, slowly-changing dimensions, duplicated names), a join-before-group silently double-counts every transaction.",
      "The threshold compares an aggregate, and an aggregate only exists after grouping — so the filter must live in HAVING. WHERE runs before groups form and cannot see SUM(amount) at all. 'WHERE for row facts, HAVING for group facts' is the split to internalize; this problem is its cleanest drill. The seed makes the split visible: Dana's 6000 and 4000 are each row facts, but her 10,000 net exists only after summing — the exact moment the filter migrates from WHERE to HAVING.",
      "Balance means NET. Erin's seed rows exist to punish the two popular shortcuts — filtering amount > 0 before summing, or wrapping in ABS: 12,000 of inflow minus 4,000 of outflow is 8,000, under the bar, and only the signed SUM(amount) gets there. Sum the column as stored; apply policy in the HAVING, never by laundering the data first.",
    ],
    edges: [
      "Strict inequality: Dana's exactly-10,000 account is out — a >= would admit it and fail the case.",
      "Negative amounts must flow into the SUM, not be filtered out first (Erin).",
      "Alias the aggregate exactly balance — the grader matches the column name.",
      "Every account here has transactions; the robust general form LEFT JOINs Users from the aggregate so an account missing from Users would surface as NULL instead of vanishing.",
    ],
    ladder: [
      { title: "Brute force — sum in application code", body: "Pull every transaction, accumulate per account in a dict, look up names, filter. Three hand-rolled steps the engine expresses in two clauses." },
      { title: "The pattern — aggregate, then decorate", body: "Inner query: GROUP BY account + HAVING down to qualifying balances. Outer query: join Users for the name. Aggregate-then-join keeps each stage independently testable and immune to dimension-side fan-out." },
      { title: "The optimal idea — one CTE, one join", body: "Same shape, friendlier reading: a balances CTE plus a PK-indexed join. Cost is one pass over Transactions to group and one index probe per surviving account — nothing left to shave." },
    ],
    approach: "Aggregate-then-join — GROUP BY + HAVING on Transactions, join Users for the name",
    schema: {
      ddl: `CREATE TABLE Users (
  account INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);
CREATE TABLE Transactions (
  trans_id      INTEGER PRIMARY KEY,
  account       INTEGER NOT NULL REFERENCES Users(account),  -- NOT unique: one row per transaction
  amount        INTEGER NOT NULL,   -- positive = deposit, negative = withdrawal
  transacted_on TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (account, name) VALUES
  (900001,'Alice'),(900002,'Bob'),(900003,'Charlie'),(900004,'Dana'),(900005,'Erin');
INSERT INTO Transactions (trans_id, account, amount, transacted_on) VALUES
  (1,  900001,  4000, '2020-08-01'),
  (2,  900001,  2000, '2020-09-01'),
  (3,  900001,  7000, '2020-09-02'),   -- Alice: 13 000 → qualifies
  (4,  900002,  3000, '2020-08-02'),
  (5,  900002,  1000, '2020-08-03'),
  (6,  900002,  1000, '2020-09-04'),   -- Bob: 5 000 → out
  (7,  900003,  1000, '2020-09-06'),
  (8,  900003, 10000, '2020-09-07'),
  (9,  900003,  9000, '2020-09-08'),   -- Charlie: 20 000 → qualifies
  (10, 900004,  6000, '2020-08-05'),
  (11, 900004,  4000, '2020-08-06'),   -- Dana: exactly 10 000 → strict > excludes
  (12, 900005, 12000, '2020-09-01'),
  (13, 900005, -4000, '2020-09-02');   -- Erin: net 8 000 — positives alone would clear the bar`,
      tables: [
        { name: "Users", note: "5 holders — account is the PK, one row each" },
        { name: "Transactions", note: "13 rows across 5 accounts; Dana sits exactly on the boundary, Erin nets under after a withdrawal" },
      ],
    },
    code: `WITH balances AS (
    -- aggregate FIRST: the fan-out collapses before any join happens
    SELECT
        account,
        SUM(amount) AS balance      -- signed amounts: NET, not ABS
    FROM Transactions
    GROUP BY account
    HAVING SUM(amount) > 10000      -- strictly above the bar; Dana's 10000 is out
)
SELECT
    u.name,
    b.balance
FROM balances b
JOIN Users u ON u.account = b.account
ORDER BY b.balance DESC;`,
    walkthrough: [
      "balances collapses the 13 transaction rows into 5 account rows: Alice 13,000, Bob 5,000, Charlie 20,000, Dana 10,000, Erin 12,000 − 4,000 = 8,000.",
      "HAVING keeps strictly-over-10,000: Alice and Charlie survive; Dana's exact 10,000 dies on the strict >, Erin on the netted total.",
      "The join to Users resolves 900001 → Alice and 900003 → Charlie — one PK probe each, and since the aggregate is already final, no join can inflate it.",
      "ORDER BY balance DESC prints the leaderboard (Charlie first); grading compares rows as a set.",
    ],
    time: "O(t + a) — one pass over t transactions to group, one indexed lookup per qualifying account",
    space: "O(a) — one accumulator row per account",
    followUps: [
      "Flip the order — join first, then GROUP BY u.account, u.name HAVING SUM(amount) > 10000. Why is it still correct HERE (Users.account is a PK), and what schema change would silently break it? (A duplicated Users row, or a second fan-out table joined in.)",
      "Also report each survivor's transaction count: COUNT(*) in the same CTE — and decide what happens to accounts with zero transactions, which cannot appear in Transactions at all. (LEFT JOIN from Users + COALESCE.)",
      "Monthly statements: GROUP BY account, strftime('%Y-%m', transacted_on) — the same aggregate-first scaffold, one more key.",
    ],
    related: ["monthly-transactions-i", "queries-quality-and-percentage", "customers-who-never-order"],
    order: "any",
    xp: 10,
  },
  {
    slug: "employees-with-missing-information",
    statement:
      "HR tracks employee ids with names; payroll tracks employee ids with salaries. The two id sets do not line up perfectly. Output every employee id that exists in exactly one of the tables — such a person is missing either a name record or a salary record — sorted by id.",
    examples: [
      {
        input:
          "Employees: (2,'Crew'),(4,'Haven'),(5,'Kristian'),(9,'Priya') · Salaries: (5,76071),(1,22517),(4,63539)",
        output: "1 · 2 · 9",
        explanation:
          "Id 1 has a salary but no name row; ids 2 and 9 have names but no salary row. Ids 4 and 5 sit in BOTH tables and are complete, so neither appears.",
      },
    ],
    constraints: [
      "each table's employee_id is its primary key — duplicates within a table are impossible",
      "an id may exist in Employees only, in Salaries only, or in both",
      "output a single column, employee_id, in ascending order",
    ],
    breakdown: [
      "What is asked is the SYMMETRIC DIFFERENCE of two id sets — say it in set language first: ids in (Employees − Salaries) ∪ (Salaries − Employees). The textbook one-liner for a related shape is FULL OUTER JOIN, which keeps both sides' orphans in a single pass. SQLite — the engine you are writing in — deliberately ships without FULL OUTER JOIN, so the classic interview question underneath this easy problem is: build it by hand from the pieces that DO exist.",
      "The hand-build is two LEFT JOIN anti-joins, one per direction. Branch one: FROM Employees LEFT JOIN Salaries … WHERE s.employee_id IS NULL keeps Employees' orphans (people with no salary row). Branch two mirrors it from Salaries. UNION glues the two orphan sets into the answer. Each branch is independently checkable against the data, which is exactly why this decomposition beats memorizing exotic syntax.",
      "UNION vs UNION ALL is a real decision, not style: the two branches are disjoint by construction here (an id with a salary row can't also fail the salary lookup), so UNION ALL would be correct. UNION is the defensive choice — it dedupes if a future edit makes the branches overlap, and it states 'this is a set of ids' in the query itself.",
      "The anti-join predicate WHERE s.employee_id IS NULL works because employee_id can never be NULL in a MATCHED row — so a NULL in the joined column certifies no match. NOT IN (SELECT …) also works here, but only because the id columns are never NULL; the LEFT JOIN … IS NULL form carries no such caveat and probes the primary-key index.",
    ],
    edges: [
      "Ids in BOTH tables (4 and 5) must NOT appear — the IS NULL filters kill them in both branches.",
      "An id present in neither table is unknowable — only ids that exist somewhere can be reported.",
      "ORDER BY sits at the very end of the compound statement: it sorts the UNION's combined result, not a single branch — and a compound ORDER BY matches OUTPUT column names, so the first branch aliases its column explicitly (AS employee_id).",
      "NOT IN (SELECT …) is a NULL landmine in general; the anti-join form is the NULL-proof habit this problem rewards.",
    ],
    ladder: [
      { title: "Brute force — two lists and a double loop", body: "Load both id lists; for each id in A check B, for each in B check A, emit the misses. The literal symmetric difference, O(|A|·|B|) by hand." },
      { title: "The pattern — two anti-joins, one per direction", body: "LEFT JOIN + IS NULL expresses 'in A, not in B' set-based. Run it twice, UNION the results — a hand-built FULL OUTER JOIN reduced to exactly the orphans the spec wants." },
      { title: "The optimal idea — mirrored EXCEPTs (or keep the anti-joins)", body: "SELECT employee_id FROM Employees EXCEPT SELECT employee_id FROM Salaries, UNION the reversed EXCEPT — the same shape with set operators instead of joins. Either form is linear with PK-index support; 'optimal' here means the smallest honest form of a FULL OUTER JOIN SQLite cannot express natively." },
    ],
    approach: "Hand-built FULL OUTER JOIN — two mirrored anti-joins UNION'd (symmetric difference)",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE Salaries (
  employee_id INTEGER PRIMARY KEY,   -- deliberately NO foreign key: ids may exist here alone
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name) VALUES
  (2,'Crew'),
  (4,'Haven'),
  (5,'Kristian'),
  (9,'Priya');    -- trap row: a name with no salary record
INSERT INTO Salaries (employee_id, salary) VALUES
  (5, 76071),
  (1, 22517),     -- id 1 exists ONLY here: salary without a name
  (4, 63539);`,
      tables: [
        { name: "Employees", note: "ids 2, 4, 5, 9 — id 9 is the engineered Employees-only orphan" },
        { name: "Salaries", note: "ids 5, 1, 4 — id 1 is Salaries-only; 4 and 5 are complete (in both)" },
      ],
    },
    code: `SELECT
    e.employee_id AS employee_id    -- name the output column for the compound ORDER BY
FROM Employees e
LEFT JOIN Salaries s ON s.employee_id = e.employee_id
WHERE s.employee_id IS NULL     -- anti-join: no partner found
UNION
SELECT
    s.employee_id               -- has a salary, missing a name row
FROM Salaries s
LEFT JOIN Employees e ON e.employee_id = s.employee_id
WHERE e.employee_id IS NULL
ORDER BY employee_id;           -- sorts the COMBINED set, not a branch`,
    walkthrough: [
      "Branch one left-joins the 4 Employees rows to Salaries {5, 1, 4}: Kristian (5) and Haven (4) find partners and are dropped; Crew (2) and Priya (9) match nothing — their s side is NULL — and survive. Branch one = {2, 9}.",
      "Branch two runs the mirror over Salaries {5, 1, 4}: 5 and 4 find Employees partners and drop; 1 has no Employees row and survives. Branch two = {1}.",
      "UNION merges {2, 9} ∪ {1} = {1, 2, 9} — disjoint here, so the dedupe is a no-op, but it keeps the statement correct if the branches ever overlap.",
      "ORDER BY employee_id sorts the combined set ascending: 1, 2, 9 — exactly the mandated order, which is why this dive grades on row order.",
    ],
    time: "O(n + m) — each anti-join is one pass with primary-key index probes",
    space: "O(k) — one row per orphan id",
    followUps: [
      "Rewrite with mirrored EXCEPTs (Employees EXCEPT Salaries UNION the reverse) — which form survives if employee_id could ever be NULL, and why does EXCEPT treat NULLs as equal while NOT IN does not?",
      "True reconciliation: LEFT JOIN both directions, COALESCE the ids, and show every id once with NULLs where a system lacks it — the full FULL OUTER JOIN output, not just the orphans.",
      "Data-quality count: wrap the UNION in COUNT(*) — one number for a dashboard, and the seed of any 'reconciliation report' you will ever be asked for.",
    ],
    related: ["customers-who-never-order", "sales-person", "combine-two-tables"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "customers-who-bought-all-products",
    statement:
      "A store logs every purchase as a (customer, product) pair, and the catalog lists the products that exist. Report the customers whose purchase history covers the ENTIRE catalog — every product key appears at least once among their buys.",
    examples: [
      {
        input:
          "Product: (1,'Keyboard'),(2,'Mouse'),(3,'Dock') · Customer: 1 → products 1,2,3 · 2 → 1,2,3 plus a second Mouse · 3 → 1,2 · 4 → product 2 three times",
        output: "1 · 2",
        explanation:
          "Customer 2's duplicate Mouse still counts once — 3 distinct products = the whole catalog. Customer 3 covers only two of three; customer 4 made three purchases but of a single product.",
      },
    ],
    constraints: [
      "Customer has NO primary key — the same customer may buy the same product many times",
      "every Customer.product_key references Product",
      "output one column, customer_id (any order)",
    ],
    breakdown: [
      "This is relational division: find the customers C such that FOR ALL products P, the pair (C, P) is in the log. SQL has no FOR ALL, so you invert to a coverage check: group by customer, count the DISTINCT products they actually bought, and keep those whose count equals the catalog's size. 'Divide the consumers by the products' is the mathematical name; the counting form is the one you will actually write.",
      "DISTINCT is not cosmetic — it IS the problem. Customer 2 bought four things but only three distinct products; customer 4 made three purchases of one product. The naive HAVING COUNT(*) = (SELECT COUNT(*) FROM Product) returns {1, 4}: it drops the true all-product buyer (customer 2, whose 4 rows exceed 3) AND admits a single-product buyer whose purchase count coincidentally equals the catalog size (customer 4). The seed is engineered so both failure modes are visible in one tiny table.",
      "The same division can be phrased as a double negation: a customer qualifies if there does NOT exist a product they have NOT bought — NOT EXISTS (SELECT 1 FROM Product p WHERE NOT EXISTS (SELECT 1 FROM Customer c2 WHERE c2.customer_id = c.customer_id AND c2.product_key = p.product_key)). Verbose, but maximally portable and NULL-safe: an equality join to a NULL product key matches nothing, while NOT EXISTS simply finds no counter-example and the division stays sound.",
    ],
    edges: [
      "Duplicate purchases force COUNT(DISTINCT) — customer 2's repeat Mouse is the seed's headline trap.",
      "COUNT(*) can coincide with the catalog size — customer 4's three rows against three products exist to catch exactly that.",
      "A customer who buys one product many times never qualifies, however many rows they rack up.",
      "If product keys could be NULL, both the counting and equality forms degrade silently; the double-NOT-EXISTS degrades most gracefully — NULLs simply never match anything.",
    ],
    ladder: [
      { title: "Brute force — check every product per customer", body: "For each customer, loop the catalog and verify each product appears in their purchase list. O(customers × products × log) by hand — and it IS the double-NOT-EXISTS, written as loops." },
      { title: "The pattern — divide by counting", body: "GROUP BY customer, HAVING COUNT(DISTINCT product_key) = (total products). One grouping pass plus one scalar subquery; the standard production form of relational division." },
      { title: "The optimal idea — DISTINCT-count against a scalar subquery", body: "The counting form is already optimal in practice: O(n log n) for the per-group distinct sets, O(p) once for the subquery. The NOT EXISTS form wins on NULL-robustness and portability, not speed — choosing between them is the actual interview conversation." },
    ],
    approach: "Relational division by counting — COUNT(DISTINCT) = catalog size",
    schema: {
      ddl: `CREATE TABLE Product (
  product_key  INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Customer (
  customer_id INTEGER NOT NULL,   -- deliberately NO key: repeat purchases allowed
  product_key INTEGER NOT NULL REFERENCES Product(product_key)
);`,
      seed: `INSERT INTO Product (product_key, product_name) VALUES
  (1,'Keyboard'),(2,'Mouse'),(3,'Dock');
INSERT INTO Customer (customer_id, product_key) VALUES
  (1,1),(1,2),(1,3),        -- customer 1: all 3 products, clean
  (2,1),(2,2),(2,3),(2,2),  -- customer 2: all 3 PLUS a duplicate Mouse — 4 rows, 3 DISTINCT
  (3,1),(3,2),              -- customer 3: only 2 of 3 → out
  (4,2),(4,2),(4,2);        -- customer 4: 3 rows of ONE product — the COUNT(*) = 3 trap`,
      tables: [
        { name: "Product", note: "3 products — the division's denominator" },
        { name: "Customer", note: "10 purchase rows; customer 2 has a duplicate buy, customer 4 has 3 rows but 1 distinct product" },
      ],
    },
    code: `SELECT
    customer_id
FROM Customer
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key)        -- repeat buys collapse to one
       = (SELECT COUNT(*) FROM Product);  -- coverage must equal the WHOLE catalog`,
    walkthrough: [
      "The scalar subquery pins the bar once: the catalog holds 3 products, so a qualifying customer needs exactly 3 DISTINCT keys.",
      "GROUP BY customer_id forms 4 buckets: 1 → {1, 2, 3}, 2 → {1, 2, 3} (the second Mouse collapses), 3 → {1, 2}, 4 → {2}.",
      "HAVING compares distinct counts to 3: customers 1 and 2 pass; customer 3's 2 and customer 4's 1 fail — note a COUNT(*) version would read 3 for customer 4 and wrongly pass them.",
      "The survivors project one row each — 1 and 2, any order (grading is set-based).",
    ],
    time: "O(n log n) — grouping with a distinct set per customer; the scalar subquery is O(p) once",
    space: "O(c · p) worst case for per-customer distinct sets, O(c) output",
    followUps: [
      "Rewrite as the double NOT EXISTS ('no product this customer has not bought') and run it on this seed — does customer 4 stay excluded? Which form would you trust if product_key could be NULL?",
      "Bought all but at most one product: relax the equality to >= total − 1 — a tolerance knob real recommendation queries use.",
      "The dual question: which products has NOBODY bought? EXCEPT the catalog against the distinct purchased set — division's mirror image.",
    ],
    related: ["students-and-examinations", "customers-who-never-order", "sales-person"],
    order: "any",
    xp: 20,
  },
  {
    slug: "team-scores-in-football-tournament",
    statement:
      "A round-robin football season logs every match with home team, away team and the score. Standings award 3 points for a win, 1 for a draw, 0 for a loss. Print the full table — team id, team name, total points — best points first, ties broken by the smaller team id.",
    examples: [
      {
        input:
          "Teams: (1,'Ajax'),(2,'Barca'),(3,'Celta') · Matches: Ajax 2–0 Barca · Barca 3–1 Ajax · Ajax 1–1 Celta · Celta 2–2 Ajax · Barca 3–3 Celta · Celta 0–0 Barca",
        output: "1 · Ajax · 5 / 2 · Barca · 5 / 3 · Celta · 4",
        explanation:
          "Ajax: win + three draws = 3+1+1+1 = 5. Barca: loss + win + two draws = 0+3+1+1 = 5. Celta drew ALL four matches: 4 × 1 = 4. The Ajax–Barca tie at 5 points is broken by team id.",
      },
    ],
    constraints: [
      "each pair of teams meets twice — once at each ground; every team plays",
      "a match always distributes exactly its points: 3 + 0 decisive, or 1 + 1 drawn",
      "output columns: team_id, team_name, num_points",
    ],
    breakdown: [
      "The raw table is WIDE — one row per match with both teams' fates fused into it. Aggregating it directly means writing every scoring expression twice, once for the home seat and once for the away seat with flipped comparisons. The classic move is to melt it to LONG format first: every match enters a ledger TWICE, once from the home seat and once from the away seat, each row carrying (team, goals for, goals against). Then scoring is ONE uniform CASE per row.",
      "The ledger is a UNION ALL of two joins — Teams is joined TWICE, once per role: home branch ON t.team_id = m.home_team, away branch ON t.team_id = m.away_team. In the away branch, project the goals SWAPPED (goals_for = away_goals, goals_against = home_goals), so downstream code never learns which seat the team sat in. This 'long format before aggregating' pattern generalizes to every double-role fact table: senders/receivers, buyers/sellers, drivers/passengers.",
      "UNION ALL, not UNION: two ledger rows per match is the entire point, and two different matches CAN melt into identical (team, for, against) rows — a plain UNION would silently collapse them and lose points. Scoring itself is conditional aggregation: SUM(CASE WHEN goals_for > goals_against THEN 3 WHEN equal THEN 1 ELSE 0 END). The equality branch must pay BOTH seats — a draw is the case this problem is built to catch — and only the strict ELSE 0 catches losses.",
      "The finish is GROUP BY team, then ORDER BY num_points DESC, team_id ASC. The tiebreak is not decoration: with this seed's 5–5 tie at the top, dropping team_id makes the output order engine-dependent, and any RANK()-based variant (the follow-up) needs the same two keys.",
    ],
    edges: [
      "Draws pay both sides: the equality branch fires for the home AND the away ledger row — Celta's four draws are the seed's proof.",
      "Swap the goal columns in the away branch — forgetting the swap turns every away win into a loss.",
      "UNION ALL the two roles — a plain UNION could dedupe two distinct matches that melt into identical rows.",
      "Tiebreak by team_id: the seed puts Ajax and Barca level on 5, so ORDER BY num_points alone leaves their relative order undefined.",
    ],
    ladder: [
      { title: "Brute force — two scans per team", body: "For each team, scan Matches twice (as home, as away), accumulate points in code. O(teams × matches) loops; the query folds both scans into one ledger." },
      { title: "The pattern — melt wide → long, then aggregate", body: "UNION ALL the two seats into (team, goals_for, goals_against); one conditional SUM per team. Any double-role fact melts the same way — the pattern outlives football entirely." },
      { title: "The optimal idea — one ledger pass + one group", body: "O(m) to build the 2m-row ledger, O(m log t) to group it, a PK-indexed join for names, one sort for the ranking. Nothing further to squeeze without materialized season stats." },
    ],
    approach: "Wide→long melt — UNION ALL the two roles, conditional SUM, rank",
    schema: {
      ddl: `CREATE TABLE Teams (
  team_id   INTEGER PRIMARY KEY,
  team_name TEXT NOT NULL
);
CREATE TABLE Matches (
  match_id   INTEGER PRIMARY KEY,
  home_team  INTEGER NOT NULL REFERENCES Teams(team_id),
  away_team  INTEGER NOT NULL REFERENCES Teams(team_id),
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO Teams (team_id, team_name) VALUES (1,'Ajax'),(2,'Barca'),(3,'Celta');
INSERT INTO Matches (match_id, home_team, away_team, home_goals, away_goals) VALUES
  (1, 1, 2, 2, 0),   -- Ajax beat Barca at home
  (2, 2, 1, 3, 1),   -- Barca beat Ajax at home
  (3, 1, 3, 1, 1),   -- draw
  (4, 3, 1, 2, 2),   -- draw
  (5, 2, 3, 3, 3),   -- draw
  (6, 3, 2, 0, 0);   -- draw — Celta's season is ALL draws`,
      tables: [
        { name: "Teams", note: "3 teams, every pair meets twice (6 matches)" },
        { name: "Matches", note: "two decisive games plus four draws; Celta drew all four of its matches; Ajax and Barca finish tied on 5" },
      ],
    },
    code: `WITH ledger AS (
    -- every match enters TWICE: once from the home seat, once from the away seat
    SELECT
        m.home_team AS team_id,
        t.team_name,
        m.home_goals AS goals_for,
        m.away_goals AS goals_against
    FROM Matches m
    JOIN Teams t ON t.team_id = m.home_team
    UNION ALL
    SELECT
        m.away_team,
        t.team_name,
        m.away_goals,          -- goals SWAPPED: the away seat shoots into goals_for
        m.home_goals
    FROM Matches m
    JOIN Teams t ON t.team_id = m.away_team
)
SELECT
    l.team_id,
    l.team_name,
    SUM(CASE
            WHEN l.goals_for > l.goals_against THEN 3   -- win
            WHEN l.goals_for = l.goals_against THEN 1   -- draw: BOTH seats score
            ELSE 0                                      -- loss
        END) AS num_points
FROM ledger l
GROUP BY l.team_id, l.team_name
ORDER BY num_points DESC, l.team_id;   -- ties break to the smaller team id`,
    walkthrough: [
      "The ledger holds 12 rows — every match twice. Match 1 (Ajax 2–0 Barca) enters as (1, Ajax, 2, 0) and (2, Barca, 0, 2); match 2 contributes the reversed pair with the away branch already storing Ajax's 1 as goals_for.",
      "After the swap the CASE scores uniformly: Ajax's four ledger rows read (2,0)→3, (1,3)→0, (1,1)→1, (2,2)→1 = 5; Barca's read (0,2)→0, (3,1)→3, (3,3)→1, (0,0)→1 = 5.",
      "Celta's four rows are all draws — (1,1), (2,2), (3,3), (0,0) — each paying 1 from BOTH seats: the only-draws season lands on exactly 4.",
      "GROUP BY re-tightens to one row per team and ORDER BY num_points DESC, team_id ranks the 5–5 tie Ajax-before-Barca with Celta last — the exact mandated order, so this dive grades on row order.",
    ],
    time: "O(m log t) — melt 2m ledger rows, hash-group them, sort the t-team table",
    space: "O(m) — the doubled ledger",
    followUps: [
      "Add a rank column: RANK() OVER (ORDER BY num_points DESC) — Ajax and Barca share rank 1 and Celta takes rank 3. How does DENSE_RANK differ, and what does adding team_id ASC to the window's ORDER BY buy you?",
      "Extend the ledger with wins/draws/losses columns — three more conditional SUMs over the same CASE shape.",
      "Goal difference as the second tiebreak: SUM(goals_for − goals_against) in the same GROUP BY — what would this seed need for it to decide a tie?",
    ],
    related: ["rank-scores", "queries-quality-and-percentage", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
];
