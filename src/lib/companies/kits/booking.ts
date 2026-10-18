// Booking.com — kit 2 of the Travel & Hospitality domain (Batch G).
// Reservations at scale: room-nights and occupancy, Genius-style loyalty
// tiering, cancellation-policy analytics, pay-at-property settlement sweeps
// and an A/B-everything experimentation culture. Registry pool = 5 tagged
// sql rows (consecutive-available-seats, customer-who-visited-but-did-not-
// transact, biggest-window-between-events, ab-test-conversion-lift,
// ab-sample-ratio-mismatch) — all five are used FIRST in problems and
// topics; the remaining picks are theme-curated to the reservations/
// occupancy/experimentation stack (header says so). Case studies run on the
// storefront db with probed figures (scripts/company-facts.md): orders =
// reservations, customers = guests, suppliers = properties, products =
// rooms/listings, invoices = reservation folios, payments = settlements.
// Facts-file figures only — no invented volumes.

import type { CompanyKit } from "../types";

export const bookingKit: CompanyKit = {
  id: "booking",
  domainId: "travel",
  name: "Booking.com",
  tagline: "Reservations, occupancy and cancellations",
  accent: "text-blue-500",

  brief: [
    "Booking.com is the reservation engine of travel — the Amsterdam-born marketplace that books more accommodation nights than anyone else, across millions of properties from city hotels to apartments, with a promise built on {rose:free cancellation}: book now, decide later. That promise defines the analytics. A reservation is not revenue until the stay happens; cancellation windows, no-shows and pay-at-property settlements are first-class metrics, and the gap between **placed, kept and settled demand** is the daily read. {violet:Genius loyalty} adds a second layer — tiered discounts that move conversion and margin at the same time, so every tier boundary is an economics decision.",
    "The data org runs at reservation scale. Supply teams model property onboarding, occupancy and content quality; demand teams own the looker-to-booker funnel and search ranking; experimentation runs continuously — every ranking, copy and policy change ships behind an A/B gate where the **sample-ratio check lands before any lift is read**; finance reconciles pay-at-property folios and settlement flows. Analysts live in SQL over event streams — searches, reservations, modifications, {rose:cancellations}, settlements, reviews — and every metric conversation starts with the denominator: *reservations or guests, placed or kept, booked or settled*.",
    "Screens favor operational SQL. Expect anti-joins (lookers who never transact, folios never settled), ratio reads with honest denominators (conversion lifts, cancellation shares), consecutive-state logic (nights available in a row), gap math between a guest's reservations, and `CASE`-tiered loyalty censuses that must reconcile to the guest count. You will be asked to *narrate grain and survival rules*, to spot **integer-cent division traps**, and to check an experiment's split ratio before quoting its lift. **A stack whose branches don't sum is a failed screen here.**",
    "Prep on the storefront practice db with the honest mapping — orders are reservations, customers are guests, suppliers are properties, products are rooms, `invoices` are folios, `payments` are settlements — and drill the four shapes Booking screens on: the **anti-join sweep**, the two-grain census, the `CASE` tier census, and the `LEAD` gap. Then practice the experiment discipline in order: sample-ratio check first, lift second, definition printed beside every number. This expanded kit is built for spaced practice rather than one sitting: **six case studies** now span the asks Booking data teams rehearse most — the Genius tier census, the unpaid-folio sweep, the reactivation gap, the room-nights ledger, the folio-status close stack and the double-cancellation months. Run each on the live db, then re-run it a week later from a blank editor — *the second pass is where recall actually forms* — and pair them with the **32-problem pool** below. The analysts who advance are the ones whose numbers reconcile — the branch sums, the tier counts, the folio totals.",
  ],

  dayInLife: [
    "**09:00 —** Morning opens on the reservations wall: overnight room-nights booked, looker-to-booker conversion, and {rose:cancellation rate} split by policy bucket — free-cancellation inventory moves differently from prepaid. Live experiments get their sample-ratio check before anyone reads a lift: if the arms didn't split as designed, **the lift is fiction** and the wall says so. Numbers ship with denominators in the label — 'cancellation share (of placed)' is a metric, 'cancellation rate' is a rumor.",
    "**11:30 —** Midday is deep-dive work: a {violet:Genius} discount-load review (which tier boundary moved bookings versus margin), occupancy forecasting against property supply in a launch market, and lead-time shifts — bookings arriving closer to check-in shrink the cancellation-exposure window and change the read. Then the settlement side: the pay-at-property sweep, where folios with no settlement row are counted and valued from integer cents (on the practice db: **6 unpaid folios worth 15,217.00**), and the partial-settlement folios get their own coverage class rather than a `WHERE` tweak.",
    "**14:00 —** The afternoon is stakeholder cycles: a partner-quality review built on review-score coverage (post-stay review rate is the flywheel), then the month-close pack — a `UNION ALL` stack of {emerald:settled}, {amber:partially-settled} and {rose:unpaid} folios with a TOTAL row that must reconcile against the folio census. The partner team reads coverage before it reads averages — a review nobody wrote is a property nobody can rank. When the stack's branches and the census disagree, the pack does not ship until the diff query says which side is missing rows.",
    "**17:00 —** You end the day writing definitions into the readout itself, because at reservation scale *the definition IS the deliverable*: the SQL is reproducible, **the denominator is the argument**. The pack closes with the branch-sum check printed beside the totals and the experiment's split ratio beside its lift. Tomorrow's wall opens against tonight's definitions — and they reconcile, in writing.",
  ],

  metrics: [
    { name: "Room-nights booked", what: "Count of nights reserved in a window — the physical unit the marketplace sells and the volume line every supply decision hangs on. Reservations vary in length; nights is the load measure occupancy and property onboarding are actually managed against." },
    { name: "Reservation conversion", what: "Share of lookers (searchers or property-viewers) who complete a booking — read per market, device and rank change. The demand funnel's master rate; every experiment and redesign is judged by its honest-denominator version of this number." },
    { name: "Cancellation rate", what: "Cancelled reservations divided by ALL placed, split by cancellation-window bucket and policy type. Free cancellation is the growth promise AND the leak: placed-versus-kept demand diverges exactly here, and the window split tells ops where to intervene." },
    { name: "Genius penetration", what: "Share of reservations (and of guests) holding Genius-tier status, plus the discount load the tiers carry. Loyalty tiers move conversion and margin simultaneously — the census that sizes eligibility is a recurring screen topic, and it must reconcile to the guest count." },
    { name: "Occupancy rate", what: "Nights sold divided by nights available across a property set — the supply-side utilization read. Occupancy is how property partners judge the platform, and how supply teams judge themselves; it is demand folded against inventory, never a standalone count." },
    { name: "Average lead time", what: "Days between booking and check-in, folded over kept reservations. Lead time is the cancellation-exposure window: bookings made closer to arrival have less time to cancel, which reshapes every placed-versus-kept read." },
    { name: "Pay-at-property share", what: "Share of reservations settled at the property versus prepaid — with the unpaid-folio exposure valued alongside. Pay-at-property is the AR story: folios with no settlement row (6 worth 15,217.00 on the practice db) are real money the sweep must name." },
    { name: "Review score coverage", what: "Share of completed stays that produce a review, and the score distribution beneath it. Reviews are the trust flywheel that drives conversion — coverage gaps are supply-side quality signals, not vanity metrics." },
  ],

  topics: [
    {
      name: "Anti-join sweeps",
      why: "Lookers who never transact and folios never settled are Booking's most-asked reads, and both are anti-joins: LEFT JOIN + IS NULL or NOT EXISTS, never a bare NOT IN with a NULLable key. The unpaid-folio sweep in this kit's cases is the same shape at money grain.",
      slugs: ["customer-who-visited-but-did-not-transact", "customers-who-never-order", "sellers-with-no-sales"],
    },
    {
      name: "A/B experiment reads",
      why: "Every ranking and policy change ships behind an experiment, so per-arm conversion, lift and the sample-ratio check are daily SQL. The discipline is ordered: SRM guard first, lift second — and both are conditional aggregates over the same fold.",
      slugs: ["ab-test-conversion-lift", "ab-sample-ratio-mismatch", "reported-posts-ii"],
    },
    {
      name: "Consecutive-state logic",
      why: "'Three nights available in a row' is relational, not aggregate: the calendar self-joins offset by one night and requires the availability flag at every link. It's the inventory logic behind every stay-length surface.",
      slugs: ["consecutive-available-seats", "human-traffic-of-stadium", "find-the-start-and-end-number-of-continuous-ranges", "consecutive-available-seats-ii", "report-contiguous-dates", "rising-temperature"],
    },
    {
      name: "Gap math with LEAD",
      why: "The space between a guest's reservations — the reactivation window — is LEAD over a per-guest partition, diffed and maximized. Span metrics (MAX minus MIN) masquerade as gap metrics and screens love to watch you refuse the swap.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "users-with-two-purchases-within-seven-days", "dormant-reactivation", "calculate-orders-within-each-interval", "calculate-parking-fees-and-duration"],
    },
    {
      name: "CASE tiering",
      why: "Genius-style tiers are CASE WHEN over per-guest folds, with thresholds that are policy, not data. Top-down evaluation order and an exhaustive ELSE arm are the audit: every guest classified exactly once, counts reconciling to the census.",
      slugs: ["count-salary-categories", "the-category-of-each-member-in-the-store", "monthly-transactions-ii", "find-loyal-customers"],
    },
    {
      name: "Ratio gates",
      why: "Answer rates, review coverage, low-quality shares — Booking filters populations by ratio, which means HAVING over a computed share with a guarded denominator. Ratio gates are where integer-division and NULL-denominator traps live.",
      slugs: ["get-highest-answer-rate-question", "card-launch-success", "low-quality-problems", "trips-and-users", "repeat-purchase-rate", "confirmation-rate", "cohort-repeat-revenue"],
    },
    {
      name: "Two-grain censuses",
      why: "Reservations and guests, bookings and bookers: two counts at two grains in one fold, per day or per month. The disagreement between them is the repeat-intensity signal the loyalty teams manage.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "article-views-ii", "customer-order-frequency", "flight-occupancy-and-waitlist-analysis"],
    },
    {
      name: "Argmax & top-N per property",
      why: "Latest reservation per listing, most-booked room per guest, best-reviewed three per property — argmax at scale is ROW_NUMBER over a partition, with the id tie-break that makes 'latest' deterministic.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "highest-grade-for-each-student", "top-travellers", "the-most-recent-three-orders", "game-play-analysis-v"],
    },
    {
      name: "Weekday & season buckets",
      why: "Travel demand has a weekly heartbeat — check-in-heavy Fridays, weekend leisure spikes — and a seasonal one. Weekday pivots and strftime week slices are the standing seasonality reads.",
      slugs: ["sales-by-day-of-the-week", "tasks-count-in-the-weekend", "convert-date-format"],
    },
    {
      name: "Stacked close packs",
      why: "The month-close pack stacks settled, partially-settled and unpaid folios with a TOTAL row via UNION ALL — column shapes matching positionally, branch literals naming the populations, and a sum that must reconcile.",
      slugs: ["the-airport-with-the-most-flights", "league-statistics", "count-apples-and-oranges"],
    },
  ],

  theory: [
    {
      id: "booking-t1",
      q: "The unpaid-folio sweep: why LEFT JOIN + IS NULL rather than a status filter — and what does WHERE p.id = NULL do instead?",
      a: "Because status is a claim and settlement rows are facts. A folio can carry status 'paid' with no payment row behind it — the practice db has one, folio 28 for 1,756.00 — so the sweep keys on the join: LEFT JOIN keeps all 28 folios, attaches settlements where they exist, and p.id IS NULL keeps exactly the unmatched — 6 folios, 15,217.00. The trap: p.id = NULL is a comparison against NULL, which is always UNKNOWN, so the sweep returns zero rows while looking clean — month-close ships blind. And INNER JOIN answers a different question entirely (only settled folios survive, so the sweep reads 0 unpaid). The anti-join is not a style choice; it is the only shape whose answer population is 'the ones nothing ever attached to'.",
      tag: "joins",
    },
    {
      id: "booking-t2",
      q: "How do you compute the longest gap between a guest's consecutive reservations — and why LEAD over a self-join or a span?",
      a: "LAG/LEAD over a per-guest partition: LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) pairs each reservation with the next one, the diff is that gap, and MAX over the diffs is the longest wait. LEAD beats the self-join because it carries the ordering once instead of rebuilding pairwise joins — and it beats MAX(created_at) - MIN(created_at), which is the guest's whole SPAN, first to last: a guest with monthly bookings over a year shows a 12-month 'gap' under span math and none in reality. Two disciplines: state the partition key out loud (gaps are per guest, never global), and decide what NULL means — a guest's first reservation has no previous one, and that row is the absence of a gap, not a gap of NULL days. The reactivation team reads exactly this number per campaign.",
      tag: "windows",
    },
    {
      id: "booking-t3",
      q: "Cancellation share by month: give the expression, and the two ways it silently lies.",
      a: "The honest shape folds numerator and denominator from the same rows: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), grouped by the month bucket. Lie one — integer division: 100 * 2 / 8 floors to 25 only by luck; 100 * 1 / 103 reads 0%, and cancellation shares live exactly in that range. The 100.0 multiplier promotes to real arithmetic before the division. Lie two — denominator drift: filtering cancelled rows (or any status) in WHERE before folding shrinks the base to the kept rows, and the 'share' becomes a ratio of the filter to itself. The practice db's monthly trend makes the read concrete: 2024-07 carried 2 cancellations of 8 placements and 2024-11 carried 2 of 6 — the two double-cancellation months — while the overall 7 of 103 (6.8%) hides both. The denominator is the definition; print it in the metric name.",
      tag: "aggregation",
    },
    {
      id: "booking-t4",
      q: "A guest's loyalty_tier is NULL for enrollments that predate the tier migration. What's your COALESCE policy when the Genius census runs?",
      a: "Guard, don't decorate. First decide whether NULL is a population ('legacy tier') or missing data — those are different censuses and only one of them is honest to fold into 'standard'. The CASE trap comes first: WHEN loyalty_tier = 'genius' … ELSE 'standard' silently classifies every NULL as standard, because NULL = 'genius' is UNKNOWN and the ELSE arm catches it — a whole cohort re-tiered without a decision. If the business wants legacy enrollments visible, add an explicit WHEN loyalty_tier IS NULL arm or COALESCE(loyalty_tier, 'legacy') at the fold's input. COALESCE at the DISPLAY edge — printing '—' instead of NULL — is presentation; COALESCE in the middle of the pipeline launders unknowns into fake standard members and the discount load computes against a population nobody defined. Say which population the tier census covers, then let the guard implement the decision.",
      tag: "nulls",
    },
    {
      id: "booking-t5",
      q: "Your alias works in ORDER BY but the same alias errors in WHERE. Explain with the evaluation order — and where does GROUP BY sit on aliases?",
      a: "Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT — where aliases are born — then ORDER BY. An alias cannot exist when WHERE executes, so the engine throws 'no such column'; SQLite pragmatically resolves aliases in GROUP BY, HAVING and ORDER BY (clauses at or after SELECT) but never in WHERE, and stricter engines agree on the WHERE part. The portable habit: reference the alias only in ORDER BY and write the underlying expression everywhere else. The Booking-specific bite is the tier census: GROUP BY tier works on the CASE alias, but the moment someone tries WHERE tier = 'genius_tier' they're filtering pre-aggregation on a label that doesn't exist yet — the fix is HAVING, or better, folding the CASE into a CTE with a name that carries the definition. Clause placement is which population the filter sees, not style.",
      tag: "pipeline",
    },
    {
      id: "booking-t6",
      q: "IN (subquery) versus EXISTS at reservation scale — which do you reach for, and what's the trap that empties a result set?",
      a: "EXISTS, with one exception. Semantically they differ on NULLs: x IN (subquery) is a chained equality — one NULL in the subquery makes every comparison UNKNOWN, and NOT IN (…, NULL) can never be TRUE, so the anti-join returns zero rows while looking healthy. That's not a performance footnote; it's a correctness cliff, and reservation keys arrive NULL more often than anyone admits (unassigned property, pre-import listing). EXISTS short-circuits on the first match and is NULL-blind in the right way — NOT EXISTS is the NULL-proof anti-join, and LEFT JOIN + IS NULL is its set-based twin. The exception where IN is fine: a small, constant, hand-written list — IN ('card','wire') — where no NULL can enter. At Booking the rule of thumb is drilled: membership against a TABLE is EXISTS; membership against a literal list is IN.",
      tag: "subqueries",
    },
    {
      id: "booking-t7",
      q: "Lead time is check-in minus booking date. How do you compute and bucket it on TEXT timestamps, and why are half-open windows non-negotiable?",
      a: "Compute with JULIANDAY(check_in) - JULIANDAY(created_at) — fractional days, rounded once at the end, never per row — and bucket with STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) on fixed-width ISO text; the SUBSTR shortcut dies the day the format drifts, so the range habit matters more. Half-open windows — created_at >= '2025-02-01' AND < '2025-03-01' — because BETWEEN on the last day drops everything after midnight: at reservation scale the last night of a season window is peak booking time, and a BETWEEN-boundary bug reads as a demand crash nobody can reproduce. The deeper convention: these strings carry no timezone, and lead time over kept reservations only exists for reservations that kept — say the population ('lead time of non-cancelled bookings') before the fold, because cancelled bookings have a lead time to CANCELLATION, a different metric wearing the same name.",
      tag: "dates",
    },
    {
      id: "booking-t8",
      q: "An experiment shows +18% lift, but the arm counts read 48 versus 52 of 100 on a designed 50/50 split. What do you check first, and in what order?",
      a: "The split, before the lift — sample-ratio mismatch invalidates the experiment: if the arms didn't receive the designed traffic, assignment is biased and the lift is fiction regardless of its size. The check is one fold: conditional counts per arm — COUNT(*) FILTER (WHERE arm = 'treatment') versus control — compared against the design ratio. Only then read conversion per arm (conditional aggregates again: converted over assigned, same fold, same population) and compute lift with 100.0 real division. Then the reconciliation habit: arm counts must sum to the assigned total, and converted-plus-not-converted must sum per arm — a stack that doesn't sum means duplicate assignments or an assignment log that drifted mid-flight. At reservation scale an SRM is usually an infrastructure bug, not a stats curiosity: the analyst who reads lift off a broken split becomes the incident; the one who catches the 48/52 becomes the person trusted with the next launch.",
      tag: "quality",
    },
    {
      id: "booking-t9",
      q: "The tier scan ranks guests by lifetime stays and four of them tie. Walk me through RANK versus DENSE_RANK versus ROW_NUMBER — and which one the deck wants.",
      a: "All three order rows, and the tie decides the vocabulary. ROW_NUMBER gives every row a distinct number regardless of ties — it invents an ordering the data doesn't contain. RANK gives tied rows the same rank and then skips the consumed rungs: four guests tied at rank 6 push the next guest to rank 10, printing phantom tiers 7–9 that no guest occupies. DENSE_RANK ties without gaps: the tied four share rank 6 and the next guest is 7. For a tier census the deck wants DENSE_RANK — tiers are strata, and strata don't have holes. For a leaderboard where position 10 means 'tenth place', RANK is honest. ROW_NUMBER is for argmax, where you need exactly one row and must supply the tie-break yourself. Say which tie semantics the business asked for, then pick the function — never the reverse.",
      tag: "windows",
    },
    {
      id: "booking-t10",
      q: "The month-close pack stacks settled, partially-settled and unpaid folios with a TOTAL row. Why UNION ALL and not UNION — and what makes the stack trustworthy?",
      a: "The populations are disjoint by definition — a folio lands in exactly one coverage class — so UNION ALL concatenates without a dedupe pass, which is both free and safer: if a definition bug ever makes two branches overlap, a bare UNION silently deletes the evidence and the pack still balances, while UNION ALL shows a double-counted row and the reconciliation fails loudly. Trustworthiness is three habits: every branch projects the same columns in the same positional order (column NAMES come from the first branch only), each branch carries a literal label naming its population, and the TOTAL row must reconcile to the folio census — 21 + 1 + 6 = 28 — before the pack ships. ORDER BY belongs outside the stack, sorting the combined result; the footer lands last only because the total exceeds every part.",
      tag: "setops",
    },
    {
      id: "booking-t11",
      q: "Three COUNTs walk into a fold: COUNT(*), COUNT(column), COUNT(DISTINCT column). Assign each a grain and say when the difference is the whole answer.",
      a: "COUNT(*) counts rows — the load grain: reservations placed, nights in the window, folios in the book. COUNT(column) counts rows where that column is non-NULL — the population-minus-missing grain, and the gap between COUNT(*) and COUNT(paid_cents) is the unpaid population, not a bug. COUNT(DISTINCT column) folds back to entities — the people grain: 103 reservations, 16 guests. On a joined result the assignment is sharper: after reservations fan out to line items, COUNT(*) counts lines, COUNT(DISTINCT o.id) counts bookings, SUM(quantity) counts nights — three grains in one table. The habit interviewers grade: attach a grain to every count out loud before defending any number, because 'bookings' and 'lines' disagree by exactly the multi-line factor and nobody argues with a labeled count.",
      tag: "aggregation",
    },
    {
      id: "booking-t12",
      q: "Build the nightly revenue running total. Why does SUM(SUM(total)) OVER (ORDER BY day) work — and what is SUM(total) OVER () instead?",
      a: "Two layers, two grains. GROUP BY day folds 103 reservations into daily buckets; the window then needs to accumulate those folded values, and inside a grouped query the only rows the window can see are the aggregates — so the window's argument is the aggregate itself: SUM(SUM(total)) OVER (ORDER BY day). Write SUM(total) OVER (ORDER BY day) and the engine errors or reads base rows the group no longer has. The bare OVER () with no ORDER BY is a different instrument: it aggregates over the whole partition, printing the same grand total on every row — the denominator for share-of-month reads, not momentum. And watch the frame: with ORDER BY inside OVER, the default frame accumulates from the start to the current row (a running total); without ORDER BY it's the whole set. Stage the fold in a CTE when the expression gets deep — the CTE owns the day grain, the outer query owns the window.",
      tag: "windows",
    },
    {
      id: "booking-t13",
      q: "When do you stage a fold in a CTE versus a derived table versus a correlated subquery — and what does staging buy in a review?",
      a: "Staging is how multi-grain reads stay honest. A derived table (FROM (SELECT …) x) folds one grain inline — per-booking line counts, per-guest stay counts — and the outer query aggregates the staged rows; best when the staging is used once. A CTE (WITH x AS (…) SELECT …) is the same fold with a name: better when the stage is referenced more than once, when the pipeline has more than two layers, or when the name itself carries the definition into the review — 'stays_per_guest' argues for you. A correlated subquery re-runs per outer row and answers per-row questions ('this booking vs its guest's average') at a per-row cost; it's the tool when the comparison is genuinely row-relative, and the thing to replace with a window or a join when it isn't. The review habit: each stage gets one grain and one job, and the query reads top-down like the argument it encodes.",
      tag: "subqueries",
    },
    {
      id: "booking-t14",
      q: "The market census must show every region — including the one with zero cancellations. How do you zero-fill without inventing rows?",
      a: "Decide which side owns the census. If the region list comes from the dimension table, drive the FROM from regions and LEFT JOIN the activity: every region survives, unmatched activity contributes NULLs, and COALESCE(SUM(x), 0) — or SUM over a 1/0 CASE that already yields 0 — prints the honest zero. The anti-pattern is aggregating first and letting INNER JOIN semantics drop the empty bucket: a region with no cancellations vanishes, and the cancellation map silently reads as 'no data' instead of 'no cancellations' — opposite conclusions. If the census is one table (per month, per status), you don't even need the join: conditional folds — SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) — print zeros natively because the ELSE owns the empty case. The discipline is the same either way: enumerate the buckets the business expects, and make the query print all of them.",
      tag: "aggregation",
    },
    {
      id: "booking-t15",
      q: "Property names arrive as 'smart watch s', 'Smart Watch S' and 'SMART WATCH S'. What's your normalization policy before these feed a join or a census?",
      a: "Normalize once, upstream of every consumer — in a CTE or a staging view — not ad hoc at each join. The workhorses: UPPER or LOWER for case-folded keys, TRIM for stray whitespace, REPLACE for separator drift, and a manual mapping table for the abbreviations no function can guess ('St.' versus 'Saint'). The reason it's a data-quality issue and not cosmetics: a join on a dirty key silently fan-outs or drops rows — the same room counted as two listings, or a reservation matching nothing — and the census doubles or shrinks with no error anywhere. Two disciplines to state out loud: display strings and join keys are different columns (fold the key, keep the pretty name for the deck), and the normalization is idempotent — running it twice changes nothing, which is what makes it safe to re-run on every load.",
      tag: "text",
    },
    {
      id: "booking-t16",
      q: "Beyond month buckets: how do you read the weekly heartbeat — check-in-heavy Fridays, weekend leisure spikes — and where does the weekday read go wrong?",
      a: "STRFTIME('%w', created_at) yields the weekday as text, 0 = Sunday through 6 = Saturday; GROUP BY it (or pivot it with CASE columns) and the weekly curve falls out — the Friday check-in peak, the weekend leisure hump. Three failure modes to name: %W is week-of-YEAR, not weekday — the classic silent swap; the weekday of created_at is the weekday of BOOKING, not of check-in — travel demand has two calendars and they disagree, so say which event the curve reads; and a weekday index with no year-month context folds four seasons together, so pair the slice (%Y-%m with %w) when seasonality is the argument. Bucket with SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', …), keep half-open window bounds for ranges, and round any fractional day math once, at the end.",
      tag: "dates",
    },
    {
      id: "booking-t17",
      q: "Where does COALESCE belong in a pipeline — and where is it laundering unknowns?",
      a: "Two legitimate homes, one crime scene. Home one: the fold's input, when the business has DECIDED that missing means a value — COALESCE(discount, 0) because a missing discount is zero-off, or an explicit WHEN loyalty_tier IS NULL arm that puts legacy enrollments in their own census. Home two: the display edge, where '—' replaces NULL for humans while the column stays NULL for math. The crime scene is the middle of the pipeline, where COALESCE launders unknowns into fake facts: COALESCE(loyalty_tier, 'standard') re-tiers a whole cohort nobody classified, and the Genius discount load computes against a population nobody defined. The test to say out loud: is NULL here a population, a missing value, or a display problem? Three different answers, three different clauses — and only one of them is COALESCE.",
      tag: "nulls",
    },
    {
      id: "booking-t18",
      q: "Beyond the calendar: where else does self-join adjacency show up at Booking, and what does the offset actually encode?",
      a: "Self-joins encode pairwise relationships on one table, and the join predicate IS the business rule. The availability read joins the calendar to itself offset by one night (a2.night = a1.night + 1) with the availability flag required at every link — chain to a third link and you have three nights in a row. The same shape runs the guest graph: reservations joined to reservations on the same customer with a date offset finds booking pairs; folios joined to folios on the same customer around the same dates finds duplicate bookings; listings joined to listings on the same property finds room clusters. Three disciplines: the offset is a definition (± 1 night, ± 7 days — state it), symmetric pairs need a de-duplication rule (a.id < b.id) or every pair prints twice, and adjacency is relational — aggregates structurally cannot see it, which is why COUNT of available nights is not 'three nights in a row', ever.",
      tag: "joins",
    },
    {
      id: "booking-t19",
      q: "A folio number appears twice in the ledger. Walk me through the detect-then-resolve pipeline for duplicates.",
      a: "Detection is the fold-gate pair: GROUP BY the business key (number, or the natural key — customer, dates, amount) and HAVING COUNT(*) > 1 keeps only the violated keys. Then resolve, which is a decision before it is SQL: keep-latest is ROW_NUMBER() OVER (PARTITION BY number ORDER BY updated_at DESC, id DESC) = 1, with the id tie-break making it deterministic; keep-both is the honest answer when the rows are genuinely distinct stays that share a number (a data-entry bug, not a duplicate booking). The trap is resolving in the same breath as detecting — a DELETE or a filter that runs before anyone looked at the pairs — and the audit habit: the deduped count plus the dropped count must reconcile to the raw count, in writing. Duplicate folios at settlement grain are real money mis-stated twice; the pipeline exists so the pack says which half survived.",
      tag: "quality",
    },
    {
      id: "booking-t20",
      q: "Dimension filters, aggregate gates: where does each live, and what does misplacement cost?",
      a: "The pipeline order decides: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. WHERE sees rows before the fold — that's where dimensions live (region = 'APAC', status = 'confirmed', the date window); HAVING sees groups after the fold — that's where aggregates live (HAVING COUNT(*) >= 2, HAVING share > 10%). Misplacing costs two different ways: an aggregate in WHERE fails to compile — the fold hasn't happened, SUM doesn't exist yet; a dimension in HAVING compiles on SQLite and reads backwards — you folded 103 rows and then threw most away, which is waste at best and a mislabeled denominator at worst. The share case is the sharpening stone: cancellation share per market needs NO status filter anywhere (numerator and denominator fold from the same rows), the market cut is WHERE region, and the 'only interesting markets' gate is HAVING on the share. Three filters, three clauses, one pipeline.",
      tag: "pipeline",
    },
    {
      id: "booking-t21",
      q: "'Latest reservation per listing', 'most-booked room per guest' — argue why the argmax belongs in SQL, and how you make it deterministic.",
      a: "In SQL it's one set-based statement instead of a per-entity loop, and the determinism is explicit: ROW_NUMBER() OVER (PARTITION BY listing ORDER BY created_at DESC, id DESC) = 1 — partition per entity, order by the recency (or volume) key descending, and break ties with the id so the same row wins every run. The competitors all fail visibly: MAX(created_at) finds the timestamp but not the ROW; a correlated subquery re-runs per listing; and the app-code loop with ORDER BY … LIMIT 1 returns A top row, not THE top row — on a tie the pick flips silently between runs, which is how a personalization surface changes overnight with no deploy. Two disciplines: state the tie-break policy out loud (id DESC is the convention; recency-then-id), and know when the ask wants ALL the tied winners — that's RANK, not ROW_NUMBER, and swapping them changes the answer's shape.",
      tag: "windows",
    },
    {
      id: "booking-t22",
      q: "Compare each reservation against its own guest's average value. Why is the correlated subquery the natural shape — and when do you refuse it?",
      a: "The correlated form — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-runs the inner fold once per outer row, and that per-row scope is exactly the question: each reservation against ITS guest's baseline, not the global 338-ish average. The costs and the exits: at 103 reservations it's fine; at reservation scale it's a re-aggregation per row, and the upgrade is staging the per-guest fold once — a derived table or CTE of guest averages, joined back — or a window (AVG(total) OVER (PARTITION BY customer_id)) that computes every guest's baseline in one pass and keeps every row for the comparison. Refuse the correlated shape when the inner query doesn't actually reference the outer row — that's an uncorrelated subquery pretending to be correlated, and the engine re-runs it for nothing. The review habit: name what the inner query sees per row, because that sentence IS the cost model.",
      tag: "subqueries",
    },
    {
      id: "booking-t23",
      q: "The regional packs read 25.0% and 33.3% cancellation. Why is averaging them NOT the overall share, and what is?",
      a: "Averaging shares is the ratio-of-ratios trap: it weights every group equally regardless of size, so two small months outvote a big one. The honest overall share recomputes from the parts: SUM(cancelled) across the groups divided by SUM(placed) — the weighted read — which on this db is 7 of 103 (6.8%), not the 29.2% an average of 25.0 and 33.3 would print. The same discipline runs sideways: a market's monthly shares don't average to the market's quarterly share unless every month placed the same volume. When someone hands you an average of percentages, the first question is 'weighted by what?' — and if the answer is 'by nothing', recompute from the numerators and denominators, both of which the folds already carry. Print the parts beside the weighted total and the argument ends itself.",
      tag: "aggregation",
    },
    {
      id: "booking-t24",
      q: "Timestamps arrive as TEXT with no timezone and the occasional format drift. What's your date-integrity policy before any calendar math ships?",
      a: "Four rules, stated before the query. One: assume nothing about format — SUBSTR(created_at, 1, 7) bucketing is a bet that the string stays fixed-width ISO, so profile first (LENGTH and GLOB sweeps find the '2025-2-7' rows that mis-bucket silently). Two: these strings carry no zone, so a 'day' boundary is a convention someone must own — write it into the metric name ('bookings per day, platform-local') rather than letting the reader assume UTC. Three: range filters are half-open (>= start AND < next-start), never BETWEEN on the last day — the season's biggest booking night dies at midnight otherwise. Four: compute with JULIANDAY for differences (fractional days, rounded once at the end), STRFTIME for buckets, and never mix the two in one expression. Date bugs don't throw — they print plausible numbers, which is why the policy ships before the query does.",
      tag: "dates",
    },
  ],

  mcqs: [
    {
      id: "booking-mcq-1",
      prompt: "Which shape finds guests who searched but never transacted — the visited-but-didn't-book read?",
      choices: [
        "INNER JOIN bookings b ON b.customer_id = s.customer_id",
        "LEFT JOIN bookings b ON b.customer_id = s.customer_id WHERE b.id IS NULL",
        "WHERE s.customer_id IN (SELECT customer_id FROM bookings)",
        "GROUP BY customer after an INNER JOIN, HAVING COUNT(*) = 0",
      ],
      answer: 1,
      why: "LEFT from the lookers side keeps every searcher; unmatched rows carry NULL booking keys and IS NULL keeps exactly them — the anti-join. The same shape, keyed on folios and settlements, is the unpaid-folio sweep.",
      notes: [
        { choice: 0, why: "INNER keeps only guests WITH bookings — the exact complement of the ask. The never-transacted guests die at the join." },
        { choice: 3, why: "After an INNER join there are no zero-count groups left to find; the population was filtered before the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-2",
      prompt: "A guest's loyalty_tier is NULL (pre-migration enrollment). CASE WHEN loyalty_tier = 'genius' THEN 'genius' ELSE 'standard' END — where do they land?",
      choices: [
        "genius — NULL matches everything",
        "standard — NULL fails the equality and falls to ELSE",
        "Error — NULL is not comparable in CASE",
        "A fourth NULL-tier row",
      ],
      answer: 1,
      why: "NULL = 'genius' is UNKNOWN, never TRUE, so the row falls through to ELSE 'standard'. A whole cohort just became 'standard' without anyone deciding that — the silent-tiering trap.",
      notes: [
        { choice: 0, why: "Equality against NULL is never TRUE — that's the entire trap. Nothing 'matches' NULL via =." },
        { choice: 2, why: "CASE doesn't error; it classifies quietly. The policy fix is an explicit WHEN loyalty_tier IS NULL arm — or COALESCE at the fold's input." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-3",
      prompt: "payments.amount_cents holds INTEGER cents — 16 card settlements totaling 3,736,400 cents. Which expression prints card volume in dollars?",
      choices: [
        "SUM(amount_cents)",
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "CAST(SUM(amount_cents) AS TEXT)",
      ],
      answer: 2,
      why: "Divide by 100.0 — real division promotes out of integer cents — then ROUND to money precision. These cells feed the finance pack, where a truncated cent is a reconciliation break.",
      notes: [
        { choice: 0, why: "That's still cents: the pack would print 3,736,400 as card volume instead of 37,364.00." },
        { choice: 1, why: "All-integer /100 is integer division — fine while every row divides evenly, and a silent truncator the day a 50-cent fee arrives. 100.0 is the habit." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-4",
      prompt: "An A/B gate splits traffic 50/50. Reservation counts read arm A 48, arm B 52 of 100, and the lift looks great. What comes FIRST?",
      choices: [
        "Ship it — 48 vs 52 is conversion",
        "Check sample-ratio mismatch: a 48/52 on a designed 50/50 means assignment is broken and any lift is suspect",
        "Double the traffic budget to smooth it out",
        "Re-run the query with UNION ALL",
      ],
      answer: 1,
      why: "SRM invalidates the experiment before lift is read: biased assignment makes the lift fiction. Conditional counts per arm against the design ratio is the cheapest guard in SQL — and it's checked before the endpoint, always.",
      notes: [
        { choice: 0, why: "That's reading the endpoint of a broken instrument. The discipline is ordered: ratio check, then lift." },
        { choice: 2, why: "Changing budget mid-flight re-randomizes assignment and re-triggers the same mismatch. Diagnose the split machinery first." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-5",
      prompt: "Which query finds runs of 3+ consecutive nights available for one listing (availability flagged 1/0 per night)?",
      choices: [
        "GROUP BY listing, availability HAVING COUNT(*) >= 3",
        "Self-join the calendar to itself offset by one night (a2.night = a1.night + 1), chaining to a third link, availability = 1 at every link",
        "AVG(availability) >= 3",
        "ORDER BY night and read it visually",
      ],
      answer: 1,
      why: "Consecutive-state logic is relational: the self-join carries adjacency — night N and night N+1 both available, chained — which aggregates structurally cannot see. It's the consecutive-available-seats shape at calendar grain.",
      notes: [
        { choice: 0, why: "COUNT counts available nights scattered across the month — adjacency is lost at the fold. 20 scattered available nights would pass." },
        { choice: 2, why: "AVG(availability) reads the rate, never the run — and 3+ would need 300% availability anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-6",
      prompt: "Longest gap between a guest's consecutive reservations — which window shape computes it?",
      choices: [
        "LAG/LEAD over PARTITION BY customer_id ORDER BY created_at, then diff and MAX",
        "MAX(created_at) - MIN(created_at)",
        "GROUP BY customer_id with AVG(created_at)",
        "COUNT(DISTINCT SUBSTR(created_at, 1, 7))",
      ],
      answer: 0,
      why: "LEAD pairs each reservation with the next per guest; the diff is that gap and MAX over diffs is the longest wait. It's the reactivation-window read, per guest — the partition is the definition.",
      notes: [
        { choice: 1, why: "Span measures first-to-last, not the quiet stretch between two reservations — a 12-month span with monthly bookings has no gap at all." },
        { choice: 2, why: "AVG over timestamps is nonsense math on text, and averages hide the single longest wait the ask names." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-7",
      prompt: "The unpaid-folio sweep (invoices LEFT JOIN payments … WHERE p.id IS NULL) returns 6. Why does folio 25 — 4,000 of 6,148 paid — escape it, and is that correct?",
      choices: [
        "Bug — partial settlements should count as unpaid",
        "Correct by definition: folio 25 HAS a settlement row, so p.id isn't NULL — the sweep measures zero-settlement exposure, and partials belong to a separate coverage class",
        "Bug — the LEFT JOIN dropped the row",
        "It doesn't escape — it appears twice in the result",
      ],
      answer: 1,
      why: "The anti-join keys on the existence of ANY settlement row. A 4,000 partial means p.id IS NOT NULL — excluded from 'no settlement' by construction. Exact / partial / none is a coverage census, a second query, not a WHERE tweak on this one.",
      notes: [
        { choice: 0, why: "A defensible business take — and a different metric. Conflating the zero-settlement sweep with the coverage census mislabels both numbers in the pack." },
        { choice: 3, why: "One payment row, one join match — it appears once. The fan-out risk is split-settled folios with TWO rows, and those are paid anyway." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-8",
      prompt: "WHERE customer_id NOT IN (SELECT customer_id FROM blacklist) returns ZERO rows even though most guests aren't blacklisted. The blacklist contains one NULL customer_id. Explain.",
      choices: [
        "NOT IN timed out and returned empty",
        "x NOT IN (…, NULL) can never be TRUE — one NULL poisons the whole list and the predicate fails every row",
        "The subquery needs DISTINCT",
        "NULLs are skipped by NOT IN; the empty result is coincidence",
      ],
      answer: 1,
      why: "NOT IN is a chained != comparison: x != NULL is UNKNOWN, and NOT UNKNOWN is still UNKNOWN — one stray NULL empties the result while the query looks fine. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof anti-join.",
      notes: [
        { choice: 2, why: "DISTINCT is a red herring — duplicates are harmless to NOT IN. The NULL is the poison, and no keyword removes it." },
        { choice: 3, why: "The opposite of the truth: NULLs are exactly what breaks it. 'Skipped' semantics belong to NOT EXISTS, which is why it's the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-9",
      prompt: "Treatment converts 14 of 100 lookers, control 9 of 100. Which expression computes relative lift honestly?",
      choices: [
        "100 * (14 - 9) / 9",
        "100.0 * (14 - 9) / 9",
        "14 - 9, labeled as lift",
        "100 * 14 / 9 - 100",
      ],
      answer: 1,
      why: "100.0 first: 500 / 9 in integer math floors to 55; the real answer is 55.6. And relative lift (55.6%) is a different metric from the 5-percentage-point gap — the pack must say which one it prints.",
      notes: [
        { choice: 0, why: "Integer division: 500/9 = 55 — a floored lift that compounds across every cell of the experiment pack." },
        { choice: 3, why: "1400/9 = 155 (integer, floored) minus 100 = 55 — the same truncation wearing a rearrangement. Order of operations never fixes integer math." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-10",
      prompt: "Cancellation share by month: which clause carries 'months with a share above 10%' — and why?",
      choices: [
        "WHERE 100.0 * SUM(cancelled) / COUNT(*) > 10 — filter early",
        "HAVING 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) > 10 — the share only exists after the fold",
        "ORDER BY the share — percentages are display concerns",
        "LIMIT with a subquery over the share",
      ],
      answer: 1,
      why: "The share is a group-level aggregate — it doesn't exist until GROUP BY folds the month. WHERE runs before aggregation and can't see SUM/COUNT; HAVING judges folded groups. On the practice db the gate catches 2024-07 (2 of 8) and 2024-11 (2 of 6).",
      notes: [
        { choice: 0, why: "WHERE can't compute aggregates at all — the fold hasn't happened in the pipeline (FROM → WHERE → GROUP BY → HAVING). It won't parse." },
        { choice: 2, why: "ORDER BY sorts but never filters — the thin months still print, just arranged by how badly they leak." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-11",
      prompt: "The operations wall wants reservations AND distinct guests per day side by side. The fold groups orders by day — which expression runs the guests column?",
      choices: [
        "COUNT(*) — rows are guests",
        "COUNT(DISTINCT customer_id) — repeat bookers fold back to people",
        "SUM(customer_id)",
        "COUNT(customer_id) minus COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) counts reservation rows; COUNT(DISTINCT customer_id) folds repeat bookings back to people — 103 reservations are 16 guests. The gap between the two columns IS the repeat-intensity signal the loyalty team manages.",
      notes: [
        { choice: 0, why: "Rows are reservations, not guests: a guest with five bookings contributes five rows, and the 'guests' column silently reads the load." },
        { choice: 2, why: "SUM adds the id VALUES — a meaningless number that grows with both bookings and id numbering. Aggregating an id is always a smell." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-12",
      prompt: "Content freshness wants each listing's most recent reservation. Two reservations tie on created_at. Which ROW_NUMBER ordering makes 'latest' deterministic?",
      choices: [
        "ORDER BY created_at only",
        "ORDER BY created_at DESC, id DESC — the id tie-break decides",
        "ORDER BY id only — ids track insertion anyway",
        "No ORDER BY — the engine keeps insertion order",
      ],
      answer: 1,
      why: "A window ordering must be total or ties resolve arbitrarily — the 'latest' row can flip between runs. created_at DESC picks the newest reservation and id DESC breaks ties deterministically, so the freshness report is reproducible.",
      notes: [
        { choice: 0, why: "The tie survives: same created_at, no second key, and SQLite's pick is an implementation detail your report now depends on." },
        { choice: 2, why: "id ordering answers 'last inserted', not 'latest created_at' — a backfilled import renumbers ids and flips every freshness read." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-13",
      prompt: "Lead time = days between booking (created_at) and check-in (check_in), both TEXT timestamps. Which expression computes it?",
      choices: [
        "check_in - created_at",
        "JULIANDAY(check_in) - JULIANDAY(created_at)",
        "DATEDIFF(check_in, created_at)",
        "STRFTIME('%d', check_in) - STRFTIME('%d', created_at)",
      ],
      answer: 1,
      why: "JULIANDAY converts each text timestamp to a fractional day number, so subtraction is honest day math (round once at the end). DATEDIFF isn't SQLite; raw text subtraction is numeric coercion garbage; %d slices day-of-month only.",
      notes: [
        { choice: 0, why: "Text minus text coerces '2025-03-10' to the number 2025 and the rest to garbage — the result looks like a number and means nothing." },
        { choice: 3, why: "Day-of-month diffs break on any month boundary: Feb 28 to Mar 2 reads -26 days. The fractional JULIANDAY diff survives every boundary." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-14",
      prompt: "Weekend leisure demand: which expression flags Saturday and Sunday bookings in SQLite?",
      choices: [
        "STRFTIME('%w', created_at) IN ('0', '6')",
        "DAYOFWEEK(created_at) > 5",
        "STRFTIME('%W', created_at) >= 5",
        "created_at LIKE '%Sat%' OR created_at LIKE '%Sun%'",
      ],
      answer: 0,
      why: "%w yields the weekday as TEXT with 0 = Sunday through 6 = Saturday, so IN ('0','6') is exactly the weekend pair. It's the standing seasonality slice behind the check-in-heavy Friday read.",
      notes: [
        { choice: 1, why: "DAYOFWEEK is MySQL — SQLite has no such function, and the query fails to compile rather than politely mis-answering." },
        { choice: 2, why: "%W is week-of-year (00–53), not weekday — week 40 is not the weekend." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-15",
      prompt: "The close pack stacks three folio classes via UNION ALL and a TOTAL row; the branch counts read 21, 1 and 6. What must the TOTAL row show for the pack to ship?",
      choices: [
        "21 + 1 + 6 = 28 — the branches must reconcile to the folio census",
        "The biggest branch, 21",
        "22 — the count of folios with any settlement row",
        "Whatever survives after UNION dedupes the branches",
      ],
      answer: 0,
      why: "The close pack is a reconciliation instrument: the TOTAL must equal the folio census (28) or the pack does not ship and the diff query names the missing rows. Branch sums that don't reconcile mean a definition drifted, not that arithmetic is hard.",
      notes: [
        { choice: 2, why: "22 is the settled-folio count from the payments join — a real number answering a different question. The TOTAL row foots the billed book, not the settled one." },
        { choice: 3, why: "UNION dedupe has no place in a stack of disjoint populations — and 'whatever survives' is how a broken branch hides inside a printed total." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-16",
      prompt: "The tier scan ranks guests by lifetime stays and four guests tie at 4 stays. The deck wants tier labels with no phantom gaps. Which window function?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY stays DESC)",
        "RANK() OVER (ORDER BY stays DESC)",
        "DENSE_RANK() OVER (ORDER BY stays DESC)",
        "NTILE(4) OVER (ORDER BY stays DESC)",
      ],
      answer: 2,
      why: "DENSE_RANK packs ties consecutively — the tied guests share a tier and the next count takes the very next tier, no invented strata. RANK skips the rungs the tie consumed, so a phantom tier appears that no guest occupies.",
      notes: [
        { choice: 1, why: "RANK's skip is exactly the phantom: four guests tie at rank 6 and the next guest reads rank 10, as if tiers 7–9 existed somewhere." },
        { choice: 0, why: "ROW_NUMBER splits the tie arbitrarily — it declares an ordering among guests the data says are equal, and the split changes run to run." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-17",
      prompt: "A coverage fold computes SUM(p.amount_cents) per folio; folios with no settlements show NULL. What's the defensible COALESCE policy?",
      choices: [
        "Decide first: COALESCE to 0 when the pack wants unpaid folios to read as zero settled, keep NULL when 'no settlement event exists' is the claim being made — then say which in the metric name",
        "Always COALESCE to 0 — NULL in a money column is a bug",
        "Never COALESCE — NULLs should propagate untouched",
        "COALESCE(paid_cents, 'none') so the cell prints a word",
      ],
      answer: 0,
      why: "NULL here is information ('nothing ever settled'), not dirt. Collapsing it to 0 is a definitional decision someone must own and print; mixing text into a numeric column breaks the type contract for everyone downstream.",
      notes: [
        { choice: 1, why: "0 says 'we settled nothing'; NULL says 'no settlement row exists'. The unpaid-folio sweep keys on that existence — laundering it to 0 hides the very population the sweep exists to find." },
        { choice: 3, why: "A text value in a cents column breaks every downstream SUM and every dashboard formatter. Guard at the display edge with the agreed symbol, never by changing the column's type." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-18",
      prompt: "A season window reads bookings 'from March 1 to March 31'. Which WHERE clause counts every March booking?",
      choices: [
        "WHERE created_at BETWEEN '2025-03-01' AND '2025-03-31'",
        "WHERE created_at >= '2025-03-01' AND created_at < '2025-04-01'",
        "WHERE STRFTIME('%m', created_at) = '3'",
        "WHERE created_at LIKE '2025-03-%'",
      ],
      answer: 1,
      why: "Half-open intervals — >= start, < next-month — include the whole last day, every hour of it. BETWEEN '2025-03-31' drops everything after midnight on the 31st, and the last night of a season window is exactly when booking volume peaks.",
      notes: [
        { choice: 2, why: "%m matches March of EVERY year — 2024-03 and 2023-03 leak into the window unless the year is filtered too. The bucket needs both parts." },
        { choice: 3, why: "LIKE works only while the format stays fixed-width ISO and silently mis-buckets the day the format drifts. Ranges on the column are the durable habit." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-19",
      prompt: "SELECT STRFTIME('%Y-%m', created_at) AS month … WHERE month = '2025-02' — what happens and why?",
      choices: [
        "Works — aliases are available everywhere in the query",
        "Errors: WHERE runs before SELECT, so the alias doesn't exist yet",
        "Silently returns every month",
        "Errors only if a real column is also named month",
      ],
      answer: 1,
      why: "Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT — the alias is born at SELECT. SQLite pragmatically resolves aliases in GROUP BY, HAVING and ORDER BY but never in WHERE, which is why GROUP BY month works and WHERE month doesn't.",
      notes: [
        { choice: 0, why: "That's the trap's shape: GROUP BY month is legal in SQLite, so people assume WHERE month is too. Clause placement decides which population a filter can even see." },
        { choice: 2, why: "It doesn't degrade — it fails to compile with 'no such column'. Silent broad filters are a different bug class entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-20",
      prompt: "Which expression counts cancellations correctly inside a per-market fold — and survives a market with zero cancellations?",
      choices: [
        "COUNT(CASE WHEN status = 'cancelled' THEN 1 END)",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 END)",
        "COUNT(status = 'cancelled')",
        "SUM(status = 'cancelled')",
      ],
      answer: 0,
      why: "COUNT counts non-NULLs: the CASE yields 1 for cancelled and NULL otherwise, so COUNT reads exactly the cancellation count — and prints 0 for a clean market. It's the portable conditional counter.",
      notes: [
        { choice: 1, why: "Same count on markets with cancellations — but with no ELSE 0, every-NULL input makes SUM return NULL, so a zero-cancellation market prints NULL instead of 0 and the pack's column breaks mid-table." },
        { choice: 2, why: "COUNT(expr) counts NON-NULL results — a boolean is never NULL, so this counts all placed rows and prints the denominator wearing the numerator's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-21",
      prompt: "'Show each guest's most-booked room.' A colleague loops guests in app code and runs ORDER BY bookings DESC LIMIT 1 per guest. What breaks?",
      choices: [
        "Nothing — LIMIT 1 is the argmax",
        "Ties: two rooms at the same count return one arbitrarily, and the loop hides the flip — ROW_NUMBER with an explicit tie-break decides once, in SQL",
        "Performance only — the logic is sound",
        "LIMIT needs an OFFSET to work per group",
      ],
      answer: 1,
      why: "LIMIT 1 returns A top room, not THE top room: on a tie the pick is engine-arbitrary and changes silently between runs. ROW_NUMBER() OVER (PARTITION BY guest ORDER BY count DESC, room) makes the argmax deterministic and set-based.",
      notes: [
        { choice: 2, why: "N queries per guest is a cost smell, but the real defect is correctness: the personalization surface changes on tie days and nobody can say why." },
        { choice: 3, why: "OFFSET is for pagination, not grouping — and adding it wouldn't make the per-guest pick deterministic." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-22",
      prompt: "Cancellation share per market — but the review only wants APAC. Where does region = 'APAC' go?",
      choices: [
        "HAVING region = 'APAC' — it's a group filter",
        "WHERE region = 'APAC' — it's a row-level dimension, filtered before the fold; the share still computes honestly from the surviving rows",
        "Both WHERE and HAVING, to be safe",
        "A subquery is the only correct way",
      ],
      answer: 1,
      why: "Dimension filters live in WHERE — they cut rows before GROUP BY, and the APAC share folds from exactly the APAC placements. HAVING is for group-level aggregates like the share gate itself (share > 10%). Print the population: 'cancellation share (of APAC placements)'.",
      notes: [
        { choice: 0, why: "HAVING on a dimension works in SQLite but reads the pipeline backwards — the fold happened, then rows were dropped. Reserve HAVING for the aggregate gate." },
        { choice: 2, why: "Stacking both is redundancy, not safety: the second filter re-asks a question the first already answered, and reviewers read it as two definitions." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-23",
      prompt: "A status filter WHERE status = 'paid' misses rows typed 'Paid'. Which guard catches them?",
      choices: [
        "WHERE UPPER(status) = 'PAID' — normalize both sides of the comparison",
        "WHERE status LIKE '%paid%'",
        "WHERE status != 'Paid'",
        "WHERE TRIM(status) = 'paid'",
      ],
      answer: 0,
      why: "Normalize both sides once — UPPER on the column and the literal — and every casing variant matches. Casing drift is how a settlement sweep undercounts while looking healthy.",
      notes: [
        { choice: 1, why: "LIKE drags in unrelated tokens ('unpaid', 'prepaid') and its case-insensitivity is a SQLite ASCII default, not a contract — the fix must not depend on an accident." },
        { choice: 3, why: "TRIM strips whitespace, not case — 'Paid' still fails the equality after trimming." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-24",
      prompt: "Card settlements total 3,736,400 cents over 16 payments. Which expression prints the mean settlement in dollars, correctly rounded?",
      choices: [
        "AVG(amount_cents)",
        "AVG(amount_cents) / 100",
        "SUM(amount_cents) / COUNT(*) / 100.0",
        "ROUND(AVG(amount_cents) / 100.0, 2)",
      ],
      answer: 3,
      why: "AVG folds to the mean in cents (233,525), /100.0 promotes to real dollars (2335.25), and ROUND prints money precision once, at the end. The card pack's mean-settlement line is this expression.",
      notes: [
        { choice: 1, why: "Integer /100 truncates: on an odd-cent mean the cents silently vanish. The .0 is the whole discipline." },
        { choice: 2, why: "SUM/COUNT on integers is integer division FIRST — the floor happens before /100.0 ever sees the value. AVG keeps the float; re-deriving it by hand reintroduces the truncation." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-25",
      prompt: "A momentum read wants nightly booked revenue with a running total across the month, every row kept. Which shape?",
      choices: [
        "GROUP BY day with SUM, then eyeball the accumulation",
        "SUM(SUM(total)) OVER (ORDER BY day) after grouping by day — the window aggregates the folded day totals",
        "SUM(total) OVER () — the same figure on every row",
        "MAX(total) OVER (ORDER BY day)",
      ],
      answer: 1,
      why: "Two layers, two jobs: GROUP BY folds 103 reservations to day grain, and the window's SUM over the aggregated SUM accumulates them in order — a running total that keeps every day. In a grouped query the window must aggregate the already-aggregated value.",
      notes: [
        { choice: 2, why: "SUM(total) OVER () is the grand total — the same number on every row. It's the denominator for share-of-month reads, not a running one." },
        { choice: 3, why: "MAX walks a running HIGH-WATER mark — it ratchets up and never comes down, which is a different (and misleading) momentum curve." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-26",
      prompt: "The availability matrix pairs every room with every night of March before bookings mark what sold. Which join builds the grid?",
      choices: [
        "INNER JOIN bookings b ON b.room_id = r.id",
        "CROSS JOIN rooms × nights — the deliberate grid — then LEFT JOIN actual bookings to flag sold nights",
        "LEFT JOIN rooms r ON r.id = b.room_id WHERE b.id IS NULL",
        "UNION ALL of rooms and nights",
      ],
      answer: 1,
      why: "Occupancy is demand folded against capacity, and capacity is the full grid — every room × every night, sold or not. CROSS JOIN builds it deliberately; the booking join then marks sold nights and the empty cells — the whole point — survive as NULLs.",
      notes: [
        { choice: 0, why: "INNER keeps only nights with bookings: the unsold nights — the exact thing occupancy measures — never appear in the result." },
        { choice: 2, why: "That's the sold/unsold anti-join, a useful read — but it throws away the grid. No grid, no denominator, no occupancy rate." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-27",
      prompt: "An ops queue pages through unpaid folios 10 per page. Which clause fetches page 3?",
      choices: [
        "LIMIT 10 OFFSET 20",
        "LIMIT 20 OFFSET 10",
        "LIMIT 3, 10",
        "LIMIT 10 OFFSET 3",
      ],
      answer: 0,
      why: "Page 3 at 10 per page skips the first 20 rows: LIMIT 10 OFFSET 20. And note the comma form — LIMIT offset, count — reverses the arguments, which is why the keyword form is the house habit.",
      notes: [
        { choice: 1, why: "That's page 2 with 20 rows — off-by-one page AND a doubled page size, the classic pagination drift that makes the queue 'miss' folios." },
        { choice: 3, why: "OFFSET 3 skips three ROWS, not three pages — the queue re-reads the top of the list every time." },
      ],
      difficulty: "easy",
    },
    {
      id: "booking-mcq-28",
      prompt: "Two folios share invoice number 'INV-2044'. Which query surfaces the duplicates?",
      choices: [
        "SELECT number FROM invoices GROUP BY number",
        "SELECT number, COUNT(*) FROM invoices GROUP BY number HAVING COUNT(*) > 1",
        "SELECT DISTINCT number FROM invoices",
        "SELECT * FROM invoices WHERE number = number",
      ],
      answer: 1,
      why: "GROUP BY folds to number grain and HAVING keeps only groups with 2+ rows — the detect half of the dedupe story. The fold-gate pair is the standard duplicate sweep at reservation scale.",
      notes: [
        { choice: 0, why: "The bare fold prints every number once — duplicates collapse INTO the result instead of standing out of it." },
        { choice: 2, why: "DISTINCT dedupes silently — the opposite of detection: the anomaly disappears and the ledger looks cleaner than the book is." },
      ],
      difficulty: "medium",
    },
    {
      id: "booking-mcq-29",
      prompt: "After joining reservations to their line items (103 orders → 251 rows), which pair of expressions counts bookings and room-nights correctly?",
      choices: [
        "COUNT(*) for bookings; SUM(oi.quantity) for nights",
        "COUNT(DISTINCT o.id) for bookings; SUM(oi.quantity) for nights",
        "COUNT(oi.id) for bookings; COUNT(*) for nights",
        "SUM(o.total) for bookings; COUNT(*) for nights",
      ],
      answer: 1,
      why: "The join fans to line grain: COUNT(DISTINCT o.id) folds rows back to the 103 bookings while SUM(oi.quantity) adds the nights (quantity per line). Say the grain of every column out loud — bookings, nights and lines are three different counts wearing one table.",
      notes: [
        { choice: 0, why: "COUNT(*) after the join counts 251 line rows as 'bookings' — the fan-out lie every multi-line booking commits." },
        { choice: 2, why: "COUNT(oi.id) counts lines (251) and COUNT(*) counts the same rows — both bookings columns are really line counts." },
      ],
      difficulty: "hard",
    },
    {
      id: "booking-mcq-30",
      prompt: "Which GROUP BY pairs with SELECT STRFTIME('%Y-%m', created_at) AS month to fold bookings into months?",
      choices: [
        "GROUP BY month — SQLite resolves the alias",
        "GROUP BY STRFTIME('%Y-%m', created_at) — the underlying expression",
        "Both run on SQLite; the expression is the portable habit",
        "GROUP BY created_at",
      ],
      answer: 2,
      why: "SQLite resolves aliases in GROUP BY, so both compile and both fold correctly — but stricter engines reject the alias form. The portable habit writes the expression; the alias is a convenience, not a contract.",
      notes: [
        { choice: 0, why: "True on SQLite, false elsewhere — a query that only compiles on one engine is a portability bug wearing a working demo." },
        { choice: 3, why: "GROUP BY the raw timestamp groups per reservation — 103 groups of one row, the monthly fold never happens." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-booking-1",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The Genius-eligibility census",
      brief:
        "Booking.com-flavored brief on the storefront db (orders = reservations, customers = guests): the loyalty team is sizing a Genius-style tier program and wants the guest base folded by lifetime stay count — one stay (first_stay), two to four stays (returning), five or more (genius_tier, the discount-eligible band). Probed facts: 16 guests, 14 of them repeat bookers; the stay histogram runs 3 guests at 2 stays, 2 at 3, 4 at 4, 1 at 5, and a heavy tail at 13, 14, 17 and 24 stays — Alice Chen alone books 24 reservations worth 7,262.35. The census must fold to three labeled tiers whose counts reconcile to 16, biggest tier first; the thresholds are policy, so they live in the query, not in a comment.",
      ask: "Fold guests into first_stay / returning / genius_tier by lifetime stay count (5+ = genius) and return each tier with its guest count, biggest first.",
      template:
        "SELECT CASE\n         WHEN stays >= {1} THEN 'genius_tier'\n         WHEN stays >= {2} THEN 'returning'\n         ELSE 'first_stay'\n       END AS tier,\n       {4}(*) AS guests\nFROM (SELECT customer_id, COUNT(*) AS stays FROM orders GROUP BY customer_id)\nGROUP BY tier\nORDER BY guests {3};",
      slots: [
        {
          answer: "5",
          kind: "number",
          label: "the genius threshold",
          why: "Five or more stays is the discount-eligible band: one guest at exactly 5 stays joins the 13/14/17/24 tail to make 5 genius-eligible guests. A threshold of 4 pulls the four 4-stay guests in and resizes the discount budget overnight.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the returning floor",
          why: "Two or more stays below the genius line is the returning band — 9 guests (3 at two stays, 2 at three, 4 at four). A threshold of 3 strands the three 2-stay guests in first_stay and misreads the onboarding cohort.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "The review reads biggest tier first: returning 9, genius 5, first_stay 2. ASC would open on the 2-guest onboarding bucket as if it were the headline — the same query, aimed at the wrong end of the story.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the guest counter",
          why: "COUNT(*) counts the folded per-guest rows in each tier — 9, 5, 2, summing to the 16 guests the histogram promises. SUM(*) isn't SQL and MAX(*) would report one guest per tier; the census lives or dies on the count reconciling.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "4", "10"],
      walkthrough:
        "Two layers, two grains. The derived table folds 103 reservations to one stays row per guest — the histogram's 16 rows — and the outer CASE labels each guest: >= 5 genius_tier, >= 2 returning, ELSE first_stay. CASE evaluates top-down, so the >= 5 arm must sit ABOVE the >= 2 arm — swap them and genius_tier becomes unreachable, a silent policy change nobody approves. The ELSE arm is the exhaustiveness audit: every guest lands somewhere, and the tier counts must reconcile to 16 — 9 returning, 5 genius-eligible, 2 first-stay. The thresholds are the program's economics, not data facts: 5 is the discount gate, 2 is the return-guest floor, and moving either moves the census before any data does — a threshold of 4 inflates the eligible band from 5 to 9 guests. ORDER BY guests DESC opens the review on the 9-guest returning band, the tier the growth team can actually move this quarter. A tier census that doesn't sum to the guest count is how discount budgets get sized on a broken fold.",
    },
    {
      id: "cs-booking-2",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The unpaid-folio sweep",
      brief:
        "Booking.com-flavored brief on the storefront db (invoices = reservation folios, payments = settlements): month-close wants the pay-at-property exposure — folios with NO settlement row — counted and valued, because those are reservations the properties must still collect. Probed facts: 28 folios; 21 settled exact (65,612.00), 1 partial (folio 25: 4,000.00 of 6,148.00), and 6 with zero settlements worth 15,217.00 — including folio 28, which carries status 'paid' with no payment row behind it, and folio 11, void but settled for 925.00. The sweep must key on the anti-join, not on folio status: status vocabulary lies, settlement rows don't. Money is stored in integer cents and must surface in dollars.",
      ask: "Return one row: the count of folios with no settlement row, and their combined value in dollars to 2 decimals.",
      template:
        "SELECT {1}(*) AS unpaid_folios,\n       ROUND({2}(i.amount_cents) / 100.0, 2) AS unpaid_value\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the folio counter",
          why: "COUNT(*) counts the unmatched folio rows the LEFT JOIN preserves — 6. AVG(*) and SUM(*) aren't SQL; and the count must key on folios, never on payment rows, because the ask is exposure, not settlements.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "SUM(i.amount_cents) adds the 6 unpaid folios' amounts — 1,521,700 cents — each once, because an unsettled folio has no payment row to fan it out. AVG would print the average folio (2,536.17) as the exposure; MAX would print the single biggest.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the anti-join half",
          why: "LEFT JOIN keeps every folio, matched or not, so the WHERE can keep the unmatched — the 6 unpaid. INNER would keep only settled folios and return 0; the sweep would report a clean book with 15,217.00 still outstanding.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the unmatched test",
          why: "p.id IS NULL is the only TRUE-able test for a preserved-but-unmatched row. p.id = NULL compares against NULL and is always UNKNOWN — the sweep returns 0 rows and month-close ships blind.",
        },
      ],
      distractors: ["AVG", "MAX", "INNER", "= NULL", "CROSS"],
      walkthrough:
        "The anti-join is a survival read. LEFT JOIN preserves all 28 folios, attaching settlement rows where they exist — the five split-settled folios attach two rows each, folio 25 attaches its single 4,000 partial — and WHERE p.id IS NULL keeps exactly the rows where nothing attached: 6 folios, with no fan-out risk because an unpaid folio carries zero payment rows by definition. SUM(i.amount_cents) folds their amounts once — 1,521,700 cents — and the /100.0 promotes integer cents to real dollars before ROUND(…, 2) prints 15,217.00. The traps are all semantic: INNER JOIN answers a different question (settled folios) and reports 0 unpaid; = NULL is never TRUE and empties the sweep; and status is the red herring the brief warns about — folio 28 says 'paid' with no settlement behind it, folio 11 is void but settled for 925.00, so the sweep keys on the join, not the label. That is why the anti-join, not the status filter, is the month-close instrument: settlement rows are facts; status strings are claims.",
    },
    {
      id: "cs-booking-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The reactivation gap",
      brief:
        "Booking.com-flavored brief on the storefront db (orders = reservations, customers = guests): the winback team wants the dormancy read — each guest's longest wait between consecutive reservations — and every guest whose longest wait crosses the 120-day reactivation line lands in the next campaign. Probed facts: 103 reservations over 16 guests, 14 of whom book more than once (Liam O'Brien and Olivia Brown book once and have no gap to measure). LAG-paired gaps make the leaderboard: Hiro Tanaka 299 days, Keiko Sato 241, Noah Meyer 155, Pedro Alvarez 130, Jamal Wright 129, Maya Patel 120 — six guests at 120 or more. The volume engine reads the other way: Alice Chen books 24 reservations and never goes 120 days silent, which is exactly the difference between load and dormancy the campaign needs to respect.",
      ask: "Return each guest whose longest wait between consecutive reservations is at least 120 days: guest name and longest gap in whole days, biggest gap first.",
      template:
        "WITH gaps AS (\n  SELECT customer_id,\n         JULIANDAY(created_at) - {1}(JULIANDAY(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap_days\n  FROM orders\n)\nSELECT c.name AS guest,\n       CAST(ROUND(MAX(gap_days)) AS INTEGER) AS longest_gap_days\nFROM gaps g\nJOIN customers c ON c.id = g.customer_id\nWHERE gap_days >= {2}\nGROUP BY c.id, c.name\nORDER BY longest_gap_days {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-reservation reader",
          why: "LAG pairs each reservation with the one before it, per guest — the diff is that gap. LEAD reads forward and hands every row the NEXT reservation, so every diff goes negative and the 120-day filter empties the result; the window's MAX would compare each row to the running max and read 0 everywhere.",
        },
        {
          answer: "120",
          kind: "number",
          label: "the reactivation line",
          why: "The dormancy threshold is the campaign's definition, and 120 keeps exactly the six probed guests — binding on Maya Patel's 120-day gap. A line of 121 silently drops Maya; 300 drops everyone and the winback team mails nobody.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-gap-first direction",
          why: "The campaign opens on the most dormant guest: Hiro Tanaka's 299-day silence. ASC would lead with Maya's 120 — a correct query telling the reactivation story backwards, newest-come-home first and the 299-day case buried.",
        },
      ],
      distractors: ["LEAD", "MAX", "ASC", "121", "300"],
      walkthrough:
        "Stage, pair, fold, cut. The CTE walks every reservation with LAG over a per-guest partition ordered by created_at — JULIANDAY(created_at) minus the previous one is that guest's gap in fractional days, NULL on each guest's first reservation because no previous row exists (an absence of a gap, not a zero-day gap). The outer query folds per guest with MAX(gap_days) — the LONGEST wait, not the span: MAX(created_at) minus MIN(created_at) would read Alice Chen's first-to-last stretch as a giant gap when she never actually goes quiet. WHERE gap_days >= 120 performs the campaign cut before the fold, keeping the six probed guests, and ORDER BY longest_gap_days DESC opens on Hiro Tanaka's 299-day silence. The partition is the definition — gaps are per guest, never global — and the 120 line is policy, not data: move it to 121 and Maya Patel falls out of the campaign overnight.",
    },
    {
      id: "cs-booking-4",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The room-nights ledger",
      brief:
        "Booking.com-flavored brief on the storefront db (orders = reservations, order_items = reservation lines where quantity is nights, products = rooms, suppliers = property operators): the supply review reads occupancy from the physical unit — room-nights — not reservations. Probed facts: 103 reservations carry 251 lines and 498 room-nights across 16 rooms under 6 property operators. The load leader is Desk Mat Extended (Alpine Audio GmbH) at 47 nights over 24 reservations for 1,176.02 — while Noise-Canceling Headset books one fewer night (46) for 6,888.25, the ledger's money leader. The supply floor for the review is 30 booked nights: ten of the sixteen rooms clear it, together carrying 357 of the 498 nights.",
      ask: "Return each room with at least 30 booked room-nights: room, property, room-nights, distinct reservations and room revenue (2dp), busiest room first.",
      template:
        "SELECT p.name AS room,\n       s.name AS property,\n       {1}(oi.quantity) AS room_nights,\n       COUNT(DISTINCT o.id) AS reservations,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS room_revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY p.id, p.name, s.name\nHAVING room_nights >= {2}\nORDER BY room_nights {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the nights adder",
          why: "Room-nights are the physical unit: SUM(oi.quantity) adds nights per line — 47 for Desk Mat Extended. COUNT(oi.quantity) counts LINES (a 3-night line is one row), and the load read shrinks from 498 nights to 251 rows wearing a nights name.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the supply floor",
          why: "The HAVING gate judges a per-room aggregate, so it lives after GROUP BY. Thirty keeps the ten probed rooms and binds exactly on the three 30-night rooms; 31 drops those three, and 21 lets the quiet tail back in — the floor is the review's definition of 'carrying load'.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The supply review opens on the load leader — Desk Mat Extended at 47 nights. ASC would lead with the 30-night rooms and bury the head; and the second column warns against trusting this order for money: the 46-night Headset books 6,888.25 where the 47-night leader books 1,176.02.",
        },
      ],
      distractors: ["COUNT", "AVG", "ASC", "31", "21"],
      walkthrough:
        "A three-join chain, two grains, one floor. The chain walks reservation → line → room → property (orders, order_items, products, suppliers), and the fan-out is the point: each line carries its room's supplier, so GROUP BY p.id folds 251 lines back to 16 room rows. Inside each fold the columns carry different grains and say so: SUM(oi.quantity) adds nights (the physical load — 498 across the db), COUNT(DISTINCT o.id) folds lines back to distinct reservations (a guest booking the same room across two reservations is two, not one), and SUM(quantity × unit_price) prices the nights. HAVING room_nights >= 30 is the supply floor — an aggregate gate, so HAVING, never WHERE — keeping ten rooms and 357 of the 498 nights. ORDER BY room_nights DESC leads with Desk Mat Extended, and the ledger's own two orderings disagree on purpose: the nights leader is not the money leader, which is exactly why the review reads both columns side by side.",
    },
    {
      id: "cs-booking-5",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The folio-status close stack",
      brief:
        "Booking.com-flavored brief on the storefront db (invoices = reservation folios, money in integer cents): month-close foots the folio book by status before the settlement sweep runs. Probed facts: 28 folios split open 6 / $19,609.00, paid 21 / $66,443.00, void 1 / $925.00 — TOTAL 28 / $86,977.00. The census floor is six: status classes carrying at least 6 folios print in the stack, and the single void folio gets read by hand. The trap sits beside the numbers: status is a claim, not a settlement — folio 28 says 'paid' with no payment row behind it and folio 25 is 'open' with $4,000 already settled, which is why the settlement sweep (the anti-join case) values the unpaid at $15,217.00 while this status census prints $19,609.00 for the same six open folios. Both are correct; they measure different things, and the pack labels which is which.",
      ask: "Return each status class with at least 6 folios — class, folio count, dollars (2dp) — plus a TOTAL footer row, smallest dollars first.",
      template:
        "SELECT i.status AS class,\n       COUNT(*) AS folios,\n       ROUND(SUM({1}) / 100.0, 2) AS dollars\nFROM invoices i\nGROUP BY class\nHAVING COUNT(*) >= {2}\nUNION ALL\nSELECT {3} AS class,\n       COUNT(*),\n       ROUND(SUM(i.amount_cents) / 100.0, 2)\nFROM invoices i\nORDER BY dollars {4};",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents fold",
          why: "SUM(amount_cents) folds the raw integer-cent column and /100.0 reads dollars: open 19,609.00, paid 66,443.00. SUM(100.0) folds a constant and prints the folio counts (6, 21) as money — the divider-misplacement that makes a money book read like a tally.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the census floor",
          why: "HAVING COUNT(*) >= 6 keeps the two classes with a real book — open (6, binding exactly) and paid (21) — and drops the single void folio ($925.00) to a by-hand read. A floor of 1 keeps the void singleton in the stack; 21 drops open; 28 empties the detail and leaves only the TOTAL.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the footer label",
          why: "The grand row is labelled 'TOTAL' — 28 folios, $86,977.00 — so the footing is visible beside the two folds and the pack reconciles to the folio census in one glance. Any other label prints the same numbers under a name the close checklist will not recognize.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the footer-last direction",
          why: "Ascending dollars puts open (19,609.00) then paid (66,443.00) in order and lands TOTAL (86,977.00) last — the footer sorts last only because the whole exceeds every part. DESC makes the 86,977.00 footer leap to the headline row, the classic grand-total-stack failure.",
        },
      ],
      distractors: ["100.0", "1", "21", "DESC", "'GRAND'"],
      walkthrough:
        "Two folds, one stack, one footing — and a definition warning printed beside them. The detail branch groups 28 folios by status and folds the integer-cent column: open 6 / 19,609.00, paid 21 / 66,443.00, with the HAVING floor at six dropping the void singleton to a by-hand read. The TOTAL branch re-scans the unfiltered table — 28 folios, 86,977.00 — and UNION ALL concatenates it without a dedupe pass, because the populations are disjoint by construction and any overlap should SHOW, not vanish. ORDER BY dollars ASC is the quiet lesson: the footer lands last only because 86,977.00 exceeds every part; flip to DESC and the footer becomes the headline. The distractors each break a different promise: 100.0 inside the SUM turns the money book into a folio tally; a floor of 1 drags the void row into the stack, 21 drops the open class, 28 empties it; a wrong label breaks the tie-out; DESC inverts the read. And the pack carries the caveat in its own numbers: this status census values the open folios at 19,609.00, while the settlement sweep values the unpaid at 15,217.00 — status is a claim, settlements are facts, and month-close reads both.",
    },
    {
      id: "cs-booking-6",
      tier: "hard",
      topic: "t4",
      universe: "funnel",
      title: "The double-cancellation months",
      brief:
        "Booking.com-flavored brief on the storefront db (orders = reservations): the ops review reads the cancellation curve by month, and the intervention gate is explicit — only months carrying at least TWO cancellations make the deck. Probed facts: 103 placed reservations, 7 cancelled overall (6.8% — a quiet book), across 14 months from 2024-01 to 2025-02. Most months carry zero or one; exactly two months carry two: 2024-07 with 2 of 8 placed (25.0%) and 2024-11 with 2 of 6 (33.3%). The gate must lift those two out of fourteen months without touching the denominator rule: the share folds cancelled and placed from the SAME rows — no status filter anywhere — because filtering cancelled rows first shrinks the base to the numerator and every month reads 100%.",
      ask: "Return month, placed, cancelled and cancel_pct (1dp) for every month with at least 2 cancellations, chronological.",
      template:
        "SELECT STRFTIME('%Y-%m', created_at) AS month,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / {1}(*), 1) AS cancel_pct\nFROM orders\nGROUP BY month\n{2} cancelled >= {3}\nORDER BY month;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the placed denominator",
          why: "COUNT(*) holds every placed reservation in the month — 8 in July, 6 in November — from the same rows the numerator folds. SUM(*), AVG(*) and MAX(*) are all invalid folds of a star: the denominator is a row count, full stop.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the gate clause",
          why: "The gate judges a per-month aggregate (the folded cancellation count), so it lives in HAVING — the clause that exists only after GROUP BY. WHERE cancelled is a syntax error: no groups exist yet at filter time, and misplacing the gate is how a review silently re-scopes its own population.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the intervention threshold",
          why: "Two cancellations is the gate, and it binds exactly on the two probed months — 2024-07 (2 of 8, 25.0%) and 2024-11 (2 of 6, 33.3%). A threshold of 1 lets the three single-cancellation months into the deck; 3 empties it and the intervention meeting has no agenda.",
        },
      ],
      distractors: ["SUM", "AVG", "WHERE", "1", "3"],
      walkthrough:
        "One table, one fold, one gate — and the denominator discipline that makes the share honest. STRFTIME('%Y-%m', created_at) buckets 103 reservations into 14 monthly rows; COUNT(*) holds each month's placements while the CASE flags turn status into 1/0 per row and SUM adds the cancelled branch — numerator and denominator from the same rows, which is the entire rule. 100.0 promotes the division before truncation: 2024-07 prints 25.0 (2 of 8) and 2024-11 prints 33.3 (2 of 6), the only months the >= 2 gate lets through. HAVING is the only legal home for the gate — WHERE can't see aggregates, the fold hasn't happened — and ORDER BY month keeps the timeline chronological so the deck reads as a curve, not a leaderboard. The distractors all die differently: SUM(*)/AVG(*) in the denominator slot are syntax errors, WHERE before GROUP BY can't judge the folded count, and a threshold of 1 floods the deck with single-cancellation noise while 3 empties it. The overall 6.8% hides both hotspot months — the monthly cut with the honest denominator is where interventions come from.",
    },
  ],

  problems: [
    { slug: "customer-who-visited-but-did-not-transact", why: "The looker-without-booking anti-join: Booking's most-asked sweep shape, and the unpaid-folio case's direct twin." },
    { slug: "ab-test-conversion-lift", why: "Per-arm conversion and lift with honest denominators — the experiment read every ranking and policy change ships behind." },
    { slug: "ab-sample-ratio-mismatch", why: "The SRM guard: conditional counts per arm checked against the design ratio BEFORE any lift is believed." },
    { slug: "consecutive-available-seats", why: "Consecutive-nights-available via self-join: the inventory logic behind every 'you can stay three nights' read." },
    { slug: "biggest-window-between-events", why: "LEAD-based gap math between a guest's reservations: the reactivation window, quantified per guest." },
    { slug: "count-salary-categories", why: "UNION ALL tier census: first-stay / returning / Genius bands stacked in one result with a labelled total row." },
    { slug: "the-category-of-each-member-in-the-store", why: "Spend-tier CASE labeling: loyalty tiering as a fold over per-guest totals — thresholds as policy." },
    { slug: "monthly-transactions-ii", why: "Cancelled versus kept per month: the cancellation-window read, split by status in one pass." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivot of demand: the occupancy-week shape — check-in-heavy Fridays — in CASE-pivot form." },
    { slug: "tasks-count-in-the-weekend", why: "strftime %w weekend slicing: weekend-versus-weekday demand, the seasonality cut the reviews run weekly." },
    { slug: "daily-leads-and-partners", why: "Two-grain daily census: reservations and distinct guests per day — load versus audience in one fold." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly bookings versus bookers: the two-grain census at month grain, cancellation-inclusive by definition." },
    { slug: "department-top-three-salaries", why: "Top-3 per property via windows: 'best-reviewed three listings per host' in drill form." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest reservation per listing: ROW_NUMBER argmax — supply-recency reads for content-freshness reviews." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each guest's most-booked listing: argmax with ties — the personalization team's starter query." },
    { slug: "the-airport-with-the-most-flights", why: "Two-sided counting (arrivals plus departures): a marketplace counts both sides — demand and supply in one stack." },
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Occupancy and waitlist in one fold — the supply-side utilization read Booking's market managers live in, demand folded against capacity rather than counted alone." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration × daily-rate pricing with boundary rules — stay-length economics where a one-night-off error misprices the folio, the lead-time discipline at money grain." },
    { slug: "top-travellers", why: "Per-traveler volume folds ranked biggest-first — the guest-leaderboard shape behind Genius tiering and the winback list, ordered honestly." },
    { slug: "trips-and-users", why: "The golden cancellation-rate join: cancelled over placed per city with the denominator protected — Booking's placed-versus-kept read in textbook form." },
    { slug: "dormant-reactivation", why: "The dormancy sweep that feeds winback: guests gone quiet past a threshold — the reactivation-gap case's campaign half, per guest, never global." },
    { slug: "repeat-purchase-rate", why: "Repeat-guest share with the ≥2 gate explicit — the loyalty input Genius sizing reads first, and a ratio whose denominator is decided, not inherited." },
    { slug: "customer-order-frequency", why: "Monthly booking-frequency census — the two-grain read (reservations versus bookers) at month grain, cancellation-inclusive by definition." },
    { slug: "find-loyal-customers", why: "The 2+-stay loyalty gate as a grouped fold with a threshold — the Genius-eligibility census's drill-form cousin, reconciling to the guest count." },
    { slug: "cohort-repeat-revenue", why: "Revenue attributed to repeat cohorts — where loyalty economics gets its money number, folded from the same rows as the census it must match." },
    { slug: "consecutive-available-seats-ii", why: "The consecutive-availability escalation: runs with the extra constraint attached — 'three nights in a row AND changeable' is relational logic, never an aggregate." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over dates: contiguous runs become reportable open-availability windows — the inventory streak shape straight from the clinic." },
    { slug: "calculate-orders-within-each-interval", why: "Bucketing events into defined intervals — the lead-time and season-window cuts Booking runs weekly, with half-open bounds done right." },
    { slug: "rising-temperature", why: "Consecutive-day comparison — yesterday versus today at event grain: the demand-trend instinct behind every daily wall read, adjacency made relational." },
    { slug: "the-most-recent-three-orders", why: "Top-3 recency per entity with deterministic ordering — the argmax-with-tie-break habit the freshness and personalization surfaces run on." },
    { slug: "game-play-analysis-v", why: "First-event-then-return retention — the first-stay-then-come-back read that sizes onboarding cohorts, computed as one CTE plus one window check." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched means zero — the confirmation read with its NULL policy stated, the experiment pack's most-asked ratio." },
  ],
};
