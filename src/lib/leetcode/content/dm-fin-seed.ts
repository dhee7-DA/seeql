// Domain Mastery — pack #2 "Finance Core" · world seed (probed before use).
// Every planted fact is asserted by scripts/r10-fin-probe.ts; content may
// only cite facts that probe passes on.
export const DM_FIN_SEED = `INSERT INTO accounts (account_id, holder_name, account_type, branch, opened_date, tier) VALUES
  (1,  'Marcus Chen',    'checking', 'NYC',       '2025-11-12', 'premium'),
  (2,  'Dana Okafor',    'savings',  'NYC',       '2025-11-28', 'private'),
  (3,  'Viktor Lindqvist','checking','London',    '2025-12-05', 'premium'),
  (4,  'Lucia Ferrari',  'credit',   'London',    '2025-12-19', 'premium'),
  (5,  'Amara Nwosu',    'checking', 'Singapore', '2026-01-08', 'premium'),
  (6,  'Omar Haddad',    'savings',  'Dubai',     '2026-01-15', 'standard'),
  (7,  'Grace Tan',      'checking', 'Singapore', '2026-01-22', 'premium'),
  (8,  'Noah Feldman',   'checking', 'NYC',       '2026-02-02', 'standard'),
  (9,  'Elena Volkova',  'savings',  'London',    '2026-02-10', 'standard'),
  (10, 'Jack Mulrooney', 'credit',   'NYC',       '2026-02-18', 'premium'),
  (11, 'Ines Cardoso',   'savings',  'Singapore', '2026-03-06', 'standard'),
  (12, 'Fatima Al-Rashid','checking','Dubai',     '2026-03-20', 'standard');

INSERT INTO merchants (merchant_id, name, category, country, fee_bps) VALUES
  (1,  'FreshCart Markets',   'Grocery',     'US', 110),
  (2,  'GreenLine Grocers',   'Grocery',     'US', 110),
  (3,  'Daily Pantry',        'Grocery',     'UK', 110),
  (4,  'Umami House',         'Dining',      'US', 150),
  (5,  'Bella Cucina',        'Dining',      'UK', 150),
  (6,  'Taco Ring',           'Dining',      'US', 150),
  (7,  'SkyLine Airways',     'Travel',      'US', 220),
  (8,  'Hotel Meridian',      'Travel',      'SG', 220),
  (9,  'Voltix Electronics',  'Electronics', 'US', 180),
  (10, 'GadgetHub',           'Electronics', 'UK', 180),
  (11, 'CityPower Utility',   'Utilities',   'US', 60),
  (12, 'AquaFlow Water',      'Utilities',   'SG', 60),
  (13, 'ShieldLine Insurance','Insurance',   'UK', 90),
  (14, 'Solstice Cruises',    'Travel',      'US', 220);

-- 56 transactions · statuses: 47 posted / 3 pending / 4 declined / 2 reversed
-- A5 (Amara) and A7 (Grace) each hold EIGHT posted card debits with identical
-- (amount, bps) multisets — volume 101200 AND fee revenue 1659.40 tie.
-- A8 (Noah) and A9 (Elena) hold a smaller mirror: 19500 volume, 197.30 fee.
-- 02-14 (Omar) and 04-18 (Jack) each carry a LONE posted debit of 62000 —
-- a genuine daily-volume tie (probe-verified).
-- interchange_bps drifts from the merchant's current rate on exactly 3 rows
-- (4, 53, 56 — rate-change audit trap). reward_cents NOT NULL on exactly 11.
INSERT INTO transactions (txn_id, account_id, merchant_id, txn_date, direction, amount_cents, channel, status, interchange_bps, reward_cents) VALUES
  (1,  1,  1,    '2026-01-09', 'debit',  12900,   'card', 'posted',   110, NULL),
  (2,  1,  7,    '2026-01-27', 'debit',  24900,   'card', 'posted',   220, 500),
  (3,  1,  9,    '2026-02-25', 'debit',  45900,   'card', 'posted',   180, 900),
  (4,  1,  9,    '2026-03-11', 'debit',  249000,  'card', 'posted',   150, 2500),  -- drift: Voltix now 180
  (5,  1,  10,   '2026-04-22', 'debit',  129000,  'card', 'posted',   180, 1290),
  (6,  1,  8,    '2026-05-06', 'credit', 68000,   'card', 'posted',   220, NULL),  -- Hotel Meridian refund
  (7,  1,  NULL, '2026-05-30', 'credit', 35800,   'ach',  'posted',   0,   NULL),  -- interest credit
  (8,  1,  8,    '2026-06-19', 'debit',  73000,   'card', 'reversed', 220, NULL),
  (9,  1,  10,   '2026-06-24', 'debit',  19900,   'card', 'pending',  180, NULL),
  (10, 2,  13,   '2026-06-15', 'debit',  1000000, 'wire', 'posted',   0,   NULL),  -- ON the 1000000 line
  (11, 2,  NULL, '2026-03-05', 'debit',  250000,  'wire', 'posted',   0,   NULL),
  (12, 2,  NULL, '2026-04-02', 'credit', 120500,  'ach',  'posted',   0,   NULL),  -- interest credit
  (13, 3,  11,   '2026-01-19', 'debit',  6800,    'card', 'posted',   60,  NULL),
  (14, 3,  11,   '2026-01-19', 'debit',  6800,    'card', 'posted',   60,  NULL),  -- duplicate acct+merchant+day
  (15, 3,  4,    '2026-04-10', 'debit',  7300,    'card', 'pending',  150, NULL),
  (16, 4,  5,    '2026-02-27', 'debit',  159000,  'card', 'posted',   150, 1600),
  (17, 4,  6,    '2026-03-28', 'debit',  9800,    'card', 'posted',   150, NULL),
  (18, 4,  5,    '2026-04-24', 'debit',  189000,  'card', 'declined', 150, NULL),
  (19, 4,  5,    '2026-05-16', 'credit', 9800,    'card', 'posted',   150, NULL),  -- Bella refund
  (20, 4,  7,    '2026-06-21', 'debit',  45900,   'card', 'posted',   220, 900),
  (21, 5,  1,    '2026-02-06', 'debit',  12900,   'card', 'posted',   110, NULL),  -- A5 mirror begins
  (22, 5,  3,    '2026-02-21', 'debit',  8900,    'card', 'posted',   110, NULL),
  (23, 5,  4,    '2026-03-07', 'debit',  15900,   'card', 'posted',   150, NULL),
  (24, 5,  6,    '2026-03-20', 'debit',  4900,    'card', 'posted',   150, NULL),
  (25, 5,  7,    '2026-04-08', 'debit',  24900,   'card', 'posted',   220, 500),
  (26, 5,  9,    '2026-04-27', 'debit',  7900,    'card', 'posted',   180, NULL),
  (27, 5,  10,   '2026-05-09', 'debit',  21900,   'card', 'posted',   180, NULL),
  (28, 5,  12,   '2026-05-23', 'debit',  3900,    'card', 'posted',   60,  NULL),   -- A5 mirror ends (101200)
  (29, 6,  8,    '2026-02-14', 'debit',  62000,   'card', 'posted',   220, NULL),   -- lone debit day 1
  (30, 6,  9,    '2026-03-17', 'debit',  18900,   'card', 'declined', 180, NULL),
  (31, 6,  4,    '2026-05-27', 'debit',  15900,   'card', 'posted',   150, 300),
  (32, 7,  2,    '2026-02-11', 'debit',  12900,   'card', 'posted',   110, NULL),   -- A7 mirror begins
  (33, 7,  1,    '2026-02-26', 'debit',  8900,    'card', 'posted',   110, NULL),
  (34, 7,  5,    '2026-03-14', 'debit',  15900,   'card', 'posted',   150, NULL),
  (35, 7,  4,    '2026-03-25', 'debit',  4900,    'card', 'posted',   150, NULL),
  (36, 7,  8,    '2026-04-12', 'debit',  24900,   'card', 'posted',   220, 500),
  (37, 7,  10,   '2026-04-30', 'debit',  7900,    'card', 'posted',   180, NULL),
  (38, 7,  9,    '2026-05-18', 'debit',  21900,   'card', 'posted',   180, NULL),
  (39, 7,  11,   '2026-06-02', 'debit',  3900,    'card', 'posted',   60,  NULL),   -- A7 mirror ends (101200)
  (40, 8,  1,    '2026-03-02', 'debit',  8500,    'card', 'posted',   110, NULL),   -- A8 mirror begins
  (41, 8,  4,    '2026-03-02', 'debit',  4200,    'card', 'posted',   150, NULL),
  (42, 8,  11,   '2026-03-15', 'debit',  6800,    'card', 'posted',   60,  NULL),   -- A8 mirror ends (19500)
  (43, 8,  NULL, '2026-05-11', 'credit', 990000,  'atm',  'posted',   0,   NULL),   -- structuring 1
  (44, 8,  NULL, '2026-05-11', 'credit', 995000,  'atm',  'posted',   0,   NULL),   -- structuring 2
  (45, 8,  NULL, '2026-05-11', 'credit', 998000,  'atm',  'posted',   0,   NULL),   -- structuring 3 (all under 1000000)
  (46, 9,  2,    '2026-03-09', 'debit',  8500,    'card', 'posted',   110, NULL),   -- A9 mirror begins
  (47, 9,  5,    '2026-04-06', 'debit',  4200,    'card', 'posted',   150, NULL),
  (48, 9,  12,   '2026-05-04', 'debit',  6800,    'card', 'posted',   60,  NULL),   -- A9 mirror ends (19500)
  (49, 9,  9,    '2026-06-14', 'debit',  29900,   'card', 'declined', 180, NULL),
  (50, 10, 9,    '2026-01-15', 'debit',  19900,   'card', 'posted',   180, 400),
  (51, 10, 7,    '2026-02-17', 'debit',  45900,   'card', 'pending',  220, NULL),
  (52, 10, 10,   '2026-03-23', 'debit',  159000,  'card', 'reversed', 180, NULL),
  (53, 10, 8,    '2026-04-18', 'debit',  62000,   'card', 'posted',   200, 620),   -- lone debit day 2 (drift: Meridian now 220)
  (54, 10, 7,    '2026-05-08', 'credit', 45900,   'card', 'posted',   220, NULL),   -- SkyLine refund
  (55, 10, 9,    '2026-06-11', 'debit',  28900,   'card', 'declined', 180, NULL),
  (56, 12, 3,    '2026-01-30', 'debit',  12900,   'card', 'posted',   150, NULL);  -- drift: Daily Pantry now 110

-- 36 card authorizations, 2026-07-20 .. 2026-07-23 (epoch seconds, UTC).
-- Day openers: 07-20 = 1784505600 · 07-21 = 1784592000 · 07-22 = 1784678400 ·
-- 07-23 = 1784764800 (probe-verified in round 9; re-asserted here). Shapes:
--   A1 07-20: 3 approvals 90-210s apart, then a 2700s GAP, then a decline —
--             sessionization bait (crosses the 1800s cutoff into 2 sessions)
--   A4 07-21: FOUR declines 90s apart (270s window) at Bella Cucina, then an
--             approval — card-testing velocity bait
--   A3 07-20: exactly ONE auth all window (quiet-day bait)
--   A6 07-22: a lone decline, no other auths that day
--   A11:      zero auths (the dormant account never even gets declined)
-- Declines: 10 total — limit-exceeded 4, insufficient-funds 4, fraud-suspect 2.
INSERT INTO auths (auth_id, account_id, auth_ts, merchant_id, amount_cents, result, decline_reason) VALUES
  (1,  1,  1784505600 + 32400, 1,  3200,   'approved', NULL),
  (2,  1,  1784505600 + 32490, 4,  5400,   'approved', NULL),
  (3,  1,  1784505600 + 32700, 3,  8900,   'approved', NULL),
  (4,  1,  1784505600 + 35400, 9,  199000, 'declined', 'fraud-suspect'),      -- 2700s after auth 3
  (5,  3,  1784505600 + 40500, 11, 6800,   'approved', NULL),                 -- A3 single-auth day
  (6,  2,  1784505600 + 36000, 2,  8900,   'approved', NULL),
  (7,  5,  1784505600 + 37800, 1,  12900,  'approved', NULL),
  (8,  7,  1784505600 + 33900, 2,  12900,  'approved', NULL),
  (9,  9,  1784505600 + 39600, 5,  4200,   'approved', NULL),
  (10, 10, 1784505600 + 55000, 10, 159000, 'declined', 'fraud-suspect'),
  (11, 12, 1784505600 + 55800, 3,  12900,  'approved', NULL),
  (12, 4,  1784592000 + 43200, 5,  189000, 'declined', 'limit-exceeded'),     -- burst begins
  (13, 4,  1784592000 + 43290, 5,  189000, 'declined', 'limit-exceeded'),
  (14, 4,  1784592000 + 43380, 5,  189000, 'declined', 'limit-exceeded'),
  (15, 4,  1784592000 + 43470, 5,  189000, 'declined', 'limit-exceeded'),     -- 4 declines in 270s
  (16, 4,  1784592000 + 43600, 6,  12900,  'approved', NULL),                 -- burst then success
  (17, 2,  1784592000 + 51300, 3,  12900,  'approved', NULL),
  (18, 5,  1784592000 + 36900, 6,  4900,   'approved', NULL),
  (19, 7,  1784592000 + 35000, 8,  24900,  'approved', NULL),
  (20, 8,  1784592000 + 42900, 9,  500000, 'declined', 'insufficient-funds'),
  (21, 10, 1784592000 + 58900, 7,  45900,  'approved', NULL),
  (22, 12, 1784592000 + 51300, 6,  9900,   'declined', 'insufficient-funds'),
  (23, 1,  1784678400 + 31800, 2,  4500,   'approved', NULL),
  (24, 1,  1784678400 + 31890, 1,  12900,  'approved', NULL),
  (25, 6,  1784678400 + 44700, 8,  45000,  'declined', 'insufficient-funds'), -- A6 lone decline day
  (26, 5,  1784678400 + 37400, 9,  7900,   'approved', NULL),
  (27, 7,  1784678400 + 35600, 12, 3900,   'approved', NULL),
  (28, 8,  1784678400 + 34000, 1,  8500,   'approved', NULL),
  (29, 9,  1784678400 + 40900, 9,  19900,  'declined', 'insufficient-funds'),
  (30, 10, 1784678400 + 52200, 9,  19900,  'approved', NULL),
  (31, 2,  1784678400 + 55000, 6,  2500,   'approved', NULL),
  (32, 4,  1784764800 + 37200, 7,  24900,  'approved', NULL),
  (33, 2,  1784764800 + 40000, 11, 6800,   'approved', NULL),
  (34, 5,  1784764800 + 37100, 10, 21900,  'approved', NULL),
  (35, 7,  1784764800 + 33000, 3,  8900,   'approved', NULL),
  (36, 10, 1784764800 + 54000, 9,  28900,  'approved', NULL);

-- 14 internal transfers · 11 settled / 2 failed / 1 pending. The A2→A6 pair
-- fires twice (most frequent lane); A4→A4 is a SELF-transfer (hygiene bait);
-- A2→A11 feeds the dormant account (anti-join bait).
INSERT INTO transfers (transfer_id, from_account, to_account, transfer_date, amount_cents, status) VALUES
  (1,  1,  2,  '2026-01-20', 200000, 'settled'),
  (2,  2,  6,  '2026-02-08', 500000, 'settled'),
  (3,  2,  6,  '2026-03-21', 750000, 'settled'),
  (4,  4,  9,  '2026-02-13', 30000,  'settled'),
  (5,  10, 4,  '2026-03-06', 60000,  'settled'),
  (6,  12, 6,  '2026-04-05', 25000,  'settled'),
  (7,  3,  9,  '2026-04-16', 18000,  'settled'),
  (8,  7,  5,  '2026-05-02', 40000,  'settled'),
  (9,  2,  11, '2026-05-15', 150000, 'settled'),   -- into the dormant account
  (10, 4,  4,  '2026-05-25', 90000,  'settled'),   -- self-transfer
  (11, 5,  12, '2026-06-04', 25000,  'settled'),
  (12, 6,  12, '2026-01-28', 40000,  'failed'),
  (13, 1,  3,  '2026-03-12', 55000,  'failed'),
  (14, 9,  8,  '2026-06-10', 20000,  'pending');

-- 12 alerts · per-account: A8 owns 3, A2/A4/A10 own 2 each, A6/A9/A11 one;
-- A1, A3, A5, A7, A12 are never alerted. Statuses: 5 open / 3 investigating /
-- 2 closed-false / 2 closed-confirmed. Severities: 2 high / 6 medium / 4 low.
INSERT INTO alerts (alert_id, account_id, alert_date, alert_type, severity, status) VALUES
  (1,  4,  '2026-07-21', 'velocity',   'medium', 'open'),
  (2,  4,  '2026-07-23', 'geo',        'low',    'closed-false'),
  (3,  8,  '2026-05-12', 'structuring', 'high',   'open'),
  (4,  8,  '2026-07-19', 'dark-web',    'medium', 'investigating'),
  (5,  8,  '2026-03-03', 'high-value',  'medium', 'closed-confirmed'),
  (6,  2,  '2026-06-16', 'high-value',  'low',    'closed-false'),
  (7,  2,  '2026-02-21', 'geo',         'medium', 'open'),
  (8,  10, '2026-04-19', 'geo',         'medium', 'investigating'),
  (9,  10, '2026-06-12', 'high-value',  'low',    'open'),
  (10, 6,  '2026-05-28', 'high-value',  'medium', 'open'),
  (11, 11, '2026-06-30', 'dark-web',    'high',   'investigating'),
  (12, 9,  '2026-07-22', 'velocity',    'low',    'closed-confirmed');
`;
