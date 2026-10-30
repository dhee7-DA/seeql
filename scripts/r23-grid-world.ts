// lc-round23-redo — rebuilds the Energy & Grid Ops world (pack #9) after the
// workspace rollback. Deterministic (no RNG): every wall is hand-placed and
// probed. Emits scripts/r23-grid-seed.sql AND the two content modules
// (dm-grid-schema.ts, dm-grid-seed.ts), then builds a bun:sqlite db from the
// emitted seed and runs the SQL probe — the facts the content banks cite.
//
// Walls (design record):
//   - the billing whale: Aurora Alloys (meter 1, industrial) bills dominate;
//     ex-whale the tariff board flips industrial -> commercial
//   - the 5-minute wall: regulatory momentary = duration <= 300s; two outages
//     sit EXACTLY on 300s (inclusive vs strict split)
//   - the flicker pairs: same-substation starts 180s apart and EXACTLY 240s
//     apart (<= 240 catches 2 pairs, < 240 catches 1)
//   - the storm ring: OUT-2471..OUT-2477 contiguous, all storm, all Cascadia,
//     5 restored / 2 active, restored clocks average EXACTLY 38 min response
//     and 230 min restore
//   - the ceiling: Columbia Rim sits EXACTLY on 20 outages on the utility
//     board (Cascadia holds 30) — >= 20 vs > 20 = 2 vs 1
//   - the mirror tie: two outages EXACTLY 4200 customers affected ('62,79')
//   - the response SLA: one dispatch arrives EXACTLY 3600s (>= vs > = 1 vs 0)
//   - crew 1 cleared EXACTLY 20; crew 8 dark (never dispatched)
//   - sessionization: meter 1 carries EXACTLY 100 readings across June 1-7
//     with ONE gap of EXACTLY 1800s (7 sessions strict vs 8 inclusive)
//   - the disconnect ladder: unpaid balances EXACTLY 500000 on two meters,
//     one meter above (>= 500000 = 3 vs > 500000 = 1)
//   - the rate drift trio: 3 bills priced at a stale rate, one PAID anyway
//   - honest zeros: Cedar dark (0 outages), crew 8 dark, idle/disconnected
//     meters carry 0 readings, Bluewater carries 0 delinquent bills
//   - the calendar spine: February 2026 holds zero outages
//   - the capacity tie: two wind/hydro plants EXACTLY 850 MW ('2,3')
//   - the storm king: the single biggest outage carries the storm board;
//     ex-king, equipment takes the crown (the cause flip)
import { writeFileSync } from "node:fs";
import { Database } from "bun:sqlite";

const EPOCH = (date: string, h = 0, m = 0) =>
  Math.floor(new Date(date + "T00:00:00Z").getTime() / 1000) + h * 3600 + m * 60;
const V = (v: unknown) =>
  v === null ? "NULL" : typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v);
const ins = (table: string, cols: string[], rows: unknown[][]) =>
  `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n` +
  rows.map((r) => `  (${r.map(V).join(", ")})`).join(",\n") + ";\n";
const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error("WALL VIOLATION: " + msg);
};

// ---------------------------------------------------------------- utilities
const utilities: unknown[][] = [
  [1, "Cascadia Power", "CSP", "Seattle", 1947],
  [2, "Rainier Power & Light", "RPL", "Tacoma", 1962],
  [3, "Columbia Rim Energy", "CRE", "Portland", 1958],
  [4, "Timberline Utilities", "TBU", "Spokane", 1971],
  [5, "Saltchuck Energy", "SCE", "Juneau", 1983],
  [6, "Bluewater Grid", "BWG", "Boise", 1996],
];

// ---------------------------------------------------------------- plants
// 14 plants. Capacity tie: p2/p3 EXACTLY 850. Nuclear whale 2400. No other 850.
const plants: unknown[][] = [
  [1, 1, "Skagit River Hydro", "hydro", 1200, "metro", 1968],
  [2, 1, "Gorge Pass Wind", "wind", 850, "north", 2016],
  [3, 2, "Nisqually Falls Hydro", "hydro", 850, "south", 1954],
  [4, 2, "Tacoma Gas Frame", "gas", 920, "south", 2003],
  [5, 3, "Boardman Flats Solar", "solar", 460, "east", 2021],
  [6, 3, "Umatilla Gas", "gas", 1100, "east", 1978],
  [7, 4, "Whitman Falls Hydro", "hydro", 1040, "north", 1962],
  [8, 4, "Spokane Basin Nuclear", "nuclear", 2400, "east", 1986],
  [9, 1, "Diablo Ridge Wind", "wind", 620, "coast", 2019],
  [10, 5, "Juneau Peaker", "gas", 180, "coast", 1994],
  [11, 5, "Chilkat Valley Hydro", "hydro", 300, "north", 1988],
  [12, 6, "Owyhee Solar", "solar", 380, "south", 2022],
  [13, 6, "Treasure Valley CC", "gas", 780, "south", 2011],
  [14, 1, "Centralia Coal Retreat", "coal", 670, "metro", 1971],
];

// ---------------------------------------------------------------- substations
// 12 subs. s3 Cedar = the dark substation (0 outages). The outage-count
// ceiling lives on the UTILITY board (Columbia Rim EXACTLY 20):
// s1/s2/s9 = Cascadia, s3/s4 = Rainier, s5/s6 = Columbia Rim,
// s7/s8 = Timberline, s10/s11 = Saltchuck, s12 = Bluewater.
const substations: unknown[][] = [
  [1, 1, "Alder", "metro", 230, 512000],
  [2, 1, "Basalt", "north", 230, 468000],
  [3, 2, "Cedar", "south", 115, 351000],
  [4, 2, "Dogwood", "south", 115, 289000],
  [5, 3, "Elkhorn", "east", 230, 194000],
  [6, 3, "Fir", "east", 115, 423000],
  [7, 4, "Gorge", "north", 69, 168000],
  [8, 4, "Hawthorne", "east", 115, 377000],
  [9, 1, "Icicle", "coast", 230, 501000],
  [10, 5, "Juniper", "coast", 69, 142000],
  [11, 5, "Kettle", "north", 69, 209000],
  [12, 6, "Larch", "south", 115, 356000],
];
const SUB_UTILITY = new Map<number, number>(substations.map((s) => [s[0] as number, s[1] as number]));

// ---------------------------------------------------------------- meters
// 36 meters. m1 = Aurora Alloys (the billing whale). m35 idle, m36
// disconnected (honest zeros). Meter utility derives via substation (2-hop).
const industrialNames = ["Aurora Alloys", "Bremerton Shipworks", "Cascade Paper Mill", "Dry Falls Foundry", "Ellensburg AgriCo", "Longview Chemical"];
const commercialNames = [
  "Pioneer Square Market", "Bay Center Hotel", "Rimrock Cold Storage", "Fifth Ave Fitness", "Salish Weaving Co",
  "Gorge View Brewery", "Timberline Outfitters", "Juniper Data Hall", "Kettle Falls Cannery", "Larch Mall Partners",
];
const residentialNames = [
  "N. Okafor", "P. Vance", "L. Whitfield", "M. Grimaldi", "S. Iversen", "K. Jandali", "R. Keane", "T. Lomeli",
  "A. Mabry", "H. Nwosu", "J. Okabe", "D. Petrosian", "C. Quist", "B. Ravel", "F. Sorrell", "G. Tanaka",
  "W. Umland", "E. Vasquez", "I. Wexler", "O. Xiang",
];
type MeterRow = [number, number, string, string, number, string];
const meters: MeterRow[] = [];
{
  let mi = 0;
  // 6 industrial (subs 1,2,9 = Cascadia + 5,6 = Columbia Rim)
  const indSubs = [1, 2, 9, 5, 6, 1];
  for (let i = 0; i < 6; i++) {
    const id = i + 1;
    meters.push([id, indSubs[i], industrialNames[i], "industrial", id === 1 ? 8 : 9, "active"]);
    mi = id;
  }
  // 10 commercial (spread)
  const comSubs = [2, 4, 5, 6, 8, 9, 10, 11, 12, 4];
  for (let i = 0; i < 10; i++) {
    const id = mi + i + 1; // 7..16
    const rate = id === 12 ? 11 : id === 20 ? 12 : id === 27 ? 15 : id === 22 || id === 30 ? 10 : 10;
    meters.push([id, comSubs[i], commercialNames[i], "commercial", rate, "active"]);
  }
  mi += 10;
  // 20 residential (spread, includes the special-rate drift meters 20/27)
  const resSubs = [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11];
  for (let i = 0; i < 20; i++) {
    const id = mi + i + 1; // 17..36
    let rate = 12 + (id % 4); // 12..15
    if (id === 20) rate = 12;
    if (id === 27) rate = 15;
    const status = id === 35 ? "idle" : id === 36 ? "disconnected" : "active";
    meters.push([id, resSubs[i], residentialNames[i], "residential", rate, status]);
  }
}
const METER = new Map(meters.map((m) => [m[0], m]));

// ---------------------------------------------------------------- outages
// 95 outages, OUT-2401..OUT-2495. Blocks (contiguous ids -> substation):
//   s1: 1-11 (11)  s2: 12-23 (12)  s4: 24-38 (15)  s5: 39-44 (6 = ceiling A,
//   holds the leak)  s6: 45-58 (14, flicker A)  s7: 59-62 (4)  s8: 63-70 (8,
//   flicker B)  s9: 71-77 (7 = the ring + ceiling B)  s10: 78-85 (8)
//   s11: 86-90 (5)  s12: 91-95 (5)  s3: none (dark)
type Outage = {
  id: number; number: string; utilityId: number; substationId: number;
  cause: string; status: string; startedTs: number; restoredTs: number | null;
  customers: number;
};
const outages: Outage[] = [];
const BLOCKS: Array<[number, number, number]> = [
  [1, 11, 1], [12, 23, 2], [24, 38, 4], [39, 44, 5], [45, 58, 6], [59, 62, 7],
  [63, 70, 8], [71, 77, 9], [78, 85, 10], [86, 90, 11], [91, 95, 12],
];
const CAUSES = ["storm", "equipment", "vegetation", "animal", "operator", "traffic"];
const MONTHS = [1, 3, 4, 5, 6]; // February stays empty (calendar spine)

function newOutage(id: number, sub: number): Outage {
  const month = MONTHS[id % 5];
  const day = ((id * 7) % 27) + 1;
  const hour = ((id * 5) % 21) + 1;
  const minute = (id * 17) % 60;
  const startedTs = EPOCH(`2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, hour, minute);
  const duration = 900 + ((id * 137) % 8100); // 900..8999s for the restorable default
  return {
    id,
    number: `OUT-${2400 + id}`,
    utilityId: SUB_UTILITY.get(sub) as number,
    substationId: sub,
    cause: CAUSES[id % 6],
    status: "restored",
    startedTs,
    restoredTs: startedTs + duration,
    customers: 150 + ((id * 83) % 1400), // 150..1549
  };
}
for (const [startId, endId, sub] of BLOCKS) {
  for (let id = startId; id <= endId; id++) outages.push(newOutage(id, sub));
}
const O = (id: number) => outages[id - 1];

// ---- wall placements ----
// the storm king (id 5): Jan storm, 62000 affected, restored after 11h
O(5).cause = "storm";
O(5).customers = 62000;
O(5).restoredTs = O(5).startedTs + 11 * 3600;
// the >4200 support cast (six above the 4200 line, two ON it)
O(21).customers = 6800;  // storm, s2
O(40).customers = 9000;  // equipment, s5
O(40).cause = "equipment";
O(52).customers = 8000;  // s7
O(52).cause = "equipment";
O(73).customers = 5600;  // ring row (storm)
O(87).customers = 4900;  // vegetation, s11
O(62).customers = 4200;  // TIE member (s7)
O(62).cause = "vegetation";
O(79).customers = 4200;  // TIE member (s10)
O(79).cause = "storm";
// two extra equipment rows so the ex-king flip has margin
O(46).customers = 6000; O(46).cause = "equipment";
O(55).customers = 5500; O(55).cause = "equipment";
// momentaries + the 5-minute wall: five below the line, two EXACTLY on 300s
O(13).restoredTs = O(13).startedTs + 60;
O(26).restoredTs = O(26).startedTs + 120;
O(47).restoredTs = O(47).startedTs + 180;
O(68).restoredTs = O(68).startedTs + 240;
O(84).restoredTs = O(84).startedTs + 299;
O(17).restoredTs = O(17).startedTs + 300; // EXACTLY on the line
O(81).restoredTs = O(81).startedTs + 300; // EXACTLY on the line
// flicker pairs: (50,51) 180s apart on Fir; (65,66) EXACTLY 240s on Hawthorne
O(50).startedTs = EPOCH("2026-04-12", 9, 0);
O(51).startedTs = EPOCH("2026-04-12", 9, 3);
O(50).restoredTs = O(50).startedTs + 900;
O(51).restoredTs = O(51).startedTs + 1500;
O(65).startedTs = EPOCH("2026-05-06", 14, 0);
O(66).startedTs = EPOCH("2026-05-06", 14, 4);
O(65).restoredTs = O(65).startedTs + 1200;
O(66).restoredTs = O(66).startedTs + 2100;
// the storm ring: ids 71..77 = OUT-2471..OUT-2477, Icicle, all storm, one
// sweeping night (starts 900s apart), 5 restored / 2 active.
const RING_DUR_MIN = [180, 200, 220, 260, 290]; // restored rows 71..75 -> avg EXACTLY 230
const RING_CUST = [1200, 1800, 5600, 2400, 3100, 900, 1500];
for (let i = 0; i < 7; i++) {
  const o = O(71 + i);
  o.cause = "storm";
  o.startedTs = EPOCH("2026-03-14", 18, 0) + i * 900;
  o.customers = RING_CUST[i];
  if (i < 5) {
    o.restoredTs = o.startedTs + RING_DUR_MIN[i] * 60;
  } else {
    o.restoredTs = null;
    o.status = "active";
  }
}
// the leak: outage 44 — active since 05-28 06:00, 9800 affected, NO dispatch
O(44).cause = "equipment";
O(44).status = "active";
O(44).startedTs = EPOCH("2026-05-28", 6, 0);
O(44).restoredTs = null;
O(44).customers = 9800;
// two more actives for a living pipeline
O(54).status = "active"; O(54).restoredTs = null; O(54).startedTs = EPOCH("2026-06-28", 5, 30);
O(88).status = "active"; O(88).restoredTs = null; O(88).startedTs = EPOCH("2026-06-29", 16, 15);

// sweep A: same-substation start gaps — only the flicker pairs may sit <= 600s
const FLICKER = new Set([50, 51, 65, 66]);
for (const sub of new Set(outages.map((o) => o.substationId))) {
  const rows = outages.filter((o) => o.substationId === sub).sort((a, b) => a.startedTs - b.startedTs);
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1], b = rows[i];
    const bothFlicker = FLICKER.has(a.id) && FLICKER.has(b.id) && a.substationId === b.substationId;
    if (bothFlicker) continue;
    if (b.startedTs - a.startedTs < 600) b.startedTs = a.startedTs + 3600 + b.id * 17;
  }
}
// sweep B: durations — nothing unplanted may sit in [240..310]s or == 1800
for (const o of outages) {
  if (o.restoredTs === null) continue;
  const dur = o.restoredTs - o.startedTs;
  const planted = [13, 17, 26, 47, 68, 81, 84].includes(o.id);
  if (!planted && (dur <= 310 || (dur >= 1790 && dur <= 1810))) {
    o.restoredTs = o.startedTs + 900 + ((o.id * 137) % 8100);
  }
}
// active rows never carry a restored_ts
for (const o of outages) if (o.status === "active") o.restoredTs = null;
// ring continuity check
for (let i = 0; i < 7; i++) assert(O(71 + i).number === `OUT-${2471 + i}`, "ring numbers");
for (const o of outages) assert(o.number === `OUT-${2400 + o.id}`, "outage numbering");

// ---------------------------------------------------------------- crews
const crews: unknown[][] = [
  [1, "Mara Quinn", 1, "Seattle", "line"],
  [2, "Jonas Feld", 1, "Tacoma", "line"],
  [3, "Priya Raman", 1, "Bellevue", "substation"],
  [4, "Dario Voss", 2, "Tacoma", "vegetation"],
  [5, "Lena Marsh", 3, "Portland", "line"],
  [6, "Tomas Ibarra", 3, "Portland", "trouble"],
  [7, "Ingrid Holt", 4, "Spokane", "trouble"],
  [8, "Simeon Okoye", 5, "Juneau", "line"], // the dark crew
];

// ---------------------------------------------------------------- dispatches
// Every restored outage with duration >= 900s gets a crew dispatch (the
// momentaries are auto-reclose: NO dispatch, the honest crew-less restore).
// Actives: 76 onsite (crew 2), 54 enroute (crew 6), 88 onsite (crew 5),
// 44 + 77 no dispatch yet. Crew 1 ends with EXACTLY 20 cleared, crew 8 with 0.
type Dispatch = {
  id: number; outageId: number; crewId: number;
  dispatchedTs: number; arrivedTs: number | null; status: string;
};
const dispatches: Dispatch[] = [];
let dispId = 1;
const crewCleared = new Map<number, number>(crews.map((c) => [c[0] as number, 0]));

function addDispatch(outageId: number, crewId: number, dispatchedTs: number, responseSec: number | null, status: string) {
  dispatches.push({
    id: dispId++,
    outageId,
    crewId,
    dispatchedTs,
    arrivedTs: responseSec === null ? null : dispatchedTs + responseSec,
    status,
  });
  if (status === "cleared") crewCleared.set(crewId, (crewCleared.get(crewId) ?? 0) + 1);
}

const UTILITY_CREWS = new Map<number, number[]>([
  [1, [1, 2, 3]], [2, [4]], [3, [5, 6]], [4, [7]], [5, [1, 2, 3, 6]], [6, [1, 2, 3, 7]],
]);
const dispatchCursor = new Map<number, number>([1, 2, 3, 4, 5, 6, 7].map((c) => [c, 0]));

function nextCrew(utilityId: number): number {
  const pool = UTILITY_CREWS.get(utilityId) as number[];
  // round-robin over the pool, skipping crew 8 (never dispatched)
  const cur = dispatchCursor.get(utilityId) ?? 0;
  const crew = pool[cur % pool.length];
  dispatchCursor.set(utilityId, cur + 1);
  return crew;
}

const RESPONSE_EXACT_3600_OUTAGE = 31; // the response-SLA boundary row
for (const o of outages) {
  const dur = o.restoredTs === null ? null : o.restoredTs - o.startedTs;
  const isMomentary = dur !== null && dur < 900;
  if (isMomentary) continue; // auto-reclose: no crew
  if (o.status === "active") {
    if (o.id === 54) {
      addDispatch(54, 6, o.startedTs + 900, null, "enroute");
    } else if (o.id === 76) {
      addDispatch(76, 2, o.startedTs + 600, 1500, "onsite");
    } else if (o.id === 88) {
      addDispatch(88, 5, o.startedTs + 700, 1400, "onsite");
    }
    continue; // 44 and 77 stay crew-less
  }
  const lag = 300 + ((o.id * 61) % 1200);
  const dispatchedTs = o.startedTs + lag;
  let response = 600 + ((o.id * 173) % 2100); // 600..2699
  if (o.id >= 71 && o.id <= 75) {
    // ring responses: 30/34/38/42/46 min -> avg EXACTLY 38 min
    response = [1800, 2040, 2280, 2520, 2760][o.id - 71];
  }
  if (o.id === RESPONSE_EXACT_3600_OUTAGE) response = 3600; // EXACTLY on the SLA line
  const crewId = nextCrew(o.utilityId);
  addDispatch(o.id, crewId, dispatchedTs, response, "cleared");
}
// rebalance: crew 1 must land on EXACTLY 20 cleared (cross-utility swaps are
// legitimate mutual aid; crew 8 stays dark throughout)
const clearedOf = (c: number) =>
  dispatches.filter((d) => d.crewId === c && d.status === "cleared");
while (clearedOf(1).length < 20) {
  const donor = [2, 3, 4, 5, 6, 7]
    .map((c) => ({ c, n: clearedOf(c).length }))
    .sort((a, b) => b.n - a.n)[0];
  const victim = clearedOf(donor.c)[0];
  victim.crewId = 1;
}
while (clearedOf(1).length > 20) {
  const target = [2, 3, 4, 5, 6, 7].sort(
    (a, b) => clearedOf(a).length - clearedOf(b).length,
  )[0];
  clearedOf(1)[0].crewId = target;
}
// crew bookkeeping asserts (recomputed AFTER the rebalance)
for (const [k] of crewCleared) crewCleared.set(k, 0);
for (const d of dispatches) if (d.status === "cleared") crewCleared.set(d.crewId, (crewCleared.get(d.crewId) ?? 0) + 1);
assert((crewCleared.get(1) ?? 0) === 20, `crew 1 cleared ${crewCleared.get(1)} (want 20)`);
assert((crewCleared.get(8) ?? 0) === 0, "crew 8 dark");
for (const o of outages) {
  if (o.status === "active") continue;
  const dur = o.restoredTs as number - o.startedTs;
  if (dur < 900) {
    assert(!dispatches.some((d) => d.outageId === o.id), `momentary ${o.id} must be crew-less`);
  }
}
assert(!dispatches.some((d) => d.outageId === 44), "the leak has no dispatch");
assert(dispatches.filter((d) => d.arrivedTs !== null && d.arrivedTs - d.dispatchedTs >= 3600).length === 1,
  "exactly one arrival on/over the 3600 line");
const ringDisp = dispatches.filter((d) => d.outageId >= 71 && d.outageId <= 75);
assert(ringDisp.length === 5, "ring restored rows all crewed");
const ringRespAvg = ringDisp.reduce((a, d) => a + ((d.arrivedTs as number) - d.dispatchedTs), 0) / 5 / 60;
assert(ringRespAvg === 38, `ring response avg ${ringRespAvg} (want 38)`);
const ringRestoreAvg =
  [71, 72, 73, 74, 75].reduce((a, id) => a + ((O(id).restoredTs as number) - O(id).startedTs) / 60, 0) / 5;
assert(ringRestoreAvg === 230, `ring restore avg ${ringRestoreAvg} (want 230)`);

// ---------------------------------------------------------------- bills
// 108 slots (36 meters x 3 periods); m35 skips 06 (went idle), m36 carries
// none (disconnected) -> 104 bills. Aurora: EXACTLY 600000 kWh/period at
// rate 8 -> 4800000 per bill. Drift trio: m12 (05, paid), m20 (05), m27 (06).
type Bill = {
  id: number; meterId: number; period: string; kwh: number; rate: number;
  amount: number; status: string; issuedOn: string; paidOn: string | null;
};
const bills: Bill[] = [];
let billId = 1;
const PERIODS = ["2026-04", "2026-05", "2026-06"];
const kwhFor = (m: MeterRow, period: string): number => {
  if (m[0] === 1) return 600000;
  if (m[3] === "industrial") return 25000 + ((m[0] * 733) % 15000); // 25k..40k
  if (m[3] === "commercial") return 14000 + ((m[0] * 641) % 6000);  // 14k..20k
  return 350 + ((m[0] * 977) % 1250); // residential 350..1600
};
function addBill(m: MeterRow, period: string, kwh: number, rate: number, status: string): Bill {
  const issueMonth = (parseInt(period.slice(5, 7), 10) % 12) + 1;
  const issuedOn = `2026-${String(issueMonth).padStart(2, "0")}-0${(m[0] % 5) + 1}`;
  const paidOn = status === "paid"
    ? `2026-${String(issueMonth).padStart(2, "0")}-${String(10 + (m[0] % 15)).padStart(2, "0")}`
    : null;
  const bill: Bill = { id: billId++, meterId: m[0], period, kwh, rate, amount: kwh * rate, status, issuedOn, paidOn };
  bills.push(bill);
  return bill;
}
// kwh overrides for the disconnect-ladder meters (balance must land EXACTLY)
// m14 commercial rate 10 (Saltchuck): 04 del 450000 + 05 issued 270000 = 720000
// m11 commercial rate 10 (Timberline): 04 del 240000 + 05 issued 260000 = 500000 EXACT
// m16 commercial rate 10 (Rainier):    04 del 330000 + 05 issued 170000 = 500000 EXACT
const KWH_OVERRIDE = new Map<string, number>([
  ["14:2026-04", 45000], ["14:2026-05", 27000],
  ["11:2026-04", 24000], ["11:2026-05", 26000],
  ["16:2026-04", 33000], ["16:2026-05", 17000],
]);
const DRIFT = new Map<string, number>([
  ["12:2026-05", 10], // meter rate 11 -> stale 10, PAID anyway
  ["20:2026-05", 10], // meter rate 12 -> stale 10
  ["27:2026-06", 12], // meter rate 15 -> stale 12
]);
const DELINQUENT = new Set([
  "14:2026-04", "11:2026-04", "16:2026-04",
  "7:2026-04", "18:2026-04", "29:2026-04",
]);
// the ladder meters' 05 bills stay UNPAID so their balances cross the line;
// their 06 bills are paid on time (the newest bill gets paid, the old debt lingers)
const FORCE_ISSUED = new Set(["14:2026-05", "11:2026-05", "16:2026-05", "20:2026-05"]);
const FORCE_PAID = new Set(["11:2026-06", "16:2026-06"]);
for (const m of meters) {
  const id = m[0];
  for (const period of PERIODS) {
    if (id === 36) continue; // disconnected: no bills at all
    if (id === 35 && period === "2026-06") continue; // went idle after 05
    const key = `${id}:${period}`;
    const kwh = KWH_OVERRIDE.get(key) ?? kwhFor(m, period);
    const rate = DRIFT.get(key) ?? (m[4] as number);
    const status = id === 1 ? "paid" : DELINQUENT.has(key) ? "delinquent" : FORCE_PAID.has(key) ? "paid" : FORCE_ISSUED.has(key) ? "issued" : period === "2026-06" ? "issued" : id === 35 && period === "2026-05" ? "issued" : "paid";
    addBill(m, period, kwh, rate, status);
  }
}
// m35's 05 bill is issued, m12's drift bill paid — fix that one status
(bills.find((b) => b.meterId === 12 && b.period === "2026-05") as Bill).status = "paid";
// Bluewater (s12 meters: 15,24? no — meters on s12) must carry zero delinquents
const bluewaterMeters = meters.filter((m) => SUB_UTILITY.get(m[1] as number) === 6).map((m) => m[0]);
for (const b of bills) {
  if (bluewaterMeters.includes(b.meterId)) assert(b.status !== "delinquent", "Bluewater must stay delinquent-free");
}
// balance walls
const balanceOf = (meterId: number) =>
  bills.filter((b) => b.meterId === meterId && b.status !== "paid").reduce((a, b) => a + b.amount, 0);
const overLadder = meters.filter((m) => balanceOf(m[0] as number) > 500000).map((m) => m[0]);
const onLadder = meters.filter((m) => balanceOf(m[0] as number) === 500000).map((m) => m[0]);
assert(onLadder.join(",") === "11,16", `EXACT-500000 meters = [${onLadder}] (want 11,16)`);
assert(overLadder.join(",") === "14", `>500000 meters = [${overLadder}] (want 14)`);
// no accidental drift rows
const driftRows = bills.filter((b) => b.rate !== (METER.get(b.meterId) as MeterRow)[4]);
assert(driftRows.length === 3, `drift rows = ${driftRows.length} (want 3)`);

// ---------------------------------------------------------------- readings
// Meter 1: EXACTLY 100 readings across June 1-7. Day 1: 10 @900s from 08:00,
// then ONE gap of EXACTLY 1800s, then 6 more. Days 2-7: 14 @900s from 06:00.
// Sessions with a 1800s cutoff: 7 strict (gap > 1800 splits) vs 8 inclusive.
type Reading = { id: number; meterId: number; readTs: number; kwh: number };
const readings: Reading[] = [];
let readId = 1;
const m1Kwh = (i: number) => 200 + (i % 40);
{
  let k = 0;
  for (let i = 0; i < 10; i++) {
    readings.push({ id: readId++, meterId: 1, readTs: EPOCH("2026-06-01", 8, 0) + i * 900, kwh: m1Kwh(k++) });
  }
  for (let i = 0; i < 6; i++) {
    readings.push({ id: readId++, meterId: 1, readTs: EPOCH("2026-06-01", 8, 0) + 9 * 900 + 1800 + i * 900, kwh: m1Kwh(k++) });
  }
  for (let d = 2; d <= 7; d++) {
    for (let i = 0; i < 14; i++) {
      readings.push({ id: readId++, meterId: 1, readTs: EPOCH(`2026-06-0${d}`, 6, 0) + i * 900, kwh: m1Kwh(k++) });
    }
  }
}
assert(readings.length === 100, `meter 1 readings = ${readings.length} (want 100)`);
// other active meters: 2-3 telemetry rows each across June 10-15
for (const m of meters) {
  if (m[0] === 1) continue;
  if (m[5] !== "active") continue; // idle + disconnected stay dark
  const n = 2 + (m[0] % 2);
  for (let i = 0; i < n; i++) {
    const day = 10 + ((m[0] + i) % 6);
    const scale = m[3] === "industrial" ? 2900 : m[3] === "commercial" ? 150 : 2;
    readings.push({
      id: readId++,
      meterId: m[0],
      readTs: EPOCH(`2026-06-${String(day).padStart(2, "0")}`, 6 + i * 2, (m[0] * 11) % 60),
      kwh: scale + ((m[0] * 13 + i * 7) % Math.max(3, Math.floor(scale / 3))),
    });
  }
}
// meter-1 gap forensics
const m1 = readings.filter((r) => r.meterId === 1).sort((a, b) => a.readTs - b.readTs);
const gaps: number[] = [];
for (let i = 1; i < m1.length; i++) gaps.push(m1[i].readTs - m1[i - 1].readTs);
assert(gaps.filter((g) => g === 1800).length === 1, `1800s gaps = ${gaps.filter((g) => g === 1800).length} (want 1)`);
const sessionsStrict = 1 + gaps.filter((g) => g > 1800).length;
const sessionsInclusive = 1 + gaps.filter((g) => g >= 1800).length;
assert(sessionsStrict === 7 && sessionsInclusive === 8, `sessions ${sessionsStrict}/${sessionsInclusive} (want 7/8)`);

// ---------------------------------------------------------------- emit
const DDL = `CREATE TABLE utilities (
  utility_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  hq_city    TEXT NOT NULL,
  founded    INTEGER NOT NULL
);

CREATE TABLE plants (
  plant_id     INTEGER PRIMARY KEY,
  utility_id   INTEGER NOT NULL REFERENCES utilities(utility_id),
  name         TEXT NOT NULL,
  fuel         TEXT NOT NULL,     -- 'hydro' | 'gas' | 'wind' | 'solar' | 'nuclear' | 'coal'
  capacity_mw  INTEGER NOT NULL,
  region       TEXT NOT NULL,     -- 'metro' | 'north' | 'south' | 'east' | 'coast'
  commissioned INTEGER NOT NULL
);

CREATE TABLE substations (
  substation_id    INTEGER PRIMARY KEY,
  utility_id       INTEGER NOT NULL REFERENCES utilities(utility_id),
  name             TEXT NOT NULL,
  region           TEXT NOT NULL,
  voltage_kv       INTEGER NOT NULL,
  customers_served INTEGER NOT NULL
);

CREATE TABLE meters (
  meter_id      INTEGER PRIMARY KEY,
  substation_id INTEGER NOT NULL REFERENCES substations(substation_id),
  customer_name TEXT NOT NULL,
  tariff        TEXT NOT NULL,    -- 'residential' | 'commercial' | 'industrial'
  rate_cents    INTEGER NOT NULL, -- current price per kWh in cents (the drift reference)
  status        TEXT NOT NULL     -- 'active' | 'idle' | 'disconnected'
);

CREATE TABLE readings (
  reading_id INTEGER PRIMARY KEY,
  meter_id   INTEGER NOT NULL REFERENCES meters(meter_id),
  read_ts    INTEGER NOT NULL,  -- epoch seconds; the sessionization anchor
  kwh        INTEGER NOT NULL
);

CREATE TABLE outages (
  outage_id          INTEGER PRIMARY KEY,
  outage_number      TEXT NOT NULL, -- 'OUT-2401' .. 'OUT-2495'
  utility_id         INTEGER NOT NULL REFERENCES utilities(utility_id),
  substation_id      INTEGER NOT NULL REFERENCES substations(substation_id),
  cause              TEXT NOT NULL, -- 'storm' | 'equipment' | 'vegetation' | 'animal' | 'operator' | 'traffic'
  status             TEXT NOT NULL, -- 'restored' | 'active'
  started_ts         INTEGER NOT NULL,
  restored_ts        INTEGER,       -- NULL while active
  customers_affected INTEGER NOT NULL
);

CREATE TABLE crews (
  crew_id    INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  utility_id INTEGER NOT NULL REFERENCES utilities(utility_id),
  depot      TEXT NOT NULL,
  specialty  TEXT NOT NULL     -- 'line' | 'vegetation' | 'substation' | 'trouble'
);

CREATE TABLE dispatches (
  dispatch_id   INTEGER PRIMARY KEY,
  outage_id     INTEGER NOT NULL REFERENCES outages(outage_id),
  crew_id       INTEGER NOT NULL REFERENCES crews(crew_id),
  dispatched_ts INTEGER NOT NULL,
  arrived_ts    INTEGER,         -- NULL while en route
  status        TEXT NOT NULL    -- 'cleared' | 'onsite' | 'enroute'
);

CREATE TABLE bills (
  bill_id      INTEGER PRIMARY KEY,
  meter_id     INTEGER NOT NULL REFERENCES meters(meter_id),
  period       TEXT NOT NULL,    -- '2026-04' | '2026-05' | '2026-06'
  kwh_billed   INTEGER NOT NULL,
  rate_cents   INTEGER NOT NULL, -- snapshot price per kWh at issuance
  amount_cents INTEGER NOT NULL,
  status       TEXT NOT NULL,    -- 'paid' | 'issued' | 'delinquent'
  issued_on    TEXT NOT NULL,
  paid_on      TEXT              -- NULL while unpaid
);`;

const parts: string[] = [];
parts.push(ins("utilities", ["utility_id", "name", "code", "hq_city", "founded"], utilities));
parts.push(ins("plants", ["plant_id", "utility_id", "name", "fuel", "capacity_mw", "region", "commissioned"], plants));
parts.push(ins("substations", ["substation_id", "utility_id", "name", "region", "voltage_kv", "customers_served"], substations));
parts.push(ins("meters", ["meter_id", "substation_id", "customer_name", "tariff", "rate_cents", "status"], meters));
parts.push(ins("readings", ["reading_id", "meter_id", "read_ts", "kwh"], readings.map((r) => [r.id, r.meterId, r.readTs, r.kwh])));
parts.push(ins("outages", ["outage_id", "outage_number", "utility_id", "substation_id", "cause", "status", "started_ts", "restored_ts", "customers_affected"], outages.map((o) => [o.id, o.number, o.utilityId, o.substationId, o.cause, o.status, o.startedTs, o.restoredTs, o.customers])));
parts.push(ins("crews", ["crew_id", "name", "utility_id", "depot", "specialty"], crews));
parts.push(ins("dispatches", ["dispatch_id", "outage_id", "crew_id", "dispatched_ts", "arrived_ts", "status"], dispatches.map((d) => [d.id, d.outageId, d.crewId, d.dispatchedTs, d.arrivedTs, d.status])));
parts.push(ins("bills", ["bill_id", "meter_id", "period", "kwh_billed", "rate_cents", "amount_cents", "status", "issued_on", "paid_on"], bills.map((b) => [b.id, b.meterId, b.period, b.kwh, b.rate, b.amount, b.status, b.issuedOn, b.paidOn])));
const seedSql = parts.join("\n");

writeFileSync("/home/z/my-project/scripts/r23-grid-seed.sql", seedSql);

const seedBanner = `// Domain Mastery — Energy & Grid Ops · shared world seed (GENERATED).
//
// Emitted by scripts/r23-grid-world.ts — the deterministic world builder.
// Do not hand-edit; re-run the generator. The wall placements are probed
// and printed by the same script (see its tail): the Aurora Alloys billing
// whale, the 5-minute wall (two outages EXACTLY on 300s), the flicker pairs
// (180s and EXACTLY 240s), the storm ring OUT-2471..2477 (clocks 38/230),
// the Elkhorn/Icicle ceiling (6/7), the 4200 mirror tie ('62,79'), the
// 3600s response line, crew 1 at EXACTLY 20 cleared, meter 1's 100 readings
// with ONE 1800s gap (7 strict vs 8 inclusive), the 500000 disconnect
// ladder, the rate-drift trio, and February's empty calendar row.
export const DM_GRID_SEED = \``;

writeFileSync(
  "/home/z/my-project/src/lib/leetcode/content/dm-grid-seed.ts",
  seedBanner + "\n" + seedSql.replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`;\n",
);

// ---------------------------------------------------------------- SQL probe
const db = new Database(":memory:");
db.exec(DDL);
db.exec(seedSql);
const q1 = (sql: string) => db.prepare(sql).get() as Record<string, unknown>;
const qa = (sql: string) => db.prepare(sql).all() as Record<string, unknown>[];
const facts: string[] = [];

// money ladder
const ladder = q1(`SELECT
  SUM(amount_cents) AS billed,
  SUM(CASE WHEN status='paid' THEN amount_cents ELSE 0 END) AS collected,
  SUM(CASE WHEN status='issued' THEN amount_cents ELSE 0 END) AS issued_amt,
  SUM(CASE WHEN status='delinquent' THEN amount_cents ELSE 0 END) AS delinquent_amt,
  COUNT(*) AS bill_count
FROM bills`);
facts.push(`money ladder: billed=${ladder.billed} collected=${ladder.collected} issued=${ladder.issued_amt} delinquent=${ladder.delinquent_amt} bills=${ladder.bill_count}`);

// the whale + flip
const whale = q1(`SELECT SUM(amount_cents) AS amt FROM bills WHERE meter_id = 1`);
const billedTotal = Number(ladder.billed);
const whaleShare = Math.round((Number(whale.amt) / billedTotal) * 10000) / 100;
const tariffBoard = qa(`SELECT m.tariff, SUM(b.amount_cents) AS amt
FROM bills b JOIN meters m ON m.meter_id = b.meter_id
GROUP BY m.tariff ORDER BY amt DESC`);
const tariffBoardEx = qa(`SELECT m.tariff, SUM(b.amount_cents) AS amt
FROM bills b JOIN meters m ON m.meter_id = b.meter_id
WHERE b.meter_id <> 1
GROUP BY m.tariff ORDER BY amt DESC`);
facts.push(`whale (meter 1 Aurora) = ${whale.amt} = ${whaleShare}% of billed`);
facts.push(`tariff board: ${tariffBoard.map((r) => `${r.tariff}:${r.amt}`).join(" | ")}`);
facts.push(`tariff board EX-WHALE: ${tariffBoardEx.map((r) => `${r.tariff}:${r.amt}`).join(" | ")} (flip: commercial leads)`);

// disconnect ladder
const ladderRows = qa(`SELECT meter_id, SUM(amount_cents) AS bal FROM bills
WHERE status <> 'paid' GROUP BY meter_id HAVING bal >= 400000 ORDER BY bal DESC`);
facts.push(`disconnect ladder >= 400000: ${ladderRows.map((r) => `m${r.meter_id}:${r.bal}`).join(", ")}`);
const geCount = qa(`SELECT meter_id FROM bills WHERE status <> 'paid' GROUP BY meter_id HAVING SUM(amount_cents) >= 500000`).length;
const gtCount = qa(`SELECT meter_id FROM bills WHERE status <> 'paid' GROUP BY meter_id HAVING SUM(amount_cents) > 500000`).length;
facts.push(`disconnect wall: >= 500000 = ${geCount} meters, > 500000 = ${gtCount} meters`);

// drift trio
const drift = qa(`SELECT b.bill_id, b.meter_id, b.period, b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status
FROM bills b JOIN meters m ON m.meter_id = b.meter_id
WHERE b.rate_cents <> m.rate_cents ORDER BY b.bill_id`);
facts.push(`drift trio: ${drift.map((r) => `bill${r.bill_id}/m${r.meter_id}/${r.period} ${r.bill_rate}->${r.meter_rate} ${r.status}`).join(" | ")}`);

// meter 1 telemetry
const m1count = q1(`SELECT COUNT(*) AS n FROM readings WHERE meter_id = 1`);
facts.push(`meter 1 readings = ${m1count.n} (want 100)`);
const m1gaps = qa(`SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap
FROM readings WHERE meter_id = 1`);
const gapsList = m1gaps.map((r) => Number(r.gap)).filter((g) => !Number.isNaN(g));
facts.push(`m1 gap == 1800: ${gapsList.filter((g) => g === 1800).length}, gap > 1800: ${gapsList.filter((g) => g > 1800).length}, gap >= 1800: ${gapsList.filter((g) => g >= 1800).length}`);
facts.push(`m1 sessions: strict (gap > 1800) = ${1 + gapsList.filter((g) => g > 1800).length}, inclusive (>= 1800) = ${1 + gapsList.filter((g) => g >= 1800).length}`);

// the 5-minute wall
const fiveMin = q1(`SELECT
  SUM(CASE WHEN duration <= 300 THEN 1 ELSE 0 END) AS momentary_incl,
  SUM(CASE WHEN duration < 300 THEN 1 ELSE 0 END) AS momentary_strict,
  SUM(CASE WHEN duration = 300 THEN 1 ELSE 0 END) AS on_line
FROM (SELECT restored_ts - started_ts AS duration FROM outages WHERE status='restored')`);
facts.push(`5-minute wall: momentary <= 300s = ${fiveMin.momentary_incl}, < 300s = ${fiveMin.momentary_strict}, EXACTLY 300 = ${fiveMin.on_line}`);
const onLineRows = qa(`SELECT outage_id, outage_number, substation_id FROM outages
WHERE status='restored' AND restored_ts - started_ts = 300`);
facts.push(`on-line rows: ${onLineRows.map((r) => `${r.outage_number}(s${r.substation_id})`).join(", ")}`);

// flicker pairs
const flickers = qa(`SELECT a.outage_id AS a_id, b.outage_id AS b_id, b.started_ts - a.started_ts AS gap
FROM outages a JOIN outages b
  ON a.substation_id = b.substation_id AND b.started_ts > a.started_ts
WHERE b.started_ts - a.started_ts <= 300
ORDER BY gap`);
facts.push(`flicker pairs <= 300s: ${flickers.map((r) => `${r.a_id}-${r.b_id}:${r.gap}s`).join(", ")}`);
facts.push(`flicker wall: <= 240 = ${qa(`SELECT 1 FROM outages a JOIN outages b ON a.substation_id=b.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts <= 240`).length} pairs, < 240 = ${qa(`SELECT 1 FROM outages a JOIN outages b ON a.substation_id=b.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts < 240`).length}`);

// the ring
const ring = qa(`SELECT outage_number, cause, status, customers_affected,
  (restored_ts - started_ts)/60 AS restore_min
FROM outages WHERE outage_id BETWEEN 71 AND 77 ORDER BY outage_id`);
facts.push(`ring: ${ring.map((r) => `${r.outage_number}:${r.cause}:${r.status}:${r.customers_affected}${r.restore_min ? "/" + r.restore_min + "min" : ""}`).join(" | ")}`);
const ringClocks = q1(`SELECT
  ROUND(AVG((d.arrived_ts - d.dispatched_ts)/60.0), 2) AS resp_min,
  ROUND(AVG((o.restored_ts - o.started_ts)/60.0), 2) AS restore_min
FROM dispatches d JOIN outages o ON o.outage_id = d.outage_id
WHERE o.outage_id BETWEEN 71 AND 75`);
facts.push(`ring clocks (restored 5): response ${ringClocks.resp_min} min, restore ${ringClocks.restore_min} min (want 38 / 230)`);
facts.push(`ring utility/cause uniform: ${q1(`SELECT COUNT(DISTINCT utility_id) AS u, COUNT(DISTINCT cause) AS c FROM outages WHERE outage_id BETWEEN 71 AND 77`).u}/${q1(`SELECT COUNT(DISTINCT cause) AS c FROM outages WHERE outage_id BETWEEN 71 AND 77`).c}`);

// the ceiling (utility board)
const utilCounts = qa(`SELECT u.utility_id, u.name, COUNT(o.outage_id) AS n
FROM utilities u LEFT JOIN outages o ON o.utility_id = u.utility_id
GROUP BY u.utility_id ORDER BY n DESC`);
const geUtil = qa(`SELECT utility_id, n FROM (SELECT utility_id, COUNT(*) AS n FROM outages GROUP BY utility_id) WHERE n >= 20 ORDER BY n DESC`);
const gtUtil = qa(`SELECT utility_id, n FROM (SELECT utility_id, COUNT(*) AS n FROM outages GROUP BY utility_id) WHERE n > 20`);
facts.push(`utility board: ${utilCounts.map((r) => `u${r.utility_id}:${r.n}`).join(" ")} | ceiling >= 20 = ${geUtil.length} (${geUtil.map((r) => `u${r.utility_id}:${r.n}`).join(", ")}), > 20 = ${gtUtil.length} (${gtUtil.map((r) => `u${r.utility_id}:${r.n}`).join(", ")})`);
facts.push(`substation board: ${qa(`SELECT substation_id, COUNT(*) AS n FROM outages GROUP BY substation_id ORDER BY substation_id`).map((r) => `s${r.substation_id}:${r.n}`).join(" ")} (s3 dark)`);

// the ceiling: the UTILITY outage board — Columbia Rim sits EXACTLY on 20
// (u1 = 30 above it: >= 20 = 2 utilities, > 20 = 1). Per-substation counts
// stay a plain board (the blocks are too uneven for a line wall).
const utilCeil = new Map<number, number>();
for (const o of outages) utilCeil.set(o.utilityId, (utilCeil.get(o.utilityId) ?? 0) + 1);
const ge20 = [...utilCeil.entries()].filter(([, n]) => n >= 20).sort((a, b) => b[1] - a[1]);
const gt20 = [...utilCeil.entries()].filter(([, n]) => n > 20);
assert(ge20.length === 2 && gt20.length === 1, `utility ceiling >= 20 = [${ge20}] (want 2), > 20 = [${gt20}] (want 1)`);
assert(utilCeil.get(3) === 20, `Columbia Rim = ${utilCeil.get(3)} (want EXACTLY 20)`);

// mirror tie
const tie = q1(`SELECT customers_affected AS c, GROUP_CONCAT(outage_id) AS ids, COUNT(*) AS n
FROM outages WHERE customers_affected = 4200`);
const above = qa(`SELECT COUNT(*) AS n FROM outages WHERE customers_affected > 4200`);
facts.push(`mirror tie: ${tie.n} rows at ${tie.c} = (${tie.ids}), ${above[0].n} above -> RANK 10,10 next 12; DENSE 10,11`);

// response SLA
const respWall = q1(`SELECT
  SUM(CASE WHEN arrived_ts - dispatched_ts >= 3600 THEN 1 ELSE 0 END) AS ge,
  SUM(CASE WHEN arrived_ts - dispatched_ts > 3600 THEN 1 ELSE 0 END) AS gt
FROM dispatches WHERE arrived_ts IS NOT NULL`);
const respRow = q1(`SELECT d.dispatch_id, d.outage_id, d.crew_id, d.arrived_ts - d.dispatched_ts AS resp
FROM dispatches d WHERE d.arrived_ts IS NOT NULL AND d.arrived_ts - d.dispatched_ts >= 3600`);
facts.push(`response SLA: >= 3600 = ${respWall.ge}, > 3600 = ${respWall.gt}, the row = dispatch ${respRow.dispatch_id} (outage ${respRow.outage_id}, crew ${respRow.crew_id}, ${respRow.resp}s)`);

// crews
const crewBoard = qa(`SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS total,
  SUM(CASE WHEN d.status='cleared' THEN 1 ELSE 0 END) AS cleared
FROM crews c LEFT JOIN dispatches d ON d.crew_id = c.crew_id
GROUP BY c.crew_id ORDER BY c.crew_id`);
facts.push(`crew board: ${crewBoard.map((r) => `c${r.crew_id}:${r.cleared}c/${r.total}t`).join(" ")}`);

// honest zeros
facts.push(`dark substation: s3 outages = ${q1(`SELECT COUNT(*) AS n FROM outages WHERE substation_id = 3`).n}`);
facts.push(`crew-less restorations (auto-reclose): ${q1(`SELECT COUNT(*) AS n FROM outages o WHERE o.status='restored' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)`).n}`);
facts.push(`idle/disconnected readings: m35 = ${q1(`SELECT COUNT(*) AS n FROM readings WHERE meter_id = 35`).n}, m36 = ${q1(`SELECT COUNT(*) AS n FROM readings WHERE meter_id = 36`).n}`);
facts.push(`Bluewater delinquents = ${q1(`SELECT COUNT(*) AS n FROM bills b JOIN meters m ON m.meter_id=b.meter_id JOIN substations s ON s.substation_id=m.substation_id WHERE s.utility_id = 6 AND b.status='delinquent'`).n}`);

// calendar spine
const spine = qa(`SELECT strftime('%Y-%m', started_ts, 'unixepoch') AS month, COUNT(*) AS n
FROM outages GROUP BY month ORDER BY month`);
facts.push(`outage months: ${spine.map((r) => `${r.month}:${r.n}`).join(" ")} (Feb absent)`);

// capacity tie
const cap850 = q1(`SELECT GROUP_CONCAT(plant_id) AS ids, COUNT(*) AS n FROM plants WHERE capacity_mw = 850`);
const capAbove = qa(`SELECT COUNT(*) AS n FROM plants WHERE capacity_mw > 850`);
facts.push(`capacity tie: ${cap850.n} at 850 = (${cap850.ids}), ${capAbove[0].n} above -> pair at RANK 6,6 / DENSE 6`);

// storm king + cause flip
const kingRow = q1(`SELECT outage_id, outage_number, customers_affected AS c FROM outages ORDER BY customers_affected DESC LIMIT 1`);
const totalAffected = Number(q1(`SELECT SUM(customers_affected) AS t FROM outages`).t);
const kingShare = Math.round((Number(kingRow.c) / totalAffected) * 10000) / 100;
const causeBoard = qa(`SELECT cause, SUM(customers_affected) AS amt FROM outages GROUP BY cause ORDER BY amt DESC`);
const causeBoardEx = qa(`SELECT cause, SUM(customers_affected) AS amt FROM outages WHERE outage_id <> ${kingRow.outage_id} GROUP BY cause ORDER BY amt DESC`);
facts.push(`storm king: ${kingRow.outage_number} = ${kingRow.c} = ${kingShare}% of ${totalAffected} affected-moments`);
facts.push(`cause board: ${causeBoard.map((r) => `${r.cause}:${r.amt}`).join(" | ")}`);
facts.push(`cause board EX-KING: ${causeBoardEx.map((r) => `${r.cause}:${r.amt}`).join(" | ")} (flip: equipment leads)`);

// census
const census = qa(`SELECT 'utilities' AS t, COUNT(*) AS n FROM utilities UNION ALL
SELECT 'plants', COUNT(*) FROM plants UNION ALL SELECT 'substations', COUNT(*) FROM substations UNION ALL
SELECT 'meters', COUNT(*) FROM meters UNION ALL SELECT 'readings', COUNT(*) FROM readings UNION ALL
SELECT 'outages', COUNT(*) FROM outages UNION ALL SELECT 'crews', COUNT(*) FROM crews UNION ALL
SELECT 'dispatches', COUNT(*) FROM dispatches UNION ALL SELECT 'bills', COUNT(*) FROM bills`);
facts.push(`census: ${census.map((r) => `${r.t}=${r.n}`).join(" ")}`);
const actives = qa(`SELECT outage_id, outage_number FROM outages WHERE status='active' ORDER BY outage_id`);
facts.push(`active outages: ${actives.map((r) => r.outage_number).join(", ")}`);

console.log(facts.join("\n"));
writeFileSync("/home/z/my-project/scripts/r23-facts.txt", facts.join("\n") + "\n");
console.log(`\nseed sql bytes = ${seedSql.length}, readings = ${readings.length}, dispatches = ${dispatches.length}, bills = ${bills.length}`);
