// Exact UI-facing numbers: companies rows + featured tracks + section domains
import { LC_FILTER_COMPANIES } from "../src/lib/leetcode/lc-meta";
import { TRACK_COMPANIES, companySqlTrack, trackMix } from "../src/lib/leetcode/company-tracks";
import { SQL50_SECTIONS, DATAFIN_SECTIONS } from "../src/lib/leetcode/sections";

const rows = LC_FILTER_COMPANIES;
const withSql = rows.filter((c) => companySqlTrack(c.name).length > 0);
const deep = rows.filter((c) => companySqlTrack(c.name).length >= 5);

console.log("=== COMPANY INDEX (what the UI header shows) ===");
console.log(`rows (tagged employers, sources removed): ${rows.length}`);
console.log(`with SQL tracks: ${withSql.length}`);
console.log(`deep tracks (>=5 SQL problems): ${deep.length}`);
console.log("");
console.log("=== 8 FEATURED TRACKS (band-structured) ===");
for (const name of TRACK_COMPANIES) {
  const t = companySqlTrack(name);
  const m = trackMix(t);
  console.log(`${name}: ${t.length} SQL (E${m.easy}/M${m.medium}/H${m.hard})`);
}
console.log("");
console.log("=== SQL SECTION DOMAINS ===");
console.log(`SQL50_SECTIONS: ${SQL50_SECTIONS.length}`);
console.log(`DATAFIN_SECTIONS: ${DATAFIN_SECTIONS.length}`);
console.log(`total sections: ${SQL50_SECTIONS.length + DATAFIN_SECTIONS.length}`);
const named = [...SQL50_SECTIONS, ...DATAFIN_SECTIONS].map((s) => s.title);
console.log("section titles:");
for (const t of named) console.log("  - " + t);
