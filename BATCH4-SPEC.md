# Data & Finance BATCH 4 — master spec (problems 8049-8072)

Four NEW sections for Module 13, 24 original problems. Same treatment as batch 3:
every dive carries a full `primer`, sections carry study guides, each problem gets a
bespoke concept diagram. Everything in this file is the CONTRACT — solve to it exactly.

## The pipeline (how one problem becomes real)

1. Registry row: `src/lib/leetcode/registry-sql-datafin.ts` (lead wires; authors do NOT edit).
2. Section definition + study guide: `src/lib/leetcode/sections.ts` (lead wires).
3. Deep-dive content: 8 files under `src/lib/leetcode/content/` (AUTHORS write these).
4. Content index: `src/lib/leetcode/content/content.ts` (lead wires).
5. `bun scripts/lc-sql-verify.ts` executes every dive's solution against its seed and
   REGENERATES `src/lib/leetcode/content/sql-expected.ts` (never hand-edit that file).
6. `bun scripts/lc-sections-check.ts` proves registry ↔ sections ↔ dives ↔ expected 1:1.
7. Art: 4 family files under `src/components/learn/` (art authors), wired into
   `lc-df-art.tsx` + label maps in `lc-primer.tsx` (lead wires).

## House rules for dives (mandatory — verified by scripts)

- Money is INTEGER cents, column names end `_cents`. REAL only for rates/pcts/ratios.
- `code` is EXACTLY ONE SQLite statement (CTEs welcome), commented, deterministic.
- `order: "exact"` requires an ORDER BY in the solution; single-row or set-compared
  outputs use `order: "any"`.
- `xp`: Easy 10 / Medium 20 / Hard 35 — must match the registry difficulty.
- Seeds: own tables, own data, no collisions with other problems' table names. Every
  number a probe asserts must be hand-verifiable from the seed.
- `edges[]` MUST include 2-4 wrong-answer probes with PINNED values from the seed
  (what a specific mistake produces instead).
- Prose bans: no backticks, no ${, no "e.g."/"i.e.", no emojis, no markdown. Plain
  sentences. SQL keywords in CAPS inside prose (SUM, GROUP BY, LAG).
- House convention: one uniform closing formula / denominator per problem, stated in
  `constraints[]` as "PINNED: ...".
- Floats: ROUND at the pinned places only; divisions run on RAW values first.

## Primer block (every dive) — shape check

- `hook`: 1 sentence, real-life pitch.
- `concept`: 3-4 paragraphs, teaches from zero, zero undefined jargon.
- `worked`: 3-5 numbered steps walking a TINY example by hand (numbers must match the
  file's own seed semantics, not necessarily the seed rows).
- `glossary`: 4-6 terms, one-line definitions.
- `reallife`: 2-3 paragraphs — who runs this at a real company, what breaks, what
  decisions the numbers drive.
- `where`: 1 sentence naming roles + the registry-tagged companies.

## Template to mirror

Read `src/lib/leetcode/content/sql-df-quant-a.ts` END TO END before writing. It is the
house style: statement density, example format, constraints with PINNED lines, primer
tone, breakdown depth, edges with pinned probes, ladder rungs, commented code,
walkthrough paragraphs, follow-ups, related slugs, time/space strings.

## Self-verification (every content author MUST)

1. Write `scripts/tmp-77-<family>-check.ts` importing YOUR file directly (NOT content.ts —
   the lead wires that later). Pattern-copy `scripts/tmp-74-g-check.ts`:
   build each dive's schema in bun:sqlite, run the solution, assert the EXACT expected
   rows you pinned, plus 2-4 trap probes (run the WRONG variants of the query and assert
   they produce the pinned wrong values from your edges[]).
2. `bun scripts/tmp-77-<family>-check.ts` → ALL PASS.
3. `bunx tsc --noEmit 2>&1 | grep <your-file-basename>` → empty (45-error pre-existing
   baseline in landing/* is untouched; only YOUR file must be clean).
4. Worklog: append ONE section to `/home/z/my-project/worklog.md` (read its tail first)
   with Task ID, work log, stage summary. Do NOT touch any file except your content
   file + your tmp check script + the worklog.

---

## FILE 1 · `sql-df-saas-a.ts` — export SQL_DF_SAAS_A

### 8049 · trial-to-paid-funnel · Easy
- Topics tag: "SQL · Trial funnel|Conditional counts" · Companies: Slack|Zoom
- Story: a self-serve SaaS measures whether trial signups activate (first key event)
  and convert to paid. Board meetings read this funnel weekly.
- Tables: `signups(user_id INTEGER PRIMARY KEY, signup_date TEXT, converted_date TEXT)`
  (converted_date NULL = never converted); `activations(user_id INTEGER, activated_date
  TEXT, PRIMARY KEY(user_id, activated_date))` — at most one activation row per user.
- Contract: bucket signups by the MONDAY of their signup week (strftime date arithmetic,
  'YYYY-MM-DD'). Columns: `week, trials, activated, converted, activation_pct,
  conversion_pct`. `activated` = signup with an activation row whose activated_date is
  within 14 days of signup_date (the trial window, PINNED). `converted` = converted_date
  IS NOT NULL. Percentages = ROUND(100.0 * step / trials, 2). ORDER BY week ASC.
- Seed: 4 distinct weeks, ~5-8 signups each; one week where activation is high but
  conversion low (the product story); at least one activation AFTER the 14-day window
  (must NOT count); one signup converting without ever activating (edge, still counts
  as converted); users activated early vs late.
- Probes: drop the 14-day window guard → activation_pct differs (pin both numbers);
  denominator converted/activated instead of trials → different pct (pin).

### 8050 · plan-migration-paths · Medium
- Topics tag: "SQL · LAG transitions|Band compare" · Companies: Atlassian|Notion
- Story: subscription plan changes — upgrade (better tier), downgrade, lateral switch.
  Finance and product both read migration flows monthly.
- Tables: `subscriptions(customer_id INTEGER, month TEXT, plan TEXT)` — one row per
  customer per active month (a gap of months = unsubscribed, not a plan change);
  `plans(plan TEXT PRIMARY KEY, tier_rank INTEGER)` — higher rank = better plan.
- Contract: for consecutive months per customer (LAG over month order), report every
  plan CHANGE: `customer_id, prev_month, month, from_plan, to_plan, direction` where
  direction = 'upgrade' when to_plan tier_rank > from_plan tier_rank, 'downgrade' when
  lower, 'lateral' when equal rank but different plan. Same plan = no row. A customer
  reappearing after a month gap IS a consecutive-pair (no special case needed — the
  LAG pairs adjacent active months) but the statement must SAY the convention: gaps are
  ignored, adjacent active months are compared (PINNED). ORDER BY customer_id, month.
- Seed: 5-6 customers; upgrade, downgrade, lateral switch (same rank different plan),
  multi-change customer, customer whose every month is identical (no rows), gap-month
  customer with a change across the gap.
- Probes: join direction only on plan-name comparison without tier_rank (misses
  laterals — pin count difference); forget to filter same-plan pairs → duplicate rows.

### 8051 · mrr-waterfall · Hard
- Topics tag: "SQL · LAG waterfall|Movement classification" · Companies: Stripe|Salesforce
- Story: THE SaaS board-deck chart — monthly recurring revenue split into new,
  expansion, contraction and churned movements. Every SaaS analytics interview asks it.
- Tables: `mrr_snapshots(customer_id INTEGER, month TEXT, mrr_cents INTEGER)` — one row
  per customer per SUBSCRIBED month; an absent month means the customer churned that
  month (prior row exists, current absent).
- Contract: report the movement waterfall per month: `month, new_mrr, expansion_mrr,
  contraction_mrr, churned_mrr, ending_mrr`. PINNED definitions against the customer's
  prior snapshot row (LAG): new = current mrr with NO prior row (count full current
  mrr); churned = prior row with NO current row (count the PRIOR month's mrr);
  expansion = both rows present and current > prior (count current - prior);
  contraction = both present and current < prior (count prior - current); equal = no
  movement. ending_mrr = SUM of current mrr in the month. All money INTEGER cents,
  ORDER BY month ASC. The first month of data reports new_mrr only for customers whose
  first-ever row is that month (PINNED: month 1 of the seed is the cohort's first month,
  so its new_mrr = full month sum, churned 0).
- Seed: 6 consecutive months (2026-04..2026-09), 6-8 customers; at least one customer
  in each movement class every month; one customer churning then NEVER returning; one
  expanding two months in a row; one contracting; a new customer joining mid-window.
- Probes: churned counted as 0 or as current-month (no row) instead of prior mrr (pin);
  expansion including new customers (pin); ending computed as running total instead of
  monthly sum (pin).

---

## FILE 2 · `sql-df-saas-b.ts` — export SQL_DF_SAAS_B

### 8052 · net-revenue-retention · Medium
- Topics tag: "SQL · Cohort revenue|Retention" · Companies: Snowflake|Datadog
- Story: NRR — of the revenue a cohort of customers paid in their first month, how much
  do they still pay 3 months later, including expansions. The number public SaaS reports.
- Tables: `customers(customer_id INTEGER PRIMARY KEY, cohort_month TEXT)` (month of
  first subscription); `mrr_snapshots(customer_id INTEGER, month TEXT, mrr_cents INTEGER)`.
- Contract: per cohort_month: `cohort_month, m0_mrr, m3_mrr, nrr_pct`. m0_mrr = SUM of
  mrr_snapshots at cohort_month for that cohort's customers. m3_mrr = SUM at month =
  cohort_month + 3 (SQLite date(add month via date(cohort_month, '+3 month'))), where
  churned customers (no row at m3) contribute 0 BUT STAY IN THE DENOMINATOR (that is
  the point of NRR). nrr_pct = ROUND(100.0 * m3_mrr / m0_mrr, 2). Only cohorts whose
  m3 month exists in the seed window (ORDER BY cohort_month).
- Seed: 3 cohorts; one cohort contracting (downgrades + churn), one expanding (upsells
  outgrow churn), one flat; a churned customer in the expanding cohort whose loss is
  covered by another customer's 3x expansion.
- Probes: excluding churned customers from the m3 denominator inflates nrr (pin both);
  m3 computed as +90 days instead of +3 months (pin date drift).

### 8053 · ltv-cac-payback · Medium
- Topics tag: "SQL · Unit economics|Ratio ladder" · Companies: HubSpot|Canva
- Story: unit economics per acquisition channel — is a channel's customer worth more
  than they cost, and how many months until the profit repays the acquisition cost.
- Tables: `customers(customer_id INTEGER PRIMARY KEY, channel TEXT, signup_month TEXT)`;
  `mrr_snapshots(customer_id INTEGER, month TEXT, mrr_cents INTEGER)`;
  `channel_spend(channel TEXT PRIMARY KEY, spend_cents INTEGER)`.
- Contract: per channel: `channel, customers, arpu_mrr, monthly_churn_pct, cac_cents,
  ltv_cents, ltv_to_cac, payback_months`. PINNED: arpu = AVG of each customer's
  lifetime-average monthly mrr? NO — PINNED simpler: arpu_mrr = total mrr billed — renamed from arpu_mrr_cents during fix-up 77-b2 (REAL AVG never carries the _cents suffix)
  across all months ÷ customer-months (a plain AVG over mrr_snapshots rows joined to the
  channel). monthly_churn_pct = 100.0 * churned customer-month transitions ÷
  customer-months at risk, where a churn = a customer's last subscribed month being
  before the seed's final month (they vanish before the window ends). cac_cents =
  spend_cents / customers (ROUND 0). Gross margin PINNED at 80.0 percent.
  ltv_cents = ROUND(arpu * 0.80 / (monthly_churn_pct / 100.0), 0) — guard churn 0.
  ltv_to_cac = ROUND(ltv / cac, 2) on RAW values. payback_months = ROUND(cac / (arpu *
  0.80), 1). ORDER BY ltv_to_cac DESC.
- Seed: 3 channels (organic-heavy cheap CAC, paid with high CAC but sticky customers,
  paid with high CAC and leaky customers — the story is the ratio spread). Every number
  hand-checkable: pick mrr values so AVGs are exact decimals.
- Probes: margin applied after the churn division vs before (pin); payback using raw
  arpu without margin (pin); churn computed per channel with denominator = customers
  instead of customer-months (pin).

### 8054 · winback-recovery · Hard
- Topics tag: "SQL · Winback|Date window" · Companies: Spotify|Duolingo
- Story: churned customers who come back within 90 days — winback rate per cancel
  reason. Retention teams pick their save-offers from this table.
- Tables: `churn_events(churn_id INTEGER PRIMARY KEY, customer_id INTEGER, churn_date
  TEXT, cancel_reason TEXT)`; `resubscriptions(resub_id INTEGER PRIMARY KEY, customer_id
  INTEGER, resub_date TEXT)` — at most one resub per churned customer (PINNED: seed
  guarantees at most one resub row per customer).
- Contract: per cancel_reason: `cancel_reason, churned_customers, recovered,
  recovery_pct, avg_days_to_return`. recovered = churned customer with a resub_date
  within [churn_date, churn_date + 90 days] INCLUSIVE (PINNED: day 90 counts).
  recovery_pct = ROUND(100.0 * recovered / churned, 2). avg_days_to_return =
  ROUND(AVG(julianday(resub_date) - julianday(churn_date)), 1) over RECOVERED only,
  0.0 when recovered = 0 (COALESCE). Reasons with churns but zero recoveries STILL
  report. ORDER BY churned_customers DESC, cancel_reason ASC.
- Seed: 4 reasons; one reason with a day-90-boundary resub (must count); one resub at
  day 91 (must NOT count); one reason with zero recoveries; one customer with multiple
  churn events (PINNED: grade per churn EVENT — the same customer can appear twice with
  different reasons; state this in the statement).
- Probes: exclusive day-90 boundary drops the boundary resub (pin pct change); counting
  resubs after day 90 as recovered (pin); INNER JOIN dropping zero-recovery reasons
  (pin row-count difference).

---

## FILE 3 · `sql-df-mktg-a.ts` — export SQL_DF_MKTG_A

### 8055 · roas-by-campaign · Easy
- Topics tag: "SQL · ROAS|Outer join guard" · Companies: Google|Amazon
- Story: return on ad spend per campaign — revenue attributed ÷ spend. The first
  number every marketing lead reads on Monday.
- Tables: `campaign_spend(campaign TEXT, day TEXT, spend_cents INTEGER)` (PK campaign,
  day); `attributed_revenue(campaign TEXT, day TEXT, revenue_cents INTEGER)` (PK
  campaign, day) — ONLY days with revenue have rows (a campaign can have spend and no
  revenue rows at all).
- Contract: per campaign: `campaign, spend_cents, revenue_cents, roas, rn` where money
  = SUMs, roas = ROUND(1.0 * revenue / spend, 2) with spend > 0 guaranteed by seed
  (state it), rn = RANK() OVER (ORDER BY roas DESC) — ties share a rank (PINNED, state
  it). Include campaigns with ZERO revenue (LEFT JOIN, revenue 0) — they rank last.
  ORDER BY rn, campaign.
- Seed: 5 campaigns; one with spend but zero revenue (roas 0.0); one outperforming
  (roas > 4); a tie pair (same roas 2dp, shared rank, rn skips next).
- Probes: INNER JOIN drops the zero-revenue campaign (pin row count); RANK vs
  ROW_NUMBER on the tie (pin rn difference); integer division 100/400 style truncation
  without 1.0* (pin).

### 8056 · first-last-touch-attribution · Easy
- Topics tag: "SQL · FIRST_VALUE|Attribution window" · Companies: HubSpot|Mailchimp
- Story: which marketing touch STARTED the journey and which CLOSED it — first vs last
  touch inside a 30-day lookback. The two most-argued attribution models in one query.
- Tables: `touches(touch_id INTEGER PRIMARY KEY, user_id INTEGER, channel TEXT,
  touch_date TEXT)`; `conversions(conversion_id INTEGER PRIMARY KEY, user_id INTEGER,
  conversion_date TEXT)`.
- Contract: per conversion: `conversion_id, first_channel, last_channel` where the
  candidate touches are the user's touches in [conversion_date - 29 days,
  conversion_date] INCLUSIVE (PINNED: "30-day lookback" = 29 days back + the day
  itself). FIRST_VALUE / LAST_VALUE per conversion partition ordered by touch_date,
  touch_id. A conversion with NO in-window touches reports 'none' for both (PINNED:
  LEFT JOIN + COALESCE). ORDER BY conversion_id.
- Seed: 6 conversions; cross-channel journeys (first Meta, last Google); same-channel
  start and end; one conversion whose only touch sits exactly on day -29 (in window);
  one conversion with a touch on day -30 (OUT, reports 'none'); multi-touch same day
  (tie broken by touch_id — PINNED).
- Probes: window built as < -29 (drops the boundary touch — pin); partition forgetting
  user match (cross-user contamination — pin a wrong channel); LAST_VALUE without the
  window frame clause rows-between (classic SQL bug — pin what it yields in SQLite:
  frame default is range unbounded preceding to current row, so LAST_VALUE equals
  current row value — the probe pins the resulting wrong channel).

### 8057 · email-engagement-funnel · Medium
- Topics tag: "SQL · Funnel pivot|Step rates" · Companies: Klaviyo|Shopify
- Story: the email funnel per campaign — sent, delivered, opened, clicked, converted —
  with each step's rate against its immediate predecessor. CRM teams live here.
- Tables: `email_events(campaign TEXT, user_id INTEGER, event TEXT)` — event IN
  ('sent', 'delivered', 'opened', 'clicked'); one row per user per event type per
  campaign (PINNED: at most one of each); `email_conversions(campaign TEXT, user_id
  INTEGER)` — converted = a row here (may exist without clicks).
- Contract: per campaign: `campaign, sent, delivered, opened, clicked, converted,
  open_pct, click_pct`. Counts = COUNT(DISTINCT user) per event via conditional
  aggregation. open_pct = ROUND(100.0 * opened / delivered, 2); click_pct = ROUND(100.0
  * clicked / opened, 2) — denominators are the PREVIOUS step (PINNED). A campaign
  with opened = 0 reports click_pct 0.0 (COALESCE guard, state it). ORDER BY campaign.
- Seed: 3 campaigns; a healthy funnel; a spam-folder campaign (delivered far below
  sent); a curiosity campaign (high open, low click); users who opened without
  clicking; a converter who never clicked (edge).
- Probes: open_pct against sent instead of delivered (pin); click_pct against
  delivered instead of opened (pin); COUNT(*) without DISTINCT on a duplicated row the
  seed plants (pin).

---

## FILE 4 · `sql-df-mktg-b.ts` — export SQL_DF_MKTG_B

### 8058 · linear-multi-touch · Medium
- Topics tag: "SQL · Fractional credit|Cross join weight" · Companies: Amazon|eBay
- Story: linear attribution — split each conversion's credit equally across every
  in-window touch, then sum fractional credits per channel. Fairer than last-touch,
  and the SQL is a fraction machine.
- Tables: same touch/conversion model as 8056 — `touches(touch_id INTEGER PRIMARY KEY,
  user_id INTEGER, channel TEXT, touch_date TEXT)`, `conversions(conversion_id INTEGER
  PRIMARY KEY, user_id INTEGER, conversion_date TEXT)`. SEPARATE TABLE NAMES NOT
  NEEDED — but the seed data is this file's own (no collisions, it is a separate
  in-memory database per problem).
- Contract: per channel: `channel, touches_assisted, credited_conversions` where
  credited = SUM over conversions of 1.0 / n (n = that conversion's in-window touch
  count), ROUND(SUM, 2). touches_assisted = raw touch count for that channel across
  in-window pairs. Window: same PINNED 30-day lookback [day -29, day 0] inclusive,
  user must match. ORDER BY credited_conversions DESC, channel ASC.
- Seed: engineered so fractions are clean: conversions with 2 and 4 touches (halves
  and quarters); one channel collecting many small credits to beat a channel with one
  full credit (the story: linear rewards assisters); a conversion with one touch
  (credit 1.0); rounding summing to 0.5 exactly.
- Probes: integer division 1/n without 1.0* (all zeros — pin); ROUND applied per-row
  before SUM instead of after (pin drift, e.g. three 0.333s rounding to 0.33 each);
  counting DISTINCT conversions as credit instead of fractional (pin).

### 8059 · budget-pacing · Medium
- Topics tag: "SQL · Running sum|First breach" · Companies: Meta|TikTok
- Story: spend pacing — a campaign budgeted 500 dollars for the month should not blow
  through it by day 12. Report each campaign's FIRST breach day of its cumulative
  spend line.
- Tables: `campaign_spend(campaign TEXT, day TEXT, spend_cents INTEGER)` (PK campaign,
  day, days contiguous per campaign); `campaign_budgets(campaign TEXT PRIMARY KEY,
  budget_cents INTEGER)`.
- Contract: per campaign that breaches: `campaign, breach_day, cum_spend_at_breach,
  budget_cents, over_by_cents` where cum = running SUM(spend_cents) OVER (PARTITION BY
  campaign ORDER BY day); breach = first day cum_spend > budget (STRICTLY greater,
  PINNED); over_by_cents = cum_spend_at_breach - budget_cents. Campaigns that never
  breach are EXCLUDED (state it). ORDER BY breach_day, campaign.
- Seed: 4 campaigns; front-loader (breaches day 3), steady climber (breaches day 9),
  exactly-at-budget peak that never exceeds (no row — the boundary edge), one never
  near budget (no row).
- Probes: >= instead of > swallows the exactly-at-budget campaign (pin row-count
  difference); reporting EVERY breach day instead of the first (pin row count);
  forgetting PARTITION BY campaign (running sum bleeds across campaigns — pin).

### 8060 · channel-ltv-vs-cac · Hard
- Topics tag: "SQL · Personal clock|Trailing revenue" · Companies: Shopify|Instacart
- Story: the real LTV question — how much revenue does a channel's customer bring in
  their FIRST 90 DAYS, against what the channel paid to acquire them. Decides budget
  shifts between channels.
- Tables: `customers(customer_id INTEGER PRIMARY KEY, channel TEXT, acquisition_date
  TEXT)`; `orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT,
  revenue_cents INTEGER)`; `channel_spend(channel TEXT PRIMARY KEY, spend_cents INTEGER)`.
- Contract: per channel: `channel, customers, cac_cents, rev90_cents, rev90_per_customer,
  ltv_cac_ratio`. PINNED: rev90 = SUM of order revenue where order_date is within
  [acquisition_date, acquisition_date + 89 days] — the customer's OWN 90-day clock
  (day of acquisition counts, day 90 does not; 89 days later inclusive). cac_cents =
  ROUND(spend / customers, 0). rev90_per_customer = ROUND(rev90 / customers, 2) — a
  customer with zero orders contributes 0 but STAYS in the denominator (LEFT JOIN).
  ltv_cac_ratio = ROUND(rev90_per_customer * 100 / cac, 2) — revenue in cents vs cac in
  cents is already same-unit so ratio = rev90_per_customer / cac directly; PINNED as
  ROUND(rev90_per_customer / cac, 2). ORDER BY ltv_cac_ratio DESC.
- Seed: 3 channels; a high-CAC channel whose customers order weekly (ratio > 3); a
  cheap channel with one-and-done buyers (ratio < 1); a customer acquired on the last
  seed day with zero orders (denominator honesty); an order landing exactly on day 89
  (in) and another on day 90 (out) for the same customer (the boundary pair).
- Probes: global 90-day window instead of per-customer clock (pin); day-90 inclusive
  boundary (pin); excluding zero-order customers from the denominator (pin).

---

## FILE 5 · `sql-df-wh-a.ts` — export SQL_DF_WH_A

### 8061 · keep-latest-dedupe · Easy
- Topics tag: "SQL · ROW_NUMBER dedupe|Tiebreak" · Companies: Uber|Airbnb
- Story: an order-status feed fires many updates per order; the dashboard wants ONE
  row per order — the latest status. The single most common warehouse transformation.
- Tables: `status_feed(event_id INTEGER PRIMARY KEY, order_id INTEGER, status TEXT,
  updated_at TEXT)` — multiple events per order, timestamps may TIE (PINNED: tie broken
  by higher event_id).
- Contract: one row per order: `order_id, status, updated_at` — the row with the
  highest (updated_at, event_id) lexicographic pair. ORDER BY order_id.
- Seed: 6 orders; plain latest; a timestamp TIE resolved by event_id (the higher id is
  the later writer); an out-of-order arrival (lower timestamp inserted later —
  irrelevant, order by timestamp not insertion); a single-event order.
- Probes: GROUP BY + MAX(updated_at) alone returns the max timestamp but with an
  UNRELATED status from another row (SQLite bare-column quirk) — pin the wrong pairing;
  tie broken by LOWER event_id (pin); ORDER BY event_id instead of updated_at (pin).

### 8062 · null-blank-audit · Easy
- Topics tag: "SQL · Data quality|Conditional SUM" · Companies: Netflix|Spotify
- Story: the pre-flight data-quality sweep every dashboard owner runs — how many NULLs,
  how many blank strings, and does the table pass the freshness gate. dbt tests,
  hand-rolled.
- Tables: `customers_raw(customer_id INTEGER PRIMARY KEY, email TEXT, phone TEXT, city
  TEXT, updated_at TEXT)` — seeded with genuine NULLs, empty strings '', whitespace
  strings '   ', and valid values; a pinned as-of date '2026-09-30' for freshness.
- Contract: ONE row: `total_rows, null_emails, blank_emails, null_phone, blank_phone,
  null_city, stale_rows, pass`. PINNED: blank = TRIM(COALESCE(col, '')) = '' AND col IS
  NOT NULL (so NULL is NOT blank — they count separately). stale_rows = rows with
  updated_at < '2026-09-01' (freshness window PINNED: anything older than 30 days is
  stale). pass = 1 when null_emails + blank_emails + null_phone + blank_phone +
  null_city = 0 AND stale_rows = 0, else 0. ORDER: single row (order "any").
- Seed: 8 rows covering every combination: both null, blank email, whitespace email,
  whitespace phone, stale-but-valid, all-clean; one row that is fully clean.
- Probes: counting NULL as blank (double-count — pin); TRIM without COALESCE dropping
  NULLs from the blank count (pin); freshness compared with <= instead of < (pin if a
  boundary row is planted).

### 8063 · point-in-time-asof · Medium
- Topics tag: "SQL · SCD2 as-of|Half-open interval" · Companies: Airbnb|DoorDash
- Story: rebuilding YESTERDAY's report — query a slowly-changing dimension AS OF a past
  date and get the attribute values as they were THEN, not as they are now.
- Tables: `dim_customers(customer_id INTEGER, city TEXT, valid_from TEXT, valid_to
  TEXT, is_current INTEGER)` — SCD2 rows: valid_to = '9999-12-31' on the current row
  (PINNED sentinel), is_current 1 on it, 0 otherwise; one row per attribute version.
- Contract: for the PINNED as-of date '2026-07-15', report each customer's city as it
  stood then: `customer_id, city_asof, valid_from, valid_to` — pick the row where
  valid_from <= as-of AND as-of < valid_to (half-open [from, to), the SCD2 convention,
  state it). ORDER BY customer_id.
- Seed: 5 customers; one who moved twice (both before as-of — pick the second), one
  who moves AFTER the as-of (current city is a decoy), one whose exact valid_from
  equals the as-of date (inclusive edge — counts), one whose valid_to equals the
  as-of date (exclusive edge — the OLD row does NOT count), one unchanged customer.
- Probes: using BETWEEN (both-inclusive) double-picks the boundary customer (pin row
  count); forgetting the is_current row's far-future sentinel and joining on
  valid_to > as-of with NULL semantics losing the current row (pin); joining dim by
  customer_id alone (cartesian version rows — pin count).

### 8064 · scd2-build · Hard
- Topics tag: "SQL · LEAD validity window|SCD2" · Companies: Shopify|Lyft
- Story: BUILD the SCD2 table — turn a raw change feed into validity-windowed rows.
  The analytics-engineer interview's favorite hard question.
- Tables: `customer_changes(change_id INTEGER PRIMARY KEY, customer_id INTEGER, city
  TEXT, changed_date TEXT)` — a row per RECORDED change; consecutive rows with the
  SAME city are no-op re-affirmations (PINNED: they must NOT create SCD2 rows); the
  FIRST row per customer establishes the initial version.
- Contract: produce the SCD2 dimension: `customer_id, city, valid_from, valid_to,
  is_current` where valid_from = the change date that STARTED this city value, valid_to
  = the change date that ENDED it ('9999-12-31' when still current, is_current 1),
  ordered by customer_id, valid_from. PINNED pipeline: per customer ordered by
  changed_date, drop rows whose city equals the previous row's city (LAG compare),
  then valid_to = LEAD(valid_from) over the surviving rows, sentinel on the last.
- Seed: 4 customers; a mover; a no-op repeater (records the same city twice — one SCD2
  row out); a bounce A→B→A (three rows, the bounce preserved); a single-change
  customer.
- Probes: skipping the LAG dedupe creates duplicate-validity rows (pin row count);
  sentinel '9999-12-31' replaced by NULL breaks the comparison ordering (pin);
  LEAD computed BEFORE dedupe (pin wrong valid_to on the bounced customer).

### 8065 · late-arriving-restatement · Hard
- Topics tag: "SQL · Watermark|Restatement delta" · Companies: Snowflake|Databricks
- Story: events arrive LATE — yesterday's batch contains events dated last week. The
  daily aggregate counted only same-day arrivals; report which days need restatement
  and by how much. Incremental-pipeline thinking in one query.
- Tables: `events(event_id INTEGER PRIMARY KEY, event_date TEXT, processed_date TEXT)`
  — processed_date >= event_date always (PINNED; lateness = the difference).
- Contract: per event_date needing restatement: `event_date, true_events,
  counted_same_day, restatement_delta` where true_events = COUNT by event_date,
  counted_same_day = COUNT of those with processed_date = event_date, delta =
  true_events - counted_same_day; only dates with delta > 0 (PINNED: strict). ORDER BY
  event_date.
- Seed: 8 event_dates over two weeks; on-time-heavy days (delta 0 — excluded), a
  backfill day (big delta), a trickle-late day (delta 1-2); one event late by a week
  landing on an otherwise clean day (creates its restatement row).
- Probes: GROUP BY processed_date instead of event_date (pin); including delta = 0
  days (pin row count); delta computed as counted - true (negative sign, pin).

### 8066 · snapshot-delta-detect · Medium
- Topics tag: "SQL · FULL OUTER JOIN|Delta compare" · Companies: Stripe|Adyen
- Story: two daily snapshots of the same ledger table — what got inserted, removed,
  changed, and unchanged overnight. The change-data-capture check.
- Tables: `snap_yesterday(acct_key TEXT PRIMARY KEY, balance_cents INTEGER)`;
  `snap_today(acct_key TEXT PRIMARY KEY, balance_cents INTEGER)`.
- Contract: exactly 4 rows: `status, row_count` with status IN ('inserted', 'removed',
  'changed', 'unchanged') — inserted = key only in today; removed = key only in
  yesterday; changed = in both with different balance_cents; unchanged = in both,
  equal. FULL OUTER JOIN + COALESCE + IS-NULL logic. ORDER BY status ASC (so the four
  rows read alphabetically).
- Seed: 8 yesterday keys, 8 today keys engineered to produce each count >= 1: inserted
  2, removed 1, changed 3, unchanged 2 (exact counts stated in the example). One
  changed row flips sign (negative balance appears) to keep it interesting.
- Probes: INNER JOIN misses inserted+removed entirely (pin); comparing balances with
  = alone and expecting NULL semantics to catch it (pin: changed miscounts);
  COALESCE on the wrong side of the IS-NULL check (pin).

---

## FILE 6 · `sql-df-retail-a.ts` — export SQL_DF_RETAIL_A

### 8067 · basket-depth-aov · Easy
- Topics tag: "SQL · Basket metrics|Join agg" · Companies: Walmart|Target
- Story: two numbers every retail analyst reports monthly — average order value and
  items per order (basket depth). Merchandising reads both before a pricing change.
- Tables: `orders(order_id INTEGER PRIMARY KEY, order_date TEXT, revenue_cents INTEGER)`;
  `order_items(item_id INTEGER PRIMARY KEY, order_id INTEGER, qty INTEGER)`.
- Contract: per month (strftime %Y-%m): `month, orders, aov_cents, items_per_order`.
  orders = COUNT(DISTINCT orders with items) — orders with ZERO items are excluded
  (PINNED: the items join defines the basket). aov_cents = ROUND(AVG revenue over those
  orders, 0). items_per_order = ROUND(1.0 * SUM(qty) / COUNT(DISTINCT order), 1).
  ORDER BY month.
- Seed: 3 months; a month with a bulk-order skew (one 12-qty basket among small ones);
  one zero-item order (excluded); typical 1-3 item baskets.
- Probes: including the zero-item order in aov (pin); items per order computed per
  order then averaged vs the ratio of sums (different at 1dp — pin both); SUM(qty)
  vs COUNT(items) rows (pin).

### 8068 · repeat-purchase-rate · Easy
- Topics tag: "SQL · Repeat rate|HAVING bucket" · Companies: Starbucks|Chipotle
- Story: of the customers who ordered this month, how many ordered 2+ times. The
  habit metric every retention team defends.
- Tables: `orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT)`.
- Contract: per month: `month, customers, repeaters, repeat_pct` — customers = COUNT(
  DISTINCT customer_id) ordering that month; repeaters = those with COUNT(*) >= 2 in
  the month; repeat_pct = ROUND(100.0 * repeaters / customers, 2). ORDER BY month.
- Seed: 3 months; a habit-forming month (high repeat), a promo month (many one-time
  buyers — low repeat, the story), a customer ordering 4 times (counts once as
  repeater).
- Probes: counting ORDERS as customers (pin); repeat denominator = orders (pin);
  COUNT(DISTINCT) forgotten on customers (pin).

### 8069 · rfm-segmentation · Medium
- Topics tag: "SQL · NTILE quintiles|Segment CASE" · Companies: Sephora|Nike
- Story: THE classic segmentation — score every customer on Recency, Frequency,
  Monetary, cut each into quintiles, and map to named segments. Marketing's favorite
  SQL question, and NTILE's big moment.
- Tables: `orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT,
  revenue_cents INTEGER)`. PINNED as-of date: '2026-09-30'.
- Contract: per customer: `customer_id, recency_days, frequency, monetary_cents, r, f,
  m, segment`. recency_days = CAST(julianday('2026-09-30') - julianday(MAX(order_date))
  AS INTEGER); frequency = COUNT(*); monetary_cents = SUM(revenue_cents). Quintiles via
  NTILE(5) with PINNED directions: r = NTILE(5) OVER (ORDER BY recency_days ASC) —
  most recent (smallest recency) gets the HIGHEST r after reversal... NO — PINNED
  SIMPLE: r = NTILE(5) OVER (ORDER BY recency_days DESC) so the most-recent customers
  (smallest recency_days) land in tile 5, f = NTILE(5) OVER (ORDER BY frequency ASC)
  (most frequent = tile 5), m = NTILE(5) OVER (ORDER BY monetary_cents ASC). State
  all three directions. Segment ladder (PINNED, first match wins):
  r >= 4 AND f >= 4 AND m >= 4 → 'champion'; r >= 4 AND f >= 4 → 'loyal';
  r >= 4 → 'promising'; r <= 2 AND f >= 4 → 'at risk'; r <= 2 → 'hibernating';
  else 'core'. ORDER BY customer_id.
- Seed: 12 customers so quintiles are exact (12 / 5 tiles: sizes 3,3,2,2,2 — state in
  walkthrough); design segment coverage: 2 champions, 1 loyal, 1 promising, 1 at risk,
  1 hibernating, rest core. Hand-verify every tile boundary.
- Probes: NTILE direction flipped on r (pin: a champion reads hibernating); CASE
  ladder reordered (pin: an at-risk customer reads core); segment map without the
  m gate lets a low-m champion through (pin).

---

## FILE 7 · `sql-df-retail-b.ts` — export SQL_DF_RETAIL_B

### 8070 · weeks-of-supply · Medium
- Topics tag: "SQL · Trailing rate|Division guard" · Companies: Home Depot|Best Buy
- Story: weeks of supply — how long current inventory lasts at the trailing 4-week
  sales rate. Below 2 weeks: reorder. The buyer's morning query.
- Tables: `inventory(sku TEXT PRIMARY KEY, on_hand_units INTEGER)`; `sales(sale_id
  INTEGER PRIMARY KEY, sku TEXT, sale_date TEXT, units INTEGER)` — exactly 28 days
  ending '2026-09-26' (PINNED window).
- Contract: per sku: `sku, on_hand_units, weekly_rate, weeks_of_supply, reorder`.
  weekly_rate = ROUND(1.0 * SUM(units) / 4, 1) (28 days = 4 weeks, PINNED);
  weeks_of_supply = ROUND(on_hand_units / weekly_rate, 1) with the PINNED guard: zero
  sales in the window → weekly_rate 0.0, weeks_of_supply 99.9 (sentinel meaning
  indefinitely stocked), reorder = 1 (state the sentinel). reorder = 1 when
  weeks_of_supply < 2.0 else 0 (the sentinel also flags). ORDER BY weeks_of_supply ASC.
- Seed: 5 skus; fast mover (wos < 2 → reorder), healthy (3-6), overstocked (> 20),
  exact-2.0 boundary (reorder 0 — the edge), no-sales sku (sentinel).
- Probes: 28/7 = 4 weeks computed as 30-day month (pin); sentinel forgotten (division
  by zero error — pin the failure); reorder threshold inclusive <= (pin boundary sku).

### 8071 · returns-rate-by-category · Easy
- Topics tag: "SQL · Rate with LEFT JOIN|Category rollup" · Companies: Zappos|Gap
- Story: return rate by product category — units returned ÷ units sold. Above the
  8 percent wall, merchandising investigates the supplier.
- Tables: `products(sku TEXT PRIMARY KEY, category TEXT)`; `sales(sale_id INTEGER
  PRIMARY KEY, sku TEXT, units INTEGER)`; `returns(return_id INTEGER PRIMARY KEY, sku
  TEXT, units INTEGER)` — only returned skus have rows.
- Contract: per category: `category, sold_units, returned_units, return_pct, flagged`.
  return_pct = ROUND(100.0 * COALESCE(returned, 0) / sold, 2); flagged = 1 when
  return_pct > 8.0 (STRICTLY, PINNED; a category at exactly 8.00 is not flagged —
  plant one). Categories with sales but zero returns still report (LEFT JOIN).
  ORDER BY return_pct DESC, category ASC.
- Seed: 4 categories; one over the wall, one at exactly 8.00 (unflagged edge), one
  clean with zero returns, one small-volume noisy.
- Probes: INNER JOIN drops the zero-return category (pin); >= flags the 8.00 boundary
  (pin); rate computed per-sku then averaged (weighting bug — pin).

### 8072 · cohort-repeat-revenue · Hard
- Topics tag: "SQL · Revenue cohorts|Offset arithmetic" · Companies: Chewy|Warby Parker
- Story: the MONEY cohort triangle — per first-purchase cohort month, how much revenue
  arrives in month 0, 1 and 2 after the first order, and what share of the cohort's
  revenue is repeat business. The retention triangle's revenue-weighted sibling.
- Tables: `orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT,
  revenue_cents INTEGER)`.
- Contract: per cohort (customer's FIRST order month, strftime %Y-%m):
  `cohort_month, m0_revenue, m1_revenue, m2_revenue, repeat_share_pct`. mN_revenue =
  SUM of revenue_cents for cohort customers' orders landing in month offset N (offset =
  (year - cohort year) * 12 + (month - cohort month), computed via strftime arithmetic,
  PINNED). Customers with first order in the seed's LAST month have no m1/m2 yet —
  still report their cohort (m1/m2 = 0). repeat_share_pct = ROUND(100.0 * (m1 + m2) /
  (m0 + m1 + m2), 2), 0.0 when the total is 0 (guard). ORDER BY cohort_month.
- Seed: 3 cohorts; one with strong repeat revenue (share > 30), one one-and-done
  (share 0.0), one partial (m2 in the future — zero); an offset-2 order from a customer
  who skipped month 1.
- Probes: offset computed by date string subtraction instead of month arithmetic (pin);
  repeat_share denominator = m0 only (pin); dropping the youngest cohort (pin row
  count); revenue from non-cohort orders leaking in (missing join back to cohort — pin).

---

## ART BRIEFS (files under `src/components/learn/`)

Four family files, each: 6 problem concept diagrams (860x210 inner `<g>` only) + 1
study flow (860x300). Template: `lc-df-art-bank.tsx` (helpers Box/Tag/Arrow/Note/Defs,
palette C, MONO labels, flat design, NO gradients/filters/shadows, "use client" header).
Marker ids unique per family. Exports wired by the lead.

- `lc-df-art-saas.tsx` (prefix arw-dfs): ArtTrialToPaidFunnel, ArtPlanMigrationPaths,
  ArtMrrWaterfall, ArtNetRevenueRetention, ArtLtvCacPayback, ArtWinbackRecovery,
  ArtStudyRevenueLifecycle.
- `lc-df-art-mktg.tsx` (prefix arw-dfk): ArtRoasByCampaign, ArtFirstLastTouch,
  ArtEmailEngagementFunnel, ArtLinearMultiTouch, ArtBudgetPacing, ArtChannelLtvVsCac,
  ArtStudySpendToSignup.
- `lc-df-art-wh.tsx` (prefix arw-dfw): ArtKeepLatestDedupe, ArtNullBlankAudit,
  ArtPointInTimeAsOf, ArtScd2Build, ArtLateArrivingRestatement, ArtSnapshotDeltaDetect,
  ArtStudyIngestToTrust.
- `lc-df-art-retail.tsx` (prefix arw-dfr): ArtBasketDepthAov, ArtRepeatPurchaseRate,
  ArtRfmSegmentation, ArtWeeksOfSupply, ArtReturnsRateByCategory, ArtCohortRepeatRevenue,
  ArtStudyShopToSegment.

Study flows: revenue-lifecycle (signup → activate → convert → expand → churn → winback
loop), spend-to-signup (spend → impressions → touches → conversion → revenue, with the
CAC/LTV readout), ingest-to-trust (raw feed → dedupe → DQ gate → SCD2 → as-of reads,
with the restatement loop-back), shop-to-segment (browse → order → repeat → segment →
campaign targeting loop-back).
