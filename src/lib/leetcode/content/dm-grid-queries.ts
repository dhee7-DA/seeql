// Domain Mastery — Energy & Grid Ops · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in
// dm-grid-seed.ts. Statements cite only probe-verified facts
// (scripts/r23-grid-world.ts). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_GRID_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "National Grid",
    title: "Restored count",
    statement:
      "The outage board mixes restored and active rows. Count how many outages have status 'restored'. Output a single column restored_count with one row.",
    code: `SELECT COUNT(*) AS restored_count
FROM outages
WHERE status = 'restored';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "The burning board",
    statement:
      "Control room starts with what is still down. List the active outages: outage_id, outage_number, substation_id, customers_affected, ordered by outage_id ascending. Five rows are still burning — one of them has been dark since late May with no crew assigned.",
    code: `SELECT outage_id, outage_number, substation_id, customers_affected
FROM outages
WHERE status = 'active'
ORDER BY outage_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Cause vocabulary",
    statement:
      "List every distinct cause in the outages table, one per row, ordered alphabetically. Single column: cause.",
    code: `SELECT DISTINCT cause
FROM outages
ORDER BY cause ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "Outage status census",
    statement:
      "Count the outages per status. Output status and outage_count, ordered by outage_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS outage_count
FROM outages
GROUP BY status
ORDER BY outage_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "Interconnection roster",
    statement:
      "List the full utility roster: utility_id, name, code, hq_city, founded, ordered by utility_id ascending. Two of these six are the pack's home utilities.",
    code: `SELECT utility_id, name, code, hq_city, founded
FROM utilities
ORDER BY utility_id ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "Outages per utility",
    statement:
      "Count the outages per utility. Output utility_id and outage_count, ordered by outage_count descending, then utility_id ascending. One utility sits EXACTLY on 20.",
    code: `SELECT utility_id, COUNT(*) AS outage_count
FROM outages
GROUP BY utility_id
ORDER BY outage_count DESC, utility_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "National Grid",
    title: "Crew directory",
    statement:
      "List the crews: crew_id, name, utility_id, depot, specialty, ordered by crew_id ascending. One of the eight has never been dispatched.",
    code: `SELECT crew_id, name, utility_id, depot, specialty
FROM crews
ORDER BY crew_id ASC;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "Fleet mix",
    statement:
      "Count the plants per fuel. Output fuel and plant_count, ordered by plant_count descending, then fuel ascending.",
    code: `SELECT fuel, COUNT(*) AS plant_count
FROM plants
GROUP BY fuel
ORDER BY plant_count DESC, fuel ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Billing status census",
    statement:
      "Count the bills per status. Output status and bill_count, ordered by bill_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS bill_count
FROM bills
GROUP BY status
ORDER BY bill_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "Tariff mix",
    statement:
      "Count the meters per tariff. Output tariff and meter_count, ordered by meter_count descending, then tariff ascending.",
    code: `SELECT tariff, COUNT(*) AS meter_count
FROM meters
GROUP BY tariff
ORDER BY meter_count DESC, tariff ASC;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "Momentary census",
    statement:
      "Regulators count a momentary as any restoration lasting at most 300 seconds. Among restored outages, count the ones with restored_ts minus started_ts <= 300. One column: momentary_count. Two of them sit EXACTLY on the line.",
    code: `SELECT COUNT(*) AS momentary_count
FROM outages
WHERE status = 'restored'
  AND restored_ts - started_ts <= 300;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "The Aurora sighting",
    statement:
      "The largest account in the ledger needs its papers pulled. List meter 1's bills: bill_id, period, kwh_billed, rate_cents, amount_cents, ordered by bill_id ascending.",
    code: `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents
FROM bills
WHERE meter_id = 1
ORDER BY bill_id ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "National Grid",
    title: "Generation fleet",
    statement:
      "List the plants: plant_id, name, fuel, capacity_mw, commissioned, ordered by plant_id ascending. Two of them tie at exactly 850 MW.",
    code: `SELECT plant_id, name, fuel, capacity_mw, commissioned
FROM plants
ORDER BY plant_id ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "Cause census",
    statement:
      "Count the outages per cause. Output cause and outage_count, ordered by outage_count descending, then cause ascending.",
    code: `SELECT cause, COUNT(*) AS outage_count
FROM outages
GROUP BY cause
ORDER BY outage_count DESC, cause ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Substation directory",
    statement:
      "List the substations: substation_id, name, utility_id, region, voltage_kv, customers_served, ordered by substation_id ascending. One of the twelve has never gone dark.",
    code: `SELECT substation_id, name, utility_id, region, voltage_kv, customers_served
FROM substations
ORDER BY substation_id ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "Telemetry whale count",
    statement:
      "Count meter 1's readings. One column: reading_count. The smelter's telemetry is the deepest single-meter trail in the pack.",
    code: `SELECT COUNT(*) AS reading_count
FROM readings
WHERE meter_id = 1;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "Dispatch census",
    statement:
      "Count the dispatches per status. Output status and dispatch_count, ordered by dispatch_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS dispatch_count
FROM dispatches
GROUP BY status
ORDER BY dispatch_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "The live period",
    statement:
      "List the '2026-06' bills: bill_id, meter_id, kwh_billed, amount_cents, status, ordered by bill_id ascending. The newest period is mostly still open.",
    code: `SELECT bill_id, meter_id, kwh_billed, amount_cents, status
FROM bills
WHERE period = '2026-06'
ORDER BY bill_id ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "National Grid",
    title: "Customers behind the grid",
    statement:
      "Sum customers_served across all substations. One column: total_served, one row. Every SAIFI-style ratio in the pack divides by this kind of number.",
    code: `SELECT SUM(customers_served) AS total_served
FROM substations;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "The ring window",
    statement:
      "One March night carved a contiguous block into the outage register. List the outages with outage_number BETWEEN 'OUT-2471' AND 'OUT-2477': outage_id, outage_number, cause, status, ordered by outage_id ascending.",
    code: `SELECT outage_id, outage_number, cause, status
FROM outages
WHERE outage_number BETWEEN 'OUT-2471' AND 'OUT-2477'
ORDER BY outage_id ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "The cause board",
    statement:
      "Sum customers_affected per cause. Output cause and affected_total, ordered by affected_total descending, then cause ascending. Storm leads — but look at what carries it.",
    code: `SELECT cause, SUM(customers_affected) AS affected_total
FROM outages
GROUP BY cause
ORDER BY affected_total DESC, cause ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The whale dossier",
    statement:
      "Meter 1 (Aurora Alloys) dominates the ledger. Output a single row: whale_billed (meter 1's total amount_cents), ledger_billed (all bills), and whale_share (whale_billed as a percent of ledger_billed, rounded to 1 dp). The share lands at 58.1.",
    code: `SELECT
  SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS whale_billed,
  SUM(amount_cents) AS ledger_billed,
  ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS whale_share
FROM bills;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "The tariff flip",
    statement:
      "Sum billed amounts per tariff, EXCLUDING meter 1. Output tariff and billed_total, ordered by billed_total descending, then tariff ascending. Take the whale away and the crown moves to commercial.",
    code: `SELECT m.tariff, SUM(b.amount_cents) AS billed_total
FROM bills b
JOIN meters m ON m.meter_id = b.meter_id
WHERE b.meter_id <> 1
GROUP BY m.tariff
ORDER BY billed_total DESC, m.tariff ASC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "The 5-minute wall",
    statement:
      "Among restored outages, count momentaries both ways: duration <= 300 seconds (the inclusive regulatory edge) and duration < 300 (strict). Output momentary_incl and momentary_strict in one row. The two outages sitting EXACTLY on 300 are the whole difference.",
    code: `SELECT
  SUM(CASE WHEN restored_ts - started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_incl,
  SUM(CASE WHEN restored_ts - started_ts < 300 THEN 1 ELSE 0 END) AS momentary_strict
FROM outages
WHERE status = 'restored';`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "National Grid",
    title: "The flicker registry",
    statement:
      "A flicker is two outages on the same substation starting within 240 seconds. Self-join outages on substation_id where the second starts after the first and the gap is <= 240s. Output first_outage_id, second_outage_id, gap_seconds, ordered by gap_seconds then first_outage_id. Two pairs qualify — one of them EXACTLY on the 240 line.",
    code: `SELECT a.outage_id AS first_outage_id, b.outage_id AS second_outage_id,
  b.started_ts - a.started_ts AS gap_seconds
FROM outages a
JOIN outages b ON b.substation_id = a.substation_id
  AND b.started_ts > a.started_ts
WHERE b.started_ts - a.started_ts <= 240
ORDER BY gap_seconds ASC, first_outage_id ASC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "The crew board",
    statement:
      "Count CLEARED dispatches per crew, keeping every crew on the board even those with zero. Output crew_id, name, cleared_count, ordered by cleared_count descending, then crew_id ascending. One crew cleared EXACTLY 20; one cleared nothing at all.",
    code: `SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS cleared_count
FROM crews c
LEFT JOIN dispatches d ON d.crew_id = c.crew_id AND d.status = 'cleared'
GROUP BY c.crew_id, c.name
ORDER BY cleared_count DESC, c.crew_id ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "The response clock",
    statement:
      "Response time is arrived_ts minus dispatched_ts in seconds. List every dispatch with response >= 2700 seconds: dispatch_id, outage_id, crew_id, response, ordered by response descending, then dispatch_id ascending. One row sits at exactly 3600.",
    code: `SELECT dispatch_id, outage_id, crew_id,
  arrived_ts - dispatched_ts AS response
FROM dispatches
WHERE arrived_ts IS NOT NULL
  AND arrived_ts - dispatched_ts >= 2700
ORDER BY response DESC, dispatch_id ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The SLA line",
    statement:
      "The response SLA is 3600 seconds. Count dispatches with response >= 3600 and response > 3600 in one row: sla_incl, sla_strict. The boundary row makes the two columns disagree.",
    code: `SELECT
  SUM(CASE WHEN arrived_ts - dispatched_ts >= 3600 THEN 1 ELSE 0 END) AS sla_incl,
  SUM(CASE WHEN arrived_ts - dispatched_ts > 3600 THEN 1 ELSE 0 END) AS sla_strict
FROM dispatches
WHERE arrived_ts IS NOT NULL;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "Telemetry sessions, strict",
    statement:
      "Sessionize meter 1's June telemetry: a gap STRICTLY greater than 1800 seconds between consecutive readings starts a new session. Count the sessions. One column: session_count. The one 1800-second gap does NOT split under this rule.",
    code: `SELECT COUNT(*) AS session_count
FROM (
  SELECT read_ts,
    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts
  FROM readings
  WHERE meter_id = 1
)
WHERE prev_ts IS NULL OR read_ts - prev_ts > 1800;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "Telemetry sessions, inclusive",
    statement:
      "Same telemetry, same meter, but now a gap of 1800 seconds or more starts a new session. Count the sessions. One column: session_count. The boundary gap now splits — the answer moves by exactly one.",
    code: `SELECT COUNT(*) AS session_count
FROM (
  SELECT read_ts,
    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts
  FROM readings
  WHERE meter_id = 1
)
WHERE prev_ts IS NULL OR read_ts - prev_ts >= 1800;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "National Grid",
    title: "The disconnect ladder",
    statement:
      "Field ops disconnects a meter when its unpaid balance (issued + delinquent bills) reaches 500000 cents. List every meter with balance >= 500000: meter_id and balance, ordered by balance descending, then meter_id ascending. Two meters sit EXACTLY on the line.",
    code: `SELECT meter_id, SUM(amount_cents) AS balance
FROM bills
WHERE status <> 'paid'
GROUP BY meter_id
HAVING SUM(amount_cents) >= 500000
ORDER BY balance DESC, meter_id ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "Over the line",
    statement:
      "Same ladder, strict edge: list the meters whose unpaid balance is strictly greater than 500000 cents. Output meter_id and balance, ordered by balance descending. Exactly one meter qualifies — the rest of the ladder sits ON the line.",
    code: `SELECT meter_id, SUM(amount_cents) AS balance
FROM bills
WHERE status <> 'paid'
GROUP BY meter_id
HAVING SUM(amount_cents) > 500000
ORDER BY balance DESC, meter_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "The forgotten ones",
    statement:
      "Audit the dispatch desk: find ACTIVE outages with no dispatch row at all. Output outage_id, outage_number, started_ts, customers_affected, ordered by outage_id ascending. NOT EXISTS is the honest tool here — one of these has been burning since May 28.",
    code: `SELECT o.outage_id, o.outage_number, o.started_ts, o.customers_affected
FROM outages o
WHERE o.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)
ORDER BY o.outage_id ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The rate drift trio",
    statement:
      "Bills carry the rate snapshot taken at issuance; meters hold today's rate. Join bills to meters and list every bill whose rate_cents differs from the meter's: bill_id, meter_id, period, bill_rate, meter_rate, status, ordered by bill_id ascending. Three rows drift — one of them was PAID at the stale rate.",
    code: `SELECT b.bill_id, b.meter_id, b.period,
  b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status
FROM bills b
JOIN meters m ON m.meter_id = b.meter_id
WHERE b.rate_cents <> m.rate_cents
ORDER BY b.bill_id ASC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "Ring clocks",
    statement:
      "The storm ring's five restored outages (ids 71-75) each carry a dispatch. Output one row: response_min (average arrived-dispatched in minutes) and restore_min (average restored-started in minutes), both rounded to 0 dp. They land on EXACTLY 38 and 230.",
    code: `SELECT
  ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 0) AS response_min,
  ROUND(AVG(o.restored_ts - o.started_ts) / 60.0, 0) AS restore_min
FROM dispatches d
JOIN outages o ON o.outage_id = d.outage_id
WHERE o.outage_id BETWEEN 71 AND 75;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "The ring registry",
    statement:
      "Prove the ring is contiguous: concatenate the ring's outage numbers (ids 71-77) in outage_id order, comma-separated. One column: ring_registry, one row. Contiguity you can print.",
    code: `SELECT GROUP_CONCAT(outage_number) AS ring_registry
FROM (
  SELECT outage_number FROM outages
  WHERE outage_id BETWEEN 71 AND 77
  ORDER BY outage_id
);`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "National Grid",
    title: "The 20-outage ceiling",
    statement:
      "Count outages per utility. Then count the utilities with 20 or more outages and the utilities with strictly more than 20. Output one row: ge_20, gt_20. Columbia Rim sits EXACTLY on the line, so the two counts disagree.",
    code: `SELECT
  SUM(CASE WHEN n >= 20 THEN 1 ELSE 0 END) AS ge_20,
  SUM(CASE WHEN n > 20 THEN 1 ELSE 0 END) AS gt_20
FROM (SELECT utility_id, COUNT(*) AS n FROM outages GROUP BY utility_id);`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "The calendar spine",
    statement:
      "Build the 2026 outage calendar: one row per month from January through June with its outage count (months CTE via VALUES, LEFT JOINed). Output month and outage_count, ordered by month ascending. February's row must appear with 0 — the spine keeps honest months visible.",
    code: `WITH months(m) AS (
  VALUES ('2026-01'), ('2026-02'), ('2026-03'),
         ('2026-04'), ('2026-05'), ('2026-06')
)
SELECT mo.m AS month, COUNT(o.outage_id) AS outage_count
FROM months mo
LEFT JOIN outages o
  ON strftime('%Y-%m', o.started_ts, 'unixepoch') = mo.m
GROUP BY mo.m
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "The capacity tie registry",
    statement:
      "Two plants tie at exactly 850 MW. Output a single row: tie_capacity, plant_registry (their plant ids concatenated in ascending order, comma-separated), and above_count (how many plants exceed 850 MW).",
    code: `SELECT
  850 AS tie_capacity,
  (SELECT GROUP_CONCAT(plant_id) FROM (SELECT plant_id FROM plants WHERE capacity_mw = 850 ORDER BY plant_id)) AS plant_registry,
  (SELECT COUNT(*) FROM plants WHERE capacity_mw > 850) AS above_count;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The storm king",
    statement:
      "One outage dwarfs the rest. Output a single row: king_number (its outage_number), king_affected (its customers_affected), total_affected (the sum over all outages), king_share (the king as a percent of the total, rounded to 2 dp). The share lands at 30.61.",
    code: `SELECT
  (SELECT outage_number FROM outages ORDER BY customers_affected DESC LIMIT 1) AS king_number,
  (SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) AS king_affected,
  SUM(customers_affected) AS total_affected,
  ROUND((SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) * 100.0 / SUM(customers_affected), 2) AS king_share
FROM outages;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "The mirror tie, ranked",
    statement:
      "Rank every outage with at least 4200 customers affected by customers_affected descending (RANK and DENSE_RANK side by side). Output outage_id, customers_affected, rk, dense_rk, ordered by customers_affected DESC, then outage_id ASC. The 4200 pair prints rank 10,10 — and DENSE_RANK says 10,11.",
    code: `SELECT outage_id, customers_affected,
  RANK() OVER (ORDER BY customers_affected DESC) AS rk,
  DENSE_RANK() OVER (ORDER BY customers_affected DESC) AS dense_rk
FROM outages
WHERE customers_affected >= 4200
ORDER BY customers_affected DESC, outage_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "The cause flip dossier",
    statement:
      "The storm king (OUT-2405) carries storm's whole lead. Output one row: storm_total, storm_ex_king (storm's total excluding outage 5), equipment_total, and flip_leader (the cause that leads once the king is excluded). The flip lands on 'equipment'.",
    code: `SELECT
  SUM(CASE WHEN cause = 'storm' THEN customers_affected ELSE 0 END) AS storm_total,
  SUM(CASE WHEN cause = 'storm' AND outage_id <> 5 THEN customers_affected ELSE 0 END) AS storm_ex_king,
  SUM(CASE WHEN cause = 'equipment' THEN customers_affected ELSE 0 END) AS equipment_total,
  (SELECT cause FROM outages WHERE outage_id <> 5
   GROUP BY cause ORDER BY SUM(customers_affected) DESC LIMIT 1) AS flip_leader
FROM outages;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "National Grid",
    title: "The sessionization wall row",
    statement:
      "Meter 1's June telemetry in one row: reading_count (its total readings), boundary_gaps (gaps of EXACTLY 1800s between consecutive readings), sessions_strict (gap > 1800 splits), sessions_incl (gap >= 1800 splits). The row prints 100, 1, 7, 8.",
    code: `WITH gaps AS (
  SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap
  FROM readings
  WHERE meter_id = 1
)
SELECT
  (SELECT COUNT(*) FROM readings WHERE meter_id = 1) AS reading_count,
  (SELECT COUNT(*) FROM gaps WHERE gap = 1800) AS boundary_gaps,
  1 + (SELECT COUNT(*) FROM gaps WHERE gap > 1800) AS sessions_strict,
  1 + (SELECT COUNT(*) FROM gaps WHERE gap >= 1800) AS sessions_incl;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "The foreman dossier",
    statement:
      "For every crew that cleared at least 10 dispatches, output crew_id, name, cleared_count, and avg_response_min (average arrived-dispatched over its CLEARED dispatches, in minutes, rounded to 1 dp), ordered by cleared_count descending, then crew_id ascending. Mara Quinn's 20 clearances anchor the top.",
    code: `SELECT c.crew_id, c.name, COUNT(*) AS cleared_count,
  ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_response_min
FROM dispatches d
JOIN crews c ON c.crew_id = d.crew_id
WHERE d.status = 'cleared'
GROUP BY c.crew_id, c.name
HAVING COUNT(*) >= 10
ORDER BY cleared_count DESC, c.crew_id ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "Interruption intensity",
    statement:
      "Intensity is affected-customer moments per 1000 customers served. Join outages to utilities, with a correlated subquery for the served base (SUM of customers_served per utility). Output utility_id, code, outage_count, affected_total, intensity (affected_total * 1000.0 / served_base, rounded to 2 dp), ordered by intensity descending. Columbia Rim tops the board at 82.64 with HALF of Cascadia's outage count — intensity is not volume.",
    code: `SELECT u.utility_id, u.code,
  COUNT(o.outage_id) AS outage_count,
  SUM(o.customers_affected) AS affected_total,
  ROUND(SUM(o.customers_affected) * 1000.0 /
    (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id), 2) AS intensity
FROM utilities u
LEFT JOIN outages o ON o.utility_id = u.utility_id
GROUP BY u.utility_id, u.code
ORDER BY intensity DESC;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "The whale end-to-end",
    statement:
      "Aurora Alloys in one row: bill_count, kwh_total, amount_total, avg_rate (average of its bills' rate_cents, 0 dp), and ledger_share (amount_total as a percent of ALL bills, 1 dp). Prints 3, 1800000, 14400000, 8, 58.1.",
    code: `SELECT
  COUNT(*) AS bill_count,
  SUM(kwh_billed) AS kwh_total,
  SUM(amount_cents) AS amount_total,
  ROUND(AVG(rate_cents), 0) AS avg_rate,
  ROUND(SUM(amount_cents) * 100.0 / (SELECT SUM(amount_cents) FROM bills), 1) AS ledger_share
FROM bills
WHERE meter_id = 1;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "The boundary gap, isolated",
    statement:
      "Find the one pair of consecutive meter-1 readings whose gap is EXACTLY 1800 seconds. Output meter_id, prev_ts (the earlier read_ts), next_ts, and the gap itself, one row. This row is the whole strict-vs-inclusive session story.",
    code: `SELECT meter_id, prev_ts, read_ts AS next_ts, read_ts - prev_ts AS gap_seconds
FROM (
  SELECT meter_id, read_ts,
    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts
  FROM readings
  WHERE meter_id = 1
)
WHERE read_ts - prev_ts = 1800;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "Auto-reclose audit",
    statement:
      "Some restorations needed no crew: restored outages with NO dispatch row are the automation's work. List them: outage_id, outage_number, duration (restored-started), ordered by duration ascending, then outage_id. Seven rows — every one a momentary, two EXACTLY on the 300 line.",
    code: `SELECT o.outage_id, o.outage_number,
  o.restored_ts - o.started_ts AS duration
FROM outages o
WHERE o.status = 'restored'
  AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)
ORDER BY duration ASC, o.outage_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "National Grid",
    title: "The money ladder",
    statement:
      "The ledger in one row: billed (all bills), collected (status 'paid'), outstanding (issued + delinquent), outstanding_share (outstanding as a percent of billed, 2 dp). Prints 24783750, 19946936, 4836814, 19.52.",
    code: `SELECT
  SUM(amount_cents) AS billed,
  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS collected,
  SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) AS outstanding,
  ROUND(SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 2) AS outstanding_share
FROM bills;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "The billing curve",
    statement:
      "Per billing period: period, period_billed, and running_billed (cumulative across periods in period order). Output ordered by period ascending. The curve ends at the full ledger, 24783750.",
    code: `SELECT period,
  SUM(amount_cents) AS period_billed,
  SUM(SUM(amount_cents)) OVER (ORDER BY period) AS running_billed
FROM bills
GROUP BY period
ORDER BY period ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "The substation grid board",
    statement:
      "Every substation with its outage_count and momentary_count (durations <= 300s among restored rows), including the ones with zero outages. Output substation_id, name, outage_count, momentary_count, ordered by substation_id ascending. Cedar's row must read 0, 0 — the honest zero the LEFT JOIN keeps.",
    code: `SELECT s.substation_id, s.name,
  COUNT(o.outage_id) AS outage_count,
  SUM(CASE WHEN o.status = 'restored' AND o.restored_ts - o.started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_count
FROM substations s
LEFT JOIN outages o ON o.substation_id = s.substation_id
GROUP BY s.substation_id, s.name
ORDER BY s.substation_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "The 4200 registry",
    statement:
      "The mirror tie in one row: tie_value (the shared customers_affected), tied_registry (the tied outage ids concatenated in ascending order, comma-separated), above_count (outages strictly above the tie), and rank_position (the RANK the pair shares). Prints 4200, '62,79', 9, 10.",
    code: `SELECT
  4200 AS tie_value,
  (SELECT GROUP_CONCAT(outage_id) FROM (SELECT outage_id FROM outages WHERE customers_affected = 4200 ORDER BY outage_id)) AS tied_registry,
  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) AS above_count,
  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) + 1 AS rank_position;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "The ex-whale spine",
    statement:
      "Per tariff: tariff, billed_total, ex_whale_total (excluding meter 1), and delta (billed_total minus ex_whale_total), ordered by delta DESC, then tariff ASC. Industrial's delta IS the whale — 14400000 — and commercial's delta is a quiet 0.",
    code: `SELECT m.tariff,
  SUM(b.amount_cents) AS billed_total,
  SUM(CASE WHEN b.meter_id = 1 THEN 0 ELSE b.amount_cents END) AS ex_whale_total,
  SUM(CASE WHEN b.meter_id = 1 THEN b.amount_cents ELSE 0 END) AS delta
FROM bills b
JOIN meters m ON m.meter_id = b.meter_id
GROUP BY m.tariff
ORDER BY delta DESC, m.tariff ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "Duration buckets",
    statement:
      "Bucket every restored outage by duration in seconds: '<300' (strictly), '300-3600' (inclusive of 300), '3600-7200' (inclusive of 3600), and '>7200'. Output bucket and outage_count, ordered by bucket ascending. The boundary rows decide which buckets grow.",
    code: `SELECT
  CASE
    WHEN restored_ts - started_ts < 300 THEN '<300'
    WHEN restored_ts - started_ts <= 3600 THEN '300-3600'
    WHEN restored_ts - started_ts <= 7200 THEN '3600-7200'
    ELSE '>7200'
  END AS bucket,
  COUNT(*) AS outage_count
FROM outages
WHERE status = 'restored'
GROUP BY bucket
ORDER BY bucket ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "National Grid",
    title: "Crew utilization",
    statement:
      "Every crew with total dispatches, cleared count, live count (onsite + enroute), and avg_response_min over its arrived dispatches (rounded to 1 dp) — including the dark crew. Output crew_id, name, total_dispatches, cleared_count, live_count, avg_response_min, ordered by total_dispatches DESC, then crew_id ASC. Crew 8's zero row must survive the LEFT JOIN.",
    code: `SELECT c.crew_id, c.name,
  COUNT(d.dispatch_id) AS total_dispatches,
  SUM(CASE WHEN d.status = 'cleared' THEN 1 ELSE 0 END) AS cleared_count,
  SUM(CASE WHEN d.status IN ('onsite', 'enroute') THEN 1 ELSE 0 END) AS live_count,
  ROUND(AVG(CASE WHEN d.arrived_ts IS NOT NULL THEN d.arrived_ts - d.dispatched_ts END) / 60.0, 1) AS avg_response_min
FROM crews c
LEFT JOIN dispatches d ON d.crew_id = c.crew_id
GROUP BY c.crew_id, c.name
ORDER BY total_dispatches DESC, c.crew_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "The king's neighborhood",
    statement:
      "The storm king hit Alder (substation 1) in January. List every substation-1 outage that started within 86400 seconds (before or after) of the king's start: outage_id, outage_number, started_ts, customers_affected, ordered by started_ts ascending. The king anchors its own storm window.",
    code: `WITH king AS (
  SELECT started_ts FROM outages WHERE outage_id = 5
)
SELECT o.outage_id, o.outage_number, o.started_ts, o.customers_affected
FROM outages o, king
WHERE o.substation_id = 1
  AND o.started_ts BETWEEN king.started_ts - 86400 AND king.started_ts + 86400
ORDER BY o.started_ts ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "The open clock wall",
    statement:
      "Two dispatches fail the clean-clock audit: one arrives EXACTLY on the 3600s SLA line, one never arrived (arrived_ts NULL). List every dispatch where response >= 3600 OR arrived_ts IS NULL: dispatch_id, outage_id, crew_id, status, response (NULL prints for the enroute row), ordered by dispatch_id ascending.",
    code: `SELECT dispatch_id, outage_id, crew_id, status,
  CASE WHEN arrived_ts IS NULL THEN NULL
       ELSE arrived_ts - dispatched_ts END AS response
FROM dispatches
WHERE (arrived_ts IS NOT NULL AND arrived_ts - dispatched_ts >= 3600)
   OR arrived_ts IS NULL
ORDER BY dispatch_id ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "The whale per period",
    statement:
      "Per billing period: period, period_billed (all meters), aurora_billed (meter 1), and aurora_share (meter 1's percent of the period, 1 dp), ordered by period ascending. The flat 4800000 whale meets a shrinking period, so the share climbs 56.1 -> 58.4 -> 59.8.",
    code: `SELECT period,
  SUM(amount_cents) AS period_billed,
  SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS aurora_billed,
  ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS aurora_share
FROM bills
GROUP BY period
ORDER BY period ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "The ring dossier",
    statement:
      "The storm ring in one row: ring_size (its outages), restored_count, active_count, response_avg_min (over the restored five's dispatches, 0 dp), restore_avg_min (0 dp), affected_total (all seven). Prints 7, 5, 2, 38, 230, 16500.",
    code: `SELECT
  COUNT(*) AS ring_size,
  SUM(CASE WHEN status = 'restored' THEN 1 ELSE 0 END) AS restored_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
  (SELECT ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 0) FROM dispatches d WHERE d.outage_id BETWEEN 71 AND 75) AS response_avg_min,
  (SELECT ROUND(AVG(o.restored_ts - o.started_ts) / 60.0, 0) FROM outages o WHERE o.outage_id BETWEEN 71 AND 75) AS restore_avg_min,
  SUM(customers_affected) AS affected_total
FROM outages
WHERE outage_id BETWEEN 71 AND 77;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "The executive memo",
    statement:
      "The whole pack in one row: ledger_billed (24783750), whale_share (58.1), momentary_incl (7), on_line_count (restorations of EXACTLY 300s), forgotten_outage (the active outage id with no dispatch — 44), and king_affected (62000). Six probes, one memo.",
    code: `SELECT
  (SELECT SUM(amount_cents) FROM bills) AS ledger_billed,
  (SELECT ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) FROM bills) AS whale_share,
  (SELECT COUNT(*) FROM outages WHERE status = 'restored' AND restored_ts - started_ts <= 300) AS momentary_incl,
  (SELECT COUNT(*) FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 300) AS on_line_count,
  (SELECT MIN(o.outage_id) FROM outages o WHERE o.status = 'active'
     AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)) AS forgotten_outage,
  (SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) AS king_affected;`,
    order: "exact",
  },
];
