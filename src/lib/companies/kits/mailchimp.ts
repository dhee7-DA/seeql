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
    "Preparation strategy: company-pools.md carries no Mailchimp section — **0 tagged rows** — so sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes; the one exception is first-last-touch-attribution, the only Mailchimp-tagged row in the pool file, adopted as the seed. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:send-funnel fate census} the Monday lifecycle review opens with, the other rebuilds the {emerald:audience-growth walk} growth reads at every month close. The bar to clear: state the audience base and the stamp filter before you compute anything — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["email-engagement-funnel", "funnel-step-conversion", "ads-funnel"],
    },
    {
      name: "Two-grain market censuses",
      why: "Periods and accounts are different grains of the same join, and every census reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5 periods per account) is the concentration read that steers market spend.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Deliverability denominators",
      why: "Send-through is a rate with a fought-over denominator: 82 of 103 only if the base keeps the awaiting and unsubscribed rows; drop them and the rate inflates to 92.1% without a single extra send. Rates die from silent filtering, so the panel asks the population out loud before looking at the number — the same discipline open rates and click rates live and die by.",
      slugs: ["queries-quality-and-percentage", "friend-requests-i-overall-acceptance-rate", "ab-test-conversion-lift"],
    },
    {
      name: "Contact-tier bands with CASE",
      why: "Contact tiers are CASE-classified: the band fold splits 251 lines into 268 sub-55 contacts and 230 at 55-plus, and plan SKUs band into free/essentials/standard/premium the same way. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the tier story, and a reordered WHEN quietly re-bands the base the pricing page prints.",
      slugs: ["the-category-of-each-member-in-the-store", "loan-types", "calculate-orders-within-each-interval"],
    },
    {
      name: "Cadence leaderboards",
      why: "Send-cadence boards are rank-window reporting where ties are guaranteed — the ladder runs 24, 17, 14, 13, 5 periods, then FOUR accounts tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax; NTILE cuts the same base into usage tiers when the board wants quartiles instead of ladders.",
      slugs: ["rank-scores", "top-travellers", "usage-tier-percentiles"],
    },
    {
      name: "Audience-growth walks",
      why: "The 14-month spine (2024-01 to 2025-02) is the growth call's home turf: monthly contact adds walk 51 in February down to the 22-contact July trough, an 18-contact rebound into August, and the running base closes at 498. LAG drives the walk and the first row's delta is NULL by definition — the baseline, never a zero. Week-over-week churn and cohort offsets are the same walk pointed at loss instead of adds.",
      slugs: ["week-over-week-churn", "biggest-window-between-events", "growth-accounting"],
    },
    {
      name: "Statement coverage set algebra",
      why: "Board packets stack populations — never-collected beside partial, this quarter beside last — and EXCEPT answers 'which billed statements never drew a settlement leg' (6 of 28 here, worth 15,217.00). UNION dedups whole rows silently, which makes it a correctness question: two byte-identical fate rows collapse and the board loses an account with no error anywhere.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "movie-rating"],
    },
    {
      name: "Nested tier gates",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, because a tier gate over a filtered staging slice that returns nothing is how nurture lists silently ship empty.",
      slugs: ["second-highest-salary", "market-analysis-i", "game-play-analysis-iv"],
    },
    {
      name: "One-pass funnel censuses",
      why: "The ops board wants staged, sent, billed, in-flight and awaiting in ONE scan — FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The correctness argument the panel listens for is the reconciliation identity: the branches plus the unsubscribed residual must sum back to the staged base.",
      slugs: ["active-businesses", "snaps-analysis", "find-stores-with-inventory-imbalance"],
    },
    {
      name: "Rails & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the audience world meets money. Every dollar read is amount_cents / 100.0, the rails split card (16 legs, 37,364.00) self-serve from wire (11 legs, 32,248.00) invoiced, and 5 statements settle on both — a split-rail read that breaks any single-rail assumption.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "duplicate-charge-pairs"],
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
  ],
};
