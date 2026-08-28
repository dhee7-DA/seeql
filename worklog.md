# Worklog

---
Task ID: 1
Agent: Super Z (main agent)
Task: Build a SQL query visualizer webapp (Type 3 — Interactive Web Development)

Work Log:
- Initialized fullstack environment via init script (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui)
- Installed node-sql-parser@5.4.0; repaired corrupted @prisma/get-platform with `bun install --force` after postinstall failure
- Probed real AST node shapes of node-sql-parser v5.4.0 via scripts/inspect-ast.ts (column_ref nested objects, groupby:{columns}, object-form CTE names, window_func, limit {seperator:'offset'}, {tableList,columnList,ast} subquery wrappers)
- Built src/lib/sql-parser.ts — defensive AST walker: exprToString (columns, aggr/window/scalar funcs, CASE, CAST, IN lists, INTERVAL, subqueries), condition flattening, table/join extraction with alias resolution, CTE summarization, DISTINCT/set-op/limit/offset handling, complexity scoring
- Validated engine with scripts/test-parser.ts against 8 cases (joins, star schema, CTE+window, UNION, correlated subquery, UPDATE, syntax error)
- Built src/app/api/parse/route.ts (POST {sql, dialect} → QueryPlan | error, dialect whitelist)
- Built src/lib/sql-types.ts (client-safe types + DIALECTS const), src/lib/samples.ts (6 samples)
- Built src/components/sql-editor.tsx — overlay technique editor (transparent textarea over highlighted pre), line-number gutter, scroll sync, Tab→spaces, Ctrl/⌘+Enter
- Built src/components/pipeline-view.tsx — 10-step logical execution timeline (WITH→FROM→JOIN→WHERE→GROUP BY→HAVING→SELECT→DISTINCT→ORDER BY→LIMIT) with framer-motion stagger, "not used" states, content chips
- Built src/components/joins-view.tsx — SVG entity diagram: draggable table/CTE/derived cards with selected columns, bezier join edges colored by join type with label chips, hover dim/highlight, hub-spoke / side-by-side auto-layout, legend
- Built src/components/breakdown-view.tsx — clause cards (SELECT w/ AGG+table badges, FROM & JOINS w/ ON conditions, WHERE/GROUP BY/HAVING, ORDER BY direction, LIMIT/OFFSET, CTEs, set ops, flags)
- Rewrote src/app/page.tsx — header (sample select, dialect select, Visualize), stats chip row, 4 tabs, error card with hint, loading/empty states, sticky footer
- Set html.dark in layout.tsx, new metadata; added scrollbar CSS to globals.css
- Browser-verified with agent-browser: desktop/mobile render, all 4 tabs, sample loading, error state, node dragging, hover highlighting; fixed 2 bugs found (framer-motion scale clobbering SVG transform → wrapped positioning g outside motion.g; unqualified columns not attributed to single-table scope)

Stage Summary:
- Deliverable: SQL Visualizer at / (single route) + /api/parse
- Key files: src/lib/sql-parser.ts, src/app/api/parse/route.ts, src/components/{sql-editor,pipeline-view,joins-view,breakdown-view}.tsx, src/app/page.tsx
- Lint clean; dev server 200; browser console clean; all samples parse correctly

---
Task ID: 2
Agent: Super Z (main agent)
Task: Extend SQL Visualizer with real query execution, results, EXPLAIN plan, parse tree and schema ERD

Work Log:
- Redesigned prisma/schema.prisma with 5 mapped models (customers, suppliers, products, orders, order_items) and pushed via db:push
- Built src/lib/sample-db.ts: raw DDL + deterministic LCG-seeded dataset (16 customers, 6 suppliers, 16 products, ~103 orders, ~250 order_items, power-buyer weighting), ensureDatabase()/resetDatabase() lifecycle
- Built /api/query route: single-statement scanner (quote/comment aware), $queryRawUnsafe for reads / $executeRawUnsafe for writes, BigInt/Date/Buffer cell normalization, 1000-row payload cap, EXPLAIN QUERY PLAN capture, friendly SQLite error hints (Prisma boilerplate stripped)
- Built /api/reset (drop+recreate+reseed) and /api/stats (live row counts)
- Built src/lib/ast-tree.ts: defensive AST→TreeNode converter with dedicated handling for select clauses, sqlite {expr,as} column items (no type wrapper!), FROM/JOIN entries with ON text, CTEs, window functions, CASE, set ops, subquery wrapper unwrap, node/depth budget caps; wired into /api/parse response as tree
- Built components: results-view (sticky header, zebra rows, NULL styling, numeric right-align, CSV copy/download, render cap + show-all, write-statement success banner), plan-view (id/parent tree build, SCAN/SEARCH/SUBQUERY icons), parse-tree-view (collapsible branches, type-colored badges, legend), schema-view (SVG bezier FK edges with 1—N labels, hover highlight/dim, live row counts, click table → SELECT * query)
- Rewrote page.tsx: Run button fires parse+execute in parallel, results section with Results/Plan sub-tabs, Reset database action, localStorage query history dropdown, Schema tab click-through, updated footer/metadata; all 7 samples rewritten to runnable SQLite (DATE_TRUNC→strftime, users→customers)
- Fixed 3 bugs found in browser verification: lowercase <icon> JSX tag treated as DOM element; sqlite column items rendering as generic "node" in parse tree; sparse join-agg seed data returning 0 rows for HAVING > 5
- Verified via agent-browser: desktop + mobile render, all 6 tabs, sample switching, Ctrl+Enter, UPDATE statement, error states (parse + execution), history persistence, reset; zero console errors; lint clean

Stage Summary:
- App now parses AND executes: structure visualizations + live SQLite results + engine plan + AST tree + ERD
- Key new files: src/lib/{sample-db,ast-tree,schema-meta}.ts, src/app/api/{query,reset,stats}/route.ts, src/components/{results-view,plan-view,parse-tree-view,schema-view}.tsx
- All 7 samples parse and execute successfully; verified screenshots in scripts/verify-*.png
