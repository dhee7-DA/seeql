// Sample database for the "Run" feature: DDL + deterministic seed data.
// Server-only (imports the Prisma client). All queries run against SQLite.

import { db } from "@/lib/db";

export const SAMPLE_TABLES = [
  "payments",
  "ledger_entries",
  "invoices",
  "expenses",
  "order_items",
  "orders",
  "products",
  "suppliers",
  "customers",
  "dim_date",
  "dim_product",
  "dim_customer",
  "dim_store",
  "fact_sales",
  "fact_returns",
  "events_dirty",
] as const;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    rating REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status TEXT NOT NULL,
    total REAL NOT NULL,
    created_at TEXT NOT NULL,
    shipped_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  )`,
  // ---- Module 9 · SQL for Finance: the store's own books ----
  `CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    number TEXT NOT NULL,
    issued_on TEXT NOT NULL,
    due_on TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    paid_on TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    method TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    vendor TEXT NOT NULL,
    spent_on TEXT NOT NULL,
    amount_cents INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ledger_entries (
    id INTEGER PRIMARY KEY,
    entry_date TEXT NOT NULL,
    account TEXT NOT NULL,
    debit_cents INTEGER NOT NULL DEFAULT 0,
    credit_cents INTEGER NOT NULL DEFAULT 0,
    memo TEXT NOT NULL
  )`,
  // ---- Module 14 · Dimensional modeling: the warehouse layer, built FROM the storefront ----
  `CREATE TABLE IF NOT EXISTS dim_date (
    date_key INTEGER PRIMARY KEY,
    iso_date TEXT NOT NULL,
    month TEXT NOT NULL,
    month_name TEXT NOT NULL,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    dow INTEGER NOT NULL,
    is_weekend INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dim_product (
    product_key INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    list_price_cents INTEGER NOT NULL,
    unit_cost_cents INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dim_customer (
    customer_sk INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    active INTEGER NOT NULL,
    valid_from TEXT NOT NULL,
    valid_to TEXT NOT NULL,
    is_current INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dim_store (
    store_key INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fact_sales (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_sk),
    product_key INTEGER NOT NULL REFERENCES dim_product(product_key),
    store_key INTEGER NOT NULL REFERENCES dim_store(store_key),
    quantity INTEGER NOT NULL,
    gross_cents INTEGER NOT NULL,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    net_cents INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fact_returns (
    id INTEGER PRIMARY KEY,
    sales_line_id INTEGER NOT NULL REFERENCES fact_sales(id),
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_sk),
    product_key INTEGER NOT NULL REFERENCES dim_product(product_key),
    store_key INTEGER NOT NULL REFERENCES dim_store(store_key),
    quantity INTEGER NOT NULL,
    refund_cents INTEGER NOT NULL
  )`,
  // ---- Module 11 · messy-data tier: the hand-me-down event log ----
  `CREATE TABLE IF NOT EXISTS events_dirty (
    id INTEGER PRIMARY KEY,
    event_ts TEXT NOT NULL,
    user_id INTEGER,
    action TEXT NOT NULL,
    page TEXT NOT NULL,
    amount_cents
  )`,
];

/* ---------------- deterministic data generation ---------------- */

/** Tiny LCG so the dataset is identical on every reset. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const CUSTOMERS: Array<[string, string, string, string, number, string]> = [
  // name, email, city, region, active, signup
  ["Alice Chen", "alice.chen@example.com", "Berlin", "EU", 1, "2023-11-02"],
  ["Bruno Silva", "bruno.silva@example.com", "São Paulo", "LATAM", 1, "2023-11-17"],
  ["Chloe Dubois", "chloe.dubois@example.com", "Lyon", "EU", 1, "2023-12-05"],
  ["Dmitri Volkov", "d.volkov@example.com", "Tallinn", "EU", 0, "2023-12-19"],
  ["Emma Wilson", "emma.wilson@example.com", "Austin", "US", 1, "2024-01-08"],
  ["Farid Nasser", "farid.n@example.com", "Dubai", "APAC", 1, "2024-01-22"],
  ["Grace Kim", "grace.kim@example.com", "Seoul", "APAC", 1, "2024-02-03"],
  ["Hiro Tanaka", "hiro.tanaka@example.com", "Osaka", "APAC", 1, "2024-02-14"],
  ["Isabella Rossi", "bella.rossi@example.com", "Milan", "EU", 1, "2024-03-01"],
  ["Jamal Wright", "jamal.wright@example.com", "Chicago", "US", 1, "2024-03-18"],
  ["Keiko Sato", "keiko.sato@example.com", "Nagoya", "APAC", 0, "2024-04-02"],
  ["Liam O'Brien", "liam.obrien@example.com", "Cork", "EU", 1, "2024-04-21"],
  ["Maya Patel", "maya.patel@example.com", "Mumbai", "APAC", 1, "2024-05-09"],
  ["Noah Meyer", "noah.meyer@example.com", "Hamburg", "EU", 1, "2024-05-27"],
  ["Olivia Brown", "olivia.brown@example.com", "London", "EU", 1, "2024-06-11"],
  ["Pedro Alvarez", "pedro.alv@example.com", "Madrid", "EU", 1, "2024-07-03"],
];

const SUPPLIERS: Array<[string, string, number]> = [
  ["Nordic Gadgets AB", "EU", 4.6],
  ["Shenzhen Electro", "APAC", 4.1],
  ["Pacific Textiles", "APAC", 3.9],
  ["Midwest Hardware Co", "US", 4.4],
  ["Alpine Audio GmbH", "EU", 4.8],
  ["Andes Naturals SA", "LATAM", 4.0],
];

const PRODUCTS: Array<[string, string, number, number]> = [
  // name, category, price, stock
  ["Mechanical Keyboard K1", "Electronics", 89.99, 120],
  ["Wireless Mouse M3", "Electronics", 34.5, 300],
  ["USB-C Hub 7-in-1", "Electronics", 49.0, 85],
  ["Noise-Canceling Headset", "Audio", 149.99, 60],
  ["Studio Desktop Mic", "Audio", 119.0, 45],
  ["Bluetooth Speaker Mini", "Audio", 59.99, 210],
  ["4K Webcam Pro", "Video", 129.0, 70],
  ["Ring Light 14\"", "Video", 39.99, 150],
  ["HDMI 2.1 Cable 2m", "Accessories", 14.99, 500],
  ["Laptop Stand Aluminum", "Accessories", 42.5, 180],
  ["Desk Mat Extended", "Accessories", 24.99, 260],
  ["Fitness Band X2", "Wearables", 79.0, 95],
  ["Smart Watch S", "Wearables", 199.99, 40],
  ["Running Socks 3-pack", "Apparel", 18.5, 400],
  ["Cycling Jersey Pro", "Apparel", 65.0, 110],
  ["Yoga Mat Eco 6mm", "Fitness", 32.0, 220],
];

const STATUSES = ["delivered", "delivered", "delivered", "delivered", "delivered", "shipped", "shipped", "shipped", "pending", "pending", "cancelled"] as const;

interface SeedRow {
  table: string;
  values: Array<string | number | null>;
}

function buildSeed(): { rows: SeedRow[]; counts: Record<string, number> } {
  const rng = makeRng(20240601);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const rows: SeedRow[] = [];
  const counts: Record<string, number> = {};

  CUSTOMERS.forEach((c, i) =>
    rows.push({ table: "customers", values: [i + 1, c[0], c[1], c[2], c[3], c[4], c[5]] }),
  );
  SUPPLIERS.forEach((s, i) =>
    rows.push({ table: "suppliers", values: [i + 1, s[0], s[1], s[2]] }),
  );
  PRODUCTS.forEach((p, i) => {
    const supplierId = (i % SUPPLIERS.length) + 1;
    rows.push({ table: "products", values: [i + 1, p[0], p[1], p[2], p[3], supplierId] });
  });

  // Customers 1, 5, 7, 13 are "power buyers" — weighted so aggregates are interesting.
  const heavy = new Set([0, 4, 6, 12]);
  const customerPool: number[] = [];
  CUSTOMERS.forEach((_, i) => {
    const weight = heavy.has(i) ? 8 : 2;
    for (let w = 0; w < weight; w++) customerPool.push(i + 1);
  });

  let orderId = 0;
  let itemId = 0;
  const months = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02"];

  for (let m = 0; m < months.length; m++) {
    const ordersThisMonth = 6 + Math.floor(rng() * 4); // 6-9 orders per month
    for (let k = 0; k < ordersThisMonth; k++) {
      orderId++;
      const customerId = pick(customerPool);
      const status = pick(STATUSES);
      const day = 1 + Math.floor(rng() * 27);
      const created = `${months[m]}-${String(day).padStart(2, "0")}`;

      // 1-4 distinct items per order
      const itemCount = 1 + Math.floor(rng() * 4);
      const usedProducts = new Set<number>();
      let total = 0;
      const itemRows: Array<[number, number, number]> = [];
      for (let j = 0; j < itemCount; j++) {
        let productId = Math.floor(rng() * PRODUCTS.length) + 1;
        let guard = 0;
        while (usedProducts.has(productId) && guard++ < 10) {
          productId = Math.floor(rng() * PRODUCTS.length) + 1;
        }
        usedProducts.add(productId);
        const product = PRODUCTS[productId - 1];
        const quantity = 1 + Math.floor(rng() * 3);
        const unitPrice = Math.round(product[2] * (0.95 + rng() * 0.1) * 100) / 100;
        total += quantity * unitPrice;
        itemRows.push([productId, quantity, unitPrice]);
      }
      total = Math.round(total * 100) / 100;

      // shipped_at: set once the order leaves the warehouse — pending and
      // cancelled orders keep it NULL (this is the lesson-4 teaching data).
      let shippedAt: string | null = null;
      if (status === "delivered" || status === "shipped") {
        const d = new Date(`${created}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + 2 + Math.floor(rng() * 3));
        shippedAt = d.toISOString().slice(0, 10);
      }
      rows.push({ table: "orders", values: [orderId, customerId, status, total, created, shippedAt] });
      for (const [productId, quantity, unitPrice] of itemRows) {
        itemId++;
        rows.push({ table: "order_items", values: [itemId, orderId, productId, quantity, unitPrice] });
      }
    }
  }

  for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
    counts[t] = rows.filter((r) => r.table === t).length;
  }
  return { rows, counts };
}

/* ---------------- Module 9 · the store's own books ----------------
 *
 * Hand-authored (not LCG) so every teaching fact is deliberate: the AR
 * aging ladder spans all four buckets, one invoice is partially paid,
 * one void invoice must never reach revenue, and two reconciliation
 * catches are planted — invoice 28 is marked paid with NO payment rows,
 * and invoice 11 (void) HAS a payment row: 92500 cents of refund owed.
 * All money is INTEGER cents; the books run 2024-01 → 2025-02 and every
 * lesson treats 2025-03-15 as "today" (a fixed AS OF date, never now()).
 */

const FINANCE_AS_OF = "2025-03-15";

/** [customerId, number, issued_on, due_on, amount_cents, status] */
const INVOICES: Array<[number, string, string, string, number, string]> = [
  [1, "INV-2024-001", "2024-02-05", "2024-03-06", 486000, "paid"],
  [5, "INV-2024-002", "2024-02-18", "2024-03-19", 214300, "paid"],
  [7, "INV-2024-003", "2024-03-04", "2024-04-03", 342000, "paid"],
  [13, "INV-2024-004", "2024-03-21", "2024-04-20", 158900, "paid"],
  [1, "INV-2024-005", "2024-04-09", "2024-05-09", 528400, "paid"],
  [9, "INV-2024-006", "2024-05-02", "2024-06-01", 233600, "paid"],
  [13, "INV-2024-007", "2024-05-15", "2024-06-14", 198200, "paid"],
  [5, "INV-2024-008", "2024-06-06", "2024-07-06", 401500, "paid"],
  [10, "INV-2024-009", "2024-06-19", "2024-07-19", 187300, "paid"],
  [7, "INV-2024-010", "2024-07-08", "2024-08-07", 296800, "paid"],
  [12, "INV-2024-011", "2024-07-24", "2024-08-23", 92500, "void"],
  [1, "INV-2024-012", "2024-08-07", "2024-09-06", 472300, "paid"],
  [15, "INV-2024-013", "2024-08-21", "2024-09-20", 254700, "paid"],
  [13, "INV-2024-014", "2024-09-05", "2024-10-05", 351200, "paid"],
  [5, "INV-2024-015", "2024-09-18", "2024-10-18", 228900, "paid"],
  [9, "INV-2024-016", "2024-10-03", "2024-11-02", 389600, "paid"],
  [10, "INV-2024-017", "2024-10-17", "2024-11-16", 141800, "paid"],
  [16, "INV-2024-018", "2024-10-29", "2024-11-28", 87300, "open"],
  [1, "INV-2024-019", "2024-11-06", "2024-12-06", 561400, "paid"],
  [7, "INV-2024-020", "2024-11-20", "2024-12-20", 268300, "paid"],
  [3, "INV-2024-021", "2024-12-11", "2025-01-10", 129500, "open"],
  [13, "INV-2024-022", "2024-12-04", "2025-01-03", 445900, "paid"],
  [15, "INV-2024-023", "2024-12-17", "2025-01-16", 307600, "paid"],
  [5, "INV-2025-024", "2025-01-08", "2025-02-07", 493700, "open"],
  [1, "INV-2025-025", "2025-01-22", "2025-02-21", 614800, "open"],
  [12, "INV-2025-026", "2025-02-05", "2025-03-07", 356200, "open"],
  [9, "INV-2025-027", "2025-02-19", "2025-03-21", 279400, "open"],
  [8, "INV-2025-028", "2025-02-12", "2025-03-14", 175600, "paid"],
];

/** [invoiceId, paid_on, amount_cents, method] — invoice 11 (VOID) has a
 *  payment (refund owed); invoice 25 gets a genuine PARTIAL payment
 *  (400000 of 614800); invoice 28 has none (books bug). */
const PAYMENTS: Array<[number, string, number, string]> = [
  [1, "2024-02-20", 243000, "card"],
  [1, "2024-03-05", 243000, "wire"],
  [2, "2024-03-11", 214300, "card"],
  [3, "2024-03-28", 342000, "wire"],
  [4, "2024-04-15", 158900, "card"],
  [5, "2024-04-22", 264200, "card"],
  [5, "2024-05-07", 264200, "wire"],
  [6, "2024-05-27", 233600, "card"],
  [7, "2024-06-10", 198200, "wire"],
  [8, "2024-07-01", 401500, "card"],
  [9, "2024-07-15", 187300, "card"],
  [10, "2024-08-02", 296800, "wire"],
  [12, "2024-08-25", 236150, "card"],
  [12, "2024-09-04", 236150, "wire"],
  [13, "2024-09-15", 254700, "card"],
  [14, "2024-09-30", 351200, "wire"],
  [15, "2024-10-14", 228900, "card"],
  [16, "2024-10-28", 389600, "wire"],
  [19, "2024-11-25", 280700, "card"],
  [19, "2024-12-05", 280700, "wire"],
  [20, "2024-12-16", 268300, "card"],
  [11, "2024-08-20", 92500, "card"],
  [17, "2025-01-09", 141800, "card"],
  [22, "2025-01-13", 222950, "card"],
  [22, "2025-01-28", 222950, "wire"],
  [23, "2025-02-10", 307600, "card"],
  [25, "2025-02-10", 400000, "wire"],
];

/** [category, vendor, spent_on, amount_cents] — August 2024 carries the
 *  deliberate travel spike (the trade show) for the outliers lesson. */
const EXPENSES: Array<[string, string, string, number]> = [
  ["Rent", "Atlas Property GmbH", "2024-01-01", 120000],
  ["Ads", "AdWorks Media", "2024-01-12", 22000],
  ["Tools", "DevTools Inc", "2024-01-15", 29900],
  ["Rent", "Atlas Property GmbH", "2024-02-01", 120000],
  ["Ads", "AdWorks Media", "2024-02-09", 24000],
  ["Rent", "Atlas Property GmbH", "2024-03-01", 120000],
  ["Ads", "AdWorks Media", "2024-03-08", 26500],
  ["Travel", "Skyline Travel", "2024-03-14", 45200],
  ["Rent", "Atlas Property GmbH", "2024-04-01", 120000],
  ["Ads", "AdWorks Media", "2024-04-10", 25000],
  ["Tools", "DevTools Inc", "2024-04-15", 29900],
  ["Rent", "Atlas Property GmbH", "2024-05-01", 120000],
  ["Ads", "AdWorks Media", "2024-05-13", 28000],
  ["Rent", "Atlas Property GmbH", "2024-06-01", 120000],
  ["Ads", "AdWorks Media", "2024-06-07", 31000],
  ["Rent", "Atlas Property GmbH", "2024-07-01", 120000],
  ["Ads", "AdWorks Media", "2024-07-11", 29500],
  ["Tools", "DevTools Inc", "2024-07-15", 29900],
  ["Rent", "Atlas Property GmbH", "2024-08-01", 120000],
  ["Ads", "AdWorks Media", "2024-08-09", 33000],
  ["Travel", "Skyline Travel", "2024-08-16", 168000],
  ["Rent", "Atlas Property GmbH", "2024-09-01", 120000],
  ["Ads", "AdWorks Media", "2024-09-12", 34500],
  ["Rent", "Atlas Property GmbH", "2024-10-01", 120000],
  ["Ads", "AdWorks Media", "2024-10-10", 36000],
  ["Tools", "DevTools Inc", "2024-10-15", 29900],
  ["Rent", "Atlas Property GmbH", "2024-11-01", 120000],
  ["Ads", "AdWorks Media", "2024-11-08", 38500],
  ["Travel", "Skyline Travel", "2024-11-07", 38900],
  ["Rent", "Atlas Property GmbH", "2024-12-01", 120000],
  ["Ads", "AdWorks Media", "2024-12-13", 41000],
  ["Rent", "Atlas Property GmbH", "2025-01-01", 120000],
  ["Ads", "AdWorks Media", "2025-01-10", 43000],
  ["Tools", "DevTools Inc", "2025-01-15", 32900],
  ["Rent", "Atlas Property GmbH", "2025-02-01", 120000],
  ["Ads", "AdWorks Media", "2025-02-14", 45000],
];

function buildFinanceSeed(): { rows: SeedRow[]; counts: Record<string, number> } {
  const rows: SeedRow[] = [];
  const push = (table: string, values: Array<string | number | null>) => rows.push({ table, values });

  let invoiceId = 0;
  for (const [cust, number, issued, due, amount, status] of INVOICES) {
    invoiceId++;
    push("invoices", [invoiceId, cust, number, issued, due, amount, status]);
  }
  let paymentId = 0;
  for (const [invId, paidOn, amount, method] of PAYMENTS) {
    paymentId++;
    push("payments", [paymentId, invId, paidOn, amount, method]);
  }
  let expenseId = 0;
  for (const [category, vendor, spentOn, amount] of EXPENSES) {
    expenseId++;
    push("expenses", [expenseId, category, vendor, spentOn, amount]);
  }

  // Double-entry legs, COMPUTED from the arrays above so debits always
  // equal credits by construction: revenue pair, expense pair, collection
  // pair — booked on each month's last day, in month order.
  const monthOf = (d: string) => d.slice(0, 7);
  const months: string[] = [];
  for (let i = 0; i < 14; i++) {
    const y = 2024 + Math.floor(i / 12);
    const m = (i % 12) + 1;
    months.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  const lastDay = (mon: string) => {
    const [y, m] = mon.split("-").map(Number);
    return `${mon}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
  };

  let ledgerId = 0;
  for (const mon of months) {
    const end = lastDay(mon);
    const exp = EXPENSES.filter((e) => monthOf(e[2]) === mon).reduce((a, e) => a + e[3], 0);
    if (exp > 0) {
      push("ledger_entries", [++ledgerId, end, "operating_expenses", exp, 0, `${mon} · operating expenses incurred`]);
      push("ledger_entries", [++ledgerId, end, "cash", 0, exp, `${mon} · operating expenses paid from cash`]);
    }
    const rev = INVOICES.filter((i) => i[5] !== "void" && monthOf(i[2]) === mon).reduce((a, i) => a + i[4], 0);
    if (rev > 0) {
      push("ledger_entries", [++ledgerId, end, "accounts_receivable", rev, 0, `${mon} · invoices issued`]);
      push("ledger_entries", [++ledgerId, end, "sales_revenue", 0, rev, `${mon} · sales revenue recognized`]);
    }
    const col = PAYMENTS.filter((p) => monthOf(p[1]) === mon).reduce((a, p) => a + p[2], 0);
    if (col > 0) {
      push("ledger_entries", [++ledgerId, end, "cash", col, 0, `${mon} · collections received`]);
      push("ledger_entries", [++ledgerId, end, "accounts_receivable", 0, col, `${mon} · customer balances settled`]);
    }
  }

  const counts: Record<string, number> = {};
  for (const t of ["invoices", "payments", "expenses", "ledger_entries"]) {
    counts[t] = rows.filter((r) => r.table === t).length;
  }
  return { rows, counts };
}

export const FINANCE_FACTS = { asOf: FINANCE_AS_OF };

/* ---------------- Module 14 · the warehouse layer ----------------
 *
 * Derived from the storefront at load time (fact_sales is literally
 * order_items joined to non-cancelled orders), so every warehouse number
 * can be contracted against its source. Four dimensions orbit the fact:
 * dim_date (425-day spine), dim_product (with a department rollup and
 * real unit costs), dim_store (4 locations) and dim_customer — an SCD
 * Type 2 dimension: five buyers moved region during the window, so 16
 * buyers become 21 versions with half-open [valid_from, valid_to)
 * windows ('9999-12-31' as the open end). fact_returns re-uses the SAME
 * dimensions — that conformance is what makes cross-fact analysis safe.
 */

const TECH_CATEGORIES = new Set(["Electronics", "Audio", "Video", "Accessories", "Wearables"]);

/** unit cost per product id (cents) — hand-set so margin math is real. */
const UNIT_COST_CENTS: Record<number, number> = {
  1: 4400, 2: 1700, 3: 2600, 4: 8200, 5: 6400, 6: 3100, 7: 7100, 8: 2100,
  9: 800, 10: 2300, 11: 1300, 12: 4100, 13: 10500, 14: 900, 15: 3300, 16: 1500,
};

/** region moves: customer_id → (new region, change date). Five movers turn
 *  16 buyers into 21 SCD Type 2 versions. */
const REGION_MOVES: Record<number, Array<[string, string]>> = {
  1: [["US", "2024-10-01"]],
  2: [["US", "2024-08-01"]],
  7: [["EU", "2025-01-15"]],
  10: [["APAC", "2024-06-15"]],
  15: [["LATAM", "2024-11-01"]],
};

const STORES: Array<[string, string, string]> = [
  ["Flagship Berlin", "Berlin", "EU"],
  ["Austin Depot", "Austin", "US"],
  ["Osaka Annex", "Osaka", "APAC"],
  ["São Paulo Hub", "São Paulo", "LATAM"],
];

function isoAddDay(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildWarehouseSeed(): { rows: SeedRow[]; counts: Record<string, number> } {
  const rows: SeedRow[] = [];
  const counts: Record<string, number> = {};

  // dim_date — 2024-01-01 → 2025-02-28, 425 days.
  let dateKey = 20240101;
  let spine = 0;
  {
    const d = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2025-02-28T00:00:00Z");
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    while (d <= end) {
      spine++;
      const iso = d.toISOString().slice(0, 10);
      const key = Number(iso.replaceAll("-", ""));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const dow = d.getUTCDay(); // 0 = Sunday
      rows.push({
        table: "dim_date",
        values: [key, iso, `${y}-${String(m + 1).padStart(2, "0")}`, monthNames[m], Math.floor(m / 3) + 1, y, dow, dow === 0 || dow === 6 ? 1 : 0],
      });
      d.setUTCDate(d.getUTCDate() + 1);
    }
    dateKey = Number("20240101");
    void dateKey;
  }

  // dim_product — the storefront catalog with the merchandising rollup.
  PRODUCTS.forEach((p, i) => {
    const priceCents = Math.round(p[2] * 100);
    rows.push({
      table: "dim_product",
      values: [i + 1, p[0], p[1], TECH_CATEGORIES.has(p[1]) ? "Tech" : "Lifestyle", priceCents, UNIT_COST_CENTS[i + 1]],
    });
  });

  // dim_store — four locations.
  STORES.forEach((s, i) => rows.push({ table: "dim_store", values: [i + 1, s[0], s[1], s[2]] }));

  // dim_customer — SCD Type 2. Versions per buyer in id order; the
  // surrogate key (customer_sk) is the fact's handle, not customer_id.
  const CUSTOMER_SIGNUP = new Map<number, string>();
  const CUSTOMER_ACTIVE = new Map<number, number>();
  const CUSTOMER_NAME = new Map<number, string>();
  let sk = 0;
  const versionOf = new Map<number, Array<{ sk: number; validFrom: string; validTo: string; region: string }>>();
  CUSTOMERS.forEach((c, i) => {
    const cid = i + 1;
    CUSTOMER_SIGNUP.set(cid, c[5]);
    CUSTOMER_ACTIVE.set(cid, c[4]);
    CUSTOMER_NAME.set(cid, c[0]);
    const moves = REGION_MOVES[cid] ?? [];
    // half-open windows: [from, to) — the dimension's history starts BEFORE
    // the source's (1900-01-01) so every sale date resolves; the buyer's
    // ORIGINAL region holds until the first move date, each move opens the
    // next version, and the current one runs to the open end.
    const versions: Array<{ region: string; from: string; to: string }> = [];
    for (let v = 0; v <= moves.length; v++) {
      versions.push({
        region: v === 0 ? c[3] : moves[v - 1][0],
        from: v === 0 ? "1900-01-01" : moves[v - 1][1],
        to: v < moves.length ? moves[v][1] : "9999-12-31",
      });
    }
    const list: Array<{ sk: number; validFrom: string; validTo: string; region: string }> = [];
    for (const v of versions) {
      sk++;
      rows.push({
        table: "dim_customer",
        values: [sk, cid, c[0], v.region, c[4], v.from, v.to, v.to === "9999-12-31" ? 1 : 0],
      });
      list.push({ sk, validFrom: v.from, validTo: v.to, region: v.region });
    }
    versionOf.set(cid, list);
  });

  /** as-of resolution: the version whose half-open window contains `date`. */
  const resolveSk = (cid: number, date: string): number => {
    const list = versionOf.get(cid)!;
    const hit = list.find((v) => date >= v.validFrom && date < v.validTo);
    return (hit ?? list[list.length - 1]).sk;
  };

  // fact_sales — one row per order LINE of a non-cancelled order.
  const storefront = buildSeed();
  const orderById = new Map<number, { customer_id: number; created_at: string }>();
  for (const r of storefront.rows) {
    if (r.table === "orders") orderById.set(r.values[0] as number, { customer_id: r.values[1] as number, created_at: r.values[4] as string });
  }
  let factId = 0;
  const facts: Array<{ id: number; orderId: number; dateKey: number; sk: number; productKey: number; storeKey: number; qty: number; gross: number; discount: number; net: number; saleDate: string }> = [];
  for (const r of storefront.rows) {
    if (r.table !== "order_items") continue;
    const orderId = r.values[1] as number;
    const order = orderById.get(orderId)!;
    // the operational status lives on the order — cancelled never sold
    const status = storefront.rows.find((o) => o.table === "orders" && o.values[0] === orderId)!.values[2] as string;
    if (status === "cancelled") continue;
    factId++;
    const saleDate = order.created_at;
    const dateKey = Number(saleDate.replaceAll("-", ""));
    const qty = r.values[3] as number;
    const gross = Math.round((r.values[4] as number) * 100) * qty;
    const discount = factId % 8 === 3 ? Math.round(gross * 0.1) : 0;
    const fact = {
      id: factId,
      orderId,
      dateKey,
      sk: resolveSk(order.customer_id, saleDate),
      productKey: r.values[2] as number,
      storeKey: ((orderId - 1) * 7 + 3) % 4 + 1,
      qty,
      gross,
      discount,
      net: gross - discount,
      saleDate,
    };
    facts.push(fact);
    rows.push({
      table: "fact_sales",
      values: [fact.id, fact.orderId, fact.dateKey, fact.sk, fact.productKey, fact.storeKey, fact.qty, fact.gross, fact.discount, fact.net],
    });
  }

  // fact_returns — a slice of sold lines coming back, re-using the SAME
  // dimensions (conformance): the return date resolves the customer afresh.
  let returnId = 0;
  for (const f of facts) {
    if (f.id % 17 !== 5) continue;
    returnId++;
    const returnDate = isoAddDay(f.saleDate, 3 + (f.id % 10)) > "2025-02-28" ? "2025-02-28" : isoAddDay(f.saleDate, 3 + (f.id % 10));
    const returnKey = Number(returnDate.replaceAll("-", ""));
    const custId = [...versionOf.entries()].find(([, list]) => list.some((v) => v.sk === f.sk))![0];
    rows.push({
      table: "fact_returns",
      values: [returnId, f.id, returnKey, resolveSk(custId, returnDate), f.productKey, f.storeKey, 1, Math.round(f.net / f.qty)],
    });
  }

  for (const t of ["dim_date", "dim_product", "dim_customer", "dim_store", "fact_sales", "fact_returns"]) {
    counts[t] = rows.filter((r) => r.table === t).length;
  }
  void spine;
  return { rows, counts };
}

export const WAREHOUSE_FACTS = {
  spine: 425,
  buyers: 16,
  versions: 21,
  movers: 5,
  stores: 4,
  departments: ["Tech", "Lifestyle"],
  openEnd: "9999-12-31",
};

/* ---------------- Module 11 · the hand-me-down event log ----------------
 *
 * 627 rows, January 2025, deterministic by construction. Six planted dirt
 * classes with exact counts (verified by scripts/warehouse-facts.ts):
 * replays (exact duplicate rows — 38 single pairs plus one 8-copy burst),
 * anonymous traffic (user_id NULL), bot orphans (ids 901+), drifted
 * timestamps (space instead of T), whitespace pages, and broken money
 * (amounts that arrived as text). The fingerprint (event_ts, user,
 * canonical action, trimmed page, amount) dedupes to a clean set with
 * keep-first provenance; the publish gate re-checks every count.
 */

const DIRTY_ACTION_VARIANTS = [
  "page_view", "Page_View", "page_view ", "PAGE_VIEW", // page_view × 4
  "product_view", "Product_View", // product_view × 2
  "add_to_cart", " add_to_cart", // add_to_cart × 2
  "checkout", // checkout × 1
] as const;
const DIRTY_PAGE_VARIANTS = ["home", " home", "catalog", "catalog ", "cart", "pay", "confirm", "account"] as const;

function buildDirtyEventsSeed(): { rows: SeedRow[]; counts: Record<string, number> } {
  const rows: SeedRow[] = [];
  // user pool: user 5 is the whale (the burst belongs to it)
  const pool: number[] = [];
  for (let u = 1; u <= 16; u++) for (let w = 0; w < (u === 5 ? 10 : 2); w++) pool.push(u);

  const base: Array<{ ts: string; user: number | null; action: string; page: string; amount: number | string | null }> = [];
  for (let i = 1; i <= 582; i++) {
    // timestamps: 2025-01-01T00:01:40Z + i·4600s — one per ~77 minutes
    const epoch = 1735689700 + i * 4600 + (i % 13) * 7;
    const iso = new Date(epoch * 1000).toISOString().slice(0, 19);
    const drifted = i % 7 === 2 ? iso.replace("T", " ") : iso;
    let user: number | null;
    if (i % 23 === 3) user = null; // anonymous
    else if ((i - 9) % 23 === 0 && i <= 377) user = 900 + Math.ceil(i / 23) - 0; // bot orphan
    else if (i === 123) user = 5; // the burst's owner
    else user = pool[i % pool.length];
    const action = DIRTY_ACTION_VARIANTS[i % 9];
    const page = DIRTY_PAGE_VARIANTS[i % 8];
    const isCheckout = action === "checkout";
    let amount: number | string | null = isCheckout ? 1500 + ((i * 7) % 235) * 100 : null;
    base.push({ ts: drifted, user, action, page, amount });
  }
  // five broken-money rows: checkout amounts that arrived as text
  const checkoutRows = base.map((b, idx) => ({ b, idx })).filter(({ b }) => b.action === "checkout" && b.amount !== null);
  for (const { b } of checkoutRows.slice(4, 9)) b.amount = ["12,500", "n/a", "3,140.50", "—", "980"][checkoutRows.findIndex(({ b: x }) => x === b) % 5] ?? "n/a";
  // money contract: integer amounts sum to exactly 3,217,147 cents
  let sum = 0;
  for (const b of base) if (typeof b.amount === "number") sum += b.amount;
  const lastNumeric = [...base].reverse().find((b) => typeof b.amount === "number")!;
  lastNumeric.amount = (lastNumeric.amount as number) + (3217147 - sum);

  // replays: 38 exact copies of spread known-user rows + one 8-copy burst
  const replaySources: number[] = [];
  for (let k = 0; replaySources.length < 38 && k < base.length; k += 3) {
    const row = base[k];
    if (row.user !== null && row.user < 900) replaySources.push(k);
  }
  const all: Array<typeof base[number]> = [...base];
  for (const src of replaySources) all.push({ ...base[src] });
  for (let c = 0; c < 7; c++) all.push({ ...base[122] }); // the burst (row 123, user 5)

  all.forEach((r, idx) => rows.push({ table: "events_dirty", values: [idx + 1, r.ts, r.user, r.action, r.page, r.amount] }));

  const counts = { events_dirty: rows.length };
  return { rows, counts };
}

export const DIRTY_FACTS = { window: "2025-01", raw: 627, clean: 582, quarantined: 45 };

/* ---------------- lifecycle ---------------- */

async function insertSeed() {
  const storefront = buildSeed();
  const finance = buildFinanceSeed();
  const warehouse = buildWarehouseSeed();
  const dirty = buildDirtyEventsSeed();
  const rows = [...storefront.rows, ...finance.rows, ...warehouse.rows, ...dirty.rows];
  const statements: Array<[string, Array<string | number | null>]> = [];
  const columns: Record<string, string[]> = {
    customers: ["id", "name", "email", "city", "region", "active", "created_at"],
    suppliers: ["id", "name", "region", "rating"],
    products: ["id", "name", "category", "price", "stock", "supplier_id"],
    orders: ["id", "customer_id", "status", "total", "created_at", "shipped_at"],
    order_items: ["id", "order_id", "product_id", "quantity", "unit_price"],
    invoices: ["id", "customer_id", "number", "issued_on", "due_on", "amount_cents", "status"],
    payments: ["id", "invoice_id", "paid_on", "amount_cents", "method"],
    expenses: ["id", "category", "vendor", "spent_on", "amount_cents"],
    ledger_entries: ["id", "entry_date", "account", "debit_cents", "credit_cents", "memo"],
    dim_date: ["date_key", "iso_date", "month", "month_name", "quarter", "year", "dow", "is_weekend"],
    dim_product: ["product_key", "name", "category", "department", "list_price_cents", "unit_cost_cents"],
    dim_customer: ["customer_sk", "customer_id", "name", "region", "active", "valid_from", "valid_to", "is_current"],
    dim_store: ["store_key", "name", "city", "region"],
    fact_sales: ["id", "order_id", "date_key", "customer_key", "product_key", "store_key", "quantity", "gross_cents", "discount_cents", "net_cents"],
    fact_returns: ["id", "sales_line_id", "date_key", "customer_key", "product_key", "store_key", "quantity", "refund_cents"],
    events_dirty: ["id", "event_ts", "user_id", "action", "page", "amount_cents"],
  };
  for (const r of rows) {
    const cols = columns[r.table];
    const placeholders = cols.map(() => "?").join(", ");
    statements.push([
      `INSERT INTO ${r.table} (${cols.join(", ")}) VALUES (${placeholders})`,
      r.values,
    ]);
  }
  await execBatched(statements);
}

/** Execute many parameterized statements in one transaction, chunked into
 *  multi-row INSERTs where the statements share a table. 1,600 single-row
 *  round-trips take minutes; ~30 chunked statements take under a second. */
async function execBatched(statements: Array<[string, Array<string | number | null>]>): Promise<void> {
  const INSERT_RE = /^INSERT INTO (\w+) \(([^(]+)\) VALUES \(([^)]+)\)$/;
  const batched: Array<[string, Array<string | number | null>]> = [];
  let i = 0;
  while (i < statements.length) {
    const [sql, args] = statements[i];
    const m = INSERT_RE.exec(sql);
    if (!m) {
      batched.push([sql, args]);
      i++;
      continue;
    }
    const [, table, cols, oneRow] = m;
    const width = args.length;
    const tuples: Array<Array<string | number | null>> = [args];
    let j = i + 1;
    while (j < statements.length && tuples.length < 400) {
      const m2 = INSERT_RE.exec(statements[j][0]);
      if (!m2 || m2[1] !== table || m2[2] !== cols || statements[j][1].length !== width) break;
      tuples.push(statements[j][1]);
      j++;
    }
    if (tuples.length === 1) batched.push([sql, args]);
    else batched.push([`INSERT INTO ${table} (${cols}) VALUES ${tuples.map(() => `(${oneRow})`).join(", ")}`, tuples.flat()]);
    i = j;
  }
  await db.$transaction(batched.map(([sql, args]) => db.$executeRawUnsafe(sql, ...args)));
}

/** Create tables if missing and seed when empty. Safe to call repeatedly.
 *  Self-heals stale db files: `CREATE TABLE IF NOT EXISTS` cannot add columns
 *  to an existing table, so if `orders` lacks a column the DDL expects
 *  (shipped_at was added later), the sample dataset is dropped and reseeded. */
// Single-flight: the playground fires /api/query and /api/stats (and the
// learn app can fire more) in parallel on cold start — without this lock
// both callers see an empty database and both seed, and the loser dies on
// "UNIQUE constraint failed: customers.id". The promise lives on globalThis
// because Next bundles sample-db into EACH route separately — a module-level
// variable would give every route its own lock and serialize nothing.
const globalForSeed = globalThis as unknown as { __seeqlEnsure?: Promise<void> };

export function ensureDatabase(): Promise<void> {
  if (!globalForSeed.__seeqlEnsure) {
    globalForSeed.__seeqlEnsure = runEnsure().catch((err) => {
      globalForSeed.__seeqlEnsure = undefined; // failed — allow the next call to retry
      throw err;
    });
  }
  return globalForSeed.__seeqlEnsure;
}

async function runEnsure(): Promise<void> {
  for (const stmt of DDL) await db.$executeRawUnsafe(stmt);
  const cols = (await db.$queryRawUnsafe(`PRAGMA table_info(orders)`)) as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "shipped_at")) {
    await resetDatabase();
    return;
  }
  const res = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM customers`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(res[0]?.n ?? 0) === 0) {
    await insertSeed();
    return;
  }
  // Self-heal for databases seeded before Module 9: storefront present,
  // books missing — insert just the finance rows.
  const inv = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM invoices`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(inv[0]?.n ?? 0) === 0) {
    await insertTier(buildFinanceSeed(), {
      invoices: ["id", "customer_id", "number", "issued_on", "due_on", "amount_cents", "status"],
      payments: ["id", "invoice_id", "paid_on", "amount_cents", "method"],
      expenses: ["id", "category", "vendor", "spent_on", "amount_cents"],
      ledger_entries: ["id", "entry_date", "account", "debit_cents", "credit_cents", "memo"],
    });
  }
  // Self-heal for databases seeded before Module 14: storefront and books
  // present, warehouse missing — insert just the modeling rows.
  const dim = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM dim_date`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(dim[0]?.n ?? 0) === 0) {
    await insertTier(buildWarehouseSeed(), {
      dim_date: ["date_key", "iso_date", "month", "month_name", "quarter", "year", "dow", "is_weekend"],
      dim_product: ["product_key", "name", "category", "department", "list_price_cents", "unit_cost_cents"],
      dim_customer: ["customer_sk", "customer_id", "name", "region", "active", "valid_from", "valid_to", "is_current"],
      dim_store: ["store_key", "name", "city", "region"],
      fact_sales: ["id", "order_id", "date_key", "customer_key", "product_key", "store_key", "quantity", "gross_cents", "discount_cents", "net_cents"],
      fact_returns: ["id", "sales_line_id", "date_key", "customer_key", "product_key", "store_key", "quantity", "refund_cents"],
    });
  }
  // Self-heal for databases seeded before the messy-events tier: the log
  // arrives after the warehouse — insert just the dirty rows.
  const ev = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM events_dirty`)) as Array<{
    n: number | bigint;
  }>;
  if (Number(ev[0]?.n ?? 0) === 0) {
    await insertTier(buildDirtyEventsSeed(), { events_dirty: ["id", "event_ts", "user_id", "action", "page", "amount_cents"] });
  }
}

/** Insert one tier's rows with an explicit column map (self-heal path). */
async function insertTier(
  tier: { rows: SeedRow[] },
  colsMap: Record<string, string[]>,
): Promise<void> {
  const statements: Array<[string, Array<string | number | null>]> = [];
  for (const r of tier.rows) {
    const cs = colsMap[r.table];
    statements.push([
      `INSERT INTO ${r.table} (${cs.join(", ")}) VALUES (${cs.map(() => "?").join(", ")})`,
      r.values,
    ]);
  }
  await execBatched(statements);
}

/** Drop + recreate + reseed everything. */
export async function resetDatabase(): Promise<Record<string, number>> {
  await db.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`);
  try {
    for (const t of SAMPLE_TABLES) await db.$executeRawUnsafe(`DROP TABLE IF EXISTS ${t}`);
  } finally {
    await db.$executeRawUnsafe(`PRAGMA foreign_keys = ON`);
  }
  for (const stmt of DDL) await db.$executeRawUnsafe(stmt);
  await insertSeed();
  return { ...buildSeed().counts, ...buildFinanceSeed().counts, ...buildWarehouseSeed().counts, ...buildDirtyEventsSeed().counts };
}
