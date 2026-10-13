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
    "Prep on the storefront practice db with the honest mapping — orders are reservations, customers are guests, suppliers are properties, products are rooms, `invoices` are folios, `payments` are settlements — and drill the four shapes Booking screens on: the **anti-join sweep**, the two-grain census, the `CASE` tier census, and the `LEAD` gap. Then practice the experiment discipline in order: sample-ratio check first, lift second, definition printed beside every number. The analysts who advance are the ones whose numbers reconcile — the branch sums, the tier counts, the folio totals.",
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
      slugs: ["consecutive-available-seats", "human-traffic-of-stadium", "find-the-start-and-end-number-of-continuous-ranges"],
    },
    {
      name: "Gap math with LEAD",
      why: "The space between a guest's reservations — the reactivation window — is LEAD over a per-guest partition, diffed and maximized. Span metrics (MAX minus MIN) masquerade as gap metrics and screens love to watch you refuse the swap.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "CASE tiering",
      why: "Genius-style tiers are CASE WHEN over per-guest folds, with thresholds that are policy, not data. Top-down evaluation order and an exhaustive ELSE arm are the audit: every guest classified exactly once, counts reconciling to the census.",
      slugs: ["count-salary-categories", "the-category-of-each-member-in-the-store", "monthly-transactions-ii"],
    },
    {
      name: "Ratio gates",
      why: "Answer rates, review coverage, low-quality shares — Booking filters populations by ratio, which means HAVING over a computed share with a guarded denominator. Ratio gates are where integer-division and NULL-denominator traps live.",
      slugs: ["get-highest-answer-rate-question", "card-launch-success", "low-quality-problems"],
    },
    {
      name: "Two-grain censuses",
      why: "Reservations and guests, bookings and bookers: two counts at two grains in one fold, per day or per month. The disagreement between them is the repeat-intensity signal the loyalty teams manage.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "article-views-ii"],
    },
    {
      name: "Argmax & top-N per property",
      why: "Latest reservation per listing, most-booked room per guest, best-reviewed three per property — argmax at scale is ROW_NUMBER over a partition, with the id tie-break that makes 'latest' deterministic.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "highest-grade-for-each-student"],
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
  ],
};
