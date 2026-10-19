// Chipotle — Wave-8 (Task 96), food domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Kitchen-line SQL: the storefront db read as a restaurant ops sandbox — customers are
// rewards members, orders are tickets through the line (delivered = served & closed,
// shipped = staged on the pass / mobile-order shelf, pending = queued at the line,
// cancelled = 86'd), order_items are build lines (quantity = portions, unit_price = menu
// price), products = the 16-SKU menu matrix with stock as prep par. shipped_at is the
// pass stamp — 82 of 103 tickets carry it; the aging average reads 2.98 on this db's
// DAY-grain clock (production reads the same shape in minutes — say the unit).
// Probed traps honored: created_at is DATE-only, so the daypart split (breakfast/lunch/
// dinner) cannot be pulled from this table — saying so IS the interview answer; there is
// no channel column either, so digital make-line vs front line cannot be split without
// asserting it; every member has ordered (never-ordered = 0), so the honest anti-join
// lives in billing (6 statements with no settlement = 15,217.00, incl. paid-with-no-
// payment #28 at 1,756.00 and the 4,000-of-6,148 partial). Billing tables are ingredient
// settlements (INTEGER cents — divide by 100.0 exactly once). Pool provenance:
// company-pools.md carries NO Chipotle section (0 tagged rows) — all 10 topic slug sets
// and all 16 problems are theme-curated from the pools file's SQL rows and say so.
// Case briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12);
// every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const chipotleKit: CompanyKit = {
  id: "chipotle",
  domainId: "food",
  name: "Chipotle",
  tagline: "Digital kitchens, bowls per line-hour",
  accent: "text-red-300",

  brief: [
    "**Chipotle** runs company-owned kitchens — no franchise layer — where every order is a ticket through a make-line and the unit everyone manages is bowls per line-hour. One building, two kitchens: the {sky:digital make-line} firing app and web orders onto the mobile-order shelf, and the front line serving the in-store queue — burritos, bowls and salads portioned from prep pans set to par every morning. On the training db that reads as **103 tickets carrying 251 build lines**, status streaming as served 52 / staged 30 / queued 14 / {rose:86'd} 7, and a demand book of **34,833.28** — a 338.19 average ticket spanning a 25.47 sides-only run to a 1,088.44 catering haul. Every analyst here learns the first Chipotle lesson fast: *a ticket staged is not a ticket served, and the two numbers answer different questions*.",
    "The data org reads one spine at three grains. Kitchen ops owns the line board: the funnel census (52 / 30 / 14 / 7 over 103), pass aging — placement to shelf via `JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the **82 tickets** that carry a stamp, averaging 2.98 on this db's day-grain clock with a 2–4 spread — and the two-grain market census: EU runs 45 tickets from 8 members, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Menu & prep owns the matrix: portion pulls per SKU against prep par, where the thinnest pans sit at **14, 15 and 17** units of cover going into the dinner push. Finance owns ingredient settlements — INTEGER cents where the dollar read is `amount_cents / 100.0` and a skipped division is a 100x incident — with **6 statements carrying no settlement, worth 15,217.00**.",
    "Interview screens are census-then-denominator. A typical loop opens with the one-pass line census — four stage counts that must reconcile to 103 by construction — then escalates into a rate where the interviewer asks the denominator out loud (*'does a queued ticket count in your 86-rate base?'*), then into the velocity ladder where two SKUs tie at **36 portions pulled** and rank semantics become a policy decision about the prep calendar. The honest dead-ends get named too: `created_at` is date-only, so the {rose:daypart split} — breakfast, lunch, dinner — *cannot* be pulled from this table, and there is no channel column, so digital-versus-front-line cannot be split without asserting it. Candidates who say that out loud instead of forcing a query are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Chipotle section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: funnel counts with stated denominators, two-grain market censuses, tie-heavy velocity ladders, CASE stage pivots and the cents-safe settlement spine. This expanded kit is built for spaced practice rather than one sitting: **six case studies** now span the asks Chipotle data candidates rehearse most — the {emerald:make-line census} by market, the {sky:menu velocity ladder} prep leads set pars from, the thin-pan reorder list going into the dinner push, the one-pass huddle board, the settlement latency ledger behind the avocado contract, and the pass-aging histogram. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the population and the denominator before you compute anything* — then make every stage census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**09:15 —** The line board refreshes before the prep huddle. You re-run the funnel census yourself — {emerald:served} 52, staged 30, queued 14, {rose:86'd} 7 — and check the identity: the four branches must sum to **103** or a status value drifted and the board lies. Pass aging rides along: 2.98 average over the 82 stamped tickets, and any drift toward the 4-day tail means the digital line is backing up onto the mobile-order shelf. The thin-prep alert pings last: three pans at **14, 15 and 17** units of cover — the 86-risk list for tonight's dinner push writes itself from that one fold.",
    "**12:45 —** Deep work: the market census and the velocity ladder. The regional sheet wants tickets AND members per market in one row — EU 45-from-8 beside the US's 19-from-2 — because *a market can add tickets while losing members and only the pair of columns says which*. Prep wants the ladder re-cut: portions pulled per SKU, busiest first, and the **36-portion tie** handled honestly — shared rung 4 under RANK, and the 33-portion pan landing on rung 6, sixth busiest, not fifth-tied. The US row gets a footnote: 10 tickets staged against 5 served — *the digital shelf is holding more than the front line closed*, a backlog read, not a demand read.",
    "**16:30 —** The stakeholder cycle closes on money. The settlement sweep runs first — **6 statements with no payment, 15,217.00** — before a single reminder goes out, with #28 called out separately because {emerald:paid}-with-zero-payment-rows (1,756.00) is a label lying about money, and the partial at 4,000 of 6,148 feeds the dunning draft. Paid statements settle in 28.4 days against flat 30-day terms — fastest 13, slowest 84 — which is the avocado contract's negotiation lever. The day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Ticket funnel", what: "{emerald:Served} 52, staged 30, queued 14, {rose:86'd} 7 over 103 tickets placed. Four numerators over one population — merging queued into 86'd misreads a line backup as lost demand, and the four branches must reconcile to 103 by construction." },
    { name: "Pass aging", what: "`JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the 82 stamped tickets: **2.98** average on a 2–4 spread. The training db stores DAYS; the production kitchen clock reads the same shape in minutes — state the unit or misread the SLA." },
    { name: "Average ticket", what: "34,833.28 across 103 tickets = **338.19**, from a 25.47 sides-only floor to a 1,088.44 catering haul. The scalar-subquery baseline every market and daypart read is judged against." },
    { name: "Build depth", what: "251 build lines across 103 tickets. Depth separates the line-speed story from the price story — guac, double protein and sides land as new lines, so a ticket can deepen while the average sits flat." },
    { name: "Market census", what: "Tickets AND members per market at two grains: EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The gap between the columns is tickets per member — the intensity read every ops review opens with." },
    { name: "86 rate", what: "Cancelled share of placed tickets: 7 of 103 = **6.8%**, sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The 86 map that drives prep pars: every point is protein that got portioned and never sold." },
    { name: "Prep par cover", what: "Remaining cover = par minus portions pulled, per SKU: the thinnest pans sit at **14, 15 and 17** units while the leaders have pulled 47 and 46. Cover converts straight into tonight's substitution and 86 risk." },
    { name: "Settlement exposure", what: "6 statements with no payment = **15,217.00**, including #28 marked {emerald:paid} with zero payment rows (1,756.00) and one partial (4,000 of 6,148). Paid statements settle in 28.4 days against flat 30-day terms — the tail is the supplier lever." },
  ],

  topics: [
    {
      name: "Ticket stages & the funnel counts",
      why: "Every Chipotle screen opens with the funnel: tickets placed, served, staged, queued, 86'd. Each stage is a conditional count over a status, and the interviewer's first question is what the denominator holds — 52 served and 30 staged are different stages of the same line, and calling staged tickets served inflates the close rate before a single bowl lands.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "customer-order-frequency", "immediate-food-delivery-iii", "not-boring-movies", "trial-to-paid-funnel"],
    },
    {
      name: "Two-grain market censuses",
      why: "Tickets and members are different grains of the same join, and every census here reports both: EU runs 45 tickets from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers", "top-travellers"],
    },
    {
      name: "Build lines — the fan-out join",
      why: "One ticket fans into build lines — 103 tickets into 251 lines — and every count changes grain the moment you join order_items. Chipotle drills this first because the fan-out is where a candidate's COUNT stops meaning what they think: portions pulled and tickets served are different numbers wearing the same query shape.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier", "average-selling-price"],
    },
    {
      name: "The velocity ladder & the rank trio",
      why: "Prep reporting is leaderboard reporting: SKUs by portions pulled, markets by ticket value. The ladder ties constantly — two pans at 36 portions, three at 30, three at 21 on this db — and ROW_NUMBER, RANK and DENSE_RANK differ exactly there. The prep calendar needs the gaps, so the tie policy is a sentence you say out loud before you type.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "department-highest-salary"],
    },
    {
      name: "Menu argmax & the usual order",
      why: "Prep sets par per SKU and the app merchandises per member — both are argmax problems. The most-pulled pan per daypart, each member's usual build: RANK or ROW_NUMBER over a per-group fold, with a tie-breaker named, because 'the usual' that silently picks an arbitrary row erodes trust in the whole recommendation.",
      slugs: ["most-frequently-ordered-product-per-customer", "product-sales-analysis-ii", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "CASE banding & the stage pivot",
      why: "The morning board is a CASE pivot: one row per market, one column per line stage, four arms that must be exhaustive or the census stops reconciling to 103. Arms get reordered and a stage silently vanishes; a hole in the CASE is a hole in the line board. Tier bands (budget 8 SKUs averaging 32.06 against mid 8 at 111.50) are the same discipline at menu grain.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "sales-by-day-of-the-week", "recyclable-and-low-fat-products"],
    },
    {
      name: "Month spines & rolling line reads",
      why: "The 14-month ticket spine (2024-01 to 2025-02) is the ops review's home turf — 3,731.97 opening, 1,193.86 July trough — and the kitchen thinks in rolling windows: 7-day average ticket, week-over-week 86 counts. LAG drives the walk, rolling frames drive the line trend, and the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "restaurant-growth", "biggest-window-between-events", "rising-temperature", "consecutive-numbers"],
    },
    {
      name: "One-pass censuses for the huddle board",
      why: "The line board ships as ONE scan: served, staged, queued, 86'd plus average ticket, four branches reconciling to COUNT(*). FILTER (WHERE …) and SUM(CASE …) build it in a single pass; four sequential queries are four chances to drift out of reconciliation before the 9:15 huddle.",
      slugs: ["active-businesses", "ratings-histogram", "create-a-session-bar-chart", "group-sold-products-by-the-date", "user-activity-for-the-past-30-days-i", "big-countries"],
    },
    {
      name: "NULLs & the honest dead-end",
      why: "The 14 queued tickets carry no pass stamp, and `created_at` is date-only — so latency pools exclude them by definition and the daypart split cannot be computed at all. Screens here drill NULL-safe filters, COUNT(column) versus COUNT(*), and the answer that wins the room: naming what the schema cannot say instead of coalescing a zero over it.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "confirmation-rate", "count-student-number-in-departments"],
    },
    {
      name: "Settlement cents & the anti-join reflex",
      why: "Served is not settled — the billing tables (28 invoices, 27 payments, INTEGER cents) are where the kitchen meets money, and every dollar read divides by 100.0 exactly once. The exposure read is an anti-join: 6 statements with no settlement = 15,217.00, one of them marked paid — a status filter misses it, an anti-join doesn't.",
      slugs: ["customers-who-never-order", "bank-account-summary-ii", "number-of-accounts-that-did-not-stream", "market-analysis-i"],
    },
  ],

  theory: [
    {
      id: "chipotle-t1",
      q: "Your market report joins members to tickets. When do you INNER and when do you LEFT — and what silently breaks if you filter a ticket column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A throughput report joins tickets to members: a ticket with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: the members with no tickets ARE the answer, arriving with NULL ticket columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the member anti-join returns a confident zero — all 16 members appear in the ticket table — and proving that zero, instead of assuming it, is part of the job; the anti-join that DOES bite lives in billing, where 6 settlement statements carry no payment rows.",
      tag: "joins",
    },
    {
      id: "chipotle-t2",
      q: "The velocity ladder has two pans tied at 36 portions pulled, three at 30 and three at 21. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK shares rungs and then skips: on this db the ladder runs 47, 46, 38, then the 36-tie consuming ranks 4 and 4, and the 33-portion pan lands on rank 6 — the gap is the point, because the prep huddle reads 'sixth busiest' as a real position in the pull order. DENSE_RANK shares rungs without gaps — the 33-pan reads 5, and the board quietly re-sequences the prep calendar. ROW_NUMBER splits the tie arbitrarily, which is a silent judgment call about which pan gets portioned first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer pans (RANK or DENSE_RANK) or an explicitly named tie-breaker like par, then product id — and writing it in the query comment so the next analyst doesn't relitigate the prep order.",
      tag: "windows",
    },
    {
      id: "chipotle-t3",
      q: "The board says 103 tickets and 251 build lines; EU reads 45 tickets from 8 members. Why do these columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains, and every one of them is correct. COUNT(*) after the member join counts ticket rows — one per ticket, so EU's 45 is load. COUNT(DISTINCT customer_id) folds repeat demand back to people — EU's 8 members is coverage. The ratio — 5.6 tickets per member in EU versus 9.5 in the US on this db — is the intensity signal: is growth broadening across the base or concentrating in a handful of heavy rewards accounts? The trap that catches candidates is the third grain: join order_items for build lines and COUNT(*) silently counts build lines — 251 of them, not 103 tickets. Depth and load and coverage are three different claims about the same kitchen, and saying 'one row per what?' before every COUNT is exactly the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "chipotle-t4",
      q: "Queued tickets carry no pass stamp — shipped_at is NULL until the order hits the shelf. What is your policy for the pass-aging report, and how do the NULLs behave in its aggregates?",
      a: "Policy first: only tickets that reached the pass have an aging, so the report measures placement-to-shelf for the 82 of 103 tickets that carry the stamp — averaging 2.98 on this db's day-grain clock, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL tickets returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 86'd tickets, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-second pass hits for orders still queued at the line. And the deeper honesty: this schema cannot split the daypart at all, because created_at is date-only — the breakfast/lunch/dinner question is answered with a statement about grain, not a query that lies.",
      tag: "nulls",
    },
    {
      id: "chipotle-t5",
      q: "The ops review wants average ticket per market for markets carrying at least ten tickets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The stage rule is a row-level fact — excluding 86'd tickets discards those rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-ticket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a line board and an error, and between a threshold applied to tickets versus to dollars. On this db the floor decides the board's shape: EU 45, APAC 37 and US 19 clear a ten-ticket bar while LATAM's 2-ticket row waits outside — and whether LATAM belongs on the board is a definition someone signs, not a rounding note.",
      tag: "pipeline",
    },
    {
      id: "chipotle-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 tickets always produce a mean (338.19 on this db, against a 25.47 floor and a 1,088.44 ceiling — the catering haul every 'above average' flag trips on). On filtered staging tables — one market, one stage, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each ticket to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "chipotle-t7",
      q: "The trend report buckets tickets by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's tickets, and quarter-end is exactly when catering lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. One more honesty check this db forces: the timestamps are date-only, so any hour-of-day read returns '00' for all 103 rows — the daypart split needs a different source, and saying so beats faking it.",
      tag: "dates",
    },
    {
      id: "chipotle-t8",
      q: "Finance says a settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "chipotle-t9",
      q: "The huddle board needs served, staged, queued and 86'd counts in one scan. How do FILTER and conditional SUM(CASE) differ, and which do you reach for here?",
      a: "Both build the one-pass census; they differ in grammar and portability. FILTER (WHERE …) is the dedicated form — COUNT(*) FILTER (WHERE status = 'delivered') — SQLite and Postgres read it cleanly, and the filter reads like the business line it counts. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs anywhere, at the cost of the ELSE-0 discipline: drop the ELSE and SQLite's SUM over an all-NULL arm prints NULL, which breaks the four-branches-reconcile-to-103 identity. On this db either shape prints 52 / 30 / 14 / 7, and the reconciliation check — the four arms must sum to COUNT(*) = 103 — is what makes the board trustworthy. The habit being graded: one scan, four named branches, and an identity check written next to the query, not a hope that four sequential queries stay in agreement.",
      tag: "case-when",
    },
    {
      id: "chipotle-t10",
      q: "Marketing wants the share of tickets that came from rewards members. How do you build a rate whose numerator and denominator you can both defend?",
      a: "Name the population, then compute both counts from the SAME rows. On this db the rewards question has a twist: every one of the 16 members appears in orders, but the ticket table is the whole population, so 'member share of tickets' needs a join to customers — tickets whose customer_id matches a member row over COUNT(*) of all 103. The discipline moves: compute numerator and denominator in one pass (SUM(CASE WHEN joined-match THEN 1 ELSE 0 END) / COUNT(*)), multiply by 100.0 before the division so integer truncation never flattens the rate, and round once at the edge. If someone asks for 'share of MEMBERS who ordered', that is a different fraction — a different denominator — and saying so out loud is exactly what the interviewer waits for. Rates are definitions first, arithmetic second; the 100.0 fix is the mechanical part.",
      tag: "metrics",
    },
    {
      id: "chipotle-t11",
      q: "What does UNION ALL buy you when stacking the huddle board over the settlement ledger — and when is the dedupe in UNION actually the bug?",
      a: "UNION ALL concatenates cheaply and honestly: board rows stacked over a ledger TOTAL row belong in one report precisely because no row is a duplicate of another — deduping would be a bug looking for a victim. UNION adds a distinct pass that is only correct when duplicates are genuinely redundant — and the trap this kit drills is byte-identical rows across branches: two branches that both emit (market, 45, 335.32) with no stage label collapse into one, a market silently vanishes from the board, and nothing errors. The discipline: default to UNION ALL, add a comment stating WHY duplicates are impossible, and reach for UNION only when you can name the duplicated rows you are paying to collapse. Column discipline matters in both: matching column counts, compatible types, names taken from the first branch.",
      tag: "set-ops",
    },
    {
      id: "chipotle-t12",
      q: "EXCEPT versus a LEFT JOIN … IS NULL anti-join — which do you reach for when hunting statements with no settlement, and why does it matter here?",
      a: "EXCEPT answers the set-level question — which billed statement ids never appear in payments — in two clean SELECTs with no join gymnastics, and it deduplicates both sides first. The LEFT JOIN anti-join answers the row-level question: it carries the statement's number, cents and status alongside the NULL payload, which is what the reminder letter needs — and on this db it surfaces the 6 statements worth 15,217.00, including #28, the one marked 'paid' with zero settlement rows. The two error modes are mirrors: a status filter misses #28 because the label lies; a NOT IN over a subquery containing a NULL empties the whole list while looking valid. EXCEPT for set diffs, anti-join for row forensics, NOT EXISTS when the payload would trip over NULLs — knowing which question you are answering is the skill.",
      tag: "set-ops",
    },
    {
      id: "chipotle-t13",
      q: "Prep wants each member's usual build — their most-pulled pan. Walk me through the argmax and what happens on ties.",
      a: "Three shapes, one tie policy. Window argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY SUM(quantity) DESC, product_id) = 1 inside a CTE — deterministic, one row per member, but the second ORDER BY key is a policy decision ('earlier product id wins') that someone should sign. Join-back on the maximum: fold portions per member-product, join back where portions = the member's MAX — honest, and it returns BOTH pans on a tie, which is either a feature (report co-favorites) or noise (double-counted members). Correlated filter: WHERE quantity = (SELECT MAX(…) for that member) — same tie behavior as the join-back, at per-row re-evaluation cost. On this db the velocity ladder ties constantly — two pans at 36 portions pulled — so 'the usual' that silently picks an arbitrary row erodes trust in the whole recommendation. Name the tie-breaker before you type; that sentence IS the answer.",
      tag: "windows",
    },
    {
      id: "chipotle-t14",
      q: "A CTE named repeat_buyers feeds three different boards. What does staging queries as WITH clauses buy a kitchen analytics team?",
      a: "Three concrete buys. Readability: named steps — stamped_tickets, aging_buckets, thin_pans — read like the prep process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one fold written once feeds the board, the memo and the deep-dive without three copies drifting apart — on this db the per-SKU portions fold feeds the velocity ladder AND the thin-pan cover list, and folding it twice is how the two reports stop agreeing. Correctness under review: a CTE named repeat_buyers forces the definition (2+ tickets) to live where the reviewer can see it, and kitchen metrics get argued about as fiercely as any retail KPI. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step — the WHERE shipped_at IS NOT NULL belongs in the stamped_tickets stage, not bolted onto the third consumer.",
      tag: "ctes",
    },
    {
      id: "chipotle-t15",
      q: "The menu matrix carries a price and the build lines carry a unit_price. Which do you trust for revenue, and where do average-of-averages bugs bite here?",
      a: "Trust the build line: revenue per ticket is SUM(oi.unit_price * oi.quantity) over order_items — the price captured at pull time, including any promo the catalog no longer shows. The catalog price answers a different question (today's list price). The average-of-averages bug bites at exactly this seam: per-market average tickets read 335.32 (EU, 45 tickets), 313.66 (APAC, 37), 383.48 (US, 19) and 426.22 (LATAM, 2) — averaging those four numbers gives 364.67, a figure that describes no kitchen that exists. The true all-ticket average is SUM(total)/COUNT(*) over the base rows: 338.19, where LATAM's two tickets barely register. The honest blends are re-aggregation from the base or a weighted average — SUM(aov * tickets)/SUM(tickets). Saying WHERE the weighting lives is the whole answer; an average of averages is only correct when every group has equal counts, and that is a claim to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "chipotle-t16",
      q: "Where do integer cents bite in the settlement tables, and what is your rounding policy for the close?",
      a: "Three bite points. Scale: invoices.amount_cents = 175600 is 1,756.00 dollars, and amount_cents / 100 is integer division — 1,756 flat, cents gone; divide by 100.0 exactly once, at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. Float drift: SQLite REALs are IEEE doubles, so compare money with a tolerance or keep it in integer cents until the last step. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — this ledger closes at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A settlement figure that survives that chain is a figure the controller signs.",
      tag: "numbers",
    },
    {
      id: "chipotle-t17",
      q: "A candidate writes WHERE region = 'EU' OR region = 'US' instead of IN ('EU','US'). What is the real lesson about multi-predicate filters on this db?",
      a: "Both forms return the same 64 tickets here, so the lesson is not correctness — it is extensibility and NULL behavior. IN composes: adding APAC is one token, and the predicate reads as the market list it is. OR chains grow teeth: add a third condition like total > 500 and parentheses become load-bearing, because AND binds tighter than OR and the filter silently changes meaning — the classic bug ships when someone appends OR status = 'cancelled' to a market filter and the 86'd tickets from every market flood in. NULL comparisons fail both branches of OR the same way they fail =, so the NULL-ticket rows (there are none in orders.customer_id here, but staging tables differ) drop out either way. The interview bar: state what the predicate keeps, not just what it matches — multi-predicate filters are where 'same answer, different query' starts diverging under the next edit.",
      tag: "filters",
    },
    {
      id: "chipotle-t18",
      q: "Served-and-staged counts by market need a column per stage. How do you pivot in SQL, and what makes a pivot trustworthy?",
      a: "CASE WHEN plus conditional aggregation — one scan, one column per stage. SELECT c.region, SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS served, … GROUP BY c.region: four arms, exhaustive over the status domain, each reconciling so EU's 24 + 12 + 6 + 3 = 45. Trustworthiness comes from exhaustiveness and the reconciliation identity: a CASE with a hole quietly drops that stage's tickets from every column — the board still sums to something, just not to 103 — so the arms must cover every status or carry an explicit ELSE. The FILTER (WHERE …) form is the same census in dedicated grammar. What makes the pivot a report and not a stunt: the four columns share one denominator (the market's ticket count), so a served-share computed from sibling arms cannot drift — that shared-denominator property is the reason pivots beat four stitched queries.",
      tag: "case-when",
    },
    {
      id: "chipotle-t19",
      q: "Why is DISTINCT a bug report on the build-line join, and when is it legitimate?",
      a: "When it papers over a fan-out nobody diagnosed. Join orders to order_items and COUNT(*) reads 251, not 103 — SELECT DISTINCT order_id, total would produce sane-looking rows while the revenue SUM next to it stayed inflated 2.4x. The honest sequence: notice the DISTINCT, run the counts with and without it (103 versus 251 — the jump IS the fan-out), find the multiplicity, and fix the grain — aggregate lines to ticket grain first, or count entities with COUNT(DISTINCT o.id). Legitimate DISTINCT exists: collapsing a dimension's value set (16 members, 4 markets), COUNT(DISTINCT customer_id) in the two-grain census where folding repeat demand back to people IS the metric, or de-duplicating a deliberately over-joined enrichment. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
    },
    {
      id: "chipotle-t20",
      q: "How do consecutive-day reads — a member visiting three days running, a stage holding through a streak — work in SQL?",
      a: "Gaps-and-islands. ROW_NUMBER() OVER (ORDER BY day) minus ROW_NUMBER() OVER (PARTITION BY member ORDER BY day) is constant inside a consecutive run, so GROUP BY that difference and COUNT(*) to get every streak — that is the whole trick. The LAG variant: compare each day to the previous one, flag breaks (date diff > 1), then SUM the flags to number the islands. On this db the honest caveat comes first: created_at is date-only, so consecutive-DAY logic works at day grain, and any hour-of-day reasoning is fiction — every row reads '00'. Consecutive reads power the rewards questions (visit streaks, day-after-repeat chains) and the ops ones (a stage holding N cycles). The interviewer is listening for: partition key (member), ordering key (day), the row-number difference, and the population sentence — streaks of WHAT, for WHOM, at WHAT grain.",
      tag: "windows",
    },
    {
      id: "chipotle-t21",
      q: "The window report has two LAG columns and a WHERE on one of them. Why does it error, and what is the staging pattern?",
      a: "Because windows run in the SELECT stage — after WHERE, after GROUP BY, after HAVING. WHERE LAG(orders) OVER (…) IS NULL is a hard error: the window's output does not exist at filter time, and neither does an alias computed from it in the same SELECT. The staging pattern: put the windows in a CTE or derived table (monthly AS (SELECT SUBSTR(created_at,1,7) AS month, COUNT(*) AS orders FROM orders GROUP BY month)), then filter and compose in the outer SELECT — month-over-month percentages from LAG, the NULL first row kept as 'baseline', thresholds applied outside. On this db the 14-month spine (2024-01 to 2025-02, 3,731.97 opening) is exactly that shape. The same stage logic explains why SELECT aliases work in ORDER BY (it runs after) but not in WHERE — half of all 'weird database behavior' complaints are pipeline order meeting wishful thinking.",
      tag: "pipeline",
    },
    {
      id: "chipotle-t22",
      q: "The prep lead asks for 'the second-busiest pan'. Why is LIMIT 1 OFFSET 1 the wrong reflex on this menu?",
      a: "Because the ladder ties. Portions pulled run 47, 46, 38, then TWO pans tied at 36 — the second-highest DISTINCT value is 46, and LIMIT 1 OFFSET 1 returns it only if the sort is stable and single-column; but flip the question to 'second-highest distinct pull level' and a tied pair would make OFFSET skip a level the business counts. The robust shapes: MAX-below-MAX (SELECT MAX(portions) WHERE portions < (SELECT MAX(portions))) for the second distinct value, or DENSE_RANK = 2 in a window — which reads 2 for the second DISTINCT level regardless of ties. ROW_NUMBER with OFFSET picks one arbitrary row among equals and hides the tie entirely. On a menu where two pans tie at 36 and three tied at 30 before that, the tie policy is a prep-calendar decision — the candidate who says 'second DISTINCT level, via DENSE_RANK' outperforms the one who reaches for OFFSET.",
      tag: "windows",
    },
    {
      id: "chipotle-t23",
      q: "The settlement sweep finds 6 statements with no payment. What follow-up checks do you run before the reminder letters go out?",
      a: "Five, in order. Freshness: are those 6 rows the same 6 as last close, or did the anti-join move — a settled statement dropping off the list is as interesting as a new one. The mirror anomaly: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in the anti-join, so check the flip side too. Label truth: #28 is marked 'paid' with zero settlement rows (1,756.00) — the status column is a claim, the payment rows are the ledger of record, and the mismatch is its own finding. Volume: 15,217.00 total exposure against the 34,833.28 ticket book — is the tail growing? Reconciliation: the coverage split must still read 21 exact / 1 partial (4,000 of 6,148) / 6 none, and the trial balance must land at 181,080 against 181,080. The deliverable is not a list — it is the list plus the four numbers that prove nothing else moved.",
      tag: "quality",
    },
    {
      id: "chipotle-t24",
      q: "When does a report's honest answer have ZERO rows — and how do you defend an empty result in an interview?",
      a: "When the anti-join is the point. 'Members with no tickets' on this db returns nothing — all 16 members appear in orders — and the strong candidate proves the zero: run the LEFT JOIN … IS NULL shape, show COUNT(*) = 0, and state why (the rewards program seats every account with an order). An unproven zero is indistinguishable from a broken join; a proven zero is a finding. The same discipline guards the dead-ends: the daypart split returns one bucket because created_at is date-only — the honest answer is 'this schema cannot say breakfast from dinner', not a midnight histogram dressed up as insight. And in billing the zero flips to six: the anti-join over payments finds 6 statements with no settlement, because there the missing rows ARE the story. Empty result sets get the same treatment as numbers — population, filter, and why the emptiness is or is not expected.",
      tag: "nulls",
    },
  ],

  mcqs: [
    {
      id: "chipotle-mcq-1",
      prompt: "A ticket row's status reads 'shipped'. In this kit's Chipotle stage map, what happened?",
      choices: ["Served & closed — the guest has the bag", "Staged — on the pass / mobile-order shelf, not yet handed off", "86'd — cancelled at the line", "Queued — received, not yet started"],
      answer: 1,
      why: "The stage map is fixed: shipped = staged on the pass (30 of 103 tickets, 29.1%). The order made it through the make-line but the handoff hasn't closed — a backlog stage, not a done stage.",
      notes: [
        { choice: 0, why: "Served & closed is 'delivered' — 52 tickets. Calling the 30 staged tickets served inflates the close rate before a single handoff happens." },
        { choice: 3, why: "Queued is 'pending' — 14 tickets that haven't hit the line yet. Queued has no pass stamp and no aging; staged already does." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-2",
      prompt: "Pass aging averages 2.98 over which population? The db holds 82 stamped tickets, 14 queued and 7 86'd of 103 placed.",
      choices: ["All 103 placed tickets", "The 82 tickets with a pass stamp", "The 52 served tickets only", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: aging is placement-to-shelf over tickets that reached the pass — 82 of 103. Queued tickets have no shelf event yet and no latency to average; the population sentence ships with the number.",
      notes: [
        { choice: 0, why: "AVG ignores NULLs so the math would print 2.98 anyway — but the 103 base is a lie of naming: 21 tickets contributed nothing and the title would claim they did." },
        { choice: 2, why: "Served-only (52) mixes two funnel steps — serving is the handoff, the stamp is the shelf. Different steps, different populations, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-3",
      prompt: "EU carries 45 tickets from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts ticket rows (45); COUNT(DISTINCT customer_id) folds repeat demand back to members (8). The gap between them — 5.6 tickets per member — is the intensity read the census exists to surface.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ticket carries a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not members — a third grain nobody asked for. The census is tickets AND people." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled tickets only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the 86-share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the 86 map reads zero everywhere and prep never re-pars." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-5",
      prompt: "Keep only markets carrying at least 10 tickets on the line board. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE tickets >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A ticket-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the board keeps EU 45, APAC 37 and US 19 — LATAM's 2-ticket row waits outside the gate.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'tickets' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-6",
      prompt: "The velocity ladder runs 47, 46, 38 portions, then TWO pans tied at 36, then one at 33. Under RANK, what rank does the 33-portion pan carry?",
      choices: ["5", "6", "4", "7"],
      answer: 1,
      why: "RANK shares rungs and then skips: 1, 2, 3, then the tie consumes ranks 4 and 4, so the next distinct count lands on 6. The prep huddle reads the 33-portion pan as sixth busiest — which is true, two pans out-pulled it at the same rung.",
      notes: [
        { choice: 0, why: "5 is the DENSE_RANK answer — shared rungs without gaps. DENSE_RANK silently re-sequences the prep calendar by erasing the gap." },
        { choice: 2, why: "4 is the tied rung the 36-portion pans occupy. The 33-pan never shares a rung with them — it follows the block." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The queued tickets double-counted their placement day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 tickets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-8",
      prompt: "A staging-table 86-list uses member_id NOT IN (SELECT customer_id FROM tickets WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["No member ever 86'd — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the 86-list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every ticket carries a customer_id and 7 cancelled rows exist. But staging tables are exactly where NULLs sneak in, and empty 86-lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-9",
      prompt: "A board stack puts staged tickets under 86'd tickets in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no stage label — collapse into one, and the line board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-10",
      prompt: "Marketing asks for the lunch-vs-dinner ticket split: STRFTIME('%H', created_at) grouped and counted. The query returns one row where the hour reads '00' and the count is 103. What is the honest move?",
      choices: ["Cast created_at to DATETIME and re-run — the hours will populate", "Report the split as heavily midnight-skewed and flag for cleanup", "Say the schema cannot answer it — created_at is DATE-only, so every row reads hour '00'; the daypart split needs a timestamped source", "Bucket by shipped_at instead — it carries the time-of-day component"],
      answer: 2,
      why: "created_at stores DATE-only values — STRFTIME('%H') reads '00' for all 103 rows, and the one-row 'midnight' histogram is the schema saying it has no hours to give. Naming the dead-end IS the interview answer; the daypart split needs a different source, not a cleverer query against a column with no clock in it.",
      notes: [
        { choice: 0, why: "A CAST cannot conjure hours that were never stored — the re-run prints the same '00' wall with more syntax. This is the confident-lie answer." },
        { choice: 3, why: "shipped_at re-keys the split to shelf time, not order time — a different question wearing the same name, and on this db its grain is days too." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-11",
      prompt: "You need total demand across the day. The ticket table holds `total`; the join to build lines fans 103 tickets into 251 lines. Which expression returns the honest dollar figure?",
      choices: [
        "SUM(o.total) over tickets LEFT JOINed to build lines",
        "SUM(oi.unit_price * oi.quantity) over the build lines",
        "AVG(o.total) * 251",
        "SUM(o.total) / COUNT(oi.id)",
      ],
      answer: 1,
      why: "Line-grain revenue is SUM(unit_price × quantity) over order_items: 34,833.28, priced at pull time. SUM(o.total) after the join repeats each ticket's total once per build line — 103 tickets × 2.4 average lines — inflating demand roughly 2.4x with no error anywhere.",
      notes: [
        { choice: 0, why: "The join is the bug: every multi-line ticket's total is added once per line. The 2.4x inflation is the classic fan-out SUM this kit exists to drill." },
        { choice: 2, why: "AVG × a line count multiplies two different grains — the result is neither revenue nor anything else. Grain mixing, not arithmetic, is the failure." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-12",
      prompt: "A trend report buckets tickets with `STRFTIME('%m', created_at)` and shows 13 rows instead of 14. What happened?",
      choices: [
        "One month genuinely had no tickets",
        "'%m' extracts month-only, so Jan 2024 and Jan 2025 merged into one bucket",
        "STRFTIME cannot parse the date format in this column",
        "GROUP BY collapsed NULL months",
      ],
      answer: 1,
      why: "The month key needs year plus zero-padded month — SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m'). '%m' alone folds every January together and the spine becomes fiction: 14 calendar months, fewer buckets.",
      notes: [
        { choice: 0, why: "Every month from 2024-01 to 2025-02 carries tickets — the bucket count changed, not the demand. A merged bucket is a query bug wearing a quiet face." },
        { choice: 2, why: "STRFTIME parses these ISO dates fine — the format string is the bug. Choosing the wrong specifier fails silently, which is why the spine gets eyeballed against COUNT(*)." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-13",
      prompt: "After joining tickets to build lines, which expression still counts TICKETS, not build lines?",
      choices: [
        "COUNT(*)",
        "COUNT(oi.id)",
        "COUNT(DISTINCT o.id)",
        "SUM(1)",
      ],
      answer: 2,
      why: "COUNT(DISTINCT o.id) folds the fan-out back to ticket grain — 103 even after the join. COUNT(*) and SUM(1) count joined rows (251); COUNT(oi.id) counts non-NULL line ids, which is also 251.",
      notes: [
        { choice: 0, why: "COUNT(*) after a join counts the JOINED rows — one per build line. Saying 'one row per what?' before every COUNT is the habit the panel grades." },
        { choice: 1, why: "COUNT(oi.id) counts lines with a non-NULL id — all of them. It is COUNT(*) in disguise whenever the FK is populated." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-14",
      prompt: "`SELECT region, ROUND(AVG(total),2) AS avg_ticket FROM orders JOIN customers … WHERE avg_ticket > 350 GROUP BY region` fails. Why?",
      choices: [
        "Aliases cannot contain underscores",
        "WHERE runs before SELECT computes avg_ticket — the alias does not exist at filter time",
        "ROUND cannot appear in SELECT with GROUP BY",
        "The join must come after GROUP BY",
      ],
      answer: 1,
      why: "Logical evaluation order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. The alias is born in SELECT, so WHERE cannot see it — the fix is HAVING AVG(total) > 350 (a group-level threshold) or wrapping the query. ORDER BY CAN use the alias, because it runs after SELECT.",
      notes: [
        { choice: 1, why: "Correct — and the same stage logic explains why HAVING exists at all: group-level facts can only be judged after the fold. The 350 floor on the average is HAVING's whole job." },
        { choice: 2, why: "ROUND is a plain scalar function in SELECT — perfectly legal with GROUP BY. The failure is temporal (when the alias exists), not syntactic." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-15",
      prompt: "Which expression computes EU's tickets-per-member intensity (45 ÷ 8) correctly in the two-grain census?",
      choices: [
        "COUNT(*) / COUNT(DISTINCT customer_id)",
        "100.0 * COUNT(*) / COUNT(DISTINCT customer_id)",
        "COUNT(*) / COUNT(customer_id)",
        "AVG(total) / COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts ticket rows (45) and COUNT(DISTINCT customer_id) folds to members (8) — the ratio is intensity. 45 / 8 in SQLite yields 5 (integer division) — acceptable here because intensity is read as 'about 5.6', but a rounding-sensitive read needs 1.0 * COUNT(*) / COUNT(DISTINCT …).",
      notes: [
        { choice: 1, why: "That computes a percentage (562.5%), not a ratio — the 100.0 habit belongs to rate reads, not intensity reads. Know which scale the audience expects." },
        { choice: 2, why: "COUNT(customer_id) without DISTINCT counts non-NULL FKs — 45 again — so the ratio is 45/45 = 1 for every market and the intensity story vanishes." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-16",
      prompt: "`SELECT name FROM products WHERE stock > (SELECT stock FROM products WHERE name = 'Guacamole')` returns ZERO rows on a staging copy where the name lookup matches nothing. First diagnosis?",
      choices: [
        "No pan has more stock than guacamole — the zero is plausible",
        "The scalar subquery returned NULL (empty fold), stock > NULL is UNKNOWN, and every row silently failed the comparison",
        "Scalar subqueries error when they return no rows",
        "The outer WHERE needs DISTINCT",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows; zero rows return NULL, not an error. stock > NULL evaluates UNKNOWN, so the whole report empties while looking valid. The staging-table version of this bug ships weekly — name the empty-case behavior unprompted.",
      notes: [
        { choice: 0, why: "A confident zero needs proof, and the proof here is the subquery, not the stock levels. Test the inner fold alone: it returns nothing." },
        { choice: 2, why: "Zero rows is explicitly allowed for a scalar subquery — one row drives the comparison, zero rows yield NULL. The silence is the failure mode." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-17",
      prompt: "A quarter-end read uses `WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'`. What is the defect?",
      choices: [
        "BETWEEN cannot compare text dates",
        "It silently drops March 31's evening tickets because the timestamps carry a time component the upper bound excludes",
        "It includes April 1st",
        "BETWEEN is slower than two comparisons",
      ],
      answer: 1,
      why: "BETWEEN is inclusive at both ends, but any timestamp past midnight on the 31st ('2024-03-31T18:00') sorts after '2024-03-31' and drops out. The professional form is the half-open range: created_at >= '2024-03-01' AND created_at < '2024-04-01' — boundary-proof and composable at month ends.",
      notes: [
        { choice: 0, why: "SQLite compares ISO text dates lexicographically, which is exactly why the half-open range works. The defect is the inclusive upper bound, not the type." },
        { choice: 2, why: "Inclusivity runs the other way: BETWEEN cannot include April — it fails to keep the last night of March. Quarter-end is precisely when late tickets land." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-18",
      prompt: "`GROUP_CONCAT(DISTINCT status)` over all tickets returns 'cancelled,delivered,pending,shipped'. What does that tell you, and what does it NOT?",
      choices: [
        "It is a value-set read (four statuses, alphabetized); it says nothing about how many tickets carry each",
        "It counts the distinct statuses",
        "It is the funnel census — four stages with their counts",
        "It proves every ticket has a status",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a value SET into one string — great for 'what statuses exist' audits and vendor-list cells, useless for counts. Order is unspecified unless you ORDER BY inside the aggregate (SQLite supports GROUP_CONCAT(x ORDER BY y)), so never parse the string for sequence-sensitive meaning.",
      notes: [
        { choice: 1, why: "COUNT(DISTINCT status) counts them (4); GROUP_CONCAT lists them. The census — 52/30/14/7 — needs conditional counts, not string folding." },
        { choice: 3, why: "A NULL status would vanish from the concat silently — the string proves nothing about completeness. Pair it with COUNT(status) versus COUNT(*)." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-19",
      prompt: "A rolling 7-ticket average uses `AVG(total) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. Two tickets share a created_at day. What changes if you write RANGE instead of ROWS?",
      choices: [
        "Nothing — ROWS and RANGE are synonyms",
        "RANGE peers 6 DAYS back (calendar-true, includes the tied peer), while ROWS peers 6 ROWS back (row-true)",
        "RANGE makes the average cumulative over the whole table",
        "RANGE errors on tied ORDER BY keys",
      ],
      answer: 1,
      why: "ROWS counts physical rows; RANGE counts values of the ORDER BY key and pulls in peers. On tied days RANGE suddenly includes more rows than ROWS — the average jumps. For date axes the calendar-true frame is usually what the business means, but saying WHICH you chose out loud is the interview bar.",
      notes: [
        { choice: 0, why: "They disagree exactly on ties — and this db has tied created_at days. Silent frame drift is a real class of dashboard bug." },
        { choice: 2, why: "That is the DEFAULT frame's shape (UNBOUNDED PRECEDING AND CURRENT ROW) — a different window entirely. RANGE with 6 PRECEDING stays a 6-unit lookback." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-20",
      prompt: "Which query finds billed statement ids that never settled, surviving NULLs by construction?",
      choices: [
        "SELECT id FROM invoices WHERE id NOT IN (SELECT invoice_id FROM payments)",
        "SELECT id FROM invoices WHERE id NOT EXISTS (SELECT invoice_id FROM payments)",
        "SELECT id FROM invoices WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = invoices.id)",
        "SELECT id FROM invoices EXCEPT SELECT id FROM payments",
      ],
      answer: 2,
      why: "NOT EXISTS correlated on the join key is the NULL-safe anti-join: it short-circuits on the first match and never trips three-valued logic. Option A returns nothing if the subquery yields one NULL invoice_id; option B is not valid SQL (NOT EXISTS is not an operator on a subquery that way); option D compares id to payment row id, not invoice_id — a grain error.",
      notes: [
        { choice: 0, why: "The classic trap: payments.invoice_id is NOT NULL here, but staging copies grow NULLs and one NULL empties the whole NOT IN list silently." },
        { choice: 3, why: "EXCEPT needs matched grain and matched columns — invoices.id against payments.id (row ids) compares different domains. EXCEPT belongs on invoice_id versus invoice_id, same types both sides." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-21",
      prompt: "The month-over-month walk shows January's delta as 0.0 instead of blank. The query coalesced `LAG(orders)` to 0. Why is that a lie?",
      choices: [
        "0.0 is the correct presentation for the first month",
        "The first month has no baseline — coalescing invents a flat month and makes January read as 'no change from nothing'",
        "LAG should be replaced by LEAD at the edges",
        "The coalesce only affects the first row's color",
      ],
      answer: 1,
      why: "LAG's boundary NULL is honest: no prior row exists, so the change is undefined, not zero. Coalescing the baseline to 0 turns 'no history' into '100% growth from zero' or a flat 0.0 depending on the formula — either way the deck now asserts something the data never said. Label it 'baseline' or leave the NULL.",
      notes: [
        { choice: 0, why: "Presentation convenience is not truth: every downstream average of monthly deltas now absorbs a fake zero. The spine's first row is the one row allowed to be empty." },
        { choice: 2, why: "LEAD reads the future — February's baseline would become March. Swapping functions re-labels history; keep LAG and keep the NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-22",
      prompt: "The never-ordered-members anti-join returns ZERO rows on the live db. What is the defensible conclusion?",
      choices: [
        "The query is broken — every rewards program has dormant members",
        "All 16 members appear in orders; the zero is a verified finding, not a failure",
        "The join key is wrong",
        "The members table has no rows",
      ],
      answer: 1,
      why: "On this db the anti-join legitimately finds nothing — and 'prove the zero' is the muscle: run the LEFT JOIN … IS NULL shape, show COUNT(*) = 0, state why (every member account has ordered). An unproven zero is indistinguishable from a broken join; a proven zero is a finding the whitespace report can ship.",
      notes: [
        { choice: 0, why: "Assuming the zero must be wrong is the same sin as assuming it must be right — both skip the proof. The whitespace story this db actually tells lives in billing: 6 statements with no settlement." },
        { choice: 2, why: "The key is fine — 103 tickets all carry valid customer_ids. Verify with a COUNT of unmatched tickets, not by swapping keys on a hunch." },
      ],
      difficulty: "easy",
    },
    {
      id: "chipotle-mcq-23",
      prompt: "Portions pulled run 47, 46, 38, 36, 36. What is the second-HIGHEST DISTINCT pull level, and which expression returns it regardless of ties?",
      choices: [
        "46 — MAX(portions) WHERE portions < (SELECT MAX(portions))",
        "46 — LIMIT 1 OFFSET 1 ordered by portions DESC",
        "38 — the second row of the ladder",
        "36 — the second-highest row value",
      ],
      answer: 0,
      why: "The second distinct level is 46, and MAX-below-MAX (or DENSE_RANK = 2) returns it tie-proof. LIMIT/OFFSET picks the second ROW — which happens to be 46 here, but on a tied top pair it would return one of the tied copies and silently skip a level the prep calendar counts.",
      notes: [
        { choice: 1, why: "OFFSET answers 'second row', which equals 'second distinct value' only when no ties share the top. The 36-tie two rungs down is where this reflex eventually bites." },
        { choice: 2, why: "That is ROW_NUMBER thinking — position in the sort, not level in the distribution. The prep lead asked for a LEVEL." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-24",
      prompt: "The intensity column must read 5.6 (EU) and 9.5 (US), not 5 and 9. Which rewrite forces real division?",
      choices: [
        "ROUND(COUNT(*) / COUNT(DISTINCT customer_id), 1)",
        "1.0 * COUNT(*) / COUNT(DISTINCT customer_id)",
        "COUNT(*) / (COUNT(DISTINCT customer_id) + 0.5)",
        "CAST(COUNT(*) AS TEXT) || '/' || COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "SQLite divides integers with integer semantics — 45/8 = 5 — so one operand must be real BEFORE the division: 1.0 * (or 100.0 for percentages). ROUND cannot recover the precision integer division already truncated, and 0.5 fudge factors corrupt every group.",
      notes: [
        { choice: 0, why: "The truncation happened inside the division; ROUND(5, 1) is still 5. The 100.0-before-division rule exists for exactly this reason." },
        { choice: 2, why: "Adding 0.5 biases every market differently — US reads 19/2.5 = 7.6 instead of 9.5. Real arithmetic, not fudge, is the fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "chipotle-mcq-25",
      prompt: "The 7-day rolling ticket average must survive days with no tickets (gaps). Which frame choice is calendar-true?",
      choices: [
        "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN 6 PRECEDING AND CURRENT ROW on a julianday ordering key",
        "No frame — default OVER (ORDER BY day) is already 7 days",
      ],
      answer: 2,
      why: "SQLite's RANGE frames walk the ORDER BY key's VALUES: with julianday(created_at) as the key, RANGE BETWEEN 6 PRECEDING AND CURRENT ROW looks back 6 DAYS — calendar-true across gaps. ROWS BETWEEN 6 PRECEDING counts 7 present ROWS, which stretches across however many empty days sit between them.",
      notes: [
        { choice: 0, why: "That is the rows-true frame: right when every day exists, quietly wrong across gaps — and this spine has quiet months. Name the axis before naming the frame." },
        { choice: 1, why: "SQLite has no INTERVAL syntax in window frames — that is Postgres dialect. In SQLite the calendar lookback is RANGE over a numeric day key." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-26",
      prompt: "A statement list uses `WHERE id NOT IN (SELECT invoice_id FROM payments_stage)` and returns nothing. The staging table has one NULL invoice_id. What is the disciplined repair?",
      choices: [
        "Add WHERE invoice_id IS NOT NULL to the subquery — or switch to NOT EXISTS",
        "Add DISTINCT to the subquery",
        "Cast invoice_id to TEXT",
        "Replace NOT IN with != ALL",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) is UNKNOWN for every outer row — one NULL empties the report while looking valid. Either strip the NULLs explicitly or use NOT EXISTS, which short-circuits on matches and is NULL-safe by construction. != ALL is not SQLite syntax — the trap is three-valued logic, not dialect.",
      notes: [
        { choice: 1, why: "DISTINCT deduplicates values but keeps the NULL — the poison survives. The fix is removing or testing NULLs, not collapsing them." },
        { choice: 3, why: "ALL/ANY quantified comparisons do not exist in SQLite, and the semantics would inherit the same NULL problem anyway. NOT EXISTS is the portable NULL-safe shape." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-27",
      prompt: "Invoice #25 bills 614800 cents; payments table shows 400000 settled. What does `SELECT amount_cents / 100 FROM invoices WHERE number = 'INV-2024-025'` print?",
      choices: ["6148.00", "6148", "6147.99", "6148.00 cents"],
      answer: 1,
      why: "amount_cents / 100 is integer division — 6148 flat, cents truncated. The dollar read is amount_cents / 100.0 exactly once at the presentation edge: 6148.0. Odd-cent rows lose 0.99-style amounts silently, which is why the close reconciles in cents and converts once.",
      notes: [
        { choice: 0, why: "That would require the .0 — the missing divisor is the whole bug. Integer division never produces a decimal point." },
        { choice: 2, why: "Integer division truncates toward zero (6148), it does not round down through 6147.99 — SQLite has no banker's rounding surprises here, just truncation." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-28",
      prompt: "In the settlement coverage CASE, why must `WHEN COUNT(p.id) = 0 THEN 'none'` be evaluated BEFORE the paid-equals-billed branch?",
      choices: [
        "CASE branches run in random order",
        "For never-settled statements SUM(p.amount_cents) is NULL, and NULL = amount_cents is UNKNOWN — so the equality branch never fires and the row would fall to ELSE mislabeled as 'partial'",
        "COUNT runs faster than SUM",
        "The ELSE branch is evaluated first in SQLite",
      ],
      answer: 1,
      why: "CASE arms evaluate in written order, and the first match wins. A statement with no payment rows folds to SUM(NULL) = NULL; the exact-settlement test compares NULL to the bill, gets UNKNOWN, and skips — so the no-payment test must catch those rows first or they land in ELSE wearing the wrong label. Order is semantics in a CASE, not style.",
      notes: [
        { choice: 0, why: "Deterministic order is a language guarantee — relying on it is exactly right, scrambling it is the bug. The NULL comparison behavior makes the order load-bearing here." },
        { choice: 3, why: "ELSE runs last, by definition. The failure mode is a mislabeled bucket (partial carrying the 6 no-payment rows), which is worse than an error because it looks plausible." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-29",
      prompt: "The huddle census's four stage arms stop summing to COUNT(*) = 103 after a refactor. Which change is the likely culprit?",
      choices: [
        "One CASE arm lost its ELSE 0",
        "A new status value appeared with no CASE arm covering it",
        "ORDER BY was added",
        "The join to customers was removed",
      ],
      answer: 1,
      why: "The reconciliation identity holds only when the CASE arms PARTITION the status domain. A new status (say a 'held' workflow state) falls through every arm — SUM(CASE …) over an unmatched arm adds 0, so those tickets vanish from all four columns while COUNT(*) keeps growing. Exhaustive arms (or an explicit ELSE bucket) keep the identity true by construction.",
      notes: [
        { choice: 0, why: "A missing ELSE yields NULL for that arm, and SUM over NULL contributions still sums the matched rows — the identity breaks only when ROWS fall through, not when arms lack ELSE on empty matches. The real vector is coverage, not cosmetics." },
        { choice: 2, why: "ORDER BY changes presentation, never the fold. The identity is about aggregation coverage — which is why the audit runs the sum check every morning." },
      ],
      difficulty: "hard",
    },
    {
      id: "chipotle-mcq-30",
      prompt: "A deep-dive wants tickets placed ABOVE their market's average ticket. The correlated version runs fine on 103 rows. What is the set-based rewrite, and why does it matter?",
      choices: [
        "Move the subquery into WHERE — it is already set-based",
        "Join to a derived table of per-market averages (or use AVG(total) OVER (PARTITION BY region)) so the average computes once per market, not once per ticket",
        "Replace the average with the maximum",
        "Add LIMIT so the correlated version runs less often",
      ],
      answer: 1,
      why: "A correlated subquery re-evaluates per outer row — 103 executions here, millions at production scale. The join-to-CTE (or the window AVG OVER PARTITION BY) computes each market's average once and lets the comparison ride along — same answer, one scan. The interview move is naming the trade: correlated for clarity on small data, set-based for the tables the real kitchen runs on.",
      notes: [
        { choice: 0, why: "The correlated subquery already sits in WHERE — 'moving' it changes nothing. The restructure is staging the per-market fold so it exists once." },
        { choice: 2, why: "MAX changes the question entirely — above-average and above-max are different populations. Scaling problems get architectural answers, not different metrics." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-chipotle-1",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The make-line census by market",
      brief:
        "Kitchen-ops memo, Chipotle-flavored on the storefront db: the 09:15 huddle opens with the make-line census — one row per market, every ticket classified by line stage: served & closed ({emerald:delivered}), staged on the pass ({sky:shipped}), queued at the line ({amber:pending}), 86'd ({rose:cancelled}) — and the four stage columns must reconcile to the ticket count by construction. Probed fold: EU runs 45 tickets as 24/12/6/3 at a 335.32 average ticket; APAC 37 as 21/8/5/3 at 313.66; US 19 as 5/10/3/1 at 383.48 — the only market where more tickets sit staged than served, a digital-shelf backlog; LATAM 2 as 2/2/0/0 at 426.22. Ops reads biggest market first, and the money column carries 2 decimals to match the deck.",
      ask: "Return each market with its ticket count, the four stage counts and the average ticket to 2 decimals — biggest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS tickets,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS served,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS staged,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS queued,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS voided,\n       ROUND(AVG(o.total), {3}) AS avg_ticket\nFROM orders o\nJOIN customers c ON {4}\nGROUP BY {5}\nORDER BY tickets DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the served literal",
          why: "Served & closed is status 'delivered' — 24 in EU, 21 APAC, 5 US, 2 LATAM. 'shipped' duplicates the staged column beside it and 'cancelled' invents an 86 spike; either way the census stops describing the line it claims to count.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queued literal",
          why: "Queued at the line is status 'pending' — 6 EU, 5 APAC, 3 US, 0 LATAM. 'shipped' would print the staged counts into the queued column (12/8/10/0) and the huddle would read a backlog that lives on a different stage of the line.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "The deck quotes 335.32, 313.66, 383.48, 426.22 — 2-decimal money. ROUND(…, 1) prints 335.3 and the board stops reconciling with every other money cell in the deck; the census must match the finance read to the cent.",
        },
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the market stitch",
          why: "Tickets reference their member by customer_id, so the stitch is c.id = o.customer_id. Join on o.customer_id = o.id and tickets pair with whatever member shares their row id — the fold becomes a coincidence and every market number is wrong with no error.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market key",
          why: "The census is one row per market, so the fold key is c.region — four rows: EU 45, APAC 37, US 19, LATAM 2. GROUP BY o.status re-groups by line stage instead: four rows about the wrong thing, and no market appears anywhere.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "o.customer_id = o.id", "o.status", "0"],
      walkthrough:
        "One scan, four CASE arms, two grains of truth. The stitch attaches every ticket to its market — c.id = o.customer_id — and GROUP BY c.region folds 103 tickets into four rows; each SUM(CASE …) branch counts one line stage, so EU's 24 served + 12 staged + 6 queued + 3 voided reconciles to 45 by construction (APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2+0+0+0 = 2). The money column folds ROUND(AVG(o.total), 2): 335.32 / 313.66 / 383.48 / 426.22 — deck precision, matching the probed regional census. The read: the US board runs backwards, 10 staged against 5 served — a digital-shelf backlog, not a demand problem — while LATAM's two tickets both closed. The distractors each break differently: 'shipped' in the served slot duplicates the staged column; 'cancelled' invents an 86 spike on every row; o.customer_id = o.id stitches tickets to whatever member shares their row id; o.status in the market key re-groups by stage — four rows, zero markets; 0 in the precision slot truncates the money column off the deck's 2-decimal standard. One query, four reconciling stages, one backlog flag — the census the whole huddle hangs from.",
    },
    {
      id: "cs-chipotle-2",
      tier: "hard",
      topic: "t5",
      universe: "catalog",
      title: "The menu velocity ladder",
      brief:
        "Prep-lead memo, Chipotle-flavored on the storefront db: pars get reset against the velocity ladder — portions pulled per menu SKU, busiest first, cut at the top **7** so the walk-through fits the huddle board. Probed fold: the Desk Mat Extended pan leads at **47** portions pulled against a 260-unit par (213 of cover), Noise-Canceling Headset 46 against 60 — **14** of cover, the thinnest pan on the line — HDMI 2.1 Cable 38, then the tie: Wireless Mouse M3 and Laptop Stand Aluminum both at **36**, sharing rung 4. Running Socks 33 lands on rung 6 and 4K Webcam Pro 31 closes the cut on rung 7 — under RANK semantics, because the prep calendar needs the gaps: the 33-portion pan is *sixth busiest, not fifth-tied*.",
      ask: "Return the top 7 SKUs by portions pulled with prep par, cover and shared-rung rank — busiest first.",
      template:
        "WITH pulls AS (\n  SELECT p.name AS item,\n         p.stock AS prep_par,\n         SUM({1}) AS portions\n  FROM order_items oi\n  JOIN products p ON oi.product_id = {2}\n  GROUP BY p.id\n)\nSELECT item,\n       prep_par,\n       portions,\n       prep_par - portions AS prep_cover,\n       {3}() OVER (ORDER BY portions {4}) AS velocity_rank\nFROM pulls\nORDER BY velocity_rank\nLIMIT {5};",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the portion fold",
          why: "Portions pulled is SUM(oi.quantity) — 47 for the lead pan, 46 for the Headset. SUM(1) counts build lines instead of portions and SUM(p.price) folds catalog dollars onto a portion column: different questions wearing the same column name.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the menu stitch",
          why: "Build lines reference the menu by product_id, so the stitch is oi.product_id = p.id. Stitch on oi.product_id = oi.id and lines pair with whatever SKU shares their row id — the ladder folds on coincidence and every rank is wrong with no error.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung rank",
          why: "The prep calendar reads gaps: the 36-tie shares rung 4 and Running Socks lands on rung 6 — sixth busiest. DENSE_RANK prints 5 there and re-sequences the huddle; ROW_NUMBER splits the tie 4/5 and silently crowns a 'busiest' pan the data never chose.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "A velocity ladder reads busiest on top: 47, 46, 38, then the 36-tie. ASC would open the huddle on the slowest pan — a correct query aimed at the wrong end of the board, and the pars get set from the tail instead of the head.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the ladder cut",
          why: "The huddle board fits seven rungs — and the correct fill's own output carries the gate: the 7th row's rank cell reads 7 (4K Webcam Pro, 31 portions). LIMIT 5 cuts inside the story — it drops Socks and the Webcam and erases the gap-vs-dense teaching point the board exists to show.",
        },
      ],
      distractors: ["p.price", "oi.id", "1", "DENSE_RANK", "ROW_NUMBER", "5"],
      walkthrough:
        "A ladder is a stitch, a fold, a rank and a cut. The CTE stitches build lines to the menu on oi.product_id = p.id and folds SUM(oi.quantity) into portions per SKU — 47 for the Desk Mat Extended pan, 46 for the Headset, 38 for the HDMI cable — because quantity is portions, while SUM(1) counts build lines and SUM(p.price) folds catalog dollars onto a portion column. The rank window orders portions DESC and the tie does the teaching: two pans at 36 portions share rung 4, Running Socks at 33 lands on rung 6 — the gap RANK leaves — and DENSE_RANK would print 5 there, quietly re-sequencing the prep huddle, while ROW_NUMBER would split the tie 4/5 and crown a 'busiest' pan the data never chose. The cut is LIMIT 7 — the board's own seventh rung (4K Webcam Pro, 31 portions, rank 7) carries the gate — and prep_cover reads par minus pulls: 213 of cover on the leader against **14** on the Headset, the pan the morning prep call is really about. Stitch on id, fold on quantity, rank with gaps, cut at seven — *the ladder the pars hang from*.",
    },
    {
      id: "cs-chipotle-3",
      tier: "medium",
      topic: "j7",
      universe: "inventory",
      title: "The thin-pan reorder list",
      brief:
        "Prep-huddle memo, Chipotle-flavored on the storefront db: prep par lives on the menu matrix (products.stock) and portions pulled live on the build lines (order_items.quantity), so remaining cover is a join, a fold and a subtraction — par minus pulls per SKU. Probed fold: the thinnest pans going into the dinner push are Noise-Canceling Headset at 14 of cover (60 par, 46 pulled), Studio Desktop Mic at 15 (45 par, 30 pulled) and Smart Watch S at 17 (40 par, 23 pulled) — everything else holds 39 or more. The memo cuts at 20 units of cover, thinnest pan first.",
      ask: "Return pan name, prep par, portions pulled and remaining cover for every pan with 20 or fewer units of cover — thinnest first.",
      template:
        "SELECT p.name AS pan,\n       p.stock AS prep_par,\n       {1}(oi.quantity) AS portions,\n       p.stock - SUM(oi.quantity) AS prep_cover\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\n{2} p.stock - SUM(oi.quantity) <= {3}\nORDER BY prep_cover {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the portion fold",
          why: "Portions pulled is SUM(oi.quantity) — 46 for the Headset pan, 30 for the Mic. COUNT counts build lines, not portions: a pan pulled as three 4-portion lines would read 3, and cover would be fiction.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the cover gate",
          why: "The 20-cover cut judges a per-pan fold that only exists after GROUP BY, so it lives in HAVING. WHERE p.stock - SUM(…) is a syntax error — aggregates cannot be judged before the rows are folded.",
        },
        {
          answer: "20",
          kind: "number",
          label: "the cover threshold",
          noVerify: true,
          why: "The memo's cut keeps exactly the three thin pans — 14, 15 and 17 — and the next healthiest pan holds 39 of cover, so 20 is a clean gate. Raise it to 39 and the 4K Webcam (39 of cover) sneaks onto a list prep did not ask for.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the thinnest-first direction",
          why: "The reorder list reads thinnest on top: 14, 15, 17. DESC would open the huddle on the healthiest pan and prep would spend the meeting reading the list upside down — direction is the difference between a fire list and a victory lap.",
        },
      ],
      distractors: ["COUNT", "WHERE", "DESC", "39"],
      walkthrough:
        "A stitch, a fold, a gate, a direction. The join attaches build lines to their pan (oi.product_id = p.id), GROUP BY p.id folds portions per SKU, and cover is the subtraction the prep sheet runs all day: par minus pulls. The gate is group-level — HAVING p.stock - SUM(oi.quantity) <= 20 — and it keeps exactly three pans: the Headset at 14 (60 par, 46 pulled), the Mic at 15, the Smart Watch at 17. SUM is the only honest fold here: quantity is portions, so COUNT would turn the column into build-line counts and cover would quietly overstate. The cut cannot live in WHERE — no folds exist at row-filter time, and the engine rejects it on sight. ASC puts the fire at the top of the list, because the huddle reads line one first and the 14-cover pan is where tonight's 86 risk actually lives. Raise the gate to 39 and the healthy Webcam walks onto a list meant for thin pans — thresholds are business policy, and this one is 20.",
    },
    {
      id: "cs-chipotle-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass huddle board",
      brief:
        "Kitchen-ops memo, Chipotle-flavored on the storefront db: the 09:15 board is ONE scan — served, staged, queued, 86'd and the average ticket, all from the orders table in a single pass — because four sequential queries are four chances to drift out of reconciliation. Probed fold: served 52, staged 30, queued 14, voided 7 (the four branches reconcile to 103 by construction) and the average ticket reads 338.19. FILTER (WHERE …) counts each stage per aggregate; the board ships before the huddle starts.",
      ask: "Return one row: the four line-stage counts plus the average ticket to 2 decimals, built in a single pass.",
      template:
        "SELECT COUNT(*) FILTER (WHERE status = {1}) AS served,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS staged,\n       COUNT(*) FILTER (WHERE status = {2}) AS queued,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS voided,\n       ROUND(AVG(total), {3}) AS avg_ticket\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the served literal",
          why: "Served & closed is status 'delivered' — 52 tickets. 'shipped' duplicates the staged column beside it (30 into both) and the board's reconciliation identity breaks before the huddle starts.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queued literal",
          why: "Queued at the line is status 'pending' — 14 tickets. 'cancelled' prints the 86 count (7) into the queued column and the board misreads a lost-demand problem as a line backup.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "The board quotes 338.19 — 2-decimal money, matching the finance read. ROUND(…, 1) prints 338.2 and the huddle's ticket figure stops reconciling with every other money cell in the deck.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "1"],
      walkthrough:
        "One scan, four branches, one identity. FILTER (WHERE …) attaches a private row filter to each aggregate, so the board is a single pass over orders: served 52 ('delivered'), staged 30 ('shipped'), queued 14 ('pending'), voided 7 ('cancelled') — and 52 + 30 + 14 + 7 = 103 by construction, the identity that makes the board trustworthy. The average rides the same scan: ROUND(AVG(total), 2) = 338.19, deck precision. The literals are load-bearing: 'shipped' in the served slot folds 30 into both columns and the census double-counts a stage; 'cancelled' in the queued slot turns the 86 count into a phantom backup; 1 decimal drifts the money cell off the finance standard. The FILTER shape beats four sequential queries not on speed but on honesty — one scan cannot drift out of reconciliation with itself, and the huddle opens on numbers that were born agreeing.",
    },
    {
      id: "cs-chipotle-5",
      tier: "hard",
      topic: "q5",
      universe: "month-close",
      title: "The settlement latency ledger",
      brief:
        "Month-close memo, Chipotle-flavored on the storefront db: 22 ingredient statements settled as 27 remittance rows, and the money question is HOW LONG each took — placement to first settlement — because latency is the avocado contract's negotiation lever. Probed fold: first-remittance latency runs 13 to 84 days; exactly three statements cross the 30-day line — INV-2024-017 at 84 days (1,418.00), INV-2024-023 at 55 (3,076.00) and INV-2024-022 at 40 (4,459.00, settled as two splits 15 days apart, so the ledger must read the FIRST remittance). The memo keeps the 30-day-and-worse tail, slowest first.",
      ask: "Return statement number, billed dollars and days to first settlement for every settlement at 30 days or slower — slowest first.",
      template:
        "SELECT settled.number,\n       settled.billed_cents / 100.0 AS billed_dollars,\n       settled.days_to_settle\nFROM (\n  SELECT i.number,\n         i.amount_cents AS billed_cents,\n         CAST({1}(julianday(p.paid_on)) - julianday(i.issued_on) AS INT) AS days_to_settle\n  FROM invoices i\n  JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n) settled\nWHERE settled.days_to_settle >= {2}\nORDER BY settled.days_to_settle {3};",
      slots: [
        {
          answer: "MIN",
          kind: "keyword",
          label: "the first-remittance fold",
          why: "The lever is time-to-FIRST money, so the fold is MIN(paid_on). MAX reads the LAST split and silently re-ages split-settled INV-2024-022 from 40 to 55 days — the negotiation memo would accuse a vendor of 15 days it did not actually take.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the tail gate",
          noVerify: true,
          why: "The memo keeps the 30-day-and-worse tail — exactly three statements (84, 55, 40 days). Cut at 21 and fast payers crowd the list; the lever is the tail, not the middle of the book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The negotiation read leads with the worst actor: 84 days, then 55, then 40. ASC would open on the fastest settlement and the meeting would end before the leverage appeared.",
        },
      ],
      distractors: ["MAX", "COUNT", "21", "ASC"],
      walkthrough:
        "Stage the grain, then filter it. The derived table folds 27 remittance rows to 22 statements — GROUP BY i.id, with the latency computed as julianday(first paid_on) minus julianday(issued_on), cast to whole days. MIN is the whole point: INV-2024-022 settled as two splits 15 days apart, so MAX would re-age it from 40 to 55 days and the avocado memo would quote a debt the vendor never owed. The outer query filters the staged grain — days_to_settle >= 30 keeps exactly the tail: INV-2024-017 at 84, INV-2024-023 at 55, INV-2024-022 at 40 — and orders it slowest first, because the negotiation opens on the worst actor. COUNT as the fold turns dates into row counts (1 or 2), the latencies collapse into single digits and the tail empties; the 30-day gate is what makes this a tail memo instead of a full-book dump. Stage first, fold honestly, filter outside — the derived table exists so the WHERE can judge a fold that would otherwise not exist yet.",
    },
    {
      id: "cs-chipotle-6",
      tier: "medium",
      topic: "t3",
      universe: "funnel",
      title: "The pass-aging histogram",
      brief:
        "Digital-line memo, Chipotle-flavored on the storefront db: pass aging is JULIANDAY(shipped_at) minus JULIANDAY(created_at) over the 82 tickets that carry a shelf stamp, and the line board wants it as a histogram — tickets per day-bucket with the average ticket riding along. Probed fold: the 82 stamped tickets land 2/3/4 days at 27/30/25 tickets, averaging 292.06, 391.23 and 317.82 per bucket — the 3-day bucket is both the biggest and the priciest, so shelf congestion and ticket size move together. The board keeps buckets carrying 25 or more tickets and reads fast-to-slow.",
      ask: "Return days-to-pass, ticket count and average ticket to 2 decimals for every aging bucket with 25 or more tickets — fastest first.",
      template:
        "SELECT CAST(JULIANDAY(shipped_at) - JULIANDAY(created_at) AS INT) AS days_to_pass,\n       COUNT(*) AS tickets,\n       ROUND(AVG(total), {1}) AS avg_ticket\nFROM orders\nWHERE shipped_at IS NOT NULL\nGROUP BY days_to_pass\nHAVING COUNT(*) >= {2}\nORDER BY days_to_pass {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "The board quotes 292.06 / 391.23 / 317.82 — 2-decimal money. One decimal prints 292.1 and the histogram stops reconciling with the 338.19 fleet average quoted on the same slide.",
        },
        {
          answer: "25",
          kind: "number",
          label: "the bucket floor",
          why: "HAVING COUNT(*) >= 25 keeps all three buckets — 27, 30 and 25 tickets, the 25 row proving the gate is live. The floor judges a per-bucket aggregate, which is why it lives in HAVING; WHERE cannot see a fold that has not happened.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the fastest-first direction",
          why: "Aging reads fast to slow: 2 days, 3, 4 — the board watches the tail grow to the right. DESC would open on the worst bucket and the trend would read backwards against every other line chart on the board.",
        },
      ],
      distractors: ["ROUND", "27", "DESC", "30"],
      walkthrough:
        "A histogram is a fold with a name. The population sentence comes first: WHERE shipped_at IS NOT NULL keeps the 82 tickets that reached the pass — the 21 unstamped tickets have no latency to bucket, and AVG would silently skip them anyway, so the filter makes the shrink visible instead of hidden. JULIANDAY arithmetic yields fractional days, CAST to INT folds them into 2/3/4-day buckets holding 27, 30 and 25 tickets. The money column rides along: 292.06, 391.23, 317.82 — the 3-day bucket is the congestion-and-spend peak, the row the digital-line standup actually discusses. The gate is group-level: HAVING COUNT(*) >= 25 keeps every bucket here while proving the clause works — raise it to 27 and the 4-day tail vanishes from the board, and a shrinking tail is exactly what a line wants to hide by accident. ASC reads the histogram left to right the way the clock runs.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "The promise-clock read: tickets promised within the window versus late ones, ranked — the delivery-promise share Chipotle tracks as the digital make-line's SLA, computed with a CTE and a window fold." },
    { slug: "immediate-food-delivery-i", why: "The immediate-share fold: what fraction of tickets hit the fast path, per day — conditional aggregation with the denominator stated, the same shape as the digital-mix read ops opens every review with." },
    { slug: "percentage-of-users-attended-a-contest", why: "Rewards redemption share: members who redeemed out of all members, distinct-counted with the base named — the weekly rewards pulse that decides the next promo push." },
    { slug: "trial-to-paid-funnel", why: "The rewards funnel: signup to first ticket to repeat visit, stage by stage as conditional counts — the enrollment-to-redemption walk that growth reads every Monday." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — tickets placed AND members active per month — the chart kitchen ops opens every review with; this problem is that chart at practice scale." },
    { slug: "daily-leads-and-partners", why: "Tickets and distinct members side by side, per market and day — the two-grain drill behind the EU 45-from-8 versus US 19-from-2 census row." },
    { slug: "combine-two-tables", why: "Members LEFT JOINed to tickets: the whitespace read. A member with no ticket is a dormant rewards account, a ticket with no member is corruption — choosing the join type is the business statement." },
    { slug: "customers-who-never-order", why: "The anti-join reflex, twice: on tickets it returns a confident zero (every member has ordered — prove it), and in billing the same shape catches the 6 statements with no settlement worth 15,217.00." },
    { slug: "rank-scores", why: "The velocity ladder with guaranteed ties — two pans at 36 portions pulled on this db. Shared rungs versus gaps is a prep-calendar policy this problem forces you to state." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each member's usual build — the argmax behind the app's reorder prompt, tie-proofed at person grain so 'the usual' never silently picks a row." },
    { slug: "weather-type-in-each-country", why: "Stage banding per market: served, staged, queued, 86'd classified by CASE with exhaustive ordered arms — the same shape as the make-line census, where a hole in the CASE is a hole in the board." },
    { slug: "active-businesses", why: "One-pass censuses: all four line stages plus average ticket in a single scan whose branches must reconcile to COUNT(*) = 103. Four sequential queries drift; one pass cannot." },
    { slug: "find-customer-referee", why: "NULL-safe roster filters: referred-by is NULL until a member refers a friend, and WHERE referred_by != X silently drops them — the exact NULL-filter drift the queued-ticket population punishes." },
    { slug: "books-with-null-ratings", why: "COUNT(column) versus COUNT(*) on rows with missing values — the drill behind the pass-stamp census, where COUNT(shipped_at) = 82 and COUNT(*) = 103 and the 21-row gap IS the story." },
    { slug: "bank-account-summary-ii", why: "The settlement rollup: per-account folds with cents-safe arithmetic. INTEGER cents and the /100.0 rule make this exact practice for the ingredient-settlement true-ups." },
    { slug: "restaurant-growth", why: "The rolling 7-day average ticket over the 2024-01..2025-02 spine — the line-trend read the kitchen manages to, computed with a moving window that has to survive the 1,193.86 July trough." },
    { slug: "recyclable-and-low-fat-products", why: "Two-flag menu filtering: low-fat AND recyclable is the prep sheet's 'which pans qualify' read — multi-predicate WHERE with an explicit AND, the warm-up before every conditional census." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivot of ticket volume — the staffing curve the make-line schedule hangs from. CASE columns in, line-coverage chart out, one scan." },
    { slug: "second-highest-salary", why: "Second-busiest pan on a tie-heavy ladder — the OFFSET reflex breaks exactly where two pans tie at 36 portions. MAX-below-MAX or DENSE_RANK is the tie-proof answer." },
    { slug: "department-highest-salary", why: "Busiest pan per menu section — the argmax-within-group drill, with the join-back for names. Composition under a business rule, the way prep asks it." },
    { slug: "group-sold-products-by-the-date", why: "Per-day build listings folded into one cell — the daily line summary the closing shift reads. GROUP BY date with a string fold, ordered deterministically." },
    { slug: "top-travellers", why: "Per-member portion totals, ranked — the heavy-user read behind the rewards leaderboard. SUM at person grain after a fan-out join, ordered and named." },
    { slug: "count-student-number-in-departments", why: "Zero-fill census: markets with no tickets must still print 0. LEFT JOIN from the dimension side with IS NULL — the empty-bucket honesty the line board lives by." },
    { slug: "consecutive-numbers", why: "Same-status streak detection — a stage holding through consecutive cycles is a line-speed story. The row-number-difference trick at its simplest." },
    { slug: "customer-order-frequency", why: "Members ordering twice-plus in consecutive windows — the rewards-cadence read. Conditional counting per cycle with the population stated, growth's Monday query." },
    { slug: "big-countries", why: "Multi-predicate roster filters with an OR that actually matters — the tickets-or-spend shape. Where a parenless OR quietly changes who stays on the board." },
    { slug: "not-boring-movies", why: "Parity plus content filters on one scan — the board's 'odd lines, non-trivial builds' read. Cheap-looking predicates that still need the population named." },
    { slug: "average-selling-price", why: "Weighted price per SKU from build lines: SUM(price × qty) / SUM(qty) — the exactly-once denominator discipline that keeps menu economics honest." },
    { slug: "market-analysis-i", why: "Buyers in one window who never returned in the next — the new-versus-lapsed membership split. Set membership with an anti-join twist, the rewards story in one query." },
    { slug: "rising-temperature", why: "Consecutive-day demand up — the day-over-day line-trend read. Self-join or LAG on date arithmetic, the same shape prep uses for pull-rate acceleration." },
    { slug: "immediate-food-delivery-iii", why: "The promise-share walk across the whole calendar — immediate share per first-day and beyond, windowed. The SLA trend behind the digital make-line's standing review." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Window-bounded funnel: tickets and members inside a half-open range. The period-filter discipline the 30-day ops review assumes — boundaries stated, not assumed." },
  ],
};
