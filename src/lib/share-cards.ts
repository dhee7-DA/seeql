// Share cards — canvas-rendered PNG result cards for the moments worth
// bragging about (exam pass, blitz record, badge, golf verdict, personal
// records). Zero assets, zero deps: the card is drawn on an offscreen
// <canvas> in the app's flat clay language (zinc-950 ground, hairline
// frame, one accent, the db mark) and handed over as a PNG blob.
//
// Delivery is progressive: navigator.share with a real file when the
// platform supports it (mobile PWA share sheet), a plain download
// otherwise. AbortError (user dismissed the sheet) counts as shared.

export type CardTone = "emerald" | "amber" | "teal";

export interface CardSpec {
  /** Small uppercase kicker above the title, e.g. "MODULE EXAM · PASSED". */
  kicker: string;
  /** The big display line, e.g. "11 / 12". */
  title: string;
  /** Small suffix after the big line, e.g. "correct". */
  titleSuffix?: string;
  /** Human context line under the title. */
  headline: string;
  /** Label/value context rows. */
  lines: Array<[string, string]>;
  tone?: CardTone;
}

const TONES: Record<CardTone, string> = {
  emerald: "#34d399",
  amber: "#fbbf24",
  teal: "#2dd4bf",
};

const W = 900;
const H = 1125;
const PAD = 72;

/** The app is set entirely in Chivo Mono (next/font hashes the family, and
 *  canvas cannot resolve CSS variables) — probe it from a real element and
 *  fall back to the mono stack when probing is unavailable. */
function displayFont(): string {
  try {
    const probe = document.createElement("span");
    probe.className = "font-display";
    probe.style.position = "absolute";
    probe.style.opacity = "0";
    probe.style.pointerEvents = "none";
    document.body.appendChild(probe);
    const family = getComputedStyle(probe).fontFamily || "monospace";
    document.body.removeChild(probe);
    return family;
  } catch {
    return "ui-monospace, monospace";
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Clip a string to a pixel width with an ellipsis. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

/** The brand mark, drawn exactly as brand.tsx draws it: ink rounded square,
 *  three paper data rows, paper lens — all scaled from the 32-unit viewBox. */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const u = (v: number) => (v / 32) * size;
  const paper = "#09090b";
  roundRect(ctx, x, y, size, size, u(7));
  ctx.fillStyle = "#fafafa";
  ctx.fill();
  // data rows (widths 12/16/9 at y 8/13/18)
  const rows: Array<[number, number]> = [
    [12, 8],
    [16, 13],
    [9, 18],
  ];
  for (const [w, ry] of rows) {
    ctx.globalAlpha = ry === 13 ? 0.7 : 0.45;
    ctx.fillStyle = paper;
    roundRect(ctx, x + u(7), y + u(ry), u(w), u(2.4), u(1.2));
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // lens + handle
  ctx.strokeStyle = paper;
  ctx.lineWidth = u(2.4);
  ctx.beginPath();
  ctx.arc(x + u(20), y + u(17), u(6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + u(24.6), y + u(21.6));
  ctx.lineTo(x + u(27.4), y + u(24.4));
  ctx.stroke();
  ctx.lineCap = "butt";
}

function setSpacing(ctx: CanvasRenderingContext2D, px: string) {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = px;
  } catch {
    /* older engines — tracking simply stays default */
  }
}

/** Draw the card. Returns a PNG blob. Throws only if the canvas itself is
 *  unavailable (privacy modes block nothing here; toBlob can fail on
 *  tainted canvases, which we never create). */
export async function renderCardPng(spec: CardSpec): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const S = 2; // 2x for crisp text on share targets
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.scale(S, S);

  const accent = TONES[spec.tone ?? "emerald"];
  const family = displayFont();
  const f = (weight: number, size: number) => `${weight} ${size}px ${family}`;

  // ground + flat corner tabs (solid low-alpha shapes — no gradients)
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fillStyle = "#09090b";
  ctx.fill();
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.clip();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = accent;
  roundRect(ctx, W - 260, -120, 380, 380, 64);
  ctx.fill();
  roundRect(ctx, -140, H - 220, 320, 320, 64);
  ctx.fill();
  ctx.restore();

  // hairline frame
  roundRect(ctx, 20, 20, W - 40, H - 40, 20);
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // kicker
  let y = PAD + 26;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent;
  ctx.font = f(600, 21);
  setSpacing(ctx, "6px");
  ctx.fillText(fitText(ctx, spec.kicker.toUpperCase(), W - PAD * 2), PAD, y);
  setSpacing(ctx, "0px");

  // big title
  y += 128;
  ctx.fillStyle = "#fafafa";
  ctx.font = f(700, 108);
  const title = fitText(ctx, spec.title, W - PAD * 2 - (spec.titleSuffix ? 180 : 0));
  ctx.fillText(title, PAD, y);
  if (spec.titleSuffix) {
    const tw = ctx.measureText(title).width;
    ctx.fillStyle = "#71717a";
    ctx.font = f(500, 24);
    ctx.fillText(spec.titleSuffix.toUpperCase(), PAD + tw + 18, y);
  }

  // headline (word-wrapped to 2 lines)
  y += 54;
  ctx.font = f(500, 30);
  ctx.fillStyle = "#d4d4d8";
  const words = spec.headline.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > W - PAD * 2 && line) {
      lines.push(line);
      line = w;
      if (lines.length === 2) break;
    } else line = next;
  }
  if (lines.length < 2 && line) lines.push(line);
  for (const l of lines.slice(0, 2)) {
    ctx.fillText(fitText(ctx, l, W - PAD * 2), PAD, y);
    y += 42;
  }

  // context rows
  y += 26;
  const rowX2 = W - PAD;
  spec.lines.forEach(([label, value], i) => {
    const top = y + i * 58;
    ctx.strokeStyle = "#1f1f23";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, top);
    ctx.lineTo(rowX2, top);
    ctx.stroke();
    ctx.font = f(500, 24);
    ctx.fillStyle = "#71717a";
    ctx.fillText(fitText(ctx, label, (W - PAD * 2) * 0.55), PAD, top + 38);
    ctx.font = f(600, 24);
    ctx.fillStyle = "#e4e4e7";
    const v = fitText(ctx, value, (W - PAD * 2) * 0.42);
    ctx.fillText(v, rowX2 - ctx.measureText(v).width, top + 38);
  });

  // footer: mark + wordmark + date
  const fy = H - PAD - 10;
  drawMark(ctx, PAD, fy - 52, 52);
  ctx.font = f(600, 22);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText("SeeQL — learn SQL by doing", PAD + 68, fy - 20);
  ctx.font = f(500, 19);
  ctx.fillStyle = "#52525b";
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  ctx.fillText(date, rowX2 - ctx.measureText(date).width, fy - 20);

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("png encoding failed");
  return blob;
}

/** Share the PNG where the platform allows it (Web Share API with files —
 *  the mobile PWA path), download it otherwise. */
export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const canShareFiles =
    nav?.share &&
    typeof (nav as Navigator & { canShare?: (data: ShareData) => boolean }).canShare === "function" &&
    (nav as Navigator & { canShare?: (data: ShareData) => boolean }).canShare!({ files: [file] });
  if (canShareFiles) {
    try {
      await nav!.share({ files: [file], title });
      return "shared";
    } catch (err) {
      // user dismissed the share sheet — not an error
      if ((err as DOMException | undefined)?.name === "AbortError") return "shared";
      throw err;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 4_000);
  return "downloaded";
}

// ---- card factories (pure spec builders — trivially testable) ------------

export function cardForExam(modTitle: string, score: number, total: number, pass: boolean): CardSpec {
  return {
    kicker: pass ? "Module exam · passed" : "Module exam attempt",
    title: `${score} / ${total}`,
    titleSuffix: "correct",
    headline: `${modTitle} — ${pass ? "cleared under the clock." : "not this time — the rematch is on."}`,
    lines: [
      ["verdict", pass ? "PASSED" : "score below the pass line"],
      ["the clock", "12 minutes · 12 questions"],
    ],
    tone: pass ? "emerald" : "amber",
  };
}

export function cardForBlitz(
  points: number,
  isPB: boolean,
  correct: number,
  n: number,
  bestStreak: number,
  best: number,
): CardSpec {
  return {
    kicker: isPB ? "Blitz · new personal best" : "Blitz round",
    title: points.toLocaleString("en-US"),
    titleSuffix: "points",
    headline: isPB ? "The 90-second wall has a new champion." : "90 seconds on the clock — points on the board.",
    lines: [
      ["correct", `${correct} of ${n}`],
      ["best streak", `${bestStreak} in a row`],
      ["personal best", `${best.toLocaleString("en-US")} pts`],
    ],
    tone: isPB ? "amber" : "emerald",
  };
}

export function cardForBadge(badge: { title: string; desc: string }, earnedAt: number): CardSpec {
  return {
    kicker: "Badge unlocked",
    title: badge.title,
    headline: badge.desc,
    lines: [["earned", new Date(earnedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })]],
    tone: "amber",
  };
}

export function cardForGolf(holeTitle: string, verdictTitle: string, strokes: number, par: number): CardSpec {
  return {
    kicker: "Query golf",
    title: `${strokes} ${strokes === 1 ? "stroke" : "strokes"}`,
    titleSuffix: `par ${par}`,
    headline: `${holeTitle} — ${verdictTitle}.`,
    lines: [
      ["the rule", "same rows, fewer strokes"],
      ["grading", "rows first, strokes second"],
    ],
    tone: strokes < par ? "teal" : "emerald",
  };
}

/** Capstone completion — a messy file taken A→Z to a defensible brief. */
export function cardForProject(
  tableName: string,
  domainLabel: string,
  cleared: number,
  total: number,
  xp: number,
): CardSpec {
  return {
    kicker: "Capstone · project complete",
    title: "A → Z",
    titleSuffix: "delivered",
    headline: `${tableName} — a ${domainLabel} mess, taken from first peek to a defended conclusion.`,
    lines: [
      ["questions", `${cleared} of ${total} cleared`],
      ["earned", `${xp.toLocaleString("en-US")} xp on this file`],
      ["the file", "cleaned in public, conclusions on record"],
    ],
    tone: "emerald",
  };
}

/** A single record row as its own card (the leaderboard's per-record share). */
export function cardForRecord(rec: { board: string; label: string; value: string; sub: string }): CardSpec {
  return {
    kicker: `Personal record · ${rec.board}`,
    title: rec.value,
    headline: rec.label,
    lines: [
      ["detail", rec.sub],
      ["opponent", "you, yesterday"],
    ],
    tone: "emerald",
  };
}

/** The leaderboard summary card — the top records in one card. */
export function cardForRecords(rows: Array<{ label: string; value: string }>, xp: number, levelTitle: string): CardSpec {
  return {
    kicker: "SeeQL leaderboard",
    title: `${xp.toLocaleString("en-US")}`,
    titleSuffix: "xp",
    headline: `${levelTitle} — the hall of records, all boards combined.`,
    lines: rows.slice(0, 4).map((r) => [r.label, r.value] as [string, string]),
    tone: "emerald",
  };
}
