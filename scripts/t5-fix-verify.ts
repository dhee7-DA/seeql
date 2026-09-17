/// <reference types="bun-types" />
/** Pre-fix verification probes for the 8 failing t5 cases. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.verify-t5.db");
const db = new Database("scripts/.verify-t5.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`${label}: ${JSON.stringify(rows).slice(0, 300)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message.slice(0, 120)}`);
  }
}

// cs-1412: caps surnames; '<' flip must give 0
q("1412 correct (=)", `SELECT COUNT(*) FROM customers WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1) = UPPER(SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1)) AND LENGTH(name) > 0`);
q("1412 '<' flip", `SELECT COUNT(*) FROM customers WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1) < UPPER(SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1)) AND LENGTH(name) > 0`);

// cs-1418: COALESCE 2-arg fix; SUM/AVG 2-arg error; roll = 16
q("1418 correct", `SELECT COUNT(DISTINCT COALESCE(customer_id, 0)) AS buyers FROM orders WHERE total > 0`);
q("1418 SUM 2-arg", `SELECT COUNT(DISTINCT SUM(customer_id, 0)) AS buyers FROM orders WHERE total > 0`);
q("1418 SUM slot1", `SELECT SUM(DISTINCT COALESCE(customer_id, 0)) AS buyers FROM orders WHERE total > 0`);
q("1418 500 floor", `SELECT COUNT(DISTINCT COALESCE(customer_id, 0)) AS buyers FROM orders WHERE total > 500`);

// cs-1420: 'shipped' in slot 2 (number < text -> all true -> 14) and slot 3
q("1420 'shipped' slot2", `SELECT COUNT(*) FROM orders WHERE COALESCE(total, 0) < 'shipped' AND status = 'pending' AND DATE(created_at) = created_at`);
q("1420 'shipped' slot3", `SELECT COUNT(*) FROM orders WHERE COALESCE(total, 0) < 100 AND status = 'shipped' AND DATE(created_at) = created_at`);

// cs-1423 restructured: pending months with open floor; shipped months; 500 floor
q("1423 correct", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months FROM orders WHERE status = 'pending' AND COALESCE(total, 0) > 0 AND DATE(created_at) = created_at`);
q("1423 shipped", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months FROM orders WHERE status = 'shipped' AND COALESCE(total, 0) > 0 AND DATE(created_at) = created_at`);
q("1423 500 floor", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months FROM orders WHERE status = 'pending' AND COALESCE(total, 0) > 500 AND DATE(created_at) = created_at`);
q("1423 'shipped' slot3", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months FROM orders WHERE status = 'pending' AND COALESCE(total, 0) > 'shipped' AND DATE(created_at) = created_at`);

// cs-1424: MAX(status,'x') = status -> 0; IFNULL(status,'x') = status -> 4 towers
q("1424 correct", `SELECT COUNT(*) FROM orders WHERE COALESCE(total, 0) > 800 AND IFNULL(status, 'x') = status`);
q("1424 MAX flip", `SELECT COUNT(*) FROM orders WHERE COALESCE(total, 0) > 800 AND MAX(status, 'x') = status`);
q("1424 UPPER 2-arg", `SELECT COUNT(*) FROM orders WHERE COALESCE(total, 0) > 800 AND UPPER(status, 'x') = status`);

// cs-1425: IFNULL(i.pot, 0) inside COALESCE -> 12 drifters; ROUND(i.pot,0) -> 101
q("1425 correct", `SELECT COUNT(*) AS drifted FROM (SELECT o.id, o.total, o.created_at, COALESCE(IFNULL(i.pot, 0), 0) AS pot FROM orders o LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id) WHERE pot != total AND DATE(created_at) = created_at AND pot > 0`);
q("1425 ROUND flip", `SELECT COUNT(*) AS drifted FROM (SELECT o.id, o.total, o.created_at, COALESCE(ROUND(i.pot, 0), 0) AS pot FROM orders o LEFT JOIN (SELECT order_id, SUM(quantity * unit_price) AS pot FROM order_items GROUP BY order_id) i ON i.order_id = o.id) WHERE pot != total AND DATE(created_at) = created_at AND pot > 0`);

// cs-1433: 'dec' fills — month code, year code, total floor
q("1433 correct", `SELECT COUNT(*) FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024' AND DATE(created_at) = created_at AND total > 0`);
q("1433 'dec' slot1", `SELECT COUNT(*) FROM orders WHERE strftime('%m', created_at) = 'dec' AND strftime('%Y', created_at) = '2024' AND DATE(created_at) = created_at AND total > 0`);
q("1433 'dec' slot2", `SELECT COUNT(*) FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = 'dec' AND DATE(created_at) = created_at AND total > 0`);
q("1433 'dec' slot5", `SELECT COUNT(*) FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024' AND DATE(created_at) = created_at AND total > 'dec'`);
q("1433 '2025' slot5", `SELECT COUNT(*) FROM orders WHERE strftime('%m', created_at) = '12' AND strftime('%Y', created_at) = '2024' AND DATE(created_at) = created_at AND total > '2025'`);

// cs-1450: runs — confirm Jan/Feb/Sep lean bucket and wall bites at 6000
q("1450 stage", `SELECT mo, rev, run, q FROM (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run, NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q FROM (SELECT created_at, total FROM orders) GROUP BY mo) WHERE q = 4`);
q("1450 wall 6000", `SELECT mo, rev, run FROM (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run, NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q FROM (SELECT created_at, total FROM orders) GROUP BY mo) WHERE q = 4 AND run < 6000`);
q("1450 wall 10000", `SELECT mo, rev, run FROM (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run, NTILE(4) OVER (ORDER BY SUM(total) ASC) AS q FROM (SELECT created_at, total FROM orders) GROUP BY mo) WHERE q = 4 AND run < 10000`);

db.close();
