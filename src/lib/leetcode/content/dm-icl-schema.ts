// Domain Mastery — pack #8 "Insurance & Claims Ops" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these six tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail, Finance, Fraud, SaaS, Healthcare,
// Freight and Marketing packs.
//
// The world is a claims operation: six carriers write policies across four
// lines, adjusters work the claims (field / desk / SIU teams across four
// regions), the claims book carries the fraud-risk score (FRS 0-100) and the
// three SLA clocks per claim (first contact, decision, payment — in days),
// payments settle approved exposure, and SIU cases investigate the scores
// the referral rule (FRS >= 60) sends their way. Four vocabularies matter:
//   - THE TERMINAL BOOK: a claim is closed when its status is 'paid',
//     'closed' or 'denied' — 'open', 'under_review' and 'approved' are the
//     live pipeline. Adjuster wrap-up rates are terminal counts, and Ivy
//     Chen closed EXACTLY 100 of them.
//   - THE SIU REFERRAL WALL: claims at fraud_risk_score >= 60 get referred.
//     Two claims sit EXACTLY on the 60 line, so >= and > give 12 vs 10.
//   - THE AGING CLOCKS: pipeline age is measured against the 2026-07-01
//     as-of date, with boundary rows sitting EXACTLY on 30, 60 and 91 days
//     — the 0-30 / 31-60 / 61-90 / 91+ buckets all shift on inclusive vs
//     strict edges.
//   - THE LEAK: claim 44 cleared payment (9800000, final) while its SIU case
//     was still open — money out the door before the investigation landed,
//     recoverable savings a hard 0.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r21-icl-world.ts before content referenced it):
//   - the whale: claim 130 (a 100000000 commercial property settlement) is
//     45.29% of the 220800000 paid book, it is the ONLY paid property claim,
//     and the paid-type board flips to liability the moment it is excluded
//   - the ring: claims 72..78 file in as RC-4471..RC-4477 — seven contiguous
//     numbers, one Kessler cluster at Meridian Mutual, all seven referred to
//     SIU (FRS 64..91), four paid, and their three SLA clocks average
//     EXACTLY 7 / 4 / 6 days
//   - the reopen ceiling: claim 5 sits at reopen_count 6 with claim 92 above
//     it at 7 — >=6 vs >6 split the board 2 vs 1
//   - the FRS wall: claims 10 and 28 EXACTLY at 60, 14 and 33 at 59, 41 and
//     55 at 61 — the referral set is 12 inclusive, 10 strict
//   - the velocity pairs: claims 141/142 filed 180s apart on one policy,
//     claims 148/149 EXACTLY 300s apart on another — 2 pairs inclusive, 1 strict
//   - Ivy Chen (adjuster 1) closed EXACTLY 100 claims; Marcus Webb carries
//     the whale; the desk teams hold the live pipeline
//   - honest zeros: property has no paid claims outside the whale, the
//     pipeline's 61-90 aging bucket is empty at the as-of date, and every
//     SIU-referred claim with an open case and no payment contributes a
//     clean 0 to the recoverable-savings board

export const DM_ICL_SCHEMA = {
  ddl: `CREATE TABLE carriers (
  carrier_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  hq_city    TEXT NOT NULL,
  founded    INTEGER NOT NULL
);

CREATE TABLE policies (
  policy_id      INTEGER PRIMARY KEY,
  policy_number  TEXT NOT NULL,
  carrier_id     INTEGER NOT NULL REFERENCES carriers(carrier_id),
  holder_name    TEXT NOT NULL,
  policy_type    TEXT NOT NULL,     -- 'auto' | 'home' | 'commercial_property' | 'umbrella'
  premium_cents  INTEGER NOT NULL,
  effective_date TEXT NOT NULL,
  expiry_date    TEXT NOT NULL,
  status         TEXT NOT NULL      -- 'active' | 'lapsed' | 'cancelled'
);

CREATE TABLE adjusters (
  adjuster_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  team        TEXT NOT NULL,        -- 'field' | 'desk' | 'siu'
  region      TEXT NOT NULL,        -- 'NA' | 'EMEA' | 'APAC' | 'LATAM'
  hired_on    TEXT NOT NULL
);

CREATE TABLE claims (
  claim_id           INTEGER PRIMARY KEY,
  claim_number       TEXT NOT NULL,  -- 'RC-4401' .. 'RC-4570' (4399 + claim_id)
  policy_id          INTEGER NOT NULL REFERENCES policies(policy_id),
  carrier_id         INTEGER NOT NULL REFERENCES carriers(carrier_id),
  adjuster_id        INTEGER NOT NULL REFERENCES adjusters(adjuster_id),
  claim_type         TEXT NOT NULL,  -- 'liability' | 'property' | 'injury' | 'theft' | 'flood'
  status             TEXT NOT NULL,  -- 'open' | 'under_review' | 'approved' | 'denied' | 'closed' | 'paid'
  filed_date         TEXT NOT NULL,  -- 'YYYY-MM-DD'
  loss_date          TEXT NOT NULL,
  filed_ts           INTEGER NOT NULL, -- epoch seconds; the velocity forensics anchor
  amount_cents       INTEGER NOT NULL, -- demand / settlement snapshot
  fraud_risk_score   INTEGER NOT NULL, -- FRS 0-100; >= 60 is the SIU referral wall
  reopen_count       INTEGER NOT NULL,
  first_contact_days INTEGER,        -- SLA clock 1; NULL while unreached
  decision_days      INTEGER,        -- SLA clock 2; NULL while undecided
  payment_days       INTEGER         -- SLA clock 3; NULL while unpaid
);

CREATE TABLE payments (
  payment_id   INTEGER PRIMARY KEY,
  claim_id     INTEGER NOT NULL REFERENCES claims(claim_id),
  amount_cents INTEGER NOT NULL,
  paid_on      TEXT NOT NULL,
  method       TEXT NOT NULL,       -- 'ach' | 'wire' | 'check'
  status       TEXT NOT NULL        -- 'paid' | 'pending' | 'void' | 'recovered'
);

CREATE TABLE siu_cases (
  siu_id       INTEGER PRIMARY KEY,
  claim_id     INTEGER NOT NULL REFERENCES claims(claim_id),
  opened_on    TEXT NOT NULL,
  confirmed_on TEXT,                -- NULL while the case is still open
  verdict      TEXT NOT NULL        -- 'confirmed' | 'cleared' | 'open'
);`,
  tables: [
    { name: "carriers", note: "6 carriers — Meridian Mutual and Ridgeway carry the pack's heaviest dossiers, Atlas Casualty is the 2003 newcomer" },
    { name: "policies", note: "36 policies across 4 lines — the Kessler cluster (policies 1-3) backs the RC-4471..4477 ring, one lapsed policy for honest-zero work" },
    { name: "adjusters", note: "8 adjusters across field/desk/SIU and 4 regions — Ivy Chen (field, NA) closed EXACTLY 100 claims, Marcus Webb carries the whale" },
    { name: "claims", note: "170 claims, RC-4401..RC-4570 — 120-row terminal book + 50-row live pipeline; FRS wall at 60 (12 vs 10), reopen ceiling at 6, aging boundary rows EXACTLY 30/60/91, ring at RC-4471..4477 with clocks 7/4/6" },
    { name: "payments", note: "81 settlements — the paid book is EXACTLY 220800000 with the 100000000 whale at 45.29%; c44's 9800000 went out the door before its SIU confirm (savings 0)" },
    { name: "siu_cases", note: "12 referrals (every FRS >= 60 claim) — 4 confirmed / 5 cleared / 3 open; the open cases are the leak and two ring members" },
  ],
};
