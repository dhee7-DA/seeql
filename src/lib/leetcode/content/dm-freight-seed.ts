// Domain Mastery — pack #6 "Logistics & Freight" · world seed (probed before use).
// Every planted fact is asserted by scripts/r14-freight-probe.ts; content may
// only cite facts that probe passes on.
export const DM_FREIGHT_SEED = `INSERT INTO customers (customer_id, name, region, segment, onboarded_date) VALUES
  (1,  'Aurelia Home Goods',   'NA',    'enterprise', '2025-10-06'),
  (2,  'Bitfrost Electronics', 'EMEA',  'enterprise', '2025-11-03'),
  (3,  'Cafetal Verde',        'LATAM', 'smb',        '2025-12-01'),
  (4,  'Driftline Apparel',    'NA',    'smb',        '2025-11-17'),
  (5,  'Ember & Oak',          'NA',    'startup',    '2026-01-05'),
  (6,  'Fernway Botanics',     'APAC',  'smb',        '2026-02-02'),
  (7,  'Glacier Nordic Foods', 'EMEA',  'enterprise', '2025-12-15'),
  (8,  'Harborlight Marine',   'APAC',  'enterprise', '2026-04-06'),
  (9,  'Iris Ink & Paper',     'NA',    'startup',    '2026-05-04'),
  (10, 'Junipero Outdoors',    'NA',    'enterprise', '2025-10-20'),
  (11, 'Kilnworks Pottery',    'LATAM', 'smb',        '2026-05-11'),
  (12, 'Lumen Optics',         'EMEA',  'smb',        '2026-06-01');

-- 6 hubs. W5 Sao Paulo is the DARK GATEWAY: zero origin shipments, zero scans.
INSERT INTO warehouses (warehouse_id, city, region, hub_type) VALUES
  (1, 'Memphis',    'NA',    'gateway'),
  (2, 'Louisville', 'NA',    'sort_center'),
  (3, 'Rotterdam',  'EMEA',  'gateway'),
  (4, 'Singapore',  'APAC',  'sort_center'),
  (5, 'Sao Paulo',  'LATAM', 'gateway'),
  (6, 'Columbus',   'NA',    'last_mile');

INSERT INTO drivers (driver_id, name, region, vehicle) VALUES
  (1, 'Marcus Webb',  'NA',   'semi'),
  (2, 'Diego Fuentes','NA',   'truck'),
  (3, 'Aisha Bell',   'NA',   'van'),
  (4, 'Tom Grady',    'NA',   'truck'),
  (5, 'Sanne Visser', 'EMEA', 'van'),
  (6, 'Kenji Sato',   'APAC', 'van'),
  (7, 'Rafa Lima',    'LATAM','truck'),
  (8, 'Petra Holm',   'EMEA', 'van');

-- 58 shipments, 2026-01 .. 2026-06. Statuses: 44 delivered / 6 in_transit /
-- 4 exception / 2 returned / 2 cancelled. SLA days: economy 7 / standard 4 /
-- express 2 (promised = ship + SLA on EVERY row). Walls:
--   s01 express delivered EXACTLY on its promised date (the only such row)
--   s04 = the whale's 96000 April record shipment
--   s12 = the only weight == dim_weight tie
--   air-tax rows (dim > weight): s18, s31, s37, s49, s52 — exactly 5
--   s41/s42 = the cross-border EMEA->APAC lanes (customs dwell 172800 / 86400)
--   s46 = the overdue express: in transit, promised 06-03, age EXACTLY 30
--         days as of 2026-07-01, vanished after departing its origin hub
--   s47 = the phantom out_for_delivery (scanned out 05-20, never seen since)
--   s48 = customs exception with 259200s hub dwell
--   s50 = THE lost shipment (claim EXACTLY 200000)
--   s55-s58 = delivered 06-23 by driver 3 — the 4-scan pickup... the burst day
--   s40 (customer 11) and s54 are the cancelled rows (freight 0, no scans)
INSERT INTO shipments (shipment_id, customer_id, origin_wh, service, status, ship_date, promised_date, delivered_date, weight_g, dim_weight_g, distance_km, freight_cents) VALUES
  (1,  10, 1, 'express',  'delivered',  '2026-06-01', '2026-06-03', '2026-06-03', 22000, 20000, 380,  36000),
  (2,  10, 2, 'express',  'delivered',  '2026-06-05', '2026-06-07', '2026-06-08', 26000, 24000, 410,  33000),
  (3,  10, 1, 'express',  'delivered',  '2026-03-12', '2026-03-14', '2026-03-13', 25000, 23000, 390,  31500),
  (4,  10, 2, 'express',  'delivered',  '2026-04-20', '2026-04-22', '2026-04-21', 27000, 25000, 400,  96000),
  (5,  10, 1, 'express',  'delivered',  '2026-01-15', '2026-01-17', '2026-01-16', 21000, 19000, 360,  27000),
  (6,  10, 2, 'express',  'delivered',  '2026-02-10', '2026-02-12', '2026-02-11', 23000, 21000, 370,  28500),
  (7,  10, 1, 'express',  'in_transit', '2026-06-28', '2026-06-30', NULL,         24000, 22000, 380,  36000),
  (8,  10, 1, 'express',  'delivered',  '2026-05-15', '2026-05-17', '2026-05-16', 22000, 20000, 380,  27000),
  (9,  1,  1, 'standard', 'delivered',  '2026-01-08', '2026-01-12', '2026-01-11', 18000, 16000, 220,  12000),
  (10, 1,  1, 'standard', 'delivered',  '2026-02-18', '2026-02-22', '2026-02-20', 16000, 15000, 220,  9500),
  (11, 1,  1, 'economy',  'delivered',  '2026-03-22', '2026-03-29', '2026-03-27', 20000, 18000, 240,  10500),
  (12, 1,  1, 'standard', 'delivered',  '2026-05-25', '2026-05-29', '2026-05-27', 18000, 18000, 220,  10000),
  (13, 4,  2, 'standard', 'delivered',  '2026-01-20', '2026-01-24', '2026-01-23', 12000, 11000, 180,  9000),
  (14, 4,  2, 'standard', 'delivered',  '2026-04-14', '2026-04-18', '2026-04-16', 13000, 12000, 180,  8500),
  (15, 4,  2, 'economy',  'delivered',  '2026-06-16', '2026-06-23', '2026-06-21', 11000, 10000, 190,  8500),
  (16, 5,  6, 'economy',  'delivered',  '2026-02-05', '2026-02-12', '2026-02-10', 6000,  5400,  90,   4500),
  (17, 5,  6, 'economy',  'delivered',  '2026-05-08', '2026-05-15', '2026-05-14', 6400,  5800,  95,   4500),
  (18, 9,  2, 'economy',  'delivered',  '2026-03-15', '2026-03-22', '2026-03-20', 4800,  5400,  150,  3800),
  (19, 9,  2, 'economy',  'delivered',  '2026-06-16', '2026-06-23', '2026-06-24', 4500,  4000,  150,  3200),
  (20, 2,  3, 'express',  'delivered',  '2026-02-03', '2026-02-05', '2026-02-04', 19000, 17500, 420,  27000),
  (21, 2,  3, 'standard', 'delivered',  '2026-03-09', '2026-03-13', '2026-03-12', 21000, 19000, 450,  24000),
  (22, 2,  3, 'standard', 'delivered',  '2026-04-11', '2026-04-15', '2026-04-14', 18000, 16500, 430,  22500),
  (23, 2,  3, 'express',  'delivered',  '2026-06-06', '2026-06-08', '2026-06-09', 20000, 18500, 440,  22500),
  (24, 7,  3, 'express',  'delivered',  '2026-01-12', '2026-01-14', '2026-01-13', 28000, 26000, 520,  34000),
  (25, 7,  3, 'standard', 'delivered',  '2026-02-20', '2026-02-24', '2026-02-23', 30000, 28000, 540,  33000),
  (26, 7,  3, 'standard', 'delivered',  '2026-03-18', '2026-03-22', '2026-03-24', 32000, 30000, 560,  32000),
  (27, 7,  3, 'economy',  'delivered',  '2026-05-06', '2026-05-13', '2026-05-12', 34000, 32000, 580,  29000),
  (28, 12, 3, 'standard', 'delivered',  '2026-01-25', '2026-01-29', '2026-01-27', 15000, 13500, 300,  12000),
  (29, 12, 3, 'economy',  'delivered',  '2026-04-08', '2026-04-15', '2026-04-13', 14000, 12800, 310,  11000),
  (30, 12, 3, 'standard', 'delivered',  '2026-06-15', '2026-06-19', '2026-06-20', 13000, 12000, 300,  11000),
  (31, 6,  4, 'economy',  'delivered',  '2026-02-12', '2026-02-19', '2026-02-17', 7600,  8400,  260,  8800),
  (32, 6,  4, 'standard', 'delivered',  '2026-03-28', '2026-04-01', '2026-03-31', 8500,  7600,  270,  4600),
  (33, 6,  4, 'economy',  'delivered',  '2026-05-20', '2026-05-27', '2026-05-26', 7500,  6800,  260,  4600),
  (34, 8,  4, 'express',  'delivered',  '2026-02-25', '2026-02-27', '2026-02-26', 26000, 24000, 480,  27000),
  (35, 8,  4, 'standard', 'delivered',  '2026-04-17', '2026-04-21', '2026-04-19', 30000, 28000, 500,  25000),
  (36, 8,  4, 'economy',  'delivered',  '2026-06-16', '2026-06-23', '2026-06-22', 28000, 26000, 490,  22000),
  (37, 3,  1, 'economy',  'delivered',  '2026-01-18', '2026-01-25', '2026-01-24', 8200,  9000,  1400, 6000),
  (38, 3,  1, 'economy',  'delivered',  '2026-02-14', '2026-02-21', '2026-02-19', 9500,  8600,  1400, 6200),
  (39, 3,  1, 'economy',  'delivered',  '2026-04-05', '2026-04-12', '2026-04-10', 8800,  8000,  1380, 5800),
  (40, 11, 2, 'standard', 'cancelled',  '2026-05-14', '2026-05-18', NULL,         7000,  6500,  1300, 0),
  (41, 2,  3, 'express',  'delivered',  '2026-05-04', '2026-05-06', '2026-05-07', 16000, 14800, 8200, 21000),
  (42, 2,  3, 'economy',  'delivered',  '2026-06-16', '2026-06-23', '2026-06-22', 15000, 14000, 8150, 19500),
  (43, 4,  2, 'standard', 'in_transit', '2026-06-22', '2026-06-26', NULL,         12500, 11500, 180,  9000),
  (44, 1,  1, 'economy',  'in_transit', '2026-06-16', '2026-06-23', NULL,         17000, 15500, 240,  10500),
  (45, 2,  3, 'standard', 'in_transit', '2026-06-09', '2026-06-13', NULL,         19000, 17500, 450,  24000),
  (46, 7,  3, 'express',  'in_transit', '2026-06-01', '2026-06-03', NULL,         24000, 22000, 520,  33000),
  (47, 6,  4, 'economy',  'in_transit', '2026-05-17', '2026-05-24', NULL,         8000,  7300,  260,  4600),
  (48, 3,  1, 'standard', 'exception',  '2026-05-30', '2026-06-03', NULL,         9200,  8400,  1390, 6400),
  (49, 5,  6, 'standard', 'exception',  '2026-06-12', '2026-06-16', NULL,         6200,  6900,  95,   4200),
  (50, 12, 3, 'standard', 'exception',  '2026-06-19', '2026-06-23', NULL,         12500, 11500, 300,  10500),
  (51, 4,  2, 'express',  'exception',  '2026-05-21', '2026-05-23', NULL,         12500, 11500, 180,  8800),
  (52, 9,  2, 'standard', 'returned',   '2026-03-08', '2026-03-12', NULL,         4600,  5100,  150,  3900),
  (53, 6,  4, 'standard', 'returned',   '2026-06-06', '2026-06-10', NULL,         8200,  7500,  270,  4400),
  (54, 7,  3, 'economy',  'cancelled',  '2026-02-28', '2026-03-07', NULL,         34000, 31000, 560,  0),
  (55, 5,  6, 'economy',  'delivered',  '2026-06-17', '2026-06-24', '2026-06-23', 6000,  5500,  90,   4300),
  (56, 9,  2, 'economy',  'delivered',  '2026-06-17', '2026-06-24', '2026-06-23', 5200,  4700,  150,  3600),
  (57, 4,  2, 'standard', 'delivered',  '2026-06-20', '2026-06-24', '2026-06-23', 11500, 10500, 180,  8200),
  (58, 1,  1, 'standard', 'delivered',  '2026-06-20', '2026-06-24', '2026-06-23', 14000, 13000, 220,  9800);

-- 125 scan events, retention window 2026-05-04 .. 2026-06-29 (every
-- shipment picked up on/after 05-04 carries a full stream; the 26 delivered
-- rows picked up before it have NO scans — the retention gap). Shapes:
--   driver 3 owns ONLY the 06-23 burst: out_for_delivery at 10:00 / 10:01 /
--   10:02 / 10:05 and delivered at 10:45 / 10:46 / 10:47 / 10:48 — 12
--   velocity pairs <= 300s (11 strict; the 10:00->10:05 pair is EXACTLY 300)
--   and 2 sessions under the 1800s gap cutoff
--   driver 5's 06-20 pair (s30 out_for_delivery -> delivered) is EXACTLY
--   1800s apart — ON the session cutoff (no other same-driver gap equals it)
--   hub dwell: s48 259200 (customs) · s41 172800 · s42 EXACTLY 86400 ·
--   s07 64800 · everything else <= 21600
--   driver 8's entire book is ONE damaged doorstep (s51, two scans 600s apart)
--   s46 departs its origin hub 06-01 18:00 and never scans again
INSERT INTO shipment_events (event_id, shipment_id, event_type, warehouse_id, driver_id, event_ts) VALUES
  (1,  8,  'picked_up',       1,    1,    CAST(strftime('%s','2026-05-15 08:00:00') AS INTEGER)),
  (2,  8,  'arrived_hub',     1,    NULL, CAST(strftime('%s','2026-05-15 14:00:00') AS INTEGER)),
  (3,  8,  'departed_hub',    1,    NULL, CAST(strftime('%s','2026-05-15 16:00:00') AS INTEGER)),
  (4,  8,  'out_for_delivery',NULL, 1,    CAST(strftime('%s','2026-05-16 08:30:00') AS INTEGER)),
  (5,  8,  'delivered',       NULL, 1,    CAST(strftime('%s','2026-05-16 09:05:00') AS INTEGER)),
  (6,  12, 'picked_up',       1,    1,    CAST(strftime('%s','2026-05-25 09:00:00') AS INTEGER)),
  (7,  12, 'arrived_hub',     1,    NULL, CAST(strftime('%s','2026-05-26 07:00:00') AS INTEGER)),
  (8,  12, 'departed_hub',    1,    NULL, CAST(strftime('%s','2026-05-26 10:00:00') AS INTEGER)),
  (9,  12, 'out_for_delivery',NULL, 2,    CAST(strftime('%s','2026-05-27 08:00:00') AS INTEGER)),
  (10, 12, 'delivered',       NULL, 2,    CAST(strftime('%s','2026-05-27 08:45:00') AS INTEGER)),
  (11, 15, 'picked_up',       2,    4,    CAST(strftime('%s','2026-06-16 08:00:00') AS INTEGER)),
  (12, 15, 'arrived_hub',     2,    NULL, CAST(strftime('%s','2026-06-16 12:00:00') AS INTEGER)),
  (13, 15, 'departed_hub',    2,    NULL, CAST(strftime('%s','2026-06-16 14:30:00') AS INTEGER)),
  (14, 15, 'out_for_delivery',NULL, 4,    CAST(strftime('%s','2026-06-21 08:10:00') AS INTEGER)),
  (15, 15, 'delivered',       NULL, 4,    CAST(strftime('%s','2026-06-21 08:55:00') AS INTEGER)),
  (16, 17, 'picked_up',       6,    2,    CAST(strftime('%s','2026-05-08 08:30:00') AS INTEGER)),
  (17, 17, 'arrived_hub',     6,    NULL, CAST(strftime('%s','2026-05-08 13:00:00') AS INTEGER)),
  (18, 17, 'departed_hub',    6,    NULL, CAST(strftime('%s','2026-05-08 15:00:00') AS INTEGER)),
  (19, 17, 'out_for_delivery',NULL, 1,    CAST(strftime('%s','2026-05-14 08:20:00') AS INTEGER)),
  (20, 17, 'delivered',       NULL, 1,    CAST(strftime('%s','2026-05-14 09:00:00') AS INTEGER)),
  (21, 19, 'picked_up',       2,    2,    CAST(strftime('%s','2026-06-16 09:00:00') AS INTEGER)),
  (22, 19, 'arrived_hub',     2,    NULL, CAST(strftime('%s','2026-06-17 10:00:00') AS INTEGER)),
  (23, 19, 'departed_hub',    2,    NULL, CAST(strftime('%s','2026-06-17 12:00:00') AS INTEGER)),
  (24, 19, 'out_for_delivery',NULL, 2,    CAST(strftime('%s','2026-06-24 08:30:00') AS INTEGER)),
  (25, 19, 'delivered',       NULL, 2,    CAST(strftime('%s','2026-06-24 09:10:00') AS INTEGER)),
  (26, 23, 'picked_up',       3,    5,    CAST(strftime('%s','2026-06-06 08:00:00') AS INTEGER)),
  (27, 23, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-06-06 14:00:00') AS INTEGER)),
  (28, 23, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-06-06 16:30:00') AS INTEGER)),
  (29, 23, 'out_for_delivery',NULL, 5,    CAST(strftime('%s','2026-06-09 08:10:00') AS INTEGER)),
  (30, 23, 'delivered',       NULL, 5,    CAST(strftime('%s','2026-06-09 08:55:00') AS INTEGER)),
  (31, 27, 'picked_up',       3,    5,    CAST(strftime('%s','2026-05-06 08:00:00') AS INTEGER)),
  (32, 27, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-05-07 09:00:00') AS INTEGER)),
  (33, 27, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-05-07 13:00:00') AS INTEGER)),
  (34, 27, 'out_for_delivery',NULL, 5,    CAST(strftime('%s','2026-05-12 08:30:00') AS INTEGER)),
  (35, 27, 'delivered',       NULL, 5,    CAST(strftime('%s','2026-05-12 09:15:00') AS INTEGER)),
  (36, 30, 'picked_up',       3,    5,    CAST(strftime('%s','2026-06-15 09:00:00') AS INTEGER)),
  (37, 30, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-06-15 15:00:00') AS INTEGER)),
  (38, 30, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-06-15 16:30:00') AS INTEGER)),
  (39, 30, 'out_for_delivery',NULL, 5,    CAST(strftime('%s','2026-06-20 09:00:00') AS INTEGER)),
  (40, 30, 'delivered',       NULL, 5,    CAST(strftime('%s','2026-06-20 09:30:00') AS INTEGER)),
  (41, 33, 'picked_up',       4,    6,    CAST(strftime('%s','2026-05-20 08:00:00') AS INTEGER)),
  (42, 33, 'arrived_hub',     4,    NULL, CAST(strftime('%s','2026-05-20 14:00:00') AS INTEGER)),
  (43, 33, 'departed_hub',    4,    NULL, CAST(strftime('%s','2026-05-20 16:00:00') AS INTEGER)),
  (44, 33, 'out_for_delivery',NULL, 6,    CAST(strftime('%s','2026-05-26 08:00:00') AS INTEGER)),
  (45, 33, 'delivered',       NULL, 6,    CAST(strftime('%s','2026-05-26 08:40:00') AS INTEGER)),
  (46, 36, 'picked_up',       4,    6,    CAST(strftime('%s','2026-06-16 08:00:00') AS INTEGER)),
  (47, 36, 'arrived_hub',     4,    NULL, CAST(strftime('%s','2026-06-16 13:30:00') AS INTEGER)),
  (48, 36, 'departed_hub',    4,    NULL, CAST(strftime('%s','2026-06-16 15:20:00') AS INTEGER)),
  (49, 36, 'out_for_delivery',NULL, 6,    CAST(strftime('%s','2026-06-22 08:20:00') AS INTEGER)),
  (50, 36, 'delivered',       NULL, 6,    CAST(strftime('%s','2026-06-22 08:55:00') AS INTEGER)),
  (51, 41, 'picked_up',       3,    5,    CAST(strftime('%s','2026-05-04 08:00:00') AS INTEGER)),
  (52, 41, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-05-04 18:00:00') AS INTEGER)),
  (53, 41, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-05-06 18:00:00') AS INTEGER)),
  (54, 41, 'out_for_delivery',NULL, 5,    CAST(strftime('%s','2026-05-07 08:00:00') AS INTEGER)),
  (55, 41, 'delivered',       NULL, 5,    CAST(strftime('%s','2026-05-07 08:40:00') AS INTEGER)),
  (56, 42, 'picked_up',       3,    5,    CAST(strftime('%s','2026-06-16 08:00:00') AS INTEGER)),
  (57, 42, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-06-16 20:00:00') AS INTEGER)),
  (58, 42, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-06-17 20:00:00') AS INTEGER)),
  (59, 42, 'out_for_delivery',NULL, 6,    CAST(strftime('%s','2026-06-22 08:00:00') AS INTEGER)),
  (60, 42, 'delivered',       NULL, 6,    CAST(strftime('%s','2026-06-22 08:40:00') AS INTEGER)),
  (61, 55, 'picked_up',       6,    4,    CAST(strftime('%s','2026-06-17 08:00:00') AS INTEGER)),
  (62, 55, 'arrived_hub',     6,    NULL, CAST(strftime('%s','2026-06-17 14:00:00') AS INTEGER)),
  (63, 55, 'departed_hub',    6,    NULL, CAST(strftime('%s','2026-06-17 20:00:00') AS INTEGER)),
  (64, 55, 'out_for_delivery',NULL, 3,    CAST(strftime('%s','2026-06-23 10:00:00') AS INTEGER)),
  (65, 55, 'delivered',       NULL, 3,    CAST(strftime('%s','2026-06-23 10:45:00') AS INTEGER)),
  (66, 56, 'picked_up',       2,    2,    CAST(strftime('%s','2026-06-17 08:20:00') AS INTEGER)),
  (67, 56, 'arrived_hub',     2,    NULL, CAST(strftime('%s','2026-06-17 13:00:00') AS INTEGER)),
  (68, 56, 'departed_hub',    2,    NULL, CAST(strftime('%s','2026-06-17 14:50:00') AS INTEGER)),
  (69, 56, 'out_for_delivery',NULL, 3,    CAST(strftime('%s','2026-06-23 10:01:00') AS INTEGER)),
  (70, 56, 'delivered',       NULL, 3,    CAST(strftime('%s','2026-06-23 10:46:00') AS INTEGER)),
  (71, 57, 'picked_up',       2,    4,    CAST(strftime('%s','2026-06-20 08:30:00') AS INTEGER)),
  (72, 57, 'arrived_hub',     2,    NULL, CAST(strftime('%s','2026-06-20 15:00:00') AS INTEGER)),
  (73, 57, 'departed_hub',    2,    NULL, CAST(strftime('%s','2026-06-20 17:00:00') AS INTEGER)),
  (74, 57, 'out_for_delivery',NULL, 3,    CAST(strftime('%s','2026-06-23 10:02:00') AS INTEGER)),
  (75, 57, 'delivered',       NULL, 3,    CAST(strftime('%s','2026-06-23 10:47:00') AS INTEGER)),
  (76, 58, 'picked_up',       1,    1,    CAST(strftime('%s','2026-06-20 09:00:00') AS INTEGER)),
  (77, 58, 'arrived_hub',     1,    NULL, CAST(strftime('%s','2026-06-20 16:00:00') AS INTEGER)),
  (78, 58, 'departed_hub',    1,    NULL, CAST(strftime('%s','2026-06-20 17:40:00') AS INTEGER)),
  (79, 58, 'out_for_delivery',NULL, 3,    CAST(strftime('%s','2026-06-23 10:05:00') AS INTEGER)),
  (80, 58, 'delivered',       NULL, 3,    CAST(strftime('%s','2026-06-23 10:48:00') AS INTEGER)),
  (81, 7,  'picked_up',       1,    1,    CAST(strftime('%s','2026-06-28 08:00:00') AS INTEGER)),
  (82, 7,  'arrived_hub',     1,    NULL, CAST(strftime('%s','2026-06-28 15:00:00') AS INTEGER)),
  (83, 7,  'departed_hub',    1,    NULL, CAST(strftime('%s','2026-06-29 09:00:00') AS INTEGER)),
  (84, 43, 'picked_up',       2,    2,    CAST(strftime('%s','2026-06-22 09:00:00') AS INTEGER)),
  (85, 43, 'arrived_hub',     2,    NULL, CAST(strftime('%s','2026-06-22 16:00:00') AS INTEGER)),
  (86, 43, 'departed_hub',    2,    NULL, CAST(strftime('%s','2026-06-23 08:00:00') AS INTEGER)),
  (87, 44, 'picked_up',       1,    1,    CAST(strftime('%s','2026-06-16 08:30:00') AS INTEGER)),
  (88, 44, 'arrived_hub',     1,    NULL, CAST(strftime('%s','2026-06-16 14:00:00') AS INTEGER)),
  (89, 44, 'departed_hub',    1,    NULL, CAST(strftime('%s','2026-06-16 16:00:00') AS INTEGER)),
  (90, 45, 'picked_up',       3,    5,    CAST(strftime('%s','2026-06-09 08:30:00') AS INTEGER)),
  (91, 45, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-06-09 15:00:00') AS INTEGER)),
  (92, 45, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-06-09 17:00:00') AS INTEGER)),
  (93, 46, 'picked_up',       3,    5,    CAST(strftime('%s','2026-06-01 08:00:00') AS INTEGER)),
  (94, 46, 'arrived_hub',     3,    NULL, CAST(strftime('%s','2026-06-01 16:00:00') AS INTEGER)),
  (95, 46, 'departed_hub',    3,    NULL, CAST(strftime('%s','2026-06-01 18:00:00') AS INTEGER)),
  (96, 47, 'picked_up',       4,    6,    CAST(strftime('%s','2026-05-17 08:00:00') AS INTEGER)),
  (97, 47, 'arrived_hub',     4,    NULL, CAST(strftime('%s','2026-05-18 10:00:00') AS INTEGER)),
  (98, 47, 'departed_hub',    4,    NULL, CAST(strftime('%s','2026-05-18 12:00:00') AS INTEGER)),
  (99, 47, 'out_for_delivery',NULL, 6,    CAST(strftime('%s','2026-05-20 08:00:00') AS INTEGER)),
  (100, 48, 'picked_up',      1,    7,    CAST(strftime('%s','2026-05-30 09:00:00') AS INTEGER)),
  (101, 48, 'arrived_hub',    1,    NULL, CAST(strftime('%s','2026-05-31 08:00:00') AS INTEGER)),
  (102, 48, 'departed_hub',   1,    NULL, CAST(strftime('%s','2026-06-03 08:00:00') AS INTEGER)),
  (103, 48, 'exception',      NULL, 7,    CAST(strftime('%s','2026-06-04 10:00:00') AS INTEGER)),
  (104, 49, 'picked_up',      6,    2,    CAST(strftime('%s','2026-06-12 08:00:00') AS INTEGER)),
  (105, 49, 'arrived_hub',    6,    NULL, CAST(strftime('%s','2026-06-12 13:00:00') AS INTEGER)),
  (106, 49, 'exception',      NULL, 2,    CAST(strftime('%s','2026-06-13 09:00:00') AS INTEGER)),
  (107, 50, 'picked_up',      3,    5,    CAST(strftime('%s','2026-06-19 08:00:00') AS INTEGER)),
  (108, 50, 'arrived_hub',    3,    NULL, CAST(strftime('%s','2026-06-20 09:00:00') AS INTEGER)),
  (109, 50, 'exception',      NULL, 1,    CAST(strftime('%s','2026-06-21 10:00:00') AS INTEGER)),
  (110, 51, 'picked_up',      2,    4,    CAST(strftime('%s','2026-05-21 10:00:00') AS INTEGER)),
  (111, 51, 'out_for_delivery',NULL,8,    CAST(strftime('%s','2026-05-21 14:00:00') AS INTEGER)),
  (112, 51, 'exception',      NULL, 8,    CAST(strftime('%s','2026-05-21 14:10:00') AS INTEGER)),
  (113, 53, 'picked_up',      4,    6,    CAST(strftime('%s','2026-06-06 08:00:00') AS INTEGER)),
  (114, 53, 'arrived_hub',    4,    NULL, CAST(strftime('%s','2026-06-07 10:00:00') AS INTEGER)),
  (115, 53, 'exception',      NULL, 6,    CAST(strftime('%s','2026-06-08 09:30:00') AS INTEGER)),
  (116, 1,  'picked_up',      1,    1,    CAST(strftime('%s','2026-06-01 08:00:00') AS INTEGER)),
  (117, 1,  'arrived_hub',    1,    NULL, CAST(strftime('%s','2026-06-01 14:00:00') AS INTEGER)),
  (118, 1,  'departed_hub',   1,    NULL, CAST(strftime('%s','2026-06-01 16:00:00') AS INTEGER)),
  (119, 1,  'out_for_delivery',NULL, 1,   CAST(strftime('%s','2026-06-03 08:00:00') AS INTEGER)),
  (120, 1,  'delivered',      NULL, 1,    CAST(strftime('%s','2026-06-03 09:00:00') AS INTEGER)),
  (121, 2,  'picked_up',      2,    2,    CAST(strftime('%s','2026-06-05 08:30:00') AS INTEGER)),
  (122, 2,  'arrived_hub',    2,    NULL, CAST(strftime('%s','2026-06-05 14:30:00') AS INTEGER)),
  (123, 2,  'departed_hub',   2,    NULL, CAST(strftime('%s','2026-06-05 16:30:00') AS INTEGER)),
  (124, 2,  'out_for_delivery',NULL, 2,   CAST(strftime('%s','2026-06-08 08:00:00') AS INTEGER)),
  (125, 2,  'delivered',      NULL, 2,    CAST(strftime('%s','2026-06-08 08:40:00') AS INTEGER));

-- 28 duty shifts (a roster sample — deliveries_made is the dispatch system's
-- stop count, independent of scan events). Walls:
--   driver 2's 06-20 shift runs 52200s — OVER the 50400 HOS line
--   driver 3's 06-23 shift is EXACTLY 50400s (on the line)
--   drivers 2 and 4 tie at exactly 58 total deliveries
--   driver 1 owns 3000 km — 2.2x the runner-up's book
INSERT INTO driver_shifts (shift_id, driver_id, duty_date, start_ts, end_ts, deliveries_made, distance_km) VALUES
  (1,  1, '2026-05-05', CAST(strftime('%s','2026-05-05 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-05 19:00:00') AS INTEGER), 28, 580),
  (2,  1, '2026-05-19', CAST(strftime('%s','2026-05-19 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-19 20:00:00') AS INTEGER), 30, 610),
  (3,  1, '2026-06-02', CAST(strftime('%s','2026-06-02 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-02 19:30:00') AS INTEGER), 26, 590),
  (4,  1, '2026-06-16', CAST(strftime('%s','2026-06-16 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-16 20:30:00') AS INTEGER), 32, 620),
  (5,  1, '2026-06-21', CAST(strftime('%s','2026-06-21 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-21 18:00:00') AS INTEGER), 27, 600),
  (6,  2, '2026-05-06', CAST(strftime('%s','2026-05-06 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-06 19:00:00') AS INTEGER), 22, 420),
  (7,  2, '2026-06-13', CAST(strftime('%s','2026-06-13 09:00:00') AS INTEGER), CAST(strftime('%s','2026-06-13 20:30:00') AS INTEGER), 18, 380),
  (8,  2, '2026-06-20', CAST(strftime('%s','2026-06-20 07:00:00') AS INTEGER), CAST(strftime('%s','2026-06-20 21:30:00') AS INTEGER), 18, 510),
  (9,  3, '2026-05-21', CAST(strftime('%s','2026-05-21 09:00:00') AS INTEGER), CAST(strftime('%s','2026-05-21 19:30:00') AS INTEGER), 20, 300),
  (10, 3, '2026-06-08', CAST(strftime('%s','2026-06-08 09:00:00') AS INTEGER), CAST(strftime('%s','2026-06-08 19:00:00') AS INTEGER), 16, 280),
  (11, 3, '2026-06-23', CAST(strftime('%s','2026-06-23 09:00:00') AS INTEGER), CAST(strftime('%s','2026-06-23 23:00:00') AS INTEGER), 24, 460),
  (12, 4, '2026-05-08', CAST(strftime('%s','2026-05-08 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-08 17:30:00') AS INTEGER), 18, 350),
  (13, 4, '2026-05-22', CAST(strftime('%s','2026-05-22 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-22 17:00:00') AS INTEGER), 20, 330),
  (14, 4, '2026-06-11', CAST(strftime('%s','2026-06-11 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-11 19:00:00') AS INTEGER), 20, 410),
  (15, 5, '2026-05-07', CAST(strftime('%s','2026-05-07 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-07 16:00:00') AS INTEGER), 10, 180),
  (16, 5, '2026-05-12', CAST(strftime('%s','2026-05-12 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-12 15:00:00') AS INTEGER), 11, 190),
  (17, 5, '2026-06-09', CAST(strftime('%s','2026-06-09 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-09 16:30:00') AS INTEGER), 13, 220),
  (18, 5, '2026-06-17', CAST(strftime('%s','2026-06-17 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-17 16:30:00') AS INTEGER), 12, 210),
  (19, 5, '2026-06-24', CAST(strftime('%s','2026-06-24 09:00:00') AS INTEGER), CAST(strftime('%s','2026-06-24 17:00:00') AS INTEGER), 15, 230),
  (20, 6, '2026-05-12', CAST(strftime('%s','2026-05-12 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-12 18:00:00') AS INTEGER), 16, 260),
  (21, 6, '2026-05-26', CAST(strftime('%s','2026-05-26 08:00:00') AS INTEGER), CAST(strftime('%s','2026-05-26 17:30:00') AS INTEGER), 15, 250),
  (22, 6, '2026-06-09', CAST(strftime('%s','2026-06-09 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-09 18:30:00') AS INTEGER), 17, 280),
  (23, 6, '2026-06-22', CAST(strftime('%s','2026-06-22 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-22 17:00:00') AS INTEGER), 18, 270),
  (24, 7, '2026-05-15', CAST(strftime('%s','2026-05-15 09:00:00') AS INTEGER), CAST(strftime('%s','2026-05-15 18:00:00') AS INTEGER), 14, 190),
  (25, 7, '2026-06-04', CAST(strftime('%s','2026-06-04 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-04 15:30:00') AS INTEGER), 9, 150),
  (26, 7, '2026-06-18', CAST(strftime('%s','2026-06-18 08:00:00') AS INTEGER), CAST(strftime('%s','2026-06-18 16:30:00') AS INTEGER), 13, 200),
  (27, 8, '2026-05-21', CAST(strftime('%s','2026-05-21 13:00:00') AS INTEGER), CAST(strftime('%s','2026-05-21 17:30:00') AS INTEGER), 8, 90),
  (28, 8, '2026-06-15', CAST(strftime('%s','2026-06-15 10:00:00') AS INTEGER), CAST(strftime('%s','2026-06-15 17:00:00') AS INTEGER), 6, 110);

-- 52 invoices: one per non-cancelled shipment EXCEPT the 4 unbilled in-transit
-- rows (s43, s44, s45, s47 — billed on delivery). fuel_cents =
-- ROUND(base_cents * 0.12) on EVERY row. Drift trio: s27 bills 30200 against
-- a 29000 quote, s41 bills 22300 against 21000, s36 bills 23100 against 22000
-- (s36's drift PAID — the sneakiest one). Accessorials: s04 6400 oversize ·
-- s16 3500 residential · s17 3500 residential · s35 4200 liftgate · s48 2900
-- address correction. s04's invoice (96000 + 11520 + 6400 = 113920) is the
-- largest single invoice in the book. Disputed: s27, s41, s50. Pending: s07,
-- s08, s17, s46, s48. issue_date = ship_date + 1.
INSERT INTO invoices (invoice_id, customer_id, shipment_id, issue_date, base_cents, fuel_cents, accessorial_cents, status) VALUES
  (1,  10, 1,  '2026-06-02', 36000, 4320,  0,    'paid'),
  (2,  10, 2,  '2026-06-06', 33000, 3960,  0,    'paid'),
  (3,  10, 3,  '2026-03-13', 31500, 3780,  0,    'paid'),
  (4,  10, 4,  '2026-04-21', 96000, 11520, 6400, 'paid'),
  (5,  10, 5,  '2026-01-16', 27000, 3240,  0,    'paid'),
  (6,  10, 6,  '2026-02-11', 28500, 3420,  0,    'paid'),
  (7,  10, 7,  '2026-06-29', 36000, 4320,  0,    'pending'),
  (8,  10, 8,  '2026-05-16', 27000, 3240,  0,    'pending'),
  (9,  1,  9,  '2026-01-09', 12000, 1440,  0,    'paid'),
  (10, 1,  10, '2026-02-19', 9500,  1140,  0,    'paid'),
  (11, 1,  11, '2026-03-23', 10500, 1260,  0,    'paid'),
  (12, 1,  12, '2026-05-26', 10000, 1200,  0,    'paid'),
  (13, 4,  13, '2026-01-21', 9000,  1080,  0,    'paid'),
  (14, 4,  14, '2026-04-15', 8500,  1020,  0,    'paid'),
  (15, 4,  15, '2026-06-17', 8500,  1020,  0,    'paid'),
  (16, 5,  16, '2026-02-06', 4500,  540,   3500, 'paid'),
  (17, 5,  17, '2026-05-09', 4500,  540,   3500, 'pending'),
  (18, 9,  18, '2026-03-16', 3800,  456,   0,    'paid'),
  (19, 9,  19, '2026-06-17', 3200,  384,   0,    'paid'),
  (20, 2,  20, '2026-02-04', 27000, 3240,  0,    'paid'),
  (21, 2,  21, '2026-03-10', 24000, 2880,  0,    'paid'),
  (22, 2,  22, '2026-04-12', 22500, 2700,  0,    'paid'),
  (23, 2,  23, '2026-06-07', 22500, 2700,  0,    'paid'),
  (24, 7,  24, '2026-01-13', 34000, 4080,  0,    'paid'),
  (25, 7,  25, '2026-02-21', 33000, 3960,  0,    'paid'),
  (26, 7,  26, '2026-03-19', 32000, 3840,  0,    'paid'),
  (27, 7,  27, '2026-05-07', 30200, 3624,  0,    'disputed'),
  (28, 12, 28, '2026-01-26', 12000, 1440,  0,    'paid'),
  (29, 12, 29, '2026-04-09', 11000, 1320,  0,    'paid'),
  (30, 12, 30, '2026-06-16', 11000, 1320,  0,    'paid'),
  (31, 6,  31, '2026-02-13', 8800,  1056,  0,    'paid'),
  (32, 6,  32, '2026-03-29', 4600,  552,   0,    'paid'),
  (33, 6,  33, '2026-05-21', 4600,  552,   0,    'paid'),
  (34, 8,  34, '2026-02-26', 27000, 3240,  0,    'paid'),
  (35, 8,  35, '2026-04-18', 25000, 3000,  4200, 'paid'),
  (36, 8,  36, '2026-06-17', 23100, 2772,  0,    'paid'),
  (37, 3,  37, '2026-01-19', 6000,  720,   0,    'paid'),
  (38, 3,  38, '2026-02-15', 6200,  744,   0,    'paid'),
  (39, 3,  39, '2026-04-06', 5800,  696,   0,    'paid'),
  (40, 2,  41, '2026-05-05', 22300, 2676,  0,    'disputed'),
  (41, 2,  42, '2026-06-17', 19500, 2340,  0,    'paid'),
  (42, 7,  46, '2026-06-02', 33000, 3960,  0,    'pending'),
  (43, 3,  48, '2026-05-31', 6400,  768,   2900, 'pending'),
  (44, 5,  49, '2026-06-13', 4200,  504,   0,    'paid'),
  (45, 12, 50, '2026-06-20', 10500, 1260,  0,    'disputed'),
  (46, 4,  51, '2026-05-22', 8800,  1056,  0,    'paid'),
  (47, 9,  52, '2026-03-09', 3900,  468,   0,    'paid'),
  (48, 6,  53, '2026-06-07', 4400,  528,   0,    'paid'),
  (49, 5,  55, '2026-06-18', 4300,  516,   0,    'paid'),
  (50, 9,  56, '2026-06-18', 3600,  432,   0,    'paid'),
  (51, 4,  57, '2026-06-21', 8200,  984,   0,    'paid'),
  (52, 1,  58, '2026-06-21', 9800,  1176,  0,    'paid');

-- 12 claims: 11 damaged + 1 lost. The LOST one (s50) claims EXACTLY 200000 —
-- the insurance line (>= catches it, > catches nothing); the runner-up is
-- 48000. Twins: c07 (s24) and c08 (s34) both claim exactly 48000, both open.
-- Statuses: open 5 / approved 4 / denied 3. decided_date NULL while open.
INSERT INTO freight_claims (claim_id, shipment_id, claim_type, claimed_cents, filed_date, status, decided_date) VALUES
  (1,  50, 'lost',    200000, '2026-06-24', 'open',     NULL),
  (2,  51, 'damaged', 8800,   '2026-05-24', 'approved', '2026-06-05'),
  (3,  49, 'damaged', 6400,   '2026-06-15', 'open',     NULL),
  (4,  48, 'damaged', 9200,   '2026-06-06', 'denied',   '2026-06-20'),
  (5,  52, 'damaged', 5200,   '2026-03-15', 'approved', '2026-03-28'),
  (6,  53, 'damaged', 6100,   '2026-06-12', 'approved', '2026-06-25'),
  (7,  24, 'damaged', 48000,  '2026-01-20', 'open',     NULL),
  (8,  34, 'damaged', 48000,  '2026-03-02', 'open',     NULL),
  (9,  20, 'damaged', 15500,  '2026-02-10', 'denied',   '2026-02-22'),
  (10, 35, 'damaged', 21000,  '2026-04-25', 'denied',   '2026-05-06'),
  (11, 12, 'damaged', 9900,   '2026-06-02', 'approved', '2026-06-14'),
  (12, 42, 'damaged', 12500,  '2026-06-26', 'open',     NULL);
`;
