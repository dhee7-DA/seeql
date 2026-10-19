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
// carries NO Marqeta section (0 tagged rows) — all 10 topic slug sets and all 32 problems
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
    "Preparation strategy: the pools file carries no Marqeta section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: authorization lifecycles, JIT decline shares, two-grain program censuses, velocity ladders and the cents-safe funding spine. Do the topics in order, then run the six case studies on the live storefront db: the {emerald:lifecycle census} issuing ops opens Monday with, the {sky:concentration list} the monetization pod reads at every close, the JIT decline map, the client velocity ladder, the GPA funding-rails stack, and the never-funded dunning list. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Marqeta data teams rehearse most: the authorization lifecycle census with its per-market load column, the 3,000-line concentration list that carries the book, the JIT decline map with its named sub-floor market, the client velocity ladder with its published tie policy, the GPA funding-rails stack that foots to the cash account, and the never-funded dunning list built on the LEFT JOIN + IS NULL gate. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'what's your denominator?' follow-up tests.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "trial-to-paid-funnel", "ads-funnel", "funnel-step-conversion", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Two-grain program censuses",
      why: "Batches and clients are different grains of the same join, and every census here reports both: EU runs 45 batches from 8 clients while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is funding load and which is installed base — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "basket-depth-aov", "rfm-segmentation", "cohort-retention-matrix", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "Joining programs to authorizations",
      why: "Clients carry region and created_at; batches inherit them through joins, and the join type decides who survives. A batch without a client is corruption; a client without batches is a dormant program — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "dormant-reactivation", "market-analysis-i"],
    },
    {
      name: "Decline rates with honest denominators",
      why: "The JIT decline share is cancelled ÷ ALL batches, and two failure modes ship weekly: integer division truncating 6.8 to 6, and a WHERE filter shrinking the denominator to the numerator's population. The house habit is 100.0 before the divide and the denominator decided in the same fold as the numerator.",
      slugs: ["queries-quality-and-percentage", "average-selling-price", "confirmation-rate", "amount-anomaly-zscore", "card-launch-success", "group-sold-products-by-the-date"],
    },
    {
      name: "Spend ladders & ranking windows",
      why: "The client velocity ladder runs 24, 17, 14, 13, 5 — then FOUR clients sit tied at 4 batches on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which on an issuing platform is a policy about which programs get the next risk review, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "structuring-detection", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Control banding with CASE",
      why: "Spend limits, velocity tiers and single-use versus refresh-token programs are CASE-classified with edges the program contract publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "credit-utilization-bands", "delinquency-buckets", "expected-credit-loss", "transaction-velocity", "the-most-recent-orders-for-each-product", "active-users"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month settlement spine (2024-01 to 2025-02) is the ops call's home turf: volume booked per month, declines per month, and the step delta — the book troughs at 1,193.86 in July 2024 and jumps +1,158.21 into August. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "budget-pacing", "top-percentile-fraud", "game-play-analysis-iv"],
    },
    {
      name: "Anti-joins & coverage gaps",
      why: "Never-funded statements ARE the answer — the 6 statements worth 15,217 that no funding leg ever touched are the dunning list. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is a daily issuing-ops query, and the client-side anti-join returning a confident zero is itself a report you must be able to defend.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers", "customers-who-never-order"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, in-flight, pending and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of reconciliation.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Cents discipline on funding legs",
      why: "Settled is not funded — the finance tables (28 statements, 27 funding legs, INTEGER cents) are where the issuing world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the raw tables.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "balance-rollforward", "gl-reconciliation", "trial-balance-check"],
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
    {
      id: "marqeta-t9",
      q: "Walk me through cutting a billing window — say, the March statement run — without losing its last night.",
      a: "Half-open intervals, always: created_at >= '2024-03-01' AND created_at < '2024-04-01'. Inclusive at the start, exclusive at the end, so it catches '2024-03-31 23:58:12' with no boundary judgment and composes cleanly — April's window starts exactly where March's ends, no overlap, no gap. BETWEEN '2024-03-01' AND '2024-03-31' silently drops everything after midnight on the 31st, and month-end is precisely when authorization batches bunch up, so the missing rows are never random. On this db March holds 8 batches — but the point is the policy, not the count: the analyst who states the boundary rule before writing the WHERE clause is the one whose billing extracts survive the program manager's audit. Date bugs are boundary bugs.",
      tag: "dates",
    },
    {
      id: "marqeta-t10",
      q: "Why can't you filter on a window function's output in WHERE, and what is the fix?",
      a: "Because of stage order: WHERE runs before SELECT, and window functions are computed IN the SELECT stage — so RANK() OVER (...) AS rnk simply does not exist yet when WHERE evaluates. The engine errors, or worse, you filter against a column you think exists and get a silently empty result. The fix is staging: compute the window in a CTE or derived table — client_ladder AS (SELECT name, RANK() OVER (ORDER BY batches DESC) AS rnk …) — then filter rnk <= 5 in the outer SELECT. That two-step shape is behind every top-N-per-group read in this kit, from the velocity ladder to the per-market decline map. Saying 'windows live in SELECT, filters that need them live one stage up' is the complete answer.",
      tag: "windows",
    },
    {
      id: "marqeta-t11",
      q: "A pipeline retry captured the same authorization twice. How do you keep exactly one row — and which one?",
      a: "The window dedupe: ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) AS rn, keep rn = 1. The PARTITION BY names what 'the same authorization' means — the business key (batch id, card token, amount, timestamp bucket), not the surrogate id, if retries mint new ids — and the ORDER BY names the survivor policy: newest ingest wins, with created_at or id as the deterministic tie-breaker. Detect first with GROUP BY the key HAVING COUNT(*) > 1 so you know the blast radius before deleting anything. The naive DELETE with no tie-breaker can remove BOTH captures — on an issuing platform a double capture is a cardholder dispute and a chargeback, so the survivor rule is a business decision, stated in a comment, not a coin flip.",
      tag: "windows",
    },
    {
      id: "marqeta-t12",
      q: "What is your NULL policy for the auth-stamp column — in filters, joins, GROUP BY and aggregates?",
      a: "Four behaviors, one policy. Filters: NULL fails both = and != comparisons, so WHERE shipped_at IS NOT NULL is the stamped population (82) and IS NULL is the union of pending-JIT and declined (21) — state which states that union covers. Joins: NULL keys match nothing, so an unstamped batch never joins on the stamp. GROUP BY: NULLs form one bucket — group by shipped_at and the 21 unstamped rows collapse into a single honest mega-bucket. Aggregates: COUNT(shipped_at) counts stamps, COUNT(*) counts rows, and the gap between them IS the unstamped story. The policy: never IFNULL a stamp to zero or a sentinel date — inventing same-day settlement misstates the latency read; a pending batch has no cycle yet, and that is a population definition, not a cleanup job.",
      tag: "nulls",
    },
    {
      id: "marqeta-t13",
      q: "When does a CASE expression need the ELSE branch — and what silently happens without it?",
      a: "CASE without ELSE returns NULL for every non-matching row — invisible in SUM and COUNT (both ignore NULLs) until a group matches nothing: SUM(CASE WHEN status = 'cancelled' THEN 1 END) over a settled-only cohort is NULL, while the ELSE 0 version is 0 — and a NULL flowing into 100.0 * x / y prints NULL and poisons downstream division. The ELSE 0 is the zero-bucket honesty clause: every decline-share read in this kit writes it, so an empty bucket prints 0 instead of vanishing. The second rule is exhaustiveness: the arms must partition the population — a CASE that maps program tiers to spend limits with a hole between two bands silently drops authorizations into NULL, and a reordered WHEN re-bands every row above the moved edge. Write the ELSE, order the arms, test the boundary values.",
      tag: "case-when",
    },
    {
      id: "marqeta-t14",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — how do you choose on the authorization book?",
      a: "Each counts a different grain, and the choice IS the metric. COUNT(*) counts rows — 103 batches, every status included. COUNT(column) skips NULLs — COUNT(shipped_at) is 82, and the 21-row gap is the unstamped population, which makes the two counts a feature, not a discrepancy. COUNT(DISTINCT customer_id) folds repeats back to clients — 103 batches are 16 programs, and EU's 45 are 8 clients. The trap that fails candidates is the third grain: join order_items for line records and COUNT(*) silently counts 251 authorization lines, not 103 batches. Say out loud 'one row per what?' for every COUNT — the census that reports 45 batches AND 8 clients in one row is exactly the two-grain discipline this kit drills.",
      tag: "aggregation",
    },
    {
      id: "marqeta-t15",
      q: "Why is an average of per-market average batch values wrong, and what do you compute instead?",
      a: "Because it weights every market equally regardless of size. On this db the regional averages run EU 335.32 (45 batches), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2) — averaging those four numbers gives 364.67, which describes a platform that does not exist; the true all-platform average is 338.19, where LATAM's two batches barely register. The honest options: re-aggregate from the base rows (SUM(total) over everything divided by COUNT(*)), or re-weight the group averages — SUM(avg * n) / SUM(n), the same arithmetic one level up. The interview move is naming WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and on a concentration-driven platform — 63.5% of volume from four clients — that assumption is not just wrong, it is expensive.",
      tag: "aggregation",
    },
    {
      id: "marqeta-t16",
      q: "IN (SELECT …) versus EXISTS (SELECT …) — which do you reach for when risk asks for programs with limits configured but no authorizations this month?",
      a: "EXISTS, and the reason is the NULL trap plus intent. NOT IN over a subquery that returns even one NULL makes every comparison UNKNOWN and the list silently empties — the classic staging-table bug, and empty control reports are how risk finds out a month late — while NOT EXISTS short-circuits on the first match and never trips on NULLs. IN is fine for small static-looking sets from clean dimensions; EXISTS is the presence test that survives messy data. The third shape, LEFT JOIN + IS NULL, is the row-honest version when you also want the unmatched rows' columns. On this db the client-side anti-join returns a confident zero — all 16 programs transact somewhere — and the money-side anti-join is where the real findings live: 6 statements worth 15,217 that no funding leg ever touched. Name which side you are standing on before writing either.",
      tag: "subqueries",
    },
    {
      id: "marqeta-t17",
      q: "Your TPV doubles after joining authorization line records. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts: COUNT(*) on orders alone is 103; on orders JOIN order_items it is 251 — the jump is the fan-out, each multi-line batch repeating its total on every line record. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which batches carry multiple lines. Then fix by grain: for batch-grain TPV, pre-aggregate line records to batch grain in a CTE (SUM by order_id) and join that — one row per batch, totals intact; for line-record-grain reads, keep the join and use COUNT(DISTINCT o.id) for any entity count, with every ratio naming its denominator. The number to never ship: SUM(o.total) over the raw join, which inflates the 34,833.28 TPV by roughly 2.4x. Pre-aggregate-then-join is the muscle; the before-and-after count is the habit.",
      tag: "joins",
    },
    {
      id: "marqeta-t18",
      q: "Where does a self-join earn its keep on an issuing platform?",
      a: "Anywhere two rows of the same table must meet. Duplicate authorizations: join the batches table to itself on card token where the two ids differ, the amounts match, and the timestamps sit within a burst window — the near-duplicate-capture screen that precedes every chargeback review. Program-to-program structures: umbrella clients with sub-programs are parent-child relations inside one clients table, walked with a self-join plus a depth counter. Velocity pairing: two authorizations from the same program inside the control window, each individually under the review threshold — a self-join on proximity is how the pattern becomes countable. The discipline a self-join forces is alias hygiene — a and b with an explicit inequality (a.id < b.id) to avoid mirrored pairs — and the classic bug is forgetting the inequality and pairing every row with itself. Name the two aliases' roles out loud and the query writes itself.",
      tag: "joins",
    },
    {
      id: "marqeta-t19",
      q: "What makes a predicate sargable, and which habits keep the issuing-ops dashboards cheap?",
      a: "Sargable means the predicate can use an index: the bare column compares to a value. SUBSTR(created_at, 1, 7) = '2024-03' wraps the column in a function and forces a scan of every batch; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' — same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question instead of joining first and filtering after. On tables that grow with every authorization the platform processes, these are not micro-optimizations — they are why the Monday decline map renders before the risk review starts.",
      tag: "performance",
    },
    {
      id: "marqeta-t20",
      q: "Money is stored in INTEGER cents on the funding tables. Where does that discipline earn its keep, and where does it usually break?",
      a: "It earns its keep at every comparison and every sum. The break points: amount_cents / 100 is integer division and truncates odd cents silently — the dollar read is always amount_cents / 100.0; ROUND in mid-pipeline discards precision a later SUM still needed; and REAL comparisons after conversion make equality unreliable, which is why the JIT ledger trial balance compares 181080 against 181080 in cents and only converts at the presentation edge. The policy I state in reviews: aggregate in cents, convert once, round only what a human reads, and let a delta-zero check prove the pipeline — the coverage census footing 65,612 billed against 65,612 funded on the exact block is only provable because nothing was rounded away en route. On an interchange-margin business, a lost cent per leg is a P&L line.",
      tag: "numbers",
    },
    {
      id: "marqeta-t21",
      q: "UNION versus UNION ALL — when is the dedupe correct business logic and when is it a silent bug?",
      a: "UNION ALL concatenates and that is the honest default: per-rail funding rows stacked under a grand total, this month's batches above last month's — branches that are logically disjoint, where every row belongs. UNION adds a distinct pass over the combined set, correct only when a duplicated row would double-count — and a silent bug when duplicates are the signal: an ops digest that lost one client's row to a whole-row collapse across branches had a UNION bug that printed no error at all. The discipline: default to UNION ALL, add the branch-label column so rows can never be byte-identical, and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse. On a settlement close, a dedupe you cannot explain is an audit finding.",
      tag: "set-ops",
    },
    {
      id: "marqeta-t22",
      q: "How does WITH RECURSIVE model a rolling-reserve release schedule — and what stops it?",
      a: "Two members. The anchor SELECT seeds month 0: hold balance, release rate, any fixed monthly release. The recursive SELECT reads the CTE itself — that self-reference is the recursion — and computes the next month: release = balance × rate, remaining = balance − release. The terminator is a WHERE in the recursive member: remaining > 0, or a month counter under the schedule length — without it the CTE runs forever (SQLite caps it, then errors). This is how settlement pods model reserve runoff set-based: no cursor, no loop, one query returning every month of every program's schedule, and the same shape walks accrued-interest or installment plans. The interview follow-up is always 'what stops it?' — name the terminator, or admit you would have shipped an infinite loop.",
      tag: "ctes",
    },
    {
      id: "marqeta-t23",
      q: "Before you write a single line of the program-tiering report, what do you pin down?",
      a: "The definition, in writing. Four decisions: the event (authorization batches booked — including pending-JIT and declined, or settled only?), the numerator (clients above the enterprise line — lifetime SUM(total) > 3,000), the denominator (all 16 programs, or only programs past pilot — the two can disagree by double digits), and the window (lifetime, or trailing quarter?). Then the discipline move: encode the definition as a named CTE — enterprise_clients AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 3000) — so the SQL IS the definition and a reviewer can audit it instead of arguing with you. Platform metrics die by drift: 'active program' must mean the same thing in the risk deck and the revenue deck. The analyst who says 'enterprise means 3,000-plus lifetime settled volume, strict, lifetime' owns the room.",
      tag: "metrics",
    },
    {
      id: "marqeta-t24",
      q: "The lifecycle dashboard's settled count moved overnight. What do you check in the first ten minutes?",
      a: "Five checks, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's batch count versus the 7-day average, because a half-loaded feed halves every downstream number. Reconciliation: the one-pass status census must still sum to 103 — 52 + 30 + 14 + 7 — and a branch that fails the identity is the incident. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for retry-duplicated authorizations. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a stamp column that went 21% to 40% NULL moves every settled-rate and latency read built on it. On this db that ritual is how the paid-status-no-legs statement (#28, 1,756.00) surfaces: status says paid, legs say zero. The deliverable is which check passed and when — not 'looks fine'.",
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
    {
      id: "marqeta-mcq-11",
      prompt: "How many of the 103 authorization batches carry NO shipped_at stamp — and who are they?",
      choices: ["14 — the pending-JIT rows", "21 — the 14 pending-JIT plus the 7 declined", "7 — the declined rows", "82 — the stamped rows, listed inversely"],
      answer: 1,
      why: "The auth stamp lands only once an authorization is in flight: 82 of 103 batches carry it. The other 21 are the 14 pending-JIT-funding decisions AND the 7 declined by controls — neither population ever gets a stamp. WHERE shipped_at IS NULL returns the union, not the pending queue alone.",
      notes: [
        { choice: 0, why: "Pending is a status, not a NULL test. Status = 'pending' returns 14; shipped_at IS NULL returns 21 — declined batches were never stamped either, and NULL can't say which state caused it." },
        { choice: 2, why: "Declined is 7 by status, but their shipped_at is equally NULL. Filtering on absence of a stamp conflates two control states into one bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-12",
      prompt: "The settlement spine needs one row per booking month, 2024-01 through 2025-02 (14 buckets). Which GROUP BY key builds it?",
      choices: ["STRFTIME('%m', created_at)", "SUBSTR(created_at, 1, 7)", "STRFTIME('%Y', created_at)", "MONTH(created_at)"],
      answer: 1,
      why: "SUBSTR(created_at, 1, 7) keeps year plus zero-padded month — 14 distinct buckets on this db. STRFTIME('%m') merges January 2024 with January 2025 (12 rows); '%Y' collapses to 2; MONTH() is not a SQLite function.",
      notes: [
        { choice: 0, why: "Month without year is the classic spine bug: two Januarys fold into one and the ops call reads a phantom spike. Always keep the year in the bucket key." },
        { choice: 2, why: "Year-only gives 2 buckets — a trend read with no months in it. The spine's grain IS the month." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-13",
      prompt: "`SELECT status, COUNT(*) FROM orders GROUP BY status` — how many rows come back, and what do they read?",
      choices: ["3 rows — delivered, shipped, pending", "4 rows — 52, 30, 14, 7", "16 rows — one per client", "1 row — 103 total"],
      answer: 1,
      why: "GROUP BY status folds 103 batches into one row per distinct status: cleared-and-settled 52, authorized-in-flight 30, pending-JIT 14, declined 7 — the four arms of the lifecycle census that must reconcile to 103 by construction.",
      notes: [
        { choice: 0, why: "Four statuses live on this db — forgetting 'cancelled' silently deletes the decline story from the census. The 52+30+14+7=103 identity catches it." },
        { choice: 3, why: "Without GROUP BY, COUNT(*) prints one row — the total, not the mix. The mix is the control read; the total is its footer." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-14",
      prompt: "A billing rollup LEFT JOINs statements to settlement funding legs; the 6 never-funded statements arrive with NULL cents. What does the funded column print without a guard?",
      choices: ["0", "NULL", "The billed amount", "The statement count"],
      answer: 1,
      why: "SUM over a group with no rows is NULL, not zero — the never-funded block prints a blank funded column unless the query wraps it: COALESCE(SUM(p.amount_cents), 0). The dunning list then reads 0 funded instead of a hole.",
      notes: [
        { choice: 0, why: "Zero is the BUSINESS answer but not the SQL default — aggregates over empty sets return NULL. COALESCE is the policy, not the engine's habit." },
        { choice: 2, why: "Nothing makes NULL fall back to billed — that would misstate the claim as funded money. Billed and funded must stay independent columns." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-15",
      prompt: "The client census is ordered by batches DESC. Which query returns just the SECOND-heaviest market?",
      choices: ["ORDER BY COUNT(*) DESC LIMIT 2", "ORDER BY COUNT(*) DESC LIMIT 1 OFFSET 1", "ORDER BY COUNT(*) ASC LIMIT 1", "ORDER BY COUNT(*) DESC OFFSET 2"],
      answer: 1,
      why: "DESC ranks EU 45, APAC 37, US 19, LATAM 2; LIMIT 1 OFFSET 1 skips the first row and returns APAC. LIMIT 2 returns a top-two read, ASC LIMIT 1 returns LATAM, and OFFSET without LIMIT isn't a cut.",
      notes: [
        { choice: 0, why: "LIMIT 2 returns the top TWO markets — a different deliverable. The 'nth' ask is the OFFSET skill, with the tie follow-up always behind it." },
        { choice: 2, why: "ASC LIMIT 1 returns the SMALLEST market — a correct query answering the opposite question. Direction errors look like ranking errors." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-16",
      prompt: "Count the batches booked in March 2024 (8 of them) for the monthly program-billing extract. Which WHERE clause is the professional default?",
      choices: ["BETWEEN '2024-03-01' AND '2024-03-31'", "created_at >= '2024-03-01' AND created_at < '2024-04-01'", "SUBSTR(created_at, 6, 2) = '03'", "created_at LIKE '2024-03%'"],
      answer: 1,
      why: "The half-open range [Mar 1, Apr 1) keeps every instant of March — including the last night's authorizations, which is exactly when batch volume lands. BETWEEN '2024-03-01' AND '2024-03-31' drops everything after midnight on the 31st; LIKE and SUBSTR forms work but can't use an index.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends, so '2024-03-31 14:22:00' falls outside '2024-03-31'. Month-end is precisely when the missing rows hurt the billing extract." },
        { choice: 3, why: "LIKE works on TEXT timestamps but wraps the column in a pattern match — a full scan at extract scale, and fragile if the format gains precision." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-17",
      prompt: "`SELECT COUNT(*) FROM orders WHERE status = declined` errors. What is the engine actually saying?",
      choices: ["declined must be wrapped in ROUND()", "declined is read as a column name — and there is no such column on orders", "COUNT(*) cannot follow a WHERE clause", "The query needs GROUP BY to use a literal"],
      answer: 1,
      why: "Unquoted text is an identifier: the engine looks for a column called declined, fails with 'no such column', and stops. Status literals are TEXT and need single quotes: status = 'cancelled' on this db — where the declined stage is spelled cancelled.",
      notes: [
        { choice: 0, why: "ROUND is numeric grammar — irrelevant here. The error is lexical: bare words resolve as identifiers, not values." },
        { choice: 2, why: "COUNT(*) after WHERE is perfectly legal — every census in this kit is exactly that shape. The error is the bare word, not the clause order." },
      ],
      difficulty: "easy",
    },
    {
      id: "marqeta-mcq-18",
      prompt: "Which expression computes auth-to-settle latency in days on this SQLite warehouse?",
      choices: ["DATEDIFF(day, created_at, shipped_at)", "julianday(shipped_at) - julianday(created_at)", "shipped_at - created_at", "strftime('%d', shipped_at) - strftime('%d', created_at)"],
      answer: 1,
      why: "julianday converts each timestamp to a fractional day count, so the difference IS the elapsed days — 2.98 on average across the 82 stamped batches. DATEDIFF does not exist in SQLite; subtracting TEXT timestamps yields 0; day-of-month arithmetic breaks across month boundaries.",
      notes: [
        { choice: 0, why: "DATEDIFF is SQL Server dialect. Reaching for it in a SQLite screen is a dialect tell the interviewer notes — know your engine's date toolkit." },
        { choice: 2, why: "TEXT minus TEXT coerces to numbers and returns 0 — silently. A latency dashboard built on it reads same-day settlement forever." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-19",
      prompt: "Batches (103) join authorization line records (order_items, 251). `SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id` returns what, relative to true TPV?",
      choices: ["Exactly 34,833.28 — the join is clean", "Inflated — each batch's total repeats once per line record, roughly 2.4x", "Deflated — the join drops multi-line batches", "Zero — REAL totals cannot be SUMmed after a join"],
      answer: 1,
      why: "The join fans 103 batches out to 251 rows, and each batch's total rides along on every line record — SUM(o.total) over the join inflates TPV roughly 2.4x. Batch-grain volume requires pre-aggregating line records to batch grain first (SUM by order_id in a CTE), then joining.",
      notes: [
        { choice: 0, why: "The join is referentially clean — every line record matches a batch. Clean matches are exactly what makes the inflation silent: no NULLs, no misses, just multiplicity." },
        { choice: 2, why: "Fan-out never drops rows — it multiplies them. The 34,833.28 TPV is the SUM over batches alone, or over pre-aggregated line records." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-20",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 END) versus SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) — when do they return different numbers?",
      choices: ["Never — the ELSE 0 is cosmetic", "When a group contains ONLY non-declined batches: the first returns NULL, the second 0", "When the group contains NULL statuses", "Only when COUNT is used instead of SUM"],
      answer: 1,
      why: "CASE without ELSE yields NULL for non-matching rows, and SUM ignores NULLs — so mixed groups aggregate identically. But a group where NOTHING matches sums to NULL on the first form and 0 on the second, and a NULL flowing into 100.0 * x / y prints NULL and poisons downstream division. The ELSE 0 is the zero-bucket honesty clause.",
      notes: [
        { choice: 0, why: "On a per-market decline map it happens to never differ — LATAM's zero prints either way. But filtered grains and staging tables trip it constantly; the ELSE is the habit, not the fix." },
        { choice: 2, why: "NULL statuses inside a mixed group contribute NULL to both forms equally — SUM skips them either way. The divergence is the all-non-matching group." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-21",
      prompt: "`SELECT * FROM client_ladder WHERE velocity_rank = 1` fails — velocity_rank is computed by RANK() OVER (...) in the same SELECT. Why?",
      choices: ["RANK() must be wrapped in ROUND()", "Window functions evaluate in the SELECT stage — WHERE runs earlier and cannot see their output", "Rank columns need an alias before filtering", "WHERE cannot reference any computed column, ever"],
      answer: 1,
      why: "The logical pipeline runs FROM → WHERE → GROUP BY → SELECT (windows live here) → ORDER BY. WHERE executes before the window exists, so the filter errors or misses. The fix is staging: compute the rank in a CTE, filter rn = 1 in the outer SELECT — the two-step shape behind every top-N-per-group read.",
      notes: [
        { choice: 2, why: "Aliases are a red herring — even the underlying COUNT(*) in WHERE errors, because groups don't exist yet. The stage order is the whole answer." },
        { choice: 3, why: "WHERE happily uses computed columns when they are computed EARLIER (in a subquery or CTE). The restriction is stage timing, not computeds." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-22",
      prompt: "`GROUP BY shipped_at` over the 103 batches — how many rows come back, and what is the biggest bucket?",
      choices: ["82 rows; the biggest is one timestamp", "21 rows; the NULL bucket holds all 21 unstamped batches", "103 rows; every value is distinct", "14 rows; one per month"],
      answer: 1,
      why: "SQL groups NULLs together as one bucket: the 21 rows with no auth stamp (14 pending-JIT + 7 declined) collapse into a single NULL row, and the 82 stamped rows split by exact timestamp. A GROUP BY on a sparse column always asks 'where do the NULLs land?' — the answer is one honest mega-bucket.",
      notes: [
        { choice: 0, why: "82 counts the stamped rows, but each distinct timestamp is its own group — and the 21 NULLs don't vanish, they merge. The NULL bucket is the row a stamp-coverage report leads with." },
        { choice: 2, why: "Stamped timestamps DO repeat (same-day settlements), but even if all were distinct, the NULLs would still collapse to one row — never 103." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY lifetime_volume DESC) across the 16 program clients builds the enterprise-pod tiering. What lands in tier 1?",
      choices: ["The 4 heaviest clients — the 24/17/14/13 batch ladder", "The 4 lightest clients", "All 16 clients, split by median", "The clients above 3,000 lifetime volume"],
      answer: 0,
      why: "NTILE(4) deals clients into four ranked tiles in ORDER BY sequence — descending volume puts the top four (Alice Chen's program 24, then 17, 14, 13 batches) in tier 1. 16 clients divide evenly into 4-per-tier; the 3,000-plus line happens to fall between tiers, which is why thresholds and tiles are different tools.",
      notes: [
        { choice: 1, why: "Tiles follow the ORDER BY — descending puts the biggest first. Ascending would label the lightest programs 'tier 1' and the pod's book would invert." },
        { choice: 3, why: "NTILE cuts by ROW COUNT, not by value — tier 1 is the heaviest four clients, whatever their dollar line. The 3,000 threshold is a CASE/HAVING decision, not a tile boundary." },
      ],
      difficulty: "medium",
    },
    {
      id: "marqeta-mcq-24",
      prompt: "A rolling-reserve release schedule is built WITH RECURSIVE reserve AS (anchor UNION ALL recursive-step). What does the recursive member reference?",
      choices: ["The invoices table, once per month", "The reserve CTE itself — each step reads the prior month's remaining hold", "A cursor that walks the months", "The payments table joined to itself"],
      answer: 1,
      why: "A recursive CTE's second SELECT reads the CTE being defined: month 0 comes from the anchor (hold balance, release rate), and each step computes the release and the remaining hold — then feeds itself the next month. That self-reference is what 'recursive' means, and it is how settlement pods model reserve runoff without cursors.",
      notes: [
        { choice: 0, why: "The invoices table seeds the anchor only. Re-referencing it per month would restart the hold every step — the reserve would never release." },
        { choice: 3, why: "Payments are inputs to the step's arithmetic, not the recursion's spine. The spine is the CTE's own prior output." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-25",
      prompt: "One row per market with each market's share of the 34,833.28 TPV: `SELECT c.region, ROUND(100.0 * SUM(o.total) / {X}, 1)` — what is {X}?",
      choices: ["COUNT(*)", "SUM(SUM(o.total)) OVER ()", "MAX(o.total)", "103"],
      answer: 1,
      why: "SUM(o.total) is already a per-market aggregate, so the denominator needs the grand total over all rows of the folded result: SUM(SUM(o.total)) OVER () — a window over an aggregate, evaluated after GROUP BY. COUNT(*) counts markets, MAX is one batch's biggest total, and the literal 103 is a row count wearing a dollar denominator's name.",
      notes: [
        { choice: 0, why: "COUNT(*) is 4 here — dividing dollars by market count is the category error. The denominator must be dollars." },
        { choice: 3, why: "103 batches is a count, not a value — and hardcoding it breaks the moment the db changes. Windows compute the grand total from the data." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-26",
      prompt: "Return the ids of statements that have NO funding legs, as a set difference: `SELECT id FROM invoices {X} SELECT invoice_id FROM payments` — which keyword is {X}?",
      choices: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answer: 0,
      why: "EXCEPT keeps rows in the left set that never appear in the right — the 6 never-funded statement ids, #28's paid-status lie included. INTERSECT returns the funded set (22), UNION concatenates both populations (28 ids), and UNION ALL does the same without dedupe. The anti-join's twin in set-operator clothing.",
      notes: [
        { choice: 1, why: "INTERSECT answers 'which statements HAVE legs' — the mirror image. Direction of the diff is the entire question." },
        { choice: 2, why: "UNION answers 'who is in either population' — all 28. Useful for a coverage census, useless for a dunning list." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-27",
      prompt: "Two predicates return the same March rows: SUBSTR(created_at, 1, 7) = '2024-03' versus created_at >= '2024-03-01' AND created_at < '2024-04-01'. Why does the second win in production?",
      choices: ["It is shorter", "It is sargable — the bare column compares to a constant, so an index on created_at can be used; SUBSTR wraps the column and forces a full scan", "SQLite cannot run SUBSTR on timestamps", "The range form rounds timestamps to midnight"],
      answer: 1,
      why: "Sargable means the predicate compares the bare column to a value, leaving the index usable. Wrapping the column in SUBSTR hides it from the index — every row gets the function applied. Same rows, different cost profile: at issuing-platform table sizes that is the difference between a dashboard that renders and one that times out.",
      notes: [
        { choice: 2, why: "SQLite runs SUBSTR on text timestamps all day — correctness is not the issue. Cost is." },
        { choice: 3, why: "No rounding happens — the range is exact on timestamps. The win is index usage, not precision." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-28",
      prompt: "The JIT funding double-entry closes with debits 181,080 and credits 181,080 cents. Why does settlement compare IN CENTS instead of a rounded dollar figure?",
      choices: ["Cents avoid REAL arithmetic drift — per-row /100.0 conversion plus rounding can accumulate differences that break an equality check", "Cents sort faster than dollars", "Dollars cannot be SUMmed in SQLite", "The ledger stores both formats and cents is the backup"],
      answer: 0,
      why: "The delta-zero gate is an equality test, and equality dies under accumulated rounding: divide each row by 100.0, round for display, then compare — two 'equal' sides can differ by a cent no viewer can see. Aggregate in INTEGER cents, compare, and convert to dollars once at the presentation edge.",
      notes: [
        { choice: 1, why: "Sort cost is nanoseconds-scale noise. The gate is about arithmetic exactness, not speed." },
        { choice: 2, why: "SQLite sums REALs happily — the problem is that REAL equality after rounding is a coin flip. The format is the policy, not a capability." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-29",
      prompt: "Walk funded dollars WITHIN each statement: `SELECT invoice_id, paid_on, SUM(amount_cents) OVER ({X}) AS running_funded FROM payments ORDER BY invoice_id, paid_on`. What is {X} for the five split-funding statements to walk independently?",
      choices: ["ORDER BY paid_on", "PARTITION BY invoice_id ORDER BY paid_on", "PARTITION BY paid_on", "GROUP BY invoice_id"],
      answer: 1,
      why: "PARTITION BY invoice_id restarts the running sum per statement — each of the five two-leg statements (#1, #5, #12, #19, #22) walks its own 0 → leg 1 → leg 2 progression — and ORDER BY paid_on sequences the legs. Without the partition, the sum runs across ALL 27 legs and smears one statement's funding into the next statement's balance.",
      notes: [
        { choice: 0, why: "ORDER BY alone is a global window: leg 3 of statement #1 inherits statement #2's first leg. The running total must reset where the business unit resets." },
        { choice: 3, why: "GROUP BY collapses rows — a running total that loses its legs is not a walk. Windows keep every row; that is the point." },
      ],
      difficulty: "hard",
    },
    {
      id: "marqeta-mcq-30",
      prompt: "A staging-table decline share divides declined by batches, and one filtered market has ZERO batches. Which denominator guard keeps the query alive?",
      choices: ["ROUND(denominator, 0)", "NULLIF(batches, 0) — division by NULL yields NULL instead of an error", "COALESCE(batches, 1)", "CAST(batches AS REAL)"],
      answer: 1,
      why: "Division by zero crashes the read; NULLIF(x, 0) turns the zero into NULL, and any share divided by NULL is NULL — an honest 'no base' rather than a crash or an invented percentage. The NULL-propagating behavior that plagues NOT IN is exactly what makes this guard work.",
      notes: [
        { choice: 0, why: "ROUND changes display precision, not zero-ness. Zero remains zero and the division still fails." },
        { choice: 2, why: "COALESCE fires on NULL, not on zero — and substituting 1 fabricates a denominator, printing a share for a market with no batches. A lie with better manners than a crash." },
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
    {
      id: "cs-marqeta-3",
      tier: "medium",
      topic: "s6",
      universe: "fraud",
      title: "The JIT decline map",
      brief:
        "Marqeta-flavored brief on the storefront db: the Monday risk review reads the JIT decline map — every market's decline share with its batch base beside it, because a share without its denominator is a rumor, and a share off a tiny base is noise. Probed on the storefront db: 103 batches split delivered 52 / shipped 30 / pending 14 / cancelled 7; declines by market run APAC 8.1% (3 of 37), EU 6.7% (3 of 45), US 5.3% (1 of 19), LATAM 0.0% (0 of 2). The map keeps markets whose base clears the floor — at least 19 batches — so every printed share carries a real denominator, and the sub-floor market is the named omission, not a hidden one. Shares report to 1 decimal, matching the risk deck.",
      ask: "Return each declining market with batch count, declined count, and decline share to 1 decimal — worst share first.",
      template:
        "WITH per_market AS (\n  SELECT c.region AS market,\n         COUNT(*) AS batches,\n         SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS declined\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT market, batches, declined,\n       ROUND(100.0 * declined / batches, {2}) AS decline_pct\nFROM per_market\nWHERE batches >= {3}\nORDER BY decline_pct {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined-arm literal",
          why: "Declined by JIT controls is status 'cancelled' — 7 batches, 3 in APAC and EU each, 1 in the US. 'pending' would count the 14 pending-JIT batches as declines and the control map would indict the funding queue instead of the controls.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The risk deck prints shares to 1 decimal — 8.1 / 6.7 / 5.3, exactly the probed map. Precision 2 prints 8.13 and drifts off the published slide; precision 0 rounds 6.7 to 7 and EU overtakes nothing but looks tied with nothing, which is worse.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the batch-base floor",
          why: "WHERE batches >= 19 keeps the three markets whose shares carry real denominators — EU 45, APAC 37, US 19. A floor of 2 would print LATAM's 0-of-2, a share off a base too small to defend in a risk review; the sub-floor market is the named omission.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-share-first direction",
          why: "Risk reads worst control outcome first: APAC 8.1 on top, then EU 6.7, US 5.3. ASC would lead with the best-behaved market and bury the 8.1 the review exists to discuss.",
        },
      ],
      distractors: ["'pending'", "'shipped'", "2", "37", "ASC", "0"],
      walkthrough:
        "Two stages: fold the control outcome per market, then attach the share. The CTE joins every batch to its client's market and folds with a SUM(CASE) arm — cancelled reads 3, 3, 1, 0 against batch bases 45, 37, 19, 2. The outer SELECT filters the base first — WHERE batches >= 19 keeps EU, APAC and US and names LATAM's 2-batch base as sub-floor — then divides declined by batches with the 100.0 multiplier first and ROUND to 1 decimal: APAC 8.1, EU 6.7, US 5.3, the probed map verbatim. The floor is the quiet lesson: a share off a tiny base is noise dressed as a signal, and the honest move is naming the omission rather than printing 0.0% of 2. The distractors fail honestly: 'pending' re-counts the 14 pending-JIT batches as declines and every share lies at once; 'shipped' counts in-flight batches — a funding-exposure map wearing a decline map's name; 2 in the floor prints LATAM's noise share, 3 drops the US and its 5.3; 2 or 0 in the precision slot re-rounds the shares off the slide; ASC leads with the best share. Say the denominator out loud — '8.1% of 37, not of 103' — and the map survives the risk review.",
    },
    {
      id: "cs-marqeta-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The client velocity ladder",
      brief:
        "Marqeta-flavored brief on the storefront db: the enterprise pod builds the client velocity ladder every quarter — which programs carry the deepest authorization volume, with ties shown as ties, because four clients sitting at 4 batches each are four equally-healthy programs. Probed facts: the ladder runs Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5 — then the four-way tie at 4 (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer), then two clients at 3. RANK semantics are the published policy: ties share a rung and the next rung skips — the two 3-batch clients land on rank 10, not 7. The ladder decides which programs get the next risk review, so the tie policy is a governance decision, not syntax.",
      ask: "Return each client with at least 3 batches, their batch count, and a shared-rung velocity rank that keeps gaps honest — heaviest first.",
      template:
        "SELECT c.name AS client,\n       COUNT(*) AS batches,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS velocity_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\nHAVING COUNT(*) >= {3}\nORDER BY velocity_rank, client;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "RANK gives the four-way tie at 4 the same rank (6, 6, 6, 6) and hands the next distinct count rank 10 — the skip IS the tie's footprint. ROW_NUMBER would split the four clients arbitrarily, inventing a pecking order for the risk-review queue that governance never decided.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The ladder ranks deepest program first, so the window's ORDER BY runs descending. ASC would crown the 3-batch clients rank 1 and make the 24-batch anchor program look like the tail of the platform.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 clients — the 24/17/14/13/5 head, the four-way tie at 4, AND the two 3s that make the skip-to-10 visible. A floor of 4 amputates the two 3-batch clients and the rank arithmetic loses its proof.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4", "SUM"],
      walkthrough:
        "A fold, a floor, and a window. GROUP BY client folds 103 batches into 16 program rows; HAVING COUNT(*) >= 3 keeps the 11 that clear the floor — the probed ladder verbatim: 24, 17, 14, 13, 5, then the four-way tie at 4, then the two 3s. RANK() OVER (ORDER BY COUNT(*) DESC) numbers them 1 through 5, shares rank 6 across the tie, and stamps the two 3-batch clients rank 10 — ranks 7, 8, 9 consumed by the tie and visibly skipped, exactly the gap-honest behavior the published policy asks for. The floor is the quiet star: without the two 3s, RANK and DENSE_RANK print identical output (6, 6, 6, 6 and nothing after), and the case loses its lesson. The distractors fail honestly: DENSE_RANK compacts the tie block (the 3s land on 7, no gap — a different rank policy wearing the same query); ROW_NUMBER deals the four tied clients ranks 6 through 9 arbitrarily — which on a risk-review queue is a governance decision made by accident; ASC inverts the ladder; 4 in the floor drops the proof rows; SUM as the ranker or inside the window's ORDER BY errors outright. Say the rank sequence out loud — 1, 2, 3, 4, 5, 6, 6, 6, 6, 10, 10 — and the tie policy explains itself.",
    },
    {
      id: "cs-marqeta-5",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The GPA funding-rails stack",
      brief:
        "Month-close brief, in-world: the settlement pod reconciles the funding rails — every GPA funding leg classified by rail, with a labelled TOTAL row underneath so the stack foots to the cash account in one read. Probed on the storefront db: 27 funding legs totalling 69,612.00 — card rail 16 legs for 37,364.00, wire rail 11 legs for 32,248.00 (57.7% card / 42.3% wire). Money sits in INTEGER cents; the TOTAL branch must scan the unfiltered payments table, and UNION ALL stacks the grand row beneath the per-rail rows without a dedupe pass. The close reads biggest cents first, so the TOTAL row floats to the top.",
      ask: "Return legs and cents per funding rail, plus a labelled TOTAL row for the whole ledger — biggest cents first.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       SUM(amount_cents) AS cents\nFROM payments\nGROUP BY {1}\nUNION ALL\nSELECT {2},\n       {3}(*) AS legs,\n       SUM(amount_cents) AS cents\nFROM payments\nORDER BY cents {4};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail key",
          why: "GROUP BY method folds the 27 legs into the two rails — card 16 / 3,736,400, wire 11 / 3,224,800. GROUP BY anything else either errors or folds the legs into a bucket that is not a rail, and the reconciliation stops footing.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The second branch must label itself: the literal 'TOTAL' marks the row that scans the unfiltered ledger. An unlabeled grand row is indistinguishable from a third rail — and a rail named by accident reconciles to nothing.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the all-in leg counter",
          why: "The TOTAL row counts the whole ledger — 27 legs, not a rail's 16 or 11 — because its cents column (6,961,200) is the unfiltered grand total. Pinning the count keeps the row honest even if the detail fold upstream changes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-cents-first direction",
          why: "ORDER BY cents DESC floats the TOTAL row (6,961,200) to the top, card under it, wire last — the close reads the grand number first. ASC would bury the total under the rails and the footing check starts with a hunt.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "wire", "16"],
      walkthrough:
        "Two branches, one stack. The detail branch GROUPs the 27 funding legs by rail — card 16 legs / 3,736,400 cents, wire 11 / 3,224,800 — and the TOTAL branch re-scans the unfiltered payments table: 27 legs and 6,961,200 cents, so the report shows the rails against the whole ledger without a second query. UNION ALL is the join between grains — no dedupe pass, and the outer ORDER BY cents DESC floats the TOTAL row to the top, card 57.7% of cents under it, wire 42.3% last. In dollars: 37,364.00 + 32,248.00 = 69,612.00, the number that must foot to the cash account before the close ships. The distractors fail honestly: SUM as the rail key is a misuse-of-aggregate error, SUM as the label or the counter errors too; MAX in any slot errors outright; ASC pushes the TOTAL row to the bottom — same numbers, worse close; wire in the label slot errors on a missing column and 16 in the counter slot undercounts the grand row to one rail's worth. Every distractor breaks a different promise of the reconciliation.",
    },
    {
      id: "cs-marqeta-6",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The never-funded dunning list",
      brief:
        "Month-close brief, in-world: billing refreshes the dunning list before a single reminder sends — the program statements that no GPA funding leg has EVER touched, where billed is a claim and payment rows are the ledger. Probed on the storefront db: 28 statements, 22 of which carry funding legs; the 6 that never funded are worth 15,217.00 — INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00), INV-2024-021 (1,295.00), INV-2024-018 (873.00). Anomaly #28 is marked 'paid' with zero legs — the status that lies — and it is exactly why the anti-join keys on payment rows, not the status column. Biggest claim first.",
      ask: "Return each never-funded statement: number, status, billed dollars to 2 decimals, and its funding-leg count — biggest claim first.",
      template:
        "SELECT i.number,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed,\n       {1}(p.id) OVER (PARTITION BY i.id) AS funding_legs\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the leg counter",
          why: "COUNT(p.id) OVER (PARTITION BY i.id) counts each statement's legs without collapsing rows — 0 for every never-funded row, 2 for the five split-funding statements. A bare COUNT(p.id) would aggregate the whole query into one row; SUM over the window would return NULL, which reads as unknown rather than zero.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements, handing the 6 with no legs a NULL payload the WHERE catches. INNER JOIN silently deletes those 6 rows — the dunning list empties, #28's paid-status lie included, and the close overstates collected money.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched gate",
          why: "p.id IS NULL is the anti-join gate: keep exactly the rows no payment ever matched. IS NOT NULL would return the mirror population — the 22 funded statements — a correct query answering the opposite question.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-claim-first direction",
          why: "The dunning list leads with the biggest exposure: INV-2025-024 at 4,937.00 down to INV-2024-018 at 873.00. ASC would open the call with the smallest claim and bury the 4,937.00 the reminder campaign exists to chase.",
        },
      ],
      distractors: ["SUM", "INNER", "NOT", "ASC", "MAX"],
      walkthrough:
        "An anti-join at statement grain. The LEFT JOIN keeps all 28 statements — 22 match funding legs, 6 arrive with a NULL payload — and WHERE p.id IS NULL keeps exactly those 6: the never-funded list, 15,217.00 of claims with zero legs between them. COUNT(p.id) OVER (PARTITION BY i.id) prints the per-statement leg count without collapsing rows — a bare COUNT here would aggregate the whole query into one row, the classic trap of mixing an aggregate into an anti-join — and the window returns 0 for every row on this list, 2 for the five split-funding statements back on the funded side. ROUND(amount_cents / 100.0, 2) prints dollars cents-safe — 4,937.00 down to 873.00 — and ORDER BY billed DESC leads with the biggest exposure. The anomaly rides on top of the mechanics: #28 reads status 'paid' with zero legs, which is why the list keys on payment ROWS and the status column stays a claim; its mirror, the void statement that DID fund (#11, 925.00), never appears here — the two error modes are opposites, and only the row-level join sees both honestly. The distractors fail honestly: SUM or MAX in the window counter turns 0 into NULL and every escalation rule keyed on zero misfires; INNER JOIN deletes the 6 rows and the dunning list empties while looking valid; NOT in the gate slot flips the population to the 22 funded statements; ASC buries the biggest claim. A dunning list that cannot reproduce these 6 rows is not a close.",
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
    { slug: "ar-aging-schedule", why: "Aged statements by days-past-due is the dunning calendar the billing pod prints at every close — the 21-exact / 1-partial / 6-none coverage census, aged." },
    { slug: "balance-rollforward", why: "Opening plus movements equals closing — the settlement proof that a GPA only moves through booked legs. Roll-forward arithmetic is the close's backbone." },
    { slug: "budget-pacing", why: "Program-management reads spend pacing month-to-date against plan — cumulative windows over the settlement spine, the same shape as the month walk." },
    { slug: "ads-funnel", why: "Client acquisition spend to first authorization is the growth pod's costliest funnel. Stage-by-stage conversion with stated denominators is the drill." },
    { slug: "structuring-detection", why: "Authorization patterns just under review thresholds are the classic control-evasion shape. Threshold-plus-window logic is the AML-flavored screen." },
    { slug: "amount-anomaly-zscore", why: "A funding leg far off its baseline sigma is either a prepayment or a break. Z-score screening over leg amounts is how settlement triages the tail." },
    { slug: "gl-reconciliation", why: "Under the issuing model the JIT ledger must reconcile daily against program balances. This problem is the delta-zero discipline behind the 181,080 gate." },
    { slug: "trial-balance-check", why: "Debits must equal credits before the close ships — the exact gate settlement runs at 181,080 against 181,080. Conditional SUMs over a ledger are the drill." },
    { slug: "expected-credit-loss", why: "Reserve provisioning is a weighted fold: exposure times probability of loss per bucket. The conditional-aggregation shape risk uses for reserve math." },
    { slug: "delinquency-buckets", why: "Statements aging past due (current, 1-29, 30-59, 90+) are the collections map — a CASE-band fold over statement age that leaves no program unclassified." },
    { slug: "credit-utilization-bands", why: "Program health before a limit increase: utilization banded into tiers. Band-classify-then-count is the same CASE discipline the control sheet uses." },
    { slug: "basket-depth-aov", why: "Program depth — batches and value per client — is the enterprise-readiness read. The two-grain ratio, value over batches, drilled." },
    { slug: "funnel-step-conversion", why: "Signed client, first batch, steady volume — the program ramp is a funnel. Step-to-step conversion rates with stated denominators are the drill." },
    { slug: "rfm-segmentation", why: "NTILE client segmentation (recency, frequency, monetary) drives which programs get the next success touch. Quintile windows over client value are the shape." },
    { slug: "cohort-retention-matrix", why: "Do newly signed programs keep transacting? Cohort-offset retention grids over batch activity are the growth pod's home query." },
    { slug: "dormant-reactivation", why: "Clients who issued one batch and went quiet are the winback list. NOT EXISTS dormancy detection is the anti-join shape, with the honest-zero caveat this db teaches." },
  ],
};
