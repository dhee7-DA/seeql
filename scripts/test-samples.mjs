// Quick smoke test: POST every sample query to /api/query and report status.
const src = await import("../src/lib/samples.ts").catch(() => null);
let queries;
if (src) {
  queries = src.SAMPLE_QUERIES;
} else {
  // Fallback: regex-extract sql blocks from the TS source
  const fs = await import("node:fs");
  const text = fs.readFileSync(new URL("../src/lib/samples.ts", import.meta.url), "utf8");
  queries = [...text.matchAll(/sql: `([\s\S]*?)`,/g)].map((m) => ({ id: "?", sql: m[1] }));
}

let failed = 0;
for (const q of queries) {
  const res = await fetch("http://localhost:3000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql: q.sql, dialect: "sqlite" }),
  });
  const json = await res.json();
  const ok = json.ok === true;
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${(q.id ?? "?").padEnd(16)} ${ok ? `${json.rowCount} rows` : json.error?.slice(0, 120)}`,
  );
}
console.log(failed === 0 ? "\nAll samples pass." : `\n${failed} sample(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
