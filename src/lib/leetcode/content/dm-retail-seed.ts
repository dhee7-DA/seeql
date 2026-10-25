// Domain Mastery — pilot pack "Retail & RFM" · world seed (probed before use).
// Every planted fact is asserted by scripts/r9-dm-probe.ts; content may only
// cite facts that probe passes on.
export const DM_RETAIL_SEED = `INSERT INTO customers (customer_id, name, city, region, signup_date, segment) VALUES
  (1,  'Alice Nakamura', 'Seattle', 'US',    '2026-01-10', 'vip'),
  (2,  'Ben Ortiz',      'Austin',  'US',    '2026-01-22', 'regular'),
  (3,  'Clara Voss',     'Berlin',  'EU',    '2026-02-05', 'vip'),
  (4,  'Dan Whitfield',  'Leeds',   'EU',    '2026-02-14', 'regular'),
  (5,  'Priya Sharma',   'Mumbai',  'APAC',  '2026-02-20', 'regular'),
  (6,  'Kenji Watanabe', 'Osaka',   'APAC',  '2026-03-01', 'new'),
  (7,  'Maya Robinson',  'Chicago', 'US',    '2026-03-15', 'regular'),
  (8,  'Lukas Meier',    'Zurich',  'EU',    '2026-03-28', 'new'),
  (9,  'Sofia Diaz',     'Bogota',  'LATAM', '2026-04-02', 'regular'),
  (10, 'Tom Becker',     'Munich',  'EU',    '2026-04-18', 'new'),
  (11, 'Ines Fontes',    'Lisbon',  'EU',    '2026-05-06', 'regular'),
  (12, 'Ana Torres',     'Lima',    'LATAM', '2026-05-20', 'new');

INSERT INTO products (product_id, name, category, price_cents, cost_cents) VALUES
  (1,  'Pulse Wireless Headphones', 'Audio',      12900,  7400),
  (2,  'Storm Bluetooth Speaker',   'Audio',       8900,  4700),
  (3,  'Echo Studio Mic',           'Audio',      15900,  9100),
  (4,  'Vista 4K Webcam',           'Video',      11900,  6200),
  (5,  'CinePro Action Cam',        'Video',      24900, 15800),
  (6,  'StreamRing Light',          'Video',       4900,  2100),
  (7,  'FitBand Flex 2',            'Wearables',   7900,  3900),
  (8,  'Apex Smartwatch',           'Wearables',  19900, 12400),
  (9,  'Sleep Tracker Ring',        'Wearables',  21900, 13300),
  (10, 'Glide Wireless Mouse',      'Accessories', 3900,  1700),
  (11, 'Type-Pro Keyboard',         'Accessories', 9900,  5400),
  (12, 'USB-C Hub',                 'Accessories', 5900,  2900),
  (13, 'Nova Smart Bulb',           'Smart Home',  2900,  1200),
  (14, 'Sentry Door Cam',           'Smart Home', 13900,  8300);

-- 56 orders · statuses: 47 delivered / 3 shipped / 4 cancelled / 2 pending
-- C5 (Priya) and C7 (Maya) each hold 5 delivered orders with IDENTICAL line
-- multisets and identical discounts (probe: equal gross AND net revenue).
-- 04-15 (order 114) and 05-25 (order 116) each carry a lone delivered 8900
-- order — a genuine daily-revenue tie (probe-verified).
INSERT INTO orders (order_id, customer_id, order_date, status) VALUES
  (101, 1,  '2026-03-04', 'delivered'),
  (102, 1,  '2026-03-19', 'delivered'),
  (103, 2,  '2026-03-05', 'delivered'),
  (104, 3,  '2026-03-08', 'delivered'),
  (105, 4,  '2026-03-12', 'delivered'),
  (106, 5,  '2026-03-15', 'delivered'),
  (107, 6,  '2026-03-22', 'delivered'),
  (108, 7,  '2026-03-26', 'delivered'),
  (109, 8,  '2026-03-30', 'delivered'),
  (110, 1,  '2026-04-02', 'delivered'),
  (111, 2,  '2026-04-05', 'cancelled'),
  (112, 3,  '2026-04-09', 'delivered'),
  (113, 9,  '2026-04-12', 'delivered'),
  (114, 10, '2026-04-15', 'delivered'),
  (115, 12, '2026-04-18', 'delivered'),
  (116, 12, '2026-05-25', 'delivered'),
  (118, 1,  '2026-04-21', 'delivered'),
  (119, 2,  '2026-04-24', 'delivered'),
  (120, 3,  '2026-04-26', 'delivered'),
  (121, 4,  '2026-05-01', 'delivered'),
  (122, 5,  '2026-05-03', 'delivered'),
  (123, 6,  '2026-05-06', 'shipped'),
  (124, 7,  '2026-05-08', 'delivered'),
  (125, 8,  '2026-05-11', 'delivered'),
  (126, 9,  '2026-05-16', 'delivered'),
  (127, 1,  '2026-05-09', 'delivered'),
  (128, 2,  '2026-05-12', 'delivered'),
  (129, 3,  '2026-05-14', 'delivered'),
  (130, 4,  '2026-05-20', 'cancelled'),
  (131, 5,  '2026-06-02', 'delivered'),
  (132, 6,  '2026-06-06', 'delivered'),
  (133, 7,  '2026-06-09', 'delivered'),
  (134, 8,  '2026-06-14', 'delivered'),
  (135, 9,  '2026-06-18', 'delivered'),
  (136, 1,  '2026-06-01', 'delivered'),
  (137, 2,  '2026-06-08', 'shipped'),
  (138, 3,  '2026-06-12', 'delivered'),
  (139, 4,  '2026-06-15', 'delivered'),
  (140, 5,  '2026-06-20', 'delivered'),
  (141, 6,  '2026-06-24', 'cancelled'),
  (142, 7,  '2026-06-22', 'delivered'),
  (143, 10, '2026-06-25', 'cancelled'),
  (144, 12, '2026-07-01', 'delivered'),
  (145, 1,  '2026-06-27', 'delivered'),
  (146, 2,  '2026-07-02', 'delivered'),
  (147, 3,  '2026-06-30', 'delivered'),
  (148, 4,  '2026-07-05', 'pending'),
  (149, 5,  '2026-07-08', 'delivered'),
  (150, 7,  '2026-07-12', 'delivered'),
  (151, 8,  '2026-07-18', 'shipped'),
  (152, 9,  '2026-07-22', 'pending'),
  (153, 10, '2026-08-01', 'delivered'),
  (154, 1,  '2026-07-15', 'delivered'),
  (155, 3,  '2026-07-21', 'delivered'),
  (156, 10, '2026-08-12', 'delivered'),
  (157, 12, '2026-08-20', 'delivered');

-- 109 lines · unit_price drift from catalog on exactly 3 rows (7, 40, 44 —
-- snapshot pricing); discount_cents NOT NULL on exactly 10 rows (12, 16, 35,
-- 57, 59, 73, 76, 90, 92, 106); order 104 carries the SAME product twice as
-- two separate lines (7 and 8 — duplicate-line trap).
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price_cents, discount_cents) VALUES
  (1,  101, 1,  1, 12900, NULL),
  (2,  101, 10, 2, 3900,  NULL),
  (3,  102, 8,  1, 19900, NULL),
  (4,  102, 13, 3, 2900,  NULL),
  (5,  103, 2,  1, 8900,  NULL),
  (6,  103, 11, 1, 9900,  NULL),
  (7,  104, 3,  1, 14900, NULL),   -- drift: catalog says 15900
  (8,  104, 3,  1, 15900, NULL),   -- duplicate product line, catalog price
  (9,  104, 4,  1, 11900, NULL),
  (10, 105, 13, 2, 2900,  NULL),
  (11, 105, 10, 1, 3900,  NULL),
  (12, 106, 1,  1, 12900, 2000),
  (13, 106, 7,  1, 7900,  NULL),
  (14, 107, 6,  2, 4900,  NULL),
  (15, 107, 13, 1, 2900,  NULL),
  (16, 108, 1,  1, 12900, 2000),   -- mirror of item 12 (C7 = C5)
  (17, 108, 7,  1, 7900,  NULL),
  (18, 109, 10, 1, 3900,  NULL),
  (19, 109, 13, 1, 2900,  NULL),
  (20, 110, 5,  1, 24900, NULL),
  (21, 111, 8,  1, 19900, NULL),   -- cancelled order
  (22, 111, 14, 1, 13900, NULL),
  (23, 112, 11, 1, 9900,  NULL),
  (24, 112, 4,  1, 11900, NULL),
  (25, 112, 1,  1, 12900, NULL),
  (26, 113, 13, 2, 2900,  NULL),
  (27, 113, 6,  1, 4900,  NULL),
  (28, 114, 2,  1, 8900,  NULL),   -- lone delivered 8900 day (04-15)
  (29, 115, 10, 1, 3900,  NULL),
  (30, 115, 13, 1, 2900,  NULL),
  (31, 116, 2,  1, 8900,  NULL),   -- lone delivered 8900 day (05-25) — ties 04-15
  (32, 118, 2,  1, 8900,  NULL),
  (33, 118, 6,  1, 4900,  NULL),
  (34, 118, 13, 1, 2900,  NULL),
  (35, 119, 1,  1, 12900, 1000),
  (36, 119, 10, 1, 3900,  NULL),
  (37, 120, 9,  1, 21900, NULL),
  (38, 121, 4,  1, 11900, NULL),
  (39, 121, 13, 1, 2900,  NULL),
  (40, 122, 8,  1, 18900, NULL),   -- drift: catalog says 19900 (C5 mirror)
  (41, 122, 10, 1, 3900,  NULL),
  (42, 123, 2,  1, 8900,  NULL),   -- shipped order
  (43, 123, 13, 1, 2900,  NULL),
  (44, 124, 8,  1, 18900, NULL),   -- drift mirror of item 40 (C7)
  (45, 124, 10, 1, 3900,  NULL),
  (46, 125, 7,  1, 7900,  NULL),
  (47, 125, 13, 2, 2900,  NULL),
  (48, 126, 10, 1, 3900,  NULL),
  (49, 126, 11, 1, 9900,  NULL),
  (50, 127, 11, 1, 9900,  1500),
  (51, 127, 1,  1, 12900, NULL),
  (52, 127, 13, 1, 2900,  NULL),
  (53, 128, 14, 1, 13900, NULL),
  (54, 129, 1,  2, 12900, NULL),
  (55, 129, 6,  1, 4900,  NULL),
  (56, 130, 5,  1, 24900, NULL),   -- cancelled order
  (57, 131, 1,  1, 12900, 2000),   -- C5 mirror trio begins
  (58, 131, 7,  1, 7900,  NULL),
  (59, 133, 1,  1, 12900, 2000),   -- C7 mirror of item 57
  (60, 133, 7,  1, 7900,  NULL),
  (108, 132, 6,  1, 4900, NULL),   -- C6's June delivered order (one StreamRing Light)
  (61, 134, 2,  1, 8900,  NULL),
  (62, 134, 13, 1, 2900,  NULL),
  (63, 135, 13, 1, 2900,  NULL),
  (64, 135, 6,  1, 4900,  NULL),
  (65, 136, 5,  1, 24900, NULL),
  (66, 136, 10, 1, 3900,  NULL),
  (67, 137, 13, 1, 2900,  NULL),   -- shipped order
  (68, 137, 10, 1, 3900,  NULL),
  (69, 138, 4,  1, 11900, NULL),
  (70, 138, 11, 1, 9900,  NULL),
  (71, 139, 10, 2, 3900,  NULL),
  (72, 139, 13, 1, 2900,  NULL),
  (73, 140, 1,  1, 12900, 2000),   -- C5 mirror
  (74, 140, 7,  1, 7900,  NULL),
  (75, 141, 9,  1, 21900, NULL),   -- cancelled order
  (76, 142, 1,  1, 12900, 2000),   -- C7 mirror of item 73
  (77, 142, 7,  1, 7900,  NULL),
  (78, 143, 11, 1, 9900,  NULL),   -- cancelled order
  (79, 143, 2,  1, 8900,  NULL),
  (80, 144, 14, 1, 13900, NULL),
  (81, 144, 13, 1, 2900,  NULL),
  (82, 145, 8,  1, 19900, NULL),
  (83, 145, 11, 1, 9900,  NULL),
  (84, 146, 1,  1, 12900, NULL),
  (85, 146, 6,  1, 4900,  NULL),
  (86, 146, 13, 1, 2900,  NULL),
  (87, 147, 1,  1, 12900, NULL),
  (88, 147, 13, 1, 2900,  NULL),
  (89, 148, 11, 1, 9900,  NULL),   -- pending order
  (90, 149, 1,  1, 12900, 2000),   -- C5 mirror
  (91, 149, 7,  1, 7900,  NULL),
  (92, 150, 1,  1, 12900, 2000),   -- C7 mirror of item 90
  (93, 150, 7,  1, 7900,  NULL),
  (94, 151, 10, 1, 3900,  NULL),   -- shipped order
  (95, 151, 14, 1, 13900, NULL),
  (96, 152, 2,  1, 8900,  NULL),   -- pending order
  (97, 153, 13, 3, 2900,  NULL),
  (98, 153, 6,  1, 4900,  NULL),
  (99, 154, 9,  1, 21900, NULL),
  (100, 154, 10, 1, 3900, NULL),
  (101, 155, 5,  1, 24900, NULL),
  (102, 155, 13, 1, 2900, NULL),
  (103, 156, 10, 1, 3900, NULL),
  (104, 156, 13, 1, 2900, NULL),
  (105, 156, 6,  1, 4900, NULL),
  (106, 157, 1,  1, 12900, 800),
  (107, 157, 11, 1, 9900,  NULL);

-- 72 funnel events, 2026-07-20 .. 2026-07-23 (epoch seconds, UTC).
-- Day openers: 07-20 = 1784505600 · 07-21 = 1784592000 · 07-22 = 1784678400 ·
-- 07-23 = 1784764800 (probe-verified). Planted shapes:
--   C1 07-20: view 09:00:00 → view +45s → cart +120s → 45-MIN GAP → checkout
--             (sessionization bait: 2700s gap crosses a 1800s cutoff)
--   C2 07-21: FOUR cart events 90s apart (burst bait: 4 carts in 270s)
--   C3 07-20: checkout with NO cart and NO view that day (funnel oddity)
--   C6 07-22: cart + view but NO checkout (drop-off bait)
--   C11 07-20..23: 8 views across four days, zero carts/checkouts — the
--             never-orders customer browses constantly (anti-join bait)
INSERT INTO events (event_id, customer_id, event_ts, event_type, page) VALUES
  (1,  1,  1784505600 + 32400, 'view',     '/product/1'),
  (2,  1,  1784505600 + 32445, 'view',     '/product/1'),
  (3,  1,  1784505600 + 32520, 'view',     '/product/8'),
  (4,  1,  1784505600 + 32610, 'cart',     '/cart'),
  (5,  1,  1784505600 + 35310, 'checkout', '/checkout'),  -- 2700s after the cart: 45-min gap
  (6,  2,  1784505600 + 36000, 'view',     '/product/2'),
  (7,  2,  1784505600 + 36120, 'cart',     '/cart'),
  (8,  2,  1784505600 + 36900, 'checkout', '/checkout'),
  (9,  3,  1784505600 + 40500, 'checkout', '/checkout'),  -- checkout with no view/cart on 07-20
  (10, 4,  1784505600 + 41400, 'view',     '/product/13'),
  (11, 4,  1784505600 + 41460, 'view',     '/product/10'),
  (12, 5,  1784505600 + 37800, 'view',     '/product/1'),
  (13, 5,  1784505600 + 37920, 'cart',     '/cart'),
  (14, 5,  1784505600 + 38600, 'checkout', '/checkout'),
  (15, 6,  1784505600 + 45000, 'view',     '/product/6'),
  (16, 7,  1784505600 + 33900, 'view',     '/product/1'),
  (17, 7,  1784505600 + 33980, 'cart',     '/cart'),
  (18, 7,  1784505600 + 34700, 'checkout', '/checkout'),
  (19, 8,  1784505600 + 52200, 'view',     '/product/10'),
  (20, 9,  1784505600 + 39600, 'view',     '/product/13'),
  (21, 9,  1784505600 + 39750, 'cart',     '/cart'),
  (22, 11, 1784505600 + 34200, 'view',     '/product/1'),
  (23, 11, 1784505600 + 34310, 'view',     '/product/11'),
  (24, 12, 1784505600 + 55800, 'view',     '/product/14'),
  (25, 1,  1784592000 + 31000, 'view',     '/product/9'),
  (26, 1,  1784592000 + 31070, 'view',     '/product/9'),
  (27, 1,  1784592000 + 31160, 'cart',     '/cart'),
  (28, 1,  1784592000 + 31210, 'checkout', '/checkout'),
  (29, 2,  1784592000 + 43200, 'cart',     '/cart'),      -- burst begins
  (30, 2,  1784592000 + 43290, 'cart',     '/cart'),
  (31, 2,  1784592000 + 43380, 'cart',     '/cart'),
  (32, 2,  1784592000 + 43470, 'cart',     '/cart'),      -- 4 carts in 270s
  (33, 2,  1784592000 + 43600, 'checkout', '/checkout'),
  (34, 3,  1784592000 + 32800, 'view',     '/product/4'),
  (35, 3,  1784592000 + 32900, 'cart',     '/cart'),
  (36, 4,  1784592000 + 54000, 'view',     '/product/13'),
  (37, 5,  1784592000 + 36900, 'view',     '/product/7'),
  (38, 5,  1784592000 + 37010, 'cart',     '/cart'),
  (39, 7,  1784592000 + 35000, 'view',     '/product/1'),
  (40, 7,  1784592000 + 35090, 'cart',     '/cart'),
  (41, 7,  1784592000 + 35180, 'checkout', '/checkout'),
  (42, 8,  1784592000 + 58900, 'view',     '/product/14'),
  (43, 9,  1784592000 + 40300, 'view',     '/product/6'),
  (44, 10, 1784592000 + 46500, 'view',     '/product/2'),
  (45, 10, 1784592000 + 46590, 'cart',     '/cart'),
  (46, 11, 1784592000 + 33500, 'view',     '/product/8'),
  (47, 11, 1784592000 + 33600, 'view',     '/product/9'),
  (48, 12, 1784592000 + 51300, 'view',     '/product/13'),
  (49, 12, 1784592000 + 51390, 'cart',     '/cart'),
  (50, 1,  1784678400 + 31800, 'view',     '/product/5'),
  (51, 1,  1784678400 + 31880, 'cart',     '/cart'),
  (52, 2,  1784678400 + 42900, 'view',     '/product/11'),
  (53, 2,  1784678400 + 43000, 'checkout', '/checkout'),
  (54, 3,  1784678400 + 33400, 'view',     '/product/1'),
  (55, 3,  1784678400 + 33490, 'view',     '/product/3'),
  (56, 3,  1784678400 + 33570, 'cart',     '/cart'),
  (57, 3,  1784678400 + 33640, 'checkout', '/checkout'),
  (58, 4,  1784678400 + 55100, 'view',     '/product/10'),
  (59, 5,  1784678400 + 37400, 'view',     '/product/7'),
  (60, 6,  1784678400 + 44700, 'view',     '/product/6'),
  (61, 6,  1784678400 + 44790, 'cart',     '/cart'),      -- C6 drop-off: no checkout on 07-22
  (62, 7,  1784678400 + 35600, 'view',     '/product/1'),
  (63, 8,  1784678400 + 57700, 'view',     '/product/2'),
  (64, 8,  1784678400 + 57780, 'cart',     '/cart'),
  (65, 9,  1784678400 + 40900, 'view',     '/product/13'),
  (66, 11, 1784678400 + 34100, 'view',     '/product/4'),
  (67, 11, 1784678400 + 34180, 'view',     '/product/1'),
  (68, 12, 1784678400 + 52500, 'view',     '/product/14'),
  (69, 3,  1784764800 + 33000, 'view',     '/product/9'),
  (70, 5,  1784764800 + 37100, 'view',     '/product/1'),
  (71, 5,  1784764800 + 37180, 'checkout', '/checkout'),
  (72, 11, 1784764800 + 33900, 'view',     '/product/10');

-- 12 returns · C3 owns 3 (return-abuse bait) · reasons: 4 damaged /
-- 3 wrong-item / 5 buyer-remorse (probe-verified counts)
INSERT INTO returns (return_id, order_item_id, return_date, reason) VALUES
  (1,  8,  '2026-03-15', 'damaged'),
  (2,  13, '2026-03-25', 'buyer-remorse'),
  (3,  17, '2026-04-05', 'wrong-item'),
  (4,  24, '2026-04-20', 'damaged'),
  (5,  4,  '2026-04-02', 'buyer-remorse'),
  (6,  41, '2026-05-15', 'damaged'),
  (7,  45, '2026-05-18', 'buyer-remorse'),
  (8,  54, '2026-06-01', 'wrong-item'),
  (9,  9,  '2026-03-20', 'damaged'),
  (10, 25, '2026-04-25', 'buyer-remorse'),
  (11, 74, '2026-07-01', 'buyer-remorse'),
  (12, 95, '2026-07-28', 'wrong-item');
`;
