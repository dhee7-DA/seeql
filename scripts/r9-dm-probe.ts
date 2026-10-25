// Round 9 — probe the Retail & RFM world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_RETAIL_SCHEMA } from "../src/lib/leetcode/content/dm-retail-schema";
import { DM_RETAIL_SEED } from "../src/lib/leetcode/content/dm-retail-seed";

const db = new Database(":memory:");
db.exec(DM_RETAIL_SCHEMA.ddl);
db.exec(DM_RETAIL_SEED);
const q = (sql: string): Record<string, unknown>[] => db.prepare(sql).all();
const one = (sql: string): number => Object.values(db.prepare(sql).get() ?? {})[0] as number;

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " · " + detail : ""}`);
};

console.log("== epoch openers ==");
for (const [ts, want] of [[1784505600, "2026-07-20"], [1784592000, "2026-07-21"], [1784678400, "2026-07-22"], [1784764800, "2026-07-23"]] as const) {
  const got = (q(`SELECT strftime('%Y-%m-%d', ${ts}, 'unixepoch') d`)[0] as { d: string }).d;
  check(`epoch ${ts} = ${want}`, got === want, got);
}

console.log("== counts ==");
check("customers = 12", one("SELECT COUNT(*) FROM customers") === 12);
check("products = 14", one("SELECT COUNT(*) FROM products") === 14);
check("orders = 56", one("SELECT COUNT(*) FROM orders") === 56);
const status = q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`);
console.log("  statuses:", JSON.stringify(status));
check("items = 108", one("SELECT COUNT(*) FROM order_items") === 108);
check("events = 72", one("SELECT COUNT(*) FROM events") === 72);
check("returns = 12", one("SELECT COUNT(*) FROM returns") === 12);

console.log("== planted: C5 = C7 mirror tie ==");
const rev = q(`
  SELECT o.customer_id,
         SUM(oi.quantity * oi.unit_price_cents) gross,
         SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents, 0)) net
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id ORDER BY o.customer_id`) as Array<{ customer_id: number; gross: number; net: number }>;
console.table(rev);
const c5 = rev.find((r) => r.customer_id === 5)!;
const c7 = rev.find((r) => r.customer_id === 7)!;
check("C5 gross = C7 gross", c5.gross === c7.gross, `${c5.gross} vs ${c7.gross}`);
check("C5 net = C7 net", c5.net === c7.net, `${c5.net} vs ${c7.net}`);
const c8 = rev.find((r) => r.customer_id === 8)!;
const c9 = rev.find((r) => r.customer_id === 9)!;
check("C8 gross = C9 gross (bonus tie)", c8.gross === c9.gross, `${c8.gross} vs ${c9.gross}`);

console.log("== planted: daily delivered revenue tie 04-15 vs 05-25 ==");
const daily = q(`
  SELECT o.order_date, SUM(oi.quantity * oi.unit_price_cents) gross
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date`) as Array<{ order_date: string; gross: number }>;
const ties = daily.filter((d) => daily.filter((x) => x.gross === d.gross).length > 1);
console.log("  tied day-gross values:", JSON.stringify(ties));
const d1 = daily.find((d) => d.order_date === "2026-04-15")!;
const d2 = daily.find((d) => d.order_date === "2026-05-25")!;
check("04-15 = 05-25 = 8900", d1.gross === 8900 && d2.gross === 8900, `${d1?.gross} / ${d2?.gross}`);
const maxDay = daily.reduce((a, b) => (b.gross > a.gross ? b : a));
console.log("  biggest delivered day:", JSON.stringify(maxDay));

console.log("== planted: data traps ==");
check("C11 never orders", one("SELECT COUNT(*) FROM orders WHERE customer_id = 11") === 0,
  `${one("SELECT COUNT(*) FROM orders WHERE customer_id = 11")} orders`);
check("product 12 never sold", one("SELECT COUNT(*) FROM order_items WHERE product_id = 12") === 0);
const drift = one(`SELECT COUNT(*) FROM order_items oi JOIN products p ON p.product_id = oi.product_id
  WHERE oi.unit_price_cents <> p.price_cents`);
check("unit-price drift rows = 3", drift === 3, `${drift}`);
const disc = one("SELECT COUNT(*) FROM order_items WHERE discount_cents IS NOT NULL");
check("discounted rows = 11", disc === 11, `${disc}`);
const dup = q(`SELECT order_id, product_id, COUNT(*) n FROM order_items GROUP BY order_id, product_id HAVING n > 1`);
check("duplicate product line only in order 104", dup.length === 1 && dup[0].order_id === 104 && dup[0].product_id === 3, JSON.stringify(dup));

console.log("== planted: events shapes ==");
const gap = one(`SELECT event_ts - (SELECT event_ts FROM events WHERE event_id = 4) FROM events WHERE event_id = 5`);
check("C1 session gap = 2700s", gap === 2700, `${gap}s`);
const burst = one(`SELECT COUNT(*) FROM events WHERE customer_id = 2 AND event_type = 'cart'
  AND event_ts BETWEEN 1784592000 + 43200 AND 1784592000 + 43200 + 300`);
check("C2 burst = 4 carts in 5 min", burst === 4, `${burst}`);
const c3odd = one(`SELECT COUNT(*) FROM events WHERE customer_id = 3 AND event_ts >= 1784505600 AND event_ts < 1784592000
  AND event_type = 'checkout'`);
check("C3 07-20 bare checkout", c3odd === 1, `${c3odd}`);
const c6drop = one(`SELECT COUNT(*) FROM events WHERE customer_id = 6 AND event_ts >= 1784678400 AND event_ts < 1784764800
  AND event_type = 'cart'`) - one(`SELECT COUNT(*) FROM events WHERE customer_id = 6 AND event_ts >= 1784678400 AND event_ts < 1784764800
  AND event_type = 'checkout'`);
check("C6 07-22 cart-no-checkout", c6drop === 1, `delta ${c6drop}`);
const c11views = one(`SELECT COUNT(*) FROM events WHERE customer_id = 11 AND event_type = 'view'`);
check("C11 views = 7 (fix comment if not)", c11views === 7, `${c11views}`);
const evTypes = q(`SELECT event_type, COUNT(*) n FROM events GROUP BY event_type ORDER BY event_type`);
console.log("  event types:", JSON.stringify(evTypes));

console.log("== planted: returns ==");
const retCust = q(`SELECT o.customer_id, COUNT(*) n FROM returns r
  JOIN order_items oi ON oi.order_item_id = r.order_item_id
  JOIN orders o ON o.order_id = oi.order_id GROUP BY o.customer_id ORDER BY n DESC`) as Array<{ customer_id: number; n: number }>;
console.log("  returns by customer:", JSON.stringify(retCust));
check("C3 returns = 5", retCust[0].customer_id === 3 && retCust[0].n === 5);
const reasons = q(`SELECT reason, COUNT(*) n FROM returns GROUP BY reason ORDER BY reason`);
console.log("  reasons:", JSON.stringify(reasons));

console.log("== shapes for content ==");
console.log("  regions:", JSON.stringify(q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC`)));
console.log("  zero-order customers:", JSON.stringify(q(`SELECT customer_id FROM customers c
    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`)));
console.log("  signup cohorts:", JSON.stringify(q(`SELECT strftime('%Y-%m', signup_date) m, COUNT(*) n FROM customers
    GROUP BY m ORDER BY m`)));
console.log("  orders per month:", JSON.stringify(q(`SELECT strftime('%Y-%m', order_date) m, COUNT(*) n FROM orders
    GROUP BY m ORDER BY m`)));
console.log("  categories:", JSON.stringify(q(`SELECT category, COUNT(DISTINCT p.product_id) prods,
    SUM(oi.quantity) units FROM products p LEFT JOIN order_items oi ON oi.product_id = p.product_id
    GROUP BY category ORDER BY category`)));
console.log("  event day counts:", JSON.stringify(q(`SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') d, COUNT(*) n
    FROM events GROUP BY d ORDER BY d`)));
console.log("  distinct pages:", JSON.stringify(q(`SELECT COUNT(DISTINCT page) n FROM events`)));

db.close();
console.log(fails === 0 ? "\nALL PROBES PASS — seed is trustworthy" : `\n${fails} PROBE(S) FAILED — fix the seed`);
