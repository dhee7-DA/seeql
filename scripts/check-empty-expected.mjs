/* Run the 7 empty-expected solutions against the live app DB. */
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");

const bad = [];
for (const L of LESSONS) for (const p of L.problems)
  if ((!p.expected || p.expected.rows.length === 0) && p.expected.changes == null) bad.push(p);

for (const p of bad) {
  const res = await fetch("http://localhost:3000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql: p.solution }),
  }).then((r) => r.json());
  if (!res.ok) {
    console.log(`${p.id}: QUERY ERROR: ${String(res.error).slice(0, 90)}`);
  } else {
    console.log(`${p.id}: solution → ${res.rows.length} rows | expected.rows = ${p.expected.rows.length}`);
    if (res.rows.length) console.log(`   sample: ${JSON.stringify(res.rows[0])} | expected.columns: ${JSON.stringify(p.expected.columns)}`);
  }
}
