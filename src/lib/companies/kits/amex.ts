// American Express — kit 6 of the Banking & Capital Markets domain (Batch H).
// Premium cards, spend and membership: the closed-loop read, where the same
// firm issues the card, carries the receivable and settles the merchant. The
// storefront db maps on honestly: invoices are member-account billings (the
// receivables the card book carries), payments are the settlement rails
// (method card / wire — card is the premium card rail, wire the partner and
// corporate rail), ledger_entries is the double-entry ledger, expenses are
// op-cost lines, customers are cardmembers and orders are booked spend events
// (REAL dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: American Express has 0 tagged sql rows in the band
// (checked company-pools.md for amex / American Express variants) — the whole
// pool and every topic slug is theme-curated from company-pools.md to Amex's
// known question families, provenance stated per problem below. Case figures:
// scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const amexKit: CompanyKit = {
  id: "amex",
  domainId: "banking",
  name: "American Express",
  tagline: "Premium cards, spend and membership",
  accent: "text-blue-100",

  brief: [
    "American Express is the closed loop — founded in **1850**, and unlike every other network it is issuer, acquirer and scheme at once: the cardmember carries the Platinum or **Centurion**, the merchant bills through Amex, and Amex carries the receivable in between. The business model is spend-centric — annual-fee membership economics plus a discount rate on every booked event — so the number the firm lives on is not transaction count but **spend**: 16 cardmembers generating **103 spend events worth 34833.28** on this book, with the top member alone carrying 24 of them for **7262.35**. The cultural rule follows the model: a member is a tenure and a balance, not a row — categorize spend wrong and the fee-waiver logic misfires; age the book wrong and the delinquency watch misses the account it exists to catch.",
    "The data org sits inside the loop. Every member-account billing lands as a receivable; every settlement clears it on one of two rails — card, the premium card rail (16 hits for **37364.00**), and wire, the partner-and-corporate rail (11 for **32248.00**) — and every settled dollar posts twice into the double-entry ledger, debit and credit, stored as integer cents with the dollar read always `cents / 100.0`. The daily proof is the fold: **181080.00 debits against 181080.00 credits across 80 ledger entries, delta 0** — and the coverage census reads 21 billings settled exact, 1 partial (4000.00 against 6148.00), 6 with no rail hit at all. The receivables watch those six — **15217.00** — age against flat 30-day terms.",
    "Interview style is spend-centric and boundary-exact. Screens walk from a warm-up rail fold into the two questions this firm is famous for: a {violet:spend-categorization CASE ladder} (which tier, which band, which fee logic — with the boundary someone will argue about) and the {rose:delinquency watch} — a LEFT-join coverage classification where the interesting rows are the ones with no settlement row at all. Follow-ups probe the denominator ('is that share of booked value or settled value?') and the units ('cents or dollars?'). Candidates who narrate grain, units and boundary operators before writing SQL do well; *on a premium book, a mis-banded member is a relationship problem, not a rounding error.*",
    "Preparation strategy: Amex has **0 tagged problems** in this app's band — the pool is theme-curated to its known question families: rail folds, coverage CASE ladders, member-tier rankings, anti-join watchlists, honest-denominator share math and cents-precision proofs (provenance stated per problem). Do the topics in order, then run both case studies on the live storefront database: one rebuilds the {rose:delinquency watch} the card-operations team works every morning, the other rebuilds the {violet:member spend ladder} the membership team ranks quarterly.",
    "Follow the map and the book splits by region: EU carries 45 events worth 15089.23 from 8 members, APAC 37 worth 11605.45 from 5, US 19 worth 7286.16 from just **2 members** at the richest ticket in the book — 383.48 — and LATAM 2 worth 852.44 from one. Pace is metronomic: **6 to 9 events** every month from 2024-01 through 2025-02, the loudest bucket 2024-01 at 8 events and 3731.97, single tickets ranging 25.47 to 1088.44 around a 338.19 average. Concentration is the standing headline — members over the 3000.00 lifetime line carry **63.5%** of book value — *a premium book is a short list wearing a large number.*",
    "This expansion widens the aperture to the moves the close actually runs. Set ops that diff two censuses of the same book; `LAG` walks that hand each month its predecessor's delta; self-joins that pair the {sky:split settlements} — five billings carrying one card hit and one wire hit each — without fanning the fold; FILTER censuses that count both rails in one pass; window frames that decide whether a balance walk steps entry by entry or folds peers. Same rule as ever, deeper water: *the definition ships before the syntax, and the boundary operator is quoted in the review.*",
  ],

  dayInLife: [
    "**08:00 —** the day opens on the rails, not the headlines. Overnight settlements cleared in two streams — card, the premium rail, and wire, the partner rail — and the first queries reconcile both against the member-account billings they clear: 27 rail hits against 28 bookings, zero orphans, and the exceptions classified before the morning standup. The numbers that matter are a pair per rail — **16 and 37364.00** on card, **11 and 32248.00** on wire — plus the coverage census: **21 exact, 1 partial at 4000.00 of 6148.00, 6 untouched**. A rail hit that reconciles to nothing is the day's first fire, and it gets quantified in SQL before anyone narrates it in a meeting.",
    "**11:00 —** midday is the {rose:delinquency watch}, the deep-work block. The open book — 6 billings, **19609.00** — goes under the coverage CASE ladder row by row: which accounts have no rail hit (5 of the 6), which caught a partial cover, and which is the paid-status billing with **zero** settlement rows — 1756.00 booked, the break that status alone would hide. Each watchlist row carries its booked amount, its coverage class and its age against the **30-day** terms line, because the retention desk calls the member, and a wrong class produces a wrong call.",
    "**14:30 —** then the membership read takes its hour. Spend folds by tier and category — the {violet:CASE band ladder} over booked spend, the member ladder ranked by lifetime value (7262.35, 6640.56, 4574.23, 3644.56 at the top), the concentration share (**63.5%** of book value from members over the 3000.00 line) recomputed with its denominator printed beside it. Each query ships twice — once to answer, once with the population stated in a comment — because the fee-benefit committee reads denominators the way the risk desk reads exposure.",
    "**17:30 —** the afternoon closes with the stakeholder cycle: the merchant-side pack (settlement latency against terms — **28.4 days average, 13 fastest, 84 slowest**), the finance review where the ledger proof (**181080.00 = 181080.00, delta 0**) anchors every downstream number, and the EOD writeup that routes the day's breaks — the partial, the paid-no-rail, the split-settlement pairs — to the desks that own them. There are rituals: every number in the pack carries its query, every CASE boundary carries its justification, and a watchlist class that cannot survive 'define exactly who this catches' is rewritten, not defended. *Amex SQL exists to keep a premium promise auditable.*",
    "**21:15 —** the night window belongs to the wire rail. Partner settlements clear after hours, so the handoff note pre-stages tomorrow's first query — the {rose:two-census diff} that stands billings-with-rail-hits against billings-the-book-calls-paid, the pair of misfits already queued for the desks that own them: a {rose:void} billing that settled 925.00, an open one holding a 4000.00 partial against 6148.00. The ledger proof re-runs on the overnight entries — 181080.00 against 181080.00, delta 0, or the morning stops — and the open book is re-aged before London logs in: **6 billings, 19609.00**, the partial unchanged. *A night shift that leaves its diffs staged is the whole continuity plan.*",
  ],

  metrics: [
    { name: "Booked spend volume", what: "Spend events and value across the member book — 103 events worth 34833.28 here. The top-line the spend-centric model is built on; categorization ladders and fee logic all hang off this fold." },
    { name: "Rail coverage census", what: "Billings classified by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 with no rail hit. The census that sizes cash application and routes the exceptions." },
    { name: "Open-book exposure", what: "Open billings count and value — 6 carrying 19609.00 here. The receivable the card book is still carrying, aged against the flat 30-day terms line." },
    { name: "No-cover watchlist", what: "Billings with no settlement row at all — 6 / 15217.00, including the paid-status break at 1756.00. The anti-join every screen here writes from memory, and the retention desk's call list." },
    { name: "Days-to-settle", what: "Billing-to-settlement latency on the settled book — 28.4 days average, 13 fastest, 84 slowest against flat 30-day terms. The slow tail is what the merchant team manages, not the average." },
    { name: "Member concentration", what: "Share of book value from members above the 3000.00 lifetime line — 63.5% here. The premium-book instinct that turns a GROUP BY into a relationship-management list." },
    { name: "Split-settlement share", what: "Settled billings that cleared across two rails — 5 of the settled book. Each pair must reconcile to its booked amount before the close publishes; the share sizes the manual-review queue." },
    { name: "Trial-balance delta", what: "Ledger debits minus credits — 181080.00 against 181080.00, delta 0 across 80 entries. The daily proof every spend, coverage and tier number inherits its credibility from." },
    { name: "Rail value mix", what: "Settled value and settlement count per rail — card 16 hits carrying 37364.00, wire 11 carrying 32248.00, a 53.7/46.3 split of the 69612.00 that cleared. Volume is load, value is exposure, and the ops review reads the pair side by side." },
    { name: "Ticket-size spread", what: "Distribution of single-event value — floor 25.47, ceiling 1088.44, average 338.19 across 103 events. Band ladders, premium definitions and outlier files all hang on this spread; a 'big ticket' claim without the floor and ceiling is a vibe." },
    { name: "Event-frequency census", what: "Members folded by booked-event count — 2 of 16 booked exactly once, the ladder topping out at 24 events. One-and-done versus habitual is the retention read, and it is a GROUP BY plus a second fold over the counts." },
    { name: "Op-cost mix", what: "Expense lines folded by category — Rent 16800.00 across 14 lines, Ads 4570.00 across 14, Travel 2521.00, Tools 1525.00. The 36 lines fold to 25416.00, tying to the ledger's operating_expenses balance; the tie-out is the point." },
  ],

  topics: [
    {
      name: "Spend folds at the billing grain",
      why: "Every morning read folds settlement rows onto the billings they clear — counts and values per rail, per status, per day. The trap is baked into the book: 27 rail hits against 28 billings means the fold's input is not the population the stakeholder assumes, and the interviewer listens for whether you count rows or billings before you sum.",
      slugs: ["products-worth-over-invoices", "number-of-rich-customers", "top-earners"],
    },
    {
      name: "The two-rail settlement split",
      why: "Card is the premium rail, wire the partner rail, and the ops review reads them side by side — count and value each. Screens drill the GROUP BY rail fold until the pairing (volume is load, value is exposure) is reflex, then escalate into the cross-foot that proves 37364.00 + 32248.00 ties to the ledger's cash debits.",
      slugs: ["monthly-transactions-i", "monthly-transactions-ii", "bank-account-summary-ii"],
    },
    {
      name: "The delinquency CASE ladder",
      why: "Coverage is a definition: exact when the folded settlement equals the booking, partial when it does not, no cover when no rail ever hit. That ladder is a CASE over a LEFT join folded per billing — and this firm argues about boundaries the way it argues about fee bands, so the arms must be exhaustive and deliberate.",
      slugs: ["loan-types", "delinquency-buckets", "count-salary-categories"],
    },
    {
      name: "Member ladders and rank windows",
      why: "The membership team ranks members by lifetime spend every quarter, and ties or near-ties in spend amounts are common enough that LIMIT instincts break publicly. The rank trio — who shares a rung, what the next rung is called — decides the fee-tier conversation before it starts.",
      slugs: ["rank-scores", "second-highest-salary", "find-the-team-size"],
    },
    {
      name: "The no-cover anti-join",
      why: "The no-cover watchlist — 6 billings, 15217.00 — is a LEFT JOIN plus an IS NULL on the join key, the single most-quoted shape in the building. Screens escalate it: NOT EXISTS twins, WHERE-placement traps that silently convert the anti-join back to an inner fold and delete the watchlist.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "sellers-with-no-sales"],
    },
    {
      name: "Honest denominators on spend shares",
      why: "Concentration shares, rail mixes, fee-rate reads — every ratio here sits one integer division away from printing zero. The house habit: 100.0 before the division, the denominator's population (booked or settled?) decided before the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "card-launch-success"],
    },
    {
      name: "NULL policy on the open book",
      why: "An unbilled settlement is a NULL rail row; a no-cover billing is a NULL fold. Screens check whether you treat NULL as data to report, coalesce to zero at the display edge with a stated reason, or exclude with the exclusion named — because the paid-status billing with no rail hit is exactly the row a careless NULL policy erases.",
      slugs: ["calculate-special-bonus", "books-with-null-ratings", "find-customer-referee"],
    },
    {
      name: "Tenure and settlement-calendar math",
      why: "Membership tenure and settlement latency both live in date arithmetic: JULIANDAY deltas for age, STRFTIME '%Y-%m' buckets for the trend. The recurring traps are all here — BETWEEN dropping the last night of a month, a '%m' key merging Februaries across years, an aging read that quietly excludes the rows it names.",
      slugs: ["settlement-fails-aging", "rising-temperature", "friday-purchases-i"],
    },
    {
      name: "Cents precision and the balanced proof",
      why: "Money in the finance tables is INTEGER cents — the dollar read is cents / 100.0 and every precision bug in the building is a variant of forgetting that. The trial-balance fold (181080.00 = 181080.00, delta 0) is the cheapest audit in SQL and the habit the screens reward most.",
      slugs: ["trial-balance-check", "odd-and-even-transactions", "bank-account-summary"],
    },
    {
      name: "Spend histograms and tier buckets",
      why: "Fee tiers and spend bands are bucket questions: CASE bands over booked spend, histograms over ticket size, tier assignment with the boundary documented. The interviewer checks whether your bands tile the line without gaps and whether the exactly-at-the-boundary member lands where the fee schedule says.",
      slugs: ["spend-histogram", "customer-purchasing-behavior-analysis", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Set ops & the reconciliation stack",
      why: "Two feeds describing one book is the house condition: 27 rail rows against 28 billings, a status column against a settlement census. UNION ALL stacks censuses that are disjoint by construction — card beside wire — while EXCEPT stands one census against another and hands back the misfits. The discipline is matching column shapes first, stories second.",
      slugs: ["movie-rating", "league-statistics", "team-scores-in-football-tournament"],
    },
    {
      name: "Month spines & trend buckets",
      why: "The trend page buckets by SUBSTR(created_at, 1, 7) — a '2024-01' key that sorts as a calendar — and every claimed spike is checked against the flat 6-to-9 monthly pace before it earns a slide. Year-over-year and bucket-to-bucket reads are LAG walks over those keys, and the trap is always the key itself: '%m' alone merges Februaries across years.",
      slugs: ["unique-orders-and-customers-per-month", "year-on-year-growth-rate", "transaction-velocity"],
    },
    {
      name: "LAG/LEAD movement walks",
      why: "Movement reporting here is deltas, not levels: month-over-month billing walks, week-over-week churn, roll-forward waterfalls where each line explains the move from the last. LAG hands every row its predecessor and the edge rows go NULL by definition — a delta column that never shows a NULL is hiding its first row.",
      slugs: ["week-over-week-churn", "mrr-waterfall", "growth-accounting"],
    },
    {
      name: "Split-pair self-joins",
      why: "Five billings settle across two rails — one card hit and one wire hit each — and pairing those rows without fanning the fold is a self-join with a canonical key: same billing, strictly ordered row ids, so (A, B) and (B, A) collapse to one pair. The same shape finds duplicate rail hits and mutual relationships.",
      slugs: ["apples-and-oranges", "average-time-of-process-per-machine", "circular-transfers"],
    },
    {
      name: "One-pass censuses & conditional folds",
      why: "The close wants censuses in one scan: exact settlements, partials, no-covers, both rails — columns that cross-foot to the booked population. FILTER (WHERE …) counts conditionals without a re-scan, the conditional SUM/CASE ladder is its twin, and the cross-foot identity is the proof the census is exhaustive.",
      slugs: ["snaps-analysis", "total-traveled-distance", "employees-with-deductions"],
    },
  ],

  theory: [
    {
      id: "amex-t1",
      q: "A member-account billing can settle across two rails, and some billings never settle at all. For the end-of-day coverage report, which join do you pick — and what happens to each population either way?",
      a: "Decide from the survival rule the report implies. The settled-value report is an INNER fold from settlements to billings: it runs at settlement grain, 27 rows here, with the five split billings appearing twice — so any fold that follows must aggregate per billing before 'settled value' means anything. The coverage report is LEFT from billings: the 6 billings with no settlement row are the {rose:delinquency watch} — 15217.00 of exposure — and they survive only if no right-table predicate leaks into WHERE, because WHERE p.amount_cents > 0 quietly converts the LEFT JOIN into an INNER and the watchlist vanishes. The proof this discipline matters is in the anomalies: a billing can carry paid status with zero settlement rows (1756.00 booked here), and status is a different fact from settlement presence — only the join decision decides which fact your report can even see. Say the survival rule out loud first; the join type is the consequence, not the choice.",
      tag: "joins",
    },
    {
      id: "amex-t2",
      q: "The card book holds 28 billings and 27 settlement rows, five billings split across two rails. Narrate every COUNT in the fold that reports both populations.",
      a: "Every COUNT gets its grain said out loud. COUNT(*) over the bare billings table is 28 — booked billings, the denominator the exposure report quotes. COUNT(*) over the INNER join is 27 — one row per settlement, where the five split billings each contribute two rows; it counts rails, not books. COUNT(DISTINCT i.id) over the LEFT join is 22 — billings with at least one rail hit, the 5 splits folded back to single books. The remaining 6 are the no-cover watchlist, and 22 + 6 = 28 is the reconciliation identity that proves the fold's populations are exhaustive. The Amex-flavored trap is the fourth count pretending to be one of these: after a careless join, COUNT(p.id) reads 27 and looks like a billing count while actually counting settlement rows. The strong candidate answers 'one row per WHAT?' for every aggregate before computing any of them — on a premium book, that question is the interview.",
      tag: "aggregation",
    },
    {
      id: "amex-t3",
      q: "Fee tiers are a CASE band ladder over lifetime spend. Where do the boundary members land, and how do you prove the bands tile the whole book?",
      a: "Two moves: exhaustive arms, then a census that proves them. The ladder must tile without gaps — under 3000.00, 3000.00 up to the next cut, and so on — and the boundary operator is the whole argument: a member at exactly 3000.00 belongs where the fee schedule says, and >= versus > decides which rung that is. The proof is arithmetic, not vibes: every member lands in exactly one arm, so the CASE census's counts must sum to the population (16 members here) and the band values must sum to the book (34833.28). If your histogram misses a member or a dollar, an arm is missing or overlapping. The Amex twist is that the boundary is a business decision — the fee-waiver line — so the query documents the operator in a comment and the reviewer reads the comment before the numbers. A band ladder that 'works' but cannot state who sits at the cut is a bug wearing a report.",
      tag: "aggregation",
    },
    {
      id: "amex-t4",
      q: "The no-cover watchlist is a NULL problem wearing a finance costume. What is your NULL policy for the delinquency report?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — the comparison is UNKNOWN — so WHERE settled_amount < booked_amount silently drops the no-cover rows, which are precisely the rows the delinquency report exists to name. Joins: NULL keys never match, which is why the anti-join that builds the watchlist tests the join key IS NULL — 6 billings, 15217.00. Aggregates: SUM and COUNT(col) skip NULLs while COUNT(*) keeps the row, so the gap between the two counts IS the no-cover population. The policy: define the population first, then choose where NULL lives. The watchlist keeps unmatched rows visible with NULL settlement columns — the honest print; the display layer may COALESCE to 0.00 at the edge, with the note that zero-means-no-rail-hit here. What is never acceptable is a mid-pipeline COALESCE that launders 'no settlement' into 'settled zero' — the paid-status billing with no rail hit (1756.00 booked) is exactly the break that habit produces, and it shipped to a close before.",
      tag: "nulls",
    },
    {
      id: "amex-t5",
      q: "Where does the 'only settled rows' filter live, and where does the 'only bands with five-plus billings' filter live? Same instinct, different clauses — explain.",
      a: "The first is a row-level fact: settled-ness is a property of one settlement row, so it lives in WHERE and discards rows before the fold touches them. The second is a group-level fact: 'five or more' is a property of a folded group, so it lives in HAVING, which runs after GROUP BY and can see COUNT. The clauses cannot swap: WHERE COUNT(*) >= 5 fails to compile — aggregates do not exist pre-fold — and a row predicate in HAVING wastes the fold by filtering populations that were already discarded. The pipeline order is the whole answer: FROM builds the rows, WHERE filters them, GROUP BY folds them, HAVING judges the groups, SELECT projects, ORDER BY displays. The Amex twist is spend-band work: filter cheap and early (the rail, the month) in WHERE to shrink the fold, and judge tier thresholds and coverage classes in HAVING where they are definitional. A screen that asks this is really asking whether you know WHEN each fact becomes true in the engine — because that is when it can be acted on.",
      tag: "pipeline",
    },
    {
      id: "amex-t6",
      q: "Flag billings whose booked value beats their member's average booking. Scalar or correlated subquery — and what happens when the inner fold comes back empty?",
      a: "The two shapes answer different questions, and the cost profiles differ with them. The scalar shape — booked > (SELECT AVG(amount) FROM billings) — computes the book-wide average once and compares every row to it; it is 'above the book average'. The correlated shape — booked > (SELECT AVG(amount) FROM billings b2 WHERE b2.member_id = b.member_id) — re-runs per outer row and answers 'above this member's own line', which is the spend-pattern question the relationship team actually wants: a 444.80 event is nothing next to a 7262.35-lifetime member's average and enormous for a single-event account. The trap both share: a scalar subquery is contractually 0-or-1 rows, and 0 rows yields NULL, not an error — every comparison against NULL is UNKNOWN, so the flag report silently returns nothing on a filtered staging table where the member fold is empty. Name the inner population per row, state the empty case, and pick the shape from the question's population, not from habit.",
      tag: "subqueries",
    },
    {
      id: "amex-t7",
      q: "Settlements arrive on TEXT timestamps. Bucket them by month, measure days-to-settle, and keep the calendar whole while you do it.",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', paid_on) — or SUBSTR(paid_on, 1, 7) on fixed-width ISO text — gives '2025-02', the year-first key that sorts as a calendar; '%m' alone merges Februaries across years and silently re-folds the close. Diffs: JULIANDAY(paid_on) - JULIANDAY(issued_on) returns fractional days — this book's settled latency is a 28.4-day average with a 13-day floor and an 84-day tail against flat 30-day terms, and the ROUND happens once, at the END, not per row. Windows: half-open intervals — issued_on >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final evening's settlements and with them the month-end burst. The deeper caveat is population: only settled billings HAVE a days-to-settle, so the NULL filter is definitional work and gets said out loud — 'this measures the settled book; the 6 no-cover billings are out of scope by construction.' State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "amex-t8",
      q: "A paid-status billing has no settlement row at all — 1756.00 booked, zero rail hits. Walk me through your break-handling policy — and tell me what the trial balance says about it.",
      a: "Breaks are data, not noise, and the policy has four moves. Detect: classify every billing by the pair (status, settlement presence) — paid-no-rail and void-but-settled are the two labeled failure modes, and both are CASE arms over a LEFT join. Quantify: one billing marked paid with 1756.00 booked and no rail hit — numbers route work, adjectives do not. Reconcile: the ledger still proves — 181080.00 debits against 181080.00 credits, delta 0 across 80 entries — because double-entry records what HAPPENED, and the break is a process failure the books absorbed, which is exactly why the trial balance alone is never sufficient evidence of correctness. Route: flag and hand to the desk that owns the fix; never delete, never silently re-status. The coverage census then reconciles end to end — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — and the exact fold's arithmetic closes against the rail totals: 37364.00 card plus 32248.00 wire. A candidate who can narrate that loop — detect, quantify, reconcile, route — is describing the job, not answering a question.",
      tag: "quality",
    },
    {
      id: "amex-t9",
      q: "The balance walk on the cash account — 27 ledger entries in event order — jumps two entries at once on days where two postings share a timestamp. Why, and which frame fixes it?",
      a: "The default window frame with ORDER BY is RANGE, and RANGE folds peers — rows sharing the sort key step together, so both same-day postings land in the walk at once and the balance never shows the intermediate position. The fix is an explicit frame: SUM over ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks entry by entry, even where timestamps tie. But the choice is a definition, not a correction: a pace walk (what did the position look like after each posting?) is ROWS; a peer-total (position at each distinct event time?) is RANGE, and the reader should be told which they are getting. On Amex reviews the frame is quoted in the slide footer next to the fold — because the same 27 entries produce two different-looking walks, and only one of them is the one the controller asked for.",
      tag: "windows",
    },
    {
      id: "amex-t10",
      q: "Each member's statement walk must restart per member — where does PARTITION BY go, and what does the first row of every partition look like?",
      a: "PARTITION BY lives inside the OVER: LAG(total) OVER (PARTITION BY member_id ORDER BY created_at, id) — the walk resets at each member boundary, 16 partitions over the 103 events, and the first row of every partition carries a NULL prior amount by definition. That NULL is information: 'no predecessor yet', not zero. COALESCE it to 0.00 and the first delta of every account reads as a jump from nothing — the delta column quietly lies on day one for every member. The companion rule is the tiebreaker: ORDER BY created_at alone is ambiguous when two events share a timestamp, so the id joins the sort and the walk becomes reproducible. Say the three things out loud — partition, order, edge behavior — and the statement walk writes itself.",
      tag: "windows",
    },
    {
      id: "amex-t11",
      q: "You stack the card census and the wire census into one reconciliation sheet. UNION or UNION ALL — and what does the choice cost you when the sheet is wrong?",
      a: "UNION ALL is a raw stack: every row of both arms survives, and here the arms are disjoint by the rail column — 16 card rows and 11 wire rows cross-foot to 27, so nothing can collide and the cheap operator is the honest one. UNION runs an implicit DISTINCT over the whole stack: wasted work in a clean world, and in a dirty one it hides the finding — if a card row and a wire row were ever row-for-row identical, UNION would silently delete the duplicate instead of letting the cross-foot fail. In reconciliation work the rows an operator removes ARE the audit trail, so the house rule is UNION ALL for stacked censuses, and UNION only where deduplication is the declared goal. The other discipline is shape: both arms must project the same columns in the same order, or the stack compares apples to account numbers.",
      tag: "setops",
    },
    {
      id: "amex-t12",
      q: "The anomaly queue is 'billings with a rail hit that the status column does not call paid'. Why is EXCEPT the right diff here — and what does it do with NULLs that NOT IN does not?",
      a: "Build two single-column censuses: arm one, the 22 billing ids that carry at least one rail hit; arm two, the 21 ids the status column calls paid. EXCEPT returns rows of the first census absent from the second — billing 11, the void that settled 925.00, and billing 25, the open book's partial at 4000.00 of 6148.00 — exactly the misfits. The NULL story is the deeper half: set operations compare whole rows under distinctness semantics where NULL equals NULL, so a NULL id in either arm is just a row, not a poison. NOT IN evaluates x = NULL per row, UNKNOWN is not TRUE, and one NULL in the flagged set empties the entire gate. And note the mirror: billing 28 — paid status, 1756.00, zero rail hits — lives in the opposite diff (paid EXCEPT has-rail), which is why the anomaly queue is always two queries, never one.",
      tag: "setops",
    },
    {
      id: "amex-t13",
      q: "The membership ladder folds lifetime spend, ranks it, then cuts the top rungs. Why stage that in a CTE instead of writing one dense query?",
      a: "Because each stage owns a definition, and a CTE gives each one a name the reviewer can interrogate. Stage one folds per member — SUM(total) as lifetime value, COUNT(*) as frequency, GROUP BY member. Stage two ranks the folded set — RANK() OVER (ORDER BY lifetime_value DESC), with the tie policy decided here and nowhere else. Stage three cuts the deliverable — LIMIT, or a HAVING floor on events. Nest all of that inline and the reader re-derives the grain on every line; a named CTE ships the definitions in order, and the follow-up ('what if the watchlist is activity-based, 13-plus events?') becomes a one-line edit to the stage that owns it. The Amex habit: every stage's output population is stated in a comment, because the fee committee reads denominators before it reads numbers.",
      tag: "staging",
    },
    {
      id: "amex-t14",
      q: "A reviewer wants each billing's settlement dates folded into one readable cell. What does GROUP_CONCAT give you, and what does it not?",
      a: "GROUP_CONCAT folds a group's values into one TEXT cell with a separator — GROUP_CONCAT(paid_on, ' · ') turns a billing's rail hits into '2025-01-28 · 2025-02-11', which is exactly the right shape for a review copy the ops desk reads. What it does not give you: guaranteed order inside the string unless the query orders deterministically; a number — it is display, never money math, and the SUM stays separate; or deduplication unless you ask for DISTINCT, which on a reconciliation sheet is a decision, not a default. The trap to name: a folded cell looks like a summary but compares like a string — '2025-1-2' and '2025-01-02' are different cells for the same settlement. For anything analytical — deltas, gaps, prior amounts — the window walk (LAG) is the honest tool and the concat is the coat it wears in the deck.",
      tag: "strings",
    },
    {
      id: "amex-t15",
      q: "The rail census wants card count, wire count and exact-hit count in one pass. Sell me FILTER (WHERE …) over the CASE ladder.",
      a: "FILTER counts only the rows that pass its predicate inside one aggregate pass: COUNT(*) FILTER (WHERE method = 'card'), COUNT(*) FILTER (WHERE method = 'wire') — the census ships in a single scan, the columns sit side by side, and they cross-foot: 16 plus 11 is 27. The conditional-SUM twin — SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END) — computes the identical number and reads fine; FILTER's edge is readability and the fact that it composes with any aggregate without an ELSE. The trap that decides the argument: COUNT(col) FILTER skips NULLs inside the count, while COUNT(*) FILTER counts surviving rows — say which you mean, because on a LEFT-joined fold the no-cover rows carry NULL rail columns and the two forms disagree by exactly the watchlist. One pass, columns that sum to the population, and the definition printed beside each column — that is the census the close signs.",
      tag: "aggregation",
    },
    {
      id: "amex-t16",
      q: "Where does ROUND go in a money query — and why does this firm care more than most?",
      a: "Money folds in INTEGER cents end to end; the /100.0 promotion happens once, at the display edge, and ROUND happens once, after every fold — ROUND(SUM(amount_cents) / 100.0, 2), never per row before the fold. The reason this firm cares is the proof chain: the trial balance (181080.00 against 181080.00, delta 0) is an integer-exact identity, and every display figure downstream must reconcile back to it. Round per row and then fold, and the fold no longer ties to the ledger — the drift is small, systematic and exactly the kind of thing a close review is built to catch. The same rule governs averages: the 28.4-day settlement latency is the average of fractional day-deltas rounded once at the end, not an average of rounded days. Precision is display; identity is storage; the two never mix in one expression.",
      tag: "precision",
    },
    {
      id: "amex-t17",
      q: "The trend page must show all fourteen months even where a month is quiet. How do you build a spine, and why does the join direction matter?",
      a: "A spine is the calendar as a first-class table: distinct 'YYYY-MM' keys — or a generated series — LEFT JOINed to the activity fold, so months with no rows survive as zero-filled buckets instead of vanishing. The join direction is the whole trick: activity LEFT JOINed onto the spine keeps every month; spine joined to activity as an INNER fold deletes the quiet months and the chart inventories a cliff that never happened. Here 2024-01 through 2025-02 run 6 to 9 events a month, so the spine is dense and the habit looks ceremonial — right up until a partner rail goes quiet for a month and the trend page must show the hole, not skip it. The zero-fill lives at the display edge with a stated reason (zero means 'no events', not 'no data'), because a mid-pipeline COALESCE would launder missing months into settled zeros.",
      tag: "dates",
    },
    {
      id: "amex-t18",
      q: "Pair each split billing's card hit with its wire hit. How does the self-join avoid double-counting and mirror pairs?",
      a: "Three predicates, in this order: the equality — p1.invoice_id = p2.invoice_id — restricts to the same billing; the strict ordering — p1.id < p2.id — both excludes self-pairs and canonicalizes, so (card, wire) and (wire, card) collapse to one oriented pair; and if the business wants cross-rail pairs only, the method inequality. The verification is arithmetic, not vibes: 27 rail rows fold onto 22 billings, five of which carry two hits — so the pairing must return exactly five pairs, and any other count means the join fanned or filtered something. The same shape runs the duplicate-charge screen: same natural key, adjacent ids, amounts compared — with the tiebreaker declared so the pair order is reproducible. A self-join without the canonicalization is a triangle count wearing a report's name.",
      tag: "joins",
    },
    {
      id: "amex-t19",
      q: "Define 'settled value' so the number survives the fee-benefit committee. What are the denominators?",
      a: "Settled value is the SUM of settlement amounts on the settled census: 37364.00 on the card rail plus 32248.00 on the wire — 69612.00 over 27 rail rows, which fold onto 22 distinct billings because five billings split across both rails. Every one of those qualifiers is a denominator decision: rail-row grain (27), billing grain (22), or booked-book grain (28 billings including the 6 with no rail at all) — three different populations, three different shares, and quoting any of them without its population is how a 46.3 percent wire mix becomes an argument. Booked value is a different census entirely — it lives on the billings table and includes money no rail ever touched. The committee rule: the number ships with its grain in the same sentence, and the fold that produced it is one click away.",
      tag: "kpi",
    },
    {
      id: "amex-t20",
      q: "These tables are small — 103 orders, 80 ledger entries. Why do performance instincts still matter in an interview here?",
      a: "Because habits scale, and the small db is where the habits are visible. Sargable predicates: do not wrap the join column or the date column in a function when the comparison can be written against the bare column — an index on payments.invoice_id is worthless the moment the predicate computes on it. Filter early: a WHERE on rail or month before the fold shrinks every downstream aggregate, which is pipeline order as a performance tool, not just correctness. Project deliberately: SELECT * in an export drags columns the consumer never reads. And the instinct to check the plan — is this fold scanning, is this subquery re-running per row — is what the interviewer is really grading, because the query that is fine at 80 rows dies at 80 million, and nobody warns you on the way up.",
      tag: "performance",
    },
    {
      id: "amex-t21",
      q: "A settlement lands three days after the close. What does your month-over-month walk do, and what is the restatement policy?",
      a: "The walk does the honest, annoying thing: the bucket keyed on paid_on moves, the prior month's delta changes, and every downstream share inherits the wobble. The policy has three moves. Close the period: once a month is published, its fact rows are immutable — late settlements post into the current open period with their as-of date carried, so the trend never rewrites itself silently. Restate deliberately: if the late row materially changes a closed bucket, it re-runs as a labeled restatement — the delta between versions ships in the pack, not in a footnote. Reconcile the flip: a void-to-paid transition (the 925.00 row is exactly the kind that moves between censuses) changes the coverage census, so the census is versioned by run date. A trend that cannot say which version of the truth it is showing is not a trend — it is a screenshot.",
      tag: "quality",
    },
    {
      id: "amex-t22",
      q: "Two rail rows can describe the same charge. How do you dedupe without losing a real split settlement?",
      a: "Define the natural key first: billing, rail, amount, paid_on — the fields that together make one settlement event. A real split differs from its sibling on rail (one card hit, one wire hit) and survives any dedupe keyed on the natural key; a true duplicate matches on every field and is noise. Then keep-latest: ROW_NUMBER() OVER (PARTITION BY billing_id, method, amount_cents, paid_on ORDER BY id DESC) and keep rn = 1 — with the tiebreak declared, because 'latest' needs a deterministic answer when row ids are all that differ. The verification is the delta: count before and count after, and the removed rows are printed, not discarded — in this building the dedupe's victim list IS the finding. Dedupe on vibes — DISTINCT on a subset of columns — and the five split pairs are one careless predicate away from becoming two.",
      tag: "dedupe",
    },
    {
      id: "amex-t23",
      q: "Fee tiers by quartile: sell me NTILE(4) versus an explicit CASE band ladder on a 16-member book.",
      a: "NTILE(4) over 16 members ranked by spend hands each tile exactly four members — equal counts, whatever the values — which is the right tool when the tier IS a census of the ranking: top quarter of the book by position. What it is not: value-aware. Two members at the same spend can straddle a tile edge, and the 3000.00 fee-waiver line has no reason to fall on a tile boundary — NTILE has never heard of the fee schedule. The CASE band ladder is value-based: every member at or above the line lands in the same tier because the line says so, and the boundary operator is quoted in the query. The tie question decides it: where the tier must respect a business threshold, CASE; where the tier is positional by design, NTILE — and PERCENT_RANK is the honest middle ground when someone asks 'exactly where in the book is this member?'",
      tag: "windows",
    },
    {
      id: "amex-t24",
      q: "The pack ships nightly to stakeholders who re-run your queries. What makes a number in it reproducible?",
      a: "Determinism at every layer where an engine is allowed to improvise. ORDER BY with a tiebreaker: ORDER BY spend DESC, member_id — without the second key, tied members print in whatever order the plan found, and two runs of the same query can disagree on row order. Declared frames and tie policies: the walk's frame (ROWS, not default RANGE), the dedupe's keep-latest key, the window's PARTITION — all written, none implied. Populations in comments: the fold states its grain (rail rows, billings, members) because a re-runner needs to know what population to expect before they trust a match. And no positional tricks: ORDER BY 1, LIMIT without ORDER BY, GROUP BY ordinal — all legal, all fragile. The bar is simple to state and hard to fake: same input, same bytes, every run — a review that cannot be re-run is not a control, it is a hope.",
      tag: "audit",
    },
  ],

  mcqs: [
    {
      id: "amex-mcq-1",
      prompt: "A billing row stores amount_cents = 614800. Which SELECT prints the booked value the way the member statement shows it — 6148.00?",
      choices: [
        "SELECT amount_cents / 100 AS amount",
        "SELECT amount_cents / 100.0 AS amount",
        "SELECT ROUND(amount_cents) AS amount",
        "SELECT amount_cents * 100.0 AS amount",
      ],
      answer: 1,
      why: "Finance money here is INTEGER cents; the dollar read is amount_cents / 100.0. The .0 promotes the division to real arithmetic — 614800 / 100.0 prints 6148.0 — while integer 100 truncates odd-cent rows toward zero and leaks half-dollars out of member statements.",
      notes: [
        { choice: 0, why: "614800 happens to divide evenly, which is exactly why this bug survives review — the next billing at 92550 cents prints 925 instead of 925.50. The unit test that catches it uses an odd-cents row." },
        { choice: 2, why: "ROUND(amount_cents) rounds cents to cents: 614800. No unit conversion happened at all." },
        { choice: 3, why: "That multiplies to 61,480,000 — cents read as tenths of cents. The direction of the conversion is the whole discipline." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-2",
      prompt: "28 booked billings, 27 settlement rows, every settlement on a booked billing, 5 billings carrying 2 settlements each. How many rows does the INNER JOIN return?",
      choices: [
        "27 — one row per settlement",
        "28 — one row per billing",
        "33 — one row per matched or orphaned billing",
        "55 — both tables added",
      ],
      answer: 0,
      why: "The join runs at settlement grain: each of the 27 settlement rows matches exactly one billing, so 27 rows return and the 5 split billings appear twice. Billings without settlements vanish from an INNER fold entirely.",
      notes: [
        { choice: 1, why: "28 is the billing count — reachable from the bare table or as COUNT(DISTINCT i.id) over a LEFT JOIN. The join alone folds nothing back to billing grain." },
        { choice: 2, why: "33 is the LEFT JOIN row count: 27 matched rows plus 6 billings with no settlement (5 open, plus the paid-status one with no rail hit). INNER drops those 6." },
        { choice: 3, why: "55 adds the tables — no SQL fold adds row counts across a join. Row counts multiply by cardinality, they never sum." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-3",
      prompt: "The delinquency watch is billings LEFT JOIN settlements, keeping the misses. Which WHERE returns all 6 no-cover billings (15217.00) and nothing else?",
      choices: [
        "WHERE p.invoice_id IS NULL",
        "WHERE p.invoice_id = NULL",
        "WHERE COUNT(p.invoice_id) = 0",
        "WHERE p.id IS NOT NULL",
      ],
      answer: 0,
      why: "LEFT JOIN hands unmatched billings NULL settlement columns; the canonical miss test is the join key IS NULL — 6 rows, 15217.00. The predicate reads 'no settlement row exists', which is the definition of no cover.",
      notes: [
        { choice: 1, why: "= NULL is never TRUE — the comparison is UNKNOWN and the watchlist ships empty. NULL is tested with IS, never with =." },
        { choice: 2, why: "COUNT is an aggregate; it cannot run in WHERE at all — wrong clause, wrong layer. Row-level WHERE runs before any fold exists." },
        { choice: 3, why: "IS NOT NULL returns the opposite book: the 22 billings that DID settle. An inverted anti-join looks identical in the editor and opposite in the review." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-4",
      prompt: "Billing #1 books 4860.00 and settled across two rails of 2430.00 each. Why does the coverage CASE need SUM(p.amount_cents) = i.amount_cents rather than p.amount_cents = i.amount_cents?",
      choices: [
        "The row-level test compares one rail against the whole booking — neither rail equals 4860.00, so a clean split misfiles as partial",
        "p.amount_cents is NULL for split settlements",
        "The SUM overflows the INTEGER range on split books",
        "They are interchangeable; the engine picks one",
      ],
      answer: 0,
      why: "Coverage is a per-billing definition, but settlement rows arrive per rail: the fold must aggregate the rails (SUM) before comparing to the booked amount. The row-level comparison tests 2430.00 against 4860.00 and files a clean split as partial — the retention desk would call a member whose account is fine.",
      notes: [
        { choice: 1, why: "Matched rails carry real amounts — 243000 cents each here. NULLs appear on the no-settlement side of a LEFT JOIN, not on settled rails." },
        { choice: 2, why: "The whole ledger folds to 18108000 cents, nowhere near the 64-bit INTEGER ceiling. Overflow is not a live failure mode at these magnitudes." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-5",
      prompt: "The member ladder ties two members at the top; the next member is third by spend. DENSE_RANK hands that third member rank…",
      choices: ["3", "2", "1", "4"],
      answer: 1,
      why: "DENSE_RANK shares rungs on ties (1, 1) and hands the next distinct value rank 2 — no gaps. RANK would say 3; ROW_NUMBER would say 3 with an arbitrary tie order. On a fee-tier ladder, the difference is who gets the call.",
      notes: [
        { choice: 0, why: "That is RANK: ties share 1 and the next jumps to 3 — implying a missing second member who does not exist. Ladder consumers read that gap as data loss." },
        { choice: 3, why: "Ranks reach 4 only with four distinct values. Two tied firsts plus one follower is three positions, densely numbered 1, 1, 2." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-6",
      prompt: "Wire settled 32248.00 of the 69612.00 total. Which expression prints the wire share as 46.3?",
      choices: [
        "100.0 * SUM(wire_cents) / SUM(all_cents)",
        "100 * SUM(wire_cents) / SUM(all_cents)",
        "SUM(wire_cents) / SUM(all_cents) * 100",
        "ROUND(SUM(wire_cents) / SUM(all_cents), 3)",
      ],
      answer: 0,
      why: "The 100.0 multiplier forces real arithmetic at the first operation: 100.0 × 32248.0 ÷ 69612.0 = 46.3. Every other option performs an integer division somewhere upstream and truncates before the result can be real.",
      notes: [
        { choice: 1, why: "Integer 100: 3224800 / 69612 = 46 in integer math — the share prints 46 and the partner team argues over four-tenths of a point that never existed." },
        { choice: 2, why: "32248 / 69612 in integer math is 0 — the share prints 0.0. Truncation does not care that you multiply later." },
        { choice: 3, why: "The inner division is integer 0; ROUND(0, 3) is still 0. Rounding belongs at the END, after the arithmetic is real." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-7",
      prompt: "The fee-waiver screen runs `WHERE member_id NOT IN (SELECT id FROM flagged)`. One flagged row carries id = NULL. What ships?",
      choices: [
        "The full book minus NULL members",
        "An empty result — silently",
        "Only the NULL-member rows",
        "A type error",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: the comparison against NULL is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. One NULL empties the entire waiver screen while the query looks healthy — the most expensive NULL on a premium book. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "NOT IN does not skip NULLs — it poisons the whole membership test. The result is not reduced, it is gone." },
        { choice: 2, why: "NULL members fail every membership test too. Nothing survives, not even them." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-8",
      prompt: "The settlement calendar runs on TEXT timestamps including '2025-02-28 18:40:11'. Which WHERE returns every February settlement?",
      choices: [
        "WHERE paid_on BETWEEN '2025-02-01' AND '2025-02-28'",
        "WHERE paid_on >= '2025-02-01' AND paid_on < '2025-03-01'",
        "WHERE paid_on >= '2025-02-01' AND paid_on <= '2025-02-28'",
        "WHERE STRFTIME('%m', paid_on) = '2'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every February timestamp — '2025-02-28 18:40:11' < '2025-03-01' is TRUE. The month does not end at midnight on the 28th; it ends at March 1, and month-end settlement bursts are exactly that evening.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends: everything after midnight on Feb 28 falls outside the '2025-02-28' bound and vanishes — precisely the burst the close cares about." },
        { choice: 2, why: "Same wall, different syntax: <= '2025-02-28' still drops the evening of the 28th." },
        { choice: 3, why: "STRFTIME('%m') returns '02', not '2' — the comparison is never TRUE and the calendar ships empty. And a bare month key would merge Februaries across years." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-9",
      prompt: "The ledger's global fold reads 181080.00 debits, 181080.00 credits, delta 0 across 80 entries. Tomorrow the same fold returns delta 1756.00. What is the defensible first read?",
      choices: [
        "A rounding artifact from the /100.0 conversion",
        "A one-sided posting — something hit one side of the books without its pair",
        "Float drift accumulating over 80 rows",
        "The delta column should be NULL, not 0",
      ],
      answer: 1,
      why: "Double-entry is an identity, not an estimate: every posting writes both sides, so the global delta is 0 by construction — 181080.00 = 181080.00 here. A nonzero delta means a row or an edit broke the pair, and 1756.00 matching the paid-no-rail billing's booked value exactly is where you look first.",
      notes: [
        { choice: 0, why: "The ledger stores integer cents end to end; the /100.0 read happens once at the display edge and cannot drift. Integers do not round." },
        { choice: 2, why: "Same refutation: whole cents, integer arithmetic. Float drift is a REAL-column story and this is not one." },
        { choice: 3, why: "Delta 0 is the success state — the proof the books balanced. NULL would mean the fold itself failed to compute, a different and louder failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-10",
      prompt: "The member statement shows each spend event beside the lifetime spend BEFORE it. Which window hands each row its predecessor?",
      choices: [
        "LAG(...) OVER (ORDER BY event_date)",
        "LEAD(...) OVER (ORDER BY event_date)",
        "ROW_NUMBER() OVER (ORDER BY event_date)",
        "NTILE(2) OVER (ORDER BY event_date)",
      ],
      answer: 0,
      why: "LAG reaches one row BACK in the window's order — the prior lifetime total walks beside the current event. LEAD points forward; ROW_NUMBER only numbers; NTILE buckets.",
      notes: [
        { choice: 1, why: "LEAD is the forward read — next event, not previous. A swapped window walks the account backwards while the column label still says 'prior', and the delta column flips sign." },
        { choice: 2, why: "ROW_NUMBER assigns positions; it never carries a value from another row. You would still need a self-join on the computed number to fetch the prior total." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-11",
      prompt: "The morning pack stacks the card census and the wire census into one sheet. The arms are disjoint by the rail column. Which is the honest stack?",
      choices: [
        "UNION ALL — every row of both censuses survives and the counts cross-foot",
        "UNION — it sorts the sheet by rail",
        "UNION — it is faster than UNION ALL",
        "INTERSECT — it keeps only the rows both censuses share",
      ],
      answer: 0,
      why: "UNION ALL is a raw stack; the arms are disjoint by method, so nothing can double and the cross-foot holds — 16 plus 11 is 27. UNION runs an implicit DISTINCT over the stack: wasted work here, and in a dirty reconciliation the rows it removes are exactly the evidence you needed.",
      notes: [
        { choice: 1, why: "Sort order is an implementation detail, not a contract. UNION's guarantee is deduplication — assuming sort behavior is how cross-engine bugs are born." },
        { choice: 2, why: "Backwards: UNION does strictly more work (the dedupe pass). UNION ALL is the cheap one — and the honest one when the arms cannot collide." },
        { choice: 3, why: "INTERSECT keeps rows present in BOTH censuses — with disjoint arms that ships an empty sheet." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-12",
      prompt: "The member ladder runs GROUP BY member, ORDER BY lifetime spend DESC, LIMIT 1. Two members tie at the top. What ships?",
      choices: [
        "Both tied members",
        "One of them — picked arbitrarily by the engine",
        "An error — LIMIT requires a tie policy",
        "The second-highest member",
      ],
      answer: 1,
      why: "LIMIT 1 keeps one row after a sort that had to break the tie somehow — by rowid or whatever the plan found first. The ladder prints one name with no record that a tie existed. A tie-aware shape — RANK() OVER (ORDER BY spend DESC) with a cut, or an explicit tiebreak column — is the honest ladder.",
      notes: [
        { choice: 0, why: "LIMIT never returns two rows. If the tie matters — and on a fee-tier ladder it does — the query needs a tie-aware shape, not hope." },
        { choice: 3, why: "The tie is at the TOP; the second-highest member is a third account the query never considered." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-13",
      prompt: "Concentration: members over the 3000.00 lifetime line carry 63.5% of book value. Which query prints 63.5 and not 100?",
      choices: [
        "100.0 * SUM(CASE WHEN lifetime_spend >= 3000 THEN lifetime_spend ELSE 0 END) / SUM(lifetime_spend) over all 16 members",
        "SELECT 100.0 * SUM(lifetime_spend) / SUM(lifetime_spend) FROM members WHERE lifetime_spend >= 3000",
        "100 * SUM(CASE WHEN lifetime_spend >= 3000 THEN lifetime_spend ELSE 0 END) / SUM(lifetime_spend) with integer 100",
        "ROUND(AVG(lifetime_spend), 1) over members above 3000.00",
      ],
      answer: 0,
      why: "The share's denominator is the whole book — 34833.28 across all 16 members — so the threshold must live inside a conditional fold, not in WHERE. Filter first and the denominator shrinks to the numerator's own population; the share prints 100 and tells you nothing.",
      notes: [
        { choice: 1, why: "Classic denominator collapse: the WHERE removed exactly the rows the denominator needed. The number is well-defined and useless." },
        { choice: 2, why: "Integer 100 truncates the division before it goes real — the share drops toward 63 even with the population right." },
        { choice: 3, why: "That prints an average ticket for the segment, not a share of book value — the right population wearing the wrong statistic." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-14",
      prompt: "GROUP_CONCAT(paid_on, ' · ') folds a billing's settlement dates into one review cell. What does it NOT guarantee?",
      choices: [
        "A separator between values",
        "The order of values inside the string",
        "That every row of the group contributes a value",
        "That the result is TEXT",
      ],
      answer: 1,
      why: "GROUP_CONCAT joins the group's values with the separator — but the order inside the string is not contractual unless the query orders deterministically. A review cell reading '2025-02-11 · 2025-01-28' is the same settlement pair folded in reverse: same facts, misleading narrative.",
      notes: [
        { choice: 0, why: "The second argument IS the separator; without it the default is a comma. Both are guaranteed." },
        { choice: 2, why: "Every row of the group contributes a value (DISTINCT aside) — that part is contractual." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-15",
      prompt: "One scan, three columns: card settlements, wire settlements, exact hits. Which shape is the one-pass census?",
      choices: [
        "Three queries UNION-ed together",
        "COUNT(*) FILTER (WHERE method = 'card'), COUNT(*) FILTER (WHERE method = 'wire') and a conditional SUM, in one SELECT",
        "GROUP BY method twice and join the two results",
        "A cursor looping over the two methods",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts only the matching rows inside one aggregate pass — the census ships in a single scan and the columns cross-foot: 16 plus 11 is 27. The conditional-SUM/CASE ladder is its twin; the single scan is the argument.",
      notes: [
        { choice: 0, why: "Three scans stapled vertically — correct numbers, wrong shape, and the columns cannot sit side by side in one row." },
        { choice: 2, why: "Two folds plus a self-join to stitch them: more moving parts than the census needs, and the join is one more place to fan out." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-16",
      prompt: "The cash-account walk sums debits and credits across 27 ledger entries in event order. On days with two same-timestamp postings, the walk jumps both at once. Why?",
      choices: [
        "The default window frame is RANGE, which folds peer rows sharing the sort key into one step",
        "Window functions cannot run on INTEGER cents",
        "LAG consumes both rows at once",
        "The entries need a WHERE filter first",
      ],
      answer: 0,
      why: "With ORDER BY and no explicit frame, the frame is RANGE — peers (rows sharing the ORDER BY value) move together. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks entry by entry. State which the reader wants: a pace walk is ROWS, a peer-total is RANGE.",
      notes: [
        { choice: 1, why: "Windows run fine on INTEGER cents — the whole ledger is proof." },
        { choice: 2, why: "LAG carries one row's value per row; it has no opinion about frames. The peer-folding is the frame's doing." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-17",
      prompt: "The flag report marks events above their OWN member's average ticket. What happens to members with exactly one booked event?",
      choices: [
        "They never appear — the event equals the member's own average and > against it is never TRUE",
        "They flag whenever the event beats the book-wide average",
        "The query errors — AVG needs GROUP BY",
        "They appear with a NULL flag",
      ],
      answer: 0,
      why: "One event IS the member's average — total > AVG(total) over the same single row is never TRUE — so single-event members are structurally invisible to the above-own-average read. That is a definition, not a bug; the report states the exclusion or compares against the book-wide 338.19 instead.",
      notes: [
        { choice: 1, why: "Conflates the two benchmarks: 444.80 clears the book average but not its own member's line. The correlated fold compares against the member's own fold." },
        { choice: 3, why: "No NULL is produced — the comparison is against a computed scalar that equals the row's own value. FALSE, not UNKNOWN." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-18",
      prompt: "The flagged set feeding a NOT IN gate carries one NULL id. The same diff run as a set operation — flagged EXCEPT cleared — ships fine. Why does EXCEPT survive the NULL?",
      choices: [
        "EXCEPT ignores NULL rows entirely",
        "Set operations compare whole rows and treat NULLs as equal to each other for distinctness — no UNKNOWN poisons the test",
        "EXCEPT casts NULLs to zero first",
        "EXCEPT only works on INTEGER columns",
      ],
      answer: 1,
      why: "NOT IN evaluates x = NULL per row; UNKNOWN is not TRUE, so one NULL empties the gate. EXCEPT compares rows for distinctness under set semantics where NULL equals NULL — the NULL row is just a row that can match and be removed. Same business question, opposite NULL outcomes.",
      notes: [
        { choice: 0, why: "Nothing is ignored — the NULL row participates fully. 'Ignoring' is what the NOT IN failure looks like from the outside." },
        { choice: 2, why: "No cast happens. Equality-under-distinctness is what saves the diff, not a type conversion." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-19",
      prompt: "Days-to-settle averages 28.4 across the settled book (13 fastest, 84 slowest). Which computation prints the honest 28.4?",
      choices: [
        "ROUND the day-delta per row first, then AVG",
        "CAST(julianday(paid_on) - julianday(issued_on) AS INTEGER) per row, then AVG",
        "AVG of the fractional julianday deltas over the settled book, ROUND once at the end",
        "JULIANDAY(MAX(paid_on) - MIN(issued_on))",
      ],
      answer: 2,
      why: "Fractional days are information — an evening settlement carries 0.78 of a day. Average the fractional deltas and round once at the display edge. Per-row rounding shifts the mean before anyone sees a number, and CAST truncates toward zero, systematically shaving the 84-day tail the desk manages.",
      notes: [
        { choice: 0, why: "Rounding before averaging moves the statistic — 28.4 becomes a number nobody can reconcile to the row-level data." },
        { choice: 1, why: "CAST floors: the slowest case lands under 84 and the tail report is quietly flattering." },
        { choice: 3, why: "That is one giant interval over the whole book, not an average of per-billing latencies — a different statistic wearing the same label." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-20",
      prompt: "27 settlement rows, 5 billings split across two rails. Which expression counts BILLINGS with at least one rail hit — 22, not 27?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT invoice_id)",
        "SUM(invoice_id)",
        "COUNT(paid_on) - 5",
      ],
      answer: 1,
      why: "COUNT(*) counts the fold's rows — 27, one per rail hit. COUNT(DISTINCT invoice_id) folds the splits back — 22. The reconciliation identity writes itself: 22 billings with rails plus 6 with none equals 28 booked.",
      notes: [
        { choice: 0, why: "That is the rail count. Quoting it as a billing count is the grain error this kit drills hardest." },
        { choice: 2, why: "SUM over ids sums identifiers — a meaningless number that changes when rows reorder." },
        { choice: 3, why: "Arithmetic patches are how grain errors hide: correct here by luck, wrong the day the split count changes." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-21",
      prompt: "The query computes booked AS amount_cents / 100.0 in SELECT, then runs WHERE booked > 3000. What happens?",
      choices: [
        "It works — SELECT aliases are visible everywhere",
        "An error or a silent misread — WHERE runs before SELECT, so the alias does not exist yet",
        "The alias works in WHERE but not in HAVING",
        "The alias works only when GROUP BY is present",
      ],
      answer: 1,
      why: "SELECT's aliases are projections — they exist after the fold, and WHERE runs before it. Repeat the expression in WHERE or stage the fold in a CTE. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — settles this every time.",
      notes: [
        { choice: 2, why: "Backwards: engines commonly accept aliases in ORDER BY (which runs last) and dialect-permitting in HAVING, but never in WHERE." },
        { choice: 3, why: "GROUP BY has nothing to do with alias visibility; SELECT simply has not run when WHERE evaluates." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-22",
      prompt: "NTILE(4) over 16 members ranked by spend assigns fee quartiles. What is TRUE of the tiles?",
      choices: [
        "Each tile holds four members with equal lifetime spend",
        "Each tile holds four members — equal COUNTS, whatever the values",
        "The tiles respect the 3000.00 fee-waiver boundary by construction",
        "NTILE errors when spends tie",
      ],
      answer: 1,
      why: "NTILE tiles by POSITION: 16 members into 4 tiles is 4 per tile, but the values inside can be wildly unequal — and two members at the same spend can straddle a tile edge. Value-based tiers are a CASE band ladder; tiles are a census of the ranking.",
      notes: [
        { choice: 0, why: "Equal counts, never equal values — that is the difference between a tile and a band." },
        { choice: 2, why: "NTILE has never heard of the fee schedule. If the waiver line must sit at a tile edge, tiles are the wrong tool." },
        { choice: 3, why: "Ties are resolved silently by position — which is exactly why the tie policy must be stated before NTILE runs." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-23",
      prompt: "Pair each split billing's two rail rows with a self-join. Which predicate pairs each card hit with its wire hit exactly once — no mirrors, no self-pairs?",
      choices: [
        "p1.invoice_id = p2.invoice_id",
        "p1.invoice_id = p2.invoice_id AND p1.id < p2.id",
        "p1.id = p2.id",
        "p1.invoice_id = p2.invoice_id AND p1.method = p2.method",
      ],
      answer: 1,
      why: "The equality alone pairs every row of a billing with every other — including itself — and yields (card, wire) and (wire, card) as two pairs. The strict id ordering canonicalizes: each unordered pair appears once, oriented. Five split billings produce exactly five pairs.",
      notes: [
        { choice: 0, why: "That is a triangle: self-pairs plus both orientations. Pair counts double before anyone reads them." },
        { choice: 2, why: "That joins each row only to itself — every 'pair' is the same row twice." },
        { choice: 3, why: "Same method never pairs — the splits are cross-rail by construction, so this ships empty." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-24",
      prompt: "The MoM walk defines delta as current month minus prior month. Someone builds it with LEAD. What does the reader see?",
      choices: [
        "Identical values — LAG and LEAD are aliases",
        "Interior signs flipped and the NULL parked on the LAST month instead of the first",
        "An error — the window needs PARTITION BY",
        "Only the first month changes",
      ],
      answer: 1,
      why: "LAG(revenue) pairs each month with its predecessor — the first row's delta is NULL by definition. LEAD pairs with the successor: interior deltas flip sign and the NULL moves to the final row. Same numbers, opposite signs — a walk that reads upside down.",
      notes: [
        { choice: 0, why: "They differ on every interior row by sign and on the edges by where the NULL lands." },
        { choice: 2, why: "It runs fine — the whole result set is one implicit partition. The failure is semantic, not syntactic." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-25",
      prompt: "The statement prints each billing's booked value from INTEGER cents. Where does ROUND belong?",
      choices: [
        "ROUND(amount_cents, 2) before dividing",
        "ROUND(amount_cents / 100.0, 2) — divide real, round once at the display edge",
        "No ROUND — the engine prints cents as dollars",
        "ROUND per row inside the SUM, before folding",
      ],
      answer: 1,
      why: "Money folds in integer cents end to end; the /100.0 promotion and the single ROUND happen at the edge where the statement renders. Rounding per row before a fold moves cents behind the reader's back — the fold no longer reconciles to the ledger.",
      notes: [
        { choice: 0, why: "ROUND of integer cents returns the same cents — no conversion happened at all." },
        { choice: 3, why: "Per-row rounding before SUM is the classic drift: fold-the-rounded never ties to the fold, and the delta audit catches it." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-26",
      prompt: "Two walks over the same 14-month revenue series: SUM(revenue) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) versus ... AND UNBOUNDED FOLLOWING. What does the second print?",
      choices: [
        "A running total that ends at each row",
        "The grand total on every row — a constant column",
        "NULL until the last row",
        "A syntax error — UNBOUNDED FOLLOWING requires RANGE",
      ],
      answer: 1,
      why: "The frame [UNBOUNDED PRECEDING, UNBOUNDED FOLLOWING] is the whole partition, so every row sums the entire series — the walk collapses to a constant. The running walk ends at CURRENT ROW; the bounds decide the shape before ROWS versus RANGE ever matters.",
      notes: [
        { choice: 0, why: "That is the first frame's job. The second's upper bound never moves, so nothing runs." },
        { choice: 2, why: "No NULLs — every row's frame is the full partition and the sum is well-defined everywhere." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-27",
      prompt: "WHERE total > AVG(total) fails at parse time. Which rewrite is correct — and which one is quietly wrong?",
      choices: [
        "Move it to HAVING: HAVING total > AVG(total) — safe because HAVING runs after the fold",
        "WHERE total > (SELECT AVG(total) FROM orders), or carry AVG(total) OVER () as a column and compare against it",
        "GROUP BY total first, then compare",
        "CAST the comparison to TEXT",
      ],
      answer: 1,
      why: "Aggregates do not exist until after the fold, so WHERE cannot see AVG — the fix computes the benchmark in its own layer: a scalar subquery, or a window AVG() OVER () that keeps every row and lets the comparison ride along.",
      notes: [
        { choice: 0, why: "The quietly wrong one: with no GROUP BY the table is one group and the bare total column takes an arbitrary row's value — the comparison means nothing and ships anyway." },
        { choice: 2, why: "Grouping by the measure compares every row only to itself — the benchmark vanishes." },
      ],
      difficulty: "hard",
    },
    {
      id: "amex-mcq-28",
      prompt: "The fee-waiver gate must exclude flagged members. One flagged id is NULL. Which gate still returns the right book?",
      choices: [
        "WHERE member_id NOT IN (SELECT id FROM flagged)",
        "WHERE NOT EXISTS (SELECT 1 FROM flagged f WHERE f.id = member_id)",
        "WHERE member_id <> ALL flagged ids",
        "WHERE member_id IN (SELECT id FROM flagged) with NOT in front",
      ],
      answer: 1,
      why: "NOT EXISTS asks per member 'does a flagged row match?' — a NULL flag id matches nothing and fails to exist, so it poisons nobody. NOT IN turns one NULL into an UNKNOWN for every row and ships an empty screen.",
      notes: [
        { choice: 0, why: "The exact trap: NULL in the subquery empties the whole result while the query looks healthy." },
        { choice: 2, why: "Same comparison, same poison — <> ALL against a set containing NULL is UNKNOWN for every row." },
        { choice: 3, why: "IN with a NULL is harmless (no match), but NOT IN front of it is the same poisoned test as choice 1." },
      ],
      difficulty: "easy",
    },
    {
      id: "amex-mcq-29",
      prompt: "The trend page must sort months and print 2024-01 through 2025-02 in calendar order. Which month key sorts correctly?",
      choices: [
        "CAST(SUBSTR(created_at, 6, 2) AS INTEGER) — the month number",
        "SUBSTR(created_at, 1, 7) — the '2024-01' year-month key",
        "strftime('%m', created_at) alone",
        "The day of month",
      ],
      answer: 1,
      why: "The year-first key sorts as a calendar: '2024-12' < '2025-01' lexically. A bare month number interleaves the years — 2025-01 lands between 2024-01 and 2024-02 — and '%m' alone merges Februaries across years into one bucket.",
      notes: [
        { choice: 0, why: "Month numbers alone interleave years: 1, 1, 2, 2, 3... — the trend folds into a twelve-row pretzel." },
        { choice: 2, why: "'%m' is padded ('02' sorts fine within a year) but the year is missing — same interleave, subtler failure." },
        { choice: 3, why: "A day-of-month key sorts 31 days against 14 months — pure noise." },
      ],
      difficulty: "medium",
    },
    {
      id: "amex-mcq-30",
      prompt: "The booked-value roll-up joins invoices to payments and SUMs invoice amounts — 28 billings over 27 rail rows, 5 billings split across both rails. What ships?",
      choices: [
        "The correct booked total",
        "An overstatement — each split billing's booked amount counts twice",
        "An understatement — the splits vanish",
        "A syntax error — aggregates cannot follow a join",
      ],
      answer: 1,
      why: "The join runs at rail grain: five split billings contribute two invoice rows each, so their booked amounts double in the SUM. The honest fix folds payments to billing grain first — a derived table or CTE — then joins the fold.",
      notes: [
        { choice: 0, why: "The census disagrees on its face: 27 rows over 22 billings — the SUM quietly priced five books twice." },
        { choice: 2, why: "INNER joins drop the 6 no-rail billings — but the splits are fully present, doubled. Understatement is a different bug wearing the same join." },
        { choice: 3, why: "Aggregates over joins are the bread and butter of the close — the failure here is grain, not grammar." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-amex-1",
      tier: "easy",
      topic: "s6",
      universe: "month-close",
      title: "The open-book delinquency watch",
      brief:
        "Amex-flavored memo on the storefront db: card operations works the {rose:delinquency watch} every morning — the open member-account billings classified by settlement coverage, so the retention desk calls the right accounts. Probed facts: the open book is 6 billings carrying 19609.00; exactly one of them (#25) caught a PARTIAL rail hit — 4000.00 against its 6148.00 booking — and the other five have no settlement row at all. Contrast: the wider no-cover book is 6 billings / 15217.00 once the paid-status break #28 (1756.00 booked, zero rails) is included. Coverage classes: 'no cover' when no rail ever hit, 'partial' when the rail amount sits under the booking, 'cleared' otherwise. Biggest booked value first.",
      ask: "Return the open billings: id, status, booked value in dollars (2 decimals) and the coverage class, biggest booked first.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS booked,\n       CASE WHEN {2} IS NULL THEN 'no cover'\n            WHEN p.amount_cents < i.amount_cents THEN 'partial'\n            ELSE 'cleared' END AS watch_class\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.{3}\nWHERE i.status = {4}\nORDER BY booked DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Billing money is stored as INTEGER cents, so the dollar read is amount_cents / 100.0. The .0 forces real division — integer 100 would truncate odd-cent billings toward zero and leak half-dollars onto the watchlist.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the rail-presence test",
          why: "CASE WHEN p.id IS NULL reads 'no settlement row exists' — the LEFT JOIN hands unmatched billings a NULL rail id, which is the definition of no cover. Testing i.id instead is never NULL, so every open billing misfiles as partial or cleared and the watch goes blind.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the billing-side join key",
          why: "p.invoice_id = i.id is the reconciliation join: each rail hit attaches to its booked billing, unmatched billings keep NULL rail columns. Joining on the TEXT number column matches nothing and the watch ships empty.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the open-book filter",
          why: "The retention desk works the open book — 6 billings, 19609.00. 'paid' returns the settled book and hides the watch entirely; the census the memo quotes (open 6 / 19609.00) is the population this filter must reproduce.",
        },
      ],
      distractors: ["i.id", "INNER", "'paid'", "10.0"],
      walkthrough:
        "The watch is a LEFT join plus a CASE, and the order of operations is the whole story. The LEFT JOIN attaches each of the 27 settlement rows to its booked billing and leaves the 6 no-rail billings with NULL settlement columns; WHERE status = 'open' keeps the 6 open books (19609.00 total), and the CASE classifies per row: #25 shows 'partial' — its single rail carries 4000.00 against the 6148.00 booking — while the other five show 'no cover' because p.id IS NULL, the LEFT-join miss test. The cents rule holds in the display column: integer cents in, /100.0 with the .0, ROUND once. ORDER BY booked DESC queues the desk biggest-first — the partial sits on top at 6148.00, which is exactly why it is worked first: a partial cover is a conversation, a no-cover is a call. Note what is NOT here: #28 — booked 1756.00, paid status, zero rails — a status-versus-settlement break that the OPEN filter deliberately excludes and the break queue owns instead. Swap LEFT for INNER and five of the six rows vanish; the watch that ships is a watch with nothing on it.",
    },
    {
      id: "cs-amex-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The member spend ladder",
      brief:
        "Amex-flavored memo on the storefront db: the membership team ranks cardmembers by booked spend every quarter, and the {violet:Platinum watchlist} is the top of that ladder. Probed facts: the book is 16 members generating 103 spend events worth 34833.28; the top of the ladder reads Alice Chen (EU) 24 events / 7262.35, Emma Wilson (US) 17 / 6640.56, Grace Kim (APAC) 14 / 4574.23, Maya Patel (APAC) 13 / 3644.56. The watchlist definition is activity-based: members with 13 or more booked events. Concentration context: members above the 3000.00 lifetime line already carry 63.5% of book value. Rank windows, RANK semantics, ties shared — biggest spend first.",
      ask: "Return the Platinum watchlist: member, region, event count, booked spend (2 decimals) and spend rank, ranked order.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(o.id) AS events,\n       ROUND(SUM(o.total), {1}) AS spend,\n       RANK() OVER (ORDER BY SUM(o.total) {2}) AS member_rank\nFROM customers c\nJOIN orders o ON o.customer_id = c.{3}\nGROUP BY c.id\nHAVING COUNT(o.id) >= {4}\nORDER BY member_rank;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money display precision",
          why: "Booked spend is a dollars table read at 2 decimals — the statement contract. ROUND at the very end, once; precision is display, never storage.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The ladder ranks biggest spend first: 7262.35 takes rank 1. ASC would hand the top rung to Maya Patel's 3644.56 — a correct query pointed at the wrong end of the ladder.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the member-side join key",
          why: "o.customer_id = c.id attaches each spend event to its member. Joining on the TEXT region column matches nothing — INTEGER against TEXT — and the ladder ships empty.",
        },
        {
          answer: "13",
          kind: "number",
          label: "the Platinum activity floor",
          why: "The watchlist is 13-or-more booked events — and 13 is verifiably on the ladder: Maya Patel's event count sits in the result. 14 would drop her; 5 would drag the whole book in and dilute the watchlist.",
        },
      ],
      distractors: ["0", "1", "ASC", "region"],
      walkthrough:
        "A rank ladder is a fold plus a window, and each clause owns one decision. The fold: the join attaches all 103 spend events to their members, GROUP BY c.id collapses to 16 members, COUNT counts events and SUM(o.total) prices the spend — 7262.35 for Alice Chen on 24 events, down to 3644.56 for Maya Patel on 13. HAVING COUNT(o.id) >= 13 is the watchlist definition, and it keeps exactly four members — 24, 17, 14, 13 events — with the boundary member IN: that is why the floor is 13 and not 14, a decision the reviewer can verify against Maya's row. The window: RANK() OVER (ORDER BY SUM(o.total) DESC) numbers the folded groups biggest-first — the window's ORDER BY is the ranking axis, not the display order, and the outer ORDER BY member_rank prints the ladder top-down. The cents discipline shows up as its mirror image here: spend lives on the orders table in REAL dollars already, so the honest read is ROUND(SUM(o.total), 2) with no /100 anywhere — knowing WHICH table carries cents is half the units question. Swap DESC for ASC and rank 1 goes to the smallest watchlist spend; swap the join key to region and the ladder ships empty.",
    },
    {
      id: "cs-amex-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The regional book review",
      brief:
        "Amex-flavored memo on the storefront db (customers = cardmembers, orders = booked spend events): the membership committee's quarterly {violet:regional book review} ranks markets by booked value with the member bench counted beside the money. Probed facts: EU books 45 events worth 15089.23 from 8 members, APAC 37 worth 11605.45 from 5, US 19 worth 7286.16 from 2, LATAM 2 worth 852.44 from 1. Average ticket cuts the other way — the US runs the richest book at 383.48 a ticket against EU's 335.32 and APAC's 313.66. The committee's coverage line: a market qualifies once it carries at least 2 active members — LATAM's single-member book is flagged for coverage, not ranked. Biggest booked value first.",
      ask: "Return the qualifying regions: region, event count, member count, booked value (2 decimals) and average ticket, biggest booked value first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS events,\n       COUNT(DISTINCT o.{1}) AS members,\n       ROUND(SUM(o.total), 2) AS booked_value,\n       ROUND(AVG(o.total), 2) AS avg_ticket\nFROM orders o\nJOIN customers c ON o.customer_id = c.{2}\nGROUP BY c.region\nHAVING COUNT(DISTINCT o.customer_id) >= {3}\nORDER BY booked_value {4};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the member census column",
          why: "COUNT(DISTINCT o.customer_id) counts members, not events — 8 members behind the EU's 45 events. DISTINCT o.total would fill the column with distinct-ticket counts (45, 37, 19) and the gate would lean on a column that lies about coverage.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the member-side join key",
          why: "o.customer_id = c.id attaches each spend event to its member. c.region is TEXT against an INTEGER key — the join matches nothing and the review ships empty.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the coverage gate",
          why: "Two or more active members is the committee's coverage line, and the '2' is verifiably in the result — the US row's members cell. A gate of 3 demotes the US market, a two-member book the committee explicitly ranks; a gate of 1 drags LATAM in and the coverage flag disappears.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review ranks by booked value: the EU's 15089.23 first. ASC hands the top row to the US's 7286.16 — a correct query pointed at the wrong end of the table.",
        },
      ],
      distractors: ["total", "region", "3", "ASC"],
      walkthrough:
        "A market fold with a coverage gate, and every clause owns one decision. The join attaches each of the 103 events to its member; GROUP BY c.region folds to four markets; COUNT(DISTINCT o.customer_id) counts MEMBERS, not events — the column the gate leans on. HAVING >= 2 is the coverage line: EU (45 events, 8 members, 15089.23, 335.32 average ticket), APAC (37, 5, 11605.45, 313.66) and US (19, 2, 7286.16, 383.48 — the richest ticket in the book) qualify; LATAM (2 events, 1 member, 852.44, 426.22) drops and becomes a coverage flag, not a rank. The distractors fail in character: DISTINCT o.total counts distinct ticket values instead of members, so the census column fills with 45/37/19 and the gate's evidence disappears; the region join key matches INTEGER against TEXT and the fold ships empty; a gate of 3 demotes the US — a two-member market the committee explicitly wants ranked; and ASC hands the top of the review to the smallest book. The denominator note travels with the query: events and members are different populations, and this fold prints both.",
    },
    {
      id: "cs-amex-4",
      tier: "hard",
      topic: "q2",
      universe: "fraud",
      title: "The above-benchmark ticket file",
      brief:
        "Amex-flavored memo on the storefront db (orders = booked spend events, customers = cardmembers): the {rose:outlier file} for the fraud spot-check is events above the book-wide benchmark — the 338.19 average ticket across the 103 booked events (floor 25.47, ceiling 1088.44) — attributed to members. The review desk's gate is definitional: a member enters the file once they carry 4 or more above-benchmark events, so the occasional big ticket (a single 1088.44 on an otherwise quiet account) is context, not a file entry. The benchmark is a population decision and it is quoted in the query: above the BOOK average, not above the member's own line — the own-line read structurally excludes single-event members. Biggest file value first.",
      ask: "Return the file: member, region, above-benchmark event count, above-benchmark value (2 decimals), biggest value first.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(*) AS big_events,\n       ROUND(SUM(o.total), 2) AS big_value\nFROM orders o\nJOIN customers c ON c.id = o.{1}\nWHERE o.total > (SELECT {2}(total) FROM orders)\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY big_value {4};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the member attribution key",
          why: "c.id = o.customer_id attaches each above-benchmark event to its member. o.name does not exist on orders — the join errors instead of attributing, and the file ships as an error page.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the benchmark fold",
          why: "AVG(total) over all 103 events is the book-wide benchmark — 338.19. MIN prices the file against the 25.47 floor and nine members clear the gate; MAX prices against the 1088.44 ceiling and nothing clears it, because > against the maximum is strictly false.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the file's event gate",
          why: "Four or more above-benchmark events is the review's line, and the '4' is verifiably in the result — the boundary member's big_events cell. A gate of 3 dilutes the file to six members; 5 trims it to three and the boundary member vanishes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "The file reads biggest value first. ASC surfaces the smallest file value at the top and the queue inverts — the desk works the wrong end first.",
        },
      ],
      distractors: ["name", "MIN", "SUM", "3"],
      walkthrough:
        "The benchmark is a scalar subquery and the gate is a definition. WHERE total > (SELECT AVG(total) FROM orders) prices every event against the book-wide 338.19 — 42 of the 103 events clear it — and the fold attributes them per member: Emma Wilson 9 above-benchmark events worth 5469.85, Alice Chen 6 for 4069.51, Grace Kim 6 for 3023.57, Chloe Dubois 4 for 2546.81 — the >= 4 gate keeps exactly the four, and the '4' is verifiably in the result as Chloe's count. Change the benchmark fold and the file changes species: MIN prices against the 25.47 floor and nine members clear the gate; MAX prices against the 1088.44 ceiling and nothing clears it — one event ties the maximum and > is strict. The wrong attribution key errors before it joins; a gate of 3 dilutes the file to six members; ASC inverts the queue. The fraud-desk note travels with the file: 'above benchmark' is a population decision — book-wide here, per-member own-average in the correlated shape that structurally excludes single-event members.",
    },
    {
      id: "cs-amex-5",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The month-over-month walk",
      brief:
        "Amex-flavored memo on the storefront db (orders = booked spend events): the month-close trend page walks booked value month over month, and the pack quotes the four-bucket tail. Probed facts: 2024-11 carried 6 events worth 1648.8, 2024-12 seven worth 2101.47, 2025-01 six worth 1669.5, 2025-02 seven worth 2390.53 — inside a 2024-01 to 2025-02 window that never leaves the 6-to-9 pace. The delta definition is quoted in the query: current month minus prior month, via a {violet:LAG walk} over 'YYYY-MM' buckets; the first bucket the window can see prints a NULL delta by construction, and the pack quotes NULL — *never zero-filled silently.* Round once, at the display edge.",
      ask: "Return the tail walk: month, booked value (2 decimals), month-over-month delta (2 decimals), calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, {1}) AS month_key,\n         SUM(total) AS revenue\n  FROM orders\n  GROUP BY month_key\n)\nSELECT month_key,\n       ROUND(revenue, {2}) AS revenue,\n       ROUND(revenue - {3}(revenue) OVER (ORDER BY month_key), 2) AS mom_delta\nFROM monthly\nWHERE month_key >= {4}\nORDER BY month_key;",
      slots: [
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-key width",
          why: "SUBSTR(created_at, 1, 7) cuts '2024-11' — the year-first key that sorts as a calendar. Width 10 keeps the day and the fold runs at day grain; width 0 or 1 collapses every row into one bucket. The constant never appears in the result; it shapes it.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money display precision",
          why: "The pack's revenue cells are 2 decimals — 2101.47, not 2101.5. ROUND to 0 or 1 republishes different cells than every other figure in the close; precision is display, decided once.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the walk's direction",
          why: "LAG(revenue) pairs each month with its predecessor — 2025-01 walks beside 2024-12's 2101.47 and its delta reads negative. LEAD flips every interior sign and parks the NULL on the final month; SUM turns the delta column into a running walk wearing a minus.",
        },
        {
          answer: "'2024-11'",
          kind: "keyword",
          label: "the tail-window threshold",
          why: "The memo quotes the four-bucket tail — 2024-11 through 2025-02. A threshold of 0 or 1 admits all fourteen buckets: the full walk, a different deliverable than the tail the trend page asked for.",
        },
      ],
      distractors: ["0", "1", "LEAD", "SUM"],
      walkthrough:
        "The walk stages in a CTE: fold 103 events into fourteen 'YYYY-MM' buckets — SUBSTR(created_at, 1, 7), the year-first key that sorts as a calendar — then walk the fold with LAG(revenue) OVER (ORDER BY month_key) and price the delta as current minus prior, ROUND once. The tail the memo quotes: 2024-11 at 1648.8 with a NULL delta — the first bucket the window can see has no predecessor, and NULL is the honest print — then 2024-12 at 2101.47 (+452.67), 2025-01 at 1669.5 (-431.97), 2025-02 at 2390.53 (+721.03). The distractors fail in character: a SUBSTR width of 0 or 1 destroys the key and the WHERE filters the walk to nothing; ROUND to 0 or 1 republishes cells no other figure in the pack matches; LEAD flips every interior sign and parks the NULL on the final month; SUM in the window slot turns the delta column into a running walk wearing a minus; and a threshold of 0 or 1 admits all fourteen buckets — the full walk, not the tail. Month key, window direction, precision, threshold: four definitions, one query.",
    },
    {
      id: "cs-amex-6",
      tier: "easy",
      topic: "s4",
      universe: "refund-audit",
      title: "The two-census diff",
      brief:
        "Amex-flavored memo on the storefront db (payments = rail hits, invoices = member-account billings): the close routes an {rose:anomaly queue} built by standing two censuses against each other. Census one: the billings that carry at least one rail hit — 27 settlement rows folding onto 22 billings, five of them split across both rails. Census two: the billings the status column calls paid — 21. The diff is EXCEPT: census one minus census two leaves billing 11, the void that settled 925.00, and billing 25, the open book's partial at 4000.00 of 6148.00. Billing 28 — paid, 1756.00, zero rail hits — is deliberately absent: it lives in the mirror diff (paid EXCEPT has-rail), the other half of the queue. Smallest id first.",
      ask: "Return the anomaly queue: billing ids that carry a rail hit but are not marked paid, smallest id first.",
      template:
        "SELECT {1}\nFROM payments\n{2}\nSELECT {3}\nFROM invoices i\nWHERE i.status = {4}\nORDER BY invoice_id;",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the rail-census column",
          why: "Arm one projects payments.invoice_id — the billing each rail hit cleared — so the diff runs at billing grain. amount_cents here projects settlement amounts instead of billing ids, and the EXCEPT compares dollars against ids: numeric noise, no misfits.",
        },
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the diff operator",
          why: "EXCEPT returns rows of the first census absent from the second — 22 ids with rail hits minus 21 paid ids leaves exactly billing 11 and 25. UNION buries the misfits in a 23-row stack, UNION ALL doubles the splits into 48 rows, INTERSECT ships the opposite book: hits that ARE paid.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the status-census column",
          why: "Arm two projects invoices.id so both arms compare INTEGER billing ids. invoice_id does not exist on invoices; amount_cents compares ids against cent amounts and the diff loses all meaning.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the status census",
          why: "The second census is 'billings the status column calls paid' — 21 rows. A numeric threshold compares TEXT status against INTEGER amounts, the census empties, and the diff degrades to the whole rail book.",
        },
      ],
      distractors: ["UNION", "UNION ALL", "INTERSECT", "amount_cents"],
      walkthrough:
        "Two censuses, one diff. Arm one — SELECT invoice_id FROM payments — is the 22 billings that carry at least one rail hit (27 rail rows folded by the EXCEPT's distinct-row semantics). Arm two — SELECT id FROM invoices WHERE status = 'paid' — is the 21 billings the status column calls paid. EXCEPT keeps rows of the first census absent from the second: billing 11, the void that settled 925.00, and billing 25, the open book's partial at 4000.00 of 6148.00 — exactly the misfits the close routes by hand. The distractors fail in character: UNION unions the censuses into 23 rows and buries the misfits in the stack; UNION ALL stacks unconditionally — 48 rows, the split billings doubled; INTERSECT returns the opposite book, 20 rows of hits that ARE paid; amount_cents in either projection compares ids against cent amounts and the diff degrades into numeric noise; and a status census aimed at a nonexistent column errors before it runs. Billing 28 — paid, 1756.00, zero rail hits — is deliberately absent: it belongs to the mirror diff (paid EXCEPT has-rail), the other half of the anomaly queue.",
    },
  ],

  problems: [
    { slug: "products-worth-over-invoices", why: "Booked value versus settled value folded per billing — the coverage read the delinquency watch is built from, in graded form." },
    { slug: "delinquency-buckets", why: "DPD-style CASE buckets over the receivable — the aging ladder with a boundary someone will argue about, exactly the watch this kit rebuilds." },
    { slug: "monthly-transactions-ii", why: "Two-population month packets via UNION — card versus wire settlements by month, the stitched rail report the ops review ships." },
    { slug: "trial-balance-check", why: "The one-query proof that debits equal credits — 181080.00 = 181080.00 here — the control under every spend number this firm publishes." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the double-entry read: money in, money out, net per book, cents read honestly." },
    { slug: "number-of-rich-customers", why: "Counting members above a balance threshold — the Platinum-watchlist definition in miniature, population stated before the count." },
    { slug: "top-earners", why: "Top-spend folds with the tie question attached — the member ladder's warm-up, where DISTINCT and LIMIT semantics get tested." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every spend share here." },
    { slug: "customers-who-never-order", why: "The anti-join watchlist in textbook form — billings with no rail hit are this query with the table names swapped." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every member ladder, said out loud with the 1, 1, 2 pattern." },
    { slug: "calculate-special-bonus", why: "A CASE display arm driven by NULL/zero conditions — the same boundary discipline the coverage ladder demands, on an easier table." },
    { slug: "settlement-fails-aging", why: "Aging buckets over unsettled items — the receivables watchlist read against its 30-day terms line, oldest tail first." },
    { slug: "card-launch-success", why: "Approval-rate share with a resampled denominator — the ratio screen where the population decision IS the answer." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend tiers folded per customer — the fee-band CASE work the membership team ships, with the boundary documented." },
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection over settlement rows — the duplicate-rail screen that keeps one rail hit from posting twice to a member account." },
    { slug: "account-balance", why: "Running totals per account — the balance walk: every event beside the position it leaves behind, frame discipline included." },
    { slug: "gl-reconciliation", why: "Ledger against sub-ledger, line by line — the reconciliation fold the close publishes: cash, receivables and revenue must agree with the books they summarize, or the delta column owns the meeting." },
    { slug: "balance-rollforward", why: "Opening balance, movements, closing balance — the roll-forward walk the controller signs. Every close here is this query wearing an in-world costume: begin, move, end, prove." },
    { slug: "ar-aging-schedule", why: "Receivables bucketed by age against the terms line — the aging schedule behind the delinquency watch, where flat 30-day terms make the first bucket the whole story." },
    { slug: "journal-gap-detection", why: "Posting sequences with holes — the gap scan over the ledger's entries: a missing posting is a break the trial balance can still hide, and this query is how it stops hiding." },
    { slug: "movie-rating", why: "Two different aggregates stacked into one review sheet — the UNION shape behind the rail census: card and wire read side by side without a join in sight." },
    { slug: "league-statistics", why: "Symmetric folds over two roles — home and away become card and wire: each side counts its own rows and the stack must cross-foot to the rail total." },
    { slug: "apples-and-oranges", why: "Two orientations of the same entity folded without doubling — the split-settlement pair discipline: one card hit, one wire hit, one row." },
    { slug: "circular-transfers", why: "Mutual pairs detected both ways — the duplicate-relationship screen: the same canonicalization discipline that keeps split pairs from counting twice." },
    { slug: "average-time-of-process-per-machine", why: "Duration per entity from timestamp pairs — the days-to-settle read (28.4 average, 13 fastest, 84 slowest) in drill form: start stamp, end stamp, honest NULL policy." },
    { slug: "year-on-year-growth-rate", why: "LAG against the prior-period bucket — the growth walk the trend page ships, where '%m'-only keys merge Februaries across years and the delta lies." },
    { slug: "mrr-waterfall", why: "Movement waterfalls — new, churned, net — the roll-forward of a balance into its causes: every movement review here is this decomposition with money instead of MRR." },
    { slug: "growth-accounting", why: "Status transitions walked with LAG — the state-machine read: which billings moved between statuses and which rail carried them, one fold per transition." },
    { slug: "transaction-velocity", why: "Events per time bucket — the pace read under every 'spike' claim: 6 to 9 events a month is the metronome, and this query is how deviations get proven." },
    { slug: "snaps-analysis", why: "Conditional COUNT DISTINCT in one pass — the census discipline behind exact/partial/no-cover columns that must cross-foot to the booked population." },
    { slug: "amount-anomaly-zscore", why: "Z-scores over event amounts — the outlier file beside the 338.19 benchmark: distance-from-mean is the fraud desk's first sort, computed in one window pass." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest over a natural key — the late-arriving-settlement dedupe: one row per event wins, and the tiebreak is declared, not implied." },
  ],
};
