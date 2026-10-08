import { Database } from "bun:sqlite";

const db = new Database(":memory:");

function show(title: string, sql: string) {
  try {
    const st = db.prepare(sql);
    const rows = st.all();
    console.log(`== ${title}:`, JSON.stringify(rows));
  } catch (e) {
    console.log(`== ${title}: ERROR ${(e as Error).message}`);
  }
}

// ---- dive 1: hierarchy ----
db.run(`CREATE TABLE Employee (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER)`);
db.run(`INSERT INTO Employee VALUES (6,'Sami',2),(7,'Tessa',4),(1,'Nadia',NULL),(5,'Rhea',1),(3,'Omar',1),(2,'Quinn',3),(4,'Pia',5)`);
show("1 correct", `WITH RECURSIVE org AS (
  SELECT emp_id, name, 1 AS level FROM Employee WHERE manager_id IS NULL
  UNION ALL
  SELECT e.emp_id, e.name, o.level + 1 FROM Employee e JOIN org o ON e.manager_id = o.emp_id
) SELECT emp_id, name, level FROM org ORDER BY level, emp_id`);
show("1 eq-null anchor", `WITH RECURSIVE org AS (
  SELECT emp_id, name, 1 AS level FROM Employee WHERE manager_id = NULL
  UNION ALL SELECT e.emp_id, e.name, o.level+1 FROM Employee e JOIN org o ON e.manager_id = o.emp_id
) SELECT count(*) FROM org`);
show("1 off-by-one", `WITH RECURSIVE org AS (
  SELECT emp_id, name, 0 AS level FROM Employee WHERE manager_id IS NULL
  UNION ALL SELECT e.emp_id, e.name, o.level+1 FROM Employee e JOIN org o ON e.manager_id = o.emp_id
) SELECT emp_id, level FROM org ORDER BY level, emp_id`);
show("1 raw walk order (no final ORDER BY)", `WITH RECURSIVE org AS (
  SELECT emp_id, name, 1 AS level FROM Employee WHERE manager_id IS NULL
  UNION ALL SELECT e.emp_id, e.name, o.level+1 FROM Employee e JOIN org o ON e.manager_id = o.emp_id
) SELECT emp_id FROM org`);

// ---- dive 2: rain ----
db.run(`CREATE TABLE Terrain (position INTEGER PRIMARY KEY, height INTEGER NOT NULL CHECK (height >= 0))`);
db.run(`INSERT INTO Terrain VALUES (1,3),(2,0),(3,2),(4,0),(5,4),(6,5),(7,6),(8,7),(9,6),(10,2),(11,2),(12,2),(13,6)`);
show("2 correct", `WITH bounds AS (
  SELECT position, height,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS lmax,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS rmax
  FROM Terrain
), levels AS (SELECT position, MIN(lmax, rmax) - height AS water FROM bounds)
SELECT position, water FROM levels WHERE water > 0 ORDER BY position`);
show("2 global-max wrong", `SELECT position, MAX(height) OVER () - height AS water FROM Terrain
  WHERE MAX(height) OVER () - height > 0 ORDER BY position`);
show("2 adjacent wrong", `SELECT position, MIN(prev, nxt) - height AS water FROM (
  SELECT position, height, LAG(height) OVER (ORDER BY position) AS prev, LEAD(height) OVER (ORDER BY position) AS nxt FROM Terrain
) WHERE MIN(prev, nxt) - height > 0 ORDER BY position`);
show("2 exclude-current at ridge p8", `SELECT position,
  MIN(MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),
      MAX(height) OVER (ORDER BY position ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING)) - height AS raw
  FROM Terrain WHERE position = 8`);

// ---- dive 3: gift cycles ----
db.run(`CREATE TABLE GiftExchange (exchange_id INTEGER PRIMARY KEY, giver_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL)`);
db.run(`INSERT INTO GiftExchange VALUES (1,1,2),(2,4,5),(3,2,3),(4,5,6),(5,3,1),(6,6,7),(7,7,8),(8,8,4)`);
show("3 correct (guarded + ceiling subquery)", `WITH RECURSIVE walk(start_id, current_id, hops) AS (
  SELECT giver_id, receiver_id, 1 FROM GiftExchange
  UNION ALL
  SELECT w.start_id, g.receiver_id, w.hops + 1
  FROM walk w JOIN GiftExchange g ON g.giver_id = w.current_id
  WHERE w.current_id <> w.start_id AND w.hops < (SELECT COUNT(*) FROM GiftExchange)
) SELECT w.start_id AS giver_id, e.receiver_id, w.hops AS cycle_size
FROM walk w JOIN GiftExchange e ON e.giver_id = w.start_id
WHERE w.current_id = w.start_id ORDER BY giver_id`);
show("3 correct no ceiling (guard only)", `WITH RECURSIVE walk(start_id, current_id, hops) AS (
  SELECT giver_id, receiver_id, 1 FROM GiftExchange
  UNION ALL
  SELECT w.start_id, g.receiver_id, w.hops + 1
  FROM walk w JOIN GiftExchange g ON g.giver_id = w.current_id
  WHERE w.current_id <> w.start_id
) SELECT count(*) FROM walk`);
show("3 unguarded runaway with LIMIT 5000", `SELECT COUNT(*) FROM (
  WITH RECURSIVE walk(start_id, current_id, hops) AS (
    SELECT giver_id, receiver_id, 1 FROM GiftExchange
    UNION ALL
    SELECT w.start_id, g.receiver_id, w.hops + 1
    FROM walk w JOIN GiftExchange g ON g.giver_id = w.current_id
  ) SELECT * FROM walk LIMIT 5000)`);

// ---- dive 4: dominance ----
db.run(`CREATE TABLE PassAction (pass_id INTEGER PRIMARY KEY, team TEXT NOT NULL CHECK (team IN ('home','away')),
  player_name TEXT NOT NULL, target_name TEXT NOT NULL, outcome TEXT NOT NULL CHECK (outcome IN ('complete','incomplete')))`);
db.run(`INSERT INTO PassAction VALUES
 (1,'home','Ada','Bram','complete'),(2,'away','Cleo','Dov','complete'),(3,'home','Bram','Ada','complete'),
 (4,'away','Dov','Esme','complete'),(5,'home','Ada','Cleo','complete'),(6,'away','Esme','Cleo','complete'),
 (7,'home','Cleo','Bram','complete'),(8,'away','Dov','Cleo','complete'),(9,'home','Ada','Bram','complete'),
 (10,'away','Cleo','Esme','complete'),(11,'home','Bram','Ada','complete'),(12,'away','Esme','Dov','complete'),
 (13,'home','Cleo','Ada','complete'),(14,'away','Cleo','Dov','complete'),(15,'home','Ada','Cleo','complete'),
 (16,'away','Dov','Esme','complete'),(17,'home','Bram','Cleo','complete'),(18,'away','Esme','Cleo','complete'),
 (19,'home','Ada','Bram','complete'),(20,'away','Cleo','Dov','incomplete'),(21,'home','Bram','Ada','incomplete'),
 (22,'away','Dov','Cleo','incomplete'),(23,'home','Cleo','Bram','incomplete'),(24,'away','Esme','Dov','incomplete')`);
show("4 correct", `WITH tally AS (
  SELECT team, COUNT(*) AS total,
    SUM(CASE WHEN outcome='complete' THEN 1 ELSE 0 END) AS done,
    ROUND(SUM(CASE WHEN outcome='complete' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS completion_pct
  FROM PassAction GROUP BY team
), ranked AS (SELECT team, completion_pct, RANK() OVER (ORDER BY completion_pct DESC) AS rnk FROM tally)
SELECT team, completion_pct FROM ranked WHERE rnk = 1 ORDER BY team ASC`);
show("4 int-div wrong", `SELECT team, ROUND(SUM(CASE WHEN outcome='complete' THEN 1 ELSE 0 END) * 100 / COUNT(*), 2) AS pct
  FROM PassAction GROUP BY team`);
show("4 global-denominator wrong", `SELECT team, ROUND(SUM(CASE WHEN outcome='complete' THEN 1 ELSE 0 END) * 100.0 /
  (SELECT COUNT(*) FROM PassAction), 2) AS pct FROM PassAction GROUP BY team`);

// ---- dive 5: streaks ----
db.run(`DELETE FROM PassAction`);
db.run(`INSERT INTO PassAction VALUES
 (1,'home','Ada','Bram','complete'),(2,'home','Bram','Cleo','complete'),(3,'home','Cleo','Ada','complete'),
 (4,'home','Ada','Cleo','complete'),(5,'home','Bram','Ada','incomplete'),(6,'home','Cleo','Bram','complete'),
 (7,'home','Ada','Bram','complete'),(8,'away','Dov','Esme','complete'),(9,'away','Esme','Dov','complete'),
 (10,'away','Dov','Esme','complete'),(11,'home','Cleo','Ada','incomplete'),(12,'home','Bram','Cleo','complete'),
 (13,'home','Ada','Bram','complete'),(14,'home','Cleo','Ada','complete'),(15,'home','Bram','Cleo','complete'),
 (16,'home','Ada','Cleo','complete'),(17,'away','Esme','Dov','complete'),(18,'away','Dov','Esme','incomplete'),
 (19,'home','Cleo','Ada','complete'),(20,'away','Esme','Dov','incomplete')`);
show("5 correct", `WITH flagged AS (
  SELECT pass_id, team, outcome,
    CASE WHEN outcome <> 'complete' THEN 1
         WHEN LAG(team) OVER (ORDER BY pass_id) IS NULL THEN 1
         WHEN LAG(team) OVER (ORDER BY pass_id) <> team THEN 1
         WHEN LAG(outcome) OVER (ORDER BY pass_id) <> 'complete' THEN 1
         ELSE 0 END AS new_run
  FROM PassAction
), islands AS (
  SELECT pass_id, team, outcome,
    SUM(new_run) OVER (ORDER BY pass_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_no
  FROM flagged
), runs AS (SELECT team, run_no, COUNT(*) AS run_len FROM islands WHERE outcome='complete' GROUP BY team, run_no)
SELECT team, MAX(run_len) AS longest_streak FROM runs GROUP BY team ORDER BY team`);
show("5 per-team-key wrong (count all rows)", `WITH k AS (
  SELECT pass_id, team, pass_id - ROW_NUMBER() OVER (PARTITION BY team ORDER BY pass_id) AS isl FROM PassAction
), g AS (SELECT team, isl, COUNT(*) AS c FROM k GROUP BY team, isl)
SELECT team, MAX(c) FROM g GROUP BY team`);
show("5 per-team-key wrong (count completes only)", `WITH k AS (
  SELECT pass_id, team, outcome, pass_id - ROW_NUMBER() OVER (PARTITION BY team ORDER BY pass_id) AS isl
  FROM PassAction
), g AS (SELECT team, isl, COUNT(*) AS c FROM k WHERE outcome='complete' GROUP BY team, isl)
SELECT team, MAX(c) FROM g GROUP BY team`);
show("5 interleave-blind wrong (own-subsequence streaks)", `WITH comp AS (
  SELECT pass_id, team, ROW_NUMBER() OVER (PARTITION BY team ORDER BY pass_id) AS rn
  FROM PassAction WHERE outcome='complete'
), isl AS (SELECT team, rn - ROW_NUMBER() OVER (PARTITION BY team ORDER BY rn) AS g FROM comp)
SELECT team, MAX(c) FROM (SELECT team, g, COUNT(*) AS c FROM isl GROUP BY team, g) GROUP BY team`);

// ---- dive 6: bits ----
db.run(`CREATE TABLE UserGrant (grant_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL,
  perm_mask INTEGER NOT NULL CHECK (perm_mask IN (1,2,4)))`);
db.run(`INSERT INTO UserGrant VALUES (1,11,1),(2,11,2),(3,11,4),(4,22,1),(5,22,4),(6,33,2),(7,33,4),(8,33,1),
 (9,44,1),(10,44,1),(11,44,2),(12,44,4),(13,55,2),(14,55,4)`);
show("6 correct", `WITH combined AS (
  SELECT user_id, SUM(DISTINCT perm_mask) AS combined_mask FROM UserGrant GROUP BY user_id
) SELECT user_id, combined_mask FROM combined WHERE (combined_mask & 7) = 7 ORDER BY user_id`);
show("6 plain SUM wrong (all users)", `SELECT user_id, SUM(perm_mask) AS m FROM UserGrant GROUP BY user_id ORDER BY user_id`);
show("6 MAX wrong", `WITH combined AS (SELECT user_id, MAX(perm_mask) AS combined_mask FROM UserGrant GROUP BY user_id)
  SELECT user_id, combined_mask FROM combined WHERE (combined_mask & 7) = 7 ORDER BY user_id`);
db.close();
console.log("probe done");
