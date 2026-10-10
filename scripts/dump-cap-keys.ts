// Dumps every question id + xp key for a capstone sample — QA helper for
// simulating a fully-cleared project (localStorage xpEvents patch).
import { CAP_ECOM_CSV, CAP_MARKETING_CSV } from "../src/lib/capstone-samples";
import { buildCapstone } from "../src/lib/capstone";
import { gymXpKey, parseForTable, profileGym } from "../src/lib/messy-gym";

for (const [csv, name] of [
  [CAP_ECOM_CSV, "shop_returns"],
  [CAP_MARKETING_CSV, "campaign_metrics"],
] as const) {
  const parse = parseForTable(csv, name);
  if ("error" in parse) throw new Error(parse.error);
  const project = buildCapstone(parse, profileGym(parse));
  console.log(`== ${name} (${project.questions.length} questions, ${project.questions.reduce((a, q) => a + q.xp, 0)} xp)`);
  for (const q of project.questions) console.log(`${gymXpKey(parse, q.id)}`);
}
