// SoundCloud — Wave-11 (Task 102), media domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Creator-first audio SQL on an uploads-to-first-payout angle (distinct from spotify's streaming-incumbent
// listener-habit framing and audible's credit-bank catalog): the storefront db read as a creator monetization
// sandbox — customers are creator/listener accounts (region = market), orders are monetization periods
// (delivered = monetized & paid out 52, shipped = payout in flight with shipped_at as the payout stamp 30,
// pending = awaiting monetization 14, cancelled = demonetized/churned 7), order_items are track/engagement
// lines (quantity = plays or licensing units, unit_price = the per-unit rate), products = plan/tier SKUs
// (db category codes = SKU families; Audio is the crown at 11,744.01), suppliers = distributor/catalog
// partners, invoices = royalty statements, payments = settlement rails (card 16 / 37,364.00 self-serve vs
// wire 11 / 32,248.00 licensing), expenses = platform opex, ledger_entries = GL. Finance tables store
// INTEGER cents — the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price are REAL
// dollars. The payout clock maps created_at -> shipped_at (82 of 103 periods stamped, 2.98-day average,
// 2-4 spread) and the rate-card band fold (unit_price < 55: 268 units @ 31.01; >= 55: 230 units @ 115.85)
// onto promo-vs-premium play economics.
// Pool provenance: company-pools.md carries NO SoundCloud section (0 tagged rows) — all 10 topic slug sets
// and all 16 problems are theme-curated from the theme menu's sql rows (46 distinct slugs, zero
// topic/problem overlap); case topic families l8 + s4 carry no w*/d*/f* ids. Case briefs quote probed
// figures from scripts/company-facts.md (incl. the wave-8+9 canonicalized cells); both case fills and every
// distractor x slot combo were probe-verified against a readonly copy of db/custom.db before authoring.
// NOTE for the wave-11 registry wiring agent: id "soundcloud", domainId "media", name "SoundCloud",
// tagline "Creator-first audio: plays-to-payout funnels, Next Pro tiers, royalty rails", accent
// "text-amber-400" (text-red-400 is already double-held in media by youtube + netflix — avoid).

import type { CompanyKit } from "../types";

export const soundcloudKit: CompanyKit = {
  id: "soundcloud",
  domainId: "media",
  name: "SoundCloud",
  tagline: "Creator-first audio: plays-to-payout funnels, Next Pro tiers, royalty rails",
  accent: "text-amber-400",

  brief: [
    "**SoundCloud** is the creator-first audio platform — where a track goes from bedroom upload to chart, and where the money story is not listener subscriptions but **creator monetization**: Next Pro tiers, licensed plays, and the moment a creator's balance crosses into an actual payout. This kit maps the storefront db onto that world: the 16 customers rows are creator/listener accounts, the 103 orders are monetization periods worth 34,833.28, and the 251 order_items rows are track/engagement lines — quantity = plays or licensing units, unit_price = the per-unit rate. The status map is fixed: delivered = {emerald:monetized and paid} (52, 50.5%), shipped = {sky:payout in flight} (30, 29.1%), pending = awaiting monetization (14, 13.6%), cancelled = {rose:demonetized} (7, 6.8%).",
    "The data org runs three pods on the same period spine. The creator-funnel pod owns activation — upload to plays to first monetized period to first payout — and the payout clock: a period stamps shipped_at the day money actually moves, **82 of 103 periods** carry the stamp, averaging **2.98 days** with a 2–4 spread, while the 14 pending periods have none yet (a population definition, not a cleanup job). Monetization owns the rate card: 268 units ride sub-55 promo rates (31.01 average) against 230 on premium rates (115.85) — the licensing story in one CASE fold. Money sits one layer down: royalty statements and settlement legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — and concentration is the third story: **63.5%** of the book sits with accounts whose lifetime spend crosses 3,000 (71.2% above 2,000).",
    "Interview screens are census-then-denominator with a creator-economics accent. A typical loop opens with a **two-grain account census** — EU runs 45 periods from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do pending periods count in your payout base?'*), then into the engagement ladder where four accounts sit tied at 4 periods and rank semantics become a policy call about peer accounts. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) — the **1,193.86** July trough, the +1,158.21 jump into August, the -1,326.87 drop into November — and probe the first row's NULL. Candidates who state the stamp filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no SoundCloud section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: plays-ledger folds, two-grain account censuses, payout clocks, tie-heavy engagement ladders, rate-card CASE bands and the cents-safe royalty spine. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {amber:rate-card census} the monetization pod re-cuts weekly, the {rose:unremitted royalty register} finance reads at every close, the catalog crown fold, the engagement ladder with its four-way tie, the release-day manifest and the above-mean payout watchlist. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the funnel census. A creator-economics analyst opens the monetization dashboard before standup: did overnight payout stamps land, does any paid period lack an owner account, does the one-pass status census reconcile — 52 paid + 30 in flight + 14 pending + 7 demonetized = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the depth read: engagement lines per period against the **2.44** norm (498 plays-units across the 251 lines), and the payout clock against the **2.98-day** average — if stamp latency drifts, the monetization-review queue gets pulled before the morning revenue read ships.",
    "**11:30 —** Midday is the account read. The monetization pod wants the rate-card re-cut — **268 promo units at 31.01** against 230 premium units at 115.85; the growth lead wants the engagement ladder with the four-way tie at 4 periods handled honestly (shared rungs, named policy, the 24/17/14/13/5 ladder above it); a regional VP wants periods per account beside account counts ({sky:EU 45-from-8} versus {rose:US 19-from-2}). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the creator-summit argument*.",
    "**15:30 —** The afternoon tilts toward money. The royalty anti-join refreshes first — **6 unremitted statements worth 15,217.00** — before a single creator email goes out; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00 settled) and feeds the payout-run draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The rails split matters too: card legs (16, 37,364.00) carry self-serve Next Pro billing while wire legs (11, 32,248.00) carry licensing payouts. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Monetization book", what: "Total period value booked: 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the rate-card story — bulk promo plays at one end, a 1,088.44 licensing cycle at the other." },
    { name: "Paid-out rate", what: "Delivered ÷ ALL periods booked: 52 of 103 (50.5%). 'Did the creator actually get paid' is a status-filtered conditional count, and the denominator question is the whole interview." },
    { name: "Payout stamp rate", what: "Periods with shipped_at stamped ÷ all periods: 82 of 103 (79.6%). The stamp lands when money moves; the 14 pending are 'not yet', never a silent zero." },
    { name: "Payout clock", what: "Booking to money-moved (created_at → shipped_at) over stamped periods only: 2.98-day average, range 2–4; US 3.07, LATAM 3.5, EU 2.94, APAC 2.93. The population definition ships with the number — pending periods have no clock yet." },
    { name: "Engagement depth", what: "Lines ÷ periods: 251 engagement lines across 103 periods = 2.44, 498 plays-units, max 3 units on a line. A heavier release month shows up as more lines, not more periods." },
    { name: "Rate-card mix", what: "268 units on sub-55 promo rates (31.01 average line rate) against 230 units on premium rates (115.85). The promo-versus-licensing engine in one CASE fold — the first chart the monetization pod re-cuts each week." },
    { name: "Account concentration", what: "Share of the book from accounts spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The period ladder runs 24 / 17 / 14 / 13 / 5 with a four-way tie at 4 — one lost flagship account moves a quarter." },
    { name: "Royalty coverage", what: "Booked versus settled: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 unremitted worth 15,217.00 — on card 16 / 37,364.00 versus wire 11 / 32,248.00 rails, 28.4-day average settlement. The anti-join finance refreshes every close." },
  ],

  topics: [
    {
      name: "Plays-ledger folds",
      why: "Everything starts by folding the engagement ledger: plays per track, units per account, monetized value per period. SoundCloud screens warm up with GROUP BY folds at line grain, and the trap is grain — 251 lines, 498 plays-units and 103 periods are three different populations, and counting one while naming another is the classic fail.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "unique-orders-and-customers-per-month", "article-views-i", "ad-free-sessions", "average-selling-price", "ads-performance"],
    },
    {
      name: "Two-grain account censuses",
      why: "Accounts and periods are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded; the 5.6-versus-9.5 intensity ratio is what decides where creator-partnership effort lands next.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations", "activity-participants", "asian-population", "article-views-ii"],
    },
    {
      name: "Status-aware funnel counts",
      why: "The monetization funnel is fixed: paid-out, in-flight, pending, demonetized — 52, 30, 14, 7 of 103, reconciling by construction. Each stage is a conditional count over a status or timestamp; the trap is calling an in-flight period 'paid' — 30 versus 52 on this db — and the second trap is the denominator: pending stays in a conversion base and drops out of a payout-clock base.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i", "ads-funnel", "accepted-candidates-from-the-interviews", "immediate-food-delivery-ii"],
    },
    {
      name: "Payout clocks & stamp latency",
      why: "A period opens at created_at and shipped_at stamps the day money moves; 82 of 103 carry the stamp at a 2.98-day average with a 2–4 spread. julianday arithmetic over a stated population is the shape being graded — and the interviewer wants the 14 unstamped pendings excluded on purpose, not by accident, with the exclusion printed on the chart.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "game-play-analysis-iv"],
    },
    {
      name: "Engagement ladders & ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 periods each on this db, under a 24/17/14/13/5 ladder. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax; the LIMIT-1-OFFSET-1 habit breaks exactly here.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Rate-card bands with CASE",
      why: "Promo versus premium is CASE-classified: the band fold splits 251 lines into 268 sub-55 promo units (31.01 average line rate) and 230 premium units (115.85), and plan SKUs band the same way. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the rate card, and a reordered WHEN quietly re-bands the book.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "apples-and-oranges"],
    },
    {
      name: "Anti-joins for dormant surfaces",
      why: "Catalog hygiene is a real workflow: tracks that never drew a monetized line, accounts with no recent engagement, SKUs absent from a market's chart. The LEFT JOIN + IS NULL shape (and the NOT EXISTS twin) shows up as the 'find the dormant surface' question — with the honest caveat that on this db never-monetized accounts and never-played SKUs both return a confident zero, and proving that zero is part of the job.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "active-users"],
    },
    {
      name: "Set ops for stitched boards",
      why: "Creator-summit packets stack populations — promo under premium, this market beside that one — and EXCEPT answers 'which royalty statements never drew a settlement leg', the exact query behind the kit's second case. UNION dedups whole rows silently, which makes it a correctness question, not a style one: a board that loses a row without an error is a board nobody trusts.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "movie-rating", "all-the-matches-of-the-league"],
    },
    {
      name: "Nested gates & platform means",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, and the NOT IN variant carries a NULL-poison answer on top.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
    {
      name: "Cents-safe royalty reads",
      why: "Booked is not settled — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the creator world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away; the rails matter too — card legs self-serve Next Pro billing, wire legs carry licensing payouts, and 5 statements settle on both.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices", "balance-rollforward", "account-balance"],
    },
  ],

  theory: [
    {
      id: "soundcloud-t1",
      q: "Your payout report joins accounts to monetization periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A payout report joins periods to accounts: a period with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-monetized accounts — all 16 accounts appear in the period table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how dormant-account reports die in review.",
      tag: "joins",
    },
    {
      id: "soundcloud-t2",
      q: "The engagement ladder runs 24, 17, 14, 13, 5 periods, then FOUR accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 4, 4, 4, 4 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the summit's attention first. There is a second layer SoundCloud candidates get asked: the same tie problem shows up inside a running payout walk — SUM OVER (ORDER BY created_at) uses a default RANGE frame, so rows tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "soundcloud-t3",
      q: "The census shows 103 monetization periods and 16 accounts; EU shows 45 periods and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per monetization period, so an account with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and cadence, accounts measure installed base and coverage. The ratio — 5.6 periods per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether the creator business is broadening or concentrating, and the platform mean (6.44, with exactly four accounts above it) is the gate partnership targeting actually uses. The trap that catches candidates is a third grain: join order_items for engagement lines and COUNT(*) silently counts lines, not periods — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the same habit SoundCloud's own dashboards encode.",
      tag: "aggregation",
    },
    {
      id: "soundcloud-t4",
      q: "shipped_at is NULL until money actually moves. What is your payout-clock policy, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a clock, so the report measures booking-to-money for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 demonetized rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day payouts for periods that have not monetized, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a SoundCloud reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "soundcloud-t5",
      q: "The growth review wants booked value per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and demonetized rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to dollars. One more placement rule SoundCloud screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the demonetized share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one period, or about a market?",
      tag: "pipeline",
    },
    {
      id: "soundcloud-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.4375 periods per account, 6.44 rounded — exactly four accounts clear it, against a 338.19 average booking). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS account's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when an account's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "soundcloud-t7",
      q: "The payout trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the payout trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's periods, and month-end is exactly when payout stamps land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is payout discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "soundcloud-t8",
      q: "Finance says a royalty statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the diff: all statements EXCEPT statements that drew a settlement leg — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that diff — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 truncates tail cents the moment a group is not a whole multiple of 100. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the payout run does not ship.",
      tag: "quality",
    },
    {
      id: "soundcloud-t9",
      q: "The close packet stacks the royalty diff three ways — EXCEPT, INTERSECT, UNION. Walk me through which answers which question, and where the row-doubling lives.",
      a: "EXCEPT answers the close's real question — statements that drew no settlement leg — by keeping the first branch's rows absent from the second: all 28 statements EXCEPT the 22 leg-drawn ones leaves the 6 unremitted. INTERSECT keeps rows in both — the 22 legged statements — and it is the safe shape for the dual-rail census because INTERSECT's implicit DISTINCT folds duplicates: five statements settled on BOTH rails and the census reads 5, not a leg-multiplied 10. UNION stacks the populations and dedups whole rows silently, which is a correctness argument you must write down, and UNION ALL appends faithfully — on nested populations like 'all periods' stacked over 'stamped periods', that is 185 rows instead of 103. Direction matters too: legs-side EXCEPT statements-side is structurally empty, because every leg belongs to a statement.",
      tag: "setops",
    },
    {
      id: "soundcloud-t10",
      q: "The 08:15 funnel census must print paid, in-flight, pending and demonetized in one row that reconciles to 103. How do you build it, and what does the reconciliation actually prove?",
      a: "One scan, conditional aggregates: COUNT(*) FILTER (WHERE status = 'delivered') for paid, the same for 'shipped', 'pending' and 'cancelled', with COUNT(*) beside them as the denominator — one row, and 52 + 30 + 14 + 7 = 103 holds by construction because the statuses partition the table. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin; four sequential queries are four chances to drift on the WHERE clause and are banned at standup. The reconciliation is the deliverable: if the four branches stop summing to COUNT(*), a status value outside the map has landed — the identity is a data-quality tripwire, not a rounding note. The census shape also feeds every rate on the board, because each denominator question ('do pendings count?') is answered by pointing at one of the four columns.",
      tag: "groupby",
    },
    {
      id: "soundcloud-t11",
      q: "The engagement read joins periods to track lines to catalog SKUs. What grains does that chain multiply, and what does COUNT(*) count at the end?",
      a: "Customers joins orders at period grain — 103 rows — then order_items at line grain, which multiplies: 251 engagement lines carrying 498 plays/licensing units. COUNT(*) at the end of the chain counts LINES, not periods — the third grain nobody named — and SUM(oi.quantity) is a fourth number again. The two-grain habit keeps the read honest: COUNT(DISTINCT o.id) beside COUNT(*) prints periods and lines side by side, and the ratio (2.44 lines per period) is only meaningful once both grains are named. Fold choice follows grain: value per market wants period grain (orders.total), plays per track wants line grain folded per SKU — the Audio family folds to 51 lines, 97 units, 11,744.01. Saying 'one row per what?' at every stage is the habit the panel grades.",
      tag: "joins",
    },
    {
      id: "soundcloud-t12",
      q: "The engagement ladder is tie-heavy by construction. Beyond RANK versus DENSE_RANK, what does PARTITION BY buy, and what happens to peers under NTILE?",
      a: "PARTITION BY scopes the window to a population: PARTITION BY market ranks accounts inside a territory instead of platform-wide, so a 4-period account can top APAC while sitting mid-ladder globally — the partition key IS the population definition. RANK and DENSE_RANK keep peers together (shared rungs, gaps or not); NTILE buckets by position and can SPLIT a tie block across buckets — the four-way tie at 4 periods straddles two quartiles on this db — which silently separates peer accounts the business treats as equals. The policy answer: peers stay together (RANK family) or an explicitly named tie-breaker (created_at, then id) — and ROW_NUMBER with a tie-breaker is also the keep-latest dedupe shape for reposted tracks. Whoever picks a window function without stating the tie policy has picked arbitrarily and will defend it in review.",
      tag: "windows",
    },
    {
      id: "soundcloud-t13",
      q: "Monetization-review outcomes arrive with gaps — some periods were never reviewed. What is your NULL policy when the review-rate report ships, and how do you test for missing values?",
      a: "Policy first: the report states whether unreviewed periods are kept as a named arm (COALESCE(review_outcome, 'unreviewed') bucketed explicitly) or excluded with the exclusion printed — never silently folded into a rate that then overstates it. Mechanics people fail: outcome = NULL is UNKNOWN even when the value IS NULL — the only honest test is IS NULL / IS NOT NULL, and filtering outcome = NULL quietly empties the arm. COALESCE is for naming gaps, not laundering them: COALESCE(shipped_at, 0) invents same-day payouts for periods that never monetized, while COALESCE(review_outcome, 'unreviewed') names a real population. The line between inventing a value and naming a gap is the answer the panel wants, because the 2.98-day payout clock dies the day someone 'fixes' its NULLs to zero.",
      tag: "nulls",
    },
    {
      id: "soundcloud-t14",
      q: "The creator chart prints a top-N cut and two tracks tie exactly at the boundary. What prints without a tie-breaker, and what do you ship instead?",
      a: "ORDER BY plays alone leaves tied rows in engine-dependent order, so the boundary swaps between runs — the chart is unreproducible and the support ticket writes itself. The fix is a named tie-breaker: ORDER BY plays DESC, track_id ASC — stable, documented in the query comment as the tie policy, and then LIMIT cuts a deterministic prefix. LIMIT without ORDER BY is worse than either: it is a random sample wearing a leaderboard's clothes. On tie-heavy data — four accounts tied at 4 periods on this db — the tie-breaker is not styling; it is the difference between a chart the summit deck can rerun and one that shuffles on every refresh. The strong candidate names the tie policy before the panel asks.",
      tag: "pipeline",
    },
    {
      id: "soundcloud-t15",
      q: "The above-mean watchlist returned 16 accounts instead of 4. Diagnose it — what does the mean's grain have to do with anything?",
      a: "The mean was folded at the wrong grain. The platform mean of per-account period counts folds accounts FIRST — 103 periods over 16 accounts, 6.4375, four accounts clear it (24, 17, 14, 13). The broken version averaged over the wrong population — per-period grain reads 1.0 (or folds some other denominator), and suddenly every account clears the bar and the watchlist is the whole base. The fix is a CTE: fold per_account counts, compute the mean from THAT fold, then compare — WITH per_account AS (...), platform AS (SELECT AVG(periods) ...). The correlated and scalar shapes inherit the same grain trap plus the empty-inner behavior. Every version gets the same disclosure: what population the mean is over, and what its zero-row case does. Grain discipline is the whole interview here — one row per what, folded over whom.",
      tag: "subqueries",
    },
    {
      id: "soundcloud-t16",
      q: "The payout clock averages 2.98 days from created_at to shipped_at, but the report ALSO buckets periods by day. julianday or STRFTIME — which for which, and where does month-end bite?",
      a: "They answer different questions. julianday(shipped_at) - julianday(created_at) is a fractional-day duration — the 2.98 average and the 2–4 spread live there — and it is NULL exactly when the stamp is missing, which is the feature the 82-of-103 population filter relies on. STRFTIME shapes calendar keys: '%Y-%m' builds the 14-month period spine, '%Y-%m-%d' the daily view — 84 distinct days on this db — with zero-padding keeping the text sort chronological. Month-end bites the BETWEEN form: '2024-01-01' AND '2024-01-31' drops the last night's periods, because the end literal is a midnight, and payout stamps land exactly on that edge — the half-open window (>= start AND < next month) is the house rule. Durations use julianday; bucketing uses STRFTIME; the report that mixes them reports day-counts as durations.",
      tag: "dates",
    },
    {
      id: "soundcloud-t17",
      q: "The rate card says promo averages 31.01 and premium 115.85 — yet the premium arm carries fewer units. What kind of average is 31.01, and when does that distinction move money?",
      a: "31.01 and 115.85 are per-LINE averages — AVG(unit_price) over the 133 promo lines and 118 premium lines — not per-unit rates and not weighted by volume. The unit-weighted read folds differently: 268 promo units against 230 premium units changes the mix story ('promo carries the unit majority') without changing the rate card. The distinction moves money when the fold is the invoice: a per-unit settlement multiplies each line's rate by its quantity — SUM(quantity * unit_price) — while AVG(unit_price) would price every line equally and misbill multi-unit lines. Saying which average you computed, over which population, at which grain, is the difference between a rate card and a rounding argument; the catalog tops out at 199.99, so the premium arm is the top band, not a middle rung.",
      tag: "aggregation",
    },
    {
      id: "soundcloud-t18",
      q: "At close, the coverage census must read 21 exact / 1 partial / 6 none — with a void-but-settled statement (#11) and a paid-status statement with no legs (#28) both accounted for. How do the two error modes stay separate?",
      a: "Because they fail in opposite directions and need opposite queries. The anti-join — statements LEFT JOIN settlement legs kept on NULL leg id — catches #28: a 'paid' claim with zero legs, a status that lies. The join-side flip — a void status WITH legs (#11, 925.00) — never appears in that anti-join, because the leg exists; it needs its own scan settled-by-void-status. The census itself folds per statement: SUM(legs.amount_cents) compared to the claim's amount_cents per statement, in cents, classifies exact (65,612.00 both sides on this db), partial (#25, 4,000.00 of 6,148.00) and none. The rule underneath: status is a claim, payment rows are the ledger of record, and every reconciliation reads the ledger first and audits claims against it in both directions — one 'find bad statements' query cannot exist because the error space is two-sided.",
      tag: "quality",
    },
    {
      id: "soundcloud-t19",
      q: "Track titles arrive with trailing spaces and case drift, and the catalog join splits one track into two. Walk me through the hygiene pass, and the GROUP_CONCAT trap waiting on the other side.",
      a: "Titles are display strings, not keys — normalize before the join: TRIM strips the trailing space that makes 'Night Loop ' a different track, UPPER/LOWER collapses the case drift, and the pass logs how many rows it changed because a silent rewrite is a new anomaly. Re-count after normalizing: a count that drops proves the split healed; a count that stays two means real characters differ (a version tag, a feat. credit), not case. The GROUP_CONCAT trap on the other side: the default separator is a bare comma, and titles contain commas — 'Keys, Pt. 2' — so the daily release manifest must use a named separator, GROUP_CONCAT(title, ' | '), or the folded cell becomes unparseable exactly when the ingest check needs it. Long-term the fix is a track id, not name matching; LIKE scans with leading wildcards are one-time tools, and they also cannot use an index.",
      tag: "strings",
    },
    {
      id: "soundcloud-t20",
      q: "A creator's track was reposted and re-logged — the engagement ledger holds stale rows. How do you keep one row per track, and why is the default window frame part of the answer?",
      a: "ROW_NUMBER over a per-track partition ordered by recency DESC, keep rn = 1 — ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at DESC, id DESC) — deterministic once the tie-breaker is named. GROUP BY with MAX(created_at) gets the newest timestamp but cannot carry the rest of that row honestly; the window does it in one pass. The frame lesson rides along: aggregates over ORDER BY windows default to RANGE, and RANGE includes peers — two lines logged at the same second enter a running sum together, which is exactly when you switch to ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk. The dedupe discipline: state what 'latest' means and what happens to ties — a policy you wrote, not an accident you shipped.",
      tag: "windows",
    },
    {
      id: "soundcloud-t21",
      q: "Growth wants markets with at least ten periods AND at least five accounts, and rate bands with at least 125 lines. Where do each of those floors live, and why?",
      a: "All three are group-level facts, so all live in HAVING after GROUP BY: HAVING COUNT(*) >= 10 AND COUNT(DISTINCT customer_id) >= 5 for the two-grain market floor — periods and accounts are different grains judged on the same groups — and HAVING COUNT(*) >= 125 for the rate-band line floor, which keeps the promo arm (133 lines) and drops the premium arm (118). WHERE cannot host any of them: aggregates do not exist before groups form, and the engine's rejection is the pipeline-order lesson itself. The two-grain floor is the escalation the interviewer wants — COUNT(*) and COUNT(DISTINCT customer_id) in one HAVING clause, because 'EU reads 45 periods from 8 accounts' is one group with two facts. A computed threshold (the 6.44 mean) needs a CTE or subquery instead — HAVING only sees literals and aggregates of the current grouping.",
      tag: "groupby",
    },
    {
      id: "soundcloud-t22",
      q: "The unremitted register has two shapes — NOT IN over settlement invoice_ids, and NOT EXISTS. Make the case for the one the close uses.",
      a: "The close uses NOT EXISTS, and the case is three lines. One: NOT IN materializes the subquery list and compares under three-valued logic — one NULL invoice_id in the list makes every comparison UNKNOWN and the register empties while looking valid. Two: NOT EXISTS short-circuits on the first match, never materializes the list, and treats NULL legs as what they are — matches for nothing. Three: it composes with the correlation the register needs (legs for THIS statement) without the per-row trap. The honest caveat the interviewer wants: on this clean core db, invoice_id carries no NULLs, so NOT IN happens to return the same 6 statements worth 15,217.00 — 'happens to' is the operative phrase, because staging tables are exactly where NULLs sneak in, and empty registers ship from staging. IN for short literal lists, EXISTS for existence, NOT IN only over a visibly NULL-guarded column.",
      tag: "subqueries",
    },
    {
      id: "soundcloud-t23",
      q: "The payout calendar wants next month's booked value on each spine row, not last month's. LEAD versus LAG — what changes, and which row goes NULL?",
      a: "LAG(booked) OVER (ORDER BY month) looks backward — the delta reads current minus prior and the FIRST row (2024-01) prints NULL: no prior, the baseline. LEAD looks forward: each month carries next month's booked value, the forecast-facing shape for the payout calendar, and now the LAST row (2025-02) prints NULL — no forward month. Same partition, same order, opposite edge; the discipline is shipping the edge NULL as NULL with a label ('baseline' / 'no forward month'), never coalescing to zero, which invents a flat month at exactly the edge the reader's eye lands on. The spine's story stays the same either way — open 3,731.97, July trough 1,193.86, +1,158.21 into August, the -1,326.87 November drop — only the direction of the walk and the NULL edge change.",
      tag: "dates",
    },
    {
      id: "soundcloud-t24",
      q: "The payout run ships only when the ledger trial balance reads 181,080 against 181,080. Say the check out loud, and the cents rule it stands on.",
      a: "The check: SUM(debit_cents) and SUM(credit_cents) over ledger_entries must return equal integers — 181,080 dollars — and the query prints both sums plus their delta; delta zero ships, anything else blocks the payout run. The cents rule: finance tables store INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 forces real division before ROUND, because integer division truncates the tail cents off any odd-cent group and ROUND cannot recover them afterward. Compare in cents, not dollars, so no rounding noise can flip the identity. It is the same claim-versus-ledger culture as the royalty census — 21 exact / 1 partial / 6 none, card 16 / 37,364.00 versus wire 11 / 32,248.00 on the rails — one layer down at the GL, where the identity itself is the artifact.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "soundcloud-mcq-1",
      prompt: "A monetization period's status reads 'shipped'. In this kit's SoundCloud stage map, what happened?",
      choices: ["Payout in flight — the stamp shipped_at has landed", "Monetized and paid — the period completed its payout", "Demonetized — the creator left the program", "Still awaiting monetization review"],
      answer: 0,
      why: "The stage map is fixed: shipped = payout in flight (30 of 103 periods), with shipped_at as the money-moved stamp. It is stamped and running — but not a completed paid period.",
      notes: [
        { choice: 1, why: "Monetized-and-paid is 'delivered' — 52 periods. Calling in-flight payouts completed inflates the paid base before a single settlement lands." },
        { choice: 3, why: "Pending is 'awaiting monetization' — 14 periods with no shipped_at yet. Pending is not in-flight and not churn; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-2",
      prompt: "The payout clock measures stamped periods only. The db holds 82 stamped, 14 pending and 7 demonetized of 103 booked. What is the stamped share, and over which population?",
      choices: ["82/89 = 92.1% — stamped over stamped-plus-demonetized", "82/103 = 79.6% — stamped over ALL periods booked", "52/82 — paid-out over stamped", "82/16 = 512.5% — stamped over accounts"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods booked — the 14 pending stay in the denominator because 'not yet stamped' is exactly what the clock exists to watch. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the share to 92.1% by deleting the population the clock exists to watch — the periods that monetize next." },
        { choice: 2, why: "52/82 mixes two funnel steps into one ratio — delivered is payout completion, shipped_at is the money-moved stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-3",
      prompt: "EU carries 45 monetization periods from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 periods per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-4",
      prompt: "The market board's demonetized share must read APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. Which expression is safe?",
      choices: ["100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)", "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100.0", "ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1)", "100 * SUM(status = 'cancelled') / COUNT(*)"],
      answer: 0,
      why: "SUM of 0/1 flags over COUNT is integer arithmetic, so the 100.0 multiplier must force real division BEFORE any truncation. With it, APAC reads 8.1; without it the share truncates toward zero.",
      notes: [
        { choice: 1, why: "This computes SUM/COUNT first — integer division truncates 0.081 to 0, then scales. Every market prints 0, including APAC's 8.1." },
        { choice: 2, why: "No 100.0 multiplier means the output is a fraction — APAC rounds to 0.1, not 8.1. Right idea, wrong scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-5",
      prompt: "The rate-card census prints the premium arm as lines = 118 and units = 230. What does 230 count?",
      choices: ["Engagement lines in the premium arm", "Plays or licensing units carried by those lines", "Distinct tracks in the premium arm", "Distinct accounts with a premium line"],
      answer: 1,
      why: "SUM(quantity) folds the per-line play/licensing counts — 230 units across 118 premium lines, against 268 units across 133 promo lines, 498 overall. Lines and units are two grains of the same arm.",
      notes: [
        { choice: 0, why: "Lines is the COUNT(*) column — 118 in the premium arm. Reading units as lines overstates engagement depth by folding multi-unit lines into one." },
        { choice: 2, why: "Distinct tracks would need COUNT(DISTINCT product_id) and is a third grain — the census is lines AND units, not catalog SKUs." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 periods, then FOUR accounts tie at 4. Under RANK, what rank do the two 3-period accounts carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period accounts share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The summit board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the stamp filter still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending periods double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-filter version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-8",
      prompt: "The unremitted register runs all statements EXCEPT statements that drew a settlement leg. The void statement #11 HAS a leg (925.00) and the paid-status #28 has none. Where does each land?",
      choices: ["#11 lands in the register (void = unremitted); #28 does not (paid)", "#11 folds out — it drew a leg; #28 lands in the register despite its paid status", "Both land in the register", "The query errors — EXCEPT cannot compare against a joined branch"],
      answer: 1,
      why: "The register is no-legs, not unpaid-status: the EXCEPT removes every statement that drew a leg, so void-but-settled #11 folds out by construction, and the paid-status #28 (1,756.00) stays — the claim that lies is exactly what the diff catches.",
      notes: [
        { choice: 0, why: "Status is a claim, legs are the ledger of record. Reading void as unremitted re-labels a settled statement and hides the real anomaly." },
        { choice: 3, why: "EXCEPT happily compares any two SELECTs with matching column lists — a join inside the second branch is ordinary SQL, not an error." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-9",
      prompt: "A summit packet stacks 'all 103 periods' and 'the 82 stamped periods' with UNION ALL into one census chart. A reviewer says the totals doubled. Diagnosis?",
      choices: ["UNION ALL is a performance choice — the results would be identical", "The branches overlap — the 82 stamped periods appear in BOTH branches; UNION ALL appends without deduping, so the stacked census reads 185", "UNION ALL caps the stack at 103 rows", "The ORDER BY broke the stack alignment"],
      answer: 1,
      why: "The two branches are nested populations, not disjoint ones: every stamped period lives in both. UNION ALL appends faithfully, so the stacked total is 103 + 82 = 185. Disjoint branches (or UNION's dedup) are the correctness argument — state which one you are relying on.",
      notes: [
        { choice: 0, why: "UNION dedups whole rows; UNION ALL does not. On nested populations the difference is 82 phantom rows, not microseconds." },
        { choice: 2, why: "UNION ALL has no row cap. The inflation comes from overlap, which no engine will warn you about." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-10",
      prompt: "A dashboard walks the book period by period: SUM(total) OVER (ORDER BY created_at). Two periods share a created_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-11",
      prompt: "The catalog fold prices every engagement line by its SKU family. Which family tops the line-value ladder?",
      choices: ["Accessories — the line-count crown wins", "Audio — 51 lines carrying 97 units at 11,744.01 line value", "Video — the platform's namesake leads", "Electronics — the most units means the most value"],
      answer: 1,
      why: "SUM(quantity * unit_price) folds Audio to 11,744.01 — the crown the monetization pod quotes first, against Wearables 6,929.12, Video 5,198.41 and Electronics 4,818.61. Line count (Accessories' 62) and unit count are different ladders entirely.",
      notes: [
        { choice: 0, why: "Accessories leads LINES (62) and UNITS (121) but not value — its per-unit rates are the lowest on the card. Three ladders, three leaders." },
        { choice: 3, why: "Value is rate × units, not units alone — Audio wins on rate concentration, which is exactly the licensing story." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-12",
      prompt: "The settlement rails read card 16 legs / 37,364.00 versus wire 11 legs / 32,248.00. Which rail carries the licensing payouts?",
      choices: ["Card — the bigger leg count means the bigger money", "Wire — 11 legs carrying 32,248.00, while card legs are self-serve Next Pro billing", "Neither — both rails split every payout 50/50", "The rail with the higher average leg size — that is licensing by definition"],
      answer: 1,
      why: "The rails split by business line: card legs (16, 37,364.00) carry self-serve Next Pro billing, wire legs (11, 32,248.00) carry licensing payouts — and 5 statements settle on both rails, which is why the dual-rail census is its own query.",
      notes: [
        { choice: 0, why: "Leg count measures transaction volume, not business line. Card is bigger by count AND total — but it is the self-serve rail." },
        { choice: 3, why: "Average leg size is a hint, not a definition — the method column is the only honest classifier." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-13",
      prompt: "The daily view buckets the 103 monetization periods by STRFTIME('%Y-%m-%d', created_at). How many buckets print?",
      choices: ["103 — one per period", "84 — several periods share a booking day", "31 — one per day of the month", "14 — one per spine month"],
      answer: 1,
      why: "The 103 periods land on 84 distinct calendar days — the daily view compresses, and the compression is the point: bursty release days are the creator-monetization rhythm the manifest census reads.",
      notes: [
        { choice: 0, why: "That is period count, not day count — the bucket key is the DAY, and days repeat. Bucket count is a reconciliation check, like the spine's 14." },
        { choice: 2, why: "The spine spans 14 months, not one — 31 is a month's day count wearing the wrong scope." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-14",
      prompt: "The ledger holds 251 lines carrying 498 plays-units. Which fold reads plays per line (≈1.98) without integer truncation?",
      choices: ["SUM(quantity) / COUNT(*)", "1.0 * SUM(quantity) / COUNT(*)", "AVG(quantity) — same thing, cleaner", "ROUND(SUM(quantity) / COUNT(*), 2)"],
      answer: 1,
      why: "SUM of INTEGER quantities over COUNT is integer division — 498/251 truncates to 1 before any rounding. The 1.0 multiplier (or an AVG, which SQLite computes as a float) forces real division: 1.984 → 1.98.",
      notes: [
        { choice: 0, why: "Truncates to 1 — and 1.00 reads as 'every line carries exactly one play', which quietly falsifies the depth story." },
        { choice: 3, why: "ROUND cannot recover the digits integer division already threw away — it rounds the truncated 1 to 1.0." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-15",
      prompt: "On the 14-month period spine, which month prints the steepest month-over-month drop?",
      choices: ["July — the 1,193.86 trough is the lowest booking", "November — booked 1,648.80 against October's 2,975.67, a -1,326.87 delta", "August — it follows the July trough", "January 2025 — the year boundary resets the walk"],
      answer: 1,
      why: "The trough and the drop are different facts: July is the lowest LEVEL (1,193.86) but November's -1,326.87 is the biggest MOVE. The spine reports both, and the payout calendar reads the deltas, not the levels.",
      notes: [
        { choice: 0, why: "Lowest level ≠ steepest move — July's own delta was -853.57. Conflating level with delta mislabels the calendar's worst month." },
        { choice: 3, why: "January 2025's delta is -431.97 — real but mid-pack. Year boundaries do not reset a continuous LAG walk." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-16",
      prompt: "The release-day manifest folds each day's track titles into one cell — and several titles contain commas. Which expression survives?",
      choices: ["GROUP_CONCAT(title)", "GROUP_CONCAT(title, ' | ')", "CONCAT(title, ' | ')", "GROUP_CONCAT(DISTINCT title) ORDER BY title"],
      answer: 1,
      why: "The named separator makes the folded cell parseable even when titles carry commas ('Keys, Pt. 2'); the bare-comma default makes the manifest ambiguous exactly when the ingest check needs it. GROUP_CONCAT's optional second argument IS the separator.",
      notes: [
        { choice: 0, why: "Runs, but 'Night Loop, Keys, Pt. 2' reads as three tracks — the manifest undercounts releases on comma-heavy days." },
        { choice: 2, why: "CONCAT joins a fixed argument list — it cannot fold a variable number of rows. Wrong function family." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-17",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5, then four accounts tied at 4. Under DENSE_RANK, what rank do the two 3-period accounts carry?",
      choices: ["10", "7", "6", "9"],
      answer: 1,
      why: "DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count lands on 7. The RANK answer is 10 — same tie, different policy about phantom positions below it.",
      notes: [
        { choice: 0, why: "10 is RANK semantics — gaps included. Publishing DENSE_RANK numbers on a RANK board shifts every account below the tie." },
        { choice: 2, why: "6 is the tie block's rung, not the next rung handed out — the 3s sit on 7 once the block consumes 6." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-18",
      prompt: "How many royalty statements settled on BOTH rails — card and wire?",
      choices: ["5 — found with INTERSECT of the card-settled and wire-settled statement sets", "27 — every settlement leg is on some rail", "0 — a statement settles on exactly one rail", "16 — the card rail's leg count, coincidentally"],
      answer: 0,
      why: "INTERSECT (or GROUP BY invoice_id HAVING COUNT(DISTINCT method) = 2) returns 5 — the statements whose legs span both rails. It matters for the dunning logic: a partial settlement can hide on the other rail.",
      notes: [
        { choice: 1, why: "27 is the LEG count; statements are the grain of the census — legs are the lines that compose them." },
        { choice: 2, why: "Assuming single-rail settlement is exactly the assumption the 5 breaks — and partial-coverage anomalies live precisely at that seam." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-19",
      prompt: "Which rate band clears a HAVING COUNT(*) >= 125 line floor?",
      choices: ["Both — promo 133 and premium 118 both clear", "Promo only — 133 lines against the premium arm's 118", "Premium only — the value arm is the deep one", "Neither — both arms sit below 125"],
      answer: 1,
      why: "The promo arm (sub-55 rates) folds to 133 lines; premium to 118. The floor is a group-level fact — it lives in HAVING after the CASE bands the lines, and it splits the card into a deep promo arm and a rich premium arm.",
      notes: [
        { choice: 0, why: "118 < 125 — the premium arm drops. The floor's whole point is the split; rounding both to 'about 125' erases it." },
        { choice: 2, why: "The premium arm is the VALUE arm (115.85 average), not the deep one — line count and value are different ladders, and this floor is on count." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-20",
      prompt: "A reposted track left stale engagement lines. Keep exactly one row per track — the latest. Which shape?",
      choices: ["GROUP BY product_id with MAX(created_at)", "ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at DESC, id DESC) = 1", "DISTINCT on the track id", "TOP 1 per track via LIMIT"],
      answer: 1,
      why: "ROW_NUMBER numbers rows inside each track partition; = 1 keeps the newest line per track, deterministic once the id tie-breaker is named. MAX(created_at) gets the timestamp but cannot carry the rest of that row honestly.",
      notes: [
        { choice: 0, why: "Right timestamp, wrong row — every other column in the group comes from an arbitrary member. Joining MAX back is the two-step the window does in one pass." },
        { choice: 2, why: "DISTINCT dedups whole rows — two lines differing in any column both survive. The stale rows stay." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-21",
      prompt: "A January cut uses BETWEEN '2024-01-01' AND '2024-01-31' on created_at. Which periods can it silently drop?",
      choices: ["None — BETWEEN is inclusive", "Periods booked on the last night whose timestamps land after '2024-01-31 00:00:00' — the half-open window (>= start AND < next month) is the safe cut", "The month's first periods — BETWEEN excludes the lower edge", "Only pending periods, which book late"],
      answer: 1,
      why: "The end literal is a midnight, not a day — January 31st's later timestamps fall outside. And month-end is exactly when payout stamps land, so the dropped rows are the interesting ones. Half-open windows are the house rule.",
      notes: [
        { choice: 0, why: "Inclusivity is not the issue — TEXT comparison granularity is. '2024-01-31' means '2024-01-31 00:00:00'." },
        { choice: 3, why: "Pending is a status, not a timing artifact — the drop hits any period booked late on the last night, regardless of status." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-22",
      prompt: "Monetization-review outcomes have gaps — unreviewed periods. Which COALESCE use names the gap honestly?",
      choices: ["COALESCE(shipped_at, 0) so the payout clock never NULLs", "COALESCE(review_outcome, 'unreviewed') as an explicit bucket in the census", "COALESCE(periods, 0) to zero out missing counts", "No COALESCE — gaps must error loudly"],
      answer: 1,
      why: "Bucketing the gap under an explicit 'unreviewed' arm names a real population; the census then reads reviewed / unreviewed / missing with denominators intact. COALESCE for naming, never for laundering.",
      notes: [
        { choice: 0, why: "That invents same-day payouts for periods that never monetized — the 2.98-day clock dies the moment its NULLs become zeros." },
        { choice: 3, why: "Errors are not the goal — honest populations are. An explicit arm plus a printed exclusion IS the loud version." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-23",
      prompt: "The dormant-account anti-join — accounts LEFT JOIN periods kept on NULL period id — returns ZERO rows. What is the honest read?",
      choices: ["The query is broken — dormant accounts always exist", "A confident zero: all 16 accounts appear in the period table somewhere — and proving that zero is part of the job", "The join should have been INNER", "Zero means the table is empty"],
      answer: 1,
      why: "On this db every account drew at least one period, so the whitespace list is genuinely empty — and the proof (16 distinct customer_ids in periods) ships WITH the zero. A confident zero you did not verify is how dormant-account reports die in review.",
      notes: [
        { choice: 0, why: "Dormancy is data-dependent, not structural. The zero is the answer here — but only after the count that proves it." },
        { choice: 2, why: "INNER would also return zero rows-by-construction — it deletes the very rows the anti-join keeps, which is circular, not a fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "soundcloud-mcq-24",
      prompt: "The above-mean watchlist returns ALL 16 accounts instead of 4. What happened?",
      choices: ["The HAVING moved to WHERE", "The mean folded at period grain (≈1.0 per row) instead of account grain (103/16 = 6.44) — every account clears the wrong bar", "The comparison is >= instead of >", "The CTE was deduplicated by UNION"],
      answer: 1,
      why: "The platform mean of PER-ACCOUNT counts folds accounts first: 6.4375, four accounts clear it. A mean computed over the wrong population — per-period grain reads ~1 — admits the whole base. The fix is a CTE that folds per_account, then averages THAT.",
      notes: [
        { choice: 0, why: "WHERE with COUNT errors outright — that bug announces itself. The silent one is the population inside the average." },
        { choice: 2, why: ">= versus > shifts the bar by epsilon — it cannot turn 4 accounts into 16. Wrong grain, wrong world." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-25",
      prompt: "A staging report runs WHERE total > (SELECT AVG(total) FROM orders WHERE region = 'LATAM' AND status = 'cancelled') and returns nothing — though LATAM books 2 periods. Why?",
      choices: ["The outer WHERE needs the same LATAM filter", "LATAM has zero cancelled periods, so the inner fold is empty, the scalar returns NULL, and total > NULL is UNKNOWN — every row drops silently", "SQLite caches the empty subquery as 0", "The report needs HAVING, not WHERE"],
      answer: 1,
      why: "The empty-inner-query bug, live: LATAM's 2 periods are both active, the cancelled-arm mean has no population, the scalar returns NULL instead of erroring, and UNKNOWN comparisons quietly empty the report. Name the population; handle the empty case on purpose.",
      notes: [
        { choice: 0, why: "Mirroring the filter changes the question. The bug is the inner fold's empty population, not a missing outer predicate." },
        { choice: 3, why: "HAVING filters groups; this is a row-level comparison. The clause is fine — the subquery's population is not." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-26",
      prompt: "SUM(total) OVER (PARTITION BY region) — no ORDER BY — sits beside each period row. What does the column mean?",
      choices: ["A running total within the market", "The market's full book repeated on every one of its rows — the whole-partition frame — ready as a share denominator", "The global 34,833.28 book on every row", "The market's average period value"],
      answer: 1,
      why: "Without ORDER BY the default frame is the whole partition — every US row carries the US book (19 periods' worth), every EU row the EU book — the denominator-safe shape for market shares. Adding ORDER BY silently turns it into a running sum.",
      notes: [
        { choice: 0, why: "Running semantics need ORDER BY and then a frame — the frame is part of the metric definition, not styling." },
        { choice: 3, why: "An average needs AVG or division; SUM over the partition is the book itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-27",
      prompt: "Which EXCEPT returns the unremitted royalty register — statements that drew no settlement leg?",
      choices: ["leg-set EXCEPT statements", "statements EXCEPT leg-joined statements", "statements UNION legs", "statements INTERSECT legs"],
      answer: 1,
      why: "EXCEPT keeps the first branch's rows absent from the second: all 28 statements minus the 22 that drew legs leaves the 6 unremitted — including paid-status #28, the claim that lies. The reversed direction is structurally empty because every leg belongs to a statement.",
      notes: [
        { choice: 0, why: "Nested populations are not symmetric: legs are a subset of statements' consequences, so reversed EXCEPT returns nothing — a clean report of nothing." },
        { choice: 3, why: "INTERSECT keeps rows in BOTH — the 22 legged statements, the opposite of the register." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-28",
      prompt: "The ladder runs 24, 17, 14, 13, 5, 4, 4, 4, 4, 3, 3, 2, 2, 2, 1, 1. Under NTILE(4) — 16 accounts, quartiles of 4 — what happens to the four-way tie at 4?",
      choices: ["All four land in the same quartile — NTILE keeps peers together", "The tie block SPLITS across two quartiles — position-based bucketing can separate peers, which is why the board uses the RANK family", "NTILE errors on tied values", "The tie block becomes one NULL bucket"],
      answer: 1,
      why: "NTILE assigns buckets by row POSITION, and ties occupy consecutive positions that straddle a bucket boundary — the 4s (rows 6–9) split across quartiles 2 and 3. Peer accounts the business treats as equals get separated, which is the argument for RANK-family reporting on tie-heavy ladders.",
      notes: [
        { choice: 0, why: "That is RANK/DENSE_RANK behavior. NTILE has no tie semantics at all — it counts rows, and the boundary falls where it falls." },
        { choice: 2, why: "Ties are ordinary input to NTILE — no error, which is exactly what makes the silent split dangerous." },
      ],
      difficulty: "hard",
    },
    {
      id: "soundcloud-mcq-29",
      prompt: "A census prices engagement lines. Which column is the per-line rate?",
      choices: ["products.price — the catalog list price", "order_items.unit_price — the rate stamped on each engagement line", "orders.total divided by line count", "AVG(quantity) — the rate is derived"],
      answer: 1,
      why: "The rate card lives at line grain: order_items.unit_price is what the line actually billed, while products.price is the catalog list that can drift from it. Every band fold (the sub-55 promo split) reads the line's stamped rate.",
      notes: [
        { choice: 0, why: "The catalog price is a claim; the line rate is the ledger. Banding on the catalog price re-bands the card whenever a list update lands." },
        { choice: 2, why: "total/count is a derived average, not a rate — it erases the per-line variation the promo/premium split exists to measure." },
      ],
      difficulty: "easy",
    },
    {
      id: "soundcloud-mcq-30",
      prompt: "Which market clears BOTH floors: at least ten periods AND at least five accounts? EU reads 45 periods from 8 accounts, US 19 from 2, APAC 37 from 5.",
      choices: ["EU and APAC", "US only", "APAC only", "All three"],
      answer: 2,
      why: "Both floors are group-level facts judged on the same groups: HAVING COUNT(*) >= 10 AND COUNT(DISTINCT customer_id) >= 5. EU passes periods (45) and accounts (8); APAC passes both (37, 5); US fails the account floor (2) despite 19 periods — two grains, one HAVING.",
      notes: [
        { choice: 0, why: "EU clears both floors — but the answer set is markets passing BOTH; US's failure doesn't drag EU out. Recheck each group against both predicates." },
        { choice: 1, why: "The US is the intensity crown (9.5 periods per account) but fails the five-account floor — intensity is not coverage, and this gate is on coverage." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-soundcloud-1",
      tier: "easy",
      topic: "l8",
      universe: "pricing",
      title: "The rate-card census",
      brief:
        "SoundCloud-flavored brief on the storefront db: Monday's monetization review opens with the rate-card census — how the engagement book splits between sub-55 promo rates and the 55-plus premium card, with line counts, units and average line rate per band on the slide. Probed facts: 251 engagement lines carry 498 plays-units across 103 monetization periods; the sub-55 arm folds to 268 units at a 31.01 average line rate, the 55-plus arm to 230 units at 115.85; the catalog tops out at 199.99, so no third band exists. The review reads the premium arm first.",
      ask: "Return each rate band with its line count, unit total and average line rate to 2 decimals, premium band first.",
      template:
        "SELECT CASE WHEN unit_price < {1} THEN 'promo' ELSE 'premium' END AS rate_band,\n       COUNT(*) AS lines,\n       SUM({2}) AS units,\n       ROUND(AVG({3}), {4}) AS avg_rate\nFROM order_items\nGROUP BY rate_band\nORDER BY avg_rate {5};",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the promo/premium edge",
          why: "unit_price < 55 is the promo/premium split the rate card is defended at — the sub-55 arm reads 268 units at 31.01, the 55-plus arm 230 at 115.85. Moving the edge re-bands the book: 50 pulls premium lines down into promo and both averages drift off the probed cells.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the unit fold",
          why: "SUM(quantity) folds plays and licensing units — 268 and 230 across the two arms, 498 overall. SUM(order_id) adds id codes into a census of nothing; SUM(1) returns line counts (133 and 118) wearing the units column's name.",
        },
        {
          answer: "unit_price",
          kind: "keyword",
          label: "the rate column",
          why: "AVG(unit_price) is the average line rate — 31.01 promo, 115.85 premium. AVG(quantity) averages play counts and prints a 2-ish nobody defends; the rate card is priced per unit, so the rate column is the only honest average.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rate-card cells print to 2 decimals — 31.01 and 115.85, matching the probed cells the review quotes. ROUND(…, 1) prints 31.0 and 115.9, and the census stops reconciling with the price list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the premium-first direction",
          why: "The review reads the premium arm on top: 230 units at 115.85, then promo at 268/31.01. ASC opens the meeting on the long tail — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["total", "order_id", "ASC", "1", "stock"],
      walkthrough:
        "One table, one CASE, four columns at one grain. The CASE bands every engagement line by its unit rate at the 55 edge, GROUP BY folds each arm, and the output reads premium first: 118 lines / 230 units / 115.85, then promo 133 lines / 268 units / 31.01 — footing to the 251 lines and 498 units the ledger reports. The 55 edge is the promo/premium boundary the monetization pod defends; the catalog tops out at 199.99, so the premium arm is the top band, not a middle rung. The distractors fail honestly: total and stock are not order_items columns, so both arms error; order_id in the unit fold adds row ids and prints a census of nothing; 1 in the unit fold prints line counts (133/118) under the units name while 1 in the rate column averages a constant; 1 in the precision slot truncates to one decimal; ASC flips the board to the long tail. The read underneath: promo carries the unit majority (268 of 498) while the value concentrates in the 115.85 arm — the licensing upside lives entirely on the premium card.",
    },
    {
      id: "cs-soundcloud-2",
      tier: "medium",
      topic: "s4",
      universe: "month-close",
      title: "The unremitted royalty register",
      brief:
        "SoundCloud-flavored brief on the storefront db: at every close, finance reconciles royalty statements against the settlement legs that actually paid them — status is a claim, payment rows are the ledger of record. Probed facts: 28 statements, 22 of which drew at least one leg; the diff leaves 6 unremitted — 5 open claims worth 13,461.00 (873.00, 1,295.00, 4,937.00, 3,562.00, 2,794.00) and 1 paid-status statement, #28 at 1,756.00, whose claim lies. The void-but-settled #11 (925.00) and the partially-settled #25 (4,000.00 of 6,148.00) both drew legs, so both fold OUT by construction. Statements carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each claim status with its statement count and owed total in dollars to 2 decimals, biggest exposure first.",
      template:
        "WITH unsettled AS (\n  SELECT id, status, amount_cents FROM invoices\n  {1}\n  SELECT i.id, i.status, i.amount_cents\n  FROM invoices i\n  JOIN payments p ON p.{2} = i.id\n)\nSELECT status,\n       COUNT(*) AS statements,\n       ROUND(SUM(amount_cents) / {3}, 2) AS owed_usd\nFROM unsettled\nGROUP BY status\nORDER BY statements {4};",
      slots: [
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the diff operator",
          why: "invoices EXCEPT leg-joined invoices keeps only statements that drew no settlement leg — the register's population. UNION folds the two branches back to all 28, INTERSECT keeps only the legged 22, and UNION ALL double-counts: three different registers wearing one column name.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the settlement key",
          why: "Legs join statements on p.invoice_id — the foreign key that says which claim a payment settles. p.id joins payment ids to statement ids, a wrong-grain coincidence that matches some rows by accident and empties the register of exactly the wrong statements.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 13,461.00 and 1,756.00. The .0 is policy, not decoration — the moment a group's cents are not a whole multiple of 100, bare 100 truncates the tail cents off every odd row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The close reads biggest exposure on top: open 5 statements owed 13,461.00, then the paid lie at 1,756.00. ASC opens the close on the single anomaly — a correct query aimed at the wrong end of the ledger.",
        },
      ],
      distractors: ["UNION", "INTERSECT", "UNION ALL", "id", "10", "1000"],
      walkthrough:
        "Two stages: diff the populations, then roll up by claim status. The CTE takes all 28 statements, EXCEPTs the 22 that drew legs (17 single-leg, 5 double-leg), and leaves 6 rows; the outer fold groups them by status and reads the cents through the /100.0 divider: open 5 / 13,461.00, paid 1 / 1,756.00 — footing to the probed dunning blocks exactly. The composition is the lesson: void-but-settled #11 (925.00) and partial #25 (4,000.00 of 6,148.00) both drew legs, so the EXCEPT removes them — the register is no-legs, not unpaid-status — and the one paid-status row it keeps (#28, 1,756.00) is precisely the claim that lies. The distractors each break differently: UNION and INTERSECT re-populate the register with legged statements (28 or 22 rows), UNION ALL double-counts both branches, p.id joins payment ids to statement ids and reshuffles the diff, and 10 or 1000 in the divider prints 134,610.00 or 1,346.10 — a register off by an order of magnitude. Rails context for the review: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) licensing, and 5 statements settle on both rails.",
    },
    {
      id: "cs-soundcloud-3",
      tier: "medium",
      topic: "j2",
      universe: "catalog",
      title: "The catalog crown fold",
      brief:
        "Monetization-review brief on the storefront db: the catalog read prices every engagement line by its SKU family — value concentrates where the licensing lives, and the deck opens on the crown. Probed facts: 251 lines, 498 units fold to seven families; Audio is the crown at 11,744.01 (51 lines, 97 units), then Wearables 6,929.12 (25/53), Video 5,198.41 (32/61), Electronics 4,818.61 (44/85), Accessories 3,294.29 (62/121), Apparel 1,984.93 (24/54) and Fitness 863.91 (13/27). Accessories leads lines AND units but not value — the per-unit rate is the ladder that decides the crown. The read is biggest line value first.",
      ask: "Return each SKU family with its line count, unit total and line value to 2 decimals, biggest line value first.",
      template:
        "SELECT p.category AS sku_family,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS line_value\nFROM order_items oi\nJOIN products p ON p.id = oi.{2}\nGROUP BY p.category\nORDER BY line_value {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value's precision",
          why: "Line values print to 2 decimals — 11,744.01, 6,929.12 — so the cells reconcile with the rate-card deck. ROUND(…, 1) prints 11,744.0 and the crown stops matching the slide finance quotes.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "Lines attach to SKUs through oi.product_id = p.id — the foreign key that names each line's family. oi.id joins line ids to SKU ids, a wrong-grain coincidence that matches some rows by accident and reshuffles every family's fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the crown-first direction",
          why: "The deck opens on Audio's 11,744.01 crown. ASC opens on Fitness (863.91) — a correct query aimed at the wrong end of the ladder, with the licensing story buried at row seven.",
        },
      ],
      distractors: ["supplier_id", "id", "ASC", "1"],
      walkthrough:
        "Join the ledger to the catalog, then fold per family. The join attaches every engagement line to its SKU through oi.product_id, GROUP BY category folds the seven families, and the output reads crown-first: Audio 51 lines / 97 units / 11,744.01, Wearables 25 / 53 / 6,929.12, Video 32 / 61 / 5,198.41, Electronics 44 / 85 / 4,818.61, Accessories 62 / 121 / 3,294.29, Apparel 24 / 54 / 1,984.93, Fitness 13 / 27 / 863.91 — footing to the 251 lines and 498 units the ledger reports. The composition is the lesson: Accessories wins lines AND units but sits fifth on value, because value is rate × units and the crown lives where per-unit rates concentrate — the licensing story in one fold. The chips each break differently: supplier_id is no order_items column and the query errors; id in the join key matches line numbers to SKU numbers and reshuffles every family; ASC opens on Fitness; 1 decimal rounds the crown to 11,744.0 and the deck's reconciliation dies.",
    },
    {
      id: "cs-soundcloud-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement ladder with its tie",
      brief:
        "Creator-summit brief on the storefront db: the engagement ladder ranks accounts by monetized periods, and the tie policy is published because ties are guaranteed. Probed facts: 16 accounts fold to a ladder of 24, 17, 14, 13, 5, then a FOUR-way tie at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), then two 3s, three 2s and two 1s. The board's published policy is RANK semantics — shared rungs, gaps after the tie block — so the two 3-period accounts share rank 10, and every account below reads against the phantom positions the gaps imply. The board reads the ladder top down.",
      ask: "Return each creator with period count and rung, biggest count first, ties sharing a rung with gaps after.",
      template:
        "SELECT c.name AS creator,\n       COUNT(o.id) AS periods,\n       {1}() OVER (ORDER BY COUNT(o.id) {2}) AS rung\nFROM customers c\nJOIN orders o ON o.{3} = c.id\nGROUP BY c.id\nORDER BY rung, periods DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the published tie policy",
          why: "RANK gives tied counts the same rung and then skips — the four-way tie consumes rungs 6–9 and the 3s land on 10, gaps included, exactly the board's published policy. DENSE_RANK shares rungs without gaps (the 3s read 7) and silently republishes the whole ladder.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-count-first direction",
          why: "The ladder reads 24 periods at rung 1 down to the 1s at the bottom. ASC hands the board the dormant tail first — a correct query aimed at the wrong end of the summit deck.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the account join key",
          why: "Periods attach to accounts through o.customer_id = c.id. o.id joins period ids to account ids — a wrong-grain coincidence that matches some rows by accident and builds a ladder of nothing that still renders.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "o.id"],
      walkthrough:
        "Fold, then window over the fold. The JOIN attaches each period to its account, GROUP BY c.id folds to one row per account (16 rows, 103 periods), and RANK() OVER (ORDER BY COUNT(o.id) DESC) numbers the ladder: 24, 17, 14, 13, 5, then the tie block — 4, 4, 4, 4 sharing rung 6 — then the two 3s sharing rung 10 and the 2s and 1s below. The tie block is the interview: RANK says four accounts share rung 6 and the next distinct count lands on 10 — three phantom rungs that do not exist — and the board's published policy accepts that, because 'who is really 7th' is a business question, not a syntax one. DENSE_RANK would republish the 3s as rung 7; ROW_NUMBER would split peers arbitrarily and hand one tied account the summit's attention by engine fiat. The chips each break differently: DENSE_RANK and ROW_NUMBER change the published numbers (7s everywhere, or arbitrary splits), ASC reads the tail first, and o.id joins period ids to account ids — a ladder of nothing that still renders. Same-tie frame discipline rides along: a running SUM over the ladder's ORDER BY would use RANGE and walk tied rows together.",
    },
    {
      id: "cs-soundcloud-5",
      tier: "easy",
      topic: "x1",
      universe: "inventory",
      title: "The release-day manifest",
      brief:
        "Ingest-health brief on the storefront db: every morning the catalog pod reads the release-day manifest — for the first few monetized days, which tracks drew lines, folded into one cell per day. Probed facts: the 103 periods land on 84 distinct days; the first delivered day, 2024-01-01, folds to 4 distinct tracks (Studio Desktop Mic, Mechanical Keyboard K1, Desk Mat Extended, Wireless Mouse M3); 2024-01-15 folds to 2 (Ring Light 14, Noise-Canceling Headset). Titles carry commas, so the manifest uses a named separator — the bare-comma default makes 'Keys, Pt. 2' read as two tracks. The manifest reads chronologically and cuts to the first 5 days.",
      ask: "Return the first 5 delivered days, each with its distinct-track count and a pipe-separated title manifest, in date order.",
      template:
        "SELECT STRFTIME('%Y-%m-%d', o.created_at) AS release_day,\n       COUNT(DISTINCT oi.product_id) AS tracks,\n       GROUP_CONCAT(DISTINCT p.{1}) AS manifest\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = {2}\nGROUP BY release_day\nORDER BY release_day\nLIMIT {3};",
      slots: [
        {
          answer: "name",
          kind: "keyword",
          label: "the manifest's payload column",
          why: "The manifest folds titles — p.name. category folds family codes into a census of labels, and price/stock fold numbers into a string of digits nobody can read as a release list; the payload IS the identity of what shipped.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the monetized-day literal",
          why: "Delivered periods are the monetized-and-paid days the ingest check audits — 52 of 103. 'shipped' swaps in the in-flight payouts and the manifest audits tomorrow's money; no literal prints the whole book.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the manifest cut",
          why: "Five days is the morning panel — the ingest check reads the newest releases head, not the whole 84-day book. LIMIT without it returns every delivered day and the panel becomes a scroll.",
        },
      ],
      distractors: ["category", "price", "stock", "1"],
      walkthrough:
        "One chain, one fold per day. The two joins stitch periods to lines to SKUs, the WHERE keeps the 52 delivered (monetized-and-paid) periods, and STRFTIME('%Y-%m-%d', …) builds the day key — 84 distinct days across the book. GROUP_CONCAT(DISTINCT name) folds each day's titles into one cell, DISTINCT because a track can draw multiple lines on the same day and the manifest lists tracks, not lines; the tracks column — COUNT(DISTINCT oi.product_id) — is the count that must equal the number of pipe-separated entries in the cell, a fold-and-count reconciliation in one row. The chips each break differently: category and price/stock change the payload into labels or digits — the query runs and the manifest stops being a manifest; 1 in the LIMIT leaves one day and the panel loses its spread. The named separator is the trap the brief warns about: titles carry commas, so the default bare-comma fold undercounts releases exactly on comma-heavy days.",
    },
    {
      id: "cs-soundcloud-6",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The above-mean payout watchlist",
      brief:
        "Partnership brief on the storefront db: the watchlist is every account carrying more monetized periods than the platform mean — the targeting gate behind the summit invitations. Probed facts: folding per-account first, the mean is 6.4375 periods (103 periods over 16 accounts, 6.44 rounded) and exactly FOUR accounts clear it — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 — with gaps to mean of 17.56, 10.56, 7.56 and 6.56. Computing the mean at the wrong grain (per-period) reads ~1.0 and admits the whole base; the CTE shape folds per_account, then averages THAT. The watchlist reads biggest period count first.",
      ask: "Return each watchlist creator with period count and gap-to-mean to 2 decimals, biggest count first.",
      template:
        "WITH per_account AS (\n  SELECT customer_id, COUNT(*) AS periods\n  FROM orders\n  GROUP BY customer_id\n), platform AS (\n  SELECT AVG(periods) AS mean_periods FROM per_account\n)\nSELECT c.name AS creator,\n       pa.periods AS periods,\n       ROUND(pa.periods - p.mean_periods, {1}) AS gap_to_mean\nFROM per_account pa\nCROSS JOIN platform p\nJOIN customers c ON c.id = pa.{2}\nWHERE pa.periods > p.mean_periods\nORDER BY pa.{3} DESC;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the gap's precision",
          why: "Gaps print to 2 decimals — 17.56, 10.56, 7.56, 6.56 — so the watchlist reconciles with the 6.4375 mean the deck quotes. ROUND(…, 0) prints whole numbers and the tie-boundary reads stop being checkable.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the account join key",
          why: "The folded counts join back to accounts through pa.customer_id = c.id — the fold's grain IS the join key. pa.id does not exist (the CTE folded it away) and errors; a wrong key here is a watchlist of nothing.",
        },
        {
          answer: "periods",
          kind: "keyword",
          label: "the watchlist sort key",
          why: "The list reads biggest period count first — Alice Chen's 24 on top. ASC opens on the barely-above-mean tail and the flagship account the summit exists for scrolls to row four.",
        },
      ],
      distractors: ["account_id", "id", "ASC", "1"],
      walkthrough:
        "Fold, compute the mean from the fold, then compare. The per_account CTE folds orders to one row per account — 16 rows of period counts — and the platform CTE averages THAT fold: 6.4375, the number the deck quotes as 6.44. The CROSS JOIN carries the single-row mean beside every candidate row, the join back to customers names the accounts, and the WHERE keeps the four that clear the bar: Alice Chen 24 (+17.56), Emma Wilson 17 (+10.56), Grace Kim 14 (+7.56), Maya Patel 13 (+6.56). The grain is the whole interview: averaging at period grain reads ~1.0, the watchlist admits all 16 accounts, and the summit's invitation list becomes the phone book. The chips each break differently: account_id is no column of the fold and errors; id is folded away and errors; ASC reads the tail first; 1 decimal prints 17.6/10.6 and the mean reconciliation stops being checkable. The four names echo the 3,000-line concentration cohort — depth and value concentrating in the same four logos is the platform's real targeting story.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-i", why: "Per-SKU plays and revenue beside each other is the track-read the catalog pod ships weekly — units folded at line grain, the exact shape of the 498-unit engagement ledger." },
    { slug: "queries-quality-and-percentage", why: "Payout-quality reads as a ratio with a stated denominator — average rate beside a share of stamped periods. Same division-discipline drill, SoundCloud flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in creator targeting — which accounts carry at least N monetized periods, which rate bands carry at least N lines. This problem drills the group-level gate." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of accounts above a play bar is the activation read — a conditional percentage whose denominator choice (all accounts versus monetized accounts) is the whole conversation." },
    { slug: "immediate-food-delivery-ii", why: "Share of payouts stamped inside the promised window versus late — the payout-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Accounts clearing a payout bar is a conditional count against a threshold — the monetization board's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "capital-gain-loss", why: "Promo units in, premium units out nets to the movement number the rate-card review reads. This problem drills ordered add/refund algebra — the same math engagement-line movements use." },
    { slug: "game-play-analysis-i", why: "First play per account — the upload's first drawn line — anchors every cohort this kit builds. MIN-over-window is the shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period account is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "combine-two-tables", why: "Accounts LEFT JOINed to periods: the whitespace read. An account with no period is whitespace, a period with no account is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Monetization-review outcomes arrive with gaps — COALESCE turns missing review data into an explicit rate instead of a silent NULL. Exactly the drill the review-queue denominator needs." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Creators who drew promo-rate lines and premium-rate lines but never the middle band — the conditional-aggregation read behind the rate-card upgrade targeting." },
    { slug: "list-the-products-ordered-in-a-period", why: "Tracks licensed inside a period window — the in-window read behind every monthly recap, with the half-open interval trap attached." },
    { slug: "ar-aging-schedule", why: "Royalty statements age like any AR book — buckets of open claims by days outstanding. This problem is the aging spine the payout-run draft is built on." },
    { slug: "top-five-artists", why: "The chart cut with LIMIT and a tie at the boundary — two tracks sharing a play count is a weekly occurrence, and the tie conversation is the interview's real test." },
    { slug: "keep-latest-dedupe", why: "Latest engagement line per track — the repost/refresh read that keeps one row per surface. ROW_NUMBER dedupe, exactly this problem." },
    { slug: "ad-free-sessions", why: "Plays that monetize versus ad-supported streams — the split the rate card defends, folded per session band with the same CASE discipline." },
    { slug: "ads-funnel", why: "Impression to click to conversion with denominators printed per step — the funnel-shape drill behind the plays-to-payout stages." },
    { slug: "ads-performance", why: "Rate and ratio side by side with explicit denominators — the division-discipline drill the payout-quality board runs." },
    { slug: "active-users", why: "Active versus dormant accounts over a window — the habit read that decides whether a creator's Next Pro subscription is working." },
    { slug: "activity-participants", why: "Distinct accounts per event beside total participation — the two-grain census drill behind every 45-from-8 versus 19-from-2 read." },
    { slug: "article-views-i", why: "Views per item folded at content grain — the per-track play read, the catalog pod's weekly baseline." },
    { slug: "article-views-ii", why: "The distinct-viewer cut over the same content grain — lines versus distinct tracks, the two-grain escalation this kit grades on." },
    { slug: "apples-and-oranges", why: "CASE-classified comparisons across mixed categories — the rate-band banding drill with the promo/premium edge at stake." },
    { slug: "asian-population", why: "Population filtered by region code with exact counts — the market-census drill behind the APAC 37-period read." },
    { slug: "all-the-matches-of-the-league", why: "Every pairing folded into one result set — the stitched-board drill behind the summit's cross-market packets." },
    { slug: "accepted-candidates-from-the-interviews", why: "Accepted within the window versus total considered — the time-bound conversion rate shape behind payout-window SLA reads." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the rollforward spine the payout-run draft stands on, cents exact." },
    { slug: "account-balance", why: "Per-account net of credits and debits — the creator-balance read that fires the payout when it crosses the threshold." },
    { slug: "average-selling-price", why: "Per-unit averages with weighted denominators — the arithmetic behind the 31.01 versus 115.85 rate-card arms." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders stamped inside the promised window — the conditional-rate shape behind the payout-SLA read." },
    { slug: "game-play-analysis-iv", why: "First event per account anchors every cohort this kit builds — the first-play-to-first-payout anchor via MIN over a partition." },
  ],
};
