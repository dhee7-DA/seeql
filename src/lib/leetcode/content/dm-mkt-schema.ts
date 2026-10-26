// Domain Mastery — pack #7 "Marketing & Attribution" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these eight tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail, Finance, Fraud, SaaS, Healthcare and
// Freight packs.
//
// The world is a performance-marketing stack: twelve campaigns buy media
// across five channels, their creatives serve impressions on a metered pixel
// (a click charges cpc_cents; a view-only serve charges nothing), site
// sessions arrive tagged with utm_source/utm_campaign (direct = organic,
// no campaign), conversions carry the money, touchpoints record each
// conversion's ad path, spend books the daily media bill, and refunds claw
// revenue back. Four vocabularies matter:
//   - THE PIXEL WINDOW: the attribution pixel retains events only inside
//     2026-05-04 .. 2026-06-29. Conversions before 05-04 keep their last-
//     click cookie (sessions.utm_campaign_id) but their touchpoint PATH is
//     gone — the retention gap. Organic-direct conversions never had a path.
//   - THE ATTRIBUTION MODELS: last-click credits the session's utm_campaign;
//     last-touch credits the path's MAX(touched_at) row; linear splits the
//     revenue evenly across the path. The pack plants conversions where
//     these disagree — three cookie-vs-path mismatches (view-through and one
//     click-through), and one conversion with TWO touches at the SAME second
//     (last-touch is genuinely ambiguous — the '4,5' registry).
//   - THE 7-DAY WINDOW WALL: a path touch is attributable when
//     conv_ts - touched_at <= 604800 — and exactly ONE conversion's first
//     touch sits EXACTLY on the 604800 line, so <= and < give different sets.
//   - THE MONEY LADDER: media_cents is the daily bill, platform_fee_cents is
//     ROUND(media * 0.10) on every row EXCEPT the 3 drift rows billed at a
//     negotiated 8%, and creative_cents adds production fees on 5 rows.
//     Delivery systems overspend budgets: exactly 5 spend rows exceed the
//     campaign's daily_budget_cents and one lands EXACTLY on it.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r15-mkt-probe.ts before content referenced it):
//   - the whale: conversion 10 (a 296000 purchase on 2026-04-20, cookie
//     campaign 10) is 39.7% of the 745700 confirmed revenue; search leads the
//     last-click channel board on its back alone, and excluding the whale
//     drops search from 1st to 2nd behind social (the flip)
//   - the mirror tie: campaigns 3 and 6 tie at exactly 42000 confirmed
//     revenue on different shapes (one 38000 monster vs four mediums) —
//     RANK skips 2, DENSE_RANK doesn't, GROUP_CONCAT builds the '3,6' registry
//   - the money ladder: confirmed 745700 / charged (incl the two refunded
//     conversions) 851700 / net of 216800 refunds 634900
//   - the window wall: conversion 44's first touch is EXACTLY 604800s before
//     its conv_ts — eligible inclusive, ineligible strict
//   - the mismatch trio: conversions 21/24/39 where the path's last touch
//     (a C9 email view, a C4 social view, a C5 social CLICK) is not the
//     cookie's campaign — the click-cookie blind spot
//   - the same-second tie: conversion 26's path ends with a C4 view and a C5
//     click at the SAME touched_at — last-touch ties, GROUP_CONCAT '4,5'
//   - the burst: 4 duplicate conversions from ONE session on 2026-06-17 at
//     10:00 / 10:02 / 10:07 / 10:12 — same-session pairs <= 300s: 3, strict
//     (<300): 1, and two pairs sit EXACTLY on the 300s line
//   - the sessionization wall: campaign 2's 06-20 impression run has 14
//     events whose 13 consecutive gaps include exactly ONE of 1800s —
//     sessions under the 1800s gap rule: 13 strict vs 14 inclusive
//   - the spend walls: exactly 5 overspend days (C1 8400>8000, C4 6500>
//     6000, C5 3700>3500, C7 2650>2500, C10 12600>12000) plus C10's 12000
//     EXACTLY on budget (>= catches 6, > catches 5); the fee-drift trio
//     bills 8% instead of 10% (C10's drift row is PAID — the sneakiest)
//   - the refund book: 12 refunds (7 duplicate_charge / 3 chargeback / 2
//     goodwill); one chargeback claims EXACTLY 60000 (>= catches 1, > 0) on
//     the whale itself — the book's largest; two twins at exactly 12000
//   - honest zeros: campaign 11 is dormant (paused, zero impressions, zero
//     spend, zero conversions — the video channel is fully dark); ad 13 was
//     disapproved and never served; display serves impressions but converts
//     nothing (ROAS = 0/0 — the NULLIF lesson); the two organic-direct
//     conversions (31500) belong to NO campaign; email owns no impression
//     inventory at all yet converts 62700; 14 conversions predate the pixel
//     window and have no path
//   - the device tie: 125 impressions split mobile 62 / desktop 62 / tablet 1
//     — an exact two-way tie at the top of the device board

export const DM_MKT_SCHEMA = {
  ddl: `CREATE TABLE campaigns (
  campaign_id        INTEGER PRIMARY KEY,
  name               TEXT NOT NULL,
  channel            TEXT NOT NULL,  -- 'search' | 'social' | 'display' | 'email' | 'video'
  objective          TEXT NOT NULL,  -- 'awareness' | 'consideration' | 'conversion'
  daily_budget_cents INTEGER NOT NULL,
  launch_date        TEXT NOT NULL,
  status             TEXT NOT NULL   -- 'active' | 'paused' | 'completed'
);

CREATE TABLE ads (
  ad_id       INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  format      TEXT NOT NULL,        -- 'image' | 'video' | 'carousel' | 'text'
  headline    TEXT NOT NULL
);

CREATE TABLE impressions (
  impression_id INTEGER PRIMARY KEY,
  ad_id         INTEGER NOT NULL,
  campaign_id   INTEGER NOT NULL,
  imp_ts        INTEGER NOT NULL,   -- epoch seconds; pixel window 2026-05-04 .. 2026-06-29
  device        TEXT NOT NULL,      -- 'mobile' | 'desktop' | 'tablet'
  clicked       INTEGER NOT NULL,   -- 1 = click, 0 = view-only serve
  cpc_cents     INTEGER NOT NULL    -- charged only when clicked = 1, else 0
);

CREATE TABLE sessions (
  session_id       INTEGER PRIMARY KEY,
  session_ts       INTEGER NOT NULL, -- epoch seconds
  utm_source       TEXT NOT NULL,    -- 'google' | 'meta' | 'bing' | 'newsletter' | 'direct'
  utm_campaign_id  INTEGER,          -- NULL on 'direct' (organic) sessions
  device           TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL
);

CREATE TABLE conversions (
  conversion_id INTEGER PRIMARY KEY,
  session_id    INTEGER NOT NULL,
  conv_type     TEXT NOT NULL,      -- 'purchase' | 'signup' | 'trial_start'
  status        TEXT NOT NULL,      -- 'confirmed' | 'pending' | 'duplicate' | 'refunded' | 'cancelled'
  conv_date     TEXT NOT NULL,      -- 'YYYY-MM-DD'
  conv_ts       INTEGER NOT NULL,   -- epoch; the attribution-window anchor
  revenue_cents INTEGER NOT NULL    -- charged snapshot; 0 unless confirmed / refunded
);

CREATE TABLE touchpoints (
  touch_id      INTEGER PRIMARY KEY,
  conversion_id INTEGER NOT NULL,
  campaign_id   INTEGER NOT NULL,
  touch_type    TEXT NOT NULL,      -- 'click' | 'view'
  touched_at    INTEGER NOT NULL    -- epoch; exists only inside the pixel window
);

CREATE TABLE spend (
  spend_id           INTEGER PRIMARY KEY,
  campaign_id        INTEGER NOT NULL,
  spend_date         TEXT NOT NULL,
  media_cents        INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL, -- ROUND(media * 0.10) except the 3 drift rows (8%)
  creative_cents     INTEGER NOT NULL, -- production fee; 0 on most rows
  status             TEXT NOT NULL     -- 'paid' | 'pending' | 'disputed'
);

CREATE TABLE refunds (
  refund_id     INTEGER PRIMARY KEY,
  conversion_id INTEGER NOT NULL,
  reason        TEXT NOT NULL,      -- 'duplicate_charge' | 'chargeback' | 'goodwill'
  amount_cents  INTEGER NOT NULL,
  refund_date   TEXT NOT NULL,
  status        TEXT NOT NULL       -- 'open' | 'approved' | 'denied'
);`,
  tables: [
    { name: "campaigns", note: "12 campaigns across 5 channels — campaign 10 is the whale (46.2% of confirmed revenue), campaigns 3 and 6 tie at 42000, campaign 11 is the dormant video teaser, email owns no impression inventory" },
    { name: "ads", note: "14 creatives — ad 13 was disapproved and never served inside an otherwise-serving campaign" },
    { name: "impressions", note: "125 metered serves inside the pixel window — 47 clicks (cpc charged only there), device tie mobile 62 / desktop 62 / tablet 1, campaign 2's 06-20 run carries the 1800s sessionization wall" },
    { name: "sessions", note: "72 site sessions across 5 utm_sources — direct sessions carry NULL campaign (organic), one 2700s mega session, the burst session spawns 4 duplicate conversions" },
    { name: "conversions", note: "58 conversions, 2026-01 .. 2026-06 — 44 confirmed / 6 pending / 4 duplicate / 2 refunded / 2 cancelled; confirmed revenue 745900 with the 296000 whale at 39.7%" },
    { name: "touchpoints", note: "108 path touches, pixel window only — 3 cookie-vs-path mismatches, one same-second last-touch tie ('4,5'), one first touch EXACTLY on the 604800s window line" },
    { name: "spend", note: "52 daily media bills — platform fee = ROUND(media * 0.10) except the 3 drift rows at 8% (one PAID), 5 overspend days plus one day EXACTLY on budget, creative fees on 5 rows" },
    { name: "refunds", note: "12 refunds (7 duplicate_charge / 3 chargeback / 2 goodwill) — one chargeback EXACTLY 50000 on the whale, twins at 12000; open 5 / approved 4 / denied 3" },
  ],
};
