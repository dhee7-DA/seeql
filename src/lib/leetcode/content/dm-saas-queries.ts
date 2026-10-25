// Domain Mastery — SaaS & Subscriptions · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in dm-saas-seed.ts.
// Statements cite only probe-verified facts (scripts/r12-saas-probe.ts +
// scripts/r12-facts.txt). Expected outputs are engine-generated into
// dm-expected.ts by scripts/dm-verify.ts — never hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_SAAS_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Collected invoice count",
    statement:
      "The billing book mixes paid, failed, pending and refunded rows. Count how many invoices have status 'paid'. Output a single column paid_invoices with one row.",
    code: `SELECT COUNT(*) AS paid_invoices
FROM invoices
WHERE status = 'paid';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Enterprise-segment roster",
    statement:
      "List the accounts whose SEGMENT is 'Enterprise'. Output account_id, name, region and status, ordered by account_id ascending. Remember the whale is the newest of them.",
    code: `SELECT account_id, name, region, status
FROM accounts
WHERE segment = 'Enterprise'
ORDER BY account_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "Datadog",
    title: "Plan catalog",
    statement:
      "List every distinct plan value that appears in the subscriptions table, one per row, ordered alphabetically. Single column: plan.",
    code: `SELECT DISTINCT plan
FROM subscriptions
ORDER BY plan ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Atlassian",
    title: "Accounts per region",
    statement:
      "Count the accounts per region. Output region and account_count, ordered by account_count descending, then region ascending. LATAM is the smallest book.",
    code: `SELECT region, COUNT(*) AS account_count
FROM accounts
GROUP BY region
ORDER BY account_count DESC, region ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "Failed billings",
    statement:
      "Count the invoices whose status is 'failed'. Output a single column failed_invoices with one row. Every failure is a dunning story.",
    code: `SELECT COUNT(*) AS failed_invoices
FROM invoices
WHERE status = 'failed';`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Flowstack",
    title: "Pending queue",
    statement:
      "List the pending invoices. Output invoice_id, account_id, issued_date, amount_cents, ordered by invoice_id ascending. Exactly one row is awaiting payment.",
    code: `SELECT invoice_id, account_id, issued_date, amount_cents
FROM invoices
WHERE status = 'pending'
ORDER BY invoice_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Top-5 largest invoices",
    statement:
      "List the five largest invoices by amount. Output invoice_id, account_id, amount_cents and status, ordered by amount_cents descending, then invoice_id ascending. The whale invoice sits exactly on the 100000 line.",
    code: `SELECT invoice_id, account_id, amount_cents, status
FROM invoices
ORDER BY amount_cents DESC, invoice_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Churned book",
    statement:
      "List the accounts whose status is 'churned'. Output account_id, name, region and signup_date, ordered by account_id ascending. One account left and never came back.",
    code: `SELECT account_id, name, region, signup_date
FROM accounts
WHERE status = 'churned'
ORDER BY account_id ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "Datadog",
    title: "Admin seat census",
    statement:
      "Count the seats whose role is 'admin'. Output a single column admin_seats with one row.",
    code: `SELECT COUNT(*) AS admin_seats
FROM seats
WHERE role = 'admin';`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Atlassian",
    title: "Five-figure MRR line",
    statement:
      "The finance team flags any CURRENT subscription (end_date IS NULL) with mrr_cents >= 100000. Count those rows. Output a single column at_the_line with one row. Watch the boundary: >= holds, > does not.",
    code: `SELECT COUNT(*) AS at_the_line
FROM subscriptions
WHERE end_date IS NULL AND mrr_cents >= 100000;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "Live subscriptions",
    statement:
      "Count the subscriptions whose end_date IS NULL — the currently active plan rows. Output a single column current_subs with one row.",
    code: `SELECT COUNT(*) AS current_subs
FROM subscriptions
WHERE end_date IS NULL;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Flowstack",
    title: "The refunded row",
    statement:
      "List the refunded invoices. Output invoice_id, account_id, issued_date, amount_cents, ordered by invoice_id ascending. There is exactly one — a duplicate billing made right.",
    code: `SELECT invoice_id, account_id, issued_date, amount_cents
FROM invoices
WHERE status = 'refunded'
ORDER BY invoice_id ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Telemetry volume",
    statement:
      "Count all rows in the events table (the July 20-23 product window). Output a single column event_count with one row.",
    code: `SELECT COUNT(*) AS event_count
FROM events;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Invite volume",
    statement:
      "Count the events whose event_type is 'invite'. Output a single column invite_count with one row. Every invite in the book belongs to one seat on one day.",
    code: `SELECT COUNT(*) AS invite_count
FROM events
WHERE event_type = 'invite';`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "Datadog",
    title: "SMB roster",
    statement:
      "List the SMB-segment accounts. Output account_id, name, region, status, ordered by account_id ascending. Five rows — including the churned one.",
    code: `SELECT account_id, name, region, status
FROM accounts
WHERE segment = 'SMB'
ORDER BY account_id ASC;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Atlassian",
    title: "LATAM book",
    statement:
      "List the LATAM accounts. Output account_id, name, segment, status, ordered by account_id ascending. Two rows — one of them is the whole regional story.",
    code: `SELECT account_id, name, segment, status
FROM accounts
WHERE region = 'LATAM'
ORDER BY account_id ASC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "Burning tickets",
    statement:
      "List the tickets at priority 'high' that are still open. Output ticket_id, account_id, opened_date, ordered by ticket_id ascending. The dormant payer owns one of them.",
    code: `SELECT ticket_id, account_id, opened_date
FROM tickets
WHERE priority = 'high' AND status = 'open'
ORDER BY ticket_id ASC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Flowstack",
    title: "The whale subscription",
    statement:
      "List account 10's subscriptions. Output sub_id, plan, mrr_cents, start_date, end_date, ordered by sub_id ascending. Note what the MRR does to the five-figure line.",
    code: `SELECT sub_id, plan, mrr_cents, start_date, end_date
FROM subscriptions
WHERE account_id = 10
ORDER BY sub_id ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Viewer seats",
    statement:
      "List the seats whose role is 'viewer'. Output seat_id, account_id, joined_date, last_active_date, ordered by seat_id ascending. Exactly one exists — and it has been quiet lately.",
    code: `SELECT seat_id, account_id, joined_date, last_active_date
FROM seats
WHERE role = 'viewer'
ORDER BY seat_id ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Ticket priority ladder",
    statement:
      "Count the tickets per priority. Output priority and ticket_count, ordered by ticket_count descending, then priority ascending.",
    code: `SELECT priority, COUNT(*) AS ticket_count
FROM tickets
GROUP BY priority
ORDER BY ticket_count DESC, priority ASC;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Current MRR leaderboard",
    statement:
      "Rank every CURRENT subscription (end_date IS NULL) by mrr_cents with RANK(). Output account_id, mrr_cents and rnk, ordered by rnk ascending, then account_id ascending. The ties are the interview: rank 2 holds two accounts, ranks 4 and 8 hold four each.",
    code: `SELECT account_id, mrr_cents,
  RANK() OVER (ORDER BY mrr_cents DESC) AS rnk
FROM subscriptions
WHERE end_date IS NULL
ORDER BY rnk ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Dense MRR leaderboard",
    statement:
      "Same leaderboard, DENSE_RANK() this time. Output account_id, mrr_cents and drank, ordered by drank ascending, then account_id ascending. Dense ranks squeeze 11 accounts into 4 tiers.",
    code: `SELECT account_id, mrr_cents,
  DENSE_RANK() OVER (ORDER BY mrr_cents DESC) AS drank
FROM subscriptions
WHERE end_date IS NULL
ORDER BY drank ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Datadog",
    title: "Segment MRR rollup",
    statement:
      "Join current subscriptions to accounts and sum mrr_cents per segment. Output segment and segment_mrr, ordered by segment_mrr descending. The Enterprise number carries nearly two-thirds of the book.",
    code: `SELECT a.segment, SUM(s.mrr_cents) AS segment_mrr
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.segment
ORDER BY segment_mrr DESC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Seat census with honest zeros",
    statement:
      "Count each account's seats, KEEPING accounts with none. Output account_id, name and seat_count, ordered by account_id ascending. Two paying accounts show 0 — never onboarded, or the team rolled off.",
    code: `SELECT a.account_id, a.name, COUNT(s.seat_id) AS seat_count
FROM accounts a
LEFT JOIN seats s ON s.account_id = a.account_id
GROUP BY a.account_id, a.name
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Nimbus Metrics",
    title: "Monthly billing volume",
    statement:
      "Sum invoice amounts per issue month. Output the month as ym (strftime '%Y-%m') and issued_cents, ordered by ym ascending. June more than doubles May.",
    code: `SELECT strftime('%Y-%m', issued_date) AS ym,
  SUM(amount_cents) AS issued_cents
FROM invoices
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Month-over-month delta",
    statement:
      "Compute each month's issued_cents and its delta vs the previous month with LAG. Output ym, issued_cents and mom_delta (NULL for the first month), ordered by ym ascending. June's delta is exactly the whale's MRR.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', issued_date) AS ym, SUM(amount_cents) AS issued_cents
  FROM invoices GROUP BY ym)
SELECT ym, issued_cents,
  issued_cents - LAG(issued_cents) OVER (ORDER BY ym) AS mom_delta
FROM monthly
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Dunning leaderboard",
    statement:
      "Count failed invoices per account. Output account_id and failed_count, ordered by failed_count descending, then account_id ascending. One account owns four straight failures.",
    code: `SELECT account_id, COUNT(*) AS failed_count
FROM invoices
WHERE status = 'failed'
GROUP BY account_id
ORDER BY failed_count DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Invoice drift audit",
    statement:
      "Join each invoice to the subscription active when it was issued (start_date <= issued_date, and end_date IS NULL or end_date > issued_date). Return the rows where amount_cents differs from the subscription's mrr_cents: invoice_id, account_id, issued_date, amount_cents, mrr_cents, ordered by invoice_id ascending. Exactly three drift rows — two promos and one proration blend.",
    code: `SELECT i.invoice_id, i.account_id, i.issued_date,
  i.amount_cents, s.mrr_cents
FROM invoices i
JOIN subscriptions s
  ON s.account_id = i.account_id
 AND s.start_date <= i.issued_date
 AND (s.end_date IS NULL OR s.end_date > i.issued_date)
WHERE i.amount_cents <> s.mrr_cents
ORDER BY i.invoice_id ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Datadog",
    title: "Duplicate billing detector",
    statement:
      "Find (account_id, issued_date, amount_cents) groups billed more than once. Output account_id, issued_date, amount_cents and dup_count, ordered by issued_date ascending. One account got double-billed in January — once paid, once refunded.",
    code: `SELECT account_id, issued_date, amount_cents, COUNT(*) AS dup_count
FROM invoices
GROUP BY account_id, issued_date, amount_cents
HAVING COUNT(*) > 1
ORDER BY issued_date ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Daily issue totals",
    statement:
      "Sum invoice amounts per issued_date. Output issued_date, day_total and invoice_count, ordered by issued_date ascending. Six quiet days move a single 4900 invoice; two heavy days tie at 104100.",
    code: `SELECT issued_date, SUM(amount_cents) AS day_total,
  COUNT(*) AS invoice_count
FROM invoices
GROUP BY issued_date
ORDER BY issued_date ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Nimbus Metrics",
    title: "Event type census",
    statement:
      "Count events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending. Invites are the rarest thing in the book.",
    code: `SELECT event_type, COUNT(*) AS event_count
FROM events
GROUP BY event_type
ORDER BY event_count DESC, event_type ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Sessions per seat",
    statement:
      "Sessionize every seat's event timeline with a 1800-second gap cutoff (a bigger gap starts a new session). Output seat_id and session_count, ordered by seat_id ascending. Seat 1 splits into six sessions; seats 11 and 12 never appear at all.",
    code: `WITH seq AS (
  SELECT seat_id, event_id, event_ts,
    LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS prev_ts
  FROM events),
stamps AS (
  SELECT seat_id, event_id,
    CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_sess
  FROM seq),
marked AS (
  SELECT *,
    SUM(new_sess) OVER (PARTITION BY seat_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS sess
  FROM stamps)
SELECT seat_id, COUNT(DISTINCT sess) AS session_count
FROM marked
GROUP BY seat_id
ORDER BY seat_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Region MRR leaderboard",
    statement:
      "Sum current mrr_cents per region. Output region and region_mrr, ordered by region_mrr descending. LATAM 'leads' — on the back of exactly one account.",
    code: `SELECT a.region, SUM(s.mrr_cents) AS region_mrr
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.region
ORDER BY region_mrr DESC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Owner MRR leaderboard",
    statement:
      "Sum current mrr_cents per owner (customer success manager). Output owner and book_mrr, ordered by book_mrr descending. The top book is whale-assisted.",
    code: `SELECT a.owner, SUM(s.mrr_cents) AS book_mrr
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.owner
ORDER BY book_mrr DESC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Datadog",
    title: "Issued vs collected by month",
    statement:
      "For each issue month output ym, issued_cents (all invoices) and collected_cents (status 'paid' only), ordered by ym ascending. The gap between the two columns is dunning at work.",
    code: `SELECT strftime('%Y-%m', issued_date) AS ym,
  SUM(amount_cents) AS issued_cents,
  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS collected_cents
FROM invoices
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Ticketless accounts",
    statement:
      "List the accounts that own NO tickets. Output account_id, name and status, ordered by account_id ascending. Three quiet books — all healthy, for now.",
    code: `SELECT a.account_id, a.name, a.status
FROM accounts a
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.account_id = a.account_id)
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Nimbus Metrics",
    title: "Never-activated seats",
    statement:
      "List seats whose last_active_date IS NULL, with their event counts in the window. Output seat_id, account_id and event_count (0 when none), ordered by seat_id ascending. Both silent seats belong to accounts with a story.",
    code: `SELECT s.seat_id, s.account_id, COUNT(e.event_id) AS event_count
FROM seats s
LEFT JOIN events e ON e.seat_id = s.seat_id
WHERE s.last_active_date IS NULL
GROUP BY s.seat_id, s.account_id
ORDER BY s.seat_id ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Billing frequency ranking",
    statement:
      "Rank accounts by invoice count with RANK(). Output account_id and invoice_count and rnk, ordered by rnk ascending, then account_id ascending. The duplicate-billed account tops the list.",
    code: `SELECT account_id, COUNT(*) AS invoice_count,
  RANK() OVER (ORDER BY COUNT(*) DESC) AS rnk
FROM invoices
GROUP BY account_id
ORDER BY rnk ASC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "Salesforce",
    title: "2026 new logos",
    statement:
      "A new logo is an account's FIRST subscription (its minimum start_date). List those starting in 2026: account_id, first_start and mrr_cents, ordered by first_start ascending. Six rows — and none in April or May.",
    code: `SELECT account_id, MIN(start_date) AS first_start, mrr_cents
FROM subscriptions
GROUP BY account_id
HAVING MIN(start_date) >= '2026-01-01'
ORDER BY first_start ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Movement ledger",
    statement:
      "Classify every subscription row with LAG over each account's history: 'new' when no predecessor, 'expansion' when mrr rose, 'contraction' when it fell, 'flat-restart' when unchanged. Output sub_id, account_id, start_date, mrr_cents and kind, ordered by start_date ascending, then sub_id ascending. The lone flat-restart is a churn that came back.",
    code: `WITH hist AS (
  SELECT sub_id, account_id, mrr_cents, start_date,
    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr
  FROM subscriptions)
SELECT sub_id, account_id, start_date, mrr_cents,
  CASE WHEN prev_mrr IS NULL THEN 'new'
       WHEN mrr_cents > prev_mrr THEN 'expansion'
       WHEN mrr_cents < prev_mrr THEN 'contraction'
       ELSE 'flat-restart' END AS kind
FROM hist
ORDER BY start_date ASC, sub_id ASC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Invite velocity pairs",
    statement:
      "Growth teams flag rapid-fire invite bursts. Self-join the invite events so each earlier invite pairs with a later invite from the SAME seat within 300 seconds. Output a_event_id, b_event_id and gap_s, ordered by gap_s ascending, then a_event_id ascending. Four invites 60s apart make six pairs on their own.",
    code: `SELECT a.event_id AS a_event_id, b.event_id AS b_event_id,
  b.event_ts - a.event_ts AS gap_s
FROM events a
JOIN events b ON a.seat_id = b.seat_id AND a.event_id < b.event_id
WHERE a.event_type = 'invite' AND b.event_type = 'invite'
  AND b.event_ts - a.event_ts <= 300
ORDER BY gap_s ASC, a_event_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Atlassian",
    title: "The two clock traps",
    statement:
      "Find every seat's consecutive-event gap that sits above the 1800-second session cutoff but within the same day's reach (gap <= 20000 — everything larger is a cross-day sleep). Output seat_id and gap_s, ordered by gap_s ascending. Exactly two rows: a session-splitting pause and an hour-on-the-line pair.",
    code: `WITH seq AS (
  SELECT seat_id, event_ts,
    event_ts - LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS gap_s
  FROM events)
SELECT seat_id, gap_s
FROM seq
WHERE gap_s > 1800 AND gap_s <= 20000
ORDER BY gap_s ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Flowstack",
    title: "Total sessions in the window",
    statement:
      "Sessionize every seat's timeline with the 1800-second gap cutoff and count the sessions across ALL seats. Output a single column total_sessions with one row. Silent seats contribute nothing.",
    code: `WITH seq AS (
  SELECT seat_id, event_id, event_ts,
    LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS prev_ts
  FROM events),
stamps AS (
  SELECT seat_id, event_id,
    CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_sess
  FROM seq),
marked AS (
  SELECT *,
    SUM(new_sess) OVER (PARTITION BY seat_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS sess
  FROM stamps)
SELECT COUNT(*) AS total_sessions
FROM (SELECT seat_id, sess FROM marked GROUP BY seat_id, sess);`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Salesforce",
    title: "MRR movement waterfall",
    statement:
      "Classify each subscription row with LAG (new / expansion / contraction / flat-restart) and price the movement as mrr_cents minus COALESCE(prev_mrr, 0). Group by month and kind. Output ym, kind and delta_cents, ordered by ym ascending, then kind ascending. April nets to zero; June's jump is one signature.",
    code: `WITH hist AS (
  SELECT sub_id, account_id, mrr_cents, start_date,
    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr
  FROM subscriptions),
moves AS (
  SELECT strftime('%Y-%m', start_date) AS ym,
    CASE WHEN prev_mrr IS NULL THEN 'new'
         WHEN mrr_cents > prev_mrr THEN 'expansion'
         WHEN mrr_cents < prev_mrr THEN 'contraction'
         ELSE 'flat-restart' END AS kind,
    mrr_cents - COALESCE(prev_mrr, 0) AS delta_cents
  FROM hist)
SELECT ym, kind, SUM(delta_cents) AS delta_cents
FROM moves
GROUP BY ym, kind
ORDER BY ym ASC, kind ASC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "HubSpot",
    title: "True churn vs the naive sum",
    statement:
      "The naive churn number sums mrr over every end-dated subscription row. The true churn keeps only rows with NO successor subscription starting on or after the end_date. Output both in one row: naive_churn and true_churn. The first is eleven times the second.",
    code: `WITH naive AS (
  SELECT SUM(mrr_cents) AS v FROM subscriptions WHERE end_date IS NOT NULL),
truthy AS (
  SELECT SUM(mrr_cents) AS v FROM subscriptions s
  WHERE s.end_date IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM subscriptions n
      WHERE n.account_id = s.account_id AND n.start_date >= s.end_date))
SELECT (SELECT v FROM naive) AS naive_churn,
  (SELECT v FROM truthy) AS true_churn;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Datadog",
    title: "Dense top-6 billing days",
    statement:
      "Rank each day's issued total with DENSE_RANK() and keep the top six dense ranks. Output day_total, d_rank and n_days (how many days share the rank), ordered by d_rank ascending. The 104100 tie must keep BOTH of its days.",
    code: `WITH daily AS (
  SELECT issued_date, SUM(amount_cents) AS day_total
  FROM invoices GROUP BY issued_date),
ranked AS (
  SELECT day_total, DENSE_RANK() OVER (ORDER BY day_total DESC) AS d_rank
  FROM daily)
SELECT day_total, d_rank, COUNT(*) AS n_days
FROM ranked
WHERE d_rank <= 6
GROUP BY day_total, d_rank
ORDER BY d_rank ASC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "The MRR tie registry",
    statement:
      "Group CURRENT subscriptions by mrr_cents and register the member account ids with GROUP_CONCAT. Output mrr_cents, member_count and members (ids joined 'id,id,...' ascending), ordered by mrr_cents descending. Four tiers, three of them shared.",
    code: `SELECT mrr_cents, COUNT(*) AS member_count,
  GROUP_CONCAT(account_id) AS members
FROM (
  SELECT account_id, mrr_cents
  FROM subscriptions
  WHERE end_date IS NULL
  ORDER BY account_id ASC)
GROUP BY mrr_cents
ORDER BY mrr_cents DESC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Flowstack",
    title: "The whale flip",
    statement:
      "Show each region's current MRR twice: as reported, and excluding account 10's subscription. Output region, region_mrr and ex_whale_mrr, ordered by region_mrr descending. The leaderboard flips the moment the whale steps out.",
    code: `SELECT a.region,
  SUM(s.mrr_cents) AS region_mrr,
  SUM(CASE WHEN s.account_id = 10 THEN 0 ELSE s.mrr_cents END) AS ex_whale_mrr
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.region
ORDER BY region_mrr DESC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Usage RFM per account",
    statement:
      "Build a usage lens over every account: event_count in the window, last_event_day (the UTC date of the account's last event, NULL if never) and current mrr_cents (0 if none). Output account_id, event_count, last_event_day, mrr_cents, ordered by account_id ascending. Four accounts show zero activity — one of them churned, three still pay.",
    code: `SELECT a.account_id,
  COUNT(e.event_id) AS event_count,
  strftime('%Y-%m-%d', MAX(e.event_ts), 'unixepoch') AS last_event_day,
  COALESCE(s.mrr_cents, 0) AS mrr_cents
FROM accounts a
LEFT JOIN events e ON e.account_id = a.account_id
LEFT JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.account_id
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Atlassian",
    title: "The churn-risk dossier",
    statement:
      "Flag accounts that currently PAY but produced ZERO events in the window AND show at least one distress signal — a failed invoice or a high-priority open ticket. Output account_id, name, mrr_cents, failed_count and open_high_count, ordered by account_id ascending. Exactly one account clears the bar.",
    code: `SELECT a.account_id, a.name, s.mrr_cents,
  (SELECT COUNT(*) FROM invoices i WHERE i.account_id = a.account_id AND i.status = 'failed') AS failed_count,
  (SELECT COUNT(*) FROM tickets t WHERE t.account_id = a.account_id AND t.priority = 'high' AND t.status = 'open') AS open_high_count
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.account_id = a.account_id)
  AND (
    EXISTS (SELECT 1 FROM invoices i WHERE i.account_id = a.account_id AND i.status = 'failed')
    OR EXISTS (SELECT 1 FROM tickets t WHERE t.account_id = a.account_id AND t.priority = 'high' AND t.status = 'open')
  )
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Collection gap per account",
    statement:
      "For each account, price the gap between issued and collected: SUM(all amounts) minus SUM(paid amounts). Output account_id and gap_cents, ordered by gap_cents descending, then account_id ascending. The dunning saga's account tops it; a pending row makes another account's gap double.",
    code: `SELECT account_id,
  SUM(amount_cents)
    - SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS gap_cents
FROM invoices
GROUP BY account_id
ORDER BY gap_cents DESC, account_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Running billing curve",
    statement:
      "Build the running cumulative issued curve over invoice days. Output issued_date, day_total and running_total, ordered by issued_date ascending. The curve ends at the half-year's full issue volume.",
    code: `WITH daily AS (
  SELECT issued_date, SUM(amount_cents) AS day_total
  FROM invoices GROUP BY issued_date)
SELECT issued_date, day_total,
  SUM(day_total) OVER (ORDER BY issued_date ROWS UNBOUNDED PRECEDING) AS running_total
FROM daily
ORDER BY issued_date ASC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Datadog",
    title: "New-logo months with honest zeros",
    statement:
      "A new logo starts its FIRST subscription. Report new-logo MRR for every month of 2026 H1, KEEPING months with none. Output ym and new_logo_mrr, ordered by ym ascending. Two consecutive zero months sit right before the whale lands.",
    code: `WITH months(ym) AS (
  VALUES ('2026-01'),('2026-02'),('2026-03'),('2026-04'),('2026-05'),('2026-06')),
firsts AS (
  SELECT account_id, MIN(start_date) AS first_start
  FROM subscriptions GROUP BY account_id)
SELECT m.ym, COALESCE(SUM(s.mrr_cents), 0) AS new_logo_mrr
FROM months m
LEFT JOIN firsts f
  ON f.first_start >= m.ym || '-01'
 AND f.first_start < date(m.ym || '-01', '+1 month')
LEFT JOIN subscriptions s ON s.account_id = f.account_id AND s.start_date = f.first_start
GROUP BY m.ym
ORDER BY m.ym ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Flowstack",
    title: "Owner champions, whale excluded",
    statement:
      "Re-rank the owner books with account 10's subscription excluded. Output owner and ex_whale_mrr, ordered by ex_whale_mrr descending. The crowned owner changes; so does the order beneath.",
    code: `SELECT a.owner,
  SUM(CASE WHEN s.account_id = 10 THEN 0 ELSE s.mrr_cents END) AS ex_whale_mrr
FROM accounts a
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.owner
ORDER BY ex_whale_mrr DESC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Salesforce",
    title: "The 2-seat club",
    statement:
      "List the accounts with EXACTLY two seats, with their current MRR. Output account_id, name, seat_count and mrr_cents, ordered by account_id ascending. Four members — and their MRRs are not all equal.",
    code: `SELECT a.account_id, a.name, COUNT(*) AS seat_count, s.mrr_cents
FROM accounts a
JOIN seats st ON st.account_id = a.account_id
JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
GROUP BY a.account_id, a.name, s.mrr_cents
HAVING COUNT(*) = 2
ORDER BY a.account_id ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "HubSpot",
    title: "MRR bands at the line",
    statement:
      "Band the CURRENT subscriptions against the 100000 line: 'at-or-above' (>= 100000), 'mid' (10000 to 99999), 'under' (< 10000). Output band and sub_count, ordered by band ascending. One account defines the top band alone.",
    code: `SELECT CASE
    WHEN mrr_cents >= 100000 THEN 'at-or-above'
    WHEN mrr_cents >= 10000 THEN 'mid'
    ELSE 'under' END AS band,
  COUNT(*) AS sub_count
FROM subscriptions
WHERE end_date IS NULL
GROUP BY band
ORDER BY band ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Datadog",
    title: "The resurrection gap",
    statement:
      "Account 2 churned on 2026-03-31 and rejoined on 2026-05-01. Count its invoices per month across 2026 H1, KEEPING the empty month. Output ym and invoice_count, ordered by ym ascending. April must show 0 — the hole in the book.",
    code: `WITH months(ym) AS (
  VALUES ('2026-01'),('2026-02'),('2026-03'),('2026-04'),('2026-05'),('2026-06'))
SELECT m.ym, COUNT(i.invoice_id) AS invoice_count
FROM months m
LEFT JOIN invoices i
  ON i.account_id = 2 AND strftime('%Y-%m', i.issued_date) = m.ym
GROUP BY m.ym
ORDER BY m.ym ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Atlassian",
    title: "Proration economics",
    statement:
      "Account 6 switched Scale to Growth on 2026-04-15 and that day's invoice billed a blend. Output one row: old_mrr (the ending subscription), new_mrr (the starting one) and billed (the 04-15 invoice amount). The blend sits between the two rates.",
    code: `SELECT old_s.mrr_cents AS old_mrr,
  new_s.mrr_cents AS new_mrr,
  i.amount_cents AS billed
FROM subscriptions old_s
JOIN subscriptions new_s ON new_s.account_id = old_s.account_id AND new_s.start_date = old_s.end_date
JOIN invoices i ON i.account_id = old_s.account_id AND i.issued_date = old_s.end_date
WHERE old_s.account_id = 6 AND old_s.end_date = '2026-04-15';`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Power seats",
    statement:
      "List the seats with at least 7 events in the window. Output seat_id, account_id and event_count, ordered by event_count descending, then seat_id ascending. Six seats clear the bar; the busiest belongs to the oldest Enterprise book.",
    code: `SELECT seat_id, account_id, COUNT(*) AS event_count
FROM events
GROUP BY seat_id, account_id
HAVING COUNT(*) >= 7
ORDER BY event_count DESC, seat_id ASC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Flowstack",
    title: "The whale dossier",
    statement:
      "One row that touches every table for account 10: current mrr_cents, lifetime billed (invoice sum), seat_count, event_count and high_open_tickets. Output those five columns. The whale's whole world on a single line.",
    code: `SELECT
  (SELECT mrr_cents FROM subscriptions WHERE account_id = 10 AND end_date IS NULL) AS mrr_cents,
  (SELECT SUM(amount_cents) FROM invoices WHERE account_id = 10) AS lifetime_billed,
  (SELECT COUNT(*) FROM seats WHERE account_id = 10) AS seat_count,
  (SELECT COUNT(*) FROM events WHERE account_id = 10) AS event_count,
  (SELECT COUNT(*) FROM tickets WHERE account_id = 10 AND priority = 'high') AS high_open_tickets;`,
    order: "exact",
  },
];
