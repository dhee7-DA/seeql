// Deep-dives — Fraud & AML file B: amount-anomaly z-scores, chargeback rate
// ranking and dormant-account reactivation (3 problems: Hard, Easy, Medium,
// all order:"exact" reads). Every money column is INTEGER cents with the
// _cents suffix; sigma, z-scores and rates are the only REALs, each a ROUNDed
// statistic by contract. Every dive carries a domain primer (hook, concept,
// worked, glossary, reallife, where) for learners new to the domain.
// Registry wiring (lead): 8034 amount-anomaly-zscore ·
// 8035 chargeback-rate-ranking · 8036 dormant-reactivation.
import type { LcSqlDive } from "../types";

export const SQL_DF_FRAUD_B: LcSqlDive[] = [
  {
    slug: "amount-anomaly-zscore",
    statement:
      "The txns table logs card transactions as (txn_id, customer_id, txn_date, amount_cents), with txn_date in 'YYYY-MM-DD' form. An amount is suspicious only against the customer's OWN baseline: over the pinned window '2026-06-01' through '2026-08-31' each customer gets a mean and a population standard deviation sigma of amount_cents, and every September transaction ('2026-09-01' through '2026-09-30') is scored with the z-score (amount_cents - mean) / sigma — how many personal sigmas it sits above the norm. Flag a September transaction when sigma > 0 AND the raw z-score is strictly greater than 3.0 — upper tail only, compared before any rounding, so a zero-variance baseline flags nothing. Report txn_id, customer_id, amount_cents, baseline_mean_cents = ROUND(mean, 2), sigma_cents = ROUND(sigma, 2) and z_score = ROUND(z, 2), ordered by z_score descending, then txn_id ascending.",
    examples: [
      {
        input: "customer 21 — baseline 49000, 49500, 50000, 50500, 51000; September 2026-09-03 brings 89000",
        output: "6 · 21 · 89000 · 50000 · 707.11 · 55.15",
        explanation:
          "The baseline mean is exactly 50000 and sigma reads sqrt(500000) ≈ 707.11, so 39000 cents above the personal norm is z = 39000 / 707.11 ≈ 55.15 — flagged and displayed to two decimals.",
      },
      {
        input: "customer 24 — baseline 38000 through 42000; September brings 44300, 44243 and 44200",
        output: "24 · 24 · 44300 · 40000 · 1414.21 · 3.04, then 25 · 24 · 44243 · 40000 · 1414.21 · 3.0",
        explanation:
          "Raw z reads 3.0406 and 3.00025 — both strictly past 3.0, so both flag — while 44200's 2.9698 stays out; the second row PRINTS as 3.0 because the rounding only dresses a decision already made on the raw z.",
      },
    ],
    constraints: [
      "both windows are pinned literals: the baseline is '2026-06-01' through '2026-08-31' and the scoring window is '2026-09-01' through '2026-09-30', both inclusive on the date strings",
      "sigma is the POPULATION standard deviation over the baseline — sqrt(AVG(1.0*x*x) - AVG(1.0*x)*AVG(1.0*x)) — with no n-minus-one correction; sqrt is available in this engine",
      "the flag rule is sigma > 0 AND (amount_cents - mean) / sigma > 3.0 — strict, upper tail only, evaluated on the RAW z before any rounding, so a zero-variance baseline (sigma = 0) flags nothing",
      "output columns in order: txn_id, customer_id, amount_cents, ROUND(mean, 2), ROUND(sigma, 2), ROUND(z, 2), with ORDER BY z_score DESC, txn_id ASC",
    ],
    primer: {
      hook: "A z-score turns one question into a number: how unusual is this transaction for THIS customer?",
      concept: [
        "Every customer has a normal. Scan a customer's past transactions and two numbers fall out: the mean, which is the typical amount, and the standard deviation, which says how far amounts usually stray from that typical value. A customer who spends 50000, 51000, 49000, 50500 and 49500 cents has a mean of 50000 and a small spread, while a customer who spends 40000, 80000, 120000, 160000 and 200000 lives at the same average with a much wider spread. The same purchase can be ordinary for one and shocking for the other, which is exactly why fraud rules keyed to fixed amounts drown analysts in false alarms.",
        "The z-score measures a new transaction in units of that personal spread: subtract the mean and divide by the standard deviation. A z of 1.0 means one spread above the customer's normal, a z of 3.0 means three spreads above it, and a negative z simply means below normal. The population form of the spread divides the average squared gap by n itself rather than n minus one — the baseline history is treated as the whole reference population, not a sample of one, and on this report the choice is graded because it changes every number in the output.",
        "Why per-customer beats global rules: a 100000-cent charge is a Tuesday for the wide-spread customer and a five-sigma event for the tight one. Per-customer baselines catch the quiet account that suddenly moves money, and peer groups sharpen them further — comparing a customer not just to their own past but to similar customers in the same region or product, so a salary spike that is common among freelancers does not read as fraud. Anomaly detection against own history is the cheapest detector that respects this, and it is usually the first one a risk team ships.",
        "No detector is a verdict. A z above 3 is a queue ticket, not a conviction — under a bell-shaped spread, three sigmas happens to an honest customer about three times in a thousand by pure chance, so a bank watching a million customers expects a pile of innocent flags every day. That pile is the false-positive rate, and the queue is ranked so analysts spend their hours on the loudest rows first. The whole craft is choosing thresholds that keep the pile small without missing the real bursts.",
      ],
      worked: [
        "Baseline: five transactions of 100, 110, 90, 100 and 100 cents. The mean is 500 / 5 = 100.",
        "Squared gaps from the mean: 0, 100, 100, 0, 0. Their average is 40.",
        "The population sigma is sqrt(40) ≈ 6.32 cents — this customer's personal unit of surprise.",
        "A new 120-cent charge sits 20 above the mean: z = 20 / 6.32 ≈ 3.16.",
        "3.16 is past the 3.0 wall, so the charge queues; the 110-cent charge (z ≈ 1.58) sails through.",
      ],
      glossary: [
        { term: "mean", def: "the typical baseline amount — sum the history and divide by the transaction count" },
        { term: "standard deviation", def: "the average distance amounts stray from the mean, the customer's personal unit of surprise" },
        { term: "z-score", def: "how many standard deviations a value sits above or below its own baseline mean" },
        { term: "population sigma", def: "the spread computed by dividing squared gaps by n, treating the baseline as the whole population" },
        { term: "baseline window", def: "the pinned past period a customer is measured against before any new transaction is scored" },
        { term: "false positive", def: "an innocent transaction flagged by the rule — the tax paid for catching real ones" },
      ],
      reallife: [
        "At a card issuer or a wallet app this report is the daily anomaly queue. A risk analyst sorts it by z, works the top rows, and for each one checks the context the SQL cannot see — travel notices, salary dates, new devices. The numbers decide the morning: block, step-up authentication, or clear.",
        "What breaks: baselines go stale. A customer saving for a house, hiring employees or traveling for a month shifts their own normal, and last quarter's mean starts flagging honest spending — teams retrain windows on rolling periods and suppress flags during known events. The second break is silence: a detector tuned to z > 3 misses fraud that dribbles in under the wall, which is why thresholds get audited against outcomes and moved.",
      ],
      where: "Fraud analysts, risk data scientists and payments engineers at banks, card networks and fintechs get asked to build exactly this in interviews.",
    },
    breakdown: [
      "The report asks which September transactions are abnormal FOR THE CUSTOMER, and abnormal is a measured word: each customer's June-through-August history yields a mean amount_cents and a spread around it, and the z-score states how many spreads a September amount sits above that personal center. The spread is the population standard deviation — sqrt(AVG(1.0*x*x) - AVG(1.0*x)*AVG(1.0*x)) — with no Bessel correction, because the baseline IS the whole reference population, not a sample drawn from one. On this seed the distinction is not cosmetic: customer 24's population sigma reads 1414.21 while the sample version reads 1581.14, which drags the 44300 transaction's z from 3.04 down to 2.72 and out of the report.",
      "The classic missteps all live in the guards. Scoring against a baseline that silently includes September itself collapses every signal — customer 21's own 89000 inflates its mean to 56666.67 and its z falls to 2.33, so the loudest anomaly on the seed disappears. Two-sided |z| reads a different crime: customer 25's 30000 September spend sits 38.35 sigmas BELOW its 80000 norm, and the contract wants quiet accounts, not cheap ones — lower-tail surprises belong in a different report. And rounding before comparing corrupts the boundary: the raw z of 3.00025 clears 3.0 and stays, while its display value of 3.0 would not survive a rounded comparison.",
      "The SQL is two windows and a join. The base CTE aggregates the baseline window per customer into the mean and the mean of squares, the scored CTE attaches those two numbers to every September transaction, and the final WHERE applies both guards — sigma > 0 first, then the strict raw-z test — before any ROUND touches anything. Rounding is presentation, not logic: ROUND(mean_c, 2), ROUND(sigma_c, 2) and ROUND(z, 2) fire only in the projection, and ORDER BY z_score DESC, txn_id ASC sorts the finished report.",
    ],
    edges: [
      "Customer 23's five identical 60000-cent baseline rows make sigma exactly 0 — the sigma > 0 guard keeps its above-mean 75000 September row out, and on this engine the division itself would return NULL anyway (NULL > 3.0 is not true), so the guard states the rule the float path happens to enforce.",
      "The 3.0 boundary is compared on the RAW z: customer 24's 44243-cent transaction reads raw z 3.00025 — flagged — while its z_score cell prints 3.0; compare the rounded value instead and the row vanishes.",
      "Customer 22's wide 40000-to-200000 baseline makes 100000 an ordinary September amount (z about −0.35): a global threshold would flag it, which is the whole case for per-customer baselines.",
      "Sample sigma (the n-minus-one correction) multiplies every sigma by sqrt(1.25): customer 21 survives at z 49.33 but all three of customer 24's September rows fall below 3 — the population version is the contract.",
    ],
    ladder: [
      { title: "Brute force — a notebook per customer", body: "For every customer write the five baseline amounts, average them, average the squares, subtract, take the square root, then divide each September amount's excess by that sigma and compare to 3 by hand. Twenty-five customers is unrunnable, and the pencil version never explains how to express the walk in SQL." },
      { title: "The pattern — baseline CTE, join, guard", body: "One GROUP BY over the pinned baseline window yields the mean and the mean of squares per customer; joining September transactions to it makes every z a single expression. The WHERE applies sigma > 0 plus the strict raw test, in that order." },
      { title: "The optimal idea — aggregate once, compare raw, round late", body: "O(n log n) over the transactions — one sorted aggregation, a keyed join and a final sort. The durable rules: pin the windows as literals, compute sigma in one sqrt of the variance identity, and never round a value you still have to compare." },
    ],
    approach: "baseline GROUP BY builds mean and squared mean per customer, sqrt of the variance identity gives the population sigma, and each September transaction survives a sigma > 0 plus raw-z > 3.0 gate before display rounding",
    schema: {
      ddl: `CREATE TABLE txns (
  txn_id       INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  txn_date     TEXT NOT NULL,    -- 'YYYY-MM-DD'
  amount_cents INTEGER NOT NULL
);`,
      seed: `-- baseline window 2026-06-01 .. 2026-08-31 · scoring window 2026-09-01 .. 2026-09-30
-- customer 21: tight 49000..51000 baseline, September 89000 is 55.15 sigmas up — flagged
-- customer 22: wide 40000..200000 baseline, September 100000 is ordinary — never flags
-- customer 23: five IDENTICAL 60000 rows make sigma 0 — the guard excludes its 75000
-- customer 24: September 44300 (raw z 3.0406), 44243 (raw z 3.00025, prints 3.0) flag,
--   44200 (raw z 2.9698) does not — the 3.0 boundary pair plus the raw-compare row
-- customer 25: September 30000 is 38.35 sigmas BELOW its 80000 norm — lower tail, out
INSERT INTO txns (txn_id, customer_id, txn_date, amount_cents) VALUES
  (1,  21, '2026-06-05', 49000),
  (2,  21, '2026-06-28', 49500),
  (3,  21, '2026-07-12', 50000),
  (4,  21, '2026-07-30', 50500),
  (5,  21, '2026-08-14', 51000),
  (6,  21, '2026-09-03', 89000),
  (7,  22, '2026-06-08', 40000),
  (8,  22, '2026-06-22', 80000),
  (9,  22, '2026-07-09', 120000),
  (10, 22, '2026-07-25', 160000),
  (11, 22, '2026-08-19', 200000),
  (12, 22, '2026-09-10', 100000),
  (13, 23, '2026-06-03', 60000),
  (14, 23, '2026-06-25', 60000),
  (15, 23, '2026-07-17', 60000),
  (16, 23, '2026-08-02', 60000),
  (17, 23, '2026-08-27', 60000),
  (18, 23, '2026-09-05', 75000),
  (19, 24, '2026-06-06', 38000),
  (20, 24, '2026-06-24', 39000),
  (21, 24, '2026-07-11', 40000),
  (22, 24, '2026-07-29', 41000),
  (23, 24, '2026-08-15', 42000),
  (24, 24, '2026-09-04', 44300),  -- raw z 3.0406: flagged, prints 3.04
  (25, 24, '2026-09-12', 44243),  -- raw z 3.00025: flagged, prints 3.0
  (26, 24, '2026-09-21', 44200),  -- raw z 2.9698: not flagged
  (27, 25, '2026-06-09', 78000),
  (28, 25, '2026-06-27', 79500),
  (29, 25, '2026-07-15', 80000),
  (30, 25, '2026-08-01', 80500),
  (31, 25, '2026-08-20', 82000),
  -- 30000 reads raw z −38.35: lower tail, two-sided probe bait
  (32, 25, '2026-09-08', 30000);`,
      tables: [
        { name: "txns", note: "32 card transactions for 5 customers — 25 baseline rows in June-August and 7 September rows across every trap shape" },
      ],
    },
    code: `WITH base AS (
    -- one row per customer from the PINNED baseline window: the mean and the
    -- mean of squares feed the population-sigma identity in one sqrt
    SELECT
        customer_id,
        AVG(1.0 * amount_cents) AS mean_c,
        AVG(1.0 * amount_cents * amount_cents) AS sq_mean_c
    FROM txns
    WHERE txn_date BETWEEN '2026-06-01' AND '2026-08-31'
    GROUP BY customer_id
),
scored AS (
    -- every September transaction meets its owner's baseline numbers
    SELECT
        t.txn_id,
        t.customer_id,
        t.amount_cents,
        b.mean_c,
        sqrt(b.sq_mean_c - b.mean_c * b.mean_c) AS sigma_c
    FROM txns t
    JOIN base b ON b.customer_id = t.customer_id
    WHERE t.txn_date BETWEEN '2026-09-01' AND '2026-09-30'
)
SELECT
    txn_id,
    customer_id,
    amount_cents,
    ROUND(mean_c, 2) AS baseline_mean_cents,
    ROUND(sigma_c, 2) AS sigma_cents,
    ROUND((amount_cents - mean_c) / sigma_c, 2) AS z_score
FROM scored
WHERE sigma_c > 0                                  -- zero-variance baseline flags nothing
  AND (amount_cents - mean_c) / sigma_c > 3.0      -- STRICT, on the RAW z before rounding
ORDER BY z_score DESC, txn_id ASC;`,
    walkthrough: [
      "The base CTE reduces each customer's five or six baseline rows to two numbers. Customer 21's mean is exactly 50000 and the mean of squares is 2500500000, so the variance identity reads 2500500000 - 2500000000 = 500000 and sigma is sqrt(500000) = 707.1067811865476, displayed as 707.11. Customer 24's identity reads 1602000000 - 1600000000 = 2000000 for sigma 1414.2135623730951, while customer 23's five identical rows collapse the variance to 0 and sigma with it.",
      "The scored CTE attaches those numbers to the seven September transactions. Customer 21's 89000 computes (89000 - 50000) / 707.10678 = 55.154 — flagged. Customer 24's 44300 gives 4300 / 1414.21356 = 3.0406 and its 44243 gives 4243 / 1414.21356 = 3.00025 — both clear the strict 3.0 on the raw values, while 44200's 2.9698 fails. Customer 25's 30000 sits below its mean (negative z, and the contract is upper tail only) and customer 23's row dies on the sigma > 0 guard.",
      "The projection rounds three survivors for display — 55.15, 3.04 and 3.0 — and the ORDER BY ships them z_score DESC, txn_id ASC. Note what the output proves: a flagged row can print 3.0, because the comparison ran on the raw z and the rounding is costume. A future seed with rounded-z ties would fall to the txn_id ASC key.",
    ],
    time: "O(n log n) over the n transactions — one sorted GROUP BY over the baseline, a keyed join and the final ORDER BY sort",
    space: "O(c) — one baseline row per customer (5 here) plus the 7 September rows held in scored",
    followUps: [
      "Add the lower-tail report: which customers' September amounts sit more than 3 sigmas BELOW their own norm, and what would a two-sided queue have shipped on this seed?",
      "Swap the pinned baseline for a rolling 90-day window keyed to each transaction's own date — which window frame recomputes mean and sigma per row, and which September rows change verdicts?",
    ],
    related: ["duplicate-charge-pairs", "settlement-fails-aging", "delinquency-buckets"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "chargeback-rate-ranking",
    statement:
      "The merchant_txns table holds one row per card transaction: (txn_id, merchant_id, status, amount_cents), where status is 'settled', 'chargeback' or 'refunded'. A chargeback is a dispute the cardholder won, and the processor grades every merchant by its chargeback rate — chargebacks over the counted base, where the counted base is settled plus chargeback transactions ONLY and refunded transactions sit out of both sides of the ratio. Report every merchant whose RAW rate is strictly above 1.0 — columns merchant_id, txn_count, chargeback_count and chargeback_rate_pct = ROUND(100.0 * chargeback_count / txn_count, 2) — ordered by chargeback_rate_pct descending, then merchant_id ascending.",
    examples: [
      {
        input: "merchant 105 — 2 chargebacks, 38 settled and 60 refunded transactions",
        output: "105 · 40 · 2 · 5.0",
        explanation:
          "The counted base is 38 + 2 = 40 — refunds sit out of both sides — so the rate is 100.0 * 2 / 40 = 5.0, the portfolio's worst offender.",
      },
      {
        input: "merchant 106 — 1 chargeback, 98 settled and 60 refunded transactions (merchant 104 sits at exactly 2 of 200)",
        output: "106 · 99 · 1 · 1.01",
        explanation:
          "100.0 * 1 / 99 = 1.0101… clears the strict wall on the RAW rate and prints 1.01, while 104's exactly 1.0 does not — the strict > admits no merchant standing on the wall.",
      },
    ],
    constraints: [
      "the counted base is settled + chargeback ONLY — refunded transactions are excluded from BOTH the numerator and the denominator",
      "chargeback_rate_pct = ROUND(100.0 * chargeback_count / txn_count, 2), but the gate compares the RAW rate — 100.0 * chargeback_count / txn_count > 1.0 strictly, before any rounding",
      "exactly 1.0 does not qualify (the > is strict), so a merchant standing on the wall stays out of the report",
      "ORDER BY chargeback_rate_pct DESC, merchant_id ASC — the id breaks rate ties (101 and 103 both read exactly 2.0 here)",
    ],
    primer: {
      hook: "The chargeback rate is the number that decides whether a payment processor keeps a merchant or shows them the door.",
      concept: [
        "When a cardholder does not recognize a charge or feels cheated, they call their bank and file a dispute. The bank reverses the money immediately and pings the merchant with a chargeback: a forced reversal with a paper trail and a fee attached. The merchant can push back in a stage called representment, where they submit evidence — receipts, delivery proof, terms of service — and the cardholder's bank reviews it again. If both sides still disagree, the networks offer a final stage called arbitration, where the card network itself judges and charges the loser hundreds of dollars for the privilege.",
        "Processors watch how often this happens to each merchant. The chargeback rate is chargebacks divided by a counted base of transactions, and the counted base matters: settled transactions and chargebacks count, but refunded ones stay out of both sides, because a refund is the merchant and customer settling it themselves with no dispute machinery involved. The rates are small numbers — healthy merchants live under half a percent — so the industry talks in walls: cross 1.0 percent and the processor's own regulators and card networks start asking questions.",
        "The walls are real. Card networks run monitoring programs that fine or delist merchants whose dispute rates stay above the line, so processors enforce their own stricter gate — boot the merchant before the network boots everyone. Above the wall a merchant can lose processing entirely, which is existential, so the rate is watched daily, not quarterly.",
        "The nastiest driver is friendly fraud: a real customer buys, receives, and then disputes the charge anyway — out of confusion, a forgotten subscription, or plain theft. It looks identical to stolen-card fraud from the merchant's seat, it is growing, and it is why the numerator needs human review and not just arithmetic. Processors fight it with clear billing descriptors and frictionless refunds, because every averted phone call is one chargeback that never exists.",
      ],
      worked: [
        "A small shop ran 100 transactions last month: 40 settled, 2 chargebacks and 58 refunds.",
        "The counted base ignores refunds: 40 + 2 = 42.",
        "The rate is 100.0 * 2 / 42 ≈ 4.76 percent.",
        "4.76 clears the 1.0 wall by nearly five times — the processor freezes payouts and opens a case.",
        "Had one dispute resolved before filing, the rate would read 1 / 41 ≈ 2.44 — still over, which shows how fast small merchants hit the wall.",
      ],
      glossary: [
        { term: "chargeback", def: "a dispute the cardholder won, forcing the merchant to return the money plus a fee" },
        { term: "dispute", def: "the cardholder's formal challenge to a charge, opened with their own bank" },
        { term: "representment", def: "the merchant's evidence-backed answer to a chargeback, asking the bank to undo it" },
        { term: "arbitration", def: "the card network's final ruling stage when merchant and cardholder bank still disagree" },
        { term: "counted base", def: "settled plus chargeback transactions — the denominator refunds may never touch" },
        { term: "friendly fraud", def: "a genuine customer disputing their own valid charge, the costliest dispute flavor" },
      ],
      reallife: [
        "The risk team at a processor runs this report daily. Merchant underwriting sets the account up, monitoring watches the rate, and the moment a merchant trends toward the wall a save desk intervenes — descriptor fixes, refund prompts, sometimes a reserve held against future disputes. The decision the number drives is blunt: remediate or terminate.",
        "What breaks: mixed bases. A dashboard that divides by every transaction including refunds reads merchant 105 as a 2.0 instead of a 5.0 and quietly leaves a bad actor in the portfolio. The other break is lag — chargebacks arrive 30 to 60 days after the sale, so the rate is a rear-view mirror and teams lean on leading signals like refund velocity to see trouble coming.",
      ],
      where: "Payments risk, merchant-underwriting and trust-and-safety roles at processors, acquirers and marketplaces ask this constantly.",
    },
    breakdown: [
      "The ratio looks trivial until the counted base is specified. A refund is the merchant and customer settling it themselves — no dispute machinery ever ran — so the contract keeps refunds out of BOTH sides: they are neither chargebacks in the numerator nor counted transactions in the denominator. On this seed that choice is the difference between reading merchant 105 at 5.0 (2 of 40) and reading it at a dilute 2.0 (2 of 100), and it is the difference between merchant 106 appearing at 1.01 (1 of 99) and vanishing entirely (1 of 159).",
      "The gate is a strict one. Merchant 104 lands on exactly 1.0 — 2 chargebacks in 200 counted — and stays out; the wall only admits merchants clearly past it. The comparison runs on the RAW rate before any rounding: rounding first happens to return the same four rows on this seed because no rate sits between 1.0 and its 1.005 rounding seam, but a 3-in-299 merchant (1.0033) would flip, so the raw comparison is the contract. And the sort is contractual too: 101 and 103 tie at exactly 2.0, so ORDER BY merchant_id ASC is what makes the report deterministic.",
      "The SQL shape is one filtered aggregation. WHERE status IN ('settled', 'chargeback') builds the counted base before GROUP BY ever runs, the numerator is a conditional SUM inside the same pass, and the HAVING carries the raw-rate test so no rounded value is ever compared. Rounding happens once, in the projection, as presentation.",
    ],
    edges: [
      "Refunds in the denominator dilute merchant 105 from 5.0 to 2.0 and erase merchant 106 (1 of 159 reads 0.63) — the report drops to three rows and misses the portfolio's quietest offender.",
      "Merchant 104's exactly-1.0 rate is the strictness probe: swap > for >= and a fifth row appears behind 106.",
      "Rounding inside the gate — ROUND(rate, 2) > 1.0 — happens to agree on this seed (no raw rate sits in the 1.0-to-1.005 seam); the raw comparison stays the contract because the seam flips a 3-in-299 merchant.",
      "Without merchant_id ASC in the ORDER BY, the 101/103 tie at exactly 2.0 is left to the sorter's mood — the tiebreak is part of the contract, and reversing it puts 103 first.",
    ],
    ladder: [
      { title: "Brute force — three piles per merchant", body: "Tally each merchant's rows into settled, chargeback and refunded piles, add the first two, divide, and walk the list comparing each rate to 1.0 by hand. 859 rows makes the pencil version honest about why the aggregation exists." },
      { title: "The pattern — filter, group, conditional sum", body: "WHERE status IN ('settled', 'chargeback') defines the counted base, GROUP BY merchant_id folds it, and SUM(CASE WHEN status = 'chargeback' ...) builds the numerator in the same pass. The gate rides the raw rate, never the rounded one." },
      { title: "The optimal idea — one pass, raw gate, late rounding", body: "O(n log n) over the transactions for the grouped filter plus the final sort. The durable rules: numerator and denominator come from ONE counted base, the gate compares before rounding, and the sort carries an explicit tiebreak." },
    ],
    approach: "filter to settled plus chargeback, GROUP BY merchant with a SUM(CASE) chargeback numerator, gate the RAW rate strictly above 1.0 in the HAVING, round only for display, order rate DESC then id ASC",
    schema: {
      ddl: `CREATE TABLE merchant_txns (
  txn_id       INTEGER PRIMARY KEY,
  merchant_id  INTEGER NOT NULL,
  status       TEXT NOT NULL,    -- 'settled' | 'chargeback' | 'refunded'
  amount_cents INTEGER NOT NULL
);`,
      seed: `-- counted base = settled + chargeback (refunds sit outside both sides)
-- 101: 3 chargebacks + 147 settled = 150 counted, rate 2.0 ·
-- 102: 1 chargeback + 199 settled = 200 counted, rate 0.5 ·
-- 103: 1 chargeback + 49 settled = 50 counted, rate 2.0 — ties 101, id breaks it ·
-- 104: 2 chargebacks + 198 settled = 200 counted, rate exactly 1.0 — strict > excludes ·
-- 105: 2 chargebacks + 38 settled = 40 counted, rate 5.0, plus 60 refunded rows ·
-- 106: 1 chargeback + 98 settled = 99 counted, rate 1.01, plus 60 refunded rows
WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 150)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT n, 101, CASE WHEN n <= 3 THEN 'chargeback' ELSE 'settled' END, 2000 + n FROM seq;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 200)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT 150 + n, 102, CASE WHEN n <= 1 THEN 'chargeback' ELSE 'settled' END, 1800 + n FROM seq;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 50)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT 350 + n, 103, CASE WHEN n <= 1 THEN 'chargeback' ELSE 'settled' END, 2400 + n FROM seq;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 200)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT 400 + n, 104, CASE WHEN n <= 2 THEN 'chargeback' ELSE 'settled' END, 2100 + n FROM seq;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 100)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT 600 + n, 105, CASE WHEN n <= 2 THEN 'chargeback' WHEN n <= 40 THEN 'settled' ELSE 'refunded' END, 2600 + n FROM seq;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 159)
INSERT INTO merchant_txns (txn_id, merchant_id, status, amount_cents)
SELECT 700 + n, 106, CASE WHEN n <= 1 THEN 'chargeback' WHEN n <= 99 THEN 'settled' ELSE 'refunded' END, 2200 + n FROM seq;`,
      tables: [
        { name: "merchant_txns", note: "859 transactions across 6 merchants — counts pinned so rates read 2.0 / 0.5 / 2.0 / exactly 1.0 / 5.0 / 1.01, with 120 refunded rows planted as denominator bait" },
      ],
    },
    code: `WITH counted AS (
    -- the counted base: settled plus chargeback ONLY — refunds sit out of
    -- both the numerator and the denominator. The HAVING gate compares the
    -- RAW rate strictly above 1.0 before any rounding ever runs
    SELECT
        merchant_id,
        COUNT(*) AS txn_count,
        SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) AS chargeback_count
    FROM merchant_txns
    WHERE status IN ('settled', 'chargeback')
    GROUP BY merchant_id
    HAVING 100.0 * SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) / COUNT(*) > 1.0
)
SELECT
    merchant_id,
    txn_count,
    chargeback_count,
    ROUND(100.0 * chargeback_count / txn_count, 2) AS chargeback_rate_pct
FROM counted
ORDER BY chargeback_rate_pct DESC, merchant_id ASC;`,
    walkthrough: [
      "The counted CTE filters first: the WHERE drops all 120 refunded rows (60 on merchant 105, 60 on 106) before GROUP BY ever runs, so the counted base is settled plus chargeback only. Six groups survive the fold: 101 with 150 counted and 3 chargebacks, 102 with 200 and 1, 103 with 50 and 1, 104 with 200 and 2, 105 with 40 and 2, 106 with 99 and 1. Every rate the gate will judge is already fully determined by these six pairs.",
      "The HAVING computes each group's raw rate and compares strictly: 2.0, 0.5, 2.0, 1.0, 5.0 and 1.0101… — 101, 103, 105 and 106 clear the wall. Merchant 104 stands exactly ON 1.0 and the strict > leaves it out; merchant 102's 0.5 never threatened. Nothing rounded was compared anywhere in this step.",
      "The projection rounds the four survivors — 5.0, 2.0, 2.0, 1.01 — and the ORDER BY needs both keys: chargeback_rate_pct DESC puts 105 first, and the 101/103 tie at exactly 2.0 falls to merchant_id ASC, with 106's 1.01 last. Ship it without the id tiebreak and the tie order belongs to the sorter, not the contract. The output is four rows, one per flagged merchant, and every cell is deterministic on this seed.",
    ],
    time: "O(n log n) over the n transactions — the filtered GROUP BY and the final ORDER BY each sort once",
    space: "O(m) — one row per merchant (6 here) held in the counted CTE",
    followUps: [
      "Join a merchants dimension carrying segment and onboarding month — does the ranking change when the wall tightens to 1.0 for merchants under 90 days old only?",
      "Trend the rate by month with a txn_date column — which window frame keeps the numerator and denominator on the same moving counted base?",
    ],
    related: ["duplicate-charge-pairs", "gl-reconciliation", "bank-account-summary-ii"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "dormant-reactivation",
    statement:
      "Accounts that log in after a long quiet spell are the classic account-takeover signature, and the compliance queue wants them ranked by how long they slept. An account is dormant when it has ZERO logins in the pinned summer window '2026-06-01' through '2026-08-31', and reactivated when it logs in at least once in '2026-09-01' through '2026-09-30'; flag reactivated accounts with kyc_verified = 0 that were opened before '2026-06-01'. Report account_id, kyc_verified, prior_login_date = MAX(login_date) before '2026-06-01' (NULL when the account never logged in before), reactivation_date = MIN(September login) and dormant_days = CAST(julianday(reactivation_date) - julianday(prior_login_date) AS INTEGER) (NULL when prior_login_date is NULL), ordered by reactivation_date ascending, then account_id ascending.",
    examples: [
      {
        input: "account 2 — last pre-summer login 2026-04-30, zero summer logins, September logins 2026-09-01 and 2026-09-08, kyc_verified 0",
        output: "2 · 0 · 2026-04-30 · 2026-09-01 · 124",
        explanation:
          "reactivation_date is the MIN September login (2026-09-01, not the 09-08 follow-up) and the julianday gap from 2026-04-30 is exactly 124 days.",
      },
      {
        input: "account 4 — opened 2026-01-25, kyc_verified 0, no login at all until 2026-09-20",
        output: "4 · 0 · NULL · 2026-09-20 · NULL",
        explanation:
          "No pre-June login means MAX runs over an empty set: the LEFT JOIN keeps the row with prior_login_date NULL and dormant_days NULL — report the NULL, never drop the account.",
      },
    ],
    constraints: [
      "both windows are pinned literals: dormant = ZERO logins between '2026-06-01' and '2026-08-31'; reactivated = at least one login between '2026-09-01' and '2026-09-30'",
      "the flag gate is kyc_verified = 0 AND opened_date < '2026-06-01' — accounts opened on or after '2026-06-01' are excluded entirely, even when every window test passes",
      "prior_login_date = MAX(login_date) before '2026-06-01', NULL when the account never logged in before — report the NULL; dormant_days = CAST(julianday(reactivation_date) - julianday(prior_login_date) AS INTEGER), NULL when prior is NULL (date-only julianday differences are exact)",
      "ORDER BY reactivation_date ASC, account_id ASC",
    ],
    primer: {
      hook: "A login after months of silence is either a customer coming home or an intruder landing — compliance treats it as the second until proven otherwise.",
      concept: [
        "Dormancy is an account state, not an event: an account with no logins for a long stretch has, from the security desk's view, no owner currently holding the door. Dormant accounts are prime targets because nobody is watching them — the password may be old, recycled from a breach, or known to an ex-partner. When one of them suddenly logs in, the event is called a reactivation, and a burst of activity right after (new payee, new device, password change) is the classic account-takeover signature.",
        "KYC — know your customer — is the legal duty to know who is really behind an account: verified identity documents, proof of address, sanctions screening. It is not a one-time ritual: the obligations say re-verification is due when risk changes, and waking a dormant unverified account is exactly such a change. AML — anti-money-laundering — adds the reporting duty: money moving through an account whose owner was never re-verified is how laundering hides, so compliance ranks reactivations of unverified accounts above almost everything else in the morning queue.",
        "The queue is ranked by the size of the gap. An account quiet for two weeks is noise; quiet for four months before a login is a story. The dormant-days count is what turns a login event into a risk ranking, and the accounts with no prior history at all get special handling — there is no baseline, only the opening date, so they are judged by different rules.",
        "False positives are the cost. Students return from exams, travelers return from trips, and every one of them can look like a takeover — freeze them wrongly and the institution pays in support tickets, regulator complaints and lost trust. That is why the flag is a review trigger with a human, not an automatic lock.",
      ],
      worked: [
        "An account last logged in on 2026-05-18, then went silent — zero logins from June through August.",
        "On 2026-09-03 a login lands. The account just reactivated.",
        "prior_login_date reads 2026-05-18 and reactivation_date reads 2026-09-03.",
        "The gap is 13 days left in May, plus 30, 31, 31, then 3 into September — 108 dormant days.",
        "kyc_verified reads 0, so the row queues with 108 days of silence as its rank.",
      ],
      glossary: [
        { term: "dormancy", def: "a long stretch with zero logins, after which the account is considered unwatched" },
        { term: "reactivation", def: "the first login after a dormancy stretch — the event that reopens the file" },
        { term: "account takeover", def: "an intruder driving a legitimate account, often spotted as a burst after dormancy" },
        { term: "KYC", def: "know your customer — the duty to verify who is really behind an account" },
        { term: "AML", def: "anti-money-laundering — the monitoring and reporting duties that follow the money" },
        { term: "false positive", def: "an honest customer caught by the rule, paid for in trust and support cost" },
      ],
      reallife: [
        "A neobank's financial-crime team runs this queue every morning. An analyst sees an account wake after 108 days unverified and pulls the session: new device, password reset the night before, a payee added within minutes. The decision ladder is freeze, re-KYC, or watch — and the dormant-days figure decides how fast it is climbed.",
        "What breaks: return season. Students, seasonal workers and travelers all reactivate honestly, and a bank that freezes them all drowns its own support line — teams pair the flag with device history and trip data before acting. The second break is the opened-date edge: brand-new accounts have no dormancy to measure, and naive rules flag every new signup as a reactivation until the opening-date guard is written down as a rule.",
      ],
      where: "Financial-crime analysts, AML compliance officers and fraud engineers at banks, neobanks and exchanges.",
    },
    breakdown: [
      "Three facts about each account must be established before anything can rank: was it quiet all summer, did it log in in September, and is it unverified with an opening date before the summer began. The first is a zero-count over a window — the account must have NO logins between '2026-06-01' and '2026-08-31', which is a NOT EXISTS test, not an aggregate a GROUP BY can hand you. The second is an ordinary MIN over September logins, and the third is two column gates on the accounts table itself.",
      "The report's subtlety is the account that never logged in before the window. MAX(login_date) over pre-June logins yields no group at all for it, so the aggregate must ride a LEFT JOIN and the row must survive with prior_login_date NULL — an INNER JOIN erases exactly the account the contract says to report. The NULL then propagates honestly: julianday(NULL) is NULL, dormant_days reads NULL for the never-logged account, and the contract wants that NULL shipped, not COALESCEd away.",
      "The trap the seed plants is the September opening. An account opened '2026-09-05' has no summer logins and a September login, so it passes every dormancy test as written — it was never dormant, it was never alive. The contract pins the guard explicitly: accounts opened on or after '2026-06-01' are excluded entirely, because dormancy is defined against a summer the account did not exist for.",
    ],
    edges: [
      "Account 4 never logged in before June: an INNER JOIN to the prior-login aggregate ships three rows and silently deletes the NULL-prior row the contract demands — the LEFT JOIN is load-bearing.",
      "The dormancy check is a NOT EXISTS over the summer window; invert it to EXISTS and account 6 — active all summer AND in September — becomes the report's only row.",
      "Drop the kyc_verified = 0 gate and accounts 5 and 7 (both verified) leak in, doubling the queue with rows compliance would never touch.",
      "Account 9 opens on '2026-09-05' with two September logins: it passes every window test and only the opened_date < '2026-06-01' guard keeps a never-dormant account out of the report.",
    ],
    ladder: [
      { title: "Brute force — three scans per account", body: "For each account, scan its login list three times — any summer hit, the earliest September date, the latest pre-June date — then apply the two column gates by eye. Nine accounts is tedious; a million is impossible, and the pencil version never learns the anti-join shape." },
      { title: "The pattern — three CTEs and a join", body: "summer collects the accounts with any June-August login, september reduces each account to MIN(login_date) in the window, and prior reduces each to MAX before June. The final query joins them to accounts and applies the kyc gate, the opened-date guard and NOT EXISTS over summer." },
      { title: "The optimal idea — anti-join the quiet, ship the NULL", body: "O(n log n) over the login rows for the three grouped scans. The durable rules: absence is NOT EXISTS, the never-logged account survives only via LEFT JOIN, and the opened-date guard belongs in the WHERE beside the kyc gate." },
    ],
    approach: "three CTEs (summer presence, September MIN, pre-June MAX) joined to accounts, gated by kyc_verified = 0, the opened-date guard and NOT EXISTS over summer, dormant_days from a julianday difference",
    schema: {
      ddl: `CREATE TABLE accounts (
  account_id   INTEGER PRIMARY KEY,
  opened_date  TEXT NOT NULL,    -- 'YYYY-MM-DD'
  kyc_verified INTEGER NOT NULL  -- 0 = unverified, 1 = verified
);

CREATE TABLE logins (
  account_id INTEGER NOT NULL,
  login_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  PRIMARY KEY (account_id, login_date)
);`,
      seed: `-- flagged queue: 1 (gap 108), 2 (gap 124), 3 (gap 187), 4 (never logged — NULL prior)
-- excluded: 5 kyc 1 reactivator · 6 summer-active · 7 kyc 1 never-logged twin of 4 ·
--   8 still dormant (no September login) · 9 opened 2026-09-05 — the opened-date trap
INSERT INTO accounts (account_id, opened_date, kyc_verified) VALUES
  (1, '2026-01-10', 0),
  (2, '2026-02-05', 0),
  (3, '2025-11-20', 0),
  (4, '2026-01-25', 0),
  (5, '2025-12-01', 1),
  (6, '2026-03-08', 0),
  (7, '2025-03-15', 1),
  (8, '2025-09-30', 0),
  (9, '2026-09-05', 0);

-- account 2 keeps a 09-08 follow-up so the MIN-versus-MAX probe bites
INSERT INTO logins (account_id, login_date) VALUES
  (1, '2026-03-02'), (1, '2026-04-21'), (1, '2026-05-18'), (1, '2026-09-03'),
  (2, '2026-02-11'), (2, '2026-04-30'), (2, '2026-09-01'), (2, '2026-09-08'),
  (3, '2026-01-15'), (3, '2026-03-12'), (3, '2026-09-15'),
  (4, '2026-09-20'), (4, '2026-09-26'),
  (5, '2026-05-05'), (5, '2026-09-09'),
  (6, '2026-04-14'), (6, '2026-07-10'), (6, '2026-09-12'),
  (7, '2026-09-25'),
  (8, '2026-02-20'),
  (9, '2026-09-06'), (9, '2026-09-18');`,
      tables: [
        { name: "accounts", note: "9 accounts — 4 flagged unverified reactivators opened before June, plus the kyc, activity, dormancy and opened-date exclusions" },
        { name: "logins", note: "22 login rows — one per account per day, including account 2's September follow-up and account 6's 2026-07-10 summer login" },
      ],
    },
    code: `WITH summer AS (
    -- any login inside the dormant window kills dormancy: collect the ids
    SELECT DISTINCT account_id
    FROM logins
    WHERE login_date BETWEEN '2026-06-01' AND '2026-08-31'
),
september AS (
    -- the reactivation evidence: FIRST September login per account
    SELECT
        account_id,
        MIN(login_date) AS reactivation_date
    FROM logins
    WHERE login_date BETWEEN '2026-09-01' AND '2026-09-30'
    GROUP BY account_id
),
prior AS (
    -- last touch before the account went quiet: NULL when there was none
    SELECT
        account_id,
        MAX(login_date) AS prior_login_date
    FROM logins
    WHERE login_date < '2026-06-01'
    GROUP BY account_id
)
SELECT
    a.account_id,
    a.kyc_verified,
    p.prior_login_date,
    s.reactivation_date,
    CAST(julianday(s.reactivation_date) - julianday(p.prior_login_date) AS INTEGER) AS dormant_days
FROM accounts a
JOIN september s ON s.account_id = a.account_id
LEFT JOIN prior p ON p.account_id = a.account_id
WHERE a.kyc_verified = 0                 -- the compliance gate
  AND a.opened_date < '2026-06-01'       -- never-alive accounts are not dormant
  AND NOT EXISTS (SELECT 1 FROM summer su WHERE su.account_id = a.account_id)
ORDER BY s.reactivation_date ASC, a.account_id ASC;`,
    walkthrough: [
      "The summer CTE collects exactly one id — account 6, whose 2026-07-10 login makes it active all summer. The september CTE folds eight accounts to their first September login: 2 → '2026-09-01', 1 → '2026-09-03', 5 → '2026-09-09', 3 → '2026-09-15', 6 → '2026-09-12', 4 → '2026-09-20', 9 → '2026-09-06' and 7 → '2026-09-25'. The prior CTE yields six pre-June groups — accounts 1, 2, 3, 5, 6 and 8 — while 4, 7 and 9 have none.",
      "The gates then fire in sequence. The INNER JOIN to september drops account 8 (no September login, still dormant); kyc_verified = 0 drops 5 and 7; NOT EXISTS over summer drops 6; and opened_date < '2026-06-01' drops 9, whose two September logins otherwise pass every window test. Four accounts survive: 2, 1, 3 and 4.",
      "The projection joins and computes: the LEFT JOIN hands account 4 a NULL prior_login_date, and julianday(NULL) keeps dormant_days NULL with it. The other three read CAST(julianday gap): 124 for account 2, 108 for account 1, 187 for account 3. ORDER BY reactivation_date ASC, account_id ASC ships 2, 1, 3, 4 — the never-logged account last, its NULLs intact.",
    ],
    time: "O(n log n) over the n login rows — three grouped scans plus the final ORDER BY sort",
    space: "O(a) — one row per active account per CTE (8 September groups, 6 prior groups here)",
    followUps: [
      "Rank by dormant_days instead of reactivation date — which account jumps the queue, and what would the NULL-prior row need to compete?",
      "Add a burst detector: count September logins per flagged account and split the queue into takeover-suspect versus likely-returner.",
    ],
    related: ["week-over-week-churn", "feature-adoption-windows", "median-time-to-convert"],
    order: "exact",
    xp: 20,
  },
];
