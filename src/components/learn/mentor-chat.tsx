"use client";

// AI Mentor — chat surface for the schema-grounded tutor.
//
// Context comes from the mentor-context store: graded surfaces (lesson
// problems, practice lab) drop the learner's last failed query there, and the
// mentor opens already pointed at it. Hint rungs are learner-driven:
// Nudge (no SQL) -> Direction (skeleton) -> Solution (full query).

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useMentorContext } from "@/lib/mentor-context";
import { cn } from "@/lib/utils";
import { RichNodes } from "./rich";
import { SqlNodes } from "./sql-code";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const LS_KEY = "seeql.mentor-chat";
const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey — I'm your **SQL mentor**. I know the storefront schema (`customers`, `orders`, `invoices`, 9 tables total), and when a query fails in a lesson or the practice lab, it lands here attached and ready to debug.\n\nAsk me anything, paste a query, or tap a hint rung on the attached card.",
};
const MAX_INPUT = 4000;

/** Render mentor prose: fenced sql blocks become code, the rest goes through Rich. */
function MentorRich({ text }: { text: string }) {
  const parts = text.split(/```(?:sql)?\n?([\s\S]*?)```/g);
  return (
    <div className="flex flex-col gap-2">
      {parts.map(
        (p, i) =>
          i % 2 === 1 ? (
            <pre
              key={i}
              className="thin-scrollbar overflow-x-auto rounded-md border border-zinc-800 bg-zinc-900/70 px-2.5 py-2 font-mono text-[11px] leading-5 text-zinc-200"
            >
              <SqlNodes text={p.replace(/\n+$/, "")} />
            </pre>
          ) : p.trim() ? (
            <p key={i} className="text-[13px] leading-6 text-zinc-300">
              <RichNodes text={p.trim()} />
            </p>
          ) : null,
      )}
    </div>
  );
}

export function MentorChat() {
  const [messages, setMessages] = useState<Msg[] | null>(null); // null = hydrating
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const failure = useMentorContext((s) => s.failure);
  const clearFailure = useMentorContext((s) => s.clearFailure);
  const scrollRef = useRef<HTMLDivElement>(null);

  // hydrate from localStorage (survives view switches)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? (JSON.parse(raw) as Msg[]) : null;
      setMessages(
        Array.isArray(parsed) && parsed.length > 0 && parsed.every((m) => m && typeof m.content === "string")
          ? parsed.slice(-30)
          : [GREETING],
      );
    } catch {
      setMessages([GREETING]);
    }
  }, []);

  // persist + autoscroll
  useEffect(() => {
    if (!messages) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* private mode */
    }
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  function contextPayload(hintLevel?: number) {
    if (!failure) return { hintLevel: hintLevel ?? null };
    return {
      sql: failure.sql,
      error: failure.error,
      note: failure.note,
      source: failure.source,
      hintLevel: hintLevel ?? null,
    };
  }

  async function callMentor(history: Msg[], hintLevel?: number) {
    setSending(true);
    setErr(null);
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          context: contextPayload(hintLevel),
        }),
      });
      const data = (await res.json()) as { ok: boolean; reply?: string; error?: string };
      if (data.ok && data.reply) {
        setMessages((prev) => [...(prev ?? []), { role: "assistant", content: data.reply as string }]);
      } else {
        setErr(data.error ?? "The mentor could not reply — try again.");
      }
    } catch {
      setErr("Network hiccup — the mentor could not be reached.");
    } finally {
      setSending(false);
    }
  }

  function send(text: string, hintLevel?: number) {
    const t = text.trim().slice(0, MAX_INPUT);
    if (!t || sending || messages === null) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    void callMentor(next, hintLevel);
  }

  function clearChat() {
    setMessages([GREETING]);
    setErr(null);
  }

  const hasContext = failure !== null;
  const attached = failure;

  return (
    <div className="flex max-w-2xl flex-col">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="sheen flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/[0.08]">
            <Bot className="h-4.5 w-4.5 text-emerald-300" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-[-0.02em] text-zinc-50">AI Mentor</h1>
            <p className="text-[11px] text-zinc-500">grounded on the live storefront schema · tiered hints, never spoilers</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear conversation"
          className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* attached failure card */}
      {attached && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="sheen mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Attached · {attached.source} · {new Date(attached.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <button
              onClick={clearFailure}
              title="Detach context"
              className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <pre className="thin-scrollbar mt-2 max-h-28 overflow-auto rounded-md border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-2 font-mono text-[11px] leading-5 text-zinc-300">
            {attached.sql}
          </pre>
          {attached.error && (
            <p className="mt-2 rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-rose-300">
              {attached.error}
            </p>
          )}
          {attached.note && !attached.error && (
            <p className="mt-2 rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-2.5 py-1.5 text-[11px] text-amber-200">
              {attached.note}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {attached.error ? (
              <button
                onClick={() => send("Explain what this database error means in plain English, and how to start fixing it.")}
                disabled={sending}
                className="rounded-full border border-rose-400/30 bg-rose-400/[0.06] px-3 py-1 text-[11px] font-medium text-rose-300 transition-colors hover:bg-rose-400/[0.12] disabled:opacity-40"
              >
                Explain this error
              </button>
            ) : (
              <button
                onClick={() => send("Diagnose why my attached query gets the wrong result.")}
                disabled={sending}
                className="rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-3 py-1 text-[11px] font-medium text-amber-200 transition-colors hover:bg-amber-400/[0.12] disabled:opacity-40"
              >
                Why is it wrong?
              </button>
            )}
            <span className="mx-1 hidden items-center text-[10px] text-zinc-600 sm:flex">hint ladder:</span>
            {[
              { label: "1 · Nudge", level: 1 },
              { label: "2 · Direction", level: 2 },
              { label: "3 · Solution", level: 3 },
            ].map((h) => (
              <button
                key={h.level}
                onClick={() =>
                  send(
                    h.level === 1
                      ? "I'm stuck — give me a rung-1 nudge for the attached query. Don't write any SQL."
                      : h.level === 2
                        ? "Still stuck — point me in the right direction (rung 2)."
                        : "Okay — walk me through the full solution (rung 3).",
                    h.level,
                  )
                }
                disabled={sending}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-40",
                  h.level === 3
                    ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300 hover:bg-emerald-400/[0.12]"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-900",
                )}
              >
                {h.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* messages */}
      <div
        ref={scrollRef}
        className="thin-scrollbar mt-4 flex max-h-[52vh] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5"
      >
        {messages === null ? (
          <p className="mx-auto my-auto text-xs text-zinc-600">Loading conversation…</p>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-lg rounded-br-sm border border-emerald-400/25 bg-emerald-400/[0.08] px-3 py-2 text-[13px] leading-6 text-zinc-200">
                  {m.content}
                </div>
              </div>
            ) : (
              <motion.div
                key={i}
                initial={i === 0 ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "max-w-[92%] rounded-lg rounded-bl-sm border px-3 py-2.5",
                  i === 0 ? "border-zinc-800/70 bg-transparent" : "border-zinc-800 bg-zinc-900/50",
                )}
              >
                <MentorRich text={m.content} />
              </motion.div>
            ),
          )
        )}
        {sending && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-300" />
            Mentor is thinking…
          </div>
        )}
      </div>

      {err && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3 py-2 text-[11px] text-rose-300">
          <span className="min-w-0 truncate">{err}</span>
          <button
            onClick={() => {
              setErr(null);
              if (messages && messages.length > 0) void callMentor(messages);
            }}
            className="shrink-0 rounded border border-rose-400/40 px-2 py-0.5 transition-colors hover:bg-rose-400/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* input */}
      <div className="mt-3">
        <div className="flex items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2 focus-within:border-emerald-400/40">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder={hasContext ? "Ask about the attached query…" : "Ask anything, or paste your SQL…"}
            className="thin-scrollbar max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] leading-6 text-zinc-200 outline-none placeholder:text-zinc-600"
            aria-label="Message the AI mentor"
          />
          <button
            onClick={() => send(input)}
            disabled={sending || input.trim().length === 0}
            className="btn-glow flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-emerald-400 px-3 text-xs font-medium text-[#052e1c] transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </div>
        {input.length > MAX_INPUT - 200 && (
          <p className="tnum mt-1 text-right text-[10px] text-zinc-600">
            {input.length}/{MAX_INPUT}
          </p>
        )}
      </div>
    </div>
  );
}
