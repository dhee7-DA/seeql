// Truth probe for the lesson-44 transaction 3D scene (w44-atomic-space-3d).
// Every number rendered in the scene must come from this run.
// Acts on a throwaway COPY of db/custom.db — the real store file is never opened for write.
import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

mkdirSync("scripts/tmp", { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  const src = `db/custom.db${suffix}`;
  if (existsSync(src)) copyFileSync(src, `scripts/tmp/tx-probe.db${suffix}`);
}
const db = new Database("scripts/tmp/tx-probe.db"); // writable COPY

// ---------- Part 1: the real store, inside BEGIN … ROLLBACK (the sandbox tie-in) ----------
console.log("== real store: one graded write, wrapped and rolled back ==");
const p1before = db.query("SELECT id, name, stock FROM products WHERE id = 1").get();
console.log("before:", p1before);
db.exec("BEGIN");
db.query("UPDATE products SET stock = stock + 5 WHERE id = 1").run();
const p1inside = db.query("SELECT id, name, stock FROM products WHERE id = 1").get();
console.log("inside txn (after UPDATE, uncommitted):", p1inside);
db.exec("ROLLBACK");
const p1after = db.query("SELECT id, name, stock FROM products WHERE id = 1").get();
console.log("after ROLLBACK:", p1after);
console.log("store count unchanged:",
  db.query("SELECT COUNT(*) n FROM products").get(),
  db.query("SELECT COUNT(*) n FROM orders").get());

// ---------- Part 2: the lesson's transfer, COMMIT path ----------
console.log("\n== the lesson's transfer — COMMIT path ==");
db.exec(`CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance REAL NOT NULL)`);
db.query("INSERT INTO accounts (id, balance) VALUES (7, 1000.00), (9, 500.00)").run();
const bal = () => db.query("SELECT id, balance FROM accounts ORDER BY id").all();
console.log("start:", bal());
db.exec("BEGIN");
db.query("UPDATE accounts SET balance = balance - 100 WHERE id = 7").run();
console.log("after debit (uncommitted):", bal());
db.query("UPDATE accounts SET balance = balance + 100 WHERE id = 9").run();
console.log("after credit (uncommitted):", bal());
db.exec("COMMIT");
console.log("after COMMIT:", bal());

// ---------- Part 3: the crash — ROLLBACK path ----------
console.log("\n== the lesson's transfer — crash + ROLLBACK path ==");
db.query("UPDATE accounts SET balance = 1000.00 WHERE id = 7").run();
db.query("UPDATE accounts SET balance = 500.00 WHERE id = 9").run();
console.log("reset:", bal());
db.exec("BEGIN");
db.query("UPDATE accounts SET balance = balance - 100 WHERE id = 7").run();
console.log("debit landed (uncommitted):", bal());
// -- crash here: the credit never runs --
db.exec("ROLLBACK");
console.log("after ROLLBACK:", bal());

// autocommit contrast: a bare statement IS its own transaction
console.log("\n== autocommit contrast ==");
db.query("UPDATE accounts SET balance = 900.00 WHERE id = 7").run(); // no BEGIN
console.log("bare UPDATE is instantly permanent:", bal());
db.query("UPDATE accounts SET balance = 1000.00 WHERE id = 7").run(); // restore

db.close();
console.log("\nprobe done — copy written to scripts/tmp/tx-probe.db");
