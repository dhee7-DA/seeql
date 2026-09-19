import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// AI Mentor — backend for the in-app SQL tutor.
//
// Grounding: the mentor knows the REAL storefront schema (the same DDL that
// sample-db.ts creates) and the learner's last failed query/error, dropped by
// the grading surfaces into the client mentor-context store and sent here.
//
// Teaching policy: tiered hints. hintLevel 1 = nudge (no SQL), 2 = direction
// (clauses/tables, skeleton at most), 3 = full solution with a walkthrough.
// The learner chooses the rung; the mentor never skips ahead of it.

const MAX_MESSAGE_CHARS = 4_000;
const MAX_HISTORY = 12; // messages sent to the model (excluding system)
const MAX_SQL_CHARS = 2_000;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface MentorContextBody {
  sql?: string | null;
  error?: string | null;
  note?: string | null;
  source?: string | null;
  /** 1 = nudge, 2 = direction, 3 = full solution. */
  hintLevel?: number | null;
}

const SCHEMA_DIGEST = `SQLite 3 storefront database ("SeeQL" course), 9 tables:

customers(id PK, name TEXT, email TEXT, city TEXT, region TEXT, active INTEGER 0/1, created_at TEXT 'YYYY-MM-DD')
suppliers(id PK, name TEXT, region TEXT, rating REAL 0-5)
products(id PK, name TEXT, category TEXT, price REAL, stock INTEGER, supplier_id INTEGER -> suppliers.id)
orders(id PK, customer_id INTEGER -> customers.id, status TEXT, total REAL, created_at TEXT 'YYYY-MM-DD', shipped_at TEXT nullable)
order_items(id PK, order_id INTEGER -> orders.id, product_id INTEGER -> products.id, quantity INTEGER, unit_price REAL)
invoices(id PK, customer_id INTEGER -> customers.id, number TEXT like 'INV-2025-001', issued_on TEXT, due_on TEXT, amount_cents INTEGER, status TEXT)
payments(id PK, invoice_id INTEGER -> invoices.id, paid_on TEXT, amount_cents INTEGER, method TEXT)
expenses(id PK, category TEXT, vendor TEXT, spent_on TEXT, amount_cents INTEGER)
ledger_entries(id PK, entry_date TEXT, account TEXT, debit_cents INTEGER, credit_cents INTEGER, memo TEXT)

Verified facts: regions are only 'EU' | 'US' | 'APAC' | 'LATAM'; active is 1/0 not 'yes'/'no'; invoices/payments/expenses/ledger money is in CENTS (divide by 100.0 for display); dates are TEXT in ISO order; ids start at 1 and are dense. Status values are lowercase strings (probe with SELECT DISTINCT if unsure). There is no 'north' region and no 'returned' order status.`;

const PERSONA = `You are the SeeQL Mentor — a patient, sharp SQL tutor living inside an interactive SQLite course. The learner is chatting mid-exercise.

Rules of the house:
- Ground every claim in the SCHEMA above. Never invent tables, columns or rows. If a data value is unknown, say how to probe it (e.g. SELECT DISTINCT) instead of guessing.
- SQLite dialect only (no DATE_TRUNC, ILIKE, TOP, ENUM, ADD COLUMN ... AFTER).
- Be concise: at most ~120 words unless the learner asked for depth. Prefer one short paragraph + optionally one code block. Plain text with **bold**, \`inline code\`, and \`\`\`sql fenced blocks.
- Warm but never gushing. No emojis. Teach the WHY, name the concept (e.g. "this is a correlated subquery"), then make it concrete against the storefront tables.
- If the message is off-topic (not SQL, data, or this course), answer in one sentence and steer back.
- If the learner's SQL is attached, read it carefully first — quote their actual column/clause names when explaining.`;

function hintPolicy(level: number): string {
  if (level <= 1) {
    return `HINT RUNG 1 — NUDGE. Do NOT write any SQL, not even a fragment. Ask ONE guiding question and name the concept or clause they should think about. Max 3 sentences.`;
  }
  if (level === 2) {
    return `HINT RUNG 2 — DIRECTION. Name the tables, joins, clauses or functions the solution needs and the order to think about them. You may show a tiny SKELETON with placeholders (e.g. SELECT ... FROM ... GROUP BY ...) but NO literal column names that give the answer away, and no complete working query.`;
  }
  return `HINT RUNG 3 — FULL SOLUTION. Give the complete working SQL in one \`\`\`sql block, then a short walkthrough of each step and WHY it works. Keep the walkthrough under 6 bullet-ish lines.`;
}

function systemPrompt(ctx: MentorContextBody): string {
  const parts = [PERSONA, `SCHEMA:\n${SCHEMA_DIGEST}`];
  const attached =
    ctx.sql || ctx.error || ctx.note
      ? [
          `ATTACHED CONTEXT — the learner's most recent failed attempt${ctx.source ? ` (from ${ctx.source})` : ""}:`,
          ctx.sql ? `SQL:\n${ctx.sql}` : null,
          ctx.error ? `DATABASE ERROR: ${ctx.error}` : null,
          ctx.note ? `GRADER NOTE: ${ctx.note}` : null,
          ctx.error
            ? `Default job: explain in plain English what SQLite is actually complaining about, map it to their SQL, and name the general class of mistake. Still respect the hint rung below before handing out fixes.`
            : `Default job: diagnose why the query grades wrong (columns, row count, ordering, or logic) even though it may run cleanly. Respect the hint rung below.`,
        ].filter(Boolean)
      : [`No query is attached. If they ask for help "with my query", invite them to paste it or run it once in a graded exercise.`];
  parts.push(attached.join("\n"));
  parts.push(
    ctx.hintLevel && ctx.hintLevel >= 1
      ? hintPolicy(ctx.hintLevel)
      : `No explicit hint rung this turn — if they are stuck on the attached query, answer at rung 1; if it is a concept question, answer it directly.`,
  );
  return parts.join("\n\n");
}

function clampHistory(messages: unknown): ChatMsg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is ChatMsg =>
        m !== null &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: unknown; context?: MentorContextBody };
    const history = clampHistory(body.messages);
    if (history.length === 0) {
      return NextResponse.json({ ok: false, error: "No message provided." }, { status: 200 });
    }
    const ctx: MentorContextBody = {
      sql: typeof body.context?.sql === "string" ? body.context.sql.slice(0, MAX_SQL_CHARS) : null,
      error: typeof body.context?.error === "string" ? body.context.error.slice(0, 300) : null,
      note: typeof body.context?.note === "string" ? body.context.note.slice(0, 300) : null,
      source: typeof body.context?.source === "string" ? body.context.source.slice(0, 80) : null,
      hintLevel:
        typeof body.context?.hintLevel === "number" && body.context.hintLevel >= 1
          ? Math.min(3, Math.round(body.context.hintLevel))
          : null,
    };

    const zai = await ZAI.create();
    const messages = [
      { role: "assistant" as const, content: systemPrompt(ctx) },
      ...history,
    ];

    // Two attempts — the SDK occasionally hiccups; a retry is invisible to the learner.
    let reply = "";
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });
        const content = completion.choices[0]?.message?.content ?? "";
        if (content.trim().length > 0) {
          reply = content.trim();
          break;
        }
        lastErr = new Error("Empty completion");
      } catch (err) {
        lastErr = err;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 900));
      }
    }
    if (!reply) {
      const msg = lastErr instanceof Error ? lastErr.message : "Mentor unavailable";
      return NextResponse.json({ ok: false, error: msg }, { status: 200 });
    }
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mentor unavailable";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
