#!/usr/bin/env python3
# Fixes the 19 mutant-collision MCQs in dm-icl-mcqs.ts (round 21 redo).
p = "/home/z/my-project/src/lib/leetcode/content/dm-icl-mcqs.ts"
s = open(p).read()
applied = []

def rep(tag, old, new):
    global s
    n = s.count(old)
    assert n == 1, f"{tag}: found x{n}"
    s = s.replace(old, new)
    applied.append(tag)

# m04: recovered-clawback mutant replaces duplicate 9800000 probe
rep("m04a",
    "      `SELECT payment_id, claim_id, amount_cents, paid_on FROM payments WHERE amount_cents = 9800000;`,",
    "      `SELECT payment_id, claim_id, amount_cents, paid_on FROM payments WHERE status = 'recovered';`,")
rep("m04b",
    '      "The whale is the one 100000000 settlement — payment 77 on claim 130, wired 2026-05-01. The mutants surface the leak payment (9800000 on claim 44) and the pending rail.",',
    '      "The whale is the one 100000000 settlement — payment 77 on claim 130, wired 2026-05-01. The mutants surface the leak payment (9800000 on claim 44), the pending rail, and the single recovered clawback.",')

# m06: distinct-count window mutants
rep("m06a",
    "      `SELECT COUNT(*) AS n FROM claims WHERE claim_number BETWEEN 'RC-4470' AND 'RC-4476';`,\n      `SELECT COUNT(*) AS n FROM claims WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4478';`,\n      `SELECT COUNT(*) AS n FROM claims WHERE claim_number = 'RC-4474';`,",
    "      `SELECT COUNT(*) AS n FROM claims WHERE claim_number BETWEEN 'RC-4470' AND 'RC-4477';`,\n      `SELECT COUNT(*) AS n FROM claims WHERE claim_number = 'RC-4474';`,\n      `SELECT COUNT(*) AS n FROM claims WHERE claim_number LIKE 'RC-447%';`,")
rep("m06b",
    '      "The ring window RC-4471..RC-4477 holds seven claims. Shifting the window one number either way still returns seven rows — but seven DIFFERENT rows; the mutants that move the boundaries return different claims, and the single-number probe returns one.",',
    '      "The ring window RC-4471..RC-4477 holds seven claims. Widening one number left (RC-4470 joins) returns 8, the single-number probe returns 1, and the RC-447% prefix sweep returns 79 — the whole RC-4401..RC-4479 block.",')

# m10: count-ascending census collides differently
rep("m10a",
    "      `SELECT verdict, COUNT(*) AS n FROM siu_cases GROUP BY verdict ORDER BY verdict ASC;`,",
    "      `SELECT verdict, COUNT(*) AS n FROM siu_cases GROUP BY verdict ORDER BY n ASC, verdict ASC;`,")
rep("m10b",
    '      "Cleared leads the verdict board (5), then confirmed (4), then open (3). The mutants reorder the same rows alphabetically (cleared still first — but the tail order flips), or collapse to single counts.",',
    '      "Cleared leads the verdict board (5), then confirmed (4), then open (3). The mutants flip to count-ascending (open first), collapse to the open count (3), or count all cases (12).",')

# m20: pending-only probe for claim 44 (no rows)
rep("m20",
    "      `SELECT claim_id, amount_cents, paid_on FROM payments WHERE claim_id = 44;`,",
    "      `SELECT claim_id, amount_cents, paid_on FROM payments WHERE claim_id = 44 AND status = 'pending';`,")

# m23: demand-sum mutant instead of identical incl-whale
rep("m23a",
    "      `SELECT (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id WHERE p.status = 'paid' AND c.claim_type = 'liability') AS v;`,",
    "      `SELECT SUM(amount_cents) AS v FROM claims WHERE claim_type = 'liability' AND claim_id != 130;`,")
rep("m23b",
    '      "Ex-whale liability is 61300000. Including the whale\'s... wait, the whale is property — the second mutant shows liability WITH nothing changed (same 61300000? No — claim 130 is property, so including it changes nothing there). The real contrast: injury 28500000, theft 17000000 — and this is why dm-verify\'s 4-way check matters.",',
    '      "Ex-whale liability settles at 61300000. The mutants read the liability demand book (settled or not), then the ex-whale injury (28500000) and theft (17000000) lines.",')

# m24: inner-join-everything mutant
rep("m24a",
    "      `SELECT a.name, COUNT(c.claim_id) AS n FROM adjusters a JOIN claims c ON c.adjuster_id = a.adjuster_id WHERE c.status IN ('paid','closed','denied') GROUP BY a.adjuster_id, a.name ORDER BY n DESC, a.name ASC;`,",
    "      `SELECT a.name, COUNT(c.claim_id) AS n FROM adjusters a JOIN claims c ON c.adjuster_id = a.adjuster_id GROUP BY a.adjuster_id, a.name ORDER BY n DESC, a.name ASC;`,")
rep("m24b",
    '      "The wrap-up board opens with Ivy Chen at EXACTLY 100. The mutants drop the status filter (Ivy\'s whole load including live files), invert to the open pipeline, and inner-join the terminal book (same totals, no zero rows for the bench).",',
    '      "The wrap-up board opens with Ivy Chen at EXACTLY 100. The mutants count her whole load including live files, invert to the open pipeline only, and inner-join everything (the counts blow past 100).",')

# m28: under_review-only spine instead of open-only (same 5)
rep("m28",
    "      `WITH buckets(bucket) AS (VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')) SELECT b.bucket, COUNT(c.claim_id) AS n FROM buckets b LEFT JOIN claims c ON c.status = 'open' AND CASE",
    "      `WITH buckets(bucket) AS (VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')) SELECT b.bucket, COUNT(c.claim_id) AS n FROM buckets b LEFT JOIN claims c ON c.status = 'under_review' AND CASE")

# m30: >7 (no rows) + slim two-column board
rep("m30a",
    "      `SELECT claim_id, claim_number, reopen_count, status FROM claims WHERE reopen_count >= 5 ORDER BY reopen_count DESC, claim_id ASC;`,\n      `SELECT claim_id, claim_number, reopen_count, status FROM claims WHERE reopen_count = 6 ORDER BY claim_id ASC;`,",
    "      `SELECT claim_id, claim_number, reopen_count, status FROM claims WHERE reopen_count > 7 ORDER BY reopen_count DESC, claim_id ASC;`,\n      `SELECT claim_id, reopen_count FROM claims WHERE reopen_count >= 6 ORDER BY reopen_count DESC, claim_id ASC;`,")
rep("m30b",
    '      "Two claims clear the ceiling: claim 92 at 7 and claim 5 EXACTLY at 6. Strict > 6 keeps only claim 92; >= 5 pulls in a third row; the equality probe isolates claim 5.",',
    '      "Two claims clear the ceiling: claim 92 at 7 and claim 5 EXACTLY at 6. Strict > 6 keeps only claim 92; > 7 returns nothing; the slim two-column board keeps both rows in a different shape.",')

# m32: pending-on-open-SIU (0)
rep("m32",
    "      `SELECT COUNT(*) AS n FROM payments p JOIN siu_cases s ON s.claim_id = p.claim_id WHERE s.verdict = 'open';`,",
    "      `SELECT COUNT(*) AS n FROM payments p JOIN siu_cases s ON s.claim_id = p.claim_id WHERE s.verdict = 'open' AND p.status = 'pending';`,")

# m34: min/max mutant instead of 0dp rounding (identical on exact ints)
rep("m34a",
    "      `SELECT ROUND(AVG(first_contact_days), 0) AS a, ROUND(AVG(decision_days), 0) AS b, ROUND(AVG(payment_days), 0) AS c FROM claims WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477';`,",
    "      `SELECT MIN(first_contact_days) AS a, MAX(decision_days) AS b, MAX(payment_days) AS c FROM claims WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477';`,")
rep("m34b",
    '      "The ring\'s three clocks average EXACTLY 7, 4 and 6 days. The mutants show the rest of the book\'s clocks, round to whole days, and take maxima instead of averages.",',
    '      "The ring\'s three clocks average EXACTLY 7, 4 and 6 days. The mutants show the rest of the book\'s slower clocks, then the ring\'s fastest contact and slowest decision/payment.",')

# m36: same-day sweep (more pairs) instead of <=600 (none)
rep("m36",
    "      `SELECT COUNT(*) AS n FROM claims a JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id WHERE ABS(b.filed_ts - a.filed_ts) <= 600;`,",
    "      `SELECT COUNT(*) AS n FROM claims a JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id WHERE ABS(b.filed_ts - a.filed_ts) <= 86400;`,")

# m38: <=180 single-pair mutant instead of signed gaps (identical here)
rep("m38",
    "      `SELECT a.claim_id AS x, b.claim_id AS y, (b.filed_ts - a.filed_ts) AS g FROM claims a JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id WHERE ABS(b.filed_ts - a.filed_ts) <= 300 ORDER BY g ASC, x ASC;`,",
    "      `SELECT a.claim_id AS x, b.claim_id AS y, ABS(b.filed_ts - a.filed_ts) AS g FROM claims a JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id WHERE ABS(b.filed_ts - a.filed_ts) <= 180 ORDER BY g ASC, x ASC;`,")

# m40: under_review-only boundary count (1)
rep("m40",
    "      `SELECT COUNT(*) AS n FROM claims WHERE CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) IN (30, 60, 91);`,",
    "      `SELECT COUNT(*) AS n FROM claims WHERE status = 'under_review' AND CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) IN (30, 60, 91);`,")

# m42: >=50 months (1)
rep("m42a",
    "      `SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', filed_date) AS m FROM claims GROUP BY m HAVING COUNT(*) >= 40);`,",
    "      `SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', filed_date) AS m FROM claims GROUP BY m HAVING COUNT(*) >= 50);`,")
rep("m42b",
    '      "Five filing months — February never happens in this book. The mutants keep only the 40+ claim months (3 survive), count settlement months (4), and count SIU opening months (3).",',
    '      "Five filing months — February never happens in this book. The mutants keep only the 50+ claim months (January alone), count settlement months (4), and count SIU opening months (3).",')

# m46: rebuild the whole mutant trio
rep("m46a",
    "      `SELECT COUNT(*) AS n FROM carriers cr LEFT JOIN claims c ON c.carrier_id = cr.carrier_id AND c.fraud_risk_score >= 60 GROUP BY cr.carrier_id HAVING COUNT(c.claim_id) > 0;`,\n      `SELECT COUNT(*) AS n FROM carriers;`,\n      `SELECT COUNT(DISTINCT carrier_id) AS n FROM claims WHERE fraud_risk_score >= 60;`,",
    "      `SELECT COALESCE(SUM(p.amount_cents), 0) AS n FROM carriers cr LEFT JOIN claims c ON c.carrier_id = cr.carrier_id LEFT JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid' WHERE cr.name = 'Bluepine Mutual';`,\n      `SELECT COUNT(*) AS n FROM claims WHERE fraud_risk_score >= 60;`,\n      `SELECT COUNT(*) AS n FROM policies po JOIN carriers cr ON cr.carrier_id = po.carrier_id WHERE cr.name = 'Bluepine Mutual';`,")
rep("m46b",
    '      "One carrier has never sent a referral — the dark-carrier honest zero (Bluepine Mutual). The mutants count the carriers WITH referrals, all carriers, and the distinct carriers among referred claims.",',
    '      "One carrier has never sent a referral — the dark-carrier honest zero (Bluepine Mutual). The mutants show Bluepine\'s own settled book (non-zero), the book-wide referral count (12), and Bluepine\'s policy shelf (6).",')

# m48: pending-on-referred (0)
rep("m48",
    "      `SELECT COUNT(*) AS n FROM claims c WHERE c.fraud_risk_score >= 60 AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.claim_id = c.claim_id AND p.status = 'paid');`,",
    "      `SELECT COUNT(*) AS n FROM claims c JOIN payments p ON p.claim_id = c.claim_id WHERE c.fraud_risk_score >= 60 AND p.status = 'pending';`,")

# m51: injury share (12.91) instead of duplicate whale share
rep("m51a",
    "      `SELECT ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id WHERE p.status = 'paid' AND c.claim_type = 'property') * 100.0 / (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS v;`,",
    "      `SELECT ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id WHERE p.status = 'paid' AND c.claim_id != 130 AND c.claim_type = 'injury') * 100.0 / (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS v;`,")
rep("m51b",
    '      "Ex-whale property share: 0.0 — property IS the whale. The mutants include it (45.29), swap in liability ex-whale (27.75), and isolate the whale itself (45.29 again).",',
    '      "Ex-whale property share: 0.0 — property IS the whale. The mutants show the with-whale share (45.29), the ex-whale injury share (12.91), and the whale isolated (45.29).",')

# m57: demand cents instead of payment-row count (invariant 77)
rep("m57a",
    "      `SELECT COUNT(*) AS v FROM payments WHERE status = 'paid';`,",
    "      `SELECT SUM(amount_cents) AS v FROM claims WHERE status = 'paid';`,")
rep("m57b",
    '      "77 claims settled. The mutants count the whole terminal book (120), the settled payment rows (also 77 — one payment per settled claim, a pack invariant), and the denials.",',
    '      "77 claims settled. The mutants count the whole terminal book (120), the paid claims\' demand cents (a seven-figure number), and the denials.",')

open(p, "w").write(s)
print(f"applied {len(applied)} fixes:", ", ".join(applied))
