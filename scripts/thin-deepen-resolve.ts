// Authoritative slug → live-file map for the flagged dives.
// Imports the REAL content graph (content.ts) — Map semantics: last definition
// wins — then fingerprints each resolved dive's breakdown[0] against the raw
// text of every sql-*.ts file to find the file that actually ships it.
import { readFileSync, readdirSync } from "node:fs";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const dir = "src/lib/leetcode/content";
const files = readdirSync(dir).filter(
  (f) => f.startsWith("sql-") && f.endsWith(".ts") && f !== "sql-expected.ts",
);
const texts = new Map(files.map((f) => [f, readFileSync(`${dir}/${f}`, "utf8")]));

const sqlRows = LC_ALL.filter((p) => p.sql);
for (const p of sqlRows) {
  const d = lcSqlDive(p.slug);
  if (!d) continue;
  const shorts = d.breakdown
    .map((t, i) => ({ i, len: t.length }))
    .filter((x) => x.len < 240);
  if (shorts.length === 0) continue;
  const fp = d.breakdown[0].replace(/"/g, "").slice(0, 44);
  const hosts = files.filter((f) => texts.get(f)!.includes(fp));
  console.log(
    `${p.slug} | live: ${hosts.join(", ") || "NOT FOUND"} | short: ${shorts.map((s) => `#${s.i}(${s.len})`).join(" ")}`,
  );
}
