// Domain Mastery — Energy & Grid Ops · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r23-grid-world.ts).
import type { DmCase } from "../domain-packs";

export const DM_GRID_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "National Grid",
    title: "Board health check",
    scenario:
      "Monday control-room standup opens with the outage book: how much has been restored, and how does the board split?",
    steps: [
      { prompt: "Count restored outages (status 'restored'). One column: restored_count.", code: `SELECT COUNT(*) AS restored_count\nFROM outages\nWHERE status = 'restored';`, order: "exact" },
      { prompt: "Count outages per status. Output status and outage_count, ordered by outage_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS outage_count\nFROM outages\nGROUP BY status\nORDER BY outage_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "The burning five",
    scenario:
      "The morning shift wants the live files: what is still dark, and how do the live rows land across utilities?",
    steps: [
      { prompt: "List active outages: outage_id, outage_number, substation_id, customers_affected, ordered by outage_id ascending.", code: `SELECT outage_id, outage_number, substation_id, customers_affected\nFROM outages\nWHERE status = 'active'\nORDER BY outage_id ASC;`, order: "exact" },
      { prompt: "Count active outages per utility. Output utility_id and active_count, ordered by active_count descending, then utility_id ascending.", code: `SELECT utility_id, COUNT(*) AS active_count\nFROM outages\nWHERE status = 'active'\nGROUP BY utility_id\nORDER BY active_count DESC, utility_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Cause map",
    scenario:
      "The reliability team refreshes the cause vocabulary before the quarterly report.",
    steps: [
      { prompt: "List every distinct cause, ordered alphabetically. Single column: cause.", code: `SELECT DISTINCT cause\nFROM outages\nORDER BY cause ASC;`, order: "exact" },
      { prompt: "Count outages per cause. Output cause and outage_count, ordered by outage_count descending, then cause ascending.", code: `SELECT cause, COUNT(*) AS outage_count\nFROM outages\nGROUP BY cause\nORDER BY outage_count DESC, cause ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "Interconnection map",
    scenario:
      "New analysts get the who's-who: the six utilities, and where the outages pile up.",
    steps: [
      { prompt: "List the utilities: utility_id, name, code, hq_city, ordered by utility_id ascending.", code: `SELECT utility_id, name, code, hq_city\nFROM utilities\nORDER BY utility_id ASC;`, order: "exact" },
      { prompt: "Count outages per utility. Output utility_id and outage_count, ordered by outage_count descending, then utility_id ascending.", code: `SELECT utility_id, COUNT(*) AS outage_count\nFROM outages\nGROUP BY utility_id\nORDER BY outage_count DESC, utility_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "Fleet shelf",
    scenario:
      "Generation planning asks for the fuel mix and where capacity concentrates.",
    steps: [
      { prompt: "Count plants per fuel. Output fuel and plant_count, ordered by plant_count descending, then fuel ascending.", code: `SELECT fuel, COUNT(*) AS plant_count\nFROM plants\nGROUP BY fuel\nORDER BY plant_count DESC, fuel ASC;`, order: "exact" },
      { prompt: "Compute the average capacity per fuel, rounded to 0 dp. Output fuel and avg_capacity, ordered by avg_capacity descending, then fuel ascending.", code: `SELECT fuel, ROUND(AVG(capacity_mw), 0) AS avg_capacity\nFROM plants\nGROUP BY fuel\nORDER BY avg_capacity DESC, fuel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "Crew bench",
    scenario:
      "The operations chief wants the bench picture: who is on it, and who has been sent out.",
    steps: [
      { prompt: "List the crews: crew_id, name, utility_id, depot, specialty, ordered by crew_id ascending.", code: `SELECT crew_id, name, utility_id, depot, specialty\nFROM crews\nORDER BY crew_id ASC;`, order: "exact" },
      { prompt: "Count dispatches per crew, including crews with zero. Output crew_id and dispatch_count, ordered by dispatch_count descending, then crew_id ascending.", code: `SELECT c.crew_id, COUNT(d.dispatch_id) AS dispatch_count\nFROM crews c\nLEFT JOIN dispatches d ON d.crew_id = c.crew_id\nGROUP BY c.crew_id\nORDER BY dispatch_count DESC, c.crew_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "National Grid",
    title: "Meter mix",
    scenario:
      "Metering services asks how the book splits by tariff and how many meters are live.",
    steps: [
      { prompt: "Count meters per tariff. Output tariff and meter_count, ordered by meter_count descending, then tariff ascending.", code: `SELECT tariff, COUNT(*) AS meter_count\nFROM meters\nGROUP BY tariff\nORDER BY meter_count DESC, tariff ASC;`, order: "exact" },
      { prompt: "Count meters per status. Output status and meter_count, ordered by meter_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS meter_count\nFROM meters\nGROUP BY status\nORDER BY meter_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "The whale sighting",
    scenario:
      "The largest account in the ledger needs its papers pulled.",
    steps: [
      { prompt: "List meter 1's bills: bill_id, period, kwh_billed, rate_cents, amount_cents, ordered by bill_id ascending.", code: `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents\nFROM bills\nWHERE meter_id = 1\nORDER BY bill_id ASC;`, order: "exact" },
      { prompt: "List meter 1's header from the meters table: meter_id, customer_name, tariff, rate_cents, status. One row.", code: `SELECT meter_id, customer_name, tariff, rate_cents, status\nFROM meters\nWHERE meter_id = 1;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Capacity board",
    scenario:
      "The fleet review opens with the big units and how far the tail stretches.",
    steps: [
      { prompt: "List the plants by capacity: plant_id, name, fuel, capacity_mw, ordered by capacity_mw descending, then plant_id ascending.", code: `SELECT plant_id, name, fuel, capacity_mw\nFROM plants\nORDER BY capacity_mw DESC, plant_id ASC;`, order: "exact" },
      { prompt: "Count plants with capacity_mw strictly above 850. One column: above_count.", code: `SELECT COUNT(*) AS above_count\nFROM plants\nWHERE capacity_mw > 850;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "Voltage ladder",
    scenario:
      "Asset management walks the voltage classes before the substation audit.",
    steps: [
      { prompt: "List every distinct voltage_kv, ordered descending. Single column: voltage_kv.", code: `SELECT DISTINCT voltage_kv\nFROM substations\nORDER BY voltage_kv DESC;`, order: "exact" },
      { prompt: "Count substations per voltage_kv. Output voltage_kv and sub_count, ordered by voltage_kv descending.", code: `SELECT voltage_kv, COUNT(*) AS sub_count\nFROM substations\nGROUP BY voltage_kv\nORDER BY voltage_kv DESC;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "Momentary census",
    scenario:
      "The regulator's momentary report is due: both edges of the 300-second line, side by side.",
    steps: [
      { prompt: "Count restored outages with duration <= 300 seconds. One column: momentary_incl.", code: `SELECT COUNT(*) AS momentary_incl\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts <= 300;`, order: "exact" },
      { prompt: "Count restored outages with duration < 300 seconds. One column: momentary_strict.", code: `SELECT COUNT(*) AS momentary_strict\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts < 300;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "The ring window",
    scenario:
      "The March storm left a contiguous scar in the register — pull the block.",
    steps: [
      { prompt: "List outages with outage_number BETWEEN 'OUT-2471' AND 'OUT-2477': outage_id, outage_number, cause, status, ordered by outage_id ascending.", code: `SELECT outage_id, outage_number, cause, status\nFROM outages\nWHERE outage_number BETWEEN 'OUT-2471' AND 'OUT-2477'\nORDER BY outage_id ASC;`, order: "exact" },
      { prompt: "Count the outages in that window. One column: ring_count.", code: `SELECT COUNT(*) AS ring_count\nFROM outages\nWHERE outage_number BETWEEN 'OUT-2471' AND 'OUT-2477';`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "National Grid",
    title: "Billing rails",
    scenario:
      "Revenue operations wants the ledger's shape: statuses and periods.",
    steps: [
      { prompt: "Count bills per status. Output status and bill_count, ordered by bill_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS bill_count\nFROM bills\nGROUP BY status\nORDER BY bill_count DESC, status ASC;`, order: "exact" },
      { prompt: "Count bills per period. Output period and bill_count, ordered by period ascending.", code: `SELECT period, COUNT(*) AS bill_count\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "Telemetry depth",
    scenario:
      "The AMI team checks which meters actually report, and how deep the deepest trail runs.",
    steps: [
      { prompt: "Count readings per meter. Output meter_id and reading_count, ordered by reading_count descending, then meter_id ascending, LIMIT 3.", code: `SELECT meter_id, COUNT(*) AS reading_count\nFROM readings\nGROUP BY meter_id\nORDER BY reading_count DESC, meter_id ASC\nLIMIT 3;`, order: "exact" },
      { prompt: "Count meter 1's readings. One column: reading_count.", code: `SELECT COUNT(*) AS reading_count\nFROM readings\nWHERE meter_id = 1;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Duke Energy",
    title: "Dispatch census",
    scenario:
      "The dispatch desk opens its book: statuses first, then the per-crew load.",
    steps: [
      { prompt: "Count dispatches per status. Output status and dispatch_count, ordered by dispatch_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS dispatch_count\nFROM dispatches\nGROUP BY status\nORDER BY dispatch_count DESC, status ASC;`, order: "exact" },
      { prompt: "Count dispatches per crew, including zeros. Output crew_id and dispatch_count, ordered by dispatch_count descending, then crew_id ascending.", code: `SELECT c.crew_id, COUNT(d.dispatch_id) AS dispatch_count\nFROM crews c\nLEFT JOIN dispatches d ON d.crew_id = c.crew_id\nGROUP BY c.crew_id\nORDER BY dispatch_count DESC, c.crew_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Schneider Electric",
    title: "The served base",
    scenario:
      "Every ratio in the reliability report divides by customers served — pin the base.",
    steps: [
      { prompt: "Sum customers_served across substations. One column: total_served.", code: `SELECT SUM(customers_served) AS total_served\nFROM substations;`, order: "exact" },
      { prompt: "List the largest substation by customers_served: substation_id, name, customers_served. One row.", code: `SELECT substation_id, name, customers_served\nFROM substations\nORDER BY customers_served DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Cascadia Power",
    title: "The live period",
    scenario:
      "Billing closes June late — pull the open period and count what is in it.",
    steps: [
      { prompt: "List the '2026-06' bills: bill_id, meter_id, kwh_billed, amount_cents, status, ordered by bill_id ascending.", code: `SELECT bill_id, meter_id, kwh_billed, amount_cents, status\nFROM bills\nWHERE period = '2026-06'\nORDER BY bill_id ASC;`, order: "exact" },
      { prompt: "Count the '2026-06' bills. One column: june_count.", code: `SELECT COUNT(*) AS june_count\nFROM bills\nWHERE period = '2026-06';`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    title: "Region map",
    scenario:
      "Planning wants the geographic picture: where do assets sit?",
    steps: [
      { prompt: "Count substations per region. Output region and sub_count, ordered by sub_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS sub_count\nFROM substations\nGROUP BY region\nORDER BY sub_count DESC, region ASC;`, order: "exact" },
      { prompt: "Count plants per region. Output region and plant_count, ordered by plant_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS plant_count\nFROM plants\nGROUP BY region\nORDER BY plant_count DESC, region ASC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "National Grid",
    title: "The old fleet",
    scenario:
      "Decommissioning studies start with the vintage units.",
    steps: [
      { prompt: "List plants commissioned before 1970: plant_id, name, fuel, commissioned, ordered by commissioned ascending.", code: `SELECT plant_id, name, fuel, commissioned\nFROM plants\nWHERE commissioned < 1970\nORDER BY commissioned ASC;`, order: "exact" },
      { prompt: "Count plants commissioned before 1970. One column: old_count.", code: `SELECT COUNT(*) AS old_count\nFROM plants\nWHERE commissioned < 1970;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "NextEra Energy",
    title: "Status split",
    scenario:
      "Two censuses, one memo: what has stopped moving, and what is in flight.",
    steps: [
      { prompt: "Count outages per status. Output status and outage_count, ordered by outage_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS outage_count\nFROM outages\nGROUP BY status\nORDER BY outage_count DESC, status ASC;`, order: "exact" },
      { prompt: "Count dispatches per status. Output status and dispatch_count, ordered by dispatch_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS dispatch_count\nFROM dispatches\nGROUP BY status\nORDER BY dispatch_count DESC, status ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "The whale memo",
    scenario:
      "Revenue ops briefs the CFO: one meter is over half the ledger, and the board beneath it flips.",
    steps: [
      { prompt: "Output one row: whale_billed (meter 1's total), ledger_billed (all bills), whale_share (meter 1's percent of the ledger, 1 dp).", code: `SELECT\n  SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS whale_billed,\n  SUM(amount_cents) AS ledger_billed,\n  ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS whale_share\nFROM bills;`, order: "exact" },
      { prompt: "Sum billed amounts per tariff EXCLUDING meter 1. Output tariff and billed_total, ordered by billed_total descending, then tariff ascending.", code: `SELECT m.tariff, SUM(b.amount_cents) AS billed_total\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nWHERE b.meter_id <> 1\nGROUP BY m.tariff\nORDER BY billed_total DESC, m.tariff ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The 5-minute wall",
    scenario:
      "The regulator asks for momentaries both ways — and the rows that make the edges disagree.",
    steps: [
      { prompt: "Output one row: momentary_incl (duration <= 300 among restored), momentary_strict (duration < 300).", code: `SELECT\n  SUM(CASE WHEN restored_ts - started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_incl,\n  SUM(CASE WHEN restored_ts - started_ts < 300 THEN 1 ELSE 0 END) AS momentary_strict\nFROM outages\nWHERE status = 'restored';`, order: "exact" },
      { prompt: "List the restored outages with duration EXACTLY 300 seconds: outage_id, outage_number, substation_id, ordered by outage_id ascending.", code: `SELECT outage_id, outage_number, substation_id\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts = 300\nORDER BY outage_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "Flicker forensics",
    scenario:
      "Two feeders flickered in the spring — the reclose log shows the pairs.",
    steps: [
      { prompt: "Self-join outages on substation_id for same-substation starts within 240 seconds: first_outage_id, second_outage_id, gap_seconds, ordered by gap_seconds then first_outage_id.", code: `SELECT a.outage_id AS first_outage_id, b.outage_id AS second_outage_id,\n  b.started_ts - a.started_ts AS gap_seconds\nFROM outages a\nJOIN outages b ON b.substation_id = a.substation_id\n  AND b.started_ts > a.started_ts\nWHERE b.started_ts - a.started_ts <= 240\nORDER BY gap_seconds ASC, first_outage_id ASC;`, order: "exact" },
      { prompt: "Same pairs within 300 seconds, ordered by gap DESCENDING: first_outage_id, second_outage_id, gap_seconds.", code: `SELECT a.outage_id AS first_outage_id, b.outage_id AS second_outage_id,\n  b.started_ts - a.started_ts AS gap_seconds\nFROM outages a\nJOIN outages b ON b.substation_id = a.substation_id\n  AND b.started_ts > a.started_ts\nWHERE b.started_ts - a.started_ts <= 300\nORDER BY gap_seconds DESC, first_outage_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "Wrap-up board",
    scenario:
      "The ops chief reviews clearances: the full board, then the anchor crew's book.",
    steps: [
      { prompt: "Count CLEARED dispatches per crew (keep zero-crew rows): crew_id, name, cleared_count, ordered by cleared_count descending, then crew_id ascending.", code: `SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS cleared_count\nFROM crews c\nLEFT JOIN dispatches d ON d.crew_id = c.crew_id AND d.status = 'cleared'\nGROUP BY c.crew_id, c.name\nORDER BY cleared_count DESC, c.crew_id ASC;`, order: "exact" },
      { prompt: "List crew 1's cleared dispatches: dispatch_id, outage_id, arrived_ts - dispatched_ts AS response, ordered by response descending.", code: `SELECT dispatch_id, outage_id,\n  arrived_ts - dispatched_ts AS response\nFROM dispatches\nWHERE crew_id = 1 AND status = 'cleared'\nORDER BY response DESC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "National Grid",
    title: "Response audit",
    scenario:
      "The SLA report wants the slow clock list and the boundary math.",
    steps: [
      { prompt: "List dispatches with response >= 2700 seconds: dispatch_id, outage_id, crew_id, response, ordered by response descending, then dispatch_id ascending.", code: `SELECT dispatch_id, outage_id, crew_id,\n  arrived_ts - dispatched_ts AS response\nFROM dispatches\nWHERE arrived_ts IS NOT NULL\n  AND arrived_ts - dispatched_ts >= 2700\nORDER BY response DESC, dispatch_id ASC;`, order: "exact" },
      { prompt: "Output one row: sla_incl (response >= 3600), sla_strict (response > 3600), among arrived dispatches.", code: `SELECT\n  SUM(CASE WHEN arrived_ts - dispatched_ts >= 3600 THEN 1 ELSE 0 END) AS sla_incl,\n  SUM(CASE WHEN arrived_ts - dispatched_ts > 3600 THEN 1 ELSE 0 END) AS sla_strict\nFROM dispatches\nWHERE arrived_ts IS NOT NULL;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "Session cut, strict",
    scenario:
      "AMI engineering sessionizes the smelter's telemetry with a strict cutoff.",
    steps: [
      { prompt: "Count meter 1's sessions where a gap STRICTLY greater than 1800 seconds starts a new session. One column: session_count.", code: `SELECT COUNT(*) AS session_count\nFROM (\n  SELECT read_ts,\n    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts\n  FROM readings\n  WHERE meter_id = 1\n)\nWHERE prev_ts IS NULL OR read_ts - prev_ts > 1800;`, order: "exact" },
      { prompt: "Count meter 1's readings. One column: reading_count.", code: `SELECT COUNT(*) AS reading_count\nFROM readings\nWHERE meter_id = 1;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "Session cut, inclusive",
    scenario:
      "Same telemetry, inclusive cutoff — and the knife-edge pair that moves the count.",
    steps: [
      { prompt: "Count meter 1's sessions where a gap of 1800 seconds or more starts a new session. One column: session_count.", code: `SELECT COUNT(*) AS session_count\nFROM (\n  SELECT read_ts,\n    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts\n  FROM readings\n  WHERE meter_id = 1\n)\nWHERE prev_ts IS NULL OR read_ts - prev_ts >= 1800;`, order: "exact" },
      { prompt: "Find the consecutive meter-1 pair whose gap is EXACTLY 1800 seconds: prev_ts, next_ts, gap_seconds. One row.", code: `SELECT prev_ts, read_ts AS next_ts,\n  read_ts - prev_ts AS gap_seconds\nFROM (\n  SELECT read_ts,\n    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts\n  FROM readings\n  WHERE meter_id = 1\n)\nWHERE read_ts - prev_ts = 1800;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The disconnect ladder",
    scenario:
      "Field ops pulls the disconnect-eligible list, then checks who is strictly over.",
    steps: [
      { prompt: "List meters with unpaid balance >= 500000: meter_id, balance, ordered by balance descending, then meter_id ascending.", code: `SELECT meter_id, SUM(amount_cents) AS balance\nFROM bills\nWHERE status <> 'paid'\nGROUP BY meter_id\nHAVING SUM(amount_cents) >= 500000\nORDER BY balance DESC, meter_id ASC;`, order: "exact" },
      { prompt: "List meters with unpaid balance strictly > 500000: meter_id, balance, ordered by balance descending.", code: `SELECT meter_id, SUM(amount_cents) AS balance\nFROM bills\nWHERE status <> 'paid'\nGROUP BY meter_id\nHAVING SUM(amount_cents) > 500000\nORDER BY balance DESC, meter_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "Rate drift audit",
    scenario:
      "Rates were raised mid-season; the audit compares every bill's snapshot to today's price.",
    steps: [
      { prompt: "List bills whose rate_cents differs from the meter's current rate: bill_id, meter_id, period, bill_rate, meter_rate, status, ordered by bill_id ascending.", code: `SELECT b.bill_id, b.meter_id, b.period,\n  b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nWHERE b.rate_cents <> m.rate_cents\nORDER BY b.bill_id ASC;`, order: "exact" },
      { prompt: "Same audit, PAID bills only: bill_id, meter_id, bill_rate, meter_rate, status, ordered by bill_id ascending.", code: `SELECT b.bill_id, b.meter_id,\n  b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nWHERE b.rate_cents <> m.rate_cents AND b.status = 'paid'\nORDER BY b.bill_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "Ring clocks",
    scenario:
      "The storm review pins the ring's numbers: clocks first, then the contiguity proof.",
    steps: [
      { prompt: "Output one row over ring outages 71-75 and their dispatches: response_min (avg arrived-dispatched, minutes, 0 dp), restore_min (avg restored-started, minutes, 0 dp).", code: `SELECT\n  ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 0) AS response_min,\n  ROUND(AVG(o.restored_ts - o.started_ts) / 60.0, 0) AS restore_min\nFROM dispatches d\nJOIN outages o ON o.outage_id = d.outage_id\nWHERE o.outage_id BETWEEN 71 AND 75;`, order: "exact" },
      { prompt: "Concatenate the ring's outage numbers (ids 71-77) in id order, comma-separated. One column: ring_registry.", code: `SELECT GROUP_CONCAT(outage_number) AS ring_registry\nFROM (\n  SELECT outage_number FROM outages\n  WHERE outage_id BETWEEN 71 AND 77\n  ORDER BY outage_id\n);`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "National Grid",
    title: "The 20-outage ceiling",
    scenario:
      "The interconnection board checks who carries how much — and who sits exactly on the line.",
    steps: [
      { prompt: "Count outages per utility. Output utility_id and outage_count, ordered by outage_count descending, then utility_id ascending.", code: `SELECT utility_id, COUNT(*) AS outage_count\nFROM outages\nGROUP BY utility_id\nORDER BY outage_count DESC, utility_id ASC;`, order: "exact" },
      { prompt: "Output one row: ge_20 (utilities with 20+ outages), gt_20 (strictly more than 20).", code: `SELECT\n  SUM(CASE WHEN n >= 20 THEN 1 ELSE 0 END) AS ge_20,\n  SUM(CASE WHEN n > 20 THEN 1 ELSE 0 END) AS gt_20\nFROM (SELECT utility_id, COUNT(*) AS n FROM outages GROUP BY utility_id);`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "Calendar spine",
    scenario:
      "The seasonal report needs all six months on the axis — including the empty one.",
    steps: [
      { prompt: "Build the January-June spine with outage counts (months CTE via VALUES, LEFT JOIN): month, outage_count, ordered by month ascending.", code: `WITH months(m) AS (\n  VALUES ('2026-01'), ('2026-02'), ('2026-03'),\n         ('2026-04'), ('2026-05'), ('2026-06')\n)\nSELECT mo.m AS month, COUNT(o.outage_id) AS outage_count\nFROM months mo\nLEFT JOIN outages o\n  ON strftime('%Y-%m', o.started_ts, 'unixepoch') = mo.m\nGROUP BY mo.m\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Count March 2026 outages. One column: march_count.", code: `SELECT COUNT(*) AS march_count\nFROM outages\nWHERE strftime('%Y-%m', started_ts, 'unixepoch') = '2026-03';`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "Capacity tie",
    scenario:
      "Fleet analytics pins the 850 MW tie: registry first, then the ranked board.",
    steps: [
      { prompt: "Output one row: tie_capacity (850), plant_registry (the tied plant ids ascending, comma-separated), above_count (plants above 850).", code: `SELECT\n  850 AS tie_capacity,\n  (SELECT GROUP_CONCAT(plant_id) FROM (SELECT plant_id FROM plants WHERE capacity_mw = 850 ORDER BY plant_id)) AS plant_registry,\n  (SELECT COUNT(*) FROM plants WHERE capacity_mw > 850) AS above_count;`, order: "exact" },
      { prompt: "Rank all plants by capacity_mw descending: plant_id, name, capacity_mw, rk (RANK), ordered by rk then plant_id, LIMIT 8.", code: `SELECT plant_id, name, capacity_mw,\n  RANK() OVER (ORDER BY capacity_mw DESC) AS rk\nFROM plants\nORDER BY rk ASC, plant_id ASC\nLIMIT 8;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "The storm king",
    scenario:
      "The biggest outage in book history gets its dossier: the row, then the share.",
    steps: [
      { prompt: "List the largest outage by customers_affected: outage_id, outage_number, substation_id, cause, customers_affected. One row.", code: `SELECT outage_id, outage_number, substation_id, cause, customers_affected\nFROM outages\nORDER BY customers_affected DESC\nLIMIT 1;`, order: "exact" },
      { prompt: "Output one row: king_affected (the max), total_affected (the sum over all outages), king_share (percent, 2 dp).", code: `SELECT\n  MAX(customers_affected) AS king_affected,\n  SUM(customers_affected) AS total_affected,\n  ROUND(MAX(customers_affected) * 100.0 / SUM(customers_affected), 2) AS king_share\nFROM outages;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Cascadia Power",
    title: "The forgotten ones",
    scenario:
      "The dispatch-desk audit hunts live outages nobody was sent to.",
    steps: [
      { prompt: "List ACTIVE outages with no dispatch row: outage_id, outage_number, started_ts, customers_affected, ordered by outage_id ascending.", code: `SELECT o.outage_id, o.outage_number, o.started_ts, o.customers_affected\nFROM outages o\nWHERE o.status = 'active'\n  AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)\nORDER BY o.outage_id ASC;`, order: "exact" },
      { prompt: "List outage 44's full header: outage_id, outage_number, utility_id, substation_id, cause, status, started_ts, customers_affected. One row.", code: `SELECT outage_id, outage_number, utility_id, substation_id, cause, status, started_ts, customers_affected\nFROM outages\nWHERE outage_id = 44;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    title: "Money ladder",
    scenario:
      "Revenue ops pins the ledger: what came in, what is out standing, and the delinquent slice.",
    steps: [
      { prompt: "Output one row: billed (all), collected (status 'paid'), outstanding (issued + delinquent).", code: `SELECT\n  SUM(amount_cents) AS billed,\n  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS collected,\n  SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) AS outstanding\nFROM bills;`, order: "exact" },
      { prompt: "Sum DELINQUENT bill amounts. One column: delinquent_total.", code: `SELECT SUM(amount_cents) AS delinquent_total\nFROM bills\nWHERE status = 'delinquent';`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "National Grid",
    title: "Billing curve",
    scenario:
      "The CFO wants the period curve with its running total.",
    steps: [
      { prompt: "Per period: period, period_billed, running_billed (cumulative in period order), ordered by period ascending.", code: `SELECT period,\n  SUM(amount_cents) AS period_billed,\n  SUM(SUM(amount_cents)) OVER (ORDER BY period) AS running_billed\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
      { prompt: "Sum billed amounts for '2026-06'. One column: june_billed.", code: `SELECT SUM(amount_cents) AS june_billed\nFROM bills\nWHERE period = '2026-06';`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "NextEra Energy",
    title: "Auto-reclose audit",
    scenario:
      "Engineering wants the restorations no crew attended — the automation's fingerprints.",
    steps: [
      { prompt: "List restored outages with NO dispatch row: outage_id, outage_number, duration (restored-started), ordered by duration ascending, then outage_id.", code: `SELECT o.outage_id, o.outage_number,\n  o.restored_ts - o.started_ts AS duration\nFROM outages o\nWHERE o.status = 'restored'\n  AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)\nORDER BY duration ASC, o.outage_id ASC;`, order: "exact" },
      { prompt: "Count restored outages with duration <= 300 seconds. One column: momentary_incl.", code: `SELECT COUNT(*) AS momentary_incl\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts <= 300;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Duke Energy",
    title: "Tariff spine",
    scenario:
      "Rate design reviews the ledger by class: money first, then counts.",
    steps: [
      { prompt: "Sum billed amounts per tariff (all bills): tariff, billed_total, ordered by billed_total descending, then tariff ascending.", code: `SELECT m.tariff, SUM(b.amount_cents) AS billed_total\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nGROUP BY m.tariff\nORDER BY billed_total DESC, m.tariff ASC;`, order: "exact" },
      { prompt: "Count bills per tariff: tariff, bill_count, ordered by bill_count descending, then tariff ascending.", code: `SELECT m.tariff, COUNT(*) AS bill_count\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nGROUP BY m.tariff\nORDER BY bill_count DESC, m.tariff ASC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Schneider Electric",
    title: "Intensity intro",
    scenario:
      "Reliability reporting starts with raw exposure, then normalizes per customer.",
    steps: [
      { prompt: "Sum customers_affected per utility: utility_id, affected_total, ordered by affected_total descending, then utility_id ascending.", code: `SELECT utility_id, SUM(customers_affected) AS affected_total\nFROM outages\nGROUP BY utility_id\nORDER BY affected_total DESC, utility_id ASC;`, order: "exact" },
      { prompt: "Compute Columbia Rim's (utility 3) intensity: its total customers_affected * 1000.0 / its served base (sum of customers_served over its substations), rounded to 2 dp. One column: intensity, one row.", code: `SELECT ROUND(\n  (SELECT SUM(customers_affected) FROM outages WHERE utility_id = 3) * 1000.0 /\n  (SELECT SUM(customers_served) FROM substations WHERE utility_id = 3), 2) AS intensity;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "The mirror tie, ranked",
    scenario:
      "The regulatory filing needs the affected-customer ranking — and the tie that makes RANK and DENSE_RANK disagree.",
    steps: [
      { prompt: "Rank every outage with customers_affected >= 4200: outage_id, customers_affected, rk (RANK), dense_rk (DENSE_RANK), ordered by customers_affected DESC then outage_id ASC.", code: `SELECT outage_id, customers_affected,\n  RANK() OVER (ORDER BY customers_affected DESC) AS rk,\n  DENSE_RANK() OVER (ORDER BY customers_affected DESC) AS dense_rk\nFROM outages\nWHERE customers_affected >= 4200\nORDER BY customers_affected DESC, outage_id ASC;`, order: "exact" },
      { prompt: "Output one row: tie_value (4200), tied_registry (the tied outage ids ascending, comma-separated), above_count, rank_position (the RANK the pair shares).", code: `SELECT\n  4200 AS tie_value,\n  (SELECT GROUP_CONCAT(outage_id) FROM (SELECT outage_id FROM outages WHERE customers_affected = 4200 ORDER BY outage_id)) AS tied_registry,\n  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) AS above_count,\n  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) + 1 AS rank_position;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "The cause flip dossier",
    scenario:
      "The board memo argues the storm program overshadows equipment risk — until the king leaves the room.",
    steps: [
      { prompt: "Output one row: storm_total, storm_ex_king (storm excluding outage 5), equipment_total, flip_leader (the leading cause once the king is excluded).", code: `SELECT\n  SUM(CASE WHEN cause = 'storm' THEN customers_affected ELSE 0 END) AS storm_total,\n  SUM(CASE WHEN cause = 'storm' AND outage_id <> 5 THEN customers_affected ELSE 0 END) AS storm_ex_king,\n  SUM(CASE WHEN cause = 'equipment' THEN customers_affected ELSE 0 END) AS equipment_total,\n  (SELECT cause FROM outages WHERE outage_id <> 5\n   GROUP BY cause ORDER BY SUM(customers_affected) DESC LIMIT 1) AS flip_leader\nFROM outages;`, order: "exact" },
      { prompt: "Sum customers_affected per cause EXCLUDING outage 5: cause, affected_total, ordered by affected_total descending, then cause ascending.", code: `SELECT cause, SUM(customers_affected) AS affected_total\nFROM outages\nWHERE outage_id <> 5\nGROUP BY cause\nORDER BY affected_total DESC, cause ASC;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "National Grid",
    title: "Sessionization wall row",
    scenario:
      "AMI engineering freezes the smelter telemetry study into one memo row, then pins the knife-edge pair.",
    steps: [
      { prompt: "Output one row for meter 1: reading_count, boundary_gaps (gaps of exactly 1800s), sessions_strict (gap > 1800 splits), sessions_incl (gap >= 1800 splits).", code: `WITH gaps AS (\n  SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap\n  FROM readings\n  WHERE meter_id = 1\n)\nSELECT\n  (SELECT COUNT(*) FROM readings WHERE meter_id = 1) AS reading_count,\n  (SELECT COUNT(*) FROM gaps WHERE gap = 1800) AS boundary_gaps,\n  1 + (SELECT COUNT(*) FROM gaps WHERE gap > 1800) AS sessions_strict,\n  1 + (SELECT COUNT(*) FROM gaps WHERE gap >= 1800) AS sessions_incl;`, order: "exact" },
      { prompt: "Find the consecutive meter-1 pair with gap EXACTLY 1800 seconds: prev_ts, next_ts, gap_seconds. One row.", code: `SELECT prev_ts, read_ts AS next_ts,\n  read_ts - prev_ts AS gap_seconds\nFROM (\n  SELECT read_ts,\n    LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts\n  FROM readings\n  WHERE meter_id = 1\n)\nWHERE read_ts - prev_ts = 1800;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "Foreman dossier",
    scenario:
      "HR reviews the heavy books: who clears ten or more, and what the anchor crew's clock looks like.",
    steps: [
      { prompt: "For crews with at least 10 CLEARED dispatches: crew_id, name, cleared_count, avg_response_min (avg arrived-dispatched in minutes, 1 dp), ordered by cleared_count descending, then crew_id ascending.", code: `SELECT c.crew_id, c.name, COUNT(*) AS cleared_count,\n  ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_response_min\nFROM dispatches d\nJOIN crews c ON c.crew_id = d.crew_id\nWHERE d.status = 'cleared'\nGROUP BY c.crew_id, c.name\nHAVING COUNT(*) >= 10\nORDER BY cleared_count DESC, c.crew_id ASC;`, order: "exact" },
      { prompt: "Output crew 1's row alone: cleared_count, avg_response_min (minutes, 1 dp). One row.", code: `SELECT COUNT(*) AS cleared_count,\n  ROUND(AVG(arrived_ts - dispatched_ts) / 60.0, 1) AS avg_response_min\nFROM dispatches\nWHERE crew_id = 1 AND status = 'cleared';`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "Intensity deep-dive",
    scenario:
      "The reliability memo normalizes exposure per customer — and finds the small utility with the big number.",
    steps: [
      { prompt: "Per utility: utility_id, code, outage_count, affected_total, intensity (affected_total * 1000.0 / served base from its substations, 2 dp), ordered by intensity descending.", code: `SELECT u.utility_id, u.code,\n  COUNT(o.outage_id) AS outage_count,\n  SUM(o.customers_affected) AS affected_total,\n  ROUND(SUM(o.customers_affected) * 1000.0 /\n    (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id), 2) AS intensity\nFROM utilities u\nLEFT JOIN outages o ON o.utility_id = u.utility_id\nGROUP BY u.utility_id, u.code\nORDER BY intensity DESC;`, order: "exact" },
      { prompt: "Output utility 3's row alone: code, affected_total, served_base, intensity (2 dp). One row.", code: `SELECT 'CRE' AS code,\n  (SELECT SUM(customers_affected) FROM outages WHERE utility_id = 3) AS affected_total,\n  (SELECT SUM(customers_served) FROM substations WHERE utility_id = 3) AS served_base,\n  ROUND((SELECT SUM(customers_affected) FROM outages WHERE utility_id = 3) * 1000.0 /\n    (SELECT SUM(customers_served) FROM substations WHERE utility_id = 3), 2) AS intensity;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "Whale end-to-end",
    scenario:
      "The Aurora dossier closes: totals first, then how the whale sits inside each period.",
    steps: [
      { prompt: "Output meter 1's row: bill_count, kwh_total, amount_total, avg_rate (0 dp), ledger_share (percent of all bills, 1 dp).", code: `SELECT\n  COUNT(*) AS bill_count,\n  SUM(kwh_billed) AS kwh_total,\n  SUM(amount_cents) AS amount_total,\n  ROUND(AVG(rate_cents), 0) AS avg_rate,\n  ROUND(SUM(amount_cents) * 100.0 / (SELECT SUM(amount_cents) FROM bills), 1) AS ledger_share\nFROM bills\nWHERE meter_id = 1;`, order: "exact" },
      { prompt: "Per period: period, period_billed, aurora_billed, aurora_share (1 dp), ordered by period ascending.", code: `SELECT period,\n  SUM(amount_cents) AS period_billed,\n  SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS aurora_billed,\n  ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS aurora_share\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "King's neighborhood",
    scenario:
      "Storm analysts draw the king's window: everything on its feeder within a day of the event.",
    steps: [
      { prompt: "List every substation-1 outage starting within 86400 seconds (either side) of outage 5's start: outage_id, outage_number, started_ts, customers_affected, ordered by started_ts ascending.", code: `WITH king AS (\n  SELECT started_ts FROM outages WHERE outage_id = 5\n)\nSELECT o.outage_id, o.outage_number, o.started_ts, o.customers_affected\nFROM outages o, king\nWHERE o.substation_id = 1\n  AND o.started_ts BETWEEN king.started_ts - 86400 AND king.started_ts + 86400\nORDER BY o.started_ts ASC;`, order: "exact" },
      { prompt: "List outage 5's header: outage_id, outage_number, cause, status, started_ts, restored_ts, customers_affected. One row.", code: `SELECT outage_id, outage_number, cause, status, started_ts, restored_ts, customers_affected\nFROM outages\nWHERE outage_id = 5;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "Open clock wall",
    scenario:
      "The clock audit collects every dispatch that fails the clean-clock test: the boundary row and the never-arrived.",
    steps: [
      { prompt: "List dispatches with response >= 3600 OR arrived_ts NULL: dispatch_id, outage_id, crew_id, status, response (NULL for enroute), ordered by dispatch_id ascending.", code: `SELECT dispatch_id, outage_id, crew_id, status,\n  CASE WHEN arrived_ts IS NULL THEN NULL\n       ELSE arrived_ts - dispatched_ts END AS response\nFROM dispatches\nWHERE (arrived_ts IS NOT NULL AND arrived_ts - dispatched_ts >= 3600)\n   OR arrived_ts IS NULL\nORDER BY dispatch_id ASC;`, order: "exact" },
      { prompt: "Count dispatches with arrived_ts IS NULL. One column: enroute_count.", code: `SELECT COUNT(*) AS enroute_count\nFROM dispatches\nWHERE arrived_ts IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "National Grid",
    title: "Ex-whale spine",
    scenario:
      "Rate design pins what each tariff really earns once the smelter stops distorting the picture.",
    steps: [
      { prompt: "Per tariff: tariff, billed_total, ex_whale_total (excluding meter 1), delta (billed_total minus ex_whale_total), ordered by delta DESC, then tariff ASC.", code: `SELECT m.tariff,\n  SUM(b.amount_cents) AS billed_total,\n  SUM(CASE WHEN b.meter_id = 1 THEN 0 ELSE b.amount_cents END) AS ex_whale_total,\n  SUM(CASE WHEN b.meter_id = 1 THEN b.amount_cents ELSE 0 END) AS delta\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nGROUP BY m.tariff\nORDER BY delta DESC, m.tariff ASC;`, order: "exact" },
      { prompt: "Output the commercial row of that spine: tariff, billed_total, ex_whale_total, delta. One row.", code: `SELECT m.tariff,\n  SUM(b.amount_cents) AS billed_total,\n  SUM(CASE WHEN b.meter_id = 1 THEN 0 ELSE b.amount_cents END) AS ex_whale_total,\n  SUM(CASE WHEN b.meter_id = 1 THEN b.amount_cents ELSE 0 END) AS delta\nFROM bills b\nJOIN meters m ON m.meter_id = b.meter_id\nWHERE m.tariff = 'commercial'\nGROUP BY m.tariff;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "Duration buckets",
    scenario:
      "The reliability report buckets restorations by clock — the boundaries decide where rows land.",
    steps: [
      { prompt: "Bucket restored outages by duration: '<300' (strictly), '300-3600' (inclusive of 300), '3600-7200' (inclusive of 3600), '>7200'. Output bucket, outage_count, ordered by bucket ascending.", code: `SELECT\n  CASE\n    WHEN restored_ts - started_ts < 300 THEN '<300'\n    WHEN restored_ts - started_ts <= 3600 THEN '300-3600'\n    WHEN restored_ts - started_ts <= 7200 THEN '3600-7200'\n    ELSE '>7200'\n  END AS bucket,\n  COUNT(*) AS outage_count\nFROM outages\nWHERE status = 'restored'\nGROUP BY bucket\nORDER BY bucket ASC;`, order: "exact" },
      { prompt: "Count restored outages with duration EXACTLY 300 seconds. One column: on_line_count.", code: `SELECT COUNT(*) AS on_line_count\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts = 300;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "Substation grid board",
    scenario:
      "Asset health wants every substation on one board — including the one that never went dark.",
    steps: [
      { prompt: "Per substation (keep zero rows): substation_id, name, outage_count, momentary_count (restored durations <= 300), ordered by substation_id ascending.", code: `SELECT s.substation_id, s.name,\n  COUNT(o.outage_id) AS outage_count,\n  SUM(CASE WHEN o.status = 'restored' AND o.restored_ts - o.started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_count\nFROM substations s\nLEFT JOIN outages o ON o.substation_id = s.substation_id\nGROUP BY s.substation_id, s.name\nORDER BY s.substation_id ASC;`, order: "exact" },
      { prompt: "List substations with at least one momentary: substation_id, name, momentary_count, ordered by momentary_count descending, then substation_id ascending.", code: `SELECT s.substation_id, s.name,\n  SUM(CASE WHEN o.status = 'restored' AND o.restored_ts - o.started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_count\nFROM substations s\nJOIN outages o ON o.substation_id = s.substation_id\nGROUP BY s.substation_id, s.name\nHAVING momentary_count >= 1\nORDER BY momentary_count DESC, s.substation_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "Tie registry deep",
    scenario:
      "The 4200 pair gets named: the registry line, then both tied rows in full.",
    steps: [
      { prompt: "Output one row: tie_value (4200), tied_registry (ids ascending, comma-separated), above_count, rank_position.", code: `SELECT\n  4200 AS tie_value,\n  (SELECT GROUP_CONCAT(outage_id) FROM (SELECT outage_id FROM outages WHERE customers_affected = 4200 ORDER BY outage_id)) AS tied_registry,\n  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) AS above_count,\n  (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) + 1 AS rank_position;`, order: "exact" },
      { prompt: "List the tied rows in full: outage_id, outage_number, utility_id, substation_id, cause, status, customers_affected, ordered by outage_id ascending.", code: `SELECT outage_id, outage_number, utility_id, substation_id, cause, status, customers_affected\nFROM outages\nWHERE customers_affected = 4200\nORDER BY outage_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "Whale per period",
    scenario:
      "The treasury memo tracks the whale across the season: the board, then the newest slice.",
    steps: [
      { prompt: "Per period: period, period_billed, aurora_billed, aurora_share (1 dp), ordered by period ascending.", code: `SELECT period,\n  SUM(amount_cents) AS period_billed,\n  SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS aurora_billed,\n  ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS aurora_share\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
      { prompt: "Output meter 1's '2026-06' bill: bill_id, period, kwh_billed, rate_cents, amount_cents. One row.", code: `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents\nFROM bills\nWHERE meter_id = 1 AND period = '2026-06';`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "Ring dossier",
    scenario:
      "The storm review seals the ring: one memo row, then the wounds still open.",
    steps: [
      { prompt: "Output one row over ring outages 71-77: ring_size, restored_count, active_count, response_avg_min (0 dp, over the restored five's dispatches), restore_avg_min (0 dp), affected_total.", code: `SELECT\n  COUNT(*) AS ring_size,\n  SUM(CASE WHEN status = 'restored' THEN 1 ELSE 0 END) AS restored_count,\n  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,\n  (SELECT ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 0) FROM dispatches d WHERE d.outage_id BETWEEN 71 AND 75) AS response_avg_min,\n  (SELECT ROUND(AVG(o.restored_ts - o.started_ts) / 60.0, 0) FROM outages o WHERE o.outage_id BETWEEN 71 AND 75) AS restore_avg_min,\n  SUM(customers_affected) AS affected_total\nFROM outages\nWHERE outage_id BETWEEN 71 AND 77;`, order: "exact" },
      { prompt: "List the ring's ACTIVE rows: outage_id, outage_number, customers_affected, ordered by outage_id ascending.", code: `SELECT outage_id, outage_number, customers_affected\nFROM outages\nWHERE outage_id BETWEEN 71 AND 77 AND status = 'active'\nORDER BY outage_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "National Grid",
    title: "Crew utilization",
    scenario:
      "Workforce planning wants the whole bench on one board — the dark crew included.",
    steps: [
      { prompt: "Per crew (keep zero rows): crew_id, name, total_dispatches, cleared_count, live_count (onsite + enroute), avg_response_min (over arrived dispatches, 1 dp), ordered by total_dispatches DESC, then crew_id ASC.", code: `SELECT c.crew_id, c.name,\n  COUNT(d.dispatch_id) AS total_dispatches,\n  SUM(CASE WHEN d.status = 'cleared' THEN 1 ELSE 0 END) AS cleared_count,\n  SUM(CASE WHEN d.status IN ('onsite', 'enroute') THEN 1 ELSE 0 END) AS live_count,\n  ROUND(AVG(CASE WHEN d.arrived_ts IS NOT NULL THEN d.arrived_ts - d.dispatched_ts END) / 60.0, 1) AS avg_response_min\nFROM crews c\nLEFT JOIN dispatches d ON d.crew_id = c.crew_id\nGROUP BY c.crew_id, c.name\nORDER BY total_dispatches DESC, c.crew_id ASC;`, order: "exact" },
      { prompt: "Output crew 8's row alone: crew_id, name, total_dispatches. One row.", code: `SELECT c.crew_id, c.name,\n  COUNT(d.dispatch_id) AS total_dispatches\nFROM crews c\nLEFT JOIN dispatches d ON d.crew_id = c.crew_id\nWHERE c.crew_id = 8\nGROUP BY c.crew_id, c.name;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "NextEra Energy",
    title: "Delinquency geography",
    scenario:
      "Collections maps the old debt by utility — three hops from bill to territory.",
    steps: [
      { prompt: "Sum DELINQUENT amounts per utility (bills -> meters -> substations): utility_id, delinquent_total, ordered by delinquent_total descending, then utility_id ascending. Utilities with zero must still appear.", code: `SELECT u.utility_id, SUM(CASE WHEN b.status = 'delinquent' THEN b.amount_cents ELSE 0 END) AS delinquent_total\nFROM utilities u\nLEFT JOIN substations s ON s.utility_id = u.utility_id\nLEFT JOIN meters m ON m.substation_id = s.substation_id\nLEFT JOIN bills b ON b.meter_id = m.meter_id\nGROUP BY u.utility_id\nORDER BY delinquent_total DESC, u.utility_id ASC;`, order: "exact" },
      { prompt: "Count delinquent bills. One column: delinquent_count.", code: `SELECT COUNT(*) AS delinquent_count\nFROM bills\nWHERE status = 'delinquent';`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Duke Energy",
    title: "Momentary by cause",
    scenario:
      "Vegetation management asks which causes produce the flickers, not just the count.",
    steps: [
      { prompt: "Per cause over restored outages: cause, restored_count, momentary_count (durations <= 300), ordered by restored_count DESC, then cause ASC.", code: `SELECT cause,\n  COUNT(*) AS restored_count,\n  SUM(CASE WHEN restored_ts - started_ts <= 300 THEN 1 ELSE 0 END) AS momentary_count\nFROM outages\nWHERE status = 'restored'\nGROUP BY cause\nORDER BY restored_count DESC, cause ASC;`, order: "exact" },
      { prompt: "List the restored momentaries with their cause and duration: outage_id, cause, duration, ordered by duration ascending, then outage_id.", code: `SELECT outage_id, cause,\n  restored_ts - started_ts AS duration\nFROM outages\nWHERE status = 'restored'\n  AND restored_ts - started_ts <= 300\nORDER BY duration ASC, outage_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Schneider Electric",
    title: "Response ladder",
    scenario:
      "Training reviews clock discipline: the per-crew ladder, then the slowest single clock.",
    steps: [
      { prompt: "Per crew with at least one arrived dispatch: crew_id, name, arrived_count, avg_response_min (1 dp), ordered by avg_response_min DESC, then crew_id ASC.", code: `SELECT c.crew_id, c.name,\n  COUNT(*) AS arrived_count,\n  ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_response_min\nFROM dispatches d\nJOIN crews c ON c.crew_id = d.crew_id\nWHERE d.arrived_ts IS NOT NULL\nGROUP BY c.crew_id, c.name\nORDER BY avg_response_min DESC, c.crew_id ASC;`, order: "exact" },
      { prompt: "List the slowest arrival: dispatch_id, outage_id, crew_id, response, ordered by response DESC, LIMIT 1.", code: `SELECT dispatch_id, outage_id, crew_id,\n  arrived_ts - dispatched_ts AS response\nFROM dispatches\nWHERE arrived_ts IS NOT NULL\nORDER BY response DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Cascadia Power",
    title: "Ledger pivot",
    scenario:
      "Finance wants the ledger as a matrix: money per status per period, then the running spine.",
    steps: [
      { prompt: "Per period: period, paid_amt, issued_amt, delinquent_amt (CASE pivots over amount_cents), ordered by period ascending.", code: `SELECT period,\n  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS paid_amt,\n  SUM(CASE WHEN status = 'issued' THEN amount_cents ELSE 0 END) AS issued_amt,\n  SUM(CASE WHEN status = 'delinquent' THEN amount_cents ELSE 0 END) AS delinquent_amt\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
      { prompt: "Per period: period, period_billed, running_billed (cumulative), ordered by period ascending.", code: `SELECT period,\n  SUM(amount_cents) AS period_billed,\n  SUM(SUM(amount_cents)) OVER (ORDER BY period) AS running_billed\nFROM bills\nGROUP BY period\nORDER BY period ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    title: "The executive memo",
    scenario:
      "The quarterly board memo compresses the whole pack into two rows of SQL.",
    steps: [
      { prompt: "Output one row: ledger_billed, whale_share (meter 1's percent, 1 dp), momentary_incl, on_line_count (exactly 300s), forgotten_outage (the lowest active outage id with no dispatch), king_affected.", code: `SELECT\n  (SELECT SUM(amount_cents) FROM bills) AS ledger_billed,\n  (SELECT ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) FROM bills) AS whale_share,\n  (SELECT COUNT(*) FROM outages WHERE status = 'restored' AND restored_ts - started_ts <= 300) AS momentary_incl,\n  (SELECT COUNT(*) FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 300) AS on_line_count,\n  (SELECT MIN(o.outage_id) FROM outages o WHERE o.status = 'active'\n     AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id)) AS forgotten_outage,\n  (SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) AS king_affected;`, order: "exact" },
      { prompt: "Output one row: storm_ex_king (storm's total excluding outage 5), equipment_total, flip_leader (leading cause ex-king), cre_intensity (utility 3's intensity, 2 dp).", code: `SELECT\n  SUM(CASE WHEN cause = 'storm' AND outage_id <> 5 THEN customers_affected ELSE 0 END) AS storm_ex_king,\n  SUM(CASE WHEN cause = 'equipment' THEN customers_affected ELSE 0 END) AS equipment_total,\n  (SELECT cause FROM outages WHERE outage_id <> 5\n   GROUP BY cause ORDER BY SUM(customers_affected) DESC LIMIT 1) AS flip_leader,\n  (SELECT ROUND(SUM(o.customers_affected) * 1000.0 /\n    (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = 3), 2)\n   FROM outages o WHERE o.utility_id = 3) AS cre_intensity\nFROM outages;`, order: "exact" },
    ],
  },
];
