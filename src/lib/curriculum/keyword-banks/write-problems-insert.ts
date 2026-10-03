// M7 write-bank problems — INSERT (16, kb-wi-p01..p16). All mutating: the
// grader sandbox-runs each solution (transaction + rollback); verify SELECTs
// grade the aftermath. Ids deterministic per fresh seed (supplier 7, product
// 17, order 104, item 252, customer 17).
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const insertProblems: Problem[] = [
  p({
    id: "kb-wi-p01", difficulty: "easy",
    title: "Register the new vendor",
    brief: "Procurement onboards Midwest Peak Supply Co (US, rating 4.4). Insert the supplier row — the book's next id (7) is auto-assigned.",
    hints: ["Three business columns; leave id out.", "INSERT INTO suppliers (name, region, rating) VALUES (…);"],
    solution: "INSERT INTO suppliers (name, region, rating) VALUES ('Midwest Peak Supply Co', 'US', 4.4) RETURNING id, name, region, rating;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p02", difficulty: "easy",
    title: "Pre-register with default stock",
    brief: "Register 'Desk Lamp Pro' (Electronics, 79.99, supplier 2) WITHOUT a stock figure — the schema's DEFAULT 0 must hold the shelf count. Verify by echoing the new row's id and stock.",
    hints: ["Omit stock from the column list entirely.", "INSERT INTO products (name, category, price, supplier_id) VALUES (…);"],
    solution: "INSERT INTO products (name, category, price, supplier_id) VALUES ('Desk Lamp Pro', 'Electronics', 79.99, 2) RETURNING id, stock;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p03", difficulty: "easy",
    title: "The dormant registration",
    brief: "Import the churned account Mateo Rivas (mateo.rivas@example.com, Valencia, APAC, created 2026-02-01) as INACTIVE — the active flag must be an explicit 0, overriding the column's default.",
    hints: ["Name active in the column list.", "… active, created_at) VALUES (…, 0, '2026-02-01');"],
    solution: "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Mateo Rivas', 'mateo.rivas@example.com', 'Valencia', 'APAC', 0, '2026-02-01') RETURNING id, active;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p04", difficulty: "medium",
    title: "Two tickets, one statement",
    brief: "The fraud team re-enters both disputed orders atomically: customer 5 at 143.86 and customer 11 at 397.99, both pending, created 2024-05-02. One multi-row INSERT — both land or neither does.",
    hints: ["Two tuples, comma-separated, one VALUES clause.", "INSERT INTO orders (…) VALUES (…), (…);"],
    solution: "INSERT INTO orders (customer_id, status, total, created_at) VALUES (5, 'pending', 143.86, '2024-05-02'), (11, 'pending', 397.99, '2024-05-02') RETURNING id, customer_id, total;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p05", difficulty: "medium",
    title: "Clone the pilot mat",
    brief: "Growth wants the Yoga Mat (product 16) duplicated as 'Yoga Mat Eco 6mm (pilot)' — same category, price, stock, supplier — without retyping values. INSERT … SELECT with the concatenated name.",
    hints: ["SELECT feeds the INSERT; || concatenates.", "INSERT INTO products (name, …) SELECT name || ' (pilot)', … FROM products WHERE id = 16;"],
    solution: "INSERT INTO products (name, category, price, stock, supplier_id) SELECT name || ' (pilot)', category, price, stock, supplier_id FROM products WHERE id = 16 RETURNING id, name, price, stock;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p06", difficulty: "easy",
    title: "The line item entry",
    brief: "Order 103 gains a line: 2 units of the USB-C Hub (product 3) at 49.00 unit price. Insert the order_items row — the engine assigns id 252.",
    hints: ["Four columns: order, product, quantity, unit price.", "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (…);"],
    solution: "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (103, 3, 2, 49.00) RETURNING id, order_id, product_id, quantity, unit_price;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p07", difficulty: "medium",
    title: "The pre-assigned flagship",
    brief: "The 2027 import file pre-assigns id 200 to 'Mechanical Keyboard K1 (2027)' (Electronics, 94.99, stock 60, supplier 1). Insert with the EXPLICIT id — the watermark jumps to 200.",
    hints: ["id goes first in the column list.", "INSERT INTO products (id, name, …) VALUES (200, …);"],
    solution: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (200, 'Mechanical Keyboard K1 (2027)', 'Electronics', 94.99, 60, 1) RETURNING id, name, price;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p08", difficulty: "medium",
    title: "Echo the assigned identity",
    brief: "Register lead Noa Fischer (noa.fischer@example.com, Berlin, EU, created 2026-01-15, active) and RETURN her assigned id and active flag in the same statement — the pipeline's atomic receipt.",
    hints: ["Append the echo clause after VALUES.", "… VALUES (…) RETURNING id, active;"],
    solution: "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Noa Fischer', 'noa.fischer@example.com', 'Berlin', 'EU', 1, '2026-01-15') RETURNING id, active;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p09", difficulty: "hard",
    title: "The EDI-reserved vendor id",
    brief: "Procurement registers 'Alpine Audio GmbH — South' (EU, rating 4.8) under the EDI mapping's reserved id 50 — explicitly supplied. Echo id and name via RETURNING.",
    hints: ["Explicit id, then the echo clause.", "INSERT INTO suppliers (id, name, region, rating) VALUES (50, …) RETURNING id, name;"],
    solution: "INSERT INTO suppliers (id, name, region, rating) VALUES (50, 'Alpine Audio GmbH — South', 'EU', 4.8) RETURNING id, name;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p10", difficulty: "medium",
    title: "The EU trio registration",
    brief: "Marketing pre-registers three EU leads in ONE atomic statement, all created 2026-03-01, all active: Lena Hoff (lena.hoff@example.com, Munich), Petr Novak (petr.novak@example.com, Prague), Ana Kova (ana.kova@example.com, Zagreb).",
    hints: ["Three complete tuples.", "VALUES (…), (…), (…);"],
    solution: "INSERT INTO customers (name, email, city, region, active, created_at) VALUES ('Lena Hoff', 'lena.hoff@example.com', 'Munich', 'EU', 1, '2026-03-01'), ('Petr Novak', 'petr.novak@example.com', 'Prague', 'EU', 1, '2026-03-01'), ('Ana Kova', 'ana.kova@example.com', 'Zagreb', 'EU', 1, '2026-03-01');",
    mutating: true,
  }),
  p({
    id: "kb-wi-p11", difficulty: "hard",
    title: "The minimal compliant row",
    brief: "Insert a product supplying ONLY what the schema demands beyond defaults: name 'Probe Min', category 'Audio', price 9.99, supplier 1. stock defaults to 0; the row must land (no NOT NULL violations).",
    hints: ["Four columns is enough — stock defaults.", "INSERT INTO products (name, category, price, supplier_id) VALUES (…);"],
    solution: "INSERT INTO products (name, category, price, supplier_id) VALUES ('Probe Min', 'Audio', 9.99, 1) RETURNING id, name, stock;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p12", difficulty: "easy",
    title: "The standard order entry",
    brief: "Ops' standard entry: customer 3's new order at 364.71, pending, created 2024-04-18 — the four business columns, id auto-assigned (104).",
    hints: ["The entry skeleton's four columns.", "INSERT INTO orders (customer_id, status, total, created_at) VALUES (…);"],
    solution: "INSERT INTO orders (customer_id, status, total, created_at) VALUES (3, 'pending', 364.71, '2024-04-18') RETURNING id, status, total;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p13", difficulty: "medium",
    title: "The staging row",
    brief: "Pricing stages the BT Speaker price candidate: id 960 (reserved block), name 'BT Speaker price candidate', Audio, 64.99, stock 0, supplier 5. Insert the staging row.",
    hints: ["Explicit id from the reserved block.", "INSERT INTO products (id, name, …) VALUES (960, …);"],
    solution: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (960, 'BT Speaker price candidate', 'Audio', 64.99, 0, 5) RETURNING id, price, stock;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p14", difficulty: "hard",
    title: "The audit pair",
    brief: "Inventory logs two audit rows in one statement: id 900 'Audit K1 batch' (Electronics, 89.99, stock 3, supplier 1) and id 901 'Audit HDMI batch' (Accessories, 14.99, stock 100, supplier 1). Explicit ids, one atomic statement.",
    hints: ["Two tuples with explicit ids.", "VALUES (900, …), (901, …);"],
    solution: "INSERT INTO products (id, name, category, price, stock, supplier_id) VALUES (900, 'Audit K1 batch', 'Electronics', 89.99, 3, 1), (901, 'Audit HDMI batch', 'Accessories', 14.99, 100, 1);",
    mutating: true,
  }),
  p({
    id: "kb-wi-p15", difficulty: "hard",
    title: "The frozen-price line",
    brief: "Refund audit re-creates a historical line: order 82 (cancelled), Desk Mat (product 11), quantity 1, at the SALE-TIME price 22.99 — not the catalog's current 24.99. Insert the line item with the frozen figure.",
    hints: ["unit_price freezes the sale-time value.", "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (82, 11, 1, 22.99);"],
    solution: "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (82, 11, 1, 22.99) RETURNING id, unit_price;",
    mutating: true,
  }),
  p({
    id: "kb-wi-p16", difficulty: "hard",
    title: "The batch by fate",
    brief: "The pricing feed delivered three rows: two clean ('Feed Gadget X', Electronics, 59.99, stock 10, supplier 1) and ('Feed Audio Y', Audio, 25.50, stock 4, supplier 5) — plus one defect row your statement must NOT include. Load the two clean rows in one atomic statement.",
    hints: ["Two tuples, one VALUES clause.", "The defect row stays out of the batch."],
    solution: "INSERT INTO products (name, category, price, stock, supplier_id) VALUES ('Feed Gadget X', 'Electronics', 59.99, 10, 1), ('Feed Audio Y', 'Audio', 25.50, 4, 5);",
    mutating: true,
  }),
];
