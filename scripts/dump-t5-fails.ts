/// <reference types="bun-types" />
/** Dump failing cases of cases-t5.ts in compact readable form. */
import { casesT5 } from "../src/lib/curriculum/cases/cases-t5";

const FAILING = new Set(
  "cs-1401,cs-1405,cs-1407,cs-1409,cs-1412,cs-1416,cs-1417,cs-1418,cs-1419,cs-1420,cs-1421,cs-1422,cs-1423,cs-1424,cs-1425,cs-1428,cs-1429,cs-1430,cs-1431,cs-1432,cs-1433,cs-1434,cs-1435,cs-1438,cs-1442,cs-1445,cs-1446,cs-1447,cs-1448,cs-1450".split(","),
);

for (const c of casesT5) {
  if (!FAILING.has(c.id)) continue;
  console.log("=" .repeat(70));
  console.log(`${c.id} [${c.tier}] topic=${c.topic} universe=${c.universe} — ${c.title}`);
  console.log(`ASK: ${c.ask}`);
  console.log(`TEMPLATE:\n${c.template}`);
  c.slots.forEach((s, i) => {
    console.log(
      `  SLOT${i + 1} ${s.kind}${s.noVerify ? " noVerify" : ""} answer=${JSON.stringify(s.answer)} label=${JSON.stringify(s.label)} why=${JSON.stringify((s.why ?? "").slice(0, 80))}`,
    );
  });
  console.log(`  DISTRACTORS: ${JSON.stringify(c.distractors)}`);
  console.log(`  BRIEF(${c.brief.length}): ${c.brief.slice(0, 200).replace(/\n/g, " | ")}`);
  console.log(`  WALK(${c.walkthrough.length}): ${c.walkthrough.slice(0, 160).replace(/\n/g, " | ")}`);
}
