// Domain Mastery — SaaS & Subscriptions · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r12-saas-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_SAAS_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Billing health check",
    scenario:
      "Monday revenue standup opens with the invoice book: how much of it actually converted, and how do the broken rows split?",
    steps: [
      { prompt: "Count paid invoices. One column: paid_invoices.", code: `SELECT COUNT(*) AS paid_invoices\nFROM invoices\nWHERE status = 'paid';`, order: "exact" },
      { prompt: "Count invoices per status. Output status and invoice_count, ordered by invoice_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS invoice_count\nFROM invoices\nGROUP BY status\nORDER BY invoice_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Segment map",
    scenario:
      "The quarterly board deck needs the account book sliced by sales taxonomy first, then the Enterprise names.",
    steps: [
      { prompt: "Count accounts per segment. Output segment and account_count, ordered by account_count descending, then segment ascending.", code: `SELECT segment, COUNT(*) AS account_count\nFROM accounts\nGROUP BY segment\nORDER BY account_count DESC, segment ASC;`, order: "exact" },
      { prompt: "List the Enterprise-segment accounts: account_id, name, region, ordered by account_id ascending.", code: `SELECT account_id, name, region\nFROM accounts\nWHERE segment = 'Enterprise'\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Datadog",
    title: "Plan catalog review",
    scenario:
      "Pricing is on the table. Start from what plans exist and where the live book sits.",
    steps: [
      { prompt: "List the distinct plans in subscriptions, ordered alphabetically. Single column: plan.", code: `SELECT DISTINCT plan\nFROM subscriptions\nORDER BY plan ASC;`, order: "exact" },
      { prompt: "Count current subscriptions (end_date IS NULL) per plan. Output plan and live_count, ordered by live_count descending, then plan ascending.", code: `SELECT plan, COUNT(*) AS live_count\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY plan\nORDER BY live_count DESC, plan ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Atlassian",
    title: "Region footprint",
    scenario:
      "Field marketing wants the regional shape of the book — counts first, then the smallest region's names.",
    steps: [
      { prompt: "Count accounts per region. Output region and account_count, ordered by account_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS account_count\nFROM accounts\nGROUP BY region\nORDER BY account_count DESC, region ASC;`, order: "exact" },
      { prompt: "List the LATAM accounts: account_id, name, status, ordered by account_id ascending.", code: `SELECT account_id, name, status\nFROM accounts\nWHERE region = 'LATAM'\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "Dunning snapshot",
    scenario:
      "Billing ops opens the dunning queue: how many bills failed, and what is still unresolved?",
    steps: [
      { prompt: "Count failed invoices. One column: failed_invoices.", code: `SELECT COUNT(*) AS failed_invoices\nFROM invoices\nWHERE status = 'failed';`, order: "exact" },
      { prompt: "List invoices that are neither paid nor refunded: invoice_id, account_id, issued_date, status, ordered by invoice_id ascending.", code: `SELECT invoice_id, account_id, issued_date, status\nFROM invoices\nWHERE status IN ('failed', 'pending')\nORDER BY invoice_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Flowstack",
    title: "Seat roster",
    scenario:
      "People ops audits who actually holds seats, starting with the roles.",
    steps: [
      { prompt: "Count seats per role. Output role and seat_count, ordered by seat_count descending, then role ascending.", code: `SELECT role, COUNT(*) AS seat_count\nFROM seats\nGROUP BY role\nORDER BY seat_count DESC, role ASC;`, order: "exact" },
      { prompt: "List the viewer seats: seat_id, account_id, last_active_date, ordered by seat_id ascending.", code: `SELECT seat_id, account_id, last_active_date\nFROM seats\nWHERE role = 'viewer'\nORDER BY seat_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Ticket triage board",
    scenario:
      "CS leadership meets in ten minutes. Size the priority ladder, then pull the burning rows.",
    steps: [
      { prompt: "Count tickets per priority. Output priority and ticket_count, ordered by ticket_count descending, then priority ascending.", code: `SELECT priority, COUNT(*) AS ticket_count\nFROM tickets\nGROUP BY priority\nORDER BY ticket_count DESC, priority ASC;`, order: "exact" },
      { prompt: "List the open high-priority tickets: ticket_id, account_id, opened_date, ordered by ticket_id ascending.", code: `SELECT ticket_id, account_id, opened_date\nFROM tickets\nWHERE priority = 'high' AND status = 'open'\nORDER BY ticket_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "HubSpot",
    title: "The whale file",
    scenario:
      "Finance wants the single five-figure subscription pulled and framed against the line it sits on.",
    steps: [
      { prompt: "List account 10's subscriptions: sub_id, plan, mrr_cents, start_date, end_date, ordered by sub_id ascending.", code: `SELECT sub_id, plan, mrr_cents, start_date, end_date\nFROM subscriptions\nWHERE account_id = 10\nORDER BY sub_id ASC;`, order: "exact" },
      { prompt: "Count current subscriptions with mrr_cents >= 100000 and also those with mrr_cents > 100000, in one row. Columns: at_or_above, strictly_above.", code: `SELECT\n  COUNT(CASE WHEN mrr_cents >= 100000 THEN 1 END) AS at_or_above,\n  COUNT(CASE WHEN mrr_cents > 100000 THEN 1 END) AS strictly_above\nFROM subscriptions\nWHERE end_date IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Datadog",
    title: "Telemetry inventory",
    scenario:
      "The product analytics review starts from raw volume and the event vocabulary.",
    steps: [
      { prompt: "Count all events. One column: event_count.", code: `SELECT COUNT(*) AS event_count\nFROM events;`, order: "exact" },
      { prompt: "Count events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending.", code: `SELECT event_type, COUNT(*) AS event_count\nFROM events\nGROUP BY event_type\nORDER BY event_count DESC, event_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Atlassian",
    title: "Largest bills",
    scenario:
      "The collections call needs the five biggest invoices and whether any crossed the five-figure line.",
    steps: [
      { prompt: "List the five largest invoices: invoice_id, account_id, amount_cents, status, ordered by amount_cents descending, then invoice_id ascending.", code: `SELECT invoice_id, account_id, amount_cents, status\nFROM invoices\nORDER BY amount_cents DESC, invoice_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "Count invoices with amount_cents >= 100000. One column: whale_invoices.", code: `SELECT COUNT(*) AS whale_invoices\nFROM invoices\nWHERE amount_cents >= 100000;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "Owner books",
    scenario:
      "CS resourcing question: how many accounts does each manager carry?",
    steps: [
      { prompt: "Count accounts per owner. Output owner and account_count, ordered by account_count descending, then owner ascending.", code: `SELECT owner, COUNT(*) AS account_count\nFROM accounts\nGROUP BY owner\nORDER BY account_count DESC, owner ASC;`, order: "exact" },
      { prompt: "List Priya Nair's accounts: account_id, name, status, ordered by account_id ascending.", code: `SELECT account_id, name, status\nFROM accounts\nWHERE owner = 'Priya Nair'\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Flowstack",
    title: "Duplicate made right",
    scenario:
      "An auditor asks for the one refunded invoice and the day it shares with its twin.",
    steps: [
      { prompt: "List refunded invoices: invoice_id, account_id, issued_date, amount_cents, ordered by invoice_id ascending.", code: `SELECT invoice_id, account_id, issued_date, amount_cents\nFROM invoices\nWHERE status = 'refunded'\nORDER BY invoice_id ASC;`, order: "exact" },
      { prompt: "List account 3's invoices issued on 2026-01-19: invoice_id, amount_cents, status, ordered by invoice_id ascending.", code: `SELECT invoice_id, amount_cents, status\nFROM invoices\nWHERE account_id = 3 AND issued_date = '2026-01-19'\nORDER BY invoice_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Live book count",
    scenario:
      "A quick sanity check before the MRR review: how many subscriptions are live, and do all accounts have one?",
    steps: [
      { prompt: "Count subscriptions with end_date IS NULL. One column: current_subs.", code: `SELECT COUNT(*) AS current_subs\nFROM subscriptions\nWHERE end_date IS NULL;`, order: "exact" },
      { prompt: "Count current subscriptions per status of the account, including churned accounts with none. Output status and live_subs, ordered by status ascending.", code: `SELECT a.status, COUNT(s.sub_id) AS live_subs\nFROM accounts a\nLEFT JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.status\nORDER BY a.status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Churned book",
    scenario:
      "The churn review is a one-row table this half — pull it and its billing trail.",
    steps: [
      { prompt: "List churned accounts: account_id, name, region, signup_date, ordered by account_id ascending.", code: `SELECT account_id, name, region, signup_date\nFROM accounts\nWHERE status = 'churned'\nORDER BY account_id ASC;`, order: "exact" },
      { prompt: "List account 12's invoices: invoice_id, issued_date, amount_cents, status, ordered by invoice_id ascending.", code: `SELECT invoice_id, issued_date, amount_cents, status\nFROM invoices\nWHERE account_id = 12\nORDER BY invoice_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Datadog",
    title: "Invite census",
    scenario:
      "Growth asks how many invites the telemetry window holds before anyone builds a detector.",
    steps: [
      { prompt: "Count invite events. One column: invite_count.", code: `SELECT COUNT(*) AS invite_count\nFROM events\nWHERE event_type = 'invite';`, order: "exact" },
      { prompt: "List them: event_id, seat_id, account_id, event_ts, ordered by event_id ascending.", code: `SELECT event_id, seat_id, account_id, event_ts\nFROM events\nWHERE event_type = 'invite'\nORDER BY event_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Atlassian",
    title: "MidMarket book",
    scenario:
      "The MidMarket pod reviews its four accounts before the pipeline call.",
    steps: [
      { prompt: "List MidMarket accounts: account_id, name, region, status, ordered by account_id ascending.", code: `SELECT account_id, name, region, status\nFROM accounts\nWHERE segment = 'MidMarket'\nORDER BY account_id ASC;`, order: "exact" },
      { prompt: "List MidMarket accounts' current MRR: account_id, mrr_cents, ordered by mrr_cents descending, then account_id ascending.", code: `SELECT a.account_id, s.mrr_cents\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nWHERE a.segment = 'MidMarket'\nORDER BY s.mrr_cents DESC, a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Nimbus Metrics",
    title: "APAC book",
    scenario:
      "The APAC region review pulls its three accounts and their health signals.",
    steps: [
      { prompt: "List APAC accounts: account_id, name, segment, status, ordered by account_id ascending.", code: `SELECT account_id, name, segment, status\nFROM accounts\nWHERE region = 'APAC'\nORDER BY account_id ASC;`, order: "exact" },
      { prompt: "Count APAC tickets per priority. Output priority and ticket_count, ordered by ticket_count descending, then priority ascending. Use a join so the region filter drives the count.", code: `SELECT t.priority, COUNT(*) AS ticket_count\nFROM tickets t\nJOIN accounts a ON a.account_id = t.account_id\nWHERE a.region = 'APAC'\nGROUP BY t.priority\nORDER BY ticket_count DESC, t.priority ASC;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Flowstack",
    title: "SMB roster",
    scenario:
      "The self-serve pod pulls its book — five accounts, one of them already gone.",
    steps: [
      { prompt: "List SMB accounts: account_id, name, region, status, ordered by account_id ascending.", code: `SELECT account_id, name, region, status\nFROM accounts\nWHERE segment = 'SMB'\nORDER BY account_id ASC;`, order: "exact" },
      { prompt: "Count invoices per SMB account. Output account_id and invoice_count, ordered by account_id ascending.", code: `SELECT a.account_id, COUNT(i.invoice_id) AS invoice_count\nFROM accounts a\nJOIN invoices i ON i.account_id = a.account_id\nWHERE a.segment = 'SMB'\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Exports audit",
    scenario:
      "Data governance asks who exports data — the rarest power action in the window.",
    steps: [
      { prompt: "Count export events. One column: export_count.", code: `SELECT COUNT(*) AS export_count\nFROM events\nWHERE event_type = 'export';`, order: "exact" },
      { prompt: "List export events with the account name: e.event_id, a.name, e.event_ts, ordered by e.event_id ascending.", code: `SELECT e.event_id, a.name, e.event_ts\nFROM events e\nJOIN accounts a ON a.account_id = e.account_id\nWHERE e.event_type = 'export'\nORDER BY e.event_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Open work queue",
    scenario:
      "The CS board needs the live-ticket count and the day each opened.",
    steps: [
      { prompt: "Count tickets whose status is 'open'. One column: open_tickets.", code: `SELECT COUNT(*) AS open_tickets\nFROM tickets\nWHERE status = 'open';`, order: "exact" },
      { prompt: "List open tickets with account names: t.ticket_id, a.name, t.opened_date, ordered by t.opened_date ascending, then t.ticket_id ascending.", code: `SELECT t.ticket_id, a.name, t.opened_date\nFROM tickets t\nJOIN accounts a ON a.account_id = t.account_id\nWHERE t.status = 'open'\nORDER BY t.opened_date ASC, t.ticket_id ASC;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Salesforce",
    title: "MRR board review",
    scenario:
      "The quarterly MRR review needs the leaderboard with its honest ties on display.",
    steps: [
      { prompt: "Rank current subscriptions by mrr_cents with RANK(). Output account_id, mrr_cents, rnk, ordered by rnk ascending, then account_id ascending.", code: `SELECT account_id, mrr_cents,\n  RANK() OVER (ORDER BY mrr_cents DESC) AS rnk\nFROM subscriptions\nWHERE end_date IS NULL\nORDER BY rnk ASC, account_id ASC;`, order: "exact" },
      { prompt: "Sum current MRR and divide across the live book: output total_mrr and arpa (total divided by the number of current subscriptions) in one row.", code: `SELECT SUM(mrr_cents) AS total_mrr,\n  SUM(mrr_cents) / COUNT(*) AS arpa\nFROM subscriptions\nWHERE end_date IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Dense tiers",
    scenario:
      "The same board prefers tier numbers that don't skip. Re-cut the leaderboard densely.",
    steps: [
      { prompt: "Rank current subscriptions with DENSE_RANK(). Output account_id, mrr_cents, drank, ordered by drank ascending, then account_id ascending.", code: `SELECT account_id, mrr_cents,\n  DENSE_RANK() OVER (ORDER BY mrr_cents DESC) AS drank\nFROM subscriptions\nWHERE end_date IS NULL\nORDER BY drank ASC, account_id ASC;`, order: "exact" },
      { prompt: "Count current subscriptions per mrr tier: output mrr_cents and member_count, ordered by mrr_cents descending.", code: `SELECT mrr_cents, COUNT(*) AS member_count\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY mrr_cents\nORDER BY mrr_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Datadog",
    title: "Segment concentration",
    scenario:
      "Risk asks how concentrated the book is. Segment MRR first, then the share the top segment holds.",
    steps: [
      { prompt: "Sum current MRR per segment. Output segment and segment_mrr, ordered by segment_mrr descending.", code: `SELECT a.segment, SUM(s.mrr_cents) AS segment_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.segment\nORDER BY segment_mrr DESC;`, order: "exact" },
      { prompt: "Output the Enterprise share of total current MRR as a percentage with one decimal: share_pct (Enterprise mrr * 100.0 / total mrr). One row.", code: `SELECT ROUND(\n  100.0 * SUM(CASE WHEN a.segment = 'Enterprise' THEN s.mrr_cents ELSE 0 END)\n  / SUM(s.mrr_cents), 1) AS share_pct\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Adoption holes",
    scenario:
      "RevOps wants every account with its seat count — and expects to see the payers with nobody inside.",
    steps: [
      { prompt: "Count seats per account, keeping accounts with none. Output account_id, name, seat_count, ordered by account_id ascending.", code: `SELECT a.account_id, a.name, COUNT(s.seat_id) AS seat_count\nFROM accounts a\nLEFT JOIN seats s ON s.account_id = a.account_id\nGROUP BY a.account_id, a.name\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "List accounts with zero seats: account_id, name, status. Ordered by account_id ascending.", code: `SELECT a.account_id, a.name, a.status\nFROM accounts a\nWHERE NOT EXISTS (SELECT 1 FROM seats s WHERE s.account_id = a.account_id)\nORDER BY a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Nimbus Metrics",
    title: "Monthly billing review",
    scenario:
      "Finance reviews the half: monthly issue volume, then the month that broke the pattern.",
    steps: [
      { prompt: "Sum invoice amounts per month. Output ym (strftime '%Y-%m') and issued_cents, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issued_date) AS ym,\n  SUM(amount_cents) AS issued_cents\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Compute each month's delta vs the previous with LAG. Output ym, issued_cents, mom_delta (NULL first), ordered by ym ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', issued_date) AS ym, SUM(amount_cents) AS issued_cents\n  FROM invoices GROUP BY ym)\nSELECT ym, issued_cents,\n  issued_cents - LAG(issued_cents) OVER (ORDER BY ym) AS mom_delta\nFROM monthly\nORDER BY ym ASC;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Dunning rollup",
    scenario:
      "Billing ops sizes the failure problem per account, then the money it lost.",
    steps: [
      { prompt: "Count failed invoices per account. Output account_id, failed_count, ordered by failed_count descending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS failed_count\nFROM invoices\nWHERE status = 'failed'\nGROUP BY account_id\nORDER BY failed_count DESC, account_id ASC;`, order: "exact" },
      { prompt: "Sum failed invoice amounts per account. Output account_id, lost_cents, ordered by lost_cents descending, then account_id ascending.", code: `SELECT account_id, SUM(amount_cents) AS lost_cents\nFROM invoices\nWHERE status = 'failed'\nGROUP BY account_id\nORDER BY lost_cents DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Drift audit",
    scenario:
      "Revenue integrity runs the join-back: invoice amounts vs the subscription active at issue.",
    steps: [
      { prompt: "Return invoices whose amount differs from the active subscription's mrr: invoice_id, account_id, issued_date, amount_cents, mrr_cents, ordered by invoice_id ascending. Active means start_date <= issued_date AND (end_date IS NULL OR end_date > issued_date).", code: `SELECT i.invoice_id, i.account_id, i.issued_date,\n  i.amount_cents, s.mrr_cents\nFROM invoices i\nJOIN subscriptions s\n  ON s.account_id = i.account_id\n AND s.start_date <= i.issued_date\n AND (s.end_date IS NULL OR s.end_date > i.issued_date)\nWHERE i.amount_cents <> s.mrr_cents\nORDER BY i.invoice_id ASC;`, order: "exact" },
      { prompt: "Count total drift money: SUM(amount - mrr) over those mismatched rows. One column: drift_total.", code: `SELECT SUM(i.amount_cents - s.mrr_cents) AS drift_total\nFROM invoices i\nJOIN subscriptions s\n  ON s.account_id = i.account_id\n AND s.start_date <= i.issued_date\n AND (s.end_date IS NULL OR s.end_date > i.issued_date)\nWHERE i.amount_cents <> s.mrr_cents;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Daily billing rhythm",
    scenario:
      "The billing ops review walks the daily ledger and flags the quiet days.",
    steps: [
      { prompt: "Sum invoice amounts per issued_date. Output issued_date, day_total, invoice_count, ordered by issued_date ascending.", code: `SELECT issued_date, SUM(amount_cents) AS day_total,\n  COUNT(*) AS invoice_count\nFROM invoices\nGROUP BY issued_date\nORDER BY issued_date ASC;`, order: "exact" },
      { prompt: "List days with exactly one invoice: issued_date, day_total, ordered by issued_date ascending.", code: `SELECT issued_date, SUM(amount_cents) AS day_total\nFROM invoices\nGROUP BY issued_date\nHAVING COUNT(*) = 1\nORDER BY issued_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Datadog",
    title: "Event cadence",
    scenario:
      "Product analytics compares the per-account activity shape against the event vocabulary.",
    steps: [
      { prompt: "Count events per account, keeping accounts with none. Output account_id, event_count, ordered by account_id ascending.", code: `SELECT a.account_id, COUNT(e.event_id) AS event_count\nFROM accounts a\nLEFT JOIN events e ON e.account_id = a.account_id\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Count events per day. Output d (strftime '%Y-%m-%d') and event_count, ordered by d ascending.", code: `SELECT strftime('%Y-%m-%d', event_ts, 'unixepoch') AS d,\n  COUNT(*) AS event_count\nFROM events\nGROUP BY d\nORDER BY d ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Regional books",
    scenario:
      "The GTM review wants regional MRR both raw and normalized by account count.",
    steps: [
      { prompt: "Sum current MRR per region. Output region, region_mrr, ordered by region_mrr descending.", code: `SELECT a.region, SUM(s.mrr_cents) AS region_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.region\nORDER BY region_mrr DESC;`, order: "exact" },
      { prompt: "Compute average current MRR per account within each region. Output region, avg_mrr (region_mrr * 1.0 / live account count, rounded to 1 decimal), ordered by avg_mrr descending. Use COUNT(DISTINCT a.account_id) for the divisor.", code: `SELECT a.region,\n  ROUND(SUM(s.mrr_cents) * 1.0 / COUNT(DISTINCT a.account_id), 1) AS avg_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.region\nORDER BY avg_mrr DESC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Collected vs issued",
    scenario:
      "Collections wants the monthly gap between what was billed and what landed.",
    steps: [
      { prompt: "Output per month: ym, issued_cents (all invoices), collected_cents (status 'paid'), ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issued_date) AS ym,\n  SUM(amount_cents) AS issued_cents,\n  SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS collected_cents\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Output the overall collection rate as a percentage with one decimal: rate_pct = paid total * 100.0 / issued total. One row.", code: `SELECT ROUND(\n  100.0 * SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)\n  / SUM(amount_cents), 1) AS rate_pct\nFROM invoices;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Ticket load per account",
    scenario:
      "CS ops reviews which books are quiet and which carry work.",
    steps: [
      { prompt: "Count tickets per account, keeping ticketless accounts. Output account_id, name, ticket_count, ordered by account_id ascending.", code: `SELECT a.account_id, a.name, COUNT(t.ticket_id) AS ticket_count\nFROM accounts a\nLEFT JOIN tickets t ON t.account_id = a.account_id\nGROUP BY a.account_id, a.name\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "List accounts with exactly two tickets: account_id, name, ticket_count, ordered by account_id ascending.", code: `SELECT a.account_id, a.name, COUNT(*) AS ticket_count\nFROM accounts a\nJOIN tickets t ON t.account_id = a.account_id\nGROUP BY a.account_id, a.name\nHAVING COUNT(*) = 2\nORDER BY a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "HubSpot",
    title: "New logos",
    scenario:
      "Growth wants the 2026 first-time signings with their opening MRR.",
    steps: [
      { prompt: "List each account's first subscription: account_id, first_start (MIN start_date), mrr_cents, ordered by first_start ascending. Use MIN so SQLite fills mrr from the min-start row.", code: `SELECT account_id, MIN(start_date) AS first_start, mrr_cents\nFROM subscriptions\nGROUP BY account_id\nORDER BY first_start ASC;`, order: "exact" },
      { prompt: "Keep only 2026 starters: account_id, first_start, mrr_cents, ordered by first_start ascending.", code: `SELECT account_id, MIN(start_date) AS first_start, mrr_cents\nFROM subscriptions\nGROUP BY account_id\nHAVING MIN(start_date) >= '2026-01-01'\nORDER BY first_start ASC;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Datadog",
    title: "Movement ledger",
    scenario:
      "The subscription historian classifies every plan row: what opened, what grew, what shrank, what came back.",
    steps: [
      { prompt: "Classify each subscription with LAG: kind = 'new' (no predecessor), 'expansion' (mrr rose), 'contraction' (mrr fell), 'flat-restart' (unchanged). Output sub_id, account_id, start_date, kind, ordered by start_date ascending, then sub_id ascending.", code: `WITH hist AS (\n  SELECT sub_id, account_id, mrr_cents, start_date,\n    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr\n  FROM subscriptions)\nSELECT sub_id, account_id, start_date,\n  CASE WHEN prev_mrr IS NULL THEN 'new'\n       WHEN mrr_cents > prev_mrr THEN 'expansion'\n       WHEN mrr_cents < prev_mrr THEN 'contraction'\n       ELSE 'flat-restart' END AS kind\nFROM hist\nORDER BY start_date ASC, sub_id ASC;`, order: "exact" },
      { prompt: "Count rows per kind. Output kind and move_count, ordered by move_count descending, then kind ascending.", code: `WITH hist AS (\n  SELECT sub_id, account_id, mrr_cents, start_date,\n    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr\n  FROM subscriptions)\nSELECT CASE WHEN prev_mrr IS NULL THEN 'new'\n       WHEN mrr_cents > prev_mrr THEN 'expansion'\n       WHEN mrr_cents < prev_mrr THEN 'contraction'\n       ELSE 'flat-restart' END AS kind,\n  COUNT(*) AS move_count\nFROM hist\nGROUP BY kind\nORDER BY move_count DESC, kind ASC;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Atlassian",
    title: "Owner books vs reality",
    scenario:
      "Sales ops compares each owner's book with and without the whale signature.",
    steps: [
      { prompt: "Sum current MRR per owner. Output owner, book_mrr, ordered by book_mrr descending.", code: `SELECT a.owner, SUM(s.mrr_cents) AS book_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.owner\nORDER BY book_mrr DESC;`, order: "exact" },
      { prompt: "Same rollup excluding account 10. Output owner, ex_whale_mrr, ordered by ex_whale_mrr descending.", code: `SELECT a.owner,\n  SUM(CASE WHEN s.account_id = 10 THEN 0 ELSE s.mrr_cents END) AS ex_whale_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.owner\nORDER BY ex_whale_mrr DESC;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Nimbus Metrics",
    title: "Silent seats",
    scenario:
      "Adoption audit: which seats never activated, and which accounts hold them?",
    steps: [
      { prompt: "List seats with last_active_date IS NULL: seat_id, account_id, joined_date, ordered by seat_id ascending.", code: `SELECT seat_id, account_id, joined_date\nFROM seats\nWHERE last_active_date IS NULL\nORDER BY seat_id ASC;`, order: "exact" },
      { prompt: "Join those seats to their account names and event counts in the window. Output s.seat_id, a.name, COUNT(e.event_id) AS event_count, ordered by s.seat_id ascending.", code: `SELECT s.seat_id, a.name, COUNT(e.event_id) AS event_count\nFROM seats s\nJOIN accounts a ON a.account_id = s.account_id\nLEFT JOIN events e ON e.seat_id = s.seat_id\nWHERE s.last_active_date IS NULL\nGROUP BY s.seat_id, a.name\nORDER BY s.seat_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Flowstack",
    title: "Plan census with money",
    scenario:
      "Pricing reviews both the live counts per plan and the money each plan tier carries.",
    steps: [
      { prompt: "Count current subscriptions per plan: plan, live_count, ordered by live_count descending, then plan ascending.", code: `SELECT plan, COUNT(*) AS live_count\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY plan\nORDER BY live_count DESC, plan ASC;`, order: "exact" },
      { prompt: "Sum current MRR per plan: plan, plan_mrr, ordered by plan_mrr descending.", code: `SELECT plan, SUM(mrr_cents) AS plan_mrr\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY plan\nORDER BY plan_mrr DESC;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Billing frequency",
    scenario:
      "Revenue integrity ranks accounts by how often they were billed — duplicates rise to the top.",
    steps: [
      { prompt: "Rank accounts by invoice count with RANK(). Output account_id, invoice_count, rnk, ordered by rnk ascending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS invoice_count,\n  RANK() OVER (ORDER BY COUNT(*) DESC) AS rnk\nFROM invoices\nGROUP BY account_id\nORDER BY rnk ASC, account_id ASC;`, order: "exact" },
      { prompt: "List accounts billed more than 6 times: account_id, invoice_count, ordered by invoice_count descending, then account_id ascending.", code: `SELECT account_id, COUNT(*) AS invoice_count\nFROM invoices\nGROUP BY account_id\nHAVING COUNT(*) > 6\nORDER BY invoice_count DESC, account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Monthly collections",
    scenario:
      "Finance tracks which months lost money to dunning and which collected everything.",
    steps: [
      { prompt: "Per month, output ym, failed_cents (failed amounts), ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issued_date) AS ym,\n  SUM(CASE WHEN status = 'failed' THEN amount_cents ELSE 0 END) AS failed_cents\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Per month, output ym, pending_plus_refunded (pending + refunded amounts), ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issued_date) AS ym,\n  SUM(CASE WHEN status IN ('pending', 'refunded') THEN amount_cents ELSE 0 END) AS pending_plus_refunded\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Datadog",
    title: "Seat activation funnel",
    scenario:
      "Onboarding reviews the seat lifecycle: joined, activated, and the accounts where activation never happened.",
    steps: [
      { prompt: "Count seats with a NULL last_active_date. One column: never_activated.", code: `SELECT COUNT(*) AS never_activated\nFROM seats\nWHERE last_active_date IS NULL;`, order: "exact" },
      { prompt: "Count seats per activation month (strftime '%Y-%m' of joined_date), including the never-activated as their join month. Output ym and joined_seats, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', joined_date) AS ym, COUNT(*) AS joined_seats\nFROM seats\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Invite burst forensics",
    scenario:
      "Growth security reviews seat 3's four-invite burst. Prove the velocity signature end to end.",
    steps: [
      { prompt: "Self-join invite events to later invites within 300 seconds. Output a_event_id, b_event_id, gap_s, ordered by gap_s ascending, then a_event_id ascending.", code: `SELECT a.event_id AS a_event_id, b.event_id AS b_event_id,\n  b.event_ts - a.event_ts AS gap_s\nFROM events a\nJOIN events b ON a.seat_id = b.seat_id AND a.event_id < b.event_id\nWHERE a.event_type = 'invite' AND b.event_type = 'invite'\n  AND b.event_ts - a.event_ts <= 300\nORDER BY gap_s ASC, a_event_id ASC;`, order: "exact" },
      { prompt: "Find the first event of the invited seat that followed the burst: output event_id, seat_id, event_type and the seconds between it and the LAST invite (event_id 27). One row: the seat-13 login. Hint: gap = event_ts - (SELECT MAX(event_ts) FROM events WHERE event_type = 'invite').", code: `SELECT e.event_id, e.seat_id, e.event_type,\n  e.event_ts - (SELECT MAX(event_ts) FROM events WHERE event_type = 'invite') AS gap_s\nFROM events e\nWHERE e.seat_id = 13\nORDER BY e.event_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Atlassian",
    title: "Clock-trap sweep",
    scenario:
      "Reliability engineering sweeps every seat timeline for gaps that cross thresholds — and expects exactly two.",
    steps: [
      { prompt: "List consecutive same-seat gaps above 1800s but within a day (<= 20000s). Output seat_id, gap_s, ordered by gap_s ascending.", code: `WITH seq AS (\n  SELECT seat_id, event_ts,\n    event_ts - LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS gap_s\n  FROM events)\nSELECT seat_id, gap_s\nFROM seq\nWHERE gap_s > 1800 AND gap_s <= 20000\nORDER BY gap_s ASC;`, order: "exact" },
      { prompt: "Count total sessions across all seats at the 1800s cutoff. One column: total_sessions.", code: `WITH seq AS (\n  SELECT seat_id, event_id, event_ts,\n    LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS prev_ts\n  FROM events),\nstamps AS (\n  SELECT seat_id, event_id,\n    CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_sess\n  FROM seq),\nmarked AS (\n  SELECT *,\n    SUM(new_sess) OVER (PARTITION BY seat_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS sess\n  FROM stamps)\nSELECT COUNT(*) AS total_sessions\nFROM (SELECT seat_id, sess FROM marked GROUP BY seat_id, sess);`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Flowstack",
    title: "Session ledger",
    scenario:
      "The engagement review wants sessions per seat, then the busiest seat's session count as the anchor number.",
    steps: [
      { prompt: "Sessionize per seat (1800s cutoff) and output seat_id, session_count, ordered by seat_id ascending.", code: `WITH seq AS (\n  SELECT seat_id, event_id, event_ts,\n    LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) AS prev_ts\n  FROM events),\nstamps AS (\n  SELECT seat_id, event_id,\n    CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_sess\n  FROM seq),\nmarked AS (\n  SELECT *,\n    SUM(new_sess) OVER (PARTITION BY seat_id ORDER BY event_id ROWS UNBOUNDED PRECEDING) AS sess\n  FROM stamps)\nSELECT seat_id, COUNT(DISTINCT sess) AS session_count\nFROM marked\nGROUP BY seat_id\nORDER BY seat_id ASC;`, order: "exact" },
      { prompt: "Count events for the seat with the most sessions (seat 1). One column: seat1_events.", code: `SELECT COUNT(*) AS seat1_events\nFROM events\nWHERE seat_id = 1;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Salesforce",
    title: "MRR waterfall memo",
    scenario:
      "The board memo needs the MRR movement waterfall: every month-kind bucket with its priced delta.",
    steps: [
      { prompt: "Classify each subscription (LAG) and price it as mrr - COALESCE(prev_mrr, 0). Group by month and kind. Output ym, kind, delta_cents, ordered by ym ascending, then kind ascending.", code: `WITH hist AS (\n  SELECT sub_id, account_id, mrr_cents, start_date,\n    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr\n  FROM subscriptions),\nmoves AS (\n  SELECT strftime('%Y-%m', start_date) AS ym,\n    CASE WHEN prev_mrr IS NULL THEN 'new'\n         WHEN mrr_cents > prev_mrr THEN 'expansion'\n         WHEN mrr_cents < prev_mrr THEN 'contraction'\n         ELSE 'flat-restart' END AS kind,\n    mrr_cents - COALESCE(prev_mrr, 0) AS delta_cents\n  FROM hist)\nSELECT ym, kind, SUM(delta_cents) AS delta_cents\nFROM moves\nGROUP BY ym, kind\nORDER BY ym ASC, kind ASC;`, order: "exact" },
      { prompt: "Sum the waterfall across all months: output new_total, expansion_total, contraction_total, flat_total in one row (each = SUM of that kind's deltas).", code: `WITH hist AS (\n  SELECT sub_id, account_id, mrr_cents, start_date,\n    LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) AS prev_mrr\n  FROM subscriptions),\nmoves AS (\n  SELECT CASE WHEN prev_mrr IS NULL THEN 'new'\n         WHEN mrr_cents > prev_mrr THEN 'expansion'\n         WHEN mrr_cents < prev_mrr THEN 'contraction'\n         ELSE 'flat-restart' END AS kind,\n    mrr_cents - COALESCE(prev_mrr, 0) AS delta_cents\n  FROM hist)\nSELECT\n  SUM(CASE WHEN kind = 'new' THEN delta_cents ELSE 0 END) AS new_total,\n  SUM(CASE WHEN kind = 'expansion' THEN delta_cents ELSE 0 END) AS expansion_total,\n  SUM(CASE WHEN kind = 'contraction' THEN delta_cents ELSE 0 END) AS contraction_total,\n  SUM(CASE WHEN kind = 'flat-restart' THEN delta_cents ELSE 0 END) AS flat_total\nFROM moves;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "HubSpot",
    title: "The churn correction",
    scenario:
      "The CFO's deck quotes churn from the end-dated rows. Build both numbers and let the memo pick.",
    steps: [
      { prompt: "Output naive_churn (SUM mrr over end-dated rows) and true_churn (only rows with no successor starting on or after the end_date) in one row.", code: `WITH naive AS (\n  SELECT SUM(mrr_cents) AS v FROM subscriptions WHERE end_date IS NOT NULL),\ntruthy AS (\n  SELECT SUM(mrr_cents) AS v FROM subscriptions s\n  WHERE s.end_date IS NOT NULL\n    AND NOT EXISTS (\n      SELECT 1 FROM subscriptions n\n      WHERE n.account_id = s.account_id AND n.start_date >= s.end_date))\nSELECT (SELECT v FROM naive) AS naive_churn,\n  (SELECT v FROM truthy) AS true_churn;`, order: "exact" },
      { prompt: "List the accounts behind the end-dated rows with their row mrr and whether a successor exists: s.account_id, s.mrr_cents, CASE WHEN successor exists THEN 1 ELSE 0 END AS rejoined_or_moved, ordered by s.account_id, s.end_date ascending. Successor means another sub of the same account with start_date >= s.end_date.", code: `SELECT s.account_id, s.mrr_cents,\n  CASE WHEN EXISTS (\n    SELECT 1 FROM subscriptions n\n    WHERE n.account_id = s.account_id AND n.start_date >= s.end_date)\n    THEN 1 ELSE 0 END AS rejoined_or_moved\nFROM subscriptions s\nWHERE s.end_date IS NOT NULL\nORDER BY s.account_id ASC, s.end_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Datadog",
    title: "Top billing days, ties kept",
    scenario:
      "The ops review publishes the top six daily issue totals — and the 104100 tie must not lose a day.",
    steps: [
      { prompt: "DENSE_RANK daily issued totals and keep dense ranks 1-6. Output day_total, d_rank, n_days, ordered by d_rank ascending.", code: `WITH daily AS (\n  SELECT issued_date, SUM(amount_cents) AS day_total\n  FROM invoices GROUP BY issued_date),\nranked AS (\n  SELECT day_total, DENSE_RANK() OVER (ORDER BY day_total DESC) AS d_rank\n  FROM daily)\nSELECT day_total, d_rank, COUNT(*) AS n_days\nFROM ranked\nWHERE d_rank <= 6\nGROUP BY day_total, d_rank\nORDER BY d_rank ASC;`, order: "exact" },
      { prompt: "List the dates sharing the 104100 total: issued_date, ordered ascending. Use a HAVING or subquery against the daily totals.", code: `SELECT issued_date\nFROM invoices\nGROUP BY issued_date\nHAVING SUM(amount_cents) = 104100\nORDER BY issued_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Tie registry",
    scenario:
      "The pricing team wants the MRR tie registry as strings — every tier with its member list.",
    steps: [
      { prompt: "Output mrr_cents, member_count, members (GROUP_CONCAT of account_id over current subs, ids ascending), ordered by mrr_cents descending.", code: `SELECT mrr_cents, COUNT(*) AS member_count,\n  GROUP_CONCAT(account_id) AS members\nFROM (\n  SELECT account_id, mrr_cents\n  FROM subscriptions\n  WHERE end_date IS NULL\n  ORDER BY account_id ASC)\nGROUP BY mrr_cents\nORDER BY mrr_cents DESC;`, order: "exact" },
      { prompt: "Do the same over ALL subscription rows (history included): mrr_cents, member_count, members, ordered by mrr_cents descending. Watch the 9900 and 4900 memberships grow.", code: `SELECT mrr_cents, COUNT(*) AS member_count,\n  GROUP_CONCAT(account_id) AS members\nFROM (\n  SELECT account_id, mrr_cents\n  FROM subscriptions\n  ORDER BY account_id ASC)\nGROUP BY mrr_cents\nORDER BY mrr_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Flowstack",
    title: "The whale distortion",
    scenario:
      "The GTM memo exposes how one signature bends two leaderboards at once.",
    steps: [
      { prompt: "Per region output region_mrr and ex_whale_mrr (excluding account 10), ordered by region_mrr descending.", code: `SELECT a.region,\n  SUM(s.mrr_cents) AS region_mrr,\n  SUM(CASE WHEN s.account_id = 10 THEN 0 ELSE s.mrr_cents END) AS ex_whale_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.region\nORDER BY region_mrr DESC;`, order: "exact" },
      { prompt: "Per owner output book_mrr and ex_whale_mrr, ordered by book_mrr descending. The crowned owner must change between the two columns.", code: `SELECT a.owner,\n  SUM(s.mrr_cents) AS book_mrr,\n  SUM(CASE WHEN s.account_id = 10 THEN 0 ELSE s.mrr_cents END) AS ex_whale_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.owner\nORDER BY book_mrr DESC;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Usage lens",
    scenario:
      "Customer success builds the usage lens: every account, its event frequency, its last seen day, its current MRR.",
    steps: [
      { prompt: "Output account_id, event_count, last_event_day (UTC date of MAX event_ts), mrr_cents (COALESCE to 0), ordered by account_id ascending. LEFT JOIN both events and the current subscription.", code: `SELECT a.account_id,\n  COUNT(e.event_id) AS event_count,\n  strftime('%Y-%m-%d', MAX(e.event_ts), 'unixepoch') AS last_event_day,\n  COALESCE(s.mrr_cents, 0) AS mrr_cents\nFROM accounts a\nLEFT JOIN events e ON e.account_id = a.account_id\nLEFT JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nGROUP BY a.account_id\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "List the zero-event accounts that still pay: account_id, name, mrr_cents, ordered by account_id ascending.", code: `SELECT a.account_id, a.name, s.mrr_cents\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nWHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.account_id = a.account_id)\nORDER BY a.account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Atlassian",
    title: "Churn-risk dossier",
    scenario:
      "CS leadership wants the paying-but-dark accounts with their distress evidence in one query.",
    steps: [
      { prompt: "Flag accounts with a current subscription, zero events, and at least one failed invoice or one high open ticket. Output account_id, name, mrr_cents, failed_count, open_high_count, ordered by account_id ascending.", code: `SELECT a.account_id, a.name, s.mrr_cents,\n  (SELECT COUNT(*) FROM invoices i WHERE i.account_id = a.account_id AND i.status = 'failed') AS failed_count,\n  (SELECT COUNT(*) FROM tickets t WHERE t.account_id = a.account_id AND t.priority = 'high' AND t.status = 'open') AS open_high_count\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nWHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.account_id = a.account_id)\n  AND (\n    EXISTS (SELECT 1 FROM invoices i WHERE i.account_id = a.account_id AND i.status = 'failed')\n    OR EXISTS (SELECT 1 FROM tickets t WHERE t.account_id = a.account_id AND t.priority = 'high' AND t.status = 'open')\n  )\nORDER BY a.account_id ASC;`, order: "exact" },
      { prompt: "Price the at-risk money: SUM of mrr over the flagged accounts. One column: at_risk_mrr.", code: `SELECT SUM(s.mrr_cents) AS at_risk_mrr\nFROM accounts a\nJOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL\nWHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.account_id = a.account_id)\n  AND (\n    EXISTS (SELECT 1 FROM invoices i WHERE i.account_id = a.account_id AND i.status = 'failed')\n    OR EXISTS (SELECT 1 FROM tickets t WHERE t.account_id = a.account_id AND t.priority = 'high' AND t.status = 'open')\n  );`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "Collection gap ledger",
    scenario:
      "Collections prices each account's issued-vs-collected hole, then verifies the total against the book.",
    steps: [
      { prompt: "Output account_id, gap_cents (issued minus paid), ordered by gap_cents descending, then account_id ascending.", code: `SELECT account_id,\n  SUM(amount_cents)\n    - SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS gap_cents\nFROM invoices\nGROUP BY account_id\nORDER BY gap_cents DESC, account_id ASC;`, order: "exact" },
      { prompt: "Output the book-level gap in one row: total_gap (SUM over all accounts), using only invoices.", code: `SELECT SUM(amount_cents)\n  - SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) AS total_gap\nFROM invoices;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Running billing curve",
    scenario:
      "The half-year curve: daily issue totals and their running cumulative, ending at the full volume.",
    steps: [
      { prompt: "Output issued_date, day_total, running_total (cumulative SUM ordered by day), ordered by issued_date ascending.", code: `WITH daily AS (\n  SELECT issued_date, SUM(amount_cents) AS day_total\n  FROM invoices GROUP BY issued_date)\nSELECT issued_date, day_total,\n  SUM(day_total) OVER (ORDER BY issued_date ROWS UNBOUNDED PRECEDING) AS running_total\nFROM daily\nORDER BY issued_date ASC;`, order: "exact" },
      { prompt: "Output the final cumulative only: last_running (MAX over the running totals). One row. Rebuild the curve in a subquery.", code: `SELECT MAX(running_total) AS last_running\nFROM (\n  SELECT SUM(day_total) OVER (ORDER BY issued_date ROWS UNBOUNDED PRECEDING) AS running_total\n  FROM (\n    SELECT issued_date, SUM(amount_cents) AS day_total\n    FROM invoices GROUP BY issued_date));`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Datadog",
    title: "New-logo calendar",
    scenario:
      "The growth review refuses to hide empty months: new-logo MRR for every month of H1, zeros included.",
    steps: [
      { prompt: "Build a months CTE for 2026-01..06, LEFT JOIN first-time subscriptions, output ym, new_logo_mrr (COALESCE to 0), ordered by ym ascending.", code: `WITH months(ym) AS (\n  VALUES ('2026-01'),('2026-02'),('2026-03'),('2026-04'),('2026-05'),('2026-06')),\nfirsts AS (\n  SELECT account_id, MIN(start_date) AS first_start\n  FROM subscriptions GROUP BY account_id)\nSELECT m.ym, COALESCE(SUM(s.mrr_cents), 0) AS new_logo_mrr\nFROM months m\nLEFT JOIN firsts f\n  ON f.first_start >= m.ym || '-01'\n AND f.first_start < date(m.ym || '-01', '+1 month')\nLEFT JOIN subscriptions s ON s.account_id = f.account_id AND s.start_date = f.first_start\nGROUP BY m.ym\nORDER BY m.ym ASC;`, order: "exact" },
      { prompt: "Count the zero months. One column: zero_months. Rebuild the same calendar and filter to rows where new_logo_mrr = 0.", code: `SELECT COUNT(*) AS zero_months\nFROM (\n  WITH months(ym) AS (\n    VALUES ('2026-01'),('2026-02'),('2026-03'),('2026-04'),('2026-05'),('2026-06')),\n  firsts AS (\n    SELECT account_id, MIN(start_date) AS first_start\n    FROM subscriptions GROUP BY account_id)\n  SELECT m.ym, COALESCE(SUM(s.mrr_cents), 0) AS new_logo_mrr\n  FROM months m\n  LEFT JOIN firsts f\n    ON f.first_start >= m.ym || '-01'\n   AND f.first_start < date(m.ym || '-01', '+1 month')\n  LEFT JOIN subscriptions s ON s.account_id = f.account_id AND s.start_date = f.first_start\n  GROUP BY m.ym)\nWHERE new_logo_mrr = 0;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Flowstack",
    title: "The resurrection timeline",
    scenario:
      "Account 2's story: billed Jan-Mar, silent April, back May at a promo. Build the month census with the hole kept.",
    steps: [
      { prompt: "Count account 2's invoices per month across 2026-01..06, KEEPING the empty month. Output ym, invoice_count, ordered by ym ascending.", code: `WITH months(ym) AS (\n  VALUES ('2026-01'),('2026-02'),('2026-03'),('2026-04'),('2026-05'),('2026-06'))\nSELECT m.ym, COUNT(i.invoice_id) AS invoice_count\nFROM months m\nLEFT JOIN invoices i\n  ON i.account_id = 2 AND strftime('%Y-%m', i.issued_date) = m.ym\nGROUP BY m.ym\nORDER BY m.ym ASC;`, order: "exact" },
      { prompt: "Output account 2's subscriptions and its May-June promo drift in one row: old_end (its end-dated row's end_date), rejoin_start (the current row's start_date), promo_may (the 2026-05-01 invoice amount). One row.", code: `SELECT\n  (SELECT end_date FROM subscriptions WHERE account_id = 2 AND end_date IS NOT NULL) AS old_end,\n  (SELECT start_date FROM subscriptions WHERE account_id = 2 AND end_date IS NULL) AS rejoin_start,\n  (SELECT amount_cents FROM invoices WHERE account_id = 2 AND issued_date = '2026-05-01') AS promo_may;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Proration economics",
    scenario:
      "Billing engineering documents account 6's mid-April switch: two rates in, one blend out.",
    steps: [
      { prompt: "Output old_mrr, new_mrr, billed (the 2026-04-15 invoice) in one row for account 6.", code: `SELECT old_s.mrr_cents AS old_mrr,\n  new_s.mrr_cents AS new_mrr,\n  i.amount_cents AS billed\nFROM subscriptions old_s\nJOIN subscriptions new_s ON new_s.account_id = old_s.account_id AND new_s.start_date = old_s.end_date\nJOIN invoices i ON i.account_id = old_s.account_id AND i.issued_date = old_s.end_date\nWHERE old_s.account_id = 6 AND old_s.end_date = '2026-04-15';`, order: "exact" },
      { prompt: "Verify the blend sits between the rates: output CASE 'between' WHEN billed > new_mrr AND billed < old_mrr ELSE 'outside' END AS verdict, plus the drift billed - new_mrr. One row. Join like step 1.", code: `SELECT CASE WHEN i.amount_cents > new_s.mrr_cents AND i.amount_cents < old_s.mrr_cents\n    THEN 'between' ELSE 'outside' END AS verdict,\n  i.amount_cents - new_s.mrr_cents AS drift\nFROM subscriptions old_s\nJOIN subscriptions new_s ON new_s.account_id = old_s.account_id AND new_s.start_date = old_s.end_date\nJOIN invoices i ON i.account_id = old_s.account_id AND i.issued_date = old_s.end_date\nWHERE old_s.account_id = 6 AND old_s.end_date = '2026-04-15';`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "HubSpot",
    title: "MRR bands",
    scenario:
      "The pricing review bands the live book against the 100000 line and counts each band.",
    steps: [
      { prompt: "Band current subscriptions: 'at-or-above' (>= 100000), 'mid' (10000-99999), 'under' (< 10000). Output band, sub_count, ordered by band ascending.", code: `SELECT CASE\n    WHEN mrr_cents >= 100000 THEN 'at-or-above'\n    WHEN mrr_cents >= 10000 THEN 'mid'\n    ELSE 'under' END AS band,\n  COUNT(*) AS sub_count\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY band\nORDER BY band ASC;`, order: "exact" },
      { prompt: "Sum current MRR per band using the same CASE. Output band, band_mrr, ordered by band_mrr descending.", code: `SELECT CASE\n    WHEN mrr_cents >= 100000 THEN 'at-or-above'\n    WHEN mrr_cents >= 10000 THEN 'mid'\n    ELSE 'under' END AS band,\n  SUM(mrr_cents) AS band_mrr\nFROM subscriptions\nWHERE end_date IS NULL\nGROUP BY band\nORDER BY band_mrr DESC;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Atlassian",
    title: "Power seats",
    scenario:
      "Adoption reads the heavy users: seven-or-more events in four days is the power bar.",
    steps: [
      { prompt: "List seats with >= 7 events: seat_id, account_id, event_count, ordered by event_count descending, then seat_id ascending.", code: `SELECT seat_id, account_id, COUNT(*) AS event_count\nFROM events\nGROUP BY seat_id, account_id\nHAVING COUNT(*) >= 7\nORDER BY event_count DESC, seat_id ASC;`, order: "exact" },
      { prompt: "Join those seats to account names: e-derived seat_id, a.name, event_count, ordered by event_count descending, then seat_id ascending.", code: `SELECT x.seat_id, a.name, x.event_count\nFROM (\n  SELECT seat_id, account_id, COUNT(*) AS event_count\n  FROM events\n  GROUP BY seat_id, account_id\n  HAVING COUNT(*) >= 7) x\nJOIN accounts a ON a.account_id = x.account_id\nORDER BY x.event_count DESC, x.seat_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Nimbus Metrics",
    title: "The mirror test",
    scenario:
      "Revenue integrity suspects twin books. Prove accounts 5 and 7 bill identically — then break the tie with dates.",
    steps: [
      { prompt: "Output each account's (amount, status) multiset summary: account_id, amount_cents, status, n, filtered to accounts 5 and 7, ordered by account_id, amount_cents, status ascending.", code: `SELECT account_id, amount_cents, status, COUNT(*) AS n\nFROM invoices\nWHERE account_id IN (5, 7)\nGROUP BY account_id, amount_cents, status\nORDER BY account_id ASC, amount_cents ASC, status ASC;`, order: "exact" },
      { prompt: "Break the mirror with lifetime totals and first bill dates: account_id, lifetime (SUM amounts), first_bill (MIN issued_date), filtered to accounts 5 and 7, ordered by account_id ascending.", code: `SELECT account_id, SUM(amount_cents) AS lifetime,\n  MIN(issued_date) AS first_bill\nFROM invoices\nWHERE account_id IN (5, 7)\nGROUP BY account_id\nORDER BY account_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Flowstack",
    title: "Dormant payer file",
    scenario:
      "The save-play meeting opens with Mosslight Labs: what it pays, what it failed, what CS is holding.",
    steps: [
      { prompt: "Output A11's current mrr_cents, its failed-invoice count, and its open high-ticket count in one row: current_mrr, failed_count, open_high_count.", code: `SELECT\n  (SELECT mrr_cents FROM subscriptions WHERE account_id = 11 AND end_date IS NULL) AS current_mrr,\n  (SELECT COUNT(*) FROM invoices WHERE account_id = 11 AND status = 'failed') AS failed_count,\n  (SELECT COUNT(*) FROM tickets WHERE account_id = 11 AND priority = 'high' AND status = 'open') AS open_high_count;`, order: "exact" },
      { prompt: "Output A11's full invoice trail: invoice_id, issued_date, amount_cents, status, ordered by invoice_id ascending.", code: `SELECT invoice_id, issued_date, amount_cents, status\nFROM invoices\nWHERE account_id = 11\nORDER BY invoice_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "HubSpot",
    title: "The whale dossier",
    scenario:
      "The closing memo: account 10's whole world on one line — plan, bill, seat, usage, support.",
    steps: [
      { prompt: "Output mrr_cents (current), lifetime_billed (invoice sum), seat_count, event_count, high_open_tickets for account 10. One row, five columns.", code: `SELECT\n  (SELECT mrr_cents FROM subscriptions WHERE account_id = 10 AND end_date IS NULL) AS mrr_cents,\n  (SELECT SUM(amount_cents) FROM invoices WHERE account_id = 10) AS lifetime_billed,\n  (SELECT COUNT(*) FROM seats WHERE account_id = 10) AS seat_count,\n  (SELECT COUNT(*) FROM events WHERE account_id = 10) AS event_count,\n  (SELECT COUNT(*) FROM tickets WHERE account_id = 10 AND priority = 'high') AS high_open_tickets;`, order: "exact" },
      { prompt: "Prove the whale IS June's delta: output june_issued (June's invoice total) and may_issued (May's), then june_minus_may. One row, three columns.", code: `SELECT\n  SUM(CASE WHEN strftime('%Y-%m', issued_date) = '2026-06' THEN amount_cents ELSE 0 END) AS june_issued,\n  SUM(CASE WHEN strftime('%Y-%m', issued_date) = '2026-05' THEN amount_cents ELSE 0 END) AS may_issued,\n  SUM(CASE WHEN strftime('%Y-%m', issued_date) = '2026-06' THEN amount_cents ELSE 0 END)\n    - SUM(CASE WHEN strftime('%Y-%m', issued_date) = '2026-05' THEN amount_cents ELSE 0 END) AS june_minus_may\nFROM invoices;`, order: "exact" },
    ],
  },
];
