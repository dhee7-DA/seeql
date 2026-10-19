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
    "Preparation strategy: the pools file carries **no noon section** (0 tagged rows), so all thirty-two problems and every topic slug here are theme-curated to the screens noon is known for — market censuses, {rose:COD refusal shares}, tie-heavy shopper leaderboards, the 14-month order spine, and the cents-safe settlement books. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: the {rose:COD refusal map} ops opens Monday with, the {amber:seller dunning list} finance reads at every close, the {sky:VIP ladder} with its four-way tie, the seller concentration read, the above-the-mean shelf, and the 14-month GMV spine walk. The bar to clear: *state the denominator before you compute anything*, divide money by 100.0 — never 100 — and make every status census reconcile to 103 by construction.",
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
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "find-loyal-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Status-aware order funnels",
      why: "Orders here live four lives — delivered clean (52), out with the courier (30), awaiting fulfillment (14), COD-refused/aborted (7) — and every kept-rate, refusal-share and dispatch count is a conditional count over those states. The interviewer's first question is always what the denominator holds; the second is whether your filter ran before the fold.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel", "second-day-confirmation"],
    },
    {
      name: "CASE classification & banding",
      why: "Market tiers, refusal classes and settlement coverage (exact / partial / none) are all CASE-classified in one pass over the same tables. Exhaustive, ordered arms matter: a hole in the CASE is a hole in the close, and the lone partial statement (4,000 of 6,148) is exactly the row a reordered WHEN mislabels.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Joining shoppers, listings and sellers",
      why: "Listing-level reporting stitches three tables — orders to order lines to listings to sellers — and the join type decides who survives the report. An order with no shopper is corruption; a seller with no demand is a bench decision; the join choice IS the business statement.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "sales-analysis-ii", "customer-purchasing-behavior-analysis", "customers-who-bought-a-and-b-not-c"],
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
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "rfm-segmentation", "usage-tier-percentiles", "find-bursty-behavior", "rolling-7d-actives"],
    },
    {
      name: "Month walks & the dispatch clock",
      why: "The 14-month spine (2024-01 to 2025-02) drives every trend read, and dispatch latency — 2.98 days over 82 stamped orders — is JULIANDAY arithmetic on TEXT timestamps. Half-open windows and stated conventions are the discipline; BETWEEN silently loses the boundary night.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "friday-purchases-i", "same-day-sale", "calculate-orders-within-each-interval", "sessionize-events", "find-golden-hour-customers"],
    },
    {
      name: "Rates with honest denominators",
      why: "Refusal shares, coverage rates and per-market AOV punish integer division and denominator drift. The house habit: 100.0 before the division, the base decided before the ratio — refusal over PLACED, never over delivered — and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "average-selling-price", "returns-rate-by-category", "dau-wau-stickiness"],
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
    {
      id: "noon-t9",
      q: "The merchandising board wants a rolling 7-order average basket across the order stream. How do you build the frame, and where do ROWS and RANGE disagree?",
      a: "AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) averages the previous six orders plus the current one. The expert detail is the frame keyword: ROWS counts physical rows, RANGE counts peers of the ORDER BY value — and on a 103-order book with same-day clusters (Yellow Friday evenings especially), RANGE sweeps in every order sharing those timestamps and the window's row count jumps on the busiest hours. If the axis should be calendar-true, use a RANGE frame on a date value or join to a date spine; if rows-true, ROWS with the tie behavior stated. On this book the two frames genuinely disagree, which is why the board footnotes which one the trend uses.",
      tag: "windows",
    },
    {
      id: "noon-t10",
      q: "UNION versus UNION ALL — when does the dedupe silently cost you a market, and what are INTERSECT and EXCEPT for in the settlement world?",
      a: "UNION ALL concatenates; UNION dedups whole rows across branches. The failure is silent: two branches that emit byte-identical rows — same market, same counts, no label column — collapse into one, and a market vanishes from the pack with no error anywhere. The house rule is UNION ALL plus a comment stating why duplicates are impossible; arms must match in column count and type family or SQLite rejects at prepare time. INTERSECT answers shared membership — the five settlement statements (1, 5, 12, 19, 22) that ride BOTH rails, one card leg plus one wire leg each. EXCEPT is set subtraction — months that booked volume but logged no refusal. As sets they collapse duplicates within each arm: set operations, not bags.",
      tag: "setops",
    },
    {
      id: "noon-t11",
      q: "The market census must print every bucket — including the cross-border lane with its zero refusals. How do you zero-fill honestly?",
      a: "A report that omits empty buckets lies by omission — and the cross-border lane's spotless 0.0% refusal share is a row that must PRINT, not vanish. Three tools: LEFT JOIN from the market dimension and COALESCE the counts to 0; run the conditional-count fold so every bucket's row exists with zeros in the empty arms (the one-pass census pattern — SUM(CASE WHEN status = 'cancelled' …) prints 0 for LATAM, not a missing row); or UNION ALL literal zero-buckets onto the observed groups. What not to do: filter first and let GROUP BY decide what survives. And when the zero DOES print, caveat it — a 0% refusal share on 2 orders is not evidence the lane refuses nothing.",
      tag: "groupby",
    },
    {
      id: "noon-t12",
      q: "Categories above the mean shelf revenue — derived table, correlated subquery or window function. Which, and what does each actually answer?",
      a: "All three answer it differently. The correlated form — revenue > the average of MY market's shelf — re-runs per outer row and answers 'above my market's mean', a KSA story, not a network story. The derived-table form stages per-category revenue once (seven categories on this catalog, mean 4976.18) and filters against it — the set-based workhorse. The window form — AVG(revenue) OVER () — carries the global mean on every row without collapsing grain, staged in a CTE because WHERE runs before windows. Name the population: above the NETWORK mean keeps exactly Audio (11744.01), Wearables (6929.12) and Video (5198.41) — three of seven — and the follow-up is always whether the memo meant network or per-market.",
      tag: "subqueries",
    },
    {
      id: "noon-t13",
      q: "You suspect duplicate settlement legs. Why does the pair-hunting self-join need a.id < b.id, and what legitimate shape must it not drown in?",
      a: "A self-join on the business key pairs every row with itself — a.amount = b.amount is true when a IS b — and the unordered join emits both (a,b) and (b,a), double-counting every genuine pair. a.id < b.id fixes both failure modes at once: no self-pairs, one canonical orientation per pair. On this book the legitimate multi-leg shape is real: five statements settle across two rails by design, so the screen hunts ILLEGITIMATE pairs — same statement, same amount, same rail, days apart — without flagging the sanctioned splits. The strong answer names both exclusions (self-pairing and mirror-pairing) and says what the survivors get investigated as.",
      tag: "joins",
    },
    {
      id: "noon-t14",
      q: "The staging dunning draft uses NOT IN (SELECT invoice_id FROM payments) and returns zero rows. What replaced it, and why?",
      a: "NOT IN is UNKNOWN-poisoned the moment the subquery yields a NULL: every outer comparison becomes UNKNOWN and the draft empties while looking valid — six statements worth 15217.00 silently slip the chase. The habit is NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — an existence probe that short-circuits on the first match and never trips on NULLs. On the clean core db both return the same six statements; in staging, where NULLs are a WHEN not an IF, only one of them is trustworthy. Say the trade out loud: NOT IN reads nicely for small static lists; for correlated existence tests against columns that can carry NULLs, NOT EXISTS is the defensible shape — and it is the shape the dunning list ships as.",
      tag: "nulls",
    },
    {
      id: "noon-t15",
      q: "The dispatch clock: julianday diffs, NULL stamps, and the population discipline that keeps the 2.98 honest. Walk me through it.",
      a: "JULIANDAY(shipped_at) − JULIANDAY(created_at) is fractional days by contract — the 2.98-day booking-to-dispatch average over the 82 stamped orders is exactly that, rounded once at display, never per row. The stamps are NULL until the courier takes the parcel, so the population is WHERE shipped_at IS NOT NULL, stated in the report even though AVG's NULL-skip would print the same number — an unnamed 82-row population is exactly the silent-shrink failure. The 21 unstamped rows (14 awaiting fulfillment, 7 refused) are a population definition, not a cleanup job, and IFNULL-ing them to zero invents same-day dispatches for parcels still in the dark store. Range and average ship together: 2 to 4 days, 2.93 UAE bucket to 3.5 cross-border.",
      tag: "dates",
    },
    {
      id: "noon-t16",
      q: "The catalog arrives with 'acme corp', 'Acme Corp' and 'ACME CORP' — and Arabic titles whose UTF-8 casing behaves differently. What breaks, and what is the hygiene pass?",
      a: "The GROUP BY fold sees three listings where the catalog has one — every per-SKU census, bestseller board and stock read doubles or splits silently, and no error ever fires. The hygiene pass runs before the join and fold keys are built: TRIM the padding, UPPER/LOWER to one canonical case (ASCII-safe; UPPER is a no-op on most Arabic letters, which is exactly why the canonical key is the listing id, not the title), and strip suffix noise with REPLACE where the feed carries it. Normalize once into a clean dimension and join on the canonical key so the fix lives in one place. The interview point: string hygiene is join-key integrity — the discipline that keeps an Arabic-first catalog with English seller names from reading as twice its size.",
      tag: "strings",
    },
    {
      id: "noon-t17",
      q: "NTILE, PERCENT_RANK and the VIP tier cut — how do you tier the shopper book defensibly?",
      a: "NTILE(4) OVER (ORDER BY total_spend) distributes 103 orders as evenly as possible: 26, 26, 26, 25 — the earlier buckets absorb the remainder, and the fattest basket (1,088.44) lands in quartile 4 alongside everything from 507.24 up. PERCENT_RANK gives each shopper a 0-to-1 position, the right tool when tier edges must survive a row-count change — a quartile of a 16-shopper book and of a million-shopper book are different animals. The traps: assuming NTILE splits evenly (16 divides by 4 here, but the next order count will not), and quoting a 'top-quartile cutoff' without stating the ORDER BY and tie policy — ties at a bucket edge land deterministically only when the sort is fully specified. VIP eligibility is a published edge list, not a mood.",
      tag: "windows",
    },
    {
      id: "noon-t18",
      q: "The morning census must count all four order stages in one pass and reconcile to 103 by construction. How?",
      a: "One scan, four conditional arms: COUNT(*) FILTER (WHERE status = 'delivered') — or its pre-3.30 twin SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — for delivered clean (52), out with the courier (30), awaiting fulfillment (14) and COD-refused/aborted (7), beside COUNT(*) for placed (103). The reconciliation IS the deliverable: 52+30+14+7 = 103, and a branch that fails the identity is the day's first incident, not a rounding note. Four sequential queries can each be individually right and still disagree — different run times, different WHERE drift; one pass cannot. Know FILTER and its SUM(CASE) twin, because the analytics fleet runs both engines and the census must reconcile on either.",
      tag: "aggregation",
    },
    {
      id: "noon-t19",
      q: "'Each shopper's favorite listing' — what is wrong with ORDER BY units DESC LIMIT 1 per shopper, and what is the defensible shape?",
      a: "LIMIT 1 resolves ties by whatever order the plan stumbles into — two runs, two winners, no error — and ties are guaranteed at catalog scale: two months tie at 9 orders on this book, and shoppers repeat listings all the time. The defensible argmax is ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY units DESC, last_order_date, product_id) = 1: the partition scopes the competition, the ORDER BY names the primary rule, and the trailing tie-breakers make the winner reproducible. The policy is reviewable — swapping recency for revenue changes a business decision, which is exactly why it lives in the SQL where the next analyst can read it. Argmax is a decision; decisions need tie policies.",
      tag: "windows",
    },
    {
      id: "noon-t20",
      q: "The ops dashboard filters orders with SUBSTR(created_at, 1, 7) = '2024-11' for the Yellow Friday fold and the index on created_at never engages. Diagnose and fix.",
      a: "Sargability: an index serves a predicate on the bare column, not on f(column) — wrapping created_at in SUBSTR hides it from the planner and forces a scan of every order row, exactly when the fold can least afford it. The fix keeps the column bare and moves the function to the constant side: created_at >= '2024-11-01' AND created_at < '2024-12-01' — a half-open range that also keeps November's biggest evening, which BETWEEN's bare-date upper bound silently drops. EXPLAIN QUERY PLAN is the receipt: SCAN before, SEARCH … USING INDEX after. On 103 orders you will never feel it; at marketplace scale the scan IS the Yellow Friday outage, and the postmortem asks for the plan, not the result.",
      tag: "indexes",
    },
    {
      id: "noon-t21",
      q: "Why does every production ORDER BY in this kit end with a unique key, and what goes wrong without it?",
      a: "Reproducibility is the deliverable: a market review, a dunning draft or a VIP list must be byte-identical between the analyst's run and the reviewer's. ORDER BY on a non-unique key — market, order count, even status — leaves tie blocks to the planner's mood: two runs, two row orders, and the diff review reads a phantom change. The house shape is ORDER BY primary metric, then created_at, then id — the trailing unique key costs nothing and makes every run identical. The same discipline underpins OFFSET pagination in the app feeds, whose page boundaries drift unless the sort is fully deterministic. 'It looked right once' is not an ordering; determinism is a property you build into the query, not observe in one run.",
      tag: "quality",
    },
    {
      id: "noon-t22",
      q: "The dunning draft's settled column prints NULL for the zero-leg statements even though the fold is SUM(p.amount_cents). Where does the COALESCE go, and why there?",
      a: "SUM ignores NULL inputs, and a group with no non-NULL input has no sum — SQL returns NULL, not 0 — so the six zero-leg statements print NULL and the dunning team reads 'unknown', not 'zero collected'. The guard wraps the FOLD, not the rows: COALESCE(SUM(p.amount_cents), 0). Per-row IFNULL(p.amount_cents, 0) happens to work on this draft because every leg row is NULL — but it survives only that shape; a partially populated statement (the 4000-of-6148 partial has one real leg) is where the fold-level wrap proves it is the guard and the row-level sprinkle is decoration. Guard the fold, then the display: that ordering keeps the 15217.00 exposure footing intact.",
      tag: "nulls",
    },
    {
      id: "noon-t23",
      q: "Walk me through the month-end close ritual on this marketplace — what reconciles before anything ships?",
      a: "Four proofs, in order. The status census: 52 delivered + 30 shipped + 14 pending + 7 refused = 103 by construction — a failed branch is an incident. The rail cross-foot: card 16 legs / 37364.00 plus wire 11 / 32248.00 = 27 legs / 69612.00 against the cash book (44,196 cash, 16,440 AR on this close), with the five split-plan statements and the two status anomalies (#28 paid with zero legs, #11 void with one) walked line by line. The AR coverage: 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — the dunning denominator on the slide. And the GL: 181080.00 debits against 181080.00 credits, delta 0 — a nonzero delta pages the close. Every number ships with its population, because a coverage figure without its denominator is a rumor.",
      tag: "quality",
    },
    {
      id: "noon-t24",
      q: "The refusal share moved from 6.7% to 8.1% overnight. Before anyone reacts, what do you check?",
      a: "The definition first. Is the denominator PLACED orders in the bucket — the house rule, because only placed orders can be refused — or did someone quietly switch it to delivered, or to the network-wide base? KSA reads 6.7 (3 of 45) and the UAE bucket 8.1 (3 of 37): a 'move' can be a population switch, not a COD crisis. Then the edges: did the month window go half-open to closed so a re-ingested Yellow Friday batch double-counts, and did the status vocabulary drift — a new 'aborted' label landing outside the cancelled arm. Definitions are versioned like code here: the analyst answers by pointing at the definition, not by re-running the query. State the population and the denominator before computing anything — that is the habit the panel grades.",
      tag: "pipeline",
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
    {
      id: "noon-mcq-11",
      prompt: "Orders join to order_items for the market census and the row count fans out from 103 to 251. Which expression still reports 16 — the shopper count?",
      choices: ["COUNT(*)", "COUNT(customer_id)", "COUNT(DISTINCT customer_id)", "SUM(customer_id)"],
      answer: 2,
      why: "DISTINCT folds the fan-out back to people: 251 order lines collapse to 16 shoppers. COUNT(*) and COUNT(customer_id) both read 251 — the line grain, not the shopper grain — and SUM adds ids, a number with no business meaning.",
      notes: [
        { choice: 0, why: "COUNT(*) counts the joined rows — 251 lines. The join didn't create shoppers; it created lines, and the census must say which grain it reports." },
        { choice: 1, why: "COUNT(customer_id) skips NULLs but counts repeats — every line carries a customer_id, so it reads 251 too. Without DISTINCT both counts are line-grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-12",
      prompt: "The app's 'five most recent orders' rail ships `SELECT id, total FROM orders LIMIT 5`. What is wrong?",
      choices: ["Nothing — LIMIT 5 returns the newest rows", "It returns an arbitrary five rows — without ORDER BY, LIMIT promises no particular rows", "It needs GROUP BY to work over dates", "LIMIT 5 is invalid — LIMIT needs an OFFSET"],
      answer: 1,
      why: "LIMIT caps the count; it does not sort. Without ORDER BY created_at DESC the engine hands back whatever rows the plan touches first — 'most recent' is a claim the query never made. The fix is one phrase: ORDER BY created_at DESC before the LIMIT.",
      notes: [
        { choice: 0, why: "The belief ships broken recency rails every week. Newest only if the ORDER BY says so — LIMIT is a ceiling, not a sort." },
        { choice: 3, why: "LIMIT stands alone fine; OFFSET is optional. The missing piece is ordering, not syntax." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-13",
      prompt: "Merchandising wants each seller's live listing roster inside one cell: `GROUP_CONCAT(p.name)`. A seller lists three products. What comes back?",
      choices: ["The first product's name only", "Three rows, one per product", "One comma-joined string of all three names, in scan order", "A count of 3"],
      answer: 2,
      why: "GROUP_CONCAT folds every value in the group into one string cell — one row per seller with the roster inside. The order within the string is scan order, not guaranteed, which is the caveat the report footnotes.",
      notes: [
        { choice: 0, why: "That would be MAX or an arbitrary pick — GROUP_CONCAT carries the WHOLE group. A manifest missing two listings understates the seller's shelf." },
        { choice: 3, why: "COUNT returns the 3 — a number, not the names. The whole point of the fold is evidence-per-row: the roster rides with the seller without a second query." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-14",
      prompt: "`SELECT DISTINCT category FROM products` runs on this catalog. What returns?",
      choices: ["16 rows — one per product", "7 rows — Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables", "6 rows — one per seller", "1 row — 'Electronics'"],
      answer: 1,
      why: "DISTINCT collapses the 16 listings to their unique values: the seven verticals the merchandising board reads. 16 would be the raw product count, 6 the seller count — different grains entirely.",
      notes: [
        { choice: 0, why: "That's the table without DISTINCT. The whole point of DISTINCT is the fold back to vocabulary — and this catalog's category vocabulary is seven long." },
        { choice: 2, why: "6 is COUNT(DISTINCT supplier_id) — the seller grain. DISTINCT category folds on the category column, not the seller." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-15",
      prompt: "A trend read buckets orders with `STRFTIME('%m', created_at)` and prints 12 buckets for a book spanning 2024-01 to 2025-02. Diagnosis?",
      choices: ["The book really has 12 active months", "'%m' carries month-only keys — January 2024 and January 2025 merge into one bucket and the trend is fiction", "STRFTIME needs a GROUP BY to work", "The fix is COUNT(DISTINCT month)"],
      answer: 1,
      why: "'%m' emits '01'…'12' with no year, so the two Januaries fold into one bucket and the 14-month spine becomes a 12-bucket fiction. The spine is '%Y-%m' — 14 buckets on this book — or SUBSTR(created_at, 1, 7) on fixed-width ISO text.",
      notes: [
        { choice: 0, why: "14 months of orders is a probed fact; a 12-bucket output means two months share a key. A bucket count matching the calendar instead of the data is the collision telling on itself." },
        { choice: 3, why: "COUNT(DISTINCT month) counts the buckets, it doesn't fix the keys. The bug is the format string, not the aggregation." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-16",
      prompt: "The rail audit wants settlement statements paid on BOTH rails. Which query returns them — and how many statements is that on this book?",
      choices: [
        "card-statements UNION wire-statements — 27",
        "card-statements INTERSECT wire-statements — 5",
        "card-statements EXCEPT wire-statements — 11",
        "card-statements JOIN wire-statements ON method — 0",
      ],
      answer: 1,
      why: "INTERSECT is shared membership: statements appearing in both the card-rail set and the wire-rail set — the five split-settled statements (1, 5, 12, 19, 22), each carrying one leg per rail. UNION merges the sets, EXCEPT subtracts, and the join-on-method matches nothing — rails never equal each other.",
      notes: [
        { choice: 0, why: "UNION answers 'either rail' — the union of the two sets, not the overlap. The split-plan question is exactly the intersection." },
        { choice: 2, why: "EXCEPT answers 'card-rail only' — the complement of the split plans. Direction matters: swapping the arms flips the audit to wire-only." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-17",
      prompt: "A quiet-market read runs `SELECT month FROM booked_months EXCEPT SELECT month FROM refusal_months`. What comes back, and what shape rule do the arms obey?",
      choices: [
        "Months in both sets; shapes may differ — the engine pads with NULLs",
        "Months that booked volume but logged no refusal; both arms must match in column count and type family or the query errors",
        "All months from both sets; shapes must match exactly",
        "Nothing — EXCEPT requires a JOIN",
      ],
      answer: 1,
      why: "EXCEPT is set subtraction — the months the growth board can promise without refusal risk. Set operators demand matching shapes (same column count, compatible types); SQLite rejects mismatches at prepare rather than padding. And as sets they collapse duplicates — these are sets, not bags.",
      notes: [
        { choice: 0, why: "That's INTERSECT's answer with fantasy padding. No set operator pads — the shape mismatch is a hard error, which is the friendly failure mode." },
        { choice: 2, why: "That's UNION. Flipping EXCEPT to UNION turns the quiet-market read into an inventory of every month — a different report wearing the same title." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-18",
      prompt: "The dunning draft's settled column prints NULL for the six zero-leg statements even though the fold is `SUM(p.amount_cents)`. Why, and the fix?",
      choices: [
        "NULL legs count as 0 automatically — the NULL signals a bug elsewhere",
        "SUM over an all-NULL (or empty) group returns NULL — wrap the fold: COALESCE(SUM(p.amount_cents), 0)",
        "The display layer's /100.0 NULLs the column",
        "IFNULL(p.amount_cents, 0) on the raw column fixes the aggregate",
      ],
      answer: 1,
      why: "SUM ignores NULL inputs, and a group with no non-NULL input has no sum — SQL returns NULL, not 0. The fix wraps the FOLD, not the rows: COALESCE(SUM(...), 0) prints the honest 0 the six-statement draft foots with. (Per-row IFNULL happens to work here — every leg row is NULL — but the fold-level wrap is the guard that survives partially populated statements too.)",
      notes: [
        { choice: 0, why: "NULL is not zero in aggregates — it's absence. A draft whose settled column reads NULL reads as 'unknown', and the dunning team reads missing data, not zero collected." },
        { choice: 2, why: "The /100.0 division promotes arithmetic type; it doesn't create NULLs. NULL in, NULL out — the guard belongs at the fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-19",
      prompt: "The Yellow Friday fold filters orders with `SUBSTR(created_at, 1, 7) = '2024-11'` and the index on created_at never engages. Why, and the fix?",
      choices: [
        "SUBSTR returns text the index can't store — switch to date types",
        "The predicate wraps the indexed column in a function, hiding it from the planner — rewrite as a half-open range: created_at >= '2024-11-01' AND created_at < '2024-12-01'",
        "The index needs a REBUILD after the month's loads",
        "Text comparisons never use indexes",
      ],
      answer: 1,
      why: "Sargability: an index serves a predicate on the bare column, not f(column). Wrapping created_at in SUBSTR forces a scan of every order row during the fold. The range rewrite keeps the column bare — and it's half-open, so November's biggest evening survives the filter.",
      notes: [
        { choice: 0, why: "SUBSTR is deterministic on text; the problem is WHERE it sits. Move the function to the constant side and the index works again." },
        { choice: 2, why: "Rebuilds fix bloat, not predicate shapes. On 103 orders you'll never feel it — at marketplace scale the scan is the Yellow Friday outage." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-20",
      prompt: "A rolling read computes `AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. Several orders share the same created_at evening. What changes if ROWS becomes RANGE?",
      choices: [
        "Nothing — ROWS and RANGE are synonyms here",
        "RANGE sweeps in EVERY order sharing those timestamps, not just 2 rows — the window's row count jumps on same-day ties",
        "RANGE reverses the order of the frame",
        "RANGE only works on numeric columns",
      ],
      answer: 1,
      why: "ROWS counts physical rows — exactly 3 in this frame. RANGE counts peers by the ORDER BY value: on an evening with five orders, RANGE sweeps them all in. Same-day ties are guaranteed on a 103-order book — 45 KSA orders across 14 months — so the two frames genuinely disagree here.",
      notes: [
        { choice: 0, why: "Synonyms only while the ORDER BY key is unique. Same-day orders break uniqueness — the exact condition this book guarantees." },
        { choice: 2, why: "Neither frame reverses anything — direction lives in the ORDER BY. The ROWS/RANGE axis is 'which rows count as neighbors', not 'which way the window faces'." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-21",
      prompt: "A trend board writes `SELECT month, LAG(revenue) OVER (ORDER BY month) AS prev FROM ... WHERE prev IS NOT NULL`. What happens?",
      choices: [
        "It returns only months that have a predecessor",
        "It errors — window results are computed after WHERE, so the alias is invisible ('misuse of aliased window function')",
        "It silently treats prev as 0 for the first month",
        "It returns every row but with prev NULL everywhere",
      ],
      answer: 1,
      why: "WHERE runs before the window is evaluated — the LAG output doesn't exist when the filter applies, and SQLite says so: 'misuse of aliased window function'. The fix is staging: fold and walk in a CTE, filter in the outer query — the two-step every month-over-month board in this kit uses.",
      notes: [
        { choice: 0, why: "That's the intended semantics, but the engine refuses to deliver it through WHERE. Row-filtering happens before windowing, by contract — the pipeline order IS the error message." },
        { choice: 2, why: "No silent coercion exists — the reference is rejected outright. The error is the friendly version; shipping it silently would be worse." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-22",
      prompt: "VIP banding runs standard / vip / vip-plus with edges at 1,000 and 3,000 lifetime spend. A teammate reorders the CASE arms — WHEN spend >= 1000 first. What happens to a 4,500 shopper?",
      choices: [
        "It stays vip-plus — CASE arms are independent",
        "It falls into whichever arm matches FIRST — the reordered arms mis-band the whole book",
        "The query errors on overlapping ranges",
        "It drops out of every band",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and takes the first match — overlapping edges make arm ORDER part of the business rule. A 4,500 spend hits '>= 1000' immediately and lands in the vip label, silently re-banding every vip-plus shopper. Published edges need ordered, non-overlapping arms (or descending edges with < guards).",
      notes: [
        { choice: 0, why: "Arms are not independent — first match wins and evaluation stops. Overlap plus reordering is how a VIP list quietly changes with zero errors." },
        { choice: 2, why: "Overlapping ranges are legal SQL; the engine never checks band logic. The damage is silent by construction — which is why the arms cite the published edge list in a comment." },
      ],
      difficulty: "medium",
    },
    {
      id: "noon-mcq-23",
      prompt: "The monthly leaderboard claims 'the biggest order month' with `ORDER BY month_orders DESC LIMIT 1`. On this book, what is the defect?",
      choices: [
        "None — LIMIT 1 is the definition of argmax",
        "February 2024 and September 2024 tie at 9 orders, and LIMIT 1 breaks the tie arbitrarily and silently — the defensible read names its tie-break (created_at, then month key)",
        "Argmax requires a correlated subquery",
        "The tie makes the query non-deterministic but harmless",
      ],
      answer: 1,
      why: "The tie is real — two 9-order months on this spine — and LIMIT 1 resolves it by whatever order the plan stumbles into: two runs, two 'peak months', no error. The defensible shape is ROW_NUMBER() OVER (ORDER BY month_orders DESC, month ASC) = 1 with the tie-break stated, so the winner is reproducible and the tie policy is reviewable.",
      notes: [
        { choice: 0, why: "Argmax is a decision, not a row count — and decisions need tie policies. LIMIT 1 delegates the policy to the query planner's mood." },
        { choice: 3, why: "Non-determinism in a marketplace's board pack is never harmless — the growth narrative names a peak month, and a flippy answer costs the argument." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-24",
      prompt: "The ingest feed double-delivers rows. Which expression keeps exactly the freshest order per shopper?",
      choices: [
        "RANK() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) = 1",
        "MAX(created_at) GROUP BY customer_id",
        "SELECT DISTINCT customer_id FROM orders",
      ],
      answer: 1,
      why: "ROW_NUMBER assigns a strict 1..n inside each shopper with a fully-specified order — created_at DESC, id DESC breaks same-timestamp ties deterministically — so rn = 1 is exactly one row per shopper. RANK would keep EVERY row tied on the newest timestamp, re-admitting the duplicates it exists to remove.",
      notes: [
        { choice: 0, why: "RANK shares rank 1 among all ties — two same-timestamp orders both survive. The dedupe needs strict numbering, which is ROW_NUMBER's contract." },
        { choice: 2, why: "MAX finds the newest timestamp but the query still returns every row carrying it — the filter needs HAVING or a join back, and the tie policy is still unnamed." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-25",
      prompt: "The audit hunts duplicate settlement legs: same statement, same amount, same rail, days apart. The shape self-joins payments a to payments b. Why does it need `a.id < b.id`?",
      choices: [
        "To sort the pairs by id",
        "Without it every row pairs with itself, and each true pair appears twice — once as (a,b), once as (b,a)",
        "Because ids are never equal across statements",
        "It doesn't — the amount equality already excludes self-pairs",
      ],
      answer: 1,
      why: "a.amount = b.amount is true when a IS b — every row pairs with itself. And the unordered join emits both (a,b) and (b,a), double-counting every genuine pair. a.id < b.id fixes both at once: no self-pairs, one canonical orientation per pair. On this book the five dual-rail statements are the legitimate multi-leg shape — the screen is about hunting ILLEGITIMATE pairs without drowning in legitimate ones.",
      notes: [
        { choice: 0, why: "Sorting is ORDER BY's job. The inequality is about which pairs exist, not their presentation." },
        { choice: 3, why: "Amount equality is TRUE for a row against itself — self-pairing is the default, not the exception. The inequality is the fix, not decoration." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-26",
      prompt: "`NTILE(4) OVER (ORDER BY total)` buckets the 103-order book. How do the quartiles split, and where does the 1,088.44 basket land?",
      choices: [
        "26 / 26 / 26 / 25 — the biggest basket sits in quartile 4 (507.24–1,088.44)",
        "25 / 26 / 26 / 26 — remainder goes to the last bucket",
        "34 / 34 / 35 — NTILE(4) merges small buckets",
        "26 / 26 / 26 / 26 — NTILE always splits evenly",
      ],
      answer: 0,
      why: "NTILE distributes as evenly as possible: 103 = 3 × 26 + 25, and the earlier buckets absorb the remainder — 26, 26, 26, 25. The 1,088.44 maximum is the last row of the ORDER BY, so it lands in quartile 4 alongside everything from 507.24 up.",
      notes: [
        { choice: 1, why: "Backwards — NTILE fills front-to-back with the larger counts first, so the tail bucket is the short one. Getting the remainder direction wrong skews every 'top-quartile' cutoff." },
        { choice: 3, why: "103 doesn't divide by 4. NTILE never drops rows to force even buckets — it spreads the remainder across the earliest groups." },
      ],
      difficulty: "hard",
    },
    {
      id: "noon-mcq-27",
      prompt: "Statuses run 52 / 30 / 14 / 7 over 103 orders. Which expression does NOT return the 7 refusals?",
      choices: [
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)",
        "COUNT(*) FILTER (WHERE status = 'cancelled')",
        "COUNT(status = 'cancelled')",
        "AVG(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * COUNT(*)",
      ],
      answer: 2,
      why: "SQLite evaluates status = 'cancelled' to 0/1 per row — and COUNT counts NON-NULL values, so all 103 rows count: it returns 103, not 7. SUM over the flag, the FILTER clause and the AVG-times-COUNT identity all isolate the 1s correctly.",
      notes: [
        { choice: 0, why: "SUM over the 1/0 indicator IS the refusal count — the portable conditional-count idiom, and the pre-3.30 replacement for FILTER." },
        { choice: 1, why: "FILTER (WHERE …) is one-pass conditional counting — 7 here, computed in the same scan as its sibling aggregates; the censuses reconcile to 103 by construction." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-28",
      prompt: "In the one-pass status grid, the cross-border lane's refused arm holds zero orders. What does `SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)` print for that bucket?",
      choices: ["NULL", "0", "The row is omitted entirely", "It errors on the empty arm"],
      answer: 1,
      why: "The CASE zeroes every non-matching row and SUM adds the flags — zero orders refused sums to 0, and the cross-border row still appears with its 2 delivered and zeros elsewhere. The zero is the grid's honesty: a two-order lane is IN the read, not vanished from it.",
      notes: [
        { choice: 0, why: "SUM over flags never returns NULL while the group has rows — the ELSE 0 arm guarantees a number. NULL would mean the group itself had no rows." },
        { choice: 2, why: "GROUP BY keeps every group the input produces — the lane has 2 orders, so its row survives with zeros in the empty arms. Omitting the quiet lane lies by omission." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-29",
      prompt: "Bucket AOVs read KSA 335.32, UAE 313.66, Egypt 383.48, cross-border 426.22 — their unweighted average is 364.67, but the network AOV is 338.19. Why?",
      choices: [
        "Rounding drift across four decimals",
        "The average-of-averages weights every bucket equally; the network AOV weights every order — 45 KSA orders versus 2 cross-border ones",
        "The bucket averages should have been DISTINCT",
        "One of the four bucket numbers is wrong",
      ],
      answer: 1,
      why: "A mean of means is the true mean only when every group weighs the same. KSA carries 45 orders, the cross-border lane 2 — the unweighted 364.67 lets a 2-order lane speak as loudly as a 45-order one. The network average folds all 103 orders once: 338.19.",
      notes: [
        { choice: 0, why: "The gap is 26.48 — no rounding artifact. It's a weighting bug, fixed by computing at the order grain, not by averaging bucket cells." },
        { choice: 3, why: "Every bucket number is probe-honest. The composite is what lies — which is why the review asks 'average of WHAT?' before quoting any mean." },
      ],
      difficulty: "easy",
    },
    {
      id: "noon-mcq-30",
      prompt: "The month pulse builds prev_orders with a window over the 14-bucket spine. A teammate reaches for LEAD instead of LAG. What does February's prev column show?",
      choices: [
        "January's count — LAG and LEAD are synonyms on an ordered spine",
        "March's count — LEAD reads forward, so the 'previous' column silently relabels the future as history",
        "NULL — LEAD returns NULL on interior rows",
        "The running total of all prior months",
      ],
      answer: 1,
      why: "LEAD walks the window forward one row: February's prev becomes March's count, and every month-over-month percentage divides March by February while wearing January's label. The first month's LAG is honestly NULL — no baseline exists — and LAG is the function that says so; LEAD never produces that first-row NULL because it always has a next row.",
      notes: [
        { choice: 0, why: "They are opposites by contract — one reads backward, one forward. A spine built with LEAD produces numbers that look plausible for 13 of 14 rows, which is what makes it dangerous." },
        { choice: 2, why: "LEAD returns NULL on the LAST row, not the interior. The baseline row you lose with LEAD is the wrong end of the spine." },
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
    {
      id: "cs-noon-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The VIP ladder",
      brief:
        "Growth-board brief on the storefront db, noon-flavored: the loyalty pod ranks the shopper book for {sky:noon VIP} eligibility, and the published policy is that peer shoppers SHARE a rung with no gaps — DENSE_RANK, not RANK, because a skipped rung implies shoppers who do not exist. Probed facts: 103 orders across 16 shoppers; the repeat-purchase ladder runs 24 / 17 / 14 / 13 / 5 (Alice Chen 24 orders for 7262.35 lifetime, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5), then FOUR shoppers tied at 4 (Pedro Alvarez 1686.17, Keiko Sato 1098.60, Isabella Rossi 985.65, Noah Meyer 737.68), then two tied at 3. The floor deliberately keeps the pair of 3-order shoppers in the output — the gap-versus-no-gap difference only becomes visible with the rows behind the tie present.",
      ask: "Return every shopper with at least 3 orders — name, order count, lifetime spend and a no-gap VIP rank — busiest first.",
      template:
        "SELECT c.name AS shopper,\n       COUNT(*) AS orders,\n       ROUND(SUM(o.total), 2) AS lifetime_spend,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS vip_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY vip_rank;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK shares rungs without gaps: ranks 1–5, then the four-way tie reads 6, 6, 6, 6, and the two 3-order shoppers land on 7 — the published VIP policy. RANK would stamp the pair 10 and 10, implying five phantom shoppers between the tie and the tail; ROW_NUMBER would split the four-way tie arbitrarily, silently deciding which shopper's cohort gets credited first.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "VIP rank 1 is the MOST orders, so the window ORDER BY runs descending — Alice Chen's 24 takes rank 1. ASC would crown the two 3-order shoppers as rank 1 and hand the anchor shopper the bottom rung: a correct-looking query answering the opposite question, with the VIP list inverted.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps all 11 shoppers from 24 down through the two 3s — the rows where RANK's gap (…6, 6, 6, 6, then 10) diverges from DENSE_RANK's no-gap tail (…then 7). A floor of 4 drops exactly the rows that expose the difference and the policy debate disappears from the output.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census, a floor, and a tie policy. The join attaches each order to its shopper and GROUP BY c.id folds 103 orders into 16 shoppers; COUNT(*) is the ladder metric; HAVING COUNT(*) >= 3 keeps eleven rows — 24, 17, 14, 13, 5, the four-way tie at 4, and the two 3s. The window ranks the folded counts with DENSE_RANK OVER (ORDER BY COUNT(*) DESC): ranks 1 through 5, the tie block reading 6, 6, 6, 6 (Pedro Alvarez 1686.17, Keiko Sato 1098.60, Isabella Rossi 985.65, Noah Meyer 737.68 — the ladder does not care about their lifetime spend, only the order count), then 7, 7 for Farid Nasser and Hiro Tanaka at 3. That is the policy: peers share a rung and no rank is skipped, because the VIP mailing must not invent five shoppers who do not exist. RANK would hand the tail 10 and 10 — a gap with nothing in it, and the same shoppers feed retention cohorts and courier-slot priorities downstream, so a phantom gap becomes 'missing shoppers' in the next deck. ROW_NUMBER would number the tied four 6 through 9 — a silent judgment about who joined VIP first. Flip the window direction to ASC and the 3-order shoppers take rank 1. When the tie-break matters (it does for the mailing), it is a named second sort key — lifetime spend, then shopper id — written into the query, not left to the planner.",
    },
    {
      id: "cs-noon-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The seller concentration read",
      brief:
        "Seller-ops brief on the storefront db: noon's GMV concentrates fast — the marketplace read asks which sellers carry the book and by how much, because one lost seller moves a quarter. Probed facts: 6 sellers; Nordic Gadgets AB books 11130.25 over 38 orders / 43 lines, Midwest Hardware Co 9294.93 over 45 / 56, Alpine Audio GmbH 4765.63, Andes Naturals SA 3613.25, Shenzhen Electro 3049.07, Pacific Textiles 2980.15. The top two carry 20425.18 of the 34833.28 book — 58.6% of GMV behind just two storefront names. The join chain runs suppliers → products → order_items → orders, and the revenue fold is line-item value (unit_price × quantity), with the leaderboard cut at three sellers.",
      ask: "Return the top three sellers by line-item revenue — seller name, distinct order count, line count, and revenue to 2 decimals.",
      template:
        "SELECT s.name AS seller,\n       COUNT(DISTINCT o.id) AS orders,\n       COUNT(oi.id) AS lines,\n       ROUND({1}(oi.unit_price * oi.quantity), 2) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY s.id, s.name\nORDER BY revenue {2}\nLIMIT {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the revenue folder",
          why: "SUM(unit_price * quantity) folds line-item value into seller revenue — Nordic's 11130.25. COUNT would print the 43-line count wearing a revenue name, MAX the single biggest line, AVG the mean line value — each a different number the concentration read cannot use.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The concentration read opens on the biggest book: Nordic 11130.25, Midwest 9294.93, Alpine 4765.63. ASC would surface Pacific Textiles (2980.15) first and the 'top three' cut would keep the smallest sellers — a correct query aimed at the wrong end of the leaderboard.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the leaderboard cut",
          noVerify: true,
          why: "LIMIT 3 keeps exactly the crown trio — the sellers the seller-ops pod manages weekly. The figure 3 is also the count of sellers above 4,000 in revenue, so the cut and the concentration story agree: everything below is sub-5,000 tail.",
        },
      ],
      distractors: ["COUNT", "MAX", "ASC", "1", "6", "2"],
      walkthrough:
        "A four-table chain with a two-grain read. The join chain stitches sellers to listings to order lines to orders — every line matches, so the fold is INNER all the way — and GROUP BY s.id collapses each seller's lines into one row. The two counts tell different stories: COUNT(DISTINCT o.id) folds repeat orders back to distinct baskets (Midwest rides 45 distinct orders, Nordic 38), COUNT(oi.id) counts lines (56 versus 43) — basket depth per seller, the marketplace's attach story. The money fold is SUM(unit_price × quantity): Nordic 11130.25, Midwest 9294.93 — together 20425.18, 58.6% of the 34833.28 book, which is the concentration number the ops deck quotes. ORDER BY revenue DESC + LIMIT 3 performs the business cut; the sub-3,000 tail (Shenzhen Electro 3049.07, Pacific Textiles 2980.15) waits in the bench read. The distractors each break differently: COUNT reports line counts as revenue, MAX reports one basket as a book, ASC inverts the leaderboard, and a LIMIT of 1, 2 or 6 changes which sellers the pod manages this week.",
    },
    {
      id: "cs-noon-5",
      tier: "medium",
      topic: "q5",
      universe: "catalog",
      title: "The above-the-mean shelf",
      brief:
        "Merchandising brief on the storefront db: the category review asks which verticals actually carry the shelf — defined as categories whose line-item revenue clears the MEAN category revenue, not the median intuition and not 'top 3 by feel'. Probed facts: 7 categories; revenue reads Audio 11744.01, Wearables 6929.12, Video 5198.41, Electronics 4818.61, Accessories 3294.29, Apparel 1984.93, Fitness 863.91; the mean of those seven is 4976.18, and exactly three categories clear it — Audio, Wearables, Video. Audio alone carries 33.7% of the 34833.28 network book. The mean is computed from the same derived fold the outer query reads, so the definition is one query, not a spreadsheet side-car.",
      ask: "Return each category above the mean category revenue — category, revenue, and its share of network GMV to 1 decimal — biggest first.",
      template:
        "SELECT d.category,\n       d.revenue,\n       ROUND(100.0 * d.revenue / {1}, {3}) AS share_of_book\nFROM (\n  SELECT p.category AS category,\n         ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n) AS d\nWHERE d.revenue > (\n  SELECT AVG(revenue) FROM (\n    SELECT SUM(oi2.unit_price * oi2.quantity) AS revenue\n    FROM order_items oi2\n    JOIN products p2 ON p2.id = oi2.product_id\n    GROUP BY p2.category\n  ) AS means\n)\nORDER BY d.revenue {2};",
      slots: [
        {
          answer: "(SELECT SUM(total) FROM orders)",
          kind: "keyword",
          label: "the network denominator",
          why: "Share of book means revenue over NETWORK GMV — 34833.28, folded from orders.total. SUM(amount_cents) over expenses would divide by the opex ledger (2541600 cents) and print shares near zero; COUNT(*) over orders would divide by 103 and print 114.0 for Audio — both real queries, both the wrong book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review reads the shelf top-down: Audio 11744.01, Wearables 6929.12, Video 5198.41. ASC would open on Video and bury the Audio headline — the category that carries a third of the book — under the tail.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          noVerify: true,
          why: "Shares print to one decimal — 33.7 / 19.9 / 14.9 — matching the concentration read quoted in the deck. Zero decimals rounds Audio to 34 and the share stops reconciling with the 33.7% the merchandising slide cites; two decimals implies a precision the 103-order book cannot defend.",
        },
      ],
      distractors: ["(SELECT SUM(amount_cents) FROM expenses)", "(SELECT COUNT(*) FROM orders)", "0", "ASC", "2"],
      walkthrough:
        "Two folds, one definition. The inner derived table folds 251 order lines into seven category rows — Audio 11744.01 down to Fitness 863.91 — and the scalar subquery re-runs the same fold to average the seven: 4976.18, the mean category revenue. The outer WHERE keeps the three categories above it — Audio, Wearables, Video — and that threshold IS the definition: 'above the mean' is a computed bar, not a top-3 instinct, and on a different catalog it might keep four categories or one. The share column divides each survivor by the network GMV (a scalar subquery over orders.total): Audio 33.7%, Wearables 19.9%, Video 14.9% — the top three verticals carry 68.5% of the book, which is the concentration headline the review leads with. The distractors each break differently: the opex denominator prints sub-zero shares, the COUNT denominator inflates every share a hundredfold, 0 in the divisor NULLs the column outright, ASC buries the headline, and a two-decimal share overstates the book's precision. Staging the fold twice (detail and mean) is the derived-table pattern: define the grain once, reuse the definition — the query is its own audit trail.",
    },
    {
      id: "cs-noon-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The 14-month GMV spine walk",
      brief:
        "Growth-board brief on the storefront db: the review wants the monthly GMV pulse — each month's value, the prior month's beside it, and the percentage change — so the narrative writes itself from the table. Probed on the storefront db: 14 buckets from 2024-01 to 2025-02 over 103 orders; the book opens at 3731.97, slides to the {amber:1193.86 July trough} (-41.7%), rebounds +97.0% into August (2352.07), fades -44.6% into November (1648.80), and closes 2025-02 at 2390.53 (+43.2%). The spine key is '%Y-%m' — '%m' alone merges the two Januaries into a 12-bucket fiction. LAG carries the prior month; the first month's change is honestly NULL — no baseline exists.",
      ask: "Return all 14 months — month key, GMV to 2 decimals, the prior month's GMV, and the month-over-month percentage change to 1 decimal, chronological.",
      template:
        "WITH monthly AS (\n  SELECT {1} AS month,\n         ROUND(SUM(total), 2) AS gmv\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       gmv,\n       LAG(gmv) OVER (ORDER BY month) AS prev_gmv,\n       ROUND(100.0 * (gmv - LAG(gmv) OVER (ORDER BY month))\n             / LAG(gmv) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "STRFTIME('%Y-%m', created_at)",
          kind: "keyword",
          label: "the spine key",
          why: "The 14-bucket spine needs year AND month: '%Y-%m' yields 2024-01 through 2025-02. '%m' alone emits '01'…'12' with no year, so the two Januaries merge into one bucket and the trend becomes a 12-bucket fiction; bare created_at refuses to fold at all — 103 one-row buckets.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month read is chronological: ASC keeps 2024-01 on top so each row compares against the row above it, and LAG's first-row NULL lands on the spine's opening month where it belongs. DESC presents the newest month first with its baseline below — the numbers survive, the story reads backwards.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the full-spine cut",
          noVerify: true,
          why: "LIMIT 14 keeps the whole spine — the trough, the +97.0% rebound, the November fade and the +43.2% close all in one read. Cutting at 6 or 13 amputates exactly the rows the narrative quotes; the spine is the deliverable, not a sample of it.",
        },
      ],
      distractors: ["STRFTIME('%m', created_at)", "created_at", "DESC", "6", "13"],
      walkthrough:
        "Staged windows over a money spine. The CTE folds 103 orders into 14 monthly buckets via the '%Y-%m' key — '%m' alone would merge the two Januaries and the pulse would read a 12-bucket year, silently wrong in exactly the way a year-over-year review catches too late. The outer query walks the spine: LAG(gmv) OVER (ORDER BY month) brings each prior month's value into the current row, and the percentage divides the delta by that same LAG — 2024-07's 1193.86 against June's 2047.43 reads -41.7%, the trough row; August's 2352.07 reads +97.0%, the rebound; November's 1648.80 reads -44.6%, the fade the board interrogates; 2025-02 closes +43.2%. The first month is NULL by design: no prior row, no baseline, no invented zero. The two-step matters — window output isn't visible to WHERE or sibling expressions, so the CTE stages the grain and the outer SELECT layers the windows. The distractors each break differently: the '%m' key merges the years, bare created_at never folds, DESC tells the story backwards, and a 6- or 13-row cut amputates the rebound or the close. Every chip changes what the board would conclude.",
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
    { slug: "friday-purchases-i", why: "Friday-window demand folds — the Yellow Friday drill at practice scale: half-open sale windows, day-of-week demand and the fold that must not lose the biggest evening." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat-baskets-in-a-window — the noon Minutes frequency read: quick-commerce shoppers reorder in days, and the two-purchase habit is the cohort the dark stores are priced on." },
    { slug: "find-loyal-customers", why: "Loyalty qualification via 2+ orders — the noon VIP gate computed, not asserted; the same definition-first habit the ladder cases rehearse." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary segmentation over the order book — the CRM's segment map for VIP perks, COD nudges and winback pushes, all from three folds." },
    { slug: "usage-tier-percentiles", why: "Percentile tiering of shopper value — where the VIP threshold actually sits on the distribution, and why NTILE's remainder direction matters to who gets the perk." },
    { slug: "customer-purchasing-behavior-analysis", why: "Behavior splits across the verticals — supermarket vs fashion vs electronics baskets read off one join, the cross-vertical story merchandising tells monthly." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Attach-rate audits — phone plus case but never the screen protector: the accessory-attach read that prices noon's cross-sell cards." },
    { slug: "returns-rate-by-category", why: "Returned units over delivered, per category — fashion's profit leak as a two-grain ratio; the denominator (delivered, not placed) is the interview." },
    { slug: "same-day-sale", why: "Same-day fulfillment flags — the noon Minutes promise read: which orders cleared the same-day bar, a conditional count over timestamps." },
    { slug: "calculate-orders-within-each-interval", why: "Orders bucketed into delivery intervals — the slot-utilization read the last-mile teams in Dubai and Riyadh staff against." },
    { slug: "sessionize-events", why: "Gaps-and-islands over event times — sessionizing the app stream is the same islands math that turns bursty quick-commerce demand into countable windows." },
    { slug: "find-bursty-behavior", why: "Burst detection over timestamps — flash-sale drops and Yellow Friday surges arrive in waves; this is the window drill that separates a surge from noise." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness as an honest ratio — the digital-app adoption metric, with the 100.0-before-division and stated-denominator discipline built in." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives over the activity spine — the growth board's smoothed demand line, and the ROWS-frame drill that keeps same-day ties honest." },
    { slug: "second-day-confirmation", why: "Second-day confirmation reads — the COD confirmation-nudge experiment's core metric: who confirms the day after, computed from timestamps not vibes." },
    { slug: "find-golden-hour-customers", why: "Evening-window shoppers — Gulf golden-hour demand is a half-open timestamp window; the cohort read that decides when flash drops go live." },
  ],
};
