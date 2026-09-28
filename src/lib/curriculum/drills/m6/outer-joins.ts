// Drill set — RIGHT & FULL OUTER joins (Module 6, secondary, 15 questions).
// Engine-verified receipts (db/custom.db, scripts/thin-facts2.ts + lesson-34):
// every customer has ≥1 order and every product is ordered (LEFT JOIN … IS
// NULL anti-joins = 0 rows both sides) — unmatched rows only appear when a
// filter rides in ON. `orders o RIGHT JOIN customers c ON c.id = o.customer_id`
// = 103 (no filter, all matched); with `AND o.status = 'cancelled'` in ON =
// 19 rows (12 NULL-filled customers + 7 cancelled matches); FULL OUTER with
// the same ON = 115 (19 + the 96 orders that aren't cancelled); FULL OUTER
// with a plain equality ON = 103 (nothing unmatched on either side);
// `order_items oi RIGHT JOIN products p ON p.id = oi.product_id` = 251 (the
// order_items row count — the right table drives); status census: cancelled
// 7, delivered 52, pending 14, shipped 30.

import type { DrillQ } from "../types";

const KW = "RIGHT / FULL JOIN";

export const OUTER_JOINS: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr6-oj-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "`FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id` — which table's rows are ALL kept?",
    choices: [
      "orders — the FROM table is always preserved",
      "customers — RIGHT JOIN preserves the table named on the RIGHT of the keyword",
      "Both — RIGHT means two-sided",
      "Neither — RIGHT JOIN is valid only with a filter",
    ],
    answer: 1,
    why: "The direction word names the preserved side: RIGHT JOIN keeps every row of the right-hand table (customers) and NULL-fills the left where no match exists. `A RIGHT JOIN B` is exactly `B LEFT JOIN A` with the ON clause untouched.",
    notes: [
      { choice: 0, why: "That's LEFT JOIN's contract. Direction follows the KEYWORD's side, not FROM's — the flip proof: customers FROM, orders LEFT JOINed gives the same 19-row result as orders FROM, customers RIGHT JOINed." },
    ],
  },
  { id: "dr6-oj-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which query lists EVERY customer with their cancelled order_ids — and still shows customers who have none?",
    choices: [
      "`FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled'`",
      "`FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`",
      "`FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled'`",
      "`FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'cancelled'`",
    ],
    answer: 1,
    why: "The status condition must ride IN the ON clause: it decides which orders match while the RIGHT JOIN still keeps all 16 customers (12 arrive NULL-filled). Engine receipt: 19 rows — 7 cancelled matches plus 12 kept customers.",
    notes: [
      { choice: 2, why: "WHERE runs AFTER the keep: it filters out the 12 NULL-filled customers (NULL = 'cancelled' is not true) and collapses the outer join back to 7 inner rows." },
      { choice: 3, why: "Direction flipped: this keeps every ORDER (with or without… well, every order matches a customer) — the customers-with-no-cancelled-orders silently vanish." },
    ],
  },
  { id: "dr6-oj-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "How do you spell the join that keeps unmatched rows from BOTH sides?",
    choices: [
      "`FULL JOIN` (OUTER is optional noise)",
      "`BOTH JOIN`",
      "Two LEFT JOINs stacked with UNION ALL",
      "`OUTER JOIN` on its own",
    ],
    answer: 0,
    why: "`FULL OUTER JOIN` — or just `FULL JOIN`; OUTER is optional spelling. SQLite has supported it since 3.39 (this course's sandbox is newer; older SQLite builds answer with a syntax error — the lesson's dialect note).",
    notes: [
      { choice: 2, why: "A UNION ALL of two LEFT JOINs (one per direction) can EMULATE full-outer semantics, but the arms' unmatched rows need careful NULL handling — it's the fallback recipe, not the spelling." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr6-oj-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "On the storefront, `orders o RIGHT JOIN customers c ON c.id = o.customer_id` (no extra condition) returns 103 rows. What does that number tell you?",
    choices: [
      "12 customers have no orders — the NULL-fill is live",
      "Every customer has at least one order — no unmatched rows to keep",
      "103 orders were cancelled",
      "The join lost rows and should be a FULL JOIN",
    ],
    answer: 1,
    why: "103 is exactly the orders count, and every customer owns ≥1 order on this db — so the RIGHT keep has nothing to NULL-fill and the output equals the inner result. Unmatched rows only SURFACE when a condition in ON splits matched from unmatched (like the cancelled probe's 19).",
    notes: [
      { choice: 3, why: "FULL JOIN would also read 103 here — with zero unmatched rows on either side, direction and fullness change nothing. Verified: plain FULL OUTER = 103 too." },
    ],
  },
  { id: "dr6-oj-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The cancelled probe (status in ON) returns 19 rows: 7 real matches + 12 NULL-filled customers. Switch it to FULL OUTER JOIN and you get 115. What are the extra 96 rows?",
    choices: [
      "The 96 orders whose status ISN'T cancelled — FULL keeps them too, NULL-filled on the customer side",
      "Duplicate customers — FULL JOIN doubles everything",
      "The 96 products never ordered",
      "Nothing — 115 is an error count",
    ],
    answer: 0,
    why: "FULL = LEFT + RIGHT keeps in one pass. The RIGHT keep contributed 12 NULL customers; the LEFT keep adds the 96 non-cancelled orders (103 − 7 matches), each NULL-filled where the ON condition failed. 7 + 12 + 96 = 115, the engine-verified census.",
    notes: [
      { choice: 1, why: "FULL never duplicates matched rows — it only ADDS each side's unmatched rows once. Multiplication is a fanout disease, not an outer-join feature." },
    ],
  },
  { id: "dr6-oj-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`order_items oi RIGHT JOIN products p ON p.id = oi.product_id` — what does a NULL oi.id row mean?",
    choices: [
      "A product with no order-item rows — impossible on this db (all 16 sell)",
      "An order item with no product — impossible (FK enforced)",
      "A corrupted row",
      "A product whose order items were cancelled",
    ],
    answer: 0,
    why: "The NULL-fill belongs to the LEFT side here (order_items): a NULL oi row would be a product kept without any order-item match. Verified receipt: 0 such rows — every product has sold — so the count equals order_items itself: 251.",
    notes: [
      { choice: 1, why: "That would need the OPPOSITE direction — and even then, FKs make childless parents the possible hole, parentless children not." },
    ],
  },

  // ---------- edge ----------
  { id: "dr6-oj-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "A RIGHT JOIN's ON carries `AND o.status = 'cancelled'`; a colleague moves it to WHERE and reports 7 rows instead of 19. Why did 12 rows vanish?",
    choices: [
      "WHERE NULL-skips the kept customers — NULL = 'cancelled' is not true, so the NULL-filled rows fail the filter",
      "The engine optimized the 12 rows away",
      "RIGHT JOIN forbids WHERE clauses",
      "The 12 rows were duplicates",
    ],
    answer: 0,
    why: "ON decides MATCHING (before the keep); WHERE decides SURVIVAL (after it). The 12 NULL-filled customers can never satisfy a status comparison — their o.status IS NULL — so a WHERE on status deletes exactly the rows the outer join existed to keep. This is the lesson-16 predicate-placement rule, outer-join edition.",
    notes: [
      { choice: 2, why: "WHERE is legal — it just collapses the outer semantics. If you WANT an inner result, write INNER and say so." },
    ],
  },
  { id: "dr6-oj-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "FULL OUTER JOIN, plain equality ON, orders to customers: 103. Add `AND o.status = 'cancelled'` to ON: 115. Which ON-side condition CANNOT raise the count above 115?",
    choices: [
      "`AND o.status IN ('cancelled', 'pending')`",
      "`AND o.total > 0`",
      "Adding more orders — wait, that's data, not ON",
      "None of these predicates can exceed 115 — the census is bounded by 103 orders + 16 customers in the extreme",
    ],
    answer: 3,
    why: "A FULL OUTER over these two tables can never exceed 103 + 16 = 119 rows (every order kept + every customer kept). Any ON predicate only decides HOW MANY match — the unmatched remainder just shifts between the three buckets (matched / left-kept / right-kept). 115 is what the cancelled filter produces; loosening it moves rows into 'matched', never past 119.",
    notes: [
      { choice: 0, why: "Loosening to cancelled+pending does raise 115 — matched pairs grow from 7 to 21 — but 21 + 82 + 12 = 115 again? No: 103 orders − 21 matches = 82 left-kept, so 21 + 82 + 12 = 115. Coincidence of arithmetic: unmatched orders swap buckets one-for-one." },
    ],
  },

  // ---------- errors ----------
  { id: "dr6-oj-09", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT c.name, o.id FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled'` — reading the error, which phrase describes the bug best?",
    choices: [
      "Syntax error — WHERE can't follow RIGHT JOIN",
      "Logic error — the WHERE deletes the NULL-kept customers the RIGHT JOIN was keeping (7 rows instead of 19)",
      "Ambiguity error — o.id is ambiguous",
      "Nothing — this is the correct probe",
    ],
    answer: 1,
    why: "It parses and runs — that's what makes it dangerous. The intent (every customer, cancelled or not) lives in ON; the WHERE re-filters and silently returns the inner result. Rule: conditions that define the match go in ON; conditions that filter the FINAL report go in WHERE.",
    notes: [
      { choice: 3, why: "It IS a correct probe of 'customers with cancelled orders' — but that's a different brief. The 19-row brief dies the moment this WHERE lands." },
    ],
  },
  { id: "dr6-oj-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "An older SQLite (pre-3.39) answers `FULL OUTER JOIN` with…",
    choices: [
      "A silent wrong result",
      "A syntax error near \"FULL\"",
      "A LEFT JOIN result",
      "A warning and a CROSS JOIN",
    ],
    answer: 1,
    why: "SQLite grew real FULL OUTER JOIN support only in 3.39 (2022). Older engines reject the spelling outright — a loud failure, happily. The classic emulation is the UNION ALL of a LEFT JOIN and a right-anchored LEFT JOIN.",
    notes: [
      { choice: 0, why: "SQLite errors loudly rather than guessing — the dangerous dialects are the ones that silently downgrade." },
    ],
  },

  // ---------- predict ----------
  { id: "dr6-oj-11", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `SELECT COUNT(*) AS n FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`. Status census: cancelled 7, delivered 52, pending 14, shipped 30. What is n?",
    choices: ["19", "7", "103", "12"],
    answer: 0,
    why: "7 cancelled orders find their customers; the 9 other customers (16 − 7 with a cancelled order… precisely, 12 customers own no cancelled order) arrive NULL-filled. 7 + 12 = 19, the engine-verified count from lesson-34's 'from the right side' problem.",
    notes: [
      { choice: 1, why: "7 is the INNER count — it answers 'cancelled orders with owners', not 'every customer, cancelled order or not'." },
      { choice: 2, why: "103 is the no-filter keep — with a status in ON, most orders stop matching and drop out of the RIGHT side entirely." },
    ],
  },
  { id: "dr6-oj-12", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Same probe spelled `FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'`. Row count?",
    choices: ["19", "7", "115", "12"],
    answer: 0,
    why: "The flip proof: `A RIGHT JOIN B` ≡ `B LEFT JOIN A` with the same ON. Same 7 matches, same 12 NULL-filled customers, 19 rows — direction is spelling, not semantics. (FULL goes further at 115; LEFT stops at the customers.)",
    notes: [
      { choice: 2, why: "115 is the FULL count — it adds the 96 non-cancelled orders that LEFT (or RIGHT) keeps only from one side." },
    ],
  },
  { id: "dr6-oj-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `SELECT COUNT(*) AS n FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id` — plain equality, no extra condition. Every customer has ≥1 order. What is n?",
    choices: ["103", "119", "16", "0"],
    answer: 0,
    why: "All 103 orders match a customer AND all 16 customers have orders — no unmatched rows exist on either side, so FULL OUTER collapses to the inner count. The engine verifies it: 103. Outer joins only ADD rows when the keep has orphans to save.",
    notes: [
      { choice: 1, why: "119 (103 + 16) is the CROSS JOIN ceiling, not the outer count — matching rows appear ONCE, not twice." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr6-oj-14", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate writes RIGHT JOINs habitually because 'the lookup table reads better on the right'. What's the strongest team-level argument to standardize on LEFT?",
    choices: [
      "RIGHT JOIN is deprecated",
      "Reading FROM → LEFT JOIN follows the data-flow direction (base rows, then optional attachments); mixed directions make ON-vs-WHERE bugs harder to spot in review",
      "LEFT JOIN is faster in SQLite",
      "RIGHT JOIN cannot carry compound ON conditions",
    ],
    answer: 1,
    why: "Both spellings compute identical plans — this is a readability contract, not an engine one. Top-to-bottom data flow (anchors first, optional extensions after) keeps predicate placement reviewable: the moment directions mix, the ON-vs-WHERE collapse hides better. RIGHT JOIN isn't wrong; unmanaged mixing is.",
    notes: [
      { choice: 2, why: "No engine-level speed difference — the planner sees the same join tree either way." },
      { choice: 3, why: "Compound ONs work identically in both directions — the cancelled probe proves it." },
    ],
  },
  { id: "dr6-oj-15", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You need 'every customer, their cancelled orders, AND any orders that somehow lost their customer row'. Which join and why?",
    choices: [
      "RIGHT JOIN — customers on the right is enough",
      "FULL OUTER JOIN with the status in ON — it's the only spelling that keeps orphans from both sides at once",
      "INNER JOIN — orphan orders don't exist anyway",
      "CROSS JOIN — count everything",
    ],
    answer: 1,
    why: "Two-sided keep = FULL: NULL-filled customers (12) AND NULL-filled orphan orders would both survive. On this db the orphan side is empty (FK enforced), so the result equals the RIGHT probe's 19 — but the brief asked for the GUARANTEE, and only FULL spells it. On this engine, verified: 115 when the filter is cancelled-only… with plain equality, 103.",
    notes: [
      { choice: 2, why: "Today's FK guarantees aren't the query's job to assume — one imported row with a stale customer_id and the INNER report goes blind. FULL is the brief spelled out." },
    ],
  },
];
