// M7 write-bank facts probe — every figure cited by the M7 keyword banks
// (INSERT / UPDATE / DELETE / UPSERT / RETURNING / Transactions) is verified
// here against a fresh COPY of the seed db. Writes run on the copy; the seed
// itself is never touched. Storefront tables ONLY — the seed file carries no
// finance/hospital packs (those are app-runtime worlds, out of audit scope).
// Run: bun scripts/m7-facts.ts
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

const COPY = "scripts/.m7-facts.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY);

const q = (sql: string): any[] => db.query(sql).all() as any[];
const one = (sql: string): any => db.query(sql).get() as any;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

function probe(label: string, sql: string) {
  try {
    const before = one("SELECT total_changes() AS c").c;
    let err: string | null = null;
    let res: any[] = [];
    try {
      res = q(sql);
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
    }
    const after = one("SELECT total_changes() AS c").c;
    const changes = Number(after) - Number(before);
    console.log(
      `${label}: ${err ? "ERROR " + err : `ok, ${res.length} rows`} | changes=${changes}` +
        (res.length > 0 && res.length <= 8 ? ` | ${JSON.stringify(res)}` : ""),
    );
  } catch (e) {
    console.log(`${label}: PROBE CRASH ${e instanceof Error ? e.message : e}`);
  }
}

section("schema (write-relevant DDL)");
for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
  const row = one(`SELECT sql FROM sqlite_master WHERE name = '${t}'`);
  console.log(`-- ${t}: ${row ? String(row.sql).replace(/\s+/g, " ").slice(0, 260) : "MISSING"}`);
}
console.log("products-cols:", q("PRAGMA table_info(products)").map((r: any) => `${r.name}:${r.notnull ? "NN" : "ok"}:dflt=${r.dflt_value}`));
console.log("orders-cols:", q("PRAGMA table_info(orders)").map((r: any) => `${r.name}:${r.notnull ? "NN" : "ok"}:dflt=${r.dflt_value}`));
console.log("tables:", q("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").map((r: any) => r.name));

section("census receipts");
console.log("statuses:", q("SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status"));
console.log("categories:", q("SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category"));
console.log("regions:", q("SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region"));
console.log("inactive:", q("SELECT id, name, region FROM customers WHERE active = 0"));
console.log("rowcounts:", {
  customers: one("SELECT COUNT(*) n FROM customers").n,
  suppliers: one("SELECT COUNT(*) n FROM suppliers").n,
  products: one("SELECT COUNT(*) n FROM products").n,
  orders: one("SELECT COUNT(*) n FROM orders").n,
  order_items: one("SELECT COUNT(*) n FROM order_items").n,
});
console.log("maxes:", {
  customer: one("SELECT MAX(id) m FROM customers").m,
  supplier: one("SELECT MAX(id) m FROM suppliers").m,
  product: one("SELECT MAX(id) m FROM products").m,
  order: one("SELECT MAX(id) m FROM orders").m,
  item: one("SELECT MAX(id) m FROM order_items").m,
});
console.log("suppliers:", q("SELECT id, name, region, rating FROM suppliers ORDER BY id"));
console.log("lowstock:", q("SELECT id, name, stock, price FROM products ORDER BY stock ASC LIMIT 4"));
console.log("priciest:", q("SELECT id, name, price FROM products ORDER BY price DESC LIMIT 3"));
console.log("audio:", q("SELECT id, name, price, stock FROM products WHERE category = 'Audio' ORDER BY id"));
console.log("video:", q("SELECT id, name, price, stock FROM products WHERE category = 'Video' ORDER BY id"));
console.log("fitness:", q("SELECT id, name, price, stock FROM products WHERE category = 'Fitness' ORDER BY id"));
console.log("apparel:", q("SELECT id, name, price, stock FROM products WHERE category = 'Apparel' ORDER BY id"));
console.log("accessories:", q("SELECT id, name, price, stock FROM products WHERE category = 'Accessories' ORDER BY id"));
console.log("electronics:", q("SELECT id, name, price, stock FROM products WHERE category = 'Electronics' ORDER BY id"));
console.log("wearables:", q("SELECT id, name, price, stock FROM products WHERE category = 'Wearables' ORDER BY id"));
console.log("us-customers:", q("SELECT id, name, active FROM customers WHERE region = 'US' ORDER BY id"));
console.log("pending:", q("SELECT id, customer_id, total FROM orders WHERE status = 'pending' ORDER BY id"));
console.log("cancelled:", q("SELECT id, customer_id, total FROM orders WHERE status = 'cancelled' ORDER BY id"));
console.log("order-1:", one("SELECT * FROM orders WHERE id = 1"));
console.log("customer-1:", one("SELECT * FROM customers WHERE id = 1"));
console.log("qty>=5:", one("SELECT COUNT(*) n FROM order_items WHERE quantity >= 5").n);
console.log("qty<=1:", one("SELECT COUNT(*) n FROM order_items WHERE quantity <= 1").n);
console.log("zero-total-orders:", one("SELECT COUNT(*) n FROM orders WHERE total = 0").n);
console.log("cheap-orders:", one("SELECT COUNT(*) n FROM orders WHERE total < 50").n);

section("UPDATE aftermath");
probe("upd-audio-10pct", "UPDATE products SET price = price * 1.1 WHERE category = 'Audio'");
console.log("  audio-after:", q("SELECT id, ROUND(price,2) p FROM products WHERE category = 'Audio' ORDER BY id"));
probe("upd-toggle-us", "UPDATE customers SET active = 1 - active WHERE region = 'US'");
probe("upd-activate-inactive", "UPDATE customers SET active = 1 WHERE active = 0");
probe("upd-ship-pending", "UPDATE orders SET status = 'shipped' WHERE status = 'pending'");
probe("upd-cancel-pending-under-100", "UPDATE orders SET status = 'cancelled' WHERE status = 'pending' AND total < 100");
probe("upd-no-where-products", "UPDATE products SET stock = 0");
probe("upd-transfer-case", "UPDATE products SET stock = stock + CASE id WHEN 4 THEN -10 WHEN 1 THEN +10 END WHERE id IN (1, 4)");
console.log("  stocks-1-4:", q("SELECT id, stock FROM products WHERE id IN (1, 4) ORDER BY id"));
probe("upd-same-value", "UPDATE products SET category = 'Video' WHERE category = 'Video'");
probe("upd-self-ref", "UPDATE products SET stock = stock * 2 WHERE category = 'Fitness'");
console.log("  fitness-stock:", one("SELECT stock FROM products WHERE category = 'Fitness'").stock);
probe("upd-orders-unshipped-note", "UPDATE products SET name = name WHERE id = 1");

section("DELETE aftermath");
probe("del-cancelled", "DELETE FROM orders WHERE status = 'cancelled'");
probe("del-latam", "DELETE FROM customers WHERE region = 'LATAM'");
probe("del-zero-match", "DELETE FROM orders WHERE status = 'returned'");
probe("del-all-products", "DELETE FROM products");
console.log("  products-after:", one("SELECT COUNT(*) n FROM products").n);
probe("del-qty5-items", "DELETE FROM order_items WHERE quantity >= 5");

section("INSERT aftermath");
probe("ins-product-no-stock", "INSERT INTO products (name, category, price, supplier_id) VALUES ('Probe Pad', 'Electronics', 19.99, 1)");
console.log("  stock-default:", one("SELECT stock FROM products WHERE name = 'Probe Pad'").stock);
console.log("  new-product-id:", one("SELECT MAX(id) m FROM products").m);
probe("ins-conflict-pk", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Clone K1', 'Electronics', 89.99, 10, 1)");
probe("ins-two-orders", "INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 88.50, '2026-01-15'), (2, 'delivered', 42.00, '2026-01-16')");
probe("ins-multi-one-bad", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (900, 'OK', 'Audio', 1.0, 1, 1), (1, 'Bad', 'Audio', 1.0, 1, 1)");
console.log("  products-after-multi:", one("SELECT COUNT(*) n FROM products").n);
probe("ins-explicit-id-gap", "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (500, 'Gap Person', 'gap@x.io', 'Nowhere', 'EU', 1, '2026-03-03')");
probe("ins-then-auto", "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Next Person', 'next@x.io', 'Somewhere', 'EU', 1, '2026-03-04')");
console.log("  after-auto-id:", one("SELECT MAX(id) m FROM customers").m);
probe("ins-null-into-notnull", "INSERT INTO products (name, price, supplier_id) VALUES ('NoCat', 9.99, 1)");
probe("ins-missing-notnull", "INSERT INTO products (category, price, supplier_id) VALUES ('Audio', 9.99, 1)");

section("UPSERT aftermath");
probe("upsert-do-nothing", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 again', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO NOTHING");
probe("upsert-do-update", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 restock', 'Electronics', 89.99, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock");
console.log("  k1-stock:", one("SELECT stock FROM products WHERE id = 1").stock);
probe("upsert-fresh-id", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (17, 'New Gadget', 'Audio', 59.99, 10, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock");
probe("upsert-where-guard-lower", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 cheap', 'Electronics', 79.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price");
console.log("  k1-price-after-lower:", one("SELECT price FROM products WHERE id = 1").price);
probe("upsert-where-guard-higher", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1 pricey', 'Electronics', 99.99, 0, 1) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price");
console.log("  k1-price-after-higher:", one("SELECT price FROM products WHERE id = 1").price);
probe("upsert-bad-target", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'X', 'Electronics', 1, 1, 1) ON CONFLICT (category) DO NOTHING");
probe("upsert-or-replace", "INSERT OR REPLACE INTO products (id, name, category, price, supplier_id) VALUES (1, 'K1 (2026)', 'Electronics', 99.99, 1)");
console.log("  k1-after-replace:", one("SELECT * FROM products WHERE id = 1"));
probe("or-ignore", "INSERT OR IGNORE INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Clone', 'Electronics', 1, 1, 1)");
probe("multi-upsert-mixed", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (900, 'Probe A', 'Audio', 1.0, 1, 1), (1, 'Probe K1', 'Electronics', 1.0, 5, 1), (901, 'Probe B', 'Audio', 2.0, 2, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock");
console.log("  k1-stock-after-mixed:", one("SELECT stock FROM products WHERE id = 1").stock);
console.log("  probe-ids:", q("SELECT id, stock FROM products WHERE id IN (900, 901) ORDER BY id"));
probe("upsert-customer-legacy", "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (4, 'Dmitri V.', 'dmitri@volt.io', 'Berlin', 'EU', 1, '2024-02-10') ON CONFLICT (id) DO UPDATE SET active = excluded.active");

section("RETURNING aftermath");
probe("ret-single", "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Echo Person', 'echo@x.io', 'Echo City', 'APAC', 1, '2026-01-15') RETURNING id, name");
probe("ret-two-rows", "INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'pending', 88.50, '2026-01-15'), (2, 'delivered', 42.00, '2026-01-16') RETURNING id, total");
probe("ret-star-default", "INSERT INTO products (name, category, price, supplier_id) VALUES ('Echo Pad', 'Electronics', 19.99, 1) RETURNING *");
probe("ret-delete", "DELETE FROM orders WHERE status = 'cancelled' RETURNING id");
probe("ret-update", "UPDATE products SET price = price * 1.1 WHERE category = 'Audio' RETURNING id, ROUND(price, 2) AS new_price");
probe("ret-upsert", "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'K1', 'Electronics', 89.99, 30, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock RETURNING id, stock");

db.close();
console.log("\nDONE");
