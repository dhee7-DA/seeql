// Round 13 — probe the Healthcare & Claims world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_HC_SCHEMA } from "../src/lib/leetcode/content/dm-hc-schema";
import { DM_HC_SEED } from "../src/lib/leetcode/content/dm-hc-seed";

const db = new Database(":memory:");
db.exec(DM_HC_SCHEMA.ddl);
db.exec(DM_HC_SEED);
const q = (sql: string): Record<string, unknown>[] => db.prepare(sql).all() as Record<string, unknown>[];
const one = (sql: string): number => Object.values(db.prepare(sql).get() ?? {})[0] as number;

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " · " + detail : ""}`);
};

console.log("== epoch openers ==");
for (const [ts, want] of [[1784505600, "2026-07-20"], [1784592000, "2026-07-21"], [1784678400, "2026-07-22"], [1784764800, "2026-07-23"]] as const) {
  const got = (q(`SELECT strftime('%Y-%m-%d', ${ts}, 'unixepoch') d`)[0] as { d: string }).d;
  check(`epoch ${ts} = ${want}`, got === want, got);
}

console.log("== counts ==");
check("patients = 12", one("SELECT COUNT(*) FROM patients") === 12);
const pc = q(`SELECT plan_type, COUNT(*) n FROM payers p JOIN patients pa ON pa.payer_id = p.payer_id GROUP BY plan_type ORDER BY n DESC, plan_type`);
check("payer mix commercial 6 / medicaid 3 / medicare 3", JSON.stringify(pc) === JSON.stringify([{ plan_type: "commercial", n: 6 }, { plan_type: "medicaid", n: 3 }, { plan_type: "medicare", n: 3 }]), JSON.stringify(pc));
const rc = q(`SELECT region, COUNT(*) n FROM patients GROUP BY region ORDER BY n DESC, region`);
check("regions NA 5 / EMEA 3 / APAC 2 / LATAM 2", JSON.stringify(rc) === JSON.stringify([{ region: "NA", n: 5 }, { region: "EMEA", n: 3 }, { region: "APAC", n: 2 }, { region: "LATAM", n: 2 }]), JSON.stringify(rc));
check("providers = 8", one("SELECT COUNT(*) FROM providers") === 8);
check("visits = 56", one("SELECT COUNT(*) FROM visits") === 56);
const vs = q(`SELECT status, COUNT(*) n FROM visits GROUP BY status ORDER BY n DESC, status`);
check("visits completed 48 / no_show 5 / cancelled 3", JSON.stringify(vs) === JSON.stringify([{ status: "completed", n: 48 }, { status: "no_show", n: 5 }, { status: "cancelled", n: 3 }]), JSON.stringify(vs));
const vt = q(`SELECT visit_type, COUNT(*) n FROM visits GROUP BY visit_type ORDER BY n DESC, visit_type`);
check("types office 29 / telehealth 14 / inpatient 8 / er 5", JSON.stringify(vt) === JSON.stringify([{ visit_type: "office", n: 29 }, { visit_type: "telehealth", n: 14 }, { visit_type: "inpatient", n: 8 }, { visit_type: "er", n: 5 }]), JSON.stringify(vt));
check("every no_show/cancelled row is an office visit", one(`SELECT COUNT(*) FROM visits WHERE status <> 'completed' AND visit_type <> 'office'`) === 0);
check("no_show/cancelled billed_cents all 0", one(`SELECT COUNT(*) FROM visits WHERE status <> 'completed' AND billed_cents <> 0`) === 0);
check("claims = 49", one("SELECT COUNT(*) FROM claims") === 49);
const cs = q(`SELECT status, COUNT(*) n FROM claims GROUP BY status ORDER BY n DESC, status`);
check("claims paid 37 / denied 7 / pending 4 / appealed 1", JSON.stringify(cs) === JSON.stringify([{ status: "paid", n: 37 }, { status: "denied", n: 7 }, { status: "pending", n: 4 }, { status: "appealed", n: 1 }]), JSON.stringify(cs));
const dc = q(`SELECT denial_code, COUNT(*) n FROM claims WHERE denial_code IS NOT NULL GROUP BY denial_code ORDER BY n DESC, denial_code`);
check("denial_code census CO-16 2 / CO-197 2 / CO-29 2 / PR-1 2 (the appeal reuses CO-16)", JSON.stringify(dc) === JSON.stringify([{ denial_code: "CO-16", n: 2 }, { denial_code: "CO-197", n: 2 }, { denial_code: "CO-29", n: 2 }, { denial_code: "PR-1", n: 2 }]), JSON.stringify(dc));
check("denied-only census CO-197 2 / CO-29 2 / PR-1 2 / CO-16 1", JSON.stringify(q(`SELECT denial_code, COUNT(*) n FROM claims WHERE status = 'denied' GROUP BY denial_code ORDER BY n DESC, denial_code`)) === JSON.stringify([{ denial_code: "CO-197", n: 2 }, { denial_code: "CO-29", n: 2 }, { denial_code: "PR-1", n: 2 }, { denial_code: "CO-16", n: 1 }]));
check("diagnoses = 56 (48 primary + 8 secondary)", one("SELECT COUNT(*) FROM diagnoses") === 56);
check("primary dx = 48 (one per completed visit)", one("SELECT COUNT(*) FROM diagnoses WHERE is_primary = 1") === 48);
check("no dx rows on no_show/cancelled visits", one(`SELECT COUNT(*) FROM diagnoses d JOIN visits v ON v.visit_id = d.visit_id WHERE v.status <> 'completed'`) === 0);
check("portal_events = 56", one("SELECT COUNT(*) FROM portal_events") === 56);
const et = q(`SELECT event_type, COUNT(*) n FROM portal_events GROUP BY event_type ORDER BY n DESC, event_type`);
check("portal login 26 / refill 11 / message 9 / appt_book 7 / bill_pay 3", JSON.stringify(et) === JSON.stringify([{ event_type: "login", n: 26 }, { event_type: "refill_request", n: 11 }, { event_type: "message", n: 9 }, { event_type: "appt_book", n: 7 }, { event_type: "bill_pay", n: 3 }]), JSON.stringify(et));

console.log("== planted: honest zeros ==");
check("P11 zero visits", one("SELECT COUNT(*) FROM visits WHERE patient_id = 11") === 0);
check("P11 zero claims", one("SELECT COUNT(*) FROM claims WHERE patient_id = 11") === 0);
check("P11 exactly ONE portal event (a login)", one("SELECT COUNT(*) FROM portal_events WHERE patient_id = 11") === 1 && one(`SELECT COUNT(*) FROM portal_events WHERE patient_id = 11 AND event_type = 'login'`) === 1);
check("visits without claims = 8 (5 no_show + 3 cancelled)", one(`SELECT COUNT(*) FROM visits v WHERE NOT EXISTS (SELECT 1 FROM claims c WHERE c.visit_id = v.visit_id)`) === 8);
check("claims always reference a completed visit", one(`SELECT COUNT(*) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE v.status <> 'completed'`) === 0);
const noShowProv = q(`SELECT provider_id id, COUNT(*) n FROM visits WHERE status = 'no_show' GROUP BY provider_id ORDER BY id`);
check("no_show spread: V1 x1, V2 x0, V4 x2, V5 x1, V6? x0, V2? — check", JSON.stringify(noShowProv) === JSON.stringify([{ id: 1, n: 1 }, { id: 2, n: 1 }, { id: 4, n: 2 }, { id: 5, n: 1 }]), JSON.stringify(noShowProv));

console.log("== planted: readmission wall ==");
const stays = q(`
  SELECT visit_id, patient_id pid, visit_date, discharge_date,
    CAST(julianday(discharge_date) - julianday(visit_date) AS INT) los
  FROM visits WHERE visit_type = 'inpatient' ORDER BY patient_id, visit_date`) as Array<{ visit_id: number; pid: number; los: number }>;
console.log("  inpatient stays:", JSON.stringify(stays));
check("LOS census = 28,4,4,3,3,4,2,0 (8 stays)", JSON.stringify(stays.map((s) => s.los).sort((a, b) => b - a)) === JSON.stringify([28, 4, 4, 4, 3, 3, 2, 0]), JSON.stringify(stays.map((s) => s.los)));
check("one same-day stay (LOS 0, v33)", stays.filter((s) => s.los === 0).length === 1 && stays.find((s) => s.los === 0)?.visit_id === 33);
check("total LOS = 48 across 8 stays (avg 6.0)", stays.reduce((a, s) => a + s.los, 0) === 48);
const gaps = q(`
  SELECT a.patient_id pid, a.visit_id prev_id, a.discharge_date,
    b.visit_id next_id, b.visit_date readmit_date,
    CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) gap
  FROM visits a JOIN visits b
    ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient'
   AND b.visit_date > a.visit_date
  WHERE a.visit_type = 'inpatient' ORDER BY gap`) as Array<{ pid: number; gap: number; prev_id: number; next_id: number }>;
console.log("  discharge->readmit gaps:", JSON.stringify(gaps));
check("readmit gaps = exactly 3 pairs (6, 30, 31)", JSON.stringify(gaps.map((g) => g.gap).sort((a, b) => a - b)) === JSON.stringify([6, 30, 31]), JSON.stringify(gaps));
check("P2 gap EXACTLY 30 (v7 -> v8)", gaps.find((g) => g.gap === 30)?.pid === 2 && gaps.find((g) => g.gap === 30)?.prev_id === 7 && gaps.find((g) => g.gap === 30)?.next_id === 8);
check("P5 bounce 6 days", gaps.find((g) => g.gap === 6)?.pid === 5);
check("P10 near-miss 31 days", gaps.find((g) => g.gap === 31)?.pid === 10);
check("readmits within 30 INCLUSIVE = 2 patients (2, 5)", JSON.stringify([...new Set(gaps.filter((g) => g.gap <= 30).map((g) => g.pid))].sort()) === JSON.stringify([2, 5]));
check("readmits within 30 STRICT = 1 patient (5)", JSON.stringify([...new Set(gaps.filter((g) => g.gap < 30).map((g) => g.pid))].sort()) === JSON.stringify([5]));

console.log("== planted: timely filing boundary ==");
const lags = q(`
  SELECT c.claim_id, c.status, c.denial_code,
    CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) lag
  FROM claims c JOIN visits v ON v.visit_id = c.visit_id
  ORDER BY lag DESC`) as Array<{ claim_id: number; status: string; denial_code: string | null; lag: number }>;
console.log("  top lags:", JSON.stringify(lags.slice(0, 5)));
check("overall max lag = 104, a CO-29 denial (c34)", lags[0].lag === 104 && lags[0].denial_code === "CO-29" && lags[0].claim_id === 34);
const paidLags = lags.filter((l) => l.status === "paid");
check("max PAID lag = EXACTLY 90 (the boundary survivor c25)", paidLags[0].lag === 90 && paidLags[0].claim_id === 25);
check("second-max PAID lag = 11 (the corrected resubmission c14)", paidLags[1].lag === 11 && paidLags[1].claim_id === 14);
check("CO-29 lags = 95 and 104", JSON.stringify(lags.filter((l) => l.denial_code === "CO-29").map((l) => l.lag).sort((a, b) => a - b)) === JSON.stringify([95, 104]));
check("every paid claim except c25/c14 filed within 5 days", lags.filter((l) => l.status === "paid" && ![14, 25].includes(l.claim_id)).every((l) => l.lag <= 5));

console.log("== planted: denial book ==");
const twins = q(`SELECT claim_id, allowed_cents a, paid_cents p FROM claims WHERE denial_code = 'PR-1' ORDER BY claim_id`);
check("PR-1 twins: c4 and c23 both allowed 96000, paid 0", JSON.stringify(twins) === JSON.stringify([{ claim_id: 4, a: 96000, p: 0 }, { claim_id: 23, a: 96000, p: 0 }]), JSON.stringify(twins));
check("CO-197 both on inpatient stays", one(`SELECT COUNT(*) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE c.denial_code = 'CO-197' AND v.visit_type <> 'inpatient'`) === 0);
check("all denials have allowed set, paid 0, processed set", one(`SELECT COUNT(*) FROM claims WHERE status = 'denied' AND (allowed_cents IS NULL OR paid_cents IS NOT 0 OR processed_date IS NULL)`) === 0);
check("denied billed total = 824000", one(`SELECT SUM(v.billed_cents) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE c.status = 'denied'`) === 824000);
check("denied allowed total = 614200", one(`SELECT SUM(allowed_cents) FROM claims WHERE status = 'denied'`) === 614200);
const pair = q(`SELECT claim_id, status, denial_code, submitted_date, processed_date FROM claims WHERE visit_id = 13 ORDER BY claim_id`);
check("v13 carries the corrected-claim pair (denied CO-16 then paid)", JSON.stringify(pair) === JSON.stringify([{ claim_id: 13, status: "denied", denial_code: "CO-16", submitted_date: "2026-02-16", processed_date: "2026-02-20" }, { claim_id: 14, status: "paid", denial_code: null, submitted_date: "2026-02-25", processed_date: "2026-03-02" }]), JSON.stringify(pair));
check("resubmission came 9 days after the original", one(`SELECT CAST(julianday('2026-02-25') - julianday('2026-02-16') AS INT)`) === 9);
check("appealed row: paid + processed NULL, denial CO-16 (c48)", one(`SELECT COUNT(*) FROM claims WHERE status = 'appealed' AND paid_cents IS NULL AND processed_date IS NULL AND denial_code = 'CO-16'`) === 1);

console.log("== planted: aging board (as of 2026-07-01) ==");
const aging = q(`
  SELECT claim_id, CAST(julianday('2026-07-01') - julianday(submitted_date) AS INT) age
  FROM claims WHERE status = 'pending' ORDER BY age`) as Array<{ claim_id: number; age: number }>;
console.log("  pending ages:", JSON.stringify(aging));
check("pending ages = 26, 48, 60, 102", JSON.stringify(aging.map((a) => a.age)) === JSON.stringify([26, 48, 60, 102]), JSON.stringify(aging));
check("one pending sits EXACTLY on the 60-day line (c28)", aging.find((a) => a.age === 60)?.claim_id === 28);
const bucketsLE = q(`
  SELECT CASE WHEN age <= 30 THEN '0-30' WHEN age <= 60 THEN '31-60' WHEN age <= 90 THEN '61-90' ELSE '91+' END b, COUNT(*) n
  FROM (${aging.map((a) => `SELECT ${a.age} age`).join(" UNION ALL ")}) GROUP BY b ORDER BY b`) as Array<{ b: string; n: number }>;
check("buckets with <= 60 rule: 0-30 x1 / 31-60 x2 / 91+ x1 — 61-90 EMPTY", JSON.stringify(bucketsLE) === JSON.stringify([{ b: "0-30", n: 1 }, { b: "31-60", n: 2 }, { b: "91+", n: 1 }]), JSON.stringify(bucketsLE));

console.log("== planted: money ==");
check("total paid = 1634880", one("SELECT SUM(paid_cents) FROM claims") === 1634880);
check("total billed via claims (fan-out) = 3315100", one("SELECT SUM(v.billed_cents) FROM claims c JOIN visits v ON v.visit_id = c.visit_id") === 3315100);
check("total billed via visits (completed) = 3301100", one(`SELECT SUM(billed_cents) FROM visits WHERE status = 'completed'`) === 3301100);
check("fan-out delta = exactly 14000 (the duplicated visit)", one("SELECT SUM(v.billed_cents) FROM claims c JOIN visits v ON v.visit_id = c.visit_id") - one(`SELECT SUM(billed_cents) FROM visits WHERE status = 'completed'`) === 14000);
check("paid <= allowed <= billed on every adjudicated claim", one(`SELECT COUNT(*) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE c.allowed_cents IS NOT NULL AND (c.paid_cents > c.allowed_cents OR c.allowed_cents > v.billed_cents)`) === 0);
check("rate audit: 0 violations of 80/65/55% OUTSIDE the PR-1 deductible rows", one(`
  SELECT COUNT(*) FROM claims c
  JOIN visits v ON v.visit_id = c.visit_id
  JOIN patients p ON p.patient_id = c.patient_id
  WHERE c.allowed_cents IS NOT NULL AND c.denial_code IS NOT 'PR-1'
    AND c.allowed_cents <> ROUND(v.billed_cents *
      (CASE p.payer_id WHEN 1 THEN 0.80 WHEN 2 THEN 0.65 ELSE 0.55 END))`) === 0);
check("the PR-1 twins both bill 120000 and allow 96000 (same shape, different payers)", one(`SELECT COUNT(*) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE c.denial_code = 'PR-1' AND v.billed_cents = 120000 AND c.allowed_cents = 96000`) === 2);
check("write-off total (billed-allowed, adjudicated) = 916520", one(`SELECT SUM(v.billed_cents - c.allowed_cents) FROM claims c JOIN visits v ON v.visit_id = c.visit_id WHERE c.allowed_cents IS NOT NULL`) === 916520);

console.log("== planted: patient leaderboards ==");
const patPaid = q(`
  SELECT p.patient_id id, p.name, COALESCE(SUM(c.paid_cents), 0) paid,
    RANK() OVER (ORDER BY COALESCE(SUM(c.paid_cents), 0) DESC) r,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(c.paid_cents), 0) DESC) dr
  FROM patients p LEFT JOIN claims c ON c.patient_id = p.patient_id
  GROUP BY p.patient_id ORDER BY paid DESC, p.patient_id`) as Array<{ id: number; paid: number; r: number; dr: number }>;
console.table(patPaid);
check("whale P10 = 528800 at rank 1", patPaid.find((x) => x.r === 1)?.id === 10 && patPaid.find((x) => x.r === 1)?.paid === 528800);
check("P2 second at 403650", patPaid.find((x) => x.r === 2)?.id === 2 && patPaid.find((x) => x.r === 2)?.paid === 403650);
check("32800... no — the 40000 club = P1 + P4 (ranks 6-7, dense 6)", patPaid.filter((x) => x.r === 6).length === 2 && patPaid.filter((x) => x.r === 6).every((x) => x.paid === 40000) && patPaid.filter((x) => x.r === 6).every((x) => x.dr === 6));
check("P1's shape = 4 paid claims (12800x2 + 7200x2), P4's = 2 (13600 + 26400)", JSON.stringify(q(`SELECT paid_cents v, COUNT(*) n FROM claims WHERE patient_id = 1 AND status = 'paid' GROUP BY v ORDER BY v DESC`)) === JSON.stringify([{ v: 12800, n: 2 }, { v: 7200, n: 2 }]) && JSON.stringify(q(`SELECT paid_cents v FROM claims WHERE patient_id = 4 AND status = 'paid' ORDER BY v DESC`)) === JSON.stringify([{ v: 26400 }, { v: 13600 }]));
check("P11 honest zero at the bottom", patPaid.find((x) => x.id === 11)?.paid === 0);
check("exactly ONE patient crosses the 500000 line", one(`SELECT COUNT(*) FROM (SELECT patient_id, SUM(paid_cents) s FROM claims GROUP BY patient_id HAVING s >= 500000)`) === 1);
check("P2's paid = 403650 > 400000 line, no one else", one(`SELECT COUNT(*) FROM (SELECT patient_id, SUM(paid_cents) s FROM claims GROUP BY patient_id HAVING s >= 400000)`) === 2);

console.log("== planted: region flip ==");
const regPaid = q(`
  SELECT p.region rg, SUM(c.paid_cents) paid
  FROM patients p JOIN claims c ON c.patient_id = p.patient_id
  GROUP BY rg ORDER BY paid DESC`) as Array<{ rg: string; paid: number }>;
check("with whale: NA 889650 / APAC 430130 / EMEA 297100 / LATAM 18000", JSON.stringify(regPaid) === JSON.stringify([{ rg: "NA", paid: 889650 }, { rg: "APAC", paid: 430130 }, { rg: "EMEA", paid: 297100 }, { rg: "LATAM", paid: 18000 }]), JSON.stringify(regPaid));
const regEx = q(`
  SELECT p.region rg, SUM(c.paid_cents) paid
  FROM patients p JOIN claims c ON c.patient_id = p.patient_id
  WHERE p.patient_id <> 10 GROUP BY rg ORDER BY paid DESC`) as Array<{ rg: string; paid: number }>;
check("ex-whale: APAC 430130 / NA 360850 / EMEA 297100 / LATAM 18000 (NA 1st -> 2nd)", JSON.stringify(regEx) === JSON.stringify([{ rg: "APAC", paid: 430130 }, { rg: "NA", paid: 360850 }, { rg: "EMEA", paid: 297100 }, { rg: "LATAM", paid: 18000 }]), JSON.stringify(regEx));
check("whale share of NA book = 528800/889650 ~ 59.4%", Math.round((528800 / 889650) * 1000) / 10 === 59.4);

console.log("== planted: payer economics ==");
const payPaid = q(`
  SELECT pay.plan_type pt, SUM(c.paid_cents) paid, COUNT(DISTINCT p.patient_id) members
  FROM claims c JOIN patients p ON p.patient_id = c.patient_id JOIN payers pay ON pay.payer_id = p.payer_id
  GROUP BY pt ORDER BY paid DESC`) as Array<{ pt: string; paid: number; members: number }>;
check("payer paid: medicare 904150 x3 / commercial 665280 x6 / medicaid 65450 x2", JSON.stringify(payPaid) === JSON.stringify([{ pt: "medicare", paid: 904150, members: 3 }, { pt: "commercial", paid: 665280, members: 6 }, { pt: "medicaid", paid: 65450, members: 2 }]), JSON.stringify(payPaid));
check("medicare's 3 members outspend commercial's 6", payPaid[0].pt === "medicare" && payPaid[1].pt === "commercial");

console.log("== planted: provider / facility leaderboards ==");
const provPaid = q(`
  SELECT pr.provider_id id, pr.specialty sp, COALESCE(SUM(c.paid_cents), 0) paid
  FROM providers pr LEFT JOIN claims c ON c.visit_id IN (SELECT visit_id FROM visits WHERE provider_id = pr.provider_id AND status = 'completed')
  GROUP BY pr.provider_id ORDER BY paid DESC`) as Array<{ id: number; sp: string; paid: number }>;
console.log("  provider paid:", JSON.stringify(provPaid));
check("V3 cardiology leads at 1081550", provPaid[0].id === 3 && provPaid[0].paid === 1081550 && provPaid[0].sp === "cardiology");
check("V7 79880 > V1 71100 > V4 69000", provPaid.find((x) => x.id === 7)?.paid === 79880 && provPaid.find((x) => x.id === 1)?.paid === 71100 && provPaid.find((x) => x.id === 4)?.paid === 69000);
const facPaid = q(`
  SELECT pr.facility f, SUM(c.paid_cents) paid
  FROM providers pr JOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'
  JOIN claims c ON c.visit_id = v.visit_id
  GROUP BY f ORDER BY paid DESC`) as Array<{ f: string; paid: number }>;
check("facility: Heart Institute 1099150 / Main 411100 / Virtual 79880 / East 44750", JSON.stringify(facPaid) === JSON.stringify([{ f: "Meridian Heart Institute", paid: 1099150 }, { f: "Meridian Main", paid: 411100 }, { f: "Virtual Care Hub", paid: 79880 }, { f: "Meridian East", paid: 44750 }]), JSON.stringify(facPaid));

console.log("== planted: chronic club ==");
const club = q(`
  SELECT patient_id FROM diagnoses
  WHERE is_primary = 1 AND icd_code IN ('E11', 'I10')
  GROUP BY patient_id
  HAVING COUNT(DISTINCT icd_code) = 2 ORDER BY patient_id`) as Array<{ patient_id: number }>;
check("E11+I10 primary club = exactly patients 2 and 10", JSON.stringify(club) === JSON.stringify([{ patient_id: 2 }, { patient_id: 10 }]), JSON.stringify(club));
check("I50 primary = 9 encounters, all P2/P5/P8/P10", one("SELECT COUNT(*) FROM diagnoses WHERE is_primary = 1 AND icd_code = 'I50'") === 9 && one(`SELECT COUNT(*) FROM diagnoses d JOIN patients p ON p.patient_id = d.patient_id WHERE d.is_primary = 1 AND d.icd_code = 'I50' AND p.patient_id NOT IN (2,5,8,10)`) === 0);
check("M54 primary = exactly 1 (P4's ortho visit)", one("SELECT COUNT(*) FROM diagnoses WHERE is_primary = 1 AND icd_code = 'M54'") === 1);
const primCensus = q(`SELECT icd_code, COUNT(*) n FROM diagnoses WHERE is_primary = 1 GROUP BY icd_code ORDER BY n DESC, icd_code`);
check("primary census: I50 9 / E11 8 / I10 7 / Z00 7 / R05 6 / F41 5 / J45 5 / M54 1", JSON.stringify(primCensus) === JSON.stringify([{ icd_code: "I50", n: 9 }, { icd_code: "E11", n: 8 }, { icd_code: "I10", n: 7 }, { icd_code: "Z00", n: 7 }, { icd_code: "R05", n: 6 }, { icd_code: "F41", n: 5 }, { icd_code: "J45", n: 5 }, { icd_code: "M54", n: 1 }]), JSON.stringify(primCensus));
check("visits with 2 dx = 6 (v4, v7, v8, v22, v33, v37, v48 = 7 actually)", one("SELECT COUNT(*) FROM (SELECT visit_id FROM diagnoses GROUP BY visit_id HAVING COUNT(*) > 1)") === 7);

console.log("== planted: enrollment calendar ==");
const cal = q(`
  SELECT strftime('%Y-%m', enrolled_date) ym, COUNT(*) n FROM patients
  WHERE enrolled_date >= '2026-01-01' GROUP BY ym ORDER BY ym`) as Array<{ ym: string; n: number }>;
check("2026 enrollments: Jan 1 / Feb 1 / Apr 1 / May 1 / Jun 2 — March ZERO", JSON.stringify(cal) === JSON.stringify([{ ym: "2026-01", n: 1 }, { ym: "2026-02", n: 1 }, { ym: "2026-04", n: 1 }, { ym: "2026-05", n: 1 }, { ym: "2026-06", n: 2 }]), JSON.stringify(cal));
check("no patient enrolled in March 2026", !cal.some((r) => r.ym === "2026-03"));

console.log("== planted: portal clocks ==");
const pairs300 = one(`SELECT COUNT(*) FROM portal_events a JOIN portal_events b
  ON a.patient_id = b.patient_id AND a.event_id < b.event_id
  WHERE a.event_type = 'appt_book' AND b.event_type = 'appt_book' AND b.event_ts - a.event_ts <= 300`);
check("appt velocity pairs <= 300s = 7", pairs300 === 7, `${pairs300}`);
check("pairs < 300s = 6 (the strict/inclusive bait)", one(`SELECT COUNT(*) FROM portal_events a JOIN portal_events b
  ON a.patient_id = b.patient_id AND a.event_id < b.event_id
  WHERE a.event_type = 'appt_book' AND b.event_type = 'appt_book' AND b.event_ts - a.event_ts < 300`) === 6);
check("min burst gap = 60s (P3's 4-up burst)", one(`SELECT MIN(b.event_ts - a.event_ts) FROM portal_events a JOIN portal_events b
  ON a.patient_id = b.patient_id AND a.event_id < b.event_id
  WHERE a.event_type = 'appt_book' AND b.event_type = 'appt_book'`) === 60);
check("ALL appt_book belong to P3 (5), P9 (2), P10 (1)", one(`SELECT COUNT(*) FROM portal_events WHERE event_type = 'appt_book' AND patient_id NOT IN (3, 9, 10)`) === 0);
const b1800 = one(`SELECT COUNT(*) FROM portal_events a JOIN portal_events b
  ON a.patient_id = b.patient_id AND a.event_id < b.event_id
  WHERE b.event_ts - a.event_ts = 1800`);
check("EXACTLY ONE consecutive pair 1800s apart (P1 login->bill_pay, 07-22)", b1800 === 1);
const p1pair = one(`SELECT b.event_ts - a.event_ts FROM portal_events a JOIN portal_events b
  ON a.patient_id = b.patient_id AND a.event_id < b.event_id
  WHERE b.event_ts - a.event_ts = 1800`);
check("that pair is login -> bill_pay on 07-22", p1pair === 1800 && one(`SELECT COUNT(*) FROM portal_events a JOIN portal_events b
  ON a.event_id = 51 AND b.event_id = 52 AND b.event_ts - a.event_ts = 1800`) === 1);
const within = q(`
  SELECT event_ts - LAG(event_ts) OVER (PARTITION BY patient_id, strftime('%Y-%m-%d', event_ts, 'unixepoch') ORDER BY event_ts) g
  FROM portal_events`) as Array<{ g: number | null }>;
const bigGaps = within.map((r) => r.g).filter((g): g is number => g !== null && g > 1800).sort((a, b) => a - b);
check("within-day gaps > 1800 = exactly {2400, 3700}", JSON.stringify(bigGaps) === JSON.stringify([2400, 3700]), JSON.stringify(bigGaps));
check("bill_pay rows: P1 x2 + P10 x1 only", JSON.stringify(q(`SELECT patient_id, COUNT(*) n FROM portal_events WHERE event_type = 'bill_pay' GROUP BY patient_id ORDER BY patient_id`)) === JSON.stringify([{ patient_id: 1, n: 2 }, { patient_id: 10, n: 1 }]));
check("P10 logs in on all 4 days", one(`SELECT COUNT(DISTINCT strftime('%Y-%m-%d', event_ts, 'unixepoch')) FROM portal_events WHERE patient_id = 10 AND event_type = 'login'`) === 4);
const sess = q(`
  WITH seq AS (SELECT patient_id pid, event_id, event_ts, LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) prev_ts FROM portal_events),
  stamps AS (SELECT pid, event_id, CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END flag FROM seq),
  marked AS (SELECT *, SUM(flag) OVER (PARTITION BY pid ORDER BY event_id ROWS UNBOUNDED PRECEDING) sess FROM stamps)
  SELECT pid, COUNT(DISTINCT sess) n FROM marked GROUP BY pid ORDER BY pid`) as Array<{ pid: number; n: number }>;
console.log("  sessions @strict 1800:", JSON.stringify(sess));
check("total sessions strict = 28", sess.reduce((a, r) => a + r.n, 0) === 28, `${sess.reduce((a, r) => a + r.n, 0)}`);
check("P1 = 3 sessions strict (the 1800 pair stays together)", sess.find((r) => r.pid === 1)?.n === 3);
check("P9 = 2 sessions (the 3700 gap splits)", sess.find((r) => r.pid === 9)?.n === 2);
check("P10 = 4 sessions (one per day)", sess.find((r) => r.pid === 10)?.n === 4);
check("P11 = 1 session (the lone login)", sess.find((r) => r.pid === 11)?.n === 1);

console.log(fails === 0 ? "\nALL PROBES PASS" : `\n${fails} PROBE FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
