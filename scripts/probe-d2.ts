// m4-bank-d risky probes (possible hang / prepare-time errors) — run separately
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  ["A5 CTE referenced twice in step", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT a.n + b.n FROM c a, c b WHERE a.n < 5) SELECT count(*) AS n FROM c`],
  ["A19 recursive term not last", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 3 UNION ALL SELECT 99) SELECT count(*) AS n FROM c`],
];

for (const [label, sql] of probes) {
  try {
    console.log(label, "=>", JSON.stringify(db.query(sql).all()));
  } catch (e: any) {
    console.log(label, "=> ERROR:", e.message);
  }
}
