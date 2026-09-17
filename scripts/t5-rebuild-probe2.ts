/// <reference types="bun-types" />
/** Probe figures for rebuilt cs-1429 (2024 span) and cs-1444 (shipped pair months). */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.verify-t5c.db");
const db = new Database("scripts/.verify-t5c.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`${label}: ${JSON.stringify(rows).slice(0, 300)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// cs-1429 rebuild: year-scoped span
q("1429 correct (2024 span)", `SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) AS span_days FROM orders WHERE strftime('%Y', created_at) = '2024' AND DATE(created_at) = created_at`);
q("1429 '2025' flip", `SELECT ROUND(julianday(MAX(created_at)) - julianday(MIN(created_at)), 0) AS span_days FROM orders WHERE strftime('%Y', created_at) = '2025' AND DATE(created_at) = created_at`);
q("1429 first/last 2024", `SELECT MIN(created_at) AS first_day, MAX(created_at) AS last_day FROM orders WHERE strftime('%Y', created_at) = '2024'`);
q("1429 ROUND slot3 probe", `SELECT COUNT(*) FROM orders WHERE ROUND(created_at) = created_at`);

// cs-1444 rebuild: shipped-lane pair months
q("1444 correct (shipped pairs 2024)", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 2 AND mo >= '2024-01'`);
q("1444 shipped pairs ALL years", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 2 AND mo >= 1`);
q("1444 1-bar (singleton shipped)", `SELECT COUNT(*) AS solo_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 1 AND mo >= '2024-01'`);
q("1444 '2024-06' floor", `SELECT COUNT(*) AS pair_months FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 2 AND mo >= '2024-06'`);
q("1444 shipped pairs list", `SELECT mo, n FROM (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders WHERE status = 'shipped' GROUP BY mo) WHERE n = 2 ORDER BY mo`);

db.close();
