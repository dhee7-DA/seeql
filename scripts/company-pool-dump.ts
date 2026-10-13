/// <reference types="bun-types" />
// Per-company problem pools from the LC registry — writes scripts/company-pools.md.
// Kits curate pools from these REAL slugs (probe-companies validates existence).
import { LC_ALL, LC_COMPANIES } from "../src/lib/leetcode/registry";
import { writeFileSync } from "node:fs";

const VARIANTS: Record<string, string[]> = {
  amazon: ["Amazon"], flipkart: ["Flipkart"], alibaba: ["Alibaba"], shopify: ["Shopify"], ebay: ["eBay"],
  uber: ["Uber"], lyft: ["Lyft"], ola: ["Ola"], bolt: ["Bolt"], grab: ["Grab"],
  netflix: ["Netflix"], spotify: ["Spotify"], youtube: ["YouTube"], meta: ["Meta", "Facebook"], tiktok: ["TikTok"],
  stripe: ["Stripe"], paypal: ["PayPal", "Paypal"], visa: ["Visa"], revolut: ["Revolut"], block: ["Block", "Square"],
  doordash: ["DoorDash"], swiggy: ["Swiggy"], zomato: ["Zomato"], instacart: ["Instacart"], deliveroo: ["Deliveroo"],
  airbnb: ["Airbnb"], booking: ["Booking", "Booking.com"], expedia: ["Expedia"], oyo: ["OYO"], makemytrip: ["MakeMyTrip"],
  goldman: ["Goldman", "Goldman Sachs"], jpmorgan: ["JPMorgan", "JPMorgan Chase"], capitalone: ["Capital One"],
  wellsfargo: ["Wells Fargo"], hsbc: ["HSBC"],
  salesforce: ["Salesforce"], slack: ["Slack"], zoom: ["Zoom"], atlassian: ["Atlassian"], snowflake: ["Snowflake"],
};

const out: string[] = [];
const P = (s = "") => out.push(s);

P("# LC band problem pools for company kits");
P("");
P(`Band: ${LC_ALL.length} problems, ${LC_ALL.filter((p) => p.sql).length} SQL-graded.`);
P("");
P("## How to use this file");
P("");
P("- `Tagged pool = <company>` sections list problems whose company tags match");
P("  (primary tag first). Pool rows: slug | title | difficulty | topics | sql.");
P("- Pool picks MUST be `sql` rows (they deep-link into graded dives).");
P("- If the tagged pool is thin (<16 sql rows), fill from the Theme menu at the");
P("  bottom — curated fills are honest and expected (brief says so).");
P("- Topic `slugs` arrays also draw from these lists.");
P("");

const tagCount = new Map<string, number>(LC_COMPANIES.map((c) => [c.name, c.count]));
for (const [id, variants] of Object.entries(VARIANTS)) {
  const tagged = LC_ALL.filter((p) => p.companies.some((c) => variants.includes(c)));
  const primary = tagged.filter((p) => variants.includes(p.companies[0]));
  const sqlTagged = tagged.filter((p) => p.sql);
  P(`## Tagged pool = ${id}`);
  P("");
  P(`tagged rows: ${tagged.length} (sql ${sqlTagged.length}, primary-tag ${primary.length}); registry tag counts: ${variants.map((v) => `${v}=${tagCount.get(v) ?? 0}`).join(", ")}`);
  P("");
  for (const p of sqlTagged) {
    P(`- ${p.slug} | ${p.title} | ${p.difficulty} | ${p.topics.join("/")} | free=${p.free}`);
  }
  P("");
}

// Theme menu: all sql problems grouped by primary topic for curated fills.
P("## Theme menu — every SQL problem by primary topic");
P("");
const byTopic = new Map<string, typeof LC_ALL>();
for (const p of LC_ALL.filter((p) => p.sql)) {
  const t = p.topics[0] ?? "Other";
  if (!byTopic.has(t)) byTopic.set(t, []);
  byTopic.get(t)!.push(p);
}
for (const [t, ps] of [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length)) {
  P(`### ${t} (${ps.length})`);
  P("");
  for (const p of ps) P(`- ${p.slug} | ${p.title} | ${p.difficulty} | ${p.companies.slice(0, 3).join(", ")}`);
  P("");
}

writeFileSync("scripts/company-pools.md", out.join("\n"));
console.log(`wrote scripts/company-pools.md (${out.length} lines, ${out.join("\n").length} chars)`);
