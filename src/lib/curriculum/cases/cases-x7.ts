// Case batch X7 — Module 6 (Expert Clinic) cases cs-1626…cs-1650, wave 3.
// Non-equi joins — ranges, ladders and inequalities as join keys. Figures
// from the W3 receipt pool (m6-cases-w3-facts*.ts). Audited by
// scripts/case-audit.ts (x-laws: JOIN + </>/BETWEEN mandatory). Bank law:
// no join-type distractors (INNER/LEFT/CROSS collapse in SQLite); every
// distractor is an operator, column, value or function chip.
// Key receipts: price ladder 120 pairs (16 distinct prices); rating-band
// fits 52 (10*s.rating..40*s.rating; Pacific 10); delivered-pairs 138;
// gap ruler HDMI->Smart Watch S 185.00; close pairs 0-30d 176 (0-7 114,
// 0-60 251); billing reach 10 members / 170 matches; supplier ups 15;
// pair leaderboard Alice 276; band leaderboard Pacific 10; Wearables gap
// 120.99; handdowns Accessories 3; rating distance Pacific->Alpine 0.9;
// week pairs 0-7d 114; upsized 170; sequence steps Alice 23; deepest
// silence Hiro Tanaka 299; year-bridge 77 (2024x2025), reverse 38; fanout
// leaderboard Alice 58; delivery-pair leaderboard Alice 66; regional band
// fit APAC 19; quick bills 0-30d 21; ratio ladder 13.34.
import type { CaseStudy } from "./types";

export const casesX7: CaseStudy[] = [
  {
    id: "cs-1626",
    tier: "easy",
    topic: "x7",
    universe: "pricing",
    title: "The price ladder",
    brief:
      "From: Pricing. Re: the ladder census.\n\nEvery pair of products where one is cheaper than the other is a rung on the price ladder. Count the rungs — cheaper-to-dearer pairs across the whole catalog, each product meeting every other.",
    ask: "How many cheaper-to-dearer product pairs exist in the catalog?",
    template: `SELECT {2}(*) AS pairs FROM products a
  JOIN products {3} ON a.price {1} b.price;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the ladder operator",
        why: "a.price < b.price keeps only the upward direction, so each pair counts once — 120 rungs. Equality would keep nothing: no two products share a price.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the rung counter",
        why: "COUNT(*) tallies the surviving pairs — 120. SUM or AVG would demand a numeric column to fold; the ladder wants a rung count.",
      },
      {
        answer: "b",
        kind: "keyword",
        label: "the dearer alias",
        why: "The second product in each comparison is the dearer side — aliased b. Joining products to itself needs two aliases; a on both sides would compare every product to itself.",
      },
    ],
    distractors: ["=", "<=", "a", "c", "SUM", "AVG"],
    walkthrough:
      "120 rungs — every cheaper-to-dearer pair in the catalog, counted once. The query is a self-join with an inequality for a key: products meets itself under two aliases, and a.price < b.price keeps only the pairs where the first product is strictly cheaper. Because all sixteen prices are distinct, no pair is missed and none is doubled — 16 choose 2 = 120. The operator is the whole census: '=' would match nothing (no two products share a price), and '<=' would add the sixteen self-pairings — a price is always <= itself — inflating the ladder to 136. The alias discipline matters too: joining a table to itself requires two names, and a on both sides would compare each product with itself. A non-equi key replaces the foreign-key equality of an ordinary join with an ordering — and the ladder is the shape every price-band analysis climbs.",
  },
  {
    id: "cs-1627",
    tier: "easy",
    topic: "x7",
    universe: "supplier",
    title: "The rating fit",
    brief:
      "From: Procurement. Re: the band sweep.\n\nSuppliers argue their rating implies a handling band: a product fits a supplier when its price sits between ten and forty times the rating. Count the product-by-supplier fits across the whole book.",
    ask: "How many product-by-supplier pairs fit the 10x-to-40x rating band?",
    template: `SELECT {3}(*) AS fits FROM products p
  JOIN suppliers s ON p.price BETWEEN {1} * s.rating AND {2} * s.rating;`,
    slots: [
      {
        answer: "10",
        kind: "number",
        label: "the band floor",
        noVerify: true,
        why: "The band opens at ten times the rating — 10 x 4.8 = 48 for Alpine — so a product must clear the supplier's floor to fit. A floor of 5 would widen every band and swell the count.",
      },
      {
        answer: "40",
        kind: "number",
        label: "the band ceiling",
        noVerify: true,
        why: "The band closes at forty times the rating — 40 x 3.9 = 156 for Pacific — the ceiling above which a product outgrows the supplier. Raising it to 50 would stretch every band and add fits.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the fit counter",
        why: "COUNT(*) tallies the surviving pairs — 52 fits. SUM or AVG would fold the asterisk and error; the sweep wants a fit count.",
      },
    ],
    distractors: ["5", "20", "50", "SUM"],
    walkthrough:
      "52 product-by-supplier pairs fit the 10x-to-40x rating band. The join key is a range, not an equality: products meets suppliers, and BETWEEN 10 * s.rating AND 40 * s.rating tests each product's price against a band the supplier's own rating defines — Alpine's band runs 48 to 192, Pacific's 39 to 156. Fifty-two of the 96 possible pairings land inside their supplier's band; Pacific Textiles catches 10, Shenzhen 9, Andes 9, Nordic 8. The bounds are the experiment: a floor of 5 widens every band downward and sweeps in the cheap cable-and-socks tier; a ceiling of 50 stretches every band upward and adds the premium tier. The non-equi key is the point — no product shares an id with a supplier, so an equality join would return nothing. The band is the relationship.",
  },
  {
    id: "cs-1628",
    tier: "easy",
    topic: "x7",
    universe: "funnel",
    title: "The settled ladder",
    brief:
      "From: Fulfillment. Re: the delivered sequence count.\n\nHow far the delivered book stretches: count the pairs where the same member placed two delivered orders, the first strictly before the second. Every such pair is a completed repeat purchase.",
    ask: "How many same-member pairs of delivered orders exist, first before second?",
    template: `SELECT {3}(*) AS settled FROM orders a
  JOIN orders b ON a.{1} = b.customer_id
  AND a.created_at < b.created_at
  AND a.status = 'delivered' AND b.status = {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the member key",
        why: "Two orders belong to the same sequence through a.customer_id = b.customer_id. Matching a.id — a row number — would pair orders whose ids happen to equal another member's key and count nonsense.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the settled lane",
        why: "Both ends must sit in the delivered lane: 66 pairs for the leader alone, 138 in total. 'cancelled' on the second end would count completed-then-cancelled sequences — a different, sadder book.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ladder counter",
        why: "COUNT(*) tallies the settled rungs: 138. SUM or AVG would fold the asterisk and error — the sequence census wants a pair count.",
      },
    ],
    distractors: ["id", "order_id", "'shipped'", "'cancelled'", "SUM"],
    walkthrough:
      "138 settled rungs — same-member pairs of delivered orders, first before second. The query is a sequence self-join with a lane gate: orders meets itself through a.customer_id = b.customer_id, a.created_at < b.created_at gives each pair a direction so nothing counts twice, and both status tests pin the pair inside the delivered lane. Alice Chen alone contributes 66 — twenty-four delivered orders choose two — with Grace Kim at 45 carrying the second-longest settled chain. The member key is what makes a sequence: matching a.id to b.customer_id would compare row numbers against member keys and count accidents. Swap the second lane to 'shipped' or 'cancelled' and the census reads a different book entirely — orders that left the warehouse but never landed. 138 completed repeat purchases, one query.",
  },
  {
    id: "cs-1629",
    tier: "easy",
    topic: "x7",
    universe: "pricing",
    title: "The gap ruler",
    brief:
      "From: Pricing. Re: the widest stretch.\n\nThe catalog's widest price stretch is a pairing question: which two products sit furthest apart on the price ladder, cheaper to dearer? Name both ends of the stretch.",
    ask: "Which pair of products has the largest price gap, cheaper first?",
    template: `SELECT a.name AS cheaper, b.{3} AS dearer FROM products a
  JOIN products b ON a.price {1} b.price
  ORDER BY b.price - a.price {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upward direction",
        why: "a.price < b.price keeps the cheaper-to-dearer direction, so the gap b.price - a.price is positive and the ruler reads honestly. Equality would match nothing — no two prices are equal.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stretch order",
        why: "DESC stacks the widest gaps first, so LIMIT 1 lands on HDMI 2.1 Cable 2m up to Smart Watch S — 185.00 apart. ASC would surface the narrowest stretch instead: a 10-unit step.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the dearer label",
        why: "The memo names both ends, so the dearer side projects b.name: Smart Watch S. Projecting b.price would print 199.99 where the product's name belongs, and b.id a row number.",
      },
    ],
    distractors: ["=", "ASC", "price", "id"],
    walkthrough:
      "The widest stretch in the catalog runs from HDMI 2.1 Cable 2m (14.99) up to Smart Watch S (199.99) — 185.00 of ladder. The ruler is a non-equi self-join: products meets itself with a.price < b.price keeping the upward direction, the computed gap b.price - a.price ranks every pair, and ORDER BY gap DESC LIMIT 1 takes the widest. The direction matters twice: the inequality makes the gap positive (and each pair single-counted), and DESC puts the extreme first — ASC would crown the narrowest stretch, Desk Mat Extended to HDMI at 10.00, a real number for a different question. The projection completes the memo: both ends get names, so the dearer side must project b.name — price or id would print a figure or a row number where Smart Watch S belongs.",
  },
  {
    id: "cs-1630",
    tier: "easy",
    topic: "x7",
    universe: "funnel",
    title: "The close pairs",
    brief:
      "From: Fulfillment. Re: the rapid-repeat census.\n\nA rapid repeat is two orders from the same member landing within 30 days of each other. Count the close pairs — the member habits the retention team can build on.",
    ask: "How many same-member order pairs land within 30 days of each other?",
    template: `SELECT {3}(*) AS close_pairs FROM orders a
  JOIN orders b ON a.{1} = b.customer_id
  AND julianday(b.created_at) - julianday(a.created_at) BETWEEN 0 AND {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the member key",
        why: "The pair must belong to one member: a.customer_id = b.customer_id. Matching a.id would compare row numbers to member keys and count accidents.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the close window",
        noVerify: true,
        why: "Thirty days defines rapid-repeat: 176 pairs land inside the window. Tighten to 7 and only 114 qualify; stretch to 60 and the net catches 251.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pair counter",
        why: "COUNT(*) tallies the close pairs: 176. SUM or AVG would fold the asterisk and error — the census wants a pair count.",
      },
    ],
    distractors: ["id", "order_id", "shipped_at", "SUM"],
    walkthrough:
      "176 close pairs — same-member order pairs landing within thirty days of each other. The census joins orders to itself on the member key and a date band: julianday converts both timestamps to day numbers so the subtraction is a clean day count, and BETWEEN 0 AND 30 keeps the pairs from same-day up to a month apart. The window is the finding's edge: tighten it to a week and only 114 pairs survive — the truly rapid repeaters — while stretching to 60 days catches 251, at which point the habit is less a habit than a season. The member key makes it a repeat: a.id against b.customer_id would pair row numbers with member keys and count accidents. 176 close pairs — the retention team's proof that the ordering cycle runs monthly for a core of members.",
  },
  {
    id: "cs-1631",
    tier: "easy",
    topic: "x7",
    universe: "month-close",
    title: "The billing reach",
    brief:
      "From: Billing ops. Re: the covered members.\n\nAn order counts as billed when the same member has an invoice issued on or after that order's date. Count the distinct members with at least one such pair — the members the billing walk actually reaches.",
    ask: "How many distinct members have an invoice issued on or after one of their orders?",
    template: `SELECT {3}(DISTINCT o.customer_id) AS reached FROM orders o
  JOIN invoices i ON i.{1} = o.customer_id
  AND i.issued_on >= {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the invoice owner key",
        why: "The invoice finds its member through i.customer_id = o.customer_id. Matching i.id would compare invoice row numbers to member keys and pair nothing sensible.",
      },
      {
        answer: "date(o.created_at)",
        kind: "keyword",
        label: "the order-date anchor",
        why: "The reach test anchors on the order's placement date: date(o.created_at) trims the timestamp to a date so it compares cleanly with issued_on. date(o.id) would date a row number — NULL — and match nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "COUNT(DISTINCT ...) collapses the 170 matching pairs to the members they cover: 10. SUM or AVG would fold member ids into meaningless arithmetic.",
      },
    ],
    distractors: ["id", "invoice_id", "date(o.id)", "SUM"],
    walkthrough:
      "Ten members are reached — they hold at least one order-invoice pair where the invoice was issued on or after the order. The reach test joins orders to invoices on the member key and a date anchor: date(o.created_at) normalizes the order timestamp so the issued_on >= comparison is calendar-honest, and the matching pairs number 170. The DISTINCT inside the count is the deliverable: the memo asks how many members the walk touches, not how many pairs it walks — 170 pairs collapse to 10 members. The distractors each break the reach: date(o.id) dates a row number, yielding NULL, which matches nothing and reports zero coverage; i.id against o.customer_id compares invoice row numbers to member keys. The six members the walk does not reach are the invoice-free five plus one — the gap billing already chases.",
  },
  {
    id: "cs-1632",
    tier: "easy",
    topic: "x7",
    universe: "supplier",
    title: "The supplier upside ladder",
    brief:
      "From: Procurement. Re: the rating rungs.\n\nEvery pair of suppliers where one rates strictly below the other is a rung on the rating ladder — an upgrade path. Count the rungs.",
    ask: "How many lower-to-higher supplier rating pairs exist?",
    template: `SELECT {2}(*) AS ups FROM suppliers a
  JOIN suppliers {3} ON a.rating {1} b.rating;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upgrade operator",
        why: "a.rating < b.rating keeps only the upgrade direction — each pair counts once. All six ratings are distinct, so the ladder has no zero rungs from ties.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the rung counter",
        why: "COUNT(*) tallies the upgrade rungs: 15 — six suppliers choose two. SUM or AVG would fold the asterisk and error.",
      },
      {
        answer: "b",
        kind: "keyword",
        label: "the higher alias",
        why: "The higher-rated side of each comparison needs its own alias — b. Aliasing both sides a would compare every supplier with itself and the ladder would vanish.",
      },
    ],
    distractors: ["=", "<=", "a", "c", "SUM", "AVG"],
    walkthrough:
      "15 upgrade rungs — every ordered pair of suppliers where the first rates strictly below the second. The ladder is a rating self-join: suppliers meets itself under two aliases, and a.rating < b.rating keeps only the upward direction. Six suppliers with six distinct ratings choose two: 15 rungs, from Pacific Textiles (3.9) up to Alpine Audio GmbH (4.8) and every path between. The operator is the census: '=' would match nothing — no two suppliers tie — while '<=' would add the six self-pairings and inflate the ladder to 21. The alias discipline is the self-join's price of admission: b names the higher side, and a on both sides would erase the ladder entirely. Fifteen rungs — the full upgrade map procurement can offer.",
  },  {
    id: "cs-1633",
    tier: "medium",
    topic: "x7",
    universe: "pricing",
    title: "The gap ruler, priced",
    brief:
      "From: Pricing. Re: the stretch, measured.\n\nThe widest price stretch needs its number, not just its ends: measure the gap between the two furthest-apart products and print it to the cent, cheaper and dearer named.",
    ask: "What is the largest price gap between two products, printed to the cent with both names?",
    template: `SELECT a.name AS cheaper, b.name AS dearer, {3}(b.price {2} a.price, 2) AS gap FROM products a
  JOIN products b ON a.price {1} b.price
  ORDER BY gap {4}
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upward direction",
        why: "a.price < b.price keeps the cheaper-to-dearer direction so the gap is positive and every pair counts once. Equality would match nothing — all sixteen prices differ.",
      },
      {
        answer: "-",
        kind: "keyword",
        label: "the spread operator",
        why: "The gap is dearer minus cheaper: 199.99 - 14.99 = 185.00. Addition would rank pair sums and the ruler would measure magnitudes, not stretches.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(b.price - a.price, 2) prints the stretch as 185.00. SUM or MAX cannot take the , 2 argument — they error where ROUND consumes the precision.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stretch order",
        why: "DESC stacks the widest stretches first, so LIMIT 1 lands on the 185.00 HDMI-to-Smart-Watch span. ASC would surface the narrowest — 10.00, Desk Mat to HDMI cable.",
      },
    ],
    distractors: ["=", "ASC", "SUM"],
    walkthrough:
      "The widest stretch measures 185.00 — HDMI 2.1 Cable 2m at 14.99 to Smart Watch S at 199.99, printed to the cent with both ends named. The ruler is a non-equi self-join with a computed key: a.price < b.price gives every pair its upward direction, b.price - a.price measures each gap, and ORDER BY gap DESC LIMIT 1 takes the widest. The operator is the measurement: addition would rank sums (the same pair tops it at 278.99, but for the wrong reason — sums rank magnitudes, not stretches) and division would rank ratios, crowning the 13.3x cable-to-watch multiple instead. ROUND(..., 2) finishes the figure — the slot trick again, since SUM or MAX in that position turn the ', 2' into a syntax error. ASC would flip the ruler and crown the 10.00 step, the catalog's tightest pairing.",
  },
  {
    id: "cs-1634",
    tier: "medium",
    topic: "x7",
    universe: "funnel",
    title: "The pair leaderboard",
    brief:
      "From: Growth lead. Re: the sequence champion.\n\nEvery same-member pair of orders, first before second, is a step in that member's ordering history. Crown the member with the most steps — the strongest repeat pattern in the book.",
    ask: "Which member has the most same-member ordered order pairs, and how many?",
    template: `SELECT c.name, {3}(*) AS pairs FROM orders a
  JOIN orders b ON a.customer_id = b.customer_id
  AND a.created_at {1} b.created_at
  JOIN customers c ON c.id = a.customer_id
  GROUP BY a.customer_id
  ORDER BY pairs {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the direction rule",
        why: "a.created_at < b.created_at counts each pair once, forward in time — Alice's 24 orders choose two: 276. Equality would keep only self-pairings and the leaderboard would read zero.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion order",
        why: "DESC stacks the longest histories first, so LIMIT 1 crowns Alice Chen at 276. ASC would crown the thinnest — a two-order member with a single step.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the step counter",
        why: "COUNT(*) tallies each member's ordered pairs — the step count. SUM or AVG would fold the asterisk and error; the leaderboard wants steps, not arithmetic.",
      },
    ],
    distractors: ["=", "<=", "ASC", "SUM", "MAX"],
    walkthrough:
      "Alice Chen owns the deepest ordering history: 276 same-member ordered pairs from her 24 orders — twenty-four choose two, every earlier-later pairing counted once. The leaderboard is a sequence self-join folded per member: orders meets itself through a.customer_id = b.customer_id, a.created_at < b.created_at gives each pair its forward direction, and GROUP BY a.customer_id with COUNT(*) reduces every member's history to one step count. Emma Wilson follows at 136, Grace Kim at 91 — the drop-off is steep because pair counts grow with the square of order counts. The direction rule is what keeps the arithmetic honest: '<=' would add each member's self-pairings (Alice to 300) and blur the step definition; '=' would keep nothing at all. DESC crowns the champion — ASC would crown a two-order footnote.",
  },
  {
    id: "cs-1635",
    tier: "medium",
    topic: "x7",
    universe: "supplier",
    title: "The band leaderboard",
    brief:
      "From: Procurement. Re: the best-fitting shelf.\n\nUnder the 10x-to-40x rating band, some suppliers catch more of the catalog than others. Rank the suppliers by fits and name the best-fitting one, with its count.",
    ask: "Which supplier fits the most products under the 10x-to-40x band, and how many?",
    template: `SELECT s.name, {1}(*) AS fits FROM products p
  JOIN suppliers s ON p.price BETWEEN {3} * s.rating AND 40 * s.rating
  GROUP BY s.id
  ORDER BY fits {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the fit counter",
        why: "COUNT(*) sizes each supplier's catch — Pacific Textiles leads at 10. SUM or AVG would fold the asterisk and error; the leaderboard wants fits, not arithmetic.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-fit order",
        why: "DESC stacks the biggest catches first, so LIMIT 1 lands on Pacific Textiles. ASC would surface the smallest catch and the procurement brief would crown the wrong shelf.",
      },
      {
        answer: "10",
        kind: "number",
        label: "the band floor",
        noVerify: true,
        why: "The band opens at ten times the rating — Pacific's floor sits at 39. Raising the floor to 20 narrows every band and reshuffles the leaderboard; dropping to 5 widens them all.",
      },
    ],
    distractors: ["SUM", "AVG", "ASC", "20", "5"],
    walkthrough:
      "Pacific Textiles is the best-fitting shelf: 10 of the 16 products land inside its 39-to-156 band (3.9 rating times the 10x floor and 40x ceiling). The leaderboard joins products to suppliers on the range key — BETWEEN 10 * s.rating AND 40 * s.rating — then GROUP BY s.id with COUNT(*) sizes each supplier's catch: Pacific 10, Shenzhen 9, Andes 9, Nordic 8, with Alpine and Midwest at 8 each. ORDER BY fits DESC, s.name... the query stacks DESC first, so LIMIT 1 crowns Pacific. The floor slot is the experiment's edge: raising it to 20 narrows every band and the leaderboard reshuffles around the mid-price catalog; dropping to 5 widens them and the cheap tier floods every shelf. A non-equi band as a join key turns each supplier's rating into a catchment area — and Pacific's low rating, paired with the wide 10x-to-40x span, makes it the roomiest net in the book.",
  },
  {
    id: "cs-1636",
    tier: "medium",
    topic: "x7",
    universe: "month-close",
    title: "The fanout census",
    brief:
      "From: Billing ops. Re: the reach walk size.\n\nThe billing reconciliation walks every order-invoice pair where the invoice was issued on or after the order date, same member. Size the walk: count the pairs, date-anchored and honest.",
    ask: "How many order-invoice pairs have the invoice issued on or after the order date?",
    template: `SELECT {3}(*) AS billed_later FROM orders o
  JOIN invoices i ON i.{1} = o.customer_id
  AND i.issued_on >= {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the owner key",
        why: "The pair must belong to one member: i.customer_id = o.customer_id. Matching i.id would compare invoice row numbers to member keys and pair accidents.",
      },
      {
        answer: "date(o.created_at)",
        kind: "keyword",
        label: "the date anchor",
        why: "date(o.created_at) trims the order timestamp to a date so the issued_on >= test is calendar-honest. o.id would test a row number against a date — NULL logic — and count nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the walk counter",
        why: "COUNT(*) sizes the walk: 170 pairs. SUM or AVG would fold the asterisk and error — reconciliation wants a pair count.",
      },
    ],
    distractors: ["id", "invoice_id", "o.id", "date(o.id)", "SUM"],
    walkthrough:
      "170 order-invoice pairs make up the billing walk — every same-member pair where the invoice issued on or after the order's placement date. The join runs on the owner key and a date anchor: i.customer_id = o.customer_id finds the member's own paper, and date(o.created_at) normalizes the order's timestamp so the >= test compares calendar days, not timestamp fragments. The 170 fan out over ten members — Alice Chen alone accounts for 58, because both her order count and invoice count multiply into the walk. The anchor is the honesty device: o.id would compare a row number to a date and match nothing, and date(o.id) dates a row number — NULL — with the same effect. The walk's size is the reconciliation's scope: 170 pairs, member by member, date-ordered.",
  },
  {
    id: "cs-1637",
    tier: "medium",
    topic: "x7",
    universe: "pricing",
    title: "The wearables gap",
    brief:
      "From: Pricing. Re: the Wearables spread.\n\nThe Wearables shelf runs the catalog's widest within-category stretch. Measure it: the largest cheaper-to-dearer gap between two Wearables products, printed to the cent with both names.",
    ask: "Which two Wearables products sit furthest apart in price, and what is the gap?",
    template: `SELECT a.{1} AS cheaper, b.name AS dearer, {3}(b.price - a.price, 2) AS gap FROM products a
  JOIN products b ON a.price < b.price AND a.category = {2}
  ORDER BY gap DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the cheaper label",
        why: "The memo names both ends: the cheaper side projects a.name — Fitness Band X2. a.category would print 'Wearables' twice over, and a.id a row number.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The spread is scoped to Wearables: Fitness Band X2 79 up to Smart Watch S 199.99. 'Audio' would measure its own 90.00 stretch and the memo would price the wrong shelf.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(b.price - a.price, 2) prints the gap as 120.99. SUM or MAX cannot take the , 2 argument — they error where ROUND consumes the precision.",
      },
    ],
    distractors: ["category", "id", "'Audio'", "'Video'", "+", "SUM"],
    walkthrough:
      "The Wearables stretch measures 120.99 — Fitness Band X2 at 79 up to Smart Watch S at 199.99, the catalog's widest within-category gap. The ruler is a non-equi self-join scoped to one shelf: a.price < b.price keeps the upward direction, a.category = 'Wearables' pins both ends to the same pair of products (the shelf holds exactly two, so one pair), and ROUND(b.price - a.price, 2) prints the gap to the cent. The scope is the memo: 'Audio' would measure its own 90.00 stretch (Speaker Mini up to Headset) and 'Video' its 89.01 — real numbers for other pages. The projection completes it: both ends get names, so the cheaper side projects a.name; category would print the shelf label twice and id a row number. One shelf, two products, 120.99 of stretch.",
  },
  {
    id: "cs-1638",
    tier: "medium",
    topic: "x7",
    universe: "catalog",
    title: "The handdown census",
    brief:
      "From: Catalog ops. Re: the Accessories ladder.\n\nThe comparison widgets on the Accessories page need sizing: count the cheaper-to-dearer pairs within the shelf — every budget pick that points up to a premium one.",
    ask: "How many cheaper-to-dearer pairs exist within the Accessories category?",
    template: `SELECT {3}(*) AS handdowns FROM products a
  JOIN products b ON a.price < b.price AND b.{1} = {2};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf key",
        why: "The pair stays on-shelf through b.category = 'Accessories' — the dearer side's category defines the shelf. Testing b.name against the shelf label would compare a product name to 'Accessories' and match nothing.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The census scopes to Accessories: three handdowns (the cable under the desk mat under the laptop stand). 'Apparel' would count one, 'Fitness' zero — other pages, other numbers.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the widget counter",
        why: "COUNT(*) sizes the widget order: three. SUM or AVG would fold the asterisk and error — the page wants a count of upward pointers.",
      },
    ],
    distractors: ["name", "id", "'Apparel'", "'Fitness'", "SUM"],
    walkthrough:
      "Three handdowns on the Accessories shelf — HDMI 2.1 Cable 2m (14.99) up to Desk Mat Extended (24.99) and Laptop Stand Aluminum (42.50), plus Desk Mat up to the Laptop Stand. The census is a non-equi self-join with a shelf key: a.price < b.price keeps the upward direction, and b.category = 'Accessories' pins the dearer side to the shelf — which, in a single-category pairing, pins both ends. The shelf's three products choose two: three ordered pairs. The distractors each miscast the key: b.name = 'Accessories' compares a product's name to a category label and matches nothing; b.id would test a row number against the label. 'Apparel' counts its single jersey-over-socks handdown and 'Fitness' none — the sister pages' numbers. Three widgets for the Accessories page, sized and proved.",
  },
  {
    id: "cs-1639",
    tier: "medium",
    topic: "x7",
    universe: "supplier",
    title: "The rating distance",
    brief:
      "From: Procurement. Re: the widest rating stretch.\n\nThe supplier book's biggest upgrade jump: the pair of suppliers furthest apart by rating, lower first. Name both ends and print the distance to two decimals.",
    ask: "Which pair of suppliers has the largest rating distance, and what is that distance?",
    template: `SELECT a.name AS lower, b.name AS higher, {3}(b.rating {2} a.rating, 2) AS distance FROM suppliers a
  JOIN suppliers b ON a.rating {1} b.rating
  ORDER BY distance DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upgrade direction",
        why: "a.rating < b.rating keeps the lower-to-higher direction so the distance is positive and every pair counts once. Equality would keep nothing — no two suppliers tie.",
      },
      {
        answer: "-",
        kind: "keyword",
        label: "the distance operator",
        why: "Distance is higher minus lower: 4.8 - 3.9 = 0.9, Pacific Textiles up to Alpine Audio GmbH. Addition would rank rating sums (9.4 for Nordic-Alpine) and measure nothing.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the decimals finisher",
        why: "ROUND(b.rating - a.rating, 2) prints the jump as 0.90. SUM or MAX cannot take the , 2 argument — they error where ROUND consumes the precision.",
      },
    ],
    distractors: ["=", "SUM", "MAX"],
    walkthrough:
      "The widest rating jump runs 0.90 — Pacific Textiles at 3.9 up to Alpine Audio GmbH at 4.8, the book's floor to its ceiling. The ruler is a rating self-join: a.rating < b.rating keeps the upgrade direction (each pair once), b.rating - a.rating measures the jump, and ORDER BY distance DESC LIMIT 1 takes the widest. The operator is the measurement: addition would rank sums and hand the crown to Nordic-Alpine at 9.4 — the two highest ratings added together, a magnitude not a distance; division would rank multiples (Alpine over Pacific at 1.23x). ROUND(..., 2) prints 0.90 cleanly — the slot trick, since SUM or MAX in that position error on the ', 2'. The full ladder runs fifteen rungs; this is the longest one.",
  },
  {
    id: "cs-1640",
    tier: "medium",
    topic: "x7",
    universe: "funnel",
    title: "The week-pair census",
    brief:
      "From: Fulfillment. Re: the same-week repeats.\n\nTighten the rapid-repeat lens to a week: same-member order pairs landing within seven days of each other. Count them — the truly rapid repeaters.",
    ask: "How many same-member order pairs land within seven days of each other?",
    template: `SELECT {3}(*) AS week_pairs FROM orders a
  JOIN orders b ON a.{1} = b.customer_id
  AND julianday(b.created_at) - julianday(a.created_at) BETWEEN 0 AND {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the member key",
        why: "The pair belongs to one member through a.customer_id = b.customer_id. Matching a.id would compare row numbers to member keys and count accidents.",
      },
      {
        answer: "7",
        kind: "number",
        label: "the week window",
        noVerify: true,
        why: "Seven days defines the same-week repeat: 114 pairs. The 30-day lens catches 176 and the 60-day net 251 — the window is the habit's definition.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pair counter",
        why: "COUNT(*) tallies the week pairs: 114. SUM or AVG would fold the asterisk and error — the census wants a pair count.",
      },
    ],
    distractors: ["id", "order_id", "shipped_at", "SUM"],
    walkthrough:
      "114 same-week repeat pairs — same-member orders landing within seven days of each other. The census is the rapid-repeat lens tightened: orders self-join on the member key, julianday converts both timestamps to day numbers, and BETWEEN 0 AND 7 keeps the pairs from same-day to a week apart. The window defines the behavior: the 30-day lens catches 176 pairs, the 60-day net 251 — so roughly a third of the monthly-repeat traffic is actually same-week, the members who order in bursts. The member key makes it a repeat rather than a coincidence; a.id against b.customer_id would compare row numbers to member keys. shipped_at as the second bound would test the gap against a timestamp string — the band would collapse to nothing. 114 burst pairs — the sharpest end of the ordering habit.",
  },
  {
    id: "cs-1641",
    tier: "medium",
    topic: "x7",
    universe: "month-close",
    title: "The upsized census",
    brief:
      "From: Finance ops. Re: the bigger-paper check.\n\nFor every order, the member's invoices sit in cents while the order total sits in dollars — so every matching invoice is 'bigger' by unit alone. Count the same-member pairs where the invoice amount exceeds the order total, and the units story proves itself.",
    ask: "How many same-member order-invoice pairs have the invoice amount exceeding the order total?",
    template: `SELECT {3}(*) AS upsized FROM orders o
  JOIN invoices i ON i.{1} = o.customer_id
  AND i.amount_cents > {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the owner key",
        why: "The pair belongs to one member through i.customer_id = o.customer_id. Matching i.amount_cents to o.customer_id would compare money to a member key and pair nothing.",
      },
      {
        answer: "o.total",
        kind: "keyword",
        label: "the order-side measure",
        why: "The comparison reads invoice cents against order dollars: i.amount_cents > o.total — 87,300 cents beats 852 dollars every time, so every same-member pair qualifies. i.amount_cents would compare the invoice to itself and keep nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pair counter",
        why: "COUNT(*) tallies the upsized pairs: 170. SUM or AVG would fold the asterisk and error — the census wants a pair count.",
      },
    ],
    distractors: ["amount_cents", "id", "i.amount_cents", "SUM"],
    walkthrough:
      "314 upsized pairs — every same-member order-invoice pair, because the comparison crosses units: invoice amounts live in cents (87,300 and up) while order totals live in dollars (1,088.44 and down), so i.amount_cents > o.total is true for every pair the member key allows — 314 of them, no date anchor to trim the fanout. The census is a units lesson dressed as a join: the owner key i.customer_id = o.customer_id assembles the same-member pairs, and the inequality — true by unit alone — keeps them all. The distractor that matters is i.amount_cents in the measure slot: compare the invoice to itself and nothing survives. Standardize the units (o.total * 100) and the count would finally become a real money comparison — the lesson the close pack paid for. 314 — the count that proves the units.",
  },
  {
    id: "cs-1642",
    tier: "hard",
    topic: "x7",
    universe: "funnel",
    title: "The sequence steps",
    brief:
      "From: Growth lead. Re: the truest repeat metric.\n\nAdjacent steps are the honest repeat unit: two orders with nothing in between. Crown the member with the most adjacent steps — the member whose ordering chain runs longest without a gap in the count.",
    ask: "Which member has the most back-to-back order pairs, and how many steps is that?",
    template: `SELECT c.name, {3}(*) AS steps FROM orders a
  JOIN orders b ON a.customer_id = b.customer_id
  AND a.created_at {1} b.created_at
  JOIN customers c ON c.id = a.customer_id
  WHERE NOT EXISTS (
    SELECT 1 FROM orders m
    WHERE m.customer_id = a.customer_id
      AND m.created_at > a.created_at AND m.created_at < b.created_at
  )
  GROUP BY a.customer_id
  ORDER BY steps {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the forward direction",
        why: "a.created_at < b.created_at gives each pair a direction so steps count once. '<=' would add every order's self-pairing and inflate Alice's chain to 24 — steps that go nowhere.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion order",
        why: "DESC stacks the longest chains first, so LIMIT 1 crowns Alice Chen at 23 steps. ASC would crown a two-order member with a single step.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the step counter",
        why: "COUNT(*) tallies each member's adjacent steps — orders minus one per chain. SUM or AVG would fold the asterisk and error; the metric wants steps.",
      },
    ],
    distractors: ["=", "<=", "ASC", "SUM", "MAX"],
    walkthrough:
      "Alice Chen runs the longest adjacency chain: 23 back-to-back steps from her 24 orders — every consecutive pairing of the book's deepest sequence. The census joins orders to itself on the member key with a forward direction, then the NOT EXISTS clause does the real work: a pair survives only when no third order sits between its two timestamps — which is the definition of adjacent. Each member's chain of n orders contributes exactly n-1 steps, so the census doubles as an order-count audit: Alice 23, Emma Wilson 16, Grace Kim 13. The direction rule is load-bearing: '<=' would let every order pair with itself, padding Alice to 24 phantom steps; '=' would keep only the self-pairings and read zero. DESC crowns the longest chain; ASC would crown a footnote. 23 steps — the spine of the book's strongest ordering habit.",
  },
  {
    id: "cs-1643",
    tier: "hard",
    topic: "x7",
    universe: "funnel",
    title: "The deepest silence",
    brief:
      "From: Retention. Re: the longest gap.\n\nBetween any member's consecutive orders sits a silence. Find the deepest one across the whole book — the member and the day count their longest back-to-back gap spans.",
    ask: "Which member has the longest gap between consecutive orders, and how many days does it span?",
    template: `SELECT c.name, {3}(julianday(b.created_at) - julianday(a.created_at)) AS silence FROM orders a
  JOIN orders b ON a.customer_id = b.customer_id
  AND a.created_at {1} b.created_at
  JOIN customers c ON c.id = a.customer_id
  WHERE NOT EXISTS (
    SELECT 1 FROM orders m
    WHERE m.customer_id = a.customer_id
      AND m.created_at > a.created_at AND m.created_at < b.created_at
  )
  ORDER BY silence {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the forward direction",
        why: "a.created_at < b.created_at orders each pair forward so the gap is positive and adjacency is testable. Equality would keep only self-pairings — zero-day silences to nowhere.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the depth order",
        why: "DESC stacks the deepest silences first, so LIMIT 1 lands on Hiro Tanaka's 299-day gap. The asc order would surface a same-day pair — silence zero.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the day counter",
        why: "ROUND(julianday(b) - julianday(a)) prints the gap as a clean day count: 299. SUM or MAX cannot take the template's argument shape here and error — the read wants one gap, folded by nothing.",
      },
    ],
    distractors: ["=", "SUM", "b.created_at"],
    walkthrough:
      "The deepest silence in the book spans 299 days — Hiro Tanaka's stretch between two consecutive orders, the retention team's white whale. The ruler joins orders to itself on the member key with a forward direction, then NOT EXISTS isolates the adjacent pairs: no third order between the two timestamps means the gap between them is real, unbroken silence. Each member's chain contributes n-1 such gaps, and the deepest across all chains is Hiro's 299 days — with Keiko Sato's 241 the runner-up. The direction rule keeps the arithmetic sane: equality would pair every order with itself and measure zero-day silences. The ROUND wrapper prints the julian difference as a clean day count. 299 days of quiet — the churn signal the win-back campaign was built for.",
  },
  {
    id: "cs-1644",
    tier: "hard",
    topic: "x7",
    universe: "month-close",
    title: "The year-bridge ladder",
    brief:
      "From: Controller. Re: the cross-year price flow.\n\nThe close pack traces paper across the year boundary: pairs where a 2024 invoice is smaller than a 2025 invoice — last year's paper pointing up to this year's. Count the bridges.",
    ask: "How many pairs have a 2024 invoice smaller than a 2025 invoice?",
    template: `SELECT {3}(*) AS bridges FROM invoices a
  JOIN invoices b ON a.amount_cents {1} b.amount_cents
  AND strftime({2}, a.issued_on) = '2024'
  AND strftime('%Y', b.issued_on) = '2025';`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upward bridge",
        why: "a.amount_cents < b.amount_cents keeps last-year-smaller-than-this-year pairs — 77 bridges. Reversing the operator counts the downgrades instead: 38.",
      },
      {
        answer: "'%Y'",
        kind: "keyword",
        label: "the year format",
        why: "The year test slices issue dates as '%Y' — '2024' against '2025'. '%m' would compare calendar months across years and the bridge count would measure months, not years.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bridge counter",
        why: "COUNT(*) lands the flow at 77 bridges. SUM or AVG would fold the asterisk and error — the pack wants a count of cross-year pairs.",
      },
    ],
    distractors: [">", "=", "'%m'", "SUM"],
    walkthrough:
      "77 bridges run from 2024's paper up into 2025's: pairs where a last-year invoice is smaller than a this-year invoice. The ladder joins the invoice book to itself across the year boundary — a.amount_cents < b.amount_cents keeps the upward direction, and the two strftime tests pin a's issue date to 2024 and b's to 2025. The reverse flow is real but smaller: 38 pairs run 2025-down-to-2024, so the book's paper grew across the boundary more often than it shrank — 77 up-bridges against 38 down. The format slot is the slice: '%Y' buckets by year; '%m' would compare month numbers with the years stripped off and count a different, season-shaped ladder. The operator is the direction: '=' matches nothing on distinct amounts, '<=' would add true cross-year equals if any existed. 77 bridges — the year-over-year flow, counted.",
  },
  {
    id: "cs-1645",
    tier: "hard",
    topic: "x7",
    universe: "month-close",
    title: "The fanout leaderboard",
    brief:
      "From: Billing ops. Re: the busiest walk member.\n\nThe reconciliation walk's 170 pairs are not spread evenly. Crown the member whose orders-and-invoices multiply into the most pairs — the account that owns the walk.",
    ask: "Which member has the most order-invoice pairs with the invoice issued on or after the order, and how many?",
    template: `SELECT c.name, {3}(*) AS matches FROM orders o
  JOIN invoices i ON i.customer_id = o.customer_id
  AND i.issued_on >= date(o.created_at)
  JOIN customers c ON c.id = o.{1}
  GROUP BY o.customer_id
  ORDER BY matches {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the name key",
        why: "The name join reads the order's member key: c.id = o.customer_id. c.id = o.id would join customers to order row numbers and attach names to accidents.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the busiest order",
        why: "DESC stacks the biggest walkers first, so LIMIT 1 crowns Alice Chen at 58. ASC would crown the smallest contributor — a real member, but the wrong headline.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pair counter",
        why: "COUNT(*) tallies each member's surviving pairs: Alice 58, Emma Wilson 37, Maya Patel 32. SUM or AVG would fold the asterisk and error.",
      },
    ],
    distractors: ["id", "ASC", "shipped_at", "SUM", "MAX"],
    walkthrough:
      "Alice Chen owns the reconciliation walk: 58 of its 170 pairs come from her orders meeting her invoices — 24 orders times enough issued-later paper to pair 58 ways. The leaderboard assembles the walk per member: orders join invoices on the member key with the date anchor date(o.created_at) keeping the issued-on-or-after honesty, GROUP BY o.customer_id folds each member's pairs, and COUNT(*) sizes the walk. ORDER BY matches DESC LIMIT 1 crowns Alice; Emma Wilson follows at 37 and Maya Patel at 32 — the fanout is multiplicative, so members with many orders AND many invoices dominate. The name join is where audits bite: c.id = o.id would attach customer names to order row numbers, and c.id = o.shipped_at to shipping timestamps — both nonsense, both caught. 58 pairs — Alice is the walk.",
  },
  {
    id: "cs-1646",
    tier: "hard",
    topic: "x7",
    universe: "funnel",
    title: "The delivery pair leaderboard",
    brief:
      "From: Fulfillment. Re: the delivered-history champion.\n\nAmong same-member pairs of delivered orders, first before second, one member stands far above the rest. Crown them, with their pair count.",
    ask: "Which member has the most same-member delivered-order pairs, and how many?",
    template: `SELECT c.name, {3}(*) AS pairs FROM orders a
  JOIN orders b ON a.customer_id = b.customer_id
  AND a.created_at < b.created_at
  AND a.status = {2} AND b.status = 'delivered'
  JOIN customers c ON c.id = a.{1}
  GROUP BY a.customer_id
  ORDER BY pairs DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the name key",
        why: "The name join reads the order's member key: c.id = a.customer_id. c.id = a.id would attach member names to order row numbers — a mislabeled leaderboard.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the settled lane",
        why: "Both ends must sit in the delivered lane — the first end slotted, the second pinned. 'shipped' would count shipped-then-delivered sequences and the leaderboard would measure a different pipeline.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pair counter",
        why: "COUNT(*) tallies each member's delivered pairs: Alice Chen 66, Grace Kim 45, Maya Patel 10. SUM or AVG would fold the asterisk and error.",
      },
    ],
    distractors: ["id", "order_id", "'shipped'", "'cancelled'", "SUM"],
    walkthrough:
      "Alice Chen owns the delivered history: 66 same-member pairs of delivered orders, first before second — twenty-four delivered orders choosing two, minus the timing gaps. The leaderboard is the sequence self-join with a lane gate on both ends: a.customer_id = b.customer_id finds the member's own orders, a.created_at < b.created_at directs each pair, and the two status tests pin both ends in the delivered lane. Grace Kim follows at 45, Maya Patel at 10 — the drop from Alice is the delivered book's shape in one line. The lane slot is the finding: 'shipped' would count orders that left but the pair's second end still delivered — a different pipeline view; 'cancelled' would measure completed-then-cancelled tragedies. The name join must read the member key — c.id = a.id would label the board with row numbers. 66 delivered pairs — the fulfilled-history champion, crowned.",
  },
  {
    id: "cs-1647",
    tier: "hard",
    topic: "x7",
    universe: "supplier",
    title: "The regional band fit",
    brief:
      "From: Procurement. Re: the regional catch.\n\nThe rating-band sweep goes regional: under the 10x-to-40x band, which supplier region catches the most products? Name the region and its fit count.",
    ask: "Which supplier region fits the most products under the 10x-to-40x band, and how many?",
    template: `SELECT s.region, {3}(*) AS fits FROM products p
  JOIN suppliers s ON p.{1} BETWEEN {2} * s.rating AND 40 * s.rating
  GROUP BY s.region
  ORDER BY fits DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the tested measure",
        why: "The band tests the product's price: p.price BETWEEN 10 * s.rating AND 40 * s.rating. p.name would compare text to arithmetic and match nothing; p.id a row number.",
      },
      {
        answer: "10",
        kind: "number",
        label: "the band floor",
        noVerify: true,
        why: "The band opens at ten times the rating. Raising the floor to 20 narrows every band — the count drops and the regions reshuffle around the mid-price catalog.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the fit counter",
        why: "COUNT(*) sizes each region's catch: APAC 19 (Shenzhen 9 + Pacific 10), EU 16, US 8, LATAM 9. SUM or AVG would fold the asterisk and error.",
      },
    ],
    distractors: ["name", "id", "20", "5", "SUM"],
    walkthrough:
      "APAC runs the roomiest regional catch: 19 fits — Shenzhen Electro's 9 plus Pacific Textiles' 10 under the 10x-to-40x band. The sweep joins products to suppliers on the range key and folds per region: GROUP BY s.region with COUNT(*) sizes each territory's catch — APAC 19, EU 16 (Alpine 8 + Nordic 8), LATAM 9, US 8 — and ORDER BY fits DESC LIMIT 1 crowns APAC. The region wins on width, not rating: its two suppliers sit at the band's low end (4.1 and 3.9), where the 10x floor drops to 41 and 39 and lets the mid-price catalog flood in. The floor slot is the experiment: raising it to 20 narrows every band, the count falls, and EU's premium-weighted pair closes the gap. The tested measure must be price — name or id in the band compares text or row numbers to arithmetic. APAC, 19 fits — geography as catchment.",
  },
  {
    id: "cs-1648",
    tier: "hard",
    topic: "x7",
    universe: "month-close",
    title: "The quick-bill window",
    brief:
      "From: Billing ops. Re: the fast-paper census.\n\nA quick bill is an invoice issued within 30 days of its member's order — same member, fast paper. Count the quick bills across the whole book.",
    ask: "How many order-invoice pairs have the invoice issued within 30 days of the order?",
    template: `SELECT {3}(*) AS quick_bills FROM orders o
  JOIN invoices i ON i.{1} = o.customer_id
  AND julianday(i.issued_on) - julianday(o.created_at) BETWEEN 0 AND {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the owner key",
        why: "The pair must belong to one member: i.customer_id = o.customer_id. Matching i.amount_cents would compare money to a member key and pair nothing.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the quick window",
        noVerify: true,
        why: "Thirty days defines quick paper: 21 pairs land inside the window. The 7-day lens catches 7 — same-week paper — and the 60-day net 48.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bill counter",
        why: "COUNT(*) tallies the quick bills: 21. SUM or AVG would fold the asterisk and error — the census wants a pair count.",
      },
    ],
    distractors: ["id", "amount_cents", "invoice_id", "SUM"],
    walkthrough:
      "21 quick bills — same-member order-invoice pairs where the paper landed within thirty days of the order. The census joins orders to invoices on the member key and a day-band: julianday converts both dates to day numbers so the subtraction is a clean day count, and BETWEEN 0 AND 30 keeps the pairs from same-day up to a month. The window is the finding's edge: the 7-day lens catches just 7 pairs — same-week paper is rare — while stretching to 60 days nets 48, so most of the book's fast paper lands in the two-to-four-week band. The owner key makes it a member's own paper: i.amount_cents against o.customer_id would compare money to a member key. 21 quick bills — the fast end of the billing cycle, counted and windowed.",
  },
  {
    id: "cs-1649",
    tier: "hard",
    topic: "x7",
    universe: "pricing",
    title: "The upside ratio",
    brief:
      "From: Pricing. Re: the multiple ladder.\n\nGaps flatter the premium tier; multiples tell the cheaper story. Find the pair with the largest price ratio — dearer divided by cheaper — and print the multiple to two decimals.",
    ask: "Which pair of products has the largest price ratio, and what is that multiple?",
    template: `SELECT a.name AS cheap, b.name AS dear, {3}(b.price {2} a.price, 2) AS ratio FROM products a
  JOIN products b ON a.price {1} b.price
  ORDER BY ratio DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the upward direction",
        why: "a.price < b.price keeps the cheaper-to-dearer direction so every ratio exceeds one and counts once. Equality would match nothing — all sixteen prices differ.",
      },
      {
        answer: "/",
        kind: "keyword",
        label: "the multiple operator",
        why: "The ratio is dearer over cheaper: 199.99 / 14.99 = 13.34. Subtraction would rank gaps and crown the same pair for a different reason — 185.00 — while the multiple story is about reach, not span.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the decimals finisher",
        why: "ROUND(b.price / a.price, 2) prints the multiple as 13.34. SUM or MAX cannot take the , 2 argument — they error where ROUND consumes the precision.",
      },
    ],
    distractors: ["=", ">", "SUM", "MAX"],
    walkthrough:
      "The catalog's biggest multiple is 13.34x — Smart Watch S at 199.99 over HDMI 2.1 Cable 2m at 14.99. The ladder is a non-equi self-join: a.price < b.price keeps the upward direction so every ratio tops one, b.price / a.price computes each multiple, and ORDER BY ratio DESC LIMIT 1 crowns the stretchiest relative climb. The operator is the story: subtraction would measure span instead of reach — a different lens than the multiple the upsell framing asks for. The runner-up multiple is 10.81x, Running Socks up to the watch — the ratio board reshuffles the gap board's order. ROUND(..., 2) prints 13.34 — the slot trick, since SUM or MAX error on the ', 2'. From 14.99 to 199.99: the catalog's longest relative climb.",
  },
  {
    id: "cs-1650",
    tier: "hard",
    topic: "x7",
    universe: "funnel",
    title: "The runner-up silence",
    brief:
      "From: Retention. Re: the second-deepest gap.\n\nThe deepest silence is famous — now for the runner-up. On the adjacent-gap leaderboard, pull the second line: the member with the second-longest back-to-back gap, and its length.",
    ask: "Which member has the second-longest gap between consecutive orders, and how many days?",
    template: `SELECT c.name, {3}(julianday(b.created_at) - julianday(a.created_at)) AS silence FROM orders a
  JOIN orders b ON a.customer_id = b.customer_id
  AND a.created_at {1} b.created_at
  JOIN customers c ON c.id = a.customer_id
  WHERE NOT EXISTS (
    SELECT 1 FROM orders m
    WHERE m.customer_id = a.customer_id
      AND m.created_at > a.created_at AND m.created_at < b.created_at
  )
  ORDER BY silence DESC
  LIMIT 1 OFFSET {2};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the forward direction",
        why: "a.created_at < b.created_at orders each pair forward so the gap is positive and adjacency is testable. Equality would keep only self-pairings — zero-day silences.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the runner-up offset",
        noVerify: true,
        why: "OFFSET 1 skips the leader — Hiro Tanaka's 299 days — and lands on the runner-up: Keiko Sato at 241. OFFSET 0 would return the famous one; OFFSET 2 the third line.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the day counter",
        why: "ROUND(julianday(b) - julianday(a)) prints the gap as a clean day count: 241 for the runner-up. SUM or MAX would attempt to fold a single row's expression and error on the shape.",
      },
    ],
    distractors: ["=", "SUM", "MAX", "0", "2"],
    walkthrough:
      "The runner-up silence spans 241 days — Keiko Sato's longest back-to-back gap, second only to Hiro Tanaka's 299. The leaderboard reads the adjacent-pair census: orders self-join on the member key with a forward direction, NOT EXISTS keeps only pairs with no third order between them (the true consecutive gaps), and julianday arithmetic measures each silence in days. ORDER BY silence DESC LIMIT 1 OFFSET 1 skips the famous leader and hands retention the runner-up. The offset is the discipline: OFFSET 0 returns Hiro — the number everyone already knows — and OFFSET 2 the third line. The direction rule keeps the gaps real: equality would pair every order with itself and measure zero. 241 days — Keiko's quiet stretch, the win-back list's second call.",
  },
];
