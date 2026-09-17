import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-ha1.db", { readonly: true });
const show = (label: string, sql: string) => {
  try { const rows = db.query(sql).all(); console.log(`\n## ${label}`); for (const r of rows) console.log("  " + JSON.stringify(r)); }
  catch (e) { console.log(`\n## ${label}\n  ERR: ${e}`); }
};
show("265 gate300 count", "SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status != 'cancelled' GROUP BY m HAVING AVG(total) > 300)");
show("265 eq-cancelled", "SELECT strftime('%Y-%m', created_at) AS m, ROUND(AVG(total),2) AS a FROM orders WHERE status = 'cancelled' GROUP BY m");
show("265 lt-cancelled", "SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status < 'cancelled' GROUP BY m)");
show("265 sum-gate count", "SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status != 'cancelled' GROUP BY m HAVING SUM(total) > 350)");
show("265 year-bucket", "SELECT strftime('%Y', created_at) AS y, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY y ORDER BY avg_basket DESC");
show("265 order-by-const", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY month HAVING AVG(total) > 350 ORDER BY 'zz'");
show("266 correct", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY supplier_id HAVING avg_price >= 60 ORDER BY avg_price DESC");
show("266 full", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price, ROUND(SUM(price),2) AS s, ROUND(MAX(price),2) AS mx, ROUND(MIN(price),2) AS mn FROM products GROUP BY supplier_id ORDER BY avg_price DESC");
show("266 gate40", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY supplier_id HAVING avg_price >= 40 ORDER BY avg_price DESC");
show("269 MIN variant", "SELECT status, COUNT(*) AS orders, COALESCE(MIN(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status ORDER BY orders DESC");
show("269 SUM variant", "SELECT status, COUNT(*) AS orders, COALESCE(SUM(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status ORDER BY orders DESC");
show("269 gate7", "SELECT status, COUNT(*) AS orders, COALESCE(MAX(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status HAVING COUNT(*) >= 7 ORDER BY orders DESC");
show("269 gate14", "SELECT status, COUNT(*) AS orders, COALESCE(MAX(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status HAVING COUNT(*) >= 14 ORDER BY orders DESC");
show("269 alias-in-having", "SELECT status, COUNT(*) AS orders, COALESCE(MAX(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status HAVING orders >= 8 ORDER BY orders DESC");
// expenses exploration for cs-267
show("exp by category", "SELECT category, COUNT(*) AS n, SUM(amount_cents) AS cents FROM expenses GROUP BY category ORDER BY n DESC");
show("exp top5 rent", "SELECT vendor, spent_on, amount_cents FROM expenses WHERE category = 'Rent' ORDER BY amount_cents DESC, spent_on ASC");
show("exp top5 ads", "SELECT vendor, spent_on, amount_cents FROM expenses WHERE category = 'Ads' ORDER BY amount_cents DESC, spent_on ASC LIMIT 5");
show("exp ads ties", "SELECT amount_cents, COUNT(*) FROM expenses WHERE category = 'Ads' GROUP BY amount_cents ORDER BY 2 DESC");
show("exp tools", "SELECT vendor, spent_on, amount_cents FROM expenses WHERE category = 'Tools' ORDER BY amount_cents DESC, spent_on ASC LIMIT 5");
show("exp categories list", "SELECT DISTINCT category FROM expenses ORDER BY category");
show("exp big slice", "SELECT COUNT(*) AS n FROM expenses WHERE amount_cents >= 100000");
show("exp top5 big", "SELECT category, vendor, amount_cents FROM expenses WHERE amount_cents >= 100000 ORDER BY amount_cents DESC, spent_on ASC LIMIT 5");
show("exp tiebreak probe", "SELECT vendor, amount_cents FROM expenses WHERE category = 'Rent' ORDER BY amount_cents DESC");
db.close();
