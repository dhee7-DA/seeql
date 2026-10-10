// Deep-dives — SaaS Analytics B file: net revenue retention, LTV/CAC payback
// and winback recovery (3 problems: 2 Medium, 1 Hard; all three order:"exact"
// with an ORDER BY in the solution). Every money column is INTEGER cents with
// the _cents suffix; averages, rates, ratios and percentages are REAL and
// never carry the suffix; own tables, own seeds, original phrasing — never
// copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8052 net-revenue-retention ·
// 8053 ltv-cac-payback · 8054 winback-recovery.
import type { LcSqlDive } from "../types";

export const SQL_DF_SAAS_B: LcSqlDive[] = [
  {
    slug: "net-revenue-retention",
    statement:
      "Net revenue retention is the number public SaaS companies print at the top of every earnings deck: take the customers who were already paying and ask how much they still pay three months later, expansions included and churn included. The customers table holds (customer_id, cohort_month) where cohort_month is the month of first subscription stored as the first of the month, and mrr_snapshots bills one row per customer per subscribed month (month also first-of-month, mrr_cents INTEGER) across 2026-04 through 2026-09. Per cohort_month report cohort_month, m0_mrr = SUM of the cohort's mrr_cents at the cohort month itself, m3_mrr = SUM at month = date(cohort_month, '+3 month') — a churned customer has no row at m3, contributes 0, and STAYS in the denominator, which is the point of the metric — and nrr_pct = ROUND(100.0 * m3_mrr / m0_mrr, 2). Only cohorts whose m3 month falls inside the seeded window report, ordered by cohort_month ascending.",
    examples: [
      {
        input:
          "cohort 2026-04 — customers 101, 102, 103 and 104 bill 10000, 8000, 6000 and 4000 in their cohort month; at month 2026-07 customer 103 has churned (no row) while 101 has expanded 10000 to 30000 and 104 has grown to 5000",
        output: "2026-04-01 · 28000 · 43000 · 153.57",
        explanation:
          "m0 = 10000 + 8000 + 6000 + 4000 = 28000. At m3 the churned 103 still belongs to the denominator but contributes 0, so m3 = 30000 + 8000 + 5000 = 43000 and 100.0 * 43000 / 28000 = 153.57 — one customer tripling has pushed the whole cohort past 100 percent.",
      },
      {
        input:
          "cohort 2026-06 — customers 301 to 304 bill 12000, 8000, 5000 and 5000 in 2026-06; by 2026-09 customer 301 has been downgraded to 6000 and customers 302 and 304 have churned",
        output: "2026-06-01 · 30000 · 11000 · 36.67",
        explanation:
          "m3 = 6000 + 0 + 5000 + 0 = 11000 over the untouched 30000, so 100.0 * 11000 / 30000 = 36.67 — both lost customers drag the number down because NRR never shrinks the denominator.",
      },
    ],
    constraints: [
      "all money is INTEGER cents (mrr_cents); m0_mrr and m3_mrr are INTEGER sums and nrr_pct is the only REAL in the output",
      "PINNED month storage: cohort_month and month are first-of-month dates 'YYYY-MM-01', so the m3 month is date(cohort_month, '+3 month') computed by the engine — 2026-04-01 maps to 2026-07-01 — and month equality is plain string equality",
      "PINNED NRR: m0_mrr = SUM(mrr_cents) over the cohort's rows at month = cohort_month; m3_mrr = SUM over rows at month = date(cohort_month, '+3 month') where churned customers contribute 0 but stay counted (m0_mrr includes every customer of the cohort); nrr_pct = ROUND(100.0 * m3_mrr / m0_mrr, 2)",
      "one mrr_snapshots row per customer per month and every customer bills in their own cohort_month; only cohorts with date(cohort_month, '+3 month') <= MAX(month) report — the seeded window 2026-04-01 through 2026-09-01 keeps all three cohorts; ORDER BY cohort_month ASC",
    ],
    primer: {
      hook: "The one number a SaaS board reads before breakfast: of the revenue you already had, how much is still here — and then some — three months later?",
      concept: [
        "Every subscription business grows two ways: win new customers, or earn more from the customers already won. Net revenue retention isolates the second engine. Pick a cohort — every customer who started paying in the same month — add up what they paid that month, then add up what the SAME customers pay three months later. The ratio is NRR: 100 percent means the cohort's revenue is exactly flat, above 100 means expansion inside the base is outrunning losses, below 100 means the base leaks faster than upsells can refill it.",
        "The metric's defining rule is what happens to churned customers. They pay nothing at month three, and they still count in the denominator — the m0 revenue they used to contribute stays in the base you compare against. That is deliberate: NRR exists to make churn visible, and quietly re-basing the denominator to survivors would flatter a dying product. Its calmer sibling, gross revenue retention, keeps the same denominator but ignores expansion and can never pass 100; NRR lets expansion push the number above it. A cohort that loses 40 and expands 55 reads 85 NRR against 60 GRR — the gap between the two IS the upsell story.",
        "Month three is a convention, not a law — public SaaS reports NRR at twelve months, product teams watch thirty-day and ninety-day versions of the same shape. What matters is that every cohort is measured at the SAME age: reading each cohort whenever you happen to look would compare a newborn to a toddler. This report pins age 3, and a cohort younger than three months simply has no m3 month inside the window and waits its turn.",
        "Finance teams trust this number more than headline growth because new-logo revenue can be bought — discount a year and sign anyone — while expansion inside an existing cohort is earned product value and churn inside it is earned product damage. NRR rolls both into one percentage that cannot be bought, which is why a business printing 110 percent can be called healthy even in a month when its sales team coasts. The read is directional, not cosmetic: a base compounding above 100 makes every quarter's sales target easier, while a base bleeding below 100 forces sales to outrun the leak just to stand still, and the two situations demand opposite spending.",
      ],
      worked: [
        "A tiny cohort starts month 0 with three customers paying 40, 30 and 30 cents of monthly recurring revenue — m0 is 100.",
        "By month 3 the 40-cent customer has churned and pays 0; the first 30-cent customer has expanded to 55; the second still pays 30.",
        "m3 = 0 + 55 + 30 = 85 — the churned customer contributes nothing to the numerator.",
        "NRR = 100.0 * 85 / 100 = 85.0 percent, and the churned 40 remains inside the 100 denominator, which is exactly what keeps the number honest.",
        "Gross revenue retention on the same facts reads 100.0 * 60 / 100 = 60.0, expansion ignored; the 25-point gap between 60 and 85 is the upsell motion made visible.",
      ],
      glossary: [
        { term: "net revenue retention (NRR)", def: "cohort revenue at a later age over cohort revenue at month 0, churn included and expansion allowed past 100" },
        { term: "cohort", def: "every customer whose first subscription month is the same month, followed together through time" },
        { term: "expansion revenue", def: "extra revenue from customers already in the cohort — upgrades, seat adds, plan upsells" },
        { term: "contraction", def: "revenue lost when a customer downgrades without leaving — the quiet half of the movement ledger" },
        { term: "gross revenue retention", def: "the capped twin — surviving revenue over m0, never above 100, expansion ignored" },
        { term: "churned revenue", def: "m0 revenue from customers with no row at the measurement month, still weighing the denominator down" },
      ],
      reallife: [
        "At a public SaaS company the CFO owns NRR and investor relations prints it every quarter; Snowflake and Datadog built their valuations on reading far north of 100 percent, meaning the installed base alone would grow the company with zero new logos. Inside the company the number belongs to customer success and pricing: each cohort's curve says whether onboarding works, whether the pricing ladder invites upgrades, and which contract anniversary month bleeds. Boards have learned to discount the headline too — a vendor can ride one large enterprise cohort to a flattering print — so operators break the blended number into cohort curves and segment-level reads before anyone celebrates.",
        "What breaks in practice: annual prepaids recognized months after they were billed make snapshots lie about timing, so teams pin one convention and hold it; acquired customers folded into a cohort inflate NRR with revenue the motion never earned, which is why NRR excluding acquisitions is reported beside it. The decisions are budget-sized — an NRR under 100 for two quarters running triggers retention task forces, repricing and save-desk staffing long before bookings feel it. Seat-count moves muddy the same water — a customer adding seats is expansion, one trimming seats but staying is contraction, and both stay invisible if the snapshot stores only the invoice total — so mature teams snapshot revenue and seat count side by side.",
      ],
      where: "Revenue-analytics, investor-relations and customer-success teams own it, and SQL interviews at Snowflake and Datadog hand candidates exactly this cohort-revenue shape.",
    },
    breakdown: [
      "The report reads two snapshots of the same group of customers at two ages: what the cohort paid in its birth month and what it pays three months later. The denominator is m0 — every customer who started that month, counted once, never re-based. The numerator is m3 — the same customers' bills at age three, where a churned customer shows up as an absent row. Keeping the churned customers in the denominator is the whole design: dropping them would quietly redefine the metric as how do our survivors do, which reads flattering numbers on a dying product. The 2026-04 cohort demonstrates the upside case — one churn worth 6000 is buried by one customer tripling from 10000 to 30000 and the cohort prints 153.57; the 2026-06 cohort demonstrates the downside — a downgrade plus two churns drag it to 36.67.",
      "The SQL is two aggregates over one customer list. The m0 CTE INNER-joins customers to their cohort-month rows — every customer has one, the constraint guarantees it — and sums. The m3 CTE LEFT-joins customers to rows at date(cohort_month, '+3 month'); a churned customer's NULL row contributes nothing to SUM while the customer itself never leaves the GROUP BY, which is how contributes 0 but stays counted is implemented for free. The outer WHERE compares each cohort's m3 date against MAX(month) over the snapshots — the data-driven window end — so a cohort younger than three months would be held back; on this seed all three qualify because 2026-06-01 plus three months lands exactly on the final month 2026-09-01.",
      "Month arithmetic runs on the stored first-of-month dates: date('2026-04-01', '+3 month') returns '2026-07-01', which string-equals every July row's month label, so the join is an equality and no calendar decomposition is needed. The percent scales at the last step only — 100.0 * m3 / m0 in REAL, then ROUND(..., 2) — and the in-between months that show HOW each cohort moved are pure decoys: the joins touch exactly two months per cohort, and any read that aggregates the whole table blends cohorts and ages into a number nobody asked for. String labels also power the window guard: MAX(month) walks the first-of-month grid lexicographically, '2026-09-01' wins, and comparing it against each cohort's derived m3 date keeps the whole test inside the calendar the join already speaks.",
    ],
    edges: [
      "Re-base the denominator to survivors only (m0 of customers still present at m3) and the 2026-04 cohort jumps from 153.57 to 195.45 while the 2026-06 cohort inflates from 36.67 to 64.71 — the survivor-denominator read is the classic self-flattery, pinned from this seed.",
      "Compute the m3 month as date(cohort_month, '+90 day') instead of '+3 month' and every m3 join misses — 2026-06-30, 2026-07-30 and 2026-08-30 exist on no month label — so all three rows print m3_mrr 0 and nrr_pct 0.0; a day count that ignores the month grid is the drift.",
      "Read m0 from date(cohort_month, '+1 month') — M1 masquerading as M0 — and the 2026-05 cohort's denominator becomes 23000 instead of 20000 (customer 201's expansion to 12000 has already landed), printing 86.96 where the contract prints 100.0.",
      "Round the raw ratio to 2 decimals BEFORE scaling by 100 and April reads 154.0 instead of 153.57 (June 37.0 instead of 36.67) — ROUND lives at the pinned place only, after the division.",
    ],
    ladder: [
      { title: "Brute force — two spreadsheets per cohort", body: "List each cohort's customers, sum their birth-month bills in one column, walk the calendar three months forward, sum again, divide. Three cohorts is manageable by hand; a live product with hundreds of cohorts and rolling windows is not, and the two-sums-per-cohort step is exactly what the SQL automates." },
      { title: "The pattern — two keyed aggregates over one customer list", body: "m0 INNER-joins customers to their cohort-month rows and sums; m3 LEFT-joins the same customers to date(cohort_month, '+3 month') rows and sums, NULLs vanishing inside SUM. Join the two CTEs on cohort_month, guard the window with MAX(month), ROUND the scaled ratio last." },
      { title: "The optimal idea — keep the denominator, key the joins, round last", body: "O(C + R) over customers C and snapshot rows R — every row is touched once per aggregate. The durable rules: the denominator never shrinks, the m3 join is an equality on a derived first-of-month date, and every cohort is measured at the same age before it reports." },
    ],
    approach: "m0 INNER-join SUM at the cohort month, m3 LEFT-join SUM at date(cohort_month, '+3 month') with churned customers kept in the denominator, MAX(month) window guard, ROUND(100.0 * m3 / m0, 2) last",
    schema: {
      ddl: `CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  cohort_month TEXT NOT NULL         -- month of first subscription, 'YYYY-MM-01'
);
CREATE TABLE mrr_snapshots (
  customer_id INTEGER NOT NULL,
  month       TEXT NOT NULL,         -- subscribed month, 'YYYY-MM-01'
  mrr_cents   INTEGER NOT NULL,
  PRIMARY KEY (customer_id, month)
);`,
      seed: `-- Three cohorts, three stories. Window: 2026-04-01 .. 2026-09-01.
-- 2026-04 cohort EXPANDS: customer 103 churns (6000 gone) but customer 101
-- triples 10000 to 30000, more than covering the loss.
-- 2026-05 cohort is FLAT: customer 201's +3000 upgrade exactly cancels
-- customer 202's -3000 downgrade.
-- 2026-06 cohort CONTRACTS: one downgrade (301) and two churns (302, 304).
INSERT INTO customers (customer_id, cohort_month) VALUES
  (101, '2026-04-01'), (102, '2026-04-01'), (103, '2026-04-01'), (104, '2026-04-01'),
  (201, '2026-05-01'), (202, '2026-05-01'), (203, '2026-05-01'),
  (301, '2026-06-01'), (302, '2026-06-01'), (303, '2026-06-01'), (304, '2026-06-01');
INSERT INTO mrr_snapshots (customer_id, month, mrr_cents) VALUES
  -- 2026-04 cohort: m0 = 28000, m3 (2026-07) = 43000
  (101, '2026-04-01', 10000), (101, '2026-05-01', 10000), (101, '2026-06-01', 30000),
  (101, '2026-07-01', 30000), (101, '2026-08-01', 30000), (101, '2026-09-01', 30000),
  (102, '2026-04-01',  8000), (102, '2026-05-01',  8000), (102, '2026-06-01',  8000),
  (102, '2026-07-01',  8000), (102, '2026-08-01',  8000), (102, '2026-09-01',  8000),
  (103, '2026-04-01',  6000), (103, '2026-05-01',  6000),              -- churned after 05
  (104, '2026-04-01',  4000), (104, '2026-05-01',  4000), (104, '2026-06-01',  4000),
  (104, '2026-07-01',  5000), (104, '2026-08-01',  5000), (104, '2026-09-01',  5000),
  -- 2026-05 cohort: m0 = 20000, m3 (2026-08) = 20000
  (201, '2026-05-01',  9000), (201, '2026-06-01', 12000), (201, '2026-07-01', 12000),
  (201, '2026-08-01', 12000), (201, '2026-09-01', 12000),
  (202, '2026-05-01',  7000), (202, '2026-06-01',  7000), (202, '2026-07-01',  4000),
  (202, '2026-08-01',  4000), (202, '2026-09-01',  4000),
  (203, '2026-05-01',  4000), (203, '2026-06-01',  4000), (203, '2026-07-01',  4000),
  (203, '2026-08-01',  4000), (203, '2026-09-01',  4000),
  -- 2026-06 cohort: m0 = 30000, m3 (2026-09) = 11000
  (301, '2026-06-01', 12000), (301, '2026-07-01', 12000), (301, '2026-08-01',  6000),
  (301, '2026-09-01',  6000),
  (302, '2026-06-01',  8000), (302, '2026-07-01',  8000),              -- churned after 07
  (303, '2026-06-01',  5000), (303, '2026-07-01',  5000), (303, '2026-08-01',  5000),
  (303, '2026-09-01',  5000),
  -- 304 churned after 07: no August or September rows
  (304, '2026-06-01',  5000), (304, '2026-07-01',  5000);`,
      tables: [
        { name: "customers", note: "11 customers in 3 cohorts — 2026-04 expanding, 2026-05 flat, 2026-06 contracting" },
        { name: "mrr_snapshots", note: "47 rows, 2026-04-01 through 2026-09-01; the m0 and m3 months per cohort drive the report, the in-between months are trajectory decoys" },
      ],
    },
    code: `WITH m0 AS (
    -- the cohort's birth-month bills: every customer bills in their own cohort month
    SELECT c.cohort_month, SUM(s.mrr_cents) AS m0_mrr
    FROM customers c
    JOIN mrr_snapshots s
      ON s.customer_id = c.customer_id AND s.month = c.cohort_month
    GROUP BY c.cohort_month
),
m3 AS (
    -- the same customers three months later: churned customers have no row,
    -- their NULL contributes 0 to SUM but they never leave the denominator
    SELECT c.cohort_month, COALESCE(SUM(s.mrr_cents), 0) AS m3_mrr
    FROM customers c
    LEFT JOIN mrr_snapshots s
      ON s.customer_id = c.customer_id
     AND s.month = date(c.cohort_month, '+3 month')
    GROUP BY c.cohort_month
)
SELECT
    m0.cohort_month,
    m0.m0_mrr,
    m3.m3_mrr,
    ROUND(100.0 * m3.m3_mrr / m0.m0_mrr, 2) AS nrr_pct
FROM m0
JOIN m3 ON m3.cohort_month = m0.cohort_month
-- only cohorts whose m3 month exists inside the seeded window report
WHERE date(m0.cohort_month, '+3 month') <= (SELECT MAX(month) FROM mrr_snapshots)
ORDER BY m0.cohort_month ASC;`,
    walkthrough: [
      "The m0 CTE sums each cohort's birth-month bills: 2026-04-01 reads 10000 + 8000 + 6000 + 4000 = 28000, 2026-05-01 reads 9000 + 7000 + 4000 = 20000 and 2026-06-01 reads 12000 + 8000 + 5000 + 5000 = 30000. The INNER join is safe because every customer bills in their own cohort month — customer 103's 6000 counts here even though it will be gone by m3. The (customer_id, month) primary key guarantees one bill per customer per month, so no grouped sum can silently double count, and one GROUP BY produces all three baselines in a single pass.",
      "The m3 CTE walks the same customers at date(cohort_month, '+3 month'): July for the April cohort reads 30000 + 8000 + 5000 = 43000 (customer 103's NULL row simply vanishes inside SUM), August for the May cohort reads 12000 + 4000 + 4000 = 20000 — customer 201's upgrade to 12000 exactly cancels customer 202's downgrade to 4000 — and September for the June cohort reads 6000 + 5000 = 11000 after two churns. The in-between months that trace each customer's path are never touched by either join. COALESCE matters at the edge: SUM over a group whose customers all miss the month join returns NULL, and the wrapper turns that NULL into 0 so a fully churned cohort would print 0.0 rather than vanish; every cohort here keeps survivors, but the guard is what makes the all-churned hypothetical safe.",
      "The outer query joins the two CTEs on cohort_month, keeps every cohort whose m3 date does not sit past MAX(month) — all three qualify, the June cohort's m3 landing exactly on 2026-09-01 — and rounds the scaled ratio: 100.0 * 43000 / 28000 = 153.5714... to 153.57, 100.0 * 20000 / 20000 = 100.0, and 100.0 * 11000 / 30000 = 36.6666... to 36.67. The engine ships three rows in cohort order: (2026-04-01, 28000, 43000, 153.57), (2026-05-01, 20000, 20000, 100.0) and (2026-06-01, 30000, 11000, 36.67).",
    ],
    time: "O(C + R) over the C customers and R snapshot rows — each aggregate is one keyed pass and the window guard one MAX",
    space: "O(C) — the two CTEs hold one row per cohort and the joins ride the customer-month key",
    followUps: [
      "Add the m1 and m6 ages beside m3 — which date arithmetic generalizes to any age, and what does the 2026-04 cohort's curve look like with customer 101's expansion landing between the ages?",
      "Split each cohort's m3 revenue into surviving, contracted and expanded parts — a movement ledger — and locate the NRR numerator inside the new, expansion, contraction and churned families the board deck prints.",
    ],
    related: ["cohort-retention-matrix", "growth-accounting", "week-over-week-churn"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "ltv-cac-payback",
    statement:
      "Unit economics per acquisition channel: does a channel's customer give back more than the channel paid to win them, and how many months of contribution does the win take to repay? Three tables feed the report: customers (customer_id, channel, signup_month), mrr_snapshots billing one row per customer per subscribed month (month first-of-month, window 2026-04 through 2026-08) and channel_spend (channel, spend_cents) holding each channel's total acquisition spend. Per channel report channel, customers (the customer count), arpu_mrr = AVG of every billed mrr_cents joined to the channel (total billed over customer-months; a REAL average of cents values, never rounded to an integer), monthly_churn_pct = 100.0 * churned transitions / customer-months at risk where a churn is ONE per customer whose last subscribed month precedes the window's final month (MAX(month) = 2026-08-01), cac_cents = ROUND(spend_cents * 1.0 / customers, 0), ltv_cents = ROUND(arpu * 0.80 / (monthly_churn_pct / 100.0), 0) at the PINNED 80.0 percent gross margin with a guard for churn 0, ltv_to_cac = ROUND(raw ltv / raw cac, 2) and payback_months = ROUND(raw cac / (arpu * 0.80), 1), ordered by ltv_to_cac DESC.",
    examples: [
      {
        input:
          "channel organic — 5 customers bill 99000 cents across 20 customer-months (arpu 4950.0); one customer's last month is 2026-07-01, before the window's final month 2026-08-01; channel_spend holds 50000",
        output: "organic · 5 · 4950.0 · 5.0 · 10000 · 79200 · 7.92 · 2.5",
        explanation:
          "churn = 1 transition over 20 customer-months = 5.0 percent; cac = 50000 / 5 = 10000; ltv = 4950.0 * 0.80 / 0.05 = 79200; ltv_to_cac = 79200 / 10000 = 7.92 and payback = 10000 / (4950.0 * 0.80) = 2.5 — a cheap door whose customers repay it fast.",
      },
      {
        input:
          "channel paid_social — 5 customers bill 72000 cents across 12 customer-months (arpu 6000.0); three customers vanish before 2026-08-01; spend 400000",
        output: "paid_social · 5 · 6000.0 · 25.0 · 80000 · 19200 · 0.24 · 16.7",
        explanation:
          "churn = 3 / 12 = 25.0 percent; cac = 80000; ltv = 6000.0 * 0.80 / 0.25 = 19200 — a high CAC paired with a leaky bucket leaves ltv_to_cac at 0.24, the worst read in the report and the reason the row sorts last.",
      },
    ],
    constraints: [
      "all money is INTEGER cents (mrr_cents, spend_cents); cac_cents and ltv_cents ship as INTEGER; arpu_mrr is a REAL average of cents values (an AVG, engineered to exact decimals, so it does not carry the _cents suffix) and monthly_churn_pct, ltv_to_cac, payback_months are REAL rates",
      "PINNED arpu: arpu_mrr = AVG(mrr_cents) over the channel's mrr_snapshots rows — total billed divided by customer-months, one row per customer-month, computed as a plain AVG",
      "PINNED churn and formulas: the window's final month is MAX(month) over mrr_snapshots (2026-08-01 here); a churn transition = ONE per customer whose last subscribed month is earlier; monthly_churn_pct = 100.0 * churned / customer-months at risk (the channel's snapshot rows); cac_cents = ROUND(spend_cents * 1.0 / customers, 0); gross margin PINNED at 80.0 percent; ltv_cents = ROUND(arpu * 0.80 / (monthly_churn_pct / 100.0), 0) guarded to 0 when churn is 0 (no seeded channel triggers the guard); ltv_to_cac = ROUND(raw ltv / raw cac, 2) on the UNROUNDED ltv and cac; payback_months = ROUND(raw cac / (arpu * 0.80), 1)",
      "every channel in customers has exactly one channel_spend row and at least one churned transition; every customer's first subscribed month equals signup_month; ORDER BY ltv_to_cac DESC",
    ],
    primer: {
      hook: "Two numbers decide whether a growth channel gets next quarter's budget: what a customer costs to win, and what that customer is worth once won.",
      concept: [
        "Customer acquisition cost — CAC — is the spend a channel burned divided by the customers it delivered: 900 dollars of ads bringing 3 signups reads a 300 dollar CAC. It is the price tag on the front door. By itself it says nothing — 300 is cheap for an enterprise contract and ruinous for a five-dollar app — which is why CAC never travels alone.",
        "The worth side starts from ARPU, the average revenue the channel's customers actually bill per month: total billed divided by customer-months observed. Revenue is not profit, so the model applies a gross margin — the share of a bill left after delivering the service, pinned at 80.0 percent here — and multiplies it through: margin times ARPU is the monthly CONTRIBUTION each customer drops into the till. The customer-months denominator is doing quiet work: a customer who stays two months contributes two bills and two denominator units, so one large first invoice cannot flatter the average the way a per-customer read would allow.",
        "Customers do not stay forever, and churn is what prices that. A monthly churn rate of 5 percent means an average customer survives 1 / 0.05 = 20 months, so their lifetime contribution is the monthly contribution divided by the churn rate — margin times ARPU over churn. That quotient is LTV, lifetime value, and dividing it by CAC gives the ratio the whole industry argues about: a rough rule of thumb wants LTV at least 3 times CAC, and a reading under 1 means the channel destroys money on every signup.",
        "Payback months answers the cash-flow question the ratio hides: how many months of contribution until the CAC is repaid? CAC divided by monthly contribution — churn ignored, just how long the channel's money is out in the cold. A channel can clear LTV over CAC comfortably and still starve a young company if payback reads 24 months; another can look skinny on ratio and still win because it pays back in six weeks. The three numbers — CAC, the LTV ratio and payback — are one ladder read top to bottom.",
      ],
      worked: [
        "A channel spends 900 cents to win 3 customers, so CAC = 900 / 3 = 300.",
        "Those customers bill 120 cents a month on average and gross margin is 80 percent, so monthly contribution = 120 * 0.80 = 96.",
        "The channel's customers churn 8 percent a month, so an average customer lasts 1 / 0.08 = 12.5 months and LTV = 96 / 0.08 = 1200.",
        "LTV / CAC = 1200 / 300 = 4.0 — comfortably past the 3x rule of thumb.",
        "Payback = 300 / 96 = 3.1 months — the channel's money comes home before the next planning round.",
      ],
      glossary: [
        { term: "CAC", def: "acquisition spend divided by customers won — the price of one new customer" },
        { term: "ARPU", def: "average revenue per user per month — total billed divided by customer-months observed" },
        { term: "gross margin", def: "the share of a bill left after the cost of delivering the service, pinned at 80.0 percent here" },
        { term: "churn rate", def: "the share of customers vanishing per month — the decay rate every lifetime estimate divides by" },
        { term: "LTV", def: "lifetime value — margin-adjusted ARPU divided by the churn rate, what one customer is worth in contribution" },
        { term: "payback period", def: "months of contribution needed to repay the CAC, churn ignored" },
      ],
      reallife: [
        "Growth and finance read this table together every planning cycle: growth picks the channels to scale, finance checks the unit math survives the scale. Self-serve businesses watch payback months obsessively because they spend cash today for contracts that trickle in; product-led loops watch the LTV-to-CAC ratio per channel because organic traffic hides inside blended numbers. The classic board question — why did CAC double — is usually a mix shift answered by exactly this per-channel split.",
        "What breaks in practice: churn measured on too-short a window makes young customers look immortal and LTV explode, margin ignored turns gross revenue into phantom profit, and channels whose customers arrive on discounts need revenue normalized before the ARPU means anything. Attribution fights leak in too — a customer touched by three channels has one CAC to split and three teams claiming it. The decisions are real: killing a channel, doubling its budget or moving a save-desk team all trace back to one of these three numbers drifting.",
      ],
      where: "Growth analysts, finance business partners and performance marketers run it, and SQL screens at HubSpot and Canva hand candidates exactly this spend-against-billing shape.",
    },
    breakdown: [
      "The report is a ratio ladder climbed per channel: the bill side first (customers, arpu), the decay side second (churn percent), then three derived numbers — CAC, LTV and the two readings of their relationship. The pinned formulas keep each division honest: arpu is a plain AVG over the channel's snapshot rows (total billed over customer-months, engineered to exact decimals), the churn rate is transitions over customer-MONTHS at risk — not over customers, which overstates decay by the average customer's lifetime — and the 80.0 percent margin multiplies arpu BEFORE the churn division, because contribution per month is what decays, not revenue. The rungs answer different questions: CAC prices the door, LTV prices the customer against the churn clock, and payback deliberately ignores churn because it answers a cash-timing question — how long the channel's money is out — not a lifetime one.",
      "The churn definition is the subtlest piece. A customer is churned when their last subscribed month precedes the window's final month — they vanished before the data ended, so their disappearance is a real event, not a wait. Each such customer contributes exactly ONE churn transition, and the denominator is every observed customer-month of the channel: the pooled view. The organic channel's 1 churn over 20 customer-months reads 5.0 percent; counting the denominator as customers instead would read 20.0 percent and quarter the LTV — the pinned wrong-answer probe.",
      "Rounding discipline follows the house rule: raw values flow through every division and only the display columns round. cac_cents = ROUND(spend / customers, 0) and ltv_cents = ROUND(arpu * 0.80 / (churn_pct / 100.0), 0) display as integers; ltv_to_cac divides the UNROUNDED ltv by the UNROUNDED cac before its own ROUND(..., 2), and payback divides the raw CAC by the margin-adjusted arpu before ROUND(..., 1). The CASE guard on churn 0 exists because a division by a zero churn rate is infinite — no seeded channel triggers it, but a channel that never loses a customer would otherwise crash the report.",
    ],
    edges: [
      "Drop the margin from payback (cac / arpu instead of cac / (arpu * 0.80)) and payback_months reads 2.0 for organic, 9.7 for paid_search and 13.3 for paid_social instead of 2.5, 12.1 and 16.7 — contribution, not revenue, repays CAC; pinned.",
      "Divide churn transitions by CUSTOMERS instead of customer-months and churn reads 20.0, 25.0 and 60.0 percent instead of 5.0, 6.25 and 25.0 — feeding the wrong rate into the pinned LTV formula prints 19800, 33000 and 8000 instead of 79200, 132000 and 19200.",
      "Reorder the LTV arithmetic so the churn division runs first and the margin multiplies an already-rounded gross LTV — on this engineered seed every intermediate lands on an integer, so it happens to agree (79200, 132000, 19200); real billing data does not stay clean, which is why the pinned order multiplies the margin in BEFORE the division.",
      "Feed the churn PERCENT into the LTV formula without dividing by 100 and ltv collapses a hundredfold: 792, 1320 and 192 instead of 79200, 132000 and 19200 — the percent-versus-rate unit bug the /100.0 exists to stop.",
    ],
    ladder: [
      { title: "Brute force — one spreadsheet per channel", body: "For each channel list the customers, list their monthly bills, total them, count the months, count who vanished, then run the four divisions by hand. Fourteen customers is honest work; a product with thirty channels and eighteen months of bills is a script, and the script is one GROUP BY." },
      { title: "The pattern — one billed pass plus one churn pass", body: "billed GROUP BY channel computes customer_months and AVG(mrr) straight off the join; cust_span finds each customer's last month and churns counts the ones earlier than MAX(month); sizes counts customers from the customers table; channel_spend joins on channel. All four meet in one base CTE and the projection climbs the pinned formula ladder." },
      { title: "The optimal idea — raw until the display, one definition of churn", body: "O(C + R) over customers and snapshot rows. The durable rules: churn counts transitions over customer-months, the margin multiplies before the churn division, and every intermediate stays raw until its own display ROUND — reorder any of those and the numbers move." },
    ],
    approach: "GROUP BY channel for billed months and AVG, last-month churn transitions over customer-months, spend-over-customers CAC, margin-before-churn LTV with a zero guard, raw-then-round ratio ladder, ORDER BY ltv_to_cac DESC",
    schema: {
      ddl: `CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  channel      TEXT NOT NULL,
  signup_month TEXT NOT NULL         -- first subscribed month, 'YYYY-MM-01'
);
CREATE TABLE mrr_snapshots (
  customer_id INTEGER NOT NULL,
  month       TEXT NOT NULL,         -- subscribed month, 'YYYY-MM-01'
  mrr_cents   INTEGER NOT NULL,
  PRIMARY KEY (customer_id, month)
);
CREATE TABLE channel_spend (
  channel     TEXT PRIMARY KEY,
  spend_cents INTEGER NOT NULL
);`,
      seed: `-- Three channels, three unit-economics stories. Window: 2026-04-01 .. 2026-08-01.
-- organic: cheap door (spend 50000 over 5 customers = CAC 10000), 1 churn in
--   20 customer-months (5.0 percent) — the healthy benchmark.
-- paid_search: expensive door (spend 400000 over 4 customers = CAC 100000),
--   sticky customers, 1 churn in 16 customer-months (6.25 percent).
-- paid_social: expensive door (spend 400000 over 5 customers = CAC 80000),
--   leaky customers, 3 churns in 12 customer-months (25.0 percent).
-- ARPU engineered to exact decimals: 99000/20 = 4950.0, 165000/16 = 10312.5,
--   72000/12 = 6000.0.
INSERT INTO customers (customer_id, channel, signup_month) VALUES
  (501, 'organic',     '2026-04-01'), (502, 'organic',     '2026-04-01'),
  (503, 'organic',     '2026-05-01'), (504, 'organic',     '2026-05-01'),
  (505, 'organic',     '2026-06-01'),
  (601, 'paid_search', '2026-04-01'), (602, 'paid_search', '2026-04-01'),
  (603, 'paid_search', '2026-04-01'), (604, 'paid_search', '2026-07-01'),
  (701, 'paid_social', '2026-04-01'), (702, 'paid_social', '2026-04-01'),
  (703, 'paid_social', '2026-05-01'), (704, 'paid_social', '2026-06-01'),
  (705, 'paid_social', '2026-08-01');
INSERT INTO mrr_snapshots (customer_id, month, mrr_cents) VALUES
  -- organic: 20 customer-months, 99000 billed, customer 504 churns after 07
  (501, '2026-04-01', 4000), (501, '2026-05-01', 4000), (501, '2026-06-01', 4000),
  (501, '2026-07-01', 4000), (501, '2026-08-01', 4000),
  (502, '2026-04-01', 5000), (502, '2026-05-01', 5000), (502, '2026-06-01', 5000),
  (502, '2026-07-01', 5000), (502, '2026-08-01', 5000),
  (503, '2026-05-01', 6000), (503, '2026-06-01', 6000), (503, '2026-07-01', 6000),
  (503, '2026-08-01', 6000),
  (504, '2026-05-01', 3000), (504, '2026-06-01', 3000), (504, '2026-07-01', 3000),
  (505, '2026-06-01', 7000), (505, '2026-07-01', 7000), (505, '2026-08-01', 7000),
  -- paid_search: 16 customer-months, 165000 billed, customer 603 churns after 07
  (601, '2026-04-01',  9000), (601, '2026-05-01',  9000), (601, '2026-06-01',  9000),
  (601, '2026-07-01',  9000), (601, '2026-08-01',  9000),
  (602, '2026-04-01', 11000), (602, '2026-05-01', 11000), (602, '2026-06-01', 11000),
  (602, '2026-07-01', 11000), (602, '2026-08-01', 11000),
  (603, '2026-04-01', 10000), (603, '2026-05-01', 10000), (603, '2026-06-01', 10000),
  (603, '2026-07-01', 10000),
  (604, '2026-07-01', 12500), (604, '2026-08-01', 12500),
  -- paid_social: 12 customer-months, 72000 billed, customers 701-703 churn early
  (701, '2026-04-01', 6000), (701, '2026-05-01', 6000),
  (702, '2026-04-01', 4000), (702, '2026-05-01', 4000), (702, '2026-06-01', 4000),
  (703, '2026-05-01', 5000), (703, '2026-06-01', 5000), (703, '2026-07-01', 5000),
  (704, '2026-06-01', 8000), (704, '2026-07-01', 8000), (704, '2026-08-01', 8000),
  (705, '2026-08-01', 9000);
INSERT INTO channel_spend (channel, spend_cents) VALUES
  ('organic', 50000), ('paid_search', 400000), ('paid_social', 400000);`,
      tables: [
        { name: "customers", note: "14 customers across 3 channels — organic 5, paid_search 4 (sticky), paid_social 5 (leaky)" },
        { name: "mrr_snapshots", note: "48 rows of monthly bills, 2026-04-01 through 2026-08-01; the final month is the churn reference" },
        { name: "channel_spend", note: "3 rows — organic 50000, paid_search 400000, paid_social 400000" },
      ],
    },
    code: `WITH final_month AS (
    SELECT MAX(month) AS fm FROM mrr_snapshots   -- the window's last billed month
),
cust_span AS (
    -- each customer's final subscribed month
    SELECT s.customer_id, MAX(s.month) AS last_month
    FROM mrr_snapshots s
    GROUP BY s.customer_id
),
churns AS (
    -- a churn transition = ONE per customer gone before the window ended
    SELECT c.channel, COUNT(*) AS churned_n
    FROM customers c
    JOIN cust_span cs ON cs.customer_id = c.customer_id
    CROSS JOIN final_month f
    WHERE cs.last_month < f.fm
    GROUP BY c.channel
),
billed AS (
    -- customer-months at risk + the pinned plain-AVG arpu over snapshot rows
    SELECT c.channel, COUNT(*) AS customer_months, AVG(s.mrr_cents) AS arpu
    FROM customers c
    JOIN mrr_snapshots s ON s.customer_id = c.customer_id
    GROUP BY c.channel
),
sizes AS (
    SELECT channel, COUNT(*) AS customers FROM customers GROUP BY channel
),
base AS (
    SELECT b.channel, sz.customers, b.customer_months, b.arpu,
        COALESCE(ch.churned_n, 0) AS churned_n,
        100.0 * COALESCE(ch.churned_n, 0) / b.customer_months AS churn_pct
    FROM billed b
    JOIN sizes sz ON sz.channel = b.channel
    LEFT JOIN churns ch ON ch.channel = b.channel
)
SELECT
    b.channel,
    b.customers,
    b.arpu AS arpu_mrr,                  -- REAL average of cents values (plain AVG)
    b.churn_pct AS monthly_churn_pct,
    -- CAC displays as an INTEGER, and the divisions below keep the RAW quotient
    CAST(ROUND(sp.spend_cents * 1.0 / b.customers, 0) AS INTEGER) AS cac_cents,
    -- margin multiplies in BEFORE the churn division, guarding churn 0 (idle on this seed)
    CASE WHEN b.churn_pct = 0 THEN 0
         ELSE CAST(ROUND(b.arpu * 0.80 / (b.churn_pct / 100.0), 0) AS INTEGER) END AS ltv_cents,
    -- the ratio divides the RAW ltv by the RAW cac, rounding only for display
    ROUND(b.arpu * 0.80 / (b.churn_pct / 100.0) / (sp.spend_cents * 1.0 / b.customers), 2) AS ltv_to_cac,
    -- payback divides the RAW cac by the margin-adjusted arpu
    ROUND((sp.spend_cents * 1.0 / b.customers) / (b.arpu * 0.80), 1) AS payback_months
FROM base b
JOIN channel_spend sp ON sp.channel = b.channel
ORDER BY ltv_to_cac DESC;`,
    walkthrough: [
      "billed aggregates the join of customers to snapshots per channel: organic bills 99000 over 20 customer-months for arpu 4950.0, paid_search bills 165000 over 16 for 10312.5 and paid_social bills 72000 over 12 for 6000.0 — every quotient engineered to an exact decimal. cust_span finds each customer's last month and churns keeps the ones earlier than 2026-08-01: one apiece for organic (customer 504) and paid_search (customer 603), three for paid_social (customers 701, 702 and 703). Customer 705 is the window's edge case: signed 2026-08-01 and billed only in the final month, their one row counts inside paid_social's 12 customer-months while their last month equals the window end, so they can never churn before the data stops.",
      "The base CTE assembles churn_pct = 100.0 * churned / customer_months: 5.0, 6.25 and 25.0, all exact. The projection then climbs the ladder per channel: cac = 50000 / 5 = 10000 for organic, 400000 / 4 = 100000 for paid_search and 400000 / 5 = 80000 for paid_social; ltv multiplies the margin in before dividing by the churn rate — 4950.0 * 0.80 = 3960 over 0.05 = 79200, 10312.5 * 0.80 = 8250 over 0.0625 = 132000, 6000.0 * 0.80 = 4800 over 0.25 = 19200 — and the zero guard sits idle because every channel churns at least one transition. The engineered decimals pay off at the churn division: 3960 over 0.05 reads 79200, 8250 over 0.0625 reads 132000 and 4800 over 0.25 reads 19200, so the CASE guard and the display ROUND are formatting, not rescue, on this seed.",
      "The last two columns divide RAW values: ltv_to_cac = 79200 / 10000 = 7.92, 132000 / 100000 = 1.32 and 19200 / 80000 = 0.24, and payback = 10000 / 3960 = 2.5252... to 2.5, 100000 / 8250 = 12.1212... to 12.1 and 80000 / 4800 = 16.666... to 16.7. The engine ships three rows ordered by the ratio: organic first (cheap door, decent retention), paid_search second (expensive door, sticky customers, still past 1) and paid_social last (expensive door AND a leaky bucket — the 0.24 the board asks about).",
    ],
    time: "O(C + R) over the C customers and R snapshot rows — one grouped billed pass, one churn pass, one join to spend",
    space: "O(N) — the per-customer span CTE holds one row per customer",
    followUps: [
      "Cohort the whole ladder by signup month instead of channel — does the paid_social bleed concentrate in one month's arrivals, and what would a per-cohort payback curve say about seasonality?",
      "Blend the channels into one company-wide row and compare the blended LTV-to-CAC with the per-channel spread — how badly does the blend hide the paid_social bleed, and which channel would you defund first?",
    ],
    related: ["vintage-default-curves", "expected-credit-loss", "loan-amortization-schedule"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "winback-recovery",
    statement:
      "Winback analysis asks the retention team's favorite question: of the customers who cancelled, how many came back — and how fast? Two tables drive it: churn_events logs one row per cancellation (churn_id, customer_id, churn_date, cancel_reason, mrr_cents — the monthly revenue the customer paid when they left) and resubscriptions holds at most one row per customer (resub_id, customer_id, resub_date). Per cancel_reason report cancel_reason, churned_customers = the count of churn EVENTS (a customer with two cancellations under different reasons appears twice, once per reason), recovered = events whose customer has a resub_date inside [churn_date, churn_date + 90 days] INCLUSIVE (day 90 counts, day 91 does not), recovery_pct = ROUND(100.0 * recovered / churned, 2) and avg_days_to_return = ROUND(AVG of the day gap, 1) over RECOVERED events only, 0.0 when none recovered. Reasons with churns but zero recoveries still report, and rows are ordered by churned_customers DESC then cancel_reason ASC.",
    examples: [
      {
        input:
          "cancel_reason price — 4 churn events; customers 302, 303 and 801 return after 39, 90 and 50 days (303's resub lands exactly on day 90), customer 301 never returns",
        output: "price · 4 · 3 · 75.0 · 59.7",
        explanation:
          "recovery = 3 of 4 = 75.0 percent; the day-90 boundary return counts because the window is inclusive, and the average gap (39 + 90 + 50) / 3 = 59.7 reads over recovered events only.",
      },
      {
        input: "cancel_reason switching — 3 churn events, no customer ever resubscribes",
        output: "switching · 3 · 0 · 0.0 · 0.0",
        explanation:
          "a reason with churns but zero recoveries still reports — recovery_pct and avg_days_to_return print 0.0 through the COALESCE guard, and the row is never dropped.",
      },
    ],
    constraints: [
      "dates are 'YYYY-MM-DD' TEXT; day gaps are julianday(resub_date) - julianday(churn_date); mrr_cents in churn_events is INTEGER cents — the schema's only money column; churned_customers and recovered are INTEGER; recovery_pct and avg_days_to_return are the only REALs in the output",
      "PINNED window: a resub recovers its churn event when resub_date >= churn_date AND resub_date <= date(churn_date, '+90 day') — the day-90 boundary counts, day 91 does not; the seed guarantees at most ONE resub row per customer, so a churn event matches at most one resub",
      "PINNED grain: the report grades churn EVENTS, not customers — customer 801 appears under price (recovered) and again under bugs (their single resub precedes the bugs churn, so it recovers nothing); avg_days_to_return = ROUND(COALESCE(AVG(gap), 0.0), 1) over recovered events only",
      "every cancel_reason with at least one churn event reports, including zero-recovery reasons at 0.0 and 0.0; ORDER BY churned_customers DESC, cancel_reason ASC",
    ],
    primer: {
      hook: "Churned does not always mean gone — winback is the scoreboard for winning customers back, and cancel reasons decide which save-offer gets funded.",
      concept: [
        "Cancellations feel final, but subscription data says otherwise: a meaningful slice of churned customers returns within weeks. Winback analysis treats a cancellation not as an exit but as the START of a countdown — if the customer resubscribes within a pinned window, here 90 days, the winback team counts a recovery. The recovery rate per cancel reason tells the team which reasons are moods (reversible) and which are verdicts (permanent).",
        "The cancel reason is the segmentation that makes the number actionable. Price churners often return when a promotion lands; missing-features churners return when the roadmap ships the thing they left for; switching churners — the ones who adopted a competitor — almost never come back. Averaged together these reasons blur into one useless percentage; split by reason, the table becomes a budget that says where a save-offer email, a discount or a call from support pays for itself.",
        "The window is the second design decision. Too short and you miss slow reconsiderations; too long and you are counting customers who were always going to wander back, crediting the team for luck. Ninety days inclusive is the pinned convention here — a resub on day 90 counts, day 91 does not — and that boundary is exactly the kind of off-by-one that separates a passing query from a failing one.",
        "One more wrinkle: customers can cancel more than once. A customer who leaves over price, returns, and later leaves over bugs has TWO churn events, and each is graded on its own merits against its own reason. That per-event grain — not per-customer — keeps the reason table honest, because the price churn that was recovered and the bugs churn that was not are different stories.",
      ],
      worked: [
        "One cancel reason logs 5 churn events this quarter.",
        "Two customers resubscribe inside 90 days — on day 12 and day 87; a third comes back on day 95, outside the window.",
        "Recovered = 2, churned = 5, so recovery_pct = 100.0 * 2 / 5 = 40.0.",
        "avg_days_to_return = ROUND((12 + 87) / 2, 1) = 49.5 — the day-95 return is excluded from the average because it is excluded from the count.",
        "The team compares that 40.0 against the same reason last quarter and against the other reasons before deciding whether the save-offer budget grows.",
      ],
      glossary: [
        { term: "winback", def: "a churned customer resubscribing within the pinned recovery window" },
        { term: "cancel reason", def: "the logged cause of a cancellation — the segmentation every winback rate is read against" },
        { term: "recovery window", def: "the pinned stretch after a churn in which a resub counts, 90 days inclusive here" },
        { term: "recovery rate", def: "recovered events over churned events per reason" },
        { term: "days to return", def: "the gap in days between a churn and its resub, averaged over recovered events" },
        { term: "save offer", def: "the discount, plan change or outreach a retention team sends to win a churned customer back" },
      ],
      reallife: [
        "Lifecycle and retention teams at subscription businesses — Spotify watching premium cancellations, Duolingo watching lapsed learners — run winback reporting weekly, and the cancel-reason split comes straight off the cancellation flow's survey. The table decides save-desk staffing, which discount tier a reason earns, and whether a product fix ships ahead of a re-engagement campaign; finance reads the same table as recovered MRR, revenue that never left on paper but very much left in cash. The cadence matters as well: winback cohorts decay fast, so the same reason can read 40 percent one quarter and 15 the next, and teams pin a rolling window rather than a calendar quarter before they compare anything.",
        "What breaks in practice: matching a resub to the WRONG churn event when a customer has cancelled more than once, windows implemented exclusive on the last day so boundary recoveries vanish, and reasons collected with an other bucket so large it hides the real story. The failure mode is silent — a dropped boundary day shaves the recovery rate a point or two, no query errors, and the save-offer that deserved the budget does not get it. Survey fatigue feeds the mess too — customers tick the first angry option or skip the flow entirely, so cancel reasons are a self-reported sample rather than a census, and the table is read as a direction with error bars, not a ledger of exact causes.",
      ],
      where: "Retention, lifecycle and CRM analytics teams own it, and SQL interviews at Spotify and Duolingo hand candidates exactly this churn-and-return shape.",
    },
    breakdown: [
      "The report's grain is the churn EVENT, and every definition downstream inherits it. churned_customers counts churn_events rows per reason — customer 801 legitimately appears under price and under bugs. recovered counts the events whose customer's resub row lands inside the pinned window: resub_date >= churn_date AND resub_date <= date(churn_date, '+90 day'). Both guards matter — the lower bound rejects the back-dated resub (customer 801's April return cannot recover their June bugs churn), the upper bound rejects the day-91 return — and because the seed guarantees at most one resub per customer, the join multiplies nothing.",
      "The join that implements it is a LEFT JOIN with the window conditions in the ON clause, not the WHERE: a WHERE filter would turn the outer join into an inner one after the fact and silently delete every zero-recovery reason — the switching row with its 0.0 and 0.0 would vanish and the report would ship 3 rows instead of 4. Inside the matched rows, COUNT(resub_date) counts non-NULL resubs as recovered, COUNT(*) counts the churn events, and their ratio is the recovery percent; AVG(gap) ignores NULLs by definition, so it averages recovered events only, and COALESCE pins the empty case to 0.0. The COUNT split is the quiet hero: COUNT(*) fires on every churn event even when the LEFT JOIN delivered NULL, while COUNT(resub_date) fires only when a real in-window resub replaced that NULL, so one grouped pass yields both the denominator and the numerator without a second scan.",
      "Day arithmetic runs on julianday(resub_date) - julianday(churn_date), which counts calendar-day gaps exactly — 2026-03-10 to 2026-06-08 reads 90, the boundary that must count. The upper bound is expressed as date(churn_date, '+90 day') rather than a day-count comparison, keeping the window in date land where the inclusive <= reads naturally. Ordering is a two-key contract: churned_customers DESC first, then cancel_reason ASC to break the ties — missing_features before price at 4 events, bugs before switching at 3 — so the row order is deterministic, not collational luck.",
    ],
    edges: [
      "Make the window exclusive on day 90 (resub_date < date(churn_date, '+90 day')) and customer 303's boundary return drops: price reads 2 recovered, 50.0 and 44.5 instead of 3, 75.0 and 59.7 — the pinned off-by-one.",
      "Drop the upper bound (any resub after the churn counts) and customer 304's day-91 return recovers: missing_features reads 3 recovered, 75.0 and 57.3 instead of 2, 50.0 and 40.5.",
      "Join with INNER JOIN instead of LEFT JOIN and the zero-recovery reasons disappear: the report ships 3 rows instead of 4, switching is gone, and every surviving reason reads a lying 100.0 because only recovered events survived the join.",
      "Match resubs on customer_id alone without the window guards and the back-dated resub strikes: bugs reads 2 recovered, 66.67 and a NEGATIVE -15.5 average (customer 801's April resub sits 80 days BEFORE their June churn), and missing_features inflates to 75.0 with the day-91 return.",
    ],
    ladder: [
      { title: "Brute force — pair the lists by hand", body: "Print the churn events, print the resubs, and for each event check the same customer's resub against the 90-day window with a calendar, then bucket by reason and average the gaps. Fourteen events is tedious; a year of churn is a query, and the window check is the part worth automating." },
      { title: "The pattern — LEFT JOIN with the window in ON, then one grouped pass", body: "LEFT JOIN resubscriptions onto churn_events with the date guards inside ON; GROUP BY cancel_reason; COUNT(*) churned, COUNT(resub_date) recovered, ROUND the scaled ratio, ROUND the COALESCEd average. Zero-recovery reasons survive as NULL rows and grade 0.0." },
      { title: "The optimal idea — grade events, guard both window edges, keep the zeros", body: "O(E + R) over events and resubs. The durable rules: the event is the grain, the window is inclusive on both ends, a resub can never precede its churn, and a reason with no recoveries is a row, not an absence." },
    ],
    approach: "LEFT JOIN resubs with [churn_date, date(churn_date, '+90 day')] in ON, GROUP BY cancel_reason, COUNT(resub_date) recovered over COUNT(*), julianday gaps averaged over recovered with COALESCE 0.0, two-key ORDER BY",
    schema: {
      ddl: `CREATE TABLE churn_events (
  churn_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  churn_date    TEXT NOT NULL,       -- 'YYYY-MM-DD'
  cancel_reason TEXT NOT NULL,
  mrr_cents     INTEGER NOT NULL     -- monthly revenue the customer paid at cancellation
);
CREATE TABLE resubscriptions (
  resub_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,      -- at most one row per customer (pinned)
  resub_date  TEXT NOT NULL          -- 'YYYY-MM-DD'
);`,
      seed: `-- Four cancel reasons, 14 churn events, 7 resubs (at most one per customer).
-- price: 3 of 4 recover (day 39, day 90 boundary — counts, day 50).
-- missing_features: 2 of 4 recover (day 30, day 51), the day-91 return does NOT.
-- bugs: 1 of 3 recovers, and customer 801's second churn postdates their only resub.
-- switching: 0 of 3 recover — the zero-recovery row that must still report.
INSERT INTO churn_events (churn_id, customer_id, churn_date, cancel_reason, mrr_cents) VALUES
  (1,  301, '2026-01-15', 'price',             9900), -- never returns
  (2,  302, '2026-02-01', 'price',            12000), -- returns 2026-03-12 (day 39)
  (3,  303, '2026-03-10', 'price',             8000), -- returns 2026-06-08 (day 90 boundary, counts)
  (4,  801, '2026-02-10', 'price',            15000), -- multi-churn customer, returns 2026-04-01 (day 50)
  (5,  304, '2026-01-20', 'missing_features',  7000), -- returns 2026-04-21 (day 91, does NOT count)
  (6,  305, '2026-02-14', 'missing_features',  9900), -- returns 2026-03-16 (day 30)
  (7,  306, '2026-05-05', 'missing_features', 12000), -- returns 2026-06-25 (day 51)
  (8,  307, '2026-04-02', 'missing_features',  4900), -- never returns
  (9,  308, '2026-03-22', 'bugs',              9900), -- returns 2026-05-10 (day 49)
  (10, 309, '2026-06-30', 'bugs',              4900), -- never returns
  (11, 801, '2026-06-20', 'bugs',             12900), -- their single resub PRECEDES this churn
  (12, 311, '2026-02-25', 'switching',         9900), -- zero-recovery reason
  (13, 312, '2026-05-09', 'switching',        14900),
  (14, 313, '2026-08-14', 'switching',         9900);
INSERT INTO resubscriptions (resub_id, customer_id, resub_date) VALUES
  (1, 302, '2026-03-12'),
  (2, 303, '2026-06-08'),
  (3, 304, '2026-04-21'),
  (4, 305, '2026-03-16'),
  (5, 306, '2026-06-25'),
  (6, 308, '2026-05-10'),
  (7, 801, '2026-04-01');`,
      tables: [
        { name: "churn_events", note: "14 churn events across 4 reasons; customer 801 appears twice (price and bugs); mrr_cents carries the monthly revenue each churner was paying — the recovered-MRR view finance reads" },
        { name: "resubscriptions", note: "7 resubs, at most one per customer — one on day 90 (counts), one on day 91 (does not), one preceding its owner's second churn" },
      ],
    },
    code: `SELECT
    ce.cancel_reason,
    COUNT(*) AS churned_customers,             -- every churn EVENT reports
    COUNT(r.resub_date) AS recovered,          -- non-NULL only when a resub landed in-window
    ROUND(100.0 * COUNT(r.resub_date) / COUNT(*), 2) AS recovery_pct,
    -- the average runs over RECOVERED events only, with AVG ignoring NULLs and COALESCE pinning 0.0
    ROUND(COALESCE(AVG(julianday(r.resub_date) - julianday(ce.churn_date)), 0.0), 1) AS avg_days_to_return
FROM churn_events ce
LEFT JOIN resubscriptions r
    ON r.customer_id = ce.customer_id                  -- at most one resub per customer (pinned)
   AND r.resub_date >= ce.churn_date                   -- a resub cannot precede its churn
   AND r.resub_date <= date(ce.churn_date, '+90 day')  -- INCLUSIVE: day 90 counts, day 91 does not
GROUP BY ce.cancel_reason
ORDER BY churned_customers DESC, cancel_reason ASC;`,
    walkthrough: [
      "The LEFT JOIN pairs every churn event with its customer's resub row and keeps the pair only when the resub sits in [churn_date, churn_date + 90 days]. Price's four events: customer 301 has no resub (NULL row), 302's gap reads 39, 303's reads exactly 90 — inside, because the upper bound is <= — and 801's April resub is 50 days after their February churn, inside. Missing_features: 304's April 21 resub is 91 days out and fails the upper bound (NULL), 305 reads 30 and 306 reads 51. Bugs: 308 reads 49, while 801's second churn (June 20) sits 80 days AFTER their resub, so the lower bound rejects it.",
      "The grouped pass turns those matches into the report: price counts 4 events and 3 recovered for 100.0 * 3 / 4 = 75.0 with an average of (39 + 90 + 50) / 3 = 59.666... to 59.7; missing_features counts 4 and 2 for 50.0 with (30 + 51) / 2 = 40.5; bugs counts 3 and 1 for 33.333... to 33.33 with 49.0; switching counts 3 and 0 — every gap NULL, AVG returns NULL, COALESCE pins 0.0.",
      "ORDER BY churned_customers DESC, cancel_reason ASC lines the ties up deterministically: missing_features before price at 4 events, bugs before switching at 3. The engine ships four rows — (missing_features, 4, 2, 50.0, 40.5), (price, 4, 3, 75.0, 59.7), (bugs, 3, 1, 33.33, 49.0) and (switching, 3, 0, 0.0, 0.0) — and the zero-recovery row is a row precisely because the window guards live in the ON clause of a LEFT JOIN. The averages reward a second read: price's 59.7 sits high because the day-90 boundary return drags it up, while missing_features returns its two customers in 30 and 51 days for a 40.5, so the table is read column against column — rate first, speed second — before any save-offer budget moves.",
    ],
    time: "O(E + R) over the E churn events and R resub rows — one keyed join plus one grouped pass",
    space: "O(E) — the joined stream holds at most one resub match per event",
    followUps: [
      "Rank the reasons by recovered MRR instead of event count — weight each recovered event by the churned mrr_cents it left behind and ask which reason's save-offer earns the most money, not the most customers.",
      "Bucket days-to-return into 0-7, 8-30 and 31-90 per reason — which reason comes back fastest, and would you send the same save-offer to a day-2 returner and a day-89 returner?",
    ],
    related: ["dormant-reactivation", "week-over-week-churn", "growth-accounting"],
    order: "exact",
    xp: 35,
  },
];
