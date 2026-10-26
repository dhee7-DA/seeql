// Domain Mastery — Marketing & Attribution · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r15-mkt-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_MKT_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "Google",
    title: "Book health check",
    scenario:
      "Monday growth standup opens with the conversion book: how much of it landed, and how do the open rows split?",
    steps: [
      { prompt: "Count confirmed conversions. One column: confirmed_count.", code: `SELECT COUNT(*) AS confirmed_count\nFROM conversions\nWHERE status = 'confirmed';`, order: "exact" },
      { prompt: "Count conversions per status. Output status and conversion_count, ordered by conversion_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS conversion_count\nFROM conversions\nGROUP BY status\nORDER BY conversion_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Meta",
    title: "Pipeline triage",
    scenario:
      "The payments queue needs triage: what never charged, and what charged twice.",
    steps: [
      { prompt: "List pending conversions: conversion_id, conv_type, conv_date, ordered by conversion_id ascending.", code: `SELECT conversion_id, conv_type, conv_date\nFROM conversions\nWHERE status = 'pending'\nORDER BY conversion_id ASC;`, order: "exact" },
      { prompt: "Count duplicate conversions. One column: duplicate_count.", code: `SELECT COUNT(*) AS duplicate_count\nFROM conversions\nWHERE status = 'duplicate';`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Creative inventory",
    scenario:
      "The creative review starts with what exists — and what it never served.",
    steps: [
      { prompt: "List the ads: ad_id, campaign_id, format, headline, ordered by ad_id ascending.", code: `SELECT ad_id, campaign_id, format, headline\nFROM ads\nORDER BY ad_id ASC;`, order: "exact" },
      { prompt: "Count ads per format. Output format and ad_count, ordered by ad_count descending, then format ascending.", code: `SELECT format, COUNT(*) AS ad_count\nFROM ads\nGROUP BY format\nORDER BY ad_count DESC, format ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Salesforce",
    title: "The money that left",
    scenario:
      "Finance wants the two clawed-back buckets separated: what was refunded and what was cancelled outright.",
    steps: [
      { prompt: "List refunded conversions: conversion_id, conv_date, revenue_cents, ordered by conversion_id ascending.", code: `SELECT conversion_id, conv_date, revenue_cents\nFROM conversions\nWHERE status = 'refunded'\nORDER BY conversion_id ASC;`, order: "exact" },
      { prompt: "List cancelled conversions: conversion_id, conv_type, conv_date, revenue_cents, ordered by conversion_id ascending.", code: `SELECT conversion_id, conv_type, conv_date, revenue_cents\nFROM conversions\nWHERE status = 'cancelled'\nORDER BY conversion_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Channel map",
    scenario:
      "The agency kickoff wants the buy side mapped before anyone touches performance.",
    steps: [
      { prompt: "List campaigns: campaign_id, name, channel, daily_budget_cents, status, ordered by campaign_id ascending.", code: `SELECT campaign_id, name, channel, daily_budget_cents, status\nFROM campaigns\nORDER BY campaign_id ASC;`, order: "exact" },
      { prompt: "Count campaigns per channel. Output channel and campaign_count, ordered by campaign_count descending, then channel ascending.", code: `SELECT channel, COUNT(*) AS campaign_count\nFROM campaigns\nGROUP BY channel\nORDER BY campaign_count DESC, channel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "Traffic mix",
    scenario:
      "Where do the 72 sessions come from — and how much of it is untagged organic?",
    steps: [
      { prompt: "Count sessions per utm_source. Output utm_source and session_count, ordered by session_count descending, then utm_source ascending.", code: `SELECT utm_source, COUNT(*) AS session_count\nFROM sessions\nGROUP BY utm_source\nORDER BY session_count DESC, utm_source ASC;`, order: "exact" },
      { prompt: "Among direct sessions, compute the average duration rounded to 0 dp. One column: organic_avg_duration.", code: `SELECT ROUND(AVG(duration_seconds), 0) AS organic_avg_duration\nFROM sessions\nWHERE utm_source = 'direct';`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "Google",
    title: "Meter check",
    scenario:
      "Before any CTR talk, sanity-check the meter: how much did it log, and where did clicks land.",
    steps: [
      { prompt: "One row: total impressions and total clicks. Output impressions, clicks.", code: `SELECT COUNT(*) AS impressions, SUM(clicked) AS clicks\nFROM impressions;`, order: "exact" },
      { prompt: "Clicks per campaign. Output campaign_id and clicks, ordered by campaign_id ascending. Campaigns without impressions stay absent.", code: `SELECT campaign_id, SUM(clicked) AS clicks\nFROM impressions\nGROUP BY campaign_id\nORDER BY campaign_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Meta",
    title: "Refund intake",
    scenario:
      "The disputes inbox gets its weekly census: what's decided, what's pending, why it happens.",
    steps: [
      { prompt: "Count refunds per status. Output status and refund_count, ordered by refund_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS refund_count\nFROM refunds\nGROUP BY status\nORDER BY refund_count DESC, status ASC;`, order: "exact" },
      { prompt: "Count refunds per reason. Output reason and refund_count, ordered by refund_count descending, then reason ascending.", code: `SELECT reason, COUNT(*) AS refund_count\nFROM refunds\nGROUP BY reason\nORDER BY refund_count DESC, reason ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "HubSpot",
    title: "The April ledger",
    scenario:
      "April is the whale month — walk the ledger and total it.",
    steps: [
      { prompt: "List April 2026 conversions: conversion_id, conv_type, status, revenue_cents, ordered by conversion_id ascending.", code: `SELECT conversion_id, conv_type, status, revenue_cents\nFROM conversions\nWHERE conv_date BETWEEN '2026-04-01' AND '2026-04-30'\nORDER BY conversion_id ASC;`, order: "exact" },
      { prompt: "Sum April's CONFIRMED revenue. One column: april_confirmed_cents.", code: `SELECT SUM(revenue_cents) AS april_confirmed_cents\nFROM conversions\nWHERE status = 'confirmed' AND conv_date BETWEEN '2026-04-01' AND '2026-04-30';`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Session clocks",
    scenario:
      "Engagement review: the podium of long sessions and the book's average.",
    steps: [
      { prompt: "Top three sessions by duration: session_id, utm_source, duration_seconds, ordered by duration descending.", code: `SELECT session_id, utm_source, duration_seconds\nFROM sessions\nORDER BY duration_seconds DESC\nLIMIT 3;`, order: "exact" },
      { prompt: "Average session duration rounded to 0 dp. One column: avg_duration.", code: `SELECT ROUND(AVG(duration_seconds), 0) AS avg_duration\nFROM sessions;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Dormant audit",
    scenario:
      "Prove the dormant teaser is truly dormant — every surface at once.",
    steps: [
      { prompt: "Output campaign 11's row: campaign_id, name, channel, status.", code: `SELECT campaign_id, name, channel, status\nFROM campaigns\nWHERE campaign_id = 11;`, order: "exact" },
      { prompt: "One row, three counts for campaign 11: impressions served, spend rows, touchpoints. Output impressions, spend_rows, touchpoints.", code: `SELECT (SELECT COUNT(*) FROM impressions WHERE campaign_id = 11) AS impressions,\n       (SELECT COUNT(*) FROM spend WHERE campaign_id = 11) AS spend_rows,\n       (SELECT COUNT(*) FROM touchpoints WHERE campaign_id = 11) AS touchpoints;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "Budget book",
    scenario:
      "Planning wants the daily budgets ranked before the overspend audit.",
    steps: [
      { prompt: "List campaigns with budgets above 3000 cents: campaign_id, name, daily_budget_cents, ordered by budget descending, then campaign_id ascending.", code: `SELECT campaign_id, name, daily_budget_cents\nFROM campaigns\nWHERE daily_budget_cents > 3000\nORDER BY daily_budget_cents DESC, campaign_id ASC;`, order: "exact" },
      { prompt: "The largest daily budget: campaign_id and daily_budget_cents. One row.", code: `SELECT campaign_id, daily_budget_cents\nFROM campaigns\nORDER BY daily_budget_cents DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "Google",
    title: "Window opens",
    scenario:
      "The pixel window splits the book in two — count both sides.",
    steps: [
      { prompt: "Count conversions on or after 2026-05-04. One column: window_conversions.", code: `SELECT COUNT(*) AS window_conversions\nFROM conversions\nWHERE conv_date >= '2026-05-04';`, order: "exact" },
      { prompt: "Count conversions before 2026-05-04. One column: pre_window_conversions.", code: `SELECT COUNT(*) AS pre_window_conversions\nFROM conversions\nWHERE conv_date < '2026-05-04';`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Meta",
    title: "Two device boards",
    scenario:
      "The meter and the site see devices differently — compare the boards.",
    steps: [
      { prompt: "Count impressions per device. Output device and impression_count, ordered by impression_count descending, then device ascending.", code: `SELECT device, COUNT(*) AS impression_count\nFROM impressions\nGROUP BY device\nORDER BY impression_count DESC, device ASC;`, order: "exact" },
      { prompt: "Count sessions per device. Output device and session_count, ordered by session_count descending, then device ascending.", code: `SELECT device, COUNT(*) AS session_count\nFROM sessions\nGROUP BY device\nORDER BY session_count DESC, device ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Bills in trouble",
    scenario:
      "The billing review pulls the two non-paid buckets of the spend ledger.",
    steps: [
      { prompt: "List disputed spend: spend_id, campaign_id, spend_date, media_cents, ordered by spend_id ascending.", code: `SELECT spend_id, campaign_id, spend_date, media_cents\nFROM spend\nWHERE status = 'disputed'\nORDER BY spend_id ASC;`, order: "exact" },
      { prompt: "List pending spend: spend_id, campaign_id, media_cents, ordered by spend_id ascending.", code: `SELECT spend_id, campaign_id, media_cents\nFROM spend\nWHERE status = 'pending'\nORDER BY spend_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Whale day",
    scenario:
      "One day in April dwarfs the rest — show it and its neighborhood.",
    steps: [
      { prompt: "List conversions on 2026-04-20: conversion_id, conv_type, revenue_cents, session_id.", code: `SELECT conversion_id, conv_type, revenue_cents, session_id\nFROM conversions\nWHERE conv_date = '2026-04-20';`, order: "exact" },
      { prompt: "Top five days by confirmed revenue: conv_date and day_revenue_cents, ordered by total descending, then date ascending.", code: `SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\nFROM conversions\nWHERE status = 'confirmed'\nGROUP BY conv_date\nORDER BY day_revenue_cents DESC, conv_date ASC\nLIMIT 5;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Email footprint",
    scenario:
      "Email owns no impression inventory — show what it does own.",
    steps: [
      { prompt: "List email campaigns: campaign_id, name, objective, launch_date, ordered by campaign_id ascending.", code: `SELECT campaign_id, name, objective, launch_date\nFROM campaigns\nWHERE channel = 'email'\nORDER BY campaign_id ASC;`, order: "exact" },
      { prompt: "Count sessions tagged to email campaigns (utm campaign belongs to channel email). One column: email_sessions.", code: `SELECT COUNT(*) AS email_sessions\nFROM sessions s\nJOIN campaigns c ON c.campaign_id = s.utm_campaign_id\nWHERE c.channel = 'email';`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "The twins' bank",
    scenario:
      "Two campaigns quietly banked the same total — pull both books side by side.",
    steps: [
      { prompt: "List campaign 3's confirmed conversions: conversion_id, conv_date, revenue_cents, ordered by revenue descending.", code: `SELECT conversion_id, conv_date, revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE cv.status = 'confirmed' AND s.utm_campaign_id = 3\nORDER BY revenue_cents DESC;`, order: "exact" },
      { prompt: "The same for campaign 6: conversion_id, conv_date, revenue_cents, ordered by revenue descending.", code: `SELECT conversion_id, conv_date, revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE cv.status = 'confirmed' AND s.utm_campaign_id = 6\nORDER BY revenue_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "Google",
    title: "Path primer",
    scenario:
      "Introduce the path table: what a touch is, and who appears in paths.",
    steps: [
      { prompt: "Count touchpoints per touch_type. Output touch_type and touch_count, ordered by touch_count descending.", code: `SELECT touch_type, COUNT(*) AS touch_count\nFROM touchpoints\nGROUP BY touch_type\nORDER BY touch_count DESC;`, order: "exact" },
      { prompt: "Count DISTINCT campaigns appearing in touchpoints. One column: campaigns_in_paths.", code: `SELECT COUNT(DISTINCT campaign_id) AS campaigns_in_paths\nFROM touchpoints;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "Meta",
    title: "Clawback starters",
    scenario:
      "The disputes deep-dive starts with the big tickets.",
    steps: [
      { prompt: "List refunds of 12000 cents or more: refund_id, conversion_id, reason, amount_cents, status, ordered by amount descending, then refund_id ascending.", code: `SELECT refund_id, conversion_id, reason, amount_cents, status\nFROM refunds\nWHERE amount_cents >= 12000\nORDER BY amount_cents DESC, refund_id ASC;`, order: "exact" },
      { prompt: "Count refunds in total. One column: refund_count.", code: `SELECT COUNT(*) AS refund_count\nFROM refunds;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "Google",
    title: "The board and the flip",
    scenario:
      "The channel review shows search on top — until someone removes one conversion.",
    steps: [
      { prompt: "Last-click channel board: channel and confirmed revenue, ordered by total descending.", code: `SELECT ca.channel, SUM(cv.revenue_cents) AS channel_revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nJOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\nWHERE cv.status = 'confirmed'\nGROUP BY ca.channel\nORDER BY channel_revenue_cents DESC;`, order: "exact" },
      { prompt: "The same board excluding conversion 10 (the whale). Channel and revenue, ordered by total descending — watch the flip.", code: `SELECT ca.channel, SUM(cv.revenue_cents) AS channel_revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nJOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\nWHERE cv.status = 'confirmed' AND cv.conversion_id <> 10\nGROUP BY ca.channel\nORDER BY channel_revenue_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Rank the campaigns",
    scenario:
      "The campaign board needs honest ranks — including what happens at ties.",
    steps: [
      { prompt: "Per campaign (cookie-credited, confirmed): campaign_id and revenue, ordered by revenue descending, then campaign_id ascending.", code: `SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL\nGROUP BY s.utm_campaign_id\nORDER BY revenue_cents DESC, campaign_id ASC;`, order: "exact" },
      { prompt: "Add RANK() and DENSE_RANK() over the same board. Output campaign_id, revenue, rk, dense_rk, ordered by revenue descending, then campaign_id ascending.", code: `WITH rev AS (\n  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents\n  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL\n  GROUP BY s.utm_campaign_id\n)\nSELECT campaign_id, revenue_cents,\n       RANK() OVER (ORDER BY revenue_cents DESC) AS rk,\n       DENSE_RANK() OVER (ORDER BY revenue_cents DESC) AS dense_rk\nFROM rev\nORDER BY revenue_cents DESC, campaign_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "HubSpot",
    title: "The money ladder",
    scenario:
      "Three definitions of 'revenue' walk into a board meeting. Only the query survives.",
    steps: [
      { prompt: "One row: charged_cents (all revenue > 0), refund_cents, net_cents = charged - refunds.", code: `SELECT (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0) AS charged_cents,\n       (SELECT SUM(amount_cents) FROM refunds) AS refund_cents,\n       (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0)\n         - (SELECT SUM(amount_cents) FROM refunds) AS net_cents;`, order: "exact" },
      { prompt: "One row splitting the charged book: confirmed_cents vs refunded_cents (revenue on refunded-status rows). Output confirmed_cents, refunded_cents.", code: `SELECT SUM(CASE WHEN status = 'confirmed' THEN revenue_cents END) AS confirmed_cents,\n       SUM(CASE WHEN status = 'refunded' THEN revenue_cents END) AS refunded_cents\nFROM conversions\nWHERE revenue_cents > 0;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "Overspend audit",
    scenario:
      "Delivery systems overshoot budgets. Find every overshoot — and the day that landed exactly on the line.",
    steps: [
      { prompt: "Spend days strictly over budget: spend_id, campaign_id, media_cents, daily_budget_cents, ordered by spend_id ascending.", code: `SELECT s.spend_id, s.campaign_id, s.media_cents, c.daily_budget_cents\nFROM spend s\nJOIN campaigns c ON c.campaign_id = s.campaign_id\nWHERE s.media_cents > c.daily_budget_cents\nORDER BY s.spend_id ASC;`, order: "exact" },
      { prompt: "One row: at_or_over (media >= budget) vs strictly_over (media > budget). Output at_or_over, strictly_over.", code: `SELECT SUM(s.media_cents >= c.daily_budget_cents) AS at_or_over,\n       SUM(s.media_cents > c.daily_budget_cents) AS strictly_over\nFROM spend s\nJOIN campaigns c ON c.campaign_id = s.campaign_id;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Funnelworks",
    title: "Fee drift",
    scenario:
      "Someone negotiated 8% platform fees on three days. The ledger still says 10% everywhere else.",
    steps: [
      { prompt: "List rows where platform_fee_cents <> ROUND(media_cents * 0.10): spend_id, campaign_id, media_cents, platform_fee_cents, status, ordered by spend_id ascending.", code: `SELECT spend_id, campaign_id, media_cents, platform_fee_cents, status\nFROM spend\nWHERE platform_fee_cents <> CAST(ROUND(media_cents * 0.10) AS INTEGER)\nORDER BY spend_id ASC;`, order: "exact" },
      { prompt: "One row: fees_expected (SUM of ROUND(media*0.10) over all rows) vs fees_actual (SUM of platform_fee_cents). Output fees_expected, fees_actual.", code: `SELECT SUM(CAST(ROUND(media_cents * 0.10) AS INTEGER)) AS fees_expected,\n       SUM(platform_fee_cents) AS fees_actual\nFROM spend;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Google",
    title: "Mismatch hunt",
    scenario:
      "The cookie says one thing; the path says another. Find every disagreement.",
    steps: [
      { prompt: "Conversions whose single last-touch campaign differs from the cookie campaign: conversion_id, cookie_campaign_id, last_touch_campaign_id, ordered by conversion_id ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlast_touch AS (\n  SELECT m.conversion_id, t.campaign_id,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n)\nSELECT lt.conversion_id, s.utm_campaign_id AS cookie_campaign_id,\n       lt.campaign_id AS last_touch_campaign_id\nFROM last_touch lt\nJOIN conversions cv ON cv.conversion_id = lt.conversion_id\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE lt.n = 1 AND lt.campaign_id <> s.utm_campaign_id\nORDER BY lt.conversion_id ASC;`, order: "exact" },
      { prompt: "The dossier with channels: conversion_id, cookie_channel, closer_channel, closer_type, ordered by conversion_id ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlast_touch AS (\n  SELECT m.conversion_id, t.campaign_id, t.touch_type,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n)\nSELECT lt.conversion_id,\n       cookie_ca.channel AS cookie_channel,\n       closer_ca.channel AS closer_channel,\n       lt.touch_type AS closer_type\nFROM last_touch lt\nJOIN conversions cv ON cv.conversion_id = lt.conversion_id\nJOIN sessions s ON s.session_id = cv.session_id\nJOIN campaigns cookie_ca ON cookie_ca.campaign_id = s.utm_campaign_id\nJOIN campaigns closer_ca ON closer_ca.campaign_id = lt.campaign_id\nWHERE lt.n = 1 AND lt.campaign_id <> s.utm_campaign_id\nORDER BY lt.conversion_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Meta",
    title: "Burst forensics",
    scenario:
      "Four conversions, one session, twelve minutes. Reconstruct the stuffing burst.",
    steps: [
      { prompt: "List session 51's conversions: conversion_id, status, strftime('%H:%M', conv_ts, 'unixepoch') as fired_at, ordered by conv_ts ascending.", code: `SELECT conversion_id, status,\n       strftime('%H:%M', conv_ts, 'unixepoch') AS fired_at\nFROM conversions\nWHERE session_id = 51\nORDER BY conv_ts ASC;`, order: "exact" },
      { prompt: "Same-session pairs within 300 seconds anywhere in the book: a_id, b_id, session_id, gap_seconds, ordered by gap ascending, then a_id ascending.", code: `SELECT a.conversion_id AS a_id, b.conversion_id AS b_id,\n       a.session_id, b.conv_ts - a.conv_ts AS gap_seconds\nFROM conversions a\nJOIN conversions b\n  ON b.session_id = a.session_id AND b.conv_ts > a.conv_ts\nWHERE b.conv_ts - a.conv_ts <= 300\nORDER BY gap_seconds ASC, a_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "HubSpot",
    title: "The window wall",
    scenario:
      "The 7-day attribution window has a boundary case nobody planned for.",
    steps: [
      { prompt: "One row over all path-bearing conversions: eligible_inclusive (span <= 604800), eligible_strict (span < 604800), on_line_conversion_id.", code: `SELECT COUNT(*) FILTER (WHERE span <= 604800) AS eligible_inclusive,\n       COUNT(*) FILTER (WHERE span < 604800) AS eligible_strict,\n       COALESCE(MAX(CASE WHEN span = 604800 THEN conversion_id END), 0) AS on_line_conversion_id\nFROM (\n  SELECT c.conversion_id, c.conv_ts - MIN(t.touched_at) AS span\n  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id\n  GROUP BY c.conversion_id\n);`, order: "exact" },
      { prompt: "Top three spans: conversion_id and span_seconds, ordered by span descending, then conversion_id ascending.", code: `SELECT c.conversion_id, c.conv_ts - MIN(t.touched_at) AS span_seconds\nFROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id\nGROUP BY c.conversion_id\nORDER BY span_seconds DESC, c.conversion_id ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Tie-day registry",
    scenario:
      "The daily revenue ledger is full of equal days. Name every tie group.",
    steps: [
      { prompt: "Top ten days by confirmed revenue: conv_date, day_revenue_cents, ordered by total descending, then date ascending.", code: `SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\nFROM conversions\nWHERE status = 'confirmed'\nGROUP BY conv_date\nORDER BY day_revenue_cents DESC, conv_date ASC\nLIMIT 10;`, order: "exact" },
      { prompt: "The tie registry: for each daily total shared by 2+ days — day_revenue_cents, tie_size, tie_dates (GROUP_CONCAT ascending), ordered by tie_size descending, then total ascending.", code: `WITH daily AS (\n  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\n  FROM conversions WHERE status = 'confirmed'\n  GROUP BY conv_date\n),\ntied AS (\n  SELECT day_revenue_cents FROM daily GROUP BY day_revenue_cents HAVING COUNT(*) > 1\n)\nSELECT t.day_revenue_cents,\n       (SELECT COUNT(*) FROM daily WHERE day_revenue_cents = t.day_revenue_cents) AS tie_size,\n       (SELECT GROUP_CONCAT(conv_date, ',') FROM (\n          SELECT conv_date FROM daily WHERE day_revenue_cents = t.day_revenue_cents\n          ORDER BY conv_date)) AS tie_dates\nFROM tied t\nORDER BY tie_size DESC, t.day_revenue_cents ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "Retention gap",
    scenario:
      "Before 2026-05-04 the pixel kept nothing. Show exactly what was lost.",
    steps: [
      { prompt: "Count pre-window conversions that carry a campaign cookie. One column: cookie_only_conversions.", code: `SELECT COUNT(*) AS cookie_only_conversions\nFROM conversions c\nJOIN sessions s ON s.session_id = c.session_id\nWHERE c.conv_date < '2026-05-04' AND s.utm_campaign_id IS NOT NULL;`, order: "exact" },
      { prompt: "List them: conversion_id, conv_date, cookie_campaign_id, ordered by conv_date ascending, then conversion_id ascending.", code: `SELECT c.conversion_id, c.conv_date, s.utm_campaign_id AS cookie_campaign_id\nFROM conversions c\nJOIN sessions s ON s.session_id = c.session_id\nWHERE c.conv_date < '2026-05-04' AND s.utm_campaign_id IS NOT NULL\nORDER BY c.conv_date ASC, c.conversion_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Google",
    title: "ROAS board",
    scenario:
      "Efficiency review: rank the buyers, then blend the book.",
    steps: [
      { prompt: "Per campaign with media and cookie-confirmed revenue: campaign_id, media_cents, roas (2 dp), ordered by roas descending.", code: `SELECT ca.campaign_id, sp.media_cents,\n       ROUND(1.0 * cv.revenue_cents / sp.media_cents, 2) AS roas\nFROM (\n  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents\n  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL\n  GROUP BY s.utm_campaign_id\n) cv\nJOIN (\n  SELECT campaign_id, SUM(media_cents) AS media_cents\n  FROM spend GROUP BY campaign_id\n) sp ON sp.campaign_id = cv.campaign_id\nJOIN campaigns ca ON ca.campaign_id = cv.campaign_id\nORDER BY roas DESC;`, order: "exact" },
      { prompt: "Blended ROAS to 4 dp: total confirmed cookie-credited revenue over total media. One column: blended_roas.", code: `SELECT ROUND(\n  1.0 * (SELECT SUM(cv.revenue_cents) FROM conversions cv\n          JOIN sessions s ON s.session_id = cv.session_id\n          WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL)\n       / (SELECT SUM(media_cents) FROM spend), 4) AS blended_roas;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Meta",
    title: "Path census",
    scenario:
      "What does a typical path look like in this book — and who touches most often?",
    steps: [
      { prompt: "Path-length census: for each path length n, the number of conversions. Output touches, conversions, ordered by touches ascending.", code: `SELECT COUNT(*) AS touches, COUNT(*) AS conversions\nFROM (SELECT conversion_id, COUNT(*) AS n FROM touchpoints GROUP BY conversion_id)\nGROUP BY n\nORDER BY n ASC;`, order: "exact" },
      { prompt: "Touchpoints per campaign: campaign_id and touch_count, ordered by touch_count descending, then campaign_id ascending.", code: `SELECT campaign_id, COUNT(*) AS touch_count\nFROM touchpoints\nGROUP BY campaign_id\nORDER BY touch_count DESC, campaign_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Email spine",
    scenario:
      "Email launched late — build the calendar spine and show the honest zeros.",
    steps: [
      { prompt: "Email confirmed revenue per month INCLUDING zero months (spine 2026-01..2026-06): ym, email_revenue_cents, ordered by ym ascending.", code: `WITH months(ym) AS (\n  VALUES ('2026-01'), ('2026-02'), ('2026-03'),\n         ('2026-04'), ('2026-05'), ('2026-06')\n)\nSELECT m.ym,\n       COALESCE(SUM(CASE WHEN ca.channel = 'email' THEN cv.revenue_cents END), 0) AS email_revenue_cents\nFROM months m\nLEFT JOIN conversions cv\n  ON strftime('%Y-%m', cv.conv_date) = m.ym AND cv.status = 'confirmed'\nLEFT JOIN sessions s ON s.session_id = cv.session_id\nLEFT JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\nGROUP BY m.ym\nORDER BY m.ym ASC;`, order: "exact" },
      { prompt: "Email's total confirmed revenue. One column: email_confirmed_cents.", code: `SELECT COALESCE(SUM(cv.revenue_cents), 0) AS email_confirmed_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nJOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\nWHERE cv.status = 'confirmed' AND ca.channel = 'email';`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Clawback ladder",
    scenario:
      "Stack the big refunds and read the exposure as it accumulates.",
    steps: [
      { prompt: "Refunds >= 12000 with a running total: refund_id, amount_cents, exposure_running_cents, ordered by amount descending, then refund_id ascending.", code: `SELECT refund_id, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY amount_cents DESC, refund_id ASC) AS exposure_running_cents\nFROM refunds\nWHERE amount_cents >= 12000\nORDER BY amount_cents DESC, refund_id ASC;`, order: "exact" },
      { prompt: "Total refund exposure across the whole book. One column: total_exposure_cents.", code: `SELECT SUM(amount_cents) AS total_exposure_cents\nFROM refunds;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "Device tie",
    scenario:
      "The device board ties at the top. Prove it — and build the registry.",
    steps: [
      { prompt: "Impressions per device: device, impression_count, ordered by count descending, then device ascending.", code: `SELECT device, COUNT(*) AS impression_count\nFROM impressions\nGROUP BY device\nORDER BY impression_count DESC, device ASC;`, order: "exact" },
      { prompt: "One row: the top count and the GROUP_CONCAT of devices sharing it (ascending). Output top_count, tied_devices.", code: `WITH dev AS (\n  SELECT device, COUNT(*) AS n FROM impressions GROUP BY device\n),\ntop_n AS (SELECT MAX(n) AS m FROM dev)\nSELECT top_n.m AS top_count,\n       (SELECT GROUP_CONCAT(device, ',') FROM (SELECT device FROM dev WHERE n = (SELECT m FROM top_n) ORDER BY device)) AS tied_devices\nFROM top_n;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Funnelworks",
    title: "Funnel ratios",
    scenario:
      "Conversions per session exposes the stuffing — compute the ratios.",
    steps: [
      { prompt: "Per tagged campaign: campaign_id, session_count, conversion_count, conv_per_session (2 dp), ordered by ratio descending, then campaign_id ascending.", code: `SELECT s.utm_campaign_id AS campaign_id,\n       COUNT(DISTINCT s.session_id) AS session_count,\n       COUNT(c.conversion_id) AS conversion_count,\n       ROUND(1.0 * COUNT(c.conversion_id) / COUNT(DISTINCT s.session_id), 2) AS conv_per_session\nFROM sessions s\nLEFT JOIN conversions c ON c.session_id = s.session_id\nWHERE s.utm_campaign_id IS NOT NULL\nGROUP BY s.utm_campaign_id\nORDER BY conv_per_session DESC, campaign_id ASC;`, order: "exact" },
      { prompt: "Campaign 5's ratio alone: session_count, conversion_count, conv_per_session. One row.", code: `SELECT COUNT(DISTINCT s.session_id) AS session_count,\n       COUNT(c.conversion_id) AS conversion_count,\n       ROUND(1.0 * COUNT(c.conversion_id) / COUNT(DISTINCT s.session_id), 2) AS conv_per_session\nFROM sessions s\nLEFT JOIN conversions c ON c.session_id = s.session_id\nWHERE s.utm_campaign_id = 5;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Google",
    title: "Sessionization wall",
    scenario:
      "Campaign 2's June 20 run has to be cut into sessions — and the cutoff decides the count.",
    steps: [
      { prompt: "One row over the run: events, gap_count, sessions_strict (gaps < 1800 join), sessions_inclusive (gaps <= 1800 join), gaps_on_line.", code: `WITH run AS (\n  SELECT imp_ts, imp_ts - LAG(imp_ts) OVER (ORDER BY imp_ts) AS gap\n  FROM impressions\n  WHERE campaign_id = 2 AND date(imp_ts, 'unixepoch') = '2026-06-20'\n)\nSELECT (SELECT COUNT(*) FROM run) AS events,\n       (SELECT COUNT(gap) FROM run) AS gap_count,\n       1 + (SELECT COUNT(*) FROM run WHERE gap < 1800) AS sessions_strict,\n       1 + (SELECT COUNT(*) FROM run WHERE gap <= 1800) AS sessions_inclusive,\n       (SELECT COUNT(*) FROM run WHERE gap = 1800) AS gaps_on_line;`, order: "exact" },
      { prompt: "The run's gaps in order: gap_seconds and whether it sits ON the 1800 line (1/0), ordered by the run's time order.", code: `SELECT imp_ts - LAG(imp_ts) OVER (ORDER BY imp_ts) AS gap_seconds,\n       CASE WHEN imp_ts - LAG(imp_ts) OVER (ORDER BY imp_ts) = 1800 THEN 1 ELSE 0 END AS on_line\nFROM impressions\nWHERE campaign_id = 2 AND date(imp_ts, 'unixepoch') = '2026-06-20';`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Meta",
    title: "Who closes",
    scenario:
      "Views or clicks — what actually ends a path in this book?",
    steps: [
      { prompt: "Among confirmed path conversions: closer_views vs closer_clicks (one row, two counts — the tie contributes both).", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n)\nSELECT SUM(t.touch_type = 'view') AS closer_views,\n       SUM(t.touch_type = 'click') AS closer_clicks\nFROM maxts m\nJOIN touchpoints t ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\nJOIN conversions cv ON cv.conversion_id = m.conversion_id\nWHERE cv.status = 'confirmed';`, order: "exact" },
      { prompt: "Closer rows per channel among confirmed paths: closer_channel and row_count, ordered by row_count descending, then channel ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n)\nSELECT ca.channel AS closer_channel, COUNT(*) AS row_count\nFROM maxts m\nJOIN touchpoints t ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\nJOIN conversions cv ON cv.conversion_id = m.conversion_id\nJOIN campaigns ca ON ca.campaign_id = t.campaign_id\nWHERE cv.status = 'confirmed'\nGROUP BY ca.channel\nORDER BY row_count DESC, closer_channel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Reasons ladder",
    scenario:
      "Why does the money come back? Rank the reasons by amount, then by share.",
    steps: [
      { prompt: "Per reason: reason, refund_count, reason_total_cents, ordered by total descending.", code: `SELECT reason, COUNT(*) AS refund_count,\n       SUM(amount_cents) AS reason_total_cents\nFROM refunds\nGROUP BY reason\nORDER BY reason_total_cents DESC;`, order: "exact" },
      { prompt: "Per reason: reason and share of total refunds (percent, 2 dp), ordered by share descending.", code: `SELECT reason,\n       ROUND(100.0 * SUM(amount_cents) / (SELECT SUM(amount_cents) FROM refunds), 2) AS share_pct\nFROM refunds\nGROUP BY reason\nORDER BY share_pct DESC;`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Kept revenue",
    scenario:
      "Charged, clawed, kept — per campaign, then the campaign-attributed total.",
    steps: [
      { prompt: "Per campaign: campaign_id, charged_cents, refunded_cents, net_cents, ordered by net descending, then campaign_id ascending.", code: `SELECT c.campaign_id,\n       COALESCE(SUM(cv.revenue_cents), 0) AS charged_cents,\n       COALESCE((SELECT SUM(r.amount_cents) FROM refunds r\n                  JOIN conversions rc ON rc.conversion_id = r.conversion_id\n                  JOIN sessions rs ON rs.session_id = rc.session_id\n                  WHERE rs.utm_campaign_id = c.campaign_id), 0) AS refunded_cents,\n       COALESCE(SUM(cv.revenue_cents), 0)\n         - COALESCE((SELECT SUM(r.amount_cents) FROM refunds r\n                      JOIN conversions rc ON rc.conversion_id = r.conversion_id\n                      JOIN sessions rs ON rs.session_id = rc.session_id\n                      WHERE rs.utm_campaign_id = c.campaign_id), 0) AS net_cents\nFROM campaigns c\nLEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id\nLEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.revenue_cents > 0\nGROUP BY c.campaign_id\nORDER BY net_cents DESC, c.campaign_id ASC;`, order: "exact" },
      { prompt: "Campaign-attributed net only (exclude organic-direct): total net across all campaigns. One column: campaign_net_cents.", code: `SELECT SUM(net.net_cents) AS campaign_net_cents\nFROM (\n  SELECT c.campaign_id,\n         COALESCE(SUM(cv.revenue_cents), 0)\n           - COALESCE((SELECT SUM(r.amount_cents) FROM refunds r\n                        JOIN conversions rc ON rc.conversion_id = r.conversion_id\n                        JOIN sessions rs ON rs.session_id = rc.session_id\n                        WHERE rs.utm_campaign_id = c.campaign_id), 0) AS net_cents\n  FROM campaigns c\n  LEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id\n  LEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.revenue_cents > 0\n  GROUP BY c.campaign_id\n) net;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "Google",
    title: "Three boards",
    scenario:
      "The attribution debate, settled with one query pair: what the cookie claims vs what the path splits vs what the path's final touch claims.",
    steps: [
      { prompt: "Per channel: last_click_cents (cookie, all confirmed) vs linear_cents (window confirmed paths, revenue split evenly), ordered by last_click_cents descending.", code: `WITH cookie AS (\n  SELECT ca.channel, SUM(cv.revenue_cents) AS cents\n  FROM conversions cv\n  JOIN sessions s ON s.session_id = cv.session_id\n  JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n  WHERE cv.status = 'confirmed'\n  GROUP BY ca.channel\n),\npath AS (\n  SELECT c.conversion_id, c.revenue_cents AS rev, COUNT(*) AS n\n  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id\n  WHERE c.status = 'confirmed'\n  GROUP BY c.conversion_id\n),\nlinear AS (\n  SELECT ca.channel, ROUND(SUM(1.0 * p.rev / p.n), 2) AS cents\n  FROM path p\n  JOIN touchpoints t ON t.conversion_id = p.conversion_id\n  JOIN campaigns ca ON ca.campaign_id = t.campaign_id\n  GROUP BY ca.channel\n)\nSELECT co.channel, co.cents AS last_click_cents, li.cents AS linear_cents\nFROM cookie co JOIN linear li ON li.channel = co.channel\nORDER BY last_click_cents DESC;`, order: "exact" },
      { prompt: "The last-touch board for window confirmed paths (tie revenue split across tied closers): channel and revenue, ordered by revenue descending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlt AS (\n  SELECT m.conversion_id, t.campaign_id,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n)\nSELECT ca.channel, ROUND(SUM(1.0 * cv.revenue_cents / lt.n), 2) AS revenue_cents\nFROM lt\nJOIN conversions cv ON cv.conversion_id = lt.conversion_id AND cv.status = 'confirmed'\nJOIN campaigns ca ON ca.campaign_id = lt.campaign_id\nGROUP BY ca.channel\nORDER BY revenue_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Meta",
    title: "The flip dossier",
    scenario:
      "One conversion moves a channel board. Quantify the flip at both cuts.",
    steps: [
      { prompt: "One row: total_confirmed_cents, whale_cents, whale_share_pct (2 dp), search_ex_whale_cents (conversion cut), social_cents.", code: `SELECT (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed') AS total_confirmed_cents,\n       (SELECT revenue_cents FROM conversions WHERE conversion_id = 10) AS whale_cents,\n       ROUND(100.0 * (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)\n             / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS whale_share_pct,\n       (SELECT COALESCE(SUM(cv.revenue_cents), 0)\n         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n         WHERE cv.status = 'confirmed' AND cv.conversion_id <> 10 AND ca.channel = 'search') AS search_ex_whale_cents,\n       (SELECT COALESCE(SUM(cv.revenue_cents), 0)\n         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n         WHERE cv.status = 'confirmed' AND ca.channel = 'social') AS social_cents;`, order: "exact" },
      { prompt: "The campaign cut: search's confirmed revenue excluding campaign 10 entirely, vs social's. One row: search_ex_campaign10_cents, social_cents.", code: `SELECT (SELECT COALESCE(SUM(cv.revenue_cents), 0)\n         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n         WHERE cv.status = 'confirmed' AND ca.channel = 'search' AND ca.campaign_id <> 10) AS search_ex_campaign10_cents,\n       (SELECT COALESCE(SUM(cv.revenue_cents), 0)\n         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n         WHERE cv.status = 'confirmed' AND ca.channel = 'social') AS social_cents;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "HubSpot",
    title: "The ambiguous closer",
    scenario:
      "One conversion ends with two touches at the same second. Show the tie and the whole path.",
    steps: [
      { prompt: "Conversions whose closer timestamp is shared by multiple touches: conversion_id, tied_campaigns (GROUP_CONCAT ascending), tied_at. One row expected.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\ntied AS (\n  SELECT t.conversion_id, m.mt AS tied_at, COUNT(*) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n  GROUP BY t.conversion_id, m.mt\n  HAVING COUNT(*) > 1\n)\nSELECT ti.conversion_id,\n       (SELECT GROUP_CONCAT(campaign_id, ',') FROM (\n          SELECT t.campaign_id FROM touchpoints t\n          JOIN maxts m2 ON m2.conversion_id = t.conversion_id\n          WHERE t.conversion_id = ti.conversion_id AND t.touched_at = m2.mt\n          ORDER BY t.campaign_id)) AS tied_campaigns,\n       ti.tied_at\nFROM tied ti\nORDER BY ti.conversion_id ASC;`, order: "exact" },
      { prompt: "Conversion 26's full path: touch_id, campaign_id, touch_type, touched_at, ordered by touched_at ascending, then touch_id ascending.", code: `SELECT touch_id, campaign_id, touch_type, touched_at\nFROM touchpoints\nWHERE conversion_id = 26\nORDER BY touched_at ASC, touch_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Salesforce",
    title: "The 3,6 registry",
    scenario:
      "Two campaigns, one total, two completely different shapes. Build the registry and show both books.",
    steps: [
      { prompt: "Campaign revenue totals shared by 2+ campaigns: revenue, tied_campaigns (GROUP_CONCAT ascending), tie_size. One row expected.", code: `WITH rev AS (\n  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents\n  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id\n  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL\n  GROUP BY s.utm_campaign_id\n),\ntied AS (\n  SELECT revenue_cents FROM rev GROUP BY revenue_cents HAVING COUNT(*) > 1\n)\nSELECT t.revenue_cents,\n       (SELECT GROUP_CONCAT(campaign_id, ',') FROM (\n          SELECT campaign_id FROM rev WHERE revenue_cents = t.revenue_cents\n          ORDER BY campaign_id)) AS tied_campaigns,\n       (SELECT COUNT(*) FROM rev WHERE revenue_cents = t.revenue_cents) AS tie_size\nFROM tied t\nORDER BY t.revenue_cents DESC;`, order: "exact" },
      { prompt: "Both twins' confirmed books: campaign_id, conversion_id, revenue_cents, ordered by campaign_id ascending, then revenue descending.", code: `SELECT s.utm_campaign_id AS campaign_id, cv.conversion_id, cv.revenue_cents\nFROM conversions cv\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE cv.status = 'confirmed' AND s.utm_campaign_id IN (3, 6)\nORDER BY campaign_id ASC, cv.revenue_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "Window matrix",
    scenario:
      "The 7-day window: who's in, who's out, and who sits exactly on the line.",
    steps: [
      { prompt: "One row: eligible_inclusive, eligible_strict, on_line_conversion_id over all path spans.", code: `SELECT COUNT(*) FILTER (WHERE span <= 604800) AS eligible_inclusive,\n       COUNT(*) FILTER (WHERE span < 604800) AS eligible_strict,\n       COALESCE(MAX(CASE WHEN span = 604800 THEN conversion_id END), 0) AS on_line_conversion_id\nFROM (\n  SELECT c.conversion_id, c.conv_ts - MIN(t.touched_at) AS span\n  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id\n  GROUP BY c.conversion_id\n);`, order: "exact" },
      { prompt: "The three longest spans: conversion_id, span_seconds, ordered by span descending, then conversion_id ascending.", code: `SELECT c.conversion_id, c.conv_ts - MIN(t.touched_at) AS span_seconds\nFROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id\nGROUP BY c.conversion_id\nORDER BY span_seconds DESC, c.conversion_id ASC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Stuffing dossier",
    scenario:
      "The velocity wall, session-scoped: the burst's timeline and its own pair count.",
    steps: [
      { prompt: "Session 51's conversions with second-precision times: conversion_id, status, strftime('%H:%M:%S', conv_ts, 'unixepoch') AS fired_at, ordered by conv_ts ascending.", code: `SELECT conversion_id, status,\n       strftime('%H:%M:%S', conv_ts, 'unixepoch') AS fired_at\nFROM conversions\nWHERE session_id = 51\nORDER BY conv_ts ASC;`, order: "exact" },
      { prompt: "Within session 51 only: same-session pairs within 300 seconds — a_id, b_id, gap_seconds, ordered by gap ascending.", code: `SELECT a.conversion_id AS a_id, b.conversion_id AS b_id,\n       b.conv_ts - a.conv_ts AS gap_seconds\nFROM conversions a\nJOIN conversions b\n  ON b.session_id = a.session_id AND b.conv_ts > a.conv_ts\nWHERE a.session_id = 51 AND b.conv_ts - a.conv_ts <= 300\nORDER BY gap_seconds ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Google",
    title: "All models disagree",
    scenario:
      "The deepest mismatch: cookie, first touch and last touch name three different campaigns.",
    steps: [
      { prompt: "Conversions where cookie, first-touch and single last-touch are ALL distinct: conversion_id, cookie_campaign_id, first_touch_campaign_id, last_touch_campaign_id, ordered by conversion_id ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlast_touch AS (\n  SELECT m.conversion_id, t.campaign_id,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n),\nfirst_touch AS (\n  SELECT conversion_id, campaign_id FROM touchpoints\n  WHERE touched_at = (SELECT MIN(touched_at) FROM touchpoints t2\n                       WHERE t2.conversion_id = touchpoints.conversion_id)\n)\nSELECT lt.conversion_id,\n       s.utm_campaign_id AS cookie_campaign_id,\n       ft.campaign_id AS first_touch_campaign_id,\n       lt.campaign_id AS last_touch_campaign_id\nFROM last_touch lt\nJOIN first_touch ft ON ft.conversion_id = lt.conversion_id\nJOIN conversions cv ON cv.conversion_id = lt.conversion_id\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE lt.n = 1\n  AND lt.campaign_id <> s.utm_campaign_id\n  AND ft.campaign_id <> s.utm_campaign_id\n  AND ft.campaign_id <> lt.campaign_id\nORDER BY lt.conversion_id ASC;`, order: "exact" },
      { prompt: "For those conversions: conversion_id and closer_type of the single last touch, ordered by conversion_id ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlast_touch AS (\n  SELECT m.conversion_id, t.touch_type,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n)\nSELECT lt.conversion_id, lt.touch_type AS closer_type\nFROM last_touch lt\nWHERE lt.n = 1\n  AND lt.conversion_id IN (21, 24, 39)\nORDER BY lt.conversion_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Meta",
    title: "Two clocks",
    scenario:
      "The two longest sessions tell opposite stories — quantify both, then rate the whale.",
    steps: [
      { prompt: "Sessions longer than 1500 seconds: session_id, utm_campaign_id, duration_seconds, conversion_count, converted_revenue_cents, ordered by duration descending.", code: `SELECT s.session_id, s.utm_campaign_id, s.duration_seconds,\n       COUNT(c.conversion_id) AS conversion_count,\n       COALESCE(SUM(c.revenue_cents), 0) AS converted_revenue_cents\nFROM sessions s\nLEFT JOIN conversions c ON c.session_id = s.session_id\nWHERE s.duration_seconds > 1500\nGROUP BY s.session_id, s.utm_campaign_id, s.duration_seconds\nORDER BY s.duration_seconds DESC;`, order: "exact" },
      { prompt: "The mega session's revenue rate: whale revenue divided by its 2700 seconds, rounded to 2 dp. One column: cents_per_second.", code: `SELECT ROUND(1.0 * 296000 / 2700, 2) AS cents_per_second;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Exposure waterfall",
    scenario:
      "Read the refund book as a waterfall: the big tickets first, then the whole pool.",
    steps: [
      { prompt: "Refunds >= 50000 with running exposure: refund_id, amount_cents, exposure_running_cents, ordered by amount descending, then refund_id ascending.", code: `SELECT refund_id, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY amount_cents DESC, refund_id ASC) AS exposure_running_cents\nFROM refunds\nWHERE amount_cents >= 50000\nORDER BY amount_cents DESC, refund_id ASC;`, order: "exact" },
      { prompt: "One row: refund_count, total_exposure_cents, and the largest single refund (the dispute line). Output refund_count, total_exposure_cents, max_refund_cents.", code: `SELECT COUNT(*) AS refund_count,\n       SUM(amount_cents) AS total_exposure_cents,\n       MAX(amount_cents) AS max_refund_cents\nFROM refunds;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Email forensics",
    scenario:
      "Email owns no inventory but banks real money. Size the channel and its share.",
    steps: [
      { prompt: "Email confirmed revenue per month with zeros (spine 2026-01..2026-06): ym, email_revenue_cents, ordered by ym ascending.", code: `WITH months(ym) AS (\n  VALUES ('2026-01'), ('2026-02'), ('2026-03'),\n         ('2026-04'), ('2026-05'), ('2026-06')\n)\nSELECT m.ym,\n       COALESCE(SUM(CASE WHEN ca.channel = 'email' THEN cv.revenue_cents END), 0) AS email_revenue_cents\nFROM months m\nLEFT JOIN conversions cv\n  ON strftime('%Y-%m', cv.conv_date) = m.ym AND cv.status = 'confirmed'\nLEFT JOIN sessions s ON s.session_id = cv.session_id\nLEFT JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\nGROUP BY m.ym\nORDER BY m.ym ASC;`, order: "exact" },
      { prompt: "Email's share of confirmed revenue, 2 dp. One column: email_share_pct.", code: `SELECT ROUND(100.0 * (SELECT COALESCE(SUM(cv.revenue_cents), 0)\n                       FROM conversions cv\n                       JOIN sessions s ON s.session_id = cv.session_id\n                       JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id\n                       WHERE cv.status = 'confirmed' AND ca.channel = 'email')\n                     / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS email_share_pct;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "Budget wall dossier",
    scenario:
      "Five days broke the budget; one more landed on it. Show both facts in one audit.",
    steps: [
      { prompt: "Overspend days: spend_id, campaign_id, spend_date, media_cents, daily_budget_cents, ordered by spend_id ascending.", code: `SELECT s.spend_id, s.campaign_id, s.spend_date,\n       s.media_cents, c.daily_budget_cents\nFROM spend s\nJOIN campaigns c ON c.campaign_id = s.campaign_id\nWHERE s.media_cents > c.daily_budget_cents\nORDER BY s.spend_id ASC;`, order: "exact" },
      { prompt: "The on-budget day: spend_id, campaign_id, spend_date, media_cents (media = budget). One row expected.", code: `SELECT s.spend_id, s.campaign_id, s.spend_date, s.media_cents\nFROM spend s\nJOIN campaigns c ON c.campaign_id = s.campaign_id\nWHERE s.media_cents = c.daily_budget_cents;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Creative ledger",
    scenario:
      "Production fees ride on five days. List them, then size them against the whole bill.",
    steps: [
      { prompt: "Creative-fee days: spend_id, campaign name, creative_cents, ordered by creative_cents descending.", code: `SELECT s.spend_id, c.name AS campaign_name, s.creative_cents\nFROM spend s\nJOIN campaigns c ON c.campaign_id = s.campaign_id\nWHERE s.creative_cents > 0\nORDER BY s.creative_cents DESC;`, order: "exact" },
      { prompt: "Creative fees' share of the grand bill (media + fees + creative), percent 2 dp. One column: creative_share_pct.", code: `SELECT ROUND(100.0 * (SELECT SUM(creative_cents) FROM spend)\n                     / (SELECT SUM(media_cents + platform_fee_cents + creative_cents) FROM spend), 2) AS creative_share_pct;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Google",
    title: "The cut lands mid-tie",
    scenario:
      "A LIMIT cut on the daily leaderboard slices a tie in half. Show the board, then show the wounded pair.",
    steps: [
      { prompt: "Top twelve days by confirmed revenue with RANK(): conv_date, day_revenue_cents, rk, ordered by total descending, then date ascending.", code: `WITH daily AS (\n  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\n  FROM conversions WHERE status = 'confirmed'\n  GROUP BY conv_date\n)\nSELECT conv_date, day_revenue_cents,\n       RANK() OVER (ORDER BY day_revenue_cents DESC, conv_date ASC) AS rk\nFROM daily\nORDER BY day_revenue_cents DESC, conv_date ASC\nLIMIT 12;`, order: "exact" },
      { prompt: "The 12000 pair: conv_date and day_revenue_cents for days tied at 12000, ordered by date ascending.", code: `WITH daily AS (\n  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\n  FROM conversions WHERE status = 'confirmed'\n  GROUP BY conv_date\n)\nSELECT conv_date, day_revenue_cents\nFROM daily\nWHERE day_revenue_cents = 12000\nORDER BY conv_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Meta",
    title: "Anatomy of a steal",
    scenario:
      "Conversion 21 is the cleanest mismatch in the book: social opened, email closed, the cookie never knew.",
    steps: [
      { prompt: "Conversion 21's full path: touch_id, campaign_id, touch_type, touched_at, ordered by touched_at ascending, then touch_id ascending.", code: `SELECT touch_id, campaign_id, touch_type, touched_at\nFROM touchpoints\nWHERE conversion_id = 21\nORDER BY touched_at ASC, touch_id ASC;`, order: "exact" },
      { prompt: "One row for conversion 21: cookie_channel, closer_channel, closer_type, revenue_cents.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints WHERE conversion_id = 21\n)\nSELECT cookie_ca.channel AS cookie_channel,\n       closer_ca.channel AS closer_channel,\n       t.touch_type AS closer_type,\n       cv.revenue_cents\nFROM maxts m\nJOIN touchpoints t ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\nJOIN conversions cv ON cv.conversion_id = m.conversion_id\nJOIN sessions s ON s.session_id = cv.session_id\nJOIN campaigns cookie_ca ON cookie_ca.campaign_id = s.utm_campaign_id\nJOIN campaigns closer_ca ON closer_ca.campaign_id = t.campaign_id;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Session forensics",
    scenario:
      "Beyond the burst: the long-session pair and the innocent double that fooled the pair-count.",
    steps: [
      { prompt: "Sessions longer than 1500 seconds: session_id, utm_campaign_id, duration_seconds, ordered by duration descending.", code: `SELECT session_id, utm_campaign_id, duration_seconds\nFROM sessions\nWHERE duration_seconds > 1500\nORDER BY duration_seconds DESC;`, order: "exact" },
      { prompt: "Session 55's conversions: conversion_id, status, conv_type, strftime('%H:%M', conv_ts, 'unixepoch') AS fired_at, ordered by conv_ts ascending.", code: `SELECT conversion_id, status, conv_type,\n       strftime('%H:%M', conv_ts, 'unixepoch') AS fired_at\nFROM conversions\nWHERE session_id = 55\nORDER BY conv_ts ASC;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Board with zeros",
    scenario:
      "An honest board includes the campaigns that banked nothing. Count them too.",
    steps: [
      { prompt: "Per campaign: campaign_id, confirmed_revenue_cents (0 when none — LEFT JOIN from campaigns), ordered by revenue descending, then campaign_id ascending.", code: `SELECT c.campaign_id,\n       COALESCE(SUM(cv.revenue_cents), 0) AS confirmed_revenue_cents\nFROM campaigns c\nLEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id\nLEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.status = 'confirmed'\nGROUP BY c.campaign_id\nORDER BY confirmed_revenue_cents DESC, c.campaign_id ASC;`, order: "exact" },
      { prompt: "Count campaigns whose confirmed revenue is exactly 0. One column: zero_revenue_campaigns.", code: `SELECT COUNT(*) AS zero_revenue_campaigns\nFROM campaigns c\nLEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id\nLEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.status = 'confirmed'\nGROUP BY c.campaign_id\nHAVING COALESCE(SUM(cv.revenue_cents), 0) = 0;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "Whale, end to end",
    scenario:
      "The whale dossier, then the clawback paperwork behind it.",
    steps: [
      { prompt: "One dossier row: whale_cents, whale_share_pct (2 dp), cookie_campaign_revenue_cents, path_touch_count, refunded_cents, net_after_refunds_cents.", code: `SELECT (SELECT revenue_cents FROM conversions WHERE conversion_id = 10) AS whale_cents,\n       ROUND(100.0 * (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)\n             / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS whale_share_pct,\n       (SELECT SUM(cv.revenue_cents) FROM conversions cv\n         JOIN sessions s ON s.session_id = cv.session_id\n        WHERE cv.status = 'confirmed' AND s.utm_campaign_id = 10) AS cookie_campaign_revenue_cents,\n       (SELECT COUNT(*) FROM touchpoints WHERE conversion_id = 10) AS path_touch_count,\n       (SELECT COALESCE(SUM(amount_cents), 0) FROM refunds WHERE conversion_id = 10) AS refunded_cents,\n       (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)\n         - (SELECT COALESCE(SUM(amount_cents), 0) FROM refunds WHERE conversion_id = 10) AS net_after_refunds_cents;`, order: "exact" },
      { prompt: "The whale's refund paperwork: refund_id, reason, amount_cents, status, ordered by refund_id ascending.", code: `SELECT refund_id, reason, amount_cents, status\nFROM refunds\nWHERE conversion_id = 10\nORDER BY refund_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Registry of registries",
    scenario:
      "The daily ledger's tie groups, ranked by size — then the biggest group's size alone.",
    steps: [
      { prompt: "Daily tie registry: day_revenue_cents, tie_size, tie_dates (GROUP_CONCAT ascending), ordered by tie_size descending, then total ascending.", code: `WITH daily AS (\n  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents\n  FROM conversions WHERE status = 'confirmed'\n  GROUP BY conv_date\n),\ntied AS (\n  SELECT day_revenue_cents FROM daily GROUP BY day_revenue_cents HAVING COUNT(*) > 1\n)\nSELECT t.day_revenue_cents,\n       (SELECT COUNT(*) FROM daily WHERE day_revenue_cents = t.day_revenue_cents) AS tie_size,\n       (SELECT GROUP_CONCAT(conv_date, ',') FROM (\n          SELECT conv_date FROM daily WHERE day_revenue_cents = t.day_revenue_cents\n          ORDER BY conv_date)) AS tie_dates\nFROM tied t\nORDER BY tie_size DESC, t.day_revenue_cents ASC;`, order: "exact" },
      { prompt: "The size of the biggest tie group. One column: biggest_tie_size.", code: `SELECT MAX(cnt) AS biggest_tie_size\nFROM (\n  SELECT t, COUNT(*) AS cnt FROM (\n    SELECT SUM(revenue_cents) AS t\n    FROM conversions WHERE status = 'confirmed'\n    GROUP BY conv_date\n  )\n  GROUP BY t\n  HAVING COUNT(*) > 1\n);`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Google",
    title: "The closer audit",
    scenario:
      "Every path conversion has a closer — unless the closer is a tie. Audit the closers across ALL statuses.",
    steps: [
      { prompt: "Count single-closer conversions whose closer campaign differs from the cookie. One column: mismatch_count.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n),\nlast_touch AS (\n  SELECT m.conversion_id, t.campaign_id,\n         (SELECT COUNT(*) FROM touchpoints t2\n           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n\n  FROM maxts m JOIN touchpoints t\n    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\n)\nSELECT COUNT(*) AS mismatch_count\nFROM last_touch lt\nJOIN conversions cv ON cv.conversion_id = lt.conversion_id\nJOIN sessions s ON s.session_id = cv.session_id\nWHERE lt.n = 1 AND lt.campaign_id <> s.utm_campaign_id;`, order: "exact" },
      { prompt: "Closer rows per channel across ALL path conversions (no status filter): closer_channel, row_count, ordered by row_count descending, then channel ascending.", code: `WITH maxts AS (\n  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id\n)\nSELECT ca.channel AS closer_channel, COUNT(*) AS row_count\nFROM maxts m\nJOIN touchpoints t ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt\nJOIN campaigns ca ON ca.campaign_id = t.campaign_id\nGROUP BY ca.channel\nORDER BY row_count DESC, closer_channel ASC;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Meta",
    title: "Executive dossier",
    scenario:
      "The two numbers the CEO will remember: the money ladder, and the one conversion that carries 40% of the book.",
    steps: [
      { prompt: "One row: charged_cents, refund_cents, net_cents.", code: `SELECT (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0) AS charged_cents,\n       (SELECT SUM(amount_cents) FROM refunds) AS refund_cents,\n       (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0)\n         - (SELECT SUM(amount_cents) FROM refunds) AS net_cents;`, order: "exact" },
      { prompt: "One row: whale_cents, whale_share_pct (2 dp), and confirmed conversions in the book. Output whale_cents, whale_share_pct, confirmed_count.", code: `SELECT (SELECT revenue_cents FROM conversions WHERE conversion_id = 10) AS whale_cents,\n       ROUND(100.0 * (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)\n             / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS whale_share_pct,\n       (SELECT COUNT(*) FROM conversions WHERE status = 'confirmed') AS confirmed_count;`, order: "exact" },
    ],
  },
];
