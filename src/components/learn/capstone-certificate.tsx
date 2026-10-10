"use client";

// Capstone certificate — the trophy for clearing a project A→Z. A flat,
// PRINT-ABLE card: your name (editable, remembered across sessions), the
// project you conquered, the questions cleared, the XP earned, dated today.
// Print (→ save as PDF) produces the real artifact; the PNG share card
// stays on the completion panel for social sharing. The card itself is
// always white-on-ink regardless of theme, because paper doesn't have
// themes.

import { useEffect, useState } from "react";
import { Award, Printer, X } from "lucide-react";

const NAME_KEY = "seeql.cert.name.v1";

export function CapstoneCertificate({
  onClose,
  table,
  domainLabel,
  doneCount,
  total,
  earnedXp,
}: {
  onClose: () => void;
  table: string;
  domainLabel: string;
  doneCount: number;
  total: number;
  earnedXp: number;
}) {
  // Read the remembered name lazily at mount — the component only mounts
  // when the certificate is opened, so localStorage is always available.
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      /* private mode — the name just won't be remembered */
      return "";
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {
      /* private mode */
    }
  }, [name]);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const who = name.trim();

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/70 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Capstone certificate"
    >
      {/* print rule: when the user hits Print, ONLY the certificate card
          renders — the app shell, nav and this backdrop all disappear */}
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #seeql-cert, #seeql-cert * { visibility: visible !important; }
        #seeql-cert { position: fixed; inset: 0; margin: auto; width: min(680px, 96%); height: fit-content; }
      }`}</style>

      <div className="flex min-h-full items-center justify-center">
        <div>
          {/* the certificate — always paper-white, theme-independent. Every
              color below is a LITERAL hex: the app's theme engine remaps
              zinc/emerald utility classes per theme (text-zinc-900 becomes
              white on light themes), which would print invisible text on
              this always-white card. */}
          <div
            id="seeql-cert"
            className="w-full max-w-[680px] rounded-xl border-2 border-[#d4d4d8] bg-white p-1.5 text-[#18181b] shadow-2xl"
          >
            <div className="rounded-lg border border-[#e4e4e7] px-6 py-8 text-center sm:px-10 sm:py-10">
              <div className="flex items-center justify-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#059669] text-white">
                  <Award className="h-6 w-6" />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#71717a]">
                  SeeQL · Capstone certificate
                </p>
              </div>

              <p className="mt-7 text-[13px] text-[#71717a]">This certifies that</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="type your name"
                aria-label="Your name on the certificate"
                className="mt-2 w-full border-b border-[#d4d4d8] bg-transparent pb-1 text-center font-display text-2xl font-semibold tracking-[-0.02em] text-[#18181b] outline-none transition-colors placeholder:text-[#d4d4d8] focus:border-[#059669] sm:text-3xl"
              />
              <p className="mx-auto mt-4 max-w-[52ch] text-[13px] leading-6 text-[#3f3f46]">
                {who ? who : "You"} took an unclean <span className="font-semibold text-[#18181b]">{table}</span> file
                from first peek to a defended conclusion — a full A→Z analyst project on{" "}
                <span className="font-semibold text-[#18181b]">{domainLabel}</span> data.
              </p>

              <div className="mx-auto mt-6 grid max-w-[520px] grid-cols-3 overflow-hidden rounded-lg border border-[#e4e4e7]">
                <div className="border-r border-[#e4e4e7] px-2 py-3">
                  <p className="tnum font-display text-xl font-semibold text-[#18181b]">
                    {doneCount}/{total}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717a]">
                    questions cleared
                  </p>
                </div>
                <div className="border-r border-[#e4e4e7] px-2 py-3">
                  <p className="tnum font-display text-xl font-semibold text-[#059669]">{earnedXp}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717a]">xp earned</p>
                </div>
                <div className="px-2 py-3">
                  <p className="tnum font-display text-xl font-semibold text-[#18181b]">A→Z</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717a]">
                    stages completed
                  </p>
                </div>
              </div>

              <p className="mx-auto mt-6 max-w-[56ch] border-t border-[#e4e4e7] pt-5 text-[12px] italic leading-6 text-[#71717a]">
                “Every query you cleared was graded against the real data — no vibes, no participation trophies.
                Wherever the next messy file finds you, you already know what to do first.”
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a1a1aa]">— SeeQ, study buddy</p>

              <div className="mt-7 flex items-end justify-between text-left">
                <div>
                  <p className="tnum text-[12px] font-semibold text-[#3f3f46]">{today}</p>
                  <p className="mt-0.5 w-36 border-t border-[#d4d4d8] pt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717a]">
                    date
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[13px] font-semibold text-[#3f3f46]">seeql.app</p>
                  <p className="mt-0.5 w-36 border-t border-[#d4d4d8] pt-1 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717a]">
                    verified course
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* controls live OUTSIDE the cert card so printing never shows them */}
          <div className="mt-4 flex items-center justify-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="btn-glow flex items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-[var(--brand-ink)] transition-colors hover:bg-emerald-300"
            >
              <Printer className="h-3.5 w-3.5" /> Print / save as PDF
            </button>
            <button
              onClick={onClose}
              className="btn-quiet flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
          <p className="mt-2 text-center font-mono text-[10px] text-zinc-500 print:hidden">
            Tip: choose “Save as PDF” as the printer to keep a file — your name is remembered for next time.
          </p>
        </div>
      </div>
    </div>
  );
}
