// Deep-dives — LeetCode Premium batch II, file 1 of 6: game sessions, ballots,
// payrolls and departments (5 problems: 1 Easy, 3 Medium, 1 Hard). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_GAMES: LcSqlDive[] = [
  {
    slug: "game-play-analysis-ii",
    statement:
      "Activity logs every game session as one row (player_id, device_id, event_date, games_played). A player's first login is the earliest event_date recorded for them, and the device that matters is the one on that same first-day row. For each player, report the columns player_id, device_id, first_login — one row per player, ordered by player_id ascending — where first_login is their earliest date and device_id is the device of the session carrying that date.",
    examples: [
      {
        input: "player 1001 logs in on 2024-03-01 with device 2 and again on 2024-03-05, this time with device 3",
        output: "1001 · 2 · 2024-03-01",
        explanation:
          "The first login pins both the date and the device: the 2024-03-05 session is later history, and its device never leaks into the answer.",
      },
      {
        input: "player 1003 has exactly one session, on 2024-03-04 with device 2",
        output: "1003 · 2 · 2024-03-04",
        explanation:
          "With a single session the first, latest and only login coincide — every correct formulation still emits the row, and no tie-breaking is needed.",
      },
    ],
    constraints: [
      "one row per player found in Activity; first_login is that player's MIN(event_date)",
      "device_id must come from the row whose event_date equals first_login — a device from any later session never substitutes for it",
      "columns player_id, device_id, first_login, ordered by player_id ascending",
    ],
    breakdown: [
      "This request couples an aggregate with a fact, and the coupling is the whole difficulty. The earliest date per player is an aggregate — MIN(event_date) over a GROUP BY player_id computes it in one pass. But the device is not an aggregate of anything: it is a plain column of one specific row, the row that happens to win the minimum. An aggregate query answers aggregate questions, and any bare column asked for in the same breath is borrowed from an unspecified row — the engine is under no obligation to pick the row that produced the MIN.",
      "Two reliable shapes bind the device to the winning row. The two-phase form computes the first login per player in a CTE, then joins back to Activity on (player_id, event_date = first_login) — the join keys reach exactly the first-day row and read its device. The one-pass form numbers each player's sessions by date with ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY event_date) and keeps rn = 1, whose row carries its own device. Both make 'the value on the winning row' explicit instead of hoping the engine guesses it.",
      "Why a shortcut fails here is visible in the seed. MAX(device_id) over each player's history is blind to which day a device was used: player 1001's later session uses device 3, a HIGHER id than the first day's 2, so MAX(device_id) would pair 1001's first date with the wrong device. Device ids are arbitrary labels with no ordering relationship to dates — 'the biggest id' and 'the device on day one' are unrelated quantities. Whenever a report needs a column of the row that wins an aggregate, the honest answer is a join-back or a top-1-per-group, never a second aggregate.",
    ],
    edges: [
      "The decoy is deliberate: player 1001's later day uses device 3 and player 1002's later day uses device 4 — both higher than their first-day devices — so GROUP BY player_id with MIN(event_date), MAX(device_id) reports (2, 3) and (1, 4) where the truth is (2, 2) and (1, 1).",
      "The window shortcut breaks differently: MIN(event_date) OVER (PARTITION BY player_id) stamps the first date onto EVERY session row, so player 1001 yields two rows — (device 2, 03-01) and (device 3, 03-01) — and one of them is wrong by construction.",
      "A SQLite quirk deserves honesty: GROUP BY player_id with exactly ONE aggregate (SELECT player_id, device_id, MIN(event_date)) happens to borrow bare columns from the minimum row on this engine, which yields the right answer here. It is non-portable and evaporates the moment a second aggregate joins the SELECT — the explicit join-back is the form worth writing.",
      "If a player's first day held two sessions on different devices, the join-back would return two rows for that player — this seed keeps (player_id, event_date) unique so the first login is unambiguous; a deterministic tie-break (say, MIN(device_id)) would need stating.",
    ],
    ladder: [
      { title: "Brute force — read the top row per player", body: "Sort each player's sessions by date in application code and read the first row's device. Correct, but it is a manual top-1-per-group the engine can express, and it hides the pairing rule that the aggregates get wrong." },
      { title: "The pattern — MIN CTE joined back", body: "A CTE reduces Activity to (player_id, first_login); joining back on player_id and event_date = first_login recovers the first-day row and reads its device straight off it." },
      { title: "The optimal idea — top-1 per group carries its own row", body: "O(n log n). The transferable rule: 'the column of the row that wins the aggregate' is a top-1-per-group problem — solved by ROW_NUMBER() = 1 or a join-back — and never by a second aggregate, because aggregates cannot see which row they came from." },
    ],
    approach: "MIN(event_date) per player via CTE, joined back on (player_id, event_date) so the device rides the first-login row",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,  -- 'YYYY-MM-DD'
  games_played INTEGER NOT NULL
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (1001, 2, '2024-03-01', 5),  -- first login: device 2
  (1001, 3, '2024-03-05', 2),  -- later day with a HIGHER device id: the MAX(device) decoy
  (1002, 1, '2024-03-02', 3),  -- first login: device 1
  (1002, 4, '2024-03-08', 6),  -- later day, higher device id again
  (1003, 2, '2024-03-04', 1);`,
      tables: [
        { name: "Activity", note: "5 sessions over 3 players — 1001 and 1002 log in on two days each, 1003 once" },
      ],
    },
    code: `WITH firsts AS (
    SELECT
        player_id,
        MIN(event_date) AS first_login   -- the earliest session per player
    FROM Activity
    GROUP BY player_id
)
SELECT
    a.player_id,
    a.device_id,                          -- read from the FIRST-DAY row itself
    f.first_login
FROM firsts f
JOIN Activity a
  ON a.player_id  = f.player_id
 AND a.event_date = f.first_login       -- bind the device to the min-date row
ORDER BY a.player_id;`,
    walkthrough: [
      "The CTE collapses five sessions into three players: 1001 earliest on 2024-03-01, 1002 on 2024-03-02, 1003 on 2024-03-04.",
      "The join-back reaches into Activity for the row carrying that exact date: player 1001's 2024-03-01 row holds device 2 — not the later device 3 — player 1002's 2024-03-02 row holds device 1, and player 1003's only row holds device 2.",
      "ORDER BY player_id ships the three rows: (1001, 2, 2024-03-01), (1002, 1, 2024-03-02), (1003, 2, 2024-03-04). A MAX(device_id) shortcut would have shipped 3 and 4 for the first two players.",
    ],
    time: "O(n log n) — one grouped pass for the minima plus a keyed join-back",
    space: "O(p) — one first-login row per player",
    followUps: [
      "Rewrite the report with ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY event_date) = 1 — which form degrades more gracefully if a player's first day holds two sessions on different devices?",
      "Report each player's LAST login device beside the first — does a second join-back on MAX(event_date) stay correct, and what extra rule does the last day need if it too can carry two devices?",
    ],
    related: ["game-play-analysis-i", "game-play-analysis-iv", "the-latest-login-in-2020"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "game-play-analysis-iii",
    statement:
      "The same Activity table logs each session as one row (player_id, device_id, event_date, games_played). Working in each player's own date order, report how many games they had played in TOTAL up to and including each login date: columns player_id, event_date, games_played_so_far, one row per session, ordered by player_id ascending then event_date ascending. Login dates need not be consecutive — the total carries across gaps and never resets.",
    examples: [
      {
        input: "player 2001 played 5 games on 2024-03-01, then 2 more on 2024-03-04 — nothing at all logged on the two days between",
        output: "5 on 2024-03-01 · 7 on 2024-03-04",
        explanation:
          "Gaps do not reset the sum: the 2024-03-04 row carries 5 + 2 = 7, and the next session would carry 11.",
      },
      {
        input: "player 2003's single session of 7 games on 2024-03-05",
        output: "7 on 2024-03-05",
        explanation:
          "A player's first session is its own running total — the window sees no predecessors, and the frame degenerates to that one row.",
      },
    ],
    constraints: [
      "the running total includes the current session's games_played — player 2001's first row reports 5, not 0",
      "one row per session, in date order within its player; the sum is partitioned per player and never crosses players",
      "columns player_id, event_date, games_played_so_far — ordered by player_id, then event_date",
    ],
    breakdown: [
      "A running total is window territory, not GROUP BY territory. A group would collapse each player's sessions into one row, but this report keeps every session and adds context alongside it. SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date) does exactly that: PARTITION BY hands each player a private timeline, ORDER BY event_date sorts it, and the SUM accumulates along the timeline instead of collapsing it. The output grain stays the session; the aggregate rides beside it.",
      "The word 'including' is doing real work. A frame that ends at CURRENT ROW still counts the current row, so player 2001's first session reports 5 rather than 0 — the natural reading of 'up to and including'. If a report wanted the total BEFORE the current session, the frame would end at 1 PRECEDING (or the current row's own games_played would be subtracted). Frame boundaries are where running-total semantics live, and naming the boundary — UNBOUNDED PRECEDING through CURRENT ROW — is how the query states its contract.",
      "RANGE versus ROWS is the quiet distinction worth naming. With an ORDER BY, the default frame is RANGE — it bounds by VALUE, so every peer sharing the current row's event_date rides inside the boundary together. On this seed (player_id, event_date) is unique, so RANGE and ROWS coincide and the default happens to be safe. But the safety is the seed's gift, not the query's: if a player ever logged two sessions on the same day, a RANGE frame would fold both into each other's totals and double-count, while ROWS counts one physical row at a time. Writing ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW costs nothing and removes the dependence on uniqueness.",
    ],
    edges: [
      "Includes-current: player 2001's first row reports 5 — a frame that stopped at 1 PRECEDING, or a sum that excluded the current session, would report 0.",
      "Non-contiguous dates: player 2001 logs in on 03-01, 03-04 and 03-09 and the totals run 5, 7, 11 across the gap — a running sum is per-player, not per-day, and no gap resets it.",
      "The default frame with ORDER BY is RANGE (value-bounded): unique dates make it agree with ROWS here, but duplicate same-day sessions would double-count under RANGE — each peer's window absorbs the other — so the explicit ROWS frame is the safe habit.",
      "TEXT dates in 'YYYY-MM-DD' form sort lexicographically in exact calendar order, so ORDER BY event_date needs no date functions and no casting.",
    ],
    ladder: [
      { title: "Brute force — accumulate in a loop", body: "Sort each player's sessions by date and add games_played into a per-player accumulator while printing rows. The engine expresses the same walk as one window expression over the sorted partition." },
      { title: "The pattern — window running SUM", body: "SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date): one partition per player, ordered dates, running frame from the partition start through the current row." },
      { title: "The optimal idea — name the frame, do not inherit it", body: "O(n log n). The durable rule: the default frame is RANGE and only behaves when the ORDER BY keys are unique — spell out ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW so the semantics survive duplicate keys without a seed change." },
    ],
    approach: "SUM OVER (PARTITION BY player_id ORDER BY event_date ROWS UNBOUNDED PRECEDING..CURRENT ROW), current row included",
    schema: {
      ddl: `CREATE TABLE Activity (
  player_id    INTEGER NOT NULL,
  device_id    INTEGER NOT NULL,
  event_date   TEXT NOT NULL,  -- 'YYYY-MM-DD'
  games_played INTEGER NOT NULL
);`,
      seed: `INSERT INTO Activity (player_id, device_id, event_date, games_played) VALUES
  (2001, 2, '2024-03-01', 5),  -- running total 5
  (2001, 3, '2024-03-04', 2),  -- two-day gap: total 7, NOT reset
  (2001, 2, '2024-03-09', 4),  -- running total 11
  (2002, 1, '2024-03-02', 3),  -- consecutive days from here
  (2002, 1, '2024-03-03', 6),  -- running total 9
  (2003, 5, '2024-03-05', 7);`,
      tables: [
        { name: "Activity", note: "6 sessions over 3 players — player 2001's dates are non-contiguous, 2002 logs in on back-to-back days, 2003 plays once" },
      ],
    },
    code: `SELECT
    player_id,
    event_date,
    SUM(games_played) OVER (
        PARTITION BY player_id
        ORDER BY event_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- current session INCLUDED
    ) AS games_played_so_far
FROM Activity
ORDER BY player_id, event_date;`,
    walkthrough: [
      "PARTITION BY player_id splits six sessions into three timelines; ORDER BY event_date sorts each one — 2001's dates 03-01, 03-04, 03-09 with a two-day hole after the first.",
      "The frame runs from each player's first session through the current row, current row included: 2001 accumulates 5, then 7, then 11; 2002 accumulates 3, then 9; 2003's lone session reports its own 7.",
      "ORDER BY player_id, event_date ships the six rows — the totals never reset across the 03-01 to 03-04 gap and never leak across players.",
    ],
    time: "O(n log n) — one sort per partition, then a running pass",
    space: "O(n) — one output row per session",
    followUps: [
      "Report the same timeline with the PRIOR total (before the current session) beside the inclusive one — which frame bound changes, and what does each player's first row show?",
      "Flag the first date on which each player's running total crossed 10 — how does a CASE over the window (or a second window) mark the crossing without stopping the rows after it?",
    ],
    related: ["game-play-analysis-v", "find-total-time-spent-by-each-employee", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "winning-candidate",
    statement:
      "Two tables hold a small election. Candidate lists the people standing: (id, name). Vote lists every ballot cast: (id, candidateId). Report the NAME of the candidate who received the most votes — one column, name, one row. The seed guarantees a single winner, but the query itself must find the winner by comparing vote counts, not by assuming who it is.",
    examples: [
      {
        input: "candidate 1 drew 4 ballots, candidate 2 drew 3, candidate 4 drew 2, candidate 5 drew 1",
        output: "the name of candidate 1",
        explanation:
          "4 is the strict maximum: tally the ballots per candidate, attach the names, and the argmax keeps the top row.",
      },
      {
        input: "candidate 3 stands for election but drew no ballots at all",
        output: "(never surfaces in the winner query)",
        explanation:
          "A zero-vote candidate cannot top the count, so the winner query needs no special handling — but a per-candidate tally that INNER-joins candidates to ballots would drop them from view entirely.",
      },
    ],
    constraints: [
      "the winner is the candidate with the strictly greatest ballot count; this seed's counts are 4, 3, 2, 1 and 0, so the maximum is unique",
      "one column name, one row — the winner's name exactly as stored in Candidate",
      "the solution must derive the winner from the counts (an argmax), never from a hardcoded id or name",
    ],
    breakdown: [
      "The two tables sit at different grains: one row per candidate, many rows per candidate on the ballot side. Counting votes is therefore a GROUP BY candidateId over Vote inside a subquery, and the names arrive afterwards by joining Candidate on id. An inner join is sufficient for the winner question because only candidates who received ballots can lead: a zero-vote candidate contributes no group at all, and no absent group can beat counts of 4, 3, 2 and 1.",
      "The argmax itself is the canonical ORDER BY cnt DESC LIMIT 1: sort the tallied rows by count descending and keep the first. On this seed the spread 4-3-2-1-0 makes the maximum unique, so exactly one row survives the LIMIT and the output is deterministic. It is worth knowing what a tie would do — LIMIT 1 would pick arbitrarily among the tied rows, because the ORDER BY has no secondary key to split equal counts. The tie-safe variants are RANK() OVER (ORDER BY cnt DESC) = 1, which reports every tied name, or a join on cnt = (SELECT MAX(cnt) ...), which does the same by construction. The seed buys the simple form its determinism; the query should know it is borrowing.",
      "The zero-vote candidate is where join direction becomes visible. In the winner query, candidate 3 simply never appears: GROUP BY forms groups only from rows that exist. But flip the task to a per-candidate TALLY — every candidate beside their count — and an inner join silently omits them, which in an election report reads as 'did not stand'. A LEFT JOIN starting from Candidate keeps their row with NULLs on the ballot side, and COUNT over a ballot-side column reports 0 for them. Choose the join direction by asking who must appear in the output, not by which join is shorter to type.",
    ],
    edges: [
      "ORDER BY cnt DESC LIMIT 1 is the accepted argmax; the seed's 4/3/2/1/0 spread makes the maximum unique, so the single row is deterministic.",
      "A tie at the top would break LIMIT 1 — no secondary ORDER BY key exists to split equal counts; the tie-safe forms are RANK() OVER (ORDER BY cnt DESC) = 1 or joining on cnt = MAX(cnt), and both would report every tied name.",
      "Candidate 3 holds zero votes and needs no handling in the winner query — GROUP BY only forms groups from rows that exist — but a per-candidate tally must LEFT JOIN from Candidate or they vanish.",
      "In that tally, COUNT(v.id) over the LEFT JOIN yields 0 for the empty candidate while COUNT(*) counts the unmatched department-style row itself and would report 1 — the aggregate-column choice becomes the whole bug.",
    ],
    ladder: [
      { title: "Brute force — tally by hand", body: "Sweep the ballots once per candidate id, write the counts down, read off the maximum and type the name. Works for one election night, never for a rerun with fresh data." },
      { title: "The pattern — grouped tally, joined names, ordered top-1", body: "A subquery GROUP BY candidateId with COUNT(*) builds the tally; joining Candidate restores the name; ORDER BY cnt DESC LIMIT 1 selects the winner." },
      { title: "The optimal idea — argmax plus an explicit tie policy", body: "O(v + c). Argmax in SQL is an ordered top-1; the durable judgment is the tie policy — LIMIT 1 needs a uniqueness guarantee (here the seed's spread), RANK() = 1 reports all tied winners, and the join direction decides whether zero-vote candidates exist at all." },
    ],
    approach: "GROUP BY candidateId tally, join names, ORDER BY count DESC LIMIT 1",
    schema: {
      ddl: `CREATE TABLE Candidate (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Vote (
  id          INTEGER PRIMARY KEY,
  candidateId INTEGER NOT NULL REFERENCES Candidate(id)
);`,
      seed: `INSERT INTO Candidate (id, name) VALUES
  (1, 'Ada'),
  (2, 'Bram'),
  (3, 'Cleo'),    -- stands but draws no ballots
  (4, 'Dmitri'),
  (5, 'Esme');
INSERT INTO Vote (id, candidateId) VALUES
  (1, 2), (2, 1), (3, 4), (4, 1), (5, 2),
  (6, 1), (7, 5), (8, 4), (9, 1), (10, 2);`,
      tables: [
        { name: "Candidate", note: "5 candidates — Cleo (id 3) receives no ballots at all" },
        { name: "Vote", note: "10 ballots — Ada 4, Bram 3 (one behind), Dmitri 2, Esme 1, Cleo 0" },
      ],
    },
    code: `SELECT c.name
FROM (
    SELECT
        candidateId,
        COUNT(*) AS cnt        -- ballots per candidate who HAS ballots
    FROM Vote
    GROUP BY candidateId
) v
JOIN Candidate c ON c.id = v.candidateId
ORDER BY v.cnt DESC              -- argmax: strict max first (unique on this seed)
LIMIT 1;`,
    walkthrough: [
      "The grouped subquery collapses ten ballots into four groups: candidate 1 holds 4, candidate 2 holds 3, candidate 4 holds 2, candidate 5 holds 1. Candidate 3 forms no group — GROUP BY only counts rows that exist.",
      "The join attaches names to the tallies: Ada 4, Bram 3, Dmitri 2, Esme 1. ORDER BY cnt DESC lines them up with Ada on top, and LIMIT 1 keeps exactly that row.",
      "The output is one row, one column: 'Ada'. Cleo's zero votes never needed special handling here — and the 4-3-2-1-0 spread is exactly what rules out the tie that LIMIT 1 could not resolve.",
    ],
    time: "O(v + c) — one grouped pass over ballots plus a keyed join",
    space: "O(c) — one count per candidate holding ballots",
    followUps: [
      "Make the query tie-safe: report EVERY candidate tied for the most votes via RANK() OVER (ORDER BY cnt DESC) = 1 — what does it return on this seed, and what would it return had Bram drawn a fourth ballot?",
      "Produce the full tally as columns name, votes with every candidate included, zero votes and all — which join direction keeps Cleo at 0, and why does COUNT(*) over that join report 1 instead?",
    ],
    related: ["friend-requests-ii-who-has-the-most-friends", "the-airport-with-the-most-flights", "all-the-pairs-with-the-maximum-number-of-common-followers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-cumulative-salary-of-an-employee",
    statement:
      "Employee stores one row per month an employee was paid: (id, month, salary). For each (id, month) that survives the rule below, report the cumulative salary of that month TOGETHER WITH the two months before it — the sum of up to three consecutive monthly salaries ending at the reported month. Each employee's MOST RECENT month is excluded from the report entirely. Output columns id, month, salary — the third column carries the cumulative figure — ordered by id ascending, then month ascending.",
    examples: [
      {
        input: "employee 1 is paid 20000 in month 1, 30000 in month 2, 40000 in month 3, 45000 in month 4",
        output: "month 1 · 20000 · month 2 · 50000 · month 3 · 90000 (month 4 excluded)",
        explanation:
          "Month 3's window is 20000 + 30000 + 40000 = 90000; month 4 would sum 115000, but it is employee 1's latest month and drops out entirely.",
      },
      {
        input: "employee 2 is paid 35000 in month 1, 38000 in month 2, 40000 in month 3",
        output: "month 1 · 35000 · month 2 · 73000 (month 3 excluded)",
        explanation:
          "Month 2's window is 35000 + 38000; month 1 has no predecessors, so its cumulative is just its own salary.",
      },
    ],
    constraints: [
      "the window is the reported month plus the TWO months before it — up to three consecutive months; early months simply sum whatever predecessors exist",
      "each employee's most recent month (their MAX month) is excluded from the output entirely",
      "columns id, month, salary — salary carries the cumulative figure — ordered by id, then month",
    ],
    breakdown: [
      "Two jobs share one query, and the order of operations decides which one is done honestly. The cumulative is window work: SUM(salary) OVER (PARTITION BY id ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). Every word of that frame earns its place. Without an explicit frame, a window with ORDER BY defaults to RANGE UNBOUNDED PRECEDING through CURRENT ROW — the whole running history, not a three-month window. And the bound must be ROWS rather than RANGE: RANGE bounds by VALUE, so months sharing the same month value would ride inside each other's windows as peers, while ROWS means exactly this row plus the two physical rows before it.",
      "The exclusion has a direction, and pointing it the wrong way destroys the report. Filtering 'not the latest month' in a WHERE before the window runs removes month 4 from Employee — and then the window computes over a maimed timeline in which the boundary has MOVED: month 3 is now the newest surviving row, so a filter applied at that stage removes it too. Employee 1's month 3 (90000) and employee 2's month 2 (73000) are lost, even though neither needs the dropped rows to be computed. The excluded months are needed as window INPUT; they are merely banned as OUTPUT.",
      "So the shape is: let the window see everything, then demote the boundary afterwards. MAX(month) OVER (PARTITION BY id) paints every row with its employee's newest month; the outer query filters month < last_month, keeping all but that one row per employee. (ROW_NUMBER() OVER (PARTITION BY id ORDER BY month DESC) > 1 marks the same rows.) This is the general discipline behind 'drop the latest order', 'ignore the current price', 'skip the newest snapshot': WHERE sees individual rows, and the fact 'this row is the newest of its partition' only exists once the whole partition has been seen — so it can only be tested after aggregation.",
    ],
    edges: [
      "Month 1 has no predecessors — the ROWS frame degenerates to the single row, so its cumulative is 20000 for employee 1 and 35000 for employee 2, not NULL and not zero.",
      "The exclusion must run AFTER aggregation: pre-filtering the latest month shifts the boundary inward and loses employee 1's month 3 (90000) and employee 2's month 2 (73000) — the dropped rows are window input even though they are banned output.",
      "On THIS seed the default frame lies undetected: months start at 1, so every reported month has at most two predecessors and the running total coincides with the three-month window (20000, 50000, 90000; 35000, 73000) — the divergence would appear at a month 5. RANGE BETWEEN 2 PRECEDING AND CURRENT ROW would also agree here, but only because no month value repeats within an employee: duplicate month values would ride the window together as peers, while ROWS counts three physical rows no matter what the values say.",
      "Employee 1's month 4 sums 30000 + 40000 + 45000 = 115000 inside the window and is then discarded by the outer filter — the window's work on excluded rows is not wasted, it is simply unreported.",
    ],
    ladder: [
      { title: "Brute force — loop the last three months", body: "For each employee, walk their months in order adding the last three salaries into a sliding sum, and skip the newest month in application code. Three moving parts the engine already ships as a window frame." },
      { title: "The pattern — explicit ROWS frame, then drop the latest", body: "SUM ... OVER (PARTITION BY id ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) computes the cumulative over the full table; a second window marks each employee's MAX month; the outer filter removes it." },
      { title: "The optimal idea — exclusions live after aggregation", body: "O(n log n). The durable rule: windows must see the FULL partition, so 'exclude the newest' is a POST-aggregation filter — mark the boundary row with a window, filter outside, and never shrink the input the window reads." },
    ],
    approach: "ROWS 2 PRECEDING..CURRENT ROW window over the full table; latest month per id removed after aggregation",
    schema: {
      ddl: `CREATE TABLE Employee (
  id     INTEGER NOT NULL,
  month  INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  PRIMARY KEY (id, month)
);`,
      seed: `INSERT INTO Employee (id, month, salary) VALUES
  (1, 1, 20000),
  (1, 2, 30000),
  (1, 3, 40000),  -- window sums 90000 over months 1..3
  (1, 4, 45000),  -- latest month: window sees it, report drops it
  (2, 1, 35000),
  (2, 2, 38000),
  (2, 3, 40000);`,
      tables: [
        { name: "Employee", note: "7 rows — employee 1 paid months 1..4, employee 2 months 1..3; the newest month of each is excluded from the report" },
      ],
    },
    code: `WITH windows AS (
    SELECT
        id,
        month,
        SUM(salary) OVER (
            PARTITION BY id
            ORDER BY month
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW  -- three physical rows, not value peers
        ) AS cum_salary,
        MAX(month) OVER (PARTITION BY id) AS last_month  -- the boundary row, marked per employee
    FROM Employee
)
SELECT
    id,
    month,
    cum_salary AS salary      -- the output column keeps the name salary
FROM windows
WHERE month < last_month     -- drop the latest month AFTER the window ran
ORDER BY id, month;`,
    walkthrough: [
      "The window partitions seven rows into two timelines. Employee 1's ROWS frame sums at most three physical rows: month 1 alone gives 20000, months 1-2 give 50000, months 1-3 give 90000, months 2-4 give 115000.",
      "MAX(month) OVER (PARTITION BY id) marks every row with its employee's newest month — 4 for employee 1, 3 for employee 2 — and WHERE month < last_month keeps employee 1's months 1-3 and employee 2's months 1-2, whose frames give 35000 and 73000.",
      "Five rows ship ordered by id then month: (1, 1, 20000), (1, 2, 50000), (1, 3, 90000), (2, 1, 35000), (2, 2, 73000) — the two excluded months were consumed as window input and never reported.",
    ],
    time: "O(n log n) — one partitioned sort feeding two window passes",
    space: "O(n) — the windowed rows held until the final filter",
    followUps: [
      "Generalise the window to k months before the reported one — what changes in the frame, and how would you surface k as data beside the output instead of hardcoding 2?",
      "Exclude the latest month only when it is INCOMPLETE (say, salary still 0) — where does that condition live: the marking window, the outer filter, or both, and why can it never live in a pre-window WHERE?",
    ],
    related: ["rank-scores", "department-top-three-salaries", "game-play-analysis-v"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "count-student-number-in-departments",
    statement:
      "Department lists faculties (id, name); Student lists enrolled students (id, student_name, department_id), each mapped to exactly one listed department. Report one row per department: columns dept_name, student_number, where student_number is how many students are enrolled in that faculty. Faculties with no students still appear — exactly once, with 0. Order by student_number descending, then dept_name ascending.",
    examples: [
      {
        input: "Engineering holds 3 students, Science holds 2",
        output: "Engineering · 3 · Science · 2",
        explanation:
          "Each department is counted over the student rows its join produced; a count tie would fall back to the department name.",
      },
      {
        input: "Arts exists in Department but no Student row points at it",
        output: "Arts · 0",
        explanation:
          "The LEFT JOIN keeps the department row with NULLs on the student side, and COUNT over a student column counts those NULLs as nothing — 0, not 1, and not a missing row.",
      },
    ],
    constraints: [
      "every department in Department appears exactly once — zero-student departments report 0 and never vanish",
      "student_number counts the Student rows mapped to the department",
      "columns dept_name, student_number — ordered by student_number descending, then dept_name ascending",
    ],
    breakdown: [
      "The requirement 'zero-student departments count too' is a join-direction decision made before any counting starts. An INNER join keeps only departments that have students, so the empty faculty vanishes from the report without ever erroring — a silent subtraction that is far worse than a crash. A LEFT JOIN starting from Department threads every department row through and fills the student side with NULLs when nothing matches; the output contract lives in that one keyword.",
      "Counting the kept rows is where the second half of the bug hides. COUNT over a student-side column counts non-NULL values only, so the empty department's NULLs contribute nothing and its total is exactly 0. COUNT(*) counts ROWS — and the unmatched department row IS a row — so it reports 1 for a faculty with nobody in it. On a dataset where every department has students the two aggregates agree, which is precisely why this bug ships unnoticed: the one department that exposes it is the one nobody thinks to test. The aggregate you pick is output semantics, not style.",
      "GROUP BY d.id, d.name groups by identity and carries the display name along — two faculties could share a name, and a name-only grouping would merge them into one row. The ORDER BY finishes the contract: student_number DESC puts the busiest faculty first, and dept_name ASC makes any count tie deterministic instead of engine-dependent. Note the direction one last time: a student pointing at no listed department would appear in no output row at all, because the department side drives the report — surfacing such orphans is a different query built FROM Student.",
    ],
    edges: [
      "Arts has no students and still ships a row with 0 — the LEFT JOIN is what keeps it; an INNER join would report 2 rows for 3 departments and lose nothing else.",
      "COUNT(s.id), not COUNT(*): the empty department's single left-joined row counts 1 under COUNT(*) — a classic off-by-one that only shows on the zero case.",
      "Every Student row maps to a listed department here; a student with a missing department_id would appear in NO output row — this report is department-driven, and FROM Student LEFT JOIN Department is how orphans would surface.",
      "This seed's counts (3, 2, 0) are distinct, so the ordering key is unique; a count tie would need the dept_name ASC tiebreaker the query already carries — without it, equal counts ship in engine-dependent order.",
    ],
    ladder: [
      { title: "Brute force — tally per faculty", body: "Count students per department id in a spreadsheet and remember the empty faculty by hand. The engine does it in one LEFT JOIN plus one GROUP BY, with the zero case handled by the aggregate choice." },
      { title: "The pattern — LEFT JOIN, group, COUNT the right column", body: "LEFT JOIN Student onto Department, GROUP BY the department's id and name, COUNT over a student-side column so unmatched departments total 0." },
      { title: "The optimal idea — join direction and aggregate choice encode the contract", body: "O(d + s). The durable rules: the join direction decides WHO appears (LEFT keeps the empty side), and the counting aggregate decides WHAT counts (COUNT(column) ignores the NULLs the join created; COUNT(*) counts the row itself)." },
    ],
    approach: "LEFT JOIN Department to Student, GROUP BY department, COUNT(student column) so zeros stay zero",
    schema: {
      ddl: `CREATE TABLE Department (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Student (
  id            INTEGER PRIMARY KEY,
  student_name  TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES Department(id)
);`,
      seed: `INSERT INTO Department (id, name) VALUES
  (1, 'Engineering'),
  (2, 'Science'),
  (3, 'Arts');    -- no students at all
INSERT INTO Student (id, student_name, department_id) VALUES
  (101, 'Ana', 1),
  (102, 'Bilal', 1),
  (103, 'Chen', 1),
  (104, 'Dana', 2),
  (105, 'Elif', 2);`,
      tables: [
        { name: "Department", note: "3 faculties — Arts (id 3) holds no students" },
        { name: "Student", note: "5 students, all mapped — 3 to Engineering, 2 to Science" },
      ],
    },
    code: `SELECT
    d.name AS dept_name,
    COUNT(s.id) AS student_number   -- NULLs from the LEFT JOIN count as nothing
FROM Department d
LEFT JOIN Student s ON s.department_id = d.id
GROUP BY d.id, d.name               -- group by identity; the name rides along
ORDER BY student_number DESC, dept_name ASC;`,
    walkthrough: [
      "The LEFT JOIN threads all three department rows through: Engineering and Science match their students, Arts keeps its row with NULLs on the student side — five students join, one department joins to nothing.",
      "GROUP BY d.id, d.name builds three groups, and COUNT(s.id) counts non-NULL student ids: 3 for Engineering, 2 for Science, and 0 for Arts, whose only row carries no student id to count.",
      "ORDER BY student_number DESC, dept_name ASC ships (Engineering, 3), (Science, 2), (Arts, 0) — COUNT(*) here would have printed Arts as 1, and an INNER join would have printed nothing for it at all.",
    ],
    time: "O(d + s) — one scan each of departments and students, hashed on the key",
    space: "O(d) — one group per department",
    followUps: [
      "Report the other orphan direction: students whose department_id names no listed department — how does starting FROM Student change who can appear, and what does the department column show for them?",
      "Add each department's share of the total enrolment as a percentage column — where does the grand total come from (a window over the groups, or a scalar subquery), and how do you keep it at 0 for the empty faculty?",
    ],
    related: ["customers-who-never-order", "classes-more-than-5-students", "top-travellers"],
    order: "exact",
    xp: 20,
  },
];
