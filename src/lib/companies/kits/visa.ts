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
    "Preparation strategy: the registry tags two problems for Visa (`bank-account-summary-ii`, `number-of-rich-customers`) — start there; the rest of the pool is theme-curated from the SQL band toward Visa's known screens: approval-rate folds, honest-denominator ratios, settlement-window date math, decline ladders and unmatched-settlement anti-joins — built for spaced practice rather than one sitting. Then run the six case studies on the live storefront db, in the order the network reads itself: the **market approval-rate map** the performance review opens with, the **auth-to-capture latency census** settlement ops clocks at close, the **never-landed settlement files** the reconciliation run hunts, the **one-pass network census** that reconciles itself in a single row, the **running rail totals** the close signs off, and the **dispute book by acquirer** the partnerships team braces for.",
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
      slugs: ["bank-account-summary-ii", "combine-two-tables", "product-sales-analysis-i", "keep-latest-dedupe", "prepayment-detection", "duplicate-charge-pairs"],
    },
    {
      name: "Rates with honest denominators",
      why: "Approval rates, dispute rates, recovery rates — Visa's ratios punish integer division and denominator drift. The house habit: 100.0 before the division, the denominator's population fixed in the same fold as the numerator, rounding only at the end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Settlement windows & date math",
      why: "T+1 settlement makes date arithmetic a daily tool: captures inside a window, the latest file from each acquirer, activity in the 30 days post-launch. Visa probes half-open intervals and julianday latency math — BETWEEN on the boundary date loses the last night's batch.",
      slugs: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "list-the-products-ordered-in-a-period", "point-in-time-asof", "delinquency-buckets", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Volume aggregation at network scale",
      why: "Billions of authorizations a day means every read is a fold: attempts and value per day, per market, per ticket band. The screens check whether you can aggregate without letting declined attempts pollute settled-value totals — two populations, one GROUP BY, stated out loud.",
      slugs: ["group-sold-products-by-the-date", "monthly-transactions-i", "classes-more-than-5-students", "balance-rollforward", "suspicious-bank-account-transactions", "expected-credit-loss", "transaction-velocity", "amount-anomaly-zscore", "top-percentile-fraud", "structuring-detection"],
    },
    {
      name: "Decline ladders & ranking windows",
      why: "Issuer-partnership reviews rank decline codes by frequency and value, per market, top-N with ties admitted. That is RANK/DENSE_RANK/ROW_NUMBER territory — and the LIMIT-1-OFFSET-1 habit breaks exactly where ties are common.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries", "chargeback-rate-ranking", "credit-utilization-bands"],
    },
    {
      name: "Unmatched-settlement anti-joins",
      why: "Reconciliation is anti-join work: authorizations with no settlement row, accounts with no activity, expected files that never landed. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'find the exposure' question.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "settlement-fails-aging", "ar-aging-schedule", "journal-gap-detection", "trial-balance-check", "gl-reconciliation"],
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
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations", "immediate-food-delivery-ii"],
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
    {
      id: "visa-t9",
      q: "Find cardholders with no authorization in a window. Compare NOT EXISTS, NOT IN, and LEFT JOIN … IS NULL — which one can silently return nothing, and why?",
      a: "NOT IN is the one that lies. x NOT IN (subquery) is never TRUE if the subquery returns a single NULL — the NULL comparison is UNKNOWN, the whole predicate fails, and the anti-join reports an empty exposure list while the pipeline's NULL customer_ids sit right there. NOT EXISTS is NULL-safe: it asks whether even one qualifying row exists, so NULL keys simply never match and the unmatched population survives. LEFT JOIN + IS NULL is the equivalent spelling with the same NULL safety, provided the activity predicate lives in the ON clause — a right-side predicate in WHERE collapses the join to INNER and deletes the very rows you hunted. House rule: anti-joins are NOT EXISTS or LEFT JOIN/IS NULL, never NOT IN over a nullable key.",
      tag: "joins",
    },
    {
      id: "visa-t10",
      q: "The daily network-health row must show attempts, approved, declined and pending side by side, and the branches must reconcile to the total. How do you build it, and how does the reconciliation property actually protect you?",
      a: "One scan, one row: COUNT(*) FILTER (WHERE status = …) branches beside a bare COUNT(*) — 103 attempts, 82 approved, 7 declined, 14 pending on this db, and 82 + 7 + 14 = 103 by construction because every branch folds from the same rows the total counts. SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin with the same property. The protection is real: if a branch total ever stops summing to COUNT(*), a status value exists that no branch anticipated — the reconciliation IS the data-quality check. GROUP BY status answers with four rows instead of one, and nothing ties the rows of separate queries together, which is why the census is one SELECT.",
      tag: "aggregation",
    },
    {
      id: "visa-t11",
      q: "An issuer has zero attempts in the window, and your approval-rate fold divides by its COUNT(*). What does SQLite return, and what is the deliberate spelling?",
      a: "SQLite returns NULL for division by zero — no error, no zero, the rate column just carries NULL and strict consumers quietly drop the issuer. That silence is the danger: an empty population and a broken join look identical downstream. The deliberate spelling is SUM(approved_flag) / NULLIF(COUNT(*), 0), which says out loud 'an empty population is a NULL, and the report will label it as no-attempts' rather than letting the engine decide. Never write COALESCE(..., 0) as a bandage without asking what 0% approval means — it reads as seven declines out of seven, an incident, when the truth is nobody transacted.",
      tag: "nulls",
    },
    {
      id: "visa-t12",
      q: "Build the retry ladder: flag every authorization that follows a declined attempt by the same cardholder. What window machinery, and what does the first row of each partition return?",
      a: "LAG(status) OVER (PARTITION BY customer_id ORDER BY created_at) puts the previous attempt's outcome on each row, and the flag is CASE WHEN prev = 'cancelled' THEN 'retry-after-decline' END — with the filter on prev, not on raw status. The partition boundary matters twice: PARTITION BY keeps one cardholder's history from pairing with a stranger's, and the first row of every partition has no previous row, so LAG yields NULL. Treat that NULL as 'first attempt' explicitly — COALESCE(prev, 'first') — because a bare comparison against NULL never fires and the first attempt silently escapes the ladder. At network scale the retry share after a decline is a live issuer-health signal, so the boundary handling is not a corner case; it is a third of the population on new-credential days.",
      tag: "windows",
    },
    {
      id: "visa-t13",
      q: "Your running settlement total ties on two payments settled the same day. Where do ROWS and RANGE frames disagree, and which one does the ledger want?",
      a: "The default frame is RANGE, which admits PEERS — rows sharing the ORDER BY value — into the frame together, so same-day payments are summed as one step and the running total jumps by the whole day's value at once. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts physical rows, giving each same-day payment its own intermediate balance in whatever order the engine broke the tie. The ledger reconciliation wants the day's total to be unambiguous, so either frame is defensible only once the choice is stated — but the moment someone expects a balance after every row, they need ROWS plus a deterministic tie-break in ORDER BY (amount, then id). The honest rule: never let RANGE's peer behavior be an accident on a settlement spine.",
      tag: "windows",
    },
    {
      id: "visa-t14",
      q: "'Transactions AND distinct credentials per market' — why is that two grains, and what does the gap between the two counts tell the network review?",
      a: "COUNT(*) counts attempts — rows; COUNT(DISTINCT customer_id) counts instruments — credentials that showed up. They live in one SELECT over the same GROUP BY market and reconcile to the same population by construction, which is exactly why they belong together: the gap is repeat intensity, the difference between one cardholder retrying all night and forty cardholders each trying once. A market with 45 attempts and 44 credentials is breadth; 45 attempts from 3 credentials is a retry storm or a credential-stuffing pattern, and the two need opposite responses. The interview trap is folding them at different populations — filter one count and not the other and the intensity ratio is fiction. One scan, both grains, same WHERE — that is the census.",
      tag: "groupby",
    },
    {
      id: "visa-t15",
      q: "Ticket references arrive as TEXT — '99', '100', '1000'. What breaks when you ORDER BY them, and what is the fix?",
      a: "TEXT comparison is lexicographic, character by character: '1000' sorts before '99' because '1' < '9', and the memo is mislabeled the moment reference widths vary. The fix is an explicit numeric read: ORDER BY CAST(ticket_ref AS INTEGER) — one cast at the ordering point, no schema change. The same trap infects MIN/MAX (MIN of TEXT ids is the alphabetically smallest, not the smallest number) and BETWEEN ranges on numeric meaning. The deeper habit: leading zeros are the reason the column is TEXT in the first place ('0412' is a code, not a number), so CAST for arithmetic and ordering, keep TEXT for identity — and never let a report sort a code column as if it were a quantity.",
      tag: "text",
    },
    {
      id: "visa-t16",
      q: "You bucket settlement timestamps by month with STRFTIME and the calendar comes back with sixty buckets. What happened?",
      a: "The format code was '%M' — minutes, not months. STRFTIME's vocabulary bites: %m is the two-digit month, %Y the four-digit year, %M minutes-zero-padded, %S seconds, %j the day-of-year; the month spine is '%Y-%m'. The bug is silent because the query runs, the buckets are consistent, and the chart just looks strangely granular until someone reads the labels — '00' through '59' instead of '2025-01' through '2025-02'. The defense is habit, not cleverness: pin '%Y-%m' as the house bucket, and sanity-check any new bucket query with a MIN/MAX of its own output — the sixty-bucket calendar fails that check in one line.",
      tag: "dates",
    },
    {
      id: "visa-t17",
      q: "A coverage CASE classifies settled, failed and pending but omits ELSE. A new status 'review' arrives. What does the column hold, and what does it do to the census?",
      a: "A CASE with no ELSE yields NULL for unmatched rows — not zero, not an error, not an empty string. The column is honest; the census is what breaks: COUNT(coverage_col) skips NULLs, so the branch counts no longer sum to COUNT(*) — the reconciliation check fires, which is precisely its job. The alternatives are worse: ELSE 'other' hides the new status inside a bucket nobody reads, and an implicit zero misreads 'unclassified' as 'known zero'. The house pattern is exhaustive-by-construction — an explicit ELSE arm that surfaces the unexpected — plus the branch-sum check on every census row. At a network, a new status entering the stream is a normal Tuesday; the code must meet it loudly, not silently.",
      tag: "case",
    },
    {
      id: "visa-t18",
      q: "The report needs the mean ticket of captured transactions AND the full attempt count on the same row. How do you compute both without two queries or a lying denominator?",
      a: "AVG(CASE WHEN status IN ('delivered','shipped') THEN total END): the CASE yields NULL on non-captured rows and AVG skips NULLs, so the mean runs over captured value — 82 captures here — while COUNT(*) on the same fold still counts all 103 attempts. The WHERE version of the same filter computes the right mean but shrinks the row to the captured population, and the attempt count in that query is no longer the attempt count of the network. This is the conditional-aggregate family's whole point: one scan, several populations, each fold carrying its own population inside the aggregate. Say it out loud — 'the mean is over captures, the count is over attempts' — because the number that ships without its population is the one that gets defended badly later.",
      tag: "aggregation",
    },
    {
      id: "visa-t19",
      q: "'Above my issuer's average ticket' — compare the correlated scalar subquery against AVG() OVER (PARTITION BY issuer). When does each earn its keep?",
      a: "The correlated shape — WHERE total > (SELECT AVG(total) FROM tx t2 WHERE t2.issuer = t1.issuer) — re-runs the inner fold once per outer row: conceptually clear, per-group correct, and the natural tool when the comparison set is defined by a condition too complex for a window or when the inner query hits a different table. The window spelling — total > AVG(total) OVER (PARTITION BY issuer) — computes each issuer's average once and pairs it with its rows in a single pass, which is why it is the default at network scale: the correlated version on a billion-row auth stream is a plan disaster. Both answer 'above MY group's average'; neither answers 'above the network average' (that is OVER () with no partition). The follow-up to expect: what happens when an issuer's slice is empty — the window yields a NULL average and the comparison is UNKNOWN, which is the same silent-empty bug as the scalar subquery, wearing a window.",
      tag: "subqueries",
    },
    {
      id: "visa-t20",
      q: "Month-close stitches the settled packet and the outstanding packet into one report and appends a grand-total row. What does UNION ALL demand of the branches, and where do the column names come from?",
      a: "Set operations stack by position, not by name: every branch must return the same column count with per-position compatible types, and the report's names come from the FIRST SELECT only — the second branch's aliases are decoration the engine ignores. The grand-total row is just a third branch with a literal label ('TOTAL') where the grouping column would be, which is why the label literal is non-negotiable: an unlabeled total row is indistinguishable from a group. UNION ALL, never UNION — the packets are disjoint by construction, and UNION's implicit DISTINCT would silently delete the overlap evidence if a filter bug ever made the branches meet. The classic failure is two same-typed columns swapped in one branch: the stack still balances, and the totals are wrong in a way no check catches until a human reads the row.",
      tag: "setops",
    },
    {
      id: "visa-t21",
      q: "Two capture rows for the same authorization landed in one settlement day. How do you find duplicate pairs with a self-join without mirroring them?",
      a: "Join the settlement table to itself on the identity that makes rows interchangeable — same authorization, same day — with a strict inequality on a unique key: o1.id < o2.id. The strict < does three jobs at once: it excludes self-pairs (o1.id = o2.id), it keeps exactly one row per unordered pair (no A/B plus B/A mirror), and it makes the pair reportable as 'these two ids'. The <= variant doubles every pair and pairs every row with itself; the GROUP BY customer-day HAVING COUNT(*) > 1 is the right first alarm but cannot name WHICH rows collide, and the remediation needs identities. At reconciliation grain this is the duplicate-file check: the count of pairs is the incident size, the id pairs are the incident itself.",
      tag: "joins",
    },
    {
      id: "visa-t22",
      q: "Print each rail's share of network settled value on every row. Compare the window spelling, the scalar subquery, and the cross join — which is the house default and why?",
      a: "The window spelling: amount / SUM(amount) OVER () — after GROUP BY rail, the OVER () fold computes the grand total once and places it beside every row; one scan, no failure mode on a filtered slice beyond the usual empty-population NULL. The scalar subquery — amount / (SELECT SUM(amount) FROM payments) — is correct but re-reads the table per row, and on a filtered staging slice its inner fold can be empty, yielding the divide-by-NULL silent zero rows. The cross join to an aggregated copy of the table is the heavyweight spelling of the same pairing, paying a materialization for what the window does for free. House default is the window: cheapest pass, the denominator is visible on every row (which makes the number auditable), and the division's population is stated by the same fold that produced it.",
      tag: "windows",
    },
    {
      id: "visa-t23",
      q: "GROUP_CONCAT folds each market's decline codes into one cell. Why can't you trust the cell's order, and how do you make it deterministic?",
      a: "The aggregate folds rows in scan order — whatever order the query plan walked the table. No ORDER BY on the outer query reaches inside a cell (it orders rows, never characters), and GROUP_CONCAT has no alphabetical default; the same query can print 'cancelled,delivered,pending,shipped' today and a different order after an index change or a plan rewrite. The deterministic pattern sorts before folding: a derived table or CTE that selects the codes ORDER BY code, then the GROUP_CONCAT over the sorted set — or, on modern SQLite, ORDER BY inside the aggregate call itself. In an audit deliverable the cell's order is part of the evidence: two runs that print the same codes in different order read as tampering to anyone diffing the reports.",
      tag: "data-quality",
    },
    {
      id: "visa-t24",
      q: "Which months carried attempts but zero approvals? Where does that predicate live, and why not in WHERE?",
      a: "It is a property of the month-group — 'the fold produced zero approvals' — so the gate is HAVING SUM(status IN ('delivered','shipped')) = 0 after GROUP BY month. WHERE runs before aggregation: SUM(approved) does not exist yet there, and a row-level approved = 0 filter answers a different question entirely (declined attempts, not failed months). The distinction is the pipeline order said out loud: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — row facts filter early, group results gate late. The interview tail: a zero-approval month on a live network is either an outage or a denominator bug, so the strong candidate follows the gate with 'and I would re-run the branch-sum reconciliation before anyone panics.'",
      tag: "filtering",
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
    {
      id: "visa-mcq-11",
      prompt: "The issuer review wants one row per market with its distinct authorization outcomes folded into a single comma-separated cell. Which SELECT does that?",
      choices: [
        "SELECT market, GROUP_CONCAT(DISTINCT status) FROM auths GROUP BY market",
        "SELECT market, GROUP_CONCAT(status) FROM auths GROUP BY market",
        "SELECT market, COUNT(status) FROM auths GROUP BY market",
        "SELECT market, status FROM auths GROUP BY market",
      ],
      answer: 0,
      why: "DISTINCT folds the repeated per-attempt statuses into the set — 'cancelled,delivered,pending,shipped' — while the plain GROUP_CONCAT repeats one value per attempt row. The fold and the dedupe are two different jobs in one function.",
      notes: [
        { choice: 1, why: "Legal SQL, wrong cell: EU's 45 attempts would print 45 comma-separated values instead of the four distinct outcomes the review reads." },
        { choice: 3, why: "GROUP BY with a bare status column keeps one arbitrary status per market — a silent sample of one, not a fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-12",
      prompt: "The daily network-health row must show attempts, approved, declined and pending side by side, and the branches must reconcile to the total. Which shape delivers that in one scan?",
      choices: [
        "COUNT(*) FILTER (WHERE status = …) branches beside a bare COUNT(*)",
        "Three scalar subqueries, one per branch",
        "GROUP BY status and read across the rows",
        "Four separate queries stitched together in a spreadsheet",
      ],
      answer: 0,
      why: "FILTER (WHERE …) folds each branch in the same pass as COUNT(*), so branch totals sum to the total by construction — 82 + 7 + 14 = 103 on this db. The reconciliation property is the data-quality check.",
      notes: [
        { choice: 1, why: "Subqueries re-scan the table per branch and nothing ties their populations together — the reconciliation guarantee evaporates." },
        { choice: 2, why: "GROUP BY status returns four rows; the deliverable was one row whose columns cross-check." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-13",
      prompt: "An issuer with zero attempts enters the approval-rate fold, so SUM(approved) / COUNT(*) divides by zero. What does SQLite return for that issuer?",
      choices: [
        "A runtime error — the query aborts",
        "NULL — the row silently carries a NULL rate",
        "0 — an empty population counts as zero approvals",
        "Infinity — SQL follows IEEE float semantics",
      ],
      answer: 1,
      why: "SQLite's / yields NULL on a zero divisor — no error, no zero; the issuer just carries a NULL rate and vanishes from strict consumers. The deliberate spelling is SUM(...) / NULLIF(COUNT(*), 0), which names 'empty population' as a NULL on purpose.",
      notes: [
        { choice: 2, why: "Zero would print a 0% approval rate — which reads as every attempt declined, a live incident, when the truth is nobody transacted." },
        { choice: 3, why: "Integer and float division by zero both return NULL in SQLite; nothing raises IEEE infinity here." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-14",
      prompt: "Find cardholders with no authorization since '2025-01-01'. orders.customer_id is nullable. Why does the house style say NOT EXISTS, never NOT IN?",
      choices: [
        "NOT IN is slower on indexed columns",
        "One NULL in the subquery's key column makes NOT IN return nothing at all",
        "NOT EXISTS cannot reference the outer table",
        "NOT IN requires a JOIN keyword",
      ],
      answer: 1,
      why: "x NOT IN (…NULL…) is never TRUE — the NULL comparison is UNKNOWN and the whole anti-join silently reports an empty exposure list. NOT EXISTS asks 'does even one qualifying row exist', which NULL keys simply never satisfy, so the unmatched population survives.",
      notes: [
        { choice: 0, why: "The killer is correctness, not plan cost — a NOT IN that returns zero rows fast is still wrong." },
        { choice: 2, why: "Referencing the outer query is exactly what NOT EXISTS does; it is the correlated half of its job." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-15",
      prompt: "The market review reads one row per market with settled, in-flight and failed as COLUMNS. Which shape prints that census?",
      choices: [
        "GROUP BY status — one row per status",
        "SUM(CASE WHEN status = … THEN 1 ELSE 0 END) branches inside one GROUP BY market",
        "SELECT DISTINCT market ORDER BY status",
        "A self-join of the markets table to itself",
      ],
      answer: 1,
      why: "Conditional SUM branches turn each status into a column while GROUP BY market holds the row grain the deck wants — the pivot is aggregation-shaped, not display-shaped.",
      notes: [
        { choice: 0, why: "That is the transpose: three rows the reader must rotate in their head. The ask was columns." },
        { choice: 2, why: "DISTINCT and ORDER BY never aggregate — no counts arrive, just a shuffled list of markets." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-16",
      prompt: "Each rail's share of network settled value must print on every row of the rail report, computed in one pass. Which is the share column?",
      choices: [
        "A scalar subquery computing the grand total for every row",
        "amount / SUM(amount) OVER () — the window folds the grand total alongside each row",
        "A CROSS JOIN to an aggregated copy of the payments table",
        "MAX(amount) compared against each row's amount",
      ],
      answer: 1,
      why: "SUM() OVER () computes the network total once and places it beside every row — one pass, and the denominator is visible on each row, which makes the share auditable. The scalar subquery re-reads the table per row and its inner fold can silently go NULL on filtered slices.",
      notes: [
        { choice: 2, why: "Correct but heavyweight — it materializes the pairing the window gets for free; at network grain that is a plan disaster." },
        { choice: 3, why: "That answers 'share of the biggest rail', not share of the network — a different denominator wearing the same word." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-17",
      prompt: "The retry ladder uses LAG(status) OVER (PARTITION BY customer_id ORDER BY created_at) to flag attempts following a decline. What does the flag hold for each cardholder's FIRST attempt?",
      choices: [
        "'declined' — LAG assumes the worst",
        "NULL — there is no previous row in the partition",
        "0",
        "A syntax error — LAG refuses the first row of a partition",
      ],
      answer: 1,
      why: "LAG reads the previous row of the same partition; at the partition's first row there is none, so it yields NULL. The honest fold treats that NULL as 'first attempt' explicitly — COALESCE(prev, 'first') — because a bare comparison against NULL never fires.",
      notes: [
        { choice: 2, why: "NULL is not zero — only COALESCE would fold it to 0, and then 'first attempt' and 'retry after clean run' look identical." },
        { choice: 3, why: "LAG returns NULL at the boundary by contract — the value exists, it is just honest about the missing history." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-18",
      prompt: "The settlement spine buckets TEXT timestamps like '2025-01-31 23:59:59' by month. Which expression produces '2025-01'?",
      choices: [
        "STRFTIME('%Y-%m', settled_at)",
        "STRFTIME('%M-%Y', settled_at)",
        "STRFTIME('%M', settled_at)",
        "SUBSTR(settled_at, 12, 2)",
      ],
      answer: 0,
      why: "%Y-%m is the month spine; %M is MINUTES — '%M' buckets '23:59:59' as '59' and the calendar comes back with sixty buckets. The classic typo ships a silently wrong chart.",
      notes: [
        { choice: 3, why: "Positions 12–13 of the timestamp are the hour digits — a bucket per hour of day, wrong by design." },
        { choice: 1, why: "Minute-then-year ordering: consistent, reproducible, and completely meaningless as a settlement calendar." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-19",
      prompt: "Ticket references are TEXT: '99', '100', '1000'. The memo must list them by numeric value. Which ORDER BY does that?",
      choices: [
        "ORDER BY ticket_ref",
        "ORDER BY CAST(ticket_ref AS INTEGER)",
        "ORDER BY UPPER(ticket_ref)",
        "ORDER BY LENGTH(ticket_ref)",
      ],
      answer: 1,
      why: "TEXT comparison is lexicographic — '1000' < '99' because '1' < '9' — so the bare sort lies the moment widths vary. CAST forces a numeric read at the one point that needs it.",
      notes: [
        { choice: 2, why: "UPPER is a no-op on digits and preserves the lexicographic bug with extra cost." },
        { choice: 3, why: "Length ordering happens to fix this three-row sample and fails on any real mix — '99' would sort after '1000' again." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-20",
      prompt: "Two capture rows for the same authorization landed in one settlement day — a duplicate-file artifact. Which self-join shape reports each pair exactly once?",
      choices: [
        "o1.id = o2.id on the shared authorization",
        "o1.id < o2.id on the shared authorization and day",
        "o1.id <= o2.id on the shared authorization and day",
        "GROUP BY customer, day HAVING COUNT(*) > 1",
      ],
      answer: 1,
      why: "Strict < excludes self-pairs and keeps one row per unordered pair — no A/B plus B/A mirrors — while naming both row ids, which is what remediation needs.",
      notes: [
        { choice: 2, why: "<= pairs every row with itself and doubles every real pair — the incident count doubles too." },
        { choice: 3, why: "The right first alarm, but it names the collision site, not the colliding rows; the file fix needs identities." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-21",
      prompt: "The risk memo wants EXACTLY five decline codes on the ladder, ties broken alphabetically by code. Which produces it?",
      choices: [
        "RANK() OVER (ORDER BY attempts DESC) <= 5",
        "DENSE_RANK() OVER (ORDER BY attempts DESC) <= 5",
        "ROW_NUMBER() OVER (ORDER BY attempts DESC, code ASC) <= 5",
        "ORDER BY attempts DESC LIMIT 5",
      ],
      answer: 2,
      why: "Exactly-N with a stated tie-break is ROW_NUMBER over a composite order — deterministic and reproducible. RANK and DENSE_RANK admit every code tied at the boundary (six rows, on purpose), and bare LIMIT breaks ties arbitrarily.",
      notes: [
        { choice: 0, why: "RANK keeps the tie and the gap — two codes at rank 5 both survive and the ladder prints six rows." },
        { choice: 3, why: "LIMIT takes whichever rows the plan happens to emit first among ties — a ladder that can change between runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-22",
      prompt: "The running settled-value total must restart at zero for each rail — card's running total must never absorb wire's day. What draws the boundary?",
      choices: [
        "ORDER BY paid_on inside OVER()",
        "PARTITION BY method inside OVER()",
        "GROUP BY method outside the window",
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
      ],
      answer: 1,
      why: "PARTITION BY splits the sequence per rail, so the running fold resets at each rail's first row. ORDER BY only sequences within the partition; GROUP BY would collapse the rows the running total needs.",
      notes: [
        { choice: 3, why: "A frame narrows which rows feed the fold — it never decides which rows belong to the same sequence." },
        { choice: 2, why: "GROUP BY method yields one row per rail: nothing left to run across." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-23",
      prompt: "The opening read of the network review: transactions AND distinct credentials per market, one pass. Which SELECT carries both grains honestly?",
      choices: [
        "COUNT(*) AS attempts, COUNT(DISTINCT customer_id) AS credentials",
        "COUNT(*) twice, labeled differently",
        "COUNT(customer_id) AS attempts, SUM(customer_id) AS credentials",
        "COUNT(DISTINCT *) AS credentials",
      ],
      answer: 0,
      why: "COUNT(*) counts attempts; COUNT(DISTINCT customer_id) counts instruments; the gap is repeat intensity — one cardholder retrying all night versus forty cardholders trying once. Two grains, same population, one scan.",
      notes: [
        { choice: 2, why: "COUNT(customer_id) is not a distinct count (it skips NULLs only), and SUM of ids is a number with no meaning." },
        { choice: 3, why: "COUNT(DISTINCT *) is not a thing — DISTINCT applies to an expression, and the star is not one." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-24",
      prompt: "Issuer references like 'RBA-0412' must match the RBA family only. Which WHERE is both correct and index-friendly?",
      choices: [
        "WHERE issuer_ref LIKE '%RBA%'",
        "WHERE issuer_ref LIKE 'RBA%'",
        "WHERE issuer_ref = 'RBA'",
        "WHERE SUBSTR(issuer_ref, 1, 3) = 'RBA'",
      ],
      answer: 1,
      why: "An anchored prefix keeps the sargable range shape the index can walk; '%RBA%' must scan every row and matches RBA anywhere in the string; equality drops every suffixed reference.",
      notes: [
        { choice: 0, why: "The leading wildcard is the quiet full scan behind every mysteriously slow dashboard." },
        { choice: 3, why: "Correct on this format but it wraps the column in a function — the index is now decorative." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-25",
      prompt: "A coverage CASE classifies settled, failed and pending but omits ELSE. A row with status 'review' arrives. What does the CASE column hold, and what does it do to the census?",
      choices: [
        "An error — CASE arms must be exhaustive",
        "0 — unmatched arms default to zero",
        "NULL — and COUNT of that column skips the row while COUNT(*) still counts it",
        "The empty string — counted by COUNT, invisible to SUM",
      ],
      answer: 2,
      why: "CASE without ELSE yields NULL for unmatched rows. COUNT(coverage) skips NULLs, so branch counts stop summing to COUNT(*) — the reconciliation check fires, which is exactly its job.",
      notes: [
        { choice: 1, why: "Zero requires ELSE 0 written out — the default is NULL, and the difference is the whole bug." },
        { choice: 3, why: "The empty string is not the default either; and COUNT does count empty strings, which would hide the drift instead of exposing it." },
      ],
      difficulty: "hard",
    },
    {
      id: "visa-mcq-26",
      prompt: "The monthly fold is built; the ask is 'which months carried attempts but zero approvals?' Where does that predicate live?",
      choices: [
        "WHERE SUM(approved_flag) = 0",
        "HAVING SUM(status IN ('delivered','shipped')) = 0",
        "HAVING COUNT(*) = 0",
        "WHERE approved_flag = 0",
      ],
      answer: 1,
      why: "'Zero approvals in the month' is a property of the group, so the gate is HAVING after GROUP BY. WHERE runs pre-fold — the SUM does not exist yet — and a row-level flag filter answers a different question (which attempts failed, not which months failed).",
      notes: [
        { choice: 2, why: "Months with zero attempts never existed in this table — COUNT(*) = 0 can never fire; the gate is about zero APPROVALS among existing rows." },
        { choice: 3, why: "That filters individual declined attempts out of the fold — the months still print, now with drifted denominators." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-27",
      prompt: "The report needs the mean ticket of CAPTURED transactions AND the full attempt count on the same row. Which computes the mean without shrinking the row's population?",
      choices: [
        "AVG(total) with WHERE status IN ('delivered','shipped')",
        "AVG(CASE WHEN status IN ('delivered','shipped') THEN total END)",
        "SUM(total) / COUNT(total)",
        "MAX(total) - MIN(total)",
      ],
      answer: 1,
      why: "The CASE yields NULL on non-captured rows and AVG skips NULLs — the mean runs over captured value (82 captures here) while COUNT(*) on the same fold still counts all 103 attempts. One scan, two populations, each stated.",
      notes: [
        { choice: 0, why: "Right mean, wrong row: the WHERE shrinks the fold, so the attempt count printed beside it is the captured count, not the network's." },
        { choice: 2, why: "SUM/COUNT(total) is the mean over non-NULL totals — the same population by luck, with none of the intent stated." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-28",
      prompt: "Month-close stitches the card packet and the wire packet with UNION ALL. What must align between branches, and where do the column names come from?",
      choices: [
        "Names must match; column order is free",
        "Column count and position; names come from the first SELECT",
        "Nothing — UNION ALL reorders columns to align",
        "Types are coerced per row; names come from the last SELECT",
      ],
      answer: 1,
      why: "Set operations stack by position, not by name: same column count, per-position type compatibility, and the report's names come from the first branch — the second branch's aliases are ignored.",
      notes: [
        { choice: 0, why: "Name-matching is the classic bug: swap two same-typed columns in one branch and the stack still runs, silently transposed." },
        { choice: 2, why: "UNION ALL does zero alignment work — it concatenates rows exactly as the branches emit them." },
      ],
      difficulty: "easy",
    },
    {
      id: "visa-mcq-29",
      prompt: "'Above MY issuer's average ticket, per attempt' — which shape answers that per-group question without re-running a subquery for every row?",
      choices: [
        "A correlated scalar subquery comparing each row to its issuer's AVG",
        "total > AVG(total) OVER (PARTITION BY issuer)",
        "GROUP BY issuer HAVING AVG(total) > 100",
        "A CROSS JOIN of every attempt to every issuer average",
      ],
      answer: 1,
      why: "PARTITION BY issuer computes each issuer's average once and pairs it with its rows in one pass; the correlated subquery re-runs the fold per row — correct, and a plan disaster at network grain.",
      notes: [
        { choice: 2, why: "HAVING gates whole groups — it cannot keep the per-attempt rows the ask wants to print." },
        { choice: 3, why: "It materializes the same pairing the window computes for free, plus every pairing nobody asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "visa-mcq-30",
      prompt: "The audit memo folds each market's decline codes into one cell with GROUP_CONCAT. Why does the house style sort before folding instead of trusting the cell?",
      choices: [
        "GROUP_CONCAT returns a BLOB that must be sorted afterwards",
        "The aggregate folds rows in scan order — the cell's order is whatever the plan walked, run to run",
        "GROUP_CONCAT sorts alphabetically by default",
        "An outer ORDER BY reorders the characters inside each cell",
      ],
      answer: 1,
      why: "No ORDER BY on the outer query reaches inside a cell, and there is no alphabetical default: the fold consumes rows in plan order, which index changes and rewrites can alter. Sort in a derived table (or ORDER BY inside the aggregate on modern SQLite), then fold — a deterministic cell.",
      notes: [
        { choice: 2, why: "If only — the absence of that default is precisely why two runs of the same query can disagree." },
        { choice: 3, why: "ORDER BY orders rows, never the characters within one; the cell leaves the query exactly as the fold left it." },
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
    {
      id: "cs-visa-3",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The settlement files that never landed",
      brief:
        "Visa reconciliation brief on the storefront db: the billing book (invoices = expected settlement files) LEFT JOINs the money that actually moved (payments = settled captures), and the rows that fail to match ARE the exposure — files the acquirer never settled. The mapping: invoices = expected settlements (amount_cents, INTEGER), payments = settled money movement, customers.region = market. Probed facts: 6 of the 28 expected files never settled — 5 open plus 1 paid-on-paper file (#28, the paid-with-no-money anomaly) — totalling $15,217.00. By market: EU 4 files / $8,524.00, US 1 / $4,937.00, APAC 1 / $1,756.00, LATAM clean. The anti-join is the deliverable; the region fold is how the follow-up call gets prioritized.",
      ask: "Return each market's count of never-settled files and their exposure in dollars (2 decimals), biggest exposure first.",
      template:
        "SELECT c.region,\n       {1}(i.id) AS never_settled,\n       ROUND({2}(i.amount_cents) / 100.0, 2) AS exposure_usd\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {3}\nGROUP BY c.region\nORDER BY exposure_usd {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the file counter",
          why: "COUNT(i.id) counts expected files per market that failed to match a settlement — 4 EU, 1 US, 1 APAC, the probe's exact distribution. SUM would add up file ids: a number with no meaning in any reconciliation.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the exposure fold",
          why: "SUM over the unpaid files' cents folds each market's exposure — 8524, 4937, 1756 — and the single /100.0 prints honest dollars. COUNT would divide a row count by 100 and print cents-shaped noise.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join predicate",
          why: "The unmatched rows carry NULL payment columns after the LEFT JOIN — IS NULL keeps exactly the 6 never-settled files. IS NOT NULL would invert the report into the settled population: 22 files, zero exposure, no fires to fight.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The ops call starts with the largest hole: EU's $8,524.00. ASC would open with APAC's $1,756.00 — a correct query that leads the meeting with the smallest problem in the book.",
        },
      ],
      distractors: ["SUM", "COUNT", "IS NOT NULL", "ASC"],
      walkthrough:
        "Reconciliation is anti-join work, and this is the purest shape: expected files on the left, money on the right, and the answer is the set of rows that never matched. The LEFT JOIN survives every unmatched invoice with NULL payment columns; WHERE p.id IS NULL keeps exactly those — 6 files, $15,217.00 of exposure, including the paid-on-paper #28 that no amount of status filtering would ever surface, because the label says paid and the money never moved. The market fold turns the exposure list into a call plan: EU's 4 files / $8,524.00 first, US and APAC single files after. IS NOT NULL inverts the report into the settled book — 22 files, no exposure, a reconciliation that finds nothing because it looked at the wrong half. The two aggregates stay at the file grain: COUNT(i.id) counts the files, SUM(amount_cents)/100.0 folds their value, and neither inherits fan-out because these files never matched a second row. The habit being graded: the rows that fail to match are not missing data — they are the product.",
    },
    {
      id: "cs-visa-4",
      tier: "medium",
      topic: "x2",
      universe: "fraud",
      title: "The one-pass network census",
      brief:
        "Visa-flavored brief on the storefront db: the network-performance review opens on a single health row — attempts, approved, declined, pending, and the approval rate — and the house rule is one scan with branches that reconcile to the total by construction. The mapping is the kit's standing one: orders = authorization attempts, delivered + shipped = approved & cleared, cancelled = declined, pending = issuer timeout. Probed facts: 103 attempts — 82 approved, 7 declined, 14 pending — approval share 79.6% at one decimal. The census exists so the branch sums can be checked in one glance: 82 + 7 + 14 = 103, or a status value has entered the stream that no branch anticipated.",
      ask: "Return one row: total attempts, approved, declined, in-flight counts, and the approval percentage (1 decimal).",
      template:
        "SELECT COUNT(*) AS attempts,\n       COUNT(*) {1} (WHERE status IN ('delivered', 'shipped')) AS approved,\n       COUNT(*) FILTER (WHERE status = {2}) AS declined,\n       COUNT(*) FILTER (WHERE status = 'pending') AS in_flight,\n       ROUND({3} * COUNT(*) FILTER (WHERE status IN ('delivered', 'shipped')) / COUNT(*), 1) AS approve_pct\nFROM orders;",
      slots: [
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the one-pass branch counter",
          why: "COUNT(*) FILTER (WHERE …) folds the approved branch from the same rows the bare COUNT(*) totals — 82 of 103, with 7 + 14 completing the reconciliation. SUM or MAX after the star is a syntax error: only COUNT takes *.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined literal",
          why: "'cancelled' is the declined family in the standing mapping — 7 attempts, completing 82 + 7 + 14 = 103. 'delivered' would print 52 declined and the reconciliation check would fire immediately.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the real-division multiplier",
          why: "The 100.0 forces float division before SQLite's integer truncation can eat the share — 82/103 is 0.796…, and the .0 is the one character between 79.6 and a flat 0. The literal 100 computes 100 * 82 first in INTEGER world and still truncates on the division that follows.",
        },
      ],
      distractors: ["SUM", "MAX", "'delivered'", "100"],
      walkthrough:
        "The one-pass census: one table, one scan, one row whose columns cross-check. COUNT(*) counts all 103 attempts; each FILTER branch folds one status family from the same rows — 82 approved, 7 declined, 14 pending — and the arithmetic identity 82 + 7 + 14 = 103 is the report's built-in data-quality check: if a branch ever stops summing to the total, a status value exists that no branch anticipated, and the census says so without being asked. The share column is where the money bugs live: 100.0 before the division promotes the arithmetic to float, and ROUND(…, 1) prints 79.6 — while the integer literal 100 leaves 100 * 82 an INTEGER and the division truncates the share to a flat 0.0, the exact failure every approval dashboard fears. SUM and MAX in the FILTER slot die as syntax — only COUNT takes the star — which is the engine refusing a nonsense census rather than shipping one. The habit being graded: a rate and its denominator from the same fold, and a census that reconciles itself.",
    },
    {
      id: "cs-visa-5",
      tier: "hard",
      topic: "t6",
      universe: "month-close",
      title: "Running settlement totals per rail",
      brief:
        "Visa settlement-ops brief on the storefront db: the close needs each rail's settled value month by month WITH a running total per rail, because the reconciliation sign-off reads the final running number and compares it to the rail's filed total. The mapping: payments = settled money movement, method = rail (card vs wire), amount_cents = INTEGER cents. Probed facts: card rail — 12 monthly files totalling $37,364.00 across 16 payments; wire rail — 9 files totalling $32,248.00 across 11 payments; the ledger's two rails must each arrive at those numbers and the network's $69,612.00 must never cross-contaminate between them. The window is the deliverable: one column per month, one running column, partition walls between the rails.",
      ask: "Return each rail's monthly settled dollars with a running total per rail; the last row per rail must equal the rail's filed total.",
      template:
        "SELECT method, month,\n       ROUND(settled, 2) AS settled_usd,\n       ROUND({1}(settled) OVER ({2} BY method ORDER BY month), 2) AS running_usd\nFROM (SELECT method, {3}('%Y-%m', paid_on) AS month, SUM(amount_cents) / 100.0 AS settled\n      FROM payments\n      GROUP BY method, month)\nORDER BY method, month;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the running fold",
          why: "SUM(settled) OVER (…) accumulates each rail's monthly values in order — card's last running row lands on 37364, wire's on 32248, the filed totals. COUNT would accumulate row counts instead of dollars and reconcile nothing.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the rail wall",
          why: "PARTITION BY method restarts the accumulation at each rail's first month — card's running total never absorbs wire's day. RANGE BY is a syntax error, and without the wall one interleaved spine would total $69,612 and match no filed number.",
        },
        {
          answer: "STRFTIME",
          kind: "keyword",
          label: "the month spine",
          why: "STRFTIME('%Y-%m', paid_on) buckets each settlement into its month — the spine the close calendar hangs on. DATE with a format string returns NULL for every row and collapses the calendar to one undated lump per rail.",
        },
      ],
      distractors: ["COUNT", "RANGE", "DATE", "JULIANDAY"],
      walkthrough:
        "A running total that must reconcile at two grains: per month as it grows, per rail at the end. The derived table does the first fold — STRFTIME('%Y-%m') buckets the TEXT timestamps, SUM(amount_cents)/100.0 folds each month's value in cents-then-dollars — and the window does the second: SUM(settled) OVER (PARTITION BY method ORDER BY month) accumulates within each rail's wall, resetting at the first month of the next rail. Card's final running row reads 37364.00, wire's 32248.00 — the filed totals the close compares against; a missing wall would interleave the rails into one $69,612 spine that matches nothing. RANGE BY is not syntax SQLite accepts — the engine refuses rather than silently bridging the walls — and DATE('%Y-%m', …) returns NULL for every row, collapsing the calendar into one undated row per rail whose 'running total' is just the rail total twice. COUNT in the fold slot is the subtle one: it accumulates row counts, prints tidy increasing numbers, and reconciles nothing. The habit being graded: a running total is only a reconciliation number when its partition walls and its final row are both accounted for.",
    },
    {
      id: "cs-visa-6",
      tier: "medium",
      topic: "j8",
      universe: "refund-audit",
      title: "The dispute book by acquirer",
      brief:
        "Visa dispute brief on the storefront db: the chargeback book (claims = filed disputes with amount_cents, reason, status, settled_on) rides on acquirer batch files (shipments, with carriers = the acquiring banks), and the network review wants the dispute exposure per acquirer — total disputed, still-open count, and money already recovered. Mapping: claims = the dispute/chargeback book, shipments = the batch file each dispute attaches to, carriers = acquirers. Probed facts: 7 disputes totalling $3,369.00 — OceanMeridian 3 disputes / $1,583.00 / 1 open / $99.00 recovered; TransEuro Line 3 / $916.00 / 1 / $570.00; RoadHaul One 1 / $870.00 / 1 / $0.00. The open disputes ($2,466.00 of the book) are the exposure; the recovered column is what the partnerships team gets credit for.",
      ask: "Return each acquirer's dispute count, disputed dollars (2 decimals), still-open count, and recovered dollars (2 decimals), biggest disputed book first.",
      template:
        "SELECT ca.name AS acquirer,\n       {1}(*) AS disputes,\n       ROUND(SUM(cl.amount_cents) / 100.0, 2) AS disputed_usd,\n       SUM(cl.status = {2}) AS open_now,\n       ROUND({3}(CASE WHEN cl.status = 'settled' THEN cl.amount_cents ELSE 0 END) / 100.0, 2) AS recovered_usd\nFROM claims cl\nJOIN shipments s ON s.id = cl.shipment_id\nJOIN carriers ca ON ca.id = s.carrier_id\nGROUP BY ca.name\nORDER BY disputed_usd {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the dispute counter",
          why: "COUNT(*) counts dispute rows per acquirer — 3, 3, 1, the probe's exact distribution. SUM(*) does not exist and MAX(*) is a syntax error: only COUNT takes the star to count rows.",
        },
        {
          answer: "'open'",
          kind: "keyword",
          label: "the exposure literal",
          why: "SUM(cl.status = 'open') counts the still-open disputes — 1 per acquirer here, the exposure the partnerships call chases. 'settled' would print the recovered count instead and the open exposure vanishes from the memo.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the recovered-value fold",
          why: "SUM over the CASE-flagged settled amounts folds only money that moved — 99, 570, 0 — while COUNT would print row counts divided by 100: cents-shaped noise that reads as dollars to nobody.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "Disputed DESC opens the review with OceanMeridian's $1,583.00 — the largest book. ASC would lead with RoadHaul One's single $870.00 dispute: a correct query that starts the meeting with the smallest acquirer.",
        },
      ],
      distractors: ["MAX", "'settled'", "COUNT", "ASC"],
      walkthrough:
        "A three-table chain that ends in a four-number verdict per acquirer. The joins are the plumbing — claims to its batch file (shipments) to the acquiring bank (carriers) — and every dispute matches exactly one batch and one acquirer, so the fold is clean at acquirer grain. The columns are the lesson: COUNT(*) counts disputes, SUM(amount_cents)/100.0 folds the disputed book, SUM(status = 'open') is the boolean-sum idiom counting the exposure rows, and the CASE inside SUM isolates recovered money — 'settled' rows only, everyone else contributing zero. OceanMeridian reads 3 / $1,583.00 / 1 / $99.00: big book, barely recovered — the acquirer conversation of the quarter; TransEuro Line's identical dispute count sits on a $916.00 book with $570.00 back — a different story at the same count. 'settled' in the exposure literal quietly replaces the open list with the recovered list — the memo would report the exposure as fixed while RoadHaul One's $870.00 stays unchased. The habit being graded: counts and conditional sums from the same fold, each column carrying the population its name claims.",
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
    { slug: "chargeback-rate-ranking", why: "Dispute rates ranked per entity — the chargeback ladder this kit's dispute book is read through: worst acquirers first, with the denominator named." },
    { slug: "settlement-fails-aging", why: "Failed settlements bucketed by age — the never-landed-file chase list, ranked by how long the money has been outstanding." },
    { slug: "ar-aging-schedule", why: "Receivables aged into buckets — the expected-vs-settled gap by age band, the follow-up call plan behind cs-visa-3's exposure map." },
    { slug: "suspicious-bank-account-transactions", why: "Pattern flags over account activity — the analyst-side scan that mirrors the network's real-time fraud scoring before the rules fire." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating-amount runs via window comparison — limit-probing behavior, the pattern the decline-code ladder exists to catch." },
    { slug: "prepayment-detection", why: "Money arriving before its obligation — captured-before-billed anomalies, the settlement-window edge case auditors love." },
    { slug: "balance-rollforward", why: "Opening balance plus activity equals closing balance, proved in SQL — the settlement-account walk that anchors every reconciliation run." },
    { slug: "expected-credit-loss", why: "Weighted loss estimate over exposure bands — the risk-quant fold where populations and weights must both be stated, Visa's denominator discipline at portfolio grain." },
    { slug: "point-in-time-asof", why: "The value in force at a moment, not today's — the as-of read behind every 'what did we know when' audit of an authorization decision." },
    { slug: "journal-gap-detection", why: "Missing sequence numbers in a journal — the settlement-file gap check: which batch never arrived, found by enumeration instead of trust." },
    { slug: "keep-latest-dedupe", why: "Latest row per key after re-sends — acquirer files arrive duplicated; the dedupe rule decides which capture is the money." },
    { slug: "credit-utilization-bands", why: "Latest-value banding per entity — ticket-band and limit-band classification, the segmentation lens behind every risk rule review." },
    { slug: "delinquency-buckets", why: "Aging buckets that must be exhaustive — the dispute- and settlement-aging spine whose branch totals reconcile to COUNT(*)." },
    { slug: "immediate-food-delivery-i", why: "Same-day share at order grain — the approve-and-capture-in-one-window rate, the warm-up conditional ratio Visa opens screens with." },
    { slug: "second-highest-salary", why: "The tie trap in miniature — 'second biggest decline code' breaks LIMIT OFFSET exactly where ladders tie; DENSE_RANK is the answer." },
    { slug: "customers-who-never-order", why: "The anti-join warm-up — cardholders acquired but never transacted, the LEFT JOIN + IS NULL shape behind every exposure list." },
  ],
};
