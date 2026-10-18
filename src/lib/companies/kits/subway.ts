// Subway — Wave-8 (Task 96), food domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Franchise SQL: the storefront db read as a franchise-system sandbox — customers are
// franchise units (owner-operator plus city, region = territory), orders are weekly
// purchase orders each unit routes through the purchasing co-op (delivered = received
// in full at the unit, shipped = on the truck with shipped_at as the truck-departure
// stamp, pending = staged at the DC awaiting a route slot, cancelled = refused at the
// door), order_items are the PO lines in cases. Suppliers are the six approved co-op
// vendors; invoices are the royalty and ad-fund bills to franchisees and payments their
// remittances — both INTEGER cents, so the dollar read is `amount_cents / 100.0`.
// Pool provenance: company-pools.md carries NO Subway section (0 tagged rows), so all
// 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu and say so. Case briefs quote probed figures from scripts/company-facts.md
// (probed 2026-10-12); every case slot is mechanically verified against db/custom.db
// by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const subwayKit: CompanyKit = {
  id: "subway",
  domainId: "food",
  name: "Subway",
  tagline: "Sandwich units, franchises and foot-long economics",
  accent: "text-emerald-300",

  brief: [
    "**Subway** is the sandwich franchise that scaled owner-operators into one of the largest quick-service systems on earth — every restaurant a franchised unit running the standardized Subway Series menu, every ticket a footlong-versus-6-inch mix decision. The money runs through three pipes: the franchise fee that opens a unit, the *royalty and ad-fund invoices* billed every cycle, and the purchasing co-op that pools every unit's buying power. This kit maps the storefront db onto that world: the 16 customers rows are franchise units (owner-operator plus city), the 103 orders are weekly purchase orders routed through the co-op worth **34,833.28**, and the 251 order_items rows are PO lines in cases. The status map is fixed: delivered = {emerald:received in full} (52, 50.5%), shipped = {sky:on the truck} (30, 29.1%), pending = staged at the distribution center awaiting a route slot (14), cancelled = {rose:refused at the door} (7, 6.8%).",
    "The data org splits into franchise ops, the supply-chain pod and a small royalty-finance desk, and all three read the same spine at different grains. Supply lives on two boards: the vendor board, where six approved co-op vendors carry the whole catalog and the top one alone routes **32%** of purchase revenue (11,130.25), and the lead-time clock, where `shipped_at` is the truck-departure stamp carried by 82 of 103 POs and the DC-to-unit norm is **2.98 days** on a 2–4 day spread. Franchise ops watches concentration the franchisor style: **63.5%** of the book sits with units whose lifetime purchases cross 3,000 (71.2% above 2,000) — *one dark unit moves a territory*.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain unit census** — EU runs 45 POs from just 8 units while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator question out loud (*'do refused POs belong in your fill rate?'*), then into the franchisee leaderboard where four units sit tied at 4 POs each and rank semantics become a business decision. Late rounds walk the {sky:14-month PO spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or open the royalty ledger where every dollar read is `amount_cents / 100.0`. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Subway section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's screen shapes: two-grain territory censuses, received-versus-refused demand splits, tie-heavy unit leaderboards, SKU band cuts and the cents-safe royalty spine. This expanded kit is built for spaced practice rather than one sitting: **six case studies** now span the asks Subway data candidates rehearse most — the {emerald:co-op vendor audit} supply reviews open with, the {sky:royalty coverage census} finance reads at every close, the territory intensity read behind the concentration debate, the paid-with-nothing-remitted fraud audit, the SKU band census and the heavy-cycle spine. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the co-op order board. A supply analyst opens the PO dashboard before standup: did overnight orders land, is any unit waiting on a truck that never got a `shipped_at` stamp, does the one-pass status census reconcile — 52 received + 30 in transit + 14 staged + 7 refused = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If DC-to-unit lead time drifts off the **2.98-day** norm, the route queue gets pulled before the vendor read ships.",
    "**11:30 —** Midday is the concentration read. Procurement wants the vendor board re-cut — {rose:32% of purchase revenue} through one vendor is a negotiating position and a risk position at once; field ops wants the refusal map by territory (APAC 8.1%, EU 6.7%, US 5.3%) beside the two-grain census (EU 45 POs from 8 units, US 19 from 2); menu analytics asks whether the footlong-versus-6-inch program lines are pulling their weight against sides. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the denominator spelled out so the number survives the franchisee council argument*.",
    "**15:30 —** The afternoon tilts toward royalties. The AR anti-join refreshes first — **6 never-remitted invoices worth 15,217** — before finance sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero remittance rows (#28, 1,756.00). The day ends the way every close does: the co-op's trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Co-op fill rate", what: "POs received in full ÷ all POs placed: 52 of 103 (50.5%). The top-of-board number supply reads every Monday — the 14 staged rows are 'not yet routed', never a silent zero." },
    { name: "DC-to-unit lead time", what: "Truck-departure to door (created_at → shipped_at) over routed POs only: 2.98-day average, range 2–4, stamped on 82 of 103. The population ships with the number — staged and refused POs have no cycle yet and must not dilute it." },
    { name: "Refusal share", what: "Refused-at-door POs ÷ ALL POs placed, per territory: APAC 8.1%, EU 6.7%, US 5.3%. The refused rows stay inside the fold — filter them out first and every territory reads 0% or 100%." },
    { name: "Purchases per unit", what: "Co-op purchase value per franchise unit: 34,833.28 across 16 units, average 338.19 per PO against a 25.47 to 1,088.44 spread. The spread IS the tiering story — flagship builds and single-neighborhood kiosks order differently by design." },
    { name: "Unit intensity", what: "Two grains, one census: EU runs 45 POs from 8 units while the US runs 19 from 2. Load versus coverage — the gap between the columns decides whether growth is broadening or concentrating." },
    { name: "Vendor concentration", what: "Share of purchase revenue through the top co-op vendor: 11,130.25 routed (32%), with the second vendor at 26.7%. The number that staffs procurement and sizes the dual-sourcing debate." },
    { name: "Royalty coverage", what: "Remitted versus billed: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-remitted worth 15,217. The AR anti-join the royalty desk refreshes every close." },
    { name: "Close integrity", what: "The co-op's trial balance: 181,080 debits against 181,080 credits, delta zero. Settled books pay in 13 to 84 days (avg 28.4) against 30-day terms — the drift band finance quotes at every close." },
  ],

  topics: [
    {
      name: "Two-grain territory censuses",
      why: "Every Subway supply review opens with 'POs AND units per territory', and the trap is counting both at one grain: COUNT(*) counts PO rows, COUNT(DISTINCT customer_id) folds repeats back to units — EU reads 45 POs from 8 units that way. The gap between the columns is the intensity signal that drives route and staffing calls.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers", "top-travellers", "count-student-number-in-departments", "group-sold-products-by-the-date"],
    },
    {
      name: "Received vs refused demand",
      why: "The co-op's most-watched ratio is received ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. Drill it until putting the status filter in the wrong clause feels physically wrong — that filter move is the denominator-drift bug that ruins refusal maps.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "customer-order-frequency", "immediate-food-delivery-iii", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Unit joins & whitespace",
      why: "Units carry territory and city; POs inherit them through joins, and the join type decides who survives. A PO without a unit is corruption; a unit without POs is a dark store — though on this db the anti-join returns a confident zero (all 16 units order), and proving that zero is part of the audit.",
      slugs: ["combine-two-tables", "customers-who-never-order", "employee-bonus", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Franchisee leaderboards",
      why: "Leaderboards rank units by routed POs with guaranteed ties — four units sit at 4 POs each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer franchisees, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "nth-highest-salary"],
    },
    {
      name: "SKU bands with CASE",
      why: "The co-op catalog bands into budget (8 SKUs averaging 32.06) and mid (8 SKUs averaging 111.5) with nothing above 199.99 — the premium band is empty, and a CASE with holes quietly re-bands the replenishment sheet. Exhaustive, ordered arms are the whole exercise.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "average-selling-price"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month PO spine (2024-01 to 2025-02) is the franchise council's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and swing (+1,158.21 into August, -1,326.87 into November) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "monthly-transactions-i", "customers-with-strictly-increasing-purchases", "rising-temperature"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — received under refused, this cycle beside last — and EXCEPT answers 'which billed royalties never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "league-statistics", "market-analysis-i"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-unit PO value, then judge it against a computed network mean (338.19 here). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["second-highest-salary", "winning-candidate", "game-play-analysis-iv"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets received, in-transit, staged and refused in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["sales-by-day-of-the-week", "find-stores-with-inventory-imbalance", "calculate-orders-within-each-interval", "consecutive-numbers", "not-boring-movies", "big-countries"],
    },
    {
      name: "Royalty cents discipline",
      why: "Billed is not remitted — the royalty tables (28 invoices, 27 payments, INTEGER cents) are where the franchise world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "trial-balance-check"],
    },
  ],

  theory: [
    {
      id: "subway-t1",
      q: "Your unit report joins franchisees to purchase orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a PO column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A supply report joins POs to units: a PO with no unit row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dark-store report must be LEFT from units: the units with no POs ARE the answer, arriving with NULL PO columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload unit row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-ordering units, and proving that zero is itself the analyst's job: all 16 franchise units appear in the PO table somewhere.",
      tag: "joins",
    },
    {
      id: "subway-t2",
      q: "Four franchise units tie at 4 POs each on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose franchisee gets the co-op's field support first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer units (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "subway-t3",
      q: "The board shows 103 POs and 16 units; EU shows 45 POs and 8 units. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts PO rows after the join — one row per purchase order, so a unit with 24 POs contributes 24. COUNT(DISTINCT customer_id) folds those rows back to units — EU's 45 POs collapse to 8 franchisees. Neither is wrong: POs measure supply load and program momentum, units measure installed base and coverage. The two-grain pairing is the read the franchise council argues about: EU's demand is broad-based across 8 units while the US's 19 POs concentrate in 2. The trap that catches candidates is a third grain: join order_items for PO lines and COUNT(*) silently counts PO lines, not POs — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "subway-t4",
      q: "shipped_at is NULL until the truck departs the DC. What is your policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only routed POs have a lead time, so the report measures DC-to-door for the 82 of 103 POs that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL POs returns the routed-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the routed subset; the gap between it and COUNT(*) is exactly the 14 staged plus 7 refused rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day deliveries for trucks that never rolled. A report whose WHERE clause is doing definitional work without saying so is exactly what a Subway supply reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "subway-t5",
      q: "The franchise review wants routed purchase value per territory for territories carrying at least ten POs. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-transit, staged and refused rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-PO floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a territory line and an error, and between a threshold applied to POs versus to dollars. On this db the floor keeps the embedded big books — 45, 37 and 19 POs — and drops LATAM's 2-PO anecdote. The strong answer places every filter by asking: is this a fact about one PO, or about a territory?",
      tag: "pipeline",
    },
    {
      id: "subway-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 POs always produce a mean (338.19 on this db) to compare against. On filtered staging tables — one territory, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each PO to ITS unit's average) re-runs per outer row and answers a different question at a different cost — flagship-heavy territories make the two definitions diverge visibly. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "subway-t7",
      q: "The trend report buckets POs by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's orders, and franchisees batch their weekly POs exactly at period edges. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine that matters: the book opens at 3,731.97, troughs at 1,193.86 in July, and the deltas tell the year's story — the NULL edge row is where the walk starts, not a data gap.",
      tag: "dates",
    },
    {
      id: "subway-t8",
      q: "Finance says a royalty invoice is 'paid' but the remittance table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero remittance rows: a status that lies, which is why remittance rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a remittance row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-remitted, and the trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "subway-t9",
      q: "The ops board needs received, in-transit, staged and refused counts in one scan. How do FILTER and conditional SUM(CASE) differ, and which do you reach for here?",
      a: "Both build the one-pass census; they differ in grammar and portability. FILTER (WHERE …) is the dedicated form — COUNT(*) FILTER (WHERE status = 'delivered') — and the filter reads like the line it counts. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin, with the ELSE-0 discipline: drop it and an all-NULL arm prints NULL, which breaks the four-branches-reconcile-to-103 identity the board hangs from. On this db either shape prints 52 / 30 / 14 / 7, and the identity check — the four arms must sum to COUNT(*) = 103 — is what makes the board trustworthy. The habit being graded: one scan, four named branches, and the reconciliation written next to the query, not four sequential queries hoping to stay in agreement.",
      tag: "case-when",
    },
    {
      id: "subway-t10",
      q: "The co-op wants the fill rate per territory. How do you build a rate whose numerator and denominator you can both defend?",
      a: "Pin the definition first: received-in-full ÷ ALL POs placed — the 14 staged rows stay in the denominator because 'not yet routed' is exactly what the fill rate exists to watch. Mechanically, both counts come from the SAME rows: 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), grouped by territory — one scan, shared denominator, no drift between the halves. Multiply by 100.0 BEFORE the division so integer truncation never flattens APAC's 8.1% refusal share or the 50.5% fill rate into flat integers, and round once at the edge. If someone asks for 'fill rate among routed POs', that is a different fraction with a different denominator — 52 of 82 — and saying so out loud, rather than quietly switching bases, is the part the interviewer grades.",
      tag: "metrics",
    },
    {
      id: "subway-t11",
      q: "What does UNION ALL buy you when stacking the PO board over the royalty ledger — and when is the dedupe in UNION actually the bug?",
      a: "UNION ALL concatenates cheaply and honestly: territory board rows stacked over a ledger TOTAL row belong in one report precisely because no row duplicates another — deduping would be a bug looking for a victim. UNION adds a distinct pass that is only correct when duplicates are genuinely redundant — and the trap this kit drills is byte-identical rows across branches: two branches that both emit (territory, 45, 15089.23) with no branch label collapse into one, a territory silently vanishes, and nothing errors. The discipline: default to UNION ALL, add a comment stating WHY duplicates are impossible — the comment is the correctness argument — and reach for UNION only when you can name the duplicated rows you are paying to collapse. Both forms need matching column counts, compatible types, and names taken from the first branch.",
      tag: "set-ops",
    },
    {
      id: "subway-t12",
      q: "EXCEPT versus a LEFT JOIN … IS NULL anti-join — which do you reach for when hunting royalty invoices that never remitted, and why does it matter here?",
      a: "EXCEPT answers the set-level question — which billed invoice ids never appear in payments — in two clean SELECTs, deduplicating both sides first. The LEFT JOIN anti-join answers the row-level question: it carries the invoice number, cents and status alongside the NULL payload, which is what the dunning draft needs — and on this db it surfaces the 6 invoices worth 15,217.00, including #28, marked paid with zero remittance rows. The two error modes are mirrors: a status filter misses #28 because the label lies; a NOT IN over a subquery containing a NULL empties the whole list while looking valid. EXCEPT for set diffs across snapshots, the anti-join for row forensics, NOT EXISTS when the payload would trip over NULLs — naming which question you are answering is the skill.",
      tag: "set-ops",
    },
    {
      id: "subway-t13",
      q: "Field ops wants each unit's core SKU — the product it reorders most. Walk me through the argmax and what happens on ties.",
      a: "Three shapes, one tie policy. Window argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY SUM(quantity) DESC, product_id) = 1 inside a CTE — deterministic, one row per unit, but the second ORDER BY key is a policy decision someone signs. Join-back on the maximum: fold cases per unit-SKU, join back where cases = the unit's MAX — honest, and it returns BOTH SKUs on a tie, a feature for co-leader reports and noise for pick lists. Correlated filter: WHERE quantity = (SELECT MAX(…) for that unit) — same tie behavior, per-row re-evaluation cost. Franchise systems live on repeated behavior, so the argmax feeds reorder suggestions and field audits; a 'core SKU' that silently picks an arbitrary row when two tie erodes trust in the whole recommendation. Name the tie-breaker before you type; that sentence IS the answer.",
      tag: "windows",
    },
    {
      id: "subway-t14",
      q: "A CTE named routed_pos feeds three different boards. What does staging queries as WITH clauses buy a franchise-system analytics team?",
      a: "Three concrete buys. Readability: named steps — stamped_pos, lead_time_buckets, never_remitted — read like the supply process instead of a Russian-doll subquery, and each CTE is a checkpoint to SELECT from while debugging. Reuse: one fold written once feeds the vendor board, the lead-time memo and the fraud audit without three copies drifting — on this db the per-invoice settlement fold feeds the coverage census AND the anomaly list, and folding it twice is how those reports stop agreeing. Correctness under review: a CTE named routed_pos forces the definition (shipped_at IS NOT NULL, 82 of 103) to live where the reviewer can see it — franchise metrics get argued about at the franchisee council, and the definition that survives is the one written in the query. Filter early inside each stage; CTEs are logical staging, not guaranteed materialization.",
      tag: "ctes",
    },
    {
      id: "subway-t15",
      q: "Why is averaging the territory average PO values wrong, and what do you compute instead?",
      a: "Because it weights every territory equally regardless of size. On this db the territory averages read 335.32 (EU, 45 POs), 313.66 (APAC, 37), 383.48 (US, 19) and 426.22 (LATAM, 2) — averaging those four numbers gives 364.67, which describes a franchise system that does not exist. The true network average is SUM(total)/COUNT(*) over the base rows: 338.19, where LATAM's two POs barely register. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(aov * pos)/SUM(pos) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim to defend, not assume. Franchise councils argue about exactly this — whose units the 'network average' describes.",
      tag: "aggregation",
    },
    {
      id: "subway-t16",
      q: "Where do integer cents bite in the royalty tables, and what is your rounding policy for the close?",
      a: "Three bite points. Scale: invoices.amount_cents = 175600 is 1,756.00 dollars, and amount_cents / 100 is integer division — 1,756 flat, cents gone; divide by 100.0 exactly once, at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. Float drift: SQLite REALs are IEEE doubles, so compare money with a tolerance or keep it in integer cents until the last step. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the trial balance prove it — the co-op's ledger closes at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A remittance figure that survives that chain is a figure the franchisee council signs.",
      tag: "numbers",
    },
    {
      id: "subway-t17",
      q: "A candidate writes WHERE region = 'EU' OR region = 'US' instead of IN ('EU','US'). What is the real lesson about multi-predicate filters on this db?",
      a: "Both forms return the same 64 POs here, so the lesson is not correctness — it is extensibility and operator precedence. IN composes: adding APAC is one token, and the predicate reads as the territory list it is. OR chains grow teeth: append a third condition like total > 500 and parentheses become load-bearing, because AND binds tighter than OR — the classic bug is appending OR status = 'cancelled' to a territory filter and watching refused POs from every territory flood the report. NULL comparisons fail both branches of OR the same way they fail =, so NULL-region rows (none here, but staging tables differ) drop out either way. The interview bar: state what the predicate keeps, not just what it matches — multi-predicate filters are where 'same answer today' starts diverging under the next edit.",
      tag: "filters",
    },
    {
      id: "subway-t18",
      q: "The replenishment sheet bands the catalog into budget, mid and premium. How do you band in SQL, and what makes the banding trustworthy?",
      a: "CASE WHEN plus conditional aggregation: SELECT CASE WHEN price < 50 THEN 'budget' WHEN price < 200 THEN 'mid' ELSE 'premium' END AS band, COUNT(*), ROUND(AVG(price), 2) … GROUP BY band. Trustworthiness comes from exhaustive, ordered arms — the boundaries must partition the price domain or a hole silently re-bands SKUs into whichever arm catches them. And the honest read includes the empty band: on this db premium is empty (nothing prices at 200+), and GROUP BY prints only bands that own rows — 'premium' vanishing from the output IS the finding, stated in prose, not a zero the query pretends to print. The shared denominator is the quiet prize: band counts and averages come from one scan, so the sheet's bands cannot drift from each other the way four stitched queries do.",
      tag: "case-when",
    },
    {
      id: "subway-t19",
      q: "Why is DISTINCT a bug report on the PO-line join, and when is it legitimate?",
      a: "When it papers over a fan-out nobody diagnosed. Join orders to order_items and COUNT(*) reads 251, not 103 — SELECT DISTINCT order_id, total would produce sane-looking rows while the value SUM next to it stayed inflated 2.4x. The honest sequence: notice the DISTINCT, run the counts with and without it (103 versus 251 — the jump IS the fan-out), find the multiplicity, and fix the grain — aggregate lines to PO grain first, or count entities with COUNT(DISTINCT o.id). Legitimate DISTINCT exists: collapsing a dimension's value set (16 units, 4 territories, 6 vendors), COUNT(DISTINCT customer_id) in the two-grain census where folding repeat POs back to units IS the metric, or COUNT(DISTINCT p.id) reading catalog depth on the vendor board. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
    },
    {
      id: "subway-t20",
      q: "How do consecutive-cycle reads — a unit routing cases week after week, a PO status holding through a streak — work in SQL?",
      a: "Gaps-and-islands. ROW_NUMBER() OVER (ORDER BY cycle) minus ROW_NUMBER() OVER (PARTITION BY unit ORDER BY cycle) is constant inside a consecutive run, so GROUP BY that difference and COUNT(*) to get every streak — that is the whole trick. The LAG variant: compare each cycle to the previous, flag breaks, then SUM the flags to number the islands. Franchise flavor matters at the grain: units route WEEKLY POs, so the ordering key is the week or month bucket, and created_at is date-only on this db — day-level streak logic is fine, hour-level is fiction. Consecutive reads power the churn-risk list (a unit whose cadence gaps out), the bread-program retention pulse, and DC staging streaks. The interviewer listens for: partition key (unit), ordering key (cycle), the row-number difference, and the population sentence — streaks of WHAT, for WHOM, at WHAT grain.",
      tag: "windows",
    },
    {
      id: "subway-t21",
      q: "The month walk has a LAG column and a WHERE on it. Why does it error, and what is the staging pattern?",
      a: "Because windows run in the SELECT stage — after WHERE, after GROUP BY, after HAVING. WHERE LAG(value) OVER (…) IS NULL is a hard error: the window's output does not exist at filter time, and neither does an alias computed from it in the same SELECT. The staging pattern: put the fold and the window in a CTE or derived table (monthly AS (SELECT STRFTIME('%Y-%m', created_at) AS month, SUM(total) AS value FROM orders GROUP BY month)), then compose in the outer SELECT — LAG deltas, the NULL first row kept as 'baseline', thresholds applied outside. On this spine that discipline matters: the book opens at 3,731.97, troughs at 1,193.86 in July, and the +1,158.21 August swing only reads correctly when the baseline is the real prior month. The same stage logic explains why ORDER BY can use SELECT aliases but WHERE cannot — pipeline order meeting wishful thinking is half of all 'weird behavior' tickets.",
      tag: "pipeline",
    },
    {
      id: "subway-t22",
      q: "The franchisee ladder runs 24, 17, 14, 13, 5 POs, then FOUR units tied at 4. The council asks for the second-highest DISTINCT engagement level. Why is LIMIT 1 OFFSET 1 the wrong reflex, and what is the right shape?",
      a: "Because OFFSET answers 'second ROW', not 'second LEVEL'. Ordered descending, row two is the 17-PO unit — correct only because the top is untied; slide the question down to the tie block and OFFSET returns one arbitrary 4-PO unit while the business asked for a level. The tie-proof shapes: MAX-below-MAX (SELECT MAX(pos) WHERE pos < (SELECT MAX(pos)) — returns 17 regardless of duplicates), or DENSE_RANK = 2 in a window, which numbers DISTINCT levels and reads 2 for the second one no matter how many units share each rung. On a ladder with a four-way tie and two 3-PO units below it, RANK semantics put the next distinct count at rank 10 — five phantom positions — and the council's published policy is exactly the kind of thing you state out loud before you type.",
      tag: "windows",
    },
    {
      id: "subway-t23",
      q: "The AR sweep finds 6 royalty invoices with no remittance. What follow-up checks do you run before the dunning letters go out?",
      a: "Five, in order. Freshness: are these the same 6 as last close, or did the anti-join move — a remitted invoice dropping off the list is as interesting as a new one. The mirror anomaly: a void invoice WITH a remittance row (this db has one, #11 at 925.00) never appears in the anti-join, so run the flip side too. Label truth: #28 is marked paid with zero remittance rows (1,756.00) — the status column is a claim, remittance rows are the ledger of record, and the mismatch is its own finding. Volume: 15,217.00 exposure against the 34,833.28 co-op book — is the tail growing cycle over cycle? Reconciliation: the coverage split must still read 21 exact / 1 partial (4,000 of 6,148) / 6 none, and the trial balance must land at 181,080 against 181,080. The deliverable is the list plus the four numbers that prove nothing else moved.",
      tag: "quality",
    },
    {
      id: "subway-t24",
      q: "When does a report's honest answer have ZERO rows — and how do you defend an empty result in an interview?",
      a: "When the anti-join is the point. 'Units with no POs' on this db returns nothing — all 16 franchise units appear in orders — and the strong candidate proves the zero: run the LEFT JOIN … IS NULL shape, show COUNT(*) = 0, and state why (every seat in the system routes through the co-op). An unproven zero is indistinguishable from a broken join; a proven zero is a finding the whitespace report can ship. The same discipline guards the vendor audit: 'vendors with no routed revenue' returns zero because all six approved vendors carry sales — and proving THAT zero is the audit. Empty result sets get the same treatment as numbers: population, filter, and why the emptiness is or is not expected. The zeros that actually bite live elsewhere — 6 invoices with no remittance, 1 paid invoice with nothing behind it — and those are exactly where the anti-join reflex pays.",
      tag: "nulls",
    },
  ],

  mcqs: [
    {
      id: "subway-mcq-1",
      prompt: "A PO row's status reads 'delivered'. In this kit's Subway stage map, what happened?",
      choices: ["Received in full at the unit — counts as kept", "On the truck, not yet at the door", "Refused at the door", "Staged at the DC awaiting a route slot"],
      answer: 0,
      why: "The stage map is fixed: delivered = received in full (52 of 103 POs, 50.5%). It is the only status where the co-op's obligation to the unit is complete.",
      notes: [
        { choice: 1, why: "On-the-truck is 'shipped' — 30 POs moving with a truck-departure stamp but no door scan. Calling them received inflates the fill rate before a single case lands." },
        { choice: 3, why: "Staged is 'pending' — 14 POs allocated at the DC awaiting a route slot. Pending is not refused and not received; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-2",
      prompt: "Co-op fill rate is received-in-full ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 POs.",
      choices: ["All POs placed (52/103 = 50.5%)", "POs that left the DC (52/82)", "Received plus refused only, excluding the 14 staged", "Distinct units (52/16)"],
      answer: 0,
      why: "The house definition: received ÷ ALL POs placed — staged POs stay in the denominator because 'not yet routed' is exactly what the fill rate exists to watch. 50.5% is the honest read.",
      notes: [
        { choice: 1, why: "The 82 stamped POs are the latency population, not the fill-rate population — mixing the two metrics' denominators is the classic census blur this kit drills." },
        { choice: 2, why: "Dropping the 14 staged inflates the rate by deleting the rows still awaiting a route slot — the exact population the co-op is trying to convert." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-3",
      prompt: "EU carries 45 POs from 8 units. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts PO rows (45); COUNT(DISTINCT customer_id) folds repeats back to units (8). The gap between them is the intensity read the franchise council actually argues about.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every PO has a unit. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not units — a third grain nobody asked for. The census is POs AND franchisees." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) per territory — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to refused POs only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the refusal share truncates toward 0 and every territory reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1% and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the refusal map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-5",
      prompt: "Keep only units carrying at least 10 POs. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY unit HAVING COUNT(*) >= 10", "WHERE POs >= 10 on the raw orders table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A PO-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the heavy books clear it — 24, 17, 14 and 13 POs — while the long tail of 1-to-5-PO units does not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'POs' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-6",
      prompt: "The franchisee ladder runs 24, 17, 14, 13, 5 POs, then FOUR units tied at 4. Under RANK, what rank do the two 3-PO units carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-PO units share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The staged POs double-counted their order day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the routed-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 POs.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-8",
      prompt: "A staging-table dark-unit list uses unit_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every PO carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-9",
      prompt: "A board stack puts received POs under refused POs in one layout, built with UNION. A reviewer says one unit's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same unit, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same unit, same counts, no territory or branch label — collapse into one, and the board loses a unit with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-10",
      prompt: "A dashboard walks co-op purchase value PO by PO: SUM(total) OVER (ORDER BY created_at). Two POs share a created_at second, and the cumulative 'jumps two POs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at PO grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-11",
      prompt: "You need total co-op purchase value. The PO table holds `total`; the join to PO lines fans 103 POs into 251 lines. Which expression returns the honest figure?",
      choices: [
        "SUM(o.total) over POs joined to PO lines",
        "SUM(oi.unit_price * oi.quantity) over the PO lines",
        "AVG(o.total) * 251",
        "MAX(o.total) + MIN(o.total)",
      ],
      answer: 1,
      why: "Line-grain value is SUM(unit_price × quantity) over order_items: 34,833.28, priced at route time. SUM(o.total) after the join repeats each PO's total once per line — 103 POs × 2.4 average lines — inflating the book roughly 2.4x with no error anywhere.",
      notes: [
        { choice: 0, why: "The join is the bug: every multi-line PO's total is added once per line. The 2.4x inflation is the classic fan-out SUM — the vendor audit's 34,833.28 reconciles only from the line grain." },
        { choice: 2, why: "AVG × a line count multiplies two different grains — the result is neither value nor anything else. Grain mixing, not arithmetic, is the failure." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-12",
      prompt: "A trend report buckets POs with `STRFTIME('%m', created_at)` and shows 12 rows instead of 14. What happened?",
      choices: [
        "Two months genuinely had no POs",
        "'%m' extracts month-only, so Jan 2024 and Jan 2025 merged into one bucket",
        "STRFTIME cannot parse the date format in this column",
        "GROUP BY dropped NULL months",
      ],
      answer: 1,
      why: "The month key needs year plus zero-padded month — STRFTIME('%Y-%m') or SUBSTR(created_at, 1, 7). '%m' alone folds both Januaries together: 14 calendar months, 12 buckets, and the spine becomes fiction exactly at year end.",
      notes: [
        { choice: 0, why: "Every month from 2024-01 to 2025-02 carries POs — the bucket count changed, not the demand. A merged bucket is a query bug wearing a quiet face." },
        { choice: 2, why: "STRFTIME parses these ISO dates fine — the format specifier is the bug. Silent failure is why the spine gets eyeballed against COUNT(*)." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-13",
      prompt: "After joining POs to their lines, which expression still counts PURCHASE ORDERS, not lines?",
      choices: [
        "COUNT(*)",
        "COUNT(oi.id)",
        "COUNT(DISTINCT o.id)",
        "SUM(1)",
      ],
      answer: 2,
      why: "COUNT(DISTINCT o.id) folds the fan-out back to PO grain — 103 even after the join. COUNT(*) and SUM(1) count joined rows (251); COUNT(oi.id) counts non-NULL line ids, which is also 251.",
      notes: [
        { choice: 0, why: "COUNT(*) after a join counts the JOINED rows — one per PO line. Saying 'one row per what?' before every COUNT is the habit the panel grades." },
        { choice: 1, why: "COUNT(oi.id) counts lines with a non-NULL id — all of them. It is COUNT(*) in disguise whenever the FK is populated." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-14",
      prompt: "`SELECT region, ROUND(AVG(total),2) AS avg_po FROM orders JOIN customers … WHERE avg_po > 350 GROUP BY region` fails. Why?",
      choices: [
        "Aliases cannot appear with GROUP BY",
        "WHERE runs before SELECT computes avg_po — the alias does not exist at filter time",
        "ROUND cannot wrap an aggregate",
        "The join must be INNER for aliases to work",
      ],
      answer: 1,
      why: "Logical evaluation order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. The alias is born in SELECT, so WHERE cannot see it — the fix is HAVING AVG(total) > 350 (a territory-level threshold) or wrapping the query. ORDER BY CAN use the alias, because it runs after SELECT.",
      notes: [
        { choice: 1, why: "Correct — and the same stage logic explains why HAVING exists: group-level facts can only be judged after the fold. The 350 floor on the average is HAVING's whole job." },
        { choice: 2, why: "ROUND wrapping an aggregate is perfectly legal in SELECT. The failure is temporal (when the alias exists), not syntactic." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-15",
      prompt: "Which expression computes US's POs-per-unit intensity (19 ÷ 2) correctly in the two-grain census?",
      choices: [
        "COUNT(*) / COUNT(customer_id)",
        "COUNT(*) / COUNT(DISTINCT customer_id)",
        "100.0 * COUNT(*) / COUNT(DISTINCT customer_id)",
        "SUM(total) / COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) counts PO rows (19) and COUNT(DISTINCT customer_id) folds to units (2) — the ratio is intensity. 19 / 2 in SQLite yields 9 (integer division); the council quotes 9.5, so a rounding-sensitive read needs 1.0 * COUNT(*) / COUNT(DISTINCT …).",
      notes: [
        { choice: 0, why: "COUNT(customer_id) without DISTINCT counts non-NULL FKs — 19 again — so the ratio is 19/19 = 1 for every territory and the concentration story vanishes." },
        { choice: 2, why: "That computes a percentage (950%), not a ratio — the 100.0 habit belongs to rate reads. Know which scale the audience expects." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-16",
      prompt: "`SELECT name FROM products WHERE price > (SELECT price FROM products WHERE name = 'Italian Herbs & Cheese')` returns ZERO rows on a staging copy where the name lookup matches nothing. First diagnosis?",
      choices: [
        "No SKU is pricier than Italian Herbs & Cheese — the zero is plausible",
        "The scalar subquery returned NULL (empty fold), price > NULL is UNKNOWN, and every row silently failed the comparison",
        "Scalar subqueries error when they return no rows",
        "The outer WHERE needs DISTINCT",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows; zero rows return NULL, not an error. price > NULL evaluates UNKNOWN, so the whole report empties while looking valid. Staging copies are where name lookups stop matching — name the empty-case behavior unprompted.",
      notes: [
        { choice: 0, why: "A confident zero needs proof, and the proof here is the subquery, not the price list. Run the inner fold alone: it returns nothing." },
        { choice: 2, why: "Zero rows is explicitly allowed for a scalar subquery — one row drives the comparison, zero rows yield NULL. The silence is the failure mode." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-17",
      prompt: "A cycle-end read uses `WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'`. What is the defect?",
      choices: [
        "BETWEEN cannot compare text dates",
        "It silently drops the 31st's later POs because any time component sorts after the bare date upper bound",
        "It includes April 1st",
        "BETWEEN is slower than two comparisons",
      ],
      answer: 1,
      why: "BETWEEN is inclusive at both ends, but a timestamp past midnight on the 31st sorts after '2024-03-31' and drops out. The professional form is the half-open range: created_at >= '2024-03-01' AND created_at < '2024-04-01' — boundary-proof, and franchisees batch weekly POs exactly at period edges, so the last day matters.",
      notes: [
        { choice: 0, why: "SQLite compares ISO text dates lexicographically, which is exactly why the half-open range works. The defect is the inclusive upper bound, not the type." },
        { choice: 2, why: "Inclusivity runs the other way: BETWEEN cannot include April — it fails to keep the last day of the cycle. Cycle-end is precisely when batched POs land." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-18",
      prompt: "`GROUP_CONCAT(DISTINCT status)` over all POs returns 'cancelled,delivered,pending,shipped'. What does that tell you, and what does it NOT?",
      choices: [
        "It is a value-set read (four statuses, alphabetized); it says nothing about how many POs carry each",
        "It counts the distinct statuses",
        "It is the status census — four stages with their counts",
        "It proves the vendor board is complete",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a value SET into one string — great for 'what statuses exist' audits and vendor-list cells, useless for counts. Order is unspecified unless you ORDER BY inside the aggregate, so never parse the string for sequence-sensitive meaning.",
      notes: [
        { choice: 1, why: "COUNT(DISTINCT status) counts them (4); GROUP_CONCAT lists them. The census — 52/30/14/7 — needs conditional counts, not string folding." },
        { choice: 3, why: "A NULL status would vanish from the concat silently — the string proves nothing about completeness. Pair it with COUNT(status) versus COUNT(*)." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-19",
      prompt: "You need the vendor SKUs present in last cycle's feed but missing from this cycle's. Which tool, and what is its hidden behavior?",
      choices: [
        "INNER JOIN — it keeps only the missing rows",
        "EXCEPT — it returns the set difference, but it deduplicates BOTH inputs first, so a duplicated missing SKU still reports once",
        "UNION — it merges the feeds and marks the missing ones",
        "COUNT(DISTINCT sku) per feed — the count gap names the missing SKUs",
      ],
      answer: 1,
      why: "EXCEPT is the set-difference tool: SELECT sku FROM old EXCEPT SELECT sku FROM new. The hidden behavior is dedup — both sides collapse to distinct sets first, which is fine for presence/absence but wrong if duplicate rows are the anomaly you are hunting. A count gap names how many, not which.",
      notes: [
        { choice: 0, why: "INNER JOIN keeps the MATCHING rows, not the missing ones — the anti-join direction is the opposite of what the question asks." },
        { choice: 3, why: "A count gap is a signal, not a list — replenishment needs the SKU names. COUNT(DISTINCT) answers 'how many', EXCEPT answers 'which'." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-20",
      prompt: "The month walk shows the first month's delta as 0.0 instead of blank. The query coalesced `LAG(value)` to 0. Why is that a lie?",
      choices: [
        "0.0 is the correct presentation for the first month",
        "The first month has no baseline — coalescing invents a flat month and turns 'no history' into a change the data never recorded",
        "LAG should be replaced by LEAD at the edges",
        "The coalesce only affects the first row's formatting",
      ],
      answer: 1,
      why: "LAG's boundary NULL is honest: no prior row exists, so the change is undefined, not zero. Coalescing the baseline to 0 turns January's 3,731.97 opening into 'infinite growth from zero' or a flat 0.0 depending on the formula — either way the deck asserts something the data never said. Label it 'baseline' or leave the NULL.",
      notes: [
        { choice: 0, why: "Presentation convenience is not truth: every downstream average of monthly deltas now absorbs a fake zero. The spine's first row is the one row allowed to be empty." },
        { choice: 2, why: "LEAD reads the future — February's baseline would become March. Swapping functions re-labels history; keep LAG and keep the NULL." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-21",
      prompt: "The dark-unit anti-join returns ZERO rows on the live db. What is the defensible conclusion?",
      choices: [
        "The query is broken — every franchise system has dark stores",
        "All 16 units appear in orders; the zero is a verified finding, not a failure",
        "The join key is wrong",
        "The units table has no rows",
      ],
      answer: 1,
      why: "On this db the anti-join legitimately finds nothing — and 'prove the zero' is the muscle: run the LEFT JOIN … IS NULL shape, show COUNT(*) = 0, state why (every seat routes through the co-op). An unproven zero is indistinguishable from a broken join; a proven zero is a finding the whitespace report can ship.",
      notes: [
        { choice: 0, why: "Assuming the zero must be wrong is the same sin as assuming it must be right — both skip the proof. The exposure story this db actually tells lives in billing: 6 invoices with no remittance." },
        { choice: 2, why: "The key is fine — 103 POs all carry valid customer_ids. Verify with a COUNT of unmatched units, not by swapping keys on a hunch." },
      ],
      difficulty: "easy",
    },
    {
      id: "subway-mcq-22",
      prompt: "The intensity column must read 9.5 (US) and 5.6 (EU), not 9 and 5. Which rewrite forces real division?",
      choices: [
        "ROUND(COUNT(*) / COUNT(DISTINCT customer_id), 1)",
        "1.0 * COUNT(*) / COUNT(DISTINCT customer_id)",
        "COUNT(*) / (COUNT(DISTINCT customer_id) + 0.5)",
        "CAST(COUNT(*) AS TEXT) || '/' || COUNT(DISTINCT customer_id)",
      ],
      answer: 1,
      why: "SQLite divides integers with integer semantics — 19/2 = 9 — so one operand must be real BEFORE the division: 1.0 * (or 100.0 for percentages). ROUND cannot recover precision integer division already truncated, and 0.5 fudge factors corrupt every group.",
      notes: [
        { choice: 0, why: "The truncation happened inside the division; ROUND(9, 1) is still 9. The 100.0-before-division rule exists for exactly this reason." },
        { choice: 2, why: "Adding 0.5 biases every territory differently — US reads 19/2.5 = 7.6 instead of 9.5. Real arithmetic, not fudge, is the fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-23",
      prompt: "A dark-unit list uses `WHERE id NOT IN (SELECT customer_id FROM orders_stage)` and returns nothing. The staging table has one NULL customer_id. What is the disciplined repair?",
      choices: [
        "Add WHERE customer_id IS NOT NULL to the subquery — or switch to NOT EXISTS",
        "Add DISTINCT to the subquery",
        "Cast customer_id to TEXT",
        "Replace NOT IN with != ALL",
      ],
      answer: 0,
      why: "x NOT IN (…, NULL) is UNKNOWN for every outer row — one NULL empties the report while looking valid. Either strip the NULLs explicitly or use NOT EXISTS, which short-circuits on matches and is NULL-safe by construction. != ALL is not SQLite syntax — the trap is three-valued logic, not dialect.",
      notes: [
        { choice: 1, why: "DISTINCT deduplicates values but keeps the NULL — the poison survives. The fix is removing or testing NULLs, not collapsing them." },
        { choice: 3, why: "ALL/ANY quantified comparisons do not exist in SQLite, and the semantics would inherit the same NULL problem anyway. NOT EXISTS is the portable NULL-safe shape." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-24",
      prompt: "PO counts run 24, 17, 14, 13, 5, then 4, 4, 4, 4. What is the second-HIGHEST DISTINCT engagement level, and which expression returns it regardless of ties?",
      choices: [
        "17 — MAX(pos) WHERE pos < (SELECT MAX(pos))",
        "17 — LIMIT 1 OFFSET 1 ordered by pos DESC",
        "14 — the second row of the ladder",
        "4 — the second-highest row value",
      ],
      answer: 0,
      why: "The second distinct level is 17, and MAX-below-MAX (or DENSE_RANK = 2) returns it tie-proof. LIMIT/OFFSET picks the second ROW — right here only because the top is untied; four units tied at 4 lower down are where the reflex eventually returns a level the council never asked for.",
      notes: [
        { choice: 1, why: "OFFSET answers 'second row', which equals 'second distinct value' only when no ties share the top. The four-way tie at 4 is where this reflex bites." },
        { choice: 2, why: "That is ROW_NUMBER thinking — position in the sort, not level in the distribution. The council asked for a LEVEL." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-25",
      prompt: "Invoice #25 bills 614800 cents; remittances show 400000 settled. What does `SELECT amount_cents / 100 FROM invoices WHERE number = 'INV-2024-025'` print?",
      choices: ["6148.00", "6148", "6147.99", "6148.00 dollars"],
      answer: 1,
      why: "amount_cents / 100 is integer division — 6148 flat, cents truncated. The dollar read is amount_cents / 100.0 exactly once at the presentation edge. Odd-cent rows lose 0.99-style amounts silently, which is why the close reconciles in cents and converts once.",
      notes: [
        { choice: 0, why: "That would require the .0 — the missing divisor is the whole bug. Integer division never produces a decimal point." },
        { choice: 2, why: "Integer division truncates toward zero (6148); it does not round through 6147.99. The cents vanish, they are not redistributed." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-26",
      prompt: "In the royalty coverage CASE, why must `WHEN settled IS NULL THEN 'none'` be evaluated BEFORE the settled-at-or-above-bill branch?",
      choices: [
        "CASE branches run in random order",
        "For never-remitted invoices the settlement fold is NULL, and NULL >= billed is UNKNOWN — so the equality branch never fires and the row would fall to ELSE mislabeled as 'partial'",
        "IS NULL tests run faster than comparisons",
        "The ELSE branch is evaluated first in SQLite",
      ],
      answer: 1,
      why: "CASE arms evaluate in written order, and the first match wins. An invoice with no remittance rows folds to NULL; NULL >= billed is UNKNOWN, so the exact-settlement test skips it — without the NULL arm first, the 6 never-remitted invoices (15,217.00, including the paid-labeled #28) land in ELSE wearing the wrong label. Order is semantics in a CASE, not style.",
      notes: [
        { choice: 0, why: "Deterministic order is a language guarantee — relying on it is exactly right, scrambling it is the bug. The NULL comparison behavior makes the order load-bearing here." },
        { choice: 3, why: "ELSE runs last, by definition. The failure mode is a mislabeled bucket — partial carrying the exposure — which is worse than an error because it looks plausible." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-27",
      prompt: "The status census's four arms stop summing to COUNT(*) = 103 after a refactor. Which change is the likely culprit?",
      choices: [
        "One CASE arm lost its ELSE 0",
        "A new status value appeared with no CASE arm covering it",
        "ORDER BY was added",
        "The join to customers was removed",
      ],
      answer: 1,
      why: "The reconciliation identity holds only when the CASE arms PARTITION the status domain. A new status falls through every arm — those POs vanish from all four columns while COUNT(*) keeps growing, and the board still LOOKS right because every column shows a plausible number. Exhaustive arms (or an explicit ELSE bucket) keep the identity true by construction.",
      notes: [
        { choice: 0, why: "A missing ELSE yields NULL contributions, and SUM over NULL contributions still sums the matched rows — the identity breaks when ROWS fall through, not when arms lack ELSE on empty matches. The real vector is coverage." },
        { choice: 2, why: "ORDER BY changes presentation, never the fold. The identity is about aggregation coverage — which is why the co-op runs the sum check every Monday." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-28",
      prompt: "A deep-dive wants POs routed above their TERRITORY's average value. The correlated version runs fine on 103 rows. What is the set-based rewrite, and why does it matter?",
      choices: [
        "Move the subquery into WHERE — it is already set-based",
        "Join to a derived table of per-territory averages (or use AVG(total) OVER (PARTITION BY region)) so the average computes once per territory, not once per PO",
        "Replace the average with the maximum",
        "Add LIMIT so the correlated version runs less often",
      ],
      answer: 1,
      why: "A correlated subquery re-evaluates per outer row — 103 executions here, millions at production scale. The join-to-CTE (or the window AVG OVER PARTITION BY) computes each territory's average once and lets the comparison ride along — same answer, one scan. The interview move is naming the trade: correlated for clarity on small data, set-based for the tables the real co-op runs on.",
      notes: [
        { choice: 0, why: "The correlated subquery already sits in WHERE — 'moving' it changes nothing. The restructure is staging the per-territory fold so it exists once." },
        { choice: 2, why: "MAX changes the question entirely — above-average and above-max are different populations. Scaling problems get architectural answers, not different metrics." },
      ],
      difficulty: "hard",
    },
    {
      id: "subway-mcq-29",
      prompt: "A running PO-value walk uses `SUM(total) OVER (ORDER BY created_at)` and shows a cumulative that 'jumps' at tied created_at days. Which frame makes the walk strict row-by-row, and what does the default do?",
      choices: [
        "The default is already strict; ties are impossible in the data",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks row by row; the default RANGE frame includes peers, so tied rows enter the cumulative together",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is strict; ROWS includes peers",
        "The frame cannot change a running SUM",
      ],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers on the ORDER BY key, so tied created_at rows join the cumulative in one step. ROWS counts physical rows and walks strictly. On a month spine ties are rare; at PO grain they are guaranteed.",
      notes: [
        { choice: 0, why: "Ties on created_at are exactly what this db has — the jump is the peers entering together. The default frame is RANGE, and RANGE is not strict." },
        { choice: 2, why: "Backwards: ROWS is the strict one, RANGE is the peer-inclusive one. Swapping the two words swaps the bug's direction." },
      ],
      difficulty: "medium",
    },
    {
      id: "subway-mcq-30",
      prompt: "The lead-time histogram buckets CAST(JULIANDAY(shipped_at) - JULIANDAY(created_at) AS INT) and shows 2/3/4-day buckets at 27/30/25 POs. Why does the CAST matter for the census?",
      choices: [
        "JULIANDAY returns text, so the CAST is cosmetic",
        "JULIANDAY differences are fractional (2.5 days); without the INT cast the 'buckets' become every distinct fractional value and the histogram dissolves into noise",
        "CAST rounds the difference to the nearest day",
        "The buckets must be TEXT to group",
      ],
      answer: 1,
      why: "JULIANDAY returns REAL days — 2.5 is a legal latency. Without CAST(… AS INT) the GROUP BY folds on every distinct fractional value and the 3-bucket histogram becomes dozens of singleton rows; with it, 2.5 truncates to 2 and the census reads 27/30/25. Say which: truncation, not rounding — CAST AS INT floors the fractional day.",
      notes: [
        { choice: 0, why: "JULIANDAY returns a REAL number of days — the arithmetic is numeric, and the fractional part is the whole reason the cast exists. Cosmetic casts do not change GROUP BY grain; this one does." },
        { choice: 2, why: "CAST truncates toward zero — 2.9 becomes 2, not 3. If the business means 'rounded days', say ROUND explicitly; the histogram's shape depends on which you chose." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-subway-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The co-op vendor audit",
      brief:
        "Subway-flavored memo on the storefront db: orders are the weekly POs franchise units route through the purchasing co-op, order_items are the PO lines in cases, and suppliers are the six approved vendors. The supply review opens the vendor audit — routed purchase revenue and catalog depth per vendor — because the top vendor alone carries 32% of the book and procurement wants that read with SKU depth beside it. Probed facts: Nordic Gadgets AB routes 11,130.25 across 3 SKUs, Midwest Hardware Co 9,294.93 across 3, Alpine Audio GmbH 4,765.63 across 2, Andes Naturals SA 3,613.25 across 2, Shenzhen Electro 3,049.07 across 3, Pacific Textiles 2,980.15 across 3. The review reads biggest revenue first.",
      ask: "Return each approved vendor with its catalog SKU count and routed purchase revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS vendor,\n       COUNT({1} p.id) AS skus,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS supply_revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = {3}\nJOIN order_items oi ON oi.product_id = {4}\nGROUP BY s.name\nORDER BY supply_revenue {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeat PO lines back to catalog SKUs: Nordic reads 3, not 43. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is catalog depth. ALL counts raw PO lines and turns the depth column into line volume.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Vendor revenue reports to 2 decimals — Nordic's 11,130.25. ROUND(…, 1) prints 11,130.3 and the vendor board stops reconciling with the 34,833.28 co-op book finance quotes on the same slide.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the vendor key",
          why: "The catalog attaches to vendors through p.supplier_id = s.id. Joining on a line-level id pairs each vendor with whichever SKU shares its row number — the fold collapses into noise before any vendor read survives.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the SKU key",
          why: "PO lines attach to the catalog through oi.product_id = p.id. Joining on a line's own id matches lines to themselves and the routed revenue shrinks to a rounding-error subset of the 34,833.28 book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest revenue on top: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, down to Pacific's 2,980.15. ASC would open the meeting on the smallest vendor — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["ALL", "SUM", "1", "oi.id", "ASC"],
      walkthrough:
        "Two joins, one fold, two columns at two grains. The first join attaches each catalog SKU to its approved vendor, the second attaches PO lines to SKUs, and GROUP BY vendor folds 251 routed lines into six rows where COUNT(DISTINCT p.id) reads catalog depth (3 / 3 / 2 / 2 / 3 / 3) and ROUND(SUM(quantity * unit_price), 2) reads routed revenue (11,130.25 / 9,294.93 / 4,765.63 / 3,613.25 / 3,049.07 / 2,980.15) — reconciling upward to the 34,833.28 co-op book, with Nordic's 32% share leading. The distractors fail honestly: ALL counts raw PO lines instead of SKUs and the depth column reads 43, 56, 40; SUM in the depth slot adds id codes together; 1 in the precision slot truncates to one decimal so the board drifts off the 34,833.28 total; oi.id as either join key pairs rows by row-number coincidence and the fold collapses to a 1,283.76 shadow book; ASC opens the audit on the smallest vendor. The two-column pairing is the read: depth 3 at 32% share versus depth 2 at 13.7% says concentration and breadth live on different vendors — one query, two procurement claims.",
    },
    {
      id: "cs-subway-2",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The royalty coverage census",
      brief:
        "Subway-flavored memo on the storefront db: invoices are the royalty and ad-fund bills to franchisees and payments are their remittances — both INTEGER cents, so the dollar read is amount_cents / 100.0. The royalty desk closes on the coverage census: classify every invoice by its settlement rows, never by the status label. Probed facts: 21 invoices settle exact (65,612 billed, 65,612 remitted), 1 settles partial (4,000 of 6,148), and 6 are never remitted (15,217). Five invoices settle as two splits (#1, 5, 12, 19, 22), and the anomaly list carries a void-but-paid invoice (#11, 925.00) plus a paid-status invoice with zero remittance rows (#28, 1,756.00). The census reads biggest invoice count first.",
      ask: "Classify each royalty invoice as exact, partial or none and return invoice counts with billed and remitted dollars, biggest invoice count first.",
      template:
        "SELECT CASE\n         WHEN settled IS NULL THEN 'none'\n         WHEN settled {1} billed THEN 'exact'\n         ELSE 'partial'\n       END AS coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(billed) / 100.0, 2) AS billed,\n       ROUND(SUM({2}(settled, 0)) / 100.0, 2) AS remitted\nFROM (\n  SELECT i.id, i.amount_cents AS billed, {3}(p.amount_cents) AS settled\n  FROM invoices i\n  LEFT JOIN payments p ON p.{4} = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY invoices {5};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the settlement test",
          why: "'>=' credits a fully settled invoice: remittances equal the bill exactly on all 21 exact rows. Strict '>' demotes every exact invoice to partial — the census reads zero exact rows and the dunning draft fires on franchisees who already paid in full.",
        },
        {
          answer: "COALESCE",
          kind: "keyword",
          label: "the zero-guard",
          why: "COALESCE(settled, 0) prints the never-remitted bucket at a real 0. Without it, SUM over six NULL remittances collapses to NULL and the exposure column loses its zero row — the one number the dunning meeting needs on the slide.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the remittance fold",
          why: "SUM folds each invoice's remittance rows into one settled figure — five invoices settle as two splits (#1, 5, 12, 19, 22), so the fold is load-bearing. COUNT returns row counts (0, 1 or 2) and every one of the 28 invoices reads partial.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the remittance key",
          why: "Remittances attach to their bill through p.invoice_id = i.id. Joining on a row-level id pairs each invoice with whichever remittance shares its row number and the settlement folds collapse before any classification survives.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book order",
          why: "ORDER BY invoices DESC leads with exact (21) — the healthy book the council wants on top. ASC opens the close on partial's single row and buries the 21-invoice proof cell at the bottom.",
        },
      ],
      distractors: [">", "<", "MAX", "COUNT", "ASC"],
      walkthrough:
        "Stage, then classify. The inner fold groups 28 royalty invoices by id, folding each bill's remittance rows into one settled figure — five invoices settle as two splits (#1, 5, 12, 19, 22), and #28 has no remittance rows so its fold stays NULL. The outer CASE classifies: NULL means never remitted, settled at-or-above the bill means exact, anything else partial — reproducing the audited rollup exactly: exact 21 invoices at 65,612 billed and remitted, none 6 at 15,217, partial 1 at 4,000 of 6,148. The anomalies sit exactly where the census puts them: void-but-paid #11 (925.00) lands in exact because remittance rows are the ledger of record and the status column is a claim, while paid-status #28 (1,756.00) lands in none for the mirror reason. The distractors each break one decision: strict '>' demotes all 21 exact invoices to partial; '<' promotes the lone partial to exact and demotes the healthy book; MAX in the zero-guard turns the none-bucket's remitted into NULL instead of 0; COUNT as the fold reads row counts (0/1/2) and renders all 28 invoices partial; ASC buries the proof cell. One staged fold, one CASE, and the dunning list writes itself from the none bucket.",
    },
    {
      id: "cs-subway-3",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The territory intensity read",
      brief:
        "Franchise-council brief, Subway-flavored on the storefront db: the concentration read is a WINDOW over the PO join — every purchase order keeps its own row while its territory's load and value ride beside it, because a territory can add POs while losing units and only the pair says which. Probed fold: EU runs 45 POs from 8 units worth 15,089.23, APAC 37 from 5 worth 11,605.45, US 19 from 2 worth 7,286.16, LATAM 2 from 1 worth 852.44 — and the US's 19-POs-from-2-units is the row the council argues about: 9.5 POs per unit against EU's 5.6. COUNT(*) OVER (PARTITION BY region) carries the load; the value window carries the book.",
      ask: "Return every PO with its territory, ticket value, territory PO count and territory purchase value to 2 decimals.",
      template:
        "SELECT c.region,\n       o.total,\n       {1}(*) OVER (PARTITION BY c.region) AS territory_pos,\n       ROUND(SUM(o.total) OVER (PARTITION BY c.region), {2}) AS territory_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY c.region, o.total {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the load counter",
          why: "COUNT(*) OVER (PARTITION BY c.region) stamps each PO with its territory's PO count — 45, 37, 19, 2. SUM(*) is not SQL and MAX(*) less so; the load column is a census, not a fold of values.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "The council quotes 15,089.23 and 11,605.45 — 2-decimal money. One decimal prints 15,089.2 and the intensity read stops reconciling with the 34,833.28 co-op book finance puts on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-ticket-first order",
          why: "Inside each territory the board reads biggest PO first — the flagship builds on top. ASC would open every territory on its smallest kiosk order and the concentration story would start from the tail.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC"],
      walkthrough:
        "Every row keeps its grain; the window adds the context. The join attaches each of the 103 POs to its unit's territory, and PARTITION BY c.region makes two windows per territory: COUNT(*) stamps the load (EU's 45, APAC's 37, US's 19, LATAM's 2 — which is why the LATAM rows make the 2-territory census visible in the output) and SUM(o.total) folds the book (15,089.23 / 11,605.45 / 7,286.16 / 852.44, reconciling to 34,833.28). Nothing collapses: 103 rows leave, 103 rows leave, each carrying its own total AND its territory's pair of numbers — the window's whole trick. The read writes itself: the US runs 19 POs from 2 units at 9.5 POs per unit while EU spreads 45 across 8 — concentration versus breadth, one query, no GROUP BY to argue with. COUNT for load, SUM for value, two decimals for the slide, biggest first inside each territory — and the distractors fail honestly: SUM or MAX in a count slot is not SQL, one decimal drifts the money cell, ASC opens every territory from its tail.",
    },
    {
      id: "cs-subway-4",
      tier: "hard",
      topic: "j4",
      universe: "fraud",
      title: "The paid-with-nothing-remitted anomaly",
      brief:
        "Fraud-spot-check memo, Subway-flavored on the storefront db: the royalty desk's rule is that REMITTANCE ROWS are the ledger of record and the status column is a claim — so every cycle runs the label audit: invoices marked paid whose payments table holds nothing. Probed fold: exactly one invoice carries that lie — INV-2025-028, status paid, 1,756.00 billed, zero remittance rows. It never appears in a status-based exposure list (the label says paid) and it never appears in an INNER JOIN to payments (no rows to match) — only the LEFT JOIN plus a zero-count gate catches it. The mirror anomaly, a void invoice WITH a remittance (#11, 925.00), is the same audit run the other way.",
      ask: "Return number, status and billed dollars for every invoice marked paid whose remittance rows count zero.",
      template:
        "SELECT i.number,\n       i.status,\n       SUM(i.amount_cents) / 100.0 AS billed_dollars\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE i.status = {2}\nGROUP BY i.id\nHAVING {3}(p.id) = 0;",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices, handing #28 a NULL payment payload the HAVING gate can catch. INNER JOIN deletes the no-remittance rows before any audit sees them — the anomaly vanishes and the audit reports a clean book that is not clean.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the claimed-status filter",
          why: "The audit hunts the LABEL: status 'paid' with zero remittance rows. Filtering 'void' instead finds nothing (this db's void invoice carries a remittance) — the mirror audit, a different memo.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the remittance-row counter",
          why: "COUNT(p.id) counts matched remittance rows — zero for #28. SUM(p.id) folds row ids into a NULL for the same group, and NULL = 0 is UNKNOWN, so the gate silently passes nothing; the counter is the only fold whose zero means 'no rows ever landed'.",
        },
      ],
      distractors: ["INNER", "'void'", "SUM", "MAX"],
      walkthrough:
        "The audit that trusts rows over labels. LEFT JOIN payments keeps all 28 royalty invoices: 22 arrive with remittance payloads, 6 with none — and the WHERE pins the claim to the paid-labeled subset. GROUP BY i.id folds each invoice's payload and the gate is a row count: HAVING COUNT(p.id) = 0 keeps exactly the invoices whose paid status has nothing behind it — one row, INV-2025-028, 1,756.00 printed from integer cents via the /100.0 rule. Every distractor breaks one promise: INNER JOIN deletes the very rows this audit exists to catch; 'void' runs the mirror audit and finds an empty set; SUM as the counter folds row IDS into a NULL and the zero gate passes nothing silently; MAX likewise returns NULL where COUNT returns the honest 0. The deliverable is one row — and the one row is the finding: a status that lies about money, caught because the query believed the payments table instead of the label.",
    },
    {
      id: "cs-subway-5",
      tier: "easy",
      topic: "l8",
      universe: "catalog",
      title: "The SKU band census",
      brief:
        "Replenishment memo, Subway-flavored on the storefront db: the co-op catalog bands by list price — budget under 50, mid 50-to-199.99, premium at 200 and up — and the replenishment sheet opens with the band census. Probed fold: 16 SKUs split 8 and 8 — budget averaging 32.06, mid averaging 111.50 — and the premium band is EMPTY, nothing priced at 200 or more. A CASE with holes quietly re-bands the sheet, and the empty band is the honesty check: GROUP BY prints only bands that own rows, so 'premium' vanishing from the output IS the finding, not a bug.",
      ask: "Return each price band with its SKU count and average price to 2 decimals, priciest band first.",
      template:
        "SELECT CASE\n         WHEN price < 50 THEN {1}\n         WHEN price < 200 THEN 'mid'\n         ELSE 'premium'\n       END AS band,\n       {2}(*) AS skus,\n       ROUND(AVG(price), {3}) AS avg_price\nFROM products\nGROUP BY band\nORDER BY avg_price {4};",
      slots: [
        {
          answer: "'budget'",
          kind: "keyword",
          label: "the floor-band literal",
          why: "The under-50 band is 'budget' — 8 SKUs at 32.06. 'mid' would merge both arms into one 16-SKU bucket averaging 71.78 and the replenishment sheet would lose the two-tier split it is built on.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the SKU counter",
          why: "COUNT(*) counts rows folded into each band — 8 and 8. SUM cannot take a star; the counter is what makes the census a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "The sheet quotes 32.06 and 111.50 — 2-decimal money. One decimal prints 32.1 and 111.5, and the bands stop reconciling with every other price cell in the pack.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-band-first order",
          why: "Replenishment reads the expensive end first: mid 111.50, then budget 32.06. ASC buries the mid band at the bottom and the meeting starts on the cheap tail.",
        },
      ],
      distractors: ["'mid'", "SUM", "1", "ASC"],
      walkthrough:
        "Band, fold, order — and an honest hole. The CASE arms partition the price domain: under 50 is 'budget', under 200 is 'mid', 200-and-up is 'premium'. GROUP BY band folds the 16 SKUs into two rows — budget 8 at 32.06, mid 8 at 111.50 — and the third band simply never prints, because GROUP BY only renders groups that own rows: the empty premium band is a finding the memo states in prose, not a zero the query pretends to print. COUNT(*) is the census counter, ROUND at 2 decimals matches the sheet, DESC opens on the priciest band. The label is the trap: 'mid' in the budget slot merges the tiers into one 16-SKU average of 71.78 — a correct-looking census of a catalog that does not exist. One scan, two bands, one vanishing act the analyst explains out loud.",
    },
    {
      id: "cs-subway-6",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "The heavy-cycle spine",
      brief:
        "Growth-board brief, Subway-flavored on the storefront db: the 14-month PO spine (2024-01 to 2025-02) carries 103 POs, and the council reads it as a LOAD chart — months carrying 8 or more POs are the heavy cycles where route slots and DC staging get stressed. Probed fold: six months qualify — 2024-01 (8 POs, 3,731.97), 2024-02 (9, 3,609.64), 2024-03 (8, 2,617.08), 2024-05 (8, 2,910.31), 2024-07 (8, 1,193.86) and 2024-09 (9, 3,116.04) — and the July row is the teaching point: a heavy LOAD month (8 POs) hiding the year's smallest VALUE (1,193.86), because the POs were small. Month keys must carry the year, or Januaries merge.",
      ask: "Return month, PO count and purchase value to 2 decimals for every month carrying 8 or more POs — chronological.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS pos,\n       ROUND(SUM(total), {2}) AS value\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-carrying month key",
          why: "The spine needs year plus zero-padded month: '%Y-%m'. '%m' alone merges Jan 2024 with Jan 2025 into one bucket and the 14-month spine becomes 12 rows of fiction — the load chart breaks exactly at year end.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "The board quotes 3,731.97 and 1,193.86 — 2-decimal money matching the 34,833.28 book. One decimal prints 3,732.0 and the trough cell stops reconciling with every other value on the slide.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the heavy-cycle floor",
          why: "HAVING COUNT(*) >= 8 keeps the six heavy cycles — and the kept rows carry 8s and 9s in the pos column, so the gate's own output proves the threshold. The floor judges a per-month fold, which is why it lives in HAVING.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A spine reads left to right in time: 2024-01 first. DESC tells the year backwards and the load chart contradicts every other month-ordered chart in the deck.",
        },
      ],
      distractors: ["'%m'", "1", "MAX", "DESC"],
      walkthrough:
        "A spine is a month key, a fold, a gate, an order. STRFTIME('%Y-%m', created_at) builds 14 calendar buckets; COUNT(*) counts each month's POs; HAVING COUNT(*) >= 8 keeps the six heavy cycles — Jan 2024's 8, Feb's 9, Mar's 8, May's 8, Jul's 8, Sep's 9 — and ASC walks them chronologically. The value column rides the same fold: ROUND(SUM(total), 2) prints 3,731.97 down to July's 1,193.86, the teaching row — heavy LOAD, smallest VALUE, because eight small POs still stress a route. '%m' as the key merges both Januaries and silently rewrites history; a MAX chip errors in every slot it can reach; 1 decimal drifts the money off the 34,833.28 book; DESC runs the year backwards. Gate on folds in HAVING, never WHERE — and keep the year in the key.",
    },
  ],

  problems: [
    { slug: "repeat-purchase-rate", why: "Consecutive-cycle reorder share: a unit that routes bread-program cases this week and next is healthy; one that skips is the churn-risk call. The reorder share over a window is the co-op's retention pulse." },
    { slug: "basket-depth-aov", why: "Lines per PO and value per PO at the unit edge — the co-op's basket-depth read. Flagship builds order deep, kiosks order thin, and the depth split drives the route schedule." },
    { slug: "restaurant-growth", why: "The 7-day rolling purchase average per unit is exactly how the co-op smooths day-of-week noise out of demand — this problem is that rolling window at practice scale." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Every unit has a core SKU it reorders week after week, and the field audit starts by naming it. Argmax per unit, ties included." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The flagship-unit question: which owner-operator routes the most POs in the cycle (24 on this db). A count-and-argmax the franchise council argues about every quarter." },
    { slug: "list-the-products-ordered-in-a-period", why: "The weekly cycle pick: which SKUs moved in the window at the required volume. The co-op's replenishment sheet is this query with a date filter." },
    { slug: "queries-quality-and-percentage", why: "Lead-time standard: what share of PO lines clear the promised DC-to-unit window. A ratio with a stated denominator — the co-op's service-level read." },
    { slug: "confirmation-rate", why: "PO confirmations: the share of orders the unit acks before the truck rolls. Unconfirmed POs are exactly the staged-and-surprising rows the route queue hates." },
    { slug: "product-price-at-a-given-date", why: "Co-op pricing as of the remodel cut-over: which price was live the day a unit's Fresh Forward rebuild flipped. As-of joins over price history are remodel-season bread and butter." },
    { slug: "the-most-recent-three-orders", why: "The field auditor's first pull: a unit's last three POs before the walk-through. Most-recent-N per group is the window shape behind it." },
    { slug: "last-person-to-fit-in-the-bus", why: "Truck loading: case quantities accumulating against vehicle capacity, stopping at the last case that fits. A running-sum gate — route planning's favorite query." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Program mix gaps: units carrying the core bread program and proteins but never the sides attach. The upsell list writes itself from this conditional fold." },
    { slug: "duplicate-emails", why: "Vendor-master hygiene before the royalty run: two remit-to records for one vendor silently splits settlements. The dedupe check is a five-minute query that saves a close." },
    { slug: "fix-product-name-format", why: "SKU name hygiene before any join: casing drift in the catalog splits one SKU into two and the replenishment sheet undercounts exactly the SKU the routes needed." },
    { slug: "sellers-with-no-sales", why: "Vendor whitespace audit: which approved vendors routed nothing this cycle. On this db the anti-join returns a confident zero — all six vendors carry revenue — and proving the zero is the audit." },
    { slug: "find-churn-risk-customers", why: "Dormant-unit detection: PO cadence that gaps out flags a unit going dark before the franchise agreement notices. The co-op's early-warning list is this shape." },
    { slug: "customer-order-frequency", why: "Units routing twice-plus across consecutive cycles — the reorder-cadence read. Conditional counting per cycle with the population stated, the franchise council's Monday query." },
    { slug: "immediate-food-delivery-iii", why: "The promise-share walk across the whole calendar — immediate share per customer and day, windowed. The DC-to-unit SLA trend behind the co-op's standing supply review." },
    { slug: "monthly-transactions-i", why: "The monthly purchase rollup with cancelled rows named — the 14-month spine at practice scale, with the status filter where the denominator lives." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Units whose cycle-over-cycle purchase value only rises — the growth-story shortlist. Window compares against the prior cycle; the strictly-increasing flag is the field-ops cue." },
    { slug: "consecutive-numbers", why: "Same-status streak detection — a PO state holding through consecutive cycles is a route-slot story. The row-number-difference trick at its simplest." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Units that opened the cycle but routed nothing — the staged-but-never-received read. Anti-join thinking applied to the DC queue, where the missing rows ARE the finding." },
    { slug: "average-selling-price", why: "Weighted price per SKU from PO lines: SUM(price × qty) / SUM(qty) — the exactly-once denominator discipline that keeps co-op catalog economics honest." },
    { slug: "big-countries", why: "Multi-predicate territory filters with an OR that actually matters — the area-or-population shape. Where a parenless OR quietly changes who stays on the board." },
    { slug: "not-boring-movies", why: "Parity plus content filters on one scan — the board's 'odd lines, non-trivial builds' read. Cheap-looking predicates that still need the population named." },
    { slug: "rising-temperature", why: "Consecutive-cycle demand up — the cycle-over-cycle lead-time and value trend. Self-join or LAG on date arithmetic, the same shape procurement uses for acceleration reads." },
    { slug: "group-sold-products-by-the-date", why: "Per-day PO lines folded into one cell — the daily receiving summary the DC reads at shift close. GROUP BY date with a deterministic string fold." },
    { slug: "count-student-number-in-departments", why: "Zero-fill census: territories with no POs must still print 0. LEFT JOIN from the dimension side with IS NULL — the empty-bucket honesty the co-op board lives by." },
    { slug: "market-analysis-i", why: "Units routing in one cycle who went quiet in the next — the new-versus-lapsed split. Set membership with an anti-join twist, the churn story in one query." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Window-bounded funnel: POs and units inside a half-open range. The period-filter discipline the 30-day supply review assumes — boundaries stated, not assumed." },
    { slug: "top-travellers", why: "Per-unit purchase totals, ranked — the heavy-buyer read behind the franchisee leaderboard. SUM at unit grain after a fan-out join, ordered and named." },
    { slug: "nth-highest-salary", why: "The Nth-highest DISTINCT engagement level on a tie-heavy ladder — four units tied at 4 POs make OFFSET a trap. MAX-below-MAX or DENSE_RANK, stated as a policy." },
  ],
};
