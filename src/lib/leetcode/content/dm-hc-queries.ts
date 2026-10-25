// Domain Mastery — Healthcare & Claims · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in dm-hc-seed.ts.
// Statements cite only probe-verified facts (scripts/r13-hc-probe.ts +
// scripts/r13-facts.txt). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_HC_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Paid claim count",
    statement:
      "The claim book mixes paid, denied, pending and appealed rows. Count how many claims have status 'paid'. Output a single column paid_claims with one row.",
    code: `SELECT COUNT(*) AS paid_claims
FROM claims
WHERE status = 'paid';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "CVS Health",
    title: "The March board",
    statement:
      "List every encounter booked in March 2026. Output visit_id, patient_id, provider_id, visit_date, visit_type and status, ordered by visit_date ascending. Eight encounters happened that month — including the readmission that lands on the 30-day line.",
    code: `SELECT visit_id, patient_id, provider_id, visit_date, visit_type, status
FROM visits
WHERE visit_date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY visit_date ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Cigna",
    title: "Encounter types",
    statement:
      "List every distinct visit_type value in the visits table, one per row, ordered alphabetically. Single column: visit_type.",
    code: `SELECT DISTINCT visit_type
FROM visits
ORDER BY visit_type ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "Claim status census",
    statement:
      "Count the claims per status. Output status and claim_count, ordered by claim_count descending, then status ascending. Paid dominates; the appeal shows up as a single row.",
    code: `SELECT status, COUNT(*) AS claim_count
FROM claims
GROUP BY status
ORDER BY claim_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "The denial list",
    statement:
      "List every denied claim. Output claim_id, patient_id, denial_code, allowed_cents and paid_cents, ordered by claim_id ascending. Note what the payer paid on every one of them.",
    code: `SELECT claim_id, patient_id, denial_code, allowed_cents, paid_cents
FROM claims
WHERE status = 'denied'
ORDER BY claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "Provider directory",
    statement:
      "List the full provider roster. Output provider_id, name, specialty, facility and region, ordered by provider_id ascending.",
    code: `SELECT provider_id, name, specialty, facility, region
FROM providers
ORDER BY provider_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Seniors on the books",
    statement:
      "List the patients born in 1970 or earlier. Output patient_id, name, birth_year and region, ordered by birth_year ascending (oldest first). Three of them, and the whale is the oldest.",
    code: `SELECT patient_id, name, birth_year, region
FROM patients
WHERE birth_year <= 1970
ORDER BY birth_year ASC;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Portal bill payments",
    statement:
      "List the portal bill_pay events. Output event_id, patient_id, event_type and event_ts, ordered by event_ts ascending. Only two patients ever paid a bill through the portal.",
    code: `SELECT event_id, patient_id, event_type, event_ts
FROM portal_events
WHERE event_type = 'bill_pay'
ORDER BY event_ts ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Cigna",
    title: "Inpatient encounters",
    statement:
      "List every inpatient visit. Output visit_id, patient_id, visit_date, discharge_date and billed_cents, ordered by visit_date ascending. Every admission carries a discharge date — that pairing powers the readmission work later.",
    code: `SELECT visit_id, patient_id, visit_date, discharge_date, billed_cents
FROM visits
WHERE visit_type = 'inpatient'
ORDER BY visit_date ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "Zero-billed encounters",
    statement:
      "List the visits whose billed_cents is 0. Output visit_id, patient_id, visit_date, visit_type and status, ordered by visit_id ascending. These are the no-shows and cancellations — encounters that never happened.",
    code: `SELECT visit_id, patient_id, visit_date, visit_type, status
FROM visits
WHERE billed_cents = 0
ORDER BY visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "Payer directory",
    statement:
      "List the payers. Output payer_id, name and plan_type, ordered by payer_id ascending. Three plans cover the whole membership.",
    code: `SELECT payer_id, name, plan_type
FROM payers
ORDER BY payer_id ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "The diabetes registry",
    statement:
      "List the diagnosis rows for ICD code 'E11' (type-2 diabetes) that are the PRIMARY diagnosis of their encounter. Output dx_id, visit_id, patient_id and is_primary, ordered by patient_id, then visit_id. Eight encounters across four patients.",
    code: `SELECT dx_id, visit_id, patient_id, is_primary
FROM diagnoses
WHERE icd_code = 'E11' AND is_primary = 1
ORDER BY patient_id ASC, visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "Still waiting",
    statement:
      "List the pending claims. Output claim_id, patient_id, submitted_date, allowed_cents and paid_cents, ordered by submitted_date ascending (oldest first). Notice the NULLs — pending money has not been adjudicated yet.",
    code: `SELECT claim_id, patient_id, submitted_date, allowed_cents, paid_cents
FROM claims
WHERE status = 'pending'
ORDER BY submitted_date ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Telehealth cadence",
    statement:
      "List every telehealth visit. Output visit_id, patient_id, provider_id and visit_date, ordered by visit_date ascending. Fourteen rows — the virtual panel never sleeps.",
    code: `SELECT visit_id, patient_id, provider_id, visit_date
FROM visits
WHERE visit_type = 'telehealth'
ORDER BY visit_date ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Cigna",
    title: "The appeal in flight",
    statement:
      "List the appealed claims — the ones still fighting a denial. Output claim_id, visit_id, patient_id, denial_code, paid_cents and processed_date, ordered by claim_id. Exactly one row, and its money columns are still NULL.",
    code: `SELECT claim_id, visit_id, patient_id, denial_code, paid_cents, processed_date
FROM claims
WHERE status = 'appealed'
ORDER BY claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Oscar Health",
    title: "The primary-care panel",
    statement:
      "List the providers whose specialty is 'primary'. Output provider_id, name, facility and region, ordered by provider_id. Two of them share the Meridian Main panel; one works the virtual hub.",
    code: `SELECT provider_id, name, facility, region
FROM providers
WHERE specialty = 'primary'
ORDER BY provider_id ASC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Meridian Care",
    title: "The 2026 intake",
    statement:
      "List the patients who enrolled in 2026. Output patient_id, name, region, payer_id and enrolled_date, ordered by enrolled_date ascending. Six new members — and none arrived in March.",
    code: `SELECT patient_id, name, region, payer_id, enrolled_date
FROM patients
WHERE enrolled_date >= '2026-01-01'
ORDER BY enrolled_date ASC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Claimsbridge",
    title: "Cough cases",
    statement:
      "List every diagnosis row carrying ICD code 'R05' (cough) — primary or not. Output dx_id, visit_id, patient_id and is_primary, ordered by visit_id, then dx_id. Seven rows: six primary encounters and one secondary note.",
    code: `SELECT dx_id, visit_id, patient_id, is_primary
FROM diagnoses
WHERE icd_code = 'R05'
ORDER BY visit_id ASC, dx_id ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "UnitedHealth",
    title: "The whale's year",
    statement:
      "List every visit for patient 10. Output visit_id, visit_date, visit_type, status and billed_cents, ordered by visit_date, then visit_id. Twelve encounters in six months — the definition of a high utilizer.",
    code: `SELECT visit_id, visit_date, visit_type, status, billed_cents
FROM visits
WHERE patient_id = 10
ORDER BY visit_date ASC, visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "CVS Health",
    title: "Settled in June",
    statement:
      "List the claims processed in June 2026. Output claim_id, patient_id, processed_date and paid_cents, ordered by processed_date, then claim_id. Six claims closed the month's books.",
    code: `SELECT claim_id, patient_id, processed_date, paid_cents
FROM claims
WHERE processed_date BETWEEN '2026-06-01' AND '2026-06-30'
ORDER BY processed_date ASC, claim_id ASC;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Lifetime paid leaderboard",
    statement:
      "Every patient, ranked by what their claims actually paid out — lifetime. Output patient_id, name and paid_cents (SUM of paid, 0 when the patient has no claims), ordered by paid descending, then patient_id. The dormant member anchors the bottom with an honest zero.",
    code: `SELECT p.patient_id, p.name, COALESCE(SUM(c.paid_cents), 0) AS paid_cents
FROM patients p
LEFT JOIN claims c ON c.patient_id = p.patient_id
GROUP BY p.patient_id
ORDER BY paid_cents DESC, p.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Payer economics",
    statement:
      "How much does each plan type pay out, and for how many members? Output plan_type, members (distinct patients with claims) and paid_total, ordered by paid_total descending. Medicare's three members outspend commercial's six.",
    code: `SELECT pay.plan_type,
       COUNT(DISTINCT p.patient_id) AS members,
       SUM(c.paid_cents) AS paid_total
FROM claims c
JOIN patients p ON p.patient_id = c.patient_id
JOIN payers pay ON pay.payer_id = p.payer_id
GROUP BY pay.plan_type
ORDER BY paid_total DESC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Cigna",
    title: "No-show rates",
    statement:
      "For every provider, count their total booked encounters and how many were no-shows. Output provider_id, total_visits and no_shows, ordered by provider_id. One provider absorbed two of the five no-shows — the endocrinologist's diary is the flakiest.",
    code: `SELECT pr.provider_id,
       COUNT(v.visit_id) AS total_visits,
       SUM(CASE WHEN v.status = 'no_show' THEN 1 ELSE 0 END) AS no_shows
FROM providers pr
LEFT JOIN visits v ON v.provider_id = pr.provider_id
GROUP BY pr.provider_id
ORDER BY pr.provider_id ASC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Encounters that never billed",
    statement:
      "Find the visits that produced NO claim at all. Output visit_id, patient_id, visit_date and status, ordered by visit_id. Eight rows — every no-show and every cancellation — and an anti-join is the honest way to prove it.",
    code: `SELECT v.visit_id, v.patient_id, v.visit_date, v.status
FROM visits v
WHERE NOT EXISTS (SELECT 1 FROM claims c WHERE c.visit_id = v.visit_id)
ORDER BY v.visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "Denial-code roll-up",
    statement:
      "Aggregate the denied claims by denial code. Output denial_code, claim_count, billed_total (from the visit's charge) and allowed_total, ordered by billed_total descending. The two biggest books are CO-197 — prior auth never obtained on inpatient stays.",
    code: `SELECT c.denial_code,
       COUNT(*) AS claim_count,
       SUM(v.billed_cents) AS billed_total,
       SUM(c.allowed_cents) AS allowed_total
FROM claims c
JOIN visits v ON v.visit_id = c.visit_id
WHERE c.status = 'denied'
GROUP BY c.denial_code
ORDER BY billed_total DESC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "Filing cadence by month",
    statement:
      "Count the claims submitted per month. Output month (as YYYY-MM) and claim_count, ordered by month ascending. Six months of 2026 carry claims; no one filed in July.",
    code: `SELECT strftime('%Y-%m', submitted_date) AS month,
       COUNT(*) AS claim_count
FROM claims
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Facility revenue",
    statement:
      "Rank the facilities by the money their claims actually collected. Output facility and paid_total, ordered by paid_total descending. The Heart Institute dwarfs everything — inpatient money is where the book lives.",
    code: `SELECT pr.facility, SUM(c.paid_cents) AS paid_total
FROM providers pr
JOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'
JOIN claims c ON c.visit_id = v.visit_id
GROUP BY pr.facility
ORDER BY paid_total DESC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Length-of-stay board",
    statement:
      "For every inpatient stay compute the length of stay in whole days: discharge_date minus visit_date. Output visit_id, patient_id, visit_date, discharge_date and los_days, ordered by los_days descending, then visit_id. One stay lasted 28 days; one same-day observation lasts exactly 0.",
    code: `SELECT visit_id, patient_id, visit_date, discharge_date,
       CAST(julianday(discharge_date) - julianday(visit_date) AS INT) AS los_days
FROM visits
WHERE visit_type = 'inpatient'
ORDER BY los_days DESC, visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Cigna",
    title: "The aging board",
    statement:
      "For each pending claim compute its age in days as of 2026-07-01 and drop it into an aging bucket: '0-30' up to 30 days, '31-60' up to 60, '61-90' up to 90, else '91+'. Output claim_id, age_days and bucket, ordered by age_days descending. One claim sits EXACTLY on the 60-day line — the <= in your CASE decides its bucket.",
    code: `SELECT claim_id,
       CAST(julianday('2026-07-01') - julianday(submitted_date) AS INT) AS age_days,
       CASE
         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 30 THEN '0-30'
         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 60 THEN '31-60'
         WHEN julianday('2026-07-01') - julianday(submitted_date) <= 90 THEN '61-90'
         ELSE '91+'
       END AS bucket
FROM claims
WHERE status = 'pending'
ORDER BY age_days DESC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Specialty workload",
    statement:
      "Count the COMPLETED encounters per provider specialty. Output specialty and completed_visits, ordered by completed_visits descending, then specialty ascending. Primary care carries the diary; cardiology carries the acuity.",
    code: `SELECT pr.specialty, COUNT(*) AS completed_visits
FROM providers pr
JOIN visits v ON v.provider_id = pr.provider_id
WHERE v.status = 'completed'
GROUP BY pr.specialty
ORDER BY completed_visits DESC, pr.specialty ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "The dormant member",
    statement:
      "Find the patients who have never had a single visit. Output patient_id, name, region and enrolled_date, ordered by patient_id. One row — a member who enrolled in June and has one portal login to show for it.",
    code: `SELECT p.patient_id, p.name, p.region, p.enrolled_date
FROM patients p
LEFT JOIN visits v ON v.patient_id = p.patient_id
WHERE v.visit_id IS NULL
ORDER BY p.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "The corrected-claim audit",
    statement:
      "Billing hygiene: find visits that generated MORE than one claim (a denial corrected by a resubmission). Output visit_id and claim_count, ordered by visit_id. Exactly one visit doubled up.",
    code: `SELECT visit_id, COUNT(*) AS claim_count
FROM claims
GROUP BY visit_id
HAVING COUNT(*) > 1
ORDER BY visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Regional books",
    statement:
      "Sum the lifetime paid money per patient region. Output region and paid_total, ordered by paid_total descending. NA leads the book — but remember who lives there before you celebrate the region.",
    code: `SELECT p.region, SUM(c.paid_cents) AS paid_total
FROM patients p
JOIN claims c ON c.patient_id = p.patient_id
GROUP BY p.region
ORDER BY paid_total DESC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "CVS Health",
    title: "The chronic club",
    statement:
      "Find patients whose history carries BOTH an 'E11' (diabetes) primary diagnosis AND an 'I10' (hypertension) primary diagnosis. Output patient_id and name, ordered by patient_id. Two members — the comorbidity screen interviewers love.",
    code: `SELECT p.patient_id, p.name
FROM patients p
JOIN diagnoses d ON d.patient_id = p.patient_id AND d.is_primary = 1
WHERE d.icd_code IN ('E11', 'I10')
GROUP BY p.patient_id
HAVING COUNT(DISTINCT d.icd_code) = 2
ORDER BY p.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Cigna",
    title: "Heavy ERs",
    statement:
      "List the emergency visits billed at 120000 cents or more. Output visit_id, patient_id, visit_date and billed_cents, ordered by billed_cents descending, then visit_id. Four rows, and the boundary holds both a paid ER and a deductible denial.",
    code: `SELECT visit_id, patient_id, visit_date, billed_cents
FROM visits
WHERE visit_type = 'er' AND billed_cents >= 120000
ORDER BY billed_cents DESC, visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Oscar Health",
    title: "Filing lag leaderboard",
    statement:
      "For each claim compute the filing lag: days between the visit and the submission. Output the ten slowest as claim_id, status, denial_code and lag_days, ordered by lag descending, then claim_id. The top of this board is exactly where the CO-29 denials live.",
    code: `SELECT c.claim_id, c.status, c.denial_code,
       CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) AS lag_days
FROM claims c
JOIN visits v ON v.visit_id = c.visit_id
ORDER BY lag_days DESC, c.claim_id ASC
LIMIT 10;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Meridian Care",
    title: "Portal footprints",
    statement:
      "Count every patient's portal events. Output patient_id and event_count, ordered by event_count descending, then patient_id ascending. Twelve rows even for the ghosts — the dormant member logs exactly one event.",
    code: `SELECT p.patient_id, COUNT(e.event_id) AS event_count
FROM patients p
LEFT JOIN portal_events e ON e.patient_id = p.patient_id
GROUP BY p.patient_id
ORDER BY event_count DESC, p.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Claimsbridge",
    title: "June's settlements",
    statement:
      "How much money did June 2026 processing actually move? Output one row: june_claims (count of claims processed in June) and june_paid (their paid_cents total).",
    code: `SELECT COUNT(*) AS june_claims,
       SUM(paid_cents) AS june_paid
FROM claims
WHERE processed_date BETWEEN '2026-06-01' AND '2026-06-30';`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "UnitedHealth",
    title: "Claims per payer",
    statement:
      "For each payer: how many claims does the book hold, what did they pay in total, and what is the average paid per claim? Output payer name, claim_count, paid_total and avg_paid, ordered by claim_count descending, then payer name. Use ROUND(..., 2) for the average.",
    code: `SELECT pay.name,
       COUNT(*) AS claim_count,
       SUM(c.paid_cents) AS paid_total,
       ROUND(AVG(c.paid_cents), 2) AS avg_paid
FROM claims c
JOIN patients p ON p.patient_id = c.patient_id
JOIN payers pay ON pay.payer_id = p.payer_id
GROUP BY pay.payer_id
ORDER BY claim_count DESC, pay.name ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "CVS Health",
    title: "Chronic utilization",
    statement:
      "List every visit by the chronic club — the patients carrying both an E11 and an I10 primary diagnosis. Output visit_id, patient_id, visit_date, visit_type and billed_cents, ordered by patient_id, then visit_date, then visit_id. Nineteen encounters between the two of them.",
    code: `SELECT v.visit_id, v.patient_id, v.visit_date, v.visit_type, v.billed_cents
FROM visits v
WHERE v.patient_id IN (
  SELECT d.patient_id
  FROM diagnoses d
  WHERE d.is_primary = 1 AND d.icd_code IN ('E11', 'I10')
  GROUP BY d.patient_id
  HAVING COUNT(DISTINCT d.icd_code) = 2
)
ORDER BY v.patient_id ASC, v.visit_date ASC, v.visit_id ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Cigna",
    title: "The readmission detector",
    statement:
      "A readmission is an inpatient admission that follows a discharge by the same patient. Self-join the inpatient stays and compute the gap in days from the earlier stay's discharge to the later stay's admission. Output patient_id, prev_visit_id, next_visit_id and gap_days, ordered by gap ascending, then patient_id. Three pairs land on this board: a 6-day bounce, a 30-day EXACT hit, and a 31-day near-miss.",
    code: `SELECT a.patient_id,
       a.visit_id AS prev_visit_id,
       b.visit_id AS next_visit_id,
       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days
FROM visits a
JOIN visits b
  ON b.patient_id = a.patient_id
 AND b.visit_type = 'inpatient'
 AND b.visit_date > a.visit_date
WHERE a.visit_type = 'inpatient'
ORDER BY gap_days ASC, a.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Inclusive vs strict",
    statement:
      "The same three readmission gaps, judged by two policies. A 30-day readmission window catches gaps <= 30 under the inclusive policy but only gaps < 30 under the strict one. Output patient_id, gap_days, inclusive_flag and strict_flag (1 when the pair is caught, 0 otherwise), ordered by gap ascending. The 30-day pair is where the two policies disagree — and that patient is real.",
    code: `SELECT a.patient_id,
       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days,
       CASE WHEN julianday(b.visit_date) - julianday(a.discharge_date) <= 30 THEN 1 ELSE 0 END AS inclusive_flag,
       CASE WHEN julianday(b.visit_date) - julianday(a.discharge_date) < 30 THEN 1 ELSE 0 END AS strict_flag
FROM visits a
JOIN visits b
  ON b.patient_id = a.patient_id
 AND b.visit_type = 'inpatient'
 AND b.visit_date > a.visit_date
WHERE a.visit_type = 'inpatient'
ORDER BY gap_days ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "The timely-filing wall",
    statement:
      "The payer rule pays claims filed within 90 days of service — day 90 itself survives, day 91 auto-denies. Find every claim whose filing lag reaches 90 days or more. Output claim_id, lag_days, status and denial_code, ordered by lag descending. Three rows: one survivor EXACTLY on the line, two CO-29 casualties beyond it.",
    code: `SELECT c.claim_id,
       CAST(julianday(c.submitted_date) - julianday(v.visit_date) AS INT) AS lag_days,
       c.status,
       c.denial_code
FROM claims c
JOIN visits v ON v.visit_id = c.visit_id
WHERE julianday(c.submitted_date) - julianday(v.visit_date) >= 90
ORDER BY lag_days DESC;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "Appointment velocity",
    statement:
      "Burst-booking looks like this: one patient firing repeated appt_book events inside a short window. Self-join the portal's appt_book events per patient and keep every pair whose gap is at most 300 seconds. Output patient_id, first_event_id, second_event_id and gap_seconds, ordered by patient_id, then gap_seconds, then first_event_id. Seven pairs — six from a 60-second burst plus one that lands EXACTLY on the 300-second line.",
    code: `SELECT a.patient_id,
       a.event_id AS first_event_id,
       b.event_id AS second_event_id,
       b.event_ts - a.event_ts AS gap_seconds
FROM portal_events a
JOIN portal_events b
  ON b.patient_id = a.patient_id
 AND a.event_id < b.event_id
WHERE a.event_type = 'appt_book'
  AND b.event_type = 'appt_book'
  AND b.event_ts - a.event_ts <= 300
ORDER BY a.patient_id ASC, gap_seconds ASC, a.event_id ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "The 300-second line",
    statement:
      "Count the appointment-velocity pairs two ways: gaps <= 300 seconds (inclusive) and gaps < 300 seconds (strict). Output one row with inclusive_pairs and strict_pairs. The difference is one pair — the one sitting exactly ON the line.",
    code: `SELECT
  COUNT(CASE WHEN b.event_ts - a.event_ts <= 300 THEN 1 END) AS inclusive_pairs,
  COUNT(CASE WHEN b.event_ts - a.event_ts < 300 THEN 1 END) AS strict_pairs
FROM portal_events a
JOIN portal_events b
  ON b.patient_id = a.patient_id
 AND a.event_id < b.event_id
WHERE a.event_type = 'appt_book'
  AND b.event_type = 'appt_book';`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "CVS Health",
    title: "Sessionize the portal",
    statement:
      "Cut each patient's portal timeline into sessions: a gap of more than 1800 seconds from the previous event starts a new session. Use LAG to see the previous event, a CASE to flag session starts, and a running SUM to stamp session numbers. Output patient_id and session_count, ordered by patient_id. Twenty-eight sessions across the book — and one 1800-second pair that stays together only because the rule is STRICTLY greater.",
    code: `WITH seq AS (
  SELECT patient_id, event_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS prev_ts
  FROM portal_events
),
flags AS (
  SELECT patient_id, event_id, event_ts,
         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS is_start
  FROM seq
),
marked AS (
  SELECT *, SUM(is_start) OVER (PARTITION BY patient_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS session_no
  FROM flags
)
SELECT patient_id, COUNT(DISTINCT session_no) AS session_count
FROM marked
GROUP BY patient_id
ORDER BY patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Cigna",
    title: "The whale flip",
    statement:
      "The regional leaderboard is a concentration story. Compute each region's lifetime paid total twice: once with every patient, once with patient 10 excluded. Output region, paid_with_whale and paid_without_whale, ordered by paid_with_whale descending. Watch NA fall from first to second the moment the whale leaves the room.",
    code: `SELECT p.region,
       SUM(c.paid_cents) AS paid_with_whale,
       SUM(CASE WHEN p.patient_id <> 10 THEN c.paid_cents ELSE 0 END) AS paid_without_whale
FROM patients p
JOIN claims c ON c.patient_id = p.patient_id
GROUP BY p.region
ORDER BY paid_with_whale DESC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Two ranks, one tie",
    statement:
      "Rank the patients by lifetime paid money with both RANK and DENSE_RANK. Output patient_id, name, paid_cents, rank and dense_rank, ordered by paid_cents descending, then patient_id. The 40000 tie sits at ranks 6-7: RANK skips a number afterwards, DENSE_RANK does not.",
    code: `SELECT p.patient_id, p.name, COALESCE(SUM(c.paid_cents), 0) AS paid_cents,
       RANK() OVER (ORDER BY COALESCE(SUM(c.paid_cents), 0) DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY COALESCE(SUM(c.paid_cents), 0) DESC) AS dense_rank
FROM patients p
LEFT JOIN claims c ON c.patient_id = p.patient_id
GROUP BY p.patient_id
ORDER BY paid_cents DESC, p.patient_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "The running book",
    statement:
      "Track the money as it settles, month by month. Group paid claims by their PROCESS month, sum the paid_cents, and add a running total. Output month (YYYY-MM), paid_in_month and running_paid, ordered by month ascending. Seven months — July holds only one claim, but it is a big one.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', processed_date) AS month,
         SUM(paid_cents) AS paid_in_month
  FROM claims
  WHERE status = 'paid'
  GROUP BY month
)
SELECT month, paid_in_month,
       SUM(paid_in_month) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS running_paid
FROM monthly
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "The denial ledger",
    statement:
      "Break the denied money down by code, and price each code's share of the whole denial book. Output denial_code, billed_total and share_pct (the code's billed share of all denied billed money, rounded to 1 decimal), ordered by billed_total descending. CO-197 alone carries two-thirds of everything the payers refused.",
    code: `WITH denied AS (
  SELECT c.denial_code, SUM(v.billed_cents) AS billed_total
  FROM claims c
  JOIN visits v ON v.visit_id = c.visit_id
  WHERE c.status = 'denied'
  GROUP BY c.denial_code
)
SELECT denial_code, billed_total,
       ROUND(billed_total * 100.0 / (SELECT SUM(billed_total) FROM denied), 1) AS share_pct
FROM denied
ORDER BY billed_total DESC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "Month-over-month movement",
    statement:
      "Settlement is lumpy. Group paid claims by process month, then use LAG to compute each month's change from the previous one. Output month, paid_in_month and mom_delta (NULL for the first month), ordered by month ascending. Seven rows tell the whole story of a book that swings by hundreds of thousands.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', processed_date) AS month,
         SUM(paid_cents) AS paid_in_month
  FROM claims
  WHERE status = 'paid'
  GROUP BY month
)
SELECT month, paid_in_month,
       paid_in_month - LAG(paid_in_month) OVER (ORDER BY month) AS mom_delta
FROM monthly
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "CVS Health",
    title: "The tie registry",
    statement:
      "When patients tie on lifetime paid money, a leaderboard hides who they are. Build the registry: group patients by their lifetime paid total and, for ties only, concatenate their ids in patient order. Output paid_cents and member_ids, one row per tied total, ordered by paid_cents descending. One tie: the 40000 club.",
    code: `WITH totals AS (
  SELECT p.patient_id, COALESCE(SUM(c.paid_cents), 0) AS paid_cents
  FROM patients p
  LEFT JOIN claims c ON c.patient_id = p.patient_id
  GROUP BY p.patient_id
)
SELECT paid_cents, GROUP_CONCAT(patient_id) AS member_ids
FROM (
  SELECT paid_cents, patient_id FROM totals
  ORDER BY paid_cents DESC, patient_id ASC
)
GROUP BY paid_cents
HAVING COUNT(*) > 1
ORDER BY paid_cents DESC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Cigna",
    title: "Same-day double submissions",
    statement:
      "Back offices that batch filings leave fingerprints: two claims for the same payer submitted on the same day. Self-join the claims on payer and submitted_date. Output claim_id_a, claim_id_b and submitted_date (a < b by claim_id), ordered by submitted_date, then claim_id_a. Three pairs — one of them is the 90-day boundary survivor filing alongside the whale's telehealth claim.",
    code: `SELECT a.claim_id AS claim_id_a,
       b.claim_id AS claim_id_b,
       a.submitted_date
FROM claims a
JOIN claims b
  ON a.claim_id < b.claim_id
 AND a.payer_id = b.payer_id
 AND a.submitted_date = b.submitted_date
ORDER BY a.submitted_date ASC, a.claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "Duplicate money shapes",
    statement:
      "Claims that share the exact same (billed, allowed) fingerprint deserve a second look — some are legit rate cards, some are the deductible twins. Group adjudicated claims by billed and allowed, keep the groups of 2 or more, and count them. Output billed_cents, allowed_cents and shape_count, ordered by shape_count descending, then billed_cents descending. One triplet tops the board — the whale's identical endocrinology visits.",
    code: `SELECT v.billed_cents, c.allowed_cents, COUNT(*) AS shape_count
FROM claims c
JOIN visits v ON v.visit_id = c.visit_id
WHERE c.allowed_cents IS NOT NULL
GROUP BY v.billed_cents, c.allowed_cents
HAVING COUNT(*) >= 2
ORDER BY shape_count DESC, v.billed_cents DESC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Meridian Care",
    title: "Multi-diagnosis encounters",
    statement:
      "Encounters with more than one coded diagnosis are where comorbidity lives. Find the visits carrying 2 or more diagnosis rows and list their codes as a single string. Output visit_id, patient_id and dx_codes (GROUP_CONCAT of icd_code ordered by dx_id), ordered by visit_id. Seven encounters — and the whale's May admission carries three codes.",
    code: `SELECT v.visit_id, v.patient_id,
       (SELECT GROUP_CONCAT(d2.icd_code)
        FROM diagnoses d2
        WHERE d2.visit_id = v.visit_id
        ORDER BY d2.dx_id) AS dx_codes
FROM visits v
JOIN diagnoses d ON d.visit_id = v.visit_id
GROUP BY v.visit_id
HAVING COUNT(*) >= 2
ORDER BY v.visit_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Claimsbridge",
    title: "The one-visit wonder",
    statement:
      "Panel coverage check: which providers completed fewer than two encounters all half-year? Count COMPLETED visits per provider and keep the ones under 2. Output provider_id, name and completed_visits, ordered by provider_id. Two rows — a cardiologist whose second booking was cancelled and the orthopod whose follow-up never showed.",
    code: `SELECT pr.provider_id, pr.name, COUNT(v.visit_id) AS completed_visits
FROM providers pr
LEFT JOIN visits v ON v.provider_id = pr.provider_id AND v.status = 'completed'
GROUP BY pr.provider_id
HAVING COUNT(v.visit_id) < 2
ORDER BY pr.provider_id ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "UnitedHealth",
    title: "Regional concentration",
    statement:
      "For each region, find its single biggest payer of claims and how much of the region's book that one patient carries. Output region, total_paid, top_patient_id and top_share_pct (top patient's paid share of the region total, rounded to 1 decimal), ordered by total_paid descending. NA's number should make you nervous.",
    code: `WITH region_totals AS (
  SELECT p.region, SUM(c.paid_cents) AS total_paid
  FROM patients p JOIN claims c ON c.patient_id = p.patient_id
  GROUP BY p.region
),
top_patients AS (
  SELECT p.region, p.patient_id, SUM(c.paid_cents) AS paid
  FROM patients p JOIN claims c ON c.patient_id = p.patient_id
  GROUP BY p.region, p.patient_id
),
ranked AS (
  SELECT region, patient_id, paid,
         ROW_NUMBER() OVER (PARTITION BY region ORDER BY paid DESC, patient_id ASC) AS rn
  FROM top_patients
)
SELECT r.region, t.total_paid, r.patient_id AS top_patient_id,
       ROUND(r.paid * 100.0 / t.total_paid, 1) AS top_share_pct
FROM ranked r
JOIN region_totals t ON t.region = r.region
WHERE r.rn = 1
ORDER BY t.total_paid DESC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "CVS Health",
    title: "Bill-pay forensics",
    statement:
      "How long does a member sit in the portal before paying? Compute every event's gap from the patient's previous event FIRST, then keep only the bill_pay rows — filtering before the window would erase the context. Output patient_id, event_id and gap_seconds, ordered by event_id. Three payments: one after 2400s, one after EXACTLY 1800s, one after 900s.",
    code: `WITH gaps AS (
  SELECT patient_id, event_id, event_type,
         event_ts - LAG(event_ts) OVER (PARTITION BY patient_id ORDER BY event_ts) AS gap_seconds
  FROM portal_events
)
SELECT patient_id, event_id, gap_seconds
FROM gaps
WHERE event_type = 'bill_pay'
ORDER BY event_id ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Cigna",
    title: "The readmission dossier",
    statement:
      "One row per readmission pair, everything a case manager needs: who, the gap, both stays' lengths, both stays' bills. Output patient name, gap_days, first_los, second_los and combined_billed (the two inpatient visits' billed_cents summed), ordered by gap ascending. The 30-day row is the one your inclusive threshold exists to catch.",
    code: `SELECT p.name,
       CAST(julianday(b.visit_date) - julianday(a.discharge_date) AS INT) AS gap_days,
       CAST(julianday(a.discharge_date) - julianday(a.visit_date) AS INT) AS first_los,
       CAST(julianday(b.discharge_date) - julianday(b.visit_date) AS INT) AS second_los,
       a.billed_cents + b.billed_cents AS combined_billed
FROM visits a
JOIN visits b
  ON b.patient_id = a.patient_id
 AND b.visit_type = 'inpatient'
 AND b.visit_date > a.visit_date
JOIN patients p ON p.patient_id = a.patient_id
WHERE a.visit_type = 'inpatient'
ORDER BY gap_days ASC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Oscar Health",
    title: "The empty month",
    statement:
      "Build the enrollment calendar for 2025-10 through 2026-06 — including the months nobody joined. Generate the month list with a recursive CTE, LEFT JOIN the patients onto it, and count. Output month (YYYY-MM) and new_members, ordered by month. Nine rows, and March 2026 shows its honest zero.",
    code: `WITH RECURSIVE months(m) AS (
  VALUES ('2025-10')
  UNION ALL
  SELECT strftime('%Y-%m', date(m || '-01', '+1 month'))
  FROM months WHERE m < '2026-06'
)
SELECT m AS month, COUNT(p.patient_id) AS new_members
FROM months
LEFT JOIN patients p ON strftime('%Y-%m', p.enrolled_date) = m
GROUP BY m
ORDER BY m ASC;`,
    order: "exact",
  },
];
