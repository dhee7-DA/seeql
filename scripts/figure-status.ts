// Full visual-coverage status: per-lesson diagram counts vs the 3-per-lesson goal.
import { LESSONS } from "../src/lib/curriculum/lessons";

function* walk(blocks: unknown[]): Generator<{ kind: string; figure?: string }> {
  for (const b of blocks as Array<Record<string, unknown>>) {
    if (!b || typeof b !== "object") continue;
    yield b as { kind: string; figure?: string };
    if (Array.isArray(b.blocks)) yield* walk(b.blocks);
    if (Array.isArray(b.sections)) for (const s of b.sections) if (Array.isArray((s as Record<string, unknown>).blocks)) yield* walk((s as Record<string, unknown>).blocks as unknown[]);
    if (Array.isArray(b.steps)) yield* walk(b.steps);
  }
}

const perLesson: Array<{ id: string; num: number; title: string; n: number }> = [];
for (const l of LESSONS as Array<Record<string, unknown>>) {
  const figs = [...walk((l.blocks ?? []) as unknown[])].filter((b) => b.kind === "diagram" && b.figure);
  perLesson.push({ id: l.id as string, num: Number(l.num), title: l.title as string, n: figs.length });
}

const hist = new Map<number, number>();
perLesson.forEach((l) => hist.set(l.n, (hist.get(l.n) ?? 0) + 1));
console.log("histogram (figures per lesson):");
[...hist.entries()].sort((a, b) => a[0] - b[0]).forEach(([n, c]) => console.log(`  ${n} figure(s): ${c} lessons`));

const totalRefs = perLesson.reduce((s, l) => s + l.n, 0);
console.log(`\ntotal refs: ${totalRefs} · lessons: ${perLesson.length} · 3-per-lesson target: ${perLesson.length * 3} · shortfall: ${Math.max(0, perLesson.length * 3 - totalRefs)}`);

const byMod = new Map<string, { refs: number; deficient: number[]; label: string }>();
perLesson.forEach((l) => {
  const m = l.id.replace(/-\d+$/, "");
  const key = m;
  const e = byMod.get(key) ?? { refs: 0, deficient: [], label: m };
  e.refs += l.n;
  if (l.n < 3) e.deficient.push(l.num);
  byMod.set(key, e);
});
console.log("\nper module:");
for (const [, e] of [...byMod.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const count = perLesson.filter((l) => l.id.startsWith(e.label)).length;
  console.log(`  ${e.label}: refs=${e.refs}/${count * 3} · lessons under 3: ${e.deficient.join(",") || "—"}`);
}

console.log("\nlessons under 3 figures:");
perLesson.filter((l) => l.n < 3).forEach((l) => console.log(`  L${String(l.num).padStart(2, "0")} (${l.n}) — ${l.title}`));
