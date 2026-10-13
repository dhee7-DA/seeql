import { LC_ALL } from "../src/lib/leetcode/registry";
const co = process.argv[2] ?? "Amazon";
const rows = LC_ALL.filter(p => p.sql && p.companies.includes(co))
  .map(p => ({ sig: p.companies[0] === co, slug: p.slug, t: p.title, d: p.difficulty }))
  .sort((a,b) => Number(b.sig) - Number(a.sig));
console.log(`## ${co} — ${rows.length} SQL-band problems (${rows.filter(r=>r.sig).length} signature)`);
for (const r of rows) console.log(`${r.sig ? "*" : " "} [${r.d[0]}] ${r.slug} — ${r.t}`);
