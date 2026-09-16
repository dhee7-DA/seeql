// Case batch X5 — Module 6 (Expert Clinic) cases cs-1576…cs-1600, wave 2.
// FULL OUTER JOIN — both sides preserved, both exclusives visible. Figures
// from the W2 receipt pool (m6-cases-w2-facts*.ts). Audited by
// scripts/case-audit.ts (x-laws: FULL OUTER JOIN mandatory). Key receipts:
// open-vs-paid members 11 (3 open-only / 5 paid-only / 3 both), 2024-vs-2025
// 11 (6 / 1 / 4), shipped-vs-pending 13 (5 / 3 / 5), order months 14 vs
// invoice months 13 (2024-01 unbilled, worth 3731.97), open-only exposure
// 5730.00, both-side open value 13879.00, card-vs-wire 8 (4 / 0 / 4).
import type { CaseStudy } from "./types";

export const casesX5: CaseStudy[] = [
  {
    id: "cs-1576",
    tier: "easy",
    topic: "x5",
    universe: "month-close",
    title: "Two lists, one membership",
    brief:
      "From: Billing ops. Re: the customer-state union.\n\nSome members hold open invoices, some hold paid ones, some hold both. Before the state matrix gets built, confirm the size of the union: how many distinct members appear on either list? One query, both sides preserved.",
    ask: "How many distinct members hold an open invoice or a paid invoice (or both)?",
    template: `SELECT COUNT(*) AS members FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = {2}
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = {3}
) p ON o.customer_id = p.customer_id;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the both-sides join",
        why: "FULL OUTER JOIN keeps every member from both lists — open holders, paid holders, and the members on both. LEFT keeps only the open side's world (6), RIGHT only the paid side's (8); neither is the union of 11.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the first list",
        why: "The open list seeds the left side: six distinct members. 'void' would seed it with the single void-invoice member — Liam O'Brien — and the union would shrink to 9.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the second list",
        why: "The paid list anchors the right side: eight distinct members. 'open' on both sides would collapse the union to 6 — one list counted twice instead of two lists merged.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "'void'", "'open'"],
    walkthrough:
      "Eleven distinct members appear on at least one of the two lists. The union is built by preservation, not by dedup: two derived lists — six members holding open invoices, eight holding paid ones — meet under FULL OUTER JOIN, which emits a row for every member of either side, matched where possible. Three members appear on both lists, so the union is 6 + 8 − 3 = 11 rows. The join type is the whole story: LEFT JOIN would preserve only the open side and count 6, RIGHT JOIN only the paid side and count 8, INNER JOIN only the overlap and count 3. The status slots seed each side — 'void' on the open slot would seed the left with Liam O'Brien's single voided invoice, shrinking the union to 9. This census is the frame every later state query hangs on: 11 members, 5 open-only, 5 paid-only, 3 both.",
  },
  {
    id: "cs-1577",
    tier: "easy",
    topic: "x5",
    universe: "month-close",
    title: "The settled-and-holding",
    brief:
      "From: Collections. Re: the clean-chase list.\n\nThe interesting members for the upsell list are the ones who have paid before but currently hold no open invoice — settled history, nothing live. Count them across the two invoice-state lists.",
    ask: "How many members hold a paid invoice but no open invoice at all?",
    template: `SELECT COUNT(*) AS paid_only FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'open'
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = {3}
) p ON o.customer_id = p.customer_id
WHERE o.customer_id IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the union join",
        why: "FULL OUTER JOIN emits rows for members of both lists, so the paid-only members appear with NULL open-side keys. LEFT JOIN would keep the open side's six rows — none of them paid-only — and count zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-open-bill test",
        why: "o.customer_id IS NULL marks members the open list never matched — the paid-only five. NOT NULL would count the three members holding both states instead.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled list",
        why: "The right side must be the paid list: eight members. 'open' on both sides would leave no unmatched rows at all, and 'void' would seed it with Liam O'Brien's single voided invoice.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "'open'", "'void'"],
    walkthrough:
      "Five members have paid history but no open bill: Grace Kim, Hiro Tanaka, Jamal Wright, Maya Patel and Olivia Brown. The census walks two lists under FULL OUTER JOIN — six open-holders on the left, eight paid-holders on the right — and the WHERE o.customer_id IS NULL isolates the rows only FULL preserves: members the open list never matched. Five of them, all on the paid side. The join type decides whether those rows exist at all: LEFT JOIN preserves the open side, where nothing is unmatched, and the count reads zero; INNER JOIN keeps only the three members on both lists. The status slot plants the population — 'void' would anchor the right side on Liam O'Brien's voided paper and the count would read zero again. This is the FULL OUTER advantage in miniature: exclusivity is only visible when both sides survive.",
  },
  {
    id: "cs-1578",
    tier: "easy",
    topic: "x5",
    universe: "month-close",
    title: "The open-only three",
    brief:
      "From: Collections. Re: the hot-chase list.\n\nMirror image of the clean-chase list: members who currently hold an open invoice but have never paid anything — no settled history at all. Count them before the morning collections standup.",
    ask: "How many members hold an open invoice but no paid invoice?",
    template: `SELECT COUNT(*) AS open_only FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = {3}
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid'
) p ON o.customer_id = p.customer_id
WHERE p.customer_id IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the union join",
        why: "FULL OUTER JOIN is the only join type that preserves the open-only members' rows with NULL paid-side keys. INNER keeps just the three both-side members; RIGHT re-anchors on the paid list and loses the open exclusives.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the never-paid test",
        why: "p.customer_id IS NULL marks members the paid list never matched — the open-only three. Any row surviving with a matched paid key belongs to the both-side book instead.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the live list",
        why: "The left side must be the open list: six members. 'paid' would swap the populations and count paid-only members instead; 'void' would seed it with Liam O'Brien's voided invoice — and Liam is open-only, skewing the count to 1.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "'paid'", "'void'"],
    walkthrough:
      "Three members hold open paper with zero payment history: Chloe Dubois, Liam O'Brien and Pedro Alvarez. The census runs the two invoice-state lists under FULL OUTER JOIN — open-holders on the left, paid-holders on the right — and WHERE p.customer_id IS NULL isolates rows the paid list never matched. Three survive. The join type is decisive in both directions: INNER JOIN keeps only matched rows (the both-side three), and RIGHT JOIN preserves the paid side, where nothing goes unmatched — either way the open-only members vanish and the count reads zero. The status slot seeds the population: 'paid' on the left would count paid-only members instead, and 'void' would seed the left with a list that overlaps the open book (Liam holds both the void and an open invoice), landing on 1. Note the asymmetry with its mirror case: here the NULL test reads the right side, there it read the left — FULL OUTER JOIN lets the exclusivity question point either way.",
  },
  {
    id: "cs-1579",
    tier: "easy",
    topic: "x5",
    universe: "funnel",
    title: "The waiting room",
    brief:
      "From: Fulfillment. Re: the stuck cohort.\n\nPending orders are the fulfillment backlog, and the interesting slice is members stuck there with nothing ever shipped — no shipped order at all. Count those members so ops can prioritize outreach.",
    ask: "How many members hold a pending order but no shipped order?",
    template: `SELECT COUNT(*) AS stuck FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
) p2
{1} (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
) s ON p2.customer_id = s.customer_id
WHERE s.customer_id IS {3};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the both-sides join",
        why: "FULL OUTER JOIN keeps pending-only members alive with NULL shipped-side keys. LEFT JOIN would preserve the pending side — where nothing goes unmatched — and count zero; RIGHT loses the pending exclusives entirely.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the backlog list",
        why: "The left side must be the pending list: eight members. 'cancelled' would seed it with the four cancelled-order members and the count would land on a different cohort entirely.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the never-shipped test",
        why: "s.customer_id IS NULL marks members the shipped list never matched — the stuck three. NOT NULL would count the five members holding both a pending and a shipped order instead.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "'cancelled'", "'delivered'", "NOT NULL"],
    walkthrough:
      "Three members are waiting on their first shipment: Chloe Dubois, Farid Nasser and Keiko Sato. The census preserves both order-state lists under FULL OUTER JOIN — eight pending-holders on the left, ten shipped-holders on the right — and WHERE s.customer_id IS NULL isolates the pending members the shipped list never matched. The distractors each empty or re-aim the cohort: INNER JOIN keeps only matched rows, RIGHT JOIN preserves the shipped side where nothing is unmatched, NOT NULL counts the five members with orders in both states. 'delivered' on the status slot would ask who is pending-but-never-delivered — zero, since all three stuck members do have delivered orders — and 'cancelled' would ask a fraud-shaped question about a different overlap. The stuck cohort is small, nameable, and only visible when both sides of the walk survive.",
  },  {
    id: "cs-1580",
    tier: "easy",
    topic: "x5",
    universe: "growth",
    title: "The 2025 newcomer",
    brief:
      "From: Growth lead. Re: the year-over-year books.\n\nThe 2025 invoicing year just opened, and one member is already on the books who never appeared in 2024 — a true newcomer. Find them: the member invoiced in 2025 with no 2024 invoice at all.",
    ask: "Which member was invoiced in 2025 but never in 2024?",
    template: `SELECT c.name FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2025'
) y
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = {2}
) o4 ON y.customer_id = o4.customer_id
JOIN customers c ON c.id = y.customer_id
WHERE o4.customer_id IS {3};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the year-union join",
        why: "FULL OUTER JOIN preserves the 2025 side, so the newcomer's row survives with a NULL 2024 key. INNER JOIN would keep only members invoiced in both years; RIGHT would re-anchor on the 2024 list and lose the newcomer.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the baseline year",
        why: "The right side must be the 2024 baseline: seven members. '2025' on both sides would compare the year with itself and match everyone; '2023' would compare against an empty year and list all five 2025 members.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the newcomer test",
        why: "o4.customer_id IS NULL marks 2025 members the 2024 baseline never matched — Hiro Tanaka, the lone newcomer. NOT NULL would count the four members invoiced in both years instead.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "'2025'", "'2023'", "NOT NULL"],
    walkthrough:
      "Hiro Tanaka is the 2025 newcomer — invoiced this year, absent from the entire 2024 book. The census preserves both year-lists under FULL OUTER JOIN: five members invoiced in 2025 on the left, seven in 2024 on the right, four on both. WHERE o4.customer_id IS NULL isolates the 2025 members with no 2024 match — exactly one row, Hiro. The join type decides whether that row survives: INNER JOIN keeps only the both-year members, RIGHT JOIN re-anchors on the 2024 side where nothing goes unmatched. The baseline slot frames the comparison — '2025' would compare 2025 with itself and return nobody, '2023' would compare against an empty book and return all five 2025 members as newcomers. NOT NULL flips the question to the four continuing members. One newcomer, found by preserving both years.",
  },
  {
    id: "cs-1581",
    tier: "easy",
    topic: "x5",
    universe: "funnel",
    title: "The shipping-backlog club",
    brief:
      "From: Fulfillment. Re: the mirror of the stuck list.\n\nThe stuck list was members waiting on their first shipment. The mirror matters too: members with shipped orders but nothing pending — their pipeline is empty. Count them for the capacity forecast.",
    ask: "How many members hold a shipped order but no pending order?",
    template: `SELECT COUNT(*) AS pipeline_clear FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
) s
{1} (
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
) p2 ON s.customer_id = p2.customer_id
WHERE p2.customer_id IS {3};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the both-sides join",
        why: "FULL OUTER JOIN preserves the shipped side, so members with nothing pending survive as rows with NULL pending keys. INNER keeps only the overlap; RIGHT re-anchors on the pending list and loses the shipped exclusives.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the backlog side",
        why: "The right side must be the pending list: eight members. 'shipped' on both sides would compare the list with itself and match everyone; 'cancelled' would ask about a different overlap — shipped members who also cancelled.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the clear-pipeline test",
        why: "p2.customer_id IS NULL marks shipped members with nothing in the backlog — five of them. NOT NULL would count the five members holding orders in both states instead.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "'shipped'", "'cancelled'"],
    walkthrough:
      "Five members have shipped history and an empty pipeline. The census preserves both order-state lists under FULL OUTER JOIN — ten shipped-holders on the left, eight pending-holders on the right, five on both — and WHERE p2.customer_id IS NULL isolates the shipped members the pending list never matched. Five rows survive. The mirror matters: this is the same walk as the stuck-list census with the sides swapped, and the exclusivity flips with them — here the shipped-only members are the answer, there the pending-only ones were. INNER JOIN or RIGHT JOIN would each lose the shipped exclusives and read zero. 'shipped' on both sides compares the list with itself and matches everyone; 'cancelled' would count shipped members who never cancelled — a bigger, different number. Five clear pipelines, ready for the capacity forecast.",
  },
  {
    id: "cs-1582",
    tier: "easy",
    topic: "x5",
    universe: "month-close",
    title: "The paperless month",
    brief:
      "From: Finance ops. Re: the calendar gap check.\n\nOrders have months; invoices have months. The close assumes they line up — verify it. Count the months that carried orders but produced no invoice at all; each one is a hole in the billing calendar.",
    ask: "How many months have orders but no invoices?",
    template: `SELECT {3}(*) AS paperless FROM (
  SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders
) o
{1} (
  SELECT DISTINCT strftime('%Y-%m', issued_on) AS mo FROM invoices
) i ON o.mo = i.mo
WHERE i.mo IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the calendar-union join",
        why: "FULL OUTER JOIN preserves the order-month side, so months with no invoice survive with NULL invoice keys. INNER keeps only months both calendars share; RIGHT re-anchors on invoice months and loses the order-side holes.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unbilled test",
        why: "i.mo IS NULL marks order months the invoice calendar never matched — the paperless holes. NOT NULL would count the thirteen months both calendars share instead.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gap counter",
        why: "COUNT(*) tallies the hole months: one. SUM or AVG would demand numeric cells and error on the month keys — the calendar check wants a count of gaps, not arithmetic.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM", "AVG"],
    walkthrough:
      "One month carried orders but never produced an invoice — the billing calendar has exactly one hole. The census joins the two calendars month-by-month under FULL OUTER JOIN: fourteen distinct order-months on the left, thirteen invoice-months on the right. WHERE i.mo IS NULL isolates the order-months that never matched — a single gap, and the walkthrough of the matching case pins it to 2024-01. The join type is the whole verification: INNER JOIN would report zero holes by construction (it only sees months both calendars share), and RIGHT JOIN re-anchors on invoice months, which is precisely the side that has no holes here. NOT NULL counts the thirteen covered months — the healthy part of the calendar, not the gap. One query, one number, one honest hole in the close.",
  },
  {
    id: "cs-1583",
    tier: "medium",
    topic: "x5",
    universe: "month-close",
    title: "The open-only three, named",
    brief:
      "From: Collections. Re: the hot-chase call sheet.\n\nThe count is known — three members hold open paper with no payment history. Now collections needs the names, alphabetized, with the region join so the call sheet shows territory. Fold the census into a roster.",
    ask: "Which members hold an open invoice but no paid invoice, by name and in alphabetical order?",
    template: `SELECT c.name FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'open'
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid'
) p ON o.customer_id = p.customer_id
JOIN customers c ON c.id = {3}(o.customer_id, p.customer_id)
WHERE p.customer_id IS {2}
ORDER BY c.name;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN keeps the open-only members' rows with NULL paid keys. INNER JOIN would keep only the both-side members; RIGHT re-anchors on the paid list, where nothing goes unmatched.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the never-paid test",
        why: "p.customer_id IS NULL isolates members with no paid history. NOT NULL would flip the roster to the both-side book — Alice Chen and Isabella Rossi in the EU — the opposite of the hot-chase list.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The member key lives on whichever side matched: COALESCE(o.customer_id, p.customer_id) reads the open key for open-only rows and the paid key otherwise, so every census row finds its customer. SUM cannot fold keys — it errors.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM"],
    walkthrough:
      "The hot-chase call sheet reads: Chloe Dubois, Liam O'Brien, Pedro Alvarez — all three in the EU, which makes the regional routing easy. The roster is the open-vs-paid census upgraded with a name join. FULL OUTER JOIN preserves both lists; WHERE p.customer_id IS NULL keeps only the open-only rows; and the member key for those rows lives entirely on the open side — COALESCE(o.customer_id, p.customer_id) resolves it, reading the open key where the paid key is NULL. The JOIN customers c then attaches names and regions. NOT NULL would rebuild the sheet over the both-side book — Alice Chen and Isabella Rossi — accounts with payment history that should never be on a never-paid call list. INNER or RIGHT lose the exclusives outright, and SUM cannot resolve a key. Three names, one territory, zero ambiguity.",
  },
  {
    id: "cs-1584",
    tier: "medium",
    topic: "x5",
    universe: "growth",
    title: "The paid-only roll call",
    brief:
      "From: Growth lead. Re: the upsell one-liner.\n\nThe upsell slide needs the settled-and-holding members as a single folded line — names, alphabetical, comma-separated — so the deck carries the whole segment in one cell. Build it from the two invoice-state lists.",
    ask: "What single folded line names every member with a paid invoice but no open one?",
    template: `SELECT {4}(c.name, ', ' ORDER BY c.name) AS upsell_line FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'open'
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid'
) p ON o.customer_id = p.customer_id
JOIN customers c ON c.id = {3}(o.customer_id, p.customer_id)
WHERE o.customer_id IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN is the only join that keeps the paid-only members' rows — with NULL open keys — in the walk. LEFT preserves the open side, where nothing is unmatched, and folds an empty line.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-open test",
        why: "o.customer_id IS NULL isolates members the open list never matched — the paid-only five. NOT NULL would fold the both-side book instead: Alice, Emma and Isabella.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "For paid-only rows the member key lives on the paid side only; COALESCE(o.customer_id, p.customer_id) resolves the key either way so every survivor finds a name. SUM cannot fold keys — it errors.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the name fold",
        why: "GROUP_CONCAT with the in-aggregate ORDER BY glues the five names into one alphabetical cell. SUM or MAX take a single argument and error on the separator — the fold needs the text aggregator.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "MAX"],
    walkthrough:
      "The upsell line reads: Grace Kim, Hiro Tanaka, Jamal Wright, Maya Patel, Olivia Brown — one cell, five names, alphabetical. The fold stands on preservation: FULL OUTER JOIN keeps both invoice-state lists alive, o.customer_id IS NULL isolates the paid-only survivors, and COALESCE(o.customer_id, p.customer_id) resolves each survivor's member key from whichever side matched — for these rows, the paid side. GROUP_CONCAT(c.name, ', ' ORDER BY c.name) then folds the names into one deterministic cell; the in-aggregate ORDER BY matters, because a bare fold follows scan order and can shuffle between runs. LEFT JOIN or INNER JOIN would preserve only the open side, where nothing goes unmatched — the line would fold to NULL and the slide would carry an empty segment. NOT NULL folds the both-side trio instead. Five settled books, one line, ready for the deck.",
  },
  {
    id: "cs-1585",
    tier: "medium",
    topic: "x5",
    universe: "growth",
    title: "The 2024 holdout stateside",
    brief:
      "From: Regional ops. Re: the US handover.\n\nThe US 2024 book had members who never came back in 2025 — invoiced last year, silent this year. Size that cohort: the members invoiced in 2024 with no 2025 invoice, US only, so the handover knows exactly who slipped.",
    ask: "How many US members were invoiced in 2024 but not in 2025?",
    template: `SELECT COUNT(*) AS us_holdouts FROM (
  SELECT COALESCE(o4.customer_id, y.customer_id) AS member_id
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2024') o4
  {1} (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = {3}) y
    ON o4.customer_id = y.customer_id
  WHERE y.customer_id IS {2}
) h JOIN customers c ON c.id = h.member_id
WHERE c.region = {4};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the year-union join",
        why: "FULL OUTER JOIN preserves the 2024 side so holdouts survive with NULL 2025 keys. INNER keeps only members invoiced in both years; RIGHT re-anchors on 2025, where nothing goes unmatched.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the holdout test",
        why: "y.customer_id IS NULL marks 2024 members the 2025 book never matched. NOT NULL would count the four continuing members instead — the handover's success story, not its gap.",
      },
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the current year",
        why: "The right side must be the 2025 book. '2024' on both sides would compare the year with itself and match everyone; the count would read zero and the handover would look complete.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the territory lens",
        why: "The regional lens scopes the holdouts to the US: Jamal Wright, alone. 'EU' would count three — Chloe, Olivia and Pedro — a real number for another deck, but not this one.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "'EU'", "'2024'"],
    walkthrough:
      "One US member was invoiced in 2024 and never again in 2025: Jamal Wright. The census preserves both year-books under FULL OUTER JOIN — ten 2024 members, five 2025, four on both — and y.customer_id IS NULL isolates the 2024-only survivors. The region lens then scopes the roster: COALESCE resolves each survivor's member key from whichever side matched, the outer JOIN customers attaches territory, and c.region = 'US' keeps the regional number. The distractors each retarget the count: 'EU' would report three holdouts (Chloe Dubois, Olivia Brown, Pedro Alvarez) — a real number for the EU deck. '2024' on the year slot would compare the book with itself and match everyone, zeroing the holdouts. INNER and RIGHT empty the holdout set entirely. One US holdout — small enough to call by name.",
  },
  {
    id: "cs-1586",
    tier: "medium",
    topic: "x5",
    universe: "month-close",
    title: "The open-only exposure",
    brief:
      "From: Collections. Re: pricing the hot chase.\n\nThe hot-chase list has three names — now price it. Sum the open-invoice face value of members who hold open paper but have never paid anything. That is the collectible exposure of the never-paid cohort.",
    ask: "What is the total open-invoice value held by members with no paid invoice at all?",
    template: `SELECT {4}(i.amount_cents) / 100.0 AS hot_exposure FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'open'
) o
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid'
) p ON o.customer_id = p.customer_id
JOIN invoices i ON i.customer_id = {3}(o.customer_id, p.customer_id) AND i.status = 'open'
WHERE o.customer_id IS NOT NULL AND p.customer_id IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN keeps the open-only rows with NULL paid keys so their invoices reach the sum. INNER keeps only both-side members; RIGHT re-anchors on the paid side and the never-paid exposure vanishes.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the never-paid test",
        why: "p.customer_id IS NULL isolates the open-only members. NOT NULL would price the both-side book instead — 13879.00 of open paper held by members who do pay.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The invoice join needs the member key from whichever side matched: COALESCE(o.customer_id, p.customer_id) resolves it, reading the open key for the never-paid rows. SUM cannot resolve a key — it errors.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure fold",
        why: "SUM(i.amount_cents) folds the three members' open invoices into 573000 cents, rendered as 5730.00. MAX would print the single biggest ticket (3562.00), COUNT the invoice tally (3) — neither is the exposure.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "MAX", "COUNT"],
    walkthrough:
      "The never-paid cohort's open exposure is 5730.00 — Chloe Dubois, Liam O'Brien and Pedro Alvarez together hold open invoices worth exactly that. The pricing walk preserves both state-lists under FULL OUTER JOIN, and p.customer_id IS NULL isolates the open-only survivors. Their invoices attach through the either-side key — COALESCE(o.customer_id, p.customer_id) — scoped to open paper by the ON clause, and SUM(i.amount_cents) folds the face values into the exposure figure. NOT NULL would price a different population entirely: the both-side members' open paper at 13879.00, money the collections team can reasonably expect. MAX prints the single 3562.00 ticket, COUNT the three-invoice tally. And INNER or RIGHT would lose the never-paid rows before any pricing — the exposure would read zero while the three largest open balances sit in the hot-chase queue.",
  },
  {
    id: "cs-1587",
    tier: "medium",
    topic: "x5",
    universe: "growth",
    title: "The newcomer's basket",
    brief:
      "From: Growth lead. Re: sizing the newcomer.\n\nThe 2025 newcomer is on the books — now see what they are worth. Sum the newcomer's order history, rounded to cents, so the growth deck can weigh the acquisition against the holdouts.",
    ask: "What is the total order value of the member invoiced in 2025 but never in 2024, rounded to cents?",
    template: `SELECT {4}(SUM(o.total), 2) AS newcomer_value FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2025'
) y
{1} (
  SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2024'
) o4 ON y.customer_id = o4.customer_id
JOIN customers c ON c.id = {3}(y.customer_id, o4.customer_id)
JOIN orders o ON o.customer_id = c.id
WHERE o4.customer_id IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN preserves the 2025 side so the newcomer's row survives with a NULL 2024 key. INNER keeps only both-year members; RIGHT re-anchors on 2024, where nothing goes unmatched.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the newcomer test",
        why: "o4.customer_id IS NULL isolates the 2025-only member. NOT NULL would value the four continuing members instead — a multi-thousand-dollar basket that is not the newcomer's.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The customer join needs the member key from whichever side matched: COALESCE(y.customer_id, o4.customer_id) reads the 2025 key for the newcomer's row. SUM cannot resolve a key — it errors on the second argument.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(SUM(o.total), 2) trims the newcomer's basket to 829.09 for the deck. SUM or MAX take a single argument and error on the , 2 — the two-argument rounding pass is the finisher.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM"],
    walkthrough:
      "The newcomer's basket is worth 829.09 — Hiro Tanaka's three orders, none of it ever invoiced before this year. The valuation preserves both year-books under FULL OUTER JOIN and isolates the 2025-only survivor with o4.customer_id IS NULL. The customer join resolves the member key through COALESCE(y.customer_id, o4.customer_id) — for the newcomer's row the key lives on the 2025 side — and JOIN orders attaches the purchase history. ROUND(SUM(o.total), 2) finishes the figure at cent precision; the slot is the folding trick, since SUM or MAX in that position turns the template's ', 2' into a syntax error while ROUND legitimately takes the precision argument. NOT NULL would value the continuing members' basket instead — real money, wrong memo. One newcomer, 829.09, straight into the growth deck.",
  },
  {
    id: "cs-1588",
    tier: "medium",
    topic: "x5",
    universe: "month-close",
    title: "The month that never got billed",
    brief:
      "From: Finance ops. Re: naming the calendar hole.\n\nThe calendar check found one order-month with no invoices. Before it goes in the close pack, name it — the exact month that carried orders but produced no billing paper.",
    ask: "Which month has orders but no invoices?",
    template: `SELECT o.mo FROM (
  SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders
) o
{1} (
  SELECT DISTINCT strftime({3}, issued_on) AS mo FROM invoices
) i ON o.mo = i.mo
WHERE i.mo IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the calendar-union join",
        why: "FULL OUTER JOIN preserves the order-month side, so the hole month survives with NULL invoice keys. INNER keeps only months both calendars share — reporting zero holes by construction; RIGHT re-anchors on invoice months, the side with no holes.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unbilled test",
        why: "i.mo IS NULL isolates order-months the invoice calendar never matched — the hole. NOT NULL would list the thirteen covered months instead, the healthy part of the calendar.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "Both calendars must slice time the same way: '%Y-%m' renders 2024-01 style keys on the invoice side to match the order side. '%Y' would group invoices by year and match no month keys; '%m' by bare month number.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "'%Y'", "'%m'"],
    walkthrough:
      "The hole in the billing calendar is 2024-01 — orders shipped, zero invoices issued. The lookup joins the two calendars under FULL OUTER JOIN: fourteen order-months, thirteen invoice-months, and WHERE i.mo IS NULL isolates the order-side gap. The format slot is the quiet trap: the order side is fixed at '%Y-%m', so the invoice side must slice with the same '%Y-%m' or the keys never meet — '%Y' would group invoices into year-buckets ('2024', '2025') that no month key equals, '%m' into bare month numbers, and either way every order-month reports unmatched and the query lists fourteen holes instead of one. INNER JOIN would report zero holes by construction — it can only see months both calendars share — and RIGHT re-anchors on the side that has no holes. One month, named, ready for the close pack.",
  },
  {
    id: "cs-1589",
    tier: "medium",
    topic: "x5",
    universe: "funnel",
    title: "The clear pipelines of Europe",
    brief:
      "From: Fulfillment. Re: the EU close-out sheet.\n\nThe mirror of the stuck list: members with shipped orders and nothing pending — their pipeline is empty and their files can close. Count them for the EU standup so ops knows who is fully done.",
    ask: "How many EU members hold a shipped order but no pending order?",
    template: `SELECT COUNT(*) AS eu_clear FROM (
  SELECT {3}(s.customer_id, p2.customer_id) AS member_id
  FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped') s
  {1} (SELECT DISTINCT customer_id FROM orders WHERE status = 'pending') p2
    ON s.customer_id = p2.customer_id
  WHERE s.customer_id IS NOT NULL AND p2.customer_id IS {2}
) st JOIN customers c ON c.id = st.member_id
WHERE c.region = 'EU';`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN keeps the shipped-only members' rows with NULL pending keys — and, critically, the pending-only rows too. INNER keeps only the both-state overlap; RIGHT re-anchors on pending and misses nothing pending but sees no exclusivity structure.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the clear-pipeline test",
        why: "With the shipped side pinned, p2.customer_id IS NULL isolates members whose pipeline holds nothing pending — the clear three. NOT NULL would flip to the both-state book: Alice Chen and Pedro Alvarez, files still open.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The customer join needs the member key from whichever side matched: COALESCE(s.customer_id, p2.customer_id) resolves it for survivors of either exclusivity. SUM cannot resolve a key — it errors on the second argument.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM", "'APAC'"],
    walkthrough:
      "Three EU members have shipped orders and an empty pending pipeline: Isabella Rossi, Liam O'Brien and Noah Meyer. The census preserves both order-state lists under FULL OUTER JOIN, and p2.customer_id IS NULL isolates the shipped-side exclusives; the either-side key — COALESCE — resolves their member ids for the region join, and c.region = 'EU' scopes the count. NOT NULL would count the both-state members instead — Alice Chen and Pedro Alvarez in the EU, accounts whose pipeline is full, not clear. 'APAC' would swap the territory for Hiro Tanaka's single ghost. INNER and RIGHT would each lose the shipped exclusives and the count would read zero — the standup would declare Europe's pipeline universally active while three members sit quietly done. Three names, one region, one owner.",
  },
  {
    id: "cs-1590",
    tier: "medium",
    topic: "x5",
    universe: "funnel",
    title: "The backlog grid",
    brief:
      "From: Fulfillment. Re: the state matrix, order edition.\n\nThe ops dashboard opens with one row: how many members hold shipped orders, pending orders, or both — and how many sit exclusively in each state. Build the grid in one pass over the two order-state lists.",
    ask: "What are the member counts for the shipped-vs-pending union: total, shipped-only and pending-only?",
    template: `SELECT COUNT(*) AS members,
  {2}(CASE WHEN p2.customer_id IS NULL THEN 1 ELSE 0 END) AS ship_only,
  SUM(CASE WHEN s.customer_id IS NULL THEN 1 ELSE 0 END) AS pend_only
FROM (SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped') s
{1} (SELECT DISTINCT customer_id FROM orders WHERE status = {3}) p2
  ON s.customer_id = p2.customer_id;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the grid join",
        why: "FULL OUTER JOIN preserves both state-lists so every exclusivity flag is computable: 13 members, 5 shipped-only, 3 pending-only. LEFT keeps only shipped holders (10 rows), RIGHT only pending holders (8) — the grid would misreport both exclusives.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exclusive counter",
        why: "SUM of the 1/0 flags counts the shipped-only rows — 5. COUNT would count every row's flag as 1 (13), MAX would cap at 1; the grid needs the flag totals, not a row count or a ceiling.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the second state",
        why: "The right side must be the pending list. 'shipped' on both sides would compare the list with itself — every member matched, both exclusives reading zero, the grid flatlining.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "COUNT", "MAX", "'shipped'"],
    walkthrough:
      "The grid reads: 13 members in the shipped-or-pending union, 5 shipped-only, 3 pending-only — and 5 in both, the arithmetic gap between the union and its exclusives. The build is a one-pass flag census: two order-state lists meet under FULL OUTER JOIN, which preserves both sides so that each row's matched-ness is visible; the CASE flags turn p2.customer_id IS NULL into a 1/0 shipped-only marker and s.customer_id IS NULL into a pending-only marker, and SUM totals each flag column. LEFT JOIN would preserve the shipped side and report 10 members with the pending exclusive flat at zero; RIGHT the mirror image; INNER only the 5-member overlap. COUNT in the flag slot counts rows, not exclusives — 13 in a column that should read 5. And 'shipped' on both sides compares the list with itself, zeroing both exclusives. One pass, three numbers, honest exclusivity.",
  },
  {
    id: "cs-1591",
    tier: "medium",
    topic: "x5",
    universe: "month-close",
    title: "The exposure matrix",
    brief:
      "From: Controller. Re: the invoice-state matrix.\n\nThe close pack's headline grid needs one row over the invoice book: how many members hold open invoices, paid invoices, or both — and how many sit exclusively in each state. Build it in one pass.",
    ask: "What are the member counts for the open-vs-paid union: total, open-only and paid-only?",
    template: `SELECT COUNT(*) AS members,
  {2}(CASE WHEN p.customer_id IS NULL THEN 1 ELSE 0 END) AS open_only,
  SUM(CASE WHEN o.customer_id IS NULL THEN 1 ELSE 0 END) AS paid_only
FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
{1} (SELECT DISTINCT customer_id FROM invoices WHERE status = {3}) p
  ON o.customer_id = p.customer_id;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the matrix join",
        why: "FULL OUTER JOIN preserves both state-lists so the exclusivity flags are computable: 11 members, 3 open-only, 5 paid-only. LEFT keeps the open holders (6 rows), RIGHT the paid holders (8) — each misreporting one exclusive as zero.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exclusive counter",
        why: "SUM of the 1/0 flags counts open-only rows — 3. COUNT would tally every row (11), MAX would cap at 1; the matrix wants flag totals, not a row count or a ceiling.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled state",
        why: "The right side must be the paid list: eight members. 'open' on both sides would compare the list with itself — both exclusives would zero out and the matrix would claim every open holder also paid.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "COUNT", "MAX", "'open'"],
    walkthrough:
      "The matrix reads: 11 members on the invoice books, 3 open-only, 5 paid-only — and 3 both, the arithmetic bridge between union and exclusives. One pass builds it: two invoice-state lists under FULL OUTER JOIN preserve both sides, the CASE flags mark each row's matched-ness (p NULL means open-only, o NULL means paid-only), and SUM totals the flags. The join type is the difference between a matrix and a misprint: LEFT preserves the open side and would print 6 members with the paid exclusive at zero; RIGHT the mirror; INNER only the 3-member overlap. COUNT in the flag slot counts rows rather than exclusives, MAX caps the column at 1. And 'open' on both sides compares the list with itself, flattening both exclusives to zero — a matrix that claims no member is ever exclusively open. This row is the frame for the whole close: who owes, who settled, who does both.",
  },
  {
    id: "cs-1592",
    tier: "hard",
    topic: "x5",
    universe: "month-close",
    title: "The two-sided exposure",
    brief:
      "From: Collections. Re: the exposure split.\n\nThe open book splits by payment history: exposure held by never-paid members (chase it) versus exposure held by paying members (expect it). Price both sides in one pass so the split lands on the dashboard together.",
    ask: "What open-invoice value sits with never-paid members versus paying members?",
    template: `SELECT {4}(CASE WHEN p.customer_id IS {2} THEN i.amount_cents ELSE 0 END) / 100.0 AS hot_val,
       SUM(CASE WHEN p.customer_id IS NOT NULL THEN i.amount_cents ELSE 0 END) / 100.0 AS expected_val
FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
{1} (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') p
  ON o.customer_id = p.customer_id
JOIN invoices i ON i.customer_id = {3}(o.customer_id, p.customer_id) AND i.status = 'open'
WHERE o.customer_id IS NOT NULL;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the split join",
        why: "FULL OUTER JOIN keeps the open-only rows — the hot side's entire value. RIGHT or INNER would drop them and the hot column would read zero while 5730.00 of chase-able paper disappears from the split.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hot-side flag",
        why: "p.customer_id IS NULL marks never-paid members — the hot column's condition. NOT NULL would swap the branches and both columns would print the expected book, mislabeling chase money as reliable.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The invoice join needs the member key from whichever side matched: COALESCE(o.customer_id, p.customer_id) resolves it for both exclusives and the overlap. SUM cannot resolve a key — it errors.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the hot-side fold",
        why: "SUM of the conditional amounts prices the hot side at 5730.00. COUNT would tally invoices (3), MAX the single biggest ticket (3562.00) — neither is the split's money column.",
      },
    ],
    distractors: ["RIGHT JOIN", "INNER JOIN", "NOT NULL", "COUNT", "MAX"],
    walkthrough:
      "The split reads: 5730.00 hot, 13879.00 expected — chase money versus money the paying members already owe on schedule. One pass prices both sides: the open-member list and the paid-member list meet under FULL OUTER JOIN, the CASE flags route each open invoice to its side by payment history (p NULL means never-paid), and the invoice join resolves member keys through COALESCE so both exclusives and the overlap all attach their paper. The join type is the difference between a split and a lie: RIGHT or INNER drop the open-only rows, and the hot column reads zero while the entire never-paid exposure vanishes from the dashboard. NOT NULL in the flag swaps the branch conditions — both columns would print the expected book. COUNT tallies invoices instead of pricing them, MAX prints one ticket. Two numbers, one pass, both sides preserved.",
  },
  {
    id: "cs-1593",
    tier: "hard",
    topic: "x5",
    universe: "growth",
    title: "The single-year books",
    brief:
      "From: Growth lead. Re: the year-over-year churn grid.\n\nThe board wants the invoicing churn in one row: members invoiced in 2024 but not 2025, and the mirror — 2025-only newcomers. Build the year-exclusivity grid in one pass.",
    ask: "How many members were invoiced only in 2024, and how many only in 2025?",
    template: `SELECT {4}(CASE WHEN y.customer_id IS {2} THEN 1 ELSE 0 END) AS only24,
       SUM(CASE WHEN o4.customer_id IS NULL THEN 1 ELSE 0 END) AS only25
FROM (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2024') o4
{1} (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = {3}) y
  ON o4.customer_id = y.customer_id;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the churn join",
        why: "FULL OUTER JOIN preserves both year-books so both exclusives are computable: 6 holdouts, 1 newcomer. LEFT keeps only 2024 members (only25 reads 0), RIGHT only 2025 (only24 reads 0) — each half of the grid would flatline.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the holdout flag",
        why: "y.customer_id IS NULL marks 2024 members the 2025 book never matched — the holdout condition. NOT NULL would flag continuing members instead and the grid would count overlap as churn.",
      },
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the current year",
        why: "The right side must be the 2025 book. '2024' on both sides would compare the year with itself — every member matched, both exclusives zero, the grid claiming zero churn and zero growth.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the grid counter",
        why: "SUM of the 1/0 flags totals the holdout column at 6. COUNT would count every row (12), MAX would cap the column at 1 — the grid needs flag totals, not a row count or a ceiling.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "COUNT", "MAX", "'2024'"],
    walkthrough:
      "The churn grid reads: 6 holdouts invoiced only in 2024, 1 newcomer invoiced only in 2025 — Hiro Tanaka — with 4 continuing members implied by the arithmetic. One pass builds it: both year-books meet under FULL OUTER JOIN, the CASE flags mark each row's year-exclusivity (y NULL means the member never came back, o4 NULL means they were never there before), and SUM totals the flags into columns. The join type carries the whole grid: LEFT preserves the 2024 side and would print 6 holdouts with the newcomer column flat at zero; RIGHT the mirror image; INNER only the 4 continuing members, both exclusives zeroed. NOT NULL in the flag would count overlap as churn. COUNT tallies rows (11) instead of exclusives, MAX caps at 1. And '2024' on both sides compares the book with itself — a grid that reports no churn and no growth the year the business clearly changed.",
  },
  {
    id: "cs-1594",
    tier: "hard",
    topic: "x5",
    universe: "funnel",
    title: "Europe's shipping ghosts, named",
    brief:
      "From: Fulfillment. Re: the EU clear-pipeline sheet.\n\nThe EU standup wants names, not counts: the members with shipped orders and nothing pending, alphabetized, so the ops lead can close out their files personally.",
    ask: "Which EU members hold a shipped order but no pending order, alphabetically?",
    template: `SELECT c.name FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
) s
{1} (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
) p2 ON s.customer_id = p2.customer_id
JOIN customers c ON c.id = {3}(s.customer_id, p2.customer_id)
WHERE p2.customer_id IS {2} AND c.region = 'EU'
ORDER BY c.name;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the exclusivity join",
        why: "FULL OUTER JOIN keeps the shipped-only rows with NULL pending keys. INNER keeps only members pending-and-shipped; RIGHT re-anchors on the pending list, where nothing goes unmatched — the sheet would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the clear-pipeline test",
        why: "p2.customer_id IS NULL isolates shipped members with nothing pending. NOT NULL would list the both-state members instead — Alice Chen and Pedro Alvarez, whose files should stay open.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "The customer join needs the member key from whichever side matched: COALESCE(s.customer_id, p2.customer_id) reads the shipped key for the clear-pipeline rows. SUM cannot resolve a key — it errors.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM", "'US'"],
    walkthrough:
      "The EU clear-pipeline sheet reads: Isabella Rossi, Liam O'Brien, Noah Meyer — three files the ops lead can close. The roster preserves both order-state lists under FULL OUTER JOIN and isolates the shipped-side exclusives with p2.customer_id IS NULL; the either-side key — COALESCE — resolves their member ids for the region join, and c.region = 'EU' scopes the sheet. NOT NULL would rebuild the sheet over the both-state members — Alice and Pedro, whose pending orders mean their files stay open. 'US' would swap the territory for Jamal Wright alone. INNER JOIN or RIGHT JOIN would each lose the shipped exclusives and the sheet would print nothing — the standup would conclude Europe's pipeline is universally active while three members sit quietly finished. Three names, alphabetized, files ready to close.",
  },
  {
    id: "cs-1595",
    tier: "hard",
    topic: "x5",
    universe: "growth",
    title: "The single-year census",
    brief:
      "From: Growth lead. Re: the churn headline.\n\nThe board deck needs one number: members whose invoicing history is single-year — they started and stopped, or just arrived. Count everyone on exactly one year's book, both directions combined.",
    ask: "How many members were invoiced in exactly one of 2024 or 2025?",
    template: `SELECT COUNT(*) AS single_year FROM (
  SELECT {3}(o4.customer_id, y.customer_id) AS member_id
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2024') o4
  {1} (SELECT DISTINCT customer_id FROM invoices WHERE strftime('%Y', issued_on) = '2025') y
    ON o4.customer_id = y.customer_id
  WHERE o4.customer_id IS {2} OR y.customer_id IS NULL
);`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the union join",
        why: "FULL OUTER JOIN spans both year-books, so members exclusive to either side survive with one NULL key. LEFT keeps only 2024 members (counting 6 holdouts, missing the newcomer), RIGHT only 2025 — each undercounting the census.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the exclusivity test",
        why: "The OR of the two NULL tests captures exactly-one-year membership: o4 NULL or y NULL. NOT NULL on the first test would collapse the filter to the 2024-only six and drop the newcomer.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "Single-year members have their key on only one side: COALESCE(o4.customer_id, y.customer_id) resolves the member id for the deduped census row. SUM cannot resolve a key — it errors on the second argument.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "NOT NULL", "SUM"],
    walkthrough:
      "Seven members live on exactly one year's book: the six 2024 holdouts (Chloe, Grace, Jamal, Maya, Olivia, Pedro) plus the lone 2025 newcomer, Hiro Tanaka. The census spans both year-books under FULL OUTER JOIN, and the WHERE clause is an either-or of NULL tests — o4 NULL or y NULL — which is precisely the definition of exactly-one-year membership, since both keys are never NULL simultaneously in a preserved union. COALESCE resolves each survivor's member key from whichever side matched, and the outer COUNT lands the headline at seven. The distractors each truncate the census: LEFT keeps 2024 members only — six holdouts, newcomer invisible; RIGHT keeps 2025 only — one; INNER only the four continuing members, zero exclusives. NOT NULL would cut the newcomer out of the OR. Seven — churn and arrival in one number.",
  },
  {
    id: "cs-1596",
    tier: "hard",
    topic: "x5",
    universe: "fraud",
    title: "The dark roster",
    brief:
      "From: Internal audit. Re: the unbilled-population check.\n\nThe union of open and paid invoice holders should cover everyone who ever transacted. Audit says otherwise. Count the members who appear on NEITHER list — the dark roster the billing system has never touched.",
    ask: "How many members hold neither an open nor a paid invoice?",
    template: `SELECT COUNT(*) AS dark_members FROM customers c
WHERE c.id {1} (
  SELECT {3}(o.customer_id, p.customer_id)
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
  {2} (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') p
    ON o.customer_id = p.customer_id
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the exclusion test",
        why: "NOT IN keeps members absent from the union — the dark roster of five. IN would count the union itself (11), the exact complement of the audit's question.",
      },
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the union join",
        why: "FULL OUTER JOIN spans both state-lists so the union is complete: 11 members. LEFT would union only the open side (6), RIGHT only the paid side (8) — each missing members and inflating the dark count.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "Union members hold their key on whichever side matched: COALESCE(o.customer_id, p.customer_id) resolves it for exclusives and overlaps alike. SUM cannot resolve a key — it errors on the second argument.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "IN", "SUM"],
    walkthrough:
      "The dark roster holds five members — and it is exactly the invoice-free five from the earlier hunt: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato and Noah Meyer. The audit builds the full billing population first: the open-member list and the paid-member list span under FULL OUTER JOIN, COALESCE resolves each member's key from whichever side matched, and the union covers 11 distinct members. The outer query then counts customers NOT IN that union — five members the billing system has never touched, despite all five carrying orders. The distractors each corrupt the complement: IN counts the union itself (11), LEFT shrinks the union to the open book and reports ten dark members, RIGHT shrinks it to eight, INNER to three. FULL OUTER JOIN is what makes the union honest — and the complement with it. Five dark members, matching the ghost census exactly.",
  },
  {
    id: "cs-1597",
    tier: "hard",
    topic: "x5",
    universe: "fraud",
    title: "The rail split",
    brief:
      "From: Treasury. Re: the payment-rail census.\n\nTreasury wants the member-level rail census: everyone who has ever paid, split by card versus wire — total, card-exclusive, wire-exclusive. One row, one pass, no second query.",
    ask: "How many members have paid, and how many pay exclusively by card versus wire?",
    template: `SELECT COUNT(*) AS members,
  {2}(CASE WHEN w.customer_id IS NULL THEN 1 ELSE 0 END) AS card_only,
  SUM(CASE WHEN cd.customer_id IS NOT NULL THEN 1 ELSE 0 END) AS wire_only
FROM (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method = 'card') cd
{1} (SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method = {3}) w
  ON cd.customer_id = w.customer_id;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the rail-union join",
        why: "FULL OUTER JOIN spans both rail-lists so the exclusives are computable: 8 paying members, 4 card-only, 0 wire-only. RIGHT would anchor on the wire list and misread the split; INNER only the overlap.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exclusive counter",
        why: "SUM of the 1/0 flags counts card-exclusive members — 4. COUNT would tally every row (8), MAX would cap the column at 1; the census needs flag totals.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the second rail",
        why: "The right side must be the wire list. 'card' on both sides would compare the rail with itself — every member matched, wire-only reading zero by construction rather than by finding.",
      },
    ],
    distractors: ["RIGHT JOIN", "INNER JOIN", "COUNT", "MAX", "'card'"],
    walkthrough:
      "The rail census reads: 8 members have paid, 4 exclusively by card, 0 exclusively by wire — every wire payer also has a card payment on file. One pass builds it: the card-payer list (derived through payments to invoices to members) and the wire-payer list meet under FULL OUTER JOIN, the CASE flags mark each row's rail-exclusivity, and SUM totals the flags. The zero is a finding, not a failure: wire-only payers do not exist in this book, and only a both-sides-preserving census can prove it — INNER JOIN would count just the 4 dual-rail members, RIGHT would anchor on the wire list and mislabel the split. COUNT in the flag slot counts rows (8) instead of exclusives, MAX caps at 1. And 'card' on both sides compares the rail with itself, reporting zero wire-exclusivity by construction. Eight payers, four card-only, zero wire-only — the treasury split, proved.",
  },
  {
    id: "cs-1598",
    tier: "hard",
    topic: "x5",
    universe: "month-close",
    title: "The month without a bill",
    brief:
      "From: Controller. Re: pricing the calendar hole.\n\nThe calendar check found the hole — now price it. What order revenue landed in the month that never produced an invoice? That figure goes beside the gap in the close pack.",
    ask: "What order revenue falls in the month that has orders but no invoices?",
    template: `SELECT {4}(o.rev, 2) AS opener FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev FROM orders GROUP BY mo
) o
{1} (
  SELECT strftime('%Y-%m', issued_on) AS mo, SUM(amount_cents) AS billed FROM invoices GROUP BY mo
) i ON o.mo = i.{3}
WHERE i.mo IS {2};`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the calendar-union join",
        why: "FULL OUTER JOIN preserves the order-month side so the hole month survives with NULL invoice keys. INNER keeps only months both calendars share — the hole would be invisible by construction; RIGHT re-anchors on invoice months, the side with no holes.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "i.mo IS NULL isolates the order-month the invoice calendar never matched. NOT NULL would list the thirteen covered months instead — revenue that did get billed.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the calendar key",
        why: "The calendars meet on the month key: o.mo = i.mo. Meeting on i.billed instead would compare month strings against cent totals, match nothing, and report every month as a hole.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(o.rev, 2) trims the hole month's revenue to 3731.97 for the pack. SUM, MAX or TOTAL take a single argument and would error on the , 2 — the two-argument rounding pass is the finisher.",
      },
    ],
    distractors: ["INNER JOIN", "RIGHT JOIN", "NOT NULL", "'rev'", "SUM"],
    walkthrough:
      "The hole month is 2024-01, and it carried 3731.97 of order revenue that no invoice has ever covered — the single largest unbilled month, sitting right at the start of the book. The pricing query joins the two calendars under FULL OUTER JOIN: fourteen order-months against thirteen invoice-months, WHERE i.mo IS NULL isolating the one gap. The key slot is the join's spine — o.mo = i.mo is the only meeting point that makes calendar sense; o.mo = i.rev would compare month strings against a column that does not exist on the invoice side and error outright. INNER JOIN would hide the hole by construction (it only sees covered months) and RIGHT re-anchors on the side with no holes. ROUND(o.rev, 2) finishes the figure — the slot trick again, since SUM or MAX in that position errors on the ', 2'. One month, 3731.97, priced for the pack.",
  },
  {
    id: "cs-1599",
    tier: "hard",
    topic: "x5",
    universe: "fraud",
    title: "The card-only four",
    brief:
      "From: Treasury. Re: the card-loyalty sheet.\n\nThe rail census proved four members pay exclusively by card. Treasury wants the names, alphabetized, for the card-loyalty outreach — and to confirm nobody pays wire-only by showing who the exclusives actually are.",
    ask: "Which members have paid by card but never by wire, alphabetically?",
    template: `SELECT c.name FROM (
  SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method = 'card'
) cd
{1} (
  SELECT DISTINCT i.customer_id AS customer_id FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.method = 'wire'
) w ON cd.customer_id = w.customer_id
JOIN customers c ON c.id = {3}(cd.customer_id, w.customer_id)
WHERE w.customer_id IS {2}
ORDER BY c.name;`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the rail-union join",
        why: "FULL OUTER JOIN keeps the card-only rows with NULL wire keys. INNER keeps only dual-rail members; RIGHT re-anchors on the wire list, where nothing goes unmatched — the sheet would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-wire test",
        why: "w.customer_id IS NULL isolates members the wire list never matched — the card-only four. NOT NULL would list the dual-rail members instead: Alice, Grace, Isabella and Maya.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "Rail-exclusive members hold their key on only one side: COALESCE(cd.customer_id, w.customer_id) resolves the member id for the name join. SUM cannot resolve a key — it errors on the second argument.",
      },
    ],
    distractors: ["RIGHT JOIN", "INNER JOIN", "NOT NULL", "SUM"],
    walkthrough:
      "The card-loyalty sheet reads: Emma Wilson, Jamal Wright, Liam O'Brien, Olivia Brown — four members who have never touched the wire rail. The roster preserves both rail-lists under FULL OUTER JOIN and isolates the card-side exclusives with w.customer_id IS NULL; the either-side key — COALESCE — resolves their member ids for the name join. NOT NULL would rebuild the sheet over the dual-rail members — Alice Chen, Grace Kim, Isabella Rossi, Maya Patel — the exact complement, and the wrong outreach list. INNER JOIN or RIGHT JOIN would each lose the card exclusives and print nothing, quietly claiming every card payer also wires. The mirror finding is already banked: zero wire-only payers exist, so these four and the four dual-rail members account for all eight who have ever paid. Four names, alphabetized, one rail.",
  },
  {
    id: "cs-1600",
    tier: "hard",
    topic: "x5",
    universe: "growth",
    title: "The settled roll and the both book",
    brief:
      "From: Growth lead. Re: the upsell slide, finished.\n\nThe upsell slide needs both facts in one row: the settled-and-holding members folded into one line, and the count of members who both pay and hold open paper — the healthy book. One pass, both facts.",
    ask: "What folded line names every paid-only member, and how many members hold both states?",
    template: `SELECT {4}(CASE WHEN o.customer_id IS {2} THEN c.name END, ', ' ORDER BY c.name) AS upsell_line,
       COUNT(CASE WHEN o.customer_id IS NOT NULL AND p.customer_id IS NOT NULL THEN 1 END) AS both_book
FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
{1} (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') p
  ON o.customer_id = p.customer_id
JOIN customers c ON c.id = {3}(o.customer_id, p.customer_id);`,
    slots: [
      {
        answer: "FULL OUTER JOIN",
        kind: "keyword",
        label: "the slide join",
        why: "FULL OUTER JOIN keeps the paid-only rows so the fold has names to carry. LEFT preserves the open side where nothing is unmatched — the line would fold to NULL; INNER keeps only the both-book members and the line would be empty too.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the paid-only flag",
        why: "o.customer_id IS NULL routes paid-only members into the CASE so their names enter the fold. NOT NULL would flip the condition and fold the open holders instead — the collections list, not the upsell line.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "Members hold their key on whichever side matched: COALESCE(o.customer_id, p.customer_id) resolves it so every census row finds a name. SUM cannot resolve a key — it errors on the second argument.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the name fold",
        why: "GROUP_CONCAT with the in-aggregate ORDER BY glues the five paid-only names into one alphabetical cell, skipping the NULLs the CASE leaves behind. SUM or MAX take a single argument and error on the separator.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "MAX"],
    walkthrough:
      "The finished slide row carries both facts: the upsell line reads Grace Kim, Hiro Tanaka, Jamal Wright, Maya Patel, Olivia Brown, and the both-book count reads 3 — Alice Chen, Emma Wilson and Isabella Rossi, who pay and still hold open paper. One pass builds both: the open-member and paid-member lists meet under FULL OUTER JOIN, the CASE routes each row's name into the fold only when the open key is NULL (paid-only), and GROUP_CONCAT skips the NULLs the CASE leaves behind — folding five names alphabetically thanks to the in-aggregate ORDER BY. The both-book counter reads the complementary flag. LEFT JOIN or INNER JOIN would each starve the fold — the open side has no exclusives, so the line folds to NULL. NOT NULL in the flag would fold the open holders' names into what is supposed to be the upsell line. Both facts, one row, deck-ready.",
  },
];
