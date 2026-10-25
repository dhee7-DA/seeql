// Domain Mastery — pack #2 "Finance Core" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these six tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail & RFM pack.
//
// Interchange economics: card transactions earn the bank
//   fee_cents = amount_cents * interchange_bps / 10000
// where interchange_bps is the SNAPSHOT rate captured at processing time
// (ach/wire/atm rows carry 0 — interchange is a card-side economics). The
// merchant table's fee_bps is the CURRENT rate, and three transactions drift
// from it (historic pricing — join-back audit trap).
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r10-fin-probe.ts before content referenced it):
//   - account 11 opens but NEVER transacts — zero txns AND zero auths, yet
//     holds a dark-web alert and receives a transfer (anti-join bait)
//   - merchant "Solstice Cruises" never processes a transaction (zero-volume merchant)
//   - transactions.interchange_bps drifts from merchants.fee_bps on exactly
//     3 rows (rate-change audit trap)
//   - reward_cents is NULL on most rows (NULL-arithmetic traps)
//   - exact ties: accounts 5 and 7 carry IDENTICAL posted debit multisets
//     (volume 101200 AND fee revenue 1659.40 tie), accounts 8 and 9 a smaller
//     one (19500 / 197.30); eleven daily-volume tie groups, led by two
//     lone-debit days tied at 62000 (RANK vs DENSE baits)
//   - exactly one transaction sits ON the high-value line: 1000000 cents
//     (inclusive-boundary bait: >= 1000000 vs > 1000000)
//   - account 8 makes THREE same-day ATM cash deposits of 990000, 995000 and
//     998000 — each just under the 1000000 reporting line (structuring bait)
//   - account 4 fires 4 declined auths 90 seconds apart, then an approval
//     (card-testing velocity bait); account 1 has a 2700s gap crossing the
//     1800s session cutoff (sessionization bait)
//   - a self-transfer (from_account = to_account) and a transfer into the
//     dormant account (data-hygiene traps)
//   - declined + pending + reversed transactions exist (status-filter traps)
//   - Dubai branch holds exactly 2 accounts (small-cut bait)

export const DM_FIN_SCHEMA = {
  ddl: `CREATE TABLE accounts (
  account_id   INTEGER PRIMARY KEY,
  holder_name  TEXT NOT NULL,
  account_type TEXT NOT NULL,       -- 'checking' | 'savings' | 'credit'
  branch       TEXT NOT NULL,       -- 'NYC' | 'London' | 'Singapore' | 'Dubai'
  opened_date  TEXT NOT NULL,       -- 'YYYY-MM-DD'
  tier         TEXT NOT NULL        -- 'standard' | 'premium' | 'private'
);

CREATE TABLE merchants (
  merchant_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,        -- 'Grocery' | 'Dining' | 'Travel' | 'Electronics' | 'Utilities' | 'Insurance'
  country     TEXT NOT NULL,        -- 'US' | 'UK' | 'SG'
  fee_bps     INTEGER NOT NULL      -- current interchange rate, basis points
);

CREATE TABLE transactions (
  txn_id          INTEGER PRIMARY KEY,
  account_id      INTEGER NOT NULL, -- no FK enforced (house convention)
  merchant_id     INTEGER,          -- NULL for pure cash/atm rows without a merchant
  txn_date        TEXT NOT NULL,    -- 'YYYY-MM-DD', 2026-01 .. 2026-06
  direction       TEXT NOT NULL,    -- 'debit' (money out) | 'credit' (money in)
  amount_cents    INTEGER NOT NULL,
  channel         TEXT NOT NULL,    -- 'card' | 'ach' | 'wire' | 'atm'
  status          TEXT NOT NULL,    -- 'posted' | 'pending' | 'declined' | 'reversed'
  interchange_bps INTEGER NOT NULL, -- snapshot at processing time (card only; 0 otherwise)
  reward_cents    INTEGER           -- NULL = no cashback posted
);

CREATE TABLE auths (
  auth_id        INTEGER PRIMARY KEY,
  account_id     INTEGER NOT NULL,
  auth_ts        INTEGER NOT NULL,  -- epoch seconds
  merchant_id    INTEGER NOT NULL,
  amount_cents   INTEGER NOT NULL,
  result         TEXT NOT NULL,     -- 'approved' | 'declined'
  decline_reason TEXT               -- NULL when approved
);

CREATE TABLE transfers (
  transfer_id   INTEGER PRIMARY KEY,
  from_account  INTEGER NOT NULL,
  to_account    INTEGER NOT NULL,
  transfer_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  amount_cents  INTEGER NOT NULL,
  status        TEXT NOT NULL       -- 'settled' | 'failed' | 'pending'
);

CREATE TABLE alerts (
  alert_id   INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  alert_date TEXT NOT NULL,         -- 'YYYY-MM-DD'
  alert_type TEXT NOT NULL,         -- 'velocity' | 'geo' | 'structuring' | 'high-value' | 'dark-web'
  severity   TEXT NOT NULL,         -- 'low' | 'medium' | 'high'
  status     TEXT NOT NULL          -- 'open' | 'investigating' | 'closed-false' | 'closed-confirmed'
);`,
  tables: [
    { name: "accounts", note: "12 accounts across 4 branches — account 11 never transacts; Dubai holds exactly 2" },
    { name: "merchants", note: "14 merchants in 6 categories — Solstice Cruises never processes; fee_bps is the CURRENT rate" },
    { name: "transactions", note: "56 ledger rows, 2026-01 .. 2026-06 — 47 posted / 3 pending / 4 declined / 2 reversed; 3 bps drifts, 11 rewards" },
    { name: "auths", note: "36 card authorizations in epoch seconds (07-20 .. 07-23) — one 2700s session gap, one 4-decline burst" },
    { name: "transfers", note: "14 internal transfers — one self-transfer, one into the dormant account, 11 settled / 2 failed / 1 pending" },
    { name: "alerts", note: "12 risk alerts — account 8 owns 3 (structuring + dark-web + high-value); 7 of 12 accounts are alerted" },
  ],
};
