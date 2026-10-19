// Chime — kit 13 of the Fintech & Payments domain (Batch L, wave 7).
// Fee-free neobanking: the storefront db read as a member funding book —
// orders are funding events on member accounts (delivered = deposit landed,
// shipped = settling, pending = awaiting the payroll file, cancelled =
// reversed), order_items are the allocation lines inside a funding event
// (Spending/Savings splits), customers are members, suppliers are the
// funding rails, products are account tiers and card plans (price = the
// tier's limit — max $199.99, the premium band >= $200 is empty, the
// catalog-level proof of fee-free positioning), invoices are monthly
// statement cycles, payments are repayment legs on two rails (card =
// instant repay from Spending, wire = manual ACH, both INTEGER cents),
// expenses are opex and ledger_entries are the GL. Deposit landed-share,
// SpotMe repayment coverage and statement backlogs are the daily bread.
// Pool provenance: 0 tagged LC rows for Chime — the whole pool is
// theme-curated to known deposit-engagement and repayment-coverage screen
// shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
// Expanded in place (Task 95, 3x spec, APPEND-ONLY): brief 6, dayInLife 4,
// metrics 12, topics 15, theory 24, mcqs 30, cases 6, problems 32 — original
// entries byte-identical. New cases run s6 / q5 / x3 / l8 (the existing pair
// used j5 + t5); pool stays 0 tagged LC for Chime, theme-curated, and says so.

import type { CompanyKit } from "../types";

export const chimeKit: CompanyKit = {
  id: "chime",
  domainId: "fintech",
  name: "Chime",
  tagline: "Fee-free neobanking: spots, deposits, Credit Builder",
  accent: "text-teal-300",

  brief: [
    "Chime is the fee-free neobank — direct deposits land, SpotMe spots the gap, the Credit Builder card builds the file, and the whole product is engineered so members never pay for the privilege. The analytics reality is engagement engineering wearing a banking badge: every funding event either lands, settles, or reverses, and the repayment book behind the advances is the margin. On this storefront db the mapping is honest: `orders` are member funding events (103 of them), order_items are the allocation lines inside an event (251 — about 2.4 lines each), customers are members, and suppliers are the funding rails the deposits ride in on. Event outcomes mirror the status mix exactly: **52 landed** (50.5%), **30 settling** (29.1%), **14 pending** (13.6%), **7 reversed** (6.8%) — and shipped_at is the settlement timestamp, populated only for the 82 events that got there.",
    "The data org splits into engagement, risk, and the money-movement desk. Engagement owns the member funnel: EU members ran 45 events from 8 accounts, APAC 37 from 5, US 19 from 2, LATAM 2 from 1, and funding concentrates hard — **63.5%** of volume from members whose lifetime funding crosses $3,000. Risk owns the ladder: 28 statement cycles against 27 repayment legs, INTEGER cents end to end, with the standing contradictions — cycle #11 is {rose:void} yet carries a $925.00 repayment leg, #28 reads {emerald:paid} with nothing behind it ($1,756.00), and one statement sits {amber:partial} at $4,000.00 of $6,148.00. Money movement owns the rails: instant card repayments run 16 legs for **$37,364.00**, manual ACH 11 for $32,248.00, and five cycles repay in two legs (1, 5, 12, 19, 22).",
    "Interview style is denominator-first, then the backlog. A screen opens with a conditional count (landed share — *of all events, or only the 82 that settled?*), moves to the two-table read (repayment legs joined onto statement cycles, where one wrong key pairs a leg with the wrong cycle), escalates into the {emerald:anti-join} — statements carrying zero legs — where the collections queue lives, and lands on the leaderboard: members ranked by funding volume with an explicit tie-break. The graded habits: state the denominator, keep the `LEFT JOIN` alive, and never let a void-with-a-leg hide inside a paid average.",
    "Preparation: the registry tags zero SQL problems for Chime — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror deposit-engagement and repayment-coverage screens — conditional folds, anti-joins for untouched statements, NULL policies for missing settlement timestamps, month walks and leaderboards. Then run all six case studies on the live db: one rebuilds the {emerald:repayment backlog} census credit ops ships weekly (6 statements / $15,217.00 untouched), the other rebuilds the {violet:member funding leaderboard} the engagement review opens with ($7,262.35 leading). Say the denominator, the join key and the NULL policy out loud before you compute — at a fee-free bank, the spreadsheets are the fees.",
    "Beyond the funding book sits the Credit Builder desk, and it reads the same tables with a risk lens. The card is reserve-backed, so the interesting column isn't credit — it's discipline: {violet:utilization bands}, repayment coverage, and the {sky:Credit Builder} funnel that graduates thin-file members into a real file. On this db the repayment ladder IS that program's proxy: 28 statement cycles against 27 legs on two rails, and a coverage census that must classify exact / partial / none without letting a {rose:void}-but-repaid cycle or a paid-but-unmoved one launder the number. *The risk team's rule of thumb: a KPI is a definition before it is a query* — direct-deposit attach, SpotMe repayment rate, NSF incidence and member transaction frequency all get argued at the denominator before anyone writes SQL, and the theory section below drills exactly those arguments.",
    "Prep the mechanics, not the trivia. The convention to say out loud before any fintech query: `invoices`, `payments`, `expenses` and `ledger_entries` are **INTEGER cents** — fold in cents, divide by 100.0 exactly once at the display edge, and never CAST the sum to INTEGER before dividing (the $34,833.28 book truncates to a **338** average under cast-then-divide). The screens are live db, not whiteboard: one two-table read with a deliberate id-coincidence trap, one anti-join that must keep the legless, one leaderboard with a named tie-break — and the close, the GL tie-out where {emerald:debits 181,080} equals {emerald:credits 181,080} and *a delta that isn't zero is the whole interview*. Rebuild all six case files below until the fills are reflexive; then run them again and narrate the denominator before every count.",
  ],

  dayInLife: [
    "**08:10 —** The day starts on the funding dashboard. First query is the overnight read: events by outcome — 52 of 103 landed all-time, the {rose:reversed} share watched hardest (6.8% book-wide) — then the payroll-file check: any member's deposit stuck pending past the morning window? The morning artifact is a two-grain count: 251 allocation lines across only 103 funding events, because an event splits into Spending and Savings legs — *a census that can't say both grains out loud is the one that double-counts a deposit during close*. A mismatch pages money-movement ops, not a shrug.",
    "**11:30 —** Midday is repayment surgery. The backlog anti-join runs: every statement folded against its legs, the legless isolated — **6 statements worth $15,217.00**, five open plus #28 which reads {emerald:paid} with nothing behind it — and the contradictions named, not smoothed: #11 is {rose:void} with a $925.00 leg on the books, #25 sits {amber:partial} at $4,000.00 of $6,148.00. Rails walk beside the ladder: card 16 legs / $37,364.00 against wire 11 legs / $32,248.00 — *instant repayment from Spending is the rail the product nudges, and the mix proves the nudge works*. Each ladder ships with the LEFT JOIN shown, so the legless survive the render.",
    "**16:00 —** The afternoon is the engagement cycle. The review opens on the {violet:member leaderboard}: $7,262.35 across 24 events leading, $6,640.56 and $4,574.23 behind it, RANK ordered with the tie-break stated — four members tie at 4 events and the next rank skips. The {sky:concentration} read lands harder: 63.5% of volume from the $3,000-plus cohort, so one churned whale moves the book. The walk charts months via SUBSTR with LAG deltas, the first month's NULL left honest, and every branch reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
    "**19:15 —** The EOD writeup closes the loop. The pack reconciles its own arithmetic before it ships: ladder pieces fold back to 28 cycles, rails fold back to 27 legs, and the ledger tie-out prints {emerald:delta zero} one last time. Tomorrow's screens get staged tonight — the {violet:direct-deposit attach} census needs its denominator stated (members with a repeat landed event, of all funded members), and the utilization-band migration needs a CASE ladder whose ELSE is a contract, not a leak. *The last line of the writeup is always the same*: which contradiction is still open — this week it's #28, paid on paper with $1,756.00 and nothing behind it — and whose queue owns it.",
  ],

  metrics: [
    { name: "Deposit landed share", what: "Landed events ÷ ALL funding events: 52 of 103 (50.5%). The engagement headline — and the denominator argument ('of all events, or only the 82 that settled?') is the interview before the metric." },
    { name: "Reversal rate", what: "Reversed ÷ all events: 7 of 103 (6.8%). The trust killer at a fee-free bank — a reversed deposit is the member experience the whole product is built to avoid." },
    { name: "Settlement latency", what: "JULIANDAY(shipped_at) − JULIANDAY(created_at) over settled events: 2.98 days average, tight 2-to-4 spread. The 'get paid early' clock — computed over the 82 settlements, never over NULL pending timestamps." },
    { name: "Funding concentration", what: "Share of volume from members above a lifetime threshold: 63.5% from the $3,000-plus cohort, 71.2% from $2,000-plus. The whale read that decides whether engagement or exposure owns the roadmap." },
    { name: "Repayment rail mix", what: "Repayment legs by rail: card 16 legs / $37,364.00 vs wire 11 legs / $32,248.00 — 27 legs onto just 22 distinct statements. Which repayment path the product is actually winning." },
    { name: "Statement coverage", what: "Cycles classified exact / partial / no legs: 21 / 1 / 6. The $65,612.00 exact book settles clean; the ladder is how risk proves it instead of asserting it." },
    { name: "Repayment backlog", what: "Statements with zero legs: 6 worth $15,217.00 — five open, plus #28 which reads paid with nothing behind it. The collections queue and the data-quality queue, in one anti-join." },
    { name: "Plan ceiling", what: "Max plan price on the catalog: $199.99 — the premium band (>= $200) is empty. The catalog-level proof of fee-free positioning, checked every pricing review." },
    { name: "Direct-deposit attach", what: "Members with a repeat landed event ÷ ALL members with any event in the window — the recurring-payroll habit the product rides on. On this book only 2 of 16 members are one-and-done, but the KPI is the denominator argument: a landed-only denominator deletes the unattached and flatters the funnel." },
    { name: "Member frequency spread", what: "Funding events per member: the book runs 2 to 24 events wide — one whale carries 24, four members tie at 4 — and frequency is the engagement signal that concentration (63.5%) amplifies into an exposure read." },
    { name: "SpotMe repayment coverage", what: "Exact-settled cycles ÷ cycles that carry legs: 21 of the 22 cycles the 27 legs touch — never ÷ 28, because the six legless aren't repayment outcomes, they're the collections queue." },
    { name: "Opex mix", what: "The cost side of fee-free: Rent $16,800.00 of the $25,416.00 book across 36 expense rows (Ads $4,570.00, Travel $2,521.00, Tools $1,525.00) — the spend report finance reads beside the repayment ladder." },
  ],

  topics: [
    {
      name: "Funding-event folds & conditional counts",
      why: "Every engagement read at Chime is a fold with a conditional count inside: events per day, landed per rail, reversed per member. The denominator question rides on every one — COUNT(*) over all events versus the settled subset is the difference between a landed rate and a settlement rate.",
      slugs: ["user-activity-for-the-past-30-days-ii", "article-views-ii", "game-play-analysis-i", "maximum-transaction-each-day"],
    },
    {
      name: "Two-table reads: legs onto statements",
      why: "Repayment analytics is a two-table read: legs carry the statement's foreign key, statements carry the status and the billed amount. One wrong join key pairs a leg with the wrong statement and every coverage number downstream inherits the fiction — the id-coincidence trap (leg id equals cycle id) is exactly the silent mis-pairing Chime screens hunt.",
      slugs: ["replace-employee-id-with-unique-identifier", "employee-bonus", "product-price-at-a-given-date", "number-of-accounts-that-did-not-stream", "duplicate-charge-pairs", "journal-gap-detection", "circular-transfers"],
    },
    {
      name: "Untouched-statement anti-joins",
      why: "Six statement cycles carry zero repayment legs — the collections anti-join. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the joined table in WHERE, which converts the join and deletes exactly the backlog you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "dormant-reactivation"],
    },
    {
      name: "NULL policy: void legs & missing settlements",
      why: "Statement #11 is void with a leg; #28 is paid with none. SUM over missing legs is NULL, not zero, and COUNT(column) versus COUNT(*) diverges exactly there. The policy — audit, report, or guard — is a stated decision, not a default.",
      slugs: ["employees-with-missing-information", "books-with-null-ratings", "find-customer-referee", "null-blank-audit"],
    },
    {
      name: "Settlement clocks & interval logic",
      why: "The deposit-to-settlement clock is date arithmetic: JULIANDAY deltas per event, events overlapping payroll windows, advances whose repay lag by days. The NULL settlement timestamp is the standing trap — pending is not slow, and averaging over it fabricates the SLA breach.",
      slugs: ["rising-temperature", "users-that-actively-request-confirmation-messages", "calculate-parking-fees-and-duration", "median-time-to-convert"],
    },
    {
      name: "Funding calendars & month spines",
      why: "The book runs on calendar buckets: events per month via SUBSTR, payroll windows, statements issued in a period. Half-open intervals and month keys are the mechanics, and the midnight boundary is where two 'identical' engagement reports disagree.",
      slugs: ["monthly-transactions-i", "friday-purchase-iii", "list-the-products-ordered-in-a-period", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "LAG/LEAD volume walks",
      why: "The volume walk is LAG-shaped: this month's funding events minus last month's, the first row's NULL delta part of the story — no prior month, no delta. Hand-waving it to zero mislabels the baseline the engagement review quotes.",
      slugs: ["week-over-week-churn", "consecutive-numbers", "year-on-year-growth-rate", "growth-accounting"],
    },
    {
      name: "Coverage CASE bands",
      why: "The coverage ladder is CASE arms evaluated in order: no legs first, exact only when settled equals billed, partial is the ELSE. Arm ordering matters — a statement the earlier arms don't catch lands in the ELSE by definition — and Chime's screens test whether the ELSE is a contract or a leak.",
      slugs: ["loan-types", "count-salary-categories", "weather-type-in-each-country", "credit-utilization-bands", "suspicious-bank-account-transactions", "delinquency-buckets", "consecutive-transactions-with-increasing-amounts", "structuring-detection", "find-third-transaction", "ar-aging-schedule"],
    },
    {
      name: "Leaderboards & per-group argmax",
      why: "The engagement review reads leaderboards: members by funding volume, top rail by settled value, peak deposit hour per cohort. Argmax-over-group is the shape, and the deterministic tie-break (value, then name) is what keeps the board stable between renders — four members tie at 4 events and the next rank skips.",
      slugs: ["rank-scores", "top-earners", "find-peak-calling-hours-for-each-city"],
    },
    {
      name: "One-pass censuses & reconciliation",
      why: "Every pack wants everything in one pass: total events, landed count, reversed count, per-rail splits — FILTER (WHERE …) folds them side by side. The one-scan identity (the pieces must sum back to the whole) is the reconciliation the pack ships with.",
      slugs: ["snaps-analysis", "count-the-number-of-experiments", "total-traveled-distance"],
    },
    {
      name: "Window frames & running balances",
      why: "The funding position walk is a frame question: cumulative volume per member, trailing-event exposure for SpotMe limits, running repayment totals per rail. The default frame is RANGE — same-key peers join the frame together — and same-day payroll batches are exactly the ties that make a 'running total' jump. ROWS versus RANGE is the difference between a per-event walk and a per-day fold, and the screens hide a tie in the data on purpose.",
      slugs: ["find-cumulative-salary-of-an-employee", "account-balance", "running-total-for-different-genders", "balance-rollforward", "daily-balance-interest", "bank-account-summary", "bank-account-summary-ii", "biggest-window-between-events", "trial-balance-check"],
    },
    {
      name: "Set ops on the money rails",
      why: "Card and wire legs are two populations that report side by side: stack the rail censuses with UNION ALL, diff rail coverage with EXCEPT, and keep the arms column-aligned. UNION's dedup is the trap — two arms folding to the same (rail, month, count) tuple collapse into one row and a repayment census silently loses a leg. At a two-rail bank, set ops are the reconciliation grammar.",
      slugs: ["league-statistics", "count-apples-and-oranges", "tournament-winners", "keep-latest-dedupe"],
    },
    {
      name: "Derived tables & staged folds",
      why: "The cleanest per-member reads stage a fold in FROM — one row per member — then compare in the outer query: the whale-share read (63.5% of volume from the $3,000-plus cohort) is exactly a derived fold under a conditional sum. A derived table runs once, unlike the correlated cousin that re-runs per outer row, and it demands an alias the way a CTE demands a name. Chime's harder screens hand you a 'compare each member to the book' prompt and grade the staging.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "orders-with-maximum-quantity-above-average", "transaction-velocity", "cohort-retention-matrix"],
    },
    {
      name: "Percentile tiles & rolling averages",
      why: "Funding tiers are window work: NTILE and PERCENT_RANK cut the member book into whale / mid / long-tail bands the engagement review prices differently, and a rolling landed-deposit average needs a frame that stays honest across quiet days. The trap is the tie — PERCENT_RANK shares peer values, and the tier a member lands on can be an artifact of the ORDER BY. Say the frame out loud before the tile.",
      slugs: ["usage-tier-percentiles", "top-percentile-fraud", "rolling-average-steps", "delinquency-roll-rates", "restaurant-growth", "rolling-7d-actives"],
    },
    {
      name: "Streaks, gaps & deposit cadence",
      why: "Payroll cadence is islands work: consecutive landed-deposit days per member, the biggest quiet window between events (LEAD), burst sessionization when a member funds three times in an hour. The gaps-and-islands shape — ROW_NUMBER minus date, then group — is the same move whether the unit is days or events, and it feeds the dormancy and winback cohorts directly.",
      slugs: ["report-contiguous-dates", "sessionize-events", "find-the-start-and-end-number-of-continuous-ranges", "monthly-transactions-ii", "winback-recovery", "basket-depth-aov"],
    },
  ],

  theory: [
    {
      id: "chime-t1",
      q: "A funding event counts as landed once it reaches the settled state. In a query reporting landed share by rail, where does that rule live — and what breaks when it lands in HAVING instead?",
      a: "The settled test is a row-level fact — the event's status on one row — so it belongs in WHERE (if settled events are the population) or inside the aggregate as SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) (if the share compares landed to all). Once folded by rail, the row-level comparison no longer exists: HAVING can only judge group aggregates. The classic failure is folding all events per rail and trying to subtract 'the unsettled' in HAVING — they're already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one event, or about a rail? At Chime that question is the product promise itself: a landed-share rule in the wrong clause doesn't error, it reports a deposit experience that never existed.",
      tag: "pipeline",
    },
    {
      id: "chime-t2",
      q: "Repayment legs join onto statement cycles. A teammate joins on the primary keys instead — and the totals still look right. Walk me through why, and the guard you'd add.",
      a: "On this book the ids collide: 27 repayment rows with ids 1..27 against statement ids 1..28, so i.id = p.id matches nearly every leg by coincidence — same row counts, plausible sums, wrong pairings, and nothing errors. The silent mis-pairing is the worst failure mode in a repayment book because the backlog census inherits it downstream. The guard is mechanical: join on the declared foreign key p.invoice_id, then verify the join didn't change grains — COUNT(*) legs (27) and COUNT(DISTINCT invoice_id) statements (22) before and after the join; spot-check one known statement by hand (#25 must pair only with its $4,000.00 leg, never a wire leg from another cycle); and fold per statement id in a CTE so the split cycles (1, 5, 12, 19, 22) sum once each. At Chime the join key IS the audit trail — a coverage ladder built on an id coincidence is fiction with a footer.",
      tag: "joins",
    },
    {
      id: "chime-t3",
      q: "27 repayment legs land across 22 statement cycles. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over repayment legs reads 27 — leg events, the rows the rail logged. COUNT(DISTINCT invoice_id) reads 22 — statements served, the business object. COUNT(invoice_id) also reads 27 because the FK is never NULL — NULL-skipping is not deduplication. The gap is five statements that repay in two legs (1, 5, 12, 19, 22), and folding naively inflates the money story: SUM over a leg-grain fold reads $69,612.00 where the exact statement book is $65,612.00 — the $4,000.00 difference is the partial #25 repaying early, visible only after folding per statement. The two-grain scorecard folds once and counts twice: per rail, legs AND distinct statements side by side. The habit the interviewer grades: before any COUNT, say 'one row per what?' — leg event, statement, rail bucket. Both numbers ship, to different audiences, on purpose.",
      tag: "aggregation",
    },
    {
      id: "chime-t4",
      q: "Statement #11 is void but repaid for $925.00; statement #28 is paid with no repayment leg at all. Your coverage query COALESCEs missing legs to zero. What does the committee see — and what should it see?",
      a: "As written it sees a clean book: #28's missing leg becomes $0.00, the SUM reads 0 for a statement marked paid, and the contradiction is laundered into a footnote nobody reads. Worse, #11's leg still counts — a void statement contributing $925.00 to 'repaid' value — so the census is wrong in both directions at once. The honest versions: keep NULL as NULL and classify with CASE — WHEN settled IS NULL THEN 'no legs' — so the six untouched statements ($15,217.00) surface as a population, not a zero; and carry the status column beside the fold so void-but-repaid #11 and paid-but-unmoved #28 print as the contradictions they are. The general policy: NULL settlement means 'no evidence yet', not 'repaid for nothing'. COALESCE to zero invents evidence; COALESCE to a sentinel poisons the sum. At Chime the NULL policy is the audit — the interviewer wants the contradictions named before the totals, not defended after.",
      tag: "nulls",
    },
    {
      id: "chime-t5",
      q: "Build the month-over-month funding volume walk. Where do LAG's edges bite — the first row, ties, and the ORDER BY?",
      a: "Stage the fold first — month buckets via SUBSTR(created_at, 1, 7), COUNT(*) per bucket — then delta over it: events - LAG(events) OVER (ORDER BY month). The edges: the first month's LAG is NULL, so its delta is NULL — report it as NULL (no prior month, no delta), never COALESCE to zero, which manufactures a baseline out of nothing. The ORDER BY inside OVER is the entire meaning of 'previous': order by the month key, not by volume — ordering by the measure makes 'previous month' mean 'the month with the next-lower count', a different and quietly wrong series. Ties in the sort key would need a tie-break, but a month key is unique by construction — say that, rather than assuming it. On this book the walk reads 8, 9, 8, 7 … with small deltas, which is exactly why the edges matter: a wrong ORDER BY on a flat series is invisible until the quarter the board quotes it.",
      tag: "windows",
    },
    {
      id: "chime-t6",
      q: "WHERE volume > (SELECT AVG(volume) FROM events WHERE region = 'moonlight') — no members fund from moonlight. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and volume > NULL is UNKNOWN, so WHERE passes nothing: an above-average-member report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — 'it worked for the EU book' is the bug report. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error — on this book, eight members carry two or more statement cycles, so (SELECT status FROM invoices WHERE customer_id = c.id) explodes the moment it runs. The correlated cousin — above THIS member's own trailing average, re-run per outer row — is a different question with a different cost. At Chime the follow-up is always: what population did the inner fold cover, and does empty mean 'nothing is above average' or 'nothing was measured'?",
      tag: "subqueries",
    },
    {
      id: "chime-t7",
      q: "Settlement latency averages 2.98 days with a 2-to-4 spread. How do you compute it, bucket it, and where does BETWEEN break?",
      a: "Compute: JULIANDAY(shipped_at) - JULIANDAY(created_at) per settled event, aggregate, then ROUND(..., 2) exactly once at the display edge — 2.98 is a single final round, not a per-row one. Restrict to shipped_at IS NOT NULL explicitly and say the population (82 settlements) — relying on AVG's NULL-skipping hides the restriction inside the function while the report claims all 103. Bucket by SUBSTR(created_at, 1, 7) for the monthly calendar, or CASE-band the latency itself for the SLA histogram. Windows: half-open intervals — created_at >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and double-counts exactly the midnight boundary when month-end deposits land. And the spread matters more than the mean: a tight 2-to-4 spread is a stable payroll rail; the same mean with a long tail is an incident queue — the query should print fastest and slowest beside the average.",
      tag: "dates",
    },
    {
      id: "chime-t8",
      q: "Your coverage ladder prints 21 exact, 1 partial, 6 no legs. Finance says the pieces don't add up to the book. Reconcile it.",
      a: "The pieces must fold back on two axes, and both checks are the audit. Counts: 21 + 1 + 6 = 28 statements — nothing dropped. Dollars: exact $65,612.00, partial $6,148.00, no legs $15,217.00 — that folds to $86,977.00, the full statement book (paid $66,443.00 + open $19,609.00 + void $925.00). The traps hide at the seams: the void #11 carries a $925.00 leg, so a 'repaid' sum over legs reads $69,612.00 — the extra $4,000.00 beyond the exact book is the partial #25's early repayment, and the $925.00 is a void contributing to settled value. The fix is definitional: reconcile billed-by-class to status-by-status, then reconcile repaid-by-leg separately, and never let one query serve both meanings. At Chime a ladder that doesn't fold back isn't a rounding bug — it's the backlog hiding, and the reconciliation IS the deliverable.",
      tag: "quality",
    },
    {
      id: "chime-t9",
      q: "A cumulative funding position: SUM(total) OVER (ORDER BY created_at). What frame runs by default, and where do ties bite?",
      a: "With an ORDER BY and no frame clause, the default is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE is value-based, not row-based: every event sharing the current row's created_at is a peer and enters the frame together, so same-day payroll batches make the 'running total' jump by the whole batch at once. That's defensible for a daily fold and wrong for a per-event walk. If the read is exposure per event, say ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW explicitly, or ORDER BY created_at, id to break the tie deterministically. The silent version is worse than the loud one: nothing errors, the walk just disagrees with itself by exactly the size of the day's batch. At Chime same-day deposits are the norm — payroll lands in batches — so the tie isn't an edge case, it's Tuesday.",
      tag: "frames",
    },
    {
      id: "chime-t10",
      q: "Define direct-deposit attach the way you'd defend it in a metrics review — numerator, denominator, and the wrong version people ship.",
      a: "Numerator: members with at least two landed funding events inside the window — recurrence is the point; one deposit is a trial. Denominator: all members with any funding event in the window, pending and reversed included — they were acquired, they got paid, the deposit just didn't land. The wrong version everyone ships: landed-only denominators, which quietly delete the unattached from the population and print an attach rate that flatters the funnel. On this book the discipline is visible in miniature — 2 of 16 members are one-and-done and the whale end runs to 24 events — but the logic is identical at scale: attach is the recurring-payroll habit, it compounds with concentration (63.5% of volume from the $3,000-plus cohort), and it is the behavior the fee-free model actually monetizes. State the denominator before the numerator and the review goes your way.",
      tag: "kpi",
    },
    {
      id: "chime-t11",
      q: "The risk committee asks for the SpotMe repayment rate. Whose denominator wins — legs, cycles, or the whole book — and where does the void cycle go?",
      a: "Cycles carrying at least one repayment leg, with exact settlement as the numerator: 21 of the 22 cycles the 27 legs touch. 27 is a leg grain, 28 is the whole statement book, and the six legless cycles aren't repayment outcomes — they're the collections queue; putting them in the denominator measures dunning, not repayment. Then the contradiction: cycle #11 is void yet carries a $925.00 leg, so a leg-grain numerator counts money the ledger says doesn't exist. The defensible build excludes void from the numerator and surfaces it as its own line — void-but-repaid, $925.00 — because smoothing it into either rate launders a data-quality bug into a risk number. The rate is a definition before it's a query, and the committee can smell which one you ran.",
      tag: "kpi",
    },
    {
      id: "chime-t12",
      q: "NSF incidence: 7 reversed events this period. What's the right denominator, and how do you keep pending out of the story?",
      a: "All funding events: 7 of 103 is 6.8%, because NSF is a failure mode of the whole attempt population — an event that never got a settlement timestamp didn't get the chance to reverse, and a landed event that can't reverse isn't exposed. The two wrong denominators both inflate: settled-only (82) and landed-only (52) each delete members of the population whose outcome you care about. Pending is not NSF — pending is the payroll file still in flight, a queue position, not a failure; mixing it into a 'stress rate' turns a staffing question into a risk alarm. At a fee-free bank NSF isn't a revenue line, it's the trust line: the same 6.8% that risk reads as exposure, engagement reads as the member experience the product promised never to cause. Report rate and raw count together, because at this size one bad payroll day moves the percentage more than a quarter of product work.",
      tag: "risk",
    },
    {
      id: "chime-t13",
      q: "Member transaction frequency: how do you compute it, and what does this book's spread tell the engagement team?",
      a: "Folding one row per member and counting events is the shape — COUNT(*) GROUP BY member — but the two-grain discipline is what makes it honest: 103 events across 16 members averages 6.4 only if you're willing to average a book that runs from 2 events to 24, where one whale carries 24 and four members tie at 4. The spread is the story: a long right tail means the mean is a fiction the median doesn't rescue, so report the distribution — the 4-event tie (and the rank gap behind it), the one-and-done pair at the bottom, the whale at the top — and pair it with concentration: 63.5% of volume from the $3,000-plus cohort. Frequency without concentration is a habit read; together they're an exposure read. And keep the grains apart in the query itself: 251 allocation lines is a different population than 103 events, and a frequency computed over lines is a number nobody can act on.",
      tag: "engagement",
    },
    {
      id: "chime-t14",
      q: "You stack the card census on the wire census with UNION instead of UNION ALL. When does that report lie, and how do you stack it safely?",
      a: "UNION deduplicates the stacked result set, and two legitimately distinct rows can fold to identical tuples — a rail-month-count row and its re-run both read (card, 2024-03, 16) and collapse to one, and a repayment census silently loses a leg. The safe stack is UNION ALL for censuses: the arms are disjoint populations (a leg is card or wire, never both), so every row is signal and dedup can only destroy. Reserve UNION for the read where dedup IS the spec — DISTINCT member lists from two sources, or an exposure union where the same claim can genuinely arrive twice. Mechanics that bite either way: same column count and compatible types per arm, the label literal must sit in the same position in both arms, and ORDER BY at the bottom sorts the whole stack — it is not an arm property. At Chime the rail stack ships weekly; one UNION where ALL belonged is one missing repayment leg, and the fold-back is what catches it.",
      tag: "setops",
    },
    {
      id: "chime-t15",
      q: "Stage the whale-share read: 63.5% of funding volume from members whose lifetime volume crosses $3,000. Why is the derived table the right spine, and what does the outer query own?",
      a: "The inner fold — SELECT customer_id, SUM(total) AS volume FROM orders GROUP BY customer_id — is the only place the member grain exists, so it stages in FROM as a derived table with an alias (v), runs once, and hands the outer query 16 rows of member volume. The outer query owns the comparison: SUM(CASE WHEN volume >= 3000 THEN volume ELSE 0 END) / SUM(volume), times 100.0, rounded once — 63.5. The shape wins on three counts: it runs once instead of per-row (the correlated cousin re-executes for every outer row), it keeps the threshold test at the grain where 'lifetime' means something, and it makes the denominator explicit — SUM(volume) over the whole fold, not a WHERE that deletes non-whales and turns 63.5 into 100.0. Change the staging grain and the number changes meaning: fold by status instead and the same query prints 96.7, because settlement buckets clear the threshold as aggregates. The alias isn't ceremony — SQLite requires it, and 'v' is the contract that the fold is now a table.",
      tag: "subqueries",
    },
    {
      id: "chime-t16",
      q: "SUBSTR(created_at, 1, 7) and STRFTIME('%Y-%m', created_at) both bucket the funding calendar. When are they the same, when do they diverge, and which do you reach for?",
      a: "For month keys they're identical — I verified on this book that the two bucket sets differ by zero rows — and both sort correctly because the key is fixed-width TEXT. Divergence is everywhere else: STRFTIME owns the calendar — '%w' for weekday (weekend deposits are IN ('0','6'), and '%W' is week-of-year, the classic wrong-token trap), DATE(..., '+1 month') for spines, JULIANDAY for latency deltas — while SUBSTR is string surgery and will happily slice a malformed timestamp into a plausible-looking key. The tie-breaker is intent: a month key is a projection, so either works and the cheaper one wins; a calendar computation is a date function's job, and faking it with strings is how a 'weekend deposit' count silently includes Tuesdays. At Chime the month walk ships with SUBSTR keys and STRFTIME math, and the interview question is whether you know which is which.",
      tag: "calendar",
    },
    {
      id: "chime-t17",
      q: "The balance rollforward: opening balance plus landed events minus repayment legs. Where does COALESCE belong in that query, and where is it a lie?",
      a: "COALESCE belongs where zero is a fact: an account with no movement this period has a zero delta, and SUM's NULL on an empty partition would otherwise poison the arithmetic — COALESCE(SUM(legs), 0) in the rollforward's addend is correct because 'no legs' means 'no money moved'. It's a lie where zero is not evidence: a statement cycle with no repayment leg is a backlog, not a zero repayment — folding it to 0 converts the collections queue into settled debt, exactly the #28 trap (paid on paper, $1,756.00 behind it, nothing moved). The discipline: rollforwards COALESCE, censuses keep NULL and classify with CASE; the rollforward must land on the ledger's number (here an account net like cash's +44,196), and the census must land on a population. One clause, two meanings — say which one you're shipping.",
      tag: "balances",
    },
    {
      id: "chime-t18",
      q: "Pivot the repayment book by rail in one pass: card dollars, wire dollars, leg counts. CASE or FILTER — and where does ELSE decide the answer?",
      a: "Both are one-pass pivots and both are correct when built honestly: SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END) / 100.0 and COUNT(*) FILTER (WHERE method = 'card') are the same census in two dialects — 16 card legs / $37,364.00 against 11 wire legs / $32,248.00. ELSE decides correctness at COUNT: COUNT(CASE WHEN method = 'card' THEN 1 END) counts 16, because wire rows produce NULL and COUNT skips NULLs — but COUNT(CASE WHEN method = 'card' THEN 1 ELSE 0 END) counts 27, because ELSE 0 makes every row countable; the census silently became a row count. Under SUM the two agree (SUM skips NULL, 0 adds nothing), which is exactly why the bug hides — it only fires in the COUNT arm. My default: CASE for money (the ELSE 0 makes the zero explicit), FILTER for counts (the WHERE reads like the question), and the fold-back check either way — 16 + 11 must equal 27 before the pivot ships.",
      tag: "pivots",
    },
    {
      id: "chime-t19",
      q: "Most recent statement per member: correlated scalar in SELECT, or CTE with ROW_NUMBER joined back? Walk me through the cost instinct.",
      a: "The correlated scalar runs once per outer row — 16 members, 16 scans of the statement table — fine at this size, quadratic at real scale, and contractually fragile: two statements on the same late date and the scalar's zero-or-one contract explodes. The staged shape folds once: a CTE with ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY issued_on DESC, id DESC), filter rn = 1, join back — one pass over 28 cycles, deterministic via the id tie-break, and extensible (top-2, per-month, per-status are one parameter away). The instinct generalizes: fold to the grain you're comparing at, then join back; never re-fold per row. And keep the grain checks beside the query — 28 cycles, 11 members holding them, one row per member after the rn = 1 filter; a join-back that returns more rows than the CTE filtered is a fan-out you can catch in the same breath.",
      tag: "performance",
    },
    {
      id: "chime-t20",
      q: "Three roads to the collections queue: LEFT JOIN + IS NULL, NOT EXISTS, NOT IN. Which do you ship, and which one can silently return nothing?",
      a: "NOT IN is the one that lies: id NOT IN (SELECT invoice_id FROM ...) is TRUE only for values that compare unequal to every row — one NULL in the subquery and the whole predicate is UNKNOWN, zero rows return, and the backlog census empties while looking healthy. It's safe only when the subquery column is NOT NULL-declared and you say so out loud. LEFT JOIN + IS NULL is the readable classic and the only choice when you also need counts alongside the kept rows — the six legless cycles survive as rows with NULL payloads, which is how they make it into the render. NOT EXISTS is semantically cleanest: it states the question ('no leg exists for this cycle'), handles NULLs by construction, and short-circuits. On this book all three should print the same six statements / $15,217.00 — and reconciling any two of them is the cheapest data-quality check in the kit. Ship NOT EXISTS for audits, LEFT JOIN for the census-with-counts, and treat NOT IN as a code smell in a repayment context.",
      tag: "antijoin",
    },
    {
      id: "chime-t21",
      q: "Money columns here are INTEGER cents; order totals are REAL dollars. Walk me through the convention and the division traps it prevents.",
      a: "The convention: fold in the smallest exact unit — cents as INTEGER — and convert to dollars exactly once, at the display edge, with / 100.0. SUM over INTEGER cents is exact arithmetic; the drift lives in one place or nowhere. The traps it prevents: CAST(SUM(total) AS INTEGER) / COUNT(*) truncates the book before the division runs (the honest average of $34,833.28 over 103 events is 338.19; cast-then-divide prints 338); dividing cents by 100 mid-pipeline introduces REAL arithmetic before the fold instead of after; and AVG(amount_cents) / 100.0 is the only safe average — averaging per-row-divided dollars re-floats every row. ROUND belongs at the edge too, exactly once: ROUND(..., 2) on the displayed figure, never nested ROUNDs per stage, because each round is a silent write-down. At a fee-free bank the ledger is the product — cents in, cents out, one division at the glass — and the interview version of that discipline is refusing to CAST before you've folded.",
      tag: "money",
    },
    {
      id: "chime-t22",
      q: "The monthly funding walk needs quiet months zero-filled. Build the month spine — and tell me where the recursion guard goes.",
      a: "WITH RECURSIVE months(m) AS (SELECT '2024-01' UNION ALL SELECT STRFTIME('%Y-%m', DATE(m || '-01', '+1 month')) FROM months WHERE m < '2025-02') builds 14 month keys — anchor, increment, guard. The guard is the WHERE inside the recursive SELECT, and it's load-bearing: without it the recursion never terminates (the anchor says where to start; nothing says where to stop), and the query doesn't error — it runs away. Then LEFT JOIN the events fold onto the spine and COUNT(o.id), not COUNT(*): the star counts the spine row itself and quiet months read 1; the id reads the events and they read 0 — on this book the difference is 2024-06 and 2024-11, six events each, where a star-count spine shows phantom activity. The first month's NULL from the LAG deltas stays NULL; the spine's only job is to make absence visible. Recursive CTEs earn their keep exactly here: a calendar spine is a fixed, terminating, mechanical recursion — the one place recursive SQL is boring, which is the highest compliment.",
      tag: "recursive",
    },
    {
      id: "chime-t23",
      q: "Latest statement per member — RANK, DENSE_RANK, or ROW_NUMBER? What breaks with the wrong pick, and what does the tie-break need?",
      a: "ROW_NUMBER, always, for dedupe: the job is one row per member, and ROW_NUMBER is the only ranking function contractually guaranteed to produce exactly one rn = 1 per partition. RANK shares the rank across ties — two statements issued the same day both read rn = 1 and the join-back fans out, silently double-counting a member's latest cycle; DENSE_RANK has the same tie behavior with different gap semantics downstream. The ORDER BY needs a deterministic tail: issued_on DESC, id DESC — because issued_on alone leaves the tie to scan order, and a read that flickers between renders is the bug report nobody can reproduce. This is the mirror of the leaderboard question: RANK is right when ties should share (the funding leaderboard's four members at 4 events), ROW_NUMBER is right when ties must break (a per-member latest read). At Chime the statement ladder dedupes with ROW_NUMBER, and the id DESC tail is the difference between a reconciliation that ties and one that 'usually ties'.",
      tag: "argmax",
    },
    {
      id: "chime-t24",
      q: "The GL tie-out: debits 181,080, credits 181,080, delta zero. What does that prove, what does it NOT prove, and which account nets do you read beside it?",
      a: "It proves the book is internally consistent — every entry posts both sides, so SUM(debits) = SUM(credits) is the double-entry invariant, and a delta that isn't zero is a missing row or a double post, not a rounding artifact (INTEGER cents don't round). It does NOT prove the book is correct: the void-but-repaid cycle (#11, $925.00) is fully balanced — the money moved, the cycle is void — and the tie-out shrugs; a balance proof answers 'is the ledger self-consistent', never 'is the story true'. The account nets are the real read: cash +44,196 (money on hand), accounts_receivable +16,440 (billed, uncollected — the backlog's ledger shadow), operating_expenses +25,416 (the fee-free cost base), sales_revenue −86,052 (negative because revenue is credit-normal — a negative net here is healthy, not a loss). Read them as a set: AR's 16,440 against the collections census is the cross-check that makes the tie-out mean something. At Chime the GL is the last query of every pack, and 'delta zero' is the one boring number — boring is the point.",
      tag: "ledger",
    },
  ],

  mcqs: [
    {
      id: "chime-mcq-1",
      prompt: "Funding volume totals $34,833.28 across 103 events. A teammate reports the average event as CAST(SUM(total) AS INTEGER) / COUNT(*). What prints?",
      choices: ["338.19 — CAST keeps the cents", "338 — the cents were truncated before the division", "339 — SQLite rounds the division up", "338.00 — the division heals on output"],
      answer: 1,
      why: "CAST(SUM(total) AS INTEGER) is 34833 before the division runs; 34833 / 103 is INTEGER division and truncates to 338. The house shape is SUM(total) / COUNT(*) on the REAL column — 338.19 — with a single ROUND at the display edge.",
      notes: [
        { choice: 0, why: "The CAST already destroyed the .28 — nothing downstream can recover cents that were truncated before the division." },
        { choice: 2, why: "SQLite truncates integer division, it never rounds up — 34833/103 lands on 338 and stays there." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-2",
      prompt: "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered') FROM orders returns which pair?",
      choices: ["103 and 52", "103 and 82", "82 and 52", "16 and 52"],
      answer: 0,
      why: "COUNT(*) reads all 103 funding events; the FILTER arm counts only the delivered (landed) subset — 52. The two cells side by side are the one-pass landed-share census: 52/103 = 50.5% without a second scan.",
      notes: [
        { choice: 1, why: "82 is the settled count (delivered + shipped) — a different population. The FILTER arm tests exactly status = 'delivered', not 'has a settlement timestamp'." },
        { choice: 3, why: "16 is the member count — a COUNT(DISTINCT customer_id) read, not a row count. Grains before numbers." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-3",
      prompt: "The pricing review wants to confirm Chime's fee-free positioning on the plan catalog. Which claim is honest?",
      choices: [
        "The premium band (price >= 200) holds 2 plans",
        "The priciest plan is $199.99, so the premium band (>= 200) is empty — the catalog itself proves the ceiling",
        "Plans average above $150, so fees are implied",
        "The catalog has no price column to check",
      ],
      answer: 1,
      why: "MAX(price) reads 199.99 and nothing crosses 200 — the premium band is empty. At a fee-free bank the catalog check is a standing audit, and 'the band is empty' is the finding, not a gap in the data.",
      notes: [
        { choice: 0, why: "The band is empty — 8 plans sit mid (50–200) and 8 budget (<50). Inventing premium rows is the exact overclaim the review exists to catch." },
        { choice: 2, why: "The mid-band average is 111.50 — no plan averages near 150, and 'implied fees' is not a query result." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-4",
      prompt: "Statement #25 shows $4,000.00 repaid of $6,148.00 billed. The dunning queue asks for the outstanding gap. What do you report?",
      choices: ["$4,000.00", "$6,148.00", "$2,148.00", "$10,148.00"],
      answer: 2,
      why: "Outstanding = billed − repaid = 6148 − 4000 = $2,148.00. The coverage ladder calls #25 partial precisely because both sides exist — the gap is the dunning number, and reporting the billed or the repaid figure alone mis-sizes the queue.",
      notes: [
        { choice: 1, why: "$6,148.00 is the full billed amount — treating a partially repaid statement as untouched inflates the backlog by exactly the $4,000.00 already collected." },
        { choice: 3, why: "Adding the two sides is the classic sign error — the gap is a subtraction, and it must stay positive at $2,148.00." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-5",
      prompt: "Wire legs are 11 of 27 repayments. Which expression reports the wire share correctly?",
      choices: [
        "SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(method = 'wire') / COUNT(*)",
        "The same CASE share over rows pre-filtered to wire in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division — 11/27 reads 40.7 — and COUNT(*) runs over the same unfiltered fold as the numerator, so no drift. The integer-first shape computes 11/27 = 0, then 0 × 100.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated to zero — every rail's share would read 0%." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results, and the comparison returns 0 or 1, never NULL — the 'share' reads ~100 for every rail." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-6",
      prompt: "Statements LEFT JOIN their repayment legs, then WHERE p.method = 'card' to cut to instant repayments. What happens to the six untouched statements?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: the leg filter on the joined table's columns deletes them, silently converting the join to an INNER",
        "They appear once with method = 'card'",
        "SQLite keeps them and fills method with 'card'",
      ],
      answer: 1,
      why: "Filtering the LEFT-joined table's columns in WHERE discards the NULL-payload rows — the untouched statements — converting the anti-join into an inner join and emptying the collections queue. Rail predicates belong in ON, in the leg fold, or in their own branch.",
      notes: [
        { choice: 0, why: "The join kept them, but a WHERE on right-side columns un-keeps them — filter placement, not join type, decided the population." },
        { choice: 2, why: "A WHERE can't manufacture leg rows that never landed — the untouched statements have no legs to carry a method." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-7",
      prompt: "SUM over the leg-grain fold reads $69,612.00, but the 21 exact statements bill $65,612.00. What explains the $4,000.00?",
      choices: [
        "A rounding drift of exactly $4,000.00",
        "The partial statement #25 repaid $4,000.00 early — leg-grain sums include it; fold per statement to see exact-vs-partial honestly",
        "The void #11 contributed $4,000.00",
        "Five statements repaying twice double-count $800.00 each",
      ],
      answer: 1,
      why: "Legs carry the money movement: $65,612.00 exact + $4,000.00 partial = $69,612.00. The leg grain and the statement grain answer different questions, and only a per-statement fold (the split cycles 1, 5, 12, 19, 22 summed once each) reconciles them.",
      notes: [
        { choice: 0, why: "Four thousand dollars is not drift — INTEGER cents make drift structurally impossible at this magnitude. The difference is a real repayment." },
        { choice: 2, why: "The void #11's leg is $925.00 and it IS inside both sums; it explains neither the gap nor the ladder." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-8",
      prompt: "Members ranked by funding-event count: four members tie at 4 events, the next count below is 3. With RANK(), the 3-event member sits at rank…",
      choices: ["7 — ties share the rank and skip one", "6 — ties compress, DENSE_RANK-style", "10 — RANK skips one rank per tied member, and four tied members skip three", "5 — ties sort before the count below them"],
      answer: 2,
      why: "RANK assigns the tied four ranks 6,6,6,6 and the next distinct value lands at 10 — one rank consumed per tied row. DENSE_RANK would place it at 7. The leaderboard ships with the function named, because the two disagree exactly when ties exist.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK's contract. RANK leaves a gap per tie — four tied members burn three ranks below them." },
        { choice: 1, why: "Compression is DENSE_RANK. Choosing RANK while assuming its gaps away is how two dashboards quietly disagree on the same board." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-9",
      prompt: "SELECT name, (SELECT status FROM invoices i WHERE i.customer_id = c.id) FROM customers c — what happens on this book?",
      choices: [
        "It returns one status per member",
        "It errors: eight members carry two or more statement cycles, and a scalar subquery is contracted to one row",
        "It returns NULL for members with multiple cycles",
        "SQLite concatenates the statuses into one cell",
      ],
      answer: 1,
      why: "A scalar subquery may return zero or one rows — zero yields NULL, but two or more is a hard error. With 28 cycles across 16 members, eight members carry multiples (one carries five), so the correlated scalar explodes the moment it reaches them.",
      notes: [
        { choice: 2, why: "Zero rows yield NULL; MULTIPLE rows error. The member with five cycles guarantees the failure before the query finishes." },
        { choice: 3, why: "No implicit aggregation exists — folding multiple rows into one cell is GROUP_CONCAT's job, spelled out, never assumed." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-10",
      prompt: "The leaderboard query filters 'members above $1,000 lifetime volume'. A teammate puts volume > 1000 in WHERE instead of HAVING. What prints?",
      choices: [
        "The same leaderboard — the clauses are interchangeable",
        "An error: volume is not a real column",
        "An empty or wrong board: WHERE runs before the fold, so the raw event totals — not the per-member sums — are tested",
        "Only members with exactly one event",
      ],
      answer: 2,
      why: "WHERE evaluates row-by-row before GROUP BY, so it tests each funding event's total against 1000 — not the member's folded volume. The fold happens later; the filter must run after it, in HAVING (or in a staged CTE filtered outside).",
      notes: [
        { choice: 0, why: "The pipeline order makes them non-interchangeable — the classic query that 'runs fine' and reports a board nobody can reproduce." },
        { choice: 3, why: "Nothing special about single-event members — the WHERE simply tests the wrong grain, keeping events above $1,000 regardless of the member's fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-11",
      prompt: "A running funding position uses SUM(o.total) OVER (ORDER BY o.created_at) — no frame clause. Several events share a created_at. What prints on those tied rows?",
      choices: [
        "Each row adds only its own total — the walk stays per-event",
        "All tied rows print the same running total — the default frame is RANGE, so same-key peers enter the frame together",
        "An error: OVER (ORDER BY …) requires a unique sort key",
        "The first tied row prints its own total; the rest print NULL",
      ],
      answer: 1,
      why: "With ORDER BY and no frame clause, the frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — value-based, not row-based — so every same-day event is a peer and the running sum jumps by the whole day's batch at once. Say ROWS explicitly (or tie-break on id) when the read is per-event.",
      notes: [
        { choice: 0, why: "That's ROWS semantics. The default is RANGE — on a payroll book where deposits land in same-day batches, the two disagree by exactly the batch size." },
        { choice: 2, why: "Ties are legal in a window ORDER BY; they just change the frame. The query runs — it answers a different question than the one you meant to ask." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-12",
      prompt: "Trailing exposure: SUM(total) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). A teammate drops the ROWS keyword to 'simplify'. What happens?",
      choices: [
        "Nothing — ROWS is the default frame",
        "The frame becomes RANGE BETWEEN 2 PRECEDING … — value-based on a TEXT date: peers collapse in and the 'trailing 3' silently becomes something else",
        "The frame widens to the whole partition",
        "SQLite rejects the query — RANGE requires a numeric ORDER BY",
      ],
      answer: 1,
      why: "Dropping ROWS leaves RANGE BETWEEN 2 PRECEDING AND CURRENT ROW, which compares created_at values — on TEXT timestamps the offset comparison is not a row count, and same-valued peers collapse into the frame together. The query executes and prints plausible numbers that are not the trailing-3 exposure.",
      notes: [
        { choice: 0, why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and an explicit offset stays RANGE. The keyword was load-bearing." },
        { choice: 3, why: "It executes — that's the trap. A silent re-frame on a live exposure number is worse than an error the reviewer would catch." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-13",
      prompt: "Direct-deposit attach for the quarter: numerator = members with at least 2 landed funding events. Which denominator does the metrics review defend?",
      choices: [
        "Members with a landed event in the window",
        "ALL members with any funding event in the window — pending and reversed included",
        "All members ever registered",
        "Statement cycles open at quarter end",
      ],
      answer: 1,
      why: "Attach measures recurrence against acquisition: everyone the window acquired got the chance to attach, so the denominator is all members with any event — pending and reversed included. Landed-only denominators delete the unattached from the population and flatter the funnel.",
      notes: [
        { choice: 0, why: "That's the flattered version — it divides successes by near-successes. The members whose deposits never landed are exactly the story the KPI exists to tell." },
        { choice: 2, why: "Dilutes across members the window never touched. Attach is a window metric; the registry denominator belongs to a lifetime read." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-14",
      prompt: "The risk committee wants the SpotMe repayment rate. Which build survives review?",
      choices: [
        "Exact-settled cycles ÷ all 28 statement cycles",
        "Exact-settled cycles ÷ the 22 cycles that carry legs, with void-but-repaid #11 ($925.00) excluded from the numerator and shown as its own line",
        "Repayment legs (27) ÷ statement cycles (28)",
        "Repaid dollars ÷ billed dollars across the book",
      ],
      answer: 1,
      why: "Repayment rate is an outcome rate: its denominator is cycles that had a repayment outcome available — the 22 with legs. The six legless are the collections queue, not repayment failures, and the void #11's leg counts money the ledger says doesn't exist, so it exits the numerator as a named contradiction.",
      notes: [
        { choice: 0, why: "Mixes the queue into the rate — the six legless cycles weren't repayment outcomes, so the rate reads low for a reason that has nothing to do with repayment behavior." },
        { choice: 2, why: "27 ÷ 28 is a leg grain over a cycle grain — five cycles repay in two legs (1, 5, 12, 19, 22), so the ratio measures neither population." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-15",
      prompt: "NSF incidence for the period: 7 reversed funding events. The KPI reads 6.8%. Which denominator produced it?",
      choices: ["The 82 settled events", "The 52 landed events", "All 103 funding events", "The 251 allocation lines"],
      answer: 2,
      why: "NSF is a failure mode of every attempt: 7 of 103 = 6.8% over all events. Settled-only or landed-only denominators delete the population whose outcome matters, and allocation lines are a different grain entirely — about 2.4 lines per event, none of them an attempt.",
      notes: [
        { choice: 0, why: "7/82 ≈ 8.5% — inflated, because events still in flight haven't had the chance to reverse yet; they're not failures, they're pending." },
        { choice: 3, why: "Lines aren't attempts — folding by allocation legs measures product granularity, not NSF. Grain before percentage." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-16",
      prompt: "The weekly rail census stacks the card arm on the wire arm with UNION. When does that report undercount?",
      choices: [
        "Never — the arms are disjoint populations",
        "When two rows in the stack are identical — same rail, month and count — UNION collapses them and a legitimate row disappears",
        "When an arm returns zero rows",
        "When ORDER BY sorts the stack",
      ],
      answer: 1,
      why: "UNION deduplicates the whole stack. A re-run month or two rails folding to identical (rail, month, count) tuples collapse to one row, and the census quietly loses a leg — 27 printed as 26 with no error anywhere. Censuses of disjoint populations ship as UNION ALL; UNION is for reads where dedup IS the spec.",
      notes: [
        { choice: 0, why: "The populations are disjoint, but the RESULT ROWS need not be — dedup acts on tuples, not semantics. Two distinct legs can print identical summary rows." },
        { choice: 2, why: "An empty arm contributes nothing either way — UNION ALL does the same. The failure mode is dedup, not emptiness." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-17",
      prompt: "Members with statement cycles but zero repayment legs, via EXCEPT: SELECT DISTINCT customer_id FROM invoices EXCEPT <inner>. Which inner completes it?",
      choices: [
        "SELECT DISTINCT customer_id FROM payments",
        "SELECT invoice_id FROM payments",
        "SELECT DISTINCT i.customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id",
        "SELECT customer_id FROM invoices WHERE status = 'paid'",
      ],
      answer: 2,
      why: "EXCEPT needs same-grain sets: members with cycles, minus members whose cycles carry at least one leg. Legs bind to cycles on p.invoice_id = i.id, so the paying-member set must come through that join — payments has no member column of its own.",
      notes: [
        { choice: 0, why: "payments has no customer_id — the query errors. The rail's rows point at cycles, not members; one more hop is required." },
        { choice: 1, why: "Invoice ids aren't member ids — the EXCEPT compares two different id spaces and returns garbage that looks plausible. Grain mismatch is the set-op's silent failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-18",
      prompt: "SELECT COUNT(*) FROM products WHERE price NOT IN (SELECT price FROM products WHERE price >= 200) — the premium band is empty. What prints, and what's the edge?",
      choices: [
        "16 — NOT IN over an empty set is TRUE for every row",
        "0 — an empty set makes every comparison fail",
        "An error: NOT IN requires at least one element",
        "NULL — the count is unknowable",
      ],
      answer: 0,
      why: "An empty NOT IN set excludes nothing, so all 16 plans pass — the catalog's fee-free proof in one predicate. The edge to name out loud: had the subquery returned rows containing NULL, NOT IN would return zero rows (nothing compares unequal to NULL) — the silent-empty trap that makes NOT IN a code smell in audit queries.",
      notes: [
        { choice: 1, why: "That's the NULL-in-list behavior, not the empty-set behavior. Two different failures, opposite symptoms — knowing which is which is the interview." },
        { choice: 2, why: "Empty IN-lists are legal SQL and evaluate to FALSE for IN, TRUE for NOT IN. The premium band being empty is a finding, not a syntax problem." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-19",
      prompt: "A derived table (SELECT …) can appear in which clause, and what does it demand?",
      choices: [
        "WHERE only — and it must return one row",
        "FROM — with a mandatory alias, and it runs once",
        "Any clause — aliases are optional in SQLite",
        "HAVING only — it must contain an aggregate",
      ],
      answer: 1,
      why: "Derived tables stage a fold in FROM: one pass, one grain, then the outer query compares. The alias is not decoration — SQLite requires it, and the name is the contract that the fold is now a table with exactly the columns it selected.",
      notes: [
        { choice: 0, why: "That's the scalar subquery's home and its one-row contract — a different tool with a different failure mode (the multi-row explosion)." },
        { choice: 2, why: "SQLite enforces the alias for derived tables — dropping it is a syntax error, not a style choice." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-20",
      prompt: "Inside a per-month fold, a teammate inlines (SELECT AVG(total) FROM orders) — uncorrelated, no outer reference. What's the cost model?",
      choices: [
        "It re-runs once per output row",
        "It folds once — the value is computed a single time and reused across every row",
        "It errors under GROUP BY",
        "It only works inside FILTER",
      ],
      answer: 1,
      why: "An uncorrelated scalar subquery references no outer columns, so the engine evaluates it once and holds the constant — the book-wide 338.19 average against every month's row. The correlated version (WHERE month = outer.month inside) is the one that re-runs per row; the absence of an outer reference is precisely what makes it free.",
      notes: [
        { choice: 0, why: "That's the correlated shape. Uncorrelated means the inner fold can't change per row — there's nothing to re-run for." },
        { choice: 2, why: "GROUP BY doesn't forbid constants from subqueries — it forbids bare outer columns that aren't grouped. The scalar rides along fine." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-21",
      prompt: "Count weekend funding events. Which expression is actually a weekend test?",
      choices: [
        "STRFTIME('%w', created_at) IN ('0','6')",
        "STRFTIME('%W', created_at) IN ('0','6')",
        "SUBSTR(created_at, 1, 7) IN ('0','6')",
        "JULIANDAY(created_at) % 7 IN (0, 6)",
      ],
      answer: 0,
      why: "%w is the weekday token — '0' Sunday through '6' Saturday, returned as TEXT, so the IN list quotes it. It's the only arm that states 'Saturday or Sunday' in calendar terms.",
      notes: [
        { choice: 1, why: "%W is week-of-year (00–53) — the classic wrong-token trap; it never means weekday at all, let alone the weekend pair." },
        { choice: 3, why: "JULIANDAY mod 7 anchors on Monday in the Julian scheme — an off-by-two nobody catches until the report disagrees with the calendar." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-22",
      prompt: "invoices LEFT JOIN payments ON p.invoice_id = i.id. COUNT(*), COUNT(DISTINCT i.id), COUNT(p.id) — what triple prints?",
      choices: ["28 / 28 / 27", "33 / 28 / 27", "27 / 22 / 27", "33 / 22 / 6"],
      answer: 1,
      why: "The join fans out to 33 rows: 27 legs plus the 6 legless cycles the LEFT JOIN keeps. COUNT(*) sees all 33; COUNT(DISTINCT i.id) collapses back to 28 cycles; COUNT(p.id) skips the NULL payloads and reads 27. Three counts, three grains — the two-grain discipline in one SELECT.",
      notes: [
        { choice: 0, why: "28/28/27 forgets the fan-out — the five two-leg cycles (1, 5, 12, 19, 22) each occupy two rows, and the legless six add rows too." },
        { choice: 3, why: "33/22/6 mixes grains twice: 22 is cycles-with-legs (not distinct cycles), and 6 is the legless count, not what COUNT(p.id) returns." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-23",
      prompt: "Which pair of counts proves five statement cycles repay in two legs — without listing them?",
      choices: [
        "27 legs vs 22 distinct cycles served",
        "28 cycles vs 27 legs",
        "16 card legs vs 11 wire legs",
        "52 landed vs 82 settled events",
      ],
      answer: 0,
      why: "Legs (27) exceed distinct cycles served (22) by exactly five — the count of cycles carrying a second leg. The gap IS the finding: a leg-grain count alone can't see it, and 28 vs 27 mixes the whole book (including the legless) with the leg population.",
      notes: [
        { choice: 1, why: "That gap reflects the six legless cycles — a different anomaly (missing legs, not extra legs)." },
        { choice: 2, why: "That's the rail split — a population story, not a fan-out story. Both rails could serve the same 22 cycles." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-24",
      prompt: "Latest statement per member, deduplicated. Which window pick keeps the join-back at exactly one row per member?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY issued_on DESC, id DESC) = 1",
        "RANK() OVER (PARTITION BY customer_id ORDER BY issued_on DESC) = 1",
        "DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY issued_on DESC) = 1",
        "COUNT(*) OVER (PARTITION BY customer_id) = 1",
      ],
      answer: 0,
      why: "ROW_NUMBER is the only one contractually guaranteed to produce a single rn = 1 per partition — and the id DESC tail breaks same-day issued_on ties deterministically. RANK and DENSE_RANK both share rank 1 across tied top rows, fanning the join-back out exactly on the days that matter most.",
      notes: [
        { choice: 1, why: "Two statements issued the same late date both take rank 1 — the dedupe silently re-fans out. Ties must break, not share, in a latest-per-X read." },
        { choice: 3, why: "That filters to members with exactly one statement — it deletes the multi-cycle members (eight of them here) instead of picking their latest." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-25",
      prompt: "Over the 27 repayment legs: COUNT(CASE WHEN method='card' THEN 1 END) vs COUNT(CASE WHEN method='card' THEN 1 ELSE 0 END). What pair prints?",
      choices: ["27 and 27", "16 and 27", "16 and 16", "NULL and 27"],
      answer: 1,
      why: "Without ELSE, wire rows produce NULL and COUNT skips NULLs: 16. With ELSE 0, every row produces a value and COUNT counts all 27 — the census silently became a row count. Under SUM the two agree (SUM skips NULL; 0 adds nothing), which is exactly why this bug only fires in COUNT arms.",
      notes: [
        { choice: 0, why: "27 and 27 would mean the ELSE changed nothing — it changed everything: the zero is a countable value, and the wire rows stopped being invisible." },
        { choice: 2, why: "16 and 16 is the SUM behavior wearing a COUNT costume — the classic reason this trap survives code review." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-26",
      prompt: "Pivot repayment dollars by rail in one pass. Which arm reads the card book correctly?",
      choices: [
        "SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END) / 100.0",
        "COUNT(CASE WHEN method = 'card' THEN amount_cents END) / 100.0",
        "AVG(CASE WHEN method = 'card' THEN amount_cents END)",
        "SUM(amount_cents) / 100.0",
      ],
      answer: 0,
      why: "Conditional SUM over INTEGER cents, divided by 100.0 once at the display edge: $37,364.00 — against wire's $32,248.00. Exact integer folding until one division at the glass; the ELSE 0 is optional under SUM but states the zero explicitly.",
      notes: [
        { choice: 1, why: "COUNT counts legs, not cents — 16 legs ÷ 100 is 0.16, a number with no meaning on any dashboard." },
        { choice: 2, why: "AVG prints the average leg — a per-leg figure that reads like a book total to anyone skimming. Wrong question, plausible shape." },
        { choice: 3, why: "No CASE: the arm sums the whole book — $69,612.00 — card and wire folded together. The rail distinction vanished with the predicate." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-27",
      prompt: "The two-grain rail scorecard ships to the money-movement desk. What does it print?",
      choices: [
        "Legs and dollars per rail only — 16 / $37,364.00 and 11 / $32,248.00",
        "Legs, dollars AND distinct cycles served per rail, side by side",
        "Distinct cycles per rail only — 22 total across both",
        "Dollars per rail divided by all 27 legs",
      ],
      answer: 1,
      why: "Two grains or it isn't a scorecard: legs (16 / 11) are rail events, distinct cycles served is the reach — 27 legs onto 22 cycles means five cycles repay in two legs, and only the side-by-side fold shows it. Dollars alone bury the fan-out; legs alone bury the money.",
      notes: [
        { choice: 0, why: "Legs and dollars are both leg-grain — two views of one grain. The split statements stay invisible and the desk can't reconcile against the ladder." },
        { choice: 3, why: "Dividing one rail's dollars by all legs mixes populations — the denominator is the whole book, the numerator one rail. A ratio with no story." },
      ],
      difficulty: "easy",
    },
    {
      id: "chime-mcq-28",
      prompt: "WITH RECURSIVE months(m) AS (SELECT '2024-01' UNION ALL SELECT STRFTIME('%Y-%m', DATE(m || '-01', '+1 month')) FROM months WHERE m < '2025-02') — how many rows, and which clause is the termination guard?",
      choices: [
        "14 rows; the WHERE m < '2025-02' inside the recursive arm",
        "Infinite — recursive CTEs need a LIMIT outside to stop",
        "12 rows; the DATE('+1 month') function is the guard",
        "13 rows; the guard is the anchor literal",
      ],
      answer: 0,
      why: "The recursive arm's WHERE stops the walk: 2024-01 anchor, one month per step, halting after '2025-02' is produced — 14 months, exactly the spine the funding walk joins against. Recursive CTEs terminate when the arm returns no rows; the guard is what makes that happen.",
      notes: [
        { choice: 1, why: "A LIMIT would truncate a runaway query, not terminate it cleanly — and the shipped spine must contain 2025-02, which an arbitrary LIMIT can't promise. The WHERE is the contract." },
        { choice: 2, why: "DATE('+1 month') advances; it never decides to stop. Guards are predicates, not functions." },
      ],
      difficulty: "hard",
    },
    {
      id: "chime-mcq-29",
      prompt: "Per-member latest statement: correlated scalar in SELECT vs CTE with ROW_NUMBER joined back. The performance instinct to say out loud?",
      choices: [
        "The scalar is always faster on small tables — size is the only axis",
        "Fold once, join back — one pass over the cycles beats re-running a scan per member row, and it stays linear as the book grows",
        "Both are identical — the optimizer flattens everything",
        "Window functions are never faster than correlated subqueries",
      ],
      answer: 1,
      why: "The correlated shape is O(members × cycles): 16 members is fine, 16 million is the outage. The staged shape folds once (ROW_NUMBER over one pass) and joins back on a key — deterministic, and the same skeleton extends to top-2, per-month, per-status without a rewrite.",
      notes: [
        { choice: 0, why: "Small-table speed is an accident of scale, not a plan — and the scalar also carries the multi-row contract risk (two same-day statements and it explodes)." },
        { choice: 2, why: "Optimizers flatten some shapes, not all — and 'trust the optimizer' is how quadratic queries ship with a clean EXPLAIN on the dev row count." },
      ],
      difficulty: "medium",
    },
    {
      id: "chime-mcq-30",
      prompt: "The GL tie-out prints total debits 181,080 and total credits 181,080. Which claim is safe to make to the committee?",
      choices: [
        "The book balances — cash nets +44,196 and AR +16,440; delta zero says the ledger is self-consistent, nothing more",
        "Delta zero proves there are no anomalies in the book",
        "Sales revenue netting −86,052 means the business lost money",
        "Debits minus credits should equal net income",
      ],
      answer: 0,
      why: "The tie-out is the double-entry invariant — every entry posts both sides, so equal totals are the floor, not the finding. The account nets are the read: cash +44,196, AR +16,440 (the backlog's shadow), and revenue −86,052 is healthy because revenue is credit-normal.",
      notes: [
        { choice: 1, why: "The void-but-repaid cycle (#11, $925.00) is perfectly balanced — the money moved, the cycle is void. The tie-out can't see stories, only symmetry." },
        { choice: 2, why: "Credit-normal accounts net negative by construction. Reading the sign as a loss is the fastest way to lose the committee." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-chime-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "Repayment backlog: statements with zero legs",
      brief:
        "Credit-ops memo, ahead of the collections review: the backlog census isolates statement cycles carrying zero repayment legs. Probed book: 28 cycles, 27 repayment legs, only 22 distinct cycles touched (five repay in two legs); 21 settle exact ($65,612.00), 1 sits partial at $4,000.00 of $6,148.00, and 6 carry no legs at all — $15,217.00, five open plus #28 which reads paid-but-unmoved ($1,756.00). The census LEFT JOINs so the legless survive, folds by status, and the join runs on the declared foreign key — leg ids 1..27 against cycle ids 1..28 match by coincidence and the mis-pairing still sums plausibly.",
      ask: "Return the backlog census: statement status, cycle count and billed dollars for cycles with zero repayment legs, biggest class first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed_usd\nFROM invoices i\nLEFT JOIN payments p ON p.{1} = i.{2}\nWHERE p.id {3}\nGROUP BY i.{4}\nORDER BY statements {5};",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the leg→cycle key",
          why: "Legs bind to cycles on the declared FK: p.invoice_id. Substituting p.customer_id errors — payments carry no member column — and any non-key column either errors or pairs legs to cycles by value coincidence, the silent mis-pairing a backlog can't survive.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the cycle side of the key",
          why: "The cycle side is i.id — the primary key the FK points at. Substituting i.number or i.due_on compares text to an integer: zero matches, every cycle reads as untouched, and the backlog balloons from 6 statements to all 28.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the untouched test",
          why: "A cycle with no legs leaves every joined column NULL, so the arm is IS NULL. A bare = NULL never fires — NULL = anything is UNKNOWN — and the six legless statements silently fall out of the census instead of headline-ing it.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the backlog fold",
          why: "The collections review reads the backlog by class: i.status folds the six into open (5) and paid (1). Substituting i.customer_id re-folds by member — six one-row classes the review can't act on — and i.due_on re-folds by calendar.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-class-first direction",
          why: "The review opens with the five open statements ($13,461.00) above the paid-but-unmoved one ($17.56). ASC leads with the single contradiction row and buries the class that actually sizes the collections queue.",
        },
      ],
      distractors: ["customer_id", "number", "due_on", "ASC"],
      walkthrough:
        "An anti-join that keeps the legless, then a fold that sizes the queue. The join binds legs to cycles on p.invoice_id = i.id — the declared FK, not the id coincidence: with i.number or i.due_on on the cycle side the text-to-integer comparison matches nothing and all 28 cycles read as untouched, a backlog inflated 4.7x. WHERE p.id IS NULL keeps exactly the cycles with no leg — the six: #24 $4,937.00, #26 $3,562.00, #27 $2,794.00, #28 $17.56, #21 $12.95, #18 $8.73 — and the fold by status prints open 5 / $13,461.00 above paid 1 / $17.56.00, the paid row being #28, the contradiction the review exists to see. ORDER BY statements DESC leads with the class that sizes dunning; ASC inverts it. Every figure reconciles: $13,461.00 + $17.56 = $15,217.00 untouched, and the contradictions (#11 void-but-repaid $925.00, #25 partial at $4,000.00 of $6,148.00) stay outside this census by having legs — which is the point of the arm.",
    },
    {
      id: "cs-chime-2",
      tier: "easy",
      topic: "t5",
      universe: "growth",
      title: "Member funding leaderboard: RANK the top 3",
      brief:
        "Growth memo, before the engagement review: the leaderboard ranks members by total funding volume and the top-3 slice opens the deck. Probed book: 16 members, 103 funding events, $34,833.28 total; $7,262.35 across 24 events leads, $6,640.56 and $4,574.23 follow. The build stages a per-member fold, RANK orders it, LIMIT caps the board — and the tie-break matters below the cap: four members tie at 4 events, so the board names its ranking function and its direction out loud.",
      ask: "Return the top 3 members by total funding volume with their rank, biggest volume first.",
      template:
        "WITH per_member AS (\n  SELECT c.name AS member,\n         SUM(o.total) AS volume\n  FROM orders o\n  JOIN customers c ON c.id = o.{1}\n  GROUP BY c.name\n)\nSELECT member,\n       ROUND(volume, 2) AS volume_usd,\n       RANK() OVER (ORDER BY volume {2}) AS rnk\nFROM per_member\nORDER BY rnk\nLIMIT {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the event→member key",
          why: "Events bind to members on o.customer_id. Substituting o.id joins on id coincidence — event ids 1..103 against member ids 1..16 match for the first rows and the fold attributes the wrong volume to the wrong member. Substituting o.total compares dollars to member ids and the fold comes back empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-volume-first direction",
          why: "The board leads with $7,262.35. ASC is a correct query answering the opposite question — it crowns the smallest funder at $444.80 and buries the whale the engagement review actually acts on.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the board cap",
          why: "The deck slices the top 3 — the LIMIT constant. Raising it to 4 leaks Maya Patel's $3,644.56 onto the slide and changes the story the review tells; the cap is a product of the deck, not the data.",
        },
      ],
      distractors: ["id", "total", "ASC", "4"],
      walkthrough:
        "Stage the fold, then rank it, then cap it. The CTE joins events to members on o.customer_id = c.id and folds to one row per member: 16 members, volume summed — the whale $7,262.35, then $6,640.56, $4,574.23, $3,644.56 … down to $444.80. The outer SELECT ranks: RANK() OVER (ORDER BY volume DESC) — biggest first — and prints the dollar figure rounded once at the display edge. LIMIT 3 caps the board at exactly the slice the deck quotes; the 4-event tie lives below the cap (ranks 6–9), but the walkthrough states it anyway because the next rank skipping is the kind of thing a reviewer checks. The distractors fail cleanly: o.id mis-pairs events to members by key coincidence, o.total compares dollars to ids and empties the fold, ASC crowns the smallest funder, and LIMIT 4 leaks the fourth member onto a three-slot slide. Fold, rank, cap — the board the engagement review actually opens.",
      },
    {
      id: "cs-chime-3",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "Funding-state census: the majority-state bar",
      brief:
        "Growth memo, ahead of the state-of-the-book review: the engagement deck opens with a state census — every funding event bucketed into Chime vocabulary (landed, settling, awaiting_payroll, reversed) and priced against the full book. Probed book: 103 events, of which delivered lands 52 (50.5%), shipped settles 30 (29.1%), pending awaits payroll 14 (13.6%), and 7 (6.8%) reverse. The census folds by the CASE label so the deck never shows a raw status string, prices each state's share against a scalar count of the whole 103-event book — not the surviving fold — and keeps only states clearing the 30-event majority bar.",
      ask: "Return the state census — state, event count and share of the full 103-event book — for states carrying at least 30 events, biggest count first.",
      template:
        "SELECT CASE o.{1}\n         WHEN 'delivered' THEN 'landed'\n         WHEN 'shipped'   THEN 'settling'\n         WHEN 'pending'   THEN 'awaiting_payroll'\n         ELSE 'reversed'\n       END AS state,\n       COUNT(*) AS events,\n       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1) AS share_pct\nFROM orders o\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY events {4};",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the state column",
          why: "The census classifies o.status — the event's settlement state. Substituting o.customer_id compares integers to status strings, every arm misses, and the whole book collapses into one ELSE row (103 events, 100.0%); o.total does the same in dollars.",
        },
        {
          answer: "state",
          kind: "keyword",
          label: "the fold key",
          why: "Folding by the CASE label state yields one row per Chime state. Folding by o.total re-folds per dollar value — 103 one-row groups that all fall below the bar — and folding by an id re-folds per event, emptying the census.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the majority bar",
          why: "The deck headlines states that clear 30 events: landed (52) and settling (30) survive, awaiting_payroll (14) and reversed (7) drop to the appendix. A bar of 50.5 gates on share instead of count and keeps only landed; 14 readmits the tail.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-count-first direction",
          why: "The deck leads with landed at 52 events (50.5% of the book). ASC opens on settling (30) and buries the majority state the review exists to ratify.",
        },
      ],
      distractors: ["customer_id", "total", "52", "50.5", "14"],
      walkthrough:
        "Classify, fold, price, bar. The CASE remaps settlement states into Chime vocabulary: delivered lands, shipped settles, pending awaits payroll, everything else reversed. Fold by the label state and the 103-event book reads landed 52, settling 30, awaiting_payroll 14, reversed 7. The share denominator is the scalar book count — (SELECT COUNT(*) FROM orders) = 103 — not the fold size, so shares print 50.5%, 29.1%, 13.6% and 6.8% of the whole book. HAVING COUNT(*) >= 30 keeps landed (52) and settling (30) — 79.6% of the book in two states — and drops the 14- and 7-event tails. ORDER BY events DESC leads with the majority state. The traps: o.customer_id inside the CASE compares integers to status strings, every arm misses, and the book collapses to one reversed row; folding by o.total makes 103 one-row groups that all fail the bar; a bar of 50.5 gates on share and keeps only landed; a bar of 14 readmits awaiting_payroll; ASC buries the headline. Classify in CASE, fold, price against the book, then bar.",
    },
    {
      id: "cs-chime-4",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "Repayment rail stack with the TOTAL tie line",
      brief:
        "Month-close memo, ahead of the ledger tie: the repayment stack prints each rail's footprint and appends the grand-total line the GL reconciles against. Probed book: 27 repayment legs on two rails — 16 instant card legs totaling $37,364.00, 11 manual wire legs totaling $32,248.00 — and the TOTAL row must print 27 legs / $69,612.00, the exact cash-account debit the ledger carries. UNION ALL appends the total without deduping it, and the cents-to-dollars fold divides by 100.0 or the stack ships in cents.",
      ask: "Return the rail stack — method, leg count and repaid dollars — plus a TOTAL row, biggest leg count first.",
      template:
        "SELECT p.{1} AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(p.amount_cents) / {2}, 2) AS repaid_usd\nFROM payments p\nGROUP BY rail\nUNION ALL\nSELECT {3},\n       COUNT(*),\n       ROUND(SUM(p.amount_cents) / 100.0, 2)\nFROM payments p\nORDER BY legs {4};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "Rails are p.method — card is the instant repay from Spending, wire the manual ACH leg. Substituting p.invoice_id re-folds the stack into 23 per-cycle rows; p.paid_on re-folds per settlement date; p.amount_cents re-folds per amount.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "amount_cents is INTEGER cents; the dollars fold divides by 100.0. A wrong divisor poisons every rail row — 27 prints card at $138,385.19 and 10.0 prints $373,640.00 — while the TOTAL row, hardcoded at 100.0, stays honest and the stack visibly disagrees with itself.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The close checklist greps for the TOTAL line, so the label is the quoted literal 'TOTAL'. The bare-column trap (SELECT invoice_id) leaks some row's id into the label, 'total' lowercase misses the grep, and 27 prints a count where a name belongs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-leg-count-first direction",
          why: "The stack leads with the tie line (27 legs) and reads card (16) then wire (11) beneath. ASC pushes the TOTAL row to the bottom and leads with wire — the smallest rail — inverting the close-pack order.",
        },
      ],
      distractors: ["invoice_id", "paid_on", "amount_cents", "'total'", "27", "10.0"],
      walkthrough:
        "Fold each rail, then append the tie line. The first branch folds payments by p.method: 16 card legs worth $37,364.00 and 11 wire legs worth $32,248.00, dollars recovered by dividing INTEGER cents by 100.0. UNION ALL appends the second branch — one row, same folds, no GROUP BY — labelled 'TOTAL': 27 legs, $69,612.00, the exact cash-account debit the GL carries, which is the tie the close exists to make. ORDER BY legs DESC prints TOTAL, card, wire. The traps: p.invoice_id re-folds the stack into 23 rows (22 cycles plus the total); a bare invoice_id in the TOTAL branch leaks a row id into the label; 'total' lowercase dodges the checklist grep; ORDER BY legs ASC leads with wire (11) and buries the tie line; divisors of 27 or 10.0 poison the rail rows while the hardcoded TOTAL row stays right, so the stack visibly disagrees with itself. Two folds, one UNION ALL, one tie — the close-pack staple.",
    },
    {
      id: "cs-chime-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "Worst funding months with the MoM delta attached",
      brief:
        "Growth memo, before the run-rate review: the volume walk prices each month against its predecessor, and the deck opens on the three worst funding months with their month-over-month deltas. Probed spine: 14 monthly buckets from 2024-01 ($3,731.97) to 2025-02 ($2,390.53); the trough is 2024-07 at $1,193.86, with 2024-11 ($1,648.80) and 2025-01 ($1,669.50) filling out the worst three. LAG over the calendar spine prices every month against the one before — the first bucket's delta stays NULL by design, and the window must order by calendar even while the deck orders by volume.",
      ask: "Return the three worst funding months by volume with each month's dollar delta versus the prior month, smallest volume first.",
      template:
        "SELECT SUBSTR(o.created_at, 1, 7) AS month,\n       ROUND(SUM(o.total), 2) AS volume_usd,\n       ROUND(SUM(o.total) - LAG(SUM(o.total)) OVER ({1}), 2) AS mom_delta_usd\nFROM orders o\nGROUP BY {2}\nORDER BY volume_usd {3}\nLIMIT {4};",
      slots: [
        {
          answer: "ORDER BY SUBSTR(o.created_at, 1, 7)",
          kind: "keyword",
          label: "the LAG calendar spine",
          why: "LAG must walk the calendar: OVER (ORDER BY SUBSTR(o.created_at, 1, 7)) makes each month's previous row the prior month. Reversing the spine makes LAG fetch the NEXT month and flips every delta; ordering the window by anything else prices months against strangers.",
        },
        {
          answer: "SUBSTR(o.created_at, 1, 7)",
          kind: "keyword",
          label: "the month grain",
          why: "The fold is month grain — SUBSTR(o.created_at, 1, 7) buckets 103 events into the 14 monthly rows the spine needs. The day grain (SUBSTR by 10) explodes to per-day rows and the raw o.created_at column to one row per event; both destroy the MoM walk.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The deck opens on the worst months, so volume runs ASC: $1,193.86, $1,648.80, $1,669.50. DESC crowns 2024-01's $3,731.97 — the best month — as the headline and inverts the review.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the deck slice",
          why: "The deck carries the three worst months — the LIMIT constant. A slice of 4 leaks 2024-06 ($2,047.43) onto the slide; the cap is a deck choice, not a data fact.",
        },
      ],
      distractors: ["ORDER BY SUBSTR(o.created_at, 1, 7) DESC", "SUBSTR(o.created_at, 1, 10)", "o.created_at", "DESC", "4"],
      walkthrough:
        "Bucket to months, walk the calendar, slice the worst. GROUP BY SUBSTR(o.created_at, 1, 7) folds 103 events into 14 monthly volumes. LAG(SUM(o.total)) OVER (ORDER BY SUBSTR(o.created_at, 1, 7)) is the calendar spine: each month sees its predecessor, and the delta prints 2024-07 at −$853.57 (from 2024-06's $2,047.43), 2024-11 at −$1,326.87 (from 2024-10's $2,975.67) and 2025-01 at −$431.97 (from 2024-12's $2,101.47), while 2024-01, the first bucket, stays NULL by design. ORDER BY volume_usd ASC ranks worst-first and LIMIT 3 caps the slice at exactly the deck's ask. The traps: a DESC inside the window makes LAG fetch the next month, so 2024-07 reads −$1,158.21 (2024-08's $2,352.07) and every story flips; the day grain or the raw timestamp both explode the fold and price single events; DESC on the outer order crowns the best month; LIMIT 4 leaks the fourth-worst month. Spine, fold, delta, slice.",
    },
    {
      id: "cs-chime-6",
      tier: "medium",
      topic: "q2",
      universe: "fraud",
      title: "Reversal concentration: who owns the book's reversals",
      brief:
        "Risk memo, before the fraud spot-check: reversed funding events are the book's fraud-adjacent class, and the desk reviews regions that own a real slice of them. Probed book: 7 of 103 events reverse (6.8%) — APAC 3, EU 3, US 1, LATAM 0 — with regional shares of all reversals at 42.9%, 42.9%, 14.3% and 0.0%. The census folds placed events and reversals per region, prices each region's reversals against a scalar count of the book's full 7-event reversal pool, and keeps only regions carrying at least 3 reversals.",
      ask: "Return the reversal concentration census — region, placed events, reversals and share of all 7 reversals — for regions with at least 3 reversals, biggest share first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.{1} = {2} THEN 1 ELSE 0 END) AS reversed,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n             / (SELECT COUNT(*) FROM orders WHERE status = 'cancelled'), 1) AS reversal_share_pct\nFROM orders o\nJOIN customers c ON c.{3} = o.customer_id\nGROUP BY c.region\nHAVING SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) >= {4}\nORDER BY reversal_share_pct {5};",
      slots: [
        {
          answer: "status",
          kind: "keyword",
          label: "the reversed-state column",
          why: "Reversals are o.status = 'cancelled' events. Substituting o.shipped_at — a timestamp column — never equals the literal, so every region reads zero reversals and the census empties; o.customer_id fails the same way against a text literal.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the reversed-state literal",
          why: "The literal must be 'cancelled' — the reversed funding event. 'shipped' counts 12 EU and 8 APAC settling events as reversals, 'delivered' counts landed ones, and both poison the reversed column while the HAVING still gates on true reversals — a census that contradicts its own floor.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the event→member key",
          why: "Events bind to members on c.id = o.customer_id, the declared FK. Substituting c.region compares text to an integer key: zero matches, the census comes back empty, and the desk reads an empty book as a clean one.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the review floor",
          why: "The desk reviews regions owning at least 3 of the book's 7 reversals — APAC and EU at 3 each (42.9% apiece). A floor of 1 adds US (14.3%); 4 empties the review; 2 changes nothing because no region sits between 2 and 3 — which is exactly why it is not in the bank.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-share-first direction",
          why: "The deck ranks concentration, 42.9% first. ASC prints the APAC/EU tie in the opposite order and would end the census on the region the desk opens with.",
        },
      ],
      distractors: ["shipped_at", "'shipped'", "'delivered'", "region", "1", "ASC"],
      walkthrough:
        "Fold placed and reversed per region, price against the reversal pool, gate, rank. The join binds events to members on c.id = o.customer_id and the fold reads placed: EU 45, APAC 37, US 19, LATAM 2. The reversed column counts o.status = 'cancelled': EU 3, APAC 3, US 1, LATAM 0. The scalar denominator prices each region against the whole pool — (SELECT COUNT(*) FROM orders WHERE status = 'cancelled') = 7 — so shares print 42.9, 42.9, 14.3 and 0.0: shares of all reversals, not of the region's own book (that regional rate is a different, smaller read: 8.1% for APAC, 6.7% for EU). HAVING >= 3 keeps the two regions the desk reviews, and the gate lives on true reversals, so a 'shipped' literal prints 12 and 8 against a floor that still says 3 — visibly contradictory. ORDER BY reversal_share_pct DESC opens on 42.9%. Empty-census traps: c.region in the join key matches nothing (text against integer), and any wrong state literal zeroes the reversed column. Fold, price, gate, rank.",
    },
  ],

  problems: [
    { slug: "second-day-verification", why: "D+1 repayment follow-through — did the advance spotted yesterday clear against today's deposit: the day-pair self-join the collections queue runs nightly." },
    { slug: "number-of-accounts-that-did-not-stream", why: "The untouched-statement anti-join — cycles with zero repayment legs surfaced by NOT EXISTS, the backlog census's graded core." },
    { slug: "monthly-transactions-ii", why: "A UNION ALL month spine of statement cycles and repayment legs — at a fee-free bank a fee row would be a finding, not a line." },
    { slug: "duplicate-charge-pairs", why: "Duplicate advance detection — a member spotted twice within the window is the SpotMe abuse pattern, self-join window and all." },
    { slug: "transaction-velocity", why: "Advance velocity bursts — rapid-fire spot requests per member, the behavioral tripwire risk reviews every Monday." },
    { slug: "balance-rollforward", why: "Spending-account rollforward — opening balance plus landed events minus repayment legs, the closing number the ledger must agree with." },
    { slug: "journal-gap-detection", why: "GL gap detection behind the 181,080 = 181,080 tie — missing journal rows are how a balance proof stops proving anything." },
    { slug: "cohort-retention-matrix", why: "Member cohorts by first-deposit month — the retention matrix engagement reads quarterly, offset arithmetic and all." },
    { slug: "daily-balance-interest", why: "Daily balance accrual on Savings — the date-spine walk that prices every day a balance actually sat there." },
    { slug: "credit-utilization-bands", why: "Credit Builder utilization bands — the CASE-band read that decides when a secured line has earned a limit step-up." },
    { slug: "winback-recovery", why: "Dormant member reactivation — funding events that resume after a quiet window, the winback cohort the growth team bids against." },
    { slug: "keep-latest-dedupe", why: "Payroll files re-sent overnight — keep-latest dedupe so a re-transmitted deposit never counts twice in the landed share." },
    { slug: "null-blank-audit", why: "The staging NULL audit — settlement timestamps missing on pending events, counted before any average can silently skip them." },
    { slug: "basket-depth-aov", why: "Allocations per funding event — the depth read behind 251 lines across 103 events: one-split deposits behave differently from full chains." },
    { slug: "median-time-to-convert", why: "Median deposit-to-settlement time — the robustness read when one 4-day outlier would lie about the 2.98-day average." },
    { slug: "suspicious-bank-account-transactions", why: "Advance cycling detection — deposits in and spots out within hours, the pattern the fraud desk treats as the first real alarm." },
    { slug: "bank-account-summary", why: "The NSF exposure census — per-member ending balances with members who never transacted kept in by the LEFT JOIN; an account with zero funding events is exactly the one a SpotMe advance can push negative." },
    { slug: "bank-account-summary-ii", why: "The monthly statement's summary block — credits, debits and charge-back volume folded per member, the three lines every Chime member reconciles against the app each cycle." },
    { slug: "maximum-transaction-each-day", why: "Largest single debit per calendar day — the card-risk desk's morning export, where one out-sized swipe is the pattern worth a callback before it becomes a chargeback." },
    { slug: "delinquency-buckets", why: "SpotMe negative-balance aging in days-past-due buckets — the dunning ladder (nudge, reminder, restriction) keys to exactly these bands, so bucket edges are policy, not style." },
    { slug: "delinquency-roll-rates", why: "How negative balances roll between dunning buckets month over month — the roll-rate read that decides when a SpotMe advance stops being engagement and starts being a loss line." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Advances that grow leg over leg — the LAG-flag pattern risk reads as repayment stress rather than engagement, and an early SpotMe-limit freeze signal." },
    { slug: "structuring-detection", why: "Cash-in patterns kept just under reporting thresholds — the BSA/AML tripwire every US monitoring desk runs daily, and direct-deposit rails are no exception." },
    { slug: "circular-transfers", why: "Members ping-ponging the same dollars between accounts — circular flows are how a SpotMe advance gets cycled, and the fraud desk treats the pattern as abuse before it is loss." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two funding events inside seven days — split payroll files and re-attached direct deposits; the frequency read behind the landed-deposit share KPI." },
    { slug: "biggest-window-between-events", why: "The longest gap between consecutive funding events — income-cadence detection: a stretched payroll gap is the first signal a direct deposit is about to detach." },
    { slug: "find-third-transaction", why: "The third funding event as the activation marker — onboarding lives or dies on members reaching their first three deposits, and ROW_NUMBER finds them." },
    { slug: "restaurant-growth", why: "The 7-day rolling funding average behind each member profile — the smoothed income signal SpotMe limits and Credit Builder step-ups are keyed to." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the engagement floor a fee-free bank watches weekly, because members who stop opening the app stop attaching direct deposits." },
    { slug: "growth-accounting", why: "New, retained, resurrected, churned — the member-growth waterfall the weekly metrics review opens with, built in pure LAG transitions." },
    { slug: "ar-aging-schedule", why: "Statement cycles bucketed by age past issue — the receivables view of repayment coverage: who owes, how long, and which bucket grew this month." },
    { slug: "trial-balance-check", why: "Debits equal credits by account via conditional SUM — the 181,080 = 181,080 tie-out that certifies the GL before the close can ship." },
  ],
};
