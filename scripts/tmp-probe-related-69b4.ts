import { LC_ALL } from "../src/lib/leetcode/registry";
const slugs = LC_ALL.map(p => ({ slug: p.slug, diff: p.difficulty }));
console.log("LC_ALL size:", slugs.length);
const kw = ["manager","employee","hierarchy","depth","tree","node","water","rain","friend","circle","chain","gift","pass","game","team","streak","consecutive","bit","permission","sum","percent","salary","department","login","swap","triangle","exchange","binary"];
for (const k of kw) {
  const hits = slugs.filter(s => s.slug.includes(k)).slice(0, 14);
  if (hits.length) console.log(`-- ${k}: ${hits.map(h => h.slug).join(", ")}`);
}
