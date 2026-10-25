// Domain Mastery — Healthcare & Claims · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r13-hc-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_HC_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Claim book health check",
    scenario:
      "Monday claims standup opens with the book: how much of it converted, and how do the broken rows split?",
    steps: [
      { prompt: "Count paid claims. One column: paid_claims.", code: `SELECT COUNT(*) AS paid_claims\nFROM claims\nWHERE status = 'paid';`, order: "exact" },
      { prompt: "Count claims per status. Output status and claim_count, ordered by claim_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS claim_count\nFROM claims\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Encounter mix",
    scenario:
      "The operations review starts from the encounter diary: what finished, what never happened, and which settings dominate.",
    steps: [
      { prompt: "Count visits per status. Output status and visit_count, ordered by visit_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS visit_count\nFROM visits\nGROUP BY status\nORDER BY visit_count DESC, status ASC;`, order: "exact" },
      { prompt: "Count visits per visit_type. Output visit_type and visit_count, ordered by visit_count descending, then visit_type ascending.", code: `SELECT visit_type, COUNT(*) AS visit_count\nFROM visits\nGROUP BY visit_type\nORDER BY visit_count DESC, visit_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Cigna",
    title: "Coverage map",
    scenario:
      "Network strategy wants the payer landscape: the carriers themselves, then how the membership splits across plan types.",
    steps: [
      { prompt: "List the payers: payer_id, name, plan_type, ordered by payer_id ascending.", code: `SELECT payer_id, name, plan_type\nFROM payers\nORDER BY payer_id ASC;`, order: "exact" },
      { prompt: "Count patients per plan_type. Output plan_type and member_count, ordered by member_count descending, then plan_type ascending.", code: `SELECT pay.plan_type, COUNT(*) AS member_count\nFROM patients p\nJOIN payers pay ON pay.payer_id = p.payer_id\nGROUP BY pay.plan_type\nORDER BY member_count DESC, pay.plan_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "Region footprint",
    scenario:
      "Field operations wants the regional shape of the membership — counts first, then the smallest region's names.",
    steps: [
      { prompt: "Count patients per region. Output region and member_count, ordered by member_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS member_count\nFROM patients\nGROUP BY region\nORDER BY member_count DESC, region ASC;`, order: "exact" },
      { prompt: "List the APAC members: patient_id, name, birth_year, ordered by patient_id ascending.", code: `SELECT patient_id, name, birth_year\nFROM patients\nWHERE region = 'APAC'\nORDER BY patient_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "Denial inventory",
    scenario:
      "The denials inbox needs triage: list what was refused and confirm the payers paid nothing on any of them.",
    steps: [
      { prompt: "List denied claims: claim_id, patient_id, denial_code, allowed_cents, ordered by claim_id ascending.", code: `SELECT claim_id, patient_id, denial_code, allowed_cents\nFROM claims\nWHERE status = 'denied'\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Sum paid_cents across denied claims. One column: denied_paid_total.", code: `SELECT SUM(paid_cents) AS denied_paid_total\nFROM claims\nWHERE status = 'denied';`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "Provider panel",
    scenario:
      "Credentialing wants the roster sliced two ways: by specialty and by facility.",
    steps: [
      { prompt: "Count providers per specialty. Output specialty and provider_count, ordered by provider_count descending, then specialty ascending.", code: `SELECT specialty, COUNT(*) AS provider_count\nFROM providers\nGROUP BY specialty\nORDER BY provider_count DESC, specialty ASC;`, order: "exact" },
      { prompt: "Count providers per facility. Output facility and provider_count, ordered by provider_count descending, then facility ascending.", code: `SELECT facility, COUNT(*) AS provider_count\nFROM providers\nGROUP BY facility\nORDER BY provider_count DESC, facility ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "June close-out",
    scenario:
      "The month-end pack opens with June: how many claims closed and what they paid.",
    steps: [
      { prompt: "Count the claims processed in June 2026. One column: june_processed.", code: `SELECT COUNT(*) AS june_processed\nFROM claims\nWHERE processed_date BETWEEN '2026-06-01' AND '2026-06-30';`, order: "exact" },
      { prompt: "Sum paid_cents for claims processed in June 2026. One column: june_paid.", code: `SELECT SUM(paid_cents) AS june_paid\nFROM claims\nWHERE processed_date BETWEEN '2026-06-01' AND '2026-06-30';`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Portal census",
    scenario:
      "Digital gets its first read: what do members actually do in the portal, and who pays bills there?",
    steps: [
      { prompt: "Count portal events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending.", code: `SELECT event_type, COUNT(*) AS event_count\nFROM portal_events\nGROUP BY event_type\nORDER BY event_count DESC, event_type ASC;`, order: "exact" },
      { prompt: "List the bill_pay events: event_id, patient_id, event_ts, ordered by event_ts ascending.", code: `SELECT event_id, patient_id, event_ts\nFROM portal_events\nWHERE event_type = 'bill_pay'\nORDER BY event_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Cigna",
    title: "Inpatient census",
    scenario:
      "Capacity planning opens with admissions: how many stays, what they billed, and the diary itself.",
    steps: [
      { prompt: "Count inpatient visits and sum their billed_cents. Output stay_count and billed_total.", code: `SELECT COUNT(*) AS stay_count, SUM(billed_cents) AS billed_total\nFROM visits\nWHERE visit_type = 'inpatient';`, order: "exact" },
      { prompt: "List inpatient visits: visit_id, patient_id, visit_date, discharge_date, ordered by visit_date ascending.", code: `SELECT visit_id, patient_id, visit_date, discharge_date\nFROM visits\nWHERE visit_type = 'inpatient'\nORDER BY visit_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "Seniors screen",
    scenario:
      "The medicare-adjacent campaign needs the senior roster: how many, then who.",
    steps: [
      { prompt: "Count patients born in 1970 or earlier. One column: seniors.", code: `SELECT COUNT(*) AS seniors\nFROM patients\nWHERE birth_year <= 1970;`, order: "exact" },
      { prompt: "List them: patient_id, name, birth_year, region, ordered by birth_year ascending.", code: `SELECT patient_id, name, birth_year, region\nFROM patients\nWHERE birth_year <= 1970\nORDER BY birth_year ASC;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "Intake review",
    scenario:
      "Growth wants the 2026 intake story: how many joined this year, then the names in order.",
    steps: [
      { prompt: "Count patients enrolled in 2026. One column: new_2026.", code: `SELECT COUNT(*) AS new_2026\nFROM patients\nWHERE enrolled_date >= '2026-01-01';`, order: "exact" },
      { prompt: "List them: patient_id, name, enrolled_date, ordered by enrolled_date ascending.", code: `SELECT patient_id, name, enrolled_date\nFROM patients\nWHERE enrolled_date >= '2026-01-01'\nORDER BY enrolled_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "Diabetes registry",
    scenario:
      "The care-management program pulls its diabetes registry: the size, then the rows.",
    steps: [
      { prompt: "Count diagnoses where icd_code = 'E11' and is_primary = 1. One column: e11_primary.", code: `SELECT COUNT(*) AS e11_primary\nFROM diagnoses\nWHERE icd_code = 'E11' AND is_primary = 1;`, order: "exact" },
      { prompt: "List those rows: dx_id, visit_id, patient_id, ordered by patient_id, then visit_id.", code: `SELECT dx_id, visit_id, patient_id\nFROM diagnoses\nWHERE icd_code = 'E11' AND is_primary = 1\nORDER BY patient_id ASC, visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Pending queue",
    scenario:
      "Follow-up team huddle: what is still unadjudicated, oldest first.",
    steps: [
      { prompt: "Count pending claims. One column: pending_claims.", code: `SELECT COUNT(*) AS pending_claims\nFROM claims\nWHERE status = 'pending';`, order: "exact" },
      { prompt: "List pending claims: claim_id, patient_id, submitted_date, ordered by submitted_date ascending.", code: `SELECT claim_id, patient_id, submitted_date\nFROM claims\nWHERE status = 'pending'\nORDER BY submitted_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Ghost encounters",
    scenario:
      "Data hygiene sweep: encounters that never happened, counted then listed.",
    steps: [
      { prompt: "Count visits with billed_cents = 0. One column: zero_billed.", code: `SELECT COUNT(*) AS zero_billed\nFROM visits\nWHERE billed_cents = 0;`, order: "exact" },
      { prompt: "List them: visit_id, patient_id, visit_date, status, ordered by visit_id ascending.", code: `SELECT visit_id, patient_id, visit_date, status\nFROM visits\nWHERE billed_cents = 0\nORDER BY visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Cigna",
    title: "The appeal file",
    scenario:
      "Legal wants the appeal pipeline: the open appeal itself, then everything still lacking a decision date.",
    steps: [
      { prompt: "List appealed claims: claim_id, patient_id, denial_code, ordered by claim_id ascending.", code: `SELECT claim_id, patient_id, denial_code\nFROM claims\nWHERE status = 'appealed'\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Count claims with processed_date IS NULL. One column: undecided.", code: `SELECT COUNT(*) AS undecided\nFROM claims\nWHERE processed_date IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "Primary-care load",
    scenario:
      "Scheduling wants the primary panel: who staffs it and what their diaries look like.",
    steps: [
      { prompt: "List primary-care providers: provider_id, name, facility, ordered by provider_id ascending.", code: `SELECT provider_id, name, facility\nFROM providers\nWHERE specialty = 'primary'\nORDER BY provider_id ASC;`, order: "exact" },
      { prompt: "Count visits per primary-care provider. Output provider_id and visit_count, ordered by provider_id ascending.", code: `SELECT pr.provider_id, COUNT(v.visit_id) AS visit_count\nFROM providers pr\nLEFT JOIN visits v ON v.provider_id = pr.provider_id\nWHERE pr.specialty = 'primary'\nGROUP BY pr.provider_id\nORDER BY pr.provider_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "Virtual cadence",
    scenario:
      "Telehealth adoption check: the volume, then the monthly shape.",
    steps: [
      { prompt: "Count telehealth visits. One column: tele_visits.", code: `SELECT COUNT(*) AS tele_visits\nFROM visits\nWHERE visit_type = 'telehealth';`, order: "exact" },
      { prompt: "Count telehealth visits per month. Output month (YYYY-MM of visit_date) and tele_count, ordered by month ascending.", code: `SELECT strftime('%Y-%m', visit_date) AS month, COUNT(*) AS tele_count\nFROM visits\nWHERE visit_type = 'telehealth'\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "Respiratory codes",
    scenario:
      "Coding audit on respiratory complaints: cough rows, then asthma rows.",
    steps: [
      { prompt: "Count diagnoses with icd_code = 'R05'. One column: r05_rows.", code: `SELECT COUNT(*) AS r05_rows\nFROM diagnoses\nWHERE icd_code = 'R05';`, order: "exact" },
      { prompt: "Count diagnoses with icd_code = 'J45'. One column: j45_rows.", code: `SELECT COUNT(*) AS j45_rows\nFROM diagnoses\nWHERE icd_code = 'J45';`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Whale census",
    scenario:
      "Utilization management flags patient 10: encounters booked, money billed.",
    steps: [
      { prompt: "Count patient 10's visits. One column: whale_visits.", code: `SELECT COUNT(*) AS whale_visits\nFROM visits\nWHERE patient_id = 10;`, order: "exact" },
      { prompt: "Sum patient 10's billed_cents across visits. One column: whale_billed.", code: `SELECT SUM(billed_cents) AS whale_billed\nFROM visits\nWHERE patient_id = 10;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Filing speed",
    scenario:
      "Revenue-cycle ops benchmarks its own submissions: the average lag, then the worst offender.",
    steps: [
      { prompt: "Compute the average filing lag in days (submitted_date minus visit_date) across all claims, rounded to 1 decimal. One column: avg_lag_days.", code: `SELECT ROUND(AVG(julianday(c.submitted_date) - julianday(v.visit_date)), 1) AS avg_lag_days\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id;`, order: "exact" },
      { prompt: "Find the maximum filing lag in days. One column: max_lag_days.", code: `SELECT MAX(CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT)) AS max_lag_days\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Paid leaderboard",
    scenario:
      "The medical-director review opens on utilization: who does the paid book actually belong to?",
    steps: [
      { prompt: "Top 5 patients by lifetime paid_cents. Output patient_id and paid, ordered by paid descending, then patient_id ascending.", code: `SELECT patient_id, SUM(paid_cents) AS paid\nFROM claims\nGROUP BY patient_id\nORDER BY paid DESC, patient_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "List the patients tied at exactly 40000 lifetime paid: patient_id, name, ordered by patient_id.", code: `SELECT p.patient_id, p.name\nFROM patients p\nJOIN claims c ON c.patient_id = p.patient_id\nGROUP BY p.patient_id\nHAVING SUM(c.paid_cents) = 40000\nORDER BY p.patient_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Payer economics",
    scenario:
      "Contracting wants the payer picture in money and in people.",
    steps: [
      { prompt: "Sum paid_cents per plan_type. Output plan_type and paid_total, ordered by paid_total descending.", code: `SELECT pay.plan_type, SUM(c.paid_cents) AS paid_total\nFROM claims c\nJOIN patients p ON p.patient_id = c.patient_id\nJOIN payers pay ON pay.payer_id = p.payer_id\nGROUP BY pay.plan_type\nORDER BY paid_total DESC;`, order: "exact" },
      { prompt: "Count distinct claiming patients per plan_type. Output plan_type and members, ordered by members descending, then plan_type ascending.", code: `SELECT pay.plan_type, COUNT(DISTINCT p.patient_id) AS members\nFROM claims c\nJOIN patients p ON p.patient_id = c.patient_id\nJOIN payers pay ON pay.payer_id = p.payer_id\nGROUP BY pay.plan_type\nORDER BY members DESC, pay.plan_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Cigna",
    title: "No-show board",
    scenario:
      "Access-to-care review: which diaries leak the most, and how bad is the worst rate?",
    steps: [
      { prompt: "Count no-shows per provider, only providers with at least one. Output provider_id and no_shows, ordered by no_shows descending, then provider_id ascending.", code: `SELECT provider_id, SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_shows\nFROM visits\nGROUP BY provider_id\nHAVING no_shows > 0\nORDER BY no_shows DESC, provider_id ASC;`, order: "exact" },
      { prompt: "For provider 4, output total booked visits and no_shows as two columns: total_visits, no_shows.", code: `SELECT COUNT(*) AS total_visits,\n       SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_shows\nFROM visits\nWHERE provider_id = 4;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Claimless encounters",
    scenario:
      "Billing completeness audit: prove how many encounters never produced a claim, then name them.",
    steps: [
      { prompt: "Count visits with no claim row. One column: claimless_visits.", code: `SELECT COUNT(*) AS claimless_visits\nFROM visits v\nWHERE NOT EXISTS (SELECT 1 FROM claims c WHERE c.visit_id = v.visit_id);`, order: "exact" },
      { prompt: "List them: visit_id, patient_id, visit_date, status, ordered by visit_id ascending.", code: `SELECT v.visit_id, v.patient_id, v.visit_date, v.status\nFROM visits v\nWHERE NOT EXISTS (SELECT 1 FROM claims c WHERE c.visit_id = v.visit_id)\nORDER BY v.visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "Denial economics",
    scenario:
      "The denial deep-dive: counts per code, then the billed money each code destroys.",
    steps: [
      { prompt: "Count denied claims per denial_code. Output denial_code and claim_count, ordered by claim_count descending, then denial_code ascending.", code: `SELECT denial_code, COUNT(*) AS claim_count\nFROM claims\nWHERE status = 'denied'\nGROUP BY denial_code\nORDER BY claim_count DESC, denial_code ASC;`, order: "exact" },
      { prompt: "Sum the visits' billed_cents per denial_code. Output denial_code and billed_total, ordered by billed_total descending.", code: `SELECT c.denial_code, SUM(v.billed_cents) AS billed_total\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nWHERE c.status = 'denied'\nGROUP BY c.denial_code\nORDER BY billed_total DESC;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "Filing cadence",
    scenario:
      "Revenue-cycle tempo: filings per month, then how fast each month's batch moved.",
    steps: [
      { prompt: "Count claims per submission month. Output month (YYYY-MM) and claim_count, ordered by month ascending.", code: `SELECT strftime('%Y-%m', submitted_date) AS month, COUNT(*) AS claim_count\nFROM claims\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Average filing lag per submission month, rounded to 1 decimal. Output month and avg_lag, ordered by month ascending.", code: `SELECT strftime('%Y-%m', c.submitted_date) AS month,\n       ROUND(AVG(julianday(c.submitted_date) - julianday(v.visit_date)), 1) AS avg_lag\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Facility board",
    scenario:
      "Finance wants facilities in collected money, then in gross bills.",
    steps: [
      { prompt: "Sum paid_cents per facility. Output facility and paid_total, ordered by paid_total descending.", code: `SELECT pr.facility, SUM(c.paid_cents) AS paid_total\nFROM providers pr\nJOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'\nJOIN claims c ON c.visit_id = v.visit_id\nGROUP BY pr.facility\nORDER BY paid_total DESC;`, order: "exact" },
      { prompt: "Sum billed_cents per facility over completed visits. Output facility and billed_total, ordered by billed_total descending.", code: `SELECT pr.facility, SUM(v.billed_cents) AS billed_total\nFROM providers pr\nJOIN visits v ON v.provider_id = pr.provider_id\nWHERE v.status = 'completed'\nGROUP BY pr.facility\nORDER BY billed_total DESC;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Length-of-stay study",
    scenario:
      "The utilization committee studies the stays: the board, then the mean.",
    steps: [
      { prompt: "List every inpatient stay with its LOS in days: visit_id, patient_id, los_days, ordered by los_days descending, then visit_id.", code: `SELECT visit_id, patient_id,\n       CAST(julianday(discharge_date) - julianday(visit_date) AS INT) AS los_days\nFROM visits\nWHERE visit_type = 'inpatient'\nORDER BY los_days DESC, visit_id ASC;`, order: "exact" },
      { prompt: "Compute the average LOS across inpatient stays, rounded to 2 decimals. One column: avg_los.", code: `SELECT ROUND(AVG(julianday(discharge_date) - julianday(visit_date)), 2) AS avg_los\nFROM visits\nWHERE visit_type = 'inpatient';`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Cigna",
    title: "Aging analysis",
    scenario:
      "The AR review: exact ages as of 2026-07-01, then the bucket census.",
    steps: [
      { prompt: "List pending claims with age in days as of 2026-07-01: claim_id, age_days, ordered by age_days descending.", code: `SELECT claim_id, CAST(julianday('2026-07-01') - julianday(submitted_date) AS INT) AS age_days\nFROM claims\nWHERE status = 'pending'\nORDER BY age_days DESC;`, order: "exact" },
      { prompt: "Bucket them (0-30 up to 30, 31-60 up to 60, 61-90 up to 90, else 91+). Output bucket and claim_count, ordered by bucket ascending.", code: `SELECT CASE\n         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 30 THEN '0-30'\n         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 60 THEN '31-60'\n         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 90 THEN '61-90'\n         ELSE '91+'\n       END AS bucket,\n       COUNT(*) AS claim_count\nFROM claims\nWHERE status = 'pending'\nGROUP BY bucket\nORDER BY bucket ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Specialty economics",
    scenario:
      "Service-line review: workload by specialty, then money by specialty.",
    steps: [
      { prompt: "Count completed visits per specialty. Output specialty and completed_visits, ordered by completed_visits descending, then specialty ascending.", code: `SELECT pr.specialty, COUNT(*) AS completed_visits\nFROM providers pr\nJOIN visits v ON v.provider_id = pr.provider_id\nWHERE v.status = 'completed'\nGROUP BY pr.specialty\nORDER BY completed_visits DESC, pr.specialty ASC;`, order: "exact" },
      { prompt: "Sum paid_cents per specialty (claims on completed visits only). Output specialty and paid_total, ordered by paid_total descending.", code: `SELECT pr.specialty, SUM(c.paid_cents) AS paid_total\nFROM providers pr\nJOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'\nJOIN claims c ON c.visit_id = v.visit_id\nGROUP BY pr.specialty\nORDER BY paid_total DESC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "Dormancy screen",
    scenario:
      "Member engagement: who has never shown up clinically, and what (if anything) did they do digitally?",
    steps: [
      { prompt: "List patients with zero visits: patient_id, name, enrolled_date, ordered by patient_id.", code: `SELECT p.patient_id, p.name, p.enrolled_date\nFROM patients p\nLEFT JOIN visits v ON v.patient_id = p.patient_id\nWHERE v.visit_id IS NULL\nORDER BY p.patient_id ASC;`, order: "exact" },
      { prompt: "List the portal events of patient 11: event_id, event_type, event_ts, ordered by event_id.", code: `SELECT event_id, event_type, event_ts\nFROM portal_events\nWHERE patient_id = 11\nORDER BY event_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "Corrected-claim audit",
    scenario:
      "One visit filed twice: pull both claims, then time the correction.",
    steps: [
      { prompt: "List the claims on visit 13: claim_id, status, denial_code, submitted_date, ordered by claim_id.", code: `SELECT claim_id, status, denial_code, submitted_date\nFROM claims\nWHERE visit_id = 13\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "For visit 13's claims, output claim_id and days_from_submission_to_decision (processed_date minus submitted_date), ordered by claim_id.", code: `SELECT claim_id,\n       CAST(julianday(processed_date) - julianday(submitted_date) AS INT) AS days_from_submission_to_decision\nFROM claims\nWHERE visit_id = 13\nORDER BY claim_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Regional books",
    scenario:
      "The geography of the book: money by region, then claims by region.",
    steps: [
      { prompt: "Sum paid_cents per region. Output region and paid_total, ordered by paid_total descending.", code: `SELECT p.region, SUM(c.paid_cents) AS paid_total\nFROM patients p\nJOIN claims c ON c.patient_id = p.patient_id\nGROUP BY p.region\nORDER BY paid_total DESC;`, order: "exact" },
      { prompt: "Count claims per region. Output region and claim_count, ordered by claim_count descending, then region ascending.", code: `SELECT p.region, COUNT(*) AS claim_count\nFROM patients p\nJOIN claims c ON c.patient_id = p.patient_id\nGROUP BY p.region\nORDER BY claim_count DESC, p.region ASC;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Chronic club",
    scenario:
      "Population health pulls the comorbidity cohort and measures its footprint.",
    steps: [
      { prompt: "List patients with both an E11 and an I10 PRIMARY diagnosis: patient_id, name, ordered by patient_id.", code: `SELECT p.patient_id, p.name\nFROM patients p\nJOIN diagnoses d ON d.patient_id = p.patient_id AND d.is_primary = 1\nWHERE d.icd_code IN ('E11', 'I10')\nGROUP BY p.patient_id\nHAVING COUNT(DISTINCT d.icd_code) = 2\nORDER BY p.patient_id ASC;`, order: "exact" },
      { prompt: "Count the visits made by those patients. One column: club_visits.", code: `SELECT COUNT(*) AS club_visits\nFROM visits\nWHERE patient_id IN (\n  SELECT d.patient_id\n  FROM diagnoses d\n  WHERE d.is_primary = 1 AND d.icd_code IN ('E11', 'I10')\n  GROUP BY d.patient_id\n  HAVING COUNT(DISTINCT d.icd_code) = 2\n);`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Cigna",
    title: "Heavy ER review",
    scenario:
      "Emergency utilization: the big-ticket ERs, then how their claims actually resolved.",
    steps: [
      { prompt: "List ER visits billed at 120000 or more: visit_id, patient_id, billed_cents, ordered by billed_cents descending, then visit_id.", code: `SELECT visit_id, patient_id, billed_cents\nFROM visits\nWHERE visit_type = 'er' AND billed_cents >= 120000\nORDER BY billed_cents DESC, visit_id ASC;`, order: "exact" },
      { prompt: "For those visits, list the claim outcomes: visit_id, status, denial_code, paid_cents, ordered by visit_id.", code: `SELECT v.visit_id, c.status, c.denial_code, c.paid_cents\nFROM visits v\nJOIN claims c ON c.visit_id = v.visit_id\nWHERE v.visit_type = 'er' AND v.billed_cents >= 120000\nORDER BY v.visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Lag extremes",
    scenario:
      "Filing discipline from both ends: the five slowest, then the five fastest.",
    steps: [
      { prompt: "Top 5 claims by filing lag: claim_id, lag_days, ordered by lag descending, then claim_id.", code: `SELECT c.claim_id, CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) AS lag_days\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nORDER BY lag_days DESC, c.claim_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "Bottom 5 claims by filing lag: claim_id, lag_days, ordered by lag ascending, then claim_id.", code: `SELECT c.claim_id, CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) AS lag_days\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nORDER BY lag_days ASC, c.claim_id ASC\nLIMIT 5;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "Digital engagement",
    scenario:
      "The engagement heatmap starts with footprints: everyone's counts, then the ghost's file.",
    steps: [
      { prompt: "Count portal events per patient. Output patient_id and event_count, ordered by event_count descending, then patient_id ascending.", code: `SELECT p.patient_id, COUNT(e.event_id) AS event_count\nFROM patients p\nLEFT JOIN portal_events e ON e.patient_id = p.patient_id\nGROUP BY p.patient_id\nORDER BY event_count DESC, p.patient_id ASC;`, order: "exact" },
      { prompt: "Count distinct ACTIVE DAYS (dates with any event) per patient for patients 1 and 10. Output patient_id and active_days, ordered by patient_id.", code: `SELECT patient_id, COUNT(DISTINCT strftime('%Y-%m-%d', event_ts, 'unixepoch')) AS active_days\nFROM portal_events\nWHERE patient_id IN (1, 10)\nGROUP BY patient_id\nORDER BY patient_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "Denied money audit",
    scenario:
      "What did the payers refuse, in billed terms and in allowed terms?",
    steps: [
      { prompt: "Sum billed_cents of the visits behind denied claims. One column: denied_billed.", code: `SELECT SUM(v.billed_cents) AS denied_billed\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nWHERE c.status = 'denied';`, order: "exact" },
      { prompt: "Sum allowed_cents of denied claims. One column: denied_allowed.", code: `SELECT SUM(allowed_cents) AS denied_allowed\nFROM claims\nWHERE status = 'denied';`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Payer claim mix",
    scenario:
      "Each payer's book: volume first, then yield per claim.",
    steps: [
      { prompt: "Count claims per payer name. Output name and claim_count, ordered by claim_count descending, then name ascending.", code: `SELECT pay.name, COUNT(*) AS claim_count\nFROM claims c\nJOIN patients p ON p.patient_id = c.patient_id\nJOIN payers pay ON pay.payer_id = p.payer_id\nGROUP BY pay.payer_id\nORDER BY claim_count DESC, pay.name ASC;`, order: "exact" },
      { prompt: "Average paid_cents per payer name, rounded to 2 decimals. Output name and avg_paid, ordered by avg_paid descending.", code: `SELECT pay.name, ROUND(AVG(c.paid_cents), 2) AS avg_paid\nFROM claims c\nJOIN patients p ON p.patient_id = c.patient_id\nJOIN payers pay ON pay.payer_id = p.payer_id\nGROUP BY pay.payer_id\nORDER BY avg_paid DESC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Comorbidity census",
    scenario:
      "Coding richness review: how many encounters carry multiple diagnoses, then their code strings.",
    steps: [
      { prompt: "Count visits with 2 or more diagnosis rows. One column: multi_dx_visits.", code: `SELECT COUNT(*) AS multi_dx_visits\nFROM (\n  SELECT visit_id FROM diagnoses GROUP BY visit_id HAVING COUNT(*) >= 2\n);`, order: "exact" },
      { prompt: "List them: visit_id, patient_id, dx_codes (GROUP_CONCAT of icd_code ordered by dx_id), ordered by visit_id.", code: `SELECT v.visit_id, v.patient_id,\n       (SELECT GROUP_CONCAT(d2.icd_code) FROM diagnoses d2 WHERE d2.visit_id = v.visit_id ORDER BY d2.dx_id) AS dx_codes\nFROM visits v\nJOIN diagnoses d ON d.visit_id = v.visit_id\nGROUP BY v.visit_id\nHAVING COUNT(*) >= 2\nORDER BY v.visit_id ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Cigna",
    title: "Readmission detector",
    scenario:
      "Quality office: build the readmission pairs and put names and dates on them.",
    steps: [
      { prompt: "List every inpatient-to-inpatient re-entry pair: patient_id, prev_visit_id, next_visit_id, gap_days (discharge to next admission), ordered by gap ascending, then patient_id.", code: `SELECT a.patient_id, a.visit_id AS prev_visit_id, b.visit_id AS next_visit_id,\n       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days\nFROM visits a\nJOIN visits b ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient' AND b.visit_date > a.visit_date\nWHERE a.visit_type = 'inpatient'\nORDER BY gap_days ASC, a.patient_id ASC;`, order: "exact" },
      { prompt: "Same pairs with names and dates: name, gap_days, prev_date (the earlier visit_date), next_date, ordered by gap ascending.", code: `SELECT p.name,\n       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days,\n       a.visit_date AS prev_date, b.visit_date AS next_date\nFROM visits a\nJOIN visits b ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient' AND b.visit_date > a.visit_date\nJOIN patients p ON p.patient_id = a.patient_id\nWHERE a.visit_type = 'inpatient'\nORDER BY gap_days ASC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Window policy stress test",
    scenario:
      "Policy wants to know who a strict 30-day readmission rule misses that an inclusive one catches.",
    steps: [
      { prompt: "List patients with a readmission gap STRICTLY under 30 days: patient_id, gap_days, ordered by gap ascending.", code: `SELECT a.patient_id,\n       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days\nFROM visits a\nJOIN visits b ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient' AND b.visit_date > a.visit_date\nWHERE a.visit_type = 'inpatient'\n  AND julianday(b.visit_date) - julianday(a.discharge_date) < 30\nORDER BY gap_days ASC;`, order: "exact" },
      { prompt: "Same but inclusive (gap <= 30): patient_id, gap_days, ordered by gap ascending.", code: `SELECT a.patient_id,\n       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days\nFROM visits a\nJOIN visits b ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient' AND b.visit_date > a.visit_date\nWHERE a.visit_type = 'inpatient'\n  AND julianday(b.visit_date) - julianday(a.discharge_date) <= 30\nORDER BY gap_days ASC;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "Timely-filing wall",
    scenario:
      "Revenue integrity rebuilds the filing wall: the casualties, then the survivor on the line.",
    steps: [
      { prompt: "List claims with filing lag >= 90 days: claim_id, lag_days, status, denial_code, ordered by lag descending.", code: `SELECT c.claim_id,\n       CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) AS lag_days,\n       c.status, c.denial_code\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nWHERE julianday(c.submitted_date) - julianday(v.visit_date) >= 90\nORDER BY lag_days DESC;`, order: "exact" },
      { prompt: "List the claims with filing lag EXACTLY 90 days: claim_id, status, denial_code, paid_cents.", code: `SELECT c.claim_id, c.status, c.denial_code, c.paid_cents\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nWHERE julianday(c.submitted_date) - julianday(v.visit_date) = 90;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "Velocity forensics",
    scenario:
      "Digital fraud review: the appointment-booking pairs, then the inclusive-versus-strict comparison.",
    steps: [
      { prompt: "List appt_book pairs with gap <= 300 seconds: patient_id, first_event_id, second_event_id, gap_seconds, ordered by patient_id, then gap_seconds, then first_event_id.", code: `SELECT a.patient_id, a.event_id AS first_event_id, b.event_id AS second_event_id,\n       b.event_ts - a.event_ts AS gap_seconds\nFROM portal_events a\nJOIN portal_events b ON b.patient_id = a.patient_id AND a.event_id < b.event_id\nWHERE a.event_type = 'appt_book' AND b.event_type = 'appt_book'\n  AND b.event_ts - a.event_ts <= 300\nORDER BY a.patient_id ASC, gap_seconds ASC, a.event_id ASC;`, order: "exact" },
      { prompt: "One row comparing the pair counts: inclusive_pairs (gap <= 300) and strict_pairs (gap < 300).", code: `SELECT\n  COUNT(CASE WHEN b.event_ts - a.event_ts <= 300 THEN 1 END) AS inclusive_pairs,\n  COUNT(CASE WHEN b.event_ts - a.event_ts < 300 THEN 1 END) AS strict_pairs\nFROM portal_events a\nJOIN portal_events b ON b.patient_id = a.patient_id AND a.event_id < b.event_id\nWHERE a.event_type = 'appt_book' AND b.event_type = 'appt_book';`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "Portal sessionization",
    scenario:
      "The digital team cuts timelines into sessions at a 1800-second gap cutoff and reports per patient, then totals.",
    steps: [
      { prompt: "Sessions per patient (new session when gap > 1800s): patient_id, session_count, ordered by patient_id.", code: `WITH seq AS (\n  SELECT patient_id, event_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS prev_ts\n  FROM portal_events\n),\nflags AS (\n  SELECT patient_id, event_id,\n         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS is_start\n  FROM seq\n),\nmarked AS (\n  SELECT *, SUM(is_start) OVER (PARTITION BY patient_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM flags\n)\nSELECT patient_id, COUNT(DISTINCT session_no) AS session_count\nFROM marked\nGROUP BY patient_id\nORDER BY patient_id ASC;`, order: "exact" },
      { prompt: "Total sessions across the whole book. One column: total_sessions.", code: `WITH seq AS (\n  SELECT patient_id, event_id, event_ts,\n         LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS prev_ts\n  FROM portal_events\n),\nflags AS (\n  SELECT patient_id, event_id,\n         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS is_start\n  FROM seq\n),\nmarked AS (\n  SELECT *, SUM(is_start) OVER (PARTITION BY patient_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM flags\n)\nSELECT COUNT(DISTINCT patient_id || '-' || session_no) AS total_sessions\nFROM marked;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "CVS Health",
    title: "The whale flip",
    scenario:
      "Governance asks what the regional board looks like without its one-patient story.",
    steps: [
      { prompt: "Per region, paid with and without patient 10: region, paid_with_whale, paid_without_whale, ordered by paid_with_whale descending.", code: `SELECT p.region,\n       SUM(c.paid_cents) AS paid_with_whale,\n       SUM(CASE WHEN p.patient_id <> 10 THEN c.paid_cents ELSE 0 END) AS paid_without_whale\nFROM patients p\nJOIN claims c ON c.patient_id = p.patient_id\nGROUP BY p.region\nORDER BY paid_with_whale DESC;`, order: "exact" },
      { prompt: "The ex-whale leaderboard with ranks: region, paid_without_whale, rnk (RANK by paid_without_whale descending), ordered by rnk ascending.", code: `SELECT p.region,\n       SUM(CASE WHEN p.patient_id <> 10 THEN c.paid_cents ELSE 0 END) AS paid_without_whale,\n       RANK() OVER (ORDER BY SUM(CASE WHEN p.patient_id <> 10 THEN c.paid_cents ELSE 0 END) DESC) AS rnk\nFROM patients p\nJOIN claims c ON c.patient_id = p.patient_id\nGROUP BY p.region\nORDER BY rnk ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Cigna",
    title: "Two ranks, one tie",
    scenario:
      "Analytics QA verifies the ranking semantics on the 40000 tie before the board pack ships.",
    steps: [
      { prompt: "Rank patients by lifetime paid with RANK: patient_id, paid, rnk, ordered by paid descending, then patient_id.", code: `SELECT patient_id, SUM(paid_cents) AS paid,\n       RANK() OVER (ORDER BY SUM(paid_cents) DESC) AS rnk\nFROM claims\nGROUP BY patient_id\nORDER BY paid DESC, patient_id ASC;`, order: "exact" },
      { prompt: "Rank with DENSE_RANK instead: patient_id, paid, drank, ordered by paid descending, then patient_id.", code: `SELECT patient_id, SUM(paid_cents) AS paid,\n       DENSE_RANK() OVER (ORDER BY SUM(paid_cents) DESC) AS drank\nFROM claims\nGROUP BY patient_id\nORDER BY paid DESC, patient_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Running book",
    scenario:
      "The CFO wants the settlement curve and its biggest single jump.",
    steps: [
      { prompt: "Monthly paid with a running total: month (YYYY-MM of processed_date), paid_in_month, running_paid, ordered by month ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', processed_date) AS month, SUM(paid_cents) AS paid_in_month\n  FROM claims WHERE status = 'paid' GROUP BY month\n)\nSELECT month, paid_in_month,\n       SUM(paid_in_month) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS running_paid\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
      { prompt: "The single biggest month-over-month JUMP: month, mom_delta (positive), ordered by mom_delta descending, limit 1.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', processed_date) AS month, SUM(paid_cents) AS paid_in_month\n  FROM claims WHERE status = 'paid' GROUP BY month\n),\ndeltas AS (\n  SELECT month, paid_in_month - LAG(paid_in_month) OVER (ORDER BY month) AS mom_delta\n  FROM monthly\n)\nSELECT month, mom_delta FROM deltas\nWHERE mom_delta IS NOT NULL\nORDER BY mom_delta DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "Denial ledger",
    scenario:
      "The board pack prices the denial book: billed shares, then allowed shares.",
    steps: [
      { prompt: "Per denial code: billed_total and billed_share_pct (share of all denied billed, 1 decimal), ordered by billed_total descending.", code: `WITH denied AS (\n  SELECT c.denial_code, SUM(v.billed_cents) AS billed_total\n  FROM claims c JOIN visits v ON v.visit_id = c.visit_id\n  WHERE c.status = 'denied' GROUP BY c.denial_code\n)\nSELECT denial_code, billed_total,\n       ROUND(billed_total * 100.0 / (SELECT SUM(billed_total) FROM denied), 1) AS billed_share_pct\nFROM denied\nORDER BY billed_total DESC;`, order: "exact" },
      { prompt: "Per denial code: allowed_total and allowed_share_pct (share of all denied allowed, 1 decimal), ordered by allowed_total descending.", code: `WITH denied AS (\n  SELECT denial_code, SUM(allowed_cents) AS allowed_total\n  FROM claims WHERE status = 'denied' GROUP BY denial_code\n)\nSELECT denial_code, allowed_total,\n       ROUND(allowed_total * 100.0 / (SELECT SUM(allowed_total) FROM denied), 1) AS allowed_share_pct\nFROM denied\nORDER BY allowed_total DESC;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "Tie registry",
    scenario:
      "The leaderboard footnote: register the ties, then document the members' claim shapes.",
    steps: [
      { prompt: "Group patients by lifetime paid total; keep ties only. Output paid_cents, member_ids (GROUP_CONCAT of patient_id in ascending order), ordered by paid_cents descending.", code: `WITH totals AS (\n  SELECT patient_id, SUM(paid_cents) AS paid_cents\n  FROM claims GROUP BY patient_id\n)\nSELECT paid_cents, GROUP_CONCAT(patient_id) AS member_ids\nFROM (SELECT paid_cents, patient_id FROM totals ORDER BY paid_cents DESC, patient_id ASC)\nGROUP BY paid_cents\nHAVING COUNT(*) > 1\nORDER BY paid_cents DESC;`, order: "exact" },
      { prompt: "Document the tie members' shapes: for patients 1 and 4, output patient_id and claim_count (paid claims), ordered by patient_id.", code: `SELECT patient_id, COUNT(*) AS claim_count\nFROM claims\nWHERE patient_id IN (1, 4) AND status = 'paid'\nGROUP BY patient_id\nORDER BY patient_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "MoM movement",
    scenario:
      "The settlement story in deltas: the full series, then the deepest single drop.",
    steps: [
      { prompt: "Monthly paid and MoM delta: month, paid_in_month, mom_delta (NULL first), ordered by month ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', processed_date) AS month, SUM(paid_cents) AS paid_in_month\n  FROM claims WHERE status = 'paid' GROUP BY month\n)\nSELECT month, paid_in_month,\n       paid_in_month - LAG(paid_in_month) OVER (ORDER BY month) AS mom_delta\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
      { prompt: "The biggest month-over-month DROP: month, mom_delta (negative), ordered by mom_delta ascending, limit 1.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', processed_date) AS month, SUM(paid_cents) AS paid_in_month\n  FROM claims WHERE status = 'paid' GROUP BY month\n),\ndeltas AS (\n  SELECT month, paid_in_month - LAG(paid_in_month) OVER (ORDER BY month) AS mom_delta\n  FROM monthly\n)\nSELECT month, mom_delta FROM deltas\nWHERE mom_delta IS NOT NULL\nORDER BY mom_delta ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "CVS Health",
    title: "Bill-pay forensics",
    scenario:
      "How long do members sit before paying? Compute all gaps first, then isolate the payments — including the pair that lands exactly on the session line.",
    steps: [
      { prompt: "For each bill_pay event: patient_id, event_id, gap_seconds (from the patient's previous event of ANY type), ordered by event_id.", code: `WITH gaps AS (\n  SELECT patient_id, event_id, event_type,\n         event_ts - LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS gap_seconds\n  FROM portal_events\n)\nSELECT patient_id, event_id, gap_seconds\nFROM gaps\nWHERE event_type = 'bill_pay'\nORDER BY event_id ASC;`, order: "exact" },
      { prompt: "List the bill_pay events whose gap is EXACTLY 1800 seconds: patient_id, event_id, gap_seconds.", code: `WITH gaps AS (\n  SELECT patient_id, event_id, event_type,\n         event_ts - LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS gap_seconds\n  FROM portal_events\n)\nSELECT patient_id, event_id, gap_seconds\nFROM gaps\nWHERE event_type = 'bill_pay' AND gap_seconds = 1800;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Cigna",
    title: "Batching fingerprints",
    scenario:
      "Operations suspects batch filing. Prove it: the same-day same-payer pairs, then how many pairs each day holds.",
    steps: [
      { prompt: "List same-payer same-day claim pairs (a.claim_id < b.claim_id): claim_id_a, claim_id_b, payer_id, submitted_date, ordered by submitted_date, then claim_id_a.", code: `SELECT a.claim_id AS claim_id_a, b.claim_id AS claim_id_b,\n       a.payer_id, a.submitted_date\nFROM claims a\nJOIN claims b ON a.claim_id < b.claim_id AND a.payer_id = b.payer_id AND a.submitted_date = b.submitted_date\nORDER BY a.submitted_date ASC, a.claim_id ASC;`, order: "exact" },
      { prompt: "Count the pairs per submitted_date. Output submitted_date and pair_count, ordered by submitted_date ascending.", code: `SELECT a.submitted_date, COUNT(*) AS pair_count\nFROM claims a\nJOIN claims b ON a.claim_id < b.claim_id AND a.payer_id = b.payer_id AND a.submitted_date = b.submitted_date\nGROUP BY a.submitted_date\nORDER BY a.submitted_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Money shapes",
    scenario:
      "Duplicate-fingerprint hunt: the repeated (billed, allowed) shapes, then the visits behind the top shape.",
    steps: [
      { prompt: "Group adjudicated claims by billed and allowed; keep shapes with 2+ claims. Output billed_cents, allowed_cents, shape_count, ordered by shape_count descending, then billed_cents descending.", code: `SELECT v.billed_cents, c.allowed_cents, COUNT(*) AS shape_count\nFROM claims c\nJOIN visits v ON v.visit_id = c.visit_id\nWHERE c.allowed_cents IS NOT NULL\nGROUP BY v.billed_cents, c.allowed_cents\nHAVING COUNT(*) >= 2\nORDER BY shape_count DESC, v.billed_cents DESC;`, order: "exact" },
      { prompt: "List the visits behind the (19000, 15200) triplet: visit_id, patient_id, visit_date, ordered by visit_date, then visit_id.", code: `SELECT v.visit_id, v.patient_id, v.visit_date\nFROM visits v\nJOIN claims c ON c.visit_id = v.visit_id\nWHERE v.billed_cents = 19000 AND c.allowed_cents = 15200\nORDER BY v.visit_date ASC, v.visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "Multi-dx dossier",
    scenario:
      "Coding complexity: the multi-diagnosis board, then the three-code admission in full.",
    steps: [
      { prompt: "List visits with 2+ diagnosis rows: visit_id, patient_id, dx_codes (GROUP_CONCAT ordered by dx_id), ordered by visit_id.", code: `SELECT v.visit_id, v.patient_id,\n       (SELECT GROUP_CONCAT(d2.icd_code) FROM diagnoses d2 WHERE d2.visit_id = v.visit_id ORDER BY d2.dx_id) AS dx_codes\nFROM visits v\nJOIN diagnoses d ON d.visit_id = v.visit_id\nGROUP BY v.visit_id\nHAVING COUNT(*) >= 2\nORDER BY v.visit_id ASC;`, order: "exact" },
      { prompt: "Full detail for visits with 3+ diagnosis rows: visit_id, patient_id, dx_count, ordered by visit_id.", code: `SELECT v.visit_id, v.patient_id, COUNT(*) AS dx_count\nFROM visits v\nJOIN diagnoses d ON d.visit_id = v.visit_id\nGROUP BY v.visit_id\nHAVING COUNT(*) >= 3\nORDER BY v.visit_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "Panel coverage",
    scenario:
      "Credentialing checks for idle panels: who completed fewer than two encounters, and what does their diary actually hold?",
    steps: [
      { prompt: "Providers with fewer than 2 completed visits: provider_id, name, completed_visits, ordered by provider_id.", code: `SELECT pr.provider_id, pr.name, COUNT(v.visit_id) AS completed_visits\nFROM providers pr\nLEFT JOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'\nGROUP BY pr.provider_id\nHAVING COUNT(v.visit_id) < 2\nORDER BY pr.provider_id ASC;`, order: "exact" },
      { prompt: "List ALL visits (any status) for those providers: provider_id, visit_id, visit_date, status, ordered by provider_id, then visit_date.", code: `SELECT v.provider_id, v.visit_id, v.visit_date, v.status\nFROM visits v\nWHERE v.provider_id IN (\n  SELECT provider_id FROM (\n    SELECT pr.provider_id AS provider_id, COUNT(v2.visit_id) AS n\n    FROM providers pr\n    LEFT JOIN visits v2 ON v2.provider_id = pr.provider_id AND v2.status = 'completed'\n    GROUP BY pr.provider_id\n    HAVING COUNT(v2.visit_id) < 2\n  )\n)\nORDER BY v.provider_id ASC, v.visit_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "Concentration risk",
    scenario:
      "Governance prices the concentration: top-patient share per region, then the same picture with the whale removed.",
    steps: [
      { prompt: "Top patient share per region: region, top_patient_id, top_share_pct (1 decimal), ordered by top_share_pct descending.", code: `WITH tp AS (\n  SELECT p.region, p.patient_id, SUM(c.paid_cents) AS paid\n  FROM patients p JOIN claims c ON c.patient_id = p.patient_id\n  GROUP BY p.region, p.patient_id\n),\nrk AS (\n  SELECT region, patient_id, paid,\n         ROW_NUMBER() OVER (PARTITION BY region ORDER BY paid DESC, patient_id ASC) AS rn\n  FROM tp\n),\nrt AS (\n  SELECT p.region, SUM(c.paid_cents) AS total\n  FROM patients p JOIN claims c ON c.patient_id = p.patient_id\n  GROUP BY p.region\n)\nSELECT rk.region, rk.patient_id AS top_patient_id,\n       ROUND(rk.paid * 100.0 / rt.total, 1) AS top_share_pct\nFROM rk JOIN rt ON rt.region = rk.region\nWHERE rk.rn = 1\nORDER BY top_share_pct DESC;`, order: "exact" },
      { prompt: "Ex-whale top share per region (patient 10 excluded everywhere): region, top_patient_id, top_share_pct, ordered by top_share_pct descending.", code: `WITH tp AS (\n  SELECT p.region, p.patient_id, SUM(c.paid_cents) AS paid\n  FROM patients p JOIN claims c ON c.patient_id = p.patient_id\n  WHERE p.patient_id <> 10\n  GROUP BY p.region, p.patient_id\n),\nrk AS (\n  SELECT region, patient_id, paid,\n         ROW_NUMBER() OVER (PARTITION BY region ORDER BY paid DESC, patient_id ASC) AS rn\n  FROM tp\n),\nrt AS (\n  SELECT p.region, SUM(c.paid_cents) AS total\n  FROM patients p JOIN claims c ON c.patient_id = p.patient_id\n  WHERE p.patient_id <> 10\n  GROUP BY p.region\n)\nSELECT rk.region, rk.patient_id AS top_patient_id,\n       ROUND(rk.paid * 100.0 / rt.total, 1) AS top_share_pct\nFROM rk JOIN rt ON rt.region = rk.region\nWHERE rk.rn = 1\nORDER BY top_share_pct DESC;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "CVS Health",
    title: "Portal heatmap",
    scenario:
      "The digital dashboard: events by day and type, then events by patient and day.",
    steps: [
      { prompt: "Count events per day per type. Output day (YYYY-MM-DD), event_type, event_count, ordered by day, then event_type.", code: `SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       event_type, COUNT(*) AS event_count\nFROM portal_events\nGROUP BY day, event_type\nORDER BY day ASC, event_type ASC;`, order: "exact" },
      { prompt: "Count events per patient per day. Output patient_id, day, event_count, ordered by patient_id, then day.", code: `SELECT patient_id,\n       strftime('%Y-%m-%d', event_ts, 'unixepoch') AS day,\n       COUNT(*) AS event_count\nFROM portal_events\nGROUP BY patient_id, day\nORDER BY patient_id ASC, day ASC;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Cigna",
    title: "Case-management dossier",
    scenario:
      "Case managers get the readmission file: the pairs in full, then what each patient's admissions cost in total.",
    steps: [
      { prompt: "Readmission pairs in full: name, gap_days, first_los, second_los, combined_billed, ordered by gap ascending.", code: `SELECT p.name,\n       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days,\n       CAST(julianday(a.discharge_date) - julianday(a.visit_date) AS INT) AS first_los,\n       CAST(julianday(b.discharge_date) - julianday(b.visit_date) AS INT) AS second_los,\n       a.billed_cents + b.billed_cents AS combined_billed\nFROM visits a\nJOIN visits b ON b.patient_id = a.patient_id AND b.visit_type = 'inpatient' AND b.visit_date > a.visit_date\nJOIN patients p ON p.patient_id = a.patient_id\nWHERE a.visit_type = 'inpatient'\nORDER BY gap_days ASC;`, order: "exact" },
      { prompt: "Total billed across ALL inpatient stays per readmitted patient (patients 2, 5 and 10): patient_id, inpatient_billed, ordered by inpatient_billed descending.", code: `SELECT patient_id, SUM(billed_cents) AS inpatient_billed\nFROM visits\nWHERE visit_type = 'inpatient' AND patient_id IN (2, 5, 10)\nGROUP BY patient_id\nORDER BY inpatient_billed DESC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Growth calendar",
    scenario:
      "Growth reviews the cohort engine: the full month calendar with its empty month, then the cohort split by year.",
    steps: [
      { prompt: "Enrollment calendar 2025-10 to 2026-06 including empty months: month, new_members, ordered by month ascending.", code: `WITH RECURSIVE months(m) AS (\n  VALUES ('2025-10')\n  UNION ALL\n  SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM months WHERE m < '2026-06'\n)\nSELECT m AS month, COUNT(p.patient_id) AS new_members\nFROM months\nLEFT JOIN patients p ON strftime('%Y-%m', p.enrolled_date) = m\nGROUP BY m\nORDER BY m ASC;`, order: "exact" },
      { prompt: "Count patients per enrollment YEAR: enrollment_year, member_count, ordered by enrollment_year ascending.", code: `SELECT strftime('%Y', enrolled_date) AS enrollment_year, COUNT(*) AS member_count\nFROM patients\nGROUP BY enrollment_year\nORDER BY enrollment_year ASC;`, order: "exact" },
    ],
  },
];
