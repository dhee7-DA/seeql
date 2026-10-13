// Gojek — Wave-8 (Task 96), mobility domain, 0 tagged LC — theme-curated;
// facts from scripts/company-facts.md. Southeast Asia's everything app:
// GoRide rides, GoFood deliveries, GoMart groceries and the GoPay wallet
// stacked on one user account. No registry tags — the pool is theme-curated
// from scripts/company-pools.md's theme menu; every problem mirrors a
// workflow Gojek's growth, city-ops and payments teams are known to probe.
// Case studies run on the storefront db — mapped honestly as
// orders=trips/bookings across verticals, shipped_at=completion stamp,
// customers=users, payments=GoPay settlement rails (INTEGER cents ÷ 100.0) —
// with probed figures only.

import type { CompanyKit } from "../types";

export const gojekKit: CompanyKit = {
  id: "gojek",
  domainId: "mobility",
  name: "Gojek",
  tagline: "Southeast Asia's everything app: rides to payments",
  accent: "text-rose-300",

  brief: [
    "**Gojek** is Southeast Asia's everything app — a Jakarta call center for ojek motorcycle-taxi rides in 2010, an app in 2015, then one account stacking {rose:GoRide}, {emerald:GoFood}, GoMart and the **GoPay** wallet. The growth thesis is the cross-sell flywheel every super-app runs: a ride this month should become a food order next week and a wallet top-up the week after, so the flagship reads are overlap reads — multi-service users, repeat behavior, cash-versus-wallet migration. Demand is heterogeneous by design: cash still pays for plenty of rides, tiered cities mean one pricing language per market, and monsoon evenings rewrite the demand curve hourly. Bookings and completed trips are different numbers: on this kit's storefront db **103 bookings** split 52 completed / 30 underway / 14 awaiting / 7 cancelled — and every honest rate here starts by saying which of those sits in the denominator.",
    "The data org mirrors the super-app: mobility, food and mart teams share one user identity, city pods read tier-specific dashboards, and a payments-adjacent team owns settlement reconciliation — every capture must land as {emerald:exact}, {amber:partial} or {rose:none}, and a 'paid' label with no money behind it is an incident, not a curiosity. One house rule comes from the ledger: money is stored as INTEGER cents, so the dollar read is `amount_cents / 100.0` — the missing .0 is how a wallet balance quietly leaks half-dollars on every odd-cent row. The driver ecosystem is the other half of the picture: driver-partner hours, shift overlaps and supply-versus-demand gaps are first-class analytics, read from the same timestamp discipline as the demand side.",
    "Interview style is definition-heavy and grain-obsessed. A typical screen walks from a warm-up aggregation (top users by lifetime fares) into a **fan-out trap** (one GoFood order with three items becomes three rows), then escalates into either a window question (peak-hour ladders, LAG-gapped bookings) or a rate whose denominator is the whole test. Follow-ups are definition probes: *'per booking or per user?'*, *'first order in the window or first order ever?'*, *'what does a `NULL` completion stamp do to your average?'*. Candidates who state the grain before writing consistently outperform — in an everything app, every count has at least three defensible grains and one of them is wrong for the question.",
    "Preparation strategy: Gojek has no tagged pool in this app's registry, so the kit curates **sixteen problems** from the SQL band's theme menu that mirror its known screens — cross-service funnels, GoFood SLA clocks, surge windows, whale users, GoPay ledger folds and NULL-safe trip reads. Do the topics in order, then run both case studies on the live storefront database: one rebuilds the {emerald:SLA clock} the GoFood ops pod opens its weekly review with, the other rebuilds the {rose:placed-versus-kept map} growth ships to the city leads.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the ledger, not the map. A growth analyst opens the overnight board: bookings by vertical, completions, and the settlement fold that landed overnight — how many captures cleared each rail, and did anything fall into {rose:none} or {amber:partial}? The first query is a reconciliation: the 52/30/14/7 status fold against 103 placed bookings, and the rail mix — card 16 settlements / 37364 against transfer 11 / 32248, cents folded by the /100.0 rule. A mismatch here is the day's first fire, and the analyst who can write the coverage query — exact, partial, none, per capture — is *the one everyone waits on*.",
    "**11:30 —** Midday is the deep-dive block. The GoFood pod wants the **SLA clock** refreshed — **82 stamped bookings**, a **2.98-day average** request-to-completion latency with a 2-to-4-day spread — and the surge pod wants peak-hour ladders per city, with ties broken deterministically because two hours sharing a peak is normal on Friday nights. Then the whale ledger: users whose lifetime fares cross the top cohort bar, region attached, because the quarterly deck opens with that table and the **63.5%** concentration number beside it. Each ask is a join, a conditional aggregate and one grain decision — users, bookings or baskets — and the strong analyst writes the query twice: once to answer, once with the definition printed in the column name.",
    "**15:00 —** The afternoon tilts to stakeholder cycles. The weekly business review is definition-first: every headline — {sky:completion share}, {emerald:cashless mix}, cancellation share — ships with its SQL attached, because *a number without its query is a rumor* and this deck goes up to people who read SQL. The {rose:placed-versus-kept map} goes out to city leads — APAC 8.1% cancelled, EU 6.7, US 5.3, each pod's denominator printed beside the rate — then the driver-hours read goes to supply planning: shift overlaps, idle gaps between bookings, the supply curve that decides where the next incentive budget lands. The last hour is handoff: freshness status per feed, fires closed, and tomorrow morning's two numbers — completions and settlement coverage — written down so the next analyst inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "GMV", what: "Gross bookings value across GoRide, GoFood and GoMart — 34833.28 over 103 bookings on the sample db, average 338.19. The headline the super-app manages by vertical; every version of it is a status-aware fold." },
    { name: "Completion share", what: "Bookings carrying a completion stamp ÷ placed bookings — 82 of 103 on the db (52 delivered + 30 shipped). The denominator question (placed vs stamped) is the screen's favorite follow-up." },
    { name: "SLA latency", what: "Average request-to-completion time on stamped bookings — 2.98 days, range 2..4 on the sample. GoFood's delivery-promise clock, and the case study this kit rebuilds." },
    { name: "Cashless share", what: "Settlements cleared on cashless rails ÷ all settlements — card 16 / 37364 versus transfer 11 / 32248 on the db. The GoPay migration story, read as a two-bucket money fold." },
    { name: "Cancelled share", what: "Cancelled ÷ placed bookings — 7 of 103 (6.8%) overall, but pod-level it runs APAC 8.1, EU 6.7, US 5.3. The honest-funnel metric: cancelled demand stays in the denominator." },
    { name: "Whale concentration", what: "Share of revenue from users above the lifetime-spend bar — 63.5% from 3000-plus spenders, 71.2% above 2000. The dependency read the board actually asks about." },
    { name: "Repeat rate", what: "Share of users with 2+ bookings — 14 of 16 on the sample. The loyalty headline behind the voucher engine, and a HAVING-gated count in interview form." },
    { name: "AOV", what: "Average order value per booking — 338.19 (min 25.47, max 1088.44). The grain trap in one KPI: per-booking and per-user averages are different metrics wearing the same units." },
  ],

  topics: [
    {
      name: "Cross-service funnels",
      why: "The super-app thesis is the funnel: ride → food → wallet, one user identity across services, and every deck reads step-to-step conversion off it. The screens test conditional counts and honest denominators — completed versus placed, promised-window versus actual — because a funnel that filters its own failures first reads 100% forever.",
      slugs: ["funnel-step-conversion", "immediate-food-delivery-i", "immediate-food-delivery-ii"],
    },
    {
      name: "GoFood SLA clocks",
      why: "Delivery promises are date math: request stamp to completion stamp, averaged over stamped bookings only — 2.98 days on this db, spread 2..4. The drills are JULIANDAY diffs, rolling 7-day frames, and yesterday-versus-today comparisons that survive NULL in-flight stamps.",
      slugs: ["restaurant-growth", "find-golden-hour-customers", "rising-temperature"],
    },
    {
      name: "Surge windows & peak hours",
      why: "Monsoon evenings and Friday nights rewrite demand hourly, so Gojek reporting is peak-hunting: the busiest hour per city, the biggest booking day per market, capacity matched to demand. Argmax-over-ties with deterministic tie-breaks and time-bucket counts are the exact muscles.",
      slugs: ["find-peak-calling-hours-for-each-city", "maximum-transaction-each-day", "count-the-number-of-experiments"],
    },
    {
      name: "Whale users & spend ladders",
      why: "The quarterly review opens with the whale ledger — 63.5% of revenue from users above the 3000 bar — ranked biggest-first. Per-user lifetime folds, volume-whale counts and share-of-audience percentages are the chain, and every link punishes a fan-out join done carelessly.",
      slugs: ["top-travellers", "customer-placing-the-largest-number-of-orders", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Repeat behavior & loyalty tiers",
      why: "The voucher engine hangs on repeat behavior: 14 of 16 users have 2+ bookings on the sample, and loyalty tiers are CASE bands over lifetime fares. These are HAVING gates over per-user folds plus RFM-style tiling — and the classic bug is folding counts after a join multiplied bookings into line items.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "rfm-segmentation"],
    },
    {
      name: "Cancellation & honest denominators",
      why: "A super-app funnel's honest denominator includes the demand it lost: 7 of 103 bookings cancelled, and pod shares run 8.1 / 6.7 / 5.3. The drills are visited-but-never-transacted anti-joins, rate-over-threshold gates, and conversion lifts where the filter placement decides whether the number means anything.",
      slugs: ["customer-who-visited-but-did-not-transact", "low-quality-problems", "ab-test-conversion-lift"],
    },
    {
      name: "Driver-supply pairing",
      why: "Driver-partner hours are supply analytics: who drove as a passenger too (LEFT JOIN with a NULL arm), which shifts overlap (interval joins), capacity matched to queued demand. These drills teach the two-sided marketplace read — demand rows joined to supply rows without fanning either side out.",
      slugs: ["number-of-times-a-driver-was-a-passenger", "find-overlapping-shifts", "consecutive-available-seats"],
    },
    {
      name: "Cash-vs-wallet settlement mix",
      why: "Cash and wallet coexist by design, so the payment-mix fold is a daily read: settlements per rail, month-spine trends, card-launch-style adoption rates. The drills fold INTEGER cents with /100.0 discipline and bucket by month without merging two Februaries into one.",
      slugs: ["monthly-transactions-i", "card-launch-success", "odd-and-even-transactions"],
    },
    {
      name: "GoPay ledger folds",
      why: "The wallet's ledger discipline is a SQL discipline: money in, money out, net per account, and a reconciliation that must balance to the ledger's 181080-equals-181080 trial balance. Running-balance folds and reconciliation queries are how the payments team closes the week.",
      slugs: ["bank-account-summary-ii", "account-balance", "gl-reconciliation"],
    },
    {
      name: "NULL policy on in-flight trips",
      why: "A completion stamp stays NULL until drop-off — 21 of 103 bookings on this db — and a feed retry can ship half-empty rows. Gojek screens check whether you treat NULL as a bucket to report, a zero to display, or a data-quality escalation — deliberately, with the policy stated.",
      slugs: ["null-blank-audit", "books-with-null-ratings", "combine-two-tables"],
    },
  ],

  theory: [
    {
      id: "gojek-t1",
      q: "The ops deck says the average booking is 338.19. A growth lead insists the average USER spends far more. Both read the same table — which average is real, and what are you actually being asked?",
      a: "Both are real; they are different metrics wearing the same units, and the question is which grain the decision needs. The per-booking average is SUM(total)/COUNT(*) — 338.19 over 103 bookings, with a 25.47-to-1084.44 spread hiding underneath it, so the mean is being pulled by whales either way. The per-user average folds once per user first — lifetime fares per user — and answers a loyalty question, not a pricing one. The traps to narrate: cancelled bookings stay in the per-booking average by definition (GMV measures what was placed), and if you join bookings to line items before averaging you've fanned 103 rows into 251 and printed a basket average while calling it a booking average. At Gojek the follow-up is always vertical: a GoRide fare and a GoFood basket should never share one AOV — split the fold by service before anyone quotes the number in a deck.",
      tag: "aggregation",
    },
    {
      id: "gojek-t2",
      q: "You're counting cross-service adoption — users active in GoRide AND GoFood. Where does the join fan out, and how do you count the overlap honestly?",
      a: "Two places. The fan-out: joining bookings to their line items multiplies rows — one food order with three items becomes three rows — so COUNT(*) counts touchpoints, not users, and the adoption rate inherits the inflation. The fix is staging: fold bookings to one row per user per service first (DISTINCT user-service pairs), then the overlap is a count over that staged grain. The second trap is the raw join back to users: 103 bookings over 16 users means an inner join re-attaches every booking and any user-level attribute must come from a folded, not a raw, table. The habit being graded: at an everything app, every co-occurrence number has both a fan-out tax and a grain decision — say 'one row per user per service' out loud before the join, because a doubled cross-sell rate is not a rounding note, it's the growth team buying the wrong voucher budget.",
      tag: "joins",
    },
    {
      id: "gojek-t3",
      q: "Surge planning wants peak booking hours per city and the gaps between a driver's consecutive bookings. Where do windows beat GROUP BY, and how do you keep ties honest?",
      a: "GROUP BY collapses — it can tell you the peak count but not which booking owns it, and surge ops needs the row. Windows keep every row: ROW_NUMBER() OVER (PARTITION BY city, hour ORDER BY bookings DESC, created_at) picks the peak holder, and the ORDER BY carries a deterministic tie-break (timestamp, then id) because Friday-night peaks tie constantly — a bare LIMIT-1 habit breaks on exactly those ties and hands ops an arbitrary hour. For driver gaps it's LAG: the delta between a driver's consecutive booking stamps is idle time, and LAG(created_at) OVER (PARTITION BY driver_id ORDER BY created_at) computes it without a self-join. The Gojek twist: surge windows roll hourly, so the window's PARTITION BY is a clock, not just a geography — get the bucket wrong and you're staffing for last Tuesday's monsoon.",
      tag: "windows",
    },
    {
      id: "gojek-t4",
      q: "A booking's completion stamp stays NULL until drop-off. Walk me through your NULL policy across filters, joins and aggregates — and where does it bend?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value, so WHERE shipped_at < deadline silently drops in-flight bookings — sometimes that's the definition, sometimes it's a leak. Joins: NULL keys never match, which is how an unstamped booking quietly vanishes from a completion-fold. Aggregates: COUNT(*) counts all 103 bookings, COUNT(completion_stamp) counts the 82 stamped ones — the 21-row gap IS the in-flight picture — and here's the subtlety worth saying out loud: AVG(JULIANDAY delta) is NULL-robust, so dropping the IS NOT NULL filter moves the count from 82 to 103 but leaves the 2.98-day average untouched, because AVG skips NULLs rather than counting them as zero. The policy: in-flight is its own bucket — report it, never COALESCE it into a fake zero mid-pipeline. Bend it only at the display edge, and say so: '—' versus 0.0 is a stakeholder conversation, not a SQL default.",
      tag: "nulls",
    },
    {
      id: "gojek-t5",
      q: "Your voucher query tiers users by lifetime fares and then gates tiers by size. Which clause holds each filter, and what breaks when they swap?",
      a: "Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Lifetime fares don't exist per row — they're a fold — so the shape is staged: per-user SUM first, then the tier CASE on the folded value, then any gate on tier size in HAVING. Two mechanical proofs you can cite: WHERE cannot see aggregates or SELECT aliases (the error is immediate), and SQLite won't even resolve a same-SELECT alias — ROUND(100.0 * cancelled / placed) against aliases defined in the same SELECT list fails with 'no such column', which is exactly why the folded share computes in an outer query over a derived table. The super-app stakes: the tier ladder IS the voucher budget. A filter in the wrong clause doesn't just misrun — it re-prices who gets the discount, and the first sign is a tier total that refuses to reconcile with the user count.",
      tag: "pipeline",
    },
    {
      id: "gojek-t6",
      q: "Growth wants users whose FIRST booking landed inside the promo window. Sketch the query — and what happens if the inner fold comes back empty?",
      a: "Two honest shapes. Correlated: WHERE NOT EXISTS (SELECT 1 FROM bookings earlier WHERE earlier.user_id = u.id AND earlier.created_at < promo_start) — 'no booking before the window' defines first-booking-in-promo without assuming the minimum is global. Derived: fold MIN(created_at) per user in a subquery or CTE, then compare the folded first-booking to the window — one pass, readable, and the fold's emptiness is visible. What the interviewer probes: if the inner fold is empty — a user with no bookings, an over-filtered staging table — the scalar version yields NULL, every comparison is UNKNOWN, and the cohort silently returns nothing while looking correct. The Gojek reason this matters: first-booking-in-window IS the acquisition-cohort definition, and the whole promo post-mortem — conversion, month-1 repeat, voucher cost per activated user — inherits whatever population that edge defines. Get the edge wrong and you're measuring a different promo.",
      tag: "subqueries",
    },
    {
      id: "gojek-t7",
      q: "Bookings arrive as TEXT timestamps across markets in several timezones. How do you build the month spine, diff the SLA, and window a promo — without losing the last night?",
      a: "Three tools, three disciplines. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on fixed-width ISO — builds the 14-month spine this db runs on (2024-01 through 2025-02); the SUBSTR shortcut is fine until a feed ships a non-padded date, so the format convention is stated, not assumed. Diffs: JULIANDAY(completion) - JULIANDAY(request) in fractional days, rounded once at the end — this db's 2.98-day average is exactly that shape, a GoFood SLA fold over 82 stamped bookings. Windows: half-open — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the promo's final evening, historically the biggest one. The market twist: one app, several timezones, and a text column that declares none of them — the same timestamp is a different month in Jakarta and Manila. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "gojek-t8",
      q: "Settlement reconciliation: one capture shows paid with no settlement rows, five paid across two rows, one open with a partial capture. Classify all of them in one pass.",
      a: "LEFT JOIN captures to settlements, fold per capture, and CASE the coverage: no settlement rows (COUNT = 0) → 'none'; folded amount equals billed → 'exact'; money exists but falls short → 'partial'. On this db that's 21 exact, 6 with nothing, and 1 partial — 4000 captured against a 6148 bill — and the anomalies the classification exists to surface are the void-but-paid invoice (#11, 925.00), the paid invoice with zero payment rows (#28, 1756.00) and the five split settlements folded only for display, never for the reconciliation itself, because folding two genuine part-payments hides the shortfall you exist to find. Then prove the ledger: SUM(debits) = SUM(credits) = 181080, delta 0 — a trial balance that doesn't zero is a stop-ship. The graded habit: coverage is a classification computed from BOTH tables, never a status column read at face value — at a wallet company that distinction is the difference between a dashboard and an audit.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "gojek-mcq-1",
      prompt: "The loyalty ledger needs users with 2 or more lifetime bookings — 14 of 16 users on the sample db. Which clause holds that gate?",
      choices: [
        "WHERE COUNT(*) >= 2 — filter early",
        "HAVING COUNT(*) >= 2 — after the per-user fold",
        "LIMIT 2 — keep the top two users",
        "DISTINCT users — duplicates removed automatically",
      ],
      answer: 1,
      why: "Bookings-per-user exists only after GROUP BY folds the rows, and group-level predicates live in HAVING: on this db that gate keeps 14 of the 16 users. WHERE cannot see aggregates at all.",
      notes: [
        { choice: 0, why: "WHERE runs before folding — an aggregate there is a hard error, and pre-filtering rows instead would silently change who can reach 2 bookings." },
        { choice: 2, why: "LIMIT caps output rows after sorting — 2 is a per-user count threshold, not a row count. The cap would keep an arbitrary 2 users." },
      ],
      difficulty: "easy",
    },
    {
      id: "gojek-mcq-2",
      prompt: "Cashless mix: 16 of 27 settlements cleared on the card rail. Which expression prints the card share without truncation?",
      choices: [
        "16 / 27",
        "100 * 16 / 27",
        "100.0 * 16 / 27",
        "ROUND(16, 27)",
      ],
      answer: 2,
      why: "100.0 forces real division before the fold: 1600.0/27 = 59.26. The integer literals in the other options trigger SQLite's integer division — 16/27 is 0 and 100*16/27 is 59 — and the wallet-migration story loses its decimals.",
      notes: [
        { choice: 1, why: "INTEGER 100 still leaves INTEGER operands: 100*16 = 1600, 1600/27 = 59 — truncated. Close here, but any rail under 1% prints 0 and the habit, not the coincidence, is the point." },
        { choice: 0, why: "16/27 in integer math is 0 — the card rail would read as literally unused. This is the bug that makes small markets disappear from mix reports." },
      ],
      difficulty: "easy",
    },
    {
      id: "gojek-mcq-3",
      prompt: "bookings ⋈ line items fans 103 bookings into 251 rows — one GoFood order with three items is three rows. In the joined result, which count still measures BOOKINGS?",
      choices: [
        "COUNT(*)",
        "COUNT(item_id)",
        "COUNT(DISTINCT booking_id)",
        "SUM(booking_id)",
      ],
      answer: 2,
      why: "After the fan-out, only COUNT(DISTINCT booking_id) folds line items back to bookings. COUNT(*) and COUNT(item_id) both count 251 rows — the item FK is never NULL — and SUM(booking_id) adds ids together, which is not a count of anything.",
      notes: [
        { choice: 0, why: "COUNT(*) counts joined rows — 251 touchpoints. The basket read and the booking read differ by exactly this number, and quoting 251 as bookings inflates volume by 2.4x." },
        { choice: 3, why: "SUM of an id column is meaningless arithmetic — ids are labels, not quantities. It happens to run without error, which is what makes it dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "gojek-mcq-4",
      prompt: "Tier users for the voucher engine: Gojek Plus (lifetime fares >= 3000), regular (>= 1000), casual (below). Which CASE is exhaustive?",
      choices: [
        "CASE WHEN fares >= 3000 THEN 'plus' WHEN fares >= 1000 THEN 'regular' END",
        "CASE WHEN fares >= 3000 THEN 'plus' ELSE 'regular' END",
        "CASE WHEN fares >= 3000 THEN 'plus' WHEN fares >= 1000 THEN 'regular' ELSE 'casual' END",
        "CASE WHEN fares > 3000 THEN 'plus' WHEN fares > 1000 THEN 'regular' ELSE 'casual' END",
      ],
      answer: 2,
      why: "Cascading WHENs from the top boundary down with a catch-all ELSE leave no hole: 3000-and-above is Plus, 1000-to-2999 regular, everything below casual — no user unclassified, and the 63.5% whale band sits cleanly inside 'plus'.",
      notes: [
        { choice: 0, why: "A user under 1000 matches no arm and falls out NULL — the silent fourth tier that makes every tier total refuse to reconcile with the 16-user census." },
        { choice: 3, why: "The strict > moves the boundary: a user at exactly 3000 — the whale bar the deck quotes — drops from Plus to regular and gets the wrong voucher ladder, with no error ever firing." },
      ],
      difficulty: "medium",
    },
    {
      id: "gojek-mcq-5",
      prompt: "Completion stamps stay NULL until drop-off. Which pair of counts is the daily 103-versus-82 read?",
      choices: [
        "COUNT(*) versus COUNT(completion_stamp)",
        "COUNT(DISTINCT id) versus COUNT(*)",
        "COUNT(status) versus COUNT(*)",
        "SUM(id) versus COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts every booking (103); COUNT(completion_stamp) counts non-NULL stamps only (82). The 21-row gap IS the in-flight picture — demand placed versus demand finished.",
      notes: [
        { choice: 1, why: "COUNT(DISTINCT id) equals COUNT(*) — ids are unique, so neither expression ever looks at the stamp. Both print 103." },
        { choice: 2, why: "COUNT(status) skips only NULL statuses; status is NOT NULL on this db, so it equals 103. The comparison measures nothing about completion." },
      ],
      difficulty: "medium",
    },
    {
      id: "gojek-mcq-6",
      prompt: "The placed-versus-kept map: APAC placed 37 bookings, 3 cancelled. Which expression computes the 8.1% cancellation share with no denominator drift?",
      choices: [
        "Filter cancelled rows in WHERE, then 100.0 * COUNT(*) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) over ALL placed rows",
        "100 * COUNT(status = 'cancelled') / 37",
        "100.0 * COUNT(*) / SUM(status = 'cancelled')",
      ],
      answer: 1,
      why: "Numerator and denominator fold from the same rows: the conditional sum counts the 3 cancelled, COUNT(*) keeps all 37 placements — cancelled included — and 100.0 prevents integer truncation. That's 8.1; filter first and the denominator shrinks to the numerator's population.",
      notes: [
        { choice: 0, why: "That's division by itself — the classic honest-funnel bug: every pod reads 100% cancelled and the review applauds a perfectly broken funnel." },
        { choice: 2, why: "Two bugs in one: INTEGER 100 truncates, and COUNT of a boolean expression is a SQLite-ism that counts non-NULL — i.e. every row — so the share reads 100 again." },
      ],
      difficulty: "medium",
    },
    {
      id: "gojek-mcq-7",
      prompt: "The surge matrix needs month OFFSETS between '2025-02' and a cohort's first month '2024-11'. Which expression survives the year boundary?",
      choices: [
        "STRFTIME('%m', m) - STRFTIME('%m', first)",
        "(STRFTIME('%Y', m) - STRFTIME('%Y', first)) * 12 + (STRFTIME('%m', m) - STRFTIME('%m', first))",
        "JULIANDAY(m) - JULIANDAY(first)",
        "m - first",
      ],
      answer: 1,
      why: "Months are a base-12 clock: years become ×12, months add the remainder — February 2025 versus November 2024 is 3, not -9. The bare month subtraction goes negative across every January; julianday diffs return DAYS, not month indices.",
      notes: [
        { choice: 0, why: "'2025-02' minus '2024-11' as month numbers is 2-11 = -9 — the surge matrix silently folds backwards for every year-boundary cohort, exactly when the monsoon season crosses New Year." },
        { choice: 2, why: "JULIANDAY gives a day count — right tool for the SLA clock, wrong one for a month-index matrix. Divide by 30 and leap months drift the grid." },
      ],
      difficulty: "hard",
    },
    {
      id: "gojek-mcq-8",
      prompt: "You drop WHERE shipped_at IS NOT NULL and run AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 bookings, 21 of which have NULL stamps. What moves?",
      choices: [
        "Both move: the average drops toward zero",
        "Only the count moves: AVG skips the 21 NULL stamps, so the mean stays 2.98",
        "Nothing moves: NULLs count as zero in every aggregate",
        "The average becomes NULL",
      ],
      answer: 1,
      why: "AVG ignores NULLs rather than averaging them in — the 82 stamped deltas average 2.98 with or without the filter, so the mean is stable while COUNT(*) jumps from 82 to 103. The filter still matters: it's the in-flight bucket's boundary, not the average's.",
      notes: [
        { choice: 0, why: "NULLs are not zeros — averaging them in would drag the SLA down, but SQLite doesn't do that; assuming it does leads teams to 'fix' a filter that was never the problem." },
        { choice: 3, why: "AVG over a set containing NULLs skips them; it returns NULL only when EVERY value is NULL — as with the 21 unstamped rows alone. Mixed input never propagates NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "gojek-mcq-9",
      prompt: "Counting service-pairs per user (rides-with-food, rides-with-mart, …) via a self-join on staged user-service rows. Which predicate counts each pair exactly once?",
      choices: [
        "a.service != b.service",
        "a.service < b.service",
        "a.service <> b.service AND a.user_id = b.user_id",
        "No predicate — COUNT(*) already handles it",
      ],
      answer: 1,
      why: "The strict inequality canonicalizes the pair: food<rides survives, rides<food is discarded, self-pairs fail the test outright. != keeps both orientations — every pair counts twice — and without the user match you're pairing across users entirely.",
      notes: [
        { choice: 0, why: "Half-right: it kills self-pairs but keeps both orderings — the adoption rate doubles, and doubled growth numbers are how voucher budgets get misspent." },
        { choice: 3, why: "The raw self-join returns N² rows per user — every service paired with itself included. COUNT(*) then reports the square of the truth." },
      ],
      difficulty: "hard",
    },
    {
      id: "gojek-mcq-10",
      prompt: "Which expression buckets TEXT timestamps into the '%Y-%m' month spine the surge matrix hangs on?",
      choices: [
        "SUBSTR(created_at, 6, 2)",
        "STRFTIME('%Y-%m', created_at)",
        "DATE(created_at, 'start of month')",
        "STRFTIME('%m', created_at)",
      ],
      answer: 1,
      why: "STRFTIME('%Y-%m', …) prints '2025-02' — the bucket key every monthly fold here joins on, across the db's 14-month run from 2024-01 to 2025-02. The %m-only variant merges the two Februaries; SUBSTR(6,2) is the month fragment alone.",
      notes: [
        { choice: 3, why: "%m alone drops the year — fourteen months collapse into twelve and both Februaries fold into one bucket, doubling one month's bookings while the spine looks fine." },
        { choice: 2, why: "DATE(created_at, 'start of month') returns a full date '2025-02-01' — a valid key, but every join against '%Y-%m' keys breaks on the label format." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-gojek-1",
      tier: "medium",
      topic: "t3",
      universe: "funnel",
      title: "The GoFood SLA clock",
      brief:
        "GoFood ops memo on the storefront db: the weekly SLA review opens with the completion clock — how long a booking takes from request to completion stamp. Probed facts: 82 of 103 bookings carry a completion stamp (52 delivered plus 30 shipped); the 14 pending and 7 cancelled carry none by definition. Across stamped bookings the fold prints a 2.98-day average with a 2-to-4-day spread, and the review's bar is 4 days — the slowest stamp on record. Denominator rule: stamped bookings only; in-flight demand is counted by a separate read, not averaged here.",
      ask: "Return the stamped-booking count, the average completion latency in days (2 decimals), and the slowest latency on record.",
      template:
        "SELECT {1}(*) AS completed_bookings,\n       ROUND(AVG(JULIANDAY(shipped_at) - {2}(created_at)), 2) AS avg_latency_days,\n       MAX(JULIANDAY(shipped_at) - JULIANDAY(created_at)) AS slowest_days\nFROM orders\nWHERE shipped_at {3} NULL\n  AND JULIANDAY(shipped_at) - JULIANDAY(created_at) <= {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the stamped-booking counter",
          why: "COUNT(*) folds rows that carry a completion stamp — 82. SUM(*) is not SQL, and MAX(*) would report one booking as the SLA fold's denominator.",
        },
        {
          answer: "JULIANDAY",
          kind: "keyword",
          label: "the day-diff function",
          why: "JULIANDAY converts the TEXT stamp into a fractional day number so the subtraction is days. Leave created_at as text and the string coerces to 2024 — the delta collapses to a rounding error.",
        },
        {
          answer: "IS NOT",
          kind: "keyword",
          label: "the completion-stamp filter",
          why: "IS NOT NULL keeps the 82 stamped bookings. IS NULL flips to the 21 unstamped rows (14 pending, 7 cancelled) and the fold prints NULL cells — a no-data SLA read that looks like a quiet day.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the SLA bar",
          why: "The bar is the slowest stamp on record — 4 days — so the filter keeps the full stamped population and the average stays 2.98. A 3-bar drops those bookings and flatters the read.",
        },
      ],
      distractors: ["STRFTIME", "MIN", "IS", "3"],
      walkthrough:
        "A NULL-aware SLA fold. The WHERE keeps only rows with a completion stamp — 82 of 103; JULIANDAY turns both TEXT stamps into fractional day numbers so the subtraction is days, and AVG over those deltas prints 2.98 rounded to 2 decimals while MAX prints the slowest stamp, exactly 4 — which is also the bar in the filter, so the fold keeps the full stamped population and nothing is silently dropped. The points the interviewer probes: COUNT(*) counts stamped rows (82) while AVG is NULL-robust anyway — the filter's real job is drawing the in-flight boundary the status story owns (52 delivered / 30 shipped / 14 pending / 7 cancelled). The chip traps: STRFTIME in the day-diff slot errors on arity; MIN errors as a nested aggregate inside AVG; IS NULL flips to the 21 unstamped rows and prints NULL cells; and the 3-bar drops the 4-day bookings, quietly flattering the average — a policy change disguised as a typo.",
    },
    {
      id: "cs-gojek-2",
      tier: "hard",
      topic: "s6",
      universe: "growth",
      title: "The placed-versus-kept map",
      brief:
        "Growth memo on the storefront db: the city review opens with the placed-versus-kept map — per pod, bookings placed, bookings cancelled, and the cancellation share — because a super-app funnel's honest denominator is every placed booking, cancelled included. Probed facts: 103 placed bookings fold to APAC 37 placed / 3 cancelled (8.1%), EU 45 / 3 (6.7%), US 19 / 1 (5.3%), LATAM 2 / 0 (0.0%). The share is a conditional sum over ALL placed rows divided by those same rows' COUNT(*) — never a filtered-then-divided read. The percent scale is the 100.0 house constant, and the .0 is load-bearing.",
      ask: "Return each pod with placed bookings, cancelled bookings and the cancellation share, riskiest pod first.",
      template:
        "SELECT region,\n       placed,\n       cancelled,\n       ROUND({1} * cancelled / placed, 1) AS cancel_pct\nFROM (\n  SELECT c.region AS region,\n         {2}(*) AS placed,\n         {3}(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\n  FROM orders o\n  JOIN customers c ON c.id = o.{4}\n  GROUP BY c.region\n)\nORDER BY cancel_pct {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent-scale constant",
          why: "The percent scale is arithmetic, not data — but the .0 is load-bearing: a bare 100 forces integer division, so 100*3/45 prints 6 where the true share is 6.7, and small pods truncate hardest.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the placed-bookings counter",
          why: "COUNT(*) folds placed bookings per pod — 37, 45, 19, 2. SUM(*) is not SQL, and MAX(*) would report one booking as the pod's volume.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the cancelled-booking fold",
          why: "SUM over the CASE flag counts cancelled bookings only — 3, 3, 1, 0. COUNT would count every row (the flag is never NULL) and every pod would read a 100% cancellation share.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the user join column",
          why: "Bookings attach to pods through the user: o.customer_id = c.id. o.id pairs a booking to whoever shares its row number and silently reassigns every pod's counts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the riskiest-first order",
          why: "The review opens with the riskiest pod — APAC 8.1 down to LATAM 0.0. ASC flips the read so the safest pod leads and the fire scrolls off the first screen.",
        },
      ],
      distractors: ["SUM", "COUNT", "100", "id", "ASC"],
      walkthrough:
        "A two-grain fold through a derived table. The inner query folds per pod: COUNT(*) for placed (37 / 45 / 19 / 2) and SUM over a CASE flag for cancelled (3 / 3 / 1 / 0); the outer query turns that into the share — 100.0 * cancelled / placed, rounded to 1 — because the ratio needs the folded columns and SQLite refuses a same-SELECT alias reference ('no such column: cancelled'), which is why the derived table exists at all. Cells: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0, ordered riskiest-first. The traps each chip guards: COUNT in the cancelled slot counts rows, not flags — every pod reads 100%; the bare 100 constant forces integer division and 6.7 prints as 6; o.id joins bookings to whoever shares their row number and reassigns every region's counts; and ASC opens the review with the safest pod, burying the one that needs the incentive budget.",
    },
  ],

  problems: [
    { slug: "funnel-step-conversion", why: "Step-to-step conversion with denominators printed — the GoRide → GoFood → GoPay adoption funnel growth reads weekly." },
    { slug: "immediate-food-delivery-ii", why: "The completion-share rate: conditional count ratio where the denominator is the whole test — Gojek's honest-funnel question in textbook form." },
    { slug: "immediate-food-delivery-i", why: "Bookings whose delivery matched the promised window — the GoFood SLA read, computed not asserted." },
    { slug: "restaurant-growth", why: "A 7-day rolling frame over order dates — the GoFood GMV-pacing window the ops pod tracks through promo weeks." },
    { slug: "top-travellers", why: "Rider lifetime fares ranked biggest-first — the whale ladder the quarterly deck opens with, 63.5% concentration beside it." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-whale read: who books most, decided on a grouped count — the frequency half of the whale ledger." },
    { slug: "repeat-purchase-rate", why: "Share of users with 2+ bookings — 14 of 16 on this db — the loyalty headline behind the voucher engine." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary tiling — how Gojek buckets users into voucher tiers instead of gut-feel segments." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Opened the app, never booked — the dropped-demand anti-join that sizes the re-engagement budget." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Driver-partners who also ride — the two-sided-marketplace LEFT JOIN with a NULL arm the supply team runs." },
    { slug: "find-overlapping-shifts", why: "Interval overlap between shifts — driver-hours analytics: where supply doubles up while demand waits elsewhere." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the GoPay wallet statement: money in, money out, net per user, cents handled honestly." },
    { slug: "gl-reconciliation", why: "Ledger reconciliation with a balancing delta — the GoPay close, where debits must equal credits before the number ships." },
    { slug: "monthly-transactions-i", why: "Month-spine payment folds — the cash-vs-wallet mix trended across the 14-month calendar, no merged Februaries." },
    { slug: "maximum-transaction-each-day", why: "Peak booking per day via window — the argmax-over-ties drill for surge reads, tie-break included because peaks tie." },
    { slug: "null-blank-audit", why: "NULL and blank census across feed columns — the data-quality gate before any in-flight-trip fold is trusted." },
  ],
};
