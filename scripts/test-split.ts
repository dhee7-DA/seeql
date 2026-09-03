// Verify splitStatements: comment runs stay with their statements.
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LESSONS } from "../src/lib/curriculum/lessons";

let blocks = 0, bad = 0;
for (const l of LESSONS) {
  for (const [bi, b] of l.blocks.entries()) {
    if (b.kind !== "code") continue;
    const sql = b.sql.trim();
    if (!sql) continue;
    blocks++;
    const parts = splitStatements(sql);
    const n = countStatements(sql);
    if (parts.length !== n) {
      bad++;
      console.log(`MISMATCH ${l.id}.blocks[${bi}]: count=${n} split=${parts.length}`);
      parts.forEach((p, i) => console.log(`  [${i}] ${p.slice(0, 60).replace(/\n/g, " ⏎ ")}`));
      continue;
    }
    for (const [i, p] of parts.entries()) {
      // the API computes the type after stripping leading comments
      const stripped = p.replace(/^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)+\s*)*/, "");
      const kind = (stripped.match(/^[a-zA-Z]+/)?.[0] ?? "UNKNOWN").toUpperCase();
      if (kind === "UNKNOWN") {
        bad++;
        console.log(`NO-TYPE ${l.id}.blocks[${bi}] stmt#${i + 1}: starts "${p.slice(0, 50).replace(/\n/g, " ⏎ ")}"`);
      }
    }
  }
}
// direct unit cases
const unit: Array<[string, number, string[]]> = [
  ["SELECT 1; SELECT 2;", 2, ["SELECT 1;", "SELECT 2;"]],
  ["SELECT 1;   -- note\nSELECT 2;", 2, ["SELECT 1;   -- note", "SELECT 2;"]],
  ["-- lead\nSELECT 1;\n\nSELECT 2;   -- tail", 2, ["-- lead\nSELECT 1;", "SELECT 2;   -- tail"]],
  ["SELECT ';' AS q;", 1, ["SELECT ';' AS q;"]],
  ["SELECT 1 /* c1 */; /* c2 */ SELECT 2;", 2, ["SELECT 1 /* c1 */; /* c2 */", "SELECT 2;"]],
];
for (const [sql, wantN, wantParts] of unit) {
  const got = splitStatements(sql);
  if (countStatements(sql) !== wantN || JSON.stringify(got) !== JSON.stringify(wantParts)) {
    bad++;
    console.log(`UNIT FAIL: ${JSON.stringify(sql)} -> ${JSON.stringify(got)} (want ${JSON.stringify(wantParts)})`);
  }
}
console.log(`\nblocks=${blocks} problems=${bad}`);
process.exit(bad ? 1 : 0);
