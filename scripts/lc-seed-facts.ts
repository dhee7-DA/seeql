// Seed facts probe — direct sqlite read of db/custom.db (already seeded).
import Database from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
const one = (sql: string): string => {
  const r = db.prepare(sql).get() as Record<string, unknown> | undefined;
  return Object.values(r ?? {}).join("/");
};
const out: string[] = [];
out.push("products=" + one("SELECT COUNT(*) FROM products"));
out.push("suppliers=" + one("SELECT COUNT(*) FROM suppliers"));
out.push("customers=" + one("SELECT COUNT(*) FROM customers"));
out.push("orders=" + one("SELECT COUNT(*) FROM orders"));
out.push("order_items=" + one("SELECT COUNT(*) FROM order_items"));
out.push("custNoOrders=" + one("SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE o.id IS NULL"));
out.push("invOpen=" + one("SELECT COUNT(*) FROM invoices WHERE status='open'"));
out.push("invPaid=" + one("SELECT COUNT(*) FROM invoices WHERE status='paid'"));
out.push("payTotal=" + one("SELECT ROUND(SUM(amount_cents)/100.0,2) FROM payments"));
out.push("expenses=" + one("SELECT COUNT(*) || ' for ' || ROUND(SUM(amount_cents)/100.0,2) FROM expenses"));
out.push("prodNeverOrdered=" + one("SELECT COUNT(*) FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id WHERE oi.id IS NULL"));
out.push("regionPairs=" + one("SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id < b.id"));
out.push("regions=" + db.prepare("SELECT region || ':' || COUNT(*) FROM customers GROUP BY region ORDER BY region").all().map((r: any) => Object.values(r).join("")).join(" "));
out.push("ledger=" + one("SELECT COUNT(*) FROM ledger_entries"));
out.push("shipNull=" + one("SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL"));
out.push("revenue=" + one("SELECT ROUND(SUM(total),2) FROM orders"));
out.push("itemsRev=" + one("SELECT ROUND(SUM(quantity*unit_price),2) FROM order_items"));
out.push("cust24=" + one("SELECT COUNT(*) FROM orders WHERE customer_id=1"));
out.push("inactiveCust=" + one("SELECT COUNT(*) FROM customers WHERE active=0"));
out.push("inactiveWithOrders=" + one("SELECT COUNT(*) FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.active=0"));
out.push("pendingTot=" + one("SELECT ROUND(SUM(total),2) FROM orders WHERE status='pending'"));
out.push("cats=" + one("SELECT COUNT(DISTINCT category) FROM products"));
out.push("months=" + one("SELECT COUNT(DISTINCT SUBSTR(created_at,1,7)) FROM orders"));
out.push("unshippedPending=" + one("SELECT COUNT(*) FROM orders WHERE status='pending' AND shipped_at IS NULL"));
out.push("shippedNoDate=" + one("SELECT COUNT(*) FROM orders WHERE shipped_at IS NOT NULL AND status='pending'"));
console.log(out.join("\n"));
db.close();
