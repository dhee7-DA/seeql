# Company-kit authoring spec — READ THIS FULLY BEFORE WRITING ANY CODE

You are authoring kits for the Company Interview Universe in this repo
(Next.js learning app). A kit = everything one company asks in SQL/data
interviews. The style, depth and honesty bar is set by
`src/lib/companies/kits/flipkart.ts` — read it first, imitate its voice.

## Inputs you MUST read before authoring

1. `src/lib/companies/types.ts` — the CompanyKit/Mcq/TheoryQa/CaseStudy shapes.
2. `src/lib/companies/kits/flipkart.ts` — the style template (voice, density).
3. `scripts/company-facts.md` — PROBED ground truth from db/custom.db. Every
   number you put in a case brief MUST come from this file. Never invent or
   recompute figures. If a number you need is not there, pick a different angle.
4. `scripts/company-pools.md` — the only legal source of problem `slug`s.
   Pool picks and topic `slugs` arrays MUST be `sql` rows from this file.
5. Your assigned kit file(s) (expansion agents): read the whole existing file
   before touching it.

## Hard audit facts (scripts/case-audit.ts enforces all of this)

- Case ids: `cs-<company>-<n>` where company is the kit id (e.g. cs-uber-1).
  Globally unique — never reuse an id that exists anywhere.
- Slots: 3..7. Template markers {1}..{n}, each used EXACTLY once, matching slot order.
- `brief` >= 120 chars (in-world stakeholder memo, 2-4 sentences).
- `ask` >= 30 chars (one-line deliverable).
- `walkthrough` >= 220 chars (how an analyst thinks, mentions the probed figures).
- `title` >= 10 chars. Every slot: `label` >= 3 chars, `why` >= 40 chars.
- `distractors`: 2..6, no duplicates, no duplicates of any slot answer, and EVERY
  distractor substituted into EVERY slot must either fail to execute or change the
  result (the audit mechanically probes this — pick distractors that break things:
  COUNT vs SUM, ASC vs DESC, wrong join column, wrong fold).
- `noVerify` slots (LIMIT constants, thresholds): max 3 per case.
- Number slots: the figure must appear as an exact result cell of the correctly
  filled query. Use ROUND(x,1) / ROUND(x,2) shapes so cells match the facts file.
- Grammar gates by topic id (choose topics whose shape you can honor):
  - l1..l8/cap: single table, NO JOIN, NO subquery (1 SELECT).
  - j1..j8: JOIN required, single SELECT, no subqueries.
    (j7 = joins+aggregates, j4 = LEFT JOIN, j5 = anti-join, j6 = self-join,
     j3 = 3-table chain, j1 = two tables.)
  - s1..s5: UNION/INTERSECT/EXCEPT required. s6/s7/s8: CASE required.
  - q1..q5: nested (SELECT …) required (q2 scalar, q4 correlated, q5 derived).
    q6/q7: WITH required (q7 WITH RECURSIVE). q8: subquery or WITH.
  - t1: text funcs (SUBSTR/UPPER/…). t2: COALESCE/IFNULL/NULLIF required.
    t3/t4: date funcs (STRFTIME/JULIANDAY/DATE). t5: ROW_NUMBER/RANK/DENSE_RANK.
    t6: PARTITION BY. t7: LAG/LEAD. t8: window + staged via derived/CTE.
  - x1: GROUP_CONCAT. x2: FILTER (WHERE …). x3: UNION ALL + a 'TOTAL' literal.
    x4: RIGHT JOIN. x5: FULL OUTER JOIN. x6: CROSS JOIN. x7: range join.
    x8: any clinic move.
  - FORBIDDEN topics for kits: w*/d*/f* (write/schema/finance-lesson topics) —
    the read-only audit skips those, so they would ship unverified.
- `universe` must be one of: month-close, refund-audit, pricing, inventory,
  funnel, supplier, expense, growth, fraud, catalog.

## Facts discipline (db/custom.db realities)

- Scale: 16 customers, 6 suppliers, 16 products, 103 orders, 251 order_items,
  28 invoices, 27 payments, 36 expenses, 80 ledger_entries.
- Never-ordered customers = 0 and never-ordered products = 0 — do NOT build
  "dead demand"/"dead stock" anti-join cases on those (they return empty).
  Anti-join cases exist on other dimensions (unpaid invoices = 6 works).
- Premium price band (>= 200) is EMPTY under the facts-file thresholds
  (max price 199.99). Don't claim premium-band products exist.
- shipped_at is non-NULL for delivered (52) + shipped (30) = 82 orders;
  pending 14, cancelled 7. Latency math: julianday(shipped_at) - julianday(created_at),
  avg 2.98 days, range 2..4.
- Finance tables are fair game (invoices/payments/expenses/ledger_entries) —
  the reconciliation anomalies table in the facts file is verified row-level.
- Dates run 2024-01..2025-02. SUBSTR(created_at,1,7) gives month buckets.
- All prices/money: orders.total and unit_price are REAL dollars; invoices/
  payments/expenses/ledger are INTEGER cents (divide by 100.0).

## Content spec

### NEW kits (standard spec — exact counts, probe prints them)
- `brief`: 4 paragraphs (what the company is + scale; how its data org works;
  what its SQL screens are actually like; how to prep for them). Name real
  artifacts of the company's business (KPIs, products, events) — no generic filler.
- `dayInLife`: 3 paragraphs (morning dashboards → midday deep-dive →
  stakeholder cycles), company-specific.
- `metrics`: 8 KPIs (name + what/why), company-specific, not generic.
- `topics`: 10 topics in study order. Each: name, company-specific why (2+
  sentences), 3 slugs from company-pools.md (sql rows; prefer its tagged pool,
  else theme-curated).
- `theory`: 8 items, ids `<co>-t1`..`<co>-t8`. Questions phrased as an
  interviewer says them; answers 200+ chars, opinionated, company-flavored;
  one-word `tag` each. Cover a spread: joins, windows, aggregation, NULLs,
  filtering/pipeline order, subqueries, dates, data quality.
- `mcqs`: 10 items, ids `<co>-mcq-1`..`10`. 4 choices, correct `answer` index,
  `why` (explains the right answer), `notes` on >= 2 tempting wrong choices,
  `difficulty` on every item (mix easy/medium/hard ~3/4/3). Ground prompts in
  the company's workflows and, where numeric, in facts-file figures.
- `cases`: 2, ids `cs-<co>-1`, `cs-<co>-2`. The two MUST use different topic
  families (e.g. j7 + t5, s6 + q2, j1 + x2). Ground both in facts-file figures.
  Vary universes/tiers (one easy/medium + one medium/hard).
- `problems`: 16 items `{slug, why}`. `why` ties the problem to a real workflow
  of THIS company (no generic "tests joins" filler). Tagged pool first
  (say so in the kit header comment); fill the rest theme-curated and say so.

### EXPANSION (3x spec — existing kits, APPEND-ONLY)
- Keep every existing entry byte-identical. Only APPEND new entries.
- brief 4 -> 6 paras, dayInLife 3 -> 4, metrics 8 -> 12, topics 10 -> 15
  (new topic names distinct from existing), theory 8 -> 24 (continue ids
  `<co>-t9`..`t24`), mcqs 10 -> 30 (`<co>-mcq-11`..`30`), cases 2 -> 6
  (`cs-<co>-3`..`6`), problems 16 -> 32 (append 16).
- The 4 new cases must use topic families DIFFERENT from the kit's existing 2,
  and different from each other. Same audit rules as above.
- New theory/MCQs must not duplicate concepts already covered — go deeper:
  pipeline order traps, window frames, set ops, subquery shapes, date math,
  data-quality/NULL policy, performance instincts, in-company KPI definitions.

## Style bar (what got previous kits approved)

- Voice: dense, concrete, opinionated. "orders placed vs orders kept", not
  "it is important to consider". Every claim ties to this company's business.
- Theory answers read like a strong candidate talking, 200+ chars, with the
  company twist at the end.
- MCQ wrong-answers are PLAUSIBLE (real-world bug patterns: integer division,
  NULL-filter drift, fan-out, tie handling), and `notes` coach the trap.
- Case briefs are stakeholder memos in-world, quote the probed figures, and
  state the definition being measured (denominators matter).
- Walkthroughs name the figures and the exact failure each distractor causes.

## File mechanics

- New kit file: `src/lib/companies/kits/<company>.ts`, exporting
  `export const <company>Kit: CompanyKit = { … }` (camelCase id + "Kit").
  Header comment: batch, domain, pool provenance (tagged vs curated), facts source.
- Fields `id`, `domainId`, `name`, `tagline`, `accent` — copy id/domainId/name/
  tagline EXACTLY from `src/lib/companies/registry.ts` COMPANY_META (they must
  match). Pick a distinct tailwind text color accent not used by sibling kits
  (existing: amber, blue, slate, emerald, rose; check your domain siblings).
- DO NOT touch: registry.ts, learn-app.tsx, tools.ts, worklog.md, any other kit,
  any script. Your whole edit surface is your assigned kit file(s) only.
- Validate each authored/expanded kit file:
  `bun scripts/case-audit.ts src/lib/companies/kits/<file>.ts` — must end ALL PASS
  (0 FAIL). Fix until green. This is your completion gate.

## Report back (<= 150 words)

List: files written; per kit the counts (theory/mcqs/cases/problems/topics);
case-audit result line; the two case topic ids per kit; any figure you wanted
but the facts file lacked (so the next facts dump can add it).

## Rich formatting for brief[] and dayInLife[] (MANDATORY for all new/retrofit prose)

The kit page renders brief paragraphs and day-in-the-life beats through the
`RichText` component (`src/components/learn/rich-text.tsx`). Write plain TS
strings with these inline markers — they render as colored/bold/italic/mono:

- `**bold**` -> strong near-white. Use for: key numbers, company-specific
  nouns, the beat's headline fact ("**2.98-day average delivery latency**").
- `*italic*` -> em. Use for: asides, stakeholder voice, hedged framing
  ("*the CFO reads this every Monday*").
- `` `code` `` -> mono chip. Use for: table/column names, SQL fragments,
  metric expressions ("`order_items`", "`shipped_at - created_at`").
- `{color:text}` -> colored semibold. Colors: amber, emerald, sky, rose,
  violet, orange, pink. Use for: KPI names, statuses, domain flavor words
  ("{rose:cancelled}", "{emerald:delivered}", "{amber:GMV}").

Rules:
- Markers do NOT nest; write them flat. Never put a `{color:...}` inside
  `**...**` or vice versa.
- 2-5 markers per paragraph is the sweet spot (a wall of markers is as bad
  as none). Every dayInLife beat MUST open with a bold time anchor:
  `"**09:30 —** dashboard refresh ..."` style.
- Never escape braces in strings for marker purposes; markers are literal.
- Facts discipline is unchanged: every number still comes verbatim from
  scripts/company-facts.md. Formatting decorates truth, never invents it.
- dayInLife beats read like a story arc (morning fire-fight -> midday deep
  work -> stakeholder moment -> EOD writeup), each beat 3-5 sentences.
