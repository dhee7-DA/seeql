// WhatsApp — Wave-9 (Task 98), media domain (Streaming & Social), 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Business-messaging SQL: the storefront db read as a WhatsApp Business Platform
// sandbox — customers are business accounts (region = market), orders are business
// conversations (delivered = completed billable conversation, shipped = active 24h
// conversation window with shipped_at as the session-open stamp, pending = queued
// template message awaiting its delivery window, cancelled = opted-out/blocked
// thread), order_items are conversation line records (quantity = message units,
// unit_price = per-conversation rate by tier), products are the tier & messaging
// product catalog the API prices (Utility/Marketing/Authentication families plus
// catalog lines), suppliers are BSP partners (Business Solution Providers), and
// invoices/payments are the monthly BSP billing books in INTEGER cents. Conversation
// tiers, market censuses, engagement leaderboards, the 14-month conversation spine
// and the billing rails that sit under "completed billable". Pool provenance:
// company-pools.md carries NO WhatsApp section — 0 tagged rows — so all 10 topic
// slug sets and all 16 problems are theme-curated from the pools file's SQL rows
// and say so. Case briefs quote probed figures from scripts/company-facts.md
// (probed 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const whatsappKit: CompanyKit = {
  id: "whatsapp",
  domainId: "media",
  name: "WhatsApp",
  tagline: "The world's messenger, billed by the conversation",
  accent: "text-emerald-300",

  brief: [
    "**WhatsApp** is the world's largest messenger — one-to-one chats, groups, voice notes, Status and Communities at a scale where the user count stops being a marketing number and becomes a rounding fact of the internet. The product is famously ad-free, but the business has a real monetization engine: the WhatsApp Business Platform (the Business API), where businesses hold conversations with people through BSP partners and pay per conversation — message templates split into Utility, Marketing and Authentication tiers, click-to-WhatsApp ads open threads from the feed, and catalogs turn chats into checkout. This kit maps the storefront db onto that world: the 16 customers rows are business accounts (region = market), the 103 orders are business conversations worth **34,833.28**, and the 251 order_items rows are conversation line records — quantity = message units, unit_price = the per-conversation rate by tier. The status map is fixed: delivered = {emerald:completed billable} (52, 50.5%), shipped = inside the {sky:24h window} (30, 29.1%), pending = queued template (14, 13.6%), cancelled = {rose:opted out} (7, 6.8%).",
    "The data org runs three loops and they read the same spine at different grains. Messaging growth watches the session telemetry: a conversation books at created_at, and `shipped_at` is stamped the moment the 24h window actually opens — **82 of 103 conversations** carry the stamp, opening at a **2.98-day** average with a 2–4 day spread, while the 14 queued templates have none yet (a population definition, not a cleanup job). The monetization pod owns tier mix and rates: line records carry the tier family, and every rate question starts from completed billable conversations, not conversations started. Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0` — card rails moved 37,364 across 16 settlements, wire rails 32,248 across 11. Concentration is the third story: **63.5%** of the book sits with accounts whose lifetime spend crosses 3,000 (71.2% above 2,000) — one enterprise account churning moves a quarter.",
    "Interview screens are census-then-denominator, with a messaging twist. A typical loop opens with a **two-grain market census** — EU runs 45 conversations from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a queued template count in your base?'*), then into the engagement leaderboard where four accounts sit tied at 4 conversations and rank semantics become a policy call about peer enterprise logos. Late rounds walk the {sky:14-month conversation spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or dip into the BSP billing book where a paid-status invoice with zero settlement rows (#28, 1,756.00) is waiting to be caught. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no WhatsApp section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: status censuses, two-grain market reads, tie-heavy leaderboards, tier CASE bands, partition-share windows and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db: the {emerald:trusted-BSP bench} audit the partner team runs before each quarterly review, the {sky:tier-mix share board} the growth read presents per market, the {rose:never-settled account list} billing takes into the close, the one-pass {violet:status census} the morning dashboard asserts itself with, the {orange:jump on the conversation spine} the growth call narrates from, and the {emerald:settlement rails census} the cash-forecast memo quotes. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every market's tier shares foot to 100. This expanded kit is built for spaced practice rather than one sitting: run each case once, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*.",
  ],

  dayInLife: [
    "**09:00 —** The day starts with the window telemetry refresh. A messaging-growth analyst opens the conversation dashboard before standup: did overnight threads open on schedule, did any template fire outside its delivery window, does the one-pass status census reconcile — 52 completed billable + 30 active windows + 14 queued + 7 opted out = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If window-open latency drifts off the **2.98-day** norm, the template queue gets pulled before the marketing read ships — queued templates aging past their window are {rose:revenue leaking in plain sight}.",
    "**12:30 —** Midday is the monetization read. The tier pod wants the tier-mix share board re-cut — Marketing media still the biggest single family in APAC at **44.5%** of that market's book — while a regional VP wants conversations per account beside account counts (EU 45-from-8 versus US 19-from-2) and the growth lead wants the engagement leaderboard with the four-way tie at 4 handled honestly: *shared rungs, named policy*. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**16:00 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before BSP billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; the rails mix reads card 37,364 against wire 32,248 for the partner newsletter. Then the anomaly walk, line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Conversation book value", what: "Total billed value across business conversations: 34,833.28 over 103 conversations, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 enterprise thread outweighs the smallest 42 combined." },
    { name: "Billable completion rate", what: "Completed billable conversations ÷ ALL conversations opened: 52 of 103 (50.5%). The API bills on the completed conversation, so this — not conversations started — is the revenue lens; the denominator debate is the whole interview." },
    { name: "Window-open rate", what: "Conversations whose 24h window actually opened ÷ all conversations: 82 of 103 (79.6%). The 14 queued templates stay in the denominator because 'not yet opened' is exactly what the metric watches." },
    { name: "Window-open latency", what: "Booking to window-open (created_at → shipped_at) over the 82 stamped conversations: 2.98-day average, range 2–4. Population definition ships with the number — open threads have no cycle yet and must not dilute it." },
    { name: "Opt-out share", what: "Opted-out/blocked threads ÷ conversations opened: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The trust-and-safety number that gates send volume and template approvals." },
    { name: "Market concentration", what: "Share of the book from accounts spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). Enterprise messaging is a whale business — the number that staffs the solutions-engineering pod." },
    { name: "Billing rails mix", what: "BSP settlement volume by rail: card 37,364 across 16 settlements vs wire 32,248 across 11. Card wins on count, wire wins on size — the mix behind every cash-forecast argument." },
    { name: "Collections coverage", what: "Billed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217 — against 30-day terms averaged at 28.4 days to pay. The AR anti-join the billing pod refreshes every close." },
  ],

  topics: [
    {
      name: "Conversation status censuses",
      why: "Every WhatsApp monetization screen opens with the funnel: conversations opened, windows actually opened (shipped_at stamped), completed billable. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an active-window thread 'billable' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "active-businesses", "funnel-step-conversion", "email-engagement-funnel", "find-zombie-sessions", "median-time-to-convert"],
    },
    {
      name: "Two-grain market censuses",
      why: "Conversations and business accounts are different grains of the same join, and every census here reports both: EU runs 45 conversations from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is volume and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count", "popularity-percentage"],
    },
    {
      name: "Joining accounts to conversations",
      why: "Accounts carry market and created_at; conversations inherit them through joins, and the join type decides who survives. A conversation without an account row is corruption; an account without conversations is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "students-and-examinations"],
    },
    {
      name: "Engagement leaderboards",
      why: "Account engagement is rank-window reporting where ties are guaranteed — four accounts sit at 4 conversations each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer enterprise logos, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Tier banding with CASE",
      why: "Conversation tiers are CASE-classified — Utility, Marketing, Authentication — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the billed forecast, and a reordered WHEN quietly re-bands the base the API prices against.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Tier-mix shares with partition windows",
      why: "The growth board reads tier mix per market — what share of the EU book is Marketing media versus Utility tooling — and that is a window over a pre-folded market×tier aggregate, not a self-join. SUM(billed) OVER (PARTITION BY market) is the denominator engine; the shares must foot to 100 per market or the board deck is wrong.",
      slugs: ["find-the-team-size", "running-total-for-different-genders", "project-employees-iii"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month conversation spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "movie-rating", "rolling-7d-actives", "new-users-daily-count", "sessionize-events", "find-bursty-behavior", "second-most-recent-activity", "growth-accounting", "median-time-to-convert"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-account conversation counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "Set ops & opt-out anti-joins",
      why: "Board packets stack populations — active-window threads under opted-out threads, this quarter beside last — and EXCEPT answers 'which billed accounts never settled'. The opt-out read is the anti-join: threads blocked before the window opened never bill, and on the finance side the unpaid-invoice anti-join returns a real 6 rows worth 15,217, not a zero.",
      slugs: ["customers-who-never-order", "monthly-transactions-ii", "find-churn-risk-customers", "dormant-reactivation", "winback-recovery"],
    },
    {
      name: "Billing rails & cents discipline",
      why: "Opened is not billed, billed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the messaging world meets money. Every dollar read is amount_cents / 100.0, the rails split card versus wire, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "number-of-rich-customers", "ar-aging-schedule", "generate-the-invoice", "duplicate-charge-pairs"],
    },
  ],

  theory: [
    {
      id: "whatsapp-t1",
      q: "Your business-account report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a conversation column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins conversations to business accounts: a conversation with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no conversations ARE the answer, arriving with NULL conversation columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-conversing accounts, and proving that zero is itself the analyst's job: all 16 business accounts appear in the conversation table somewhere. The anti-join that actually bites in this business is one table over — invoices with no settlement rows, where the 6-row answer is worth 15,217.",
      tag: "joins",
    },
    {
      id: "whatsapp-t2",
      q: "Four business accounts tie at 4 conversations on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose enterprise account gets the named solutions engineer. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment, because on a messenger leaderboard the tie IS the story.",
      tag: "windows",
    },
    {
      id: "whatsapp-t3",
      q: "The census shows 103 conversations and 16 accounts; EU shows 45 conversations and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts conversation rows after the join — one row per conversation, so an account with 24 threads contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 conversations collapse to 8 business logos. Neither is wrong: conversations measure messaging volume and template momentum, accounts measure installed base and coverage. The ratio — 5.6 conversations per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for line records and COUNT(*) silently counts line records, not conversations — 251 of them. On the Business API that error has a price tag, because line records are what the per-conversation rate multiplies. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "whatsapp-t4",
      q: "shipped_at is NULL until the 24h conversation window opens. What is your policy for the window-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only opened conversations have a latency, so the report measures booking-to-window-open for the 82 of 103 conversations that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL conversations returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the opened subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 opted-out rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day window opens for templates still sitting in the delivery queue. A queued template is not a zero-day conversation; it is no conversation yet. A report whose WHERE clause is doing definitional work without saying so is exactly what a WhatsApp reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "whatsapp-t5",
      q: "The growth review wants completed-billable value per market for markets carrying at least ten conversations. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards active-window, queued and opted-out rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-conversation floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps exactly the embedded tier — 24, 17, 14 and 13 conversations — and the interviewer knows it. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to conversations versus to billed value. The strong answer places every filter by asking: is this a fact about one conversation, or about a market?",
      tag: "pipeline",
    },
    {
      id: "whatsapp-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 conversations always produce a mean (338.19 platform-wide, 6.44 per account — exactly four enterprise logos clear the per-account bar). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides; a staging cut for a market with queued templates only, no delivered rows yet, still runs the outer query and returns an empty board. The correlated cousin (compare each conversation to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "whatsapp-t7",
      q: "The conversation trend buckets threads by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's threads, and quarter-end is exactly when click-to-WhatsApp campaigns land their push. The latency read underneath: julianday(shipped_at) - julianday(created_at) over the 82 stamped rows, 2.98 days on average — julianday, not string subtraction, or '10' minus '9' arithmetic starts lying at month boundaries. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's own extremes tell the story: the 1,193.86 July trough and the +1,158.21 jump into August.",
      tag: "dates",
    },
    {
      id: "whatsapp-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, the rails must foot card 37,364 plus wire 32,248, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "whatsapp-t9",
      q: "Walk me through the three counts — COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) — on the conversations table, and the story each tells the business.",
      a: "COUNT(*) counts rows: 103 conversations opened, no exceptions — the denominator every rate gets judged against. COUNT(shipped_at) counts non-NULL window-open stamps: 82 threads whose 24h window actually opened — the gap to COUNT(*) is exactly the 14 queued templates plus 7 opted-out threads, so the gap itself is a queue-and-trust read. COUNT(DISTINCT customer_id) folds the 103 conversations back to 16 business accounts — the installed base behind the volume. Three counts, three grains: threads, opened threads, logos. The trap is letting one query imply all three: a dashboard that labels COUNT(*) 'accounts active' is a 6× lie. On this db the counts are 103, 82 and 16 — and a strong candidate can say, unprompted, which one the slide in front of them is actually showing.",
      tag: "aggregation",
    },
    {
      id: "whatsapp-t10",
      q: "You need message-unit detail beside conversation-level billed totals. How do you join order_items for the line records without triple-counting the book?",
      a: "Name the two grains and never aggregate across them in one expression. The conversation grain (orders) holds the billed total — 34,833.28 over 103 rows; the line-record grain (order_items) holds 251 rows of message units at per-conversation tier rates. Join them for detail and SUM(o.total) on the joined rows re-adds each conversation's value once per line — 103,244.55 on this db, roughly triple the book. The fixes: aggregate at the conversation grain FIRST (CTE or derived table), then join the fold to line detail; or aggregate at the line grain (SUM(quantity × unit_price)) and never touch orders.total in the same query. On the Business API the error has a literal price tag, because the per-conversation rate multiplies at exactly one of those grains. 'One row per what?' is the whole defense.",
      tag: "joins",
    },
    {
      id: "whatsapp-t11",
      q: "When do you reach for a window with PARTITION BY instead of GROUP BY in the messaging reporting?",
      a: "When the row must survive. GROUP BY folds: 103 conversations become 16 per-account rows, and every other column must be an aggregate or disappear. PARTITION BY annotates: COUNT(*) OVER (PARTITION BY customer_id) stamps every conversation with its account's total — 24 beside each of the top account's threads — while rows stay intact. The messaging reads that need the annotated shape: each conversation beside its account's running billed value, each thread beside its market's average, each account beside its market's conversation count. The decision test is 'does the output keep one row per conversation?' If yes, windows; if the deliverable IS the fold, GROUP BY. They compose: GROUP BY builds the per-market fold, then a window over the fold computes tier-mix shares — which is exactly the share-board shape this kit's case runs.",
      tag: "windows",
    },
    {
      id: "whatsapp-t12",
      q: "Growth wants month-over-month billed deltas and a 'two consecutive down months' flag on the conversation spine. Where do LAG and LEAD each belong, and what do you do about the edge rows?",
      a: "LAG reads the previous row — this month versus last, the delta column, the fade detection; LEAD reads the next — 'what happened the month after the spike', the forward view for post-mortems. Both return NULL at the edges: the first month has no prior, the last has no next, and the policy is to report the NULL as 'baseline', never to coalesce it to zero — a zero delta on the spine's first row reads as a flat month that never happened, and a two-down-months streak checker that sees an invented 0 will fire on fake data. The flag itself stacks in a second staging step: compute deltas in a CTE (window output is not visible to WHERE in the same SELECT), then a window counts consecutive negative deltas — gaps-and-islands over the red rows. One structural requirement: the spine must be complete. A missing month silently shifts every LAG pair, so build it from a calendar dimension or prove the gaps away first.",
      tag: "windows",
    },
    {
      id: "whatsapp-t13",
      q: "STRFTIME, julianday and the half-open window — how do you slice the conversation calendar on TEXT timestamps without losing threads at the edges?",
      a: "Three tools, three jobs. Bucketing: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 spine buckets on this db; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction. Calendar math: julianday(shipped_at) − julianday(created_at) — the window-open latency, 2.98 days on this db's 82 stamped threads; julianday converts TEXT stamps to float days so subtraction is honest arithmetic, and string subtraction starts lying at month boundaries ('10' minus '9' is fine; '2024-10-01' minus '2024-09-30' is not a number at all). Range filters: half-open windows — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN against '2024-03-31' drops everything after midnight, and quarter-end is exactly when click-to-WhatsApp campaigns land their push. The quiet dependency: string comparison only works because ISO dates sort lexicographically — any non-ISO format in the column poisons every range filter silently.",
      tag: "dates",
    },
    {
      id: "whatsapp-t14",
      q: "COALESCE, IFNULL and NULLIF — give the policy for each on the Business Platform's telemetry, with one place each earns its keep.",
      a: "COALESCE walks a fallback list — the display policy: COALESCE(shipped_at, 'awaiting window') prints an honest sentinel for the 14 queued templates instead of a blank that reads as broken. IFNULL is the two-argument twin — same job, shorter; reach for COALESCE when the fallback chain is real. NULLIF is the opposite move: it returns NULL when the two agree — the divide-by-zero guard. Every per-account ratio in this kit (conversations per account, billed per thread) is one zero-conversation account away from division by zero, and NULLIF(denominator, 0) turns that into a NULL the dashboard labels 'n/a' instead of an infinity in a board deck. The policy line that separates a strong candidate: COALESCE and IFNULL change what MISSING data displays as; NULLIF manufactures a missing value to protect a computation. They are not interchangeable, and 'I coalesce everything to zero' is the answer that ends the screen — a queued template is not a zero-day conversation; it is no conversation yet.",
      tag: "nulls",
    },
    {
      id: "whatsapp-t15",
      q: "Billing asks 'which business accounts have never settled a single statement?' — walk me through the set-operation shape, and where the naive version lies.",
      a: "Two folds, one difference. Branch one: fold invoices per account to (account, billed). Branch two: the same fold restricted to accounts that appear behind a settlement — an IN subquery walking payments → invoices → customer ids. EXCEPT subtracts the second set from the first, and on this db three accounts survive: Hiro Tanaka 1,756 (the #28 paid-status lie), Chloe Dubois 1,295, Pedro Alvarez 873. The lie lives in the shapes: EXCEPT compares whole TUPLES, so branch two must carry identical columns and identical fold semantics — a branch that sums only SETTLED invoices produces different dollar figures, and partially-settled accounts (Emma: 4 statements, 3 settled) silently survive a dunning list they do not belong on. The alternative shapes: NOT EXISTS for the NULL-safe probe, or a LEFT JOIN + IS NULL at invoice grain. UNION answers 'who ever touched billing at all' and INTERSECT answers 'who settled' — the operator choice IS the business question.",
      tag: "set-ops",
    },
    {
      id: "whatsapp-t16",
      q: "The tier-mix board needs billed value per market×tier, then each cell's share of ITS market. How do you stage that so the shares foot to 100 per market?",
      a: "Fold first, share second. The CTE joins line records → conversations → accounts → tier products and folds the market×tier grid to billed value per cell. The outer SELECT computes share = 100.0 × billed_value / SUM(billed_value) OVER (PARTITION BY market): the window recomputes each market's book inside its partition, so every market's shares sum to 100 by construction — no second query, no HAVING gymnastics. The two mistakes that break the foot: ORDER BY inside the window instead of PARTITION BY (a running sum as denominator — shares climb cell by cell toward nonsense), and partitioning by tier instead of market (each family's share of the whole PLATFORM — the global mix, not the market mix the board priced against). The multiplier needs the .0 — 100.0 before the division — or integer arithmetic truncates the first decimal off every share. This is the exact shape of the tier-mix case in this kit: fold, partition, divide, and the foot-check is the deck's receipt.",
      tag: "ctes",
    },
    {
      id: "whatsapp-t17",
      q: "EXISTS, IN, or a derived table — pick one for 'accounts with at least one opted-out thread' and defend it.",
      a: "EXISTS, and the defense is threefold. Semantics: the ask is an existence probe — at least ONE cancelled row — which is what EXISTS(short-circuits on the first match) answers; IN materializes the whole status list and compares membership. NULL safety: EXISTS never trips on NULLs; NOT IN over a column that ever carries one returns an empty result silently — the staging-table failure mode this kit's screens drill, and an empty trust-and-safety report is the worst possible failure mode for a trust-and-safety report. Scale behavior: the semi-join shape lets the engine probe an index instead of building a list. The derived table wins when the subquery is itself an aggregation — 'accounts with 2+ opted-out threads' needs GROUP BY customer_id HAVING COUNT(*) >= 2 staged first. So the honest answer names the boundary: existence → EXISTS; aggregated property → derived table or CTE; IN → small static lists only. 'They all work' is true and beside the point.",
      tag: "subqueries",
    },
    {
      id: "whatsapp-t18",
      q: "How does GROUP BY treat NULLs — and why does the status census still reconcile to 103 by construction?",
      a: "GROUP BY treats NULL as its own group: all NULL values fold into one bucket — which is why a window-open census (grouping by shipped_at presence) puts the 21 unstamped threads in one visible 'no window yet' group instead of scattering them across markets. The status census reconciles because status is NOT NULL: every one of the 103 conversations carries exactly one of the four stage labels, so the conditional counts partition the table with no remainder — 52 + 30 + 14 + 7 = 103 by construction, not by audit luck. The two census traps: a typo'd arm ('deliverd') doesn't error — it silently prints 0 and the total comes up 51, so the reconciliation identity IS the typo alarm; and COUNT(column) instead of COUNT(*) shrinks the denominator on sparse columns and breaks the identity. The strong answer states the identity out loud — arms exhaustive, ELSE 0, COUNT(*) denominator — because that identity is what lets three dashboard tiles share one number without drifting.",
      tag: "groupby",
    },
    {
      id: "whatsapp-t19",
      q: "The engagement leaderboard needs a top-5 cut. What does LIMIT do to a tie, and how do you cut a top-N fairly?",
      a: "LIMIT is positional and blind to ties: ORDER BY conversations DESC LIMIT 5 keeps the accounts at 24, 17, 14, 13 and 5 — and the four accounts tied at 4 are simply absent, with no say in which five logos 'won'. If two accounts tie ON the cut boundary, LIMIT picks one arbitrarily by whatever order the plan found — a silent judgment call about which enterprise logo gets the named solutions engineer. The fair cuts: rank windows — RANK() OVER (ORDER BY conversations DESC) <= 5 keeps tied peers on shared rungs, so a boundary tie visibly admits six accounts; or an explicit, named tie-breaker — ORDER BY conversations DESC, account ASC LIMIT 5 — deterministic and states its politics. What never passes review: LIMIT without ORDER BY (undefined), or LIMIT with a silent tie. On a messenger leaderboard the tie IS the story; the cut should be able to say out loud what it does with one.",
      tag: "pipeline",
    },
    {
      id: "whatsapp-t20",
      q: "EU and APAC both have 3 opted-out threads. Same numerator — why does the review treat the markets differently, and how do you compute the share so it survives scrutiny?",
      a: "Because the denominator is the story: 3 of 45 conversations in EU is 6.7%, 3 of 37 in APAC is 8.1% — APAC's opt-out posture is worse per thread, and the raw counts hide exactly that. Construction rules: state the denominator BEFORE computing (all conversations opened, including queued templates — the house rule from the window-open read), force real arithmetic with 100.0 * numerator / COUNT(*) so integer division cannot truncate 6.7 to 6, and round at the display edge, not inside the ratio. Then the honesty layer: small denominators get caveats — LATAM's 0% opt-out share is 0 of 2, arithmetic not safety — and the census identity backs the number (arms exhaustive, reconciles to 103 by construction). The follow-up is always 'what changed your denominator?' — computing opt-out share over ACTIVE threads only, for instance, deletes the very threads that opted out and quietly flatters every market.",
      tag: "ratios",
    },
    {
      id: "whatsapp-t21",
      q: "Template names and account keys arrive messy — ' order_update ', 'ORDER-UPDATE'. What's the SQL hygiene kit, and which fields must never be cleaned after the fold?",
      a: "The kit: TRIM for padding, UPPER or LOWER for case-folding, REPLACE for separators and junk characters, LENGTH for the template-body caps the API enforces — and the order matters: trim, then fold, then join or group. The invariant: any column used as a JOIN or GROUP BY key gets normalized on BOTH sides in the same vocabulary — joining a template registry's name to the send log fails silently if one side is 'Order_Update' and the other 'order-update', because string equality is byte equality. Display columns can keep their case; key columns cannot. The rule that trips candidates: never clean AFTER the fold — GROUP BY ran on the un-normalized keys, so ' Order_Update ' and 'order_update' are already two rows and the template-performance read is quietly split. The test: re-run the distinct count after hygiene — if COUNT(DISTINCT LOWER(TRIM(name))) is smaller than COUNT(DISTINCT name), you had split keys, and every historical number grouped on the raw column inherits the split.",
      tag: "strings",
    },
    {
      id: "whatsapp-t22",
      q: "One-pass censuses: FILTER (WHERE …), SUM(CASE WHEN …), and GROUP BY — when does each win on the conversation tables, and can they coexist?",
      a: "GROUP BY wins when the output shape is rows-per-group and nothing needs to sit beside the groups — the market×status detail read. The two conditional-aggregation shapes win when every count must share one row — the morning census the dashboard tiles all divide by: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable classic; COUNT(*) FILTER (WHERE status = 'delivered') is the modern SQLite/Postgres form that states the predicate as a predicate — same numbers, more legible definition, and it composes with ROUND and division without nesting CASE inside CASE. They coexist freely in one SELECT, and the choice is house style plus engine support. The discipline both shapes demand: arms exhaustive (ELSE 0), denominators COUNT(*), and the reconciliation identity — 52 + 30 + 14 + 7 = 103 — checked in the same query. A census that can't prove its own arms are exhaustive is a screenshot, not a metric.",
      tag: "filters",
    },
    {
      id: "whatsapp-t23",
      q: "How do you version a metric definition like 'completed billable' so three dashboards don't drift into three different revenue numbers?",
      a: "Treat the definition as a table, not a vibe. The registry entry states: the grain (one row per conversation), the filter (status = 'delivered' — NOT 'not cancelled', which quietly admits the 30 active windows and 14 queued templates), the denominator it reports against (all 103 opened, not just stamped), and the owner. Every dashboard queries the registry's canonical fold — or the table it materializes — instead of re-deriving the filter from memory, which is where drift is born: someone writes status != 'cancelled', the number moves from 52 to 96, and three teams present for a week before anyone notices the revenue lens tripled. The audit query reconciles on every run: the four stage arms must sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 by construction — and any miss is an incident, not a rounding note. Version changes are announced, dated, and run side-by-side for a cycle, because 'completed billable' moving its definition silently invalidates every trend line that quoted it.",
      tag: "quality",
    },
    {
      id: "whatsapp-t24",
      q: "Cumulative billed value, rolling average, and the tie problem: build both from the same window, and explain when the default frame betrays you.",
      a: "Same walk, different frames. Cumulative: SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) — the default frame RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW accumulates from the account's first conversation. Rolling average: AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — the frame must be stated, because the default never stops looking backwards. The betrayal is RANGE vs ROWS: RANGE includes PEERS — rows tied on the ORDER BY key enter the cumulative together, so two conversations sharing a created_at second jump the running total twice at once; ROWS walks strictly one row at a time. On a month spine ties are rare; at conversation grain, click-to-WhatsApp bursts make them guaranteed, and the honest choice is ROWS (or accepting that a burst is one simultaneous event). The expert flourish: with a date axis, RANGE peers 7 DAYS back while ROWS peers 7 ROWS back — if a day is missing, only one of those is the trend the stakeholder asked for.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "whatsapp-mcq-1",
      prompt: "A conversation row's status reads 'shipped'. In this kit's WhatsApp stage map, what happened?",
      choices: ["The 24h conversation window is active — session-open stamped, not yet completed", "Completed billable — the conversation closed and invoices", "Opted out — the user blocked the thread", "Queued template awaiting its delivery window"],
      answer: 0,
      why: "The stage map is fixed: shipped = inside the active 24h window, stamped at session-open (30 of 103 conversations, 29.1%). It is 'live and metering', not yet a completed billable conversation.",
      notes: [
        { choice: 1, why: "Completed billable is 'delivered' — 52 conversations, 50.5%. Calling the 30 active windows billable inflates revenue before a single thread closes." },
        { choice: 3, why: "Queued-template is 'pending' — 14 rows with no shipped_at yet. Pending has no window stamp and no latency; shipped already has both." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-2",
      prompt: "Window-open rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 opened, 14 queued and 7 opted-out of 103 conversations.",
      choices: ["Opened + opted-out only (82/89 = 92.1%)", "All conversations opened (82/103 = 79.6%)", "Completed billable only (52/82)", "Distinct business accounts (82/16)"],
      answer: 1,
      why: "The house definition: opened ÷ ALL conversations — the 14 queued templates stay in the denominator because 'not yet opened' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 queued inflates the rate to 92.1% by deleting the population still awaiting its delivery window — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, shipped_at is window-open. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-3",
      prompt: "EU carries 45 conversations from 8 business accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts conversation rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 conversations per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every conversation has an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is conversations AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to opted-out threads only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the opt-out share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the opt-out map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-5",
      prompt: "Keep only business accounts carrying at least 10 conversations. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE conversations >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A conversation-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 conversations — clears a 10-per-account bar.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'conversations' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 conversations, then FOUR accounts tied at 4. Under RANK, what rank do the two 3-conversation accounts carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-conversation accounts share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The queued templates double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 conversations.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-8",
      prompt: "A staging-table opt-out list uses account_id NOT IN (SELECT customer_id FROM conversations WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every conversation carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty trust-and-safety reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-9",
      prompt: "A board stack puts active-window conversations under opted-out conversations in one layout, built with UNION. A reviewer says one account's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same account, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same account, same counts, no market or branch label — collapse into one, and the board loses an account with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-10",
      prompt: "A dashboard walks billed conversation value thread by thread: SUM(total) OVER (ORDER BY created_at). Two threads share a created_at second, and the cumulative 'jumps two threads at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at conversation grain, click-to-WhatsApp bursts make them guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-11",
      prompt: "The morning dashboard needs all four stage counts — 52 billable, 30 active windows, 14 queued, 7 opted out — in ONE row from ONE scan. Which pattern delivers that shape?",
      choices: [
        "Four separate GROUP BY status queries pasted side by side",
        "Four SUM(CASE WHEN status = … THEN 1 ELSE 0 END) columns in a single SELECT",
        "COUNT(DISTINCT status) beside COUNT(*)",
        "GROUP BY status with COUNT(*)",
      ],
      answer: 1,
      why: "Conditional aggregation folds each status into its own column in one pass — the one-row census shape the tiles share, with the reconciliation identity visible (52 + 30 + 14 + 7 = 103). GROUP BY status computes the same numbers as four ROWS, which then have to be pivoted by hand.",
      notes: [
        { choice: 3, why: "Correct counts, wrong shape: four rows that a dashboard then transposes. The ask fixed the shape — one row — and conditional aggregation is the tool that obeys." },
        { choice: 2, why: "COUNT(DISTINCT status) counts status labels (4), not conversations per status. A column count wearing a census name." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-12",
      prompt: "Billing wants the single most expensive conversation, and two threads can tie at the top of the book. Which read returns the NUMBER safely regardless of ties?",
      choices: [
        "SELECT MAX(total) FROM orders",
        "SELECT id, total FROM orders ORDER BY total DESC LIMIT 1",
        "SELECT id, total FROM orders WHERE total = MAX(total)",
        "SELECT TOP 1 total FROM orders",
      ],
      answer: 0,
      why: "MAX(total) aggregates to the value itself — ties change nothing about the number. ORDER BY … LIMIT 1 returns one arbitrary row among tied peaks (fine for 'show me A thread', wrong when you promised THE value), and an aggregate inside a row-level WHERE is a syntax error.",
      notes: [
        { choice: 1, why: "LIMIT 1 works until the tie: SQLite then picks one arbitrarily — you presented one thread as THE peak when two share it. For a row, add a named tie-breaker and say so." },
        { choice: 3, why: "TOP is SQL Server syntax — SQLite errors on sight. Engine vocabulary is part of the screen." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-13",
      prompt: "The conversation trend must bucket 2024-01 and 2025-01 into DIFFERENT months. Which key does that?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "STRFTIME('%Y', created_at)",
        "UPPER(created_at)",
      ],
      answer: 1,
      why: "Year plus zero-padded month — '%Y-%m' — yields 14 distinct spine buckets on this db from 2024-01 to 2025-02. '%m' alone merges the two Januarys into one fake bucket; '%Y' collapses the spine to two rows.",
      notes: [
        { choice: 0, why: "The '%m' trap: Jan 2024 and Jan 2025 fold together, the trend doubles some months and invents a 13-month year." },
        { choice: 2, why: "A year key is a 2-bucket chart — the seasonality the growth call needs is erased." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-14",
      prompt: "Billing prints dollars from INTEGER-cent money. Why is the house read amount_cents / 100.0 and not amount_cents / 100?",
      choices: [
        "Identical today — cents are always whole dollars, so the .0 is decoration",
        "/ between two INTEGERs truncates the sub-dollar remainder — harmless on this book's whole-dollar rows, silently wrong the day an odd-cent settlement lands",
        "/ 100 rounds to the nearest dollar",
        "SQLite cannot divide two INTEGERs",
      ],
      answer: 1,
      why: "Integer ÷ integer is integer division: 12,349 cents prints 123, not 123.49. On this db every ledger sum happens to be a whole multiple of 100, so the bug is invisible today — which is exactly why the /100.0 convention is drilled: the discipline has to hold before the data turns odd.",
      notes: [
        { choice: 0, why: "True today, and that is the trap — the convention exists for the odd-cent settlement that arrives next quarter, not for the rows that made the rule." },
        { choice: 2, why: "Nothing rounds: integer division discards. 12,399 / 100 is 123, not 124 — ROUND is a separate, later step." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-15",
      prompt: "The BSP partner review counts Nordic Gadgets' tier products. The suppliers → products → order_items chain folds 43 line records touching Nordic products. Which expression reads 3 — the true product count?",
      choices: [
        "COUNT(oi.id)",
        "COUNT(DISTINCT p.id)",
        "COUNT(DISTINCT oi.id)",
        "SUM(p.id)",
      ],
      answer: 1,
      why: "The line-record grain fans each product out to every conversation line that references it — 43 rows covering 3 tier products. COUNT(DISTINCT p.id) folds back to the catalog; everything counting oi rows reports messaging volume wearing a product-count name.",
      notes: [
        { choice: 0, why: "43 — one per line record. A real number answering 'how active is this partner's product', not 'how wide is its catalog'." },
        { choice: 3, why: "SUM over ids adds key values — a meaningless figure that changes when a product re-registers. Aggregates over keys are category errors." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-16",
      prompt: "The pricing page bands conversation rates with a CASE — Utility, Marketing, Authentication arms — but omits the ELSE. What lands in the fourth band?",
      choices: [
        "Rows matching no arm are dropped from the result",
        "Rows matching no arm return NULL — a fourth, unnamed band that COUNTs as a hole in the rate card",
        "SQLite raises an error at compile time",
        "The first arm's value is reused for unmatched rows",
      ],
      answer: 1,
      why: "CASE with no ELSE returns NULL on no-match — so any rate not caught by the three arms becomes an invisible fourth tier. The band census shows a NULL band with its own count, and the billed forecast is short by exactly that population.",
      notes: [
        { choice: 0, why: "Nothing is dropped — the row survives with NULL in the band column. Silent NULL bands are worse than dropped rows: they pass every COUNT that isn't looking." },
        { choice: 2, why: "No error — NULL-on-no-match is standard CASE semantics. The hole is silent, which is why exhaustive arms are a review gate." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-17",
      prompt: "Count Q1 conversations — January 1 through March 31, quarter-end push included. Which WHERE clause keeps them all?",
      choices: [
        "WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "WHERE MONTH(created_at) BETWEEN 1 AND 3",
        "WHERE created_at LIKE '2024-0%'",
      ],
      answer: 1,
      why: "Timestamps carry a time-of-day, so '2024-03-31' as an upper bound excludes everything after midnight — exactly when quarter-end CTWA campaigns land their push. The half-open range [Jan 1, Apr 1) keeps all of March including its final hours.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends against a bare date string — '2024-03-31T18:22' sorts after '2024-03-31' and drops out of the bucket silently." },
        { choice: 3, why: "The pattern matches April through September too — '2024-0%' is a coincidence of digits, not a calendar. It over-counts by six months." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-18",
      prompt: "The billed-value spine opens at 2024-01 (3,731.97) and its delta column reads NULL for that first row. What ships?",
      choices: [
        "COALESCE it to 0 so the chart has no gaps",
        "Report it as NULL / 'baseline' — there is no prior month to differ from",
        "Drop the row so the chart starts at February",
        "Fill it with the average delta across the spine",
      ],
      answer: 1,
      why: "The first month's delta is NULL by definition — no prior row, no baseline, no change. Coalescing to 0 invents a flat January and corrupts every downstream 'streak of down months' check that treats 0 as a real reading.",
      notes: [
        { choice: 0, why: "0 is a factual claim — 'no change' — about a month that had nothing to change against. This is exactly how fake flat months are born." },
        { choice: 2, why: "Dropping the row amputates January's 3,731.97 and shifts every LAG pair — the spine no longer reconciles to 13 buckets or to 103 conversations." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-19",
      prompt: "Billing's dunning draft uses a LEFT JOIN from invoices to payments but returns only 22 statements — the 6 never-collected are gone. What happened?",
      choices: [
        "The LEFT JOIN is buggy — it dropped unmatched rows",
        "A WHERE on a payments column (like p.method = 'card') filtered the NULL payloads away, silently downgrading the LEFT JOIN to an INNER JOIN",
        "GROUP BY collapsed the 6 unmatched rows into one",
        "Statements with no payments cannot appear in any join",
      ],
      answer: 1,
      why: "The classic silent downgrade: a WHERE predicate on the right table's column kills every NULL-payload row (NULL = anything is UNKNOWN), and 28 − 6 = 22 is exactly the inner-join result. The fix is moving the predicate into the ON clause — or testing p.id IS NULL when the dunning rows are the point.",
      notes: [
        { choice: 3, why: "Backwards — unmatched rows are precisely what a LEFT JOIN preserves; they arrive with NULL right-side columns. Deleting them is the WHERE's doing, not the join's." },
        { choice: 0, why: "The join behaved exactly as written. The WHERE clause did the damage; fixing the join type would only hide the filter that caused it." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-20",
      prompt: "The partner newsletter wants each market's BSP partners folded into one comma-separated cell. Which aggregate turns partner ROWS into that string?",
      choices: [
        "CONCAT(s.name, ',')",
        "GROUP_CONCAT(DISTINCT s.name)",
        "STRING_AGG(s.name, ',')",
        "s.name || ','",
      ],
      answer: 1,
      why: "GROUP_CONCAT is SQLite's row-to-string fold: GROUP_CONCAT(DISTINCT s.name) per market returns the partner list as one cell. CONCAT and || join values inside a single row's expression — they cannot fold six partner rows into one.",
      notes: [
        { choice: 2, why: "STRING_AGG is the Postgres/standard name — SQLite answers to GROUP_CONCAT. The vocabulary trip between engines is the point of the question." },
        { choice: 0, why: "CONCAT operates per row — it appends a comma to each partner name individually, producing six strings, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-21",
      prompt: "Settlement days = issue-to-payment. Five statements settled on TWO legs (two payment rows, different days). Which read keeps the average honest at 28.4 days over the 20 statements that carry legs?",
      choices: [
        "AVG(julianday(p.paid_on) − julianday(i.issued_on)) over the invoices ⋈ payments join",
        "First fold to the FIRST leg per statement — MIN(p.paid_on) — then average the per-statement days",
        "AVG over payments rows only, ignoring statements with no legs",
        "Use MAX(p.paid_on) so no statement is ever underestimated",
      ],
      answer: 1,
      why: "The join fans each two-leg statement into two rows, so the naive join average weights those five statements twice — their second legs dragging the number. Folding to MIN(paid_on) restores the statement grain first; then the average reads time-to-first-settlement, which is what the 28.4 figure names.",
      notes: [
        { choice: 0, why: "27 payment rows over 22 statements-with-legs — the five split statements contribute two rows each and the average drifts toward their later legs. A grain bug, not a rounding issue." },
        { choice: 3, why: "MAX measures 'when did we finish collecting' — the dunning clock, not time to first settlement. Naming the metric pins the fold." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-22",
      prompt: "A teammate joins order_items to fetch message-unit detail and reports total billed value as 103,244.55 — nearly triple the book's 34,833.28. Diagnosis?",
      choices: [
        "order_items.total carries a different rate scale",
        "The join fanned each conversation out to its line records — SUM(o.total) then re-added each conversation's value once per line (251 lines over 103 conversations)",
        "SUM ignores NULL totals, inflating the rest",
        "Rounding accumulated across the 251 rows",
      ],
      answer: 1,
      why: "Joining the line-record grain multiplies each conversation row by its line count, and SUM over the fattened rows re-adds each conversation's value per line — the ~3× inflation. Aggregate at the conversation grain BEFORE joining for detail, or fold at the line grain (quantity × unit_price) and never touch orders.total in the same query.",
      notes: [
        { choice: 2, why: "Totals are NOT NULL — NULL handling changes nothing here. The inflation factor is the fan-out, which is structural, not value-dependent." },
        { choice: 3, why: "This book's cent sums land on whole multiples; a 3× jump is a shape problem, not floating-point noise. Rounding never triples anything." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-23",
      prompt: "A template publish pipeline double-booked an approval — same template key, same approved_at, different id. Which fragment keeps exactly the latest approved version?",
      choices: [
        "SELECT DISTINCT template_key, approved_at FROM templates",
        "ROW_NUMBER() OVER (PARTITION BY template_key, approved_at ORDER BY id DESC) = 1 — keep rn = 1",
        "GROUP BY template_key HAVING COUNT(*) > 1, then delete both copies",
        "ROW_NUMBER() OVER (ORDER BY approved_at) = 1",
      ],
      answer: 1,
      why: "PARTITION BY the natural key (template + approval moment) with ORDER BY id DESC numbers each duplicate group newest-first; keeping rn = 1 removes exactly one copy and keeps the approval history intact. DISTINCT collapses copies into a projection, and the HAVING approach flags groups but a delete keyed on it removes BOTH copies.",
      notes: [
        { choice: 0, why: "DISTINCT dedupes the projection, not the table — and destroys every column you didn't project. It reports; it never repairs." },
        { choice: 2, why: "COUNT(*) > 1 finds the groups, but the delete that follows loses the template entirely — the catalog now has a hole where an approved version lived." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-24",
      prompt: "The monthly conversation ladder reads 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 6, 6, 6. What rank do the 6-conversation months carry under RANK()?",
      choices: ["9", "11", "6", "4"],
      answer: 1,
      why: "RANK shares rungs and skips: the two 9s take ranks 1–2, the four 8s take 3–6, the four 7s take 7–10 — so the first 6 lands on rank 11, and all three 6-conversation months share it. DENSE_RANK would say 4; ROW_NUMBER would split them 11, 12, 13.",
      notes: [
        { choice: 3, why: "That is DENSE_RANK — no gaps, the 6s are the 4th tier. The gap version (RANK) is what the board prints, and the skipped rungs equal the tied rows above." },
        { choice: 0, why: "9 is the LAST rank the 7-block occupies, not the next rung handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-25",
      prompt: "COUNT(*) FILTER (WHERE status = 'delivered') — what does the FILTER clause buy over SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)?",
      choices: [
        "It is faster because it skips the CASE compiler",
        "Same count, cleaner statement of intent — the predicate lives inside the aggregate, so one scan carries many labeled counts without nested CASE logic",
        "It excludes NULL statuses from the denominator",
        "It returns one row per status instead of one column",
      ],
      answer: 1,
      why: "FILTER is conditional aggregation with the condition attached to the aggregate: COUNT(*) FILTER (WHERE …) counts matching rows in the same pass, and the numbers match the CASE-SUM version exactly. What it buys is legibility — the metric's definition reads as a predicate, not as arithmetic sleight-of-hand.",
      notes: [
        { choice: 2, why: "NULL status rows fail the predicate in BOTH shapes equally — FILTER changes readability, not NULL semantics." },
        { choice: 3, why: "One row per status is GROUP BY's job. FILTER stacks COLUMNS into one row — the census shape the dashboard wants." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-26",
      prompt: "The market×status grid must show LATAM's opted-out column. LATAM has 0 opt-outs. Which construction prints the 0 instead of dropping the cell?",
      choices: [
        "GROUP BY c.region, o.status — unobserved combos just don't appear",
        "Conditional aggregation: SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) per market — every market row carries every status column, zeros included",
        "INNER JOIN from a statuses list to conversations, then COALESCE the misses",
        "HAVING SUM(CASE …) IS NOT NULL",
      ],
      answer: 1,
      why: "GROUP BY region, status enumerates only OBSERVED pairs — LATAM-cancelled never occurred, so the row vanishes and the grid lies by omission. The pivot shape fixes the columns up front, and ELSE 0 turns 'no such rows' into an honest 0.",
      notes: [
        { choice: 2, why: "INNER JOIN deletes exactly the empty combos you promised to show — COALESCE never sees a row to fix. The fix is the arm set, not the join." },
        { choice: 3, why: "SUM of zero rows returns 0, not NULL — the filter removes nothing and adds nothing. The columns had to exist first; HAVING is downstream of the whole problem." },
      ],
      difficulty: "hard",
    },
    {
      id: "whatsapp-mcq-27",
      prompt: "The dashboard walks cumulative billed value per account. Which clause makes the running total RESTART for each new account?",
      choices: [
        "ORDER BY created_at",
        "PARTITION BY customer_id",
        "GROUP BY customer_id",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      ],
      answer: 1,
      why: "PARTITION BY customer_id gives every account its own window: the running SUM accumulates within it and resets at the next account. Without it, one global walk mixes every account's billing into a single platform-wide running total.",
      notes: [
        { choice: 0, why: "ORDER BY sets the walk's direction and order INSIDE each partition — it never scopes one. Direction without scope is the half-built window." },
        { choice: 3, why: "That frame fixes ROWS-vs-RANGE tie behavior within a partition; it does not create partitions. Frame and partition are different dials." },
      ],
      difficulty: "easy",
    },
    {
      id: "whatsapp-mcq-28",
      prompt: "The dashboard prints the window-open stamp as text; queued templates have no stamp yet. Which display line is honest?",
      choices: [
        "COALESCE(shipped_at, 'awaiting window')",
        "COALESCE(shipped_at, '1970-01-01')",
        "COALESCE(julianday(shipped_at), 0)",
        "COALESCE(shipped_at, created_at)",
      ],
      answer: 0,
      why: "The stamp is missing, and 'missing' has a name: a readable sentinel that says the delivery queue owns these rows. Epoch dates and 0-day latencies invent data points; falling back to created_at claims a window the pipeline never opened.",
      notes: [
        { choice: 1, why: "1970 sorts first and, if it leaks into arithmetic, computes a ~19,000-day latency — sentinel dates poison every average they touch." },
        { choice: 3, why: "created_at is the booking, not the window-open — this claims every queued template opened instantly, which is the exact lie the latency metric exists to catch." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-29",
      prompt: "SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders) — what does it return on this book (mean 338.19)?",
      choices: [
        "0 — no conversation beats a mean that includes it",
        "42 — the conversations strictly above the mean",
        "103 — every row compares true against an average",
        "NULL — a scalar subquery cannot feed a comparison",
      ],
      answer: 1,
      why: "42 of 103 conversations clear the 338.19 mean — the right-skew read: a few enterprise threads (up to 1,088.44) drag the mean above where most conversations sit, yet 42 rows still clear it. The scalar subquery returns exactly one value, so the comparison is well-formed.",
      notes: [
        { choice: 0, why: "That is the median confusion — the mean sits ABOVE most conversations precisely because the big threads pull it; 42 rows remain above it. Right-skew, not paradox." },
        { choice: 2, why: "Strict > excludes every conversation at or below 338.19 — 61 of them. The comparison is per-row against one constant, not a blanket true." },
      ],
      difficulty: "medium",
    },
    {
      id: "whatsapp-mcq-30",
      prompt: "On the conversations table, COUNT(*) returns 103 and COUNT(shipped_at) returns 82. What is the 21-row gap?",
      choices: [
        "Opted-out threads only",
        "Conversations with no window-open stamp yet — the 14 queued templates plus the 7 opted-out threads",
        "Duplicate pipeline retries",
        "Queued templates only",
      ],
      answer: 1,
      why: "COUNT(*) counts rows; COUNT(shipped_at) counts non-NULL stamps — the 21 unstamped rows are exactly the 14 queued plus the 7 opted-out (a blocked thread never opens a window either). The gap is a population read: queue plus trust waste, in one number.",
      notes: [
        { choice: 3, why: "Queued alone is 14 — the opted-out 7 also lack stamps. Half the answer is a whole-category miss." },
        { choice: 2, why: "Retries would appear as duplicate rows WITH stamps — they inflate both counts equally and never open a gap between the two COUNTs." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-whatsapp-1",
      tier: "easy",
      topic: "j3",
      universe: "supplier",
      title: "The trusted-BSP bench audit",
      brief:
        "WhatsApp Business Platform brief on the storefront db: before the quarterly partner review, the partner team audits the BSP bench — the Business Solution Providers whose tier products actually carry billed conversation lines. Probed facts: the six-partner bench spans Nordic Gadgets AB (rating 4.6, 3 tier products, 11,130.25 billed), Midwest Hardware Co (4.4, 3, 9,294.93), Alpine Audio GmbH (4.8, 2, 4,765.63), Andes Naturals SA (4.0, 2, 3,613.25), Shenzhen Electro (4.1, 3, 3,049.07) and Pacific Textiles (3.9, 3, 2,980.15). The audit's trusted bench is rating >= 4.5 — which keeps exactly Nordic and Alpine — and the review reads biggest billed value first.",
      ask: "Return each trusted partner with its rating, distinct tier-product count and billed line value to 2 decimals, biggest billed value first.",
      template:
        "SELECT s.name AS partner,\n       s.rating,\n       COUNT({1} p.id) AS tier_products,\n       ROUND(SUM(oi.{2} * oi.unit_price), {5}) AS billed_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nWHERE s.rating >= {3}\nGROUP BY s.id\nORDER BY billed_value {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the product deduplicator",
          why: "COUNT(DISTINCT p.id) folds repeat line records back to tier products: Nordic reads 3, not its raw line count. SUM(DISTINCT …) adds product ids together and MAX(DISTINCT …) reports the largest id — neither is a catalog count.",
        },
        {
          answer: "quantity",
          kind: "keyword",
          label: "the message-units fold",
          why: "Billed value is SUM(quantity * unit_price) — message units at the per-conversation tier rate. unit_price alone sums rates without volumes; only the product prices the conversation the way the API bills it.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the trusted-bench floor",
          why: "The partner team's published bar is 4.5 — it keeps exactly Nordic (4.6) and Alpine (4.8). Lowering to 4 lets Midwest, Shenzhen and Andes into a bench their rating does not support; the floor IS the audit.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "The review reads biggest billed value on top: Nordic 11,130.25, then Alpine 4,765.63. ASC would open the partner review on the smaller bench — a correct query aimed at the wrong end of the deck.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "Money reports to cents: 11,130.25. ROUND(…, 1) prints 11,130.3 and the billing book stops reconciling with the partner ledger the finance pod quotes on the same slide.",
        },
      ],
      distractors: ["SUM", "COUNT", "ASC", "1", "region"],
      walkthrough:
        "Three tables, one fold, one threshold. The chain runs suppliers → products → order_items: each BSP partner, the tier products it lists, and the conversation line records those products carry. WHERE rating >= 4.5 keeps exactly the trusted bench — Nordic Gadgets AB and Alpine Audio GmbH — and GROUP BY s.id folds each into one row: COUNT(DISTINCT p.id) reads the tier-product census (3 and 2), and ROUND(SUM(quantity * unit_price), 2) reads billed line value — 11,130.25 and 4,765.63, matching the probed supplier table cell for cell. The full six-partner bench brackets them: Midwest 9,294.93, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15 all fall under the 4.5 bar. The distractors fail honestly: SUM in the product slot adds ids together and COUNT without DISTINCT counts line records, not products — a census of the wrong grain; 1 in the floor slot opens the bench to every partner with a rating, and region pulls a column the fold never grouped; ASC reads the review bottom-up; 1 in the precision slot rounds the money to a tenth and the cents go missing. The two-column read is the point: Alpine's 4.8 rating with 2 products bills less than half of Nordic's 4.6-with-3 — partner quality and partner volume are different axes, and the audit reports both.",
    },
    {
      id: "cs-whatsapp-2",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The tier-mix share board",
      brief:
        "Growth-board brief on the storefront db: the monetization read wants tier mix per market — what share of each market's conversation book each tier family carries — because template strategy is priced per market, not globally. Probed facts: the four markets run EU 45 conversations worth 15,089.23, APAC 37 worth 11,605.45, US 19 worth 7,286.16 and LATAM 2 worth 852.44; the platform's tier crowns read Audio 11,744.01 across 97 units, Wearables 6,929.12, Video 5,198.41, Electronics 4,818.61, Accessories 3,294.29, Apparel 1,984.93 and Fitness 863.91. Shares must be computed within each market — a family's share of ITS market's book, rounded to 1 decimal — and the board reads biggest billed value first.",
      ask: "Return each market × tier family with its billed value and that family's share of the market's book to 1 decimal, biggest billed value first.",
      template:
        "WITH market_tier AS (\n  SELECT c.region AS market,\n         p.category AS tier_family,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS billed_value\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  JOIN customers c ON c.id = o.customer_id\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY c.region, p.category\n)\nSELECT market,\n       tier_family,\n       billed_value,\n       ROUND({1}.0 * billed_value / SUM(billed_value) OVER ({2} {3}), 1) AS pct_of_market\nFROM market_tier\nORDER BY billed_value {4};",
      slots: [
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the percent multiplier",
          why: "Shares are published as percentages, so the numerator needs 100.0 — with the .0, before the division. Bare 100 (integer) keeps the fold real only by luck, and 10 or 1000 silently rescale every cell on the board.",
        },
        {
          answer: "PARTITION BY",
          kind: "keyword",
          label: "the market-scoping frame",
          why: "SUM(billed_value) OVER (PARTITION BY market) recomputes each market's book inside the window — the denominator the share divides by. ORDER BY builds a running sum instead of a market total, and every share reads against a moving target.",
        },
        {
          answer: "market",
          kind: "keyword",
          label: "the partition key",
          why: "The share must be per market — APAC's Audio book against APAC's total. Partitioning by tier_family instead computes each family's share of the whole platform, which is the global mix the board explicitly does not want.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "The board reads biggest billed value on top: APAC Audio 5,162.40 leads, LATAM Accessories 26.03 closes. ASC would open the growth read on the smallest cell in the deck.",
        },
      ],
      distractors: ["10", "ORDER BY", "tier_family", "ASC", "1000", "c.region"],
      walkthrough:
        "Two stages: fold the market×tier grid, then share it within each market. The CTE joins line records to conversations to accounts to tier products and folds 23 market×family cells — billed value rounded to cents. The outer SELECT divides each cell by SUM(billed_value) OVER (PARTITION BY market): each market's book recomputed inside the window, so shares foot to 100 per market by construction. The probed board reads: APAC Audio 5,162.40 is 44.5% of the APAC book, EU Audio 5,102.40 is 33.8% of a bigger EU book, EU Wearables 3,886.30 is 25.8%, US Video 1,885.98 is 25.9%, and the tail runs to EU Fitness 346.08 at 2.3% — while LATAM's tiny 852.44 book concentrates 55% into Electronics alone. The distractors each break differently: 10 or 1000 in the multiplier rescales every share off 100; ORDER BY in the frame turns the market total into a running sum so shares climb cell by cell; tier_family in the partition key computes family shares of the whole platform — the global mix, not the market mix; c.region is out of scope past the CTE and errors; ASC reads the deck bottom-up. The board's rule holds: tier mix is a per-market claim, so the window must carry the market partition — and the shares must foot to 100 or the deck goes back.",
    },
    {
      id: "cs-whatsapp-3",
      tier: "medium",
      topic: "s4",
      universe: "month-close",
      title: "The never-settled account list",
      brief:
        "Month-close brief, in-world: BSP billing wants the account-grain dunning read — which business accounts have NEVER settled a single statement, whatever their invoice count. Probed on the storefront db: 11 accounts carry invoices; 8 of them have at least one settlement leg on the rails, and 3 have never touched the rails at all — Hiro Tanaka (1,756 billed, the #28 paid-status lie), Chloe Dubois (1,295, one open statement) and Pedro Alvarez (873, one open statement). The read is a set difference: billed accounts EXCEPT settled accounts, and the branches must carry identical shapes or the EXCEPT compares apples to sums.",
      ask:
        "Return account name and total billed dollars for every account with invoices but zero settled statements, biggest balance first.",
      template:
        "SELECT c.name AS account,\n       SUM(i.amount_cents) / 100.0 AS billed_dollars\nFROM customers c\nJOIN invoices i ON i.customer_id = c.id\nGROUP BY c.id, c.name\n{1}\nSELECT c.name AS account,\n       SUM(i.amount_cents) / 100.0 AS billed_dollars\nFROM customers c\nJOIN invoices i ON i.customer_id = c.id\nWHERE c.id IN (\n  SELECT i2.customer_id FROM invoices i2\n  JOIN payments p ON p.invoice_id = {2}\n)\nGROUP BY c.id, c.name\nORDER BY billed_dollars {3};",
      slots: [
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the different-set operator",
          why: "EXCEPT keeps the first branch's rows minus the second's — billed-but-never-settled. UNION would merge both populations into one 11-row list, and INTERSECT returns the opposite account: the 8 that did settle.",
        },
        {
          answer: "i2.id",
          kind: "keyword",
          label: "the settlement edge",
          why: "payments.invoice_id = i2.id is the honest statement-to-settlement edge; the subquery then projects the CUSTOMER ids behind settled statements. Wiring the edge to c.id instead references an alias the subquery cannot see and the query errors on sight.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-balance-first direction",
          why: "The dunning read opens on the biggest never-settled balance: Hiro 1,756, Chloe 1,295, Pedro 873. ASC would lead with the smallest and bury the paid-status anomaly at the bottom.",
        },
      ],
      distractors: ["UNION", "INTERSECT", "c.id", "ASC"],
      walkthrough:
        "A set difference with an anomaly at the top. Branch one folds all 11 invoiced accounts to (name, billed) at cents-safe precision; branch two folds only the accounts that appear behind a settled statement — the IN subquery walks payments → invoices → customer ids. EXCEPT subtracts the second set from the first and three rows survive: Hiro Tanaka 1,756 (whose #28 invoice is marked 'paid' with zero settlement rows — the status that lies, now visible at account grain), Chloe Dubois 1,295 and Pedro Alvarez 873. The subtlety the audit enforces: both branches must project IDENTICAL shapes — same two columns, same fold — because EXCEPT compares whole tuples; a branch that sums only settled invoices would produce different dollar figures and the difference would silently keep partially-settled accounts like Emma Wilson (4 statements, 3 settled) on a dunning list they do not belong on. UNION returns all 11 accounts merged; INTERSECT returns the settled 8; the wrong edge errors. Three accounts, 3,924 dollars, one status lie — the read billing takes into the close.",
    },
    {
      id: "cs-whatsapp-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass status census",
      brief:
        "Funnel brief, in-world: the morning dashboard opens with the status census — all four conversation stages counted in one pass so no tile can drift from another. Probed on the storefront db: 103 conversations total — 52 completed billable (50.5%), 30 active 24h windows, 14 queued templates, 7 opted-out threads. The census ships with an assertion: the completed-billable count must equal 52, because that figure is the revenue denominator three other tiles divide by — if the census disagrees with itself, the dashboard does not ship. FILTER clauses keep every count on one scan of the same 103-row book.",
      ask:
        "Return one row: total conversations, the four stage counts, with an assertion that completed billable equals 52.",
      template:
        "SELECT COUNT(*) AS conversations,\n       COUNT(*) FILTER (WHERE status = {1}) AS completed_billable,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS active_windows,\n       COUNT(*) FILTER (WHERE status = 'pending') AS queued_templates,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS opted_out\nFROM orders\n{2} COUNT(*) FILTER (WHERE status = 'delivered') = {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the billable-stage literal",
          why: "Completed billable is status 'delivered' — 52 conversations. 'shipped' recounts the 30 active windows as billable and the revenue lens reads 30 against invoices that do not exist yet.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the census assertion clause",
          why: "The pin judges an aggregate — COUNT(*) FILTER (…) — so it lives in HAVING, which SQLite honors even without GROUP BY (the whole table is one group). WHERE cannot judge an aggregate; the query would not compile.",
        },
        {
          answer: "52",
          kind: "number",
          label: "the headline pin",
          why: "The assertion pins completed billable at 52 — the figure in the result cell AND the denominator the completion-rate tile quotes. Pin it to 30 and the census returns nothing while looking valid: the assertion did its job by refusing to ship a wrong census.",
        },
      ],
      distractors: ["'shipped'", "WHERE", "30", "ASC"],
      walkthrough:
        "One scan, five numbers, one contract. The FILTER clauses count each stage in the same pass — conversations 103, completed billable 52, active windows 30, queued templates 14, opted-out 7 — and the arms are exhaustive, so the four stage counts reconcile to 103 by construction: 52 + 30 + 14 + 7 = 103. The HAVING pin is the census's self-check: with no GROUP BY, SQLite treats the table as one group, and HAVING COUNT(*) FILTER (WHERE status = 'delivered') = 52 passes only when the book says what the dashboard promises. 'shipped' in the billable literal rebrands the 30 active windows as revenue; WHERE in the assertion slot errors because aggregates do not exist at row-filter time; 30 pins the census to a claim it cannot satisfy and the query returns zero rows — a loud failure, which is exactly what an assertion is for. One pass, one denominator, one contract between the census and every tile that divides by it.",
    },
    {
      id: "cs-whatsapp-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The jump on the conversation spine",
      brief:
        "Growth-board brief, in-world: the 14-month conversation spine runs 2024-01 to 2025-02, and the deck's narrative hangs on ONE row — the biggest month-over-month jump in billed value. Probed on the storefront db: the spine opens at 3,731.97 in January 2024 and troughs at 1,193.86 in July; August lands at 2,352.07, so the July→August jump reads +1,158.21 — the largest delta on the spine, and the row the growth call quotes when it claims the template relaunch worked. LAG carries the prior month; the first row's delta is NULL by definition and MAX simply walks past it.",
      ask:
        "Return the month with the largest month-over-month jump in billed value: month, billed, prior month's billed, and the delta to 2 decimals.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         COUNT(*) AS conversations,\n         ROUND(SUM(total), 2) AS billed\n  FROM orders\n  GROUP BY month\n),\nwalk AS (\n  SELECT month, conversations, billed,\n         {1}(billed) OVER (ORDER BY month) AS prev_billed\n  FROM monthly\n),\ndeltas AS (\n  SELECT month, billed, prev_billed,\n         ROUND(billed - prev_billed, {3}) AS delta\n  FROM walk\n)\nSELECT month, billed, prev_billed, delta\nFROM deltas\nWHERE delta = (SELECT {2}(delta) FROM deltas);",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(billed) walks the window backwards one row — August's prev_billed is July's 1,193.86. LEAD reads forward and hands August September's count, re-labeling the future as history; every delta on the spine would silently re-point.",
        },
        {
          answer: "MAX",
          kind: "keyword",
          label: "the biggest-jump picker",
          why: "The scalar subquery folds the spine to its largest delta — +1,158.21, the July→August jump. MIN would return the biggest DECLINE instead (−862.88 into June) and the deck would narrate a collapse as its headline.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the delta precision",
          why: "Deltas print to cents like the book they subtract: ROUND(…, 2) keeps +1,158.21 exact. One decimal prints 1,158.2 and the delta stops footsing against the two billed cells it came from.",
        },
      ],
      distractors: ["LEAD", "MIN", "1", "0"],
      walkthrough:
        "Three staged grains, one headline row. The monthly CTE folds 103 conversations into 14 monthly buckets (STRFTIME month key, COUNT, cents-precise billed); the walk CTE layers LAG(billed) OVER (ORDER BY month) so each month carries its predecessor; the deltas CTE subtracts and rounds — window output is not visible to sibling expressions, which is why the arithmetic waits for its own staging step. The outer SELECT keeps the row whose delta equals the spine's maximum: (SELECT MAX(delta) FROM deltas) returns one scalar, +1,158.21, and exactly one row matches — 2024-08, billed 2,352.07, prev 1,193.86. The first month's delta is NULL by design (no prior row, no baseline), and MAX ignores NULLs, so the baseline row competes for nothing. LEAD would read the future and the 'jump' would land on a different month; MIN would crown the −862.88 June fade; anything non-aggregate in the scalar slot errors on sight. One row, one claim, one honest NULL at the edge — the growth call rests on a query that can name its own baseline.",
    },
    {
      id: "cs-whatsapp-6",
      tier: "medium",
      topic: "l8",
      universe: "month-close",
      title: "The settlement rails census",
      brief:
        "Month-close brief, in-world: the cash-forecast memo opens with the rails census — settlement count and settled dollars per payment rail, because card and wire behave differently on both speed and size. Probed on the storefront db: 27 settlement rows in two rails — card carries 16 settlements worth 37,364.00, wire carries 11 worth 32,248.00. Card wins on count, wire wins on size (average wire settlement 2,931.64 versus card's 2,335.25) — the mix behind every reminder-priority argument. The census folds at the rail grain from the INTEGER-cent ledger, and the dollar read is amount_cents / 100.0.",
      ask:
        "Return each settlement rail with its settlement count and settled dollars, biggest settled value first.",
      template:
        "SELECT {1},\n       COUNT(*) AS settlements,\n       SUM(amount_cents) / 100.0 AS settled_dollars,\n       ROUND(AVG(amount_cents) / 100.0, {2}) AS avg_settlement\nFROM payments\nGROUP BY method\nORDER BY settled_dollars {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "The fold key is the method column — the rail each settlement rode. Any other token in the SELECT's first position either errors or replaces the rail name with a constant, and the memo loses the row labels it groups by.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Averages print to cents like the ledger they summarize: ROUND(…, 2) keeps card's 2,335.25 and wire's 2,931.64. One decimal rounds the cents away and the memo stops reconciling with the billing book on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The memo reads card 37,364.00 above wire 32,248.00 — biggest settled value first. ASC would lead with wire and invert the 'which rail moves the money' story the count column is about to complicate.",
        },
      ],
      distractors: ["rail", "ASC", "1", "0"],
      walkthrough:
        "One fold, two rails, one discipline. GROUP BY method folds 27 settlement rows into two buckets; COUNT(*) reads the settlement counts (card 16, wire 11), SUM(amount_cents) / 100.0 reads settled dollars (37,364.00 and 32,248.00) with the .0 keeping the division real — the house cents rule — and the rounded per-settlement averages expose the crossover the memo exists to argue: card averages 2,335.25 across its 16 settlements while wire averages 2,931.64 across its 11, so 11 wires move nearly as much money as 16 cards. ORDER BY settled_dollars DESC puts card on top. 'rail' is not a column this table owns (the column is method); one decimal in the average rounds the cents away and the memo stops footing; ASC flips the memo's lead. Two rows, one grain, one divisor — the census that every cash-forecast argument in the close quotes first.",
    },
  ],

  problems: [
    { slug: "number-of-comments-per-post", why: "Group threads are WhatsApp's engagement engine — replies per thread is the exact census this problem drills, and the two-key join (thread, reply) mirrors conversations to line records." },
    { slug: "reported-posts", why: "Abuse reports feed the opt-out/block pipeline that gates send volume. Counting reports per day over a date filter is the trust-and-safety read this kit's cancelled-status story hangs on." },
    { slug: "reported-posts-ii", why: "Report share per post is a ratio with a stated denominator — the same discipline as the opt-out share (7 of 103, 6.8%), where 'per thread' versus 'per account' changes the answer." },
    { slug: "invalid-tweets", why: "Template text has length caps before the API accepts a send. This problem is the string-hygiene pass the template QA script runs — LENGTH checks catching oversized bodies before they fail in production." },
    { slug: "find-users-with-valid-e-mails", why: "Business accounts onboard through contact validation — phone and email patterns checked with GLOB/LIKE before a single template ships. Pattern-match filtering is the gatekeeping shape." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Session telemetry is the messenger's heartbeat: distinct accounts active in a 30-day window, the same trailing-window read the 82-of-103 window-open stamp formalizes." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "The per-day census behind the dashboard — active accounts AND session counts per day, two grains in one fold, the exact shape of the morning status census." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU is how messaging growth reads habit — daily actives over weekly actives with COUNT DISTINCT at two windows. The stickiness ratio the retention pod quotes every Monday." },
    { slug: "active-users", why: "Rolling activity windows flag which accounts opened sessions on consecutive days — streak logic over session stamps, the window-open telemetry at account grain." },
    { slug: "the-latest-login-in-2020", why: "Last session-open per account is the dormancy read: MAX over a timestamp with a date gate, the same shape as finding each account's most recent window-open stamp." },
    { slug: "keep-latest-dedupe", why: "Template catalogs version constantly — ROW_NUMBER dedupe keeping the latest approved version per template id is literally the template-publish job." },
    { slug: "trial-to-paid-funnel", why: "Click-to-WhatsApp ads open trial threads that convert to API contracts — the trial-to-paid fold with honest denominators is the monetization funnel in miniature." },
    { slug: "ads-funnel", why: "The CTWA funnel runs ad impression → click → conversation start → completed billable. Multi-stage conversion counting with stated populations is exactly this problem's shape." },
    { slug: "roas-by-campaign", why: "Click-to-WhatsApp campaigns are judged on revenue per unit of spend — ROAS folds conversation value back onto campaign ids, a join-aggregate with a business rule attached." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Tier-mix screening: accounts that run Utility AND Marketing templates but never Authentication — conditional aggregation over three flags, the tier-adoption screen." },
    { slug: "week-over-week-churn", why: "Opt-outs arrive in bursts after a bad send. Week-over-week churn with LAG over a weekly pivot is the trust-and-safety trend the send-volume policy reacts to." },
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion with stated populations — thread opened, window opened, completed billable. The CTWA funnel discipline every WhatsApp monetization screen opens with." },
    { slug: "email-engagement-funnel", why: "Template → read → reply is the messaging funnel in miniature — multi-stage engagement counting where each step's denominator is the previous step's survivors." },
    { slug: "find-zombie-sessions", why: "24h windows that never closed — stale sessions are the queued-template leak in session form. The freshness anti-join that keeps the window telemetry honest." },
    { slug: "median-time-to-convert", why: "Median time from first thread to contract — conversion latency at the right center (not the mean the whale accounts drag). Percentile thinking over the account spine." },
    { slug: "rolling-7d-actives", why: "The rolling-weekly actives curve — the engagement pulse growth pins above every other chart. A date spine plus a window, built from scratch on demand in screens." },
    { slug: "new-users-daily-count", why: "First-conversation dates by day — the activation curve for new business accounts. Date-bucketed counting is the warm-up half of every cohort screen here." },
    { slug: "sessionize-events", why: "Bursting a message stream into sessions is literally what the 24h window is — gap-threshold sessionization over event stamps, the platform's own unit rebuilt in SQL." },
    { slug: "find-bursty-behavior", why: "Bursty senders — accounts whose traffic spikes off their baseline — are both a capacity signal and an abuse screen. Variance-aware flags over the send log." },
    { slug: "second-most-recent-activity", why: "Each account's second-newest thread via a ranked window — the 'prior conversation' read behind cadence and re-engagement analysis, plus the LIMIT-OFFSET tie trap." },
    { slug: "growth-accounting", why: "New, retained, resurrected and churned accounts per month — LAG over the month spine, the quick-and-dirty view behind the quarterly messaging growth board." },
    { slug: "dormant-reactivation", why: "Accounts that went quiet and came back — the resurrection cohort. First-event CTEs plus a gap check, the template-relaunch proof point." },
    { slug: "winback-recovery", why: "Churned-account winback needs the churned list first — an anti-join with a freshness window, then the recovery count. The lifecycle pod's weekly mail runs on this shape." },
    { slug: "ar-aging-schedule", why: "AR aging buckets from issued_on against the close date — cents-safe CASE banding that turns the dunning list into a calendar the BSP billing pod can act on." },
    { slug: "generate-the-invoice", why: "Invoice assembly from line detail — folding conversation lines into a statement at the right grain, the exact monthly BSP billing job." },
    { slug: "duplicate-charge-pairs", why: "Duplicate settlement legs — pipeline retries double-billing a statement — detected by pairing on natural keys. The reconciliation anomaly walk in miniature." },
    { slug: "popularity-percentage", why: "The share of accounts connected to the average account — a ratio with a stated denominator and the 100.0 discipline. Two-grain census math in percentage clothing." },
  ],
};
