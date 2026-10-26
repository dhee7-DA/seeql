// Round 15 — probe the Marketing & Attribution world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_MKT_SCHEMA } from "../src/lib/leetcode/content/dm-mkt-schema";
import { DM_MKT_SEED } from "../src/lib/leetcode/content/dm-mkt-seed";

const db = new Database(":memory:");
db.exec(DM_MKT_SCHEMA.ddl);
db.exec(DM_MKT_SEED);
const q = (sql: string): Record<string, unknown>[] => db.prepare(sql).all() as Record<string, unknown>[];
const one = (sql: string): number => Object.values(db.prepare(sql).get() ?? {})[0] as number;

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " · " + detail : ""}`);
};

console.log("== counts ==");
check("campaigns = 12", one("SELECT COUNT(*) FROM campaigns") === 12);
check("ads = 14", one("SELECT COUNT(*) FROM ads") === 14);
check("impressions = 125", one("SELECT COUNT(*) FROM impressions") === 125);
check("sessions = 72", one("SELECT COUNT(*) FROM sessions") === 72);
check("conversions = 58", one("SELECT COUNT(*) FROM conversions") === 58);
check("touchpoints = 108", one("SELECT COUNT(*) FROM touchpoints") === 108);
check("spend = 52", one("SELECT COUNT(*) FROM spend") === 52);
check("refunds = 12", one("SELECT COUNT(*) FROM refunds") === 12);

console.log("== campaign censuses ==");
const cc = q(`SELECT channel, COUNT(*) n FROM campaigns GROUP BY channel ORDER BY n DESC, channel`);
check("channels search 4 / social 3 / display 2 / email 2 / video 1",
  JSON.stringify(cc) === JSON.stringify([{ channel: "search", n: 4 }, { channel: "social", n: 3 }, { channel: "display", n: 2 }, { channel: "email", n: 2 }, { channel: "video", n: 1 }]), JSON.stringify(cc));
const oc = q(`SELECT objective, COUNT(*) n FROM campaigns GROUP BY objective ORDER BY n DESC, objective`);
check("objectives conversion 5 / awareness 4 / consideration 3",
  JSON.stringify(oc) === JSON.stringify([{ objective: "conversion", n: 5 }, { objective: "awareness", n: 4 }, { objective: "consideration", n: 3 }]), JSON.stringify(oc));
check("C11 dormant: paused, video, zero impressions / spend / conversions / touches",
  one(`SELECT COUNT(*) FROM campaigns WHERE campaign_id = 11 AND status = 'paused' AND channel = 'video'`) === 1 &&
  one(`SELECT COUNT(*) FROM impressions WHERE campaign_id = 11`) === 0 &&
  one(`SELECT COUNT(*) FROM spend WHERE campaign_id = 11`) === 0 &&
  one(`SELECT COUNT(*) FROM touchpoints WHERE campaign_id = 11`) === 0 &&
  one(`SELECT COUNT(*) FROM sessions WHERE utm_campaign_id = 11`) === 0);

console.log("== impression walls ==");
const dev = q(`SELECT device, COUNT(*) n FROM impressions GROUP BY device ORDER BY n DESC, device`);
check("device tie mobile 62 / desktop 62 / tablet 1",
  JSON.stringify(dev) === JSON.stringify([{ device: "desktop", n: 62 }, { device: "mobile", n: 62 }, { device: "tablet", n: 1 }]), JSON.stringify(dev));
check("clicks = 47", one("SELECT COUNT(*) FROM impressions WHERE clicked = 1") === 47);
check("metered click spend = 40660", one("SELECT SUM(cpc_cents) FROM impressions") === 40660);
check("cpc > 0 iff clicked (house rule)",
  one(`SELECT COUNT(*) FROM impressions WHERE (clicked = 1) <> (cpc_cents > 0)`) === 0);
check("impressions all inside pixel window",
  one(`SELECT COUNT(*) FROM impressions WHERE imp_ts < CAST(strftime('%s','2026-05-04 00:00:00') AS INTEGER) OR imp_ts > CAST(strftime('%s','2026-06-29 23:59:59') AS INTEGER)`) === 0);
const perCamp = q(`SELECT campaign_id, COUNT(*) n, SUM(clicked) c FROM impressions GROUP BY campaign_id ORDER BY campaign_id`);
check("per-campaign: C1 18/12 · C2 20/6 · C3 8/2 · C4 16/6 · C5 10/5 · C6 6/2 · C7 8/0 · C8 5/0 · C10 34/14",
  JSON.stringify(perCamp) === JSON.stringify([
    { campaign_id: 1, n: 18, c: 12 }, { campaign_id: 2, n: 20, c: 6 }, { campaign_id: 3, n: 8, c: 2 },
    { campaign_id: 4, n: 16, c: 6 }, { campaign_id: 5, n: 10, c: 5 }, { campaign_id: 6, n: 6, c: 2 },
    { campaign_id: 7, n: 8, c: 0 }, { campaign_id: 8, n: 5, c: 0 }, { campaign_id: 10, n: 34, c: 14 },
  ]), JSON.stringify(perCamp));
check("ad 13 never served (honest zero inside serving campaign C7)",
  one(`SELECT COUNT(*) FROM impressions WHERE ad_id = 13`) === 0 && one(`SELECT COUNT(*) FROM impressions WHERE campaign_id = 7`) === 8);
check("display zero clicks (the billboard wall)",
  one(`SELECT COUNT(*) FROM impressions i JOIN campaigns c ON c.campaign_id = i.campaign_id WHERE c.channel = 'display' AND i.clicked = 1`) === 0);
check("channel clicks: search 34 / social 13 / display 0",
  JSON.stringify(q(`SELECT c.channel, SUM(i.clicked) n FROM impressions i JOIN campaigns c ON c.campaign_id = i.campaign_id GROUP BY c.channel ORDER BY c.channel`)) ===
  JSON.stringify([{ channel: "display", n: 0 }, { channel: "search", n: 34 }, { channel: "social", n: 13 }]));
check("metered click spend: search 33610 / social 7050",
  one(`SELECT SUM(i.cpc_cents) FROM impressions i JOIN campaigns c ON c.campaign_id = i.campaign_id WHERE c.channel = 'search'`) === 33610 &&
  one(`SELECT SUM(i.cpc_cents) FROM impressions i JOIN campaigns c ON c.campaign_id = i.campaign_id WHERE c.channel = 'social'`) === 7050);

console.log("== sessionization wall (campaign 2, 06-20) ==");
const gaps = q(`
  WITH g AS (
    SELECT imp_ts - LAG(imp_ts) OVER (ORDER BY imp_ts) AS gap
    FROM impressions WHERE campaign_id = 2 AND date(imp_ts, 'unixepoch') = '2026-06-20'
  )
  SELECT COUNT(gap) n, SUM(gap = 1800) on_line FROM g`);
check("C2 06-20 run = 14 events, 13 gaps, exactly ONE gap = 1800",
  gaps[0].n === 13 && gaps[0].on_line === 1, JSON.stringify(gaps));
const other1800 = one(`
  SELECT COUNT(*) FROM (
    SELECT imp_ts - LAG(imp_ts) OVER (PARTITION BY campaign_id ORDER BY imp_ts) AS gap
    FROM impressions WHERE NOT (campaign_id = 2 AND date(imp_ts, 'unixepoch') = '2026-06-20')
  ) WHERE gap = 1800`);
check("no OTHER consecutive same-campaign gap equals 1800", other1800 === 0);

console.log("== sessions ==");
const us = q(`SELECT utm_source, COUNT(*) n FROM sessions GROUP BY utm_source ORDER BY n DESC, utm_source`);
check("utm census google 28 / meta 20 / newsletter 9 / bing 7 / direct 8",
  JSON.stringify(us) === JSON.stringify([{ utm_source: "google", n: 28 }, { utm_source: "meta", n: 20 }, { utm_source: "newsletter", n: 9 }, { utm_source: "direct", n: 8 }, { utm_source: "bing", n: 7 }]), JSON.stringify(us));
check("direct sessions all NULL campaign, others all set",
  one(`SELECT COUNT(*) FROM sessions WHERE (utm_source = 'direct') <> (utm_campaign_id IS NULL)`) === 0);
check("one mega session 2700s; runner-up 1800s (the burst session)",
  one(`SELECT MAX(duration_seconds) FROM sessions`) === 2700 &&
  one(`SELECT MAX(duration_seconds) FROM sessions WHERE duration_seconds < 2700`) === 1800 &&
  one(`SELECT COUNT(*) FROM sessions WHERE duration_seconds = 2700`) === 1);

console.log("== conversion censuses & money ladder ==");
const st = q(`SELECT status, COUNT(*) n FROM conversions GROUP BY status ORDER BY n DESC, status`);
check("statuses confirmed 44 / pending 6 / duplicate 4 / refunded 2 / cancelled 2",
  JSON.stringify(st) === JSON.stringify([{ status: "confirmed", n: 44 }, { status: "pending", n: 6 }, { status: "duplicate", n: 4 }, { status: "cancelled", n: 2 }, { status: "refunded", n: 2 }]), JSON.stringify(st));
check("revenue > 0 iff confirmed/refunded (house rule)",
  one(`SELECT COUNT(*) FROM conversions WHERE (status IN ('confirmed','refunded')) <> (revenue_cents > 0)`) === 0);
check("confirmed revenue = 745700", one(`SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'`) === 745700);
check("charged revenue (confirmed + refunded) = 851700",
  one(`SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0`) === 851700);
check("whale c10 = 296000 purchase on 04-20, 39.69% of confirmed",
  one(`SELECT revenue_cents FROM conversions WHERE conversion_id = 10`) === 296000 &&
  one(`SELECT ROUND(100.0 * 296000 / 745700, 2)`) === 39.69);
const perCampaign = q(`
  SELECT COALESCE(s.utm_campaign_id, 0) camp, SUM(c.revenue_cents) rev, COUNT(*) n
  FROM conversions c JOIN sessions s ON s.session_id = c.session_id
  WHERE c.status = 'confirmed'
  GROUP BY s.utm_campaign_id ORDER BY rev DESC, camp`);
check("per-campaign confirmed: C10 345000 · C4 94000 · C1 55000 · C5 54500 · C3=C6 42000 · C9 40000 · unattr 31500 · C12 22700 · C2 19000",
  JSON.stringify(perCampaign) === JSON.stringify([
    { camp: 10, rev: 345000, n: 8 }, { camp: 4, rev: 94000, n: 7 }, { camp: 1, rev: 55000, n: 5 },
    { camp: 5, rev: 54500, n: 5 }, { camp: 3, rev: 42000, n: 2 }, { camp: 6, rev: 42000, n: 4 },
    { camp: 9, rev: 40000, n: 5 }, { camp: 0, rev: 31500, n: 2 }, { camp: 12, rev: 22700, n: 3 },
    { camp: 2, rev: 19000, n: 3 },
  ]), JSON.stringify(perCampaign));
check("display/video campaigns convert nothing (C7 C8 C11 all 0)",
  one(`SELECT COUNT(*) FROM sessions s JOIN conversions c ON c.session_id = s.session_id WHERE s.utm_campaign_id IN (7, 8, 11) AND c.status = 'confirmed'`) === 0);
const chanRoll = q(`
  SELECT ca.channel, SUM(c.revenue_cents) rev
  FROM conversions c JOIN sessions s ON s.session_id = c.session_id
  JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
  WHERE c.status = 'confirmed'
  GROUP BY ca.channel ORDER BY rev DESC, ca.channel`);
check("last-click channel board: search 461000 / social 190500 / email 62700",
  JSON.stringify(chanRoll) === JSON.stringify([{ channel: "search", rev: 461000 }, { channel: "social", rev: 190500 }, { channel: "email", rev: 62700 }]), JSON.stringify(chanRoll));
check("the flip: ex-whale search 116000 < social 190500",
  461000 - 345000 === 116000 && 116000 < 190500);
check("monthly confirmed: Jan 7000 / Feb 68000 / Mar 43000 / Apr 321000 / May 166500 / Jun 140200",
  JSON.stringify(q(`SELECT strftime('%Y-%m', conv_date) ym, SUM(revenue_cents) rev FROM conversions WHERE status = 'confirmed' GROUP BY ym ORDER BY ym`)) ===
  JSON.stringify([
    { ym: "2026-01", rev: 7000 }, { ym: "2026-02", rev: 68000 }, { ym: "2026-03", rev: 43000 },
    { ym: "2026-04", rev: 321000 }, { ym: "2026-05", rev: 166500 }, { ym: "2026-06", rev: 140200 },
  ]));

console.log("== the daily tie ledger (confirmed revenue by day) ==");
const daily = q(`SELECT conv_date d, SUM(revenue_cents) t FROM conversions WHERE status = 'confirmed' GROUP BY d ORDER BY t, d`);
const ties: Record<number, string[]> = {};
for (const r of daily) (ties[r.t as number] ??= []).push(r.d as string);
const tieGroups = Object.entries(ties).filter(([, v]) => v.length > 1);
check("daily tie groups: 4000 x7 · 5000 x2 · 6000 x3 · 7000 x3 · 8000 x5 · 9000 x3 · 10000 x2 · 12000 x2 · 14000 x2 · 18000 x2",
  JSON.stringify(tieGroups.map(([t, ds]) => `${t}:${ds.length}`).sort()) ===
  JSON.stringify(["10000:2", "12000:2", "14000:2", "18000:2", "4000:7", "5000:2", "6000:3", "7000:3", "8000:5", "9000:3"]), JSON.stringify(tieGroups));
check("the 3-way 7000 registry", JSON.stringify(ties[7000]) === JSON.stringify(["2026-01-30", "2026-05-28", "2026-06-13"]), JSON.stringify(ties[7000]));
check("the 14000 pair: c20's solo day ties the 2-sale 06-18", JSON.stringify(ties[14000]) === JSON.stringify(["2026-05-12", "2026-06-18"]), JSON.stringify(ties[14000]));
check("the 7-way 4000 registry", JSON.stringify(ties[4000]) === JSON.stringify(["2026-03-22", "2026-06-06", "2026-06-19", "2026-06-21", "2026-06-24", "2026-06-25", "2026-06-26"]), JSON.stringify(ties[4000]));
check("the 5-way 8000 registry", JSON.stringify(ties[8000]) === JSON.stringify(["2026-02-14", "2026-04-18", "2026-06-11", "2026-06-14", "2026-06-22"]), JSON.stringify(ties[8000]));
check("the 3-way 6000 registry", JSON.stringify(ties[6000]) === JSON.stringify(["2026-04-26", "2026-04-30", "2026-05-22"]), JSON.stringify(ties[6000]));

console.log("== the pixel window / retention gap ==");
check("window conversions = 44, pre-window = 14",
  one(`SELECT COUNT(*) FROM conversions WHERE conv_date >= '2026-05-04'`) === 44 &&
  one(`SELECT COUNT(*) FROM conversions WHERE conv_date < '2026-05-04'`) === 14);
check("touchpoint-bearing conversions = 42 (window minus 2 organic-direct)",
  one(`SELECT COUNT(DISTINCT conversion_id) FROM touchpoints`) === 42);
check("all 14 pre-window conversions have a cookie (no direct pre-window)",
  one(`SELECT COUNT(*) FROM conversions c JOIN sessions s ON s.session_id = c.session_id WHERE c.conv_date < '2026-05-04' AND s.utm_campaign_id IS NOT NULL`) === 14);
check("pre-window conversions have ZERO touchpoints (the retention gap)",
  one(`SELECT COUNT(*) FROM touchpoints t JOIN conversions c ON c.conversion_id = t.conversion_id WHERE c.conv_date < '2026-05-04'`) === 0);
check("organic-direct conversions NEVER have paths; their confirmed revenue = 31500",
  one(`SELECT COUNT(*) FROM touchpoints t JOIN conversions c ON c.conversion_id = t.conversion_id JOIN sessions s ON s.session_id = c.session_id WHERE s.utm_campaign_id IS NULL`) === 0 &&
  one(`SELECT SUM(c.revenue_cents) FROM conversions c JOIN sessions s ON s.session_id = c.session_id WHERE s.utm_campaign_id IS NULL AND c.status = 'confirmed'`) === 31500);
check("all touchpoints inside the window; whale c10 has NO path",
  one(`SELECT COUNT(*) FROM touchpoints WHERE touched_at < CAST(strftime('%s','2026-05-04 00:00:00') AS INTEGER)`) === 0 &&
  one(`SELECT COUNT(*) FROM touchpoints WHERE conversion_id = 10`) === 0);

console.log("== attribution walls ==");
const mismatch = q(`
  WITH last_touch AS (
    SELECT conversion_id, touched_at, COUNT(*) n FROM touchpoints
    GROUP BY conversion_id, touched_at
    HAVING touched_at = (SELECT MAX(t2.touched_at) FROM touchpoints t2 WHERE t2.conversion_id = touchpoints.conversion_id)
  )
  SELECT c.conversion_id id FROM conversions c
  JOIN sessions s ON s.session_id = c.session_id
  JOIN last_touch lt ON lt.conversion_id = c.conversion_id AND lt.n = 1
  JOIN touchpoints t ON t.conversion_id = lt.conversion_id AND t.touched_at = lt.touched_at
  WHERE c.conv_date >= '2026-05-04' AND t.campaign_id <> s.utm_campaign_id
  ORDER BY c.conversion_id`);
check("mismatch trio = exactly [21, 24, 39]", JSON.stringify(mismatch.map(r => r.id)) === JSON.stringify([21, 24, 39]), JSON.stringify(mismatch));
const tieConv = q(`
  WITH maxts AS (
    SELECT conversion_id, MAX(touched_at) mt FROM touchpoints GROUP BY conversion_id
  ),
  last_touch AS (
    SELECT t.conversion_id, t.touched_at, COUNT(*) n
    FROM touchpoints t JOIN maxts m ON m.conversion_id = t.conversion_id AND t.touched_at = m.mt
    GROUP BY t.conversion_id, t.touched_at
  )
  SELECT l.conversion_id id,
    (SELECT GROUP_CONCAT(campaign_id, ',') FROM (
       SELECT t.campaign_id FROM touchpoints t
       JOIN maxts m2 ON m2.conversion_id = t.conversion_id
       WHERE t.conversion_id = l.conversion_id AND t.touched_at = m2.mt
       ORDER BY t.campaign_id)) reg
  FROM last_touch l WHERE n > 1`);
check("ambiguous last-touch = exactly c26 with registry '5,6'",
  JSON.stringify(tieConv) === JSON.stringify([{ id: 26, reg: "5,6" }]), JSON.stringify(tieConv));
const spans = q(`
  SELECT c.conversion_id id, c.conv_ts - MIN(t.touched_at) span
  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id
  GROUP BY c.conversion_id ORDER BY span DESC LIMIT 3`);
check("window wall: c44's span = EXACTLY 604800; runner-up 598680 (c16)",
  spans[0].id === 44 && spans[0].span === 604800 && spans[1].span === 598680, JSON.stringify(spans));
check("window semantics: 42 paths eligible inclusive (<=604800) vs 41 strict (<604800)",
  one(`SELECT COUNT(*) FROM (SELECT c.conversion_id id FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id GROUP BY c.conversion_id HAVING c.conv_ts - MIN(t.touched_at) <= 604800)`) === 42 &&
  one(`SELECT COUNT(*) FROM (SELECT c.conversion_id id FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id GROUP BY c.conversion_id HAVING c.conv_ts - MIN(t.touched_at) < 604800)`) === 41);

console.log("== the stuffing burst ==");
const burstPairs = one(`
  SELECT COUNT(*) FROM conversions a JOIN conversions b
    ON a.session_id = b.session_id AND a.conv_ts < b.conv_ts AND b.conv_ts - a.conv_ts <= 300`);
const burstStrict = one(`
  SELECT COUNT(*) FROM conversions a JOIN conversions b
    ON a.session_id = b.session_id AND a.conv_ts < b.conv_ts AND b.conv_ts - a.conv_ts < 300`);
const burstLine = one(`
  SELECT COUNT(*) FROM conversions a JOIN conversions b
    ON a.session_id = b.session_id AND a.conv_ts < b.conv_ts AND b.conv_ts - a.conv_ts = 300`);
const s51Pairs = one(`
  SELECT COUNT(*) FROM conversions a JOIN conversions b
    ON a.session_id = b.session_id AND a.conv_ts < b.conv_ts AND b.conv_ts - a.conv_ts <= 300
  WHERE a.session_id = 51`);
check("burst session s51: 3 pairs <= 300 (1 strict, 2 EXACTLY on the 300 line)",
  s51Pairs === 3, `s51 inclusive ${s51Pairs}`);
check("global same-session pairs: 4 inclusive / 2 strict / 2 on the line (s55's 180s pair is the 4th)",
  burstPairs === 4 && burstStrict === 2 && burstLine === 2, `${burstPairs}/${burstStrict}/${burstLine}`);
check("burst = 4 duplicates from s51 at 10:00/10:02/10:07/10:12, revenue 0",
  one(`SELECT COUNT(*) FROM conversions WHERE session_id = 51 AND status = 'duplicate'`) === 4 &&
  one(`SELECT SUM(revenue_cents) FROM conversions WHERE status = 'duplicate'`) === 0 &&
  JSON.stringify(q(`SELECT strftime('%H:%M', conv_ts, 'unixepoch') tm FROM conversions WHERE session_id = 51 ORDER BY conv_ts`)) ===
  JSON.stringify([{ tm: "10:00" }, { tm: "10:02" }, { tm: "10:07" }, { tm: "10:12" }]));

console.log("== spend walls ==");
const spStatus = q(`SELECT status, COUNT(*) n FROM spend GROUP BY status ORDER BY n DESC, status`);
check("spend status census paid 40 / pending 7 / disputed 5",
  JSON.stringify(spStatus) === JSON.stringify([{ status: "paid", n: 40 }, { status: "pending", n: 7 }, { status: "disputed", n: 5 }]), JSON.stringify(spStatus));
check("media total 248800 · fees 24474 · creative 19500 · grand 292774",
  one(`SELECT SUM(media_cents) FROM spend`) === 248800 &&
  one(`SELECT SUM(platform_fee_cents) FROM spend`) === 24474 &&
  one(`SELECT SUM(creative_cents) FROM spend`) === 19500 &&
  one(`SELECT SUM(media_cents + platform_fee_cents + creative_cents) FROM spend`) === 292774);
const over = q(`
  SELECT s.spend_id id, s.campaign_id camp, s.media_cents media, c.daily_budget_cents budget
  FROM spend s JOIN campaigns c ON c.campaign_id = s.campaign_id
  WHERE s.media_cents > c.daily_budget_cents ORDER BY s.spend_id`);
check("exactly 5 overspend days: sp4 C1 8400 · sp18 C4 6500 · sp24 C5 3700 · sp33 C7 2650 · sp45 C10 12600",
  JSON.stringify(over) === JSON.stringify([
    { id: 4, camp: 1, media: 8400, budget: 8000 }, { id: 18, camp: 4, media: 6500, budget: 6000 },
    { id: 24, camp: 5, media: 3700, budget: 3500 }, { id: 33, camp: 7, media: 2650, budget: 2500 },
    { id: 45, camp: 10, media: 12600, budget: 12000 },
  ]), JSON.stringify(over));
const onBudget = one(`
  SELECT COUNT(*) FROM spend s JOIN campaigns c ON c.campaign_id = s.campaign_id
  WHERE s.media_cents = c.daily_budget_cents`);
check("exactly ONE day EXACTLY on budget (sp44 C10 12000) — >= catches 6, > catches 5",
  onBudget === 1 &&
  one(`SELECT COUNT(*) FROM spend s JOIN campaigns c ON c.campaign_id = s.campaign_id WHERE s.media_cents >= c.daily_budget_cents`) === 6);
const drift = q(`
  SELECT spend_id, campaign_id, media_cents, platform_fee_cents, status FROM spend
  WHERE platform_fee_cents <> CAST(ROUND(media_cents * 0.10) AS INTEGER)`);
check("fee-drift trio = sp18 (C4) / sp39 (C9) / sp45 (C10), all at 8%, sp45 PAID",
  JSON.stringify(drift) === JSON.stringify([
    { spend_id: 18, campaign_id: 4, media_cents: 6500, platform_fee_cents: 520, status: "pending" },
    { spend_id: 39, campaign_id: 9, media_cents: 1200, platform_fee_cents: 96, status: "disputed" },
    { spend_id: 45, campaign_id: 10, media_cents: 12600, platform_fee_cents: 1008, status: "paid" },
  ]), JSON.stringify(drift));
check("creative fees on exactly 5 rows (8000/5000/3000/2000/1500)",
  JSON.stringify(q(`SELECT creative_cents v FROM spend WHERE creative_cents > 0 ORDER BY v DESC`)) ===
  JSON.stringify([{ v: 8000 }, { v: 5000 }, { v: 3000 }, { v: 2000 }, { v: 1500 }]));
const roas = q(`
  SELECT c.campaign_id id, ROUND(1.0 * c.rev / s.media, 2) roas FROM (
    SELECT s.utm_campaign_id campaign_id, SUM(cv.revenue_cents) rev
    FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
    WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL
    GROUP BY s.utm_campaign_id) c
  JOIN (SELECT campaign_id, SUM(media_cents) media FROM spend GROUP BY campaign_id) s
    ON s.campaign_id = c.campaign_id ORDER BY roas DESC`);
check("ROAS board: C9 10.96 · C3 5.79 · C10 4.22 · C12 3.66 · C5 3.42 · C6 3.0 · C4 2.4 · C1 1.24 · C2 0.96",
  JSON.stringify(roas) === JSON.stringify([
    { id: 9, roas: 10.96 }, { id: 3, roas: 5.79 }, { id: 10, roas: 4.22 }, { id: 12, roas: 3.66 },
    { id: 5, roas: 3.42 }, { id: 6, roas: 3.0 }, { id: 4, roas: 2.4 }, { id: 1, roas: 1.24 }, { id: 2, roas: 0.96 },
  ]), JSON.stringify(roas));
check("C6 ROAS EXACTLY 3.0 · C2 below 1 (0.96) · display ROAS 0 (NULLIF lesson)",
  one(`SELECT ROUND(1.0 * 42000 / 14000, 2)`) === 3.0 &&
  one(`SELECT ROUND(1.0 * 19000 / 19700, 2)`) === 0.96 &&
  one(`SELECT COALESCE(SUM(revenue_cents), 0) FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id WHERE s.utm_campaign_id IN (7,8) AND cv.status='confirmed'`) === 0);
check("blended ROAS 745700/248800 rounds to 3.0 (raw 2.9972)", one(`SELECT ROUND(1.0 * 745700 / 248800, 2)`) === 3.0 && one(`SELECT ROUND(1.0 * 745700 / 248800, 4)`) === 2.9972);

console.log("== refund book ==");
check("refund sum 216800 · net revenue 634900",
  one(`SELECT SUM(amount_cents) FROM refunds`) === 216800 &&
  one(`SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0`) - one(`SELECT SUM(amount_cents) FROM refunds`) === 634900);
const rr = q(`SELECT reason, COUNT(*) n FROM refunds GROUP BY reason ORDER BY n DESC, reason`);
check("reasons duplicate_charge 7 / chargeback 3 / goodwill 2",
  JSON.stringify(rr) === JSON.stringify([{ reason: "duplicate_charge", n: 7 }, { reason: "chargeback", n: 3 }, { reason: "goodwill", n: 2 }]), JSON.stringify(rr));
const rs = q(`SELECT status, COUNT(*) n FROM refunds GROUP BY status ORDER BY n DESC, status`);
check("statuses open 5 / approved 4 / denied 3",
  JSON.stringify(rs) === JSON.stringify([{ status: "open", n: 5 }, { status: "approved", n: 4 }, { status: "denied", n: 3 }]), JSON.stringify(rs));
check("dispute line: r1 = 60000 chargeback on the whale, MAX of the book (>=1, >0)",
  one(`SELECT MAX(amount_cents) FROM refunds`) === 60000 &&
  one(`SELECT COUNT(*) FROM refunds WHERE amount_cents >= 60000`) === 1 &&
  one(`SELECT COUNT(*) FROM refunds WHERE amount_cents > 60000`) === 0);
check("twins at 12000 (r5 chargeback open, r6 duplicate_charge denied)",
  JSON.stringify(q(`SELECT refund_id, reason, status FROM refunds WHERE amount_cents = 12000 ORDER BY refund_id`)) ===
  JSON.stringify([{ refund_id: 5, reason: "chargeback", status: "open" }, { refund_id: 6, reason: "duplicate_charge", status: "denied" }]));
check("full refunds on the two refunded conversions (c46 52000 approved, c50 54000 open)",
  one(`SELECT amount_cents FROM refunds WHERE conversion_id = 46`) === 52000 &&
  one(`SELECT amount_cents FROM refunds WHERE conversion_id = 50`) === 54000);
check("whale's clawback total 75000 (60000 + 15000); whale net 221000",
  one(`SELECT SUM(amount_cents) FROM refunds WHERE conversion_id = 10`) === 75000);

console.log("== touchpoint structure ==");
check("touch type census: 67 clicks / 41 views",
  one(`SELECT COUNT(*) FROM touchpoints WHERE touch_type = 'click'`) === 67 &&
  one(`SELECT COUNT(*) FROM touchpoints WHERE touch_type = 'view'`) === 41);
check("per-campaign touches: C4 22 · C10 21 · C9 18 · C5 14 · C1 7 · C2 7 · C6 7 · C12 5 · C3 3 · C7 2 · C8 2",
  JSON.stringify(q(`SELECT campaign_id, COUNT(*) n FROM touchpoints GROUP BY campaign_id ORDER BY n DESC, campaign_id`)) ===
  JSON.stringify([{ campaign_id: 4, n: 22 }, { campaign_id: 10, n: 21 }, { campaign_id: 9, n: 18 }, { campaign_id: 5, n: 14 },
    { campaign_id: 1, n: 7 }, { campaign_id: 2, n: 7 }, { campaign_id: 6, n: 7 }, { campaign_id: 12, n: 5 },
    { campaign_id: 3, n: 3 }, { campaign_id: 7, n: 2 }, { campaign_id: 8, n: 2 }]));
check("path-length census: 5x2 · 4x7 · 3x12 · 2x13 · 1x8",
  JSON.stringify(q(`SELECT n, COUNT(*) c FROM (SELECT conversion_id, COUNT(*) n FROM touchpoints GROUP BY conversion_id) GROUP BY n ORDER BY n`)) ===
  JSON.stringify([{ n: 1, c: 8 }, { n: 2, c: 13 }, { n: 3, c: 12 }, { n: 4, c: 7 }, { n: 5, c: 2 }]));

console.log("== house rules on every row ==");
check("conv_date = date(conv_ts) on all 58",
  one(`SELECT COUNT(*) FROM conversions WHERE conv_date <> date(conv_ts, 'unixepoch')`) === 0);
check("non-direct sessions map to same-channel campaigns (google/bing -> search except GDN google->display, meta -> social, newsletter -> email)",
  one(`SELECT COUNT(*) FROM sessions s JOIN campaigns c ON c.campaign_id = s.utm_campaign_id
       WHERE (s.utm_source = 'bing' AND c.channel <> 'search')
          OR (s.utm_source = 'google' AND c.channel NOT IN ('search','display'))
          OR (s.utm_source = 'meta' AND c.channel <> 'social')
          OR (s.utm_source = 'newsletter' AND c.channel <> 'email')`) === 0);
check("ad->campaign integrity on impressions",
  one(`SELECT COUNT(*) FROM impressions i JOIN ads a ON a.ad_id = i.ad_id WHERE i.campaign_id <> a.campaign_id`) === 0);
check("refunds reference charged conversions only, amount <= revenue",
  one(`SELECT COUNT(*) FROM refunds r JOIN conversions c ON c.conversion_id = r.conversion_id WHERE c.revenue_cents <= 0 OR r.amount_cents > c.revenue_cents`) === 0);

console.log(fails === 0 ? `\nALL PROBES PASS` : `\n${fails} FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
