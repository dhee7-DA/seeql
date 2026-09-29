import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";
import { casesN5 } from "/home/z/my-project/src/lib/curriculum/cases/cases-n5";
copyFileSync("/home/z/my-project/db/custom.db", "/tmp/probe.db");
const db = new Database("/tmp/probe.db", { readonly: true });
const c = casesN5.find(x => x.id === "cs-1880")!;
const filled = c.template.replace(/\{(\d+)\}/g, (_, n) => c.slots[Number(n) - 1].answer);
console.log(filled);
try { const r = db.query(filled).all(); console.log("OK", r.length); } catch (e) { console.log("ERR", String(e).slice(0, 200)); }
