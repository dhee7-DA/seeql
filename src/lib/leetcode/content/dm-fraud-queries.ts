// Domain Mastery — Fraud & AML · 60 query problems (20 Easy / 20 Medium /
// 20 Hard), all reading the ONE shared world seed in dm-fraud-seed.ts.
// Statements cite only probe-verified facts (scripts/r11-fraud-probe.ts +
// scripts/r11-facts.txt). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_FRAUD_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "PayPal",
    title: "Settled transfer count",
    statement:
      "The p2p ledger mixes settled, pending, failed and reversed rows. Count how many transfers have status 'settled'. Output a single column settled_p2p with one row.",
    code: `SELECT COUNT(*) AS settled_p2p
FROM p2p
WHERE status = 'settled';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "Block",
    title: "Basic-tier roster",
    statement:
      "List the users on the 'basic' KYC tier. Output user_id, handle, country and status, ordered by user_id ascending. Note the limited account hiding among them.",
    code: `SELECT user_id, handle, country, status
FROM users
WHERE kyc_tier = 'basic'
ORDER BY user_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Wise",
    title: "Rail census",
    statement:
      "List every distinct channel value that appears in the p2p table, one per row, ordered alphabetically. Single column: channel.",
    code: `SELECT DISTINCT channel
FROM p2p
ORDER BY channel ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Revolut",
    title: "Users per country",
    statement:
      "Count the users per country. Output country and user_count, ordered by user_count descending, then country ascending. Singapore is the smallest book.",
    code: `SELECT country, COUNT(*) AS user_count
FROM users
GROUP BY country
ORDER BY user_count DESC, country ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "Failed logins",
    statement:
      "In the logins table, count the attempts whose result is 'failed'. Output a single column failed_logins with one row.",
    code: `SELECT COUNT(*) AS failed_logins
FROM logins
WHERE result = 'failed';`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "Pending queue",
    statement:
      "List the pending p2p transfers. Output p2p_id, sender_id, receiver_id, amount_cents and p2p_date, ordered by p2p_id ascending. Three rows are stuck in flight.",
    code: `SELECT p2p_id, sender_id, receiver_id, amount_cents, p2p_date
FROM p2p
WHERE status = 'pending'
ORDER BY p2p_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "PayPal",
    title: "Top-5 largest settled",
    statement:
      "List the five largest settled transfers. Output p2p_id, sender_id, receiver_id and amount_cents, ordered by amount_cents descending, then p2p_id ascending. The wire sits exactly on the 1000000 line.",
    code: `SELECT p2p_id, sender_id, receiver_id, amount_cents
FROM p2p
WHERE status = 'settled'
ORDER BY amount_cents DESC, p2p_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "Block",
    title: "High-risk census",
    statement:
      "The risk model flags any transfer with risk_score >= 80. Count those rows. Output a single column high_risk with one row.",
    code: `SELECT COUNT(*) AS high_risk
FROM p2p
WHERE risk_score >= 80;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Wise",
    title: "Unauthorized claims",
    statement:
      "Count the disputes whose reason is 'unauthorized'. Output a single column unauthorized_claims with one row.",
    code: `SELECT COUNT(*) AS unauthorized_claims
FROM disputes
WHERE reason = 'unauthorized';`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Revolut",
    title: "Trusted devices",
    statement:
      "Count the devices with trusted = 1. Output a single column trusted_devices with one row.",
    code: `SELECT COUNT(*) AS trusted_devices
FROM devices
WHERE trusted = 1;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "SAR register",
    statement:
      "List the risk cases where a SAR was filed (sar_filed = 1). Output case_id, user_id, case_type and severity, ordered by case_id ascending.",
    code: `SELECT case_id, user_id, case_type, severity
FROM cases
WHERE sar_filed = 1
ORDER BY case_id ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "Restricted accounts",
    statement:
      "List the users whose status is NOT 'active'. Output user_id, handle, status and kyc_tier, ordered by user_id ascending. One is limited, one suspended.",
    code: `SELECT user_id, handle, status, kyc_tier
FROM users
WHERE status <> 'active'
ORDER BY user_id ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "PayPal",
    title: "Half-year settled volume",
    statement:
      "Sum amount_cents over settled transfers. Output a single column settled_volume with one row — the network moved 5418000 cents in the half.",
    code: `SELECT SUM(amount_cents) AS settled_volume
FROM p2p
WHERE status = 'settled';`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "Block",
    title: "Login traffic by day",
    statement:
      "Count login attempts per day. Output day (as 'YYYY-MM-DD' via strftime) and attempts, ordered by day ascending. The four telemetry days split 22/22/15/13.",
    code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day, COUNT(*) AS attempts
FROM logins
GROUP BY day
ORDER BY day ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Wise",
    title: "Dispute status census",
    statement:
      "Count disputes per status. Output status and dispute_count, ordered by dispute_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS dispute_count
FROM disputes
GROUP BY status
ORDER BY dispute_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Revolut",
    title: "One user's telemetry",
    statement:
      "Pull every login for user 1. Output login_id, device_id, ip_country, result and login_ts, ordered by login_ts ascending. Watch the countries flip mid-window.",
    code: `SELECT login_id, device_id, ip_country, result, login_ts
FROM logins
WHERE user_id = 1
ORDER BY login_ts ASC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "Inside the fan-out day",
    statement:
      "List every p2p transfer dated '2026-04-02'. Output p2p_id, sender_id, receiver_id, amount_cents and risk_score, ordered by p2p_id ascending. All four legs score 92.",
    code: `SELECT p2p_id, sender_id, receiver_id, amount_cents, risk_score
FROM p2p
WHERE p2p_date = '2026-04-02'
ORDER BY p2p_id ASC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "iOS device count",
    statement:
      "Count the devices running 'iOS'. Output a single column ios_devices with one row.",
    code: `SELECT COUNT(*) AS ios_devices
FROM devices
WHERE os = 'iOS';`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "PayPal",
    title: "Average risk, settled only",
    statement:
      "Compute the average risk_score over settled transfers, rounded to 1 decimal. Output a single column avg_risk with one row. Status filters matter — the failed 82-score payout would skew it.",
    code: `SELECT ROUND(AVG(risk_score), 1) AS avg_risk
FROM p2p
WHERE status = 'settled';`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "Block",
    title: "The leader's sends",
    statement:
      "List every p2p row where sender_id = 2. Output p2p_id, receiver_id, p2p_date, amount_cents and status, ordered by p2p_id ascending. Six sends — four of them are the fan-out legs.",
    code: `SELECT p2p_id, receiver_id, p2p_date, amount_cents, status
FROM p2p
WHERE sender_id = 2
ORDER BY p2p_id ASC;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Wise",
    title: "Sent volume leaderboard",
    statement:
      "Rank users by settled sent volume with RANK(). Output sender_id, sent_vol and rnk, ordered by rnk ascending, then sender_id ascending. Rank 3 is shared by the mirror pair at 581200 — the next rank is 5.",
    code: `WITH sent AS (
  SELECT sender_id, SUM(amount_cents) AS sent_vol
  FROM p2p
  WHERE status = 'settled'
  GROUP BY sender_id
)
SELECT sender_id, sent_vol,
       RANK() OVER (ORDER BY sent_vol DESC) AS rnk
FROM sent
ORDER BY rnk ASC, sender_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Revolut",
    title: "Who receives the money",
    statement:
      "Rank receivers by settled received volume and keep only rank 1. Output receiver_id and recv_vol with one row — the beneficiary pooled 1965900 without ever sending much.",
    code: `WITH recv AS (
  SELECT receiver_id, SUM(amount_cents) AS recv_vol
  FROM p2p
  WHERE status = 'settled'
  GROUP BY receiver_id
),
ranked AS (
  SELECT receiver_id, recv_vol,
         RANK() OVER (ORDER BY recv_vol DESC) AS rnk
  FROM recv
)
SELECT receiver_id, recv_vol
FROM ranked
WHERE rnk = 1
ORDER BY receiver_id ASC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "PayPal",
    title: "Fan-out detector",
    statement:
      "Smurfing fans out: find every sender+day group with at least 3 DISTINCT receivers where every leg stays under the 500000 EDD line. Output sender_id, p2p_date, receiver_count and max_amount, ordered by p2p_date ascending. Exactly one group fires.",
    code: `SELECT sender_id, p2p_date,
       COUNT(DISTINCT receiver_id) AS receiver_count,
       MAX(amount_cents) AS max_amount
FROM p2p
WHERE status = 'settled'
GROUP BY sender_id, p2p_date
HAVING COUNT(DISTINCT receiver_id) >= 3 AND MAX(amount_cents) < 500000
ORDER BY p2p_date ASC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Block",
    title: "Every user, honest zeros",
    statement:
      "Sent volume per user over settled transfers, keeping users who never sent at 0 via LEFT JOIN + COALESCE. Output user_id and sent_vol, ordered by sent_vol descending, then user_id ascending. The dormant user anchors the bottom.",
    code: `SELECT u.user_id,
       COALESCE(SUM(p.amount_cents), 0) AS sent_vol
FROM users u
LEFT JOIN p2p p ON p.sender_id = u.user_id AND p.status = 'settled'
GROUP BY u.user_id
ORDER BY sent_vol DESC, u.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Wise",
    title: "Name the beneficiary",
    statement:
      "Join the top receiver's volume to their handle. Output handle and recv_vol for the single biggest receiver — Ravi Chandra pooled 1965900 from four senders in one day.",
    code: `WITH recv AS (
  SELECT receiver_id, SUM(amount_cents) AS recv_vol
  FROM p2p
  WHERE status = 'settled'
  GROUP BY receiver_id
),
ranked AS (
  SELECT receiver_id, recv_vol,
         RANK() OVER (ORDER BY recv_vol DESC) AS rnk
  FROM recv
)
SELECT u.handle, r.recv_vol
FROM ranked r
JOIN users u ON u.user_id = r.receiver_id
WHERE r.rnk = 1
ORDER BY r.recv_vol DESC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Partial-dispute audit",
    statement:
      "Some disputes claim less than the transfer they cite. Join disputes to p2p and list every row where the claimed amount differs. Output dispute_id, claimant user_id, claim_cents, actual_cents and the shortfall (actual - claim), ordered by dispute_id ascending. Three partials drift.",
    code: `SELECT d.dispute_id, d.user_id, d.amount_cents AS claim_cents,
       p.amount_cents AS actual_cents,
       p.amount_cents - d.amount_cents AS shortfall
FROM disputes d
JOIN p2p p ON p.p2p_id = d.p2p_id
WHERE d.amount_cents <> p.amount_cents
ORDER BY d.dispute_id ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Duplicate-lane finder",
    statement:
      "Data hygiene: find sender+receiver+day groups that posted more than once. Output sender_id, receiver_id, p2p_date and lane_count, ordered by p2p_date ascending. Exactly one lane double-fires — 2026-01-19.",
    code: `SELECT sender_id, receiver_id, p2p_date, COUNT(*) AS lane_count
FROM p2p
GROUP BY sender_id, receiver_id, p2p_date
HAVING COUNT(*) > 1
ORDER BY p2p_date ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "PayPal",
    title: "Monthly momentum",
    statement:
      "Settled volume per month ('YYYY-MM' via strftime). Output month, volume and transfer count, ordered by month ascending. April explodes to 3949800 — the ring's month.",
    code: `SELECT strftime('%Y-%m', p2p_date) AS month,
       SUM(amount_cents) AS volume,
       COUNT(*) AS transfers
FROM p2p
WHERE status = 'settled'
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Block",
    title: "Login counts, zeros included",
    statement:
      "Count each user's login attempts, keeping silent users at 0 (LEFT JOIN). Output user_id and login_count, ordered by login_count descending, then user_id ascending. The dormant user never logs in.",
    code: `SELECT u.user_id, COUNT(l.login_id) AS login_count
FROM users u
LEFT JOIN logins l ON l.user_id = u.user_id
GROUP BY u.user_id
ORDER BY login_count DESC, u.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Wise",
    title: "Ghost devices",
    statement:
      "List devices that never appear in any login (anti-join). Output device_id, user_id, label and trusted, ordered by device_id ascending. Two devices are trusted on paper and never seen.",
    code: `SELECT d.device_id, d.user_id, d.label, d.trusted
FROM devices d
WHERE d.device_id NOT IN (SELECT device_id FROM logins)
ORDER BY d.device_id ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Revolut",
    title: "Disputes by claimant",
    statement:
      "Count disputes per claimant with their handle. Output handle and claim_count, ordered by claim_count descending, then handle ascending. The account-takeover victim files three.",
    code: `SELECT u.handle, COUNT(*) AS claim_count
FROM disputes d
JOIN users u ON u.user_id = d.user_id
GROUP BY d.user_id
ORDER BY claim_count DESC, handle ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Case load with SARs",
    statement:
      "Per user with at least one case: case count and SARs filed. Output handle, case_count and sar_total, ordered by case_count descending, then handle ascending. The mule leader owns 3 cases and 2 SARs.",
    code: `SELECT u.handle, COUNT(*) AS case_count,
       SUM(c.sar_filed) AS sar_total
FROM cases c
JOIN users u ON u.user_id = c.user_id
GROUP BY c.user_id
ORDER BY case_count DESC, handle ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Rail economics",
    statement:
      "Per channel over settled rows: transfer count and total volume. Output channel, transfers and volume, ordered by volume descending. Wallet rails carry 4029500 of the 5418000 total.",
    code: `SELECT channel, COUNT(*) AS transfers,
       SUM(amount_cents) AS volume
FROM p2p
WHERE status = 'settled'
GROUP BY channel
ORDER BY volume DESC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "PayPal",
    title: "Velocity pairs",
    statement:
      "Self-join failed logins: pair each failure with a LATER failure by the same user within 300 seconds. Output user_id, earlier login_id, later login_id and the gap, ordered by user_id, earlier id, later id. Eleven pairs — ten from the stuffing burst, one from the suspended account.",
    code: `SELECT a.user_id, a.login_id AS earlier_id,
       b.login_id AS later_id,
       b.login_ts - a.login_ts AS gap
FROM logins a
JOIN logins b ON b.user_id = a.user_id
  AND b.login_id > a.login_id
  AND b.login_ts - a.login_ts <= 300
WHERE a.result = 'failed' AND b.result = 'failed'
ORDER BY a.user_id ASC, earlier_id ASC, later_id ASC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Block",
    title: "Geo hoppers",
    statement:
      "List users whose logins come from more than one ip_country. Output user_id, country_count and the countries as a comma list (GROUP_CONCAT over DISTINCT, ordered), ordered by country_count descending, then user_id ascending. Three users hop countries.",
    code: `SELECT user_id,
       COUNT(DISTINCT ip_country) AS country_count,
       GROUP_CONCAT(DISTINCT ip_country) AS countries
FROM logins
GROUP BY user_id
HAVING COUNT(DISTINCT ip_country) > 1
ORDER BY country_count DESC, user_id ASC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Wise",
    title: "Biggest send per user",
    statement:
      "For each sender over settled rows, their single largest transfer. Output sender_id and biggest_send, ordered by biggest_send descending, then sender_id ascending. The wire gives user 10 the top single send despite ranking 2nd on volume.",
    code: `SELECT sender_id, MAX(amount_cents) AS biggest_send
FROM p2p
WHERE status = 'settled'
GROUP BY sender_id
ORDER BY biggest_send DESC, sender_id ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Revolut",
    title: "Reason by outcome",
    statement:
      "Cross-tab disputes: reason and won-vs-everything-else. Output reason, total claims and won_count, ordered by total descending, then reason ascending. Six unauthorized claims, two of them won.",
    code: `SELECT reason,
       COUNT(*) AS total_claims,
       SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won_count
FROM disputes
GROUP BY reason
ORDER BY total_claims DESC, reason ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Case intake by month",
    statement:
      "Count cases opened per month ('YYYY-MM'). Output month and opened_cases, ordered by month ascending. April intake peaks at 4 — the ring plus the takeover follow-up.",
    code: `SELECT strftime('%Y-%m', opened_date) AS month,
       COUNT(*) AS opened_cases
FROM cases
GROUP BY month
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Received volume, zeros kept",
    statement:
      "Received volume per user over settled transfers, honest zeros included (LEFT JOIN + COALESCE). Output user_id and recv_vol, ordered by recv_vol descending, then user_id ascending. Twelve rows — the beneficiary leads, the dormant user sits at 0.",
    code: `SELECT u.user_id,
       COALESCE(SUM(p.amount_cents), 0) AS recv_vol
FROM users u
LEFT JOIN p2p p ON p.receiver_id = u.user_id AND p.status = 'settled'
GROUP BY u.user_id
ORDER BY recv_vol DESC, u.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "PayPal",
    title: "Cross-border sends",
    statement:
      "Join each settled transfer to its sender's and receiver's country; keep the pairs where they differ. Output p2p_id, sender country as from_country and receiver country as to_country, ordered by p2p_id ascending. The suspended user's money moves across borders.",
    code: `SELECT p.p2p_id,
       su.country AS from_country,
       ru.country AS to_country
FROM p2p p
JOIN users su ON su.user_id = p.sender_id
JOIN users ru ON ru.user_id = p.receiver_id
WHERE p.status = 'settled' AND su.country <> ru.country
ORDER BY p.p2p_id ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Impossible travel",
    statement:
      "Flag pairs of logins by the same user from DIFFERENT ip_countries at most 3600 seconds apart (earlier login_id first). Output user_id, earlier login_id, later login_id, from_country, to_country and gap, ordered by user_id, earlier id. Exactly one pair exists — and it sits exactly ON the 3600-second line.",
    code: `SELECT a.user_id, a.login_id AS earlier_id,
       b.login_id AS later_id,
       a.ip_country AS from_country,
       b.ip_country AS to_country,
       b.login_ts - a.login_ts AS gap
FROM logins a
JOIN logins b ON b.user_id = a.user_id
  AND b.login_id > a.login_id
  AND b.login_ts - a.login_ts <= 3600
WHERE a.ip_country <> b.ip_country
ORDER BY a.user_id ASC, earlier_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "Inside the 45-minute gap",
    statement:
      "Rebuild user 1's login timeline with session stamps (1800s cutoff). Output login_ts, ip_country and session_no, ordered by login_ts ascending. The 2700-second pause on 07-20 splits that day in two; the SG hop later opens another.",
    code: `WITH seq AS (
  SELECT login_ts, ip_country,
         LAG(login_ts) OVER (ORDER BY login_ts) AS prev_ts
  FROM logins
  WHERE user_id = 1
),
stamps AS (
  SELECT login_ts, ip_country,
         SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
           OVER (ORDER BY login_ts ROWS UNBOUNDED PRECEDING) AS session_no
  FROM seq
)
SELECT login_ts, ip_country, session_no
FROM stamps
ORDER BY login_ts ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "PayPal",
    title: "The hand-off join",
    statement:
      "Layering leaves fingerprints: join each fan-out leg (sender 2, 2026-04-02) to the fan-in leg (2026-04-03) whose sender is the fan-out receiver. Output the fan-out p2p_id, mid_user, fan-in p2p_id as in_id, final_receiver, in_amount and skim (out 490000 minus in 480000), ordered by the fan-out id. Four hand-offs, 10000 skimmed each.",
    code: `SELECT fo.p2p_id,
       fo.receiver_id AS mid_user,
       fi.p2p_id AS in_id,
       fi.receiver_id AS final_receiver,
       fi.amount_cents AS in_amount,
       fo.amount_cents - fi.amount_cents AS skim
FROM p2p fo
JOIN p2p fi ON fi.sender_id = fo.receiver_id
  AND fi.p2p_date = '2026-04-03'
  AND fi.status = 'settled'
WHERE fo.sender_id = 2 AND fo.p2p_date = '2026-04-02'
  AND fo.status = 'settled'
ORDER BY fo.p2p_id ASC;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Block",
    title: "Top-8 volume days, ties intact",
    statement:
      "DENSE_RANK every day by settled sent volume and keep ranks 1 through 8. Output p2p_date, vol and dr, ordered by dr ascending, then p2p_date ascending. Ten rows come back: rank 8 is a three-way tie at 24900.",
    code: `WITH daily AS (
  SELECT p2p_date, SUM(amount_cents) AS vol
  FROM p2p
  WHERE status = 'settled'
  GROUP BY p2p_date
),
ranked AS (
  SELECT p2p_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) AS dr
  FROM daily
)
SELECT p2p_date, vol, dr
FROM ranked
WHERE dr <= 8
ORDER BY dr ASC, p2p_date ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Wise",
    title: "Month-over-month momentum",
    statement:
      "Monthly settled volume plus its change versus the prior month via LAG. Output month, volume and delta, ordered by month ascending; January's delta is NULL — that is the honest first row. April's jump is the ring's signature.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', p2p_date) AS month,
         SUM(amount_cents) AS volume
  FROM p2p
  WHERE status = 'settled'
  GROUP BY month
)
SELECT month, volume,
       volume - LAG(volume) OVER (ORDER BY month) AS delta
FROM monthly
ORDER BY month ASC;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Revolut",
    title: "Country champions",
    statement:
      "Find each country's biggest settled sender with a per-country RANK. Output country, sender_id, handle and sent_vol, ordered by country ascending, then sent_vol descending. Singapore crowns TWO senders — the tie is real, keep both.",
    code: `WITH vol AS (
  SELECT u.country, s.sender_id, u.handle, SUM(s.amount_cents) AS sent_vol
  FROM p2p s
  JOIN users u ON u.user_id = s.sender_id
  WHERE s.status = 'settled'
  GROUP BY s.sender_id
),
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY country ORDER BY sent_vol DESC) AS r
  FROM vol
)
SELECT country, sender_id, handle, sent_vol
FROM ranked
WHERE r = 1
ORDER BY country ASC, sent_vol DESC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Running volume curve",
    statement:
      "Daily settled volume with a cumulative running total (SUM OVER, unbounded preceding). Output p2p_date, day_vol and running_vol, ordered by p2p_date ascending — 37 settled days, ending at the half-year grand total of 5418000.",
    code: `SELECT p2p_date, SUM(amount_cents) AS day_vol,
       SUM(SUM(amount_cents)) OVER (ORDER BY p2p_date ROWS UNBOUNDED PRECEDING) AS running_vol
FROM p2p
WHERE status = 'settled'
GROUP BY p2p_date
ORDER BY p2p_date ASC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "Sessions per user",
    statement:
      "Sessionize every user's logins with the 1800-second cutoff, then count sessions per user — keeping users with zero logins at 0. Output user_id and sessions, ordered by sessions descending, then user_id ascending. The stuffing victim compresses 8 logins into 3 sessions; one user never logs in.",
    code: `WITH seq AS (
  SELECT user_id, login_ts,
         LAG(login_ts) OVER (PARTITION BY user_id ORDER BY login_ts) AS prev_ts
  FROM logins
),
stamps AS (
  SELECT user_id, login_ts,
         SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
           OVER (PARTITION BY user_id ORDER BY login_ts ROWS UNBOUNDED PRECEDING) AS sess
  FROM seq
)
SELECT u.user_id, COUNT(DISTINCT s.sess) AS sessions
FROM users u
LEFT JOIN stamps s ON s.user_id = u.user_id
GROUP BY u.user_id
ORDER BY sessions DESC, u.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "PayPal",
    title: "Net flow, sign included",
    statement:
      "Net flow per user = settled received minus settled sent. Include never-active users at 0 via LEFT JOIN + COALESCE. Output user_id and net_cents, ordered by net_cents descending, then user_id ascending. One user pools +1946400 while the volume leader bleeds -1984300.",
    code: `SELECT u.user_id,
       COALESCE(r.recv_vol, 0) - COALESCE(s.sent_vol, 0) AS net_cents
FROM users u
LEFT JOIN (SELECT sender_id, SUM(amount_cents) AS sent_vol
           FROM p2p WHERE status = 'settled' GROUP BY sender_id) s
  ON s.sender_id = u.user_id
LEFT JOIN (SELECT receiver_id, SUM(amount_cents) AS recv_vol
           FROM p2p WHERE status = 'settled' GROUP BY receiver_id) r
  ON r.receiver_id = u.user_id
ORDER BY net_cents DESC, u.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Block",
    title: "How much money is screaming",
    statement:
      "Of all settled volume, how much sits on high-risk rows (risk_score >= 80)? Output risky_vol, total_vol and the risky share as share_pct rounded to 1 decimal, one row. 4880000 of 5418000 — 90.1 percent of settled volume screams.",
    code: `SELECT SUM(CASE WHEN risk_score >= 80 THEN amount_cents ELSE 0 END) AS risky_vol,
       SUM(amount_cents) AS total_vol,
       ROUND(100.0 * SUM(CASE WHEN risk_score >= 80 THEN amount_cents ELSE 0 END)
         / SUM(amount_cents), 1) AS share_pct
FROM p2p
WHERE status = 'settled';`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "Wise",
    title: "Aging unauthorized queue",
    statement:
      "The open 'unauthorized' disputes are the ones still burning analyst time. List them with their age in days as of 2026-07-01: dispute_id, claimant user_id, filed_date and days_open (JULIANDAY difference, integer cast), ordered by days_open descending. Three rows — the oldest has waited 136 days.",
    code: `SELECT dispute_id, user_id, filed_date,
       CAST(JULIANDAY('2026-07-01') - JULIANDAY(filed_date) AS INTEGER) AS days_open
FROM disputes
WHERE reason = 'unauthorized' AND status = 'open'
ORDER BY days_open DESC, dispute_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Revolut",
    title: "The SAR registry",
    statement:
      "Compliance signs SARs. List every case with sar_filed = 1 joined to the user's handle. Output case_id, handle, case_type, severity and opened_date, ordered by case_id ascending. Three SARs, all on aml cases, two of them on the same mule.",
    code: `SELECT c.case_id, u.handle, c.case_type, c.severity, c.opened_date
FROM cases c
JOIN users u ON u.user_id = c.user_id
WHERE c.sar_filed = 1
ORDER BY c.case_id ASC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Trust versus usage",
    statement:
      "Device governance audit: every device with its login count, trusted flag included, zeros kept (LEFT JOIN). Output device_id, label, trusted and uses, ordered by uses descending, then device_id ascending. Fourteen rows — the most-used device is marked untrusted, and two trusted ones have zero uses.",
    code: `SELECT d.device_id, d.label, d.trusted, COUNT(l.login_id) AS uses
FROM devices d
LEFT JOIN logins l ON l.device_id = d.device_id
GROUP BY d.device_id
ORDER BY uses DESC, d.device_id ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "The daily fail funnel",
    statement:
      "Per telemetry day: attempts, failures and the fail rate as fail_pct rounded to 1 decimal (100.0 * fails / attempts). Output day, attempts, fails and fail_pct, ordered by day ascending. The stuffing day burns at 31.8 percent.",
    code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day,
       COUNT(*) AS attempts,
       SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) AS fails,
       ROUND(100.0 * SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS fail_pct
FROM logins
GROUP BY day
ORDER BY day ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "PayPal",
    title: "Velocity concentration",
    statement:
      "Count the failed-within-300s pairs per user (same self-join as the velocity screen), keeping only users with at least one pair. Output user_id and pair_count, ordered by pair_count descending, then user_id ascending. Two rows: the stuffing victim owns ten of the eleven pairs.",
    code: `SELECT a.user_id, COUNT(*) AS pair_count
FROM logins a
JOIN logins b ON b.user_id = a.user_id
  AND b.login_id > a.login_id
  AND b.login_ts - a.login_ts <= 300
WHERE a.result = 'failed' AND b.result = 'failed'
GROUP BY a.user_id
ORDER BY pair_count DESC, a.user_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Block",
    title: "The 500000 boundary registry",
    statement:
      "The EDD line sits at 500000 cents. In one row: under_line counts settled transfers crowding the band just beneath it (400000 to 499999), at_or_over counts everything from the line up, and max_settled names the ceiling. Eight legs duck under the line; one wire crosses it — the band filter is the whole story.",
    code: `SELECT SUM(CASE WHEN amount_cents >= 400000 AND amount_cents < 500000 THEN 1 ELSE 0 END) AS under_line,
       SUM(CASE WHEN amount_cents >= 500000 THEN 1 ELSE 0 END) AS at_or_over,
       MAX(amount_cents) AS max_settled
FROM p2p
WHERE status = 'settled';`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Wise",
    title: "The full ring dossier",
    statement:
      "Build the ring's paper trail: for each 04-03 fan-in leg, attach the upstream 04-02 fan-out leg and both endpoint names. Output the fan-in p2p_id, sender handle as mule_name, in_amount, the upstream sender handle as origin_name and the skim (upstream 490000 minus in 480000), ordered by the fan-in id. Four rows — every mule, every leg, every name.",
    code: `SELECT fi.p2p_id,
       su.handle AS mule_name,
       fi.amount_cents AS in_amount,
       ou.handle AS origin_name,
       fo.amount_cents - fi.amount_cents AS skim
FROM p2p fi
JOIN users su ON su.user_id = fi.sender_id
JOIN p2p fo ON fo.receiver_id = fi.sender_id
  AND fo.sender_id = 2
  AND fo.p2p_date = '2026-04-02'
  AND fo.status = 'settled'
JOIN users ou ON ou.user_id = fo.sender_id
WHERE fi.p2p_date = '2026-04-03' AND fi.status = 'settled'
ORDER BY fi.p2p_id ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Revolut",
    title: "Sender RFM, fraud edition",
    statement:
      "Per user with at least one settled send: frequency (send count), monetary (sent volume) and recency (days from their last send to 2026-07-01, integer cast). Output sender_id, freq, monetary and recency_days, ordered by monetary descending. Eleven rows — the dormant user has nothing to score.",
    code: `SELECT sender_id, COUNT(*) AS freq,
       SUM(amount_cents) AS monetary,
       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(p2p_date)) AS INTEGER) AS recency_days
FROM p2p
WHERE status = 'settled'
GROUP BY sender_id
ORDER BY monetary DESC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "The tie registry",
    statement:
      "Two pairs of users tie on settled sent volume. Build the registry: for each tied volume, the volume, the tied user_ids as a comma list and the tie size. Output vol, users_tied (GROUP_CONCAT ordered) and tie_size, ordered by vol descending. Two rows — 581200 and 19500.",
    code: `WITH sent AS (
  SELECT sender_id, SUM(amount_cents) AS vol
  FROM p2p
  WHERE status = 'settled'
  GROUP BY sender_id
),
ranked AS (
  SELECT sender_id, vol,
         COUNT(*) OVER (PARTITION BY vol) AS tie_size
  FROM sent
)
SELECT vol, GROUP_CONCAT(sender_id) AS users_tied, tie_size
FROM ranked
WHERE tie_size > 1
GROUP BY vol
ORDER BY vol DESC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "One row to close the ring",
    statement:
      "Summarize the mule ring in a single row: fan_out_volume (user 2's settled sends on 04-02), fan_in_volume (settled sends INTO user 9 on 04-03), skim_total (fan-out volume minus fan-in volume) and legs (the fan-in leg count). Scalar subqueries under CASE-free arithmetic — 1960000 in, 1920000 out, 40000 skimmed across 4 legs.",
    code: `SELECT
  (SELECT SUM(amount_cents) FROM p2p
    WHERE sender_id = 2 AND p2p_date = '2026-04-02' AND status = 'settled') AS fan_out_volume,
  (SELECT SUM(amount_cents) FROM p2p
    WHERE receiver_id = 9 AND p2p_date = '2026-04-03' AND status = 'settled') AS fan_in_volume,
  (SELECT SUM(amount_cents) FROM p2p
    WHERE sender_id = 2 AND p2p_date = '2026-04-02' AND status = 'settled')
    - (SELECT SUM(amount_cents) FROM p2p
    WHERE receiver_id = 9 AND p2p_date = '2026-04-03' AND status = 'settled') AS skim_total,
  (SELECT COUNT(*) FROM p2p
    WHERE receiver_id = 9 AND p2p_date = '2026-04-03' AND status = 'settled') AS legs;`,
    order: "exact",
  },
];
