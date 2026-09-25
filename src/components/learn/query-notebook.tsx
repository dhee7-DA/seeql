"use client";

// Query notebook — save a query with a margin note, run it live, keep it
// for later. Entries persist locally (seeql.notebook.v1); one seeded
// starter shows the shape of a good note. Everything runs through the same
// exec helper as the practice lab, so results are the real grid.

import { useState, useSyncExternalStore } from "react";
import { BookMarked, Loader2, Play, Plus, Save, StickyNote, Trash2 } from "lucide-react";
import { Icon3D } from "./ui/icon3d";
import {
  addNote,
  listNotes,
  removeNote,
  subscribeNotes,
  updateNote,
  type NoteEntry,
} from "@/lib/curriculum/notebook";
import { MiniGrid, execSql } from "./practice-kit";
import type { ExecResponse } from "@/lib/sql-types";
import { cn } from "@/lib/utils";
import { SqlEditor } from "../sql-editor";

const EMPTY_EDITOR = { id: null as string | null, title: "", sql: "", note: "" };

export function QueryNotebook() {
  const notes = useSyncExternalStore(subscribeNotes, listNotes, listNotes);
  const [editor, setEditor] = useState(EMPTY_EDITOR);
  const [run, setRun] = useState<{ running: boolean; result: ExecResponse | null }>({ running: false, result: null });
  const [flash, setFlash] = useState<string | null>(null);

  function loadEntry(e: NoteEntry) {
    setEditor({ id: e.id, title: e.title, sql: e.sql, note: e.note });
    setRun({ running: false, result: null });
    setFlash(null);
  }

  function saveNew() {
    if (!editor.sql.trim() && !editor.title.trim()) return;
    const entry = addNote({ title: editor.title, sql: editor.sql, note: editor.note });
    setEditor({ id: entry.id, title: entry.title, sql: entry.sql, note: entry.note });
    setFlash("Saved to your notebook.");
  }

  function update() {
    if (!editor.id) return;
    updateNote(editor.id, { title: editor.title, sql: editor.sql, note: editor.note });
    setFlash("Updated.");
  }

  async function runQuery() {
    const q = editor.sql.trim();
    if (run.running || !q) return;
    setRun({ running: true, result: null });
    const result = await execSql(q);
    setRun({ running: false, result });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <StickyNote className="h-3.5 w-3.5" /> PRACTICE LAB · QUERY NOTEBOOK
      </p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
        <Icon3D name="book" size={40} /> Query notebook
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-zinc-400">
        The queries worth keeping — with a margin note to your future self. Saved on this device, seeded with one worked example; run
        anything live against the sample worlds before you commit it to the page.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* saved list */}
        <aside className="space-y-1.5" aria-label="Saved notebook entries">
          <button
            onClick={() => {
              setEditor(EMPTY_EDITOR);
              setRun({ running: false, result: null });
              setFlash(null);
            }}
            className="btn-quiet flex w-full items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
          >
            <Plus className="h-3.5 w-3.5" /> New entry
          </button>
          {notes.map((e) => (
            <div
              key={e.id}
              className={cn(
                "group flex items-start gap-2 rounded-md border px-3 py-2 transition-colors",
                editor.id === e.id
                  ? "border-emerald-400/40 bg-emerald-400/[0.06]"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600",
              )}
            >
              <button onClick={() => loadEntry(e)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-medium text-zinc-200">{e.title}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">{e.sql.split("\n")[0]}</p>
              </button>
              <button
                onClick={() => {
                  removeNote(e.id);
                  if (editor.id === e.id) setEditor(EMPTY_EDITOR);
                }}
                aria-label={`Delete note ${e.title}`}
                className="rounded p-1 text-zinc-600 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </aside>

        {/* editor */}
        <div className="sheen space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <input
            value={editor.title}
            onChange={(e) => setEditor((s) => ({ ...s, title: e.target.value }))}
            placeholder="Title — what is this query for?"
            aria-label="Entry title"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <div className="overflow-hidden rounded-md border border-zinc-800">
            <SqlEditor
              value={editor.sql}
              onChange={(v) => setEditor((s) => ({ ...s, sql: v }))}
              onVisualize={runQuery}
              className="min-h-[150px]"
            />
          </div>
          <textarea
            value={editor.note}
            onChange={(e) => setEditor((s) => ({ ...s, note: e.target.value }))}
            rows={3}
            placeholder="Margin note — why this works, what tripped you up…"
            aria-label="Margin note"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-xs leading-5 text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runQuery}
              disabled={run.running || !editor.sql.trim()}
              className={cn(
                "btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300",
                (run.running || !editor.sql.trim()) && "cursor-not-allowed opacity-40",
              )}
            >
              {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Run
            </button>
            {editor.id ? (
              <button
                onClick={update}
                className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
              >
                <Save className="h-3.5 w-3.5" /> Update
              </button>
            ) : (
              <button
                onClick={saveNew}
                disabled={!editor.sql.trim() && !editor.title.trim()}
                className={cn(
                  "btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900",
                  !editor.sql.trim() && !editor.title.trim() && "cursor-not-allowed opacity-40",
                )}
              >
                <BookMarked className="h-3.5 w-3.5" /> Save to notebook
              </button>
            )}
            {flash && (
              <span className="font-mono text-xs text-emerald-300" role="status">
                {flash}
              </span>
            )}
          </div>
          {run.result && (
            <div>
              {!run.result.ok ? (
                <div className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-3 font-mono text-xs text-rose-200">
                  {run.result.error}
                </div>
              ) : (
                <>
                  <p className="tnum mb-1.5 text-[11px] text-zinc-500">
                    {run.result.rowCount.toLocaleString()} rows in {run.result.durationMs} ms
                  </p>
                  <MiniGrid columns={run.result.columns} rows={run.result.rows} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
