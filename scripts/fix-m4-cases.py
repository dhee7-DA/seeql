#!/usr/bin/env python3
# M4 case-audit fix pass — repair 24 ambiguous/duplicate cases found once the
# OOM hang (cs-2382 vacuous guard) was defused.
import sys

EDITS = []  # (file, old, new)

def E(f, old, new):
    EDITS.append((f, old, new))

MKA = "src/lib/curriculum/gauntlet/m04-cases-medium-a.ts"
MKB = "src/lib/curriculum/gauntlet/m04-cases-medium-b.ts"
HKA = "src/lib/curriculum/gauntlet/m04-cases-hard-a.ts"
HKB = "src/lib/curriculum/gauntlet/m04-cases-hard-b.ts"
BANK = "src/lib/curriculum/keyword-banks/subquery-cases.ts"

# ---------- cs-2389: duplicate 'pending' slots + shipped coincidence ----------
E(MKA, '''    template: "SELECT id, total FROM orders WHERE status = {1} AND total {2} (SELECT AVG(total) FROM orders WHERE status = {3}) ORDER BY total DESC;",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the outer filter", why: "The segment is pending; the outer filter selects its rows. Dropping the quotes turns the literal into a column reference that does not exist." },
      { answer: ">", kind: "keyword", label: "the above test", why: "Above the segment bar is strict; < collects the below-average pending tickets and = matches nothing." },
      { answer: "'pending'", kind: "keyword", label: "the benchmark filter", why: "The scalar subquery must scope to the SAME segment — the fairness contract. Scoping one side and not the other silently changes the question." },
    ],
    distractors: ["'delivered'", "<", "'shipped'"],''',
'''    template: "SELECT id, total FROM orders WHERE status = {1} AND total {2} (SELECT AVG(total) FROM orders WHERE status = 'pending') ORDER BY total {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the outer filter", why: "The segment is pending; the outer filter selects its rows. Dropping the quotes turns the literal into a column reference that does not exist." },
      { answer: ">", kind: "keyword", label: "the above test", why: "Above the segment bar is strict; < collects the below-average pending tickets and = matches nothing." },
      { answer: "DESC", kind: "keyword", label: "the biggest-first order", why: "The exposure read is biggest-first; ASC would open on the smallest above-bar ticket." },
    ],
    distractors: ["'delivered'", "'shipped'", "<", "=", "ASC"],''')

# ---------- cs-2390: duplicate customer_id slots + duplicate total decoy ----------
E(MKA, '''    template: "SELECT o.id, o.total FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.{1} = {2}.{3}) ORDER BY o.total DESC, o.id ASC;",
    slots: [
      { answer: "customer_id", kind: "keyword", label: "the inner column", why: "The inner scan's key is o2.customer_id; totalling or status columns compare the wrong domains and break the scope." },
      { answer: "o", kind: "keyword", label: "the outer alias", why: "The reference must reach the OUTER row — o.customer_id. Using o2 on both sides is the always-true self-comparison that started the bug." },
      { answer: "customer_id", kind: "keyword", label: "the outer column", why: "The outer side is the same key on the outer alias — the equality that scopes the probe per row." },
    ],
    distractors: ["total", "o2", "total"],''',
'''    template: "SELECT o.id, o.total FROM orders {1} WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = {2}) ORDER BY o.total {3}, o.id ASC;",
    slots: [
      { answer: "o", kind: "keyword", label: "the judged alias", why: "The outer scan needs its alias so the correlation can reference it; an unnamed scan breaks the inner reference." },
      { answer: "o.customer_id", kind: "keyword", label: "the correlation", why: "The inner scan must scope to the OUTER row's customer — the full two-sided reference. Self-comparison (o2 = o2) is the always-true bug." },
      { answer: "DESC", kind: "keyword", label: "the material order", why: "Biggest totals first is the materiality read; ASC would lead with the smallest personal winner." },
    ],
    distractors: ["o2", "o.total", "customer_id", "ASC"],''')

# ---------- cs-2391: category self-compare decoy in tiebreak slot ----------
E(MKA, '''    template: "SELECT p.name, p.category, p.price FROM products p WHERE p.price {1} (SELECT AVG(p2.price) FROM products p2 WHERE {2}) ORDER BY p.price DESC, {3} ASC;",
    slots: [
      { answer: ">", kind: "keyword", label: "the leader test", why: "Above the shelf bar is strict; < collects the shelf's budget rows and = matches nothing on these probed boundaries." },
      { answer: "p2.category = p.category", kind: "keyword", label: "the shelf correlation", why: "The inner average must scope to the OUTER row's category — both aliases, both sides. Dropping the scope reverts to the store-wide 71.78 line." },
      { answer: "p.name", kind: "keyword", label: "the tiebreak", why: "Price-first with a name tiebreak keeps the leaders' list deterministic — two Audio products could tie in principle." },
    ],
    distractors: ["<", "p.category = p.category", "p2.name"],''',
'''    template: "SELECT {1}, p.category, p.price FROM products p WHERE p.price {2} (SELECT AVG(p2.price) FROM products p2 WHERE {3}) ORDER BY p.price DESC, p.name ASC;",
    slots: [
      { answer: "p.name", kind: "keyword", label: "the leader column", why: "The leaders' list is read by name; projecting p.price there would print the money value in the name field." },
      { answer: ">", kind: "keyword", label: "the leader test", why: "Above the shelf bar is strict; < collects the shelf's budget rows and = matches nothing on these probed boundaries." },
      { answer: "p2.category = p.category", kind: "keyword", label: "the shelf correlation", why: "The inner average must scope to the OUTER row's category — both aliases, both sides. Either self-comparison reverts to the store-wide 71.78 line." },
    ],
    distractors: ["p.price", "<", "=", "p.category = p.category", "p2.category = p2.category"],''')

# ---------- cs-2392: RIGHT decoy coincides; move slot to ORDER BY ----------
E(MKA, '''FROM orders o INNER JOIN customers c ON o.customer_id = c.id {2} c.region) SELECT a.region, a.customers, ROUND(COALESCE(b.rev, 0), 2) AS revenue FROM counts a {3} JOIN revenue b ON b.region = a.region ORDER BY a.region ASC;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the directory tally", why: "The counts stage tallies directory rows per region; SUM would need a numeric column and AVG a mean — neither is a count." },
      { answer: "GROUP BY", kind: "keyword", label: "the revenue grain", why: "Revenue stages one row per region — GROUP BY c.region; without it the SUM collapses the whole book into one row." },
      { answer: "LEFT", kind: "keyword", label: "the protective join", why: "LEFT from the counts side keeps every region with customers even if revenue is ever absent — INNER would silently drop the market." },
    ],
    distractors: ["SUM", "ORDER BY", "RIGHT"],''',
'''FROM orders o INNER JOIN customers c ON o.customer_id = c.id {2} c.region) SELECT a.region, a.customers, ROUND(COALESCE(b.rev, 0), 2) AS revenue FROM counts a LEFT JOIN revenue b ON b.region = a.region ORDER BY a.region {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the directory tally", why: "The counts stage tallies directory rows per region; SUM(*) is illegal and MAX(*) does not compile — COUNT is the tally." },
      { answer: "GROUP BY", kind: "keyword", label: "the revenue grain", why: "Revenue stages one row per region — GROUP BY c.region; HAVING there breaks the grammar and WHERE c.region collapses the aggregation to one row." },
      { answer: "ASC", kind: "keyword", label: "the region order", why: "Alphabetical regions read as a stable table; DESC would open at US and read the board bottom-up." },
    ],
    distractors: ["SUM", "MAX", "HAVING", "WHERE", "DESC"],''')

# ---------- cs-2395: '-15' stub coincides ----------
E(MKA, '''    distractors: ["'2025-02'", "'-15'", "<="],''',
'''    distractors: ["'2025-02'", "x", "<="],''')
E(MKA, "The '-15' stub would parse as an invalid or shifted date and derail the walk.",
   "The 'x' stub concatenates a junk suffix — date() returns NULL, the guard dies, and the walk stops at the anchor.")

# ---------- cs-2400: '1' decoy coincides with ORDER BY o.id ----------
E(MKA, '''    distractors: ["1", "customer_id", "c2.id"],''',
'''    distractors: ["id", "customer_id"],''')

# ---------- cs-2408: duplicate COUNT slots ----------
E(MKB, '''    template: "WITH heavy AS (SELECT customer_id, {1}(*) AS n FROM orders GROUP BY customer_id {2} COUNT(*) > 6) SELECT (SELECT {3}(*) FROM heavy) AS a, (SELECT SUM(n) FROM heavy) AS b;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the stage tally", why: "The stage counts orders per customer; SUM(total) would stage revenue and the HAVING threshold would compare money to a ticket count." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "Filtering an aggregate needs HAVING; WHERE cannot see COUNT(*) and the gate would fail to compile." },
      { answer: "COUNT", kind: "keyword", label: "the roster read", why: "The first consumer counts the stage's rows — four heavies; SUM there would add their customer ids." },
    ],
    distractors: ["SUM", "WHERE", "MAX"],''',
'''    template: "WITH heavy AS (SELECT customer_id, {1}(*) AS n FROM orders GROUP BY customer_id {2} COUNT(*) > 6) SELECT (SELECT COUNT(*) FROM heavy) AS a, (SELECT {3}(n) FROM heavy) AS b;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the stage tally", why: "The stage counts orders per customer; MAX(*) does not compile and the HAVING threshold would compare the wrong metric." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "Filtering an aggregate needs HAVING; WHERE cannot see COUNT(*) and the gate would fail to compile." },
      { answer: "SUM", kind: "keyword", label: "the weight read", why: "The second consumer sums the stage's counts — 68 combined orders; MAX would read the single biggest (24) and AVG the mean (17)." },
    ],
    distractors: ["MAX", "WHERE", "AVG"],''')

# ---------- cs-2409: LOOP decoy legal as alias in slot 3 ----------
E(MKB, '''    template: "WITH {1} a(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM a WHERE x < 3), b(y) AS (SELECT 10 UNION ALL SELECT y + 10 FROM b WHERE y {2} 30) SELECT (SELECT MAX(x) FROM a) AS mx, (SELECT MAX(y) FROM b) AS {3};",
    slots: [
      { answer: "RECURSIVE", kind: "keyword", label: "the shared license", why: "One RECURSIVE token licenses every CTE in the WITH; plain WITH cannot reference a or b inside their own bodies." },
      { answer: "<", kind: "keyword", label: "the b-walk guard", why: "y < 30 lets 20 emit 30 and stops — 10, 20, 30. <= would append 40 beyond the walk's contract." },
      { answer: "my", kind: "keyword", label: "the second alias", why: "The second maximum binds as my; a misnamed cell breaks the consumer's column contract." },
    ],
    distractors: ["LOOP", "<=", "MAX(y)"],''',
'''    template: "WITH {1} a(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM a WHERE x < 3), b(y) AS (SELECT 10 UNION ALL SELECT y + 10 FROM b WHERE y {2} 30) SELECT (SELECT MAX(x) FROM a) AS mx, (SELECT {3}(y) FROM b) AS my;",
    slots: [
      { answer: "RECURSIVE", kind: "keyword", label: "the shared license", why: "One RECURSIVE token licenses every CTE in the WITH; plain WITH cannot reference a or b inside their own bodies." },
      { answer: "<", kind: "keyword", label: "the b-walk guard", why: "y < 30 lets 20 emit 30 and stops — 10, 20, 30. <= would append 40 beyond the walk's contract." },
      { answer: "MAX", kind: "keyword", label: "the second read", why: "The second consumer reads b's maximum — 30; SUM would read 60 and COUNT the walk's three rows." },
    ],
    distractors: ["LOOP", "<=", "SUM", "COUNT"],''')

# ---------- cs-2416: DESC ambiguous on single-row result ----------
E(HKA, '''HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) {2} 2.0) ORDER BY c.name {3};",
    slots: [
      { answer: "GROUP BY", kind: "keyword", label: "the probe grouping", why: "The probe must collapse the customer's pending tickets to one summed row before HAVING can judge it; without the grouping the HAVING misuses the aggregate." },
      { answer: "/", kind: "keyword", label: "the half divisor", why: "Half the lifetime spend is the conviction line; * would demand pending >= twice lifetime — impossible — and - a negative bar everyone clears." },
      { answer: "ASC", kind: "keyword", label: "the case order", why: "Alphabetical keeps the conviction file stable for the case number." },
    ],
    distractors: ["ORDER BY", "*", "DESC"],''',
'''HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE {3}) {2} 2.0) ORDER BY c.name ASC;",
    slots: [
      { answer: "GROUP BY", kind: "keyword", label: "the probe grouping", why: "The probe must collapse the customer's pending tickets to one summed row before HAVING can judge it; without the grouping the HAVING misuses the aggregate." },
      { answer: "/", kind: "keyword", label: "the half divisor", why: "Half the lifetime spend is the conviction line; * would demand pending >= twice lifetime — impossible — and - a negative bar everyone clears." },
      { answer: "c.id", kind: "keyword", label: "the lifetime correlation", why: "The lifetime scalar must scope to the OUTER customer — c.id; c.name would compare an id against a name and empty the sweep." },
    ],
    distractors: ["ORDER BY", "*", "c.name"],''')

# ---------- cs-2417: ASC ambiguous on single-row result ----------
E(HKA, '''    template: "SELECT DISTINCT total FROM orders o WHERE (SELECT {1}(DISTINCT o2.total) FROM orders o2 WHERE o2.total {2} o.total) = {3} ORDER BY total DESC;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the rank counter", why: "The correlated count of higher values IS the rank. SUM/MAX would return money values, not a position, breaking the = 1 comparison's meaning." },
      { answer: ">", kind: "keyword", label: "the higher test", why: "Ranking counts STRICTLY higher totals. A < would count lower values and rank from the bottom; = would match exact self-ties." },
      { answer: "1", kind: "keyword", label: "the rung", why: "Exactly one higher total means runner-up. The constant 0 fetches the maximum, 2 the third place — the ladder is the parameter." },
    ],
    distractors: ["SUM", "<", "0"],''',
'''    template: "SELECT DISTINCT total FROM orders o WHERE (SELECT {1}(DISTINCT o2.total) FROM orders o2 WHERE o2.total {2} o.total) = {3} ORDER BY total DESC;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the rank counter", why: "The correlated count of higher values IS the rank. SUM/MAX would return money values, not a position, breaking the = 1 comparison's meaning." },
      { answer: ">", kind: "keyword", label: "the higher test", why: "Ranking counts STRICTLY higher totals. A < would count lower values and rank from the bottom; = would match exact self-ties." },
      { answer: "1", kind: "keyword", label: "the rung", why: "Exactly one higher total means runner-up. The constant 0 fetches the maximum, 2 the third place — the ladder is the parameter." },
    ],
    distractors: ["SUM", "MAX", "AVG", "<", "0"],''')

# ---------- cs-2419: NULL/INNER coincide (all months have revenue) ----------
E(HKB, '''    template: "WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM m WHERE m < '2025-02') SELECT m.m, ROUND(COALESCE(r.rev, {1}), 2) AS rev FROM m {2} JOIN (SELECT strftime('%Y-%m', created_at) AS m, {3}(total) AS rev FROM orders GROUP BY m) r ON r.m = m.m ORDER BY m.m ASC;",
    slots: [
      { answer: "0", kind: "keyword", label: "the zero fill", why: "Quiet months display 0.00; COALESCE to NULL would print NULL — technically honest, board-hostile." },
      { answer: "LEFT", kind: "keyword", label: "the preserving join", why: "LEFT from the spine keeps all fourteen months; INNER would drop any month without sales — the gap-hiding bug the spine exists to fix." },
      { answer: "SUM", kind: "keyword", label: "the revenue stage", why: "Monthly revenue stages the SUM of totals; COUNT would stage ticket counts and MAX the single biggest month-ticket." },
    ],
    distractors: ["NULL", "INNER", "COUNT"],''',
'''    template: "WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', {1})) FROM m WHERE m {2} '2025-02') SELECT m.m, ROUND(COALESCE(r.rev, 0), 2) AS rev FROM m LEFT JOIN (SELECT strftime('%Y-%m', created_at) AS m, {3}(total) AS rev FROM orders GROUP BY m) r ON r.m = m.m ORDER BY m.m ASC;",
    slots: [
      { answer: "'+1 month'", kind: "keyword", label: "the spine step", why: "The walk advances one calendar month; '+1 year' would emit two rows and '+2 month' a bi-monthly axis — different calendars." },
      { answer: "<", kind: "keyword", label: "the spine guard", why: "m < '2025-02' stops after February — fourteen months; <= appends March and > collapses the walk to the anchor." },
      { answer: "SUM", kind: "keyword", label: "the revenue stage", why: "Monthly revenue stages the SUM of totals; COUNT would stage ticket counts and AVG the mean ticket — different boards." },
    ],
    distractors: ["'+1 year'", "'+2 month'", "<=", ">", "COUNT", "AVG"],''')

# ---------- cs-2430: duplicate EXISTS slots + NOT coincidence ----------
E(HKA, '''    template: "SELECT c.name FROM customers c WHERE {1} (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND NOT {2} (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {3}) ORDER BY c.name ASC;",
    slots: [
      { answer: "EXISTS", kind: "keyword", label: "the positive probe", why: "The sweep requires pending history — a positive witness; NOT EXISTS would demand NO pending orders and empty the sweep." },
      { answer: "EXISTS", kind: "keyword", label: "the negated half", why: "NOT EXISTS reads 'no delivered order exists' — the anti-probe; a bare EXISTS would demand delivered history and invert the sweep." },
      { answer: "'delivered'", kind: "keyword", label: "the absent fate", why: "The swept accounts lack delivered proof; 'cancelled' would sweep pending-but-never-cancelled — a different mercy list." },
    ],
    distractors: ["NOT", "IN", "'cancelled'"],''',
'''    template: "SELECT c.name FROM customers c WHERE {1} (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND NOT {2} (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {3}) ORDER BY c.name ASC;",
    slots: [
      { answer: "EXISTS", kind: "keyword", label: "the positive probe", why: "The sweep requires pending history — a positive witness; the NOT EXISTS chip would demand NO pending orders and empty the sweep." },
      { answer: "EXISTS", kind: "keyword", label: "the negated half", why: "NOT EXISTS reads 'no delivered order exists' — the anti-probe; the NOT EXISTS chip here would demand delivered history and invert the sweep." },
      { answer: "'delivered'", kind: "keyword", label: "the absent fate", why: "The swept accounts lack delivered proof; 'cancelled' would sweep pending-but-never-cancelled — a different mercy list." },
    ],
    distractors: ["NOT EXISTS", "'shipped'", "'cancelled'"],''')

# ---------- cs-2431: empty-result case — flip to pending-but-never-shipped ----------
E(HKB, '''    id: "cs-2431", tier: "hard", topic: "gm4", universe: "fraud",
    title: "The stalled-sweep with absent proof",
    brief: "The risk sweep's sharpest cut: customers with pending orders but NO delivered history — stuck money with no fulfillment proof. The seed certifies a clean bill: all eight pending holders also carry delivered history, so the honest answer is empty and the sweep still ships.",
    ask: "Rebuild the sweep: names of customers holding pending orders and zero delivered orders, alphabetized.",
    template: "SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = {1}) AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE {2} AND o2.status = 'delivered') ORDER BY c.name {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the stuck segment", why: "The positive witness is pending history; 'shipped' would sweep accounts with transit and no delivery — a different risk list." },
      { answer: "o2.customer_id = c.id", kind: "keyword", label: "the anti-probe scope", why: "The negative probe must scope to the same account — both sides; a self-comparison makes 'no delivered order' always false and empties the sweep." },
      { answer: "ASC", kind: "keyword", label: "the case order", why: "Alphabetical keeps the sweep's output stable for the case file." },
    ],
    distractors: ["'shipped'", "o2.customer_id = o2.customer_id", "DESC"],
    walkthrough: "Mixed-polarity composition: a positive witness (pending exists) AND a negative one (delivered never does). The anti-probe's correlation is where the danger lives: the self-comparison decoy (o2 = o2) is always true inside the probe, so 'no delivered order exists' is false for every account the moment any delivered row exists anywhere — the sweep empties silently. Probed honestly: all eight pending holders carry delivered proof, so the sweep certifies zero names — the empty result IS the risk team's clean bill. The 'shipped' decoy rebuilds a neighboring sweep. Compound existence with mixed polarity is the quantifier grammar's full expression — this sweep and the pure-Accessories decomposition are its two poles: presence-plus-absence versus all-X.",''',
'''    id: "cs-2431", tier: "hard", topic: "gm4", universe: "fraud",
    title: "The stalled-sweep with absent proof",
    brief: "The risk sweep's sharpest cut: customers with pending orders but NO shipped history — stuck money that has never even left the building. Mixed-polarity composition: one positive witness (pending) AND one anti-probe (no shipped row). Three accounts surface — stuck before transit, the ops team's coldest leads.",
    ask: "Rebuild the sweep: names of customers holding pending orders and zero shipped orders, alphabetized.",
    template: "SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = {1}) AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE {2} AND o2.status = 'shipped') ORDER BY c.name {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the stuck segment", why: "The positive witness is pending history; 'delivered' would sweep accounts with fulfilled history and no transit — a different list." },
      { answer: "o2.customer_id = c.id", kind: "keyword", label: "the anti-probe scope", why: "The negative probe must scope to the same account — both sides; a self-comparison makes 'no shipped order' always false and empties the sweep." },
      { answer: "ASC", kind: "keyword", label: "the case order", why: "Alphabetical keeps the sweep's output stable for the case file." },
    ],
    distractors: ["'delivered'", "o2.customer_id = o2.customer_id", "DESC"],
    walkthrough: "Mixed-polarity composition: a positive witness (pending exists) AND a negative one (shipped never does). The anti-probe's correlation is where the danger lives: the self-comparison decoy (o2 = o2) is always true inside the probe, so 'no shipped order exists' is false the moment any shipped row exists anywhere — the sweep empties silently while looking correct. Probed honestly: five of the eight pending holders also have shipped history, so the sweep certifies the three coldest accounts. The 'delivered' decoy rebuilds the no-fulfillment sweep — neighboring grammar, different risk question. Compound existence with mixed polarity is the quantifier grammar's full expression — this sweep and the pure-Accessories decomposition are its two poles: presence-plus-absence versus all-X.",''')

# ---------- cs-2432: duplicate COUNT slots ----------
E(HKB, '''    template: "SELECT 'delivered' AS bucket, (SELECT {1}(*) FROM orders WHERE status = 'delivered') AS n UNION ALL SELECT 'shipped', (SELECT COUNT(*) FROM orders WHERE status = 'shipped') UNION ALL SELECT 'pending', (SELECT COUNT(*) FROM orders WHERE status = {2}) UNION ALL SELECT 'cancelled', (SELECT {3}(*) FROM orders WHERE status = 'cancelled') ORDER BY n DESC;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the lead tally", why: "The first arm's tally sets the column's type contract — counts all the way down; SUM would need an argument and change the shape." },
      { answer: "'pending'", kind: "keyword", label: "the third label", why: "The third arm counts the pending bucket; 'delivered' there would print 52 twice and drop the pending row entirely." },
      { answer: "COUNT", kind: "keyword", label: "the last tally", why: "Every arm tallies with COUNT so the union's column semantics stay uniform; MAX in one arm would return a status string into a numeric column." },
    ],
    distractors: ["SUM", "'delivered'", "MAX"],''',
'''    template: "SELECT 'delivered' AS bucket, (SELECT {1}(*) FROM orders WHERE status = 'delivered') AS n UNION ALL SELECT 'shipped', (SELECT COUNT(*) FROM orders WHERE status = 'shipped') UNION ALL SELECT 'pending', (SELECT COUNT(*) FROM orders WHERE status = {2}) UNION ALL SELECT 'cancelled', (SELECT COUNT(*) FROM orders WHERE status = {3}) ORDER BY n DESC;",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the lead tally", why: "The first arm's tally sets the column's type contract — counts all the way down; SUM(*) is illegal and MAX(*) does not compile." },
      { answer: "'pending'", kind: "keyword", label: "the third label", why: "The third arm counts the pending bucket; 'delivered' there would print 52 twice and drop the pending row entirely." },
      { answer: "'cancelled'", kind: "keyword", label: "the fourth label", why: "The last arm counts the cancelled bucket — seven; 'shipped' there would print 30 twice and the census would lose its tail." },
    ],
    distractors: ["SUM", "MAX", "'delivered'", "'shipped'"],''')

# ---------- cs-2434: duplicate rn slots + RANK/id coincidences ----------
E(HKB, '''    template: "WITH ranked AS (SELECT id, total, {1}() OVER (ORDER BY id) AS rn FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND(SUM(total) OVER (ORDER BY {2}), 2) AS running FROM ranked ORDER BY {3} ASC;",
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the stage ranker", why: "The stage assigns a stable sequence — ROW_NUMBER over the id order; RANK would tie on equal totals and break the curve's uniqueness." },
      { answer: "rn", kind: "keyword", label: "the curve axis", why: "The running sum walks the staged sequence; ordering by id inside the window would re-walk the raw table and diverge from the stage." },
      { answer: "rn", kind: "keyword", label: "the emit order", why: "The curve reads in sequence order — rn ascending; ordering by total would zigzag the line." },
    ],
    distractors: ["RANK", "id", "total"],''',
'''    template: "WITH ranked AS (SELECT id, total, ROW_NUMBER() OVER (ORDER BY {1}) AS rn FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND({2}(total) OVER (ORDER BY rn), 2) AS running FROM ranked ORDER BY rn {3};",
    slots: [
      { answer: "id", kind: "keyword", label: "the sequence key", why: "The stage sequences by order id — the ledger's chronological spine; sequencing by customer_id or status would interleave accounts and bend the curve." },
      { answer: "SUM", kind: "keyword", label: "the running aggregate", why: "The curve accumulates revenue; COUNT would walk a running ticket count and AVG a running mean — different lines." },
      { answer: "ASC", kind: "keyword", label: "the emit order", why: "The curve reads in sequence order — rn ascending; DESC would walk the ledger backwards from the grand total." },
    ],
    distractors: ["customer_id", "status", "COUNT", "AVG", "DESC"],''')

# ---------- cs-2436: revenue decoy coincides with flag order ----------
E(HKB, '''    distractors: ["id", "SUM", "revenue"],''',
'''    distractors: ["id", "SUM", "c.name"],''')
E(HKB, "ordering by revenue would put the active row first and bury the caveat.",
   "c.name is not grouped or aggregated, so that fill errors — the audit verifies the loud failure.")

# ---------- cs-2438: paired-spine redesign (anchors inside the window) ----------
E(HKB, '''    brief: "Two seeds, one walk: anchors 1 and 100 step toward the middle (first +1, second −1) under a shared BETWEEN guard. The paired-spine trick seeds two lineages in one CTE — they converge in the middle at 50/51 territory.",
    ask: "Rebuild the convergence walk: anchors 1 and 100 stepping toward the middle under a bounded guard, ordered by value.",
    template: "WITH RECURSIVE w(x, dir) AS (SELECT 1, 1 UNION ALL SELECT 100, -1 UNION ALL SELECT x + dir, dir FROM w WHERE x + dir {1} 45 AND x + dir {2} 56) SELECT x, dir FROM w ORDER BY x {3}, dir ASC;",
    slots: [
      { answer: ">=", kind: "keyword", label: "the lower bound", why: "The guard bounds the walk's floor: x + dir >= 45 stops the upward lineage before it walks past the meeting zone." },
      { answer: "<=", kind: "keyword", label: "the upper bound", why: "The ceiling stops the downward lineage symmetrically; dropping either bound lets a lineage walk to the extremes and bloat the walk." },
      { answer: "ASC", kind: "keyword", label: "the converge order", why: "Ascending x reads the walk as convergence from both ends; DESC would read it inside-out." },
    ],
    distractors: [">", ">", "DESC"],
    walkthrough: "Two anchor rows seed two lineages — one climbing by +1, one descending by −1 — sharing one recursive CTE and one bounded guard (BETWEEN 45 AND 56 spelled as the two comparisons). The lineages converge in the middle; the guard's bounds decide where the walk stops. The > decoy on the lower bound is the boundary flip: the upward lineage stops earlier, trimming rows the bounded walk would emit — checkable. The DESC decoy inverts the convergence reading — same rows, opposite order, a real output change. Multiple anchors are the queue fact: any SELECT seeds the walk, including compounds; each lineage walks under the same guard independently. Paired spines ship paired axes — starts and ends, lows and highs — in one named stage.",''',
'''    brief: "Two seeds, one walk: anchors 40 and 60 step toward each other (first +1, second −1) under a shared 40–60 window. The paired-spine trick seeds two lineages in one CTE — they sweep the whole window and cross in the middle.",
    ask: "Rebuild the convergence walk: anchors 40 and 60 stepping toward each other under a bounded guard, ordered by value.",
    template: "WITH RECURSIVE w(x, dir) AS (SELECT {1}, 1 UNION ALL SELECT 60, -1 UNION ALL SELECT x + dir, dir FROM w WHERE x + dir {2} 40 AND x + dir {3} 60) SELECT x, dir FROM w ORDER BY x ASC, dir ASC;",
    slots: [
      { answer: "40", kind: "keyword", label: "the upward anchor", why: "The upward lineage seeds at 40; 45 or 50 would start it mid-window and trim every row below the seed." },
      { answer: ">=", kind: "keyword", label: "the lower bound", why: "The guard bounds the walk's floor: x + dir >= 40 keeps the downward lineage walking to 40 inclusive; > would drop the 40 rung." },
      { answer: "<=", kind: "keyword", label: "the upper bound", why: "The ceiling keeps the upward lineage to 60 inclusive; < would drop the 60 rung — the mirror trim." },
    ],
    distractors: ["45", "50", ">", "<"],
    walkthrough: "Two anchor rows seed two lineages — one climbing by +1 from 40, one descending by −1 from 60 — sharing one recursive CTE and one bounded guard (the 40–60 window spelled as the two comparisons). Upward emits 41..60, downward 59..40: the middle rungs carry two rows each (one per lineage), which is why dir rides the queue. The seed decoys (45, 50) start a lineage mid-window and trim the low rungs — checkable row losses. The bound decoys (> and <) each drop exactly the boundary rung — inclusive versus exclusive made visible on a real walk. Multiple anchors are the queue fact: any SELECT seeds the walk, including compounds; each lineage walks under the same guard independently.",''')

# ---------- cs-2441: '>' decoy coincides (empty 3000 boundary) ----------
E(HKB, '''    distractors: ["COUNT", ">", "'occasional'"],''',
'''    distractors: ["COUNT", "<=", "'occasional'"],''')
E(HKB, "The > decoy would demote exactly-anyone-at-the-line. Probed: the boundary carries real whales (Grace 4574, Maya 3644, Chloe 2667 sits below).",
   "The <= decoy flips the tier boundary — spend at most 3000 becomes whale, inverting the matrix.")

# ---------- cs-2444: '>' coincides with <> 'cancelled' on this vocabulary ----------
E(HKB, '''    distractors: [">", "100", "="],''',
'''    distractors: ["100", "="],''')

# ---------- bank: cs-2342 single-row direction decoys ----------
E(BANK, '''    ask: "Rebuild the archive row: id, customer_id and total of the biggest ticket.",
    template: "SELECT id, customer_id, total FROM orders WHERE total = (SELECT {1}(total) FROM {2}) ORDER BY {3} ASC;",
    slots: [
      { answer: "MAX", kind: "keyword", label: "the extreme", why: "The biggest ticket needs the maximum. MIN fetches the 25.47 floor and AVG matches nothing — averages manufacture values that no order carries exactly." },
      { answer: "orders", kind: "keyword", label: "the probe table", why: "Totals live on orders; probing products or customers would compare totals against the wrong domain entirely." },
      { answer: "id", kind: "keyword", label: "the tiebreak", why: "ORDER BY id ASC gives a deterministic order if two orders ever tied at the max — stability the month-close archive requires." },
    ],
    distractors: ["MIN", "products", "total"],''',
'''    ask: "Rebuild the archive row: id, customer_id and total of the biggest order, confirmed to its owner.",
    template: "SELECT id, customer_id, {1} FROM orders WHERE total = (SELECT {2}(total) FROM orders) AND customer_id = {3};",
    slots: [
      { answer: "total", kind: "keyword", label: "the shown figure", why: "The archive row displays the ticket's total; projecting status there would print the wrong field in the figure column." },
      { answer: "MAX", kind: "keyword", label: "the extreme", why: "The biggest ticket needs the maximum. MIN fetches the 25.47 floor and AVG matches nothing — averages manufacture values that no order carries exactly." },
      { answer: "6", kind: "keyword", label: "the owner check", why: "The ceiling ticket belongs to customer 6; pinning the owner makes the archive row self-verifying — 16 or 1 would empty the row." },
    ],
    distractors: ["status", "MIN", "AVG", "16", "1"],''')

# ---------- bank: cs-2343 single-row direction decoy ----------
E(BANK, '''    ask: "Rebuild the watchlist row: name and rating of the supplier with the lowest rating.",
    template: "SELECT name, rating FROM {1} WHERE rating = (SELECT {2}(rating) FROM suppliers) ORDER BY {3} ASC;",
    slots: [
      { answer: "suppliers", kind: "keyword", label: "the directory", why: "Ratings live on the supplier directory; products or orders carry no rating column and the query would fail to compile." },
      { answer: "MIN", kind: "keyword", label: "the aggregate", why: "Lowest score means minimum. MAX would fetch the 4.8 flagship instead — the watchlist's opposite end." },
      { answer: "name", kind: "keyword", label: "the sort", why: "Alphabetical order makes the watchlist deterministic if two suppliers ever tie at the floor." },
    ],
    distractors: ["MAX", "products", "rating"],''',
'''    ask: "Rebuild the watchlist row: name and rating of the lowest-rated supplier, confirmed by name.",
    template: "SELECT name, {1} FROM suppliers WHERE rating = (SELECT {2}(rating) FROM suppliers) AND {3} LIKE 'P%';",
    slots: [
      { answer: "rating", kind: "keyword", label: "the score column", why: "The watchlist row displays the floor score beside the name; projecting region there would print the wrong field." },
      { answer: "MIN", kind: "keyword", label: "the floor", why: "The watchlist targets the lowest score. MAX fetches the 4.8 flagship — the opposite end — and AVG manufactures a value no supplier carries." },
      { answer: "name", kind: "keyword", label: "the confirmation probe", why: "LIKE 'P%' confirms Pacific Textiles by name; rating LIKE 'P%' compares a number to text and empties the row." },
    ],
    distractors: ["region", "MAX", "AVG", "rating"],''')

# ---------- bank: cs-2345 alias decoys + products coincidence ----------
E(BANK, '''    ask: "Return one row with the customer count, product count and order count as three columns.",
    template: "SELECT (SELECT COUNT(*) FROM {1}) AS {2}, (SELECT COUNT(*) FROM products) AS products, (SELECT {3}(*) FROM orders) AS orders;",
    slots: [
      { answer: "customers", kind: "keyword", label: "the first table", why: "The first cell counts the customer directory; probing products here would print 16 in the wrong column and mislabel the header." },
      { answer: "products", kind: "keyword", label: "the header name", why: "The second cell must be named products to match the dashboard header; a wrong alias would break the export contract." },
      { answer: "COUNT", kind: "keyword", label: "the tally", why: "COUNT(*) counts rows; SUM(*) is not legal SQL and MAX would return a total value, not a count." },
    ],
    distractors: ["customers", "SUM", "customers"],''',
'''    ask: "Return one row with the customer count, product count and pending order count as three columns.",
    template: "SELECT (SELECT COUNT(*) FROM {1}) AS customers, (SELECT COUNT(*) FROM products) AS products, (SELECT {2}(*) FROM orders WHERE status = {3}) AS pend;",
    slots: [
      { answer: "customers", kind: "keyword", label: "the first table", why: "The first cell counts the customer directory; probing suppliers would print 6 under 'customers' and mislabel the header." },
      { answer: "COUNT", kind: "keyword", label: "the tally", why: "COUNT(*) counts rows; SUM(*) is not legal SQL and MAX would return a total value, not a count." },
      { answer: "'pending'", kind: "keyword", label: "the third cell's filter", why: "The third cell tracks the undecided money — fourteen tickets; 'delivered' would print 52 and misname the KPI." },
    ],
    distractors: ["suppliers", "invoices", "SUM", "MAX", "'delivered'", "'shipped'"],''')

# ---------- bank: cs-2346 tiebreak decoy never fires (prices distinct) ----------
E(BANK, '''    template: "SELECT name, price, CASE WHEN price {1} (SELECT AVG(price) FROM products) THEN 1 ELSE 0 END AS premium FROM products ORDER BY {2} DESC, name {3};",
    slots: [
      { answer: ">", kind: "keyword", label: "the premium test", why: "Above the live average earns the flag. A >= would behave identically here (no product sits exactly at 71.7769) but documents the wrong contract; < flags the budget shelf." },
      { answer: "price", kind: "keyword", label: "the primary sort", why: "Priciest first is the board's reading order — the flag column then shows a clean 1-block over 0-block." },
      { answer: "ASC", kind: "keyword", label: "the tiebreak", why: "Alphabetical within equal prices keeps the list deterministic — the export contract requires stable output across runs." },
    ],
    distractors: ["<", "premium", "DESC"],''',
'''    template: "SELECT name, price, CASE WHEN price {1} (SELECT AVG(price) FROM products) THEN 1 ELSE {2} END AS premium FROM products ORDER BY {3} DESC, name ASC;",
    slots: [
      { answer: ">", kind: "keyword", label: "the premium test", why: "Above the live average earns the flag. = would match nobody (no product sits exactly at 71.7769) and < flags the budget shelf." },
      { answer: "0", kind: "keyword", label: "the non-premium flag", why: "Budget rows flag 0; a 2 would invent a third state and 'no' would mix text into a numeric column." },
      { answer: "price", kind: "keyword", label: "the primary sort", why: "Priciest first is the board's reading order — the flag column then shows a clean 1-block over 0-block." },
    ],
    distractors: ["<", "=", "name", "premium", "2"],''')

# ---------- bank: cs-2347 duplicate pending + shipped coincidence ----------
E(BANK, '''    template: "SELECT id, total FROM orders WHERE status = {1} AND total > (SELECT {2}(total) FROM orders WHERE status = {3}) ORDER BY total DESC;",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the outer filter", why: "The segment is pending; the outer filter selects its rows. Dropping the quotes turns the literal into a column reference that does not exist." },
      { answer: "AVG", kind: "keyword", label: "the segment benchmark", why: "The segment's own average is the fair bar — 436.64. MAX would match nothing above 1088.44's exclusivity and SUM would overshoot every comparison." },
      { answer: "'pending'", kind: "keyword", label: "the inner filter", why: "The scalar subquery must scope to the SAME segment — without the inner WHERE the benchmark becomes the store-wide 338.19 and the comparison loses its fairness." },
    ],
    distractors: ["'delivered'", "MAX", "'shipped'"],''',
'''    template: "SELECT id, total FROM orders WHERE status = {1} AND total {2} (SELECT AVG(total) FROM orders WHERE status = 'pending') ORDER BY total {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the outer filter", why: "The segment is pending; the outer filter selects its rows. Dropping the quotes turns the literal into a column reference that does not exist." },
      { answer: ">", kind: "keyword", label: "the above test", why: "Above the segment bar is strict; < collects the below-average pending tickets and = matches nothing — no pending total equals 436.64." },
      { answer: "DESC", kind: "keyword", label: "the biggest-first order", why: "The exposure read is biggest-first; ASC would open on the smallest above-bar ticket." },
    ],
    distractors: ["'delivered'", "'shipped'", "<", "=", "ASC"],''')

# apply
files = {}
for f, old, new in EDITS:
    files.setdefault(f, []).append((old, new))

fail = 0
for f, pairs in files.items():
    path = "/home/z/my-project/" + f
    src = open(path, encoding="utf-8").read()
    for old, new in pairs:
        if old not in src:
            print(f"NOT FOUND in {f}: {old[:70]!r}")
            fail += 1
            continue
        src = src.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(src)
    print(f"{f}: {len(pairs)} edits applied")

print(f"done, {fail} misses")
sys.exit(1 if fail else 0)
