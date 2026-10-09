// Deep-dives — Data & Finance batch 3 (fraud/AML A): structuring detection,
// transaction velocity bursts and circular transfer pairs (3 problems: 2
// Medium, 1 Hard, all order:"exact" reads). Every money column is INTEGER
// cents with the _cents suffix; timestamps are INTEGER epoch seconds; own
// tables, own seeds, original phrasing — never copied problem text.
// Every dive carries a domain primer (LcPrimer) for first-time learners.
// Registry wiring (lead): 8031 structuring-detection ·
// 8032 transaction-velocity · 8033 circular-transfers.
import type { LcSqlDive } from "../types";

export const SQL_DF_FRAUD_A: LcSqlDive[] = [
  {
    slug: "structuring-detection",
    statement:
      "The deposits table logs one row per cash deposit: (deposit_id, customer_id, deposit_date, amount_cents), with dates as 'YYYY-MM-DD' text and amounts in INTEGER cents. Banks must report any single cash deposit of 1000000 cents or more — the $10,000 CTR wall — so the classic laundering answer is slicing deposits into pieces that each stay under the wall while the day's total crosses it. Flag every suspicious customer-day: per customer per calendar day, keep the groups with at least 3 deposits, a day total of at least 1000000 cents, and a largest single deposit strictly below 1000000 cents — the all-under guard that separates structuring from a legitimately reported large deposit. Output customer_id, deposit_date, deposit_count and day_total_cents, ordered by day_total_cents descending, then customer_id ascending, then deposit_date ascending.",
    examples: [
      {
        input: "customer 7 makes four cash deposits of 260000 cents each on 2026-09-14",
        output: "7 · 2026-09-14 · 4 · 1040000",
        explanation:
          "Four deposits, every one far under the 1000000-cent wall, yet the day sums to 1040000 cents — count at least 3, total at or above the wall, largest deposit under it, so the customer-day prints as structuring.",
      },
      {
        input: "customer 4 deposits 1200000 cents once on 2026-09-15 and adds two 100000-cent deposits the same day",
        output: "no row",
        explanation:
          "The 1200000-cent deposit crosses the wall on its own, so MAX(amount_cents) reads 1200000 and fails the strictly-below guard — that day is a legitimately reported CTR, not structuring, and the engine ships nothing for it.",
      },
    ],
    constraints: [
      "all money is INTEGER cents and the wall is pinned at 1000000 cents (10000 dollars), written into the query ONCE as a named constant — the wall(threshold_cents) CTE — never as scattered literals",
      "the pinned rule per (customer_id, deposit_date) group: deposit_count >= 3 AND day_total_cents >= 1000000 (inclusive on both) AND MAX(amount_cents) < 1000000 (strictly under, the all-under guard)",
      "one output row per qualifying customer-day only — customers whose every day stays quiet (small traffic, sub-wall totals, too few deposits) contribute nothing",
      "ORDER BY day_total_cents DESC, customer_id ASC, deposit_date ASC",
    ],
    primer: {
      hook: "Banks are legally required to report big cash deposits to the government, so compliance teams run exactly this query to catch customers who slice deposits to slip under the reporting line.",
      concept: [
        "Whenever a customer hands a bank more than 10000 dollars in cash in a single business day, the bank does not get to keep that quiet: it files a Currency Transaction Report, a CTR, with the government. The report is not an accusation — depositing large amounts of cash is perfectly legal, and the form simply records who moved how much. The reporting duty exists because cash is anonymous, and untraceable money is exactly what criminals need to spend stolen or drug proceeds without leaving a trail. That first step of getting illegal cash into the banking system has a name of its own: placement.",
        "The government side of the pipeline is FinCEN, the Financial Crimes Enforcement Network, a bureau of the US Treasury that collects CTRs and the suspicious-activity reports banks file. Because the 10000-dollar wall is public knowledge, a launderer can simply make nine deposits of 9999 dollars and never trigger a single report — a trick called structuring. Congress responded by making structuring a crime in itself, independent of where the money came from: deliberately splitting transactions to dodge a reporting threshold is illegal even when the cash is entirely clean. That is why the bank's computers watch for the pattern, not just for the total.",
        "The classic shape of structuring in deposit data is a burst of same-day cash deposits that individually look boring and together look deliberate — the street name for using a crew of runners to make the small deposits is smurfing. Surveillance therefore runs a compound test on each customer for each calendar day: several deposits (a common internal bar is 3 or more), a combined total that reaches the wall, and a largest single deposit that stayed under it. The third condition is the one beginners forget: a customer who deposits 12000 dollars once is over the wall, but that deposit generates its own CTR automatically — there is nothing to catch. Structuring lives in the gap between the parts and the whole, and only the maximum-under-the-wall guard measures it.",
        "In SQL the whole test is one grouped scan: group deposits by customer and day, count them, sum them, and take the max, then keep only the groups that pass all three conditions at once. Money lives in INTEGER cents so the comparisons are exact — 1000000 cents is the wall, and an inclusive >= on the total decides the boundary case. The output is a short list of customer-days for a human analyst to review; the query does not decide guilt, it decides who gets looked at.",
      ],
      worked: [
        "Set the wall at 10000 dollars and watch one customer, Ana, for a single Monday. She deposits 4000 dollars at 9 am, 3500 dollars at noon and 3000 dollars at 4 pm — three separate cash deposits, none of which triggers a report alone.",
        "Add the day up by hand: 4000 + 3500 + 3000 = 10500 dollars, which crosses the 10000-dollar wall in total. The largest single deposit is 4000 dollars, comfortably under the wall.",
        "Run the three-part test: deposit count 3 (at least 3 — pass), day total 10500 (at or above the wall — pass), largest deposit 4000 (strictly under the wall — pass). Monday is a structuring day for Ana.",
        "Contrast Ben, who deposits 12000 dollars once on Tuesday. His count is 1 and his largest deposit is 12000, so he fails two of the three tests — and that is correct, because his deposit was reported automatically; the query exists to find the customers the CTR stream will never show.",
      ],
      glossary: [
        { term: "CTR", def: "Currency Transaction Report — the form a bank files for cash over the reporting wall" },
        { term: "FinCEN", def: "the US Treasury bureau that collects currency and suspicious-activity reports from banks" },
        { term: "structuring", def: "deliberately splitting transactions to stay under a reporting threshold — a crime by itself" },
        { term: "smurfing", def: "using a crew of runners to make many small deposits for one launderer" },
        { term: "placement", def: "the first laundering stage, where dirty cash first enters the financial system" },
        { term: "reporting wall", def: "the amount at or above which a cash transaction must be reported — 10000 dollars" },
      ],
      reallife: [
        "At a retail bank this query is a nightly batch in the transaction-monitoring stack, run by the BSA team — named for the Bank Secrecy Act, the US law behind the reporting duties. The engine scores every customer-day, and anything that trips the rule lands in an analyst queue with the deposit list attached. The analyst, not the SQL, makes the call: most alerts are pizzerias and nail salons whose cash flow is genuinely lumpy, and a small fraction are customers who need a Suspicious Activity Report.",
        "What breaks in practice is tuning. Set the count bar at 2 and every retiree depositing two birthday checks flags; set the total bar at 999999 cents and you have defined structuring-by-a-penny; drop the all-under guard and you alert on the customers the government already sees. Teams backtest rules against known cases — accounts that ended in enforcement actions — and adjust thresholds until the alert list is small enough to work and still catches the planted ones.",
        "The numbers drive real decisions with real deadlines. A confirmed structuring pattern obliges the bank to file a SAR within 30 days, and regulators have fined banks nine figures for missing exactly this pattern spread across branches. The same alert can also take the quiet path: keep the customer, watch the account, and let investigators build the picture.",
      ],
      where: "AML and BSA analysts at retail banks, risk and compliance data roles at fintechs and payment processors, and regulator-side examiners all get screened on this exact grouped-guard pattern.",
    },
    breakdown: [
      "The ask is a compound guard on a grouped scan, and the three guards exist because each one alone is blind. COUNT(*) >= 3 catches the burst shape, SUM(amount_cents) >= the wall catches the money, and MAX(amount_cents) < the wall is the all-under guard that makes it structuring: without it, customer 4's single 1200000-cent deposit (plus two 100000-cent fillers) sails through count and total and lands in the report, even though that deposit generated its own CTR the moment it was made. The wall itself is pinned once as a named constant — a wall(threshold_cents) CTE holding 1000000 — so the threshold reads as one fact in the query instead of three literals that can drift apart.",
      "The boundaries are graded by the seed. Customer 3 deposits exactly three times (340000 cents each) — a strict > 3 on the count erases a row the contract wants. Customer 2's day lands on exactly 1000000 cents (500000 + 300000 + 200000) — a strict > on the total erases it too, because the wall is at-or-above, inclusive. Customer 9 is the near miss: five deposits of 199000 cents reach only 995000, five thousand cents short, and no number of sub-wall deposits flags until the sum crosses.",
      "Grain is the other classic misstep. Group by customer_id alone and the day dimension dissolves: customer 8's three 350000-cent deposits on three consecutive days total 1050000 cents and false-flag, and customer 7's whole week (1040000 + 600000 + 999000 = 2639000 cents across 7 deposits) looks far worse than any single day. The red flag is a customer-DAY pattern — the burst lives inside one calendar day, so both grouping keys belong in the GROUP BY and the HAVING judges each day on its own.",
    ],
    edges: [
      "Customer 9's five 199000-cent deposits stop at 995000 cents — 5000 under the wall. The total is judged with >= (inclusive): customer 2's exactly-1000000 day flags, and writing > instead silently deletes it (probed).",
      "Customer 4 is the CTR-not-structuring case: 1200000 once plus two 100000 fillers passes count and total, and only MAX(amount_cents) < 1000000 keeps it out — drop that guard and the probe query emits (4, '2026-09-15', 3, 1400000).",
      "Customer 8 spreads three 350000-cent deposits over three days: every single day has count 1, but a per-customer GROUP BY totals 1050000 cents and false-flags — the burst must be judged per calendar day.",
      "Customer 7 flags only on 2026-09-14: the same customer's other days (two 300000 deposits, then a lone 999000) stay quiet, and customer 5's two 450000 deposits (900000 total) lack the third deposit the heuristic demands.",
    ],
    ladder: [
      { title: "Brute force — read every customer's calendar", body: "Print each customer's deposits sorted by date, eyeball the days with several deposits, add them up, and check the largest. Twenty-eight rows are traceable by hand; a bank's nightly million deposits are not, and the hand method misses the all-under guard exactly when the biggest deposit is the interesting one." },
      { title: "The pattern — group, then guard", body: "GROUP BY customer_id, deposit_date turns the calendar into one row per customer-day with COUNT, SUM and MAX computed together, and the HAVING applies the three guards to those aggregates. One scan, no self-joins, no window functions." },
      { title: "The optimal idea — one named wall, three cheap aggregates", body: "O(n log n) over the n deposits, dominated by the GROUP BY sort. The durable habits: pin the threshold once as a named constant, keep the inclusive and strict comparisons straight (>= on count and total, < on the max), and let the composite guard — not a follow-up filter — define the flag." },
    ],
    approach: "GROUP BY customer_id, deposit_date and keep groups passing COUNT >= 3, SUM >= wall and MAX < wall, with the wall pinned once in a named CTE",
    schema: {
      ddl: `CREATE TABLE deposits (
  deposit_id   INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  deposit_date TEXT NOT NULL,    -- 'YYYY-MM-DD'
  amount_cents INTEGER NOT NULL
);`,
      seed: `-- 2026-09-14 through 2026-09-21 · customer 7 bursts on 09-14 (4 x 260000 =
-- 1040000) and stays quiet on its other days · customer 3 bursts once
-- (3 x 340000 = 1020000) · customer 2 lands the day EXACTLY on the wall
-- (500000 + 300000 + 200000) · customer 9 stops 5000 cents short (5 x 199000
-- = 995000) · customer 4 is the reported-CTR contrast (1200000 once) ·
-- customer 5 lacks the third deposit · customer 8 spreads over three days ·
-- customer 1 is ordinary small traffic
INSERT INTO deposits (deposit_id, customer_id, deposit_date, amount_cents) VALUES
  (1,  1, '2026-09-14',  50000),
  (2,  1, '2026-09-16',  75000),
  (3,  2, '2026-09-18', 500000),
  (4,  2, '2026-09-18', 300000),
  (5,  2, '2026-09-18', 200000),   -- customer 2: exactly 1000000 on the day
  (6,  3, '2026-09-16', 340000),
  (7,  3, '2026-09-16', 340000),
  (8,  3, '2026-09-16', 340000),   -- customer 3: 3 x 340000 = 1020000
  (9,  4, '2026-09-15', 1200000),
  (10, 4, '2026-09-15', 100000),
  (11, 4, '2026-09-15', 100000),   -- customer 4: one CTR-sized deposit + fillers
  (12, 5, '2026-09-14', 450000),
  (13, 5, '2026-09-14', 450000),   -- customer 5: 2 deposits, 900000 — no third
  (14, 7, '2026-09-14', 260000),
  (15, 7, '2026-09-14', 260000),
  (16, 7, '2026-09-14', 260000),
  (17, 7, '2026-09-14', 260000),   -- customer 7: 4 x 260000 = 1040000 on 09-14
  (18, 7, '2026-09-20', 300000),
  (19, 7, '2026-09-20', 300000),   -- the same customer's other days stay quiet
  (20, 7, '2026-09-21', 999000),   -- a lone just-under-wall deposit
  (21, 8, '2026-09-14', 350000),
  (22, 8, '2026-09-15', 350000),
  (23, 8, '2026-09-16', 350000),   -- customer 8: spread over three days
  (24, 9, '2026-09-17', 199000),
  (25, 9, '2026-09-17', 199000),
  (26, 9, '2026-09-17', 199000),
  (27, 9, '2026-09-17', 199000),
  -- customer 9: 5 x 199000 = 995000 — 5000 cents short of the wall
  (28, 9, '2026-09-17', 199000);`,
      tables: [
        { name: "deposits", note: "28 cash deposits over 8 days — two clean bursts (7 and 3), an exactly-at-wall day (2), a 5000-cent miss (9), a reported single 1200000 (4), a two-deposit day (5), a three-day spread (8) and small traffic (1)" },
      ],
    },
    code: `WITH wall(threshold_cents) AS (
    VALUES (1000000)                                  -- the CTR wall, pinned once: 10000 dollars in cents
)
SELECT
    d.customer_id,
    d.deposit_date,
    COUNT(*) AS deposit_count,
    SUM(d.amount_cents) AS day_total_cents
FROM deposits d CROSS JOIN wall
GROUP BY d.customer_id, d.deposit_date
HAVING COUNT(*) >= 3                                  -- a burst, not a stray second deposit
   AND SUM(d.amount_cents) >= wall.threshold_cents    -- the day reaches the wall (inclusive)
   AND MAX(d.amount_cents) < wall.threshold_cents     -- yet every single deposit stays under it
ORDER BY day_total_cents DESC, d.customer_id ASC, d.deposit_date ASC;`,
    walkthrough: [
      "The wall CTE pins the threshold once — wall(threshold_cents) holding 1000000 — and the CROSS JOIN carries that one-row constant alongside every deposit without changing the row count. GROUP BY customer_id, deposit_date folds the 28 deposits into 13 customer-day groups: customer 7's 2026-09-14 group holds four rows, customer 3's 2026-09-16 group holds three, customer 9's 2026-09-17 group holds five, and customer 8's three deposits land in three separate one-row groups. The constant rides inside every one of those 13 groups, so the HAVING can compare all three aggregates against the same named wall.",
      "The HAVING then judges each group on its three aggregates. Customer 7's 09-14 group reads COUNT 4, SUM 1040000, MAX 260000 — all three guards pass, so it prints (7, '2026-09-14', 4, 1040000). Customer 3 passes at (3, '2026-09-16', 3, 1020000) and customer 2's boundary day passes at (2, '2026-09-18', 3, 1000000) because the total comparison is >=. The rejects are instructive: customer 9's SUM reads 995000 (fails the total), customer 4's MAX reads 1200000 (fails the all-under guard), customer 5's COUNT reads 2 (fails the burst bar), and each of customer 8's days fails on COUNT 1.",
      "ORDER BY day_total_cents DESC, customer_id ASC, deposit_date ASC ships the worst day first: 1040000, then 1020000, then 1000000. No two flagged days tie on the total here, so the customer_id and deposit_date keys stand guard for future data rather than for this seed. Three rows out of 28 deposits is the intended shape of an alert queue — a short, human-reviewable list — and every cell is an INTEGER or a date string, because COUNT and SUM over INTEGER cents never leave the integers.",
    ],
    time: "O(n log n) over the n deposits — the GROUP BY sort dominates, and the three aggregates are one pass per group",
    space: "O(d) for the d distinct customer-day groups (13 here) before the HAVING prunes to three rows",
    followUps: [
      "Widen the lens to a rolling 7-day window instead of one calendar day — which customers survive the daily read but flag on a week, and what does that change about customer 8?",
      "Add branch_id to the schema and require the burst to span at least two branches — which extra guard catches a runner depositing at different tellers, and does customer 7 still flag?",
      "Emit the deposit list beside each flagged day (deposit_id and amount_cents in deposit order) so the analyst sees the slicing pattern — which correlated subquery builds it without breaking the one-row-per-day contract?",
    ],
    related: ["duplicate-charge-pairs", "delinquency-buckets", "gl-reconciliation"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "transaction-velocity",
    statement:
      "The txns table logs card activity one row per event: (txn_id, card_id, txn_ts, amount_cents, direction), with txn_ts as INTEGER epoch seconds and direction 'purchase' or 'refund'. Velocity checks slice the day into fixed 5-minute buckets — window_start = (txn_ts / 300) * 300 with INTEGER division, so second 1758067799 belongs to the bucket starting 1758067500 while second 1758067800 opens the next one. Stolen cards burst: a thief fires a flurry of authorizations before the fraud engine reacts, so flag every (card_id, window_start) bucket over PURCHASES ONLY that reaches txn_count >= 4 OR window_total_cents >= 500000 — refunds count toward neither side. Output card_id, window_start, txn_count and window_total_cents for the flagged buckets, ordered by card_id ascending, then window_start ascending.",
    examples: [
      {
        input: "card 12 makes three purchases in one 5-minute bucket — 150000, 150000 and 210000 cents, all landing on window_start 1758067800",
        output: "12 · 1758067800 · 3 · 510000",
        explanation:
          "Three purchases miss the 4-transaction count bar, but the bucket's 510000-cent total crosses 500000 — the total flag catches the burst the count cannot see.",
      },
      {
        input: "card 13 taps twice at 1758067799 (the last second of bucket 1758067500) and twice more at 1758067800 (the first second of the next bucket)",
        output: "no row",
        explanation:
          "The straddle splits 2-and-2 across the bucket wall, so each side reads count 2 and total 255000 — neither reaches 4 purchases or 500000 cents, and the engine prints nothing for card 13.",
      },
    ],
    constraints: [
      "window_start = (txn_ts / 300) * 300 with INTEGER division — epoch seconds stay INTEGER end to end, never julianday or float math; the 300-second buckets tile the timeline edge to edge",
      "purchases only: direction = 'purchase' filters BEFORE grouping — refunds belong to neither txn_count nor window_total_cents",
      "the pinned flags: txn_count >= 4 OR window_total_cents >= 500000, inclusive on both sides — a bucket at exactly 4 transactions or exactly 500000 cents flags",
      "one row per flagged (card_id, window_start) bucket; ORDER BY card_id ASC, window_start ASC",
    ],
    primer: {
      hook: "A payment card in a thief's hands does not shop like a person — it tries many purchases in minutes, so fraud engines slice time into short buckets and flag any card moving too fast.",
      concept: [
        "A velocity rule is a rate limit on account activity: too many transactions, or too much money, inside a short time window. Legitimate spending has rhythm — a coffee, a lunch, a grocery run spread across hours — while automated abuse is impatient and lands in flurries. So the engine cuts the timeline into fixed slices (here 5 minutes, or 300 seconds), pours each transaction into the slice it belongs to, and then simply counts and sums per slice. The slicing is the whole trick: two transactions 299 seconds apart may share a bucket, while two 1 second apart on opposite sides of a boundary never do.",
        "Why stolen cards burst: a criminal with a cloned card is racing a deadline, because the real cardholder checks statements, the issuer spots oddities and the card dies once reported. The profitable play is to test the card with small purchases and then drain it — many authorizations in a few minutes, often spread across merchants so the amounts look random. Cardholders almost never produce four purchases in five minutes by accident, which is what makes a count bar of 4 both cheap and effective. The bucket arithmetic is deliberately integer math: an epoch second divided by the bucket length with integer division lands every transaction on its slice's starting second, with no rounding arguments.",
        "One refinement matters more than it looks: velocity counts PURCHASES, not refunds. A refund is money going back to the card — a legitimate return, or a thief's trick to reset naive counters. If refunds diluted the count, an attacker could bury a burst of purchases under a pile of refunds and stay under every bar; counting purchases only keeps the measure of outward pressure clean. The two flags also run as an OR: a count burst with small amounts should flag (card 11 style), and so should a few huge purchases (card 12 style).",
        "Rules like this are the transparent half of fraud stacks; the other half is machine-learned models that score each authorization on hundreds of signals. Rules run first because they are fast, explainable and instantly editable at 3 am — when a scam pattern goes viral, an analyst ships a new bucket rule in minutes, not a retrained model. Production systems combine both: a rule flags the burst, the model scores it, and the decision (decline, step-up verification, or allow-and-watch) comes from the blend.",
      ],
      worked: [
        "Take the 5-minute bucket that starts at second 1758067200. A purchase at second 1758067200 gives 1758067200 / 300 = 5860224 with integer division, and 5860224 * 300 lands the bucket start back on 1758067200.",
        "A purchase 299 seconds later, at 1758067499, still divides to 5860224 — same bucket. One second later, 1758067500 / 300 = 5860225 — a new bucket. The wall between them is exact because the division never leaves the integers.",
        "Now count: a card with purchases at 1758067200, then +30, +60, +90 and +120 seconds makes five rows in one bucket. Five is at least 4, so the bucket flags on count even though the amounts (120000 + 99000 + 45000 + 80000 + 60000 = 404000 cents) stay under the 500000-cent total bar.",
        "Slide two of those purchases just past the wall and the picture splits 3-and-2: the first bucket holds 120000 + 99000 + 45000 = 264000 cents and the second holds 80000 + 60000 = 140000 — neither bucket reaches the count bar or the total bar, so the same card, one second of timing apart, goes invisible. That is the straddle a thief exploits and this fixed-bucket rule accepts.",
      ],
      glossary: [
        { term: "velocity rule", def: "a rate limit that flags too many transactions or too much value in a short window" },
        { term: "authorization", def: "the issuer's yes-or-no decision and hold at checkout, before any money moves" },
        { term: "capture", def: "the later step that turns an approved authorization into actually charged money" },
        { term: "time bucket", def: "a fixed slice of time, here 300 seconds, that groups events for counting" },
        { term: "refund", def: "a transaction returning money to the card — excluded from purchase velocity" },
        { term: "rules engine", def: "the transparent threshold logic that runs beside machine-learned fraud models" },
      ],
      reallife: [
        "At a card issuer or payment processor, velocity rules run inside the authorization path itself — the 100-millisecond window while the checkout terminal waits. The engine groups the card's recent history into buckets exactly like this query, evaluates dozens of rules, and returns approve, decline or step-up (an extra one-time code) before the purchase completes. Analysts own the rule set in a dashboard: thresholds, bucket lengths and the OR-combinations are all editable without a deploy.",
        "What breaks: bursty-but-legitimate days. Ticket on-sales, Black Friday, a traveler tapping in a new city, or a customer buying gifts from five sites in ten minutes all look like card 11. Too aggressive a rule and the fraud tooling declines real revenue and drowns in review queues; too loose and the drain completes before any human looks. Teams replay new thresholds against historical attack days and measure the false-positive rate per legitimate transaction.",
        "The numbers drive decisions up and down the stack. A flagged bucket can decline the next authorization instantly, freeze the card pending a phone verification, or just raise the score the model sees. After an incident, the same bucket query is the forensic tool: replay a stolen card's afternoon in 5-minute slices and the drain appears as a wall of flagged buckets.",
      ],
      where: "Fraud analysts, risk engineers and decision scientists at card issuers, payment processors and BNPL lenders all live in this bucket-and-flag pattern at authorization time.",
    },
    breakdown: [
      "The bucket key is the whole problem. (txn_ts / 300) * 300 with INTEGER division maps every epoch second onto the second its slice opened: 1758067799 divides to 5860225 and multiplies back to 1758067500, while 1758067800 divides to 5860226 and opens the next slice. The seed grades the wall: card 13 taps twice at 1758067799 and twice at 1758067800 — one second apart, opposite sides of the boundary — and the honest read splits them 2-and-2 so neither bucket flags. Group the seconds as floats and the wall dissolves; the integer division is not an optimization, it is the rule.",
      "Purchases only, before grouping. Card 14's flagged bucket holds four purchases (110000 + 100000 + 95000 + 90000 = 395000 cents) plus a 60000-cent refund; the correct count is 4 and the correct total is 395000, and a direction-blind read prints 5 and 455000 — and worse, it flags card 14's refund-only bucket (two 250000-cent refunds, total exactly 500000) that the contract keeps silent. The flags combine as OR: card 11 bursts on count alone (5 purchases, 404000 cents), card 12 on total alone (3 purchases, 510000 cents), card 16 on exactly 500000 cents, and card 14 on count with a refund sitting in the bucket.",
      "GROUP BY needs both keys. Group by window_start alone and card 12's three purchases merge with card 13's two same-bucket taps into one (1758067800, 5, 765000) phantom burst — different cards share bucket starts all day long, and only card_id keeps their velocity separate. The HAVING carries the OR because the two failure modes (too many transactions, too much money) are independent; the ORDER BY card_id, window_start then reads the report like a card-by-card timeline.",
    ],
    edges: [
      "Card 13's straddle: two taps at 1758067799 (last second of bucket 1758067500) and two at 1758067800 (first second of the next) — one second of wall splits a 4-purchase burst into two quiet buckets of 2, so the correct output has no card 13 row.",
      "Card 14's refund must not dilute: the bucket reads (14, 1758068400, 4, 395000) with the 60000-cent refund excluded, and the refunds-only bucket (14, 1758068700) stays unflagged — counting refunds instead prints (14, 1758068400, 5, 455000) AND a bogus (14, 1758068700, 2, 500000) row (probed).",
      "Both boundaries are inclusive: card 14 flags at exactly txn_count 4 (a strict > 4 erases it) and card 16 flags at exactly window_total_cents 500000 (a strict > 500000 erases it) — both probed.",
      "Float bucket math: CAST(txn_ts / 300.0 AS INTEGER) * 300 happens to reproduce every window_start here (HAPPENS TO AGREE — the quotients sit far from integer edges), but the bare float (txn_ts / 300.0) * 300 turns every non-aligned second into its own bucket and flags nothing (probed), and round-nearest loses card 12's 510000 total while falsely flagging card 13's collapsed straddle (probed).",
    ],
    ladder: [
      { title: "Brute force — a sliding ruler per card", body: "Sort each card's purchases by time and slide a 5-minute ruler across them, counting and summing inside the ruler. Correct but quadratic, and it answers a subtly different question — overlapping windows, not fixed buckets — so its flags drift from the contract's." },
      { title: "The pattern — fixed buckets by integer division", body: "Compute (txn_ts / 300) * 300 per row, GROUP BY card_id and that expression, filter purchases first, and let HAVING carry the two flags as an OR. The arithmetic collapses the sliding ruler into one grouped scan." },
      { title: "The optimal idea — integer keys, OR-shaped flags", body: "O(n log n) over the n transactions, dominated by the GROUP BY sort. The durable rules: epoch seconds plus integer division for bucket keys, filter the direction before grouping, and never let a shared bucket start merge two cards." },
    ],
    approach: "purchases filtered first, (txn_ts / 300) * 300 integer bucket key, GROUP BY card_id and bucket, HAVING count >= 4 OR total >= 500000",
    schema: {
      ddl: `CREATE TABLE txns (
  txn_id       INTEGER PRIMARY KEY,
  card_id      INTEGER NOT NULL,
  txn_ts       INTEGER NOT NULL,  -- epoch seconds
  amount_cents INTEGER NOT NULL,
  direction    TEXT NOT NULL      -- 'purchase' | 'refund'
);`,
      seed: `-- 2025-09-17, base second 1758067200 = 00:00:00 UTC · card 11: 5 purchases
-- in one bucket (count flag, 404000 total) · card 12: 3 purchases totalling
-- 510000 (total flag, count 3) · card 13: 2 taps at 1758067799 and 2 at
-- 1758067800 (straddle — neither bucket flags) · card 14: 4 purchases + 1
-- refund in a bucket (refund excluded, count flag) plus a refunds-only
-- bucket · card 15: 3 purchases, 480000 (quiet) · card 16: 2 purchases
-- totalling exactly 500000 (inclusive total flag) · card 18: ordinary traffic
INSERT INTO txns (txn_id, card_id, txn_ts, amount_cents, direction) VALUES
  (101, 11, 1758067200, 120000, 'purchase'),
  (102, 11, 1758067230,  99000, 'purchase'),
  (103, 11, 1758067260,  45000, 'purchase'),
  (104, 11, 1758067290,  80000, 'purchase'),
  (105, 11, 1758067320,  60000, 'purchase'),   -- card 11 burst: 5 in one bucket, 404000
  (106, 12, 1758067800, 150000, 'purchase'),
  (107, 12, 1758067860, 150000, 'purchase'),
  (108, 12, 1758067950, 210000, 'purchase'),   -- card 12: 3 purchases, 510000 total
  (109, 13, 1758067799, 130000, 'purchase'),
  (110, 13, 1758067799, 125000, 'purchase'),   -- last second of bucket 1758067500
  (111, 13, 1758067800, 130000, 'purchase'),
  (112, 13, 1758067800, 125000, 'purchase'),   -- first second of the next bucket
  (113, 14, 1758068400, 110000, 'purchase'),
  (114, 14, 1758068440, 100000, 'purchase'),
  (115, 14, 1758068480,  95000, 'purchase'),
  (116, 14, 1758068520,  90000, 'purchase'),   -- card 14: 4 purchases = 395000
  (117, 14, 1758068550,  60000, 'refund'),     -- the refund that must not count
  (118, 14, 1758068710, 250000, 'refund'),
  (119, 14, 1758068740, 250000, 'refund'),     -- refunds-only bucket 1758068700
  (120, 15, 1758069000, 160000, 'purchase'),
  (121, 15, 1758069060, 160000, 'purchase'),
  (122, 15, 1758069120, 160000, 'purchase'),   -- card 15: 480000, quiet
  (123, 16, 1758069300, 250000, 'purchase'),
  (124, 16, 1758069330, 250000, 'purchase'),   -- card 16: exactly 500000
  (125, 18, 1758067200,  5000, 'purchase'),
  (126, 18, 1758067500,  4200, 'purchase');`,
      tables: [
        { name: "txns", note: "26 events for 7 cards on 2025-09-17 — a count burst (11), a total burst (12), a straddle (13), a burst with a refund plus a refunds-only bucket (14), a quiet 480000 (15), an exactly-500000 pair (16) and ordinary traffic (18)" },
      ],
    },
    code: `SELECT
    card_id,
    (txn_ts / 300) * 300 AS window_start,   -- INTEGER division pins the 5-minute wall
    COUNT(*) AS txn_count,
    SUM(amount_cents) AS window_total_cents
FROM txns
WHERE direction = 'purchase'                 -- refunds never feed velocity
GROUP BY card_id, (txn_ts / 300) * 300
HAVING COUNT(*) >= 4                         -- burst of activity...
   OR SUM(amount_cents) >= 500000            -- ...or burst of money (inclusive on both)
ORDER BY card_id ASC, window_start ASC;`,
    walkthrough: [
      "WHERE direction = 'purchase' drops card 14's three refunds before any grouping, leaving 23 purchase rows to bucket. The key (txn_ts / 300) * 300 maps card 11's five purchases — 1758067200 through 1758067320 — all onto window_start 1758067200, while card 13's taps split: 1758067799 divides to 5860225 (bucket 1758067500) and 1758067800 divides to 5860226 (bucket 1758067800). GROUP BY card_id and the key expression forms one group per card per slice — card 12 and card 13 both own rows in slice 1758067800, but their groups never touch.",
      "The HAVING applies the two flags as an OR. Card 11's group reads count 5, total 404000 — flagged on count; card 12's reads 3 and 510000 — flagged on total; card 14's reads 4 and 395000 — flagged on count with the refund already gone; card 16's reads 2 and exactly 500000 — flagged by the inclusive total. Card 13's two groups read 2 and 255000 each, card 15's reads 3 and 480000, and card 18's two single-purchase buckets fail everything — five quiet groups among nine, four flagged.",
      "ORDER BY card_id ASC, window_start ASC prints the report as a timeline per card: (11, 1758067200, 5, 404000), then (12, 1758067800, 3, 510000), then (14, 1758068400, 4, 395000), then (16, 1758069300, 2, 500000). No card flags twice on this seed, so the window_start tiebreak stays idle — but the two-key sort remains total for any future day where one card bursts in several buckets. Every cell is an INTEGER — epoch seconds divided, multiplied, counted and summed without ever leaving the integers — so the snapshot compares exactly, run after run.",
    ],
    time: "O(n log n) over the n purchase rows — one sort to form the (card_id, window_start) groups, one pass of aggregates",
    space: "O(b) for the b distinct card-bucket groups (9 here) before the HAVING keeps 4",
    followUps: [
      "Replace fixed buckets with a true sliding 5-minute window per card — which self-join or window frame does it, and which straddling burst does the sliding read catch that the fixed buckets miss?",
      "Add a severity tier: buckets at count >= 6 or total >= 1000000 are 'critical', the rest 'watch' — what does card 11's bucket become, and which CASE keeps the OR flags intact?",
      "Bring refunds back as their own signal — a refund_count per bucket — and find buckets where refunds outnumber purchases: what does card 14's afternoon read then?",
    ],
    related: ["sessionize-events", "rolling-7d-actives", "duplicate-charge-pairs"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "circular-transfers",
    statement:
      "The transfers table logs one row per account-to-account transfer: (transfer_id, from_account, to_account, amount_cents, transfer_ts), with transfer_ts as INTEGER epoch seconds and a CHECK constraint keeping from_account and to_account distinct on every row. Round-tripping pushes money out and pulls it back through the same two accounts to fake volume, so surveillance hunts the boomerang: an outbound leg t1 and a return leg t2 where t2 leaves from t1's destination, lands back on t1's origin, and fires 604800 seconds (7 days) or less AFTER the outbound — the window is inclusive. Report each pair as a_account (the outbound sender), b_account (the outbound receiver), out_cents, back_cents and days_apart = CAST((t2.transfer_ts - t1.transfer_ts) / 86400 AS INTEGER), with t1.transfer_id < t2.transfer_id keeping every pair printed once in outbound-first orientation. Order by days_apart ascending, then a_account ascending, then b_account ascending; amounts need not match, because out_cents and back_cents sit side by side precisely so partial boomerangs stay visible.",
    examples: [
      {
        input: "account 501 sends 700000 cents to account 502 and the money comes back 5400 seconds later the same day",
        output: "501 · 502 · 700000 · 700000 · 0",
        explanation:
          "The return leg swaps both endpoints, fires after the outbound, and sits 5400 seconds inside the 604800-second window — the same-day gap divides to 0 days.",
      },
      {
        input: "account 520 sends 250000 cents to account 521 and the return leg lands exactly 604800 seconds later",
        output: "520 · 521 · 250000 · 250000 · 7",
        explanation:
          "604800 seconds is exactly 7 days, and the window is <= — inclusive at the wall — so the pair prints at days_apart 7; a strict < would erase it.",
      },
    ],
    constraints: [
      "the window is pinned at 604800 seconds (7 days), inclusive: t2.transfer_ts >= t1.transfer_ts AND t2.transfer_ts - t1.transfer_ts <= 604800 — the return follows or shares the second, never precedes",
      "pair identity: t1.transfer_id < t2.transfer_id orders the legs (outbound first), so each boomerang prints exactly once — the a_account/b_account orientation comes from the lower-id leg",
      "days_apart = CAST((t2.transfer_ts - t1.transfer_ts) / 86400 AS INTEGER) — INTEGER seconds divided by 86400, never julianday; the seed uses whole-day gaps so the value is exact",
      "from_account <> to_account holds on every row (the DDL CHECK enforces it), so a pair always names two distinct accounts; amounts are NOT required to match",
    ],
    primer: {
      hook: "Money that leaves an account and quietly comes back a few days later was never really spent — it was theatre, and this query is how surveillance catches the boomerang.",
      concept: [
        "Money-laundering textbooks split the job into three stages: placement (dirty cash first enters a bank), layering (the money hops between accounts to blur where it came from) and integration (it comes out looking earned). Round-tripping is the simplest layering move: send 100000 out, wait a couple of days, pull it back, and repeat — every hop writes a transaction into the ledger, and activity starts to look like a business. The same trick shows up far from crime: brokerage customers trade in circles to farm volume rebates, and marketplace sellers move money to themselves to inflate sales history. The pattern's signature is not any single transfer — it is a transfer and its mirror.",
        "So the surveillance question is pairwise: did account A send money to account B, and did B send money back to A within a lookback window? A window of 7 days (604800 seconds) is a common screen — long enough for real settlement rhythms, short enough that the mirror still reads as connected. Amount equality is deliberately NOT required: a partial boomerang (send 100000, get 80000 back) is still worth an analyst's eyes, which is why the query reports both amounts side by side instead of filtering on them.",
        "The mechanics are a self-join with swapped endpoints and a clock: the return must leave from where the outbound landed, land where the outbound left, and occur after it but within the window. Reporting each pair once needs a direction rule, and the ledger's own transfer_id (monotonic in production) is the natural one: the lower-id leg is the outbound, the higher-id leg is the return. That rule quietly assumes ids track time — when a dataset breaks that assumption, the pair is dropped rather than double-reported, which is the deterministic choice a monitoring system prefers.",
        "When the pattern is confirmed, the institution files a SAR — a Suspicious Activity Report — with FinCEN, the US Treasury bureau that collects them; the filing is confidential, and tipping off the customer is itself illegal. The columns this query produces are literally the evidence lines: who sent what, who sent it back, and how many days apart. Chains that never close (A to B to C to A) are the next ring of the graph, and they need multi-hop analysis — a different query for a different day.",
      ],
      worked: [
        "Watch two accounts, A and B, for one week. On Monday, A sends 100000 cents to B; on Wednesday, B sends 100000 cents back to A. Two transfers, four endpoint facts: out of A into B, then out of B into A.",
        "Check the shape: the return leg swaps both endpoints (B to A against A to B), and the gap is 2 days = 172800 seconds, inside the 604800-second window. Report the pair as (A, B, 100000, 100000, 2).",
        "Now break it on purpose: keep the Monday outbound but have B return the money 8 days later — 691200 seconds. The gap misses the <= 604800 window, so nothing prints; two transfers a week apart read as unrelated business.",
        "Finally make it a chain: A sends to B on Monday, B sends to C on Tuesday, C sends to A on Wednesday. No single transfer is the mirror of another — B's incoming comes from A but B's outgoing goes to C — so the pairwise query finds zero pairs; the circle needs three legs, and a graph walk, to see.",
      ],
      glossary: [
        { term: "layering", def: "the laundering stage that shuffles money between accounts to hide its source" },
        { term: "round-tripping", def: "sending money out and pulling it back through the same accounts to fake activity" },
        { term: "wash trading", def: "circular trading that fakes volume — the brokerage flavor of round-tripping" },
        { term: "SAR", def: "Suspicious Activity Report — the confidential filing an institution sends FinCEN when activity smells wrong" },
        { term: "lookback window", def: "the fixed time span, here 604800 seconds, inside which a mirror transfer counts" },
        { term: "counterparty", def: "the account on the other side of a transfer — the endpoint the join swaps" },
      ],
      reallife: [
        "At a bank, this screen runs in the financial-crime team's nightly batch: every account pair that boomeranged inside the week lands on a case queue with both legs attached. Correspondent-banking desks watch for it between institutions, and broker-dealers run cousin queries for wash trades because FINRA — the US broker regulator — requires them to detect circular trading that inflates volume. The analysts triaging the queue are reading exactly the five columns this query outputs.",
        "What breaks: legitimate money really does come back. A loan disbursed and repaid, a settlement reversed for good reason, a vendor payment refunded for a cancelled order — all pass the pairwise test. That is why the report carries out_cents and back_cents separately (equal legs are more suspicious than partial ones) and why days_apart matters (a 7-day mirror reads differently from a 1-day mirror). The queue exists to combine those numbers with context no query has.",
        "The decisions: hold the outbound transfer, restrict the account, claw back volume rebates earned on circular trades, or file the SAR when the pattern holds. Miss the pattern and the costs are real — regulators have penalized banks whose controls let layering run for months, and exchanges have refunded customers whose traded volume turned out to be wash. The query is small; the filing trail it starts is not.",
      ],
      where: "Financial-crime analysts at banks and broker-dealers, treasury and settlement teams, and trust-and-safety data roles at marketplaces screening fake volume all get asked this pattern.",
    },
    breakdown: [
      "The join is the problem: transfers paired with transfers, endpoints swapped, clock checked. t2 must satisfy t2.from_account = t1.to_account AND t2.to_account = t1.from_account — the mirror — plus t2.transfer_ts >= t1.transfer_ts (the return comes after) and a difference of at most 604800 seconds. The seed grades the window edge with data: pair 3's return lands exactly 604800 seconds after its outbound, so the inclusive <= prints days_apart 7, while the planted 8-day pair (691200 seconds) misses and stays silent. Amounts never enter the join — out_cents and back_cents are reported side by side so a partial boomerang (700000 out, 380000 back on pair 2) stays visible to the analyst.",
      "Each pair must print once, in outbound-first orientation. t1.transfer_id < t2.transfer_id is the dedupe: drop it and the seed's reversed-precedes pair re-enters from the other side as (553, 552, 150000, 150000, 1) — a fourth row the contract does not want (probed). The rule assumes transfer ids track time; the seed plants a pair whose return leg carries the higher id but the earlier timestamp, and both orientations fail — the earlier-time leg cannot be the return (it precedes), and the id rule blocks flipping it. The two 560-to-561 transfers a day apart never pair at all, because the return must swap endpoints, not repeat them.",
      "days_apart = CAST((t2.transfer_ts - t1.transfer_ts) / 86400 AS INTEGER) is INTEGER seconds divided by INTEGER seconds — 5400 reads 0, 172800 reads 2, 604800 reads 7 — exact because the seed plants whole-day gaps. The julianday path is the honest wrong turn: julianday() of an epoch integer sits outside the Julian day range and returns NULL, so every days_apart cell collapses to NULL (probed). And the self-join's appetite for pairs is exactly why the CHECK (from_account <> to_account) matters: without it, two same-account self-loops a day apart satisfy the swapped-endpoint join and print a bogus (550, 550) pair (probed on a constraint-less copy of the table).",
    ],
    edges: [
      "The 7-day wall is inclusive: pair 3's return sits exactly 604800 seconds after its outbound and prints at days_apart 7 — writing < 604800 instead silently erases the pair (probed: 2 rows remain).",
      "A chain is not a pair: 530 to 531 to 532 back to 530 satisfies a three-leg cycle but no single transfer mirrors another, so the contract ships nothing for it — a naive three-leg cycle detector prints the chain as one row (probed).",
      "The return leg must both follow in time and carry the higher id: the planted pair whose return precedes its outbound is unreachable in either orientation, and dropping the id-order dedupe lets it back in as (553, 552, 150000, 150000, 1) (probed).",
      "from_account <> to_account is enforced by the DDL CHECK plus the data — a lone self-loop can never pair, and without the CHECK two same-account self-loops print the bogus (550, 550, 100000, 100000, 0) row (probed).",
    ],
    ladder: [
      { title: "Brute force — read the ledger like a story", body: "For each transfer, scan the whole table for one that goes back the other way soon after. Fifteen transfers are traceable; a real ledger's millions are not, and the hand scan forgets the id-order dedupe the moment two legs share a timestamp." },
      { title: "The pattern — swapped-endpoint self-join", body: "Join transfers to itself with t2.from = t1.to AND t2.to = t1.from, gate the clock (>= t1, difference <= 604800) and order the pair with t1.transfer_id < t2.transfer_id. The join carries the whole detection." },
      { title: "The optimal idea — let the join be the rule", body: "O(n log n) over the n transfers, dominated by the join's pairing sort, each candidate pair checked against the clock in constant time. The durable habits: mirror the endpoints exactly, keep the window inclusive at the wall, dedupe on the ledger's own id order, and report both amounts instead of demanding equality." },
    ],
    approach: "self-join transfers with swapped endpoints, an inclusive 604800-second window after the outbound, and transfer_id ordering to print each boomerang once",
    schema: {
      ddl: `CREATE TABLE transfers (
  transfer_id  INTEGER PRIMARY KEY,
  from_account INTEGER NOT NULL,
  to_account   INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  transfer_ts  INTEGER NOT NULL,      -- epoch seconds
  CHECK (from_account <> to_account)  -- money moves BETWEEN distinct accounts
);`,
      seed: `-- base second 1758067200 = 2025-09-17 00:00 UTC · three matched pairs —
-- 501/502 same day (5400 s gap) · 510/511 two days apart with DIFFERENT
-- amounts (400000 out, 380000 back) · 520/521 exactly at the 604800-second
-- wall · excluded on purpose: the 530-531-532 chain, an 8-day pair
-- (691200 s), a same-direction repeat (560 to 561 twice) and a pair whose
-- return leg PRECEDES its outbound (26 before 25 in time, after in id)
INSERT INTO transfers (transfer_id, from_account, to_account, amount_cents, transfer_ts) VALUES
  (10, 501, 502, 700000, 1758070800),  -- pair 1 outbound
  (11, 502, 501, 700000, 1758076200),  -- pair 1 return · 5400 s later, same day
  (12, 510, 511, 400000, 1758153600),  -- pair 2 outbound
  (13, 511, 510, 380000, 1758326400),  -- pair 2 return · 172800 s (2 days), partial amount
  (14, 520, 521, 250000, 1758074400),  -- pair 3 outbound
  (15, 521, 520, 250000, 1758679200),  -- pair 3 return · exactly 604800 s (the wall)
  (20, 530, 531, 500000, 1758078000),  -- chain leg A->B
  (21, 531, 532, 500000, 1758081600),  -- chain leg B->C
  (22, 532, 530, 500000, 1758085200),  -- chain leg C->A · no pair mirrors another
  (23, 540, 541, 300000, 1758088800),  -- 8-day outbound
  (24, 541, 540, 300000, 1758780000),  -- return 691200 s later · outside the window
  (25, 552, 553, 150000, 1758092400),  -- outbound (lower id, LATER time)
  (26, 553, 552, 150000, 1758006000),  -- return precedes by a day · deduped by id order
  (27, 560, 561,  90000, 1758097200),  -- same-direction repeat 1
  -- repeat 2 ends the seed · same direction again, so no endpoint swap
  (28, 560, 561,  95000, 1758107200);`,
      tables: [
        { name: "transfers", note: "15 transfers around 2025-09-17 — three boomerang pairs (same-day, 2-day partial, exactly-7-day), plus a planted chain, an 8-day miss, a same-direction repeat and a return-precedes pair that must all stay silent" },
      ],
    },
    code: `SELECT
    t1.from_account AS a_account,
    t1.to_account AS b_account,
    t1.amount_cents AS out_cents,
    t2.amount_cents AS back_cents,
    CAST((t2.transfer_ts - t1.transfer_ts) / 86400 AS INTEGER) AS days_apart
FROM transfers t1
JOIN transfers t2
  ON t2.from_account = t1.to_account               -- the return leaves where t1 landed
 AND t2.to_account = t1.from_account               -- and lands where t1 left: the mirror
 AND t2.transfer_ts >= t1.transfer_ts              -- the return comes after the outbound
 AND t2.transfer_ts - t1.transfer_ts <= 604800     -- 7 days, inclusive at the wall
 AND t1.transfer_id < t2.transfer_id               -- outbound first: each pair prints once
ORDER BY days_apart ASC, a_account ASC, b_account ASC;`,
    walkthrough: [
      "The self-join starts from the swapped-endpoint equality: t1 = (501 to 502) finds its mirror in t2 = (502 to 501) — transfer 11 — and the clock checks pass (5400 seconds after, inside 604800), with 10 < 11 ordering the legs. The pair prints (501, 502, 700000, 700000, 0). Pair 2 (510/511) matches the same way across a 172800-second gap and prints (510, 511, 400000, 380000, 2) — different amounts, both columns visible; pair 3 (520/521) sits exactly at the 604800-second wall and the inclusive <= keeps it, printing (520, 521, 250000, 250000, 7).",
      "The exclusions are all join rejections. The chain legs (20, 21, 22) never mirror each other — 21 goes 531 to 532, not 531 to 530 — so no pair forms. The 8-day pair fails the <= 604800 gate (691200 seconds), the two 560-to-561 transfers fail the endpoint swap (same direction), and the reversed-precedes pair fails in both orientations: (25, 26) puts the return before the outbound, and (26, 25) breaks t1.transfer_id < t2.transfer_id.",
      "ORDER BY days_apart ASC, a_account ASC, b_account ASC stacks the boomerangs tightest-first: (501, 502, 700000, 700000, 0), then (510, 511, 400000, 380000, 2), then (520, 521, 250000, 250000, 7). The three gaps are distinct here, so the account tiebreakers carry no row on this seed — they exist to keep the report deterministic the day two mirrors land together. Every cell is an INTEGER — epoch differences and their 86400-second divisions never leave the integers — and three rows out of fifteen transfers is the quiet signature of round-tripping done deliberately.",
    ],
    time: "O(n log n) over the n transfers — the self-join's pairing sort dominates, each candidate pair checked against the clock in constant time",
    space: "O(p) for the p surviving pairs (3 here), ordered at the end",
    followUps: [
      "Catch the chain: walk A to B to C to A with a recursive CTE or a three-leg self-join — which cycle length starts to false-positive on legitimate settlement loops, and how would you bound the hops?",
      "Score the mirror: add mirror_ratio = back_cents * 1.0 / out_cents — which of the three pairs looks most deliberate at 1.0, and does pair 2's 0.95 deserve the queue?",
      "Extend the window to 30 days and count pairs per account pair — which two-column report ranks the busiest boomerang routes, and what new legitimate pattern does the longer window admit?",
    ],
    related: ["duplicate-charge-pairs", "settlement-fails-aging", "realized-pnl-average-cost"],
    order: "exact",
    xp: 20,
  },
];
