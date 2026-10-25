// Domain Mastery — pack #5 "Healthcare & Claims" · world seed (probed before use).
// Every planted fact is asserted by scripts/r13-hc-probe.ts; content may
// only cite facts that probe passes on.
export const DM_HC_SEED = `INSERT INTO payers (payer_id, name, plan_type) VALUES
  (1, 'Northstar Commercial', 'commercial'),
  (2, 'Federal Senior Plan',  'medicare'),
  (3, 'State Care Network',   'medicaid');

-- 12 patients. Payer mix: commercial x6 (1,3,4,6,10,12) · medicare x3 (2,5,8)
-- · medicaid x3 (7,9,11). Regions: NA x5 (5,7,9,10,12) · EMEA x3 (1,4,8) ·
-- APAC x2 (2,6) · LATAM x2 (3,11). 2026 enrollment calendar: Jan P7 / Feb P8
-- / March ZERO / Apr P9 / May P10 / Jun P11+P12.
INSERT INTO patients (patient_id, name, region, birth_year, payer_id, enrolled_date) VALUES
  (1,  'Ava Lindqvist',  'EMEA',  1978, 1, '2025-10-06'),
  (2,  'Bilal Rahman',   'APAC',  1965, 2, '2025-10-20'),
  (3,  'Carla Mendes',   'LATAM', 1990, 1, '2025-11-03'),
  (4,  'Dmitri Volkov',  'EMEA',  1982, 1, '2025-11-17'),
  (5,  'Emmy Okafor',    'NA',    1971, 2, '2025-12-01'),
  (6,  'Farid Azimi',    'APAC',  1988, 1, '2025-12-15'),
  (7,  'Grace Chen',     'NA',    1995, 3, '2026-01-05'),
  (8,  'Hugo Beaumont',  'EMEA',  1969, 2, '2026-02-02'),
  (9,  'Iris Nakamura',  'NA',    1985, 3, '2026-04-06'),
  (10, 'Jonas Weber',    'NA',    1958, 1, '2026-05-04'),
  (11, 'Kaia Sund',      'LATAM', 2001, 3, '2026-06-01'),
  (12, 'Lena Marsh',     'NA',    1975, 1, '2026-06-15');

-- 8 providers across 4 facilities. Cardiology (V3 + V8, the Heart
-- Institute) carries every inpatient stay. V1 and V2 share the Meridian
-- Main primary panel.
INSERT INTO providers (provider_id, name, specialty, facility, region) VALUES
  (1, 'Dr. Alice Chen',    'primary',       'Meridian Main',          'NA'),
  (2, 'Dr. Ben Ortiz',     'primary',       'Meridian Main',          'NA'),
  (3, 'Dr. Sofia Marino',  'cardiology',    'Meridian Heart Institute', 'EMEA'),
  (4, 'Dr. Ken Watanabe',  'endocrinology', 'Meridian Main',          'NA'),
  (5, 'Dr. Priya Sharma',  'orthopedics',   'Meridian East',          'EMEA'),
  (6, 'Dr. Marco Ruiz',    'pediatrics',    'Meridian East',          'EMEA'),
  (7, 'Dr. Nadia Hussein', 'primary',       'Virtual Care Hub',       'APAC'),
  (8, 'Dr. Tom Bailey',    'cardiology',    'Meridian Heart Institute', 'NA');

-- 56 encounters, 2026-01 .. 2026-06. Completed 48 / no_show 5 / cancelled 3.
-- no_show + cancelled rows are billed 0 and get NO claim. Inpatient walls:
--   P2  v7  02-01 -> 03-01 (LOS 29) and v8  03-31 -> 04-04 (LOS 4):
--       discharge->readmit gap = EXACTLY 30 days
--   P5  v22 04-10 -> 04-14 (LOS 4) and v23 04-20 -> 04-23 (LOS 3): gap 6
--   P10 v48 05-20 -> 05-24 (LOS 4) and v49 06-24 -> 06-26 (LOS 2): gap 31
--       — the near-miss just OUTSIDE the 30-day window
--   P7  v33 03-08 -> 03-08: LOS 0 (same-day observation)
INSERT INTO visits (visit_id, patient_id, provider_id, visit_date, visit_type, discharge_date, status, billed_cents) VALUES
  (1,  1,  1, '2026-01-08', 'office',    NULL,        'completed', 16000),
  (2,  1,  7, '2026-02-05', 'telehealth', NULL,       'completed', 9000),
  (3,  1,  1, '2026-03-12', 'office',    NULL,        'completed', 16000),
  (4,  1,  2, '2026-04-16', 'er',        NULL,        'completed', 120000),
  (5,  1,  7, '2026-06-04', 'telehealth', NULL,       'completed', 9000),
  (6,  2,  7, '2026-01-20', 'telehealth', NULL,       'completed', 9500),
  (7,  2,  3, '2026-02-01', 'inpatient', '2026-03-01', 'completed', 420000),
  (8,  2,  3, '2026-03-31', 'inpatient', '2026-04-04', 'completed', 280000),
  (9,  2,  1, '2026-02-10', 'office',    NULL,        'completed', 15000),
  (10, 2,  2, '2026-04-20', 'er',        NULL,        'completed', 150000),
  (11, 2,  3, '2026-05-12', 'office',    NULL,        'completed', 17000),
  (12, 2,  7, '2026-06-03', 'telehealth', NULL,       'completed', 9500),
  (13, 3,  6, '2026-02-14', 'office',    NULL,        'completed', 14000),
  (14, 3,  7, '2026-03-18', 'telehealth', NULL,       'completed', 8500),
  (15, 3,  7, '2026-05-22', 'telehealth', NULL,       'completed', 8500),
  (16, 3,  2, '2026-06-09', 'office',    NULL,        'no_show',   0),
  (17, 4,  1, '2026-01-15', 'office',    NULL,        'completed', 17000),
  (18, 4,  7, '2026-01-28', 'telehealth', NULL,       'completed', 10000),
  (19, 4,  5, '2026-03-03', 'office',    NULL,        'completed', 33000),
  (20, 4,  5, '2026-05-19', 'office',    NULL,        'no_show',   0),
  (21, 5,  4, '2026-01-09', 'office',    NULL,        'completed', 18000),
  (22, 5,  3, '2026-04-10', 'inpatient', '2026-04-14', 'completed', 260000),
  (23, 5,  3, '2026-04-20', 'inpatient', '2026-04-23', 'completed', 140000),
  (24, 5,  2, '2026-05-06', 'er',        NULL,        'completed', 120000),
  (25, 5,  4, '2026-06-10', 'office',    NULL,        'completed', 18000),
  (26, 5,  1, '2026-02-18', 'office',    NULL,        'no_show',   0),
  (27, 6,  1, '2026-01-12', 'office',    NULL,        'completed', 15500),
  (28, 6,  7, '2026-02-09', 'telehealth', NULL,       'completed', 8800),
  (29, 6,  7, '2026-03-05', 'telehealth', NULL,       'completed', 8800),
  (30, 6,  4, '2026-05-02', 'office',    NULL,        'completed', 16500),
  (31, 7,  6, '2026-01-22', 'office',    NULL,        'completed', 13000),
  (32, 7,  7, '2026-02-26', 'telehealth', NULL,       'completed', 8000),
  (33, 7,  2, '2026-03-08', 'inpatient', '2026-03-08', 'completed', 90000),
  (34, 7,  2, '2026-06-02', 'er',        NULL,        'completed', 95000),
  (35, 8,  1, '2026-01-12', 'office',    NULL,        'completed', 15000),
  (36, 8,  3, '2026-01-25', 'office',    NULL,        'completed', 20000),
  (37, 8,  3, '2026-01-12', 'inpatient', '2026-01-15', 'completed', 310000),
  (38, 8,  7, '2026-04-08', 'telehealth', NULL,       'completed', 9000),
  (39, 9,  1, '2026-05-11', 'office',    NULL,        'completed', 14500),
  (40, 9,  7, '2026-06-18', 'telehealth', NULL,       'completed', 8000),
  (41, 9,  6, '2026-04-27', 'office',    NULL,        'cancelled', 0),
  (42, 10, 4, '2026-01-09', 'office',    NULL,        'completed', 19000),
  (43, 10, 4, '2026-02-06', 'office',    NULL,        'completed', 19000),
  (44, 10, 7, '2026-02-27', 'telehealth', NULL,       'completed', 11000),
  (45, 10, 8, '2026-03-13', 'office',    NULL,        'completed', 22000),
  (46, 10, 7, '2026-04-10', 'telehealth', NULL,       'completed', 11000),
  (47, 10, 2, '2026-04-24', 'er',        NULL,        'completed', 140000),
  (48, 10, 3, '2026-05-20', 'inpatient', '2026-05-24', 'completed', 260000),
  (49, 10, 3, '2026-06-24', 'inpatient', '2026-06-26', 'completed', 420000),
  (50, 10, 4, '2026-06-18', 'office',    NULL,        'completed', 19000),
  (51, 10, 4, '2026-03-06', 'office',    NULL,        'no_show',   0),
  (52, 10, 4, '2026-05-06', 'office',    NULL,        'no_show',   0),
  (53, 10, 8, '2026-05-02', 'office',    NULL,        'cancelled', 0),
  (54, 12, 1, '2026-04-14', 'office',    NULL,        'completed', 15000),
  (55, 12, 2, '2026-05-30', 'office',    NULL,        'completed', 15000),
  (56, 12, 7, '2026-06-12', 'office',    NULL,        'cancelled', 0);

-- 49 claims (48 completed visits + ONE corrected resubmission for visit 13).
-- Statuses: 37 paid / 7 denied / 4 pending / 1 appealed. Allowed rates by
-- payer: commercial 80% of billed · medicare 65% · medicaid 55%. Walls:
--   c25 (v27): submitted 2026-04-12 for service 2026-01-12 = EXACTLY 90
--       days -> PAID (the timely-filing boundary survivor; 91+ would deny)
--   c18 (v18): 95 days -> denied CO-29 · c34 (v36): 104 days -> denied CO-29
--   c23 (v24) PR-1 allowed 96000 = c4 (v4) PR-1 allowed 96000 (the twins)
--   c13 (v13) denied CO-16 -> c14 resubmitted 9 days later and PAID (the
--       corrected-claim pair; the only visit with two claim rows)
--   pending aging as of 2026-07-01: c15 102d / c28 60d EXACTLY / c32 26d /
--       c37 48d — the 61-90 bucket is EMPTY
--   c48 (v54): appealed, paid + processed still NULL (appeal in flight)
INSERT INTO claims (claim_id, visit_id, patient_id, payer_id, submitted_date, allowed_cents, paid_cents, status, denial_code, processed_date) VALUES
  (1,  1,  1,  1, '2026-01-10', 12800,  12800,  'paid',     NULL,   '2026-01-15'),
  (2,  2,  1,  1, '2026-02-07', 7200,   7200,   'paid',     NULL,   '2026-02-12'),
  (3,  3,  1,  1, '2026-03-14', 12800,  12800,  'paid',     NULL,   '2026-03-19'),
  (4,  4,  1,  1, '2026-04-18', 96000,  0,      'denied',   'PR-1', '2026-04-25'),
  (5,  5,  1,  1, '2026-06-06', 7200,   7200,   'paid',     NULL,   '2026-06-11'),
  (6,  6,  2,  2, '2026-01-22', 6175,   6175,   'paid',     NULL,   '2026-01-27'),
  (7,  7,  2,  2, '2026-02-03', 273000, 273000, 'paid',     NULL,   '2026-02-10'),
  (8,  8,  2,  2, '2026-04-01', 182000, 0,      'denied',   'CO-197', '2026-04-06'),
  (9,  9,  2,  2, '2026-02-12', 9750,   9750,   'paid',     NULL,   '2026-02-17'),
  (10, 10, 2,  2, '2026-04-22', 97500,  97500,  'paid',     NULL,   '2026-04-27'),
  (11, 11, 2,  2, '2026-05-14', 11050,  11050,  'paid',     NULL,   '2026-05-19'),
  (12, 12, 2,  2, '2026-06-05', 6175,   6175,   'paid',     NULL,   '2026-06-10'),
  (13, 13, 3,  1, '2026-02-16', 11200,  0,      'denied',   'CO-16', '2026-02-20'),
  (14, 13, 3,  1, '2026-02-25', 11200,  11200,  'paid',     NULL,   '2026-03-02'),
  (15, 14, 3,  1, '2026-03-21', NULL,   NULL,   'pending',  NULL,   NULL),
  (16, 15, 3,  1, '2026-05-24', 6800,   6800,   'paid',     NULL,   '2026-05-29'),
  (17, 17, 4,  1, '2026-01-17', 13600,  13600,  'paid',     NULL,   '2026-01-22'),
  (18, 18, 4,  1, '2026-05-03', 8000,   0,      'denied',   'CO-29', '2026-05-08'),
  (19, 19, 4,  1, '2026-03-05', 26400,  26400,  'paid',     NULL,   '2026-03-10'),
  (20, 21, 5,  2, '2026-01-11', 11700,  11700,  'paid',     NULL,   '2026-01-16'),
  (21, 22, 5,  2, '2026-04-12', 169000, 169000, 'paid',     NULL,   '2026-04-17'),
  (22, 23, 5,  2, '2026-04-22', 91000,  91000,  'paid',     NULL,   '2026-04-27'),
  (23, 24, 5,  2, '2026-05-08', 96000,  0,      'denied',   'PR-1', '2026-05-15'),
  (24, 25, 5,  2, '2026-06-12', 11700,  11700,  'paid',     NULL,   '2026-06-17'),
  (25, 27, 6,  1, '2026-04-12', 12400,  12400,  'paid',     NULL,   '2026-04-16'),
  (26, 28, 6,  1, '2026-02-11', 7040,   7040,   'paid',     NULL,   '2026-02-16'),
  (27, 29, 6,  1, '2026-03-07', 7040,   7040,   'paid',     NULL,   '2026-03-12'),
  (28, 30, 6,  1, '2026-05-02', NULL,   NULL,   'pending',  NULL,   NULL),
  (29, 31, 7,  3, '2026-01-24', 7150,   7150,   'paid',     NULL,   '2026-01-29'),
  (30, 32, 7,  3, '2026-02-28', 4400,   4400,   'paid',     NULL,   '2026-03-05'),
  (31, 33, 7,  3, '2026-03-10', 49500,  49500,  'paid',     NULL,   '2026-03-15'),
  (32, 34, 7,  3, '2026-06-05', NULL,   NULL,   'pending',  NULL,   NULL),
  (33, 35, 8,  2, '2026-01-14', 9750,   9750,   'paid',     NULL,   '2026-01-19'),
  (34, 36, 8,  2, '2026-05-09', 13000,  0,      'denied',   'CO-29', '2026-05-14'),
  (35, 37, 8,  2, '2026-01-14', 201500, 201500, 'paid',     NULL,   '2026-01-21'),
  (36, 38, 8,  2, '2026-04-10', 5850,   5850,   'paid',     NULL,   '2026-04-15'),
  (37, 39, 9,  3, '2026-05-14', NULL,   NULL,   'pending',  NULL,   NULL),
  (38, 40, 9,  3, '2026-06-20', 4400,   4400,   'paid',     NULL,   '2026-06-25'),
  (39, 42, 10, 1, '2026-01-11', 15200,  15200,  'paid',     NULL,   '2026-01-16'),
  (40, 43, 10, 1, '2026-02-08', 15200,  15200,  'paid',     NULL,   '2026-02-13'),
  (41, 44, 10, 1, '2026-03-01', 8800,   8800,   'paid',     NULL,   '2026-03-06'),
  (42, 45, 10, 1, '2026-03-15', 17600,  17600,  'paid',     NULL,   '2026-03-20'),
  (43, 46, 10, 1, '2026-04-12', 8800,   8800,   'paid',     NULL,   '2026-04-17'),
  (44, 47, 10, 1, '2026-04-26', 112000, 112000, 'paid',     NULL,   '2026-05-01'),
  (45, 48, 10, 1, '2026-05-23', 208000, 0,      'denied',   'CO-197', '2026-05-29'),
  (46, 49, 10, 1, '2026-06-27', 336000, 336000, 'paid',     NULL,   '2026-07-02'),
  (47, 50, 10, 1, '2026-06-20', 15200,  15200,  'paid',     NULL,   '2026-06-25'),
  (48, 54, 12, 1, '2026-04-16', NULL,   NULL,   'appealed', 'CO-16', NULL),
  (49, 55, 12, 1, '2026-06-01', 12000,  12000,  'paid',     NULL,   '2026-06-06');

-- 56 diagnosis rows: exactly ONE primary per completed visit (48) + 8
-- secondaries. The chronic club (E11 primary AND I10 primary) = patients
-- 2 and 10 ONLY. Secondaries: v4 I10 · v7 I10 · v8 I10 · v22 E11 · v33 R05 ·
-- v37 I10 · v48 E11 + I10.
INSERT INTO diagnoses (dx_id, visit_id, patient_id, icd_code, is_primary) VALUES
  (1,  1,  1,  'Z00', 1),
  (2,  2,  1,  'R05', 1),
  (3,  3,  1,  'Z00', 1),
  (4,  4,  1,  'F41', 1),
  (5,  4,  1,  'I10', 0),
  (6,  5,  1,  'R05', 1),
  (7,  6,  2,  'I10', 1),
  (8,  7,  2,  'I50', 1),
  (9,  7,  2,  'I10', 0),
  (10, 8,  2,  'I50', 1),
  (11, 8,  2,  'I10', 0),
  (12, 9,  2,  'I10', 1),
  (13, 10, 2,  'I50', 1),
  (14, 11, 2,  'E11', 1),
  (15, 12, 2,  'I50', 1),
  (16, 13, 3,  'Z00', 1),
  (17, 14, 3,  'R05', 1),
  (18, 15, 3,  'J45', 1),
  (19, 17, 4,  'Z00', 1),
  (20, 18, 4,  'R05', 1),
  (21, 19, 4,  'M54', 1),
  (22, 21, 5,  'E11', 1),
  (23, 22, 5,  'I50', 1),
  (24, 22, 5,  'E11', 0),
  (25, 23, 5,  'I50', 1),
  (26, 24, 5,  'F41', 1),
  (27, 25, 5,  'E11', 1),
  (28, 27, 6,  'Z00', 1),
  (29, 28, 6,  'R05', 1),
  (30, 29, 6,  'F41', 1),
  (31, 30, 6,  'Z00', 1),
  (32, 31, 7,  'J45', 1),
  (33, 32, 7,  'J45', 1),
  (34, 33, 7,  'J45', 1),
  (35, 33, 7,  'R05', 0),
  (36, 34, 7,  'J45', 1),
  (37, 35, 8,  'I10', 1),
  (38, 36, 8,  'I10', 1),
  (39, 37, 8,  'I50', 1),
  (40, 37, 8,  'I10', 0),
  (41, 38, 8,  'R05', 1),
  (42, 39, 9,  'F41', 1),
  (43, 40, 9,  'F41', 1),
  (44, 42, 10, 'E11', 1),
  (45, 43, 10, 'E11', 1),
  (46, 44, 10, 'E11', 1),
  (47, 45, 10, 'I10', 1),
  (48, 46, 10, 'I10', 1),
  (49, 47, 10, 'I10', 1),
  (50, 48, 10, 'I50', 1),
  (51, 48, 10, 'E11', 0),
  (52, 48, 10, 'I10', 0),
  (53, 49, 10, 'I50', 1),
  (54, 50, 10, 'E11', 1),
  (55, 54, 12, 'Z00', 1),
  (56, 55, 12, 'E11', 1);

-- 56 portal events, 2026-07-20 .. 2026-07-23 (epoch seconds, UTC).
-- Day openers: 07-20 = 1784505600 · 07-21 = 1784592000 · 07-22 = 1784678400
-- · 07-23 = 1784764800. Shapes:
--   P1  07-20: login -> refill (90s) -> message (510s) -> bill_pay 2400s
--              later (the ONLY within-day gap in (1800, 3600] besides P9's)
--   P1  07-22: login -> bill_pay EXACTLY 1800s later (ON the session cutoff)
--   P3  07-21: FOUR appt_book 60s apart (6 velocity pairs <= 300s), login
--              1200s before the burst — one session
--   P9  07-23: appt_book pair EXACTLY 300s apart (the 7th inclusive pair)
--   P11:       ONE login ever (their entire digital footprint)
--   bill_pay:  only P1 (x2) and P10 (x1); P10 logs in every day
--   Type census: login 26 · appt_book 7 · refill_request 11 · message 9 ·
--   bill_pay 3. Sessions @ strict >1800 cutoff: 28 total (29 inclusive).
INSERT INTO portal_events (event_id, patient_id, event_type, event_ts) VALUES
  (1,  1,  'login',          1784505600 + 32400),
  (2,  1,  'refill_request', 1784505600 + 32490),
  (3,  1,  'message',        1784505600 + 33000),
  (4,  1,  'bill_pay',       1784505600 + 35400),
  (5,  2,  'login',          1784505600 + 33900),
  (6,  2,  'refill_request', 1784505600 + 34500),
  (7,  3,  'login',          1784592000 + 42000),
  (8,  3,  'appt_book',      1784592000 + 43200),
  (9,  3,  'appt_book',      1784592000 + 43260),
  (10, 3,  'appt_book',      1784592000 + 43320),
  (11, 3,  'appt_book',      1784592000 + 43380),
  (12, 3,  'login',          1784764800 + 33300),
  (13, 3,  'message',        1784764800 + 34500),
  (14, 4,  'login',          1784592000 + 35000),
  (15, 4,  'refill_request', 1784592000 + 35900),
  (16, 4,  'login',          1784678400 + 35600),
  (17, 4,  'message',        1784678400 + 36600),
  (18, 5,  'login',          1784505600 + 37800),
  (19, 5,  'message',        1784505600 + 38400),
  (20, 5,  'login',          1784592000 + 37200),
  (21, 5,  'refill_request', 1784592000 + 38100),
  (22, 5,  'login',          1784678400 + 37400),
  (23, 6,  'login',          1784505600 + 33300),
  (24, 6,  'refill_request', 1784505600 + 33900),
  (25, 6,  'login',          1784678400 + 37500),
  (26, 6,  'message',        1784678400 + 38100),
  (27, 7,  'login',          1784505600 + 34200),
  (28, 7,  'message',        1784505600 + 35100),
  (29, 7,  'login',          1784592000 + 36000),
  (30, 7,  'refill_request', 1784592000 + 36900),
  (31, 8,  'login',          1784505600 + 39600),
  (32, 8,  'message',        1784505600 + 40200),
  (33, 8,  'login',          1784764800 + 39000),
  (34, 8,  'refill_request', 1784764800 + 39600),
  (35, 9,  'appt_book',      1784764800 + 36000),
  (36, 9,  'appt_book',      1784764800 + 36300),
  (37, 9,  'login',          1784764800 + 40000),
  (38, 9,  'refill_request', 1784764800 + 40800),
  (39, 10, 'login',          1784505600 + 33300),
  (40, 10, 'refill_request', 1784505600 + 34200),
  (41, 10, 'login',          1784592000 + 36900),
  (42, 10, 'message',        1784592000 + 37800),
  (43, 10, 'login',          1784678400 + 36000),
  (44, 10, 'appt_book',      1784678400 + 37200),
  (45, 10, 'login',          1784764800 + 38400),
  (46, 10, 'bill_pay',       1784764800 + 39300),
  (47, 11, 'login',          1784592000 + 43200),
  (48, 12, 'login',          1784505600 + 40200),
  (49, 12, 'refill_request', 1784505600 + 41100),
  (50, 12, 'login',          1784764800 + 41400),
  (51, 1,  'login',          1784678400 + 32400),
  (52, 1,  'bill_pay',       1784678400 + 34200),
  (53, 2,  'login',          1784592000 + 35400),
  (54, 2,  'message',        1784592000 + 36300),
  (55, 2,  'login',          1784678400 + 34500),
  (56, 2,  'refill_request', 1784678400 + 35100);
`;
