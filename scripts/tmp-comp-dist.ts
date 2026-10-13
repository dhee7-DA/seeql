import { LC_ALL, LC_COMPANIES } from "../src/lib/leetcode/registry";
console.log("total problems:", LC_ALL.length);
console.log("sql problems:", LC_ALL.filter(p=>p.sql).length);
console.log("companies:", LC_COMPANIES.length);
console.log(LC_COMPANIES.slice(0,30).map(c=>`${c.name}:${c.count}`).join("  "));
const sqlCompanies = new Map<string,number>();
for (const p of LC_ALL.filter(p=>p.sql)) for (const c of p.companies) sqlCompanies.set(c,(sqlCompanies.get(c)??0)+1);
console.log("\nSQL-band companies:");
console.log([...sqlCompanies.entries()].sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${c}:${n}`).join("  "));
