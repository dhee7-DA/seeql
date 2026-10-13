// Scratch — new plaid cases cs-plaid-3..6 (pre-splice validation).
import type { CaseStudy } from "./src/lib/curriculum/cases/types";

export const CASES: CaseStudy[] = [
  {
    id: "cs-plaid-3",
    tier: "medium",
    topic: "x2",
    universe: "expense",
    title: "The infra bill census: one pass, four cost centers",
    brief:
      "Platform-ops memo: before the board sees the infra bill, the census reads the internal expense book in **one pass** — per cost center: entries, spend, big-ticket entries (≥ **$1,000.00**) and the average entry. Probed cells: Rent runs **14 entries / $16,800.00** with all 14 big-ticket; Ads 14 / $4,570.00 with zero; Travel 3 / $2,521.00 with exactly one; Tools 5 / $1,525.00 with zero. The whole book is 36 entries / $25,416.00. FILTER (WHERE …) counts the big-ticket subpopulation inside the same scan — a second query stapled to the first is how censuses drift.",
    ask: "Return each cost center with entry count, spend in dollars (2 decimals), big-ticket entries (amount_cents >= 100000) and average entry (2 decimals), biggest spend first.",
    template:
      "SELECT category,\n       COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS spend_usd,\n       COUNT(*) {1} (WHERE amount_cents >= {2}) AS big_entries,\n       ROUND({3} / 100.0, 2) AS avg_entry_usd\nFROM expenses\nGROUP BY category\nORDER BY spend_usd {4};",
    slots: [
      {
        answer: "FILTER",
        kind: "keyword",
        label: "the one-pass subcount",
        why: "COUNT(*) FILTER (WHERE …) counts big-ticket entries inside the same scan as the totals — the census must be one pass. SUM or MAX in this slot is a syntax error, and the two-query alternative is the drift this shape exists to prevent.",
      },
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the big-ticket threshold",
        why: "The threshold is $1,000.00 in cents: 100000. Rent clears it 14 of 14, Travel once, Ads and Tools never. 10000 ($100) counts every entry on the book big — the census loses its teeth.",
      },
      {
        answer: "AVG(amount_cents)",
        kind: "keyword",
        label: "the average-entry fold",
        why: "The average entry is AVG(amount_cents) through the same cents gate as the spend column. SUM there prints the category's whole bill as its 'average', COUNT prints the entry tally in dollars — both plausible cells, both wrong grains.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-spend-first order",
        why: "The board reads the bill top-down: Rent $16,800.00, Ads $4,570.00, Travel $2,521.00, Tools $1,525.00. ASC leads with Tools and the headline line item lands last.",
      },
    ],
    distractors: ["SUM", "MAX", "10000", "SUM(amount_cents)", "COUNT(amount_cents)", "ASC"],
    walkthrough:
      "One scan, four columns, every grain named. GROUP BY category folds the 36-entry book: Rent 14 / $16,800.00 / avg $1,200.00, Ads 14 / $4,570.00 / avg $326.43, Travel 3 / $2,521.00 / avg $840.33, Tools 5 / $1,525.00 / avg $305.00 — spend and average both pass through the cents gate, INTEGER cents / 100.0, rounded once at the display edge. The census column is COUNT(*) FILTER (WHERE amount_cents >= 100000): the big-ticket cut at $1,000.00 lands 14, 0, 1, 0 — Rent is structurally big-ticket, Travel carries exactly one $1,000-plus line, and the branch reconciles against the entries column before the page ships (14+0+1+0 = 15 of 36). ORDER BY spend_usd DESC puts Rent first. The distractors fail at the seams: SUM or MAX in the FILTER slot is a syntax error; the $100 threshold (10000) makes every entry big and the cut meaningless; SUM(amount_cents) in the average column prints the whole bill as the 'average' and COUNT(amount_cents) prints the tally in dollars; ASC buries the line item the board actually debates. One pass, one scan, one threshold — the census ops ships.",
  },
  {
    id: "cs-plaid-4",
    tier: "hard",
    topic: "j5",
    universe: "month-close",
    title: "The settlement-exception worklist, per region",
    brief:
      "Billing-desk memo: the worklist is the anti-join — usage invoices with **no settlement leg at all** — priced per region and worked top-down. Probed exposure: **6 invoices, $15,217.00** — EU carries 4 / $8,524.00, US 1 / $4,937.00, APAC 1 / $1,756.00. One of the six reads *paid* in status (#28, $1,756.00) with nothing behind it — the mirror anomaly — and it lands on this worklist because the classifier is cash, not status. LEFT JOIN to the settlement legs and keep the unmatched arm; filter the wrong table and the worklist deletes itself.",
    ask: "Return each region with its count of invoices carrying no settlement leg and their total face value (2 decimals), biggest exposure first.",
    template:
      "SELECT c.region,\n       COUNT(*) AS unpaid_invoices,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure_usd\nFROM invoices i\nJOIN customers c ON c.id = i.{1}\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE p.id IS {3}\nGROUP BY c.region\nORDER BY exposure_usd {4};",
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the invoice→app key",
        why: "Invoices bill apps via i.customer_id = c.id. Substituting i.id pairs invoices to apps by row-id coincidence — plausible-looking counts attributed to the wrong customers; supplier_id names a column this table doesn't have.",
      },
      {
        answer: "i.id",
        kind: "keyword",
        label: "the leg→invoice key",
        why: "Each settlement leg names its invoice: p.invoice_id = i.id. Substituting p.invoice_id compares the leg to itself — every invoice 'matches' every leg row, the NULL arm never fires, and the worklist returns empty while looking healthy.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unmatched arm",
        why: "The worklist is the unmatched arm: p.id IS NULL keeps exactly the invoices no leg ever touched. IS NOT NULL inverts it into the paid book — 27 legs' worth of rows on a page titled 'exceptions'.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-exposure-first order",
        why: "Collections works top-down: EU $8,524.00, US $4,937.00, APAC $1,756.00. ASC opens with the smallest exposure and the desk dials the region that can wait.",
      },
    ],
    distractors: ["id", "supplier_id", "p.invoice_id", "NOT NULL", "ASC"],
    walkthrough:
      "The worklist is a LEFT JOIN with its arm kept. The chain binds invoices to apps (c.id = i.customer_id) and settlement legs to invoices (p.invoice_id = i.id); the LEFT JOIN preserves invoices with no legs as NULL-payload rows, and WHERE p.id IS NULL keeps exactly them — 6 invoices, $15,217.00 of face, including the {rose:mirror anomaly} #28, which reads paid and still has nothing behind it. Folded per region: EU 4 / $8,524.00, US 1 / $4,937.00, APAC 1 / $1,756.00 — the probed worklist, biggest first. The distractors fail at the seams: i.id pairs invoices to apps by coincidence and the counts inherit the fiction; supplier_id names a column invoices don't have; p.invoice_id self-compares so every invoice matches every leg and the NULL arm keeps nothing; IS NOT NULL publishes the paid book under an exceptions title; ASC leads with APAC's $1,756.00. The denominator note the memo insists on: 6 of 28 invoices — *of all invoices*, not the settled ones. Anti-join kept, arm explicit, exposure priced — the worklist collections actually dials.",
  },
  {
    id: "cs-plaid-5",
    tier: "easy",
    topic: "q5",
    universe: "pricing",
    title: "The endpoint rate card: family averages vs the book",
    brief:
      "Pricing memo: the rate card reads per endpoint family — average listed rate, staged in a derived table, then compared against the book-wide average of **$71.78**. Probed ladder: Wearables averages **139.5**, Audio **109.66**, Video **84.5** — three families priced above the book; Electronics ($57.83), Apparel ($41.75), Fitness ($32.00) and Accessories ($27.49) sit below. The staging fold happens once per family in the FROM clause; the comparison runs against a scalar fold over the whole book — *staging first, then compare* is the shape the pricing desk ships.",
    ask: "Return each endpoint family whose average listed rate beats the book-wide average, with the family average and the book average (2 decimals), highest rate first.",
    template:
      "SELECT t.category,\n       ROUND(t.avg_price, 2) AS avg_price_usd,\n       ROUND((SELECT AVG(price) FROM products), 2) AS book_avg_usd\nFROM (SELECT category, AVG(price) AS avg_price FROM products GROUP BY {1}) t\nWHERE t.avg_price {2} (SELECT AVG(price) FROM products)\nORDER BY avg_price_usd {3};",
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the staging fold's grain",
        why: "The rate card's grain is the endpoint family: GROUP BY category folds 16 endpoints into 7 family averages. GROUP BY price folds to one row per distinct rate and GROUP BY id never folds at all — 16 solo entries, each competing only with itself.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the above-the-book rule",
        why: "The card keeps families priced above the book: t.avg_price > (SELECT AVG(price) …). < flips the card to the discount tier, = returns nothing (no family sits exactly on 71.78), and <> ships the whole book including the three rows the memo excluded.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the highest-rate-first order",
        why: "A rate card reads premium down: Wearables 139.5, Audio 109.66, Video 84.5. ASC leads with Video — the cheapest row the card still contains — and the pricing conversation starts at the wrong end.",
      },
    ],
    distractors: ["price", "id", "<", "=", "<>", "ASC"],
    walkthrough:
      "Stage the fold, then compare against the book. The derived table folds per family — GROUP BY category, AVG(price) as avg_price: seven rows from 16 endpoints. The outer WHERE keeps the above-book tier with t.avg_price > (SELECT AVG(price) FROM products) — the scalar folds the whole book once, 71.78, and the comparison is family-average against book-average, *not* per-endpoint rows against the average (that's the q4 cousin with a different answer). Probed ladder: Wearables **139.5**, Audio **109.66**, Video **84.5** — three families, book average **71.78** printed beside every row so the reader never re-derives it. ORDER BY avg_price_usd DESC reads premium down. The distractors fail at the grain and the gate: GROUP BY price folds to rates, not families, and GROUP BY id doesn't fold at all — 16 solo rows each 'above' or 'below' alone; < publishes the discount tier (Electronics 57.83, Apparel 41.75, Fitness 32, Accessories 27.49); = returns empty while looking healthy; <> ships all seven families under an above-the-book title; ASC opens on Video. Stage once, compare once, print the benchmark — the rate card the desk ships.",
  },
  {
    id: "cs-plaid-6",
    tier: "medium",
    topic: "s7",
    universe: "funnel",
    title: "Outcome matrix: sessions by region, one row each",
    brief:
      "Funnel memo: the weekly page pivots session outcomes per region — **verified / linked / pending / abandoned** as four CASE arms over one scan — with a floor so tiny cohorts don't headline. Probed matrix: EU **45 sessions** (24/12/6/3), APAC **37** (21/8/5/3), US **19** (5/10/3/1); LATAM's 2 sessions stay off the page. The floor is **19 sessions** — at or above, keep. Arms evaluate in order and every arm ELSEs to 0, so a mistyped status literal doesn't error — it silently zeros a column, and the reconciliation to 103 catches it.",
    ask: "Return each region with total sessions and the four outcome counts, keeping regions with 19+ sessions, biggest first.",
    template:
      "SELECT c.region,\n       COUNT(*) AS sessions,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS verified,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS linked,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS abandoned\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY sessions {4};",
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the mid-flight arm",
        why: "The pending arm matches the status literal 'pending' — quoted, or it names a column that doesn't exist. A mistyped literal like 'paid' compiles fine and silently zeros the column: the arm order makes wrong statuses ELSE to 0, not errors.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the session→app key",
        why: "Sessions attach to apps via o.customer_id = c.id. Substituting o.id pairs sessions to apps by row-id coincidence and re-buckets every count; region lives on customers only, so o.region is a missing column and errors.",
      },
      {
        answer: "19",
        kind: "number",
        label: "the small-cohort floor",
        why: "The floor is 19 sessions: EU 45, APAC 37 and US 19 survive; LATAM's 2 drop. 20 would amputate the US row sitting exactly on the line — the boundary the memo defines on purpose.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first order",
        why: "The page reads EU 45, APAC 37, US 19. ASC leads with the smallest kept cohort and buries the region the funnel conversation is actually about.",
      },
    ],
    distractors: ["'paid'", "id", "region", "pending", "20", "ASC"],
    walkthrough:
      "One scan, four arms, one floor. The join binds sessions to apps (o.customer_id = c.id) and GROUP BY c.region buckets the 103 sessions — the pivot then counts subpopulations with ordered CASE arms: delivered → verified, shipped → linked, pending → mid-flight, cancelled → abandoned, everything ELSE to 0 by construction. Probed matrix: EU **45 / 24 / 12 / 6 / 3**, APAC **37 / 21 / 8 / 5 / 3**, US **19 / 5 / 10 / 3 / 1** — arms summing to sessions on every row, the reconciliation that catches a mistyped literal. HAVING COUNT(*) >= 19 applies the floor after the fold: LATAM's 2 sessions drop, three regions ship. ORDER BY sessions DESC reads EU first. The distractors fail at the arm and the key: 'paid' compiles and zeros the pending column — 0 where 6, 5, 3 belong; the unquoted pending names a missing column and errors; o.id pairs sessions to apps by coincidence; o.region is a column orders don't have; a floor of 20 amputates the US row sitting exactly on 19 — the boundary case the memo exists to pin; ASC inverts the page. Four arms, one floor, arms reconciling to 103 — the matrix the funnel page ships.",
  },
];
