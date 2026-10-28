// Domain Mastery — Insurance & Claims Ops · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r21-icl-world.ts).
import type { DmCase } from "../domain-packs";

export const DM_ICL_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Book health check",
    scenario:
      "Monday claims standup opens with the book: how much has settled, and how does the pipeline split?",
    steps: [
      { prompt: "Count settled claims (status 'paid'). One column: paid_count.", code: `SELECT COUNT(*) AS paid_count\nFROM claims\nWHERE status = 'paid';`, order: "exact" },
      { prompt: "Count claims per status. Output status and claim_count, ordered by claim_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS claim_count\nFROM claims\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Progressive",
    title: "Pipeline triage",
    scenario:
      "The morning triage wants the live files: what sits plainly open, and what is staged for review.",
    steps: [
      { prompt: "List open claims: claim_id, claim_number, claim_type, filed_date, ordered by claim_id ascending.", code: `SELECT claim_id, claim_number, claim_type, filed_date\nFROM claims\nWHERE status = 'open'\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Count claims per status in the live pipeline (open/under_review/approved). Output status and claim_count, ordered by claim_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS claim_count\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved')\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Allstate",
    title: "Carrier map",
    scenario:
      "The quarterly review starts with who writes what — and how the claim load lands.",
    steps: [
      { prompt: "List the carriers: carrier_id, name, code, hq_city, ordered by carrier_id ascending.", code: `SELECT carrier_id, name, code, hq_city\nFROM carriers\nORDER BY carrier_id ASC;`, order: "exact" },
      { prompt: "Count claims per carrier. Output carrier_id and claim_count, ordered by claim_count descending, then carrier_id ascending.", code: `SELECT carrier_id, COUNT(*) AS claim_count\nFROM claims\nGROUP BY carrier_id\nORDER BY claim_count DESC, carrier_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Travelers",
    title: "Adjuster bench",
    scenario:
      "HR wants the bench picture: who is on it, and how the claims spread across teams.",
    steps: [
      { prompt: "List the adjusters: adjuster_id, name, team, region, ordered by adjuster_id ascending.", code: `SELECT adjuster_id, name, team, region\nFROM adjusters\nORDER BY adjuster_id ASC;`, order: "exact" },
      { prompt: "Count claims per adjuster team. Output team and claim_count, ordered by claim_count descending, then team ascending.", code: `SELECT a.team, COUNT(*) AS claim_count\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nGROUP BY a.team\nORDER BY claim_count DESC, a.team ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Policy shelf",
    scenario:
      "Underwriting asks for the shelf: the policy lines, and where the premium pools.",
    steps: [
      { prompt: "Count policies per policy_type. Output policy_type and policy_count, ordered by policy_count descending, then policy_type ascending.", code: `SELECT policy_type, COUNT(*) AS policy_count\nFROM policies\nGROUP BY policy_type\nORDER BY policy_count DESC, policy_type ASC;`, order: "exact" },
      { prompt: "Compute the average premium per policy type, rounded to 0 dp. Output policy_type and avg_premium, ordered by avg_premium descending, then policy_type ascending.", code: `SELECT policy_type, ROUND(AVG(premium_cents), 0) AS avg_premium\nFROM policies\nGROUP BY policy_type\nORDER BY avg_premium DESC, policy_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "SIU docket",
    scenario:
      "The SIU captain opens the docket: every case, and how the verdicts stack.",
    steps: [
      { prompt: "List the SIU cases: siu_id, claim_id, opened_on, verdict, ordered by siu_id ascending.", code: `SELECT siu_id, claim_id, opened_on, verdict\nFROM siu_cases\nORDER BY siu_id ASC;`, order: "exact" },
      { prompt: "Count SIU cases per verdict. Output verdict and case_count, ordered by case_count descending, then verdict ascending.", code: `SELECT verdict, COUNT(*) AS case_count\nFROM siu_cases\nGROUP BY verdict\nORDER BY case_count DESC, verdict ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Referral census",
    scenario:
      "Before the fraud huddle: how many files crossed the 60 wall, and how many are strictly above it.",
    steps: [
      { prompt: "Count claims with fraud_risk_score >= 60. One column: referral_count.", code: `SELECT COUNT(*) AS referral_count\nFROM claims\nWHERE fraud_risk_score >= 60;`, order: "exact" },
      { prompt: "Count claims with fraud_risk_score > 60. One column: referral_strict.", code: `SELECT COUNT(*) AS referral_strict\nFROM claims\nWHERE fraud_risk_score > 60;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Progressive",
    title: "Payment rails",
    scenario:
      "Treasury wants the rails picture: counts by method, and the state of every payment.",
    steps: [
      { prompt: "Count payments per method. Output method and payment_count, ordered by payment_count descending, then method ascending.", code: `SELECT method, COUNT(*) AS payment_count\nFROM payments\nGROUP BY method\nORDER BY payment_count DESC, method ASC;`, order: "exact" },
      { prompt: "Count payments per status. Output status and payment_count, ordered by payment_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS payment_count\nFROM payments\nGROUP BY status\nORDER BY payment_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Allstate",
    title: "The whale sighting",
    scenario:
      "The largest settlement in book history needs its papers pulled.",
    steps: [
      { prompt: "List payments of exactly 100000000 cents: payment_id, claim_id, amount_cents, paid_on, ordered by payment_id ascending.", code: `SELECT payment_id, claim_id, amount_cents, paid_on\nFROM payments\nWHERE amount_cents = 100000000\nORDER BY payment_id ASC;`, order: "exact" },
      { prompt: "List claim 130's full header: claim_id, claim_number, claim_type, status, amount_cents, ordered by claim_id ascending.", code: `SELECT claim_id, claim_number, claim_type, status, amount_cents\nFROM claims\nWHERE claim_id = 130\nORDER BY claim_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Travelers",
    title: "Ring window pull",
    scenario:
      "The SIU analyst pulls the seven files behind RC-4471..RC-4477 before the forensics meeting.",
    steps: [
      { prompt: "List claims numbered RC-4471 through RC-4477: claim_id, claim_number, claim_type, status, ordered by claim_id ascending.", code: `SELECT claim_id, claim_number, claim_type, status\nFROM claims\nWHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Count claims per status inside that window. Output status and claim_count, ordered by claim_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS claim_count\nFROM claims\nWHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Reopen scan",
    scenario:
      "Service quality starts with the reopens: how many files came back, and which never will.",
    steps: [
      { prompt: "Count claims with reopen_count > 0. One column: reopened_count.", code: `SELECT COUNT(*) AS reopened_count\nFROM claims\nWHERE reopen_count > 0;`, order: "exact" },
      { prompt: "Count claims with reopen_count = 0. One column: never_reopened.", code: `SELECT COUNT(*) AS never_reopened\nFROM claims\nWHERE reopen_count = 0;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "Kessler pull",
    scenario:
      "The ring's stage: pull the Kessler Holdings policies and their claim traffic.",
    steps: [
      { prompt: "List Kessler Holdings policies: policy_id, policy_number, carrier_id, policy_type, ordered by policy_id ascending.", code: `SELECT policy_id, policy_number, carrier_id, policy_type\nFROM policies\nWHERE holder_name = 'Kessler Holdings'\nORDER BY policy_id ASC;`, order: "exact" },
      { prompt: "Count claims per policy_id for those policies. Output policy_id and claim_count, ordered by policy_id ascending.", code: `SELECT policy_id, COUNT(*) AS claim_count\nFROM claims\nWHERE policy_id IN (1, 2, 3)\nGROUP BY policy_id\nORDER BY policy_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Line inventory",
    scenario:
      "The product review opens with the claim lines the book actually writes.",
    steps: [
      { prompt: "List distinct claim types alphabetically. Single column: claim_type.", code: `SELECT DISTINCT claim_type\nFROM claims\nORDER BY claim_type ASC;`, order: "exact" },
      { prompt: "Count claims per claim_type. Output claim_type and claim_count, ordered by claim_count descending, then claim_type ascending.", code: `SELECT claim_type, COUNT(*) AS claim_count\nFROM claims\nGROUP BY claim_type\nORDER BY claim_count DESC, claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Progressive",
    title: "March recon",
    scenario:
      "The pattern analyst narrows in on March — the ring's filing month.",
    steps: [
      { prompt: "Count claims filed in March 2026. One column: march_count.", code: `SELECT COUNT(*) AS march_count\nFROM claims\nWHERE filed_date BETWEEN '2026-03-01' AND '2026-03-31';`, order: "exact" },
      { prompt: "Count March claims per claim_type. Output claim_type and claim_count, ordered by claim_count descending, then claim_type ascending.", code: `SELECT claim_type, COUNT(*) AS claim_count\nFROM claims\nWHERE filed_date BETWEEN '2026-03-01' AND '2026-03-31'\nGROUP BY claim_type\nORDER BY claim_count DESC, claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Allstate",
    title: "Contact coverage",
    scenario:
      "The SLA lead checks who has been contacted at all — and who is still waiting.",
    steps: [
      { prompt: "Count pipeline claims (open/under_review/approved) with first_contact_days IS NULL. One column: uncontacted.", code: `SELECT COUNT(*) AS uncontacted\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved') AND first_contact_days IS NULL;`, order: "exact" },
      { prompt: "Count pipeline claims with first_contact_days NOT NULL. One column: contacted.", code: `SELECT COUNT(*) AS contacted\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved') AND first_contact_days IS NOT NULL;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Travelers",
    title: "Lapsed shelf",
    scenario:
      "Underwriting hygiene: which policies are not active, and which carriers wrote them.",
    steps: [
      { prompt: "List policies with status != 'active': policy_id, policy_number, carrier_id, status, ordered by policy_id ascending.", code: `SELECT policy_id, policy_number, carrier_id, status\nFROM policies\nWHERE status != 'active'\nORDER BY policy_id ASC;`, order: "exact" },
      { prompt: "Count policies per status. Output status and policy_count, ordered by policy_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS policy_count\nFROM policies\nGROUP BY status\nORDER BY policy_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Meridian Mutual",
    title: "Region roster",
    scenario:
      "The ops offsite needs the footprint: which regions the adjusters cover, and the claim load behind each.",
    steps: [
      { prompt: "List distinct adjuster regions alphabetically. Single column: region.", code: `SELECT DISTINCT region\nFROM adjusters\nORDER BY region ASC;`, order: "exact" },
      { prompt: "Count adjusters per region. Output region and adjuster_count, ordered by adjuster_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS adjuster_count\nFROM adjusters\nGROUP BY region\nORDER BY adjuster_count DESC, region ASC;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Ridgeway",
    title: "Whale vs rest",
    scenario:
      "The CFO wants one number: the whale's share of everything settled.",
    steps: [
      { prompt: "Sum settled payments (status 'paid'). One column: paid_total.", code: `SELECT SUM(amount_cents) AS paid_total\nFROM payments\nWHERE status = 'paid';`, order: "exact" },
      { prompt: "Compute the whale's share of the paid book in percent, rounded to 2 dp. One column: whale_share.", code: `SELECT ROUND((SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') * 100.0 /\n  (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "Lemonade",
    title: "Pending rail",
    scenario:
      "The payment ops queue: what is still pending, and on which claims.",
    steps: [
      { prompt: "List pending payments: payment_id, claim_id, amount_cents, paid_on, ordered by payment_id ascending.", code: `SELECT payment_id, claim_id, amount_cents, paid_on\nFROM payments\nWHERE status = 'pending'\nORDER BY payment_id ASC;`, order: "exact" },
      { prompt: "Sum pending payment cents. One column: pending_total.", code: `SELECT SUM(amount_cents) AS pending_total\nFROM payments\nWHERE status = 'pending';`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "Progressive",
    title: "File-to-pay",
    scenario:
      "Ops wants the file-to-pay span on settled claims: the average, and the whale's own.",
    steps: [
      { prompt: "Average payment_days over settled claims (status 'paid'), rounded to 2 dp. One column: avg_pay_days.", code: `SELECT ROUND(AVG(payment_days), 2) AS avg_pay_days\nFROM claims\nWHERE status = 'paid';`, order: "exact" },
      { prompt: "List claim 130's payment_days. One column: whale_pay_days.", code: `SELECT payment_days AS whale_pay_days\nFROM claims\nWHERE claim_id = 130;`, order: "exact" },
    ],
  },
  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Allstate",
    title: "The type board",
    scenario:
      "The claims director wants the settled money by line — then the same board without the whale.",
    steps: [
      { prompt: "Sum settled payments per claim_type. Output claim_type and paid_total, ordered by paid_total descending, then claim_type ascending.", code: `SELECT c.claim_type, SUM(p.amount_cents) AS paid_total\nFROM payments p\nJOIN claims c ON c.claim_id = p.claim_id\nWHERE p.status = 'paid'\nGROUP BY c.claim_type\nORDER BY paid_total DESC, c.claim_type ASC;`, order: "exact" },
      { prompt: "Repeat, excluding claim 130. Output claim_type and paid_total, ordered by paid_total descending, then claim_type ascending.", code: `SELECT c.claim_type, SUM(p.amount_cents) AS paid_total\nFROM payments p\nJOIN claims c ON c.claim_id = p.claim_id\nWHERE p.status = 'paid' AND c.claim_id != 130\nGROUP BY c.claim_type\nORDER BY paid_total DESC, c.claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Travelers",
    title: "Whale dossier",
    scenario:
      "Board prep: the whale's amount, its share, and the ex-whale liability total in one row.",
    steps: [
      { prompt: "One row: whale_amount, whale_share (2 dp), liability_ex_whale. The share reads 45.29, liability lands at 61300000.", code: `SELECT\n  (SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') AS whale_amount,\n  ROUND((SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') * 100.0 /\n    (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,\n  (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_id != 130 AND c.claim_type = 'liability') AS liability_ex_whale;`, order: "exact" },
      { prompt: "One row: property_paid with the whale, whale_share (2 dp), property_ex_whale. The third column is the punchline: 0.", code: `SELECT\n  (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_type = 'property') AS property_paid,\n  ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_id = 130) * 100.0 /\n    (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,\n  (SELECT COALESCE(SUM(p.amount_cents), 0) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_type = 'property' AND c.claim_id != 130) AS property_ex_whale;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "Wrap-up review",
    scenario:
      "The ops manager reviews who closed what — counts first, then rates.",
    steps: [
      { prompt: "Count terminal claims per adjuster (paid/closed/denied), every adjuster listed. Output adjuster name and closed_count, ordered by closed_count descending, then name ascending.", code: `SELECT a.name, COUNT(c.claim_id) AS closed_count\nFROM adjusters a\nLEFT JOIN claims c ON c.adjuster_id = a.adjuster_id\n  AND c.status IN ('paid', 'closed', 'denied')\nGROUP BY a.adjuster_id, a.name\nORDER BY closed_count DESC, a.name ASC;`, order: "exact" },
      { prompt: "Compute the wrap-up rate per adjuster (terminal over handled, percent, 1 dp). Output adjuster name and wrap_rate, ordered by wrap_rate descending, then name ascending.", code: `SELECT a.name,\n  ROUND(COUNT(CASE WHEN c.status IN ('paid', 'closed', 'denied') THEN 1 END) * 100.0 / COUNT(c.claim_id), 1) AS wrap_rate\nFROM adjusters a\nLEFT JOIN claims c ON c.adjuster_id = a.adjuster_id\nGROUP BY a.adjuster_id, a.name\nORDER BY wrap_rate DESC, a.name ASC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "The 60 wall",
    scenario:
      "The SIU captain wants the wall quantified both ways, then the outcome mix behind it.",
    steps: [
      { prompt: "One row: referral_inclusive (>= 60) and referral_strict (> 60).", code: `SELECT\n  COUNT(CASE WHEN fraud_risk_score >= 60 THEN 1 END) AS referral_inclusive,\n  COUNT(CASE WHEN fraud_risk_score > 60 THEN 1 END) AS referral_strict\nFROM claims;`, order: "exact" },
      { prompt: "Count referred claims (FRS >= 60) per SIU verdict. Output verdict and claim_count, ordered by claim_count descending, then verdict ascending.", code: `SELECT s.verdict, COUNT(*) AS claim_count\nFROM claims c\nJOIN siu_cases s ON s.claim_id = c.claim_id\nWHERE c.fraud_risk_score >= 60\nGROUP BY s.verdict\nORDER BY claim_count DESC, s.verdict ASC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Aging the pipeline",
    scenario:
      "The ops review buckets the live pipeline at the July 1 as-of — spine included, empty bucket visible.",
    steps: [
      { prompt: "Bucket the pipeline by aging (0-30/31-60/61-90/91+), every bucket listed. Output bucket and claim_count, ordered by bucket ascending.", code: `WITH buckets(bucket) AS (\n  VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')\n)\nSELECT b.bucket, COUNT(c.claim_id) AS claim_count\nFROM buckets b\nLEFT JOIN claims c\n  ON c.status IN ('open', 'under_review', 'approved')\n AND CASE\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 30 THEN '0-30'\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 60 THEN '31-60'\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 90 THEN '61-90'\n    ELSE '91+'\n  END = b.bucket\nGROUP BY b.bucket\nORDER BY b.bucket ASC;`, order: "exact" },
      { prompt: "List the boundary rows EXACTLY at 30, 60 or 91 days: claim_id, filed_date, aging_days, ordered by aging_days ascending.", code: `SELECT claim_id, filed_date,\n  CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) AS aging_days\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved')\n  AND CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) IN (30, 60, 91)\nORDER BY aging_days ASC;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Progressive",
    title: "The leak file",
    scenario:
      "Internal audit pulls the leak: the payment that cleared on an open SIU case, and what could still be stopped.",
    steps: [
      { prompt: "List settled payments on claims whose SIU verdict is 'open': claim_id, amount_cents, paid_on, ordered by claim_id ascending.", code: `SELECT p.claim_id, p.amount_cents, p.paid_on\nFROM payments p\nJOIN siu_cases s ON s.claim_id = p.claim_id\nWHERE p.status = 'paid' AND s.verdict = 'open'\nORDER BY p.claim_id ASC;`, order: "exact" },
      { prompt: "Sum still-stoppage-able money (pending payments) on open-SIU claims. One column: recoverable_savings.", code: `SELECT COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_cents ELSE 0 END), 0) AS recoverable_savings\nFROM payments p\nJOIN siu_cases s ON s.claim_id = p.claim_id\nWHERE s.verdict = 'open';`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Allstate",
    title: "Ring forensics I",
    scenario:
      "The fraud analyst starts the ring workup: the seven files, then the risk ladder.",
    steps: [
      { prompt: "List the ring registry: GROUP_CONCAT of claim numbers RC-4471..RC-4477 in claim_id order. One column: ring_registry.", code: `SELECT GROUP_CONCAT(claim_number, ',') AS ring_registry\nFROM (\n  SELECT claim_number FROM claims\n  WHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'\n  ORDER BY claim_id ASC\n);`, order: "exact" },
      { prompt: "List the ring by fraud risk: claim_number, fraud_risk_score, status, ordered by fraud_risk_score descending, then claim_number ascending.", code: `SELECT claim_number, fraud_risk_score, status\nFROM claims\nWHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477'\nORDER BY fraud_risk_score DESC, claim_number ASC;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "Travelers",
    title: "Ring forensics II",
    scenario:
      "The clocks tell the ring's story: averages per clock, then the settled total.",
    steps: [
      { prompt: "Average the ring's three clocks (first_contact_days, decision_days, payment_days), NULLs excluded. Output avg_contact, avg_decision, avg_payment (2 dp).", code: `SELECT\n  ROUND(AVG(first_contact_days), 2) AS avg_contact,\n  ROUND(AVG(decision_days), 2) AS avg_decision,\n  ROUND(AVG(payment_days), 2) AS avg_payment\nFROM claims\nWHERE claim_number BETWEEN 'RC-4471' AND 'RC-4477';`, order: "exact" },
      { prompt: "Sum the ring's settled payments (status 'paid'). One column: ring_paid.", code: `SELECT COALESCE(SUM(p.amount_cents), 0) AS ring_paid\nFROM payments p\nJOIN claims c ON c.claim_id = p.claim_id\nWHERE p.status = 'paid' AND c.claim_number BETWEEN 'RC-4471' AND 'RC-4477';`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "Velocity workup",
    scenario:
      "The pattern analyst hunts same-policy filing bursts — inclusive first, then strict.",
    steps: [
      { prompt: "Count same-policy claim pairs (a.claim_id < b.claim_id) filed <= 300 seconds apart. One column: velocity_pairs.", code: `SELECT COUNT(*) AS velocity_pairs\nFROM claims a\nJOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id\nWHERE ABS(b.filed_ts - a.filed_ts) <= 300;`, order: "exact" },
      { prompt: "Same, strictly under 300 seconds. One column: velocity_strict.", code: `SELECT COUNT(*) AS velocity_strict\nFROM claims a\nJOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id\nWHERE ABS(b.filed_ts - a.filed_ts) < 300;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "Ceiling escalation",
    scenario:
      "The service-recovery board escalates reopens — and the edge case decides who lands on it.",
    steps: [
      { prompt: "List claims with reopen_count >= 6: claim_id, claim_number, reopen_count, status, ordered by reopen_count descending, then claim_id ascending.", code: `SELECT claim_id, claim_number, reopen_count, status\nFROM claims\nWHERE reopen_count >= 6\nORDER BY reopen_count DESC, claim_id ASC;`, order: "exact" },
      { prompt: "One row: ceiling_inclusive (>= 6) and ceiling_strict (> 6).", code: `SELECT\n  COUNT(CASE WHEN reopen_count >= 6 THEN 1 END) AS ceiling_inclusive,\n  COUNT(CASE WHEN reopen_count > 6 THEN 1 END) AS ceiling_strict\nFROM claims;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Carrier exposure",
    scenario:
      "The reinsurance team wants settled exposure per carrier — zeros included, no gaps in the board.",
    steps: [
      { prompt: "Sum settled payments per carrier (LEFT JOIN, COALESCE). Output carrier name and paid_total, ordered by paid_total descending, then name ascending.", code: `SELECT cr.name, COALESCE(SUM(p.amount_cents), 0) AS paid_total\nFROM carriers cr\nLEFT JOIN claims c ON c.carrier_id = cr.carrier_id\nLEFT JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'\nGROUP BY cr.carrier_id, cr.name\nORDER BY paid_total DESC, cr.name ASC;`, order: "exact" },
      { prompt: "Count SIU referrals (FRS >= 60) per carrier, zeros included. Output carrier name and referral_count, ordered by referral_count descending, then name ascending.", code: `SELECT cr.name, COUNT(CASE WHEN c.fraud_risk_score >= 60 THEN 1 END) AS referral_count\nFROM carriers cr\nLEFT JOIN claims c ON c.carrier_id = cr.carrier_id\nGROUP BY cr.carrier_id, cr.name\nORDER BY referral_count DESC, cr.name ASC;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Progressive",
    title: "Clocks by team",
    scenario:
      "The SLA lead cuts the contact clock by team — then checks who has never made contact.",
    steps: [
      { prompt: "Average first_contact_days per adjuster team (contacted claims only, 2 dp). Output team and avg_contact, ordered by avg_contact ascending, then team ascending.", code: `SELECT a.team, ROUND(AVG(c.first_contact_days), 2) AS avg_contact\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nWHERE c.first_contact_days IS NOT NULL\nGROUP BY a.team\nORDER BY avg_contact ASC, a.team ASC;`, order: "exact" },
      { prompt: "List pipeline claims (open/under_review/approved) with no contact yet: claim_id, claim_number, filed_date, ordered by claim_id ascending.", code: `SELECT claim_id, claim_number, filed_date\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved') AND first_contact_days IS NULL\nORDER BY claim_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Allstate",
    title: "Decision discipline",
    scenario:
      "Underwriting ops reviews decision speed per line — averages first, then the slowest single file.",
    steps: [
      { prompt: "Average decision_days per claim_type (decided claims, 2 dp). Output claim_type and avg_decision, ordered by avg_decision ascending, then claim_type ascending.", code: `SELECT claim_type, ROUND(AVG(decision_days), 2) AS avg_decision\nFROM claims\nWHERE decision_days IS NOT NULL\nGROUP BY claim_type\nORDER BY avg_decision ASC, claim_type ASC;`, order: "exact" },
      { prompt: "Find the slowest decision in the book: claim_id, claim_number, decision_days, ordered by decision_days descending, claim_id ascending, top row only.", code: `SELECT claim_id, claim_number, decision_days\nFROM claims\nWHERE decision_days IS NOT NULL\nORDER BY decision_days DESC, claim_id ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Travelers",
    title: "Payment clock",
    scenario:
      "Finance cuts the payment clock by line — then asks which rail actually carries the money.",
    steps: [
      { prompt: "Average payment_days per claim_type (settled claims, 2 dp). Output claim_type and avg_payment, ordered by avg_payment descending, then claim_type ascending.", code: `SELECT claim_type, ROUND(AVG(payment_days), 2) AS avg_payment\nFROM claims\nWHERE payment_days IS NOT NULL\nGROUP BY claim_type\nORDER BY avg_payment DESC, claim_type ASC;`, order: "exact" },
      { prompt: "Sum settled payments per method. Output method and paid_total, ordered by paid_total descending, then method ascending.", code: `SELECT method, SUM(amount_cents) AS paid_total\nFROM payments\nWHERE status = 'paid'\nGROUP BY method\nORDER BY paid_total DESC, method ASC;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Meridian Mutual",
    title: "Regional load",
    scenario:
      "The network plan needs claim load by region — and the premium written behind it.",
    steps: [
      { prompt: "Count claims per adjuster region. Output region and claim_count, ordered by claim_count descending, then region ascending.", code: `SELECT a.region, COUNT(*) AS claim_count\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nGROUP BY a.region\nORDER BY claim_count DESC, a.region ASC;`, order: "exact" },
      { prompt: "Sum written premium per carrier. Output carrier name and premium_total, ordered by premium_total descending, then name ascending.", code: `SELECT cr.name, SUM(po.premium_cents) AS premium_total\nFROM carriers cr\nLEFT JOIN policies po ON po.carrier_id = cr.carrier_id\nGROUP BY cr.carrier_id, cr.name\nORDER BY premium_total DESC, cr.name ASC;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Ridgeway",
    title: "Filing spine",
    scenario:
      "The monthly ops cadence checks filing volume by month — and notices the gap.",
    steps: [
      { prompt: "Count claims per filing month (strftime '%Y-%m'). Output month and claim_count, ordered by month ascending.", code: `SELECT strftime('%Y-%m', filed_date) AS month, COUNT(*) AS claim_count\nFROM claims\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Count the distinct filing months. One column: month_count.", code: `SELECT COUNT(*) AS month_count\nFROM (SELECT strftime('%Y-%m', filed_date) AS m FROM claims GROUP BY m);`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Lemonade",
    title: "Payment ladder",
    scenario:
      "The treasurer's ledger view: every payment state with counts and cents, side by side.",
    steps: [
      { prompt: "Per payment status: count and cents total. Output status, payment_count, cents_total, ordered by cents_total descending, then status ascending.", code: `SELECT status, COUNT(*) AS payment_count, SUM(amount_cents) AS cents_total\nFROM payments\nGROUP BY status\nORDER BY cents_total DESC, status ASC;`, order: "exact" },
      { prompt: "One row: the settled total (paid only). One column: paid_total.", code: `SELECT SUM(amount_cents) AS paid_total\nFROM payments\nWHERE status = 'paid';`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Progressive",
    title: "Velocity dossier",
    scenario:
      "The fraud analyst documents the velocity pairs themselves — who filed, against whom, how fast.",
    steps: [
      { prompt: "List the <= 300s same-policy pairs: first_claim, second_claim, gap_seconds, ordered by gap ascending, then first_claim ascending.", code: `SELECT a.claim_id AS first_claim, b.claim_id AS second_claim,\n  ABS(b.filed_ts - a.filed_ts) AS gap_seconds\nFROM claims a\nJOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id\nWHERE ABS(b.filed_ts - a.filed_ts) <= 300\nORDER BY gap_seconds ASC, first_claim ASC;`, order: "exact" },
      { prompt: "For each pair, pull the policy's holder: first_claim, second_claim, gap_seconds, holder_name, ordered by gap_seconds ascending.", code: `SELECT a.claim_id AS first_claim, b.claim_id AS second_claim,\n  ABS(b.filed_ts - a.filed_ts) AS gap_seconds,\n  po.holder_name\nFROM claims a\nJOIN claims b ON b.policy_id = a.policy_id AND b.claim_id > a.claim_id\nJOIN policies po ON po.policy_id = a.policy_id\nWHERE ABS(b.filed_ts - a.filed_ts) <= 300\nORDER BY gap_seconds ASC;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Allstate",
    title: "High-risk pipeline",
    scenario:
      "The desk lead checks the live files that already smell: FRS at or over the wall but still unsettled.",
    steps: [
      { prompt: "List pipeline claims (open/under_review/approved) with FRS >= 60: claim_id, claim_number, fraud_risk_score, status, ordered by fraud_risk_score descending.", code: `SELECT claim_id, claim_number, fraud_risk_score, status\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved') AND fraud_risk_score >= 60\nORDER BY fraud_risk_score DESC, claim_id ASC;`, order: "exact" },
      { prompt: "Sum their demand. One column: pipeline_risk_demand.", code: `SELECT SUM(amount_cents) AS pipeline_risk_demand\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved') AND fraud_risk_score >= 60;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Travelers",
    title: "Adjuster spotlight",
    scenario:
      "The quarterly review spotlights one desk: Ivy Chen's terminal book versus her live files.",
    steps: [
      { prompt: "Count Ivy Chen's terminal claims (paid/closed/denied). One column: ivy_closed.", code: `SELECT COUNT(*) AS ivy_closed\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nWHERE a.name = 'Ivy Chen' AND c.status IN ('paid', 'closed', 'denied');`, order: "exact" },
      { prompt: "Count Ivy Chen's live pipeline claims. One column: ivy_live.", code: `SELECT COUNT(*) AS ivy_live\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nWHERE a.name = 'Ivy Chen' AND c.status IN ('open', 'under_review', 'approved');`, order: "exact" },
    ],
  },
  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "The leak, end to end",
    scenario:
      "The audit committee wants the leak documented from every angle: the file, the money, the timing.",
    steps: [
      { prompt: "One row for claim 44: claim_number, amount_cents, paid_amount, paid_on, days_after_siu_open.", code: `SELECT c.claim_number, c.amount_cents, p.amount_cents AS paid_amount,\n  p.paid_on,\n  CAST(julianday(p.paid_on) - julianday(s.opened_on) AS INTEGER) AS days_after_siu_open\nFROM claims c\nJOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'\nJOIN siu_cases s ON s.claim_id = c.claim_id\nWHERE c.claim_id = 44;`, order: "exact" },
      { prompt: "One row: the leak amount (settled money on open SIU claims) and the recoverable savings (pending money on open SIU claims). Output leaked_cents, recoverable_savings.", code: `SELECT\n  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount_cents END), 0) AS leaked_cents,\n  COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_cents END), 0) AS recoverable_savings\nFROM payments p\nJOIN siu_cases s ON s.claim_id = p.claim_id\nWHERE s.verdict = 'open';`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Whale memo",
    scenario:
      "The board memo on the 100000000 settlement: the share, the flip, and the type board it leaves behind.",
    steps: [
      { prompt: "One row: paid_total, whale_share (2 dp), referral_count, open_siu.", code: `SELECT\n  (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid') AS paid_total,\n  ROUND((SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') * 100.0 /\n    (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,\n  (SELECT COUNT(*) FROM claims WHERE fraud_risk_score >= 60) AS referral_count,\n  (SELECT COUNT(*) FROM siu_cases WHERE verdict = 'open') AS open_siu;`, order: "exact" },
      { prompt: "One row: property_paid (with the whale), whale_share (2 dp), property_ex_whale — the flip's punchline row.", code: `SELECT\n  (SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_type = 'property') AS property_paid,\n  ROUND((SELECT SUM(p.amount_cents) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_id = 130) * 100.0 /\n    (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,\n  (SELECT COALESCE(SUM(p.amount_cents), 0) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_type = 'property' AND c.claim_id != 130) AS property_ex_whale;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Ring vs book",
    scenario:
      "The fraud briefing compares the ring to everything else: money settled, then clocks.",
    steps: [
      { prompt: "One row: ring_paid and book_paid_ex_ring (settled payments, split by the RC-4471..4477 window).", code: `SELECT\n  COALESCE(SUM(CASE WHEN c.claim_number BETWEEN 'RC-4471' AND 'RC-4477' THEN p.amount_cents END), 0) AS ring_paid,\n  COALESCE(SUM(CASE WHEN c.claim_number NOT BETWEEN 'RC-4471' AND 'RC-4477' THEN p.amount_cents END), 0) AS book_paid_ex_ring\nFROM payments p\nJOIN claims c ON c.claim_id = p.claim_id\nWHERE p.status = 'paid';`, order: "exact" },
      { prompt: "Per cohort (ring/book): average first_contact_days, decision_days, payment_days (2 dp). Output cohort, avg_contact, avg_decision, avg_payment, ordered by cohort ascending.", code: `SELECT\n  CASE WHEN c.claim_number BETWEEN 'RC-4471' AND 'RC-4477' THEN 'ring' ELSE 'book' END AS cohort,\n  ROUND(AVG(c.first_contact_days), 2) AS avg_contact,\n  ROUND(AVG(c.decision_days), 2) AS avg_decision,\n  ROUND(AVG(c.payment_days), 2) AS avg_payment\nFROM claims c\nGROUP BY cohort\nORDER BY cohort ASC;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Progressive",
    title: "Settlement curve",
    scenario:
      "Finance builds the running settlement curve, then checks the heaviest month.",
    steps: [
      { prompt: "Per settlement month (paid_on, settled payments only): month_total and running_total. Output month, month_total, running_total, ordered by month ascending.", code: `SELECT month, month_total,\n  SUM(month_total) OVER (ORDER BY month) AS running_total\nFROM (\n  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS month_total\n  FROM payments\n  WHERE status = 'paid'\n  GROUP BY month\n)\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Top settlement month by total: month and month_total, ordered by month_total descending, month ascending, top row only.", code: `SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS month_total\nFROM payments\nWHERE status = 'paid'\nGROUP BY month\nORDER BY month_total DESC, month ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Allstate",
    title: "Terminal matrix",
    scenario:
      "The ops review reads the whole terminal book as a matrix: who settled, denied, closed.",
    steps: [
      { prompt: "Per adjuster: paid_count, denied_count, closed_count. Output adjuster name and the three counts, ordered by adjuster_id ascending.", code: `SELECT a.name,\n  COUNT(CASE WHEN c.status = 'paid' THEN 1 END) AS paid_count,\n  COUNT(CASE WHEN c.status = 'denied' THEN 1 END) AS denied_count,\n  COUNT(CASE WHEN c.status = 'closed' THEN 1 END) AS closed_count\nFROM adjusters a\nLEFT JOIN claims c ON c.adjuster_id = a.adjuster_id\nGROUP BY a.adjuster_id, a.name\nORDER BY a.adjuster_id ASC;`, order: "exact" },
      { prompt: "One row: the book's terminal total (paid + denied + closed counts summed). One column: terminal_total.", code: `SELECT COUNT(*) AS terminal_total\nFROM claims\nWHERE status IN ('paid', 'closed', 'denied');`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Travelers",
    title: "Dark carriers",
    scenario:
      "The distribution review hunts the zeros: carriers with no referrals, and what they still settled.",
    steps: [
      { prompt: "List carriers with zero SIU referrals (FRS >= 60 count = 0): carrier name, ordered by name ascending.", code: `SELECT cr.name\nFROM carriers cr\nLEFT JOIN claims c ON c.carrier_id = cr.carrier_id AND c.fraud_risk_score >= 60\nGROUP BY cr.carrier_id, cr.name\nHAVING COUNT(c.claim_id) = 0\nORDER BY cr.name ASC;`, order: "exact" },
      { prompt: "Sum settled payments for those zero-referral carriers. Output carrier name and paid_total, ordered by paid_total descending, then name ascending.", code: `SELECT cr.name, COALESCE(SUM(p.amount_cents), 0) AS paid_total\nFROM carriers cr\nLEFT JOIN claims c ON c.carrier_id = cr.carrier_id\nLEFT JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'\nGROUP BY cr.carrier_id, cr.name\nHAVING COUNT(CASE WHEN c.fraud_risk_score >= 60 THEN 1 END) = 0\nORDER BY paid_total DESC, cr.name ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "Aging exposure",
    scenario:
      "Reserving wants the pipeline demand by aging bucket — spine included, empties visible.",
    steps: [
      { prompt: "Per aging bucket (0-30/31-60/61-90/91+, spine): sum pipeline demand. Output bucket and demand_total, ordered by bucket ascending.", code: `WITH buckets(bucket) AS (\n  VALUES ('0-30'), ('31-60'), ('61-90'), ('91+')\n)\nSELECT b.bucket, COALESCE(SUM(c.amount_cents), 0) AS demand_total\nFROM buckets b\nLEFT JOIN claims c\n  ON c.status IN ('open', 'under_review', 'approved')\n AND CASE\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 30 THEN '0-30'\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 60 THEN '31-60'\n    WHEN julianday('2026-07-01') - julianday(c.filed_date) <= 90 THEN '61-90'\n    ELSE '91+'\n  END = b.bucket\nGROUP BY b.bucket\nORDER BY b.bucket ASC;`, order: "exact" },
      { prompt: "Count pipeline claims in the 91+ bucket. One column: aged_91_plus.", code: `SELECT COUNT(*) AS aged_91_plus\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved')\n  AND julianday('2026-07-01') - julianday(filed_date) > 90;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "SIU cycle discipline",
    scenario:
      "The SIU captain reviews resolution speed by verdict — and the cases still burning.",
    steps: [
      { prompt: "Average SIU cycle time per verdict (resolved cases only, 1 dp). Output verdict and avg_cycle_days, ordered by avg_cycle_days descending, then verdict ascending.", code: `SELECT verdict,\n  ROUND(AVG(julianday(confirmed_on) - julianday(opened_on)), 1) AS avg_cycle_days\nFROM siu_cases\nWHERE confirmed_on IS NOT NULL\nGROUP BY verdict\nORDER BY avg_cycle_days DESC, verdict ASC;`, order: "exact" },
      { prompt: "List the still-open SIU cases: claim_id, opened_on, verdict, ordered by opened_on ascending.", code: `SELECT claim_id, opened_on, verdict\nFROM siu_cases\nWHERE verdict = 'open'\nORDER BY opened_on ASC;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Referred money",
    scenario:
      "The exposure desk asks: of the referred claims, how much settled — and how much never left.",
    steps: [
      { prompt: "Count referred claims (FRS >= 60) that have a settled payment. One column: settled_referrals.", code: `SELECT COUNT(*) AS settled_referrals\nFROM claims c\nWHERE c.fraud_risk_score >= 60\n  AND EXISTS (SELECT 1 FROM payments p WHERE p.claim_id = c.claim_id AND p.status = 'paid');`, order: "exact" },
      { prompt: "Count referred claims with NO settled payment. One column: contained_referrals.", code: `SELECT COUNT(*) AS contained_referrals\nFROM claims c\nWHERE c.fraud_risk_score >= 60\n  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.claim_id = c.claim_id AND p.status = 'paid');`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Progressive",
    title: "Clock outliers",
    scenario:
      "The SLA review hunts the extremes: the longest contact wait and the longest file-to-pay.",
    steps: [
      { prompt: "Find the claim with the highest first_contact_days: claim_id, claim_number, first_contact_days, ordered desc, top row only.", code: `SELECT claim_id, claim_number, first_contact_days\nFROM claims\nWHERE first_contact_days IS NOT NULL\nORDER BY first_contact_days DESC, claim_id ASC\nLIMIT 1;`, order: "exact" },
      { prompt: "Find the claim with the highest payment_days among settled claims: claim_id, claim_number, payment_days, ordered desc, top row only.", code: `SELECT claim_id, claim_number, payment_days\nFROM claims\nWHERE payment_days IS NOT NULL\nORDER BY payment_days DESC, claim_id ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Allstate",
    title: "Kessler cluster deep-dive",
    scenario:
      "The fraud team pulls everything on the ring's stage: the policies, then every ring claim with its adjuster.",
    steps: [
      { prompt: "List ring claims with adjuster names: claim_number, c.claim_type, status, adjuster name, ordered by claim_id ascending.", code: `SELECT c.claim_number, c.claim_type, c.status, a.name AS adjuster\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nWHERE c.claim_number BETWEEN 'RC-4471' AND 'RC-4477'\nORDER BY c.claim_id ASC;`, order: "exact" },
      { prompt: "Per Kessler policy (policies 1-3): claim count and settled total. Output policy_id, claim_count, paid_total, ordered by policy_id ascending.", code: `SELECT po.policy_id,\n  COUNT(c.claim_id) AS claim_count,\n  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount_cents END), 0) AS paid_total\nFROM policies po\nLEFT JOIN claims c ON c.policy_id = po.policy_id\nLEFT JOIN payments p ON p.claim_id = c.claim_id\nWHERE po.policy_id IN (1, 2, 3)\nGROUP BY po.policy_id\nORDER BY po.policy_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Travelers",
    title: "Referral geography",
    scenario:
      "The SIU captain maps referrals to regions — then to the adjusters holding them.",
    steps: [
      { prompt: "Count referred claims (FRS >= 60) per adjuster region. Output region and referral_count, ordered by referral_count descending, then region ascending.", code: `SELECT a.region, COUNT(*) AS referral_count\nFROM claims c\nJOIN adjusters a ON a.adjuster_id = c.adjuster_id\nWHERE c.fraud_risk_score >= 60\nGROUP BY a.region\nORDER BY referral_count DESC, a.region ASC;`, order: "exact" },
      { prompt: "Count referred claims per adjuster, zeros included. Output adjuster name and referral_count, ordered by referral_count descending, then name ascending.", code: `SELECT a.name, COUNT(CASE WHEN c.fraud_risk_score >= 60 THEN 1 END) AS referral_count\nFROM adjusters a\nLEFT JOIN claims c ON c.adjuster_id = a.adjuster_id\nGROUP BY a.adjuster_id, a.name\nORDER BY referral_count DESC, a.name ASC;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "The bench",
    scenario:
      "Workload balance: the closer profile versus the pipeline holders, then the deny rate by team.",
    steps: [
      { prompt: "List adjusters with no live-pipeline claims (open/under_review/approved): adjuster name, ordered by name ascending.", code: `SELECT a.name\nFROM adjusters a\nWHERE NOT EXISTS (\n  SELECT 1 FROM claims c\n  WHERE c.adjuster_id = a.adjuster_id\n    AND c.status IN ('open', 'under_review', 'approved')\n)\nORDER BY a.name ASC;`, order: "exact" },
      { prompt: "Compute the denial rate per adjuster team (denied over all their claims, percent, 1 dp). Output team and deny_rate, ordered by deny_rate descending, then team ascending.", code: `SELECT a.team,\n  ROUND(COUNT(CASE WHEN c.status = 'denied' THEN 1 END) * 100.0 / COUNT(c.claim_id), 1) AS deny_rate\nFROM adjusters a\nLEFT JOIN claims c ON c.adjuster_id = a.adjuster_id\nGROUP BY a.team\nORDER BY deny_rate DESC, a.team ASC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Loss-lag outliers",
    scenario:
      "The pattern analyst checks filing discipline: the book's average lag, then the fastest filings.",
    steps: [
      { prompt: "Average loss-to-file lag in days, rounded to 1 dp. One column: avg_lag_days.", code: `SELECT ROUND(AVG(julianday(filed_date) - julianday(loss_date)), 1) AS avg_lag_days\nFROM claims;`, order: "exact" },
      { prompt: "List claims filed the SAME day as the loss (lag = 0): claim_id, claim_number, filed_date, ordered by claim_id ascending.", code: `SELECT claim_id, claim_number, filed_date\nFROM claims\nWHERE julianday(filed_date) = julianday(loss_date)\nORDER BY claim_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Lemonade",
    title: "Type economics",
    scenario:
      "The pricing review ties the lines together: demand booked per type, then settled per type.",
    steps: [
      { prompt: "Sum claim demand (amount_cents) per claim_type. Output claim_type and demand_total, ordered by demand_total descending, then claim_type ascending.", code: `SELECT claim_type, SUM(amount_cents) AS demand_total\nFROM claims\nGROUP BY claim_type\nORDER BY demand_total DESC, claim_type ASC;`, order: "exact" },
      { prompt: "Sum settled payments per claim_type (LEFT JOIN over claim types, zeros kept). Output claim_type and paid_total, ordered by paid_total descending, then claim_type ascending.", code: `SELECT c.claim_type, COALESCE(SUM(p.amount_cents), 0) AS paid_total\nFROM claims c\nLEFT JOIN payments p ON p.claim_id = c.claim_id AND p.status = 'paid'\nGROUP BY c.claim_type\nORDER BY paid_total DESC, c.claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Progressive",
    title: "April 1 spine",
    scenario:
      "The as-of audit replays the 91-day line: who sits exactly on it, and who is past it.",
    steps: [
      { prompt: "List pipeline claims filed EXACTLY 91 days before the as-of: claim_id, filed_date, aging_days, ordered by claim_id ascending.", code: `SELECT claim_id, filed_date,\n  CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) AS aging_days\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved')\n  AND CAST(julianday('2026-07-01') - julianday(filed_date) AS INTEGER) = 91\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Count pipeline claims aged over 91 days. One column: past_the_line.", code: `SELECT COUNT(*) AS past_the_line\nFROM claims\nWHERE status IN ('open', 'under_review', 'approved')\n  AND julianday('2026-07-01') - julianday(filed_date) > 91;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Allstate",
    title: "The other reopen wall",
    scenario:
      "Service ops tries the reopen board at a lower ceiling: what shows up at >= 3 that the 6-wall hides.",
    steps: [
      { prompt: "Count claims with reopen_count >= 3. One column: reopen_wide.", code: `SELECT COUNT(*) AS reopen_wide\nFROM claims\nWHERE reopen_count >= 3;`, order: "exact" },
      { prompt: "Sum reopen_count across the whole book. One column: total_reopens.", code: `SELECT SUM(reopen_count) AS total_reopens\nFROM claims;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Travelers",
    title: "Premium vs exposure",
    scenario:
      "The actuarial cut: written premium per policy line against claim demand booked per line.",
    steps: [
      { prompt: "Sum premium per policy_type. Output policy_type and premium_total, ordered by premium_total descending, then policy_type ascending.", code: `SELECT policy_type, SUM(premium_cents) AS premium_total\nFROM policies\nGROUP BY policy_type\nORDER BY premium_total DESC, policy_type ASC;`, order: "exact" },
      { prompt: "One row: total premium book and total claim demand. Output premium_book, claim_demand.", code: `SELECT\n  (SELECT SUM(premium_cents) FROM policies) AS premium_book,\n  (SELECT SUM(amount_cents) FROM claims) AS claim_demand;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Meridian Mutual",
    title: "Method forensics",
    scenario:
      "Payments ops cuts the settled book by rail, then checks the whale's own rail.",
    steps: [
      { prompt: "Per method: settled count and cents. Output method, paid_count, paid_total, ordered by paid_total descending, then method ascending.", code: `SELECT method, COUNT(*) AS paid_count, SUM(amount_cents) AS paid_total\nFROM payments\nWHERE status = 'paid'\nGROUP BY method\nORDER BY paid_total DESC, method ASC;`, order: "exact" },
      { prompt: "List claim 130's settlement row: payment_id, claim_id, amount_cents, method, paid_on, ordered by payment_id ascending.", code: `SELECT payment_id, claim_id, amount_cents, method, paid_on\nFROM payments\nWHERE claim_id = 130 AND status = 'paid'\nORDER BY payment_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Ridgeway",
    title: "Executive memo",
    scenario:
      "The closing memo of the pack: the whole claims operation in one row — money, risk, and the leak that got away.",
    steps: [
      { prompt: "One row: paid_total, whale_share (2 dp), referrals, open_siu, leaked_cents — 220800000, 45.29, 12, 3, 9800000.", code: `SELECT\n  (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid') AS paid_total,\n  ROUND((SELECT SUM(amount_cents) FROM payments WHERE claim_id = 130 AND status = 'paid') * 100.0 /\n    (SELECT SUM(amount_cents) FROM payments WHERE status = 'paid'), 2) AS whale_share,\n  (SELECT COUNT(*) FROM claims WHERE fraud_risk_score >= 60) AS referrals,\n  (SELECT COUNT(*) FROM siu_cases WHERE verdict = 'open') AS open_siu,\n  (SELECT SUM(p.amount_cents) FROM payments p JOIN siu_cases s ON s.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND s.verdict = 'open') AS leaked_cents;`, order: "exact" },
      { prompt: "One row: the containment story — settled_referrals, contained_referrals, and the ring's settled total. Output settled_referrals, contained_referrals, ring_paid.", code: `SELECT\n  (SELECT COUNT(*) FROM claims c WHERE c.fraud_risk_score >= 60\n    AND EXISTS (SELECT 1 FROM payments p WHERE p.claim_id = c.claim_id AND p.status = 'paid')) AS settled_referrals,\n  (SELECT COUNT(*) FROM claims c WHERE c.fraud_risk_score >= 60\n    AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.claim_id = c.claim_id AND p.status = 'paid')) AS contained_referrals,\n  (SELECT COALESCE(SUM(p.amount_cents), 0) FROM payments p JOIN claims c ON c.claim_id = p.claim_id\n    WHERE p.status = 'paid' AND c.claim_number BETWEEN 'RC-4471' AND 'RC-4477') AS ring_paid;`, order: "exact" },
    ],
  },
];
