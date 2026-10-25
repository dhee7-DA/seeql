// Domain Mastery — Finance Core · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r10-fin-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_FIN_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "Stripe",
    title: "Ledger health check",
    scenario:
      "Monday standup starts with the ledger: how much of it is real, and how do the broken rows split?",
    steps: [
      { prompt: "Count posted transactions. One column: posted_txns.", code: `SELECT COUNT(*) AS posted_txns\nFROM transactions\nWHERE status = 'posted';`, order: "exact" },
      { prompt: "Count transactions per status. Output status and txn_count, ordered by txn_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS txn_count\nFROM transactions\nGROUP BY status\nORDER BY txn_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Visa",
    title: "Savings book review",
    scenario:
      "Deposit ops wants the savings book sized before the rate meeting.",
    steps: [
      { prompt: "Count savings accounts. One column: savings_count.", code: `SELECT COUNT(*) AS savings_count\nFROM accounts\nWHERE account_type = 'savings';`, order: "exact" },
      { prompt: "List the savings accounts: account_id, holder_name, branch, ordered by account_id ascending.", code: `SELECT account_id, holder_name, branch\nFROM accounts\nWHERE account_type = 'savings'\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "Branch map",
    scenario:
      "The network team is resizing branch support. Headcounts first, then the smallest book by name.",
    steps: [
      { prompt: "Count accounts per branch. Output branch and account_count, ordered by account_count descending, then branch ascending.", code: `SELECT branch, COUNT(*) AS account_count\nFROM accounts\nGROUP BY branch\nORDER BY account_count DESC, branch ASC;`, order: "exact" },
      { prompt: "List the Dubai accounts: account_id, holder_name, tier, ordered by account_id ascending.", code: `SELECT account_id, holder_name, tier\nFROM accounts\nWHERE branch = 'Dubai'\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Capital One",
    title: "Channel mix",
    scenario:
      "Card network pricing is up for renewal — start from how traffic actually moves.",
    steps: [
      { prompt: "List the distinct channels in the transactions table, ordered alphabetically. Single column: channel.", code: `SELECT DISTINCT channel\nFROM transactions\nORDER BY channel ASC;`, order: "exact" },
      { prompt: "Count transactions per channel. Output channel and txn_count, ordered by txn_count descending, then channel ascending.", code: `SELECT channel, COUNT(*) AS txn_count\nFROM transactions\nGROUP BY channel\nORDER BY txn_count DESC, channel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Ledgerline Bank",
    title: "Cashback audit",
    scenario:
      "Marketing wants to know what the rewards program actually paid out in the half.",
    steps: [
      { prompt: "Count posted rows with a non-null reward_cents. One column: reward_rows.", code: `SELECT COUNT(*) AS reward_rows\nFROM transactions\nWHERE status = 'posted' AND reward_cents IS NOT NULL;`, order: "exact" },
      { prompt: "Sum those rewards in cents. One column: total_rewards.", code: `SELECT SUM(reward_cents) AS total_rewards\nFROM transactions\nWHERE status = 'posted' AND reward_cents IS NOT NULL;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Paynova",
    title: "Auth pulse",
    scenario:
      "The auth window closed Sunday night. Approval rate first, then the decline pile.",
    steps: [
      { prompt: "Count approved authorizations. One column: approved_auths.", code: `SELECT COUNT(*) AS approved_auths\nFROM auths\nWHERE result = 'approved';`, order: "exact" },
      { prompt: "Count declined authorizations. One column: declined_auths.", code: `SELECT COUNT(*) AS declined_auths\nFROM auths\nWHERE result = 'declined';`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "Stripe",
    title: "Severity ladder",
    scenario:
      "Risk triage meets in ten minutes. Size the ladder, then pull the top rung.",
    steps: [
      { prompt: "Count alerts per severity. Output severity and alert_count, ordered by alert_count descending, then severity ascending.", code: `SELECT severity, COUNT(*) AS alert_count\nFROM alerts\nGROUP BY severity\nORDER BY alert_count DESC, severity ASC;`, order: "exact" },
      { prompt: "List the high-severity alerts: alert_id, account_id, alert_type, status, ordered by alert_id ascending.", code: `SELECT alert_id, account_id, alert_type, status\nFROM alerts\nWHERE severity = 'high'\nORDER BY alert_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Visa",
    title: "The 2026 class",
    scenario:
      "Onboarding wants to welcome this year's openings by name.",
    steps: [
      { prompt: "Count accounts opened on or after '2026-01-01'. One column: new_accounts.", code: `SELECT COUNT(*) AS new_accounts\nFROM accounts\nWHERE opened_date >= '2026-01-01';`, order: "exact" },
      { prompt: "List them: account_id, holder_name, opened_date, ordered by opened_date ascending, then account_id ascending.", code: `SELECT account_id, holder_name, opened_date\nFROM accounts\nWHERE opened_date >= '2026-01-01'\nORDER BY opened_date ASC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "One busy morning",
    scenario:
      "March 2 shows a two-row burst in the ledger. Pull it apart for the daily note.",
    steps: [
      { prompt: "Count transactions dated '2026-03-02'. One column: march2_txns.", code: `SELECT COUNT(*) AS march2_txns\nFROM transactions\nWHERE txn_date = '2026-03-02';`, order: "exact" },
      { prompt: "List them: txn_id, account_id, merchant_id, amount_cents, ordered by txn_id ascending.", code: `SELECT txn_id, account_id, merchant_id, amount_cents\nFROM transactions\nWHERE txn_date = '2026-03-02'\nORDER BY txn_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Capital One",
    title: "Money in limbo",
    scenario:
      "Treasury flags stuck payments. Quantify the failures, then price them.",
    steps: [
      { prompt: "Count failed transfers. One column: failed_transfers.", code: `SELECT COUNT(*) AS failed_transfers\nFROM transfers\nWHERE status = 'failed';`, order: "exact" },
      { prompt: "Sum the failed transfer amounts in cents. One column: failed_total.", code: `SELECT SUM(amount_cents) AS failed_total\nFROM transfers\nWHERE status = 'failed';`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Ledgerline Bank",
    title: "Merchant register",
    scenario:
      "Partnerships asks how wide the acceptance footprint really is.",
    steps: [
      { prompt: "Count registered merchants. One column: merchant_count.", code: `SELECT COUNT(*) AS merchant_count\nFROM merchants;`, order: "exact" },
      { prompt: "Count merchants per category. Output category and merchant_count, ordered by merchant_count descending, then category ascending.", code: `SELECT category, COUNT(*) AS merchant_count\nFROM merchants\nGROUP BY category\nORDER BY merchant_count DESC, category ASC;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Paynova",
    title: "Open risk queue",
    scenario:
      "The investigations standup needs the open book, with names attached.",
    steps: [
      { prompt: "Count alerts with status 'open'. One column: open_alerts.", code: `SELECT COUNT(*) AS open_alerts\nFROM alerts\nWHERE status = 'open';`, order: "exact" },
      { prompt: "List the open alerts with holder names: alert_id, holder_name, alert_type, alert_date, ordered by alert_id ascending.", code: `SELECT al.alert_id, a.holder_name, al.alert_type, al.alert_date\nFROM alerts al\nJOIN accounts a ON a.account_id = al.account_id\nWHERE al.status = 'open'\nORDER BY al.alert_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "Stripe",
    title: "Volume floor and ceiling",
    scenario:
      "The half-year close needs the two headline numbers: total outflow and the single biggest swing.",
    steps: [
      { prompt: "Sum posted debit volume in cents. One column: total_debit_volume.", code: `SELECT SUM(amount_cents) AS total_debit_volume\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit';`, order: "exact" },
      { prompt: "Find the largest amount_cents of any transaction. One column: largest_txn.", code: `SELECT MAX(amount_cents) AS largest_txn\nFROM transactions;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Visa",
    title: "Four quiet days",
    scenario:
      "The auth window was supposed to be low season. Show the daily shape.",
    steps: [
      { prompt: "Count authorizations per day: strftime('%Y-%m-%d', auth_ts, 'unixepoch'). Output day and auth_count, ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', auth_ts, 'unixepoch') AS day, COUNT(*) AS auth_count\nFROM auths\nGROUP BY day\nORDER BY day ASC;`, order: "exact" },
      { prompt: "List the July 21 authorizations: auth_id, account_id, result, ordered by auth_id ascending.", code: `SELECT auth_id, account_id, result\nFROM auths\nWHERE auth_ts >= 1784592000 AND auth_ts < 1784678400\nORDER BY auth_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "The Dubai pair",
    scenario:
      "Regional review: Dubai's book is thin. Show exactly how thin, per account.",
    steps: [
      { prompt: "Count Dubai accounts. One column: dubai_accounts.", code: `SELECT COUNT(*) AS dubai_accounts\nFROM accounts\nWHERE branch = 'Dubai';`, order: "exact" },
      { prompt: "Posted debit volume per Dubai account (0 if none): account_id, holder_name, debit_vol, ordered by account_id ascending.", code: `SELECT a.account_id, a.holder_name,\n       COALESCE(SUM(CASE WHEN t.direction = 'debit' THEN t.amount_cents END), 0) AS debit_vol\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nWHERE a.branch = 'Dubai'\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Capital One",
    title: "Interest credits",
    scenario:
      "Finance wants the ACH credit side itemized — the payouts the bank pushed out.",
    steps: [
      { prompt: "List posted ACH credits: txn_id, account_id, amount_cents, ordered by txn_id ascending.", code: `SELECT txn_id, account_id, amount_cents\nFROM transactions\nWHERE status = 'posted' AND direction = 'credit' AND channel = 'ach'\nORDER BY txn_id ASC;`, order: "exact" },
      { prompt: "Sum those ACH credits in cents. One column: ach_credit_total.", code: `SELECT SUM(amount_cents) AS ach_credit_total\nFROM transactions\nWHERE status = 'posted' AND direction = 'credit' AND channel = 'ach';`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Ledgerline Bank",
    title: "Rate card corners",
    scenario:
      "Pricing committee: show the priciest tiers and the utility floor.",
    steps: [
      { prompt: "List the five merchants with the highest fee_bps: merchant_id, name, fee_bps, ordered by fee_bps descending, then merchant_id ascending.", code: `SELECT merchant_id, name, fee_bps\nFROM merchants\nORDER BY fee_bps DESC, merchant_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "List the Utilities merchants: merchant_id, name, fee_bps, ordered by merchant_id ascending.", code: `SELECT merchant_id, name, fee_bps\nFROM merchants\nWHERE category = 'Utilities'\nORDER BY merchant_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Paynova",
    title: "Pending board",
    scenario:
      "Ops huddle: what is still unsettled in the ledger?",
    steps: [
      { prompt: "Count pending transactions. One column: pending_txns.", code: `SELECT COUNT(*) AS pending_txns\nFROM transactions\nWHERE status = 'pending';`, order: "exact" },
      { prompt: "List them: txn_id, account_id, merchant_id, amount_cents, ordered by txn_id ascending.", code: `SELECT txn_id, account_id, merchant_id, amount_cents\nFROM transactions\nWHERE status = 'pending'\nORDER BY txn_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "Stripe",
    title: "Transfer pipeline",
    scenario:
      "The payments pod reviews its internal rails: status mix, then what is stuck.",
    steps: [
      { prompt: "Count transfers per status. Output status and transfer_count, ordered by transfer_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS transfer_count\nFROM transfers\nGROUP BY status\nORDER BY transfer_count DESC, status ASC;`, order: "exact" },
      { prompt: "List the pending transfers: transfer_id, from_account, to_account, amount_cents, ordered by transfer_id ascending.", code: `SELECT transfer_id, from_account, to_account, amount_cents\nFROM transfers\nWHERE status = 'pending'\nORDER BY transfer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "Visa",
    title: "Why cards say no",
    scenario:
      "The decline pile has a shape. Size it, then cut it by reason.",
    steps: [
      { prompt: "Count declined authorizations. One column: declined_auths.", code: `SELECT COUNT(*) AS declined_auths\nFROM auths\nWHERE result = 'declined';`, order: "exact" },
      { prompt: "Count declined auths per reason. Output decline_reason and decline_count, ordered by decline_count descending, then decline_reason ascending.", code: `SELECT decline_reason, COUNT(*) AS decline_count\nFROM auths\nWHERE result = 'declined'\nGROUP BY decline_reason\nORDER BY decline_count DESC, decline_reason ASC;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Stripe",
    title: "The spend league",
    scenario:
      "Growth wants the half-year league table, then the ranked version with ties handled honestly.",
    steps: [
      { prompt: "Posted debit volume per account: account_id, debit_vol, ordered by debit_vol descending, then account_id ascending.", code: `SELECT account_id, SUM(amount_cents) AS debit_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY debit_vol DESC, account_id ASC;`, order: "exact" },
      { prompt: "Same league with RANK(): account_id, debit_vol, volume_rank, ordered by volume_rank ascending, then account_id ascending.", code: `WITH vol AS (\n  SELECT account_id, SUM(amount_cents) AS debit_vol\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY account_id\n)\nSELECT account_id, debit_vol, RANK() OVER (ORDER BY debit_vol DESC) AS volume_rank\nFROM vol\nORDER BY volume_rank ASC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Visa",
    title: "Proving the mirror",
    scenario:
      "Compliance suspects two accounts were synthesized as twins. Price both sides of the mirror separately and compare.",
    steps: [
      { prompt: "Account 5's posted debit volume and fee revenue (ROUND(amount*bps/10000, 2)): one row, columns debit_vol and fee_cents.", code: `SELECT SUM(amount_cents) AS debit_vol,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE account_id = 5 AND status = 'posted' AND direction = 'debit';`, order: "exact" },
      { prompt: "The same for account 7: one row, columns debit_vol and fee_cents.", code: `SELECT SUM(amount_cents) AS debit_vol,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE account_id = 7 AND status = 'posted' AND direction = 'debit';`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "Trend, then momentum",
    scenario:
      "The monthly review deck needs the bars first, then the month-over-month arrows.",
    steps: [
      { prompt: "Posted debit volume per month: month, debit_vol, ordered by month ascending.", code: `SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Add the MoM delta via LAG: month, debit_vol, delta, ordered by month ascending (January's delta stays NULL).", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY month\n)\nSELECT month, debit_vol, debit_vol - LAG(debit_vol) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Capital One",
    title: "Find the quiet account",
    scenario:
      "Dormancy policy kicks in at zero activity. Build the activity census, then isolate the dormant row.",
    steps: [
      { prompt: "Posted transaction count per account via LEFT JOIN: account_id, holder_name, posted_txns, ordered by account_id ascending.", code: `SELECT a.account_id, a.holder_name, COUNT(t.txn_id) AS posted_txns\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Keep only accounts with ZERO posted transactions: account_id, holder_name, posted_txns (one row).", code: `SELECT a.account_id, a.holder_name, COUNT(t.txn_id) AS posted_txns\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nGROUP BY a.account_id\nHAVING COUNT(t.txn_id) = 0;`, order: "any" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Where the fees come from",
    scenario:
      "Revenue review: interchange by category, then by account — two cuts of the same money.",
    steps: [
      { prompt: "Interchange fee per merchant category (posted debits, ROUND 2): category, fee_cents, ordered by fee_cents descending, then category ascending.", code: `SELECT m.category,\n       ROUND(SUM(t.amount_cents * t.interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions t\nJOIN merchants m ON m.merchant_id = t.merchant_id\nWHERE t.status = 'posted' AND t.direction = 'debit'\nGROUP BY m.category\nORDER BY fee_cents DESC, m.category ASC;`, order: "exact" },
      { prompt: "Interchange fee per account (posted debits, ROUND 2): account_id, fee_cents, ordered by fee_cents descending, then account_id ascending.", code: `SELECT account_id,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY fee_cents DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Paynova",
    title: "Merchant scoreboard",
    scenario:
      "Acceptance team review: full scoreboard with honest zeros, then the podium.",
    steps: [
      { prompt: "Posted debit volume per merchant, zeros included via LEFT JOIN + COALESCE: merchant_id, name, debit_vol, ordered by debit_vol descending, then merchant_id ascending.", code: `SELECT m.merchant_id, m.name, COALESCE(SUM(t.amount_cents), 0) AS debit_vol\nFROM merchants m\nLEFT JOIN transactions t\n  ON t.merchant_id = m.merchant_id AND t.status = 'posted' AND t.direction = 'debit'\nGROUP BY m.merchant_id\nORDER BY debit_vol DESC, m.merchant_id ASC;`, order: "exact" },
      { prompt: "Top three merchants by that volume: merchant_id, name, debit_vol (three rows).", code: `SELECT m.merchant_id, m.name, COALESCE(SUM(t.amount_cents), 0) AS debit_vol\nFROM merchants m\nLEFT JOIN transactions t\n  ON t.merchant_id = m.merchant_id AND t.status = 'posted' AND t.direction = 'debit'\nGROUP BY m.merchant_id\nORDER BY debit_vol DESC, m.merchant_id ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Stripe",
    title: "The risk book",
    scenario:
      "The quarterly risk pack opens with two cuts of the same twelve alerts.",
    steps: [
      { prompt: "Alert count per account, zeros included: account_id, holder_name, alert_count, ordered by alert_count descending, then account_id ascending.", code: `SELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alert_count\nFROM accounts a\nLEFT JOIN alerts al ON al.account_id = a.account_id\nGROUP BY a.account_id\nORDER BY alert_count DESC, a.account_id ASC;`, order: "exact" },
      { prompt: "Per alert_type: total and still-open counts: alert_type, total_alerts, open_alerts, ordered by alert_type ascending.", code: `SELECT alert_type, COUNT(*) AS total_alerts,\n       SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_alerts\nFROM alerts\nGROUP BY alert_type\nORDER BY alert_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "Visa",
    title: "Spend net of rewards",
    scenario:
      "Loyalty P&L: what did each account really cost after cashback?",
    steps: [
      { prompt: "Posted debit minus COALESCE(reward, 0) per account: account_id, net_spend, ordered by net_spend descending, then account_id ascending.", code: `SELECT account_id,\n       SUM(amount_cents - COALESCE(reward_cents, 0)) AS net_spend\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY net_spend DESC, account_id ASC;`, order: "exact" },
      { prompt: "Top three by net_spend: account_id, net_spend (three rows).", code: `SELECT account_id,\n       SUM(amount_cents - COALESCE(reward_cents, 0)) AS net_spend\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY net_spend DESC, account_id ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Stripe",
    title: "Rate drift audit",
    scenario:
      "Pricing ops heard rates changed mid-half. Prove it, then price the gap.",
    steps: [
      { prompt: "List card transactions whose snapshot bps differs from the merchant's current rate: txn_id, merchant_name, txn_bps, current_bps, ordered by txn_id ascending.", code: `SELECT t.txn_id, m.name AS merchant_name,\n       t.interchange_bps AS txn_bps, m.fee_bps AS current_bps\nFROM transactions t\nJOIN merchants m ON m.merchant_id = t.merchant_id\nWHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps\nORDER BY t.txn_id ASC;`, order: "exact" },
      { prompt: "Total fee the CURRENT rates would have added, in cents (ROUND 2, sum of amount*(current-snapshot)/10000 over those rows): one column, total_missed_fee.", code: `SELECT ROUND(SUM(t.amount_cents * (m.fee_bps - t.interchange_bps)) / 10000.0, 2) AS total_missed_fee\nFROM transactions t\nJOIN merchants m ON m.merchant_id = t.merchant_id\nWHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Visa",
    title: "Wire lane analysis",
    scenario:
      "The treasury pod maps its repeat lanes, then sizes the senders.",
    steps: [
      { prompt: "Transfer lanes that fired more than once: from_account, to_account, transfer_count, total_cents.", code: `SELECT from_account, to_account, COUNT(*) AS transfer_count,\n       SUM(amount_cents) AS total_cents\nFROM transfers\nGROUP BY from_account, to_account\nHAVING COUNT(*) > 1;`, order: "any" },
      { prompt: "Settled outflow per account (only accounts that actually sent a settled transfer): account_id, sent_vol, ordered by sent_vol descending, then account_id ascending.", code: `SELECT from_account AS account_id, SUM(amount_cents) AS sent_vol\nFROM transfers\nWHERE status = 'settled'\nGROUP BY from_account\nORDER BY sent_vol DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "Auth scorecard",
    scenario:
      "Card ops wants the window scorecard with every account on it, then the decline taxonomy.",
    steps: [
      { prompt: "Approved/declined per account, zeros included (LEFT JOIN + COALESCE): account_id, approved, declined, ordered by account_id ascending.", code: `WITH ac AS (\n  SELECT account_id,\n         SUM(CASE WHEN result = 'approved' THEN 1 ELSE 0 END) AS approved,\n         SUM(CASE WHEN result = 'declined' THEN 1 ELSE 0 END) AS declined\n  FROM auths\n  GROUP BY account_id\n)\nSELECT a.account_id, COALESCE(ac.approved, 0) AS approved,\n       COALESCE(ac.declined, 0) AS declined\nFROM accounts a\nLEFT JOIN ac ON ac.account_id = a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Decline reasons census: decline_reason, decline_count, ordered by decline_count descending, then decline_reason ascending.", code: `SELECT decline_reason, COUNT(*) AS decline_count\nFROM auths\nWHERE result = 'declined'\nGROUP BY decline_reason\nORDER BY decline_count DESC, decline_reason ASC;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Singapore book health",
    scenario:
      "The Singapore desk defends its numbers: per-account volumes, then the branch average.",
    steps: [
      { prompt: "Posted debit volume per Singapore account, zeros included: account_id, holder_name, debit_vol, ordered by account_id ascending.", code: `SELECT a.account_id, a.holder_name,\n       COALESCE(SUM(CASE WHEN t.direction = 'debit' THEN t.amount_cents END), 0) AS debit_vol\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nWHERE a.branch = 'Singapore'\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Singapore's average account volume, zeros included (ROUND 2): one column, avg_debit_vol.", code: `WITH vol AS (\n  SELECT a.account_id,\n         COALESCE(SUM(CASE WHEN t.direction = 'debit' THEN t.amount_cents END), 0) AS debit_vol\n  FROM accounts a\n  LEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\n  WHERE a.branch = 'Singapore'\n  GROUP BY a.account_id\n)\nSELECT ROUND(AVG(debit_vol), 2) AS avg_debit_vol\nFROM vol;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Stripe",
    title: "Biggest swing per book",
    scenario:
      "Credit committee reads single-transaction risk, not just totals.",
    steps: [
      { prompt: "Largest single posted debit per account: account_id, biggest_debit, ordered by biggest_debit descending, then account_id ascending.", code: `SELECT account_id, MAX(amount_cents) AS biggest_debit\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY biggest_debit DESC, account_id ASC;`, order: "exact" },
      { prompt: "Keep only books whose biggest single debit exceeds 100000: account_id, biggest_debit, ordered by biggest_debit descending.", code: `SELECT account_id, MAX(amount_cents) AS biggest_debit\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nHAVING MAX(amount_cents) > 100000\nORDER BY biggest_debit DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Visa",
    title: "Double-posting investigation",
    scenario:
      "Reconciliation found a possible double-post. Isolate the triple, then show the raw rows.",
    steps: [
      { prompt: "Find (account, merchant, date) triples with more than one posted transaction: account_id, merchant_id, txn_date, line_count.", code: `SELECT account_id, merchant_id, txn_date, COUNT(*) AS line_count\nFROM transactions\nWHERE merchant_id IS NOT NULL\nGROUP BY account_id, merchant_id, txn_date\nHAVING COUNT(*) > 1;`, order: "any" },
      { prompt: "List the raw rows behind that triple: txn_id, account_id, merchant_id, txn_date, amount_cents, ordered by txn_id ascending (join the suspect triples back).", code: `SELECT t.txn_id, t.account_id, t.merchant_id, t.txn_date, t.amount_cents\nFROM transactions t\nJOIN (\n  SELECT account_id, merchant_id, txn_date\n  FROM transactions\n  GROUP BY account_id, merchant_id, txn_date\n  HAVING COUNT(*) > 1\n) d ON d.account_id = t.account_id AND d.merchant_id = t.merchant_id AND d.txn_date = t.txn_date\nORDER BY t.txn_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "Named risk queues",
    scenario:
      "The chief of staff wants both live queues — open and investigating — with names, not ids.",
    steps: [
      { prompt: "Open alerts with holder names: alert_id, holder_name, alert_type, severity, alert_date, ordered by alert_id ascending.", code: `SELECT al.alert_id, a.holder_name, al.alert_type, al.severity, al.alert_date\nFROM alerts al\nJOIN accounts a ON a.account_id = al.account_id\nWHERE al.status = 'open'\nORDER BY al.alert_id ASC;`, order: "exact" },
      { prompt: "Investigating alerts with holder names: alert_id, holder_name, alert_type, severity, alert_date, ordered by alert_id ascending.", code: `SELECT al.alert_id, a.holder_name, al.alert_type, al.severity, al.alert_date\nFROM alerts al\nJOIN accounts a ON a.account_id = al.account_id\nWHERE al.status = 'investigating'\nORDER BY al.alert_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Paynova",
    title: "Big declines first",
    scenario:
      "Fraud review starts from the expensive failures.",
    steps: [
      { prompt: "List declined auths of 45000 cents or more: auth_id, account_id, amount_cents, decline_reason, ordered by amount_cents descending, then auth_id ascending.", code: `SELECT auth_id, account_id, amount_cents, decline_reason\nFROM auths\nWHERE result = 'declined' AND amount_cents >= 45000\nORDER BY amount_cents DESC, auth_id ASC;`, order: "exact" },
      { prompt: "Decline counts per account (accounts with at least one decline): account_id, declined, ordered by declined descending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS declined\nFROM auths\nWHERE result = 'declined'\nGROUP BY account_id\nORDER BY declined DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Fee share of wallet",
    scenario:
      "The CFO asks who really funds the interchange line: fee per account, then each one's slice.",
    steps: [
      { prompt: "Interchange fee per account (posted debits, ROUND 2): account_id, fee_cents, ordered by fee_cents descending, then account_id ascending.", code: `SELECT account_id,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY fee_cents DESC, account_id ASC;`, order: "exact" },
      { prompt: "Each account's share of the bank-wide fee pool, ROUND 1: account_id, fee_cents, share_pct, ordered by fee_cents descending, then account_id ascending.", code: `WITH fees AS (\n  SELECT account_id,\n         ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY account_id\n)\nSELECT account_id, fee_cents,\n       ROUND(100.0 * fee_cents /\n         (SELECT SUM(amount_cents * interchange_bps) / 10000.0\n          FROM transactions WHERE status = 'posted' AND direction = 'debit'), 1) AS share_pct\nFROM fees\nORDER BY fee_cents DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Paynova",
    title: "Chatty accounts",
    scenario:
      "Auth volume itself is a signal. Rank the chatter, then flag the heavy hitters.",
    steps: [
      { prompt: "Auth count per account: account_id, auth_count, ordered by auth_count descending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS auth_count\nFROM auths\nGROUP BY account_id\nORDER BY auth_count DESC, account_id ASC;`, order: "exact" },
      { prompt: "Keep accounts with at least 5 authorizations: account_id, auth_count, ordered by auth_count descending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS auth_count\nFROM auths\nGROUP BY account_id\nHAVING COUNT(*) >= 5\nORDER BY auth_count DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Branch champions build",
    scenario:
      "The town-hall slide needs each branch's top spender — build it in two moves and keep the tie.",
    steps: [
      { prompt: "Rank accounts by posted debit volume within their branch: branch, account_id, holder_name, debit_vol, branch_rank, ordered by branch ascending, then branch_rank ascending.", code: `WITH vol AS (\n  SELECT a.account_id, a.holder_name, a.branch, SUM(t.amount_cents) AS debit_vol\n  FROM accounts a\n  JOIN transactions t ON t.account_id = a.account_id\n    AND t.status = 'posted' AND t.direction = 'debit'\n  GROUP BY a.account_id\n)\nSELECT branch, account_id, holder_name, debit_vol,\n       RANK() OVER (PARTITION BY branch ORDER BY debit_vol DESC) AS branch_rank\nFROM vol\nORDER BY branch ASC, branch_rank ASC;`, order: "exact" },
      { prompt: "Keep only the champions (branch_rank = 1): branch, account_id, holder_name, debit_vol, ordered by branch ascending, then debit_vol descending.", code: `WITH vol AS (\n  SELECT a.account_id, a.holder_name, a.branch, SUM(t.amount_cents) AS debit_vol\n  FROM accounts a\n  JOIN transactions t ON t.account_id = a.account_id\n    AND t.status = 'posted' AND t.direction = 'debit'\n  GROUP BY a.account_id\n),\nranked AS (\n  SELECT *, RANK() OVER (PARTITION BY branch ORDER BY debit_vol DESC) AS branch_rank\n  FROM vol\n)\nSELECT branch, account_id, holder_name, debit_vol\nFROM ranked\nWHERE branch_rank = 1\nORDER BY branch ASC, debit_vol DESC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Capital One",
    title: "Around the reporting line",
    scenario:
      "The compliance officer wants the neighborhood of 1000000 cents mapped before the filing.",
    steps: [
      { prompt: "List transactions of 1000000 cents or more: txn_id, account_id, txn_date, amount_cents, channel, ordered by txn_id ascending.", code: `SELECT txn_id, account_id, txn_date, amount_cents, channel\nFROM transactions\nWHERE amount_cents >= 1000000\nORDER BY txn_id ASC;`, order: "exact" },
      { prompt: "List transactions from 900000 up to but excluding 1000000: txn_id, account_id, txn_date, amount_cents, channel, ordered by amount_cents descending.", code: `SELECT txn_id, account_id, txn_date, amount_cents, channel\nFROM transactions\nWHERE amount_cents >= 900000 AND amount_cents < 1000000\nORDER BY amount_cents DESC, txn_id ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Paynova",
    title: "The structuring case",
    scenario:
      "Deposits are being sliced under the reporting line. Detect the pattern, then bind it to the alert that was raised.",
    steps: [
      { prompt: "Find groups of 3+ same-day ATM cash credits, each at least 900000 and under 1000000 cents: account_id, txn_date, deposit_count, total_cents.", code: `SELECT account_id, txn_date, COUNT(*) AS deposit_count,\n       SUM(amount_cents) AS total_cents\nFROM transactions\nWHERE channel = 'atm' AND direction = 'credit'\n  AND amount_cents >= 900000 AND amount_cents < 1000000\nGROUP BY account_id, txn_date\nHAVING COUNT(*) >= 3;`, order: "any" },
      { prompt: "Join that detector to the structuring alert and the holder: alert_id, account_id, holder_name, alert_type, severity, deposit_n, deposit_total.", code: `WITH deposits AS (\n  SELECT account_id, txn_date, COUNT(*) AS deposit_n, SUM(amount_cents) AS deposit_total\n  FROM transactions\n  WHERE channel = 'atm' AND direction = 'credit'\n    AND amount_cents >= 900000 AND amount_cents < 1000000\n  GROUP BY account_id, txn_date\n  HAVING COUNT(*) >= 3\n)\nSELECT al.alert_id, d.account_id, a.holder_name, al.alert_type, al.severity,\n       d.deposit_n, d.deposit_total\nFROM deposits d\nJOIN alerts al ON al.account_id = d.account_id AND al.alert_type = 'structuring'\nJOIN accounts a ON a.account_id = d.account_id;`, order: "any" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Paynova",
    title: "Velocity forensics",
    scenario:
      "Card testing leaves a rhythm. Find who bursts, then print their decline-by-decline timeline.",
    steps: [
      { prompt: "Accounts with at least 3 declined auths inside any 300-second window: account_id, max_declines_5min.", code: `SELECT account_id, MAX(cnt) AS max_declines_5min\nFROM (\n  SELECT a.account_id, a.auth_ts, COUNT(*) AS cnt\n  FROM auths a\n  JOIN auths b\n    ON b.account_id = a.account_id AND b.result = 'declined'\n   AND b.auth_ts BETWEEN a.auth_ts AND a.auth_ts + 300\n  WHERE a.result = 'declined'\n  GROUP BY a.account_id, a.auth_ts\n)\nGROUP BY account_id\nHAVING MAX(cnt) >= 3;`, order: "any" },
      { prompt: "That account's declined timeline with gaps: auth_id, auth_ts, amount_cents, gap_seconds (LAG), ordered by auth_ts ascending — use the detector's account (account 4).", code: `SELECT auth_id, auth_ts, amount_cents,\n       auth_ts - LAG(auth_ts) OVER (ORDER BY auth_ts) AS gap_seconds\nFROM auths\nWHERE account_id = 4 AND result = 'declined'\nORDER BY auth_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Sessionize the stream",
    scenario:
      "The fraud team wants auth timelines cut into sessions at the 1800-second gap, with the dormant account honestly at zero.",
    steps: [
      { prompt: "Sessions per account (gap > 1800s starts a session; zeros included): account_id, sessions, ordered by account_id ascending.", code: `WITH seq AS (\n  SELECT account_id, auth_ts,\n         LAG(auth_ts) OVER (PARTITION BY account_id ORDER BY auth_ts) AS prev_ts\n  FROM auths\n),\nstamps AS (\n  SELECT account_id, auth_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)\n           OVER (PARTITION BY account_id ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM seq\n)\nSELECT a.account_id, COUNT(DISTINCT s.session_no) AS sessions\nFROM accounts a\nLEFT JOIN stamps s ON s.account_id = a.account_id\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Rebuild account 1's July 20 timeline with session stamps: auth_ts, amount_cents, result, session_no, ordered by auth_ts ascending.", code: `WITH seq AS (\n  SELECT auth_ts, amount_cents, result,\n         LAG(auth_ts) OVER (ORDER BY auth_ts) AS prev_ts\n  FROM auths\n  WHERE account_id = 1 AND auth_ts < 1784592000\n),\nstamps AS (\n  SELECT auth_ts, amount_cents, result,\n         SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)\n           OVER (ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM seq\n)\nSELECT auth_ts, amount_cents, result, session_no\nFROM stamps\nORDER BY auth_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Stripe",
    title: "The volume curve",
    scenario:
      "The exec dashboard wants daily bars and the cumulative line underneath them.",
    steps: [
      { prompt: "Daily posted debit volume: txn_date, day_vol, ordered by txn_date ascending.", code: `SELECT txn_date, SUM(amount_cents) AS day_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY txn_date\nORDER BY txn_date ASC;`, order: "exact" },
      { prompt: "Add the running total: txn_date, day_vol, running_vol, ordered by txn_date ascending — the last row must close at the half-year total.", code: `SELECT txn_date, SUM(amount_cents) AS day_vol,\n       SUM(SUM(amount_cents)) OVER (ORDER BY txn_date ROWS UNBOUNDED PRECEDING) AS running_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY txn_date\nORDER BY txn_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Momentum report",
    scenario:
      "The strategy deck shows not just monthly volume but the swing between months.",
    steps: [
      { prompt: "Monthly posted debit volume: month, debit_vol, ordered by month ascending.", code: `SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "With MoM delta: month, debit_vol, delta, ordered by month ascending — January honest-NULL.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY month\n)\nSELECT month, debit_vol, debit_vol - LAG(debit_vol) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Visa",
    title: "The tie registry",
    scenario:
      "Before anyone trusts a top-N day report, show them the ties they are walking into.",
    steps: [
      { prompt: "Top-6 days by posted debit volume under DENSE_RANK: txn_date, vol, dr, ordered by dr ascending, then txn_date ascending (the rank-6 tie keeps both days).", code: `WITH daily AS (\n  SELECT txn_date, SUM(amount_cents) AS vol\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY txn_date\n),\nranked AS (\n  SELECT txn_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) AS dr\n  FROM daily\n)\nSELECT txn_date, vol, dr\nFROM ranked\nWHERE dr <= 6\nORDER BY dr ASC, txn_date ASC;`, order: "exact" },
      { prompt: "The full tie registry — every daily volume shared by more than one day: vol, day_count, days (GROUP_CONCAT of txn_date), ordered by vol descending.", code: `WITH daily AS (\n  SELECT txn_date, SUM(amount_cents) AS vol\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY txn_date\n)\nSELECT vol, COUNT(*) AS day_count, GROUP_CONCAT(txn_date) AS days\nFROM daily\nGROUP BY vol\nHAVING COUNT(*) > 1\nORDER BY vol DESC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "JPMorgan",
    title: "Concentration risk",
    scenario:
      "Portfolio review: which books live in one merchant category, and which are fully concentrated?",
    steps: [
      { prompt: "Each account's top category by posted debit spend, with its share (ROUND 1): account_id, category, vol, share_pct, ordered by share_pct descending, then account_id ascending.", code: `WITH spend AS (\n  SELECT t.account_id, m.category, SUM(t.amount_cents) AS vol\n  FROM transactions t\n  JOIN merchants m ON m.merchant_id = t.merchant_id\n  WHERE t.status = 'posted' AND t.direction = 'debit'\n  GROUP BY t.account_id, m.category\n),\nranked AS (\n  SELECT *, RANK() OVER (PARTITION BY account_id ORDER BY vol DESC) AS r,\n         ROUND(100.0 * vol / SUM(vol) OVER (PARTITION BY account_id), 1) AS share_pct\n  FROM spend\n)\nSELECT account_id, category, vol, share_pct\nFROM ranked\nWHERE r = 1\nORDER BY share_pct DESC, account_id ASC;`, order: "exact" },
      { prompt: "Keep the fully concentrated books (share_pct = 100): account_id, category, vol (three rows).", code: `WITH spend AS (\n  SELECT t.account_id, m.category, SUM(t.amount_cents) AS vol\n  FROM transactions t\n  JOIN merchants m ON m.merchant_id = t.merchant_id\n  WHERE t.status = 'posted' AND t.direction = 'debit'\n  GROUP BY t.account_id, m.category\n),\nranked AS (\n  SELECT *, RANK() OVER (PARTITION BY account_id ORDER BY vol DESC) AS r,\n         ROUND(100.0 * vol / SUM(vol) OVER (PARTITION BY account_id), 1) AS share_pct\n  FROM spend\n)\nSELECT account_id, category, vol\nFROM ranked\nWHERE r = 1 AND share_pct = 100\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Capital One",
    title: "The cash-flow anomaly",
    scenario:
      "A standard checking account is massively cash-positive. Build the net-flow table, then isolate the anomaly.",
    steps: [
      { prompt: "Net flow per account (posted credits minus debits, zeros included): account_id, net_cents, ordered by net_cents descending, then account_id ascending.", code: `SELECT a.account_id,\n       COALESCE(SUM(CASE WHEN t.direction = 'credit' THEN t.amount_cents\n                         ELSE -t.amount_cents END), 0) AS net_cents\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nGROUP BY a.account_id\nORDER BY net_cents DESC, a.account_id ASC;`, order: "exact" },
      { prompt: "Keep the cash-positive books (net_cents > 0): account_id, net_cents.", code: `SELECT a.account_id,\n       COALESCE(SUM(CASE WHEN t.direction = 'credit' THEN t.amount_cents\n                         ELSE -t.amount_cents END), 0) AS net_cents\nFROM accounts a\nLEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'\nGROUP BY a.account_id\nHAVING net_cents > 0;`, order: "any" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Priced the rate change",
    scenario:
      "The drift audit goes to the pricing committee: name the rows, then total the damage.",
    steps: [
      { prompt: "Drift rows with holder and merchant names plus the per-row fee delta: txn_id, holder_name, merchant_name, txn_bps, current_bps, missed_fee, ordered by txn_id ascending.", code: `SELECT t.txn_id, a.holder_name, m.name AS merchant_name,\n       t.interchange_bps AS txn_bps, m.fee_bps AS current_bps,\n       ROUND(t.amount_cents * (m.fee_bps - t.interchange_bps) / 10000.0, 2) AS missed_fee\nFROM transactions t\nJOIN merchants m ON m.merchant_id = t.merchant_id\nJOIN accounts a ON a.account_id = t.account_id\nWHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps\nORDER BY t.txn_id ASC;`, order: "exact" },
      { prompt: "The net fee the current rates would have added across those rows (ROUND 2, one column: total_missed_fee — one row prices negative).", code: `SELECT ROUND(SUM(t.amount_cents * (m.fee_bps - t.interchange_bps)) / 10000.0, 2) AS total_missed_fee\nFROM transactions t\nJOIN merchants m ON m.merchant_id = t.merchant_id\nWHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Stripe",
    title: "Activity RFM build",
    scenario:
      "Lifecycle marketing wants the bank-flavored RFM: recency against July 1, frequency, monetary.",
    steps: [
      { prompt: "Per account (posted debits): account_id, recency_days (2026-07-01 minus last debit, INTEGER cast), freq, monetary, ordered by monetary descending, then account_id ascending.", code: `SELECT account_id,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(txn_date)) AS INTEGER) AS recency_days,\n       COUNT(*) AS freq,\n       SUM(amount_cents) AS monetary\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY monetary DESC, account_id ASC;`, order: "exact" },
      { prompt: "Top five by monetary with their RANK: account_id, monetary, monetary_rank, ordered by monetary_rank ascending.", code: `WITH rfm AS (\n  SELECT account_id, SUM(amount_cents) AS monetary\n  FROM transactions\n  WHERE status = 'posted' AND direction = 'debit'\n  GROUP BY account_id\n),\nranked AS (\n  SELECT account_id, monetary, RANK() OVER (ORDER BY monetary DESC) AS monetary_rank\n  FROM rfm\n)\nSELECT account_id, monetary, monetary_rank\nFROM ranked\nWHERE monetary_rank <= 5\nORDER BY monetary_rank ASC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "JPMorgan",
    title: "Alerted, but silent",
    scenario:
      "Reconciliation question: which alerted accounts never even tried the card? Build the evidence table, then the answer.",
    steps: [
      { prompt: "Alerted accounts with auth scorecards (pre-aggregate the auth CTE): account_id, holder_name, alerts, approved, declined, ordered by account_id ascending.", code: `WITH ac AS (\n  SELECT account_id,\n         SUM(CASE WHEN result = 'approved' THEN 1 ELSE 0 END) AS approved,\n         SUM(CASE WHEN result = 'declined' THEN 1 ELSE 0 END) AS declined\n  FROM auths\n  GROUP BY account_id\n)\nSELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alerts,\n       COALESCE(ac.approved, 0) AS approved,\n       COALESCE(ac.declined, 0) AS declined\nFROM accounts a\nJOIN alerts al ON al.account_id = a.account_id\nLEFT JOIN ac ON ac.account_id = a.account_id\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Keep the alerted accounts with ZERO auths: account_id, holder_name, alerts (one row).", code: `WITH ac AS (\n  SELECT account_id, COUNT(*) AS auth_count\n  FROM auths\n  GROUP BY account_id\n)\nSELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alerts\nFROM accounts a\nJOIN alerts al ON al.account_id = a.account_id\nLEFT JOIN ac ON ac.account_id = a.account_id\nGROUP BY a.account_id\nHAVING COUNT(al.alert_id) >= 1 AND COALESCE(ac.auth_count, 0) = 0;`, order: "any" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Paynova",
    title: "Burst meets alert",
    scenario:
      "Close the loop on velocity: detect the burst, then show the alert that fired on the same day.",
    steps: [
      { prompt: "Accounts with 3+ declines in any 300s window: account_id, max_declines_5min.", code: `SELECT account_id, MAX(cnt) AS max_declines_5min\nFROM (\n  SELECT a.account_id, a.auth_ts, COUNT(*) AS cnt\n  FROM auths a\n  JOIN auths b\n    ON b.account_id = a.account_id AND b.result = 'declined'\n   AND b.auth_ts BETWEEN a.auth_ts AND a.auth_ts + 300\n  WHERE a.result = 'declined'\n  GROUP BY a.account_id, a.auth_ts\n)\nGROUP BY account_id\nHAVING MAX(cnt) >= 3;`, order: "any" },
      { prompt: "Join the bursting account to its velocity alerts: al.alert_id, v.account_id, a.holder_name, al.alert_type, al.severity, al.alert_date, v.max_declines_5min.", code: `WITH detector AS (\n  SELECT account_id, MAX(cnt) AS max_declines_5min\n  FROM (\n    SELECT a.account_id, a.auth_ts, COUNT(*) AS cnt\n    FROM auths a\n    JOIN auths b\n      ON b.account_id = a.account_id AND b.result = 'declined'\n     AND b.auth_ts BETWEEN a.auth_ts AND a.auth_ts + 300\n    WHERE a.result = 'declined'\n    GROUP BY a.account_id, a.auth_ts\n  )\n  GROUP BY account_id\n  HAVING MAX(cnt) >= 3\n)\nSELECT al.alert_id, v.account_id, a.holder_name, al.alert_type, al.severity,\n       al.alert_date, v.max_declines_5min\nFROM detector v\nJOIN alerts al ON al.account_id = v.account_id AND al.alert_type = 'velocity'\nJOIN accounts a ON a.account_id = v.account_id;`, order: "any" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Network map",
    scenario:
      "The graph team wants degree counts on the settled transfer network, then the heavyweight lanes.",
    steps: [
      { prompt: "Degree per account on settled transfers (edge list via UNION ALL, zeros included): account_id, degree, ordered by degree descending, then account_id ascending.", code: `WITH edges AS (\n  SELECT from_account AS account_id FROM transfers WHERE status = 'settled'\n  UNION ALL\n  SELECT to_account FROM transfers WHERE status = 'settled'\n)\nSELECT a.account_id, COUNT(e.account_id) AS degree\nFROM accounts a\nLEFT JOIN edges e ON e.account_id = a.account_id\nGROUP BY a.account_id\nORDER BY degree DESC, a.account_id ASC;`, order: "exact" },
      { prompt: "The heavyweight lanes: settled pairs moving at least 100000 cents: from_account, to_account, transfer_count, total_cents, ordered by total_cents descending.", code: `SELECT from_account, to_account, COUNT(*) AS transfer_count,\n       SUM(amount_cents) AS total_cents\nFROM transfers\nWHERE status = 'settled'\nGROUP BY from_account, to_account\nHAVING SUM(amount_cents) >= 100000\nORDER BY total_cents DESC, from_account ASC, to_account ASC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Paynova",
    title: "Line and sub-line",
    scenario:
      "The filing prep needs both sides of the 1000000 line: what touches it, and what stacks up beneath it.",
    steps: [
      { prompt: "The boundary audit in one row: at_or_above (>= 1000000) and strictly_above (> 1000000).", code: `SELECT SUM(CASE WHEN amount_cents >= 1000000 THEN 1 ELSE 0 END) AS at_or_above,\n       SUM(CASE WHEN amount_cents > 1000000 THEN 1 ELSE 0 END) AS strictly_above\nFROM transactions;`, order: "exact" },
      { prompt: "Per day: how many credits of at least 900000 but under 1000000 cents, and their total: txn_date, sub_line_count, sub_line_total, ordered by sub_line_total descending.", code: `SELECT txn_date, COUNT(*) AS sub_line_count, SUM(amount_cents) AS sub_line_total\nFROM transactions\nWHERE direction = 'credit' AND amount_cents >= 900000 AND amount_cents < 1000000\nGROUP BY txn_date\nORDER BY sub_line_total DESC, txn_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Stripe",
    title: "Fee efficiency",
    scenario:
      "Two accounts can spend the same and earn the bank wildly different fees. Show effective rate per account.",
    steps: [
      { prompt: "Interchange fee per account (posted debits, ROUND 2): account_id, fee_cents, ordered by fee_cents descending, then account_id ascending.", code: `SELECT account_id,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY fee_cents DESC, account_id ASC;`, order: "exact" },
      { prompt: "Effective average bps paid per account (SUM(amount*bps)/SUM(amount), ROUND 1): account_id, avg_bps, ordered by avg_bps descending, then account_id ascending.", code: `SELECT account_id,\n       ROUND(1.0 * SUM(amount_cents * interchange_bps) / SUM(amount_cents), 1) AS avg_bps\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY avg_bps DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Capital One",
    title: "Churn watch",
    scenario:
      "Retention flags staleness at 90 days. Build recency for the book, then the watchlist.",
    steps: [
      { prompt: "Recency per account (posted debits, days from last debit to 2026-07-01, INTEGER cast): account_id, recency_days, ordered by recency_days descending, then account_id ascending.", code: `SELECT account_id,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(txn_date)) AS INTEGER) AS recency_days\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY recency_days DESC, account_id ASC;`, order: "exact" },
      { prompt: "The stale list (recency over 90 days): account_id, recency_days, ordered by recency_days descending.", code: `SELECT account_id,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(txn_date)) AS INTEGER) AS recency_days\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nHAVING recency_days > 90\nORDER BY recency_days DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Volume is not revenue",
    scenario:
      "The board conflates spend with earnings. Show the paradox: top books by volume, then by fee — different orders.",
    steps: [
      { prompt: "Top three accounts by posted debit volume, with their fee (ROUND 2): account_id, debit_vol, fee_cents, ordered by debit_vol descending.", code: `SELECT account_id, SUM(amount_cents) AS debit_vol,\n       ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY debit_vol DESC, account_id ASC\nLIMIT 3;`, order: "exact" },
      { prompt: "Top three accounts by fee, with their volume: account_id, fee_cents, debit_vol, ordered by fee_cents descending.", code: `SELECT account_id, ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents,\n       SUM(amount_cents) AS debit_vol\nFROM transactions\nWHERE status = 'posted' AND direction = 'debit'\nGROUP BY account_id\nORDER BY fee_cents DESC, account_id ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Visa",
    title: "Auth-to-ledger bridge",
    scenario:
      "An auth decline is not a ledger row. Count both sides, then find who was refused but never booked a declined txn.",
    steps: [
      { prompt: "Approved/declined auths per account: account_id, approved, declined, ordered by account_id ascending.", code: `SELECT account_id,\n       SUM(CASE WHEN result = 'approved' THEN 1 ELSE 0 END) AS approved,\n       SUM(CASE WHEN result = 'declined' THEN 1 ELSE 0 END) AS declined\nFROM auths\nGROUP BY account_id\nORDER BY account_id ASC;`, order: "exact" },
      { prompt: "Accounts with at least one declined auth, with their reasons concatenated: account_id, declined, reasons (GROUP_CONCAT of decline_reason), ordered by account_id ascending.", code: `SELECT account_id, COUNT(*) AS declined,\n       GROUP_CONCAT(decline_reason) AS reasons\nFROM auths\nWHERE result = 'declined'\nGROUP BY account_id\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "JPMorgan",
    title: "The named network",
    scenario:
      "Audit wants the transfer ledger readable — names on both ends — then the two rows that should not exist.",
    steps: [
      { prompt: "Settled transfers with both holder names: transfer_id, from_holder, to_holder, amount_cents, ordered by amount_cents descending, then transfer_id ascending.", code: `SELECT t.transfer_id, fa.holder_name AS from_holder, ta.holder_name AS to_holder,\n       t.amount_cents\nFROM transfers t\nJOIN accounts fa ON fa.account_id = t.from_account\nJOIN accounts ta ON ta.account_id = t.to_account\nWHERE t.status = 'settled'\nORDER BY t.amount_cents DESC, t.transfer_id ASC;`, order: "exact" },
      { prompt: "The anomalies: self-transfers OR transfers into the dormant account 11: transfer_id, from_holder, to_holder, amount_cents, ordered by transfer_id ascending.", code: `SELECT t.transfer_id, fa.holder_name AS from_holder, ta.holder_name AS to_holder,\n       t.amount_cents\nFROM transfers t\nJOIN accounts fa ON fa.account_id = t.from_account\nJOIN accounts ta ON ta.account_id = t.to_account\nWHERE t.from_account = t.to_account OR t.to_account = 11\nORDER BY t.transfer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Paynova",
    title: "The full dossier",
    scenario:
      "The SAR narrative needs one row: the alert, the deposit evidence, and the net-flow signature, all joined.",
    steps: [
      { prompt: "Run the structuring detector: account_id, txn_date, deposit_count, total_cents (3+ same-day ATM credits at 900000–999999).", code: `SELECT account_id, txn_date, COUNT(*) AS deposit_count,\n       SUM(amount_cents) AS total_cents\nFROM transactions\nWHERE channel = 'atm' AND direction = 'credit'\n  AND amount_cents >= 900000 AND amount_cents < 1000000\nGROUP BY account_id, txn_date\nHAVING COUNT(*) >= 3;`, order: "any" },
      { prompt: "Bind everything: alert_id, holder_name, alert_type, severity, deposit_n, deposit_total, net_cents — the alert joined to the detector and to the account's net flow.", code: `WITH deposits AS (\n  SELECT account_id, txn_date, COUNT(*) AS deposit_n, SUM(amount_cents) AS deposit_total\n  FROM transactions\n  WHERE channel = 'atm' AND direction = 'credit'\n    AND amount_cents >= 900000 AND amount_cents < 1000000\n  GROUP BY account_id, txn_date\n  HAVING COUNT(*) >= 3\n),\nnet AS (\n  SELECT account_id,\n         SUM(CASE WHEN direction = 'credit' THEN amount_cents ELSE -amount_cents END) AS net_cents\n  FROM transactions\n  WHERE status = 'posted'\n  GROUP BY account_id\n)\nSELECT al.alert_id, a.holder_name, al.alert_type, al.severity,\n       d.deposit_n, d.deposit_total, n.net_cents\nFROM deposits d\nJOIN alerts al ON al.account_id = d.account_id AND al.alert_type = 'structuring'\nJOIN accounts a ON a.account_id = d.account_id\nJOIN net n ON n.account_id = d.account_id;`, order: "any" },
    ],
  },
];
