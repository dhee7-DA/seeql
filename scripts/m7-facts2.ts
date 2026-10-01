// M7 facts round 2 — stateful receipts re-probed on a FRESH copy each time
// (round 1's copy was polluted by an earlier DELETE FROM products).
// Run: bun scripts/m7-facts2.ts
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

const COPY = "scripts/.m7-facts2.db";

function fresh(): Database {
  copyFileSync("db/custom.db", COPY);
  return new Database(COPY);
}

function probe(label: string, sql: string, afterSqls: string[] = []) {
  const db = fresh();
  try {
    const before = (db.query("SELECT total_changes() AS c").get() as any).c;
    let err: string | null = null;
    let res: any[] = [];
    try {
      res = db.query(sql).all() as any[];
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    const after = (db.query("SELECT total_changes() AS c").get() as any).c;
    const changes = Number(after) - Number(before);
    let extra = "";
    for (const a of afterSqls) {
      try {
        extra += `\n    -> ${a} = ${JSON.stringify(db.query(a).all())}`;
      } catch (e) {
        extra += `\n    -> ${a} ERROR`;
      }
    }
    console.log(
      `${label}: ${err ? "ERROR " + err : `ok, ${res.length} rows`} | changes=${changes}` +
        (res.length > 0 && res.length <= 10 ? ` | ${JSON.stringify(res)}` : "") + extra,
    );
  } finally {
    db.close();
  }
}

console.log("=== fresh-copy receipts ===");
probe("k1-restock-25", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 restock', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock", ["SELECT id, stock FROM products WHERE id = 1"]);
probe("k1-guard-lower", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 cheap', 'Electronics', 79.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price", ["SELECT price FROM products WHERE id = 1"]);
probe("k1-guard-higher-after-lower", "UPDATE products SET price = 89.99 WHERE id = 1", []);
probe("k1-guard-higher", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 pricey', 'Electronics', 99.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price", ["SELECT price FROM products WHERE id = 1"]);
probe("k1-or-replace", "INSERT OR REPLACE INTO products (id, name, category, price, supplier_id) VALUES (1, 'K1 (2026)', 'Electronics', 99.99, 1)", ["SELECT * FROM products WHERE id = 1"]);
probe("multi-upsert-mixed", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (900, 'Probe A', 'Audio', 1.0, 1, 1), (1, 'Probe K1', 'Electronics', 1.0, 5, 1), (901, 'Probe B', 'Audio', 2.0, 2, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock", ["SELECT id, stock FROM products WHERE id IN (1, 900, 901) ORDER BY id"]);
probe("order-item-insert", "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (103, 1, 2, 89.99)", ["SELECT MAX(id) m FROM order_items"]);
probe("supplier-insert", "INSERT INTO suppliers (name, region, rating) VALUES ('Probe Supplies', 'EU', 4.5)", ["SELECT MAX(id) m FROM suppliers"]);
probe("customer-insert-default-active", "INSERT INTO customers (name, email, city, region, created_at) VALUES ('Echo Person', 'echo@x.io', 'Echo City', 'APAC', '2026-01-15')", ["SELECT id, active FROM customers WHERE email = 'echo@x.io'"]);
probe("insert-select-fitness", "INSERT INTO products (name, category, price, stock, supplier_id) SELECT name || ' (restock)', category, price, stock, supplier_id FROM products WHERE category = 'Fitness'", ["SELECT id, name FROM products WHERE id = 17"]);
probe("update-scalar-subquery", "UPDATE products SET stock = (SELECT CAST(AVG(stock) AS INTEGER) FROM products) WHERE id = 1", ["SELECT stock FROM products WHERE id = 1", "SELECT CAST(AVG(stock) AS INTEGER) a FROM products"]);
probe("delete-latam-orders", "DELETE FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'LATAM')", ["SELECT id, name FROM customers WHERE region = 'LATAM'"]);
probe("latam-customer", "SELECT id, name FROM customers WHERE region = 'LATAM'");
probe("order-7-items", "SELECT COUNT(*) n FROM order_items WHERE order_id = 7");
probe("order-95-items", "SELECT COUNT(*) n FROM order_items WHERE order_id = 95");
probe("qty-histogram", "SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity");
probe("del-order-7-items", "DELETE FROM order_items WHERE order_id = 7");
probe("ret-single-customer", "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Echo Person', 'echo@x.io', 'Echo City', 'APAC', 1, '2026-01-15') RETURNING id, active");
probe("ret-two-orders", "INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 88.50, '2026-01-15'), (2, 'delivered', 42.00, '2026-01-16') RETURNING id, total");
probe("ret-delete-cancelled", "DELETE FROM orders WHERE status = 'cancelled' RETURNING id");
probe("ret-update-audio", "UPDATE products SET price = price * 1.1 WHERE category = 'Audio' RETURNING id, ROUND(price, 2) AS new_price");
probe("ret-upsert-k1", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1', 'Electronics', 89.99, 30, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock RETURNING id, stock");
probe("ret-wo-returning-count", "UPDATE orders SET status = 'delivered' WHERE status = 'pending'");
probe("del-shipped-items-of-cancelled", "DELETE FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 9)");
console.log("  items-of-product-9:", JSON.stringify((() => { const db = fresh(); const r = db.query("SELECT COUNT(*) n FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 9)").all(); db.close(); return r; })()));
probe("orders-of-product-9-count", "SELECT COUNT(*) n FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 9)");
probe("insert-explicit-id-supplier", "INSERT INTO suppliers (id, name, region, rating) VALUES (9, 'Future Goods', 'APAC', 3.5) RETURNING id, name");
probe("upsert-no-op-do-nothing-fresh", "INSERT OR IGNORE INTO suppliers (id, name, region, rating) VALUES (6, 'Andes Naturals SA', 'LATAM', 4.0)");
console.log("DONE");
