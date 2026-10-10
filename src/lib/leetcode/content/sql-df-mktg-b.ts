// Deep-dives — Marketing B file: linear multi-touch attribution, budget
// pacing and channel LTV vs CAC (3 problems: 2 Medium + 1 Hard; all three
// order:"exact"). Money is INTEGER cents with the _cents suffix; per-customer
// averages and ratios are the only REALs; own tables, own seeds, original
// phrasing — never copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8058 linear-multi-touch ·
// 8059 budget-pacing · 8060 channel-ltv-vs-cac.
import type { LcSqlDive } from "../types";

export const SQL_DF_MKTG_B: LcSqlDive[] = [
  {
    slug: "linear-multi-touch",
    statement:
      "A conversion rarely comes from one ad. The touches table logs (touch_id, user_id, channel, touch_date) and conversions holds (conversion_id, user_id, conversion_date); a touch ASSISTS a conversion when the user matches and touch_date falls in the conversion's 30-day lookback, the range [conversion_date - 29 days, conversion_date], inclusive on both ends. Linear attribution splits each conversion's credit equally across its in-window touches — a conversion with n paired touches pays 1.0 / n to each — and the report sums those fractional credits per channel, the shape that rewards channels assisting many sales instead of only closing them. Report per channel: channel, touches_assisted (the RAW count of that channel's paired touches), credited_conversions = ROUND(SUM(1.0 / n), 2), ordered by credited_conversions DESC, channel ASC.",
    examples: [
      {
        input:
          "conversion 1 — user 101 converts on 2026-10-10 with four in-window touches: Google 2026-10-01, Meta 2026-10-05, Email 2026-10-08 and a second Email 2026-10-09; a third Meta touch sits on 2026-09-10, one day outside the 30-day lookback",
        output: "Google · 1 · 0.25, Meta · 1 · 0.25, Email · 2 · 0.5",
        explanation:
          "n = 4, so each touch earns 1.0 / 4 = 0.25 and the two Email touches pool 0.5 for the channel; the 09-10 Meta touch sits on day -30, outside the window that opens 2026-09-11, and earns nothing.",
      },
      {
        input:
          "all six conversions — four touches, then halves, a single Affiliate touch, thirds, thirds again, and sixths where Google owns three of the six touches",
        output: "Email · 6 · 1.83, Meta · 6 · 1.75, Google · 6 · 1.42, Affiliate · 1 · 1.0",
        explanation:
          "Affiliate holds the only full credit yet ranks last; Email never earned more than 0.5 from a single conversion but five assists pool 1.83 — the three big channels each touched exactly 6 times, and the spread comes from which conversions the touches fed.",
      },
    ],
    constraints: [
      "PINNED window: a touch pairs with a conversion when user_id matches AND touch_date lies in [conversion_date - 29 days, conversion_date] inclusive — the lookback spans 30 calendar days counting the conversion day; touches outside the window or belonging to other users never pair",
      "PINNED credit: n = the conversion's in-window touch count and each paired touch earns 1.0 / n; credited_conversions = ROUND(SUM(1.0 / n), 2) per channel with the SUM running on the raw fractions before any rounding; touches_assisted counts raw touches (two same-channel touches on one conversion count twice)",
      "channels with no paired touch report nothing (no zero rows); every reported channel has at least one paired touch; ORDER BY credited_conversions DESC, channel ASC",
      "identifiers are INTEGERs and dates are 'YYYY-MM-DD' TEXT; the same user may touch one channel repeatedly and every qualifying touch counts; the report holds no money columns",
    ],
    primer: {
      hook: "When five ads touched one sale, last-touch hands ALL the credit to whichever happened to sit nearest the finish — linear attribution splits the credit equally instead.",
      concept: [
        "One sale often has five parents. A shopper sees a search ad on Monday, a social retargeting ad on Wednesday, opens an email on Friday and clicks an affiliate link on Sunday before buying — and the company must decide which channel gets credit for the sale. That decision is an attribution model, and it is political as well as mathematical: budgets follow credit, so every team argues for the model that flatters its own channel. Last-touch hands everything to the final ad and first-touch hands everything to the opener; both erase everyone else.",
        "Linear attribution takes the even-handed route: every in-window touch shares the sale equally. A conversion with four touches credits each touch 0.25, a conversion with two touches credits each 0.5, and a conversion with one touch pays the full 1.0. The fractions are the point — 1.0 divided by n, computed as a REAL, because integer division would flatten every fraction to zero and erase the model entirely.",
        "The report then flips the shape: credit starts per conversion and ends per channel. Sum each channel's fractional credits across all conversions and you get its credited_conversions — a number that can pass 1.0 only by assisting many sales. That is the model's signature behavior: a channel that touches everything modestly can outrank a channel that closed one sale alone, which is exactly the story awareness channels need told at budget time.",
        "Two mechanics keep the SQL honest. First the window: a touch only assists a conversion when the user matches AND the touch sits inside the lookback — here the 30-day window ending on the conversion day, inclusive at both ends. Second the audit: every conversion pays out exactly 1.0 in total, so all channels' credits must sum to the number of conversions — a one-line check that catches double counting, dropped joins and window bugs before the budget meeting does.",
      ],
      worked: [
        "Take one conversion with four in-window touches: Google, Meta, Email and a second Email from the same user.",
        "The touch count n reads 4, so every touch earns 1.0 / 4 = 0.25 — no channel is special yet.",
        "The two Email touches pool their quarters: Email banks 0.5 from this one sale, Google and Meta bank 0.25 each.",
        "Add a second conversion with two touches, Meta and Email: each earns 0.5, so Email now totals 1.0 and Meta 0.75.",
        "A rival channel that closed one single-touch sale banks 1.0 — the same as Email — but Email never had a touch all to itself; that is the assister story linear tells.",
      ],
      glossary: [
        { term: "attribution model", def: "the rule that decides which marketing touch earns credit for a conversion" },
        { term: "touch", def: "one recorded ad or message interaction a user had, with a channel and a date" },
        { term: "last-touch attribution", def: "the model giving all credit to the final touch before the conversion" },
        { term: "linear attribution", def: "the model splitting each conversion's credit equally across its in-window touches" },
        { term: "assist", def: "a touch that contributed to a conversion without being the sole or final driver" },
        { term: "conversion window", def: "the date range before a conversion in which touches may claim credit" },
      ],
      reallife: [
        "A marketing-analytics team owns the credit split, and the argument is never purely technical: the paid-search lead and the CRM lead each want the number that favors their channel. Linear is the compromise model — nobody gets everything, every touch counts — so it ships as a default in major analytics suites. The report decides next quarter's budget split, so a window bug or a missing user match quietly moves real money between teams.",
        "What breaks in practice: the same session firing two touches that both count, lookback edges that swallow a touch from the day before the window or miss the boundary day, and cross-user contamination crediting one customer's journey to another. Each failure moves money — a doubled touch dilutes every real share, a lost boundary day reassigns a whole sale, and a cross-user join inflates n with touches that never belonged. Data teams dedupe touches, pin the window contract inside the query itself, and reconcile the channel sums against total conversions — under linear the credits must sum to exactly the conversion count, a built-in audit this seed passes at 6.0 against six conversions.",
      ],
      where: "Marketing-analytics and growth-engineering teams at Amazon and eBay run attribution reports weekly, and SQL screens for marketplace and retail data roles hand candidates exactly this touches-and-conversions shape.",
    },
    breakdown: [
      "The naive read of attribution is a count: how many conversions did this channel touch? That count is touches_assisted's job, and it is deliberately RAW — user 101 touched Email twice inside conversion 1's window and both touches count, because both genuinely shared the credit. The real metric, credited_conversions, answers a different question: how much CONVERSION did this channel accumulate? Each conversion owns exactly 1.0 of credit and pays it out as n equal fractions, so a channel's total can exceed 1.0 only by appearing in many conversions — the mathematical form of the phrase assists many sales.",
      "The join is where correctness lives. A touch pairs with a conversion on TWO conditions — user_id equality and the pinned 30-day window [conversion_date - 29 days, conversion_date], inclusive at both ends — and dropping either corrupts the fractions differently. Lose the user match and one user's touch feeds another user's conversion, inflating n and diluting every real touch's credit. Lose a window edge and the boundary decoys strike: the Meta touch on 2026-09-10 sits one day outside conversion 1's lookback, which opens 2026-09-11, while the Meta touch on 2026-09-13 sits exactly on conversion 2's day -29 boundary and must earn its half.",
      "The SQL shape is a pairs CTE running the two-condition join, a window COUNT sizing each conversion (n = COUNT(*) OVER (PARTITION BY conversion_id)), and a GROUP BY channel that sums the raw fractions 1.0 / n before one final ROUND. The rounding placement is pinned and load-bearing: round any intermediate share first and each thirds-conversion prints 0.33 + 0.33 + 0.33, dropping the four channels' total to 5.98 against the 6.0 the audit demands. Summing raw and rounding once keeps every hundredth in play, so the credits land on exactly 6.0 — the conversion count — and any drift betrays a bug. The same grouped pass supplies touches_assisted for free, since COUNT(*) over the paired rows is exactly the raw count the report wants.",
    ],
    edges: [
      "Compute the split with integer division — SUM(1 / n) — and every multi-touch fraction collapses to 0: Email, Google and Meta all read 0.0 while Affiliate alone keeps 1.00 because 1 / 1 survives; the 1.0 numerator is load-bearing and the check pins the zeroed rows.",
      "ROUND each per-conversion share before the final SUM and the thirds leak: Google reads 1.41 instead of 1.42 (0.25 + 0.33 + 0.33 + 0.5) and Meta 1.74 instead of 1.75, while Email happens to still print 1.83 — the four credits then total 5.98 rather than the conversion count 6.0, so rounding before the SUM is wrong even when a channel survives to agree.",
      "Substitute COUNT(DISTINCT conversion_id) for the fractional sum and the report becomes a participation count: Email 5, Meta 5, Google 4, Affiliate 1 instead of 1.83 / 1.75 / 1.42 / 1.00 — Google's three sixths and Email's pooled 0.5 vanish, and the whole point of linear goes with them.",
      "Count every touch in the table as touches_assisted and the decoys inflate the raws: Google reads 8 instead of 6 (a day-30-out touch plus a never-converting user's touch), Email 7 instead of 6 (a post-conversion touch) and Meta 7 instead of 6, while Affiliate's 1 agrees — touches_assisted counts PAIRED touches only.",
    ],
    ladder: [
      { title: "Brute force — split by hand", body: "Write each conversion's touches in a row, divide 1 by the row length, and stack the fractions per channel. Six conversions is tractable; a month of traffic is not, and the divide-and-stack step is exactly what the SQL mechanizes." },
      { title: "The pattern — pair, size, sum", body: "A pairs CTE joins conversions to touches on user match plus the pinned window; COUNT(*) OVER (PARTITION BY conversion_id) sizes n; GROUP BY channel sums 1.0 / n raw and rounds once. Three CTEs, one statement, four rows." },
      { title: "The optimal idea — fractions raw, audit total", body: "O(P) over the P in-window pairs — one window pass to size, one grouped pass to sum. The durable rules: 1.0 / n never 1 / n, SUM before ROUND, the window inclusive at both ends, and the all-channel credit total must equal the conversion count." },
    ],
    approach: "pairs CTE on user match plus the pinned 30-day window, COUNT(*) OVER (PARTITION BY conversion_id) sizes n, GROUP BY channel sums raw 1.0/n and rounds once",
    schema: {
      ddl: `CREATE TABLE touches (
  touch_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  channel    TEXT NOT NULL,
  touch_date TEXT NOT NULL       -- 'YYYY-MM-DD'
);
CREATE TABLE conversions (
  conversion_id   INTEGER PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  conversion_date TEXT NOT NULL    -- 'YYYY-MM-DD'
);`,
      seed: `-- October 2026. Six conversions: n 4, 2, 1, 3, 3, 6 — halves, quarters,
-- thirds and sixths, all dyadic-friendly or hand-checkable. Google, Meta and
-- Email each land exactly 6 paired touches and Affiliate lands the only 1.0.
-- Four decoy touches: day -30 out twice, one after its conversion, one for a
-- user who never converts.
INSERT INTO touches (touch_id, user_id, channel, touch_date) VALUES
  (1, 101, 'Google',    '2026-10-01'),
  (2, 101, 'Meta',      '2026-10-05'),
  (3, 101, 'Email',     '2026-10-08'),
  (4, 101, 'Email',     '2026-10-09'),
  (5, 102, 'Meta',      '2026-09-13'),  -- day -29 boundary for conversion 2, IN
  (6, 102, 'Email',     '2026-10-12'),  -- day 0 for conversion 2
  (7, 103, 'Affiliate', '2026-10-15'),  -- the single-touch conversion
  (8, 104, 'Google',    '2026-10-03'),
  (9, 104, 'Email',     '2026-10-10'),
  (10, 104, 'Meta',     '2026-10-20'),
  (11, 105, 'Google',   '2026-10-05'),
  (12, 105, 'Email',    '2026-10-15'),
  (13, 105, 'Meta',     '2026-10-25'),
  (14, 107, 'Google',   '2026-10-18'),
  (15, 107, 'Meta',     '2026-10-20'),
  (16, 107, 'Google',   '2026-10-22'),
  (17, 107, 'Email',    '2026-10-24'),
  (18, 107, 'Meta',     '2026-10-26'),
  (19, 107, 'Google',   '2026-10-28'),
  (20, 101, 'Meta',     '2026-09-10'),  -- decoy: day -30 for conversion 1, OUT
  (21, 105, 'Google',   '2026-09-25'),  -- decoy: day -30 for conversion 5, OUT
  (22, 102, 'Email',    '2026-10-13'),  -- decoy: after conversion 2, OUT
  (23, 106, 'Google',   '2026-10-19');  -- decoy: user 106 never converts
INSERT INTO conversions (conversion_id, user_id, conversion_date) VALUES
  (1, 101, '2026-10-10'),
  (2, 102, '2026-10-12'),
  (3, 103, '2026-10-15'),
  (4, 104, '2026-10-20'),
  (5, 105, '2026-10-25'),
  (6, 107, '2026-10-28');`,
      tables: [
        { name: "touches", note: "23 rows — 19 in-window paired touches plus 4 decoys (two day -30, one post-conversion, one never-converting user)" },
        { name: "conversions", note: "6 rows — window touch counts n 4, 2, 1, 3, 3, 6" },
      ],
    },
    code: `WITH pairs AS (
    -- one row per (conversion, touch) pair: the user must match and the touch
    -- must sit in the PINNED 30-day lookback [day -29, day 0], both inclusive
    SELECT
        c.conversion_id,
        t.channel
    FROM conversions c
    JOIN touches t
        ON t.user_id = c.user_id
       AND t.touch_date >= date(c.conversion_date, '-29 day')
       AND t.touch_date <= c.conversion_date
),
sized AS (
    -- n = the conversion's in-window touch count, and every pair of that
    -- conversion carries the same n
    SELECT
        conversion_id,
        channel,
        COUNT(*) OVER (PARTITION BY conversion_id) AS n
    FROM pairs
)
SELECT
    channel,
    COUNT(*) AS touches_assisted,
    -- the fraction machine: the SUM runs on RAW 1.0/n values, rounding last
    ROUND(SUM(1.0 / n), 2) AS credited_conversions
FROM sized
GROUP BY channel
ORDER BY credited_conversions DESC, channel ASC;`,
    walkthrough: [
      "pairs walks all six conversions and collects every qualifying touch. Conversion 1 (user 101, converts 2026-10-10, window 2026-09-11 through 10-10) catches Google 10-01, Meta 10-05 and the two Email touches 10-08 and 10-09 — four pairs — while the Meta touch on 09-10 misses the window's opening day by one and pairs with nothing. Conversion 2 catches its Meta touch exactly on the day -29 boundary plus its Email on the conversion day itself. Conversion 3 catches the lone Affiliate touch, conversions 4 and 5 catch three touches each, and conversion 6 catches six with three of them Google.",
      "sized stamps each pair with its conversion's touch count: n 4 for the quarters, n 2 for the halves, n 1 for the single, n 3 twice for the thirds and n 6 for the sixths. The grouped pass accumulates per channel: Email collects 0.25 + 0.25 + 0.5 + 0.333... + 0.333... + 0.166... = 1.8333..., Meta collects 0.25 + 0.5 + three thirds = 1.75, Google 0.25 + two thirds + 0.5 = 1.4166..., Affiliate the lone 1.0. Every SUM runs on the raw doubles and the single ROUND lands at the very end.",
      "The engine ships four rows: Email with 6 touches and 1.83, Meta with 6 and 1.75, Google with 6 and 1.42, Affiliate with 1 and 1.0. The three big channels each assisted exactly six touches, yet Email earns 1.83 against Google's 1.42 because Email sat in five conversions while Google sat in four and twice shared a crowded six-touch sale. The audit line closes the loop: 1.83 + 1.75 + 1.42 + 1.0 = 6.0, exactly the six conversions — every fraction accounted for, nothing double-counted.",
    ],
    time: "O(P) over the P in-window (conversion, touch) pairs — one window pass to size n and one grouped pass to sum the credits",
    space: "O(P) — the pairs and sized CTEs hold one row per in-window pair",
    followUps: [
      "Run last-touch on the same seed — the final in-window touch takes the whole 1.0 — and compare its channel table with linear's: which channel wins, and how do Affiliate and Email swap places?",
      "Weight the split by position — 40 percent to the first touch and the remainder shared evenly — and check which CTE changes and whether Email still beats Affiliate on this seed.",
    ],
    related: ["funnel-step-conversion", "median-time-to-convert", "growth-accounting"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "budget-pacing",
    statement:
      "Campaigns get a budget for the month, and pacing asks a daily question: has the running spend line crossed the ceiling yet? campaign_spend logs (campaign, day, spend_cents) with contiguous days per campaign, and campaign_budgets holds one budget_cents per campaign. Report each campaign's FIRST breach day, where cum_spend is the running SUM of spend_cents over (PARTITION BY campaign ORDER BY day), a breach is the first day cum_spend is STRICTLY greater than budget_cents — landing exactly on the budget is on-plan, not a breach — and over_by_cents = cum_spend_at_breach - budget_cents. Campaigns that never breach are excluded. Columns: campaign, breach_day, cum_spend_at_breach, budget_cents, over_by_cents, ordered by breach_day ASC, campaign ASC.",
    examples: [
      {
        input:
          "flash_sale opens the month at 20000, 18000 and 15000 cents on 2026-10-01 through 10-03 against a 50000-cent budget — the cumulative line reads 20000, 38000, 53000",
        output: "flash_sale · 2026-10-03 · 53000 · 50000 · 3000",
        explanation:
          "Day 2 still sits 38000 under the ceiling; day 3 is the first STRICTLY-greater day at 53000, 3000 cents over — the report ships that first crossing only, and the quieter days after it never appear.",
      },
      {
        input:
          "brand_search spends 8000 a day for eight days, then 12000 on 2026-10-09 against a 75000 budget; retargeting's line lands exactly on its 40000 budget on 2026-10-06; always_on peaks at 48000 against 200000",
        output: "flash_sale · 2026-10-03 · 53000 · 50000 · 3000, then brand_search · 2026-10-09 · 76000 · 75000 · 1000",
        explanation:
          "retargeting never reports — landing exactly on the budget is on-plan under the strictly-greater rule — and always_on never gets close; the output is two rows, one per campaign that actually crossed.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: spend_cents, budget_cents, cum_spend_at_breach and over_by_cents are integers and this report has no REAL column",
      "PINNED breach test: cum_spend_cents = SUM(spend_cents) OVER (PARTITION BY campaign ORDER BY day) and a breach is the FIRST day with cum_spend_cents STRICTLY greater than budget_cents — equality is on-plan; over_by_cents = cum_spend_at_breach - budget_cents",
      "campaigns that never breach are EXCLUDED (no row); one row per breaching campaign; days are contiguous per campaign within its own date range and campaigns may fly different ranges",
      "ORDER BY breach_day ASC, campaign ASC",
    ],
    primer: {
      hook: "Budget pacing is the ad platform's speed limit — the same 500 dollars can be spent calmly across a month or torched by lunch, and the pacing report says which happened and on exactly which day.",
      concept: [
        "A monthly budget is not a number, it is a speed: 50000 cents across 30 days means roughly 1700 cents a day, and spending 20000 on day one is not enthusiasm, it is a blown plan. Budget pacing is the discipline of watching the cumulative spend line — the running total day by day — against the budget. The first day the line crosses the ceiling is the single most actionable timestamp in ad operations, because it turns a vague sense of overspending into a dated row someone can act on.",
        "The cumulative line is a window function's home turf: SUM(spend) OVER (PARTITION BY campaign ORDER BY day) turns a column of daily spends into a stair that only goes up. Daily bars hide the trajectory — a calm-looking 15000-cent day can be the one that tips a line already sitting at 48000. The running sum makes the approach to the ceiling visible days ahead, which is the difference between throttling a campaign on time and discovering it died.",
        "The breach needs one careful word: strictly. A campaign whose line lands exactly on its budget has paced perfectly — it spent every cent it was allowed and never a cent more — and flagging it as a breach would punish the best behavior in the report. So the test is cum greater than budget, never greater-or-equal, and the report keeps only the FIRST crossing day: the day after the breach is old news, and ten breach rows per campaign bury the headline.",
        "Pacing reports exclude campaigns that never cross: no news is not a row. The output stays deliberately short — one row per violator, the crossing day, the cumulative total at the crossing and the over-by amount. The reader is a human deciding whether to pause, throttle bids or extend the flight before the money runs out, and every extra row costs that reader attention.",
      ],
      worked: [
        "Give a campaign a 10000-cent budget and four daily spends: 4000, 3000, 2000, 2000.",
        "The cumulative line reads 4000, 7000, 9000, then 11000 on day 4.",
        "Days 1 through 3 stay at or under the ceiling; day 4 is the first day the line is strictly above 10000, so the breach day is day 4 and the over-by is 1000.",
        "Now change day 4 to 1000: the line ends at exactly 10000 — equality, not a breach — and the campaign ships no row at all.",
        "Had the spends been 6000 on day 1, the line would have crossed on day 1: front-loading moves the breach day, and the whole report exists to timestamp it.",
      ],
      glossary: [
        { term: "budget pacing", def: "the rate at which a campaign spends its budget across the flight, compared with plan" },
        { term: "cumulative spend", def: "the running total of daily spend from the flight's first day through the current day" },
        { term: "flight", def: "the scheduled date range a campaign runs in" },
        { term: "front-loading", def: "spending disproportionately early in the flight, the classic pacing failure" },
        { term: "breach", def: "the first day the cumulative spend line is strictly above the budget" },
        { term: "throttle", def: "the platform-side slowdown that caps delivery once a campaign spends too fast" },
      ],
      reallife: [
        "Ad-operations teams own pacing, and the big platforms throttle delivery automatically when a campaign spends too fast — but the advertiser-side report still needs the exact crossing day to argue refunds, budget resets or a flight extension. The breach day plus the over-by amount quantify the damage: a campaign 3000 cents over on day 3 will exhaust its month in days unless someone pauses or rebalances it. The same report protects the well-behaved campaigns, because a line that stays under its ceiling for the whole flight is proof the plan can run untouched.",
        "What breaks in practice: late-arriving spend rows that move the crossing day backward after the fact, budgets changed mid-flight without a version column, and timezone edges that split one day's spend across two buckets. Analysts pin the strictly-greater convention so a campaign that lands exactly on budget — the mark of good pacing — never gets flagged. They read first-breach rather than every-over day because the first crossing is the actionable event and every later row is just the aftermath of a decision already made.",
      ],
      where: "Ad-ops analysts and marketing-data engineers at Meta and TikTok watch pacing dashboards hourly, and platform-side interviews ask candidates to find the exact day a spend line crosses its budget.",
    },
    breakdown: [
      "The report is one number per violator, and the hard part is defining the crossing precisely. The cumulative line is SUM(spend_cents) OVER (PARTITION BY campaign ORDER BY day) — the partition matters because campaigns share the same calendar days, and without it the running total bleeds across campaigns into one global line that breaches every budget almost immediately. The breach test is strictly greater: a line landing exactly on the budget is the pacing ideal, and an equality breach would flag the best-behaved campaign in the seed.",
      "First crossing is a rank away: filter the over-budget rows, stamp ROW_NUMBER () OVER (PARTITION BY campaign ORDER BY day), keep rn = 1. Skipping that pick ships every breaching day — ten rows for a front-loader that keeps spending after day 3 — and buries the actionable headline. The money columns come free at the crossing: cum_spend_at_breach is the running total on that day and over_by_cents is cum minus budget, the damage figure the ad-ops reader budgets a pause against.",
      "Two quiet traps live in the seed. The exactly-at-budget campaign — retargeting, whose line lands on 40000 on 2026-10-06 and stops — must produce NOTHING, which is what makes the strictly-greater pin testable rather than decorative. And campaigns fly different date ranges, six days for one and twelve for the rest, so any read that assumes a shared calendar or forgets the partition picks up another campaign's spend; the window's ORDER BY day inside the partition is the only thing keeping four campaigns' arithmetic separate.",
    ],
    edges: [
      "Flip the breach test to greater-or-equal and retargeting joins the report: its line lands exactly on 40000 on 2026-10-06, producing a third row with over_by_cents 0 that flags exactly the campaign the strict rule protects — 3 rows instead of 2.",
      "Drop the rn = 1 pick and every breaching day ships: 10 rows for flash_sale (2026-10-03 through 10-12) and 4 for brand_search (10-09 through 10-12) — 14 rows instead of 2, the headline drowned in repetition.",
      "Forget PARTITION BY campaign and the running sum becomes one global line: all four campaigns breach against everyone's spend — retargeting on 2026-10-01 (42000), brand_search and flash_sale both on 10-02 (81000) and even never-near always_on on 10-09 (216500) — 4 rows instead of 2, every over_by wildly wrong.",
      "Store budgets in dollars and compare them against cents — budget_cents 500 instead of 50000 — and every campaign breaches on day one (2026-10-01): 4 rows, all first-day, the unit mismatch flagging flawless campaigns as disasters.",
    ],
    ladder: [
      { title: "Brute force — walk the calendar", body: "Sum each campaign's spends day by day on paper, mark the first day the total clears the budget, and copy the row. Four campaigns over twelve days is doable; a hundred campaigns over a quarter is exactly the repetition SQL removes." },
      { title: "The pattern — running sum, filter, first", body: "paced computes SUM(spend_cents) OVER (PARTITION BY campaign ORDER BY day) beside each row's budget; breaches filters cum strictly over budget; ROW_NUMBER per campaign keeps rn = 1. One statement, one row per violator." },
      { title: "The optimal idea — partition the line, pin the strictness", body: "O(n log n) over the n spend rows — one ordered window pass plus one ranked pass over the breaching subset. The durable rules: partition by campaign, strictly greater, first crossing only, over_by as the damage figure." },
    ],
    approach: "running SUM per campaign ordered by day, filter rows strictly over budget, ROW_NUMBER keeps the first breach per campaign",
    schema: {
      ddl: `CREATE TABLE campaign_spend (
  campaign    TEXT NOT NULL,
  day         TEXT NOT NULL,      -- 'YYYY-MM-DD', contiguous per campaign
  spend_cents INTEGER NOT NULL,
  PRIMARY KEY (campaign, day)
);
CREATE TABLE campaign_budgets (
  campaign     TEXT PRIMARY KEY,
  budget_cents INTEGER NOT NULL
);`,
      seed: `-- October 2026. flash_sale front-loads and breaches day 3 (53000 vs 50000).
-- brand_search climbs 8000 a day then spikes day 9 (76000 vs 75000).
-- retargeting lands EXACTLY on 40000 on 10-06 and never exceeds (no row).
-- always_on peaks at 48000 against 200000 (no row).
INSERT INTO campaign_budgets (campaign, budget_cents) VALUES
  ('flash_sale',   50000),
  ('brand_search', 75000),
  ('retargeting',  40000),
  ('always_on',    200000);
INSERT INTO campaign_spend (campaign, day, spend_cents) VALUES
  ('flash_sale', '2026-10-01', 20000),
  ('flash_sale', '2026-10-02', 18000),
  ('flash_sale', '2026-10-03', 15000),  -- cum 53000, first breach
  ('flash_sale', '2026-10-04',  4000),
  ('flash_sale', '2026-10-05',  3000),
  ('flash_sale', '2026-10-06',  2000),
  ('flash_sale', '2026-10-07',  1000),
  ('flash_sale', '2026-10-08',  1000),
  ('flash_sale', '2026-10-09',   500),
  ('flash_sale', '2026-10-10',   500),
  ('flash_sale', '2026-10-11',   500),
  ('flash_sale', '2026-10-12',   500),
  ('brand_search', '2026-10-01', 8000),
  ('brand_search', '2026-10-02', 8000),
  ('brand_search', '2026-10-03', 8000),
  ('brand_search', '2026-10-04', 8000),
  ('brand_search', '2026-10-05', 8000),
  ('brand_search', '2026-10-06', 8000),
  ('brand_search', '2026-10-07', 8000),
  ('brand_search', '2026-10-08', 8000),
  ('brand_search', '2026-10-09', 12000),  -- cum 76000, first breach
  ('brand_search', '2026-10-10',  9000),
  ('brand_search', '2026-10-11',  8000),
  ('brand_search', '2026-10-12',  7000),
  ('retargeting', '2026-10-01', 10000),
  ('retargeting', '2026-10-02',  9000),
  ('retargeting', '2026-10-03',  8000),
  ('retargeting', '2026-10-04',  7000),
  ('retargeting', '2026-10-05',  3000),
  ('retargeting', '2026-10-06',  3000),  -- cum 40000 EXACTLY on budget
  ('always_on', '2026-10-01', 4000),
  ('always_on', '2026-10-02', 4000),
  ('always_on', '2026-10-03', 4000),
  ('always_on', '2026-10-04', 4000),
  ('always_on', '2026-10-05', 4000),
  ('always_on', '2026-10-06', 4000),
  ('always_on', '2026-10-07', 4000),
  ('always_on', '2026-10-08', 4000),
  ('always_on', '2026-10-09', 4000),
  ('always_on', '2026-10-10', 4000),
  ('always_on', '2026-10-11', 4000),
  ('always_on', '2026-10-12', 4000);`,
      tables: [
        { name: "campaign_spend", note: "42 rows — flash_sale 12 days, brand_search 12, retargeting 6 (ends exactly on budget), always_on 12" },
        { name: "campaign_budgets", note: "4 rows — 50000, 75000, 40000, 200000 cents" },
      ],
    },
    code: `WITH paced AS (
    -- the running spend line per campaign: it crosses the budget some day
    -- (or never) and the budget join is 1:1, so every spend row carries its ceiling
    SELECT
        s.campaign,
        s.day,
        SUM(s.spend_cents) OVER (PARTITION BY s.campaign ORDER BY s.day) AS cum_spend_cents,
        b.budget_cents
    FROM campaign_spend s
    JOIN campaign_budgets b ON b.campaign = s.campaign
),
breaches AS (
    -- STRICTLY greater: landing exactly ON the budget is on-plan, not a
    -- breach, and the rank keeps only the FIRST crossing day per campaign
    SELECT
        campaign,
        day,
        cum_spend_cents,
        budget_cents,
        ROW_NUMBER() OVER (PARTITION BY campaign ORDER BY day) AS rn
    FROM paced
    WHERE cum_spend_cents > budget_cents
)
SELECT
    campaign,
    day AS breach_day,
    cum_spend_cents AS cum_spend_at_breach,
    budget_cents,
    cum_spend_cents - budget_cents AS over_by_cents
FROM breaches
WHERE rn = 1
ORDER BY breach_day ASC, campaign ASC;`,
    walkthrough: [
      "paced builds each campaign's line. flash_sale climbs 20000, 38000, 53000 across its first three days and is over its 50000 budget on 2026-10-03, and brand_search adds 8000 a day for eight days (64000 by 10-08), then spends 12000 on 10-09 and lands at 76000 against 75000. retargeting staircases 10000, 19000, 27000, 34000, 37000, 40000 and stops exactly on its budget, while always_on crawls to 48000 against 200000.",
      "The breaches filter keeps rows where the line is strictly over: flash_sale contributes every day from 10-03 onward and brand_search from 10-09 onward, while retargeting and always_on contribute nothing at all. ROW_NUMBER orders each campaign's surviving rows by day and rn = 1 keeps the first crossing — 2026-10-03 at 53000 for flash_sale, 2026-10-09 at 76000 for brand_search. The projection subtracts each budget at the crossing to print over_by_cents, 3000 and 1000, the two damage figures the whole report exists to surface.",
      "The engine ships two rows in breach_day order: flash_sale with 2026-10-03, 53000, 50000, 3000 and brand_search with 2026-10-09, 76000, 75000, 1000. The two excluded campaigns are the report's negative space: retargeting's exactly-on-budget finish is the convention working (equal is on-plan), and always_on's 48000 peak never threatens 200000. Both would reappear under the greater-or-equal variant — retargeting on 10-06 with over_by 0 — which is why the strict pin is the first trap the check asserts.",
    ],
    time: "O(n log n) over the n spend rows — one ordered window pass for the running sum plus one ranked pass over the breaching subset",
    space: "O(n) — the paced CTE holds one row per spend row and breaches holds only the violators",
    followUps: [
      "Project the breach from the average daily rate instead of detecting it — what day does the spend-to-date over days-elapsed extrapolation predict for flash_sale, and how far off the true 2026-10-03 does it land?",
      "Add a headroom column — budget minus the current cumulative line — and find the day retargeting's headroom first hits zero; which window frame turns that into a per-day figure?",
    ],
    related: ["daily-balance-interest", "max-drawdown", "rolling-7d-actives"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "channel-ltv-vs-cac",
    statement:
      "Channel budget meetings end with one ratio: what a channel's customer pays back in the first 90 days, against what the channel paid to acquire them. customers holds (customer_id, channel, acquisition_date), orders holds (order_id, customer_id, order_date, revenue_cents), and channel_spend holds one spend_cents per channel. The 90-day clock is the customer's OWN: an order counts when order_date falls in [acquisition_date, acquisition_date + 89 days] — the acquisition day itself counts as day 0 and day 90 is the first day out. Report per channel: channel, customers, cac_cents = ROUND(spend_cents / customers, 0), rev90_cents = the SUM of in-window order revenue, rev90_per_customer = ROUND(rev90_cents / customers, 2) with zero-order customers still in the denominator, and ltv_cac_ratio = ROUND(rev90_per_customer / cac_cents, 2), ordered by ltv_cac_ratio DESC.",
    examples: [
      {
        input:
          "customer 101 (search) acquires 2026-07-01, orders 12000 cents on 2026-09-28 — day 89 of the customer's own clock — and again 12000 on 2026-09-29, day 90",
        output: "search · 4 · 9000 · 236000 · 59000 · 6.56",
        explanation:
          "The day-89 order counts and the day-90 order never does; 236000 pools 60000 + 104000 + 72000 across four customers including the zero-order one, and 236000 / 4 = 59000 against a 9000 CAC reads 6.56.",
      },
      {
        input:
          "all three channels — search spends 36000 for 4 customers who order weekly, email spends 24000 for 4, social spends 5000 for 5 one-and-done buyers whose five orders total 3000",
        output: "search · 4 · 9000 · 236000 · 59000 · 6.56, then email · 4 · 6000 · 55000 · 13750 · 2.29, then social · 5 · 1000 · 3000 · 600 · 0.6",
        explanation:
          "Search pays 9000 a customer and collects 59000 inside the window; social returns 600 against 1000 — a 0.6 ratio means the channel buys revenue below cost, and the ORDER BY is the budget verdict.",
      },
    ],
    constraints: [
      "all money is INTEGER cents (revenue_cents, spend_cents); cac_cents and rev90_cents report as integer-valued cells; rev90_per_customer and ltv_cac_ratio are the only 2dp REALs",
      "PINNED window: an order counts toward rev90 when order_date is in [acquisition_date, acquisition_date + 89 days] — the customer's OWN clock, the acquisition day inclusive, day 89 the last day in, day 90 the first day out",
      "PINNED formulas: cac_cents = ROUND(spend_cents / customers, 0); rev90_per_customer = ROUND(rev90_cents / customers, 2) with every customer in the denominator (zero-order customers included); ltv_cac_ratio = ROUND(rev90_per_customer / cac_cents, 2) on the reported cells",
      "every channel in channel_spend has customers in the seed and reports one row; ORDER BY ltv_cac_ratio DESC",
    ],
    primer: {
      hook: "Every growth team eventually asks the only question that matters about a marketing channel — what does a customer from it actually pay us back — and the honest answer is a 90-day revenue clock set against acquisition cost.",
      concept: [
        "Buying a customer costs money — ads, promos, referral bounties — and that cost is the customer acquisition cost, CAC: channel spend divided by customers acquired. The question that decides budgets is the mirror image: what does the customer give back? Lifetime value, LTV, is the honest name, but true lifetime revenue takes years nobody wants to wait for, so teams measure a fixed window — commonly the first 90 days — as the payback proxy.",
        "The 90-day window sounds like one date range but is really one per customer. A customer acquired on July 1 has a clock running July 1 through September 28 — the acquisition day itself is day 0, and day 89, which is 89 days later, is the last day in. Measuring everyone against one global calendar quietly punishes late acquirers, whose orders land beyond the shared window, and flatters early ones, so the customer's OWN clock is the only fair ruler.",
        "Per channel the arithmetic stacks: rev90_cents sums the in-window order revenue, customers counts everyone the channel acquired, and rev90_per_customer divides the first by the second — including the customers who never ordered at all. Dropping them would inflate the average exactly when the channel is failing, the analytical sin called survivorship. The denominator stays honest because the spend bought those zero-order customers too, and the same count divides the channel spend so both sides of the ratio share one denominator.",
        "The last step divides revenue by cost: ltv_cac_ratio equals rev90_per_customer over cac_cents, both in cents, so the units cancel cleanly. Above 1.0 means the channel pays for itself inside the window; below 1.0 means it is buying revenue below cost and needs either cheaper acquisition or customers who order again. Teams read the ratios as a ladder — the top channel earns the next budget increment, the bottom channel loses it.",
      ],
      worked: [
        "Say a channel spent 1200 cents and acquired 4 customers, so CAC reads 1200 / 4 = 300 cents each.",
        "Customer a orders 250 cents on day 10 and customer b orders 250 cents on day 89 — both inside their own 90-day clocks.",
        "Customer c orders 250 cents on day 90 of their clock: the first day OUT, so it contributes nothing.",
        "Customer d never orders but stays in the denominator: rev90 reads 250 + 250 = 500 across all 4 customers.",
        "rev90_per_customer = 500 / 4 = 125, and the ratio 125 / 300 = 0.4166... rounds to 0.42 — the channel is under water at 90 days despite two buyers.",
      ],
      glossary: [
        { term: "CAC (customer acquisition cost)", def: "channel spend divided by the number of customers the channel acquired" },
        { term: "LTV (lifetime value)", def: "the revenue a customer generates over their whole relationship with the business" },
        { term: "payback window", def: "the fixed early period, here 90 days, whose revenue stands in for lifetime value" },
        { term: "customer clock", def: "the per-customer date range starting at that customer's own acquisition date" },
        { term: "one-and-done buyer", def: "a customer who orders once and never returns inside the window" },
        { term: "unit economics", def: "the per-customer revenue-versus-cost arithmetic that decides if growth pays for itself" },
      ],
      reallife: [
        "A growth team owns the ratio and brings it to every budget meeting: channels whose 90-day revenue per customer clears their CAC earn more budget, and channels below 1.0 are on notice. Marketplace and commerce businesses — the merchant-acquisition side of Shopify, the shopper-growth side of Instacart — live on this arithmetic every quarter. The window choice is the whole argument: a 30-day window starves slow-burning channels, a 365-day window hides today's waste, and whoever picks the window is quietly picking the winners.",
        "What breaks in practice: survivorship, where dropping zero-order customers flatters the channel exactly when it is failing, and global windows that measure late-acquired customers against a clock that started before they existed. Boundary drift is quieter still — a 90-day window becomes 91 days because someone wrote plus 90 instead of plus 89, and on this seed that one character moves 12000 cents into search. Finance reconciles the rev90 sums against the orders ledger monthly, and a mismatch there is a data-integrity ticket, not a rounding note.",
      ],
      where: "Growth analysts and marketing data scientists at Shopify and Instacart defend budget shifts with this ratio, and analytics interviews at marketplaces and subscription businesses test the per-customer window constantly.",
    },
    breakdown: [
      "The report looks like a ratio and is secretly a clock. rev90_cents sums each order whose order_date falls in the customer's OWN window [acquisition_date, acquisition_date + 89 days] — not a global calendar range — so the same order_date can count for one customer and miss for another. The seed engineers that boundary twice on customer 101: the 2026-09-28 order is day 89 and counts, the 2026-09-29 order is day 90 and is the first day out; a plus-90 variant quietly adds 12000 cents to search and flatters the ratio from 6.56 to 6.89.",
      "The denominator is a promise: customers counts every acquired customer, and the zero-order one — customer 104, acquired on the seed's last day — stays in it. That is what makes rev90_per_customer honest: 236000 cents across 4 customers reads 59000, not 78666.67, because the spend bought four attempts, not three. cac_cents divides the same way — ROUND(spend / customers, 0) — so both per-customer numbers share a denominator and the final ratio compares like against like in cents.",
      "Mechanically the query is a LEFT JOIN from customers to orders with the window conditions INSIDE the join (order_date at or above acquisition_date AND at or below date(acquisition_date, '+89 day')), a per-customer GROUP BY with COALESCE stamping zero-order customers at 0, a per-channel pass counting customers and summing revenue, and a projection that rounds at the pinned places. The rounding pins are cac to 0 decimals, per-customer to 2 and the ratio to 2 on the reported cells, and every division in this seed is exact so the roundings never touch a fraction. The channels rank themselves: search 6.56, email 2.29, social 0.6, and the budget meeting reads that ORDER BY as the verdict.",
    ],
    edges: [
      "Measure every channel against one global clock — each channel's earliest acquisition date plus 89 days — and the late acquirers' orders vanish: search reads 218000 (ratio 6.06), email 46000 (1.92) and social 2200 (0.44) instead of 236000 / 6.56, 55000 / 2.29 and 3000 / 0.6.",
      "Let day 90 in — order_date at or below acquisition_date + 90 — and exactly one order flips: customer 101's 2026-09-29 purchase (12000) lifts search to 248000 and the ratio to 6.89, while customer 102's day-91 order stays correctly out; email and social do not move.",
      "Exclude zero-order customers (an INNER JOIN to orders) and search's row reads customers 3, cac_cents 12000 and rev90_per_customer 78666.67 — the ratio happens to survive at 6.56 on this seed, but the three honest cells move, and the tell is that the denominator promise is gone.",
      "Read the ratio as rev90_per_customer times 100 over cac and everything inflates a hundredfold: search prints 655.56 instead of 6.56 — cents against cents are already the same unit, and the pinned formula divides the two reported cells directly.",
    ],
    ladder: [
      { title: "Brute force — one clock per customer, by hand", body: "For each customer write their window start and end, scan their orders, strike anything on day 90 or later, and sum the survivors. Thirteen customers works once; every channel, every month, forever is why the clock must live inside the query." },
      { title: "The pattern — windowed join, two rollups", body: "LEFT JOIN orders with the [acq, acq + 89] conditions inside the join, GROUP BY customer with COALESCE 0, then GROUP BY channel for customers and rev90, then the ratio of the two per-customer cells. The LEFT JOIN is the denominator promise." },
      { title: "The optimal idea — own clock, whole denominator, round at the pins", body: "O(O) over the O order rows — one join pass and two grouped passes over 13 customers. The durable rules: the clock is the customer's, zero-order customers stay counted, cac rounds to 0 decimals, per-customer and ratio to 2, and the ratio divides the reported cells." },
    ],
    approach: "LEFT JOIN orders onto each customer's own [acq, acq + 89] window, per-customer rollup with COALESCE 0, per-channel customers and rev90, ratio of the two reported per-customer cells",
    schema: {
      ddl: `CREATE TABLE customers (
  customer_id      INTEGER PRIMARY KEY,
  channel          TEXT NOT NULL,
  acquisition_date TEXT NOT NULL   -- 'YYYY-MM-DD', the customer's clock starts here
);
CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  order_date    TEXT NOT NULL,     -- 'YYYY-MM-DD'
  revenue_cents INTEGER NOT NULL
);
CREATE TABLE channel_spend (
  channel     TEXT PRIMARY KEY,
  spend_cents INTEGER NOT NULL
);`,
      seed: `-- 3 channels. search: high CAC (9000), weekly orderers, the day-89 IN and
-- day-90 OUT boundary pair on customer 101, plus a zero-order customer 104
-- acquired on the last seed day. email: middle (CAC 6000). social: cheap
-- (CAC 1000), one-and-done buyers. Every division in the seed is exact.
INSERT INTO channel_spend (channel, spend_cents) VALUES
  ('search', 36000),
  ('email',  24000),
  ('social',  5000);
INSERT INTO customers (customer_id, channel, acquisition_date) VALUES
  (101, 'search', '2026-07-01'),
  (102, 'search', '2026-07-03'),
  (103, 'search', '2026-08-20'),
  (104, 'search', '2026-10-01'),  -- zero orders, last acquisition day of the seed
  (201, 'social', '2026-07-05'),
  (202, 'social', '2026-07-12'),
  (203, 'social', '2026-07-20'),
  (204, 'social', '2026-08-01'),
  (205, 'social', '2026-09-10'),
  (301, 'email',  '2026-07-10'),
  (302, 'email',  '2026-09-01'),
  (303, 'email',  '2026-07-25'),
  (304, 'email',  '2026-08-30');
INSERT INTO orders (order_id, customer_id, order_date, revenue_cents) VALUES
  (1, 101, '2026-07-01', 12000),
  (2, 101, '2026-07-08', 12000),
  (3, 101, '2026-07-15', 12000),
  (4, 101, '2026-07-22', 12000),
  (5, 101, '2026-09-28', 12000),  -- day 89 of customer 101's clock, IN (boundary)
  (6, 101, '2026-09-29', 12000),  -- day 90, OUT (boundary)
  (7, 102, '2026-07-03',  8000),
  (8, 102, '2026-07-10',  8000),
  (9, 102, '2026-07-17',  8000),
  (10, 102, '2026-07-24',  8000),
  (11, 102, '2026-07-31',  8000),
  (12, 102, '2026-08-07',  8000),
  (13, 102, '2026-08-14',  8000),
  (14, 102, '2026-08-21',  8000),
  (15, 102, '2026-08-28',  8000),
  (16, 102, '2026-09-04',  8000),
  (17, 102, '2026-09-11',  8000),
  (18, 102, '2026-09-18',  8000),
  (19, 102, '2026-09-25',  8000),  -- day 84, IN
  (20, 102, '2026-10-02',  8000),  -- day 91, OUT (the habit continues past the clock)
  (21, 103, '2026-08-20', 9000),
  (22, 103, '2026-08-27', 9000),
  (23, 103, '2026-09-03', 9000),
  (24, 103, '2026-09-10', 9000),
  (25, 103, '2026-09-17', 9000),
  (26, 103, '2026-09-24', 9000),
  (27, 103, '2026-10-01', 9000),
  (28, 103, '2026-10-08', 9000),   -- day 49, IN (window runs to 2026-11-17)
  (29, 201, '2026-07-06',   600),
  (30, 202, '2026-07-12',   500),
  (31, 203, '2026-08-15',   700),
  (32, 204, '2026-08-03',   400),
  (33, 205, '2026-10-20',   800),  -- day 40 of customer 205's clock, IN
  (34, 301, '2026-07-20', 12000),
  (35, 301, '2026-08-25', 13000),
  (36, 302, '2026-11-05',  9000),  -- day 65 of customer 302's clock, IN
  (37, 303, '2026-08-01',  7500),
  (38, 303, '2026-09-15',  7500),
  (39, 304, '2026-09-10',  6000);`,
      tables: [
        { name: "customers", note: "13 rows — search 4 (one zero-order customer 104), email 4, social 5" },
        { name: "orders", note: "39 rows — search 28 (13 weekly for customer 102 alone), email 6, social 5" },
        { name: "channel_spend", note: "3 rows — 36000, 24000, 5000 cents" },
      ],
    },
    code: `WITH rev90 AS (
    -- per customer: revenue landing on the customer's OWN 90-day clock —
    -- [acquisition_date, acquisition_date + 89 days], day 89 in, day 90 out,
    -- the LEFT JOIN keeps zero-order customers at 0 (they stay in the denominator)
    SELECT
        c.customer_id,
        c.channel,
        COALESCE(SUM(o.revenue_cents), 0) AS rev_cents
    FROM customers c
    LEFT JOIN orders o
        ON o.customer_id = c.customer_id
       AND o.order_date >= c.acquisition_date
       AND o.order_date <= date(c.acquisition_date, '+89 day')
    GROUP BY c.customer_id, c.channel
),
per_channel AS (
    -- every customer counts, including the ones who never ordered
    SELECT
        channel,
        COUNT(*) AS customers,
        SUM(rev_cents) AS rev90_cents
    FROM rev90
    GROUP BY channel
)
SELECT
    p.channel,
    p.customers,
    ROUND(cs.spend_cents * 1.0 / p.customers, 0) AS cac_cents,
    p.rev90_cents,
    ROUND(p.rev90_cents * 1.0 / p.customers, 2) AS rev90_per_customer,
    -- the pinned ratio divides the two REPORTED cells (cents vs cents)
    ROUND(ROUND(p.rev90_cents * 1.0 / p.customers, 2)
        / ROUND(cs.spend_cents * 1.0 / p.customers, 0), 2) AS ltv_cac_ratio
FROM per_channel p
JOIN channel_spend cs ON cs.channel = p.channel
ORDER BY ltv_cac_ratio DESC;`,
    walkthrough: [
      "rev90 walks all thirteen customers and joins each one's orders inside their own clock. Customer 101 (search, acquired 2026-07-01, window through 2026-09-28) keeps the 07-01, 07-08, 07-15 and 07-22 orders plus the 09-28 order on day 89 — five purchases, 60000 — and drops the 09-29 order as the first day out. Customer 102 keeps thirteen weekly orders (104000) and drops the 10-02 follow-up at day 91; customer 103 keeps eight orders (72000) well inside a window running to 11-17; customer 104 keeps nothing and still counts.",
      "The per-customer rollup holds thirteen rows including customer 104's zero, and the per-channel pass counts 4 search customers (60000 + 104000 + 72000 + 0 = 236000), 4 email customers (25000 + 9000 + 15000 + 6000 = 55000) and 5 social customers (3000). The projection rounds at the pins: search divides 36000 by 4 for a 9000 cac and 236000 by 4 for 59000 per customer, and the ratio of the two reported cells reads 6.56. Email divides 24000 by 4 for 6000 against 13750 per customer and reads 2.29, while social divides 5000 by 5 for 1000 against 600 and reads 0.6.",
      "The engine ships three rows in ratio order: search with 4, 9000, 236000, 59000, 6.56; email with 4, 6000, 55000, 13750, 2.29; social with 5, 1000, 3000, 600, 0.6. Every division in the seed is exact — 36000/4, 236000/4, 55000/4, 5000/5, 3000/5 — so the 2dp roundings never touch a fraction and the report is reproducible by hand. The 0.6 row is the budget meeting's loser: five one-and-done buyers returned 3000 cents against 5000 of spend, and the ratio says the channel buys revenue below cost inside the window that matters.",
    ],
    time: "O(O) over the O order rows — one windowed join pass, one per-customer rollup and one per-channel pass over 13 customers",
    space: "O(C) — one rollup row per customer plus one row per channel",
    followUps: [
      "Double the window to a 180-day clock (acquisition_date + 179 days) — which customers' orders change hands, and does search's ratio stretch further from email's or does email close the gap?",
      "Split each channel by acquisition month and compute the ratio per cohort-month — which GROUP BY keys change, and what does the spread inside one channel say about seasonality?",
    ],
    related: ["cohort-retention-matrix", "ab-test-conversion-lift", "loan-amortization-schedule"],
    order: "exact",
    xp: 35,
  },
];
