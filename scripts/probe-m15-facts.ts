// Probe payload shapes + SQLite edge behaviors for Module 15 authoring.
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const q = async (sql: string) => db.$queryRawUnsafe(sql);

console.log("sources:", await q("SELECT source, COUNT(*) n FROM webhook_events GROUP BY source"));
console.log("checkout sample:", JSON.stringify(await q(`SELECT payload FROM webhook_events WHERE source = 'checkout' LIMIT 1`)));
console.log("billing sample:", JSON.stringify(await q(`SELECT payload FROM webhook_events WHERE source = 'billing' LIMIT 1`)));
console.log("kyc sample:", JSON.stringify(await q(`SELECT payload FROM webhook_events WHERE source = 'kyc' LIMIT 1`)));
console.log("dirty money types:", await q("SELECT typeof(amount_cents) t, COUNT(*) n FROM events_dirty GROUP BY t"));
console.log("dirty user types:", await q("SELECT typeof(user_id) t, COUNT(*) n FROM events_dirty GROUP BY t"));
console.log("indexes:", await q("SELECT COUNT(*) n FROM sqlite_master WHERE type = 'index'"));
const tables = (await q("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")) as Array<{ name: string }>;
console.log("tables:", tables.map((r) => r.name).join(","));
console.log("cast probes:", await q(`SELECT CAST('12abc' AS INTEGER) a, CAST('abc' AS INTEGER) b, CAST(NULL AS INTEGER) c, CAST('129.90' AS INTEGER) d`));
console.log("month clamp:", await q(`SELECT date('2025-01-31', '+1 month') m`));
console.log("region order totals:", await q(`SELECT c.region, MAX(o.total) mx, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region`));
console.log("paid by region:", await q(`SELECT c.region, COUNT(i.id) n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' GROUP BY c.region ORDER BY n DESC, c.region`));
console.log("customers no invoices:", await q(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)`));
console.log("open invoices:", await q(`SELECT COUNT(*) n FROM invoices WHERE status = 'open'`));
console.log("wire pays:", await q(`SELECT COUNT(*) n FROM payments WHERE method = 'wire'`));
console.log("delivered lag:", await q(`SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 1) lag FROM orders WHERE status = 'delivered' AND shipped_at IS NOT NULL`));
console.log("regions U:", await q(`SELECT DISTINCT region FROM customers WHERE region LIKE '%U%'`));
console.log("months invoiced:", await q(`SELECT COUNT(DISTINCT strftime('%Y-%m', issued_on)) m FROM invoices`));
console.log("top3 per region check:", await q(`SELECT region, number, issued_on FROM (SELECT c.region, i.number, i.issued_on, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY i.issued_on DESC, i.id) rn FROM invoices i JOIN customers c ON c.id = i.customer_id) WHERE rn <= 3 ORDER BY region, issued_on DESC`));
await db.$disconnect();
