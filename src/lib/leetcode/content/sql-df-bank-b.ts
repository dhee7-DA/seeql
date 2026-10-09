// Deep-dives — Data & Finance banking file B: expected credit loss,
// risk-based pricing and prepayment savings (3 problems: 2 Medium, 1 Hard,
// all order:"exact" reads). Money is INTEGER cents with the _cents suffix;
// rates/percentages are REAL. Original banking phrasing — never copied
// problem text. Every dive carries a domain primer for first-time learners.
// Registry wiring (lead): 8028 expected-credit-loss ·
// 8029 risk-based-pricing · 8030 prepayment-detection.
import type { LcSqlDive } from "../types";

export const SQL_DF_BANK_B: LcSqlDive[] = [
  {
    slug: "expected-credit-loss",
    statement:
      "The segments table classifies the lender's book: segment_name, plus pd_pct — the percent chance a borrower in the segment stops paying within the horizon — and lgd_pct, the percent of a defaulted exposure the lender never recovers. The loans table places each loan's exposure at default, ead_cents, in one segment, and expected credit loss is the cents a segment should expect to lose: every loan contributes ead_cents * pd_pct / 100.0 * lgd_pct / 100.0, and the segment's ECL is the SUM of those contributions rounded once at the end. Report one row per segment with the columns segment_name, loan_count, ead_total_cents and ecl_cents. Order by ecl_cents descending, then segment_name ascending, so a tie on the loss number still ships deterministically.",
    examples: [
      {
        input:
          "the subprime segment — 3 loans totalling 400000 cents at pd 6.5 and lgd 55.0",
        output: "subprime · 3 · 400000 · 14300",
        explanation:
          "The three contributions price at 200000 * 6.5 / 100 * 55 / 100 = 7150, then 4290 and 2860 — the SUM lands on 14300 exactly, so the single end-round leaves it untouched.",
      },
      {
        input:
          "the prime segment — 4 loans totalling 1200000 cents at pd 0.5 and lgd 40.0",
        output: "prime · 4 · 1200000 · 2400",
        explanation:
          "The raw contributions run 1000, 799.5, 500.5 and 100: the two half-cent tails cancel inside the SUM (799.5 + 500.5 = 1300), so rounding once at the end reads 2400 where rounding per loan would read 2401.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: ead_cents, ead_total_cents and ecl_cents are integers — pd_pct and lgd_pct are the schema's only REALs and never reach the output",
      "the pinned ECL formula: ecl_cents = CAST(ROUND(SUM(1.0 * ead_cents * pd_pct / 100.0 * lgd_pct / 100.0)) AS INTEGER) — both percentages divide the exposure, and exactly ONE round fires, after the SUM",
      "one row per segment: the segments table drives the FROM, loans join on segment_id, loan_count counts loans and ead_total_cents sums their exposures",
      "ORDER BY ecl_cents DESC, segment_name ASC — the computed loss leads and the segment name is the tie-safe second key",
    ],
    breakdown: [
      "The ask is a two-table aggregation with a product inside it: join every loan to its segment's risk parameters, price each loan's expected loss, and fold the book by segment. The three letters do different jobs — ead_cents is how much money sits on the line, pd_pct is how often it goes bad, and lgd_pct is how much of the defaulted money never comes back — so all three must reach the arithmetic, and both percentages must divide by 100. A 200000-cent exposure at pd 6.5 and lgd 55.0 loses 200000 * 6.5 / 100 * 55 / 100 = 7150 cents in expectation; the subprime segment's other two loans add 4290 and 2860, and the segment reports 14300. The formula is linear in exposure, which is exactly why the exposures can be summed before the single round fires.",
      "The placement of SUM and ROUND is the whole game. Round each loan first and the halves refuse to cancel: the prime book's raw contributions run 1000, 799.5, 500.5 and 100 — rounding per loan reads 1000 + 800 + 501 + 100 = 2401, a phantom cent of loss the bank never expected, while the pinned sum-then-round reads 2400 because 799.5 + 500.5 lands exactly on 1300. The sibling fallacy is blending: summing the whole book's 2300000 cents of exposure and multiplying by one average rate reads 35842 against the true 23000, because the segments' loss factors (0.002, 0.009, 0.03575) differ far too much for any unweighted average to represent them. Inside ONE segment the two orders coincide — pd and lgd are segment constants there — so the trap only fires across the boundaries this report exists to draw.",
      "Mechanically the statement is one pass. The FROM starts at segments and LEFT JOINs loans on segment_id, so the segment universe — not the loan rows — defines the groups; GROUP BY the segment key then folds each segment's loans into a COUNT, a SUM of exposures and the pinned SUM of products. Every money cell stays INTEGER: the SUM accumulates in float, ROUND fires once on the finished sum, and the CAST hands back whole cents. The ORDER BY is computed-column territory — ecl_cents DESC stacks the book's pain in descending order and segment_name ASC catches any tie the contract refuses to leave ambiguous.",
    ],
    edges: [
      "Per-loan rounding manufactures money: on the prime book it reads 2401 instead of 2400 — the two exact half-cent tails (799.5 and 500.5) each round UP, and the drift lands in the report as a phantom cent of expected loss.",
      "Sum at the wrong grain and the numbers explode: the whole-book variant (SUM every loan's exposure, then apply each segment's rate) reads 4600, 20700 and 82225 — every segment priced on all 2300000 cents — and the blended-average variant reads 35842 against a true book ECL of 23000.",
      "Drop either /100 and the report inflates 100x: pd_pct and lgd_pct are PERCENTS, so the one-division-left variant reads 240000, 630000 and 1430000 for the three segments.",
      "Every seeded segment owns loans, so the LEFT JOIN never shows its restore behavior — a zero-loan segment would surface with loan_count 0 and NULL sums, and needs an explicit COALESCE policy before it can report a clean 0.",
    ],
    ladder: [
      { title: "Brute force — price each loan by hand", body: "List every loan, multiply its exposure by its segment's two percentages, round, and add the segment up. Ten loans is a spreadsheet afternoon; a national book is not — and the per-loan rounding habit this method teaches is precisely the drift the contract forbids." },
      { title: "The pattern — join, price, fold", body: "Join loans to segments on segment_id, compute 1.0 * ead_cents * pd_pct / 100.0 * lgd_pct / 100.0 per row, and GROUP BY the segment with SUM, COUNT and SUM(ead) riding together. One GROUP BY, three aggregates, no intermediate tables." },
      { title: "The optimal idea — round once, at the fold", body: "O(L + S log S): a linear pass over the L loans plus the sort behind the final ORDER BY over S segments. The durable rule generalizes far beyond credit: when a contract says round a total, the round belongs after the aggregation — rounding inside the loop bakes drift into every rollup." },
    ],
    approach:
      "join loans to segments, SUM the pinned per-loan products grouped by segment, round ONCE after the SUM, and sort by the computed loss with the segment name as tie-breaker",
    schema: {
      ddl: `CREATE TABLE segments (
  segment_id   INTEGER PRIMARY KEY,
  segment_name TEXT NOT NULL,
  pd_pct       REAL NOT NULL,    -- probability of default, percent (0.5 = 0.5%)
  lgd_pct      REAL NOT NULL     -- loss given default, percent (40.0 = 40%)
);
CREATE TABLE loans (
  loan_id    INTEGER PRIMARY KEY,
  segment_id INTEGER NOT NULL,
  ead_cents  INTEGER NOT NULL   -- exposure at default
);`,
      seed: `-- 3 segments · the prime book totals 1200000 cents and carries two loans
-- with exact half-cent tails (399750 -> 799.5 and 250250 -> 500.5) that
-- cancel inside the SUM but split under per-loan rounding · every segment
-- sum lands on whole cents
INSERT INTO segments (segment_id, segment_name, pd_pct, lgd_pct) VALUES
  (1, 'prime',      0.5, 40.0),
  (2, 'near-prime', 2.0, 45.0),
  (3, 'subprime',   6.5, 55.0);
INSERT INTO loans (loan_id, segment_id, ead_cents) VALUES
  (1, 1,  500000),   -- 1000
  (2, 1,  399750),   -- 799.5
  (3, 1,  250250),   -- 500.5
  (4, 1,   50000),   -- 100
  (5, 2,  300000),   -- 2700
  (6, 2,  250000),   -- 2250
  (7, 2,  150000),   -- 1350
  (8, 3,  200000),   -- 7150
  (9, 3,  120000),   -- 4290
  -- loan 10 closes the subprime book at 2860
  (10, 3,  80000);`,
      tables: [
        { name: "segments", note: "3 risk segments — prime at pd 0.5 / lgd 40.0, near-prime at 2.0 / 45.0, subprime at 6.5 / 55.0" },
        { name: "loans", note: "10 loans — 4 prime totalling 1200000 cents, 3 near-prime totalling 700000, 3 subprime totalling 400000" },
      ],
    },
    code: `WITH priced AS (
    -- each loan joins its segment's risk parameters and the product is
    -- the loan's expected loss in cents, both percentages divided out
    SELECT
        s.segment_id,
        s.segment_name,
        l.loan_id,
        l.ead_cents,
        1.0 * l.ead_cents * s.pd_pct / 100.0 * s.lgd_pct / 100.0 AS loan_ecl
    FROM segments s
    LEFT JOIN loans l ON l.segment_id = s.segment_id
),
folded AS (
    -- aggregate at the SEGMENT grain and round ONCE, after the SUM
    SELECT
        segment_name,
        COUNT(loan_id) AS loan_count,
        SUM(ead_cents) AS ead_total_cents,
        CAST(ROUND(SUM(loan_ecl)) AS INTEGER) AS ecl_cents
    FROM priced
    GROUP BY segment_id, segment_name
)
SELECT segment_name, loan_count, ead_total_cents, ecl_cents
FROM folded
ORDER BY ecl_cents DESC, segment_name ASC;`,
    walkthrough: [
      "The priced CTE is a pure projection: ten loans each pick up their segment's pd_pct and lgd_pct through the join on segment_id, and loan_ecl prices one loan's expected loss — 200000 * 6.5 / 100.0 * 55.0 / 100.0 = 7150 for loan 8, 799.5 for loan 2 and 500.5 for loan 3. The multiplication order matters for exactness: the 1.0 literal promotes the integer exposure to float immediately, so every division runs in floating point and no integer truncation ever fires. The LEFT JOIN keeps the segment universe as the driving side even though all three segments own loans here.",
      "The folded CTE runs the three aggregates together: loan_count counts the segment's loans (4, 3, 3), ead_total_cents sums the exposures (1200000, 700000, 400000) and ecl_cents applies the pinned formula. The SUM accumulates the raw float contributions — prime's 1000 + 799.5 + 500.5 + 100 lands on exactly 2400.0 because the two half-cent tails cancel — and only then does ROUND fire, followed by the CAST to INTEGER. Near-prime folds to 6300 exactly and subprime to 14300; no rounding decision is ever hidden inside the loop.",
      "The final SELECT projects the four contract columns and orders by ecl_cents DESC, segment_name ASC: subprime's 14300 leads, near-prime's 6300 follows, prime's 2400 closes. The name key never fires on this seed — the three losses are distinct — but the ordering is armed for the day two segments tie. Every output cell is an INTEGER, so the snapshot compares clean cents end to end.",
    ],
    time: "O(L + S log S) — one linear pass over the L loans to price and fold, plus the sort behind the final ORDER BY over S segments",
    space: "O(L) — the priced rows materialize before the segment fold",
    followUps: [
      "Add a stressed_ecl_cents column that re-prices the book at double the PD — which segment's share of the book's total ECL grows the most, and does the prime book stay under one percent of its exposure?",
      "Roll the segment rows up into a book total and an EAD-weighted average loss rate in basis points — why does weighting by EAD reproduce the sum of the segment ECLs while an unweighted average rate does not?",
    ],
    related: ["delinquency-buckets", "loan-amortization-schedule", "portfolio-weights"],
    order: "exact",
    xp: 20,
    primer: {
      hook: "Banks plan to lose money — regulators make them — and expected credit loss is the arithmetic that turns a book of loans into one honest cents figure of planned pain.",
      concept: [
        "Lending is a statistical business: a bank hands out thousands of loans knowing some borrowers will stop paying, and it is not allowed to act surprised when they do. Accounting rules require the bank to estimate, today, how much of its book it should EXPECT to lose and to book that estimate as an expense immediately. That estimate is expected credit loss, and it is built from exactly three questions. How much money is on the line when a borrower defaults? How likely is the borrower to default at all? And of the money that goes bad, how much is truly lost after collections, collateral and recoveries?",
        "The three answers carry standard names. Probability of default (PD) is the chance a borrower stops paying, quoted in percent. Loss given default (LGD) is the share of a defaulted exposure the lender never recovers — collateral sales and collection agencies claw some back, and LGD counts what remains lost. Exposure at default (EAD) is the amount outstanding when the default happens. Multiply them and the percent signs cancel: ECL = EAD x PD / 100 x LGD / 100, a cents figure.",
        "No bank computes one number for the whole book, because a 750-score mortgage borrower and a subprime card borrower do not share a PD. Lenders split the book into segments — prime, near-prime, subprime — each carrying its own PD and LGD, price every loan with its segment's parameters, and add up per segment. That segmentation is also where the arithmetic discipline lives: you may sum the exposures inside a segment and apply that segment's rate, but you may never multiply the whole book by one blended average rate, because the segments' rates differ. The segment sums, rounded once at the end, are the contract.",
        "The number does real work the moment it exists. IFRS 9 (the international accounting standard) and CECL (its US counterpart) force the bank to book the ECL as a provision — an expense that reduces this quarter's profit — even though no default has happened yet. On top of the expected loss, regulators require a capital cushion for losses WORSE than expected, so the same PD-LGD-EAD machinery feeds both the income statement and the balance sheet. One rounding habit matters all the way up: round the finished segment total once, never each loan.",
      ],
      worked: [
        "Take a tiny segment: two loans of 10000 cents each, PD 2 percent, LGD 50 percent.",
        "Price one loan's defaulted money: 10000 x 2 / 100 = 200 cents is expected to go bad.",
        "Haircut it for recoveries: LGD 50 percent says half the defaulted money is lost, so 200 x 50 / 100 = 100 cents of expected loss per loan.",
        "Fold the segment: 100 + 100 = 200 cents of ECL, rounded once at the end — which changes nothing here because the sum is already whole.",
        "Now suppose the second loan sat in a riskier segment at PD 6 percent: its contribution alone is 10000 x 6 / 100 x 50 / 100 = 300 cents, and no single average PD could price both loans correctly — segment first, then multiply.",
      ],
      glossary: [
        { term: "expected credit loss (ECL)", def: "the cents a loan book should expect to lose, estimated before any default happens" },
        { term: "probability of default (PD)", def: "the percent chance a borrower stops paying within the risk horizon" },
        { term: "loss given default (LGD)", def: "the percent of a defaulted exposure the lender never recovers through collections or collateral" },
        { term: "exposure at default (EAD)", def: "the money still owed at the moment the borrower defaults" },
        { term: "provision", def: "the ECL booked as a current expense, reducing profit before any loan actually fails" },
        { term: "IFRS 9 / CECL", def: "the international and US accounting rules that make banks book expected losses today" },
      ],
      reallife: [
        "A credit-risk team owns the machinery: quantitative analysts estimate PD from repayment histories, loss modelers own LGD from recovery data, and the finance function books the provision every quarter. The numbers are never static — a deteriorating economy pushes PDs up, and the whole report re-runs. When a bank's ECL jumps quarter over quarter, the segment table is the first place auditors look, because one moved parameter reprices an entire segment instantly.",
        "What breaks in practice is exactly what the SQL guards. Someone rounds per loan and the book grows phantom cents of loss; someone blends one average rate across segments and the total misprices by thousands; someone drops a percentage division and the provision inflates a hundredfold — a number that would fail the audit and the regulator in the same afternoon. The report this problem builds — one row per segment, exposures and expected loss side by side — is the pack page a chief credit officer actually reads.",
        "The decisions the numbers drive are concrete: which segments to grow, where to tighten approval, how much capital to raise, and what interest rate covers each segment's expected loss with a margin. A segment whose ECL eats its entire interest margin is unprofitable no matter how big it looks — the report makes that visible in one row. That is also why the sort order matters: the costliest segment sits on top.",
      ],
      where: "Credit-risk analysts, provisioning and finance controllers, model validators and regulator-facing reporting teams at banks, fintech lenders and audit firms.",
    },
  },
  {
    slug: "risk-based-pricing",
    statement:
      "A loan's interest rate is not improvised — the rate_tiers table is the bank's price list, one row per product and credit-score band, where score_min and score_max are both INCLUSIVE and apr_pct is the annual rate that band pays. An applicant prices by finding the one band of their own product whose bounds contain their credit_score, unless an underwriter has written them a row in overrides — and an override wins over the sheet whatever it says, better or worse. Price every applicant: report applicant_id, applicant_name, credit_score, apr_pct and price_source, where price_source reads 'override' when an overrides row drove and 'sheet' when the band did. Order by applicant_id ascending.",
    examples: [
      {
        input:
          "applicant 2 — Marcus Chen, credit score exactly 620, product personal",
        output: "2 · Marcus Chen · 620 · 12.5 · sheet",
        explanation:
          "Both bounds are inclusive, so 620 opens the 620-719 band and reads 12.5 — one point lower would have paid the 18.9 of the 300-619 band below.",
      },
      {
        input:
          "applicant 5 — Tom Okafor, credit score 780, personal sheet 7.9, with an overrides row at 21.9",
        output: "5 · Tom Okafor · 780 · 21.9 · override",
        explanation:
          "The override loses to nothing: 21.9 is worse for the borrower than the sheet's 7.9 and it still drives — the COALESCE must read the override first, and price_source must say so.",
      },
    ],
    constraints: [
      "apr_pct is REAL everywhere and the only non-integer output column; applicant_id and credit_score are integers; no money appears in this problem",
      "band lookup pins as credit_score BETWEEN score_min AND score_max with BOTH bounds inclusive — the seeded bands cover 300-850 per product, never overlap, and every seeded score lands inside its product's coverage",
      "override precedence: apr_pct = COALESCE(override, sheet) and price_source = CASE WHEN an overrides row exists THEN 'override' ELSE 'sheet' END — the override wins even when it is the worse number",
      "ORDER BY applicant_id ASC — one row per applicant, seven rows on this seed",
    ],
    breakdown: [
      "The shape is a double LEFT JOIN with a precedence rule. The first join takes each applicant to their product's band — the ON clause carries two conditions at once, the product equality and the BETWEEN on the score — and the second join attaches an override if one exists. Either join can miss, which is exactly why both are LEFT: an INNER join on tiers would silently delete any applicant whose score falls outside the sheet's coverage, and an INNER join on overrides would throw away every honestly priced borrower. The report keeps all seven applicants no matter what the joins find.",
      "Precedence is one COALESCE away from being wrong. Read it as COALESCE(t.apr_pct, o.apr_pct) — sheet first, override as fallback — and both overridden applicants misprice: Elena reads her sheet's 12.5 instead of her underwriter's 6.4, and Tom celebrates a 7.9 the underwriter explicitly replaced with 21.9. The correct read, COALESCE(o.apr_pct, t.apr_pct), lets the override win in BOTH directions — cheaper and dearer — because the underwriter's decision is the more recent fact. price_source is the audit trail: it must be driven by the override's EXISTENCE, not by which number is bigger.",
      "The boundaries are where BETWEEN earns its keep. Marcus sits exactly on 620 — the lower bound of the second personal band — and Priya exactly on 719, its upper bound; inclusive bounds send Marcus up to 12.5 and hold Priya at 9.2, while any exclusive variant drops one of them into no band at all and prices them NULL. The seeded bands never overlap, so the BETWEEN can only ever match one row — drop the score_max guard, though, and 620 matches the 300-619 band TOO, fanning the seven-row report out to sixteen rows with two prices per boundary applicant. Contiguous, non-overlapping coverage is what makes a band lookup a lookup instead of a fanout.",
    ],
    edges: [
      "Marcus at exactly 620 is the lower-bound probe: an exclusive score_min (a score > score_min join) leaves him bandless at NULL, while the contract reads 12.5 — the bound belongs to the band.",
      "Priya at exactly 719 is the upper-bound probe: 719 still belongs to the 620-719 band and reads 9.2; a score < score_max join pushes her out the top.",
      "Dropping the score_max guard (joining on score >= score_min alone) matches Marcus to BOTH personal bands at or below his score — his 620 reads the 619 band's 18.9 as well as its own 12.5, and the report fans out to 16 rows.",
      "An INNER join on tiers happens to keep all seven seeded applicants (every score lands in coverage), but the seed's story is one INSERT away: an 860-score applicant owns no band and vanishes from the INNER variant while the LEFT JOIN prices them honestly.",
    ],
    ladder: [
      { title: "Brute force — look each borrower up by hand", body: "For each applicant, find their product's band by eye, check for an override row, and write the five columns. Seven applicants is fine; an origination system pricing thousands a day needs the join expressed once." },
      { title: "The pattern — two LEFT JOINs and a COALESCE", body: "Join applicants to tiers ON product AND score BETWEEN the inclusive bounds, join overrides on the applicant key, then COALESCE the override over the sheet and label the source with a CASE. Every applicant survives both joins because both are LEFT." },
      { title: "The optimal idea — precedence as COALESCE order", body: "O(A x T) worst case — each of the A applicants scans the small T-row tier table, or O(A log T) with a product index. The durable rule: a fallback chain is a COALESCE whose argument order IS the business rule — put the most specific fact first, then label where the answer came from." },
    ],
    approach:
      "LEFT JOIN tiers on product and inclusive BETWEEN, LEFT JOIN overrides, COALESCE the override over the sheet, CASE-label the source, ordered by applicant_id",
    schema: {
      ddl: `CREATE TABLE applicants (
  applicant_id   INTEGER PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  credit_score   INTEGER NOT NULL,
  product        TEXT NOT NULL
);
CREATE TABLE rate_tiers (
  product   TEXT NOT NULL,
  score_min INTEGER NOT NULL,
  score_max INTEGER NOT NULL,
  apr_pct   REAL NOT NULL
);
CREATE TABLE overrides (
  applicant_id INTEGER PRIMARY KEY,
  apr_pct      REAL NOT NULL
);`,
      seed: `-- personal: 300-619 -> 18.9, 620-719 -> 12.5, 720-850 -> 7.9
-- auto:     300-619 -> 14.4, 620-719 ->  9.2, 720-850 ->  5.8
-- bands are inclusive on both ends and never overlap · Marcus sits exactly
-- on 620 and Priya exactly on 719 · Elena's override (6.4) beats her 12.5
-- sheet and Tom's (21.9) is WORSE than his 7.9 sheet but still wins
INSERT INTO rate_tiers (product, score_min, score_max, apr_pct) VALUES
  ('personal', 300, 619, 18.9),
  ('personal', 620, 719, 12.5),
  ('personal', 720, 850,  7.9),
  ('auto',     300, 619, 14.4),
  ('auto',     620, 719,  9.2),
  ('auto',     720, 850,  5.8);
INSERT INTO applicants (applicant_id, applicant_name, credit_score, product) VALUES
  (1, 'Dana Whitfield',  755, 'personal'),
  (2, 'Marcus Chen',     620, 'personal'),
  (3, 'Priya Natarajan', 719, 'auto'),
  (4, 'Elena Rossi',     680, 'personal'),
  (5, 'Tom Okafor',      780, 'personal'),
  (6, 'Jack Alvarez',    540, 'auto'),
  (7, 'Mei Lin',         810, 'auto');
INSERT INTO overrides (applicant_id, apr_pct) VALUES
  (4,  6.4),
  (5, 21.9);`,
      tables: [
        { name: "applicants", note: "7 applicants — scores 540 to 810 across personal and auto, including both boundary scores 620 and 719" },
        { name: "rate_tiers", note: "6 bands — 3 per product, covering 300-850 with inclusive bounds and no overlap" },
        { name: "overrides", note: "2 underwriter overrides — Elena at 6.4 (better than her sheet) and Tom at 21.9 (worse)" },
      ],
    },
    code: `WITH priced AS (
    -- band lookup: product equality AND the score between the INCLUSIVE
    -- bounds, then the override join kept separate so a missing band or
    -- a missing override never deletes the applicant
    SELECT
        a.applicant_id,
        a.applicant_name,
        a.credit_score,
        COALESCE(o.apr_pct, t.apr_pct) AS apr_pct,
        CASE WHEN o.applicant_id IS NOT NULL THEN 'override' ELSE 'sheet' END AS price_source
    FROM applicants a
    LEFT JOIN rate_tiers t
        ON t.product = a.product
       AND a.credit_score BETWEEN t.score_min AND t.score_max
    LEFT JOIN overrides o ON o.applicant_id = a.applicant_id
)
SELECT applicant_id, applicant_name, credit_score, apr_pct, price_source
FROM priced
ORDER BY applicant_id ASC;`,
    walkthrough: [
      "The tier join carries two conditions in its ON clause: the product must match and credit_score must sit between score_min and score_max inclusive. Dana's 755 opens the 720-850 personal band (7.9), Marcus's 620 opens the 620-719 band (12.5), Priya's 719 closes the auto 620-719 band (9.2), Jack's 540 takes auto's 300-619 (14.4) and Mei's 810 takes auto's best (5.8). Because the bands never overlap, each of the seven applicants matches exactly one tier row — the join cannot fan out.",
      "The override join is keyed on the primary key, so it matches Elena (6.4) and Tom (21.9) and leaves the other five unmatched. COALESCE(o.apr_pct, t.apr_pct) implements the precedence: Elena ships 6.4 over her sheet's 12.5, and Tom ships 21.9 over 7.9 — the worse number wins because the override is the more recent fact, not the better one. The CASE stamps price_source from the override's existence, so the audit trail never has to guess which table priced the loan.",
      "The final SELECT projects the five contract columns and orders by applicant_id ASC, shipping the seven rows with the two overrides sitting mid-report. Elena and Tom are the only rows whose apr_pct came from the second join; the other five read straight off the sheet. Every boundary score survives because BETWEEN is closed on both ends — the seed's 620 and 719 are the proof.",
    ],
    time: "O(A x T) worst case with no index — each of the A applicants scans the T tier rows; with a product index it is O(A log T)",
    space: "O(A) — the priced rows held until the projection",
    followUps: [
      "Count each product's prices by source — how many of the personal offers came from an override, and what share of the book did underwriters reprice?",
      "Flag every override that moved the rate by more than 5 points against the sheet — which column pair computes the delta, and does any override on this seed qualify?",
    ],
    related: ["calculate-product-final-price", "daily-balance-interest", "loan-amortization-schedule"],
    order: "exact",
    xp: 20,
    primer: {
      hook: "Two borrowers can take the same loan at wildly different rates on purpose — the rate sheet is the price list that makes the difference systematic instead of personal.",
      concept: [
        "A credit score condenses someone's borrowing history — payments made, debts carried, accounts aged — into one number, roughly 300 at the worst end and 850 at the best. Lenders have learned that this number predicts repayment well enough to price on it: the higher the score, the lower the chance of default, and the lower the interest rate the borrower pays. The loan's price is quoted as APR, the annual percentage rate — what the loan costs per year as a percent of the money borrowed. Risk-based pricing is the practice of letting that risk number set the price.",
        "The price list itself is a rate sheet: a small grid whose rows are score bands, one set of bands per loan product. Each band carries two inclusive bounds and one APR, so pricing a borrower is a lookup — find their product, find the band whose bounds contain their score, read the number. Two structural rules make a lookup trustworthy: the bands must cover the whole score range, and they must never overlap, or a score could find zero prices or two.",
        "Real pricing also has a human escape hatch. An underwriter — the person who approves or declines loans — can write an override: a specific APR attached to one applicant, justified by something the score cannot see, like a fresh job, a long deposit relationship or a compensating asset. Precedence is absolute: the override replaces the sheet rate whether it is better or worse, and any honest report marks which prices came from where. Without that label, a portfolio review cannot tell systematic pricing from human exception.",
        "The economics have a sharp edge called adverse selection: price everyone the same and the good risks walk away while the bad ones stay, so the pool sours and the price has to rise again. Charging risky borrowers more keeps the sheet sustainable for everyone else — which is why the band structure, and reading it correctly, is not bureaucratic decoration. It is the mechanism that keeps cheap credit possible for strong borrowers.",
      ],
      worked: [
        "Here is an auto sheet: scores 300-619 pay 14.4 percent, 620-719 pay 9.2, and 720-850 pay 5.8 — bounds inclusive.",
        "A borrower at 619 reads the first band: 14.4.",
        "A borrower at exactly 620 reads the second band: 9.2 — one score point moved the price by 5.2 points, which is why the inclusive bound matters.",
        "A borrower at 700 with an underwriter override of 8.0 pays 8.0, and the report labels it an override.",
        "A borrower at 860 finds no band at all: the sheet is silent, and only the LEFT-join shape keeps the borrower on the report instead of deleting them.",
      ],
      glossary: [
        { term: "credit score", def: "a number summarizing borrowing history, used to predict repayment" },
        { term: "APR", def: "the yearly cost of a loan expressed as a percent of the amount borrowed" },
        { term: "rate sheet", def: "the lender's internal price list mapping score bands to APRs per product" },
        { term: "band (tier)", def: "one inclusive score range carrying a single APR on the sheet" },
        { term: "override", def: "an underwriter-set APR for one applicant that replaces the sheet rate" },
        { term: "adverse selection", def: "the spiral where high prices drive good borrowers away and sour the remaining pool" },
      ],
      reallife: [
        "At a consumer lender the sheet lives in the loan-origination system, and pricing analysts own its contents: they re-tune band APRs when funding costs or default experience move. The engineering failure modes are unglamorous and expensive — a band gap that prices a boundary applicant NULL, an exclusive bound that shifts a whole tier's population, an override join that silently loses to the sheet. Each bug misprices real loans within seconds of deploying.",
        "The numbers drive decisions in both directions. Pricing teams raise a band's APR when its defaults creep up and watch origination volume respond; auditors sample priced loans and reconcile every override against its written justification; fair-lending reviews check that exception pricing does not correlate with anything it should not. The price_source column this problem builds is the first column of every one of those reviews.",
      ],
      where: "Pricing analysts, loan-operations engineers, credit-policy teams and internal auditors at banks, fintech lenders and buy-now-pay-later platforms.",
    },
  },
  {
    slug: "prepayment-detection",
    statement:
      "The loans table holds one row per loan — principal_cents, annual_rate_pct, monthly_payment_cents and term_months — and the payments table holds one row per installment actually received, where a prepaying loan's FINAL payment is a payoff that clears that month's interest plus the entire remaining principal. The scheduled walk follows the track's amortization engine: month 1 charges CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER) interest, every later month charges the same formula on the prior ending balance, the principal part is MIN(monthly_payment_cents - interest, remaining balance), and the walk stops once the balance closes at 0. Per loan, report term_months, months_taken (the COUNT of payment rows), actual_interest_cents (SUM(paid_cents) minus principal_cents), scheduled_interest_cents (the SUM of interest over the FULL term walk, ignoring the payments table for this column) and savings_cents (scheduled minus actual — the interest the bank never collected). Output loan_id first and order by loan_id ascending.",
    examples: [
      {
        input:
          "loan 2 — 60000 cents at 12.0 percent APR, 10370 scheduled for 6 months; the borrower pays four installments then a 20533 payoff at month 5",
        output: "2 · 6 · 5 · 2013 · 2115 · 102",
        explanation:
          "The four 10370 installments plus the 20533 payoff return the 60000 principal plus 2013 of interest; the full-term walk would have charged 2115, so the bank never collects month 6's 102.",
      },
      {
        input:
          "loan 3 — 80000 cents at 9.0 percent APR, 13750 scheduled for 6 months; the payoff lands at month 3",
        output: "3 · 6 · 3 · 1503 · 2105 · 602",
        explanation:
          "Two installments and a 54003 payoff cover the principal plus 1503 of interest, and the surrendered months 4 through 6 would have charged 302 + 201 + 99 = 602 — the savings column.",
      },
    ],
    constraints: [
      "all money is INTEGER cents and the entire output is INTEGER — annual_rate_pct is the schema's only REAL and never reaches the output",
      "the scheduled walk pins to the amortization engine: interest = CAST(ROUND(balance * annual_rate_pct / 1200.0) AS INTEGER) per month on that month's starting balance, principal part MIN(monthly_payment_cents - interest, balance), stop once the ending balance hits 0 — on this seed every walk closes exactly at term_months",
      "actual_interest_cents = SUM(paid_cents) - principal_cents and savings_cents = scheduled_interest_cents - actual_interest_cents; the payoff row pays that month's interest plus the whole remaining principal, so the identity holds on prepaying loans too",
      "every loan owns payment rows running contiguously from month 1, so the INNER joins to the aggregates are safe and months_taken equals the highest month_no on this seed",
    ],
    breakdown: [
      "This report is a reconciliation between two timelines. The scheduled timeline is the loan as signed — a recursive walk that charges interest on the declining balance for the FULL term and is completely blind to the payments table. The actual timeline is the payments table — the installments that really arrived, ending in a payoff that clears the remaining principal plus that month's interest. The report's whole story lives in the gap: months_taken below term_months marks the prepayment, and savings_cents prices the interest months that never happened.",
      "The scheduled column has one honest source: the recursive walk. Shortcut arithmetic reads close but lands wrong — payment times term minus principal reads 3960, 2220 and 2500 on this seed against the true 3932, 2115 and 2105, because it ignores the per-month ROUND the engine bakes into every month's interest. Freezing interest at the month-1 amount (charging 600 every month on the ORIGINAL principal) reads 7200, 3600 and 3600 — worse, and a different wrong. The walk rounds inside every month on the CURRENT balance, exactly as the amortization-schedule problem pinned it.",
      "The actual column is one GROUP BY away: SUM(paid_cents) per loan minus principal_cents, which works because every paid cent is either principal or interest and a payoff returns exactly what is left. Loan 2's four installments plus its 20533 payoff sum to 62013 — principal 60000 plus 2013 of actual interest — and loan 3's 81503 leaves 1503. The savings column then subtracts, and the sign is the contract: scheduled MINUS actual is what the bank LOST, which is what the borrower SAVED. Loan 1, which ran its full term, must read 0 — a free correctness check baked into the seed.",
    ],
    edges: [
      "Loan 1's payment pins at 10330 so the 120000-cent walk at 6.0 percent closes at EXACTLY 0 on month 12 — the final month's MIN cap trims the principal to the remaining 10251, and any sloppy sizing strands a stub balance and a phantom month.",
      "Flipping the savings sign reads 0, -102 and -602 — negative savings on loans that clearly saved money; scheduled minus actual, never the reverse.",
      "Reading months_taken from term_months instead of counting payment rows reports 6 and 6 for the prepaying loans — the COUNT is the prepayment signal itself.",
      "Building the scheduled walk from the payments table collapses it into the actual column and zeroes every savings cell; the walk must ignore payments entirely and run the full term.",
    ],
    ladder: [
      { title: "Brute force — two ledgers by hand", body: "Write the scheduled ledger month by month from the loan terms, then the actual ledger from the payment rows, and subtract the interest columns. Three loans is an hour of arithmetic; a mortgage book needs the walk expressed as data." },
      { title: "The pattern — recursive walk plus one GROUP BY", body: "WITH RECURSIVE builds the scheduled interest month by month and stops when the balance closes; a second CTE aggregates the payments table; the outer query joins the two timelines on loan_id and subtracts. Each timeline stays in its own CTE and the payments table never leaks into the walk." },
      { title: "The optimal idea — keep the timelines apart", body: "O(M + P): one pass over the M scheduled months plus one pass over the P payment rows. The durable rule: a variance report is two independent timelines joined at the end — the moment the actuals contaminate the schedule, the variance measures nothing." },
    ],
    approach:
      "WITH RECURSIVE scheduled-interest walk (amortization engine, full term, ignoring payments) joined to a payments GROUP BY; savings = scheduled minus actual, ordered by loan_id",
    schema: {
      ddl: `CREATE TABLE loans (
  loan_id               INTEGER PRIMARY KEY,
  principal_cents       INTEGER NOT NULL,
  annual_rate_pct       REAL NOT NULL,     -- APR in percent (12.0 = 12%)
  monthly_payment_cents INTEGER NOT NULL,
  term_months           INTEGER NOT NULL
);
CREATE TABLE payments (
  loan_id    INTEGER NOT NULL,
  month_no   INTEGER NOT NULL,
  paid_cents INTEGER NOT NULL,   -- one installment, a prepay's final row is a payoff
  PRIMARY KEY (loan_id, month_no)
);`,
      seed: `-- loan 1: 120000 at 6.0 percent, 10330 a month — the walk closes at EXACTLY
-- 0 on month 12, where the MIN cap trims the final payment to 10302
-- (51 interest + 10251 principal) and the borrower pays every month (savings 0)
-- loan 2: 60000 at 12.0 percent, 10370 a month — the SCHEDULE closes on
-- month 6, but the borrower stops after 4 installments and pays a 20533
-- payoff on month 5 (20330 remaining principal + 203 that month's interest)
-- loan 3: 80000 at 9.0 percent, 13750 a month — payoff at month 3: two
-- installments then 54003 (53601 remaining principal + 402 interest)
INSERT INTO loans (loan_id, principal_cents, annual_rate_pct, monthly_payment_cents, term_months) VALUES
  (1, 120000,  6.0, 10330, 12),
  (2,  60000, 12.0, 10370,  6),
  (3,  80000,  9.0, 13750,  6);
INSERT INTO payments (loan_id, month_no, paid_cents) VALUES
  (1, 1, 10330), (1, 2, 10330), (1, 3, 10330), (1, 4, 10330),
  (1, 5, 10330), (1, 6, 10330), (1, 7, 10330), (1, 8, 10330),
  (1, 9, 10330), (1, 10, 10330), (1, 11, 10330), (1, 12, 10302),
  (2, 1, 10370), (2, 2, 10370), (2, 3, 10370), (2, 4, 10370),
  (2, 5, 20533),
  (3, 1, 13750), (3, 2, 13750),
  (3, 3, 54003);`,
      tables: [
        { name: "loans", note: "3 loans — loan 1 runs its full 12 months; loans 2 and 3 are sized to close at exactly month 6 but prepay at months 5 and 3" },
        { name: "payments", note: "20 installment rows — 12 for loan 1 (eleven 10330 installments plus the capped 10302 closer), 5 for loan 2 ending in the 20533 payoff, 3 for loan 3 ending in the 54003 payoff" },
      ],
    },
    code: `WITH RECURSIVE sched(loan_id, month_no, interest_cents, ending_balance_cents) AS (
    -- month 1 of the SCHEDULED walk: interest accrues on the FULL principal
    -- and the payment's principal part caps at what is still owed
    SELECT
        loan_id,
        1,
        CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER),
        principal_cents - MIN(monthly_payment_cents - CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER), principal_cents)
    FROM loans
    UNION ALL
    -- every later month accrues on the prior ENDING balance and the walk
    -- runs the full term, stopping the moment the balance closes at 0
    SELECT
        s.loan_id,
        s.month_no + 1,
        CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER),
        s.ending_balance_cents - MIN(l.monthly_payment_cents - CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER), s.ending_balance_cents)
    FROM sched s
    JOIN loans l ON l.loan_id = s.loan_id
    WHERE s.ending_balance_cents > 0          -- closed: no phantom month
),
scheduled AS (
    -- the income the bank booked at signing, over the FULL term
    SELECT loan_id, SUM(interest_cents) AS scheduled_interest_cents
    FROM sched
    GROUP BY loan_id
),
actual AS (
    -- the installments that really arrived, payoff included
    SELECT loan_id, COUNT(*) AS months_taken, SUM(paid_cents) AS total_paid_cents
    FROM payments
    GROUP BY loan_id
)
SELECT
    l.loan_id,
    l.term_months,
    a.months_taken,
    a.total_paid_cents - l.principal_cents AS actual_interest_cents,
    sc.scheduled_interest_cents,
    sc.scheduled_interest_cents - (a.total_paid_cents - l.principal_cents) AS savings_cents
FROM loans l
JOIN actual a ON a.loan_id = l.loan_id
JOIN scheduled sc ON sc.loan_id = l.loan_id
ORDER BY l.loan_id ASC;`,
    walkthrough: [
      "The sched recursion is the amortization engine wearing a narrower projection: it carries only the interest and the ending balance, seeds month 1 from the full principal, and stops once a balance closes at 0. Loan 1 walks twelve months — 600 interest on month 1, 551 on month 2, down to 51 on month 12 when the MIN cap trims the principal to the remaining 10251 and the balance lands on exactly 0. Loans 2 and 3 close on month 6 of the SCHEDULE — their early exits live only in the payments table, which the walk never reads.",
      "The scheduled CTE folds the walk into one figure per loan: 3932 cents of interest over loan 1's twelve months, 2115 over loan 2's six and 2105 over loan 3's six. The actual CTE reads the payments table instead: 12 payment rows for loan 1 (123932 cents — the twelfth is the capped 10302, not another 10330), 5 for loan 2 (62013) and 3 for loan 3 (81503), each grouped with its COUNT as months_taken. Subtracting each loan's principal from its total paid gives the actual interest — 3932, 2013 and 1503 — and the identity works on prepaying loans because the payoff returns exactly the remaining principal plus one month of interest.",
      "The final SELECT joins the two timelines on loan_id and subtracts: loan 1 reads savings 0 — it ran its full term — while loan 2 costs the bank its month-6 interest of 102 and loan 3 costs months 4 through 6 at 302 + 201 + 99 = 602. months_taken (12, 5, 3) against term_months (12, 6, 6) is the prepayment signal sitting in plain sight. ORDER BY loan_id ASC ships the three rows in contract order, every cell an INTEGER.",
    ],
    time: "O(M + P) — the recursion emits one row per scheduled month (24 here) and the payments GROUP BY passes the P payment rows once",
    space: "O(M) — the schedule materializes before the fold",
    followUps: [
      "Add a running_interest column to the scheduled walk so each month shows cumulative interest to date — at which month does loan 1 cross half of its 3932-cent total?",
      "Express savings as a percentage of scheduled interest and rank the loans by it — does the earliest prepay win on percentage as well as on cents?",
    ],
    related: ["loan-amortization-schedule", "daily-balance-interest", "npv-queries"],
    order: "exact",
    xp: 35,
    primer: {
      hook: "A loan paid off early is a small victory for the borrower and a quiet loss for the bank — prepayment analysis puts the exact number of cents on that loss.",
      concept: [
        "An installment loan repays in fixed monthly pieces, and each piece splits in two: interest, which is rent on the money still owed, and principal, which actually shrinks the debt. Month 1 charges interest on the full amount borrowed; every later month charges on whatever is left, so the interest share shrinks and the principal share grows. Run that walk to the end of the term and the balance lands on exactly zero. The interest parts, summed over the whole term, are the income the bank expected when it signed the loan.",
        "Borrowers often do not run the whole race. They sell the car early, inherit money, or refinance into a cheaper loan — and they clear the remaining balance in one final payment called a payoff. A payoff covers the current month's interest plus every cent of principal still outstanding. The loan closes months early, and every future month's interest — income the bank had scheduled — simply never happens.",
        "That lost income is prepayment risk, and it cuts both ways. The borrower saves the remaining interest — the same number the bank mourns, which is why the report calls it savings. For the bank it is worse than missing income: the retired money must be lent again at TODAY's rates, and prepayment waves arrive precisely when rates have fallen, so the reinvestment pays less too. Some contracts fight back with prepayment penalties — fees charged on early payoff to make rushing less attractive.",
        "This is why lender teams forecast with two columns. Scheduled interest is the signed-contract fiction; actual interest is what arrived; the gap between them is the live measure of how fast the book is prepaying. Treasury feeds that gap into interest-income forecasts, and a book whose gap widens faster than forecast loses budgeted income month after month.",
      ],
      worked: [
        "Take a 12000-cent loan at 12 percent APR — 1 percent of the balance per month — repaid in six installments of 2100 cents.",
        "Walk the schedule: month 1 charges 120 interest, month 2 charges 100 on the lower balance, then 80, 60, 40 and 19 — the balance closes at exactly 0 on month 6, and scheduled interest sums to 419 cents.",
        "The borrower prepays after month 3: the payoff is the 6000-cent remaining balance plus that month's 80 interest, a single 6080-cent payment.",
        "Actual interest is therefore 120 + 100 + 80 = 300 cents, and months taken is 3 of the scheduled 6.",
        "Savings = 419 - 300 = 119 cents — exactly the interest months 4, 5 and 6 would have charged (60 + 40 + 19), the income the bank never collects.",
      ],
      glossary: [
        { term: "amortization", def: "the fixed-payment schedule that splits each installment into interest and principal" },
        { term: "payoff", def: "the final payment clearing one month's interest plus the entire remaining principal" },
        { term: "prepayment", def: "retiring a loan ahead of its term, skipping every remaining month's interest" },
        { term: "prepayment risk", def: "the lender's exposure to losing scheduled interest income when borrowers pay early" },
        { term: "refinance", def: "replacing a loan with a new one at better terms, which forces a payoff of the old" },
        { term: "prepayment penalty", def: "a contract fee on early payoff that discourages borrowers from rushing" },
      ],
      reallife: [
        "Mortgage servicing and treasury teams live in this report. At signing, a loan's scheduled interest is budgeted income; every quarter the finance function compares it to what actually arrived, and the gap is the prepayment speed of the book. When central-bank rates fall, refinancing waves hit and the gap widens in weeks — the same loans that were safe assets become income disappointments.",
        "What breaks is usually contamination between the timelines: a forecast built from the payments table instead of the contract schedule measures the past and calls it the future, and a savings column with a flipped sign turns a loss report into a gain. The numbers drive hard decisions — whether to hedge the book's income, how to price new loans, whether prepayment penalties are worth the customer resentment. This exact two-timeline reconciliation is a standard exercise in interviews for those teams.",
      ],
      where: "Mortgage analytics, asset-liability management, treasury and loan-servicing teams at banks, credit unions and fintech lenders.",
    },
  },
];
