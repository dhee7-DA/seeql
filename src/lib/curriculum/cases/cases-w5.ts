// Case batch W5 — thin-spot patch: UPSERT & collisions (lesson 44,
// topic w5 "UPSERT & collisions"), cs-2023…cs-2030. Chip-graded write cases
// in the cases-m7 style: the rebuilt statement is graded chip-by-chip (the
// audit skips mutating topics; execution + aftermath verified by
// scripts/thin-write-audit.ts). Figures anchored live: product 1 K1 stock
// 120 / price 89.99 / supplier 1; product 3 USB-C Hub price 49.00 stock 85
// supplier 2; product 2 Wireless Mouse M3 price 34.50 stock 300; 16
// products (max id 16); expenses max id 36; category 'Video' on the roster.
import type { CaseStudy } from "./types";

export const casesW5: CaseStudy[] = [
  {
    id: "cs-2023",
    tier: "easy",
    topic: "w5",
    universe: "catalog",
    title: "The feed replay",
    brief:
      "From: Warehouse lead. Re: the restock feed.\n\nThe supplier feed just pushed K1's daily delta — 25 units — but the feed has REPLAYED before, and a bare INSERT would bounce off product 1's id. The warehouse standard: the upsert that adds the delta whether or not the row exists. Existing shelf: 120. Rebuild the feed's write.",
    ask: "Upsert product 1 with delta 25: stock accumulates via excluded, collisions included.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES ({1}, 'Mechanical Keyboard K1', 'Electronics', 89.99, {2}, 1)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.{3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the product id",
        why: "K1 is product 1 — the conflict target (id) matches this value. Upserts key on the identifier, not the name: 'Mechanical Keyboard K1' twice would be two rows without the id.",
      },
      {
        answer: "25",
        kind: "number",
        noVerify: true,
        label: "the daily delta",
        why: "The feed carries the DELTA (25 units), not the new total. The VALUES row is the ATTEMPTED insert — excluded.stock reads this 25 back on collision. Shipping the new total (145) would compound every replay.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the accumulating column",
        why: "stock = stock + excluded.stock — the bare name reads the EXISTING row (120), excluded reads the attempt (25): 145. Any other column accumulates the delta into the wrong field.",
      },
    ],
    distractors: ["2", "145", "price", "name", "supplier_id"],
    walkthrough:
      "The full feed-replay spell: attempt the INSERT with delta 25; the id-1 collision fires ON CONFLICT; DO UPDATE SET stock = stock + excluded.stock lands 120 + 25 = 145. Run the feed twice and the second replay adds 25 again — that's what deltas DO; idempotence here means 'never bounces', not 'never re-applies'. The excluded row is the attempt itself; the bare column is the shelf as it stands. Mixing them up — excluded on both sides — would write 50 and lose the real shelf count. On a live system this is the difference between an import that survives replays and one that double-bounces or clobbers.",
  },
  {
    id: "cs-2024",
    tier: "medium",
    topic: "w5",
    universe: "pricing",
    title: "The price refresh",
    brief:
      "From: Pricing. Re: the hub's new list price.\n\nUSB-C Hub 7-in-1 (product 3, currently 49.00) reprices to 55.00 — but the pricing feed is written as an upsert so a fresh product row would INSERT cleanly too. On collision, the attempted price WINS (overwrite, not accumulate). Rebuild the refresh: attempted price 55, collision sets price to the excluded row's price.",
    ask: "Upsert product 3 at price 55: on collision, price takes the attempted (excluded) value.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', {1}, 85, 2)
ON CONFLICT (id) DO UPDATE SET {2} = {3}.price;`,
    slots: [
      {
        answer: "55",
        kind: "number",
        noVerify: true,
        label: "the new list price",
        why: "55.00 is the refresh target — the attempted row's price. The VALUES row carries the NEW price precisely so the collision branch can read it back via excluded.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the overwritten column",
        why: "price = … prices the hub. A SET on stock would silently restock instead of repricing; the column left of the assignment names what the collision overwrites.",
      },
      {
        answer: "excluded",
        kind: "keyword",
        label: "the attempted row",
        why: "excluded.price IS the attempted 55 — the overwrite source. Bare price.price isn't a thing; stock.price has no such column. The excluded prefix is the upsert's whole vocabulary.",
      },
    ],
    distractors: ["49", "VALUES", "current", "stock", "excluded.price"],
    walkthrough:
      "INSERT … VALUES (3, …, 55, 85, 2) ON CONFLICT (id) DO UPDATE SET price = excluded.price — the collision reads the ATTEMPTED row and overwrites the live price: 49.00 → 55.00. Contrast with the restock pattern: there the bare column led (stock = stock + excluded.stock, accumulate); here excluded leads (price = excluded.price, overwrite). Accumulate when the attempt is a DELTA; overwrite when the attempt is the TRUTH. Stock stays 85 untouched — a well-scoped upsert changes exactly the columns it names.",
  },
  {
    id: "cs-2025",
    tier: "easy",
    topic: "w5",
    universe: "catalog",
    title: "The polite landing",
    brief:
      "From: Catalog intake. Re: the new webcam.\n\nA fresh SKU joins the lineup: id 17, Webcam 4K, Video shelf, 79.99, 10 on the shelf, supplier 2. Catalog ids are engine-assigned up to 16, so 17 is virgin territory — but the intake pipeline replays on network retries, and the replay must STAND DOWN, not bounce. Spell the collision branch that keeps replays quiet.",
    ask: "Insert product 17 with ON CONFLICT DO NOTHING — fresh rows land, replays stand down.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES ({1}, 'Webcam 4K', {2}, 79.99, 10, 2)
ON CONFLICT (id) DO {3};`,
    slots: [
      {
        answer: "17",
        kind: "number",
        noVerify: true,
        label: "the fresh id",
        why: "Ids 1–16 are taken; 17 inserts cleanly on first run. On a replay, 17 collides with the row it just created — and the DO NOTHING branch keeps that replay silent.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the shelf",
        why: "The Video category is live on the roster (two products today). The string needs quotes — bare Video reads as a column identifier and errors; a made-up shelf inserts a phantom bucket into every category report.",
      },
      {
        answer: "NOTHING",
        kind: "keyword",
        label: "the quiet collision",
        why: "DO NOTHING is the polite branch: collision → 0 rows affected, no error. DO UPDATE needs a SET clause; DO REPLACE/DO ERROR aren't SQLite grammar — the parser rejects them outright.",
      },
    ],
    distractors: ["16", "18", "'Vinyl'", "'Electronics'", "UPDATE", "REPLACE"],
    walkthrough:
      "INSERT … VALUES (17, 'Webcam 4K', 'Video', 79.99, 10, 2) ON CONFLICT (id) DO NOTHING — first run: a clean insert, engine receipt '1 row affected'. Replay: the id-17 collision fires, DO NOTHING stands down, receipt '0 rows affected', error none. That asymmetry — insert when new, silence when replayed — is what makes an import pipeline idempotent. Compare DO UPDATE, which would need a SET clause and would WANT to change something; NOTHING changes nothing. The 79.99 and stock 10 ride only the insert branch — on replay they're never re-applied, which is exactly the contract the intake pipeline promises.",
  },
  {
    id: "cs-2026",
    tier: "medium",
    topic: "w5",
    universe: "supplier",
    title: "The guarded restock",
    brief:
      "From: Supplier ops. Re: the keyboard restock guard.\n\nK1's restock feed pushed a 40-unit delta — but ops only trusts the feed for REAL restock attempts: a delta over 20 units applies, under 20 stands down as noise. The upsert needs its WHERE guard: per-collision, the update applies only when the ATTEMPTED stock clears the bar. Rebuild it.",
    ask: "Upsert product 1 with delta 40, guarded: apply only when the attempted stock exceeds 20.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES (1, 'Mechanical Keyboard K1', 'Electronics', 89.99, {1}, 1)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock
{2} excluded.{3} > 20;`,
    slots: [
      {
        answer: "40",
        kind: "number",
        noVerify: true,
        label: "the attempted delta",
        why: "The feed's delta rides the VALUES row (the attempted insert) — the guard reads it back as excluded.stock. A 40-unit attempt clears the 20-unit bar and applies.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the guard keyword",
        why: "DO UPDATE takes its own WHERE — evaluated per collision. AND/OR can't introduce the clause (syntax error), and HAVING belongs to SELECT. WHERE is the only spelling for a conditional update.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the guarded column",
        why: "The guard tests the ATTEMPTED stock — excluded.stock > 20. A guard on price would read 89.99 (always true) and never block anything; guarding id compares a constant. The column you guard is the column the feed moves.",
      },
    ],
    distractors: ["10", "AND", "HAVING", "price", "id"],
    walkthrough:
      "INSERT … (1, …, 40, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock WHERE excluded.stock > 20 — the collision fires, the guard reads the attempted 40, 40 > 20 passes, and the shelf moves 120 → 160. Send a 10-unit noise delta tomorrow: the guard fails, the collision stands down, the shelf keeps 160 — no error, no half-restock. The WHERE lives INSIDE the upsert: per-collision logic without a pre-SELECT. Guard on the column the feed actually drives; guard on anything else and the bar never blocks the right rows.",
  },
  {
    id: "cs-2027",
    tier: "medium",
    topic: "w5",
    universe: "month-close",
    title: "The audit echo",
    brief:
      "From: Controller. Re: restock receipts.\n\nThe close wants receipts, not silence: every applied restock must echo the row it wrote — id and the new shelf count — in the SAME statement, so the import log shows what landed without a follow-up SELECT. K1's feed delta is 25 against a 120 shelf. Rebuild the echoing upsert.",
    ask: "Upsert product 1 with delta 25 and RETURNING id, stock — the receipt rides the write.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES ({1}, 'Mechanical Keyboard K1', 'Electronics', 89.99, {2}, 1)
ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock
{3} id, stock;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the keyed id",
        why: "Product 1 — the id the conflict target watches. The receipt echoes it back with the updated shelf count: the two fields the import log files.",
      },
      {
        answer: "25",
        kind: "number",
        noVerify: true,
        label: "the feed delta",
        why: "Delta 25 rides the attempted row; the collision branch reads it as excluded.stock. The echoed stock column shows the AFTER-state: 120 + 25.",
      },
      {
        answer: "RETURNING",
        kind: "keyword",
        label: "the echo keyword",
        why: "RETURNING makes the write answer back — rows it WROTE, updates included. SELECT can't chase an INSERT in the same statement; SHOW/OUTPUT aren't SQLite. RETURNING is the receipt printer.",
      },
    ],
    distractors: ["2", "15", "SELECT", "SHOW", "OUTPUT", "USING"],
    walkthrough:
      "INSERT … (1, …, 25, 1) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock RETURNING id, stock — one row echoes back: (1, 145). RETURNING reports every row the statement WROTE, DO UPDATE included — the after-state, not the attempt. Run the same upsert as DO NOTHING (say, a replay with a zero delta) and the echo is EMPTY: silence vs receipt is how the import log tells stood-down collisions from applied ones. SQLite 3.35+ spells it this way; Postgres has for decades; MySQL still asks for a second SELECT. The close files the echo; the warehouse trusts the shelf.",
  },
  {
    id: "cs-2028",
    tier: "hard",
    topic: "w5",
    universe: "fraud",
    title: "The replace trap",
    brief:
      "From: Fraud desk. Re: the legacy migration script.\n\nA vendor script still uses the old spelling — INSERT OR REPLACE — to \"update\" the mouse's price. The desk wants the legacy statement EXACTLY as the vendor ships it, so the audit can show what it would destroy: product 2's row rebuilt from ONLY (id, name, price), stock 300 and its supplier link left unlisted. Rebuild the legacy write, trap included.",
    ask: "The vendor's INSERT OR REPLACE on product 2 with name and price 34.5 — unlisted columns not carried.",
    template: `INSERT OR {1} INTO products (id, name, price)
VALUES (2, {2}, {3});`,
    slots: [
      {
        answer: "REPLACE",
        kind: "keyword",
        label: "the legacy conflict word",
        why: "OR REPLACE is the blunt pre-UPSERT spelling: on collision it DELETES the old row and inserts a fresh one. OR IGNORE would skip (0 rows); OR FAIL and OR ABORT halt the statement — none reproduces the vendor's destructive write.",
      },
      {
        answer: "'Wireless Mouse M3 v2'",
        kind: "keyword",
        label: "the replacement name",
        why: "A quoted string literal — the v2 name the vendor pushes. Unquoted it parses as a column reference and errors; unlisted columns don't get renamed, they get LOST.",
      },
      {
        answer: "34.5",
        kind: "number",
        noVerify: true,
        label: "the carried price",
        why: "34.50 matches the current shelf price — the one column the vendor's script 'preserves' by listing it. Everything unlisted is rebuilt from scratch: stock, category, supplier_id all fall to NULL/defaults.",
      },
    ],
    distractors: ["IGNORE", "FAIL", "ABORT", "ROLLBACK", "29.99", "NULL", "'Wireless Mouse'"],
    walkthrough:
      "INSERT OR REPLACE INTO products (id, name, price) VALUES (2, 'Wireless Mouse M3 v2', 34.5) — REPLACE is DELETE + INSERT: the engine removes product 2's row (stock 300, category, supplier link and all) and inserts a fresh row carrying only what you listed. On THIS schema the fresh row can't even land — category is NOT NULL with no default, so the engine bounces it ('NOT NULL constraint failed: products.category'), leaving the OLD row intact: the constraint accidentally saves you. Remove that guard and the replace would 'succeed' — stock 300 erased, supplier orphaned, and the audit trail showing a routine price update. DO UPDATE is the modern spelling precisely because it touches only the columns it names. Legacy scripts deserve this audit before they deserve a production run.",
  },
  {
    id: "cs-2029",
    tier: "medium",
    topic: "w5",
    universe: "expense",
    title: "The target check",
    brief:
      "From: Expense ops. Re: the software ledger import.\n\nExpense imports replay too — the ledger's replay-safe write stands down when the SAME id arrives twice. New row: id 37 (the ledger ends at 36), Software, SaaS Co, 2025-03-02, 19,900 cents. The conflict target must name the column whose collision you're catching. Rebuild the import's write.",
    ask: "Insert expense 37 with ON CONFLICT (id) DO NOTHING — target the key that can actually collide.",
    template: `INSERT INTO expenses (id, category, vendor, spent_on, amount_cents)
VALUES ({1}, {2}, 'SaaS Co', '2025-03-02', 19900)
ON CONFLICT ({3}) DO NOTHING;`,
    slots: [
      {
        answer: "37",
        kind: "number",
        noVerify: true,
        label: "the new ledger id",
        why: "The ledger ends at 36; 37 inserts fresh on first run. On replay it collides with itself and DO NOTHING keeps the import quiet — same contract as the catalog's id-17 intake.",
      },
      {
        answer: "'Software'",
        kind: "keyword",
        label: "the expense category",
        why: "Quoted string for the category column — the ledger's grouping key. Unquoted it parses as an identifier and the insert errors; a typo'd category lands the spend in a bucket no report reads.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the conflict target",
        why: "The target must be the PRIMARY KEY or a UNIQUE column — id is the ledger's key. category or vendor carry no UNIQUE constraint: targeting them is 'ON CONFLICT clause does not match' rejection, the engine refusing to watch for a collision that can't be detected.",
      },
    ],
    distractors: ["36", "38", "'Tools'", "''", "category", "vendor", "amount_cents"],
    walkthrough:
      "INSERT INTO expenses (id, category, vendor, spent_on, amount_cents) VALUES (37, 'Software', 'SaaS Co', '2025-03-02', 19900) ON CONFLICT (id) DO NOTHING — first run: expense 37 lands; replay: collision on id, stand down, 0 rows. The target parenthetical is the load-bearing detail: ON CONFLICT (id) watches the PRIMARY KEY. Point it at category — a plain column with duplicates all over the ledger — and SQLite rejects the statement instead of silently watching for a conflict it could never detect. Targets must be keys; keys are what collisions are defined on. Same shape as the catalog intake, different ledger — the upsert contract travels.",
  },
  {
    id: "cs-2030",
    tier: "hard",
    topic: "w5",
    universe: "month-close",
    title: "The idempotent close",
    brief:
      "From: Controller. Re: the hub's close-week restock.\n\nClose week: the hub (product 3, 85 on the shelf) takes a 15-unit restock — and the close standard is the FULL upsert contract: delta accumulates on collision, a replayed 0-delta stays quiet, and the applied rows echo back. The close's template names every moving part. Rebuild it.",
    ask: "Upsert product 3 with delta 15 via DO UPDATE + accumulation — the branch that closes the week.",
    template: `INSERT INTO products (id, name, category, price, stock, supplier_id)
VALUES ({1}, 'USB-C Hub 7-in-1', 'Electronics', 49, {2}, 2)
ON CONFLICT (id) {3} SET stock = stock + excluded.stock;`,
    slots: [
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the keyed id",
        why: "The hub is product 3 — the id whose collision fires the update branch. Any other id and the delta lands on (or invents) someone else's row.",
      },
      {
        answer: "15",
        kind: "number",
        noVerify: true,
        label: "the close-week delta",
        why: "15 rides the attempted row; the collision reads it as excluded.stock and accumulates: 85 + 15 = 100. The VALUES row is the delta carrier, not the new total.",
      },
      {
        answer: "DO UPDATE",
        kind: "keyword",
        label: "the collision branch",
        why: "DO UPDATE SET … applies the accumulation — the branch that moves stock. DO NOTHING would stand down and the restock would silently never land; a bare UPDATE isn't upsert grammar. The branch is the decision.",
      },
    ],
    distractors: ["2", "4", "30", "DO NOTHING", "UPDATE", "REPLACE"],
    walkthrough:
      "INSERT … VALUES (3, 'USB-C Hub 7-in-1', 'Electronics', 49, 15, 2) ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock — collision on id 3, accumulation branch applies, shelf reads 100. The full contract from the module: the ATTEMPTED row carries the delta, the EXISTING row carries the shelf, DO UPDATE is the bridge, and DO NOTHING is the branch you'd spell if the feed ever pushed a replay you wanted quiet. Three moving parts — target, branch, accumulation vocabulary — and every import script in this course's write lessons is a variation on exactly these three.",
  },
];
