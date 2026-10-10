import { db } from "../src/lib/db";
async function main() {
  const rows = await db.$queryRawUnsafe(`
    SELECT i.id, i.number, i.status, i.amount_cents,
           COALESCE(SUM(p.amount_cents),0) AS paid
    FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
    GROUP BY i.id ORDER BY i.id`) as Array<Record<string, unknown>>;
  for (const r of rows) {
    const amt = Number(r.amount_cents), paid = Number(r.paid);
    const flag = (r.status === "paid" && paid !== amt) || (r.status === "open" && paid >= amt) || (r.status === "void" && paid > 0);
    console.log(`${String(r.id).padStart(2)} ${r.number} ${String(r.status).padEnd(5)} amt=${(amt/100).toFixed(2)} paid=${(paid/100).toFixed(2)} ${flag ? "  <-- CHECK" : ""}`);
  }
  await db.$disconnect();
}
main();
