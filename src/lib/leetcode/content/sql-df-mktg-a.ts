// Deep-dives — Marketing & Attribution A file: ROAS by campaign, first/last
// touch attribution and the email engagement funnel (3 problems: 2 Easy,
// 1 Medium; all three are order:"exact" with a result-level ORDER BY).
// Money columns appear only in dive 1, as INTEGER cents with the _cents
// suffix; roas and the two pct columns are the only REALs. Own tables, own
// seeds, original phrasing — never copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8055 roas-by-campaign ·
// 8056 first-last-touch-attribution · 8057 email-engagement-funnel.
import type { LcSqlDive } from "../types";

export const SQL_DF_MKTG_A: LcSqlDive[] = [
  {
    slug: "roas-by-campaign",
    statement:
      "Paid media lives and dies by one ratio: return on ad spend, the revenue a campaign pulls in divided by the money spent on it. The campaign_spend table holds one row per campaign per day (campaign, day, spend_cents), and attributed_revenue holds (campaign, day, revenue_cents) only for campaign-days that actually earned revenue — a campaign can carry spend for the whole week and never appear in the revenue table. Report one row per campaign: campaign, spend_cents and revenue_cents as the weekly SUMs, roas = ROUND(1.0 * revenue_cents / spend_cents, 2), and rn = RANK() OVER (ORDER BY roas DESC) with ties sharing a rank and the next rank skipped. Campaigns with spend but zero revenue stay in the report at roas 0.0 and rank last, so the LEFT JOIN is not optional. Every campaign's spend is positive in the seed. ORDER BY rn ASC, campaign ASC.",
    examples: [
      {
        input:
          "search-brand spends 30000 cents across the week (seven daily rows) and its seven attributed-revenue rows sum to 132000 cents",
        output: "search-brand · 30000 · 132000 · 4.4 · 1",
        explanation:
          "1.0 * 132000 / 30000 reads exactly 4.4, the best ratio in the seed, so RANK hands it rn 1; the 1.0 multiplier forces float division before the ROUND to 2 decimals.",
      },
      {
        input:
          "social-ads earned 72050 cents on 32000 spend (raw ratio 2.2516) while video-ads earned 90000 on 40000 (raw ratio 2.25 exactly)",
        output: "social-ads · 32000 · 72050 · 2.25 · 2 and video-ads · 40000 · 90000 · 2.25 · 2",
        explanation:
          "Both ratios ROUND to 2.25, RANK gives both campaigns rn 2, and display-retargeting at 1.55 skips to rn 4 — the shared-rank, skip-next behavior that separates RANK from ROW_NUMBER.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: spend_cents and revenue_cents are INTEGER columns and the reported spend_cents and revenue_cents are weekly SUMs that stay INTEGER; roas is the only REAL in the output",
      "PINNED ratio: roas = ROUND(1.0 * revenue_cents / spend_cents, 2) with the 1.0 multiplier forcing float division; spend_cents > 0 for every campaign in the seed, so no divide-by-zero guard is needed",
      "PINNED ranking: rn = RANK() OVER (ORDER BY roas DESC) — campaigns tied at 2 decimals share a rank and the next rank is skipped; campaigns with spend but NO revenue rows report revenue_cents 0 and roas 0.0 (LEFT JOIN, PINNED)",
      "the seed covers 5 campaigns over 2026-09-01 through 2026-09-07, and attributed_revenue rows exist only for days that earned revenue; ORDER BY rn ASC, campaign ASC",
    ],
    primer: {
      hook: "Every Monday morning the marketing lead opens one number first — how much revenue each campaign gave back for every dollar it spent — and this query is that number.",
      concept: [
        "Return on ad spend, or ROAS, is revenue divided by spend for one campaign: put 100 dollars in, get 440 dollars of attributed revenue back, and ROAS reads 4.4. The ratio answers the only question a budget owner asks — if I push another dollar into this campaign, roughly what comes back? Channels below 1.0 lose money on every click, channels above it fund themselves and everything else around them. That is why the first tile on any ads console dashboard is this one ratio per campaign.",
        "The data behind it lives in two places that do not mirror each other. Spend is recorded by the ad platform for every campaign on every day, whether or not anything sold. Revenue only exists where a sale was actually attributed back to the campaign — a day with impressions but no purchases simply has no row in the revenue table. Blank is not zero in a join: an INNER JOIN silently drops the no-revenue campaign from the report entirely, hiding the worst performer instead of displaying it.",
        "The LEFT JOIN is the whole defensive trick: start from spend, attach revenue where it exists, and COALESCE the misses to 0, so the dead campaign shows up at roas 0.0 and ranks last where it belongs. Ranking then uses RANK, not ROW_NUMBER: two campaigns tied at the same rounded ratio share a rank and the next rank is skipped — standard competition behavior, and what a marketing table is expected to show when two campaigns read the same at report precision. The one-row-per-campaign shape falls out of the GROUP BY, and the ORDER BY rn, campaign makes the shared-rank block print deterministically.",
        "One mechanical detail guards the arithmetic: revenue and spend are both integers here, and dividing two integers in this engine truncates toward zero. The 1.0 multiplier promotes the division to floating point before anything rounds, and ROUND trims to two decimals — the precision ad reports actually print. Rank the ROUNDED value, because ties are decided at the precision the business reads.",
      ],
      worked: [
        "Add up the week: search-brand spent 4000, 5000, 4600, 4200, 3900, 4100 and 4200 cents across its seven daily rows, a total of 30000.",
        "Add up its attributed revenue the same way: the seven rows sum to 132000 cents.",
        "Divide with the float guard: 1.0 * 132000 / 30000 = 4.4, and ROUND to 2 decimals leaves 4.4 unchanged.",
        "Rank it: 4.4 is the highest ratio in the seed, so RANK assigns rn 1 to search-brand.",
        "The tie check: social-ads and video-ads both land on 2.25 after rounding, so they share rn 2 and the next campaign starts at rn 4.",
      ],
      glossary: [
        { term: "ROAS", def: "return on ad spend — revenue attributed to a campaign divided by the money spent on it" },
        { term: "attributed revenue", def: "sales credit traced back to the campaign and day that produced them" },
        { term: "LEFT JOIN", def: "a join that keeps every left-side row even when the right side has no match" },
        { term: "RANK", def: "a window function that gives tied rows the same rank and skips the next rank" },
        { term: "outer join guard", def: "the habit of choosing LEFT JOIN plus COALESCE so zero-activity rows survive reporting" },
        { term: "tie", def: "rows equal after rounding that the ranking must treat as one shared position" },
      ],
      reallife: [
        "Growth marketing teams run this query as a weekly ritual, usually straight against the warehouse on Monday morning. The paid-media manager reads it top to bottom: shift budget toward the top of the table, pause whatever sits at roas 0.0 with real spend behind it. Finance reads the same table bottom-up, because a campaign with heavy spend and no attributed revenue is a budget leak someone has to explain in the monthly business review.",
        "What breaks is the join, not the math. A revenue table that only logs converting days makes an INNER JOIN look correct in testing — every campaign happens to have revenue that week — and the bug surfaces the week a new campaign launches, spends for days, converts nothing, and simply vanishes from the deck it was supposed to embarrass. The other classic failure is integer division: 132000 divided by 30000 in integer land truncates to 4, and every ratio in the table reads as a whole number nobody can act on.",
      ],
      where: "Performance marketers, growth analysts and marketing-ops engineers run it weekly, and SQL screens at Google and Amazon hand candidates exactly this spend-versus-revenue shape.",
    },
    breakdown: [
      "ROAS is a ratio of two aggregates, and each aggregate carries a convention the number depends on. spend_cents sums every daily row for the campaign, because spend is recorded whether or not anything sold. revenue_cents sums only the days that appear in attributed_revenue, since attribution tables log conversions, not attempts. The pinned formula divides the two weekly SUMs directly — weekly revenue over weekly spend — and never averages daily ratios, which would weight a 10-cent test day as heavily as a 500-dollar Saturday.",
      "The zero-revenue campaign is the trap the table is built around. podcast-sponsorships spent 18000 cents across the week and its revenue rows do not exist, because attributed_revenue only carries rows for days that earned something. An INNER JOIN reads that absence as a filter and drops the campaign, shipping 4 rows instead of 5 and erasing the worst performer from the exact report meant to catch it. The LEFT JOIN keeps the spend row, COALESCE stamps the missing revenue at 0, and the campaign prints at roas 0.0, ranked last.",
      "Ranking uses RANK() OVER (ORDER BY roas DESC), and the seed engineers the difference between RANK and ROW_NUMBER: social-ads and video-ads both round to 2.25, so RANK gives both rn 2 and display-retargeting skips to rn 4. ROW_NUMBER would break the tie arbitrarily and hand video-ads rn 3, a table a marketing lead would read as a strict hierarchy the data does not support. The final ORDER BY rn ASC, campaign ASC makes the shared-rank block deterministic, alphabetical inside the tie.",
    ],
    edges: [
      "INNER JOIN to attributed_revenue drops podcast-sponsorships entirely: the report ships 4 rows instead of 5, and the only campaign that burned 18000 cents with nothing to show is the one that disappears — pinned row count 4.",
      "Swap RANK for ROW_NUMBER and the tie breaks: video-ads reads rn 3 instead of sharing rn 2, and the table reads 1, 2, 3, 4, 5 — pinned, while the correct table reads 1, 2, 2, 4, 5 with rank 3 skipped.",
      "Drop the 1.0 multiplier and integer division truncates every ratio: search-brand reads 4.0 instead of 4.4, both 2.25s read 2.0, display-retargeting reads 1.0 instead of 1.55 and podcast stays 0.0 — pinned values 4.0, 2.0, 2.0, 1.0, 0.0; the tie survives, the accuracy does not.",
      "Forget COALESCE on the revenue side and podcast-sponsorships prints revenue_cents NULL with roas NULL — pinned, because the zero-revenue campaign must read 0 and 0.0; a NULL ratio sorts as missing data in every BI tool instead of reading as the failure it is.",
    ],
    ladder: [
      { title: "Brute force — two spreadsheets and a calculator", body: "Pull each campaign's spend total and revenue total by hand, divide, and sort the five ratios on paper. It works for five campaigns; forty campaigns refreshed daily is why the SQL exists, and the zero-revenue row is the one the hand version always forgets." },
      { title: "The pattern — SUM both sides, LEFT JOIN, rank", body: "Aggregate spend and revenue per campaign in two CTEs, LEFT JOIN revenue onto spend with COALESCE 0, compute ROUND(1.0 * revenue / spend, 2), and wrap RANK() OVER (ORDER BY roas DESC) around the result. One statement, five rows, the dead campaign still in the table." },
      { title: "The optimal idea — aggregate before joining, rank the rounded value", body: "O(n) over the spend and revenue rows plus one sort for the rank. The durable rules: aggregate BEFORE joining so a missing day cannot erase a campaign, force float division with the 1.0 multiplier, and rank the ROUNDED ratio, because ties are decided at the precision the report prints." },
    ],
    approach: "per-campaign SUM CTEs, LEFT JOIN revenue with COALESCE 0, ROUND(1.0 * revenue / spend, 2), RANK() OVER (ORDER BY roas DESC), ORDER BY rn, campaign",
    schema: {
      ddl: `CREATE TABLE campaign_spend (
  campaign     TEXT NOT NULL,
  day          TEXT NOT NULL,      -- 'YYYY-MM-DD'
  spend_cents  INTEGER NOT NULL,
  PRIMARY KEY (campaign, day)
);
CREATE TABLE attributed_revenue (
  campaign      TEXT NOT NULL,
  day           TEXT NOT NULL,     -- 'YYYY-MM-DD'
  revenue_cents INTEGER NOT NULL,  -- rows exist ONLY for campaign-days that earned revenue
  PRIMARY KEY (campaign, day)
);`,
      seed: `-- One week of paid media, 2026-09-01 .. 2026-09-07. Spend exists for all
-- five campaigns on all seven days, and attributed_revenue only carries days
-- that earned revenue, so podcast-sponsorships (18000 cents spent, zero
-- revenue) never appears there. Weekly totals: search-brand 30000 / 132000
-- (roas 4.4), social-ads 32000 / 72050 (raw 2.2516, rounds to 2.25),
-- video-ads 40000 / 90000 (2.25 exact), display-retargeting 25000 / 38750
-- (1.55), podcast-sponsorships 18000 / 0 (roas 0.0, ranks last).
INSERT INTO campaign_spend (campaign, day, spend_cents) VALUES
  ('search-brand', '2026-09-01', 4000),
  ('search-brand', '2026-09-02', 5000),
  ('search-brand', '2026-09-03', 4600),
  ('search-brand', '2026-09-04', 4200),
  ('search-brand', '2026-09-05', 3900),
  ('search-brand', '2026-09-06', 4100),
  ('search-brand', '2026-09-07', 4200),
  ('social-ads', '2026-09-01', 5000),
  ('social-ads', '2026-09-02', 4500),
  ('social-ads', '2026-09-03', 4600),
  ('social-ads', '2026-09-04', 4400),
  ('social-ads', '2026-09-05', 4500),
  ('social-ads', '2026-09-06', 4500),
  ('social-ads', '2026-09-07', 4500),
  ('video-ads', '2026-09-01', 6000),
  ('video-ads', '2026-09-02', 5500),
  ('video-ads', '2026-09-03', 5800),
  ('video-ads', '2026-09-04', 6200),
  ('video-ads', '2026-09-05', 5600),
  ('video-ads', '2026-09-06', 5400),
  ('video-ads', '2026-09-07', 5500),
  ('display-retargeting', '2026-09-01', 3500),
  ('display-retargeting', '2026-09-02', 3700),
  ('display-retargeting', '2026-09-03', 3500),
  ('display-retargeting', '2026-09-04', 3600),
  ('display-retargeting', '2026-09-05', 3500),
  ('display-retargeting', '2026-09-06', 3600),
  ('display-retargeting', '2026-09-07', 3600),
  ('podcast-sponsorships', '2026-09-01', 3000),
  ('podcast-sponsorships', '2026-09-02', 2400),
  ('podcast-sponsorships', '2026-09-03', 2700),
  ('podcast-sponsorships', '2026-09-04', 2500),
  ('podcast-sponsorships', '2026-09-05', 2600),
  ('podcast-sponsorships', '2026-09-06', 2400),
  ('podcast-sponsorships', '2026-09-07', 2400);
INSERT INTO attributed_revenue (campaign, day, revenue_cents) VALUES
  ('search-brand', '2026-09-01', 18000),
  ('search-brand', '2026-09-02', 21000),
  ('search-brand', '2026-09-03', 19500),
  ('search-brand', '2026-09-04', 17400),
  ('search-brand', '2026-09-05', 15900),
  ('search-brand', '2026-09-06', 19800),
  ('search-brand', '2026-09-07', 20400),
  ('social-ads', '2026-09-01', 10250),
  ('social-ads', '2026-09-02', 10300),
  ('social-ads', '2026-09-03', 10350),
  ('social-ads', '2026-09-04', 10200),
  ('social-ads', '2026-09-05', 10300),
  ('social-ads', '2026-09-06', 10350),
  ('social-ads', '2026-09-07', 10300),
  ('video-ads', '2026-09-01', 12000),
  ('video-ads', '2026-09-02', 13500),
  ('video-ads', '2026-09-03', 13050),
  ('video-ads', '2026-09-04', 13950),
  ('video-ads', '2026-09-05', 12600),
  ('video-ads', '2026-09-06', 12375),
  ('video-ads', '2026-09-07', 12525),
  ('display-retargeting', '2026-09-01', 5000),
  ('display-retargeting', '2026-09-02', 5900),
  ('display-retargeting', '2026-09-03', 5450),
  ('display-retargeting', '2026-09-04', 5500),
  ('display-retargeting', '2026-09-05', 5300),
  ('display-retargeting', '2026-09-06', 5700),
  ('display-retargeting', '2026-09-07', 5900);`,
      tables: [
        { name: "campaign_spend", note: "35 rows — 5 campaigns × 7 days 2026-09-01..2026-09-07, every campaign-day has spend" },
        { name: "attributed_revenue", note: "28 rows — 4 campaigns × 7 days; podcast-sponsorships has no revenue rows at all" },
      ],
    },
    code: `WITH spend AS (
    -- weekly spend per campaign: one SUM row per campaign
    SELECT campaign, SUM(spend_cents) AS spend_cents
    FROM campaign_spend
    GROUP BY campaign
),
revenue AS (
    -- weekly attributed revenue per campaign: rows exist only for earning days
    SELECT campaign, SUM(revenue_cents) AS revenue_cents
    FROM attributed_revenue
    GROUP BY campaign
),
combined AS (
    -- LEFT JOIN keeps the zero-revenue campaign, and COALESCE stamps its revenue 0
    SELECT
        s.campaign,
        s.spend_cents,
        COALESCE(r.revenue_cents, 0) AS revenue_cents,
        -- the 1.0 multiplier forces float division before the ROUND
        ROUND(1.0 * COALESCE(r.revenue_cents, 0) / s.spend_cents, 2) AS roas
    FROM spend s
    LEFT JOIN revenue r ON r.campaign = s.campaign
)
SELECT
    campaign,
    spend_cents,
    revenue_cents,
    roas,
    -- RANK: ties share a rank and the next rank is skipped (pinned)
    RANK() OVER (ORDER BY roas DESC) AS rn
FROM combined
ORDER BY rn ASC, campaign ASC;`,
    walkthrough: [
      "The spend CTE folds seven daily rows per campaign into one SUM: search-brand 30000, social-ads 32000, video-ads 40000, display-retargeting 25000, podcast-sponsorships 18000. The revenue CTE folds its table the same way, but podcast-sponsorships has no rows there at all, so that CTE simply has no row for it. Aggregating before the join matters: joining the raw daily tables first would filter the campaign out per day, and no later aggregation could recover it.",
      "The combined CTE LEFT JOINs revenue onto spend by campaign and stamps COALESCE(revenue, 0): four campaigns attach their sums — 132000, 72050, 90000, 38750 — and podcast-sponsorships reads 0. The ratio runs with the 1.0 guard, so 132000 divided by 30000 evaluates as 4.4 and not the truncated integer 4, while 72050 over 32000 evaluates 2.2516 and rounds to 2.25. RANK() then orders the rounded roas DESC: 4.4 takes rn 1, the two 2.25s share rn 2, 1.55 lands on rn 4 and 0.0 closes the table at rn 5.",
      "The engine ships five rows in rn-then-campaign order: search-brand 4.4 at rank 1, social-ads then video-ads sharing rank 2 (alphabetical inside the tie), display-retargeting 1.55 at rank 4, podcast-sponsorships 0.0 at rank 5. Every money cell is an INTEGER SUM; only roas leaves the integers. The three probe variants each break one pinned thing — the INNER JOIN drops row 5, ROW_NUMBER renumbers the tie, integer division flattens every ratio — and the check script asserts all three wrong tables exactly.",
    ],
    time: "O(S + R) over the S spend rows and R revenue rows for the two aggregations, plus O(C log C) to rank the C campaigns",
    space: "O(C) — one aggregated row per campaign in each CTE",
    followUps: [
      "Attribute revenue with a 1-day lag — revenue on day d belonging to the previous day's spend — and recompute the table: which campaign's roas moves most when purchases are dated to the click's day instead of the purchase day?",
      "Add a cumulative-spend pacing column — SUM(spend_cents) OVER (PARTITION BY campaign ORDER BY day) — and flag the day each campaign crossed half its weekly budget; what does that day say about the campaigns that never converted?",
    ],
    related: ["ab-test-conversion-lift", "chargeback-rate-ranking", "funnel-step-conversion"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "first-last-touch-attribution",
    statement:
      "A conversion rarely happens on the first ad someone sees — attribution asks WHICH touch started the journey and which one closed it. The touches table holds every marketing touch (touch_id, user_id, channel, touch_date) and conversions holds completed conversions (conversion_id, user_id, conversion_date). For each conversion, the candidate touches are that same user's touches inside the PINNED 30-day lookback: the 29 days before the conversion date plus the conversion day itself, inclusive on both ends. Report conversion_id, first_channel and last_channel — FIRST_VALUE and LAST_VALUE over the in-window touches ordered by touch_date then touch_id, so same-day ties break to the LOWER touch_id first and the HIGHER touch_id last. A conversion with no in-window touch reports 'none' for both channels. ORDER BY conversion_id ASC.",
    examples: [
      {
        input:
          "conversion 1 — user 101 converted 2026-09-20; their in-window touches read Meta 2026-09-01, Email 2026-09-08, Google 2026-09-15, while a TikTok touch on 2026-08-10 sits outside the lookback",
        output: "1 · Meta · Google",
        explanation:
          "The window [2026-08-22, 2026-09-20] keeps the three September touches, FIRST_VALUE reads the earliest channel Meta, LAST_VALUE with the explicit full frame reads the latest channel Google — the classic first-versus-last disagreement in one row.",
      },
      {
        input:
          "conversion 5 — user 105 converted 2026-09-22; two touches land the same day 2026-09-10, Email with touch_id 11 and Google with touch_id 12",
        output: "5 · Email · Google",
        explanation:
          "The window orders by touch_date then touch_id, so Email (id 11) is first and Google (id 12) is last; without the touch_id tiebreak the same-day pair has no deterministic order.",
      },
    ],
    constraints: [
      "PINNED window: candidate touches for a conversion are the SAME user's touches with touch_date BETWEEN date(conversion_date, '-29 days') AND conversion_date — the 30-day lookback means 29 days back plus the day itself, inclusive on both ends",
      "PINNED tiebreak: the per-conversion window orders by touch_date ASC, touch_id ASC, so same-day touches resolve by touch_id — the lowest id is first_channel, the highest id is last_channel",
      "a conversion with NO in-window touch reports 'none' for both channels (LEFT JOIN plus COALESCE, PINNED); touches outside the window and touches from OTHER users never count",
      "channels are plain TEXT labels and the output has no money and no REAL columns; ORDER BY conversion_id ASC",
    ],
    primer: {
      hook: "Marketers argue forever about which ad deserved the sale — this query puts the two champion answers, first touch and last touch, side by side in one pass.",
      concept: [
        "A customer almost never buys on the first nudge. They see a social ad and ignore it, get an email a week later, search the brand name, click a search ad, and only then purchase. Marketing touches are those nudges, and each one arrived through a channel — paid social, email, search. Attribution is the argument about credit: which of those channels actually caused the purchase?",
        "First-touch attribution gives all the credit to the touch that STARTED the journey — it rewards channels that create demand and introduce the brand. Last-touch attribution gives everything to the touch that CLOSED it — it rewards channels that harvest demand and finish the sale. Neither is wrong; they answer different questions, which is exactly why reporting tools show both columns built from the same touch list.",
        "Real journeys also need a boundary, and the standard boundary is the lookback window: only touches within the last N days before the conversion count. A 30-day lookback normally means the 29 days before the conversion plus the conversion day itself — 30 calendar days total, inclusive on both ends. Anything older is treated as an expired journey, and a touch belonging to a different user is never relevant at all.",
        "Two mechanical details decide whether the SQL tells the truth. Window functions FIRST_VALUE and LAST_VALUE read the first and last row of a partition, but LAST_VALUE carries a famous default-frame trap — without an explicit frame it stops at the current row, so it must be pinned with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. And a conversion with no in-window touch must still print a row: the LEFT JOIN plus COALESCE pattern keeps it, stamped with a placeholder instead of vanishing.",
      ],
      worked: [
        "A user converts on 2026-09-20; the 30-day lookback window runs 2026-08-22 through 2026-09-20 inclusive.",
        "Their touches inside the window: Meta on 09-01, Email on 09-08, Google on 09-15; a TikTok touch from 08-10 is too old and drops out.",
        "First touch: Meta, the earliest by date. Last touch: Google, the latest by date.",
        "First-touch reporting books the sale to Meta; last-touch reporting books it to Google; the query prints both so the argument has data.",
      ],
      glossary: [
        { term: "marketing touch", def: "one tracked exposure of a user to a channel, logged with its date" },
        { term: "attribution", def: "the rule that decides which touch earns credit for a conversion" },
        { term: "first-touch model", def: "credit given entirely to the earliest touch of the journey" },
        { term: "last-touch model", def: "credit given entirely to the latest touch of the journey" },
        { term: "lookback window", def: "the day range before a conversion inside which touches still count" },
        { term: "default frame", def: "the rows a window function reads when no ROWS BETWEEN clause is written — LAST_VALUE stops at the current row without one" },
      ],
      reallife: [
        "Lifecycle-marketing platforms live in this exact report. The brand team reads first_channel to decide which awareness channels deserve new budget, while the performance team reads last_channel to optimize the closing path — and the two columns regularly disagree, which is the point. When the same conversion credits Meta first-touch and Google last-touch, the budget conversation becomes assisted demand versus captured demand, and those numbers drive real reallocations every quarter.",
        "What breaks: the lookback boundary. A window built one day too narrow silently drops the boundary touch, and a first-touch report that should say Email says nothing at all. The other classic failure is LAST_VALUE without its frame clause — on most rows it accidentally looks correct, then flips a last_channel to the wrong channel the day two touches share a date. Audits catch both by re-running one conversion by hand and comparing against the report row.",
      ],
      where: "Lifecycle and performance marketers, marketing analysts and CRM engineers run it weekly, and SQL screens at HubSpot and Mailchimp hand candidates exactly this touches-and-conversions shape.",
    },
    breakdown: [
      "The join is the whole geometry of the problem: every conversion on the left, that user's touches attached only when they fall inside the pinned window — same user, touch_date on or after date(conversion_date, '-29 days') and on or before the conversion day itself. A LEFT JOIN keeps conversions with no qualifying touch as a single row of NULLs, which is what later becomes 'none' instead of a vanished row. The window partitions by conversion_id, so two conversions for the same user each get their own copy of the relevant touches.",
      "Inside each partition the order is touch_date ASC, touch_id ASC — dates first, and when two touches share a date the LOWER touch_id comes first. FIRST_VALUE reads the earliest row's channel; LAST_VALUE must read the LATEST row's channel, and the pinned frame ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING is what makes that true. Drop the frame and the engine's default (RANGE UNBOUNDED PRECEDING AND CURRENT ROW) cuts the window off at the current row, so LAST_VALUE degenerates into the current row's own channel — the silent bug this problem pins on purpose.",
      "The COALESCE happens last, at the presentation layer: a partition whose only row carries a NULL channel reports 'none' for both columns, and a partition with real touches never contains a NULL row, so the placeholder cannot leak into a real journey. Because both window values are constant across a partition — FIRST_VALUE always reads its first row and the full-frame LAST_VALUE always reads its last — the query collapses to one row per conversion by keeping rn = 1 of the ROW_NUMBER over the same window order. Ordering the window by touch_id as well as date is not decoration either: the seed plants a same-day pair whose first and last channels differ, and only the id tiebreak makes the answer deterministic.",
    ],
    edges: [
      "Build the lower bound strictly (touch_date > date(conversion_date, '-29 days')) and the day -29 boundary touch disappears: conversion 3 falls from Email / Email to none / none — pinned, its only in-window touch sits exactly on day -29.",
      "Stretch the window to 30 days back (date(conversion_date, '-30 days')) and the dead touch revives: conversion 4 reads Meta / Meta instead of none / none — pinned, its only touch sits exactly on day -30 and must stay outside.",
      "Forget the user match in the join and touches cross-contaminate: conversion 6 (a user with no touches at all) reads Meta / Google instead of none / none, and conversion 1's first_channel flips from Meta to Email because another user's day -29 boundary touch becomes the earliest row — pinned both.",
      "Write LAST_VALUE without the frame clause and collapse to one row per conversion from the earliest row: the default frame (RANGE UNBOUNDED PRECEDING AND CURRENT ROW) makes LAST_VALUE return the CURRENT row's channel, so conversion 1 reads last_channel Meta instead of Google and conversion 5 reads Email instead of Google — pinned; conversions 2 and 3 agree by accident because their first and last channels are the same.",
    ],
    ladder: [
      { title: "Brute force — eyeball every conversion", body: "Print each user's touches next to each conversion date, cross out everything older than 30 days, and circle the first and last survivor. Six conversions is fine; sixty thousand conversions with a stale-window rule is not, and the hand version never notices same-day ties." },
      { title: "The pattern — LEFT JOIN the window, window over the pairs", body: "LEFT JOIN touches on user match plus the pinned date range, then FIRST_VALUE and LAST_VALUE with PARTITION BY conversion_id ORDER BY touch_date, touch_id — LAST_VALUE carrying ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. COALESCE the NULLs to 'none' in the outer SELECT." },
      { title: "The optimal idea — the boundary lives in the JOIN, the frame lives in the OVER", body: "O(P log P) over the P conversion-touch pairs — one sort per partition for the window. The durable rules: put the lookback in the join predicate so expired touches never enter, pin the frame explicitly, and break same-day ties with a monotone id." },
    ],
    approach: "LEFT JOIN touches per conversion on user plus pinned 29-day-back window, FIRST_VALUE and full-frame LAST_VALUE PARTITION BY conversion_id ORDER BY touch_date, touch_id, COALESCE 'none'",
    schema: {
      ddl: `CREATE TABLE touches (
  touch_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  channel    TEXT NOT NULL,
  touch_date TEXT NOT NULL         -- 'YYYY-MM-DD'
);
CREATE TABLE conversions (
  conversion_id   INTEGER PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  conversion_date TEXT NOT NULL     -- 'YYYY-MM-DD'
);`,
      seed: `-- Touches for five users, while user 106 (conversion 6) has none. Decoys outside
-- every window: touch 1 (TikTok 2026-08-10) and touch 8 (Meta 2026-08-15).
-- Boundary pair: touch 9 (Email 2026-08-22) is exactly day -29 for
-- conversion 3 (2026-09-20, IN) and touch 10 (Meta 2026-08-22) is exactly
-- day -30 for conversion 4 (2026-09-21, OUT). Same-day tie: touches 11 and
-- 12 (user 105, 2026-09-10) resolve by touch_id — Email first, Google last.
INSERT INTO touches (touch_id, user_id, channel, touch_date) VALUES
  (1,  101, 'TikTok', '2026-08-10'),
  (2,  101, 'Meta',   '2026-09-01'),
  (3,  101, 'Email',  '2026-09-08'),
  (4,  101, 'Google', '2026-09-15'),
  (5,  102, 'Google', '2026-09-02'),
  (6,  102, 'Google', '2026-09-11'),
  (7,  102, 'Google', '2026-09-18'),
  (8,  103, 'Meta',   '2026-08-15'),
  (9,  103, 'Email',  '2026-08-22'),
  (10, 104, 'Meta',   '2026-08-22'),
  (11, 105, 'Email',  '2026-09-10'),
  (12, 105, 'Google', '2026-09-10');
INSERT INTO conversions (conversion_id, user_id, conversion_date) VALUES
  (1, 101, '2026-09-20'),
  (2, 102, '2026-09-20'),
  (3, 103, '2026-09-20'),
  (4, 104, '2026-09-21'),
  (5, 105, '2026-09-22'),
  (6, 106, '2026-09-25');`,
      tables: [
        { name: "touches", note: "12 rows — users 101..105 carry touches, user 106 has none; out-of-window decoys on 08-10 and 08-15, the day -29 / day -30 boundary pair, and one same-day tie" },
        { name: "conversions", note: "6 rows — conversion_ids 1..6 for users 101..106, dates 2026-09-20 through 2026-09-25" },
      ],
    },
    code: `WITH paired AS (
    -- every conversion paired with the SAME user's touches inside the PINNED
    -- 30-day lookback: [conversion_date - 29 days, conversion_date] inclusive
    SELECT
        c.conversion_id,
        t.channel,
        t.touch_date,
        t.touch_id
    FROM conversions c
    LEFT JOIN touches t
        ON t.user_id = c.user_id
       AND t.touch_date >= date(c.conversion_date, '-29 days')
       AND t.touch_date <= c.conversion_date
),
attributed AS (
    -- first/last touch per conversion, ordered by touch_date then touch_id.
    -- LAST_VALUE needs the explicit full frame — the default frame stops at
    -- the current row and degenerates into the current row's channel.
    -- Both window values are CONSTANT across a partition, so the rn = 1 row
    -- carries the canonical (first, last) pair for its conversion
    SELECT
        conversion_id,
        ROW_NUMBER() OVER w AS rn,
        FIRST_VALUE(channel) OVER w AS first_channel,
        LAST_VALUE(channel) OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
            AND UNBOUNDED FOLLOWING) AS last_channel
    FROM paired
    WINDOW w AS (PARTITION BY conversion_id ORDER BY touch_date, touch_id)
)
SELECT
    conversion_id,
    -- a conversion with no in-window touch carries NULL channels: 'none'
    COALESCE(first_channel, 'none') AS first_channel,
    COALESCE(last_channel, 'none') AS last_channel
FROM attributed
WHERE rn = 1
ORDER BY conversion_id ASC;`,
    walkthrough: [
      "The paired CTE drives from conversions and LEFT JOINs touches on two conditions: user_id match and touch_date BETWEEN date(conversion_date, '-29 days') AND conversion_date. Conversion 1 (2026-09-20) pairs with user 101's three September touches — Meta 09-01, Email 09-08, Google 09-15 — while the TikTok touch of 08-10 fails the lower bound and never enters. Conversion 4 (2026-09-21) pairs with nothing: its user's only touch sits on 08-22, one day outside the [08-23, 09-21] window, so the LEFT JOIN emits a single all-NULL row.",
      "The attributed CTE windows over those pairs, PARTITION BY conversion_id ORDER BY touch_date, touch_id. Conversion 1 reads first_channel Meta and last_channel Google; conversion 5's two same-day touches resolve by touch_id — Email (id 11) first, Google (id 12) last; conversion 3's single boundary touch yields Email on both ends. The full-frame clause is what lets LAST_VALUE see the END of each partition; FIRST_VALUE needs no frame because the default frame always contains the first row.",
      "The outer SELECT keeps rn = 1 of each partition — one row per conversion — and stamps COALESCE(channel, 'none') on both columns, shipping six rows ordered by conversion_id: (1, Meta, Google), (2, Google, Google), (3, Email, Email), (4, none, none), (5, Email, Google), (6, none, none). The four probe variants each poison one pinned thing: the strict lower bound erases conversion 3, the 30-day stretch revives conversion 4, the missing user match fills conversion 6 with someone else's journey, and the frameless LAST_VALUE rewrites conversion 1's and conversion 5's last channel. The check script asserts every one of those wrong tables exactly.",
    ],
    time: "O(C + P log P) — the C conversions scan once, and the P conversion-touch pairs sort once per window partition",
    space: "O(P) — the paired conversion-touch rows materialize before the projection",
    followUps: [
      "Split the credit — report each conversion's first, last AND middle channels for journeys of three or more touches; which window positions does the frame clause need then?",
      "Count assisted conversions per channel — conversions where the channel appears in-window but is neither first nor last — and rank channels by assist share; how does that leaderboard differ from the last-touch ranking on this seed?",
    ],
    related: ["funnel-step-conversion", "sessionize-events", "feature-adoption-windows"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "email-engagement-funnel",
    statement:
      "Email marketing reads like a funnel: a campaign is sent, most of it is delivered, some of it is opened, fewer emails are clicked, and a handful of readers convert. The email_events table holds one row per user per event per campaign (campaign, user_id, event) with event one of 'sent', 'delivered', 'opened', 'clicked' — counts must read COUNT(DISTINCT user_id) so the one duplicated event row planted in the seed cannot inflate anything. The email_conversions table holds (campaign, user_id) for readers who converted; conversion needs neither an open nor a click. Report per campaign: campaign, sent, delivered, opened, clicked, converted, open_pct = ROUND(100.0 * opened / delivered, 2) and click_pct = ROUND(100.0 * clicked / opened, 2) — each rate divides by the PREVIOUS step, and a campaign with opened = 0 reports click_pct 0.0 via the COALESCE guard. ORDER BY campaign ASC.",
    examples: [
      {
        input:
          "spring-sale — sent to 10 users, 9 delivered, 6 opened, 3 clicked, 2 converted",
        output: "spring-sale · 10 · 9 · 6 · 3 · 2 · 66.67 · 50.0",
        explanation:
          "open_pct divides opens by DELIVERED (100.0 * 6 / 9 = 66.67) and click_pct divides clicks by OPENED (100.0 * 3 / 6 = 50.0) — each step's denominator is the step before it, never sent.",
      },
      {
        input:
          "newsletter-weekly — 8 sent, only 3 delivered (the rest landed in spam), 0 opened, 0 clicked, 0 converted",
        output: "newsletter-weekly · 8 · 3 · 0 · 0 · 0 · 0.0 · 0.0",
        explanation:
          "open_pct reads 100.0 * 0 / 3 = 0.0, and click_pct would divide by opened = 0 — the engine turns that into NULL, the COALESCE guard stamps 0.0, and the spam story shows up as a collapsed funnel instead of a hole in the report.",
      },
    ],
    constraints: [
      "counts are COUNT(DISTINCT user_id) per event via conditional aggregation; the seed plants exactly one duplicated event row (a spring-sale open), so any COUNT(*) read inflates opened by one (PINNED)",
      "PINNED rates: open_pct = ROUND(100.0 * opened / delivered, 2) and click_pct = ROUND(100.0 * clicked / opened, 2) — each denominator is the PREVIOUS step; converted counts rows in email_conversions and sits OUTSIDE both rates",
      "a campaign with opened = 0 reports click_pct 0.0 (COALESCE guard, PINNED); delivered > 0 for every campaign in the seed, so open_pct needs no guard",
      "email_conversions may hold a user who never clicked (conversion without engagement is real); the seed has 3 campaigns; ORDER BY campaign ASC",
    ],
    primer: {
      hook: "Every email campaign tells the same five-step story — sent, delivered, opened, clicked, converted — and the two drop-off numbers between those steps decide what the CRM team fixes next.",
      concept: [
        "An email funnel starts before anyone sees anything: the platform sends N copies, the inbox accepts most and spam filters swallow the rest, readers open some of what arrived, click links inside fewer still, and a handful actually buy. Each stage is a COUNT of distinct users who reached it. The funnel shape — every stage no bigger than the one before — is what makes email readable at a glance.",
        "The rates are what drive action, and each rate has a pinned denominator: the step IMMEDIATELY before it. Open rate divides opens by delivered, because an email that never landed could not be opened — dividing by sent would blame the copy for a spam-filter problem. Click rate divides clicks by opened, because a click requires an open first — dividing by delivered would hide a boring subject line behind a delivery problem.",
        "Conditional aggregation builds the whole funnel in one pass: COUNT(DISTINCT CASE WHEN event = 'opened' THEN user_id END) counts the openers without a self join per step. The DISTINCT is not decoration — event feeds duplicate rows under retries, and one planted double-open must not turn into a phantom opener. COUNT DISTINCT counts users, not events, which is the honest unit for a funnel about people.",
        "One guard completes the contract: if zero users opened, the click rate divides by zero. SQLite returns NULL for division by zero instead of failing, and COALESCE converts that NULL to 0.0 — a collapsed funnel is a number (zero), not a hole in the report. The same honesty keeps zero-conversion campaigns printing converted = 0 rather than disappearing from the table.",
      ],
      worked: [
        "A campaign sends to 10 users: 9 are delivered, so one bounced at the inbox.",
        "6 of the 9 delivered were opened: open rate = 100.0 * 6 / 9 = 66.67 percent — divided by delivered, not sent.",
        "3 of the 6 openers clicked: click rate = 100.0 * 3 / 6 = 50.0 percent — divided by opened, not delivered.",
        "One reader converts without ever clicking: converted = 1 sits beside the funnel, outside both rates.",
      ],
      glossary: [
        { term: "email funnel", def: "the sent-delivered-opened-clicked-converted pipeline every campaign moves through" },
        { term: "open rate", def: "opens divided by delivered — how often an arrived email gets looked at" },
        { term: "click rate", def: "clicks divided by opened — how often an opened email earns a click" },
        { term: "conditional aggregation", def: "COUNT or SUM steered by CASE to build several measures in one pass" },
        { term: "deliverability", def: "the share of sent email that actually reaches the inbox instead of spam" },
        { term: "COUNT DISTINCT", def: "counts unique users, immune to duplicated event rows" },
      ],
      reallife: [
        "CRM and lifecycle teams live inside this query daily. The deliverability engineer reads the sent-to-delivered gap — a campaign that lands more than half its sends in spam has a sender-reputation problem no subject line can fix. The content team reads open rate for subject lines and send times; the product team reads click rate for offer strength; and the converter-who-never-clicked row is how forwarded emails and dark social show up in the data.",
        "What breaks: denominators. A dashboard that divides opens by sent makes a spam-folder disaster look like a copywriting failure, and the team rewrites a subject line that was never the problem. The other classic bug is COUNT(*) on an event feed with retries — one duplicated open inflates the funnel, a campaign looks healthier than it is, and the weekly readout sends budget toward noise. Funnel builders also guard the converted column: a conversion without a click is real and must not be dropped by an over-eager inner join.",
      ],
      where: "CRM managers, lifecycle marketers and marketing-analytics engineers run it per send, and SQL screens at Klaviyo and Shopify hand candidates exactly this funnel-pivot shape.",
    },
    breakdown: [
      "The whole funnel is one GROUP BY campaign over email_events with four conditional counts — COUNT(DISTINCT CASE WHEN event = 'sent' THEN user_id END) and its three siblings — plus the converted count joined in from email_conversions. The LEFT JOIN to conversions fans rows out, because every event row of a campaign multiplies by that campaign's conversion users, but COUNT(DISTINCT user_id) is immune to the fan-out AND to the duplicated open row the seed plants. That immunity is the reason the contract pins DISTINCT: the same counts with COUNT(*) read opened 7 where the truth is 6.",
      "The rates run in an outer SELECT so the denominators are the funnel's own counts, not raw table reads. open_pct = ROUND(100.0 * opened / delivered, 2) measures arrived-then-seen; click_pct = ROUND(100.0 * clicked / opened, 2) measures seen-then-acted. Swapping either denominator changes the story silently — opens over sent punishes a deliverability problem on the copy line, clicks over delivered flatters a weak subject line — which is why both are pinned and both get probe variants in the check script.",
      "The zero-open guard matters because this engine divides by zero into NULL rather than an error: newsletter-weekly has opened = 0, so the naked click-rate expression evaluates NULL and COALESCE replaces it with 0.0. The report must show a collapsed funnel as zeros — sent 8, delivered 3, opened 0, clicked 0 — because a NULL rate sorts wrong, renders as a gap and reads as missing data instead of the spam catastrophe it is. Every campaign keeps delivered > 0 in the seed, so only the click rate needs the guard.",
    ],
    edges: [
      "Divide open_pct by sent instead of delivered and spring-sale reads 60.0 instead of 66.67 — pinned; newsletter-weekly stays 0.0 and product-launch happens to agree at 83.33 because all six of its sends were delivered.",
      "Divide click_pct by delivered instead of opened and the curiosity story hides: product-launch reads 16.67 instead of 20.0 and spring-sale reads 33.33 instead of 50.0 — pinned both.",
      "Swap COUNT(DISTINCT user_id) for COUNT(*) and the planted duplicate bites: spring-sale's opened reads 7 instead of 6, open_pct 77.78 instead of 66.67 and click_pct 42.86 instead of 50.0 — pinned, all three.",
      "Drop the COALESCE guard and newsletter-weekly's click_pct prints NULL instead of 0.0 — pinned; division by zero yields NULL in this engine, and a NULL rate renders as a hole in every BI tool.",
    ],
    ladder: [
      { title: "Brute force — one query per step", body: "Run five separate GROUP BY queries — one per event plus conversions — and stitch the numbers together in a spreadsheet. It works once, but the rates get computed by hand, the denominators drift, and nobody can rerun it tomorrow without redoing the arithmetic." },
      { title: "The pattern — conditional aggregation in one pass", body: "GROUP BY campaign with COUNT(DISTINCT CASE WHEN event = X THEN user_id END) per step, LEFT JOIN conversions for converted, and compute both rates in an outer SELECT so the denominators are the funnel counts themselves. One statement, one row per campaign." },
      { title: "The optimal idea — DISTINCT users, previous-step denominators, guard the zero", body: "O(E) over the E event rows plus one sort for the GROUP BY. The durable rules: count users not rows, divide each step by the step before it, and never let a zero denominator print NULL where the business needs a zero." },
    ],
    approach: "one GROUP BY campaign with COUNT(DISTINCT CASE) per step, LEFT JOIN conversions for converted, rates in an outer SELECT against the previous step, COALESCE 0.0 on click_pct",
    schema: {
      ddl: `CREATE TABLE email_events (
  campaign TEXT NOT NULL,
  user_id  INTEGER NOT NULL,
  event    TEXT NOT NULL            -- 'sent' | 'delivered' | 'opened' | 'clicked'
);
CREATE TABLE email_conversions (
  campaign TEXT NOT NULL,
  user_id  INTEGER NOT NULL
);`,
      seed: `-- Three campaigns. spring-sale is the healthy funnel (10 sent, 9 delivered,
-- 6 opened, 3 clicked, 2 converted, user 4 converted without clicking).
-- newsletter-weekly is the spam-folder story (8 sent, 3 delivered, nothing
-- after). product-launch is the curiosity funnel (6 sent, 6 delivered,
-- 5 opened, 1 clicked, 1 converted — user 22 converted without clicking).
-- The user 5 open in spring-sale is PLANTED TWICE: the duplicate the
-- COUNT(DISTINCT user_id) contract must survive.
INSERT INTO email_events (campaign, user_id, event) VALUES
  ('spring-sale', 1,  'sent'),
  ('spring-sale', 2,  'sent'),
  ('spring-sale', 3,  'sent'),
  ('spring-sale', 4,  'sent'),
  ('spring-sale', 5,  'sent'),
  ('spring-sale', 6,  'sent'),
  ('spring-sale', 7,  'sent'),
  ('spring-sale', 8,  'sent'),
  ('spring-sale', 9,  'sent'),
  ('spring-sale', 10, 'sent'),
  ('spring-sale', 1,  'delivered'),
  ('spring-sale', 2,  'delivered'),
  ('spring-sale', 3,  'delivered'),
  ('spring-sale', 4,  'delivered'),
  ('spring-sale', 5,  'delivered'),
  ('spring-sale', 6,  'delivered'),
  ('spring-sale', 7,  'delivered'),
  ('spring-sale', 8,  'delivered'),
  ('spring-sale', 9,  'delivered'),
  ('spring-sale', 1,  'opened'),
  ('spring-sale', 2,  'opened'),
  ('spring-sale', 3,  'opened'),
  ('spring-sale', 4,  'opened'),
  ('spring-sale', 5,  'opened'),
  ('spring-sale', 5,  'opened'),
  ('spring-sale', 6,  'opened'),
  ('spring-sale', 1,  'clicked'),
  ('spring-sale', 2,  'clicked'),
  ('spring-sale', 3,  'clicked'),
  ('newsletter-weekly', 11, 'sent'),
  ('newsletter-weekly', 12, 'sent'),
  ('newsletter-weekly', 13, 'sent'),
  ('newsletter-weekly', 14, 'sent'),
  ('newsletter-weekly', 15, 'sent'),
  ('newsletter-weekly', 16, 'sent'),
  ('newsletter-weekly', 17, 'sent'),
  ('newsletter-weekly', 18, 'sent'),
  ('newsletter-weekly', 11, 'delivered'),
  ('newsletter-weekly', 12, 'delivered'),
  ('newsletter-weekly', 13, 'delivered'),
  ('product-launch', 19, 'sent'),
  ('product-launch', 20, 'sent'),
  ('product-launch', 21, 'sent'),
  ('product-launch', 22, 'sent'),
  ('product-launch', 23, 'sent'),
  ('product-launch', 24, 'sent'),
  ('product-launch', 19, 'delivered'),
  ('product-launch', 20, 'delivered'),
  ('product-launch', 21, 'delivered'),
  ('product-launch', 22, 'delivered'),
  ('product-launch', 23, 'delivered'),
  ('product-launch', 24, 'delivered'),
  ('product-launch', 19, 'opened'),
  ('product-launch', 20, 'opened'),
  ('product-launch', 21, 'opened'),
  ('product-launch', 22, 'opened'),
  ('product-launch', 23, 'opened'),
  ('product-launch', 19, 'clicked');
INSERT INTO email_conversions (campaign, user_id) VALUES
  ('spring-sale', 1),
  ('spring-sale', 4),
  ('product-launch', 22);`,
      tables: [
        { name: "email_events", note: "58 rows — spring-sale 29 (28 + the planted user-5 open duplicate), newsletter-weekly 11, product-launch 18" },
        { name: "email_conversions", note: "3 rows — spring-sale users 1 and 4, product-launch user 22 (both non-clicking converters included)" },
      ],
    },
    code: `WITH per_campaign AS (
    -- the whole funnel in one pass: COUNT(DISTINCT user) per event, immune to
    -- the planted duplicate AND to the conversion LEFT JOIN's fan-out
    SELECT
        e.campaign,
        COUNT(DISTINCT CASE WHEN e.event = 'sent' THEN e.user_id END)      AS sent,
        COUNT(DISTINCT CASE WHEN e.event = 'delivered' THEN e.user_id END) AS delivered,
        COUNT(DISTINCT CASE WHEN e.event = 'opened' THEN e.user_id END)    AS opened,
        COUNT(DISTINCT CASE WHEN e.event = 'clicked' THEN e.user_id END)   AS clicked,
        COUNT(DISTINCT c.user_id) AS converted
    FROM email_events e
    LEFT JOIN email_conversions c ON c.campaign = e.campaign
    GROUP BY e.campaign
)
SELECT
    campaign,
    sent,
    delivered,
    opened,
    clicked,
    converted,
    -- each rate divides by the PREVIOUS step (pinned): opened by delivered,
    -- clicked by opened — never by sent
    ROUND(100.0 * opened / delivered, 2) AS open_pct,
    -- opened = 0 makes the division NULL in this engine — the guard stamps 0.0
    COALESCE(ROUND(100.0 * clicked / opened, 2), 0.0) AS click_pct
FROM per_campaign
ORDER BY campaign ASC;`,
    walkthrough: [
      "The per_campaign CTE aggregates email_events in one pass. spring-sale folds 29 event rows (28 plus the planted duplicate) into sent 10, delivered 9, opened 6, clicked 3; newsletter-weekly folds 11 rows into 8, 3, 0, 0; product-launch folds 18 rows into 6, 6, 5, 1. The LEFT JOIN to email_conversions fans spring-sale's rows out by its two converters — 58 joined rows — and COUNT(DISTINCT c.user_id) reads 2 straight through the fan-out; product-launch reads 1 (the never-clicked user 22) and newsletter-weekly 0.",
      "The outer SELECT computes the rates from those counts. spring-sale: 100.0 * 6 / 9 = 66.67 open, 100.0 * 3 / 6 = 50.0 click. product-launch: 100.0 * 5 / 6 = 83.33 open, 100.0 * 1 / 5 = 20.0 click. newsletter-weekly: 100.0 * 0 / 3 = 0.0 open, and the click division hits opened = 0 — NULL in this engine — so COALESCE stamps 0.0. The table reads exactly as the business knows it: healthy, spam-collapsed, high-open-low-click.",
      "The engine ships three rows ordered by campaign: newsletter-weekly (8, 3, 0, 0, 0, 0.0, 0.0), product-launch (6, 6, 5, 1, 1, 83.33, 20.0), spring-sale (10, 9, 6, 3, 2, 66.67, 50.0). Counts are integers end to end; the two pct columns are the only REALs. Four probe variants are pinned and asserted: opens over sent (60.0 on spring-sale), clicks over delivered (33.33 and 16.67), COUNT(*) on the planted duplicate (opened 7, then 77.78 and 42.86) and the missing COALESCE (NULL on newsletter-weekly).",
    ],
    time: "O(E + V) over the E event rows and V conversion rows — one aggregation pass plus one sort for the GROUP BY",
    space: "O(C) — one output row per campaign after the aggregation",
    followUps: [
      "Add delivered_pct and convert_pct to the table — which campaign's weakest step changes when every rate shares one denominator (sent) instead of chaining?",
      "Split the converted column by click behavior — LEFT JOIN conversions onto the funnel and report conversions from clickers versus never-clickers per campaign; what share of credit does the click step lose on this seed?",
    ],
    related: ["funnel-step-conversion", "ab-sample-ratio-mismatch", "growth-accounting"],
    order: "exact",
    xp: 20,
  },
];
