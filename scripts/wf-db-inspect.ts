// Dump the seed db schema + row counts + sample rows — authoring facts for the
// window-functions material (same approach as gen-expected.ts).
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts);
  const tables = (await db.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`,
  )) as Array<{ name: string }>;
  for (const t of tables) {
    const cols = (await db.$queryRawUnsafe(`PRAGMA table_info(${t.name})`)) as Array<
      Record<string, unknown>
    >;
    const n = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS c FROM ${t.name}`)) as Array<{
      c: number;
    }>;
    console.log(
      `\n== ${t.name} (${n[0].c} rows) ==\n  ` +
        cols.map((c) => `${c.name}:${c.type}`).join(", "),
    );
    const sample = (await db.$queryRawUnsafe(
      `SELECT * FROM ${t.name} LIMIT 3`,
    )) as Array<Record<string, unknown>>;
    for (const r of sample) console.log("  ", JSON.stringify(r));
  }
  await db.$disconnect();
}
main();
