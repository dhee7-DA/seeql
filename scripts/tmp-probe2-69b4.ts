import { Database } from "bun:sqlite";
const db = new Database(":memory:");
function show(t: string, sql: string) {
  try { console.log(`== ${t}:`, JSON.stringify(db.prepare(sql).all())); }
  catch (e) { console.log(`== ${t}: ERROR ${(e as Error).message}`); }
}
db.run(`CREATE TABLE PassAction (pass_id INTEGER PRIMARY KEY, team TEXT NOT NULL, player_name TEXT NOT NULL, target_name TEXT NOT NULL, outcome TEXT NOT NULL)`);
db.run(`INSERT INTO PassAction VALUES
 (1,'home','a','b','complete'),(2,'home','a','b','complete'),(3,'home','a','b','complete'),(4,'home','a','b','complete'),
 (5,'home','a','b','incomplete'),(6,'home','a','b','complete'),(7,'home','a','b','complete'),
 (8,'away','c','d','complete'),(9,'away','c','d','complete'),(10,'away','c','d','complete'),
 (11,'home','a','b','incomplete'),(12,'home','a','b','complete'),(13,'home','a','b','complete'),(14,'home','a','b','complete'),
 (15,'home','a','b','complete'),(16,'home','a','b','complete'),(17,'away','c','d','complete'),(18,'away','c','d','incomplete'),
 (19,'home','a','b','complete'),(20,'away','c','d','incomplete')`);
// interleave-blind done right: rn over ALL of the team's rows, then complete-only islands keyed on rn
show("5 interleave-blind (fixed)", `WITH allrows AS (
  SELECT pass_id, team, outcome, ROW_NUMBER() OVER (PARTITION BY team ORDER BY pass_id) AS rn FROM PassAction
), comp AS (SELECT team, rn FROM allrows WHERE outcome = 'complete'), isl AS (
  SELECT team, rn - ROW_NUMBER() OVER (PARTITION BY team ORDER BY rn) AS g FROM comp
) SELECT team, MAX(c) AS best FROM (SELECT team, g, COUNT(*) AS c FROM isl GROUP BY team, g) GROUP BY team ORDER BY team`);

db.run(`CREATE TABLE Terrain (position INTEGER PRIMARY KEY, height INTEGER NOT NULL)`);
db.run(`INSERT INTO Terrain VALUES (1,3),(2,0),(3,2),(4,0),(5,4),(6,5),(7,6),(8,7),(9,6),(10,2),(11,2),(12,2),(13,6)`);
show("2 exclude-current (windows over full table, then filter)", `WITH x AS (
  SELECT position, height,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS lprev,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING) AS rnext
  FROM Terrain
) SELECT position, MIN(lprev, rnext) - height AS raw FROM x WHERE position IN (1, 8, 13)`);
show("2 exclude-current full output (no clamp, keep >0)", `WITH x AS (
  SELECT position, height,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS lprev,
    MAX(height) OVER (ORDER BY position ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING) AS rnext
  FROM Terrain
) SELECT position, MIN(lprev, rnext) - height AS raw FROM x WHERE MIN(lprev, rnext) - height > 0 ORDER BY position`);
db.close();
