/// <reference types="bun-types" />
/** Wave-5 rewrites batch B: cs-1421..cs-1432 (t2 rebuilds + t3 calendar reads). */
export const RW_B: Record<string, string> = {
  "cs-1421": `  {
    id: "cs-1421",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The back-book delivered",
    brief:
      "From: Month-end close. Re: the back-book page.\\n\\nThe close reads the back book: delivered orders logged before the 2025 boundary. IFNULL guards the stamp against a missing date — the sentinel 1900 push keeps the window honest — then the delivered gate scopes the lane.",
    ask: "How many delivered orders were logged before 2025?",
    template: \`SELECT COUNT(*) AS back_book
FROM orders
WHERE IFNULL(created_at, '1900-01-01') {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;\`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the boundary direction",
        why: "The back book sits before the 2025 boundary, so the test is <. Flipping to > would read the new-year page instead — seven delivered tickets.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        label: "the boundary stamp",
        why: "The window ends at the 2025 boundary, so the edge carries '2025-01-01'. A '2024-06-01' fill would cut the window at mid-year and keep only seventeen.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the closed lane",
        why: "The back book counts closed work, so the gate is status = 'delivered'. A 'shipped' fill would read the in-transit page — twenty-seven orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the window reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: [">", "'2024-06-01'", "'shipped'", "JULIANDAY"],
    walkthrough:
      "IFNULL pushes any missing stamp to the 1900 sentinel — where it would rightly miss the window — and the < '2025-01-01' edge scopes the back book: forty-five delivered orders closed out the old pages, with the new year opening on seven more. The mid-year cut would keep seventeen, and the shipped flip reads the in-transit lane. The back book: forty-five delivered.",
  },`,
  "cs-1422": `  {
    id: "cs-1422",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The solo-receipt pot",
    brief:
      "From: Month-end close. Re: the solo-receipt book.\\n\\nTwenty-six orders carry exactly one line each, and the solo book carries its own pot. Stage the single-line orders through a HAVING tally, fold their totals with a guarded SUM, and read the pot the close reconciles against the ledger.",
    ask: "The total revenue booked by orders with exactly one line.",
    template: \`SELECT ROUND(COALESCE({1}(total), 0), 2) AS solo_pot
FROM orders
WHERE id IN (
  SELECT order_id FROM order_items
  GROUP BY order_id
  HAVING {2}(*) = {3}
)
AND total {4} {5};\`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "The solo book totals face values, so the fold is SUM. AVG would read the average solo ticket — about 110 — and not the pot.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line tally",
        why: "A solo order carries exactly one line, so the HAVING tally is COUNT. AVG would demand an average line count no order can have.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the solo bar",
        why: "The bar sits at 1 — twenty-six orders carry exactly one line. A 500-bar would empty the stage and the pot would fall back to zero.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the face gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and return no orders at all.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open face floor",
        why: "A floor of 0 admits every solo order. A 500-floor would empty the book — no solo ticket reaches five hundred euros.",
      },
    ],
    distractors: ["AVG", "<", "500"],
    walkthrough:
      "The HAVING stage finds the twenty-six single-line orders, and the guarded SUM folds their totals into the solo pot: 2879.53 — the close reconciles it against the ledger line for one-line tickets. AVG would read the 110-euro average ticket instead of the pot, and the 500-floor would empty the book and fall back to the zero guard. The solo-receipt pot: 2879.53.",
  },`,
  "cs-1423": `  {
    id: "cs-1423",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The pending cadence",
    brief:
      "From: Month-end close. Re: the at-risk cadence.\\n\\nPending work is the close's open exposure, and the cadence read counts the distinct months that carry a pending order. Guard the lane fold with COALESCE, scope to the at-risk status, and read the spread.",
    ask: "How many distinct months carry a pending order?",
    template: \`SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months
FROM orders
WHERE COALESCE(status, {1}) = {2}
AND {3}(created_at) = created_at;\`,
    slots: [
      {
        answer: "'none'",
        kind: "keyword",
        label: "the lane fallback",
        why: "COALESCE folds a missing status to 'none' — a lane no order carries — so the fold is a pure guard. A bare column would break the pattern the close expects.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the at-risk lane",
        why: "The cadence tracks pending work, so the gate is status = 'pending'. A 'shipped' fill would read the in-transit calendar instead — twelve months.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the cadence reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["'shipped'", "MAX", "JULIANDAY"],
    walkthrough:
      "The COALESCE guard folds nothing on this clean book — every status is present — and the pending gate scopes the cadence: ten distinct months carry at-risk work, out of the fourteen the order calendar spans. The shipped flip would read twelve months of in-transit history, and the MAX misuse would break the gate outright. The pending cadence: ten months.",
  },`,
  "cs-1424": `  {
    id: "cs-1424",
    tier: "medium",
    topic: "t2",
    universe: "fraud",
    title: "The premium towers",
    brief:
      "From: Fraud spot-check. Re: the premium watchlist.\\n\\nThe watchlist flags the premium towers — orders whose total climbs past 800 euros. Guard the total with COALESCE so a missing figure never slips the net, keep the status fold honest, and count the towers.",
    ask: "How many orders total more than 800 euros?",
    template: \`SELECT COUNT(*) AS towers
FROM orders
WHERE COALESCE(total, {1}) {2} {3}
AND {4}(status) = status;\`,
    slots: [
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the missing-total push",
        why: "A missing total falls to 0 and rightly misses the 800 bar. The book carries no missing totals, so the push never fires — pure guard discipline.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the tower bar direction",
        why: "Towers clear the bar, so the test is >. Flipping to < would count the ninety-nine ordinary orders instead of the four towers.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the tower bar",
        why: "The bar sits at 800 — four orders clear it. A 500-bar would flag twenty-five orders and flood the watchlist.",
      },
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the status fold",
        why: "IFNULL(status, 'x') = status proves the lane labels are present — the fold returns each status untouched. UPPER would demand shouting lanes and match nothing.",
      },
    ],
    distractors: ["UPPER", "<", "MAX"],
    walkthrough:
      "The COALESCE guard pushes a missing total to 0 — safely below the bar — and the 800 watchlist bar counts the towers: four orders climb past it, with ticket 1088.44 at the top. The < flip would read the ninety-nine ordinary orders, and the 500-bar would flood the list with twenty-five flags. The premium watchlist holds four towers.",
  },`,
  "cs-1425": `  {
    id: "cs-1425",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The float-dust drift",
    brief:
      "From: Month-end close. Re: the reconciliation.\\n\\nThe books reconcile at cents precision, yet the raw floats disagree: twelve orders show a drift between the line pot and the booked total — floating-point dust from the pot fold. Stage the pots with a guarded fold, compare raw, and count the drifters.",
    ask: "How many orders show a raw drift between the line pot and the booked total?",
    template: \`SELECT COUNT(*) AS drifted
FROM (
  SELECT o.id, o.total, o.created_at, COALESCE({1}(i.pot), 0) AS pot
  FROM orders o
  LEFT JOIN (
    SELECT order_id, SUM(quantity * unit_price) AS pot
    FROM order_items
    GROUP BY order_id
  ) i ON i.order_id = o.id
)
WHERE pot != total
AND {2}(created_at) = created_at
AND pot {3} {4};\`,
    slots: [
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the pot guard",
        why: "IFNULL folds any missing pot to 0 — the guard a LEFT JOIN stage demands. ROUND would fold each pot to whole euros and explode the drift to 101 orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the read covers every order. JULIANDAY would compare a number to text and cover none.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pot gate direction",
        why: "The gate keeps real pots, so the test is > 0. Flipping to < would demand negative pots, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pot floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the heavyweight pots — three drifters — and hide the true count.",
      },
    ],
    distractors: ["ROUND", "JULIANDAY", "500"],
    walkthrough:
      "The guarded pot fold keeps every order in scope, and the raw != comparison counts the drifters: twelve orders where SUM(quantity * unit_price) misses the booked total by floating-point dust — dust the cents-rounded books absorb. Folding the pots to whole euros first would explode the count to 101, and the 500-floor would keep only three heavyweights. The drift census: twelve, all dust.",
  },`,
  "cs-1428": `  {
    id: "cs-1428",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The pre-order anomaly",
    brief:
      "From: Growth desk. Re: the activation scan.\\n\\nThe funnel's first metric — signup to first order — hides an anomaly: the fastest activation on file is negative. Some orders were logged before their buyer ever signed up. Measure every order-to-signup gap in days and read the floor.",
    ask: "The fastest order-to-signup gap on the book, in days.",
    template: \`SELECT ROUND({1}(julianday(o.created_at) - julianday(c.created_at)), 0) AS activation_days
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE {2}(c.created_at) = c.created_at
AND o.total {3} {4};\`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The anomaly scan reads the fastest gap, so the fold is MIN. MAX would read the slowest activation — 475 days — and miss the pre-order entirely.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(c.created_at) = c.created_at proves the signup stamps are date-clean — true for the roster, so the gaps read real rows. JULIANDAY would compare a number to text and void the scan.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the ticket gate direction",
        why: "The scan covers real tickets, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open ticket floor",
        why: "A floor of 0 admits every order. A 600-floor would drop the 576.54 anomaly ticket and soften the floor to -46.",
      },
    ],
    distractors: ["MAX", "JULIANDAY", "600"],
    walkthrough:
      "Julianday folds each pair of stamps to day numbers, and MIN reads the floor: -180 — the 576.54 order of 2024-01-05 was logged 180 days before its buyer's signup, an impossible activation the funnel must flag. MAX would read the 475-day slowpoke instead, and the 600-floor would soften the anomaly to -46. The scan's verdict: the fastest activation is a pre-order.",
  },`,
  "cs-1429": `  {
    id: "cs-1429",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The full-calendar span",
    brief:
      "From: Month-end close. Re: the billing footprint.\\n\\nThe order book's footprint is the span from the first order to the last. Fold the stamps to day numbers, take the extremes, and read the span — the calendar the close reports against every period.",
    ask: "The number of days from the first to the last order.",
    template: \`SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM orders
WHERE {3}(created_at) = created_at;\`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last order, so the leading fold is MAX. MIN there would flip the span negative — the book would appear to run backwards.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first order, so the subtrahend is MIN. MAX would duplicate the leading fold and zero the span.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the span reads real rows. JULIANDAY would compare a number to text and void the read.",
      },
    ],
    distractors: ["JULIANDAY", "ROUND"],
    walkthrough:
      "The extremes fold to day numbers and the subtraction spans the book's calendar: 2024-01-01 to 2025-02-27 — 423 days, the footprint every period report leans on. Swapping either extreme for the other would zero the span, and ROUND would fold each stamp to a number no calendar can read. JULIANDAY in the grain gate would void the read to an empty set. The billing footprint: 423 days.",
  },`,
  "cs-1430": `  {
    id: "cs-1430",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The week-scoped read",
    brief:
      "From: Growth desk. Re: the week cadence.\\n\\nThe desk buckets orders into ISO weeks, and the cadence read counts how many distinct weeks the book actually touches — the pairing density of the calendar. Chop the stamps with strftime's %W code and count the buckets.",
    ask: "How many distinct weeks carry at least one order?",
    template: \`SELECT COUNT(DISTINCT {1}) AS order_weeks
FROM orders
WHERE {2}(created_at) = created_at
AND total {3} {4};\`,
    slots: [
      {
        answer: "strftime('%W', created_at)",
        kind: "keyword",
        label: "the week slicer",
        why: "The ISO week is strftime's %W chop — forty-two distinct weeks carry orders. DATE would slice whole days and count 103 of them, one per row.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the week slicer reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 300-floor would keep only the premium tickets — thirty-one weeks — and thin the cadence.",
      },
    ],
    distractors: ["'%d'", "JULIANDAY", "300"],
    walkthrough:
      "strftime's %W chop buckets every order into its ISO week, and the distinct count reads forty-two — the book's 103 orders spread across forty-two weeks of the calendar, some weeks crowded, some carrying a single ticket. DATE would slice to 103 distinct days instead, and the 300-floor would thin the cadence to thirty-one premium weeks. The week cadence: forty-two.",
  },`,
  "cs-1431": `  {
    id: "cs-1431",
    tier: "easy",
    topic: "t3",
    universe: "month-close",
    title: "The new-year footprint",
    brief:
      "From: Month-end close. Re: the new-year page.\\n\\nThe 2025 page is short but real, and its footprint is the span from the first to the last new-year order. Chop the year, fold the stamps to day numbers, and read the span the close reports on.",
    ask: "The number of days from the first to the last 2025 order.",
    template: \`SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM orders
WHERE strftime('%Y', created_at) = {3}
AND {4}(created_at) = created_at;\`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last new-year order, so the leading fold is MAX. MIN there would flip the span negative and run the page backwards.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first new-year order, so the subtrahend is MIN. MAX would duplicate the leading fold and zero the span.",
      },
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the 2025 page, so the gate carries '2025'. A '2024' fill would span the whole back book — 365 days.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the span reads real rows. JULIANDAY would compare a number to text and void the read.",
      },
    ],
    distractors: ["ROUND", "'2024'", "JULIANDAY"],
    walkthrough:
      "The year gate scopes to the 2025 page, the extremes fold to day numbers, and the subtraction spans the new-year footprint: 2025-01-01 to 2025-02-27 — 57 days and counting. The '2024' fill would span the 365-day back book instead, and ROUND would fold each stamp into a number no calendar reads. The new-year footprint: 57 days.",
  },`,
  "cs-1432": `  {
    id: "cs-1432",
    tier: "medium",
    topic: "t3",
    universe: "growth",
    title: "The mid-week signup check",
    brief:
      "From: Growth desk. Re: the signup timing.\\n\\nThe signup timing read counts members who joined mid-week — Tuesday through Thursday, weekday codes two through four. Code the signup dates with strftime's %w chop and count the mid-week cohort.",
    ask: "How many customers signed up mid-week (Tue–Thu)?",
    template: \`SELECT COUNT(*) AS midweek_signups
FROM customers
WHERE strftime('%w', created_at) {1} {2}
AND {3}(created_at) = created_at;\`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the mid-week test",
        why: "Mid-week is three codes — 2 for Tuesday, 3 for Wednesday, 4 for Thursday — so the test is IN. NOT IN would flip the read to the edges and count the other eight.",
      },
      {
        answer: "('2','3','4')",
        kind: "keyword",
        label: "the mid-week codes",
        why: "The triple covers Tuesday through Thursday. A bare '2' fill breaks the IN grammar outright — the list must be parenthesized.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and count nobody.",
      },
    ],
    distractors: ["4", "JULIANDAY", "'2'"],
    walkthrough:
      "The %w chop codes every signup 0 through 6, and the mid-week triple catches eight members — four on Tuesday, two each on Wednesday and Thursday. The edges hold the rest: four Monday joiners, two Friday, and a weekend pair. The bare '2' fill would break the IN grammar before the read even runs. The mid-week cohort: eight.",
  },`,
};
