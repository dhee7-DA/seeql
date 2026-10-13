// Visa — kit 3 of the Fintech & Payments domain (Batch D).
// The authorization network: billions of approval/decline decisions a day,
// settlement windows, decline-code ladders and chargeback economics.
// Pool provenance: 2 tagged sql rows in scripts/company-pools.md
// (bank-account-summary-ii, number-of-rich-customers) + theme-curated fills
// from the theme menu — every problem mirrors a workflow Visa's risk,
// settlement and network-performance teams are known to probe.
// Case studies run on the storefront db, mapped honestly as
// orders = authorization attempts (status = outcome: delivered+shipped =
// approved & cleared, cancelled = declined, pending = issuer timeout),
// payments = settled money movement (INTEGER CENTS — divide by 100.0),
// invoices = the billing book, ledger_entries = the double-entry core —
// with probed figures from scripts/company-facts.md only.

import type { CompanyKit } from "../types";

export const visaKit: CompanyKit = {
  id: "visa",
  domainId: "fintech",
  name: "Visa",
  tagline: "Authorization networks, billions per day",
  accent: "text-yellow-300",

  brief: [
    "Visa is the authorization network the world's cards run on — it issues nothing, extends no credit, and holds no deposits; it sits between **15,000+ issuers and acquirers** and moves payment value across **200+ markets** in milliseconds. The product is trust at network scale: an authorization request hits **VisaNet**, a decision (approve, decline, or a {rose:decline code} that says exactly why) comes back before the shopper's hand leaves the terminal, and the money itself moves later in {emerald:batch settlement} windows. Every analyst here internalizes one asymmetry early: an approval is a promise, a settlement is the money, and the gap between the two is where the interesting SQL lives — approval rates by market, decline-code ladders by issuer, time-to-capture, and the reconciliation delta between authorized and settled value.",
    "The data org is network-scale and correctness-obsessed. Risk teams score authorization streams for fraud in near-real time; settlement operations reconcile billions of daily transactions against acquirer files; network-performance analysts live on approval-rate dashboards sliced by market, issuer, product and ticket size. The house discipline shows up in the schema: money lands as **INTEGER cents** in the settled-amount columns (a 37364-cent card settlement prints as 373.64 dollars only after the `/100.0` — skip the .0 and every odd-cent row truncates), and every reconciliation run ends at a {emerald:zero-delta} proof (**181,080** cents of debits against 181,080 cents of credits) before anyone calls the books balanced.",
    "Interview style is denominator-first and decline-aware. A typical screen walks from a warm-up join to a conditional-aggregation rate (approval share, decline share, settlement completeness), then escalates into either a {violet:ranking window} (worst {rose:decline-code} ladders, top issuer exposure) or a latency question over auth-to-capture windows where the `NULL` capture timestamp of not-yet-settled transactions is the real test. Follow-ups probe definitions out loud: *'is that rate per authorization or per unique transaction?'*, 'which population does your denominator filter carry?'. Candidates who state the mapping between business event and table row before writing SQL consistently outperform.",
    "Preparation strategy: the registry tags two problems for Visa (`bank-account-summary-ii`, `number-of-rich-customers`) — start there; the rest of the pool is theme-curated from the SQL band toward Visa's known screens: approval-rate folds, honest-denominator ratios, settlement-window date math, decline ladders and unmatched-settlement anti-joins. Then run both case studies on the live storefront db: one rebuilds the **market approval-rate map** its network-performance review opens with, the other rebuilds the **auth-to-capture latency census** its settlement ops team clocks every close.",
  ],

  dayInLife: [
    "**08:00 —** The day opens on the authorization health dashboard — for a network that never sleeps, 'morning' is a rolling window. First queries are reconciliation-shaped: did overnight settlement files land complete, does {emerald:captured} value match settled value by market, are approval rates inside the expected band per issuer? The analyst who can write the diff query — which side is short, by how many transactions and how many cents — is the one the settlement ops channel pings first. Money math runs in integer cents end to end; the dollar read happens once, at the display layer, with an explicit `/100.0`.",
    "**11:00 —** Midday is decline forensics. A market's approval rate dips **two points** and the issuer partnerships team wants the ladder: {rose:decline codes} ranked by frequency and value, split by whether the fix is issuer-side (a limit, a stale credential), merchant-side (a retry storm), or network-side. Each ask is a conditional aggregate with an honest denominator — declines divided by attempts in the same fold, never against a filtered population — plus a {violet:ranking window} with a deterministic tie-break, because two decline codes sharing a count is the norm at this scale, not the edge case.",
    "**15:00 —** The afternoon runs stakeholder cycles: risk reviews where a {rose:chargeback rate} read must state its denominator (disputes per settled transaction, not per authorization), settlement-window checks where auth-to-capture latency is averaged only over {emerald:captured} transactions (the `NULL` capture stamps of pending authorizations are a population decision, not a bug). Each number leaves the room with its population printed under it — that is the house style.",
    "**17:30 —** EOD is the close check and the writeup: the ledger's **debits-equal-credits** proof is the last gate of the monthly close, and the day's reads get filed with their denominators attached. The best-prepared candidate knows the rhythm: Visa SQL exists to defend money numbers under audit, where a rate with a drifted denominator is not a typo — *it is an incident*.",
  ],

  metrics: [
    { name: "Approval rate", what: "Approved authorizations ÷ all authorization attempts, per market/issuer/ticket band. The network's headline health metric — and a conditional-count ratio whose denominator question is the whole interview." },
    { name: "Decline rate", what: "Declined ÷ attempted, split by decline-code family. The twin of approval — read as a ladder (which code, which issuer, which fix), never as one blended number." },
    { name: "Auth-to-capture window", what: "Days from authorization to capture/settlement, averaged over captured transactions only. The latency read this kit's second case rebuilds: 82 captures averaging 2.98 days, fastest 2, slowest 4." },
    { name: "Settlement completeness", what: "Captured value vs settled value per window — the reconciliation delta that must be zero before a close ships. A join-and-compare exercise at two grains." },
    { name: "Chargeback rate", what: "Disputes ÷ settled transactions (never ÷ authorizations — only settled money can be disputed). The metric where naming the denominator is the entire answer." },
    { name: "Stand-in authorization rate", what: "Share of approvals issued by Visa's stand-in logic when an issuer is unreachable. Availability KPI with a risk tail — a conditional count over a flag column." },
    { name: "Rail mix", what: "Transaction and value share by rail — card-present vs account-transfer. On this db's settled-money table: card 16 payments / 37364 cents vs wire 11 / 32248 cents." },
    { name: "Average ticket", what: "Settled value ÷ settled transactions, per market and product. The segmentation lens behind every risk rule — and a trap for anyone who divides before aggregating." },
  ],

  topics: [
    {
      name: "The approval-rate fold",
      why: "Everything Visa reports starts as a conditional aggregate over an authorization stream: approved share, decline share, stand-in share — each a SUM over a 1/0 flag with the denominator folded from the same rows. Get the fold wrong and the rate reports 100% everywhere; get the denominator wrong and the number survives to a regulator.",
      slugs: ["number-of-rich-customers", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Auth-to-settlement joins",
      why: "Authorizations and settlements live in different tables and must be reconciled row by row: every settlement traces to an auth, and the auths with no settlement yet ARE the open exposure. Visa screens drill join type as a survival decision — INNER for the matched money story, LEFT from the auth side to keep the not-yet-captured tail visible.",
      slugs: ["bank-account-summary-ii", "combine-two-tables", "product-sales-analysis-i"],
    },
    {
      name: "Rates with honest denominators",
      why: "Approval rates, dispute rates, recovery rates — Visa's ratios punish integer division and denominator drift. The house habit: 100.0 before the division, the denominator's population fixed in the same fold as the numerator, rounding only at the end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Settlement windows & date math",
      why: "T+1 settlement makes date arithmetic a daily tool: captures inside a window, the latest file from each acquirer, activity in the 30 days post-launch. Visa probes half-open intervals and julianday latency math — BETWEEN on the boundary date loses the last night's batch.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Volume aggregation at network scale",
      why: "Billions of authorizations a day means every read is a fold: attempts and value per day, per market, per ticket band. The screens check whether you can aggregate without letting declined attempts pollute settled-value totals — two populations, one GROUP BY, stated out loud.",
      slugs: ["group-sold-products-by-the-date", "monthly-transactions-i", "classes-more-than-5-students"],
    },
    {
      name: "Decline ladders & ranking windows",
      why: "Issuer-partnership reviews rank decline codes by frequency and value, per market, top-N with ties admitted. That is RANK/DENSE_RANK/ROW_NUMBER territory — and the LIMIT-1-OFFSET-1 habit breaks exactly where ties are common.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries"],
    },
    {
      name: "Unmatched-settlement anti-joins",
      why: "Reconciliation is anti-join work: authorizations with no settlement row, accounts with no activity, expected files that never landed. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'find the exposure' question.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "NULL policy on pending authorizations",
      why: "A not-yet-captured authorization has a NULL settlement timestamp — is that missing data, a pending population, or a failure? Visa screens check whether you treat the NULL deliberately: report it as its own bucket, coalesce for display, or exclude with a stated population.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Stitched settlement packets (set ops)",
      why: "Month-close stitches two populations into one deliverable: the settled book and the outstanding book, card rail vs transfer rail. UNION ALL's no-dedupe cheapness and column-position discipline are the tested reflexes — a packet that silently dedupes masks the very double-count reconciliation exists to catch.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "team-scores-in-football-tournament"],
    },
    {
      name: "The two-grain census",
      why: "'Transactions AND distinct credentials per market' is the opening read of every network review — and the trap is counting both at the same grain. COUNT(*) counts attempts; COUNT(DISTINCT credential) counts instruments; the gap is the intensity signal.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
  ],

  theory: [
    {
      id: "visa-t1",
      q: "You're reconciling authorizations against settlements. When is INNER JOIN honest and when does LEFT JOIN carry the actual answer?",
      a: "Decide from the survival rule the business question implies. The matched-money story — settled value by market — is INNER: a settlement with no authorization is corruption, worth a data-quality flag, not a silent fold. The exposure story — authorizations with no capture yet — must be LEFT from the authorization side: the unmatched rows ARE the answer, arriving with NULL settlement columns. The Visa-specific trap is filtering the settlement side in WHERE (captured_at < cutoff), which silently converts the LEFT JOIN to an INNER and deletes exactly the open exposure you were asked to measure; the predicate belongs in the ON clause, or the exclusion must be stated as a definition. 'LEFT JOIN is safer' is the wrong answer — join type is a decision about who survives, and at a network the rows that fail to match are frequently the product.",
      tag: "joins",
    },
    {
      id: "visa-t2",
      q: "Compute the approval rate per market. Where do people go wrong, and what does a correct fold look like?",
      a: "Two failure classes, both common. Integer division: 100 * SUM(approved_flag) / COUNT(*) truncates toward zero before the multiplication — every market under 1% decline prints as a flat 0; write 100.0 first so the arithmetic is real. Denominator drift: filtering declined attempts out in WHERE shrinks COUNT(*) to the approved population and every market reads 100% — the numerator's filter decided the denominator's population. The correct fold computes both sides inside one GROUP BY: SUM over the 1/0 approved flag (approved = authorized AND cleared), COUNT(*) over every attempt in the group, and the elegant twin is 100.0 * AVG(flag) — the mean of an indicator IS the share. Saying 'numerator and denominator fold from the same rows' out loud is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "visa-t3",
      q: "The decline-code ladder for a market must show the top codes by attempt count, and two codes tie at the cut. What breaks and what is the complete fix?",
      a: "ORDER BY count DESC LIMIT N breaks on the tie: two codes share the boundary count, the engine keeps both or drops one arbitrarily, and the ladder reads eleven rows one day and ten the next — at network scale that is a dashboard incident. The complete fix is a window with a deterministic tie-break: ROW_NUMBER() OVER (ORDER BY attempts DESC, code ASC) = 1…N keeps exactly N with an explicit, reproducible pick among ties; RANK() or DENSE_RANK() keeps every code tied at the boundary, returning eleven rows on purpose when the business should see both. The wrong answer is tightening LIMIT to 9. Visa asks this because decline-code ladders tie constantly — 'exactly N' versus 'everyone at rank N' is a risk-reporting decision someone must own, and the strong candidate names the choice instead of letting the engine make it.",
      tag: "windows",
    },
    {
      id: "visa-t4",
      q: "An authorization has a NULL settlement timestamp. What are the three possible meanings, and what is your policy in a settlement-latency report?",
      a: "Three meanings, one policy. It can be 'not yet' — a pending authorization whose capture has not happened; it can be 'never' — a declined attempt that will never capture; it can be 'lost' — a pipeline gap where the capture event never arrived, which is a data-quality incident wearing a NULL costume. The three demand different treatment, and SQL cannot distinguish them from the column alone. The policy: define the population first. Latency of captured transactions requires WHERE captured_at IS NOT NULL — correct, but then say it: 'this averages auth-to-capture over the 82 captured transactions; the pending and declined populations are out of scope.' AVG ignores NULLs silently, so the same query without the filter quietly changes meaning. On this db the honest read is exactly that discipline: 2.98 days average over 82 captures, fastest 2, slowest 4 — a number that means something only because its population was stated.",
      tag: "nulls",
    },
    {
      id: "visa-t5",
      q: "An analyst sums settled value across all statuses and subtracts declines in HAVING. Walk me through why the number is wrong.",
      a: "The status rule is a ROW-level fact, so it belongs in WHERE (or inside the conditional SUM) — before aggregation. Once folded, the populations no longer exist per row: HAVING can only judge group-level aggregates like SUM or COUNT, and the declined value is already inside every group total it cannot un-mix. The pipeline order is the answer: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — filters on row facts execute before folds, gates on group results execute after. The Visa-flavored framing: settled value and attempted value are two different populations; the honest query either filters to captured rows in WHERE for the settled read, or uses SUM(CASE WHEN captured THEN value ELSE 0 END) alongside COUNT(*) for the attempted read — one scan, two populations, no post-hoc subtraction that pretends the fold is reversible.",
      tag: "filtering",
    },
    {
      id: "visa-t6",
      q: "Which markets process an above-average ticket? Compare the scalar-subquery shape against a window, including what happens when the inner query is empty.",
      a: "The scalar shape: WHERE total_value > (SELECT AVG(total_value) FROM transactions) — the inner fold is 0-or-1 rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL, every comparison against NULL is UNKNOWN, and the report silently returns nothing — no error, no rows, no complaint. On an unfiltered table that is theoretical (the network always has an average), but on a filtered staging slice — one issuer, one weekend — the empty-inner bug ships regularly. The window alternative, total_value > AVG(total_value) OVER (), folds the average alongside each row in one pass: no second scan, no empty-inner failure mode, and the comparison is visible per row. The correlated cousin re-runs per outer row and answers a different question (above MY issuer's average). Saying which population the inner fold covers, and what happens when it is empty, is exactly what the follow-up fishes for.",
      tag: "subqueries",
    },
    {
      id: "visa-t7",
      q: "Settlement files carry TEXT timestamps. How do you bucket them by month, measure auth-to-capture latency, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', settled_at) — or SUBSTR(settled_at, 1, 7) on fixed-width ISO text — gives the month spine every close calendar hangs on; the SUBSTR shortcut dies the day the format changes width. Latency: JULIANDAY(captured_at) - JULIANDAY(auth_at) returns fractional days — this db's 2.98-day average is that, rounded once at the END, never per row. Windows: half-open intervals — settled_at >= '2025-01-01' AND < '2025-02-01' — never BETWEEN on the last day, which drops the final night's batch, the biggest one. The deeper breaks: the NULL capture timestamp of pending authorizations means every latency fold needs its population stated first, and timestamp strings carry an implicit timezone convention nothing in the column admits. State the convention and the population, then query — never the reverse.",
      tag: "dates",
    },
    {
      id: "visa-t8",
      q: "Money is stored as INTEGER cents and the books carry voided records with live payments. What does your data-quality pass check before any rate is computed?",
      a: "Three gates, in order. Units: settled and billed columns are integer cents, so the dollar read is amount_cents / 100.0 — an integer division (or a forgotten .0) truncates every odd-cent row, and at network scale odd cents are half the rows. Reconciliation: the double-entry proof is debits = credits (here 181080 against 181080, delta 0) — run it first, because every later ratio inherits its trust. Population anomalies: the books contain a voided record that still carries a live payment and a paid record with no payment rows at all — a rate computed over status alone silently includes both, so the pass checks status against the money-movement table instead of trusting the label. The strong candidate treats data quality as a query, not a hope: one scan, three checks, zero delta — then the rates.",
      tag: "data-quality",
    },
  ],

  mcqs: [
    {
      id: "visa-mcq-1",
      prompt: "orders holds 103 authorization attempts; a cleared attempt is status IN ('delivered','shipped'). Which expression computes the approval rate per market correctly?",
      choices: [
        "100 * SUM(status IN ('delivered','shipped')) / COUNT(*)",
        "100.0 * SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(status) / COUNT(*)",
        "AVG(status) * 100",
      ],
      answer: 1,
      why: "The conditional sum folds the approved flag at the same grain COUNT(*) counts attempts, and 100.0 forces real division. Both guards — same-fold denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "SQLite accepts the boolean as 0/1, but INTEGER 100 forces integer division first: any share under 1% truncates to 0 before it ever multiplies." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — essentially every attempt, not the cleared ones. This reports ~100% for any input." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-2",
      prompt: "27 payments settle 28 invoices; five invoices carry two payments each. On invoices LEFT JOIN payments, which count returns the number of INVOICES?",
      choices: [
        "COUNT(*)",
        "COUNT(p.id)",
        "COUNT(DISTINCT i.id)",
        "SUM(i.id)",
      ],
      answer: 2,
      why: "The join fans each split-settled invoice into two rows, so COUNT(*) counts join rows (26 paid rows, not 21 invoices). COUNT(DISTINCT i.id) folds the fan-out back to the invoice grain.",
      notes: [
        { choice: 0, why: "COUNT(*) is the fan-out count — the classic reconciliation overstatement: 26 instead of 21 for the paid book, 33 instead of 28 overall." },
        { choice: 1, why: "COUNT(p.id) counts settlement rows — 25 for the paid book. It counts the money side, not the billing side." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-3",
      prompt: "`SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.method = 'card'` — what silently happened to the unpaid invoices?",
      choices: [
        "Nothing — LEFT JOIN keeps every invoice",
        "The WHERE turned it into an INNER JOIN and deleted every invoice with no payment",
        "Unpaid invoices now show NULL method rows",
        "The query errors — p.method is NULL for unpaid invoices",
      ],
      answer: 1,
      why: "Filtering the right table's column in WHERE kills the NULL-payload rows (NULL = 'card' is UNKNOWN → discarded), collapsing the LEFT JOIN to an INNER. The not-yet-settled exposure vanishes — and the query still looks right.",
      notes: [
        { choice: 0, why: "Unmatched invoices carry p.method = NULL, which fails any equality test. LEFT-ness survives only in the ON clause, never in WHERE." },
        { choice: 2, why: "They would — if the filter weren't discarding them first. The predicate placement deletes the rows you're describing." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-4",
      prompt: "payments.amount_cents is INTEGER; the card rail settled 37364 cents over 16 payments. Which SELECT prints the correct dollar total?",
      choices: [
        "SELECT SUM(amount_cents) / 100 FROM payments WHERE method = 'card'",
        "SELECT SUM(amount_cents) / 100.0 FROM payments WHERE method = 'card'",
        "SELECT SUM(amount_cents / 100) FROM payments WHERE method = 'card'",
        "SELECT CAST(SUM(amount_cents) AS TEXT) FROM payments WHERE method = 'card'",
      ],
      answer: 1,
      why: "Sum in cents, divide once by 100.0 — 373.64 with the odd cents intact. Dividing the INTEGER sum by INTEGER 100 truncates to 373; dividing per row truncates every odd-cent row before the fold.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER is integer division: 37364 / 100 = 373. A 64-cent leak on a single fold — repeated across every settlement report in the building." },
        { choice: 2, why: "Per-row integer division rounds each payment to a whole dollar before summing — the error compounds row by row and never shows a warning." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-5",
      prompt: "Two decline codes tie at 14 attempts, the next has 11. `RANK() OVER (ORDER BY attempts DESC)` assigns the 11-attempt code rank…",
      choices: ["2", "3", "4", "14"],
      answer: 1,
      why: "RANK shares rank 1 between the tied leaders and jumps to 3 — gaps kept, next distinct value gets the Olympic rank. DENSE_RANK would say 2; ROW_NUMBER would say 3 with an arbitrary tie order.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK's compact sequence: 1, 1, 2. RANK keeps the gap — the whole point of the trio's difference." },
        { choice: 3, why: "Rank numbers come from position order, not from the metric's value. The 11-attempt code sits third, hence rank 3." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-6",
      prompt: "Settlement timestamps are TEXT like '2025-01-31 23:59:59'. Which WHERE captures every settlement in January 2025, including the last night's batch?",
      choices: [
        "WHERE settled_at BETWEEN '2025-01-01' AND '2025-01-31'",
        "WHERE settled_at >= '2025-01-01' AND settled_at < '2025-02-01'",
        "WHERE SUBSTR(settled_at, 6, 2) = '01'",
        "WHERE settled_at LIKE '2025-01%'",
      ],
      answer: 1,
      why: "The half-open interval [Jan 1, Feb 1) admits every timestamp in the month — '2025-01-31 23:59:59' < '2025-02-01' is TRUE. Settlement calendars live and die on this shape: BETWEEN drops the final night's batch.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends — anything after midnight on the 31st exceeds the '2025-01-31' bound and vanishes. The biggest batch of the month is exactly that batch." },
        { choice: 3, why: "LIKE works only while the format never varies, defeats indexes, and silently mis-handles padding drift. Range comparison is correct and sargable." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-7",
      prompt: "103 attempts; 82 have a capture timestamp, 21 carry NULL (pending or declined). What does AVG(julianday(captured_at) - julianday(auth_at)) over ALL 103 rows return?",
      choices: [
        "The average latency of all 103 attempts",
        "The average latency of the 82 captured rows — NULLs are ignored silently",
        "NULL",
        "0 — NULLs count as zero days",
      ],
      answer: 1,
      why: "AVG skips NULLs silently, so the 'all attempts' query is really the captured-population average without the statement. The honest version states the population in WHERE (captured_at IS NOT NULL) or in the report title.",
      notes: [
        { choice: 2, why: "NULL return is SUM's behavior on an all-NULL input. With 82 non-NULL diffs, AVG computes over those 82." },
        { choice: 3, why: "NULLs are not zeros in aggregates — COUNT(col) and AVG skip them; only COALESCE would fold them to zero, changing the metric entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-8",
      prompt: "`SELECT market FROM tx WHERE value > (SELECT AVG(value) FROM tx WHERE issuer = 'RBA')` — RBA's slice is empty. What happens?",
      choices: [
        "Error — the subquery must return a row",
        "Every market passes — an empty comparison is TRUE",
        "No rows — the scalar subquery yields NULL and every comparison is UNKNOWN",
        "The average of all issuers is used instead",
      ],
      answer: 2,
      why: "A scalar subquery contractually returns 0-or-1 rows; zero rows yields NULL, and value > NULL is UNKNOWN — the WHERE silently passes nothing. No error, no rows, no complaint: the dangerous failure mode on filtered staging tables.",
      notes: [
        { choice: 0, why: "Empty is legal for a scalar subquery — it's MORE than one row that errors. The silence is what makes this bug expensive." },
        { choice: 3, why: "Nothing falls back to a global average. The inner query's population is fixed by its own WHERE; an empty population is NULL, not a re-scope." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-9",
      prompt: "Which query returns only markets carrying at least 5 authorization attempts?",
      choices: [
        "SELECT market FROM tx WHERE COUNT(*) >= 5 GROUP BY market",
        "SELECT market FROM tx GROUP BY market HAVING COUNT(*) >= 5",
        "SELECT market, COUNT(*) FROM tx HAVING market >= 5",
        "SELECT DISTINCT market FROM tx WHERE attempts >= 5",
      ],
      answer: 1,
      why: "Row filters live in WHERE; group-result filters live in HAVING, after GROUP BY. Attempt count is a group property, so HAVING COUNT(*) >= 5 is the shape.",
      notes: [
        { choice: 0, why: "WHERE runs before aggregation — COUNT(*) doesn't exist yet there. This is a hard syntax error, and a definition of the pipeline order." },
        { choice: 2, why: "HAVING without GROUP BY folds the whole table to one group, and 'market >= 5' compares text to a number — two errors wearing one query." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-10",
      prompt: "Month-close stitches the settled packet and the outstanding packet into one report. Why does the house style say UNION ALL, never UNION?",
      choices: [
        "UNION is slower to parse",
        "The packets are disjoint by construction, and UNION's dedupe would silently mask any definition bug that ever made them overlap",
        "UNION cannot stack two SELECTs",
        "UNION ALL sorts the result automatically",
      ],
      answer: 1,
      why: "Disjoint populations make dedupe pure cost — and worse, a mask: if a filter bug ever overlaps the branches, UNION deletes the evidence and the report still balances. UNION ALL keeps the anomaly visible; column position and a per-branch literal keep it readable.",
      notes: [
        { choice: 0, why: "Parsing cost is irrelevant at this grain. The reason is correctness: dedupe is an unrequested mutation of a reconciliation artifact." },
        { choice: 2, why: "UNION stacks SELECTs exactly like UNION ALL — the difference is solely the implicit DISTINCT. Which is precisely the danger." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-visa-1",
      tier: "medium",
      topic: "j7",
      universe: "fraud",
      title: "The market approval-rate map",
      brief:
        "Visa-flavored brief on the storefront db: the network-performance review wants the single WORST market by authorization approval rate — one row, worst first — to target an issuer-partnership intervention. The mapping is fixed: orders = authorization attempts; approved = cleared for settlement (delivered + shipped); declined = cancelled; pending = issuer timeout still in window. The definition is equally fixed: approved ÷ ALL attempts in the market, expressed as a percentage. Probed facts: 103 attempts overall — 7 declined (6.8%), 14 pending — and by market: EU 36 of 45 attempts cleared (24 delivered + 12 shipped), APAC 29 of 37, US 15 of 19, LATAM 2 of 2.",
      ask: "Return the one market with the lowest approval rate: region and approve_pct (one decimal), worst first.",
      template:
        "SELECT c.region,\n       100.0 * {1}(CASE WHEN o.status IN ('delivered', 'shipped') THEN 1 ELSE 0 END) / COUNT(*) AS approve_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY approve_pct {2}\nLIMIT {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the conditional counter",
          why: "SUM over the 1/0 cleared flag adds approvals per market (36, 29, 15, 2) while COUNT(*) holds the attempts (45, 37, 19, 2) — numerator and denominator folded from the same rows. COUNT would count every 0 flag too and report 100.0 everywhere.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The intervention targets the LOWEST approval market, so ascending puts the floor on top — APAC with 29 of 37 cleared. DESC would serve LATAM's perfect 2-of-2: a correct query that sends the partnership team to the healthiest market.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the single-market cut",
          noVerify: true,
          why: "The ask names ONE market — the intervention target. LIMIT 1 keeps exactly the floor row; LIMIT 2 would hand the review a runner-up nobody requested and dilute the decision.",
        },
      ],
      distractors: ["COUNT", "MAX", "DESC", "2"],
      walkthrough:
        "A rate where the denominator is the whole test. The CASE flag turns each attempt into a 1/0 indicator of 'cleared for settlement'; SUM adds the 1s per market while COUNT(*) counts every row in the group — same fold, same population, no drift. The 100.0 multiplier forces real division before truncation can eat the share. From the probed counts: EU 36 of 45, APAC 29 of 37, US 15 of 19, LATAM 2 of 2 — and ORDER BY approve_pct ASC + LIMIT 1 crowns APAC as the floor. The elegant twin is 100.0 * AVG(flag): the mean of an indicator IS the share. The distractor that kills the report is COUNT over the flag — zeros are non-NULL, so COUNT returns the attempt count and every market reads 100%. And the cardinal sin is filtering declined attempts in WHERE first: the denominator shrinks to the numerator's population and every market prints a perfect rate — denominator drift, the approval-report killer that a risk review exists to catch.",
    },
    {
      id: "cs-visa-2",
      tier: "easy",
      topic: "t3",
      universe: "month-close",
      title: "The auth-to-capture latency census",
      brief:
        "Visa-flavored brief on the storefront db: settlement ops closes the month with the auth-to-capture census — how long the network carries a promise before the money moves. The mapping: orders = authorization attempts, created_at = authorization time, shipped_at = capture/settlement time (NULL until the money moves). The population rule is the whole test: latency EXISTS only for captured transactions, so the census runs over shipped_at IS NOT NULL and says so. Probed facts: 82 captures of 103 attempts (52 delivered + 30 shipped), average 2.98 days, fastest 2, slowest 4. The 21 attempts without a capture stamp are the pending-plus-declined population — out of scope by definition, not by accident.",
      ask: "Return one row: captured count, average auth-to-capture days (2 decimals), fastest and slowest — over captured transactions only.",
      template:
        "SELECT {1}(*) AS captured,\n       ROUND({2}(julianday(shipped_at) - julianday(created_at)), 2) AS avg_days,\n       MIN(julianday(shipped_at) - julianday(created_at)) AS fastest,\n       MAX(julianday(shipped_at) - julianday(created_at)) AS slowest\nFROM orders\nWHERE shipped_at {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the capture counter",
          why: "COUNT(*) over the filtered population counts captured transactions — 82, the probe's own figure. SUM(*) does not exist and MAX(*) is a syntax error: only COUNT takes the star to count rows.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the latency mean",
          why: "AVG over the julianday diffs averages fractional days across the 82 captures — 2.98, matching the probe. SUM would print the total of all 82 latencies — a number nobody asked for and every reader would misread.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the captured-population filter",
          why: "Latency exists only where the money moved: IS NOT NULL keeps exactly the 82 captured rows and excludes the 21 pending/declined attempts. IS NULL would invert the population and average over rows with no latency at all.",
        },
      ],
      distractors: ["SUM", "MAX", "IS NULL", "MIN"],
      walkthrough:
        "A latency census that lives or dies on its population statement. The WHERE keeps only captured transactions — 82 of 103 attempts; the 21 NULL capture stamps are pending or declined, populations for which 'days to capture' is undefined, not zero. JULIANDAY turns both TEXT timestamps into fractional day numbers, so the diff is fractional days, rounded ONCE at the display layer: 2.98 average, 2 fastest, 4 slowest — the probe's exact figures. COUNT(*) counts the population; AVG folds the latency; MIN/MAX bracket the window the ops team quotes. IS NULL in the filter slot inverts the census — 21 rows, no latency to average, NULLs flowing through. SUM in the mean slot prints the total of every capture's latency, and MAX prints only the slowest capture: both are valid SQL answering a question nobody asked. The habit being graded: state the population before the fold — 82 captures means nothing until the other 21 attempts are accounted for by name.",
    },
  ],

  problems: [
    { slug: "bank-account-summary-ii", why: "Tagged for Visa in the registry pool. Money-in/money-out per account with cents handled honestly — the settlement-account rollup every network reconciliation starts from." },
    { slug: "number-of-rich-customers", why: "Tagged for Visa. The high-ticket census: COUNT DISTINCT over a value threshold — the 'how many credentials clear our ticket band' read risk teams run before any rule change." },
    { slug: "confirmation-rate", why: "The approval-rate drill in textbook form: per-entity share with LEFT JOIN keeping zero-event rows — unmatched accounts count as zero, exactly the network's stand-in logic." },
    { slug: "immediate-food-delivery-ii", why: "Approved-share with a CTE and a conditional ratio — the authorized-versus-delivered gap is Visa's approval-vs-settlement funnel, denominator discipline included." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator reflex every Visa ratio question orbits." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a declined-count alongside — status-aware aggregation over the attempt stream, the settlement calendar's daily muscle." },
    { slug: "monthly-transactions-ii", why: "Declined-versus-rest month packets via UNION — the two-population month-close stitch, where silent dedupe would mask a double-count." },
    { slug: "duplicate-charge-pairs", why: "Self-join window over near-identical transactions — duplicate-auth detection, the acquirer-side file check Visa reconciliation runs before value moves." },
    { slug: "transaction-velocity", why: "Burst detection in time buckets — authorization velocity spikes are the fraud team's first alarm, and this is its query shape." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the zero-delta proof (181080 vs 181080 here) that gates every close before any rate is computed." },
    { slug: "amount-anomaly-zscore", why: "Amount outliers against a baseline sigma — ticket-size anomaly detection, the analyst-side twin of the network's real-time scoring." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every decline-code ladder, said out loud with the 1,1,3 pattern." },
    { slug: "the-latest-login-in-2020", why: "Latest event per entity inside a calendar year — the 'most recent capture per account in the window' read settlement ops lives in." },
    { slug: "top-percentile-fraud", why: "PERCENTILE cut over scored transactions — the risk team's 'worst decile by score' extraction, ranking-window grammar with a fraud lens." },
    { slug: "structuring-detection", why: "Threshold-avoidance patterns via grouped conditional counts — sub-limit transaction structuring, the surveillance shape behind network AML screens." },
    { slug: "gl-reconciliation", why: "Ledger-vs-expected delta detection — the settlement file reconciliation: which side is short, by how many cents, and is the delta zero." },
  ],
};
