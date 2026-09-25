// Debug the two failing m09 fills: l53-f2 (UNION ALL staging), l53-f3 (walk).
import { db } from "../src/lib/db";
import { FILLS_BY_LESSON } from "../src/lib/curriculum/fills/m09";

function completed(template: string, answers: string[]): string {
  return template.replace(/\{(\d+)\}/g, (_m, n) => answers[Number(n) - 1]);
}

async function main() {
  for (const id of ["l53-f2", "l53-f3"]) {
    const f = FILLS_BY_LESSON[53].find((x) => x.id === id)!;
    const sql = completed(f.template, f.answers);
    console.log(`=== ${id} ===\n${sql}`);
    try {
      const rows = await db.$queryRawUnsafe(sql);
      console.log("OK rows:", JSON.stringify(rows).slice(0, 300));
    } catch (e) {
      console.log("ERROR:", (e as Error).message);
    }
  }
}
main();
