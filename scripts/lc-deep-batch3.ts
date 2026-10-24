// Deep-layer batch 3: lessons 41-49 (M7 Data Modification, M8 Schema Views & Beyond).
import { readFileSync, writeFileSync } from "node:fs";

const D = (n: number, deep: string) => {
  const path = `src/lib/curriculum/lessons/lesson-${String(n).padStart(2, "0")}.ts`;
  let src = readFileSync(path, "utf8");
  if (src.includes("\n  deep: [")) {
    console.log(`skip lesson-${n}`);
    return;
  }
  const tail = src.lastIndexOf("};");
  src = src.slice(0, tail).replace(/,\s*$/, ",\n") + `  deep: [\n${deep}  ],\n` + src.slice(tail);
  writeFileSync(path, src);
  console.log(`ok lesson-${n}`);
};

// ---------------- Lesson 41 — INSERT ----------------
D(41, `    {
      kind: "mind",
      text: "INSERT is a **column-list contract**: you name the columns you're providing, bind values positionally, and every column you OMIT takes its own default — which is NULL unless the schema says otherwise. The contract reading matters more than the syntax: \`INSERT INTO orders (customer_id, status, total, created_at)\` is a promise \\"I am supplying exactly these four\\"; the engine verifies types and constraints against the promise, and id — the INTEGER PRIMARY KEY — assigns itself. RETURNING (SQLite 3.35+) closes the loop: the write shows its work, handing back the generated ids and defaults so the app doesn't guess. Every mass-import bug story starts with someone trusting positional VALUES without the explicit column list.",
    },
    {
      kind: "engine",
      title: "you run INSERT INTO products (name, category, price, stock, supplier_id) VALUES ('Widget', 'tools', 19.99, 5, 2) RETURNING id, stock",
      steps: [
        "**Parse & bind** — the column list (5 names) must match the VALUES tuple (5 values); a mismatch is an immediate error, before any constraint fires.",
        "**Default fill** — omitted columns (id) take defaults: INTEGER PRIMARY KEY allocates max(rowid)+1; NOT NULL columns without defaults would reject the row here.",
        "**Constraint pass** — CHECKs, NOT NULLs, and the FK supplier_id → suppliers(id) are verified; a bad supplier_id aborts the statement atomically.",
        "**RETURNING** — the engine streams back the stored row (post-defaults): id 17, stock 5. Read-before-you-believe, now built into the write.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"INSERT INTO orders VALUES (…) without a column list is fine — it's shorter.\\"",
      truth: "The bare form binds positionally against the **table's current column order** — one ALTER TABLE or a schema drift later, silently wrong columns get filled. The explicit list is not verbosity; it's the version-proof form.",
    },
    {
      kind: "edge",
      items: [
        { c: "Omitting a NOT NULL column", r: "Reject: the default is NULL and the constraint refuses. The error names the column — read it, don't shotgun a value in." },
        { c: "Multi-row VALUES", r: "INSERT … VALUES (…), (…) is one statement, one transaction, one constraint pass per row — and it fails ATOMICALLY here (this course runs it rolled back). Partial imports can't leak." },
        { c: "INSERT … SELECT", r: "The VALUES tuple can be a whole SELECT — copying rows is still the same contract. Fan-out applies: the SELECT's grain is what lands in the table." },
        { c: "Explicit id collisions", r: "Force id = 5 twice and the second INSERT hits the PK constraint. Also: explicit rowids above the auto-counter shift future auto-allocation — know the interaction before hand-seeding ids." },
      ],
    },`);

// ---------------- Lesson 42 — UPDATE ----------------
D(42, `    {
      kind: "mind",
      text: "UPDATE is a **read-modify-write executed for every row the WHERE admits** — and its two disciplines are both about scope. First: the WHERE is the whole ballgame. The seed makes 2 of 16 customers inactive (holding 6 orders between them); \`UPDATE customers SET active = 0 WHERE region = 'APAC'\` and \`UPDATE customers SET active = 0\` differ by 5 rows versus 16 — the forgotten WHERE is the most expensive typo in data work. Second: the SET expressions are evaluated **per row against that row's current values**, which makes self-reading updates legal and powerful (\`SET total = total * 1.1\`, \`SET stock = stock - 5\`) — the row is its own reference. Changes() tells you the blast radius after the fact; run the SELECT twin of your WHERE BEFORE the write, never after regret.",
    },
    {
      kind: "engine",
      title: "you run UPDATE customers SET active = 0 WHERE region = 'APAC'",
      steps: [
        "**Target pass** — the engine resolves WHERE first: 5 APAC customers form the target set. Nothing is written yet.",
        "**Per-row rewrite** — for each target row, SET evaluates against current values; active = 0 is constant, but stock = stock - 5 would read each row's own stock.",
        "**Constraint check** — the new row image is validated (NOT NULL, CHECK, FK targets); a violation aborts the statement — and inside this course's sandbox, the transaction rolls back wholesale.",
        "**Count** — changes() reports 5. If the count disagrees with the SELECT twin of the WHERE, stop and re-read — the write already happened.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"UPDATE is safe because I can run it again if I get it wrong.\\"",
      truth: "UPDATE is **not idempotent for non-idempotent expressions**: stock = stock - 5 subtracts AGAIN on rerun. The rerun fantasy is why the discipline is transaction + SELECT-twin + changes()-check — not optimism.",
    },
    {
      kind: "edge",
      items: [
        { c: "SET with a subquery returning 2 rows", r: "A scalar SET can't consume a multi-row result — error. Aggregate inside the subquery (SELECT MAX(…) …) or restructure; the error is the engine refusing ambiguity." },
        { c: "UPDATE … FROM (join-update)", r: "SQLite supports UPDATE … FROM: join targets onto the updated table. The fan-out law follows — if FROM produces two source rows per target, the update is ambiguous and one wins arbitrarily. Pre-fold the FROM." },
        { c: "Self-reading expression order", r: "SET columns are assigned conceptually simultaneously from OLD values: swap via SET a = b, b = a works in one statement. Sequential-expectation bugs come from assuming per-column sequencing." },
        { c: "Zero-row UPDATE", r: "changes() = 0 is a verdict: the WHERE matched nothing (typo? wrong status? already applied?). An update that \\"worked\\" and touched nothing is usually the bug, not the success." },
      ],
    },`);

// ---------------- Lesson 43 — DELETE ----------------
D(43, `    {
      kind: "mind",
      text: "DELETE is UPDATE's twin with a harsher failure mode: rows **leave the database**. The WHERE discipline is identical — target first, twin-SELECT, changes()-check — but there is no \\"soft\\" version of a deletion. The lesson's third idea is the **foreign-key fence**: references FROM other tables make deletion a graph operation, not a row operation. Deleting a customer who holds orders either fails (FK enforcement ON) or orphans 24 order rows (OFF) — both outcomes are data-model statements. The production-grade pattern is not \\"delete harder\\"; it's the soft-delete flag (active = 0 — the seed already carries 2 such customers) or the staged purge: children first, parents last, one transaction.",
    },
    {
      kind: "engine",
      title: "you run DELETE FROM orders WHERE status = 'cancelled'",
      steps: [
        "**Target pass** — WHERE resolves to the 7 cancelled orders. As with UPDATE: nothing is gone yet, and the SELECT twin of the WHERE previews the victims exactly.",
        "**FK scan** — for each victim the engine checks inbound references (nothing references orders here, so the fence doesn't fire; invoices referenced by payments would).",
        "**Row removal** — victims leave the b-tree; indexes on the table update in the same statement. The rollback sandbox then undoes it all — you saw the count without the loss.",
        "**Count** — changes() = 7. Any surprise in this number IS the incident report; reconcile before committing for real.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"DELETE FROM orders clears space immediately.\\"",
      truth: "Freed pages typically go to the **freelist for reuse**, not back to the OS (and without VACUUM the file size doesn't shrink). Deleting 90% of a table then querying it can even be SLOWER until repack — deletion is a data operation, not a defrag tool.",
    },
    {
      kind: "edge",
      items: [
        { c: "FK enforcement OFF", r: "SQLite defaults to OFF per connection: the DELETE succeeds and leaves orphaned children silently. This course's lessons show both worlds — in production, decide deliberately and set PRAGMA foreign_keys = ON." },
        { c: "ON DELETE cascade", r: "A schema that declares ON DELETE CASCADE makes parent deletes sweep children automatically. Powerful, invisible, and terrifying in bulk — cascade chains have eaten more data than most hackers." },
        { c: "DELETE with JOIN", r: "Standard SQL deletes from ONE table; multi-table purges stage the victims: DELETE WHERE id IN (SELECT … FROM join). The staged form is also where you preview with SELECT first — same query, verb swapped." },
        { c: "TRUNCATE envy", r: "SQLite has no TRUNCATE; DELETE FROM tbl (no WHERE) is row-by-row. For full resets the course's resetDatabase() simply recreates tables — often the cheaper contract." },
      ],
    },`);

// ---------------- Lesson 44 — UPSERT & transactions ----------------
D(44, `    {
      kind: "mind",
      text: "UPSERT resolves the **race between \\"insert\\" and \\"already there\\"**: ON CONFLICT (key) DO UPDATE turns the constraint violation from an error into a fork — new rows insert, existing rows update, one statement, no round-trip. The DO UPDATE arm reads the colliding row as the \`excluded.\` table's twin: SET stock = stock + excluded.stock adds the NEW shipment to the OLD shelf. Around it sits the transaction: BEGIN … COMMIT is the all-or-nothing envelope that makes multi-step writes atomic — and this course's entire grading sandbox is built on the same primitive (every write lesson runs inside a transaction that always rolls back). Atomicity is not a performance feature; it is the difference between \\"half a migration\\" and \\"a migration\\".",
    },
    {
      kind: "engine",
      title: "you run INSERT INTO products (id, name, …) VALUES (3, 'Widget', …) ON CONFLICT(id) DO UPDATE SET stock = stock + excluded.stock",
      steps: [
        "**Try the insert** — the engine attempts the ordinary INSERT path; constraints evaluate as usual.",
        "**Conflict fork** — product 3 exists → the PK violation fires, but the ON CONFLICT clause catches it: instead of erroring, the DO UPDATE arm runs for THAT row only.",
        "**excluded semantics** — inside DO UPDATE, \`excluded\` is the row you TRIED to insert; bare \`stock\` is the row on disk. stock + excluded.stock is old-plus-new in one expression.",
        "**Envelope** — run inside BEGIN/COMMIT and either the whole sequence lands or none of it did. The sandbox wraps every lesson write and always rolls back — atomicity as a teaching instrument.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"UPSERT means MERGE — I can update some columns and insert others conditionally with WHEN logic.\\"",
      truth: "The fork is binary (insert OR update) and keyed by the conflict target. Anything fancier — conditional column sets, multiple branches — is a CTE pattern (UPDATE … WHERE EXISTS / INSERT WHERE NOT EXISTS) or app logic. The simplicity is the feature: one key, one fork, no races.",
    },
    {
      kind: "edge",
      items: [
        { c: "Wrong conflict target", r: "ON CONFLICT (id) when the collision is on a UNIQUE(number) index → uncaught violation, error anyway. The target must name the actual constraint that fires." },
        { c: "DO NOTHING vs DO UPDATE", r: "DO NOTHING is the silent twin: dedupe imports without touching survivors. Choosing between them is a business decision (keep first? add stock?) — not a syntax preference." },
        { c: "Rollback discipline", r: "Inside BEGIN, an error normally aborts the transaction — but this sandbox ROLLBACKs deliberately. In production, catch, decide, ROLLBACK or COMMIT; never assume half-committed is a state that exists." },
        { c: "Non-idempotent upserts", r: "stock = stock + excluded.stock ADDS on every replay — replaying the same shipment file doubles stock. Idempotent upserts SET stock = excluded.stock (keep latest) when replay-safety matters more than accumulation." },
      ],
    },`);

// ---------------- Lesson 45 — CREATE TABLE ----------------
D(45, `    {
      kind: "mind",
      text: "CREATE TABLE is the moment the database **learns what a lie looks like**: every constraint you declare converts a future class of bad data from \\"silently accepted\\" into \\"loudly rejected\\". The storefront's contract: INTEGER PRIMARY KEY (the rowid — a free b-tree, lesson 48's topic), NOT NULL on every fact, DEFAULTs for optional flags (active = 1), REAL for prices this coarse, and INTEGER cents where exactness matters (invoices.amount_cents — float money is how accounting bugs breed). FKs (REFERENCES suppliers(id)) declare the graph. Constraint design is requirements engineering in disguise: each one is a sentence like \\"an order cannot exist without a customer\\" — written once, enforced forever, by the only witness that never gets tired.",
    },
    {
      kind: "engine",
      title: "you run CREATE TABLE products (…, supplier_id INTEGER NOT NULL REFERENCES suppliers(id))",
      steps: [
        "**Schema write** — the definition lands in sqlite_master; the table exists with zero rows. Types here are AFFINITIES (TEXT/INTEGER/REAL) — SQLite still stores what you give it, coerced politely.",
        "**Constraint compilation** — NOT NULL / CHECK / DEFAULT / FK become per-write checks from now on; the cost is paid on every INSERT/UPDATE, not at creation.",
        "**FK wiring** — REFERENCES records the graph edge; whether it ENFORCES depends on the connection's PRAGMA foreign_keys (lesson 43's fence) — the declaration is the option, the pragma is the switch.",
        "**The rollback** — DDL in this sandbox also runs in the rolled-back transaction: you can CREATE, test, and vanish. Schema experiments are cheap; production schema changes are not.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"I can add constraints later when the data grows up — start loose, tighten over time.\\"",
      truth: "Bad data **arrives faster than refactor plans**: loose tables accumulate rows that violate the constraints you meant to add, and tightening then requires cleaning history you can't fully see. Declare the lie-detectors at birth; ALTER is for the exceptions.",
    },
    {
      kind: "edge",
      items: [
        { c: "REAL money", r: "0.1 + 0.2 ≠ 0.3 in binary floats; SUM over float money drifts. The invoice/expense tables store INTEGER cents — exactness by representation, not by rounding luck." },
        { c: "INTEGER PRIMARY KEY ≠ rowid alias", r: "Only INTEGER PRIMARY KEY aliases the rowid (free lookups); a TEXT pk or a composite pk builds a separate index instead. The id choice has a performance shape, not just a style." },
        { c: "UNIQUE vs PK", r: "A table can have one PK and many UNIQUEs (invoice.number is UNIQUE, id is PK). Both create indexes; both reject duplicates — PK is identity, UNIQUE is a business rule." },
        { c: "CHECK with functions", r: "CHECK (length(number) = 8) runs per write and can't reference other tables. It's the right tool for shape rules; \\"valid supplier\\" needs the FK, not a CHECK." },
      ],
    },`);

// ---------------- Lesson 46 — ALTER & DROP ----------------
D(46, `    {
      kind: "mind",
      text: "Schema evolution is **surgery on a living patient**: ALTER TABLE performs the small, safe operations (ADD COLUMN, RENAME) while readers keep reading; DROP TABLE is the amputation that everything referencing the lost limb must survive. The discipline is knowing what's cheap and what's not: ADD COLUMN with a DEFAULT is metadata-instant in SQLite (existing rows logically carry the default); changing a column's TYPE or dropping a column triggers the heavier rewrite path. And DROP's blast radius is the schema graph — views that select from the table, FKs that point at it, indexes that live on it. The migration mindset: write the new state, copy the data, swap the names, keep the old table until the app proves itself — reversibility over tidiness.",
    },
    {
      kind: "engine",
      title: "you run ALTER TABLE products ADD COLUMN discontinued INTEGER NOT NULL DEFAULT 0",
      steps: [
        "**Metadata path** — SQLite adds the column to the schema record; because a DEFAULT exists, no per-row rewrite happens. The table is \\"wider\\" immediately for all readers.",
        "**Read semantics** — existing rows now report discontinued = 0 logically, though nothing was physically rewritten. SELECT * returns the new shape; old prepared statements invalidate.",
        "**RENAME ripples** — ALTER TABLE … RENAME updates references inside the same database (views, FKs) — a rare automatic migration, and the reason renames are safer than they look.",
        "**DROP ceremony** — DROP TABLE products removes the table plus its indexes; sqlite_master shrinks. Inside this sandbox it all rolls back — rehearsal before production surgery.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"ALTER TABLE is dangerous, so I should export, recreate, and reimport the table for any change.\\"",
      truth: "That ceremony is the **heavy path** — reserved for what ALTER genuinely can't do (type changes, constraint additions on SQLite). For ADD/RENAME/DROP COLUMN the engine's own path is atomic, fast, and doesn't risk a copy-step losing rows. Match the tool's weight to the operation's weight.",
    },
    {
      kind: "edge",
      items: [
        { c: "ADD COLUMN NOT NULL without DEFAULT", r: "Refused on a non-empty table: existing rows can't satisfy the new rule. The escape is DEFAULT (a value for history) or the full rewrite path with a backfill step." },
        { c: "DROP COLUMN with dependents", r: "An index or view referencing the column blocks the drop (SQLite refuses rather than cascading). Drop dependents in order — dependency trees prune leaf-first." },
        { c: "Renaming into collisions", r: "RENAME to an existing name errors; RENAME TO the same name \\"succeeds\\" as a no-op. Migration scripts run twice — write them idempotent." },
        { c: "The dropped-table shadow", r: "Views and triggers over a dropped table become zombies that error on use. DROP the dependents first, or accept the archaeology ticket later." },
      ],
    },`);

// ---------------- Lesson 47 — Views ----------------
D(47, `    {
      kind: "mind",
      text: "A view is a **named query, not a named table**: CREATE VIEW saves the SELECT under a callable name and stores nothing but the definition. Every SELECT from the view re-runs the query — always current, never stale, never duplicated. The value is vocabulary: once \`customer_balances\` exists, the team says \\"join customer_balances\\" instead of \\"join payments, invoices, subtract, coalesce…\\" — the join logic is written once, audited once, and every consumer inherits the correctness. Views are also a safety tool: grant access to the view, not the base tables, and sensitive columns never leave the vault. The cost is equally real: a view over a view over a join can hide a 6-table fan-out behind an innocent name — depth discipline is part of view hygiene.",
    },
    {
      kind: "engine",
      title: "you run CREATE VIEW open_invoices AS SELECT … FROM invoices WHERE status = 'open'  — then SELECT COUNT(*) FROM open_invoices",
      steps: [
        "**Definition storage** — the CREATE stores SQL text (parsed) in sqlite_master. No data moves; the view is a macro, not a snapshot.",
        "**Query-time expansion** — SELECT FROM open_invoices rewrites to the underlying SELECT, then optimizes THROUGH it: predicates on the view push down into the base tables when possible.",
        "**Freshness for free** — because nothing is materialized, an INSERT to invoices is instantly visible in the view. The trade: every read pays the query's cost again.",
        "**The sandbox** — the CREATE VIEW itself runs inside the rolled-back transaction: the view vanishes after the lesson, like everything else in the write path here.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Views are slow because they re-run every time — a table snapshot would be faster.\\"",
      truth: "Views re-run, yes — but the optimizer sees THROUGH them, and most view queries are cheap. Snapshots (materialized tables) are faster to read and WRONG the moment base data moves: you've traded correctness for latency. Materialize only with a refresh strategy you actually own.",
    },
    {
      kind: "edge",
      items: [
        { c: "View over a fan-out join", r: "The innocent-looking view name hides a 3× SUM inflation (lesson 15/16's disease). Views need the same grain audit as queries — the name \\"balances\\" doesn't sanitize the join inside." },
        { c: "Nested views", r: "View on view on view reads fine and plans deep: each layer inlines until the \\"simple select\\" is a six-table monster. Two layers is a convention worth having." },
        { c: "Column-list drift", r: "CREATE VIEW v AS SELECT * FROM t: an ALTER on t changes the view's shape silently. Column lists in view definitions are the version-proof form — same rule as INSERT." },
        { c: "Modifying through a view", r: "Simple single-table views are updatable in SQLite; joined views are not. Don't design around write-through views — the base table is the write API." },
      ],
    },`);

// ---------------- Lesson 48 — Indexes & EXPLAIN QUERY PLAN ----------------
D(48, `    {
      kind: "mind",
      text: "An index is a **paid-for shortcut**: a second, sorted structure (b-tree) over chosen columns that turns full-table sweeps into targeted descents — bought with extra storage and a tax on every write. This seed's secret is that it starts with ZERO secondary indexes yet is not slow at 103 rows: the rowid/INTEGER PRIMARY KEY is already a free b-tree, so id lookups SEARCH while status lookups SCAN. EXPLAIN QUERY PLAN is how you stop guessing and start reading: the detail column names the access method per step — SCAN (sweep) versus SEARCH (descent) — plus temp b-trees for sorts and \\"USING COVERING INDEX\\" when the index alone can answer. The module-11 discipline starts here: measure → design → verify, with EQP as the contract between you and the planner.",
    },
    {
      kind: "engine",
      title: "you run EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'",
      steps: [
        "**Plan, not rows** — EQP returns the planner's intended step list; nothing executes. It's the map, not the trip.",
        "**Read the verb** — \\"SCAN orders\\" = every row tested (103 here). \\"SEARCH orders USING INDEX idx\\" = b-tree descent to the qualifying range. The verb IS the verdict.",
        "**The counter-proof** — EQP the same query with WHERE id = 42: \\"SEARCH … USING INTEGER PRIMARY KEY (rowid=?)\\" — the free index you never had to build.",
        "**CREATE INDEX idx_orders_status** — rerun EQP: the SCAN became \\"SEARCH … USING INDEX\\". Same rows back, different path — and every future INSERT to orders now maintains that extra tree. That's the whole trade, visible in three queries.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Add an index on every column you might filter — speed is free.\\"",
      truth: "Each index is **storage plus a per-write maintenance tax**, and the planner can only use ONE index per table access in most plans — five single-column indexes on orders don't compose into a five-column filter; a composite can. Index design is choosing bets, not buying insurance on everything.",
    },
    {
      kind: "edge",
      items: [
        { c: "Functions on the column", r: "WHERE SUBSTR(created_at,1,7) = '2024-06' can't use an index on created_at — the function hides the raw value. Rewrite as a range: >= '2024-06-01' AND < '2024-07-01' (module 11's rewrite drill)." },
        { c: "Low-selectivity columns", r: "An index on status (4 distinct values over 103 rows) may still be ignored: reading half the table via the index is slower than sweeping. Selectivity is the planner's math, not your intuition's." },
        { c: "Leading-wildcard LIKE", r: "LIKE '%a%' cannot descend any b-tree (it doesn't know the prefix). 'a%' CAN use an index on that column — the leading wildcard is the boundary." },
        { c: "The plan changed", r: "EQP output differs after ANALYZE, data growth, or version upgrades — plans are decisions, not laws. Re-read EQP when volumes shift by orders of magnitude." },
      ],
    },`);

// ---------------- Lesson 49 — Recursive CTEs ----------------
D(49, `    {
      kind: "mind",
      text: "WITH RECURSIVE is SQL's **loop**: an anchor query seeds the working set, a recursive step reads the working set and emits the next generation, and the engine iterates until a pass emits nothing. The spine pattern — one row per month from a start date — generates the calendar a report needs when some months have no data (LEFT JOIN facts onto the spine so gaps show as zeros, not absences). The walk pattern — org charts, bill-of-materials, transit hops — follows foreign keys generation by generation. Two disciplines keep recursion safe: the **termination** must be structural (each step must consume progress — counter, depth, or shrinking set), and the **recursion direction** must be explicit (UNION ALL keeps duplicates and speed; UNION dedupes at a cost).",
    },
    {
      kind: "engine",
      title: "you run WITH RECURSIVE m(month) AS (SELECT '2024-01' UNION ALL SELECT date(m.month, '+1 month') FROM m WHERE m.month < '2025-02') SELECT * FROM m",
      steps: [
        "**Anchor** — the first SELECT emits '2024-01' into the queue. One row, iteration zero.",
        "**Step** — the recursive SELECT reads the queue and emits date(+1 month) per row while the guard holds. '2024-02' joins the queue; the engine repeats.",
        "**Termination** — the WHERE stops the march at '2025-02': the next pass would emit nothing, so iteration ends. 14 rows for 14 months — count is the receipt.",
        "**The infinite-loop cousin** — drop the guard and the queue never empties: the engine runs until a limit fires. Every recursive CTE needs its exit condition written like a promise, not an afterthought.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Recursive CTEs are for tree-walking only — a calendar can just be generated in the app.\\"",
      truth: "Both halves are wrong: recursion is a **general generator** (calendars, sequences, grids), and generating the spine IN SQL keeps the report one self-contained query — the app-side version scatters the grain decision across languages. The spine belongs with the facts it will be joined to.",
    },
    {
      kind: "edge",
      items: [
        { c: "Missing termination guard", r: "The classic infinite loop: SQL_ROW_LIMIT/timeout fires, or in worse engines, disk does. Guard columns (depth + 1, date < end) are non-negotiable." },
        { c: "UNION vs UNION ALL in recursion", r: "UNION dedupes each generation — required for some graph walks to terminate, wasteful for calendars where rows are unique anyway. Know which your shape needs." },
        { c: "Cycles in the data", r: "A circular org chart (A reports to B reports to A) loops forever under UNION ALL. Depth caps and visited-tracking are the standard armor." },
        { c: "Joining the spine to facts", r: "LEFT JOIN facts ON month so empty months survive as rows — INNER JOIN erases exactly the gaps the spine existed to reveal. The join direction is the analysis." },
      ],
    },`);
