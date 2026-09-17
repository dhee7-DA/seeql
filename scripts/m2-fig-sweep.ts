// Navigate every M2 lesson's Deep dive tab and run the figure overflow audit.
import { execSync } from "node:child_process";

const lessons = [
  "Two tables, one answer",
  "INNER JOIN mechanics",
  "Three-table chains",
  "LEFT JOIN — keep the left side",
  "Anti-join",
  "Self-join",
  "Joins + aggregates",
  "join pitfalls",
];

function evalJs(expr) {
  return execSync(`agent-browser eval "${expr.replace(/"/g, '\\"').replace(/\n/g, " ")}"`, { encoding: "utf8" });
}

// expand chapter 2 once
evalJs(`(() => { const b=[...document.querySelectorAll('button')]; const ch=b.find(x=>x.textContent.includes('Joins & Relationships')); if(ch) ch.click(); return 'ok'; })()`);
execSync("sleep 0.6");
const audit = execSync("cat scripts/fig-audit.js | head -c 2000", { encoding: "utf8" });

for (const title of lessons) {
  evalJs(`(() => { const b=[...document.querySelectorAll('button')]; const l=b.find(x=>x.textContent.includes('${title.replace(/'/g, "\\'")}')); if(!l) return 'MISSING'; l.click(); return 'ok'; })()`);
  execSync("sleep 0.7");
  evalJs(`(() => { const t=[...document.querySelectorAll('button')].find(b => b.textContent.includes('Deep dive')); if(!t) return 'NOTAB'; t.click(); return 'ok'; })()`);
  execSync("sleep 1.1");
  console.log(`\n===== ${title} =====`);
  const res = execSync(`agent-browser eval "$(sed 's|//.*||' scripts/fig-audit.js | tr '\\n' ' ')"`, { encoding: "utf8" });
  console.log(res);
}
