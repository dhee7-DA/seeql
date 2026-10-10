/// <reference types="bun-types" />
// j2b probe 2 — prose details + risky distractor pre-verification for cs-235..cs-242.

import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2b2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// cs-236 prose: the premium items themselves
q("premium products >=100 w/ supplier", `SELECT p.name, p.price, s.name supplier FROM products p JOIN suppliers s ON s.id=p.supplier_id WHERE p.price>=100 ORDER BY p.price DESC`);
q("products 90..100 boundary", `SELECT p.name, p.price FROM products p WHERE p.price BETWEEN 50 AND 100 ORDER BY p.price DESC`);

// cs-237 prose + distractor pre-checks
q("carla's single refund", `SELECT r.id, r.order_id, r.amount, r.reason FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE e.name='Carla Dominguez'`);
q("changed_mind zeros list", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by=e.id AND r.reason='changed_mind' WHERE r.id IS NULL ORDER BY e.name`);
q("237 e.id collision zeros", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON e.id = e.id AND r.reason='damaged' WHERE r.id IS NULL ORDER BY e.name`);
q("237 r.order_id collision zeros", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON r.order_id = e.id AND r.reason='damaged' WHERE r.id IS NULL ORDER BY e.name`);
q("employee id map", `SELECT id, name, role FROM employees ORDER BY id`);

// cs-239 prose: acquisition totals, alice double touch
q("total acquisition spend", `SELECT ROUND(SUM(spend),2) v, COUNT(*) n FROM acquisitions`);
q("alice touches", `SELECT a.id, a.channel, a.spend FROM acquisitions a JOIN customers c ON c.id=a.customer_id WHERE c.name='Alice Chen' ORDER BY a.id`);
q("noah/pedro orders+value", `SELECT c.name, COUNT(o.id) n, ROUND(SUM(o.total),2) v FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE c.name IN ('Noah Meyer','Pedro Alvarez') GROUP BY c.id`);

// cs-240 prose: blanks tail + sums
q("240 correct fill tail", `SELECT o.id, p.method, p.amount FROM orders o LEFT JOIN payments p ON p.order_id=o.id AND p.method='card' WHERE o.status='pending' ORDER BY o.id`);

// cs-241 prose: blanks sum
q("241 lead-signed sum", `SELECT COUNT(*) n, ROUND(SUM(r.amount),2) v FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE e.role='lead'`);
q("241 rep-signed sum", `SELECT COUNT(*) n, ROUND(SUM(r.amount),2) v FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE e.role='rep'`);

// cs-235 prose: pending per-customer confirm + zeros list names
q("235 zero-pending customers", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending' GROUP BY c.id HAVING COUNT(o.id)=0 ORDER BY c.name`);

// cs-238 prose: premium-line spread check (@100: how many orders have >=1 line)
q("238 orders WITH premium line", `SELECT COUNT(*) n FROM (SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id=o.id AND oi.unit_price>=100 GROUP BY o.id)`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe2 done, copy removed");
