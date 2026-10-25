// Domain Mastery — pack #4 "SaaS & Subscriptions" · world seed (probed before use).
// Every planted fact is asserted by scripts/r12-saas-probe.ts; content may
// only cite facts that probe passes on.
export const DM_SAAS_SEED = `INSERT INTO accounts (account_id, name, segment, region, signup_date, status, owner) VALUES
  (1,  'Lumen Robotics',   'Enterprise', 'NA',    '2025-10-14', 'active',  'Dana Whit'),
  (2,  'Cormorant Health', 'MidMarket',  'EMEA',  '2025-10-30', 'active',  'Dana Whit'),
  (3,  'Hexa Logistics',   'SMB',        'NA',    '2025-11-11', 'active',  'Priya Nair'),
  (4,  'Brightfold Media', 'SMB',        'APAC',  '2025-11-26', 'active',  'Priya Nair'),
  (5,  'Quarry Analytics', 'MidMarket',  'EMEA',  '2025-12-09', 'active',  'Dana Whit'),
  (6,  'Aster & Vale',     'Enterprise', 'NA',    '2025-12-23', 'active',  'Sam Ortega'),
  (7,  'Fernpath Studio',  'SMB',        'APAC',  '2026-01-07', 'active',  'Priya Nair'),
  (8,  'Talus Freight',    'MidMarket',  'NA',    '2026-01-20', 'active',  'Sam Ortega'),
  (9,  'Osier Partners',   'SMB',        'EMEA',  '2026-02-03', 'active',  'Priya Nair'),
  (10, 'Vireo Capital',    'Enterprise', 'LATAM', '2026-06-01', 'active',  'Sam Ortega'),
  (11, 'Mosslight Labs',   'MidMarket',  'APAC',  '2026-03-04', 'active',  'Priya Nair'),
  (12, 'Kelpware Systems', 'SMB',        'LATAM', '2026-03-18', 'churned', 'Sam Ortega');

-- 16 subscription rows (plan history). A plan change CLOSES the old row and
-- OPENS a new one; end_date NULL = current. Current MRR groups:
--   100000 x1 (A10 whale, exactly ON the line) · 24900 x2 (A1, A4)
--   9900 x4 (A2, A6, A8, A9) · 4900 x4 (A3, A5, A7, A11) · A12 churned.
-- Naive churn = SUM(mrr) over the 5 end-dated rows = 54500 (11x too high);
-- true churn = A12 only (4900) — A2's end-dated row is undone by the rejoin.
INSERT INTO subscriptions (sub_id, account_id, plan, mrr_cents, start_date, end_date) VALUES
  (1,  1,  'Scale',      24900,  '2025-10-14', NULL),
  (2,  2,  'Growth',     9900,   '2025-10-30', '2026-03-31'),  -- A2 churns ...
  (3,  2,  'Growth',     9900,   '2026-05-01', NULL),          -- ... and REJOINS
  (4,  3,  'Starter',    4900,   '2025-11-11', NULL),
  (5,  4,  'Starter',    4900,   '2025-11-26', '2026-01-31'),  -- A4 ladder rung 1
  (6,  4,  'Growth',     9900,   '2026-02-01', '2026-03-31'),  -- expansion +5000
  (7,  4,  'Scale',      24900,  '2026-04-01', NULL),          -- expansion +15000
  (8,  5,  'Starter',    4900,   '2025-12-09', NULL),
  (9,  6,  'Scale',      24900,  '2025-12-23', '2026-04-15'),  -- A6 downgrade ...
  (10, 6,  'Growth',     9900,   '2026-04-15', NULL),          -- ... contraction -15000
  (11, 7,  'Starter',    4900,   '2026-01-07', NULL),
  (12, 8,  'Growth',     9900,   '2026-01-20', NULL),
  (13, 9,  'Growth',     9900,   '2026-02-03', NULL),
  (14, 10, 'Enterprise', 100000, '2026-06-01', NULL),          -- ON the 100000 line
  (15, 11, 'Starter',    4900,   '2026-03-04', NULL),
  (16, 12, 'Starter',    4900,   '2026-03-18', '2026-04-30');  -- true churn, no rejoin

-- 62 invoices · statuses: 53 paid / 7 failed / 1 pending / 1 refunded.
-- Issued on the 1st except: A7 starts 01-07, A11 bills on the 4th, A12 signs
-- 03-18, the A3 duplicate pair lands 01-19, A6's proration blend on 04-15.
-- paid_date NULL exactly on the 7 failed + 1 pending rows.
-- Drift rows (amount != subscription active at issue): A2 May 8900, A2 Jun
-- 8900 (rejoin promo; sub is 9900), A6 Apr-15 17400 (15/15-day blend).
INSERT INTO invoices (invoice_id, account_id, issued_date, amount_cents, status, paid_date) VALUES
  (1,  1,  '2026-01-01', 24900,  'paid',     '2026-01-03'),
  (2,  1,  '2026-02-01', 24900,  'paid',     '2026-02-03'),
  (3,  1,  '2026-03-01', 24900,  'paid',     '2026-03-03'),
  (4,  1,  '2026-04-01', 24900,  'paid',     '2026-04-03'),
  (5,  1,  '2026-05-01', 24900,  'paid',     '2026-05-03'),
  (6,  1,  '2026-06-01', 24900,  'paid',     '2026-06-03'),
  (7,  2,  '2026-01-01', 9900,   'paid',     '2026-01-04'),
  (8,  2,  '2026-02-01', 9900,   'paid',     '2026-02-04'),
  (9,  2,  '2026-03-01', 9900,   'paid',     '2026-03-04'),
  (10, 2,  '2026-05-01', 8900,   'paid',     '2026-05-04'),   -- rejoin promo (drift)
  (11, 2,  '2026-06-01', 8900,   'paid',     '2026-06-04'),   -- promo continues (drift)
  (12, 3,  '2026-01-01', 4900,   'paid',     '2026-01-05'),
  (13, 3,  '2026-01-19', 4900,   'paid',     '2026-01-22'),   -- duplicate begins
  (14, 3,  '2026-01-19', 4900,   'refunded', '2026-01-22'),   -- duplicate, refunded
  (15, 3,  '2026-02-01', 4900,   'paid',     '2026-02-05'),
  (16, 3,  '2026-03-01', 4900,   'paid',     '2026-03-05'),
  (17, 3,  '2026-04-01', 4900,   'paid',     '2026-04-05'),
  (18, 3,  '2026-05-01', 4900,   'paid',     '2026-05-05'),
  (19, 3,  '2026-06-01', 4900,   'paid',     '2026-06-05'),
  (20, 4,  '2026-01-01', 4900,   'paid',     '2026-01-06'),
  (21, 4,  '2026-02-01', 9900,   'failed',   NULL),           -- dunning saga begins
  (22, 4,  '2026-03-01', 9900,   'failed',   NULL),
  (23, 4,  '2026-04-01', 24900,  'failed',   NULL),
  (24, 4,  '2026-05-01', 24900,  'failed',   NULL),
  (25, 4,  '2026-06-01', 24900,  'paid',     '2026-06-06'),   -- recovery
  (26, 5,  '2026-01-01', 4900,   'paid',     '2026-01-07'),
  (27, 5,  '2026-02-01', 4900,   'failed',   NULL),
  (28, 5,  '2026-03-01', 4900,   'paid',     '2026-03-07'),
  (29, 5,  '2026-04-01', 4900,   'paid',     '2026-04-07'),
  (30, 5,  '2026-05-01', 4900,   'paid',     '2026-05-07'),
  (31, 5,  '2026-06-01', 4900,   'paid',     '2026-06-07'),
  (32, 6,  '2026-01-01', 24900,  'paid',     '2026-01-08'),
  (33, 6,  '2026-02-01', 24900,  'paid',     '2026-02-08'),
  (34, 6,  '2026-03-01', 24900,  'paid',     '2026-03-08'),
  (35, 6,  '2026-04-15', 17400,  'paid',     '2026-04-18'),   -- proration blend (drift)
  (36, 6,  '2026-05-01', 9900,   'paid',     '2026-05-08'),
  (37, 6,  '2026-06-01', 9900,   'paid',     '2026-06-08'),
  (38, 7,  '2026-01-07', 4900,   'paid',     '2026-01-10'),
  (39, 7,  '2026-02-01', 4900,   'failed',   NULL),
  (40, 7,  '2026-03-01', 4900,   'paid',     '2026-03-10'),
  (41, 7,  '2026-04-01', 4900,   'paid',     '2026-04-10'),
  (42, 7,  '2026-05-01', 4900,   'paid',     '2026-05-10'),
  (43, 7,  '2026-06-01', 4900,   'paid',     '2026-06-10'),
  (44, 8,  '2026-01-01', 9900,   'paid',     '2026-01-11'),
  (45, 8,  '2026-02-01', 9900,   'paid',     '2026-02-11'),
  (46, 8,  '2026-03-01', 9900,   'paid',     '2026-03-11'),
  (47, 8,  '2026-04-01', 9900,   'paid',     '2026-04-11'),
  (48, 8,  '2026-05-01', 9900,   'paid',     '2026-05-11'),
  (49, 8,  '2026-06-01', 9900,   'paid',     '2026-06-11'),
  (50, 9,  '2026-01-01', 9900,   'paid',     '2026-01-12'),
  (51, 9,  '2026-02-01', 9900,   'paid',     '2026-02-12'),
  (52, 9,  '2026-03-01', 9900,   'paid',     '2026-03-12'),
  (53, 9,  '2026-04-01', 9900,   'paid',     '2026-04-12'),
  (54, 9,  '2026-05-01', 9900,   'paid',     '2026-05-12'),
  (55, 9,  '2026-06-01', 9900,   'paid',     '2026-06-12'),
  (56, 10, '2026-06-01', 100000, 'paid',     '2026-06-03'),   -- the whale invoice
  (57, 11, '2026-03-04', 4900,   'paid',     '2026-03-08'),
  (58, 11, '2026-04-04', 4900,   'failed',   NULL),           -- dunning while dark
  (59, 11, '2026-05-04', 4900,   'paid',     '2026-05-08'),
  (60, 11, '2026-06-04', 4900,   'pending',  NULL),           -- current cycle unpaid
  (61, 12, '2026-03-18', 4900,   'paid',     '2026-03-22'),
  (62, 12, '2026-04-01', 4900,   'paid',     '2026-04-04');

-- 14 seats. Seat 11 (A11) never activated (last_active NULL); seat 13 is the
-- burst-invited A2 member; accounts 3 and 6 have NO seat rows at all.
-- 2-seat club: A1 (1,2) · A2 (3,13) · A5 (5,6) · A8 (8,9).
INSERT INTO seats (seat_id, account_id, role, joined_date, last_active_date) VALUES
  (1,  1,  'admin',  '2025-10-14', '2026-07-23'),
  (2,  1,  'member', '2025-10-16', '2026-07-22'),
  (3,  2,  'admin',  '2025-10-30', '2026-07-23'),
  (4,  4,  'admin',  '2025-11-26', '2026-07-21'),
  (5,  5,  'admin',  '2025-12-09', '2026-07-22'),
  (6,  5,  'member', '2025-12-20', '2026-07-22'),
  (7,  7,  'admin',  '2026-01-07', '2026-07-23'),
  (8,  8,  'admin',  '2026-01-20', '2026-07-21'),
  (9,  8,  'viewer', '2026-02-01', '2026-07-21'),
  (10, 9,  'admin',  '2026-02-03', '2026-07-22'),
  (11, 11, 'admin',  '2026-03-04', NULL),
  (12, 12, 'admin',  '2026-03-18', '2026-04-28'),   -- went dark before churn
  (13, 2,  'member', '2026-07-21', '2026-07-21'),   -- invited in the burst
  (14, 10, 'admin',  '2026-06-01', '2026-07-23');

-- 72 product events, 2026-07-20 .. 2026-07-23 (epoch seconds, UTC).
-- Day openers: 07-20 = 1784505600 · 07-21 = 1784592000 · 07-22 = 1784678400 ·
-- 07-23 = 1784764800. Shapes:
--   seat 1 07-20: login/report_run/api_call 90-210s apart then export 2700s
--                 after the api_call — the 1800s session cutoff splits it
--   seat 1 07-22: login then export EXACTLY 3600s later (inclusive bait)
--   seat 3 07-21: FOUR invites 60s apart (6 velocity pairs <= 300s), then
--                 seat 13's first-and-only login 200s after the last invite
--   seats 11/12:  zero events (dormant A11, churned A12)
--   exports:      only seats 1 (x2) and 14 (x1)
-- Type census: login 36 · report_run 18 · api_call 11 · invite 4 · export 3.
INSERT INTO events (event_id, seat_id, account_id, event_type, event_ts) VALUES
  (1,  1,  1,  'login',      1784505600 + 32400),
  (2,  1,  1,  'report_run', 1784505600 + 32490),
  (3,  1,  1,  'api_call',   1784505600 + 32700),
  (4,  1,  1,  'export',     1784505600 + 35400),   -- 2700s after event 3
  (5,  2,  1,  'login',      1784505600 + 34500),
  (6,  2,  1,  'report_run', 1784505600 + 35100),
  (7,  3,  2,  'login',      1784505600 + 33900),
  (8,  4,  4,  'login',      1784505600 + 36000),
  (9,  4,  4,  'api_call',   1784505600 + 36900),
  (10, 5,  5,  'login',      1784505600 + 37800),
  (11, 5,  5,  'report_run', 1784505600 + 38700),
  (12, 7,  7,  'login',      1784505600 + 34200),
  (13, 7,  7,  'report_run', 1784505600 + 34800),
  (14, 8,  8,  'login',      1784505600 + 39600),
  (15, 8,  8,  'report_run', 1784505600 + 40200),
  (16, 10, 9,  'login',      1784505600 + 33300),
  (17, 10, 9,  'report_run', 1784505600 + 34200),
  (18, 10, 9,  'api_call',   1784505600 + 35100),
  (19, 14, 10, 'login',      1784505600 + 33300),
  (20, 14, 10, 'report_run', 1784505600 + 34200),
  (21, 14, 10, 'api_call',   1784505600 + 35100),
  (22, 1,  1,  'login',      1784592000 + 33600),
  (23, 1,  1,  'report_run', 1784592000 + 34200),
  (24, 3,  2,  'invite',     1784592000 + 43200),   -- burst begins
  (25, 3,  2,  'invite',     1784592000 + 43260),
  (26, 3,  2,  'invite',     1784592000 + 43320),
  (27, 3,  2,  'invite',     1784592000 + 43380),   -- 4 invites in 180s
  (28, 3,  2,  'login',      1784592000 + 44700),
  (29, 13, 2,  'login',      1784592000 + 43580),   -- seat 13: 200s after last invite
  (30, 4,  4,  'login',      1784592000 + 37200),
  (31, 4,  4,  'report_run', 1784592000 + 38100),
  (32, 5,  5,  'login',      1784592000 + 36900),
  (33, 5,  5,  'api_call',   1784592000 + 37500),
  (34, 6,  5,  'login',      1784592000 + 46800),
  (35, 6,  5,  'report_run', 1784592000 + 47400),
  (36, 7,  7,  'login',      1784592000 + 35000),
  (37, 7,  7,  'api_call',   1784592000 + 36000),
  (38, 8,  8,  'login',      1784592000 + 37500),
  (39, 9,  8,  'login',      1784592000 + 42900),
  (40, 9,  8,  'report_run', 1784592000 + 43500),
  (41, 10, 9,  'login',      1784592000 + 39600),
  (42, 10, 9,  'report_run', 1784592000 + 40200),
  (43, 14, 10, 'login',      1784592000 + 36900),
  (44, 14, 10, 'api_call',   1784592000 + 37800),
  (45, 14, 10, 'report_run', 1784592000 + 38700),
  (46, 2,  1,  'login',      1784678400 + 35400),
  (47, 1,  1,  'login',      1784678400 + 32400),
  (48, 1,  1,  'export',     1784678400 + 36000),   -- EXACTLY 3600s after event 47
  (49, 4,  4,  'login',      1784678400 + 36600),
  (50, 4,  4,  'api_call',   1784678400 + 37200),
  (51, 5,  5,  'login',      1784678400 + 37400),
  (52, 5,  5,  'report_run', 1784678400 + 38400),
  (53, 7,  7,  'login',      1784678400 + 35600),
  (54, 7,  7,  'report_run', 1784678400 + 36600),
  (55, 9,  8,  'login',      1784678400 + 42900),
  (56, 14, 10, 'login',      1784678400 + 36000),
  (57, 1,  1,  'login',      1784764800 + 33000),
  (58, 1,  1,  'api_call',   1784764800 + 33900),
  (59, 1,  1,  'report_run', 1784764800 + 35100),
  (60, 2,  1,  'login',      1784764800 + 40200),
  (61, 2,  1,  'report_run', 1784764800 + 40800),
  (62, 3,  2,  'login',      1784764800 + 36600),
  (63, 4,  4,  'login',      1784764800 + 37800),
  (64, 4,  4,  'report_run', 1784764800 + 38700),
  (65, 6,  5,  'login',      1784764800 + 46500),
  (66, 7,  7,  'login',      1784764800 + 33000),
  (67, 8,  8,  'login',      1784764800 + 39000),
  (68, 8,  8,  'api_call',   1784764800 + 39600),
  (69, 10, 9,  'login',      1784764800 + 41400),
  (70, 10, 9,  'api_call',   1784764800 + 42000),
  (71, 14, 10, 'login',      1784764800 + 38400),
  (72, 14, 10, 'export',     1784764800 + 39300);

-- 12 CS tickets. A11's is the flagship: high/open on a paying, dark account.
-- resolved_date set on exactly the 6 resolved+closed rows. Accounts 3, 7 and
-- 9 are ticketless. 2-ticket club: A2, A4, A6.
INSERT INTO tickets (ticket_id, account_id, priority, status, opened_date, resolved_date) VALUES
  (1,  11, 'high',   'open',          '2026-07-10', NULL),
  (2,  10, 'high',   'open',          '2026-06-05', NULL),
  (3,  4,  'high',   'investigating', '2026-04-10', NULL),
  (4,  4,  'medium', 'resolved',      '2026-06-20', '2026-06-24'),
  (5,  2,  'medium', 'open',          '2026-05-03', NULL),
  (6,  2,  'low',    'resolved',      '2026-05-20', '2026-05-23'),
  (7,  6,  'medium', 'investigating', '2026-04-20', NULL),
  (8,  6,  'low',    'closed',        '2026-04-25', '2026-05-30'),
  (9,  8,  'low',    'resolved',      '2026-02-14', '2026-02-20'),
  (10, 1,  'low',    'closed',        '2026-03-15', '2026-03-28'),
  (11, 5,  'medium', 'open',          '2026-06-28', NULL),
  (12, 12, 'medium', 'closed',        '2026-05-02', '2026-05-06');
`;
