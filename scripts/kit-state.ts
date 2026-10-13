// Quick bank-count audit for wave-7 3x expansion state (Task 95)
import { readFileSync } from "fs";

const kits = process.argv.slice(2);
for (const k of kits) {
  const f = `src/lib/companies/kits/${k}.ts`;
  const s = readFileSync(f, "utf8");
  const theory = (s.match(new RegExp(`id: "${k}-t\\d+"`, "g")) || []).length;
  const mcq = (s.match(new RegExp(`id: "${k}-mcq-\\d+"`, "g")) || []).length;
  const cases = (s.match(new RegExp(`id: "cs-${k}-\\d+"`, "g")) || []).length;
  const problems = (s.match(/slug: "/g) || []).length;
  const topics = (s.match(/slugs: \[/g) || []).length;
  const beats = (s.match(/\*\*\d{2}:\d{2} —\*\*/g) || []).length;
  console.log(
    `${k}: theory=${theory} mcq=${mcq} cases=${cases} problems=${problems} topics=${topics} timeAnchors=${beats}`
  );
}
