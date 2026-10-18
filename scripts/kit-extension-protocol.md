# Kit Extension Protocol — thin kit → fully extended

You are extending COMPANY KIT files (thin kits at baseline: 10 MCQ / 8 theory / 2 cases / 16 problems)
to FULL depth (30 MCQ / 24 theory / 6 cases / 32 problems). Work ONLY on the kit files assigned to you.

## RESUME RULE (read first — many kits are partially extended)

Your Task call will be HARD-CUT at ~10 minutes. Pace accordingly:
1. Start by counting your assigned kits' current state:
   `cd /home/z/my-project && bun -e 'import {COMPANY_KITS} from "./src/lib/companies/registry"; for (const id of ["<kit1>","<kit2>"]) { const k=COMPANY_KITS[id]; console.log(id, k.mcqs.length, k.theory.length, k.cases.length, k.problems.length); }'`
2. A kit is DONE only at mcq=30 theory=24 cases=6 problems=32. Finish PARTIAL kits first (continue id numbering
   from the current max in each array), then untouched kits, in your assigned order.
3. Make every Edit append complete, well-formed entries — a kit you leave mid-way must still compile.
4. If a file fails tsc because a previous agent's run was cut mid-entry, repair minimally: close or remove the
   dangling partial entry, keep everything else.
5. Budget ~4–5 minutes per kit. If you can only finish one kit, finish it COMPLETELY (including case-audit green)
   rather than leaving two half-done.

## Before touching anything

1. Read this protocol fully.
2. Read the REFERENCE extended kit: `src/lib/companies/kits/amazon.ts` — mirror its entry shapes,
   prose depth, and voice exactly. Your output must be indistinguishable in style from it.
3. Read your target kit file FULLY. Note:
   - the id prefix + highest number in EACH array (`{...}-mcq-{n}`, `{...}-t{n}` / `{prefix}-t{n}`, `cs-{co}-{n}`)
     — prefixes VARY per kit (some use full id `mailchimp-t1`, some a short prefix `amz-t1`). Mirror what the file already uses.
   - the existing MCQ prompts, theory tags, problem slugs, case topics (never duplicate them — your additions must cover NEW ground)
   - the company overview paragraphs, metrics, topics: this is your business-context source. Every question, answer
     explanation and problem "why" must be flavored with THIS company's real workflows, KPIs and interview style.

## What to add to each kit (in this order)

### 1. +20 MCQs (→ 30 total)
Append to `mcqs`. Entry shape (exactly like amazon.ts):
```ts
{
  id: "<existing-prefix>-mcq-<next>",           // continue numbering, no gaps
  prompt: "...",                                // 1–3 sentences, company-context grounded; may embed a short SQL snippet in backticks
  choices: ["...", "...", "...", "..."],        // exactly 4, all plausible; no "all of the above"
  answer: 1,                                    // 0-based index of the correct choice
  why: "...",                                   // 2–4 sentences: why the right answer is right AND what misconception it tests
  notes: [                                      // 2 entries typical: per-distractor coaching
    { choice: 2, why: "why THIS wrong choice tempts people and why it fails" },
    { choice: 3, why: "..." },
  ],
  difficulty: "easy" | "medium" | "hard",       // ~7 easy / 7 medium / 6 hard across your 20
}
```
- Never restate an existing prompt's concept with the same query shape; escalate or vary the business angle.
- Cover the topics the existing 10 MCQs ignore (read the kit's `topics` for the map).
- Company flavor is mandatory: numbers/scenarios from their domain (e.g. Bolt: rides and surge windows; Intercom: conversation threads and response SLAs).

### 2. +16 theory Q&As (→ 24 total)
Append to `theory`:
```ts
{ id: "<existing-prefix>-t<next>", q: "...", a: "...", tag: "windows" }
```
- `q`: verbatim interviewer phrasing ("Walk me through...", "Why does...").
- `a`: the model answer a strong candidate says out loud — 3–6 sentences, concrete, no fluff, use the company's vocabulary.
- `tag`: one-word family; reuse the file's existing tag vocabulary where it fits (joins, windows, groupby, nulls, casing, indexes, ...).

### 3. +4 case studies (→ 6 total) — the hard part
Append to `cases`. Every case MUST pass the mechanical audit:
`bun scripts/case-audit.ts src/lib/companies/kits/<kit>.ts`
Run it after EACH case you add (the audit loads the whole file; fix and rerun until green). What the audit enforces:
- id format/uniqueness, valid `topic` + `universe`, slot count 1–9, `{1}…{9}` template markers each used EXACTLY once and matching slots 1:1,
- 2–4 `distractors`, none duplicating any slot answer, every keyword-distractor must change the query outcome (or make it fail to execute),
- number slots: the claimed figure MUST appear in the result cells of the filled query run on a copy of `db/custom.db` (max 3 `noVerify` slots),
- prose-quality minimums on brief/ask/walkthrough/slot-why lengths,
- single read-only statement; topic grammar: l-topics + cap = NO JOIN; j-topics = JOIN required; s/t/x/q topics have their own grammar — mirror the topic's existing cases in amazon.ts / other extended kits.

Authoring workflow per case (do it in this order — it is the only way figures are honest):
1. Pick a business question in one of the 10 universes (month-close, refund-audit, pricing, inventory, funnel, supplier, expense, growth, fraud, catalog).
2. Write the completed SQL and RUN it against the live db first:
   `sqlite3 -readonly db/custom.db "SELECT ..."` — inspect `.schema` / table list first with `sqlite3 db/custom.db ".tables"`.
   The storefront db is the single source of truth: orders, order_items, customers, products, etc.
3. Note the real figures from the result and cite them in the `brief` (like amazon's "103 orders, 16 buyers, 14 of them repeat").
4. Choose 1–9 slots pulling exact figures/keywords out of the query; write per-slot `label` + `why` coaching.
5. Craft 2–4 `distractors` that a hurried analyst would grab; verify mentally each changes the result or breaks the query.
6. Write the `walkthrough` (the how-an-analyst-thinks narration, 3–6 sentences).
7. Run the audit for this file; fix every complaint; do not move on while red.

Valid topic codes (use ones matching your SQL's grammar): l1–l8, cap (no JOIN); j1–j8 (JOIN required);
s1–s8 (strings/CASE), t1–t8 (window/CTE tier), q1–q8, x1–x8, p1–p4 — check `CASE_TOPICS` in `src/lib/curriculum/cases/types.ts`
if unsure, and mirror which codes the existing kit cases in your file use.

### 4. +16 problems (→ 32 total)
Append to `problems`:
```ts
{ slug: "...", why: "..." },
```
- slugs MUST come from `scripts/band-slugs.txt` (419 valid band slugs — copy exactly). Any slug not in that file will break the kit page.
- 16 NEW slugs not already in the kit file.
- `why`: 1–2 sentences — what the slug drills + why THIS company leans on it (their workflow, their interview style). No generic filler.
- Also weave each new slug into the most relevant existing `topics[].slugs` array (dedupe; 1–3 topics per slug max).

### 5. Update the kit overview prose
The overview paragraphs cite the OLD counts (e.g. "sixteen problems", "run both case studies"). Update them to the new
reality (thirty-two problems, six case studies, thirty MCQs) in the same voice, keeping any `{color:...}` inline markup style,
and mirror amazon's "built for spaced practice rather than one sitting" framing. Do not touch tagline/accent/metrics.

## Hard constraints

- Touch ONLY the kit files assigned to you. Never edit amazon.ts, types, registry, views, or anything else.
- NEVER modify or delete an existing entry — append only (exception: the overview prose count update).
- Preserve 2-space indent and the file's existing formatting; your appended entries must look native.
- Keep ids unique across your additions; continue numbering with no gaps.
- After EACH kit: `bunx tsc --noEmit 2>&1 | rg "kits/<kit>"` must show 0 errors for your file (global baseline noise elsewhere is expected).
- The final per-kit state: mcqs=30, theory=24, cases=6 (ALL passing case-audit), problems=32.

## Worklog

Before starting, read the tail of `/home/z/my-project/worklog.md` (last ~100 lines) for context.
When done with your whole batch, append a section:
```
---
Task ID: <your task id>
Agent: kit-extension-<your batch>
Task: extend kits <list> to full depth

Work Log:
- <per-kit one-liner: counts added, audit status>

Stage Summary:
- <kits done, cases passing, any anomalies>
```
