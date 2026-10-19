// Airbnb — kit 1 of the Travel & Hospitality domain (Batch G).
// The host marketplace: search-to-stay funnel conversion, listing supply and
// host-quality (Superhost-style) reads, cancellation windows between booking
// and check-in, and repeat-guest trust. Registry pool = 4 tagged sql rows
// (funnel-step-conversion, median-time-to-convert, keep-latest-dedupe,
// point-in-time-asof) — all four are used first in problems and topics; the
// remaining pool picks are theme-curated to the funnel/supply/trust stack
// and the header says so. Case studies run on the storefront db with probed
// figures (scripts/company-facts.md): orders = bookings/stays, customers =
// guests, suppliers = hosts/properties, products = listings, shipped_at =
// check-out, cancelled = dropped booking. Facts-file figures only.

import type { CompanyKit } from "../types";

export const airbnbKit: CompanyKit = {
  id: "airbnb",
  domainId: "travel",
  name: "Airbnb",
  tagline: "Searches to stays: the long booking funnel",
  accent: "text-rose-500",

  brief: [
    "Airbnb is the host marketplace that turned spare rooms into a global accommodation network — **millions of active listings** in nearly every country, reachable through a search funnel that has to earn trust before it earns a reservation. The business runs on a long funnel: search → listing view → booking request → {amber:check-in} → stay → review, and every step leaks demand. Inventory here is perishable and personal — a night unsold at a host's place is gone forever — so the demand side lives on search-to-stay conversion while the supply side lives on listing growth, occupancy and host quality. And because guests can cancel until check-in, 'bookings placed' and 'stays that happened' are different numbers, exactly like *orders placed versus orders kept*.",
    "The data org mirrors the marketplace: supply teams model listing onboarding, supply growth and Superhost-style quality distributions; demand teams own search ranking and the search-to-stay funnel; trust teams hunt fraud, duplicate accounts and review abuse; finance closes host payouts against **gross booking value** with bank-grade reconciliation. Analysts live in SQL over event tables — searches, impressions, booking requests, {rose:cancellations}, {emerald:check-ins}, reviews — and the first question in every review is *which population a number describes*: searches or searchers, bookings or guests, placed or kept.",
    "Interview screens are funnel-heavy and grain-heavy. Expect search-to-stay conversion with an explicit denominator, dedupe-to-latest-event on retried booking events, as-of joins against slowly changing listing attributes (what the price WAS at booking time), **median time-to-convert** — *because means lie on skewed funnels* — and conditional counts that reconcile: check-outs plus open bookings plus {rose:cancellations} must sum to placements. Windows appear wherever a leaderboard or a 'previous stay' comparison appears. Interviewers grade the narration: **grain, denominator and survival rule**, stated before the SQL.",
    "Prep by drilling the funnel on a small, honest dataset. This kit runs on the storefront practice db with a fixed mapping — orders are bookings, customers are guests, suppliers are hosts, products are listings, `shipped_at` is check-out, cancelled is a dropped booking — so every shape you build here transfers: completion shares by region, above-market listing benchmarks, loyalty-tier censuses, {rose:unpaid-folio sweeps}. Master the **two-grain census** (bookings vs guests), the conditional-count ratio, the rank trio, and month-bucket seasonality — then practice *saying the denominator out loud* before you divide.",
    "Under the funnel sits the money rail, and the money rail has its own census. Host payouts settle as statements against remittance legs on two rails — **card 16 legs / 37,364.00** and **wire 11 legs / 32,248.00** — every figure stored as integer cents and folded by `/100.0` before it reaches a deck. The close-time question is never 'what did we pay' but *which statements have no leg at all* — the {rose:unremitted sweep} that finds booked-but-unsettled payouts the way the funnel finds booked-but-cancelled stays. Same discipline, different table: population printed, denominator stated, anomalies counted not averaged.",
    "Senior screens change the question from can-you-write-this to *can you own this*. Expect a broken metric handed to you — a completion share whose **denominator moved**, a payout total that double-counts a **split rail**, a retention curve that grew because its base shrank — and the fix is the definition before the SQL. The rubric is the narration: name the {amber:grain}, state the survival rule, then write the query — and say what the query *cannot* answer. Prep that way too: for every case in this kit, write the one-sentence definition the deck will carry before you touch the chip bank, because at Airbnb that sentence is the deliverable.",
  ],

  dayInLife: [
    "**08:30 —** Morning starts on the funnel wall: overnight search-to-book conversion, {emerald:check-out completion share} (on the practice db: **82 of 103** placed bookings carry a check-out), and any {rose:cancellation spike} by region or listing tier. The first hour is reconciliation — the dashboard's check-outs, open bookings and cancellations must sum to placements before anyone screenshots it. Numbers ship with their denominators printed; a completion share without 'of placed' in the label gets bounced in review.",
    "**11:00 —** Midday is deep-dive work: a ranking experiment moved bookings in one market, so you dedupe retried booking events with a `ROW_NUMBER` tie-break, fold **median time-to-convert** per arm (the mean is being dragged by a months-late tail), and check whether the listing supply in that market shifted under the experiment. Supply analysts run the same morning on the other side: host acceptance rates, new-listing activation, the quality bench of hosts above the 4.5 review line versus the long tail below it. Both sides print the population beside the estimate, because a lift without its grain does not survive the afternoon review.",
    "**14:30 —** The afternoon is stakeholder cycles: a trust review on **duplicate guest accounts** (same payment instrument, same address, multiple accounts), then the finance payout close — the {rose:unpaid-folio sweep} that counts reservations with no settlement row, valued in dollars from integer cents. Trust wants the clusters counted by instrument; finance wants the exposure valued before close; both get the same rule — the population is printed in the label, not implied. When a stakeholder challenges a number, the answer is the query, not a re-argument.",
    "**17:30 —** You end the day writing the definitions into the readout itself, because at Airbnb *the metric definition IS the deliverable*: the SQL is reproducible, the denominator is the argument. The readout carries the morning's reconciliation, the experiment's dedupe rule and the folio sweep's survival rule — every number next to the population it describes. Tomorrow's dashboard opens against tonight's definitions, and when the two don't reconcile, the writeup is the first place anyone looks.",
    "**20:15 —** On-call rotates through the nightly refresh: the pricing reindex and the listing-attribute rebuild land after midnight, and the guardrail wall watches the funnel while they run. Tonight a {rose:completion-share alert} fires — check-outs flat, placements up — and the triage order is reflexive: duplicate booking events first (`ROW_NUMBER` with the id tie-break), then watermark checks on the backfill window, then the region identity — check-outs plus open plus {rose:cancelled} must re-sum to placements. It resolves as a replayed ingest from one market, deduped in ten minutes; the incident note quotes the two-grain counts before and after. *The night shift is where the dedupe reflex earns its keep* — the funnel wall opens at 08:30 whether or not the refresh behaved.",
  ],

  metrics: [
    { name: "Search-to-stay conversion", what: "Share of searches that end in a completed, checked-out stay — the funnel's master rate, read per market and per rank change. Every variant (search→book, book→stay) has a different denominator, so screens and reviews alike open with 'conversion of WHAT?'" },
    { name: "Gross booking value (GBV)", what: "Total value of bookings placed in a window — kept demand only once completions are netted against cancellations. GBV is the top line finance and the board model; the placed-versus-kept split is the first fork every analyst must state out loud." },
    { name: "Nights booked", what: "Volume of nights reserved — the physical unit the marketplace sells and the supply-side load measure behind occupancy and cleaning-ops planning. Nights, not bookings, because long stays and short stays make 'bookings' a noisy proxy." },
    { name: "Average daily rate (ADR)", what: "Booking value divided by nights — the price mix read that pricing and Smart-Pricing teams move directly. ADR splits demand quality from demand volume; a conversion push that trades ADR for bookings shows up here first." },
    { name: "Stay completion share", what: "Check-outs divided by ALL placed bookings in the population — cancelled and not-yet-open stays included in the base. The honest kept-demand read: on the practice db 82 of 103 bookings carry a check-out, and the denominator rule is what makes regions comparable." },
    { name: "Cancellation share", what: "Cancelled bookings divided by placements, watched by region, lead time and cancellation-window bucket. Cancellations are the funnel's silent leak: the practice db runs 6.8% overall but APAC 8.1% versus US 5.3% — the spread is the story, and the denominator makes it real." },
    { name: "Active listing supply", what: "Bookable listings live in search, with activation and retirement flows folded in. Supply growth is the marketplace's other engine — demand without bookable supply is a search result page of disappointment." },
    { name: "Repeat-guest share", what: "Guests with two or more stays over all guests who booked — the trust flywheel metric. On the practice db 14 of 16 guests repeat, and repeat demand is the cheapest demand: reviews compound, and rebooking skips the trust-building steps of the funnel." },
    { name: "Host acceptance rate", what: "Booking requests hosts accept over requests made — the supply-side funnel the demand side never sees. Silent declines leak demand exactly where cancellations do downstream: a marketplace can lose a stay at the host door or after it, and only one of those shows up in the cancellation metric." },
    { name: "Lead time", what: "Days between booking placed and check-in — the cancellation window's width and the demand-forecast horizon in one number. Long lead times carry more cancellation exposure per booking, which is why regional cancellation shares are read next to lead-time buckets, never alone." },
    { name: "Occupancy share", what: "Nights booked over nights available — the perishable-inventory read. An unsold night at a host's place expires at checkout, so occupancy is the supply team's master rate the way conversion is the demand team's: both are 'of WHAT' fractions with stated denominators." },
    { name: "Superhost-grade share", what: "Hosts above the quality bench over all active hosts. On the practice db 2 of 6 hosts (4.6 and 4.8) clear the 4.5 line while 4.4, 4.1, 4.0 and 3.9 sit below it — the bench, not the average, is what qualifies a host for the badge and the boost." },
  ],

  topics: [
    {
      name: "Funnel step conversion",
      why: "The search→book→check-out funnel is Airbnb's master measurement, and step conversion is a conditional-count pivot over stage events with honest per-stage denominators. Every demand review and every ranking experiment reads through this shape.",
      slugs: ["funnel-step-conversion", "ads-funnel", "email-engagement-funnel", "active-users"],
    },
    {
      name: "Two-grain counting",
      why: "Bookings and guests are different grains that disagree on purpose: 45 EU bookings fold to 8 guests. Analysts who can't hold both counts in one query can't produce the intensity reads the marketplace runs on.",
      slugs: ["percentage-of-users-attended-a-contest", "find-followers-count", "product-sales-analysis-iii", "trips-and-users"],
    },
    {
      name: "Conversion shares & ratios",
      why: "Acceptance rates, completion shares and review ratios all divide a conditional count by a fold of the same rows. The failure modes — integer division, denominator drift after a WHERE — are exactly what the screens probe.",
      slugs: ["friend-requests-i-overall-acceptance-rate", "queries-quality-and-percentage", "ads-performance"],
    },
    {
      name: "Keep-latest dedupe",
      why: "Booking and listing events arrive duplicated under retries and client replays; the funnel counts only stay honest if 'latest event wins' is deterministic — ROW_NUMBER with a timestamp plus id tie-break, not a bare MAX.",
      slugs: ["keep-latest-dedupe", "find-latest-salaries", "product-price-at-a-given-date", "point-in-time-asof"],
    },
    {
      name: "Median & typical-guest math",
      why: "Time-to-convert is skewed and incomplete, so Airbnb-style funnel reporting quotes medians. Median emulation over ordered values is a screen staple because it tests windows AND population definitions at once.",
      slugs: ["median-time-to-convert", "median-employee-salary", "station-median"],
    },
    {
      name: "Calendar slicing",
      why: "Travel demand is seasonal and lead-time-driven: month buckets, 'latest activity in year X' and in-period folds are the daily reads. Half-open date windows and SUBSTR month keys are the house style.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Ranking windows",
      why: "Listing ladders, top-three per market and recency surfaces are all windows over folded aggregates — and ties on review scores or unit counts force the RANK-vs-DENSE_RANK business decision out loud.",
      slugs: ["rank-scores", "the-most-recent-three-orders", "second-most-recent-activity"],
    },
    {
      name: "Join survival rules",
      why: "Guest profiles joined to stays, listings to hosts: who survives the join IS the report. LEFT-versus-INNER is a decision about the answer population, and the WHERE-collapse trap is the most-failed screen question in this family.",
      slugs: ["combine-two-tables", "employee-bonus", "count-student-number-in-departments"],
    },
    {
      name: "CASE segmentation",
      why: "Flexible versus strict cancellation, stay tiers, market bands — segmentation is CASE WHEN over row facts, and the ELSE arm is the exhaustiveness audit that keeps every guest classified exactly once.",
      slugs: ["the-winner-university", "weather-type-in-each-country", "calculate-special-bonus"],
    },
    {
      name: "Benchmark subqueries",
      why: "Pricing work benchmarks each listing against the catalog-wide market rate — a scalar subquery in SELECT and in WHERE, two folds that must agree on their population, and a NULL if that population ever comes back empty.",
      slugs: ["game-play-analysis-iv", "second-highest-salary", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Churn & never-booked sweeps",
      why: "Demand review needs the guests who browsed and never booked, and supply review needs the hosts who listed and never hosted — both are anti-joins where the unmatched rows ARE the answer. The screens grade the spelling: LEFT JOIN … IS NULL, NOT EXISTS, or NOT IN — and NOT IN over a nullable key is the one that silently returns nothing.",
      slugs: ["customer-who-visited-but-did-not-transact", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Running totals & pacing",
      why: "Growth reads cumulative bookings against plan month to date, and ops reads capacity fill against listing caps — both are window running sums where the frame decides the answer. The default frame after ORDER BY reaches back to the whole partition, which is exactly wrong for a trailing window.",
      slugs: ["last-person-to-fit-in-the-elevator", "game-play-analysis-iii", "budget-pacing"],
    },
    {
      name: "Contiguous-night islands",
      why: "Multi-night demand arrives as consecutive calendar nights, and ops needs booked spells collapsed to runs — gaps-and-islands over dates. Streak logic also powers the trust side: bursts of same-day bookings from one account are exactly a consecutive-run detection.",
      slugs: ["report-contiguous-dates", "find-the-start-and-end-number-of-continuous-ranges", "human-traffic-of-stadium"],
    },
    {
      name: "Set-op reconciliation stacks",
      why: "Close-time reports stack populations — placed over kept, dropped under stayed, a TOTAL row appended — and set ops are the grammar. The screen trap is UNION versus UNION ALL: the deduped UNION quietly deletes rows that legitimately repeat across arms, and a reconciliation stack that loses rows is worse than one that errors.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "league-statistics"],
    },
    {
      name: "Name & text hygiene",
      why: "Trust matching starts with strings: guest names typed in any case, listing titles pasted with padding, review text that must fit its field. Text functions look like the easy module and then the screen asks why two spellings of the same host didn't cluster — casing, whitespace and length rules are the answer.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "fix-product-name-format"],
    },
  ],

  theory: [
    {
      id: "airbnb-t1",
      q: "For a trust report on guests who never completed a stay — LEFT JOIN or INNER JOIN, and where does the status filter live?",
      a: "Decide from the survival rule the question implies. 'Guests who never completed a stay' must be LEFT from guests — the unmatched guests ARE the answer, arriving with NULL booking columns — and the filter that keeps them lives in the WHERE as an IS NULL test on the booking key, or better as NOT EXISTS. The trap that fails this screen: putting a right-side predicate like b.status = 'completed' in WHERE, which discards the NULL-payload rows and silently collapses the LEFT JOIN to an INNER — the never-stayed guests vanish exactly when they become the answer. And the INNER variant answers a different question entirely ('guests with completed stays'). Join type is a population decision: say who survives, then pick the join that lets them.",
      tag: "joins",
    },
    {
      id: "airbnb-t2",
      q: "Booking events arrive duplicated — same guest, same listing, same created_at second. How do you keep exactly one row, and what makes the choice defensible?",
      a: "Detection first: GROUP BY guest, listing, created_at HAVING COUNT(*) > 1 sizes the duplicate pool — that count is the data-quality number you quote before deduping anything. Collapse with ROW_NUMBER() OVER (PARTITION BY guest, listing ORDER BY created_at DESC, id DESC) = 1: the timestamp picks latest, and the id DESC tie-break makes 'latest ingest wins' deterministic when two rows share the second, which retries guarantee. What makes it defensible is being able to say which rows were discarded and why the business agreed to lose them — 'it returns one row per event' is not a defense, 'these N duplicate events were folded to their latest ingest' is. Airbnb-style funnels count unique events; a dedupe that isn't deterministic turns every funnel count into a re-run lottery.",
      tag: "windows",
    },
    {
      id: "airbnb-t3",
      q: "Your region report must show bookings AND distinct guests side by side. Why do the two counts disagree, and what does each number mean to the marketplace?",
      a: "They disagree because they fold at different grains. COUNT(*) counts rows after the join — one per booking, so a guest with five stays contributes five. COUNT(DISTINCT customer_id) folds repeats back to people. Neither is wrong: bookings measure load on the stays machine (cleaning, check-in, support), guests measure audience, and the ratio between them is the intensity signal — on the practice db EU runs 45 bookings from 8 guests while US runs 19 from 2, a small region of heavy bookers versus a broad one of steady ones. The trap is a third count sneaking in: join bookings to line-item-level tables and COUNT(*) silently counts something else. Saying 'one row per what?' out loud for every COUNT in the query is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "airbnb-t4",
      q: "shipped_at — here, the check-out timestamp — stays NULL until the stay actually happens. What is your NULL policy for a stay-latency report?",
      a: "Define the population first, then let the NULLs do definitional work. Only stays that happened HAVE latency, so computing julianday(shipped_at) - julianday(created_at) with shipped_at IS NOT NULL filtered in WHERE is correct — but say it: 'this report measures check-out latency of bookings that reached check-out; pending and cancelled are out of scope.' The three NULL behaviors matter in order: filters (NULL fails both = and !=, so an unfiltered comparison silently drops rows), aggregates (COUNT(col) skips NULLs — that's exactly how you count check-outs — while COUNT(*) keeps the row), and display (a NULL latency is 'not yet', never zero — coalescing it to 0 launders in-progress stays into an instant check-out). On the practice db that policy yields 82 latency-bearing bookings averaging 2.98 days, range 2 to 4 — numbers that mean something precisely because the population was stated.",
      tag: "nulls",
    },
    {
      id: "airbnb-t5",
      q: "In a funnel query, where do stage filters live — WHERE or HAVING — and what breaks when one lands in the wrong clause?",
      a: "The pipeline order decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. A stage predicate is a ROW-level fact — status = 'cancelled', created_at in the market window — so it lives in WHERE, discarding rows before the fold. A stage AGGREGATE condition is a GROUP-level fact — 'markets with more than ten placed bookings', 'months with a completion share above 80%' — so it lives in HAVING, judging folded groups. Put the row filter in HAVING and you've wasted the fold on rows that never mattered; put the group gate in WHERE and the query won't even parse, because the aggregate doesn't exist yet. The Airbnb-specific bite: a HAVING COUNT(*) > 10 gate is also an honesty instrument — it keeps small-N markets from topping a completion leaderboard on sample size alone. Clause placement is not style; it's which population the number describes.",
      tag: "pipeline",
    },
    {
      id: "airbnb-t6",
      q: "You benchmark each listing against the catalog-wide market rate. Scalar subquery in SELECT versus in WHERE — what does each compute, and what happens when the inner query is empty?",
      a: "Same fold, two jobs. In WHERE — price > (SELECT AVG(price) FROM listings) — the scalar acts as the benchmark threshold, deciding which rows survive. In SELECT — ROUND((SELECT AVG(price) …), 2) AS market_rate — it becomes a printed column, so the report shows the rate and the above-rate count describing each other. The empty-inner-query behavior is the part interviewers wait for: a scalar subquery returns 0 or 1 rows, and 0 rows yields NULL — not an error — so price > NULL is UNKNOWN and the WHERE silently passes nothing. A benchmark against a filtered staging population that happens to be empty returns a report of nothing while looking healthy. The discipline: know which population the inner fold covers, and check for emptiness before trusting the comparison — the silent-NULL benchmark is how pricing decks ship numbers that mean 'no data' and get read as 'no premium'.",
      tag: "subqueries",
    },
    {
      id: "airbnb-t7",
      q: "Lead time and stay length are day math on TEXT timestamps. How do you bucket bookings by month, diff days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO text — gives the month spine every seasonality read hangs on; the SUBSTR shortcut dies the day the format drifts. Diffs: JULIANDAY(check_out) - JULIANDAY(created_at) returns fractional days; round once at the END, not per row — the practice db's 2.98-day average check-out latency is exactly that shape. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the month's biggest booking night. The deeper breaks are conventions: these strings carry no timezone, and shipped_at is NULL until check-out, so every date fold needs its population stated first. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "airbnb-t8",
      q: "Your funnel counts moved 3% overnight with no product change. Walk me through the data-quality checks you run before believing the trend.",
      a: "Reconciliation before interpretation. First, the identity: check-outs plus open bookings plus cancellations must equal placements — on the practice db 52 + 30 + 14 + 7 = 103 — and if the branches no longer sum, the fold's population moved. Second, duplication: COUNT(*) versus COUNT(DISTINCT event_key) — retried booking events inflate placed-demand counts and deflated conversion alike; a keep-latest dedupe with a deterministic tie-break is the fix. Third, population drift: did a WHERE window (half-open boundaries, a new market bucket) silently change the denominator? Compare the denominator's own trend, not just the numerator's. Fourth, watermark sanity: did a backfill re-run double-load a window? The habit being graded is treating two numbers that should agree and don't as the FINDING — at Airbnb the funnel is the company's heartbeat, and a 3% move that's actually a duplicate event storm is a war-room incident, not a trend.",
      tag: "quality",
    },
    {
      id: "airbnb-t9",
      q: "The month-close deck stacks a kept-bookings census over a dropped-bookings census. UNION or UNION ALL — and what does the wrong one do to the reconciliation?",
      a: "UNION ALL, and the reason is arithmetic, not style. A reconciliation stack exists so the arms sum back to the population — stayed 82 plus open 14 plus dropped 7 must re-surface as 103 placed. UNION deduplicates the combined result, and census rows legitimately repeat across arms — two fates can carry the same bookings count, the same GBV cell, the same month key — so the dedupe deletes real rows and the stack silently fails to reconcile, no error anywhere. The habit that catches it: every stack carries a source literal ('kept', 'dropped', 'TOTAL') so each row is traceable to its arm, and the sum check runs in review. If you truly need dedupe, dedupe each arm first, on purpose, with a stated key — never as a side effect of the operator you picked for looks.",
      tag: "setops",
    },
    {
      id: "airbnb-t10",
      q: "Finance wants the payout statements with no remittance leg. Walk me through the three spellings of that anti-join and where each breaks.",
      a: "LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL is the workhorse — the unmatched statements survive with NULL legs and you can still fold their amounts in the same pass; on this book that's 6 statements / 15,217.00, and the split matters: 5 open / 13,461.00 plus statement #28, which is marked paid but has zero legs. NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) is the readable spelling that also survives nullable keys. NOT IN (SELECT invoice_id FROM payments) is the trap: one NULL invoice_id in the legs and the whole NOT IN evaluates to no rows — a sweep that returns empty looks exactly like a clean book. I'd ship the LEFT JOIN version here because the sweep owes finance dollars, not just ids, and an anti-join that can't carry amounts is the wrong shape for a close.",
      tag: "antijoins",
    },
    {
      id: "airbnb-t11",
      q: "You want trailing 3-month placed bookings next to each month. What frame does SUM(placed) OVER (ORDER BY month) actually compute, and what's the fix?",
      a: "With an ORDER BY and no frame clause, the default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — a running total from the start of the partition, not a trailing window — so your 'trailing 3' column is quietly the cumulative spine. Worse, RANGE means peers share the boundary: two rows with the same ORDER BY key (duplicate month keys from a bad bucket) enter and exit the frame together. The fix is explicit: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW says three rows, period, which is what 'trailing three months' means once the month spine is deduped. I say the frame out loud in review because the wrong frame doesn't error — it returns a plausible, growing number that reads as momentum when it's just history accumulating.",
      tag: "frames",
    },
    {
      id: "airbnb-t12",
      q: "How would you measure the gap between a guest's consecutive stays, and what does the first row of that computation give you?",
      a: "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) puts the previous stay's timestamp on each row, and the gap is JULIANDAY(created_at) - JULIANDAY(prev) — the repeat cadence the growth team reads to time rebooking nudges. The first row of every partition carries a NULL previous stay: that's not an error, it's the definition — a guest's first stay has no prior, and a heavy booker like the 24-stay guest contributes 23 gaps and one NULL. The two ways people break it: COALESCEing the NULL to zero, which launders 'first stay' into 'zero-day rebooking' and poisons the average; and partitioning by the wrong grain (guest-listing instead of guest), which fragments the cadence across listings. LEAD is the same tool facing forward — next-stay reads for churn-risk lists — and the partition rule is identical.",
      tag: "laglead",
    },
    {
      id: "airbnb-t13",
      q: "Two hosts tie at the top of the quality ladder. What do RANK, DENSE_RANK and ROW_NUMBER each do to the tie, and which do you ship?",
      a: "ROW_NUMBER breaks the tie arbitrarily unless the ORDER BY is fully deterministic — engine roulette wearing a leaderboard. RANK gives both hosts rank 1 and skips to 3 next, so the gap is visible; DENSE_RANK gives 1 and then 2, so no rank is skipped. Which to ship is a business call, and I say it out loud: for a Superhost-style bench I'd rather not pretend two tied hosts are ordered — RANK with the tie visible, or better, drop the pretense and count hosts above the 4.5 line, where the practice db reads 2 of 6 (4.6 and 4.8 clear it; 4.4, 4.1, 4.0, 3.9 sit below). If the ladder feeds a fixed-size pick — top three get a boost — then ROW_NUMBER with a stated tie-break (rating DESC, review count DESC, id ASC) is correct, and the tie-break is part of the definition, not a coding detail.",
      tag: "ranking",
    },
    {
      id: "airbnb-t14",
      q: "A market goes quiet for a week and your trend chart just skips the days. Why does GROUP BY hide empty buckets, and how do you build the spine that doesn't?",
      a: "GROUP BY folds the rows that exist — a day with no bookings contributes no group, so the chart draws a straight line between the days it has and the quiet week never renders. The fix is a date spine: generate the calendar (a recursive CTE walking dates, or a cross join against a calendar table), LEFT JOIN the bookings onto it keyed by the same bucket expression, and COALESCE the counts to zero only at the display edge — the zero is real demand-quiet, and the NULL was 'no rows', which are different facts. The same move at listing grain is occupancy: nights exist whether or not they sell. The discipline I'm grading: the spine's grain is a stated decision (day, night, market-day), and once you LEFT JOIN a spine, every 'share of X' denominator is days, not rows — drift there and every rate on the chart moves without any demand moving.",
      tag: "calendars",
    },
    {
      id: "airbnb-t15",
      q: "Your per-market cancellation share divides two conditional counts. Where can that expression break, and what's the guard?",
      a: "Two failure modes, both silent. Integer operands floor the result — 100 * 3 / 37 prints 8, not 8.1 — so the 100.0 (or 1.0) multiplier goes in before the division, every time. And a zero denominator — a market with no placed bookings in the window — makes x / 0 return NULL in SQLite, no error: the market drops off the board as if it didn't exist. The guard is NULLIF(denominator, 0) on purpose: the share becomes NULL, the NULL reads as 'no base', and a COALESCE to 0 — if you add one — is a display decision made consciously, because '0% cancellation' and 'nobody booked' are opposite findings wearing the same cell. APAC 8.1 versus US 5.3 is the story on this book, and both numbers are only trustworthy because the denominators were guarded and stated.",
      tag: "division",
    },
    {
      id: "airbnb-t16",
      q: "One-pass census: why does the team prefer COUNT(*) FILTER (WHERE …) over three separate queries — and what's the equivalence to SUM(CASE)?",
      a: "Because the census must reconcile, and separate queries make reconciliation a leap of faith. COUNT(*) FILTER (WHERE shipped_at IS NOT NULL), COUNT(*) FILTER (WHERE status = 'pending'), COUNT(*) FILTER (WHERE status = 'cancelled') in one scan over orders prints 82, 14, 7 against the same 103-row population — the branches are forced to share a denominator because they shared a scan. SUM(CASE WHEN condition THEN 1 ELSE 0 END) is the portable spelling of exactly the same fold, and I use it when FILTER isn't available; the difference is readability, never arithmetic. What I refuse is the three-queries version: each query re-derives its own population, a WHERE drifts in one of them, and now 82 + 14 + 7 doesn't re-sum to 103 and nobody can say which arm moved. One pass, one population, branches as columns — that's a census.",
      tag: "census",
    },
    {
      id: "airbnb-t17",
      q: "A CASE segmentation ships and one row lands in no bucket. How does that happen and how do you audit for it?",
      a: "The ELSE-less CASE. Every condition false returns NULL, not an error — the row survives, carrying a NULL class that aggregates skip and reports hide. On this book the status vocabulary is closed — delivered, shipped, pending, cancelled — so a fate CASE with an ELSE 'dropped' arm classifies all 103 and the audit is 82 + 14 + 7 = 103. But vocabularies drift: a new status lands upstream, the ELSE quietly absorbs it, and the census still sums while mislabeling rows — that's worse than the NULL, which at least shows up as a gap. My audit is mechanical: count the ELSE arm by name, subtract it from the total, and treat any residue as a finding; and when the classes feed a rate, state which arm is the denominator — 'completion of all placed' and 'completion of decided' are different metrics that share a name.",
      tag: "case",
    },
    {
      id: "airbnb-t18",
      q: "The paid book is 66,443.00 in the deck and 6,644,300 in the table. Which is right, and what convention keeps payouts from shipping 100x off?",
      a: "Both — they're the same number in two units, and the convention is the whole answer. Money on this book lives in INTEGER cents (amount_cents), and dollars are a display fold: SUM(amount_cents) / 100.0, rounded once at the end — 6,644,300 cents prints 66,443.00. The failure modes are all quiet: SUM(amount_cents)/100 with integer division truncates remainder cents before the sum; ROUND(SUM(amount_cents), 2) looks like a fold but reproduces raw cents because the cent sums are whole numbers — the ROUND-ambiguity trap; and mixing a cents column into a dollars SUM ships a deck 100x off with no error. I state units in the column name (amount_usd vs amount_cents), fold at one defined place, and check one known cell — the paid book, 21 statements, 66,443.00, average 3,163.95 — before anything downstream is believed.",
      tag: "types",
    },
    {
      id: "airbnb-t19",
      q: "The monthly funnel wall got slow. What does sargability mean, and which of the house WHERE styles keep the index usable?",
      a: "Sargable = the predicate can seek an index, which means the column stands bare on one side of a range comparison. Half-open windows — created_at >= '2025-02-01' AND created_at < '2025-03-01' — are sargable and are the house style for that reason, on top of their boundary correctness. Wrap the column and the index is dead: SUBSTR(created_at, 1, 7) = '2025-02', STRFTIME('%Y-%m', created_at) = '2025-02', CAST(created_at AS TEXT) LIKE '2025-02%' all force a per-row computation and a full scan. On 103 practice rows you'll never feel it; the habit is being graded for the day the funnel table is a billion searches. My order of operations: correctness first (half-open wins there anyway), then sargability, then only if a fold is unavoidable, compute it once into a staged bucket column the pipeline maintains — never per query per row.",
      tag: "performance",
    },
    {
      id: "airbnb-t20",
      q: "Catalog benchmark: scalar subquery, correlated subquery, derived table — when is each the honest shape?",
      a: "The scalar subquery — price > (SELECT AVG(price) FROM listings) — folds once, over one stated population, and returns one number: 71.78, the catalog-wide market rate. Honest when the benchmark is genuinely catalog-wide; dishonest the moment someone reads it as a per-neighborhood benchmark. The correlated subquery folds per outer row — (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category) — so each listing benchmarks against its own category, and the cost multiplies with the outer row count; honest when the comparison set truly is per-row, and I say so in the label. The derived table folds once per group and joins back — staged, inspectable, the only shape that scales a per-group benchmark. The grain check I drill: the trusted-bench avg-price cells (139.66 / 72) are averages over supplier catalog rows, not line-weighted — the same 'AVG' verb over a different population is a different benchmark, and only the population statement makes it defensible.",
      tag: "subqueries",
    },
    {
      id: "airbnb-t21",
      q: "GROUP_CONCAT folds a host's listing titles into one cell. What makes that fold trustworthy?",
      a: "Three things. Order: GROUP_CONCAT without an ORDER BY inside the aggregate returns the titles in whatever order the scan found them — two runs, two strings, and a cache keyed on that string misses; order inside the fold makes the cell reproducible. Delimiter: the default comma collides with titles that contain commas — state the separator (' | ') as part of the definition. And length: the fold is a string with a budget — a host with forty amenities can blow past the display cell or a downstream VARCHAR, so the census counts rows (how many listings fed the fold) beside the string, the same two-grain discipline as any other fold. I treat GROUP_CONCAT as a reporting convenience, never a storage format — anything a query re-parses out of a concatenated string should have been a join.",
      tag: "strings",
    },
    {
      id: "airbnb-t22",
      q: "SELECT region, COUNT(*) AS placed … WHERE placed > 10 fails. Why — and what does that teach about the pipeline?",
      a: "Because WHERE runs before SELECT. The logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — the alias placed is assigned in the SELECT step, so at WHERE time it doesn't exist yet; the aggregate it would wrap doesn't exist either, since WHERE precedes the fold. The row-level gate lives in WHERE (region = 'EU'), the group-level gate lives in HAVING (HAVING COUNT(*) > 10 — the small-N guard that keeps a two-book region off the completion leaderboard). SQLite is loose in one direction only: aliases are usable in GROUP BY and ORDER BY, which run after SELECT — but 'it parses in SQLite' is not portability, and I write the aggregate in HAVING anyway. The teach is bigger than one error: every clause-order bug is a population bug — the filter ran before the fold, so it answered a question about rows when the stakeholder asked about groups.",
      tag: "pipeline",
    },
    {
      id: "airbnb-t23",
      q: "SUM(o.total) after joining orders to order_items prints roughly 2.4x the booked value. What happened and what's the fix?",
      a: "Join fan-out. orders is one row per booking — 103 rows, 34,833.28 — but order_items is one row per line, 251 lines, and the join repeats each booking's total once per line, 2.44 lines per order on average, so the SUM counts most bookings several times. COUNT(*) breaks the same way: after the join it counts lines, not bookings, and a 'conversion' built on that count is quietly a different metric. The fix is to fold at the grain you need before the join: aggregate order_items to one row per order first, then join, so the booking grain survives; or keep the line grain deliberately and say so — revenue by category is a line-grain metric and belongs on the join. The reflex I'm grading: before any SUM over a join, ask 'one row per what?' — if the answer isn't the metric's grain, pre-aggregate. Fan-out doesn't error, it just re-prices the marketplace.",
      tag: "fanout",
    },
    {
      id: "airbnb-t24",
      q: "Define repeat-guest retention for a first-stay cohort. Where do cohort analyses usually go wrong?",
      a: "Cohort = guests by the month of their FIRST stay — a MIN per guest that freezes forever; on this book 14 of 16 guests have two or more stays, so most guests belong to exactly one cohort. Retention in month N is the count of cohort guests with a stay in that later month, divided by the cohort's original size — the denominator is frozen at assignment and never refreshes. The three classic breaks: a rolling denominator (active-that-month), which makes retention rise as the cohort churns — the curve that 'improves' because its base shrank; re-cohorting guests on every stay, so the same guest counts in three months; and joining reviews or cancellations in before the denominator is fixed, fanning the base. Growth reads retention beside repeat intensity — bookings per guest, the 45-from-8 EU gap — because a cohort can hold steady while intensity does the growing. Freeze the base, print the base, then read the curve.",
      tag: "cohorts",
    },
  ],

  mcqs: [
    {
      id: "airbnb-mcq-1",
      prompt: "On the bookings table, shipped_at is the check-out timestamp and stays NULL until a stay actually happens. Which expression counts check-outs?",
      choices: ["COUNT(*)", "COUNT(shipped_at)", "SUM(shipped_at)", "COUNT(DISTINCT customer_id)"],
      answer: 1,
      why: "COUNT(col) skips NULLs, so COUNT(shipped_at) counts exactly the 82 of 103 bookings that reached check-out — the stay-happened subset the funnel wall reports.",
      notes: [
        { choice: 0, why: "COUNT(*) counts every placed booking — 103, including the 14 pending and 7 cancelled that never checked in. It answers 'demand placed', not 'stays that happened'." },
        { choice: 2, why: "SUM over timestamp text coerces dates to numbers — a five-digit nonsense total, not a count. Aggregating dates is a type error wearing a result." },
        { choice: 3, why: "COUNT(DISTINCT customer_id) folds to guests, not check-outs — a useful number, but for a different metric on a different grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-2",
      prompt: "EU shows 45 bookings from 8 guests. What does the gap between COUNT(*) and COUNT(DISTINCT customer_id) measure?",
      choices: ["Nothing — a data bug", "Repeat intensity: bookings per guest", "Guest revenue", "Cancellation risk"],
      answer: 1,
      why: "45 booking rows fold to 8 people; the gap is the intensity signal — bookings per guest — that separates load on the stays machine from audience size.",
      notes: [
        { choice: 0, why: "The gap is structural: repeat bookings fan the join by design. No corruption is required for the two counts to disagree." },
        { choice: 2, why: "Revenue needs SUM(total) — EU's 15,089.23. Counting never prices anything; the two-grain census is about rows versus people." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-3",
      prompt: "Total booking demand is 34,833.28 across 103 bookings. Which expression prints AOV for the deck?",
      choices: [
        "AVG(SUM(total))",
        "ROUND(SUM(total) / COUNT(*), 2)",
        "ROUND(AVG(per_guest_avg), 2) over per-guest averages",
        "SUM(total) / COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "AOV is value over bookings: 34,833.28 / 103 = 338.19, computed in one fold where numerator and denominator share a population.",
      notes: [
        { choice: 0, why: "AVG(SUM(total)) is an aggregate over an aggregate — invalid without staging, and meaningless even when it parses." },
        { choice: 2, why: "Averaging per-guest averages weights the 1-stay guest and the 24-stay guest equally — a different metric that quietly reads as AOV in reviews." },
        { choice: 3, why: "34,833.28 / 16 = 2,177.08 — lifetime value per guest, a legitimate KPI wearing AOV's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-4",
      prompt: "7 of 103 bookings are cancelled (6.8%). Which shape computes the cancellation share honestly?",
      choices: [
        "Filter cancelled rows in WHERE, then 100.0 * COUNT(*) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) over all rows",
        "100.0 * COUNT(status) / COUNT(*)",
        "COUNT(status = 'cancelled') * 100.0 / 7",
      ],
      answer: 1,
      why: "Numerator and denominator must fold the same population: the conditional sum counts the 7 cancelled rows while COUNT(*) holds all 103 placements — 6.8%, and regional splits like APAC 8.1% versus US 5.3% stay comparable.",
      notes: [
        { choice: 0, why: "That's a ratio of the filter to itself — 100% by construction. Denominator drift: the WHERE deleted the numerator's rows from the base." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — 103, not 7. You'd publish a 100% cancellation rate and be off by an order of magnitude." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-5",
      prompt: "Booking-event rows arrive duplicated: same guest, same listing, same created_at second. Which shape keeps exactly one row, deterministically?",
      choices: [
        "GROUP BY guest, listing picking MAX(created_at)",
        "ROW_NUMBER() OVER (PARTITION BY guest, listing ORDER BY created_at DESC, id DESC) = 1",
        "SELECT DISTINCT on all columns",
        "ORDER BY created_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "ROW_NUMBER with a deterministic tie-break — timestamp DESC, then id DESC — keeps exactly one row per (guest, listing) even when timestamps tie; the id turns 'latest ingest wins' into a decision instead of engine roulette.",
      notes: [
        { choice: 0, why: "MAX(created_at) collapses values, not rows — joined back, BOTH tied rows survive and the duplicate set doubles again." },
        { choice: 2, why: "DISTINCT only removes exact clones; one differing column (a price snapshot, an experiment bucket) keeps both rows alive." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-6",
      prompt: "Why does funnel reporting quote MEDIAN time-to-convert rather than the mean?",
      choices: [
        "Medians are cheaper to compute",
        "A tail of bookings that convert months late drags the mean far off the typical searcher",
        "Medians ignore NULLs; means don't",
        "Medians work on text dates",
      ],
      answer: 1,
      why: "Conversion latency is right-skewed and incomplete — never-converters and months-late bookings drag the mean; the median answers 'the typical guest' and stays interpretable, which is why the screens test the median-emulation shape.",
      notes: [
        { choice: 2, why: "Both aggregates skip NULLs. The real issue is defining the never-converted population in or out — not letting the engine skip it silently." },
        { choice: 0, why: "Cost is irrelevant at funnel scale; the choice is about the distribution's shape, and it's a business-readability argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-7",
      prompt: "A trust audit needs guests who never completed a stay: SELECT g.name FROM guests g LEFT JOIN bookings b ON b.customer_id = g.id WHERE b.status = 'completed'. What happened?",
      choices: [
        "Correct — the LEFT JOIN keeps everyone",
        "The WHERE collapsed it to an INNER JOIN: only guests WITH completed stays return",
        "It now returns guests with cancelled stays",
        "It double-counts repeat guests",
      ],
      answer: 1,
      why: "Testing the right table's column in WHERE discards the NULL-payload rows the LEFT JOIN preserved — the never-stayed guests, which were the entire answer, are gone while the query still looks correct.",
      notes: [
        { choice: 0, why: "The LEFT-ness lives in the ON clause only; a right-side predicate in WHERE reverses it. NULL = 'completed' is UNKNOWN → discarded." },
        { choice: 3, why: "Fan-out duplication is a real but separate effect — here rows are REMOVED, not duplicated. One bug per query; know which one you own." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-8",
      prompt: "WHERE price > (SELECT AVG(price) FROM listings_active) returns zero rows on a staging table that has no rows. Why?",
      choices: [
        "AVG errors on empty input",
        "The scalar subquery returns NULL; price > NULL is UNKNOWN, so nothing passes — silently",
        "Zero rows is the correct, honest answer by definition",
        "SQLite auto-fills AVG as 0",
      ],
      answer: 1,
      why: "An empty scalar subquery yields NULL — not an error — and every comparison against NULL is UNKNOWN, so the benchmark returns nothing while looking healthy. Staged populations need an emptiness check before the comparison is trusted.",
      notes: [
        { choice: 0, why: "AVG over an empty set returns NULL quietly. The silence IS the bug — there's no stack trace to alert anyone." },
        { choice: 2, why: "It might be honest — but only if someone decided it. An unexplained empty result is how broken staging data ships into a pricing deck." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-9",
      prompt: "Which WHERE captures every February 2025 booking on a TEXT timestamp, including the last night of the month?",
      choices: [
        "created_at BETWEEN '2025-02-01' AND '2025-02-28'",
        "created_at >= '2025-02-01' AND created_at < '2025-03-01'",
        "SUBSTR(created_at, 1, 7) = '2025-02'",
        "created_at LIKE '2025-02%'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every timestamp through 2025-02-28 23:59:59 and is index-shaped — the house style for season windows, where the month's last night is prime booking time.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends: a 18:40 booking on the 28th exceeds the '2025-02-28' bound and vanishes — the last-night demand silently gone." },
        { choice: 2, why: "SUBSTR reads correct rows on fixed-width ISO text but scans everything and breaks the day the format drifts. Correct today is not the bar; sargable and format-proof is." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-10",
      prompt: "APAC: 3 cancelled of 37 placed. What does 100 * 3 / 37 evaluate to in SQLite — and what's the fix?",
      choices: [
        "8.1 — division is real-valued",
        "8 — integer division truncates; write 100.0 * 3 / 37",
        "0 — the whole expression truncates to zero",
        "12.3 — operands bind right-to-left",
      ],
      answer: 1,
      why: "INTEGER / INTEGER floors: 300 / 37 = 8, not 8.1. The 100.0 multiplier promotes the chain to real arithmetic before division — the difference between a real share and a floored one, and at 1-of-103 the same bug reads 0%.",
      notes: [
        { choice: 0, why: "Only because a REAL touched the expression. All-integer operands keep integer division — the bug that survives every code review that reads 'it looks like math'." },
        { choice: 2, why: "Truncation gives 8 here; zero needs a share under 1% — same bug, worse disguise, and cancellation shares live exactly in that range." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-11",
      prompt: "A month-close stack appends the dropped-booking census under the kept-booking census. The author wrote UNION instead of UNION ALL. What breaks?",
      choices: [
        "Nothing — UNION and UNION ALL always return the same rows",
        "Rows that repeat across the two arms collapse into one, and the stack silently fails to reconcile to placements",
        "The query errors — UNION cannot combine aggregates",
        "Only the first arm's rows survive",
      ],
      answer: 1,
      why: "UNION deduplicates the combined result; census rows legitimately repeat across arms (same counts, same month keys), so the dedupe deletes real rows and the reconciliation 82 + 14 + 7 = 103 quietly fails with no error.",
      notes: [
        { choice: 0, why: "The two operators differ exactly when duplicates exist — and duplicate cells across arms are the norm in census stacks, which is why every stack ships a source literal per arm." },
        { choice: 3, why: "UNION keeps both arms — it only removes duplicates. A missing arm would be a WHERE or set-direction bug, not a UNION behavior." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-12",
      prompt: "The never-booked sweep runs WHERE guest_id NOT IN (SELECT customer_id FROM bookings). One booking row has a NULL customer_id. What does the sweep return?",
      choices: [
        "All guests except bookers — the intended list",
        "An empty result — x NOT IN (…, NULL) can never be TRUE",
        "Only the guest with the NULL booking",
        "An error naming the NULL row",
      ],
      answer: 1,
      why: "NOT IN is a chain of != comparisons; anything != NULL is UNKNOWN, so every guest fails the test and the anti-join returns zero rows — a sweep that looks like a clean book. NOT EXISTS or a NULL-guarded LEFT JOIN is the safe spelling.",
      notes: [
        { choice: 0, why: "That's the answer with a clean key. One NULL poisons the whole list — the failure is total, not partial." },
        { choice: 2, why: "The NULL booking belongs to no guest id; it doesn't single anyone out — it disqualifies everyone." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-13",
      prompt: "A trailing-3-month placed column is built as SUM(placed) OVER (ORDER BY month). What does it actually compute?",
      choices: [
        "Exactly the trailing three months",
        "A cumulative total from the first month — the default frame is RANGE UNBOUNDED PRECEDING AND CURRENT ROW",
        "The next three months — windows look forward by default",
        "An error — SUM needs GROUP BY even inside OVER",
      ],
      answer: 1,
      why: "ORDER BY alone gives the running-total frame from the start of the partition, so the 'trailing 3' column is the cumulative spine wearing a trailing label. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is the honest three-row window.",
      notes: [
        { choice: 0, why: "Only with an explicit frame clause. The default frame is the trap — plausible, growing, wrong." },
        { choice: 2, why: "LAG/LEAD look across rows, but window frames aggregate backward by default; nothing in OVER() points forward unless you write it." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-14",
      prompt: "LAG(check_outs) OVER (ORDER BY month) runs down a 14-month spine. What does the first row carry?",
      choices: ["0", "The first month's own value", "NULL — there is no previous month", "The average of all months"],
      answer: 2,
      why: "The first row has no previous by definition, so LAG returns NULL — the honest 'no prior'. Coalescing it to 0 launders 'first month' into 'zero check-outs', a different fact.",
      notes: [
        { choice: 0, why: "The most tempting fill — and the one that poisons month-over-month deltas: a NULL-versus-3731.97 gap becomes a 0-versus-3731.97 gap that reads as growth." },
        { choice: 3, why: "LAG moves one row, not a fold; averages over the partition are a different window expression entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-15",
      prompt: "Two hosts tie at the top of the review ladder. After them, what rank does the next host get under RANK versus DENSE_RANK?",
      choices: [
        "RANK: 2, DENSE_RANK: 2",
        "RANK: 3, DENSE_RANK: 2",
        "RANK: 2, DENSE_RANK: 3",
        "Both: 3 — ties always consume two positions",
      ],
      answer: 1,
      why: "RANK skips after a tie (1, 1, 3); DENSE_RANK doesn't (1, 1, 2). The choice is a business decision about whether the ladder shows a gap where the tie consumed positions.",
      notes: [
        { choice: 0, why: "RANK's skip IS its signature — that's how leaderboards show two hosts sharing gold and nobody claiming silver." },
        { choice: 3, why: "Ties consume positions only under RANK's skipping scheme; DENSE_RANK packs ranks densely by design." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-16",
      prompt: "Per-statement coverage share divides settled cents by statement cents. One of the six no-leg statements has a 0 denominator in a variant query. What's the guard?",
      choices: [
        "COALESCE(denominator, 0)",
        "NULLIF(denominator, 0) around the denominator",
        "CAST the denominator to REAL",
        "WHERE denominator IS NOT NULL",
      ],
      answer: 1,
      why: "NULLIF(denominator, 0) turns the zero into NULL so the share becomes NULL — 'no base' — instead of SQLite's silent NULL-on-divide-by-zero. The NULL is the finding: a statement with no legs has no coverage, which is exactly why the sweep exists.",
      notes: [
        { choice: 0, why: "COALESCE(denominator, 0) replaces NULL with 0 — but the denominator isn't NULL, it's zero. The guard must catch the zero itself." },
        { choice: 3, why: "Filtering zero-denominator rows deletes the very statements the audit is hunting for — the sweep's job is to show them, not drop them." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-17",
      prompt: "Which shape prints placed, check-outs and cancelled in ONE pass over orders — 103, 82, 7 — sharing one population?",
      choices: [
        "Three separate SELECTs with their own WHERE clauses",
        "COUNT(*) plus COUNT(*) FILTER (WHERE …) per branch, in one SELECT",
        "COUNT(*) with GROUP BY status and a HAVING gate",
        "AVG(CASE WHEN … THEN 1 END) per branch",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts each branch against the same scan and the same 103-row population, so the branches must reconcile by construction. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable equivalent.",
      notes: [
        { choice: 0, why: "Three queries re-derive their own populations; one drifted WHERE and 82 + 14 + 7 no longer re-sums to 103 — and nobody can see which arm moved." },
        { choice: 2, why: "GROUP BY status gives the counts but pivots them into rows — the census needs the branches as columns on one shared base." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-18",
      prompt: "A fate CASE has WHEN status = 'cancelled' THEN 'dropped' and no ELSE. What do the cancelled rows carry — and what does COUNT(fate_col) report?",
      choices: [
        "'dropped' — the WHEN caught them",
        "NULL — and COUNT(fate_col) skips them while COUNT(*) keeps the row",
        "An error — CASE requires ELSE",
        "'pending' — the fallback label",
      ],
      answer: 1,
      why: "An ELSE-less CASE returns NULL when no WHEN matches. The rows survive with a NULL class; COUNT(col) skips NULLs so the dropped bookings vanish from that count while COUNT(*) still sees them — a census that quietly under-reports exactly the fate it was built to count.",
      notes: [
        { choice: 0, why: "The WHEN is the only thing that assigns 'dropped' — if it's misspelled or the vocabulary drifted, the row gets NULL, not the label." },
        { choice: 2, why: "ELSE is optional in SQL. That's precisely the danger: the missing arm is silent, not a syntax error." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-19",
      prompt: "SUM(amount_cents) over the paid book is 6,644,300. Which expression prints the deck's 66,443.00?",
      choices: [
        "ROUND(SUM(amount_cents), 2)",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents) / 100",
        "ROUND(AVG(amount_cents), 2)",
      ],
      answer: 1,
      why: "Dollars are the /100.0 display fold, rounded once at the end: 6,644,300 cents → 66,443.00. This book's cent sums are whole numbers, so a bare ROUND(sum, 2) reproduces the raw cents digits and looks folded — the ROUND-ambiguity trap.",
      notes: [
        { choice: 0, why: "The nastiest wrong answer: it executes, it 'rounds', and it prints 6644300 — units unchanged. Rounding is not a conversion." },
        { choice: 2, why: "Integer division: 6,644,300 / 100 = 66,443 exactly here, but on non-round books every statement's remainder truncates first — the convention is /100.0, every time." },
        { choice: 3, why: "AVG(amount_cents) = 316,395.24 cents — a per-statement average in cents, neither the total nor dollars." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-20",
      prompt: "The funnel wall filters to one month. Which WHERE keeps an index on created_at usable?",
      choices: [
        "WHERE SUBSTR(created_at, 1, 7) = '2025-02'",
        "WHERE STRFTIME('%Y-%m', created_at) = '2025-02'",
        "WHERE created_at >= '2025-02-01' AND created_at < '2025-03-01'",
        "WHERE CAST(created_at AS TEXT) LIKE '2025-02%'",
      ],
      answer: 2,
      why: "Sargable predicates leave the column bare against a range, so the engine can seek: the half-open window is index-shaped — and boundary-correct, which is why it's the house style. Wrapping the column in any function forces a per-row computation and a full scan.",
      notes: [
        { choice: 0, why: "Returns the right rows on ISO text — correctness and sargability are different axes, and this fails the second: the function wraps the column." },
        { choice: 3, why: "CAST plus a leading-pattern LIKE is two index-killers stacked — the slowest of the three wrong answers on any real funnel table." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-21",
      prompt: "The pricing benchmark uses (SELECT AVG(price) FROM products) = 71.78 for every listing. A teammate rewrites it as (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category). What changed?",
      choices: [
        "Nothing — both fold the same 16 listings",
        "The benchmark is now per-category: the inner fold re-runs per outer row, so Audio listings benchmark against Audio",
        "It errors — subqueries cannot reference the outer table's alias",
        "The benchmark now returns one row per product",
      ],
      answer: 1,
      why: "Referencing the outer alias makes the subquery correlated: its population changes per row (category), so each listing is benchmarked against its own shelf instead of the 71.78 catalog-wide market rate. Same verb, different population — a different metric with the same name.",
      notes: [
        { choice: 0, why: "The correlation is exactly the population change — 16 listings folded once versus each category's shelf folded per row." },
        { choice: 2, why: "Outer references are what correlated subqueries ARE. The failure mode here is cost and meaning, not legality." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-22",
      prompt: "GROUP_CONCAT(title) over a host's listings returns a different string on two consecutive runs. Why — and the fix?",
      choices: [
        "The titles changed between runs — re-run to confirm",
        "The fold has no ORDER BY inside the aggregate, so row order is unspecified — order inside the fold",
        "GROUP_CONCAT is nondeterministic by design — use MAX instead",
        "Add DISTINCT to freeze the order",
      ],
      answer: 1,
      why: "Without an explicit order inside the aggregate, the concatenation follows scan order, which the engine is free to change. An ordered fold makes the cell reproducible — and a stated delimiter keeps titles containing commas parseable.",
      notes: [
        { choice: 2, why: "MAX returns one value, not a fold — you'd trade an unordered string for the alphabetically-last title." },
        { choice: 3, why: "DISTINCT dedupes values but still specifies no order — two runs can disagree with zero duplicates present." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-23",
      prompt: "SELECT region, COUNT(*) AS placed … WHERE placed > 10 GROUP BY region — why does this fail, and what's the fix?",
      choices: [
        "Aliases are never allowed in SQL — rename the column",
        "WHERE runs before SELECT, so `placed` doesn't exist yet — group gates belong in HAVING COUNT(*) > 10",
        "Move it to ORDER BY placed > 10",
        "Add placed to GROUP BY",
      ],
      answer: 1,
      why: "The pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — the alias is assigned in SELECT, after WHERE, and the aggregate doesn't exist before the fold either. A gate on a folded count is a group-level fact and lives in HAVING.",
      notes: [
        { choice: 2, why: "ORDER BY runs last, so the alias exists there — but a sort clause doesn't filter rows; the gate would reorder, not remove." },
        { choice: 3, why: "Adding the count to GROUP BY explodes one group per count value — a census of counts, not the small-N gate the review asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-24",
      prompt: "SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id — how does it compare to the booked value 34,833.28?",
      choices: [
        "Equal — the join is lossless on order id",
        "Inflated: each booking's total repeats once per line — 251 lines over 103 orders, roughly 2.44x the book",
        "Deflated: the join drops orders without items",
        "It errors — SUM cannot follow a JOIN",
      ],
      answer: 1,
      why: "Fan-out: orders is one row per booking, order_items one row per line; the join repeats each total per line (2.44 lines per order on this book), so the SUM re-prices the marketplace. Fold at the needed grain first, then join — or own the line grain explicitly for category cuts.",
      notes: [
        { choice: 0, why: "Lossless for counting lines — but the SUM counts each booking 1, 2, or 3 times depending on its line count. Key losslessness is not sum safety." },
        { choice: 2, why: "Every order has lines on this book (251 lines / 103 orders); even where they didn't, missing rows would deflate — here the direction is inflation." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-25",
      prompt: "A first-stay cohort has 9 guests; 4 of them stayed again later. Which denominator does the retention rate use?",
      choices: [
        "Guests active in the later month — retention then tracks activity",
        "The frozen cohort size of 9 — everyone whose FIRST stay fell in that month",
        "All 16 guests on the book",
        "The 4 who returned — retention is always 100% then",
      ],
      answer: 1,
      why: "Cohort retention freezes the denominator at assignment: guests by month of first stay, divided by the cohort's original size — 4 of 9 here. A rolling base makes the curve rise as the cohort churns, which is the classic fake improvement.",
      notes: [
        { choice: 0, why: "That's the drift: the denominator shrinks with churn, so the rate climbs with abandonment. The base must be frozen and printed." },
        { choice: 3, why: "Returners over returners is a tautology. The read is of the assigned cohort — everyone who first stayed that month, returned or not." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-26",
      prompt: "A completion leaderboard by region shows a two-book region at 100%. What keeps the board honest?",
      choices: [
        "Filter the small region out in WHERE",
        "A HAVING COUNT(*) > 10 gate so small-N shares can't top the board",
        "Round the share to 0 decimals",
        "Sort ascending so the small region lands last",
      ],
      answer: 1,
      why: "The gate is a sample-size contract: below ten placements a share is noise wearing a percentage, and HAVING — a group-level gate — is where it lives. On this book that keeps EU 80.0, US 78.9, APAC 78.4 on the board and the two-book artifact off it.",
      notes: [
        { choice: 0, why: "Hiding one region is a different population, decided by hand — the gate is a stated rule any small region triggers, not a ban." },
        { choice: 3, why: "Reordering hides the artifact from the top without fixing the inference — and the next viewer sorts however they like." },
      ],
      difficulty: "medium",
    },
    {
      id: "airbnb-mcq-27",
      prompt: "STRFTIME('%m', created_at) buckets the trend by month. What's wrong with that key on this book?",
      choices: [
        "Nothing — months are months",
        "It drops the year: Jan-2024 and Jan-2025 merge into one bucket — use '%Y-%m'",
        "It returns week numbers instead of months",
        "It only works on DATE types, not text timestamps",
      ],
      answer: 1,
      why: "'%m' is month-of-year; this book spans 2024-01 through 2025-02, so the two Januaries fold into one bucket and the trend double-counts a season. The month spine carries the year: '%Y-%m' (or SUBSTR(created_at, 1, 7) on fixed ISO text).",
      notes: [
        { choice: 2, why: "Weeks are '%W' — the bug here is vocabulary, not granularity drift." },
        { choice: 3, why: "STRFTIME's job is parsing text timestamps — that's exactly what it's for; the bug is the format string, not the type." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-28",
      prompt: "Top-listing board: SELECT name FROM listings ORDER BY units_sold DESC LIMIT 1. Two listings tie at 36 units. What ships?",
      choices: [
        "The first alphabetically — ties resolve by name",
        "One of the two, engine-roulette — LIMIT 1 on a tie is nondeterministic; use a rank with a stated tie-break or return all tied rows",
        "Both — LIMIT 1 returns all ties",
        "An error — ORDER BY cannot handle ties",
      ],
      answer: 1,
      why: "The engine picks whichever tied row the plan emits first — a different winner on a re-plan. A leaderboard needs a deterministic rule: ROW_NUMBER with a full ORDER BY (units DESC, id ASC) and the tie-break stated, or return all top-tied rows with RANK.",
      notes: [
        { choice: 0, why: "Names sort nothing unless they're in the ORDER BY — and if they were, the 'top listing' definition quietly became alphabetical." },
        { choice: 2, why: "LIMIT 1 means one row, always. The tie is broken silently, not doubled — which is exactly why nobody notices." },
      ],
      difficulty: "hard",
    },
    {
      id: "airbnb-mcq-29",
      prompt: "Check-out latency averages 2.98 days on this book. Which is the honest fold?",
      choices: [
        "ROUND(julianday(shipped_at) - julianday(created_at)) per row, then AVG",
        "AVG(julianday(shipped_at) - julianday(created_at)) over the 82 latency-bearing rows, rounded once at the end",
        "AVG over all 103 bookings, treating NULL as 0",
        "MAX minus MIN per region",
      ],
      answer: 1,
      why: "Round once, at the end: per-row rounding shifts the mean before the fold, and the population is the 82 bookings that reached check-out — shipped_at IS NOT NULL. The 2..4-day raw range folding to 2.98 is only true because neither the population nor the rounding drifted.",
      notes: [
        { choice: 2, why: "Treating NULL latency as 0 drags the mean toward zero and launders pending and cancelled stays into instant check-outs — the population, not the rounding, is the bug." },
        { choice: 3, why: "Range is a spread read, not an average; 4 - 2 = 2 days says nothing about the typical stay." },
      ],
      difficulty: "easy",
    },
    {
      id: "airbnb-mcq-30",
      prompt: "Statement #28 is marked 'paid' with 1,756.00 and has zero payment legs. Which query catches it in the close?",
      choices: [
        "SELECT … FROM invoices WHERE status = 'paid'",
        "invoices LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL AND i.status = 'paid'",
        "invoices INNER JOIN payments ON p.invoice_id = i.id WHERE i.status = 'paid'",
        "SELECT SUM(amount_cents) FROM invoices WHERE status = 'paid'",
      ],
      answer: 1,
      why: "The anomaly is join-level absence, not a status value — #28 says 'paid' while carrying no leg. The LEFT JOIN anti-join keeps it (1 statement / 1,756.00) beside the 5 open no-leg statements / 13,461.00 that make the 6 / 15,217.00 sweep; the status filter is what finds the lie inside the sweep.",
      notes: [
        { choice: 0, why: "That's where the lie lives — the status column is exactly the field #28 corrupted. Trusting the flag re-reports the anomaly as a healthy close." },
        { choice: 2, why: "INNER JOIN drops statements without legs — the sweep's entire population — and shows only well-attached paid statements." },
        { choice: 3, why: "SUM folds 21 paid statements into one number; the 1,756.00 rides inside it, invisible — totals average anomalies away." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-airbnb-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The stay-completion map",
      brief:
        "Airbnb-flavored brief on the storefront db (orders = bookings, shipped_at = check-out): the supply review opens with the stay-completion map — of the bookings placed, how many ran their course to check-out, region by region — and the host-quality lead is explicit about the denominator: 'completion is check-outs over ALL placed bookings; cancellations and not-yet-open stays stay in the base.' Probed facts: 103 bookings split EU 45 / APAC 37 / US 19 / LATAM 2; a check-out is present on 82 of them (delivered 52 plus shipped 30 in the raw states) — EU 36, APAC 29, US 15, LATAM 2. LATAM's two-book pool wins no leaderboard: the map is gated to regions with more than ten placed bookings, so a small-N share can't top the board.",
      ask: "Return each region with more than ten placed bookings: bookings, check-outs, and completion share to one decimal, best completion first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS booked,\n       {4}(o.shipped_at) AS stayed,\n       ROUND(100.0 * COUNT(o.{1}) / COUNT(*), 1) AS stay_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) > {2}\nORDER BY stay_pct {3};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the check-out column",
          why: "COUNT(o.shipped_at) counts non-NULL check-outs — the stay-happened subset. created_at or status are never NULL, so either would read booked = stayed and print a flat 100% completion everywhere. COUNT(col)'s NULL-blindness is the definition here, not a bug.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the small-N gate",
          noVerify: true,
          why: "More than ten placed bookings keeps EU, US and APAC and drops LATAM's two-book pool, whose 100% share is a small-sample artifact, not a market signal. A threshold of 2 lets the artifact top the board; 19 silently drops the US.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The map reads best completion first — EU 80.0, US 78.9, APAC 78.4. ASC would open the review with APAC and read as a failure report; the same query, aimed at the opposite decision.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the check-out counter",
          why: "COUNT(o.shipped_at) folds each region's rows to the non-NULL check-out subset — 36, 15, 29. SUM would coerce the date strings into numbers (EU reads 72870), MAX returns the latest date text; neither is a count of stays.",
        },
      ],
      distractors: ["created_at", "status", "20", "19", "ASC", "SUM"],
      walkthrough:
        "A completion share is a survival read. The join attaches each booking to its guest's region — all 103 rows survive — GROUP BY folds them per region, and the two counters read two populations: COUNT(*) counts placements (45, 19, 37) while COUNT(o.shipped_at) counts check-outs (36, 15, 29), because shipped_at stays NULL until the stay happens and pending or cancelled bookings drop out of the numerator, never the denominator. The ratio is guarded twice: 100.0 forces real division before integer truncation can floor 78.947 to 78, and ROUND(…, 1) prints the share the review expects. HAVING COUNT(*) > 10 is the honesty gate — LATAM's two bookings complete at 100% and would top the board on sample size alone; gate it and the map reads EU 80.0, US 78.9, APAC 78.4, best first. The status-vocabulary trap sits in the check-out column: created_at and status are never NULL, so either silently turns completion into a flat 100% — a correct-looking query that claims every booking ran its course.",
    },
    {
      id: "cs-airbnb-2",
      tier: "easy",
      topic: "q2",
      universe: "pricing",
      title: "The above-market listing benchmark",
      brief:
        "Airbnb-flavored brief on the storefront db (products = listings): pricing wants a nightly-rate benchmark before the next Smart-Pricing review — the catalog-wide market rate to two decimals, and the count of listings priced above it. Probed facts: 16 listings from a 14.99 floor to the 199.99 Smart Watch S ceiling; the shelf splits 8 mid (avg 111.50) and 8 budget (avg 32.06); the market rate works out to 71.78. Six listings clear the bar — Fitness Band X2 at 79.00 up through the 199.99 watch — and the deliverable is one row, so the number drops straight into the pricing deck beside its own definition.",
      ask: "Return one row: the count of listings priced above the catalog-wide market rate, and that market rate rounded to 2 decimals.",
      template:
        "SELECT {1}(*) AS above_market,\n       ROUND((SELECT {2}(price) FROM products), {3}) AS market_rate\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the listing counter",
          why: "COUNT(*) counts the rows that survive the above-market predicate — 6 listings. SUM(*) and MAX(*) are syntax errors: only COUNT folds a star into a group count.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the market-rate fold",
          why: "AVG(price) over all 16 listings prices the market at 71.78. MAX would print the 199.99 ceiling as a 'market rate' and MIN the 14.99 floor — either redefines the benchmark and the deck's whole comparison silently changes meaning.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Money prints to 2 decimals: 71.78, not 71.8 or 72 — the shape every rate cell in the deck carries. ROUND to 0 would publish 72 and round a real benchmark away.",
        },
      ],
      distractors: ["SUM", "MAX", "MIN", "0"],
      walkthrough:
        "A benchmark is a fold plus a filter that must agree on their population. The inner SELECT AVG(price) folds all 16 listings to one scalar — 71.776875 raw, ROUND(…, 2) prints 71.78 — and the WHERE predicate keeps the six listings whose price clears it: 199.99, 149.99, 129, 119, 89.99, 79. The count cell and the rate cell therefore describe each other: six above 71.78, and 71.78 is the line they clear. Swap the fold to MAX and the 'market rate' becomes the 199.99 ceiling — an above-market count with zero context; MIN makes the 14.99 floor 'the market' and above-market becomes almost the whole shelf. ROUND to 0 publishes 72 — a different number than every other cell in the deck carries. And the scalar subquery returns exactly one row here; if the population ever filtered to empty it would return NULL and the predicate would silently keep nothing — the reason empty-inner-query checks belong in every benchmark review.",
    },
    // --- wave-3x expansion (cs-airbnb-3..6) — probe-derived cells declared ---
    // cs-airbnb-3 monthly cells are verbatim from the monthly trend table.
    // cs-airbnb-5 per-fate GBV folds (stayed 27,567.79 / open 6,113.00 /
    // dropped 1,152.49; sum ties to 34,833.28) are probe-derived readonly
    // against db/custom.db (counts 82/14/7 are verbatim status cells).
    // cs-airbnb-6 total row 27 legs / 69,612.00 is verbatim (re-verified
    // payments cells); rail rows card 16 / 37,364.00 and wire 11 / 32,248.00
    // are verbatim from the payments-by-method table.
    {
      id: "cs-airbnb-3",
      tier: "easy",
      topic: "t4",
      universe: "growth",
      title: "The demand spine",
      brief:
        "Growth review memo (orders = bookings): the deck opens with the demand spine — placed bookings and gross booking value by month — and the growth lead is explicit that the spine is a fold of ALL placed bookings, cancellations included. Probed facts: the book runs 14 months, 2024-01 through 2025-02, and only three months are thin enough to gate: 2024-06, 2024-11 and 2025-01 each placed 6. The top cell is 2024-01 at 8 placed / 3,731.97, and the reviewer wants months ordered by GBV so the strongest month leads. Month keys carry the year — '%Y-%m', not '%m' — because Jan-2024 and Jan-2025 must never merge.",
      ask: "Return every month with at least 7 placed bookings: month key, placed bookings, and GBV rounded to 2 decimals, strongest GBV first.",
      template:
        "SELECT STRFTIME('{1}', created_at) AS month,\n       COUNT(*) AS placed,\n       ROUND(SUM(total), {2}) AS gbv\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the month-key format",
          why: "STRFTIME('%Y-%m', …) keys each bucket with year and month — 2024-01 is January 2024 and never merges with 2025-01. '%Y' folds the whole spine into two yearly buckets and '%m' merges the two Januaries; either silently redraws the trend the review is about to read.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "GBV prints to 2 decimals — 3,731.97, not 3,732 or 3,731.9 — the shape every money cell in the deck carries. The raw totals are real dollars, so the fold is display-only, and ROUND(…, 1) would round a real benchmark away.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the thin-month gate",
          why: "HAVING COUNT(*) >= 7 keeps the eleven months that carry real weight and drops the three 6-placement months — 2024-06, 2024-11 and 2025-01 — from a 'strongest months' board. A gate of 1 lets every thin month back on; 8 silently drops the five 7-placement months the review expects to see.",
        },
        {
          answer: "gbv",
          kind: "keyword",
          label: "the leading sort",
          why: "ORDER BY gbv DESC opens the board with the strongest month — 2024-01 at 3,731.97. Sorting by month instead reads as a calendar, not a ranking, and the 'strongest demand' framing dies; sorting by placed opens with the two 9-placement months and tells a volume story the review didn't ask for.",
        },
      ],
      distractors: ["'%Y'", "'%m'", "1", "placed", "month"],
      walkthrough:
        "The spine is a fold plus two decisions made explicit. STRFTIME('%Y-%m', created_at) builds the month key — year attached, because '%m' alone would merge Jan-2024 with Jan-2025 and redraw seasonality; GROUP BY month folds 103 placed bookings into 14 buckets. The gate HAVING COUNT(*) >= 7 is a group-level fact — a row-level WHERE can't see a count — and it drops the three 6-placement months (2024-06, 2024-11, 2025-01) so a thin month can't ride the board. The two folds then read: COUNT(*) as placed, SUM(total) as GBV, printed through ROUND(…, 2) — 2024-01 at 8 / 3,731.97, 2024-02 at 9 / 3,609.64, 2024-09 at 9 / 3,116.04 — every cell verbatim from the monthly trend table. ORDER BY gbv DESC makes the strongest month lead; the same rows sorted by placed would open with the 9-placement months, and sorted by month would read chronologically — a different deliverable wearing the same rows.",
    },
    {
      id: "cs-airbnb-4",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The never-remitted sweep",
      brief:
        "Finance close memo (invoices = host payout statements, payments = remittance legs): the payout close cannot sign off on 'paid' flags alone — it signs off on legs. The anti-join sweep counts statements with NO remittance row and values them in dollars from integer cents. Probed facts: the sweep returns 6 statements / 15,217.00, split open 5 / 13,461.00 and paid 1 / 1,756.00 — the paid one is statement #28, a 'paid' flag with no money moved, the exact shape the close exists to catch. The reviewer wants the sweep split by statement status, biggest exposure first.",
      ask: "Return each statement status with no remittance leg: status, unremitted statement count, and exposure in dollars (2 decimals), largest exposure first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS unremitted,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id IS NULL\nGROUP BY i.{2}\nORDER BY exposure {3};",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the join key",
          why: "p.invoice_id = i.id attaches each statement's own legs; unmatched statements survive the LEFT JOIN with NULL legs and their amounts stay foldable in the same pass. p.id joins the leg to itself row-locally and empties the sweep; a bare id is ambiguous between the two tables.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the split grain",
          why: "GROUP BY i.status splits the sweep into open 5 / 13,461.00 and paid 1 / 1,756.00 — the split that separates a normal dunning queue from the paid lie. Grouping by i.id or i.amount_cents explodes the fold to one row per statement, a list where the split is unreadable.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure sort",
          why: "ORDER BY exposure DESC leads with the open cohort's 13,461.00 — the number the close must chase before sign-off. ASC leads with the 1,756.00 paid lie; a real finding, but the wrong headline for a review that asks 'what's outstanding?'",
        },
      ],
      distractors: ["p.id", "i.customer_id", "id", "amount_cents", "ASC"],
      walkthrough:
        "An anti-join is a population decision before it's a query. The LEFT JOIN attaches each statement's remittance legs; WHERE p.id IS NULL keeps exactly the statements no leg touched — 6 of 28 — and because they're LEFT-kept, their amounts are still foldable in the same pass. The fold runs at statement grain: COUNT(*) counts unremitted statements, SUM(i.amount_cents) / 100.0 converts integer cents to dollars once, and ROUND(…, 2) prints 13,461.00 open and 1,756.00 paid — cells that reconcile to the sweep's 15,217.00 total. The split by status is the finding: five open statements are a dunning queue; one paid statement with zero legs is a flag that lied, and the close stops for it. Every plausible substitution re-populates the sweep — joining by p.id empties it, grouping by customer or amount explodes it to statement grain, ASC buries the headline — which is why each slot is a definition, not a preference.",
    },
    {
      id: "cs-airbnb-5",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The booking-fate census",
      brief:
        "Funnel review memo (orders = bookings): the reconciliation wall hangs on one census — every placed booking lands in exactly one fate class: stayed (check-out present), open (pending), or dropped (cancelled). Probed facts: stayed 82 (52 delivered + 30 shipped), open 14, dropped 7 — 82 + 14 + 7 must re-surface as 103 placed or the wall doesn't ship. The reviewer also wants value per fate — 27,567.79 stayed / 6,113.00 open / 1,152.49 dropped, which sum to the 34,833.28 booked value. One pass, one population, branches as columns — that's the ask.",
      ask: "Return the fate census in one pass: each fate class with its booking count and booked value (2 decimals), busiest fate first.",
      template:
        "SELECT CASE\n         WHEN status IN ('delivered', 'shipped') THEN 'stayed'\n         WHEN status = '{1}' THEN 'open'\n         ELSE '{2}'\n       END AS fate,\n       COUNT(*) AS bookings,\n       ROUND({3}(total), 2) AS gbv\nFROM orders\nGROUP BY fate\nORDER BY bookings {4};",
      slots: [
        {
          answer: "pending",
          kind: "keyword",
          label: "the open-fate literal",
          why: "pending is the vocabulary that means 'not yet decided' — 14 bookings. 'cancelled' in this arm swaps the 14 and the 7 while the census still sums to 103, which is why the audit reads labels, not just totals; 'void' belongs to the invoice vocabulary, not orders, and silently empties the open class into the ELSE arm.",
        },
        {
          answer: "dropped",
          kind: "keyword",
          label: "the ELSE-arm label",
          why: "The ELSE arm is the exhaustiveness guarantee: cancelled bookings — 7 — land here with a name the review reads. An unnamed or reused ELSE label turns the census into a guess; the arm's count is how the 82 + 14 + 7 = 103 audit balances.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "SUM(total) prices each fate — 27,567.79 / 6,113.00 / 1,152.49, summing to the 34,833.28 book. COUNT would print the counts again as 'value'; AVG prints the mean booking per fate — a different metric wearing the same column header.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first sort",
          why: "ORDER BY bookings DESC leads with stayed 82 — the wall opens on survived demand. ASC would open the funnel review on the 7 dropped bookings; a churn read, not a census read.",
        },
      ],
      distractors: ["cancelled", "void", "kept", "COUNT", "MAX", "ASC"],
      walkthrough:
        "The census is one scan and three branches sharing one population. The CASE runs per row — delivered or shipped means a check-out happened, so 52 + 30 = 82 rows read 'stayed'; pending's 14 read 'open'; the ELSE arm names the remaining 7 'dropped' — and the GROUP BY folds each class to count and value. The audit is the point: 82 + 14 + 7 = 103 re-sums to placements, and 27,567.79 + 6,113.00 + 1,152.49 re-sums to the 34,833.28 booked value — two reconciliations the branches cannot fail because they shared the scan. The traps are all definitional: 'cancelled' in the pending arm swaps two fates while the totals still balance; a stray vocabulary word empties the open class into ELSE; COUNT in the value fold re-prints counts as money. A census that sums is not yet a correct census — the labels have to be the fates the business reads, which is why each arm is named in the query, not in a legend.",
    },
    {
      id: "cs-airbnb-6",
      tier: "medium",
      topic: "x3",
      universe: "supplier",
      title: "The remittance-rail stack",
      brief:
        "Supply-finance memo (payments = remittance legs): host payouts settle on two rails and the supply review wants the rail mix with a grand-total row appended — one stack, one fold, no second query drifting from the first. Probed facts: card carries 16 legs / 37,364.00 and wire carries 11 legs / 32,248.00; the re-verified totals are 27 legs / 69,612.00, which is exactly what the TOTAL row must print. The reviewer reads the stack small-to-large — rails first, grand row last — with every dollar cell at 2 decimals from integer cents.",
      ask: "Stack the rail census (method, legs, dollars at 2 decimals) and append a labelled TOTAL row with the all-rails legs and dollars, ordered smallest leg count first.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS rail_total\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT '{3}',\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM {1}\nORDER BY legs {2};",
      slots: [
        {
          answer: "payments",
          kind: "keyword",
          label: "the grand-row source",
          why: "The TOTAL arm folds the same payments table the rail arms folded — 27 legs / 69,612.00, the re-verified all-rails total. Stacking invoices instead appends the payout-statement book (28 / 86,977.00) under a label that says TOTAL, and the reconciliation dies quietly.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the grand-row-last sort",
          why: "ORDER BY legs ASC stacks wire 11, card 16, TOTAL 27 — rails first, grand row last, the way a close reads. DESC throws the total on top and the deck reads the conclusion before its arms.",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal TOTAL is the stack's contract: every row is traceable to its arm, and the grand row is distinguishable from a third rail. A vague label makes the 27-leg row read like a rail of its own.",
        },
      ],
      distractors: ["invoices", "orders", "DESC", "GRAND"],
      walkthrough:
        "The stack is two folds sharing one definition. The rail arm groups payments by method — card 16 / 37,364.00, wire 11 / 32,248.00, dollars printed through the /100.0 cents fold and ROUND(…, 2) — and the UNION ALL appends a second fold of the same table as TOTAL: 27 / 69,612.00, which equals the two arms summed, the reconciliation the stack exists to show. UNION ALL, not UNION: the arms share identical cell shapes and a deduped UNION could eat a row, breaking the very sum this report certifies. ORDER BY legs ASC keeps the reading order — rails, then the grand row — because a stack is an argument, and the argument ends with the total. The traps are sourcing and labelling: an invoices grand row appends a different book under the same label, and a renamed grand row blurs into the rails; both survive execution, which is why the label and the source are named decisions, not style.",
    },
  ],

  problems: [
    { slug: "funnel-step-conversion", why: "The search→book→check-out stage pivot: FIRST_VALUE over stage events is exactly how the funnel team measures step conversion — this kit's case-1 muscle in textbook form." },
    { slug: "median-time-to-convert", why: "Median emulation over search-to-booking latency: the typical-guest read Airbnb quotes instead of a mean that a months-late tail drags around." },
    { slug: "keep-latest-dedupe", why: "Booking and listing events duplicate under retries; ROW_NUMBER with an id tie-break keeps exactly one row — the dedupe reflex behind every honest funnel count." },
    { slug: "point-in-time-asof", why: "As-of joins against slowly changing listing attributes: what the price and cancellation policy WERE at booking time, not what they are now." },
    { slug: "ads-funnel", why: "Impression→click→purchase pivots to search→book: the same three-stage conditional-count shape the demand team ships weekly." },
    { slug: "email-engagement-funnel", why: "Host-newsletter opens→clicks→bookings: stage conversion with honest per-stage denominators, the growth team's read." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of guests per listing attribute: DISTINCT denominators folded per group — the two-grain census in ratio form." },
    { slug: "queries-quality-and-percentage", why: "Per-query quality ratios: the rating-share shape behind listing-quality scorecards." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Sent→accepted ratio is host-acceptance analytics: a rate whose denominator is requests, not guests — the definition fork every screen probes." },
    { slug: "monthly-transactions-i", why: "Month-bucketed bookings with status flags: the seasonality spine (SUBSTR month keys) every travel review hangs on." },
    { slug: "the-latest-login-in-2020", why: "Latest activity per guest per year: MAX with a date filter — guest-recency reads for reactivation campaigns." },
    { slug: "rank-scores", why: "Score ladders where ties must be handled explicitly: RANK versus DENSE_RANK as a business decision on review-score boards." },
    { slug: "the-most-recent-three-orders", why: "Each guest's last three stays via ROW_NUMBER: recency windows power the 'book again' surfaces." },
    { slug: "combine-two-tables", why: "LEFT JOIN guest profiles onto stays: the survival-rule drill — who stays in the report when the right side is empty." },
    { slug: "weather-type-in-each-country", why: "CASE over region values: demand mix by market — the segmentation shape behind regional supply reviews." },
    { slug: "game-play-analysis-iv", why: "The fraction of guests back the day after: next-day retention math = early-funnel conversion reads." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Browsed-but-never-booked guests: the anti-join demand list the growth team retargets — the funnel's leakiest step made visible." },
    { slug: "find-churn-risk-customers", why: "Repeat-guest lapse lists: guests whose stay cadence has gone quiet — the reactivation pool the trust flywheel runs on." },
    { slug: "sellers-with-no-sales", why: "Listed-but-never-booked hosts: the supply-side anti-join — activation without demand is a search-results page of dead inventory." },
    { slug: "report-contiguous-dates", why: "Contiguous booked-night runs: gaps-and-islands over the calendar — multi-night demand collapsed to spells, ops' blocking unit." },
    { slug: "human-traffic-of-stadium", why: "K consecutive high-occupancy nights: the streak shape behind heat maps and surge-pricing trigger windows." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Capacity-capped rolling load: the running-sum-with-limit shape behind listing caps and cleaning-ops scheduling." },
    { slug: "game-play-analysis-iii", why: "Cumulative nights per guest to date: the running window behind lifetime-value bands and tier progressions." },
    { slug: "budget-pacing", why: "Pacing breaches against plan: marketing spend versus budget by day — the growth team's weekly throttle read." },
    { slug: "monthly-transactions-ii", why: "Cancelled-versus-placed monthly stacks: set-op rows by status — the reconciliation grammar behind the month-close deck." },
    { slug: "count-salary-categories", why: "Payout-band census via stacked arms: one row per band plus a TOTAL — the small-N band board for host payout tiers." },
    { slug: "league-statistics", why: "Host scorecards in one pass: played, won, forfeit mix per host — the conditional-fold shape behind supply-quality boards." },
    { slug: "fix-names-in-a-table", why: "Guest-name casing normalization: trust matching fails on 'SMITH' versus 'Smith' before it fails on anything cleverer." },
    { slug: "invalid-tweets", why: "Field-length validation on listing titles: the paste-with-padding bug that breaks feeds and badges downstream." },
    { slug: "fix-product-name-format", why: "Listing-title casing hygiene: the catalog-side cleanup that keeps search matching and dedupe deterministic." },
    { slug: "trips-and-users", why: "The classic travel hard join: cancelled-share with exclusion filters across two tables — exactly the survival-rule knot this kit's cases untangle." },
    { slug: "active-users", why: "Rolling 30-day active-guest windows: the streak-based recency read behind 'book again' surfaces." },
  ],
};
