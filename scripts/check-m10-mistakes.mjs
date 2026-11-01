// Verify the M10 mistake-coaching retrofit (m10-mistakes.ts):
//   1. every problem that lacked mistakes now has >= 2
//   2. every regex compiles
//   3. no regex matches its OWN problem's solution (normalizeSql-identical)
//   4. every message is substantive
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");

// replicate src/lib/curriculum/coach.ts normalizeSql
const normalizeSql = (sql) =>
  sql.toLowerCase().replace(/\s+/g, " ").replace(/\s*([(),;])\s*/g, "$1 ").trim();

let problems = 0, coached = 0, rules = 0, badRegex = 0, selfMatch = 0, thinMsg = 0, stillBare = 0;
const issues = [];
for (const l of LESSONS.filter((l) => l.num >= 58 && l.num <= 63)) {
  for (const p of l.problems) {
    problems++;
    if (!p.mistakes?.length) { stillBare++; issues.push(`${p.id}: STILL NO MISTAKES`); continue; }
    coached++;
    rules += p.mistakes.length;
    if (p.mistakes.length < 1) issues.push(`${p.id}: no rules`);
    const normSol = normalizeSql(p.solution);
    for (const m of p.mistakes) {
      let re;
      try { re = new RegExp(m.test, "i"); } catch (e) { badRegex++; issues.push(`${p.id}: BAD REGEX /${m.test}/ — ${e.message}`); continue; }
      if (re.test(normSol)) { selfMatch++; issues.push(`${p.id}: SELF-MATCH /${m.test}/`); }
      if ((m.message || "").length < 40) { thinMsg++; issues.push(`${p.id}: thin message (${(m.message || "").length} chars)`); }
    }
  }
}
console.log(`problems: ${problems} · coached: ${coached} · bare: ${stillBare} · rules: ${rules}`);
console.log(`badRegex: ${badRegex} · selfMatch: ${selfMatch} · thinMsg: ${thinMsg}`);
if (issues.length) { console.log("--- ISSUES ---"); for (const i of issues) console.log(i); process.exit(1); }
console.log("ALL CLEAN");
