// Deep-dives — SaaS A file: trial funnel, plan migrations and the MRR
// waterfall (3 problems: 1 Easy, 1 Medium, 1 Hard; all three outputs are
// ordered reports, order:"exact"). Money is INTEGER cents with the _cents
// suffix; the only REALs are the funnel percentages in dive 1. Own tables,
// own seeds, original phrasing — never copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8049 trial-to-paid-funnel ·
// 8050 plan-migration-paths · 8051 mrr-waterfall.
import type { LcSqlDive } from "../types";

export const SQL_DF_SAAS_A: LcSqlDive[] = [
  {
    slug: "trial-to-paid-funnel",
    statement:
      "A self-serve SaaS runs a weekly trial funnel: every signup lands in the week it signed up, and the report reads three numbers per week — how many signed up, how many activated and how many converted to a paid plan. The signups table holds (user_id, signup_date, converted_date) where a NULL converted_date means never converted, and activations holds (user_id, activated_date) with at most one row per user. Bucket each signup under the MONDAY of its signup week and report week, trials, activated, converted, activation_pct, conversion_pct. A signup counts as activated only when an activations row exists with activated_date inside the PINNED 14-day trial window — between signup_date and signup_date + 14 days, inclusive on both ends; later activations do not count. Converted simply means converted_date is present, with or without an activation. Both percentages are ROUND(100.0 * step / trials, 2) against ALL of the week's signups, ordered by week ascending.",
    examples: [
      {
        input:
          "week of 2026-08-03 — six signups; users 101, 102 and 104 activate on days 1, 5 and 1 (all inside 14 days); user 106 activates on day 17 (outside); users 103 and 105 never activate; users 101, 102 and 105 carry a converted_date",
        output: "2026-08-03 · 6 · 3 · 3 · 50.0 · 50.0",
        explanation:
          "User 106's day-17 activation misses the PINNED window so activated reads 3, not 4; user 105 converts without ever activating and still counts as converted; both percentages divide by all 6 trials.",
      },
      {
        input:
          "week of 2026-08-17 — seven signups; users 113 through 117 all activate within two days and user 119 activates on day 8; user 118 never activates; nobody in the week ever converts",
        output: "2026-08-17 · 7 · 6 · 0 · 85.71 · 0.0",
        explanation:
          "Activation is strong (6 of 7 = 85.71) but conversion reads 0.0 — the product-story week where onboarding works and monetization does not; 100.0 * 6 / 7 rounds to 85.71.",
      },
    ],
    constraints: [
      "all counts are INTEGER; activation_pct and conversion_pct are the only REAL columns in the output",
      "PINNED week bucket: week = the MONDAY starting the signup's week, computed with strftime date arithmetic ('-6 days' then 'weekday 1') and rendered YYYY-MM-DD; a Sunday signup belongs to the week that began six days earlier, never to the next one",
      "PINNED activation window: a signup is activated when an activations row exists with activated_date in [signup_date, signup_date + 14 days] inclusive (the 14-day trial window); activations after day 14 do NOT count; converted = converted_date IS NOT NULL regardless of activation status",
      "PINNED denominators: both percentages divide by trials (ALL of the week's signups), ROUND(100.0 * step / trials, 2); ORDER BY week ASC",
    ],
    primer: {
      hook:
        "Every self-serve SaaS board meeting opens with one small table — trials, activated, converted, per week — and this problem builds that table from raw signup and activation rows.",
      concept: [
        "A trial funnel measures one journey: stranger signs up, stranger uses the product for real, stranger pays. Each arrow is a step, and each step loses people — that loss is not a scandal, it is the measurement. The funnel's job is to say WHERE the journey leaks: a week that signs up 100 trials, activates 85 and converts 5 has an onboarding that works and an offer that does not. Every self-serve SaaS reads this table weekly because it is the shortest path from product behavior to revenue.",
        "Activation is the load-bearing definition. Activated does not mean logged in — it means the customer crossed the milestone the team has DECIDED marks real value: sent the first message in a chat tool, held the first meeting in a video tool, shared the first document. The date of that first key event is the activation date, and once it is logged as a row, the funnel can count it. Without a crisp activation event the funnel has three columns and no meaning.",
        "The trial window is the funnel's clock. A signup who activates on day 17 is a different story from one who activates on day 1 — slow activations usually mean the trial nearly expired — and mixing both into one count blurs the weekly signal. Pinning a window (14 days here) makes every week's number comparable: same clock, same cutoff, no drift. The window is a business decision, and the SQL must encode it exactly or two dashboards will disagree.",
        "Conversion is the billing fact: the moment a plan goes from trial to paid. It deliberately does NOT require activation — some customers buy without ever using the product (a manager procuring for a team), and hiding them would understate revenue. That is why the funnel reports activation and conversion as separate columns over the SAME denominator: activation diagnoses onboarding, conversion diagnoses monetization, and dividing each by all trials keeps the two diagnoses independent.",
      ],
      worked: [
        "Say one Monday brings 4 trial signups and the trial window is 14 days.",
        "Three users hit the key event on days 0, 5 and 13 — all inside the window; the fourth waits until day 17, outside it.",
        "The week reads trials 4 and activated 3 — the day-17 activation is invisible to the funnel — and activation_pct = ROUND(100.0 * 3 / 4, 2) = 75.0.",
        "If 2 of the 3 activated ever reach a paid plan, conversion_pct = 50.0, and both percentages deliberately share the SAME denominator: 4 trials, not the 3 activated.",
      ],
      glossary: [
        { term: "trial", def: "a signup evaluating the product before paying anything" },
        { term: "activation", def: "the first key usage event that marks a signup as onboarded" },
        { term: "trial window", def: "the pinned 14 days after signup in which an activation counts" },
        { term: "conversion", def: "the signup reaching a paid plan, whether or not they activated" },
        { term: "activation rate", def: "activated signups over all signups in the week, in percent" },
        { term: "funnel step", def: "one stage of the signup-to-revenue pipeline whose rate reads against the top" },
      ],
      reallife: [
        "The growth team owns this funnel and the board reads it weekly: trials, activation, conversion, one row per week. Activation is the diagnostic half — a week with strong activation and weak conversion points at pricing or the paywall, while weak activation points at onboarding. The pinned window is what keeps those two diagnoses from bleeding into each other, because an activation on day 17 says the customer needed a longer trial, not that the product failed. Pricing experiments are sized off the conversion column; onboarding sprints are staffed off the activation column.",
        "What breaks in practice is definition drift. One analyst counts activations with no window, another uses 30 days, and two dashboards disagree while both look plausible. The other classic is denominator decay — reading conversion against activated signups instead of all trials — which flatters every week where activation was weak. The numbers drive real allocation: headcount between onboarding and sales, which weekly cohort the team digs into on Monday, and whether the free-trial length changes next quarter.",
      ],
      where:
        "Product analysts and growth engineers at self-serve SaaS companies own this funnel, and SQL screens at Slack, Zoom and Notion hand candidates exactly this signups-and-activations shape.",
    },
    breakdown: [
      "A funnel is only as honest as its denominators. trials counts EVERY signup landing in the week; activated counts only signups whose activation row sits in the pinned 14-day window; converted counts converted_date IS NOT NULL with no activation requirement — user 105 of the seed converts without ever activating and still counts, because conversion is a billing fact, not an engagement score. Both percentages divide by the same trials number, which is what makes weeks comparable: reading conversion against activated instead would print 100.0 for the 2026-08-03 week instead of 50.0 and flatter every weak-activation week. A weekly metric that changes meaning with its denominator is worse than no metric.",
      "The week bucket is date arithmetic with a boundary hidden inside it. Monday of the signup week comes from strftime with '-6 days' followed by 'weekday 1': walk back six days, then advance to the next Monday — which lands ON the original date when it already was Monday. Running 'weekday 1' alone rolls every non-Monday signup FORWARD into the next week, so a Tuesday signup would sit in the wrong bucket and the report would sprout a phantom fifth week. The seed plants a Sunday signup in every one of the four weeks precisely so the bucket arithmetic is load-bearing.",
      "The SQL shape is one derived table and one GROUP BY. The derived table stamps each signup with its week, a 0/1 did_activate from an EXISTS probe bounded by signup_date and date(signup_date, '+14 days'), and a 0/1 did_convert; the GROUP BY week then produces the two counts and the two ROUNDed percentages. EXISTS beats a JOIN here because activations holds at most one row per user — no fan-out, no COUNT(DISTINCT) repairs — and the PRIMARY KEY (user_id, activated_date) turns the probe into a keyed lookup. Rounding happens once, at the pinned places, after the integer counts are final.",
    ],
    edges: [
      "Drop the 14-day window guard (count any activation row) and the 2026-08-03 week reads activated 4, activation_pct 66.67 instead of 3 and 50.0 — user 106's day-17 activation leaks in; the other three weeks are untouched, which is what makes the leak visible.",
      "Divide conversion by activated instead of trials and the 2026-08-10 week reads 75.0 instead of 50.0 (3 converted over 4 activated) — denominator decay that flatters weak-activation weeks; the 2026-08-24 week drifts to 50.0 from 28.57.",
      "INNER JOIN signups to activations before counting and trials collapses to the activated count: the 2026-08-17 week reads trials 6 and activation_pct 100.0 instead of 7 and 85.71 — the never-activated signups vanish from their own funnel.",
      "Bucket weeks with 'weekday 1' alone (no '-6 days' first) and every non-Monday signup rolls FORWARD to the next Monday: the 2026-08-03 week is left holding 1 trial, a phantom fifth week 2026-08-31 appears with 6, and 5 rows ship instead of 4.",
    ],
    ladder: [
      { title: "Brute force — eyeball the calendar", body: "Print the signups, draw four Monday boxes by hand, drop each user into a box, and check activations one user at a time against the 14-day wall. Fine for four weeks; unmanageable for four years, and the wall check is exactly the part humans get wrong." },
      { title: "The pattern — stamp, then aggregate", body: "One derived table stamps week, did_activate and did_convert per signup; one GROUP BY week counts and rounds. The window lives in the EXISTS bounds, so the wall is enforced in exactly one place." },
      { title: "The optimal idea — one keyed probe per signup", body: "O(S + A) over S signups and A activation rows — one scan plus a PRIMARY KEY probe per signup, O(W) space for W week rows. The durable rules: bucket by Monday with '-6 days' then 'weekday 1', bound the window on both ends, and divide by trials, never by the step count." },
    ],
    approach:
      "Monday-bucket signups with strftime date arithmetic, keyed EXISTS for the 14-day window, one GROUP BY week with conditional SUMs and ROUND(100.0 * step / trials, 2)",
    schema: {
      ddl: `CREATE TABLE signups (
  user_id        INTEGER PRIMARY KEY,
  signup_date    TEXT NOT NULL,      -- 'YYYY-MM-DD'
  converted_date TEXT                -- NULL = never converted to a paid plan
);
CREATE TABLE activations (
  user_id        INTEGER NOT NULL,
  activated_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  PRIMARY KEY (user_id, activated_date)  -- at most one activation row per user
);`,
      seed: `-- Trial funnel, August 2026: four Monday weeks (2026-08-03 .. 2026-08-24),
-- 26 signups. Activation counts only inside [signup_date, +14 days]: user 106
-- activates on day 17 (outside), user 125 on day 13 (inside). User 105
-- converts without ever activating. Every week holds one Sunday signup
-- (users 106, 112, 119, 126) so the Monday bucket is load-bearing.
INSERT INTO signups (user_id, signup_date, converted_date) VALUES
  (101, '2026-08-03', '2026-08-10'),
  (102, '2026-08-04', '2026-08-12'),
  (103, '2026-08-05', NULL),
  (104, '2026-08-06', NULL),
  (105, '2026-08-07', '2026-08-20'),
  (106, '2026-08-08', NULL),
  (107, '2026-08-10', '2026-08-14'),
  (108, '2026-08-11', '2026-08-15'),
  (109, '2026-08-12', NULL),
  (110, '2026-08-13', '2026-08-28'),
  (111, '2026-08-14', NULL),
  (112, '2026-08-15', NULL),
  (113, '2026-08-17', NULL),
  (114, '2026-08-18', NULL),
  (115, '2026-08-19', NULL),
  (116, '2026-08-20', NULL),
  (117, '2026-08-21', NULL),
  (118, '2026-08-22', NULL),
  (119, '2026-08-23', NULL),
  (120, '2026-08-24', '2026-09-01'),
  (121, '2026-08-25', '2026-08-30'),
  (122, '2026-08-26', NULL),
  (123, '2026-08-27', NULL),
  (124, '2026-08-28', NULL),
  (125, '2026-08-29', NULL),
  (126, '2026-08-30', NULL);
INSERT INTO activations (user_id, activated_date) VALUES
  (101, '2026-08-04'),  -- day 1, inside
  (102, '2026-08-09'),  -- day 5, inside
  (104, '2026-08-07'),  -- day 1, inside
  (106, '2026-08-25'),  -- day 17: OUTSIDE the 14-day window (must not count)
  (107, '2026-08-11'),  -- day 1, inside
  (108, '2026-08-12'),  -- day 1, inside
  (110, '2026-08-24'),  -- day 11, inside
  (112, '2026-08-16'),  -- day 1, inside
  (113, '2026-08-17'),  -- day 0, inside
  (114, '2026-08-19'),  -- day 1, inside
  (115, '2026-08-20'),  -- day 1, inside
  (116, '2026-08-21'),  -- day 1, inside
  (117, '2026-08-22'),  -- day 1, inside
  (119, '2026-08-31'),  -- day 8, inside
  (120, '2026-08-25'),  -- day 1, inside
  (121, '2026-08-25'),  -- day 0, inside
  (123, '2026-09-07'),  -- day 11, inside
  -- day 13, inside (one day inside the wall)
  (125, '2026-09-11');`,
      tables: [
        { name: "signups", note: "26 rows — four Monday weeks (6, 6, 7, 7 signups); converted_date NULL = never paid" },
        { name: "activations", note: "18 rows — one per activating user; user 106's row sits at day 17, outside the window" },
      ],
    },
    code: `WITH weeks AS (
    -- one row per signup, stamped with the Monday of its signup week:
    -- strftime walks back 6 days then advances to the next Monday, which
    -- lands on the original date when it already was Monday
    SELECT
        s.user_id,
        strftime('%Y-%m-%d', s.signup_date, '-6 days', 'weekday 1') AS week,
        -- PINNED trial window: the activation counts only inside
        -- [signup_date, signup_date + 14 days], inclusive on both ends
        EXISTS (
            SELECT 1
            FROM activations a
            WHERE a.user_id = s.user_id
              AND a.activated_date >= s.signup_date
              AND a.activated_date <= date(s.signup_date, '+14 days')
        ) AS did_activate,
        CASE WHEN s.converted_date IS NOT NULL THEN 1 ELSE 0 END AS did_convert
    FROM signups s
)
SELECT
    week,
    COUNT(*) AS trials,
    SUM(did_activate) AS activated,
    SUM(did_convert) AS converted,
    -- both percentages divide by ALL of the week's signups (pinned denominator)
    ROUND(100.0 * SUM(did_activate) / COUNT(*), 2) AS activation_pct,
    ROUND(100.0 * SUM(did_convert) / COUNT(*), 2) AS conversion_pct
FROM weeks
GROUP BY week
ORDER BY week ASC;`,
    walkthrough: [
      "The weeks CTE walks all 26 signups and stamps three facts per user: the Monday bucket from strftime('%Y-%m-%d', signup_date, '-6 days', 'weekday 1'), the EXISTS probe for an activation row between signup_date and date(signup_date, '+14 days'), and the IS NOT NULL test on converted_date. User 106's activation on 2026-08-25 sits 17 days after the 2026-08-08 signup — one day past the window's 2026-08-22 wall — so the probe returns false for that signup while the row itself survives in activations. User 105 never appears in activations at all yet converts on 2026-08-20; the funnel keeps both facts separately, which is the point.",
      "The GROUP BY week then counts. 2026-08-03 reads trials 6 (users 101 through 106), activated 3 (101, 102, 104) and converted 3 (101, 102, 105). 2026-08-10 reads 6, 4, 3 with user 110's day-11 activation inside the window, and 2026-08-17 reads 7, 6, 0 — six activations including a day-0 and a day-8, and not one conversion. 2026-08-24 reads 7, 4, 2, with user 125 activating on day 13, one day inside the wall. Every activated and converted cell is an integer SUM of 0/1 flags, so no rounding ever touches them.",
      "The projection rounds once per percentage: 100.0 * 3 / 6 lands exactly on 50.0, 100.0 * 4 / 6 rounds to 66.67, 100.0 * 6 / 7 rounds to 85.71 and 100.0 * 2 / 7 rounds to 28.57 — divisions all run on raw counts before ROUND sees them. The engine ships four rows ordered by week: (2026-08-03, 6, 3, 3, 50.0, 50.0), (2026-08-10, 6, 4, 3, 66.67, 50.0), (2026-08-17, 7, 6, 0, 85.71, 0.0) and (2026-08-24, 7, 4, 2, 57.14, 28.57). The 2026-08-17 row is the product story in one line: onboarding works, monetization does not.",
    ],
    time: "O(S + A) — one pass over the S signups with a keyed EXISTS probe into the activations primary key, plus one grouped pass",
    space: "O(W) — the weeks CTE holds one row per signup before the GROUP BY collapses it to W week rows",
    followUps: [
      "Add an activation-latency read — what share of each week's activations land in the first 48 hours, and which window construct computes it without a second scan of activations?",
      "Split conversion by activated versus never-activated on this seed — does user 105 (converted without activating) survive as a real counterexample, and how would you report the activation lift per week?",
    ],
    related: ["funnel-step-conversion", "feature-adoption-windows", "median-time-to-convert"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "plan-migration-paths",
    statement:
      "Subscription businesses live on plan changes: an upgrade grows revenue, a downgrade shrinks it, and a lateral switch moves the customer between sibling products at the same price. The subscriptions table holds one row per customer per ACTIVE month (customer_id, month, plan) — a month with no row means the customer was unsubscribed then, not that they changed plan — and plans maps each plan to a tier_rank where higher is better. For every customer, compare each active month with the previous active month using LAG and report every plan change as customer_id, prev_month, month, from_plan, to_plan, direction. Direction is PINNED from tier_rank: 'upgrade' when the new plan ranks higher, 'downgrade' when it ranks lower, 'lateral' when the rank is equal but the plan differs. Consecutive months on the SAME plan produce no row, and a customer reappearing after absent months IS one consecutive pair — gaps are ignored, adjacent active months are compared, so prev_month can sit more than one month back. Order by customer_id, then month.",
    examples: [
      {
        input:
          "customer 1 pays starter through 2026-04 and pro from 2026-05 on; the plans table ranks starter 1 and pro 2",
        output: "1 · 2026-04 · 2026-05 · starter · pro · upgrade",
        explanation:
          "The LAG pair (2026-04 starter, 2026-05 pro) differs, tier_rank climbs from 1 to 2, so the pair ships as an upgrade; the 2026-03 to 2026-04 pair (both starter) ships nothing.",
      },
      {
        input:
          "customer 3 pays pro through 2026-05, then team from 2026-06; both plans sit at tier_rank 2",
        output: "3 · 2026-05 · 2026-06 · pro · team · lateral",
        explanation:
          "The plan changed but the rank did not, so the direction reads lateral — a pure product-family switch at the same tier; the pair survives because the plans differ, unlike customer 5's identical months.",
      },
    ],
    constraints: [
      "customer_id is INTEGER; months and plans are TEXT; direction is one of the literals 'upgrade', 'downgrade', 'lateral'; the output holds no REAL columns",
      "PINNED gap convention: a month with no subscriptions row means the customer was unsubscribed that month, not a plan change; LAG over the customer's own rows compares ADJACENT ACTIVE months, so a customer returning after a gap forms one pair across the gap and prev_month is the last active month",
      "PINNED direction: join plans twice (once per side of the pair) and read tier_rank — upgrade when to_rank > from_rank, downgrade when to_rank < from_rank, lateral when the ranks are equal but the plan differs; plan NAMES never decide direction",
      "same plan in consecutive active months = no row; ORDER BY customer_id ASC, month ASC",
    ],
    primer: {
      hook:
        "Every plan change a customer makes is either revenue arriving, revenue leaving, or a customer walking between siblings — and the migration report names which.",
      concept: [
        "SaaS products sell plans — bundles of features at a price. Customers move between them constantly: they grow into a bigger tier, cut costs into a smaller one, or switch to a sibling product priced the same. Each move is a plan migration, and the pattern of migrations is one of the clearest pictures of how a catalog is really working.",
        "Not all moves are equal, and plan NAMES cannot tell you which way is up — a company selling several products needs a ranking. The tier_rank column is that ranking: a small integer where higher is better. With ranks in hand every move collapses to one comparison: to_rank above from_rank is an upgrade, below is a downgrade, equal with a different plan is a lateral switch. The ranks are business data, maintained by whoever owns packaging.",
        "The pairing rule is the subtle part. A migration compares two CONSECUTIVE ACTIVE months — the month before and the month after, as recorded. If a customer disappears for two months and comes back, that absence is an unsubscribe stretch, not a plan change; the comeback month pairs with the last active month and the months in between simply never existed. Deciding this once, in the statement, keeps finance and product from counting the same story differently.",
        "Both finance and product read this report. Upgrades compound future revenue and predict expansion; downgrades are an early-warning light that pricing or value is slipping; laterals reveal substitution inside your own catalog — the customer did not leave, they switched, and the reason is usually packaging. A customer whose plan never changes is equally informative: they are the control group that makes the movers stand out.",
      ],
      worked: [
        "One customer's rows read starter in March, starter in April, pro in May, pro in June.",
        "LAG pairs each month with the previous active month: (Mar, Apr), (Apr, May), (May, Jun).",
        "(Mar, Apr) is starter to starter — same plan, no row; (May, Jun) likewise.",
        "(Apr, May) is starter to pro; tier_rank runs 1 to 2, so direction = upgrade and the pair ships as one row.",
        "If May had instead read team at rank 2, the same pair would ship as lateral — rank equal, plan different — and only the plans table can tell the two apart.",
      ],
      glossary: [
        { term: "plan migration", def: "a customer's move between plans across consecutive active months" },
        { term: "tier rank", def: "the integer standing of a plan, where higher means better" },
        { term: "upgrade", def: "a change to a plan with a higher tier rank" },
        { term: "downgrade", def: "a change to a plan with a lower tier rank" },
        { term: "lateral switch", def: "a change between different plans sharing one tier rank" },
        { term: "active month", def: "a month holding a subscriptions row; gap months are unsubscribe stretches, not plan changes" },
      ],
      reallife: [
        "Revenue operations and billing teams run migration reports at every monthly close: how many customers moved up, down or sideways, and between which plans. Product reads the same rows for packaging decisions — a downgrade surge after a price change is a signal, and laterals show where customers see substitutes inside the same catalog. Finance folds the directions into the forecast, because upgrades compound future revenue while downgrades claw it back.",
        "What breaks is the pairing, not the labels. A customer who churns and returns months later looks like a pair of adjacent rows, and treating the gap months as plan changes invents history that never happened. The other trap is direction by plan name — string comparison knows nothing about which product costs more. The numbers decide packaging roadmaps and win-back offers, so a mislabeled lateral can send a team to fix the wrong product.",
      ],
      where:
        "Revenue-operations analysts, billing engineers and product data teams read these flows monthly, and SQL screens at Atlassian and Notion hand candidates exactly this subscriptions-and-ranks shape.",
    },
    breakdown: [
      "A plan change is a fact about consecutive ACTIVE months, and everything hard hides in the word active. LAG over PARTITION BY customer_id ORDER BY month pairs each of a customer's rows with the previous row whatever date it carries, so customer 6 — present in 2026-03, absent in 2026-04, back in 2026-05 — forms exactly one pair, (2026-03, 2026-05), with the gap never special-cased. The statement pins the convention: a month with no row is an unsubscribe stretch, not a plan change, so nothing is reported for it and the comeback pair reads across it. Deciding this once keeps finance and product from counting the same story differently.",
      "Direction lives in tier_rank, never in plan names. Customer 1's starter-to-pro move is an upgrade only because rank 1 climbs to 2; customer 3's pro-to-team move is a lateral because both plans share rank 2; alphabetical comparison would call the first a downgrade and the second an upgrade, which is why the plans table is joined twice — once per side of the pair. The prev_plan <> plan filter is what keeps quiet months from leaking: dropping it turns 7 changes into 19 pairs on this seed, one row for every month a customer simply stayed put.",
      "The shape is two CTEs and a CASE. LAG builds (prev_month, prev_plan, month, plan) per customer in month order; the joins fetch both tier_ranks with keyed lookups on the plans primary key (customer 4's team-to-business pair reads ranks 2 and 3); the CASE maps the comparison to the three literals, and each customer's NULL first-row predecessors are filtered before the joins. ORDER BY customer_id, month makes the report read like a ledger, and no date arithmetic is needed anywhere — the pairing is entirely relational.",
    ],
    edges: [
      "Decide direction by comparing plan names alphabetically and the labels invert: customer 1's starter-to-pro upgrade reads downgrade (pro sorts before starter) and customer 3's pro-to-team lateral reads upgrade — all 7 rows mislabel on this seed.",
      "Filter pairs to rank CHANGES only (plans differ AND ranks differ) and the lateral disappears: 6 rows ship instead of 7, and the missing row is customer 3's pro-to-team.",
      "Forget the same-plan filter and every quiet month pair leaks in: 19 rows instead of 7 — customer 5 alone contributes 5 starter-to-starter pairs.",
      "Require strictly consecutive calendar months (previous month + 1) and customer 6's cross-gap downgrade vanishes: 6 rows instead of 7 — the pinned convention pairs adjacent ACTIVE months, so gaps need no date arithmetic and no special case.",
    ],
    ladder: [
      { title: "Brute force — one customer at a time", body: "Sort each customer's months on paper, write out each pair, look up both ranks by hand, label. Five customers is fine; five thousand is why LAG exists." },
      { title: "The pattern — LAG pairs, plans classify", body: "LAG over PARTITION BY customer_id ORDER BY month builds the pairs, and two keyed joins to plans fetch both ranks. A CASE then labels the three directions, and the same-plan pairs are filtered before labeling." },
      { title: "The optimal idea — adjacent active months, no date math", body: "O(n log n) over the n subscription rows — one PARTITION sort plus keyed rank lookups, O(n) space. The durable rules: gaps are ignored by construction, direction comes from ranks, and same-plan pairs die in the WHERE, not in the CASE." },
    ],
    approach:
      "LAG per customer over month order pairs adjacent active months, two keyed joins to plans fetch both tier_ranks, a CASE classifies upgrade / downgrade / lateral, same-plan pairs filtered in the WHERE",
    schema: {
      ddl: `CREATE TABLE subscriptions (
  customer_id INTEGER NOT NULL,
  month       TEXT NOT NULL,      -- 'YYYY-MM', one row per ACTIVE month
  plan        TEXT NOT NULL
);
CREATE TABLE plans (
  plan       TEXT PRIMARY KEY,
  tier_rank  INTEGER NOT NULL     -- higher rank = better plan
);`,
      seed: `-- Plan migrations, March through August 2026. Six customers: an upgrader
-- (1), a downgrader (2), a lateral switcher (3), a multi-change customer (4),
-- a steady customer (5, never changes), and a gap-month customer (6, whose
-- change reads across the unsubscribe stretch). Plans: starter 1, pro 2,
-- team 2 (lateral pair with pro), business 3, enterprise 4 (a decoy rank).
INSERT INTO plans (plan, tier_rank) VALUES
  ('starter', 1),
  ('pro', 2),
  ('team', 2),
  ('business', 3),
  ('enterprise', 4);
INSERT INTO subscriptions (customer_id, month, plan) VALUES
  (1, '2026-03', 'starter'),
  (1, '2026-04', 'starter'),
  (1, '2026-05', 'pro'),
  (1, '2026-06', 'pro'),
  (1, '2026-07', 'business'),
  (1, '2026-08', 'business'),
  (2, '2026-03', 'business'),
  (2, '2026-04', 'business'),
  (2, '2026-05', 'starter'),
  (2, '2026-06', 'starter'),
  (3, '2026-04', 'pro'),
  (3, '2026-05', 'pro'),
  (3, '2026-06', 'team'),
  (4, '2026-03', 'team'),
  (4, '2026-04', 'business'),
  (4, '2026-05', 'team'),
  (4, '2026-06', 'team'),
  (5, '2026-03', 'starter'),
  (5, '2026-04', 'starter'),
  (5, '2026-05', 'starter'),
  (5, '2026-06', 'starter'),
  (5, '2026-07', 'starter'),
  (5, '2026-08', 'starter'),
  (6, '2026-03', 'pro'),
  (6, '2026-05', 'starter');`,
      tables: [
        { name: "subscriptions", note: "25 rows — six customers over 2026-03..2026-08; customer 6 skips 2026-04 (unsubscribed)" },
        { name: "plans", note: "5 rows — pro and team share rank 2 (the lateral pair); enterprise sits unused as a decoy" },
      ],
    },
    code: `WITH pairs AS (
    -- each customer's own timeline: LAG pairs adjacent ACTIVE months, so a
    -- gap month is ignored by construction and a returning customer still
    -- forms exactly one pair across the gap (pinned convention)
    SELECT
        s.customer_id,
        LAG(s.month) OVER (PARTITION BY s.customer_id ORDER BY s.month) AS prev_month,
        s.month,
        LAG(s.plan) OVER (PARTITION BY s.customer_id ORDER BY s.month) AS prev_plan,
        s.plan
    FROM subscriptions s
),
joined AS (
    -- drop each customer's first row (NULL predecessors) and every same-plan
    -- pair, and the two keyed joins fetch tier_rank for BOTH sides
    SELECT
        p.customer_id, p.prev_month, p.month,
        p.prev_plan AS from_plan, p.plan AS to_plan,
        pf.tier_rank AS from_rank, pt.tier_rank AS to_rank
    FROM pairs p
    JOIN plans pf ON pf.plan = p.prev_plan
    JOIN plans pt ON pt.plan = p.plan
    WHERE p.prev_plan IS NOT NULL
      AND p.prev_plan <> p.plan
)
SELECT
    customer_id,
    prev_month,
    month,
    from_plan,
    to_plan,
    -- direction lives in tier_rank, never in the plan's name
    CASE
        WHEN to_rank > from_rank THEN 'upgrade'
        WHEN to_rank < from_rank THEN 'downgrade'
        ELSE 'lateral'
    END AS direction
FROM joined
ORDER BY customer_id ASC, month ASC;`,
    walkthrough: [
      "The pairs CTE sorts each customer's rows by month and lets LAG stamp prev_month and prev_plan: customer 1's six rows become five pairs, and customer 6's two rows (2026-03 and 2026-05) become exactly one pair with prev_month 2026-03 — the gap month 2026-04 never existed in the table, so no special case is needed. Each customer's first row carries NULL predecessors and dies at the prev_plan IS NOT NULL filter. Twenty-five rows in, 19 pairs out.",
      "The joined CTE filters prev_plan <> plan — 19 pairs down to 7 changes — and joins plans twice, once per side, fetching tier_rank 1 for starter, 2 for pro and team, 3 for business. Customer 5's five starter-to-starter pairs and every other quiet month are gone. The CASE then labels: customer 1's starter-to-pro climbs 1 to 2 (upgrade) and pro-to-business climbs 2 to 3 (upgrade), customer 2's business-to-starter drops 3 to 1 (downgrade), customer 3's pro-to-team holds 2 to 2 with different names (lateral), customer 4 contributes an upgrade then a downgrade, and customer 6's cross-gap pro-to-starter reads a downgrade whose prev_month shows the three-month-old last active month.",
      "The engine ships exactly 7 rows ordered by customer_id then month: (1, 2026-04, 2026-05, starter, pro, upgrade), (1, 2026-06, 2026-07, pro, business, upgrade), (2, 2026-04, 2026-05, business, starter, downgrade), (3, 2026-05, 2026-06, pro, team, lateral), (4, 2026-03, 2026-04, team, business, upgrade), (4, 2026-04, 2026-05, business, team, downgrade) and (6, 2026-03, 2026-05, pro, starter, downgrade). Every direction literal comes from a keyed lookup on the plans primary key. The output holds no REAL columns at all — directions are text, months are text, ranks never surface.",
    ],
    time: "O(n log n) over the n subscription rows — one PARTITION BY customer sort for the LAG pairs plus keyed rank lookups",
    space: "O(n) — the pairs and joined CTEs hold one row per customer month-pair at most",
    followUps: [
      "Pivot the 7 changes into a month by direction matrix — which conditional aggregation builds it, and where do cross-gap pairs land when the columns are calendar months?",
      "Flag multi-rank jumps — customer 1 moves starter to pro to business in single-rank steps, but a starter-to-business hop would skip rank 2; how would you detect skipped tiers in the same statement?",
    ],
    related: ["growth-accounting", "week-over-week-churn", "delinquency-roll-rates"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "mrr-waterfall",
    statement:
      "The MRR waterfall is the board-deck chart of SaaS finance: month by month, recurring revenue splits into new business, expansion, contraction and churn, and the four movements must reconcile ending revenue to the month before. The mrr_snapshots table holds one row per customer per SUBSCRIBED month (customer_id, month, mrr_cents); an absent month means the customer churned that month — the prior row exists, the current one does not. Fill a full customer × month grid over the seed window, take each customer's prior CALENDAR month with LAG, and classify every movement against it: new = current mrr with no prior row (count the full current mrr); churned = prior row with no current row (count the PRIOR month's mrr); expansion = both present and current above prior (count the difference); contraction = both present and current below prior (count the difference); equal months move nothing. A customer returning after absent months counts as NEW in the comeback month, at its full current mrr. Report month, new_mrr, expansion_mrr, contraction_mrr, churned_mrr, ending_mrr where ending_mrr is the SUM of the month's present mrr cells — a monthly sum, never a running total — ordered by month ascending.",
    examples: [
      {
        input:
          "2026-05 — customer 2 joins at 4000 with no April row; customer 1 grows 5000 to 6500 and customer 5 grows 2500 to 2600; customer 3 falls 6000 to 5200; customer 4 has an April row at 3000 and no May row; the other customers hold flat",
        output: "2026-05 · 4000 · 1600 · 800 · 3000 · 25300",
        explanation:
          "new 4000 + expansion 1600 - contraction 800 - churn 3000 moves April's 23500 by exactly +1800 to 25300 — the waterfall reconciles; churned counts customer 4's PRIOR (April) mrr, not zero.",
      },
      {
        input:
          "2026-08 — customer 6 returns at 2200 after sitting out July; customer 2 grows 4500 to 5000; customer 3 falls 4200 to 4000; customer 7 (3800 in July) and customer 8 (1500 in July) both have no August row",
        output: "2026-08 · 2200 · 500 · 200 · 5300 · 24800",
        explanation:
          "Two customers vanish after July so churned reads 3800 + 1500 = 5300; customer 6's comeback counts as NEW at its full 2200; 27600 + 2200 + 500 - 200 - 5300 = 24800.",
      },
    ],
    constraints: [
      "mrr_cents is INTEGER cents; every output column (new_mrr, expansion_mrr, contraction_mrr, churned_mrr, ending_mrr) is INTEGER cents; the output holds no REAL columns",
      "PINNED comparison base: the grid is a full customer × month spine (CROSS JOIN of the distinct customers and months, LEFT JOINed back to the snapshots), so LAG reads the PREVIOUS CALENDAR month and NULL means the customer was absent",
      "PINNED classes: new = current present and prior absent (count full current mrr, comebacks included); churned = current absent and prior present (count the PRIOR month's mrr, attributed to the FIRST absent month — later absent months have a NULL prior and count nothing); expansion = both present and current > prior (current - prior); contraction = both present and current < prior (prior - current); equal months move nothing",
      "ending_mrr = SUM of the month's PRESENT mrr cells (a monthly sum, never a running total); ORDER BY month ASC",
    ],
    primer: {
      hook:
        "One chart sits at the front of every SaaS board deck — the MRR waterfall — and every SaaS analytics interview asks you to build it from raw snapshots.",
      concept: [
        "MRR — monthly recurring revenue — is the number a subscription business is valued on: the sum of every active customer's monthly price. But the total hides the story. Two companies can both print 100000 in MRR while one adds new customers and the other squeezes existing ones, and those are very different businesses. The waterfall splits the month's change in MRR into named movements so the story becomes visible.",
        "The four movements answer four different questions. NEW MRR is fresh business — customers with no history this month; it measures marketing. EXPANSION is existing customers paying more — upgrades, added seats; it measures account management and product depth. CONTRACTION is existing customers paying less, and CHURNED is customers gone entirely, counted at what they USED to pay. Equal months move nothing. Each class has a different owner, which is why the split matters more than the total.",
        "The movements must reconcile: last month's ending, plus new, plus expansion, minus contraction, minus churned, equals this month's ending. That identity is the waterfall's superpower — it turns a chart into an audit, because any month where the books do not add up hides a bookkeeping error. It only holds when the classes are exhaustive and disjoint, which is why the definitions are pinned down to the row level.",
        "The row-level mechanics trip everyone once. A churned customer leaves NO row in their final month — absence is the evidence — so the query must look across missing months, not just join what exists. Symmetrically, a customer who comes back after an absence has no prior row to compare against, so their comeback counts as NEW at their full current price. Deciding these two conventions once makes every month's waterfall provable.",
      ],
      worked: [
        "Take a two-customer world: A pays 1000 in January and 1200 in February; B pays 800 in January and vanishes in February.",
        "January: both rows have no prior month, so new_mrr = 1000 + 800 = 1800 and ending_mrr = 1800.",
        "February: A's row pairs with 1000 and grows — expansion 200; B has no row while January had one — churned 800, B's PRIOR mrr.",
        "February's ending = 1200, and the waterfall identity holds: 1800 + 0 new + 200 - 0 - 800 = 1200.",
        "Had B returned in March at 900, March would count a NEW 900 (no prior row) — the comeback is new business, not expansion of the old 800.",
      ],
      glossary: [
        { term: "MRR", def: "monthly recurring revenue — the sum of every subscribed customer's normalized monthly price" },
        { term: "new MRR", def: "full current mrr from customers with no prior calendar-month row, comebacks included" },
        { term: "expansion MRR", def: "the increase from customers present in both months who pay more" },
        { term: "contraction MRR", def: "the decrease from customers present in both months who pay less" },
        { term: "churned MRR", def: "the prior month's mrr of customers who vanish after an active month" },
        { term: "waterfall", def: "the reconciliation identity: prior ending + new + expansion - contraction - churned = ending" },
      ],
      reallife: [
        "The finance team builds this waterfall the day a month closes, and the board deck leads with it: new, expansion, contraction, churn, ending. The four bars answer different questions — new measures marketing, expansion measures account management and product depth, contraction and churn measure fit and reliability. Investors read the same chart: net new MRR against ending MRR is the growth-quality ratio behind every SaaS valuation multiple.",
        "What breaks is bookkeeping at the edges. Counting a comeback customer as expansion of their pre-churn price inflates expansion and hides the churn that happened; attributing churn to the wrong month smears a one-week outage across three reporting periods. The other classic is a running total masquerading as a monthly ending figure, which makes the chart compound silently until reconciliation fails and someone rebuilds it by hand.",
        "The decisions ride on the split, not the total. Hiring in customer success follows churn; pricing changes follow contraction; marketing budget follows new. When the board asks whether growth accelerated, the honest answer is a movement split, not one arrow on a line chart — which is why this query is the interview's favorite hard question.",
      ],
      where:
        "SaaS finance partners, revenue-operations leads and analytics engineers build this chart every close, and SQL interviews at Stripe and Salesforce treat the MRR waterfall as a signature hard question.",
    },
    breakdown: [
      "The waterfall exists to reconcile: prior ending + new + expansion - contraction - churned must equal ending, every month, or the books are wrong. The identity only holds when the four classes are exhaustive and disjoint, which is what the pinned definitions buy — new absorbs every present row with a NULL prior, churned absorbs every absence with a valued prior, expansion and contraction split the pairs where both sides are valued, and equal months move nothing. May reconciles exactly on this seed: 23500 + 4000 + 1600 - 800 - 3000 = 25300, and five more months follow.",
      "Absent months are the hard part. A churned customer leaves NO row in their final month — absence is the evidence — so a query that only walks mrr_snapshots never sees a churn at all; that variant reports churned 0 in every month while every other column stays right. The fix is a spine: CROSS JOIN the distinct customers with the distinct months, LEFT JOIN the snapshots back, and LAG over the full grid so prior means the previous CALENDAR month. Under that base the classes are symmetric — customer 4's June comeback counts as new 3200 because its May prior is NULL, and customer 4's May absence counts churned 3000 because its April prior is valued.",
      "The projection is five conditional SUMs grouped by month and one discipline: ending_mrr is the SUM of the month's PRESENT cells — a monthly sum, never a running total (May reads 25300, not 48800). Two conventions deserve their own sentence in any statement: a customer absent for two consecutive months churns once (the second absent month has a NULL prior and counts nothing), and a comeback counts as NEW at full current mrr, never as expansion of the pre-churn price. Both are pinned here, and both are the difference between a waterfall that reconciles and one that quietly double-counts.",
    ],
    edges: [
      "Count churned as 0 (drop the vanishing class) and May reads churned_mrr 0 instead of 3000 — the waterfall stops reconciling (23500 + 4000 + 1600 - 800 = 25100 against an ending of 25300) while every other column stays right, which is what makes the missing class so hard to spot.",
      "Fold new customers into expansion by COALESCEing the prior to 0 and April reads expansion_mrr 23500 instead of 0, May 5600 instead of 1600 (customer 2's 4000 leak) — new and expansion double-count the same growth and the board chart lies twice.",
      "Compute ending_mrr as a running total of monthly endings and May reads 48800 instead of 25300 and June 76600 instead of 27800 — the chart compounds instead of reporting.",
      "LAG the raw snapshot rows instead of the filled spine and June reads (0, 2700, 600, 0) instead of (3200, 2500, 600, 2600): customer 4's comeback pairs with April and books a 200 expansion while its May churn becomes invisible — every class involving absence corrupts.",
    ],
    ladder: [
      { title: "Brute force — a grid on paper", body: "Draw eight rows of customers and six columns of months, write every mrr cell, walk each customer down their own column comparing with the cell above, then sum the month columns. Six months is doable once; every month close for the next five years is not." },
      { title: "The pattern — spine, LAG, conditional SUMs", body: "Build the customer × month spine with CROSS JOIN and LEFT JOIN, then run LAG over the spine so prior is the previous calendar month. Five conditional SUMs and one GROUP BY month do the classifying." },
      { title: "The optimal idea — absence is data", body: "O(C × M) over C customers and M months — the spine is C × M cells, one LAG pass, one grouped pass. The durable rules: churn counts the PRIOR month's mrr in the FIRST absent month, comebacks are new at full value, ending is a monthly sum, and equal months move nothing." },
    ],
    approach:
      "customer × month spine via CROSS JOIN plus LEFT JOIN, LAG over the spine reads the prior calendar month, five conditional SUMs classify new / expansion / contraction / churned, ending is the monthly SUM of present cells",
    schema: {
      ddl: `CREATE TABLE mrr_snapshots (
  customer_id INTEGER NOT NULL,
  month       TEXT NOT NULL,      -- 'YYYY-MM', one row per SUBSCRIBED month
  mrr_cents   INTEGER NOT NULL     -- monthly recurring revenue, INTEGER cents
);`,
      seed: `-- MRR waterfall, April through September 2026, eight customers. April is
-- every customer's first month (new only, pinned). Every later month carries
-- all four movement classes. Customer 7 churns in August and NEVER returns,
-- the other vanishers come back (comebacks count as NEW at full current mrr).
INSERT INTO mrr_snapshots (customer_id, month, mrr_cents) VALUES
  -- customer 1: expands May and June, then holds
  (1, '2026-04', 5000),
  (1, '2026-05', 6500),
  (1, '2026-06', 8000),
  (1, '2026-07', 8000),
  (1, '2026-08', 8000),
  (1, '2026-09', 8000),
  -- customer 2: joins in May, grows twice, holds
  (2, '2026-05', 4000),
  (2, '2026-06', 4500),
  (2, '2026-07', 4500),
  (2, '2026-08', 5000),
  (2, '2026-09', 5000),
  -- customer 3: the chronic contractor
  (3, '2026-04', 6000),
  (3, '2026-05', 5200),
  (3, '2026-06', 4600),
  (3, '2026-07', 4200),
  (3, '2026-08', 4000),
  (3, '2026-09', 3800),
  -- customer 4: churns in May, back in June, churns again in September
  (4, '2026-04', 3000),
  (4, '2026-06', 3200),
  (4, '2026-07', 3200),
  (4, '2026-08', 3200),
  -- customer 5: churns in June, back in July, expands in September
  (5, '2026-04', 2500),
  (5, '2026-05', 2600),
  (5, '2026-07', 2400),
  (5, '2026-08', 2400),
  (5, '2026-09', 2600),
  -- customer 6: churns in July, back in August
  (6, '2026-04', 2000),
  (6, '2026-05', 2000),
  (6, '2026-06', 2500),
  (6, '2026-08', 2200),
  (6, '2026-09', 2200),
  -- customer 7: churns in August and never returns
  (7, '2026-04', 3500),
  (7, '2026-05', 3500),
  (7, '2026-06', 3500),
  (7, '2026-07', 3800),
  -- customer 8: churns in August, back in September at a lower price
  (8, '2026-04', 1500),
  (8, '2026-05', 1500),
  (8, '2026-06', 1500),
  (8, '2026-07', 1500),
  (8, '2026-09', 1300);`,
      tables: [
        { name: "mrr_snapshots", note: "40 rows — 8 customers over 2026-04..2026-09 with 8 absent cells (the churn and comeback months)" },
      ],
    },
    code: `WITH months AS (
    -- the six-month window straight from the data
    SELECT DISTINCT month FROM mrr_snapshots
),
customers AS (
    SELECT DISTINCT customer_id FROM mrr_snapshots
),
grid AS (
    -- the PINNED spine: one cell per customer per calendar month, filled or
    -- absent — churn leaves NO row, so the spine is what makes it visible
    SELECT c.customer_id, m.month, s.mrr_cents
    FROM customers c
    CROSS JOIN months m
    LEFT JOIN mrr_snapshots s
        ON s.customer_id = c.customer_id AND s.month = m.month
),
moves AS (
    -- LAG over the FULL grid: prior = the PREVIOUS CALENDAR month's value,
    -- NULL exactly where the customer was absent
    SELECT
        customer_id, month, mrr_cents,
        LAG(mrr_cents) OVER (PARTITION BY customer_id ORDER BY month) AS prev_mrr
    FROM grid
)
SELECT
    month,
    -- new: present now, absent last month (comebacks included, full value)
    COALESCE(SUM(CASE WHEN mrr_cents IS NOT NULL AND prev_mrr IS NULL
                      THEN mrr_cents END), 0) AS new_mrr,
    -- expansion: both present and current above prior
    COALESCE(SUM(CASE WHEN mrr_cents IS NOT NULL AND prev_mrr IS NOT NULL
                       AND mrr_cents > prev_mrr
                      THEN mrr_cents - prev_mrr END), 0) AS expansion_mrr,
    -- contraction: both present and current below prior
    COALESCE(SUM(CASE WHEN mrr_cents IS NOT NULL AND prev_mrr IS NOT NULL
                       AND mrr_cents < prev_mrr
                      THEN prev_mrr - mrr_cents END), 0) AS contraction_mrr,
    -- churned: absent now with a valued prior — the PRIOR month's mrr
    COALESCE(SUM(CASE WHEN mrr_cents IS NULL AND prev_mrr IS NOT NULL
                      THEN prev_mrr END), 0) AS churned_mrr,
    -- ending: the monthly SUM of PRESENT cells, never a running total
    COALESCE(SUM(mrr_cents), 0) AS ending_mrr
FROM moves
GROUP BY month
ORDER BY month ASC;`,
    walkthrough: [
      "The spine is built in three small steps. months takes the six DISTINCT months from the snapshots and customers takes the eight DISTINCT customer ids. grid CROSS JOINs them into 48 cells before LEFT JOINing the snapshots back — 40 cells fill and 8 stay NULL (customer 2's April, customer 4's May and September, customer 5's June, customer 6's July, customer 7's August and September, customer 8's August). moves then runs LAG(mrr_cents) over the grid partitioned by customer and ordered by month, so prior is the PREVIOUS CALENDAR month's value and NULL exactly where the customer was absent.",
      "The five conditional SUMs then classify per month. April: every present row has a NULL prior, so new absorbs all 23500 cents and the other classes read 0 — the pinned first-month behavior. May: customer 2's 4000 is new (no April row), customer 1 contributes 1500 and customer 5 100 of expansion, customer 3 contributes 800 of contraction, and customer 4's absence with a valued prior counts churned 3000 — ending 25300 reconciles 23500 + 4000 + 1600 - 800 - 3000. June counts customer 4's comeback as new 3200 (its May prior is NULL) while customer 5's absence counts churned 2600; August counts TWO vanishings (customer 7's 3800 and customer 8's 1500) as churned 5300; September counts customer 8's comeback as new 1300 at its new lower price.",
      "The engine ships six rows: (2026-04, 23500, 0, 0, 0, 23500), (2026-05, 4000, 1600, 800, 3000, 25300), (2026-06, 3200, 2500, 600, 2600, 27800), (2026-07, 2400, 300, 400, 2500, 27600), (2026-08, 2200, 500, 200, 5300, 24800) and (2026-09, 1300, 200, 200, 3200, 22900). Every cell is an INTEGER — COALESCE turns the empty classes into 0, and SUM ignores the NULL cells inside ending_mrr rather than tripping on them. The waterfall identity holds in all six months, which is exactly what the board checks before it argues about the numbers.",
    ],
    time: "O(C × M) over C customers and M months — the spine is C × M cells, one LAG pass, one grouped pass",
    space: "O(C × M) — the grid and moves CTEs materialize the full customer × month spine",
    followUps: [
      "Add a net_new_mrr column and the reconciliation identity per month — prove ending = prior ending + new + expansion - contraction - churned on all six rows of this seed.",
      "Introduce a separate reactivation class for comebacks — which four customers change buckets, and what do April's new_mrr and September's new_mrr become?",
    ],
    related: ["growth-accounting", "week-over-week-churn", "cohort-retention-matrix"],
    order: "exact",
    xp: 35,
  },
];
