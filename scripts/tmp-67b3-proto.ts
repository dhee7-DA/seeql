/** Task 67-b3 prototype — probe all 6 seeds + solutions in bun:sqlite before authoring. */
import { Database } from "bun:sqlite";

const results: string[] = [];
function run(label: string, ddl: string, seed: string, code: string) {
  const db = new Database(":memory:");
  try {
    db.run(ddl);
    db.run(seed);
    const st = db.prepare(code.replace(/;+\s*$/, ""));
    const rows = st.all();
    results.push(`== ${label}\ncolumns: ${JSON.stringify(st.columnNames)}\nrows: ${JSON.stringify(rows)}`);
  } catch (e) {
    results.push(`== ${label}\nERROR: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    db.close();
  }
}

/* ---------------- dive 1: bus I ---------------- */
run(
  "bus-i",
  `CREATE TABLE Bus (
  bus_id       INTEGER NOT NULL,
  arrival_time TEXT NOT NULL
);
CREATE TABLE Passenger (
  passenger_id INTEGER NOT NULL,
  arrival_time TEXT NOT NULL
);`,
  `INSERT INTO Bus (bus_id, arrival_time) VALUES
  (7,  '2024-06-01 09:00'),
  (12, '2024-06-01 09:30'),
  (3,  '2024-06-01 10:15');
INSERT INTO Passenger (passenger_id, arrival_time) VALUES
  (1, '2024-06-01 09:05'),
  (2, '2024-06-01 09:30'),
  (3, '2024-06-01 09:30'),
  (4, '2024-06-01 09:45'),
  (5, '2024-06-01 09:50'),
  (6, '2024-06-01 10:00');`,
  `WITH buses AS (
    SELECT
        bus_id,
        arrival_time,
        ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) AS bus_no
    FROM Bus
),
boarding AS (
    SELECT
        p.passenger_id,
        (SELECT MIN(b.bus_no)
           FROM buses b
          WHERE b.arrival_time >= p.arrival_time) AS bus_no
    FROM Passenger p
)
SELECT
    bu.bus_id,
    COUNT(bd.passenger_id) AS riders_cnt
FROM buses bu
LEFT JOIN boarding bd ON bd.bus_no = bu.bus_no
GROUP BY bu.bus_id
ORDER BY bu.bus_id;`,
);

/* ---------------- dive 2: bus II ---------------- */
run(
  "bus-ii",
  `CREATE TABLE Bus (
  bus_id       INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  capacity     INTEGER NOT NULL
);
CREATE TABLE Passenger (
  passenger_id INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  weight       INTEGER NOT NULL
);`,
  `INSERT INTO Bus (bus_id, arrival_time, capacity) VALUES
  (7, '2024-08-01 09:00', 100),
  (3, '2024-08-01 09:40', 40),
  (9, '2024-08-01 10:30', 60);
INSERT INTO Passenger (passenger_id, arrival_time, weight) VALUES
  (1, '2024-08-01 08:45', 60),
  (2, '2024-08-01 08:50', 40),
  (3, '2024-08-01 09:00', 10),
  (6, '2024-08-01 09:20', 30),
  (4, '2024-08-01 09:50', 45),
  (5, '2024-08-01 09:50', 30),
  (7, '2024-08-01 10:00', 15);`,
  `WITH RECURSIVE
buses AS (
    SELECT
        bus_id,
        arrival_time,
        capacity,
        ROW_NUMBER() OVER (ORDER BY arrival_time, bus_id) AS bus_no
    FROM Bus
),
line AS (
    SELECT
        (SELECT arrival_time FROM buses WHERE bus_no = 1) AS a1,
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
        ROW_NUMBER() OVER (ORDER BY arrival_time, passenger_id) AS ord
    FROM Passenger
),
walk(step, l1, l2, l3) AS (
    SELECT 0, 0, 0, 0 FROM line
    UNION ALL
    SELECT
        s.step + 1,
        s.l1 + CASE WHEN r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1 THEN r.weight ELSE 0 END,
        s.l2 + CASE WHEN NOT (r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1)
                     AND r.arrival_time <= k.a2 AND s.l2 + r.weight <= k.c2 THEN r.weight ELSE 0 END,
        s.l3 + CASE WHEN NOT (r.arrival_time <= k.a1 AND s.l1 + r.weight <= k.c1)
                     AND NOT (r.arrival_time <= k.a2 AND s.l2 + r.weight <= k.c2)
                     AND r.arrival_time <= k.a3 AND s.l3 + r.weight <= k.c3 THEN r.weight ELSE 0 END
    FROM walk s
    JOIN riders r ON r.ord = s.step + 1
    CROSS JOIN line k
    WHERE s.step < (SELECT COUNT(*) FROM riders)
),
assign AS (
    SELECT
        w.step,
        r.passenger_id,
        r.weight,
        CASE WHEN w.l1 > p.l1 THEN 1
             WHEN w.l2 > p.l2 THEN 2
             WHEN w.l3 > p.l3 THEN 3
             ELSE 0 END AS boarded
    FROM walk w
    JOIN walk p ON p.step = w.step - 1
    JOIN riders r ON r.ord = w.step
    WHERE w.step >= 1
)
SELECT
    bu.bus_id,
    COUNT(a.passenger_id)      AS boarded_cnt,
    COALESCE(SUM(a.weight), 0) AS boarded_weight
FROM buses bu
LEFT JOIN assign a ON a.boarded = bu.bus_no
GROUP BY bu.bus_id
ORDER BY bu.bus_id;`,
);

/* ---------------- dive 3: longest winning streak ---------------- */
run(
  "streak",
  `CREATE TABLE Match (
  match_id  INTEGER NOT NULL,
  day       INTEGER NOT NULL,
  winner_id INTEGER NOT NULL
);`,
  `INSERT INTO Match (match_id, day, winner_id) VALUES
  (1, 1, 2), (2, 2, 2), (3, 3, 2),
  (4, 4, 1), (5, 5, 1), (6, 6, 1), (7, 7, 1),
  (8, 8, 3), (9, 9, 3),
  (10, 10, 4),
  (11, 11, 3), (12, 12, 3);`,
  `WITH islands AS (
    SELECT
        winner_id,
        day,
        day - ROW_NUMBER() OVER (
            PARTITION BY winner_id ORDER BY day
        ) AS island
    FROM Match
),
sized AS (
    SELECT
        winner_id,
        island,
        COUNT(*) AS streak
    FROM islands
    GROUP BY winner_id, island
)
SELECT
    winner_id AS team_id,
    MAX(streak) AS longest_streak
FROM sized
GROUP BY winner_id
ORDER BY longest_streak DESC, team_id ASC;`,
);

/* ---------------- dive 4: change in global rankings ---------------- */
run(
  "rankings",
  `CREATE TABLE TeamScore (
  team_id INTEGER NOT NULL,
  name    TEXT NOT NULL,
  points  INTEGER NOT NULL
);
CREATE TABLE ScoreDelta (
  delta_id     INTEGER NOT NULL,
  team_id      INTEGER NOT NULL,
  points_delta INTEGER NOT NULL,
  earned_at    INTEGER NOT NULL
);`,
  `INSERT INTO TeamScore (team_id, name, points) VALUES
  (1, 'Atlas',  40),
  (2, 'Boldon', 40),
  (3, 'Cobalt', 55),
  (4, 'Dunlin', 30),
  (5, 'Ember',  25);
INSERT INTO ScoreDelta (delta_id, team_id, points_delta, earned_at) VALUES
  (1, 1, 10, 1), (2, 1, 5, 3),
  (3, 2, 20, 2), (4, 2, -10, 4),
  (5, 3, -20, 1), (6, 3, -5, 2),
  (7, 4, 10, 5), (8, 4, 15, 6),
  (9, 5, 5, 1), (10, 5, 5, 2);`,
  `WITH nets AS (
    SELECT
        team_id,
        SUM(points_delta) AS net
    FROM ScoreDelta
    GROUP BY team_id
),
finals AS (
    SELECT
        t.team_id,
        t.name,
        t.points + COALESCE(n.net, 0) AS total_points
    FROM TeamScore t
    LEFT JOIN nets n ON n.team_id = t.team_id
)
SELECT
    team_id,
    name,
    total_points,
    RANK() OVER (ORDER BY total_points DESC, team_id ASC) AS pos
FROM finals
ORDER BY pos;`,
);

/* ---------------- dive 5: all matches of the league ---------------- */
run(
  "fixtures",
  `CREATE TABLE Team (
  team_id INTEGER NOT NULL,
  name    TEXT NOT NULL
);`,
  `INSERT INTO Team (team_id, name) VALUES
  (1, 'Falcons'),
  (2, 'Harriers'),
  (3, 'Kestrels');`,
  `SELECT
    a.team_id AS host_id,
    b.team_id AS guest_id
FROM Team a
CROSS JOIN Team b
WHERE a.team_id <> b.team_id
ORDER BY host_id, guest_id;`,
);

/* ---------------- dive 6: rank as percentage ---------------- */
run(
  "pct",
  `CREATE TABLE Contestant (
  contestant_id INTEGER NOT NULL,
  name          TEXT NOT NULL,
  score         INTEGER NOT NULL
);`,
  `INSERT INTO Contestant (contestant_id, name, score) VALUES
  (1, 'Iris', 120),
  (2, 'Jonas', 120),
  (3, 'Kaya', 100),
  (4, 'Liam', 90),
  (5, 'Mina', 70),
  (6, 'Noor', 50);`,
  `WITH sized AS (
    SELECT
        contestant_id,
        name,
        score,
        COUNT(*) OVER ()                        AS field_size,
        COUNT(*) OVER (ORDER BY score DESC)     AS at_or_above,
        COUNT(*) OVER (PARTITION BY score)      AS peers
    FROM Contestant
)
SELECT
    contestant_id,
    name,
    score,
    ROUND(100.0 * (at_or_above - peers) / field_size, 2) AS pct
FROM sized
ORDER BY score DESC, contestant_id ASC;`,
);

console.log(results.join("\n\n"));
