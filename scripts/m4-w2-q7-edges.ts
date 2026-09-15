/// <reference types="bun-types" />
/** Wave-2 q7 edge probes (all bounded — no infinite arms). */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.q7edge.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    console.log(`H${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`H${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

probe("product slots bound-24", "WITH RECURSIVE slots(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM slots WHERE n < 24) SELECT COUNT(*) n FROM slots WHERE n IN (SELECT id FROM products)");
probe("ladder +1 month total", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 month') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days");
probe("ladder +2 day total", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+2 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days");
probe("ladder +7 day total", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+7 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days");
probe("ladder +1 week ∩ order dates", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 week') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days WHERE d IN (SELECT created_at FROM orders)");
probe("ladder +1 month ∩ order dates", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 month') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days WHERE d IN (SELECT created_at FROM orders)");
probe("busy days n>1", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days WHERE (SELECT COUNT(*) FROM orders WHERE created_at = days.d) > 1");
probe("union-all dup base", "WITH RECURSIVE d(n) AS (SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT n + 1 FROM d WHERE n < 3) SELECT group_concat(n) s FROM d");
probe("counter bound <= 5", "WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM cnt WHERE n <= 5) SELECT group_concat(n) s FROM cnt");
probe("ladder ∩ suppliers bound-16", "WITH RECURSIVE ids(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM ids WHERE n < 16) SELECT COUNT(*) n FROM ids WHERE n IN (SELECT id FROM suppliers)");
probe("slots NOT IN bound-24", "WITH RECURSIVE slots(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM slots WHERE n < 24) SELECT COUNT(*) n FROM slots WHERE n NOT IN (SELECT id FROM products)");
probe("counter base 2 bound 5", "WITH RECURSIVE cnt(n) AS (SELECT 2 UNION ALL SELECT n + 1 FROM cnt WHERE n < 5) SELECT group_concat(n) s FROM cnt");
probe("counter eq bound", "WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM cnt WHERE n = 1000) SELECT group_concat(n) s FROM cnt");
probe("odd ladder +2 bound 1000 rows", "WITH RECURSIVE p(n) AS (SELECT 1 UNION ALL SELECT n + 2 FROM p WHERE n < 1000) SELECT COUNT(*) rows_n FROM p");
probe("slots bound 12 fill", "WITH RECURSIVE slots(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM slots WHERE n < 12) SELECT COUNT(*) n FROM slots WHERE n IN (SELECT id FROM products)");

rmSync(COPY, { force: true });
console.log(`--- ${n} probes done`);
