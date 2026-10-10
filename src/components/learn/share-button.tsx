"use client";

// ShareCardButton — renders a share card from a CardSpec and hands the PNG
// to the platform (native share sheet where supported, download otherwise).
// Two shapes: the labelled button for result screens, and a quiet icon for
// dense rows (leaderboard records, badge tiles). Failures toast quietly —
// a share attempt must never feel like a crash.

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { renderCardPng, shareOrDownload, type CardSpec } from "@/lib/share-cards";
import { celebrate } from "./celebrate";
import { Btn } from "./ui/kit";
import { cn } from "@/lib/utils";

async function makeCard(spec: CardSpec, filename: string): Promise<"shared" | "downloaded"> {
  const blob = await renderCardPng(spec);
  return shareOrDownload(blob, filename, spec.headline);
}

export function ShareCardButton({
  spec,
  filename,
  label = "Share card",
  variant = "soft",
  className,
}: {
  spec: CardSpec;
  filename: string;
  label?: string;
  variant?: "primary" | "soft" | "outline" | "ghost" | "pill";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const how = await makeCard(spec, filename);
      if (how === "downloaded") {
        celebrate({ kind: "info", title: "Card saved", sub: "The PNG is in your downloads — share it anywhere." });
      }
    } catch {
      celebrate({ kind: "info", title: "Couldn't make the card", sub: "The canvas export was blocked by the browser." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Btn variant={variant} onClick={go} disabled={busy} className={className} aria-label={label} title={label}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
      {label}
    </Btn>
  );
}

/** Icon-only variant for rows and tiles. */
export function ShareCardIcon({ spec, filename, label, className }: { spec: CardSpec; filename: string; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const go = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const how = await makeCard(spec, filename);
      if (how === "downloaded") {
        celebrate({ kind: "info", title: "Card saved", sub: "The PNG is in your downloads — share it anywhere." });
      }
    } catch {
      celebrate({ kind: "info", title: "Couldn't make the card", sub: "The canvas export was blocked by the browser." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={go}
      disabled={busy}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-emerald-300 disabled:opacity-40",
        className,
      )}
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
    </button>
  );
}
