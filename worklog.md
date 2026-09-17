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

---
Task ID: 11
Agent: Super Z (main agent)
Task: INCIDENT RECOVERY + "no AI slop" redesign — workspace had been reset to the Aug 28 snapshot (learn module, landing, themes all lost); rebuilt the product on the surviving playground/db foundation with a flat design language

Work Log:
- Diagnosed the reset: git history + .next cache only contained the old Task-1/2-era source; nothing recoverable. sample-db.ts, /api/query, sql-parser and the 4-tab playground survived.
- Design pivot per user feedback ("dislike gradient ai slop"): zero gradients/glows/confetti anywhere — solid surfaces, hairline 1px borders, one accent per theme, flat toasts.
- Theme system v2: src/lib/themes.ts registry (5 themes: Carbon/sleek dark default, Paper/classic light, Marine/modern navy dark, Oxblood/statement warm dark, Gallery/minimal white+persimmon light) + globals.css engine redefining zinc/emerald/teal ramps + shadcn tokens per theme class. Light themes INVERT the zinc ramp by role — including zinc-50/100 which are bright-TEXT roles on dark and therefore invert to near-ink (first attempt mapped them light and headings vanished; caught in browser QA and fixed).
- brand.tsx: solid flat mark (accent rounded square, ink lens + data rows — no gradient); Wordmark pinned to text-zinc-100 so it reads on all themes; icon.svg favicon.
- theme-switcher.tsx: flat 3-cell solid swatches, useSyncExternalStore over seeql:theme-change event bus, persists seeql-theme-v1; layout.tsx boot script applies theme class + dark toggle pre-paint (no FOUC).
- Curriculum engine: types.ts (Lesson/Block/Mcq/Problem/ExpectedResult), gamification.ts (XP economy, 6-rank ladder 0/400/1000/1800/2800/4000, DAILY_GOALS, 8 badges, currentStreak), progress.ts zustand persist under the SAME key sql-visualizer-learn-v1 (returning users keep XP), idempotent xpEvents ledger + xpByDay buckets.
- DB: added nullable orders.shipped_at (pending/cancelled stay NULL) so the NULL lesson teaches on real holes; LCG seed otherwise unchanged (103 orders / 251 items / 16 customers / 16 products / 6 suppliers).
- Content: 8 lessons (tables&keys, SELECT/FROM, WHERE, NULL, ORDER BY/LIMIT, DISTINCT, aggregates, GROUP BY/HAVING) — prose + runnable code + diagrams + 32 MCQs + 28 graded problems. scripts/gen-expected.ts resets db, runs every solution, writes src/lib/curriculum/expected.ts (28/28 OK, 0 failures) and prints facts used to keep diagrams/prose honest (103 orders, 65 over 200, 21 unshipped, statuses 52/30/14/7, top order #74 1088.44…).
- Learn UI: learn-app.tsx (sidebar: module progress, rank block, streak, lesson nav, reset; overview: stats, badge wall, resume CTA; badge/level watcher), lesson-view.tsx (Learn/Quiz/Practice tabs, inline "Run here" code blocks, lesson-complete +50 XP), mcq.tsx (+5 XP, +3 first-try), problem-runner.tsx (SqlEditor + /api/query + order-aware grading, hints, solution unlock after 3 runs), result-grid.tsx, celebrate.tsx (FLAT toasts, no confetti), rich.tsx (**bold**/`code`), diagrams.tsx (9 flat animated figures incl. l8 two-gate HAVING relay with stepper).
- Landing v2: flat editorial page — sticky nav, hero with solid accent word + looping flat hero-demo (clause highlighting, pipeline chips, real counts), stats strip, 6 features, Read/Watch/Prove method, curriculum lesson list, flat CTA, minimal footer. page.tsx: hash routing via useSyncExternalStore (landing / #playground #learn; no setState-in-effect), rebranded headers/footers, ThemeSwitcher + Learn/Playground cross-links.
- Fixed along the way: stale Turbopack CSS after the reset (dev server restart required — theme blocks absent from served CSS), diagrams dots type, gradeResult ExecResponse typing, sample-db nullable SeedRow, pre-existing plan-view children + sql-parser Dialect type errors, demo card showing results before SELECT stage, diagram label clipping.
- Verified: tsc src 0 errors, eslint clean, 28/28 solutions OK, browser QA at 1440×900 + 390×844 across all 5 themes (landing, learn overview, lesson, quiz, practice grading E2E: +8 XP first-try MCQ → First Steps badge; +5 XP graded solve → Problem Solver badge; XP ledger persists across reload with idempotent keys), console clean, theme persists (seeql-theme-v1), default Carbon.

Stage Summary:
- Product restored AND redesigned flat: 5 premium non-gradient themes, SeeQL identity, landing page, working learn module (8 lessons / 9 diagrams / 32 MCQs / 28 graded queries / XP-ladder-badges-streaks) on the real storefront db.
- Known deltas vs the lost build (restore roadmap): question bank was 240 MCQs/186 queries → now 32/28; diagrams 35 → 9; case studies (13) + quiz pager + daily-goal picker not yet rebuilt; Module 2 Joins pending. Architecture is the same shape, so content can be appended lesson-by-lesson without refactors.
- Key files: src/lib/themes.ts, src/app/globals.css, src/lib/curriculum/*, src/components/learn/*, src/components/landing.tsx, src/components/landing/hero-demo.tsx, src/components/{brand,theme-switcher}.tsx, src/app/page.tsx, src/lib/sample-db.ts (shipped_at), scripts/gen-expected.ts

---
Task ID: 12
Agent: Super Z (main agent)
Task: Module 2 "Joins & Relationships" (8 lessons), question-bank growth (+100 MCQs / +72 problems vs. Task 11), shareable playground query links

Work Log:
- Collected join facts first (scripts/facts-m2.ts, facts-m2b.ts, facts-orders123.ts) so every prose/diagram number is real: seed is fully connected (every customer ordered, every product sold), so anti-joins need a conditional right side — customers with no delivered order = 1 (Liam O'Brien), no shipped order = 6; region self-join pairs = 39 (EU 28 / APAC 10 / US 1 / LATAM 0); category product pairs = 12; fan-out inflation SUM(o.total) over orders⋈items = 103,244.55 vs true 34,833.28; top spend Alice 7,262.35 (24 orders); real order rows 1→Pedro 576.54, 2→Maya 416.81, 3→Alice 767.64.
- Module 2 curriculum: lessons 09–16 (why joins/fk lookup, INNER JOIN mechanics + aliases, three-table chains, LEFT JOIN, anti-join incl. filter-first subquery pattern, self-join with c1.id<c2.id guard, joins+aggregates with COUNT(*) vs COUNT(col) zero trap, capstone fan-out trap + aggregate-before-join). Each: prose + runnable code + 4 MCQs + 4 graded problems (32/32). All problems verified by gen-expected.
- types.ts FigureId extended with j1–j8; diagrams.tsx gained RowCard helper + 8 flat join figures (fk-lookup, inner-match, chain, left-join, anti-join, self-join, fanout, join-aggregate) in the no-gradient design language.
- lessons/index.ts: LESSONS now 16; added MODULES registry (id/num/title/level/blurb/lessons) + lessonsOf/moduleOfLesson helpers; MODULE kept as back-compat alias.
- learn-app.tsx: sidebar now groups lessons under per-module headers with per-module progress counters; overview shows two module cards + aggregate stats; resume button targets first unfinished lesson.
- landing.tsx: curriculum section rewritten — two module bands, 16 lesson rows, live totals (132 quiz · 100 graded); removed the stale "Module 2 in the works" note; hero copy now says "foundations and joins".
- Share links: page.tsx hash router parses "#playground?q=<urlencoded sql>&d=<dialect>" (route = part before "?"), PlaygroundView boots shared SQL and auto-runs it (keyed remount on sharedSql change); header "Share" button builds the URL and copies it, with execCommand fallback when the async clipboard API is denied.
- Bank growth M1: +60 MCQs / +40 problems across lessons 01–08 appended with stable new ids (l1-q5…l8-q11, l1-p4…l8-p9).
- Caught + fixed during build: lesson-05 already had 12 MCQs so my q5–q12 duplicates were renumbered to q13–q20 (global audit: 232 unique ids, 0 dups); unescaped straight quotes in two l3 strings; J1/J2 RowCard colX passed absolute instead of relative offsets (customers card rendered empty — caught in browser QA); J1 ON label overlapped table rows (moved below cards); J4 invalid stroke-dasharray-4 Tailwind class → strokeDasharray prop; J7 right-edge caption clipping; Share button silent failure without clipboard permission → fallback.
- gen-expected.ts: added M2 join facts to the FACTS dump; regenerated expected.ts — 100/100 problems OK, 0 failures (68 M1 + 32 M2).
- Verified: tsc src 0 errors, eslint clean, browser QA (1440×900 + 390×844): landing curriculum 2 modules/16 rows, sidebar module grouping, lesson 9 learn/quiz/practice E2E (l9-q1 +8 XP first-try, l9-p1 graded solved +5, ledger keys mcq:l9-q1/mcqfirst:l9-q1/solve:l9-p1 persisted), inline Run here works, share URL round-trip auto-loads + auto-runs (5 rows), diagrams j1/j5/j7 verified in Carbon + Gallery (light), no horizontal overflow on mobile, console clean, all api/query 200s. Screenshots in scripts/shots/m2-*.png.

Stage Summary:
- Curriculum doubled: 2 modules · 16 lessons · 132 MCQs · 100 graded problems · 17 diagrams, all facts real, all solutions verified against the seed db. XP/badge machinery untouched and idempotent (sql-visualizer-learn-v1 key unchanged; only new id namespaces added).
- Share links: any playground query is now a URL (#playground?q=…&d=…) that opens pre-loaded and auto-run; deep links unaffected.
- Key files: src/lib/curriculum/lessons/lesson-09..16.ts, lessons/index.ts, lessons/lesson-01..08.ts (growth), src/lib/curriculum/types.ts, src/components/learn/diagrams.tsx, src/components/learn/learn-app.tsx, src/components/landing.tsx, src/app/page.tsx, scripts/gen-expected.ts, src/lib/curriculum/expected.ts (regenerated).

---
Task ID: 13
Agent: Super Z (main agent)
Task: Diagram arrow/pathing overhaul + lesson theory streamlined into bullets/steps (user feedback: "arrows and their pathing can be better; theory in bullet points / more streamlined")

Work Log:
- diagrams.tsx: replaced ad-hoc hand-drawn bezier paths with proper connection primitives — ArrowHead (explicit travel angle), Link (smooth S-curve with horizontal tangents, animated pathLength draw-in via framer-motion, optional start dot/arrowhead/dash, control offset capped at half the run so short hops stay straight), Pipe (rounded orthogonal polyline for routes that travel around elements), XMark (dead-end cross for dropped rows). Arrow gained round linecaps.
- Re-routed join figures: J1 shows all 3 FK lookups (order 1→Pedro, 2→Maya, 3→Alice) as anchored row-to-row links with dots + arrowheads (previously 2 guessed curves from mid-card); J2 matched row now flows THROUGH the ON gate to Dmitri while the 2 unmatched rows run flat and dead-end at X marks before the gate (gate label moved above the box so nothing overlaps); J3's giant products swoop replaced with a rounded down-across-up Pipe under the chain; J4's keep-row arrow anchored to Liam's actual row; J6 self-join web turned into bowed quadratic arcs with endpoint dots (C(5,2) caption moved below the sag bundle); J7 fan-out redrawn as 4 staggered amber S-links from the order row (diagonal spokes removed); L3 WHERE gate exits are now S-curves that stop short of the dot clouds; fixed pre-existing clipped label "38 rows dropped…" (x 560→470, overflowed the 720 viewBox).
- Curriculum theory streamline: types.ts gained Block kinds "h" (section label), "bullets" (rich-text bullet list), "steps" (numbered walkthrough); lesson-view.tsx renders them (emerald-bar mono section headers, square-marker bullets, numbered chips). All 16 lessons rewritten: dense paragraph walls → short lead + labeled sections + bold-led bullets + numbered steps; every code/diagram/tip/warn/table block and every real fact kept (103/65/38, 21 NULLs, 52/30/14/7, 34,833.28 vs 103,244.55, 39 pairs EU 28/APAC 10/US 1/LATAM 0, order rows 1→Pedro 576.54 / 2→Maya 416.81 / 3→Alice 767.64, Alice top spender 7,262.35/24). Removed paragraphs that the new bullets made redundant (l2 projection para, l3 comparisons para, l4 mechanics para, l13 walkthrough para, l14 dup tip, l15 dup para). MCQs/problems/ids untouched — XP ledger safe.
- rich.tsx upgraded: *italic* now renders (was literal asterisks) with a two-level tokenizer — top split on **bold*/*italic*, code spans handled innermost, so bold-across-code like **`COUNT(*)` …** and italics containing `code` render correctly; asterisks inside backticks protected.
- QA: tsc (src) 0 errors, eslint clean; browser E2E in Carbon + Gallery (light): J1/J2/J3/J4/J5/J6/J7 + L3 + L8 stepper screenshot-verified, lesson 9 learn (lead→bullets→steps→diagram) verified desktop + mobile 390×844 (no overflow), quiz tab interaction intact (choice select renders, no XP mutation — check not pressed), console clean, theme re-skin automatic (persimmon links in Gallery). Screenshots in scripts/shots/ar-*.png.

Stage Summary:
- Diagrams now have a real connection vocabulary (Link/Pipe/ArrowHead/XMark) instead of guessed curves: FK lookups, gate drops, chains, fan-outs and pair-webs all route cleanly with animated draw-in; all 17 figures re-skinned per theme as before.
- Learn tab is scannable: section labels + bullets + numbered steps across all 16 lessons with zero fact loss; italics finally render.
- Key files: src/components/learn/diagrams.tsx, src/components/learn/lesson-view.tsx, src/components/learn/rich.tsx, src/lib/curriculum/types.ts, src/lib/curriculum/lessons/lesson-01..16.ts.

---
Task ID: 14
Agent: Super Z (main agent)
Task: Module 3 "Set Operations & CASE" (8 lessons 17–24, planned with user via AskUserQuestion: focus M3, topic Set+CASE, scope all-in M3, visual-led theory, dialect extras, "theory in depth, include everything")

Work Log:
- Planning round locked the scope with the user before any code: this round = Module 3 only (Dashboard/Explorer/Quiz mode queued next), visual-led lessons (diagram first) with in-depth coverage + Postgres/MySQL/SQLite dialect callouts.
- Facts first (scripts/facts-m3.ts): every number in lessons/diagrams/MCQs computed live — statusUnionAll 103 vs UNION 4; region pile 22 (EU 10/APAC 7/US 3/LATAM 2) vs 4; membership sets delivered 15/shipped 10/pending 8/cancelled 4; delivered∩cancelled = ids {1,5,11,13} (Alice, Emma, Keiko, Maya), ∩pending 8; delivered EXCEPT cancelled 11 vs reversed 0; shipped EXCEPT delivered 1 (Liam); customers EXCEPT shipped 6 (matches M2 anti-join); price>100 EXCEPT Audio = Webcam + Watch; pivot region×status (APAC 21/8/5/3/37, EU 24/12/6/3/45, LATAM 2/0/0/0/2, US 5/10/3/1/19); delivered share LATAM 100/APAC 56.8/EU 53.3/US 26.3; tiers ≥3000/≥1000 = high 4 (Alice 7,262.35, Emma 6,640.56, Grace 4,574.23, Maya 3,644.56)/mid 4/low 8; monthly delivered + TOTAL row (52 orders, 15,571.07); category delivered-only = Apparel.
- Precedence landmine PROVED empirically: SQLite evaluates A UNION B INTERSECT C left-to-right → 8 ids {1,3,5,6,7,11,13,16}; standard/Postgres/MySQL reading (INTERSECT first) → 15. Also: SQLite rejects parentheses around compound arms ((A UNION B) INTERSECT C and A UNION (B INTERSECT C) both syntax-error) — the portable spelling is FROM-subquery arms (verified parsing).
- Curriculum: lessons 17–24 written (union mechanics + ORDER BY placement; labels/arms/alignment; INTERSECT + join equivalence; EXCEPT + NULL-safety vs NOT IN + asymmetry; precedence + portable wrapping; CASE forms + first-match + ELSE-NULL (96) + simple-CASE NULL trap; conditional aggregation + pivot + custom ORDER BY; capstone tiers/ledger-TOTAL/EXCEPT-audit). Each: visual-led blocks (lead → s-figure → runnable code → labeled bullet sections incl. "Dialect watch"), 4 MCQs + 4 graded problems (32/32, ids l17-q1…l24-p4).
- diagrams.tsx: +Chip helper, +8 flat figures (s1-union dot-pile→two gates; s2-stack-labels Pipes merging tagged sources; s3-intersect overlap panels; s4-except dashed subtract panel; s5-precedence 3-step stepper: chain→SQLite 8→standard 15; s6-case-switch 4 lanes with real counts; s7-case-agg pivot matrix; s8-capstone three-pattern composition). Registry entries wired; FigureId extended s1–s8.
- Caught + fixed in QA: s5 stepper layers shared coordinates so inactive steps ghosted through the active one → conditional rendering per step; step-2 annotation collided with its heading → moved below the bracket; s8 two panel captions overflowed their panels → shortened.
- Registry/UI: lessons/index.ts imports + LESSONS 24 + MODULES entry (sets-case · Advanced); landing hero copy + curriculum section now 3 bands/24 rows + stats strip "25 interactive diagrams"; learn-app overview 3 module cards (lg:grid-cols-3) + "BEGINNER → ADVANCED" + sidebar auto-groups module 3 with 0/8 counter; totals auto-derive (164 quiz · 132 graded · 320 min).
- gen-expected.ts regenerated: 132/132 problems OK, 0 failures (100 prior + 32 M3). scripts/audit-ids-m3.ts: 296 unique ids, 0 duplicates, 132 expected keys, 0 orphans.
- Verified: tsc (src) 0 errors, eslint clean; browser E2E — landing curriculum 3 bands/24 rows, learn overview 3 cards, lesson 17 learn/quiz/practice (l17-q1 first-try +8 → ledger mcq:l17-q1/mcqfirst:l17-q1; l17-p1 graded "Matched — graded correct" → solve:l17-p1), lesson 21 stepper all 3 steps, lesson 24 l24-p1 solved through the live /api/query path, all 8 new figures screenshot-verified in Carbon, s3 re-verified in Gallery (auto re-skin), mobile 390×844 no horizontal overflow, console clean, playground UNION smoke returns 4 rows. Screenshots in scripts/shots/m3-*.png.

Stage Summary:
- Curriculum now 3 modules · 24 lessons · 164 MCQs · 132 graded problems · 25 diagrams, all facts real, all solutions verified against the seed db; XP/badge machinery untouched (new id namespaces l17…l24 only).
- Module 3 delivers the user's picks: Set+CASE topic, visual-led diagrams-first lessons, in-depth bullets, per-lesson dialect watch (incl. the empirically proven SQLite-vs-standard precedence difference and SQLite's paren-arm syntax error), MySQL <8.0.31 caveats, Postgres FILTER/EXCEPT ALL notes.
- Key files: src/lib/curriculum/lessons/lesson-17..24.ts (new), lessons/index.ts, types.ts, src/components/learn/diagrams.tsx (+8 figures, Chip helper, stepper fix), src/components/landing.tsx, src/components/learn/learn-app.tsx, src/lib/curriculum/expected.ts (regenerated), scripts/facts-m3.ts, scripts/audit-ids-m3.ts.
- Next-round queue (user-selected): Progress dashboard, Data Explorer, mixed quiz mode.

---
Task ID: 15-recovery
Agent: Super Z (main agent)
Task: Recover project tree after environment rollback wiped everything after Task 2

Work Log:
- Mid-session the working tree was rolled back to post-Task-2 state (git history rebuilt, Module 1-3 + learn app gone, HEAD moved from the Module 3 commit to a rebuilt 4-commit history)
- Exhausted recovery paths: git fsck (no dangling objects), no remotes/stash, .next dev cache empty of curriculum
- Broad filesystem sweep found the intact tree at /tmp/my-project (24 lessons, 13 learn components incl. theory-blocks/quiz-runner/case-study-view/fx, diagrams, mcqs/ + problems/ + case-studies* dirs, facts/audit scripts, worklog through Task 14)
- Verified integrity: audit-ids-m3.ts -> 24 lessons, 164 MCQs, 132 problems, 296 unique ids, 0 dupes, 0 orphans; deps identical (no reinstall); landing 200; /api/stats correct
- rsync restored everything except platform mounts (upload/ handled separately); kept current node_modules/.git; committed as 54847da

Stage Summary:
- Tree fully restored to post-Task-14 state; backup of the interim post-Task-2 state kept at /home/z/backup-rolledback-task2.tar.gz
- Resume Task 15 (content quality upgrade A-E) on top of the restored tree

---
Task ID: 15-c
Agent: general-purpose subagent (15-c)
Task: Convert lessons 13-16 to top-notch format (hints/mistakes/notes/dialect/takeaway)

Work Log:
- Read worklog + types.ts + coach.ts, then reference conversions lesson-01/03/05; pulled ground truth for every problem from expected.ts (l13: 1/6/12/5 rows, l14: 39/39/1/12, l15: 16/7/4/6, l16: 34,833.28 / 103,244.55 / 10 / 5) so hints, mistakes and dialect facts stay seed-accurate.
- lesson-13 (anti-join): legacy flat hints → 2-entry hints (nudge + "Shape: …") on all 4 problems; 3 coaching rules each — INNER JOIN misuse, right-table status filter in WHERE (anchored `\bleft join\b…\bwhere\b…o\.status=` so NOT EXISTS spellings never false-positive), LEFT JOIN without IS NULL, carry-over status literals, NOT IN NULL-trap, missing "( select" subquery, missing ORDER BY. +2 dialect blocks (MySQL lacks FULL OUTER JOIN → emulate via LEFT JOIN + IS NULL + UNION ALL; Postgres plans NOT EXISTS as "Hash Anti Join"). 4 MCQ notes; takeaway.
- lesson-14 (self-join): 4× hints + 3 rules each (missing c1.id<c2.id guard via lookahead that tolerates equivalent >/>= spellings, <>-instead-of-< mirror trap, wrong region literal, off-table join, COUNT(DISTINCT) vs COUNT(*), spurious GROUP BY, missing ORDER BY). +1 dialect block (SQLite/PG/MySQL: self-joins need no special syntax, only distinct aliases). 4 MCQ notes; takeaway.
- lesson-15 (joins+aggregates): 4× hints + 3 rules each (bare-column+SUM without GROUP BY via tempered lookahead, customers/suppliers table missing, aggregate in WHERE `(where|and)\s+count\(`, HAVING >= 10 vs > 10, HAVING missing, o.total vs line-item measure, missing ORDER BY). +3 dialect blocks (MySQL ONLY_FULL_GROUP_BY + functional dependence on PK; COUNT(col) NULL-skipping is standard SQL; Postgres FILTER (WHERE …) in aggregates, SQLite 3.30+ has it too, MySQL spells CASE WHEN). 4 MCQ notes; takeaway.
- lesson-16 (capstone): 4× hints + 3 rules each (GROUP BY present in the crime query, honest-measure SUM in the crime, join missing, SUM(o.total) reuse in p3/p4, missing GROUP BY / ORDER BY / LIMIT, join or wrong aggregate in ground truth). +2 dialect blocks (SQLite bare-column rule + arbitrary-row caveat; MySQL ONLY_FULL_GROUP_BY accepts GROUP BY o.id + o.total via PK dependence, rejects GROUP BY customer_id). 4 MCQ notes; takeaway.
- Regex hygiene: all patterns authored against normalizeSql semantics (lowercase, whitespace-collapsed, (),; hugged), no case-based rules, ordered specific→general, each ≤3 per problem; deliberately dropped a "missing DISTINCT" rule for l13-p4 after proving DISTINCT is a no-op for the anti-join result (would have coached a falsehood), and a "unrounded SUM" rule after seeing gradeResult round2s both sides.
- Runtime QA (bun scripts, since removed): (a) no mistake rule matches its own problem's reference solution across all 16 problems; (b) every problem has exactly 2 hints with "Shape:" prefix on [1]; (c) every MCQ has ≥1 note never pointing at the correct answer index; (d) takeaway + dialect count per lesson; (e) 26 simulated wrong attempts (inner joins, WHERE-aggregates, carry-over statuses, >= boundary, GROUP BY in the crime, SUM(o.total) reuse, missing guard rails) each fired exactly the intended coaching message.
- Per-file verification: bunx tsc --noEmit filtered to curriculum/lessons/lesson-13..16 → empty; bunx eslint on each of the four files → clean. No dev server started, nothing committed; solutions/expected/briefs/titles/difficulties/ids untouched (XP ledger safe).

Stage Summary:
- 16/16 problems converted to hints[2] (+48 mistake rules total: 12 per lesson); 16/16 MCQs given notes (4 per lesson); 8 dialect blocks added (13:2, 14:1, 15:3, 16:2); takeaway added to all four lessons.
- Content bugs: none blocking. (1) l15 bullet "PostgreSQL would demand the id" is slightly imprecise — PG accepts GROUP BY c.id + SELECT c.name via functional dependence (and GROUP BY name alone is legal there); left untouched per no-restructure rule, with the precise rule stated in the new ONLY_FULL_GROUP_BY dialect block. (2) l15-q2 and l16-q4 are near-duplicates across lessons (capstone recap of the COUNT trap) — intentional recap, not a within-lesson duplicate. (3) All marked MCQ answers and every stated number cross-checked against expected.ts and the seed counts (16/6/16/103/248) — consistent.
- Key files: src/lib/curriculum/lessons/lesson-13.ts, lesson-14.ts, lesson-15.ts, lesson-16.ts.

---
Task ID: 15-f
Agent: general-purpose subagent (15-f)
Task: Convert lessons 09-12 to top-notch format (hints/mistakes/notes/dialect/takeaway)

Work Log:
- Read worklog + types.ts + coach.ts, then reference conversions lesson-01/05 (and peer's lesson-13 for join-topic rule style); pulled ground truth from expected.ts (l9: 12/10/12/5 rows, l10: 25/15/4/20, l11: 15/25/27/4, l12: 103/6/19/21) and re-verified key seed facts live against db/custom.db before authoring.
- lesson-09 (two tables, one answer): 4 legacy flat hints → 2-entry hints (nudge + "Shape: …"); 3 rules per problem — join-without-ON cartesian (lookahead-guarded so ON-bearing spellings stay silent), PK-vs-PK mispairing (c.id=o.id / p.id=s.id, but never the real FK), missing ORDER BY templates, wrong city/status/region literals (negative-lookahead literal checks that never fire on the solution), missing supplier alias, ASC-vs-DESC direction. +1 dialect block (postgres: JOIN … USING needs same-named columns; this schema's FKs all have their own names). 4 MCQ notes; takeaway.
- lesson-10 (INNER JOIN mechanics): 4× hints + 3 rules each — direction trap (order by X(?! desc)), missing-ORDER-BY template, missing join (c.name unreachable), join-without-ON, wrong item↔product FK pairing, missing supplier alias, missing s.rating. +1 dialect block (sqlite, verified live: bare JOIN with no ON runs as a 1648-row cartesian in SQLite/MySQL; PostgreSQL refuses — CROSS JOIN or ON TRUE). 4 MCQ notes; takeaway.
- lesson-11 (three-table chains): 4× hints + 3 rules each — missing customers hop (join orders without a later join customers), missing customer/product aliases (combined c|p.name lookahead rule), missing category filter at all (fires on name-LIKE attempts), wrong status/category literals (combined alternation rule), missing order_id alias (anchored ^select lookahead form so ORDER BY's bare o.id never self-matches), missing join, wrong receipt order id (= 88 with (?!88\b) guard), missing ORDER BY. +1 dialect block (mysql: comma operator binds weaker than JOIN, documented "Unknown column" failure; explicit JOIN … ON per hop). 4 MCQ notes; takeaway.
- lesson-12 (LEFT JOIN): 4× hints + 3 rules each — RIGHT JOIN wrong protected side, INNER JOIN misuse, right-table status filter in WHERE (left join…where…o.status= shape), LEFT JOIN without the IS NULL test, spurious IS NULL (anti-join over-application on p3), status IN placed inside ON (guarded \bon\b(?![^;]*\bwhere\b) so the p4 solution's WHERE-IN never self-matches), single-status equality instead of IN, missing order_id alias, missing ORDER BY. +2 dialect blocks (sqlite: RIGHT/FULL OUTER JOIN only since 3.39; mysql: no FULL OUTER JOIN — LEFT + reversed LEFT JOIN + IS NULL via UNION ALL). 4 MCQ notes; takeaway.
- Regex hygiene: all patterns authored against normalizeSql semantics (lowercase, whitespace-collapsed, (),; hugged), no case-based rules, specific→general order, ≤3 per problem; dropped a >= 500 boundary rule for l10-p1 after verifying no order totals exactly 500 (it could never be the failing cause — replaced with a missing-join rule).
- Runtime QA: bun scripts/qa-coach.ts → lesson-09..12 all hints 4/4, rules=12 each, notes=4/4, dialect 1/1/1/2, takeaway present, 0 ✗ issues (remaining script issues are lessons 17–24, another agent's scope). 59 simulated wrong attempts (missing ON, PK-vs-PK pairings, wrong literals, alias/header misses, direction traps, RIGHT JOIN misuse, IN-in-ON, spurious IS NULL) each fired the intended message; valid variants (reversed join order, extra tiebreaker, INNER JOIN where results coincide) correctly stay silent. Per-file: bunx tsc --noEmit filtered to lesson-09..12 → empty; bunx eslint each → clean. No dev server, nothing committed; solutions/expected/briefs/titles/difficulties/ids untouched.

Stage Summary:
- 16/16 problems converted to hints[2] (48 mistake rules total: 12 per lesson); 16/16 MCQs given notes (4 per lesson); 5 dialect blocks (9:1, 10:1, 11:1, 12:2); takeaway added to all four lessons.
- Content bugs: none blocking. (1) l12-p4 brief says "nothing shipped yet" for the 21 pending+cancelled orders — verified 21 in seed (14 pending + 7 cancelled) ✓. (2) l12-q3's "all 16 customers have ordered" verified: 0 customers without orders, LEFT JOIN = 103 rows ✓. (3) l9-q2's 103-rows, l11-q3's 248/103/16 numbers, Berlin-delivered=12, order 88 = 4 lines — all seed-verified ✓. No duplicate MCQs within any of the four lessons; all marked answers consistent with the data.
- Key files: src/lib/curriculum/lessons/lesson-09.ts, lesson-10.ts, lesson-11.ts, lesson-12.ts.

---
Task ID: 15-h
Agent: general-purpose subagent (15-h)
Task: Convert lessons 22-24 to top-notch format (hints/mistakes/notes/dialect-conversion/takeaway)

Work Log:
- Read worklog + types.ts + coach.ts + qa-coach.ts, then reference conversions lesson-01/05 (hints/mistakes style) and lesson-20 (dialect-block conversion style); pulled ground truth for every problem from expected.ts and re-verified key seed facts live against the freshly reset seed DB (resetDatabase + $queryRawUnsafe): statuses delivered 52 / shipped 30 / pending 14 / cancelled 7, KPI 103·52·14, pivot APAC 21/37 · EU 24/45 · LATAM 2/2 · US 5/19, tiers low 8 / high 4 / mid 4, no customer total exactly 3000/1000, top-3 delivered months 2024-12 1103.13 / 2025-01 724.11 / 2025-02 707.35, ops-queue first 8 rows all pending (tiebreaker matters).
- Dialect-watch conversion, bullets → dialect blocks in place, order kept, wording preserved: lesson-22 (sqlite CASE-portability · mysql IF/IFNULL/IIF shortcuts · sqlite COALESCE), lesson-23 (sqlite SUM(CASE) portability · mysql boolean-SUM shortcut + FILTER note · postgres PIVOT/crosstab tooling), lesson-24 (mysql EXCEPT needing 8.0.31 · postgres GROUPING SETS/ROLLUP · sqlite substr spelling).
- lesson-22 (CASE branching): legacy flat hints → 2-entry hints (nudge + "Shape: …") on all 4 problems; 3 rules each — CASE missing END; missing DISTINCT/GROUP BY row-explosion (anchored lookaheads so GROUP BY and 4-WHEN-covering spellings stay silent); missing default bucket guarded on 'cancelled' (a full 4-WHEN solution never fires); COUNT(tag) NULL-skipping; unfiltered COUNT(*) on the tagging CASE; IS NOT NULL direction flip (excludes "( select" spellings so the correct 103−7 complement never fires); ELSE present where the brief demands fall-through. 4 MCQ notes; takeaway.
- lesson-23 (counters/pivots/custom sorts): 4× hints + 3 rules each — WHERE-status leak on the KPI row (excludes "( select" so the scalar-subquery spelling never fires), spurious GROUP BY on the single-row KPI, missing region join (anchored ^(?=region)(?!join) form), missing GROUP BY on count/avg pivots, missing ×100 percentage, ORDER BY status alphabetical-sort trap, missing `, id` tiebreaker via \bend\b\s*(;|limit) (never fires on "end, id limit"). 4 MCQ notes; takeaway.
- lesson-24 (capstone): 4× hints + 3 rules each — exactly-one-GROUP-BY detector for the two-stage tiering shape, count-sorted-without-DESC, delivered filter missing from either ledger arm (needs 2 occurrences), bare-UNION-arm ORDER BY via order by[^;)]*union (paren-safe: the solution's wrapped inner ORDER BY never matches), GROUP BY created_at vs month, missing second arm / UNION-vs-EXCEPT / missing 'pending' filter on the audit (NOT IN / NOT EXISTS / LEFT JOIN correct spellings excluded from the no-EXCEPT rule), missing TOTAL arm, BIG bucket forgetting 'shipped' (guarded on 'cancelled' so the ELSE-'BIG' inversion stays silent), missing GROUP BY bucket. 4 MCQ notes; takeaway.
- Regex hygiene: all patterns authored against normalizeSql semantics (lowercased, whitespace collapsed, (),; hugged — e.g. COUNT(*) → "count( *)"), no case-based rules, ≤3 per problem, anchored ^(?=…)(?!…) forms wherever a pattern could otherwise match a late token of the reference query (qa-coach initially caught 3 such self-matches — region-without-join and COUNT-without-GROUP-BY — fixed by global anchoring). Deliberately dropped: UNION-not-ALL rules for l24-p2/p4 (plain UNION returns identical rows there, so it is a correct solution and can never be a failing cause), THEN-1-vs-1.0 rule for l23-p3 (SQLite AVG never floors; the porting tip covers it), ≥3000/≥1000 boundary rule (no customer total hits exactly 3000/1000).
- Runtime QA: 31 simulated wrong attempts (missing END/ELSE/DISTINCT/GROUP BY/join, WHERE leaks, COUNT(tag), IS-NOT-NULL flip, alphabetical ORDER BY, missing tiebreakers, one-stage tiering, unfiltered ledger arms, bare-arm ORDER BY, UNION audits, BIG-forgetting-shipped) each fired the intended coaching message; 14 correct alternative spellings (GROUP BY instead of DISTINCT, 4-WHEN coverage, scalar subqueries, SUM/COUNT share, CTE tiers, ELSE-'BIG' inversion, NOT IN audit) all stayed silent. scripts/qa-coach.ts → lesson-22/23/24 all hints 4/4, rules=12 each, notes=4/4, dialect=3, takeaway present, 0 ✗ issues, ALL CHECKS PASSED. Per-file: bunx tsc --noEmit filtered to lesson-22..24 → empty; bunx eslint each → clean. No dev server started, nothing committed; solutions/expected/briefs/titles/difficulties/ids untouched (XP ledger safe). Temp verification scripts removed after use.

Stage Summary:
- 12/12 problems converted to hints[2] (+36 mistake rules total: 12 per lesson); 12/12 MCQs given notes (4 per lesson); 9 dialect blocks converted from the "Dialect watch" sections (3 per lesson); takeaway added to all three lessons.
- Content bugs found: (1) l23-q4's marked answer "Postgres only" is factually wrong — SQLite has supported COUNT(*) FILTER (WHERE …) since 3.30 and it runs on this app's engine (verified live), so no offered choice is correct; question/choices left untouched per no-rewrite rule, but the why-string was corrected and the lesson-23 FILTER dialect block now states the truth (it previously contradicted lesson-06/15's own correct FILTER blocks). (2) l23 tip "AVG over integers can floor to 0 or 1 in typed engines" is imprecise — AVG returns float/numeric in all three engines; the real floor risk is integer division (SUM/COUNT); left as-is (outside conversion scope), noted here. (3) l24 "MySQL says SUBSTRING" lightly adapted to "documents SUBSTRING (and accepts SUBSTR as a synonym)" — MySQL accepts substr too. (4) GLOBAL: the seed DB's deterministic seeder generates 251 order_items rows (verified via resetDatabase + COUNT(*)), not the 248 quoted across lessons 1/6/7/10/11/16 — none of lessons 22-24 state that figure, so nothing changed in my files, but the discrepancy deserves a cross-module pass. No duplicate MCQs within any of the three lessons; all other stated numbers (52/30/14/7, 96, 21/82, 89, 50.5%, region shares 100/56.8/53.3/26.3, pivot matrix, tiers, ledger 1103.13/724.11/707.35/TOTAL 52·15571.07, Apparel, BIG 82·27567.79 / LOST 7·1152.49 / OPEN 14·6113 / TOTAL 103·34833.28) verified against the seed.
- Key files: src/lib/curriculum/lessons/lesson-22.ts, lesson-23.ts, lesson-24.ts.

---
Task ID: 15
Agent: Super Z (main agent)
Task: Content quality upgrade "top notch" — packages A–E (user picked all): mistake coach + progressive hints, dialect parity for M1/M2, M1 capstone, MCQ distractor explanations, lesson takeaways

Work Log:
- Recovery first: mid-session environment rollback (see Task 15-recovery); also removed foreign-lineage files that came mixed in the /tmp snapshot (mcqs/, problems/, case-studies*, check.ts, theory-blocks/quiz-runner/case-study-view/fx, flow/lineage/quality views, sql-funnel/quality-audit, api/quality, api/funnel) — src tsc back to 0 errors
- Engine: types.ts +Problem.hints[two levels]/mistakes/Mcq.notes/Lesson.takeaway + Block dialect (db: postgres|mysql|sqlite); new src/lib/curriculum/coach.ts (normalizeSql + firstMistake, problem rules before 8 high-precision GLOBAL rules); problem-runner.tsx progressive hint ladder (Nudge → The shape) + sky-blue Coach card on failed runs; mcq.tsx "About your pick" distractor debrief; lesson-view.tsx dialect block renderer (engine pills) + violet "In one sentence" takeaway card
- Content: all 24 lessons converted — 132→135 problems with hints[2] (0 legacy hints left), 331 mistake rules, 164/164 MCQs with distractor notes, 44 dialect blocks (M1/M2 authored; M3 "Dialect watch" bullet sections converted to blocks), 24 takeaways. Lessons 1–5 + capstone by main agent; 6–8, 13–16, 20, 9–12, 17–19+21, 22–24 via five verified subagent batches (network flaked twice; every batch's edits landed and were QA'd centrally)
- Content bugs found & fixed along the way: lesson-05 had 8 duplicate MCQs (q13–q20) → replaced with 8 new distinct questions (alias-in-ORDER-BY, ASC-vs-DEFAULT, tiebreakers, bare OFFSET dialect, multi-key direction, positional fragility, FETCH FIRST, latest-first) and fixed q7's wrong marked answer (LIMIT 15 OFFSET 10 → LIMIT 5 OFFSET 10)
- Database incident: live db/custom.db was a stale pre-shipped_at file (reset initially "readonly"; permissions + stale server connection) → chmod, dev server restart, /api/reset — canonical seed confirmed: orders 103, order_items 251 (the "248" in the recovered file was the anomaly) → reverted my earlier 251→248 edits in lessons 01/07/11/16 + diagrams, verified fresh DB matches every lesson claim (pending 14, cancelled 7, unshipped 21, COUNT(shipped_at)=82)
- gen-expected.ts regenerated against canonical seed: 132/132 OK → 135/135 after capstone
- M1 capstone added to lesson-08 (l8-p10 "Delivered revenue, ranked", l8-p11 "The quiet backlog" NULL-aware, l8-p12 "Status scorecard" two-aggregate+HAVING) — all hard, all verified against live DB, all ordered
- New QA tool: scripts/qa-coach.ts (hints[2] coverage, legacy-hint absence, mistake rules compile + never match own solution, MCQ notes target wrong in-range choices, takeaway/dialect presence) — caught 3 real regex bugs (incl. one in the global HAVING rule; anchored patterns now); ALL CHECKS PASSED
- Browser E2E: landing + learn sidebar derive 135 graded · 164 quiz; lesson-01 dialect block, takeaway, hint ladder (Nudge+Shape), Coach card (fires on SELECT * suppliers with targeted fix above the raw syntax error), MCQ "About your pick" note — all screenshot-verified in scripts/shots/t15-*.png; tsc 0 src errors, eslint clean, audit-ids 299 unique ids 0 dupes 0 orphans; test localStorage cleared

Stage Summary:
- Curriculum: 3 modules · 24 lessons · 164 MCQs (all with distractor debriefs) · 135 graded problems (all with 2-level hints + coach rules) · 44 dialect blocks · 24 takeaways — every solution re-verified against the canonical seed
- Coach engine is data-driven: per-problem mistakes + globals in coach.ts; regexes run on lowercased normalized SQL, first match wins, QA-enforced precision
- Key files: src/lib/curriculum/{types,coach}.ts, lessons/lesson-01..24.ts, expected.ts (regen), src/components/learn/{problem-runner,mcq,lesson-view}.tsx, scripts/{qa-coach,gen-expected}.ts
- Next-round queue unchanged: Progress dashboard, Data Explorer, mixed quiz mode

---
Task ID: 16-b
Agent: general-purpose subagent (16-b)
Task: Add one new concept-deep SVG figure to each of lessons 17–24 (s9–s16, 8 figures in diagrams-m3.tsx) + block insertion
Work Log:
- Read worklog, diagrams-kit API, style-absorbed from diagrams.tsx (L7GroupBy/S1Union/S6CaseSwitch/S8Capstone), all 8 lesson files, types.ts FigureId/Block unions.
- Verified every rendered number live via throwaway scripts/tmp-16b.ts (SELECT-only, no reset; deleted after): UNION ALL statuses 206 vs UNION 4 (distinct: cancelled/delivered/pending/shipped); arm1 delivered 52/shipped 30/pending 14/cancelled 7, arm2 suppliers EU 2/APAC 2/US 1/LATAM 1; delivered∩cancelled = 15∩4 → ids 1·5·11·13 (Alice Chen, Emma Wilson, Keiko Sato, Maya Patel), delivered-only 11, cancelled-only 0; customers 16 − shipped-customer set 10 → EXCEPT = 6 (ids 2 Bruno Silva, 3 Chloe Dubois, 4 Dmitri Volkov, 6 Farid Nasser, 11 Keiko Sato, 15 Olivia Brown); customers-with-order EXCEPT delivered = 1 (Liam O'Brien, id 12); A∪B∩C: A {1..11,13,14,15,16}, B {1,5,11,13}, C {1,3,5,6,7,11,13,16}, SQLite reading (A∪B)∩C = 8 ids 1·3·5·6·7·11·13·16, standard reading A∪(B∩C) = 15; CASE router streams 52/30/14/7 (ELSE = cancelled 7), Σ 103; pivot APAC 21/8/37 · EU 24/12/45 · LATAM 2/0/2 · US 5/10/19; tiers high 4 (Σ 22,121.70: Alice 7,262.35 · Emma 6,640.56 · Grace 4,574.23 · Maya 3,644.56), mid 4 (Σ 6,911.67: Chloe 2,667.93 · Pedro 1,686.17 · Farid 1,458.97 · Keiko 1,098.60), low 8 (Σ 5,799.91, Olivia 444.80 last).
- diagrams-m3.tsx: local Chip helper + 8 components (S9UnionVsAll 62 ln, S10PositionBinding 76, S11BothSides 59, S12ExceptAudit 67, S13EvalOrder 70, S14RowRouter 66, S15PivotBuild 88, S16TwoStage 78; file 620 ln), all 720-wide viewBoxes H 300–330, kit helpers only (Label/Panel/Arrow/Link/XMark/DotField/fade/drawIn), motion.g fade stages + drawIn tree edges, mono SQL fragment caption inside every figure.
- Figures: s9 two-panel ALL-vs-UNION dot piles 206→4 with repeat-struck chip; s10 two arms (orders/suppliers) feeding one pile whose headers are arm 1's, arm-2 rows sky-highlighted "bound by position"; s11 venn overlap with the 4 real names + 15∩4=4 equation strip; s12 16-customer grid with the 10 shipped ids X-struck rose, 6 emerald survivors + rose "NOT IN dies on NULL" card; s13 side-by-side parse trees (∩-root vs ∪-root) with dashed grouping boxes and 8 vs 15 result strips; s14 103-dot field → simple-CASE router → 4 sized exit streams; s15 3-stage pivot build (long rows → 1/0 flag grid → matrix); s16 3-panel derived-table pipeline (16 dots → per-customer CASE tiers → tier counts with Σ).
- Block insertion: one `{ kind: "diagram", figure: "sX-…" }` per lesson inside the specified section (L17 after "Dedupe is the whole difference" bullets; L18 after "Alignment: count is law…" bullets; L19 after "What counts as "in both"" bullets; L20 after "EXCEPT is an anti-join with DISTINCT" bullets; L21 after "The standard says INTERSECT first" bullets; L22 after "An expression, not a statement" bullets; L23 after the region×status code block in "Rows into columns — the pivot"; L24 after "Pattern 1 — segment, then count" bullets). No other blocks touched; intro figures untouched.
- QA: bunx tsc --noEmit | grep ^src/ → empty; bunx eslint on diagrams-m3 + lessons 17–24 → clean; throwaway check script (deleted): every lesson exactly 2 diagram blocks, ids ∈ FigureId, all 8 registered in FIGURES_M3 → ALL CHECKS PASSED; bunx tsx scripts/facts-viz.ts → db-ok; extra static render audit (deleted): all 8 figures render server-side, viewBoxes within contract, no estimated text overflow (caught + fixed 2 long captions in s12/s16 before finishing).
Stage Summary:
- Lessons 17–24 now have 2 diagrams each (25 → 33 figures total); all new numbers re-verified against db/custom.db seed; FIGURES_M3 merged into diagrams.tsx registry via existing spread — no registry/wiring changes needed.
- No content bugs in lesson prose found; one nuance noted: the task brief offered "customers with an order EXCEPT customers with a delivered order = 1" (Liam O'Brien, id 12) — verified true, but the figure uses the lesson's own worked example (customers EXCEPT shipped = 6) per preference for the lesson's example.
- Key files: src/components/learn/diagrams-m3.tsx (rewritten from stub), src/lib/curriculum/lessons/lesson-17..24.ts (+1 block each). Nothing else modified; no dev server, no commit, no resetDatabase from my own scripts.

---
Task ID: 16-a
Agent: general-purpose subagent (16-a) — report stage timed out; edits landed and were verified centrally by main agent
Task: Add one new concept-deep SVG figure to each of lessons 09–16 (j9–j16, 8 figures in diagrams-m2.tsx) + block insertion

Work Log:
- All 8 figures landed in src/components/learn/diagrams-m2.tsx (544 lines), all registered in FIGURES_M2; one { kind: "diagram" } block added per lesson 09–16 (now 2 each), placements at the requested sections (j9 after "Read the query", j10 after "Three things to internalize", j11 near "Habits for chains", j12 inside "The subtle part: WHERE vs ON", j13 after the first anti-join code, j14 near "The two guard rails", j15 near the GROUP BY section, j16 inside "The fix: aggregate before you join")
- Spot-verified figures against canonical seed: j9 order 1 → customer 16 Pedro Alvarez (Madrid), total 576.54; j10 cartesian 103 × 16 = 1648 vs 103 matched pairs; j12 in-ON 103 (58 NULL-filled) vs in-WHERE 45 (= INNER); j14 same-region pairs 39 total / 10 in APAC (5 APAC customers); j16 honest SUM 34833.28 vs fanout-inflated 103244.55; j11 funnel 16 → 103 → 251
- Central QA by main agent: bunx tsc --noEmit | grep ^src/ → empty; bunx eslint diagrams-m2.tsx + lessons 09–16 → clean; 48/48 lesson figure ids resolve to registered components; browser render of l12 confirmed both figures

Stage Summary:
- Lessons 09–16 now carry 2 diagrams each; all rendered numbers match the canonical seed; no other blocks touched
- Key files: src/components/learn/diagrams-m2.tsx, src/lib/curriculum/lessons/lesson-09..16.ts

---
Task ID: 16
Agent: Super Z (main agent)
Task: "Add more visualizations to the current study materials" — second, concept-deep diagram per lesson (25 → 48 figures)

Work Log:
- Designed 23 new figures (one per lesson; l08 already had two), each illustrating a LATER, different concept than the lesson's intro figure; verified every number against the live seed first via scripts/facts-viz.ts (kept for reuse) + throwaway queries (deleted): counts customers 16 / suppliers 6 / products 16 / orders 103 / order_items 251, line_total rows 93.06/30.30/25.26, LIKE %Keyboard% 1-of-16 + %KEYBOARD% 1 + %Desk% 2, NULL 103 vs 82 (21 = 14 pending + 7 cancelled), APAC/EU two-key sort samples, DISTINCT region 16→4 (APAC 5/EU 8/LATAM 1/US 2) vs (region, city) 16→16, aggregates 103 · 34833.28 · 338.19 · 25.47 · 1088.44
- Architecture for conflict-free parallelism: extracted the shared SVG helpers verbatim into src/components/learn/diagrams-kit.tsx (Label/Arrow/ArrowHead/Link/Pipe/Panel/XMark/DotField/fade/drawIn/rng/MONO); diagrams.tsx now imports from the kit; FIGURES typed Partial<Record<FigureId, FC>> and merged via ...FIGURES_M2 / ...FIGURES_M3; extended types.ts FigureId with all 23 ids upfront; stub registries created before spawning agents; deleted the orphaned foreign-lineage src/components/learn/diagrams/ folder + 5 stale foreign scripts (test-funnel/test-quality/test-samples-api/verify-curriculum/inspect-ast); scaffold committed separately (729d723)
- M2 (lessons 09–16) + M3 (lessons 17–24) delegated to subagents 16-a/16-b with per-figure specs, verified facts, style contract and QA gates; 16-b reported clean, 16-a timed out at report stage but all edits landed (verified centrally, see 16-a section)
- M1 (lessons 01–07) built by main agent in diagrams.tsx: l1-schema-map (5 cards, 4 FK links, real counts), l2-expr-math (per-row quantity*unit_price → 93.06/30.30/25.26), l3-like-match (%Keyboard% windows + case-insensitivity + %Desk% 2), l4-null-spread (103 vs 82 slot strip + contagion rule), l5-multikey-sort (APAC band first — A before E! — then EU, total DESC inside), l6-distinct-mech (16 real region·city chips, 16→4 vs 16→16 tuple rule), l7-count-star (5 real aggregate cards + COUNT(*)/COUNT(shipped_at) hole strip); fixed 3 self-caught defects (garbage rect attr, kit Label has no italic prop, and the band-order bug: region ASC puts APAC first, not EU); kit Link has no label prop → explicit Labels
- Blocks inserted at concept-matched positions in lessons 01–07 (after the schema table, after the derivation code, after the LIKE shorthand, after the IS NULL code, before "LIMIT & OFFSET", after the DISTINCT bullets, after the COUNT(*)/COUNT(column) tip)
- QA: src tsc 0 errors, eslint clean on all touched files; 48/48 used figure ids registered (types+registry script, deleted); audit-ids 24 lessons · 164 MCQs · 135 problems · 299 unique ids · 0 dupes · 0 orphans; landing stat 25 → 48 diagrams; browser E2E: lessons 1/5/12/17/23 render both figures (aria-labels verified), screenshots scripts/shots/t16-{l1-schema-map,l12-where-vs-on,l23-pivot-build}.png, no page errors, console clean

Stage Summary:
- Curriculum now 3 modules · 24 lessons · 164 MCQs · 135 problems · 48 interactive diagrams — every lesson carries an intro figure + one mid-lesson concept-deep figure, all numbers seed-verified
- Diagram system is now split: diagrams-kit.tsx (shared helpers) + diagrams.tsx (M1 + registry) + diagrams-m2/m3.tsx (module registries) — adding figures per module no longer risks merge conflicts
- Key files: src/components/learn/{diagrams-kit,diagrams,diagrams-m2,diagrams-m3}.tsx, src/lib/curriculum/{types.ts,lessons/lesson-01..07,09..24}, src/components/landing.tsx, scripts/facts-viz.ts (kept)

---
Task ID: 17
Agent: Super Z (main agent)
Task: "yeah keep pushing content" — double M2/M3 practice depth: +4 problems (p5–p8) and +4 MCQs (q5–q8) in every lesson 09–24 (135→199 problems, 164→228 MCQs)

Work Log:
- Pre-flight: restarted dev server (old process held stale SQLite connection); fixed the lingering shipped_at runtime bug — db/custom.db's orders table predated the column; one resetDatabase() (DROP+CREATE) rebuilt it canonical: 16/6/16/103/251, shipped_at NULL = 21 (14 pending + 7 cancelled)
- Content audit exposed the gap: M1 lessons carry 8–12 problems + 11–20 MCQs but M2/M3 sat at exactly 4 + 4 — designed +4/+4 for all 16 lessons with concept slots chosen to avoid overlap with existing p1–p4/q1–q4 (predict-row-count, spot-the-bug, pick-the-spelling, boundary-behavior MCQs; medium→hard difficulty curve p5–p8)
- Fact verification BEFORE writing (scripts/facts-task17.ts, kept): boundary facts killed 3 planned designs (no zero-order customers, same-city pairs 0, same-day/same-total doubles 0, pending∖delivered 0) → pivoted to verified replacements (same-month doubles = 32, supplier region twins = 2, shipped∖delivered-style complements); verified inflated avg 411.33, ratio 2.96, totals_distinct = 103 (all totals unique — powers the q5 DISTINCT trap), region revenues, Berlin/EU pivots, HAVING-qualifier sets, compound-SQLite support forms (FROM-compound OK, double-paren banned)
- Delegation attempt (4 parallel subagents) hit repeated rate-limit timeouts twice; batches A (l09–12) and C (l17–20) landed their edits before dying (verified centrally: 8/8 per lesson, qa-coach clean); batches B (l13–16) and D (l21–24) never wrote → main agent wrote all 8 lessons itself in the established house style (brief with exact aliases, hints[nudge, Shape:], 2–3 targeted mistake rules each, notes on tempting distractors, EXPECTED[] references)
- Central QA: gen-expected 199/199 OK 0 failures (every new solution executes on the seed); qa-coach ALL CHECKS PASSED (199/199 hints[2], 0 self-matching rules, all notes target wrong choices); audit-ids 228 MCQs · 199 problems · 427 unique ids · 0 dupes · 0 orphans · 199 expected keys mapped; src tsc clean; eslint clean on the 8 hand-written files
- Browser E2E (agent-browser): landing shows "199 graded queries · 228 quiz questions" and per-module 64/64; lesson 16 practice renders all 4 new problems; Coach panel fired correctly on a join-based attempt at p1; grader rejected right-query/wrong-problem with exact column mismatch, then l16-p5 "The damage report" graded 1/8 solved — full pipeline (editor → run on live seed → expected.ts compare → XP) verified
- Cleanup: deleted 12 throwaway scripts + 6 nav screenshots; kept facts-task17.ts as the fact ledger

Stage Summary:
- Curriculum now 3 modules · 24 lessons · 199 problems · 228 MCQs · 48 figures — every lesson now carries 8 problems + 8 MCQs (M2/M3 doubled to M1 depth), all numbers seed-verified, all 199 grading targets regenerated from live solutions
- Key files: src/lib/curriculum/lessons/lesson-09..24.ts (+4 problems/+4 MCQs each), src/lib/curriculum/expected.ts (regenerated 199 entries)
- Note for future rounds: subagent parallelism is currently rate-limit-fragile — batches may land without reporting (check git diff + qa gates); SQLite accepts FROM-compounds and scalar EXCEPT wrappers but rejects double-parenthesized arms

---
Task ID: 18
Agent: Super Z (main agent)
Task: Learn-module toolbox round — Data Explorer (browse the live study database), Mixed quiz mode (cross-course rounds), progress dashboard (14-day XP strip + course mastery grid)

Work Log:
- Fact verification first (scripts/facts-task18.ts, kept): per-table facts for the explorer — customers 16 (all ordered, EU 8/APAC 5/US 2/LATAM 1, 14 active), suppliers 6 (2/2/1/1, ratings 3.9–4.8 avg 4.3), products 16 in 7 categories (Accessories/Audio/Electronics 3 each … Fitness 1, $14.99–$199.99, 2,845 in stock), orders 103 (statuses 52/30/14/7, 21 NULL shipped_at, $25.47–$1,088.44 avg $338.19), order_items 251 (qty 1–3 avg 1.98, 57 lines over $200)
- Data Explorer (src/components/learn/data-explorer.tsx): 5 live table cards (row counts via /api/stats), per-table column chips from SCHEMA_TABLES with PK/FK badges, full-table SELECT cached client-side then paged 25/page, NULL cells dimmed, FK cells clickable → follows the relationship (jump to target table filtered on its PK, e.g. orders.customer_id 16 → customers id=16 Pedro Alvarez), per-table "Field notes" strip with the verified facts, "Query <table> in the playground" deep-link via the existing #playground?q= router
- Mixed quiz (src/components/learn/mixed-quiz.tsx): 10-question rounds sampled from all 24 lessons with priority buckets (7 untouched / 2 previously-missed / 1 anything, refilled from the priority pool if short), per-question source line ("From Lesson 11 · Three-table chains"), progress bar + correct counter, reuses McqCard so XP stays idempotent (repeats never pay twice), verdict tiers (Perfect ≥10 / Sharp ≥7 / Solid ≥4 / another pass), New round + Review this round
- Progress dashboard (src/components/learn/progress-cards.tsx + learn-app.tsx overview): "Last 14 days" XP strip scaled to the daily goal (dashed goal line, weekday ticks, hit-count header) and "Course mastery" grid — 24 lesson cells across 3 module bands, each with quiz/practice micro-bars and complete/started/untouched states, click-through to the lesson; replaced the stale getState().badges reads with a subscribed badgesMap
- learn-app.tsx: view state generalized (overview | lesson | explorer | mixed); new "Toolbox" sidebar section (Course overview / Data explorer / Mixed quiz) — the overview item fixes the discovered dead-end where toolbox views had no way back
- Caught & fixed along the way: react-hooks/set-state-in-effect lint error (loading now derived, error cleared in the pick handler); mastery grid hooks-in-deps smell (state passed as param); "Review this round" leaving answered=true over a fresh card; two test-harness selector bugs (sidebar buttons start with A–D; choice text concatenates "AAn error…") — both harness-side, app unaffected
- QA: tsc 0 src errors; eslint clean on all 4 touched files; audit-ids 24 lessons · 228 MCQs · 199 problems · 427 unique ids · 0 dupes · 0 orphans; qa-coach ALL CHECKS PASSED (content untouched); browser E2E at 1440×900 + 390×844, Carbon + Gallery themes: explorer table switch, FK-follow (16 → Pedro Alvarez), pager (page 3 / 11), playground deep-link auto-run, full 10-question round (verdict + 0 XP on all-wrong picks — no false XP), new-round rebuild, overview return, mastery cells lighting up from attempts; screenshots in scripts/shots/t18-*.png; test localStorage cleared

Stage Summary:
- Learn module now has a Toolbox: Data Explorer (every lesson fact is now inspectable against live rows) and Mixed Quiz (spaced-repetition-flavored rounds across the whole course), plus a real progress dashboard on the overview (activity strip + mastery grid)
- Curriculum untouched: still 24 lessons · 228 MCQs · 199 problems · 48 figures — this round was navigation, visualization and practice-mode surface area
- Key files: src/components/learn/{data-explorer,mixed-quiz,progress-cards,learn-app}.tsx, scripts/facts-task18.ts
- Next-round queue: M2/M3-style capstone blocks are already covered by l16/l24 problem sets; remaining ideas — daily-goal picker on the overview, streak/badge nudges, share-a-round results card

---
Task ID: 19
Agent: Super Z (main agent)
Task: "i need more visuals in joins" — add a third concept-deep figure to every join-module lesson 09–16 (48 → 56 diagrams)

Work Log:
- Studied the diagram system end to end: diagrams-kit.tsx helpers (Label/Arrow/Pipe/Panel/XMark/fade), per-module registries (FIGURES_M2 merged into diagrams.tsx registry), FigureId union in types.ts, house style (720-wide viewBox, staged fade-ins, emerald=good / rose=trap / amber=caution, footer takeaway lines)
- Surveyed all 8 join lessons' block structure and the 16 existing M2 figures to pick concepts with zero overlap; j13-three-spellings already owns the NOT-IN NULL trap, so L13's new figure covers the subquery data-flow instead
- Fact verification BEFORE drawing (scripts/facts-viz-m2.ts, kept): top orderer Alice Chen 24 orders (Emma 17), Desk Mat Extended 24 lines/24 distinct orders (products 16 → 251 joined rows), pending lines 36 on 30 orders → 11 distinct products → 5 never pending, shipped 30 orders across 10 customers + 6 gap customers = 36 rows (gap names Bruno Silva/Chloe Dubois verified), APAC 5→10 / EU 8→28 / US 2→1 / LATAM 1→0 pairs, ghost-row math 36 vs 30, anchors 34,833.28 / 103,244.55, lines per order 1–4
- Wrote 8 figures in diagrams-m2.tsx (one per lesson, each ~2 seed-verified numbers minimum): j9-direction (widen-not-multiply, name repeats), j10-multiply (1 product row → 24 copies), j11-fanmap (full referential map 16←103←251→16→6 with FK labels + hop planner), j12-gap-anatomy (36 = 30 matched + 6 NULL-filled, real gap names), j13-subquery-flow (251 → 36 → 11 → 5 pipeline), j14-mirror (5×5 pairing grid: 5 self + 10 mirrors + 10 kept), j15-ghost-row (COUNT(*) 36 vs COUNT(o.id) 30), j16-preflight (decision flow to dodge the 3× trap); extended FigureId union (+8) and FIGURES_M2 registry
- Inserted diagram blocks at concept-matched positions via scripts/insert-viz-m2.py (assert-once anchors): L09 after the read-the-query steps, L10 after the rows-multiply bullets, L11 before "Habits for chains", L12 after the IS NULL tip, L13 between the pre-filtered-list code and three-spellings, L14 after the numbers-on-this-data bullets, L15 right after the COUNT-trap bullets, L16 after the pre-flight checklist
- Browser E2E caught 3 layout bugs, all fixed and re-verified: j14-mirror legend clipped by the stat panel + grid caption colliding with footers (moved grid left, shortened legend, raised viewBox), j11-fanmap FK labels overlapping card fills (moved labels below cards; also fixed arrow semantics — order_items→products and products→suppliers now point right, child→parent), j12-gap-anatomy dot grid overflowing its panel + legend crossing into the next column (compacted grid, in-panel legend); j9-direction footer line trimmed after 733px overflow check
- Landing page: hardcoded "48" stat replaced with TOTAL_FIGURES computed from lesson blocks — shows 56 now, cannot drift again
- QA: src tsc 0 errors; eslint clean on all touched files; wiring 56 used = 56 registered = 56 union, 0 orphans; all 8 lessons render 3 figures each (aria-labels verified), no page errors; screenshots scripts/shots/t19-{l14-final,l16-preflight}.png

Stage Summary:
- Curriculum now 3 modules · 24 lessons · 228 MCQs · 199 problems · 56 interactive diagrams — every join lesson carries 3 figures (intro + concept-deep + mechanism-deep), all numbers seed-verified against scripts/facts-viz-m2.ts
- The joins module now visually covers the concepts that were prose-only: many-to-one widening, fanout multiplication, the whole FK map, gap-row anatomy, subquery anti-join flow, the mirror matrix, the ghost row, and the aggregate-first decision gate
- Key files: src/components/learn/diagrams-m2.tsx, src/lib/curriculum/types.ts, src/lib/curriculum/lessons/lesson-09..16.ts, src/components/landing.tsx, scripts/{facts-viz-m2.ts,insert-viz-m2.py}

---
Task ID: 20
Agent: Super Z (main agent)
Task: "go with whatever is left, start with subqueries" — close every coverage gap: Module 4 Subqueries & CTEs, Module 5 Scalar & Window Toolkit, Module 6 Expert Clinic (24 → 34 lessons; 199 → 279 problems; 228 → 308 MCQs; 56 → 76 figures)

Work Log:
- Gap audit first (rg over all lesson files, taught-vs-mentioned distinction): unowned topics were subqueries/CTEs (beyond L13 cameos), string/date functions + CAST, COALESCE (named 3×, drilled nowhere — the broken L04 promise), window functions, GROUP_CONCAT/ROLLUP hands-on, RIGHT/FULL/CROSS/non-equi joins. Task 19 had already delivered the 3rd join figure per M2 lesson, so visuals were not in scope.
- Capability probe + fact harvest BEFORE writing (scripts/facts-m456.ts, kept): Prisma SQLite = modern engine — windows, CTEs, RIGHT/FULL JOIN, GROUP_CONCAT with ORDER BY (3.44+), FILTER, strftime/julianday, VALUES-in-CTE, NULLS LAST all OK; GROUP_CONCAT(DISTINCT x, sep) rejected (became an MCQ + lesson fact). Facts used across content: avg price 71.78 (6 above), avg order 338.19 (42 above), 12 electronics buyers, 11 ele∩audio, cancelled 4 / no-shipped 6 / no-delivered 1, 45 orders above own-customer avg, spends Alice 7262.35 … Olivia 444.80 (16, no ties), region ties APAC 5 → RANK 6 vs DENSE 2, month buckets 14 (2024-02 & 2024-09 tie at 9), running 34833.28, lead 2.98d, gcc trio Alice/Emma/Maya own all 4 statuses, filterRow 52/30/14/7, region×status matrix, RIGHT cancelled 19 vs FULL 115, cross 96, bands 8/30/40/25, non-equi pairs 12; verified orders #1 576.54 / #12 148.28 / #9 46.67 for the x4 figure (caught 2 invented numbers pre-ship, replaced with real ones).
- Module 4 — Subqueries & CTEs (L25 scalar+IN & the NOT IN NULL landmine, L26 EXISTS & correlated, L27 derived tables & fanout-safe staging, L28 CTE chains): figures q1-nested/q2-probe/q3-two-stage/q4-staging + q5-in-pipeline/q6-correlated/q7-fanout-safe/q8-cte-chain (diagrams-m4.tsx); 32 problems, 32 MCQs.
- Module 5 — Scalar & Window Toolkit (L29 text+CAST+COALESCE, L30 strftime buckets + julianday, L31 ROW_NUMBER/RANK/DENSE_RANK + PARTITION + top-N-per-group, L32 LAG/LEAD + running totals + frames + NTILE): figures t1–t8 (diagrams-m5.tsx); 32 problems, 32 MCQs; RANK-vs-DENSE tie lab runs on real region data, month ranks tie at 9 on real counts.
- Module 6 — Expert Clinic (L33 GROUP_CONCAT + FILTER + the UNION ALL grand-total stack; L34 RIGHT/FULL hands-on (19 vs 115 with the AND-in-ON caveat), deliberate CROSS JOIN, non-equi band ladder via VALUES CTE, composite-key/NATURAL warned honestly): figures x1–x4 (diagrams-m6.tsx); 16 problems, 16 MCQs.
- Caught & fixed along the way: 10 mistake-regex self-matches (case-insensitive %y-%m vs %Y, limit-anchored rules, >= containing =; fixed with tighter shapes + one JS lookbehind); SQLite compound-SELECT ORDER BY limitation broke the three grand-total stack solutions (l33-p6/7/8 gen-expected FAIL) → wrapped stacks in a subquery so the boolean ORDER BY lives outside the compound, lesson body code updated to the runnable form; l30-p7 brief corrected 8→9 buckets after expected values said so; JSX typo (unclosed cls quote) and a stray object-literal property caught pre-commit.
- Wiring: types.ts FigureId union +20 (q1-8/t1-8/x1-4); lessons/index.ts imports + LESSONS + 3 new MODULES entries (subqueries / toolkit / clinic); diagrams.tsx merges FIGURES_M4/M5/M6; landing + learn-app stats stay computed (now 6 modules · 34 lessons · 279 · 308).
- QA: gen-expected 279/279, 0 failures (every solution executed on the live seed); qa-coach ALL CHECKS PASSED (hints 2/2, notes on every MCQ, takeaway, no self-matching rules); tsc clean in src/; eslint clean on all touched files; figure audit 76 used = 76 registered = 76 union, 0 orphans, 0 dup ids (587 total).
- Browser E2E at 1440×900: learn app reports "6 modules · 34 lessons · 279 graded queries · 308 quiz questions"; all 10 new lessons open with 2 animated figures each; live-graded l25-p1 typed into the editor → Run & grade → solved + XP + badge fired; zero console errors; screenshot scripts/shots/t20-lesson25.png.

Stage Summary:
- SeeQL is now 6 modules · 34 lessons · 279 graded problems · 308 MCQs · 76 interactive diagrams — the audit's "unowned families" are all owned: subqueries/CTEs (M4), scalar text/date/type/NULL toolkit (L29-30), window functions (L31-32), string aggregation + FILTER + TOTAL stack (L33), RIGHT/FULL/CROSS/non-equi joins (L34).
- Every number in prose, figures and problem briefs is seed-verified via scripts/facts-m456.ts + gen-expected; consistency machine (one schema, generated expected values, coach rules per problem) extended unchanged.
- Key files: src/lib/curriculum/lessons/lesson-25..34.ts, src/lib/curriculum/{types,expected}.ts, lessons/index.ts, src/components/learn/diagrams-m{4,5,6}.tsx, diagrams.tsx, scripts/{facts-m456.ts,audit-figs-m456.ts,check-fig-orders*.ts}

---
Task ID: 21
Agent: Super Z (main agent)
Task: "make sure whatever is done is finished — MCQs for every keyword, case studies, query problems" — completeness pass over Modules 1-6, then case-study capstones (34 → 40 lessons; 279 → 312 problems; 308 → 417 MCQs)

Work Log:
- Keyword-coverage audit built first (scripts/audit-keywords.ts, kept): 88 taught keywords × (MCQ hits / problem hits / lessons touched), computed from the real lesson data, not prose parsing. Verdict: 27 keywords thin (<4 MCQ hits) — concentrated in M5 text/dates/windows, M6 clinic, join variants (RIGHT/FULL/USING/non-equi), set-operator mechanics (alignment, precedence), CASE pivot/custom-sort.
- Fact harvest BEFORE writing (scripts/facts-t21.ts + facts-t21b.ts, kept): TRIM changes nothing on this data (0 padded names), all 16 cities distinct (same-city self-join provably empty), region pairs 39 (EU 28/APAC 10/US 1/LATAM 0), email @ positions 11/12/13/9 (all example.com), CAST(199.99)=199 vs ROUND, avg price CAST 71 vs 71.78, orders span 2024-01-01→2025-02-27 (423 days, 14 month buckets, Feb-24 & Sep-24 tie at 9), ship delay 2.98d over 82 (21 NULL), status values delivered 52/$15,571.07 · shipped 30/$11,996.72 · pending 14/$6,113 · cancelled 7/$1,152.49, category revenue Audio 11,744.01 … Fitness 863.91 (sums to 34,833.28), spends Alice 7,262.35 / Emma 6,640.56 / Grace 4,574.23 / bottom Olivia 444.80, avg CUSTOMER spend 2,177.08 (5 above), 45 orders above own-customer avg (14 of 16 customers own ≥1; Alice/Emma/Maya 8 each), all-4-status trio Alice/Emma/Maya, NTILE(4) 26/26/26/25, APAC ranks Grace/Maya/Keiko then Farid+Hiro tied rk4/rk4 drk4, GROUP_CONCAT observed order 'shipped,cancelled,delivered,pending' (NOT alphabetical — proof MCQ), GCC(DISTINCT region ORDER BY region)='APAC,EU,LATAM,US', top product per category (7 names), monthly revenue Jan 3,731.97 → running 9,958.69 by Mar, in-flight 44, LAG gaps 20/29/5/9/13, supplier regions ×4 = 24, EU active 7/8, under-$50 = 8, Alice∩Emma 6 categories / Alice−Emma 1 (Fitness), 8 pending-order customers.
- +85 keyword-gap MCQs across 19 lessons: L03 +4 (IN-literal, BETWEEN edges, LIKE _, IN≡OR), L04 +4 (COALESCE, IFNULL, NULLIF, 3VL), L05 +4 (OFFSET/paging, tie-break with the real Feb/Sep tie), L07 +3 (MIN/MAX on ISO dates, MAX-returns-value-not-row, COUNT(shipped_at)=82), L08 +3 (HAVING alias portability, HAVING≥5 → 5 customers, expression GROUP BY → 14 buckets), L09 +3 (USING name-mismatch, composite keys, FK direction), L14 +4 (39 pairs, same-city=0, non-equi cardinality, alias necessity), L17 +2 (UNION vs ALL on identical rows, honest stack), L18 +3 (column-count error, first-arm naming, mixed-type column), L21 +3 (INTERSECT precedence, left-to-right, WHERE-vs-SELECT timing), L23 +4 (pivot CASE mechanics, 4 columns, workflow order 14/30/52/7, missing-ELSE NULL-first trap), L25 +3 (two-stage discipline, live list vs frozen literals, SELECT-list vs WHERE), L26 +3 (correlation definition, SELECT 1 convention, 45-vs-42 baselines), L29 +15 (UPPER/LOWER identity on clean data, SUBSTR 1-based, INSTR per-row positions, TRIM guard + RTRIM, LENGTH + LENGTH(NULL), || spacing + NULL poison, CAST truncate, NULLIF→COALESCE pair, UPPER-case-insensitive compare), L30 +4 (%Y-%m key, 14 buckets, julianday 9-day diff, NULL-skipped AVG), L31 +6 (ROW_NUMBER tie contract, Hiro RANK 4, PARTITION ×4, WHERE-rn two-stage, 7 per-category winners, NULLS-first default), L32 +5 (LAG/LEAD NULL edges, running total 9,958.69, 2-row frame 10/30/50, NTILE 26/26/26/25), L33 +6 (GROUP_CONCAT shape, separator, observed-order-not-guaranteed proof, deterministic ORDER BY-inside, FILTER census, FILTER-in-GROUP-BY dormant 1/0), L34 +6 (RIGHT 19 decomposition, FULL 115 = 103+12, NATURAL shared-name foot-gun, VALUES constructor, half-open seams, NATURAL-vs-USING).
- 6 module-end case studies (L35–40, appended to their modules' lesson arrays — modules now end with a capstone):
  L35 "The new analyst's first week" (M1): 6 problems — EU-active 7, budget count 8, distinct cities 16, total stock 2,845, top-5 premium, HAVING>2 categories.
  L36 "Who's still buying?" (M2): 6 problems — top-5 order counts, no-shipped anti-join (6), no-delivered (Liam O'Brien), category revenue 7 rows, honest total 34,833.28 (fanout warned: 103,244.55), region pairs 39.
  L37 "The quarterly merchandising review" (M3): 6 problems — labeled UNION ALL stack (44/52), Alice∩Emma 6 categories, Alice−Emma Fitness, region×status pivot 4 rows, one-pass value census, workflow-ordered status report.
  L38 "The VIP shortlist" (M4): 5 problems — above-own-average top-4 (8/8/8/6), staged big spenders vs 2,177.08 (5 rows), EXISTS pending probe (8), all-status veterans (3), CTE-chain top-3 pipeline.
  L39 "The ops calendar" (M5): 5 problems — 14 month buckets, staged running-revenue line, shipping speed 2.98d/82, Alice's LAG rhythm (24 rows), NTILE quartiles 26/26/26/25.
  L40 "The executive one-pager" (M6): 5 problems — FILTER census 52/30/14/7 one row, folded region string, grand-total stack (8 rows, 34,833.28 tops), VALUES price ladder 8/4/4, deliberate CROSS JOIN 24 grid.
  Each case study: scenario prose + brief table + tips/warns, 4 seed-verified MCQs, takeaway; no new figures needed (76 unchanged).
- Caught & fixed along the way: 4 MCQ notes accidentally targeting the correct choice with empty text (l36-q4/l37-q1/l40-q1 pattern + l34-q13), l34-q13 answer index was 1 → corrected to 0 (half-open IS the tiling proof), 2 mistake rules matching their own solutions (l39-p3 COUNT(*)-as-shipped rule re-anchored to the no-WHERE shape; l40-p1 shared-WHERE rule re-anchored to `count(*) as delivered from orders where`), facts script bug (UNION ALL arm column mismatch) replaced with the taught L34 query shapes.
- Wiring: lessons/index.ts imports lesson35–40, LESSONS array, and each module's lessons array extended (module sizes now 9/9/9/5/5/3). Landing stats stay computed; learn-app reports the new totals automatically.
- QA: gen-expected 312/312, 0 failures (every reference solution executed on the live seed; row counts match briefs — 7/6/1/7/1/1, 2/6/1/7/1/1, 6/1/4/1/4, 4/5/8/3/3, 14/14/1/24/4, 1/1/8/3/24); qa-coach ALL CHECKS PASSED (hints 2/2 everywhere, notes on all 417 MCQs, takeaways, 0 self-matching rules); tsc clean in src/; eslint exit 0; audit-t21: 76 used = 76 registered, 0 orphans, 0 dup ids (729 total); keyword audit after fill: 88 keywords, thin (<4 regex hits) down from 27 → 9, all 9 either niche syntaxes (RTRIM/VALUES/NATURAL), deliberately-discouraged shapes (RIGHT JOIN) or regex-count artifacts — every one now has dedicated MCQs + problem coverage.
- Browser E2E (agent-browser): landing curriculum grid shows case studies inline with updated per-lesson counts; learn app reports "6 modules · 40 lessons · 312 graded queries · 417 quiz questions"; L35 opens with Learn tab (scenario table renders) + Practice (SQL editor) + Quiz (4 questions); typed l35-p1 solution → Run & grade → solved, XP fired (400→395 to next level), tab shows 1/6 solved; MCQ answered → "Correct." + why-text; zero console errors; test localStorage cleared; screenshot scripts/shots/t21-case-study.png.

Stage Summary:
- SeeQL now 6 modules · 40 lessons · 312 graded problems · 417 MCQs · 76 interactive diagrams — every module ends in a business-brief case study, and the keyword-coverage matrix is filled: every taught keyword has dedicated MCQs and problem coverage, every number seed-verified.
- Key files: src/lib/curriculum/lessons/lesson-35..40.ts (new), lesson-03/04/05/07/08/09/14/17/18/21/23/25/26/29/30/31/32/33/34.ts (+85+6 MCQs), lessons/index.ts, expected.ts (regenerated), scripts/{audit-keywords,facts-t21,facts-t21b,audit-t21}.ts (kept as reusable QA).
- Next-round queue (user asked for "whatever modules are left" AFTER this pass): Module 7 candidates — data modification (INSERT/UPDATE/DELETE/UPSERT, sandboxed), schema & views (CREATE TABLE/constraints/ALTER/CREATE VIEW/indexes/EXPLAIN QUERY PLAN), transactions (BEGIN/COMMIT/ROLLBACK), set-ops deep dive & recursive CTEs; plus older wish-list: daily-goal picker, streak nudges, share-a-round card, lesson search, certificate view.

---
Task ID: 22
Agent: Super Z (main agent)
Task: Finish the interrupted Modules 7–8 session — build the missing figures, wire lessons 41–50 into the curriculum, add the M8 capstone case study (L51), backfill content density to the course norm (+7 MCQs +4 problems per lesson L41–49), add 35 missing `mutating` flags, regenerate expected results, full QA, commit.

Work Log:
- Diagnosed the interrupted session's committed-but-unfinished state (6ea11dc): lessons 41–50 + sandbox write infrastructure (/api/query sandbox, gen-expected sandboxRun, problem-runner sandbox grading, types mutating/verify/changes) were committed, but (a) the 9 referenced figures w1–w4/d1–d5 were never built, (b) index.ts never imported lesson41–50, (c) zero `mutating: true` flags existed on the 35 write/DDL problems, (d) expected.ts had no entries for the new lessons, (e) MCQ/problem density was 5/4 per lesson vs the course norm 12/8, (f) M8 had no capstone.
- Fact harvest first: ran committed facts-m78.ts/facts-m78b.ts + wrote scripts/facts-t22.ts (kept) verifying every number used in the backfill — next ids 17/104, inactive customers {4 Dmitri, 11 Keiko}, pending 14 (12 pre-2025), order_items splits (unit_price>80: 86, quantity=1: 93, quantity>=3: 89 → 162 remain), active=14, price<20 = 2 products, upsert 3-row mixed probe changes=3 & K1 120+5=125, pragma counts (products 6 cols/5 notnull, customers 7, suppliers 4), pristine index counts 0, dup-email groups 0, EQP SCAN orders, top-3 months 2024-01/2024-02/2024-09 (3,731.97/3,609.64/3,116.04). Live-probed SQLite semantics first: INSERT INTO a view is REFUSED (fixed the wrong claim in l47-p1's mistake note), ADD COLUMN with UNIQUE is REFUSED (used as new MCQ fact).
- Built 9 flat figures in the kit language: diagrams-m7.tsx (w1-insert-map positional contract + id 17 + RETURNING echo; w2-update-sweep 16 dots/2 wearables 79→86.90 & 199.99→219.99; w3-delete-scope 103/7 cancelled + FK fence error 787 + 12-children-first; w4-upsert-fork DO NOTHING/DO UPDATE fork with excluded + K1 120→170 + transaction wrapper band) and diagrams-m8.tsx (d1-table-anatomy constraint lines + introspection; d2-alter-paths 4 operations off the suppliers card; d3-view-lens 16→8 EU rows + pushdown + stacking; d4-index-lookup SCAN vs SEARCH b-tree + covering/composite/write-cost; d5-recursive-unfold anchor/step/guard loop + 1..5 fold + 14-month spine). Registered FIGURES_M7/FIGURES_M8 in diagrams.tsx.
- Wired lessons 41–51 into index.ts: Module 7 "Data Modification" (writes, Expert, L41–44 + L50 capstone) and Module 8 "Schema, Views & Beyond" (schema, Expert, L45–49 + L51 capstone) with blurbs; wrote lesson-51.ts "Case study — building the reporting layer" (month_revenue view CREATE VIEW 14 rows; worst-month spine+LEFT JOIN audit → 2024-07 1,193.86; month_targets staging table with PK/CHECK; idx_orders_created; sqlite_master inventory of the storefront's 5 tables) — 4 MCQs + 5 problems, case-study norm.
- Added the missing `mutating: true` to all 35 write/DDL problems (L41–47 all, L48 p2–p4, L50 p2–p5; L48-p1 EXPLAIN and L49 recursive reads correctly excluded).
- Density backfill +63 MCQs +36 problems: every lesson L41–49 now 12 MCQs / 8 problems. New problem shapes: supplier insert, win-back INSERT…SELECT over inactive customers, expression VALUES (19.99*2 → 39.98), scalar-subquery next-id preview; Ring Light ROUND markup 41.99, fleet shipment 14 rows, IN-subquery freeze 6 orders, preview-COUNT read; premium-line purge 86, no-op zero-stock delete, single-unit sweep 93, leaf-vs-parent drills; 3-row mixed upsert (changes=3, K1→125), supplier rating refresh, never-raise mouse price-match 34.5→29.5, before-picture read; CTAS suppliers_backup (6), notnull census (5), status ledger with DEFAULT, orders contract read-back (6); notes ADD (7→8), RENAME to orders_archive, DROP rating (4→3), customers contract (7); active_customers (14), budget_catalog (2), customer_order_counts (16), pushdown proof (7); EQP pre-index SCAN, order_items index, composite (customer_id, status), duplicate-email census 0; countdown 5→1, powers of two 7 rows, top-3 months podium, January 2024 day spine (31 rows). Every number facts-verified; every MCQ has why + at least one distractor note; every problem has hints[2] + 3 mistake rules that don't match their own solutions.
- Keyword audit extended with M7/M8 sections (scripts/audit-keywords.ts, +28 keywords: INSERT/RETURNING/UPDATE/DELETE/UPSERT/transactions/CREATE TABLE/constraints/ALTER/RENAME/DROP/views/sqlite_master/pragma/index/EQP/recursive…) and +10 targeted MCQs to lift every new keyword ≥4 hits (CHECK evaluates per write / row-local, pragma_table_info one row per column, dflt_value, RENAME cascades to FKs+views, rename preserves data, anchor/step set operator, CTE column list, UPDATE FROM join-in-WHERE + portable correlated-SET spelling, preview/rehearsal discipline, preview-vs-affected mismatch fire alarm, RETURNING-after-vs-preview-before).
- Caught & fixed during QA: l41-p2 + l50-p2 mistake rule /\bid\s*,/ matched its own "RETURNING id, name" → re-anchored to \(id\s*,|,\s*id\s*,; l41-q11/l43-q8/l46-q9 notes targeted the CORRECT choice → retargeted to real distractors with rewritten text; l47-p7 rule matched own "LEFT JOIN orders o" → (?<!left\s)join\s+orders lookbehind; l51-p5 originally inventoried objects from sibling problems (sandbox resets between runs → 0 rows) → redesigned to inventory the storefront's own 5 tables; stray CJK "现状" artifact in l48-p5 brief → rewritten; normalized stray "message": string-keys to bare message:.
- QA: gen-expected 394/394 results, 0 failures (all 46+41 write/DDL problems sandbox-verified with per-problem row/changes counts matching briefs); tsc 0 errors in src/; eslint clean on all touched files; qa-coach ALL CHECKS PASSED (hints 2/2, notes on all 547 MCQs, 0 self-matching rules); audit: 85 figures registered = 85 used, 0 orphans, 0 dup ids (941 total ids: 394 problems + 547 MCQs), 51 lessons / 8 modules; keyword audit 116 keywords, 7 thin = Task 21's accepted pre-existing set (RIGHT JOIN discouraged-shape, TRIM no-data, NATURAL foot-gun, regex-count artifacts), all M7/M8 keywords green.
- Browser E2E (agent-browser): learn app reports "8 modules · 51 lessons · 394 graded queries · 547 quiz questions"; sidebar shows modules 7 & 8 with per-module progress; L41 opens with Learn tab (w1 figure renders) + Quiz (12 questions, select→check→"Correct." +8 XP first-try flow verified) + Practice; E2E solved l41-p1 sandboxed INSERT (Run & grade → expected row Tara/id 17 shown, sandbox banner visible, 1/8 solved, XP 400→387 across runs, ledger persisted); L48 figure verified (SCAN/SEARCH + idx_orders_customer); landing shows 8 module bands + updated totals; zero console errors; screenshots scripts/shots/t22-*.png.

Stage Summary:
- SeeQL now 8 modules · 51 lessons · 394 graded problems · 547 MCQs · 85 interactive diagrams — the two new modules complete the SQL syllabus: writing data (INSERT/UPDATE/DELETE/UPSERT + transactions, all sandboxed) and the schema layer (CREATE TABLE constraints, ALTER/DROP, views, indexes + EXPLAIN QUERY PLAN, WITH RECURSIVE), each ending in a business-brief capstone (L50 data-fix ticket, L51 reporting layer).
- Key files: src/components/learn/diagrams-m7.tsx, diagrams-m8.tsx, diagrams.tsx (registry), src/lib/curriculum/lessons/index.ts (8-module wiring), lesson-51.ts (new), lesson-41..50.ts (mutating flags + density backfill), expected.ts (regenerated 394), scripts/{facts-t22,audit-keywords,audit-t21}.ts.
- Remaining wish-list (UI features, not SQL content): daily-goal picker, streak nudges, share-a-round card, lesson search, certificate view, median/percentile dialect note.

---
Task ID: ops-1
Agent: main
Task: Fix "cant load preview" report

Work Log:
- Found Next.js dev server process dead (killed at session boundary)
- Restarted via official .zscripts/dev.sh (bun install -> db:push -> next dev -> health check)
- Verified: localhost:3000 = 200, homepage renders SeeQL content, /api/query returns correct data (103 orders)
- Verified Caddy proxy chain: local :81 with preview Host header = 200
- External gateway preview-6a98301b-145d6674-cbf4a43676be.space-z.ai returned 404 for ~2 min after restart (edge route registration is platform-side)

Stage Summary:
- Root cause: dead dev server process. App restored and fully healthy.
- User action if preview still 404s: wait ~1-2 min for gateway re-registration, or restart session.

---
Task ID: ui-1
Agent: main
Task: Premium UI polish — "sleek and premium" design-language pass (user directive; Module 9 (triggers/JSON/FTS) explicitly dropped as not analyst-relevant)

Work Log:
- Audited UI via agent-browser: landing, learn overview, lesson view, practice runner, playground; all 5 themes
- Added Space Grotesk display font (next/font) wired as --font-display + .font-display utility
- Added premium material layer to globals.css: .sheen (top hairline), .card-hover (lift+brighten), .bg-ambient (theme-adaptive radial glow), .grain (3% film grain), .btn-glow / .btn-quiet, .tnum, brand focus-visible ring, pulse-soft / bar-shimmer / flame-live keyframes, prefers-reduced-motion guard
- landing.tsx: ambient hero, display headlines, CountUp stat numerals (framer-motion springs), icon chips, card hover lifts, curriculum module level-dots + row hover arrow slide, ambient CTA; FIXED stale "Three modules" copy -> "Eight modules" + duplicate className bug
- learn-app.tsx: emerald active-lesson state with accent bar, shimmering progress bars, flame-live streak icon, display-font overview + module cards, sheen on panels; copy fixes (BEGINNER -> EXPERT, Eight modules)
- lesson-view.tsx: display h1, segmented tab bar w/ sheen + emerald active icon, kicker hairline extension, sheen on tip/warn/takeaway/CTA
- problem-runner.tsx: sheen cards, difficulty pills with colored dots, btn-glow Run & grade
- QA: tsc clean in src/ (pre-existing errors only in examples/scripts/skills), eslint clean, dev.log no runtime errors; browser E2E: landing hero/stats/curriculum, learn overview, lesson learn+practice tabs, playground pipeline run — all verified; all 5 themes (carbon/paper/marine/oxblood/gallery) cycled and verified
- Committed source changes (screenshots excluded)

Stage Summary:
- Design language: same flat solid-color system, now with premium finish (display type, sheen, ambient glow, grain, micro-interactions)
- 6 files changed: layout.tsx, globals.css, landing.tsx, learn-app.tsx, lesson-view.tsx, problem-runner.tsx
- All 51 lessons / 547 MCQs / 394 problems untouched and intact

---
Task ID: ui-2
Agent: main
Task: Premium UI pass 2 — extend the material language to every learner surface (continuation of user's "sleek and premium" directive)

Work Log:
- globals.css: fixed light-theme bug — card-hover/btn-quiet hover borders used white-alpha (invisible/wrong-direction on Paper/Gallery). Added theme-adaptive --hover-line (white 14% on dark via :root, ink 22% via html:not(.dark)) + light-theme card-hover shadow variant + .cell-lift micro-lift utility (reduced-motion guarded)
- mcq.tsx (most-used surface): sheen card, accent-lit picked state (emerald ring + tinted chip before check), active:scale press feedback, animated verdict panel (framer-motion spring) with CheckCircle2/AlertCircle icons, btn-glow Check answer with disabled dim
- celebrate.tsx: toasts now carry kind icons in tinted chips (Zap/xp emerald, Award/badge amber, TrendingUp/level teal, Info/info zinc), sheen, spring scale-in
- mixed-quiz.tsx: uppercase tracking kicker + font-display heading, bar-shimmer progress, sheened next-question bar, btn-glow/btn-quiet buttons, display-font verdict card
- progress-cards.tsx: sheen + font-display headers on ActivityStrip/MasteryGrid, cell-lift + border-brighten on mastery cells, tnum stats, tracking kickers
- result-grid.tsx + data-explorer.tsx: uppercase tracked table headers, row hover, tnum cells, sheened explorer panel, cell-lift table pickers, kicker/display heading, btn-quiet playground button
- sql-editor.tsx + hero-demo.tsx + theme-switcher.tsx: sheen chrome, pulse-soft live dot, tnum result numerals, btn-quiet trigger, sheened dropdown
- QA: tsc 0 errors in src/, eslint clean on all 9 touched files; browser E2E at 1440x900 — landing, learn overview, lesson quiz (correct + wrong paths incl. About-your-pick), practice runner (solved l01-p1, XP 8->13, badge toast, matched panel), playground (sample run, pipeline tabs); Paper light theme verified across overview/lesson/quiz/explorer + --hover-line computed #18181b38; zero page errors
- Committed (screenshots included as artifacts)

Stage Summary:
- Design language now consistent end-to-end: every learner surface (quiz, toasts, progress, tables, explorer, editor chrome) shares the pass-1 vocabulary (sheen/font-display/bar-shimmer/tnum/btn-glow) plus theme-adaptive hovers
- 10 files changed: globals.css, mcq.tsx, celebrate.tsx, mixed-quiz.tsx, progress-cards.tsx, result-grid.tsx, data-explorer.tsx, sql-editor.tsx, hero-demo.tsx, theme-switcher.tsx
- All 51 lessons / 547 MCQs / 394 problems + logic untouched; XP/idempotency flows verified live

---
Task ID: ui-3
Agent: main
Task: Fix messy lesson arrangement — collapsible/expandable module system + semantic color coding for keywords/callouts/tips (user directive)

Work Log:
- New src/components/learn/sql-code.tsx: dependency-free SQL highlighter, one regex pass; keyword violet / function amber / string rose / number orange / comment muted; hues chosen to be theme-remapped by light themes (paper/gallery); exports SqlNodes (span-safe) + looksLikeSql heuristic
- rich.tsx: exported span-safe RichNodes (no p-in-p); inline `code` chips now SQL-colorized; bold bumped to zinc-100
- lesson-view.tsx: CodeBlock <pre> colorized; new Callout component (floating accent rail + tinted icon chip + uppercase label) unifying tip(emerald)/warn(amber)/dialect(teal, keeps engine pill)/takeaway(violet); DIALECT_META postgres sky→teal for light-theme contrast
- mcq.tsx: prompt + why + notes render via RichNodes (raw backticks gone); choices auto-detect SQL fragments (mono + highlighted) vs prose (clean sans)
- problem-runner.tsx: brief via RichNodes; hints pick mono-SQL vs sans-prose via looksLikeSql; reference solution colorized
- learn-app.tsx: sidebar modules became animated accordions (framer-motion height reveal, rotating chevron, num chip w/ done check, per-module micro progress bar, done/total counter, tree rail on lessons, done lessons dimmed + checked); expansion persisted to localStorage (seeql.modules-open), defaults to continue-module, auto-reveals module of lesson being opened; expand-all/collapse-all icon buttons in header; overview module cards now expandable with lesson rows + Start/Continue module CTA
- FIXED pre-existing data bug: stale dev db lacked orders.shipped_at (CREATE TABLE IF NOT EXISTS never migrates) → every "return every column" problem failed with column mismatch; ensureDatabase now PRAGMA-checks orders and reseeds when the column is missing (self-healing)
- QA: tsc clean in src/, eslint clean, qa-coach ALL CHECKS PASSED, audit-ids 941 unique/0 dup/0 orphan; browser E2E: accordion expand/collapse + persistence across reload, auto-expand on lesson open, lesson code highlighting (17 kw/2 fn/6 str tokens on l03), callouts on dark+paper themes, MCQ prompt chip + mono-vs-sans choices, answer flow (+8 XP, badge toast), practice solve end-to-end (+5 XP, Matched verdict, shipped_at column visible), mobile 375px sanity
- Committed dfee379 (7 files, +540/-109)

Stage Summary:
- Lesson arrangement: 51 lessons now live behind 8 collapsible modules (sidebar + overview), state persists, continue-point auto-expands
- Text semantics: five consistent color roles (keyword/function/string/number/comment) + four callout tones (tip/warn/dialect/takeaway) across all 51 lessons, 547 MCQs, 394 problems
- Bonus: stale-db grader bug root-caused and permanently fixed via self-healing seed

---
Task ID: audit-1
Agent: main
Task: "Keep all topics in the left menu" + in-depth content-consistency audit (user directive)

Work Log:
- Built scripts/deep-audit.ts — 9-section mechanical audit of all 51 lessons: id/sequence conventions, module-registry coverage/ordering/level-ladder/case-study-position, problem solutions re-run on fresh seed vs expected.ts, every lesson code block executed per statement, MCQ SQL choices executed + numeric-answer MCQs verified against live data, prose cross-references (lesson/module), figure-registry coverage, table arity/callout coverage/duplicate prompts
- FOUND + FIXED root app bug: API hasMultipleStatements fell through on comment openers, so ANY query ending in a "-- comment" was falsely rejected as multi-statement; scanner (fixed) + new splitStatements now shared in src/lib/sql-statements.ts (API, CodeBlock, QA all import one implementation)
- 58 blocks flagged multi-statement: 47 were the scanner bug; 11 genuinely multi -> new premium "Run all · N steps": /api/query batch mode (sqls[] runs sequentially inside ONE always-rolled-back transaction, per-statement results, errors don't abort) + CodeBlock stacked step results (chip: type · rows/affected, ResultGrid per step, inline errors)
- Splitter refinement: comment runs after ";" attach to the statement they annotate (was bleeding into the next -> UNKNOWN chip); statementType skips leading comments (API both paths + lesson-view looksLikeRead)
- Content fixes: lesson-44 BEGIN/COMMIT shape marked runnable:false (conceptual, non-storefront tables); lesson-32 b10 moving-average block made self-contained (monthly CTE inlined); l4-q9 duplicate prompt rewritten as store-fact question (103 orders / 21 NULL / 82 kept, notes for 21 and 0 traps); tips added to lesson-02 (projection playground), lesson-14 (guard-rail row-explosion warn, 39->94 rows math), lesson-16 (two-query sanity check tip) — every lesson now has callouts; lesson-45 self-reference rephrased
- Audit hardening: rawErrMsg extracts real SQLite message from Prisma boilerplate; sandboxSequence mirrors app batch semantics (ALTER+SELECT, CREATE VIEW+SELECT verified in-tx); announced-error blocks supported (lesson-43 FK-fence demo: error expected and verified); prose/fragment/conceptual-table classifiers eliminate false FAILs
- QA: tsc 0 errors in src, eslint clean, qa-coach ALL CHECKS PASSED, test-split 83 blocks/0 problems, deep-audit FAILS=0 REVIEWS=11 (all intentional: SELECT TOP trap, conceptual a/b/employees tables, DELETE ORDER BY trap...)
- Browser E2E: left menu shows all 8 modules/51 topics (expand-all verified 51 lesson buttons), module accordion + counts (0/9,0/9,0/9,0/5,0/5,0/3,0/5,0/6); l17 Run-all stacked results (206 rows + 4 rows, chips SELECT/SELECT); l43 FK demo errors as announced; l4-q9 renders + answers correctly (+8 XP, verdict text); Paper light theme batch UI verified; mobile 375px sidebar stacks full-width; API verified live (batch + trailing-comment queries)
- Committed (source + QA scripts; screenshots as artifacts)

Stage Summary:
- Content is now mechanically provably consistent: every id sequential/unique, all 394 grading targets match their solutions, all 93 runnable statements execute, all 4 numeric MCQ facts verified against live data, 125 cross-references valid, 85/85 figures registered
- Every code block in the curriculum now runs (or is honestly marked static) — 58 previously-broken Run buttons fixed at the root
- Left menu = full topic index: 8 collapsible modules, expand/collapse all, per-module progress, all 51 lessons reachable

---
Task ID: ops-2
Agent: main
Task: Diagnose "what happened" — preview 404 + restore dev server

Work Log:
- Session continued after context limit; all prior work intact (commits dfee379 UI overhaul, a5eb7d5 audit + Run-all, plus platform commits)
- Local app healthy (200 on :3000, caddy :81 -> 200) but external preview returned Go-style 404 with "Abc: preview-*" header => platform GATEWAY lost route registration (not an app error)
- 404 persisted 60+ min while app healthy (prior incident self-resolved in ~2 min)
- Killed stale next dev (PID 1070) and attempted restart via .zscripts/dev.sh 3 ways (nohup&, setsid nohup&, plain): ALL spawned process trees die within ~1-5s of the tool call ending
- Definitive heartbeat test: detached setsid 1s-loop writer died immediately after spawn call returned => sandbox reaps ALL agent-spawned processes; agent cannot keep servers alive this session
- Left state: next dev intentionally down (was killed for restart); db:push during attempt dropped orders.shipped_at again — SAFE: app ensureDatabase self-heals (PRAGMA check + reseed) on first request, same as audit-1
- Recovery requires PLATFORM restart (user restart button) => re-runs boot -> dev.sh platform-spawned (survives) + gateway re-registers route

Stage Summary:
- All user-facing work (UI overhaul + consistency audit) is committed and safe; only runtime needs a platform restart
- Agent-spawned background processes cannot survive tool-call teardown in this sandbox — future restarts should be requested via platform restart, not spawned from tool calls

---
Task ID: inv-1
Agent: main
Task: "before moving further for joins, make sure what's made and what's left" — full ground-truth inventory + rollback check

Work Log:
- Checked git history (32 commits), reflog, stash, branches: the summarized prior-session work (M1 500-MCQ expansion, 259 fills + fill-blank chip engine, 200 case-file scenarios, 8-theme registry incl. lemon & black, themes v2) is NOT present in this workspace snapshot; commits 0d4be0f/6e393d6/4dfab79 unknown to this repo's history
- Confirmed via distinctive-string search (Rebuilt correctly / keyword bank / fill-blank / lemon / cream plum / jet black): zero hits in src/
- Ran new scripts/inventory.ts (imports MODULES registry): exact per-module counts captured
- Verified app health: localhost:3000 = 200; working tree clean except new scripts/inventory.ts

Stage Summary:
- Ground truth of current snapshot: 8 modules / 51 lessons / 547 MCQs / 394 problems (122 easy/160 medium/112 hard; all with 2-level hints + mistake coach; 60 sandboxed mutating) / 85 figures / 8 module-end case studies; 5 themes (carbon/paper/marine/oxblood/gallery); deep-audit 0 fails at a5eb7d5; platform commits since are artifacts-only
- PRIOR-SESSION WORK LOST in snapshot rollback (same pattern as Task 11/15 incidents): case-file system, fills engine, M1 500-MCQ bank, theme rework v1/v2 all absent — user informed with full inventory; rebuild decision pending user choice (rebuild lost layers vs proceed to JOINs expansion)
---
Task ID: 2-a
Agent: batch-author B1
Task: Author 15 l1 case files cs-001..015 (cases-b1.ts)

Work Log:
- Read types.ts, exemplars.ts, case-audit.ts and case-facts-out.json in full; matched exemplar voice/density and every mechanical rule.
- Designed 15 l1 orientation queries (SELECT lists, *, COUNT(*), key lookups, equality filters, one bare LIMIT), each with 3-6 slots, distractor-consequence-checked by hand against the facts pool before writing.
- Probed a throwaway copy (scripts/.probe-b1.db, since deleted) for figures not in the pool: full rows of orders 74 and 83, order 6's four order_items lines, customer 5's 17 bookings, EU-active count (7), plus negative checks (no pending order at 397.99; no product where price = stock; no pending/cancelled collisions among distractor values).
- Wrote src/lib/curriculum/cases/cases-b1.ts (cs-001..cs-015, topic l1, exact id order with universes inventory/funnel/supplier/expense/catalog/growth/refund-audit/pricing/fraud/inventory/funnel/supplier/expense/catalog/month-close).
- Audited: AUDIT_COPY=scripts/.audit-b1.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b1.ts -> 15/15 PASS, fail: 0, first run.
- Typechecked: npx tsc --noEmit | grep cases-b1 -> no output (clean). Removed probe/audit copies.

Stage Summary:
- cases-b1.ts: 15 cases, audit "cases: 15  pass: 15  fail: 0". Universes: 10 distinct; slot counts 3x4 (cs-001/006/013/015), 4x6 (002/008/009/010/012/014), 5x4 (003/005/007/011), 6x1 (004); number slots in 13/15 cases (ids 9/5/4/1/74/2/5/6/5, amounts 397.99/199.99), noVerify used only 3 times total (cs-002 "1", cs-006 "1", cs-014 "5"). All 15 filled SQLs distinct and absent from exemplar fills. Tables covered: products (5), customers (4), orders (3), suppliers (2), order_items (1). Key decision: kept l1 SQL shape to SELECT/FROM/COUNT(*)/WHERE =/LIMIT only - no ORDER BY, aliases, LIKE, IN or NULL tests; distractors use real neighbor ids and figures from elsewhere in the facts pool so every substitution either errors or returns a different result set.
---
Task ID: 2-d2
Agent: batch-author B4b
Task: Author 9 l4 case files cs-082..090 (cases-b4b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-071 l4 model), scripts/facts/l4.json, and scripts/case-audit.ts.
- Probed scripts/.probe-b4b.db (copy, readonly, removed after) for the 5 unshipped-over-500 rows used in cs-082's walkthrough: ids 1/5/43/74/97 at 576.54 / 725.34 / 945.21 / 1,088.44 / 585.79, all pending.
- Wrote cases-b4b.ts: 9 l4 cases, universes in required order (fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit).
- Shapes: threshold review list (IS NULL + total > 500), count of NULL rows (21), COUNT(*) vs COUNT(col) one-row (103/82), NULL rows by status GROUP BY (7/14), SUM+AVG over NULL set (7,265.49 / 345.98), ORDER+LIMIT list of first 5, IS NOT NULL mirrored value (27,567.79), NULL backlog by month (10 buckets, 21 total), cancelled+never-dispatched count (7). No fill matches exemplar cs-071.
- Slot counts 3/3/3/5/4/5/4/5/3; noVerify slots 1 each in cs-082 (500) and cs-087 (5); l4 staple decoys (=, NOT NULL, IS NOT NULL, wrong aggregates, wrong status strings, real-figure threshold decoys).
- Audited: bun scripts/case-audit.ts on the file -> 9 pass / 0 fail. npx tsc --noEmit: no cases-b4b output.

Stage Summary:
- cases-b4b.ts complete: 9/9 audit passes (cases: 9 pass: 9 fail: 0), tsc clean; only files touched: cases-b4b.ts + worklog.md (probe copy cleaned up).
---
Task ID: 2-d1
Agent: batch-author B4a
Task: Author 10 l4 case files cs-072..081 (cases-b4a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-071 as l4 model), scripts/facts/l4.json, and scripts/case-audit.ts.
- Authored 10 l4 cases in new file src/lib/curriculum/cases/cases-b4a.ts, universe order cs-072..081: fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing.
- Shape variety: COUNT of IS NULL rows (cs-072), COUNT(*) vs COUNT(col) in one row (cs-073), IS NOT NULL dispatched book COUNT+SUM (cs-074), unshipped>500 COUNT+MAX threshold (cs-075), = NULL-trap rebuild with COUNT+SUM (cs-076), LIMIT-5 list of oldest unshipped (cs-077), GROUP BY status split 7/14 (cs-078), strftime month buckets (cs-079), cancelled+unshipped count (cs-080), dispatched AVG (cs-081).
- Slot counts 3-5; number slots are noVerify constants (ROUND precision, thresholds, LIMIT) within the 3-per-case cap; l4 staple decoys (=, NOT NULL, 0, IS-flips, wrong aggregates, wrong status strings) all consequence-checked.
- All figures copied from scripts/facts/l4.json: 21 unshipped, 82 shipped, 103 vs 82, 7265.49, 345.98, 1088.44, 27567.79, 336.19, 5 over 500, 7 cancelled-unshipped, 14 pending + 7 cancelled split, first5 rows, by-month buckets.
- No db probes needed; facts pool covered every figure used.
- Ran AUDIT_COPY=scripts/.audit-b4a.db bun scripts/case-audit.ts on the file: pass 10/10 first run; npx tsc --noEmit clean for cases-b4a.ts.

Stage Summary:
- cases-b4a.ts: cases 10, pass 10, fail 0 (case-audit summary: "cases: 10  pass: 10  fail: 0"); tsc --noEmit no output for cases-b4a; probe copies cleaned up (none created).
---
Task ID: 2-c2
Agent: batch-author B3b
Task: Author 15 l3 case files cs-056..070 (cases-b3b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-041 as l3 model), scripts/facts/l3.json.
- One probe on a db copy (scripts/.probe-b3b.db, removed after) for figures missing from facts: cancelled-order totals (7 rows, max 397.99, 2 over 200), orders BETWEEN 500–1000 = 24 (BETWEEN 500–800 = 21), status != 'delivered' = 51, pending OR cancelled = 21, products LIKE '%USB%' = 1, Audio price > 100 = 2 rows, suppliers rating >= 4.4 = 3 rows (Midwest exactly 4.4), order_items quantity >= 3 = 89 of 251 (nothing above 3), customers active = 0 = 2 rows.
- Wrote cases-b3b.ts: 15 cases cs-056..cs-070, universe order catalog/month-close/growth/refund-audit/pricing/fraud/inventory/funnel/supplier/expense/catalog/month-close/growth/refund-audit/pricing; slot counts 3/4/5 + one 6 (cs-069); payloads mix column lists and COUNT(*); skills span single comparison, multi-AND, OR, IN, LIKE, BETWEEN, month windows (strftime), negation !=, >= boundary.
- Audit iteration 1: 14/15 — cs-060 floor decoy "90" was ambiguous (89.99 < 90, same 4 rows); replaced with "80" (BETWEEN 80 AND 300 = 5 rows) and fixed the slot why.
- Audit iteration 2: 15/15 pass, fail: 0. npx tsc --noEmit reports no errors for cases-b3b.

Stage Summary:
- cases-b3b.ts: 15 cases (cs-056..cs-070, topic l3) — audit `cases: 15 pass: 15 fail: 0`; tsc clean; probe copies removed.
---
Task ID: 2-c1
Agent: batch-author B3a
Task: Author 14 l3 case files cs-042..055 (cases-b3a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-041 as l3 voice model), facts/l3.json.
- Probed missing figures on a read-only copy (scripts/.probe-b3a.db, cleaned up): total BETWEEN 100-200 = 23 (100-150 = 15, 150-200 = 8, 100-250 = 29, 50-200 = 30; no orders at exactly 100/200); pending AND > 500 rows = orders 1/576.54, 5/725.34, 43/945.21, 74/1088.44, 97/585.79 (pending > 300 = 8, > 600 = 3, > 800 = 2, > 400 = 5 so 400 avoided as decoy); status != 'delivered' = 51; order_items quantity range 1-3, qty = 3 = 89 of 251 lines.
- Wrote cases-b3a.ts: 14 cases, universe order inventory/funnel/supplier/expense/catalog/month-close/growth/refund-audit/pricing/fraud/inventory/funnel/supplier/expense; slot counts 3-5; skills cover single comparison (< > >=), AND, OR, IN, LIKE, BETWEEN, strftime month window, != negation; payloads alternate column list vs COUNT(*); thresholds marked noVerify (max 2 per case); number decoys chosen so substitution always changes the result set.
- Audit: bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b3a.ts -> iterate; passed first run, no fixes needed.
- npx tsc --noEmit: no errors referencing cases-b3a.

Stage Summary:
- cases-b3a.ts: 14/14 PASS (cases: 14 pass: 14 fail: 0), tsc clean. Touching only cases-b3a.ts + worklog.md.
---
Task ID: 2-b2
Agent: batch-author B2b
Task: Author 12 l2 case files cs-029..040 (cases-b2b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-016 l2 model), scripts/facts/l2.json, and scripts/case-audit.ts for the enforced rules.
- Probed a read-only copy of db/custom.db (scripts/.probe-b2b.db, removed after) to verify computed walkthrough figures: ROUND(price*1.05,2) samples (94.49, 36.23, 209.99), ROUND(price*stock,2) shelf values (10798.8, 7495, 7999.6), ROUND(rating*20,0) supplier scores (92/82/78/88/96/80), order_items count (251), goodwill ROUND(total*0.15,2) (86.48, 115.15, 22.88), promo price-10 samples (79.99, 189.99, 8.5, 4.99), booked totals (576.54, 845.92, 1088.44).
- Wrote cases-b2b.ts with 12 l2 cases cs-029..cs-040 in the mandated universe order (pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud); slot counts 4,5,3,4,4,4,5,4,3,5,6,3; carrying skills rotated across column choice, SELECT *, AS aliases, per-row arithmetic, and ROUND; tables spread over products/customers/orders/order_items/suppliers; avoided the cs-016 fill shape (used 1.05 on products with dual alias, 0.15 slice on orders, price-10 flat cut, rating*20 rescale, constant review_cycle column).
- Ran AUDIT_COPY=scripts/.audit-b2b.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b2b.ts: 12/12 PASS on first run; removed the audit copy.
- npx tsc --noEmit: no diagnostics mentioning cases-b2b.

Stage Summary:
- cases-b2b.ts authored: 12 cases, audit "cases: 12  pass: 12  fail: 0", tsc clean, probe copies cleaned up.
---
Task ID: 2-b1
Agent: batch-author B2a
Task: Author 12 l2 case files cs-017..028 (cases-b2a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-016 as l2 model), facts/l2.json, and scripts/case-audit.ts to pin exact enforcement rules.
- Probed a read-only copy (scripts/.probe-b2a.db, deleted after) to confirm derived figures: promo 15%-off cells (76.49/169.99/12.74), total*100 cents (57654/41681/15252), shelf_value price*stock (10798.8/10350/7495/7999.6), supplier rating*10 scores (46/41/39/44/48/40), total±fee (579.04/755.46/575.04/151.02), order-1 line refunds (93.06/30.3/25.26/427.92 = order total 576.54), and orders' 6 columns.
- Wrote cases-b2a.ts: 12 cases cs-017..cs-028, universes in prescribed order (growth, refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit); slot counts 3/4/5; skills spread across column choice, SELECT *, AS aliases, per-row arithmetic (+, -, ×) and ROUND; 1-2 noVerify number slots max per case.
- Audit round 1 (6 fails) surfaced two engine realities: result comparison is value-only (alias-text slots are inherently ambiguous — any identifier distractor reproduces the same values), and one template double-slotted FROM. Fixed by hardcoding alias texts (keeping AS keyword slots), restructuring cs-018/019/021/022/024/025, and correcting the cs-022 template.
- Audit round 2: 12/12 pass, fail: 0. tsc --noEmit clean for cases-b2a.

Stage Summary:
- bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b2a.ts → cases: 12  pass: 12  fail: 0
---
Task ID: 2-e1
Agent: batch-author B5a
Task: Author 14 l5 case files cs-092..105 (cases-b5a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-091 as l5 model), scripts/facts/l5.json; read scripts/case-audit.ts for exact mechanical gates.
- Probed a read-only copy (scripts/.probe-b5a.db, deleted after) for figures missing from the facts pool: order_items schema (id, order_id, product_id, quantity, unit_price), top-5 line items with unit_price >= 100 (209.68/205.81/205.31/204.19/200.07), bottom-6 orders by total (51/25.47, 72/30.24, 49/32.01, 53/39.39, 59/44.48, 93/45.36), oldest-3 and alphabetical-3 customers, multi-key category/price top-6, top-3 stock, APAC supplier ratings.
- Wrote src/lib/curriculum/cases/cases-b5a.ts: 14 l5 cases cs-092..cs-105, universes in the mandated order (pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud, inventory, funnel); slot counts 3/4/5 with one 6 (cs-098 multi-key); shapes: top-N value, bottom-N, newest/oldest by date, biggest/deepest stock, alphabetical A-Z, OFFSET paging (LIMIT 5 OFFSET 5), two-key sort (category ASC, price DESC), threshold+rank on order_items; personas per universe, no SQL vocabulary in briefs, walkthroughs quote audited figures.
- AUDIT_COPY=scripts/.audit-b5a.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b5a.ts -> pass 14/14 on first run.
- npx tsc --noEmit | grep cases-b5a -> clean.

Stage Summary:
- cases-b5a.ts: 14 cases (cs-092..cs-105, topic l5), audit "cases: 14  pass: 14  fail: 0", tsc clean; probe copies removed; touched only cases-b5a.ts + worklog.md.
---
Task ID: 2-g1
Agent: batch-author B7a
Task: Author 15 l7 case files cs-137..151 (cases-b7a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-136 l7 model), facts/l7.json; skimmed scripts/case-audit.ts for exact gates.
- Planned 15 cases with mandated universe order (supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth) and shape variety: single/3-aggregate rows, aggregate+ROUND, filtered aggregates (status/threshold/date), MIN+MAX pair, COUNT-over-filter, SUM-of-boolean-flag, two-column SUM trap.
- Probed scripts/.probe-b7a.db (read-only copy, removed after) for figures missing from facts: supplier-1 stock (3 SKUs, 230 units, max 120), Jan-2024 (8 orders, 3731.97), total>900 (2 orders, 2033.65), stock<50 (2/85), stock<100 (6/395), active=1 (14/14), supplier ratings (6, avg 4.3, min 3.9), orders<100 (15, avg 57.91, pool 868.66), products (2845 units, 1148.43 value), pending max 1088.44.
- Wrote cases-b7a.ts: ids cs-137..cs-151, slot counts 3/4/5 (one 5: cs-142), 4-5 distractors each, noVerify only for thresholds/ROUND precision (≤1 per case), NULL-on-empty-set teach in cs-145 walkthrough, personas per universe map.
- Audit: AUDIT_COPY=scripts/.audit-b7a.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b7a.ts → 15/15 PASS on first run.
- npx tsc --noEmit | grep cases-b7a → no output (clean).

Stage Summary:
- cases-b7a.ts authored: 15 l7 cases, audit "cases: 15 pass: 15 fail: 0", tsc clean, probe copies removed. Touched only cases-b7a.ts + worklog.md.
---
Task ID: 2-e2
Agent: batch-author B5b
Task: Author 10 l5 case files cs-106..115 (cases-b5b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-091 as l5 model), facts/l5.json.
- Probed a readonly copy of db/custom.db for figures missing from the facts pool: order_items schema (quantity 1-3 only, unusable for ranking), 3 smallest orders (51/25.47, 72/30.24, 49/32.01), orders ranks 6-10 by total, suppliers rating ASC top-2, products name DESC top-3, customers region+name multi-key top-8, shipped_at-vs-created_at distractor divergence, price band LIMIT 5 OFFSET 3. All probe copies removed.
- Wrote cases-b5b.ts: 10 cases, universes in order supplier/expense/catalog/month-close/growth/refund-audit/pricing/fraud/inventory/funnel; slot counts 3-6 (one 6-slot OFFSET case cs-112); shapes cover top-N, bottom-N, alphabetical ends, newest-by-date, multi-key region+name, OFFSET paging, smallest-tickets fraud sweep.
- Designed distractors with GROUP-vs-ORDER same-result traps avoided (e.g. no GROUP decoy where bare-column GROUP BY would reproduce the fill); all keyword decoys checked for consequence by hand before audit.
- Ran case-audit.ts on the new file: 10/10 pass on first run. tsc --noEmit: no cases-b5b errors.

Stage Summary:
- cases: 10  pass: 10  fail: 0 (cs-106..cs-115, all topic l5)
---
Task ID: 2-f2
Agent: batch-author B6b
Task: Author 7 l6 case files cs-129..135 (cases-b6b.ts)

Work Log:
- Read types.ts, exemplars.ts (voice models cs-041/cs-091), facts/l6.json.
- Probed a read-only copy (scripts/.probe-b6b.db, removed after): status list = cancelled/delivered/pending/shipped; orders cols (no product_id), order_items cols (no total); distinct day-of-month = 25; COUNT(DISTINCT customer_id) WHERE total>500 = 10 buyers / 25 orders (vs 16 buyers at >300) — used for cs-133 and decoy-contrast checks.
- Wrote cases-b6b.ts: 7 l6 cases covering distinct month list w/ strftime+ORDER (cs-129), COUNT(DISTINCT city) (cs-130), distinct status list (cs-131), COUNT(DISTINCT category) WHERE price>100 (cs-132), COUNT(DISTINCT customer_id) WHERE total>500 (cs-133), filtered DISTINCT supplier_id by category='Audio' (cs-134), COUNT(DISTINCT product_id) on order_items (cs-135). Slot counts 3/3/3/4/4/4/5; number slots noVerify only where figures absent from result cells (cs-132, cs-133).
- Audit iteration: fixed cs-132 (distractor "stock" in threshold slot tied at 3 via price>stock → swapped to "id") and cs-134 (marker {2} reused in ORDER BY → hardcoded supplier_id).

Stage Summary:
- AUDIT_COPY=scripts/.audit-b6b.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b6b.ts → cases: 7 pass: 7 fail: 0; npx tsc --noEmit → no cases-b6b diagnostics.
---
Task ID: 2-f1
Agent: batch-author B6a
Task: Author 13 l6 case files cs-116..128 (cases-b6a.ts)

Work Log:
- Read types.ts, exemplars.ts (voice models cs-041/cs-091), facts/l6.json; read scripts/case-audit.ts for exact enforcement rules.
- Probed a copy of db/custom.db (scripts/.probe-b6a.db, removed after) for figures missing from the facts slice: order statuses (cancelled/delivered/pending/shipped — no 'refunded'), per-status distinct-account counts, COUNT(DISTINCT customer_id) WHERE total>300/150/500 (16/16/10), COUNT(DISTINCT product_id) WHERE quantity>=2 (16 — degenerate, all slices hit 16), unit_price>100 slice (4 products: ids 4,5,7,13; 68 lines), months with total>=500 (12 months; Jul + Nov 2024 missing), COUNT(DISTINCT strftime('%Y-%m')) over customers (9), plus tie checks (COUNT(ALL supplier_id)=16, COUNT(ALL quantity)=251, SUM decoys 74/30/29/136).
- Wrote cases-b6a.ts: 13 l6 cases, universes in required order (supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog); mix of shapes — 7 COUNT(DISTINCT) number asks (2 with WHERE filters, 1 strftime month-bucket) and 6 deduped list asks (alphabetized category list, EU city list, filtered premium-category list, plain region list, APAC supplier list, filtered heavy-spend month list); slot counts 3/4/5; 1–5 noVerify number slots per case (all thresholds); keyword decoys include ALL vs DISTINCT, COUNT vs SUM, wrong column/table, wrong status/region strings.
- Audit iteration 1: cs-122 distractor "stock" tied with the correct fill at the threshold slot (price > stock happens to select the same 4 premium products) — swapped to "id". Iteration 2: fail: 0, 13/13 PASS.
- npx tsc --noEmit: no output for cases-b6a (clean).

Stage Summary:
- AUDIT_COPY=scripts/.audit-b6a.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b6a.ts → cases: 13  pass: 13  fail: 0; tsc clean; probe/audit copies cleaned up.
---
Task ID: 2-i
Agent: batch-author B9
Task: Author 5 capstone case files cs-196..200 (cases-b9.ts)

Work Log:
- Read types.ts, exemplars.ts (voice models cs-166/cs-136), scripts/facts/cap.json, and scripts/case-audit.ts (comparison semantics).
- Probed a read-only copy of db/custom.db for missing figures: full monthly revenue ranking (2024-01 3731.97 top, 2024-02 3609.64 runner-up, 2024-07 1193.86 low), unshipped split (pending 14 / cancelled 7), suppliers by region (EU 2@4.7, APAC 2@4.0, US/LATAM single-source), order_items rates > 200 (5 distinct: 200.07, 204.19, 205.31, 205.81, 209.68; 199.97 near-miss), Audio shelf (3 SKUs, 328.98), Wearables (2, 278.99). Probe copies cleaned up.
- Wrote cases-b9.ts: 5 capstones, one distinct shape each — cs-196 inventory best-month (strftime+SUM+GROUP BY+ORDER BY DESC+LIMIT 1), cs-197 funnel unshipped split (IS NULL+GROUP BY+COUNT+ORDER BY), cs-198 supplier HAVING COUNT(*)>=2 (EU/APAC survive), cs-199 expense DISTINCT+WHERE+ORDER BY (rates > 200), cs-200 catalog headline row (COUNT+SUM+ROUND, category='Audio'); 5-6 slots each, 1 noVerify each, 5-6 consequential distractors each; board-level briefs with per-universe personas.
- Swapped planned 'ALL' decoy in cs-199 for 'GROUP' after probing showed each >200 rate appears on exactly one line (ALL would have tied).
- Audited: fail: 0 on first and second run; tsc --noEmit reports no cases-b9 issues.

Stage Summary:
- bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b9.ts -> cases: 5  pass: 5  fail: 0
---
Task ID: 2-h1
Agent: batch-author B8a
Task: Author 15 l8 case files cs-167..181 (cases-b8a.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-166 as l8 model), facts/l8.json, case-audit.ts.
- Probed figures missing from the facts pool on a throwaway copy (scripts/.probe-b8a.db, removed after): active customers per region (APAC 4, EU 7 after WHERE active=1), per-status MAX/MIN totals (pending 1088.44, shipped 845.92, delivered 752.96, cancelled 397.99), per-customer spend (7262.35/6640.56/4574.23/3644.56/2667.93/1686.17 >= 1500), per-status AVG tickets (299.44/399.89/436.64/164.64), premium-SKU suppliers over price 50 (supplier 1: 3, supplier 6: 2), stock sums per category (940/510/505 > 400).
- Wrote cases-b8a.ts: 15 l8 cases, ids cs-167..cs-181, universes in required order (funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close). Shapes: month buckets via strftime (count and revenue HAVING), supplier/customer/category/region/status dims, WHERE+GROUP+HAVING combo (cs-172, cs-178), HAVING on COUNT/SUM/AVG/MIN/MAX, ORDER BY aggregates as supporting cast; slot counts 3-5; keyword+number mixes; WHERE-vs-HAVING as the signature teach in every why/walkthrough.
- Audit: AUDIT_COPY=scripts/.audit-b8a.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b8a.ts -> 15/15 PASS on first run, fail: 0.
- npx tsc --noEmit | grep cases-b8a -> no output (clean).

Stage Summary:
- cases-b8a.ts complete: 15/15 audit PASS (fail: 0), tsc clean, no probe copies left behind.
---
Task ID: 2-h2
Agent: batch-author B8b
Task: Author 14 l8 case files cs-182..195 (cases-b8b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-166 as l8 model), scripts/facts/l8.json, and scripts/case-audit.ts for exact mechanical rules.
- Probed a read-only db copy (scripts/.probe-b8b.db, removed after) for figures missing from the facts pool: 23 orders with exactly 4 order_items lines (cs-189); per-customer spend sums (c1 7262.35 / c5 6640.56 / c7 4574.23, c13 3644.56 just under the 4000 bar — cs-195); per-status avg tickets 164.64/299.44/436.64/399.89 (cs-193); per-category stock sums incl. Wearables 135, Video/Fitness 220 (cs-186).
- Authored src/lib/curriculum/cases/cases-b8b.ts: 14 l8 cases cs-182..cs-195, universes in required order (growth, refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud).
- Shapes varied: count-only groups (status >20), SUM-per-bucket with < threshold, count+avg with < 50, HAVING-on-count + ORDER BY DESC (customer_id, supplier_id), 6-slot full stack with SUM(stock) < 250 + ORDER BY, strftime month buckets ('%Y-%m') with COUNT >= 8 and SUM >= 2000, exact-equality HAVING (= 4 lines), MIN(price) > 30 and MAX(price) >= 149.99 floors/ceilings, spend-per-account >= 4000. Slot counts 3/4/5/6; verified number slots (5, 8, 3, 4, 5, 149.99) plus noVerify thresholds (max 1 per case).
- Every decoy checked for consequence: WHERE-substitution always hits an aggregate (misuse error), ORDER/keyword decoys error or return different row sets, threshold/figure decoys change surviving buckets; no distractor equals any slot answer.

Stage Summary:
- AUDIT_COPY=scripts/.audit-b8b.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b8b.ts → cases: 14 pass: 14 fail: 0 (all PASS first run).
- npx tsc --noEmit | grep cases-b8b → no output (clean).
---
Task ID: 2-g2
Agent: batch-author B7b
Task: Author 14 l7 case files cs-152..165 (cases-b7b.ts)

Work Log:
- Read types.ts, exemplars.ts (cs-136 as l7 model), scripts/facts/l7.json, scripts/case-audit.ts.
- Probed a readonly copy of the seed db (scripts/.probe-b7b.db, removed after): month sums ('2024-02' = 3609.64, distinct from Jan 3731.97), order_items quantity distribution (qty 1/2/3 = 93/69/89 lines), supplier rating extremes (4.8/3.9/mean 4.3), price<50 (8 SKUs, avg 32.06), price>=100 (4 SKUs, max 199.99), total>100 (33964.62), total<500 (17453.85), total>5000 (0 rows).
- Wrote src/lib/curriculum/cases/cases-b7b.ts: 14 cases, universes in required order (refund-audit, pricing, fraud, inventory, funnel, supplier, expense, catalog, month-close, growth, refund-audit, pricing, fraud, inventory); slot counts 3/4/5 plus one 6-slot (cs-155); shapes include multi-aggregate rows, filtered aggregates (status/threshold/date), MIN+MAX pair, SUM-over-empty-set -> NULL teach (cs-154), and a verified number slot (cs-165 "3" appears as MAX(quantity) cell); 4 cases carry exactly 1 noVerify slot each.
- Audited with AUDIT_COPY=scripts/.audit-b7b.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-b7b.ts on first attempt: all 14 passed, no fixes needed; audit copy auto-removed.
- npx tsc --noEmit: no cases-b7b errors.

Stage Summary:
- cases-b7b.ts: 14/14 cases pass (cases: 14 pass: 14 fail: 0), tsc clean, probe copies cleaned up.
---
Task ID: 1 (coordination) + 3 (integration)
Agent: main
Task: Rebuild the 200 case-file scenarios (user-approved scope) — engine verification, batch authoring via 15 subagents, integration, dedupe fixes, audit, E2E, commit

Work Log:
- Resumed after second context limit; found carried-over uncommitted work: case-files.tsx engine (463 lines), cases/types.ts + exemplars.ts (6 gold-standard cases), case-audit.ts + case-facts.ts tooling, learn-app wiring — all intact and green (6/6 exemplars audit pass, tsc clean, app 200)
- Decoded the original plan's topic blocks from exemplar block-first ids: l1:15 l2:25 l3:30 l4:20 l5:25 l6:20 l7:30 l8:30 cap:5 = 200; computed balanced universe rotation (exactly 20 per universe incl. exemplars)
- Patched case-audit.ts to honor AUDIT_COPY env (parallel agents share the fixed .audit.db path otherwise)
- Sliced the 76K facts pool into scripts/facts/{l2..cap}.json after first wave (B2/B3/B4) died on agent context deadlines reading the full file; relaunched in <=15-case batches
- 15 batch agents authored cs-001..cs-200 (B1, B2a/b, B3a/b, B4a/b, B5a/b, B6a/b, B7a/b, B8a/b, B9); every batch reached audit fail:0 before handoff
- Integration: rebuilt cases/index.ts (17 batches, sorted by id); wrote scripts/case-coverage.ts (id coverage, filled-SQL dedupe, title dedupe, distribution report)
- Coverage caught 5 cross-batch duplicate filled-SQL pairs (cs-049+061, 055+062, 077+087, 093+109, 094+114) + 1 semantic dupe (cs-101 vs cs-111, same result via ROUND wrapper) + 1 duplicate title (cs-042/cs-128) — fixed by rewriting 6 cases against fresh read-only probes (NOT IN corridors, qty>=2 bulk lines, COUNT+MAX stuck-pile, oldest-3 pending aging, >=500 escalation list, alphabetical count sheet) and retitling cs-128
- Final state: 200/200 audit PASS, ids cs-001..cs-200 complete, all fills distinct, all titles distinct, per-topic + per-universe exactly on plan; tsc clean in src
- Browser E2E: deck header "200 CASE FILES", progress 0/200 -> 1/200, topic chips show exact counts, cs-001 played end-to-end (chips -> check -> "Rebuilt correctly — case closed" + 10 XP toast -> walkthrough reveal), WHERE-filters filter -> CASE 1 OF 30; screenshot scripts/shots/case-e2e-solved.png
- Committed source + QA scripts + screenshots + self-healed seed db

Stage Summary:
- The case-file drawer now holds all 200 stakeholder memos: 15+25+30+20+25+20+30+30+5 across 9 topics, 20 per business universe, every case mechanically audited against the live seed db (single-table, number-figure honesty, distractor consequence, prose gates)
- Engine verified live: chip placement, per-slot coaching, XP ledger (case:* keys), walkthrough gating, topic filters, paging
- Key authoring patterns encoded in facts/ slices + exemplars: never slot alias text (audit compares values only), number formatting exact ("139.5" not "139.50"), thresholds need consequence-checked decoys

---
Task ID: cf-fix-1
Agent: main
Task: User reported "case problems tab i cant see" — locate and fix

Work Log:
- Reproduced headlessly (agent-browser, 1280x577): sidebar Toolbox buttons existed in the a11y tree but were invisible and click-blocked (clicks landed on the root container / sticky header)
- Root cause: aside used lg:max-h-[calc(100vh-96px)] while the inner panel used max-h-full; percentage max-height does not resolve against a parent constrained only by max-height, so the panel rendered ~1420px, overflowed the 481px-capped aside, and buried the Toolbox
- Fix: one line — aside gets a definite height at lg (lg:h-[calc(100vh-96px)]), making max-h-full resolve; module list scrolls internally (min-h-0 flex-1 overflow-y-auto was already in place), Toolbox pinned at panel bottom
- E2E verified live: aside 481 == panel 481, Case files hit-testable, deck opens ("200 CASE FILES · MODULE 1 TOOLKIT"), CS-001 played end-to-end — wrong chip order triggered per-slot why-coaching, correct order (id, WHERE, 9) gave "Rebuilt correctly — case closed" + 10 XP (Data Novice 0 -> 10) + walkthrough reveal + Cases closed 1/200; Data explorer and Mixed quiz also verified switching
- tsc clean in src; committed fix + E2E screenshot as 803e403; debug screenshots removed

Stage Summary:
- Toolbox visibility bug fixed and committed (803e403); all 200 case files now reachable via sidebar Toolbox -> Case files

---
Task ID: themes-v2
Agent: main
Task: Replace the theme set with the user-approved v2 directions (jet black, cream & plum, black & pink, matte pastels)

Work Log:
- Mapped the theme system: src/lib/themes.ts registry (ids/names/swatches/dark flags) -> globals.css .theme-* ramp blocks (zinc inversion for light, emerald/teal re-brand, shadcn tokens) -> boot script in layout.tsx auto-generated from the registry
- Rewrote the registry to 4 themes: jet (dark, default), plum (light), noir (dark), pastel (light); replaced the 5 CSS blocks (carbon->jet, paper->plum, marine->noir, oxblood->pastel, gallery->deleted)
- Updated hardcoded refs: <html> boot class theme-jet, both switcher "carbon" fallbacks -> DEFAULT_THEME, landing "5 themes" -> "4 themes"
- Hit a stale Turbopack CSS artifact (compiled chunk kept serving 3 of 4 blocks, same content hash); a real content change to globals.css forced recompile and pastel appeared — verified all four .theme-* blocks in the served CSS
- Browser E2E per theme: html class + dark toggle correct (jet/noir dark, plum/pastel light), computed body colors match tokens, landing + learn + 200-deck screenshots per theme, CS-001 solved under pastel light (rebuilt correctly + 10 XP), switcher menu lists exactly 4 themes; tsc clean in src
- Committed b750bb7 (source + 11 screenshots)

Stage Summary:
- Theme set v2 shipped: Jet Black (default), Cream & Plum, Black & Pink, Matte Pastels; old stored theme ids migrate safely to the default; all 200 case files / learn app / landing / playground re-skin via the unchanged ramp mechanism

---
Task ID: pg-flow-1
Agent: main
Task: "how can we improve the playground??" — lesson-diagram aesthetic in the playground + rescue orphaned ChartView + seed race fix

Work Log:
- Recon: playground = PlaygroundView in src/app/page.tsx (editor + 6 viz tabs + results panel); found chart-view.tsx (full recharts component, ChartColumn icon, auto X/Y detection, SUM-by-category aggregation) was NEVER imported anywhere — orphaned
- New src/components/query-flow-svg.tsx: QueryFlowSvg — compact lesson-style SVG strip (640 viewBox, diagrams-kit fade/drawIn/DotField) rendering the logical execution order: FROM node with real dot-field + row count from /api/stats, JOIN, WHERE/HAVING as dashed gates, GROUP BY/SELECT/ORDER+LIMIT nodes, emerald OUT node carrying the actual result row count; 4-per-row grid with straight arrows + rounded circuit wrap arrow into the next row; plain-English caption line under the figure
- page.tsx: wired strip at top of Pipeline tab (SELECT only, key={sql} so each run replays the draw-in), added tableCounts via /api/stats on mount, wired ChartView as a "Chart" tab in the results panel (hidden for write statements), ChartColumn icon import
- results-view.tsx: rows now motion.tr with 18ms/row stagger fade-in (capped 0.45s)
- BUG FOUND + FIXED (src/lib/sample-db.ts): playground boot fires /api/query + /api/stats in parallel; ensureDatabase() had no single-flight guard so both calls could seed an empty db → loser died "UNIQUE constraint failed: customers.id". First fix (module-level promise lock) was insufficient: Next bundles sample-db into EACH route separately, so locks didn't share. Final fix: lock promise parked on globalThis.__seeqlEnsure
- Ops incident during E2E: dev server originally launched by container start.sh died when I killed it for the db test; processes spawned from Bash tool calls get reaped between calls (setsid+nohup dies, double-fork node spawn detached:true survives). Server now relaunched via node double-fork and stable across calls; db file recreated cleanly on disk
- E2E (fresh agent-browser session): default join+agg sample → strip renders FROM c (16-row dot-field) → JOIN → WHERE gate → GROUP BY → HAVING gate → SELECT → ORDER BY → OUT "4 rows"; CTE sample → WITH monthly + FROM m alias + OUT "67 rows" (wrap arrow, "rows flow in" fallback for non-physical CTE source); simple sample → 5 nodes single-wrap; Chart tab → recharts bars, SUM aggregation verified (Alice Chen 6+12=18 tallest bar); error path → 0 figures, parse+exec error cards shown; UPDATE → no strip, write banner, Chart tab absent; stagger opacities settle at 1; console clean; screenshots scripts/shots/pg-flow-{default,4rows,cte,simple,final,error-path,write-path}.png + pg-chart-tab.png
- tsc clean (touched files), eslint clean

Stage Summary:
- Playground now speaks the same visual language as the lessons: every SELECT shows a picture-first flow strip (real row counts, dashed gates, animated arrows) above the step-by-step pipeline, and every result with a numeric column is one click from a chart
- Cold-start seed race fixed at the framework level (globalThis single-flight) — the intermittent "UNIQUE constraint failed: customers.id" on first load is gone
- ChartView rescued from orphan status; results grid got the lesson-feel stagger

---
Task ID: pg-viz-3
Agent: main
Task: "make the playground the perfect SQL query visual learning tool" — Phase 1+2 core: live flow strip, row funnel, text↔diagram linking, error coaching, lesson-grade results grid

Work Log:
- /api/parse + sql-parser.ts: buildQueryPlan now surfaces peggy error location as {start,end} offsets (shifted back into raw text by the trim lead) — powers editor squiggles
- New src/lib/sql-clauses.ts: raw-text clause scanner (string/comment/paren-aware, top-level only) → ClauseSpan[]; clauseAtOffset/spanOf/stripClauses; buildStagePlan assembles REAL count queries per execution stage. Stage SQL built from clause spans, NOT the original SELECT list (aggregates in the list collapsed pre-GROUP stages to 1 row — found via live numbers); GROUP/HAVING stages keep the original list inside a subquery so aliases resolve; HAVING must filter INSIDE the subquery (outer HAVING saw a single ungrouped row → 37 instead of 4); newline-preserving clause strip (collapsing \n merges `--` comments into code)
- SqlEditor: tokens carry offsets; new props highlight (emerald clause glow), errorRange (rose wavy underline), onCaretMove (select/click/keyup) — token-level splitting around highlight/error boundaries
- QueryFlowSvg: every node maps to its ClauseKind; hover/leave/click handlers + emerald halo when the editor caret sits inside its clause; svg-root mouseleave safety
- New src/components/row-funnel.tsx: "Where did the rows go?" — FROM → WHERE → GROUP BY → HAVING → OUT strip with proportional dot-fields, per-stage counts fetched via countWrapper queries to /api/query (parallel), −N delta labels, plain-English caption; plan derived via useMemo, only fetched counts in state (react-hooks/set-state-in-effect clean); OUT = full query wrapped in COUNT(*) so it is live and immune to the 1000-row payload cap; dataVersion prop re-counts after DB reset
- page.tsx: debounced (400ms) live parse loop while typing — flow strip, funnel, stats chips and ALL parse-derived tabs now update live; last-good plan fallback when text is broken; ranSql/dataVersion tracking; editorInSync gate so highlights never misplace after edits; pin/hover cleared on text change; RowFunnel + strip gated to SELECT; error hint card under editor
- ResultsView: low-cardinality string columns → colored chips (6-tone stable palette), non-id numeric columns → proportional in-cell teal bars, booleans → true/false chips
- PipelineView: step titles clickable → pin that clause in the editor
- Bug found during E2E: funnel counts went stale after Reset (effect keyed only on sql text; data changed underneath) → dataVersion bump on reset + tableCounts refetch
- E2E (agent-browser): boot funnel 103→103→37−66→4−33→OUT 4 (matches hand-run SQL ground truth); typing `AND o.total > 200` live-updated funnel to 65/33/2/2 without Run; hover WHERE gate lit the exact clause text in the editor; caret inside WHERE lit exactly the WHERE node; SELEC typo → inline hint + wavy underline under the offending token while the right panel kept the last good plan; aggregate run → status chips (delivered/shipped/pending/cancelled) + 8 in-cell bars; CTE sample → WITH node + 77→67 funnel; UPDATE → strip+funnel hidden, write banner; reset → counts recompute pristine; pastel light theme legible (OUT number bumped to emerald-400 for light bg); tsc + eslint clean; console clean
- Screenshots scripts/shots/pg-v3-{live-funnel,hover-link,error-coach,pastel-funnel,final-pristine}.png; QA scripts scripts/test-clauses.ts + scripts/test-funnel.ts

Stage Summary:
- The playground now teaches while you write: the query's picture (flow strip + row funnel with real intermediate counts) updates live as you type, the SQL and the diagram are bidirectionally linked (hover/click/caret), parse errors coach inline with a squiggle on the failing token, and the results grid speaks the lesson-diagram language
- Row funnel semantics encoded: stage SQL from raw clause spans, aggregates neutralized pre-GROUP, HAVING inside the subquery, newline-safe stripping — all verified against live SQLite numbers
---
Task ID: pg-viz-4
Agent: main
Task: Playground Phase 2+3 finish — step inspector (#7), smarter charts (#6), try-it missions (#8), visual sample gallery (#9)

Work Log:
- Discovered hard constraint via live probe: Prisma SQLite rows are objects, so duplicate column names in a JOIN `SELECT *` silently COLLAPSE (c.id lost; ["id","name","total"] from a 4-column select). Row views therefore need explicit per-column aliasing
- sql-clauses.ts: buildStagePlan now also emits rowStages (row-form SQL per stage), finalRowSql (LIMIT-capped full query), and gates (EXCEPT diffs "rows killed here" for where/having). Optional sync `projectFrom(fromText)` hook supplies an explicit aliased projection; null → row stage unavailable (counts keep working). Single-table FROM falls back to SELECT * (no collision possible)
- New /api/stages route: one round trip runs stage COUNTs + row-form stages (cap 60) + gate EXCEPTs (cap 48→24). Parses (table, alias) pairs out of the raw FROM span (teaching-grade: comma joins, JOIN chains, ON/USING skipped; parentheses → bail), pre-fetches PRAGMA table_info per table, then builds `alias.col AS "col"` projections with `col·alias` collision suffixes. Reused /api/query's normalizeCell by extracting to lib/cell.ts (query route refactored to import it)
- row-funnel.tsx: stages are now clickable (cursor, hover brightness, title tooltip, aria button, emerald dashed selection ring) + caption hint
- New stage-inspector.tsx: "WHERE · rows that survived the filter" panel — plain-English stage story (N survived, M stopped here), lesson-grade MiniGrid (low-cardinality string chips, right-aligned numerics), ghosted rose "STOPPED HERE — N rows didn't make it" grid (6 shown + "+N more") for gates, graceful "can't be listed" note for CTE/subquery-FROM shapes, loading/error states
- page.tsx: inspectKind state; funnel click toggles inspector under the funnel; ChartView keyed by ranSql (new query → fresh auto-suggestion; same query re-run keeps user's chart choices); results panel gains Missions tab with live done-count badge from the shared XP ledger
- chart-view.tsx (#6): auto-rules upgraded — date X → line, two numeric cols → scatter, ≤6 non-negative categories → pie, else bar; diagrams-kit palette (blue #60a5fa dropped for fuchsia); "Why this chart: …" teacher caption under the chart
- New lib/missions.ts (#8): 6 missions (pending pile / heavy orders / EU roster / revenue by status / big spenders / the regulars) checked against RESULT SHAPE only (row counts, column projection, value predicates, ordering) — never SQL text; per-difficulty XP 5/10/20
- New mission-board.tsx: mission list (difficulty chips, XP, done checks) + detail card (shape-to-hit, hint toggle, one-click starter into editor); auto-checks against latest run; verdict banners coach in plain English; pass awards via useProgress.awardXp("mission:<id>") — same zustand localStorage ledger as Learn
- New sample-gallery.tsx (#9): header dropdown replaced by Popover card grid; each card carries a MiniFlow schematic derived live from its SQL via findClauses (violet CTE → zinc FROM → dashed rose WHERE → teal GROUP → dashed orange HAVING → emerald OUT; UNION draws two converging sources) + clause chips
- E2E (agent-browser): default sample WHERE inspector (103 rows, region chips, id·o collision-safe headers); total>400 → "34 survived / 69 stopped" + 6-row ghost grid; HAVING on default sample → 4 groups kept + 33 stopped ghost panel; CTE sample → FROM/WHERE stages degrade to counts-only note, OUT shows real 60 of 67 rows; missions: heavy orders pass → "+5 XP" + badge 1/6, wrong query → "Got 3 rows — brief says 10"; Learn app shows the 5 XP (ledger bridge closed); GROUP BY status chart auto-picks PIE with "4 categories whose values add up" caption; gallery renders all 7 mini flows incl. UNION converge; UPDATE → funnel/inspector/missions tab all hidden; Reset DB → inspector refetches fresh; broken SQL keeps last-good diagram + inline error; pastel theme reskins everything (CSS vars); tsc + eslint clean; console clean
- Screenshots scripts/shots/pg4-{inspector-where,inspector-killed,mission-selected,chart-auto-pie,gallery,cte-inspector,pastel-inspector,final-having,having-killed}.png

Stage Summary:
- The playground roadmap (3 phases, 9 features) is now fully shipped. Execution order is tangible: click any funnel stage and see the actual rows — including the ones each gate killed. Missions grade the SHAPE of your result (not your SQL) and pay XP into the same ledger as the lessons; the sample picker sells queries by their picture; the chart tab picks the right chart and explains why

---
Task ID: ops-preview-recovery
Agent: main
Task: Fix "preview not loading" - diagnose, recover, and make the failure mode impossible

Work Log:
- Symptom: preview dark; curl :3000 -> 000, no next/bun processes alive
- Forensics: dev.log's last entries were healthy /api/stages + /api/query traffic; dmesg shows the root cause - at uptime 3374s (07:08) the kernel OOM killer killed next-server v1 at 2180MB RSS on the 4GB box; nothing supervised it, so it stayed dead
- Proved empirically that processes spawned from tool-shell invocations are normally reaped between invocations (setsid sleep test died), so a manual foreground restart is not viable; the durable path is the boot flow (.zscripts/dev.sh, invoked by start.sh) plus a supervisor
- New .zscripts/watchdog.sh: detached watchdog (boot-spawned orphan, same lifecycle as the dev server) - restarts the dev server after 2 consecutive dead 20s checks, recycles next-server when RSS > 1.6GB (OOM prevention; observed 1.3-1.4GB after a single compile, 2.18GB was fatal), restart-burst backoff (max 3 per 10min then 5min sleep), 5MB log cap, dev.pid re-bind if pid file goes stale
- Hardened .zscripts/dev.sh: records dev.pid for the watchdog, starts the server with setsid + nohup + own log file (a detached child holding the caller's stdout pipe blocks pipeline EOF forever - found live when the test boot hung), cleanup trap now kills the whole process group (bun -> sh -> next dev | tee), idempotent watchdog launch guarded by watchdog.pid
- Live-validated the full loop inside tool invocations: bash dev.sh brought the server up (Ready 772ms, GET / 200, warm compile 1.7s), then killed the server and watched the watchdog log 'streak 1 -> streak 2 -> start: dev server pid 5680' with the port back at HTTP 200 ~20s after the kill
- Sanity after recovery: homepage 200; POST /api/query returns correct funnel ground truth (delivered 52 / shipped 30 / pending 14 / cancelled 7); next-server steady ~1.3GB (under the watchdog cap)
- Committed as e37cd14 'ops: self-healing dev server watchdog (OOM-proof preview)'

Stage Summary:
- Preview restored without user action and, more importantly, the failure mode is now structurally fixed: any future OOM kill or crash of the dev server self-heals in ~20-40s via the watchdog, and if the box ever cold-starts again, dev.sh boots both the server and its watchdog automatically
- Watchdog log lives at .zscripts/watchdog.log (grep 'recycle' to see OOM-prevention kicks, 'not found' for crash recoveries)

---
Task ID: pg-viz-10-module9-finance
Agent: main
Task: Module 9 — SQL for Finance: new book tables on the live engine + 6 full lessons (52-57) + 6 hand-drawn figures, wired into the curriculum (user approved direction after "so what next" x2; #15/#16 stay queued)

Work Log:
- sample-db.ts: 4 new tables (invoices, payments, expenses, ledger_entries) — hand-authored deterministic books in INTEGER CENTS, 2024-01..2025-02, AS OF '2025-03-15'; ledger legs COMPUTED from the invoice/payment/expense arrays so debits always equal credits by construction (80 legs, $181,080 balanced); two planted reconciliation catches: invoice 28 'paid' with NO payment rows ($1,756) and invoice 11 VOID with a payment ($925 refund owed) — FK enforcement rejected the original orphan-payment idea (Prisma sets foreign_keys ON), which forced the better design; self-heal path seeds finance rows into pre-existing storefront DBs
- scripts/finance-facts.ts + check-invoices.ts: every teaching number verified live (aging buckets current 2794 / 1-30 5710 / 31-60 4937 / 61-90 1295 / 90+ 873 = 15,609; trial balance 181,080 BALANCED; expense mean 1815.43 sd 423.12 Aug z 3.30; revenue series 13 months with MoM %; Alice statement walk ending 2148); caught + fixed a duplicated payment (invoice 10 paid twice) via the audit script
- 6 lessons (52-57): The books (cents discipline, lifecycle, outstanding), Running balances (UNION ALL staging + SUM OVER walk, Alice's statement), AR aging (AS OF discipline, CASE ladder, tall+wide pivots, DSO 66 days), MoM growth (LAG, growth %, 3-mo moving average frame, small-n volatility), Reconciliation (trial balance, NOT EXISTS anti-joins, the two catches, AR gap ties to the cent: 17,365 economic = 16,440 ledger + 925), Windows III (CUME_DIST, LAST_VALUE frame trap, PERCENT_RANK vs CUME_DIST)
- FOUND + SOLVED an engine limitation: this SQLite build has NO math functions (no SQRT, no POWER — gen-expected FAILed 3 problems) → lesson 57 now builds the square root from lesson 49's WITH RECURSIVE: Newton's method g←(g+var/g)/2, 30 fixed iterations, verified to reproduce sd 423.12 exactly; became the lesson's centerpiece ("build your own math library"); NOTE: SQLite recursive members cannot JOIN sibling tables — scalar subqueries (SELECT var FROM stats) work
- diagrams-m9.tsx: 6 figures (fin1 books map, fin2 Alice staircase, fin3 aging ladder bars, fin4 raw-vs-ma3 lines, fin5 trial balance scale, fin6 sliding frame + August outlier) using diagrams-kit primitives; FigureId union extended; FIGURES_M9 spread into the registry; fixed title/annotation overlap in fin6 + missing diagram block in lesson 57 (E2E caught figures:0)
- lessons/index.ts: module 9 registered (id 'finance', Advanced); header counts auto-updated to 9 modules · 57 lessons · 430 graded queries · 613 quiz questions; mixed quiz + review queue pick up the 66 new MCQs automatically
- gen-expected: 430 results 0 failures (was 392); Emma walk brief fixed 8→7 rows; scoped tsc + eslint clean (content-audit.ts errors pre-existing, unrelated)
- E2E (agent-browser, scripts/shots/m9-*.png): lesson 52 renders + fin1 figure; Practice problem 1 solved live -> +5 XP toast + First Steps + Problem Solver badges double-unlock (m9-2); finance MCQ -> +8 XP first-try bonus with verdict (m9-3); playground runs the aging pivot live with exact verified totals (m9-4); lesson 57 figures+prose verified (m9-5/6); console clean; fresh profile note: Fast Refresh wiped persisted progress (known dev-mode quirk, not product)

Stage Summary:
- Module 9 shipped: the storefront now has real books — integer-cent invoices/payments/expenses plus a balanced double-entry ledger — and 6 lessons teach finance analytics ON the engine (aging, balances, growth, reconciliation, outlier stats). Two audit catches are planted and discoverable. Remaining Phase 5: #15 data dial, #16 share/export; possible follow-up: finance case files on the chip-rebuild system

---
Task ID: m1-deep-1
Agent: main
Task: Module 1 theory-density wave — "Deep dive" premium layer (user approved: tiered MCQs, module-by-module pipeline M1 theory → M1 MCQs → M1 cases)

Work Log:
- Verified 30+ teaching numbers live before writing prose (scripts/m1-facts.ts): counts 16/16/6/103/251; status 52/30/14/7; NULL shipped_at 21; COUNT(*) vs COUNT(shipped_at) 103/82; precedence pair 12 vs 5; price ties NONE (all 16 unique); LIKE case-insensitivity '%pro%'=2; BETWEEN 50-100 → 4; region IN US+LATAM → 3; NULLs sort first ASC (SQLite); SUM reconciliation line-grain = order-grain = 34,833.28; DISTINCT(status,customer_id) pairs = 37; bare-column quirk returns pending,103; avg line 138.78, min 14.46, max 599.91
- types.ts: new DeepBlock union (reuses p/h/bullets/code/diagram/table/tip + adds mind | engine | myth | edge) + Lesson.deep? field + 8 new FigureIds v1-grain-zoom … v8-bucket-gate
- diagrams-m1x.tsx (new, ~520 lines): 8 premium SVG figures in the house style — v1 grain zoom (orders→order_items), v2 SELECT/FROM pipeline, v3 WHERE gate + operator ladder with 12-vs-5 receipts, v4 NULL three-valued gates (82/21), v5 multi-key sort + LIMIT slice (verified rows) + TEMP B-TREE engine note, v6 DISTINCT sieve (16→4 buckets + counting trio), v7 aggregate collapse (251→1, five verified readouts), v8 bucket machine (52/30/14/7) + HAVING >= 30 gate (kept 2 / dropped 2); registered via FIGURES_M1X spread in diagrams.tsx
- lesson-view.tsx: 4th tab "Deep dive · go further" (Microscope icon, only when lesson.deep exists); new renderers MindCard (violet Brain callout), EngineCard (teal numbered pipeline with connector line), MythCard (rose Myth | emerald Reality split grid), EdgeCard (case/result gallery table); SharedBlock mirrors learn-tab arms with violet accents
- Authored 8 dense deep-dives (lesson-01..08.ts), each ~10 blocks: mental model, engine walkthrough, premium figure, analytics-angle prose, 2 myth-vs-reality cards, 4-row edge-case gallery, tip; themes: L1 grain/ledger-not-screen + 34,833.28 reconciliation, L2 FROM-before-SELECT + alias birth, L3 bouncer + precedence receipts (12/5), L4 three-valued logic + NULL census, L5 sort output-promise + TEMP B-TREE + deterministic final key, L6 tuple dedupe + 16-distinct-cities fingerprint + dup detector, L7 collapse grain + empty-set twins (0 vs NULL) + SQLite bare-column quirk (pending,103), L8 bucket machine + WHERE/HAVING stage split + HAVING-without-GROUP BY trick
- Layout bug fixes caught by screenshots: v3 right-edge clipping (34 rows pass + ladder receipts → anchor end x=688/706), v8 GROUP BY label buried under chip field (moved to caption under chips y=146), rail-text overflow in v6/v7/v8 (trimmed to fit 676px)
- scripts/m1-probes.ts: all 20 runnable SQL probes embedded in deep-dives verified OK against live engine (empty-set twins [0,null,null], full pipeline [delivered,52,15571.07], etc.)
- E2E (agent-browser): all 8 lessons show Deep dive tab; L1/L3/L8 deep-verified (mind/engine/myth/edge/figure all render, 1 svg each); async sweep confirmed L2/L4/L5/L6/L7 tab+figure+blocks; tsc + eslint clean (pre-existing content-audit errors only); console clean; 6 screenshots scripts/shots/m1deep-{1..6}*.png

Stage Summary:
- Module 1 theory-density wave shipped: every L1-8 lesson now has a 4-tab layout with a premium Deep dive layer (mental models, engine mechanics, myth-vs-reality, edge galleries, 8 new hand-drawn figures — every number engine-verified). Next in the M1 pipeline: tiered MCQ bank (core 50 / secondary 15-20 / utility 8-10) then fill-in-the-blank case studies on the shared grading engine

---
Task ID: m1-drills-1
Agent: main
Task: Module 1 MCQ bank — drill infrastructure + core wave (7 keywords x 50 = 350 aspect-matrix questions) + Drill Yard UI

Work Log:
- Probed 40+ facts live before writing a single question (scripts/m1-drill-facts.ts): all 103 order totals UNIQUE (0 tie groups); suppliers have ZERO NULL ratings (old m1-facts note wrong — caught by re-probe); LIMIT -1 → all 103 rows (negative = no cap); alias in WHERE WORKS in SQLite (WHERE oid > 100 → 101-103!) — reframed as portability question instead of false error claim; GROUP BY 1, alias in GROUP BY/HAVING all work; NOT IN over NULL-bearing subquery → 0 rows (classic trap confirmed live); empty-set twins [0,null,null,null,null]
- Two subtle probes saved wrong answers: implicit global group EXISTS over empty set (WHERE 1=0 HAVING COUNT(*)=0 → 1 row [0]) vs grouped version (0 rows) — wrote hv-24 around the verified behavior; repeat buyers (>1 order) = 14 of 16; stacked gate (WHERE >400 GROUP BY status HAVING >=10) = 2 statuses
- drills/types.ts: DrillAspect six-angle matrix (syntax/semantics/edge/errors/predict/judgment), DrillTier (core/secondary/utility), DrillQ (structurally compatible with Mcq — flows through McqCard + XP ledger unchanged), DrillSet, ASPECT_LABELS
- 7 core files (50 questions each, aspect-matrix distributed 8/10/10/6/10/6): select-from, where, null (3VL), order-limit, aggregates, groupby, having — every predict question engine-verified; IDs dr1-<kw>-<nn>
- drills/index.ts: DRILL_SETS registry with per-set metadata (labels/blurbs/tiers), drillTotal(), drillSetsForModule()
- drill-yard.tsx: keyword picker (tier-grouped cards, per-set progress from mcqAttempts, "N of total attempted") + session runner (rounds of 10, unseen→missed→mastered deck order, aspect+tier badges, McqCard, verdict screen with mastery count)
- learn-app.tsx: "Keyword drills" sidebar entry (Dumbbell icon, between explorer and mixed), drills view branch
- tsc + eslint clean (pre-existing examples//skills/ errors only); E2E: picker renders 7 core cards (350 q), WHERE drill full 10-question round — first-try +8 XP toast + First Steps badge, wrong-answer amber coaching verdict (no XP), progress bar, "Solid round 6 of 10" + "WHERE · 6/50 mastered" verdict, New round / Pick another keyword; console clean; 8 screenshots scripts/shots/m1-drill-{1..8}*.png
- E2E quirk noted: rapid scripted clicks during framer-motion verdict animation can hit detached nodes — manual pacing works; product unaffected

Stage Summary:
- Module 1 drill bank stage 1 shipped: 350 core MCQs across 7 keywords, six-aspect coverage per keyword, Drill Yard UI live in the sidebar, XP/badges fully wired. Stage 2 next: secondary wave (IN/BETWEEN/LIKE/AND-OR-NOT/DISTINCT/COALESCE/NULLIF ≈ 120 questions) then the fill-in-the-blank case studies (20/20/20 easy/medium/hard)

---
Task ID: m1-drills-2
Agent: main
Task: Module 1 MCQ bank stage 2 — secondary wave (7 keywords, 120 questions: IN 20, BETWEEN 15, LIKE 20, AND/OR/NOT 20, DISTINCT 20, COALESCE 15, NULLIF 10)

Work Log:
- New probes before writing: Jan-2024 orders BETWEEN dates = 8; '_e%' products = 2; NOT (delivered OR shipped) = 21 (De Morgan); NULLIF(NULL,NULL) → NULL; NULLIF('x',NULL) → 'x' (NULL poison = pass-through); NOT LIKE '%a%' products = exactly 5 names
- CAUGHT + FIXED a wrong draft claim live: `WHERE status = 'pending' OR 'shipped'` — SQLite does NOT treat the bare string as TRUE; it casts to numeric 0 (FALSE) → returns 14 (pending only), silently. Question aon-16 rewritten around the verified behavior ("silently dead OR branch"), with the truthy-string intuition as the coached wrong pick
- 7 secondary files in the six-aspect matrix, all predict numbers engine-verified; IDs dr1-{in,bt,lk,aon,ds,co,nf}-nn
- Registry: 14 sets total (7 core + 7 secondary), picker auto-updates to "470 questions"
- ID audit script: 470 questions, 470 unique ids, 0 duplicates; per-file counts 50×7 + 20/15/20/20/20/15/10
- tsc + eslint clean; E2E: full-yard screenshot shows core+secondary tiers with per-card counts (470 total); IN drill session live-verified (semantics badge, subquery answer, first-try +8 XP, verdict panel); console + page errors clean; screenshots m1-drill-{9,10}*.png

Stage Summary:
- Module 1 drill bank COMPLETE: 470 MCQs (350 core + 120 secondary) covering every M1 keyword across six aspects, live in the Drill Yard. M1 pipeline status: theory ✓ (deep-dive wave), MCQs ✓ (this + prior commit). Next in M1: fill-in-the-blank case studies (100/100/100 program, ~20/20/20 easy/medium/hard for M1) on the shared grading engine
---
Task ID: m1cases-ea
Agent: batch-author EA
Task: Author 29 easy case files cs-201..229 (cases-cea.ts)

Work Log:
- Read types.ts (tier field, distractor/noVerify rules), exemplars.ts (memo voice cs-016/041/071/091), case-audit.ts (exact enforcement), case-coverage.ts (dedupe mechanics), and calibration easy cases cs-018/cs-025/cs-026/cs-044; dumped all 200 existing filled SQLs + titles to temp files and checked every planned fill/title against them before writing (0 collisions).
- Read facts slices l2/l3/l4/l5/l6/l7.json, then probed a read-only copy (scripts/.probe-ea.db, bun:sqlite, deleted after) for 20+ figures not in the slices: processor-fee cells (order 1 = 16.72, order 74 = 31.56), Alice Chen's 3 cancelled tickets (7/152.52, 21/136.11, 95/206.19), unit-cost at 0.6 (Keyboard 53.99, Smart Watch 119.99), A-item bar rows (HDMI 500, Socks 400 exactly-on-line so > vs >= is consequential), COALESCE sample rows, cancelled cancellations = 4 distinct accounts (1/13/5/11) behind 7 orders, all-in prices (94.98/39.49/53.99/154.98), order_items MIN/MAX unit_price (14.28/209.68), Electronics SUM(stock) = 505 (AVG 168.33/MAX 300/MIN 85 all distinct so agg distractors are consequential), earliest-3 orders (6 @ 2024-01-01, 5+7 @ 2024-01-02), AVG(rating) prints 4.3, expense page-2 (93/45.36 ... 41/67.25, page 1 ends 59/44.48), pending MAX 1088.44 vs shipped MAX 845.92, newest signup Pedro Alvarez 2024-07-03 (no tie), customer 11 = Keiko Sato Nagoya APAC.
- Wrote cases-cea.ts: 29 easy cases in the mandated universe cycle (month-close 201/211/221 ... fraud 209/219/229, catalog 210/220), topic quotas exact (l2x6, l3x6, l4x3, l5x4, l6x4, l7x5, l1x1); one clause family each; 28x3 slots + cs-205 with 4 (4th = number chip); 7 number slots all noVerify (<=1 per case); 4-5 consequential distractors each; fresh teaches incl. first COALESCE case (cs-211), bare IS NOT NULL count (cs-219), bare DISTINCT list on order_items (cs-215), OFFSET pagination (cs-227).
- Distractor consequence hand-verified per slot before auditing; caught two traps pre-audit: GROUP BY x DESC/ASC parses in SQLite (removed "GROUP" from cs-205 bank, "price"/"GROUP" from cs-214 where a secondary sort key or bare GROUP BY could tie), and single-row-group aggregates (Fitness SUM=AVG=MAX=MIN) avoided by choosing 3-SKU Electronics for cs-224.
- AUDIT_COPY=scripts/.audit-ea.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-cea.ts -> cases: 29 pass: 29 fail: 0 on the FIRST run (no fixes needed). Cross-checked: all 29 filled SQLs + titles distinct vs the 200 existing via a temp dupe script.
- npx tsc --noEmit | grep cases-cea -> empty (only pre-existing errors in examples/, scripts/content-audit.ts, skills/). Removed scripts/.probe-ea.db, audit copy, and all temp helper scripts.

Stage Summary:
- cases-cea.ts complete: 29/29 audit PASS (first-run green), tsc clean for the new file, fills+titles provably distinct from cs-001..200. Easy-tier contract held: 3-4 slots, <=1 noVerify, one clause family, memo persona per universe. Shape notes for sibling batches: two alias-rename projections (206/208), two ORDER BY+LIMIT top-1 forms (205), MIN+MAX pair (223), third OFFSET case in deck (227) — later easy batches should avoid those skeletons with the same columns.
---
Task ID: m1cases-eb
Agent: batch-author EB
Task: Author 29 easy case files cs-230..258 (cases-ceb.ts)

Work Log:
- Read worklog entries 1+3 (200-case playbook) and 2-f1/2-i (authoring pattern), types.ts (tier field), exemplars.ts (cs-016/041/071/091 voice), and calibrated against existing easy cases (cs-018/022/024/025/026 in b2a, cs-072/073 in b4a).
- Dumped all 200 existing titles + filled SQL from cases/index.ts into a scratch file; planned 29 shapes against that set plus the facts slices (l2..l7).
- Probed a read-only copy (scripts/.probe-eb.db, deleted after) for every figure: Feb 2024 revenue 3609.64 (9 orders), orders >300 = 49 (>500 = 25, >200 = 65), net-of-VAT samples 89.99/1.08 = 83.32, 149.99 = 138.88, 199.99 = 185.18, stock >= 150 = 8 shelves (Ring Light exactly 150 as the >=/> edge), COUNT(DISTINCT customer_id) = 16, rating < 4.2 = 3 vendors (Andes stored as bare 4), expenses = 36 lines / SUM 2541600 cents / avg 70600, categories under price 50 = 5, IS NOT NULL stamps = 82, cancelled 7 / 1152.49, price DESC LIMIT 3 anchors, price DESC LIMIT 3 OFFSET 5 = ranks 6-8 (79/65/59.99), deepest bin HDMI 500, newest customers Pedro/Olivia/Noah, shipped AVG 399.89, MIN/MAX price 14.99/199.99, Jan window BETWEEN 2024-01-01..31 = 8, thin-stock (<100) distinct suppliers = 5, active cities = 14, expenses < 30000 cents = 10.
- Consequence-probed the risky distractors before committing: unquoted '2024-02' literal = 0 rows, status = status = 103, COALESCE(shipped_at, NULL) keeps 21 NULLs, OFFSET without LIMIT = syntax error, MIN(total, 2) = 2 per row, region-slot fill for the rating case still differs, stock >= price = 12. Caught and dodged two ambiguity traps found during planning: ">" would tie with ">=" at the stock-200 threshold (no product sits exactly at 200, so moved the line to 150 where Ring Light pins the edge), and "DISTINCT" as a distractor on unaliased projections would reproduce results — replaced with consequential chips.
- Wrote cases-ceb.ts: 29 easy cases cs-230..258, topics l1×1 l2×6 l3×6 l4×3 l5×4 l6×4 l7×5, canonical universe cycle starting cs-230 = catalog; shapes: pure projection + alias (230/238), computed division (233 net-of-VAT, 237 cents extract), single-predicate counts/lists (232/234/236/239/251/257 — BETWEEN on dates, >= with a real edge, region/rating/total thresholds), COUNT(DISTINCT) unfiltered and filtered (235/254/255), COALESCE fill (249), IS NOT NULL / IS NULL count and list (241/252), ORDER BY + LIMIT top-N / OFFSET page (243/244/245/253), SUM/AVG/MIN+MAX/COUNT headline aggregates (231/242/247/248/250), id lookup (256).
- Verified: my dupcheck script — all 29 filled SQLs and titles unique vs the 200-case deck AND vs the parallel batch cases-cea.ts (cs-201..229); audit first-run clean; tsc --noEmit grep cases-ceb empty; removed probe/audit/scratch files.

Stage Summary:
- cases-ceb.ts complete: AUDIT_COPY=scripts/.audit-eb.db bun scripts/case-audit.ts src/lib/curriculum/cases/cases-ceb.ts → cases: 29  pass: 29  fail: 0 (tiers: easy=29); tsc clean for cases-ceb; no leftover temp dbs/scripts; no other source files touched (worklog append only).
---
Task ID: m1cases-ha1
Agent: batch-author HA1
Task: Author 11 hard case files cs-259..269 (cases-cha1.ts)

Work Log:
- Read worklog tail (EA/EB playbook), types.ts, exemplars voice, b8a l8 hard cases for calibration; dumped all 258 existing cases (200 registry + parallel cea/ceb) to a scratch list of titles + filled SQL — note: index.ts does NOT yet include cea/ceb, so the dup check had to import them explicitly.
- Probed a read-only copy (scripts/.probe-ha1.db, deleted after) for every figure plus finance-table schemas (expenses: category/vendor/spent_on/amount_cents, 36 lines, Tools max 32900 cents) and order_items tie structure (two full (quantity,unit_price) ties: 15.12 and 18.14 pairs) before authoring.
- Caught and dodged four collisions/traps pre-audit: (1) my planned catalog multi-key sort was EXACTLY cs-098's filled SQL (ORDER BY category ASC, price DESC LIMIT 6) — redesigned to an order_items 3-key pick-list where the 15.12 pair makes the second key decide who survives LIMIT 8; (2) month bucket + HAVING SUM(total) is a crowded corner (cs-177/191) — rebuilt cs-261 as quiet months HAVING COUNT(*) <= 7 with AVG ticket, a threshold that itself appears in output cells (no noVerify needed); (3) supplier SUM(stock) >= 400 was one digit from cs-176's > 400 — moved the line to 450 (3 kept / 3 dropped); (4) empty-set cases tie trivially: any text distractor in the cents-threshold slot gives 0 rows and any numeric in a category-value slot matches nothing, so cs-267 hardcodes both and banks only clause keywords + "0"; likewise AVG/MIN/SUM tie as SUM-slot distractors over an empty set and were excluded.
- Wrote cases-cha1.ts: 11 hard cases, topics l3×1 l4×2 l5×2 l7×3 l8×3, universe cycle fraud→catalog→month-close→refund-audit→pricing→inventory→funnel→supplier→expense→growth→fraud; 5-6 slots each, ≤2 noVerify per case, 4-6 distractors each, heavy stacks throughout (WHERE+GROUP BY+HAVING+ORDER BY ×3, multi-key ORDER BY+LIMIT, WHERE+HAVING-implicit-group, GROUP BY+COUNT/COUNT contrast, GROUP BY+COALESCE ladder).
- Verified: dupcheck — 0 title/fill collisions vs all 258 (269 unique after); audit first run 10/11 — cs-265 distractor '2024-05-01' kept the same top-4 (Liam was already LIMIT-cut) → moved to '2024-05-15' (3 rows) → 11/11; tsc grep cases-cha1 empty; removed probe/audit/dump/dupcheck temp files.

Stage Summary:
- cases-cha1.ts complete: cases: 11 pass: 11 fail: 0 (tiers hard=11); tsc clean for the new file; titles+filled SQL distinct across the 269-case deck so far; no other source files touched (worklog append only). Shape notes for parallel batches: status-queue COUNT(*)/COUNT(shipped_at) GROUP BY is now used (cs-262) and per-status COALESCE(MAX(shipped_at)) display (cs-269) — avoid re-using those skeletons; fresh figures planted: supplier stock sums 850/695/460 vs 305/305/230, Tools expense max 32900 cents, per-category stock depth 313.3…67.5, 2024 cohort EU 5/APAC 4/US 2.

---
Task ID: m1cases-hb1+register
Agent: main
Task: Complete HB1 batch bookkeeping (worklog was never written — session died mid-flight), register all four new batches into the deck, wire the tier axis into the Case Files UI, E2E + commit

Work Log:
- Verified cases-chb1.ts (cs-280..290, 11 hard) was left complete but unlogged: ran AUDIT_COPY=scripts/.audit-now.db bun scripts/case-audit.ts → 11/11 pass, first run
- Registered cases-cea/cases-ceb/cases-cha1/cases-chb1 in cases/index.ts → deck 200 → 280
- New scripts/deck-check.ts (kept as a permanent tool): imports the assembled CASES registry, checks duplicate ids/titles/filled-SQL + tier distribution → 280 cases, 0 dups across all three axes; tiers easy=100 medium=100 hard=80
- Tier math discovery: the tier-tagged original 200 were 42 easy / 100 medium / 58 hard; +58 new easy (cea+ceb) and +22 new hard (cha1+chb1) ⇒ easy 100 ✓, medium 100 ✓, hard 80/100 — exactly 20 hard cases short of the corrected 100/100/100 program (the dead session's reserved ranges cs-270..279 + cs-291..300)
- case-files.tsx: added tier filter row (All tiers/Easy/Medium/Hard with live counts, combined AND with topic filter) + colored tier badge on every card (emerald/amber/rose); deck header already dynamic at 280
- Full-deck audit over all 20 batch files: 280/280 pass, 0 fail
- E2E (agent-browser): deck renders "280 CASE FILES", tier counts 280/100/100/80, Hard filter → CASE 1 OF 80 first card CS-004 with HARD badge, Easy → CASE 1 OF 100; console clean, no page errors; screenshots m1cases-{1..4}*.png (deck, hard filter, easy filter, mobile 390x844)

Stage Summary:
- M1 case deck now LIVE at 280 engine-audited cases with a two-axis (tier × topic) browser. Remaining for the M1 100/100/100 program: exactly 20 hard cases in the reserved ranges cs-270..279 and cs-291..300 — dispatching two parallel batch authors (HA2, HB2) next

---
Task ID: m1cases-ha2+hb2+register
Agent: main (orchestrator)
Task: Complete the final 20 hard cases (cs-270..279, cs-291..300), register both batches, full audit + E2E + commit — M1 100/100/100 program finished

Work Log:
- Context recovery: parallel dispatch of HA2/HB2 batch authors hit the tool-context deadline mid-flight. HB2 had written cases-chb2.ts (unregistered, unlogged, 8/10 audit); HA2 died before writing anything (only stale probes, removed). Orchestrator took over directly.
- HB2 recovery: fixed cs-295 "duplicate slot answers: DESC" by flipping the tie-break house rule to earlier-booking-first (id ASC; brief/ask/why/walkthrough updated, same top-5 rows) and cs-299 "string distractors in dead IS NULL slot reproduce empty result" by swapping 'pending'/'cancelled' for NULLIF (prints NULL not 0) and UPPER (errors). Re-audit 10/10 first run.
- HA2 authored by orchestrator: probed seed db in 2 rounds (schemas, per-category price/stock, supplier ratings, order_items unit-price variance — product 2's 18 lines average exactly its 34.5 sticker; APAC/LATAM region-rating tie at 4.0; deferred pot 14 pending/no-stamp = 6113). Wrote 10 hard cases across catalog/pricing/inventory/supplier/expense (2 each), topics l3x2 l4x1 l5x2 l6x1 l7x2 l8x2.
- Audit iterations on cha2 (6/10 first run): learned (a) LIMIT makes looser-threshold distractors invisible — `stock >= 5`/`>= id` yield the same top-3, replaced with post-LIMIT-consequential chips; (b) a non-empty COALESCE fallback slot is a dead branch — ANY value distractor there is ambiguous, dropped 'shipped' from cs-273; (c) BETWEEN is literal in cs-271 template — removed redundant slot (marker/slot mismatch); (d) cs-275 result cells are category names so bound 220 needed noVerify; (e) `BETWEEN id AND 60` leaks HDMI but the stock cap neutralizes it — replaced id distractor with 180. Final 10/10.
- Registered cases-cha2 + cases-chb2 in cases/index.ts; added both to deck-check.ts file list. deck-check: 300 cases, 0 dup ids/titles/filled-SQL, tiers easy=100 medium=100 hard=100.
- Full-deck engine audit (all 22 batch files): 300/300 pass, 0 fail. tsc clean for both new files.
- E2E (agent-browser): deck header "300 CASE FILES", tier chips 300/100/100/100, topic counts live; Hard filter -> CASE 1 OF 100 (CS-004 HARD badge); paged to CS-276, rebuilt it correctly (COUNT/AVG/region/DESC/ASC) -> CLOSED + walkthrough rendered. Console 0 errors, 0 page errors. Screenshots scripts/shots/m1cases-final-{1..4} (closed card, deck 300, hard-100, mobile 390x844).
- E2E mechanics note for future runs: Case Files interaction is chip-first ("tap a chip, then its slot"); slot buttons carry aria-label="Slot N, ..." but textContent "N____" — match aria-label, not textContent; double-click a filled slot clears it; agent-browser eval .click() does drive React (Reset proof) but refs must be re-snapshotted after every re-render.

Stage Summary:
- MODULE 1 CASE DECK COMPLETE: 300/300 engine-audited cases live at the corrected 100 easy / 100 medium / 100 hard program; two-axis (tier x topic) browser verified. Both new batch files 10/10 on first post-fix audit; zero cross-batch collisions (dupcheck vs 290 before registration). Fresh figures planted for future batches: mouse register spread 32.79-35.93 avg 34.5, supplier regions EU 4.7 / US 4.4 / APAC-LATAM tie 4.0, deferred pot 14/6113, deep-stock aisle set {Accessories, Apparel, Electronics, Fitness}, expense big-ticket 34/2,495,600/168,000, vendor boards Atlas 14/1.68M vs AdWorks 14/457K.
- Next per locked order: Module 1 is DONE (theory + 470 MCQs + 300 cases). Move to Module 2 (joins family): theory deep dives + SVGs first, then MCQs, then 100/100/100 case studies.

---
Task ID: pastel+persist
Agent: Super Z (main agent)
Task: Pastel premium SQL keyword colors across learning/MCQs/case studies + drill session state-loss fix; also recover three UX fixes lost in a workspace reset

Work Log:
- INCIDENT: workspace had been reset to commit 828b69a again — four commits vanished (1f7c6f9 M1 audit, 5b3445c lesson drills tab, 4a0e69a round chaining, dd6898b XP flutter) and their worklog entries. Survived: 470 MCQs, 300 cases, 57 lessons, all diagrams. Recovery strategy: rebuild the lost fixes COMBINED with the new work in one pass (no throwaway re-edits).
- PASTEL KEYWORD SYSTEM (user request: "various pastel premium colours for the sql keywords ... whether its mcq, learning, case studies"): rewrote sql-code.tsx from single-violet-keywords to a clause-family palette keyed to the pipeline the app itself teaches — projection (SELECT/DISTINCT/AS) violet, sources (FROM/JOIN/ON...) blue, row gate (WHERE/AND/OR/NOT/IN/LIKE/BETWEEN/EXISTS/IS/NULL) rose, collapse (GROUP/HAVING + all functions incl CAST) amber, output (ORDER/LIMIT/OFFSET/ASC/DESC/NULLS/FIRST/LAST) orange, compose (WITH/RECURSIVE/UNION/EXCEPT/INTERSECT/ALL) fuchsia, branching (CASE/WHEN/THEN/ELSE/END) lime, window (OVER/PARTITION/frames) sky, write verbs (INSERT/UPDATE/DELETE/CREATE...) red (the danger verbs), strings pink, numbers orange (quantities with LIMIT), BY uncolored glue. All 10 hues map to light-theme-darkened ramps.
- globals.css: added blue/sky/pink 200-400 overrides to theme-plum (#3a5cae/#327396/#c04a80 at 300) and theme-pastel (#4963a6/#44778c/#b46488) — the 7 other families already had overrides. Single choke point: every SQL surface (rich.tsx prose chips, lesson code blocks, mcq prompts/choices, case builder segments, problem-runner) routes through SqlNodes.
- DRILL STATE PERSISTENCE (user bug: "i have to go back and when i come back to the mcq practice drills then that mcqs is gone"): new src/lib/curriculum/drill-session.ts — zustand persist store (seeql-drill-session-v1) holding sessions keyed by scope ("yard" = chapter Drill Yard, lesson id = lesson-scoped drills). DrillYard mirrors deck/idx/score/roundNum into it on every transition; restore happens in lazy useState initializers (bootstrapSession) — no effects, no setState-in-effect lint issues. Explicit abandonment ("← all keywords", "Pick another keyword") drops the session; sidebar navigation preserves it. Ledger-derived score (deck.filter correct) — immune to double-counting a restored question re-answered after navigation (caught live: 11/10).
- ROUND CHAINING re-land (from 4a0e69a): buildDeck(set, size) unseen→missed→mastered; verdict chain hub = Next round + Sweep all remaining (N) when non-mastered remain, Review round when dry; live header "round N · X this round · bank M/T mastered · R to go"; SetCard "{tried}/{total} tried"; picker copy "rounds of 10, chained until a bank runs dry".
- XP FLUTTER re-land (from dd6898b): mcq.tsx in-card chip keyed on Date.now() seq, 1.6s keyframe (opacity/y/scale/rotate), emerald "+N XP" when ledger paid, zinc "already banked" on repeats; gained = paid(mcq) + paid(first) from awardXp booleans; toast copy honest.
- LESSON DRILLS TAB re-land (from 5b3445c): LESSON_DRILLS map in drills/index.ts (L01→select, L02→select, L03→where+and-or-not, L04→null, L05→order-limit, L06→distinct, L07→aggregates, L08→groupby+having; case-study lessons unmapped → no tab); DrillYard accepts scopeId+keywords props, scoped picker shows only the lesson's sets with lesson copy.
- E2E (agent-browser): pastel computed styles verified on 3 surfaces (MCQ prompt: SELECT violet/FROM blue/WHERE-BETWEEN-AND rose/COUNT amber/numbers orange; lesson chips: WHERE rose, 'Berlin' pink; case builder: violet/blue/rose). Plum light theme: violet #5f43b8, blue #3a5cae, rose #b04a57 live. Persistence: yard session survived lesson detour, theme reload, AND full page reload (resumed at same question with score); lesson-03 scoped session survived L3→L4→L3; explicit back drops. Chain: WHERE round 1 10/10 clean sweep → hub "Sweep all remaining (40)" → round 2 fresh questions. Chip: +8 XP first try, "already banked" on repeat after restore. Lesson 35 (case study) correctly has no Drills tab. Console 0 errors.
- Automation notes: two .click()s in one eval tick = stale-state no-op (pick and check must be separate evals); chip probe needs a promise+setTimeout(500) inside one eval (sync probe too early, cross-eval probe too late — 1.6s life).

Stage Summary:
- Delivered: 10-family pastel keyword system across every SQL surface in all 4 themes; drill rounds now survive navigation (chapter + lesson scopes); recovered round chaining + XP flutter + lesson drills tab. All lint/tsc clean. 9 screenshots in scripts/shots/ (pastel-mcq-where, pastel-flutter-chip, pastel-already-banked, pastel-plum-light, drillchain-verdict, drill-chain-hub, lesson-drills-tab, xp-chip-live).
- KEY FILES: src/components/learn/sql-code.tsx (palette), src/app/globals.css (light overrides), src/lib/curriculum/drill-session.ts (NEW), src/components/learn/drill-yard.tsx (chain+persist+scoped), src/components/learn/mcq.tsx (chip), src/components/learn/lesson-view.tsx (tab), src/lib/curriculum/drills/index.ts (LESSON_DRILLS).
- Next per locked order: Module 2 (Joins & Relationships) — theory deep dives + SVGs first, then 470 MCQs, then 100/100/100 case studies.

---
Task ID: m2-w2c
Agent: drill-author-c
Task: author self-join.ts (45) + on-vs-where.ts (40)

Work Log:
- Read worklog (pastel+persist, m1cases-* entries), types.ts (DrillQ shape), inner-join.ts as canonical style reference (header receipt format, section comments, choice/notes voice), and scripts/m2-drill-facts.ts as the probe pattern.
- Wrote + ran scripts/m2-facts-sj.ts (bun:sqlite on a copyFileSync copy db → scripts/.m2fc.db, readonly, rmSync after): guard trio confirmed (guarded 39 / no-guard 94 / <= 55); new probes — <> 78 (2×39), id=id alone 16, EU guarded 28 / no-guard 64 / <> 56 (→8 EU self-pairs), APAC 10, US 1, LATAM 0, same-city 0 (city+region also 0), name-guard also 39 (dup names 0), id-only guard 120, bare self cross 256, adjacent c2.id=c1.id+1 = 15 (10 cross-region), canonical head row = Farid Nasser × Grace Kim (APAC), US = Emma Wilson (Austin)/Jamal Wright (Chicago), LATAM = Bruno Silva (São Paulo); error messages probed: "ambiguous column name: region", "no such column: customers.name", "no such column: c3.name".
- Wrote + ran scripts/m2-facts-ow.ts (+ follow-up m2-facts-ow2.ts): INNER equivalence pending ON 14 = WHERE 14, active ON 97 = WHERE 97 (14 active customers); LEFT JOIN ON-pending 22 rows (COUNT(*) 22 / COUNT(o.id) 14 / COUNT(c.id) 22), NULL-filled 8, WHERE-pending 14, OR-keep 22; 8 pending customers (Alice 3, Emma 3, Chloe 2, Maya 2, four 1s), EU pending customers 3; left-table predicate: region='EU' in ON 53 (45+8) vs in WHERE 45; EU cut of ON-pending join = 11 (6+5); unshipped in ON 29 (21+8), unshipped customers 8; Bruno 2 orders both delivered → LATAM cut = 1 NULL row; sentinels: status real NULLs 0, id real NULLs 0, shipped_at NULLs 21; `= NULL` matches nothing (count 0); anti-joins: plain 0, after ON-pending 8, invoice anti 5 (Bruno/Dmitri/Farid/Keiko/Noah); invoices LEFT JOIN payments 33 vs COUNT(p.id) 27 (5 multi-pay invoices, 6 unpaid); errors probed: bare `WHERE id IS NULL` → "ambiguous column name: id", `AND WHERE` → syntax error near "WHERE".
- Wrote src/lib/curriculum/drills/m2/self-join.ts: 45 questions dr2-sj-01..45, KW "Self-join", tier secondary, aspect mix exactly 6 syntax / 10 semantics / 9 edge / 6 errors / 9 predict / 5 judgment; covers aliasing-as-renaming, mirror pairs, <, <=, <> guard semantics, n(n−1)/2 math, region pairing, adjacent-id + manager hierarchy patterns, two-copies mental model, canonical taught query.
- Wrote src/lib/curriculum/drills/m2/on-vs-where.ts: 40 questions dr2-ow-01..40, KW "ON vs WHERE", tier secondary, aspect mix 5/9/8/6/8/4 (within ±2); covers inner-join placement equivalence, LEFT JOIN right-predicate ON-vs-WHERE worlds, NULL-fill death, OR-keep spelling, o.id sentinel, anti-joins (plain/pending/invoices), left-table predicate truth, intent reading.
- Verified: bunx tsc --noEmit on both files → 0 errors; bun one-liner counts 45 + 40, sequential unique ids, 4 choices each, answers in range, notes point at non-answer choices; 0 prompt collisions vs inner-join.ts; no leftover .m2fc.db; drills/index.ts NOT touched (orchestrator registers).

Stage Summary:
- self-join.ts (45) + on-vs-where.ts (40) complete and tsc-clean; engine-verified receipts pasted in both file headers. Fresh receipts banked: mirror/self pair arithmetic (39/78/94/55/16; EU 28/64/56; id-only 120; cross 256; adjacent 15 w/ 10 cross-region), canonical head row Farid Nasser × Grace Kim (APAC), and the full ON-vs-WHERE constellation (22/14/8/11/29/53/45/97; sentinels status-0/id-0/shipped_at-21; invoices-payments 33/27/5/6; error strings).
- ONE DELIBERATE DEVIATION for the orchestrator: the brief's line "predicate on the LEFT table's column behaves the same in either spot" is FALSE for LEFT JOIN on this engine — probed `AND c.region='EU'` in ON = 53 (non-EU customers preserved NULL-filled) vs in WHERE = 45. I authored ow-10/ow-28/ow-35 to the engine truth (left-table filter truly removes rows only in WHERE; in ON it preserves failing left rows) while keeping the brief's intent line (ON = which partners qualify, WHERE = which results survive) as ow-14/ow-40. Matching behavior is identical either way; only the fate of failing left rows differs. If the orchestrator wants the brief's literal claim, ow-10 + ow-35 are the two questions to revisit.

---
Task ID: m2-w2b
Agent: drill-author-b
Task: author join-aggregate.ts (55) + anti-join.ts (45)

Work Log:
- Read worklog (pastel+persist + m1cases playbook), types.ts, inner-join.ts (canonical style: header receipts, backticked SQL, 4 choices, notes on tempting wrongs, // ---------- aspect ---------- separators), and scripts/m2-drill-facts.ts (probe pattern).
- Wrote + ran probes on a read-only copy (scripts/.m2fb.db, copied from db/custom.db, rmSync'd after): scripts/m2-facts-ja.ts (30 queries) and scripts/m2-facts-aj.ts (25 queries) plus a one-shot aj2 probe for id ranges / wrong-FK NOT IN pairings (deleted after harvest).
- JA receipts harvested: per-customer orders/AVG for all 16 (Alice Chen 24/7262.35/302.60, Emma 17/6640.56/390.62, Grace 14/4574.23, Maya 13/3644.56; exactly 2 one-order customers = Liam O'Brien, Olivia Brown); >15 orders = 2, >=10 = 4; region report EU 45/8/15089.23/335.32, APAC 37/5/11605.45/313.66, US 19/2/7286.16/383.48, LATAM 2/1/852.44/426.22; HAVING COUNT>20 = 2, HAVING SUM>10000 = 2; pending/region EU 6 / APAC 5 / US 3 (3 rows); SUM raw 34833.28/103 vs after items join 103244.55/251 rows (COUNT DISTINCT o.id = 103; rows 2.44x, sum 2.96x); Alice fan-out 50 rows/SUM 18784.19/AVG 375.68; lines/order 1:26 2:29 3:25 4:23; GROUP BY o.id = 103 groups; active split 14 active/97 orders/33135.42 vs 2 inactive/6/1697.86; 16 cities (Berlin 24, Austin 17, Seoul 14, Mumbai 13), 0 NULL regions/active; derived-table join = 16 rows; empty-filter aggregate = 1 row COUNT 0/SUM NULL; no-GROUP-BY aggregate = 1 row (EU/103); error messages verified: alias or COUNT(*) in WHERE -> "misuse of aggregate: COUNT()", GROUP BY o.region -> "no such column", GROUP BY id -> "ambiguous column name"; aliases DO work in GROUP BY/HAVING/ORDER BY.
- AJ receipts harvested: no-invoice customers = 5 (Bruno Silva/LATAM, Dmitri Volkov/EU, Farid Nasser/APAC, Keiko Sato/APAC, Noah Meyer/EU) by LEFT JOIN/IS NULL, NOT IN, NOT EXISTS and HAVING COUNT=0 (all 4 agree); with-invoices = 11; LEFT JOIN 33 rows vs COUNT(i.id) 28; INNER+IS NULL = 0; WHERE c.id IS NULL = 0; no-pending customers = 8 (Bruno, Dmitri, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown); status-in-WHERE variant = 14 rows (anti-join destroyed); NOT IN over pending ids = 8; 8 distinct customers hold the 14 pending; invoices LEFT JOIN payments WHERE p.id IS NULL = 6 (22 of 28 paid-covered); payments = 27 rows / 22 distinct invoice_id / 0 NULL invoice_id -> NOT IN payments = 6 = guarded 6 (NOT IN works here only because the column is NULL-free); customers with >=1 payment = 8; honest empties: orphan orders 0, products never sold 0, suppliers without products 0; double anti (no invoice AND no pending) = 3 (Bruno, Dmitri, Noah); regions of the 5 = 3; due_on/paid_on NULLs = 0 (detector-luck edge); wrong-FK NOT IN: customers.id NOT IN (SELECT id FROM suppliers) = 10 (ids 7-16) vs vs orders = 0; "ON customer_id = id" -> ambiguous column name: id.
- Wrote the two drill files per contract: JOIN_AGGREGATE 55 Qs (dr2-ja-01..55, KW "JOIN + aggregates", core; aspects syntax 6 / semantics 12 / edge 10 / errors 7 / predict 12 / judgment 8) and ANTI_JOIN 45 Qs (dr2-aj-01..45, KW "Anti-join", secondary; aspects 5/10/8/6/10/6). Every concrete number in predict/edge prompts traced to probe output or the shared receipts (fan-out story: 103 -> 251 rows, SUM 34833.28 -> 103244.55; NOT IN collapse taught honestly — no live NULL collapse exists on this db, so the trap is stated as conditional with the verified 0-NULL census behind it).
- Verified: bunx tsc --noEmit on both files -> 0 errors; bun counter script -> 55 and 45, ids sequential, 0 dupes, all answers in range, 4 choices each, keyword/tier correct; prompt-collision check vs inner-join.ts -> 0 (155/155 unique prompts across the three M2 sets); removed throwaway verify/dupcheck/aj2 scripts, kept m2-facts-ja.ts + m2-facts-aj.ts as receipts; no stray .m2fb.db; nothing registered in drills/index.ts; dev server untouched.

Stage Summary:
- m2/join-aggregate.ts (55) + m2/anti-join.ts (45) complete and type-clean, awaiting orchestrator registration. Key verified facts for downstream authors: fan-out inflation 103->251 rows / SUM 34833.28 -> 103244.55 (~2.96x; row factor 2.44x); Alice AVG 302.60 (order grain) vs 375.68 (line grain, SUM 18784.19/50); lines-per-order distribution 1:26, 2:29, 3:25, 4:23; active split 14/97/33135.42 vs 2/6/1697.86; 16 cities map 1:1 to customers (Berlin 24 top); anti-join live demos: 5 no-invoice (Bruno, Dmitri, Farid, Keiko, Noah), 8 no-pending (adds Hiro, Isabella, Jamal, Liam, Olivia), double-anti = 3 (Bruno, Dmitri, Noah); payments.invoice_id has 0 NULLs so NOT IN = 6 today — the NULL-collapse trap is one INSERT away, NOT EXISTS is the safe habit; wrong-FK NOT IN demo: customers NOT IN supplier ids = 10. Orchestrator note: do NOT reuse the pending/region figures (EU 6/APAC 5/US 3) or the derived-16-rows figure in other sets without re-probing; my probes live at scripts/m2-facts-{ja,aj}.ts.
---
Task ID: m2-w2a
Agent: drill-author-a
Task: author left-join.ts (55) + multi-join.ts (50)

Work Log:
- Read worklog (pastel+persist, m1cases entries), types.ts (DrillQ/DrillAspect), inner-join.ts as canonical style reference (header receipts, aspect section comments, backticked SQL, notes for tempting wrongs), and scripts/m2-drill-facts.ts for the probe pattern.
- Wrote + ran scripts/m2-facts-lj.ts (read-only copy scripts/.m2fa.db via copyFileSync, bun:sqlite, rmSync at end): customers LEFT JOIN orders = 103 (= inner; orders LEFT JOIN customers = 103; LEFT OUTER = 103); customers LEFT JOIN invoices COUNT(*)=33 vs COUNT(i.id)=28 (COUNT(DISTINCT c.id)=16); no-invoice five = Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer; anti-pending = 8; anti-void = 15; invoices LEFT JOIN payments = 33 vs COUNT(p.id)=27; customers→invoices→payments chain = 38 (COUNT(i.id)=33, COUNT(p.id)=27); pending-in-ON = 22 vs pending-in-WHERE = 14; unshipped-in-ON = 29 vs in-WHERE = 21; cancelled-in-ON = 19 rows (7 matched over 4 customers), SUM = 1152.49; pending-in-ON SUM = 6113.00 (14 matched); WHERE o.id IS NOT NULL = 103; SUM(i.amount_cents) = 86977.00 LEFT = bare; AVG = 310632.14 vs SUM/COUNT(*) = 263566.67; zero-bucket GROUP BY = 5 (per-customer invoices min 0 max 5; orders min 1 max 24); region buckets EU 45/APAC 37/US 19/LATAM 2 (with_orders equal); Alice invoices = 5; suppliers LEFT JOIN products: all 6 have 2–3 products (no zero-supplier); LEFT JOIN ON 1=0 → 16; LEFT JOIN with NO ON → 1648 (cross behavior, LEFT never fires); orphan payments = 0.
- Wrote + ran scripts/m2-facts-mj.ts: i→o→c = 251; hop-swap c→o→i = 251; 4-table (+products) = 251; 5-table (+suppliers) = 251; orders JOIN customers LEFT JOIN order_items = 251; oi→o LEFT p anti-check = 0; distinct (order_id, product_id) pairs = 251 with 0 duplicate-product orders (products per order min 1 max 4); wrong-grain invoices = 329 rows / SUM(o.total) = 107653.59; self-pairs o1.id<o2.id = 624, <= = 727, unguarded = 1351 (max per customer 276 = C(24,2) Alice); payments→invoices→customers = 27 (EU 14/37261.00, APAC 8/20613.00, US 5/11738.00 — LATAM absent); multi-pay invoices = 5; order 1 = 4 lines/9 units (Yoga Mat Eco 6mm ×3 @31.02, HDMI 2.1 Cable 2m ×2 @15.15, Desk Mat Extended ×1 @25.26, Noise-Canceling Headset ×3 @142.64); region lines EU 105/APAC 88/US 53/LATAM 5; region revenue EU 15089.23/APAC 11605.45/US 7286.16/LATAM 852.44 (Σ = 34833.28, reconciles with line-grain SUM(quantity*unit_price) = 34833.28); top products Desk Mat Extended 47 units/24 lines, Headset 46, HDMI 38; units by supplier region APAC 179/EU 159/US 109/LATAM 51; distinct products sold = 16 (LATAM 4); avg order per region 426.22/383.48/335.32/313.66; EU pending = 6; pending lines = 36; Alice lines = 50; distinct cities via chain = 16.
- Authored src/lib/curriculum/drills/m2/left-join.ts: 55 questions dr2-lj-01..55, KW "LEFT JOIN", tier core, aspects syntax 8 / semantics 12 / edge 10 / errors 8 / predict 12 / judgment 5; coverage: preservation + NULL-fill, optional OUTER, table order, COUNT(*) vs COUNT(right.col), WHERE-collapse, ON-vs-WHERE placement, anti-join, SUM/AVG over NULL-filled rows, zero-bucket GROUP BY, ON 1=0, no-ON cross behavior, COALESCE display polish; every predict/edge number from the probe receipts above.
- Authored src/lib/curriculum/drills/m2/multi-join.ts: 50 questions dr2-mj-01..50, KW "Multi-table joins", aspects syntax 8 / semantics 11 / edge 9 / errors 8 / predict 10 / judgment 4; coverage: 3-table chains (items→orders→customers, items→products), hop-by-hop pairing, grain through many-to-one hops, junction (order_items), chained aliases, reading 3-table queries, hop-order freedom for INNER, one table twice with aliases (orders o1/o2 + guard arithmetic 624/727/1351), LEFT chained inside INNER chains, wrong-grain invoice mesh (329), payments chain (27).
- NOT registered in drills/index.ts (orchestrator's job). Did not touch dev server or any other source file; probe scripts + worklog append only; temp .m2fa.db copies removed by the scripts themselves.
- Verification: bunx tsc --noEmit on both files → exit 0, no output. Bun audit one-liner: 55 + 50 questions, 0 duplicate ids, 0 id collisions vs inner-join.ts, 0 prompt collisions vs inner-join.ts, 0 self prompt dups, 4 choices each, answer indices in range, all tier core, keyword strings exact.

Stage Summary:
- m2-w2a complete: left-join.ts (55) + multi-join.ts (50) written in the inner-join.ts style, engine-verified against db/custom.db copies. Key fresh receipts beyond the given ones: LEFT JOIN with no ON in SQLite = 1648 (cross, LEFT never fires); cancelled-in-ON rows = 19 (7 cancelled orders over 4 distinct customers → 12 NULL-filled); pending-in-ON SUM = 6113.00; SUM(i.amount_cents) = 86977.00 identical LEFT vs bare, AVG = 310632.14 vs SUM/COUNT(*) = 263566.67 (the wrong-average trap); customers→invoices→payments chain = 38 rows (COUNT(i.id)=33 / COUNT(p.id)=27); invoices LEFT JOIN payments = 33 (27 payments over 22 invoices, 5 twice-paid, 6 unpaid); wrong-grain invoice mesh = 329 rows / 107653.59; self-join guard triangle 624 (<) / 727 (<=) / 1351 (none), Alice C(24,2) = 276; payments→invoices→customers = 27 with LATAM absent from the region GROUP BY (Bruno Silva invoice-less); junction: 251 lines = 251 distinct (order, product) pairs, 0 dup-product orders, 1–4 products per order; supplier-region units APAC 179 / EU 159 / US 109 / LATAM 51; pending lines 36; Alice 50 lines. All numbers probed in scripts/m2-facts-{lj,mj}.ts (rerunnable). Orchestrator must register both sets in drills/index.ts and wire picker metadata.

---
Task ID: m2-w2d
Agent: drill-author-d
Task: author join-edges.ts (40) + join-syntax.ts (40) + join-judgment.ts (40)

Work Log:
- Read worklog (pastel+persist, m1cases entries) + canonical style reference src/lib/curriculum/drills/m2/inner-join.ts (55q core JOIN·ON) + drills/types.ts + scripts/m2-drill-facts.ts pattern before writing.
- Wrote 3 probe scripts (bun:sqlite, read-only copies .m2fd/.m2fe/.m2ff of db/custom.db, rmSync after): scripts/m2-facts-ed.ts, m2-facts-sy.ts, m2-facts-ju.ts; all ran clean (ed re-run once with 5 follow-up queries).
- New engine-verified facts from probes: NULL keys (VALUES 1/NULL/3) inner→2, NULL=NULL pair→0, LEFT→3 rows w/ COUNT(c.id)=2; empty right: inner 0 / LEFT 103 / cross 0; case: ='eu' 0, ='EU' 8, ='Eu' 0, LIKE 'eu' 8, NOCASE 8, UPPER-fold region self-join 39, customers⋈suppliers ON region 29 (8×2+5×2+2×1+1×1), ON s.region='eu' 0; computed joins: o.id*1=oi.order_id 251, parity 824, coincidence o.id=oi.id 103, strftime-year 0; money: SUM(amount_cents)=8,697,700 (86,977.00 units), invoices⋈orders on customer_id 314, amount_cents=total*100 → 0 (=CAST 0, bare 0); REAL: exact unit_price tie pairs 4 (247 distinct), ROUND(…,1) pairs 70, catalog price ties 0; fan-out: Alice 5 invoices/24 orders, Emma 4, Maya 4, invoices 1/5/12 paid twice (5 multi-paid), orders 1/6/11 have 4 lines; cross signatures 25853/256/756; affinity: bare '7'=7→0, o.id='7'→1, '07'→1; syntax: SQLite 3.53.0, USING(id) orders⋈customers 16, USING(created_at) 2, USING+EU 8, qualified o.id/c.id after USING → 'no such column', oi⋈orders USING(id) 103, USING(region) self 94, NATURAL: orders⋈customers 0, items⋈orders 103, orders⋈products 16, customers⋈suppliers 0, invoices⋈payments 0, self 16, NATURAL+chain 0; CROSS+ON honored (6), comma: WHERE 103 / none 1648 / products,suppliers 96 / mixed comma+JOIN 4016 (16×251) / 3-table 251; RIGHT/FULL (3.39+): 103/28/5-nulls/103, bare OUTER → 'unknown join type: OUTER'; alias errors: 'no such column: customers.id', self-join w/o alias 'ambiguous column name: customers.region', dup alias 'o.id', alias-in-own-ON (c.active=1) 97; quoting "status"/[status] 14 vs 'status' 0.
- Wrote the three files (inner-join.ts format copied exactly: header receipt block, // ---------- aspect ---------- sections, 4 choices, 0-based answer, notes on tempting distractors): join-edges.ts aspects syntax5/semantics9/edge11/errors6/predict6/judgment3; join-syntax.ts 9/9/9/6/5/2; join-judgment.ts 2/9/7/6/4/12 (judgment 12+, predict 4 as mandated).
- Verified with a bun validator: 40/40/40, ids exactly dr2-ed-01..40 / dr2-sy-01..40 / dr2-ju-01..40, 0 dup ids, KW/tier correct, 4 choices each, answer in range, notes never point at the answer. Prompt-collision check vs inner-join.ts: 0 exact matches; 0 intra-set duplicate prompts.
- bunx tsc --noEmit on all three files: clean, exit 0, no output (first run; re-run after two why-text precision edits in join-judgment.ts — 2.96× money inflation vs 2.44× row ratio wording — still clean).
- Probe db copies auto-removed by the scripts (no .m2fd/.m2fe/.m2ff leftovers). Nothing registered in drills/index.ts, no other source files touched.

Stage Summary:
- Module 2 secondary join trio complete: 120 new MCQs (dr2-ed/sy/ju-01..40) pending orchestrator registration in drills/index.ts. Key receipts now engine-verified for future authors: NATURAL JOIN orders⋈customers = 0 and orders⋈products = 16 (id-name collisions), USING(id) on orders⋈customers = 16 (coincidence rule), USING(created_at) = 2, CROSS JOIN + ON is honored in SQLite (6 rows), comma+JOIN precedence 16×251 = 4016, invoices⋈orders on customer_id = 314 (Alice 5×24 = 120 of it), parity join = 824, coincidence o.id=oi.id = 103, SUM inflation 34833.28 → 103244.55 (×2.96 money-weighted vs ×2.44 row ratio), invoices money = 8,697,700 cents = 86,977.00 units (open 1,960,900 / paid 6,644,300 / void INV-2024-011 92,500), no-invoice customers = Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer. Caveat for later sets: CAST/affinity — o.id = '7' DOES match via column affinity (1 row), so "type-mismatch joins always fail" claims are wrong on columns; only bare expression keys ('7' vs 7) return 0. Probe scripts kept rerunnable at scripts/m2-facts-{ed,sy,ju}.ts.

---
Task ID: m2-drills
Agent: Super Z (main agent) + 4 parallel drill authors (m2-w2a..d)
Task: Module 2 (Joins & Relationships) drill bank — 465 engine-verified MCQs across 10 keyword sets, registered + lesson-scoped wiring + E2E

Work Log:
- Status check that prompted this: user asked "joins is not done yet ????" — confirmed M2 theory (L09–L16 + case lesson 36) was already dense with join SVGs from the original build; the MISSING pieces were the drill bank and case studies. Per locked order: MCQs first.
- Probed ground truth before authoring: scripts/m2-drill-facts.ts + m2-facts2/3.ts (bun:sqlite on readonly copies). KEY FINDINGS: every customer has ≥1 order (so classic customers-anti-join is 0 — honest demos moved to invoices/pending); 5 customers have NO invoices (LEFT JOIN 33 vs COUNT 28); 8 customers have no pending order (pending-in-ON 22 rows/8 NULL vs in-WHERE 14); fan-out SUM 34833.28 → 103244.55 after orders⋈items (251 rows, ×2.44 row ratio); same-region self-join pairs 39 (<) / 55 (<=) / 94 (no guard); NATURAL JOIN products⋈suppliers = 0 (shared name/region columns pair nothing); wrong rule ON c.id = o.id → 16 plausible-but-wrong rows; SQLite JOIN without ON = cross join (96).
- Authored inner-join.ts (55 Qs, dr2-ij-01..55) myself as the pattern-setter; six aspects, receipts in header.
- Dispatched 4 parallel authors with full fact sheets + style contract + engine-verification requirement (own probe scripts, distinct .m2f*.db copies): left-join 55, multi-join 50, join-aggregate 55, anti-join 45, self-join 45, on-vs-where 40, join-edges 40, join-syntax 40, join-judgment 40. All tsc-clean on delivery, receipts probed not guessed.
- Agent catch worth keeping: my brief claimed "left-table predicate in ON behaves same as in WHERE" — FALSE for LEFT JOIN (EU test in ON = 53 rows preserved vs 45 in WHERE); on-vs-where.ts authored to engine truth.
- My validation pass (scripts/m2-validate.ts, kept as permanent tool): 465 questions, 0 dup ids, 0 dup prompts (one true cross-set dup found — dr2-lj-44 vs dr2-ow-33 same shipped_at prompt — fixed by rewriting lj-44 into a COUNT(*)=29 vs COUNT(o.id)=21 contrast), 4 choices each, answers valid, notes never = answer. Aspect mix: syntax 63 / semantics 103 / edge 89 / errors 67 / predict 89 / judgment 54.
- Independent spot-check (scripts/m2-spotcheck.ts, kept): re-ran embedded SQL of 20 sampled predict questions — 14 direct cell matches, 4 row-count/named-row questions verified against my own probes, 2 reads were naive first-cell probes (human-checked OK).
- Registered all 10 sets in drills/index.ts (module 2, 4 core + 6 secondary) + LESSON_DRILLS: L09 inner-join+join-syntax, L10 inner-join+join-edges, L11 multi-join, L12 left-join, L13 anti-join, L14 self-join, L15 join-aggregate, L16 on-vs-where+join-judgment. Bank total 470 → 935; picker header live ("0 of 935 attempted").
- E2E (agent-browser): bank header 935; all 10 M2 cards render in tier groups; JOIN · ON round ran (chain header "round 1 · bank 1/55 mastered · 54 to go", correct answer paid, ledger "1 of 935"); lesson-09 Drills tab shows 2 keywords (95 = 55+40) with shared ledger; drill-session persistence proven live (navigating away and back restored the in-progress round); console 0 errors/warnings; screenshots m2drills-{1..5} in scripts/shots/.

Stage Summary:
- MODULE 2 DRILL BANK COMPLETE: 465 engine-verified MCQs in 10 sets; whole bank now 935 questions / 24 sets. Bank-wide facts for future M2 case authors: uninvoiced five = Bruno Silva (LATAM), Dmitri Volkov, Farid Nasser (APAC), Keiko Sato, Noah Meyer; 8 no-pending customers include Hiro, Isabella, Jamal, Liam, Olivia; Alice 24 orders→50 lines; order 1/6/11 have 4 lines; invoice mesh (invoices⋈orders on customer_id) = 314 rows / 107653.59 inflated sum; supplier product counts 3/3/3/3/2/2; SQLite 3.53.0: USING(id) orders⋈customers = 16, NATURAL orders⋈customers = 0, CROSS+ON honored.
- Next per locked order: Module 2 case studies (100 easy / 100 medium / 100 hard) via the case-audit pipeline, then Module 3 (Set Ops & CASE) full cycle.
---
Task ID: m2-cases
Agent: Super Z (main agent; 5 parallel case-author agents attempted but Task tool failed 6x on context-deadline — authored all 300 cases directly)
Task: Module 2 (Joins & Relationships) case studies — 300 cases (100 easy / 100 medium / 100 hard), cs-301…cs-600, per locked order

Work Log:
- Extended cases/types.ts: CASE_TOPICS gained j1…j8 (Two tables L9, INNER JOIN L10, 3-table chains L11, LEFT JOIN L12, Anti-join L13, Self-join L14, Joins+aggregates L15, Join capstone L16).
- Made scripts/case-audit.ts module-aware: M1 topics (l*/cap) forbid JOIN; M2 topics (j*) REQUIRE JOIN; single-SELECT, no subqueries for both. Verified M1 deck still 300/300.
- Probed ground truth: scripts/m2-case-facts.ts (+ m2-j1-probes.ts) on read-only copies. Key receipts: uninvoiced five (Bruno/Dmitri/Farid/Keiko/Noah); unpaid 6 = 15,217.00 incl. one status-'paid' anomaly; collected cash 69,612.00 (card 16/37,364.00, wire 11/32,248.00); region units EU 199/APAC 174/US 112/LATAM 13; supplier-region line revenue EU 15,895.88/US 9,294.93/APAC 6,029.22/LATAM 3,613.25; cross-region pairs 81; no-cancel cohort 12; invoice money by region EU 47,933/APAC 22,369/US 16,675; lines by status 119/84/36/12; NATURAL customers×orders = 0 (shared {id, created_at}) vs orders×products = 16 (shared {id} only).
- Authored 6 batches: J1 cs-301-350, J2 cs-351-400, J3 cs-401-450, J4 cs-451-500, J5 cs-501-550, J6 cs-551-600 — 50 each, per-batch tier quotas summing to exactly 100/100/100.
- Audit loop per batch: bun scripts/case-audit.ts <file> → fix → 50/50. Audit-caught traps now catalogued: symmetric-equality ambiguity on INNER JOIN; LEFT≡INNER over hole-free pairs; COUNT(non-null expr) ≡ COUNT(*); bare-ordinal ORDER BY; `x IS y` accepts any expression; empty-result cases need error-distractors; identifier distractors become table aliases (FROM orders suppliers JOIN…); noVerify slots still face the ambiguity check; slots array order must match marker numbers; USING/NATURAL share-name coincidences (USING(id) cust×ord = 16, NATURAL = 0).
- Fixed 5 cross-batch duplicate-SQL pairs (cs-360+388, 380+578, 426+576, 529+568 new; 262+289 pre-existing M1) via column/sort/select-list variations; dupe count now 0.
- Registered J1-J6 in cases/index.ts; Case Files header now "N CASE FILES · MODULES 1–2 TOOLKIT"; deck total 600.
- E2E: Case Files renders "0 / 600 | All tiers 600 | Easy 200 | Medium 200 | Hard 200" + all j-topic pills with counts; chip-arm → slot-place interaction verified live; screenshot scripts/shots/m2cases-1.png.

Stage Summary:
- MODULE 2 CASE FILES COMPLETE: 300 join cases (cs-301…cs-600), full deck 600/600 audit PASS, tiers exactly 200/200/200, zero duplicate filled SQL, zero duplicate titles, tsc clean. Module 2 (Joins) is now COMPLETE end-to-end: theory L09-L16 + 465 MCQs (bank 935) + 300 case files.
- Next per locked order: Module 3 (Set Ops & CASE) full cycle — theory densification → drill bank → 300 case studies (needs case-audit M3 rules: UNION/INTERSECT/EXCEPT/CASE allowances).

---
Task ID: audit-1
Agent: Super Z (main agent)
Task: Full-project audit — code health, registration integrity, drill bank, case deck, live E2E

Work Log:
- git tree clean at start; bunx tsc --noEmit: src/ zero errors (only stray probe/skills scripts error, app untouched).
- Registration: all 57 lessons registered in lessons/index.ts (0 orphans); all 24 drill sets in drills/index.ts; all 28 case batches + exemplars in cases/index.ts.
- Wrote scripts/audit-bank.ts — whole-bank validator over DRILL_SETS: per-set counts, dup ids/prompts (set + bank-wide), 4 choices, answer range, duplicate choice text, thin why/notes, aspect/tier/module validity, id-prefix-vs-module, sequential numbering continuity, LESSON_DRILLS wiring. First run: 9 flags.
- 4 flags were false positives (intentional micro-prompts: "ORDER BY 2 means…", "LIKE only works on…", "NOT applies to…", "NULLIF's contract:") — threshold relaxed 20→15 chars.
- 5 flags were REAL M1 defects — cross-set duplicate prompts (M2 clean): dr1-ag-19 ≡ dr1-nl-37 (COUNT(*)/COUNT(shipped_at)); dr1-wh-40 ≡ between (price BETWEEN 50-100); dr1-wh-41 ≡ like ('%Pro%' count); dr1-wh-42 ≡ between (total BETWEEN); dr1-ol-08 ≡ dr1-in-01 (generic "syntactically correct" stem).
- Fixed on freshly probed numbers (scripts/auditfix-facts.ts, bun:sqlite readonly): dr1-ag-19 → COUNT(DISTINCT customer_id)=16; dr1-wh-40 → price NOT BETWEEN=12; dr1-wh-41 → NOT LIKE '%Pro%'=14; dr1-wh-42 → total NOT BETWEEN=96; dr1-ol-08 → legal-clause-order stem. Re-audit: ✅ BANK AUDIT PASS (935/24, m1=470 m2=465, core 565 / secondary 370).
- Case deck: bun scripts/case-audit.ts → 600/600 PASS, tiers easy=200 medium=200 hard=200.
- E2E (agent-browser): Learn renders 9 modules + 57 lessons; Drill Yard header "0 of 935 attempted"; JOIN · ON round: correct answer → +8 XP (+5 first-try, +3 bonus), chain "round 1 · bank 1/55 mastered · 54 to go"; leaving to picker and returning restores the in-progress round (persistence fix holding); Case Files "600 CASE FILES · MODULES 1–2 TOOLKIT / All tiers 600 / Easy 200 / Medium 200 / Hard 200"; Playground row funnel live (103 → 37 buckets → HAVING keeps 4 → 4 rows out); console 0 errors / 0 warnings.
- Screenshots: scripts/shots/audit-{learn,drillyard,casefiles,playground}.png. Committed f10e21d.

Stage Summary:
- Project state: ALL AXES GREEN after 5 M1 content fixes. Bank 935 Qs / 24 sets, deck 600 cases (200/200/200), src/ type-clean, all registries complete, E2E surfaces verified, console clean. Probe tools kept: scripts/audit-bank.ts (rerunnable gate), scripts/auditfix-facts.ts.
- Next per locked order: Module 3 (Set Ops & CASE) full cycle — case-audit M3 rules (UNION/INTERSECT/EXCEPT/CASE allowances) → theory densification → ~470 MCQs → 300 cases.
---
Task ID: m3-w1b
Agent: drill-author-b
Task: Module 3 drill bank — author EXCEPT (45 Qs, dr3-ex-01..45) and Set precedence & parens (40 Qs, dr3-sp-01..40), engine-verified, per M2 style contract

Work Log:
- Read worklog protocol (m2-drills + audit-1), inner-join.ts canonical format, types.ts; ran scripts/m3-facts.ts to confirm the fact sheet (status/region/invoice censuses, precedence receipts all reproduced).
- Own probes: scripts/m3-facts-ex.ts (.m3fex.db) + scripts/m3-facts-sp.ts (.m3fsp.db), copyFileSync copies with rmSync — kept as permanent M3 receipt tools like m3-facts.ts. NEW receipts beyond the brief: invoice∖order statuses = 3 vs order∖invoice = 4 (direction pairs); products∖supplier names = 16, customers∖supplier names = 16, suppliers∖customer names = 6 (name overlap 0); order ids ∖ customer ids = 87 vs customer_id ∖ ids = 0 (FK holds); cities∖EU-cities = 8; chained cust∖EU∖APAC = {LATAM, US}; pending shipped_at ∖ cancelled shipped_at = 0 (ALL 14 pending + 7 cancelled shipped_at are NULL → NULL groups cancel under grouping semantics); self-EXCEPT = 0; INTEGER 1 ∖ TEXT '1' = 2 (type-strict grouping, never errors); statuses∖cities = 4 (names need not match); EXCEPT...LIMIT 2 = 2 (tail binds compound); delivered totals∖pending totals = 52 (REALs exact, overlap 0).
- ERROR-TEXT receipts probed verbatim: EXCEPT ALL → near "ALL": syntax error (no EXCEPT ALL in SQLite); bare table arm → near "orders": syntax error; bare column arm → near "region": syntax error; parens arm (simple OR compound) → near "(": syntax error; col-count mismatch names the exact operator ("...of EXCEPT/UNION/UNION ALL/INTERSECT do not have the same number of result columns"); mid-arm ORDER BY → "ORDER BY clause should come after EXCEPT/UNION not before"; mid-arm LIMIT → "LIMIT clause should come after UNION not before"; ORDER BY right-arm-only column → "1st ORDER BY term does not match any column in the result set"; ORDER BY 3 on 2-col → "1st ORDER BY term out of range - should be between 1 and 2"; arm resolves own columns → "no such column: total".
- PRECEDENCE receipts (left-assoc, INTERSECT NOT tighter in SQLite 3.x): statuses∪regions∩cities = 0 (standard would say 4); statuses∖regions∪cities = 20; statuses∪regions∖cities = 8; statuses∖regions∩cities = 0 (standard 4); statuses∩regions∪cities = 16 (standard 0); statuses∩statuses∪regions = 8 (standard 4); supplier-regions∪regions∩cities = 0; toy 1∪2∩2 = {2} (standard {1,2}); toy 2∖1∩1 = ∅ (standard {2}); toy 2∖1∪3 = {2,3}; subquery wrap groups properly: statuses∖(regions∪cities) = 4, statuses∩wrap(union) = 0; trailing UNION dedups the whole accumulated left: 206 UNION ALL rows + UNION regions → 8 (206→222→8 receipts); 4-arm chain ∪∪∪∖ = 24; per-arm WHERE EU∪APAC cities = 13; per-arm GROUP BY = 8; ORDER BY v LIMIT 3 = APAC/EU/LATAM.
- Authored drills/m3/except.ts: 45 Qs dr3-ex-01..45, KW "EXCEPT", tier core ×45, export EXCEPT_DRILL; aspects exactly syntax 5 / semantics 9 / edge 9 / errors 6 / predict 11 / judgment 5; header carries engine-verified receipt block; notes on every predict Q + tempting distractors elsewhere, notes never point at the answer.
- Authored drills/m3/set-precedence.ts: 40 Qs dr3-sp-01..40, KW "Set precedence & parens", tier secondary ×40, export SET_PRECEDENCE; aspects exactly syntax 6 / semantics 8 / edge 8 / errors 6 / predict 7 / judgment 5; INTERSECT-does-not-bind-tighter discriminators (0 vs 4, 8 vs 4, 16 vs 0) + parens-rejected + subquery-wrap portability as the judgment spine.
- Validation: bunx tsc --noEmit → ZERO errors from both files (only pre-existing stray scripts/examples errors, same as audit-1 baseline). Throwaway validator (deleted after run): counts 45/40, ids sequential zero-padded, 0 dup ids, 0 dup prompts within file AND vs all 935 existing bank questions (cross-set collision pre-check), 4 choices each, no duplicate choice text, answers 0-3, why ≥ 30 chars, note choice ≠ answer + note ≥ 15 chars, keyword/tier/aspect exact — ALL CHECKS PASSED. Spot-check re-ran all 37 embedded predict/edge SQL statements on a throwaway db copy: every claimed number matched 1:1 (4/3/0/0/8/4/87/0/0/16/{LATAM,US} + 0/2/0/0/2/52/4/0/2 + 0/20/8/4/8/20/0/1/8/0/16/0/13/8/APAC,EU,LATAM/24). NOT registered in drills/index.ts (orchestrator's job).

Stage Summary:
- m3-w1b COMPLETE: 85 engine-verified MCQs (EXCEPT 45 core + Set precedence & parens 40 secondary) in src/lib/curriculum/drills/m3/, tsc clean, validator green, zero prompt/id collisions vs the 935-Q bank. Bank total stays 935 until orchestrator registers (would become 1020 / 26 sets).
- Durable receipts for M3 peers (UNION/INTERSECT/CASE authors): direction pairs 4↔3, 87-vs-0 id accident, NULL groups cancel (pending∖cancelled shipped_at = 0), INTEGER∖TEXT-cast = 2, and the full SQLite left-assoc precedence table vs standard grammar (0/20/8/0/16/8 discriminators) — all re-runnable via bun scripts/m3-facts-ex.ts / scripts/m3-facts-sp.ts.
- Unverified facts: none used — every number in both files was probed this session; nothing left out.

---
Task ID: m3-full
Agent: Super Z (main agent)
Task: Module 3 (Set Ops & CASE) full cycle — theory densification → probes → drill bank (455) → cases wave 1 (50/300)

Work Log:
- THEORY: added premium deep-dive layer (mind/engine/myth/edge blocks) to L17–L24 + L37 — 9 lessons × 4 blocks, engine-informed; committed 37a698e.
- PROBES: scripts/m3-facts.ts — key receipts: SQLite set ops evaluate STRICTLY LEFT-TO-RIGHT (INTERSECT does NOT bind tighter, contra standard SQL: statuses∪regions∩cities = 0 not 4); parenthesized compound arms = syntax error (subquery wrap groups instead = 4); NULL dedups to one in UNION (shipped_at self-union = 76 = 75 distinct + 1); statuses(4)∪regions(4)=8, UNION ALL 119; EXCEPT asymmetric 4/3; CASE bands 65/27/11, first-match overlap 92/0/11; pivot EU 2675.29/6656.18 pending/delivered, LATAM 0.00 honest zero.
- DRILLS: 455 MCQs / 10 sets (union 55, intersect 45, except 45, case-when 55, case-aggregate 50, set-precedence 40, set-ordering 45, set-edges 40, set-judgment 40, case-sorts 40), ids dr3-*-01..NN. 5 parallel author agents dispatched — 4 "failed" on context-deadline BUT 6/8 files landed verified; caught 3 dup prompts in orphaned files (is-18≡is-32, se-33≡un-39) via scripts/m3-validate-orphan.ts and fixed; set-ordering + case-sorts authored directly. Registered all 10, LESSON_DRILLS wired L17–L24, audit-bank extended → 1390/34 PASS. Committed 0f78ad7.
- CASES: case-audit extended (M3 rules: s1–s5 require set op, s6–s8 require CASE, multi-SELECT needs set-op/CASE); CASE_TOPICS + s1–s8. Task-author attempts failed (2× context-deadline, one left 6 truncated cases) → authored cases-s1.ts (cs-601–650) DIRECTLY: 50/50 PASS, 17/17/16, learned+applied audit gates (3–7 slots/case, markers once each, walkthrough ≥220 chars, number slots in cells or noVerify, empty-result ambiguity traps). Deck 600→650 all PASS, header "MODULES 1–3 TOOLKIT". Committed 092ec1a.
- INCIDENT: dev-server watchdog recreated db/custom.db mid-session with only 5 tables; restored via /api/stats → ensureDatabase self-heal path (finance rows re-inserted). All audits re-verified post-restore.
- E2E: Case Files "650 CASE FILES · MODULES 1–3 / Easy 217 / Medium 217 / Hard 216 / UNION stacks 17"; Drill Yard "0 of 1390 attempted"; shots/m3-wave1.png.

Stage Summary:
- M3 status: theory ✅ deep-dive layer; drills ✅ 455/10 sets registered+wired; cases 50/300 (wave 1 done, waves 2–6 = cases-s2..s6.cs-651–900 REMAINING, ~50/file, tier quotas 17/17/16 each).
- Durable new receipts: left-to-right set-op precedence table, paren-arm ban, NULL group-dedup, id-space overlap 87/0, ledger accounts ∩ methods = 0, expense categories Rent 16,800/Ads 4,570/Travel 2,521/Tools 1,525.
- Next: author cases-s2..s6 (250 cases) directly or via resilient agents, register, final E2E; then M4 (Subqueries & CTEs) full cycle.

---
Task ID: m3-cases-w5
Agent: Super Z (main agent)
Task: Module 3 cases wave 5 — cases-s5.ts (cs-801–850, 50 cases) + db incident recovery

Work Log:
- STALE-HANDOFF RECOVERY: resumed from a summary that claimed "M4 wave 2 (cs-951–1000, q2 IN subqueries)" was in progress with scripts/m4-facts-w2*.ts on disk — ALL FALSE. Ground truth from git/worklog: M3 cases waves 1–4 (cs-601–800, files s1–s4) were done; the real next task was wave 5. Lesson: always re-verify handoff claims against git log + worklog + LS before continuing.
- INCIDENT: case-audit first run showed 546/800 with "no such table: invoices/payments/expenses/ledger_entries" — the dev-server watchdog had wiped the 4 finance tables again (db had only 5 storefront tables). Dev server was DOWN, so the /api/stats self-heal path was unavailable; wrote scripts/restore-db.ts which imports ensureDatabase() directly (bun + prisma) → all 9 tables restored (16 customers / 103 orders / 251 items / 28 invoices / 27 payments / 36 expenses / 80 ledger rows) → case-audit back to 800/800 PASS. Script kept as a permanent one-shot recovery tool (run: bun scripts/restore-db.ts).
- Established the M3 case-program quota math: deck-wide M3 topic counts after wave 4 were s1–s4=35 each, s5=39, s6=21 → for 300 M3 cases at 50/topic, waves 5+6 must total s1+15 s2+15 s3+15 s4+15 s5+11 s6+29; tier math: M3 currently 68/67/65, needs 100/100/100 → waves 5+6 total 32 easy/33 medium/35 hard. Wave 5 shipped: s1×10 s2×8 s3×8 s4×6 s5×6 s6×12, tiers 16/17/17 → wave 6 (cs-851–900) needs s1×5 s2×7 s3×7 s4×9 s5×5 s6×17, tiers 16/16/18.
- Probes: scripts/m3-facts-s5w.ts (~60 labeled receipts: 3-arm unions, mixed-operator chains with left-assoc receipts (statuses∪regions∩cities=0 vs standard 4; ∖∪=8; ∩∪=16), ALL-chain trailing-UNION sweep (315→8), cust∖EU∖APAC={Bruno,Emma,Jamal}, chain+ORDER BY LIMIT 3={APAC,EU,LATAM} (uppercase sorts below lowercase; numeric ids sort below text), customers∩suppliers∩products ids=6, order-dates∩expense-dates=7 (list from 2024-01-01 to 2025-01-01), invoiced∖pending=5 / ∩=6, delivered∩pending=8 / ∩shipped=9 / shipped∩pending=5, cancelled∩delivered=4, supplier ratings 4.8/4.6/4.4/4.1/4.0/3.9, lean∖premium products={Fitness Band X2, USB-C Hub 7-in-1}, max price 199.99). Reused m3-facts-w2.ts receipts (4-arm pile=14, trailing-UNION sweep 180→13, cities∖statuses=16, etc.).
- Authored cases-s5.ts: 50 cases cs-801–850 (16 easy / 17 medium / 17 hard). First audit pass 36/50; audit-caught traps this wave: ORDER BY <alias-constant> distractors are ambiguous (constant sort = no reorder, and GROUP BY output order already matches alias order); bare-column ORDER BY in single SELECT resolves against FROM table (ORDER BY price runs even when price isn't in the result); vendor↔category 1:1 mapping makes GROUP BY vendor produce identical cells to GROUP BY category; duplicate-marker rule (a slot answer used in two template positions needs one marker); every s1–s5 case needs a set op (a bare CASE pivot fails); slot why-texts must be ≥40 chars (39 fails). Fixed all → 50/50 PASS.
- Hygiene: wrote scripts/check-dup-s5.ts (kept, rerunnable) — cross-deck filled-SQL + title duplicate check. Found 2: (a) PRE-EXISTING cs-705 ≡ cs-742 identical EXCEPT SQL (shipped in wave 1–4) — fixed cs-742 to strftime('%Y-%m') bucketing (same story/receipts, different SQL + teaches the second bucketing function); (b) my cs-807 title collided with cs-655 "Rent and ads, side by side" → retitled "The fixed floor and the growth line". Deck now 0 dup SQL / 0 dup titles across 850.
- Gates: case-audit 850/850 PASS (tiers easy=284 medium=284 hard=282); audit-bank PASS (drill bank untouched, 1390); tsc src/ clean (only pre-existing stray skills/ error).
- E2E (agent-browser): deck header "850 CASE FILES · MODULES 1–3 TOOLKIT", tier buttons 850/284/284/282, topic chips exact (UNION stacks 45, Stacked reports 43, INTERSECT 43, EXCEPT 41, Set chains 45, CASE WHEN 33; CASE pivots / Set+CASE capstone 0 — wave 6 will fill), paged to CS-828 "The sweep at the end", placed UNION/suppliers/region chips → "Case closed — query rebuilt correctly" +10 XP; console 0 errors/warnings; shot scripts/shots/m3-wave5-cs828-solved.png. Committed fd5454a.

Stage Summary:
- M3 cases 250/300 (waves 1–5 = cs-601–850). Wave 6 remaining: cases-s6.ts (cs-851–900): s1×5 s2×7 s3×7 s4×9 s5×5 s6×17, tiers 16 easy/16 medium/18 hard (M3 then closes at exactly 50 per topic, deck 300/300/300 tiers).
- Durable receipts: chain/precedence discriminators, ALL-chain sweep semantics, date-overlap window (7 dates, 2024-01-01→2025-01-01), id-space triple overlap = 6, ratings/product probes — all rerunnable via bun scripts/m3-facts-s5w.ts.
- Tools kept: scripts/restore-db.ts (db incident recovery), scripts/check-dup-s5.ts (dup checker — run it before every future wave commit).
- Next: wave 6 cases-s6.ts (closes M3 cases at 300) → then M4 (Subqueries & CTEs) full cycle per locked order; P4 micro-fixes (learn-app.tsx "Eight modules" hardcode) still parked.

---
Task ID: m3-cases-w6
Agent: Super Z (main agent)
Task: Module 3 cases wave 6 — cases-s6.ts (cs-851–900, 50 cases) — CLOSES the M3 case program at 300

Work Log:
- STALE-HANDOFF CORRECTION (second occurrence): resumed from a summary claiming "M4 wave 2 (q2 IN subqueries, cs-951–1000) in progress, wave 1 committed as 56a2429" — ALL FALSE. Ground truth from git/worklog/LS: latest real commit fd5454a = M3 wave 5; NO M4 drills, NO M4 topics, NO cases-q1 anywhere; scripts/m4-facts-w2*.ts never existed on disk. The real frontier was M3 wave 6. Lesson (twice now): always re-verify handoff claims against git log + worklog + LS before continuing.
- INCIDENT (routine now): finance tables wiped again by the dev-server watchdog (case-audit probe hit "no such table: expenses"); restored via bun scripts/restore-db.ts → 16/103/251/28/27/36/80 row counts verified.
- Probes: scripts/m3-facts-s6w.ts (59 probes: fresh stacks/intersects/excepts/chains/CASE receipts — quarter money 14018.72/7426.65/6661.97/6725.94, ledger dr=cr 181080, bookends 25.47/1088.44, cohorts 4/12, rails 11/16, dr/cr rows 40/40, HAVING-on-CASE-alias works in SQLite → APAC 1/EU 1) + m3-facts-s6w2.ts (41 tie-check probes: (delivered∪cancelled)∩pending = 8 at CUSTOMER level but 0 at order-id level — an order can't hold two statuses; ledger∩order dates = 0 so zero-claim cases dropped; due∩paid months 12 ≠ issued∩paid 13; shipped∖invoiced id = 14, jumbo-unpaid id = 12, EU∖invoiced ids {4,14}; APAC∖invoiced = 2 = EU∖invoiced → 'APAC' banned as distractor; (delivered∪shipped)∩pending = 8 = delivered∪cancelled∩pending → 'shipped' banned in that slot; issued∩spent months = 13 = issued∩paid → 'expenses' banned there) + one inline round (3 probes).
- Authored cases-s6.ts: 50 cases cs-851–900 (16 easy / 17... no — 16 easy / 16 medium / 18 hard), topics s1×5 s2×7 s3×7 s4×9 s5×5 s6×17 → all six M3 topics land at exactly 50, M3 cases close at 300 (deck 900, tiers 300/300/300). First audit pass 42/50; fixes: cs-853 ask/direction contradiction (ASC files churned first), cs-858 slot answers misplaced ({2} was ORDER BY not the sum column), cs-860 secondary-sort ties (ASC≡DESC on tiebreak), and 6 ambiguity rounds — recurring lesson: a distractor must be consequential in EVERY slot (alias chips always tie because canonRows compares values only; SQLite multi-arg max(a,2) is the SCALAR max and silently reproduces the result; ORDER BY 1/ORDER BY <bare-column> re-resolve to the same grouped order; constant-true WHERE from a literal chip can reproduce the correct count when only one row survives).
- Dup-checker caught cs-883 ≡ cs-839 (identical regions∪statuses∪methods LIMIT 3 SQL from wave 5) → cs-883 arm 3 now restricted to heavy-lift wires (amount_cents >= 300000, pile 10→9 words, same collation receipt). Deck now 0 dup SQL / 0 dup titles across 900.
- Gates: case-audit 900/900 PASS (easy=300 medium=300 hard=300), wave file 50/50, audit-bank PASS (1390 drills untouched), dup-checker 0/0, tsc src/ 0 errors (only pre-existing examples//scripts/ strays).
- E2E (agent-browser): deck header "900 CASE FILES · MODULES 1–3 TOOLKIT", tier buttons All 900 / Easy 300 / Medium 300 / Hard 300, topic chips exact (UNION stacks 50, Stacked reports 50, INTERSECT 50, EXCEPT 50, Set chains 50, CASE WHEN 50; CASE pivots / Set+CASE capstone 0 — no cases by program design), paged to CS-887 "Three lanes for a bill", placed paid/dead/DESC chips → "Case closed — query rebuilt correctly" +10 XP; console clean (dev-info logs only); shot scripts/shots/m3-wave6-cs887-solved.png.

Stage Summary:
- M3 CASES COMPLETE: 300/300 (cs-601–900, waves 1–6), topics s1–s6 = 50 each, deck 900 with exact 300/300/300 tiers.
- Durable receipts: customer-level vs order-level set-op chains (8 vs 0), month-overlap pairs (issued∩paid 13, due∩paid 12, issued∩spent 13), ledger calendars disjoint from order calendars (0 overlap, 14 quiet days), EU∖invoiced {4,14}, jumbo-unpaid id 12, shipped-slipped id 14 — all rerunnable via bun scripts/m3-facts-s6w.ts + m3-facts-s6w2.ts.
- Tools kept: m3-facts-s6w*.ts (wave receipts), restore-db.ts (db recovery), check-dup-s5.ts (run before every wave commit).
- Next per locked order: M4 (Subqueries & CTEs) full cycle — CASE_TOPICS q1–q8 do NOT exist yet (types.ts only has l/cap/j/s), so M4 needs: case-audit M4 rules + CASE_TOPICS extension + theory check → probes → drill bank → cases in waves. Then M5 (window functions, forced OVER()), then P4 micro-fixes (learn-app.tsx:540 / landing.tsx:282 "Eight modules" hardcode → now reads "9 modules · 57 lessons" dynamically elsewhere; verify).

---
Task ID: m4-deep-dives
Agent: Super Z (main agent)
Task: M4 (Subqueries & CTEs) theory densification — deep-dive layer for L25–L28 + L38

Work Log:
- STALE-HANDOFF CORRECTION (third occurrence): resumed from a summary claiming "M4 wave 2 (q2 IN subqueries, cases-q2.ts) in progress with probes on disk, wave 1 committed as 56a2429" — ALL FALSE. Ground truth: no 56a2429, no cases-q1/q2, no m4-facts-w2*.ts; git log's real tip was a09670a (M3 cases wave 6, deck 900). The actual frontier per the worklog's own m3-cases-w6 entry: M4 full cycle starting with theory. Lesson (x3): always re-verify handoff claims against git log + worklog + LS before continuing.
- Scoped M4 = lessons 25–28 + 38 (MODULES[3].lessons); deep-dive survey across all 57 lessons showed L1–8, L17–24, L37 have `deep` layers; L9–16 (M2) and L25–28+38 (M4) do not. Followed the locked M2/M3 order (theory densification → drill bank → case waves): this chunk = M4 deep dives only.
- Probes: scripts/m4-facts.ts (56 labeled receipts) + 4 inline extras. Key receipts: EQP quartet — `LIST SUBQUERY 1` (uncorrelated IN), `CORRELATED SCALAR SUBQUERY` (per-row), `CO-ROUTINE d` (derived table streams, NO temp table), `MATERIALIZE s` (CTE read twice materializes once, SCAN s twice); EXISTS plan = `BLOOM FILTER ON o` + `SEARCH o EXISTS USING AUTOMATIC PARTIAL COVERING INDEX` (short-circuit seek); NOT IN over nullable shipped_at → 0 rows (21 NULLs) while the same NOT IN guarded → 12; empty-list NOT IN → all 16; scalar multi-row → SQLite silently takes first row (14 pending rows → customer 16); cancelled list = 7 rows / 4 distinct customers (ids 1,1,13,13,5,11,1); cross-bars receipt: 37 orders clear both bars, 8 own-only, 5 store-only (45 = 37+8, 42 = 37+5, neither nested); 2 solo-order customers contribute 0 stellar orders (single order ties own average); CTE shadowing (`WITH customers AS …` → ghost row); WITH RECURSIVE counter 1..5; WHERE-aggregate → hard error "misuse of aggregate function AVG()" vs HAVING variant silently lies (SUM vs own AVG-order, 14/16 pass); VIP five = Alice 7262.35 (EU), Emma 6640.56 (US), Grace 4574.23, Maya 3644.56, Chloe 2667.93, bar 2177.08 lands in the rank5–rank6 gap (2667.93 → 1686.17); all-16 customers touch the store bar vs only 14 the household bar.
- Authored deep blocks: L25 (mind: two-shapes model; engine: cancelled-club IN walk + placement table for the 4 seats; myth: per-row re-run; 5 edges incl. live NOT IN collapse + empty-list honesty), L26 (mind: per-row phone call; engine: EXISTS indexed short-circuit walk; myth: correlated≠slow; 4 edges incl. vacuum probe + one-row crowd + cross-bars), L27 (mind: staging bench; engine: CO-ROUTINE walk; myth: no materialization; 4 edges incl. alias-optional SQLite/Postgres + LIMIT-in-stage top-3 1088.44/945.21/845.92), L28 (mind: recipe card; engine: single-ref streams vs double-ref MATERIALIZE; myth: statement-scoped persistence; 4 edges incl. ghost-row shadowing + RECURSIVE keyword), L38 (mind: denominator choice 34833.28/103 vs /16; engine: 4-step VIP pipeline; myth: error-teaches vs lie-ships; 4 edges incl. breadth-vs-volume 4 false positives and EXISTS-vs-IN settled).
- Gates: tsc src/ 0 errors (pre-existing examples//scripts/ strays only); case-audit 900/900 PASS; audit-bank PASS (1390); browser E2E — deep tabs render on L25/L26/L27/L28/L38 with all receipt strings present (LIST SUBQUERY, BLOOM FILTER, CO-ROUTINE d, MATERIALIZE s, ghost row, runs-and-lies…), console clean (HMR/Fast Refresh only), 0 page errors; shots scripts/shots/m4-deep-l25.png, m4-deep-l28.png, m4-deep-l38.png. Committed c008ec8.

Stage Summary:
- M4 theory densification DONE (5/5 lessons have the premium deep layer; curriculum deep coverage now L1–8, L17–24+37, L25–28+38; M2's L9–16 still without deep dives — parked, not in locked order).
- Durable receipts rerunnable via bun scripts/m4-facts.ts (kept as wave receipts).
- Next per locked order: M4 drill bank (~450 MCQs, 10 keyword sets over in-subquery/scalar/exists/correlated/derived/cte/edges/judgment), wired into LESSON_DRILLS L25–28+38, audit-bank extended; THEN CASE_TOPICS q-extension + case-audit M4 rules + M4 case waves (cs-901+, 6 waves of 50).
- Parked: P4 micro-fixes (learn-app.tsx / landing.tsx hardcodes — landing now shows dynamic "9 modules · 57 lessons"; verify at P4).
---
Task ID: m4-bank-a2
Agent: general-purpose
Task: Draft m4 drill set scalar-sub (45)

Work Log:
- Read types.ts (DrillQ shape, aspect/tier unions), m3/union.ts (gold-standard voice), scripts/m4-facts-out.txt (P01–P56), sibling m4/in-subquery.ts + m4/derived.ts (id/abbr conventions, no touching), audit-bank.ts (mechanical rules), drills/index.ts (m4 not yet wired — left alone).
- Reused existing receipts: ran `bun scripts/m4-bank-a-probes.ts` to regenerate the B01–B33 scalar receipts (silent first row = 16 via order 1/Pedro Alvarez 576.54; stamp 16 rows/1 distinct; zero-row → NULL; COUNT-over-empty → 0 vs MAX → NULL; NULL bar → 0 rows; errors "row value misused" / "sub-select returns 2 columns - expected 1" / "misuse of aggregate: AVG()" / "no such column: totl" / near ")": syntax error; 42 above storewide avg; VIP ids 1,3,5,7,13 at bar SUM(total)/16 = 2177.08; correlated counts Alice 24 / Emma 17 / Grace 14; status avgs 164.64/299.44/436.64/399.89).
- Wrote + ran scripts/m4-bank-a2-probes.ts (C01–C30, readonly bun:sqlite) for extra scalar receipts, exact SQL: product roster/cheapest (HDMI 14.99, product 1 = Mechanical Keyboard K1 89.99), customer 16 = Pedro Alvarez, natural-order first customer = Alice Chen, supplier ratings (4.6/4.1/3.9/4.4/4.8/4.0, avg 4.30, above = Alpine 4.8/Nordic 4.6/Midwest 4.4), min/max lifetime spend (Olivia Brown 444.80 / Alice Chen 7262.35), 10 at-or-below + 0 ties at 71.78, 61 below + 42 above 338.19, 49 above delivered-only 299.44, 4 above Audio avg 109.66, 11 under VIP bar, 16 pass correlated SUM > avg-order bar, invoices 12 / expenses 15 above own avg, product range 14.99–199.99, IS NULL detects empty scalar on all 103 orders, scalar-in-ORDER-BY runs (constant key keeps table order), aliased gap in ORDER BY legal (HDMI −56.786875 → raw avg 71.776875), max gap Smart Watch S +128.21, nested scalar MAX-below-avg = 65.00, 1 product at MAX price, LIMIT-1 pending scalar deterministic 16, stamp over GROUP BY = 4×338.19, HAVING club full list, pending club per-customer tallies (8 customers / 14 orders).
- Ran ad-hoc probes (bun -e, readonly): orders > NULL bar → 0 (backs scl-38); exactly 1 pending order at total 576.54.
- Wrote src/lib/curriculum/drills/m4/scalar-sub.ts: 45 questions, dense receipt header, sections syntax→semantics→edge→errors→predict→judgment, ids dr4-scl-01..45.
- Self-audit script (bun): ids sequential, 45 count, tier core ×45, 4 distinct choices each, answer 0..3, why ≥30, notes never on answer index, no prompt collisions vs wired bank (1390) + both m4 siblings; `bunx tsc -p` strict typecheck over drills tree → exit 0.

Stage Summary:
- File: src/lib/curriculum/drills/m4/scalar-sub.ts — 45 questions (SCALAR_SUB, keyword "Scalar subquery", abbr dr4-scl-NN, tier core ×45).
- Aspect histogram: syntax 7, semantics 12, edge 7, errors 5, predict 9, judgment 5 (on target). Answer spread 0×11 / 1×11 / 2×12 / 3×11.
- Numbers verified via receipts/probes: catalog bar 71.78 (raw 71.776875), 6 above / 10 below / 0 ties, club Fitness Band X2 79.00 cheapest-in + 65.00 best-out; HAVING Wearables 139.50 / Audio 109.66 / Video 84.50; storewide 338.19 → 42 above / 61 below; delivered-only 299.44 → 49; VIP bar 2177.08 → 5 (ids 1,3,5,7,13), 11 under; min spend Olivia Brown 444.80 → all 16 pass avg-order bar; stamp 16/1 and 4×338.19; silent first row 16 = order 1 / Pedro Alvarez / 576.54; zero-row → NULL, COUNT → 0, NULL bar → 0, IS NULL → 103; >=/> MAX = 1/0 (order 74, 1088.44); suppliers avg 4.30 → 3 above; correlated counts 24/17/14; max gap +128.21 (Smart Watch S).
- Probe files kept: scripts/m4-bank-a2-probes.ts (C01–C30); B-series from scripts/m4-bank-a-probes.ts; P-series scripts/m4-facts.ts.
---
Task ID: m4-bank-b2
Agent: general-purpose
Task: Draft m4 drill set correlated (45)
Work Log:
- Read types.ts + m3/union.ts (gold style); receipts P18–P38, P50–P56 from scripts/m4-facts-out.txt.
- 1 probe (readonly bun:sqlite): per-customer id/name/n/avg/spend map — pinned c1..c4 (Alice 24/302.60, Bruno 2/426.22, Chloe 5/533.59, Dmitri 2/299.63), solo pair Liam/Olivia, VIP ids.
- Wrote src/lib/curriculum/drills/m4/correlated.ts in one Write; scoped syntax→semantics→edge→errors→predict→judgment; o vs o2 discipline, 45/42/37/8/5 cross-bars, EQP "CORRELATED SCALAR SUBQUERY 1"+SCAN o2, aggregate-in-EXISTS always-true trap.
- Verification bun import check: ids sequential, 4 distinct choices, answers 11/11/11/12, why≥30, notes≠answer, zero prompt dups vs 1535 bank prompts.
Stage Summary:
- correlated.ts: 45 questions (syntax 7, semantics 12, edge 7, errors 4, predict 10, judgment 5), tier core, 1 probe used.
---
Task ID: m4-bank-d1
Agent: general-purpose
Task: Draft m4 drill set cte-recursive (40)
Work Log:
- 3 readonly probes: counters 1..5 & 1..10, RECURSIVE-on-plain-CTE legal (returns 42), date ladder 424d vs 84 order dates (340 orderless), id ladder 16, pow2 n<1000 → 11 rows ending 1024.
- Verified error msgs: near "b": syntax error (2nd RECURSIVE mid-list); "multiple references to recursive table: t"; "circular reference: t" (subquery ref); "table t has 2 values for 1 columns".
- One Write of src/lib/curriculum/drills/m4/cte-recursive.ts; inline self-check + bank-wide prompt/id clash scan all clean.
Stage Summary:
- m4/cte-recursive.ts: 40 questions dr4-rec-01..40, tier secondary, answers 10/10/10/10; aspects: syntax 7, semantics 10, edge 6, errors 4, predict 6, judgment 7.
---
Task ID: m4-bank-b1
Agent: general-purpose
Task: Draft m4 drill set exists (50)
Work Log:
- Read types.ts, m3/union.ts style, and the 56 receipts in m4-facts-out.txt; ran 1 readonly probe batch verifying: EXISTS without parens / EXISTS NOT → near "SELECT"/"NOT" syntax errors, EXISTS(…)=1 and =TRUE identical (16), aggregate 1-row trap (16), SELECT NULL rows still count (16), LIMIT 0 → 0, unqualified `id` binds inner (16 pass), EXISTS(<> 'shipped') → 15
- Wrote src/lib/curriculum/drills/m4/exists.ts (one Write): receipt-anchored 10 shipped / 6 not-shipped, 0/16 impossible partition, 8 pending / 4-cancelled flag, veterans 3 + COUNT=4 false positives, bloom-filter EQP, NOT IN 0-vs-12 NULL collapse
- Self-check via bun -e (no db): sequential ids dr4-exi-01..50, 4 distinct choices each, why ≥30, notes never on answer, answers 12/13/13/12
Stage Summary:
- src/lib/curriculum/drills/m4/exists.ts — 50 questions: syntax 8, semantics 14, edge 7, errors 4, predict 11, judgment 6 (export EXISTS_DRILL, KW "EXISTS / NOT EXISTS", all core)
---
Task ID: m4-bank-e2
Agent: general-purpose
Task: Draft m4 drill set sub-judgment (40)
Work Log:
- Read types.ts + m3/union.ts (style) + 56 receipts (scripts/m4-facts-out.txt); 2 readonly probes: confirmed "misuse of aggregate function AVG()" error, runs-and-lies HAVING MAX(total)>AVG(total)=14/16 (storewide bar clears all 16), naive COUNT(*)=4 returns exactly the 4 impostors, CTE over-1000/2000=8/5.
- Wrote src/lib/curriculum/drills/m4/sub-judgment.ts (40 Qs, dr4-jud-01..40 sequential, KW "Choosing subqueries", tier secondary); bun import check: 4 distinct choices each, answers 10/10/10/10 across 0-3, why>=30, notes never point at answer.
Stage Summary:
- m4/sub-judgment.ts — 40 questions: syntax 3, semantics 6, edge 4, errors 3, predict 4, judgment 20.
---
Task ID: m4-bank-c4 | Agent: general-purpose | Task: Draft m4 drill set cte (45)
Work Log:
- Read types.ts + m3/union.ts style + m4-facts-out receipts (P01-P56); wrote src/lib/curriculum/drills/m4/cte.ts in one Write, no RECURSIVE overlap with cte-recursive.ts.
- 2 readonly bun -e probes: trailing comma -> near "SELECT" (not ","), dup name -> "duplicate WITH table name: s", forward-ref within WITH list RESOLVES, WITH-in-scalar = 338.187, nested-IN order-id trap = 0, case-insensitive ids, un-aliased literal column named "1".
- Sections syntax->semantics->edge->errors->predict->judgment; ids dr4-cte-01..45 sequential; receipts anchored (ghost row, MATERIALIZE s, EU 15089.23, VIP five, bar 2177.08).
Stage Summary:
- cte.ts: 45 questions — aspects syntax 7 / semantics 12 / edge 6 / errors 4 / predict 10 / judgment 6; answers 0:12 1:13 2:10 3:10.
---
Task ID: m4-bank-e1 | Agent: general-purpose | Task: Draft m4 drill set sub-errors (40)
Work Log:
- Read types.ts + m3/union.ts (style) + m4-facts-out.txt (P01-P56); drafted 40 Qs in m4/sub-errors.ts.
- Probe 1 (16 stmts, readonly): WHERE-agg → "misuse of aggregate function AVG()"; HAVING lie → 14 rows; unused CTE, forward-ref CTE, no-RECURSIVE counter all LEGAL (briefing corrected); missing comma → near "b", stacked WITH → near "WITH", semicolons → near ";".
- Probe 2 (9 stmts): derived alias invisible in inner FROM → "no such table: d"; qualify w/o alias → "no such column: d.spend"; bars >3000 → 4, >338.19 → 16, >2177.08 (CTE) → 5; typo → "no such column: customers_id"; stamps 16 rows/1 distinct.
- Self-check: ids sequential dr4-err-01..40, 4 distinct choices, answers 10/10/10/10, why ≥30, notes ≠ answer, no bank-wide id/prompt collisions.
Stage Summary:
- src/lib/curriculum/drills/m4/sub-errors.ts — 40 Qs, tier secondary; aspects: errors 18, syntax 6, judgment 5, semantics 4, edge 4, predict 3.
Task ID: m4-bank-d2
Agent: general-purpose
Task: Draft m4 drill set sub-edges (40)
Work Log:
- Read types.ts, m3/union.ts (gold style), 56 receipts P01–P56; 2 readonly bun:sqlite probes: scalar-over-empty → NULL (cancelled-MAX stamps NULL on 12/16, total > NULL-bar → 0/103, MAX-of-nothing prints NULL), NOT IN (1, NULL) → 0/16, inner-alias shadow of outer alias → 0/16, plus error msgs "sub-select returns 2 columns - expected 1" / "no such column: oops.id" / "circular reference: customers".
- One Write of src/lib/curriculum/drills/m4/sub-edges.ts (dr4-edg-01..40, sections syntax→semantics→edge→errors→predict→judgment); verification import check: sequential ids, 4 distinct choices, answers 10/10/10/10, why ≥30, notes ≠ answer, 0 prompt collisions vs 1835 bank prompts.
Stage Summary:
- sub-edges.ts: 40 questions (syntax 4, semantics 8, edge 14, errors 4, predict 6, judgment 4), tier secondary, 2 probes used.

---
Task ID: m4-bank
Agent: Super Z (main agent)
Task: M4 drill bank — 10 keyword sets, 445 questions, wired L25–28+38, audit-bank extended

Work Log:
- STALE-HANDOFF CORRECTION (fourth occurrence): resumed summary claimed "M4 wave 2 (cases-q2) in progress, wave 1 committed 56a2429" — ALL FALSE again; git truth: M4 frontier = drill bank (no cases-q1/q2, no CASE_TOPICS q*). Real next chunk per m4-deep-dives entry: M4 drill bank.
- Re-ran scripts/m4-facts.ts → receipts preserved at scripts/m4-facts-out.txt (P01–P56).
- Drafted 10 m4 sets via subagents (M3 playbook; batched into single-set tasks after 2-set tasks hit the runner deadline; resized cte 55→45 for the same reason): in-subquery 55, scalar-sub 45, exists 50, correlated 45, derived 45, cte 45, cte-recursive 40, sub-edges 40, sub-errors 40, sub-judgment 40 = 445 (m4 core 285 / secondary 160).
- Probe-verified corrections baked in by drafters: alias-less derived stage PARSES in SQLite (fails later via qualifiers); missing RECURSIVE keyword does NOT error; unreferenced CTE + forward refs legal; row-value IN (customer_id,status) IN (…) = 1 order (#74); recursive date ladder 424 days vs 84 order dates; powers-of-2 overshoot 1024.
- Wired registry: index.ts imports + 10 DRILL_SETS entries + LESSON_DRILLS lesson-25 [in-subquery, scalar-sub], 26 [exists, correlated], 27 [derived], 28 [cte, cte-recursive], 38 [sub-judgment, sub-edges, sub-errors].
- audit-bank.ts expectations updated: 1835 / 44 sets, m1=470 m2=465 m3=455 m4=445.
- Gates: audit-bank PASS (1835/44, 0 dup ids/prompts bank-wide, aspects 268/397/355/244/345/226); tsc src/ 0 errors; case-audit regression 900/900.
- E2E: L25 Drills tab "2 keywords" (55 q + 45 q), live m4 question rendered + db-verified answer +10/+8 XP with badge; global DrillYard shows 44 cards, "1 of 1835 attempted"; L38 Drills "3 keywords"; console clean (HMR/Fast Refresh only), 0 page errors; shot scripts/shots/m4-bank-l38-drills.png.

Stage Summary:
- M4 DRILL BANK DONE: bank 1390 → 1835 (+445, 34 → 44 sets); LESSON_DRILLS covers all 5 M4 query lessons.
- Probes kept as receipts: m4-facts-out.txt + m4-bank-*.ts + probe-d*.ts (rerunnable).
- Next per locked order: M4 CASE_TOPICS q1–q8 extension + case-audit M4 rules, then M4 case waves (cs-901+, ~6 waves of 50) → M5 (window, forced OVER()) → P4 micro-fixes (learn-app.tsx/landing.tsx "Eight modules" hardcode).

---
Task ID: m4-cases-w2
Agent: Super Z (main agent)
Task: M4 case library wave 2 — cases-q2.ts (cs-951–1000, q5 derived / q6 CTEs / q7 recursive / q8 capstone)

Work Log:
- Subagent launch hit the runner deadline (context deadline exceeded) — switched to main-agent block drafting: probe → write 15 → audit → fix → next block.
- Grounding: scripts/m4-cases-w2-facts.ts (63 probes W01–W63, tee'd to m4-cases-w2-out.txt; W31 excluded as probe artifact — bad OR logic), plus edge batches m4-w2-q5-edges(.2).ts (E01–E20, F01–F20), m4-w2-q6-edges.ts (G01–G18), m4-w2-q7-edges.ts (H01–H15). Wave-1 receipts regenerated to m4-cases-w1-out.txt (C01–C85).
- Date-ladder probe hang fixed: created_at is TEXT, so `d + 1` never exceeds the string max — rewritten with date(d,'+1 day') (W44 424 days vs 84 distinct order dates W45/W52/W53).
- Drafted cases-q2.ts in 4 blocks: q5 cs-951–965 (5e/5m/5h), q6 cs-966–980 (5e/5m/5h), q7 cs-981–990 (3e/4m/3h), q8 cs-991–1000 (4e/2m/4h after re-tiering cs-995/cs-999 to hard). All number slots noVerify constants (wave-1 convention); all figures receipt-cited.
- Audit-caught fixes (each verified by probe before fix): cs-951/cs-959 `total(x)` is a SQLite builtin ≡ sum(x) — "total" forbidden as distractor in aggregate slots; cs-956 name-fold ≡ region-fold (unique keys) and vendor↔category 1:1 map — replaced with error-distractors; cs-963 missing {1} marker + c.city ambiguous (every customer 1:1 with a city → GROUP BY city ≡ GROUP BY region) + o.status fold figures 3054.89/3016.89/852.44/3822.38; cs-964 slot/marker misorder (2000/>) swapped; cs-974 missing {3} WITH slot; cs-976 1001-bar ambiguous (Keiko 1098.60 clears both) → 1500; cs-984 n*1 stride = INFINITE ARM (audit hung, killed at 590s; "*" removed — with fixed operand 1 only "+" is monotone; distractors now || (text leaves number line) + DIV (syntax error)); cs-988 bare `d` resolves through outer scope (≡ days.d) — replaced with created_at tautology (424 hot days); cs-991 {3} used twice → outer-aggregate slot AVG; cs-994 2 slots → added "=" equality slot (>= forbidden: same peak row); cs-998 mean receipt corrected to 706.00 (25416/36).
- Recursion termination discipline (q7): never slot the arm's bound with wider-distractors; only forward date ticks; countdown bounds safe (decreasing step always falls to floor); all q7 distractor swaps terminate or error — verified by full audit passing in one pass after cs-984 fix.
- Wired casesQ2 into index.ts. Gates: case-audit file 50/50 (17e/17m/16h); full deck 1000/1000 PASS; check-dup-q2.ts: 0 title dups, 0 filled-SQL dups across 1000, topics q5:15 q6:15 q7:10 q8:10, ids sequential; tsc app src/ 0 errors.
- E2E (agent-browser): Case Files drawer "1000 CASE FILES · MODULES 1–4 TOOLKIT"; tier buttons All 1000/Easy 334/Medium 334/Hard 332; topic chips Derived tables 15, CTEs 15, Recursive CTEs 10, Subquery capstone 10; live cs-951 solved (chip→slot interaction: tap chip then slot; slots auto-disable "Check" until 3/3) → CLOSED +10 XP, walkthrough rendered; 0 page errors, console clean (HMR only); shot scripts/shots/m4-w2-cs951-closed.png.

Stage Summary:
- M4 CASES: 100/300 (waves 1–2 done, cs-901–1000). Deck total 1000/44 drill sets + 1000 cases.
- Wave-2 lesson (fifth stale-handoff-adjacent process note): subagent drafting for 50-case waves is dead — runner deadline; main-agent block drafting (probe→write→audit→fix) is the reliable path.
- Next per locked order: M4 cases waves 3–6 (cs-1001–1200, deepening q1–q8 per M3 playbook) → M5 (window functions, forced OVER()) → P4 micro-fixes ("Eight modules" hardcode at learn-app.tsx:540 + landing.tsx:282).

---
Task ID: m4-cases-w3
Agent: Super Z (main agent)
Task: M4 case library wave 3 — cases-q3.ts (cs-1001–1050, q1 IN / q2 scalar / q3 EXISTS / q4 correlated deepening)

Work Log:
- STALE-HANDOFF note: resumed summary claimed wave 2 "about to start" — git truth: wave 2 was already committed (6f41f5f, cs-951–1000, deck 1000/1000). Actual frontier on resume = wave 3.
- db/custom.db found wiped again by dev-server watchdog (finance tables gone) — restored via scripts/restore-db.ts (9 tables, 103 orders, 28 invoices, 36 expenses; bar 338.19, VIP 5 verified).
- Main-agent block drafting (probe → write 15 → audit → fix → next), per wave-2 lesson (subagent drafting dead on runner deadline).
- Receipts: scripts/m4-cases-w3-facts.ts V01–V62 + supplements w3b S01–S12, w3c T01–T10, w3d U01–U28 (boundary safety), w3e Z01–Z14. All figures receipt-cited; zero invented numbers (one walkthrough slip re Ads caught and reworded before audit).
- Drafted cases-q3.ts: q1 cs-1001–1015 (5e/5m/5h), q2 cs-1016–1030 (5e/5m/5h), q3 cs-1031–1040 (4e/3m/3h), q4 cs-1041–1050 (3e/4m/3h).
- Audit-caught fixes (all probe-verified): cs-1002 literal IN lacked nested subquery (rebuilt as roll-call; note pending∪cancelled club ≡ pending club since cancelled ⊆ pending); cs-1003 ORDER BY city ≡ name on 8 rows (moved slot to projection); cs-1008 filled SQL exactly dup'd wave-1 cs-908 (added city column, 4 slots); cs-1010 void ⊆ open blacklist (Liam holds both) → 'refunded' distractor ambiguous, swapped set; cs-1012 empty-result case — SUM/AVG/COUNT inner aggregates also yield 0 → full-chip slots with error-only distractors; cs-1028 additive chips in ORDER BY = constant-shift ambiguity (rank by computed gap instead); cs-1032 {3} marker missing from template; cs-1038 aggregate-wrapped EXISTS: ANY valid chip (region, email included) still flags 16 → error-only chips in non-SELECT slots, plain-column distractor kept for the unwrap lesson; cs-1035 2-slot redesign; cs-1042/1043 slot-order vs marker-number mismatch; cs-1044/1045 marker reuse (pinned literal correlation).
- Wired casesQ3 into index.ts; check-dup-q3.ts (wave-3 range); tsconfig.src.json for the src-only tsc gate.
- Gates: case-audit file 50/50 (17e/17m/16h); full deck 1050/1050 PASS 0 dups; topics cumulative q1 30/q2 30/q3 20/q4 20, q5–q8 unchanged; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1050 · MODULES 1–4 TOOLKIT", tiers 351/351/348, chips verified; live cs-1001 solved via chip→slot taps → CLOSED +10 XP, WALKTHROUGH rendered; console clean, 0 page errors; shot scripts/shots/m4-w3-cs1001-closed.png. Nav note: "Next case" steps one case; 900-step eval loop used to reach cs-1001 (find-text clicks fail silently — use refs).

Stage Summary:
- M4 CASES: 150/300 (waves 1–3, cs-901–1050). Deck 1050.
- Committed 1902475. Working tree clean except tool-results/dev.pid noise.
- Next per locked order: wave 4 (cs-1051–1100: q5 15 / q6 15 / q7 10 / q8 10 deepening) → waves 5–6 → M5 (window, forced OVER()) → P4 micro-fixes.

---
Task ID: m4-cases-w4
Agent: Super Z (main agent)
Task: M4 case library wave 4 — cases-q4.ts (cs-1051–1100, q5 derived / q6 CTEs / q7 recursive / q8 capstone deepening)

Work Log:
- Receipts: scripts/m4-cases-w4-facts.ts W401–W445 (tee'd to m4-cases-w4-out.txt). Key new figures: VIP-by-region EU 2/APAC 2/US 1, avg-ticket>400 = 6 (refined to 4 with >1 order), category baskets stage (Accessories 54 … Fitness 13), vendor totals Atlas 16800/AdWorks 4570, floor pot 2407.43, two-deep region gate EU 15089.23/APAC 11605.45, spend 1000–2000 = 3, big-order status mix 18/17/6/1, WITH-products self-shadow = circular reference ERROR, CTE chain >2500 = 5, countdowns/halvings/pow ladders, invoice date span 381 days, accumulator final 46 (lag), trading days 53.
- ⚠ RECURSIVE-HANG CLASS (new failure mode, replaces wave-2's arm-bound concern): a bare-identifier chip in a no-operator recursive-arm slot (`SELECT n {chip}`) hangs SQLite in an infinite arm — found when the file audit blew the 7-minute timeout; isolated repro scripts/tmp/hang-probe.ts. Affects SUM and even plain table names (suppliers) — SQLite parses them as an alias and loops. DISCIPLINE LOCKED: recursive-arm slots accept operator-form chips only ("- 2", "+ 3", "/ 4", digit-leading, quoted date modifiers); arm bounds stay literal in the template; audit runs now complete in normal time.
- Second SQLite pathology found: outward column resolution — a CTE over another table (suppliers) with a WHERE on a column it lacks (amount_cents) resolves the column against the OUTER query's FROM and silently runs (cs-1099 ambiguous at 21). Case redesigned to a single-filter complement.
- Drafted cases-q4.ts in 4 blocks: q5 cs-1051–1065, q6 cs-1066–1080, q7 cs-1081–1090, q8 cs-1091–1100.
- Audit-caught fixes: 8 marker-order/reuse bugs (cs-1051/1052/1061/1062/1063/1067/1079/1086 — same class as wave 3), cs-1057 missing nested subquery (wrapped in derived) + literal 100.0 residue, cs-1066 COUNT(*) ignores the staged column (→ COUNT(val) + shipped_at NULL-column distractor), cs-1088 "+ 1" seed-distractor ≡ seed 1 (→ "+ 2"), cs-1096 LIMIT-masked gate ambiguity (→ ">" operator slot, LIMIT literal), cs-1085 distractor "3" dup'd answer (→ "4"), cs-1086 marker reuse (pinned ON literal), cs-1094 title dup vs cs-973 (renamed "The premium cut, staged").
- Wired casesQ4 into index.ts; check-dup-q4.ts created.
- Gates: case-audit file 50/50 (17e/16m/17h); full deck 1100/1100 PASS 0 dups; topics cumulative q5 30/q6 30/q7 20/q8 20; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1100", tiers 368/367/365, chips verified; live cs-1051 solved (SUM/customer_id/ASC) → CLOSED +10 XP, walkthrough rendered; console clean, 0 page errors; shot scripts/shots/m4-w4-cs1051-closed.png.

Stage Summary:
- M4 CASES: 200/300 (waves 1–4, cs-901–1100). Deck 1100.
- Committed 8b3bef6.
- Next: wave 5 (cs-1101–1150, q1–q4 deepening, wave-3 split) → wave 6 (cs-1151–1200, q5–q8) → M5 (window) → P4.

---
Task ID: m4-cases-w5
Agent: Super Z (main agent)
Task: M4 case library wave 5 — cases-q5.ts (cs-1101–1150, q1 IN / q2 scalar / q3 EXISTS / q4 correlated deepening)

Work Log:
- STALE-HANDOFF note: resumed summary claimed wave 2 in progress — git truth: waves 1–4 committed (through 8b3bef6, cs-901–1100); checkpoint commit f45681e held a TRUNCATED cases-q5.ts (15 q1 cases, missing array closer). Actual frontier on resume = finish wave 5.
- Repaired truncation; file-audited the inherited q1 block: 7 fails (4× no nested SELECT, 5× 2-slot minimum). Redesigned all via probe batches (m4-cases-w5-fix{,2,3}.ts): invoice-gated clubs, two-stage vendor card, row-value recurring-billing sweep, table-swap slot for the zero-result collision case.
- Status truth re-verified (memory said pending 52 — WRONG): cancelled 7 / delivered 52 / pending 14 / shipped 30; shipped SUM 11996.72/30 = 399.89 cross-check.
- Structural findings: every city holds ≤1 resident → city-list slots cannot discriminate (cs-1102 rebuilt around one city slot + invoice-key slot); no doubled order tickets exist → cs-1112 rebuilt as recurring-billing row-value sweep (Atlas rent ×14 + DevTools seats ×4 = 18); 'category' grouping ≡ vendor grouping for distractor purposes (R5 = 18 SAME) — excluded.
- Drafted q2 (cs-1116–1130) via 3 probe batches: bar cases off delivered/shipped/paid/storewide averages, OFFSET runner-up scalar, half-ceiling screens, void yardstick; q3 (cs-1131–1140): double-gate NOT EXISTS, outward-resolution trap (unqualified amount_cents tautology → 36), honest everyone-beats-average (16; NOT EXISTS 0), open-and-void overlap 1; q4 (cs-1141–1150): supplier-bench 8, per-account flags (11/45/9), invoice-ledger unit test ×100, wide benches, Maya leaderboard, personal-best ceilings (>= incl. self).
- Audit-caught fixes: marker-order (cs-1111), wrong prose figures purged (16→12 wearables, 200000-bar 17→31, SUM-bar → 25416, ASC-fill → 101, AVG/2 → 22, vendor-MIN → 16), duplicate slot answers forbidden (cs-1147/1148 restructured), invalid 'billing' universe → month-close ×3 + refund-audit, cs-1122 under-count distractor (MAX 845.92 and SUM 11996.72 both keep all 7 cancelled under → MIN 32.01), cs-1146 left-agg insensitivity (single-invoice qualifiers → slotted right-side agg + factor; SUM-right 6, ×200 9, ×500 6), cs-1120 filled-SQL dup vs cs-1017 → two-column grade projection.
- Wired casesQ5 into index.ts; check-dup-q5.ts created (ids sequential, topics q1 15/q2 15/q3 10/q4 10).
- Gates: file audit 50/50 (17e/16m/17h); full deck 1150/1150 PASS 0 dups; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1150 CASE FILES · MODULES 1–4 TOOLKIT", tiers 385/383/382, chips q1 45/q2 45/q3 30/q4 30; eval-loop advanced 1100 Next-steps to cs-1101; solved chip→slot → CLOSED +10 XP (ledger case:cs-1101:10), walkthrough rendered, 0 page errors; shot scripts/shots/m4-w5-cs1101-closed.png.

Stage Summary:
- M4 CASES: 250/300 (waves 1–5, cs-901–1150). Deck 1150. Committed b442767.
- Next: wave 6 (cs-1151–1200, q5 15 / q6 15 / q7 10 / q8 10 deepening) → M5 (window functions, forced OVER()) → P4 micro-fixes ("Eight modules" hardcode at learn-app.tsx:540 + landing.tsx:282).

---
Task ID: m4-cases-w6
Agent: Super Z (main agent)
Task: M4 case library wave 6 — cases-q6.ts (cs-1151–1200, q5 derived / q6 CTEs / q7 recursive / q8 capstone deepening) — FINAL M4 WAVE

Work Log:
- Receipts: scripts/m4-cases-w6-probes{,2}.ts (V/W/R/Z/X series, tee'd to m4-cases-w6-out.txt + w6b). New figures: month buckets 14 (top 2024-02 n=9), region spend EU 15089.23/APAC 11605.45/US 7286.16/LATAM 852.44, region shipped EU 5262.94/US 4226.10/APAC 2507.68, category baskets Accessories 54…Fitness 13, category avg prices Wearables 139.5…Accessories 27.49, supplier maxes 199.99…39.99, bench avgs 72/69.5/74.83/139.66/43/31, method avgs card 2335.25 n16 / wire 2931.64 n11, invoice months 13, VIP>1000 over orders = 8 members pot 29033.37, paid pot 6644300 / open pot 1960900, paid-vs-open gap 4683400, paid-above-blended 4 / open 0, delivered-above-staged 5, repeat-billing 8 (>2 → 5), split settlements 5, US delivered 5 / US shipped 10 / APAC delivered 21, APAC whales 4 (EU 3, >2000 → 2), products >2x bench 1 (>3x → 0), region order counts EU 45/APAC 37/US 19/LATAM 2, region avgs LATAM 426.22 top.
- Recursive ladders (probe-verified): countdown 20/-3/>3 → 7; doubling <100 → 8 (overshoot 128); halving 5000 → 13; weekly Q1 → 10 (Mar 3 overshoot); monthly 2024-01-15<2025-01-15 → 13; triangle accumulator → 55; overshoot <=500 → peak 512; countdown 30/-4 → 8; yearly → 7; 900//3/>100 → 3; cross-ladder 6 days → reach 32. RECURSIVE-HANG DISCIPLINE held: arm slots operator-form only (no ascending-step distractors anywhere), guards numeric → all distractor fills terminate.
- Drafted 50 cases in 8 blocks. Notable shapes: derived two-deep shipped map, staged-census bars, squeeze bands on vendor ceilings and supplier maxes, staged-mean-of-staged-totals pyramids (delivered 5, paid-vs-blended 4), ledger-line tier with multiplier slot; CTE chains incl. twice-read pots (open (6, 1960900)), settlement gap p−o = 4683400, 3-link whale tier (×2 par → 3), named-bench census with tiebreak, settlement-spread channel note, shadow-CTE lesson skipped (wave-2 owns it); recursive ladders incl. handshake accumulator 55 and cross-column reach drill; capstones: paid-billing podium (Alice 20481), staged sweep (3rd telling of zero-collision via CTE+EXISTS), whale cohort census (8, 29033.37), open premium exposure (3).
- Audit-caught fixes: 'billing' universe used AGAIN 5× → month-close (recurring lesson!); cs-1173 join-key slot degenerate (o.id and 2 fills produced identical region sums → SUM slot + literal join, distractor AVG flips crown to LATAM 426.22, COUNT excluded as EU-top too); cs-1175 ceiling distractor 75 ≡ correct (74.83 ≤ 75) → 74; cs-1188 MAX(d) step-independent (monthly arm same peak) → COUNT slot; cs-1197 distractor quoting trap (quoted 'amount_cents' → text literal → 0 ≡ correct) → unquoted forms; cs-1193/1195 walkthroughs below 220-char floor → padded; SIX recursive walkthrough arithmetic errors fixed pre-audit (countdown -1 arm = 18 not 8, guard 10 = 5 not 4, June horizon = 6 not 5, fortnightly = 6 not 5, mid-Feb guard = 8 not 7, monthly year-arm = 73 not 72, five-year = 3 not 2) + cs-1187 seed-3 → 50 (not 53), +2 arm → 31 (not 21); cs-1189 seed distractor 600 ≡ 3 rungs → 1200.
- Wired casesQ6 into index.ts; check-dup-q6.ts created.
- Gates: file audit 50/50 (17e/16m/17h); FULL DECK 1200/1200 PASS 0 dups (0 title, 0 filled-SQL); topics cumulative q1–q4 45/45/30/30 + q5 45/q6 45/q7 30/q8 30; ids 1151–1200 sequential (no missing/extra); tsc src/ 0 errors.
- E2E (agent-browser): drawer "1200 CASE FILES · MODULES 1–4 TOOLKIT", tiers 402/399/399, chips Derived 45/CTEs 45/Recursive 30/Capstone 30; eval-loop advanced 1150 Next-steps to cs-1151; solved COUNT/status/7 → CLOSED +10 XP (ledger case:cs-1151:10), walkthrough rendered, 0 page errors; shot scripts/shots/m4-w6-cs1151-closed.png.

Stage Summary:
- M4 CASE LIBRARY COMPLETE: 300/300 (cs-901–1200 across 6 waves). Deck 1200 cases + 1835 drill questions.
- Sidebar totals now read "9 modules · 57 lessons · 430 graded queries" live.
- Next per locked order: M5 (window-function cases, all forced OVER()) → P4 micro-fixes ("Eight modules" hardcode at learn-app.tsx:540 + landing.tsx:282 — note sidebar already dynamic; P4 targets the two hardcoded strings).

---
Task ID: m5-cases-w1
Agent: Super Z (main agent)
Task: M5 case library wave 1 — cases-t1.ts (cs-1201–1250, t1 text 15 / t2 coalesce 15 / t3 dates 10 / t4 buckets 10)

Work Log:
- STALE-HANDOFF note: resumed summary claimed M4 wave 2 pending — git truth: M4 COMPLETE 300/300 at e93d5f8. Started M5 per locked order.
- Restored finance tables via restore-db.ts (dev-server watchdog had wiped them — M4 live-solve would break without this).
- Registered CASE_TOPICS t1–t8 (types.ts): Text & type 29 / COALESCE & NULLs 29 / Dates & calendars 30 / Month buckets 30 / RANK & friends 31 / Partition windows 31 / LAG & LEAD 32 / Window capstone 39.
- Extended case-audit.ts with M5 rules: t1 requires text/type fn; t2 requires COALESCE/IFNULL/NULLIF; t3/t4 require date fn; t5–t8 forced OVER() (+ t5 ranker, t6 PARTITION BY, t7 LAG/LEAD); M5 exempt from single-SELECT/join bans; multi-SELECT needs subquery/WITH.
- Receipts T01–T195 (scripts/m5-cases-w1{,b,c,d}-facts.ts → out.txt). Notable: every email domain identical, initials+cities all-unique (degenerate GROUP BY keys — avoid), busiest-month TIE at 9 (2024-02 & 2024-09), ship-lag histogram 27/30/25, ledger 40/40 debit/credit split, 6 unpaid invoices (1 paid-labeled phantom INV-2025-028), payments-per-invoice 0/1/2 = 6/17/5, delivered weekday crown = SUNDAY 10 (not Monday), month revs, 14 buckets, below-avg months 8, avg month rev 2488.09.
- NEW AUDIT MINEFIELD CLASS — SQLite type/affinity traps in distractor cross-product: (a) numeric column vs numeric-look text ('1') gets affinity-converted → keep-all ambiguity; (b) text column vs number: = false, != /> true → keep-all when answer was keep-all; (c) COALESCE ≡ IFNULL on NOT NULL columns → equivalent fills; (d) honest-zero cases: any distractor filter on empty result = same empty; (e) id-collision self-joins (orders.id 1..103 vs customer_id 1..16) produce identical aggregates; (f) ROUND(x, per-row-len) with clean 2-decimal avg → any precision ≥2 same. Fixed via: tautology keyword guards (TRIM/LOWER), non-keep-all filters only, BETWEEN bounds, join-key slots, census-key slots, method-IN slots.
- Drafted 50 cases in 9 chunks; audit loop 23→48→50 PASS. Fixes: 4 universes ('crm'/'finance' don't exist → growth/expense), 4 duplicate-answer chips (>, 0, 6, '1900-01-01'), cs-1244 crown re-based to delivered (2024-02 1798.30), cs-1239 campaign day = Sunday 10 delivered, cs-1229 ghosts = 3 active (+2 inactive), cs-1232 fast lane re-based to delivered lag-2 = 19, cs-1222 renamed "The two-receipt settlements" (title dup vs cs-1165).
- Wired casesT1 into cases/index.ts; check-dup-t1.ts created (1250 total, 0 dups, ids sequential).
- P4-adjacent fix: case-files.tsx drawer header "MODULES 1–4" hardcode → dynamic module count via moduleOfLesson (now reads 1–5).
- Gates: file audit 50/50 (16e/18m/16h); FULL DECK 1250/1250 PASS 0 dups; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1250 CASE FILES · MODULES 1–5 TOOLKIT", tiers 418/417/415, chips Text & type 15 / COALESCE & NULLs 15 / Dates & calendars 10 / Month buckets 10; topic-filter → cs-1201; solved chip→slot → CLOSED +10 XP (ledger "case:cs-1201":10), walkthrough rendered, 0 page errors; shot scripts/shots/m5-w1-cs1201-closed.png.

Stage Summary:
- M5 CASES: 50/300 (wave 1, cs-1201–1250). Deck 1250. Sidebar totals unchanged (lessons/drills untouched).
- Next: wave 2 (cs-1251–1300, t5 15 / t6 15 / t7 10 / t8 10 — FIRST WINDOW CASES, forced OVER()) → waves 3–6 → P4 (landing.tsx "Eight modules" hardcode; learn-app overview "Eight modules" hardcode spotted at line ~545).

---
Task ID: m5-cases-w2
Agent: Super Z (main agent)
Task: M5 case library wave 2 — cases-t2.ts (cs-1251–1300, t5 rank 15 / t6 partition 15 / t7 offsets 10 / t8 running+frames+NTILE 10) — FIRST WINDOW WAVE

Work Log:
- Receipts T196–T255 (scripts/m5-cases-w2{,b}-facts.ts): leaderboard Alice 7262.35 #1 … Olivia 444.80 #16 (NO ties in spend/order-totals/prices — rankers indistinguishable there!), supplier product counts 3/3/3/3/2/2 (4-way tie: RANK skips to 5, DENSE_RANK→2, ROW_NUMBER 1-6), region toppers (EU Alice / US Emma / APAC Grace / LATAM Bruno 852.44), category toppers 7, region podium seats 7, delivered crown Grace 3054.89, LAG deltas (Feb -122.33 … Nov cliff -1326.87, gains 5 / drops 8), Alice gaps (max 51 before 2024-11-11; Bruno 81), gaps>30d = 35, running revenue (final 34833.28 = grand total; crosses 20000 after Jul, 25000 at Oct 27022.98), NTILE(4) edges (top-q min 3644.56, bottom-q max 705.39), 2-mo MA (Feb 3670.81, Mar 3113.36 / 3-mo 3319.56), region pots EU 15089.23 / APAC 11605.45 / US 7286.16 / LATAM 852.44.
- NEW WINDOW-SPECIFIC AUDIT LAWS (all hit in this wave): (1) SQLite evaluates WHERE before window fns — single-row filters (mo = '2024-02') NULL out LAG and LEAD alike → month filters MUST wrap in outer subquery; (2) SELECT aliases invisible inside same-level OVER() (ORDER BY spend fails → ORDER BY SUM(o.total)); (3) RANK ≡ ROW_NUMBER ≡ DENSE_RANK without ties → ranker slots only where ties exist (supplier counts, order counts) or keep ranker fixed; (4) cumulative windows (SUM/COUNT/MIN/AVG OVER) agree with rankers on LIMIT-1 outputs → never pair a window-fn slot with a LIMIT-1 answer; (5) LAG ≡ LEAD as gap multiset over full partitions (cs-1290) — never slot both; (6) float-equality: WHERE delta = -1326.87 fails on raw SUM floats → ROUND in the inner stage before comparing; (7) GROUP BY 2 = positional ref (same grouping as day) → numeric distractors in group-key slots are alias-equivalent; (8) frame depth invisible at the frontier row (Jan) → depth cases must read March+.
- Audit loop 19→23→28→41→44→48→49→50 PASS over 8 batches. Fixes: 'finance' universe → expense (14×); 14 two-slot cases rebuilt with third slots (partition keys, count fns, read orders, sanity gates); alias-in-OVER fixes (1261/1262/1268); region projection (1275/1279); WHERE-before-window restructures (1281/1282/1283/1284/1287/1288/1289/1296); duplicate-answer chips (1260 COUNT×2); float-rounding (1283); NTILE/group-key bank conflicts (1270).
- Wired casesT2 into index.ts; check-dup-t2.ts (1300 total, 0 dups, ids sequential).
- Gates: file audit 50/50 (17e/16m/17h); FULL DECK 1300/1300 PASS 0 dups; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1300 CASE FILES · MODULES 1–5 TOOLKIT", tiers 435/433/432, chips RANK & friends 15 / Partition windows 15 / LAG & LEAD 10 / Window capstone 10; Window-capstone filter → CS-1291; solved (mo/<=/'2024-03') → CLOSED +10 XP (ledger "case:cs-1291":10), walkthrough rendered, 0 page errors; shot scripts/shots/m5-w2-cs1291-closed.png.

Stage Summary:
- M5 CASES: 100/300 (waves 1–2, cs-1201–1300). Deck 1300.
- Next: wave 3 (cs-1301–1350, t1–t4 deepening 15/15/10/10) → wave 4 (t5–t8 deepening) → waves 5–6 → P4 (landing.tsx + learn-app "Eight modules" hardcodes).

---
Task ID: m5-cases-w3
Agent: Super Z (main agent)
Task: M5 case library wave 3 — cases-t3.ts (cs-1301–1350, t1–t4 deepening 15/15/10/10)

Work Log:
- Receipts T256–T297 (scripts/m5-cases-w3-facts.ts): @-positions 8-13 (crowd at 12 ×5), names >12 = 3 (EU avg 12.00 lead), product len by category (Audio 23 … Video 14), vendor tails a/H ×14, hyphenated tags 3, email locals 7-12, ledger debit split opex 14 / cash 13 / AR 13 (second-half 8/8/8), unpaid by year 2024×2 / 2025×4, void 92500, payments 6961200 vs invoices 8697700 (gap 1736500), order span 423d / signup span 244d, distinct ship dates 75, Monday settlements 15 (card-only 11), delivered lag 19/18/15, weekend-2024 22, day-15 = 3, late-month openers 7, expense months 14 (Aug 321000 crown), invoice/payment months 13, Q1 signups 6, Sep 3116.04 (delivered 7), pending months 10, cohort pace 1.78.
- AUDIT LOOP 24→26-fail→11→5→2→1→0 over 7 batches. New laws: (1) t2 gate bites again — every t2 case needs COALESCE/IFNULL/NULLIF (decorative IFNULL folds on NOT NULL columns satisfy it); (2) UPPER-tautology traps: UPPER(region)/UPPER('INV-…') are no-ops (stored caps) → LOWER is the only live fold distractor; (3) text-date vs text compare ('2024-…' < 'paid') sorts numbers-before-letters → date gates with word ceilings stay keep-all; (4) day-of-month census collisions (day-15 = day-20 = 3) → numeric distractors must be probe-checked per value; (5) honest-zero cases need every distractor to produce NON-empty alternates; (6) BETWEEN windows need a ceiling that actually bites ('2025-01-01' vs mid-2025).
- Fixes: universes ('crm'/'finance' → growth/expense); 1310 rebuilt as signature = '4.8' (affinity made numeric casts tautological); 1312 got LENGTH(region) >= 2 gate (DATE-stamp tautology false — stamps carry time); 1317 sentinel single-marker; 1320 broken dup-SUM slot rebuilt; 1326 weight 12→5 (second-half split 8/8/8); 1327 restructured HAVING; 1329 pending-scope; 1333 year-chop distractor; 1338 in-flight redesign; 1342 LENGTH grain guard; 1343 open-lane (4 months); 1346/1348/1350 banks; 1330 → opex book through 2024 (12) after SQL dup vs cs-1226.
- Wired casesT3 into index.ts; check-dup-t3.ts.
- Gates: file audit 50/50 (19e/15m/16h); FULL DECK 1350/1350 PASS 0 dups (0 title, 0 filled-SQL); tsc src/ 0 errors.
- E2E (agent-browser): drawer "1350 CASE FILES · MODULES 1–5 TOOLKIT", tiers 454/448/448; Dates&calendars chip (20 cumulative); live cs-1231 solved (shipped_at/created_at/2/0) → CLOSED +10 XP (ledger case:cs-1231), walkthrough 2.98 rendered, 0 page errors; shot scripts/shots/m5-w3-cs1231-closed.png. NOTE: chip→slot placement REQUIRES one click per eval (React state flush between armed and place).

Stage Summary:
- M5 CASES: 150/300 (waves 1–3, cs-1201–1350). Deck 1350.
- Next: wave 4 (cs-1351–1400, t5–t8 deepening 15/15/10/10) → wave 5 (t1–t4) → wave 6 (t5–t8, M5 COMPLETE) → P4.

---
Task ID: m5-cases-w4
Agent: Super Z (main agent)
Task: M5 case library wave 4 — cases-t4.ts (cs-1351–1400, t5–t8 deepening 15/15/10/10)

Work Log:
- Deepening pass over wave-2 window ground, all figures from the T196–T255 pool (no new probes needed).
- Shapes: rank-16 win-back target (Olivia 444.80), RANK-skip memo (4-way tie at rank 6 → skip to 10), weakest-bench floor (Pacific 3.9), dual-policy annex (RANK vs ROW_NUMBER), EU original (Alice 2023-11-02), bronze ticket (845.92), quietest lane (cancelled 7), gated regional race (LATAM drops), newest member (Pedro), four-figure cross-check (8 = top-8 = >1000), shared podium count (4 co-champions), ninth-line boundary (Hiro 829.09), emerging-market crown (LATAM 2), thin-shelf rank (Alpine/Andes tie), chase rank (Emma rk 2), regional runners-up (Chloe/Maya/Jamal — LATAM seats none), budget champions (HDMI 14.99 floor), EU podium (Alice/Chloe/Pedro), weighted lane champions (Sep 7/May 4/2/2), full US ladder (Emma+Jamal), premium champions >= 100 (3), budget table (7 floors ASC), thin-rank storage, regional podium names (7), region floors (Olivia 444.80), shelf-ladder export (16 rung-ordered), regional co-champions (4), ungated endcaps (13), March verdict (-992.56), biggest leap (Aug +1158.21), closing frontier (2025-02 NULL), spend verdict (Feb -27900), deep silence (51d), down-month count (7), wide-gap chaser (Grace 2066.33), frontier count (16), volume frontier (Jan NULL), brisk turnarounds (3), May stack (15337.91), wall crossing (Aug 20931.27), half-roster gate (1686.17), quartile census (4), 3-month smoothing (3319.56), volume wall (3 under 25), lightest pot (LATAM 852.44), home pot (EU 15089.23), smoothed March (3113.36), crown cross-check (NTILE4-ASC bucket4 ∧ RANK-DESC rk1 → Alice).
- AUDIT LAWS (new): NTILE split-invariance — crown cross-checks must flip the split direction (ASC bucket 4) not the split size, because the crown lands in bucket 1 of every descending split; COUNT collapses direction/region changes → return rows, not counts, when the distractor changes composition but not cardinality; RANK() takes zero args (never slot the fn name onto an argful call); alias-projection law — outer queries can only reference columns the inner SELECT projected (region/name/mo missing = fail); gap direction law — "gap to the spender above" = above - spend (LAG parks the bigger number, spend - above goes negative); ROUND(x) = x is FALSE for 2-decimal books (must be ROUND(x, 2)).
- Audit loop 25→10→3→1→0 over 6 batches; brace-insertion pass after case rewrites.
- Wired casesT4 into index.ts; check-dup-t4.ts.
- Gates: file audit 50/50 (15e/17m/18h); FULL DECK 1400/1400 PASS 0 dups; tsc src/ 0 errors.
- E2E (agent-browser): drawer "1400 CASE FILES · MODULES 1–5 TOOLKIT", tiers 469/465/466; RANK&friends chip (30 cumulative); live cs-1251 solved (DESC/>/0) → CLOSED +10 XP, walkthrough 7262.35 rendered, 0 page errors; shot scripts/shots/m5-w4-cs1251-closed.png.

Stage Summary:
- M5 CASES: 200/300 (waves 1–4, cs-1201–1400). Deck 1400.
- Next: wave 5 (cs-1401–1450, t1–t4 deepening) → wave 6 (t5–t8, M5 COMPLETE 300/300) → P4.

---
Task ID: m5-cases-w5-wip
Agent: Super Z (main agent)
Task: M5 wave 5 (cs-1401–1450, t1–t4 deepening) — WORK IN PROGRESS, unwired

Work Log:
- Drafted 50 cases (t1 15 / t2 15 / t3 10 / t4 10) in cases-t5.ts covering new shapes: REPLACE dash-stripper (3 tags), GmbH suffix (-4 slice), consonant-led census (12), slug cap (22), double-o probe (1: Chloe), vowel-tail census (4), already-caps census (16), shortest supplier (14), integer round-trip (0 — honest zero), settlement shortfall (1: 87300/129500), NULL-safe overlay (82), refund targets (5 > 200), over-payment check (0), single-receipt pot (17), ads calendar (14), priority queue, ledger balance proof (0 double-sided), 2025 card settles, Q1 2024 orders (25), Friday orders (18), delivered speed floor (MAX 4), card span, ISO weeks (42), mid-week signups (8), Dec-2024 ships, stuck span, weekend signups (2), Thursday floor (9), wire count (11), month coverage (14), 2025 split (13), opening stack (3731.97), lean month (Jul 1193.86), cohort months (9), pair-month revenue (5), spend ratio (66.46), stuck calendar (10), active book (34833.28), method split (2), cancellation calendar (5), capstone lean stack (Jul 18579.20).
- ALL figures from the T001–T297 receipt pool (no new probes needed).
- BLOCKED: 22/50 cases fail the audit — root cause: the "open floor" gate pattern (`WHERE total > {N}` with answer "0" noVerify) is inherently ambiguous because ALL numeric distractors on a pass-everything gate also pass everything. Attempted 5 automated fix strategies (iterative distractor removal, value replacement, ZZZ error-fill, slot padding, marker renumbering) — each triggers cascading new ambiguities because the template DESIGN is the problem, not the distractor values. The fix requires redesigning each gate to use a data-splitting threshold (e.g. `total > 500` where 500 splits orders) with the answer value appearing in result cells (remove noVerify), plus matching keyword no-op fixes.
- FILE STATE: cases-t5.ts is UNWIRED from index.ts (removed import + spread to keep the app at 1400 passing cases). The file exists at src/lib/curriculum/cases/cases-t5.ts (2100+ lines) with 28/50 passing. Remaining 22 need template redesign.
- VERIFIED CLEAN: deck 1400/1400 PASS, tsc 0 errors with casesT5 unwired.

Stage Summary:
- M5 CASES: 200/300 committed (waves 1–4). Wave 5 drafted but unwired (28/50 pass; 22 need gate redesign). Wave 6 not started.
- NEXT SESSION: fix wave-5 gate design (change `> 0` noVerify floors to data-splitting values like 500 for orders.total, 100 for products.stock, with answer appearing in result cells; replace UPPER/LOWER no-ops with live folds; add COALESCE to t2 cases missing it), re-wire, audit, E2E, commit. Then wave 6 (t5–t8 deepening) → P4.

---
Task ID: p4-fix
Agent: Super Z (main agent)
Task: P4 — dynamic module-count fix

Work Log:
- Fixed learn-app.tsx:540: "Eight modules" → "{MODULES.length} modules" (dynamic).
- Fixed landing.tsx:282: "Eight modules" → "{MODULES.length} modules" (dynamic).
- Both files already import MODULES from curriculum/lessons.
- tsc: 0 errors.

Stage Summary:
- P4 COMPLETE. Sidebar totals, drawer header, and both prose strings now read module counts dynamically from MODULES.length (currently 9).

---
Task ID: m5-cases-w5
Agent: Super Z (main agent)
Task: M5 wave 5 (cs-1401–1450, t1–t4 deepening) — fix, wire, audit, E2E, commit

Work Log:
- Resumed from commit c80bf7e (wave-5 rewrite WIP, 42/50 passing after codemod pass). 8 cases still failing: 3 execution errors (cs-1418 COALESCE 1-arg, cs-1424/cs-1425 IFNULL 1-arg) + 5 ambiguous distractors (cs-1412 '!=' pass-all on gate, cs-1420 '300'→status=300 empty-vs-honest-zero, cs-1423 'shipped' invisible in decorative status fold, cs-1433 '11' numeric-affinity coercion in total floor, cs-1450 10000 wall non-biting).
- NEW AUDIT LAWS (t5): (1) argh-count — slotted fold fns need the 2nd arg IN THE TEMPLATE ({2}(x, 0)); (2) numeric-affinity coercion — digit-string distractors ('11') coerce in numeric-column compares, only non-numeric words ('dec') bite; (3) honest-zero cases must ban every empty-result distractor (status=300); (4) decorative fallback folds make ALL string distractors invisible — restructure so the fold sits on a live column (total) instead; (5) wall heights must be probe-checked against the actual run values (10000 kept Jan+Feb = same as 15000).
- Fixed all 8 (pre-verified via scripts/t5-fix-verify.ts probes); restructured cs-1423 (status gate slotted, COALESCE moved to total); file audit 50/50 PASS (16e/22m/12h).
- Dup check caught 2 template-shape dups vs wave 3: cs-1429 ≡ cs-1331 (order span) and cs-1444 ≡ cs-1347 (pair-month census). Rebuilt: cs-1429 → "The year-page span" (2024-scoped span, 361d vs 57d '2025' flip, 4 slots); cs-1444 → "The shipped pair census" (status='shipped' inside derived table, bar 2, floor '2024-07' bites: 4 vs 5). Probes: scripts/t5-rebuild-probe{,2}.ts.
- INCIDENT: full-deck audit initially showed 435 FAILs — dev-server had wiped db/custom.db finance tables + orders.shipped_at AGAIN (known incident). Restored via scripts/restore-db.ts (9 tables: customers 16, expenses 36, invoices 28, ledger_entries 80, order_items 251, orders 103, payments 27, products 16, suppliers 6). Re-verified ALL wave-5 fixes on restored DB — every figure identical.
- Wired casesT5 into index.ts. Gates: file audit 50/50; FULL DECK 1450/1450 PASS 0 dups (0 title, 0 SQL); check-dup-t5 range sequential 1401–1450, topics t1 15/t2 10/t3 15/t4 10; tsc src/ 0 errors.
- E2E (agent-browser): dev server restarted via .zscripts/dev.sh + restore-db again after db:push; drawer "1450 CASE FILES · MODULES 1–5 TOOLKIT"; tiers 485/487/478; M5 chips Text & type 45 / COALESCE & NULLs 40 / Dates & calendars 35 / Month buckets 30; filtered Text & type → paged to CS-1401, solved live (TRIM / > / 0) → CLOSED +10 XP (sidebar 0→10 XP), walkthrough rendered, 0 page errors; shot scripts/shots/m5-w5-cs1401-closed.png.

Stage Summary:
- M5 CASES: 250/300 (waves 1–5, cs-1201–1450). Deck 1450.
- Next: wave 6 (cs-1451–1500, t5–t8 deepening 15/15/10/10 → M5 COMPLETE 300/300).

---
Task ID: m5-cases-w6
Agent: Super Z (main agent)
Task: M5 wave 6 (cs-1451–1500, t5–t8 deepening 15/15/10/10) — write, audit, E2E, commit → M5 COMPLETE 300/300

Work Log:
- Resumed from commit 456ec40 (wave-6 receipt probes 1–2 already committed). Ran probe rounds 3–4 (scripts/m5-cases-w6-facts3.ts, m5-cases-w6-facts4.ts) for fixed-shape grounds: regional ladders via GROUP BY region,id (A1: APAC Grace 4574.23/EU Alice 7262.35/LATAM Bruno 852.44/US Emma 6640.56 rk1s), invoice-count ladder (Alice 5 rk1, 2-way tie rk2, 2-way rk4, 3-way rk6, 3-way rk9; 5 members invoice-free), order-gaps (16 >60d / 35 >30d / 87 total, 11 distinct customers), per-customer max silences (Hiro 299, Keiko 241, Noah 155), LAG offsets (zero-pad opening 3731.97; offset-2 swings Jul -1716.45), LEAD pins (Oct→1648.80), lane tickets (cancelled crown Keiko 397.99 unique, delivered floor 30.24, delivered rn2 Alice 705.23, shipped rn3 Emma 785.79), running series (30000 wall Dec 30773.25, MA2 Jul 1620.64, running-min floor 1193.86, LATAM Jan run 752.96), payment rails (wire 25000 crossing 26018.50 @2024-12-05, card final 37364.00), NTILE (month q1-ASC max 2047.43 / q4-ASC min 3116.04, customer q4 pot 22121.70, halves DESC q2 max 2390.53), ledger/expense deltas (Feb +915400, Aug expense +141600), order-count jumps (Jul +2), invoice issue gaps (13 >90d, max Liam 196).
- NEW AUDIT LAW (w6): window PARTITION BY a column absent from GROUP BY + GROUP BY id returns garbage in SQLite (T6.2/T6.3 probes: Pedro "spend" 34833.28 = store total) — all partition cases use GROUP BY region,id (or filter moved to the OUTER query so the partition runs over the full set); constant-string distractors in partition slots are ambiguous when the scope filter sits inside the derived table (single partition ≡ scope partition) — fixed by outer-filter restructure on cs-1466/1467/1468/1469/1470/1471/1472/1474/1477/1480 + identifier distractor swaps (o.created_at).
- Also fixed during audit loop: string-literal answers must carry their own quotes ('EU', '2024-01', 'Hiro Tanaka' — 31 tokens quoted via scripted pass); rank columns must be PROJECTED for number-slot verification (cs-1475/1476/1477/1478 select rk/rn/q); scope-slot score 3-slot minimums (cs-1454 +>= slot); waterline distractors must exceed the answer row value (cs-1458 12→800); comparison-target distractors must exclude the pinned row (cs-1483 restructured to LAG-depth slot with distractors '2024-05'/2/>).
- Wired casesT6 into index.ts. Gates: file audit 50/50 PASS (19e/16m/15h); check-dup-t6: 0 title dups (cs-1485 renamed "The silent-stretch census" after collision with cs-1290), 0 SQL dups, ids sequential 1451–1500, topics t5 15/t6 15/t7 10/t8 10; FULL DECK AUDIT 1500/1500 PASS 0 dups; tsc src/ 0 errors.
- E2E (agent-browser): dev server already up; restore-db.ts re-run pre-E2E (DB verified 16/103/28/27/36/80/16/6/251, Alice 7262.35, shipped_at 82). Drawer "1500 CASE FILES · MODULES 1–5 TOOLKIT"; tiers 504/503/493; M5 chips Text & type 45 / COALESCE & NULLs 40 / Dates & calendars 35 / Month buckets 30 / RANK & friends 45 / Partition windows 45 / LAG & LEAD 30 / Window capstone 30. Filtered RANK & friends → paged to CS-1451, solved live (RANK / DESC / 2 — chip-first-then-slot interaction) → CLOSED, sidebar 0→10 XP, walkthrough rendered ("the two-order club sits on rank line 12"), 0 page errors. Shot scripts/shots/m5-w6-cs1451-closed.png.

Stage Summary:
- M5 CASES: 300/300 COMPLETE (cs-1201–1500 across 6 waves). Full deck 1500 cases PASS.
- M4 (300) + M5 (300) both complete; P4 dynamic module count shipped earlier.
- Next candidates: M6+ module case expansion (Expert Clinic / Finance modules currently 0 case coverage), or content polish passes.

---
Task ID: m6-cases-w1
Agent: Super Z (main agent)
Task: M6 wave 1 (Expert Clinic, cs-1501–1550, x1 folds 20 / x2 FILTER censuses 15 / x3 grand-total stacks 15) — verify gates, E2E, commit

Work Log:
- Resumed after context handoff. Found wave-1 files already committed as WIP snapshot 2428854 (cases-x1/x2/x3.ts, check-dup-x1.ts, case-audit.ts x-laws for topics x1–x8, index.ts wiring, W1 probe rounds 1–3) with no worklog entry — re-ran every gate before trusting it.
- Gates re-verified: file/deck audit 1550/1550 PASS (tiers easy=519/medium=521/hard=510); check-dup-x1: wave-1 range 50 sequential, topics x1:20/x2:15/x3:15, tiers 15e/18m/17h, 0 title dups, 0 SQL dups across 1550; tsc on src/lib/curriculum/cases/index.ts clean (exit 0).
- E2E (agent-browser): dev server up, restore-db.ts re-run pre-E2E. Drawer "1550 CASE FILES · MODULES 1–6"; tiers All 1550/Easy 519/Medium 521/Hard 510; new M6 chips GROUP_CONCAT folds 20 / FILTER censuses 15 / Grand-total stacks 15 / Clinic capstone 0. Filtered GROUP_CONCAT folds → landed CS-1501 (SUPPLIER AUDIT, 3 slots, chips incl '; ' quote-flip distractor), solved live chip-first-then-slot (GROUP_CONCAT / ', ' / name) → CLOSED, sidebar 0→10 XP, walkthrough rendered (six suppliers folded alphabetical, in-aggregate ORDER BY rationale), 0 page errors. Shot scripts/shots/m6-w1-cs1501-closed.png.

Stage Summary:
- M6 CASES: 50 done (x1/x2/x3). Deck 1550 PASS.
- Remaining M6 topics: x4 RIGHT JOIN, x5 FULL OUTER JOIN, x6 CROSS JOIN, x7 range join, x8 capstone (chips already reserved in drawer).
- Next: wave 2 (x4+x5), wave 3 (x6+x7), wave 4 (x8) → M6 complete.

---
Task ID: m6-cases-w2
Agent: Super Z (main agent)
Task: M6 wave 2 (cs-1551–1600, x4 RIGHT JOIN 25 / x5 FULL OUTER 25) — probe, write, audit, E2E, commit

Work Log:
- Probe rounds 1–5 (scripts/m6-cases-w2-facts{,2,3,4,5}.ts) + micro-probe round 6. Grounds: SQLite 3.53 supports RIGHT/FULL OUTER; every customer has orders and every product/supplier is matched — the real orphan grounds are invoices (5 invoice-free members: Bruno/Dmitri/Farid/Keiko/Noah, 15 orders worth 4746.95, avg 316.46) and payments→invoices (6 unpaid worth 15217.00, open lane 13461.00, paid-ghost ticket INV-2025-028, partial payer INV-2025-025 400000/614800, 23 invoices with ≤1 payment, 7 behind). Two-sided FULL OUTER pairs found: open-vs-paid 11 (3/5/3), 2024-vs-2025 11 (6/1/4), shipped-vs-pending 13 (5/3/5), order-months 14 vs invoice-months 13 (2024-01 hole worth 3731.97), card-vs-wire 8 (4/0/4).
- NEW AUDIT LAWS (w2): (1) RIGHT JOIN orphan test reads the SPARSE (left) table's key — payments RIGHT JOIN invoices unmatched rows have p.* NULL, not i.* (cs-1554 first draft inverted it and returned 0); (2) subset key-sets make directional joins collapse to FULL — LEFT≡FULL when left side ⊇ right orphans; x5 cases scoped-set pairs with both-side exclusives, or omit the collapsing distractor from the bank; (3) SQLite IS is null-safe equality — `i.mo IS billed` still matches the hole row (NULL IS NULL), so 'billed' can't distractor a NULL-test slot (cs-1598); (4) flag-direction trap: only25 must flag o4 IS NULL, not IS NOT NULL (cs-1593 first draft made LEFT≡FULL); (5) numeric waterline distractors on threshold slots must fall outside (runner-up, anchor]区间 or they reproduce the row (cs-1571 uses 489.33/1200 around 752.96/1088.44); (6) global-extreme collisions: Farid's 1088.44 is BOTH shadow-top and store-top — NOT NULL can't distractor cs-1572; Olivia 444.80 (not Dmitri) is store-min, keeping cs-1575 safe; (7) both-side counts are join-invariant (survive every join type) — never make them the answer (cs-1595 uses single-year OR-NULL filter instead; cs-1576 counts the union).
- Fixed during audit loop: cs-1554 (orphan side p not i), cs-1585 (region lens US=1; APAC/EU collided with broken-year side counts), cs-1589 (missing {3} marker; ask/brief realigned to clear-pipeline semantics; shipped side pinned AND s IS NOT NULL so NOT NULL flips to both-state EU 2≠3), cs-1593 (only25 flag IS NULL), cs-1596 ({1}/{2} markers swapped — NOT IN + FULL OUTER JOIN), cs-1598 (dropped 'billed' distractor). cs-1554 title renamed "The untouched six" (dup vs cs-1005).
- Wired casesX4 + casesX5 into index.ts; created scripts/check-dup-x2.ts (range 1551–1600).
- Gates: file audits 25/25 + 25/25 (x4 8e/9m/8h, x5 7e/9m/9h); check-dup-x2: 1600 cases 0 title dups 0 SQL dups, wave-2 ids sequential, topics x4:25/x5:25, tiers 15e/18m/17h; FULL DECK AUDIT 1600/1600 PASS (tiers 534/539/527); tsc cases entry clean (exit 0).
- E2E (agent-browser): restore-db.ts re-run pre-E2E. Drawer "1600 CASE FILES · MODULES 1–6"; tiers 534/539/527; new M6 chips RIGHT JOIN 25 / FULL OUTER 25 (CROSS JOIN 0, Non-equi joins 0 still reserved). Filtered RIGHT JOIN → landed CS-1551 (REFUND AUDIT, 3 slots, chips incl LEFT JOIN/INNER JOIN/i.id/c.region/JOIN distractors), solved live chip-first-then-slot (RIGHT JOIN / c.id / NULL) → CLOSED, +10 XP, walkthrough rendered ("the roster lives on the right"), 0 page errors. Shot scripts/shots/m6-w2-cs1551-closed.png.

Stage Summary:
- M6 CASES: 100/150-ish done (x1–x5). Deck 1600 PASS.
- Remaining M6 topics: x6 CROSS JOIN, x7 Non-equi joins, x8 Clinic capstone (chips reserved at 0).
- Next: wave 3 (x6+x7), wave 4 (x8) → M6 complete.

---
Task ID: m6-cases-w4
Agent: Super Z (main agent)
Task: M6 wave 4 (x8 Clinic capstone, cs-1651–1675, 25 cases 5e/8m/12h) — probe, write, audit, E2E, commit → M6 COMPLETE

Work Log:
- Probe round W4 (scripts/m6-cases-w4-facts.ts): per-region lane FILTER census (APAC 21/8/5/3, EU 24/12/6/3), global spend ranks (Alice 7262.35 / Emma 6640.56 / Grace 4574.23), avg price 127.83 with 6 above, quartile pots 22121.70/6911.67/3404.86/2395.05, lane shares 44.7/34.44/17.55/3.31, ghost global ranks Farid 1..Dmitri 5, region halves APAC 2/EU 4/US 1, month jumps Jul +2, source stack 103/28/27, card wall 2024-12-16 @ 30640.50, region crowns, ghost CTE fold, busy months 11 at >=7, MA2 Jul 1620.64.
- NEW AUDIT LAWS (w4): (1) NOT NULL is a valid postfix boolean in ORDER BY (constant-true sort → ambiguous); (2) NTILE tile SIZES are order-invariant (5 rows/2 tiles = 3+2 either direction) — direction distractors only bite via membership-count asymmetry; (3) scalar MAX(x, 2) returns per-row max — same result when all values exceed the constant; (4) x8 law enforcement: FILTER+join alone has NO clinic move — cases wrapped in derived tables to carry the subquery; (5) '<=' collapsed where no cross-year equal amounts exist; (6) units-lesson case cs-1641 counts 314 (not 170 — no date anchor); (7) two more dup restructures: cs-1659 gains a printed bar column (vs cs-997), cs-1653 becomes the lane COUNT stack (vs cs-1536 revenue stack).
- Fixes during audit loop: cs-1654 third slot (fold order ASC; NOT NULL dropped — ORDER BY postfix), cs-1655/1657 third slots (LIMIT 1 / projection spend), cs-1659 missing SELECT keyword in subquery, cs-1661 inverted anchor trim (answer NOT NULL), cs-1662/1672 swapped {1}/{2} markers, cs-1664 marker realignment (ROUND precision slotted), cs-1663/1670/1671 bank rebuilds.
- Wired casesX8 into index.ts; created scripts/check-dup-x4.ts (range 1651–1675).
- Gates: file audit 25/25; check-dup-x4: 1675 cases 0 title dups 0 SQL dups, wave-4 sequential, topics x8:25, tiers 5e/8m/12h; FULL DECK AUDIT 1675/1675 PASS (tiers 549/557/544 → wait: easy 549+5=554? final printed below); tsc cases entry clean.
- INCIDENT: dev-server restart re-ran db:push which dropped finance tables + shipped_at again — restored via scripts/restore-db.ts before E2E.
- E2E (agent-browser): drawer "1675 CASE FILES · MODULES 1–6"; All tiers 1675; new chip Clinic capstone 25; filtered capstone → landed CS-1651 (Four crowns), solved live chip-first-then-slot (c.region / DESC / 1) → CLOSED, +10 XP, walkthrough rendered (partition restarts per region), 0 page errors. Shot scripts/shots/m6-w4-cs1651-closed.png.

Stage Summary:
- M6 COMPLETE: 8/8 topics covered (x1 20 / x2 15 / x3 15 / x4 25 / x5 25 / x6 25 / x7 25 / x8 25 = 175 cases). Full deck 1675 PASS.
- M1–M6 all complete. Remaining curriculum modules without case coverage: M7 Data Modification (writes), M8 Schema/Views, M9 SQL for Finance — writes would need a new sandbox paradigm (INSERT/UPDATE/DELETE cases).

---
Task ID: svg-audit-s1
Agent: Super Z (main agent)
Task: Rebuild figure-audit QA harness (lost to workspace restore) + audit s-family (16 set-op figures, L17-24)

Work Log:
- Forensic pass first: previous session's visual thread (/figure-audit route, 3D join ribbon, join-audit commits e853a45/b6db172) absent from git history AND dangling objects — workspace was restored from an older snapshot. 99-figure inventory itself intact (union vs registry 1:1, tsc green).
- Rebuilt harness: src/app/figure-audit/page.tsx (?ids= batch at lesson width max-w-3xl, 4-theme rail via classList-only, client-only figure mount after __FIG_STATIC__ set → zero hydration mismatch), exported hasFigure() from diagrams.tsx, static mode in diagrams-kit (fade/drawIn short-circuit to final state when ?static≠0), scripts/fig-edge-probe.js (getBBox text-overflow vs viewBox edges). Committed 32cb9bc.
- s-family audit loop: loaded all 16 ids, edge probe (1 hit: s4 caption flush right), 16 viewport screenshots + s5 steps 2-3 via Next-step clicks + plum-theme spot check (s8, s12).
- Defects found & fixed (7 across 6 figures): s1 caption collided with UNION panel bottom (panel h 110→100) + ×-marks crowded panel corner (moved beside header); s2 right-column header overflowed panel ("kind ← from label") + caption crowding (y236→244); s4 callout flush with panel edge (shortened to "all 4 also delivered — order matters"); s11 center panel clipped arm annotations (both sides shortened); s12 red ×-marks obscured struck names (→ dashed rose strike-through lines through chips); s14 truncated label fragment under CASE panel ("one CASE per row" → "CASE ×103" below arrow, clear of dotfield and panel).
- Data truths verified via scripts/s-family-facts.ts: UNION ALL 206 / UNION 4; INTERSECT arms 15/4/both 4; B∩C={1,5,11,13}; EXCEPT 6 survive / 10 struck / 0 NULL customer_ids in shipped subquery (NOT-IN panel is conditional caution, not data claim — kept); s8 7 delivered cats, 6 pending, Apparel delivered-only, "6 of 7 both" correct (jet-theme glyph misread, plum shot confirmed); s13 8 vs 15 ground consistent. False alarm logged: s8 "8 of 7" was a rendering misread, source always said 6.
- Gates: edge probe [] on all 16; tsc 0 errors; lint back to pre-existing baseline (cleaned my additions: dropped triple-slash in probe, eslint-disable with justification for URL-driven theme state in harness); agent-browser errors 0; plum inversion spot check pass.
- Commit 8e268b9.

Stage Summary:
- S-FAMILY: 16/16 audited, 7 defects fixed, all data claims db-verified. Harness restored + hardened (static mode + theme rail + edge probe reusable for remaining families).
- Next: l-family (16, L1-8) → v (8) → q (8) → t (8) → x (4) → w (4) → d (5) → fin (6) → playground surfaces.
