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
    "Preparation strategy: the pools file carries no WhatsApp section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: status censuses, two-grain market reads, tie-heavy leaderboards, tier CASE bands, partition-share windows and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:trusted-BSP bench} audit the partner team runs before each quarterly review, the other rebuilds the {sky:tier-mix share board} the growth read presents per market. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every market's tier shares foot to 100.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "active-businesses"],
    },
    {
      name: "Two-grain market censuses",
      why: "Conversations and business accounts are different grains of the same join, and every census here reports both: EU runs 45 conversations from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is volume and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count"],
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
      slugs: ["second-day-confirmation", "biggest-window-between-events", "movie-rating"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-account conversation counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "Set ops & opt-out anti-joins",
      why: "Board packets stack populations — active-window threads under opted-out threads, this quarter beside last — and EXCEPT answers 'which billed accounts never settled'. The opt-out read is the anti-join: threads blocked before the window opened never bill, and on the finance side the unpaid-invoice anti-join returns a real 6 rows worth 15,217, not a zero.",
      slugs: ["customers-who-never-order", "monthly-transactions-ii", "find-churn-risk-customers"],
    },
    {
      name: "Billing rails & cents discipline",
      why: "Opened is not billed, billed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the messaging world meets money. Every dollar read is amount_cents / 100.0, the rails split card versus wire, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "number-of-rich-customers"],
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
  ],
};
