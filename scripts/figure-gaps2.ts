// Recursive figure scan — handles nested section blocks. True coverage map.
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

const referenced = new Set<string>();
const holes: Array<{ id: string; title: string; kinds: string }> = [];
let totalRefs = 0;
for (const l of LESSONS as Array<Record<string, unknown>>) {
  const all = [...walk((l.blocks ?? []) as unknown[])];
  const figs = all.filter(b => b.kind === "diagram" && b.figure);
  figs.forEach(b => { referenced.add(b.figure!); totalRefs++; });
  if (figs.length === 0) {
    const kinds = [...new Set(all.map(b => b.kind))];
    holes.push({ id: String(l.id), title: l.title as string, kinds: kinds.join("+") });
  }
}
console.log(`total diagram refs: ${totalRefs}, unique figures used: ${referenced.size}`);
console.log(`\nDIAGRAM-LESS LESSONS (${holes.length}):`);
holes.forEach(h => console.log(`  ${h.id} — "${h.title}"  [block kinds: ${h.kinds}]`));
