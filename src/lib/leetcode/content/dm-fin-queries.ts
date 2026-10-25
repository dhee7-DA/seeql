// Domain Mastery — Finance Core · 60 query problems (20 Easy / 20 Medium /
// 20 Hard), all reading the ONE shared world seed in dm-fin-seed.ts.
// Statements cite only probe-verified facts (scripts/r10-fin-probe.ts +
// scripts/r10-facts.txt). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_FIN_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "Stripe",
    title: "Posted ledger count",
    statement:
      "The ledger mixes posted, pending, declined and reversed rows. Count how many transactions have status 'posted'. Output a single column posted_txns with one row.",
    code: `SELECT COUNT(*) AS posted_txns
FROM transactions
WHERE status = 'posted';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "Visa",
    title: "Savings roster",
    statement:
      "List the savings accounts. Output account_id, holder_name, branch and opened_date, ordered by opened_date ascending (earliest first), then account_id ascending.",
    code: `SELECT account_id, holder_name, branch, opened_date
FROM accounts
WHERE account_type = 'savings'
ORDER BY opened_date ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "Channel census",
    statement:
      "List every distinct channel value that appears in the transactions table, one per row, ordered alphabetically. Single column: channel.",
    code: `SELECT DISTINCT channel
FROM transactions
ORDER BY channel ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Capital One",
    title: "Branch sizes",
    statement:
      "Count the accounts per branch. Output branch and account_count, ordered by account_count descending, then branch ascending. Dubai is the smallest branch — it should surface at the bottom.",
    code: `SELECT branch, COUNT(*) AS account_count
FROM accounts
GROUP BY branch
ORDER BY account_count DESC, branch ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Stripe",
    title: "Grocery rate card",
    statement:
      "List the Grocery merchants whose current interchange rate is at least 100 basis points. Output merchant_id, name and fee_bps, ordered by fee_bps descending, then name ascending.",
    code: `SELECT merchant_id, name, fee_bps
FROM merchants
WHERE category = 'Grocery' AND fee_bps >= 100
ORDER BY fee_bps DESC, name ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Visa",
    title: "Priciest rate tiers",
    statement:
      "List the five merchants with the highest current interchange rate. Output merchant_id, name and fee_bps, ordered by fee_bps descending, then merchant_id ascending. Note the never-used merchant that still makes the cut.",
    code: `SELECT merchant_id, name, fee_bps
FROM merchants
ORDER BY fee_bps DESC, merchant_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "Pending queue depth",
    statement:
      "Count how many transactions are still sitting in 'pending' status. Output a single column pending_txns with one row.",
    code: `SELECT COUNT(*) AS pending_txns
FROM transactions
WHERE status = 'pending';`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "Capital One",
    title: "2026 vintage",
    statement:
      "List the accounts opened in 2026 (opened_date on or after '2026-01-01'). Output account_id, holder_name, branch and tier, ordered by opened_date ascending, then account_id ascending.",
    code: `SELECT account_id, holder_name, branch, tier
FROM accounts
WHERE opened_date >= '2026-01-01'
ORDER BY opened_date ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Stripe",
    title: "One busy morning",
    statement:
      "Pull every transaction dated '2026-03-02'. Output txn_id, account_id, merchant_id and amount_cents, ordered by txn_id ascending.",
    code: `SELECT txn_id, account_id, merchant_id, amount_cents
FROM transactions
WHERE txn_date = '2026-03-02'
ORDER BY txn_id ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Visa",
    title: "Declined authorizations",
    statement:
      "In the auths table, count the authorization attempts whose result is 'declined'. Output a single column declined_auths with one row.",
    code: `SELECT COUNT(*) AS declined_auths
FROM auths
WHERE result = 'declined';`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "High-severity queue",
    statement:
      "List the alerts rated severity 'high'. Output alert_id, account_id, alert_type and status, ordered by alert_id ascending.",
    code: `SELECT alert_id, account_id, alert_type, status
FROM alerts
WHERE severity = 'high'
ORDER BY alert_id ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Capital One",
    title: "Alert taxonomy",
    statement:
      "List every distinct alert_type that appears in the alerts table, one per row, ordered alphabetically. Single column: alert_type.",
    code: `SELECT DISTINCT alert_type
FROM alerts
ORDER BY alert_type ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "Stripe",
    title: "Total money out",
    statement:
      "Compute the total posted debit volume in cents: sum amount_cents over rows with status 'posted' and direction 'debit'. Output a single column total_debit_volume with one row.",
    code: `SELECT SUM(amount_cents) AS total_debit_volume
FROM transactions
WHERE status = 'posted' AND direction = 'debit';`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "Visa",
    title: "Largest single entry",
    statement:
      "Find the largest amount_cents of any transaction, regardless of status or direction. Output a single column largest_txn with one row.",
    code: `SELECT MAX(amount_cents) AS largest_txn
FROM transactions;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "Merchant footprint",
    statement:
      "Count the merchants per country. Output country and merchant_count, ordered by merchant_count descending, then country ascending.",
    code: `SELECT country, COUNT(*) AS merchant_count
FROM merchants
GROUP BY country
ORDER BY merchant_count DESC, country ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Capital One",
    title: "Credit accounts",
    statement:
      "List the credit-card accounts. Output account_id, holder_name and branch, ordered by account_id ascending.",
    code: `SELECT account_id, holder_name, branch
FROM accounts
WHERE account_type = 'credit'
ORDER BY account_id ASC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Stripe",
    title: "Cashback paid",
    statement:
      "Sum the cashback actually posted: total reward_cents over posted rows where a reward exists. Output a single column total_rewards with one row.",
    code: `SELECT SUM(reward_cents) AS total_rewards
FROM transactions
WHERE status = 'posted' AND reward_cents IS NOT NULL;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Visa",
    title: "Failed transfers",
    statement:
      "List the internal transfers that failed. Output transfer_id, from_account, to_account and amount_cents, ordered by transfer_id ascending.",
    code: `SELECT transfer_id, from_account, to_account, amount_cents
FROM transfers
WHERE status = 'failed'
ORDER BY transfer_id ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "JPMorgan",
    title: "Direction split",
    statement:
      "Among POSTED transactions, count the rows per direction. Output direction and txn_count, ordered by direction ascending.",
    code: `SELECT direction, COUNT(*) AS txn_count
FROM transactions
WHERE status = 'posted'
GROUP BY direction
ORDER BY direction ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "Capital One",
    title: "Category shelf",
    statement:
      "Count the merchants per category. Output category and merchant_count, ordered by merchant_count descending, then category ascending.",
    code: `SELECT category, COUNT(*) AS merchant_count
FROM merchants
GROUP BY category
ORDER BY merchant_count DESC, category ASC;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Stripe",
    title: "Spend league table",
    statement:
      "Rank nothing yet — just build the league: posted debit volume per account. Output account_id and debit_vol, ordered by debit_vol descending, then account_id ascending. Two exact ties are planted in this table.",
    code: `SELECT account_id, SUM(amount_cents) AS debit_vol
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY account_id
ORDER BY debit_vol DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Visa",
    title: "RANK the spenders",
    statement:
      "Rank accounts by posted debit volume with RANK(). Output account_id, debit_vol and volume_rank, ordered by volume_rank ascending, then account_id ascending. Watch what RANK does after the two tied pairs.",
    code: `WITH vol AS (
  SELECT account_id, SUM(amount_cents) AS debit_vol
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY account_id
)
SELECT account_id, debit_vol,
       RANK() OVER (ORDER BY debit_vol DESC) AS volume_rank
FROM vol
ORDER BY volume_rank ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "DENSE_RANK the spenders",
    statement:
      "Same league, DENSE_RANK() this time. Output account_id, debit_vol and volume_rank, ordered by volume_rank ascending, then account_id ascending. Compare with the RANK version: no gaps here.",
    code: `WITH vol AS (
  SELECT account_id, SUM(amount_cents) AS debit_vol
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY account_id
)
SELECT account_id, debit_vol,
       DENSE_RANK() OVER (ORDER BY debit_vol DESC) AS volume_rank
FROM vol
ORDER BY volume_rank ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Capital One",
    title: "Every account, even the quiet one",
    statement:
      "LEFT JOIN accounts to posted transactions and count each account's posted rows. Account 11 has none — it must still appear, with a zero. Output account_id, holder_name and posted_txns, ordered by account_id ascending.",
    code: `SELECT a.account_id, a.holder_name, COUNT(t.txn_id) AS posted_txns
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'
GROUP BY a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Stripe",
    title: "Monthly volume trend",
    statement:
      "Aggregate posted debit volume per month (strftime('%Y-%m', txn_date)). Output month and debit_vol, ordered by month ascending. June's spike and May's slump are both real.",
    code: `SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Visa",
    title: "Merchant volumes, honest zeros",
    statement:
      "LEFT JOIN merchants to their posted debit transactions and sum the volume. The merchant with no activity must show 0, not vanish. Output merchant_id, name and debit_vol, ordered by debit_vol descending, then merchant_id ascending.",
    code: `SELECT m.merchant_id, m.name, COALESCE(SUM(t.amount_cents), 0) AS debit_vol
FROM merchants m
LEFT JOIN transactions t
  ON t.merchant_id = m.merchant_id AND t.status = 'posted' AND t.direction = 'debit'
GROUP BY m.merchant_id
ORDER BY debit_vol DESC, m.merchant_id ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "Interchange by category",
    statement:
      "The bank earns amount_cents * interchange_bps / 10000 per posted debit. Aggregate that fee revenue per merchant category (round to 2 decimals). Output category and fee_cents, ordered by fee_cents descending, then category ascending. Insurance earns exactly zero — its one sale went out over wire.",
    code: `SELECT m.category,
       ROUND(SUM(t.amount_cents * t.interchange_bps) / 10000.0, 2) AS fee_cents
FROM transactions t
JOIN merchants m ON m.merchant_id = t.merchant_id
WHERE t.status = 'posted' AND t.direction = 'debit'
GROUP BY m.category
ORDER BY fee_cents DESC, m.category ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "Capital One",
    title: "Spend net of rewards",
    statement:
      "For each account, sum posted debit amounts minus the cashback: amount_cents - COALESCE(reward_cents, 0). Output account_id and net_spend, ordered by net_spend descending, then account_id ascending.",
    code: `SELECT account_id,
       SUM(amount_cents - COALESCE(reward_cents, 0)) AS net_spend
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY account_id
ORDER BY net_spend DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Stripe",
    title: "Six-figure accounts",
    statement:
      "Keep only the accounts whose posted debit volume exceeds 100000 cents. Output account_id and debit_vol, ordered by debit_vol descending, then account_id ascending. Five accounts clear the bar — the mirror pair squeezes in at 101200.",
    code: `SELECT account_id, SUM(amount_cents) AS debit_vol
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY account_id
HAVING SUM(amount_cents) > 100000
ORDER BY debit_vol DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Visa",
    title: "Transfer ledger with names",
    statement:
      "Join each settled transfer to BOTH endpoint accounts for holder names (a two-join self-network read). Output transfer_id, from_holder, to_holder and amount_cents, ordered by amount_cents descending, then transfer_id ascending. One holder sends money to themselves.",
    code: `SELECT t.transfer_id, fa.holder_name AS from_holder, ta.holder_name AS to_holder,
       t.amount_cents
FROM transfers t
JOIN accounts fa ON fa.account_id = t.from_account
JOIN accounts ta ON ta.account_id = t.to_account
WHERE t.status = 'settled'
ORDER BY t.amount_cents DESC, t.transfer_id ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Open risk queue",
    statement:
      "List the alerts still in 'open' status, joined to holder names. Output alert_id, holder_name, alert_type, severity and alert_date, ordered by alert_id ascending.",
    code: `SELECT al.alert_id, a.holder_name, al.alert_type, al.severity, al.alert_date
FROM alerts al
JOIN accounts a ON a.account_id = al.account_id
WHERE al.status = 'open'
ORDER BY al.alert_id ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Capital One",
    title: "Alerts per account, zeros included",
    statement:
      "Count each account's alerts with a LEFT JOIN — five accounts have never been alerted and must show 0. Output account_id, holder_name and alert_count, ordered by alert_count descending, then account_id ascending.",
    code: `SELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alert_count
FROM accounts a
LEFT JOIN alerts al ON al.account_id = a.account_id
GROUP BY a.account_id
ORDER BY alert_count DESC, a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Stripe",
    title: "Interchange drift audit",
    statement:
      "Card transactions carry the bps snapshot at processing time; merchants.fee_bps is today's rate. Join them and return the card rows where the two disagree. Output txn_id, merchant_name, txn_bps and current_bps, ordered by txn_id ascending.",
    code: `SELECT t.txn_id, m.name AS merchant_name,
       t.interchange_bps AS txn_bps, m.fee_bps AS current_bps
FROM transactions t
JOIN merchants m ON m.merchant_id = t.merchant_id
WHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps
ORDER BY t.txn_id ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "Visa",
    title: "Double-posting detector",
    statement:
      "Find account, merchant, date triples that posted MORE THAN ONE transaction. Output account_id, merchant_id, txn_date and line_count, ordered however the engine returns them (one row). Exactly one double-post exists.",
    code: `SELECT account_id, merchant_id, txn_date, COUNT(*) AS line_count
FROM transactions
WHERE merchant_id IS NOT NULL
GROUP BY account_id, merchant_id, txn_date
HAVING COUNT(*) > 1;`,
    order: "any",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "JPMorgan",
    title: "Auth scorecard per account",
    statement:
      "Approved and declined auth counts per account — including account 11, which has none (0/0 via LEFT JOIN + COALESCE). Output account_id, approved and declined, ordered by account_id ascending.",
    code: `WITH ac AS (
  SELECT account_id,
         SUM(CASE WHEN result = 'approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN result = 'declined' THEN 1 ELSE 0 END) AS declined
  FROM auths
  GROUP BY account_id
)
SELECT a.account_id,
       COALESCE(ac.approved, 0) AS approved,
       COALESCE(ac.declined, 0) AS declined
FROM accounts a
LEFT JOIN ac ON ac.account_id = a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Paynova",
    title: "Why cards get declined",
    statement:
      "Census the decline reasons across the auth window. Output decline_reason and decline_count, ordered by decline_count descending, then decline_reason ascending. Two reasons tie at the top.",
    code: `SELECT decline_reason, COUNT(*) AS decline_count
FROM auths
WHERE result = 'declined'
GROUP BY decline_reason
ORDER BY decline_count DESC, decline_reason ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Stripe",
    title: "Biggest single swipe",
    statement:
      "For each account, find its largest single posted debit. Output account_id and biggest_debit, ordered by biggest_debit descending, then account_id ascending. Two 62000 ties sit mid-table.",
    code: `SELECT account_id, MAX(amount_cents) AS biggest_debit
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY account_id
ORDER BY biggest_debit DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Paynova",
    title: "Repeat transfer lanes",
    statement:
      "Group transfers by (from_account, to_account) and keep only lanes that fired more than once. Output from_account, to_account, transfer_count and total_cents. Exactly one repeat lane exists.",
    code: `SELECT from_account, to_account, COUNT(*) AS transfer_count,
       SUM(amount_cents) AS total_cents
FROM transfers
GROUP BY from_account, to_account
HAVING COUNT(*) > 1;`,
    order: "any",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "Ledgerline Bank",
    title: "Dubai book",
    statement:
      "The Dubai branch holds exactly two accounts. List them with their posted debit volume (0 if none). Output account_id, holder_name and debit_vol, ordered by account_id ascending.",
    code: `SELECT a.account_id, a.holder_name,
       COALESCE(SUM(CASE WHEN t.direction = 'debit' THEN t.amount_cents END), 0) AS debit_vol
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'
WHERE a.branch = 'Dubai'
GROUP BY a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "Capital One",
    title: "Alert type triage",
    statement:
      "Per alert_type: how many alerts total, and how many are still 'open'. Output alert_type, total_alerts and open_alerts, ordered by alert_type ascending.",
    code: `SELECT alert_type, COUNT(*) AS total_alerts,
       SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_alerts
FROM alerts
GROUP BY alert_type
ORDER BY alert_type ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Paynova",
    title: "Structuring detector",
    statement:
      "Structuring = three or more same-day ATM cash credits, each at least 900000 but under 1000000 cents (slicing deposits to duck the reporting line). Output account_id, txn_date, deposit_count and total_cents for every group that fits — exactly one account trips the wire.",
    code: `SELECT account_id, txn_date, COUNT(*) AS deposit_count,
       SUM(amount_cents) AS total_cents
FROM transactions
WHERE channel = 'atm' AND direction = 'credit'
  AND amount_cents >= 900000 AND amount_cents < 1000000
GROUP BY account_id, txn_date
HAVING COUNT(*) >= 3;`,
    order: "any",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Paynova",
    title: "Card-testing velocity",
    statement:
      "Fraudsters fire bursts of small declines. Find accounts with at least 3 declined auths inside any 300-second window (self-join each decline to later declines, count, take the max per account). Output account_id and max_declines_5min for accounts that trip the threshold.",
    code: `SELECT account_id, MAX(cnt) AS max_declines_5min
FROM (
  SELECT a.account_id, a.auth_ts, COUNT(*) AS cnt
  FROM auths a
  JOIN auths b
    ON b.account_id = a.account_id AND b.result = 'declined'
   AND b.auth_ts BETWEEN a.auth_ts AND a.auth_ts + 300
  WHERE a.result = 'declined'
  GROUP BY a.account_id, a.auth_ts
)
GROUP BY account_id
HAVING MAX(cnt) >= 3;`,
    order: "any",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Sessionize the auth stream",
    statement:
      "Cut each account's auth timeline into sessions: a gap over 1800 seconds starts a new session (LAG + running SUM of gap flags). Count sessions per account — the dormant account must show 0 via the LEFT JOIN. Output account_id and sessions, ordered by account_id ascending.",
    code: `WITH seq AS (
  SELECT account_id, auth_ts,
         LAG(auth_ts) OVER (PARTITION BY account_id ORDER BY auth_ts) AS prev_ts
  FROM auths
),
stamps AS (
  SELECT account_id, auth_ts,
         SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
           OVER (PARTITION BY account_id ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) AS session_no
  FROM seq
)
SELECT a.account_id, COUNT(DISTINCT s.session_no) AS sessions
FROM accounts a
LEFT JOIN stamps s ON s.account_id = a.account_id
GROUP BY a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Paynova",
    title: "Inside the 45-minute gap",
    statement:
      "Rebuild account 1's July 20 timeline with session stamps (1800s cutoff). Output auth_ts, amount_cents, result and session_no, ordered by auth_ts ascending. The 2700-second pause before the big declined push splits the day in two.",
    code: `WITH seq AS (
  SELECT auth_ts, amount_cents, result,
         LAG(auth_ts) OVER (ORDER BY auth_ts) AS prev_ts
  FROM auths
  WHERE account_id = 1 AND auth_ts < 1784592000
),
stamps AS (
  SELECT auth_ts, amount_cents, result,
         SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
           OVER (ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) AS session_no
  FROM seq
)
SELECT auth_ts, amount_cents, result, session_no
FROM stamps
ORDER BY auth_ts ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Month-over-month momentum",
    statement:
      "Monthly posted debit volume plus its change versus the prior month via LAG. Output month, debit_vol and delta, ordered by month ascending; January's delta is NULL — that is the honest first row.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', txn_date) AS month, SUM(amount_cents) AS debit_vol
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY month
)
SELECT month, debit_vol,
       debit_vol - LAG(debit_vol) OVER (ORDER BY month) AS delta
FROM monthly
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Visa",
    title: "Top-6 volume days, ties intact",
    statement:
      "DENSE_RANK every day by posted debit volume and keep ranks 1 through 6. Output txn_date, vol and dr, ordered by dr ascending, then txn_date ascending. Rank 6 is shared by two lone-deposit days at exactly 62000.",
    code: `WITH daily AS (
  SELECT txn_date, SUM(amount_cents) AS vol
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY txn_date
),
ranked AS (
  SELECT txn_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) AS dr
  FROM daily
)
SELECT txn_date, vol, dr
FROM ranked
WHERE dr <= 6
ORDER BY dr ASC, txn_date ASC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Branch champions",
    statement:
      "Find each branch's biggest posted debit spender with a per-branch RANK. Output branch, account_id, holder_name and debit_vol, ordered by branch ascending, then debit_vol descending. Singapore crowns TWO accounts — the tie is real, keep both.",
    code: `WITH vol AS (
  SELECT a.account_id, a.holder_name, a.branch, SUM(t.amount_cents) AS debit_vol
  FROM accounts a
  JOIN transactions t ON t.account_id = a.account_id
    AND t.status = 'posted' AND t.direction = 'debit'
  GROUP BY a.account_id
),
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY branch ORDER BY debit_vol DESC) AS r
  FROM vol
)
SELECT branch, account_id, holder_name, debit_vol
FROM ranked
WHERE r = 1
ORDER BY branch ASC, debit_vol DESC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Capital One",
    title: "Net flow, sign included",
    statement:
      "Net flow per account = posted credits minus posted debits (debits subtract). Include the dormant account at 0 via LEFT JOIN + COALESCE. Output account_id and net_cents, ordered by net_cents descending, then account_id ascending. One account is massively cash-positive — that is the structuring story.",
    code: `SELECT a.account_id,
       COALESCE(SUM(CASE WHEN t.direction = 'credit' THEN t.amount_cents
                         ELSE -t.amount_cents END), 0) AS net_cents
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'
GROUP BY a.account_id
ORDER BY net_cents DESC, a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Running volume curve",
    statement:
      "Daily posted debit volume with a cumulative running total (SUM OVER, unbounded preceding). Output txn_date, day_vol and running_vol, ordered by txn_date ascending — 37 debit days, ending at the half-year grand total of 2354100.",
    code: `SELECT txn_date, SUM(amount_cents) AS day_vol,
       SUM(SUM(amount_cents)) OVER (ORDER BY txn_date ROWS UNBOUNDED PRECEDING) AS running_vol
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY txn_date
ORDER BY txn_date ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Stripe",
    title: "Who pays the bank's bills",
    statement:
      "Interchange fee per account on posted debits, plus each account's share of the bank-wide 18303.90 total, rounded to 1 decimal. Output account_id, fee_cents and share_pct, ordered by fee_cents descending, then account_id ascending. The volume leader pays exactly 0 — wires carry no interchange.",
    code: `WITH fees AS (
  SELECT account_id,
         ROUND(SUM(amount_cents * interchange_bps) / 10000.0, 2) AS fee_cents
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY account_id
)
SELECT account_id, fee_cents,
       ROUND(100.0 * fee_cents /
         (SELECT SUM(amount_cents * interchange_bps) / 10000.0
          FROM transactions WHERE status = 'posted' AND direction = 'debit'), 1) AS share_pct
FROM fees
ORDER BY fee_cents DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "JPMorgan",
    title: "Priced the rate-change",
    statement:
      "For every card row whose snapshot bps differs from the merchant's current rate, compute the fee delta the CURRENT rate would have earned: amount * (current - snapshot) / 10000, rounded to 2 decimals. Output txn_id, holder_name, merchant_name, txn_bps, current_bps and missed_fee, ordered by txn_id ascending. One row is negative — the old rate was richer.",
    code: `SELECT t.txn_id, a.holder_name, m.name AS merchant_name,
       t.interchange_bps AS txn_bps, m.fee_bps AS current_bps,
       ROUND(t.amount_cents * (m.fee_bps - t.interchange_bps) / 10000.0, 2) AS missed_fee
FROM transactions t
JOIN merchants m ON m.merchant_id = t.merchant_id
JOIN accounts a ON a.account_id = t.account_id
WHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps
ORDER BY t.txn_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Capital One",
    title: "Alerted but never declined",
    statement:
      "Join each alerted account to its auth scorecard (pre-aggregate first — alerts multiply rows). Output account_id, holder_name, alerts, approved and declined, ordered by account_id ascending. The dormant dark-web case shows 0/0.",
    code: `WITH ac AS (
  SELECT account_id,
         SUM(CASE WHEN result = 'approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN result = 'declined' THEN 1 ELSE 0 END) AS declined
  FROM auths
  GROUP BY account_id
)
SELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alerts,
       COALESCE(ac.approved, 0) AS approved,
       COALESCE(ac.declined, 0) AS declined
FROM accounts a
JOIN alerts al ON al.account_id = a.account_id
LEFT JOIN ac ON ac.account_id = a.account_id
GROUP BY a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Stripe",
    title: "Activity RFM",
    statement:
      "Bank-flavored RFM per account (posted debits only): recency_days = 2026-07-01 minus the last debit date (JULIANDAY, cast to INTEGER), freq = debit count, monetary = total cents. Output account_id, recency_days, freq and monetary, ordered by monetary descending, then account_id ascending.",
    code: `SELECT account_id,
       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(txn_date)) AS INTEGER) AS recency_days,
       COUNT(*) AS freq,
       SUM(amount_cents) AS monetary
FROM transactions
WHERE status = 'posted' AND direction = 'debit'
GROUP BY account_id
ORDER BY monetary DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Paynova",
    title: "Burst forensics",
    statement:
      "Pull account 4's declined auths with the seconds since the previous decline (LAG). Output auth_id, auth_ts, amount_cents and gap_seconds, ordered by auth_ts ascending. Three consecutive 90-second gaps — the card-test rhythm.",
    code: `SELECT auth_id, auth_ts, amount_cents,
       auth_ts - LAG(auth_ts) OVER (ORDER BY auth_ts) AS gap_seconds
FROM auths
WHERE account_id = 4 AND result = 'declined'
ORDER BY auth_ts ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Transfer network degree",
    statement:
      "Build the settled transfer graph as an edge list (UNION ALL of both endpoints) and count each account's degree, zeros included. Output account_id and degree, ordered by degree descending, then account_id ascending. The self-transfer still counts as degree 1.",
    code: `WITH edges AS (
  SELECT from_account AS account_id FROM transfers WHERE status = 'settled'
  UNION ALL
  SELECT to_account FROM transfers WHERE status = 'settled'
)
SELECT a.account_id, COUNT(e.account_id) AS degree
FROM accounts a
LEFT JOIN edges e ON e.account_id = a.account_id
GROUP BY a.account_id
ORDER BY degree DESC, a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Paynova",
    title: "Boundary audit",
    statement:
      "The reporting line sits at exactly 1000000 cents. In one row, count transactions at-or-above the line and strictly above it. Output at_or_above and strictly_above. The one-row gap between the two columns is the entire lesson.",
    code: `SELECT SUM(CASE WHEN amount_cents >= 1000000 THEN 1 ELSE 0 END) AS at_or_above,
       SUM(CASE WHEN amount_cents > 1000000 THEN 1 ELSE 0 END) AS strictly_above
FROM transactions;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Ledgerline Bank",
    title: "Risk book with volumes",
    statement:
      "For every alerted account: alert count plus posted debit volume (pre-aggregate the volume CTE, then join — joining transactions directly would multiply by alert count). Output account_id, holder_name, alerts and debit_vol, ordered by debit_vol descending, then account_id ascending. The dormant account closes the list at 0.",
    code: `WITH vol AS (
  SELECT account_id, SUM(amount_cents) AS debit_vol
  FROM transactions
  WHERE status = 'posted' AND direction = 'debit'
  GROUP BY account_id
)
SELECT a.account_id, a.holder_name, COUNT(al.alert_id) AS alerts,
       COALESCE(v.debit_vol, 0) AS debit_vol
FROM accounts a
JOIN alerts al ON al.account_id = a.account_id
LEFT JOIN vol v ON v.account_id = a.account_id
GROUP BY a.account_id
ORDER BY debit_vol DESC, a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Visa",
    title: "Branch book health",
    statement:
      "Average posted debit volume per account, per branch — zeros included (the dormant Singapore account drags its branch down). Output branch, avg_debit_vol (round 2) and accounts, ordered by avg_debit_vol descending, then branch ascending.",
    code: `WITH vol AS (
  SELECT a.account_id, a.branch,
         COALESCE(SUM(CASE WHEN t.direction = 'debit' THEN t.amount_cents END), 0) AS debit_vol
  FROM accounts a
  LEFT JOIN transactions t ON t.account_id = a.account_id AND t.status = 'posted'
  GROUP BY a.account_id
)
SELECT branch, ROUND(AVG(debit_vol), 2) AS avg_debit_vol, COUNT(*) AS accounts
FROM vol
GROUP BY branch
ORDER BY avg_debit_vol DESC, branch ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "JPMorgan",
    title: "Expense concentration",
    statement:
      "Per account, find the merchant category that takes the biggest slice of posted debit spend (per-account RANK) and its share of that account's total (round 1). Output account_id, category, vol and share_pct, ordered by share_pct descending, then account_id ascending. Three accounts are 100% concentrated.",
    code: `WITH spend AS (
  SELECT t.account_id, m.category, SUM(t.amount_cents) AS vol
  FROM transactions t
  JOIN merchants m ON m.merchant_id = t.merchant_id
  WHERE t.status = 'posted' AND t.direction = 'debit'
  GROUP BY t.account_id, m.category
),
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY account_id ORDER BY vol DESC) AS r,
         ROUND(100.0 * vol / SUM(vol) OVER (PARTITION BY account_id), 1) AS share_pct
  FROM spend
)
SELECT account_id, category, vol, share_pct
FROM ranked
WHERE r = 1
ORDER BY share_pct DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Paynova",
    title: "The full case file",
    statement:
      "Close the loop: join the structuring detector (3+ same-day ATM credits at 900000–999999) to the alert that was raised on the same behavior. Output alert_id, account_id, holder_name, alert_type, severity, deposit_n and deposit_total — one row, the whole story in evidence.",
    code: `WITH deposits AS (
  SELECT account_id, txn_date, COUNT(*) AS deposit_n, SUM(amount_cents) AS deposit_total
  FROM transactions
  WHERE channel = 'atm' AND direction = 'credit'
    AND amount_cents >= 900000 AND amount_cents < 1000000
  GROUP BY account_id, txn_date
  HAVING COUNT(*) >= 3
)
SELECT al.alert_id, d.account_id, a.holder_name, al.alert_type, al.severity,
       d.deposit_n, d.deposit_total
FROM deposits d
JOIN alerts al ON al.account_id = d.account_id AND al.alert_type = 'structuring'
JOIN accounts a ON a.account_id = d.account_id;`,
    order: "any",
  },
];
