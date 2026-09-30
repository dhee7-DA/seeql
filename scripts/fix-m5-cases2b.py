#!/usr/bin/env python3
# M5 case fix round 2b — remaining structural patches (see round 2a header).
import pathlib, sys

ROOT = pathlib.Path("src/lib/curriculum/gauntlet")

def patch(fname, old, new, cid):
    p = ROOT / fname
    t = p.read_text()
    if new in t:
        print(f"skip {cid} (already applied)")
        return
    n = t.count(old)
    if n != 1:
        print(f"FAIL {cid}: anchor found {n}x in {fname}")
        sys.exit(1)
    p.write_text(t.replace(old, new))
    print(f"ok {cid}")

# cs-2495: dedupe m/m -> slot3 becomes "m ASC"; adjust distractors
patch("m05-cases-easy-b.ts",
  '      { answer: "m", kind: "keyword", label: "the walk order", why: "ORDER BY m walks the calendar forward. ORDER BY n sorts by count and scrambles the timeline." },\n    ],\n    distractors: ["\'%Y\'", "\'%m\'", "\'%d\'", "created_at", "strftime", "n"],',
  '      { answer: "m ASC", kind: "keyword", label: "the walk order", why: "ORDER BY m ASC walks the calendar forward. ORDER BY n sorts by count and scrambles the timeline; DESC walks it backwards." },\n    ],\n    distractors: ["\'%Y\'", "\'%m\'", "\'%d\'", "created_at", "n", "DESC"],',
  "cs-2495 dedupe")

# cs-2496: _RANK bug -> full-name slot
patch("m05-cases-easy-b.ts",
  'template: "SELECT id, total, ROUND({1}_RANK() OVER (ORDER BY total {2}), 4) AS pr FROM orders ORDER BY total DESC LIMIT {3};",\n    slots: [\n      { answer: "PERCENT", kind: "keyword", label: "the percentile ranker", why: "PERCENT_RANK yields 0-based shares. CUME_RANK does not exist — the parse dies; DENSE_RANK would print integer rungs 1, 2, 3 instead of shares." },',
  'template: "SELECT id, total, ROUND({1}() OVER (ORDER BY total {2}), 4) AS pr FROM orders ORDER BY total DESC LIMIT {3};",\n    slots: [\n      { answer: "PERCENT_RANK", kind: "keyword", label: "the percentile ranker", why: "PERCENT_RANK yields 0-based shares. CUME_DIST yields inclusive shares — a different ladder; DENSE_RANK prints integer rungs 1, 2, 3 where shares belong." },',
  "cs-2496 template")
patch("m05-cases-easy-b.ts",
  '    distractors: ["CUME", "DENSE", "ASC", "5"],',
  '    distractors: ["CUME_DIST", "DENSE_RANK", "ROW_NUMBER", "ASC", "5"],',
  "cs-2496 distractors")

# cs-2497: add LIMIT slot
patch("m05-cases-easy-b.ts",
  'template: "SELECT id, total, ROUND(CUME_{1}() OVER (ORDER BY total {2}), 4) AS cd FROM orders ORDER BY total DESC LIMIT 3;",\n    slots: [\n      { answer: "DIST", kind: "keyword", label: "the distribution half", why: "CUME_DIST is the function\'s name. CUME_RANK and CUME_PERCENT do not exist — both decoys die at parse time." },\n      { answer: "DESC", kind: "keyword", label: "the at-or-above walk", why: "DESC makes the share count rows at or above (the big end). ASC counts from the cheap end — the champion\'s cell becomes 1.0, the whole book." },\n    ],\n    distractors: ["RANK", "PERCENT", "ASC"],',
  'template: "SELECT id, total, ROUND(CUME_{1}() OVER (ORDER BY total {2}), 4) AS cd FROM orders ORDER BY total DESC LIMIT {3};",\n    slots: [\n      { answer: "DIST", kind: "keyword", label: "the distribution half", why: "CUME_DIST is the function\'s name. CUME_RANK and CUME_PERCENT do not exist — both decoys die at parse time." },\n      { answer: "DESC", kind: "keyword", label: "the at-or-above walk", why: "DESC makes the share count rows at or above (the big end). ASC counts from the cheap end — the champion\'s cell becomes 1.0, the whole book." },\n      { answer: "3", kind: "number", label: "the preview depth", why: "Three rows per the brief. LIMIT 5 ships two extra rungs; LIMIT 1 hides the ladder\'s shape.", noVerify: true },\n    ],\n    distractors: ["RANK", "PERCENT", "ASC", "5", "1"],',
  "cs-2497 slot3")

# cs-2499: add function slot
patch("m05-cases-easy-b.ts",
  'template: "SELECT id, total, COUNT(*) OVER () AS cohort_rows FROM orders WHERE status = {1} ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "\'delivered\'", kind: "keyword", label: "the cohort",',
  'template: "SELECT id, total, {3}(*) OVER () AS cohort_rows FROM orders WHERE status = {1} ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "\'delivered\'", kind: "keyword", label: "the cohort",',
  "cs-2499 template")
patch("m05-cases-easy-b.ts",
  '      { answer: "2", kind: "number", label: "the preview size", why: "Two rows per the brief. LIMIT 5 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["\'pending\'", "\'shipped\'", "\'cancelled\'", "5"],',
  '      { answer: "2", kind: "number", label: "the preview size", why: "Two rows per the brief. LIMIT 5 ships extra rows.", noVerify: true },\n      { answer: "COUNT", kind: "keyword", label: "the census counter", why: "COUNT(*) counts the surviving rows. SUM(*) and AVG(*) are parse errors — star aggregation belongs to counting alone." },\n    ],\n    distractors: ["\'pending\'", "\'shipped\'", "\'cancelled\'", "5", "SUM", "AVG"],',
  "cs-2499 slot3")

# cs-2500: add partition slot
patch("m05-cases-easy-b.ts",
  'template: "SELECT id, customer_id, total, {1}(total) OVER (PARTITION BY customer_id) AS floor_total FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "MIN", kind: "keyword", label: "the floor reader",',
  'template: "SELECT id, customer_id, total, {1}(total) OVER (PARTITION BY {3}) AS floor_total FROM orders ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "MIN", kind: "keyword", label: "the floor reader",',
  "cs-2500 template")
patch("m05-cases-easy-b.ts",
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows per the brief. LIMIT 6 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["MAX", "AVG", "COUNT", "6"],',
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three rows per the brief. LIMIT 6 ships extra rows.", noVerify: true },\n      { answer: "customer_id", kind: "keyword", label: "the owner key", why: "Partition by customer for personal floors. status would floor per cohort — 52-row pools sharing one floor; id partitions per order." },\n    ],\n    distractors: ["MAX", "AVG", "COUNT", "6", "status", "id"],',
  "cs-2500 slot3")

# cs-2507: dedupe DESC -> slot3 becomes ROUND places, hardcode outer DESC
patch("m05-cases-medium-a.ts",
  'template: "SELECT name, ROUND(spend, 2) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) {1}) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = {2} ORDER BY spend {3};",\n    slots: [\n      { answer: "DESC", kind: "keyword", label: "the big-first deal", why: "DESC deals biggest-first, so tile 4 is the floor. ASC deals cheapest-first and tile 4 becomes the whale tank — four different names." },\n      { answer: "4", kind: "number", label: "the kept tile", why: "Tile 4 is the floor quartile. Tile 2 ships the middle-low spenders; tile 5 does not exist under a four-tile deal and returns empty.", noVerify: true },\n      { answer: "DESC", kind: "keyword", label: "the reading order", why: "DESC reads the floor quartile biggest-first: Liam, Jamal, Dmitri, Olivia. ASC reverses to Olivia-first — a different page." },\n    ],\n    distractors: ["ASC", "2", "5", "1"],',
  'template: "SELECT name, ROUND(spend, {3}) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) {1}) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = {2} ORDER BY spend DESC;",\n    slots: [\n      { answer: "DESC", kind: "keyword", label: "the big-first deal", why: "DESC deals biggest-first, so tile 4 is the floor. ASC deals cheapest-first and tile 4 becomes the whale tank — four different names." },\n      { answer: "4", kind: "number", label: "the kept tile", why: "Tile 4 is the floor quartile. Tile 2 ships the middle-low spenders; tile 5 does not exist under a four-tile deal and returns empty.", noVerify: true },\n      { answer: "2", kind: "number", label: "the cent places", why: "Two places print exact money: 444.8 reads as 444.80. Zero places print 445 — rounded; one place clips the second cent.", noVerify: true },\n    ],\n    distractors: ["ASC", "2", "5", "0", "1"],',
  "cs-2507 dedupe")

# cs-2519: _RANK bug -> full-name slot
patch("m05-cases-medium-a.ts",
  'template: "SELECT drk, m, ROUND(rev, 2) AS rev FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, SUM(total) AS rev, {1}_RANK() OVER (ORDER BY SUM(total) {2}) AS drk FROM orders GROUP BY m) WHERE drk <= {3} ORDER BY drk;",\n    slots: [\n      { answer: "DENSE", kind: "keyword", label: "the no-gap ranker", why: "DENSE_RANK never skips after ties. ROW_RANK does not exist — parse error; PERCENT_RANK would print shares, not rungs." },',
  'template: "SELECT drk, m, ROUND(rev, 2) AS rev FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, SUM(total) AS rev, {1}() OVER (ORDER BY SUM(total) {2}) AS drk FROM orders GROUP BY m) WHERE drk <= {3} ORDER BY drk;",\n    slots: [\n      { answer: "DENSE_RANK", kind: "keyword", label: "the no-gap ranker", why: "DENSE_RANK never skips after ties. PERCENT_RANK prints 0-based shares where rungs belong; MIN and AVG with empty parens are argument errors." },',
  "cs-2519 template")
patch("m05-cases-medium-a.ts",
  '    distractors: ["ROW", "PERCENT", "ASC", "5"],',
  '    distractors: ["PERCENT_RANK", "MIN", "AVG", "ASC", "5"],',
  "cs-2519 distractors")

# cs-2530: add OVER slot
patch("m05-cases-medium-b.ts",
  'template: "SELECT name || \' (\' || {1} || \')\' AS tag, COUNT(*) OVER () AS stamped FROM customers ORDER BY name LIMIT {2};",\n    slots: [\n      { answer: "region", kind: "keyword", label: "the tag content",',
  'template: "SELECT name || \' (\' || {1} || \')\' AS tag, COUNT(*) {3} () AS stamped FROM customers ORDER BY name LIMIT {2};",\n    slots: [\n      { answer: "region", kind: "keyword", label: "the tag content",',
  "cs-2530 template")
patch("m05-cases-medium-b.ts",
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three tags per the brief. LIMIT 5 ships two extra rows.", noVerify: true },\n    ],\n    distractors: ["city", "email", "id", "5", "1"],',
  '      { answer: "3", kind: "number", label: "the preview size", why: "Three tags per the brief. LIMIT 5 ships two extra rows.", noVerify: true },\n      { answer: "OVER", kind: "keyword", label: "the stamp clause", why: "OVER () makes the companion count a window stamp. GROUP BY and WHERE in the slot are parse errors." },\n    ],\n    distractors: ["city", "email", "id", "5", "GROUP BY", "WHERE"],',
  "cs-2530 slot3")

# cs-2532: missing {3} marker in template
patch("m05-cases-medium-b.ts",
  'template: "SELECT id, created_at, total, ROUND(SUM(total) OVER ({1} BY status ORDER BY created_at, id), 2) AS exposure FROM orders WHERE status = {2} ORDER BY created_at, id;",',
  'template: "SELECT id, created_at, total, ROUND(SUM(total) OVER ({1} BY status ORDER BY created_at, {3}), 2) AS exposure FROM orders WHERE status = {2} ORDER BY created_at, id;",',
  "cs-2532 marker")

# cs-2545: add MIN slot
patch("m05-cases-hard-a.ts",
  'template: "SELECT DISTINCT customer_id, ROUND(mx - mn, {1}) AS swing FROM (SELECT customer_id, {2}(total) OVER (PARTITION BY customer_id) AS mx, MIN(total) OVER (PARTITION BY customer_id) AS mn FROM orders) ORDER BY customer_id;",\n    slots: [\n      { answer: "2", kind: "number", label: "the cent places", why: "Two places print exact money: 722.28. Zero rounds to whole dollars — a different figure; one clips the second cent.", noVerify: true },\n      { answer: "MAX", kind: "keyword", label: "the ceiling reader", why: "MAX reads each account\'s biggest ticket. MIN makes the swing max-minus-min collapse to zero; AVG measures the mean-minus-floor instead." },\n    ],\n    distractors: ["0", "1", "MIN", "AVG", "SUM"],',
  'template: "SELECT DISTINCT customer_id, ROUND(mx - mn, {1}) AS swing FROM (SELECT customer_id, {2}(total) OVER (PARTITION BY customer_id) AS mx, {3}(total) OVER (PARTITION BY customer_id) AS mn FROM orders) ORDER BY customer_id;",\n    slots: [\n      { answer: "2", kind: "number", label: "the cent places", why: "Two places print exact money: 722.28. Zero rounds to whole dollars — a different figure; one clips the second cent.", noVerify: true },\n      { answer: "MAX", kind: "keyword", label: "the ceiling reader", why: "MAX reads each account\'s biggest ticket. MIN in this slot makes the swing collapse to zero; AVG measures the mean-minus-floor instead." },\n      { answer: "MIN", kind: "keyword", label: "the floor reader", why: "MIN reads each account\'s smallest ticket — the swing\'s far end. MAX here collapses the swing to zero; SUM totals the book." },\n    ],\n    distractors: ["0", "1", "MAX", "AVG", "SUM", "COUNT"],',
  "cs-2545 slot3")

# cs-2547: dedupe 1/1 -> slot3 becomes ROUND places
patch("m05-cases-hard-a.ts",
  'template: "SELECT id, total, ROUND({1}(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND {2} PRECEDING), 2) AS t2 FROM orders WHERE customer_id = {3} ORDER BY created_at, id LIMIT 4;",\n    slots: [\n      { answer: "AVG", kind: "keyword", label: "the smoother", why: "AVG averages the frame. SUM would total the pair — a different series; COUNT tallies membership, printing 0 then 2s." },\n      { answer: "1", kind: "number", label: "the near edge", why: "1 PRECEDING ends the frame just before the current row. 0 PRECEDING includes it — the baseline starts seeing today; 2 PRECEDING collapses the frame to the single 2-back ticket.", noVerify: true },\n      { answer: "1", kind: "number", label: "the walked account", why: "Customer 1\'s cadence per the brief. Customer 2 has two orders — a shorter walk; customer 3 a different rhythm entirely.", noVerify: true },\n    ],\n    distractors: ["SUM", "COUNT", "0", "2", "3"],',
  'template: "SELECT id, total, ROUND({1}(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND {2} PRECEDING), {3}) AS t2 FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4;",\n    slots: [\n      { answer: "AVG", kind: "keyword", label: "the smoother", why: "AVG averages the frame. SUM would total the pair — a different series; COUNT tallies membership, printing 0 then 2s." },\n      { answer: "1", kind: "number", label: "the near edge", why: "1 PRECEDING ends the frame just before the current row. 0 PRECEDING includes it — the baseline starts seeing today; 2 PRECEDING collapses the frame to the single 2-back ticket.", noVerify: true },\n      { answer: "2", kind: "number", label: "the decimal places", why: "Two places print exact money: 460.08. Zero places print 460; one place clips the second cent — different cells either way.", noVerify: true },\n    ],\n    distractors: ["SUM", "COUNT", "0", "2", "3", "1"],',
  "cs-2547 dedupe")

# cs-2549: missing {3} marker + dedupe ASC
patch("m05-cases-hard-b.ts",
  'template: "SELECT band, COUNT(*) AS n FROM (SELECT CASE WHEN pr < 0.25 THEN \'b1\' WHEN pr < 0.5 THEN \'b2\' WHEN pr < 0.75 THEN \'b3\' ELSE \'b4\' END AS band FROM (SELECT total, PERCENT_RANK() OVER (ORDER BY total {1}) AS pr FROM orders)) GROUP BY band ORDER BY band {2};",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the cheap-first scale", why: "ASC runs pr 0 at the cheapest to 1 at the richest, so b1 is the cheap quarter. DESC inverts the scale — b1 becomes the premium quarter." },\n      { answer: "ASC", kind: "keyword", label: "the band order", why: "ASC reads b1 to b4. DESC prints b4 first — same four counts, a different page." },\n      { answer: "\'b2\'", kind: "keyword", label: "the second label", why: "The second band\'s name. \'x2\' renames the band and the census shows x2 where b2 should be — every cell changes." },\n    ],\n    distractors: ["DESC", ">=", "\'x2\'", "MIN"],',
  'template: "SELECT band, COUNT(*) AS n FROM (SELECT CASE WHEN pr < 0.25 THEN \'b1\' WHEN pr < 0.5 THEN {3} WHEN pr < 0.75 THEN \'b3\' ELSE \'b4\' END AS band FROM (SELECT total, PERCENT_RANK() OVER (ORDER BY total {1}) AS pr FROM orders)) GROUP BY band ORDER BY {2};",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the cheap-first scale", why: "ASC runs pr 0 at the cheapest to 1 at the richest, so b1 is the cheap quarter. DESC inverts the scale — b1 becomes the premium quarter." },\n      { answer: "band", kind: "keyword", label: "the census order", why: "ORDER BY band reads b1 to b4. ORDER BY n sorts by the count column and reshuffles the four rows." },\n      { answer: "\'b2\'", kind: "keyword", label: "the second label", why: "The second band\'s name. \'x2\' renames the band and the census shows x2 where b2 should be — every cell changes." },\n    ],\n    distractors: ["DESC", ">=", "\'x2\'", "MIN", "n"],',
  "cs-2549 dedupe+marker")

# cs-2550: dedupe ASC -> slot3 becomes the threshold
patch("m05-cases-hard-b.ts",
  'template: "SELECT id, total, ROUND(cd, 4) AS cd FROM (SELECT id, total, CUME_DIST() OVER (ORDER BY total {1}) AS cd FROM orders) WHERE cd {2} 0.5 ORDER BY total {3} LIMIT 1;",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the cheap-first ladder", why: "ASC climbs from the cheapest, so the first share past 0.5 is the median zone. DESC climbs from the ceiling — the first past-half share belongs to the biggest ticket." },\n      { answer: ">", kind: "keyword", label: "the strict pass", why: "Strictly greater catches the first share OVER the line. < keeps shares below it — the cheapest ticket\'s 0.0097; = matches nothing, since 103 odd rows never hit exactly 0.5." },\n      { answer: "ASC", kind: "keyword", label: "the cheap-first read", why: "ORDER BY total ASC with LIMIT 1 lands on the cheapest over-line ticket — the median zone\'s floor. DESC would report the whole book\'s ceiling instead." },\n    ],\n    distractors: ["DESC", "<", "="],',
  'template: "SELECT id, total, ROUND(cd, 4) AS cd FROM (SELECT id, total, CUME_DIST() OVER (ORDER BY total {1}) AS cd FROM orders) WHERE cd {2} {3} ORDER BY total ASC LIMIT 1;",\n    slots: [\n      { answer: "ASC", kind: "keyword", label: "the cheap-first ladder", why: "ASC climbs from the cheapest, so the first share past 0.5 is the median zone. DESC climbs from the ceiling — the first past-half share belongs to the biggest ticket." },\n      { answer: ">", kind: "keyword", label: "the strict pass", why: "Strictly greater catches the first share OVER the line. < keeps shares below it — the cheapest ticket\'s 0.0097; = matches nothing, since 103 odd rows never hit exactly 0.5." },\n      { answer: "0.5", kind: "number", label: "the halfway line", why: "The median share. 0.4 passes earlier (the 42nd-cheapest ticket); 0.6 later (the 62nd) — different medians either way.", noVerify: true },\n    ],\n    distractors: ["DESC", "<", "=", "0.4", "0.6"],',
  "cs-2550 dedupe")

# cs-2551: add SUM slot
patch("m05-cases-hard-b.ts",
  'template: "SELECT name, price, ROUND(SUM(price) OVER (PARTITION BY {1}), 2) AS cat_total, COUNT(*) OVER () AS stamped FROM products ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "category", kind: "keyword", label: "the shelf key",',
  'template: "SELECT name, price, ROUND({3}(price) OVER (PARTITION BY {1}), 2) AS cat_total, COUNT(*) OVER () AS stamped FROM products ORDER BY id LIMIT {2};",\n    slots: [\n      { answer: "category", kind: "keyword", label: "the shelf key",',
  "cs-2551 template")
patch("m05-cases-hard-b.ts",
  '      { answer: "5", kind: "number", label: "the stamp preview", why: "Five rows per the brief. LIMIT 3 truncates the preview below spec; LIMIT 10 ships extra rows.", noVerify: true },\n    ],\n    distractors: ["supplier_id", "name", "3", "10"],',
  '      { answer: "5", kind: "number", label: "the stamp preview", why: "Five rows per the brief. LIMIT 3 truncates the preview below spec; LIMIT 10 ships extra rows.", noVerify: true },\n      { answer: "SUM", kind: "keyword", label: "the shelf adder", why: "SUM(price) totals the shelf. AVG(price) stamps the mean price; MAX the priciest — different denominators on the same rows." },\n    ],\n    distractors: ["supplier_id", "name", "3", "10", "AVG", "MAX"],',
  "cs-2551 slot3")

# cs-2556: add SUM slot
patch("m05-cases-hard-b.ts",
  'template: "SELECT DISTINCT customer_id, ROUND(100.0 * top_ticket / lifetime, {1}) AS crown_share FROM (SELECT customer_id, {2}(total) OVER (PARTITION BY customer_id) AS top_ticket, SUM(total) OVER (PARTITION BY customer_id) AS lifetime FROM orders) ORDER BY customer_id;",\n    slots: [\n      { answer: "4", kind: "number", label: "the share places", why: "Four places keep the basis points. Two places clip them; zero places print whole percents — different cells either way.", noVerify: true },\n      { answer: "MAX", kind: "keyword", label: "the crown reader", why: "MAX(total) reads each account\'s biggest ticket. MIN divides the FLOOR by lifetime — a humility score; AVG the mean\'s weight; SUM divides the book by itself and prints 100 everywhere." },\n    ],\n    distractors: ["2", "0", "MIN", "AVG", "SUM"],',
  'template: "SELECT DISTINCT customer_id, ROUND(100.0 * top_ticket / lifetime, {1}) AS crown_share FROM (SELECT customer_id, {2}(total) OVER (PARTITION BY customer_id) AS top_ticket, {3}(total) OVER (PARTITION BY customer_id) AS lifetime FROM orders) ORDER BY customer_id;",\n    slots: [\n      { answer: "4", kind: "number", label: "the share places", why: "Four places keep the basis points. Two places clip them; zero places print whole percents — different cells either way.", noVerify: true },\n      { answer: "MAX", kind: "keyword", label: "the crown reader", why: "MAX(total) reads each account\'s biggest ticket. MIN divides the FLOOR by lifetime — a humility score; AVG the mean\'s weight." },\n      { answer: "SUM", kind: "keyword", label: "the lifetime reader", why: "SUM(total) is the whole book the crown rides on. MAX here divides the ticket by itself — 100 everywhere; AVG the mean\'s weight; COUNT a tally." },\n    ],\n    distractors: ["2", "0", "MIN", "AVG", "MAX", "COUNT"],',
  "cs-2556 slot3")

# cs-2558: _RANK bug -> full-name slot
patch("m05-cases-hard-b.ts",
  'template: "SELECT rk, customer_id, n FROM (SELECT customer_id, n, {1}_RANK() OVER (ORDER BY n {2}, customer_id) AS rk FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)) ORDER BY rk, customer_id LIMIT {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the gap-keeping ranker", why: "RANK stamps 6,6,6,6 on the count-4 tie and jumps to 10. DENSE_RANK would stamp 7 next — a different seventh row; ROW_NUMBER 10 with no skip." },',
  'template: "SELECT rk, customer_id, n FROM (SELECT customer_id, n, {1}() OVER (ORDER BY n {2}, customer_id) AS rk FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)) ORDER BY rk, customer_id LIMIT {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the gap-keeping ranker", why: "RANK stamps 6,6,6,6 on the count-4 tie and jumps to 10. DENSE_RANK would stamp 7 next — a different seventh row; ROW_NUMBER numbers straight through the tie." },',
  "cs-2558 template")
patch("m05-cases-hard-b.ts",
  '    distractors: ["DENSE", "ROW", "PERCENT", "ASC", "5"],',
  '    distractors: ["DENSE_RANK", "ROW_NUMBER", "PERCENT_RANK", "ASC", "5"],',
  "cs-2558 distractors")

# cs-2561: _RANK bug -> full-name slot
patch("m05-cases-hard-b.ts",
  'template: "SELECT n, c, rk FROM (SELECT n, COUNT(*) AS c, {1}_RANK() OVER (ORDER BY n {2}) AS rk FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m) GROUP BY n) ORDER BY {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the level ranker", why: "RANK() ranks the count levels 9, 8, 7, 6 to 1, 3, 7, 12. DENSE_RANK would print 1, 2, 3, 4 — the skipped rungs are the whole lesson." },',
  'template: "SELECT n, c, rk FROM (SELECT n, COUNT(*) AS c, {1}() OVER (ORDER BY n {2}) AS rk FROM (SELECT strftime(\'%Y-%m\', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m) GROUP BY n) ORDER BY {3};",\n    slots: [\n      { answer: "RANK", kind: "keyword", label: "the level ranker", why: "RANK() ranks the count levels 9, 8, 7, 6 to 1, 3, 7, 12. DENSE_RANK would print 1, 2, 3, 4 — the skipped rungs are the whole lesson." },',
  "cs-2561 template")
patch("m05-cases-hard-b.ts",
  '    distractors: ["DENSE", "ROW", "n", "c", "ASC"],',
  '    distractors: ["DENSE_RANK", "ROW_NUMBER", "n", "c", "ASC"],',
  "cs-2561 distractors")

print("round-2b complete")
