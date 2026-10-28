// Domain Mastery — Insurance & Claims Ops · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in
// dm-icl-seed.ts. Statements cite only probe-verified facts
// (scripts/r21-icl-world.ts). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_ICL_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Settled count",
    statement:
      "The claims book mixes open, under_review, approved, denied, closed and paid rows. Count how many claims have status 'paid'. Output a single column paid_count with one row.",
    code: `SELECT COUNT(*) AS paid_count
FROM claims
WHERE status = 'paid';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "Progressive",
    title: "The open board",
    statement:
      "Adjusters work the live pipeline top-down. List the claims with status 'open': claim_id, claim_number, claim_type, filed_date, ordered by claim_id ascending.",
    code: `SELECT claim_id, claim_number, claim_type, filed_date
FROM claims
WHERE status = 'open'
ORDER BY claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Allstate",
    title: "Line inventory",
    statement:
      "List every distinct claim_type in the claims table, one per row, ordered alphabetically. Single column: claim_type.",
    code: `SELECT DISTINCT claim_type
FROM claims
ORDER BY claim_type ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Travelers",
    title: "Status census",
    statement:
      "Count the claims per status. Output status and claim_count, ordered by claim_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS claim_count
FROM claims
GROUP BY status
ORDER BY claim_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Carrier roster",
    statement:
      "List the full carrier roster: carrier_id, name, code, hq_city, founded, ordered by carrier_id ascending. Two of these six are the pack's home carriers.",
    code: `SELECT carrier_id, name, code, hq_city, founded
FROM carriers
ORDER BY carrier_id ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "Claims per carrier",
    statement:
      "Count the claims per carrier. Output carrier_id and claim_count, ordered by claim_count descending, then carrier_id ascending.",
    code: `SELECT carrier_id, COUNT(*) AS claim_count
FROM claims
GROUP BY carrier_id
ORDER BY claim_count DESC, carrier_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Adjuster directory",
    statement:
      "List the adjusters: adjuster_id, name, team, region, hired_on, ordered by adjuster_id ascending. One of the eight closed exactly one hundred claims.",
    code: `SELECT adjuster_id, name, team, region, hired_on
FROM adjusters
ORDER BY adjuster_id ASC;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "Progressive",
    title: "Policy mix",
    statement:
      "Count the policies per policy_type. Output policy_type and policy_count, ordered by policy_count descending, then policy_type ascending.",
    code: `SELECT policy_type, COUNT(*) AS policy_count
FROM policies
GROUP BY policy_type
ORDER BY policy_count DESC, policy_type ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Allstate",
    title: "SIU caseload",
    statement:
      "Count the SIU cases per verdict. Output verdict and case_count, ordered by case_count descending, then verdict ascending. The open rows are the ones still burning.",
    code: `SELECT verdict, COUNT(*) AS case_count
FROM siu_cases
GROUP BY verdict
ORDER BY case_count DESC, verdict ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Travelers",
    title: "The Kessler cluster",
    statement:
      "One holder stands behind the ring. List the Kessler Holdings policies: policy_id, policy_number, carrier_id, policy_type, ordered by policy_id ascending.",
    code: `SELECT policy_id, policy_number, carrier_id, policy_type
FROM policies
WHERE holder_name = 'Kessler Holdings'
ORDER BY policy_id ASC;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Referral wall",
    statement:
      "The SIU referral rule fires at a fraud risk score of 60. Count the claims with fraud_risk_score >= 60. One column: referral_count. Two claims sit EXACTLY on the line.",
    code: `SELECT COUNT(*) AS referral_count
FROM claims
WHERE fraud_risk_score >= 60;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "Rails census",
    statement:
      "Count the payments per method. Output method and payment_count, ordered by payment_count descending, then method ascending.",
    code: `SELECT method, COUNT(*) AS payment_count
FROM payments
GROUP BY method
ORDER BY payment_count DESC, method ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "Lemonade",
    title: "The whale payment",
    statement:
      "One settlement dwarfs the book. List the payments of exactly 100000000 cents: payment_id, claim_id, amount_cents, paid_on, ordered by payment_id ascending.",
    code: `SELECT payment_id, claim_id, amount_cents, paid_on
FROM payments
WHERE amount_cents = 100000000
ORDER BY payment_id ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "Progressive",
    title: "Team load",
    statement:
      "Count the claims per adjuster team. Output team and claim_count, ordered by claim_count descending, then team ascending.",
    code: `SELECT a.team, COUNT(*) AS claim_count
FROM claims c
JOIN adjusters a ON a.adjuster_id = c.adjuster_id
GROUP BY a.team
ORDER BY claim_count DESC, a.team ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Allstate",
    title: "The ring window",
    statement:
      "Seven claim numbers run without a gap. List the claims whose claim_number is between 'RC-4471' and 'RC-4477' inclusive: claim_id, claim_number, claim_type, status, ordered by claim_id ascending.",
    code: `SELECT claim_id, claim_number, claim_type, status
FROM claims
WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'
ORDER BY claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Travelers",
    title: "Reopened before",
    statement:
      "Reopens are a service failure signal. Count the claims with reopen_count > 0. One column: reopened_count.",
    code: `SELECT COUNT(*) AS reopened_count
FROM claims
WHERE reopen_count > 0;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Payment rails state",
    statement:
      "Count the payments per status. Output status and payment_count, ordered by payment_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS payment_count
FROM payments
GROUP BY status
ORDER BY payment_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "Premium book",
    statement:
      "Compute the average premium per policy type, rounded to 0 dp. Output policy_type and avg_premium, ordered by avg_premium descending, then policy_type ascending.",
    code: `SELECT policy_type, ROUND(AVG(premium_cents), 0) AS avg_premium
FROM policies
GROUP BY policy_type
ORDER BY avg_premium DESC, policy_type ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Adjuster map",
    statement:
      "List the distinct regions adjusters work in, one per row, ordered alphabetically. Single column: region.",
    code: `SELECT DISTINCT region
FROM adjusters
ORDER BY region ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "Progressive",
    title: "March burst",
    statement:
      "The ring filed in a tight March window. Count the claims filed in March 2026 (filed_date between '2026-03-01' and '2026-03-31'). One column: march_count.",
    code: `SELECT COUNT(*) AS march_count
FROM claims
WHERE filed_date BETWEEN '2026-03-01' AND '2026-03-31';`,
    order: "exact",
  },
  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Travelers",
    title: "Paid-type board",
    statement:
      "Sum the settled payments (status 'paid') per claim_type. Output claim_type and paid_total, ordered by paid_total descending, then claim_type ascending. Property leads on the whale's back alone.",
    code: `SELECT c.claim_type, SUM(p.amount_cents) AS paid_total
FROM payments p
JOIN claims c ON c.claim_id = p.claim_id
WHERE p.status = 'paid'
GROUP BY c.claim_type
ORDER BY paid_total DESC, c.claim_type ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "The ex-whale flip",
    statement:
      "Exclude the 100000000 whale (claim 130) and sum paid payments per claim_type again. Output claim_type and paid_total, ordered by paid_total descending, then claim_type ascending. The board flips: liability takes the crown.",
    code: `SELECT c.claim_type, SUM(p.amount_cents) AS paid_total
FROM payments p
JOIN claims c ON c.claim_id = p.claim_id
WHERE p.status = 'paid' AND c.claim_id != 130
GROUP BY c.claim_type
ORDER BY paid_total DESC, c.claim_type ASC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "Whale dossier",
    statement:
      "One row: the whale's amount, its share of the paid book rounded to 2 dp, and the ex-whale liability total. Output whale_amount, whale_share, liability_ex_whale. The share is 45.29 and liability lands at 61300000.",
    code: `SELECT
  (SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') AS whale_amount,
  ROUND((SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') * 100.0 /
        (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,
  (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id
    WHERE p.status = 'paid' AND c.claim_id != 130 AND c.claim_type = 'liability') AS liability_ex_whale;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Carrier exposure",
    statement:
      "Sum the paid payments per carrier — every carrier stays on the board even with zero settled cents. Output carrier name and paid_total, ordered by paid_total descending, then name ascending.",
    code: `SELECT cr.name, COALESCE(SUM(p.amount_cents), 0) AS paid_total
FROM carriers cr
LEFT JOIN claims c ON c.carrier_id = cr.carrier_id
LEFT JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'
GROUP BY cr.carrier_id, cr.name
ORDER BY paid_total DESC, cr.name ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Progressive",
    title: "Wrap-up board",
    statement:
      "Count terminal claims (status in paid/closed/denied) per adjuster — every adjuster stays listed even at zero. Output adjuster name and closed_count, ordered by closed_count descending, then name ascending. Ivy Chen closed EXACTLY 100.",
    code: `SELECT a.name, COUNT(c.claim_id) AS closed_count
FROM adjusters a
LEFT JOIN claims c ON c.adjuster_id = a.adjuster_id
  AND c.status IN ('paid', 'closed', 'denied')
GROUP BY a.adjuster_id, a.name
ORDER BY closed_count DESC, a.name ASC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Allstate",
    title: "Wrap-up rate",
    statement:
      "Wrap-up rate is terminal claims over total handled, in percent, rounded to 1 dp. Output adjuster name and wrap_rate, ordered by wrap_rate descending, then name ascending.",
    code: `SELECT a.name,
  ROUND(COUNT(CASE WHEN c.status IN ('paid', 'closed', 'denied') THEN 1 END) * 100.0 / COUNT(c.claim_id), 1) AS wrap_rate
FROM adjusters a
LEFT JOIN claims c ON c.adjuster_id = a.adjuster_id
GROUP BY a.adjuster_id, a.name
ORDER BY wrap_rate DESC, a.name ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "Travelers",
    title: "Referral outcomes",
    statement:
      "Every claim at FRS >= 60 has an SIU case. Count the referred claims per SIU verdict. Output verdict and claim_count, ordered by claim_count descending, then verdict ascending.",
    code: `SELECT s.verdict, COUNT(*) AS claim_count
FROM claims c
JOIN siu_cases s ON s.claim_id = c.claim_id
WHERE c.fraud_risk_score >= 60
GROUP BY s.verdict
ORDER BY claim_count DESC, s.verdict ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "The 60 line",
    statement:
      "One row, two counts of the same wall: claims at FRS >= 60 and claims at FRS > 60. Output referral_inclusive, referral_strict. The two claims sitting EXACTLY on 60 make it 12 vs 10.",
    code: `SELECT
  COUNT(CASE WHEN fraud_risk_score >= 60 THEN 1 END) AS referral_inclusive,
  COUNT(CASE WHEN fraud_risk_score > 60 THEN 1 END) AS referral_strict
FROM claims;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "Aging buckets",
    statement:
      "Bucket the live pipeline (status in open/under_review/approved) by age at the 2026-07-01 as-of: '0-30', '31-60', '61-90', '91+' days since filing. Output bucket and claim_count ordered by bucket ascending. The 61-90 bucket is empty — an honest zero row.",
    code: `WITH buckets(bucket) AS (
  VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')
)
SELECT b.bucket, COUNT(c.claim_id) AS claim_count
FROM buckets b
LEFT JOIN claims c
  ON c.status IN ('open', 'under_review', 'approved')
 AND CASE
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 30 THEN '0-30'
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 60 THEN '31-60'
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 90 THEN '61-90'
    ELSE '91+'
  END = b.bucket
GROUP BY b.bucket
ORDER BY b.bucket ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Boundary dossier",
    statement:
      "Three pipeline claims sit EXACTLY on the 30, 60 and 91 day lines at the as-of. List them: claim_id, filed_date, aging days as aging_days, ordered by aging_days ascending.",
    code: `SELECT claim_id, filed_date,
  CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) AS aging_days
FROM claims
WHERE status IN ('open', 'under_review', 'approved')
  AND CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) IN (30, 60, 91)
ORDER BY aging_days ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Progressive",
    title: "Reopen board",
    statement:
      "List the claims with reopen_count >= 6: claim_id, claim_number, reopen_count, status, ordered by reopen_count descending, then claim_id ascending. One sits EXACTLY on the ceiling of 6.",
    code: `SELECT claim_id, claim_number, reopen_count, status
FROM claims
WHERE reopen_count >= 6
ORDER BY reopen_count DESC, claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Allstate",
    title: "Ceiling split",
    statement:
      "One row, two counts: claims with reopen_count >= 6 and claims with reopen_count > 6. Output ceiling_inclusive, ceiling_strict. The claim EXACTLY at 6 makes it 2 vs 1.",
    code: `SELECT
  COUNT(CASE WHEN reopen_count >= 6 THEN 1 END) AS ceiling_inclusive,
  COUNT(CASE WHEN reopen_count > 6 THEN 1 END) AS ceiling_strict
FROM claims;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Travelers",
    title: "The leak",
    statement:
      "Claim 44's 9800000 cleared while its SIU case was still open. Find every settled payment (status 'paid') on a claim whose SIU verdict is 'open': claim_id, amount_cents, paid_on, ordered by claim_id ascending. Exactly one row — the leak.",
    code: `SELECT p.claim_id, p.amount_cents, p.paid_on
FROM payments p
JOIN siu_cases s ON s.claim_id = p.claim_id
WHERE p.status = 'paid' AND s.verdict = 'open'
ORDER BY p.claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "Recoverable savings",
    statement:
      "Savings are payments you could still stop — pending rows — on claims whose SIU case is open. Sum them across the book. One column: recoverable_savings. The leak already cleared, so this is a hard 0.",
    code: `SELECT COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_cents ELSE 0 END), 0) AS recoverable_savings
FROM payments p
JOIN siu_cases s ON s.claim_id = p.claim_id
WHERE s.verdict = 'open';`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "Ring clocks",
    statement:
      "The ring's seven claims keep three SLA clocks. Average first_contact_days, decision_days and payment_days across claims RC-4471..RC-4477 (NULLs excluded). Output avg_contact, avg_decision, avg_payment — EXACTLY 7, 4 and 6.",
    code: `SELECT
  ROUND(AVG(first_contact_days), 2) AS avg_contact,
  ROUND(AVG(decision_days), 2) AS avg_decision,
  ROUND(AVG(payment_days), 2) AS avg_payment
FROM claims
WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477';`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Ring risk ladder",
    statement:
      "List the ring claims by fraud risk: claim_number, fraud_risk_score, status, ordered by fraud_risk_score descending, then claim_number ascending. Every one of them cleared the 60 wall.",
    code: `SELECT claim_number, fraud_risk_score, status
FROM claims
WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'
ORDER BY fraud_risk_score DESC, claim_number ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Progressive",
    title: "The contiguous registry",
    statement:
      "Prove the ring's numbers run without a gap: GROUP_CONCAT the claim numbers of claims RC-4471..RC-4477 in numeric order. Single row, single column: ring_registry.",
    code: `SELECT GROUP_CONCAT(claim_number, ',') AS ring_registry
FROM (
  SELECT claim_number FROM claims
  WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'
  ORDER BY claim_id ASC
);`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Allstate",
    title: "Filing velocity",
    statement:
      "Same-policy claims filed within 300 seconds of each other are a velocity signal. Count the unordered pairs (a.claim_id < b.claim_id) with a filing gap <= 300 seconds. One column: velocity_pairs. Two pairs.",
    code: `SELECT COUNT(*) AS velocity_pairs
FROM claims a
JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id
WHERE ABS(b.filed_ts - a.filed_ts) <= 300;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "Travelers",
    title: "Strict velocity",
    statement:
      "Same wall, strict edge: count the same-policy pairs filed LESS than 300 seconds apart. One column: velocity_strict. One of the two pairs sits EXACTLY on the line and drops out.",
    code: `SELECT COUNT(*) AS velocity_strict
FROM claims a
JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id
WHERE ABS(b.filed_ts - a.filed_ts) < 300;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "Velocity dossier",
    statement:
      "List the velocity pairs themselves: a.claim_id, b.claim_id, and the gap in seconds, ordered by gap ascending, then a.claim_id ascending. The 180s pair leads; the 300s pair rides the line.",
    code: `SELECT a.claim_id AS first_claim, b.claim_id AS second_claim,
  ABS(b.filed_ts - a.filed_ts) AS gap_seconds
FROM claims a
JOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id
WHERE ABS(b.filed_ts - a.filed_ts) <= 300
ORDER BY gap_seconds ASC, first_claim ASC;`,
    order: "exact",
  },
  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Contact clock by team",
    statement:
      "Average first_contact_days per adjuster team over claims that have been contacted. Output team and avg_contact rounded to 2 dp, ordered by avg_contact ascending, then team ascending.",
    code: `SELECT a.team, ROUND(AVG(c.first_contact_days), 2) AS avg_contact
FROM claims c
JOIN adjusters a ON a.adjuster_id = c.adjuster_id
WHERE c.first_contact_days IS NOT NULL
GROUP BY a.team
ORDER BY avg_contact ASC, a.team ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Decision clock by line",
    statement:
      "Average decision_days per claim_type over decided claims. Output claim_type and avg_decision rounded to 2 dp, ordered by avg_decision ascending, then claim_type ascending.",
    code: `SELECT claim_type, ROUND(AVG(decision_days), 2) AS avg_decision
FROM claims
WHERE decision_days IS NOT NULL
GROUP BY claim_type
ORDER BY avg_decision ASC, claim_type ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Progressive",
    title: "Payment clock by line",
    statement:
      "Average payment_days per claim_type over settled claims. Output claim_type and avg_payment rounded to 2 dp, ordered by avg_payment descending, then claim_type ascending.",
    code: `SELECT claim_type, ROUND(AVG(payment_days), 2) AS avg_payment
FROM claims
WHERE payment_days IS NOT NULL
GROUP BY claim_type
ORDER BY avg_payment DESC, claim_type ASC;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Allstate",
    title: "Region load",
    statement:
      "Count the claims per adjuster region. Output region and claim_count, ordered by claim_count descending, then region ascending.",
    code: `SELECT a.region, COUNT(*) AS claim_count
FROM claims c
JOIN adjusters a ON a.adjuster_id = c.adjuster_id
GROUP BY a.region
ORDER BY claim_count DESC, a.region ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Travelers",
    title: "Premium per carrier",
    statement:
      "Sum the written premium per carrier. Output carrier name and premium_total, ordered by premium_total descending, then name ascending.",
    code: `SELECT cr.name, SUM(po.premium_cents) AS premium_total
FROM carriers cr
LEFT JOIN policies po ON po.carrier_id = cr.carrier_id
GROUP BY cr.carrier_id, cr.name
ORDER BY premium_total DESC, cr.name ASC;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "Filing spine",
    statement:
      "Count the claims per filing month (strftime '%Y-%m'). Output month and claim_count, ordered by month ascending. Five months appear — February is the gap an honest calendar spine would expose.",
    code: `SELECT strftime('%Y-%m', filed_date) AS month, COUNT(*) AS claim_count
FROM claims
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Loss-to-file lag",
    statement:
      "How long after the loss do claims get filed? Compute the average of filed_date minus loss_date in days, rounded to 1 dp, across the whole book. One column: avg_lag_days.",
    code: `SELECT ROUND(AVG(julianday(filed_date) - julianday(loss_date)), 1) AS avg_lag_days
FROM claims;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Referrals per carrier",
    statement:
      "Count the SIU-referred claims (FRS >= 60) per carrier — every carrier stays listed, even with zero referrals. Output carrier name and referral_count, ordered by referral_count descending, then name ascending.",
    code: `SELECT cr.name, COUNT(CASE WHEN c.fraud_risk_score >= 60 THEN 1 END) AS referral_count
FROM carriers cr
LEFT JOIN claims c ON c.carrier_id = cr.carrier_id
GROUP BY cr.carrier_id, cr.name
ORDER BY referral_count DESC, cr.name ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Progressive",
    title: "Payment ladder",
    statement:
      "For each payment status: the row count and the cents total. Output status, payment_count, cents_total, ordered by cents_total descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS payment_count, SUM(amount_cents) AS cents_total
FROM payments
GROUP BY status
ORDER BY cents_total DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Allstate",
    title: "Rails of the paid book",
    statement:
      "Sum the settled payments (status 'paid') per method. Output method and paid_total, ordered by paid_total descending, then method ascending.",
    code: `SELECT method, SUM(amount_cents) AS paid_total
FROM payments
WHERE status = 'paid'
GROUP BY method
ORDER BY paid_total DESC, method ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "Travelers",
    title: "The flip memo",
    statement:
      "One row telling the whole whale story: property's paid total with the whale, the whale's share rounded to 2 dp, and property's paid total without it. Output property_paid, whale_share, property_ex_whale. The second column reads 45.29 and the third a hard 0 — property IS the whale.",
    code: `SELECT
  (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id
    WHERE p.status = 'paid' AND c.claim_type = 'property') AS property_paid,
  ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id
    WHERE p.status = 'paid' AND c.claim_id = 130) * 100.0 /
        (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,
  (SELECT COALESCE(SUM(p.amount_cents), 0) FROM payments p JOIN claims c ON c.claim_id = p.claim_id
    WHERE p.status = 'paid' AND c.claim_type = 'property' AND c.claim_id != 130) AS property_ex_whale;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "Ring vs book",
    statement:
      "One row: the ring's settled total (claims RC-4471..RC-4477) and the rest of the book's. Output ring_paid, book_paid_ex_ring. Four of the seven ring claims settled for 13000000.",
    code: `SELECT
  COALESCE(SUM(CASE WHEN c.claim_number BETWEEN 'RC-4471' AND 'RC-4477' THEN p.amount_cents END), 0) AS ring_paid,
  COALESCE(SUM(CASE WHEN c.claim_number NOT BETWEEN 'RC-4471' AND 'RC-4477' THEN p.amount_cents END), 0) AS book_paid_ex_ring
FROM payments p
JOIN claims c ON c.claim_id = p.claim_id
WHERE p.status = 'paid';`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Clocks: ring vs rest",
    statement:
      "Average the three SLA clocks for the ring and for everything else, in one row each. Output cohort, avg_contact, avg_decision, avg_payment (2 dp), ordered by cohort ascending ('book' before 'ring'). The ring row reads 7, 4, 6.",
    code: `SELECT
  CASE WHEN c.claim_number BETWEEN 'RC-4471' AND 'RC-4477' THEN 'ring' ELSE 'book' END AS cohort,
  ROUND(AVG(c.first_contact_days), 2) AS avg_contact,
  ROUND(AVG(c.decision_days), 2) AS avg_decision,
  ROUND(AVG(c.payment_days), 2) AS avg_payment
FROM claims c
GROUP BY cohort
ORDER BY cohort ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Settlement curve",
    statement:
      "Build the running settlement curve: per payment month (paid_on), the month's settled total and the running total, settled payments only, ordered by month ascending.",
    code: `SELECT month, month_total,
  SUM(month_total) OVER (ORDER BY month) AS running_total
FROM (
  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS month_total
  FROM payments
  WHERE status = 'paid'
  GROUP BY month
)
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Progressive",
    title: "Adjuster terminal matrix",
    statement:
      "Per adjuster: counts of paid, denied and closed claims. Output adjuster name, paid_count, denied_count, closed_count, ordered by adjuster_id ascending. Ivy's row carries the book's weight.",
    code: `SELECT a.name,
  COUNT(CASE WHEN c.status = 'paid' THEN 1 END) AS paid_count,
  COUNT(CASE WHEN c.status = 'denied' THEN 1 END) AS denied_count,
  COUNT(CASE WHEN c.status = 'closed' THEN 1 END) AS closed_count
FROM adjusters a
LEFT JOIN claims c ON c.adjuster_id = a.adjuster_id
GROUP BY a.adjuster_id, a.name
ORDER BY a.adjuster_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Allstate",
    title: "Dark carriers",
    statement:
      "Carriers with no SIU referrals at all — the honest-zero board. Count FRS >= 60 claims per carrier but keep every carrier row. Output carrier name, referral_count, ordered by referral_count ascending, then name ascending. The zeros sort first.",
    code: `SELECT cr.name, COUNT(CASE WHEN c.fraud_risk_score >= 60 THEN 1 END) AS referral_count
FROM carriers cr
LEFT JOIN claims c ON c.carrier_id = cr.carrier_id
GROUP BY cr.carrier_id, cr.name
ORDER BY referral_count ASC, cr.name ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Travelers",
    title: "Aging exposure",
    statement:
      "Money parked in the pipeline: sum the pipeline demand (status in open/under_review/approved) per aging bucket at the as-of, buckets '0-30' / '31-60' / '61-90' / '91+'. Output bucket and demand_total, ordered by bucket ascending. The empty 61-90 bucket sums to 0.",
    code: `WITH buckets(bucket) AS (
  VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')
)
SELECT b.bucket, COALESCE(SUM(c.amount_cents), 0) AS demand_total
FROM buckets b
LEFT JOIN claims c
  ON c.status IN ('open', 'under_review', 'approved')
 AND CASE
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 30 THEN '0-30'
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 60 THEN '31-60'
    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 90 THEN '61-90'
    ELSE '91+'
  END = b.bucket
GROUP BY b.bucket
ORDER BY b.bucket ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "SIU cycle time",
    statement:
      "How long does an SIU case take to resolve? Average confirmed_on minus opened_on in days per verdict, resolved cases only (confirmed_on not null). Output verdict and avg_cycle_days rounded to 1 dp, ordered by avg_cycle_days descending, then verdict ascending.",
    code: `SELECT verdict,
  ROUND(AVG(julianday(confirmed_on) - julianday(opened_on)), 1) AS avg_cycle_days
FROM siu_cases
WHERE confirmed_on IS NOT NULL
GROUP BY verdict
ORDER BY avg_cycle_days DESC, verdict ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Leak forensics",
    statement:
      "The leak, fully documented: claim 44's number, demand, the payment that cleared, the day it cleared, and how many days AFTER the SIU case opened that was. Output claim_number, amount_cents, paid_amount, paid_on, days_after_siu_open. The payment went out 2 days after SIU opened the file.",
    code: `SELECT c.claim_number, c.amount_cents, p.amount_cents AS paid_amount,
  p.paid_on,
  CAST(julianday(p.paid_on) - julianday(s.opened_on) AS INTEGER) AS days_after_siu_open
FROM claims c
JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'
JOIN siu_cases s ON s.claim_id = c.claim_id
WHERE c.claim_id = 44;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Executive memo",
    statement:
      "The whole operation in one row: the settled total, the whale's share (2 dp), the referral count at the 60 wall, the still-open SIU cases, and the leaked cents. Output paid_total, whale_share, referrals, open_siu, leaked_cents — 220800000, 45.29, 12, 3, 9800000.",
    code: `SELECT
  (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid') AS paid_total,
  ROUND((SELECT SUM(p.amount_cents) FROM payments p WHERE p.status = 'paid' AND p.claim_id = 130) * 100.0 /
        (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,
  (SELECT COUNT(*) FROM claims WHERE fraud_risk_score >= 60) AS referrals,
  (SELECT COUNT(*) FROM siu_cases WHERE verdict = 'open') AS open_siu,
  (SELECT SUM(p.amount_cents) FROM payments p JOIN siu_cases s ON s.claim_id = p.claim_id
    WHERE p.status = 'paid' AND s.verdict = 'open') AS leaked_cents;`,
    order: "exact",
  },
];
