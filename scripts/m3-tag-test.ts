// M3 tag test — every set-ops bank item must tag to its canonical keyword
// via the same tag() the census uses. Run: npx tsx scripts/m3-tag-test.ts
import { resetDatabase } from "../src/lib/sample-db";
import { tag, D } from "../src/lib/curriculum/keyword-taxonomy";
import { ALL_KEYWORD_BANK_MCQS, ALL_KEYWORD_BANK_PROBLEMS, KEYWORD_BANKS } from "../src/lib/curriculum/keyword-banks";

async function main() {
  await resetDatabase();
  const targets = ["UNION & UNION ALL", "INTERSECT", "EXCEPT", "CASE WHEN"];
  const banks = new Map(KEYWORD_BANKS.map((b) => [b.kw, b]));
  let bad = 0;

  for (const t of targets) {
    const bank = banks.get(t);
    if (!bank) {
      console.log(`NO BANK for ${t}`);
      bad++;
      continue;
    }
    let ok = 0;
    for (const q of bank.mcqs) {
      const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
      const tagged = tag(bank.moduleNum, `${q.prompt} ${why}`, "");
      if (tagged.kws.has(t)) ok++;
      else {
        bad++;
        console.log(`MISS [${t}] mcq ${q.id}: prompt="${q.prompt.slice(0, 70)}"`);
      }
    }
    for (const pr of bank.problems) {
      const hints = (pr.hints ?? []).join(" ");
      const tagged = tag(bank.moduleNum, `${pr.title} ${pr.brief} ${hints}`, pr.solution);
      if (tagged.kws.has(t)) ok++;
      else {
        bad++;
        console.log(`MISS [${t}] problem ${pr.id}: "${pr.title}"`);
      }
    }
    console.log(`${t}: ${ok}/${bank.mcqs.length + bank.problems.length} tagged`);
  }

  // summary of tag counts across ALL bank items for the four targets
  const counts = new Map(targets.map((t) => [t, 0]));
  for (const q of ALL_KEYWORD_BANK_MCQS) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    const tagged = tag(3, `${q.prompt} ${why}`, "");
    for (const k of tagged.kws) if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  for (const pr of ALL_KEYWORD_BANK_PROBLEMS) {
    const hints = (pr.hints ?? []).join(" ");
    const tagged = tag(3, `${pr.title} ${pr.brief} ${hints}`, pr.solution);
    for (const k of tagged.kws) if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  console.log("bank-tag totals:", [...counts.entries()]);
  console.log(bad === 0 ? "TAG TEST PASS" : `TAG TEST FAIL (${bad} misses) — dictionary has ${D.length} keywords`);
  process.exit(bad === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
