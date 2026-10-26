// Domain Mastery — Marketing & Attribution · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in
// dm-mkt-seed.ts. Statements cite only probe-verified facts
// (scripts/r15-mkt-probe.ts + scripts/r15-facts.txt). Expected outputs are
// engine-generated into dm-expected.ts by scripts/dm-verify.ts — never
// hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_MKT_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "Google",
    title: "Confirmed count",
    statement:
      "The conversion book mixes confirmed, pending, duplicate, refunded and cancelled rows. Count how many conversions have status 'confirmed'. Output a single column confirmed_count with one row.",
    code: `SELECT COUNT(*) AS confirmed_count
FROM conversions
WHERE status = 'confirmed';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "Meta",
    title: "The pending board",
    statement:
      "Six conversions are still pending — payments that started but never charged. List them: conversion_id, session_id, conv_type, conv_date, ordered by conversion_id ascending.",
    code: `SELECT conversion_id, session_id, conv_type, conv_date
FROM conversions
WHERE status = 'pending'
ORDER BY conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Conversion types",
    statement:
      "List every distinct conv_type in the conversions table, one per row, ordered alphabetically. Single column: conv_type.",
    code: `SELECT DISTINCT conv_type
FROM conversions
ORDER BY conv_type ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Status census",
    statement:
      "Count the conversions per status. Output status and conversion_count, ordered by conversion_count descending, then status ascending. The two 2-row statuses sort alphabetically.",
    code: `SELECT status, COUNT(*) AS conversion_count
FROM conversions
GROUP BY status
ORDER BY conversion_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Search roster",
    statement:
      "List the search-channel campaigns: campaign_id, name, objective, daily_budget_cents, ordered by campaign_id ascending. Four campaigns buy search — one of them is the book's whale.",
    code: `SELECT campaign_id, name, objective, daily_budget_cents
FROM campaigns
WHERE channel = 'search'
ORDER BY campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "Campaign directory",
    statement:
      "List the full campaign roster: campaign_id, name, channel, status, ordered by campaign_id ascending. One of these twelve never served a thing.",
    code: `SELECT campaign_id, name, channel, status
FROM campaigns
ORDER BY campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "Google",
    title: "Traffic sources",
    statement:
      "Count the sessions per utm_source. Output utm_source and session_count, ordered by session_count descending, then utm_source ascending. Direct traffic — sessions with no campaign tag — is one of the five rows.",
    code: `SELECT utm_source, COUNT(*) AS session_count
FROM sessions
GROUP BY utm_source
ORDER BY session_count DESC, utm_source ASC;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "Meta",
    title: "Refund pipeline",
    statement:
      "Count the refunds per status. Output status and refund_count, ordered by refund_count descending, then status ascending. Open exposure is the money still undecided.",
    code: `SELECT status, COUNT(*) AS refund_count
FROM refunds
GROUP BY status
ORDER BY refund_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "HubSpot",
    title: "Organic sessions",
    statement:
      "Direct sessions carry no campaign tag — that's organic traffic. List them: session_id, session_ts, device, duration_seconds, ordered by session_id ascending.",
    code: `SELECT session_id, session_ts, device, duration_seconds
FROM sessions
WHERE utm_source = 'direct'
ORDER BY session_id ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Salesforce",
    title: "The April book",
    statement:
      "List every conversion tendered in April 2026: conversion_id, conv_type, status, conv_date, revenue_cents, ordered by conv_date ascending, then conversion_id ascending. One of these rows is 296000.",
    code: `SELECT conversion_id, conv_type, status, conv_date, revenue_cents
FROM conversions
WHERE conv_date BETWEEN '2026-04-01' AND '2026-04-30'
ORDER BY conv_date ASC, conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Display pair",
    statement:
      "List the display-channel campaigns: campaign_id, name, daily_budget_cents, launch_date, ordered by campaign_id ascending. Display serves impressions and converts nothing — the expensive billboard.",
    code: `SELECT campaign_id, name, daily_budget_cents, launch_date
FROM campaigns
WHERE channel = 'display'
ORDER BY campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "Meter census",
    statement:
      "One row, two numbers: total impressions served, and how many of them were clicked. Output impressions and clicks.",
    code: `SELECT COUNT(*) AS impressions,
       SUM(clicked) AS clicks
FROM impressions;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "Google",
    title: "Creative catalog",
    statement:
      "List the full ad roster: ad_id, campaign_id, format, headline, ordered by ad_id ascending. Fourteen creatives — one of them never served a single impression.",
    code: `SELECT ad_id, campaign_id, format, headline
FROM ads
ORDER BY ad_id ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "Meta",
    title: "Disputed bills",
    statement:
      "List the spend rows sitting in dispute: spend_id, campaign_id, spend_date, media_cents, platform_fee_cents, ordered by spend_id ascending. One of these five is secretly a fee-drift row.",
    code: `SELECT spend_id, campaign_id, spend_date, media_cents, platform_fee_cents
FROM spend
WHERE status = 'disputed'
ORDER BY spend_id ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "HubSpot",
    title: "The dormant teaser",
    statement:
      "Campaign 11 was paused before launch — the honest zero of this world. Output its full row: campaign_id, name, channel, objective, daily_budget_cents, launch_date, status.",
    code: `SELECT campaign_id, name, channel, objective, daily_budget_cents,
       launch_date, status
FROM campaigns
WHERE campaign_id = 11;`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Salesforce",
    title: "Biggest daily bills",
    statement:
      "Top five spend days by media_cents. Output spend_id, campaign_id, spend_date, media_cents, ordered by media_cents descending, then spend_id ascending. The flagship's launch week owns the top of this board.",
    code: `SELECT spend_id, campaign_id, spend_date, media_cents
FROM spend
ORDER BY media_cents DESC, spend_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Clickmosaic",
    title: "Touch types",
    statement:
      "Count the touchpoints per touch_type. Output touch_type and touch_count, ordered by touch_count descending. Clicks are the minority — most of the recorded path is view-through.",
    code: `SELECT touch_type, COUNT(*) AS touch_count
FROM touchpoints
GROUP BY touch_type
ORDER BY touch_count DESC;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Funnelworks",
    title: "Inside the window",
    statement:
      "The attribution pixel only retains events from 2026-05-04 onward. Count conversions with conv_date on or after that date. Single column: window_conversions.",
    code: `SELECT COUNT(*) AS window_conversions
FROM conversions
WHERE conv_date >= '2026-05-04';`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "Google",
    title: "The dispute line",
    statement:
      "List refunds of 60000 cents or more. Output refund_id, conversion_id, reason, amount_cents, status, ordered by refund_id ascending. Exactly one row qualifies — the chargeback on the whale itself.",
    code: `SELECT refund_id, conversion_id, reason, amount_cents, status
FROM refunds
WHERE amount_cents >= 60000
ORDER BY refund_id ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "Meta",
    title: "The mega session",
    statement:
      "List sessions strictly longer than 1800 seconds: session_id, session_ts, utm_source, duration_seconds, ordered by session_id ascending. Exactly one session clears the bar — and it hosted the whale.",
    code: `SELECT session_id, session_ts, utm_source, duration_seconds
FROM sessions
WHERE duration_seconds > 1800
ORDER BY session_id ASC;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Confirmed revenue by campaign",
    statement:
      "For every campaign — including those that converted nothing — sum the revenue of conversions whose last-click cookie (the session's utm_campaign_id) credits them. Output campaign_id, name, confirmed_revenue_cents (0 when none), ordered by the total descending, then campaign_id ascending. The billboard pair and the dormant teaser all show 0; the organic-direct conversions appear nowhere, because they belong to no campaign.",
    code: `SELECT c.campaign_id, c.name,
       COALESCE(SUM(cv.revenue_cents), 0) AS confirmed_revenue_cents
FROM campaigns c
LEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id
LEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.status = 'confirmed'
GROUP BY c.campaign_id, c.name
ORDER BY confirmed_revenue_cents DESC, c.campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Last-click channel board",
    statement:
      "Roll confirmed revenue up to the CHANNEL the last-click cookie credits (conversion -> session -> campaign -> channel). Output channel and channel_revenue_cents, ordered by the total descending. Search leads — but only because one campaign carries it.",
    code: `SELECT ca.channel, SUM(cv.revenue_cents) AS channel_revenue_cents
FROM conversions cv
JOIN sessions s ON s.session_id = cv.session_id
JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
WHERE cv.status = 'confirmed'
GROUP BY ca.channel
ORDER BY channel_revenue_cents DESC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "The whale flip",
    statement:
      "Repeat the last-click channel board but EXCLUDE the whale conversion (conversion_id 10, the 296000 purchase). Output channel and channel_revenue_cents, ordered by the total descending. Watch the order flip: ex-whale search collapses behind social.",
    code: `SELECT ca.channel, SUM(cv.revenue_cents) AS channel_revenue_cents
FROM conversions cv
JOIN sessions s ON s.session_id = cv.session_id
JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
WHERE cv.status = 'confirmed'
  AND cv.conversion_id <> 10
GROUP BY ca.channel
ORDER BY channel_revenue_cents DESC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Funnelworks",
    title: "Monthly confirmed curve",
    statement:
      "Total confirmed revenue per month. Output the month as ym ('YYYY-MM') and month_revenue_cents, ordered by ym ascending. April is the whale month; January is the smallest book.",
    code: `SELECT strftime('%Y-%m', conv_date) AS ym,
       SUM(revenue_cents) AS month_revenue_cents
FROM conversions
WHERE status = 'confirmed'
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Google",
    title: "Top daily boards",
    statement:
      "Top ten days by confirmed revenue. Output conv_date and day_revenue_cents, ordered by the total descending, then date ascending. After the whale day the board gets crowded: two days tie at 18000 and two more at 14000.",
    code: `SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents
FROM conversions
WHERE status = 'confirmed'
GROUP BY conv_date
ORDER BY day_revenue_cents DESC, conv_date ASC
LIMIT 10;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Meta",
    title: "CTR leaderboard",
    statement:
      "Per campaign with impressions: clicks, serves, and CTR as ROUND(100.0 * clicks / serves, 2). Output campaign_id, clicks, serves, ctr, ordered by ctr descending, then campaign_id ascending. The search workhorse tops 66; display shows a hard 0.",
    code: `SELECT campaign_id,
       SUM(clicked) AS clicks,
       COUNT(*) AS serves,
       ROUND(100.0 * SUM(clicked) / COUNT(*), 2) AS ctr
FROM impressions
GROUP BY campaign_id
ORDER BY ctr DESC, campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Device board",
    statement:
      "Count impressions per device. Output device and impression_count, ordered by impression_count descending, then device ascending. Mobile and desktop tie EXACTLY at 62 — the tie is the point.",
    code: `SELECT device, COUNT(*) AS impression_count
FROM impressions
GROUP BY device
ORDER BY impression_count DESC, device ASC;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Metered click spend by channel",
    statement:
      "Sum the metered cpc_cents per channel (every impression row joins its campaign, so display appears with 0 — video has no impressions at all and stays absent). Output channel and click_spend_cents, ordered by channel ascending.",
    code: `SELECT ca.channel, SUM(i.cpc_cents) AS click_spend_cents
FROM impressions i
JOIN campaigns ca ON ca.campaign_id = i.campaign_id
GROUP BY ca.channel
ORDER BY ca.channel ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "The overspend ledger",
    statement:
      "Find the spend days that exceeded their campaign's daily budget. Output spend_id, campaign_id, spend_date, media_cents, daily_budget_cents, ordered by spend_id ascending. Five rows — and one more day sat EXACTLY on its budget and is NOT here.",
    code: `SELECT s.spend_id, s.campaign_id, s.spend_date,
       s.media_cents, c.daily_budget_cents
FROM spend s
JOIN campaigns c ON c.campaign_id = s.campaign_id
WHERE s.media_cents > c.daily_budget_cents
ORDER BY s.spend_id ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Funnelworks",
    title: "The budget wall",
    statement:
      "One row, two counts: how many spend days billed at or above the campaign's daily budget (>=), and how many strictly above (>), Output at_or_over and strictly_over. The gap between them is the one day that landed EXACTLY on budget.",
    code: `SELECT SUM(s.media_cents >= c.daily_budget_cents) AS at_or_over,
       SUM(s.media_cents > c.daily_budget_cents) AS strictly_over
FROM spend s
JOIN campaigns c ON c.campaign_id = s.campaign_id;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Google",
    title: "Fee-drift audit",
    statement:
      "Every spend row should bill platform_fee_cents = ROUND(media_cents * 0.10). Find the rows where it doesn't. Output spend_id, campaign_id, media_cents, platform_fee_cents, status, ordered by spend_id ascending. Three rows drifted to a negotiated 8% — one of them is already PAID.",
    code: `SELECT spend_id, campaign_id, media_cents,
       platform_fee_cents, status
FROM spend
WHERE platform_fee_cents <> CAST(ROUND(media_cents * 0.10) AS INTEGER)
ORDER BY spend_id ASC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Meta",
    title: "Refund reasons",
    statement:
      "Per refund reason: count and total amount. Output reason, refund_count, reason_total_cents, ordered by reason_total_cents descending. Chargebacks are a third of the rows but most of the money.",
    code: `SELECT reason, COUNT(*) AS refund_count,
       SUM(amount_cents) AS reason_total_cents
FROM refunds
GROUP BY reason
ORDER BY reason_total_cents DESC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Clawback leaderboard",
    statement:
      "Per conversion with refunds: total clawed back. Output conversion_id, refund_count, clawback_cents, ordered by clawback_cents descending, then conversion_id ascending. The whale surrendered 75000 across two refunds and still leads the board.",
    code: `SELECT conversion_id, COUNT(*) AS refund_count,
       SUM(amount_cents) AS clawback_cents
FROM refunds
GROUP BY conversion_id
ORDER BY clawback_cents DESC, conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "Salesforce",
    title: "ROAS leaderboard",
    statement:
      "Return on ad spend per campaign: confirmed revenue credited by the cookie divided by total media billed. Output campaign_id, media_cents, roas as ROUND(1.0 * revenue / media, 2), ordered by roas descending. The newsletter's 10.96 tops the board; one campaign buys below 1.0.",
    code: `SELECT ca.campaign_id, sp.media_cents,
       ROUND(1.0 * cv.revenue_cents / sp.media_cents, 2) AS roas
FROM (
  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents
  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL
  GROUP BY s.utm_campaign_id
) cv
JOIN (
  SELECT campaign_id, SUM(media_cents) AS media_cents
  FROM spend GROUP BY campaign_id
) sp ON sp.campaign_id = cv.campaign_id
JOIN campaigns ca ON ca.campaign_id = cv.campaign_id
ORDER BY roas DESC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "The money ladder",
    statement:
      "One row, three numbers: charged revenue (every conversion with revenue > 0), total refunds, and net revenue (charged minus refunds). Output charged_cents, refund_cents, net_cents.",
    code: `SELECT (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0) AS charged_cents,
       (SELECT SUM(amount_cents) FROM refunds) AS refund_cents,
       (SELECT SUM(revenue_cents) FROM conversions WHERE revenue_cents > 0)
         - (SELECT SUM(amount_cents) FROM refunds) AS net_cents;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Funnelworks",
    title: "Cookie vs path audit",
    statement:
      "For window conversions whose last touch is a SINGLE row, compare the cookie's campaign (session utm) against the last-touch campaign. Output conversion_id, cookie_campaign_id, last_touch_campaign_id, ordered by conversion_id ascending. Exactly three conversions disagree — the click-cookie blind spot.",
    code: `WITH maxts AS (
  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id
),
last_touch AS (
  SELECT m.conversion_id, t.campaign_id,
         (SELECT COUNT(*) FROM touchpoints t2
           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n
  FROM maxts m JOIN touchpoints t
    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt
)
SELECT lt.conversion_id, s.utm_campaign_id AS cookie_campaign_id,
       lt.campaign_id AS last_touch_campaign_id
FROM last_touch lt
JOIN sessions s ON s.session_id = (SELECT session_id FROM conversions WHERE conversion_id = lt.conversion_id)
WHERE lt.n = 1 AND lt.campaign_id <> s.utm_campaign_id
ORDER BY lt.conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Clickmosaic",
    title: "The ambiguous closer",
    statement:
      "Find conversions whose LAST-Touch timestamp is shared by more than one touchpoint, and build the tie registry: GROUP_CONCAT of the tied campaign ids ordered ascending. Output conversion_id, tied_campaigns, tied_at. One conversion qualifies — last-touch cannot decide who closed it.",
    code: `WITH maxts AS (
  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id
),
tied AS (
  SELECT t.conversion_id, m.mt AS tied_at, COUNT(*) AS n
  FROM maxts m JOIN touchpoints t
    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt
  GROUP BY t.conversion_id, m.mt
  HAVING COUNT(*) > 1
)
SELECT ti.conversion_id,
       (SELECT GROUP_CONCAT(campaign_id, ',') FROM (
          SELECT t.campaign_id FROM touchpoints t
          JOIN maxts m2 ON m2.conversion_id = t.conversion_id
          WHERE t.conversion_id = ti.conversion_id AND t.touched_at = m2.mt
          ORDER BY t.campaign_id)) AS tied_campaigns,
       ti.tied_at
FROM tied ti
ORDER BY ti.conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Meta",
    title: "The retention gap",
    statement:
      "Conversions tendered BEFORE the pixel window (2026-05-04) keep their last-click cookie but their path is gone. List them: conversion_id, conv_date, cookie_campaign_id (the session's utm), ordered by conv_date ascending, then conversion_id ascending. Fourteen rows — the audit that explains why path-based models under-count this book.",
    code: `SELECT c.conversion_id, c.conv_date, s.utm_campaign_id AS cookie_campaign_id
FROM conversions c
JOIN sessions s ON s.session_id = c.session_id
WHERE c.conv_date < '2026-05-04' AND s.utm_campaign_id IS NOT NULL
ORDER BY c.conv_date ASC, c.conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "HubSpot",
    title: "Same-session pairs",
    statement:
      "Self-join conversions sharing a session where the second fired within 300 seconds of the first. Output a_id, b_id, session_id, gap_seconds, ordered by gap ascending, then a_id ascending. Four pairs — two sit EXACTLY on the 300-second line, and one 180-second pair comes from a perfectly innocent double session.",
    code: `SELECT a.conversion_id AS a_id, b.conversion_id AS b_id,
       a.session_id, b.conv_ts - a.conv_ts AS gap_seconds
FROM conversions a
JOIN conversions b
  ON b.session_id = a.session_id AND b.conv_ts > a.conv_ts
WHERE b.conv_ts - a.conv_ts <= 300
ORDER BY gap_seconds ASC, a_id ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "Salesforce",
    title: "Session length podium",
    statement:
      "Top three sessions by duration. Output session_id, utm_source, utm_campaign_id, duration_seconds, ordered by duration descending. The 2700s mega session converted 296000; the 1800s runner-up spawned the stuffing burst.",
    code: `SELECT session_id, utm_source, utm_campaign_id, duration_seconds
FROM sessions
ORDER BY duration_seconds DESC
LIMIT 3;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "The rank registry",
    statement:
      "Rank campaigns by confirmed cookie-credited revenue using BOTH RANK() and DENSE_RANK(). Output campaign_id, confirmed_revenue_cents, rk, dense_rk, ordered by revenue descending, then campaign_id ascending. Campaigns 3 and 6 tie at exactly 42000 — watch RANK skip 6 while DENSE_RANK doesn't.",
    code: `WITH rev AS (
  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents
  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL
  GROUP BY s.utm_campaign_id
)
SELECT campaign_id, revenue_cents,
       RANK() OVER (ORDER BY revenue_cents DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY revenue_cents DESC) AS dense_rk
FROM rev
ORDER BY revenue_cents DESC, campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "The whale dossier",
    statement:
      "One row telling the whole whale story: total confirmed revenue, the whale conversion's revenue, its share of the book (ROUND to 2 dp), search's revenue EXCLUDING the whale, and social's revenue. Output total_confirmed_cents, whale_cents, whale_share_pct, search_ex_whale_cents, social_cents. The last two columns prove the flip.",
    code: `SELECT (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed') AS total_confirmed_cents,
       (SELECT revenue_cents FROM conversions WHERE conversion_id = 10) AS whale_cents,
       ROUND(100.0 * (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)
             / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS whale_share_pct,
       (SELECT COALESCE(SUM(cv.revenue_cents), 0)
         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
         WHERE cv.status = 'confirmed' AND cv.conversion_id <> 10 AND ca.channel = 'search') AS search_ex_whale_cents,
       (SELECT COALESCE(SUM(cv.revenue_cents), 0)
         FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
         JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
         WHERE cv.status = 'confirmed' AND ca.channel = 'social') AS social_cents;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "Google",
    title: "The 7-day window wall",
    statement:
      "For every path-bearing conversion compute conv_ts - MIN(touched_at) — the span from first touch. One row: how many spans are <= 604800 (the inclusive 7-day window), how many are strictly <, and the conversion_id sitting EXACTLY on the line. Output eligible_inclusive, eligible_strict, on_line_conversion_id.",
    code: `SELECT COUNT(*) FILTER (WHERE span <= 604800) AS eligible_inclusive,
       COUNT(*) FILTER (WHERE span < 604800) AS eligible_strict,
       COALESCE(MAX(CASE WHEN span = 604800 THEN conversion_id END), 0) AS on_line_conversion_id
FROM (
  SELECT c.conversion_id, c.conv_ts - MIN(t.touched_at) AS span
  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id
  GROUP BY c.conversion_id
);`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Meta",
    title: "Three models, three boards",
    statement:
      "Build the attribution model comparison for path-bearing confirmed conversions: per channel, last-click revenue credited by the cookie (all confirmed, cookie path) versus LINEAR attribution (revenue split evenly across every touch on the path). Output channel, last_click_cents, linear_cents, ordered by last_click_cents descending. Cookie-credit search 461000; the path-based view gives social the crown.",
    code: `WITH cookie AS (
  SELECT ca.channel, SUM(cv.revenue_cents) AS cents
  FROM conversions cv
  JOIN sessions s ON s.session_id = cv.session_id
  JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
  WHERE cv.status = 'confirmed'
  GROUP BY ca.channel
),
path AS (
  SELECT c.conversion_id, c.revenue_cents AS rev, COUNT(*) AS n
  FROM conversions c JOIN touchpoints t ON t.conversion_id = c.conversion_id
  WHERE c.status = 'confirmed'
  GROUP BY c.conversion_id
),
linear AS (
  SELECT ca.channel, ROUND(SUM(1.0 * p.rev / p.n), 2) AS cents
  FROM path p
  JOIN touchpoints t ON t.conversion_id = p.conversion_id
  JOIN campaigns ca ON ca.campaign_id = t.campaign_id
  GROUP BY ca.channel
)
SELECT co.channel, co.cents AS last_click_cents, li.cents AS linear_cents
FROM cookie co JOIN linear li ON li.channel = co.channel
ORDER BY last_click_cents DESC;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "HubSpot",
    title: "The sessionization wall",
    statement:
      "Campaign 2's 2026-06-20 impression run must be sessionized under the 1800-second gap rule: consecutive impressions join the same session while the gap is UNDER 1800s. One row: events, gaps between them, sessions under the strict rule, sessions if the boundary pair also joins, and how many gaps sit EXACTLY on 1800. Output events, gap_count, sessions_strict, sessions_inclusive, gaps_on_line.",
    code: `WITH run AS (
  SELECT imp_ts, imp_ts - LAG(imp_ts) OVER (ORDER BY imp_ts) AS gap
  FROM impressions
  WHERE campaign_id = 2 AND date(imp_ts, 'unixepoch') = '2026-06-20'
)
SELECT (SELECT COUNT(*) FROM run) AS events,
       (SELECT COUNT(gap) FROM run) AS gap_count,
       1 + (SELECT COUNT(*) FROM run WHERE gap < 1800) AS sessions_strict,
       1 + (SELECT COUNT(*) FROM run WHERE gap <= 1800) AS sessions_inclusive,
       (SELECT COUNT(*) FROM run WHERE gap = 1800) AS gaps_on_line;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Daily leaderboard with ties",
    statement:
      "Top twelve days by confirmed revenue with both RANK() and DENSE_RANK(). Output conv_date, day_revenue_cents, rk, dense_rk, ordered by revenue descending, then date ascending. The 18000 pair shares rank 7; the next two days tie at 14000 and the cut lands mid-tie at 12000 — one of the pair is missing by design of LIMIT 12.",
    code: `WITH daily AS (
  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents
  FROM conversions WHERE status = 'confirmed'
  GROUP BY conv_date
)
SELECT conv_date, day_revenue_cents,
       RANK() OVER (ORDER BY day_revenue_cents DESC, conv_date ASC) AS rk,
       DENSE_RANK() OVER (ORDER BY day_revenue_cents DESC) AS dense_rk
FROM daily
ORDER BY day_revenue_cents DESC, conv_date ASC
LIMIT 12;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "The '3,6' registry",
    statement:
      "Find campaign revenue totals shared by MORE than one campaign and build the tie registry with GROUP_CONCAT of campaign ids ordered ascending. Output confirmed_revenue_cents, tied_campaigns, tie_size, ordered by revenue descending. One group: the 42000 twins.",
    code: `WITH rev AS (
  SELECT s.utm_campaign_id AS campaign_id, SUM(cv.revenue_cents) AS revenue_cents
  FROM conversions cv JOIN sessions s ON s.session_id = cv.session_id
  WHERE cv.status = 'confirmed' AND s.utm_campaign_id IS NOT NULL
  GROUP BY s.utm_campaign_id
),
tied AS (
  SELECT revenue_cents FROM rev GROUP BY revenue_cents HAVING COUNT(*) > 1
)
SELECT t.revenue_cents,
       (SELECT GROUP_CONCAT(campaign_id, ',') FROM (
          SELECT campaign_id FROM rev WHERE revenue_cents = t.revenue_cents
          ORDER BY campaign_id)) AS tied_campaigns,
       (SELECT COUNT(*) FROM rev WHERE revenue_cents = t.revenue_cents) AS tie_size
FROM tied t
ORDER BY t.revenue_cents DESC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Mismatch dossier",
    statement:
      "For the three cookie-vs-path mismatches, show the full story: conversion id, the cookie's CHANNEL, the closer's CHANNEL, and whether the closer was a click or a view. Output conversion_id, cookie_channel, closer_channel, closer_type, ordered by conversion_id ascending. An email VIEW, a social VIEW, and a social CLICK each stole credit their cookie never knew about.",
    code: `WITH maxts AS (
  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id
),
last_touch AS (
  SELECT m.conversion_id, t.campaign_id, t.touch_type,
         (SELECT COUNT(*) FROM touchpoints t2
           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n
  FROM maxts m JOIN touchpoints t
    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt
)
SELECT lt.conversion_id,
       cookie_ca.channel AS cookie_channel,
       closer_ca.channel AS closer_channel,
       lt.touch_type AS closer_type
FROM last_touch lt
JOIN conversions cv ON cv.conversion_id = lt.conversion_id
JOIN sessions s ON s.session_id = cv.session_id
JOIN campaigns cookie_ca ON cookie_ca.campaign_id = s.utm_campaign_id
JOIN campaigns closer_ca ON closer_ca.campaign_id = lt.campaign_id
WHERE lt.n = 1 AND lt.campaign_id <> s.utm_campaign_id
ORDER BY lt.conversion_id ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "Google",
    title: "Who closes: click or view?",
    statement:
      "For every confirmed conversion with a path, take its closer row(s) — the touch(es) at MAX(touched_at). Count view rows vs click rows among closers. Output closer_views, closer_clicks. The counts disagree with the conversion count by exactly one: the ambiguous c26 contributes BOTH a view and a click row.",
    code: `WITH maxts AS (
  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id
)
SELECT SUM(t.touch_type = 'view') AS closer_views,
       SUM(t.touch_type = 'click') AS closer_clicks
FROM maxts m
JOIN touchpoints t ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt
JOIN conversions cv ON cv.conversion_id = m.conversion_id
WHERE cv.status = 'confirmed';`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Refund exposure ladder",
    statement:
      "Refunds of at least 12000 cents, ordered by amount descending, with a running total of exposure. Output refund_id, amount_cents, exposure_running_cents, ordered by amount descending, then refund_id ascending. Six rows; the ladder shows exactly how the 60000 chargeback stacks the book.",
    code: `SELECT refund_id, amount_cents,
       SUM(amount_cents) OVER (ORDER BY amount_cents DESC, refund_id ASC) AS exposure_running_cents
FROM refunds
WHERE amount_cents >= 12000
ORDER BY amount_cents DESC, refund_id ASC;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Budget headroom board",
    statement:
      "Per campaign that billed anything: total media, the daily budget, its heaviest day, and whether the heaviest day reached the budget. Output campaign_id, media_cents, daily_budget_cents, max_day_cents, at_budget as 1 when max_day >= budget else 0, ordered by campaign_id ascending. Five campaigns have a heaviest day at or over budget; the rest never touch the line.",
    code: `SELECT c.campaign_id, SUM(s.media_cents) AS media_cents,
       c.daily_budget_cents, MAX(s.media_cents) AS max_day_cents,
       MAX(s.media_cents >= c.daily_budget_cents) AS at_budget
FROM campaigns c
JOIN spend s ON s.campaign_id = c.campaign_id
GROUP BY c.campaign_id, c.daily_budget_cents
ORDER BY c.campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Creative-fee audit",
    statement:
      "The five spend days that carried a creative production fee. Output spend_id, campaign name, spend_date, media_cents, creative_cents, and the fee's share of that day's total bill (media + fee + platform fee), rounded to 1 dp, ordered by creative_cents descending. The flagship film day billed 8000 of creative on top of its media.",
    code: `SELECT s.spend_id, c.name AS campaign_name, s.spend_date,
       s.media_cents, s.creative_cents,
       ROUND(100.0 * s.creative_cents
             / (s.media_cents + s.platform_fee_cents + s.creative_cents), 1) AS fee_share_pct
FROM spend s
JOIN campaigns c ON c.campaign_id = s.campaign_id
WHERE s.creative_cents > 0
ORDER BY s.creative_cents DESC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "Clickmosaic",
    title: "The email calendar spine",
    statement:
      "Email's two campaigns launched in April and May — before that the channel is structurally dark. Build a six-month spine and show email's confirmed revenue per month INCLUDING the zero months. Output ym, email_revenue_cents, ordered by ym ascending. Three honest zeros lead the board.",
    code: `WITH months(ym) AS (
  VALUES ('2026-01'), ('2026-02'), ('2026-03'),
         ('2026-04'), ('2026-05'), ('2026-06')
)
SELECT m.ym,
       COALESCE(SUM(CASE WHEN ca.channel = 'email' THEN cv.revenue_cents END), 0) AS email_revenue_cents
FROM months m
LEFT JOIN conversions cv
  ON strftime('%Y-%m', cv.conv_date) = m.ym AND cv.status = 'confirmed'
LEFT JOIN sessions s ON s.session_id = cv.session_id
LEFT JOIN campaigns ca ON ca.campaign_id = s.utm_campaign_id
GROUP BY m.ym
ORDER BY m.ym ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "Funnelworks",
    title: "Conversions per session",
    statement:
      "Per campaign with tagged sessions: session count, conversion count, and conversions per session rounded to 2 dp. Output campaign_id, session_count, conversion_count, conv_per_session, ordered by the ratio descending, then campaign_id ascending. The retargeting wall scores 1.43 — ten conversions from seven sessions — because the stuffing burst fired four duplicates from ONE session.",
    code: `SELECT s.utm_campaign_id AS campaign_id,
       COUNT(DISTINCT s.session_id) AS session_count,
       COUNT(c.conversion_id) AS conversion_count,
       ROUND(1.0 * COUNT(c.conversion_id) / COUNT(DISTINCT s.session_id), 2) AS conv_per_session
FROM sessions s
LEFT JOIN conversions c ON c.session_id = s.session_id
WHERE s.utm_campaign_id IS NOT NULL
GROUP BY s.utm_campaign_id
ORDER BY conv_per_session DESC, campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "Google",
    title: "The running revenue curve",
    statement:
      "Confirmed revenue by day, ordered by date, with a running total. Output conv_date, day_revenue_cents, running_revenue_cents, ordered by conv_date ascending. Forty-three days; the curve ends at the full confirmed book and the whale's step at 04-20 dwarfs everything around it.",
    code: `SELECT conv_date, day_revenue_cents,
       SUM(day_revenue_cents) OVER (ORDER BY conv_date ASC) AS running_revenue_cents
FROM (
  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents
  FROM conversions WHERE status = 'confirmed'
  GROUP BY conv_date
)
ORDER BY conv_date ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Meta",
    title: "The tie-day registry",
    statement:
      "Group confirmed-revenue days by their daily total and keep only totals shared by more than one day; build the date registry with GROUP_CONCAT ordered ascending. Output day_revenue_cents, tie_size, tie_dates, ordered by tie_size descending, then total ascending. Ten tie groups — from the 7-way 4000 club to the 18000 pair.",
    code: `WITH daily AS (
  SELECT conv_date, SUM(revenue_cents) AS day_revenue_cents
  FROM conversions WHERE status = 'confirmed'
  GROUP BY conv_date
),
tied AS (
  SELECT day_revenue_cents FROM daily GROUP BY day_revenue_cents HAVING COUNT(*) > 1
)
SELECT t.day_revenue_cents,
       (SELECT COUNT(*) FROM daily WHERE day_revenue_cents = t.day_revenue_cents) AS tie_size,
       (SELECT GROUP_CONCAT(conv_date, ',') FROM (
          SELECT conv_date FROM daily WHERE day_revenue_cents = t.day_revenue_cents
          ORDER BY conv_date)) AS tie_dates
FROM tied t
ORDER BY tie_size DESC, t.day_revenue_cents ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "HubSpot",
    title: "Charged, clawed, kept",
    statement:
      "Per campaign: charged revenue (confirmed + refunded conversions credited by the cookie), refunds raised against those conversions, and the net that survived. Output campaign_id, charged_cents, refunded_cents, net_cents, ordered by net descending, then campaign_id ascending. The billboard pair and the dormant teaser keep exactly 0; the flagship keeps 270000 after a 75000 clawback.",
    code: `SELECT c.campaign_id,
       COALESCE(SUM(cv.revenue_cents), 0) AS charged_cents,
       COALESCE((SELECT SUM(r.amount_cents) FROM refunds r
                  JOIN conversions rc ON rc.conversion_id = r.conversion_id
                  JOIN sessions rs ON rs.session_id = rc.session_id
                  WHERE rs.utm_campaign_id = c.campaign_id), 0) AS refunded_cents,
       COALESCE(SUM(cv.revenue_cents), 0)
         - COALESCE((SELECT SUM(r.amount_cents) FROM refunds r
                      JOIN conversions rc ON rc.conversion_id = r.conversion_id
                      JOIN sessions rs ON rs.session_id = rc.session_id
                      WHERE rs.utm_campaign_id = c.campaign_id), 0) AS net_cents
FROM campaigns c
LEFT JOIN sessions s ON s.utm_campaign_id = c.campaign_id
LEFT JOIN conversions cv ON cv.session_id = s.session_id AND cv.revenue_cents > 0
GROUP BY c.campaign_id
ORDER BY net_cents DESC, c.campaign_id ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Salesforce",
    title: "Two clocks, opposite stories",
    statement:
      "Sessions longer than 1500 seconds, with their conversion counts and converted revenue. Output session_id, utm_campaign_id, duration_seconds, conversion_count, converted_revenue_cents, ordered by duration descending. The 2700s mega session bought one whale; the 1800s runner-up fired four worthless duplicates.",
    code: `SELECT s.session_id, s.utm_campaign_id, s.duration_seconds,
       COUNT(c.conversion_id) AS conversion_count,
       COALESCE(SUM(c.revenue_cents), 0) AS converted_revenue_cents
FROM sessions s
LEFT JOIN conversions c ON c.session_id = s.session_id
WHERE s.duration_seconds > 1500
GROUP BY s.session_id, s.utm_campaign_id, s.duration_seconds
ORDER BY s.duration_seconds DESC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "Google",
    title: "The whale, end to end",
    statement:
      "One dossier row for the whale conversion: its revenue, its share of the confirmed book (2 dp), its cookie campaign's total confirmed revenue, how many touchpoints record its path (the pre-window truth: zero), the refunds raised against it, and what survived. Output whale_cents, whale_share_pct, cookie_campaign_revenue_cents, path_touch_count, refunded_cents, net_after_refunds_cents.",
    code: `SELECT (SELECT revenue_cents FROM conversions WHERE conversion_id = 10) AS whale_cents,
       ROUND(100.0 * (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)
             / (SELECT SUM(revenue_cents) FROM conversions WHERE status = 'confirmed'), 2) AS whale_share_pct,
       (SELECT SUM(cv.revenue_cents) FROM conversions cv
         JOIN sessions s ON s.session_id = cv.session_id
        WHERE cv.status = 'confirmed' AND s.utm_campaign_id = 10) AS cookie_campaign_revenue_cents,
       (SELECT COUNT(*) FROM touchpoints WHERE conversion_id = 10) AS path_touch_count,
       (SELECT COALESCE(SUM(amount_cents), 0) FROM refunds WHERE conversion_id = 10) AS refunded_cents,
       (SELECT revenue_cents FROM conversions WHERE conversion_id = 10)
         - (SELECT COALESCE(SUM(amount_cents), 0) FROM refunds WHERE conversion_id = 10) AS net_after_refunds_cents;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "Meta",
    title: "Every model disagrees",
    statement:
      "The deepest audit in the pack: conversions where first-touch, last-touch (single closer) and the cookie name THREE different campaigns. Output conversion_id, cookie_campaign_id, first_touch_campaign_id, last_touch_campaign_id, ordered by conversion_id ascending. Three rows — and the email view, the social view and the social click inside them are the blind spot of every last-click dashboard.",
    code: `WITH maxts AS (
  SELECT conversion_id, MAX(touched_at) AS mt FROM touchpoints GROUP BY conversion_id
),
last_touch AS (
  SELECT m.conversion_id, t.campaign_id,
         (SELECT COUNT(*) FROM touchpoints t2
           WHERE t2.conversion_id = m.conversion_id AND t2.touched_at = m.mt) AS n
  FROM maxts m JOIN touchpoints t
    ON t.conversion_id = m.conversion_id AND t.touched_at = m.mt
),
first_touch AS (
  SELECT conversion_id, campaign_id FROM touchpoints
  WHERE touched_at = (SELECT MIN(touched_at) FROM touchpoints t2
                       WHERE t2.conversion_id = touchpoints.conversion_id)
)
SELECT lt.conversion_id,
       s.utm_campaign_id AS cookie_campaign_id,
       ft.campaign_id AS first_touch_campaign_id,
       lt.campaign_id AS last_touch_campaign_id
FROM last_touch lt
JOIN first_touch ft ON ft.conversion_id = lt.conversion_id
JOIN conversions cv ON cv.conversion_id = lt.conversion_id
JOIN sessions s ON s.session_id = cv.session_id
WHERE lt.n = 1
  AND lt.campaign_id <> s.utm_campaign_id
  AND ft.campaign_id <> s.utm_campaign_id
  AND ft.campaign_id <> lt.campaign_id
ORDER BY lt.conversion_id ASC;`,
    order: "exact",
  },
];
