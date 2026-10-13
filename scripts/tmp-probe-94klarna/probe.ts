// ONE read-only probe batch for klarna 3x expansion. Deleted after use.
import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
const q = (sql: string) => { try { return db.query(sql).all(); } catch (e: any) { return "ERR: " + e.message; } };

console.log("== schema ==");
console.log(q("SELECT sql FROM sqlite_master WHERE name IN ('invoices','payments')"));

console.log("\n== A. j5 unpaid plans (LEFT JOIN IS NULL) ==");
console.log(q(`SELECT i.id, i.status, i.amount_cents FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY i.amount_cents DESC`));
console.log("sum:", q(`SELECT COUNT(*) n, SUM(i.amount_cents) s FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`));
console.log("INNER flip:", q(`SELECT COUNT(*) n, SUM(i.amount_cents) s FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`));
console.log("RIGHT+IS NULL flip:", q(`SELECT COUNT(*) n FROM invoices i RIGHT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL`));
console.log("NOT NULL flip:", q(`SELECT COUNT(*) n, SUM(i.amount_cents) s FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NOT NULL`));
console.log("p.id=i.id join flip:", q(`SELECT COUNT(*) n, SUM(i.amount_cents) s FROM invoices i LEFT JOIN payments p ON p.id = i.id WHERE p.invoice_id IS NULL`));
console.log("plan_id col (expect ERR):", q(`SELECT COUNT(*) FROM invoices i LEFT JOIN payments p ON p.plan_id = i.id`));
console.log("/1000 flip:", q(`SELECT ROUND(SUM(i.amount_cents)/1000.0,2) s FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL`));

console.log("\n== B. x3 rail stack ==");
const stack = `SELECT p.method, COUNT(*) AS installments, ROUND(SUM(p.amount_cents)/100.0,2) AS usd FROM payments p GROUP BY p.method`;
console.log(q(stack));
console.log("stack+total:", q(stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p ORDER BY usd DESC`));
console.log("UNION (dedupe check):", q(stack + ` UNION SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p ORDER BY usd DESC`));
console.log("INTERSECT flip:", q(stack + ` INTERSECT SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p`));
console.log("EXCEPT flip:", q(stack + ` EXCEPT SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p ORDER BY usd DESC`));
console.log("'card' arm flip:", q(stack + ` UNION ALL SELECT 'card', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p ORDER BY usd DESC`));
console.log("SUM(id) flip:", q(`SELECT p.method, COUNT(*), ROUND(SUM(p.id)/100.0,2) usd FROM payments p GROUP BY p.method UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.id)/100.0,2) FROM payments p ORDER BY usd DESC`));
console.log("SUM(method) flip:", q(`SELECT p.method, COUNT(*), ROUND(SUM(p.method)/100.0,2) usd FROM payments p GROUP BY p.method`));
console.log("ORDER BY method DESC flip:", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY method DESC`));
console.log("ORDER BY installments DESC (equiv check):", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY installments DESC`));
console.log("LIMIT 1:", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY usd DESC LIMIT 1`));
console.log("LIMIT 2:", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY usd DESC LIMIT 2`));
console.log("LIMIT 3 vs none (equiv check):", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY usd DESC LIMIT 3`));
console.log("LIMIT 0:", q(`SELECT * FROM (` + stack + ` UNION ALL SELECT 'TOTAL', COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p) ORDER BY usd DESC LIMIT 0`));
console.log("SELECT 1 AS method flip:", q(stack + ` UNION ALL SELECT 1, COUNT(*), ROUND(SUM(p.amount_cents)/100.0,2) FROM payments p ORDER BY usd DESC`));

console.log("\n== C. t5 days-to-collect board ==");
const board = (cut: number, dir: string, anchor: string, fold: string, joinKey: string) =>
  `SELECT id, days FROM (SELECT id, days, DENSE_RANK() OVER (ORDER BY days) AS rnk FROM (SELECT i.id AS id, CAST(JULIANDAY(${fold}(p.paid_on)) - JULIANDAY(i.${anchor}) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.${joinKey} = i.id GROUP BY i.id, i.${anchor})) WHERE rnk <= ${cut} ORDER BY days ${dir}, id ASC`;
console.log("full 20 rows:", q(`SELECT i.id, CAST(JULIANDAY(MIN(p.paid_on)) - JULIANDAY(i.issued_on) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id, i.issued_on ORDER BY days ASC, i.id ASC`));
console.log("top5:", q(board(5, "ASC", "issued_on", "MIN", "invoice_id")));
console.log("cut 3:", q(board(3, "ASC", "issued_on", "MIN", "invoice_id")));
console.log("cut 7:", q(board(7, "ASC", "issued_on", "MIN", "invoice_id")));
console.log("DESC flip:", q(board(5, "DESC", "issued_on", "MIN", "invoice_id")));
console.log("due_on anchor flip:", q(board(5, "ASC", "due_on", "MIN", "invoice_id")));
console.log("paid_on anchor (expect ERR if no col):", q(board(5, "ASC", "paid_on", "MIN", "invoice_id")));
console.log("MAX fold flip:", q(board(5, "ASC", "issued_on", "MAX", "invoice_id")));
console.log("AVG fold flip:", q(board(5, "ASC", "issued_on", "AVG", "invoice_id")));
console.log("p.id join flip:", q(board(5, "ASC", "issued_on", "MIN", "id")));
console.log("julianday(3) NULL-days flip:", q(board(5, "ASC", "issued_on", "3", "invoice_id")));
console.log("tie check (dup days among all 20?):", q(`SELECT days, COUNT(*) c FROM (SELECT CAST(JULIANDAY(MIN(p.paid_on)) - JULIANDAY(i.issued_on) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id=i.id GROUP BY i.id) GROUP BY days HAVING c > 1`));
console.log("ROW_NUMBER vs DENSE_RANK top5 equivalence:", q(`SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY days) rn FROM (SELECT i.id AS id, CAST(JULIANDAY(MIN(p.paid_on)) - JULIANDAY(i.issued_on) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id=i.id GROUP BY i.id, i.issued_on)) WHERE rn <= 5 ORDER BY id`), q(`SELECT id FROM (SELECT id, DENSE_RANK() OVER (ORDER BY days) rn FROM (SELECT i.id AS id, CAST(JULIANDAY(MIN(p.paid_on)) - JULIANDAY(i.issued_on) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id=i.id GROUP BY i.id, i.issued_on)) WHERE rn <= 5 ORDER BY id`));

console.log("\n== D. q6 coverage census ==");
const census = (joinArm: string, nullFill: string, partialArm: string, div: string, dir: string) =>
  `WITH folds AS (SELECT i.id AS plan_id, i.amount_cents, ${nullFill}(SUM(p.amount_cents), 0) AS paid_cents FROM invoices i ${joinArm} JOIN payments p ON p.invoice_id = i.id GROUP BY i.id, i.amount_cents), classes AS (SELECT plan_id, amount_cents, paid_cents, CASE WHEN paid_cents = 0 THEN 'none' WHEN ${partialArm} THEN 'partial' ELSE 'exact' END AS coverage FROM folds) SELECT coverage, COUNT(*) AS plans, ROUND(SUM(amount_cents)/${div}, 2) AS promised_usd FROM classes GROUP BY coverage ORDER BY plans ${dir}`;
console.log("census correct:", q(census("LEFT", "COALESCE", "paid_cents < amount_cents", "100.0", "DESC")));
console.log("no COALESCE flip:", q(`WITH folds AS (SELECT i.id AS plan_id, i.amount_cents, SUM(p.amount_cents) AS paid_cents FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id, i.amount_cents), classes AS (SELECT plan_id, amount_cents, paid_cents, CASE WHEN paid_cents = 0 THEN 'none' WHEN paid_cents < amount_cents THEN 'partial' ELSE 'exact' END AS coverage FROM folds) SELECT coverage, COUNT(*) AS plans, ROUND(SUM(amount_cents)/100.0,2) AS promised_usd FROM classes GROUP BY coverage ORDER BY plans DESC`));
console.log("INNER flip:", q(census("INNER", "COALESCE", "paid_cents < amount_cents", "100.0", "DESC")));
console.log("<= arm flip:", q(census("LEFT", "COALESCE", "paid_cents <= amount_cents", "100.0", "DESC")));
console.log("amount<amount arm flip:", q(census("LEFT", "COALESCE", "amount_cents < amount_cents", "100.0", "DESC")));
console.log("1000 div flip:", q(census("LEFT", "COALESCE", "paid_cents < amount_cents", "1000.0", "DESC")));
console.log("ASC flip:", q(census("LEFT", "COALESCE", "paid_cents < amount_cents", "100.0", "ASC")));
console.log("0 div (expect ERR):", q(census("LEFT", "COALESCE", "paid_cents < amount_cents", "0", "DESC")));
console.log("0-as-arm flip:", q(census("LEFT", "COALESCE", "0 < amount_cents", "100.0", "DESC")));

console.log("\n== E. misc figures for prose ==");
console.log("MAX(paid_on) ref date:", q(`SELECT MAX(paid_on) FROM payments`));
console.log("late per rail:", q(`SELECT p.method, SUM(CASE WHEN p.paid_on > i.due_on THEN 1 ELSE 0 END) late, COUNT(*) n FROM payments p JOIN invoices i ON i.id = p.invoice_id GROUP BY p.method`));
console.log("split plans sum:", q(`SELECT SUM(amount_cents) FROM invoices WHERE id IN (1,5,12,19,22)`));
console.log("matched-plans sum (NOT NULL world):", q(`SELECT SUM(i.amount_cents) FROM invoices i WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`));
console.log("cross join 756 check:", q(`SELECT COUNT(*) FROM payments p JOIN invoices i ON i.id = i.id`));
console.log("p.id=i.id matches:", q(`SELECT COUNT(*) FROM payments p JOIN invoices i ON p.id = i.id`));
console.log("unpaid /1000:", q(`SELECT ROUND(15217.0/1000,2)`));
db.close();
