// Domain Mastery — pack #5 "Healthcare & Claims" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these seven tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail, Finance, Fraud and SaaS packs.
//
// The world is a care network + claims operation: patients carry coverage
// from one of three payers, providers deliver encounters, every completed
// encounter produces a claim that a payer adjudicates (paid / denied /
// pending / appealed), encounters carry coded diagnoses, and patients touch
// a portal whose events run on their own clock. Two vocabularies matter:
//   - BILLED is the charge-master price of an encounter; ALLOWED is what the
//     payer's contract recognizes; PAID is what the payer actually pays.
//     billed - allowed is the contractual write-off; allowed - paid is the
//     patient's responsibility. Three different "costs of care", one row.
//   - A NO-SHOW or CANCELLED encounter never happened: billed_cents is 0 and
//     no claim row exists — the pack's honest-zero / anti-join surface.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r13-hc-probe.ts before content referenced it):
//   - the 30-day readmission wall: patient 2 discharges 2026-03-01 and is
//     readmitted 2026-03-31 — EXACTLY 30 days (inclusive windows catch it,
//     strict ones miss); patient 5 bounces in 6 days; patient 10's second
//     stay lands 31 days after discharge — the near-miss from the other side
//   - the timely-filing boundary: the payer rule pays claims submitted within
//     90 days of service; ONE claim lands EXACTLY on day 90 and pays (the
//     boundary survivor); two others at 95 and 104 days auto-deny CO-29
//   - the denial book: 7 denials across 4 codes — CO-29 x2 (timely filing),
//     CO-197 x2 (no prior auth, both on inpatient stays), PR-1 x2 (the
//     deductible twins — identical 96000 allowed), CO-16 x1 (missing info,
//     corrected by a resubmission that PAID — the duplicate-claim fan-out)
//   - the aging board: 4 pending claims aged 26 / 48 / 60 / 102 days as of
//     2026-07-01 — one sits EXACTLY on the 60-day bucket line and the
//     61-90 bucket is empty
//   - the whale: patient 10 carries 367800 paid cents — the NA region leads
//     on his book alone, and excluding him drops NA from 1st to 2nd behind
//     APAC (the leaderboard flip)
//   - the 32800 club: patients 1 and 4 tie at exactly 32800 lifetime paid —
//     with DIFFERENT claim shapes (3 claims vs 2)
//   - the chronic club: exactly patients 2 and 10 carry BOTH an E11 primary
//     and an I10 primary diagnosis across their history
//   - LOS edges: one same-day inpatient stay (LOS 0) and stays of 2..29
//   - the portal clock: 4 appt_book events 60s apart make 6 velocity pairs
//     <= 300s, a 2-event burst sits EXACTLY on the 300s line (7 pairs
//     inclusive, 6 strict), one login->bill_pay pair is EXACTLY 1800s apart
//     (ON the session cutoff), and patient 11's entire digital life is ONE
//     login

export const DM_HC_SCHEMA = {
  ddl: `CREATE TABLE patients (
  patient_id    INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  region        TEXT NOT NULL,      -- 'NA' | 'EMEA' | 'APAC' | 'LATAM'
  birth_year    INTEGER NOT NULL,
  payer_id      INTEGER NOT NULL,   -- no FK enforced (house convention)
  enrolled_date TEXT NOT NULL
);

CREATE TABLE payers (
  payer_id  INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  plan_type TEXT NOT NULL           -- 'commercial' | 'medicare' | 'medicaid'
);

CREATE TABLE providers (
  provider_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  specialty   TEXT NOT NULL,        -- 'primary' | 'cardiology' | 'endocrinology' | 'orthopedics' | 'pediatrics'
  facility    TEXT NOT NULL,
  region      TEXT NOT NULL
);

CREATE TABLE visits (
  visit_id       INTEGER PRIMARY KEY,
  patient_id     INTEGER NOT NULL,
  provider_id    INTEGER NOT NULL,
  visit_date     TEXT NOT NULL,     -- 'YYYY-MM-DD', 2026-01 .. 2026-06
  visit_type     TEXT NOT NULL,     -- 'office' | 'telehealth' | 'er' | 'inpatient'
  discharge_date TEXT,              -- NULL except inpatient; LOS = discharge - visit
  status         TEXT NOT NULL,     -- 'completed' | 'no_show' | 'cancelled'
  billed_cents   INTEGER NOT NULL   -- charge-master price; 0 when the visit never happened
);

CREATE TABLE claims (
  claim_id       INTEGER PRIMARY KEY,
  visit_id       INTEGER NOT NULL,
  patient_id     INTEGER NOT NULL,
  payer_id       INTEGER NOT NULL,
  submitted_date TEXT NOT NULL,
  allowed_cents  INTEGER,           -- NULL until adjudicated
  paid_cents     INTEGER,           -- NULL until adjudicated; 0 on denials
  status         TEXT NOT NULL,     -- 'paid' | 'denied' | 'pending' | 'appealed'
  denial_code    TEXT,              -- NULL unless denied/appealed
  processed_date TEXT               -- NULL until final
);

CREATE TABLE diagnoses (
  dx_id      INTEGER PRIMARY KEY,
  visit_id   INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  icd_code   TEXT NOT NULL,         -- 'I10' | 'E11' | 'I50' | 'J45' | 'M54' | 'R05' | 'F41' | 'Z00'
  is_primary INTEGER NOT NULL       -- 1 = the reason for the encounter
);

CREATE TABLE portal_events (
  event_id   INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,         -- 'login' | 'appt_book' | 'refill_request' | 'message' | 'bill_pay'
  event_ts   INTEGER NOT NULL       -- epoch seconds, 2026-07-20 .. 2026-07-23
);`,
  tables: [
    { name: "patients", note: "12 patients across 4 regions — patient 2 is the 30-day readmission, patient 10 the whale, patient 11 has zero visits and one portal login" },
    { name: "payers", note: "3 payers — commercial x6 patients, medicare x3, medicaid x3; medicare's 3 patients outspend commercial's 6" },
    { name: "providers", note: "8 providers across 4 facilities — cardiology carries the inpatient stays; two share the Meridian Main primary panel" },
    { name: "visits", note: "56 encounters, 2026-01 .. 2026-06 — 48 completed / 5 no_show / 3 cancelled; no-shows and cancellations are billed 0 and claimless" },
    { name: "claims", note: "49 claims — 37 paid / 7 denied (4 codes) / 4 pending / 1 appealed; one visit carries a corrected-claim pair; one claim lands exactly on the 90-day filing line" },
    { name: "diagnoses", note: "56 diagnosis rows over 8 ICD codes — exactly one primary per completed visit; the E11+I10 chronic club is patients 2 and 10" },
    { name: "portal_events", note: "56 portal events in epoch seconds (07-20 .. 07-23) — an appt_book burst, a pair exactly on the 300s line, a 1800s login->bill_pay boundary, patient 11's lone login" },
  ],
};
