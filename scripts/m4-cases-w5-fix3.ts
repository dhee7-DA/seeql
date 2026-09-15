// Third fix-probe batch: cs-1112 redesign distractor safety (spent_on/id groups).
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("R1 spent_on+amount dup pairs:", q(`SELECT vendor, spent_on, amount_cents, COUNT(*) n FROM expenses GROUP BY spent_on, amount_cents HAVING COUNT(*) > 1`));
console.log("R2 vendor+spent_on dup pairs:", q(`SELECT vendor, spent_on, COUNT(*) n, GROUP_CONCAT(DISTINCT amount_cents) amounts FROM expenses GROUP BY vendor, spent_on HAVING COUNT(*) > 1`));
console.log("R3 id+amount groups>1:", q(`SELECT COUNT(*) n FROM (SELECT id FROM expenses GROUP BY id, amount_cents HAVING COUNT(*) > 1)`));
console.log("R4 vendor+id groups>1:", q(`SELECT COUNT(*) n FROM (SELECT id FROM expenses GROUP BY vendor, id HAVING COUNT(*) > 1)`));
console.log("R5 category+amount bare-vendor resolve:", q(`SELECT COUNT(*) n FROM expenses WHERE (vendor, amount_cents) IN (SELECT vendor, amount_cents FROM expenses GROUP BY category, amount_cents HAVING COUNT(*) > 1)`));
