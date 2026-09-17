// Static audit: figures taught in the curriculum vs figures implemented in
// the registry. Catches blank library cards before the browser does.
import { readFileSync, readdirSync } from "node:fs";

const root = "/home/z/my-project";

// 1) ids referenced by lesson blocks
const taught = new Set<string>();
for (const f of readdirSync(`${root}/src/lib/curriculum/lessons`)) {
  if (!/^lesson-\d+\.ts$/.test(f)) continue;
  const src = readFileSync(`${root}/src/lib/curriculum/lessons/${f}`, "utf8");
  for (const m of src.matchAll(/figure:\s*"([a-z0-9-]+)"/g)) taught.add(m[1]);
}

// 2) ids implemented in the registry files
const implemented = new Set<string>();
for (const f of ["diagrams.tsx", "diagrams-m2.tsx", "diagrams-m3.tsx", "diagrams-m4.tsx", "diagrams-m5.tsx", "diagrams-m6.tsx", "diagrams-m7.tsx", "diagrams-m8.tsx"]) {
  const src = readFileSync(`${root}/src/components/learn/${f}`, "utf8");
  for (const m of src.matchAll(/"([a-z0-9-]+)":\s*[A-Z][A-Za-z0-9]*\s*,/g)) implemented.add(m[1]);
}

const missing = [...taught].filter((id) => !implemented.has(id)).sort();
const unused = [...implemented].filter((id) => !taught.has(id)).sort();

console.log(`taught in lessons:     ${taught.size}`);
console.log(`implemented in registry: ${implemented.size}`);
console.log(`taught but NOT implemented (${missing.length}): ${missing.join(", ") || "—"}`);
console.log(`implemented but not taught (${unused.length}): ${unused.join(", ") || "—"}`);

// 3) landing copy claims
const landing = readFileSync(`${root}/src/components/landing.tsx`, "utf8");
for (const m of landing.matchAll(/(\d+)\s*(?:moving|animated)[^"'<]*diagrams/gi)) {
  console.log(`landing claim: "${m[0]}"`);
}
