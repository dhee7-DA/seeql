// Round 11 — authoring fact sheet: every number the Fraud & AML content may cite.
// Output saved to scripts/r11-facts.txt and read while writing statements.
import Database from "bun:sqlite";
import { DM_FRAUD_SCHEMA } from "../src/lib/leetcode/content/dm-fraud-schema";
import { DM_FRAUD_SEED } from "../src/lib/leetcode/content/dm-fraud-seed";

const db = new Database(":memory:");
db.exec(DM_FRAUD_SCHEMA.ddl);
db.exec(DM_FRAUD_SEED);
const q = (sql: string) => db.prepare(sql).all();
const show = (title: string, sql: string) => {
  console.log(`\n## ${title}`);
  for (const r of q(sql)) console.log("  " + JSON.stringify(r));
};

show("users roster", `SELECT * FROM users ORDER BY user_id`);
show("devices roster", `SELECT * FROM devices ORDER BY device_id`);

show("per-user SETTLED sent vol + count + received vol", `
  SELECT u.user_id,
    COALESCE(s.vol, 0) sent_vol, COALESCE(s.n, 0) sent_n,
    COALESCE(r.vol, 0) recv_vol, COALESCE(r.n, 0) recv_n
  FROM users u
  LEFT JOIN (SELECT sender_id, SUM(amount_cents) vol, COUNT(*) n FROM p2p WHERE status='settled' GROUP BY sender_id) s ON s.sender_id = u.user_id
  LEFT JOIN (SELECT receiver_id, SUM(amount_cents) vol, COUNT(*) n FROM p2p WHERE status='settled' GROUP BY receiver_id) r ON r.receiver_id = u.user_id
  ORDER BY u.user_id`);

show("sent ranked RANK/DENSE (settled)", `
  SELECT * FROM (
    SELECT sender_id u, SUM(amount_cents) vol,
      RANK() OVER (ORDER BY SUM(amount_cents) DESC) r,
      DENSE_RANK() OVER (ORDER BY SUM(amount_cents) DESC) dr
    FROM p2p WHERE status='settled' GROUP BY sender_id) ORDER BY r, u`);

show("received ranked RANK/DENSE (settled)", `
  SELECT * FROM (
    SELECT receiver_id u, SUM(amount_cents) vol,
      RANK() OVER (ORDER BY SUM(amount_cents) DESC) r,
      DENSE_RANK() OVER (ORDER BY SUM(amount_cents) DESC) dr
    FROM p2p WHERE status='settled' GROUP BY receiver_id) ORDER BY r, u`);

show("daily settled sent volume (all 37)", `
  SELECT p2p_date, SUM(amount_cents) vol, COUNT(*) n
  FROM p2p WHERE status='settled' GROUP BY p2p_date ORDER BY p2p_date`);

show("daily volume DENSE top 10", `
  SELECT * FROM (
    SELECT p2p_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) dr FROM (
      SELECT p2p_date, SUM(amount_cents) vol FROM p2p WHERE status='settled' GROUP BY p2p_date))
  WHERE dr <= 10 ORDER BY dr, p2p_date`);

show("monthly settled sent", `
  SELECT strftime('%Y-%m', p2p_date) m, SUM(amount_cents) vol, COUNT(*) n
  FROM p2p WHERE status='settled' GROUP BY m ORDER BY m`);

show("channel mix (all rows + settled only)", `
  SELECT channel, COUNT(*) n_all, SUM(CASE WHEN status='settled' THEN 1 ELSE 0 END) n_settled,
         SUM(CASE WHEN status='settled' THEN amount_cents ELSE 0 END) settled_vol,
         ROUND(AVG(CASE WHEN status='settled' THEN risk_score END), 1) avg_risk_settled
  FROM p2p GROUP BY channel ORDER BY channel`);

show("non-settled rows detail", `
  SELECT p2p_id, sender_id, receiver_id, p2p_date, amount_cents, channel, status, risk_score
  FROM p2p WHERE status <> 'settled' ORDER BY p2p_id`);

show("high-risk rows (>=80)", `
  SELECT p2p_id, sender_id, receiver_id, p2p_date, amount_cents, risk_score
  FROM p2p WHERE risk_score >= 80 ORDER BY p2p_id`);

show("risk buckets", `
  SELECT CASE WHEN risk_score >= 80 THEN '80+' WHEN risk_score >= 30 THEN '30-79' ELSE '<30' END bucket,
         COUNT(*) n, SUM(amount_cents) vol
  FROM p2p GROUP BY bucket ORDER BY bucket`);

show("mirror rows U5", `SELECT p2p_id, receiver_id, p2p_date, amount_cents, channel FROM p2p WHERE sender_id = 5 ORDER BY p2p_id`);
show("mirror rows U7", `SELECT p2p_id, receiver_id, p2p_date, amount_cents, channel FROM p2p WHERE sender_id = 7 ORDER BY p2p_id`);
show("mirror rows U8 + U9", `SELECT p2p_id, sender_id, receiver_id, p2p_date, amount_cents, channel FROM p2p WHERE sender_id IN (8, 9) ORDER BY sender_id, p2p_id`);

show("logins per user (+sessions 1800s)", `
  WITH seq AS (SELECT user_id, login_ts, LAG(login_ts) OVER (PARTITION BY user_id ORDER BY login_ts) prev_ts FROM logins),
  stamps AS (SELECT user_id, login_ts,
    SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
      OVER (PARTITION BY user_id ORDER BY login_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT u.user_id, COUNT(l.login_id) logins, COUNT(DISTINCT s.sess) sessions
  FROM users u
  LEFT JOIN logins l ON l.user_id = u.user_id
  LEFT JOIN (SELECT user_id, login_ts, sess FROM stamps) s ON s.user_id = u.user_id AND s.login_ts = l.login_ts
  GROUP BY u.user_id ORDER BY u.user_id`);

show("logins per user per day", `
  SELECT user_id, strftime('%Y-%m-%d', login_ts, 'unixepoch') d, COUNT(*) n,
         SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) fails
  FROM logins GROUP BY user_id, d ORDER BY user_id, d`);

show("logins per device", `
  SELECT d.device_id, d.user_id, d.label, d.trusted, COUNT(l.login_id) uses
  FROM devices d LEFT JOIN logins l ON l.device_id = d.device_id
  GROUP BY d.device_id ORDER BY d.device_id`);

show("per-user device count", `
  SELECT u.user_id, COUNT(d.device_id) devices
  FROM users u LEFT JOIN devices d ON d.user_id = u.user_id
  GROUP BY u.user_id ORDER BY u.user_id`);

show("U1 full timeline", `
  SELECT login_id, device_id, ip_country, login_ts, result, fail_reason,
         login_ts - LAG(login_ts) OVER (ORDER BY login_ts) gap_prev
  FROM logins WHERE user_id = 1 ORDER BY login_ts`);

show("U4 07-21 burst", `
  SELECT login_id, ip_country, login_ts, result, fail_reason,
         login_ts - LAG(login_ts) OVER (ORDER BY login_ts) gap_prev
  FROM logins WHERE user_id = 4 AND login_ts >= 1784592000 AND login_ts < 1784678400 ORDER BY login_ts`);

show("disputes joined to p2p", `
  SELECT d.dispute_id, d.user_id claimant, d.p2p_id, d.amount_cents claim, p.amount_cents actual,
         p.sender_id, p.receiver_id, p.p2p_date, d.reason, d.status, d.filed_date
  FROM disputes d JOIN p2p p ON p.p2p_id = d.p2p_id ORDER BY d.dispute_id`);

show("dispute claimants", `SELECT user_id, COUNT(*) n FROM disputes GROUP BY user_id ORDER BY n DESC, user_id`);

show("cases roster", `SELECT * FROM cases ORDER BY case_id`);

show("cases per user", `
  SELECT u.user_id, u.handle, COUNT(c.case_id) n, SUM(c.sar_filed) sars
  FROM users u LEFT JOIN cases c ON c.user_id = u.user_id
  GROUP BY u.user_id HAVING n > 0 ORDER BY n DESC, u.user_id`);

show("U1 sessions detail (1800s)", `
  WITH seq AS (SELECT login_ts, LAG(login_ts) OVER (ORDER BY login_ts) prev_ts FROM logins WHERE user_id = 1),
  stamps AS (SELECT login_ts, SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
    OVER (ORDER BY login_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT login_ts, sess FROM stamps ORDER BY login_ts`);

show("velocity pairs (failed<=300s)", `
  SELECT a.user_id, a.login_id a_id, b.login_id b_id, b.login_ts - a.login_ts gap
  FROM logins a JOIN logins b ON a.user_id = b.user_id AND a.login_id < b.login_id
  WHERE a.result = 'failed' AND b.result = 'failed' AND b.login_ts - a.login_ts <= 300
  ORDER BY a.user_id, a_id, b_id`);

show("users joined login geo spread", `
  SELECT user_id, COUNT(DISTINCT ip_country) countries, GROUP_CONCAT(DISTINCT ip_country) geos
  FROM logins GROUP BY user_id ORDER BY countries DESC, user_id`);

show("biggest settled single transfers", `
  SELECT p2p_id, sender_id, receiver_id, p2p_date, amount_cents, channel, risk_score
  FROM p2p WHERE status='settled' ORDER BY amount_cents DESC LIMIT 10`);

show("per-user max single send", `
  SELECT sender_id, MAX(amount_cents) biggest, COUNT(*) n
  FROM p2p WHERE status='settled' GROUP BY sender_id ORDER BY biggest DESC`);

db.close();
console.log("\nfact sheet complete");
