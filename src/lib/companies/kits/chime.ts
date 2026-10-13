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
    "Preparation: the registry tags zero SQL problems for Chime — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror deposit-engagement and repayment-coverage screens — conditional folds, anti-joins for untouched statements, NULL policies for missing settlement timestamps, month walks and leaderboards. Then run both case studies on the live db: one rebuilds the {emerald:repayment backlog} census credit ops ships weekly (6 statements / $15,217.00 untouched), the other rebuilds the {violet:member funding leaderboard} the engagement review opens with ($7,262.35 leading). Say the denominator, the join key and the NULL policy out loud before you compute — at a fee-free bank, the spreadsheets are the fees.",
  ],

  dayInLife: [
    "**08:10 —** The day starts on the funding dashboard. First query is the overnight read: events by outcome — 52 of 103 landed all-time, the {rose:reversed} share watched hardest (6.8% book-wide) — then the payroll-file check: any member's deposit stuck pending past the morning window? The morning artifact is a two-grain count: 251 allocation lines across only 103 funding events, because an event splits into Spending and Savings legs — *a census that can't say both grains out loud is the one that double-counts a deposit during close*. A mismatch pages money-movement ops, not a shrug.",
    "**11:30 —** Midday is repayment surgery. The backlog anti-join runs: every statement folded against its legs, the legless isolated — **6 statements worth $15,217.00**, five open plus #28 which reads {emerald:paid} with nothing behind it — and the contradictions named, not smoothed: #11 is {rose:void} with a $925.00 leg on the books, #25 sits {amber:partial} at $4,000.00 of $6,148.00. Rails walk beside the ladder: card 16 legs / $37,364.00 against wire 11 legs / $32,248.00 — *instant repayment from Spending is the rail the product nudges, and the mix proves the nudge works*. Each ladder ships with the LEFT JOIN shown, so the legless survive the render.",
    "**16:00 —** The afternoon is the engagement cycle. The review opens on the {violet:member leaderboard}: $7,262.35 across 24 events leading, $6,640.56 and $4,574.23 behind it, RANK ordered with the tie-break stated — four members tie at 4 events and the next rank skips. The {sky:concentration} read lands harder: 63.5% of volume from the $3,000-plus cohort, so one churned whale moves the book. The walk charts months via SUBSTR with LAG deltas, the first month's NULL left honest, and every branch reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
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
  ],

  topics: [
    {
      name: "Funding-event folds & conditional counts",
      why: "Every engagement read at Chime is a fold with a conditional count inside: events per day, landed per rail, reversed per member. The denominator question rides on every one — COUNT(*) over all events versus the settled subset is the difference between a landed rate and a settlement rate.",
      slugs: ["user-activity-for-the-past-30-days-ii", "article-views-ii", "game-play-analysis-i"],
    },
    {
      name: "Two-table reads: legs onto statements",
      why: "Repayment analytics is a two-table read: legs carry the statement's foreign key, statements carry the status and the billed amount. One wrong join key pairs a leg with the wrong statement and every coverage number downstream inherits the fiction — the id-coincidence trap (leg id equals cycle id) is exactly the silent mis-pairing Chime screens hunt.",
      slugs: ["replace-employee-id-with-unique-identifier", "employee-bonus", "product-price-at-a-given-date"],
    },
    {
      name: "Untouched-statement anti-joins",
      why: "Six statement cycles carry zero repayment legs — the collections anti-join. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the joined table in WHERE, which converts the join and deletes exactly the backlog you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "dormant-reactivation"],
    },
    {
      name: "NULL policy: void legs & missing settlements",
      why: "Statement #11 is void with a leg; #28 is paid with none. SUM over missing legs is NULL, not zero, and COUNT(column) versus COUNT(*) diverges exactly there. The policy — audit, report, or guard — is a stated decision, not a default.",
      slugs: ["employees-with-missing-information", "books-with-null-ratings", "find-customer-referee"],
    },
    {
      name: "Settlement clocks & interval logic",
      why: "The deposit-to-settlement clock is date arithmetic: JULIANDAY deltas per event, events overlapping payroll windows, advances whose repay lag by days. The NULL settlement timestamp is the standing trap — pending is not slow, and averaging over it fabricates the SLA breach.",
      slugs: ["rising-temperature", "users-that-actively-request-confirmation-messages", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Funding calendars & month spines",
      why: "The book runs on calendar buckets: events per month via SUBSTR, payroll windows, statements issued in a period. Half-open intervals and month keys are the mechanics, and the midnight boundary is where two 'identical' engagement reports disagree.",
      slugs: ["monthly-transactions-i", "friday-purchase-iii", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "LAG/LEAD volume walks",
      why: "The volume walk is LAG-shaped: this month's funding events minus last month's, the first row's NULL delta part of the story — no prior month, no delta. Hand-waving it to zero mislabels the baseline the engagement review quotes.",
      slugs: ["week-over-week-churn", "consecutive-numbers", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage CASE bands",
      why: "The coverage ladder is CASE arms evaluated in order: no legs first, exact only when settled equals billed, partial is the ELSE. Arm ordering matters — a statement the earlier arms don't catch lands in the ELSE by definition — and Chime's screens test whether the ELSE is a contract or a leak.",
      slugs: ["loan-types", "count-salary-categories", "weather-type-in-each-country"],
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
  ],
};
