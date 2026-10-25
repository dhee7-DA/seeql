// Round 10 — authoring fact sheet: every number the Finance Core content may cite.
// Output saved to scripts/r10-facts.txt and read while writing statements.
import Database from "bun:sqlite";
import { DM_FIN_SCHEMA } from "../src/lib/leetcode/content/dm-fin-schema";
import { DM_FIN_SEED } from "../src/lib/leetcode/content/dm-fin-seed";

const db = new Database(":memory:");
db.exec(DM_FIN_SCHEMA.ddl);
db.exec(DM_FIN_SEED);
const q = (sql: string) => db.prepare(sql).all();
const show = (title: string, sql: string) => {
  console.log(`\n## ${title}`);
  for (const r of q(sql)) console.log("  " + JSON.stringify(r));
};

show("accounts roster", `SELECT * FROM accounts ORDER BY account_id`);

show("per-account POSTED debit vol + fee + txn count + credits", `
  SELECT account_id,
         SUM(CASE WHEN direction='debit' THEN amount_cents ELSE 0 END) debit_vol,
         ROUND(SUM(CASE WHEN direction='debit' THEN amount_cents*interchange_bps ELSE 0 END)/10000.0, 2) fee,
         SUM(CASE WHEN direction='credit' THEN amount_cents ELSE 0 END) credit_vol,
         COUNT(*) rows_
  FROM transactions WHERE status='posted' GROUP BY account_id ORDER BY debit_vol DESC`);

show("posted debit vol ranked RANK/DENSE", `
  SELECT account_id, SUM(amount_cents) vol,
         RANK() OVER (ORDER BY SUM(amount_cents) DESC) r,
         DENSE_RANK() OVER (ORDER BY SUM(amount_cents) DESC) dr
  FROM transactions WHERE status='posted' AND direction='debit'
  GROUP BY account_id ORDER BY r, account_id`);

show("per-account recency/frequency/monetary (posted debits, vs 2026-07-01)", `
  SELECT account_id, COUNT(*) freq, MAX(txn_date) last_txn,
         JULIANDAY('2026-07-01') - JULIANDAY(MAX(txn_date)) recency_days,
         SUM(amount_cents) monetary
  FROM transactions WHERE status='posted' AND direction='debit'
  GROUP BY account_id ORDER BY monetary DESC`);

show("daily posted debit (all)", `
  SELECT txn_date, SUM(amount_cents) vol, COUNT(*) n
  FROM transactions WHERE status='posted' AND direction='debit'
  GROUP BY txn_date ORDER BY txn_date`);

show("daily volumes DENSE_RANKED top 12", `
  SELECT txn_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) dr FROM (
    SELECT txn_date, SUM(amount_cents) vol
    FROM transactions WHERE status='posted' AND direction='debit'
    GROUP BY txn_date) ORDER BY dr, txn_date LIMIT 14`);

show("monthly posted debit + credit", `
  SELECT strftime('%Y-%m', txn_date) m,
         SUM(CASE WHEN direction='debit' THEN amount_cents ELSE 0 END) debits,
         SUM(CASE WHEN direction='credit' THEN amount_cents ELSE 0 END) credits
  FROM transactions WHERE status='posted' GROUP BY m ORDER BY m`);

show("per-merchant posted debit vol + fee + txns", `
  SELECT m.merchant_id, m.name, m.category, COUNT(t.txn_id) txns,
         SUM(t.amount_cents) vol,
         ROUND(SUM(t.amount_cents * t.interchange_bps)/10000.0, 2) fee
  FROM merchants m LEFT JOIN transactions t ON t.merchant_id = m.merchant_id AND t.status='posted' AND t.direction='debit'
  GROUP BY m.merchant_id ORDER BY vol DESC`);

show("fee revenue by category (posted debits)", `
  SELECT m.category, ROUND(SUM(t.amount_cents * t.interchange_bps)/10000.0, 2) fee,
         COUNT(t.txn_id) txns
  FROM transactions t JOIN merchants m ON m.merchant_id = t.merchant_id
  WHERE t.status='posted' AND t.direction='debit'
  GROUP BY m.category ORDER BY fee DESC`);

show("per-account x category spend (posted debits)", `
  SELECT t.account_id, m.category, SUM(t.amount_cents) vol
  FROM transactions t JOIN merchants m ON m.merchant_id = t.merchant_id
  WHERE t.status='posted' AND t.direction='debit'
  GROUP BY t.account_id, m.category ORDER BY t.account_id, vol DESC`);

show("channel census", `
  SELECT channel, COUNT(*) n, SUM(CASE WHEN direction='debit' THEN amount_cents ELSE 0 END) debit_vol
  FROM transactions WHERE status='posted' GROUP BY channel ORDER BY n DESC`);

show("rewards rows detail", `SELECT txn_id, account_id, amount_cents, reward_cents FROM transactions WHERE reward_cents IS NOT NULL ORDER BY reward_cents DESC`);

show("per-account reward totals (posted)", `
  SELECT account_id, COUNT(*) n, SUM(reward_cents) total_reward
  FROM transactions WHERE status='posted' AND reward_cents IS NOT NULL
  GROUP BY account_id ORDER BY total_reward DESC`);

show("auth results per account", `
  SELECT account_id, SUM(result='approved') approved, SUM(result='declined') declined
  FROM auths GROUP BY account_id ORDER BY account_id`);

show("decline reasons", `
  SELECT decline_reason, COUNT(*) n, GROUP_CONCAT(account_id) accounts
  FROM auths WHERE result='declined' GROUP BY decline_reason ORDER BY n DESC`);

show("auths per account detail", `SELECT * FROM auths ORDER BY auth_id`);

show("high-amount declined auths", `
  SELECT account_id, amount_cents, decline_reason, strftime('%Y-%m-%d', auth_ts, 'unixepoch') d
  FROM auths WHERE result='declined' AND amount_cents >= 45000 ORDER BY amount_cents DESC`);

show("transfers detail", `SELECT * FROM transfers ORDER BY transfer_id`);

show("transfer lanes", `
  SELECT from_account, to_account, COUNT(*) n, SUM(amount_cents) total
  FROM transfers GROUP BY from_account, to_account ORDER BY n DESC, total DESC`);

show("transfers per account (as sender / receiver, settled)", `
  SELECT a.account_id,
    (SELECT COUNT(*) FROM transfers t WHERE t.from_account = a.account_id AND t.status='settled') sent_n,
    (SELECT SUM(t.amount_cents) FROM transfers t WHERE t.from_account = a.account_id AND t.status='settled') sent_vol,
    (SELECT COUNT(*) FROM transfers t WHERE t.to_account = a.account_id AND t.status='settled') recv_n,
    (SELECT SUM(t.amount_cents) FROM transfers t WHERE t.to_account = a.account_id AND t.status='settled') recv_vol
  FROM accounts a ORDER BY a.account_id`);

show("alerts detail", `SELECT * FROM alerts ORDER BY alert_id`);

show("alerts per account with holder", `
  SELECT a.account_id, a.holder_name, COUNT(al.alert_id) n,
         SUM(al.status='open') open_n, SUM(al.severity='high') high_n
  FROM accounts a LEFT JOIN alerts al ON al.account_id = a.account_id
  GROUP BY a.account_id ORDER BY n DESC, a.account_id`);

show("accounts by branch x type", `
  SELECT branch, account_type, COUNT(*) n FROM accounts GROUP BY branch, account_type ORDER BY branch, account_type`);

show("net flow per account (posted: credits - debits)", `
  SELECT account_id,
         SUM(CASE WHEN direction='credit' THEN amount_cents ELSE -amount_cents END) net
  FROM transactions WHERE status='posted' GROUP BY account_id ORDER BY net DESC`);

show("biggest posted debits top 8", `
  SELECT txn_id, account_id, merchant_id, txn_date, amount_cents, channel
  FROM transactions WHERE status='posted' AND direction='debit'
  ORDER BY amount_cents DESC LIMIT 8`);

db.close();
console.log("\nFACT SHEET COMPLETE");
