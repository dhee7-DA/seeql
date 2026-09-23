// QA probe for enhancement #4 "Data worlds" — reseeds via /api/reset,
// checks FK integrity + world invariants, computes the field-notes (facts)
// strings for worlds-meta.ts, and prints them ready to paste.
// Run against the live dev server: node scripts/qa-worlds.mjs

const BASE = "http://localhost:3000";

async function api(path, method = "GET", body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
async function sql(query) {
  const j = await api("/api/query", "POST", { sql: query });
  if (!j.ok) throw new Error(`${query} -> ${j.error}${j.hint ? " | " + j.hint : ""}`);
  return j.rows;
}
const one = async (q) => Number((await sql(q))[0][0]);
const dec = (v) => Number(v); // Prisma wraps REAL aggregates (MIN/AVG…) in Decimal objects
const pairs = async (q) => (await sql(q)).map((r) => r.join(":"));

function money(c) {
  return c == null ? "?" : `$${(c / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
const fmtNum = (n) => n.toLocaleString("en-US");
const range = (a, b) => `${fmtNum(a)} – ${fmtNum(b)}`;
const moneyRange = (a, b) => `${money(a)} – ${money(b)}`;

let failures = 0;
function check(name, cond, detail = "") {
  if (!cond) {
    failures += 1;
    console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`);
  }
}

/* ---------------- reset + integrity ---------------- */

console.log("== reset ==");
const reset = await api("/api/reset", "POST");
check("reset ok", reset.ok, JSON.stringify(reset).slice(0, 200));
console.log("counts:", JSON.stringify(reset.counts));

console.log("== foreign_key_check (must be empty) ==");
const fkViolations = await sql("PRAGMA foreign_key_check");
check("no FK violations", fkViolations.length === 0, `${fkViolations.length} rows`);

/* ---------------- med ---------------- */

console.log("== med ==");
check("med visits reference patients/doctors", true); // covered by foreign_key_check
{
  const stillAdmitted = await one(`SELECT COUNT(*) FROM patients WHERE discharged_at IS NULL`);
  const admitted = await one(`SELECT COUNT(*) FROM patients`);
  const wards = await pairs(`SELECT ward, COUNT(*) FROM patients GROUP BY ward ORDER BY ward`);
  const bloodTypes = await pairs(`SELECT blood_type, COUNT(*) FROM patients GROUP BY blood_type ORDER BY COUNT(*) DESC, blood_type`);
  const birth = await sql(`SELECT MIN(birth_year), MAX(birth_year) FROM patients`);
  const visits = await one(`SELECT COUNT(*) FROM visits`);
  const sev = await pairs(`SELECT severity, COUNT(*) FROM visits GROUP BY severity ORDER BY severity`);
  const cost = await sql(`SELECT MIN(cost_cents), MAX(cost_cents), AVG(cost_cents) FROM visits`);
  const multiVisit = await one(`SELECT COUNT(*) FROM (SELECT patient_id FROM visits GROUP BY patient_id HAVING COUNT(*) > 1)`);
  const patientsNoVisit = await one(`SELECT COUNT(*) FROM patients p WHERE NOT EXISTS (SELECT 1 FROM visits v WHERE v.patient_id = p.id)`);
  check("every patient has >=1 visit", patientsNoVisit === 0, `${patientsNoVisit} without`);
  const treatments = await one(`SELECT COUNT(*) FROM treatments`);
  const outcomes = await pairs(`SELECT outcome, COUNT(*) FROM treatments GROUP BY outcome ORDER BY outcome`);
  const tx = await sql(`SELECT MIN(days), MAX(days) FROM treatments`);
  const scripts = await one(`SELECT COUNT(*) FROM prescriptions`);
  const drugs = await pairs(`SELECT drug, COUNT(*) FROM prescriptions GROUP BY drug ORDER BY COUNT(*) DESC, drug`);
  const refillsZero = await one(`SELECT COUNT(*) FROM prescriptions WHERE refills = 0`);
  const docs = await one(`SELECT COUNT(*) FROM doctors`);
  const rating = await sql(`SELECT MIN(rating), MAX(rating), AVG(rating) FROM doctors`);
  const specialties = await pairs(`SELECT specialty, COUNT(*) FROM doctors GROUP BY specialty ORDER BY specialty`);

  console.log("MED FACTS");
  console.log(`  doctors: "${fmtNum(docs)} doctors · specialties: ${specialties.join(", ")} · ratings ${dec(rating[0][0]).toFixed(1)} – ${dec(rating[0][1]).toFixed(1)} (avg ${dec(rating[0][2]).toFixed(1)})"`);
  console.log(`  patients: "${fmtNum(admitted)} patients · ${stillAdmitted} still admitted (NULL discharged_at) · wards: ${wards.join(", ")} · born ${birth[0][0]} – ${birth[0][1]}"`);
  console.log(`  blood: "blood types: ${bloodTypes.join(", ")}"`);
  console.log(`  visits: "${fmtNum(visits)} visits · severity: ${sev.join(", ")} · ${multiVisit} patients came twice or more · costs ${moneyRange(cost[0][0], cost[0][1])} (avg ${money(Math.round(dec(cost[0][2])))})"`);
  console.log(`  treatments: "${fmtNum(treatments)} treatments · outcomes: ${outcomes.join(", ")} · stays ${tx[0][0]} – ${tx[0][1]} days"`);
  console.log(`  prescriptions: "${fmtNum(scripts)} prescriptions — one per visit · drugs: ${drugs.join(", ")} · ${refillsZero} with zero refills"`);

  await import("node:assert").then(({ strict }) => {
    strict.equal(visits, 36);
    strict.equal(scripts, 36);
    strict.equal(admitted, 16);
  });
}

/* ---------------- sport ---------------- */

console.log("== sport ==");
{
  const teams = await one(`SELECT COUNT(*) FROM teams`);
  const founded = await sql(`SELECT MIN(founded), MAX(founded) FROM teams`);
  const players = await one(`SELECT COUNT(*) FROM players`);
  const pos = await pairs(`SELECT position, COUNT(*) FROM players GROUP BY position ORDER BY position`);
  const matches = await one(`SELECT COUNT(*) FROM matches`);
  const stage = await pairs(`SELECT stage, COUNT(*) FROM matches GROUP BY stage ORDER BY stage`);
  const goals = await one(`SELECT COUNT(*) FROM goals`);
  const pens = await one(`SELECT COUNT(*) FROM goals WHERE penalty = 1`);
  const minute = await sql(`SELECT MIN(minute), MAX(minute) FROM goals`);
  const top = await sql(`SELECT p.name, COUNT(*) AS g FROM goals g JOIN players p ON p.id = g.player_id GROUP BY p.id ORDER BY g DESC, p.name LIMIT 1`);
  const zeroGoal = await one(`SELECT COUNT(*) FROM players pl WHERE NOT EXISTS (SELECT 1 FROM goals g WHERE g.player_id = pl.id)`);
  const draws = await one(`SELECT COUNT(*) FROM matches WHERE home_goals = away_goals`);
  const biggest = await sql(`SELECT ABS(home_goals - away_goals) AS m FROM matches ORDER BY m DESC LIMIT 1`);
  const selfJoinGuard = await one(`SELECT COUNT(*) FROM matches WHERE home_team_id = away_team_id`);
  check("no team plays itself", selfJoinGuard === 0, `${selfJoinGuard} rows`);
  const totalScored = await one(`SELECT SUM(home_goals + away_goals) FROM matches`);
  check("goals table == match scorelines", totalScored === goals, `${totalScored} vs ${goals}`);

  console.log("SPORT FACTS");
  console.log(`  teams: "${fmtNum(teams)} clubs · founded ${founded[0][0]} – ${founded[0][1]} · one stadium each"`);
  console.log(`  players: "${fmtNum(players)} players · positions: ${pos.join(", ")} · 4 per club (GK, DF, MF, FW)"`);
  console.log(`  matches: "${fmtNum(matches)} matches · stage: ${stage.join(", ")} · ${draws} draws · biggest winning margin ${biggest[0][0]} goals"`);
  console.log(`  goals: "${fmtNum(goals)} goals · ${pens} from the penalty spot · minutes ${minute[0][0]} – ${minute[0][1]} · top scorer ${top[0][0]} (${top[0][1]}) · ${zeroGoal} players never scored"`);
}

/* ---------------- logi ---------------- */

console.log("== logi ==");
{
  const wh = await one(`SELECT COUNT(*) FROM warehouses`);
  const regions = await pairs(`SELECT region, COUNT(*) FROM warehouses GROUP BY region ORDER BY region`);
  const carriers = await one(`SELECT COUNT(*) FROM carriers`);
  const modes = await pairs(`SELECT mode, COUNT(*) FROM carriers GROUP BY mode ORDER BY mode`);
  const rel = await sql(`SELECT MIN(reliability), MAX(reliability) FROM carriers`);
  const shipments = await one(`SELECT COUNT(*) FROM shipments`);
  const status = await pairs(`SELECT status, COUNT(*) FROM shipments GROUP BY status ORDER BY status`);
  const weight = await sql(`SELECT MIN(weight_kg), MAX(weight_kg) FROM shipments`);
  const selfRoute = await one(`SELECT COUNT(*) FROM shipments WHERE origin_id = dest_id`);
  check("origin != dest", selfRoute === 0, `${selfRoute} rows`);
  const nullDelivered = await one(`SELECT COUNT(*) FROM shipments WHERE delivered_at IS NULL`);
  const nullMatches = await one(`SELECT COUNT(*) FROM shipments WHERE delivered_at IS NULL AND status = 'delivered'`);
  check("delivered ⇒ delivered_at NOT NULL", nullMatches === 0, `${nullMatches} delivered without date`);
  const stops = await one(`SELECT COUNT(*) FROM stops`);
  const pendingStops = await one(`SELECT COUNT(*) FROM stops WHERE arrived_at IS NULL`);
  const claims = await one(`SELECT COUNT(*) FROM claims`);
  const reasons = await pairs(`SELECT reason, COUNT(*) FROM claims GROUP BY reason ORDER BY COUNT(*) DESC, reason`);
  const claimStatus = await pairs(`SELECT status, COUNT(*) FROM claims GROUP BY status ORDER BY status`);
  const doubleClaim = await one(`SELECT COUNT(*) FROM (SELECT shipment_id FROM claims GROUP BY shipment_id HAVING COUNT(*) > 1)`);
  const claimMoney = await sql(`SELECT SUM(amount_cents) FROM claims`);

  console.log("LOGI FACTS");
  console.log(`  warehouses: "${fmtNum(wh)} hubs · regions: ${regions.join(", ")}"`);
  console.log(`  carriers: "${fmtNum(carriers)} carriers · modes: ${modes.join(", ")} · reliability ${dec(rel[0][0]).toFixed(2)} – ${dec(rel[0][1]).toFixed(2)}"`);
  console.log(`  shipments: "${fmtNum(shipments)} shipments · status: ${status.join(", ")} · ${nullDelivered} still in flight (NULL delivered_at) · weights ${range(weight[0][0], weight[0][1])} kg"`);
  console.log(`  stops: "${fmtNum(stops)} stops · ${pendingStops} not yet reached (NULL arrived_at)"`);
  console.log(`  claims: "${fmtNum(claims)} claims worth ${money(claimMoney[0][0])} · reasons: ${reasons.join(", ")} · status: ${claimStatus.join(", ")} · ${doubleClaim} shipment claimed twice"`);

  await import("node:assert").then(({ strict }) => {
    strict.equal(shipments, 40);
    strict.equal(nullDelivered, 9 + 5 + 4);
  });
}

/* ---------------- finance (existing books, now browsable) ---------------- */

console.log("== finance ==");
{
  const inv = await one(`SELECT COUNT(*) FROM invoices`);
  const invStatus = await pairs(`SELECT status, COUNT(*) FROM invoices GROUP BY status ORDER BY status`);
  const invAmount = await sql(`SELECT MIN(amount_cents), MAX(amount_cents) FROM invoices`);
  const pay = await one(`SELECT COUNT(*) FROM payments`);
  const methods = await pairs(`SELECT method, COUNT(*) FROM payments GROUP BY method ORDER BY COUNT(*) DESC, method`);
  const unpaid = await one(`SELECT COUNT(*) FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`);
  const exp = await one(`SELECT COUNT(*) FROM expenses`);
  const expCats = await pairs(`SELECT category, COUNT(*) FROM expenses GROUP BY category ORDER BY category`);
  const legs = await one(`SELECT COUNT(*) FROM ledger_entries`);
  const debit = await one(`SELECT SUM(debit_cents) FROM ledger_entries`);
  const credit = await one(`SELECT SUM(credit_cents) FROM ledger_entries`);
  check("ledger balances", debit === credit, `${debit} vs ${credit}`);
  const accounts = await pairs(`SELECT account, COUNT(*) FROM ledger_entries GROUP BY account ORDER BY account`);

  console.log("FINANCE FACTS");
  console.log(`  invoices: "${fmtNum(inv)} invoices · status: ${invStatus.join(", ")} · amounts ${moneyRange(invAmount[0][0], invAmount[0][1])}"`);
  console.log(`  payments: "${fmtNum(pay)} payments · methods: ${methods.join(", ")} · ${unpaid} invoices never paid"`);
  console.log(`  expenses: "${fmtNum(exp)} expenses · categories: ${expCats.join(", ")}"`);
  console.log(`  ledger: "${fmtNum(legs)} legs · debit ${money(debit)} = credit ${money(credit)} · accounts: ${accounts.join(", ")}"`);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
