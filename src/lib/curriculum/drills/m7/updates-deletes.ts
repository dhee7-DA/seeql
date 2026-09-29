// Drill set — UPDATE & DELETE (Module 7, secondary, 15 questions).
// Engine-verified receipts (db/custom.db, scripts/thin-facts2.ts): status
// census cancelled 7 / delivered 52 / pending 14 / shipped 30 (Σ 103);
// categories Accessories 3, Apparel 2, Audio 3, Electronics 3, Fitness 1,
// Video 2, Wearables 2 (Σ 16); active customers 14 on / 2 off / 16 total;
// avg product price 71.78; Audio 3 products avg price 109.66; zero-stock
// products 0; cheapest stock 40 (Smart Watch S, id 13); expenses 36 rows,
// amount_cents 22,000–168,000, 17 rows under 40,000 cents; regions EU 8 /
// APAC 5 / US 2 / LATAM 1. Probed errors: `UPDATE products SET category =
// 'Video' WHERE category = 'Video'` is legal but touches nothing new;
// UPDATE without WHERE = full-table rewrite (SQLite runs it without warning).

import type { DrillQ } from "../types";

const KW = "UPDATE & DELETE";

export const UPDATES_DELETES: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr7-ud-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which UPDATE raises every Audio product's price by 10%?",
    choices: [
      "`UPDATE products SET price = price * 1.1 WHERE category = 'Audio';`",
      "`UPDATE products SET price * 1.1 WHERE category = 'Audio';`",
      "`UPDATE price = price * 1.1 FROM products WHERE category = 'Audio';`",
      "`UPDATE products WHERE category = 'Audio' SET price = price * 1.1;`",
    ],
    answer: 0,
    why: "The shape is `UPDATE table SET column = expression WHERE …`. `SET price = price * 1.1` reads the row's own current value and writes the raised one back — self-referencing SET is the lesson's core trick. Engine receipt: 3 Audio products, avg 109.66 → 120.63.",
    notes: [
      { choice: 1, why: "SET is an assignment, not arithmetic — missing the `column =` half is a syntax error." },
      { choice: 2, why: "That's UPDATE…FROM projection order — SQLite's grammar wants UPDATE <table> SET, not an UPDATE…FROM-first spelling." },
    ],
  },
  { id: "dr7-ud-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which DELETE removes the 7 cancelled orders — and only them?",
    choices: [
      "`DELETE FROM orders;`",
      "`DELETE FROM orders WHERE status = 'cancelled';`",
      "`DELETE orders WHERE status = 'cancelled';`",
      "`DELETE * FROM orders WHERE status = 'cancelled';`",
    ],
    answer: 1,
    why: "DELETE names the table in FROM and scopes with WHERE — the engine verifies 7 rows affected. `DELETE FROM orders` alone deletes ALL 103; `DELETE orders` and `DELETE *` aren't SQLite grammar.",
    notes: [
      { choice: 0, why: "Legal and catastrophic — the WHERE-less DELETE is a full-table purge. This is why the course grader wraps every write in a rollback sandbox." },
    ],
  },
  { id: "dr7-ud-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "You want the purge report: how many rows a DELETE will claim BEFORE running it. What's the discipline?",
    choices: [
      "Run the DELETE and read the affected count afterwards",
      "Run a SELECT COUNT(*) with the IDENTICAL WHERE first, then run the DELETE",
      "Run the DELETE with LIMIT 0",
      "Ask COUNT(DISTINCT) on the whole table",
    ],
    answer: 1,
    why: "The finance rule from the cs-1978 case: identical WHERE, SELECT COUNT first. The pre-count documents the blast radius (e.g. expenses under 40,000 cents → 17 rows) and doubles as a dry run for typos — if the count says 36 on a 36-row table and you meant a subset, the WHERE is wrong, not the number.",
    notes: [
      { choice: 0, why: "The after-count tells you what happened, too late to catch a fat-fingered WHERE — DELETE has no Ctrl+Z outside a transaction." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr7-ud-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`UPDATE customers SET active = 1 - active WHERE region = 'US'` — what does this flip do?",
    choices: [
      "Sets every US customer to active = 0",
      "Toggles each US customer's flag (2 customers: 0↔1 swap per row)",
      "Errors — you can't reference the column being updated",
      "Sets active to 1 minus the column's name",
    ],
    answer: 1,
    why: "SET reads the row's CURRENT values: active = 1 - active flips 0→1 and 1→0 per row. The 2 US customers swap states whatever they were — a per-row toggle, not a bulk set. Self-referencing expressions are legal and are how multipliers, counters, and toggles work.",
    notes: [
      { choice: 0, why: "That's `SET active = 0` — an assignment of a constant, not a toggle. The expression's right side is evaluated per row BEFORE the write." },
    ],
  },
  { id: "dr7-ud-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does an UPDATE or DELETE return to tell you what it did?",
    choices: [
      "The full rewritten rows, always",
      "An affected-rows count (and, with RETURNING, the written rows themselves)",
      "A boolean success flag only",
      "Nothing — writes are silent",
    ],
    answer: 1,
    why: "Every write reports changes: `7 rows affected` for the cancelled purge. SQLite 3.35+ can also echo rows via RETURNING — `DELETE FROM orders WHERE status='cancelled' RETURNING id` lists the 7 doomed ids as they go. The course's grader reads exactly this count.",
    notes: [
      { choice: 3, why: "Silence is the MySQL-client default only — the engine always counts; RETURNING makes it per-row visible." },
    ],
  },
  { id: "dr7-ud-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`DELETE FROM customers WHERE region = 'LATAM'` — why might this DELETE fail even though the WHERE matches exactly 1 row?",
    choices: [
      "DELETE never fails on matching rows",
      "Another table's FK references that customer (orders.customer_id) — SQLite with foreign_keys ON rejects the orphaning delete",
      "LATAM is spelled wrong in the data",
      "DELETE requires a subquery",
    ],
    answer: 1,
    why: "Deletes obey relationships: customers is the parent of orders, and with PRAGMA foreign_keys = ON the engine refuses to orphan children. The workflows: delete the children first (or ON DELETE CASCADE), reassign them, or keep the row. Blast-radius thinking extends to REFERENCES, not just WHERE.",
    notes: [
      { choice: 0, why: "On this sandbox with FKs off it would sail through — which is exactly the silent-orphan disaster the check exists to prevent." },
    ],
  },

  // ---------- edge ----------
  { id: "dr7-ud-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`UPDATE products SET category = 'Video' WHERE category = 'Video'` — a no-op-ish write. What does the engine report?",
    choices: [
      "Error — the write matches nothing new",
      "The matched count (2 rows), whether values changed or not — SQLite doesn't diff old vs new",
      "0 rows — unchanged values don't count",
      "A warning about redundant writes",
    ],
    answer: 1,
    why: "SQLite counts MATCHED rows, not changed values — writing the same value back still registers. (Other engines offer rows-matched vs rows-changed splits; SQLite keeps it simple.) Engine receipt: category 'Video' holds 2 products → changes() = 2, values identical or not.",
    notes: [
      { choice: 2, why: "That's the rows-changed semantics of some other engines — worth knowing when porting scripts, but SQLite's counter is rows-matched." },
    ],
  },
  { id: "dr7-ud-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`DELETE FROM orders WHERE status = 'cancelled' AND total < 0` — cancelled is 7 rows, but no order total is negative. Result?",
    choices: [
      "0 rows affected — the compound WHERE matches nothing, silently",
      "Error — the DELETE must match",
      "All 7 cancelled orders go",
      "The engine prompts for confirmation",
    ],
    answer: 0,
    why: "A DELETE that matches zero rows is a SUCCESS reporting 0 — the quiet cousin of the full-purge disaster. Total is REAL and always positive on this db (min 25.47), so the compound predicate is unsatisfiable. The pre-count discipline exists precisely to catch over-tight WHEREs as well as over-loose ones.",
    notes: [
      { choice: 2, why: "AND is a conjunction — one false test (total < 0) kills the row from consideration. For 'either condition', the spelling is OR — and then the pre-count matters even more." },
    ],
  },
  { id: "dr7-ud-09", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`UPDATE products SET stock = stock - 30 WHERE id = 13` — but Smart Watch S has exactly 40 on the shelf. What lands in stock?",
    choices: [
      "10",
      "-10? No — SQLite blocks negative stock",
      "40 — the write is rejected as unsafe",
      "NULL",
    ],
    answer: 0,
    why: "SQLite's INTEGER has no floor at zero — arithmetic goes through: 40 − 30 = 10. A CHECK (stock >= 0) constraint is the only engine-level guard, and this schema has none; business rules like 'no negative inventory' live in your WHERE or your app layer. Engine receipt: id 13 is the 40-stock row.",
    notes: [
      { choice: 1, why: "No implicit guard exists — `stock = stock - 100` would store −60 without a whisper. Constraints or application checks are the fix." },
    ],
  },

  // ---------- errors ----------
  { id: "dr7-ud-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A teammate's `UPDATE products SET price = 99 WHERE 'Audio' = 'Audio';` repriced the WHOLE catalog. Reading the statement, what's the bug?",
    choices: [
      "String comparison isn't allowed in WHERE",
      "The WHERE is a tautology — 'Audio' = 'Audio' is always true, so every row matches; the intended column test was category = 'Audio'",
      "price = 99 needs quotes",
      "UPDATE can't run without a FROM",
    ],
    answer: 1,
    why: "The WHERE tests two literals, not the row — always true, all 16 products match. The classic fat-finger variant of the full-table rewrite. The pre-count discipline catches it instantly: COUNT with the same WHERE would have said 16 before the write landed.",
    notes: [
      { choice: 2, why: "99 as a number is correct for a REAL column — quoting it ('99') would store the TEXT '99' and trigger affinity conversion instead." },
    ],
  },
  { id: "dr7-ud-11", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`DELETE FROM orders WHERE customer_id = 3 RETURNING id;` errors on this SQLite build. Most likely reason?",
    choices: [
      "RETURNING is banned on DELETE",
      "The customer has no orders — RETURNING on an empty result is an error",
      "RETURNING needs SQLite 3.35+; older builds reject the keyword entirely",
      "The semicolon conflicts with RETURNING",
    ],
    answer: 2,
    why: "RETURNING shipped in SQLite 3.35 (2021) across INSERT/UPDATE/DELETE. On current builds `DELETE … RETURNING id` echoes each removed row — a 7-row cancelled purge lists 7 ids. The lesson's dialect note: Postgres has had it for decades; MySQL still hasn't.",
    notes: [
      { choice: 1, why: "Zero rows with RETURNING is an empty result set — perfectly legal, not an error." },
    ],
  },

  // ---------- predict ----------
  { id: "dr7-ud-12", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `UPDATE customers SET active = 0 WHERE region = 'US';` — the roster is EU 8, APAC 5, US 2, LATAM 1, with 2 inactive customers overall. What does the engine report?",
    choices: ["2 rows affected", "16 rows affected", "0 rows affected", "1 row affected"],
    answer: 0,
    why: "The WHERE matches the 2 US customers — whoever they are, active or not, the write touches 2 rows. Affected counts follow the WHERE, not the value delta (and SQLite counts matched rows even when active was already 0).",
    notes: [
      { choice: 2, why: "No rows-changed diffing in SQLite — matched means counted, even if the value written equals the value stored." },
    ],
  },
  { id: "dr7-ud-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `DELETE FROM expenses WHERE amount_cents < 40000;` — 36 expense rows span 22,000–168,000 cents. What happens?",
    choices: [
      "17 rows deleted; 19 remain",
      "All 36 deleted — min is 22,000 which is below 40,000",
      "0 rows — cents don't compare to a bare number",
      "Error — DELETE needs an ORDER BY",
    ],
    answer: 0,
    why: "The engine-verified census: 17 expenses sit under 40,000 cents (petty band from the ladder drills), so the purge claims 17 and leaves 19. Cents compare to bare integers directly — INTEGER columns, integer literals, no conversion needed.",
    notes: [
      { choice: 1, why: "Only rows satisfying the WHERE go — 19 rows at 40,000+ cents survive. The min being 22,000 doesn't doom the whole table." },
    ],
  },
  { id: "dr7-ud-14", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Two writes, in order, on a 16-product catalog: (1) `UPDATE products SET price = 20 WHERE category = 'Fitness';` (2) `UPDATE products SET price = price * 1.1 WHERE price = 20;`. Fitness holds exactly 1 product, priced 89.99. What's its price after both?",
    choices: ["22.00 — 20 × 1.1", "98.99 — 89.99 × 1.1", "20.00", "9.79"],
    answer: 0,
    why: "Write 1 sets the Fitness row to a flat 20 (the 89.99 is gone). Write 2's WHERE now matches it (price = 20) and multiplies to 22. The second write reads what the FIRST wrote — writes compose through the data, which is exactly why ordering matters in migration scripts.",
    notes: [
      { choice: 1, why: "That's applying the raise to the ORIGINAL price — but write 1 overwrote 89.99 with 20 before the raise ever ran." },
    ],
  },
  { id: "dr7-ud-15", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Which purge is the one you should NOT run as a single bare DELETE — and what's the safer shape?",
    choices: [
      "`DELETE FROM expenses WHERE id = 36;` — single-row id deletes are always safe",
      "A bulk DELETE whose WHERE involves a subquery (e.g. products never ordered) — verify with a SELECT join first, since the subquery's emptiness or shape silently changes the blast radius",
      "`DELETE FROM orders WHERE status = 'cancelled'` — status filters are self-explanatory",
      "None — the sandbox rolls everything back anyway",
    ],
    answer: 1,
    why: "Subquery-driven purges fail two ways: the subquery returning empty makes the DELETE claim nothing (silent no-op), and subtle shape bugs can widen it catastrophically. The discipline: run the subquery as a SELECT, count, eyeball the rows, THEN delete. The 0 never-ordered-products result on this db is a live example — the purge would do nothing, and only a pre-check tells you that.",
    notes: [
      { choice: 3, why: "The sandbox protects practice, not production. The habits exist for the day the transaction isn't rolled back." },
    ],
  },
];
