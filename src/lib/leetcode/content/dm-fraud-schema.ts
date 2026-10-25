// Domain Mastery — pack #3 "Fraud & AML" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these six tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail & RFM and Finance Core packs.
//
// The world is a P2P wallet fintech: users move money peer-to-peer, log in
// from devices, dispute transfers they never meant to send, and the risk
// team works cases (some ending in a SAR filing). Risk scoring: every p2p
// row carries a 0-100 risk_score; the pack's definition of HIGH RISK is
//   risk_score >= 80
// and the EDD (enhanced due diligence) review line sits at 500000 cents:
// transfers AT or ABOVE it must be reviewed individually.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r11-fraud-probe.ts before content referenced it):
//   - users 5 and 7 carry IDENTICAL settled-send multisets — eight everyday
//     transfers each (101200 cents) PLUS the same 480000 mule leg on 04-03,
//     so their sent volumes tie at 581200; users 8 and 9 hold a smaller
//     mirror (three sends each, 19500) — RANK vs DENSE baits
//   - the mule ring: 04-02 user 2 fans OUT 4 × 490000 (each just under the
//     500000 EDD line) to users 5/6/7/12; 04-03 those four fan IN to user 9
//     at 480000 each — layering with a 10000 skim per leg
//   - user 9's received volume (1920000) tops the network while their SENT
//     volume ties for last — direction flips the story
//   - user 11 joins but NEVER transacts (zero p2p either way, zero logins)
//     yet owns an open case — the honest-zero anti-join bait
//   - device 14 is trusted=1 on paper but NEVER appears in a login (device
//     11 also sits unused — the dormant user's phone)
//   - user 4 suffers a credential-stuffing burst: FIVE failed logins 60s
//     apart, then a success 200s after the last failure (velocity bait)
//   - user 1's 07-20 timeline has a 2700s pause crossing the 1800s session
//     cutoff (sessionization bait); on 07-22 user 1 logs in from US and SG
//     exactly 3600s apart — impossible travel sitting ON the 3600s rule
//   - user 3 → user 5 posts twice on 2026-01-19 (duplicate-lane bait);
//     user 10 → user 6 sits exactly ON the 1000000 SAR line (inclusive
//     boundary: >= 1000000 counts, > 1000000 does not)
//   - disputes.amount_cents drifts from the referenced p2p amount on
//     exactly 3 rows (partial disputes — join-back audit trap)
//   - user 9's last login comes from 'RU' while suspended (geo outlier);
//     the burst day logs come from 'NG'
//   - failed + pending + reversed p2p rows exist (status-filter traps)

export const DM_FRAUD_SCHEMA = {
  ddl: `CREATE TABLE users (
  user_id     INTEGER PRIMARY KEY,
  handle      TEXT NOT NULL,
  country     TEXT NOT NULL,       -- 'US' | 'UK' | 'SG'
  kyc_tier    TEXT NOT NULL,       -- 'basic' | 'verified' | 'enhanced'
  joined_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
  status      TEXT NOT NULL        -- 'active' | 'limited' | 'suspended'
);

CREATE TABLE devices (
  device_id  INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,     -- no FK enforced (house convention)
  label      TEXT NOT NULL,
  os         TEXT NOT NULL,        -- 'iOS' | 'Android' | 'Web'
  first_seen TEXT NOT NULL,        -- 'YYYY-MM-DD'
  trusted    INTEGER NOT NULL      -- 1 = trusted, 0 = not
);

CREATE TABLE p2p (
  p2p_id       INTEGER PRIMARY KEY,
  sender_id    INTEGER NOT NULL,
  receiver_id  INTEGER NOT NULL,
  p2p_date     TEXT NOT NULL,      -- 'YYYY-MM-DD', 2026-01 .. 2026-06
  amount_cents INTEGER NOT NULL,
  channel      TEXT NOT NULL,      -- 'wallet' | 'card' | 'bank'
  status       TEXT NOT NULL,      -- 'settled' | 'pending' | 'failed' | 'reversed'
  risk_score   INTEGER NOT NULL    -- 0-100; HIGH RISK means >= 80
);

CREATE TABLE logins (
  login_id    INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  device_id   INTEGER NOT NULL,
  login_ts    INTEGER NOT NULL,    -- epoch seconds, 2026-07-20 .. 07-23
  ip_country  TEXT NOT NULL,       -- 'US' | 'UK' | 'SG' | 'NG' | 'RU'
  result      TEXT NOT NULL,       -- 'success' | 'failed'
  fail_reason TEXT                 -- NULL when success
);

CREATE TABLE disputes (
  dispute_id   INTEGER PRIMARY KEY,
  user_id      INTEGER NOT NULL,   -- the claimant (always the sender side)
  p2p_id       INTEGER NOT NULL,   -- references a settled p2p row
  amount_cents INTEGER NOT NULL,   -- usually the transfer amount; 3 partials drift
  reason       TEXT NOT NULL,      -- 'unauthorized' | 'item-not-received' | 'duplicate' | 'other'
  status       TEXT NOT NULL,      -- 'open' | 'won' | 'lost' | 'cancelled'
  filed_date   TEXT NOT NULL       -- 'YYYY-MM-DD'
);

CREATE TABLE cases (
  case_id     INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  case_type   TEXT NOT NULL,       -- 'fraud' | 'aml' | 'kyc' | 'abuse'
  severity    TEXT NOT NULL,       -- 'low' | 'medium' | 'high'
  status      TEXT NOT NULL,       -- 'open' | 'investigating' | 'closed-false' | 'closed-confirmed'
  opened_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
  closed_date TEXT,                -- NULL until closed
  sar_filed   INTEGER NOT NULL     -- 1 = Suspicious Activity Report filed
);`,
  tables: [
    { name: "users", note: "12 wallet users across US/UK/SG — user 11 never transacts; user 9 is suspended; user 2 is the mule leader" },
    { name: "devices", note: "14 devices — device 14 trusted but never seen in a login; device 11 belongs to the dormant user" },
    { name: "p2p", note: "56 transfers, 2026-01 .. 2026-06 — 46 settled / 3 pending / 5 failed / 2 reversed; risk_score >= 80 on exactly 11" },
    { name: "logins", note: "72 login attempts in epoch seconds (07-20 .. 07-23) — one 2700s session gap, one stuffing burst, one impossible-travel pair" },
    { name: "disputes", note: "12 claims against settled transfers — 3 partial amounts drift from the p2p row they cite" },
    { name: "cases", note: "12 risk cases — user 2 owns 3; exactly 3 SARs filed; closed_date NULL until closed" },
  ],
};
