#!/usr/bin/env python3
"""Task 52 — m7 write-bank patch pass 2 (minimal anchors)."""
import sys

APPLIED = []
def patch(path, old, new, tag):
    s = open(path, encoding="utf-8").read()
    if old not in s:
        if new in s:
            print(f"skip {tag} (already applied)")
            return
        print(f"MISS {tag} in {path}")
        sys.exit(1)
    s = s.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(s)
    APPLIED.append(tag)

A = "src/lib/curriculum/keyword-banks/write-cases-update-a.ts"
B = "src/lib/curriculum/keyword-banks/write-cases-upsert-a.ts"
C = "src/lib/curriculum/keyword-banks/write-cases-upsert-b.ts"
A2 = "src/lib/curriculum/keyword-banks/write-cases-upsert-a.ts"
D = "src/lib/curriculum/keyword-banks/write-cases-returning-a.ts"
E = "src/lib/curriculum/keyword-banks/write-cases-returning-b.ts"

# cs-2596: add table slot
patch(A,
  '''template: "UPDATE orders SET status = 'shipped' WHERE status = {1};",
    slots: [
      { answer: "'returned'", kind: "keyword", label: "the vacant status",''',
  '''template: "UPDATE {2} SET status = 'shipped' WHERE status = {1};",
    slots: [
      { answer: "'returned'", kind: "keyword", label: "the vacant status",''', "2596-tmpl")
patch(A,
  '''changes = 0, no error. Zero-match success is a write's quiet edge." },
    ],
    distractors: ["returned", "'pending'", "'cancelled'"],''',
  '''changes = 0, no error. Zero-match success is a write's quiet edge." },
      { answer: "orders", kind: "keyword", label: "the lifecycle table", why: "Status lives on orders — the standby targets the order book. products carries no status column; the resolver errors before any row is (not) touched." },
    ],
    distractors: ["returned", "'pending'", "'cancelled'", "products"],''', "2596-slot")

# upsert-a fixes
patch(B, "distractors: [\"AND\", \"'LATAM '\",'CONFLICT', \"OR REPLACE\"]",
        'distractors: ["AND", "CONFLICT", "OR REPLACE"]', "2640-pool")
patch(B, "VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 49.00, 10, 2) ON CONFLICT (id) DO UPDATE SET {1} = {2}.price;",
        "VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 45.00, 10, 2) ON CONFLICT (id) DO UPDATE SET {1} = {2}.price;", "2641-tmpl")
patch(B, "the hub (product 3) at 49.00. The feed is the source of truth",
        "the hub (product 3) drops to 45.00 this run. The feed is the source of truth", "2641-brief")
patch(B, "Rebuild the upsert that syncs product 3's price to 49.00.",
        "Rebuild the upsert that syncs product 3's price to the feed's 45.00.", "2641-ask")
patch(B, "distractors: [\"name = excluded.name\", \"email\", \"created_at = excluded.created_at\"]",
        'distractors: ["excluded.name", "email", "created_at = excluded.created_at"]', "2644-pool")
patch(B, 'distractors: ["99.99", ">", "<=", "89.99"]',
        'distractors: ["99.99", ">", "-1", "89.99"]', "2647-pool")

# upsert-b fixes
patch(A2, "VALUES ({1}, 'Feed Gadget Z', 'Electronics', 59.99, 10, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;",
        "VALUES ({1}, 'Feed Gadget Z', 'Electronics', 59.99, {2}, 1) ON CONFLICT (id) DO UPDATE SET stock = excluded.stock;", "2645-tmpl")
patch(A2, '''No collision exists, so the insert path fires: one change, stock 10 lands." },
    ],
    distractors: ["17", "1", "90"],''',
      '''No collision exists, so the insert path fires: one change, stock 10 lands." },
      { answer: "10", kind: "number", label: "the landed stock", why: "The insert path's shelf count — the proposal's 10 lands verbatim on the fresh row. The echo would witness it; the aftermath's totals carry it." },
    ],
    distractors: ["17", "1", "90", "30", "0"],''', "2645-slot")
patch(A2, '''      { answer: "excluded.stock", kind: "keyword", label: "the accumulate term", why: "stock + excluded.stock — the filing's +1 added to whatever count exists. (excluded.stock ≡ 1 here; the alias form generalizes to batch filings.)" },
    ],
    distractors: ["excluded.id", "0", "10"],''',
      '''      { answer: "excluded.stock", kind: "keyword", label: "the accumulate term", why: "stock + excluded.stock — the filing's units added to the running count. The alias reads the proposal; the bare name reads the stored figure." },
    ],
    distractors: ["excluded.id", "0", "10"],''', "2650-slot-why")
patch(A2, "VALUES (900, 'Dispute ticket 900', 'Electronics', 0, {1}, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {2};",
        "VALUES (1, 'Dispute counter: K1', 'Electronics', 0, {1}, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + {2};", "2650-tmpl")
patch(A2, "Refund ops maintains dispute tickets keyed by order id in a reserved block: order 900 was already disputed (the audit rows), and the new filing ADDS to its dispute count — modeled as stock on the audit row. The filing: order 900's row with +1 dispute unit, accumulate arm. If the ticket didn't exist, the same statement registers it with the first unit.",
        "Refund ops maintains a dispute counter on the flagship row: product 1's audit-shaped stock field counts disputes. The new filing adds +2 units — the row exists (K1, stock 120), so the accumulate arm fires and the counter lands at 122. A fresh row would have registered with the proposal as the opening count.", "2650-brief")
patch(A2, "Rebuild the dispute-count upsert for order 900 (+1 unit).",
        "Rebuild the dispute-count upsert for product 1 (+2 units).", "2650-ask")
patch(A2, '''{ answer: "1", kind: "number", label: "the first dispute unit", why: "The insert path's opening count — a fresh ticket registers with 1 dispute unit. The collision path adds the same unit to the existing count." },''',
      '''{ answer: "2", kind: "number", label: "the filing's units", why: "The proposal's count — 2 dispute units this filing. On the collision path it becomes the accumulate term; on a fresh row it would be the opening count." },''', "2650-slot1")
patch(C, '''ON CONFLICT ({2}) DO {1};
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the skip arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, the hub's 85 stands, no error. The dedupe contract in two words." },
    ],
    distractors: ["UPDATE", "SET stock = 40", "IGNORE"],''',
      '''ON CONFLICT ({2}) DO {1};
    slots: [
      { answer: "NOTHING", kind: "keyword", label: "the skip arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, the hub's 85 stands, no error. The dedupe contract in two words." },
      { answer: "id", kind: "keyword", label: "the conflict target", why: "The hub's identity — id is the PK the collision fires on. category or stock carry no unique constraint: the engine rejects the STATEMENT before any row logic." },
    ],
    distractors: ["UPDATE", "SET stock = 40", "IGNORE", "17"],''', "2651-slot")
patch(C, "ON CONFLICT (id) DO {1};",
        "ON CONFLICT ({2}) DO {1};", "2651-tmpl")
patch(C, '''The team's compromise: capture against the id the form assigns (the CRM's next-id feed), with the conflict arm updating the CITY (re-submissions may correct it). The rebuild: lead id 950, Mateo Rivas's row, city arm.",
    ask: "Rebuild the lead-capture upsert (id 950, city follows the proposal).",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (950, 'Mateo Rivas', 'mateo.rivas@example.com', 'Valencia', 'APAC', 1, '2026-03-05')''',
      '''The re-submission flow: a returning lead's form maps to an EXISTING account id (4, Dmitri) and corrects the city — Berlin was stale, the form now says Munich. The conflict arm updates ONLY the city; identity columns stay untouched. Fresh ids would insert outright; this id exists, so the arm fires.",
    ask: "Rebuild the re-submission upsert (customer 4, city follows the proposal).",
    template: "INSERT INTO customers (id, name, email, city, region, active, created_at) VALUES (4, 'Dmitri Volkov', 'dmitri.volkov@example.com', 'Munich', 'EU', 1, '2023-12-01')''', "2654-brief")
patch(C, "VALUES (951, 'Petr Novak', 'petr.novak@example.com', 'Prague', 'EU', 1, '2026-03-05') ON CONFLICT (id) DO {1};",
        "VALUES (2, 'Bruno Silva', 'bruno.silva@example.com', 'Sao Paulo', 'LATAM', 1, '2024-06-15') ON CONFLICT (id) DO {1};", "2658-tmpl")
patch(C, "The lead arrives with the CRM's id 951; the rebuild is the absorb form.",
        "The form's id mapping found existing account 2; the rebuild is the absorb form — the aftermath must read 0 changes with Bruno's row untouched.", "2658-brief")
patch(C, '''{ answer: "NOTHING", kind: "keyword", label: "the absorb arm", why: "DO NOTHING — first submit registers (1 change), re-submits absorb (0 changes). The double-click contract, stated as an arm." },''',
      '''{ answer: "NOTHING", kind: "keyword", label: "the absorb arm", why: "DO NOTHING — the collision becomes a counted no-op: changes = 0, Bruno's stored row stands byte-for-byte. The double-click contract, stated as an arm." },''', "2658-slot")
patch(C, "the rebuild is the absorb form; the aftermath must read 0 changes with Bruno's row untouched.\"",
        "the rebuild is the absorb form; the aftermath must read 0 changes with Bruno's row untouched.\"", "2658-brief-guard")
patch(C, 'distractors: [">", "excluded.stock", "40"]',
        'distractors: [">", "excluded.stock", "-1"]', "2657-pool")
patch(C, "VALUES (6, 'Bluetooth Speaker Mini', 'Audio', 49.99, 0, 5) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price AND category = {1};",
        "VALUES (6, 'Bluetooth Speaker Mini', 'Audio', {2}, 0, 5) ON CONFLICT (id) DO UPDATE SET price = excluded.price WHERE excluded.price < price AND category = {1};", "2659-tmpl")
patch(C, '''the drop fires: 59.99 → 49.99, one change." },
    ],
    distractors: ["'Electronics'", "supplier_id = 5", "stock > 0"],''',
      '''the drop fires: 59.99 → 49.99, one change." },
      { answer: "49.99", kind: "number", label: "the clearance price", why: "The proposal's drop target — 49.99 against the stored 59.99. The guard compares it (excluded.price < price) before the arm may write." },
    ],
    distractors: ["'Electronics'", "supplier_id = 5", "stock > 0", "69.99", "59.99"],''', "2659-slot")
patch(C, "VALUES (970, 'Load Rehearsal Unit', 'Electronics', 1.00, 0, {1}) ON CONFLICT (id) DO NOTHING;",
        "VALUES ({2}, 'Load Rehearsal Unit', 'Electronics', 1.00, 0, {1}) ON CONFLICT (id) DO NOTHING;", "2660-tmpl")
patch(C, '''The proposal's last field; the arm handles the re-run." },
    ],
    distractors: ["970", "2", "0"],''',
      '''The proposal's last field; the arm handles the re-run." },
      { answer: "970", kind: "number", label: "the reserved-block id", why: "The reserved identity — 970, far above the business watermark. First run inserts (1 change); re-runs collide and the arm absorbs them." },
    ],
    distractors: ["970", "2", "17"],''', "2660-slot")
patch(C, "DO UPDATE SET stock = stock + {1}.stock WHERE {2}.stock < 5;",
        "DO UPDATE SET stock = stock + {1}.stock WHERE {2} < 5;", "2661-tmpl")
patch(C, 'distractors: ["64.99", ">", "<=", "59.99"]',
        'distractors: ["64.99", ">", "-1", "59.99"]', "2662-pool")

print("ALL OK:", len(APPLIED), "edits")
