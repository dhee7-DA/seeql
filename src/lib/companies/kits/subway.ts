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
    "Preparation strategy: the pools file carries no Subway section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's screen shapes: two-grain territory censuses, received-versus-refused demand splits, tie-heavy unit leaderboards, SKU band cuts and the cents-safe royalty spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:co-op vendor audit} supply reviews open with, the other rebuilds the {sky:royalty coverage census} finance reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Received vs refused demand",
      why: "The co-op's most-watched ratio is received ÷ placed, and it is a conditional count before it is a percentage: SUM(CASE WHEN status = 'cancelled' …) over the same rows COUNT(*) divides. Drill it until putting the status filter in the wrong clause feels physically wrong — that filter move is the denominator-drift bug that ruins refusal maps.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Unit joins & whitespace",
      why: "Units carry territory and city; POs inherit them through joins, and the join type decides who survives. A PO without a unit is corruption; a unit without POs is a dark store — though on this db the anti-join returns a confident zero (all 16 units order), and proving that zero is part of the audit.",
      slugs: ["combine-two-tables", "customers-who-never-order", "employee-bonus"],
    },
    {
      name: "Franchisee leaderboards",
      why: "Leaderboards rank units by routed POs with guaranteed ties — four units sit at 4 POs each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer franchisees, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "SKU bands with CASE",
      why: "The co-op catalog bands into budget (8 SKUs averaging 32.06) and mid (8 SKUs averaging 111.5) with nothing above 199.99 — the premium band is empty, and a CASE with holes quietly re-bands the replenishment sheet. Exhaustive, ordered arms are the whole exercise.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month PO spine (2024-01 to 2025-02) is the franchise council's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and swing (+1,158.21 into August, -1,326.87 into November) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — received under refused, this cycle beside last — and EXCEPT answers 'which billed royalties never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "league-statistics"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-unit PO value, then judge it against a computed network mean (338.19 here). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["second-highest-salary", "winning-candidate", "game-play-analysis-iv"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets received, in-transit, staged and refused in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["sales-by-day-of-the-week", "find-stores-with-inventory-imbalance", "calculate-orders-within-each-interval"],
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
  ],
};
