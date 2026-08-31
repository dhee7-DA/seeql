// Ground-truth probe: prints the real numbers in the sandbox DB so every
// new MCQ, problem solution and case study can cite true values.
// Run: cd /home/z/my-project && bun scripts/probe-foundations.ts
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const slim = rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]),
      ),
    );
    console.log(`\n## ${label}`);
    console.log(JSON.stringify(slim.slice(0, 40)));
    if (rows.length > 40) console.log(`… ${rows.length} rows total`);
  } catch (e) {
    console.log(`\n## ${label}\nERROR: ${(e as Error).message}`);
  }
};

async function main() {
  await ensureDatabase();

  await q("customers overview", `SELECT COUNT(*) n, SUM(is_active=1) active,
    SUM(is_active=0) inactive, SUM(email IS NULL) null_email, SUM(phone IS NULL) null_phone,
    SUM(lifetime_value IS NULL) null_ltv, MIN(lifetime_value) min_ltv, MAX(lifetime_value) max_ltv,
    ROUND(AVG(lifetime_value),2) avg_ltv, MIN(signup_date) min_signup, MAX(signup_date) max_signup
    FROM customers`);
  await q("dup emails", `SELECT COUNT(*) FROM customers WHERE email IS NOT NULL
    GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1`);
  await q("country variants top", `SELECT country, COUNT(*) n FROM customers GROUP BY country ORDER BY n DESC, country LIMIT 14`);
  await q("city variants top", `SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 14`);
  await q("tier variants", `SELECT loyalty_tier, COUNT(*) n FROM customers GROUP BY loyalty_tier ORDER BY n DESC`);
  await q("active US customers", `SELECT COUNT(*) FROM customers WHERE is_active=1 AND country='US'`);
  await q("gmail share", `SELECT COUNT(*) FROM customers WHERE email LIKE '%@gmail.com'`);
  await q("like nyc", `SELECT city, COUNT(*) n FROM customers WHERE city LIKE '%new york%' OR city LIKE '%NYC%' GROUP BY city`);

  await q("products overview", `SELECT COUNT(*) n, SUM(price IS NULL) null_price, SUM(price=0) zero_price,
    MIN(price) min_p, MAX(price) max_p, ROUND(AVG(price),2) avg_p, SUM(cost>price) cost_gt_price,
    SUM(stock_quantity<0) neg_stock, SUM(stock_quantity IS NULL) null_stock, MIN(stock_quantity) min_s, MAX(stock_quantity) max_s
    FROM products`);
  await q("category variants top", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC LIMIT 16`);
  await q("electronics variants", `SELECT category, COUNT(*) n FROM products WHERE LOWER(TRIM(category)) LIKE '%electr%' GROUP BY category`);
  await q("inventory value", `SELECT ROUND(SUM(price*stock_quantity),2) v FROM products`);
  await q("margins", `SELECT ROUND(AVG(price-cost),2) avg_margin, SUM(price-cost<=0) loss_makers FROM products WHERE price IS NOT NULL AND cost IS NOT NULL`);
  await q("supplier variants top", `SELECT supplier, COUNT(*) n FROM products GROUP BY supplier ORDER BY n DESC LIMIT 12`);

  await q("orders overview", `SELECT COUNT(*) n, SUM(customer_id IS NULL) null_cust, MIN(order_date) min_d,
    MAX(order_date) max_d, ROUND(AVG(total_amount),2) avg_total, MIN(total_amount) min_total,
    MAX(total_amount) max_total, SUM(total_amount IS NULL) null_total, SUM(is_gift=1) gifts,
    SUM(is_gift=0) not_gifts, SUM(is_gift IS NULL) null_gift FROM orders`);
  await q("status variants", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`);
  await q("payment variants", `SELECT payment_method, COUNT(*) n FROM orders GROUP BY payment_method ORDER BY n DESC`);
  await q("orphan cust 999", `SELECT COUNT(*) FROM orders WHERE customer_id=999`);
  await q("orphan not in customers", `SELECT COUNT(*) FROM orders o WHERE o.customer_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.id=o.customer_id)`);
  await q("delivered stats", `SELECT COUNT(*) n, ROUND(AVG(total_amount),2) avg_t, SUM(total_amount) sum_t FROM orders WHERE status='delivered'`);
  await q("cancelld stats", `SELECT COUNT(*) n, ROUND(SUM(total_amount),2) lost FROM orders WHERE status='cancelld'`);
  await q("2025 Q1 delivered", `SELECT COUNT(*) n FROM orders WHERE order_date BETWEEN '2025-01-01' AND '2025-03-31' AND status='delivered'`);
  await q("orders per status>avg", `SELECT COUNT(*) FROM (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL GROUP BY customer_id HAVING COUNT(*) > (SELECT ROUND(AVG(cnt),0) FROM (SELECT COUNT(*) cnt FROM orders WHERE customer_id IS NOT NULL GROUP BY customer_id)))`);
  await q("gift delivered", `SELECT COUNT(*) FROM orders WHERE is_gift=1 AND status='delivered'`);
  await q("null totals", `SELECT COUNT(*) FROM orders WHERE total_amount IS NULL`);

  await q("order_items overview", `SELECT COUNT(*) n, SUM(order_id IS NULL) null_order, SUM(product_id IS NULL) null_prod,
    SUM(quantity IS NULL) null_qty, SUM(quantity<=0) bad_qty, MIN(quantity) min_q, MAX(quantity) max_q,
    ROUND(AVG(quantity),2) avg_q, SUM(discount IS NULL) null_disc, MIN(unit_price) min_up, MAX(unit_price) max_up
    FROM order_items`);
  await q("discount values", `SELECT discount, COUNT(*) n FROM order_items GROUP BY discount ORDER BY n DESC`);
  await q("orphan order ids", `SELECT COUNT(*) FROM order_items oi WHERE oi.order_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.id=oi.order_id)`);
  await q("orphan product ids", `SELECT COUNT(*) FROM order_items oi WHERE oi.product_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM products p WHERE p.id=oi.product_id)`);
  await q("big discounts", `SELECT COUNT(*) FROM order_items WHERE discount >= 1`);
  await q("lines per order top", `SELECT order_id, COUNT(*) n FROM order_items GROUP BY order_id ORDER BY n DESC LIMIT 5`);
  await q("avg line discount small", `SELECT ROUND(AVG(discount),4) avg_d FROM order_items WHERE discount < 1`);

  await q("reviews overview", `SELECT COUNT(*) n, SUM(rating IS NULL) null_rating, MIN(rating) min_r, MAX(rating) max_r,
    ROUND(AVG(rating),2) avg_r, SUM(review_date >= '2030-01-01') future_dates, SUM(body IS NULL) null_body,
    SUM(title IS NULL) null_title, SUM(customer_id IS NULL) null_cust, SUM(product_id IS NULL) null_prod
    FROM reviews`);
  await q("rating histogram", `SELECT rating, COUNT(*) n FROM reviews GROUP BY rating ORDER BY rating`);
  await q("orphan review products", `SELECT COUNT(*) FROM reviews r WHERE r.product_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM products p WHERE p.id=r.product_id)`);
  await q("spam bodies", `SELECT COUNT(*) FROM reviews WHERE body LIKE '%GREAT PRODUCT%'`);
  await q("1-star titles", `SELECT COUNT(*) FROM reviews WHERE rating=1`);
  await q("valid ratings only avg", `SELECT COUNT(*) n, ROUND(AVG(rating),2) avg_r FROM reviews WHERE rating BETWEEN 1 AND 5`);
  await q("null body", `SELECT COUNT(*) FROM reviews WHERE body IS NULL OR TRIM(body)=''`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
