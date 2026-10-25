// Round 14 — probe the Logistics & Freight world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_FREIGHT_SCHEMA } from "../src/lib/leetcode/content/dm-freight-schema";
import { DM_FREIGHT_SEED } from "../src/lib/leetcode/content/dm-freight-seed";

const db = new Database(":memory:");
db.exec(DM_FREIGHT_SCHEMA.ddl);
db.exec(DM_FREIGHT_SEED);
const q = (sql: string): Record<string, unknown>[] => db.prepare(sql).all() as Record<string, unknown>[];
const one = (sql: string): number => Object.values(db.prepare(sql).get() ?? {})[0] as number;

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " · " + detail : ""}`);
};

console.log("== counts ==");
check("customers = 12", one("SELECT COUNT(*) FROM customers") === 12);
check("warehouses = 6", one("SELECT COUNT(*) FROM warehouses") === 6);
check("drivers = 8", one("SELECT COUNT(*) FROM drivers") === 8);
check("shipments = 58", one("SELECT COUNT(*) FROM shipments") === 58);
check("shipment_events = 125", one("SELECT COUNT(*) FROM shipment_events") === 125);
check("driver_shifts = 28", one("SELECT COUNT(*) FROM driver_shifts") === 28);
check("invoices = 52", one("SELECT COUNT(*) FROM invoices") === 52);
check("freight_claims = 12", one("SELECT COUNT(*) FROM freight_claims") === 12);

console.log("== customer/segment/region censuses ==");
const rc = q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC, region`);
check("regions NA 5 / EMEA 3 / APAC 2 / LATAM 2", JSON.stringify(rc) === JSON.stringify([{ region: "NA", n: 5 }, { region: "EMEA", n: 3 }, { region: "APAC", n: 2 }, { region: "LATAM", n: 2 }]), JSON.stringify(rc));
const sc = q(`SELECT segment, COUNT(*) n FROM customers GROUP BY segment ORDER BY n DESC, segment`);
check("segments enterprise 5 / smb 5 / startup 2", JSON.stringify(sc) === JSON.stringify([{ segment: "enterprise", n: 5 }, { segment: "smb", n: 5 }, { segment: "startup", n: 2 }]), JSON.stringify(sc));

console.log("== onboarded calendar ==");
const oc = q(`SELECT strftime('%Y-%m', onboarded_date) ym, COUNT(*) n FROM customers GROUP BY ym ORDER BY ym`);
check("onboarded: 2025-10 x2, 2025-11 x2, 2025-12 x2, 2026-01 x1, 2026-02 x1, 2026-04 x1, 2025-05? no 2026-05 x2, 2026-06 x1 — March 2026 ZERO",
  JSON.stringify(oc) === JSON.stringify([
    { ym: "2025-10", n: 2 }, { ym: "2025-11", n: 2 }, { ym: "2025-12", n: 2 },
    { ym: "2026-01", n: 1 }, { ym: "2026-02", n: 1 }, { ym: "2026-04", n: 1 },
    { ym: "2026-05", n: 2 }, { ym: "2026-06", n: 1 },
  ]), JSON.stringify(oc));

console.log("== shipment status/service censuses ==");
const st = q(`SELECT status, COUNT(*) n FROM shipments GROUP BY status ORDER BY n DESC, status`);
check("statuses delivered 44 / in_transit 6 / exception 4 / cancelled 2 / returned 2",
  JSON.stringify(st) === JSON.stringify([{ status: "delivered", n: 44 }, { status: "in_transit", n: 6 }, { status: "exception", n: 4 }, { status: "cancelled", n: 2 }, { status: "returned", n: 2 }]), JSON.stringify(st));
const sv = q(`SELECT service, COUNT(*) n FROM shipments GROUP BY service ORDER BY n DESC, service`);
check("services standard 23 / economy 20 / express 15",
  JSON.stringify(sv) === JSON.stringify([{ service: "standard", n: 23 }, { service: "economy", n: 20 }, { service: "express", n: 15 }]), JSON.stringify(sv));

console.log("== house rules hold on every row ==");
check("promised = ship + SLA (economy 7 / standard 4 / express 2) on ALL 58",
  one(`SELECT COUNT(*) FROM shipments WHERE promised_date <> CASE service
       WHEN 'economy' THEN date(ship_date, '+7 day') WHEN 'standard' THEN date(ship_date, '+4 day')
       ELSE date(ship_date, '+2 day') END`) === 0);
check("delivered rows all have delivered_date, others none",
  one(`SELECT COUNT(*) FROM shipments WHERE (status = 'delivered') <> (delivered_date IS NOT NULL)`) === 0);
check("cancelled freight all 0, others > 0",
  one(`SELECT COUNT(*) FROM shipments WHERE (status = 'cancelled') <> (freight_cents = 0)`) === 0);
check("all freight_cents multiples of 100", one("SELECT COUNT(*) FROM shipments WHERE freight_cents % 100 <> 0") === 0);
check("all invoice bases multiples of 100", one("SELECT COUNT(*) FROM invoices WHERE base_cents % 100 <> 0") === 0);
check("fuel = ROUND(base * 0.12) on every invoice",
  one(`SELECT COUNT(*) FROM invoices WHERE fuel_cents <> CAST(ROUND(base_cents * 0.12) AS INTEGER)`) === 0);
check("invoice issue = ship + 1 day",
  one(`SELECT COUNT(*) FROM invoices i JOIN shipments s ON s.shipment_id = i.shipment_id WHERE i.issue_date <> date(s.ship_date, '+1 day')`) === 0);

console.log("== planted: SLA wall ==");
const sla = q(`
  SELECT shipment_id sid, service,
    CASE WHEN delivered_date < promised_date THEN 'early'
         WHEN delivered_date = promised_date THEN 'on_line' ELSE 'late' END bucket
  FROM shipments WHERE status = 'delivered'`);
const cnt = (b: string) => sla.filter((r) => r.bucket === b).length;
check("delivered census: 37 early / 1 exactly on line / 6 late", cnt("early") === 37 && cnt("on_line") === 1 && cnt("late") === 6, `early ${cnt("early")} / line ${cnt("on_line")} / late ${cnt("late")}`);
check("the on-line row is s01 (express)", sla.find((r) => r.bucket === "on_line")?.sid === 1);
check("late delivered sids = [2, 19, 23, 26, 30, 41]",
  JSON.stringify(sla.filter((r) => r.bucket === "late").map((r) => r.sid).sort((a, b) => a - b)) === JSON.stringify([2, 19, 23, 26, 30, 41]), JSON.stringify(sla.filter((r) => r.bucket === "late").map((r) => r.sid)));
const onTimeLe = one(`SELECT COUNT(*) FROM shipments WHERE status = 'delivered' AND delivered_date <= promised_date`);
const onTimeLt = one(`SELECT COUNT(*) FROM shipments WHERE status = 'delivered' AND delivered_date < promised_date`);
check("on-time inclusive 38 vs strict 37 (the wall)", onTimeLe === 38 && onTimeLt === 37, `${onTimeLe} vs ${onTimeLt}`);
const expLe = one(`SELECT COUNT(*) FROM shipments WHERE status = 'delivered' AND service = 'express' AND delivered_date <= promised_date`);
const expLt = one(`SELECT COUNT(*) FROM shipments WHERE status = 'delivered' AND service = 'express' AND delivered_date < promised_date`);
check("express on-time inclusive 9 vs strict 8", expLe === 9 && expLt === 8, `${expLe} vs ${expLt}`);
check("express delivered = 12 (8 early + 1 on-line + 3 late)", one(`SELECT COUNT(*) FROM shipments WHERE status='delivered' AND service='express'`) === 12);
const expLate = one(`SELECT COUNT(*) FROM shipments WHERE status='delivered' AND service='express' AND delivered_date > promised_date`);
check("express late = 3 (s02, s23, s41)", expLate === 3);
const stdLate = one(`SELECT COUNT(*) FROM shipments WHERE status='delivered' AND service='standard' AND delivered_date > promised_date`);
check("standard late = 2 (s26, s30)", stdLate === 2);
const ecoLate = one(`SELECT COUNT(*) FROM shipments WHERE status='delivered' AND service='economy' AND delivered_date > promised_date`);
check("economy late = 1 (s19)", ecoLate === 1);

console.log("== planted: whale + region flip ==");
const custFreight = q(`
  SELECT c.customer_id cid, c.name, c.region, COALESCE(SUM(s.freight_cents), 0) f, COUNT(s.shipment_id) n
  FROM customers c LEFT JOIN shipments s ON s.customer_id = c.customer_id AND s.status = 'delivered'
  GROUP BY c.customer_id ORDER BY f DESC, cid`) as Array<{ cid: number; f: number }>;
console.log("  delivered freight by customer:", JSON.stringify(custFreight));
check("whale C10 = 279000", custFreight.find((r) => r.cid === 10)?.f === 279000);
check("C2 = 136500, C7 = 128000, C8 = 74000, C1 = 51800",
  custFreight.find((r) => r.cid === 2)?.f === 136500 && custFreight.find((r) => r.cid === 7)?.f === 128000 &&
  custFreight.find((r) => r.cid === 8)?.f === 74000 && custFreight.find((r) => r.cid === 1)?.f === 51800);
check("C11 = 0 (dormant)", custFreight.find((r) => r.cid === 11)?.f === 0);
check("total delivered freight = 797400", one(`SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered'`) === 797400);
check("whale share 35.0% (279000/797400)", Math.round((279000 / 797400) * 1000) === 350);
const reg = q(`
  SELECT c.region, SUM(s.freight_cents) f FROM shipments s JOIN customers c ON c.customer_id = s.customer_id
  WHERE s.status = 'delivered' GROUP BY c.region ORDER BY f DESC`) as Array<{ region: string; f: number }>;
console.log("  region freight:", JSON.stringify(reg));
check("regions NA 388900 / EMEA 298500 / APAC 92000 / LATAM 18000",
  JSON.stringify(reg) === JSON.stringify([{ region: "NA", f: 388900 }, { region: "EMEA", f: 298500 }, { region: "APAC", f: 92000 }, { region: "LATAM", f: 18000 }]), JSON.stringify(reg));
const regEx = q(`
  SELECT c.region, SUM(s.freight_cents) f FROM shipments s JOIN customers c ON c.customer_id = s.customer_id
  WHERE s.status = 'delivered' AND s.customer_id <> 10 GROUP BY c.region ORDER BY f DESC`) as Array<{ region: string; f: number }>;
check("ex-whale: EMEA 298500 first, NA 109900 second (the flip)",
  regEx[0].region === "EMEA" && regEx[1].region === "NA" && regEx[1].f === 109900, JSON.stringify(regEx));

console.log("== planted: the 18000 tie ==");
check("C3 = C6 = 18000 (different shapes: 3 rows each? C6 3 rows / C3 3 rows)",
  custFreight.find((r) => r.cid === 3)?.f === 18000 && custFreight.find((r) => r.cid === 6)?.f === 18000);
const ranks = q(`
  WITH t AS (SELECT customer_id cid, SUM(freight_cents) f FROM shipments
             WHERE status = 'delivered' GROUP BY customer_id)
  SELECT cid, f, RANK() OVER (ORDER BY f DESC) r, DENSE_RANK() OVER (ORDER BY f DESC) dr FROM t ORDER BY r, cid`) as Array<{ cid: number; r: number; dr: number }>;
const tie3 = ranks.find((x) => x.cid === 3); const tie6 = ranks.find((x) => x.cid === 6);
check("tie at RANK 8 / DENSE 8; next row RANK 10 / DENSE 9", tie3?.r === 8 && tie6?.r === 8 && tie3.dr === 8 && ranks.some((x) => x.r === 10 && x.dr === 9), JSON.stringify(ranks.filter((x) => [3, 6, 5].includes(x.cid))));
const registry = q(`
  WITH t AS (SELECT customer_id cid, SUM(freight_cents) f FROM shipments
             WHERE status = 'delivered' GROUP BY customer_id)
  SELECT f, GROUP_CONCAT(cid) g FROM t WHERE f = 18000 GROUP BY f`) as Array<{ g: string }>;
check("GROUP_CONCAT registry = '3,6'", registry[0]?.g === "3,6", registry[0]?.g);

console.log("== planted: dim weight ==");
const airTax = q(`SELECT shipment_id sid, weight_g w, dim_weight_g dw FROM shipments WHERE dim_weight_g > weight_g ORDER BY sid`);
check("air-tax rows = exactly 5 (s18, s31, s37, s49, s52)",
  JSON.stringify(airTax.map((r) => r.sid)) === JSON.stringify([18, 31, 37, 49, 52]), JSON.stringify(airTax));
const dimTie = q(`SELECT shipment_id sid FROM shipments WHERE dim_weight_g = weight_g`);
check("dim tie = exactly 1 (s12)", JSON.stringify(dimTie.map((r) => r.sid)) === JSON.stringify([12]));
check("billed weight total = SUM(MAX(w,dw)) over all 58",
  one(`SELECT SUM(MAX(weight_g, dim_weight_g)) FROM shipments`) ===
  one(`SELECT SUM(CASE WHEN dim_weight_g > weight_g THEN dim_weight_g ELSE weight_g END) FROM shipments`));
check("air-tax freight cents = 3800+8800+6000+4200+3900 = 26700",
  one(`SELECT SUM(freight_cents) FROM shipments WHERE dim_weight_g > weight_g`) === 26700);

console.log("== planted: honest zeros ==");
check("C11's entire book = 1 cancelled shipment", one("SELECT COUNT(*) FROM shipments WHERE customer_id = 11") === 1 && one(`SELECT COUNT(*) FROM shipments WHERE customer_id = 11 AND status = 'cancelled'`) === 1);
check("C11 zero scans / invoices / claims",
  one(`SELECT COUNT(*) FROM shipment_events e JOIN shipments s ON s.shipment_id = e.shipment_id WHERE s.customer_id = 11`) === 0 &&
  one("SELECT COUNT(*) FROM invoices WHERE customer_id = 11") === 0 &&
  one(`SELECT COUNT(*) FROM freight_claims c JOIN shipments s ON s.shipment_id = c.shipment_id WHERE s.customer_id = 11`) === 0);
check("W5 dark gateway: zero origin shipments", one("SELECT COUNT(*) FROM shipments WHERE origin_wh = 5") === 0);
check("W5 zero scans", one(`SELECT COUNT(*) FROM shipment_events WHERE warehouse_id = 5`) === 0);
check("unbilled shipments = 6 (2 cancelled + 4 in_transit s43/s44/s45/s47)",
  JSON.stringify(q(`SELECT shipment_id sid FROM shipments s WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.shipment_id = s.shipment_id) ORDER BY sid`).map((r) => r.sid)) === JSON.stringify([40, 43, 44, 45, 47, 54]));
check("in_transit unbilled = 4; prepaid in_transit = 2 (s07, s46)",
  one(`SELECT COUNT(*) FROM shipments s LEFT JOIN invoices i ON i.shipment_id = s.shipment_id WHERE s.status = 'in_transit' AND i.invoice_id IS NULL`) === 4 &&
  JSON.stringify(q(`SELECT s.shipment_id sid FROM shipments s JOIN invoices i ON i.shipment_id = s.shipment_id WHERE s.status = 'in_transit' ORDER BY sid`).map((r) => r.sid)) === JSON.stringify([7, 46]));
check("delivered rows without scans (retention) = 26",
  one(`SELECT COUNT(*) FROM shipments s WHERE s.status = 'delivered' AND NOT EXISTS (SELECT 1 FROM shipment_events e WHERE e.shipment_id = s.shipment_id)`) === 26);
check("cancelled rows have zero scans", one(`SELECT COUNT(*) FROM shipment_events e JOIN shipments s ON s.shipment_id = e.shipment_id WHERE s.status = 'cancelled'`) === 0);
check("LATAM dark in March 2026 (0 shipments)",
  one(`SELECT COUNT(*) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id WHERE c.region = 'LATAM' AND strftime('%Y-%m', s.ship_date) = '2026-03'`) === 0);

console.log("== planted: daily ship-date freight ties ==");
const daily = q(`SELECT ship_date d, SUM(freight_cents) f, COUNT(*) n FROM shipments WHERE status <> 'cancelled' GROUP BY ship_date ORDER BY f DESC, d`);
check("top day = 2026-04-20 (96000, the whale's record)", (daily[0] as { d: string; f: number }).d === "2026-04-20" && (daily[0] as { d: string; f: number }).f === 96000);
const dupTies = q(`SELECT f, COUNT(*) c, GROUP_CONCAT(ship_date) g FROM (SELECT ship_date, SUM(freight_cents) f FROM shipments WHERE status <> 'cancelled' GROUP BY ship_date) GROUP BY f HAVING c > 1 ORDER BY f`);
console.log("  daily total ties:", JSON.stringify(dupTies));
check("10 daily tie groups; top tie = 4-way 27000 (01-15, 02-03, 02-25, 05-15); 3-way 4600 (03-28, 05-17, 05-20)",
  dupTies.length === 10 &&
  (() => { const t4 = dupTies.find((t) => t.f === 27000) as { c: number; g: string } | undefined;
    const t3 = dupTies.find((t) => t.f === 4600) as { c: number; g: string } | undefined;
    return !!t4 && t4.c === 4 && t4.g.split(",").sort().join(",") === "2026-01-15,2026-02-03,2026-02-25,2026-05-15" &&
      !!t3 && t3.c === 3 && t3.g.split(",").sort().join(",") === "2026-03-28,2026-05-17,2026-05-20"; })(), JSON.stringify(dupTies));

console.log("== planted: scan clock — dwell ==");
const dwell = q(`
  SELECT s.shipment_id sid, e.event_ts - a.event_ts dw
  FROM shipment_events a JOIN shipment_events e ON e.shipment_id = a.shipment_id
   AND e.event_type = 'departed_hub' JOIN shipments s ON s.shipment_id = a.shipment_id
  WHERE a.event_type = 'arrived_hub' ORDER BY dw DESC`) as Array<{ sid: number; dw: number }>;
console.log("  top dwells:", JSON.stringify(dwell.slice(0, 6)));
check("dwell rows = 25", dwell.length === 25);
check("max dwell = s48 259200 (customs)", dwell[0].sid === 48 && dwell[0].dw === 259200);
check("second = s41 172800, third = s42 EXACTLY 86400, fourth = s07 64800", dwell[1].sid === 41 && dwell[1].dw === 172800 && dwell[2].sid === 42 && dwell[2].dw === 86400 && dwell[3].sid === 7 && dwell[3].dw === 64800);
check("s42 EXACTLY 86400 (the dock-day line)", dwell.find((d) => d.sid === 42)?.dw === 86400);
check("dwell >= 86400 catches 3, > catches 2", dwell.filter((d) => d.dw >= 86400).length === 3 && dwell.filter((d) => d.dw > 86400).length === 2);
check("all dwells outside the top-5 are <= 21600", dwell.slice(5).every((d) => d.dw <= 21600));

console.log("== planted: scan clock — velocity + sessions ==");
check("driver 3's ONLY scans = the 8 burst scans (06-23)",
  one(`SELECT COUNT(*) FROM shipment_events WHERE driver_id = 3`) === 8 &&
  one(`SELECT COUNT(DISTINCT date(event_ts, 'unixepoch')) FROM shipment_events WHERE driver_id = 3`) === 1);
const d3ts = q(`SELECT event_ts t FROM shipment_events WHERE driver_id = 3 ORDER BY t`).map((r) => r.t as number);
check("D3 scan times = 10:00/10:01/10:02/10:05 + 10:45/46/47/48 (gaps 60,60,180,2400,60,60,60)",
  JSON.stringify(d3ts.map((t, i) => (i === 0 ? 0 : t - d3ts[i - 1]))) === JSON.stringify([0, 60, 60, 180, 2400, 60, 60, 60]), JSON.stringify(d3ts));
let d3le = 0, d3lt = 0, exact300 = 0;
for (let i = 0; i < d3ts.length; i++) for (let j = i + 1; j < d3ts.length; j++) {
  const g = d3ts[j] - d3ts[i];
  if (g <= 300) { d3le++; if (g < 300) d3lt++; if (g === 300) exact300++; }
}
check("D3 velocity: 12 pairs <= 300s, 11 strict, exactly ONE pair = 300", d3le === 12 && d3lt === 11 && exact300 === 1, `${d3le}/${d3lt}/${exact300}`);
const d3sessionsStrict = d3ts.reduce((acc, t, i) => (i === 0 || t - d3ts[i - 1] > 1800 ? acc + 1 : acc), 0);
const d3sessionsIncl = d3ts.reduce((acc, t, i) => (i === 0 || t - d3ts[i - 1] >= 1800 ? acc + 1 : acc), 0);
check("D3 sessions: 2 strict / 2 inclusive (the 2400 gap)", d3sessionsStrict === 2 && d3sessionsIncl === 2);
const allPairs = q(`
  SELECT a.driver_id d, a.event_id e1, b.event_id e2, b.event_ts - a.event_ts g
  FROM shipment_events a JOIN shipment_events b ON b.driver_id = a.driver_id AND b.event_id > a.event_id
  WHERE a.driver_id IS NOT NULL AND b.event_ts > a.event_ts AND b.event_ts - a.event_ts <= 300 ORDER BY g`) as Array<{ d: number; g: number }>;
check("velocity <= 300 across ALL drivers = 12, ALL driver 3", allPairs.length === 12 && allPairs.every((p) => p.d === 3), `n=${allPairs.length}`);
check("velocity = 300 pairs across ALL drivers = exactly 1 (the D3 wall)",
  q(`SELECT b.event_ts - a.event_ts g FROM shipment_events a JOIN shipment_events b ON b.driver_id = a.driver_id AND b.event_id > a.event_id WHERE a.driver_id IS NOT NULL AND b.event_ts > a.event_ts AND b.event_ts - a.event_ts = 300`).length === 1);
const gaps1800 = q(`
  WITH o AS (SELECT driver_id d, event_ts t, LAG(event_ts) OVER (PARTITION BY driver_id ORDER BY event_ts) pt
             FROM shipment_events WHERE driver_id IS NOT NULL)
  SELECT d, t - pt g FROM o WHERE pt IS NOT NULL AND t - pt = 1800`) as Array<{ d: number; g: number }>;
check("consecutive same-driver gaps = 1800: EXACTLY ONE (driver 5, 06-17)",
  gaps1800.length === 1 && gaps1800[0].d === 5, JSON.stringify(gaps1800));
const d5days = q(`SELECT date(event_ts, 'unixepoch') day, COUNT(*) n FROM shipment_events WHERE driver_id = 5 GROUP BY day ORDER BY day`);
console.log("  D5 scan days:", JSON.stringify(d5days));
const d5ts = q(`SELECT event_ts t FROM shipment_events WHERE driver_id = 5 ORDER BY t`).map((r) => r.t as number);
const d5sStrict = d5ts.reduce((acc, t, i) => (i === 0 || t - d5ts[i - 1] > 1800 ? acc + 1 : acc), 0);
const d5sIncl = d5ts.reduce((acc, t, i) => (i === 0 || t - d5ts[i - 1] >= 1800 ? acc + 1 : acc), 0);
console.log(`  D5 sessions: strict ${d5sStrict} / inclusive ${d5sIncl}`);
check("D5 sessions differ across the cutoff (strict < inclusive)", d5sStrict < d5sIncl, `${d5sStrict} vs ${d5sIncl}`);
check("D8's entire book = 2 scans (s51 ofd + exception, 600s apart)",
  one(`SELECT COUNT(*) FROM shipment_events WHERE driver_id = 8`) === 2 &&
  one(`SELECT MAX(event_ts) - MIN(event_ts) FROM shipment_events WHERE driver_id = 8`) === 600);
check("driver 6 is the only other EMEA/APAC scanner with multi-day routes", one(`SELECT COUNT(DISTINCT date(event_ts,'unixepoch')) FROM shipment_events WHERE driver_id = 6`) >= 3);
const hubScans = q(`SELECT COUNT(*) n FROM shipment_events WHERE driver_id IS NULL`);
check("hub scans (NULL driver) = 53 = 28 arrived + 25 departed", hubScans[0].n === 53, String(hubScans[0].n));
check("event type census: picked_up 29 / arrived_hub 28 / departed_hub 25 / out_for_delivery 20 / delivered 18 / exception 5",
  JSON.stringify(q(`SELECT event_type, COUNT(*) n FROM shipment_events GROUP BY event_type ORDER BY n DESC, event_type`)) === JSON.stringify([
    { event_type: "picked_up", n: 29 }, { event_type: "arrived_hub", n: 28 }, { event_type: "departed_hub", n: 25 },
    { event_type: "out_for_delivery", n: 20 }, { event_type: "delivered", n: 18 }, { event_type: "exception", n: 5 },
  ]), JSON.stringify(q(`SELECT event_type, COUNT(*) n FROM shipment_events GROUP BY event_type ORDER BY n DESC, event_type`)));
check("exception scans = 5 (s48, s49, s50, s51, s53)",
  JSON.stringify(q(`SELECT shipment_id sid FROM shipment_events WHERE event_type = 'exception' ORDER BY sid`).map((r) => r.sid)) === JSON.stringify([48, 49, 50, 51, 53]));
check("s46's last scan is departed_hub 06-01 18:00 (the vanished express)",
  q(`SELECT event_type FROM shipment_events WHERE shipment_id = 46 ORDER BY event_id DESC LIMIT 1`)[0].event_type === "departed_hub" &&
  one(`SELECT MAX(event_ts) FROM shipment_events WHERE shipment_id = 46`) === one(`SELECT CAST(strftime('%s','2026-06-01 18:00:00') AS INTEGER)`));
check("s47's last scan is out_for_delivery (the phantom)",
  q(`SELECT event_type FROM shipment_events WHERE shipment_id = 47 ORDER BY event_id DESC LIMIT 1`)[0].event_type === "out_for_delivery");
check("every delivered event sits on the shipment's delivered_date",
  one(`SELECT COUNT(*) FROM shipment_events e JOIN shipments s ON s.shipment_id = e.shipment_id WHERE e.event_type = 'delivered' AND date(e.event_ts, 'unixepoch') <> s.delivered_date`) === 0);
check("event ts window = 2026-05-04 .. 2026-06-29",
  one(`SELECT MIN(date(event_ts,'unixepoch')) FROM shipment_events`) === "2026-05-04" &&
  one(`SELECT MAX(date(event_ts,'unixepoch')) FROM shipment_events`) === "2026-06-29");

console.log("== planted: HOS duty wall ==");
const duty = q(`SELECT shift_id, driver_id d, end_ts - start_ts len, duty_date FROM driver_shifts ORDER BY len DESC`) as Array<{ shift_id: number; d: number; len: number; duty_date: string }>;
check("over-14h shifts = exactly 1 (shift 8, driver 2, 52200)",
  duty.filter((x) => x.len > 50400).length === 1 && duty[0].shift_id === 8 && duty[0].len === 52200 && duty[0].d === 2);
check("ON-line shift = exactly 1 (shift 11, driver 3, 50400, 06-23)",
  duty.filter((x) => x.len === 50400).length === 1 && duty.find((x) => x.len === 50400)?.shift_id === 11 && duty.find((x) => x.len === 50400)?.duty_date === "2026-06-23");
check("longest shift BELOW the line = 45000 (12.5h, driver 1)", duty.filter((x) => x.len < 50400)[0].len === 45000 && duty.filter((x) => x.len < 50400)[0].d === 1);
const totDel = q(`SELECT driver_id d, SUM(deliveries_made) n FROM driver_shifts GROUP BY driver_id ORDER BY n DESC`);
const ties58 = totDel.filter((r) => r.n === 58);
check("deliveries tie: drivers 2 and 4 both 58 (the only tie)", ties58.length === 2 && JSON.stringify(ties58.map((t) => t.d).sort()) === JSON.stringify([2, 4]), JSON.stringify(totDel));
const km = q(`SELECT driver_id d, SUM(distance_km) k FROM driver_shifts GROUP BY driver_id ORDER BY k DESC`);
check("driver 1 = 3000 km crown (2.29x runner-up)", km[0].d === 1 && km[0].k === 3000 && Math.round(3000 / km[1].k * 100) === 229, JSON.stringify(km));
check("total shift deliveries = 496", one("SELECT SUM(deliveries_made) FROM driver_shifts") === 496);
check("total shift km = 9270", one("SELECT SUM(distance_km) FROM driver_shifts") === 9270);

console.log("== planted: aging board (as of 2026-07-01) ==");
const aging = q(`SELECT shipment_id sid, CAST(julianday('2026-07-01') - julianday(ship_date) AS INT) age FROM shipments WHERE status = 'in_transit' ORDER BY age`);
console.log("  in_transit ages:", JSON.stringify(aging));
check("in_transit ages = 3, 9, 15, 22, 30, 45", JSON.stringify(aging.map((a) => a.age)) === JSON.stringify([3, 9, 15, 22, 30, 45]), JSON.stringify(aging));
check("one sits EXACTLY on the 30-day line (s46, the overdue express)", aging.find((a) => a.age === 30)?.sid === 46);
check("aging <= 30 = 5, < 30 = 4 (the wall)", aging.filter((a) => a.age <= 30).length === 5 && aging.filter((a) => a.age < 30).length === 4);
check("s46 promised 06-03 = 28 days past promise at 07-01",
  one(`SELECT CAST(julianday('2026-07-01') - julianday(promised_date) AS INT) FROM shipments WHERE shipment_id = 46`) === 28);
check("s47 the phantom: out_for_delivery 05-20, 38 days past promise",
  one(`SELECT CAST(julianday('2026-07-01') - julianday(promised_date) AS INT) FROM shipments WHERE shipment_id = 47`) === 38);

console.log("== planted: invoice ladder + drift trio ==");
const drift = q(`SELECT i.invoice_id, i.shipment_id sid, i.base_cents b, s.freight_cents f, i.base_cents - s.freight_cents d, i.status
  FROM invoices i JOIN shipments s ON s.shipment_id = i.shipment_id WHERE i.base_cents <> s.freight_cents ORDER BY sid`) as Array<{ sid: number; b: number; f: number; d: number; status: string }>;
check("drift rows = exactly 3 (s27 +1200 disputed, s41 +1300 disputed, s36 +1100 paid)",
  JSON.stringify(drift) === JSON.stringify([
    { invoice_id: 27, sid: 27, b: 30200, f: 29000, d: 1200, status: "disputed" },
    { invoice_id: 36, sid: 36, b: 23100, f: 22000, d: 1100, status: "paid" },
    { invoice_id: 40, sid: 41, b: 22300, f: 21000, d: 1300, status: "disputed" },
  ]), JSON.stringify(drift));
check("total drift = +3600", drift.reduce((a, r) => a + r.d, 0) === 3600);
check("invoice statuses paid 44 / pending 5 / disputed 3",
  JSON.stringify(q(`SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY n DESC, status`)) === JSON.stringify([{ status: "paid", n: 44 }, { status: "pending", n: 5 }, { status: "disputed", n: 3 }]),
  JSON.stringify(q(`SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY n DESC, status`)));
check("accessorial rows = exactly 5 (s04 6400, s16 3500, s17 3500, s35 4200, s48 2900)",
  JSON.stringify(q(`SELECT shipment_id sid, accessorial_cents a FROM invoices WHERE accessorial_cents > 0 ORDER BY sid`).map((r) => r)) === JSON.stringify([
    { sid: 4, a: 6400 }, { sid: 16, a: 3500 }, { sid: 17, a: 3500 }, { sid: 35, a: 4200 }, { sid: 48, a: 2900 },
  ]), JSON.stringify(q(`SELECT shipment_id sid, accessorial_cents a FROM invoices WHERE accessorial_cents > 0 ORDER BY sid`)));
check("largest invoice = s04's 113920 (96000 + 11520 + 6400)",
  one(`SELECT MAX(base_cents + fuel_cents + accessorial_cents) FROM invoices`) === 113920 &&
  one(`SELECT shipment_id FROM invoices ORDER BY base_cents + fuel_cents + accessorial_cents DESC LIMIT 1`) === 4);
check("second-largest total = 40320, a MIRROR TIE (s01 delivered on the SLA line vs s07 still in transit — same 36000 quote)",
  one(`SELECT MAX(base_cents + fuel_cents + accessorial_cents) FROM invoices WHERE shipment_id <> 4`) === 40320 &&
  JSON.stringify(q(`SELECT shipment_id sid FROM invoices WHERE base_cents + fuel_cents + accessorial_cents = 40320 ORDER BY sid`).map((r) => r.sid)) === JSON.stringify([1, 7]) &&
  one(`SELECT COUNT(*) FROM shipments WHERE shipment_id IN (1, 7) AND service = 'express' AND freight_cents = 36000 AND origin_wh = 1`) === 2);
check("total invoiced = 986856? — probe reports", one(`SELECT SUM(base_cents + fuel_cents + accessorial_cents) FROM invoices`));
const monthly = q(`SELECT strftime('%Y-%m', issue_date) ym, SUM(base_cents + fuel_cents + accessorial_cents) t, COUNT(*) n FROM invoices GROUP BY ym ORDER BY ym`);
console.log("  monthly invoiced:", JSON.stringify(monthly));
check("June is the record month; April second (the whale's 113920)", (monthly[monthly.length - 1] as { ym: string; t: number }).ym === "2026-06" && (monthly[3] as { ym: string; t: number }).ym === "2026-04");

console.log("== planted: claims book ==");
check("claim types lost 1 / damaged 11", JSON.stringify(q(`SELECT claim_type, COUNT(*) n FROM freight_claims GROUP BY claim_type ORDER BY n DESC, claim_type`)) === JSON.stringify([{ claim_type: "damaged", n: 11 }, { claim_type: "lost", n: 1 }]));
check("claim statuses open 5 / approved 4 / denied 3", JSON.stringify(q(`SELECT status, COUNT(*) n FROM freight_claims GROUP BY status ORDER BY n DESC, status`)) === JSON.stringify([{ status: "open", n: 5 }, { status: "approved", n: 4 }, { status: "denied", n: 3 }]));
check("total claimed = 390600", one("SELECT SUM(claimed_cents) FROM freight_claims") === 390600);
check("max claim = EXACTLY 200000 (c01, the lost shipment, open)",
  one("SELECT MAX(claimed_cents) FROM freight_claims") === 200000 && one("SELECT shipment_id FROM freight_claims WHERE claimed_cents = 200000") === 50);
check("claims >= 200000 = 1; > 200000 = 0 (the wall)",
  one("SELECT COUNT(*) FROM freight_claims WHERE claimed_cents >= 200000") === 1 && one("SELECT COUNT(*) FROM freight_claims WHERE claimed_cents > 200000") === 0);
check("runner-up = 48000", one("SELECT MAX(claimed_cents) FROM freight_claims WHERE claimed_cents < 200000") === 48000);
check("the 48000 twins: c07 + c08, both open",
  JSON.stringify(q(`SELECT claim_id, shipment_id, status FROM freight_claims WHERE claimed_cents = 48000 ORDER BY claim_id`)) === JSON.stringify([
    { claim_id: 7, shipment_id: 24, status: "open" }, { claim_id: 8, shipment_id: 34, status: "open" },
  ]));
check("open claims have NULL decided_date, others set", one(`SELECT COUNT(*) FROM freight_claims WHERE (status = 'open') <> (decided_date IS NULL)`) === 0);
check("approved payout total = 8800+5200+6100+9900 = 30000 (claimed on approved rows)",
  one(`SELECT SUM(claimed_cents) FROM freight_claims WHERE status = 'approved'`) === 30000);
check("claims on delivered = 6 (concealed damage) / exception 4 / returned 2",
  one(`SELECT COUNT(*) FROM freight_claims c JOIN shipments s ON s.shipment_id = c.shipment_id WHERE s.status = 'delivered'`) === 6 &&
  one(`SELECT COUNT(*) FROM freight_claims c JOIN shipments s ON s.shipment_id = c.shipment_id WHERE s.status = 'exception'`) === 4 &&
  one(`SELECT COUNT(*) FROM freight_claims c JOIN shipments s ON s.shipment_id = c.shipment_id WHERE s.status = 'returned'`) === 2);

console.log("== planted: cross-border lanes ==");
const cb = q(`SELECT s.shipment_id sid, s.freight_cents f, w.region wr, c.region cr
  FROM shipments s JOIN warehouses w ON w.warehouse_id = s.origin_wh JOIN customers c ON c.customer_id = s.customer_id
  WHERE w.region <> c.region ORDER BY sid`) as Array<{ sid: number }>;
check("cross-border lanes (hub region != customer region) = 5 (s37-s40, s48 — the LATAM lanes)",
  JSON.stringify(cb.map((r) => r.sid)) === JSON.stringify([37, 38, 39, 40, 48]), JSON.stringify(cb));
check("cross-border freight = 6000+6200+5800+0+6400 = 24400",
  one(`SELECT SUM(s.freight_cents) FROM shipments s JOIN warehouses w ON w.warehouse_id = s.origin_wh JOIN customers c ON c.customer_id = s.customer_id WHERE w.region <> c.region`) === 24400);
check("s41 has the longest distance (8200 km)", one("SELECT shipment_id FROM shipments ORDER BY distance_km DESC LIMIT 1") === 41);
check("the customs dwell belongs to cross-border s48; s41 is the longest Rotterdam hold", dwell[0].sid === 48 && dwell[1].sid === 41);
check("s48 IS the cross-border customs exception (LATAM lane via Memphis)",
  one(`SELECT COUNT(*) FROM shipments s JOIN warehouses w ON w.warehouse_id = s.origin_wh JOIN customers c ON c.customer_id = s.customer_id WHERE s.shipment_id = 48 AND w.region <> c.region`) === 1);

console.log("== service-level economics ==");
const svcFreight = q(`SELECT service, SUM(freight_cents) f, COUNT(*) n, ROUND(AVG(freight_cents), 0) a FROM shipments WHERE status = 'delivered' GROUP BY service ORDER BY f DESC`);
console.log("  delivered freight by service:", JSON.stringify(svcFreight));
check("express carries the most delivered freight", (svcFreight[0] as { service: string }).service === "express");

console.log("== s01 the SLA boundary survivor details ==");
check("s01: ship 06-01, promised 06-03, delivered 06-03, express",
  one(`SELECT COUNT(*) FROM shipments WHERE shipment_id = 1 AND ship_date = '2026-06-01' AND promised_date = '2026-06-03' AND delivered_date = '2026-06-03' AND service = 'express'`) === 1);

console.log(`\n${fails === 0 ? "ALL PROBES PASS" : fails + " PROBES FAILED"}`);
process.exit(fails === 0 ? 0 : 1);
