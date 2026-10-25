// Per-company content mix: query problems / predict drills / deep dives
import { LC_ALL } from "../src/lib/leetcode/registry";
import { TRACK_COMPANIES, companySqlTrack } from "../src/lib/leetcode/company-tracks";
import { LC_FILTER_COMPANIES } from "../src/lib/leetcode/lc-meta";
import { DRILL_SLUGS, DRILL2_SLUGS } from "../src/lib/leetcode/followup-specs";

const drillSet = new Set([...DRILL_SLUGS, ...DRILL2_SLUGS]);
const drill4 = new Set(DRILL_SLUGS);
console.log(
  `drill pool: ${drillSet.size} verified (${DRILL_SLUGS.length} 4-candidate + ${drillSet.size - DRILL_SLUGS.length} 3-candidate)`,
);

function mix(name: string) {
  const track = companySqlTrack(name); // all sql:true
  const drills = track.filter((p) => drillSet.has(p.slug)).length;
  const d4 = track.filter((p) => drill4.has(p.slug)).length;
  const dives = LC_ALL.filter((p) => p.companies.includes(name)).length; // every problem has a dive
  return { track: track.length, drills, d4, dives };
}

console.log("");
console.log("=== 8 FEATURED COMPANY TRACKS ===");
console.log("company      | query problems | predict drills (4cand+3cand) | deep dives (all lists)");
for (const name of TRACK_COMPANIES) {
  const m = mix(name);
  console.log(
    `${name.padEnd(12)} | ${String(m.track).padStart(14)} | ${String(m.drills).padStart(14)} (${m.d4}+${m.drills - m.d4}) | ${String(m.dives).padStart(22)}`,
  );
}

console.log("");
console.log("=== OTHER DEEP TRACKS (>=5 SQL) ===");
const others = LC_FILTER_COMPANIES
  .filter((c) => !TRACK_COMPANIES.includes(c.name))
  .map((c) => ({ name: c.name, ...mix(c.name) }))
  .filter((m) => m.track >= 5)
  .sort((a, b) => b.track - a.track);
for (const m of others) {
  console.log(
    `${m.name.padEnd(22)} | ${String(m.track).padStart(14)} | ${String(m.drills).padStart(14)} (${m.d4}+${m.drills - m.d4}) | ${String(m.dives).padStart(22)}`,
  );
}

console.log("");
console.log("totals: dives=" + LC_ALL.length + " sql=" + LC_ALL.filter((p) => p.sql).length + " drillpool=" + drillSet.size);
