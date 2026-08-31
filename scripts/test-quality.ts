// Quality audit test: run the full audit and print a compact report.

import { runQualityAudit } from "../src/lib/quality-audit";

async function main() {
  const q = await runQualityAudit();
  console.log("overall score:", q.overallScore);
  for (const t of q.tables) {
    console.log(`\n${t.table} — rows=${t.rows} score=${t.score}`);
    for (const c of t.columns) {
      console.log(`   ${c.column.padEnd(16)} null=${String(c.nullPct).padStart(5)}%  bad=${String(c.badPct).padStart(5)}%  (${c.label})`);
    }
  }
  console.log("\nENUMS:");
  for (const e of q.enums) {
    console.log(`  ${e.table}.${e.column} — ${e.variants} variants, ${e.nulls} nulls:`, e.values.map((v) => `${JSON.stringify(v.value)}×${v.n}`).join(", "));
  }
  console.log("\nFKS:");
  for (const f of q.fks) {
    console.log(`  ${f.childTable}.${f.childColumn} -> ${f.parentTable}.${f.parentColumn}: total=${f.total} nullRefs=${f.nullRefs} orphans=${f.orphans}`);
  }
  console.log("\nANOMALIES:");
  for (const a of q.anomalies) {
    console.log(`  [${a.table}] ${a.kind}: ${a.count}`, a.example ? JSON.stringify(a.example) : "");
  }
  console.log("\nTIMELINES:");
  for (const [table, points] of Object.entries(q.timelines)) {
    console.log(`  ${table}: ${points.length} months, flagged sum=${points.reduce((a, p) => a + p.flagged, 0)}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
