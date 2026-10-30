// Domain Mastery — Energy & Grid Ops · 60 MCQs (20 Easy / 20 Medium / 20 Hard).
// Two kinds:
//   output  — pick the true result of a real query. truthQuery + 3 mutants
//             are engine-run by scripts/dm-verify.ts, which asserts 4-way
//             distinct outputs and writes the option strings into
//             dm-expected.ts (key "energy-grid-ops:m:<id>:opts").
//             options[] here is left empty for that kind.
//   concept — hand-authored knowledge checks; every cited number is
//             probe-verified (scripts/r23-grid-world.ts).
import type { DmMcq } from "../domain-packs";

export const DM_GRID_MCQS: DmMcq[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "m01",
    difficulty: "Easy",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return on the pack's dataset?",
    truthQuery: `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored';`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM outages;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'active';`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts <= 300;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The book holds 95 outages and 90 of them restored. The mutants count everything (95), the five still burning, and the seven momentaries at or under 300 seconds — different books entirely.",
  },
  {
    id: "m02",
    difficulty: "Easy",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT DISTINCT cause FROM outages ORDER BY cause ASC;`,
    mutantQueries: [
      `SELECT DISTINCT status FROM outages ORDER BY status ASC;`,
      `SELECT DISTINCT fuel FROM plants ORDER BY fuel ASC;`,
      `SELECT DISTINCT tariff FROM meters ORDER BY tariff ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Six causes: animal, equipment, operator, storm, traffic, vegetation. The distractors list outage statuses (2), plant fuels (6 — but a different vocabulary) and meter tariffs (3).",
  },
  {
    id: "m03",
    difficulty: "Easy",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts <= 300;`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts < 300;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts > 300;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 240;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The inclusive momentary board is 7 (five under the line plus the two sitting EXACTLY on 300). Strict < drops the boundary pair to 5, > 300 is the 83 sustained rows, and the lone 240-second row (OUT-2468) answers to exactly 1.",
  },
  {
    id: "m04",
    difficulty: "Easy",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents FROM bills WHERE meter_id = 1 ORDER BY bill_id ASC;`,
    mutantQueries: [
      `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents FROM bills WHERE meter_id = 2 ORDER BY bill_id ASC;`,
      `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents FROM bills WHERE status = 'delinquent' ORDER BY bill_id ASC;`,
      `SELECT bill_id, period, kwh_billed, rate_cents, amount_cents FROM bills WHERE meter_id = 35 ORDER BY bill_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Aurora Alloys carries three bills — 600000 kWh at rate 8, 4800000 cents each. The mutants surface meter 2's smaller industrial bills, the six delinquent rows, and meter 35's two residential bills.",
  },
  {
    id: "m05",
    difficulty: "Easy",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT status, COUNT(*) AS n FROM outages GROUP BY status ORDER BY n DESC, status ASC;`,
    mutantQueries: [
      `SELECT status, COUNT(*) AS n FROM bills GROUP BY status ORDER BY n DESC, status ASC;`,
      `SELECT status, COUNT(*) AS n FROM dispatches GROUP BY status ORDER BY n DESC, status ASC;`,
      `SELECT status, COUNT(*) AS n FROM meters GROUP BY status ORDER BY n DESC, status ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The outage census opens with restored (90). The mutants census bills (paid 62 leads), dispatches (cleared 83 leads) and meters (active 34 leads) — same shape, different worlds.",
  },
  {
    id: "m06",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM outages WHERE outage_number BETWEEN 'OUT-2471' AND 'OUT-2477';`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM outages WHERE outage_number BETWEEN 'OUT-2470' AND 'OUT-2477';`,
      `SELECT COUNT(*) AS n FROM outages WHERE outage_number = 'OUT-2474';`,
      `SELECT COUNT(*) AS n FROM outages WHERE outage_number LIKE 'OUT-247%';`,
    ],
    options: [],
    answer: 0,
    explain:
      "The ring window OUT-2471..OUT-2477 holds seven outages. Widening one number left (OUT-2470 joins) returns 8, the single-number probe returns 1, and the OUT-247% prefix sweep returns 9 — the ring plus OUT-2478/OUT-2479.",
  },
  {
    id: "m07",
    difficulty: "Easy",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM dispatches WHERE crew_id = 1 AND status = 'cleared';`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM dispatches WHERE status = 'cleared';`,
      `SELECT COUNT(*) AS n FROM dispatches WHERE crew_id = 8;`,
      `SELECT COUNT(*) AS n FROM dispatches WHERE crew_id = 4 AND status = 'cleared';`,
    ],
    options: [],
    answer: 0,
    explain:
      "Mara Quinn cleared EXACTLY 20. The mutants count every cleared dispatch (83), crew 8's book (0 — the dark crew) and Dario Voss's 11.",
  },
  {
    id: "m08",
    difficulty: "Easy",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM readings WHERE meter_id = 1;`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM readings;`,
      `SELECT COUNT(*) AS n FROM readings WHERE meter_id = 35;`,
      `SELECT COUNT(*) AS n FROM readings WHERE meter_id = 2;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The smelter's telemetry is exactly 100 readings. The mutants count all telemetry (182), meter 35's book (0 — it went idle) and meter 2's two June rows.",
  },
  {
    id: "m09",
    difficulty: "Easy",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 300;`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 299;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts <= 300;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts > 300;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Two restorations sit EXACTLY on the 300-second line (OUT-2417 and OUT-2481). Exactly 299 catches the lone OUT-2484, <= 300 is the full momentary seven, and > 300 is the sustained 85.",
  },
  {
    id: "m10",
    difficulty: "Easy",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT utility_id, COUNT(*) AS n FROM outages GROUP BY utility_id ORDER BY n DESC, utility_id ASC;`,
    mutantQueries: [
      `SELECT substation_id, COUNT(*) AS n FROM outages GROUP BY substation_id ORDER BY n DESC, substation_id ASC;`,
      `SELECT cause, COUNT(*) AS n FROM outages GROUP BY cause ORDER BY n DESC, cause ASC;`,
      `SELECT tariff, COUNT(*) AS n FROM meters GROUP BY tariff ORDER BY n DESC, tariff ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Cascadia leads the utility board with 30. The mutants group by substation (Dogwood 15 leads), by cause (storm 23 leads) and by tariff (residential 20 leads).",
  },
  {
    id: "m11",
    difficulty: "Easy",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT SUM(customers_served) AS n FROM substations;`,
    mutantQueries: [
      `SELECT SUM(customers_affected) AS n FROM outages;`,
      `SELECT COUNT(*) AS n FROM substations;`,
      `SELECT SUM(kwh_billed) AS n FROM bills WHERE meter_id = 1;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The grid serves 3990000 customers across twelve substations. The mutants sum the affected-customer moments (202533), count the substations (12) and sum Aurora's kWh (1800000).",
  },
  {
    id: "m12",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM outages WHERE status = 'active';`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored';`,
      `SELECT COUNT(*) AS n FROM outages o WHERE o.status = 'active' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id);`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'active' AND customers_affected > 5000;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Five outages are live. The mutants count the 90 restored, the two live ones with NO crew (the leak 44 and ring row 77), and the live ones over 5000 affected (just the leak's 9800).",
  },
  {
    id: "m13",
    difficulty: "Easy",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM bills WHERE period = '2026-06';`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM bills WHERE period = '2026-04';`,
      `SELECT COUNT(*) AS n FROM bills WHERE status = 'delinquent';`,
      `SELECT COUNT(*) AS n FROM bills WHERE status = 'paid';`,
    ],
    options: [],
    answer: 0,
    explain:
      "The live period carries 34 bills (meter 35 went idle before it, meter 36 is disconnected). The mutants count April's 35, the six delinquents and the 62 settled bills.",
  },

  // ---- Easy concept (m14-m20)
  {
    id: "m14",
    difficulty: "Easy",
    company: "NextEra Energy",
    kind: "concept",
    prompt: "In the outages table, a row with restored_ts = NULL means:",
    options: [
      "the outage is still active — it has not been restored yet",
      "the restoration time was not recorded, but the outage is over",
      "the outage is momentary and needs no timestamp",
      "the row is a duplicate and should be ignored",
    ],
    answer: 0,
    explain:
      "restored_ts is NULL exactly while status = 'active'. Five rows live in that state — and two of them (the leak 44 and ring row 77) have no dispatch at all.",
  },
  {
    id: "m15",
    difficulty: "Easy",
    company: "Duke Energy",
    kind: "concept",
    prompt: "Which column holds the price a bill was ACTUALLY priced at?",
    options: [
      "bills.rate_cents — the snapshot taken at issuance",
      "meters.rate_cents — today's price",
      "bills.amount_cents divided by kwh_billed, always",
      "substations has the authoritative rate",
    ],
    answer: 0,
    explain:
      "bills.rate_cents is the snapshot at issuance; meters.rate_cents is the CURRENT price. They disagree on exactly three bills — the drift trio — and bill 35 was PAID at its stale rate.",
  },
  {
    id: "m16",
    difficulty: "Easy",
    company: "Schneider Electric",
    kind: "concept",
    prompt: "A 'momentary' in this pack is:",
    options: [
      "a restoration lasting at most 300 seconds",
      "any outage under one hour",
      "an outage with no crew assigned",
      "an outage that affects fewer than 100 customers",
    ],
    answer: 0,
    explain:
      "The regulatory line is duration <= 300s. Seven restored rows qualify — and two sit EXACTLY on the line, which is why the inclusive and strict counts disagree (7 vs 5).",
  },
  {
    id: "m17",
    difficulty: "Easy",
    company: "Cascadia Power",
    kind: "concept",
    prompt: "How do you find the utility that owns a meter?",
    options: [
      "meter -> substation -> utility (two hops; meters carry no utility_id)",
      "meters.utility_id directly",
      "bills.utility_id directly",
      "you cannot — the schema never links them",
    ],
    answer: 0,
    explain:
      "The meters table carries substation_id only; the utility lives on the substation. Every meter-to-utility question is a 2-hop join — a deliberate grain lesson.",
  },
  {
    id: "m18",
    difficulty: "Easy",
    company: "Columbia Rim Energy",
    kind: "concept",
    prompt: "The storm ring occupies which contiguous block?",
    options: [
      "OUT-2471 .. OUT-2477",
      "OUT-2401 .. OUT-2407",
      "OUT-2444 .. OUT-2450",
      "OUT-2490 .. OUT-2495",
    ],
    answer: 0,
    explain:
      "Seven contiguous numbers, one March night (2026-03-14), all storm, all Cascadia — five restored with clocks averaging exactly 38/230 minutes, two still active.",
  },
  {
    id: "m19",
    difficulty: "Easy",
    company: "National Grid",
    kind: "concept",
    prompt: "Crew 8 (Simeon Okoye, Saltchuck) has how many dispatches?",
    options: [
      "0 — the dark crew, visible only via LEFT JOIN",
      "20 — the busiest crew",
      "11 — mid-board",
      "3 — a light book",
    ],
    answer: 0,
    explain:
      "Crew 8 was never dispatched. An INNER JOIN to dispatches erases his row entirely; the LEFT JOIN board keeps the honest zero. Mara Quinn (crew 1) cleared EXACTLY 20.",
  },
  {
    id: "m20",
    difficulty: "Easy",
    company: "NextEra Energy",
    kind: "concept",
    prompt: "How many outages started in February 2026?",
    options: [
      "0 — the calendar spine keeps the empty month visible",
      "13 — a normal winter month",
      "22 — the peak month (that is March)",
      "February is not in the data range",
    ],
    answer: 0,
    explain:
      "February holds zero outages. The pack's calendar spine (a months CTE LEFT JOINed to outages) keeps that honest zero as a printed row instead of letting the month vanish.",
  },

  // ---------------------------------------------------------------- Medium 20
  {
    id: "m21",
    difficulty: "Medium",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT m.tariff, SUM(b.amount_cents) AS amt FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.meter_id <> 1 GROUP BY m.tariff ORDER BY amt DESC, m.tariff ASC;`,
    mutantQueries: [
      `SELECT m.tariff, SUM(b.amount_cents) AS amt FROM bills b JOIN meters m ON m.meter_id = b.meter_id GROUP BY m.tariff ORDER BY amt DESC, m.tariff ASC;`,
      `SELECT m.tariff, SUM(b.amount_cents) AS amt FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.meter_id = 1 GROUP BY m.tariff ORDER BY amt DESC, m.tariff ASC;`,
      `SELECT m.tariff, SUM(b.amount_cents) AS amt FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.meter_id <> 1 GROUP BY m.tariff ORDER BY amt ASC, m.tariff ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Ex-whale the board flips: commercial 5897214 leads industrial 3770820. The mutants restore the whale (industrial 18170820 leads), isolate Aurora alone (14400000) and reverse the order.",
  },
  {
    id: "m22",
    difficulty: "Medium",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT SUM(CASE WHEN restored_ts - started_ts <= 300 THEN 1 ELSE 0 END) AS incl, SUM(CASE WHEN restored_ts - started_ts < 300 THEN 1 ELSE 0 END) AS strict FROM outages WHERE status = 'restored';`,
    mutantQueries: [
      `SELECT SUM(CASE WHEN restored_ts - started_ts <= 240 THEN 1 ELSE 0 END) AS incl, SUM(CASE WHEN restored_ts - started_ts < 240 THEN 1 ELSE 0 END) AS strict FROM outages WHERE status = 'restored';`,
      `SELECT SUM(CASE WHEN restored_ts - started_ts <= 60 THEN 1 ELSE 0 END) AS incl, SUM(CASE WHEN restored_ts - started_ts < 60 THEN 1 ELSE 0 END) AS strict FROM outages WHERE status = 'restored';`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts > 300;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The 5-minute wall reads 7 inclusive vs 5 strict — the two EXACTLY-on-300 rows are the difference. At 240 the wall reads 4 vs 3, at 60 it is 1 vs 0, and the sustained side is a lone 85.",
  },
  {
    id: "m23",
    difficulty: "Medium",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT SUM(CASE WHEN arrived_ts - dispatched_ts >= 3600 THEN 1 ELSE 0 END) AS incl, SUM(CASE WHEN arrived_ts - dispatched_ts > 3600 THEN 1 ELSE 0 END) AS strict FROM dispatches WHERE arrived_ts IS NOT NULL;`,
    mutantQueries: [
      `SELECT SUM(CASE WHEN arrived_ts - dispatched_ts >= 2700 THEN 1 ELSE 0 END) AS incl, SUM(CASE WHEN arrived_ts - dispatched_ts > 2700 THEN 1 ELSE 0 END) AS strict FROM dispatches WHERE arrived_ts IS NOT NULL;`,
      `SELECT COUNT(*) AS n FROM dispatches WHERE arrived_ts IS NULL;`,
      `SELECT COUNT(*) AS n FROM dispatches WHERE arrived_ts IS NOT NULL;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The SLA wall reads 1 vs 0 — dispatch 28 arrives EXACTLY on the 3600 line. At 2700 the wall is 2 vs 1, one arrival is still NULL (enroute), and 85 dispatches have clocks.",
  },
  {
    id: "m24",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT meter_id, SUM(amount_cents) AS balance FROM bills WHERE status <> 'paid' GROUP BY meter_id HAVING SUM(amount_cents) >= 500000 ORDER BY balance DESC, meter_id ASC;`,
    mutantQueries: [
      `SELECT meter_id, SUM(amount_cents) AS balance FROM bills WHERE status <> 'paid' GROUP BY meter_id HAVING SUM(amount_cents) > 500000 ORDER BY balance DESC, meter_id ASC;`,
      `SELECT meter_id, SUM(amount_cents) AS balance FROM bills WHERE status = 'delinquent' GROUP BY meter_id HAVING SUM(amount_cents) >= 200000 ORDER BY balance DESC, meter_id ASC;`,
      `SELECT meter_id, SUM(amount_cents) AS balance FROM bills WHERE status <> 'paid' GROUP BY meter_id HAVING SUM(amount_cents) >= 1000000 ORDER BY balance DESC, meter_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The ladder at >= 500000 holds three meters: m14 889740, m11 500000, m16 500000. Strict > keeps only m14, the delinquent-only view is a different trio at 450000/330000/240000, and a million-cent line catches nobody.",
  },
  {
    id: "m25",
    difficulty: "Medium",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT b.bill_id, b.meter_id, b.period, b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.rate_cents <> m.rate_cents ORDER BY b.bill_id ASC;`,
    mutantQueries: [
      `SELECT b.bill_id, b.meter_id, b.period, b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.rate_cents = m.rate_cents AND b.period = '2026-06' ORDER BY b.bill_id ASC;`,
      `SELECT b.bill_id, b.meter_id, b.period, b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.rate_cents <> m.rate_cents AND b.period = '2026-05' ORDER BY b.bill_id ASC;`,
      `SELECT b.bill_id, b.meter_id, b.period, b.rate_cents AS bill_rate, m.rate_cents AS meter_rate, b.status FROM bills b JOIN meters m ON m.meter_id = b.meter_id WHERE b.rate_cents <> m.rate_cents AND b.status = 'paid' ORDER BY b.bill_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Three bills drift from today's rates: bill 35 (m12, 10 vs 11, PAID anyway), bill 59 (m20, 10 vs 12, issued), bill 81 (m27, 12 vs 15, issued). The mutants keep June's agreeing bills (34), May's drift pair only, or the paid one alone.",
  },
  {
    id: "m26",
    difficulty: "Medium",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS n FROM crews c LEFT JOIN dispatches d ON d.crew_id = c.crew_id AND d.status = 'cleared' GROUP BY c.crew_id, c.name ORDER BY n DESC, c.crew_id ASC;`,
    mutantQueries: [
      `SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS n FROM crews c LEFT JOIN dispatches d ON d.crew_id = c.crew_id AND d.status = 'cleared' GROUP BY c.crew_id, c.name ORDER BY n ASC, c.crew_id ASC;`,
      `SELECT c.crew_id, c.name, COUNT(d.dispatch_id) AS n FROM crews c JOIN dispatches d ON d.crew_id = c.crew_id AND d.status = 'cleared' GROUP BY c.crew_id, c.name ORDER BY n DESC, c.crew_id ASC;`,
      `SELECT c.crew_id, COUNT(d.dispatch_id) AS n FROM crews c LEFT JOIN dispatches d ON d.crew_id = c.crew_id AND d.status IN ('onsite', 'enroute') GROUP BY c.crew_id HAVING n > 0 ORDER BY n ASC, c.crew_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The cleared board opens with Mara Quinn at 20. The mutants reverse it (crew 8's honest zero first), INNER-JOIN away the dark crew entirely, or count only the live rows (three crews carry one each).",
  },
  {
    id: "m27",
    difficulty: "Medium",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS n FROM (SELECT read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts FROM readings WHERE meter_id = 1) WHERE prev_ts IS NULL OR read_ts - prev_ts > 1800;`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM (SELECT read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts FROM readings WHERE meter_id = 1) WHERE prev_ts IS NULL OR read_ts - prev_ts >= 1800;`,
      `SELECT COUNT(*) AS n FROM readings WHERE meter_id = 1;`,
      `SELECT COUNT(*) AS n FROM readings;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Strict sessionization (gap > 1800 splits) finds 7 sessions on meter 1. The inclusive edge moves the boundary gap into a split and finds 8; the raw counts are 100 and 182.",
  },
  {
    id: "m28",
    difficulty: "Medium",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT GROUP_CONCAT(outage_number) AS r FROM (SELECT outage_number FROM outages WHERE outage_id BETWEEN 71 AND 77 ORDER BY outage_id);`,
    mutantQueries: [
      `SELECT GROUP_CONCAT(outage_id) AS r FROM (SELECT outage_id FROM outages WHERE outage_id BETWEEN 71 AND 77 ORDER BY outage_id);`,
      `SELECT GROUP_CONCAT(outage_number) AS r FROM (SELECT outage_number FROM outages WHERE outage_id BETWEEN 71 AND 77 ORDER BY outage_id DESC);`,
      `SELECT GROUP_CONCAT(outage_number) AS r FROM (SELECT outage_number FROM outages WHERE outage_id BETWEEN 71 AND 76 ORDER BY outage_id);`,
    ],
    options: [],
    answer: 0,
    explain:
      "The registry prints OUT-2471 through OUT-2477 in order — contiguity you can read. The mutants print bare ids, reverse the order, or stop one row short of the ring's full seven.",
  },
  {
    id: "m29",
    difficulty: "Medium",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT a.outage_id AS a_id, b.outage_id AS b_id, b.started_ts - a.started_ts AS gap FROM outages a JOIN outages b ON b.substation_id = a.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts <= 240 ORDER BY gap ASC, a_id ASC;`,
    mutantQueries: [
      `SELECT a.outage_id AS a_id, b.outage_id AS b_id, b.started_ts - a.started_ts AS gap FROM outages a JOIN outages b ON b.substation_id = a.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts < 240 ORDER BY gap ASC, a_id ASC;`,
      `SELECT a.outage_id AS a_id, b.outage_id AS b_id, b.started_ts - a.started_ts AS gap FROM outages a JOIN outages b ON b.substation_id = a.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts < 180 ORDER BY gap ASC, a_id ASC;`,
      `SELECT a.outage_id AS a_id, b.outage_id AS b_id, b.started_ts - a.started_ts AS gap FROM outages a JOIN outages b ON b.substation_id = a.substation_id AND b.started_ts > a.started_ts WHERE b.started_ts - a.started_ts <= 240 ORDER BY gap DESC, a_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Two flicker pairs: Fir's 50-51 at 180s and Hawthorne's 65-66 EXACTLY on the 240 line. Strict < 240 keeps only the 180s pair, < 180 keeps none, and ordering DESC puts the 240 pair first.",
  },
  {
    id: "m30",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT cause, SUM(customers_affected) AS amt FROM outages GROUP BY cause ORDER BY amt DESC, cause ASC;`,
    mutantQueries: [
      `SELECT cause, SUM(customers_affected) AS amt FROM outages WHERE outage_id <> 5 GROUP BY cause ORDER BY amt DESC, cause ASC;`,
      `SELECT cause, COUNT(*) AS n FROM outages GROUP BY cause ORDER BY n DESC, cause ASC;`,
      `SELECT utility_id, SUM(customers_affected) AS amt FROM outages GROUP BY utility_id ORDER BY amt DESC, utility_id ASC;`,
    ],
    options:[],
    answer: 0,
    explain:
      "Storm leads the cause board with 95184 affected moments. The mutants exclude the king (equipment 49157 takes over), count events instead of customers (storm still leads with 23), or cut by utility (Cascadia 100800).",
  },
  {
    id: "m31",
    difficulty: "Medium",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT outage_id, outage_number, substation_id FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 300 ORDER BY outage_id ASC;`,
    mutantQueries: [
      `SELECT outage_id, outage_number, substation_id FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 299 ORDER BY outage_id ASC;`,
      `SELECT outage_id, outage_number, substation_id FROM outages WHERE status = 'restored' AND restored_ts - started_ts = 301 ORDER BY outage_id ASC;`,
      `SELECT COUNT(*) AS n FROM outages WHERE status = 'restored' AND restored_ts - started_ts >= 300;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Exactly two rows sit on the 300 line: OUT-2417 (Basalt) and OUT-2481 (Juniper). OUT-2484 sits at 299, nothing at 301, and 85 rows are at-or-over the line.",
  },
  {
    id: "m32",
    difficulty: "Medium",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT (SELECT outage_number FROM outages ORDER BY customers_affected DESC LIMIT 1) AS king, (SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) AS ka, SUM(customers_affected) AS total, ROUND((SELECT customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1) * 100.0 / SUM(customers_affected), 2) AS share FROM outages;`,
    mutantQueries: [
      `SELECT SUM(customers_affected) AS n FROM outages WHERE outage_id <> 5;`,
      `SELECT outage_number, customers_affected FROM outages ORDER BY customers_affected DESC LIMIT 1 OFFSET 1;`,
      `SELECT SUM(customers_affected) AS n FROM outages WHERE status = 'restored';`,
    ],
    options: [],
    answer: 0,
    explain:
      "The king dossier: OUT-2405, 62000 affected, 202533 total, 30.61%. The mutants print the ex-king total (140533), the runner-up (OUT-2440's 9000 on outage 40), and the restored-only total.",
  },
  {
    id: "m33",
    difficulty: "Medium",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT status, COUNT(*) AS n FROM bills GROUP BY status ORDER BY n DESC, status ASC;`,
    mutantQueries: [
      `SELECT status, COUNT(*) AS n FROM outages GROUP BY status ORDER BY n DESC, status ASC;`,
      `SELECT status, COUNT(*) AS n FROM dispatches GROUP BY status ORDER BY n DESC, status ASC;`,
      `SELECT period, COUNT(*) AS n FROM bills GROUP BY period ORDER BY n DESC, period ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The bill census: paid 62, issued 36, delinquent 6. The mutants census outages (restored 90), dispatches (cleared 83) and billing periods (April 35).",
  },
  {
    id: "m34",
    difficulty: "Medium",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT substation_id, COUNT(*) AS n FROM outages GROUP BY substation_id ORDER BY substation_id ASC;`,
    mutantQueries: [
      `SELECT substation_id, COUNT(*) AS n FROM outages GROUP BY substation_id ORDER BY n DESC, substation_id ASC;`,
      `SELECT s.substation_id, COUNT(o.outage_id) AS n FROM substations s LEFT JOIN outages o ON o.substation_id = s.substation_id GROUP BY s.substation_id ORDER BY s.substation_id ASC;`,
      `SELECT substation_id, COUNT(*) AS n FROM outages WHERE status = 'active' GROUP BY substation_id ORDER BY substation_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The raw GROUP BY prints 11 rows — Cedar (s3) has no outages and vanishes. The mutants sort by count (Dogwood 15 first), LEFT JOIN to keep all 12 substations (Cedar's honest 0 included), and count only the five active rows.",
  },

  // ---- Medium concept (m35-m40)
  {
    id: "m35",
    difficulty: "Medium",
    company: "Cascadia Power",
    kind: "concept",
    prompt: "Nine outages have MORE than 4200 customers affected; two sit EXACTLY at 4200. What does DENSE_RANK give the pair?",
    options: [
      "10 and 10 — no gap after a tie",
      "10 and 11 — one row each",
      "11 and 11 — ties get the next number",
      "9 and 9 — ties inherit the count above",
    ],
    answer: 0,
    explain:
      "Both 4200 rows share rank 10 (nine rows above them). RANK jumps to 12 next; DENSE_RANK gives the next distinct value 11. The pair itself is 10,10 under both — the registries diverge on what follows.",
  },
  {
    id: "m36",
    difficulty: "Medium",
    company: "Columbia Rim Energy",
    kind: "concept",
    prompt: "Exclude Aurora Alloys (meter 1) and which tariff leads the billing board?",
    options: [
      "commercial (5897214)",
      "industrial (3770820)",
      "residential (715716)",
      "industrial still leads — the whale is only 20% of the ledger",
    ],
    answer: 0,
    explain:
      "The whale IS industrial's lead: 14400000 of its 18170820. Take it away and industrial falls to 3770820 — commercial's 5897214 takes the crown. A 58.1% whale flips the whole board.",
  },
  {
    id: "m37",
    difficulty: "Medium",
    company: "National Grid",
    kind: "concept",
    prompt: "Seven restored outages have NO dispatch row. What are they?",
    options: [
      "momentaries cleared by auto-reclose — no crew ever needed",
      "data errors that should be deleted",
      "outages assigned to crews that were never recorded",
      "the active pipeline waiting for assignment",
    ],
    answer: 0,
    explain:
      "Every one of the seven crew-less restorations is a momentary (durations 60-300s) — the automation's signature. The dispatch desk's audit query uses NOT EXISTS, and the two 300s rows sit exactly on the regulatory line.",
  },
  {
    id: "m38",
    difficulty: "Medium",
    company: "NextEra Energy",
    kind: "concept",
    prompt: "Why do the momentary counts read 7 inclusive vs 5 strict?",
    options: [
      "two restorations last EXACTLY 300 seconds",
      "two restorations last EXACTLY 299 seconds",
      "five outages are still active with no duration",
      "the strict count excludes storm-caused momentaries",
    ],
    answer: 0,
    explain:
      "OUT-2417 and OUT-2481 sit EXACTLY on the 300-second line. <= 300 catches them (7), < 300 drops them (5). The lone 299 (OUT-2484) is momentary under both edges.",
  },
  {
    id: "m39",
    difficulty: "Medium",
    company: "Duke Energy",
    kind: "concept",
    prompt: "Dispatch 28 arrives EXACTLY 3600s after dispatch. What do the SLA counts read?",
    options: [
      ">= 3600 catches 1, > 3600 catches 0",
      ">= 3600 catches 0, > 3600 catches 1",
      "both catch 1 — the edge never matters",
      "both catch 2 — the enroute row counts too",
    ],
    answer: 0,
    explain:
      "The boundary row is the whole story: inclusive sees it, strict misses it. The enroute dispatch has arrived_ts NULL and enters neither count — clocks only exist after arrival.",
  },
  {
    id: "m40",
    difficulty: "Medium",
    company: "Schneider Electric",
    kind: "concept",
    prompt: "Meter 1's telemetry has exactly ONE gap of 1800s. Why do strict and inclusive session counts differ?",
    options: [
      "the boundary gap splits only when the rule is gap >= 1800 (7 vs 8)",
      "the boundary gap splits only when the rule is gap > 1800 (8 vs 7)",
      "the day boundaries already split everything, so both read 7",
      "the 900s within-day gaps also cross the cutoff",
    ],
    answer: 0,
    explain:
      "Within-day gaps are 900s (never split), day boundaries are huge (always split) — the 1800s gap is the only knife-edge. Strict (> 1800) keeps it inside a session: 7. Inclusive (>= 1800) splits it: 8.",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "m41",
    difficulty: "Hard",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT outage_id, customers_affected, RANK() OVER (ORDER BY customers_affected DESC) AS rk, DENSE_RANK() OVER (ORDER BY customers_affected DESC) AS dr FROM outages WHERE customers_affected >= 4200 ORDER BY customers_affected DESC, outage_id ASC;`,
    mutantQueries: [
      `SELECT outage_id, customers_affected, RANK() OVER (ORDER BY customers_affected DESC) AS rk, DENSE_RANK() OVER (ORDER BY customers_affected DESC) AS dr FROM outages WHERE customers_affected >= 4200 ORDER BY customers_affected ASC, outage_id ASC;`,
      `SELECT outage_id, customers_affected, RANK() OVER (ORDER BY customers_affected DESC) AS rk, DENSE_RANK() OVER (ORDER BY customers_affected DESC) AS dr FROM outages WHERE customers_affected = 4200 ORDER BY outage_id ASC;`,
      `SELECT COUNT(*) AS n FROM outages WHERE customers_affected > 4200;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Eleven rows at or over 4200, king first (5 · 62000 · 1 · 1). The mutants reverse the order (the 4200 pair leads), isolate the pair (rank 10,10 / dense 10,10), or just count the nine above.",
  },
  {
    id: "m42",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT SUM(CASE WHEN cause = 'storm' THEN customers_affected ELSE 0 END) AS st, SUM(CASE WHEN cause = 'storm' AND outage_id <> 5 THEN customers_affected ELSE 0 END) AS sek, SUM(CASE WHEN cause = 'equipment' THEN customers_affected ELSE 0 END) AS et, (SELECT cause FROM outages WHERE outage_id <> 5 GROUP BY cause ORDER BY SUM(customers_affected) DESC LIMIT 1) AS leader FROM outages;`,
    mutantQueries: [
      `SELECT SUM(CASE WHEN cause = 'storm' AND outage_id <> 5 THEN customers_affected ELSE 0 END) AS n FROM outages;`,
      `SELECT (SELECT cause FROM outages GROUP BY cause ORDER BY SUM(customers_affected) DESC LIMIT 1) AS leader;`,
      `SELECT SUM(customers_affected) AS n FROM outages WHERE cause = 'storm' AND status = 'active';`,
    ],
    options: [],
    answer: 0,
    explain:
      "The flip dossier: storm 95184, storm-ex-king 33184, equipment 49157, leader 'equipment'. The mutants print the ex-king storm total alone, the WITH-king leader ('storm'), and the active storm moments (2400).",
  },
  {
    id: "m43",
    difficulty: "Hard",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `WITH gaps AS (SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap FROM readings WHERE meter_id = 1) SELECT (SELECT COUNT(*) FROM readings WHERE meter_id = 1) AS rc, (SELECT COUNT(*) FROM gaps WHERE gap = 1800) AS bg, 1 + (SELECT COUNT(*) FROM gaps WHERE gap > 1800) AS ss, 1 + (SELECT COUNT(*) FROM gaps WHERE gap >= 1800) AS si;`,
    mutantQueries: [
      `SELECT COUNT(*) AS n FROM (SELECT read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS p FROM readings WHERE meter_id = 1) WHERE p IS NULL OR read_ts - p >= 1800;`,
      `SELECT COUNT(*) AS n FROM readings WHERE meter_id = 1;`,
      `SELECT COUNT(*) AS n FROM (SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap FROM readings WHERE meter_id = 1) WHERE gap > 1800;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The wall row: 100 readings, 1 boundary gap, 7 strict sessions, 8 inclusive. The mutants isolate the inclusive count (8), the raw reading count (100), and the day-sized gap count (6).",
  },
  {
    id: "m44",
    difficulty: "Hard",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT c.crew_id, c.name, COUNT(*) AS n, ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_min FROM dispatches d JOIN crews c ON c.crew_id = d.crew_id WHERE d.status = 'cleared' GROUP BY c.crew_id, c.name HAVING COUNT(*) >= 10 ORDER BY n DESC, c.crew_id ASC;`,
    mutantQueries: [
      `SELECT c.crew_id, c.name, COUNT(*) AS n, ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_min FROM dispatches d JOIN crews c ON c.crew_id = d.crew_id WHERE d.status = 'cleared' GROUP BY c.crew_id, c.name HAVING COUNT(*) >= 15 ORDER BY n DESC, c.crew_id ASC;`,
      `SELECT COUNT(*) AS n FROM (SELECT crew_id FROM dispatches WHERE status = 'cleared' GROUP BY crew_id HAVING COUNT(*) >= 10);`,
      `SELECT c.crew_id, c.name, COUNT(*) AS n, ROUND(AVG(d.arrived_ts - d.dispatched_ts) / 60.0, 1) AS avg_min FROM dispatches d JOIN crews c ON c.crew_id = d.crew_id WHERE d.status = 'cleared' GROUP BY c.crew_id, c.name HAVING COUNT(*) >= 10 ORDER BY avg_min DESC, c.crew_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Six crews clear ten or more, Mara Quinn leading at 20 (28.0-min average). The mutants raise the bar to 15 (Mara alone), count the qualifying crews (6), or re-rank by average response.",
  },
  {
    id: "m45",
    difficulty: "Hard",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT u.utility_id, u.code, COUNT(o.outage_id) AS oc, SUM(o.customers_affected) AS at, ROUND(SUM(o.customers_affected) * 1000.0 / (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id), 2) AS intensity FROM utilities u LEFT JOIN outages o ON o.utility_id = u.utility_id GROUP BY u.utility_id, u.code ORDER BY intensity DESC;`,
    mutantQueries: [
      `SELECT u.utility_id, u.code, COUNT(o.outage_id) AS oc, SUM(o.customers_affected) AS at, ROUND(SUM(o.customers_affected) * 1000.0 / (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id), 2) AS intensity FROM utilities u LEFT JOIN outages o ON o.utility_id = u.utility_id GROUP BY u.utility_id, u.code ORDER BY at DESC;`,
      `SELECT u.utility_id, u.code, COUNT(o.outage_id) AS oc, SUM(o.customers_affected) AS at, ROUND(SUM(o.customers_affected) * 1000.0 / (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id), 2) AS intensity FROM utilities u LEFT JOIN outages o ON o.utility_id = u.utility_id GROUP BY u.utility_id, u.code ORDER BY intensity ASC;`,
      `SELECT COUNT(*) AS n FROM utilities u WHERE (SELECT SUM(o.customers_affected) FROM outages o WHERE o.utility_id = u.utility_id) * 1000.0 / (SELECT SUM(s.customers_served) FROM substations s WHERE s.utility_id = u.utility_id) > 50;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Intensity ranks Columbia Rim first (82.64) on half of Cascadia's outages. The mutants rank by raw affected (Cascadia 100800 first), reverse the board (Bluewater 12.21 last), or count the utilities over 50 (three).",
  },
  {
    id: "m46",
    difficulty: "Hard",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT COUNT(*) AS bc, SUM(kwh_billed) AS kt, SUM(amount_cents) AS at, ROUND(AVG(rate_cents), 0) AS ar, ROUND(SUM(amount_cents) * 100.0 / (SELECT SUM(amount_cents) FROM bills), 1) AS share FROM bills WHERE meter_id = 1;`,
    mutantQueries: [
      `SELECT COUNT(*) AS bc, SUM(kwh_billed) AS kt, SUM(amount_cents) AS at FROM bills WHERE meter_id = 1;`,
      `SELECT COUNT(*) AS bc, SUM(kwh_billed) AS kt, SUM(amount_cents) AS at, ROUND(AVG(rate_cents), 0) AS ar, ROUND(SUM(amount_cents) * 100.0 / (SELECT SUM(amount_cents) FROM bills), 1) AS share FROM bills;`,
      `SELECT SUM(amount_cents) AS n FROM bills WHERE meter_id = 1 AND period = '2026-06';`,
    ],
    options: [],
    answer: 0,
    explain:
      "The whale end-to-end: 3 bills, 1800000 kWh, 14400000 cents, rate 8, 58.1% of the ledger. The mutants drop the share columns, drop the meter filter (the whole ledger), or take only June's 4800000 slice.",
  },
  {
    id: "m47",
    difficulty: "Hard",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT meter_id, prev_ts, read_ts AS next_ts, read_ts - prev_ts AS gap FROM (SELECT meter_id, read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts FROM readings WHERE meter_id = 1) WHERE read_ts - prev_ts = 1800;`,
    mutantQueries: [
      `SELECT meter_id, prev_ts, read_ts AS next_ts, read_ts - prev_ts AS gap FROM (SELECT meter_id, read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts FROM readings WHERE meter_id = 1) WHERE read_ts - prev_ts > 1800;`,
      `SELECT meter_id, prev_ts, read_ts AS next_ts, read_ts - prev_ts AS gap FROM (SELECT meter_id, read_ts, LAG(read_ts) OVER (ORDER BY read_ts) AS prev_ts FROM readings WHERE meter_id = 1) WHERE read_ts - prev_ts >= 1800 ORDER BY gap DESC LIMIT 1;`,
      `SELECT COUNT(*) AS n FROM (SELECT read_ts - LAG(read_ts) OVER (ORDER BY read_ts) AS gap FROM readings WHERE meter_id = 1) WHERE gap > 1800;`,
    ],
    options: [],
    answer: 0,
    explain:
      "One row: meter 1, the pair one 1800-second knife-edge apart. The mutants jump to the six day-sized gaps, take the biggest gap (a day boundary), or count the gaps over the line (6).",
  },
  {
    id: "m48",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT o.outage_id, o.outage_number, o.restored_ts - o.started_ts AS duration FROM outages o WHERE o.status = 'restored' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id) ORDER BY duration ASC, o.outage_id ASC;`,
    mutantQueries: [
      `SELECT o.outage_id, o.outage_number, o.restored_ts - o.started_ts AS duration FROM outages o WHERE o.status = 'restored' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id) AND o.restored_ts - o.started_ts >= 300 ORDER BY duration ASC, o.outage_id ASC;`,
      `SELECT COUNT(*) AS n FROM outages o WHERE o.status = 'restored' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id);`,
      `SELECT o.outage_id, o.outage_number FROM outages o WHERE o.status = 'active' AND NOT EXISTS (SELECT 1 FROM dispatches d WHERE d.outage_id = o.outage_id) ORDER BY o.outage_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "Seven auto-reclose rows, shortest first (60s). The mutants keep only the at-or-over-300 pair (both EXACTLY on the line), count the seven, or switch to the two live crew-less outages (44 and 77).",
  },
  {
    id: "m49",
    difficulty: "Hard",
    company: "National Grid",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT SUM(amount_cents) AS billed, SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS collected, SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) AS outstanding, ROUND(SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 2) AS share FROM bills;`,
    mutantQueries: [
      `SELECT SUM(amount_cents) AS n FROM bills;`,
      `SELECT SUM(CASE WHEN status <> 'paid' THEN amount_cents ELSE 0 END) AS n FROM bills;`,
      `SELECT SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS n FROM bills;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The ladder: 24783750 billed, 19946936 collected, 4836814 outstanding, 19.52%. The mutants isolate each rung — the full ledger, the outstanding block, the collected block.",
  },
  {
    id: "m50",
    difficulty: "Hard",
    company: "NextEra Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT period, SUM(amount_cents) AS period_billed, SUM(SUM(amount_cents)) OVER (ORDER BY period) AS running FROM bills GROUP BY period ORDER BY period ASC;`,
    mutantQueries: [
      `SELECT period, SUM(amount_cents) AS period_billed FROM bills GROUP BY period ORDER BY period ASC;`,
      `SELECT period, SUM(amount_cents) AS period_billed, SUM(SUM(amount_cents)) OVER (ORDER BY period DESC) AS running FROM bills GROUP BY period ORDER BY period ASC;`,
      `SELECT meter_id, SUM(amount_cents) AS total, SUM(SUM(amount_cents)) OVER (ORDER BY meter_id) AS running FROM bills GROUP BY meter_id ORDER BY meter_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The billing curve: April 8550758, May 8212786, June 8020206, running ends at 24783750. The mutants drop the window (period totals only), run it backwards (June starts at the full ledger), or re-grain by meter (Aurora's 14400000 leads).",
  },
  {
    id: "m51",
    difficulty: "Hard",
    company: "Duke Energy",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT s.substation_id, s.name, COUNT(o.outage_id) AS oc, SUM(CASE WHEN o.status = 'restored' AND o.restored_ts - o.started_ts <= 300 THEN 1 ELSE 0 END) AS mc FROM substations s LEFT JOIN outages o ON o.substation_id = s.substation_id GROUP BY s.substation_id, s.name ORDER BY s.substation_id ASC;`,
    mutantQueries: [
      `SELECT s.substation_id, s.name, COUNT(o.outage_id) AS oc, SUM(CASE WHEN o.status = 'restored' AND o.restored_ts - o.started_ts <= 300 THEN 1 ELSE 0 END) AS mc FROM substations s LEFT JOIN outages o ON o.substation_id = s.substation_id GROUP BY s.substation_id, s.name ORDER BY oc DESC, s.substation_id ASC;`,
      `SELECT o.substation_id, COUNT(*) AS oc FROM outages o GROUP BY o.substation_id ORDER BY o.substation_id ASC;`,
      `SELECT s.substation_id, s.name, COUNT(o.outage_id) AS oc FROM substations s JOIN outages o ON o.substation_id = s.substation_id GROUP BY s.substation_id, s.name ORDER BY s.substation_id ASC;`,
    ],
    options: [],
    answer: 0,
    explain:
      "All twelve substations with counts and momentary counts — Cedar's 0 · 0 row included. The mutants rank by count (Dogwood 15 first), drop the LEFT JOIN (11 rows), or drop the momentary column.",
  },
  {
    id: "m52",
    difficulty: "Hard",
    company: "Schneider Electric",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT 4200 AS tie, (SELECT GROUP_CONCAT(outage_id) FROM (SELECT outage_id FROM outages WHERE customers_affected = 4200 ORDER BY outage_id)) AS reg, (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) AS above, (SELECT COUNT(*) FROM outages WHERE customers_affected > 4200) + 1 AS rank_pos;`,
    mutantQueries: [
      `SELECT GROUP_CONCAT(outage_id) AS reg FROM (SELECT outage_id FROM outages WHERE customers_affected >= 4200 ORDER BY outage_id);`,
      `SELECT COUNT(*) AS n FROM outages WHERE customers_affected > 5000;`,
      `SELECT COUNT(*) AS n FROM outages WHERE customers_affected = 4200;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The tie registry: 4200, ids '62,79', nine above, so the pair shares rank 10. The mutants widen the registry to all eleven (king included), count the over-5000 rows (8), or count the tie itself (2).",
  },
  {
    id: "m53",
    difficulty: "Hard",
    company: "Cascadia Power",
    kind: "output",
    prompt: "What does this query return?",
    truthQuery: `SELECT period, SUM(amount_cents) AS pb, SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS ab, ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS share FROM bills GROUP BY period ORDER BY period ASC;`,
    mutantQueries: [
      `SELECT period, SUM(amount_cents) AS pb FROM bills GROUP BY period ORDER BY period ASC;`,
      `SELECT period, SUM(amount_cents) AS pb, SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS ab, ROUND(SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) * 100.0 / SUM(amount_cents), 1) AS share FROM bills GROUP BY period ORDER BY period DESC;`,
      `SELECT SUM(CASE WHEN meter_id = 1 THEN amount_cents ELSE 0 END) AS n FROM bills;`,
    ],
    options: [],
    answer: 0,
    explain:
      "The whale per period: April 56.1%, May 58.4%, June 59.8% of shrinking totals. The mutants drop the whale columns, reverse the periods (June first), or print the whale's 14400000 total alone.",
  },

  // ---- Hard concept (m54-m60)
  {
    id: "m54",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    kind: "concept",
    prompt: "Storm leads the cause board (95184) — yet ex-king the crown moves to equipment. Why?",
    options: [
      "the king (OUT-2405, 62000) is storm's lead; without it storm has 33184 vs equipment's 49157",
      "equipment rows are systematically larger than storm rows",
      "the king is an equipment outage misfiled as storm",
      "storm rows are mostly still active and don't count",
    ],
    answer: 0,
    explain:
      "OUT-2405 alone contributes 62000 of storm's 95184. Exclude it and storm falls to 33184 while equipment's quiet 49157 (led by two planted 9000/8000 rows) takes the board — a 30.61% king flips a six-way board.",
  },
  {
    id: "m55",
    difficulty: "Hard",
    company: "National Grid",
    kind: "concept",
    prompt: "What makes outage 44 the pack's 'forgotten outage'?",
    options: [
      "active since 2026-05-28, 9800 customers, and NO dispatch row exists",
      "it was restored twice by mistake",
      "its crew arrived before the outage started",
      "it is the largest outage in the book",
    ],
    answer: 0,
    explain:
      "Five outages are active; two of them (44 and ring row 77) have no dispatch. Outage 44 has burned since May 28 with 9800 customers dark and nobody assigned — the leak-shaped row of this pack.",
  },
  {
    id: "m56",
    difficulty: "Hard",
    company: "NextEra Energy",
    kind: "concept",
    prompt: "Why must the crew board use LEFT JOIN?",
    options: [
      "crew 8 has zero dispatches and an INNER JOIN erases the row",
      "crew 1 has 20 dispatches and would double-count",
      "LEFT JOIN makes the average response faster",
      "dispatches reference outages, not crews",
    ],
    answer: 0,
    explain:
      "The board's honest zero is Simeon Okoye's empty book. INNER JOIN drops him and the board prints 7 crews — the count looks fine until you notice who is missing. Same discipline keeps Cedar (0 outages) on the substation board.",
  },
  {
    id: "m57",
    difficulty: "Hard",
    company: "Duke Energy",
    kind: "concept",
    prompt: "The disconnect ladder reads 3 meters at >= 500000 but 1 at > 500000. Which meters sit ON the line?",
    options: [
      "m11 and m16, both at EXACTLY 500000 (m14 is above at 889740)",
      "m14 and m16, both at EXACTLY 500000",
      "nobody — the line is empty",
      "m35 and m36, the dark meters",
    ],
    answer: 0,
    explain:
      "Rimrock Cold Storage (m11) and the Larch Mall partner (m16) both owe exactly 500000 — old delinquent debt plus one issued bill, their June bills paid on time. Only Bay Center-class m14 (889740) clears the line strictly.",
  },
  {
    id: "m58",
    difficulty: "Hard",
    company: "Schneider Electric",
    kind: "concept",
    prompt: "Bill 35 was PAID even though its rate drifted. What does that prove about drift detection?",
    options: [
      "drift is bill.rate_cents <> meters.rate_cents — payment status is irrelevant to detection",
      "paid bills never drift, so the audit only needs unpaid rows",
      "drift means the customer overpaid and must be refunded",
      "drift only matters for industrial tariffs",
    ],
    answer: 0,
    explain:
      "The drift trio is a pure snapshot-vs-current comparison: bill 35 (10 vs 11, paid anyway), bill 59 (10 vs 12), bill 81 (12 vs 15). Filtering by status before comparing would silently drop the paid drift — the exact audit hole the trio plants.",
  },
  {
    id: "m59",
    difficulty: "Hard",
    company: "Cascadia Power",
    kind: "concept",
    prompt: "The ring's clocks average EXACTLY 38 min response and 230 min restore. Over which rows?",
    options: [
      "the five RESTORED ring rows (and their five dispatches) only",
      "all seven ring rows, actives counting as zero",
      "all of Cascadia's March outages",
      "every storm outage in the book",
    ],
    answer: 0,
    explain:
      "OUT-2476 and OUT-2477 are still active — no restore clock, and the ring's dispatch average runs over the five restored rows' five dispatches (30/34/38/42/46 min response; 180/200/220/260/290 min restore). Averages always name their denominator.",
  },
  {
    id: "m60",
    difficulty: "Hard",
    company: "Columbia Rim Energy",
    kind: "concept",
    prompt: "Two plants tie at EXACTLY 850 MW with five plants above. What rank does the NEXT plant below get under RANK() vs DENSE_RANK()?",
    options: [
      "RANK gives 8; DENSE_RANK gives 7",
      "RANK gives 7; DENSE_RANK gives 8",
      "both give 7 — the tie does not affect followers",
      "both give 8 — the pair consumes two rank slots",
    ],
    answer: 0,
    explain:
      "Five plants above, then the 850 pair shares rank 6. RANK skips the consumed slot (next is 8); DENSE_RANK counts distinct values (next is 7). The pack's other tie (4200) behaves the same way, ten slots lower.",
  },
];
