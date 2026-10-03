// M8 schema-bank cases — CREATE TABLE (part A, easy tier, cs-2693..cs-2702,
// topic d1). Chip-rebuild DDL cases; every template's completed SQL is
// executed by scripts/m8-schema-audit.ts on a fresh seed copy, and every
// distractor must error or change the schema/data fingerprint.
import type { CaseStudy } from "../cases/types";

export const schemaCasesCreateA: CaseStudy[] = [
  {
    id: "cs-2693", tier: "easy", topic: "d1", universe: "catalog",
    title: "The login ledger",
    brief: "From: Backend. Re: sign-in storage.\n\nEvery login needs a home: an auto-assigned id, a mandatory link to the customer, and a token that can never be missing. Write the CREATE TABLE — the constraint contract is the whole design.",
    ask: "Create the sessions table: surrogate key, enforced customer link, required token.",
    template: `CREATE TABLE sessions (
  id INTEGER {1},
  customer_id INTEGER NOT NULL {2} customers(id),
  token TEXT {3}
);`,
    slots: [
      { answer: "PRIMARY KEY", kind: "keyword", label: "the auto-assigned identity", why: "INTEGER PRIMARY KEY is the rowid alias — omit id on INSERT and the engine assigns max+1 (the probe's fresh table started at 1). CREATE TABLE's surrogate key in five characters." },
      { answer: "REFERENCES", kind: "keyword", label: "the customer link", why: "The inline FK clause is `REFERENCES customers(id)` — exactly how the storefront's own orders table points at customers. The probe's bogus-key insert bounced with FOREIGN KEY constraint failed; CREATE TABLE made the relationship real." },
      { answer: "NOT NULL", kind: "keyword", label: "the token's mandate", why: "A session without a token authenticates nothing. NOT NULL turns 'forgot the token' from a data bug into an engine rejection — the CREATE TABLE contract every writer inherits." },
    ],
    distractors: ["FOREIGN KEY", "UNIQUE", "AUTOINCREMENT"],
    walkthrough: "Three lines, three contracts: the rowid-alias id that numbers itself, the REFERENCES clause that makes phantom customers impossible, and the NOT NULL that forbids half-built sessions. The engine's own error receipts (FOREIGN KEY constraint failed, NOT NULL constraint failed) are the contract working — CREATE TABLE is the one place a bug class can be abolished before it ships.",
  },
  {
    id: "cs-2694", tier: "easy", topic: "d1", universe: "growth",
    title: "The regional scoreboard",
    brief: "From: Analytics. Re: the board deck.\n\nThe deck needs a small table of per-region customer counts. Regions are short text codes (APAC, EU, US, LATAM) and each appears once — make the region itself the key. Then load the two biggest: EU with 8, APAC with 5.",
    ask: "Create the region_stats table keyed by region, then load EU 8 and APAC 5.",
    template: `CREATE TABLE region_stats (
  region {1} {2},
  customers INTEGER
);
INSERT INTO region_stats (region, customers) VALUES ('EU', {3}), ('APAC', 5);`,
    slots: [
      { answer: "TEXT", kind: "keyword", label: "the region's type", why: "Regions are labels, not numbers — TEXT is the honest storage. INTEGER would invite arithmetic on 'EU' (the affinity probe stored 'abc' happily in an INTEGER column — nothing stops you until a query chokes). CREATE TABLE types are promises about meaning." },
      { answer: "PRIMARY KEY", kind: "keyword", label: "the once-per-region rule", why: "region TEXT PRIMARY KEY makes each region unique by identity — the natural key for a one-row-per-region table. The probe confirmed a TEXT primary key is legal and still leaves the hidden rowid counting underneath." },
      { answer: "8", kind: "number", label: "EU's headcount", why: "The seed's GROUP BY region receipt: EU 8, APAC 5, US 2, LATAM 1. Loading figures the warehouse already verified keeps the scoreboard anchored to truth." },
    ],
    distractors: ["INTEGER", "UNIQUE", "7"],
    walkthrough: "A scoreboard is a contract: region TEXT PRIMARY KEY means 'one row per region, forever' — a second EU insert is rejected by the engine, not by hope. The load then rides multi-row VALUES (EU 8, APAC 5). CREATE TABLE chose the grain; the INSERT just fills it. When the board asks why LATAM shows 1, the table's grain is already defensible.",
  },
  {
    id: "cs-2695", tier: "easy", topic: "d1", universe: "funnel",
    title: "The campaign tag shelf",
    brief: "From: Growth. Re: tagging.\n\nMarketing tags campaigns with short labels — some drafts exist before anyone names them, so label may be missing, but when present it must never repeat. Build the tags table, then register the first two labels: 'sale' and 'launch'.",
    ask: "Create tags (auto id, label TEXT UNIQUE, no NOT NULL) and insert 'sale' and 'launch'.",
    template: `CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  label {1} {2}
);
INSERT INTO tags (label) VALUES ({3}), ('launch');`,
    slots: [
      { answer: "TEXT", kind: "keyword", label: "the label's type", why: "Tags are words — TEXT. The probes consistently show SQLite storing what fits, but the CREATE TABLE declaration is what tells the next engineer what belongs here." },
      { answer: "UNIQUE", kind: "keyword", label: "the no-repeat rule", why: "UNIQUE polices values: the probe's second 'sale' bounced with UNIQUE constraint failed: c1.email's twin. NOT NULL was deliberately left off — a NULL label is legal here (UNIQUE permits any number of NULLs; the probe inserted two)." },
      { answer: "'sale'", kind: "keyword", label: "the first tag", why: "A text literal needs its quotes — 'sale' not sale. Bare sale would be read as a column reference and the multi-row INSERT would fail before the shelf ever opened." },
    ],
    distractors: ["NOT NULL", "PRIMARY KEY", "sale"],
    walkthrough: "One table, two different contracts on two different columns: id is the rowid alias (numbers itself from 1), label is UNIQUE-but-nullable (values may not repeat; absence may). The probe receipts are the syllabus — duplicate values rejected, duplicate NULLs accepted. CREATE TABLE lets a column carry both 'optional' and 'irrepeatable' at once; real schemas need that combination constantly.",
  },
  {
    id: "cs-2696", tier: "easy", topic: "d1", universe: "pricing",
    title: "The price history ledger",
    brief: "From: Pricing. Re: audit trail.\n\nFinance wants every future price change recorded: which product, what unit price, when. The product link must be engine-enforced and the price must always be present. History rows are never edited — only appended.",
    ask: "Create price_history: auto id, enforced product link, mandatory price and observed_on.",
    template: `CREATE TABLE price_history (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL {1} products(id),
  price {2} {3},
  observed_on TEXT NOT NULL
);`,
    slots: [
      { answer: "REFERENCES", kind: "keyword", label: "the enforced product link", why: "product_id REFERENCES products(id) is the inline FK — the same clause the storefront's order_items carries. It converts 'we believe the product exists' into an engine-checked invariant at CREATE TABLE time." },
      { answer: "REAL", kind: "keyword", label: "the price's type", why: "Prices carry cents — REAL, matching the storefront's price column. The finance caveat: aggregates that must be exact to the cent are INTEGER cents (the ledger design); a per-observation price log reads fine as REAL." },
      { answer: "NOT NULL", kind: "keyword", label: "the price mandate", why: "A price history row without a price is a lie with a timestamp. NOT NULL makes the omission bounce (the probe's verbatim receipt: NOT NULL constraint failed: c2.name) instead of surfacing as NULL-poisoned averages in month three." },
    ],
    distractors: ["INTEGER", "DEFAULT 0", "JOIN"],
    walkthrough: "Append-only history is the easy case for constraints: id numbers itself, the FK refuses phantom products, NOT NULL forbids priceless rows, and the date is mandatory. The distractor DEFAULT 0 is the subtle one — it would silently fill forgotten prices with a fake zero that poisons min() statistics, exactly the bug NOT NULL exists to catch at the door. CREATE TABLE contracts: loud rejections beat quiet zeros.",
  },
  {
    id: "cs-2697", tier: "easy", topic: "d1", universe: "funnel",
    title: "The re-runnable signup",
    brief: "From: Platform. Re: deploy scripts.\n\nThe newsletter migration runs on every deploy — re-running it must not explode on the second run. Build the newsletter table (auto id, email that is always present) with the idempotent spelling, then seed one subscriber.",
    ask: "Create the newsletter table with IF NOT EXISTS, then insert one subscriber row.",
    template: `{1} TABLE IF {2} newsletter (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);
INSERT INTO newsletter (email) VALUES ({3});`,
    slots: [
      { answer: "CREATE", kind: "keyword", label: "the DDL verb", why: "CREATE TABLE is the statement; INSERT fills it. The deploy script's first word is fixed — ALTER would try to edit a table that may not exist yet, and DROP would defeat the entire point of a re-runnable migration." },
      { answer: "NOT EXISTS", kind: "keyword", label: "the second-run guard", why: "IF NOT EXISTS makes CREATE TABLE idempotent: the probe re-ran it against an existing table and got silence — no error, no change. On run two the INSERT still fires, so the table grows by one per deploy, which is exactly what 'seed one subscriber' means." },
      { answer: "'ada@example.com'", kind: "keyword", label: "the seeded address", why: "Quoted text literal, full address. The storefront's email hygiene (no gmail/outlook in the seed) is a data story, but the table accepts any text — the constraint contract here is NOT NULL, not a format police." },
    ],
    distractors: ["ALTER", "EXISTS", "ada@example.com"],
    walkthrough: "The deploy-script pattern in full: CREATE TABLE IF NOT EXISTS declares 'ensure this exists', and the INSERT after it does the real work on every run. The probe receipts frame the alternative — bare CREATE TABLE on run two fails with table tags already exists. DDL in scripts wants the guarded spelling; interactive work can afford the loud one. IF EXISTS on the drop side completes the family.",
  },
  {
    id: "cs-2698", tier: "easy", topic: "d1", universe: "month-close",
    title: "The cancellation snapshot",
    brief: "From: Finance. Re: the close binder.\n\nFor the close binder we freeze the cancelled orders as they stand — 7 rows, figures fixed, no view that would keep tracking edits. Build the snapshot straight from the orders table in one statement.",
    ask: "Create cancelled_backup as a SELECT of id, customer_id, total for cancelled orders.",
    template: `CREATE TABLE cancelled_backup {1} {2} id, customer_id, total FROM orders WHERE {3} = 'cancelled';`,
    slots: [
      { answer: "AS", kind: "keyword", label: "the CTAS hinge", why: "CREATE TABLE name AS SELECT is the snapshot spelling — the probe built cancelled_backup this way and SELECT COUNT(*) read 7 rows. The AS carries the query that both shapes AND fills the table in one statement." },
      { answer: "SELECT", kind: "keyword", label: "the copy query", why: "CTAS stores the SELECT's output as rows. The probe's stored DDL showed the types carried over (id INT, customer_id INT, total REAL) — shape from the query, data from the warehouse, no INSERT loop." },
      { answer: "status", kind: "keyword", label: "the cancellation filter", why: "status = 'cancelled' selects exactly the 7 dead orders (the seed's status census: 52 delivered, 30 shipped, 14 pending, 7 cancelled). The WHERE is what makes this a cancellation snapshot rather than a full copy." },
    ],
    distractors: ["VIEW", "INSERT", "shipped_at"],
    walkthrough: "The close binder wants figures that stop moving — that is CREATE TABLE AS SELECT, not a view (the view probes re-ran live on every read). The receipt worth remembering: the probe's stored CTAS DDL carried NO primary key — snapshots trade the constraint contract for stillness. For a binder that only gets summed and archived, that is a good trade; for anything that keeps receiving writes, it is not.",
  },
  {
    id: "cs-2699", tier: "easy", topic: "d1", universe: "expense",
    title: "The spend rulebook",
    brief: "From: Controller. Re: entry rules.\n\nNew spend entries live in their own table: a running id, a category word, and an amount in cents that may be zero but never negative. Encode the rule in the CREATE TABLE, then file a legitimate 2500-cent entry.",
    ask: "Create spend_entries with a CHECK on the amount, then insert one valid row.",
    template: `CREATE TABLE spend_entries (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL,
  amount_cents INTEGER {1} (amount_cents >= {2})
);
INSERT INTO spend_entries (category, amount_cents) VALUES ('Tools', 2500);`,
    slots: [
      { answer: "CHECK", kind: "keyword", label: "the rule keyword", why: "CHECK (expr) attaches a boolean law to the column. The probe's violating insert bounced with the verbatim CHECK constraint failed: rating >= 0 AND rating <= 5 — the engine quotes the rule it enforced. CREATE TABLE is where the law is written; there is no ADD CONSTRAINT later." },
      { answer: "0", kind: "number", label: "the floor", why: "Zero spend is legitimate (a fee waived), so the floor is 0, not 1 — >= 0 admits it. The controller's rulebook says 'never negative', and the CHECK says exactly that and nothing more. The category's NOT NULL is already in the template text: an uncategorized entry never lands." },
    ],
    distractors: ["DEFAULT", "1", "UNIQUE"],
    walkthrough: "CHECK is the CREATE TABLE clause that turns a policy memo into engine behavior: amount_cents >= 0 rejects the -1 probe outright. Note what the rule does NOT say — no upper bound, because the controller only feared negatives. Constraints should encode exactly the business rule, no more: every extra predicate is a future legitimate entry bouncing at the door.",
  },
  {
    id: "cs-2700", tier: "easy", topic: "d1", universe: "supplier",
    title: "The vendor contact sheet",
    brief: "From: Procurement. Re: outreach list.\n\nTrack prospective vendors before they graduate into the suppliers table: auto id, a required company name, and an optional rating that starts at 4.0 when nobody has scored them yet. Register the first prospect with no rating supplied.",
    ask: "Create vendor_leads (name NOT NULL, rating DEFAULT 4.0) and insert one prospect omitting the rating.",
    template: `CREATE TABLE vendor_leads (
  id INTEGER PRIMARY KEY,
  name TEXT {1},
  rating REAL {2} {3}
);
INSERT INTO vendor_leads (name) VALUES ('Midwest Peak Supply Co');`,
    slots: [
      { answer: "NOT NULL", kind: "keyword", label: "the name mandate", why: "An unnamed lead cannot be contacted — name TEXT NOT NULL makes the omission an engine error. This is the storefront's own spelling for every business column in its CREATE TABLE statements." },
      { answer: "DEFAULT", kind: "keyword", label: "the unscored default", why: "DEFAULT 4.0 fills the omitted rating — the probe family shows the receipt (qty DEFAULT 5 filled as 5). The pipeline treats 'not yet scored' as a neutral 4.0 rather than NULL so supplier-ranking queries need no COALESCE." },
      { answer: "4.0", kind: "number", label: "the neutral score", why: "The neutral midpoint the procurement team agreed on. A DEFAULT is a constant — the probe's DEFAULT 5 filled integers, and REAL 4.0 fills the same way. Defaults document the 'normal' row." },
    ],
    distractors: ["UNIQUE", "NULL", "CHECK"],
    walkthrough: "DEFAULT + NOT NULL compose into 'always a value, here is the normal one' — the customers.active pattern (INTEGER NOT NULL DEFAULT 1) that the seed itself declares. Omitting rating on INSERT is then a complete, honest row: the probe's RETURNING showed the default actually landed. CREATE TABLE defaults are documentation that executes.",
  },
  {
    id: "cs-2701", tier: "easy", topic: "d1", universe: "fraud",
    title: "The watchlist registry",
    brief: "From: Risk. Re: flagging accounts.\n\nThe fraud watchlist needs a table of flagged emails — the SAME email must never be listed twice, and every entry needs a reason. Build it, then list the first address. The uniqueness must be engine-enforced, not app-promised.",
    ask: "Create watchlist (email UNIQUE + NOT NULL, reason NOT NULL) and insert one row.",
    template: `CREATE TABLE watchlist (
  id INTEGER PRIMARY KEY,
  email TEXT {1} {2},
  reason TEXT NOT NULL
);
INSERT INTO watchlist (email, reason) VALUES ('suspect@example.com', {3});`,
    slots: [
      { answer: "UNIQUE", kind: "keyword", label: "the once-only rule", why: "email TEXT UNIQUE creates the implicit unique index (pragma_index_list shows the sqlite_autoindex with origin 'u' — the probe's receipt). The second listing attempt will bounce with UNIQUE constraint failed — engine-enforced, app-independent." },
      { answer: "NOT NULL", kind: "keyword", label: "the address mandate", why: "A watchlist entry without an address flags nobody. UNIQUE + NOT NULL together say: values never repeat AND absence is impossible — closing the NULL loophole the UNIQUE probe demonstrated (two NULLs coexisted happily)." },
      { answer: "'velocity pattern'", kind: "keyword", label: "the filed reason", why: "A quoted text literal — flag without a reason cannot be reviewed or appealed, and the bare word would parse as an identifier and kill the INSERT. Every row answers 'who and why'." },
    ],
    distractors: ["PRIMARY KEY", "DEFAULT ''", "CHECK"],
    walkthrough: "The registry pairs the two value contracts: UNIQUE (no repeats) and NOT NULL (no absence). The probe proved they are independent — UNIQUE alone admitted two NULL emails, so the watchlist needs both clauses. This is also the customers.email lesson: the seed declares email TEXT NOT NULL with NO UNIQUE (the sqlite_master dump shows no autoindex), so app code polices repeats — here we put the rule where it belongs, in the CREATE TABLE.",
  },
  {
    id: "cs-2702", tier: "easy", topic: "d1", universe: "inventory",
    title: "The quarantine shelf",
    brief: "From: Warehouse. Re: damaged stock.\n\nDamaged units move to a quarantine table: auto id, which product, how many units, and an optional inspector note. Quantities are whole units — no halves. Then quarantine 2 units of product 3.",
    ask: "Create quarantine (product link INTEGER, qty INTEGER, note nullable) and insert one row.",
    template: `CREATE TABLE quarantine (
  id INTEGER PRIMARY KEY,
  product_id {1} NOT NULL,
  qty INTEGER {2} (qty > 0),
  note TEXT
);
INSERT INTO quarantine (product_id, qty) VALUES (3, {3});`,
    slots: [
      { answer: "INTEGER", kind: "keyword", label: "the product pointer's type", why: "FK columns copy the parent key's type — products.id is INTEGER, so product_id INTEGER. (The REFERENCES clause could ride along; the warehouse brief scoped enforcement to the count columns, and a quarantine row for a scrapped product id is acceptable here.)" },
      { answer: "CHECK", kind: "keyword", label: "the positive-qty gate", why: "CHECK (qty > 0) — quarantine counts are positive by definition; a zero or negative quarantine row is a filing error. The probe's CHECK receipt quotes the expression it enforced, so the rejection explains itself." },
      { answer: "2", kind: "number", label: "the quarantined units", why: "The memo's figure. Two units of product 3 (the USB-C Hub) move off the shelf. The INSERT omits note — TEXT columns without NOT NULL default to NULL, the same optional-column pattern as orders.shipped_at." },
    ],
    distractors: ["REAL", "TEXT", "2.5"],
    walkthrough: "Three type decisions make this table honest: INTEGER for the pointer, INTEGER for whole units, nullable TEXT for the note that may not exist. The probe's typeof receipts are the cautionary tale — an INTEGER column happily stored 3.7 and 'abc'; the CREATE TABLE type is a promise to readers and a conversion hint to the engine, and whole-unit quantities deserve both. Optional note, mandatory everything else: nullable is the spelling of 'not yet known'.",
  },
];
