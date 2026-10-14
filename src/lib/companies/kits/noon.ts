// noon — Wave-9 (Task 98), ecom domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// The Middle East's homegrown e-commerce marketplace (Riyadh/Dubai): noon.com across KSA, UAE and
// Egypt plus the cross-border Gulf lane, noon Minutes quick-commerce, noon Food, noon Pay,
// Arabic-first catalog UX. Storefront db read as a three-market GCC sandbox — customers are noon
// shoppers (region = market bucket: EU bucket = KSA, APAC bucket = UAE, US bucket = Egypt, LATAM
// bucket = the cross-border rest-of-Gulf lane), orders are noon orders (delivered = delivered
// clean, shipped = out with the courier with shipped_at as the dispatch stamp, pending = awaiting
// fulfillment, cancelled = COD-refused/aborted), order_items are order lines (quantity = units,
// unit_price = shelf price), products are listings, suppliers are noon sellers, invoices are
// seller settlement statements, payments are the settlement rails (card vs COD-style wire legs),
// expenses are network opex, ledger_entries are the GL. Money tables are INTEGER cents
// (amount_cents / 100.0 for dollars). Pool provenance: company-pools.md carries NO noon section
// (0 tagged rows), so all 10 topic slug sets and all 16 problems are theme-curated from the
// pools file's sql rows (no w*/d*/f* rows). Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const noonKit: CompanyKit = {
  id: "noon",
  domainId: "ecom",
  name: "noon",
  tagline: "GCC marketplace ops: three markets, one sun",
  accent: "text-yellow-400",

  brief: [
    "**noon** is the Gulf's homegrown e-commerce giant — a marketplace built for the Middle East rather than imported into it: Arabic-first catalog UX, {sky:cash-on-delivery} as a first-class rail, hyperlocal noon Minutes dark stores beside cross-country trucking, and noon Pay settling the money layer. This kit maps the storefront db onto that world: 16 customers rows are shoppers, 103 orders are noon orders worth **34,833.28** (average 338.19, spread 25.47 to 1,088.44), and the 251 order_items rows are order lines — quantity = units, unit_price = shelf price. The status map is fixed: delivered = {emerald:delivered clean} (52, 50.5%), shipped = out with the courier (30, 29.1%), pending = awaiting fulfillment (14, 13.6%), cancelled = {rose:COD-refused/aborted} (7, 6.8%).",
    "Three markets read off one region column: the {amber:EU bucket is KSA} — 45 orders from 8 shoppers worth 15,089.23 at a 335.32 AOV; the {sky:APAC bucket is UAE} — 37 from 5 worth 11,605.45 at 313.66; the {rose:US bucket is Egypt} — 19 from 2 worth 7,286.16 at 383.48; and the LATAM bucket is the tiny cross-border rest-of-Gulf lane — 2 orders, 852.44, the fattest basket at 426.22. COD refusal shares differ by market exactly the way the ops decks say they do: **8.1%** in the UAE bucket, 6.7% KSA, 5.3% Egypt, 0 cross-border — against the 6.8% network average. *Orders placed and orders kept are different numbers*, and the refusal map is where that difference lives.",
    "Interview screens are census-then-denominator. A loop opens with a **two-grain market census** — 45 orders from 8 shoppers, not one number wearing both names — then escalates into a rate where the interviewer asks the denominator out loud (*'does a refused order sit in your base?'*), then into the repeat-purchase ladder where four shoppers sit tied at 4 orders and rank semantics become a business decision. The logistics read is never far away: 82 of 103 orders carry a `shipped_at` dispatch stamp, averaging **2.98 days** booking-to-dispatch in a 2–4 day band, and the 14 pending rows have none yet — *a population definition, not a cleanup job*. Sellers sit one join away: 6 merchants whose books settle through statements and two rails (card legs and COD-style wire legs) in INTEGER cents.",
    "Preparation strategy: the pools file carries **no noon section** (0 tagged rows), so all sixteen problems and every topic slug here are theme-curated to the screens noon is known for — market censuses, {rose:COD refusal shares}, tie-heavy shopper leaderboards, the 14-month order spine, and the cents-safe settlement books. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:COD refusal map} ops opens Monday with, the other rebuilds the {amber:seller dunning list} finance reads at every close. The bar to clear: *state the denominator before you compute anything*, divide money by 100.0 — never 100 — and make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:00 —** The day opens with the one-pass status census: did the overnight orders land, and does the grid still reconcile — 52 delivered + 30 shipped + 14 pending + 7 refused = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The refusal map refreshes next: {rose:8.1%} in the UAE bucket against 5.3% in Egypt decides which market's confirmation-nudge experiment gets today's attention, and if dispatch latency drifts off the **2.98-day** norm (the band runs 2.93 cross-bucket to 3.5), the courier-mix call happens before the morning review, not after it.",
    "**11:30 —** Midday belongs to seller money. The dunning anti-join refreshes before anyone sends a reminder — **6 statements with zero settlement rows, worth 15,217** — and the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) with a void-but-settled statement (#11, 925.00) and a paid-status statement carrying zero legs (#28, 1,756.00) walked line by line, because *the status column is a claim and the payment rows are the record*. Beside it, the rails mix (card 16 legs / 37,364 versus wire 11 / 32,248) feeds the COD-versus-prepaid push, and a seller with 11,130.25 of revenue asks why their second statement settled in two legs — the split-leg census answers in one query.",
    "**15:30 —** The afternoon is stakeholder cycles. The growth board wants the 14-month spine (2024-01 to 2025-02) with the **1,193.86 July trough** and the jump into August named; merchandising wants the category crowns — {amber:Audio} leads at 11,744.01 with Wearables at 6,929.12 — re-cut per market; finance closes the day the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero, with cash at 44,196 and AR at 16,440 — {emerald:the close ships} or tomorrow starts with an incident. The analyst leaves the two numbers tomorrow must reconcile written down, so the next shift inherits queries, not mysteries.",
  ],

  metrics: [
    { name: "GMV (placed)", what: "Gross order value across the network: 34,833.28 over 103 orders, average 338.19, spread 25.47 to 1,088.44. Placed, not kept — the headline every market review starts from before status is applied." },
    { name: "Orders kept rate", what: "Delivered clean ÷ all placed: 52 of 103 (50.5%). The 30 shipped-but-not-yet-delivered orders are a different stage — counting them as kept is the interview's favorite trap." },
    { name: "COD refusal share", what: "Refused/aborted ÷ placed: 7 of 103 (6.8%) network-wide, split 8.1% UAE bucket, 6.7% KSA, 5.3% Egypt, 0 cross-border. The denominator is PLACED demand — only placed orders can abort." },
    { name: "Dispatch latency", what: "Booking to courier dispatch (created_at → shipped_at) over the 82 stamped orders: 2.98-day average in a 2–4 day band; 2.93 (UAE bucket) to 3.5 (cross-border) by market. The 14 pending rows have no stamp and no latency yet." },
    { name: "Market mix", what: "Revenue by bucket: KSA 15,089.23 (45 orders / 8 shoppers), UAE 11,605.45 (37/5), Egypt 7,286.16 (19/2), cross-border 852.44 (2/1). Load and audience are different columns — 5.6 orders per shopper in KSA, 9.5 in Egypt." },
    { name: "Seller concentration", what: "Nordic Gadgets AB books 11,130.25 — 32% of network revenue — and Midwest Hardware Co 9,294.93 (26.7%): the top two sellers carry over half the GMV. One lost seller moves a quarter." },
    { name: "Settlement coverage", what: "Statements versus collected: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the finance pod refreshes every close before a single reminder ships." },
    { name: "Payment rails", what: "Settlement legs by rail: card 16 legs / 37,364 versus COD-style wire 11 / 32,248. The mix that prices the COD push — and the split-leg anomalies (5 statements settle across two legs) live here too." },
  ],

  topics: [
    {
      name: "Two-grain market censuses",
      why: "Every market review at noon opens with orders AND shoppers per bucket — KSA runs 45 orders from 8 shoppers while the cross-border lane runs 2 from 1, and the two grains tell different stories (network load versus audience). COUNT(*) beside COUNT(DISTINCT customer_id), with the ratio named out loud, is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Status-aware order funnels",
      why: "Orders here live four lives — delivered clean (52), out with the courier (30), awaiting fulfillment (14), COD-refused/aborted (7) — and every kept-rate, refusal-share and dispatch count is a conditional count over those states. The interviewer's first question is always what the denominator holds; the second is whether your filter ran before the fold.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel"],
    },
    {
      name: "CASE classification & banding",
      why: "Market tiers, refusal classes and settlement coverage (exact / partial / none) are all CASE-classified in one pass over the same tables. Exhaustive, ordered arms matter: a hole in the CASE is a hole in the close, and the lone partial statement (4,000 of 6,148) is exactly the row a reordered WHEN mislabels.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Joining shoppers, listings and sellers",
      why: "Listing-level reporting stitches three tables — orders to order lines to listings to sellers — and the join type decides who survives the report. An order with no shopper is corruption; a seller with no demand is a bench decision; the join choice IS the business statement.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "sales-analysis-ii"],
    },
    {
      name: "Seller settlements & cents discipline",
      why: "The seller world settles through statements and rails in INTEGER cents — the dollar read is amount_cents / 100.0, and 28 statements against 27 legs (with five splits and one partial) make the settlement books the closest thing this kit has to a finance round. Reconciliation reads here are daily, not exotic.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Anti-joins & dunning lists",
      why: "The dunning draft is a pure anti-join: statements with zero settlement rows — 6 worth 15,217 on this db. LEFT JOIN + IS NULL and its NOT EXISTS twin are daily tools, and the honest zero (every shopper here has ordered at least once) is a result you prove, not assume.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "dormant-reactivation"],
    },
    {
      name: "Ranking windows & tie policy",
      why: "The repeat-purchase ladder runs 24, 17, 14, 13, 5 orders — then FOUR shoppers tied at 4. RANK, DENSE_RANK and ROW_NUMBER disagree about shared rungs and gaps, and at 16 shoppers the ties are the story, not the edge case; the tie-breaker you name is the policy you ship.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Month walks & the dispatch clock",
      why: "The 14-month spine (2024-01 to 2025-02) drives every trend read, and dispatch latency — 2.98 days over 82 stamped orders — is JULIANDAY arithmetic on TEXT timestamps. Half-open windows and stated conventions are the discipline; BETWEEN silently loses the boundary night.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Rates with honest denominators",
      why: "Refusal shares, coverage rates and per-market AOV punish integer division and denominator drift. The house habit: 100.0 before the division, the base decided before the ratio — refusal over PLACED, never over delivered — and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price"],
    },
    {
      name: "One-pass censuses",
      why: "Ops boards get the whole order state in ONE scan — SUM(CASE …) arms that must reconcile to COUNT(*) (52+30+14+7 = 103 by construction). FILTER (WHERE …) is the portable twin; four sequential queries are four ways to drift out of reconciliation.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "find-stores-with-inventory-imbalance"],
    },
  ],

  theory: [
    {
      id: "noon-t1",
      q: "Your market report joins shoppers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter an order column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins orders to shoppers: an order with no shopper row is corruption, so INNER is honest — and worth a data-quality flag, not a silent inner join. A 'shoppers who never ordered' report must be LEFT from customers: the unmatched shoppers ARE the answer, arriving with NULL order columns — and on this db the anti-join returns a confident zero, because all 16 shoppers appear in orders somewhere; proving that zero is part of the job, not a failed query. The classic break: writing status = 'cancelled' in WHERE after a LEFT JOIN from shoppers kills every NULL-payload shopper row, the LEFT quietly becomes an INNER, and the whitespace vanishes — the fix is moving the predicate into ON or an outer query. At noon the same logic runs in reverse against settlements: a statement with no payment row is not corruption, it IS the dunning list. The join type is the business question; pick it on purpose and say so.",
      tag: "joins",
    },
    {
      id: "noon-t2",
      q: "The repeat-purchase ladder runs 24, 17, 14, 13, 5, then FOUR shoppers tied at 4 orders. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK shares rungs and then skips: the four-way tie at 4 consumes ranks 6 through 9, so the two shoppers at 3 orders land on rank 10 — five phantom positions that do not exist. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which shopper's cohort gets credited first — acceptable only when you own the tie-breaker explicitly (created_at, then id, written in the comment). At noon this matters beyond cosmetics: the same shoppers feed retention cohorts and courier-slot priorities, and a gap that exists only in RANK arithmetic shows up as 'missing shoppers' in the next deck. The wrong answer is picking a function; the right answer is picking a policy, naming the tie-breaker, and writing it where the next analyst can find it.",
      tag: "windows",
    },
    {
      id: "noon-t3",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — narrate what each counts in an orders table where shipped_at is NULL until dispatch.",
      a: "Three grains, stated out loud. COUNT(*) counts rows — all 103 placed orders, shipped or not. COUNT(shipped_at) counts non-NULL values — the 82 dispatched; the gap between the two numbers IS the 14 pending plus 7 refused, which is a feature, not a bug. COUNT(DISTINCT customer_id) folds repeat demand back to shoppers: 45 orders in the KSA bucket collapse to 8 shoppers, and the ratio — 5.6 orders per shopper against Egypt's 9.5 — is the intensity signal the growth team actually manages. The conditional fourth form is where noon lives: SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) counts refusals inside the same fold as placements, so the refusal share divides one arm of the census by the whole — 7 of 103, 6.8%. The trap that catches candidates is a fifth count: join order_items for units and COUNT(*) silently counts line items instead of orders — 251 of them. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "noon-t4",
      q: "shipped_at is NULL until the courier takes the parcel. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched orders have a latency, so the report measures booking-to-dispatch for the 82 of 103 orders carrying the stamp — average 2.98 days, spread 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL rows returns the same 2.98 over a silently shrunken population — a real number wearing the wrong name, which is why the WHERE shipped_at IS NOT NULL is stated, not implied. COUNT(shipped_at) versus COUNT(*) is the honest gap read: 103 minus 82 is exactly the 14 awaiting fulfillment plus 7 refused. Joins join the misery: a NULL key never matches, so any order with a NULL reference vanishes from INNER joins; and filters are three-valued — NULL fails both x = value and x != value, so WHERE status != 'cancelled' silently keeps refused rows only if status can be NULL. What is never acceptable is IFNULL-ing latency to zero to 'fix' the average — that invents same-day dispatches for parcels that have not left the dark store. Guard the population, then compute; never decorate the output.",
      tag: "nulls",
    },
    {
      id: "noon-t5",
      q: "The growth review wants refused revenue per market for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — it discards rows before any fold — so it lives in WHERE; once rows are grouped the statuses no longer exist, and a HAVING attempt is impossible because the column is gone. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY — which on this db keeps KSA (45), UAE (37) and Egypt (19) and drops the cross-border lane's 2, a decision about statistical trust you say out loud. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here: it is the difference between a forecast line and an error, and between a threshold applied to orders versus to dollars. Aliases obey the same clock — born in SELECT, usable in ORDER BY, invisible to WHERE. When a filter's home is ambiguous, ask the grain: 'orders above 400' is WHERE (a row fact about one order — Egypt's fattest baskets); 'markets above ten orders' is HAVING (a group fact). The strong candidate places every filter by asking: is this about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "noon-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking perfectly valid. On the full table that is theoretical: 103 orders always produce the 338.19 mean. On filtered staging tables — one market, one status, one month of the 14-bucket spine — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin — compare each order to ITS market's average (335.32 KSA, 313.66 UAE, 383.48 Egypt) — re-runs per outer row and answers a different question at a different cost, which is itself worth saying out loud. The derived-table shape (fold first, then join the aggregate back) is the staging you reach for when the definition is used twice. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for — and 'it returns rows' is not an empty-case answer.",
      tag: "subqueries",
    },
    {
      id: "noon-t7",
      q: "Orders arrive with TEXT timestamps. How do you build the month spine, cut a sale window without losing its last night, and read the first row of the LAG?",
      a: "Three moves, three caveats. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — both yield 14 buckets from 2024-01 to 2025-02 on this db, and '%m' alone would merge January 2024 with January 2025, turning the trend into fiction. The window: half-open — created_at >= '2024-11-01' AND created_at < '2024-12-01' — because BETWEEN '2024-11-01' AND '2024-11-30' compares '2024-11-30 18:40:11' against the bare date and the evening of the last day silently drops; a Yellow Friday fold that loses its biggest night is a rounding error nobody can explain. Diffs: JULIANDAY(shipped_at) - JULIANDAY(created_at) returns fractional days — the 2.98-day dispatch average is exactly that, rounded once at the end, never per row. And the LAG: on a month-ordered spine the first row's prior value is NULL by definition — the baseline, reported as NULL or labeled, never coalesced to zero, which reads as a flat month. State the timezone convention the columns imply, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "noon-t8",
      q: "Finance says a settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payment legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the mirror anomaly: a void statement WITH a settled leg (#11, 925.00) never appears in that anti-join — the two error modes point in opposite directions, and both reconcile to the row-level anomaly list, not to vibes. Coverage then classifies the rest: 21 exact (65,612), 1 partial (4,000 of 6,148 — a collections conversation, not a dunning row), 5 statements settling across split legs. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 eats cents on every odd-cent row and misprices the dunning draft by construction. And the close has a final identity: the GL trial balance must land 181,080 debits against 181,080 credits, delta zero — or the settlement does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "noon-mcq-1",
      prompt: "An order row's status reads 'shipped'. In this kit's noon stage map, what has happened?",
      choices: ["Out with the courier — dispatched, not yet at the door (30 orders)", "Delivered clean — the door drop is done (52 orders)", "COD refused / aborted — the order will not complete (7 orders)", "Awaiting fulfillment — nothing has left the warehouse (14 orders)"],
      answer: 0,
      why: "The stage map is fixed: shipped = dispatched, with shipped_at as the dispatch stamp — 30 of 103 orders (29.1%). It is the 'in motion' stage, between fulfillment and the doorstep.",
      notes: [
        { choice: 1, why: "Delivered is the completed stage — 52 orders (50.5%). Counting in-motion parcels as kept inflates the kept rate before the door drop happens." },
        { choice: 3, why: "Awaiting fulfillment is 'pending' — 14 orders with no dispatch stamp at all. Pending is not in motion and not refused; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-2",
      prompt: "A settlement ledger row reads amount_cents = 1521700. Which expression prints the right dollar figure?",
      choices: ["ROUND(amount_cents / 100.0, 2) — 15217.0", "ROUND(amount_cents / 100, 2) — same thing, shorter", "amount_cents * 0.01 — only safe because the column is REAL", "SUBSTR(amount_cents, 1, LENGTH(amount_cents) - 2) — trim the cents"],
      answer: 0,
      why: "Money tables here are INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 forces real arithmetic before the division. 1521700 / 100.0 = 15217.0, matching the probed 15,217 AR figure.",
      notes: [
        { choice: 1, why: "INTEGER / INTEGER is integer division — it happens to land on this db because the cents are whole-dollar multiples, and truncates the first odd-cent leg. The .0 is the discipline, not decoration." },
        { choice: 2, why: "The column is INTEGER, not REAL — and hoping the type saves you is exactly how truncation bugs ship. Multiply by 1.0 or divide by 100.0 deliberately." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-3",
      prompt: "The KSA bucket shows 45 orders from 8 shoppers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "COUNT(DISTINCT customer_id) and COUNT(DISTINCT region)", "SUM(total) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to shoppers (8). The gap between them — 5.6 orders per shopper — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL foreign keys — 45 again, since every order carries a shopper. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "region is constant within the bucket — DISTINCT region counts 1, not shoppers. A census of ones nobody asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) prints 6.8 for the network. What does the version WITHOUT the 100.0 print?",
      choices: ["6.8 — the multiplier is cosmetic", "0 — SUM of 0/1 flags over COUNT is integer division: 7 ÷ 103 truncates before any scaling", "0.068 — it returns a fraction instead of a percent", "NULL — SQLite errors on division by COUNT"],
      answer: 1,
      why: "Without the 100.0 the numerator and denominator are both integers, so 7/103 truncates to 0 and every market reads refusal-free — the 8.1% UAE bucket prints as 0. The 100.0 must sit BEFORE the division to promote real arithmetic.",
      notes: [
        { choice: 0, why: "Placement changes the arithmetic TYPE, not the display — moving or dropping the 100.0 is the bug, not a style choice." },
        { choice: 2, why: "A decimal fraction requires real division — the exact thing integer math skipped. 0.068 would be the right SHAPE from the wrong arithmetic." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-5",
      prompt: "Keep only markets carrying at least 10 orders (KSA 45, UAE 37, Egypt 19 clear; cross-border 2 drops). Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY c.region HAVING COUNT(*) >= 10", "WHERE placed >= 10 on the raw orders table", "HAVING placed >= 10, before GROUP BY"],
      answer: 1,
      why: "An order-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. Three buckets clear it; the 2-order lane drops.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed yet. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'placed' column on orders — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-6",
      prompt: "The dunning anti-join lists settlement statements with zero payment rows. Which statement lands in the list?",
      choices: ["#28 — marked 'paid' with zero settlement rows (1,756.00)", "#25 — open, partially settled: 4,000 of 6,148", "#11 — void, yet one settlement leg of 925.00 landed", "#1 — paid across two split legs totaling 4,860"],
      answer: 0,
      why: "The anti-join keys on payment ROWS, not the status claim: #28 carries none, so it dunes despite reading 'paid'. The status column is a claim; the legs are the record.",
      notes: [
        { choice: 1, why: "#25 carries a leg — the 4,000 partial. One row is enough to escape the anti-join; it is a coverage conversation, not a dunning row." },
        { choice: 2, why: "#11's settled leg pulls it OUT of the anti-join — a status lie in the other direction. Both anomalies reconcile against the row-level anomaly list." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, unnamed 82-row population", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The 7 refused orders double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 orders.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-8",
      prompt: "A staging dunning query uses statement_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows. First suspicion?",
      choices: ["The books genuinely settle every statement — the zero is correct", "One NULL invoice_id in the legs poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "x NOT IN (…) is UNKNOWN the moment a NULL enters the materialized list — every outer row fails the comparison and the report empties with no error. Policy: NOT EXISTS for existence tests, or NULL-guard the subquery before NOT IN goes near it.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db six statements truly have no legs. But staging tables are exactly where NULLs sneak in, and empty dunning reports ship from there." },
        { choice: 2, why: "The syntax is fine. The failure is three-valued logic, not capability." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-9",
      prompt: "The repeat-purchase ladder runs 24, 17, 14, 13, 5 orders, then FOUR shoppers tied at 4, then two shoppers at 3. Under DENSE_RANK, what rank do the 3-order shoppers carry?",
      choices: ["7", "10", "6", "9"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: ranks 1–5, then the tie block reads 6, 6, 6, 6, and the next distinct count lands on 7. Both 3-order shoppers share rank 7.",
      notes: [
        { choice: 1, why: "10 is the RANK answer — shared rungs WITH gaps: the tie consumes 6 through 9 and the next rung handed out is 10. The board's published policy is DENSE_RANK." },
        { choice: 2, why: "6 is the rung the tie block OCCUPIES, not the next rung handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-10",
      prompt: "A Yellow Friday fold reads WHERE created_at BETWEEN '2024-11-01' AND '2024-11-30'. What is wrong?",
      choices: ["Nothing — BETWEEN keeps all of November including the 30th", "BETWEEN on TEXT dates is lexicographic and returns nothing", "The bare-date upper bound cuts at midnight on the 30th — evening orders on the 30th drop; go half-open: >= '2024-11-01' AND < '2024-12-01'", "BETWEEN cannot filter a TEXT timestamp column at all"],
      answer: 2,
      why: "created_at carries a time component, and '2024-11-30 18:40:11' compares GREATER than the bare date '2024-11-30' — so the sale's last evening silently fails the upper bound. The half-open form keeps the whole boundary day by construction.",
      notes: [
        { choice: 0, why: "The prefix-versus-full-timestamp compare is exactly the silent part: rows from the 30th look inside the window and fail the <= test. The fold loses its biggest night and balances anyway." },
        { choice: 1, why: "Lexicographic compare works fine on ISO text — that is precisely why the bug is silent rather than loud." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-noon-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The COD refusal map",
      brief:
        "Growth-ops memo on the storefront db, noon-flavored: Monday's market review opens with the {rose:COD refusal map} — one row per market bucket, placed orders, refused/aborted orders, and the refusal share with its denominator printed, because *a share without its base is a rumor*. Probed facts: 103 orders worth 34,833.28; the network refuses 7 of 103 (6.8%); by bucket the UAE (APAC) runs 37 placed / 3 refused / 8.1%, KSA (EU) 45 / 3 / 6.7%, Egypt (US) 19 / 1 / 5.3%, cross-border (LATAM) 2 / 0 / 0. The clean-delivery column must reconcile against the same fold — APAC 21, EU 24, US 5, LATAM 2 delivered — and ops reads the worst refusal market first, with basket size (AOV) beside it for context.",
      ask: "Return each market bucket with placed orders, refused orders, refusal share to 1 decimal and average order value to 2 decimals — worst refusal share first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS refused,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS delivered_clean,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {2}) AS refuse_pct,\n       ROUND(AVG(o.total), 2) AS aov\nFROM orders o\nJOIN customers c ON {3}\nGROUP BY {4}\nORDER BY refuse_pct {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the clean-delivery literal",
          why: "Delivered-clean is status 'delivered' — 24 in the KSA bucket, 21 UAE, 5 Egypt, 2 cross-border. 'shipped' prints the courier stage (12/8/10/0) into the column and 'pending' prints the queue (6/5/3/0); either way the census stops describing the stage it claims to count.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The refusal map quotes one decimal — 8.1 / 6.7 / 5.3 / 0, matching the probed cancellation-share fold. ROUND(…, 2) prints 8.11 and the map stops reconciling with the 6.8% network share quoted two slides later.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the market stitch",
          why: "Orders reference their shopper by customer_id, so the stitch is c.id = o.customer_id. o.customer_id = o.id pairs orders with whatever shopper shares their row id — the fold becomes a coincidence and every market number is wrong with no error anywhere.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market key",
          why: "One row per market bucket means the fold key is c.region — four rows at 45 / 37 / 19 / 2. GROUP BY o.status re-groups by pipeline stage instead: four rows about the wrong thing, and no market appears anywhere.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-market-first direction",
          why: "Ops reads the worst refusal share first: 8.1, 6.7, 5.3, 0. ASC opens the review on the cross-border lane's spotless 0 — a correct query aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "0", "2", "o.customer_id = o.id", "o.status"],
      walkthrough:
        "One scan, two conditional arms, one honest denominator. The stitch attaches every order to its shopper's market bucket and GROUP BY c.region folds 103 orders into four rows; the SUM(CASE …) refusal arm reads 3 / 3 / 1 / 0 while the delivered-clean arm reads 24 / 21 / 5 / 2 — and each bucket's four stages still reconcile to its placed count by construction (KSA 24+12+6+3 = 45, UAE 21+8+5+3 = 37, Egypt 5+10+3+1 = 19, cross-border 2 = 2). The share divides the refused arm by COUNT(*) — the PLACED base, never the delivered base — with 100.0 promoting real arithmetic before the division: 8.1 / 6.7 / 5.3 / 0, reconciling upward to the 6.8% network share over 103 orders. The money column folds ROUND(AVG(o.total), 2): 313.66 / 335.32 / 383.48 / 426.22 — Egypt runs the fattest basket on the smallest big-market book. The read: the UAE bucket refuses most (8.1) on the second-biggest base — where the confirmation-nudge experiment goes — while the cross-border lane's clean 0 rides on just 2 orders, too small to trust. The distractors each break differently: 'shipped' and 'pending' swap pipeline stages into the clean-delivery column; 0 in the precision slot floors 8.1 to 8 and the map drifts off the deck; 2 re-keys the share to 8.11, a cell that reconciles with nothing; o.customer_id = o.id stitches orders to the wrong shoppers; o.status in the market key re-groups by stage — four rows, zero markets.",
    },
    {
      id: "cs-noon-2",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The unsettled seller statements",
      brief:
        "Seller-finance memo at month-end close: noon settles sellers through settlement statements (the invoices table) against two rails — card legs and COD-style wire legs (the payments table) — and the {rose:dunning draft} goes out only to statements with ZERO settlement rows, because a statement with any leg is a coverage conversation, not a dunning one. Probed facts: 28 statements; the status roll reads open 6 / 19,609, paid 21 / 66,443, void 1 / 925; the AR anti-join reads **6 statements worth 15,217**; coverage splits 21 exact (65,612) / 1 partial (4,000 of 6,148) / 6 none. Two anomalies the close must survive: #28 is marked 'paid' with zero settlement rows (1,756.00), and #11 is 'void' yet carries a settled 925.00 leg. Money is INTEGER cents — the dollar read is `/100.0`, and collections works biggest balance first.",
      ask: "Return every settlement statement with no settlement row — statement id, claimed status and amount in dollars to 2 decimals — biggest exposure first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claimed_status,\n       ROUND(i.amount_cents / {1}, 2) AS statement_amount\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE p.id {3}\nORDER BY statement_amount {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements carry INTEGER cents, so the dollar read is amount_cents / 100.0 — 1,756.00 on #28. /1000 shrinks every exposure tenfold and the dunning draft under-collects by an order of magnitude; the .0 is the discipline that keeps integer division out of money math.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the settlement stitch",
          why: "Legs reference their statement by invoice_id, so the stitch is p.invoice_id = i.id. p.invoice_id = p.id folds the payments table against itself — legs join legs, statements float unmatched, and the anti-join invents exposure that does not exist.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join guard",
          why: "Dunning keeps the unmatched LEFT side: p.id IS NULL. IS NOT NULL flips the fold to the settled book and the dunning list empties into paid statements; = NULL matches nothing at all — three-valued logic, zero rows, no error.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "Collections works biggest balance first, with the paid-status lie #28 (1,756.00) sitting inside the list. ASC sorts the smallest exposure to the top and the biggest outstanding balance waits another day.",
        },
      ],
      distractors: ["1000", "10", "p.id", "IS NOT NULL", "= NULL", "ASC"],
      walkthrough:
        "An anti-join with a money rule attached. The LEFT JOIN keeps every statement and hangs NULL payloads where no leg matched; WHERE p.id IS NULL keeps exactly the unmatched side — six statements, 15,217.00 in aggregate, reconciling with the probed AR figure. The list's shape is the teaching point: open statements plus ONE paid-status row, because #28 (1,756.00) claims 'paid' while carrying zero settlement rows — the status column is a claim, the payment rows are the ledger of record. The rows that do NOT appear matter just as much: #11 is 'void' yet carries a settled 925.00 leg, and #25 (open, 6,148.00) carries the 4,000.00 partial — any leg at all escapes the anti-join, which is why partial coverage is a collections conversation, not a dunning row. The cents divider prints dollars to two decimals — 100.0 before anything else touches the column — and ORDER BY statement_amount DESC works biggest balance first. The distractors each break differently: 1000 shrinks every balance tenfold; 10 re-stitches the join so only the statement sharing an id with a leg drops; p.id folds legs against legs and invents exposure; IS NOT NULL flips the query to the settled book and the dunning list vanishes; = NULL matches nothing — three-valued logic empties the report with no error; ASC opens collections on the smallest balance.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-listing units fold: the category team's weekly velocity read — which listings pull units across the three markets. The fold-then-rank shape behind every best-seller board noon ships." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV in one pass — the two numbers the market P&L hangs from (network AOV 338.19 on this db). Order grain versus line-item grain in a single query." },
    { slug: "repeat-purchase-rate", why: "Share of shoppers with 2+ orders — the retention pulse for a marketplace that lives on repeat baskets, not one-off deal hunters. The denominator question is built in." },
    { slug: "game-play-analysis-iv", why: "Did the shopper come back the day after the first order? Next-day repeat share is the COD-checkout health read — first-order cohorts deciding to keep or refuse." },
    { slug: "employee-bonus", why: "LEFT JOIN with a conditional display column — the shape of every seller-facing statement that must show NULL as 'no bonus yet', not a fabricated zero." },
    { slug: "managers-with-at-least-5-direct-reports", why: "The listing-count gate: which sellers carry at least five live listings. HAVING over a join fold — the seller-bench screen merchandising runs before campaigns." },
    { slug: "market-analysis-i", why: "Buyers with A and without B in one fold — 'ordered but never refused' style splits are exactly how the COD map and the prepaid push are built here." },
    { slug: "monthly-transactions-i", why: "Month-bucket fold with a status filter — the 14-month spine (2024-01 to 2025-02) at practice scale, with cancelled demand handled honestly instead of filtered into fiction." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-shopper argmax — the favorite-listing read behind noon's Arabic-first recommendation cards, with ties that force a deterministic tie-breaker." },
    { slug: "second-highest-salary", why: "Second-highest price among listings — the Nth-rank screen that breaks on ties unless the window trio is fluent. Pricing decks lean on exactly this shape." },
    { slug: "fix-product-name-format", why: "Catalog title hygiene before any join: mixed-case listings split one SKU into two, and the census doubles silently. Arabic-first UX makes title discipline a daily chore." },
    { slug: "find-all-unique-email-domains", why: "Shopper email domains via SUBSTR/INSTR — the CRM segmentation read that feeds noon Pay wallet campaigns and the prepaid-conversion push." },
    { slug: "null-blank-audit", why: "NULL/blank audit across a feed — the catalog-intake check that keeps empty Arabic titles and missing fields from poisoning joins downstream." },
    { slug: "duplicate-charge-pairs", why: "Duplicate settlement-leg pairs — the self-join screen that catches split-leg anomalies (five statements settle across two legs on this db) before finance does." },
    { slug: "transaction-velocity", why: "Velocity bursts over timestamps — the noon Minutes read: hyperlocal demand arrives in waves, and burst detection is window math over event times." },
    { slug: "cohort-retention-matrix", why: "Cohort retention matrix — shoppers by first-order month against later activity; the LAG/partition shape behind the growth board's retention slide." },
  ],
};
