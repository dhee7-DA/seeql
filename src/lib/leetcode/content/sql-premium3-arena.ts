// Deep-dives — LeetCode Premium batch III, file 3 of 6: transit boarding, league
// streaks, standings and fixture lists (1 Easy, 3 Medium, 2 Hard). Engine-verified
// against the seed by scripts/tmp-67b3-check.ts (and by scripts/lc-sql-verify.ts
// once wired). Re-authored from the canonical premium tasks: own tables, own
// seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_ARENA: LcSqlDive[] = [
  {
    slug: "the-number-of-passengers-in-each-bus-i",
    statement:
      "A shuttle line keeps two logs. Bus lists the timetable as (bus_id, arrival_time), with arrival_time stored as TEXT 'YYYY-MM-DD HH24:MI'; Passenger lists everyone waiting on the platform as (passenger_id, arrival_time). Every rider boards the EARLIEST bus that arrives at or after the minute they show up — a rider arriving exactly when a bus arrives catches it. Report one row per bus: bus_id, riders_cnt — how many riders board that bus — ordered by bus_id ascending. Buses nobody boards still ship a row, with 0.",
    examples: [
      {
        input:
          "bus 12 arrives 2024-06-01 09:30; rider 1 shows up 09:05 and riders 2 and 3 both show up at exactly 09:30",
        output: "bus 12 · 3",
        explanation:
          "All three riders find bus 12 to be the earliest timetable entry at or after their minute; the two same-minute riders co-board, because the rule keys on arrival time alone and never on queue position.",
      },
      {
        input:
          "bus 7 arrives 2024-06-01 09:00, before every rider on the platform — the earliest rider shows up at 09:05",
        output: "bus 7 · 0",
        explanation:
          "No rider can board a bus that departed before they arrived, and the report is built over the full timetable spine, so the empty bus ships with 0 instead of vanishing.",
      },
    ],
    constraints: [
      "one row per Bus row, even for buses with zero riders; riders_cnt counts the riders whose earliest eligible bus is that bus",
      "each rider boards exactly one bus — the first timetable entry whose arrival_time is at or after their own arrival_time; buses with equal arrival times are not exercised by this seed",
      "columns bus_id, riders_cnt, ordered by bus_id ascending",
    ],
    breakdown: [
      "The report asks for a per-bus count, but the grouping is the easy half: which riders belong to which bus is decided by a rule, not by a shared column. Each rider's bus is the earliest timetable entry at or after their arrival — a minimum over a filtered set. So the honest pipeline is assign, then count: resolve every rider to a bus first, and only then aggregate the assignments over the bus spine. Skipping the assignment step and joining the two tables directly multiplies each rider across every bus that arrives after them.",
      "Numbering the buses turns 'earliest eligible' into a minimum over integers. ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) hands each bus a clean 1..m position in departure order, and a rider's bus becomes MIN(bus_no) over the buses whose arrival_time is at or after the rider's minute. The minimum is unique, so the assignment is deterministic even when several buses qualify, and the bus_id tie-break inside the numbering keeps it deterministic even if two buses ever shared a minute. This timetable's minutes are distinct, so the ordering is total.",
      "The count itself must survive the empty bus. A LEFT JOIN from the bus spine keeps bus 7's row with NULLs on the boarding side, and COUNT(bd.passenger_id) counts only real boarders, so the empty bus reports 0 rather than disappearing. COUNT(*) would count the unmatched spine row itself and print 1. The output order is bus_id, not departure order — bus 3 departs last yet prints first, because its id is the smallest of the three.",
    ],
    edges: [
      "Riders 2 and 3 share the exact minute 09:30 and both board bus 12 — a formulation that assigns 'a' bus per rider without the MIN, or one that numbers buses by bus_id instead of departure time, can split the pair onto different buses; numbering by departure order and taking MIN(bus_no) holds them together on bus 12.",
      "Rider 2 arrives exactly at bus 12's arrival minute and boards it; a strict > comparison rejects bus 12 for rider 2 and ships bus 12 with 2 riders and bus 3 with 4 instead of 3 and 3.",
      "Bus 7 arrives at 09:00, before every rider — the earliest rider shows 09:05 — so it earns 0; an INNER join built from the boarding side drops the row entirely (2 rows for 3 buses), and COUNT(*) over the LEFT JOIN would print 1 for it.",
      "The raw join fans out: riders 1, 2 and 3 each match both bus 12 and bus 3 on arrival_time <= b.arrival_time, so a plain GROUP BY over the join reports bus 3 with 6 riders instead of 3 — every early rider counted again on the later bus.",
    ],
    ladder: [
      { title: "Brute force — sweep riders per bus", body: "Walk the timetable bus by bus, and for each bus sweep the rider list collecting everyone whose earliest eligible bus it is; write 0 when nobody qualifies. Correct, but it is a nested loop the engine expresses with one numbered spine and one assignment subquery." },
      { title: "The pattern — number the spine, assign a minimum, count", body: "ROW_NUMBER numbers the buses in departure order; each rider takes MIN(bus_no) over the buses arriving at or after their minute; the assignments aggregate over the full bus spine through a LEFT JOIN." },
      { title: "The optimal idea — earliest-eligible is MIN over a numbered spine", body: "O(n log n + n·m) for the per-rider probes. The transferable rules: number the candidate set so 'earliest' becomes a MIN over integers, and keep the report's spine in a LEFT JOIN so zero-activity rows survive — an INNER join silently shrinks the report to the active rows only." },
    ],
    approach: "Buses numbered by departure order; each rider takes MIN(bus_no) among buses arriving at-or-after their minute; LEFT JOIN back to the bus spine and COUNT",
    schema: {
      ddl: `CREATE TABLE Bus (
  bus_id       INTEGER NOT NULL,
  arrival_time TEXT NOT NULL  -- 'YYYY-MM-DD HH24:MI'
);
CREATE TABLE Passenger (
  passenger_id INTEGER NOT NULL,
  arrival_time TEXT NOT NULL
);`,
      seed: `INSERT INTO Bus (bus_id, arrival_time) VALUES
  (7,  '2024-06-01 09:00'),  -- first departure, before every rider on the platform
  (12, '2024-06-01 09:30'),  -- riders 1, 2 and 3 board here; riders 2 and 3 land exactly on this minute
  (3,  '2024-06-01 10:15');
INSERT INTO Passenger (passenger_id, arrival_time) VALUES
  (1, '2024-06-01 09:05'),  -- after bus 7, before bus 12: earliest eligible is bus 12
  (2, '2024-06-01 09:30'),  -- exactly AT bus 12's minute: boards it (at-or-after)
  (3, '2024-06-01 09:30'),  -- same minute as rider 2: co-boards bus 12
  (4, '2024-06-01 09:45'),  -- bus 12 already gone: earliest eligible is bus 3
  (5, '2024-06-01 09:50'),  -- bus 3 again
  (6, '2024-06-01 10:00');`,
      tables: [
        { name: "Bus", note: "3 departures — ids 7, 12, 3 in departure order; bus 7 leaves before anyone arrives" },
        { name: "Passenger", note: "6 riders — riders 2 and 3 share the 09:30 minute, and rider 2 lands exactly on bus 12's arrival" },
      ],
    },
    code: `WITH buses AS (
    SELECT
        bus_id,
        arrival_time,
        ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) AS bus_no  -- 1..m in departure order
    FROM Bus
),
boarding AS (
    SELECT
        p.passenger_id,
        -- earliest bus AT or AFTER the rider's minute = MIN departure-order number
        (SELECT MIN(b.bus_no)
           FROM buses b
          WHERE b.arrival_time >= p.arrival_time) AS bus_no
    FROM Passenger p
)
SELECT
    bu.bus_id,
    COUNT(bd.passenger_id) AS riders_cnt  -- real boarders only; an empty bus counts 0
FROM buses bu
LEFT JOIN boarding bd ON bd.bus_no = bu.bus_no  -- spine LEFT JOIN keeps the zero-rider bus
GROUP BY bu.bus_id
ORDER BY bu.bus_id;`,
    walkthrough: [
      "The buses CTE numbers the timetable in departure order: bus 7 takes position 1, bus 12 position 2, bus 3 position 3 — the ids are deliberately not in departure order.",
      "Each rider resolves to MIN(bus_no) among buses arriving at or after their minute: riders 1, 2 and 3 all reach bus 12 (rider 1 at 09:05 is before it, riders 2 and 3 land exactly on its 09:30 minute), while riders 4, 5 and 6 — 09:45 and later — miss bus 12 and settle on bus 3; bus 7 attracts nobody.",
      "The LEFT JOIN threads all three spine rows: bus 3 counts riders 4-6 for 3, bus 7 counts nobody for 0, bus 12 counts riders 1-3 for 3 — shipped in bus_id order as (3, 3), (7, 0), (12, 3).",
    ],
    time: "O(n·m) — one eligibility probe per rider over the numbered timetable, plus the grouping pass",
    space: "O(n + m) — one assignment row per rider plus the numbered spine",
    followUps: [
      "Return each rider alongside the bus they caught as (passenger_id, bus_id) — what changes in the assignment CTE, and in what order do the two same-minute riders print?",
      "Give every bus a capacity and refuse riders once it fills — where does the per-bus running load come from, and which riders fall through to a later bus or off the line entirely?",
    ],
    related: ["count-student-number-in-departments", "customers-who-never-order", "the-airport-with-the-most-flights"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "the-number-of-passengers-in-each-bus-ii",
    statement:
      "The same shuttle line, now weight-constrained. Bus lists the timetable with a capacity: (bus_id, arrival_time, capacity); Passenger lists the queue with each rider's weight: (passenger_id, arrival_time, weight). Riders are processed in (arrival_time, passenger_id) order — the queue breaks equal minutes on the smaller id. Each rider takes the earliest bus that arrives at or after their minute AND still has room for their full weight, where a bus's room is its capacity minus the weight already boarded. A rider no bus can take is left behind and appears in no output row. Report one row per bus: bus_id, boarded_cnt, boarded_weight — the riders taken and the weight they add — ordered by bus_id ascending.",
    examples: [
      {
        input:
          "bus 7 (capacity 100) takes rider 1 (weight 60) then rider 2 (weight 40); rider 3 arrives exactly at bus 7's 09:00 minute weighing 10",
        output: "bus 7 · 2 · 100, and rider 3 moves on to the next bus",
        explanation:
          "Rider 2 lands exactly on the boundary: 60 + 40 = 100 fills the bus to capacity, so rider 3 — still time-eligible — finds room 0 and drops to the next departure with room.",
      },
      {
        input:
          "riders 4 and 5 share the 09:50 minute; bus 9 (capacity 60) is the only bus arriving after them, and the id tie-break processes rider 4 (weight 45) first, then rider 5 (weight 30)",
        output: "bus 9 · 2 · 60 at day's end, with rider 5 left behind",
        explanation:
          "Rider 4 boards bus 9 first, leaving room 15; rider 5 needs 30 against it and no bus departs later — rider 7's 15 completes bus 9 at exactly 60. Exactly one rider is left behind all day.",
      },
    ],
    constraints: [
      "riders are processed in (arrival_time, passenger_id) order; a rider boards at most one bus — the earliest departure with arrival_time at or after theirs and remaining room at least their weight",
      "boarded_weight sums the weights actually taken; a bus left with unused room still reports its boarded figures, and left-behind riders appear in no output row",
      "columns bus_id, boarded_cnt, boarded_weight, ordered by bus_id ascending",
    ],
    breakdown: [
      "The assignment is genuinely sequential: whether rider 5 boards depends on the loads earlier riders built, so no single GROUP BY or plain window pass can produce it. The engine shape is a walk over the queue in (arrival_time, passenger_id) order, carrying the running load of every bus, and taking for each rider the first bus that is both time-eligible and has room. The state must advance one rider at a time, because each boarding changes every later rider's options.",
      "SQLite expresses the walk as one WITH RECURSIVE whose state is a single row holding the running loads. Each step pulls the next rider — numbered by ROW_NUMBER over (arrival_time, passenger_id) — and updates the loads with a CASE chain that probes the buses in departure order: the first time-eligible bus with room wins, so 'earliest with room' falls straight out of the chain's ordering. Determinism is bought three times: the rider numbering carries the id tie-break, the buses are numbered by (arrival_time, bus_id), and every comparison in the chain is a total order. This is the documented formulation; nothing in it depends on scan order or engine goodwill.",
      "The recursion emits loads, not labels, so a second pass reads the boardings off the deltas: a step whose first load grew is a rider on bus 1, a step where nothing grew is a left-behind rider. The final report joins those labels to the bus spine with a LEFT JOIN, so a bus that took nobody still prints with 0 and 0. The seed strands exactly one rider — rider 5 — and that rider exists only in the arithmetic, never in a row.",
    ],
    edges: [
      "Rider 2 lands exactly on bus 7's boundary (60 + 40 = 100) and boards; a strict room > weight test refuses the exact fit and cascades — rider 2 drifts to bus 9, rider 3 backfills bus 7, riders 4 and 5 both strand, and every output row ends up wrong.",
      "Riders 4 and 5 share the 09:50 minute and compete for bus 9's room; the id tie-break boards rider 4 (weight 45) first and strands rider 5 — ordering the queue by arrival alone, or by id descending, boards rider 5 instead and bus 9's boarded_weight flips between 60 and 45.",
      "A CASE chain probing buses in bus_id order (bus 3 before bus 7) instead of departure order hijacks rider 2 onto bus 3 — 0 + 40 fits exactly — leaving bus 7 with three riders instead of two and halving bus 3's count; the chain must walk departure order, not id order.",
      "Rider 5 is the day's single left-behind: bus 9 holds 45 when the 09:50 pair arrives, rider 5 needs 30, and no bus departs later — a report assembled only from boarding rows cannot see rider 5 at all, and inventing an output row for the stranded would break the per-bus contract the statement fixes.",
    ],
    ladder: [
      { title: "Brute force — simulate the day", body: "Sort riders by (arrival, id), keep a load per bus, and for each rider scan the timetable from the earliest departure forward until one has room. It is the exact greedy, executed by hand, and the reference every SQL formulation must reproduce." },
      { title: "The pattern — recursive walk, loads as state", body: "One WITH RECURSIVE walks the numbered queue carrying the running load of each bus in its state row, applying the earliest-eligible-with-room CASE chain at every step; a follow-up pass derives each rider's boarding from the load deltas." },
      { title: "The optimal idea — sequential dependency means carried state", body: "O(n log n) for the two numberings plus O(n) constant-work steps. The transferable rule: whenever a report's next row depends on the aggregate of its previous rows — running loads, balances, seat maps — the state belongs in a recursive CTE, one row per step, with determinism pinned by explicit tie-breaks in both ORDER BYs." },
    ],
    approach: "WITH RECURSIVE over riders in (arrival_time, passenger_id) order, state = running loads of the three departure-ordered buses, CASE chain picks the earliest bus with room",
    schema: {
      ddl: `CREATE TABLE Bus (
  bus_id       INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,  -- 'YYYY-MM-DD HH24:MI'
  capacity     INTEGER NOT NULL
);
CREATE TABLE Passenger (
  passenger_id INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  weight       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Bus (bus_id, arrival_time, capacity) VALUES
  (7, '2024-08-01 09:00', 100),  -- departure position 1
  (3, '2024-08-01 09:40', 40),   -- departure position 2
  (9, '2024-08-01 10:30', 60);
INSERT INTO Passenger (passenger_id, arrival_time, weight) VALUES
  (1, '2024-08-01 08:45', 60),  -- bus 7: 60
  (2, '2024-08-01 08:50', 40),  -- bus 7: 60 + 40 = 100, exact fit, room 0
  (3, '2024-08-01 09:00', 10),  -- AT bus 7's minute but room 0: drops to bus 3
  (6, '2024-08-01 09:20', 30),  -- bus 3: 10 + 30 = 40, exact fit again
  (4, '2024-08-01 09:50', 45),  -- same minute as rider 5; smaller id boards first -> bus 9: 45
  (5, '2024-08-01 09:50', 30),  -- bus 9 holds 45, needs 30 of 15: LEFT BEHIND
  (7, '2024-08-01 10:00', 15);`,
      tables: [
        { name: "Bus", note: "3 departures with capacities 100, 40, 60 — ids 7, 3, 9 in departure order" },
        { name: "Passenger", note: "7 riders processed 1, 2, 3, 6, 4, 5, 7 by (arrival, id) — riders 4 and 5 tie at 09:50, rider 5 is left behind" },
      ],
    },
    code: `WITH RECURSIVE
buses AS (
    SELECT
        bus_id,
        arrival_time,
        capacity,
        ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) AS bus_no  -- departure order 1..3
    FROM Bus
),
line AS (
    SELECT
        (SELECT arrival_time FROM buses WHERE bus_no = 1) AS a1,  -- first departure
        (SELECT capacity    FROM buses WHERE bus_no = 1) AS c1,
        (SELECT arrival_time FROM buses WHERE bus_no = 2) AS a2,
        (SELECT capacity    FROM buses WHERE bus_no = 2) AS c2,
        (SELECT arrival_time FROM buses WHERE bus_no = 3) AS a3,
        (SELECT capacity    FROM buses WHERE bus_no = 3) AS c3
),
riders AS (
    SELECT
        passenger_id,
        arrival_time,
        weight,
        ROW_NUMBER() OVER (ORDER BY arrival_time, passenger_id) AS ord  -- queue order, id tie-break
    FROM Passenger
),
walk(step, l1, l2, l3) AS (          -- state: step + running load on each of the three buses
    SELECT 0, 0, 0, 0 FROM line
    UNION ALL
    SELECT
        s.step + 1,
        -- bus 1: eligible by time AND room for the full weight -> take it
        s.l1 + CASE WHEN r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1
                    THEN r.weight ELSE 0 END,
        -- bus 2: only if bus 1 did not take this rider
        s.l2 + CASE WHEN NOT (r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1)
                     AND r.arrival_time <= k.a2 AND s.l2 + r.weight <= k.c2
                    THEN r.weight ELSE 0 END,
        -- bus 3: only if neither earlier bus took this rider
        s.l3 + CASE WHEN NOT (r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1)
                     AND NOT (r.arrival_time <= k.a2 AND s.l2 + r.weight <= k.c2)
                     AND r.arrival_time <= k.a3 AND s.l3 + r.weight <= k.c3
                    THEN r.weight ELSE 0 END
    FROM walk s
    JOIN riders r ON r.ord = s.step + 1   -- next rider in queue order
    CROSS JOIN line k
    WHERE s.step < (SELECT COUNT(*) FROM riders)
),
assign AS (
    SELECT
        w.step,
        r.passenger_id,
        r.weight,
        -- whichever load grew labels the rider's bus; no growth means left behind
        CASE WHEN w.l1 > p.l1 THEN 1
             WHEN w.l2 > p.l2 THEN 2
             WHEN w.l3 > p.l3 THEN 3
             ELSE 0 END AS boarded
    FROM walk w
    JOIN walk p ON p.step = w.step - 1    -- the loads before this rider
    JOIN riders r ON r.ord = w.step
    WHERE w.step >= 1
)
SELECT
    bu.bus_id,
    COUNT(a.passenger_id)      AS boarded_cnt,   -- unmatched buses count 0
    COALESCE(SUM(a.weight), 0) AS boarded_weight  -- unmatched buses weigh 0
FROM buses bu
LEFT JOIN assign a ON a.boarded = bu.bus_no
GROUP BY bu.bus_id
ORDER BY bu.bus_id;`,
    walkthrough: [
      "The queue walks riders 1, 2, 3, 6, 4, 5, 7; bus 7 takes rider 1's 60 and rider 2's 40, hitting exactly 100, so rider 3 — arriving at 09:00 exactly — finds room 0 and drops to bus 3 with the 10.",
      "Rider 6 lifts bus 3 to exactly 40; at the shared 09:50 minute the id tie-break puts rider 4 first and bus 9 takes the 45 — rider 5 needs 30 against room 15 and, no bus leaving later, is left behind; rider 7's 15 closes bus 9 at exactly 60.",
      "The load deltas label every step — bus 7 twice (100), bus 3 twice (40), bus 9 twice (60), one step with no growth — and the LEFT JOIN ships (3, 2, 40), (7, 2, 100), (9, 2, 60) in bus_id order, with rider 5 present only as the one rider no row counts.",
    ],
    time: "O(n log n) for the two numberings plus O(n) constant-work recursive steps",
    space: "O(n) — one state row per processed rider",
    followUps: [
      "Surface the left-behind count without breaking the per-bus contract — where does it live: a second result set, a GROUPING SETS rollup row, or the application layer, and what does each choice cost?",
      "Generalise the state row from three fixed load columns to one row per (step, bus) — why does SQLite forbid the recursive table inside the eligibility subquery, and what does that restriction buy the engine?",
    ],
    related: ["find-cumulative-salary-of-an-employee", "find-the-subtasks-that-did-not-execute", "hopper-company-queries-ii"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "longest-winning-streak",
    statement:
      "One table runs a league diary: Match(match_id, day, winner_id) — day is a unique INTEGER running 1..N and exactly one match is played per day, so every day has exactly one winner_id. A streak is a run of CONSECUTIVE day numbers all won by the same team; a single day won counts as a streak of 1. For every team that won at least once, report team_id (the winner_id) and longest_streak — the largest number of consecutive days that team held — ordered by longest_streak descending, then team_id ascending.",
    examples: [
      {
        input: "team 1 wins days 4, 5, 6 and 7 — four days in a row",
        output: "1 · 4",
        explanation:
          "Consecutive day numbers held by one team form one streak of length 4, the largest any team holds on this diary.",
      },
      {
        input: "team 3 wins days 8 and 9, then days 11 and 12 — day 10 in between goes to team 4",
        output: "3 · 2",
        explanation:
          "Two separate 2-day runs never merge across the gap: the runs are 2 and 2, so the longest is 2, even though team 3 won 4 days in total.",
      },
    ],
    constraints: [
      "one row per team appearing as a winner_id; a team that never won appears nowhere",
      "streaks run on day numbers: days d and d+1 both won by a team extend that team's streak, and a day won by anyone else breaks it",
      "columns team_id, longest_streak, ordered by longest_streak DESC, then team_id ASC",
    ],
    breakdown: [
      "Counting wins is not the ask — the ask is the longest run, and the difference is the whole problem. Team 3 wins 4 days on this diary, the same total as team 1, yet its longest run is 2 while team 1's is 4: a GROUP BY winner_id with COUNT(*) reports both at 4 and crowns a false co-champion. The unit of measurement is consecutive days, so the query needs a way to see which wins touch and which are separated.",
      "Gaps-and-islands turns touching wins into groups. Number each team's wins by day with ROW_NUMBER() OVER (PARTITION BY winner_id ORDER BY day); across a run of consecutive days, day minus that row number is CONSTANT — team 1 on days 4-7 gets 3, 3, 3, 3, while team 3 on days 8, 9, 11, 12 gets 7, 7, 8, 8. The constant is an island key: grouping by (winner_id, island) splits each team's wins into its separate runs, and COUNT(*) per island measures each run's length.",
      "The final reduction is one MAX per team over its run lengths, and the ordering carries both keys: longest_streak DESC puts the champion first, team_id ASC makes any future tie between equal streaks deterministic instead of engine-dependent. Wrapping the whole reduction in one CTE chain keeps the layers legible — islands first, run lengths second, the per-team MAX last — so each stage can be eyeballed against the diary on its own. This diary's streaks (4, 3, 2, 1) are distinct, but the tie-break costs nothing and the statement pins it — leaving it out is the classic silent bug that only bites once the next season's data lands.",
    ],
    edges: [
      "Team 3 wins 4 days (8, 9, 11, 12) — the same total as team 1 — so COUNT(*) GROUP BY winner_id reports (1, 4) and (3, 4) tied at the top; the truth is a longest run of 2 for team 3, and only the island arithmetic produces it.",
      "Team 3's two runs, days 8-9 and 11-12, are separated by day 10 (team 4's win); the island key day - ROW_NUMBER is exactly 7 for days 8-9 and 8 for days 11-12, so any grouping that ignores the day arithmetic fuses or splits the wrong days.",
      "Team 4 wins exactly one day (10) and still ships a row, with longest_streak 1 — a one-day island is still an island, but any HAVING COUNT(*) > 1 filter on the runs would erase team 4 from the report.",
      "The output order is streak DESC then team_id ASC; ordering by team_id alone happens to print the same four rows here because the ids descend with the streaks, which is exactly how the missing composite ORDER BY hides until two teams tie.",
    ],
    ladder: [
      { title: "Brute force — walk the calendar", body: "For each team, sweep the 12 days in order marking wins, then read off the longest consecutive block by eye. Fine for one week of fixtures, untestable for a season." },
      { title: "The pattern — island key, run sizes, team max", body: "ROW_NUMBER over (winner_id, day) builds the island key day - rn; GROUP BY (winner_id, island) sizes every run; MAX per team finishes the report." },
      { title: "The optimal idea — 'consecutive' is key minus row-number", body: "O(n log n) — one partitioned sort feeds the island keys, then two grouped passes. The transferable rule: on a sparse numeric key, subtracting the row number converts touching rows into a groupable constant — the same sessionization trick behind streaks, gaps and retention runs everywhere." },
    ],
    approach: "Gaps-and-islands: day minus per-team ROW_NUMBER as the island key, COUNT per island, MAX per team",
    schema: {
      ddl: `CREATE TABLE Match (
  match_id  INTEGER NOT NULL,
  day       INTEGER NOT NULL,  -- unique, 1..12, one match per day
  winner_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO Match (match_id, day, winner_id) VALUES
  (1, 1, 2), (2, 2, 2), (3, 3, 2),  -- team 2 opens with a 3-day run
  (4, 4, 1), (5, 5, 1), (6, 6, 1), (7, 7, 1),  -- team 1's champion run of 4
  (8, 8, 3), (9, 9, 3),             -- team 3, run one: 2 days
  (10, 10, 4),                      -- team 4's lone win breaks team 3's run
  (11, 11, 3), (12, 12, 3);`,
      tables: [
        { name: "Match", note: "12 matches over days 1..12, one winner per day, 4 teams — team 3 wins 4 days as two separate 2-day runs" },
      ],
    },
    code: `WITH islands AS (
    SELECT
        winner_id,
        day,
        -- consecutive days share a constant: day minus the win's index within the team
        day - ROW_NUMBER() OVER (
            PARTITION BY winner_id
            ORDER BY day
        ) AS island
    FROM Match
),
runs AS (
    SELECT
        winner_id,
        island,
        COUNT(*) AS streak       -- one island = one consecutive run
    FROM islands
    GROUP BY winner_id, island
)
SELECT
    winner_id AS team_id,
    MAX(streak) AS longest_streak
FROM runs
GROUP BY winner_id
ORDER BY longest_streak DESC, team_id ASC;`,
    walkthrough: [
      "The island keys: team 1's days 4-7 give 3, 3, 3, 3 (one island of 4); team 2's days 1-3 give 0, 0, 0 (one island of 3); team 3's days 8, 9, 11, 12 give 7, 7, 8, 8 (two islands of 2); team 4's day 10 gives 9 (an island of 1).",
      "Grouping by (winner_id, island) sizes every run: team 1 holds one run of 4, team 2 one of 3, team 3 two runs of 2, team 4 one of 1 — and MAX per team keeps team 3 at 2 despite their 4 total wins.",
      "Ordered by streak DESC then team_id: (1, 4), (2, 3), (3, 2), (4, 1) — the naive win count would have printed (1, 4), (3, 4), (2, 3), (4, 1) and crowned team 3 alongside team 1.",
    ],
    time: "O(n log n) — one partitioned sort, then two grouped passes",
    space: "O(n) — island keys and run sizes over the match log",
    followUps: [
      "Report every run of length 2 or more as (team_id, start_day, end_day) — which CTE already holds the pieces, and how do team 3's two rows differ from team 1's single row?",
      "Two teams finish with equal longest streaks — what does RANK() OVER (ORDER BY longest_streak DESC) add that the plain ORDER BY does not, and which rows would share a rank?",
    ],
    related: ["find-the-start-and-end-number-of-continuous-ranges", "find-interview-candidates", "game-play-analysis-v"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "the-change-in-global-rankings",
    statement:
      "Two tables track a season. TeamScore holds the opening standings: (team_id, name, points). ScoreDelta holds in-season adjustments: (delta_id, team_id, points_delta, earned_at), where earned_at is the hour the adjustment took effect — every adjustment applies exactly once, whatever its hour. A team's final total is its base points plus EVERY delta it received, positive or negative. Report the final standings as team_id, name, total_points, plus pos — each team's rank computed as RANK() OVER (ORDER BY total_points DESC, team_id ASC): equal totals are broken toward the SMALLER team_id. Output one row per team, ordered by pos.",
    examples: [
      {
        input:
          "team 1 (Atlas) opens on 40 and collects +10 at hour 1 and +5 at hour 3; team 4 (Dunlin) opens on 30 and collects +10 at hour 5 and +15 at hour 6",
        output: "1 · Atlas · 55 · pos 1, ahead of 4 · Dunlin · 55 · pos 2",
        explanation:
          "Both finish on 55; the stated tie-break promotes the smaller team_id, so Atlas takes pos 1 and Dunlin takes pos 2.",
      },
      {
        input: "team 3 (Cobalt) opens top on 55 and collects -20 at hour 1 and -5 at hour 2",
        output: "3 · Cobalt · 30 · pos 5",
        explanation:
          "A net delta of -25 sinks the opening leader to last place; ignoring the deltas would have printed Cobalt first.",
      },
    ],
    constraints: [
      "total_points equals base points plus the SUM of that team's deltas; every delta row applies exactly once",
      "pos uses RANK() OVER (ORDER BY total_points DESC, team_id ASC) — the tie-break is part of the specification, so the pos values are a unique 1..5",
      "columns team_id, name, total_points, pos, ordered by pos",
    ],
    breakdown: [
      "The report aggregates at two grains. Deltas arrive many-per-team while base points exist once per team, so the deltas must be reduced to one net figure per team BEFORE they can touch the base — a GROUP BY team_id with SUM(points_delta). Joining ScoreDelta straight onto TeamScore would fan every team out to one row per delta and either duplicate teams in the output or force a DISTINCT that discards the very numbers being summed.",
      "The net can be negative, and a team could hold no deltas at all, so the join direction matters: LEFT JOIN from TeamScore keeps every team, and COALESCE(net, 0) treats an absent adjustment history as zero. The aggregation happens in a CTE rather than the outer query, which keeps the outer SELECT free to join, rank and order without dragging the delta grain along for the ride. On this seed every team carries exactly two deltas, but the shape is what survives new data — an INNER join would silently delete a team whose season had no adjustments, and a bare points + net would poison the total to NULL without the COALESCE.",
      "The rank is a window over the finished totals, and its ORDER BY carries the contract: total_points DESC puts the biggest total first, team_id ASC splits ties toward the smaller id. RANK versus ROW_NUMBER is worth naming here: with team_id inside the window order, every total is unique and the two functions coincide — but drop the tie-break and RANK would award BOTH 55-point teams pos 1 and skip pos 2, while ROW_NUMBER would split them in arbitrary order. The statement fixes the semantics; the query just implements them.",
    ],
    edges: [
      "Teams 1 and 4 both finish on 55 (40 + 15 and 30 + 25); the tie-break prints Atlas at pos 1 and Dunlin at pos 2 — a ROW_NUMBER without the team_id key could order the pair either way, and a RANK without it would hand out two pos 1s and skip pos 2 entirely.",
      "Team 3's deltas are -20 and -5 (net -25), sinking the base leader from 55 to 30 and last place; a query that joins only the positive adjustments would reprint Cobalt near the top with 55.",
      "Team 2's pair nets +10 (+20 and -10): base 40 becomes 50, squeezed between the two 55s and Ember's 35; a formulation that takes MAX(points_delta) instead of SUM would report Boldon at 60 and reorder the podium.",
      "Every team carries exactly two deltas, so joining before aggregating yields 10 rows for 5 teams; the safe shape is aggregate-then-join — one row per team before the window ever runs.",
    ],
    ladder: [
      { title: "Brute force — ledger by hand", body: "Add up each team's adjustments on a calculator, add the base, sort the five totals and number the rows 1-5, remembering the smaller-id rule for the 55-55 tie." },
      { title: "The pattern — reduce, join, rank", body: "SUM deltas per team in a CTE, join to the base points with LEFT JOIN plus COALESCE, then RANK() OVER (ORDER BY total_points DESC, team_id ASC) over the finished rows." },
      { title: "The optimal idea — reduce child tables to the parent's grain first", body: "O(d + t log t) — one grouped pass over deltas, one keyed join, one sort for the ranks. The transferable rule: aggregate child tables to the grain of the report before joining, and let the window's ORDER BY — not the output's — define what a rank means." },
    ],
    approach: "SUM deltas per team, LEFT JOIN onto base points, RANK() OVER (ORDER BY total_points DESC, team_id ASC)",
    schema: {
      ddl: `CREATE TABLE TeamScore (
  team_id INTEGER NOT NULL,
  name    TEXT NOT NULL,
  points  INTEGER NOT NULL
);
CREATE TABLE ScoreDelta (
  delta_id     INTEGER NOT NULL,
  team_id      INTEGER NOT NULL,
  points_delta INTEGER NOT NULL,
  earned_at    INTEGER NOT NULL  -- hour the adjustment took effect
);`,
      seed: `INSERT INTO TeamScore (team_id, name, points) VALUES
  (1, 'Atlas',  40),
  (2, 'Boldon', 40),
  (3, 'Cobalt', 55),  -- opens top, finishes last
  (4, 'Dunlin', 30),
  (5, 'Ember',  25);
INSERT INTO ScoreDelta (delta_id, team_id, points_delta, earned_at) VALUES
  (1, 1, 10, 1),
  (2, 1, 5, 3),
  (3, 2, 20, 2),
  (4, 2, -10, 4),
  (5, 3, -20, 1),
  (6, 3, -5, 2),
  (7, 4, 10, 5),
  (8, 4, 15, 6),
  (9, 5, 5, 1),
  (10, 5, 5, 2);`,
      tables: [
        { name: "TeamScore", note: "5 teams with opening points — Cobalt opens top on 55, Atlas and Boldon tie on 40" },
        { name: "ScoreDelta", note: "10 adjustments, exactly two per team — team 3's pair is negative; teams 1 and 4 both net +15 and tie on 55" },
      ],
    },
    code: `WITH nets AS (
    SELECT
        team_id,
        SUM(points_delta) AS net   -- every adjustment, positive or negative, exactly once
    FROM ScoreDelta
    GROUP BY team_id
),
finals AS (
    SELECT
        t.team_id,
        t.name,
        t.points + COALESCE(n.net, 0) AS total_points  -- a team with no deltas keeps its base
    FROM TeamScore t
    LEFT JOIN nets n ON n.team_id = t.team_id
)
SELECT
    team_id,
    name,
    total_points,
    RANK() OVER (ORDER BY total_points DESC, team_id ASC) AS pos  -- tie-break stated in the task
FROM finals
ORDER BY pos;`,
    walkthrough: [
      "The nets: team 1 +15, team 2 +10, team 3 -25, team 4 +25, team 5 +10 — five grouped rows from ten deltas.",
      "Joined onto the base: Atlas 40 + 15 = 55, Boldon 40 + 10 = 50, Cobalt 55 - 25 = 30, Dunlin 30 + 25 = 55, Ember 25 + 10 = 35 — the opening leader finishes last.",
      "RANK over (total_points DESC, team_id ASC) lines up 55, 55, 50, 35, 30 and splits the tie toward the smaller id: (1, Atlas, 55, 1), (4, Dunlin, 55, 2), (2, Boldon, 50, 3), (5, Ember, 35, 4), (3, Cobalt, 30, 5), shipped in pos order.",
    ],
    time: "O(d + t log t) — one grouped pass over deltas, then a sort for the ranks",
    space: "O(t) — one net row and one final row per team",
    followUps: [
      "Reconstruct the running standings hour by hour — what does a window SUM over ScoreDelta ordered by earned_at give you, and at which hour does team 4 first overtake team 1?",
      "Award the same pos to equal totals without the team_id key (true competition ranking) — which rows share a pos then, and what position number comes next?",
    ],
    related: ["rank-scores", "top-travellers", "department-top-three-salaries"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "all-the-matches-of-the-league",
    statement:
      "Team lists a league's clubs: (team_id, name). The fixture computer must schedule a full double round-robin: every club hosts every other club once, so each unordered pair produces TWO fixtures with the roles swapped. Report the complete fixture list as host_id, guest_id — every ordered pair of DIFFERENT team ids — ordered by host_id ascending, then guest_id ascending.",
    examples: [
      {
        input: "teams 1 (Falcons) and 2 (Harriers)",
        output: "1 · 2 and 2 · 1",
        explanation:
          "The pair meets twice — Falcons host once, Harriers host once — because the fixture is an ORDERED pair and both directions are real matches.",
      },
      {
        input: "a club paired with itself",
        output: "(no row)",
        explanation:
          "A club cannot host itself; the host != guest filter removes the three diagonal pairings the cross join would otherwise emit.",
      },
    ],
    constraints: [
      "every ordered pair (a, b) with a != b appears exactly once — 3 clubs yield exactly 6 fixtures",
      "host_id and guest_id are team ids taken from Team; no self-pairings",
      "columns host_id, guest_id, ordered by host_id, then guest_id",
    ],
    breakdown: [
      "The fixture list is the purest cross join in the book: every row of Team against every row of Team, with the diagonal removed. CROSS JOIN Team a CROSS JOIN Team b builds all 3 x 3 = 9 ordered pairs, and WHERE a.team_id <> b.team_id deletes the three self-pairings to leave 6. The filter is the entire correctness condition — forget it and the output lies by inclusion, and writing a <= b instead of <> keeps the diagonals while silently dropping the three return legs.",
      "CROSS JOIN with a WHERE filter and INNER JOIN with an ON inequality are the same plan — the cross-join spelling documents intent. The pairing is unconditional except for the inequality, and the inequality is a filter, not a key match: there is no join key here, and that is the point of the exercise. A join-key mindset hunts for a shared column whose equality holds — but team_id's equality is exactly what must NOT hold.",
      "The ordering closes the contract: host_id then guest_id gives the canonical timetable order — club 1's two fixtures, then club 2's two, then club 3's. The output grain is the fixture, an ordered pair, not the club: 6 rows for 3 clubs, and n·(n-1) in general. The count itself is a cheap self-check: 9 pairings minus 3 diagonals.",
    ],
    edges: [
      "Dropping WHERE a.team_id <> b.team_id ships 9 rows including (1, 1), (2, 2) and (3, 3) — a club hosting itself three times over; the correct query returns exactly 6.",
      "Writing a.team_id <= b.team_id instead of <> keeps the diagonals AND loses the return legs — (2, 1), (3, 1) and (3, 2) vanish, and only 3 real fixtures survive out of 6.",
      "Ordering by host_id alone leaves each host's two guest rows engine-ordered; this seed happens to scan them (1, 2) then (1, 3), which is exactly how a missing second ORDER BY key hides.",
      "The ids here are dense 1..3, which tempts arithmetic generators; a league with ids 4, 9 and 17 breaks every id-range shortcut — the pair set must come from the table joined against itself, not from a counter.",
    ],
    ladder: [
      { title: "Brute force — write them out", body: "List every fixture by hand — each club against each other, home and away — then sort. Six rows is easy; twenty clubs and their 380 fixtures are not." },
      { title: "The pattern — self cross join minus the diagonal", body: "CROSS JOIN the table to itself under two aliases, filter a.team_id <> b.team_id, and ORDER BY host then guest." },
      { title: "The optimal idea — the output is already quadratic", body: "O(n^2) rows are the OUTPUT, so no algorithm beats the quadratic; the craft is the shape — a self cross join plus inequality, and remembering that ordered pairs are exactly double the unordered ones." },
    ],
    approach: "Self CROSS JOIN with a <> b filter, ordered by host then guest",
    schema: {
      ddl: `CREATE TABLE Team (
  team_id INTEGER NOT NULL,
  name    TEXT NOT NULL
);`,
      seed: `INSERT INTO Team (team_id, name) VALUES
  (1, 'Falcons'),
  (2, 'Harriers'),
  (3, 'Kestrels');`,
      tables: [
        { name: "Team", note: "3 clubs — the double round-robin they produce is 3 x 2 = 6 fixtures" },
      ],
    },
    code: `SELECT
    a.team_id AS host_id,   -- the home side: every club hosts
    b.team_id AS guest_id   -- the away side: every club visits
FROM Team a
CROSS JOIN Team b
WHERE a.team_id <> b.team_id   -- no self-pairings; <= would also lose the return legs
ORDER BY host_id, guest_id;`,
    walkthrough: [
      "The cross join builds 9 ordered pairs from 3 x 3; the inequality deletes the three diagonals where a club would host itself.",
      "Six fixtures survive — (1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2) — every unordered pair appearing in both directions.",
      "ORDER BY host_id, guest_id prints them as a canonical timetable: Falcons host twice, then Harriers twice, then Kestrels twice.",
    ],
    time: "O(n^2) — the output itself is quadratic in the club count",
    space: "O(1) beyond the emitted rows — no aggregation, no buffering",
    followUps: [
      "Schedule single legs instead, each pair meeting once — which comparison change halves the list, and what ordering keeps it canonical?",
      "Attach a matchday number per round — how would the round-robin circle method translate to SQL, and why does a plain cross join carry no round information?",
    ],
    related: ["all-the-pairs-with-the-maximum-number-of-common-followers", "strong-friendship", "customers-who-bought-a-and-b-not-c"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "compute-the-rank-as-a-percentage",
    statement:
      "Contestant lists a finished contest's field: (contestant_id, name, score). For every contestant, report contestant_id, name, score, and pct — the share of the field ranked STRICTLY above them, as a percentage: pct = ROUND(100.0 * higher / field, 2), where higher counts the contestants with a strictly higher score and field is the total number of contestants. Ties are not above each other: the two members of the top tie both report 0. Output one row per contestant, ordered by score descending, then contestant_id ascending.",
    examples: [
      {
        input: "contestants 1 (Iris) and 2 (Jonas) share the top score of 120 in the field of 6",
        output: "both report pct 0",
        explanation:
          "Nobody is strictly above them — each other's equal score does not count — so a shared lead leaves both at 0 rather than at 33.33.",
      },
      {
        input: "contestant 3 (Kaya) scores 100: two contestants sit above her, both on 120, in the field of 6",
        output: "pct 33.33",
        explanation:
          "100.0 * 2 / 6 = 33.333... and ROUND(..., 2) fixes the repeating decimal at 33.33 — integer division (100 * 2 / 6) would have returned a flat 33.",
      },
    ],
    constraints: [
      "pct is computed per contestant over the WHOLE field: the strictly-higher count divided by the total count, multiplied by 100.0 and rounded to 2 decimals",
      "ties count as equals, not as higher — the strict comparison decides the numerator",
      "columns contestant_id, name, score, pct, ordered by score DESC, then contestant_id ASC",
    ],
    breakdown: [
      "The percentage compares two counts over the same table: how many rows clear this score strictly, and how many rows exist. That is window territory — COUNT(*) OVER () sizes the field in the same pass that reads the rows, and a second count ordered by score descending counts everything at-or-above the current row. The at-or-above count rides the default RANGE frame, which stops at the current row's value: every peer sharing the score sits inside the frame together.",
      "Strictly-above is then a subtraction: at-or-above minus the row's own tie group, COUNT(*) OVER (PARTITION BY score). For the top pair — Iris and Jonas at 120 — at-or-above is 2 and peers is 2, so the higher count is 0; a formulation that forgets to subtract the peers would report the co-leaders at 33.33 and rank them above themselves. For Kaya at 100 the counts are 3 minus 1 = 2, and 2 out of 6 is the repeating decimal the rounding must repair.",
      "The arithmetic carries two classic traps. Integer division: 2 / 6 evaluates to 0 in integer math, so the 100.0 multiplier must produce a REAL before the division happens — 100.0 * 2 / 6 works, while 2 / 6 * 100.0 truncates first. And ROUND(..., 2) must wrap the whole quotient: rounding the operands does nothing. The field of 6 is what makes rounding earn its keep — a field of 5 would make every share an exact multiple of 20 and hide the bug forever.",
    ],
    edges: [
      "The top tie: Iris and Jonas, both at 120, report pct 0 — counting at-or-above without subtracting the peer pair prints 33.33 for both leaders.",
      "Kaya's 2 / 6 = 33.333...: the integer form 100 * 2 / 6 returns 33 and ROUND(33, 2) still prints 33 — only the 100.0 multiplier ahead of the division yields 33.33; the same bug flattens Mina (66.67 to 66) and Noor (83.33 to 83).",
      "Liam's 3 / 6 lands on exactly 50 and the leaders' 0 is exact — rows where the wrong query agrees with the right one; the seed places them deliberately so a spot check of one row can pass while three rows are wrong.",
      "A >= comparison in the numerator (counting equals as above) hands Mina 83.33 and Noor 100.0 instead of 66.67 and 83.33 — Noor's own row would count as her own superior.",
    ],
    ladder: [
      { title: "Brute force — scan per contestant", body: "For each contestant, sweep the whole table counting strictly-higher scores, divide by the total with a calculator and round to two decimals. Correct, and quadratic in the engine's eyes." },
      { title: "The pattern — three window counts, one subtraction", body: "COUNT(*) OVER () for the field, COUNT(*) OVER (ORDER BY score DESC) for at-or-above, COUNT(*) OVER (PARTITION BY score) for the tie group; the difference of the last two is the strict numerator." },
      { title: "The optimal idea — wider frame minus own partition", body: "O(n log n) — one sort feeds all three windows. The transferable rule: 'share of the field above me' is the wider-frame count minus the own-partition count, and percentage arithmetic must force REAL division before ROUND can mean anything." },
    ],
    approach: "Three window COUNTs — field size, at-or-above via the RANGE frame, own tie group — subtract, scale by 100.0, ROUND to 2",
    schema: {
      ddl: `CREATE TABLE Contestant (
  contestant_id INTEGER NOT NULL,
  name          TEXT NOT NULL,
  score         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Contestant (contestant_id, name, score) VALUES
  (1, 'Iris', 120),   -- top tie: pct 0
  (2, 'Jonas', 120),  -- top tie: pct 0
  (3, 'Kaya', 100),   -- 2 above in a field of 6: 33.33
  (4, 'Liam', 90),    -- 3 above: exactly 50
  (5, 'Mina', 70),    -- 4 above: 66.67
  (6, 'Noor', 50);`,
      tables: [
        { name: "Contestant", note: "6 contestants — a two-way tie at the top, four distinct scores below; the field of 6 makes 1/6, 2/6, 4/6 and 5/6 non-terminating" },
      ],
    },
    code: `WITH sized AS (
    SELECT
        contestant_id,
        name,
        score,
        COUNT(*) OVER () AS field_size,                     -- the whole table
        COUNT(*) OVER (ORDER BY score DESC) AS at_or_above, -- RANGE frame: peers included
        COUNT(*) OVER (PARTITION BY score) AS peers         -- the current tie group
    FROM Contestant
)
SELECT
    contestant_id,
    name,
    score,
    ROUND(100.0 * (at_or_above - peers) / field_size, 2) AS pct  -- strictly above / field
FROM sized
ORDER BY score DESC, contestant_id ASC;`,
    walkthrough: [
      "The windows: field_size is 6 on every row; at_or_above runs 2, 2, 3, 4, 5, 6 down the score order; peers is 2 for the 120 pair and 1 elsewhere.",
      "Strictly-above = at_or_above - peers: 0, 0, 2, 3, 4, 5 — the leaders subtract away their own tie and land at 0, Kaya at 2, Noor at 5.",
      "Scaled and rounded: 100.0 * 2 / 6 = 33.33, 100.0 * 3 / 6 = 50, 100.0 * 4 / 6 = 66.67, 100.0 * 5 / 6 = 83.33 — shipped as (1, Iris, 120, 0), (2, Jonas, 120, 0), (3, Kaya, 100, 33.33), (4, Liam, 90, 50), (5, Mina, 70, 66.67), (6, Noor, 50, 83.33).",
    ],
    time: "O(n log n) — one sort feeding three window counts",
    space: "O(n) — one annotated row per contestant",
    followUps: [
      "Report the complementary share — the percent strictly BELOW — beside pct — which window flips, and what do the co-leaders and the last-place row show?",
      "Bucket the field into deciles instead of percentages — where does the ROUND placement change the bucketing, and which contestants move bins?",
    ],
    related: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
];
