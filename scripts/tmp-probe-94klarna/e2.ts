import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
const q = (sql: string) => { try { return JSON.stringify(db.query(sql).all()); } catch (e: any) { return "ERR: " + e.message; } };
const board = (f1: string, f2: string, f3: string, f4: string, f5: string) =>
  `SELECT id, days FROM (SELECT id, days, ${f1}() OVER (ORDER BY days) AS rnk FROM (SELECT i.id AS id, CAST(JULIANDAY(${f2}(p.paid_on)) - JULIANDAY(i.${f3}) AS INTEGER) AS days FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id, i.${f3})) WHERE rnk <= ${f4} ORDER BY days ${f5}, id ASC`;
console.log("MAXwin:", q(board("MAX","MIN","issued_on","5","ASC")));
console.log("ROWNUM misuse:", q(board("DENSE_RANK","ROW_NUMBER","issued_on","5","ASC")));
console.log("rnk<=DESC:", q(board("DENSE_RANK","MIN","issued_on","DESC","ASC")));
console.log("rnk<=due_on:", q(board("DENSE_RANK","MIN","issued_on","due_on","ASC")));
console.log("orddays3:", q(board("DENSE_RANK","MIN","issued_on","5","3")));
console.log("i.DESC:", q(board("DENSE_RANK","MIN","DESC","5","ASC")));
console.log("DESCfold:", q(board("DENSE_RANK","DESC","issued_on","5","ASC")));
console.log("MAXall:", q(board("MAX","MAX","issued_on","5","ASC")));
db.close(); console.log("E2 done");
