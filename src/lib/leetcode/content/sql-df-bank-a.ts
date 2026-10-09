// Deep-dives — Data & Finance batch 3, banking set A: vintage default curves,
// delinquency roll rates and credit utilization bands (3 problems: 1 Medium,
// 1 Hard, 1 Easy, all order:"exact" reads). Every money column is INTEGER
// cents with the _cents suffix; REAL is reserved for rates and percentages.
// Own tables, own seeds, original phrasing — never copied problem text.
// NEW in batch 3: every dive carries a domain primer (LcPrimer) that teaches
// the finance concept from zero, before any SQL.
// Registry wiring (lead): 8025 vintage-default-curves ·
// 8026 delinquency-roll-rates · 8027 credit-utilization-bands.
import type { LcSqlDive } from "../types";

export const SQL_DF_BANK_A: LcSqlDive[] = [
  {
    slug: "vintage-default-curves",
    statement:
      "The loans table holds one row per loan: (loan_id, origination_month, principal_cents), and perf holds one row per loan per month-on-book — mob 1 through 6, the early-vintage window — where is_default reads 0 while the loan is current and 1 from the month it defaults onward, never returning to 0. Lenders read credit risk by vintage: all loans originated in the same month form a cohort, and the share of that cohort which has EVER defaulted is tracked mob by mob. For every origination month and every mob from 1 to 6, report the columns origination_month, mob, cohort_loans (the cohort's loan count taken from loans), defaults_so_far (how many DISTINCT loans in the cohort have defaulted by the end of that mob) and cum_default_pct, that share rounded to 2 decimal places. Order by origination_month ascending, then mob ascending.",
    examples: [
      {
        input: "the 2026-01 cohort reaches mob 3 — loan 1's is_default flips to 1 this month and stays 1",
        output: "2026-01 · 3 · 4 · 1 · 25.0",
        explanation:
          "defaults_so_far counts loans that have EVER defaulted: 1 of the cohort's 4 loans, so 100.0 * 1 / 4 rounds to 25.0 — and the curve can never fall below that again.",
      },
      {
        input: "the mob 6 final of each cohort",
        output: "2026-01 · 6 · 4 · 2 · 50.0, then 2026-02 · 6 · 4 · 1 · 25.0, then 2026-03 · 6 · 4 · 0 · 0.0",
        explanation:
          "Loan 2 joined loan 1 in default at mob 5, lifting 2026-01 to 2 of 4; 2026-02 took its first and only default at mob 6; 2026-03 stayed clean for all six months.",
      },
    ],
    constraints: [
      "defaults_so_far counts DISTINCT loans whose is_default has ever read 1 by the end of mob m — the flag persists, so a loan that defaulted at mob 3 still counts at mobs 4, 5 and 6",
      "cum_default_pct = ROUND(100.0 * defaults_so_far / cohort_loans, 2), where cohort_loans comes from the loans table (4 per cohort here) — never from the 12-loan book total and never from perf row counts",
      "every cohort reports all six mobs 1..6, including 2026-03, which reads 0.0 across the board",
      "the seed guarantees every loan carries all six perf rows (12 x 6 = 72), so a mob spine or cohort size derived from the data stays complete — ORDER BY origination_month ASC, mob ASC",
    ],
    primer: {
      hook:
        "A vintage curve is how a lender learns whether the loans it made in a given month were any good — before the damage spreads.",
      concept: [
        "Lenders rarely judge loans one at a time; they judge them by the month they were made. A vintage is all the loans originated — approved and funded — in one calendar month, treated as a single group that moves through time together. The wine analogy is exact: grapes from one harvest share the same weather, and loans from one month share the same economic weather — the interest rates, the underwriting rules and the job market that prevailed when they were signed. Comparing vintages therefore isolates the quality of each month's lending decisions from everything the world did afterwards.",
        "Every loan has an age measured in months-on-book, usually written mob: mob 1 is the loan's first month of life, mob 2 its second, and so on. A loan defaults when it hits the lender's formal trigger for will-not-repay — most commonly 90 days past due, three missed monthly payments. In the data the default is a flag that persists: 0 while the loan is current, 1 from its default month onward, never returning to 0 even if the lender later recovers some money. That persistence is what makes a cumulative curve countable.",
        "The vintage curve plots, for each mob, the share of the cohort that has EVER defaulted by then. It can rise or stay flat but never fall — a cumulative count divided by a fixed cohort size. Credit teams read the earliest stretch hardest: loans that are going to fail mostly fail young, so the first six months-on-book of a curve predict much of the year. When one month's curve sits above its neighbours, underwriting loosened that month, and the curve is the receipt.",
        "Two bookkeeping rules keep the numbers honest. The denominator is the cohort's own loan count — never the whole book — so one month's curve cannot be diluted by how many other loans happened to exist. And the numerator counts distinct loans that have ever defaulted, not the raw rows a persistent flag leaves behind: a loan defaulted since mob 3 contributes one defaulted loan at mob 6, not four rows.",
      ],
      worked: [
        "Take a tiny cohort of 4 loans and watch mobs 1 through 4: loan A defaults at mob 2, loan B at mob 4, and the other two never do.",
        "Mob 1: nobody has defaulted, so the running count is 0 of 4 and the curve reads 0.0.",
        "Mob 2: A's flag flips to 1 — the count becomes 1 of 4 and the curve steps up to 25.0.",
        "Mob 3: nothing new happens, but A still counts — the curve stays 25.0, flat, because a cumulative count never falls.",
        "Mob 4: B flips, the count reaches 2 of 4 and the curve reads 50.0 — the shape 0.0, 25.0, 25.0, 50.0 is the whole report.",
      ],
      glossary: [
        { term: "vintage", def: "every loan originated in the same calendar month, tracked as one group" },
        { term: "origination", def: "the moment a loan is approved, funded and starts its life" },
        { term: "months-on-book", def: "a loan's age counted in whole months since origination" },
        { term: "default", def: "the lender's formal will-not-repay trigger, typically 90 days past due" },
        { term: "cumulative default rate", def: "the share of a cohort that has ever defaulted by a given month" },
        { term: "cohort", def: "a group of loans or customers followed forward from a shared start" },
      ],
      reallife: [
        "A consumer lender's credit-risk team runs vintage reviews every month, usually owned by the credit policy or portfolio risk group. The pack goes to a credit committee: one page per origination month, each curve overlaid on the cohorts before it. A cohort bending upward early triggers questions — which channel fed it, which rule was relaxed, which scorecard version priced it. The same curves feed the allowance models that decide how much loss the bank must hold reserves against.",
        "What breaks in practice: data pipelines that drop perf rows make cohorts look smaller or curves vanish at the tail, a default definition that changes mid-year (60-day instead of 90-day) puts a cliff into every curve at the changeover, and loans that prepay never default but also never finish the story. Prepaid loans are therefore usually excluded or flagged before the curves are drawn. The numbers drive real decisions — tightening approval rules, repricing a channel, pausing a partner — and committees distrust pretty charts, asking for the SQL behind every curve.",
      ],
      where:
        "Credit-risk and credit-policy analytics interviews at consumer lenders and card issuers — SoFi, Capital One, Synchrony, Upstart, Chime — lean on vintage-curve questions for risk and credit-policy roles.",
    },
    breakdown: [
      "The ask is a per-cohort curve, and a curve needs exactly two ingredients: how many loans the cohort contains and in which month each default landed. The perf flag persists — a loan that flips to 1 at mob 3 stays 1 through mob 6 — so 'has defaulted by the end of mob m' reduces to 'the first flag month is at most m'. That collapses the whole problem into one small aggregate: each loan's first default month, MIN(mob) over its flag = 1 rows. Everything after that is bookkeeping: count the loans whose first default month is m, then let a running sum carry the count forward inside the cohort.",
      "The classic missteps all bend the curve. Counting only the loans that defaulted IN month m — the mob-exact reading — sawtooths the line: the 2026-01 cohort reads 25.0 at mob 3, 0.0 at mob 4, 25.0 at mob 5, where the contract wants the cumulative 25.0 / 25.0 / 50.0 / 50.0. Dividing by the 12-loan book total instead of the cohort's own 4 shrinks every cell, turning the 50.0 final into 16.67. And counting flag rows instead of DISTINCT loans is the silent killer: loan 1 carries four is_default = 1 rows (mobs 3 through 6), so a per-month count of flag rows accumulates to 6 defaulted loans in a 4-loan cohort — 150.0, a number no credit committee would survive.",
      "The engine reads like the recipe. first_default reduces 72 perf rows to the three that ever defaulted, recording each loan's first flag month; new_defaults folds those into one row per (origination_month, mob) cell. cohort_sizes takes the denominator straight from the loans table — not from perf — and the main query CROSS JOINs every cohort against the six mob values, LEFT JOINs the new-default cells on (COALESCE keeps a no-default month at 0), and lets SUM() OVER (PARTITION BY origination_month ORDER BY mob) run the cumulative count. One ROUND at the end turns each running count into its percentage.",
    ],
    edges: [
      "Reading the curve as mob-exact defaults produces a sawtooth — 2026-01 reads 25.0 / 0.0 / 25.0 / 0.0 across mobs 3-6 where the contract wants 25.0 / 25.0 / 50.0 / 50.0; cumulativity is the definition, not a display choice.",
      "The denominator is the cohort's own size: dividing defaults_so_far by the book total of 12 hands the 2026-01 final as 16.67 instead of 50.0, and worse, makes every cohort's curve depend on how many OTHER cohorts happen to exist.",
      "A count of flag rows is not a count of defaulted loans — loan 1 owns four is_default = 1 rows (mobs 3-6) and loan 2 owns two, so per-month flag-row counts accumulate to 6 in a 4-loan cohort (150.0); take MIN(mob) per loan first, then count loans.",
      "The every-loan-has-all-6-rows constraint is load-bearing: a solution that derives cohort sizes or the mob spine from perf silently drifts when a loan loses rows — delete loan 3's six perf rows and the perf-derived cohort size for 2026-01 reads 3 while the loans-derived contract still reads 4.",
    ],
    ladder: [
      { title: "Brute force — walk each cohort by hand", body: "Sort the cohort's loans, flip through mobs 1 to 6, tally the loans whose flag has ever read 1, divide by four. Twelve loans is manageable; a real book of thousands is not, and the hand walk hides the reusable shape." },
      { title: "The pattern — first default, then running sum", body: "MIN(mob) WHERE is_default = 1 finds each defaulting loan's first flag month. GROUP BY cohort and mob counts the new defaults per cell, and SUM() OVER (PARTITION BY origination_month ORDER BY mob) accumulates them across the 1-to-6 spine joined to loan-derived cohort sizes." },
      { title: "The optimal idea — the curve is one pass", body: "O(P) over the P perf rows plus the C x 6 curve cells. The durable judgments: ever-defaulted-by-m reduces to MIN(mob), cumulative means a windowed running sum — never a self-join per mob — and denominators come from the entity table, not the event table." },
    ],
    approach: "MIN(mob) per defaulted loan, count new defaults per cohort and mob, then SUM() OVER (PARTITION BY origination_month ORDER BY mob) over the 1..6 spine joined to loan-derived cohort sizes",
    schema: {
      ddl: `CREATE TABLE loans (
  loan_id           INTEGER PRIMARY KEY,
  origination_month TEXT NOT NULL,    -- 'YYYY-MM' cohort key
  principal_cents   INTEGER NOT NULL
);

CREATE TABLE perf (
  loan_id     INTEGER NOT NULL,
  mob         INTEGER NOT NULL,       -- months on book, 1..6
  is_default  INTEGER NOT NULL,       -- 0 current · 1 defaulted, persists
  PRIMARY KEY (loan_id, mob)
);`,
      seed: `-- 3 origination cohorts x 4 loans · defaults: 2026-01 loan 1 at mob 3,
-- 2026-01 loan 2 at mob 5, 2026-02 loan 5 at mob 6 · 2026-03 stays clean
INSERT INTO loans (loan_id, origination_month, principal_cents) VALUES
  (1,  '2026-01', 250000),
  (2,  '2026-01', 180000),
  (3,  '2026-01', 320000),
  (4,  '2026-01', 150000),
  (5,  '2026-02', 400000),
  (6,  '2026-02', 210000),
  (7,  '2026-02', 175000),
  (8,  '2026-02', 295000),
  (9,  '2026-03', 130000),
  (10, '2026-03', 360000),
  (11, '2026-03', 205000),
  (12, '2026-03', 285000);

-- is_default persists: 0 while current, 1 from the default mob through mob 6
INSERT INTO perf (loan_id, mob, is_default) VALUES
  (1, 1, 0), (1, 2, 0), (1, 3, 1), (1, 4, 1), (1, 5, 1), (1, 6, 1),
  (2, 1, 0), (2, 2, 0), (2, 3, 0), (2, 4, 0), (2, 5, 1), (2, 6, 1),
  (3, 1, 0), (3, 2, 0), (3, 3, 0), (3, 4, 0), (3, 5, 0), (3, 6, 0),
  (4, 1, 0), (4, 2, 0), (4, 3, 0), (4, 4, 0), (4, 5, 0), (4, 6, 0),
  (5, 1, 0), (5, 2, 0), (5, 3, 0), (5, 4, 0), (5, 5, 0), (5, 6, 1),
  (6, 1, 0), (6, 2, 0), (6, 3, 0), (6, 4, 0), (6, 5, 0), (6, 6, 0),
  (7, 1, 0), (7, 2, 0), (7, 3, 0), (7, 4, 0), (7, 5, 0), (7, 6, 0),
  (8, 1, 0), (8, 2, 0), (8, 3, 0), (8, 4, 0), (8, 5, 0), (8, 6, 0),
  (9, 1, 0), (9, 2, 0), (9, 3, 0), (9, 4, 0), (9, 5, 0), (9, 6, 0),
  (10, 1, 0), (10, 2, 0), (10, 3, 0), (10, 4, 0), (10, 5, 0), (10, 6, 0),
  (11, 1, 0), (11, 2, 0), (11, 3, 0), (11, 4, 0), (11, 5, 0), (11, 6, 0),
  (12, 1, 0), (12, 2, 0), (12, 3, 0), (12, 4, 0), (12, 5, 0), (12, 6, 0);`,
      tables: [
        { name: "loans", note: "12 loans across 3 origination cohorts (2026-01, 2026-02, 2026-03), 4 loans each, principals varied" },
        { name: "perf", note: "72 rows — every loan carries mobs 1..6; defaults land at 2026-01 loan 1 mob 3, loan 2 mob 5, 2026-02 loan 5 mob 6" },
      ],
    },
    code: `WITH cohort_sizes AS (
    -- the denominator: the cohort's own loan count, from the loans table
    SELECT
        origination_month,
        COUNT(*) AS cohort_loans
    FROM loans
    GROUP BY origination_month
),
first_default AS (
    -- a loan's default mob is the FIRST month its flag reads 1
    SELECT
        loan_id,
        MIN(mob) AS default_mob
    FROM perf
    WHERE is_default = 1
    GROUP BY loan_id
),
new_defaults AS (
    -- new defaults landing in each (cohort, mob) cell: at most one row per cell
    SELECT
        l.origination_month,
        fd.default_mob AS mob,
        COUNT(*) AS new_defaults
    FROM first_default fd
    JOIN loans l ON l.loan_id = fd.loan_id
    GROUP BY l.origination_month, fd.default_mob
),
curved AS (
    -- every cohort x mob cell, defaults carried forward within the cohort
    SELECT
        cs.origination_month,
        m.mob,
        cs.cohort_loans,
        SUM(COALESCE(nd.new_defaults, 0)) OVER (
            PARTITION BY cs.origination_month ORDER BY m.mob
        ) AS defaults_so_far
    FROM cohort_sizes cs
    CROSS JOIN (SELECT DISTINCT mob FROM perf) m
    LEFT JOIN new_defaults nd
        ON nd.origination_month = cs.origination_month AND nd.mob = m.mob
)
SELECT
    origination_month,
    mob,
    cohort_loans,
    defaults_so_far,
    ROUND(100.0 * defaults_so_far / cohort_loans, 2) AS cum_default_pct
FROM curved
ORDER BY origination_month ASC, mob ASC;`,
    walkthrough: [
      "first_default scans all 72 perf rows and keeps only the loans whose flag ever reads 1, taking the earliest such month per loan: loan 1 first reads 1 at mob 3, loan 2 at mob 5, loan 5 at mob 6. The nine never-defaulting loans drop out entirely. new_defaults then groups those three survivors by cohort and month — one row each for (2026-01, 3), (2026-01, 5) and (2026-02, 6), each counting 1.",
      "cohort_sizes reads the denominators from the loans table: 4, 4 and 4. The main query CROSS JOINs the three cohorts against DISTINCT mob from perf — 1 through 6 — building 18 cells, and the LEFT JOIN pins the three new-default counts onto their cells while COALESCE turns every other cell into 0. The window SUM then runs inside each cohort in mob order: the 2026-01 partition walks 0, 0, 1, 1, 2, 2.",
      "The final SELECT rounds once per cell: 100.0 * 1 / 4 = 25.0 at (2026-01, 3), 100.0 * 2 / 4 = 50.0 from mob 5 onward, 100.0 * 1 / 4 = 25.0 at (2026-02, 6), and 2026-03 never leaves 0.0. ORDER BY origination_month ASC, mob ASC ships the three cohorts as three six-row blocks. defaults_so_far stays an INTEGER throughout — a running sum of integer counts — so only cum_default_pct ever leaves the integers.",
    ],
    time: "O(P + C x 6) — one pass over the P perf rows to find first defaults, then the 18-cell cohort-by-mob grid with a running sum per cohort",
    space: "O(C x 6) — the 18 curve cells held in curved before the final projection",
    followUps: [
      "Add the mob-exact new-default count beside the cumulative one — which column needs no window at all, and what does the ratio of the two read as (a hazard rate)?",
      "Extend the spine from mob 6 to mob 12 — what breaks in a mob spine derived from perf if young cohorts have no rows yet, and which table should own the months instead?",
    ],
    related: ["cohort-retention-matrix", "delinquency-buckets", "loan-amortization-schedule"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "delinquency-roll-rates",
    statement:
      "The roll_states table snapshots a credit book monthly: (customer_id, snapshot_month, bucket), where bucket is the account's delinquency bucket — 'current', 'd1_30', 'd31_60', 'd61_90' or 'd90_plus' — and every one of the 14 customers appears in both '2026-01' and '2026-02'. Collections risk reads the book as a flow: pair each customer's January bucket with its February bucket, and count how many customers made each observed transition. Report every observed transition with the columns bucket_from, bucket_to and transitions, one row per distinct bucket pair. Order the rows by the severity of the buckets — current, then d1_30, d31_60, d61_90, d90_plus — for bucket_from first and bucket_to second, not alphabetically.",
    examples: [
      {
        input: "customer 7 sits in d61_90 at the January snapshot and reads current at the February snapshot",
        output: "d61_90 · current · 1",
        explanation:
          "A cure from three buckets deep in one month — a one-step-only reading of the book calls this impossible, but the self-join observes it plainly.",
      },
      {
        input: "the five customers whose January bucket reads current",
        output: "current · current · 2, then current · d1_30 · 2, then current · d31_60 · 1",
        explanation:
          "Two stayed, two rolled one bucket and one jumped straight to d31_60 — the current book is leaking even while its own diagonal looks calm.",
      },
    ],
    constraints: [
      "the two snapshots are the fixed literals '2026-01' and '2026-02', written into the join — every one of the 14 customers appears in both, so the self-join yields exactly 14 paired rows",
      "transitions counts customers per (bucket_from, bucket_to) pair; only observed transitions appear — unobserved cells (like d1_30 to d90_plus) are absent, not zero",
      "the row order is the severity drive-order pinned with CASE — current 1, d1_30 2, d31_60 3, d61_90 4, d90_plus 5 — over bucket_from first, then bucket_to; alphabetical order is not the contract",
      "movement is unrestricted: roll-forwards, cures, stays and multi-bucket jumps all exist on this seed — never filter to one-step moves",
    ],
    primer: {
      hook:
        "Roll rates measure the speed of sickness in a loan book — not how many accounts are delinquent, but how fast delinquency spreads, deepens and heals.",
      concept: [
        "When a borrower misses payments, lenders do not just mark the account bad — they age it. Every month the lender takes a snapshot of the whole book and places each account in exactly one delinquency bucket: current, 1-30 days past due, 31-60, 61-90, or 90-plus. The buckets measure how late the account is, one rung at a time, and the monthly snapshot turns a messy reality into a single label per account.",
        "The analytics live between two snapshots. Compare each account's January bucket with its February bucket and one of a few things happened: it stayed, it rolled forward (worse), it cured (better), or it jumped several rungs in a single move. Collect every observed from-to pair with a count and you have the migration matrix — the state machine of the credit book. Cures from deep buckets and multi-rung jumps are both real, so movement is never limited to one step.",
        "A roll rate is the share of a bucket's accounts that moved on — usually onward — during the month, and it is the flow meter of the business. Headcounts say how many accounts sit in each bucket today; roll rates say whether next month's headcount is rising or falling. Net flow makes that explicit: roll-ins into a bucket minus roll-outs out of it. A current book can look calm on its diagonal while its roll-in rate quietly doubles — the matrix sees it, the headcount does not.",
      ],
      worked: [
        "Watch 4 accounts across two snapshots: A goes current to current, B current to d1_30, C d1_30 to current, D d1_30 to d31_60.",
        "Pair each January row with its February row — four transitions, tallied: one stay on current, one roll-in to d1_30, one cure out of d1_30, one roll-forward inside d1_30.",
        "Count the flows around d1_30: roll-ins 1 (B arrived), roll-outs 2 (C cured, D rolled deeper).",
        "Net flow on d1_30 is 1 - 2 = -1 — the bucket shrank by one account even though a new one arrived.",
        "The current diagonal looks calm (A stayed), but half of the current book leaked to d1_30 — the matrix reads flows, not stock.",
      ],
      glossary: [
        { term: "delinquency bucket", def: "the lateness band an account occupies in a monthly snapshot" },
        { term: "roll rate", def: "the share of a bucket that migrates to another bucket in one month" },
        { term: "cure", def: "a delinquent account returning to current, from any depth" },
        { term: "migration matrix", def: "every observed from-bucket to to-bucket transition, with counts" },
        { term: "net flow", def: "roll-ins into a bucket minus roll-outs out of it" },
        { term: "state machine", def: "a model where each account holds one state and moves between states" },
      ],
      reallife: [
        "A card issuer's collections strategy team reads the migration matrix weekly — it is the first chart on the wall. Rising roll rates from current into d1_30 warn months before charge-offs spike, and collector staffing is planned off the flow into late buckets, not off the balances. When cure rates fall in d31_60, the team re-tunes call timing, settlement offers and which accounts get self-service versus human contact. The same matrix feeds the provisioning models that book expected credit losses each quarter.",
        "What breaks: snapshots taken on different days of the month smear the flows; a bucket definition change (say d1_30 becoming d1_29) puts a fake jump into every transition; and settlements that re-age accounts manufacture miracle cures. Analysts who assume one-step movement mislabel deep cures as data errors and undercount the good news. The decisions the numbers drive are concrete: line decreases on accounts that keep rolling, cure campaigns aimed at d31_60, and next quarter's charge-off forecast built from today's roll-in rates.",
      ],
      where:
        "Card, auto and consumer-lending risk teams — Capital One, Synchrony, Chase, Affirm — plus collections analytics groups ask roll-rate and migration-matrix SQL in interviews.",
    },
    breakdown: [
      "The report is a state machine read through two snapshots. Every customer occupies exactly one bucket per snapshot month, so joining the January rows to the February rows on customer_id produces one transition pair per customer — 14 pairs on this seed. Group those pairs by (bucket_from, bucket_to) and count them: that is the matrix. Nothing about the buckets themselves is computed; the intelligence is in which two rows meet.",
      "The missteps cluster around shape and order. Ordering alphabetically happens to match severity on these labels — the digits 1, 3, 6, 9 already sort — but the contract pins the order with an explicit CASE, because a future bucket like charged_off sorts ahead of current and scrambles the story. Assuming one-step movement deletes the most interesting rows: the current-to-d31_60 jump and both deep cures vanish under a rank-distance filter of at most one. And pinning both month predicates to '2026-01' pairs every customer with itself — everyone looks frozen and the matrix collapses to its diagonal.",
      "The engine keeps each job in its own layer. pairs does the stitching: s1 filtered to '2026-01', s2 joined on customer_id and pinned to '2026-02', so the pairing rule lives in exactly one place. The outer SELECT groups and counts, and the ORDER BY carries two CASE ladders — current 1, d1_30 2, d31_60 3, d61_90 4, d90_plus 5 — first over bucket_from, then bucket_to, so the matrix reads like a table: from-buckets top to bottom in severity, to-buckets in the same order within each block.",
    ],
    edges: [
      "Alphabetical ORDER BY agrees on this seed's labels — d1_30, d31_60, d61_90, d90_plus already sort by their digits — so the coincidence must be probed, not trusted; add a charged_off bucket (the industry's next stop after d90_plus) and it sorts before current, scrambling the matrix. The severity CASE is the contract, not a style choice.",
      "Movement is not one-step: current reaches d31_60 in a single month (customer 6), d61_90 cures straight to current (customer 7) and d90_plus cures outright (customer 14) — a rank-distance filter of at most one deletes 3 of the 12 observed transitions.",
      "Pin both snapshot predicates to '2026-01' and the join pairs January with itself: the matrix collapses to its 5-cell diagonal (current-current 5, d1_30-d1_30 3, d31_60-d31_60 2, d61_90-d61_90 2, d90_plus-d90_plus 2) and every cure, roll and jump disappears.",
      "COUNT(DISTINCT customer_id) happens to equal COUNT(*) per cell here because the primary key (customer_id, snapshot_month) allows exactly one bucket per customer-month — the honest count of transitions is COUNT(*), which stays correct if a book ever holds several rows per customer-month.",
    ],
    ladder: [
      { title: "Brute force — the hand grid", body: "Draw a 5-by-5 grid, walk all 14 customers, and put a tally in the cell their two buckets name. Fourteen customers is doable; a book of millions is not, and the grid hides the join that builds it." },
      { title: "The pattern — self-join the snapshots", body: "Join the two snapshot months on customer_id — one row per customer — then GROUP BY the bucket pair and COUNT. The ORDER BY is a pinned severity CASE over both keys, from-bucket first." },
      { title: "The optimal idea — one join per month-pair", body: "O(n) pairing plus one sort of the grouped cells. The durable judgment: month-over-month state migration is a self-join per adjacent pair — twelve months is eleven such joins, or one LAG per customer over the ordered snapshots." },
    ],
    approach: "self-join the two snapshot months per customer, GROUP BY (bucket_from, bucket_to), COUNT, ORDER BY a pinned severity CASE on both keys",
    schema: {
      ddl: `CREATE TABLE roll_states (
  customer_id    INTEGER NOT NULL,
  snapshot_month TEXT NOT NULL,       -- 'YYYY-MM' snapshot
  bucket         TEXT NOT NULL,       -- current | d1_30 | d31_60 | d61_90 | d90_plus
  PRIMARY KEY (customer_id, snapshot_month)
);`,
      seed: `-- 14 customers in both snapshots · January bucket, February bucket ·
-- cures from deep (7, 14), a jump (6), stays on the diagonal, rolls everywhere
INSERT INTO roll_states (customer_id, snapshot_month, bucket) VALUES
  (1,  '2026-01', 'current'),  (1,  '2026-02', 'current'),
  (2,  '2026-01', 'current'),  (2,  '2026-02', 'd1_30'),
  (3,  '2026-01', 'd1_30'),    (3,  '2026-02', 'current'),
  (4,  '2026-01', 'd1_30'),    (4,  '2026-02', 'd31_60'),
  (5,  '2026-01', 'd31_60'),   (5,  '2026-02', 'd1_30'),
  (6,  '2026-01', 'current'),  (6,  '2026-02', 'd31_60'),
  (7,  '2026-01', 'd61_90'),   (7,  '2026-02', 'current'),
  (8,  '2026-01', 'd90_plus'), (8,  '2026-02', 'd90_plus'),
  (9,  '2026-01', 'current'),  (9,  '2026-02', 'current'),
  (10, '2026-01', 'current'),  (10, '2026-02', 'd1_30'),
  (11, '2026-01', 'd1_30'),    (11, '2026-02', 'd1_30'),
  (12, '2026-01', 'd31_60'),   (12, '2026-02', 'd61_90'),
  (13, '2026-01', 'd61_90'),   (13, '2026-02', 'd90_plus'),
  (14, '2026-01', 'd90_plus'), (14, '2026-02', 'current');`,
      tables: [
        { name: "roll_states", note: "28 rows — 14 customers in both snapshots; 12 distinct transitions incl. a current-to-d31_60 jump and deep cures from d61_90 and d90_plus" },
      ],
    },
    code: `WITH pairs AS (
    -- one row per customer: January's bucket beside February's
    SELECT
        s1.bucket AS bucket_from,
        s2.bucket AS bucket_to
    FROM roll_states s1
    JOIN roll_states s2
        ON s2.customer_id = s1.customer_id
        AND s2.snapshot_month = '2026-02'   -- the February snapshot
    WHERE s1.snapshot_month = '2026-01'     -- the January snapshot
)
SELECT
    p.bucket_from,
    p.bucket_to,
    COUNT(*) AS transitions
FROM pairs p
GROUP BY p.bucket_from, p.bucket_to
ORDER BY
    -- severity drive-order, pinned: alphabetical scrambles the matrix the
    -- moment a bucket label (charged_off) sorts ahead of current
    CASE p.bucket_from
        WHEN 'current'  THEN 1
        WHEN 'd1_30'    THEN 2
        WHEN 'd31_60'   THEN 3
        WHEN 'd61_90'   THEN 4
        WHEN 'd90_plus' THEN 5
    END ASC,
    CASE p.bucket_to
        WHEN 'current'  THEN 1
        WHEN 'd1_30'    THEN 2
        WHEN 'd31_60'   THEN 3
        WHEN 'd61_90'   THEN 4
        WHEN 'd90_plus' THEN 5
    END ASC;`,
    walkthrough: [
      "pairs stitches the two snapshots: s1 supplies January's bucket, s2 the February bucket, joined on customer_id with the month literals in the ON and WHERE clauses. Fourteen customers produce fourteen pairs. Customer 7 contributes d61_90 to current, customer 14 contributes d90_plus to current, customer 6 contributes current to d31_60 — the moves a one-step reading refuses to believe.",
      "GROUP BY folds the fourteen pairs into twelve observed cells. The current row of the matrix reads current-current 2, current-d1_30 2, current-d31_60 1 — five accounts started current and three of them leaked. The d1_30 row shows both directions at once: one cure to current, one stay, one roll-forward to d31_60. The deep buckets behave too: d61_90 splits into a cure and a roll-forward, and d90_plus splits into the book's most dramatic cure and its deepest stay.",
      "The ORDER BY CASE ladders sort the from-buckets current, d1_30, d31_60, d61_90, d90_plus and do the same within each from-block for the to-buckets. The output ships twelve rows: two 2-count cells at the top (the current diagonal and the one-step roll), then ten 1-count cells tracing every cure, jump and deep stay. transitions totals 14 — the whole book accounted for, no customer dropped.",
    ],
    time: "O(n) to pair the n snapshot rows plus one sort of the grouped cells — the self-join touches each customer once",
    space: "O(C) — the C transition pairs (14 here) held through the GROUP BY",
    followUps: [
      "Turn counts into roll rates: divide each transition by the from-bucket's January population (current to d1_30 is 2 of 5 = 40.0) — which extra aggregate supplies the denominator, and what does the current row's leak rate warn about?",
      "Add a net_flow column per bucket — roll-ins minus roll-outs — and check which buckets shrank in February despite healthy diagonals.",
      "Scale to twelve snapshots with LAG per customer ordered by snapshot_month — what replaces the self-join, and how do you keep the month-literal pairing from becoming twelve copies of the same predicate?",
    ],
    related: ["delinquency-buckets", "growth-accounting", "dau-wau-stickiness"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "credit-utilization-bands",
    statement:
      "The cards table lists each revolving line: (card_id, customer_id, credit_limit_cents), and statements logs one row per card per monthly statement: (card_id, stmt_month, balance_cents) — the balance captured on that statement's closing date. Credit utilization is the balance divided by the credit limit, the second-heaviest factor in a consumer credit score, and what lenders see is the LATEST statement of each card, not any older one. Report one row per card: card_id, credit_limit_cents, balance_cents from the latest statement, utilization_pct = ROUND(100.0 * balance_cents / credit_limit_cents, 1) and the band — 'low' under 30, 'moderate' from 30 to under 60, 'high' from 60 to under 90, 'maxed' at 90 or above. Order by card_id ascending.",
    examples: [
      {
        input: "card 3 — limit 100000 cents, its only statement '2026-03' balance 30000 cents",
        output: "3 · 100000 · 30000 · 30.0 · moderate",
        explanation:
          "The ratio reads exactly 30.0 and the band tests < 30 for low, so exactly-30 escapes into moderate — the boundary belongs to the higher band.",
      },
      {
        input: "card 1 — limit 200000 cents, statement '2026-02' balance 150000 cents but statement '2026-03' balance 0 cents",
        output: "1 · 200000 · 0 · 0.0 · low",
        explanation:
          "Only the latest statement counts: rn = 1 picks '2026-03', so the card reads 0.0 low and the 75.0 high of the month before never reaches the output.",
      },
    ],
    constraints: [
      "the latest statement per card wins: ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY stmt_month DESC) filtered to rn = 1 — card 5's newest statement is '2026-02', so a global month filter like stmt_month = '2026-03' silently drops the card",
      "utilization_pct = ROUND(100.0 * balance_cents / credit_limit_cents, 1) — the 100.0 literal forces float division; integer math truncates 24.9 down to 24",
      "bands compare the RAW ratio, not the rounded display: the CASE re-tests 100.0 * balance_cents / credit_limit_cents, so a raw 29.96 bands low even though it would print as 30.0",
      "band boundaries: < 30 low, < 60 moderate, < 90 high, otherwise maxed — exactly 30 is moderate and exactly 90 is maxed; ORDER BY card_id ASC",
    ],
    primer: {
      hook:
        "Credit utilization is the number that quietly moves a credit score every month — how much of your granted credit you are actually holding as debt.",
      concept: [
        "A credit card is a revolving line: the lender grants a limit, you borrow up to it, repay, and borrow again. Utilization is the balance divided by the limit — a 100000-cent limit carrying a 24900-cent balance sits at 24.9 percent. It answers one question: how close is this borrower to the edge of their granted credit? Scoring models read high utilization as stress even when every payment arrives on time.",
        "The famous rule of thumb is 30 percent: under it reads healthy, and the danger zone starts well before the limit itself. Bands turn the continuum into vocabulary — low under 30, moderate to 60, high to 90, maxed at 90 or above — so a risk team can act on a label instead of a raw ratio. Utilization is the second-heaviest factor in consumer credit scores after payment history, which is why it gets its own report.",
        "What the bureau sees is not today's app balance — it is the statement balance, captured on each card's monthly closing date and reported to the bureaus shortly after. Paying the card down after the statement still shows the old number for most of a month. Each card reports separately, so the latest statement per card is the only one that matters for a current reading; older statements are history, not signal.",
      ],
      worked: [
        "One card, limit 100000 cents: pull its statements and take the latest — '2026-03', balance 24900 cents; the '2026-02' row at 98000 cents is history.",
        "Divide: 24900 / 100000 = 0.249.",
        "Scale to percent: 0.249 x 100 = 24.9.",
        "Band it: 24.9 sits under 30, so the label is low.",
        "If next month's statement closes at 31000 cents, the ratio reads 31.0 — one statement moved the card from low to moderate.",
      ],
      glossary: [
        { term: "credit utilization", def: "balance divided by credit limit, expressed as a percentage" },
        { term: "revolving line", def: "credit that renews as you repay, up to a set limit" },
        { term: "credit limit", def: "the maximum balance a lender allows on the line" },
        { term: "statement balance", def: "the balance captured on the monthly closing date and reported outward" },
        { term: "bureau snapshot", def: "the monthly per-card data a credit bureau receives and scores" },
        { term: "utilization band", def: "a labelled range of utilization, like low under 30 percent" },
      ],
      reallife: [
        "Card issuers run utilization banding across the whole book every month in the credit-risk team, usually right after the statement cycle closes. The bands drive line management: accounts drifting from moderate into high get line-decrease reviews, while long-low accounts get increase offers that grow interchange revenue. The same numbers sit inside the scorecards the bureau vendors build, which is why a statement-date change can move thousands of scores overnight. Charge-off forecasting starts with how many accounts sit in high and maxed.",
        "What breaks: lenders pull bureau snapshots monthly, so a limit increase not yet reported leaves utilization reading artificially high; customers with several cards get scored per card and in aggregate, and the two disagree; and reading a stale statement month quietly bands a card that has since paid to zero. Analysts also trip on the boundary values — exactly 30 is moderate, exactly 90 is maxed — and on integer math that rounds 24.9 down to 24 before the banding ever runs. The decisions are concrete: which accounts get line decreases, which get balance-transfer offers, and how much expected loss the quarter books.",
      ],
      where:
        "Card and consumer-lending analytics interviews — Capital One, Discover, American Express, and credit-bureau analytics teams — use utilization banding as a first-round SQL screen.",
    },
    breakdown: [
      "Utilization is a ratio, and the report is that ratio pinned to the right snapshot. Each card carries one credit limit but possibly many statements; the contract wants the balance from the LATEST statement only, which is a latest-per-key selection: ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY stmt_month DESC) numbers each card's statements newest-first, and rn = 1 keeps exactly one row per card. Card 1 shows why the choice matters — it was 75.0 high in February and 0.0 in March, and the report must say 0.0.",
      "The missteps are all about picking the wrong row or doing the math in the wrong type. Joining statements without the rn filter fans six cards out to nine rows — cards 1, 2 and 5 double. Filtering to a GLOBAL month instead of each card's own latest drops card 5 entirely, because its newest statement is '2026-02' while the rest close '2026-03'. Writing the ratio without the 100.0 literal lets integer division truncate: 24.9 becomes 24, 61.5 becomes 61, 97.3 becomes 97. And ordering by utilization instead of card_id scatters the report into descending-percent order, not the contract's card order.",
      "The band CASE belongs to the raw ratio, not the rounded display. ROUND(..., 1) exists for the report's utilization_pct column; the banding test re-computes 100.0 * balance_cents / credit_limit_cents so a raw 29.96 bands low even though it prints as 30.0. The boundaries are pinned asymmetrically on purpose: < 30 for low means exactly 30 falls through to moderate, and < 90 for high means exactly 90 falls through to maxed — cards 3 and 5 sit exactly on those fences in the seed so the boundary handling is graded, not assumed.",
    ],
    edges: [
      "Joining statements without the rn = 1 filter fans 6 cards out to 9 rows — cards 1, 2 and 5 each appear twice with conflicting bands, and the report stops being one row per card.",
      "Integer division truncates before ROUND ever runs: 100 * 24900 / 100000 reads 24 (not 24.9), 100 * 123000 / 200000 reads 61 and 100 * 48650 / 50000 reads 97 — the 100.0 literal is what promotes the division.",
      "The boundaries are off-by-one sensitive: flipping < 30 to <= 30 demotes card 3's exactly-30.0 from moderate to low, and card 5's exactly-90.0 must stay maxed — both boundary cards live in the seed precisely to grade this.",
      "ORDER BY utilization_pct instead of card_id reverses the report — 97.3 first and 0.0 last (cards 6, 5, 4, 3, 2, 1) — while the contract wants the stable card_id order.",
    ],
    ladder: [
      { title: "Brute force — flip through the statements", body: "For each card, read its statements in date order, keep the newest, divide balance by limit, and label the result. Six cards is quick by hand; the SQL expresses the same pick as one windowed row number." },
      { title: "The pattern — latest per key, then ratio and CASE", body: "ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY stmt_month DESC) stamps each statement newest-first. rn = 1 keeps the latest, the ratio computes once for display, and the band CASE tests the raw ratio against the pinned fences." },
      { title: "The optimal idea — rank, filter, project", body: "O(S log S) over the S statement rows — one window sort per card plus the final ordering. The durable rules: latest-per-key is ROW_NUMBER rn = 1, band on the raw value and round only for display, and the sort key is the entity id, not the metric." },
    ],
    approach: "ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY stmt_month DESC) keeps each card's latest statement; ratio and band computed on the raw value, ORDER BY card_id",
    schema: {
      ddl: `CREATE TABLE cards (
  card_id            INTEGER PRIMARY KEY,
  customer_id        INTEGER NOT NULL,
  credit_limit_cents INTEGER NOT NULL
);

CREATE TABLE statements (
  card_id       INTEGER NOT NULL,
  stmt_month    TEXT NOT NULL,        -- 'YYYY-MM' statement close
  balance_cents INTEGER NOT NULL,
  PRIMARY KEY (card_id, stmt_month)
);`,
      seed: `-- limits: cards 1 and 4 = 200000, cards 2, 3, 5 = 100000, card 6 = 50000
INSERT INTO cards (card_id, customer_id, credit_limit_cents) VALUES
  (1, 101, 200000),
  (2, 102, 100000),
  (3, 103, 100000),
  (4, 104, 200000),
  (5, 105, 100000),
  (6, 106, 50000);

-- 9 statements · cards 1 and 2 carry older months that differ from the
-- latest · card 5's newest statement is '2026-02' (no '2026-03' row)
INSERT INTO statements (card_id, stmt_month, balance_cents) VALUES
  (1, '2026-02', 150000),   -- 75.0 the month before
  (1, '2026-03', 0),        -- latest: paid to zero before the close
  (2, '2026-02', 98000),    -- 98.0 the month before
  (2, '2026-03', 24900),    -- latest: 24.9
  (3, '2026-03', 30000),    -- latest: exactly 30.0 -> moderate
  (4, '2026-03', 123000),   -- latest: 61.5
  (5, '2026-01', 90000),
  (5, '2026-02', 90000),    -- latest: exactly 90.0 -> maxed
  -- card 6 closes the book at 97.3
  (6, '2026-03', 48650);`,
      tables: [
        { name: "cards", note: "6 cards — limits 200000 (cards 1, 4), 100000 (2, 3, 5), 50000 (6)" },
        { name: "statements", note: "9 statement rows — cards 1 and 2 carry older months that differ from the latest, card 5's newest statement is 2026-02" },
      ],
    },
    code: `WITH ranked AS (
    -- newest statement per card: stmt_month DESC puts the latest on rn 1
    SELECT
        c.card_id,
        c.credit_limit_cents,
        s.balance_cents,
        ROW_NUMBER() OVER (PARTITION BY s.card_id ORDER BY s.stmt_month DESC) AS rn
    FROM cards c
    JOIN statements s ON s.card_id = c.card_id
)
SELECT
    card_id,
    credit_limit_cents,
    balance_cents,
    ROUND(100.0 * balance_cents / credit_limit_cents, 1) AS utilization_pct,
    CASE
        WHEN 100.0 * balance_cents / credit_limit_cents < 30 THEN 'low'        -- raw ratio, not the rounded display
        WHEN 100.0 * balance_cents / credit_limit_cents < 60 THEN 'moderate'
        WHEN 100.0 * balance_cents / credit_limit_cents < 90 THEN 'high'
        ELSE 'maxed'
    END AS band
FROM ranked
WHERE rn = 1
ORDER BY card_id ASC;`,
    walkthrough: [
      "ranked joins the 6 cards to their 9 statements and stamps rn within each card, newest month first. Card 1's two rows read rn 1 for '2026-03' (balance 0) and rn 2 for '2026-02' (balance 150000); card 5's rn 1 lands on '2026-02' because it has no '2026-03' row at all. Nine rows in, still nine rows out — the ranking changes nothing yet.",
      "The rn = 1 filter leaves exactly 6 rows, one per card. The ratio math then runs per card with clean numbers: card 1 reads 100.0 * 0 / 200000 = 0.0, card 2 reads 24.9, card 3 reads exactly 30.0. Cards 4, 5 and 6 read 61.5, 90.0 and 97.3 — every value exact on this seed, no rounding drama.",
      "The band CASE tests each raw ratio against the fences. Cards 1 and 2 fall under 30 into low, card 3's exactly-30.0 escapes low into moderate, and card 4's 61.5 lands in high. Cards 5 and 6 — 90.0 and 97.3 — fail every < arm into maxed, and ORDER BY card_id ASC ships the six rows with the two boundary cards grading the fences.",
    ],
    time: "O(S log S) — the window sorts the S statement rows per card to stamp rn, then one filtered pass",
    space: "O(S) — the ranked statement rows held until the rn = 1 filter",
    followUps: [
      "Report each card's prior-month utilization beside the latest — which window (LAG over stmt_month) rides on ranked, and how far do cards 1 and 2 swing between the two months?",
      "Aggregate the book: average utilization per band — which GROUP BY, and why does the maxed band's average sit above 90 while low's sits far under 30?",
      "Flag cards whose band worsened month over month — both months need ranking; what rank pair (rn 1 versus rn 2) and which band comparison decides the flag?",
    ],
    related: ["bank-account-summary-ii", "loan-amortization-schedule", "daily-balance-interest"],
    order: "exact",
    xp: 10,
  },
];
