// Deep-dives — Data & Finance growth file B: usage-tier percentiles, A/B
// sample-ratio mismatch and feature adoption windows (3 problems: 2 Medium,
// 1 Hard, all order:"exact"). Original growth/experiment phrasing — never
// copied problem text; dates are fixed literals so the snapshot is stable.
// Registry wiring (lead): 8016 usage-tier-percentiles ·
// 8017 ab-sample-ratio-mismatch · 8018 feature-adoption-windows.
import type { LcSqlDive } from "../types";

export const SQL_DF_GROWTH_B: LcSqlDive[] = [
  {
    slug: "usage-tier-percentiles",
    statement:
      "The events table is raw activity: one row per event with (user_id, event_date), and an engaged user fires many rows — often several on the same day. Count every user's total events across the whole table, then tier the users by PERCENT_RANK over those counts: pr >= 0.95 is 'whale', pr >= 0.80 is 'power', pr >= 0.50 is 'core', and everyone else is 'casual'. PERCENT_RANK is (rank - 1)/(n - 1) built on RANK, so tied counts share a rank, share a percentile and land in the same tier. Output one row per tier — tier, users, avg_events with the tier's mean event count rounded to 1 decimal — ordered whale, power, core, casual by a pinned CASE, never alphabetically.",
    examples: [
      {
        input:
          "users 19 and 20 tie at 15 events apiece — 15 rows spread over 14 distinct dates each, 2026-01-01 double-logged — the only tie among the 20 counts",
        output: "casual · 10 · 23.1",
        explanation:
          "Both 15s take RANK 1, so each reads pr = 0/19 = 0.0 and joins the eight single owners of 18 through 33 in casual; the ten casual counts sum to 231 and 231/10 rounds to 23.1.",
      },
      {
        input:
          "the six core counts — 35, 38, 40, 45, 50, 55 — where 55's pr reads 15/19 ≈ 0.789, the highest share that stays core",
        output: "core · 6 · 43.8",
        explanation:
          "35 through 55 sum to 263 and 263/6 = 43.8333 rounds to 43.8; the next count up, 60, reads 16/19 ≈ 0.842 and crosses into power, while 33's 9/19 ≈ 0.474 just misses the 0.50 line below.",
      },
    ],
    constraints: [
      "event_count = COUNT(*) per user over raw rows — events, not active days: users 19 and 20 hold 15 rows on 14 distinct dates, and the count stays 15",
      "the pinned tier formula: pr = PERCENT_RANK() OVER (ORDER BY event_count), then CASE WHEN pr >= 0.95 THEN 'whale' WHEN pr >= 0.80 THEN 'power' WHEN pr >= 0.50 THEN 'core' ELSE 'casual' END — PERCENT_RANK = (rank - 1)/(n - 1) on RANK, so the two 15s both read 0.0 and share casual",
      "users = COUNT(*) per tier and avg_events = ROUND(AVG(event_count), 1) — every REAL is born from that ROUND; the seeded populations are 1 whale, 3 power, 6 core, 10 casual",
      "ORDER BY CASE tier WHEN 'whale' THEN 1 WHEN 'power' THEN 2 WHEN 'core' THEN 3 ELSE 4 END — whale first, casual last; alphabetical tier order is a documented wrong order",
    ],
    primer: {
      hook:
        "A percentile is where you stand in line — and tiering users by where they stand is how a growth team says heavy and light without ever naming a fixed number of events.",
      concept: [
        "Every product past a handful of users needs the same vocabulary: who is heavy, who is light, and where the middle sits. A fixed cutoff — 'a power user is anyone with 50 or more events' — sounds precise but ages badly, because 50 is somebody's guess about one month's traffic: as the product grows, that guess becomes either trivially easy for everyone or out of reach for almost everybody. Percentiles invert the question. Instead of asking how many events make a heavy user, they ask what share of users sits at or below each person, so the lines move with the data and the tiers always carve the book the same way — top 5 percent, next 15 percent, middle 30 percent, bottom half — no matter how traffic shifts.",
        "The mechanics are a queue. Line every user up by event count, smallest to largest, and hand out positions from 1 at the front of the line to n at the back. PERCENT_RANK turns each position into a score from 0 to 1 with the formula (rank - 1)/(n - 1) — with 20 users the divisor is 19, so the smallest count reads 0/19 = 0.0, the largest reads 19/19 = 1.0, and everyone between sits proportionally along the ruler. The score answers exactly one question: what fraction of the line stands strictly below me, which is what phrases like top 5 percent actually mean.",
        "Ties are the subtlety. When two users hold the same count, RANK gives both the same position — the better of the two seats — and the next distinct count skips past the occupied seats. Two users tied at the bottom of a 20-user book both take position 1, both read (1 - 1)/19 = 0.0 and both land in the same tier; the user above them jumps straight to position 3. That sharing is deliberate: tied users stand at the same spot in the distribution, so a boundary falling inside a tie drags both members to the same side instead of splitting them by sort-order luck. It is also why the function is built on RANK rather than ROW_NUMBER — numbering the tied pair 1 and 2 would hand the second user a score it did not earn.",
        "Tiers are fixed cut points drawn on that 0-to-1 ruler. This report draws them at 0.95, 0.80 and 0.50 and labels the four bands whale, power, core and casual — whale being the trade's slang for the extreme top of a usage or spending distribution, the few users a business quietly leans on. One rule of bookkeeping comes before any of it: the rank lives on the distribution of COUNTS, so the raw activity rows must first fold into one count per user. Ranking 839 event rows ranks events; ranking the 20 per-user counts is what ranks users.",
      ],
      worked: [
        "Fold the raw activity into per-user counts and sort them: this seed's twenty users read 120, 90, 75, 60, 55, 50, 45, 40, 38, 35, 33, 30, 28, 26, 24, 22, 20, 18, 15, 15 — every value distinct except the planted pair of 15s. With n = 20, every rank divides by 19.",
        "The two 15s share RANK 1, so each scores (1 - 1)/19 = 0.0 — both pinned to the very bottom of the line, both casual.",
        "Walk the ruler upward: 33 takes RANK 10 and reads 9/19 ≈ 0.474, just under the 0.50 line; the very next count, 35, reads 10/19 ≈ 0.526 and turns core — the boundary falls in the gap BETWEEN two users, not on one.",
        "Near the top, 90 reads 18/19 ≈ 0.947 — under 0.95, so power and not whale — while 120 reads 19/19 = 1.0 and is the book's only whale.",
        "Fold the labels: whale 1 user averaging 120.0, power 3 users averaging 225/3 = 75.0, core 6 users averaging 263/6 = 43.8, casual 10 users averaging 231/10 = 23.1 — and 1 + 3 + 6 + 10 rebuilds the 20, so nobody was counted twice.",
      ],
      glossary: [
        { term: "percentile", def: "a position score from 0 to 1 marking the share of the distribution at or below a value" },
        { term: "PERCENT_RANK", def: "window function scoring each row (rank - 1)/(n - 1): 0.0 at the bottom of the line, 1.0 at the top" },
        { term: "RANK", def: "window function giving tied values the same, better position and skipping ahead after a tie — unlike ROW_NUMBER, which numbers ties one by one" },
        { term: "tie", def: "two rows holding the same value — here the same event count — so they share a rank, a score and a tier" },
        { term: "tier", def: "a labeled band cut from the distribution by fixed percentile lines; this report carves whale, power, core and casual" },
        { term: "whale", def: "slang for the extreme top of a usage or spending distribution — the few users a business leans on most" },
      ],
      reallife: [
        "A growth-analytics or CRM team at a consumer app runs a tiering report like this weekly — usually owned by the growth data scientist, with lifecycle marketing as its customer. The tiers decide where budget lands: whales get white-glove treatment and early access, power users get the upgrade nudge, casual users get re-engagement, and the band sizes feed forecasts of how much behavior a product change will touch. The report is also the sanity check behind any 'our top users' claim: a slide saying top 5 percent of users should mean exactly the whale band, not a round number somebody liked.",
        "What breaks in practice: counts built from active days instead of raw events quietly rewrite the ranks (a double-logged day is one row to a distinct-day query but two to this contract), a tie landing on a cut line splits or merges tiers depending on which window function was chosen, and recomputing tiers every week creates migration churn as users slide between bands for no reason a stakeholder can see. The durable fixes are contractual — pin the counting rule, pin the window function, pin the tie behavior, and version the cut lines so last month's report stays reproducible. The numbers drive real decisions: which cohort a new feature ships to first, where retention spend goes, and whether a whale dropping a tier is a churn signal or noise.",
      ],
      where:
        "Growth-analytics and product-data interviews at consumer internet companies — Spotify, Netflix, Duolingo, LinkedIn, Airbnb — lean on percentile tiering and user-segmentation questions for growth and lifecycle roles.",
    },
    breakdown: [
      "The ask is a percentile tiering stacked on an aggregate — two stages that cannot share one GROUP BY. Stage one folds 839 event rows into 20 per-user counts with COUNT(*); stage two ranks THOSE twenty numbers, because the percentile lives on the distribution of counts, not on the raw events. PERCENT_RANK then maps each count to (rank - 1)/(n - 1): twenty users divide by 19, the smallest count reads 0.0, the largest reads 1.0, and the tier lines at 0.95, 0.80 and 0.50 slice the sorted counts into four bands. On this seed the bands hug their lines — 33 reads 9/19 ≈ 0.474 and stays casual, 35 reads 10/19 ≈ 0.526 and turns core — so every boundary is exercised without any count landing exactly on one.",
      "The classic misstep is reaching for ROW_NUMBER instead of RANK — or rather, not noticing that PERCENT_RANK is RANK-based. ROW_NUMBER hands the tied 15s positions 1 and 2, so the second reads 1/19 ≈ 0.0526 instead of 0.0; on this seed both remain casual because the tie sits deep in the bottom band, but the pr = 0.0 club silently shrinks from two users to one, and a tie sitting ON a boundary would drag tiers apart. The sibling error is swapping percent ranks for fixed count cutoffs — 'power means 50 or more events' — which reads like the same report until the book changes shape: with cutoffs at 50 and 20, the whale row vanishes entirely and power balloons to six users. Percentiles measure the distribution; cutoffs measure the author's guess.",
      "The shape is two CTEs and one grouped projection. counted reduces events to (user_id, event_count); ranked stamps PERCENT_RANK() OVER (ORDER BY event_count) onto every row — the OVER's ORDER BY sorts counts ascending and RANK collapses ties onto the smallest position. The final SELECT computes the tier label per row, GROUPs BY that label (SQLite resolves the output alias), and folds each tier into users = COUNT(*) and avg_events = ROUND(AVG(event_count), 1) — the only place rounding fires, so 43.8333 never leaks into the snapshot raw. The pinned CASE in ORDER BY then stacks whale, power, core, casual in that reading order.",
    ],
    edges: [
      "The tie sits at the bottom: users 19 and 20 both take RANK 1, both read pr = 0/19 = 0.0 and both land casual — ties share the smallest rank, so a tie spanning a boundary pulls BOTH members into the lower tier (two 33s would straddle the 0.50 line and both would read 9/19 ≈ 0.474, casual).",
      "Events are counted, not active days: users 19 and 20 hold 15 rows over 14 distinct dates (2026-01-01 double-logged), and COUNT(DISTINCT event_date) would silently rewrite both counts to 14 — the contract counts rows.",
      "ROW_NUMBER splits the tied pair — the second 15 leaves RANK 1, reads 1/19 ≈ 0.0526 and shrinks the pr = 0.0 club from 2 users to 1 on this seed; the tiers survive here only because the tie sits deep in casual (probed).",
      "Fixed count cutoffs are not percentiles: 'power at 50+, core at 20+' ships power 6 users averaging 75.0, core 11 averaging 31.0, casual 3 averaging 16.0 — and the whale row vanishes, because a fixed rule has no top-5-percent mechanic (probed).",
    ],
    ladder: [
      {
        title: "Brute force — sort, eyeball, bucket",
        body: "Pull the 20 counts, sort them, number positions 1 through 20, and hand-compute (position - 1)/19 for each before applying the three lines. Correct for one book, unrunnable for tomorrow's, and the hand never even notices two users sharing position 1.",
      },
      {
        title: "The pattern — count, rank, fold",
        body: "COUNT(*) per user builds the distribution; PERCENT_RANK() OVER (ORDER BY event_count) scores it with tie-sharing RANK semantics built in. A CASE turns each score into a label, and one GROUP BY folds the labels into the four-row report.",
      },
      {
        title: "The optimal idea — the tier is the group",
        body: "O(E) to count the E events plus O(u log u) to sort the u counts — one scan, one sort, one fold. The durable rule: when tiers are defined by percentiles of an aggregate, aggregate first, rank the aggregate, and let the CASE label become the GROUP BY key.",
      },
    ],
    approach:
      "COUNT(*) per user, PERCENT_RANK() OVER (ORDER BY event_count), a four-line CASE into tier labels, then GROUP BY the label with ROUND(AVG(event_count), 1) and a pinned whale-first ORDER BY",
    schema: {
      ddl: `CREATE TABLE events (
  user_id    INTEGER NOT NULL,
  event_date TEXT NOT NULL     -- 'YYYY-MM-DD', one row per event
);`,
      seed: `-- 839 activity rows over 20 users · pinned counts user 1..20:
-- 120, 90, 75, 60, 55, 50, 45, 40, 38, 35, 33, 30, 28, 26, 24, 22, 20, 18, 15, 15
-- users 19 and 20 (the tied 15s) each double-log 2026-01-01: 15 rows on 14 dates
WITH RECURSIVE seq(k) AS (
    SELECT 1 UNION ALL SELECT k + 1 FROM seq WHERE k < 120
),
plan(user_id, total) AS (
    VALUES (1, 120), (2, 90), (3, 75), (4, 60), (5, 55), (6, 50), (7, 45),
           (8, 40), (9, 38), (10, 35), (11, 33), (12, 30), (13, 28), (14, 26),
           (15, 24), (16, 22), (17, 20), (18, 18), (19, 15), (20, 15)
)
INSERT INTO events (user_id, event_date)
SELECT
    p.user_id,
    date('2026-01-01', '+' || CASE WHEN p.user_id >= 19 THEN (s.k - 1) % 14 ELSE s.k - 1 END || ' days')
FROM plan p
JOIN seq s ON s.k <= p.total;`,
      tables: [
        { name: "events", note: "839 raw activity rows over 20 users — pinned counts 120 down to 15, with users 19 and 20 tied at 15 (15 rows on 14 dates each)" },
      ],
    },
    code: `WITH counted AS (
    -- stage one: raw activity rows fold into one count per user — rows,
    -- not active days (the two 15s hold 15 rows on 14 dates)
    SELECT
        user_id,
        COUNT(*) AS event_count
    FROM events
    GROUP BY user_id
),
ranked AS (
    -- stage two: the percentile lives on the DISTRIBUTION of counts —
    -- PERCENT_RANK is (rank - 1)/(n - 1) on RANK, so ties share a score
    SELECT
        event_count,
        PERCENT_RANK() OVER (ORDER BY event_count) AS pr
    FROM counted
)
SELECT
    CASE
        WHEN pr >= 0.95 THEN 'whale'   -- top of the book: 19/19 here
        WHEN pr >= 0.80 THEN 'power'   -- 16/19 and up on this seed
        WHEN pr >= 0.50 THEN 'core'    -- 10/19 and up
        ELSE 'casual'                  -- the bottom half
    END AS tier,
    COUNT(*) AS users,
    ROUND(AVG(event_count), 1) AS avg_events
FROM ranked
GROUP BY tier
ORDER BY CASE tier WHEN 'whale' THEN 1 WHEN 'power' THEN 2 WHEN 'core' THEN 3 ELSE 4 END;`,
    walkthrough: [
      "counted folds the 839 raw rows into 20 counts: 120, 90, 75, 60, 55, 50, 45, 40, 38, 35, 33, 30, 28, 26, 24, 22, 20, 18, 15, 15 — every value distinct except the planted pair of 15s on users 19 and 20, who each spread 15 rows over 14 dates with 2026-01-01 double-logged. ranked then scores the distribution: n = 20 divides every rank by 19, the two 15s share RANK 1 and both read 0/19 = 0.0, and the 18 that follows sits at RANK 3 (the tie consumes position 2 as well) for 2/19 ≈ 0.105. The bands hug their lines: 33 reads 9/19 ≈ 0.474 and stays casual, 35 reads 10/19 ≈ 0.526 and turns core, 55 reads 15/19 ≈ 0.789 and stays core, 60 reads 16/19 ≈ 0.842 and turns power, 90 reads 18/19 ≈ 0.947 and stays power, and the 120 tops out at 19/19 = 1.0 for whale.",
      "The CASE sorts the twenty scores into four labels: whale takes only the 120, power takes 60, 75 and 90, core takes 35 through 55 (six users), and casual absorbs the remaining ten — the tied pair plus 18, 20, 22, 24, 26, 28, 30 and 33. GROUP BY tier folds each label: casual sums 231 over 10 users for 23.1, core sums 263 over 6 for 43.8333 that ROUND trims to 43.8, power sums 225 over 3 for 75.0, and whale's lone user averages its own 120.0. Ten plus six plus three plus one rebuilds the 20 users — the fold moved nobody.",
      "The projection emits exactly four rows in the pinned order: whale, power, core, casual. Alphabetical ORDER BY tier would ship casual first and whale last — the documented wrong order, and the reason the CASE lives in the ORDER BY rather than trusting a default. Every REAL in the output was born inside a ROUND(..., 1): 43.8333 and 23.1 never appear at any other precision, so the snapshot is bit-stable run to run.",
    ],
    time: "O(E + u log u) over E events and u users — one scan to count 839 rows, one sort of the 20 counts for the window, one pass to tier and fold",
    space: "O(u) — 20 per-user counts and scores held through the two CTEs before the four-row fold",
    followUps: [
      "Re-run the tiering week over week and report migrations — how many of last week's casual users are core this week, and what does a whale downgrade do to the tier's average?",
      "Attach revenue to each tier and report value share instead of user share — does 5 percent of users being whales mean 5 percent of value, and which aggregate prices each tier's mean honestly?",
      "Swap PERCENT_RANK for CUME_DIST on the same counts — the two disagree only on ties (the 15s read 0.0 versus 0.1), so which wording would the whale contract need to keep the same row?",
    ],
    related: ["dau-wau-stickiness", "top-percentile-fraud", "growth-accounting"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "ab-sample-ratio-mismatch",
    statement:
      "Every row of experiments pins one test's planned split: (experiment_id, exp_name, expected_control_share). The assignments table logs one row per enrolled user — variant 'control', 'treatment', or NULL when assignment failed and the user never entered an arm. Per experiment, count both arms, compute expected_control_n = ROUND((control_n + treatment_n) * expected_control_share) from those two counts alone, and grade health as deviation_pct = ROUND(100.0 * ABS(control_n - expected_control_n) / expected_control_n, 2) — the CONTROL side only. Flag 'SRM' when deviation_pct is strictly above 5.0 and 'ok' otherwise (exactly 5.0 passes), reporting experiment_id, exp_name, control_n, treatment_n, expected_control_n, deviation_pct, srm_flag in experiment_id order.",
    examples: [
      {
        input:
          "E3 onboarding-nudge plans a 0.7 control share — 133 control and 67 treatment assignments landed (200 armed users, 1 failed assignment excluded)",
        output: "3 · onboarding-nudge · 133 · 67 · 140 · 5 · ok",
        explanation:
          "expected_control_n = ROUND(200 * 0.7) = 140 and the control side misses by 7, so deviation_pct = ROUND(100.0 * 7 / 140, 2) = 5.0 — exactly the boundary (the snapshot prints the trailing-zero REAL as 5), and the strict > keeps the flag 'ok'.",
      },
      {
        input:
          "E2 pricing-page plans a 50/50 split — 120 control against 80 treatment, the classic broken randomizer",
        output: "2 · pricing-page · 120 · 80 · 100 · 20 · SRM",
        explanation:
          "expected_control_n = ROUND(200 * 0.5) = 100, and 100.0 * ABS(120 - 100) / 100 = 20.0 clears the 5.0 line four times over — the only seeded test whose randomizer actually broke.",
      },
    ],
    constraints: [
      "NULL-variant assignment rows are failed assignments — excluded from control_n, treatment_n and the total (the seed hides 5 of them: 2 on E1, 2 on E2, 1 on E3)",
      "the pinned formulas: expected_control_n = ROUND((control_n + treatment_n) * expected_control_share) — SQLite ROUND is half away from zero and returns REAL (200 * 0.7 → 140.0); deviation_pct = ROUND(100.0 * ABS(control_n - expected_control_n) / expected_control_n, 2) — control side only",
      "srm_flag = 'SRM' when deviation_pct > 5.0 ELSE 'ok' — strict >, so E3's exact 5.0 stays 'ok', and the flag reads the ROUNDED deviation, the number the report prints",
      "ORDER BY experiment_id ASC",
    ],
    primer: {
      hook:
        "Sample ratio mismatch is the smoke alarm of A/B testing — it checks the coin flip before anyone is allowed to trust the lift.",
      concept: [
        "Every A/B test rests on one promise: users were split between the arms by chance alone. That randomness is the whole warrant for saying the new experience caused any difference in behavior, and it has a property no metric has — the split itself is checkable with arithmetic before the experiment even finishes. A test that planned a 50/50 split but enrolled 120 control against 80 treatment is not running a fair comparison; the imbalance may be harmless, but it may also mean the arms differ in composition — different devices, countries or intent — before they differ in behavior. So every serious experimentation system runs this check automatically, daily, on every live test, before any lift is read.",
        "The alarm is called a sample ratio mismatch, or SRM: the observed sample ratio — the raw counts of enrolled users per arm — drifting too far from the planned split. The planned side lives in the expected_control_share recorded with each experiment: 0.5 means a 50/50 plan, 0.7 means 70 percent of users are meant to land in control. What breaks in practice is rarely exotic — a randomizer keyed on a field that is not uniformly distributed, a logging pipeline that drops one arm's events, bot filtering that fires harder on one arm, redirects that lose users between assignment and first event, or an experiment stopped early after a peek. The alarm never says which failure happened; it says the machinery is no longer trustworthy, so the correct response is to pause and debug, not to read the metrics anyway.",
        "The arithmetic is deliberately small. Count the armed users per arm — a user whose variant reads NULL is a failed assignment: sampled but never entered into an arm, so they count in no arm and no total. Multiply the armed total by the planned share to get the expected control size, then measure how far the observed control count sits from it in percent: 100.0 times the absolute difference, divided by the expected size. That deviation is graded against a tolerance — 5.0 here — with a strict greater-than, so a deviation sitting exactly on the line passes. The control side owns the check because the planned share names the control arm; grading the treatment side against its own leftover expectation is a different, wrong report.",
        "Two habits keep the check honest at scale. First, flag the number you print: round the deviation once, then compare the rounded value to the tolerance, so a report showing 5.0 can never carry a flag that says SRM. Second, refuse to count what never entered: failed assignments inflate the total, shift the expected size, and can flip a healthy boundary case into a false alarm — the guard that excludes NULL variants is load-bearing. Programs running thousands of concurrent tests keep the SRM dashboard as the first screen every morning precisely because it is cheap, automatic, and the only check that can invalidate a test before a single metric is computed.",
      ],
      worked: [
        "E2 pricing-page plans a 50/50 split. Its assignment rows hold 120 control, 80 treatment and 2 failed assignments with NULL variants — the NULLs count nowhere, so the armed total is 120 + 80 = 200.",
        "Expected control size = ROUND(200 * 0.5) = 100 — the plan promised the control arm half of 200 users.",
        "Deviation = 100.0 * |120 - 100| / 100 = 20.0 — four times the 5.0 tolerance, so E2 flags SRM: the randomizer broke, and no lift from this test is readable.",
        "E3 onboarding-nudge plans 0.7: expected control = ROUND(200 * 0.7) = 140 against an observed 133, so deviation = 100.0 * 7 / 140 = 5.0 — exactly the line, and the strict greater-than lets the healthy test pass.",
        "Feed E3's one failed assignment back in and the total becomes 201, expected becomes ROUND(140.7) = 141, and deviation jumps to 100.0 * 8 / 141 = 5.67 — a false SRM on a healthy test. The NULL guard is what stands between the report and that mistake.",
      ],
      glossary: [
        { term: "sample ratio", def: "the observed split of enrolled users across a test's arms — 120 against 80 is a 60/40 sample ratio" },
        { term: "SRM", def: "sample ratio mismatch — the health alarm that fires when the observed arm split drifts beyond tolerance from the planned split" },
        { term: "control", def: "the baseline arm users are randomly placed into; the arm the planned share and the deviation are named against" },
        { term: "treatment", def: "the new experience being measured against the control arm" },
        { term: "expected_control_share", def: "the planned share of armed users meant to land in control — 0.5 is a 50/50 plan, 0.7 sends 70 percent to control" },
        { term: "failed assignment", def: "a row with a NULL variant — the user was sampled but never entered an arm, so they count in no arm and no total" },
      ],
      reallife: [
        "At companies that experiment at scale, SRM monitoring is automated and non-negotiable: the experimentation teams at Booking.com, Netflix, Uber and LinkedIn recompute every live test's arm counts daily, and a flagged test pages its owner before any metric dashboard is opened. The check is owned by the experimentation group's data engineers and quantitative analysts; product teams simply see their test pause. What breaks is seldom the math — randomizers whose hash is not uniform, assignment logging that loses one arm's rows, bots filtered out of one arm but not the other, and early-stopping rules that peek at results all produce the same alarm. The almost-always-correct response is to pause, debug the machinery and re-run, not to argue that the lift looked good anyway.",
        "The numbers drive immediate decisions: a test with SRM is killed or restarted and its results struck from the record, because a randomizer bug can invalidate weeks of enrolled traffic — which is exactly why the check runs before every other metric. The tolerance itself is policy: a flat 5 percent line catches real breakage on large tests but flirts with noise on tiny ones, so many programs scale the threshold to sample size or use a chi-square test across all arms. Interviewers ask SRM questions for the same reason employers run the check — it separates people who understand that experiment validity precedes experiment results from people who compute lift on whatever rows happen to be in the table.",
      ],
      where:
        "Experimentation and product-analytics interviews at heavy-testing companies — Booking.com, Netflix, Airbnb, Uber, LinkedIn, Duolingo — use SRM as a standard screen for data science, experiment-ops and analytics-engineering roles.",
    },
    breakdown: [
      "Sample ratio mismatch is the single most reused experiment-health check in industry — every serious A/B platform runs it automatically before anyone reads a metric. The idea is brutally simple: a test that planned a 50/50 split but enrolled 120 control against 80 treatment is not measuring anything until the randomizer is fixed, because the arms may differ in composition before they differ in behavior. The SQL is conditional aggregation plus one ratio — COUNT(CASE WHEN variant = 'control' THEN 1 END) per arm, a ROUND over the planned share, one ABS division. The craft is not the arithmetic; it is pinning WHICH side deviates and WHERE the flag boundary sits.",
      "Three missteps own this problem. First, the naive COUNT(variant = 'control') counts every row where the expression is non-NULL — that is 1s AND 0s, both arms — so E1 and E2 both read 200 against 200 and E2's genuine 20.0 percent SRM hides behind a clean 0.0. Second, measuring the treatment side instead of the control side: E3's treatment arm misses ITS expectation (200 - 140 = 60 planned, 67 observed) by 100.0 * 7 / 60 = 11.67 — an alarm — while the contract's control side misses by exactly 5.0 and passes. Third, letting the 5 NULL-variant rows into the total: 202 and 201 replace 200, E3's expected becomes ROUND(201 * 0.7) = 141.0, and the deviation jumps to 5.67 — flipping a boundary pass into a false SRM.",
      "The shape is three small CTEs, each doing one job. arms conditional-counts both variants per experiment with the NULL guard in the WHERE; sized adds expected_control_n = ROUND(total * expected_control_share) — SQLite's ROUND is half away from zero and hands back a REAL, so 140.0 not 140; scored computes the rounded deviation once. The final projection derives srm_flag from the ALREADY-ROUNDED deviation_pct — flag the number you print, or the report and the flag can disagree at the boundary — and ORDER BY experiment_id keeps the three tests in id order.",
    ],
    edges: [
      "The 5 NULL-variant rows are landmines for any COUNT(*)-style total: E3's total becomes 201, expected_control_n becomes ROUND(201 * 0.7) = 141.0, and deviation 5.67 flips the boundary case to 'SRM' (probed) — the WHERE variant IS NOT NULL guard is what keeps armed users only.",
      "Deviation is CONTROL-side only: E3's treatment side would read |67 - 60| / 60 = 11.67 and flag a healthy test 'SRM' (probed) — the expected share names the control arm, so the control arm owns the deviation.",
      "The boundary is strict: E3's deviation lands on exactly 5.0 (100.0 * 7 / 140, no rounding dust since 700/140 is exact in binary) and stays 'ok'; a >= comparison flips it (probed) — and the flag reads the ROUNDED deviation, not a hidden raw ratio.",
      "COUNT(variant = 'control') is the silent killer: the expression is 1 for control, 0 for treatment and NULL for failed rows, so COUNT tallies the 1s AND the 0s — both arms — and E2's 20.0 SRM reads 0.0 'ok' (probed); COUNT(CASE WHEN ... THEN 1 END) tallies only the 1s.",
    ],
    ladder: [
      {
        title: "Brute force — eyeball each experiment",
        body: "Open each experiment's assignment rows, tally control and treatment by hand, multiply the total by the planned share, and compare. Three experiments is human-scale; three hundred is not, and the NULL rows make hand-tallying treacherous exactly when it matters.",
      },
      {
        title: "The pattern — conditional counts, one ratio",
        body: "One GROUP BY per experiment with COUNT(CASE WHEN variant = 'control' THEN 1 END) (and the treatment twin) builds both arms in a single pass. The planned size, the ABS ratio and the strict flag compose on top in two short CTEs.",
      },
      {
        title: "The optimal idea — flag the printed number",
        body: "O(a) over the a assignment rows: one scan to arm-count, constant work per experiment afterward. The durable rules — exclude the unassigned, compute the expected from the ARMED total only, round once, and flag the rounded control-side deviation with a strict inequality.",
      },
    ],
    approach:
      "conditional COUNTs per experiment (NULL variants excluded), expected_control_n = ROUND(total * share), control-side deviation rounded to 2 decimals, strict > 5.0 flags 'SRM'",
    schema: {
      ddl: `CREATE TABLE experiments (
  experiment_id          INTEGER PRIMARY KEY,
  exp_name               TEXT NOT NULL,
  expected_control_share REAL NOT NULL     -- planned share of CONTROL, 0.5 = 50/50
);

CREATE TABLE assignments (
  experiment_id INTEGER NOT NULL,
  user_id       INTEGER NOT NULL,
  variant       TEXT           -- 'control' / 'treatment' / NULL = failed assignment
);`,
      seed: `-- 3 experiments · armed rows E1 100/100, E2 120/80 (the broken randomizer),
-- E3 133/67 against a 0.7 plan (the 5.0 boundary case) · 5 failed-assignment
-- rows carry NULL variants (2 on E1, 2 on E2, 1 on E3) and never count
INSERT INTO experiments (experiment_id, exp_name, expected_control_share) VALUES
  (1, 'checkout-v2', 0.5),
  (2, 'pricing-page', 0.5),
  (3, 'onboarding-nudge', 0.7);

-- user ids are spaced per experiment (2xxx = E3) and the NULL rows trail each
-- experiment's range: 201/202, 1201/1202, 2201
WITH RECURSIVE seq(k) AS (
    SELECT 1 UNION ALL SELECT k + 1 FROM seq WHERE k < 200
)
INSERT INTO assignments (experiment_id, user_id, variant)
SELECT 1, k, CASE WHEN k <= 100 THEN 'control' ELSE 'treatment' END FROM seq
UNION ALL SELECT 1, 200 + k, NULL FROM seq WHERE k <= 2
UNION ALL
SELECT 2, 1000 + k, CASE WHEN k <= 120 THEN 'control' ELSE 'treatment' END FROM seq
UNION ALL SELECT 2, 1200 + k, NULL FROM seq WHERE k <= 2
UNION ALL
SELECT 3, 2000 + k, CASE WHEN k <= 133 THEN 'control' ELSE 'treatment' END FROM seq
UNION ALL SELECT 3, 2200 + k, NULL FROM seq WHERE k <= 1;`,
      tables: [
        { name: "experiments", note: "3 tests — checkout-v2 and pricing-page plan 50/50, onboarding-nudge plans 0.7 control and lands exactly on the 5.0 deviation boundary" },
        { name: "assignments", note: "605 rows — armed 100/100, 120/80, 133/67 plus 5 NULL-variant failed assignments (2/2/1) that every count must refuse" },
      ],
    },
    code: `WITH arms AS (
    -- one row per experiment: both arms conditional-counted, and the NULL
    -- guard documents that failed assignments never enter ANY count
    SELECT
        e.experiment_id,
        e.exp_name,
        e.expected_control_share,
        COUNT(CASE WHEN a.variant = 'control' THEN 1 END) AS control_n,
        COUNT(CASE WHEN a.variant = 'treatment' THEN 1 END) AS treatment_n
    FROM experiments e
    JOIN assignments a ON a.experiment_id = e.experiment_id
    WHERE a.variant IS NOT NULL
    GROUP BY e.experiment_id, e.exp_name, e.expected_control_share
),
sized AS (
    -- planned control size from the ARMED total — ROUND is half away from
    -- zero and returns REAL, so 200 * 0.7 reads 140.0
    SELECT
        experiment_id,
        exp_name,
        control_n,
        treatment_n,
        ROUND((control_n + treatment_n) * expected_control_share) AS expected_control_n
    FROM arms
),
scored AS (
    -- the CONTROL side owns the deviation, rounded once to 2 decimals
    SELECT
        experiment_id,
        exp_name,
        control_n,
        treatment_n,
        expected_control_n,
        ROUND(100.0 * ABS(control_n - expected_control_n) / expected_control_n, 2) AS deviation_pct
    FROM sized
)
SELECT
    experiment_id,
    exp_name,
    control_n,
    treatment_n,
    expected_control_n,
    deviation_pct,
    CASE WHEN deviation_pct > 5.0 THEN 'SRM' ELSE 'ok' END AS srm_flag   -- strict >: exactly 5.0 passes
FROM scored
ORDER BY experiment_id ASC;`,
    walkthrough: [
      "arms walks 605 assignment rows — 200 armed on E1, 200 on E2, 200 on E3 — plus the 5 NULL rows that the WHERE guard and the conditional COUNTs both refuse to count. The arms read 100/100 on E1, 120/80 on E2 and 133/67 on E3; every armed total is 200 because the failed rows never entered. COUNT(CASE WHEN ... THEN 1 END) is doing the work: the CASE yields 1 only inside its arm and NULL everywhere else, and COUNT skips NULLs — the naive COUNT(variant = 'control') would tally the 0-rows too.",
      "sized and scored turn each row into its grade. E1: expected ROUND(200 * 0.5) = 100.0, deviation 100.0 * 0 / 100 = 0.0, 'ok'. E2: expected 100.0, deviation 100.0 * 20 / 100 = 20.0 — four times the 5.0 line — 'SRM'. E3: expected ROUND(200 * 0.7) = 140.0, deviation 100.0 * 7 / 140 = 5.0 exactly — no rounding dust, since 700/140 is exact in binary — and the strict > stamps 'ok' on the boundary itself.",
      "The projection ships three rows in experiment_id order: the clean test, the broken randomizer and the boundary pass. Every REAL cell was born in a ROUND — the 140.0 expected size and the 0.0, 20.0 and 5.0 deviations (the snapshot prints trailing-zero REALs as 140, 0, 20, 5). Read as a dashboard: one green, one red, one sitting exactly on the yellow line and correctly staying green.",
    ],
    time: "O(a) over the a assignment rows (605 here) — one grouped scan for both arms, then constant work per experiment through sized and scored",
    space: "O(e) — one row per experiment (3) flowing through the three CTEs",
    followUps: [
      "Extend to a 3-variant test with per-variant expected shares — how does the conditional-count block grow, and should the deviation be the MAX over arms or a proper chi-square statistic?",
      "Alert on CONSECUTIVE-day SRM: join this report to itself over run dates and flag only tests that fail two days running — which window frame counts the streak?",
      "Recompute deviation on the treatment side for every experiment and report BOTH columns — which seeded experiment exposes why one-sided monitoring is the contract, and what does the wrong side read on E3?",
    ],
    related: ["ab-test-conversion-lift", "funnel-step-conversion", "compute-the-rank-as-a-percentage"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "feature-adoption-windows",
    statement:
      "The users table holds (user_id, signup_date) and the feature_events table logs one row per user per usage day — engaged users repeat rows, sometimes several on the same date. Bucket users into signup-WEEK cohorts: cohort_week is the MONDAY of each user's signup week, computed as date(signup_date, '-' || ((CAST(strftime('%w', signup_date) AS INTEGER) + 6) % 7) || ' days'), and every window is measured against each user's OWN signup date, never the cohort's Monday. first_use_days is CAST(julianday(first feature row) - julianday(signup_date) AS INTEGER) per user, and users with no feature rows stay in their cohort contributing zero to every share. Report cohort_week, users (the full cohort size), pct_7d, pct_14d and pct_30d — ROUND(100.0 * AVG(first_use_days <= deadline), 1) at each deadline — ordered by cohort_week ascending.",
    examples: [
      {
        input:
          "the 2026-09-14 cohort — user 7 signs up Tue 2026-09-15 and uses the feature the SAME day, user 8 follows within 2 days, user 9 needs 9, and users 10 and 11 never touch it",
        output: "2026-09-14 · 5 · 40 · 60 · 60",
        explanation:
          "2 of 5 first touches land within 7 days (days 0 and 2), user 9's day 9 makes 3 of 5 by day 14, and nobody else arrives — the two never-users hold the denominator at 5 for every deadline, which is why pct_30d stays 60.0 instead of running to 100.0.",
      },
      {
        input:
          "user 3 signs up 2026-09-10 and logs TWO feature rows on 2026-09-16 — same day, two rows; user 1's second row waits until 2026-09-17",
        output: "2026-09-07 · 6 · 50 · 66.7 · 83.3",
        explanation:
          "MIN(used_date) reads 2026-09-16 once, so first_use_days = CAST(julianday('2026-09-16') - julianday('2026-09-10') AS INTEGER) = 6; the cohort lands 3 of 6 inside 7 days, 4 of 6 inside 14 and 5 of 6 inside 30 — 50.0, 66.7 (66.666… rounded) and 83.3 (83.333… rounded).",
      },
    ],
    constraints: [
      "cohort_week = date(signup_date, '-' || ((CAST(strftime('%w', signup_date) AS INTEGER) + 6) % 7) || ' days') — %w reads Sunday as 0, so (w + 6) % 7 counts days since Monday and the shift lands every signup on its week's Monday (no seeded signup falls on a Monday, so the shift always fires)",
      "first_use_days = CAST(julianday(MIN(used_date)) - julianday(signup_date) AS INTEGER) per user — MIN drives (a same-day duplicate on user 3 and consecutive-day rows on user 7 are in the seed), and a never-user reads NULL",
      "pct_7d / pct_14d / pct_30d = ROUND(100.0 * AVG(CASE WHEN first_use_days <= 7, 14 or 30 THEN 1 ELSE 0 END), 1) — the CASE is load-bearing: a bare AVG(first_use_days <= 7) lets NULL comparisons escape the average and silently drops never-users from the denominator",
      "users = COUNT(*) over the LEFT-joined cohort (every signup counts, 6 / 5 / 4 here), ORDER BY cohort_week ASC",
    ],
    primer: {
      hook:
        "An adoption window is each new user's personal countdown — N days from THEIR own signup to give a feature one honest try.",
      concept: [
        "Shipping a feature is the easy half; finding out whether anyone actually used it is the metric that matters. Adoption here means a user did not merely see the feature but used it — logged at least one feature event — and the interesting question is how long that took. The measurement tool is the adoption window: a deadline of N days counted from the moment each user arrived, with the share of users who beat it reported at 7, 14 and 30 days. The clock is personal: day 0 is a user's own signup date, so a Tuesday signup's 7-day window closes the following Tuesday, not on some calendar boundary the reporting team picked.",
        "Personal clocks are what make cohorts comparable. New users trickle in across the whole week rather than arriving on schedule, so the report first files them by signup week — the Monday of each user's signup date, which every date from Tuesday through Sunday walks back to. The cohort is the filing cabinet: users who arrived together run their windows together, which is what makes week-over-week rows apples-to-apples — same age, same deadlines, one release environment. Inside the cohort, though, each window is still measured from each user's OWN signup; anchoring the clocks on the cohort's Monday instead would start a Tuesday signup's clock a day early and a Sunday signup's six days early, aging everyone wrong and bending every percentage.",
        "The denominator rule is the soul of the metric: an adoption rate is the share of EVERYONE who arrived, not the share of everyone who tried. Users who never touch the feature — never-users — stay in their cohort and count as zeros in every window, because they are precisely the outcome the number exists to measure. Each percentage is therefore a conditional average over the full cohort: map each user to 1 when their days-to-first-use is within the deadline and to 0 otherwise, then average. A never-user's days are NULL, and NULL must map to a counted 0 rather than slip out of the average — an average that drops them is survivorship wearing a percentage sign.",
        "First use is a MIN: a user may log several rows — the same day twice, a return weeks later — and only the earliest row starts the clock. The three windows nest, so anyone inside 7 days is automatically inside 14 and 30 and the shares can only grow from pct_7d to pct_14d to pct_30d; the gaps between them are the reading, telling instant adoption apart from slow burn. The deadlines themselves are a habit, not a law — they should match how fast the feature could plausibly become routine, which is why a daily-use feature and a tax-season feature would never share a window.",
      ],
      worked: [
        "User 3 signs up 2026-09-10 and logs two feature rows on 2026-09-16 — a same-day duplicate. MIN collapses them to one first use, and the clock reads 6 days: inside the 7-day window.",
        "User 5 signs up 2026-09-12 and first touches the feature on 2026-10-04: 22 days. That misses 7 and 14 but makes 30 — a slow-burn adopter, exactly the case the wider windows exist to catch.",
        "User 6, same cohort, never logs a feature row. First use is NULL, but the user stays in the cohort — a counted zero in every share, holding the denominator at the full 6.",
        "Fold the 2026-09-07 cohort: six users whose days-to-first-use read 1, 5, 6, 12, 22 and one never-user. Within 7 days: 3 of 6 = 50.0. Within 14: 4 of 6 = 66.7. Within 30: 5 of 6 = 83.3.",
        "Check the personal clock against the calendar: user 3's day 6 lands on 2026-09-16, a date in the FOLLOWING calendar week. A calendar-week report would file that touch into a different week's story; the signup-anchored window keeps it attached to the user it belongs to.",
      ],
      glossary: [
        { term: "adoption window", def: "a personal deadline of days counted from each user's OWN signup, inside which their first use must land to count" },
        { term: "cohort week", def: "the Monday of a signup date — the shared start that files users into comparable groups; every date from Tuesday to Sunday walks back to it" },
        { term: "first use", def: "a user's earliest feature event, MIN over all their rows — duplicates and repeat days collapse onto it and later rows never move it" },
        { term: "never-user", def: "a signup with no feature rows at all; they stay in the cohort and count as a zero in every window's share" },
        { term: "first_use_days", def: "a user's age at first use, in whole days since signup — 0 for a same-day adopter, NULL for a never-user" },
        { term: "denominator", def: "the population a percentage divides by; here the FULL cohort of signups, never-users included, never just the users who touched the feature" },
      ],
      reallife: [
        "A growth team at a consumer product runs this shape of report for every meaningful launch — the product-analytics groups at Duolingo, Spotify, LinkedIn and Notion watch adoption cohort by cohort: did this week's signups reach the feature inside a week, two weeks, a month? The product manager owns the number, the growth data scientist builds the query, and the rows drive the next move — surface the feature in onboarding, move its entry point, or accept that it serves a niche. The same report prices acquisition: if only a quarter of a cohort adopts within 30 days, the payback math on every marketing dollar changes.",
        "What breaks in practice: event pipelines drop rows and turn real users into phantom never-users, teams anchor windows on the calendar instead of the signup and quietly age half the cohort wrong, and dashboards that INNER JOIN the event table evict never-users from the denominator — every share inflates and the report turns green precisely while the product is failing. Deadlines drift too: changing a window from 14 to 30 days mid-quarter makes the trend unreadable unless both versions ship side by side for a quarter. The numbers decide which features get a second onboarding slot, which get killed, and how onboarding is re-sequenced, which is why the counting rules get pinned in writing the way this problem pins them.",
      ],
      where:
        "Growth and product-analytics interviews at consumer companies — Duolingo, LinkedIn, Uber, Airbnb, Netflix — use cohort adoption and time-to-first-use questions to screen for metric-design sense.",
    },
    breakdown: [
      "The report is a cohort decomposition wearing three deadlines. One spine — the Monday of each signup week — folds 15 scattered signups into 3 cohort rows; one per-user fact — days from signup to first feature use — feeds every percentage; and three deadlines (7, 14, 30) are three conditional averages over the same rows. The Monday expression is the fiddly part: strftime('%w') numbers Sunday 0 through Saturday 6, so (w + 6) % 7 counts days since the most recent Monday, and date(signup_date, '-N days') walks back onto the week's spine. Every seeded signup falls Tuesday through Sunday precisely so the shift always fires — a Monday signup would shift 0 and quietly test nothing.",
      "Anchor placement is the whole game. Windows measure from each user's OWN signup_date — user 3 adopted on day 6 from its Wednesday signup — and anchoring on the cohort's Monday instead turns that day 6 into day 9, pushes user 4 from day 12 to day 16, and rewrites week 1 to 33.3 / 50.0 / 83.3. The second trap is the denominator: never-users must sit in every average, and both INNER JOINing the first-use CTE and writing a bare AVG(first_use_days <= 7) evict them — week 2 inflates to 66.7 / 100.0 / 100.0 either way, and only the users column (3 versus 5) tells you which mistake fired. The CASE WHEN ... THEN 1 ELSE 0 END is what turns NULL into a counted zero.",
      "Per-user first use must come from MIN(used_date) — never MAX, never a raw join. User 3 logs two rows on 2026-09-16 (a same-day duplicate) and user 7 logs 2026-09-15 then 2026-09-16 (consecutive days); MIN absorbs both shapes, while MAX pushes user 1 from day 1 to day 9 (its second row) and drops week 1's pct_7d to 33.3, and a raw users-times-events join double-counts multi-row users AND evicts never-users in one move (week 1 reads 57.1 / 85.7 / 100.0 on a degenerate 7-row denominator). The fix is a first-use CTE: MIN per user, LEFT JOIN back onto users, and three conditional AVGs that see exactly one row per user.",
    ],
    edges: [
      "The Monday arithmetic: (w + 6) % 7 with %w Sunday = 0 — Tuesday 2026-09-08 shifts 1 day back to 2026-09-07 and Sunday 2026-09-13 shifts 6; dropping the shift yields SUNDAY weeks, so signup 6 slides out of week 1 into the following cohort and the middle row reads 6 users at 33.3 / 50.0 / 50.0 instead of 5 at 40.0 / 60.0 / 60.0 (probed).",
      "Never-users are part of every denominator: the LEFT JOIN keeps them, first_use_days reads NULL, and the CASE maps that NULL to a counted 0 — INNER JOIN evicts them (week 2: users 5 → 3, pcts 40.0/60.0/60.0 → 66.7/100.0/100.0, probed) and a bare AVG(boolean) evicts them while COUNT still says 5 (same inflated shares, users column unmoved, probed).",
      "The anchor is each user's OWN signup_date: anchoring on the cohort Monday turns user 3's day 6 into day 9 and user 4's day 12 into day 16 — week 1 reads 33.3 / 50.0 / 83.3 (probed).",
      "MIN(used_date) drives first use: user 3's same-day duplicate and user 7's consecutive rows are both absorbed; MAX flips user 1 to its 2026-09-17 row (day 9) and week 1's pct_7d sags to 33.3 (probed).",
      "CAST(julianday(...) - julianday(...)) is exact here because both dates are midnights — dust would appear with timestamps, and ROUND instead of CAST agrees on this seed for the same reason (probed as a documented agreement, not a live trap).",
    ],
    ladder: [
      {
        title: "Brute force — one user at a time",
        body: "For each of the 15 users find their earliest feature row, count days from signup, tick the 7 / 14 / 30 boxes by hand, then average per week. Fifteen users is tractable; the hand slips exactly where the traps live — the never-users and the double-logged rows.",
      },
      {
        title: "The pattern — first-use CTE, LEFT JOIN, three AVGs",
        body: "MIN(used_date) per user builds the first-use fact; LEFT JOINing it onto users keeps never-users with NULL days. Three ROUND(100.0 * AVG(CASE ...), 1) columns evaluate the deadlines, and GROUP BY the computed Monday assembles the cohorts.",
      },
      {
        title: "The optimal idea — one LEFT JOIN, three deadlines",
        body: "O(f) over the f feature rows to find first uses, then one pass over 15 users — adoption is a conditional-aggregation report, not three queries. The durable shape: per-user facts in a CTE, LEFT JOIN for the denominator, CASE-averages for the deadlines, and the cohort key computed once in the projection.",
      },
    ],
    approach:
      "MIN(used_date) per user, LEFT JOIN onto users so never-users count, Monday-of-signup-week cohort key, three ROUND(100.0 * AVG(CASE WHEN first_use_days <= deadline), 1) columns",
    schema: {
      ddl: `CREATE TABLE users (
  user_id     INTEGER PRIMARY KEY,
  signup_date TEXT NOT NULL      -- 'YYYY-MM-DD'
);

CREATE TABLE feature_events (
  user_id   INTEGER NOT NULL,
  used_date TEXT NOT NULL        -- one row per user per usage day (may repeat)
);`,
      seed: `-- 15 signups in 3 Monday cohorts · week 2026-09-07: users 1-6 · week
-- 2026-09-14: users 7-11 · week 2026-09-21: users 12-15 · no signup is a Monday
INSERT INTO users (user_id, signup_date) VALUES
  (1, '2026-09-08'), (2, '2026-09-09'), (3, '2026-09-10'),
  (4, '2026-09-11'), (5, '2026-09-12'), (6, '2026-09-13'),
  (7, '2026-09-15'), (8, '2026-09-16'), (9, '2026-09-17'),
  (10, '2026-09-18'), (11, '2026-09-19'),
  (12, '2026-09-22'), (13, '2026-09-23'), (14, '2026-09-24'), (15, '2026-09-25');

-- first touches: user 1 adopts day 1 and returns day 9 · user 3 double-logs
-- the SAME day (two rows on 2026-09-16) · user 7 logs consecutive days ·
-- users 6, 10, 11, 14, 15 never use the feature
INSERT INTO feature_events (user_id, used_date) VALUES
  (1, '2026-09-09'), (1, '2026-09-17'),
  (2, '2026-09-14'),
  (3, '2026-09-16'), (3, '2026-09-16'),
  (4, '2026-09-23'),
  (5, '2026-10-04'),
  (7, '2026-09-15'), (7, '2026-09-16'),
  (8, '2026-09-18'),
  (9, '2026-09-26'),
  (12, '2026-09-26'),
  (13, '2026-10-04');`,
      tables: [
        { name: "users", note: "15 signups across 3 Monday cohorts (2026-09-07 / 14 / 21) — Tue-Sun only, so no signup skips the Monday shift" },
        { name: "feature_events", note: "13 usage rows over 11 users — user 3 double-logs 2026-09-16, user 7 logs consecutive days, and 4 users never appear" },
      ],
    },
    code: `WITH first_use AS (
    -- the per-user fact: FIRST touch only — MIN absorbs same-day duplicates
    -- (user 3) and consecutive-day rows (user 7) — MAX or a raw join would not
    SELECT
        user_id,
        MIN(used_date) AS first_used
    FROM feature_events
    GROUP BY user_id
),
dated AS (
    -- one row per SIGNUP (LEFT JOIN keeps never-users with NULL days), each
    -- stamped with its Monday spine and its days-to-first-use
    SELECT
        u.user_id,
        date(u.signup_date,
             '-' || ((CAST(strftime('%w', u.signup_date) AS INTEGER) + 6) % 7) || ' days') AS cohort_week,
        CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS first_use_days
    FROM users u
    LEFT JOIN first_use f ON f.user_id = u.user_id
)
SELECT
    cohort_week,
    COUNT(*) AS users,   -- the cohort size: every signup, feature use or not
    ROUND(100.0 * AVG(CASE WHEN first_use_days <= 7  THEN 1 ELSE 0 END), 1) AS pct_7d,
    ROUND(100.0 * AVG(CASE WHEN first_use_days <= 14 THEN 1 ELSE 0 END), 1) AS pct_14d,
    ROUND(100.0 * AVG(CASE WHEN first_use_days <= 30 THEN 1 ELSE 0 END), 1) AS pct_30d
FROM dated
GROUP BY cohort_week
ORDER BY cohort_week ASC;`,
    walkthrough: [
      "The first_use CTE collapses 13 feature rows to 11 users' first touches: user 1 on 2026-09-09 (day 1 — its 2026-09-17 return is ignored), user 3's duplicate 2026-09-16 rows collapse to one day 6, user 7's consecutive 2026-09-15/16 rows collapse to day 0, and users 6, 10, 11, 14, 15 never appear at all. The dated pass LEFT JOINs that onto all 15 signups and computes each row's Monday: the Sep 8-13 signups all walk back to 2026-09-07 (Tuesday shifts 1, Sunday shifts 6), Sep 15-19 back to 2026-09-14, Sep 22-25 back to 2026-09-21. first_use_days comes out 1, 5, 6, 12, 22, NULL, 0, 2, 9, NULL, NULL, 4, 11, NULL, NULL in user order.",
      "The three conditional averages fold each cohort. Week 2026-09-07 holds 6 users and 5 of them have first-use days — 1, 5, 6 inside 7; 12 inside 14; 22 inside 30; user 6's NULL maps to a counted 0 — so the shares read 3/6 = 50.0, 4/6 = 66.666… → 66.7 and 5/6 = 83.333… → 83.3. Week 2026-09-14 holds 5 users with days 0, 2, 9 and two NULLs: 2/5 = 40.0, then 3/5 = 60.0 at both later deadlines — the day-0 same-day adopter counts on every line. Week 2026-09-21 holds 4 users with days 4 and 11: 1/4 = 25.0, then 2/4 = 50.0 twice, since nobody's first use landed in the (14, 30] gap.",
      "The projection ships three rows ordered by the Monday spine: 2026-09-07, 2026-09-14, 2026-09-21. Every percentage is born in ROUND(..., 1) — 66.666… and 83.333… never reach the snapshot raw — and users stays 6, 5, 4 because the LEFT JOIN, not the feature table, defines the population. The never-users are invisible in the output and decisive in every number: delete them from the denominator and all three cohorts instantly look healthier than they are.",
    ],
    time: "O(f + u) over f feature rows and u users — one grouped scan for first uses, one joined pass for the cohort averages",
    space: "O(u) — one first-use fact per touching user (11 of 15 here) plus the three cohort rows",
    followUps: [
      "Add a running-cohort-size column so each week's row also shows how signup volume trended — which window over the cohort spine survives when a week has zero signups?",
      "Survival-curve it: for each cohort report the share active in the first, second and third week AFTER signup (not cumulative deadlines) — which users flip buckets, and does user 5's day-22 touch still count anywhere?",
      "Swap the Monday spine for ISO week strings from strftime — where does that disagree with the (w + 6) % 7 Monday on this seed, and which definition would a stakeholder actually mean?",
    ],
    related: ["cohort-retention-matrix", "funnel-step-conversion", "growth-accounting"],
    order: "exact",
    xp: 35,
  },
];
