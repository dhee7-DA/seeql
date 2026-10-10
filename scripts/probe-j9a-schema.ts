/// <reference types="bun-types" />
// j9-a probe 1 — org-tree facts: schema, employees rows, manager links, refunds link column.
// Probes the COPY (scripts/.tmp-j9a.db) read-only. NEVER touches db/custom.db.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9a.db", { readonly: true });

console.log("== TABLES ==");
for (const t of db.query("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[]) {
  console.log(`\n-- ${t.name}`);
  console.log(t.sql);
}

console.log("\n== EMPLOYEES (all rows) ==");
const emps = db.query("SELECT id, name, role, manager_id, region, hired_at FROM employees ORDER BY id").all();
console.table(emps);

console.log("\n== counts ==");
console.log("employees:", db.query("SELECT COUNT(*) n FROM employees").get());
console.log("manager_id NULL:", db.query("SELECT COUNT(*) n FROM employees WHERE manager_id IS NULL").get());
console.log("manager_id NOT NULL:", db.query("SELECT COUNT(*) n FROM employees WHERE manager_id IS NOT NULL").get());
console.log("dangling manager_ids:", db.query(
  "SELECT e.id, e.name, e.manager_id FROM employees e WHERE e.manager_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM employees m WHERE m.id = e.manager_id)"
).all());

console.log("\n== regions / roles ==");
console.log(db.query("SELECT region, COUNT(*) n FROM employees GROUP BY region ORDER BY region").all());
console.log(db.query("SELECT role, COUNT(*) n FROM employees GROUP BY role ORDER BY n DESC").all());

console.log("\n== self-join shapes (dry run) ==");
console.log("\nA) reports pairs (e reports to m), e.manager_id = m.id:");
console.table(db.query(
  "SELECT e.name AS employee, e.role AS emp_role, m.name AS manager, m.role AS mgr_role FROM employees e JOIN employees m ON e.manager_id = m.id ORDER BY m.name, e.name"
).all());

console.log("\nB) per-manager headcount:");
console.table(db.query(
  "SELECT m.name AS manager, m.role AS mgr_role, COUNT(*) AS reports FROM employees e JOIN employees m ON e.manager_id = m.id GROUP BY m.id, m.name ORDER BY reports DESC, m.name"
).all());

console.log("\nC) bossless root (LEFT, m side NULL):");
console.table(db.query(
  "SELECT e.name, e.role, e.region FROM employees e LEFT JOIN employees m ON e.manager_id = m.id WHERE m.id IS NULL"
).all());

console.log("\nD) employees with NO direct reports (m LEFT e):");
console.table(db.query(
  "SELECT m.name, m.role, m.region FROM employees m LEFT JOIN employees e ON e.manager_id = m.id WHERE e.id IS NULL ORDER BY m.name"
).all());

console.log("\nE) same-region colleague pairs (e1.id < e2.id):");
console.table(db.query(
  "SELECT e1.name AS a, e2.name AS b, e1.region FROM employees e1 JOIN employees e2 ON e1.region = e2.region AND e1.id < e2.id ORDER BY e1.region, e1.name"
).all());

console.log("\nF) same-manager sibling pairs (e1.id < e2.id):");
console.table(db.query(
  "SELECT e1.name AS a, e2.name AS b, m.name AS shared_manager FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON e1.manager_id = m.id ORDER BY m.name"
).all());

console.log("\nG) two-step lineage e->m->g (3 aliases):");
console.table(db.query(
  "SELECT e.name AS employee, m.name AS manager, g.name AS grand FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON m.manager_id = g.id ORDER BY e.name"
).all());

console.log("\n== refunds link column hunt ==");
const refundCols = db.query("PRAGMA table_info(refunds)").all() as any[];
console.log("refunds cols:", refundCols.map((c) => c.name));
for (const col of refundCols.map((c) => c.name)) {
  if (/emp|staff|user|owner|agent|by/i.test(col)) {
    try {
      const r = db.query(`SELECT COUNT(*) n FROM refunds WHERE ${col} IS NOT NULL`).get() as { n: number } | null;
      console.log(`refunds.${col}: non-null = ${r?.n}`);
    } catch {}
  }
}

db.close();
console.log("\nprobe-1 done (copy intact for further probes)");
