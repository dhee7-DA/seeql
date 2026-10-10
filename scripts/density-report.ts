// Density analysis: per-lesson exercise counts + prose word volume,
// to ground an honest assessment of content density and find thin spots.
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { fillsFor } from "../src/lib/curriculum/fills";

type Row = {
  num: number; title: string; mod: number;
  mcq: number; fill: number; prob: number;
  words: number; code: number; callouts: number; tables: number;
};

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const rows: Row[] = [];
for (const m of MODULES) {
  for (const l of m.lessons) {
    let w = 0, code = 0, callouts = 0, tables = 0;
    for (const b of l.blocks ?? []) {
      if (b.kind === "p" || b.kind === "h") w += words(b.text);
      else if (b.kind === "bullets" || b.kind === "steps") w += b.items.reduce((a, i) => a + words(i), 0);
      else if (b.kind === "code") { code += 1; if (b.caption) w += words(b.caption); }
      else if (b.kind === "diagram") w += 20; // figures carry explanatory weight; approximate
      else if (b.kind === "tip" || b.kind === "warn") { callouts += 1; w += words(b.text); }
      else if (b.kind === "dialect") { callouts += 1; w += words(b.text); }
      else if (b.kind === "table") { tables += 1; w += words(b.headers.join(" ")) + b.rows.flat().reduce((a, c) => a + words(c), 0); }
    }
    // MCQ explanation prose counts toward teaching volume too
    for (const q of l.mcqs ?? []) w += words(q.why ?? "");
    rows.push({
      num: l.num, title: l.title, mod: m.num,
      mcq: l.mcqs?.length ?? 0, fill: fillsFor(l.num).length, prob: l.problems?.length ?? 0,
      words: w, code, callouts, tables,
    });
  }
}

const stat = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  return { min: s[0], p25: s[Math.floor(s.length * 0.25)], med: s[Math.floor(s.length / 2)], p75: s[Math.floor(s.length * 0.75)], max: s[s.length - 1], avg: (sum / s.length).toFixed(1) };
};

console.log("=== PER-LESSON DRILL COUNTS (quiz questions = mcq + fill) ===");
console.log("lesson | mcq | fill | prob | quizQ | prose-wds | code | callouts | tables");
for (const r of rows) {
  console.log(
    `l${String(r.num).padStart(2, "0")} M${r.mod} | ${String(r.mcq).padStart(3)} | ${String(r.fill).padStart(4)} | ${String(r.prob).padStart(4)} | ${String(r.mcq + r.fill).padStart(5)} | ${String(r.words).padStart(9)} | ${String(r.code).padStart(4)} | ${String(r.callouts).padStart(8)} | ${String(r.tables).padStart(6)}`
  );
}

console.log("\n=== DISTRIBUTIONS ===");
for (const key of ["mcq", "fill", "prob", "words", "code", "callouts"] as const) {
  const s = stat(rows.map((r) => r[key]));
  console.log(`${key.padEnd(9)} min=${s.min} p25=${s.p25} med=${s.med} p75=${s.p75} max=${s.max} avg=${s.avg}`);
}

console.log("\n=== THINNEST 10 BY TOTAL DRILLS (mcq+fill+prob) ===");
[...rows]
  .map((r) => ({ ...r, drills: r.mcq + r.fill + r.prob }))
  .sort((a, b) => a.drills - b.drills)
  .slice(0, 10)
  .forEach((r) => console.log(`l${String(r.num).padStart(2, "0")} M${r.mod} ${r.title} -> drills=${r.drills} (mcq ${r.mcq} + fill ${r.fill} + prob ${r.prob}), prose=${r.words}w`));

console.log("\n=== THINNEST 10 BY PROSE WORDS ===");
[...rows]
  .sort((a, b) => a.words - b.words)
  .slice(0, 10)
  .forEach((r) => console.log(`l${String(r.num).padStart(2, "0")} M${r.mod} ${r.title} -> prose=${r.words}w, drills=${r.mcq + r.fill + r.prob}`));

console.log("\n=== LESSONS WITH <3 CALLOUTS ===");
rows.filter((r) => r.callouts < 3).forEach((r) => console.log(`l${String(r.num).padStart(2, "0")} callouts=${r.callouts} ${r.title}`));

const totals = rows.reduce((a, r) => ({ mcq: a.mcq + r.mcq, fill: a.fill + r.fill, prob: a.prob + r.prob, words: a.words + r.words }), { mcq: 0, fill: 0, prob: 0, words: 0 });
console.log(`\nTOTAL prose words ~${totals.words.toLocaleString()} | avg/lesson ${Math.round(totals.words / rows.length)}w`);
