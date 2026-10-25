// Domain Mastery — pack #4 "SaaS & Subscriptions" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these six tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail, Finance and Fraud packs.
//
// The world is a B2B subscription business: accounts buy plans (Starter
// 4900 / Growth 9900 / Scale 24900 / Enterprise 100000 cents per month),
// plan changes open a NEW subscription row and close the old one, invoices
// go out monthly (and sometimes fail — dunning), seats (users) use the
// product, and customer success works tickets. Two vocabularies matter:
//   - SEGMENT is the sales taxonomy (SMB / MidMarket / Enterprise) — who the
//     account is. PLAN is what they pay for — and the two disagree here on
//     purpose (an Enterprise-segment account can sit on a Scale plan).
//   - MRR lives on subscriptions (recurring); invoice amounts are what was
//     actually billed in a cycle — promos and proration make them drift.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r12-saas-probe.ts before content referenced it):
//   - accounts 5 and 7 hold IDENTICAL invoice (amount,status) multisets —
//     six 4900 invoices each, one failed in Feb, 29400 billed lifetime;
//     accounts 8 and 9 hold a smaller mirror (six paid 9900s, 59400 each)
//   - the churn-rejoin wall: account 2 "churns" 2026-03-31 then RESUBSCRIBES
//     2026-05-01 — the naive churn sum (54500 over end-dated rows) is 11x
//     the true churned MRR (4900, account 12, who never came back)
//   - the whale: account 10 signs 2026-06-01 straight onto Enterprise at
//     EXACTLY 100000 cents — one row AT the line (>= holds, > does not);
//     June's month-over-month invoice delta is exactly that 100000
//   - April is the honest-zero month for NEW business: no subscription
//     starts in April (the month only holds an expansion and a contraction)
//   - daily issued-invoice ties: 104100 twice (02-01 vs 03-01) and SIX lone
//     days whose only activity is a single 4900 invoice
//   - 3 invoice drift rows vs the subscription active at issue: account 2's
//     two 8900 rejoin promos (sub is 9900) and account 6's 17400 proration
//     blend (Scale->Growth mid-April, 15/15 days)
//   - account 11 pays but is DARK: one never-activated seat, zero events,
//     one high open ticket, a failed April invoice — the pre-churn dossier
//   - accounts 3 and 6 pay with ZERO seat rows (never onboarded / team
//     rolled off in the downgrade) — the seat-count honest zero
//   - the invite burst: seat 3 fires 4 invites 60s apart on 07-21 (6
//     velocity pairs <= 300s), and the invited seat 13 logs in 200s later —
//     its ONLY event ever
//   - seat 1's timeline carries both clock traps: a 2700s gap on 07-20
//     (splits at the 1800s session cutoff) and a login->export pair EXACTLY
//     3600s apart on 07-22 (the inclusive-window bait)
//   - one duplicate billing: account 3 invoiced twice on 2026-01-19 for
//     4900 — one paid, one refunded (the only refunded row in the book)

export const DM_SAAS_SCHEMA = {
  ddl: `CREATE TABLE accounts (
  account_id  INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  segment     TEXT NOT NULL,       -- 'SMB' | 'MidMarket' | 'Enterprise'
  region      TEXT NOT NULL,       -- 'NA' | 'EMEA' | 'APAC' | 'LATAM'
  signup_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
  status      TEXT NOT NULL,       -- 'active' | 'churned'
  owner       TEXT NOT NULL        -- customer success manager
);

CREATE TABLE subscriptions (
  sub_id     INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,     -- no FK enforced (house convention)
  plan       TEXT NOT NULL,        -- 'Starter' | 'Growth' | 'Scale' | 'Enterprise'
  mrr_cents  INTEGER NOT NULL,     -- monthly recurring revenue in cents
  start_date TEXT NOT NULL,
  end_date   TEXT                  -- NULL = the current subscription
);

CREATE TABLE invoices (
  invoice_id   INTEGER PRIMARY KEY,
  account_id   INTEGER NOT NULL,
  issued_date  TEXT NOT NULL,      -- 'YYYY-MM-DD', 2026-01 .. 2026-06
  amount_cents INTEGER NOT NULL,
  status       TEXT NOT NULL,      -- 'paid' | 'failed' | 'pending' | 'refunded'
  paid_date    TEXT                -- NULL until money lands
);

CREATE TABLE seats (
  seat_id          INTEGER PRIMARY KEY,
  account_id       INTEGER NOT NULL,
  role             TEXT NOT NULL,  -- 'admin' | 'member' | 'viewer'
  joined_date      TEXT NOT NULL,
  last_active_date TEXT            -- NULL = invited but never activated
);

CREATE TABLE events (
  event_id   INTEGER PRIMARY KEY,
  seat_id    INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,        -- 'login' | 'report_run' | 'api_call' | 'invite' | 'export'
  event_ts   INTEGER NOT NULL      -- epoch seconds, 2026-07-20 .. 2026-07-23
);

CREATE TABLE tickets (
  ticket_id     INTEGER PRIMARY KEY,
  account_id    INTEGER NOT NULL,
  priority      TEXT NOT NULL,     -- 'low' | 'medium' | 'high'
  status        TEXT NOT NULL,     -- 'open' | 'investigating' | 'resolved' | 'closed'
  opened_date   TEXT NOT NULL,
  resolved_date TEXT               -- NULL until resolved or closed
);`,
  tables: [
    { name: "accounts", note: "12 accounts across 4 regions — account 2 churns and rejoins; account 10 is the whale; account 12 churned for good; account 11 pays but never logs in" },
    { name: "subscriptions", note: "16 plan-history rows — current MRR ties at 24900 (x2), 9900 (x4) and 4900 (x4); end-dated rows overstate churn 11x" },
    { name: "invoices", note: "62 invoices, 2026-01 .. 2026-06 — 53 paid / 7 failed / 1 pending / 1 refunded; 3 drift from the sub active at issue; one duplicate pair on 01-19" },
    { name: "seats", note: "14 seats — seat 11 never activated; accounts 3 and 6 have zero seats; the 2-seat club is accounts 1/2/5/8" },
    { name: "events", note: "72 product events in epoch seconds (07-20 .. 07-23) — an invite burst, a 2700s session gap, one 3600s login->export pair" },
    { name: "tickets", note: "12 CS tickets — 3 high; resolved_date NULL on exactly the 6 live ones; accounts 3/7/9 are ticketless" },
  ],
};
