#!/usr/bin/env python3
"""Task 52 — m7 write-bank case patch pass 2: slot additions, fresh-id
retargets, CTE redesigns, pool fixes. Exact-string replacements."""
import sys

def patch(path, pairs):
    s = open(path, encoding="utf-8").read()
    for old, new in pairs:
        if old not in s:
            print(f"MISS in {path}: {old[:90]!r}")
            sys.exit(1)
        s = s.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(s)
    print(f"ok {path} ({len(pairs)} edits)")

# ---------- delete-a: cs-2617 pool ----------
patch("src/lib/curriculum/keyword-banks/write-cases-delete-a.ts", [
    ('distractors: ["SUM", "MIN", "2", "0", "orders"]',
     'distractors: ["SUM", "MIN", "\'LATAM\'", "0", "orders"]'),
])

# ---------- update-a: cs-2596 add slot ----------
patch("src/lib/curriculum/keyword-banks/write-cases-update-a.ts", [
    ('''    template: "UPDATE orders SET status = 'shipped' WHERE status = {1};",
    slots: [
      { answer: "'returned'", kind: "keyword", label: "the vacant status", why: "Not one of the book's four statuses (cancelled/delivered/pending/shipped) — the predicate matches nothing, changes = 0, no error. Zero-match success is a write's quiet edge." },
    ],
    distractors: ["returned", "'pending'", "'cancelled'"],''',
     '''    template: "UPDATE {2} SET status = 'shipped' WHERE status = {1};",
    slots: [
      { answer: "'returned'", kind: "keyword", label: "the vacant status", why: "Not one of the book's four statuses (cancelled/delivered/pending/shipped) — the predicate matches nothing, changes = 0, no error. Zero-match success is a write's quiet edge." },
      { answer: "orders", kind: "keyword", label: "the lifecycle table", why: "Status lives on orders — the standby targets the order book. products carries no status column; the resolver errors before any row is (not) touched." },
    ],
    distractors: ["returned", "'pending'", "'cancelled'", "products"],'''),
])

# ---------- update-b: cs-2604/2605 pools (boundary coincidences) ----------
patch("src/lib/curriculum/keyword-banks/write-cases-update-b.ts", [
    ('distractors: ["14.99", "15.01", "<="]', 'distractors: ["14.99", "14", "20"]'),
    ('distractors: ["<=", ">", "100"]', 'distractors: ["<>", ">", "100"]'),
])

# ---------- upsert-a fixes ----------
patch("src/lib/curriculum/keyword-banks/write-cases-upsert-a.ts", [
    # cs-2640: OR IGNORE on existing row — proposal distractors reproduce; keep only erroring chips
    ("distractors: [\"AND\", \"'LATAM '\",'CONFLICT', \"OR REPLACE\"]",
     'distractors: ["AND", "CONFLICT", "OR REPLACE"]'),
    # cs-2641: retarget sync to a real price move (49 -> 45) so the arm's outcome differs from a no-op
    ('''    brief: "Pricing's sync feed carries absolute prices: the hub (product 3) at 49.00. The feed is the source of truth — the row's price must EQUAL the feed after every run, whether the product existed or not. The overwrite arm (stock = excluded.stock shape, here price = excluded.price) is the sync's contract.",
    ask: "Rebuild the upsert that syncs product 3's price to 49.00.",
    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 49.00, 10, 2) ON CONFLICT (id) DO UPDATE SET {1} = {2}.price;",''',
     '''    brief: "Pricing's sync feed carries absolute prices: the hub (product 3) drops to 45.00 this run. The feed is the source of truth — the row's price must EQUAL the feed after every run, whether the product existed or not. The overwrite arm (price = excluded.price) is the sync's contract; the stored 49.00 adopts the feed's 45.00.",
    ask: "Rebuild the upsert that syncs product 3's price to the feed's 45.00.",
    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 45.00, 10, 2) ON CONFLICT (id) DO UPDATE SET {1} = {2}.price;",'''),
    ('''      { answer: "price", kind: "keyword", label: "the synced column", why: "The column the feed owns — SET price = excluded.price overwrites with the feed's figure. Absolute sync: the row's price equals the feed's, every run." },
      { answer: "excluded", kind: "keyword", label: "the proposal alias", why: "excluded.price reads the REJECTED row's proposed 49.00 — the feed's value. Without the alias, price = price would be a self-assignment no-op." },
    ],
    distractors: ["stock", "products", "VALUES", "new"],''',
     '''      { answer: "price", kind: "keyword", label: "the synced column", why: "The column the feed owns — SET price = excluded.price overwrites with the feed's figure. Absolute sync: the row's price equals the feed's 45.00, every run." },
      { answer: "excluded", kind: "keyword", label: "the proposal alias", why: "excluded.price reads the REJECTED row's proposed 45.00 — the feed's value. Without the alias, price = price would be a self-assignment no-op that leaves 49.00 standing." },
    ],
    distractors: ["stock", "products", "VALUES", "new"],'''),
    # cs-2644: "name = excluded.name" reproduces (boolean coercion to 1); use bare excluded.name
    ('distractors: ["name = excluded.name", "email", "created_at = excluded.created_at"]',
     'distractors: ["excluded.name", "email", "created_at = excluded.created_at"]'),
    # cs-2647: "<=" fires identically for a strict drop; "-1" errors in operator slot
    ('distractors: ["99.99", ">", "<=", "89.99"]',
     'distractors: ["99.99", ">", "-1", "89.99"]'),
])

# ---------- upsert-b fixes ----------
patch("src/lib/curriculum/keyword-banks/write-cases-upsert-b.ts", [
    # cs-2645: add proposal-stock slot (fresh-id passthrough stays observable)
    ('''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES ({1}, 'Feed Gadget Z', 'Electronics', 59.99, 10, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;",
    slots: [
      { answer: "900", kind: "number", label: "the feed's reserved id", why: "The feed's pre-assigned identity — 900, in the reserved block (watermark 16). No collision exists, so the insert path fires: one change, stock 10 lands." },
    ],
    distractors: ["17", "1", "90"],''',
     '''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES ({1}, 'Feed Gadget Z', 'Electronics', 59.99, {2}, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;",
    slots: [
      { answer: "900", kind: "number", label: "the feed's reserved id", why: "The feed's pre-assigned identity — 900, in the reserved block (watermark 16). No collision exists, so the insert path fires: one change, stock 10 lands." },
      { answer: "10", kind: "number", label: "the landed stock", why: "The insert path's shelf count — the proposal's 10 lands verbatim on the fresh row. The echo would witness it; the aftermath's SUM(stock) carries it." },
    ],
    distractors: ["17", "1", "90", "30", "0"],'''),
    # cs-2650: retarget to existing id 1 so the accumulate arm actually fires
    ('''    title: "The dispute-ticket upsert",
    brief: "Refund ops maintains dispute tickets keyed by order id in a reserved block: order 900 was already disputed (the audit rows), and the new filing ADDS to its dispute count — modeled as stock on the audit row. The filing: order 900's row with +1 dispute unit, accumulate arm. If the ticket didn't exist, the same statement registers it with the first unit.",
    ask: "Rebuild the dispute-count upsert for order 900 (+1 unit).",
    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (900, 'Dispute ticket 900', 'Electronics', 0, {1}, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {2};",
    slots: [
      { answer: "1", kind: "number", label: "the first dispute unit", why: "The insert path's opening count — a fresh ticket registers with 1 dispute unit. The collision path adds the same unit to the existing count." },
      { answer: "excluded.stock", kind: "keyword", label: "the accumulate term", why: "stock + excluded.stock — the filing's +1 added to whatever count exists. (excluded.stock \\u2261 1 here; the alias form generalizes to batch filings.)" },
    ],
    distractors: ["excluded.id", "0", "10"],''',
     '''    title: "The dispute-counter upsert",
    brief: "Refund ops maintains a dispute counter on the flagship row: product 1's audit-shaped stock field counts disputes. The new filing adds +2 units — the row exists (K1, stock 120), so the accumulate arm fires and the counter lands at 122. A fresh row would have registered with the proposal as the opening count.",
    ask: "Rebuild the dispute-count upsert for product 1 (+2 units).",
    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (1, 'Dispute counter: K1', 'Electronics', 0, {1}, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {2};",
    slots: [
      { answer: "2", kind: "number", label: "the filing's units", why: "The proposal's count — 2 dispute units this filing. On the collision path it becomes the accumulate term; on a fresh row it would be the opening count." },
      { answer: "excluded.stock", kind: "keyword", label: "the accumulate term", why: "stock + excluded.stock — the filing's 2 added to the running 120: 122. The alias reads the proposal; the bare name reads the stored count." },
    ],
    distractors: ["excluded.id", "0", "10"],'''),
    # cs-2651: add conflict-target slot
    ('''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 49.00, 40, 2) ON CONFLICT (id) DO {1};",
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the skip arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, the hub's 85 stands, no error. The dedupe contract in two words." },
    ],
    distractors: ["UPDATE", "SET stock = 40", "IGNORE"],''',
     '''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 49.00, 40, 2) ON CONFLICT ({2}) DO {1};",
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the skip arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, the hub's 85 stands, no error. The dedupe contract in two words." },
      { answer: "id", kind: "keyword", label: "the conflict target", why: "The hub's identity — id is the PK the collision fires on. category or stock carry no unique constraint: the engine rejects the STATEMENT before any row logic." },
    ],
    distractors: ["UPDATE", "SET stock = 40", "IGNORE", "17"],'''),
    # cs-2654: retarget to existing customer 4 so the city arm fires
    ('''    brief: "Marketing's landing page captures leads keyed by email — but customers has NO unique constraint on email (only the id PK). The team's compromise: capture against the id the form assigns (the CRM's next-id feed), with the conflict arm updating the CITY (re-submissions may correct it). The rebuild: lead id 950, Mateo Rivas's row, city arm.",
    ask: "Rebuild the lead-capture upsert (id 950, city follows the proposal).",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (950, 'Mateo Rivas', 'mateo.rivas@example.com', 'Valencia', 'APAC', 1, '2026-03-05') ON CONFLICT (id) DO UPDATE SET {1} = {2}.city;",''',
     '''    brief: "The CRM's re-submission flow: a returning lead's form maps to an EXISTING account id (4, Dmitri) and corrects the city — Berlin was stale, the form now says Munich. The conflict arm updates ONLY the city; identity columns stay untouched. Fresh ids would insert outright; this id exists, so the arm fires.",
    ask: "Rebuild the re-submission upsert (customer 4, city follows the proposal).",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (4, 'Dmitri Volkov', 'dmitri.volkov@example.com', 'Munich', 'EU', 1, '2023-12-01') ON CONFLICT (id) DO UPDATE SET {1} = {2}.city;",'''),
    ('''      { answer: "city", kind: "keyword", label: "the corrected column", why: "The arm's one moving column — re-submissions correct the city; name, email, region stay (identity never overwrites on re-capture)." },
      { answer: "excluded", kind: "keyword", label: "the proposal namespace", why: "excluded.city — the re-submission's figure. The arm reads the proposal, writes the stored row." },
    ],
    distractors: ["name", "email", "customers"],''',
     '''      { answer: "city", kind: "keyword", label: "the corrected column", why: "The arm's one moving column — re-submissions correct the city; name, email, region stay (identity never overwrites on re-capture)." },
      { answer: "excluded", kind: "keyword", label: "the proposal namespace", why: "excluded.city — the re-submission's Munich. The arm reads the proposal, writes the stored row; bare city would be a self-assignment no-op." },
    ],
    distractors: ["name", "email", "customers"],'''),
    ('    walkthrough: "Fresh id 950 inserts outright (the feed\'s reserved block, no collision); a re-submission would collide and correct ONLY the city.',
     '    walkthrough: "One change: Dmitri\'s city adopts the re-submission\'s Munich (the stored Berlin yields). The id 4 collision is what wakes the arm — a fresh id would have inserted outright, the arm dormant.'),
    # cs-2657: "40" fires identically (0 < 40 true); "-1" flips the guard to skip
    ('distractors: [">", "excluded.stock", "40"]',
     'distractors: [">", "excluded.stock", "-1"]'),
    # cs-2658: retarget to existing customer 2 so DO NOTHING vs arm differ
    ('''    brief: "The lead form re-submits constantly (double-clicks, retries). The capture contract: first submission REGISTERS, re-submissions ABSORB silently — the same email's second submit must not duplicate or modify. The lead arrives with the CRM's id 951; the rebuild is the absorb form.",
    ask: "Rebuild the absorb-form capture upsert for lead 951.",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (951, 'Petr Novak', 'petr.novak@example.com', 'Prague', 'EU', 1, '2026-03-05') ON CONFLICT (id) DO {1};",
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the absorb arm", why: "DO NOTHING — first submit registers (1 change), re-submits absorb (0 changes). The double-click contract, stated as an arm." },
    ],
    distractors: ["UPDATE SET city = excluded.city", "SET", "REPLACE"],''',
     '''    brief: "The lead form re-submits constantly (double-clicks, retries) against EXISTING account 2 (Bruno Silva — the form's id mapping found his row). The capture contract: re-submissions ABSORB silently — no duplicate, no modification. The rebuild is the absorb form; the aftermath must read 0 changes with Bruno's row untouched.",
    ask: "Rebuild the absorb-form capture upsert for existing customer 2.",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (2, 'Bruno Silva', 'bruno.silva@example.com', 'Sao Paulo', 'LATAM', 1, '2024-06-15') ON CONFLICT (id) DO {1};",
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the absorb arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, Bruno's stored row (city included) stands exactly as the book holds it. The double-click contract, stated as an arm." },
    ],
    distractors: ["UPDATE SET city = excluded.city", "SET", "REPLACE"],'''),
    ('    walkthrough: "Fresh id 951 registers (one change, Petr in the EU book); the double-click\'s re-submit absorbs (zero changes). The city-update arm would let LATER submissions overwrite the FIRST answer — the capture contract says first-wins, so NOTHING is the arm. REPLACE would demolish-and-reinsert (same visible row, churned machinery). Absorb-forms: NOTHING arms, first-wins policies, double-click-proof captures.",',
     '    walkthrough: "Zero changes: the collision fires (customer 2 exists) and NOTHING absorbs the re-submission — Bruno\'s stored row survives byte-for-byte. The city-update arm would let the re-submission OVERWRITE the stored city with the form\'s current answer — the first-wins contract forbids it. REPLACE would demolish-and-reinsert the whole row. Absorb-forms: NOTHING arms, first-wins policies, and the receipt (0 changes) as the dedupe signal.",'),
    # cs-2659: add proposal-price slot
    ('''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (6, 'Bluetooth Speaker Mini', 'Audio', 49.99, 0, 5) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price AND category = {1};",
    slots: [
      { answer: "'Audio'", kind: "keyword", label: "the shelf guard", why: "category = 'Audio' — the second guard condition. The BT Speaker IS Audio (the guard confirms against the STORED row's shelf), so the drop fires: 59.99 → 49.99, one change." },
    ],
    distractors: ["'Electronics'", "supplier_id = 5", "stock > 0"],''',
     '''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (6, 'Bluetooth Speaker Mini', 'Audio', {2}, 0, 5) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price AND category = {1};",
    slots: [
      { answer: "'Audio'", kind: "keyword", label: "the shelf guard", why: "category = 'Audio' — the second guard condition. The BT Speaker IS Audio (the guard confirms against the STORED row's shelf), so the drop fires: 59.99 → 49.99, one change." },
      { answer: "49.99", kind: "number", label: "the clearance price", why: "The proposal's drop target — 49.99 against the stored 59.99. The guard compares it (excluded.price < price) before the arm may write." },
    ],
    distractors: ["'Electronics'", "supplier_id = 5", "stock > 0", "69.99", "59.99"],'''),
    # cs-2660: add id slot
    ('''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (970, 'Load Rehearsal Unit', 'Electronics', 1.00, 0, {1}) ON CONFLICT (id) DO NOTHING;",
    slots: [
      { answer: "1", kind: "number", label: "Nordic's vendor id", why: "The rehearsal unit's vendor line — supplier 1 (Nordic). The proposal's last field; the arm handles the re-run." },
    ],
    distractors: ["970", "2", "0"],''',
     '''    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES ({2}, 'Load Rehearsal Unit', 'Electronics', 1.00, 0, {1}) ON CONFLICT (id) DO NOTHING;",
    slots: [
      { answer: "1", kind: "number", label: "Nordic's vendor id", why: "The rehearsal unit's vendor line — supplier 1 (Nordic). The proposal's last field; the arm handles the re-run." },
      { answer: "970", kind: "number", label: "the reserved-block id", why: "The reserved identity — 970, far above the business watermark. First run inserts (1 change); re-runs collide and the arm absorbs them." },
    ],
    distractors: ["970", "2", "17"],'''),
    # cs-2661: fix guard template (stock.stock was invalid)
    ('    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (980, \'Flag counter: cust 11\', \'Electronics\', 0, 1, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {1}.stock WHERE {2}.stock < 5;",',
     '    template: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (980, \'Flag counter: cust 11\', \'Electronics\', 0, 1, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {1}.stock WHERE {2} < 5;",'),
    # cs-2662: "<=" fires identically for a strict drop; "-1" errors in operator slot
    ('distractors: ["64.99", ">", "<=", "59.99"]',
     'distractors: ["64.99", ">", "-1", "59.99"]'),
])
