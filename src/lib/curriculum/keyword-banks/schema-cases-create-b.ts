// M8 schema-bank cases — CREATE TABLE (part B, medium cs-2703..cs-2712 +
// hard cs-2713..cs-2720, topic d1). Executed by scripts/m8-schema-audit.ts.
import type { CaseStudy } from "../cases/types";

export const schemaCasesCreateB: CaseStudy[] = [
  {
    id: "cs-2703", tier: "medium", topic: "d1", universe: "catalog",
    title: "The pairing registry",
    brief: "From: Catalog. Re: supplier price list.\n\nEach supplier quotes one price per product — the PAIR is the identity, so the same supplier can never list the same product twice. Write the CREATE TABLE with the pair contract, then record supplier 2's quote for product 3 at 4900 cents.",
    ask: "Create supply_prices with a composite primary key over (supplier_id, product_id), then insert the 2/3 quote.",
    template: `CREATE TABLE supply_prices (
  supplier_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  cents INTEGER NOT NULL,
  {1} (supplier_id, product_id)
);
INSERT INTO supply_prices VALUES (2, {2}, 4900);`,
    slots: [
      { answer: "PRIMARY KEY", kind: "keyword", label: "the pair identity", why: "PRIMARY KEY (supplier_id, product_id) makes the pair the row's identity — the probe's second INSERT of (1, 2) bounced while singles were fine. Composite keys are the junction-table signature: one row per relationship, enforced by the CREATE TABLE itself." },
      { answer: "3", kind: "number", label: "the quoted product", why: "Product 3 is the USB-C Hub — supplier 2's actual catalog neighbor in the seed. The pair (2, 3) with its 4900-cent quote is the registry's first row." },
    ],
    distractors: ["UNIQUE KEY", "FOREIGN KEY", "4", "7"],
    walkthrough: "The composite PRIMARY KEY is the engine-level 'never twice' — duplicates bounce at INSERT, no app code required. The probe confirmed the grammar: a table-level PRIMARY KEY (a, b) clause after the column list. Note what it does NOT do: it does not stop supplier 2 from quoting product 4, and it does not enforce that the ids EXIST — that would be REFERENCES, the other half of a full junction contract (and the reason real junctions often declare both).",
  },
  {
    id: "cs-2704", tier: "medium", topic: "d1", universe: "expense",
    title: "The adjustment twin columns",
    brief: "From: Controller. Re: manual adjustments.\n\nA corrections table mirrors the ledger's discipline: debit and credit in cents, always present, and a forgotten figure means zero movement — not a NULL that poisons sums. Write the CREATE TABLE so both columns default to 0, then file one memo-only entry.",
    ask: "Create adjustments (debit_cents and credit_cents NOT NULL DEFAULT 0) and insert a memo-only row.",
    template: `CREATE TABLE adjustments (
  id INTEGER PRIMARY KEY,
  memo TEXT NOT NULL,
  debit_cents INTEGER NOT NULL {1} 0,
  credit_cents INTEGER NOT NULL DEFAULT {2}
);
INSERT INTO adjustments (memo) VALUES ('fee correction');`,
    slots: [
      { answer: "DEFAULT", kind: "keyword", label: "the debit's fill-in", why: "DEFAULT 0 gives an omitted debit a real zero — the probe's INSERT without the defaulted column read back the default, not NULL. The seed's own ledger_entries declares both columns exactly this way (debit_cents INTEGER NOT NULL DEFAULT 0)." },
      { answer: "0", kind: "number", label: "the credit's resting value", why: "Zero is 'no movement this side' — summing the column stays exact. The probe's balanced ledger (dr = cr = 18108000) is only summable because no entry hides a NULL in either column." },
    ],
    distractors: ["NOT NULL", "NULL", "1"],
    walkthrough: "The twin-default pattern is the ledger's spine: NOT NULL alone would force every writer to state both sides of every entry; DEFAULT 0 + NOT NULL lets the writer declare only the moving side. The distractor DEFAULT NULL is the subtle trap — legal DDL, but the memo-only INSERT then violates NOT NULL and the row never lands. Defaults must satisfy their own column's contract: a NOT NULL column's default can never be NULL.",
  },
  {
    id: "cs-2705", tier: "medium", topic: "d1", universe: "growth",
    title: "The lead intake contract",
    brief: "From: Growth. Re: lead capture.\n\nThe landing page feeds a leads table: an email we never store twice, a region that must be one of the four we sell in, and a timestamp the database stamps itself. Write the CREATE TABLE with all three contracts, then file Noa's EU lead.",
    ask: "Create leads (email UNIQUE, region CHECKed to the four regions, created_at DEFAULT CURRENT_TIMESTAMP) and insert one row.",
    template: `CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL {1},
  region TEXT NOT NULL {2},
  created_at TEXT DEFAULT {3}
);
INSERT INTO leads (email, region) VALUES ('noa@example.com', 'EU');`,
    slots: [
      { answer: "UNIQUE", kind: "keyword", label: "the no-duplicate rule", why: "email TEXT UNIQUE creates the implicit unique index — the second 'noa@example.com' would bounce with UNIQUE constraint failed. The seed's own customers.email is NOT declared UNIQUE (no autoindex in the sqlite_master dump); this table puts the rule where the engine can hold it." },
      { answer: "CHECK (region IN ('EU','APAC','US','LATAM'))", kind: "keyword", label: "the region whitelist", why: "CHECK with an IN list is the enum-without-an-enum: any region outside the four selling regions bounces at INSERT. The probe's CHECK receipt quotes the failing expression, so bad data arrives with a self-explanatory error." },
      { answer: "CURRENT_TIMESTAMP", kind: "keyword", label: "the self-stamping clock", why: "DEFAULT CURRENT_TIMESTAMP stamps the row at INSERT time — no app clock, no drift. NOW() is Postgres/MySQL; SQLite's keyword set is CURRENT_TIMESTAMP, CURRENT_DATE and CURRENT_TIME." },
    ],
    distractors: ["PRIMARY KEY", "IN", "NOW()"],
    walkthrough: "Three contracts in one CREATE TABLE: UNIQUE (identity of the lead), CHECK (the region vocabulary), DEFAULT CURRENT_TIMESTAMP (provenance). The INSERT then only carries what varies — email and region — and the engine fills the rest. This is the shape of most intake tables: the more the CREATE TABLE promises, the smaller and harder-to-screw-up the INSERT becomes. The email PRIMARY KEY distractor is legal but changes the meaning: email as identity (no surrogate id), a different design conversation.",
  },
  {
    id: "cs-2706", tier: "medium", topic: "d1", universe: "supplier",
    title: "The supplier spend snapshot",
    brief: "From: Finance. Re: quarterly pack.\n\nThe pack freezes supplier spend — one table, built straight from a join of suppliers, products and order_items, biggest spend first. Build it in one CREATE TABLE AS SELECT statement with the join, the grouping and the spend ordering.",
    ask: "Create supplier_spend as a joined, grouped, spend-ordered CTAS over the three tables.",
    template: `CREATE TABLE supplier_spend AS
SELECT s.id, s.name, SUM(i.unit_price * i.quantity) AS spend
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
{1} order_items i ON i.product_id = p.id
{2} BY s.id
ORDER BY {3} DESC;`,
    slots: [
      { answer: "JOIN", kind: "keyword", label: "the line-items link", why: "The chain runs suppliers → products → order_items; each hop joins on the foreign key the schema already declares. The snapshot stores the JOIN's output as rows — the reporting-layer pattern with the freshness traded away on purpose." },
      { answer: "GROUP", kind: "keyword", label: "the per-supplier fold", why: "GROUP BY s.id collapses many line items into one row per supplier — without it, SUM makes no sense per supplier and the snapshot carries raw grain. Every aggregate query in the book leans on this pairing." },
      { answer: "spend", kind: "keyword", label: "the ranking column", why: "ORDER BY spend DESC ranks by the computed alias — the biggest-spending supplier lands first. Ordering inside the CTAS freezes the row sequence into the stored table (a plain SELECT * reads it back in that order)." },
    ],
    distractors: ["INNER", "WHERE", "ORDER", "s.id", "name"],
    walkthrough: "CREATE TABLE AS SELECT is the reporting-layer snapshot: the join shapes it, GROUP BY folds it, ORDER BY freezes it. The receipts worth keeping: the probe's CTAS stored DDL carried NO primary key and normalized the types — snapshots are for reading, not for receiving writes. The WHERE distractor fails loudly (a join needs ON), and re-ordering by s.id or name changes the stored row order — order matters in a table that a deck reads top-down.",
  },
  {
    id: "cs-2707", tier: "medium", topic: "d1", universe: "catalog",
    title: "The self-computing fee",
    brief: "From: Platform. Re: fee integrity.\n\nMarketplace fees must NEVER disagree with the price they derive from — someone WILL forget to update a stored fee after a repricing. Build fee_probe with a generated fee column (exactly 20% of price, computed on read), then price one item at 100.",
    ask: "Create fee_probe with price REAL and a VIRTUAL generated fee at 20%, then insert price 100.",
    template: `CREATE TABLE fee_probe (
  price REAL NOT NULL,
  fee REAL {1} ALWAYS AS (price * {2}) VIRTUAL
);
INSERT INTO fee_probe (price) VALUES (100);`,
    slots: [
      { answer: "GENERATED", kind: "keyword", label: "the derived-column keyword", why: "GENERATED ALWAYS AS (expr) declares a column the engine computes — you cannot write into it, which is exactly the integrity guarantee. The probe's INSERT touched only price and the read echoed fee 20." },
      { answer: "0.2", kind: "number", label: "the fee rate", why: "Twenty percent as a multiplier — 100 in, 20 out in the probe's receipt. The formula lives in the CREATE TABLE, so every future row's fee is the same fraction by construction." },
    ],
    distractors: ["DEFAULT", "COMPUTED", "2", "0.5"],
    walkthrough: "Generated columns are CREATE TABLE's answer to 'derived data that must never drift': VIRTUAL computes on read (nothing stored), STORED computes on write. The probe's receipt (price 100, tax 20) shows the read-time computation. The honest trade: the formula is frozen at DDL time — changing the rate means a table rebuild, because SQLite has no ALTER for expressions either. Rate changes are rare; fee drift is constant — the trade usually pays.",
  },
  {
    id: "cs-2708", tier: "medium", topic: "d1", universe: "funnel",
    title: "The campaign shelf default",
    brief: "From: Growth. Re: campaign registry.\n\nCampaigns register in two steps — code first, budget decided later by finance. So the table must accept a code-only row, and the budget column must read 1000 (the planning placeholder) until finance updates it. Write the CREATE TABLE and file 'spring25' without a budget.",
    ask: "Create campaigns (code TEXT NOT NULL, budget REAL DEFAULT 1000) and insert a code-only row.",
    template: `CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY,
  code {1} NOT NULL,
  budget REAL DEFAULT {2}
);
INSERT INTO campaigns (code) VALUES ('spring25');`,
    slots: [
      { answer: "TEXT", kind: "keyword", label: "the campaign code's type", why: "Codes like 'spring25' are labels — TEXT. Declaring INTEGER would technically survive the affinity probes (loose typing stores 'spring25' as text anyway), but the CREATE TABLE declaration is the schema's documentation: the next engineer reads types as intent." },
      { answer: "1000", kind: "number", label: "the planning placeholder", why: "The probe family confirms the mechanic: omit the column and the DEFAULT lands in the row — the code-only INSERT reads back budget 1000. Finance's later UPDATE overwrites it; until then the placeholder keeps budget reports non-NULL." },
    ],
    distractors: ["INTEGER", "50", "CURRENT_TIMESTAMP"],
    walkthrough: "DEFAULT is 'the value when nobody says otherwise' — the probe's RETURNING receipts showed it filling omitted columns repeatedly. The placeholder pattern (budget REAL DEFAULT 1000) is how schemas encode 'pending decision' without NULL: every row carries a real number, and the report never breaks. The trade-off is honesty — 1000 is not a real budget, and a COALESCE-style NULL would say 'unknown' more truthfully; the growth team chose a number so their spreadsheets keep summing. Both are defensible; only one is silent.",
  },
  {
    id: "cs-2709", tier: "medium", topic: "d1", universe: "refund-audit",
    title: "The returns contract",
    brief: "From: Support. Re: returned goods.\n\nReturned items need a registry: which order, which product, how many units (always positive), and the same order-product pair may only return once. Build it with the FK to orders, the positivity CHECK and the pair rule, then file one row for order 103, product 3.",
    ask: "Create returns (FK to orders, qty CHECK > 0, PRIMARY KEY pair) and insert (103, 3, 1).",
    template: `CREATE TABLE returns (
  order_id INTEGER NOT NULL {1} orders(id),
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty {2} 0),
  {3} KEY (order_id, product_id)
);
INSERT INTO returns VALUES (103, 3, 1);`,
    slots: [
      { answer: "REFERENCES", kind: "keyword", label: "the order link", why: "REFERENCES orders(id) inline — the returned goods must belong to a real order, engine-checked. The probe family's FK receipt (bogus id → FOREIGN KEY constraint failed) is the contract in action." },
      { answer: ">", kind: "keyword", label: "the positivity operator", why: "CHECK (qty > 0) — a zero-unit return is not a return. The stored DDL keeps the exact expression, so >= and > are different contracts: >= would admit the meaningless zero row the support team never wants to see." },
      { answer: "PRIMARY", kind: "keyword", label: "the pair's once-only rule", why: "PRIMARY KEY (order_id, product_id) — the same order-product pair can never return twice. The composite probe bounced its duplicate (1, 2) with the pair as identity; this registry inherits the same discipline." },
    ],
    distractors: ["JOIN", ">=", "FOREIGN"],
    walkthrough: "Three clauses, three bug classes abolished: phantom orders (REFERENCES), zero and negative returns (CHECK), double refunds of the same line (composite PRIMARY KEY). The INSERT then just states the business fact — order 103's USB-C Hub came back once. The >= distractor is the reviewer's favorite catch: it parses, it enforces, and it is WRONG — the boundary operator is the difference between 'at least one unit' and 'possibly nothing'.",
  },
  {
    id: "cs-2710", tier: "medium", topic: "d1", universe: "month-close",
    title: "The dispute memo table",
    brief: "From: Finance. Re: invoice disputes.\n\nEvery disputed invoice gets a memo row: which invoice, the note itself (mandatory), and who wrote it — defaulting to 'system' when the intake form skips the author. Build it with the invoice link, then file the first dispute on invoice 1.",
    ask: "Create invoice_notes (FK to invoices, note NOT NULL, author DEFAULT 'system') and insert one dispute.",
    template: `CREATE TABLE invoice_notes (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL {1} invoices(id),
  note TEXT NOT NULL,
  author TEXT {2} 'system'
);
INSERT INTO invoice_notes (invoice_id, note) VALUES (1, 'client disputes late fee');`,
    slots: [
      { answer: "REFERENCES", kind: "keyword", label: "the invoice link", why: "invoice_id REFERENCES invoices(id) — a dispute attached to a nonexistent invoice is noise, so the engine checks the parent. The seed's invoices table (28 rows, 21 paid / 6 open / 1 void) is the reference target." },
      { answer: "DEFAULT", kind: "keyword", label: "the author fallback", why: "DEFAULT 'system' — the intake form's anonymous path still files a row with a named writer. The probe's default receipts showed the fill happening on omission; here the omitted author reads 'system', making every memo attributable." },
    ],
    distractors: ["FOREIGN KEY", "INDEX", "SET", "NULL"],
    walkthrough: "The FK + DEFAULT pairing covers the two failure modes of memo tables: orphan notes (the REFERENCES clause bounces them) and anonymous rows (the default names them). The INSERT carries only what varies — invoice 1 and the dispute text; the engine stamps id and author. Contrast with the seed's own customers.email: NOT NULL but no UNIQUE — contracts are a per-column menu, and the CREATE TABLE is where each choice is recorded forever.",
  },
  {
    id: "cs-2711", tier: "medium", topic: "d1", universe: "fraud",
    title: "The review-pile snapshot",
    brief: "From: Risk. Re: the daily review pile.\n\nEvery morning freezes the pending orders over 500 into a snapshot with a 'review' flag column stamped on every row. One CREATE TABLE AS SELECT — the flag as a literal, the threshold from risk policy. Build today's pile.",
    ask: "Create flagged_snapshot from pending orders over 500 with a 'review' flag column.",
    template: `CREATE TABLE flagged_snapshot AS
SELECT id, customer_id, total, {1} AS flag
FROM orders
WHERE total > {2} AND status = 'pending';`,
    slots: [
      { answer: "'review'", kind: "keyword", label: "the stamped flag", why: "A string literal in the SELECT becomes a real column in the snapshot — every row carries flag = 'review'. Bare review would parse as a column reference and fail (no such column); the quotes are what make it a value." },
      { answer: "500", kind: "number", label: "the risk threshold", why: "The policy line. The pending census tops out at 1088.44, so 500 carves the expensive tail — and the WHERE is frozen INTO the stored table, which is precisely the point of a daily snapshot." },
    ],
    distractors: ["review", "urgent", "100", "2000"],
    walkthrough: "CTAS plus a literal column: `SELECT …, 'review' AS flag` is the cheapest way to stamp provenance onto a snapshot. The threshold lives inside the stored WHERE — re-reading the table never re-asks the live orders, which is the freeze-figures property the close binder and the review pile both want. The bare-review distractor fails at parse time ('no such column'), a receipt the affinity probes keep teaching: text needs quotes to be text.",
  },
  {
    id: "cs-2712", tier: "medium", topic: "d1", universe: "catalog",
    title: "The batch intake gate",
    brief: "From: Warehouse. Re: receiving.\n\nProduct intake rows come in batches — a two-row INSERT is one statement, and the gate rules are: categories from the three we stock, price above zero. Write the CREATE TABLE with both gates, then file the batch: Desk Lamp Pro at 79.99, Pilot Speaker at 9.99.",
    ask: "Create product_batch (category CHECK IN-list, price CHECK > 0) and insert the two-row batch.",
    template: `CREATE TABLE product_batch (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL {1},
  price REAL NOT NULL CHECK (price > {2})
);
INSERT INTO product_batch (name, category, price) VALUES ('Desk Lamp Pro', 'Electronics', 79.99), ('Pilot Speaker', 'Audio', 9.99);`,
    slots: [
      { answer: "CHECK (category IN ('Electronics','Audio','Accessories'))", kind: "keyword", label: "the category whitelist", why: "CHECK (category IN (…)) pins the vocabulary — a typo'd category bounces at the door with the expression quoted in the error. Whitelists in CREATE TABLE are how the warehouse keeps its per-category reports meaningful." },
      { answer: "0", kind: "number", label: "the price floor", why: "price > 0 — the intake gate. The batch's 9.99 clears it by a hair; the audit's statement-atomicity receipt means a violated CHECK in ANY row of the two-row INSERT rejects BOTH rows, which is exactly the all-or-nothing the receiving dock wants." },
    ],
    distractors: ["BETWEEN (category", "LIKE (category", "10", "5"],
    walkthrough: "The intake gate is two CHECKs wearing different hats: an IN-list (vocabulary) and a bound (economics). The batch INSERT shows statement atomicity from the write pass — one bad row, zero rows land. The 10 distractor is the thoughtful one: 9.99 fails it, the whole statement dies, and the receipt is '0 rows' — the gate did its job, the batch gets re-filed. CHECK bounds are business policy; moving the floor is a DDL change, so the number deserves the argument it will get.",
  },
  {
    id: "cs-2713", tier: "hard", topic: "d1", universe: "catalog",
    title: "The shipment line contract",
    brief: "From: Ops. Re: shipment lines.\n\nReplicate the discipline of order_items for shipments: an auto id, an order link that must exist, a product link that must exist, a positive whole-unit quantity, and a unit price that defaults to zero when receiving hasn't priced it yet. Build the table, then file one line for order 103, product 3, two units at 49.00.",
    ask: "Create shipment_items with both FKs, a qty CHECK and a priced default, then insert one line.",
    template: `CREATE TABLE shipment_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES {1},
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity {2}),
  unit_price REAL NOT NULL DEFAULT {3}
);
INSERT INTO shipment_items (order_id, product_id, quantity, unit_price) VALUES (103, 3, 2, 49.00);`,
    slots: [
      { answer: "orders(id)", kind: "keyword", label: "the order target", why: "REFERENCES orders(id) names the parent and its key — the same spelling order_items itself uses. The foreign-key-list receipt records the target; pointing at customers(id) compiles fine and then bounces at INSERT (order ids are not customer ids) — the contract's target is part of its meaning." },
      { answer: "> 0", kind: "keyword", label: "the quantity bound", why: "CHECK (quantity > 0) — shipments move at least one unit. The stored DDL preserves the exact expression, so the > versus >= boundary is a real, auditable choice: zero-unit lines are warehouse noise, not data." },
      { answer: "0.00", kind: "number", label: "the unpriced default", why: "DEFAULT 0.00 — receiving can file the line before finance prices it, and the column stays NOT NULL-honest with a real zero. The same pattern the ledger uses for debit/credit: absence of a figure becomes a number, never a NULL." },
    ],
    distractors: ["order(id)", "customers(id)", ">= 0", "IS 0", "NULL", "49"],
    walkthrough: "This is order_items' contract re-declared line by line: two FKs (each side checked), a positivity CHECK on quantity, and a default that keeps 'not priced yet' representable. The receipts that matter at runtime: a bad parent id bounces with FOREIGN KEY constraint failed, and the DEFAULT fills only when the INSERT omits the column — the explicit 49.00 here overrides it. Defaults are fallbacks, not overrides; knowing which statement supplies the value is the whole game.",
  },
  {
    id: "cs-2714", tier: "hard", topic: "d1", universe: "funnel",
    title: "The referral chain",
    brief: "From: Growth. Re: referral program.\n\nCustomers refer each other: each referral row names the new customer and (optionally) the referrer — the chain's origin has NO referrer, which must be expressible. Build the self-referencing table with an 'email' channel default, then file customer 1's row: origin of their own chain, via the ad channel.",
    ask: "Create referrals (self-FK referred_by, channel DEFAULT 'email') and insert customer 1 as chain origin via 'ad'.",
    template: `CREATE TABLE referrals (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  referred_by INTEGER REFERENCES customers(id),
  channel TEXT NOT NULL DEFAULT {1}
);
INSERT INTO referrals (customer_id, referred_by, channel) VALUES (1, {2}, 'ad');`,
    slots: [
      { answer: "'email'", kind: "keyword", label: "the channel default", why: "DEFAULT 'email' — the program's dominant channel becomes the fallback. Quoted: a default is a VALUE, and the affinity probes showed bare words parse as identifiers, not text." },
      { answer: "NULL", kind: "keyword", label: "the chain origin", why: "NULL is how the self-FK says 'no referrer' — the FK check skips NULLs entirely (the UNIQUE probe inserted NULLs freely; FK enforcement behaves the same). Customer 1 starts their own chain: referred_by NULL is the top of the graph, and it is honest data, not missing data." },
    ],
    distractors: ["email", "0", "4", "'none'"],
    walkthrough: "Self-referencing FKs model hierarchy in one table: referred_by points at the SAME table's parent rows. The origin-of-chain question is the design crux — NULL (no referrer, FK skips) versus 0 (a fake id, and the engine bounces it with FOREIGN KEY constraint failed) versus 4 (a real referrer, but now customer 1 is not the origin and the program's attribution lies). The default channel is the small copy: DEFAULT 'email' makes the common case a one-column INSERT. Hierarchies need their top marked explicitly — NULL is that mark.",
  },
  {
    id: "cs-2715", tier: "hard", topic: "d1", universe: "inventory",
    title: "The bin watermark",
    brief: "From: Warehouse. Re: cycle counts.\n\nCycle counts live in their own table: bin label, counted units defaulting to zero when the counter only walked past. The migration file pre-assigns bin B7 the id 9. After loading A3 (auto id) and the pre-assigned B7, a third count for C1 must be filed WITHOUT an id — predict and file it so the engine does the numbering.",
    ask: "Create bin_counts (counted DEFAULT 0), load A3=12, explicit id 9 for B7=5, and let C1 auto-assign.",
    template: `CREATE TABLE bin_counts (
  id INTEGER PRIMARY KEY,
  bin TEXT NOT NULL,
  counted INTEGER {1} 0
);
INSERT INTO bin_counts (bin, counted) VALUES ('A3', 12);
INSERT INTO bin_counts (id, bin, counted) VALUES ({2}, 'B7', 5);
INSERT INTO bin_counts (bin) VALUES ('C1');`,
    slots: [
      { answer: "DEFAULT", kind: "keyword", label: "the walked-past zero", why: "DEFAULT 0 — a count of 'no units counted' is a real observation, and the ledger-style default keeps it a number. The probe's default receipts: omit the column, the default lands." },
      { answer: "9", kind: "number", label: "the pre-assigned bin id", why: "The migration's reservation — an explicit id 9 raises the rowid watermark. The write-pass receipt family: explicit ids and auto ids share one number line, max+1 always." },
    ],
    distractors: ["NOT NULL", "CHECK", "10", "1"],
    walkthrough: "The watermark story in three INSERTs: A3 auto-assigns 1; the explicit 9 raises the max; C1's id-less INSERT takes max+1 = 10 — NOT 2. That surprise is the lesson: rowid aliases have no sequence memory, so pre-assigned ids leave gaps that auto-numbering happily skips past. The id 1 distractor collides with A3's auto id (PRIMARY KEY violation — the composite probe bounced its duplicate the same way). File it as the engine would: the third statement carries no id, and the receipt is the proof.",
  },
  {
    id: "cs-2716", tier: "hard", topic: "d1", universe: "month-close",
    title: "The open-book freeze",
    brief: "From: Controller. Re: receivables workpaper.\n\nThe workpaper needs the OPEN invoices frozen with a readable dollars column next to the raw cents. Integer division by 100 gives whole dollars (cents tracked separately in the source table — do not round, truncate). Build the snapshot in one statement.",
    ask: "Create unpaid_book from open invoices with dollars = amount_cents / 100 via CTAS.",
    template: `CREATE TABLE unpaid_book AS
SELECT id, customer_id, amount_cents / {1} AS dollars
FROM invoices
WHERE status = {2};`,
    slots: [
      { answer: "100", kind: "number", label: "the cents divider", why: "INTEGER / 100 is INTEGER division — 4821 cents becomes 48 whole dollars, truncated. That is the workpaper convention here (cents live in the source column); 100.0 would give 48.21 REALs — a different table entirely." },
      { answer: "'open'", kind: "keyword", label: "the receivable filter", why: "status = 'open' — the six receivables (the invoice census: 21 paid, 6 open, 1 void). Quoted, because a bare open parses as a column and the snapshot dies at parse time." },
    ],
    distractors: ["10", "cents", "'paid'", "open"],
    walkthrough: "The freeze-figures snapshot with a twist: the computed column is INTEGER division, so the dollars column truncates — 4821/100 = 48, not 48.21. The 100.0 distractor is the real-world review catch: same intent, REAL output, and the stored table differs cell by cell. CTAS bakes the SELECT — types, arithmetic, WHERE — into the snapshot's rows once; the source invoices keep living, the workpaper does not. That stillness is the deliverable.",
  },
  {
    id: "cs-2717", tier: "hard", topic: "d1", universe: "supplier",
    title: "The certification register",
    brief: "From: Compliance. Re: supplier certs.\n\nCertifications hang off suppliers: a mandatory supplier link pointing at the suppliers' own key, the standard name, and an expiry that defaults to the far-future sentinel '9999-12-31' when no expiry is known. Build the register and file supplier 1's ISO-9001 with no expiry.",
    ask: "Create certifications (supplier FK to suppliers(id), expires_on DEFAULT '9999-12-31') and insert one row.",
    template: `CREATE TABLE certifications (
  id INTEGER PRIMARY KEY,
  supplier_id INTEGER NOT NULL REFERENCES suppliers({1}),
  standard TEXT NOT NULL,
  expires_on TEXT NOT NULL {2} '9999-12-31'
);
INSERT INTO certifications (supplier_id, standard) VALUES (1, 'ISO-9001');`,
    slots: [
      { answer: "id", kind: "keyword", label: "the parent key", why: "suppliers(id) — the FK must point at the parent's PRIMARY KEY (or a unique index); suppliers has exactly one id column. The fk-list receipt stores the target, and a mismatch ('no such column' or a non-unique target) fails the relationship at INSERT time." },
      { answer: "DEFAULT", kind: "keyword", label: "the no-expiry sentinel", why: "DEFAULT '9999-12-31' — 'no expiry known' as a sortable far-future date instead of NULL. The probe's default receipts: the omitted column reads the sentinel, and ORDER BY expires_on pushes undated certs last (or first, depending on direction) — a deliberate reporting choice." },
    ],
    distractors: ["supplier_id", "name", "NULL", "CHECK"],
    walkthrough: "Two contracts with sharp edges: the FK target must EXIST and be UNIQUE (pointing at supplier_id or name is a mismatch — the engine raises foreign key mismatch at DML time), and the sentinel default is a policy disguised as a date. '9999-12-31' sorts after every real date, so undated certs cluster at the end of expiry reports — visible, sortable, and never NULL-poisoning a MIN(expiry) query. The seed itself uses nullable shipped_at for the same 'not yet' problem; this team chose the sentinel. Both patterns exist in production; only one survives comparisons gracefully.",
  },
  {
    id: "cs-2718", tier: "hard", topic: "d1", universe: "growth",
    title: "The waitlist edge case",
    brief: "From: Growth. Re: early access.\n\nThe waitlist keeps emails that must never repeat — but the team ALSO wants anonymous holds (rows with no email yet, reserved by date). So: email UNIQUE but NOT required, joined_on required. Build it, then file a@x, b@x, and one anonymous hold on 2026-01-07.",
    ask: "Create waitlist (email UNIQUE nullable, joined_on NOT NULL) and file two addresses plus one NULL-email hold.",
    template: `CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY,
  email TEXT {1},
  joined_on TEXT NOT NULL
);
INSERT INTO waitlist (email, joined_on) VALUES ('a@example.com', '2026-01-05'), ('b@example.com', '2026-01-06'), ({2}, '2026-01-07');`,
    slots: [
      { answer: "UNIQUE", kind: "keyword", label: "the no-repeat rule", why: "email TEXT UNIQUE — values never repeat, and the implicit unique index proves it in pragma_index_list. Crucially UNIQUE alone does NOT forbid NULL: the probe inserted two NULL emails into a UNIQUE column and both landed. The anonymous hold rides exactly that clause." },
      { answer: "NULL", kind: "keyword", label: "the anonymous hold", why: "An explicit NULL email — the reserved spot. UNIQUE permits any number of NULLs (they are 'unknown', not values), so a@x, b@x and the hold coexist. NOT NULL here would have killed the hold requirement the team stated." },
    ],
    distractors: ["CHECK", "''", "'2026-01-08'", "'a@example.com'"],
    walkthrough: "The UNIQUE-versus-NOT-NULL boundary, drawn by requirement: repeats are forbidden (UNIQUE), absence is allowed (no NOT NULL). The NOT NULL distractor parses, enforces, and murders the anonymous hold — the third INSERT dies on NOT NULL constraint failed, and the waitlist loses its reserved-spot feature. The duplicate-address distractor dies on UNIQUE constraint failed inside the same statement, taking all three rows with it (statement atomicity). One clause of difference, two totally different products.",
  },
  {
    id: "cs-2719", tier: "hard", topic: "d1", universe: "expense",
    title: "The dedupe re-run",
    brief: "From: Controller. Re: feed imports.\n\nPetty-cash imports re-run on every sync, and the SAME day must never be recorded twice. The contract: spent_on is the identity (one row per day), and the import uses the conflict-skip spelling so a repeated day is a counted no-op. Build it, file 2026-01-10 at 3000, then re-send the day at 999 and watch it skip.",
    ask: "Create petty_cash (spent_on UNIQUE), INSERT day one at 3000, then INSERT OR IGNORE the duplicate day at 999.",
    template: `CREATE TABLE petty_cash (
  id INTEGER PRIMARY KEY,
  spent_on TEXT NOT NULL {1},
  amount_cents INTEGER NOT NULL
);
INSERT INTO petty_cash (spent_on, amount_cents) VALUES ('2026-01-10', {2});
INSERT OR {3} INTO petty_cash (spent_on, amount_cents) VALUES ('2026-01-10', 999);`,
    slots: [
      { answer: "UNIQUE", kind: "keyword", label: "the day's identity", why: "spent_on TEXT UNIQUE — one row per day, engine-enforced via the implicit unique index. Without it, OR IGNORE skips nothing (no constraint to collide with) and the day doubles." },
      { answer: "3000", kind: "number", label: "day one's amount", why: "The original import's figure. The dedupe story needs the first row to exist — and to survive the re-send untouched, which only a true skip guarantees." },
      { answer: "IGNORE", kind: "keyword", label: "the skip arm", why: "INSERT OR IGNORE — the collision becomes a counted no-op (changes = 0, the probe family's skip receipt). The 999 re-send evaporates; day one keeps its 3000." },
    ],
    distractors: ["0", "REPLACE", "IGNORED", "PRIMARY KEY", "CHECK"],
    walkthrough: "The upsert family from the CREATE TABLE side: UNIQUE declares what 'duplicate' means, OR IGNORE decides the collision is a skip. The REPLACE distractor is the dangerous twin — it REPLACES day one, and the table ends with the re-send's 999 instead of the original 3000 (the OR REPLACE probe zeroed a whole row the same way). Skip protects the past; replace adopts the feed. The PRIMARY KEY distractor makes spent_on the identity itself — the table still dedupes, but OR REPLACE now rewrites 3000 to 999 as well: same-looking DDL, opposite outcome on re-run.",
  },
  {
    id: "cs-2720", tier: "hard", topic: "d1", universe: "inventory",
    title: "The stock-take contract",
    brief: "From: Warehouse. Re: shrinkage audit.\n\nStock takes record daily deltas per product: negative means shrinkage, zero is a no-movement day (still worth recording), and one take per product per day is the grain. Build the table — defaulted delta, unique product-day pair — then file the USB-C Hub's 2-unit shrinkage on 2026-01-15.",
    ask: "Create stock_takes (delta DEFAULT 0, UNIQUE (product_id, counted_on)) and insert product 3's -2.",
    template: `CREATE TABLE stock_takes (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  counted_on TEXT NOT NULL,
  delta INTEGER NOT NULL {1} 0,
  note TEXT,
  {2} (product_id, counted_on)
);
INSERT INTO stock_takes (product_id, counted_on, delta) VALUES (3, '2026-01-15', {3});`,
    slots: [
      { answer: "DEFAULT", kind: "keyword", label: "the no-movement zero", why: "DEFAULT 0 — 'we looked, nothing moved' is a real observation with a real zero, keeping shrinkage sums exact. The ledger twin-column pattern, one column wide." },
      { answer: "UNIQUE", kind: "keyword", label: "the daily grain", why: "UNIQUE (product_id, counted_on) — one take per product per day, as a table-level clause. The composite probe confirmed the pair contract; UNIQUE (rather than PRIMARY KEY) keeps id as the identity while the pair stays a rule." },
      { answer: "-2", kind: "number", label: "the shrinkage delta", why: "Negative two — two USB-C Hubs gone. The CHECK-free design admits negatives ON PURPOSE: shrinkage is the whole point of the audit. (The INTEGER column stores -2 exactly; the -2.5 distractor would store a real — the affinity receipt again.)" },
    ],
    distractors: ["NOT NULL", "NULL", "PRIMARY KEY", "KEY", "2", "-2.5"],
    walkthrough: "A grain-auditing table in five clauses: the FK (real products only), the defaulted delta (no-movement is a number), the nullable note, and the UNIQUE pair that makes double-filing a daily take impossible. The PRIMARY KEY distractor dies at parse time — a table gets ONE primary key and id already claimed it — while the plain KEY chip is not SQL at all. The delta sign convention is the business logic the schema protects: negatives are expected, and the audit query (SUM by product) reads them as shrinkage without a single CASE WHEN.",
  },
];
