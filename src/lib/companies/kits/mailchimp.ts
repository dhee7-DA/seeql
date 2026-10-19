// Mailchimp — Wave-11 (Task 102), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Email-marketing SQL on a send-funnel angle (distinct from hubspot's full-CRM pipeline framing):
// the storefront db read as a contact-tier and campaign-send sandbox for Mailchimp client accounts —
// customers are client accounts (region = market), orders are billing periods (delivered = sent and
// billed 52, shipped = sent in flight with shipped_at as the send stamp 30, pending = staged awaiting
// the first send 14, cancelled = unsubscribed before send 7), order_items are contact/usage line
// records (quantity = contacts on the line, unit_price = per-contact rate — the seat-band fold maps
// onto the contact-tier ladder), products = plan SKUs (free/essentials/standard/premium; db category
// codes = SKU families), suppliers = integration partners, invoices = billing statements, payments =
// payment rails (card = self-serve, wire = invoiced), expenses = platform opex, ledger_entries = GL.
// Finance tables store INTEGER cents — dollar read = amount_cents/100.0; orders.total and
// order_items.unit_price are REAL dollars. The send-funnel read maps created_at -> shipped_at onto the
// build-to-send clock (82 of 103 periods stamped, 79.6% send-through, 2.98-day average, 2-4 spread)
// and the tier-band fold (unit_price < 55: 268 contacts @ 31.01; >= 55: 230 @ 115.85) onto the
// starter-vs-growth contact mix.
// Pool provenance: company-pools.md carries NO Mailchimp section (0 tagged rows) — the only
// Mailchimp-tagged row anywhere in the file is the theme-menu row first-last-touch-attribution
// (SQL · FIRST_VALUE), adopted here as the pool seed; the remaining 15 problems and all 10 topic slug
// sets are theme-curated from the theme menu's sql rows (no w*/d*/f* rows) and say so in brief P4.
// Facts source: scripts/company-facts.md verbatim, plus probe-derived cells verified read-only against
// db/custom.db on 2026-10-16 and declared here: per-month contact units (50/51/40/34/45/27/22/40/44/
// 33/25/30/24/33 across 2024-01..2025-02, summing to the canonical 498 total units), per-status money
// and client folds (delivered 15 clients / 15,571.07 / 299.44; shipped 10 / 11,996.72 / 399.89;
// pending 8 / 6,113.00 / 436.64; cancelled 4 / 1,152.49 / 164.64), per-market funnel arms (sent 36/29/
// 15/2, awaiting 6/5/3/0 by region), and the contact-walk cells used by cs-mailchimp-2 (Feb peak 51,
// July trough 22, +18 rebound into August, running base closes at 498). Every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: mailchimp is NOT yet in registry COMPANY_META — wire
// id "mailchimp", domainId "saas", name "Mailchimp",
// tagline "Email marketing by SQL: send funnels, contact tiers, deliverability denominators",
// accent "text-yellow-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const mailchimpKit: CompanyKit = {
  id: "mailchimp",
  domainId: "saas",
  name: "Mailchimp",
  tagline: "Email marketing by SQL: send funnels, contact tiers, deliverability denominators",
  accent: "text-yellow-400",

  brief: [
    "**Mailchimp** is the email-marketing platform small businesses grow up on — audiences of contacts, campaigns launched against them, and a billing ladder that charges by contact tier across free, essentials, standard and premium plans. Every number in the building is a conditional count over the same audience base: how many accounts staged a send, how many sends landed, how many contacts each tier carries. This kit maps the storefront db onto that world: the 16 customers rows are client accounts (region = market), the 103 orders are billing periods worth **34,833.28**, and the 251 order_items rows are contact/usage lines — quantity = contacts on the line, unit_price = the per-contact rate. The stage map is fixed: delivered = {emerald:sent and billed} (52, 50.5%), shipped = {sky:sent, in flight} (30, 29.1%), pending = staged awaiting the first send (14, 13.6%), cancelled = {rose:unsubscribed before send} (7, 6.8%).",
    "The data org splits into lifecycle marketing, deliverability and a small finance pod, and all three read the same funnel at different grains. The send heartbeat: a billing period stages at created_at and shipped_at stamps the day the campaign actually went out — **82 of 103 periods** carry the stamp, a **79.6% send-through rate**, with a **2.98-day** average build-to-send window and a 2–4 day spread; the 14 staged-but-unsent periods have no stamp yet, which is a population definition, not a cleanup job. Contact tiers are the second story: 268 contacts ride sub-55 rates (31.01 average line price) against **230 on 55-plus rates** (115.85) — the tier ladder in one CASE fold. Money sits one layer down in INTEGER cents; the dollar read is `amount_cents / 100.0`.",
    "Interview screens are conditional counts with the denominator asked out loud. A loop opens with a **two-grain market census** — EU runs 45 periods from 8 accounts while the US runs 19 from 2 — then escalates into the funnel: *'does your send-through base include the accounts that unsubscribed before sending?'* (here it does — 82 of 103). Then the cadence ladder, where four accounts sit tied at 4 periods and rank semantics become a policy call about peer accounts. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas, band contacts into tier arms with CASE and probe the arm that silently swallows rows. Candidates who state the stamp filter and the audience base before writing SQL are the ones who get callbacks.",
    "Preparation strategy: company-pools.md carries no Mailchimp section — **0 tagged rows** — so thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes; the one exception is first-last-touch-attribution, the only Mailchimp-tagged row in the pool file, adopted as the seed. Do the topics in order, then run the six case studies on the live storefront db: the {violet:send-funnel fate census} the Monday lifecycle review opens with, the {emerald:audience-growth walk} growth reads at every month close, the {sky:cadence ladder} with its four-way tie policy, the one-pass {violet:contact-tier census} the pricing pod re-cuts, the {rose:dunning queue} rebuilt before the blast, and the {sky:booked-value spine} the close ships on. The bar to clear: state the audience base and the stamp filter before you compute anything — then make every fate census reconcile to 103 by construction.",
    "Built for spaced practice rather than one sitting: thirty MCQs ladder easy-to-hard across the stage map, the grains and the window canon; twenty-four theory prompts carry the interview answers said out loud; the six case studies run easy through hard against the live storefront db, every number slot audited against probed figures; and thirty-two problems turn the same drills into reps. Rotate — one case study per sitting, a fistful of MCQs with the whys read aloud, one topic's slug set on the band — and the reflex that persists is population-before-numbers: every report in this building opens with the denominator, and so does every interview answer here.",
  ],

  dayInLife: [
    "**08:10 —** Send-day monitoring opens the day. A lifecycle-marketing analyst checks the overnight send stamps before standup: did every in-flight campaign land its shipped_at, does the one-pass fate census reconcile — 52 sent-and-billed + 30 in flight + 14 awaiting + 7 unsubscribed = **103 by construction**? A branch that fails that identity is *the morning incident*, not a rounding note. Then the drift check: the build-to-send window averages **2.98 days** platform-wide, but the US runs 3.07 against APAC's 2.93 — if the gap widens, the staged-and-stalled queue gets pulled before the weekly send report ships.",
    "**11:30 —** Midday is the tier re-cut and the audience walk. The pricing pod wants the contact ladder re-folded — 268 contacts at 31.01 on sub-55 rates against 230 at 115.85 — because the tier-page copy lives or dies on that split; growth wants the monthly walk: **51 contact adds in February** against the 22-contact July trough, an 18-contact rebound into August, and the running base closing at 498. A regional read goes out beside it: EU's 45 periods from 8 accounts (5.6 per account) versus the US's 19 from 2 (9.5) — *concentration, not breadth, is the US story*. Each ask is a join, a conditional aggregate and one judgment call about which population the denominator holds.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217.00** — before billing sends a single dunning email (the open cohort's blocks run 873.00 to 4,937.00); the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00) against net-30 terms and a 28.4-day average settlement; and the rails get a look — card legs (16, 37,364.00) self-serve against wire legs (11, 32,248.00) invoiced, with 5 statements settling on both. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Send-through rate", what: "Stamped sends over ALL staged periods: 82 of 103, 79.6%. The denominator keeps the 14 awaiting-send and 7 unsubscribed rows in — that is the whole point — because the metric exists to watch the periods that have not sent yet, not to flatter the ones that did." },
    { name: "Build-to-send window", what: "Period staged (created_at) to campaign sent (shipped_at) over stamped rows only: 2.98-day average, 2–4 spread. By market: LATAM 3.5, US 3.07, EU 2.94, APAC 2.93 — the drift map that decides where the staged-and-stalled queue gets pulled." },
    { name: "Campaign fate census", what: "52 sent-and-billed, 30 sent in flight, 14 staged awaiting first send, 7 unsubscribed before send — 103 by construction. Every stage is a conditional count over a status or timestamp, and the arms must reconcile to the staged base or the census is wrong." },
    { name: "Contact-tier mix", what: "268 contacts on sub-55 rates (31.01 average line price) against 230 contacts on 55-plus rates (115.85). The tier ladder in one CASE fold — and the first chart the pricing pod re-cuts before touching tier-page copy." },
    { name: "Contacts per period", what: "251 contact lines across 103 billing periods (2.44 lines per period, max 3 contacts on a line), folding to 498 contacts across the book. Line grain versus contact grain versus period grain — the 'one row per what' discipline the census lives on." },
    { name: "Unsubscribe share by market", what: "Cancelled share of staged periods: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The suppression and winback calendar reads this by the same region rollup every other funnel metric uses — and LATAM's zero sits on 2 periods, a denominator honesty check." },
    { name: "Book concentration", what: "Total booked value 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread; 63.5% of the book sits with accounts spending 3,000-plus lifetime (71.2% above 2,000). One lost logo moves a quarter — the top account alone carries 24 periods." },
    { name: "Statement coverage", what: "Billed versus settled: 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against net-30 terms and a 28.4-day average settlement (13 fastest, 84 slowest). Rails split card (16 legs, 37,364.00) self-serve versus wire (11 legs, 32,248.00) invoiced." },
  ],

  topics: [
    {
      name: "Send-funnel fate counts",
      why: "Every Mailchimp screen starts here: a billing period stages, a campaign goes out, the period bills or dies — staged 103, sent 82, billed 52, and each stage is a conditional count over the same base. The graded skill is keeping the arms exhaustive (billed + in flight + awaiting + unsubscribed = staged) and never calling an in-flight send 'billed' — 30 versus 52 on this db is the trap.",
      slugs: ["email-engagement-funnel", "funnel-step-conversion", "ads-funnel", "median-time-to-convert", "analyze-subscription-conversion", "trial-to-paid-funnel", "customers-who-never-order", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Two-grain market censuses",
      why: "Periods and accounts are different grains of the same join, and every census reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5 periods per account) is the concentration read that steers market spend.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "find-all-unique-email-domains", "percentage-of-users-attended-a-contest", "confirmation-rate"],
    },
    {
      name: "Deliverability denominators",
      why: "Send-through is a rate with a fought-over denominator: 82 of 103 only if the base keeps the awaiting and unsubscribed rows; drop them and the rate inflates to 92.1% without a single extra send. Rates die from silent filtering, so the panel asks the population out loud before looking at the number — the same discipline open rates and click rates live and die by.",
      slugs: ["queries-quality-and-percentage", "friend-requests-i-overall-acceptance-rate", "ab-test-conversion-lift", "ab-sample-ratio-mismatch", "dau-wau-stickiness", "second-day-confirmation", "immediate-food-delivery-ii"],
    },
    {
      name: "Contact-tier bands with CASE",
      why: "Contact tiers are CASE-classified: the band fold splits 251 lines into 268 sub-55 contacts and 230 at 55-plus, and plan SKUs band into free/essentials/standard/premium the same way. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the tier story, and a reordered WHEN quietly re-bands the base the pricing page prints.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "calculate-orders-within-each-interval", "rfm-segmentation", "plan-migration-paths", "net-revenue-retention"],
    },
    {
      name: "Cadence leaderboards",
      why: "Send-cadence boards are rank-window reporting where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5 periods, then FOUR accounts tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax; NTILE cuts the same base into usage tiers when the board wants quartiles instead of ladders.",
      slugs: ["rank-scores", "top-travellers", "usage-tier-percentiles", "compute-the-rank-as-a-percentage", "product-sales-analysis-ii"],
    },
    {
      name: "Audience-growth walks",
      why: "The 14-month spine (2024-01 to 2025-02) is the growth call's home turf: monthly contact adds walk 51 in February down to the 22-contact July trough, an 18-contact rebound into August, and the running base closes at 498. LAG drives the walk and the first row's delta is NULL by definition — the baseline, never a zero. Week-over-week churn and cohort offsets are the same walk pointed at loss instead of adds.",
      slugs: ["week-over-week-churn", "biggest-window-between-events", "growth-accounting", "winback-recovery", "dormant-reactivation", "first-last-touch-attribution", "combine-two-tables", "find-churn-risk-customers"],
    },
    {
      name: "Statement coverage set algebra",
      why: "Board packets stack populations — never-collected beside partial, this quarter beside last — and EXCEPT answers 'which billed statements never drew a settlement leg' (6 of 28 here, worth 15,217.00). UNION dedups whole rows silently, which makes it a correctness question: two byte-identical fate rows collapse and the board loses an account with no error anywhere.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "movie-rating", "delete-duplicate-emails", "keep-latest-dedupe"],
    },
    {
      name: "Nested tier gates",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, because a tier gate over a filtered staging slice that returns nothing is how nurture lists silently ship empty.",
      slugs: ["second-highest-salary", "market-analysis-i", "game-play-analysis-iv", "classes-more-than-5-students"],
    },
    {
      name: "One-pass funnel censuses",
      why: "The ops board wants staged, sent, billed, in-flight and awaiting in ONE scan — FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The correctness argument the panel listens for is the reconciliation identity: the branches plus the unsubscribed residual must sum back to the staged base.",
      slugs: ["active-businesses", "snaps-analysis", "find-stores-with-inventory-imbalance", "rolling-7d-actives", "sales-by-day-of-the-week", "find-users-with-high-token-usage", "sales-analysis-i", "capital-gain-loss"],
    },
    {
      name: "Rails & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the audience world meets money. Every dollar read is amount_cents / 100.0, the rails split card (16 legs, 37,364.00) self-serve from wire (11 legs, 32,248.00) invoiced, and 5 statements settle on both — a split-rail read that breaks any single-rail assumption.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "duplicate-charge-pairs", "mrr-waterfall"],
    },
  ],

  theory: [
    {
      id: "mailchimp-t1",
      q: "Your audience report joins client accounts to billing periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A cadence report joins periods to accounts: a period with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-billing accounts — all 16 client accounts appear in the period table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how audience whitespace reports die in review.",
      tag: "joins",
    },
    {
      id: "mailchimp-t2",
      q: "The send-cadence ladder runs 24, 17, 14, 13, 5 periods, then FOUR accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the four-way tie consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the lifecycle pod's attention first. Two extensions Mailchimp screens add: NTILE over the same 16-account base cuts usage tiers when the board wants quartiles instead of ladders, and any running walk over timestamps uses a default RANGE frame, so rows tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "mailchimp-t3",
      q: "The census shows 103 billing periods and 16 client accounts; EU shows 45 periods and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per billing period, so the top account with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure send load and cadence, accounts measure installed base and coverage. The ratio — 5.6 periods per account in EU versus 9.5 in the US on this db — is the concentration signal that decides whether growth is broadening or whether one logo carries the market. The trap that catches candidates is a third grain: join order_items for contact lines and COUNT(*) silently counts lines, not periods — 251 of them — and SUM(quantity) is a fourth grain entirely, 498 contacts. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the same habit Mailchimp's own audience dashboards encode.",
      tag: "aggregation",
    },
    {
      id: "mailchimp-t4",
      q: "shipped_at is NULL until a campaign actually goes out. What is your policy for the build-to-send report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a send time, so the report measures stage-to-send for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 unsubscribed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day sends for campaigns that have not launched, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Mailchimp reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "mailchimp-t5",
      q: "The growth review wants booked value per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, awaiting and unsubscribed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to dollars. One more placement rule these screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the unsubscribe share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one period, or about a market?",
      tag: "pipeline",
    },
    {
      id: "mailchimp-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.4375 periods per account, 6.44 rounded — exactly four accounts clear it, the expansion-targeting gate). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS account's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when an account's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole suppression list empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "mailchimp-t7",
      q: "The growth trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the send trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's periods, and campaign launches are exactly when end-of-night stamps land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November — and the contact walk tells its own version, 22 adds in July against 51 in February. Date discipline is funnel discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "mailchimp-t8",
      q: "Finance says a billing statement is 'paid' but the payments table has no rows for it — and meanwhile the audience report's contact total keeps disagreeing with the line count. What queries do you write first, and what counting rule never breaks?",
      a: "Two instincts, one discipline. Money first: the anti-join — statements LEFT JOIN payment legs, keep p.id IS NULL — returns 6 statements worth 15,217.00 on this db, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. The mirror anomaly exists too — void-but-debited #11 at 925.00 — and both reconcile only at row level, not to vibes. Then audience: contacts must fold at the right grain or the report double-counts. 251 line rows carry 498 contacts (quantity on the line), 103 periods, 16 accounts — four grains over one base, and COUNT(*) after joining lines counts lines, not contacts or periods. The counting rule that never breaks: state the grain in the column name and the population in the title, and reconcile the branches — fate arms sum to 103, coverage buckets sum to 28 — by construction. And the money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0, and the ledger trial balance must land at 181,080 against 181,080 before the close ships.",
      tag: "quality",
    },
    {
      id: "mailchimp-t9",
      q: "The booked-value walk uses SUM(total) OVER (ORDER BY stage_date) with no frame clause, and two stage dates carry three periods each. What frame is actually running, and when do you override it?",
      a: "The frame nobody wrote is the one deciding the answer: ORDER BY with no frame clause defaults to RANGE, so same-date peers enter the cumulative together and the three 2024-10-13 rows share one running value. That is usually the defensible read for a money walk — peers are peers. Override with ROWS when the rows themselves are the unit (per-send running counts) and you have a stated tie-break; on this db 2024-05-12 and 2024-10-13 carry three staged periods each, so the two frames disagree visibly. The discipline is naming the frame in the query comment, because the default is doing a policy job nobody signed off on.",
      tag: "windows",
    },
    {
      id: "mailchimp-t10",
      q: "The board packet stacks the fate arms — billed, in-flight, awaiting, unsubscribed — from four queries into one layout. When is UNION ALL provably safe, and why does the branch label matter as much as the operator?",
      a: "UNION ALL is safe when the branches cannot produce duplicate rows: each branch filters a disjoint status (delivered, shipped, pending, cancelled), so identical rows are impossible by construction — and you write that argument in the comment, because the operator will not check it for you. The branch label is what keeps the stack auditable: a literal arm name ('billed') in each SELECT turns 'which arm is this row from' into a column instead of an inference. UNION would dedupe byte-identical rows silently — on a stack where a market legitimately repeats a count, that is a lost account with no error. Stack with UNION ALL, label every branch, and reconcile the total to 103 in the same query.",
      tag: "setops",
    },
    {
      id: "mailchimp-t11",
      q: "EXCEPT finds accounts whose campaigns shipped but never completed a billed term. Walk the semantics: what does EXCEPT compare, why does direction matter, and what does the one-row answer mean for the book?",
      a: "EXCEPT compares whole rows — every selected column, in order — and keeps left-arm rows that have no match in the right arm. Shipped-minus-delivered on this db returns exactly one account, Liam O'Brien: sends went out, nothing has completed a term, the in-flight-only profile. Flip the arms and the question changes to billed-with-nothing-in-flight, a different operational read. Two traps: the arms must project the SAME columns in the same order, or you compare incompatible shapes; and EXCEPT dedupes, so a duplicated row in the left arm survives as one — for population questions that is fine, for count questions it is a silent grain change.",
      tag: "setops",
    },
    {
      id: "mailchimp-t12",
      q: "Growth wants accounts whose cadence beats the platform average. Compare the three shapes — scalar, correlated, derived — and say which one you ship and why.",
      a: "Scalar (WHERE n > (SELECT AVG(n) FROM …)) computes one platform number — 6.4375 periods per account on this db, exactly four accounts clear it — and is the shape to ship for a fixed benchmark, with the empty-inner-query caveat stated: an inner fold over a filtered slice that returns nothing yields NULL and the gate quietly admits nobody. Correlated re-runs per outer row and answers 'above MY market's average' — a different question at a different cost. Derived (a CTE or subquery folding the mean, then joined back) keeps the benchmark anchored to the 103-period base while staying readable and debuggable — you can SELECT the benchmark alone and eyeball 6.44 before trusting the gate. Ship derived for anything that appears in a review; the anchor is inspectable.",
      tag: "subqueries",
    },
    {
      id: "mailchimp-t13",
      q: "The Monday census needs staged, sent, billed, in-flight and awaiting in one scan. Compare FILTER (WHERE …) with SUM(CASE …), and state the identity that proves the census.",
      a: "FILTER (WHERE …) branches each aggregate in place — COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) — and SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin; they must agree cell for cell, and if they do not, one of the arms is mis-keyed. The arms over this db read 103 staged, 82 stamped, 52 delivered, 30 shipped-in-flight, 14 pending-awaiting. The identity is the proof: billed + in-flight + awaiting + unsubscribed = staged — 52 + 30 + 14 + 7 = 103 — and it holds by construction because every row falls in exactly one arm. A census that reconciles is a census; a census that does not is four queries wearing a trench coat.",
      tag: "groupby",
    },
    {
      id: "mailchimp-t14",
      q: "The suppression list for the winback calendar is 'accounts with no open dunning statement'. NOT IN, NOT EXISTS, or LEFT JOIN … IS NULL — walk the choice and the NULL trap.",
      a: "NOT IN over a subquery is the dangerous one: one NULL in the inner list poisons every comparison — x NOT IN (1, NULL) is UNKNOWN for every x — and the whole suppression list silently empties, which for a winback calendar means emailing accounts you meant to suppress. NOT EXISTS expresses the same intent without the three-valued-logic trap and short-circuits per row. LEFT JOIN … IS NULL is the audit-friendly twin: the join visibly carries the unmatched rows and the WHERE keeps them. On the clean core db all three agree — every account has its rows — but suppression lists are built on staging extracts, which is exactly where NULLs sneak in. Policy: NOT EXISTS for existence tests, and never NOT IN over an unguarded column.",
      tag: "subqueries",
    },
    {
      id: "mailchimp-t15",
      q: "The build-to-send clock is julianday(shipped_at) - julianday(created_at) over stamped rows: 2.98 average, 2-to-4 spread. When do you keep the fractional, when do you CAST to whole days, and why does TEXT subtraction give zero?",
      a: "Keep the fractional when the number feeds an alert — the 2.98-day platform average and the per-market drift map (LATAM 3.5, US 3.07, EU 2.94, APAC 2.93) are threshold comparisons where a tenth of a day is the signal. CAST to whole days when the deliverable is a distribution — the CAST version reads 27 periods at 2 days, 30 at 3, 25 at 4, which is the histogram the staged-and-stalled review actually wants; note the floor, not the round, so 2.9 days reports as 2. TEXT subtraction is always wrong here: the stamps coerce to their leading numeric prefix, year minus year is 0, and the report ships a confident zero with no error. julianday is the only clock that survives contact with the data.",
      tag: "dates",
    },
    {
      id: "mailchimp-t16",
      q: "Audience joins keep failing on names — 'Chloe Dubois' arrives as 'chloe  dubois', regions as 'eu ' versus 'EU'. What is the hygiene playbook for the client-account master, and why is it join integrity and not cosmetics?",
      a: "Every join key is a promise that two spellings are the same entity, so casing and whitespace are correctness, not presentation. The playbook: TRIM and UPPER (or LOWER) both sides of every text join on staging tables — TRIM(UPPER(region)) = TRIM(UPPER(region)) — and validate before the join, not after: a DISTINCT on the normalized key that returns the same count as the raw key proves the master is clean. Email domains get the same treatment before segmentation (Gmail versus gmail are one provider); the domain is also a grain worth its own census. What you never do is normalize one side only — the join then silently half-matches, the market census splits EU into two markets, and no error appears anywhere. Fix at ingest, verify at join, and the two-grain census reconciles.",
      tag: "strings",
    },
    {
      id: "mailchimp-t17",
      q: "NTILE(4) and CASE banding both cut the 16-account base into tiers. When is each right, and what happens to the four accounts tied at 4 periods?",
      a: "NTILE is the right tool when tier membership is defined BY rank — quartiles of usage, top-quarter targets — because it is a row-count splitter: 16 rows into four tiles of four, walked in ORDER BY order. The cost shows on ties: the four accounts at 4 periods straddle a tile boundary — three land in tile 2, one in tile 3 — and peer accounts wear different tiers by row arithmetic, silently. CASE banding is the right tool when tier membership must be a function of the VALUE — periods >= 10 is a gate, not a percentile — because arms are explicit, exhaustive, and stable under tie blocks. Mailchimp's contact tiers are value gates (the 55-rate boundary), so the tier page is CASE; the usage-quartile chart can afford NTILE, with the tie split disclosed.",
      tag: "groupby",
    },
    {
      id: "mailchimp-t18",
      q: "'Show me the top account' — the ladder says Alice Chen with 24 periods. What is the argmax query shape, and what is your policy when the max is tied?",
      a: "The defensible shape is fold-then-join: a derived table computing per-account periods (or value), then join or filter against MAX — SELECT … WHERE n = (SELECT MAX(n) FROM ladder) — because ORDER BY n DESC LIMIT 1 returns one arbitrary row when the max is tied. On this db the period max is unique (Alice Chen, 24, a fifth of the book's contacts and 20.8% of its value) and the value max is the same account, so the read is unambiguous. The policy matters the moment it is not: return the whole tie SET and name the tie-break in prose (created_at, then id), never ROW_NUMBER over an unstated order. Argmax with an unnamed tie policy is how two analysts print two 'top accounts' from the same db.",
      tag: "groupby",
    },
    {
      id: "mailchimp-t19",
      q: "EXPLAIN QUERY PLAN shows a full scan on the January send cohort. Walk the sargability diagnosis and the rewrite that lets an index on created_at engage.",
      a: "The query wrapped the column — julianday(created_at) BETWEEN julianday('2024-01-01') AND … — and a function-wrapped column is invisible to the index: the planner must evaluate the expression row by row, so it scans all 103 periods. STRFTIME and SUBSTR wraps are the same disease with different syntax. The rewrite keeps the column bare against a half-open range: created_at >= '2024-01-01' AND created_at < '2024-02-01' — same rows out, index-usable plan. Confirm with EXPLAIN QUERY PLAN: SCAN turns into SEARCH with the range constraint. The habit this drills: correctness and plan are separate axes — the wrapped versions returned the right rows, and shipping them anyway is how a cohort report becomes a nightly full scan as the book grows.",
      tag: "indexes",
    },
    {
      id: "mailchimp-t20",
      q: "The cadence ladder has four accounts tied at 4 periods and the board must print the same order every Monday. What is the deterministic-ordering policy, and where does it get written?",
      a: "Every ORDER BY that feeds a deliverable carries a full key path to uniqueness: primary metric first (period count DESC), then a deterministic tie-break (created_at ASC, then c.id ASC), stated so the last key is guaranteed unique. Ties under an incomplete ORDER BY return in whatever order the scan produces — the four-way tie read Rossi-Keiko-Meyer-Alvarez on Monday and Keiko-Rossi-Alvarez-Meyer on Tuesday, same data. The policy is written in two places: the query comment ('tie-break: id — stable, arbitrary, disclosed') and the board footnote, so review knows the rung order inside the tie is an artifact, not a finding. RANK vs DENSE_RANK decides shared rungs and gaps; the tie-break decides only print order — and it must be deterministic to be reproducible.",
      tag: "windows",
    },
    {
      id: "mailchimp-t21",
      q: "COALESCE/IFNULL keep appearing in Mailchimp reports — zero-filling latency, defaulting missing rates, patching NULL market labels. Where is COALESCE legitimate and where does it lie?",
      a: "Legitimate: display defaults — COALESCE(region_label, 'unknown') on a report cell, or a rate that shows 0.0 where a denominator legitimately produced zero. A lie: arithmetic defaults — IFNULL(latency, 0) turns 21 never-sent periods into 21 same-day sends and drags the 2.98-day clock toward 2.37 while the coverage line reads 103 of 103; the awaiting rows are NULL because they have not sent, and that is information, not a hole. The test is definitional: does 'zero' mean 'measured and empty' or 'not yet true'? The first gets a default; the second keeps its NULL and the report states the population (82 of 103 stamped). The same test gates the dunning read — a statement with no settlement legs has zero legs, not a zero balance.",
      tag: "nulls",
    },
    {
      id: "mailchimp-t22",
      q: "The market review prints 364.67 as the average period value; the period-level fold says 338.19. Both query the same 103 periods. Explain the gap and defend which one ships under which headline.",
      a: "364.67 is the mean of four per-market means: each market's average is computed first (EU's 45 periods, APAC's 37, the US's 19, LATAM's 2), then averaged — so every market weighs a quarter, and LATAM's two periods get roughly 17 times the weight they earn in the period-level fold. 338.19 is SUM(total)/COUNT(*) over all 103 periods — every period equal. Neither is wrong; they answer different questions. Ship 338.19 under 'average period value' — the label promises per-period grain; ship 364.67 under 'average market, by market' and label it as the logo-weighted read. The interview answer is the discipline: compute both, name the grain on the label, and treat a 26-dollar gap between two 'averages' as the first question the CFO asks.",
      tag: "aggregation",
    },
    {
      id: "mailchimp-t23",
      q: "Before the monthly close ships, you run a four-check ritual over the whole estate. What are the four checks, and what does each one catch?",
      a: "One: the funnel identity — delivered 52 + in-flight 30 + awaiting 14 + unsubscribed 7 = 103 staged — which catches any arm drift from a mis-keyed status. Two: statement coverage — 21 exact, 1 partial (4,000.00 of 6,148.00), 6 never-collected — which catches payments counted twice or statements silently excluded. Three: the dunning queue — 6 statements, 15,217.00, led by INV-2025-024 at 4,937.00 and including the paid-status liar #28 at 1,756.00 — which catches the status column claiming money the payments table never received. Four: the ledger trial balance — 181,080 against 181,080, delta zero — which catches cents drifting anywhere in the GL. Each check is one query, each reconciles by construction, and the close ships only at four greens; a branch that fails its identity is the morning incident, not a rounding note.",
      tag: "quality",
    },
    {
      id: "mailchimp-t24",
      q: "The deliverability team reports a 92.1% send-through rate; the lifecycle team reports 79.6% on the same data. Both are computed from the same db. Reconcile — and state the rule that keeps every rate in the building honest.",
      a: "The 92.1% is 82 stamped over 89 — the base after dropping the 7 unsubscribed periods; the 79.6% is 82 over 103 — all periods staged, awaiting and unsubscribed included. The lifecycle number is the house definition because the metric exists to watch periods that have not sent yet, and 'not yet' includes 'chose not to': drop them and the rate flatters itself by 12.5 points without a single extra send. The rule: state the denominator before the number — population (all staged periods), filter (shipped_at IS NOT NULL for the numerator), and the exclusion policy in words if there is one. The same rule governs open rates and click rates: a rate whose base was silently trimmed is a claim, not a metric, and the reviewer who asks 'over what base?' is doing the analyst's job.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "mailchimp-mcq-1",
      prompt: "A billing period's status reads 'shipped'. In this kit's Mailchimp stage map, what happened to the campaign?",
      choices: ["Sent and in flight — the send stamp shipped_at has landed, but the period has not completed its billed term", "Sent and billed — the period completed its term", "Unsubscribed before the campaign ever sent", "Staged but still awaiting the first send"],
      answer: 0,
      why: "The stage map is fixed: shipped = sent, in flight (30 of 103 periods), with shipped_at as the send stamp. It went out — but it is not a completed billed term yet.",
      notes: [
        { choice: 1, why: "Sent-and-billed is 'delivered' — 52 periods. Calling in-flight sends billed inflates the billable base before a single term completes." },
        { choice: 2, why: "Unsubscribed-before-send is 'cancelled' — 7 periods, none of which carry a stamp. A stamped period by definition went out." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-2",
      prompt: "Send-through rate is stamped sends over staged periods. The db holds 82 stamped, 14 awaiting and 7 unsubscribed of 103 staged. What is the rate, and over which base?",
      choices: ["82/89 = 92.1% — stamped over stamped-plus-unsubscribed", "82/103 = 79.6% — stamped over ALL periods staged", "52/82 — billed over stamped", "82/16 = 512.5% — stamped over client accounts"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods staged — the 14 awaiting stay in the denominator because 'not yet sent' is exactly what the metric exists to watch. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 7 unsubscribed but keeping the 14 awaiting is the worst of both: an ad-hoc base invented to flatter the rate. The whole base or a stated exclusion policy — never a silent trim." },
        { choice: 2, why: "52/82 mixes two funnel steps into one ratio — delivered is term completion, shipped_at is the send stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-3",
      prompt: "The board asks 'how many contacts does the book carry?' The order_items table holds 251 lines and SUM(quantity) is 498. Which answer — and which query — is right?",
      choices: ["498 — SUM(oi.quantity) folds contacts at line grain", "251 — COUNT(*) over order_items, one row per contact", "103 — COUNT(*) over orders, the campaign base", "16 — COUNT(*) over customers, one per account"],
      answer: 0,
      why: "Contacts live on quantity: 251 lines carry 498 contacts (max 3 on a line). COUNT(*) over order_items counts lines — the fold for contacts is SUM(quantity), and saying which grain you printed is the deliverable.",
      notes: [
        { choice: 1, why: "251 is the line count, not the contact count — printing it as 'contacts' understates the base by 247 and misprices every tier conversation built on it." },
        { choice: 2, why: "103 is the period grain — a third number entirely. Three grains over one base is the census habit this kit drills; the label must name the grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-4",
      prompt: "100.0 * COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to stamped periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, integer count over integer count is integer division — the send-through rate truncates toward 0 and markets read flat (APAC's 29/37 prints 78 instead of 78.4, and smaller splits truncate to 0 outright). The multiplier forces real division first.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (sent/staged)*100 truncates 0.784 to 0 first, then scales — the send-through map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-5",
      prompt: "The tier fold reads 268 contacts on sub-55 rates and 230 at 55-plus. Which single query returns BOTH arms in one pass?",
      choices: [
        "GROUP BY the band: CASE WHEN unit_price < 55 THEN 'starter' ELSE 'growth' END",
        "WHERE unit_price < 55 GROUP BY unit_price — then eyeball the missing arm",
        "GROUP BY unit_price HAVING SUM(quantity) > 100",
        "SUM(quantity) over order_items with no GROUP BY",
      ],
      answer: 0,
      why: "One scan, one CASE classifier, one GROUP BY: both arms fall out with their contact sums (268 and 230) and average line rates (31.01 and 115.85). The ELSE arm guarantees exhaustiveness — no line can escape the fold.",
      notes: [
        { choice: 1, why: "The WHERE cut deletes the 230-contact growth arm before the fold — the tier page would print half the ladder and look complete." },
        { choice: 2, why: "That folds at per-rate grain with an arbitrary floor — rows of rate-level slices, not two tier bands. The grain changed and the arms never existed." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-6",
      prompt: "A market census returns staged 45/37/19/2 and sent 36/29/15/2 by region. Which pair reads the funnel's AWAITING-SEND arm correctly for every market?",
      choices: [
        "staged − sent: 9/8/4/0 (then split awaiting vs unsubscribed by status)",
        "staged − billed: 21/16/14/0",
        "sent − billed: 12/8/10/0",
        "staged − COUNT(DISTINCT customer_id): 37/32/17/1",
      ],
      answer: 0,
      why: "Unstamped = staged − sent, because stamps land exactly when campaigns go out: 45−36=9 in EU (6 awaiting + 3 unsubscribed), 8 in APAC, 4 in the US, 0 in LATAM. The residual then splits by status into awaiting (14 total) and unsubscribed (7 total).",
      notes: [
        { choice: 1, why: "staged − billed folds billed AND in-flight together with the unsent — it reads 21 in EU, which is awaiting + unsubscribed + 12 in-flight campaigns. Three fates in one number." },
        { choice: 2, why: "sent − billed is the in-flight arm — the campaigns that went out and have not completed their term. Real number, different arm." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: [
        "AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed",
        "NULLs were counted as zero days and dragged the average down",
        "SQLite errored on the NULL arithmetic and returned the last good value",
        "The awaiting periods double-counted their staging day",
      ],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-8",
      prompt: "A suppression list built as account_id NOT IN (SELECT customer_id FROM staging_sends WHERE status = 'bounced') returns ZERO accounts. First suspicion?",
      choices: [
        "The two tables genuinely share no ids — the zero is correct",
        "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole list silently empties",
        "NOT IN cannot take a subquery; it needs a literal list",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the suppression list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But suppression lists are built on staging extracts, which are exactly where NULLs sneak in." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-9",
      prompt: "A board stack puts sent-in-flight periods under unsubscribed periods in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: [
        "UNION ALL is only a performance choice — the results would be identical",
        "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently",
        "UNION truncates the stack to the first branch's row count",
        "UNION cannot stack two SELECTs over the same table",
      ],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no branch label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-10",
      prompt: "A growth dashboard walks monthly contact adds: SUM(quantity) OVER () as audience. Every row reads 498 — the final base — instead of a running total. What is the bug?",
      choices: [
        "The empty OVER() has no ORDER BY, so the frame is the whole partition — every row gets the grand total; add ORDER BY month for the running walk",
        "Rounding accumulated across the 14 months and flattened the walk",
        "LAG should be used instead of SUM for running totals",
        "The frame must extend to UNBOUNDED FOLLOWING to absorb the tail",
      ],
      answer: 0,
      why: "OVER () with no ORDER BY frames the entire partition, so every row sums all 14 months — 498 everywhere. The running walk needs the order inside the frame: SUM(quantity) OVER (ORDER BY month). On this db that walk reads 50, 101, 141 … 465, 498.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the cumulative — swapping functions changes the metric from a running base to a period-over-period lookback." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame forward — with an ORDER BY present every row would still see the full tail and print 498. The missing piece is the ORDER BY, not more frame." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-11",
      prompt: "The contact report joins billing periods to their contact lines (`orders JOIN order_items`) and runs COUNT(*). The brief promises 103 periods; the query prints 251. What happened?",
      choices: [
        "The join fanned out — one row per (period, contact line) pair, and COUNT(*) counts the pairs, not the periods",
        "The orders table really holds 251 periods this quarter",
        "COUNT(*) skips duplicate rows, so 251 must be the true period count",
        "The join filter dropped 148 unsubscribed periods",
      ],
      answer: 0,
      why: "order_items is the line grain: 251 contact lines hang off 103 billing periods (2.44 lines per period). After the join, every COUNT(*) counts lines. The period count needs COUNT(DISTINCT o.id) or a separate period-level fold — naming the grain is the deliverable.",
      notes: [
        { choice: 1, why: "The book is 103 periods; 251 is a derived grain, not a population change. Reporting 251 as periods misprices every per-period metric the funnel board reads." },
        { choice: 2, why: "COUNT(*) never dedupes — that is COUNT(DISTINCT …). The two numbers matching by accident is exactly how wrong grains survive to the board." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-12",
      prompt: "A teammate writes `COUNT(status = 'pending')` to size the staged-awaiting-send queue and reports 103. The funnel board says 14. Who is right?",
      choices: [
        "The teammate — COUNT over the comparison counts the matching rows",
        "The board — COUNT(expr) counts every NON-NULL result, and the 0/1 boolean is never NULL, so all 103 periods counted; the queue is COUNT(*) FILTER (WHERE status = 'pending') = 14",
        "Neither — the awaiting queue cannot be counted in one pass",
        "The teammate — SQLite stores booleans as strings and COUNT matches them",
      ],
      answer: 1,
      why: "COUNT skips NULLs, not false comparisons — status = 'pending' evaluates to 0 or 1 for every row, both non-NULL, so the count is 103. The conditional count needs FILTER (WHERE …) or SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), which reads 14.",
      notes: [
        { choice: 0, why: "COUNT(expr) has no match semantics — it counts non-NULLs. The boolean trick works with SUM, not COUNT, and the difference is the whole lesson." },
        { choice: 3, why: "SQLite booleans are integers 0/1, not strings. The failure is three-valued logic being bypassed, not type confusion." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-13",
      prompt: "Billing wants the top 3 dunning balances and writes `SELECT number, amount_cents/100.0 FROM invoices WHERE status = 'open' LIMIT 3`. The never-collected queue runs 873.00 to 4,937.00. What does the query actually return?",
      choices: [
        "The three biggest balances, in order",
        "An arbitrary three — without ORDER BY, LIMIT returns whatever rows the scan touches first, which is id order here, not balance order",
        "An error — LIMIT requires ORDER BY in SQLite",
        "The three smallest balances",
      ],
      answer: 1,
      why: "LIMIT is a row cap, not a rank. With no ORDER BY there is no defined order, so 'top 3' is whatever came off the scan first — invoice ids 18/21/24-ish, not the 4,937.00 at the top of the queue. Top-anything is ORDER BY amount_cents DESC LIMIT 3.",
      notes: [
        { choice: 0, why: "The two sets occasionally coincide — that is luck, and it silently flips the dunning email order the moment the queue changes." },
        { choice: 2, why: "LIMIT stands alone fine; it is the ranking claim the query cannot honor. SQLite raises no error because none is warranted." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-14",
      prompt: "The growth walk buckets periods with `STRFTIME('%m', created_at)` and reports 12 monthly buckets instead of the 14 the spine expects. What did the format code do?",
      choices: [
        "'%m' returns minutes, splitting each month into slivers",
        "'%m' is month-only — January 2024 and January 2025 collapse into one bucket (14 periods, 5,401.47 combined), and the 14-month spine reads as 12",
        "'%m' requires a UTC cast and returned NULL for the 2025 rows",
        "'%m' is year-only and merged everything into one bucket",
      ],
      answer: 1,
      why: "Month-without-year merges same-month rows across years: the two Januarys fold into one bucket carrying 14 periods and 5,401.47. No error, no warning — just a spine that is quietly two months short. '%Y-%m' is the spine key.",
      notes: [
        { choice: 0, why: "Minutes are '%M' (capital). Lowercase '%m' is zero-padded month — the collision is year-loss, not unit confusion." },
        { choice: 2, why: "No cast is needed and nothing returns NULL; the bucket count is wrong because the key is lossy, not because rows dropped out." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-15",
      prompt: "A deliverability patch rewrites the build-to-send report as `AVG(IFNULL(julianday(shipped_at) - julianday(created_at), 0))` — so the 14 awaiting-send periods count as zero-day sends. What does this do to the story?",
      choices: [
        "Nothing — the 2.98-day average survives because NULLs carry no weight anyway",
        "It invents same-day sends: 21 fabricated zero-day latencies drag the stamped-only 2.98 toward ~2.37 and the coverage claim reads 103 of 103, hiding that 21 periods never sent at all",
        "It raises the average because zeros are heavier than NULLs",
        "It errors — IFNULL cannot wrap date arithmetic",
      ],
      answer: 1,
      why: "IFNULL turns 'not sent yet' into 'sent same day'. The 82-row stamped average was 2.98; averaging 21 zeros in reads ~2.37 and the coverage line claims the whole staged base. The awaiting rows belong in the denominator of send-through — never in the latency fold as zeros.",
      notes: [
        { choice: 0, why: "NULLs were skipped before — an 82-row population honestly labeled. Zero-filling is a different population wearing the same number, which is the lie." },
        { choice: 2, why: "Zeros pull an average down, not up; the direction of the drift is the tell that same-day sends were fabricated." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-16",
      prompt: "After the line-grain fan-out (251 rows over 103 periods), a teammate slaps DISTINCT into aggregate after aggregate until the numbers 'look right'. Why is COUNT(DISTINCT o.id) the only defensible one of the batch?",
      choices: [
        "DISTINCT is always cosmetic on id columns",
        "It is the one fold that states its grain — one row per period id — while DISTINCT on totals or rates silently collapses legitimately equal values and invents a census nobody asked for",
        "COUNT(DISTINCT o.id) returns 251, matching the line grain",
        "DISTINCT makes the planner use the orders index",
      ],
      answer: 1,
      why: "The fan-out changed the grain; the fix is naming the grain back. COUNT(DISTINCT o.id) = 103 says 'periods' explicitly and reconciles to the staged base. DISTINCT on money or rates de-dupes coincidences — two 400.00 periods collapse to one — and the census reconciles to nothing.",
      notes: [
        { choice: 2, why: "DISTINCT o.id returns 103, not 251 — 251 is the un-deduplicated line count. The numbers going the right direction is how the bandage gets missed." },
        { choice: 3, why: "Index usage is a plan detail, not a correctness argument. DISTINCT exists to collapse duplicates; the question is whether duplicates are corruption or two real periods." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-17",
      prompt: "A teammate computes the build-to-send window as `AVG(shipped_at - created_at)` on the raw TEXT stamps and gets 0.00 — while the honest julianday version prints 2.98 days. What happened?",
      choices: [
        "SQLite refused the arithmetic and returned 0",
        "TEXT minus TEXT coerces each stamp to its leading numeric prefix — the year — so 2024 − 2024 = 0 for every stamped row; day math needs julianday()",
        "The two columns are stored in different timezones",
        "AVG rounds sub-day values to zero by default",
      ],
      answer: 1,
      why: "'2024-01-15 10:00:00' is not a number; SQLite's numeric coercion reads the leading digits and stops — the year. Year minus year is 0, the average of zeros is 0, and no error ever surfaces. julianday() converts the full stamp to a float day count, which is where the 2.98 comes from.",
      notes: [
        { choice: 0, why: "SQLite is happy to coerce rather than reject — the silence is the bug. A zero-day send rate of 100% ships to the board before anyone asks." },
        { choice: 3, why: "AVG keeps full float precision; the inputs were already zeros. The rounding story would show as 0.0 exactly, which it does — but for the wrong reason." },
      ],
      difficulty: "easy",
    },
    {
      id: "mailchimp-mcq-18",
      prompt: "`SELECT region, total FROM orders WHERE RANK() OVER (ORDER BY total DESC) <= 10` — what happens, and what is the fix?",
      choices: [
        "It works — window functions are allowed in WHERE",
        "It errors — windows evaluate after WHERE, so the rank does not exist yet; stage the windowed SELECT in a derived table or CTE and filter the rank outside",
        "It works but ranks ascending, returning the ten smallest periods",
        "It silently returns all 103 rows",
      ],
      answer: 1,
      why: "The logical pipeline runs WHERE before the SELECT layer where window functions are computed, so referencing a rank in WHERE is a misuse error in SQLite, not a degraded result. The rank-first shape is a staged query: inner SELECT carries the window, the outer query applies rank <= 10.",
      notes: [
        { choice: 2, why: "The error is unconditional — direction never comes into play. Sorting fantasies are how people 'fix' an error that is about evaluation order, not order direction." },
        { choice: 3, why: "SQLite raises 'misuse of window function' immediately. The dangerous sibling bug is the one that runs — a LIMIT without ORDER BY — which is why the staged shape matters." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-19",
      prompt: "Which accounts sent campaigns that never completed a billed term? You write `SELECT name … WHERE status = 'shipped' EXCEPT SELECT name … WHERE status = 'delivered'`. One name returns. Who, and what does the result mean?",
      choices: [
        "Alice Chen — the top cadence account is the only one both shipped and delivered",
        "Liam O'Brien — the only account with in-flight sends and zero completed terms: campaigns went out, nothing has billed yet",
        "Bruno Silva — LATAM never delivers",
        "Nobody — the arms cancel out to zero rows",
      ],
      answer: 1,
      why: "EXCEPT keeps left-arm rows absent from the right arm. Shipped-but-never-delivered is exactly one account on this db — Liam O'Brien, the in-flight-only profile. Flip the arms and you get the mirror population: accounts billed with nothing currently in flight.",
      notes: [
        { choice: 0, why: "Alice appears in both arms, so EXCEPT removes her — appearing in the shipped arm is necessary but not sufficient; she must be absent from delivered." },
        { choice: 2, why: "Bruno's two LATAM periods are neither shipped nor delivered — he sits in the never-sent arms, so both EXCEPT inputs exclude him." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-20",
      prompt: "The integration roster per market: `GROUP_CONCAT(DISTINCT p.category)`. The US cell prints 6 of the 7 plan families — Audio, Accessories, Video, Apparel, Electronics, Wearables. What is the correct read, and the missing caveat?",
      choices: [
        "The US market is under-served — Fitness is missing, so page the account manager immediately",
        "The US book genuinely skips Fitness SKUs (EU and APAC carry all 7, LATAM only 3); the caveat is GROUP_CONCAT's member order is undefined — sort in a subquery before the roster is comparable across markets or screenshots",
        "GROUP_CONCAT caps its output at 6 items by default",
        "The roster is wrong — every market carries all 7 families",
      ],
      answer: 1,
      why: "No US contact line touches a Fitness SKU, so the 6-of-7 read is real market mix, not a query bug. But the fold concatenates in an unspecified order — two runs can print different rosters — so the comparable version sorts first. The absence is a finding; the sort discipline is what makes it a defensible one.",
      notes: [
        { choice: 0, why: "The absence may deserve a look, but paging someone off an unsorted GROUP_CONCAT skips the step where you verify the fold is deterministic — the roster itself might not reproduce." },
        { choice: 2, why: "There is no item cap; GROUP_CONCAT has a length limit measured in characters, and six short category names nowhere near it." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-21",
      prompt: "5 statements settle on both card and wire. You need each split-rail statement once: `payments p1 JOIN payments p2 ON p1.invoice_id = p2.invoice_id AND p1.id <> p2.id` prints 10 rows. The fix?",
      choices: [
        "Add DISTINCT — it collapses the 10 to 5",
        "Order the pair once: `p1.id < p2.id` — each unordered pair meets exactly once, 5 rows, with the card side and wire side cleanly separated",
        "GROUP BY invoice_id HAVING COUNT(*) = 2",
        "Use a LEFT JOIN so unmatched legs survive",
      ],
      answer: 1,
      why: "p1 <> p2 meets every pair twice — A-B and B-A. The half-open comparator p1.id < p2.id is the canonical pair-once shape: 5 rows, one per split-rail statement, each row labeled by which leg was first. DISTINCT also lands on 5 here, but the ordering is the shape you need the moment the two sides carry roles.",
      notes: [
        { choice: 0, why: "DISTINCT works by symmetry luck; keep the ordering and the count is provably once-per-pair without a dedup bandage — and the card/wire roles stay addressable." },
        { choice: 2, why: "That finds which statements are split-rail but loses the pair grain — two legs you can compare side by side. Different deliverable." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-22",
      prompt: "Per-market average period value averages to 364.67 across the four markets, but total booked over all 103 periods averages 338.19. The deck shows 364.67 under the headline 'average period'. Objection?",
      choices: [
        "None — 364.67 is right; market means are the more stable estimator",
        "Wrong grain: 364.67 weights each of the 4 markets equally, so LATAM's two-period book counts as much as EU's 45; the period-level average is 338.19, and the label must name which one it prints",
        "The 26.48 gap is float rounding drift",
        "Both are wrong — the median is the only honest center",
      ],
      answer: 1,
      why: "The mean of per-market means re-weights the base: 4 markets means LATAM's 2 periods get a quarter of the weight instead of 2/103 of it. Both numbers are computable and both are useful — only one matches the 'average period' label. Name the grain on the label or print both with names.",
      notes: [
        { choice: 0, why: "Stability is not the question — the label is. A weighted-by-logo average under a per-period headline is exactly how concentration gets understated in the deck." },
        { choice: 2, why: "The gap is structural (a quarter of the weight moved), not float noise; rounding drift lives in the third decimal, not twenty-six dollars." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-23",
      prompt: "One-pass census: `COUNT(*) FILTER (WHERE status = 'shipped')` returns 30, but the SUM(CASE) twin with the arm `WHEN status = 'open' THEN 1` returns 0 everywhere. What does that tell you?",
      choices: [
        "FILTER is broken for status arms and must be replaced",
        "'open' is invoice vocabulary, not campaign vocabulary — no order carries it, so the arm is honestly empty; the shipped arm is 'shipped' (30) and the billed arm 'delivered' (52). FILTER and SUM(CASE) agree — on a dead arm",
        "The CASE is missing an ELSE, so SQLite invented zeros to fill it",
        "The census needs two passes by definition",
      ],
      answer: 1,
      why: "The status set on this db is closed — delivered, shipped, pending, cancelled. An arm keyed on a value that never occurs returns a confident zero, and the FILTER twin agrees. The correctness proof is the reconciliation identity — billed + in-flight + awaiting + unsubscribed = 103 — not the syntax choice.",
      notes: [
        { choice: 2, why: "A missing ELSE yields NULL, not 0 — and SUM skips NULLs, which would still print 0. The arm is dead because the value never occurs, not because of ELSE mechanics." },
        { choice: 3, why: "One pass is the entire point of both forms; four sequential queries are four chances for the arms to drift out of reconciliation." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-24",
      prompt: "January's send cohort: `WHERE julianday(created_at) BETWEEN julianday('2024-01-01') AND julianday('2024-02-01')`. EXPLAIN shows a full scan of all 103 periods. Which rewrite lets the planner use a created_at index?",
      choices: [
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "WHERE STRFTIME('%Y-%m', created_at) = '2024-01'",
        "WHERE SUBSTR(created_at, 1, 7) = '2024-01'",
        "WHERE created_at LIKE '%2024-01%'",
      ],
      answer: 0,
      why: "Wrapping the column in any function — julianday, STRFTIME, SUBSTR — hides it from the index; the planner must evaluate the expression per row. A bare column against a half-open range keeps the column naked and index-usable. Same rows out, very different plan.",
      notes: [
        { choice: 1, why: "Correct rows, still a full scan — the column is wrapped. It is a correctness win from the '%m' lesson and a plan loss at the same time." },
        { choice: 3, why: "A leading wildcard is the least sargable pattern of all: no prefix, no index. Note '2024-01%' (no leading %) would be the sargable LIKE — the wildcard position is the lesson." },
      ],
      difficulty: "medium",
    },
    {
      id: "mailchimp-mcq-25",
      prompt: "NTILE(4) over the 16-account cadence ladder. Four accounts tie at 4 periods. How does the fold land, and what do you tell the board?",
      choices: [
        "Ties keep tiles together — all four land in the same quartile",
        "NTILE counts rows, not values: tile 1 takes 24/17/14/13, tile 2 takes the 5 and THREE of the 4s, and the fourth 4 slips into tile 3 — peer accounts split by row arithmetic, which is why tier gates that matter get explicit CASE bands",
        "NTILE errors on tied values",
        "NTILE assigns tied accounts the average of their tile numbers",
      ],
      answer: 1,
      why: "NTILE is a row-count splitter: 16 rows into four tiles of 4, walking the ORDER BY and ignoring values entirely. The tie block straddles the tile-2/tile-3 boundary — three 4s in tile 2, one in tile 3 — with no error and no warning. If tier membership must be a function of the value, band with CASE, not tiles.",
      notes: [
        { choice: 0, why: "That is value semantics; NTILE has none. The split is silent — which is what makes it land in a board deck before anyone notices." },
        { choice: 3, why: "No averaging anywhere. NTILE assigns consecutive tile numbers to consecutive rows; ties are split by position, full stop." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-26",
      prompt: "The booked-value walk uses `SUM(total) OVER (ORDER BY stage_date)` with no frame clause. Three periods staged on 2024-10-13 and three on 2024-05-12. What does the running total do on those days?",
      choices: [
        "It adds the three same-day periods one at a time in file order",
        "The default frame is RANGE: same-date peers enter the cumulative together, so all three 10-13 rows share one running value; adding ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW would split them by arbitrary scan order instead",
        "It errors — tied order keys need an explicit tie-breaker",
        "The running total restarts whenever a date repeats",
      ],
      answer: 1,
      why: "ORDER BY with a default frame is RANGE over peers: tied keys are one logical frame boundary. The walk prints the same cumulative on all three same-day rows — defensible. The ROWS rewrite prints three different values whose order depends on scan luck, which is not defensible without a stated tie-break inside the frame.",
      notes: [
        { choice: 0, why: "That is ROWS behavior assumed by default. The default is RANGE — the frame nobody writes down is the one that decides whether peers share a rung." },
        { choice: 2, why: "Ties do not error; they activate the RANGE default. The tie-breaker conversation matters when you switch to ROWS, not before." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-27",
      prompt: "Book-size bands for the pricing review: `CASE WHEN total >= 500 THEN 'mid' WHEN total >= 1000 THEN 'large' ELSE 'small' END`. The deck reports 0 large, 25 mid, 78 small. The honest census is 1 large / 24 mid / 78 small. What is the bug?",
      choices: [
        "The ELSE arm swallowed the large band",
        "Arm order: 500 is tested first, so the one 1,000-plus period satisfies >= 500 and never reaches the large arm — the 25 is really 24 mid plus the large account; list arms from most to least specific",
        "BETWEEN is required for multi-condition bands",
        "The census is right; 1/24/78 double-counts one period",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and stops at the first match — a mis-ordered ladder silently re-bands rows instead of erroring. >= 1000 must be tested before >= 500. The 1/24/78 fold reconciling to 103 is the proof the bands are exhaustive; the arm order is what makes it honest.",
      notes: [
        { choice: 0, why: "ELSE is innocent — it catches exactly what the WHENs missed, which is why the total still foots to 103 while the mix quietly moves." },
        { choice: 3, why: "The fold totals 103 either way; band totals hide arm-order bugs precisely because the row count never changes. Only the mix moved — which is the metric the pricing review reads." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-28",
      prompt: "A 3-month smoothing overlay on the booked spine: `ROUND(SUM(booked) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2)`. What does the FIRST row of the walk print?",
      choices: [
        "The same 3-month window as every other row — frames never clip",
        "A clipped 2-row frame: there is no preceding month, so the frame is January + February only — 7,341.61 against the spine's 3,731.97 — while the last row clips the other edge",
        "NULL — edge rows cannot compute a symmetric frame",
        "The full-spine total, because the frame widens to compensate",
      ],
      answer: 1,
      why: "Frames clip at partition edges, silently. The first row's window is current + following only (3,731.97 + 3,609.64 = 7,341.61); the last row loses its following edge the same way. A smoothing column whose edges run on 2 rows while the middle runs on 3 will show a fake dip at both ends unless the report says so.",
      notes: [
        { choice: 2, why: "NULL is what a missing LAG produces, not a clipped frame — the frame still computes, just over fewer rows. The dip is real arithmetic over a shorter window." },
        { choice: 3, why: "Frames never widen to compensate; UNBOUNDED is a choice you write, not an edge behavior. The claim is exactly backwards." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-29",
      prompt: "The cadence board prints the ladder with four accounts tied at 4 periods. Monday it read Rossi, Keiko, Meyer, Alvarez; today Keiko, Rossi, Alvarez, Meyer. Same data, same query. What is missing, and what is the policy?",
      choices: [
        "A tie-breaker — RANK leaves tied rows in scan order, so append a deterministic second key (created_at, then c.id) and write the policy in the query comment",
        "A DISTINCT to collapse the tied rows into one",
        "NTILE, which forces tied rows into a stable order",
        "Nothing — SQLite guarantees alphabetical order for ties",
      ],
      answer: 0,
      why: "The primary key (period count) does not order ties, so the engine returns them in whatever order the scan produces — and that changes between runs. A reproducible board needs a stated tie-break: ORDER BY n DESC, c.id, plus a comment saying why id, because 'alphabetical by accident' is not a policy anyone can defend in review.",
      notes: [
        { choice: 1, why: "DISTINCT does not order rows — the four accounts are distinct rows already. The instability is ordering, not duplication." },
        { choice: 3, why: "SQLite makes no such promise. Apparent alphabetical order is scan luck, and it is exactly what changed between Monday and today." },
      ],
      difficulty: "hard",
    },
    {
      id: "mailchimp-mcq-30",
      prompt: "The concentration chart runs `SUM(value) OVER (ORDER BY lifetime_value DESC)` and takes each account's share of the 34,833.28 book — the 3,000-plus tier carries 63.5%, Alice Chen alone 20.8%. The intern sorts the spine by name 'for tidiness'. What dies?",
      choices: [
        "Nothing — the share column is order-independent",
        "The running sum: cumulative share only means anything against a value-ordered spine; sorted by name the cumulative walks the alphabet and every share reads nonsense — and the top-of-spine read (the 20.8% logo) vanishes from row 1",
        "The window errors without DESC in the ORDER BY",
        "The shares become negative",
      ],
      answer: 1,
      why: "A running sum over ORDER BY lifetime_value DESC makes row 1 the biggest logo and every row a 'top-N share so far' — the number concentration reporting is built on. Order by name and the cumulative is still a valid running total, but of nothing: it no longer answers 'how much of the book do the top accounts carry'.",
      notes: [
        { choice: 0, why: "SUM over the whole partition is order-independent — but the frame here is the default running range, which is entirely about order. The share column inherits every ordering choice." },
        { choice: 2, why: "DESC is required for the meaning, not for the syntax — ASC runs fine and answers a different question (smallest-first cumulative), which is the trap: valid SQL, wrong story." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mailchimp-1",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The send-funnel fate census",
      brief:
        "Mailchimp-flavored brief on the storefront db: Monday's lifecycle review opens with the send-funnel fate census — per market, how many billing periods staged, how many campaigns actually went out, and where the rest sit, with the arms reconciling to the staged base. Probed facts: 103 periods staged (45 EU, 37 APAC, 19 US, 2 LATAM); 82 carry the shipped_at send stamp — 36/29/15/2 by market — splitting into 52 sent-and-billed and 30 in flight; 14 staged periods await the first send (6/5/3/0) and 7 unsubscribed before sending (3/3/1/0). The review reads biggest market first and the send-through rate is printed beside the arms.",
      ask: "Return each market with staged, sent, billed, in-flight and awaiting-send counts plus the send-through rate to 1 decimal, biggest market first.",
      template:
        "SELECT market, staged, sent, billed, in_flight, awaiting_send,\n       ROUND({5} * sent / staged, 1) AS sent_pct\nFROM (\n  SELECT c.region AS market,\n         COUNT(*) AS staged,\n         COUNT(*) FILTER (WHERE o.shipped_at IS {1} NULL) AS sent,\n         COUNT(*) FILTER (WHERE o.status = {2}) AS billed,\n         COUNT(*) FILTER (WHERE o.status = {3}) AS in_flight,\n         COUNT(*) FILTER (WHERE o.status = {4}) AS awaiting_send\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nORDER BY staged {6};",
      slots: [
        {
          answer: "NOT",
          kind: "keyword",
          label: "the stamp guard",
          why: "shipped_at IS NOT NULL keeps only periods whose campaign actually went out — the 82 stamped rows. Dropping NOT flips the filter to IS NULL and the sent arm suddenly counts the 21 never-sent periods instead: 14 awaiting plus 7 unsubscribed.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the billed arm",
          why: "billed means the period completed its term — status 'delivered', 52 periods, 24 of them in EU. 'paid' is invoice vocabulary, not campaign vocabulary: it filters nothing here and the arm reads zero.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight arm",
          why: "In-flight campaigns went out but have not completed their term — status 'shipped', 30 periods, and the US skews hard: 10 in flight against just 5 billed. 'open' is statement vocabulary; it would zero the arm.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting-send arm",
          why: "Staged-but-never-sent periods are status 'pending' — 14 total, concentrated 6/5/3 in EU/APAC/US with LATAM at zero. They are the funnel's live edge, not a cleanup job, and they stay in the send-through denominator.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the rate multiplier",
          why: "100.0 before the division forces real arithmetic: EU prints 80.0, APAC 78.4, US 78.9, LATAM 100.0. Bare 100 keeps integer division and APAC truncates 78.4 to 78 — and on smaller arms the whole rate collapses to 0.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The review reads biggest staged base on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM — two periods and a 100.0% rate that is really a denominator joke.",
        },
      ],
      distractors: ["NULL", "delivered", "paid", "ASC", "1.0", "open"],
      walkthrough:
        "One inner fold, one rate wrapper. The inner SELECT joins periods to their market and branches the census in ONE pass: staged counts every row (45/37/19/2), sent keeps only stamped rows via shipped_at IS NOT NULL (36/29/15/2 — matching the probed per-market stamp counts), and the status arms split the funnel — 'delivered' billed (24/21/5/2), 'shipped' in flight (12/8/10/0), 'pending' awaiting send (6/5/3/0). The wrapper prints the send-through rate: EU 80.0%, APAC 78.4%, US 78.9%, LATAM 100.0%. The reconciliation identity holds by construction: billed + in-flight + awaiting + unsubscribed-residual = staged — EU 24+12+6+3=45, APAC 21+8+5+3=37, US 5+10+3+1=19, LATAM 2+0+0+0=2. The distractors each break differently: dropping NOT flips the sent arm to the 21 never-sent rows; 'paid' and 'open' are invoice vocabulary and zero the campaign arms; unquoted delivered references a column that does not exist and errors; 1.0 turns every rate into 0.8; ASC opens the review on LATAM's two-period 100.0%. The read under the numbers: LATAM's perfect rate sits on 2 periods — a denominators lesson — while the US runs more in-flight campaigns than billed terms (10 vs 5), an expansion-heavy market whose funnel is mid-pour.",
    },
    {
      id: "cs-mailchimp-2",
      tier: "hard",
      topic: "t8",
      universe: "growth",
      title: "The audience-growth walk",
      brief:
        "Mailchimp-flavored brief on the storefront db: at every month close, growth reads the audience walk — contacts added per month, the running base, and each month's share of the full-period contact pool. Probed facts (probe-derived cells, declared in the kit header): monthly contact adds run 50/51/40/34/45/27/22/40/44/33/25/30/24/33 across 2024-01 to 2025-02 — February 2024 the peak at 51, July the trough at 22, an 18-contact rebound into August — and the base closes at the canonical 498 total contacts across the 251 lines. The walk is a staged window query: fold adds per month, then LAG the prior month and let the running sum carry the base.",
      ask: "Return each month with contacts added, prior-month contacts, delta, running audience and the month's share of the 498-contact base to 1 decimal, in month order.",
      template:
        "WITH months AS (\n  SELECT SUBSTR(o.created_at, 1, 7) AS month,\n         SUM(oi.quantity) AS contacts\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  GROUP BY month\n),\nwalk AS (\n  SELECT month,\n         contacts,\n         {3}(contacts) OVER (ORDER BY {2}) AS prior\n  FROM months\n)\nSELECT month,\n       contacts,\n       prior,\n       contacts - prior AS delta,\n       SUM(contacts) OVER (ORDER BY month) AS audience,\n       ROUND(100.0 * contacts / (SELECT {4} FROM order_items oi), {1}) AS share_pct\nFROM walk\nORDER BY month;",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Shares print to 1 decimal — February reads 10.2, July 4.4. ROUND(…, 2) doubles the digits without adding truth, and ROUND(…, 0) flattens 10.2 and 10.0 into indistinguishable 10s, hiding the February-versus-January gap.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the walk spine",
          why: "The window must walk the month spine: ORDER BY month gives prior = last month's adds and a running base 50, 101, 141 … 498. ORDER BY contacts re-frames the window on the add count itself — tied months (40, 33 appear twice) merge into peer frames and the running base jumps in clumps.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "LAG(contacts) OVER (ORDER BY month) carries each month's predecessor so delta = contacts - prior reads +1 in February, -11 into March, +18 into August. LEAD flips every sign and makes the first row carry February's 51; MIN collapses prior to the running minimum (22 forever after July).",
        },
        {
          answer: "SUM(oi.quantity)",
          kind: "keyword",
          label: "the base fold",
          why: "The share denominator is the full-period contact pool: SUM(oi.quantity) over order_items = 498. COUNT(*) would divide by 251 lines and print shares twice as big; AVG(oi.quantity) divides by ~1.98 and the shares explode into thousands.",
        },
      ],
      distractors: ["contacts", "order_id", "LEAD", "COUNT(*)"],
      walkthrough:
        "Two staged layers, one rate. The months CTE folds contact adds per month — SUBSTR(created_at,1,7) buckets the 251 lines into 14 months carrying 50/51/40/34/45/27/22/40/44/33/25/30/24/33 contacts. The walk CTE windows over the month spine: LAG carries the prior month (NULL on 2024-01 — the baseline, never a zero), and SUM(contacts) OVER (ORDER BY month) runs the base up 50, 101, 141, 175, 220, 247, 269, 309, 353, 386, 411, 441, 465, 498. The outer SELECT prints delta — February +1, March -11, April -6, May +11, June -18, July -5, August +18 (the rebound), then the slow bleed to the 498 close — and each month's share of the 498 base: February 10.2% against July's 4.4%. The distractors each break differently: LEAD flips every delta's sign and parks February's 51 on the first row; ORDER BY contacts merges the tied months (40, 33) into peer frames so the running base leaps in clumps; COUNT(*) as the base divisor doubles every share against 251 lines; contacts as the precision argument rounds to a row-dependent digit count — full float noise instead of a stated rate. The read under the walk: the base is concentration-fragile — February and March alone carry a fifth of the period's contacts, and the July trough (22 adds, 4.4%) is the month the unsubscribe story (2 cancels) compounds it.",
    },
    {
      id: "cs-mailchimp-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The cadence ladder and the tie policy",
      brief:
        "Mailchimp-flavored brief on the storefront db: the Monday lifecycle review ranks client accounts by billing periods staged — the cadence ladder — and the four-way tie needs a stated rank policy before the board sees it. Probed facts: 16 client accounts carry the 103 periods; the ladder runs Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, then FOUR accounts tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), then two at 3 (Farid Nasser, Hiro Tanaka), with the rest at 2-and-under. The review qualifies accounts at 3-plus periods, ranks with shared rungs and gaps, and the tie policy (RANK vs DENSE_RANK) is the discussion the meeting is really about.",
      ask: "Return each qualifying account with its period count and cadence rank, biggest cadence first, peers sharing a rung, gaps preserved after the tie block, ties broken alphabetically inside the rung.",
      template:
        "SELECT name,\n       periods,\n       {1}() OVER (ORDER BY periods {2}) AS cadence_rank\nFROM (\n  SELECT c.name AS name, COUNT(*) AS periods\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY {5}\n  HAVING COUNT(*) >= {3}\n)\nORDER BY cadence_rank {4}, name;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie policy",
          why: "RANK gives tied cadence the same rung and skips after: the four accounts at 4 periods share rank 6, and the next rung lands on 10 — the gap says four phantom positions were skipped. DENSE_RANK shares rungs without gaps (the next rung would read 7); the review asked for gaps, so RANK. ROW_NUMBER would hand each peer a different rank — a silent judgment call.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the ladder direction",
          why: "The window must walk biggest cadence first: 24, 17, 14, 13 … ASC ranks the staging-shy accounts on top and inverts every rung. The review reads the heaviest senders first — DESC is the direction, and the outer ORDER BY then re-sorts by rank for print.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the qualification floor",
          why: "The HAVING floor keeps accounts staging at least 3 periods — 11 of 16 qualify, and the two 3-period accounts (Farid Nasser, Hiro Tanaka) stay visible so the 10-vs-7 gap after the tie block is readable. Floor 4 silently drops them and the DENSE_RANK-vs-RANK discussion dies with them.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the print direction",
          why: "The outer ORDER BY re-sorts by cadence_rank ascending so rank 1 prints first; inside a shared rung the name tie-break runs alphabetically. DESC would print the ladder upside down — the lowest cadence account first — with every number still technically correct, which is how inverted reports survive to slide two.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the cadence grain",
          why: "The ladder folds at the account grain: GROUP BY c.id counts billing periods per client account. GROUP BY o.id would count per-period — 103 rows of one period each, every rank a 1 — the fan-out lesson applied to a ladder. One row per WHAT is the question the floor and the rank both depend on.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "4", "o.id"],
      walkthrough:
        "One staged fold, one window. The derived table joins periods to their client account and folds at c.id — the account grain — counting billing periods per account, then the HAVING floor at 3 keeps 11 of the 16 accounts: Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, the four-way tie at 4 (Rossi, Sato, Meyer, Alvarez), and the two 3s (Nasser, Tanaka). The window ranks over periods DESC: rungs 1, 2, 3, 4, 5, then the tie block shares rank 6 — 6, 6, 6, 6 — and the next rung is 10, not 7: RANK skips the four consumed positions, and the gap is the visual argument that four peers were counted once. The outer sort prints rank-first with the name tie-break inside each rung, so the board reproduces byte-identically every Monday. The distractors each break differently: DENSE_RANK erases the gap (the 3s would read 7 — same shared rungs, different story); ROW_NUMBER hands the four peers arbitrary rungs 6-through-9, silently ranking peer accounts against each other; floor 4 drops the two 3-period accounts and hides the divergence the meeting exists to debate; GROUP BY o.id collapses to 103 one-period rows and every rank reads 1. The read under the ladder: Alice Chen's 24 periods are 20.8% of the book's value on her own — the concentration call outranks the tie policy, and both live in the same query.",
    },
    {
      id: "cs-mailchimp-4",
      tier: "medium",
      topic: "s7",
      universe: "pricing",
      title: "The contact-tier census, one pass",
      brief:
        "Mailchimp-flavored brief on the storefront db: before the pricing pod touches tier-page copy, it re-cuts the contact-tier ladder per market in ONE scan — every contact line banded by its per-contact rate into the starter arm (sub-55 rates) and the growth arm (55-plus). Probed facts: 251 contact lines carry 498 contacts; the starter arm holds 268 contacts on 133 lines (31.01 average line rate), the growth arm 230 on 118 lines (115.85). Per market the fold reads EU 99 starter / 100 growth (52/53 lines), APAC 96/78 (48/40), US 66/46 (30/23), LATAM 7/6 (3/2). The CASE arms must be exhaustive — a hole in the band is a hole in the tier story — and the two arms must foot back to 268 + 230 = 498 by construction.",
      ask: "Return each market with its starter and growth tier rows — lines and contacts per arm — banded at the 55-rate boundary, starter arm printed before growth, biggest markets first.",
      template:
        "SELECT c.region AS market,\n       CASE WHEN oi.unit_price < {1} THEN {2} ELSE {3} END AS tier,\n       COUNT(*) AS lines,\n       {5}(oi.quantity) AS contacts\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region, tier\nORDER BY SUM(oi.quantity) {4}, market, tier;",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the tier boundary",
          why: "The contact-tier ladder splits at the 55-dollar per-contact rate — the pricing page's starter-versus-growth seam. The band is a value gate, not a percentile: every line with a sub-55 rate is starter regardless of how the neighbors band. Move the boundary to 50 and lines between 50 and 55 silently switch arms — the tier page re-prints without a single edit to the copy.",
        },
        {
          answer: "'starter'",
          kind: "keyword",
          label: "the sub-55 arm label",
          why: "The arm label is part of the data contract — the tier page reads 'starter' and 'growth' literally. A wrong label does not error; it prints rows nobody can join to the rest of the pipeline. Labels are schema, and the CASE is where the schema lives.",
        },
        {
          answer: "'growth'",
          kind: "keyword",
          label: "the 55-plus arm label",
          why: "The ELSE arm carries the growth tier — 230 contacts on 118 lines — and its exhaustiveness is the point: any line not caught by the sub-55 test lands here, so the fold cannot lose rows. An ELSE-less CASE would emit NULL tiers instead, and the growth arm would silently shrink.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the market order",
          why: "The review reads biggest contact pools first: EU's 199 combined contacts, then APAC's 174, the US's 112, LATAM's 13. DESC on the arm-total sort puts the two markets that carry three-quarters of the base on top — ASC buries the story under LATAM's two-period footnote.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the contact fold",
          why: "Contacts live on quantity, so the arm fold is SUM(oi.quantity) — 99/100 for EU, footing to 498 across the book. COUNT(oi.quantity) would fold at line grain (52/53) and print lines as contacts, understating the base by 247 and mispricing every tier conversation built on it.",
        },
      ],
      distractors: ["50", "'premium'", "ASC", "COUNT", "AVG"],
      walkthrough:
        "One CASE, one pass, four markets. Every contact line joins to its market and bands once at the 55-rate seam: the starter arm (THEN 'starter') catches sub-55 rates, the ELSE arm catches everything else as 'growth' — exhaustive by construction, so the fold cannot lose a line. The rows come back two per market: EU 52 lines/99 contacts starter beside 53/100 growth, APAC 48/96 beside 40/78, US 30/66 beside 23/46, LATAM 3/7 beside 2/6 — and the arms foot to 268 starter + 230 growth = 498 contacts across the 251 lines, the canonical reconciliation the pricing page prints. The ORDER BY sorts on each market's combined contact pool DESC, so EU tops the read and LATAM closes it. The distractors each break differently: a 50 boundary re-bands the 50-to-55 lines into the growth arm and every market cell moves; 'premium' ships a label the rest of the pipeline cannot join to; ASC inverts the market order and opens the review on LATAM's 13 contacts; COUNT folds at line grain — 52/53 for EU instead of 99/100 — and prints lines as contacts; AVG would print mean line size and the tier story becomes noise. The read under the census: the US skews starter (66 of 112 contacts, 59%) while EU is dead even (99/100) — the growth-tier revenue story is an EU-and-APAC story, and the census proves it in one pass.",
    },
    {
      id: "cs-mailchimp-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning queue before the blast",
      brief:
        "Mailchimp-flavored brief on the storefront db: before billing sends the month's dunning emails, collections rebuilds the never-collected queue — statements that have drawn ZERO settlement legs. Probed facts: 28 billing statements against 27 payment legs; the anti-join returns 6 statements worth 15,217.00, led by INV-2025-024 at 4,937.00, then INV-2025-026 at 3,562.00, INV-2025-027 at 2,794.00, INV-2025-028 at 1,756.00, INV-2024-021 at 1,295.00 and INV-2024-018 at 873.00. One queue row is a liar: #28 is marked 'paid' in the status column yet has no payment rows — the status is a claim, the payment legs are the ledger of record, and the dunning email goes out on the ledger's word, not the label's.",
      ask: "Return the never-collected statements with account name, stored status, amount due in dollars, biggest balance first — the exact list billing pastes into the dunning blast.",
      template:
        "SELECT i.number,\n       c.name AS account,\n       i.status,\n       i.amount_cents / {1} AS amount_due,\n       COUNT({5}) AS settlement_legs\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nGROUP BY i.id\nORDER BY {4} {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Invoices store INTEGER cents — 493,700 is 4,937.00 — so the dollar read is amount_cents / 100.0, the kit's money rule. The .0 forces real division; on this queue every amount happens to divide evenly, which is exactly why the rule is written once and reused everywhere: the first queue where cents matter will not warn you.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join guard",
          why: "p.id IS NULL keeps only statements whose LEFT JOIN found no payment legs — the 6 never-collected rows. IS NOT NULL flips the read to the settled 22 and the dunning blast emails everyone who already paid. The guard IS the anti-join; everything else is bookkeeping.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the dunning order",
          why: "Collections works biggest balance first: 4,937.00, 3,562.00, 2,794.00 … ASC would open the blast on the 873.00 tail and the top of the queue — the row worth chasing — lands last. The order is the workflow.",
        },
        {
          answer: "amount_due",
          kind: "keyword",
          label: "the sort key",
          why: "ORDER BY amount_due sorts on the computed dollar column — the number the team reads. Sorting on the stored cents or the account name would still run, but the first sort key would no longer be the balance, and a two-key tie-break quietly becomes no balance order at all.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the leg counter",
          why: "COUNT(p.id) counts payment-leg ids and returns NULL rows as what they are: zero legs. COUNT(*) would count the LEFT JOIN's padded row itself and print 1 leg for every never-collected statement — the counter that turns the anti-join's own artifact into a false receipt of payment.",
        },
      ],
      distractors: ["IS NOT NULL", "ASC", "c.name", "1000", "*"],
      walkthrough:
        "One LEFT JOIN, one guard, one counter. The query joins statements to client accounts, then LEFT JOINs the payment legs — LEFT because the rows with NO legs are the answer. WHERE p.id IS NULL keeps exactly the 6 statements the legs never touched, and COUNT(p.id) prints their leg count as 0 — the honest zero, since COUNT skips the NULL ids the LEFT JOIN padded in. The cents rule turns storage into money: 493,700 / 100.0 prints 4,937.00. The final read, biggest first: INV-2025-024 4,937.00 (EU), INV-2025-026 3,562.00, INV-2025-027 2,794.00, INV-2025-028 1,756.00, INV-2024-021 1,295.00, INV-2024-018 873.00 — 15,217.00 of never-collected billed value, and every row carries 0 settlement legs. The distractors each break differently: IS NOT NULL flips to the settled 22 statements and the blast emails the wrong population; ASC inverts the work order; c.name alphabetizes the queue and the 4,937.00 row sinks below the B's; 1000 divides cents by a thousand and every balance shrinks tenfold; COUNT(*) prints 1 leg on all six rows, converting the anti-join's padding into fake receipts. The read under the queue: INV-2025-028's status column says 'paid' while its leg count says 0 — status is a claim, payment rows are the ledger of record, and the dunning email trusts the ledger. That single row is why the anti-join exists in the pipeline at all.",
    },
    {
      id: "cs-mailchimp-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The booked-value spine at month close",
      brief:
        "Mailchimp-flavored brief on the storefront db: at every month close, the finance pod walks the booked-value spine — monthly booked totals over the 14-month window (2024-01 to 2025-02) with each month's delta against its predecessor. Probed facts: the spine opens at 3,731.97 in January 2024, slides to 3,609.64, troughs at 1,193.86 in July, rebounds +1,158.21 into August (2,352.07), peaks again at 3,116.04 in September, drops -1,326.87 into November (1,648.80), and closes at 2,390.53 in February 2025 — 34,833.28 across the whole spine, 103 periods. The walk is a staged window query: fold booked value per month, LAG the prior month with a one-month lookback, and let the first row's NULL baseline stand — never a zero.",
      ask: "Return the 14-month spine with booked value, prior month, and delta, plus the trough and spine length on every row, in chronological order with the NULL baseline preserved.",
      template:
        "WITH months AS (\n  SELECT STRFTIME({2}, o.created_at) AS month,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  GROUP BY month\n),\nwalk AS (\n  SELECT month,\n         booked,\n         {1}(booked, {5}) OVER (ORDER BY month) AS prior\n  FROM months\n)\nSELECT month,\n       booked,\n       prior,\n       ROUND({4}, 2) AS delta,\n       {6}(booked) OVER () AS trough_booked,\n       COUNT(*) OVER () AS months_in_spine\nFROM walk\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "LAG(booked, 1) carries each month's predecessor so delta = booked - prior reads the month-close story: -122.33 into February, +1,158.21 into August, -1,326.87 into November. LEAD flips every sign and parks February's value on the January row — same arithmetic, inverted story.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the spine key",
          why: "Year plus zero-padded month builds 14 buckets, 2024-01 through 2025-02. '%m' alone merges the two Januarys (14 periods, 5,401.47) into one row and the spine prints 12 months — the trend loses a year boundary and the close-month math silently walks a different calendar.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological order",
          why: "The walk reads oldest-first so deltas accumulate forward and the 2,390.53 close is the last row. DESC prints the close first with deltas sign-flipped in meaning — right numbers, backwards time — and the LAG now looks forward, which is LEAD's job.",
        },
        {
          answer: "booked - prior",
          kind: "keyword",
          label: "the delta arithmetic",
          why: "Delta is current minus prior: positive is a booked-value month-over-month gain. prior - booked flips every sign and turns the August rebound into a crash — a sign error on a close report is a decision error, and neither SQLite nor the spreadsheet warns.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the lookback distance",
          why: "LAG's second argument is the offset: 1 means the immediately preceding month, which is what month-over-month means. Offset 2 answers 'two months back' — a quarterly-adjacent read wearing the same column name — and the deltas stop meaning anything the board can act on.",
        },
        {
          answer: "MIN",
          kind: "keyword",
          label: "the trough carrier",
          why: "MIN(booked) OVER () frames the whole spine and prints the trough — 1,193.86, July — on every row, so the close table carries its own floor. MAX would print the 3,731.97 open and claim every month is the peak; SUM would print the 34,833.28 spine total as a 'trough'.",
        },
      ],
      distractors: ["LEAD", "'%m'", "DESC", "prior - booked", "2", "MAX"],
      walkthrough:
        "Two staged layers, one honest baseline. The months CTE folds booked value per month — STRFTIME('%Y-%m', created_at) buckets the 103 periods into 14 months from 3,731.97 (2024-01) to 2,390.53 (2025-02). The walk CTE LAGs one month back over the chronological spine: January's prior is NULL — the baseline, never a zero — and every later row carries its predecessor. The outer SELECT prints delta = booked - prior: -122.33, then -992.56 into March, -148.17, +441.40, -862.88, then July's trough 1,193.86, then the +1,158.21 August rebound, +763.97 into September's 3,116.04 peak, the -1,326.87 November drop, -347.33, -431.97 into the new year, and +721.03 closing at 2,390.53. Beside the walk, MIN(booked) OVER () prints the 1,193.86 trough on every row and COUNT(*) OVER () prints the 14-month spine length — the close table self-documents its floor and its span. The distractors each break differently: LEAD flips every delta and dates the walk backwards; '%m' merges the two Januarys into one 5,401.47 bucket and the spine loses a year; DESC reverses time; prior - booked inverts every sign and the rebound reads as a crash; offset 2 compares each month to two back and every delta silently re-bases; MAX prints the January peak as the 'trough' on all 14 rows. The read under the spine: the book breathes — a 1,193.86 July floor against a 3,731.97 January ceiling, an August rebound that erases the trough, and a November drop (-1,326.87) bigger than the entire December book — which is why the walk, not the monthly bar chart, is the close's first page.",
    },
  ],

  problems: [
    { slug: "first-last-touch-attribution", why: "The pool's only Mailchimp-tagged row, adopted as this kit's seed: first and last touch is exactly how lifecycle marketing credits the campaign that opened the conversation versus the send that closed it — FIRST_VALUE/LAST_VALUE over an ordered touch spine." },
    { slug: "trial-to-paid-funnel", why: "Staged-to-billed is Mailchimp's conversion story — 14 awaiting periods against the 52 that billed. This problem drills the stage-count funnel with the denominator kept honest." },
    { slug: "percentage-of-users-attended-a-contest", why: "Send reach as a share of the audience base — the deliverability denominator drill. Percentage-of-base reads are how open and click rates get defended in review." },
    { slug: "find-users-with-high-token-usage", why: "Usage outliers flag accounts outgrowing their contact tier — the upgrade-signal query is a threshold fold over per-account usage, this problem's exact shape." },
    { slug: "combine-two-tables", why: "Accounts LEFT JOINed to billing periods: the whitespace read. An account with no period is whitespace, a period with no account is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Engagement signals arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. The drill the funnel-denominator work needs." },
    { slug: "find-churn-risk-customers", why: "Churn risk is an anti-join over dormancy — accounts with no recent send against a dated cutoff. The same shape drives Mailchimp's winback and re-permission calendars." },
    { slug: "customers-who-never-order", why: "The never-billed anti-join returns a confident zero on this db — every account appears somewhere. Proving the zero, not assuming it, is the data-quality habit this problem drills." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period account is the cadence crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "product-sales-analysis-ii", why: "Per-SKU contact-line revenue is the pricing pod's first chart — fold line records to SKU grain and rank. This problem drills the exact fold the tier report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Plan-SKU revenue beside units sold is how the tier page gets defended — 268 contacts at 31.01 versus 230 at 115.85 is this problem's shape at db scale." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in tier gating — which accounts carry at least N periods, which plans carry at least N contacts. This problem drills the group-level gate." },
    { slug: "immediate-food-delivery-ii", why: "Share of campaigns stamped inside the promised window versus late — the send-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "capital-gain-loss", why: "Contact adds minus contact drops net out to the movement number growth reads monthly. This problem drills ordered buy/sell folds — the same add/drop algebra the audience walk uses." },
    { slug: "game-play-analysis-i", why: "First touch per account — the staged period's first logged activity — anchors every lifecycle cohort. MIN-over-window is the shape." },
    { slug: "net-revenue-retention", why: "NRR is the metric the board actually manages — cohort revenue walks with expansion and churn netted. This problem is that walk at practice scale." },
    { slug: "median-time-to-convert", why: "Staged-to-billed has a clock: created_at to the first stamped send is the build-to-send window, and the median is the deliverability-safe summary of it. This problem drills the median-over-a-duration fold the send-SLA report re-cuts monthly." },
    { slug: "analyze-subscription-conversion", why: "Awaiting periods either bill or unsubscribe — 14 staged against 52 billed is the conversion census. This problem drills the staged-rate shape with the denominator kept at the full base, exactly the send-through discipline." },
    { slug: "ab-sample-ratio-mismatch", why: "A/B subject-line tests die on unequal arms before a single open rate is compared. This problem is the validity gate the experimentation pod runs before any lift claim — sample ratios first, lift second." },
    { slug: "dau-wau-stickiness", why: "Openers-per-month over openers-per-week is engagement stickiness — the same ratio logic as send-through over the staged base. This problem drills rate-over-rate folds where the denominator is a distinct count." },
    { slug: "second-day-confirmation", why: "Double opt-in is a timing metric: confirmations that land on day two versus day one and never. This problem drills the day-offset conditional count the list-hygiene dashboard reads weekly." },
    { slug: "find-all-unique-email-domains", why: "Domains are a grain of the audience base — gmail versus corporate tells the deliverability team where bulk-sender rules bite. This problem drills the string-split census over the contact master." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary segmentation is the audience model this kit's db already implies: cadence ladder for F, booked value for M, last stamp for R. This problem drills the CASE-band segmentation the lifecycle pod ships as its nurture map." },
    { slug: "plan-migration-paths", why: "Starter-to-growth tier moves are the revenue story behind the 55-rate boundary. This problem drills ordered transition folds — which accounts crossed the seam, in which order — the upgrade-signal read." },
    { slug: "compute-the-rank-as-a-percentage", why: "The cadence ladder reads better as percentile — Alice Chen's 24 periods are the 100th percentile of a 16-account base. This problem drills rank-to-share arithmetic over a tie-prone ladder." },
    { slug: "winback-recovery", why: "Winback is the unsubscribe arm (7 periods) read as an opportunity: who came back after going quiet. This problem drills the return-detection anti-join the re-permission calendar runs before every send." },
    { slug: "dormant-reactivation", why: "Dormancy is a dated-cutoff anti-join — accounts with no stamped send since a threshold day. This problem is the reactivation list's engine, and the honest-zero check on the empty result is the drill." },
    { slug: "delete-duplicate-emails", why: "Duplicate contacts bill twice and ship nurture sends twice — list hygiene is a correctness job, not a cleanup chore. This problem drills dedupe-with-a-keep-rule over an id-keyed base." },
    { slug: "keep-latest-dedupe", why: "When contact records collide, the latest stamp wins — keep-latest is the dedupe rule the audience master actually uses. This problem drills the argmax-per-key shape behind a defensible dedupe." },
    { slug: "rolling-7d-actives", why: "Engagement recency is a rolling window: accounts with a stamped send in the trailing 7 days, recomputed daily. This problem drills the sliding-window active count the send report opens with." },
    { slug: "sales-by-day-of-the-week", why: "Send-day matters: the best send window is a day-of-week census over staged periods. This problem drills the weekday fold — a two-grain census over the same 103-period base." },
    { slug: "mrr-waterfall", why: "Contact-tier billing makes revenue a waterfall: new tier value in, churned contacts out, net movement per month. This problem drills the bridge build the finance pod walks at every close." },
  ],
};
