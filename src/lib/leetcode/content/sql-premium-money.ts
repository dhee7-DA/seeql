// Deep-dives — LeetCode Premium batch I: ledgers & money (6 problems, 4 Medium / 2 Hard). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_MONEY: LcSqlDive[] = [
  {
    slug: "bank-account-summary",
    statement:
      "A retail bank keeps Accounts(account_id, name) and a movement log Movements(txn_id, account_id, amount, kind, txn_date), where kind is 'credit' (money in) or 'debit' (money out) and amount is always stored positive. Build the full ledger report: one row per account — including accounts that have never moved a cent — with balance equal to total credits minus total debits, and 0 for an account with no movements at all. Output columns: account_id, name, balance, ordered by account_id ascending.",
    examples: [
      {
        input: "Accounts: (1,'Ada Vale'), (2,'Bright Harbor') · Movements: (1, credit 250), (1, credit 450), (2, debit 300)",
        output: "1 Ada Vale · 700  /  2 Bright Harbor · -300",
        explanation:
          "Account 1's two credits sum to 700. Account 2 has only debits, so its balance goes negative: 0 minus 300. Amount is positive and kind carries the sign.",
      },
      {
        input: "Accounts: (3,'Cedar & Co') with credit 1000 and debit 650 · (4,'Dune Trust') with no movement rows",
        output: "3 Cedar & Co · 350  /  4 Dune Trust · 0",
        explanation:
          "Account 3 nets 1000 - 650 = 350. Account 4 never moved and the report still shows it — at 0, not missing. An inner join would erase it.",
      },
    ],
    constraints: [
      "balance = SUM(credits) - SUM(debits) per account; amounts are stored positive and kind decides the direction",
      "every account appears exactly once, even one with zero movements (its balance is 0)",
      "output columns: account_id, name, balance; ordered by account_id ascending",
    ],
    breakdown: [
      "The report's contract is that every account appears — and the anchor of a query decides who survives. Driving FROM Movements with a GROUP BY account_id counts only the accounts that moved; account 4 of the seed has no rows in the log at all, so it contributes no group and silently disappears from a report that promised completeness. The fix is to anchor on Accounts and LEFT JOIN the movements on: the dormant account keeps its row, with every movement column NULL. Aggregation then does the rest — with one twist covered in the next paragraph.",
      "The balance is two aggregates with opposite signs, and conditional aggregation builds both in one pass: SUM(CASE WHEN kind = 'credit' THEN amount END) minus the debit twin. For an active account both sums are plain numbers; for the dormant account both come back NULL — SUM over an all-NULL set is NULL, not 0 — and NULL minus NULL is still NULL, which prints a blank balance exactly where the spec demands 0. Wrapping each SUM in COALESCE(..., 0) fixes it at the source, so the dormant account reads 0 - 0 = 0. The COALESCE is load-bearing for exactly one row of the output, and that row is the whole point of the problem.",
      "An INNER JOIN version of this query runs without errors and returns plausible rows for the three active accounts — which is what makes the dormant account's absence so dangerous: nothing fails, the report is just quietly incomplete. Sign discipline matters too: amount is stored positive and kind says which way the money moved, so the debit branch must subtract. Summing every amount regardless of kind folds deposits and withdrawals into one meaningless total; account 2 of the seed is all debits on purpose, so its correct balance is negative and a sign-blind query reports +420 — a number that looks right until you notice the account only ever spent.",
    ],
    edges: [
      "Account 4 has zero movement rows: anchoring on Movements (or an inner join) deletes it from the report — a LEFT JOIN from Accounts keeps the row, with NULL movement columns.",
      "NULL minus NULL is NULL: for the dormant account both conditional SUMs return NULL, so the bare expression prints no balance at all — COALESCE on EACH sum is what produces the required 0.",
      "kind carries the sign, not amount: the debit branch must subtract. Summing every amount regardless of kind turns account 2's -420 into +420.",
      "COUNT-style habits trip here: COUNT(*) over the null-extended row would credit the dormant account one phantom movement — SUM(CASE...) ignoring NULLs is the right shape for money.",
    ],
    ladder: [
      {
        title: "Brute force — two passes in the app",
        body: "Query all credits grouped by account, query all debits grouped by account, merge the two maps in code, then diff against a full account list to re-insert the missing zeros. Three data structures for what is one grouped scan.",
      },
      {
        title: "The pattern — anchor on Accounts, LEFT JOIN the log",
        body: "FROM Accounts LEFT JOIN Movements, GROUP BY account, two conditional SUMs with opposite signs. The dormant account survives the join, and the COALESCE zeroes its balance.",
      },
      {
        title: "The optimal idea — one scan, two accumulators",
        body: "Same O(a + m) either way, but the single-query shape extends without re-plumbing: a date cutoff becomes a WHERE, a per-kind split becomes another CASE column. The join version is also the honest baseline — it shows exactly which row the inner join would lose.",
      },
    ],
    approach: "Anchor on Accounts with a LEFT JOIN to Movements, GROUP BY account, balance = COALESCE(credit SUM) - COALESCE(debit SUM)",
    schema: {
      ddl: `CREATE TABLE Accounts (
  account_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL
);
CREATE TABLE Movements (
  txn_id     INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  amount     INTEGER NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('credit', 'debit')),
  txn_date   TEXT NOT NULL
);`,
      seed: `-- account 3 mixes both kinds (+350); account 4 (Dune Trust) has NO movement rows at all
INSERT INTO Accounts (account_id, name) VALUES
  (1, 'Ada Vale'), (2, 'Bright Harbor'), (3, 'Cedar & Co'), (4, 'Dune Trust');
INSERT INTO Movements (txn_id, account_id, amount, kind, txn_date) VALUES
  (1, 1, 250,  'credit', '2025-03-02'),
  (2, 1, 450,  'credit', '2025-03-05'),  -- account 1: credits only → +700
  (3, 2, 300,  'debit',  '2025-03-03'),
  (4, 2, 120,  'debit',  '2025-03-07'),  -- account 2: debits only → -420
  (5, 3, 1000, 'credit', '2025-03-01'),
  (6, 3, 650,  'debit',  '2025-03-04');`,
      tables: [
        { name: "Accounts", note: "4 accounts; Dune Trust (4) has no movement rows — the dormant-account trap" },
        { name: "Movements", note: "6 movements, March 2025: account 1 all credits (+700), account 2 all debits (-420), account 3 mixed (+350)" },
      ],
    },
    code: `SELECT
    a.account_id,
    a.name,
    COALESCE(SUM(CASE WHEN m.kind = 'credit' THEN m.amount END), 0)
      - COALESCE(SUM(CASE WHEN m.kind = 'debit'  THEN m.amount END), 0) AS balance
FROM Accounts a
LEFT JOIN Movements m ON m.account_id = a.account_id   -- keeps dormant accounts on the report
GROUP BY a.account_id, a.name
ORDER BY a.account_id ASC;`,
    walkthrough: [
      "The LEFT JOIN pairs accounts 1-3 with their movement rows and leaves account 4 alone on its row with every m.* column NULL — an inner join would have deleted that row before any aggregation happened.",
      "Inside each group the two CASEs split the money: account 1 credits 250 + 450 = 700 against no debits; account 2 no credits against 300 + 120 = 420 of debits; account 3 credits 1000 against debits 650.",
      "Account 4's CASEs find no non-NULL amounts, so both SUMs return NULL; COALESCE turns each into 0 and the balance prints 0 — final rows (1,'Ada Vale',700), (2,'Bright Harbor',-420), (3,'Cedar & Co',350), (4,'Dune Trust',0) in account_id order.",
    ],
    time: "O(a + m) — one pass over the movements joined to the account list, one accumulator pair per account",
    space: "O(a) — one row per account",
    followUps: [
      "Add a point-in-time flavor: balance AS OF a date is the same query with WHERE m.txn_date <= ? — and the dormant account still needs the COALESCE treatment.",
      "Report only overdrafts (balance < 0) — wrap the query as a CTE and filter outside the aggregation, and notice the HAVING-with-alias shortcut works in SQLite but is not portable.",
    ],
    related: ["bank-account-summary-ii", "capital-gain-loss", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "league-statistics",
    statement:
      "A winter league records every fixture once, in Fixtures(fixture_id, home_club, away_club, home_goals, away_goals), with club names in Clubs(club_id, club_name). Build the standings over the WHOLE season — home leg and away leg alike: for each club report played (wins plus draws plus losses), wins, draws, losses, and points under standard scoring (a win pays 3, a draw pays 1 to BOTH clubs, a loss pays nothing). A 0-0 draw is still a draw for both clubs. Output columns: club_name, played, wins, draws, losses, points, ordered by points descending, then club_name ascending.",
    examples: [
      {
        input: "Fixtures: (1, 2, 2, 1) — club 1 hosts club 2 and wins 2-1",
        output: "club 1 · played 1, wins 1, draws 0, losses 0, points 3  /  club 2 · played 1, wins 0, draws 0, losses 1, points 0",
        explanation:
          "One fixture row, two clubs' records: the host's side is a win, and the visitor's is the same scoreline flipped into a loss.",
      },
      {
        input: "Fixtures: (2, 1, 0, 0) — club 2 hosts club 1, scoreless",
        output: "both clubs · played 1, draws 1, points 1",
        explanation:
          "A 0-0 pays both sides one point — zero goals does not mean zero events; both clubs' records must move.",
      },
    ],
    constraints: [
      "each fixture contributes one leg row per club — a home perspective and an away perspective — and both count toward played",
      "points per leg: win 3, draw 1 (both clubs), loss 0; played = wins + draws + losses per club",
      "output columns: club_name, played, wins, draws, losses, points; ordered by points DESC, then club_name ASC",
    ],
    breakdown: [
      "A fixture row speaks about two clubs at once, and that double voice is the whole difficulty. Reading Fixtures once and CASE-ing the host's result scores only the home side — the away club's win, draw, or loss never enters any group, and the standings come out with half of everyone's season missing. The established cure is the two-legs trick: UNION ALL a host-perspective copy and a mirrored away-perspective copy of every fixture, so the stream becomes one row per (club, match) carrying that club's own result. Once the grain is right, the standings are the most ordinary GROUP BY in the book.",
      "The mirrored CASE is where draws live or die. The home branch compares home_goals > away_goals for 'W', home_goals = away_goals for 'D', else 'L'; the away branch flips every comparison. The equality branch is the dangerous one: a 0-0 or a 2-2 must pay BOTH clubs their point, and the classic copy-paste bug — reusing the home comparisons in the away branch — turns every draw into a home point and an away blank, silently demoting every draw-heavy club. This seed carries two draws, one of them 0-0, so the bug shows up in the final table rather than hiding in a mid-season rounding.",
      "The output mixes a COUNT and four conditional SUMs over the same leg rows: played is COUNT(*), while wins, draws, losses, and points are SUM(CASE ...) over the result letter, with points scoring 3, 1, and 0. Sorting is points DESC then club_name ASC — with a single key, the engine's choice among equal-point clubs would be arbitrary, and a league table that reshuffles between runs is worse than wrong, it is unusable. The name tiebreak makes the output a function of the data alone.",
    ],
    edges: [
      "Every fixture must be read twice — once per side. A home-only scan reports away results as nothing: Ashford's away win at Dovewood exists only in the mirrored branch.",
      "The 0-0 draw (Calder vs Dovewood) pays both clubs a point: an away CASE that reuses the home comparisons pays the visitor 0 and every draw-heavy club's record goes wrong.",
      "played is COUNT(*) over the club's leg rows — deriving it as wins + draws + losses also works, but a home-only join makes it half-size for clubs that played away more than home.",
      "points DESC alone is not a total order: two clubs level on points would order arbitrarily; club_name ASC is the required second key.",
    ],
    ladder: [
      {
        title: "Brute force — per-club scan",
        body: "For each club, select its home fixtures and compute the home-side record, select its away fixtures and compute the away-side record, then add the two in code. Two queries per club and the scoring rule duplicated four times.",
      },
      {
        title: "The pattern — UNION ALL the two legs",
        body: "Each fixture becomes two pre-lettered rows (host CASE plus mirrored away CASE); GROUP BY club and count and sum. The whole standings in one statement.",
      },
      {
        title: "The optimal idea — same O(f), one shape for every sport",
        body: "The leg explosion costs nothing asymptotically — 2f rows from f fixtures — but it makes any scoring change (bonus points, overtime losses, forfeits) a CASE edit instead of a query rewrite. The same skeleton absorbs three-way result codes or points-per-goal tiebreakers unchanged.",
      },
    ],
    approach: "UNION ALL home-leg and mirrored away-leg rows into one per-club stream, then GROUP BY club with COUNT plus conditional SUMs",
    schema: {
      ddl: `CREATE TABLE Clubs (
  club_id   INTEGER PRIMARY KEY,
  club_name TEXT NOT NULL
);
CREATE TABLE Fixtures (
  fixture_id INTEGER PRIMARY KEY,
  home_club  INTEGER NOT NULL,
  away_club  INTEGER NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO Clubs (club_id, club_name) VALUES
  (1, 'Ashford'), (2, 'Brindle'), (3, 'Calder'), (4, 'Dovewood');
-- fixture 5 (last row) is a 2-2 draw: the third match for both Brindle and Calder
INSERT INTO Fixtures (fixture_id, home_club, away_club, home_goals, away_goals) VALUES
  (1, 1, 2, 3, 1),   -- Ashford home win over Brindle
  (2, 3, 4, 0, 0),   -- scoreless draw: pays BOTH clubs
  (3, 2, 3, 2, 0),   -- Brindle home win over Calder
  (4, 4, 1, 1, 4),   -- Ashford wins AWAY at Dovewood (only the away branch sees it)
  (5, 3, 2, 2, 2);`,
      tables: [
        { name: "Clubs", note: "4 clubs: Ashford (1), Brindle (2), Calder (3), Dovewood (4)" },
        { name: "Fixtures", note: "5 fixtures: two Ashford wins (home AND away), a 0-0 and a 2-2 draw, one Brindle win; Calder never wins" },
      ],
    },
    code: `WITH legs AS (
    SELECT
        home_club AS club_id,
        CASE
            WHEN home_goals > away_goals THEN 'W'   -- home win
            WHEN home_goals = away_goals THEN 'D'   -- draw: home's point
            ELSE 'L'
        END AS result
    FROM Fixtures
    UNION ALL
    SELECT
        away_club AS club_id,
        CASE
            WHEN away_goals > home_goals THEN 'W'   -- away win (mirrored!)
            WHEN away_goals = home_goals THEN 'D'   -- same draw, other side
            ELSE 'L'
        END AS result
    FROM Fixtures
)
SELECT
    c.club_name,
    COUNT(*)                                                      AS played,
    SUM(CASE WHEN l.result = 'W' THEN 1 ELSE 0 END)               AS wins,
    SUM(CASE WHEN l.result = 'D' THEN 1 ELSE 0 END)               AS draws,
    SUM(CASE WHEN l.result = 'L' THEN 1 ELSE 0 END)               AS losses,
    SUM(CASE l.result WHEN 'W' THEN 3 WHEN 'D' THEN 1 ELSE 0 END) AS points
FROM legs l
JOIN Clubs c ON c.club_id = l.club_id
GROUP BY c.club_id, c.club_name
ORDER BY points DESC, club_name ASC;   -- level on points? the name decides`,
    walkthrough: [
      "The two branches turn 5 fixtures into 10 leg rows. Ashford collects W (fixture 1) from the home side and W (fixture 4) from the away side; the 0-0 in fixture 2 letters D for BOTH Calder and Dovewood, and so does the 2-2 in fixture 5.",
      "Grouping folds the legs: Ashford played 2, W2 D0 L0, 6 points; Brindle played 3 (L, W, D), 4 points; Calder played 3 (D, L, D), 2 points; Dovewood played 2 (D, L), 1 point.",
      "Sorted by points DESC then name: Ashford 6, Brindle 4, Calder 2, Dovewood 1 — four rows, every club exactly once, every draw counted on both sides.",
    ],
    time: "O(f + c) — 2f leg rows built in two linear passes, then one grouped fold over c clubs",
    space: "O(f) — the stacked legs CTE",
    followUps: [
      "Add goal difference next to points — the same two-legs shape, with the legs carrying goals_for and goals_against instead of a letter.",
      "Include fixture-less clubs with a zeroed record — LEFT JOIN from Clubs plus COALESCE, the same completeness trap as a ledger with dormant accounts.",
    ],
    related: ["team-scores-in-football-tournament", "apples-and-oranges"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "account-balance",
    statement:
      "A journal table Movements(movement_id, account_id, day, kind, amount) logs deposits and withdrawals — kind is 'Deposit' or 'Withdrawal', amount is stored positive. For every movement, compute the account's RUNNING balance as of that movement: deposits add, withdrawals subtract, and movements of an account process in day order (two movements of one account sharing a day would process by movement_id). Output columns: account_id, day, balance — one row per movement, ordered by account_id ascending, then day ascending.",
    examples: [
      {
        input: "one account: Deposit 500 on day 1, Deposit 200 on day 3",
        output: "(day 1, 500) then (day 3, 700)",
        explanation:
          "Each row carries the total of everything up to and including itself — 500, then 500 + 200. The running total is a new column, not a replacement for the rows.",
      },
      {
        input: "one account: Deposit 500, then Withdrawal 900 on a later day",
        output: "(500) then (-400)",
        explanation:
          "A withdrawal bigger than the balance drives the running figure negative — the window keeps subtracting; it never clamps at zero.",
      },
    ],
    constraints: [
      "balance at row i = sum of the account's deposits minus withdrawals over rows 1..i in (day, movement_id) order",
      "amount is stored positive for both kinds; the kind decides the sign",
      "output columns: account_id, day, balance; one row per movement, ordered by account_id ASC, day ASC",
    ],
    breakdown: [
      "A balance after each movement is a cumulative sum, and a cumulative sum cannot come from GROUP BY — grouping collapses each account's history into one row, while this report needs every intermediate step kept alive. The window shape is SUM(...) OVER (PARTITION BY account_id ORDER BY day, movement_id): the partition restarts the sum per account, the ORDER BY makes it accumulate in day order, and every input row survives to carry its own subtotal. The signed amounts come from a CASE — Deposit adds, Withdrawal subtracts — evaluated before the window ever runs.",
      "Windows accumulate over a FRAME, and the default frame is subtle: with an ORDER BY present it is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER-BY peers as one unit — two movements of one account sharing a day would each see the other's amount already folded in. The explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts rows physically, one at a time, so same-day movements accumulate strictly in movement_id order. This seed keeps one movement per account per day, so the two frames agree here — but the ledger next door is one duplicated day away from a silently wrong balance column, and the explicit frame is the habit that survives it.",
      "The outer ORDER BY account_id, day is a presentation requirement — the window's internal ORDER BY does not sort the result, it only defines accumulation order inside each partition. Dropping the outer sort returns rows in scan order, interleaved across accounts, which reads like a shuffled bank statement. The movement_id inside the window's ORDER BY is not decoration either: if two movements of one account ever share a day, that id is the only thing standing between the balance sequence and an arbitrary peer order.",
    ],
    edges: [
      "Running, not final: the report keeps one row per movement, each carrying its prefix sum — a plain GROUP BY account would return one row per account and destroy the audit trail.",
      "The default RANGE frame includes ORDER-BY peers: two same-day movements would see each other's amounts; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict row-by-row frame.",
      "The window's ORDER BY (day, movement_id) defines accumulation; it does NOT sort the output — the outer ORDER BY account_id, day is a separate, required clause.",
      "Account 1 dips to -200 mid-history before recovering to 400: the window never clamps — a balance column that stops at zero is hiding the overdraft, not reporting it.",
    ],
    ladder: [
      {
        title: "Brute force — re-scan per row",
        body: "For each movement, run a SUM over all of that account's earlier movements. Quadratic queries, and the half-open boundary (strictly earlier, or up to and including?) gets decided by hand, wrongly, once per codebase.",
      },
      {
        title: "The pattern — one window, partitioned and ordered",
        body: "SUM(CASE kind ...) OVER (PARTITION BY account_id ORDER BY day, movement_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) computes every prefix sum in a single sorted pass per account.",
      },
      {
        title: "The optimal idea — cumulative windows as a family",
        body: "The same skeleton produces running counts, running averages, and period-over-period deltas by swapping the aggregate, and frame clauses (ROWS 3 PRECEDING and friends) turn it into moving averages. One ORDER BY edit moves the computation between grains — the closest thing SQL has to a fold.",
      },
    ],
    approach: "SUM(signed amount) OVER (PARTITION BY account_id ORDER BY day, movement_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
    schema: {
      ddl: `CREATE TABLE Movements (
  movement_id INTEGER PRIMARY KEY,
  account_id  INTEGER NOT NULL,
  day         TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('Deposit', 'Withdrawal')),
  amount      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Movements (movement_id, account_id, day, kind, amount) VALUES
  (1, 1, '2025-04-01', 'Deposit',    500),  -- account 1 opens with a deposit
  (2, 2, '2025-04-02', 'Deposit',   1000),
  (3, 1, '2025-04-03', 'Deposit',    200),
  (4, 2, '2025-04-04', 'Withdrawal', 250),
  (5, 2, '2025-04-05', 'Withdrawal', 100),
  (6, 1, '2025-04-06', 'Withdrawal', 900),  -- account 1 dips to -200 here, recovers on 04-09
  (7, 2, '2025-04-08', 'Deposit',    350),
  (8, 1, '2025-04-09', 'Deposit',    600);`,
      tables: [
        { name: "Movements", note: "8 movements, April 2025, two accounts on interleaved days; account 1 dips to -200 then recovers to 400 — both accounts open with a deposit" },
      ],
    },
    code: `SELECT
    account_id,
    day,
    SUM(CASE kind WHEN 'Deposit' THEN amount ELSE -amount END) OVER (
        PARTITION BY account_id
        ORDER BY day, movement_id                        -- day first; id breaks same-day ties
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW -- strict row-by-row frame
    ) AS balance
FROM Movements
ORDER BY account_id ASC, day ASC;`,
    walkthrough: [
      "The CASE signs every row before the window runs: deposits keep +amount, withdrawals carry -amount — account 1's stream reads +500, +200, -900, +600, and the CHECK constraint guarantees the ELSE branch is only ever a withdrawal.",
      "Inside partition 1 the frame accumulates row by row: 500, then 700, then 700 - 900 = -200, then -200 + 600 = 400. Partition 2 runs 1000, 750, 650, 1000. The explicit ROWS frame guarantees each row sees exactly its predecessors — same-day peers could not sneak in the way RANGE would allow.",
      "The outer sort lays the 8 rows out account by account: (1,'2025-04-01',500), (1,'2025-04-03',700), (1,'2025-04-06',-200), (1,'2025-04-09',400), (2,'2025-04-02',1000), (2,'2025-04-04',750), (2,'2025-04-05',650), (2,'2025-04-08',1000) — account 1's mid-history overdraft fully visible.",
    ],
    time: "O(n log n) — one sort per partition drives the accumulating pass; the aggregation itself is O(n)",
    space: "O(n) — the output keeps every movement row, one balance each",
    followUps: [
      "Show the work: project the signed CASE expression a second time, bare, next to the window — every row then carries its own amount and the running total, which makes reconciliation checks trivial.",
      "Flag the first time each account goes negative — wrap the window in a CTE and take MIN(CASE WHEN balance < 0 THEN day END) per account.",
    ],
    related: ["top-travellers", "npv-queries", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "employees-with-deductions",
    statement:
      "A company tracks each employee's obligation in Staff(employee_id, name, required_days) and their actual overtime in OvertimeEntries(entry_id, employee_id, ot_date) — one row per overtime shift, and a second shift on a day already worked still logs a new row, so duplicated dates are normal. An employee FELL SHORT if the number of DISTINCT days they worked overtime is fewer than required_days. Report every employee who fell short. Output columns: employee_id, name, ordered by employee_id ascending.",
    examples: [
      {
        input: "required_days 4 · overtime rows on 06-02, 06-03, 06-05, and 06-03 again (a duplicated date)",
        output: "reported — 3 distinct days < 4",
        explanation:
          "Four rows but only three distinct days: the duplicate masks the shortfall. COUNT(*) would read 4, clear the bar, and the employee would vanish from the report.",
      },
      {
        input: "required_days 4 · exactly 4 overtime rows on 4 different dates",
        output: "not reported",
        explanation:
          "4 distinct days is not fewer than 4 — the comparison is strict, so meeting the bar exactly is enough to stay off the list.",
      },
    ],
    constraints: [
      "an overtime day counts once no matter how many shift rows share its date — COUNT(DISTINCT ot_date)",
      "fell short means COUNT(DISTINCT ot_date) < required_days; an employee with no overtime rows has worked 0 days",
      "output columns: employee_id, name; ordered by employee_id ascending",
    ],
    breakdown: [
      "The obvious query groups OvertimeEntries and counts rows — and on this seed it returns the wrong set, because row counts and day counts part ways the moment one day logs two shifts. Employee 1 worked three distinct days but holds four rows; COUNT(*) reads 4, matches required_days 4, and the employee appears to have met the bar — wrongly. COUNT(DISTINCT ot_date) counts calendar days, reads 3, and the shortfall surfaces. The COUNT family is not interchangeable: COUNT(*) counts rows, COUNT(col) counts non-NULL values, COUNT(DISTINCT col) counts distinct values — and picking the wrong one is a silent wrong-set bug, not an error message.",
      "Employees who never worked overtime have no entries at all, so any query anchored on OvertimeEntries loses them before the arithmetic starts — the population this report most needs to catch is exactly the one an inner join erases. Anchoring on Staff with a LEFT JOIN keeps every employee, and the unmatched ones come back with entry columns NULL. Then the counting choice matters a second time: COUNT(e.ot_date) skips NULLs and lands on 0 for the never-worked employee — correct — while COUNT(*) would count the null-extended row itself and credit them one phantom overtime day.",
      "The filter lives in HAVING, not WHERE: shortness is a property of the whole group, computed after aggregation, and WHERE runs before aggregates exist. The comparison is strict — fewer than required_days — so employee 5, who worked exactly 4 distinct days against a requirement of 4, stays off the report: meeting the bar is the definition of not falling short. Boundary employees are how strict-versus-inclusive bugs get caught; an off-by-one in the operator here would add a row that looks like diligence but is actually a complaint.",
    ],
    edges: [
      "Employee 1's duplicated 06-03: 4 rows, 3 distinct days — COUNT(*) would read 4, clear required_days 4, and wrongly drop them from the report; COUNT(DISTINCT ot_date) is the whole lesson.",
      "Employee 4 has no overtime rows: an inner join (or anchoring on the entries) deletes them; LEFT JOIN from Staff plus COUNT(e.ot_date) lands on 0 and reports them.",
      "COUNT(*) over the null-extended row counts 1, not 0 — the phantom-overtime trap for the never-worked employee; counting the joined column skips NULLs.",
      "Employee 5 sits exactly AT required (4 distinct vs 4 required): strict < keeps them off the report — the boundary row that catches >= versus > bugs.",
    ],
    ladder: [
      {
        title: "Brute force — per-employee check",
        body: "For each employee, count distinct overtime dates in a subquery, compare against their requirement in code, and separately diff the staff list against anyone holding entries at all. Three queries, with the zero-row case handled by hand.",
      },
      {
        title: "The pattern — LEFT JOIN plus a grouped distinct count",
        body: "Staff LEFT JOIN OvertimeEntries, GROUP BY employee, HAVING COUNT(DISTINCT ot_date) < required_days. Zero-row employees ride the null-extended group to a count of 0 and get reported.",
      },
      {
        title: "The optimal idea — anchor on the population, count the events",
        body: "Same O(s + e) scan either way; the upgrade is knowing WHICH count and WHICH filter layer. Every not-enough-X report (short hours, thin coverage, missed quotas) is this one shape: anchor on the population, left-join the events, count distinctly, HAVING against the bar.",
      },
    ],
    approach: "Staff LEFT JOIN OvertimeEntries, GROUP BY employee, HAVING COUNT(DISTINCT ot_date) < required_days",
    schema: {
      ddl: `CREATE TABLE Staff (
  employee_id   INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  required_days INTEGER NOT NULL
);
CREATE TABLE OvertimeEntries (
  entry_id    INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  ot_date     TEXT NOT NULL
);`,
      seed: `INSERT INTO Staff (employee_id, name, required_days) VALUES
  (1, 'Nadia', 4),
  (2, 'Omar',  3),
  (3, 'Priti', 2),
  (4, 'Quinn', 2),
  (5, 'Rosa',  4);
-- Quinn (4) has ZERO overtime rows; Priti is clearly over her bar of 2
INSERT INTO OvertimeEntries (entry_id, employee_id, ot_date) VALUES
  (1, 1, '2025-06-02'),
  (2, 1, '2025-06-03'),
  (3, 1, '2025-06-05'),
  (4, 1, '2025-06-03'),  -- Nadia's DUPLICATE day: 4 rows, 3 distinct days
  (5, 2, '2025-06-04'),  -- Omar: one lone shift against required 3
  (11, 5, '2025-06-01'),
  (12, 5, '2025-06-02'),
  (13, 5, '2025-06-03'),
  (14, 5, '2025-06-04'), -- Rosa: exactly AT her bar of 4 — strict < excludes
  (6, 3, '2025-06-02'),
  (7, 3, '2025-06-04'),
  (8, 3, '2025-06-06'),
  (9, 3, '2025-06-09'),
  (10, 3, '2025-06-11');`,
      tables: [
        { name: "Staff", note: "5 employees with requirements 2-4 days; Quinn (4) will hold no overtime rows" },
        { name: "OvertimeEntries", note: "14 shift rows: Nadia's 06-03 duplicated (4 rows / 3 distinct days), Rosa exactly at her bar, Priti clearly over, Omar one lone shift" },
      ],
    },
    code: `SELECT
    s.employee_id,
    s.name
FROM Staff s
LEFT JOIN OvertimeEntries e ON e.employee_id = s.employee_id  -- keeps the never-worked
GROUP BY s.employee_id, s.name
HAVING COUNT(DISTINCT e.ot_date) < s.required_days            -- COUNT skips NULLs → 0 for Quinn
ORDER BY s.employee_id ASC;`,
    walkthrough: [
      "The LEFT JOIN gives Nadia 4 entry rows (two of them on 06-03), Omar 1, Priti 5, Rosa 4, and Quinn a single null-extended row with no entry columns at all.",
      "Per group the DISTINCT count reads calendar days: Nadia 3, Omar 1, Priti 5, Rosa 4, Quinn 0 — a plain COUNT(*) would have said 4, 1, 5, 4, and 1, two different wrong answers on the same seed (Nadia masked, Quinn credited a phantom shift).",
      "HAVING keeps 3 < 4 (Nadia), 1 < 3 (Omar), and 0 < 2 (Quinn); Priti and Rosa clear their bars, Rosa exactly at 4 and excluded by the strict comparison — output (1,'Nadia'), (2,'Omar'), (4,'Quinn').",
    ],
    time: "O(s + e) — one pass over the entries joined to the staff list, one DISTINCT count per employee",
    space: "O(s) — one row per employee before the HAVING",
    followUps: [
      "Make the report explain itself: add required_days and COUNT(DISTINCT e.ot_date) AS days_worked to the SELECT list so every row shows the size of its own shortfall.",
      "Flip the question to who met or exceeded the bar (>=) and confirm the two lists partition Staff exactly — with Quinn on the short side either way.",
    ],
    related: ["employee-bonus", "count-salary-categories"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "generate-the-invoice",
    statement:
      "A catalog Items(item_id, name, price, category) splits stock into 'core', 'addon', and 'recreational' lines, and PurchaseLines(line_id, buyer_id, item_id, quantity) logs every purchase. For EACH buyer, generate an invoice covering their MOST EXPENSIVE core-or-addon item — judged by the item's unit price, not by quantity times price. If several eligible items TIE at that top price, the invoice covers all of them. Buyers whose purchases include no core or addon item at all get no invoice row. Output columns: buyer_id, item_id, name, price, ordered by buyer_id ascending, then price descending, then item_id ascending.",
    examples: [
      {
        input: "buyer 7 buys Clamp (addon, 75.0), Vise (addon, 75.0), Saw (core, 40.0)",
        output: "two rows: Clamp · 75.0 and Vise · 75.0",
        explanation:
          "Both addons hit the same top price, and ties share the invoice — a per-buyer winner that keeps one row would silently under-bill.",
      },
      {
        input: "buyer 8 buys Patio Heater (recreational, 500.0) and Gloves (core, 18.5)",
        output: "one row: Gloves · 18.5",
        explanation:
          "The 500.0 heater is the most expensive thing they bought — and it never invoices, because the price crown is contested only within core and addon.",
      },
    ],
    constraints: [
      "only 'core' and 'addon' purchases are invoiceable; 'recreational' purchases never appear",
      "the invoice covers every eligible item whose price equals the buyer's maximum eligible price — ties all included",
      "output columns: buyer_id, item_id, name, price; ordered by buyer_id ASC, then price DESC, then item_id ASC",
    ],
    breakdown: [
      "The order of operations is the whole problem: the category filter must run BEFORE the per-buyer maximum is taken, or the crown goes to the wrong item. Buyer 3's most expensive purchase overall is a 500.0 recreational heater, and a query that finds the max first and filters later either invoices the heater or, if the filter only trims the final rows, drops buyer 3 entirely instead of billing their 18.5 gloves. Filtering first shrinks the pipeline to eligible lines, so every later step — the max, the tie handling — operates on items that can actually be invoiced. Filter, then rank; rank-then-filter is this problem's trap.",
      "Per-buyer argmax with ties kept is a window job: RANK() OVER (PARTITION BY buyer_id ORDER BY price DESC) labels the top price 1, and every row sharing that price shares the rank — buyer 2's 75.0 clamps and 75.0 vise both land at rank 1 and both invoice. The alternatives fail in opposite directions: a join-back on per-buyer MAX(price) handles ties correctly but needs a second aggregate pass, while ROW_NUMBER would keep exactly one arbitrary row of the tie and under-bill the buyer. RANK is the honest choice here — its tie semantics ARE the spec.",
      "Buyer 4 bought one recreational swing and nothing else, so after the category filter they have no rows at all — and the pipeline handles their absence by doing nothing: no eligible rows means no partition, means no rank-1 row, means no invoice. That is the quiet advantage of filtering first: the empty-population case needs no LEFT JOIN, no COALESCE, and no special branch — it evaporates. Compare that with the ledger reports where completeness is the requirement and every NULL must be defended; here emptiness is the requirement, and the query shape gets it for free.",
    ],
    edges: [
      "The price crown is contested only within core and addon: buyer 3's 500.0 recreational heater is the priciest item in their history and still never invoices — filter BEFORE ranking.",
      "Buyer 2's two-way 75.0 tie invoices BOTH items: RANK keeps shared-top rows together; ROW_NUMBER would keep one arbitrary row and under-bill the buyer.",
      "Buyer 4 owns one recreational item: zero eligible rows means no partition and no invoice row, with no defensive code anywhere in the query.",
      "quantity never enters the math: the invoice ranks unit price, so buyer 1's four packs of 25.0 anchor bolts cannot outrank a single 120.0 drill.",
    ],
    ladder: [
      {
        title: "Brute force — per-buyer pass in the app",
        body: "Load each buyer's purchases, filter categories, sort by price, keep the top while collecting ties, emit rows. A loop per buyer, and the tie policy re-implemented every time the report is needed.",
      },
      {
        title: "The pattern — eligible CTE plus a RANK partition",
        body: "Filter to core/addon in a CTE, RANK() OVER (PARTITION BY buyer_id ORDER BY price DESC), keep rank 1. Ties and absence are both handled by the window's own semantics.",
      },
      {
        title: "The optimal idea — one pass, compositional policy",
        body: "Same O(p) as any per-buyer scan, but every policy knob is a one-line edit: top two tiers is RANK <= 2, a category change is a WHERE, a price-tie break is an extra ORDER BY key. The join-back-on-MAX variant reaches the same rows and generalizes well when the ranking key lives one join away.",
      },
    ],
    approach: "Filter to core/addon purchases, RANK() per buyer over price DESC, keep the rank-1 rows (ties included)",
    schema: {
      ddl: `CREATE TABLE Items (
  item_id  INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  price    REAL NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('core', 'addon', 'recreational'))
);
CREATE TABLE PurchaseLines (
  line_id  INTEGER PRIMARY KEY,
  buyer_id INTEGER NOT NULL,
  item_id  INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);`,
      seed: `INSERT INTO Items (item_id, name, price, category) VALUES
  (10, 'Anchor Bolts',   25.0,  'core'),
  (11, 'Clamps',         75.0,  'addon'),
  (12, 'Crosscut Saw',   40.0,  'core'),
  (13, 'Bench Vise',     75.0,  'addon'),
  (14, 'Hammer Drill',   120.0, 'core'),
  (15, 'Spirit Level',   30.0,  'addon'),
  (16, 'Work Gloves',    18.5,  'core'),
  (17, 'Patio Heater',   500.0, 'recreational'),
  (18, 'Lawn Swing',     210.0, 'recreational');
-- buyer 4's ONLY purchase is the recreational swing: no invoice row at all
INSERT INTO PurchaseLines (line_id, buyer_id, item_id, quantity) VALUES
  (1, 1, 14, 1),  -- buyer 1: drill 120 is the clear top
  (2, 1, 15, 2),
  (3, 1, 10, 4),
  (4, 2, 11, 1),  -- buyer 2: Clamps 75 / Bench Vise 75 — the two-way tie
  (5, 2, 13, 1),
  (6, 2, 12, 1),
  (7, 3, 17, 1),  -- buyer 3: heater 500 is recreational, never invoices
  (8, 3, 16, 1),  -- ...so their invoice covers the 18.5 gloves
  (9, 4, 18, 1);`,
      tables: [
        { name: "Items", note: "9 catalog items across core / addon / recreational: a 75.0-75.0 addon pair planted for the tie, a 500.0 recreational heater as the price-crown decoy" },
        { name: "PurchaseLines", note: "9 lines for 4 buyers: buyer 1 clear top, buyer 2 tied top, buyer 3 recreational-heavy, buyer 4 recreational-only (no invoice)" },
      ],
    },
    code: `WITH eligible AS (
    -- the category filter runs FIRST: recreational never contends for the crown
    SELECT
        p.buyer_id,
        i.item_id,
        i.name,
        i.price
    FROM PurchaseLines p
    JOIN Items i ON i.item_id = p.item_id
    WHERE i.category IN ('core', 'addon')
),
ranked AS (
    SELECT
        buyer_id,
        item_id,
        name,
        price,
        RANK() OVER (PARTITION BY buyer_id ORDER BY price DESC) AS rnk  -- ties share rank 1
    FROM eligible
)
SELECT buyer_id, item_id, name, price
FROM ranked
WHERE rnk = 1
ORDER BY buyer_id ASC, price DESC, item_id ASC;`,
    walkthrough: [
      "The eligible CTE strips recreational lines: buyer 1 keeps drill 120 / level 30 / bolts 25, buyer 2 keeps clamps 75 / vise 75 / saw 40, buyer 3 keeps only gloves 18.5 (the 500 heater is filtered out before any maximum is taken), and buyer 4 keeps nothing.",
      "RANK per buyer over price DESC: buyer 1's drill takes rank 1; buyer 2's clamps AND vise both take rank 1 — the tie the spec demands — with the saw at rank 3; buyer 3's gloves take rank 1. Buyer 4 has no partition at all.",
      "Keeping rank 1 and sorting: (1,14,'Hammer Drill',120.0), (2,11,'Clamps',75.0), (2,13,'Bench Vise',75.0), (3,16,'Work Gloves',18.5) — buyer 4 silently absent, exactly as specified.",
    ],
    time: "O(p) — one pass over the purchase lines to filter and rank; the sort runs inside each buyer partition",
    space: "O(p) — the eligible and ranked CTEs",
    followUps: [
      "Bill amounts instead of prices: rank on price * quantity — and watch the tie landscape change, since quantity now breaks 75.0-75.0 dead heats.",
      "Cap each invoice at the top two price tiers (RANK <= 2) and see which buyers gain rows — the whole change is one comparison in the outer WHERE.",
    ],
    related: ["product-sales-analysis-ii", "average-selling-price", "number-of-rich-customers"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "suspicious-bank-account-transactions",
    statement:
      "A bank stores account movements in Movements(movement_id, account_id, kind, amount, made_at) — kind is 'credit' or 'debit', amount is stored POSITIVE for both kinds (it is the volume of money that moved), and made_at is a 'YYYY-MM-DD' date. A one-row policy table Rules(rule_id, max_duration_days, max_amount) defines the alarm: an account is SUSPICIOUS if some window of max_duration_days consecutive days contains movements whose total volume reaches max_amount — a window starting on any day d covers [d, d + max_duration_days], endpoints included, and credits and debits count equally toward volume. Output the suspicious account_ids, without duplicates, ordered ascending. Output column: account_id.",
    examples: [
      {
        input: "max_duration_days 3, max_amount 10000 · credit 6000 on 01-05, debit 4200 on 01-07",
        output: "the account is reported",
        explanation:
          "The window anchored at 01-05 spans 01-05 through 01-08 and catches both movements: 6000 + 4200 = 10200 reaches the threshold. The alarm fires even though no single movement is large.",
      },
      {
        input: "one account moving ~1000 per day for ten days, same 3-day rule",
        output: "not reported",
        explanation:
          "The whole history sums past the threshold — but no 4-calendar-day window holds more than ~4200 of it. Whole-history aggregation cannot see the difference; windowed aggregation can.",
      },
    ],
    constraints: [
      "Rules holds exactly one row, giving max_duration_days and max_amount",
      "volume counts every movement's amount, credits and debits alike, inside the window [d, d + max_duration_days], both endpoints included",
      "output column: account_id, DISTINCT, ordered ascending",
    ],
    breakdown: [
      "Sum an account's movements and compare the total to the threshold, and the alarm answers a different question than the one asked. Account 2 of the seed moves roughly a thousand a day for ten days — 10200 in total, comfortably over the 10000 bar — yet no three-day stretch of its life comes near the threshold: any window holds at most four daily movements, about 4200. Structuring money that way is exactly how real laundering behaves: keep every single day boring and let the total climb. A whole-history GROUP BY flags this account wrongly; the policy only fires when a concentrated burst lands inside one short window.",
      "The engine has no sliding-window operator, but windows can be anchored to data: every movement m anchors one candidate window [m.made_at, m.made_at + max_duration_days], and a self-join collects the movements x that fall inside — same account, with julianday(x.made_at) BETWEEN julianday(m.made_at) AND julianday(m.made_at) + max_duration_days. GROUP BY the anchor turns each candidate window into one volume figure, and julianday() is what makes the arithmetic possible: the TEXT dates compare as numbers once converted, and adding 3 means adding three days. The boundary is inclusive on both ends — a window [d, d+3] spans four calendar dates, and account 1's burst on the first and third day of its window is what punishes an exclusive end.",
      "The final test asks whether ANY anchored window reaches the threshold: filtering windows WHERE volume >= max_amount and taking DISTINCT account answers exactly that, because one crossing window is enough. Account 3 crosses at exactly 10000 — 7500 plus 2500 — so the comparison must be >=: a bare > would let a textbook-threshold pattern walk through. Between the strictness boundary and the whole-history trap, both classic wrong answers produce a confidently wrong report on this seed.",
    ],
    edges: [
      "Concentration, not totals: account 2's whole-history volume (10200) crosses the bar while every 4-day window stays at or under 4200 — a GROUP BY account alone reports it wrongly; per-window sums catch the difference.",
      "The window is [d, d + max_duration_days] INCLUSIVE: 3 days means 4 calendar dates, and account 1's 01-05 + 01-07 burst (10200) only assembles inside a window whose end is included.",
      "Account 3 hits exactly 10000 inside one window: >= fires and > does not — the boundary is the alarm.",
      "amount is positive for both kinds: volume SUMs every row's amount; negating debits (or filtering kind) halves the evidence and can hide a real burst.",
    ],
    ladder: [
      {
        title: "Brute force — enumerate windows in the app",
        body: "Pull each account's movements, slide a date range across the calendar, sum inside it, compare. The window count is quadratic in practice per account, and the boundary handling lives in imperative code where it is hardest to review.",
      },
      {
        title: "The pattern — anchor each movement, self-join its window",
        body: "Every movement anchors [made_at, made_at + duration]; a self-join on account and date range gathers each window's movements; GROUP BY anchor with HAVING SUM(amount) >= threshold, then DISTINCT the accounts.",
      },
      {
        title: "The optimal idea — sort once, sweep once",
        body: "Sorting each account's movements by date and sweeping a two-pointer window answers all anchors in O(n log n) per account instead of the join's per-anchor window scans — the same aggregation in one pass. The self-join stays the right tool at audit scale; the sweep is what it becomes when the log grows.",
      },
    ],
    approach: "Self-join Movements on account + date window [made_at, made_at + max_duration_days], GROUP BY anchor, HAVING SUM(amount) >= max_amount, DISTINCT the accounts",
    schema: {
      ddl: `CREATE TABLE Movements (
  movement_id INTEGER PRIMARY KEY,
  account_id  INTEGER NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('credit', 'debit')),
  amount      INTEGER NOT NULL,
  made_at     TEXT NOT NULL
);
CREATE TABLE Rules (
  rule_id           INTEGER PRIMARY KEY,
  max_duration_days INTEGER NOT NULL,
  max_amount        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Rules (rule_id, max_duration_days, max_amount) VALUES
  (1, 3, 10000);
INSERT INTO Movements (movement_id, account_id, kind, amount, made_at) VALUES
  (1, 1, 'debit',  300,  '2025-01-02'),
  (2, 1, 'credit', 6000, '2025-01-05'),
  (3, 1, 'debit',  4200, '2025-01-07'),   -- window 01-05..01-08: 6000 + 4200 = 10200 → suspicious
  (4, 2, 'credit', 1000, '2025-02-01'),
  (5, 2, 'credit', 1100, '2025-02-02'),   -- account 2: ~1000/day for 10 days, total 10200...
  (6, 2, 'credit', 900,  '2025-02-03'),   -- ...but NO 4-calendar-day window exceeds 4200
  (7, 2, 'credit', 1200, '2025-02-04'),
  (8, 2, 'credit', 800,  '2025-02-05'),
  (9, 2, 'credit', 1300, '2025-02-06'),
  (10, 2, 'credit', 700,  '2025-02-07'),
  (11, 2, 'credit', 1400, '2025-02-08'),
  (12, 2, 'credit', 600,  '2025-02-09'),
  (13, 2, 'credit', 1200, '2025-02-10'),
  (14, 3, 'credit', 7500, '2025-03-10'),  -- with the debit below: exactly 10000 inside 03-10..03-13
  (15, 3, 'debit',  2500, '2025-03-12');`,
      tables: [
        { name: "Movements", note: "15 movements across 3 accounts: account 1 bursts 10200 inside 3 days, account 2 drips ~1000/day for 10 days (total 10200, never concentrated), account 3 lands exactly 10000 in one window" },
        { name: "Rules", note: "exactly one row: 3-day windows, 10000 threshold" },
      ],
    },
    code: `WITH anchored AS (
    -- every movement anchors one candidate window:
    -- [m.made_at, m.made_at + max_duration_days], both ends included
    SELECT
        m.movement_id AS anchor_id,
        m.account_id,
        SUM(x.amount) AS window_volume   -- credits AND debits count positive
    FROM Movements m
    JOIN Movements x
      ON x.account_id = m.account_id
     AND julianday(x.made_at) >= julianday(m.made_at)
     AND julianday(x.made_at) <= julianday(m.made_at)
        + (SELECT max_duration_days FROM Rules)
    GROUP BY m.movement_id, m.account_id
)
SELECT DISTINCT w.account_id
FROM anchored w
WHERE w.window_volume >= (SELECT max_amount FROM Rules)   -- ONE crossing window is enough
ORDER BY w.account_id ASC;`,
    walkthrough: [
      "The self-join gives every movement its window sum: account 1's anchors read 6300 (01-02), 10200 (01-05, because 01-05 through 01-08 catches both the 6000 and the 4200), and 4200 (01-07); account 2's ten daily anchors top out at 4200; account 3's anchors read 10000 (03-10, 7500 + 2500) and 2500.",
      "The threshold filter keeps windows with volume >= 10000: account 1's 01-05 anchor and account 3's 03-10 anchor — exactly-at counts, because the comparison is >=. Account 2 has no qualifying window despite its 10200 whole-history total.",
      "DISTINCT collapses qualifying windows to accounts and the sort orders them: (1), (3) — two rows. The naive whole-history GROUP BY would have returned (1), (2), (3): account 2's drip-feed would launder straight past it.",
    ],
    time: "O(m × w) — each anchor sums its window of up to w movements; a date-sorted sweep would cut this to O(m log m) per account",
    space: "O(m × w) — the anchored CTE holds one aggregate row per anchor window",
    followUps: [
      "Rewrite the test as a per-account EXISTS over the anchored windows and confirm the output is unchanged — the short-circuit form stops at the first crossing window per account.",
      "Add a minimum-activity condition (at least 3 movements inside the window): COUNT(x.movement_id) joins the HAVING, and account 3's two-movement window would drop out.",
    ],
    related: ["countries-you-can-safely-invest-in", "customer-order-frequency"],
    order: "exact",
    xp: 35,
  },
];
