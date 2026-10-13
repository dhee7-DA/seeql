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
    "Preparation strategy: the pools file carries no Chipotle section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: funnel counts with stated denominators, two-grain market censuses, tie-heavy velocity ladders, CASE stage pivots and the cents-safe settlement spine. Do the topics in order, then run both case files on the live db: one rebuilds the {emerald:make-line census} kitchen ops opens every morning, the other rebuilds the {sky:menu velocity ladder} prep leads set pars from. The bar to clear: *state the population and the denominator before you compute anything* — then make every stage census reconcile to 103 by construction.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Tickets and members are different grains of the same join, and every census here reports both: EU runs 45 tickets from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Build lines — the fan-out join",
      why: "One ticket fans into build lines — 103 tickets into 251 lines — and every count changes grain the moment you join order_items. Chipotle drills this first because the fan-out is where a candidate's COUNT stops meaning what they think: portions pulled and tickets served are different numbers wearing the same query shape.",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "The velocity ladder & the rank trio",
      why: "Prep reporting is leaderboard reporting: SKUs by portions pulled, markets by ticket value. The ladder ties constantly — two pans at 36 portions, three at 30, three at 21 on this db — and ROW_NUMBER, RANK and DENSE_RANK differ exactly there. The prep calendar needs the gaps, so the tie policy is a sentence you say out loud before you type.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Menu argmax & the usual order",
      why: "Prep sets par per SKU and the app merchandises per member — both are argmax problems. The most-pulled pan per daypart, each member's usual build: RANK or ROW_NUMBER over a per-group fold, with a tie-breaker named, because 'the usual' that silently picks an arbitrary row erodes trust in the whole recommendation.",
      slugs: ["most-frequently-ordered-product-per-customer", "product-sales-analysis-ii", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "CASE banding & the stage pivot",
      why: "The morning board is a CASE pivot: one row per market, one column per line stage, four arms that must be exhaustive or the census stops reconciling to 103. Arms get reordered and a stage silently vanishes; a hole in the CASE is a hole in the line board. Tier bands (budget 8 SKUs averaging 32.06 against mid 8 at 111.50) are the same discipline at menu grain.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month spines & rolling line reads",
      why: "The 14-month ticket spine (2024-01 to 2025-02) is the ops review's home turf — 3,731.97 opening, 1,193.86 July trough — and the kitchen thinks in rolling windows: 7-day average ticket, week-over-week 86 counts. LAG drives the walk, rolling frames drive the line trend, and the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "restaurant-growth", "biggest-window-between-events"],
    },
    {
      name: "One-pass censuses for the huddle board",
      why: "The line board ships as ONE scan: served, staged, queued, 86'd plus average ticket, four branches reconciling to COUNT(*). FILTER (WHERE …) and SUM(CASE …) build it in a single pass; four sequential queries are four chances to drift out of reconciliation before the 9:15 huddle.",
      slugs: ["active-businesses", "ratings-histogram", "create-a-session-bar-chart"],
    },
    {
      name: "NULLs & the honest dead-end",
      why: "The 14 queued tickets carry no pass stamp, and `created_at` is date-only — so latency pools exclude them by definition and the daypart split cannot be computed at all. Screens here drill NULL-safe filters, COUNT(column) versus COUNT(*), and the answer that wins the room: naming what the schema cannot say instead of coalescing a zero over it.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "confirmation-rate"],
    },
    {
      name: "Settlement cents & the anti-join reflex",
      why: "Served is not settled — the billing tables (28 invoices, 27 payments, INTEGER cents) are where the kitchen meets money, and every dollar read divides by 100.0 exactly once. The exposure read is an anti-join: 6 statements with no settlement = 15,217.00, one of them marked paid — a status filter misses it, an anti-join doesn't.",
      slugs: ["customers-who-never-order", "bank-account-summary-ii", "number-of-accounts-that-did-not-stream"],
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
  ],
};
