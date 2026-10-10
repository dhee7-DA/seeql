/// <reference types="bun-types" />
// m5-c3 addendum probe tool — receipts not covered by m5-facts-w3.ts /
// m5-facts-r3.out / m5-facts-c3.out. Read-only COPY of db/custom.db,
// self-deleting. Follows the committed m5-facts-* probe pattern.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w3b.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- B01 expenses ASC ladder bottom (cs-1298 ASC-rank claims) ----
show("expense asc bottom6", `SELECT id, category, vendor, amount_cents,
RANK() OVER (ORDER BY amount_cents ASC) rk FROM expenses ORDER BY rk, id LIMIT 6`);

// ---- B02 created_at tie blocks with RANK (cs-1303) ----
show("date tie blocks", `SELECT created_at, COUNT(*) n, MIN(rk) rk FROM
(SELECT created_at, RANK() OVER (ORDER BY created_at) rk FROM orders)
GROUP BY created_at HAVING n > 1 ORDER BY created_at LIMIT 6`);
show("2024-05-12 trio", `SELECT id, created_at, ROUND(total,2) total, rk FROM
(SELECT id, created_at, total, RANK() OVER (ORDER BY created_at) rk FROM orders)
WHERE created_at = '2024-05-12' ORDER BY total DESC`);
show("2024-10-13 trio + 2024-01-02 pair", `SELECT id, created_at, ROUND(total,2) total, rk FROM
(SELECT id, created_at, total, RANK() OVER (ORDER BY created_at) rk FROM orders)
WHERE created_at IN ('2024-10-13','2024-01-02') ORDER BY created_at, total DESC`);
show("rank after 2024-05-12 trio", `SELECT MIN(rk) next_rk FROM
(SELECT id, created_at, RANK() OVER (ORDER BY created_at) rk FROM orders)
WHERE created_at > '2024-05-12'`);
show("date rk34 empty check", `SELECT COUNT(*) n FROM
(SELECT id, created_at, RANK() OVER (ORDER BY created_at) rk FROM orders)
WHERE rk = 34`);

// ---- B03 product-supplier champions (cs-1309) ----
show("per-supplier champions", `SELECT supplier, name, price, rn FROM
(SELECT s.name AS supplier, p.name, p.price,
        ROW_NUMBER() OVER (PARTITION BY p.supplier_id ORDER BY p.price DESC, p.id) rn
 FROM products p JOIN suppliers s ON s.id = p.supplier_id)
WHERE rn = 1 ORDER BY price DESC`);

// ---- B04 order_items unit_price edges (cs-1314 prose) ----
show("unit_price min + count=2", `SELECT MIN(unit_price) mn, SUM(unit_price = 2) eq2,
COUNT(*) n FROM order_items`);

// ---- B05 NTILE(4) ASC over the 14 order months (cs-1315 ASC claim) ----
show("ntile4 month spend ASC tile1", `SELECT mon, ROUND(s,2) spend, tile FROM
(SELECT strftime('%Y-%m', created_at) mon, SUM(total) s,
        NTILE(4) OVER (ORDER BY SUM(total) ASC) tile FROM orders GROUP BY mon)
WHERE tile = 1 ORDER BY s ASC`);

// ---- B06 alphabetical name ladder (cs-1296 'name rk 6 = Farid') ----
show("name ladder head", `SELECT name, RANK() OVER (ORDER BY name) rk FROM customers
ORDER BY rk LIMIT 7`);

// ---- B07 pending league head/tail (cs-1280 roster) ----
show("pending roster", `SELECT id, ROUND(total,2) total,
RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE status = 'pending'
ORDER BY rk LIMIT 5`);

// ---- B08 wave2/wave3 tops under NTILE(3) DESC over 16 (cs-1282) ----
show("ntile3 waves 2+3", `SELECT wave, COUNT(*) crew, ROUND(MAX(spend),2) top FROM
(SELECT SUM(o.total) spend, NTILE(3) OVER (ORDER BY SUM(o.total) DESC) wave
 FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
GROUP BY wave ORDER BY wave`);

// ---- B09 status blocks ranked by total: rk8 width (cs-1291 prose) ----
show("total-rank rk8 width", `SELECT COUNT(*) n FROM
(SELECT id, total, RANK() OVER (ORDER BY total DESC) rk FROM orders) WHERE rk = 8`);

// ---- B10 ASC NTILE(4) over orders (cs-1299 ASC-rk1 story) ----
show("ntile4 orders ASC tile1 span", `SELECT tile, COUNT(*) n, MIN(total) mn, MAX(total) mx FROM
(SELECT total, NTILE(4) OVER (ORDER BY total ASC) tile FROM orders)
GROUP BY tile ORDER BY tile`);

// ---- B11 order-count ASC dense ladder (cs-1300 ASC claim) ----
show("count ladder ASC dense", `SELECT n, MIN(drk) drk, COUNT(*) who FROM
(SELECT c.name, COUNT(*) n, DENSE_RANK() OVER (ORDER BY COUNT(*) ASC) drk
 FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name)
GROUP BY n ORDER BY n`);

// ---- B12 expense day-bucket count (cs-1284 wrong fold key) ----
show("expense distinct spent_on", `SELECT COUNT(DISTINCT spent_on) days FROM expenses`);
show("expense vendors per category", `SELECT category, COUNT(DISTINCT vendor) v FROM expenses GROUP BY category`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
