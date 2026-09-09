// HB1 probe 2 — expenses (spent_on) only. Read-only copy.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb1.db", { readonly: true });
const q = (label: string, sql: string) => {
  try {
    console.log(`== ${label}\n${JSON.stringify(db.query(sql).all())}`);
  } catch (e: any) {
    console.log(`== ${label}\nERR: ${e.message}`);
  }
};
q("287 monthly spend", `SELECT strftime('%Y-%m', spent_on) AS month, ROUND(SUM(amount_cents)/100.0, 2) AS spend FROM expenses GROUP BY month ORDER BY spend DESC LIMIT 3`);
q("287 month count", `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) FROM expenses`);
q("287 '%Y' variant", `SELECT strftime('%Y', spent_on) AS yr, ROUND(SUM(amount_cents)/100.0, 2) AS spend FROM expenses GROUP BY yr ORDER BY spend DESC`);
q("287 garbage fmt variant", `SELECT strftime('orders', spent_on) AS m, ROUND(SUM(amount_cents)/100.0,2) AS s FROM expenses GROUP BY m`);
q("287 COUNT variant", `SELECT strftime('%Y-%m', spent_on) AS month, ROUND(COUNT(amount_cents)/100.0, 2) AS spend FROM expenses GROUP BY month ORDER BY spend DESC LIMIT 3`);
q("287 MIN variant", `SELECT strftime('%Y-%m', spent_on) AS month, ROUND(MIN(amount_cents)/100.0, 2) AS spend FROM expenses GROUP BY month ORDER BY spend DESC LIMIT 3`);
db.close();
