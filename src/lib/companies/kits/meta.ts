// Meta — kit 4 of the Streaming & Social domain (Batch C).
// Feed engagement, the friends graph, and ads delivery with its experiment
// culture: A/B arms, sample-ratio checks, cross-surface dedupe.
// Registry tags 25 sql rows for Meta — the TOPICS and PROBLEMS below draw
// from that tagged pool first (16 of 16 problems, 21 of 30 topic slugs),
// with the remainder theme-curated and marked here.
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md, mapped as: orders = engagement events,
// customers = users, suppliers = creators/Pages, invoices = experiment
// arms with a planned sample, payments = delivery logs, shipped_at =
// event completion.

import type { CompanyKit } from "../types";

export const metaKit: CompanyKit = {
  id: "meta",
  domainId: "media",
  name: "Meta",
  tagline: "Feed engagement, friends graphs, ads delivery",
  accent: "text-sky-400",

  brief: [
    "Meta is the **social-graph company**: a family of apps — Feed, Stories, Reels — where the product is the connections between people and the business is ads delivery against those connections. Engagement is a stack of event types ({orange:impression}, {sky:reaction}, comment, share) fired across multiple surfaces, which creates the data problem Meta is famous for: the same person appears on several surfaces a day, and any honest reach number has to be **deduplicated** across them before it can be said out loud. The other load-bearing institution is the experiment: product changes ship behind A/B arms, and an arm whose {rose:sample ratio} drifts from its plan invalidates every read built on it — detecting that drift is a SQL reflex, not a data-science luxury.",
    "The data org runs **three permanent loops**. The {emerald:engagement loop} watches feed health: events per user, reaction-to-impression rates, session frequency by surface. The {violet:graph loop} treats friendships and follows as first-class data — pairwise, symmetric, and full of self-join questions. The {orange:delivery loop} runs ads and experiments: pacing against plan through the day, delivery logs reconciled against the arms that paid for them, and billing closes where an arm with a planned sample but zero delivery rows is an incident, not a rounding note. In this kit's toy warehouse: orders are engagement events, customers are users, suppliers are creators/Pages, invoices are experiment arms (amount = planned sample), payments are delivery logs, and `shipped_at` is the event completion stamp.",
    "The SQL screens are **integrity checks wearing analytics clothes**. Warmups are two-grain reads — events versus distinct users — because reach is the most-abused word in the building. Middles are conditional folds (the engagement census in one pass, branch sums reconciling to `COUNT(*)`), cross-surface dedupe (`ROW_NUMBER` picking one row per user per day), and {emerald:consecutive-day streak} reads built from gaps and islands. Back ends are the reconciliation gauntlet: `LEFT JOIN + IS NULL` anti-joins for arms with no delivery rows, window shares with PARTITION BY for concentration reads, and the honest-denominator questions where filtering before the ratio quietly rebuilds the population.",
    "Prepare by rehearsing definitions, not syntax. A reach number is deduplicated or it is impressions; a rate's denominator is named or it is wrong; an anti-join is NULL-safe (`NOT EXISTS`, or `LEFT JOIN + IS NULL`) or it is silently empty the day a NULL enters the key set. Drill the window dedupe pattern until 'one row per user per day' is muscle memory, drill the running-sum frame until you can say when `ROWS` beats `RANGE`, and practice stating — before running anything — **what result would falsify the query**. That habit of pre-stating the falsifier is what Meta's interviewers are actually listening for.",
  ],

  dayInLife: [
    "**08:50 —** Experiment triage. Every launch that went live overnight gets an arm-integrity read: sample counts per arm against plan, {rose:sample-ratio checks} computed with the same fold that produced the census, and any mismatch flagged before a single metric is compared across arms — *a ratio-mismatched experiment's lift numbers are fiction* — so the check gates everything downstream. Alongside it, the engagement heartbeat: events per user, reaction and comment folds per surface, each one a conditional aggregate whose branch sums must reconcile against `COUNT(*)` before the numbers move to anyone's dashboard.",
    "**11:30 —** The two deep-dive loops. On the graph side: **pair reads** — users who engaged with each other's content, comment threads folded per post, shared-subscriber counts between Pages — each a self-join with a tie rule and a predicted row count stated before running. On the delivery side: **pacing and reconciliation** — running sums against plan to catch the arm that {orange:overshot} its budget by noon, and the {rose:arms-without-delivery} anti-join that keeps the billing close honest, plus creator (Page) concentration reads where each creator's share is taken WITHIN its region fold, never against a population it doesn't compete in.",
    "**14:45 —** Stakeholder defense. Cross-surface reach goes to a growth review that will argue about the definition — **deduplicated unique users**, not summed surface impressions — so the query ships with its dedupe layer visible: the `ROW_NUMBER` that picked one row per user per day, right in the packet. Experiment readouts go out only with their integrity checks attached; the lift number and the sample-ratio check travel together, or they do not travel.",
    "**17:15 —** The weekly review and the incident culture. Streak and stickiness curves go up on the wall — {emerald:consecutive-day actives}, {sky:DAU/WAU} — with `LAG` and gaps-and-islands under the hood. The closing habit: a mis-defined metric or an unreconciled count is treated like a bug — query diff, definition note, and a postmortem — because at Meta *a number without its query attached is a rumor*. The EOD note lists what shipped, what was held, and which definition changed.",
  ],

  metrics: [
    { name: "DAU/MAU stickiness", what: "Daily actives over monthly actives — the engagement heartbeat. Computing it is a trailing-window DISTINCT-count ratio where the window definition IS the metric." },
    { name: "Feed engagement rate", what: "Reactions plus comments plus shares ÷ impressions. The feed-health headline — a conditional fold whose four branches must reconcile to the census before the ratio is trusted." },
    { name: "Unique reach (deduped)", what: "Distinct users across surfaces — deduplicated, never summed. The number that separates Meta's reporting from every naive sum of surface impressions." },
    { name: "Impressions frequency", what: "Surface impressions ÷ deduplicated reach. Frequency tells you whether reach growth is new people or the same people seeing more — a two-grain division with the dedupe upstream." },
    { name: "Sample ratio mismatch", what: "Observed arm split vs planned split on every experiment, before any lift is read. The integrity gate: a mismatched arm invalidates the comparison it was built for." },
    { name: "Ads pacing breach", what: "Spend vs plan through the day, caught by a running sum and the FIRST breach row. Delivery teams live on this — overspend by noon is an incident, not a daily total." },
    { name: "Page follower growth", what: "New followers per creator/Page per week — the creator-side health read, a grouped fold with the time bucket stated." },
    { name: "Time-to-first-engagement", what: "Lag from a user's first event to their first reaction. The habit-forming read — LAG across the event stream with the NULL first row handled on purpose." },
  ],

  topics: [
    {
      name: "Feed-event aggregation",
      why: "Feed health is a grouped fold: events per day, reports per surface, activity counts with a HAVING bar. Meta probes whether you can aggregate an event stream without letting status filters or fan-out joins quietly rebuild the population.",
      slugs: ["reported-posts", "user-activity-for-the-past-30-days-i", "activity-participants"],
    },
    {
      name: "The two-grain reach census",
      why: "'Events AND distinct users per region' is the reach read that survives review — load versus people, and the ratio between them is intensity. COUNT(*) against COUNT(DISTINCT user) is Meta's most fundamental discipline because summed impressions is the number the company refuses to publish.",
      slugs: ["user-activity-for-the-past-30-days-ii", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Graph pairs & symmetric edges",
      why: "Friendships and interactions are pairwise data: calls between two people, comments per post, mutual edges in the follow graph. The self-join with a.role < b.role halves the symmetric fan-out and excludes self-pairs in one stroke — and the interviewer asks for the predicted row count first.",
      slugs: ["number-of-calls-between-two-persons", "number-of-comments-per-post", "strong-friendship"],
    },
    {
      name: "Streaks & consecutive-day habits",
      why: "Habit is the product: users active N days running, sessions on consecutive dates, platform-hopping streaks. Gaps-and-islands machinery — ROW_NUMBER against the date, GROUP BY the difference — is how Meta counts streaks, and the tie/ordering rules decide who counts.",
      slugs: ["active-users", "report-contiguous-dates", "user-purchase-platform"],
    },
    {
      name: "Experiment ratios & honest denominators",
      why: "Every experiment read is a ratio, and every ratio is only as good as its denominator: sample-ratio checks, report-to-view rates, quality shares. Meta drills 100.0-before-division and the same-fold denominator because an arm mismatch discovered after the lift is read is a scandal, not a bug.",
      slugs: ["ab-sample-ratio-mismatch", "reported-posts-ii", "queries-quality-and-percentage"],
    },
    {
      name: "Behavior windows & stickiness",
      why: "DAU/WAU, return-within-seven-days, last-seen stamps — stickiness is date-window work. Trailing windows, LAG between events and 'latest login' reads all hinge on window definitions and on treating the NULL first row as 'no prior', never as zero.",
      slugs: ["dau-wau-stickiness", "users-with-two-purchases-within-seven-days", "the-latest-login-in-2020"],
    },
    {
      name: "Gaps & islands in event streams",
      why: "Persistent behavior patterns, spiral patterns, consecutive-day islands — Meta's hardest screens stage an event stream, flag boundaries with LAG or ROW_NUMBER, and regroup. The two-stage shape (window in an inner query, gate outside) is the house pattern for every 'how long did the habit last' question.",
      slugs: ["find-users-with-persistent-behavior-patterns", "find-students-with-study-spiral-pattern", "sessionize-events"],
    },
    {
      name: "Reached but never engaged (anti-joins)",
      why: "The funnel's silent population: users who saw the surface and never engaged, accounts with no event at all. LEFT JOIN + IS NULL and its NOT EXISTS twin are the tools — and NOT IN is the trap, because one NULL in the inner key set empties the whole answer.",
      slugs: ["customer-who-visited-but-did-not-transact", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Identity & content hygiene",
      why: "Content validation is a real gate: character limits on posts, email formats on identity, NULL payloads from users who never finished signup. Meta screens warm up with string rules and NULL policy because a join on a dirty key is a silent fan-out nobody catches until the census doubles.",
      slugs: ["invalid-tweets", "find-users-with-valid-e-mails", "employee-bonus"],
    },
    {
      name: "First-session cohorts",
      why: "Growth reads start at the first event: users whose first session landed in a window, next-day retention off that first session, cohort matrices. First-occurrence subqueries plus a join-back are the shape — and the empty-cohort edge case is the follow-up.",
      slugs: ["game-play-analysis-iv", "game-play-analysis-v", "cohort-retention-matrix"],
    },
  ],

  theory: [
    {
      id: "meta-t1",
      q: "The engagement report joins events to users to surfaces. Where do counts go wrong after that chain, and how do you keep the grain honest?",
      a: "At every one-to-many hop. Events to users is many-to-one and safe; the moment the chain touches a table where one event carries multiple rows — delivery logs per arm, reactions per post, items per event — COUNT(*) starts counting the fan-out product and the 'event count' inflates silently. The discipline is to state the grain after each hop: 'events, still events, now delivery rows.' The repairs are purposeful, not reflexive: COUNT(DISTINCT event_id) folds the fan-out back to events for a census, while an aggregate over the fanned grain (SUM of delivery amounts) is correct AS that grain and should be labeled so. The interviewer's tell is whether you predict the row count from the join keys before running — at Meta that prediction is the reach number's credibility.",
      tag: "joins",
    },
    {
      id: "meta-t2",
      q: "You need exactly one row per user per day for the cross-surface dedupe. Which window shape do you reach for, and what are you choosing against?",
      a: "ROW_NUMBER() OVER (PARTITION BY user_id, day ORDER BY timestamp) filtered to = 1 — a deterministic pick of one event per user-day, usually the earliest or the first engagement. The alternatives each fail a different way: COUNT(DISTINCT user_id) dedupes but throws away which row won, so you can't join back attributes; a GROUP BY user-day aggregate answers per-day questions but can't carry event-level columns through; and DENSE_RANK or RANK would keep ties, multiplying rows and re-inflating the reach you just deduplicated. The follow-up is determinism: the ORDER BY inside the window must break ties fully (timestamp, then event id), or the 'same user' can be a different person's event on re-run. At Meta the dedupe layer IS the reach number, so the window is written like production code — deterministic, reviewed, and attached to the packet.",
      tag: "windows",
    },
    {
      id: "meta-t3",
      q: "The engagement census needs reactions, comments, shares and impressions in ONE scan, and the branches must add up to the total. How do you build it so it reconciles?",
      a: "One population, one pass, per-branch conditional aggregates: SUM(CASE WHEN type = 'reaction' THEN 1 ELSE 0 END) — or the FILTER (WHERE …) twin — for each branch, with COUNT(*) beside them as the census. Reconciliation is then structural: branch sums must equal COUNT(*) over the same rows, so a census of 103 events reading 52+30+14+7 is self-auditing, and any 104 means a branch double-counted or the population drifted. The two classic breaks: vocabulary drift, where a branch holds a literal from another table's status column ('paid' on an events table) and reads a silent zero forever; and exhaustiveness gaps, where a new event type lands in the data and no branch catches it — which is why the ELSE arm or the reconciliation identity is non-negotiable. The CASE-SUM twin exists for engines without FILTER; the discipline that matters is one scan, one population, branches that must sum.",
      tag: "aggregation",
    },
    {
      id: "meta-t4",
      q: "Your 'users who never engaged' anti-join returned empty, but you know the population exists. What did NULL do to it?",
      a: "It used NOT IN. x NOT IN (subquery) is defined as x <> every returned value — and the moment the inner set contains one NULL, every comparison is UNKNOWN, the WHERE keeps nothing, and the anti-join reads empty while looking perfectly reasonable. The NULL-safe shapes: NOT EXISTS (SELECT … WHERE e.user_id = u.id) — NULLs can never match an equality join, so they can't poison it — or LEFT JOIN + WHERE right.id IS NULL, which keeps unmatched left rows with NULL payloads and filters on them. The corollary habit: an anti-join result should be sanity-checked against the population it claims to be a subset of, because 'empty' and 'everybody' are both plausible-looking outputs of a broken anti-join. At Meta, where identity columns and optional event fields are routinely NULLable, NOT IN over a subquery is treated as a defect, not a style choice.",
      tag: "nulls",
    },
    {
      id: "meta-t5",
      q: "For the sample-ratio check on an experiment, where does the arm filter live — and why does filtering 'engaged users only' before the check invalidate the whole read?",
      a: "The ratio check is defined over the ASSIGNED population: every user randomized into the experiment, engaged or not. The arm indicator is a row-level fact, so it lives in the conditional aggregate — 100.0 * SUM(CASE WHEN arm = 'B' THEN 1 ELSE 0 END) / COUNT(*) — with COUNT(*) deliberately unfiltered as the denominator. Filter 'engaged only' in WHERE first and the denominator shrinks to whoever engaged, which is arm-correlated by construction: the check then measures engagement, not randomization, and a perfectly healthy assignment can read as a mismatch (or hide a real one). HAVING is the same trap one stage later — it judges groups, never restores discarded rows. The pipeline order is the checklist: the assigned population is fixed at FROM, every later filter is a definition change, and the ratio's numerator and denominator must fold from identical rows.",
      tag: "pipeline",
    },
    {
      id: "meta-t6",
      q: "On the follow graph, when do you reach for EXISTS instead of IN — and what does the correlated version buy you on pairwise questions?",
      a: "EXISTS when the question is about the existence of a relationship and the inner set is large or NULLable. IN materializes the inner list and tests membership (with the NULL trap attached); EXISTS short-circuits on the first matching row and is NULL-safe by construction, because an equality join simply never matches NULL. The correlated form — EXISTS (SELECT 1 FROM follows f2 WHERE f2.follower = u1.id AND f2.followed = u2.id) — buys pairwise logic: mutual-edge detection becomes two EXISTS tests in both directions, 'friends of friends' becomes a nested pair, and second-degree reach becomes an EXISTS whose inner references the outer row. The interviewer's follow-up is cost: correlated EXISTS re-executes per outer row, which is fine when the inner probe is indexed and fatal when it isn't. State the access path — 'probing an index on (follower, followed) per row' — and the answer reads like an engineer's, not a textbook's.",
      tag: "subqueries",
    },
    {
      id: "meta-t7",
      q: "DAU/WAU needs a trailing seven-day distinct-active count per day. How do you build it, and where do the date bugs hide?",
      a: "Two stages. First fold actives per day — COUNT(DISTINCT user_id) GROUP BY the '%Y-%m-%d' bucket from STRFTIME — then in an outer query run a RANGE frame: COUNT(*) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) for row counts, or a self-join/CTE shape when the DISTINCT must re-apply across the seven days (the honest WAU needs DISTINCT users over the window, not summed per-day counts). The classic bugs: summing per-day actives across a week and calling it WAU — double-counting everyone active twice; BETWEEN on timestamps losing the boundary day (half-open ranges instead: >= start AND < start + 7); and text-day arithmetic that breaks when the bucket format isn't ISO. And the first six days of the series have partial windows — ship them labeled, not silently averaged into the trend. At Meta the window definition IS the KPI, so the frame clause is quoted in the metric's documentation, not just the query.",
      tag: "dates",
    },
    {
      id: "meta-t8",
      q: "The billing close found an arm marked complete with zero delivery rows, and a voided arm with a settled payment. What class of query surfaces both, and what guard keeps it honest?",
      a: "Both are integrity anti-joins with status in the breakdown: arms LEFT JOIN delivery logs, filtered to zero matches (right.id IS NULL), grouped by arm status — so the complete-but-undelivered arm cannot hide inside the healthy bucket, and its planned sample rides beside it in dollars. The void-but-paid mirror needs the opposite read (arms WITH delivery rows but a void status), which is why the close runs both directions: unmatched-left and matched-but-wrong-status. The guards that keep it honest: the amount conversion stated once (integer cents over 100.0), the definition — 'ghost = zero delivery rows, regardless of status' — written into the memo, and a reconciliation identity (ghost count plus matched count must equal the arm census) asserted in the same query. At Meta this is the delivery-integrity round in miniature: the SQL is easy, and the interview is really testing whether you refuse to let status labels vouch for themselves.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "meta-mcq-1",
      prompt: "27 delivery rows settle 28 experiment arms — some arms paid in several rows. Which join still lists every arm, delivery or not?",
      choices: [
        "INNER JOIN",
        "LEFT JOIN from arms to delivery rows",
        "RIGHT JOIN from arms to delivery rows",
        "CROSS JOIN",
      ],
      answer: 1,
      why: "The coverage check must keep unmatched arms — they arrive with NULL delivery columns, which is exactly what the IS NULL filter reads later. INNER drops the six arms with no delivery rows; RIGHT lists deliveries, not arms.",
      notes: [
        { choice: 0, why: "INNER keeps only matched pairs — the six ghost arms vanish, and the close ships blind to them." },
        { choice: 3, why: "CROSS JOIN pairs every arm with every delivery row — 756 rows of noise and a fan-out no GROUP BY can honestly repair." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-2",
      prompt: "The event store's status column knows exactly four values. Which literal is one of them?",
      choices: ["'paid'", "'void'", "'delivered'", "'open'"],
      answer: 2,
      why: "'delivered' is an event-store state (52 of 103 events). 'paid', 'void' and 'open' live on the experiment-arm table — a branch holding any of them against events reads a silent zero forever.",
      notes: [
        { choice: 0, why: "'paid' is arm vocabulary. Cross-table status mix-ups are the most common silent-zero bug in reconciliation queries." },
        { choice: 3, why: "'open' belongs to arms too — on the event side it matches nothing, and the branch quietly reports an empty queue." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-3",
      prompt: "`SELECT a.id FROM arms a LEFT JOIN deliveries d ON d.arm_id = a.id WHERE d.method = 'card'` — what silently happened?",
      choices: [
        "Nothing — LEFT JOIN keeps every arm",
        "The WHERE turned it into an INNER JOIN and dropped every arm with no card delivery",
        "It now returns only wire-delivered arms",
        "Arms with multiple card deliveries are deduplicated automatically",
      ],
      answer: 1,
      why: "Filtering the right table's column in WHERE kills the NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER. Arms with no card delivery — including no delivery at all — disappear, and the query still looks correct.",
      notes: [
        { choice: 0, why: "The LEFT-ness survives only in the ON clause. Any WHERE on the right table's column reinstates INNER semantics." },
        { choice: 2, why: "Wire arms also fail the card test — but the bigger casualty is every arm with zero deliveries, which the LEFT JOIN existed to keep." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-4",
      prompt: "Dedupe across surfaces: exactly one row per user per day. Which shape delivers it?",
      choices: [
        "SELECT DISTINCT user_id, day FROM events",
        "ROW_NUMBER() OVER (PARTITION BY user_id, day ORDER BY ts, id) = 1 in an outer filter",
        "GROUP BY user_id with COUNT(*) = 1",
        "COUNT(DISTINCT day) per user",
      ],
      answer: 1,
      why: "The window picks a deterministic winner per user-day while keeping that row's columns — the dedupe layer that reach reports are built on. Ties are broken fully (ts, then id) so re-runs pick the same row.",
      notes: [
        { choice: 0, why: "DISTINCT collapses to the user-day key and throws away every event column — you get the grain but lose the row you'd join back." },
        { choice: 2, why: "That filters groups to exactly one event — the opposite ask: it keeps users with a single event, discarding everyone the dedupe exists to fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-5",
      prompt: "`WHERE user_id NOT IN (SELECT user_id FROM deliveries WHERE matched = 1)` — the inner query can return NULL. The result is…",
      choices: [
        "All users without a matched delivery",
        "Empty — every comparison is UNKNOWN once NULL enters the set",
        "An error — NOT IN forbids NULLs",
        "Only the users whose id is NULL",
      ],
      answer: 1,
      why: "NOT IN is defined as 'not equal to every value in the set', and x <> NULL is UNKNOWN — with one NULL inside, no row survives. The NULL-safe twins: NOT EXISTS, or LEFT JOIN + IS NULL.",
      notes: [
        { choice: 0, why: "That's what it returns on a NULL-free day. The bug is that one NULL — say, a delivery row with an unmatched arm id — silently empties the whole answer." },
        { choice: 2, why: "It runs without complaint, which is exactly why this trap ships to production: the failure mode is a plausible empty table, not an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-6",
      prompt: "An experiment assigned 103 users; 52 landed in arm B. Which expression reports arm B's sample share?",
      choices: [
        "SUM(arm = 'B') * 100 / COUNT(*)",
        "100.0 * SUM(CASE WHEN arm = 'B' THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(arm = 'B') * 100.0 / 103",
        "100.0 * COUNT(DISTINCT arm) / COUNT(*)",
      ],
      answer: 1,
      why: "The conditional sum counts arm-B rows at the same fold as COUNT(*) counts the assigned population, and 100.0 promotes real division: 50.49 — the split the SRM check compares against plan.",
      notes: [
        { choice: 0, why: "SQLite reads the boolean as 0/1, but INTEGER 100 forces integer division first: 5200/103 truncates to 50 — off by half a point on the check that gates the experiment." },
        { choice: 3, why: "COUNT(DISTINCT arm) counts distinct arm labels — with two arms that's 2, so the expression reads ~2% regardless of the actual split." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-7",
      prompt: "Arms JOIN delivery rows fans 28 arms to 27+ rows per payment split. `SUM(a.planned_sample)` after that join reads…",
      choices: [
        "The true planned total — joins never affect sums",
        "Inflated — every split arm's planned sample counts once per delivery row",
        "Deflated — the join loses unmatched arms",
        "Zero — SUM skips all joined columns",
      ],
      answer: 1,
      why: "The fan-out multiplies each split arm's planned sample by its delivery-row count, so the sum drifts upward in proportion to splitting. The repair is to aggregate deliveries first (derived table, one row per arm) or take COUNT(DISTINCT arm_id) for counts — never SUM over the fanned grain.",
      notes: [
        { choice: 0, why: "Sums inherit the join's grain. The five split arms in this db each double their planned sample — a billing total nobody can reconcile." },
        { choice: 2, why: "Deflation would need an INNER join dropping arms; the inflation here comes from rows ADDED by splits — direction matters when you diagnose." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-8",
      prompt: "A running total of delivered arms per day: `SUM(n) OVER (ORDER BY day)` — two days tie on the same day value. What does the default frame do?",
      choices: [
        "RANGE: the tie days share one running total — both include each other's rows",
        "ROWS: the tie days get strictly sequential totals",
        "The default frame errors on ties",
        "Ties are deduplicated before the frame applies",
      ],
      answer: 0,
      why: "The default frame is RANGE between UNBOUNDED PRECEDING and CURRENT ROW, and RANGE includes peer rows — tie days absorb each other. For row-sequential running totals you must say ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW explicitly.",
      notes: [
        { choice: 1, why: "That's what you'd GET by writing ROWS — but the default is RANGE, and the tie day's total quietly double-counts its twin." },
        { choice: 3, why: "Windows never deduplicate. Peers are peers; the frame definition decides whether they ride together." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-9",
      prompt: "Consecutive-day streaks: you flag island starts with `day - ROW_NUMBER() OVER (ORDER BY day)`. What is that expression for?",
      choices: [
        "The number of active days in the streak",
        "A constant within each run of consecutive days — the GROUP BY key that builds the islands",
        "The gap length to the next session",
        "The user's total active days",
      ],
      answer: 1,
      why: "Across consecutive days, day increments by exactly 1 while ROW_NUMBER does too — so their difference is invariant inside an island and jumps at every gap. GROUP BY that value and each group is one streak, ready for MIN/MAX/COUNT.",
      notes: [
        { choice: 0, why: "Streak length is COUNT(*) per island group — the difference expression is the grouping key, not the length." },
        { choice: 2, why: "Gap length is the LAG of day (or the change in the difference) — a different computation that happens to live in the same query." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-10",
      prompt: "EU logged 45 events from 8 users. Which column belongs in the reach report's 'unique reach' field?",
      choices: [
        "COUNT(*) — 45",
        "COUNT(DISTINCT customer_id) — 8",
        "SUM(customer_id) / 45",
        "COUNT(customer_id) — also 45",
      ],
      answer: 1,
      why: "Unique reach is people, not load: COUNT(DISTINCT customer_id) folds repeat events back to 8 users. The 45 is impressions — a different field — and the 45÷8 gap is frequency, a third metric with its own column.",
      notes: [
        { choice: 0, why: "45 is the impressions field. Publishing it as reach is the exact conflation Meta's dedupe discipline exists to prevent." },
        { choice: 2, why: "SUM of ids is meaningless arithmetic — ids are labels, not quantities." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-meta-1",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The ghost experiment arms",
      brief:
        "Meta-flavored brief on the storefront db: the experiment-platform integrity memo. Arms (invoices) carry a planned sample; delivery rows (payments) are the logs that must land against them; the close ships only when the ghost list is explained. Probed facts: 28 arms split open 6 (19609) / paid 21 (66443) / void 1 (925); six arms totaling 15217 have NO delivery rows at all — and one of them, arm #28, is marked COMPLETE while carrying 1756 with zero delivery rows, while arm #25 shows the opposite scar (4000 of its 6148 delivered). The definition is fixed and unforgiving: a ghost is an arm with ZERO delivery rows, regardless of its status — status is precisely what the breakdown must expose, not what it may assume.",
      ask: "Group the ghost arms by arm status: status, ghost count, and planned sample in dollars (2 decimals).",
      template:
        "SELECT i.status,\n       {1}(*) AS ghost_arms,\n       ROUND(SUM(i.amount_cents) / {2}, 2) AS planned_dollars\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {4}\nGROUP BY i.status;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the arm counter",
          why: "COUNT(*) folds the surviving arm rows per status — five open ghosts, one paid. SUM(*) doesn't exist, and MAX(*) would report one arm per status, not the census the close needs.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Arm amounts are stored in integer cents, so the dollar read divides by 100.0 — the REAL literal, not 10 or 1000, or the planned sample ships off by a factor of ten or a thousand.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-the-arms join",
          why: "LEFT JOIN keeps every arm, matched or not, and hands unmatched arms NULL delivery columns — the raw material the IS NULL filter reads. INNER would drop the ghosts before the filter could see them, and the close would ship clean and wrong.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the zero-delivery test",
          why: "p.id IS NULL keeps exactly the arms no delivery row ever matched — the ghost definition. NOT NULL flips the query to the matched population (and surfaces the void-but-paid scar from the other side).",
        },
      ],
      distractors: ["SUM", "INNER", "NOT NULL", "10", "1000"],
      walkthrough:
        "An anti-join wearing a GROUP BY. The LEFT JOIN keeps all 28 arms; the six with no delivery row survive the IS NULL filter with NULL payloads, and the status breakdown lands the punch: five open ghosts carrying the bulk of the 15217, plus ONE arm marked paid — #28, the 1756 the platform says is complete and the delivery logs say never happened. That paid-status ghost is the fire: the definition ('ghost regardless of status') exists precisely so a complete label cannot vouch for itself, and the mirror anomaly — #11, a voided arm whose 925 DID settle — is what the NOT NULL variant of this same query surfaces from the other side. The money discipline rides in the divisor: integer cents over 100.0, and the wrong divisor (10, 1000) prints a planned sample off by an order of magnitude while looking perfectly formatted. INNER empties the read entirely — six ghosts in, zero out, close shipped. Ghost count plus matched count must equal the 28-arm census; the query asserts it, so the close can defend it.",
    },
    {
      id: "cs-meta-2",
      tier: "hard",
      topic: "t6",
      universe: "supplier",
      title: "Creator concentration within the region fold",
      brief:
        "Meta-flavored brief on the storefront db: the creator-ops concentration read. Six creator surfaces earn partner revenue through the platform; the payout review wants each creator's share WITHIN its audience region, because a creator competing against one regional peer and a creator competing against none are different stories. Probed facts: Nordic Gadgets AB earns 11130.25 — 32% of ALL platform revenue — with Midwest Hardware Co at 9294.93 (26.7%) and Alpine Audio GmbH at 4765.63 (13.7%); the only multi-creator regions are EU (Nordic 11130.25 + Alpine 4765.63) and APAC (Shenzhen Electro 3049.07 + Pacific Textiles 2980.15). The definition is fixed: share of the creator's REGIONAL fold — the window partitions by region and never sorts cumulatively.",
      ask: "Return every creator with revenue (2 decimals) and its share of its region's revenue (1 decimal), regions alphabetical, biggest revenue first.",
      template:
        "WITH surface AS (\n  SELECT s.name AS name,\n         s.region AS region,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY s.id\n)\nSELECT name,\n       region,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER ({1} BY region), {2}) AS surface_share\nFROM surface\nORDER BY region, revenue {3};",
      slots: [
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the regional denominator",
          why: "PARTITION BY region resets the revenue fold at each region border, so the denominator is the creator's regional peer group. ORDER would run a cumulative share down the sorted table — a running number that answers a question nobody asked.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share's decimal",
          noVerify: true,
          why: "The review reads shares to one decimal: the APAC pair's 50.6 versus 49.4 is the only place the decimal carries signal — the EU pair rounds to 70/30 and the single-creator regions print 100 either way.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Within each region the biggest creator reads first — Nordic above Alpine, Shenzhen above Pacific. ASC would open the EU block with Alpine's 4765.63, a correct query aimed at the wrong end of the leaderboard.",
        },
      ],
      distractors: ["ORDER", "ASC", "0", "2"],
      walkthrough:
        "A window over a fold — two stages, one statement. The CTE folds 251 order lines to one revenue row per creator through the supplier → product → line-item chain: Nordic 11130.25, Midwest 9294.93, Alpine 4765.63, Andes 3613.25, Shenzhen 3049.07, Pacific 2980.15 — the probed supplier figures, cell for cell. The outer query then divides each creator by its regional fold: PARTITION BY region makes EU's denominator 15895.88 (Nordic reads 70, Alpine 30), APAC's 6029.22 (50.6 versus 49.4 — the near-even split that one decimal exists to show), and the single-creator regions print 100 because dividing by yourself is the definition of a monopoly read. The distractor that ships the wrong report is ORDER inside OVER: it produces a cumulative running share down the sorted rows — 50.8, 21.7, 14.1, 26.7 — plausible numbers that answer 'share of everything so far', a question no payout review ever asked. The context flip is the point: Nordic is 32% of the platform but 70% of its region; both are true, and only the partition says which peer group a number is competing in.",
    },
  ],

  problems: [
    { slug: "ab-sample-ratio-mismatch", why: "The SRM gate: observed arm split against plan — the integrity check Meta runs before any experiment metric is believed." },
    { slug: "dau-wau-stickiness", why: "Trailing-window actives per day — the DAU/WAU stickiness read whose window definition IS the KPI." },
    { slug: "user-purchase-platform", why: "Streaks across two surfaces per user — cross-surface habit detection, the dedupe-adjacent window read Meta screens love." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over consecutive dates — outage windows and streak spans, grouped by the row-number-minus-day trick." },
    { slug: "find-emotionally-consistent-users", why: "Users whose behavior holds steady across windows — the consistency pattern read, staged through windows over aggregates." },
    { slug: "find-users-with-persistent-behavior-patterns", why: "Multi-window persistence flags per user — the hard gaps-and-islands shape behind 'is this habit real' questions." },
    { slug: "number-of-comments-per-post", why: "Self-join comment trees folded per post — the thread-count read with a LEFT JOIN so silent posts still appear." },
    { slug: "number-of-calls-between-two-persons", why: "Symmetric pair aggregation with the a < b canonicalization — the friends-graph pairing rule that halves fan-out." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Reached-but-never-engaged anti-join — the funnel's silent population, counted with LEFT JOIN + IS NULL." },
    { slug: "reported-posts-ii", why: "A report-to-view ratio with honest rounding — the content-health rate whose denominator must be stated before it ships." },
    { slug: "the-latest-login-in-2020", why: "Latest-event-per-user with a date filter — the last-seen read that powers re-engagement audiences." },
    { slug: "invalid-tweets", why: "Character-limit validation on content — the hygiene gate that keeps a dirty post from joining into the census twice." },
    { slug: "find-users-with-valid-e-mails", why: "Pattern-matched identity validation — the email-format gate before any user-level join is trusted." },
    { slug: "game-play-analysis-iv", why: "First-event subquery plus join-back — the first-session cohort definition, computed rather than asserted." },
    { slug: "budget-pacing", why: "Running spend against plan with the first breach flagged — the ads-pacing read whose ROWS frame and MIN-index decide what 'first' means." },
    { slug: "rectangle-area", why: "Non-equi join pairing — targeting-window overlap reads where the join condition is a range, not a key." },
  ],
};
