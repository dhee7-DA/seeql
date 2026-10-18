// Goodreads — Wave-11 (Task 102), media domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Reading-community SQL: the storefront db read as the Goodreads shelf graph — customers are readers
// (region = market), orders are reading periods/engagement cycles (delivered = challenge month finished 52,
// shipped = reading window in flight with shipped_at as the window-open stamp 30, pending = to-read backlog
// 14, cancelled = abandoned shelf 7), order_items are shelf events (quantity = books shelved on the line,
// unit_price = the edition's transacted line price), products = titles/editions (16 catalog SKUs = the shelf
// catalog; category codes = genre families), suppliers = publishers (the supplier-share table IS the publisher
// bench: top publisher 32% / 11,130.25), invoices/payments = affiliate & subscription statements on card
// (16 / 37,364.00) vs wire (11 / 32,248.00) rails, expenses = platform opex, ledger_entries = GL. Finance
// tables store INTEGER cents — the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price
// are REAL dollars. Angle kept DISTINCT from the media siblings (audible's paid-audio credit-bank catalog,
// medium's metered-paywall read-time economy): READING DEPTH — shelves-as-funnels, reading-challenge progress
// (the month spine), review depth, and publisher concentration. Probe-derived cells used below (readonly
// db/custom.db via bun:sqlite, 2026-10-17, no db copy, nothing written): the line-level fold
// SUM(oi.unit_price * oi.quantity) foots to 34,833.28 over 251 lines / 498 books, max line quantity 3
// (canonical wave-8+9 cells); the per-month books-shelved ladder 50/51/40/34/45/27/22/40/44/33/25/30/24/33;
// the fanned join read SUM(o.total) = 103,244.55 (mcq-10's overcount). The case-2 publisher fold reproduces
// the facts-file supplier revenue/share cells verbatim.
// Pool provenance: company-pools.md carries NO Goodreads section — 0 tagged rows — so all 46 slugs (30 topic
// + 16 problem) are theme-curated from the theme menu's sql rows; zero w*/d*/f*-band rows (writes/schema/
// finance sections untouched) and zero w/d/f-initial slugs — the single Goodreads-tagged theme-menu row
// (find-books-with-polarized-opinions, f-initial) is excluded under the wave-11 initial-ban convention.
// Case briefs quote probed figures from scripts/company-facts.md (incl. the wave-8+9 canonical-cells
// section); every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: goodreads is NOT yet in registry COMPANY_META — wire id "goodreads",
// domainId "media", name "Goodreads", tagline "Reading depth by SQL: shelf funnels, challenge ladders, publisher benches",
// accent "text-stone-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const goodreadsKit: CompanyKit = {
  id: "goodreads",
  domainId: "media",
  name: "Goodreads",
  tagline: "Reading depth by SQL: shelf funnels, challenge ladders, publisher benches",
  accent: "text-stone-300",

  brief: [
    "**Goodreads** is the reading community — the shelf graph where readers track want-to-read, currently-reading and finished, star-rate and review editions, and run the annual Reading Challenge that turns a private habit into a public number. Amazon-owned and monetized through ads and affiliate book traffic, the product's whole surface is metadata: editions, genres, shelves. This kit maps the storefront db onto that world: the 16 customers rows are readers, the 103 orders are **reading periods** worth 34,833.28, and the 251 order_items rows are shelf events — quantity = books shelved on the line, unit_price = the edition's transacted price. The status map is fixed: delivered = {emerald:challenge month finished} (52, 50.5%), shipped = {sky:reading window in flight} (30, 29.1%), pending = to-read backlog (14, 13.6%), cancelled = {rose:abandoned shelf} (7, 6.8%).",
    "The data org splits into catalog, community and a small monetization pod, and they read the same period spine at different grains. The reading-depth heartbeat is the shelf fold: 251 shelf events carry **498 books** — 2.44 events per period, max 3 books on a line — while the challenge clock runs on the stamp: a period opens at created_at and shipped_at marks the day the reading window actually opens, **82 of 103 periods** stamped, averaging **2.98 days** with a 2–4 spread; the 14 backlog periods have none yet (a population definition, not a cleanup job). Catalog owns the shelf itself: 16 editions across 6 publishers, where the top publisher carries **32%** of shelf spend (11,130.25) and the shelf-band fold splits 268 mass-market books at 31.01 from 230 premium books at 115.85. Money sits one layer down: statements and legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator with a challenge accent. A typical loop opens with a **two-grain reader census** — EU runs 45 periods from just 8 readers (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a to-read period count in your challenge base?'*), then into the reading ladder where four readers sit tied at 4 periods and rank semantics become a policy call. Late rounds walk the {sky:14-month reading spine} (2024-01 to 2025-02) — the **1,193.86** July trough carrying only 22 books shelved — with `LAG` deltas, or re-cut the publisher bench and probe the edition-band CASE for a silently swallowed arm. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Goodreads section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: shelf-status funnels, two-grain reader censuses, rating histograms, tie-heavy challenge ladders, edition-band CASE logic, the month spine and the cents-safe statement book. Do the topics in order, then run the six case studies on the live storefront db — from the {violet:reading-year spine} the challenge board opens Monday with to the {orange:publisher bench} the catalog pod defends before every title buy, plus the stage pivot, the band stack, the most-shelved ladder and the cadence gate between them. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction and every shelf fold foot to the 498-book, 34,833.28 shelf.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Goodreads' catalog and community pods rehearse most: the reading-year spine, the publisher bench fold, the shelf-status pivot, the band stack with a grand-total row, the most-shelved ladder with shared rungs, and the above-cadence gate. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: each one narrates the failure a wrong chip causes, which is exactly the muscle the 'how do you know?' follow-up tests.",
  ],

  dayInLife: [
    "**08:10 —** The day starts with the challenge-clock refresh. A community-analytics analyst opens the reading dashboard before standup: did overnight shelf events land, did any reading window open without a reader attached, does the one-pass status census reconcile — 52 finished + 30 in flight + 14 to-read + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the depth read: shelf events per period against the **2.44 norm**, books on the line capped at 3 — and if window-open latency drifts off the 2.98-day average, the backlog queue gets pulled before the challenge-progress email ships.",
    "**11:30 —** Midday is the catalog read. The publisher-bench card gets re-cut for the monthly title review — the top publisher still carries **32%** of shelf spend (11,130.25) — while the edition-band re-cut splits 268 mass-market books at 31.01 against 230 premium books at 115.85, and the most-shelved ladder (47 / 46 / 38, with a 36-pair and two three-way ties below) gets its shared-rungs policy restated before anyone ships a chart. A regional lead wants periods per reader beside reader counts ({sky:EU 45-from-8} versus {rose:US 19-from-2}). Each ask is a join, a conditional aggregate and one judgment call about editions. The analyst writes the query twice — *once to answer, once with the edition rule spelled out so the number survives the catalog-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The affiliate-statement anti-join refreshes first — **6 never-settled statements worth 15,217** — before a single dunning email goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the finance draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Books shelved", what: "Total books across shelf events: 498 over 251 order_items lines, max 3 on a single line. The reading-depth headline — depth shows up as books on lines, not more periods, and the 498 must reconcile whenever the shelf is re-cut." },
    { name: "Shelf-event depth", what: "Shelf events per reading period: 251 lines across 103 periods = 2.44, against a 25.47 to 1,088.44 period-value spread. The fan-out guard lives here: COUNT(DISTINCT o.id) counts periods, COUNT(*) counts lines — one join apart, two different metrics." },
    { name: "Challenge completion", what: "Delivered share of booked periods: 52 of 103 (50.5%) — the challenge month actually finished. 'Shipped' (30) is a window in flight, not a finish; the denominator question ('do the 14 to-read count?') is the whole interview." },
    { name: "Window-open latency", what: "Period booking to reading-window open (created_at → shipped_at) over stamped periods only: 82 of 103, 2.98-day average, range 2–4. The population definition ships with the number — the 14 to-read periods have no window yet." },
    { name: "Reader concentration", what: "Share of shelf spend from readers whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The period ladder runs 24 / 17 / 14 / 13 / 5 with a four-way tie at 4 — one lost power reader moves a quarter." },
    { name: "Publisher concentration", what: "The top publisher carries 32% of shelf spend (11,130.25 of 34,833.28), the runner-up 26.7% (9,294.93); the trusted bench (rating >= 4.5) holds two of six. Why the catalog pod caps per-publisher exposure before every buy season." },
    { name: "Abandoned shelves", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The DNF cohort map that drives the re-engagement and recommendation calendars." },
    { name: "Affiliate coverage", what: "Billed versus settled: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00 — on card 16 / 37,364.00 versus wire 11 / 32,248.00 rails, footed against a ledger that must read 181,080 = 181,080." },
  ],

  topics: [
    {
      name: "Shelf-status funnels",
      why: "Every Goodreads growth screen opens with the shelf funnel: periods booked, reading windows opened, challenge months finished. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a window-in-flight period 'finished' — 30 versus 52 on this db — and the second trap is the to-read backlog: 14 periods that stay in a conversion base and drop out of a latency base.",
      slugs: ["trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Two-grain reader censuses",
      why: "Periods and readers are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 readers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is reading load and which is installed base — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity signal that decides whether the community is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "the-number-of-employees-which-report-to-each-employee", "number-of-rich-customers"],
    },
    {
      name: "Review depth & rating NULLs",
      why: "Goodreads is ratings: the average-rating histogram is the community's first chart, and its gaps are NULLs. COUNT(column) versus COUNT(*) decides whether unrated editions vanish silently, and COALESCE turns a missing review-confirmation into an explicit rate instead of a hole. The panel wants the NULL policy stated before the histogram ships — a confident zero you did not verify is how metadata audits die in review.",
      slugs: ["ratings-histogram", "books-with-null-ratings", "confirmation-rate"],
    },
    {
      name: "Challenge leaderboards & ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four readers sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer readers, not syntax. The most-shelved titles ladder carries the same problem at edition grain — a 36-pair and two three-way ties — so the policy gets defended twice per screen.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "Edition bands with CASE",
      why: "Edition tiers are CASE-classified — the shelf-band fold splits 251 lines into 268 sub-55 mass-market books (31.01 average) and 230 premium books (115.85), and genre families band the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the edition forecast, and a reordered WHEN quietly re-bands the base. Interviewers probe the arm that swallows rows by moving the boundary one cent.",
      slugs: ["triangle-judgement", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Challenge spines & LAG deltas",
      why: "The 14-month reading spine (2024-01 to 2025-02) is the challenge call's home turf: prior month beside current, delta rounded, the 1,193.86 July trough (just 22 books shelved) named against the recovery. STRFTIME('%Y-%m') builds the spine — '%m' alone merges the two Januaries — and LAG drives the walk; the first row is NULL by definition, the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Shelf set algebra",
      why: "Board packets stack populations — finished readers above abandoned shelves, this quarter beside last — and EXCEPT answers 'which booked periods never opened a window'. UNION dedups whole rows silently, which makes it a correctness question, not a style one: two stacked branches that emit identical reader rows collapse and the board loses a reader with no error anywhere.",
      slugs: ["movie-rating", "team-scores-in-football-tournament", "the-airport-with-the-most-flights"],
    },
    {
      name: "The unshelved & unpopular (anti-joins)",
      why: "Catalog work is anti-join work: editions with no shelf events, sellers with no sales, readers with no recent periods — the dormant lists that drive re-engagement. The trap is the confident zero: on this db every edition and every reader appears somewhere (never-ordered = 0 on both), so the honest answer proves the zero before reporting it. LEFT JOIN with IS NULL is the shape; a WHERE filter on the right table after the LEFT quietly turns it INNER and kills the list.",
      slugs: ["unpopular-books", "sellers-with-no-sales", "customers-who-never-order"],
    },
    {
      name: "Nested reader gates",
      why: "Screens escalate into staging: fold per-reader period counts, then judge them against a computed platform mean (6.44 here — exactly four readers clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Goodreads' own challenge targeting is exactly this: which readers run above the community's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "Publisher benches & cents discipline",
      why: "Shelved is not collected — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the reading world meets affiliate money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) publisher-side settlements.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "goodreads-t1",
      q: "Your reader report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A shelf-spend report joins periods to readers: a period with no reader row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from readers: the readers with no periods ARE the answer (a signed-up reader with an empty shelf), arriving with NULL period columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload reader row — the LEFT quietly became an INNER and the empty-shelf list vanished. The fix is moving the predicate into ON or an outer query. The same discipline guards the money side: statements LEFT JOINed to settlement legs keep the six never-settled rows alive, and any leg filter in WHERE would erase exactly the rows the dunning list exists to show. On this db the reader anti-join returns a confident zero — all 16 readers appear in the period table somewhere — and proving that zero is itself the analyst's job, because an unverified zero is how empty-shelf reports die in review.",
      tag: "joins",
    },
    {
      id: "goodreads-t2",
      q: "The reading ladder runs 24, 17, 14, 13, 5 periods, then FOUR readers tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which tied reader gets the challenge-push email first. The same policy call repeats at edition grain on the most-shelved ladder — the 36-pair and the two three-way ties — so a catalog chart that splits ties arbitrarily is ranking editions by accident. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer readers, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment. Goodreads publishes leaderboards to the community, so an arbitrary split is not a style flaw; it is a public ranking decided by scan order.",
      tag: "windows",
    },
    {
      id: "goodreads-t3",
      q: "The census shows 103 periods, 16 readers, 251 shelf events and 498 books. Why four numbers, and what does each grain mean to the business?",
      a: "Because every COUNT is a grain choice, and Goodreads manages the community at all four. COUNT(*) over orders counts reading periods — 103 billing-and-engagement cycles. COUNT(DISTINCT customer_id) folds them back to readers — 16 accounts; the per-region pairing (EU 45-from-8 versus US 19-from-2, intensity 5.6 versus 9.5) is the growth-breadth read. Join order_items and the grains multiply: COUNT(*) now counts shelf events — 251 — and SUM(quantity) counts books — 498, the reading-depth number, max 3 on a line. The trap that catches candidates is quoting a number without its grain: join order_items and SUM(o.total) fans every period's total out once per shelf event — the 34,833.28 book prints 103,244.55, a 2.96-fold lie that executes cleanly. The honest fold at line grain is SUM(oi.unit_price * oi.quantity), which foots back to 34,833.28. Saying 'one row per what?' for every aggregate — and proving the fold foots — is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "goodreads-t4",
      q: "shipped_at is NULL until a reader's reading window opens. What is your policy for the window-open report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a window, so the report measures open-to-window for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 to-read plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day window opens for readers whose shelves are still backlog, and it poisons the 2.98 baseline every latency alert keys off. The to-read cohort is not dirty data; it is the population the challenge-push calendar exists to convert, so the report excludes it by definition and names the exclusion. A report whose WHERE clause is doing definitional work without saying so is exactly what a Goodreads reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "goodreads-t5",
      q: "The challenge board wants shelf spend per reader for readers carrying at least thirteen periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, backlog and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The thirteen-period floor is a group-level fact — HAVING COUNT(*) >= 13 after GROUP BY customer_id; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a challenge ladder and an error, and between a threshold applied to periods versus to dollars. On this db the thirteen gate leaves exactly four readers — 24, 17, 14 and 13 periods, worth 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56. One more placement rule the screens love: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) puts the 100.0 BEFORE the division, because integer division truncates the abandoned share toward zero — on this db the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one period, or about a reader?",
      tag: "pipeline",
    },
    {
      id: "goodreads-t6",
      q: "The publisher bench computes shelf share as 100.0 * SUM(unit_price * quantity) / (SELECT SUM(unit_price * quantity) FROM order_items). What is that subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the division — here the whole-shelf fold, 34,833.28, the denominator that turns publisher spend into the probed shares (32 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6). Zero rows return NULL — not an error — and spend / NULL is NULL, so every share silently drops out of the report while the query looks valid. On the full table that is theoretical: 251 lines always produce a fold. On filtered staging — one genre, one month, one status arm — the empty-inner bug ships regularly, and the share column is where it hides. The correlated cousin (share of the reader's own shelf, re-folding per outer row) answers a different question at a different cost and inherits the same empty-case behavior. And the NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole bench empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "goodreads-t7",
      q: "The challenge trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the challenge trend becomes a 12-row fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's shelf events, and month-end is exactly when reading windows stamp. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the numbers tell is concrete: the shelf opens at 3,731.97 / 50 books, troughs at 1,193.86 / 22 books in July — the challenge slump — and the folds must reconcile upward: periods to 103, books to 498, spend to 34,833.28. Date discipline is challenge discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "goodreads-t8",
      q: "Finance says an affiliate statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (#25: 4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "goodreads-t9",
      q: "How do LAG and LEAD power the challenge spine's period-over-period reads — and where do candidates usually stumble?",
      a: "LAG(revenue) OVER (ORDER BY month) puts the prior month beside the current one — July's 1,193.86 beside August's 2,352.07; LEAD reads forward. Both leave the boundary row NULL, and that NULL is honest: 2024-01 has no baseline, and its percentage change is 'unknown', not zero. The two classic stumbles: filtering the window result in WHERE, which fails because windows evaluate in the SELECT stage — stage the walk in a CTE and filter outside; and forgetting PARTITION BY when the series is per-reader, where one global window smears Alice's January into Emma's February. The third stumble is direction — LAG under DESC reads next month, and every delta flips sign, turning the July trough into a rally. The spine walk case in this kit is the shape: fold, then walk, then narrate.",
      tag: "windows",
    },
    {
      id: "goodreads-t10",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a catalog pod?",
      a: "Three concrete buys. Readability: a chain of named steps — monthly, ladder, bands — reads like the review process instead of a Russian-doll subquery, and each CTE is a checkpoint to SELECT from while debugging. Reuse: one CTE feeds several later references, so the per-reader period fold is written once for the rank window and once for the mean gate. Correctness under review: naming a CTE challenge_ladder forces you to state the definition (periods per reader, stamped or not) where the reviewer can see it — Goodreads publishes leaderboards, so definitions that drift between decks are public incidents. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step. When a query spans two grains — the fold and the share denominator — the CTE is the only way the next analyst can audit your number.",
      tag: "ctes",
    },
    {
      id: "goodreads-t11",
      q: "UNION versus UNION ALL — when is the dedupe step correct business logic, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint, like the board's finished-shelf list stacked over the abandoned-shelf list with a branch label column. UNION adds a distinct pass over the combined set, and that pass is a decision: correct when overlapping sources must collapse, a silent bug when duplicates are the signal — this kit's mcq lost a reader exactly this way, two byte-identical rows collapsing with no error anywhere. Column discipline still applies: both branches need matching column counts and compatible types, names taken from the first branch. The discipline move: default to UNION ALL, and when you do reach for UNION, write the comment naming which duplicated rows you are paying to collapse — the comment is the correctness argument.",
      tag: "set-ops",
    },
    {
      id: "goodreads-t12",
      q: "EXCEPT and INTERSECT — which shelf questions do they answer more honestly than a join?",
      a: "Diff and overlap questions. 'Which editions were shelved this quarter but not last?' is SELECT product_id FROM this-quarter EXCEPT SELECT product_id FROM last-quarter — no join gymnastics, no fan-out, and the intent reads straight off the page. INTERSECT answers the mirror: genres present in both the summer and fall challenge lists. Two discipline points interviewers wait for: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if duplicate shelf events are the anomaly you are hunting, the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types. EXCEPT and INTERSECT for set-level diffs across snapshots, anti-joins for row-level forensics — knowing which question you are answering is the whole skill.",
      tag: "set-ops",
    },
    {
      id: "goodreads-t13",
      q: "The shelf-band fold splits 251 lines at unit_price 55. What makes a band CASE trustworthy — arms, order, and the boundary?",
      a: "Three properties. Exhaustive arms: WHEN unit_price < 55 THEN 'mass-market' ELSE 'premium' — the ELSE guarantees every line lands somewhere, and the band fold foots to 251 lines / 498 books by construction. Ordered arms: CASE evaluates top-down and stops at the first match, so a reordered arm quietly re-bands the base — the premium tier can empty with no error anywhere. A stated boundary: the 55 line is a contract, not a discovery — on this shelf no line price sits between 50.84 and 57.16, so < 55 and <= 55 agree today, but a re-priced feed with a 55.00 edition would split the bands differently and the forecast would shift silently. The reviewer's move is asking which arm swallows the boundary row; the analyst's move is answering before the fold runs. Zero-value bands get an explicit ELSE 0 in the counts — an empty band must print 0, not vanish.",
      tag: "case-when",
    },
    {
      id: "goodreads-t14",
      q: "Why is an average of averages wrong, and what do you compute instead for the per-book price?",
      a: "Because it weights every group equally regardless of size. On this shelf, AVG(oi.unit_price) over the 251 lines reads 70.89 — every line one vote. But books ride lines: a line can carry 3 books, and the honest per-book mean weights by quantity — SUM(unit_price × quantity) / SUM(quantity) = 34,833.28 / 498 = 69.95. The same trap one level up: averaging six per-publisher average prices describes a bookstore that does not exist, because publishers carry 2-to-3 titles and wildly different price points. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(price × books) / SUM(books) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim you should have to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "goodreads-t15",
      q: "Money lives in integer cents in the affiliate tables. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: invoices.amount_cents = 175600 is $1,756.00, and amount_cents / 100 is integer division — 1,756 flat, cents eaten on every odd-cent row; divide by 100.0 or convert once at the presentation edge. Ratio truncation: 100.0 * settled / billed promotes the division to real arithmetic BEFORE it truncates — placed after, partial-coverage shares read zero. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — this ledger closes at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A number that survives that chain is a number finance will sign.",
      tag: "numbers",
    },
    {
      id: "goodreads-t16",
      q: "Catalog work is anti-join work. Walk me through the never-shelved report — and the confident zero you are expected to prove.",
      a: "The shape: editions LEFT JOINed to shelf events, WHERE the event key IS NULL — or NOT EXISTS, the NULL-proof probe. On the clean core db the report returns zero rows: all 16 editions appear on the shelf somewhere, and the honest deliverable is 'zero, verified, as of this spine' — not silence. The two traps: a WHERE filter on the events table after the LEFT JOIN silently turns it INNER and deletes exactly the rows the report exists to show; and a staging copy where product_id can arrive NULL poisons NOT IN but not NOT EXISTS. The mirror report runs on the finance rails — the six never-settled statements worth 15,217.00, including the paid-status one (#28) — proving the anti-join finds real money when the population is real. State the survival rule (which side must keep unmatched rows), then name the zero.",
      tag: "joins",
    },
    {
      id: "goodreads-t17",
      q: "Review depth is a NULL story: unrated editions, unstamped windows, empty shelves. What is your NULL policy, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: a NULL is 'no data yet', not zero and not a row you may quietly drop — and every report names which NULLs it keeps. Mechanics to narrate: in filters, NULL fails both = and != (the comparison is UNKNOWN), so WHERE status != 'cancelled' silently drops NULL-status rows; = NULL matches nothing — IS NULL is the membership test. In aggregates, NULLs are ignored: AVG(julianday(shipped_at) - julianday(created_at)) returns the stamped-only 2.98-day average whether or not you wrote the WHERE clause — a real number wearing the wrong name unless the population is stated; COUNT(shipped_at) reads 82 against COUNT(*) = 103, and that 21-row gap is the to-read-plus-abandoned population, a feature when the gap IS the story. In GROUP BY, NULLs group together — they are their own bucket, honest and visible. What is never acceptable: COALESCEing a latency to zero to 'fix' the average — that invents same-day window opens and poisons the 2.98 baseline every alert keys off.",
      tag: "nulls",
    },
    {
      id: "goodreads-t18",
      q: "EXISTS versus IN versus NOT IN for the catalog's triage lists — what actually differs, and which do you reach for?",
      a: "IN is a membership test: the engine materializes the subquery's values and checks each outer row against the list — readable, but NOT IN inherits the NULL trap: one NULL in the list returns nothing, forever. EXISTS is an existence probe: it short-circuits on the first matching row and never trips on NULLs, which is why triage lists built on staging data are written NOT EXISTS (SELECT 1 FROM shelf_events e WHERE e.product_id = p.id) — the probe survives a dirty feed. A derived table is neither — it stages a new grain (per-reader period counts, per-genre book folds) that the outer query joins to, exactly like the cadence gate in this kit. The Goodreads-shaped answer: EXISTS for presence checks and anti-joins on nullable keys, IN for small static-looking sets, derived tables or CTEs when the subquery itself is an aggregation. And the follow-up you give unprompted: what each shape returns when the inner query is empty — EXISTS false, IN filters everything out, NOT IN passes everything through.",
      tag: "subqueries",
    },
    {
      id: "goodreads-t19",
      q: "The community board asks for 'the challenge completion rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (a finished challenge month — status 'delivered', 52?), the denominator (all booked periods 103 → 50.5%, or the 82 stamped periods → 63.4% — a 13-point spread between two defensible numbers), the time window (the whole 2024-01-to-2025-02 spine, or the trailing month), and whether to-read periods belong in the base (they do in a conversion read, they do not in a latency read). Then the discipline move: encode the definition as a named CTE — challenge_finished AS (SELECT … WHERE status = 'delivered') — so the SQL IS the definition and the reviewer audits it instead of arguing. Goodreads publishes these numbers to the community; a denominator that drifts between posts is a public correction. The analyst who says 'completion = delivered periods over booked periods, backlog included, spine-to-date' owns the room.",
      tag: "metrics",
    },
    {
      id: "goodreads-t20",
      q: "What keeps a catalog query cheap — and which habits compound as the shelf grows past this db?",
      a: "Sargability first: a predicate that compares the bare column to a value can use an index — created_at >= '2024-01-01' AND created_at < '2024-04-01' seeks the quarter; STRFTIME('%Y-%m', created_at) = '2024-03' wraps the column and scans every row for the same answer. Then the compounding habits: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT * so payloads you never read stop crossing the wire; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question — fold shelf events to edition grain before joining publishers, not after. The publisher bench is the example: the share denominator (the whole-shelf fold) is computed once as a scalar subquery, not re-folded per row. These are not micro-optimizations; they are the difference between a title review that renders and one that times out while the pod watches.",
      tag: "performance",
    },
    {
      id: "goodreads-t21",
      q: "Walk me through the logical evaluation order of a SELECT — and name the shelf bug each stage explains.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters the groups; SELECT computes output expressions including window functions; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation: an alias like books referenced in WHERE (it does not exist yet — SELECT runs later), an aggregate like COUNT(*) in WHERE (groups do not exist yet — the judgment belongs in HAVING, exactly the thirteen-period ladder gate), a filter on RANK() output in WHERE (windows run in SELECT — stage the query in a CTE), and the flip side that ORDER BY CAN use SELECT aliases because it runs after them. Half of all 'weird database behavior' reports are correct pipeline order meeting wishful thinking. Saying the order out loud before writing is the cheapest debugging tool an analyst has, and it is exactly the narration the interviewer is listening for.",
      tag: "pipeline",
    },
    {
      id: "goodreads-t22",
      q: "The challenge trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the trend becomes a 12-row fiction, while '%Y' collapses it to two rows. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' means midnight on the 31st and silently drops the last night's shelf events, and month-end is exactly when reading windows stamp. The LAG: on a month-ordered spine the first row's prior value is NULL — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story is concrete: 3,731.97 / 50 books in January down to the 1,193.86 / 22-book July trough — and every cut must still foot: periods to 103, books to 498, spend to 34,833.28.",
      tag: "dates",
    },
    {
      id: "goodreads-t23",
      q: "The status census drifts by one row overnight. How do reconciliation identities turn that from a mystery into an alarm?",
      a: "Give every headcount a second, independent way to foot, and let the identity do the detecting. The shelf's identities: periods 8+9+8+7+8+6+8+7+9+7+6+7+6+7 = 103, books 50+51+40+34+45+27+22+40+44+33+25+30+24+33 = 498, spend foots to 34,833.28 — and the status fold 52 + 30 + 14 + 7 must equal COUNT(*) = 103 by construction, because the arms partition the rows. A branch that breaks the identity is an incident, not a rounding note: it means an arm's predicate caught something it should not have, or a row arrived with a status outside the map. The finance side runs the same discipline — the coverage census 21 exact / 1 partial / 6 none over 28 statements, and the ledger trial balance 181,080 = 181,080 — and the drift hunt is the same five checks: freshness, volume, duplicate keys, orphaned foreign keys, NULL spikes. The deliverable is not 'it looks fine' — it is which identity held, and when it last ran.",
      tag: "quality",
    },
    {
      id: "goodreads-t24",
      q: "How would you compute cumulative books shelved and a moving average over the spine — and where does the frame choice bite?",
      a: "Window frames. Cumulative: SUM(books) OVER (ORDER BY month) — the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which accumulates in month order up to each row. Moving 3-month average: AVG(books) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). The expert detail: ROWS vs RANGE matters when the ORDER BY key has ties — RANGE includes peers, so rows tied on the same key enter the cumulative together; harmless on a month spine where months are unique, guaranteed to bite the moment the read drops to day grain and two shelf events share a timestamp. Write ROWS when you mean row-by-row. And PARTITION BY is the reset: SUM(quantity) OVER (PARTITION BY customer_id ORDER BY created_at) restarts the cumulative per reader — one global frame would smear every reader's shelf into one walk.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "goodreads-mcq-1",
      prompt: "A reading period's status reads 'shipped'. In this kit's Goodreads stage map, what happened?",
      choices: ["Reading window in flight — the window-open stamp shipped_at has landed", "Challenge month finished — the period completed", "Abandoned — the reader quit the shelf mid-period", "To-read backlog still waiting to open"],
      answer: 0,
      why: "The stage map is fixed: shipped = reading window in flight (30 of 103 periods), with shipped_at as the window-open stamp. It is stamped and running — but not a finished challenge month.",
      notes: [
        { choice: 1, why: "Finished is 'delivered' — 52 periods. Calling in-flight windows finished inflates the challenge-completion base before a single month completes." },
        { choice: 3, why: "Backlog is 'pending' — 14 periods with no shipped_at yet. Pending is not in-flight and not abandoned; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-2",
      prompt: "EU carries 45 reading periods from 8 readers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to readers (8). The gap between them — 5.6 periods per reader — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period carries a reader. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not readers — a third grain nobody asked for. The census is periods AND readers." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-3",
      prompt: "The shelf holds 251 shelf events. Which expression counts the BOOKS on the shelf?",
      choices: ["SUM(oi.quantity)", "COUNT(*)", "COUNT(DISTINCT oi.order_id)", "MAX(oi.quantity)"],
      answer: 0,
      why: "Books live in quantity: SUM(oi.quantity) folds to 498. Depth is a sum over the line grain, not a count of rows — 251 lines carry 498 books, and the max line holds 3.",
      notes: [
        { choice: 1, why: "COUNT(*) reads 251 — shelf events, not books. The two are 2.44 lines-per-period apart, and the depth report dies the moment they are confused." },
        { choice: 2, why: "COUNT(DISTINCT oi.order_id) reads 103 — periods, the coarsest grain of the three. Right number, wrong metric." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned shelves only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandonment map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-5",
      prompt: "Keep only readers carrying at least 13 reading periods for the challenge ladder. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 13, before GROUP BY", "GROUP BY reader HAVING COUNT(*) >= 13", "WHERE periods >= 13 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly four readers clear the 13 bar — 24, 17, 14 and 13 periods.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-6",
      prompt: "The reading ladder runs 24, 17, 14, 13, 5 periods, then FOUR readers tied at 4. Under RANK, what rank do the two 3-period readers carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period readers share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The community board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The backlog periods double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-8",
      prompt: "A metadata triage list uses edition_id NOT IN (SELECT product_id FROM order_items WHERE quantity = 3) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL product_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every edition appears in the shelf somewhere. But staging tables are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-9",
      prompt: "A board stack puts finished-shelf readers above abandoned-shelf readers in one layout, built with UNION. A reviewer says one reader's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same reader, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same reader, same counts, no branch label — collapse into one, and the board loses a reader with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-10",
      prompt: "A teammate writes SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id and calls it shelf spend. The probed book is 34,833.28. What did they print?",
      choices: ["34,833.28 — the fold is grain-safe", "103,244.55 — the join fans each period's total out once per shelf event; the honest line-level fold is SUM(oi.unit_price * oi.quantity)", "251.00 — the join collapsed to line count", "NULL — total cannot survive a join"],
      answer: 1,
      why: "The join multiplies periods by their shelf events (251 lines over 103 periods), and SUM(o.total) sums the fanned rows: 103,244.55, a clean 2.96-fold overcount that executes without a single warning. The fold that foots to the probed book is line-level: SUM(oi.unit_price * oi.quantity) = 34,833.28.",
      notes: [
        { choice: 0, why: "The two folds only agree when no join fans the rows. One shelf event per period would be safe — this shelf runs 2.44 lines per period, so the fan-out is guaranteed." },
        { choice: 2, why: "251 is COUNT(*) at line grain, not a sum at all. Three grains — 103 periods, 251 lines, 498 books — and none of them is shelf spend." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-11",
      prompt: "COUNT(shipped_at) reads 82 on the 103 reading periods. What IS the 21-row gap between it and COUNT(*)?",
      choices: [
        "The 14 to-read periods plus the 7 abandoned shelves — the unstamped population",
        "The 30 in-flight windows, double-counted",
        "21 duplicate period rows from a pipeline retry",
        "Nothing — COUNT never returns 82 on a 103-row table",
      ],
      answer: 0,
      why: "COUNT(shipped_at) counts non-NULL stamps; the 21 rows without one are the 14 backlog periods plus the 7 abandoned shelves. The gap is a population, not an error — naming it is the NULL policy stated out loud.",
      notes: [
        { choice: 1, why: "In-flight windows carry stamps — they are inside the 82. The gap is the rows with NO stamp at all." },
        { choice: 2, why: "Duplicates are a GROUP BY HAVING investigation, not a COUNT gap. Reaching for an incident story before checking NULL semantics is the reflex this kit retrains." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-12",
      prompt: "The most-shelved card shows the top 3 editions: Desk Mat Extended (47 books), Noise-Canceling Headset (46), HDMI 2.1 Cable (38). Which query returns exactly that?",
      choices: [
        "SELECT p.name, SUM(oi.quantity) AS books … GROUP BY p.id ORDER BY books DESC LIMIT 3",
        "SELECT p.name, SUM(oi.quantity) AS books … GROUP BY p.id ORDER BY books ASC LIMIT 3",
        "SELECT p.name, MAX(oi.quantity) AS books … GROUP BY p.id ORDER BY books DESC LIMIT 3",
        "SELECT p.name, SUM(oi.quantity) AS books … GROUP BY p.id ORDER BY books DESC LIMIT 3 OFFSET 3",
      ],
      answer: 0,
      why: "Books live in quantity, so SUM over the line grain is the fold; ORDER BY books DESC puts the leaders on top and LIMIT 3 performs the card's cut. That reads 47 / 46 / 38 — the probed ladder.",
      notes: [
        { choice: 2, why: "MAX(quantity) reads the biggest single line (3), not the shelf total — one row wearing an aggregate's name." },
        { choice: 3, why: "OFFSET 3 skips the top three — you get ranks 4 through 6. OFFSET moves the window; it never widens the ladder." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-13",
      prompt: "The challenge funnel needs to print as four reconcile-able rows: 52 finished, 30 in flight, 14 to-read, 7 abandoned. Which GROUP BY builds it?",
      choices: [
        "GROUP BY customer_id",
        "GROUP BY status",
        "GROUP BY month",
        "GROUP BY region",
      ],
      answer: 1,
      why: "The fate census IS the status fold: four rows that must sum to COUNT(*) = 103 by construction, because the arms partition the rows. The others are real censuses — readers, the month spine, markets — but they belong to different slides.",
      notes: [
        { choice: 0, why: "16 reader rows is the coverage census, not the funnel. Right tool, different question." },
        { choice: 2, why: "14 month rows is the spine — the trend view. A funnel that foots to 103 must partition by stage, not time." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-14",
      prompt: "The reading-window SLA base counts periods whose windows are open or finished. Which WHERE keeps exactly the 82 stamped periods?",
      choices: [
        "WHERE status IN ('delivered', 'shipped')",
        "WHERE status != 'pending'",
        "WHERE status = 'delivered' OR 'shipped'",
        "WHERE status NOT IN ('delivered', 'shipped')",
      ],
      answer: 0,
      why: "The SLA base is the stamped population — 52 finished plus 30 in-flight — and the IN list names both stages explicitly, which is the population statement the reviewer wants to see.",
      notes: [
        { choice: 1, why: "!= 'pending' also keeps the 7 abandoned shelves — 89 rows, seven too many. The negative filter is only safe when the value set is closed AND named." },
        { choice: 2, why: "The bare string 'shipped' casts to numeric 0 in SQLite's boolean context — this quietly returns just the 52 delivered rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-15",
      prompt: "Count Q1-2024 reading periods — January 1 through March 31, including the last night. Which WHERE survives the boundary?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE created_at >= '2024-01-01' AND created_at <= '2024-03-31'",
        "WHERE STRFTIME('%m', created_at) IN ('01', '02', '03')",
      ],
      answer: 1,
      why: "Timestamps carry times: any comparison ending at '…03-31' means midnight that day and drops the evening's shelf events. The half-open range [Jan 1, Apr 1) catches the last second, composes at quarter ends, and reads 25 periods on this spine (8 + 9 + 8).",
      notes: [
        { choice: 0, why: "BETWEEN is the classic boundary bug — the last night of the quarter is exactly when windows stamp. Boundary bugs, not function bugs." },
        { choice: 3, why: "The %m list merges January 2024 with January 2025 — and this spine has a second January. Year must ride with month." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-16",
      prompt: "The shelf-band fold uses CASE WHEN unit_price < 55 THEN 'mass-market' ELSE 'premium' END. A reviewer proposes unit_price <= 55. What changes?",
      choices: [
        "Every line flips band — the counts invert",
        "Nothing changes on this shelf — no line price sits between 50.84 and 57.16 — but the definition moved: a future 55.00 edition lands premium instead of mass-market",
        "Error — the ELSE arm cannot follow <=",
        "The premium average drops to 31.01",
      ],
      answer: 1,
      why: "On the probed shelf the two predicates agree — the price gap straddles 55 — so the counts (268 mass-market books at 31.01, 230 premium at 115.85) hold either way. But the boundary is a contract, not a discovery: state it, because a re-priced feed with a 55.00 edition would split the bands differently with no error anywhere.",
      notes: [
        { choice: 0, why: "Inversion would need prices straddling 55 on both sides — this shelf has none. The honest answer is 'no change today', plus the contract point." },
        { choice: 3, why: "31.01 is the mass-market average — it cannot move by redefining the boundary when no row sits on it." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-17",
      prompt: "The genre map needs the distinct genre families, not editions. What does `SELECT DISTINCT category FROM products` return?",
      choices: [
        "7 rows — Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables",
        "16 rows — one per edition",
        "6 rows — the publisher count",
        "251 rows — one per shelf event",
      ],
      answer: 0,
      why: "DISTINCT collapses the 16 editions to their 7 category codes; Fitness carries a single edition and still earns a row. 6 is the publisher count — a different dimension of the same catalog.",
      notes: [
        { choice: 1, why: "16 is COUNT(*) — the row count. DISTINCT folds duplicate categories; the value set is the deliverable." },
        { choice: 2, why: "Six publishers sit one join away (suppliers). Confusing the two dimensions is how genre maps get labeled by publisher." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-18",
      prompt: "The per-book price: the shelf fold is 34,833.28 over 498 books across 251 lines. Which expression prints the honest 69.95?",
      choices: [
        "AVG(oi.unit_price) — the mean line price",
        "SUM(oi.unit_price * oi.quantity) / SUM(oi.quantity) — spend over books",
        "AVG(oi.unit_price * oi.quantity) — the mean line spend",
        "MAX(oi.unit_price)",
      ],
      answer: 1,
      why: "Books ride lines — a line can carry 3 books — so the per-book mean must weight by quantity: 34,833.28 / 498 = 69.95. AVG(unit_price) weights lines equally and reads 70.89: a bookshop that does not exist. AVG(unit_price × quantity) is line spend, not book price.",
      notes: [
        { choice: 0, why: "70.89 is not wrong arithmetic — it is the wrong weighting. Saying WHERE the weights live is the whole answer." },
        { choice: 2, why: "That is the average a reader spends per line, a real but different metric. Grain again: books, lines, and spend are three denominators." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-19",
      prompt: "The most-shelved ladder publishes `ORDER BY books DESC, p.id ASC`. Why the second key?",
      choices: [
        "It reverses the primary sort for the tie block",
        "It breaks the 36-pair and three-way ties deterministically — a published ladder must not reshuffle between runs",
        "It filters out NULL book counts",
        "It is cosmetic — SQLite always resolves ties by rowid",
      ],
      answer: 1,
      why: "The 36-pair (Laptop Stand, Wireless Mouse) and the two three-way ties (30s and 21s) make tie order inevitable; a named second key decides it the same way every run. Without one, the order is whatever the query plan yields — today rowid, tomorrow an index scan — and the community notices the ladder reordering itself.",
      notes: [
        { choice: 3, why: "Rowid order is an implementation detail, not a contract. Relying on implicit order is the bug that ships when an index lands." },
        { choice: 0, why: "The second key only acts within equal primary values — it cannot reverse the primary sort." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-20",
      prompt: "The dunning list wants statements with zero settlement legs, run on a staging copy where invoice_id can arrive NULL. Which shape survives?",
      choices: [
        "invoices.id NOT IN (SELECT invoice_id FROM payments)",
        "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id != i.id)",
        "WHERE COUNT(p.id) = 0",
      ],
      answer: 1,
      why: "NOT EXISTS probes per statement, short-circuits on the first match, and never trips on a NULL — the staging-safe anti-join. NOT IN poisons on the first NULL in the list (mcq-8's trap); the inverted EXISTS asks a different question; COUNT needs a GROUP BY before it means anything.",
      notes: [
        { choice: 0, why: "The confident zero — looks valid, empties on the dirty feed, and the dunning run ships to nobody." },
        { choice: 2, why: "p.invoice_id != i.id is true whenever ANY statement has a leg from a different statement — which is always. The inversion flips the question silently." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-21",
      prompt: "The challenge funnel card wants finished, in-flight, backlog and abandoned as COLUMNS in one row, one scan. Which shape branches the aggregates?",
      choices: [
        "GROUP BY status — four rows",
        "COUNT(*) FILTER (WHERE status = 'delivered') … — one scan, four conditional counts, COUNT(*) as the shared denominator",
        "Four separate SELECTs pasted into the dashboard",
        "COUNT(status = 'delivered')",
      ],
      answer: 1,
      why: "FILTER (WHERE …) is the one-scan conditional count: 52 / 30 / 14 / 7 beside COUNT(*) = 103, all sharing a denominator — the reconciliation identity lives inside the row. SUM(CASE WHEN …) is the portable twin.",
      notes: [
        { choice: 0, why: "Rows, not columns — an honest census in the wrong shape; the card then needs reshaping somewhere drift lives." },
        { choice: 2, why: "Four scans are four chances for the status filters to drift apart — the funnel stops footing at exactly the slide everyone screenshots." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-22",
      prompt: "The funnel table must read finished → in-flight → backlog → abandoned, not alphabetical. Which ORDER BY does it?",
      choices: [
        "ORDER BY status",
        "ORDER BY CASE WHEN status = 'delivered' THEN 1 WHEN status = 'shipped' THEN 2 WHEN status = 'pending' THEN 3 ELSE 4 END",
        "ORDER BY COUNT(*)",
        "GROUP BY status first, then ORDER BY",
      ],
      answer: 1,
      why: "CASE in ORDER BY maps stage names to a policy order — the funnel's business sequence, not the alphabet. The arms are the funnel definition, visible in the query where the reviewer can audit them.",
      notes: [
        { choice: 0, why: "Alphabetical reads abandoned → cancelled → delivered → shipped — a funnel telling its story backwards." },
        { choice: 2, why: "COUNT is not part of the stage order — it sorts by volume and reshuffles as the numbers move." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-23",
      prompt: "Cumulative books per reader: SUM(oi.quantity) OVER (PARTITION BY o.customer_id ORDER BY o.created_at). What does PARTITION BY do that ORDER BY alone does not?",
      choices: [
        "Sorts the output by reader",
        "Restarts the running sum at each reader — without it, one global walk smears every reader's shelf into a single cumulative",
        "Filters out readers with one shelf event",
        "Duplicates the running sum per reader for comparison",
      ],
      answer: 1,
      why: "PARTITION BY scopes the window: each reader's books accumulate from their own first shelf event, resetting at the next reader. ORDER BY alone gives one grand cumulative over the whole shelf — 498 at the end — regardless of who shelved what.",
      notes: [
        { choice: 0, why: "Sorting is the outer ORDER BY's job. PARTITION BY changes which rows the window sees, not how output is sorted." },
        { choice: 2, why: "Windows never filter rows — every row survives a window function. Filtering happens in WHERE or an outer query." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-24",
      prompt: "The publisher-share denominator is a scalar subquery over a genre-filtered staging fold that returns NO rows. What prints in the share column?",
      choices: [
        "0 — the shares read zero",
        "NULL — a scalar subquery with no row yields NULL, spend / NULL is NULL, and every share silently drops out while the query looks valid",
        "Error — scalar subqueries must return exactly one row, always",
        "The unfiltered whole-shelf total",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows. Zero rows return NULL — not an error — and NULL poisons the division quietly. On the full shelf the fold always returns a row (34,833.28); on filtered staging — one genre, one month — the empty-inner bug ships exactly here.",
      notes: [
        { choice: 0, why: "NULL is not zero — a share column of NULLs is emptier than a column of zeros and harder to spot in a deck." },
        { choice: 2, why: "The contract is 0-or-1; only the 2-or-more case errors. The zero case is the silent one, which is why you state the empty-case behavior unprompted." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-25",
      prompt: "The quarter filter WHERE STRFTIME('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-03' scans all 103 periods. The sargable twin that can seek an index on created_at is:",
      choices: [
        "WHERE SUBSTR(created_at, 1, 7) IN ('2024-01', '2024-02', '2024-03')",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE CAST(created_at AS TEXT) LIKE '2024-0%'",
        "WHERE created_at - '2024-01-01' < 90",
      ],
      answer: 1,
      why: "The half-open range compares the bare column to constants — the only shape an index can seek. Every wrapped-column variant (STRFTIME, SUBSTR, CAST, arithmetic) forces a full scan for identical rows; same 25 periods, different plan class.",
      notes: [
        { choice: 3, why: "created_at - '2024-01-01' coerces the timestamp to a year number (2024 − 2024 = 0), so the predicate is always true — a full scan AND a wrong answer." },
        { choice: 0, why: "Identical rows, wrong plan — the accidental full scan that appears the day the shelf outgrows memory." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-26",
      prompt: "The cadence gate needs the per-reader period fold TWICE — once for the rank window, once for the mean comparison. Why stage a WITH (CTE) instead of writing the fold twice?",
      choices: [
        "CTEs execute faster than subqueries — guaranteed",
        "Write once, reference twice, and the definition (what counts as a period, stamped or not) lives in one named stage the reviewer can audit",
        "CTEs are the only way to reference an aggregate twice",
        "WITH automatically caches results between references",
      ],
      answer: 1,
      why: "The fold (GROUP BY customer_id) is one definition; writing it twice is two chances to drift — and the reviewer audits the named stage, not two copies. CTEs are logical staging, not guaranteed materialization or caching: the buy is readability, reuse, and auditable definitions.",
      notes: [
        { choice: 0, why: "No performance guarantee — modern engines may inline or materialize either way. The CTE's value is the contract, not the plan." },
        { choice: 2, why: "A derived table in FROM does the same job once; the CTE wins on naming and multi-reference reuse, not on capability." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-27",
      prompt: "Completionists: readers who shelved EVERY edition in a 16-edition set. Which shape states the rule directly and survives NULL keys?",
      choices: [
        "Double NOT EXISTS — no edition exists for which the reader has no shelf event",
        "COUNT(product_id) = 16 per reader after the join",
        "INNER JOIN products — readers matching all editions survive the join",
        "HAVING MAX(product_id) = 16",
      ],
      answer: 0,
      why: "Relational division is 'no set member is missing': SELECT … WHERE NOT EXISTS (an edition without a matching shelf event for THIS reader). It survives NULL keys and states the rule as the business says it. The COUNT variant needs DISTINCT and a materialized universe; the INNER JOIN keeps partial readers; MAX(id) = 16 says nothing about coverage.",
      notes: [
        { choice: 1, why: "The join fans lines under editions — COUNT without DISTINCT counts shelf events, not editions covered. And the universe (16) is hardcoded where it should be derived." },
        { choice: 3, why: "MAX = 16 passes any reader who touched edition 16 once — coverage is about ALL, not about the largest id." },
      ],
      difficulty: "hard",
    },
    {
      id: "goodreads-mcq-28",
      prompt: "Window-open latency: days between booking a period and the reading window opening. Which pair is right — the expression and its population?",
      choices: [
        "julianday(shipped_at) - julianday(created_at), over the 82 stamped periods — the 14 to-read rows have no window yet and stay out by definition",
        "DATE(shipped_at) - DATE(created_at), over all 103 periods",
        "STRFTIME('%d', shipped_at) - STRFTIME('%d', created_at), over all 103 periods",
        "shipped_at - created_at, over all 103 periods",
      ],
      answer: 0,
      why: "julianday turns TEXT timestamps into fractional day numbers — the 2.98-day average, 2-to-4 spread — and the population is the 82 stamped rows, stated with the number because the 14 backlog periods have no clock to average. Text minus text coerces both sides to year numbers (2024 − 2024 = 0); %d breaks across month boundaries.",
      notes: [
        { choice: 1, why: "DATE() minus DATE() is the silent-zero bug — it prints 0 everywhere and reads as same-day window opens." },
        { choice: 3, why: "Same coercion, one step shallower — '2024-01-05' - '2024-01-03' is 2024 − 2024 = 0, not 2." },
      ],
      difficulty: "easy",
    },
    {
      id: "goodreads-mcq-29",
      prompt: "The band card needs a TOTAL row — all 251 lines, all 498 books — appended under the two band rows in ONE query. Which shape appends it?",
      choices: [
        "UNION — the dedupe pass cleans the stack",
        "UNION ALL — the TOTAL branch scans the unfiltered order_items and concatenates without a dedupe pass",
        "GROUP BY ROLLUP — not available here; write two queries",
        "JOIN the band rows to the total row on 1 = 1",
      ],
      answer: 1,
      why: "UNION ALL is the honest stacker: the detail branch folds bands, the TOTAL branch re-scans the whole table, and every row in the stack belongs — no dedupe pass needed or wanted. A bare UNION adds a distinct sort that could silently collapse rows if the branches ever emitted identical values.",
      notes: [
        { choice: 2, why: "Correct instinct elsewhere (warehouse engines), unavailable here — and 'write two queries' is exactly the two-chances-to-drift shape this kit retrains." },
        { choice: 3, why: "A cross join multiplies bands by the total instead of appending — row counts explode and the card reads nonsense." },
      ],
      difficulty: "medium",
    },
    {
      id: "goodreads-mcq-30",
      prompt: "The ladder's second tier: editions ranked 4 through 6 by books shelved (36, 36, 33). Which query returns exactly that window?",
      choices: [
        "ORDER BY books DESC LIMIT 3",
        "ORDER BY books DESC LIMIT 3 OFFSET 3",
        "ORDER BY books ASC LIMIT 3 OFFSET 3",
        "ORDER BY books DESC OFFSET 3",
      ],
      answer: 1,
      why: "LIMIT 3 OFFSET 3 skips the top three (47, 46, 38) and returns the next three — the 36-pair and 33. OFFSET moves the window down the ladder; LIMIT sizes it; the pair only means 'ranks 4-6' together.",
      notes: [
        { choice: 0, why: "That is the podium — ranks 1-3, the exact rows the offset is meant to skip." },
        { choice: 2, why: "ASC walks the ladder from the bottom — the quietest editions — and OFFSET 3 skips the quietest three." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-goodreads-1",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "The reading-year spine",
      brief:
        "Goodreads-flavored brief on the storefront db: the challenge board opens Monday with the reading-year spine — the community's reading periods, books shelved and book spend bucketed by month, with the identities stated on the slide. Probed facts: 103 reading periods worth 34,833.28 across 251 shelf events carrying 498 books; the spine runs 2024-01 to 2025-02, opening at 8 periods / 50 books / 3,731.97 and troughing in July at 1,193.86 over just 22 books. Every month must foot: periods sum to 103, books to 498, spend to 34,833.28.",
      ask: "Return each month with its period count, books shelved and book spend to 2 decimals, chronological.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS month,\n       COUNT({2} o.id) AS periods,\n       SUM(oi.quantity) AS books_shelved,\n       ROUND(SUM(oi.unit_price * oi.quantity), {3}) AS book_spend\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY {4}\nORDER BY month {5};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "'%Y-%m' keeps year and zero-padded month together — 14 buckets from 2024-01 to 2025-02. '%m' alone merges January 2024 with January 2025 into one '01' bucket (12 rows) and the challenge spine becomes fiction.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the period-count guard",
          why: "The join fans each period out once per shelf event — 251 lines over 103 periods. COUNT(DISTINCT o.id) folds back to true periods; bare o.id counts lines and every month reads the fan-out instead of the census.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the spend precision",
          why: "Spend prints to 2 decimals — 3,731.97, not 3,732 — so the month cells reconcile byte-for-byte with the challenge board's book-spend line. ROUND(..., 1) drifts every row off the ledger read.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the spine grain",
          why: "GROUP BY month folds the fanned join back to 14 calendar buckets. GROUP BY status collapses the spine to four statuses; GROUP BY o.id explodes it back to 103 period rows — neither is a month.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A challenge spine reads January first: ASC keeps 2024-01 on top so the July trough (1,193.86 / 22 books) sits mid-story. DESC opens the board on 2025-02 and the trend argument starts upside down.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "o.id", "status", "0", "DESC"],
      walkthrough:
        "One join, one fold, three reconciling identities. The join attaches every shelf event to its period, STRFTIME buckets the timestamps into 14 months, COUNT(DISTINCT o.id) guards the fan-out so periods stay periods (8 in January, not 50 lines), SUM(oi.quantity) folds the books (50 in January), and the line-level spend SUM(oi.unit_price * oi.quantity) prints the month's book spend — 3,731.97 in January; summing o.total after the join would print the fanned 103,244.55 instead of the true 34,833.28 book. The spine foots three ways: periods 8+9+8+7+8+6+8+7+9+7+6+7+6+7 = 103, books 50+51+40+34+45+27+22+40+44+33+25+30+24+33 = 498, spend to 34,833.28 — the slide's identities hold by construction. The story the board reads: February 2024 peaks at 51 books, July troughs at 1,193.86 over just 22 — the challenge slump that schedules the mid-year push. The distractors fail honestly: '%m' merges the two Januaries into a 12-row fiction; '%Y' collapses the spine to two year rows; bare o.id in the guard counts 251 shelf events; status re-buckets the spine into four statuses; 0 as the format NULLs every month into one lump row; DESC opens the board on 2025-02.",
    },
    {
      id: "cs-goodreads-2",
      tier: "hard",
      topic: "x1",
      universe: "supplier",
      title: "The publisher bench fold",
      brief:
        "Goodreads-flavored brief on the storefront db: before every title buy, the catalog pod defends the publisher bench — one row per publisher with its titles folded into a single cell, its book spend, and its share of the 34,833.28 shelf. Probed facts: 6 publishers — Nordic 11,130.25 (32%), Midwest 9,294.93 (26.7%), Alpine 4,765.63 (13.7%), Andes 3,613.25 (10.4%), Shenzhen 3,049.07 (8.8%), Pacific 2,980.15 (8.6%) — on title counts 3/3/2/2/3/3. The shelf's line-level spend folds to 34,833.28 across 251 shelf events; shares are 100.0 × publisher spend ÷ that whole-shelf fold, rounded to 1 decimal.",
      ask: "Return each publisher with its title count, folded title list, book spend to 2 decimals and shelf share to 1 decimal, biggest spend first.",
      template:
        "SELECT s.name AS publisher,\n       COUNT(DISTINCT p.id) AS titles,\n       GROUP_CONCAT({1}) AS shelf_list,\n       ROUND(SUM({2} * oi.quantity), 2) AS book_spend,\n       ROUND({3} * SUM(oi.unit_price * oi.quantity) /\n             (SELECT SUM(unit_price * quantity) FROM order_items), 1) AS shelf_share\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = {4}\nGROUP BY s.id, s.name\nORDER BY book_spend {5};",
      slots: [
        {
          answer: "p.name",
          kind: "keyword",
          label: "the title cell",
          why: "GROUP_CONCAT(p.name) folds each publisher's edition names into one shelf-list cell — the bench card's whole point. p.id folds id codes, s.name folds the publisher's own name over and over — neither is a title list.",
        },
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the transacted price",
          why: "Book spend must fold the transacted line price times books: SUM(oi.unit_price * oi.quantity). p.price is the catalog list price and drifts every cell off the probed 11,130.25 / 9,294.93 bench; oi.quantity squares the books.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share multiplier",
          why: "Shares print as 32 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6 — the 100.0 multiplier placed before the division turns the whole-shelf denominator (the scalar subquery's 34,833.28 fold) into percentages. Wrong multipliers scale the entire bench off the probed cells.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the catalog join key",
          why: "Shelf events attach to editions through oi.product_id = p.id. s.id joins on publisher ids and mis-benches every line; oi.id joins line ids to edition ids and the shelf collapses to noise.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The bench reads biggest first: Nordic 11,130.25 on top, Pacific 2,980.15 last. ASC opens the title review on the smallest publisher — a correct query aimed at the wrong end of the bench.",
        },
      ],
      distractors: ["p.price", "oi.quantity", "s.id", "0", "1", "ASC"],
      walkthrough:
        "Two folds and one denominator. The chain walks publishers (suppliers) → editions (products) → shelf events (order_items); GROUP BY s.id, s.name folds each publisher once; COUNT(DISTINCT p.id) counts its editions — 3 / 3 / 2 / 2 / 3 / 3, the probed title counts; GROUP_CONCAT(p.name) renders the shelf list; and SUM(oi.unit_price * oi.quantity) folds transacted spend — 11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15, footing to the 34,833.28 shelf. The scalar subquery folds the same expression over the whole book as the share denominator, so 100.0 × spend ÷ total prints the probed bench shares: 32 / 26.7 / 13.7 / 10.4 / 8.8 / 8.6 at 1 decimal. The distractors fail honestly: p.price swaps catalog list price for transacted price and every spend cell drifts; oi.quantity squares the books and the bench inflates; s.id joins lines by publisher id and mis-benches everything below the join; 0 and 1 as the join key collapse the shelf to nothing or to one edition; ASC reads the bench upside down. Concentration is the read: the top publisher's 32% against the runner-up's 26.7% is why the catalog pod caps per-publisher exposure before every buy season — and the share denominator being a subquery is exactly why the bench empties silently if that staging fold ever comes back empty.",
    },
    {
      id: "cs-goodreads-3",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The shelf-status pivot",
      brief:
        "Goodreads-flavored brief on the storefront db: the challenge board's funnel slide wants the four shelf stages as COLUMNS — finished, in-flight, backlog, abandoned — one row per market, so the regional leads see their whole funnel at a glance. Probed figures: 103 periods; EU runs 24 finished / 12 in-flight / 6 backlog / 3 abandoned over 45 periods, APAC 21 / 8 / 5 / 3 over 37, US 5 / 10 / 3 / 1 over 19, LATAM 2 / 0 / 0 / 0 over 2 — the arms reconcile to the region total by construction, and LATAM's zero arms must print zeros, not vanish.",
      ask: "Return each region with its four stage counts as columns, biggest finished base first.",
      template:
        "SELECT c.region,\n       SUM({1} WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS finished,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS backlog,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS abandoned\nFROM orders o\nJOIN customers c ON {3}\nGROUP BY c.region\nORDER BY finished {4};",
      slots: [
        {
          answer: "CASE",
          kind: "keyword",
          label: "the conditional branch",
          why: "SUM(CASE WHEN … THEN 1 ELSE 0 END) is the pivot arm — the CASE translates a stage into a 0/1 flag the SUM folds. A bare WHEN has no home outside CASE and the engine rejects it; FILTER (WHERE …) is the modern spelling of the same arm.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the backlog literal",
          why: "Backlog is the pending stage — 14 periods, 6 in EU. Dropping in 'shipped' re-prints the in-flight column twice and zeroes the backlog column; the funnel slide loses its queue and nobody notices an error, because there isn't one.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the shelf edge",
          why: "The join keys each period to its reader's market: c.id (reader key) to o.customer_id (the reader foreign key). c.id = c.id is always true and pairs every period with every reader — 1,648 rows — so every arm counts 16x too high before the fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-finished-first direction",
          why: "The slide leads with the strongest finished base: EU 24, APAC 21, US 5, LATAM 2. ASC opens on LATAM's two periods — a correct query aimed at the wrong end of the board, with the emptiest funnel on top.",
        },
      ],
      distractors: ["WHEN", "'shipped'", "c.id = c.id", "ASC"],
      walkthrough:
        "One fold, four lenses, one denominator. The join attaches every period to its reader's market, GROUP BY region folds 103 rows into four markets, and each SUM(CASE …) arm turns a stage into a 0/1 flag before folding: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — and the arms reconcile by construction, 24+12+6+3 = 45, all four markets summing to 103. The pivot's whole point is that the columns share one scan and one denominator, so a regional lead can read the US's odd profile — only 5 finished against 10 in-flight — without four queries drifting apart. LATAM's zero arms are the honesty check: an ELSE 0 arm prints 0 for a stage with no rows, it never vanishes. The distractors damage different promises: a bare WHEN is ungrammatical outside CASE, 'shipped' re-prints the in-flight column under the backlog name, the degenerate edge inflates every arm sixteen-fold, and ASC inverts the reading order. This is the pivot shape behind every stage-by-market slide the community pod ships.",
    },
    {
      id: "cs-goodreads-4",
      tier: "medium",
      topic: "x3",
      universe: "catalog",
      title: "The band stack with a total",
      brief:
        "Goodreads-flavored brief on the storefront db: the catalog review's edition-band card splits the shelf into mass-market and premium — and wants a grand TOTAL row underneath, in one query, no spreadsheet math. Probed figures: the 251 shelf events carry 498 books; the band fold at unit_price 55 reads mass-market 133 lines / 268 books (average line price 31.01) and premium 118 lines / 230 books (115.85). The TOTAL row must scan the unfiltered shelf — 251 lines, 498 books, the 34,833.28 book — so the card shows the split against the whole shelf without a second query.",
      ask: "Return lines and books per band, plus a labelled TOTAL row for the whole shelf, biggest book count first.",
      template:
        "SELECT CASE WHEN oi.unit_price < 55 THEN 'mass-market' ELSE 'premium' END AS band,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS books\nFROM order_items oi\nGROUP BY band\nUNION ALL\nSELECT {1}, {2}, SUM(quantity)\nFROM order_items\nORDER BY books {3};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The stack's third row must announce itself — TOTAL — or the card reads three bands. Any other literal ('ALL', '') relabels the grand total into a fake category, and the split against the whole shelf becomes a three-way split nobody asked for.",
        },
        {
          answer: "251",
          kind: "number",
          label: "the whole-shelf line count",
          why: "The TOTAL branch re-scans the unfiltered shelf: 251 lines — the detail rows carry 133 + 118. Pinning 251 keeps the row honest against the fold; 498 would put books in the lines column, 133 would shrink the total to one band's worth.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-books-first order",
          why: "The card reads TOTAL 498 on top, then mass-market 268, then premium 230 — the split under the whole. ASC floats premium to the top and the total disappears off the bottom of the card.",
        },
      ],
      distractors: ["'ALL'", "498", "133", "ASC"],
      walkthrough:
        "Two branches, one stack. The detail branch folds the 251 shelf events by band — the CASE at unit_price 55 splits mass-market (133 lines, 268 books) from premium (118 lines, 230 books) — and the TOTAL branch re-scans the unfiltered order_items for 251 lines and 498 books. UNION ALL concatenates the branches without a dedupe pass: every row in this stack belongs, so a distinct sort would be paid work that could only ever hide a future duplicate. The outer ORDER BY books DESC floats the TOTAL row (498) to the top with the split beneath it — the shelf against its parts, in one query. Reconciliation is the point: 133 + 118 = 251 lines and 268 + 230 = 498 books, so the card foots by construction. The distractors damage different promises: 'ALL' rebrands the grand total into a fake band, 498 puts books in the lines column and 133 shrinks the total to a single band's worth, and ASC pushes the total off the bottom of the card. Every grand-total stack is the same shape: detail fold, unfiltered branch, UNION ALL, honest label.",
    },
    {
      id: "cs-goodreads-5",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The most-shelved ladder",
      brief:
        "Goodreads-flavored brief on the storefront db: the catalog pod publishes a most-shelved ladder for the community — every edition ranked by books shelved, ties sharing rungs per the board's published policy (shared rungs, gaps included). Probed figures: 498 books across 16 editions; the ladder runs Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38, then a 36-pair (Laptop Stand Aluminum, Wireless Mouse M3), Running Socks 33, 4K Webcam 31, a three-way tie at 30, Mechanical Keyboard 28 — and the cut shows eleven editions so the tie block's aftermath (rung 11) stays visible.",
      ask: "Return each edition with its books-shelved count and ladder rank under RANK semantics, busiest first, ties sharing a rung, top eleven editions.",
      template:
        "SELECT p.name,\n       SUM(oi.quantity) AS books,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS ladder\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id, p.name\nORDER BY ladder, books DESC, p.name\nLIMIT {3};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rungs rank function",
          why: "RANK gives the 36-pair rung 4 together and jumps to 6 for Running Socks; the 30-trio shares rung 8 and the ladder jumps to 11 — gaps included, the published policy. DENSE_RANK would stamp 5 and 9; ROW_NUMBER would split the ties arbitrarily and rank editions by scan order.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-shelved-first direction",
          why: "Rung 1 must be the 47-book Desk Mat, so the window sorts books descending. ASC crowns the three 21-book editions — a correct query answering the opposite question, with the quietest shelf on top.",
        },
        {
          answer: "11",
          kind: "number",
          noVerify: true,
          label: "the ladder cut",
          why: "LIMIT 11 shows ten named editions plus the rung-11 Keyboard — the row where RANK and DENSE_RANK finally disagree (11 versus 8). Cut at 10 and the 30-trio's aftermath is invisible; cut at 11 and the policy difference is on the page.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "10"],
      walkthrough:
        "A fold, a window, a public policy. The join attaches every shelf event to its edition, GROUP BY the edition folds 251 lines into 16 rows carrying 498 books, and RANK() OVER (ORDER BY SUM(oi.quantity) DESC) ranks the folded counts: 47 → 1, 46 → 2, 38 → 3, the 36-pair shares rung 4, 33 → 6, 31 → 7, the 30-trio shares rung 8, and the 28-book Keyboard lands on rung 11 — two gap-jumps printed honestly, because the tie blocks consumed rungs 4-5 and 8-10. This ladder is PUBLISHED, which is why tie semantics are a community policy and not a syntax pick: DENSE_RANK would compress the ladder to gapless tiers (the pair at 4, the trio at 7, the Keyboard at 8), and ROW_NUMBER would decide the 36-pair's order by query plan — a ranking decided by scan order, in public. The named secondary sorts (books DESC, then p.name) keep every run deterministic between runs. The cut matters as much as the function: LIMIT 11 keeps the disagreement visible, LIMIT 10 amputates exactly the row where the policy shows its work.",
    },
    {
      id: "cs-goodreads-6",
      tier: "hard",
      topic: "q1",
      universe: "growth",
      title: "The above-cadence gate",
      brief:
        "Goodreads-flavored brief on the storefront db: the community pod's targeting list wants the readers whose reading cadence beats the platform's own mean — the population the challenge-push emails and expansion perks go to. Probed figures: 103 periods across 16 readers, so the mean cadence is 6.4375 periods per reader; the gate clears exactly four readers — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 — while the fifth-largest ladder (5 periods) sits below the mean. The gate is computed, not hardcoded: the mean comes from a fold over the per-reader counts, so the list survives a data refresh.",
      ask: "Return each reader whose period count exceeds the community mean cadence, with their name and period count, busiest first.",
      template:
        "SELECT c.name AS reader,\n       COUNT(*) AS periods\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.customer_id {1} (\n  SELECT customer_id\n  FROM orders\n  GROUP BY customer_id\n  HAVING COUNT(*) {2} (\n    SELECT AVG({3}) FROM (\n      SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id\n    )\n  )\n)\nGROUP BY c.id, c.name\nORDER BY periods {4};",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the membership gate",
          why: "The outer query keeps only periods whose reader is in the above-mean set. NOT IN returns the twelve BELOW-mean readers — the exact complement; a bare = against a multi-row set is undefined behavior territory, and EXISTS here flips the read to per-row probing instead of set membership.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the beat-the-mean operator",
          why: "The ask is strictly above the mean. < selects the below-cadence twelve; = matches nobody, because no reader sits exactly at 6.4375 — an honest empty list, but not the targeting list the pod asked for.",
        },
        {
          answer: "cnt",
          kind: "keyword",
          label: "the fold column the mean reads",
          why: "AVG(cnt) averages the per-reader period counts — the 6.4375 platform mean. AVG(customer_id) averages id codes, a meaningless number wearing a mean's name; the derived table exposes only cnt, so the wrong column errors instead of lying.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first order",
          why: "The targeting list works top-down by cadence: Alice 24, Emma 17, Grace 14, Maya 13. ASC opens the outreach at the thirteenth-period reader and hands the perk queue to the wrong end of the ladder.",
        },
      ],
      distractors: ["NOT IN", "customer_id", "<", "ASC"],
      walkthrough:
        "A gate inside a gate. The innermost derived table folds 103 periods into 16 per-reader counts; AVG(cnt) over that fold is the platform mean, 6.4375 — computed, so the gate survives a refresh instead of hardcoding 6. The middle query keeps readers whose count beats that mean: exactly four ids clear it. The outer query joins those ids to names, folds their periods, and prints the targeting ladder — 24 / 17 / 14 / 13 — busiest first. The two-layer staging matters: the mean is a property of the fold, not of any single period row, so the comparison must happen where the fold exists (HAVING over the grouped subquery), and the outer SELECT works at reader grain with COUNT(*) after the membership filter. The distractors damage different promises: NOT IN serves the complement (the twelve below-mean readers), < re-targets the same twelve, averaging customer_id computes noise from id codes, and ASC reads the perk queue backwards. This is the nested-gate shape every 'above the community's cadence' screen escalates into — and the honest empty-case answer (a mean with no clearers returns nothing, by definition) is the follow-up the panel waits for.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-edition shelf revenue is the catalog pod's first chart — fold shelf events to edition grain and rank. This problem drills the exact fold the publisher-bench card re-cuts before every title buy." },
    { slug: "sales-analysis-i", why: "Edition revenue beside units shelved is how the catalog page gets defended — 11,130.25 across 3 titles is this problem's shape at db scale, units and spend side by side." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in catalog work — which editions carry at least N shelf events, which genres clear the review floor. This problem drills the group-level gate behind the most-shelved ladder." },
    { slug: "immediate-food-delivery-ii", why: "Share of shelf events stamped inside the promised window versus late — the reading-window SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Readers hitting the challenge bar is a conditional count against a floor — the 24/17/14/13 ladder is this problem's fold wearing a challenge badge." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period power reader is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "capital-gain-loss", why: "Shelf additions minus removals net out to the movement number the community board reads. This problem drills ordered buy/sell folds — the same add/drop algebra shelf movements use." },
    { slug: "game-play-analysis-i", why: "First touch per reader — the first shelf event — anchors every reading cohort Goodreads builds. MIN-over-window is the shape." },
    { slug: "combine-two-tables", why: "Readers LEFT JOINed to periods: the whitespace read. A reader with no period is an empty shelf, a period with no reader is corruption — choosing the join type is the business statement." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Readers who shelved genre A and B but skipped C — the shelf-pattern gate behind recommendation emails. Conditional population algebra, exactly this problem." },
    { slug: "basket-depth-aov", why: "Books per shelf event and spend per period — the 2.44-line, 338.19-average depth read. This problem is that pair at practice scale." },
    { slug: "repeat-purchase-rate", why: "Re-shelving rate — readers returning to a genre month over month — is the engagement metric the community pod manages weekly. This problem drills the repeat fold." },
    { slug: "rfm-segmentation", why: "Recency, frequency, monetary — the reader segments that defend the 63.5% concentration number to the board. This problem is the segmentation pass." },
    { slug: "cohort-retention-matrix", why: "Do January challengers still read in March? Cohort-offset retention over the month spine — LAG-free, offset arithmetic, exactly this problem." },
    { slug: "keep-latest-dedupe", why: "One work, several editions, one canonical row — the keep-latest metadata dedupe the catalog team runs against duplicate edition records." },
    { slug: "customers-who-bought-all-products", why: "Completionists who shelved every title in a set — relational division, the hardest population gate Goodreads asks for, and this problem's exact shape." },
    { slug: "ratings-histogram", why: "The average-rating histogram is the community's first chart — bucket folds with the zero-arm honesty this kit's band reads run on, drilled at practice scale." },
    { slug: "books-with-null-ratings", why: "Unrated editions are the histogram's gaps — COUNT(column) versus COUNT(*) decides whether they vanish silently. This problem drills the NULL policy the review-depth read ships with." },
    { slug: "confirmation-rate", why: "Reading-window confirmations arrive with gaps — COALESCE turns missing confirmations into an explicit rate instead of a silent NULL. The activation-funnel denominator drill." },
    { slug: "unpopular-books", why: "The never-shelved list is an anti-join with a confident zero on this db — all 16 editions appear somewhere, and proving the zero is the deliverable. This problem rehearses exactly that." },
    { slug: "sellers-with-no-sales", why: "Publishers with no shelf movement in a window — the catalog-health anti-join with a date filter, honest about empty result sets." },
    { slug: "customers-who-never-order", why: "Readers with zero periods are the empty-shelf whitespace list — LEFT JOIN + IS NULL or NOT EXISTS, the survival-rule drill behind every re-engagement calendar." },
    { slug: "trial-to-paid-funnel", why: "To-read backlog (14) into finished challenge months (52) — the shelf funnel's two ends, and the population-definition drill the panel grades." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share-of-base reads with an honest denominator — 50.5% over booked periods versus 63.4% over stamped, the challenge-completion question in miniature." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census at month grain — periods beside readers per spine month, the exact COUNT(*) versus COUNT(DISTINCT …) pairing this kit's reader census is built on." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 36-pair and the 30-trio on this shelf make shared rungs and gaps a public policy, and this problem is the vocabulary check." },
    { slug: "year-on-year-growth-rate", why: "The reading spine escalated twelve months — same LAG mechanics, NULL baseline and direction traps, at the offset the annual challenge recap reads." },
    { slug: "second-day-confirmation", why: "Day-2 retention over the event spine — do readers who open a window return the next day? The loop-health read behind the re-engagement calendar." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Lines carrying more books than the shelf average — the nested-gate shape (fold, then judge against a computed mean) the cadence targeting escalates into." },
    { slug: "managers-with-at-least-5-direct-reports", why: "A self-join for hierarchy plus a HAVING threshold — the group-level gate drill behind the thirteen-period challenge ladder." },
    { slug: "bank-account-summary-ii", why: "Statement rails in INTEGER cents — card versus wire legs, /100.0 dollar reads. The cents discipline the affiliate close runs on, drilled at practice scale." },
    { slug: "monthly-transactions-ii", why: "Per-month statement legs versus billed — the coverage census at month grain, the same fold the dunning run refreshes nightly." },
  ],
};
