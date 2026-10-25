// Domain Mastery — Fraud & AML · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r11-fraud-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_FRAUD_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "PayPal",
    title: "Ledger health check",
    scenario:
      "Monday risk standup starts with the p2p ledger: how much of it actually moved, and how do the broken rows split?",
    steps: [
      { prompt: "Count settled transfers. One column: settled_p2p.", code: `SELECT COUNT(*) AS settled_p2p\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
      { prompt: "Count transfers per status. Output status and txn_count, ordered by txn_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS txn_count\nFROM p2p\nGROUP BY status\nORDER BY txn_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Block",
    title: "KYC book review",
    scenario:
      "Onboarding wants the basic-tier book sized before the compliance review.",
    steps: [
      { prompt: "Count basic-tier users. One column: basic_users.", code: `SELECT COUNT(*) AS basic_users\nFROM users\nWHERE kyc_tier = 'basic';`, order: "exact" },
      { prompt: "List them: user_id, handle, status, ordered by user_id ascending.", code: `SELECT user_id, handle, status\nFROM users\nWHERE kyc_tier = 'basic'\nORDER BY user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Wise",
    title: "Country map",
    scenario:
      "The growth team is resizing country support. Headcounts first, then the smallest book by name.",
    steps: [
      { prompt: "Count users per country. Output country and user_count, ordered by user_count descending, then country ascending.", code: `SELECT country, COUNT(*) AS user_count\nFROM users\nGROUP BY country\nORDER BY user_count DESC, country ASC;`, order: "exact" },
      { prompt: "List the Singapore users: user_id, handle, kyc_tier, ordered by user_id ascending.", code: `SELECT user_id, handle, kyc_tier\nFROM users\nWHERE country = 'SG'\nORDER BY user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Revolut",
    title: "Rail mix",
    scenario:
      "Card pricing is up for renewal — start from how traffic actually moves.",
    steps: [
      { prompt: "List the distinct channels in the p2p table, ordered alphabetically. Single column: channel.", code: `SELECT DISTINCT channel\nFROM p2p\nORDER BY channel ASC;`, order: "exact" },
      { prompt: "Count transfers per channel. Output channel and transfer_count, ordered by transfer_count descending, then channel ascending.", code: `SELECT channel, COUNT(*) AS transfer_count\nFROM p2p\nGROUP BY channel\nORDER BY transfer_count DESC, channel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "Failed login audit",
    scenario:
      "The telemetry window closed Sunday night. Failure volume first, then the reasons.",
    steps: [
      { prompt: "Count failed logins. One column: failed_logins.", code: `SELECT COUNT(*) AS failed_logins\nFROM logins\nWHERE result = 'failed';`, order: "exact" },
      { prompt: "Count failures per reason. Output fail_reason and fail_count, ordered by fail_count descending, then fail_reason ascending.", code: `SELECT fail_reason, COUNT(*) AS fail_count\nFROM logins\nWHERE result = 'failed'\nGROUP BY fail_reason\nORDER BY fail_count DESC, fail_reason ASC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "Restricted accounts",
    scenario:
      "Account ops reviews everyone who cannot move money freely.",
    steps: [
      { prompt: "Count users whose status is not 'active'. One column: restricted_users.", code: `SELECT COUNT(*) AS restricted_users\nFROM users\nWHERE status <> 'active';`, order: "exact" },
      { prompt: "List them: user_id, handle, status, ordered by user_id ascending.", code: `SELECT user_id, handle, status\nFROM users\nWHERE status <> 'active'\nORDER BY user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "PayPal",
    title: "Severity ladder",
    scenario:
      "Risk triage meets in ten minutes. Size the case ladder, then pull the top rung.",
    steps: [
      { prompt: "Count cases per severity. Output severity and case_count, ordered by case_count descending, then severity ascending.", code: `SELECT severity, COUNT(*) AS case_count\nFROM cases\nGROUP BY severity\nORDER BY case_count DESC, severity ASC;`, order: "exact" },
      { prompt: "List the high-severity cases: case_id, user_id, case_type, status, ordered by case_id ascending.", code: `SELECT case_id, user_id, case_type, status\nFROM cases\nWHERE severity = 'high'\nORDER BY case_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Block",
    title: "The high-risk pile",
    scenario:
      "The risk model screams on some rows. Size the pile, then list it.",
    steps: [
      { prompt: "Count transfers with risk_score >= 80. One column: high_risk_count.", code: `SELECT COUNT(*) AS high_risk_count\nFROM p2p\nWHERE risk_score >= 80;`, order: "exact" },
      { prompt: "List them: p2p_id, sender_id, receiver_id, amount_cents, risk_score, ordered by risk_score descending, then p2p_id ascending.", code: `SELECT p2p_id, sender_id, receiver_id, amount_cents, risk_score\nFROM p2p\nWHERE risk_score >= 80\nORDER BY risk_score DESC, p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Wise",
    title: "Dispute intake",
    scenario:
      "Dispute ops wants the reason mix for the weekly.",
    steps: [
      { prompt: "Count disputes per reason. Output reason and claim_count, ordered by claim_count descending, then reason ascending.", code: `SELECT reason, COUNT(*) AS claim_count\nFROM disputes\nGROUP BY reason\nORDER BY claim_count DESC, reason ASC;`, order: "exact" },
      { prompt: "Count disputes per status. Output status and dispute_count, ordered by dispute_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS dispute_count\nFROM disputes\nGROUP BY status\nORDER BY dispute_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Revolut",
    title: "The 2026 class",
    scenario:
      "Onboarding wants to welcome this year's wallets by name.",
    steps: [
      { prompt: "Count users joined on or after '2026-01-01'. One column: new_users.", code: `SELECT COUNT(*) AS new_users\nFROM users\nWHERE joined_date >= '2026-01-01';`, order: "exact" },
      { prompt: "List them: user_id, handle, joined_date, ordered by joined_date ascending, then user_id ascending.", code: `SELECT user_id, handle, joined_date\nFROM users\nWHERE joined_date >= '2026-01-01'\nORDER BY joined_date ASC, user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "Device fleet census",
    scenario:
      "Device governance starts with the fleet split.",
    steps: [
      { prompt: "Count devices per os. Output os and device_count, ordered by device_count descending, then os ascending.", code: `SELECT os, COUNT(*) AS device_count\nFROM devices\nGROUP BY os\nORDER BY device_count DESC, os ASC;`, order: "exact" },
      { prompt: "Count trusted vs untrusted. Output trusted and device_count, ordered by trusted descending.", code: `SELECT trusted, COUNT(*) AS device_count\nFROM devices\nGROUP BY trusted\nORDER BY trusted DESC;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "Pending queue depth",
    scenario:
      "Three transfers are stuck in flight. Size the queue, then read it.",
    steps: [
      { prompt: "Count pending transfers. One column: pending_count.", code: `SELECT COUNT(*) AS pending_count\nFROM p2p\nWHERE status = 'pending';`, order: "exact" },
      { prompt: "List them: p2p_id, sender_id, receiver_id, amount_cents, p2p_date, ordered by p2p_id ascending.", code: `SELECT p2p_id, sender_id, receiver_id, amount_cents, p2p_date\nFROM p2p\nWHERE status = 'pending'\nORDER BY p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "PayPal",
    title: "The SAR register",
    scenario:
      "Compliance walks the regulator through every SAR filed this half.",
    steps: [
      { prompt: "Count cases with sar_filed = 1. One column: sar_count.", code: `SELECT COUNT(*) AS sar_count\nFROM cases\nWHERE sar_filed = 1;`, order: "exact" },
      { prompt: "List them: case_id, user_id, case_type, opened_date, ordered by case_id ascending.", code: `SELECT case_id, user_id, case_type, opened_date\nFROM cases\nWHERE sar_filed = 1\nORDER BY case_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Block",
    title: "Login traffic by day",
    scenario:
      "The telemetry window in one chart: attempts per day.",
    steps: [
      { prompt: "Count login attempts per day ('YYYY-MM-DD'). Output day and attempts, ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day, COUNT(*) AS attempts\nFROM logins\nGROUP BY day\nORDER BY day ASC;`, order: "exact" },
      { prompt: "Count failed attempts per day. Output day and failures, ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day, COUNT(*) AS failures\nFROM logins\nWHERE result = 'failed'\nGROUP BY day\nORDER BY day ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Wise",
    title: "One busy fan-out morning",
    scenario:
      "April 2 shows a four-leg burst. Pull it apart for the daily note.",
    steps: [
      { prompt: "Count transfers dated '2026-04-02'. One column: april2_txns.", code: `SELECT COUNT(*) AS april2_txns\nFROM p2p\nWHERE p2p_date = '2026-04-02';`, order: "exact" },
      { prompt: "List them: p2p_id, sender_id, receiver_id, amount_cents, ordered by p2p_id ascending.", code: `SELECT p2p_id, sender_id, receiver_id, amount_cents\nFROM p2p\nWHERE p2p_date = '2026-04-02'\nORDER BY p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Revolut",
    title: "The suspended wallet",
    scenario:
      "Ravi Chandra's account is suspended but his wallet still tells a story.",
    steps: [
      { prompt: "List user 9's p2p sends: p2p_id, receiver_id, p2p_date, amount_cents, status, ordered by p2p_id ascending.", code: `SELECT p2p_id, receiver_id, p2p_date, amount_cents, status\nFROM p2p\nWHERE sender_id = 9\nORDER BY p2p_id ASC;`, order: "exact" },
      { prompt: "Sum user 9's settled sent volume. One column: sent_vol.", code: `SELECT SUM(amount_cents) AS sent_vol\nFROM p2p\nWHERE sender_id = 9 AND status = 'settled';`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Aegis Risk",
    title: "Total settled volume",
    scenario:
      "The half-year number every deck opens with.",
    steps: [
      { prompt: "Sum amount_cents over settled transfers. One column: settled_volume.", code: `SELECT SUM(amount_cents) AS settled_volume\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
      { prompt: "Count settled transfers. One column: settled_count.", code: `SELECT COUNT(*) AS settled_count\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Velttrum Pay",
    title: "Dormant wallet check",
    scenario:
      "Imogen Cole joined in March. Verify she never transacted.",
    steps: [
      { prompt: "Count p2p rows where user 11 is the sender. One column: sent_rows.", code: `SELECT COUNT(*) AS sent_rows\nFROM p2p\nWHERE sender_id = 11;`, order: "exact" },
      { prompt: "Count p2p rows where user 11 is the receiver. One column: recv_rows.", code: `SELECT COUNT(*) AS recv_rows\nFROM p2p\nWHERE receiver_id = 11;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "PayPal",
    title: "iOS fleet",
    scenario:
      "The mobile team wants the iPhone count and the per-OS breakdown.",
    steps: [
      { prompt: "Count iOS devices. One column: ios_devices.", code: `SELECT COUNT(*) AS ios_devices\nFROM devices\nWHERE os = 'iOS';`, order: "exact" },
      { prompt: "Count devices per os with trusted split: output os, device_count, trusted_count (SUM of trusted), ordered by device_count descending, then os ascending.", code: `SELECT os, COUNT(*) AS device_count, SUM(trusted) AS trusted_count\nFROM devices\nGROUP BY os\nORDER BY device_count DESC, os ASC;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "Block",
    title: "Open case queue",
    scenario:
      "The analysts need today's open-and-waiting queue.",
    steps: [
      { prompt: "Count cases with status 'open'. One column: open_cases.", code: `SELECT COUNT(*) AS open_cases\nFROM cases\nWHERE status = 'open';`, order: "exact" },
      { prompt: "List the open cases: case_id, user_id, case_type, severity, opened_date, ordered by severity descending, then case_id ascending.", code: `SELECT case_id, user_id, case_type, severity, opened_date\nFROM cases\nWHERE status = 'open'\nORDER BY severity DESC, case_id ASC;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Wise",
    title: "Who sends the money",
    scenario:
      "The weekly risk review opens with the sender leaderboard — ties included.",
    steps: [
      { prompt: "Rank senders by settled sent volume with RANK(). Output sender_id, sent_vol, rnk, ordered by rnk ascending, then sender_id ascending.", code: `WITH sent AS (\n  SELECT sender_id, SUM(amount_cents) AS sent_vol\n  FROM p2p WHERE status = 'settled' GROUP BY sender_id\n)\nSELECT sender_id, sent_vol, RANK() OVER (ORDER BY sent_vol DESC) AS rnk\nFROM sent\nORDER BY rnk ASC, sender_id ASC;`, order: "exact" },
      { prompt: "Rank senders with DENSE_RANK(). Output sender_id, sent_vol, drk, ordered by drk ascending, then sender_id ascending.", code: `WITH sent AS (\n  SELECT sender_id, SUM(amount_cents) AS sent_vol\n  FROM p2p WHERE status = 'settled' GROUP BY sender_id\n)\nSELECT sender_id, sent_vol, DENSE_RANK() OVER (ORDER BY sent_vol DESC) AS drk\nFROM sent\nORDER BY drk ASC, sender_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Revolut",
    title: "Who receives the money",
    scenario:
      "Direction flips the story: the receiver leaderboard looks nothing like the sender board.",
    steps: [
      { prompt: "Rank receivers by settled received volume. Output receiver_id, recv_vol, rnk, ordered by rnk ascending, then receiver_id ascending.", code: `WITH recv AS (\n  SELECT receiver_id, SUM(amount_cents) AS recv_vol\n  FROM p2p WHERE status = 'settled' GROUP BY receiver_id\n)\nSELECT receiver_id, recv_vol, RANK() OVER (ORDER BY recv_vol DESC) AS rnk\nFROM recv\nORDER BY rnk ASC, receiver_id ASC;`, order: "exact" },
      { prompt: "Join the top receiver to their handle. Output handle and recv_vol, one row.", code: `WITH recv AS (\n  SELECT receiver_id, SUM(amount_cents) AS recv_vol\n  FROM p2p WHERE status = 'settled' GROUP BY receiver_id\n),\nranked AS (\n  SELECT receiver_id, recv_vol, RANK() OVER (ORDER BY recv_vol DESC) AS rnk FROM recv\n)\nSELECT u.handle, r.recv_vol\nFROM ranked r JOIN users u ON u.user_id = r.receiver_id\nWHERE r.rnk = 1\nORDER BY r.recv_vol DESC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "PayPal",
    title: "Fan-out screen",
    scenario:
      "AML runs the smurfing screen: same sender, same day, many receivers, all under the line.",
    steps: [
      { prompt: "Find sender+day groups with at least 3 distinct receivers and max amount under 500000. Output sender_id, p2p_date, receiver_count, max_amount, ordered by p2p_date ascending.", code: `SELECT sender_id, p2p_date,\n       COUNT(DISTINCT receiver_id) AS receiver_count,\n       MAX(amount_cents) AS max_amount\nFROM p2p\nWHERE status = 'settled'\nGROUP BY sender_id, p2p_date\nHAVING COUNT(DISTINCT receiver_id) >= 3 AND MAX(amount_cents) < 500000\nORDER BY p2p_date ASC;`, order: "exact" },
      { prompt: "List user 2's transfers on the flagged day: p2p_id, receiver_id, amount_cents, risk_score, ordered by p2p_id ascending.", code: `SELECT p2p_id, receiver_id, amount_cents, risk_score\nFROM p2p\nWHERE sender_id = 2 AND p2p_date = '2026-04-02'\nORDER BY p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Block",
    title: "Honest-zero leaderboard",
    scenario:
      "The board must show all twelve wallets — including the one that never moves.",
    steps: [
      { prompt: "Sent volume per user, zeros kept (LEFT JOIN + COALESCE). Output user_id, sent_vol, ordered by sent_vol descending, then user_id ascending.", code: `SELECT u.user_id, COALESCE(SUM(p.amount_cents), 0) AS sent_vol\nFROM users u\nLEFT JOIN p2p p ON p.sender_id = u.user_id AND p.status = 'settled'\nGROUP BY u.user_id\nORDER BY sent_vol DESC, u.user_id ASC;`, order: "exact" },
      { prompt: "Received volume per user, zeros kept. Output user_id, recv_vol, ordered by recv_vol descending, then user_id ascending.", code: `SELECT u.user_id, COALESCE(SUM(p.amount_cents), 0) AS recv_vol\nFROM users u\nLEFT JOIN p2p p ON p.receiver_id = u.user_id AND p.status = 'settled'\nGROUP BY u.user_id\nORDER BY recv_vol DESC, u.user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Partial-dispute audit",
    scenario:
      "Some claims do not match the money. Find them, then price the gap.",
    steps: [
      { prompt: "List disputes whose amount differs from the cited transfer: dispute_id, claimant user_id, claim, actual, ordered by dispute_id ascending.", code: `SELECT d.dispute_id, d.user_id,\n       d.amount_cents AS claim, p.amount_cents AS actual\nFROM disputes d\nJOIN p2p p ON p.p2p_id = d.p2p_id\nWHERE d.amount_cents <> p.amount_cents\nORDER BY d.dispute_id ASC;`, order: "exact" },
      { prompt: "Total the shortfall across those rows (actual minus claim). One column: total_shortfall.", code: `SELECT SUM(p.amount_cents - d.amount_cents) AS total_shortfall\nFROM disputes d\nJOIN p2p p ON p.p2p_id = d.p2p_id\nWHERE d.amount_cents <> p.amount_cents;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Duplicate-lane hygiene",
    scenario:
      "Data quality review: same sender, same receiver, same day — twice.",
    steps: [
      { prompt: "Find sender+receiver+day groups posting more than once. Output sender_id, receiver_id, p2p_date, lane_count, ordered by p2p_date ascending.", code: `SELECT sender_id, receiver_id, p2p_date, COUNT(*) AS lane_count\nFROM p2p\nGROUP BY sender_id, receiver_id, p2p_date\nHAVING COUNT(*) > 1\nORDER BY p2p_date ASC;`, order: "exact" },
      { prompt: "List both rows of that lane: p2p_id, p2p_date, amount_cents, status, ordered by p2p_id ascending.", code: `SELECT p2p_id, p2p_date, amount_cents, status\nFROM p2p\nWHERE sender_id = 3 AND receiver_id = 5 AND p2p_date = '2026-01-19'\nORDER BY p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Wise",
    title: "Ghost devices",
    scenario:
      "Device governance: trusted on paper, never seen in telemetry.",
    steps: [
      { prompt: "List devices that never appear in a login: device_id, user_id, label, trusted, ordered by device_id ascending.", code: `SELECT d.device_id, d.user_id, d.label, d.trusted\nFROM devices d\nWHERE d.device_id NOT IN (SELECT device_id FROM logins)\nORDER BY d.device_id ASC;`, order: "exact" },
      { prompt: "Count logins per device with zeros kept: device_id, uses, ordered by device_id ascending.", code: `SELECT d.device_id, COUNT(l.login_id) AS uses\nFROM devices d\nLEFT JOIN logins l ON l.device_id = d.device_id\nGROUP BY d.device_id\nORDER BY d.device_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "Revolut",
    title: "Monthly momentum",
    scenario:
      "The monthly volume view for the risk committee — spike included.",
    steps: [
      { prompt: "Settled volume per month: month, volume, transfers, ordered by month ascending.", code: `SELECT strftime('%Y-%m', p2p_date) AS month,\n       SUM(amount_cents) AS volume, COUNT(*) AS transfers\nFROM p2p\nWHERE status = 'settled'\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Same cut but only transfers >= 100000: month, volume, transfers, ordered by month ascending.", code: `SELECT strftime('%Y-%m', p2p_date) AS month,\n       SUM(amount_cents) AS volume, COUNT(*) AS transfers\nFROM p2p\nWHERE status = 'settled' AND amount_cents >= 100000\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Case load by owner",
    scenario:
      "Who is the workload actually on? Cases and SARs per named user.",
    steps: [
      { prompt: "Cases per user with handle: handle, case_count, ordered by case_count descending, then handle ascending.", code: `SELECT u.handle, COUNT(*) AS case_count\nFROM cases c\nJOIN users u ON u.user_id = c.user_id\nGROUP BY c.user_id\nORDER BY case_count DESC, handle ASC;`, order: "exact" },
      { prompt: "SARs filed per user: handle, sar_total (SUM of sar_filed), keeping only users with at least one, ordered by sar_total descending, then handle ascending.", code: `SELECT u.handle, SUM(c.sar_filed) AS sar_total\nFROM cases c\nJOIN users u ON u.user_id = c.user_id\nGROUP BY c.user_id\nHAVING SUM(c.sar_filed) > 0\nORDER BY sar_total DESC, handle ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "PayPal",
    title: "Velocity pairs",
    scenario:
      "The velocity screen: failed logins that come in clusters.",
    steps: [
      { prompt: "Self-join failed logins within 300 seconds (earlier id first): user_id, earlier_id, later_id, gap, ordered by user_id, earlier_id, later_id.", code: `SELECT a.user_id, a.login_id AS earlier_id,\n       b.login_id AS later_id, b.login_ts - a.login_ts AS gap\nFROM logins a\nJOIN logins b ON b.user_id = a.user_id\n  AND b.login_id > a.login_id AND b.login_ts - a.login_ts <= 300\nWHERE a.result = 'failed' AND b.result = 'failed'\nORDER BY a.user_id ASC, earlier_id ASC, later_id ASC;`, order: "exact" },
      { prompt: "Count pairs per user: user_id, pair_count, ordered by pair_count descending, then user_id ascending.", code: `SELECT a.user_id, COUNT(*) AS pair_count\nFROM logins a\nJOIN logins b ON b.user_id = a.user_id\n  AND b.login_id > a.login_id AND b.login_ts - a.login_ts <= 300\nWHERE a.result = 'failed' AND b.result = 'failed'\nGROUP BY a.user_id\nORDER BY pair_count DESC, a.user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Block",
    title: "Geo hoppers",
    scenario:
      "Users whose telemetry spans more than one country.",
    steps: [
      { prompt: "Users with 2+ distinct ip_countries: user_id, country_count, countries (GROUP_CONCAT), ordered by country_count descending, then user_id ascending.", code: `SELECT user_id, COUNT(DISTINCT ip_country) AS country_count,\n       GROUP_CONCAT(DISTINCT ip_country) AS countries\nFROM logins\nGROUP BY user_id\nHAVING COUNT(DISTINCT ip_country) > 1\nORDER BY country_count DESC, user_id ASC;`, order: "exact" },
      { prompt: "List user 1's logins with country and timestamp: login_ts, ip_country, ordered by login_ts ascending.", code: `SELECT login_ts, ip_country\nFROM logins\nWHERE user_id = 1\nORDER BY login_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Wise",
    title: "Rail economics",
    scenario:
      "Which rail carries the money, and which carries the risk?",
    steps: [
      { prompt: "Per channel over settled rows: channel, transfers, volume, ordered by volume descending.", code: `SELECT channel, COUNT(*) AS transfers, SUM(amount_cents) AS volume\nFROM p2p\nWHERE status = 'settled'\nGROUP BY channel\nORDER BY volume DESC;`, order: "exact" },
      { prompt: "Per channel average risk over settled rows: channel, avg_risk (1 decimal), ordered by avg_risk descending.", code: `SELECT channel, ROUND(AVG(risk_score), 1) AS avg_risk\nFROM p2p\nWHERE status = 'settled'\nGROUP BY channel\nORDER BY avg_risk DESC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Revolut",
    title: "Dispute outcomes",
    scenario:
      "Reason by outcome: where do claims actually land?",
    steps: [
      { prompt: "Per reason: total_claims, won_count, lost_count, ordered by total_claims descending, then reason ascending.", code: `SELECT reason,\n       COUNT(*) AS total_claims,\n       SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won_count,\n       SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) AS lost_count\nFROM disputes\nGROUP BY reason\nORDER BY total_claims DESC, reason ASC;`, order: "exact" },
      { prompt: "List the open unauthorized disputes: dispute_id, user_id, filed_date, ordered by dispute_id ascending.", code: `SELECT dispute_id, user_id, filed_date\nFROM disputes\nWHERE reason = 'unauthorized' AND status = 'open'\nORDER BY dispute_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "Case intake rhythm",
    scenario:
      "When does risk work arrive? Monthly intake, then the April detail.",
    steps: [
      { prompt: "Cases opened per month: month, opened_cases, ordered by month ascending.", code: `SELECT strftime('%Y-%m', opened_date) AS month, COUNT(*) AS opened_cases\nFROM cases\nGROUP BY month\nORDER BY month ASC;`, order: "exact" },
      { prompt: "List the April-opened cases: case_id, user_id, case_type, severity, ordered by case_id ascending.", code: `SELECT case_id, user_id, case_type, severity\nFROM cases\nWHERE strftime('%Y-%m', opened_date) = '2026-04'\nORDER BY case_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Cross-border flow",
    scenario:
      "Money crossing registration borders needs a closer look.",
    steps: [
      { prompt: "Count settled transfers where sender and receiver countries differ. One column: cross_border.", code: `SELECT COUNT(*) AS cross_border\nFROM p2p p\nJOIN users su ON su.user_id = p.sender_id\nJOIN users ru ON ru.user_id = p.receiver_id\nWHERE p.status = 'settled' AND su.country <> ru.country;`, order: "exact" },
      { prompt: "Sum the settled volume of those cross-border transfers. One column: cross_border_volume.", code: `SELECT SUM(p.amount_cents) AS cross_border_volume\nFROM p2p p\nJOIN users su ON su.user_id = p.sender_id\nJOIN users ru ON ru.user_id = p.receiver_id\nWHERE p.status = 'settled' AND su.country <> ru.country;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "PayPal",
    title: "The beneficiary's books",
    scenario:
      "Ravi Chandra: minimal sends, maximal receives. Quantify the asymmetry.",
    steps: [
      { prompt: "User 9's settled sent volume. One column: sent_vol.", code: `SELECT COALESCE(SUM(amount_cents), 0) AS sent_vol\nFROM p2p\nWHERE sender_id = 9 AND status = 'settled';`, order: "exact" },
      { prompt: "User 9's settled received volume. One column: recv_vol.", code: `SELECT COALESCE(SUM(amount_cents), 0) AS recv_vol\nFROM p2p\nWHERE receiver_id = 9 AND status = 'settled';`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Block",
    title: "Login load per user",
    scenario:
      "Telemetry coverage: who logs in, who never does.",
    steps: [
      { prompt: "Login counts per user with zeros kept: user_id, login_count, ordered by login_count descending, then user_id ascending.", code: `SELECT u.user_id, COUNT(l.login_id) AS login_count\nFROM users u\nLEFT JOIN logins l ON l.user_id = u.user_id\nGROUP BY u.user_id\nORDER BY login_count DESC, u.user_id ASC;`, order: "exact" },
      { prompt: "Failed login counts per user, zeros kept: user_id, fail_count, ordered by fail_count descending, then user_id ascending.", code: `SELECT u.user_id, SUM(CASE WHEN l.result = 'failed' THEN 1 ELSE 0 END) AS fail_count\nFROM users u\nLEFT JOIN logins l ON l.user_id = u.user_id\nGROUP BY u.user_id\nORDER BY fail_count DESC, u.user_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Wise",
    title: "The reversed pair",
    scenario:
      "Two transfers came back. Audit them against their risk scores.",
    steps: [
      { prompt: "List reversed transfers: p2p_id, sender_id, receiver_id, amount_cents, risk_score, ordered by p2p_id ascending.", code: `SELECT p2p_id, sender_id, receiver_id, amount_cents, risk_score\nFROM p2p\nWHERE status = 'reversed'\nORDER BY p2p_id ASC;`, order: "exact" },
      { prompt: "Sum reversed volume. One column: reversed_volume.", code: `SELECT SUM(amount_cents) AS reversed_volume\nFROM p2p\nWHERE status = 'reversed';`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Aegis Risk",
    title: "KYC tier vs volume",
    scenario:
      "Do enhanced-KYC wallets move more money? Aggregate sends by tier.",
    steps: [
      { prompt: "Settled sent volume per kyc_tier: kyc_tier, tier_volume, sender_count (distinct senders), ordered by tier_volume descending.", code: `SELECT u.kyc_tier, SUM(p.amount_cents) AS tier_volume,\n       COUNT(DISTINCT p.sender_id) AS sender_count\nFROM p2p p\nJOIN users u ON u.user_id = p.sender_id\nWHERE p.status = 'settled'\nGROUP BY u.kyc_tier\nORDER BY tier_volume DESC;`, order: "exact" },
      { prompt: "Same cut for received volume: kyc_tier, tier_volume, receiver_count, ordered by tier_volume descending.", code: `SELECT u.kyc_tier, SUM(p.amount_cents) AS tier_volume,\n       COUNT(DISTINCT p.receiver_id) AS receiver_count\nFROM p2p p\nJOIN users u ON u.user_id = p.receiver_id\nWHERE p.status = 'settled'\nGROUP BY u.kyc_tier\nORDER BY tier_volume DESC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Velttrum Pay",
    title: "Failed money",
    scenario:
      "Five transfers never landed. Which rails failed and how much was blocked?",
    steps: [
      { prompt: "Count failed transfers per channel: channel, fail_count, ordered by fail_count descending, then channel ascending.", code: `SELECT channel, COUNT(*) AS fail_count\nFROM p2p\nWHERE status = 'failed'\nGROUP BY channel\nORDER BY fail_count DESC, channel ASC;`, order: "exact" },
      { prompt: "Sum failed volume. One column: failed_volume.", code: `SELECT SUM(amount_cents) AS failed_volume\nFROM p2p\nWHERE status = 'failed';`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Impossible travel case",
    scenario:
      "A geo-anomaly alert needs substance. Find the pair that breaks travel physics — and mind the threshold: the rule allows 3600 seconds inclusive.",
    steps: [
      { prompt: "Self-join logins: same user, different ip_country, at most 3600s apart (earlier id first). Output user_id, earlier_id, later_id, from_country, to_country, gap, ordered by user_id, earlier_id.", code: `SELECT a.user_id, a.login_id AS earlier_id,\n       b.login_id AS later_id,\n       a.ip_country AS from_country, b.ip_country AS to_country,\n       b.login_ts - a.login_ts AS gap\nFROM logins a\nJOIN logins b ON b.user_id = a.user_id\n  AND b.login_id > a.login_id AND b.login_ts - a.login_ts <= 3600\nWHERE a.ip_country <> b.ip_country\nORDER BY a.user_id ASC, earlier_id ASC;`, order: "exact" },
      { prompt: "Show the flagged user's full 07-22 timeline: login_ts, ip_country, ordered by login_ts ascending.", code: `SELECT login_ts, ip_country\nFROM logins\nWHERE user_id = 1 AND login_ts >= 1784678400 AND login_ts < 1784764800\nORDER BY login_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "Session forensics on user 1",
    scenario:
      "Priya's week needs sessionizing. The 45-minute pause on 07-20 and the country hop on 07-22 both matter.",
    steps: [
      { prompt: "Stamp user 1's logins with session numbers (1800s cutoff). Output login_ts, ip_country, session_no, ordered by login_ts ascending.", code: `WITH seq AS (\n  SELECT login_ts, ip_country, LAG(login_ts) OVER (ORDER BY login_ts) AS prev_ts\n  FROM logins WHERE user_id = 1\n),\nstamps AS (\n  SELECT login_ts, ip_country,\n         SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)\n           OVER (ORDER BY login_ts ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM seq\n)\nSELECT login_ts, ip_country, session_no\nFROM stamps\nORDER BY login_ts ASC;`, order: "exact" },
      { prompt: "Count user 1's sessions. One column: sessions.", code: `WITH seq AS (\n  SELECT login_ts, LAG(login_ts) OVER (ORDER BY login_ts) AS prev_ts\n  FROM logins WHERE user_id = 1\n),\nstamps AS (\n  SELECT login_ts, SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)\n    OVER (ORDER BY login_ts ROWS UNBOUNDED PRECEDING) AS session_no\n  FROM seq\n)\nSELECT COUNT(DISTINCT session_no) AS sessions FROM stamps;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "PayPal",
    title: "The hand-off join",
    scenario:
      "Layering leaves a two-day fingerprint: money in from the origin on 04-02, money out to the beneficiary on 04-03.",
    steps: [
      { prompt: "Join each 04-02 fan-out leg (sender 2) to the 04-03 fan-in leg sent by its receiver: out p2p_id, mid_user, in_id, final_receiver, skim (out minus in), ordered by the out id.", code: `SELECT fo.p2p_id,\n       fo.receiver_id AS mid_user,\n       fi.p2p_id AS in_id,\n       fi.receiver_id AS final_receiver,\n       fo.amount_cents - fi.amount_cents AS skim\nFROM p2p fo\nJOIN p2p fi ON fi.sender_id = fo.receiver_id\n  AND fi.p2p_date = '2026-04-03' AND fi.status = 'settled'\nWHERE fo.sender_id = 2 AND fo.p2p_date = '2026-04-02' AND fo.status = 'settled'\nORDER BY fo.p2p_id ASC;`, order: "exact" },
      { prompt: "Total the skim across all hand-offs. One column: total_skim.", code: `SELECT SUM(fo.amount_cents - fi.amount_cents) AS total_skim\nFROM p2p fo\nJOIN p2p fi ON fi.sender_id = fo.receiver_id\n  AND fi.p2p_date = '2026-04-03' AND fi.status = 'settled'\nWHERE fo.sender_id = 2 AND fo.p2p_date = '2026-04-02' AND fo.status = 'settled';`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Block",
    title: "Top-8 volume days, ties intact",
    scenario:
      "The daily volume podium needs the tie kept: rank 8 is dead-heated.",
    steps: [
      { prompt: "DENSE_RANK settled days by volume, keep ranks 1-8: p2p_date, vol, dr, ordered by dr ascending, then p2p_date ascending.", code: `WITH daily AS (\n  SELECT p2p_date, SUM(amount_cents) AS vol\n  FROM p2p WHERE status = 'settled' GROUP BY p2p_date\n),\nranked AS (\n  SELECT p2p_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) AS dr FROM daily\n)\nSELECT p2p_date, vol, dr\nFROM ranked\nWHERE dr <= 8\nORDER BY dr ASC, p2p_date ASC;`, order: "exact" },
      { prompt: "Count how many days share dense rank 8. One column: rank8_days.", code: `WITH daily AS (\n  SELECT p2p_date, SUM(amount_cents) AS vol\n  FROM p2p WHERE status = 'settled' GROUP BY p2p_date\n),\nranked AS (\n  SELECT p2p_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) AS dr FROM daily\n)\nSELECT COUNT(*) AS rank8_days FROM ranked WHERE dr = 8;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Wise",
    title: "Month-over-month momentum",
    scenario:
      "The committee wants the monthly curve AND its momentum — with the honest NULL first row.",
    steps: [
      { prompt: "Monthly settled volume with LAG delta: month, volume, delta, ordered by month ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', p2p_date) AS month, SUM(amount_cents) AS volume\n  FROM p2p WHERE status = 'settled' GROUP BY month\n)\nSELECT month, volume, volume - LAG(volume) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY month ASC;`, order: "exact" },
      { prompt: "Report April's delta alone as a single row. One column: april_delta.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', p2p_date) AS month, SUM(amount_cents) AS volume\n  FROM p2p WHERE status = 'settled' GROUP BY month\n),\ndeltas AS (\n  SELECT month, volume - LAG(volume) OVER (ORDER BY month) AS delta\n  FROM monthly\n)\nSELECT delta AS april_delta FROM deltas WHERE month = '2026-04';`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Revolut",
    title: "Country champions",
    scenario:
      "Each country's biggest sender — Singapore crowns two, keep both.",
    steps: [
      { prompt: "Per-country top settled sender via RANK: country, sender_id, handle, sent_vol, ordered by country ascending, then sent_vol descending.", code: `WITH vol AS (\n  SELECT u.country, s.sender_id, u.handle, SUM(s.amount_cents) AS sent_vol\n  FROM p2p s JOIN users u ON u.user_id = s.sender_id\n  WHERE s.status = 'settled'\n  GROUP BY s.sender_id\n),\nranked AS (\n  SELECT *, RANK() OVER (PARTITION BY country ORDER BY sent_vol DESC) AS r FROM vol\n)\nSELECT country, sender_id, handle, sent_vol\nFROM ranked\nWHERE r = 1\nORDER BY country ASC, sent_vol DESC;`, order: "exact" },
      { prompt: "Count the champion rows. One column: champion_rows.", code: `WITH vol AS (\n  SELECT u.country, s.sender_id, SUM(s.amount_cents) AS sent_vol\n  FROM p2p s JOIN users u ON u.user_id = s.sender_id\n  WHERE s.status = 'settled'\n  GROUP BY s.sender_id\n),\nranked AS (\n  SELECT *, RANK() OVER (PARTITION BY country ORDER BY sent_vol DESC) AS r FROM vol\n)\nSELECT COUNT(*) AS champion_rows FROM ranked WHERE r = 1;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Running volume curve",
    scenario:
      "The half-year curve for the cover slide — thirty-seven days, one cumulative line.",
    steps: [
      { prompt: "Daily settled volume with running total: p2p_date, day_vol, running_vol, ordered by p2p_date ascending.", code: `SELECT p2p_date, SUM(amount_cents) AS day_vol,\n       SUM(SUM(amount_cents)) OVER (ORDER BY p2p_date ROWS UNBOUNDED PRECEDING) AS running_vol\nFROM p2p\nWHERE status = 'settled'\nGROUP BY p2p_date\nORDER BY p2p_date ASC;`, order: "exact" },
      { prompt: "Report the final running value only. One column: final_running.", code: `WITH curve AS (\n  SELECT p2p_date, SUM(amount_cents) AS day_vol,\n         SUM(SUM(amount_cents)) OVER (ORDER BY p2p_date ROWS UNBOUNDED PRECEDING) AS running_vol\n  FROM p2p WHERE status = 'settled'\n  GROUP BY p2p_date\n)\nSELECT running_vol AS final_running\nFROM curve\nORDER BY p2p_date DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "Sessions across the network",
    scenario:
      "Sessionize everyone, zeros kept. Rhythm beats volume — the busiest login count is not the most sessions.",
    steps: [
      { prompt: "Sessions per user (1800s cutoff), zeros kept: user_id, sessions, ordered by sessions descending, then user_id ascending.", code: `WITH seq AS (\n  SELECT user_id, login_ts, LAG(login_ts) OVER (PARTITION BY user_id ORDER BY login_ts) AS prev_ts\n  FROM logins\n),\nstamps AS (\n  SELECT user_id, login_ts,\n         SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)\n           OVER (PARTITION BY user_id ORDER BY login_ts ROWS UNBOUNDED PRECEDING) AS sess\n  FROM seq\n)\nSELECT u.user_id, COUNT(DISTINCT s.sess) AS sessions\nFROM users u\nLEFT JOIN stamps s ON s.user_id = u.user_id\nGROUP BY u.user_id\nORDER BY sessions DESC, u.user_id ASC;`, order: "exact" },
      { prompt: "Count users with zero logins. One column: silent_users.", code: `SELECT COUNT(*) AS silent_users\nFROM users u\nWHERE NOT EXISTS (SELECT 1 FROM logins l WHERE l.user_id = u.user_id);`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "PayPal",
    title: "Net flow, sign included",
    scenario:
      "Received minus sent, per wallet, zeros kept. The extremes tell the ring's story.",
    steps: [
      { prompt: "Net flow per user: user_id, net_cents (recv - sent, settled), ordered by net_cents descending, then user_id ascending.", code: `SELECT u.user_id,\n       COALESCE(r.recv_vol, 0) - COALESCE(s.sent_vol, 0) AS net_cents\nFROM users u\nLEFT JOIN (SELECT sender_id, SUM(amount_cents) AS sent_vol\n           FROM p2p WHERE status = 'settled' GROUP BY sender_id) s\n  ON s.sender_id = u.user_id\nLEFT JOIN (SELECT receiver_id, SUM(amount_cents) AS recv_vol\n           FROM p2p WHERE status = 'settled' GROUP BY receiver_id) r\n  ON r.receiver_id = u.user_id\nORDER BY net_cents DESC, u.user_id ASC;`, order: "exact" },
      { prompt: "Report the most negative net flow. One column: worst_net.", code: `SELECT MIN(net.net_cents) AS worst_net\nFROM (\n  SELECT COALESCE(r.recv_vol, 0) - COALESCE(s.sent_vol, 0) AS net_cents\n  FROM users u\n  LEFT JOIN (SELECT sender_id, SUM(amount_cents) AS sent_vol\n             FROM p2p WHERE status = 'settled' GROUP BY sender_id) s\n    ON s.sender_id = u.user_id\n  LEFT JOIN (SELECT receiver_id, SUM(amount_cents) AS recv_vol\n             FROM p2p WHERE status = 'settled' GROUP BY receiver_id) r\n    ON r.receiver_id = u.user_id\n) net;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Block",
    title: "How much money is screaming",
    scenario:
      "The board asks: what share of settled volume sits on high-risk rows?",
    steps: [
      { prompt: "One row: risky_vol (risk >= 80), total_vol, both over settled rows.", code: `SELECT SUM(CASE WHEN risk_score >= 80 THEN amount_cents ELSE 0 END) AS risky_vol,\n       SUM(amount_cents) AS total_vol\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
      { prompt: "The risky share as share_pct, 1 decimal. One row.", code: `SELECT ROUND(100.0 * SUM(CASE WHEN risk_score >= 80 THEN amount_cents ELSE 0 END)\n  / SUM(amount_cents), 1) AS share_pct\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Wise",
    title: "The aging unauthorized queue",
    scenario:
      "Three unauthorized claims sit open. Age them as of 2026-07-01 — the regulator wants the oldest first.",
    steps: [
      { prompt: "Open unauthorized disputes with age: dispute_id, user_id, filed_date, days_open (integer), ordered by days_open descending, then dispute_id ascending.", code: `SELECT dispute_id, user_id, filed_date,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(filed_date) AS INTEGER) AS days_open\nFROM disputes\nWHERE reason = 'unauthorized' AND status = 'open'\nORDER BY days_open DESC, dispute_id ASC;`, order: "exact" },
      { prompt: "Average days_open across that queue, 1 decimal. One column: avg_age.", code: `SELECT ROUND(AVG(JULIANDAY('2026-07-01') - JULIANDAY(filed_date)), 1) AS avg_age\nFROM disputes\nWHERE reason = 'unauthorized' AND status = 'open';`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Revolut",
    title: "The SAR dossier",
    scenario:
      "Regulator request: every SAR, named, typed — and the split by case type.",
    steps: [
      { prompt: "SAR cases with handles: case_id, handle, case_type, severity, opened_date, ordered by case_id ascending.", code: `SELECT c.case_id, u.handle, c.case_type, c.severity, c.opened_date\nFROM cases c\nJOIN users u ON u.user_id = c.user_id\nWHERE c.sar_filed = 1\nORDER BY c.case_id ASC;`, order: "exact" },
      { prompt: "SARs per case type: case_type, sar_count, ordered by sar_count descending, then case_type ascending.", code: `SELECT case_type, COUNT(*) AS sar_count\nFROM cases\nWHERE sar_filed = 1\nGROUP BY case_type\nORDER BY sar_count DESC, case_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "Trust versus usage",
    scenario:
      "The governance audit: does the trusted flag match reality?",
    steps: [
      { prompt: "Every device with login count: device_id, label, trusted, uses, ordered by uses descending, then device_id ascending.", code: `SELECT d.device_id, d.label, d.trusted, COUNT(l.login_id) AS uses\nFROM devices d\nLEFT JOIN logins l ON l.device_id = d.device_id\nGROUP BY d.device_id\nORDER BY uses DESC, d.device_id ASC;`, order: "exact" },
      { prompt: "Count devices that are trusted AND unused. One column: trusted_unused.", code: `SELECT COUNT(*) AS trusted_unused\nFROM devices d\nWHERE d.trusted = 1\n  AND d.device_id NOT IN (SELECT device_id FROM logins);`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "The daily fail funnel",
    scenario:
      "Four days of telemetry. Which day burns, and how hot?",
    steps: [
      { prompt: "Per day: attempts, fails, fail_pct (1 decimal), ordered by day ascending.", code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day,\n       COUNT(*) AS attempts,\n       SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) AS fails,\n       ROUND(100.0 * SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS fail_pct\nFROM logins\nGROUP BY day\nORDER BY day ASC;`, order: "exact" },
      { prompt: "The worst day by fail_pct: day, fail_pct. One row, ordered by fail_pct descending, day ascending, LIMIT 1.", code: `SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') AS day,\n       ROUND(100.0 * SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 1) AS fail_pct\nFROM logins\nGROUP BY day\nORDER BY fail_pct DESC, day ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Block",
    title: "The 500000 boundary registry",
    scenario:
      "The EDD line at 500000 cents: who ducks under, who crosses.",
    steps: [
      { prompt: "One row: under_line (settled amounts 400000-499999), at_or_over (>= 500000), max_settled.", code: `SELECT SUM(CASE WHEN amount_cents >= 400000 AND amount_cents < 500000 THEN 1 ELSE 0 END) AS under_line,\n       SUM(CASE WHEN amount_cents >= 500000 THEN 1 ELSE 0 END) AS at_or_over,\n       MAX(amount_cents) AS max_settled\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
      { prompt: "List the band rows: p2p_id, sender_id, receiver_id, amount_cents, ordered by amount_cents descending, then p2p_id ascending.", code: `SELECT p2p_id, sender_id, receiver_id, amount_cents\nFROM p2p\nWHERE status = 'settled' AND amount_cents >= 400000 AND amount_cents < 500000\nORDER BY amount_cents DESC, p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Wise",
    title: "The full ring dossier",
    scenario:
      "Name every mule and the origin. Four legs, four names, one skim each.",
    steps: [
      { prompt: "For each 04-03 fan-in leg: in p2p_id, mule_name, in_amount, origin_name, skim, ordered by the in id.", code: `SELECT fi.p2p_id,\n       su.handle AS mule_name,\n       fi.amount_cents AS in_amount,\n       ou.handle AS origin_name,\n       fo.amount_cents - fi.amount_cents AS skim\nFROM p2p fi\nJOIN users su ON su.user_id = fi.sender_id\nJOIN p2p fo ON fo.receiver_id = fi.sender_id\n  AND fo.sender_id = 2 AND fo.p2p_date = '2026-04-02' AND fo.status = 'settled'\nJOIN users ou ON ou.user_id = fo.sender_id\nWHERE fi.p2p_date = '2026-04-03' AND fi.status = 'settled'\nORDER BY fi.p2p_id ASC;`, order: "exact" },
      { prompt: "One row closing the ring: fan_out_volume (user 2 on 04-02), fan_in_volume (into user 9 on 04-03), skim_total.", code: `SELECT\n  (SELECT SUM(amount_cents) FROM p2p\n    WHERE sender_id = 2 AND p2p_date = '2026-04-02' AND status = 'settled') AS fan_out_volume,\n  (SELECT SUM(amount_cents) FROM p2p\n    WHERE receiver_id = 9 AND p2p_date = '2026-04-03' AND status = 'settled') AS fan_in_volume,\n  (SELECT SUM(amount_cents) FROM p2p\n    WHERE sender_id = 2 AND p2p_date = '2026-04-02' AND status = 'settled')\n    - (SELECT SUM(amount_cents) FROM p2p\n    WHERE receiver_id = 9 AND p2p_date = '2026-04-03' AND status = 'settled') AS skim_total;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Revolut",
    title: "Sender RFM, fraud edition",
    scenario:
      "Score every sender: frequency, monetary, recency to 2026-07-01. The dormant wallet has nothing to score.",
    steps: [
      { prompt: "Per sender: freq, monetary, recency_days (integer), ordered by monetary descending.", code: `SELECT sender_id, COUNT(*) AS freq,\n       SUM(amount_cents) AS monetary,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(p2p_date)) AS INTEGER) AS recency_days\nFROM p2p\nWHERE status = 'settled'\nGROUP BY sender_id\nORDER BY monetary DESC;`, order: "exact" },
      { prompt: "The freshest sender (smallest recency): sender_id, recency_days. One row, ordered by recency_days ascending, sender_id ascending, LIMIT 1.", code: `SELECT sender_id,\n       CAST(JULIANDAY('2026-07-01') - JULIANDAY(MAX(p2p_date)) AS INTEGER) AS recency_days\nFROM p2p\nWHERE status = 'settled'\nGROUP BY sender_id\nORDER BY recency_days ASC, sender_id ASC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Aegis Risk",
    title: "The tie registry",
    scenario:
      "Two pairs of wallets tie on sent volume. Build the registry the analysts cite in the memo.",
    steps: [
      { prompt: "Tied volumes only: vol, users_tied (GROUP_CONCAT of sender_id), tie_size, ordered by vol descending.", code: `WITH sent AS (\n  SELECT sender_id, SUM(amount_cents) AS vol\n  FROM p2p WHERE status = 'settled' GROUP BY sender_id\n),\nranked AS (\n  SELECT sender_id, vol, COUNT(*) OVER (PARTITION BY vol) AS tie_size FROM sent\n)\nSELECT vol, GROUP_CONCAT(sender_id) AS users_tied, tie_size\nFROM ranked\nWHERE tie_size > 1\nGROUP BY vol\nORDER BY vol DESC;`, order: "exact" },
      { prompt: "Count the distinct tied volumes. One column: tie_groups.", code: `WITH sent AS (\n  SELECT sender_id, SUM(amount_cents) AS vol\n  FROM p2p WHERE status = 'settled' GROUP BY sender_id\n),\nranked AS (\n  SELECT sender_id, vol, COUNT(*) OVER (PARTITION BY vol) AS tie_size FROM sent\n)\nSELECT COUNT(DISTINCT vol) AS tie_groups\nFROM ranked\nWHERE tie_size > 1;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Velttrum Pay",
    title: "Fan-in screen",
    scenario:
      "The receiving end of the ring: one beneficiary, many senders, one day.",
    steps: [
      { prompt: "Receiver+day groups with 3+ distinct settled senders: receiver_id, p2p_date, sender_count, total, ordered by p2p_date ascending.", code: `SELECT receiver_id, p2p_date,\n       COUNT(DISTINCT sender_id) AS sender_count,\n       SUM(amount_cents) AS total\nFROM p2p\nWHERE status = 'settled'\nGROUP BY receiver_id, p2p_date\nHAVING COUNT(DISTINCT sender_id) >= 3\nORDER BY p2p_date ASC;`, order: "exact" },
      { prompt: "List the beneficiary's four legs: p2p_id, sender_id, amount_cents, risk_score, ordered by p2p_id ascending.", code: `SELECT p2p_id, sender_id, amount_cents, risk_score\nFROM p2p\nWHERE receiver_id = 9 AND p2p_date = '2026-04-03'\nORDER BY p2p_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "PayPal",
    title: "Case closed: the network memo",
    scenario:
      "Everything the investigators need in two queries: the money story and the enforcement story.",
    steps: [
      { prompt: "One row: settled_volume, high_risk_rows (count risk >= 80), high_risk_share_pct (1 decimal).", code: `SELECT SUM(amount_cents) AS settled_volume,\n       SUM(CASE WHEN risk_score >= 80 THEN 1 ELSE 0 END) AS high_risk_rows,\n       ROUND(100.0 * SUM(CASE WHEN risk_score >= 80 THEN amount_cents ELSE 0 END)\n         / SUM(amount_cents), 1) AS high_risk_share_pct\nFROM p2p\nWHERE status = 'settled';`, order: "exact" },
      { prompt: "One row: open_cases, investigating_cases, sars_filed.", code: `SELECT SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_cases,\n       SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) AS investigating_cases,\n       SUM(sar_filed) AS sars_filed\nFROM cases;`, order: "exact" },
    ],
  },
];
