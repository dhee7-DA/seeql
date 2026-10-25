// Domain Mastery — pack #3 "Fraud & AML" · world seed (probed before use).
// Every planted fact is asserted by scripts/r11-fraud-probe.ts; content may
// only cite facts that probe passes on.
export const DM_FRAUD_SEED = `INSERT INTO users (user_id, handle, country, kyc_tier, joined_date, status) VALUES
  (1,  'Priya Raman',   'US', 'enhanced', '2025-10-14', 'active'),
  (2,  'Marcel Osei',   'UK', 'enhanced', '2025-10-30', 'active'),
  (3,  'Tessa Grant',   'US', 'verified', '2025-11-11', 'active'),
  (4,  'Leo Fontaine',  'US', 'verified', '2025-11-26', 'active'),
  (5,  'Wei Lin Tan',   'SG', 'verified', '2025-12-09', 'active'),
  (6,  'Gwen Halloway', 'UK', 'verified', '2025-12-23', 'active'),
  (7,  'Farah Yusof',   'SG', 'verified', '2026-01-07', 'active'),
  (8,  'Jonah Reyes',   'US', 'basic',    '2026-01-20', 'active'),
  (9,  'Ravi Chandra',  'UK', 'verified', '2026-02-03', 'suspended'),
  (10, 'Felix Arden',   'US', 'enhanced', '2026-02-17', 'active'),
  (11, 'Imogen Cole',   'UK', 'basic',    '2026-03-04', 'limited'),
  (12, 'Kenji Sato',    'SG', 'basic',    '2026-03-18', 'active');

INSERT INTO devices (device_id, user_id, label, os, first_seen, trusted) VALUES
  (1,  1,  'Priya phone',   'iOS',     '2025-10-14', 1),
  (2,  1,  'Priya laptop',  'Web',     '2025-10-16', 1),
  (3,  2,  'Marcel phone',  'Android', '2025-10-30', 0),
  (4,  4,  'Leo phone',     'Android', '2025-11-26', 0),
  (5,  5,  'Wei Lin phone', 'iOS',     '2025-12-09', 1),
  (6,  6,  'Gwen laptop',   'Web',     '2025-12-23', 1),
  (7,  7,  'Farah phone',   'iOS',     '2026-01-07', 1),
  (8,  8,  'Jonah laptop',  'Web',     '2026-01-20', 0),
  (9,  9,  'Ravi phone',    'iOS',     '2026-02-03', 0),
  (10, 10, 'Felix phone',   'iOS',     '2026-02-17', 1),
  (11, 11, 'Imogen phone',  'Android', '2026-03-04', 1),
  (12, 12, 'Kenji phone',   'iOS',     '2026-03-18', 1),
  (13, 3,  'Tessa phone',   'Android', '2025-11-11', 1),
  (14, 6,  'Gwen tablet',   'iOS',     '2026-01-11', 1);

-- 56 p2p transfers · statuses: 46 settled / 3 pending / 5 failed / 2 reversed.
-- U5 (Wei Lin) and U7 (Farah) each send the same EIGHT settled everyday rows
-- (identical amount/channel multisets, 101200 total) plus the same 480000
-- mule leg on 04-03 — sent volume ties at 581200.
-- U8 (Jonah) and U9 (Ravi) hold a smaller mirror: three settled sends each,
-- 19500 total.
-- Mule ring: 04-02 U2 fans OUT 4 x 490000 (all under the 500000 EDD line);
-- 04-03 U5/U6/U7/U12 fan IN to U9 at 480000 each (1920000 total).
-- risk_score >= 80 on exactly 11 rows (8 mule legs, the 1000000 wire, the
-- reversed 159000, the blocked 25000 payout to U9).
INSERT INTO p2p (p2p_id, sender_id, receiver_id, p2p_date, amount_cents, channel, status, risk_score) VALUES
  (1,  5,  1,  '2026-02-06', 12900,   'wallet', 'settled', 12),  -- U5 mirror begins
  (2,  5,  2,  '2026-02-21', 8900,    'wallet', 'settled', 10),
  (3,  5,  3,  '2026-03-07', 15900,   'card',   'settled', 15),
  (4,  5,  4,  '2026-03-20', 4900,    'card',   'settled', 8),
  (5,  5,  6,  '2026-04-08', 24900,   'card',   'settled', 18),
  (6,  5,  8,  '2026-04-27', 7900,    'card',   'settled', 12),
  (7,  5,  10, '2026-05-09', 21900,   'card',   'settled', 15),
  (8,  5,  12, '2026-05-23', 3900,    'wallet', 'settled', 8),   -- U5 mirror ends (101200)
  (9,  7,  1,  '2026-02-11', 12900,   'wallet', 'settled', 12),  -- U7 mirror begins
  (10, 7,  2,  '2026-02-26', 8900,    'wallet', 'settled', 10),
  (11, 7,  3,  '2026-03-14', 15900,   'card',   'settled', 15),
  (12, 7,  4,  '2026-03-25', 4900,    'card',   'settled', 8),
  (13, 7,  6,  '2026-04-12', 24900,   'card',   'settled', 18),
  (14, 7,  8,  '2026-04-30', 7900,    'card',   'settled', 12),
  (15, 7,  10, '2026-05-18', 21900,   'card',   'settled', 15),
  (16, 7,  12, '2026-06-02', 3900,    'wallet', 'settled', 8),   -- U7 mirror ends (101200)
  (17, 8,  1,  '2026-03-02', 8500,    'wallet', 'settled', 10),  -- U8 mirror begins
  (18, 8,  3,  '2026-03-02', 4200,    'card',   'settled', 10),
  (19, 8,  5,  '2026-03-15', 6800,    'wallet', 'settled', 9),   -- U8 mirror ends (19500)
  (20, 9,  1,  '2026-03-09', 8500,    'wallet', 'settled', 10),  -- U9 mirror begins
  (21, 9,  3,  '2026-04-06', 4200,    'card',   'settled', 10),
  (22, 9,  5,  '2026-05-04', 6800,    'wallet', 'settled', 9),   -- U9 mirror ends (19500)
  (23, 2,  5,  '2026-04-02', 490000,  'wallet', 'settled', 92),  -- fan-out leg 1
  (24, 2,  6,  '2026-04-02', 490000,  'wallet', 'settled', 92),  -- fan-out leg 2
  (25, 2,  7,  '2026-04-02', 490000,  'wallet', 'settled', 92),  -- fan-out leg 3
  (26, 2,  12, '2026-04-02', 490000,  'wallet', 'settled', 92),  -- fan-out leg 4
  (27, 5,  9,  '2026-04-03', 480000,  'wallet', 'settled', 95),  -- fan-in leg 1
  (28, 6,  9,  '2026-04-03', 480000,  'wallet', 'settled', 95),  -- fan-in leg 2
  (29, 7,  9,  '2026-04-03', 480000,  'wallet', 'settled', 95),  -- fan-in leg 3
  (30, 12, 9,  '2026-04-03', 480000,  'wallet', 'settled', 95),  -- fan-in leg 4
  (31, 10, 6,  '2026-06-15', 1000000, 'bank',   'settled', 88),  -- ON the 1000000 SAR line
  (32, 3,  5,  '2026-01-19', 6800,    'card',   'settled', 30),  -- duplicate lane begins
  (33, 3,  5,  '2026-01-19', 6800,    'card',   'settled', 30),  -- duplicate lane ends
  (34, 2,  1,  '2026-01-20', 20000,   'wallet', 'settled', 12),
  (35, 2,  3,  '2026-02-08', 35000,   'card',   'settled', 14),
  (36, 6,  1,  '2026-01-12', 15000,   'wallet', 'settled', 10),
  (37, 6,  3,  '2026-02-14', 22000,   'card',   'settled', 12),
  (38, 6,  12, '2026-03-03', 9800,    'wallet', 'settled', 9),
  (39, 10, 3,  '2026-01-15', 28900,   'bank',   'settled', 15),
  (40, 10, 1,  '2026-02-17', 6800,    'card',   'settled', 10),
  (41, 1,  2,  '2026-01-09', 12900,   'wallet', 'settled', 10),
  (42, 1,  6,  '2026-01-27', 24900,   'card',   'settled', 14),
  (43, 1,  9,  '2026-02-25', 45900,   'card',   'settled', 20),
  (44, 4,  12, '2026-02-13', 30000,   'card',   'settled', 12),
  (45, 12, 7,  '2026-03-21', 22000,   'card',   'settled', 12),
  (46, 12, 1,  '2026-05-23', 9800,    'wallet', 'settled', 8),
  (47, 12, 6,  '2026-01-28', 40000,   'bank',   'failed',  25),
  (48, 1,  3,  '2026-03-12', 55000,   'wallet', 'failed',  20),
  (49, 3,  8,  '2026-02-21', 26000,   'card',   'failed',  18),
  (50, 6,  12, '2026-05-19', 31000,   'wallet', 'failed',  15),
  (51, 4,  9,  '2026-04-04', 25000,   'card',   'failed',  82),  -- blocked mule payout to U9
  (52, 1,  10, '2026-06-24', 19900,   'card',   'pending', 22),
  (53, 3,  7,  '2026-04-10', 7300,    'card',   'pending', 18),
  (54, 12, 8,  '2026-06-10', 20000,   'wallet', 'pending', 15),
  (55, 4,  8,  '2026-03-18', 45000,   'wallet', 'reversed', 55),
  (56, 10, 9,  '2026-06-11', 159000,  'card',   'reversed', 85); -- clawed back

-- 72 login attempts, 2026-07-20 .. 2026-07-23 (epoch seconds, UTC).
-- Day openers: 07-20 = 1784505600 · 07-21 = 1784592000 · 07-22 = 1784678400 ·
-- 07-23 = 1784764800. Shapes:
--   U1 07-20: 4 successes 90-210s apart, then a 2700s GAP — sessionization
--             bait (crosses the 1800s cutoff into 2 sessions)
--   U1 07-22: US login then SG login EXACTLY 3600s later — impossible travel
--             sitting ON the rule's threshold (inclusive bait)
--   U4 07-21: FIVE failed logins 60s apart (240s window) from NG, then a
--             success 200s after the last failure — credential-stuffing bait
--   U3:       exactly ONE login all window (quiet-day bait)
--   U9 07-22: two blocked-ip failures 60s apart (suspended user); 07-23 one
--             success from RU — the geo outlier
--   U11:      zero logins. Devices 11 and 14 never appear in any login.
-- Failed: 10 total — wrong-password 5, blocked-ip 3, 2fa-failed 2.
-- ip_country: US 21 · SG 39 · UK 5 · NG 6 · RU 1.
INSERT INTO logins (login_id, user_id, device_id, login_ts, ip_country, result, fail_reason) VALUES
  (1,  1,  1,  1784505600 + 32400, 'US', 'success', NULL),
  (2,  1,  2,  1784505600 + 32490, 'US', 'success', NULL),
  (3,  1,  1,  1784505600 + 32700, 'US', 'success', NULL),
  (4,  1,  1,  1784505600 + 35400, 'US', 'success', NULL),          -- 2700s after login 3
  (5,  2,  3,  1784505600 + 33900, 'SG', 'success', NULL),
  (6,  2,  3,  1784505600 + 41500, 'SG', 'success', NULL),
  (7,  3,  13, 1784505600 + 40500, 'SG', 'success', NULL),          -- U3 single-login day
  (8,  4,  4,  1784505600 + 36000, 'US', 'success', NULL),
  (9,  5,  5,  1784505600 + 37800, 'SG', 'success', NULL),
  (10, 5,  5,  1784505600 + 46800, 'SG', 'success', NULL),
  (11, 5,  5,  1784505600 + 51000, 'SG', 'success', NULL),
  (12, 6,  6,  1784505600 + 35400, 'UK', 'success', NULL),
  (13, 6,  6,  1784505600 + 46500, 'UK', 'success', NULL),
  (14, 7,  7,  1784505600 + 34200, 'SG', 'success', NULL),
  (15, 7,  7,  1784505600 + 45000, 'SG', 'success', NULL),
  (16, 8,  8,  1784505600 + 39600, 'US', 'success', NULL),
  (17, 9,  9,  1784505600 + 39600, 'SG', 'success', NULL),
  (18, 10, 10, 1784505600 + 33300, 'US', 'success', NULL),
  (19, 10, 10, 1784505600 + 42300, 'US', 'success', NULL),
  (20, 10, 10, 1784505600 + 52200, 'US', 'success', NULL),
  (21, 12, 12, 1784505600 + 31500, 'SG', 'success', NULL),
  (22, 12, 12, 1784505600 + 44100, 'SG', 'success', NULL),
  (23, 2,  3,  1784592000 + 35600, 'SG', 'success', NULL),
  (24, 2,  3,  1784592000 + 42900, 'SG', 'success', NULL),
  (25, 2,  3,  1784592000 + 53100, 'SG', 'success', NULL),
  (26, 4,  4,  1784592000 + 43200, 'NG', 'failed', 'wrong-password'),  -- burst begins
  (27, 4,  4,  1784592000 + 43260, 'NG', 'failed', 'wrong-password'),
  (28, 4,  4,  1784592000 + 43320, 'NG', 'failed', 'wrong-password'),
  (29, 4,  4,  1784592000 + 43380, 'NG', 'failed', 'wrong-password'),
  (30, 4,  4,  1784592000 + 43440, 'NG', 'failed', 'wrong-password'),  -- 5 fails in 240s
  (31, 4,  4,  1784592000 + 43640, 'NG', 'success', NULL),             -- 200s after last fail
  (32, 5,  5,  1784592000 + 36900, 'SG', 'success', NULL),
  (33, 5,  5,  1784592000 + 47400, 'SG', 'success', NULL),
  (34, 5,  5,  1784592000 + 51900, 'SG', 'success', NULL),
  (35, 6,  6,  1784592000 + 36900, 'UK', 'success', NULL),
  (36, 7,  7,  1784592000 + 35000, 'SG', 'success', NULL),
  (37, 7,  7,  1784592000 + 46500, 'SG', 'success', NULL),
  (38, 8,  8,  1784592000 + 37500, 'US', 'success', NULL),
  (39, 8,  8,  1784592000 + 42900, 'US', 'failed', '2fa-failed'),
  (40, 10, 10, 1784592000 + 39600, 'US', 'success', NULL),
  (41, 10, 10, 1784592000 + 51300, 'US', 'success', NULL),
  (42, 10, 10, 1784592000 + 58900, 'US', 'success', NULL),
  (43, 12, 12, 1784592000 + 51300, 'SG', 'failed', '2fa-failed'),
  (44, 12, 12, 1784592000 + 58500, 'SG', 'success', NULL),
  (45, 1,  1,  1784678400 + 32400, 'US', 'success', NULL),
  (46, 1,  1,  1784678400 + 36000, 'SG', 'success', NULL),          -- impossible travel: 3600s after 45
  (47, 2,  3,  1784678400 + 34200, 'SG', 'success', NULL),
  (48, 2,  3,  1784678400 + 42900, 'SG', 'success', NULL),
  (49, 2,  3,  1784678400 + 50100, 'SG', 'success', NULL),
  (50, 5,  5,  1784678400 + 37400, 'SG', 'success', NULL),
  (51, 6,  6,  1784678400 + 44700, 'UK', 'failed', 'blocked-ip'),
  (52, 7,  7,  1784678400 + 35600, 'SG', 'success', NULL),
  (53, 7,  7,  1784678400 + 41400, 'SG', 'success', NULL),
  (54, 8,  8,  1784678400 + 42900, 'US', 'success', NULL),
  (55, 9,  9,  1784678400 + 44700, 'SG', 'failed', 'blocked-ip'),   -- suspended user
  (56, 9,  9,  1784678400 + 44760, 'SG', 'failed', 'blocked-ip'),
  (57, 10, 10, 1784678400 + 52200, 'US', 'success', NULL),
  (58, 12, 12, 1784678400 + 42900, 'SG', 'success', NULL),
  (59, 12, 12, 1784678400 + 50100, 'SG', 'success', NULL),
  (60, 1,  1,  1784764800 + 38400, 'US', 'success', NULL),
  (61, 2,  3,  1784764800 + 33000, 'SG', 'success', NULL),
  (62, 2,  3,  1784764800 + 40200, 'SG', 'success', NULL),
  (63, 4,  4,  1784764800 + 37200, 'US', 'success', NULL),
  (64, 5,  5,  1784764800 + 37100, 'SG', 'success', NULL),
  (65, 5,  5,  1784764800 + 46500, 'SG', 'success', NULL),
  (66, 6,  6,  1784764800 + 38400, 'UK', 'success', NULL),
  (67, 7,  7,  1784764800 + 33000, 'SG', 'success', NULL),
  (68, 7,  7,  1784764800 + 45600, 'SG', 'success', NULL),
  (69, 8,  8,  1784764800 + 39000, 'US', 'success', NULL),
  (70, 9,  9,  1784764800 + 41400, 'RU', 'success', NULL),          -- geo outlier
  (71, 10, 10, 1784764800 + 54000, 'US', 'success', NULL),
  (72, 12, 12, 1784764800 + 36600, 'SG', 'success', NULL);

-- 12 disputes against settled transfers. Amount drifts from the referenced
-- p2p row on exactly 3 (partial disputes: 4→20000 vs 24900, 5→27000 vs 30000,
-- 12→25000 vs 28900). Reasons: unauthorized 6 / item-not-received 3 /
-- duplicate 2 / other 1. Statuses: open 4 / won 3 / lost 3 / cancelled 2.
-- U8 claims all three of his sends unauthorized (account-takeover story).
INSERT INTO disputes (dispute_id, user_id, p2p_id, amount_cents, reason, status, filed_date) VALUES
  (1,  8,  17, 8500,  'unauthorized',      'open',      '2026-03-20'),
  (2,  8,  18, 4200,  'unauthorized',      'won',       '2026-03-22'),
  (3,  8,  19, 6800,  'unauthorized',      'lost',      '2026-03-25'),
  (4,  1,  42, 20000, 'item-not-received', 'won',       '2026-02-10'),  -- partial (p2p 24900)
  (5,  4,  44, 27000, 'item-not-received', 'lost',      '2026-03-01'),  -- partial (p2p 30000)
  (6,  12, 45, 22000, 'other',             'open',      '2026-04-01'),
  (7,  12, 46, 9800,  'duplicate',         'lost',      '2026-06-01'),
  (8,  3,  32, 6800,  'duplicate',         'cancelled', '2026-01-25'),  -- disputing the dup
  (9,  5,  1,  12900, 'unauthorized',      'open',      '2026-02-15'),
  (10, 7,  9,  12900, 'unauthorized',      'open',      '2026-02-20'),
  (11, 6,  36, 15000, 'unauthorized',      'won',       '2026-01-30'),
  (12, 10, 39, 25000, 'item-not-received', 'cancelled', '2026-02-01');  -- partial (p2p 28900)

-- 12 risk cases · U2 owns 3 (the mule ring), U9/U4/U8 own 2 each, U1/U6/U11
-- one; U3/U5/U7/U10/U12 are never cased. Statuses: 6 open / 2 investigating /
-- 2 closed-false / 2 closed-confirmed. Severities: 3 high / 5 medium / 4 low.
-- Types: fraud 7 / aml 3 / kyc 1 / abuse 1. Exactly 3 SARs filed
-- (both U2 aml cases + U9's aml case). closed_date is set on exactly the 4
-- closed rows (closed-false/confirmed) and NULL on all 8 live ones.
INSERT INTO cases (case_id, user_id, case_type, severity, status, opened_date, closed_date, sar_filed) VALUES
  (1,  2,  'aml',   'high',   'investigating',    '2026-04-05', NULL,        1),
  (2,  2,  'aml',   'medium', 'open',             '2026-04-20', NULL,        1),
  (3,  2,  'fraud', 'low',    'closed-false',     '2026-02-10', '2026-02-28', 0),
  (4,  9,  'aml',   'high',   'open',             '2026-04-08', NULL,        1),
  (5,  9,  'fraud', 'medium', 'closed-confirmed', '2026-06-12', '2026-06-20', 0),
  (6,  4,  'fraud', 'medium', 'open',             '2026-07-21', NULL,        0),
  (7,  4,  'fraud', 'low',    'closed-false',     '2026-03-20', '2026-04-02', 0),
  (8,  11, 'kyc',   'medium', 'investigating',    '2026-06-30', NULL,        0),
  (9,  8,  'fraud', 'high',   'open',             '2026-03-21', NULL,        0),
  (10, 8,  'fraud', 'medium', 'closed-confirmed', '2026-04-02', '2026-04-15', 0),
  (11, 1,  'fraud', 'low',    'open',             '2026-07-23', NULL,        0),
  (12, 6,  'abuse', 'low',    'open',             '2026-05-11', NULL,        0);
`;
