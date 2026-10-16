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
    "Preparation strategy: the pools file carries no Goodreads section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: shelf-status funnels, two-grain reader censuses, rating histograms, tie-heavy challenge ladders, edition-band CASE logic, the month spine and the cents-safe statement book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:reading-year spine} the challenge board opens Monday with, the other rebuilds the {orange:publisher bench} the catalog pod defends before every title buy. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction and every shelf fold foot to the 498-book, 34,833.28 shelf.",
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
  ],
};
