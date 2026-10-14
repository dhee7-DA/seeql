// Marqeta — Wave-9 (Task 98-marqeta), fintech domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12; case slots mechanically verified
// by scripts/case-audit.ts against db/custom.db).
// Issuing-side processing SQL: the storefront db read as an issuing sandbox — customers are
// program clients (region = market), orders are authorization batches (delivered =
// cleared-and-settled, shipped = authorized-in-flight with shipped_at as the auth stamp,
// pending = pending-JIT-funding decisions, cancelled = declined by JIT controls), order_items
// are authorization line records (quantity = units, unit_price = unit amounts), products are
// card programs (virtual/physical/single-use), suppliers are issuer-processor/GPA funding
// partners & BIN sponsors, invoices are program billing statements (interchange + platform
// fees), payments are settlement funding legs (INTEGER cents, /100.0), expenses are platform
// opex, ledger_entries is the JIT funding double-entry. Pool provenance: company-pools.md
// carries NO Marqeta section (0 tagged rows) — all 10 topic slug sets and all 16 problems
// are theme-curated from the pools file's SQL rows and say so. Case briefs quote probed
// figures from scripts/company-facts.md; every case slot is mechanically verified.
//
// NOTE for the wave-9 registry wiring agent: Marqeta is NOT yet in registry COMPANY_META.
// Header fields authored as id "marqeta", domainId "fintech", name "Marqeta", tagline
// "Modern card issuing: programs, JIT funding, controls", accent text-red-400 (unused by
// all 17 fintech siblings) — wire COMPANY_META to match exactly.

import type { CompanyKit } from "../types";

export const marqetaKit: CompanyKit = {
  id: "marqeta",
  domainId: "fintech",
  name: "Marqeta",
  tagline: "Modern card issuing: programs, JIT funding, controls",
  accent: "text-red-400",

  brief: [
    "**Marqeta** is the card-issuing platform behind some of the most familiar cards in your wallet-adjacent apps — Block's Cash App cards, DoorDash driver cards, and a stack of neobank and expense programs — without itself being a bank. It is the issuer-side processor: where a fintech's card program actually lives, from virtual and physical card issuance to just-in-time (JIT) funding, tokenization, and the interchange-plus-platform-fee revenue model. The business is B2B2C — its customers are programs, not cardholders — so every volume number in the building is a count over program activity, not end users. This kit maps the storefront db onto that world: the 16 customers rows are program clients (region = market), the 103 orders are authorization batches worth **34,833.28**, and the 251 order_items rows are authorization line records — quantity = units, unit_price = unit amounts. The status map is fixed: delivered = {emerald:cleared-and-settled} (52, 50.5%), shipped = authorized-in-flight (30, 29.1%, `shipped_at` = the auth stamp), pending = pending-JIT-funding decision (14), cancelled = {rose:declined by controls} (7, 6.8%).",
    "The data org splits into issuing ops, risk and controls, and program management, with a settlement pod that lives closest to the money. The heartbeat is the JIT funding decision: every authorization is a funding decision against the program's General Purpose Account, and a decline is a *control outcome*, not an error — which is why the 7 cancelled rows are first-class data, never cleanup. Auth-to-settle latency is the second pulse: **82 of 103 batches** carry the stamp, averaging **2.98 days** with a 2–4 day spread, and the 14 pending rows have none yet — a population definition, not a gap. Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of platform volume sits with clients whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost program moves a quarter.",
    "Interview screens are census-then-denominator, issuing-flavored. A typical loop opens with a **two-grain client census** — EU runs 45 batches from just 8 clients (5.6 intensity) while the US runs 19 from 2 (9.5) — then escalates into the {rose:JIT decline share} where the interviewer asks the denominator question out loud (*'does a pending-JIT batch count in your base?'*), then into the velocity ladder where four clients sit tied at 4 batches and rank semantics become a risk-policy decision. The control read is the one this db makes easy to test: declines by market run **APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0%** — a CASE fold over status that must reconcile to 103 by construction. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Marqeta section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: authorization lifecycles, JIT decline shares, two-grain program censuses, velocity ladders and the cents-safe funding spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:lifecycle census} issuing ops opens Monday with, the other rebuilds the {sky:concentration list} the monetization pod reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the authorization funnel refresh. An issuing-ops analyst opens the lifecycle dashboard before standup: did overnight batches clear, did any program authorize without GPA headroom, does the one-pass status census reconcile — 52 settled + 30 in-flight + 14 pending + 7 declined = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. Then the {rose:decline map}: 7 declines overnight-side of the week — 3 APAC, 3 EU, 1 US — each one a JIT control decision to walk, not an error to suppress. If auth-to-settle latency drifts off the **2.98-day** norm, the in-flight queue gets pulled before the program reviews ship.",
    "**11:30 —** Midday is the velocity read. The monetization pod wants the concentration re-cut — {rose:63.5% of the book} from 3,000-plus clients — beside batch counts, so the two-grain census (EU 45-from-8 versus US 19-from-2) goes out with both columns; a program manager wants per-market latency beside load, because **US 15 stamped at 3.07 days** against APAC's 29 at 2.93 is a staffing story, not a rounding one. Each ask is a join, a conditional aggregate and one judgment call about statuses — and the analyst writes the query twice: *once to answer, once with the definition spelled out so the number survives the risk-review argument*. The 251-versus-103 grain check (line records versus batches) gets said out loud every time.",
    "**15:30 —** The afternoon tilts toward money. The funding-rail split refreshes first — **card 16 legs / 37,364 versus wire 11 / 32,248** — before the settlement pod chases a mismatch; the statement-coverage read follows: **21 exact, 1 partial** (4,000 of 6,148 funded), 6 never-funded worth 15,217 — the dunning list, refreshed before a single reminder sends. Then the anomaly walk, line by line: a paid-status statement with zero funding legs (#28, 1,756.00) and a void statement that still funded (#11, 925.00). The day ends the way every close does: the JIT ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settled authorization rate", what: "Cleared-and-settled batches ÷ ALL batches booked: 52 of 103 (50.5%). 'Settled' is a status-filtered conditional count, and the denominator — in-flight and pending-JIT included — is the whole interview." },
    { name: "JIT decline rate", what: "Batches declined by controls ÷ all booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0%. The control-outcome map that risk reads every Monday; declines are decisions, not errors." },
    { name: "Authorized-in-flight share", what: "Batches with an auth stamp but not yet cleared: 30 of 103 (29.1%). The funding-exposure read — money committed against GPAs while authorizations work their way to settlement." },
    { name: "Platform volume (TPV)", what: "Total authorization value booked: 34,833.28 across 103 batches, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the program-tiering story — one 1,088.44 batch outweighs the smallest 42 combined." },
    { name: "Auth-to-settle latency", what: "Auth stamp to clearance (created_at → shipped_at over stamped batches): 82 of 103, averaging 2.98 days, range 2–4. The population definition ships with the number — pending batches have no cycle yet and must not dilute it." },
    { name: "Client concentration", what: "Share of platform volume from clients spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs program management and sizes the enterprise pod." },
    { name: "GPA funding rails", what: "Settlement funding legs by rail: card 16 legs / 37,364 versus wire 11 / 32,248. The mix the settlement pod reconciles daily — INTEGER cents, dollar read /100.0." },
    { name: "Statement coverage", what: "Billed versus funded: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-funded worth 15,217. The AR anti-join the billing pod refreshes every close." },
  ],

  topics: [
    {
      name: "Authorization status funnels",
      why: "Every issuing-ops screen opens with the lifecycle: batches booked, cleared-and-settled, authorized-in-flight, pending-JIT, declined. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight batch settled — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel"],
    },
    {
      name: "Two-grain program censuses",
      why: "Batches and clients are different grains of the same join, and every census here reports both: EU runs 45 batches from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is funding load and which is installed base — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining programs to authorizations",
      why: "Clients carry region and created_at; batches inherit them through joins, and the join type decides who survives. A batch without a client is corruption; a client without batches is a dormant program — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Decline rates with honest denominators",
      why: "The JIT decline share is cancelled ÷ ALL batches, and two failure modes ship weekly: integer division truncating 6.8 to 6, and a WHERE filter shrinking the denominator to the numerator's population. The house habit is 100.0 before the divide and the denominator decided in the same fold as the numerator.",
      slugs: ["queries-quality-and-percentage", "average-selling-price", "confirmation-rate"],
    },
    {
      name: "Spend ladders & ranking windows",
      why: "The client velocity ladder runs 24, 17, 14, 13, 5 — then FOUR clients sit tied at 4 batches on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which on an issuing platform is a policy about which programs get the next risk review, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Control banding with CASE",
      why: "Spend limits, velocity tiers and single-use versus refresh-token programs are CASE-classified with edges the program contract publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month settlement spine (2024-01 to 2025-02) is the ops call's home turf: volume booked per month, declines per month, and the step delta — the book troughs at 1,193.86 in July 2024 and jumps +1,158.21 into August. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Anti-joins & coverage gaps",
      why: "Never-funded statements ARE the answer — the 6 statements worth 15,217 that no funding leg ever touched are the dunning list. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is a daily issuing-ops query, and the client-side anti-join returning a confident zero is itself a report you must be able to defend.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, in-flight, pending and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of reconciliation.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents discipline on funding legs",
      why: "Settled is not funded — the finance tables (28 statements, 27 funding legs, INTEGER cents) are where the issuing world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw tables.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "marqeta-t1",
      q: "Your authorization report joins orders to customers. When do you INNER and when do you LEFT — and what silently breaks if you filter a status column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A volume report joins batches to clients: a batch with no client row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-program report must be LEFT from clients: the clients with no batches ARE the answer, arriving with NULL batch columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload client row — the LEFT quietly became an INNER and the dormant programs vanished. The fix is moving the predicate into ON or an outer query. On this db the two anti-joins behave differently, and the contrast is the lesson: the client-side anti-join (never-issued programs) returns a confident zero — all 16 clients appear in the batch table somewhere, and proving that zero is the analyst's job — while the money-side anti-join is where the real findings live: 6 statements worth 15,217 that no funding leg ever touched. Same shape, opposite stakes, and a strong candidate names which side they are standing on before writing either.",
      tag: "joins",
    },
    {
      id: "marqeta-t2",
      q: "Four clients tie at 4 authorization batches on the velocity board. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which on an issuing platform is a silent judgment call about whose program gets the next risk review. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer programs (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id, written into the query comment so the board can audit it. Velocity boards drive control staffing here, so an arbitrary split is not a cosmetic flaw — it quietly reallocates attention between programs that look identical on paper, and that is exactly the kind of silent decision a Marqeta reviewer hunts for.",
      tag: "windows",
    },
    {
      id: "marqeta-t3",
      q: "The census shows 103 batches and 16 clients; EU shows 45 batches from 8 clients. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts batch rows after the join — one row per authorization batch, so a client with 24 batches contributes 24. COUNT(DISTINCT customer_id) folds those rows back to clients — EU's 45 batches collapse to 8 programs. Neither is wrong: batches measure funding load on the platform, clients measure installed base, and the ratio — 5.6 batches per client in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for authorization line records and COUNT(*) silently counts line records, not batches — 251 of them. On an issuing platform that confusion has teeth: batch count feeds the platform-fee discussion while line records feed per-unit pricing, and presenting one as the other is how a program invoice goes wrong. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "marqeta-t4",
      q: "shipped_at is NULL until an authorization carries its settle stamp. What is your policy for the auth-to-settle report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped batches have a latency, so the report measures auth-to-settle for the 82 of 103 batches that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL batches returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 declined batches, which is a feature, not a bug — those rows have no settlement clock by definition. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for authorizations that never settled, and on a funding platform it reads as free float the finance team will chase. A report whose WHERE clause is doing definitional work without saying so is exactly what an issuing-ops reviewer hunts for, because the pending-JIT population is the queue the whole control system exists to watch.",
      tag: "nulls",
    },
    {
      id: "marqeta-t5",
      q: "The risk review wants markets carrying at least ten batches with their decline share. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' identifies the declines before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-batch floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor is doing visible work: EU 45, APAC 37 and US 19 clear it while LATAM's 2 batches drop out — and the decline share of what remains must still divide by each market's FULL booked count, or the share drifts. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a control report and an error, and between a threshold applied to batches versus to dollars. The strong answer places every filter by asking: is this a fact about one batch, or about a market? On an issuing platform the follow-up is always the denominator: a decline share over a filtered base is how a market looks safe while its declines were simply excluded from the print.",
      tag: "pipeline",
    },
    {
      id: "marqeta-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 batches always produce a mean (338.19 on this db). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The IN-shaped cousin behaves differently and matters more here: the concentration list's inner fold (clients whose lifetime SUM crosses the 3,000 line) returns four clients, and if the inner query came back empty the outer list would honestly be empty — an IN against an empty set is false, not UNKNOWN. The correlated cousin (compare each batch to ITS client's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population, its threshold semantics, and its empty-case behavior unprompted — that triple is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "marqeta-t7",
      q: "The settlement trend buckets batches by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's batches, and month-end is exactly when settlement runs bunch up. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the walk tells the operating story: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, then jumps +1,158.21 into August — and the declines concentrate in July and November, 2 each of the 7 total. Date discipline is control discipline here: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "marqeta-t8",
      q: "Finance says a statement is 'paid' but the funding-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero funding legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a funding leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent funding leg. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-funded, and the JIT ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. On an issuing platform that ledger is the funding truth: every authorization platforms against it, so a reconciliation gap is a page, not a shrug.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "marqeta-mcq-1",
      prompt: "An authorization batch's status reads 'shipped'. In this kit's issuing stage map, what happened?",
      choices: ["Cleared and settled", "Authorized-in-flight — funded, not yet settled", "Pending its JIT funding decision", "Declined by controls"],
      answer: 1,
      why: "The stage map is fixed: shipped = authorized-in-flight (30 of 103 batches), carrying the auth stamp but not yet cleared. Settled is 'delivered' — 52 batches.",
      notes: [
        { choice: 0, why: "Calling in-flight batches settled inflates the settled share (50.5%) before a single batch clears — the funding-exposure read disappears on the slide." },
        { choice: 2, why: "Pending-JIT is 'pending' — 14 batches with no stamp and no funding decision yet. In-flight money is committed; pending money is not." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-2",
      prompt: "The platform booked 103 batches; 7 were declined by JIT controls, 14 sit pending. The JIT decline rate divides 7 by which population?",
      choices: ["Declined + pending (7/21)", "All batches booked (7/103 = 6.8%)", "Settled batches only (7/52)", "Distinct clients (7/16)"],
      answer: 1,
      why: "The house definition: declines ÷ ALL batches booked — pending batches stay in the denominator because 'not yet decided' is exactly what the control metric watches. 6.8% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 33% by deleting the population still queued for a decision — the rows the control system exists to watch." },
        { choice: 2, why: "7/52 mixes lifecycle steps — settled is a downstream state, not the at-risk base. Denominators come from booking, not from survival." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-3",
      prompt: "EU carries 45 batches from 8 clients. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts batch rows (45); COUNT(DISTINCT customer_id) folds repeats back to clients (8). The gap between them — 5.6 batches per client — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every batch carries a client. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not clients — a third grain nobody asked for. The census is batches AND programs." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined batches only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the decline map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-5",
      prompt: "Keep only clients carrying at least 5 authorization batches. Where does the threshold live — and who survives it on this db?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY client HAVING COUNT(*) >= 5 — five clients (24, 17, 14, 13, 5 batches)", "WHERE batches >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A batch-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly five clients clear it — 24, 17, 14, 13 and 5 batches.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'batches' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-batch population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending batches double-counted their auth day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 batches.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-7",
      prompt: "The velocity ladder runs 24, 17, 14, 13, 5 batches, then FOUR clients tied at 4. Under RANK, what rank do the two 3-batch clients carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-batch clients share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-8",
      prompt: "A staging-table decline list uses client_id NOT IN (SELECT customer_id FROM batches WHERE status = 'declined') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every batch carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty control reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-9",
      prompt: "A board stack puts in-flight batches under declined batches in one layout, built with UNION. A reviewer says one client's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same client, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same client, same counts, no market or branch label — collapse into one, and the board loses a client with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-10",
      prompt: "A dashboard walks GPA funding exposure: SUM(leg_amount) OVER (ORDER BY posted_at). Two legs share a posted_at second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on posted_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On a month spine ties are rare; at funding-leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous leg's value, not the running balance — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-marqeta-1",
      tier: "easy",
      topic: "t6",
      universe: "funnel",
      title: "The authorization lifecycle census",
      brief:
        "Marqeta-flavored brief on the storefront db: Monday's issuing-ops review opens with the lifecycle census — every market's authorization book split settled / in-flight / pending-JIT / declined, with the market's total load beside each row so the shares are computable on sight. Probed facts: 103 batches split delivered 52 / shipped 30 / pending 14 / cancelled 7; the status-by-market grid reads EU 24/12/6/3 of 45, APAC 21/8/5/3 of 37, US 5/10/3/1 of 19, LATAM 2/0/0/0 of 2. Decline share is the control read: APAC 8.1, EU 6.7, US 5.3, LATAM 0. Ops reads markets alphabetically, biggest arm first.",
      ask: "Return each market's status arms with batch counts plus the market's total load beside every row — markets A-to-Z, biggest arm first inside each.",
      template:
        "WITH mix AS (\n  SELECT c.region AS region,\n         o.status AS status,\n         COUNT(*) AS auths\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, o.status\n)\nSELECT region,\n       status,\n       auths,\n       {1}(auths) OVER ({2} BY region) AS market_load\nFROM mix\nORDER BY region {3}, auths {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the load aggregator",
          why: "SUM(auths) OVER (PARTITION BY region) totals a market's arms — EU reads 45. COUNT returns the number of arm ROWS (4 per market — a census of census rows) and MAX the single biggest arm — neither is funding load.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the per-market reset",
          why: "PARTITION BY region restarts the window per market: 37, 45, 2, 19. GROUP inside OVER is a parser error and ROWS BY is frame grammar, not grouping — the engine rejects both outright.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the A-to-Z market order",
          why: "Ops reads the slide top-down by market: APAC, EU, LATAM, US. DESC scrambles that order and the review's muscle memory with it — a correct query laid out wrong for the room.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-arm-first direction",
          why: "Inside each market the biggest arm leads — EU's 24 settled before its 12 in-flight. ASC would lead every market with its smallest arm, putting the declines at the top of the story they did not earn.",
        },
      ],
      distractors: ["COUNT", "MAX", "GROUP", "ROWS"],
      walkthrough:
        "Two stages: fold the lifecycle per market, then put the market's load beside every arm. The CTE folds 103 batches into 13 status-by-market rows; the window then carries SUM(auths) OVER (PARTITION BY region) so each row knows its market's total — APAC 37, EU 45, US 19, LATAM 2. The grid reads exactly like the probed census: EU 24/12/6/3 under a load of 45, APAC 21/8/5/3 under 37, US 5/10/3/1 under 19, and LATAM one arm — 2 settled under 2. The arms reconcile to the platform census by construction: 52 + 30 + 14 + 7 = 103. The distractors fail honestly: COUNT in the window returns the arm-row count (4, 4, 4, 1 — a census of census rows, not volume); MAX returns the single biggest arm (21, 24, 10, 2) and erases the rest; GROUP and ROWS inside OVER are parser errors, which is the friendlier failure. The read the board makes: the US is in-flight-heavy — 10 of its 19 batches authorized but unsettled — while APAC is settled-heavy at 21 of 37, one query carrying two different control conversations.",
    },
    {
      id: "cs-marqeta-2",
      tier: "medium",
      topic: "q3",
      universe: "growth",
      title: "The 3,000-line concentration list",
      brief:
        "Marqeta-flavored brief on the storefront db: the monetization pod reads concentration at every close — which program clients sit above the 3,000 lifetime-volume line, because that cohort carries the book. Probed facts: the platform books 34,833.28 across 103 batches (average 338.19); clients above 3,000 hold 63.5% of volume, 71.2% above the 2,000 line. The top-spenders table reads Alice Chen 24 batches / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56. Definition fixed: lifetime SUM(total) per client, threshold strict (greater than 3,000), one row per client.",
      ask: "Return each client above the 3,000 line with batch count and settled volume to 2 decimals, biggest volume first.",
      template:
        "SELECT c.name AS client,\n       {1}(*) AS batches,\n       ROUND(SUM(o.total), 2) AS settled_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.{2} IN (\n  SELECT customer_id FROM orders\n  GROUP BY customer_id\n  {3} SUM(total) > {4}\n)\nGROUP BY c.name\nORDER BY settled_value {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the batch counter",
          why: "COUNT(*) counts each client's batches — 24, 17, 14, 13. SUM(*) is meaningless over the star and MAX(*) does not parse: only COUNT takes the star to count rows rather than collapse values.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the cohort join key",
          why: "The IN-list matches batches to the above-line clients through o.customer_id. o.id instead matches order ids 1/5/7/13 — three stray single-batch rows that flatter nobody; o.c.id does not parse.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the folded-threshold clause",
          why: "SUM(total) only exists after GROUP BY customer_id, so the > 3,000 test must judge groups — HAVING. WHERE cannot see aggregates, and the parser says so before the data does.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the concentration line",
          noVerify: true,
          why: "Strict > 3,000 keeps exactly the facts-file cohort — four clients carrying 63.5% of the 34,833.28 book. Loosening to 2,000 widens it: Chloe Dubois' 2,667.93 joins and the headline share is no longer the number the deck quotes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pod reads Alice's 7,262.35 on top and walks down the ladder. ASC buries the anchor client at the bottom — a correct query aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["SUM", "MAX", "WHERE", "id", "2000", "ASC"],
      walkthrough:
        "Two stages: find the cohort, then fold it. The inner query groups 103 batches per client and keeps the four whose lifetime SUM crosses 3,000; the outer query joins those ids back and folds again — Alice Chen 24 batches / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56 — the facts-file top-spenders rows verbatim, together the 63.5%-of-book cohort the deck quotes. The distractors each break differently: SUM and MAX over the star are parser errors; WHERE in the HAVING slot is the classic aggregate-in-WHERE rejection; id in the join key matches order ids 1/5/7/13 and returns three stray one-batch rows; id in the threshold slot compares SUM(total) to a bare order id and prints 16 rows of noise; 2,000 widens the cohort to five and breaks the 63.5 headline; ASC inverts the read. One unprompted bonus the panel listens for: if the inner fold ever returns empty — a filtered staging table, say — the IN-shape returns an honestly empty list, not a NULL-poisoned one; that is why this shape, not NOT IN, guards the concentration report.",
    },
  ],

  problems: [
    { slug: "card-launch-success", why: "A new card program's early approval rate is the launch read every program manager signs up against. This problem drills the per-card approval-rate shape behind that launch deck." },
    { slug: "transaction-velocity", why: "JIT controls watch burst behavior — several authorizations inside a rolling window before the GPA takes a hold. Velocity-burst detection is exactly this problem's shape." },
    { slug: "immediate-food-delivery-ii", why: "Instant versus scheduled funding: the share of authorizations funded just-in-time versus prefunded walks like this immediate-versus-waiting delivery split." },
    { slug: "duplicate-charge-pairs", why: "Duplicate authorizations are a real loss mode — two captures for one intent. Pairing suspicious near-duplicates is this problem's exact query." },
    { slug: "top-percentile-fraud", why: "Risk ranks authorization batches by decline signals and cuts the worst percentile for review. PERCENT_RANK over scored batches is the screening shape." },
    { slug: "customers-who-never-order", why: "The dormant-program anti-join: which signed clients have never issued a batch. On this db the answer is a confident zero — and proving that zero is the exercise." },
    { slug: "monthly-transactions-i", why: "The month-close statement pull: batches in a month window above a value floor — the exact shape of the monthly program-billing extract." },
    { slug: "list-the-products-ordered-in-a-period", why: "Program velocity in a window: which card programs ran volume between two dates. The weekly issuing-ops pull, verbatim." },
    { slug: "game-play-analysis-iv", why: "First-authorization conversion: did a newly signed client transact on day one? The pilot-to-production read, one conditional join away." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Which clients carry at least five open programs or batches: the HAVING-gate shape behind the enterprise-tier review." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest-issuing client: Alice Chen's 24 batches lead this book. Argmax-over-counts is the exact drill behind the anchor-account report." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest authorization per card program: freshness per program is how issuing ops spots cards going quiet before the client notices." },
    { slug: "active-users", why: "Consecutive-day authorization streaks flag both healthy velocity and bot-like behavior; the window-streak shape is the same either way." },
    { slug: "last-person-to-fit-in-the-bus", why: "GPA headroom is a running-sum gate: will the next authorization fit under the funding balance before the hold clears? Cumulative-sum-with-condition, exactly." },
    { slug: "market-analysis-i", why: "New-versus-established client reads: signed recently with volume, or long-tenured and quiet — the cohort split risk reviews open with." },
    { slug: "group-sold-products-by-the-date", why: "The daily settlement manifest: which programs settled on each date, folded into one cell. GROUP_CONCAT is the ops hand-off artifact." },
  ],
};
