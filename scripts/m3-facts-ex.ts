// EXCEPT drill receipts (m3-w1b) — probed on read-only copy.
// Run: bun scripts/m3-facts-ex.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fex.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try {
    db.prepare(sql).all();
    return "NO ERROR";
  } catch (e) {
    return String(e).slice(0, 110);
  }
};

console.log("== EXCEPT DIRECTION PAIRS ==");
console.log("orders statuses ∖ invoice statuses:", one(`SELECT status FROM orders EXCEPT SELECT status FROM invoices ORDER BY status`));
console.log("invoice statuses ∖ order statuses:", one(`SELECT status FROM invoices EXCEPT SELECT status FROM orders`));
console.log("suppliers regions ∖ customers regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM suppliers EXCEPT SELECT region FROM customers)`));
console.log("customers regions ∖ suppliers regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers EXCEPT SELECT region FROM suppliers)`));
console.log("products ∖ supplier names (count):", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM products EXCEPT SELECT name FROM suppliers)`));
console.log("products ∩ supplier names (overlap check):", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM products INTERSECT SELECT name FROM suppliers)`));
console.log("customers ∖ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM customers EXCEPT SELECT name FROM suppliers)`));
console.log("suppliers ∖ customer names:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM suppliers EXCEPT SELECT name FROM customers)`));
console.log("order customer_ids ∖ customer ids:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders EXCEPT SELECT id FROM customers)`));
console.log("order ids ∖ customer ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders EXCEPT SELECT id FROM customers)`));
console.log("product categories ∖ supplier regions:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM products EXCEPT SELECT region FROM suppliers)`));
console.log("statuses ∖ payment methods:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT method FROM payments)`));

console.log("\n== EXCEPT SELF & SUBSET ==");
console.log("statuses ∖ statuses (self):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT status FROM orders)`));
console.log("cities ∖ EU-cities (EU cities distinct first):", one(`SELECT COUNT(DISTINCT city) AS n FROM customers WHERE region = 'EU'`));
console.log("cities ∖ EU-cities (result):", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers EXCEPT SELECT city FROM customers WHERE region = 'EU')`));
console.log("US-cities ∖ all-cities:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers WHERE region = 'US' EXCEPT SELECT city FROM customers)`));
console.log("regions chained: cust∖EU∖APAC:", one(`SELECT region FROM customers EXCEPT SELECT region FROM customers WHERE region = 'EU' EXCEPT SELECT region FROM customers WHERE region = 'APAC'`));

console.log("\n== EXCEPT DUPLICATE COLLAPSE ==");
console.log("103 left rows collapse to:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers)`));
console.log("result column name comes from left arm:", one(`SELECT status AS v FROM orders EXCEPT SELECT region FROM customers LIMIT 1`).slice(0, 20));

console.log("\n== EXCEPT NULL SAFETY ==");
console.log("pending shipped_at census:", one(`SELECT COUNT(*) AS n, SUM(shipped_at IS NULL) AS nulls, COUNT(DISTINCT shipped_at) AS groups FROM orders WHERE status = 'pending'`));
console.log("cancelled shipped_at census:", one(`SELECT COUNT(*) AS n, SUM(shipped_at IS NULL) AS nulls, COUNT(DISTINCT shipped_at) AS groups FROM orders WHERE status = 'cancelled'`));
console.log("pending shipped_at ∖ cancelled shipped_at:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE status = 'pending' EXCEPT SELECT shipped_at FROM orders WHERE status = 'cancelled')`));
console.log("INTERSECT id<=10 (NULL group counts):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("EXCEPT id<=10 self (NULL group removed):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 EXCEPT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("first10 shipped_at groups:", one(`SELECT COUNT(DISTINCT shipped_at) AS g, SUM(shipped_at IS NULL) AS nulls FROM orders WHERE id <= 10`));

console.log("\n== EXCEPT REAL / AFFINITY ==");
console.log("delivered totals distinct:", one(`SELECT COUNT(DISTINCT total) AS n FROM orders WHERE status = 'delivered'`));
console.log("pending totals distinct:", one(`SELECT COUNT(DISTINCT total) AS n FROM orders WHERE status = 'pending'`));
console.log("delivered totals ∖ pending totals:", one(`SELECT COUNT(*) AS n FROM (SELECT total FROM orders WHERE status = 'delivered' EXCEPT SELECT total FROM orders WHERE status = 'pending')`));
console.log("delivered ∖ pending totals overlap check:", one(`SELECT COUNT(*) AS n FROM (SELECT total FROM orders WHERE status = 'delivered' INTERSECT SELECT total FROM orders WHERE status = 'pending')`));
console.log("INTEGER 1 ∖ TEXT '1' (type-strict grouping):", one(`SELECT COUNT(*) AS n FROM (SELECT active FROM customers EXCEPT SELECT CAST(active AS TEXT) FROM customers)`));

console.log("\n== EXCEPT ERROR TEXTS ==");
console.log("EXCEPT ALL:", err(`SELECT status FROM orders EXCEPT ALL SELECT status FROM orders`));
console.log("bare table right operand:", err(`SELECT status FROM orders EXCEPT orders`));
console.log("col count mismatch (EXCEPT):", err(`SELECT status FROM orders EXCEPT SELECT region, city FROM customers`));
console.log("col count mismatch (INTERSECT):", err(`SELECT status FROM orders INTERSECT SELECT region FROM customers, invoices`));
console.log("ORDER BY inside middle arm:", err(`SELECT status FROM orders EXCEPT SELECT region FROM customers ORDER BY region EXCEPT SELECT city FROM customers`));

console.log("\n== EXCEPT MISC (second pass) ==");
console.log("statuses ∖ cities (names need not match):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT city FROM customers)`));
console.log("bare column right operand:", err(`SELECT status FROM orders EXCEPT region FROM customers`));
console.log("ORDER BY 3 on 2-col compound:", err(`SELECT status, region FROM orders, customers ORDER BY 3`));
console.log("EXCEPT ... LIMIT 2 (applies to compound):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT status FROM invoices LIMIT 2)`));
console.log("arm resolves own columns:", err(`SELECT status FROM orders EXCEPT SELECT status FROM invoices WHERE total > 0`));
console.log("statuses ∖ cities rows sample:", one(`SELECT * FROM (SELECT status AS word FROM orders EXCEPT SELECT city FROM customers) ORDER BY word`));

db.close();
rmSync(COPY);
