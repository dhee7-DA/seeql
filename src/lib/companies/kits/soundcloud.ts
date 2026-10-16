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
    "Preparation strategy: the pools file carries no SoundCloud section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: plays-ledger folds, two-grain account censuses, payout clocks, tie-heavy engagement ladders, rate-card CASE bands and the cents-safe royalty spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:rate-card census} the monetization pod re-cuts weekly, the other rebuilds the {rose:unremitted royalty register} finance reads at every close. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Two-grain account censuses",
      why: "Accounts and periods are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded; the 5.6-versus-9.5 intensity ratio is what decides where creator-partnership effort lands next.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Status-aware funnel counts",
      why: "The monetization funnel is fixed: paid-out, in-flight, pending, demonetized — 52, 30, 14, 7 of 103, reconciling by construction. Each stage is a conditional count over a status or timestamp; the trap is calling an in-flight period 'paid' — 30 versus 52 on this db — and the second trap is the denominator: pending stays in a conversion base and drops out of a payout-clock base.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i"],
    },
    {
      name: "Payout clocks & stamp latency",
      why: "A period opens at created_at and shipped_at stamps the day money moves; 82 of 103 carry the stamp at a 2.98-day average with a 2–4 spread. julianday arithmetic over a stated population is the shape being graded — and the interviewer wants the 14 unstamped pendings excluded on purpose, not by accident, with the exclusion printed on the chart.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Engagement ladders & ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 periods each on this db, under a 24/17/14/13/5 ladder. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax; the LIMIT-1-OFFSET-1 habit breaks exactly here.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Rate-card bands with CASE",
      why: "Promo versus premium is CASE-classified: the band fold splits 251 lines into 268 sub-55 promo units (31.01 average line rate) and 230 premium units (115.85), and plan SKUs band the same way. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the rate card, and a reordered WHEN quietly re-bands the book.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Anti-joins for dormant surfaces",
      why: "Catalog hygiene is a real workflow: tracks that never drew a monetized line, accounts with no recent engagement, SKUs absent from a market's chart. The LEFT JOIN + IS NULL shape (and the NOT EXISTS twin) shows up as the 'find the dormant surface' question — with the honest caveat that on this db never-monetized accounts and never-played SKUs both return a confident zero, and proving that zero is part of the job.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Set ops for stitched boards",
      why: "Creator-summit packets stack populations — promo under premium, this market beside that one — and EXCEPT answers 'which royalty statements never drew a settlement leg', the exact query behind the kit's second case. UNION dedups whole rows silently, which makes it a correctness question, not a style one: a board that loses a row without an error is a board nobody trusts.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "movie-rating"],
    },
    {
      name: "Nested gates & platform means",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, and the NOT IN variant carries a NULL-poison answer on top.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
    {
      name: "Cents-safe royalty reads",
      why: "Booked is not settled — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the creator world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away; the rails matter too — card legs self-serve Next Pro billing, wire legs carry licensing payouts, and 5 statements settle on both.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
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
  ],
};
