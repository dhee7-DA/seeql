/// <reference types="bun-types" />
// j9-a probe 2 — storefront self-join facts: candidates for cs-301..cs-308.
// Probes the COPY (scripts/.tmp-j9a.db) read-only. NEVER touches db/custom.db.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9a.db", { readonly: true });
const dump = (title: string, sql: string) => {
  console.log(`\n== ${title} ==`);
  const rows = db.query(sql).all() as Record<string, unknown>[];
  if (rows.length <= 30) console.table(rows);
  else {
    console.table(rows.slice(0, 30));
    console.log(`… (${rows.length} rows total)`);
  }
};

console.log("== row counts ==");
for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
  console.log(t, db.query(`SELECT COUNT(*) n FROM ${t}`).get());
}

dump("customers (all)", "SELECT id, name, city, region, active, created_at FROM customers ORDER BY id");
dump("suppliers (all)", "SELECT * FROM suppliers ORDER BY id");
dump("products (all)", "SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id");
dump("order status spread", "SELECT status, COUNT(*) n, ROUND(SUM(total),2) s FROM orders GROUP BY status");
dump("orders per customer", "SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC");

// --- self-join candidate shapes -------------------------------------------
dump("A) same-city customer pairs c1.id<c2.id",
  "SELECT c1.name a, c2.name b, c1.city FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id ORDER BY c1.city, c1.id");
dump("A2) same-city pair count",
  "SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id");
dump("A3) same-region customer pairs count",
  "SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id");
dump("A4) cities with 2+ customers",
  "SELECT c1.city, COUNT(*) n FROM customers c1 GROUP BY c1.city HAVING COUNT(*) > 1");

dump("B) same-category product pairs, dearest first role",
  "SELECT p1.name a, p1.price pa, p2.name b, p2.price pb, p1.category FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id ORDER BY p1.category, p1.id");
dump("B2) same-category pair count",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id");
dump("B3) same-category pairs WITHOUT id< guard (mirror check)",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id <> p2.id");
dump("B4) same-category pairs without any id guard (self-pairs included)",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category");

dump("C) same-supplier pairs",
  "SELECT p1.name a, p2.name b, p1.supplier_id, p1.category ca, p2.category cb FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id ORDER BY p1.supplier_id, p1.id");
dump("C2) same-supplier pair count",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id");
dump("C3) same-supplier DIFFERENT-category pairs",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.category <> p2.category AND p1.id < p2.id");
dump("C4) same-category DIFFERENT-supplier pairs",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.supplier_id <> p2.supplier_id AND p1.id < p2.id");

dump("D) suppliers with no same-region peer (LEFT self-join ghost)",
  "SELECT s1.id, s1.name, s1.region FROM suppliers s1 LEFT JOIN suppliers s2 ON s1.region = s2.region AND s1.id <> s2.id WHERE s2.id IS NULL ORDER BY s1.id");
dump("D2) suppliers region spread",
  "SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY region");
dump("D3) products whose supplier has no other product (LEFT self-join via supplier link)",
  "SELECT p.id, p.name FROM products p LEFT JOIN products p2 ON p2.supplier_id = p.supplier_id AND p2.id <> p.id WHERE p2.id IS NULL");
dump("D4) customers with no same-city neighbor",
  "SELECT c1.id, c1.name, c1.city FROM customers c1 LEFT JOIN customers c2 ON c2.city = c1.city AND c2.id <> c1.id WHERE c2.id IS NULL ORDER BY c1.id");

dump("E) repeat-order pairing: same-customer order pairs",
  "SELECT o1.customer_id, o1.id a, o2.id b, o1.status sa, o2.status sb FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id ORDER BY o1.customer_id, o1.id");
dump("E2) same-customer same-status order pairs count",
  "SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND o1.status = o2.status");
dump("E3) id-collision trap: o1.id = o2.id AND o1.id < o2.id",
  "SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.id = o2.id AND o1.id < o2.id");
dump("E4) wrong-direction: o1.id = o2.customer_id (id-space collision fabrications)",
  "SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.id = o2.customer_id");

dump("F) most expensive product per category (LEFT self-join + aggregate + HAVING)",
  "SELECT p1.name, p1.category, p1.price FROM products p1 LEFT JOIN products p2 ON p2.category = p1.category AND p2.price > p1.price WHERE p2.id IS NULL ORDER BY p1.price DESC");
dump("F2) dearest count via HAVING COUNT = 0",
  "SELECT COUNT(*) n FROM products p1 LEFT JOIN products p2 ON p2.category = p1.category AND p2.price > p1.price WHERE p2.id IS NULL");
dump("F3) cheapest per category",
  "SELECT p1.name, p1.category, p1.price FROM products p1 LEFT JOIN products p2 ON p2.category = p1.category AND p2.price < p1.price WHERE p2.id IS NULL ORDER BY p1.price");
dump("F4) per-category product counts",
  "SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category");

dump("G) customers with 3+ orders (three-alias triangle o1<o2<o3)",
  "SELECT o1.customer_id, o1.id a, o2.id b, o3.id c FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id JOIN orders o3 ON o2.customer_id = o3.customer_id AND o2.id < o3.id ORDER BY o1.customer_id");
dump("G2) three-alias distinct customers",
  "SELECT COUNT(DISTINCT o1.customer_id) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id JOIN orders o3 ON o2.customer_id = o3.customer_id AND o2.id < o3.id");

dump("H) same-city pairs where BOTH placed an order (cross outward)",
  "SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c1.id) AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c2.id)");

dump("I) price-gap pairs in category (p1.price - p2.price >= 40)",
  "SELECT p1.name a, p1.price pa, p2.name b, p2.price pb, p1.category FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.price > p2.price + 40 ORDER BY p1.category, p1.price DESC");
dump("I2) count p1.price > p2.price + 40 same category",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.price > p2.price + 40");
dump("I3) count p1.price > p2.price + 20 same category",
  "SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.price > p2.price + 20");

dump("J) sqlite version (RIGHT JOIN support?)", "SELECT sqlite_version() v");

db.close();
console.log("\nprobe-2 done");
