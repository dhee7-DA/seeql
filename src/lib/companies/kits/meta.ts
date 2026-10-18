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
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Meta data teams rehearse most: the ghost-arm reconciliation, the creator concentration within the region fold, the engaged-users-never-randomized audit, the delivery pacing read with its first-breach row, the surface-status pivot, and the split-arm method ledger. Run each on the live storefront database, then re-run a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool**, the **thirty MCQs** and the **twenty-four theory prompts** below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'what result would falsify this query' follow-up tests.",
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
      slugs: ["reported-posts", "user-activity-for-the-past-30-days-i", "activity-participants", "keep-latest-dedupe", "usage-tier-percentiles"],
    },
    {
      name: "The two-grain reach census",
      why: "'Events AND distinct users per region' is the reach read that survives review — load versus people, and the ratio between them is intensity. COUNT(*) against COUNT(DISTINCT user) is Meta's most fundamental discipline because summed impressions is the number the company refuses to publish.",
      slugs: ["user-activity-for-the-past-30-days-ii", "daily-leads-and-partners", "find-followers-count", "rolling-7d-actives"],
    },
    {
      name: "Graph pairs & symmetric edges",
      why: "Friendships and interactions are pairwise data: calls between two people, comments per post, mutual edges in the follow graph. The self-join with a.role < b.role halves the symmetric fan-out and excludes self-pairs in one stroke — and the interviewer asks for the predicted row count first.",
      slugs: ["number-of-calls-between-two-persons", "number-of-comments-per-post", "strong-friendship", "symmetric-pairs", "all-the-pairs-with-the-maximum-number-of-common-followers", "page-recommendations", "friend-requests-ii-who-has-the-most-friends"],
    },
    {
      name: "Streaks & consecutive-day habits",
      why: "Habit is the product: users active N days running, sessions on consecutive dates, platform-hopping streaks. Gaps-and-islands machinery — ROW_NUMBER against the date, GROUP BY the difference — is how Meta counts streaks, and the tie/ordering rules decide who counts.",
      slugs: ["active-users", "report-contiguous-dates", "user-purchase-platform"],
    },
    {
      name: "Experiment ratios & honest denominators",
      why: "Every experiment read is a ratio, and every ratio is only as good as its denominator: sample-ratio checks, report-to-view rates, quality shares. Meta drills 100.0-before-division and the same-fold denominator because an arm mismatch discovered after the lift is read is a scandal, not a bug.",
      slugs: ["ab-sample-ratio-mismatch", "reported-posts-ii", "queries-quality-and-percentage", "card-launch-success", "roas-by-campaign", "friend-requests-i-overall-acceptance-rate"],
    },
    {
      name: "Behavior windows & stickiness",
      why: "DAU/WAU, return-within-seven-days, last-seen stamps — stickiness is date-window work. Trailing windows, LAG between events and 'latest login' reads all hinge on window definitions and on treating the NULL first row as 'no prior', never as zero.",
      slugs: ["dau-wau-stickiness", "users-with-two-purchases-within-seven-days", "the-latest-login-in-2020", "week-over-week-churn"],
    },
    {
      name: "Gaps & islands in event streams",
      why: "Persistent behavior patterns, spiral patterns, consecutive-day islands — Meta's hardest screens stage an event stream, flag boundaries with LAG or ROW_NUMBER, and regroup. The two-stage shape (window in an inner query, gate outside) is the house pattern for every 'how long did the habit last' question.",
      slugs: ["find-users-with-persistent-behavior-patterns", "find-students-with-study-spiral-pattern", "sessionize-events"],
    },
    {
      name: "Reached but never engaged (anti-joins)",
      why: "The funnel's silent population: users who saw the surface and never engaged, accounts with no event at all. LEFT JOIN + IS NULL and its NOT EXISTS twin are the tools — and NOT IN is the trap, because one NULL in the inner key set empties the whole answer.",
      slugs: ["customer-who-visited-but-did-not-transact", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream", "ads-funnel", "friends-with-no-mutual-friends", "email-engagement-funnel"],
    },
    {
      name: "Identity & content hygiene",
      why: "Content validation is a real gate: character limits on posts, email formats on identity, NULL payloads from users who never finished signup. Meta screens warm up with string rules and NULL policy because a join on a dirty key is a silent fan-out nobody catches until the census doubles.",
      slugs: ["invalid-tweets", "find-users-with-valid-e-mails", "employee-bonus"],
    },
    {
      name: "First-session cohorts",
      why: "Growth reads start at the first event: users whose first session landed in a window, next-day retention off that first session, cohort matrices. First-occurrence subqueries plus a join-back are the shape — and the empty-cohort edge case is the follow-up.",
      slugs: ["game-play-analysis-iv", "game-play-analysis-v", "cohort-retention-matrix", "growth-accounting", "second-day-confirmation"],
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
    {
      id: "meta-t9",
      q: "The pacing report's running spend double-counts on the day two delivery rows share. ROWS or RANGE — what is each frame promising?",
      a: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE operates on VALUES: every peer row — everything the ORDER BY key ties with — is inside the frame together, so tie days absorb each other and each prints the combined total. ROWS operates on POSITIONS: strictly one row at a time, each running total including exactly the physical rows above it. The delivery rule: when the ORDER BY key is unique (a deduplicated day, an id), the two frames agree and the choice is documentation; the moment the key can repeat — raw payment rows on the same paid_on, tied spend days — ROWS is the only frame that keeps the running total reconcilable, and the pacing breach you flag at noon has to survive the audit at five. The frame clause is part of the metric's definition; it ships in the query text and in the metric's README, never in tribal memory.",
      tag: "windows",
    },
    {
      id: "meta-t10",
      q: "The engagement census has four branches, and next quarter the platform ships a fifth event type. How does the query survive?",
      a: "It survives by design, not by luck. Make the branches either exhaustive — every event type in its own CASE arm, with an ELSE arm that catches anything new — or intentionally partial, with the remainder computed as COUNT(*) minus the named branches and labeled 'other' in the output. A new event type then lands visibly: in the ELSE arm, or swelling the 'other' remainder, instead of evaporating between branches while the totals still reconcile (branch sums equal COUNT(*) over the same population — the identity that makes a census self-auditing). The cultural half is the schema event: at Meta a new event type is a definition change that ships with a query change and a note, never a silent six-hour window where the census undercounts. The interviewer is probing whether you treat the ELSE arm as an alarm wire, not a tidy-up.",
      tag: "aggregation",
    },
    {
      id: "meta-t11",
      q: "DAU/WAU: why can't you sum the seven daily active counts and call it WAU, and how do you build the honest version?",
      a: "Because the daily counts are DISTINCT-within-day: a user active Monday and Wednesday contributes 2 to the sum but 1 to the weekly unique population — the summed figure overcounts every multi-day user and drifts upward with engagement frequency, which is exactly the variable the metric is supposed to measure. The honest WAU re-applies DISTINCT across the whole window: fold user-days first (one row per user per day), then COUNT(DISTINCT user_id) over the seven-day frame — a self-join, a CTE of user-days, or a window over the fold, never a sum of per-day counts. The follow-ups write themselves: the first six days of any series have partial windows (ship them labeled), half-open ranges only (>= start AND < start+7, because BETWEEN on timestamps amputates the boundary day), and the window definition IS the KPI — it goes in the metric's documentation verbatim.",
      tag: "dates",
    },
    {
      id: "meta-t12",
      q: "On the friends graph, why does every pair read start with `a.user1_id < a.user2_id` — and what number do you state before running it?",
      a: "Because the edge is UNORDERED: (Ana, Ben) and (Ben, Ana) are the same friendship, and a self-join without the inequality emits both orientations plus every (A,A) self-pair — noise that doubles counts and invents self-friendships. The `<` keeps exactly one canonical orientation and kills self-pairs in one stroke. The prediction discipline is the real interview move: if a user has n friends, they appear in n·(n−1)/2 pairs — 8 friends is 28 pairs, and predicting 28 before running proves the fan-out was understood. From there the graph reads build naturally: pair the rows, GROUP BY the pair, COUNT the shared attribute (mutual friends, shared Pages, co-engagement) — and dedupe any second-degree expansion with COUNT(DISTINCT), because one friend-of-friend reachable through two paths is still one human. Reach numbers live or die on that dedupe.",
      tag: "joins",
    },
    {
      id: "meta-t13",
      q: "EXISTS or IN for the graph probes — 'does this user follow that Page', 'friends-of-friends'? Walk me through the trade. ",
      a: "EXISTS is a correlated probe: it short-circuits on the first matching row and never materializes the inner set, and because its test is an equality join it is NULL-safe by construction — a NULL follower id simply never matches, so the trap NOT IN carries cannot exist. IN builds the whole list once and tests membership — often cheaper when the list is small, reused, and clean. The graph uses lean toward EXISTS because the questions are existence questions ('is there an edge', 'is there any mutual path') and the inner sets are the big edge tables: probing the index on (follower, followed) per outer row beats materializing millions of ids. Friends-of-friends composes as nested EXISTS — an edge from u1 to a middle node, an edge from the middle to u2, middle excluded from the endpoints — and the correlated form is what makes the middle node reference the outer rows at all. State the access path and the cost, and the answer reads like an engineer's.",
      tag: "subqueries",
    },
    {
      id: "meta-t14",
      q: "COALESCE and NULLIF in a delivery report — where does each belong, and which use is a lie?",
      a: "COALESCE is a display policy: 'print — for arms with no delivery method' wraps the column at the outermost stage and touches nothing upstream. That's the honest use. The lie is COALESCE as data repair: COALESCE(delivery_amount, 0) turns an arm with no delivery rows into an arm that delivered zero — but 'no delivery' and 'delivered nothing' are different facts, and the billing close exists precisely because that distinction is load-bearing. NULLIF is the division guard: NULLIF(denominator, 0) turns a zero denominator into NULL so a rate prints NULL — no data — instead of erroring; whether the report renders that NULL as '—' or as 0 is a definition someone states, not an accident someone inherits. The one-line rule the interviewer wants: NULL is a state to report, a zero to fabricate never — and the display layer is the only place substitution is allowed.",
      tag: "nulls",
    },
    {
      id: "meta-t15",
      q: "The targeting read needs users split into spend quartiles, then the top decile flagged separately. How do the window functions map to each?",
      a: "Two different questions, two different tools. Equal-sized audiences: NTILE(4) OVER (ORDER BY spend DESC) deals rows into four as-even-as-possible buckets — the quartile read where bucket SIZES are the point, and the caveat is that ties at a boundary split arbitrarily because NTILE is a row dealer, not a value tier. Value-honest tiers: CUME_DIST() OVER (ORDER BY spend) gives each row the share of rows at or below it, so 'top decile' is CUME_DIST > 0.9 — and tied spenders share the same value, landing in the same tier together, which is the honest behavior when the tier is a definition. The follow-up is determinism: NTILE needs a full tie-break in the OVER or re-runs reshuffle the buckets; CUME_DIST needs no tie-break because ties agree by construction. Saying 'NTILE for audience slices, CUME_DIST for thresholds' covers the question and its trap.",
      tag: "windows",
    },
    {
      id: "meta-t16",
      q: "The weekly report computes five metrics off the same event fold. One CTE or five subqueries — how do you stage it?",
      a: "One named fold, referenced by everything downstream: WITH events_folded AS (the dedupe layer, the filters, the per-entity grain — stated once), then the outer SELECT computes the five metrics off the fold. The alternative — repeating the same subquery five times — re-runs the logic five ways, and the day one copy gets edited, the metrics disagree with each other and the report becomes a reconciliation incident. The staging rules: name each stage for its grain ('user_days', 'arm_integrity'), keep transformations one stage each so a diff reviews cleanly, and promote a stage to a view when it's a shared definition the whole org should query identically. The interviewer's probe is the failure mode: the five-subquery version doesn't fail loudly — it drifts quietly, metric by metric, until two dashboards disagree. Staging is consistency engineering, not style.",
      tag: "pipeline",
    },
    {
      id: "meta-t17",
      q: "The billing close wants each arm's payment methods in one cell — 'card, wire'. How do you build it, and what does the string cell cost you?",
      a: "GROUP_CONCAT(method, ', ') with GROUP BY arm folds each arm's payment rows into one text cell — the method stack that makes a split-payment arm readable at a glance. The cautions are real: the concatenation order is engine-dependent unless the dialect supports ORDER BY inside the aggregate, so the cell is an unordered roster — quote 'card and wire both present', never 'card then wire', from this shape alone; numeric values need CAST to text; and the fold destroys the rows — you cannot aggregate the cell further or join back to the individual payments, so it belongs at the outermost stage. The deeper interview point: the string cell is a presentation of the GROUP BY, not a substitute for it — the count of payment rows and the SUM of amounts still come from the same fold, and they travel beside the cell so the stack reconciles.",
      tag: "aggregation",
    },
    {
      id: "meta-t18",
      q: "An experiment's arms read 52 and 51 on a planned 50/50 split of 103. Is that an SRM? What exactly does the SQL owe the check?",
      a: "You can't tell by eyeballing — and that's the point. The SQL's job is the honest OBSERVED split per arm over the assigned population: 100.0 * SUM(CASE WHEN arm = 'B' THEN 1 ELSE 0 END) / COUNT(*), with COUNT(*) deliberately unfiltered — 50.49 versus 49.51 here. Whether 52/51 on 103 is a mismatch is a statistics question (a chi-square or binomial test against the planned ratio, with a threshold agreed before the experiment ships), not a query question; the query that filters to 'engaged users only' first has already corrupted the check by making the denominator arm-correlated. What the SQL also owes: the split computed the same way every time (one definition, versioned), the planned ratio stored beside the observed one, and the check GATING the lift read — no cross-arm comparison ships until the ratio passes. Saying 'the query produces the evidence; the threshold decides' is the answer that lands.",
      tag: "quality",
    },
    {
      id: "meta-t19",
      q: "SUM(arm.planned_sample) inflated after joining arms to delivery logs. Walk me through the repairs and why money has fewer options than counts.",
      a: "The inflation is grain: an arm that paid in two delivery rows contributes its planned sample twice after the join. The repairs, worst to best. SUM(DISTINCT planned_sample) is the trap that looks like a fix — it deduplicates VALUES, and two arms legitimately planned at the same 500.00 fold into one, silently understating the total; DISTINCT on money is never safe. COUNT(DISTINCT arm_id) is safe for counts because ids are unique. For sums, pre-aggregate: fold deliveries to one row per arm in a derived table (row count, delivered total), then join THAT to the arms and SUM once at the arm grain. The general law: COUNT survives fan-out via DISTINCT on a unique key; SUM never does, because values collide. Say 'the fold comes before the join when money is involved' and the grain reflex is proven.",
      tag: "joins",
    },
    {
      id: "meta-t20",
      q: "LAG(state, 1, 0) — what did the third argument change, and when is the zero honest?",
      a: "The third argument replaces the NULL that the first row of the frame would otherwise carry: the first day reads 'previous state = 0' instead of 'no previous row'. Honest when zero is the true baseline — a running-spend-versus-plan read where nothing had been delivered before day one is a fact, and the 0 is that fact. Fabricated when the first row simply has no predecessor: a state-transition analysis that reads day one as 'transitioned from 0' invents a transition that never happened, and the session-decay curve gains a phantom first step. The default NULL is the honest answer — 'no prior row' — and the report should render it as '—' or 'n/a', not coerce it. The deeper point: every window has a first row, the first row is a policy decision, and stating the policy ('the first day has no prior state') is part of shipping the metric, the same way the denominator is.",
      tag: "windows",
    },
    {
      id: "meta-t21",
      q: "The trailing-7-day active read loses the boundary day every week. What's the bug, and what's the house rule?",
      a: "The filter was BETWEEN date('now','-7 days') AND date('now'), and the stamps are datetimes: 'now' with a time component is later than the midnight the BETWEEN endpoint parses to, so today's events up to 23:59 fall outside. The house rule is half-open ranges: >= start AND < start + 7 — inclusive lower bound, exclusive upper bound, window complete regardless of stamp granularity. The same rule powers month closes (>= '2024-03-01' AND < '2024-04-01'), cohort windows, and every 'last N days' read in the building. BETWEEN survives only when both endpoints are exactly the compared datatype — bare dates against bare dates — and the day a timestamp enters the column, BETWEEN starts silently amputating. State the boundary policy in review ('inclusive start, exclusive end') and the metric survives its first timezone; don't, and the weekly read loses a day every week while looking stable.",
      tag: "dates",
    },
    {
      id: "meta-t22",
      q: "Keep-latest dedupe: one row per user, the most recent event. Compare the three shapes — ROW_NUMBER, MAX-stamp join-back, NOT EXISTS.",
      a: "Three honest shapes, different costs. ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY stamp DESC, event_id DESC) filtered to = 1: one pass, deterministic with a full tie-break, keeps the winning row's columns — the default when the dedupe layer feeds a report. MAX(stamp) per user in a derived table, joined back on user and stamp: two stages, but the join-back breaks when one user has two events on the same max stamp — unless the join keys include a tie-break, it can re-inflate the very rows you deduped. NOT EXISTS (a later row for the same user): NULL-safe and index-friendly, reads as prose ('keep the event for which no later event exists'), but re-probes per row. The interview's follow-up is determinism: every shape must name its tie-breaker (stamp, then event id), because 'the latest' is only a definition when ties resolve the same way on every run. Reach reporting is dedupe reporting; the dedupe layer is written like production code.",
      tag: "subqueries",
    },
    {
      id: "meta-t23",
      q: "In the ghost-arm filter, why is it COUNT(p.id) = 0 and never COUNT(*) = 0 — and what does each count after a LEFT JOIN?",
      a: "After the LEFT JOIN, every arm row exists at least once: matched arms carry delivery payloads, and ghost arms carry one row of NULLs. COUNT(*) counts ROWS — it reads 1 for a ghost arm, so COUNT(*) = 0 matches nothing and the ghost list comes back empty while looking correct. COUNT(p.id) counts NON-NULL VALUES of the delivery row's id — 0 for a ghost, 1+ for a matched arm — so COUNT(p.id) = 0 is the ghost test. The same logic powers the mirror: COUNT(p.id) > 0 with a void status surfaces the void-but-paid scar from the other side. The general law: after a LEFT JOIN, COUNT(*) counts the preservation, COUNT(right.key) counts the match — and the anti-join filter must count the match, never the preservation. It's a two-character bug that empties an integrity report, which is why the reviewer asks for the column inside the COUNT, out loud, every time.",
      tag: "nulls",
    },
    {
      id: "meta-t24",
      q: "The sample-ratio check passed but the definition of 'assigned' quietly changed mid-experiment. How does Meta catch that, and what ships with the readout?",
      a: "Through the paper trail, not through the number — a drifted definition can pass every ratio check while invalidating the comparison. The catch is versioning: the assignment query is a versioned artifact in the query library, the readout cites the version it ran against, and any edit to 'assigned' (a new filter, a rescope to a surface) bumps the version and re-randomization review. What ships with the readout: the SRM check WITH its observed split and planned ratio, the assignment version, the denominators of every rate stated in prose, and the falsifier — 'if arm B's sample share leaves the agreed band, this readout is void' — pre-stated before the lift is read. The culture line the interviewer listens for: a number without its query and version attached is a rumor; an experiment whose integrity checks don't travel with its metrics is a rumor with confidence intervals. Definition drift is treated like a production incident — query diff, note, postmortem.",
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
    {
      id: "meta-mcq-11",
      prompt: "The re-engagement pull grabs 'the latest login per user' with `SELECT user_id, stamp FROM logins GROUP BY user_id LIMIT 1`-style folds. What does a bare `SELECT stamp FROM logins WHERE user_id = 7 LIMIT 1` return?",
      choices: [
        "The latest stamp — LIMIT implies newest first",
        "An arbitrary row — without ORDER BY, 'latest' is not defined and the engine owes you nothing",
        "The earliest stamp",
        "An error — LIMIT requires ORDER BY",
      ],
      answer: 1,
      why: "LIMIT caps the row count; it has no opinion about which rows. Without ORDER BY the pick is whatever the plan happens to touch first — it may look stable on a small table and shuffle on a big one. 'Latest' is a definition, and definitions live in ORDER BY stamp DESC.",
      notes: [
        { choice: 0, why: "That intuition ships silent nondeterminism: the query returns A row, never THE row. Re-runs and re-plans can pick differently." },
        { choice: 2, why: "Not guaranteed either — without ORDER BY there is no first or last, just an arbitrary survivor." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-12",
      prompt: "The delivery report prints NULL methods for arms with no delivery rows; the close wants '—' in those cells. Which expression?",
      choices: [
        "COALESCE(method, '—')",
        "method || '—'",
        "IFNULL(method, 'no delivery') rewritten as IFNULL(method, 0)",
        "NVL(method)",
      ],
      answer: 0,
      why: "COALESCE substitutes at the display layer only — the underlying anti-join logic stays honest while the cell renders a dash. The ghost arm is still a ghost in the data; it just reads cleanly in the close.",
      notes: [
        { choice: 1, why: "Concatenation with NULL yields NULL — the cell prints nothing. || propagates the NULL it's supposed to fix." },
        { choice: 2, why: "IFNULL(method, 0) fabricates a method '0' — worse than a dash, it implies a delivery type that doesn't exist. Display substitutions must be display-shaped." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-13",
      prompt: "An experiment assigned 103 users; arms read 52 and 51 against a planned 50/50. Which statement is the SRM-discipline answer?",
      choices: [
        "52/51 ≈ 50/50 — the check passes by inspection",
        "The SQL's job is the honest observed split over the ASSIGNED population; whether it's a mismatch is a threshold test against plan, agreed before the experiment — and the check gates the lift read",
        "Filter to engaged users first so the split reflects real traffic",
        "SRM only matters when arms differ by more than 10 points",
      ],
      answer: 1,
      why: "The query produces evidence — 50.49% vs 49.51% over everyone randomized; the threshold decides. Filtering to engaged users makes the denominator arm-correlated and the check measures engagement, not randomization. And the gate is the gate: no lift ships before the ratio passes.",
      notes: [
        { choice: 0, why: "Eyeballing is exactly what the check exists to replace — 52/51 on 103 might be perfectly healthy, but that's a test's verdict, not a glance's." },
        { choice: 2, why: "That's the denominator-drift bug in workflow form: the engaged population is correlated with arm by construction, so the check reads engagement, not assignment health." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-14",
      prompt: "The engagement census branches on four event types, all reconciling to COUNT(*). The platform ships a fifth type. What does a well-built census do?",
      choices: [
        "Nothing — the new type is invisible and the totals still reconcile",
        "The ELSE arm (or the computed 'other' remainder) catches it visibly — the census breaks loudly instead of undercounting silently",
        "The query errors — CASE rejects unknown values",
        "The reconciliation identity still holds because branches always sum to the total",
      ],
      answer: 1,
      why: "An exhaustive CASE with an ELSE arm — or an explicit COUNT(*) minus named-branches remainder — turns a schema event into a visible signal. The trap is choice 3: branch sums reconcile only when the branches cover the population; a fifth type outside the named branches breaks the identity, which is exactly the alarm.",
      notes: [
        { choice: 0, why: "Invisible is the failure mode: totals look stable while a growing population evades every branch. The ELSE arm is the alarm wire." },
        { choice: 2, why: "CASE matches unknown values to ELSE without erroring — silent, which is why the identity check, not the syntax, is the safeguard." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-15",
      prompt: "Mutual-engagement pairs: users who reacted to each other's content. Why does the self-join carry `a.user_id < b.user_id` rather than `a.user_id <> b.user_id`?",
      choices: [
        "They're equivalent",
        "The `<` keeps one canonical orientation per unordered pair and drops self-pairs in one stroke — halving the fan-out the `<>` version doubles",
        "`<>` fails on NULL ids",
        "The `<` sorts the output",
      ],
      answer: 1,
      why: "(A,B) and (B,A) are one graph edge, not two; `<>` emits both orientations plus every (A,A) self-pair. The canonicalization is the pairing rule the whole graph layer is built on — and it makes row counts predictable: n mutually-engaging users contribute n·(n−1)/2 pairs.",
      notes: [
        { choice: 0, why: "Row counts differ by 2× plus self-pairs — on a graph the size of Meta's, that's the difference between a chart and a garbage fire." },
        { choice: 2, why: "NULL never matches either comparison in a join — the inequality choice is about symmetric fan-out, not NULL policy." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-16",
      prompt: "Targeting wants the top decile of users by delivery spend, WITH ties kept together. Which expression flags them?",
      choices: [
        "NTILE(10) OVER (ORDER BY spend DESC) = 1",
        "CUME_DIST() OVER (ORDER BY spend) > 0.9",
        "RANK() OVER (ORDER BY spend) <= 10",
        "TOP 10 PERCENT — SQLite's built-in",
      ],
      answer: 1,
      why: "CUME_DIST gives each row the share of rows at or below it, and tied spenders share the same value — the top decile is a VALUE threshold, so ties land in the tier together. NTILE is a row dealer: it fills buckets by count and splits ties arbitrarily.",
      notes: [
        { choice: 0, why: "NTILE(10) = 1 gives a tenth of the ROWS — two users tied at the boundary can split across tiers, which is wrong when the tier is a definition." },
        { choice: 2, why: "RANK <= 10 keeps the ten best RANK RUNGS, which on a big table is a handful of users, not a decile — and ties blow past 10 rows anyway." },
        { choice: 3, why: "There is no TOP in SQLite — dialect check. The window toolkit owns percentiles here." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-17",
      prompt: "The weekly report buckets events with `SUBSTR(paid_on, 1, 7)`. Which native expression is the safer twin for the same 'YYYY-MM' bucket?",
      choices: [
        "STRFTIME('%Y-%m', paid_on)",
        "STRFTIME('%m-%Y', paid_on)",
        "MONTH(paid_on)",
        "LEFT(paid_on, 7)",
      ],
      answer: 0,
      why: "'%Y-%m' parses the stamp as a datetime first, then formats — identical output on clean ISO stamps, but it returns NULL (visible, catchable) on unparseable stamps instead of slicing garbage the way SUBSTR does. The bucket sorts correctly as a side effect of its format.",
      notes: [
        { choice: 1, why: "Month-first text scrambles the calendar spine — every March of every year sorts together." },
        { choice: 2, why: "MONTH() doesn't exist in SQLite — a MySQL/T-SQL habit that fails loudly, at least." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-18",
      prompt: "Delivery amounts live in integer cents. Which expression prints dollars at the precision the billing close quotes?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents) / 100.00 formatted client-side as integer",
        "CAST(SUM(amount_cents) AS TEXT) || ' dollars'",
      ],
      answer: 1,
      why: "The 100.0 REAL literal forces real division before ROUND caps it at two decimals — 243000 cents reads 2430.00. The bare / 100 is integer division: it truncates cents away, and the close silently rounds every arm down.",
      notes: [
        { choice: 0, why: "243500 / 100 = 2435 in integer math, not 2435.00 — and 243599 truncates to 2435 while the true figure is 2435.99. Money truncation is a billing incident." },
        { choice: 2, why: "Pushing the decimal to the client means every consumer re-implements the conversion — some will use /100 and reintroduce the truncation." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-19",
      prompt: "Pacing: `SUM(cents) OVER (ORDER BY day) AS running` — then `WHERE running >= 3000000` in the same query. What happens?",
      choices: [
        "It works — windows are filterable like columns",
        "It fails — window output is computed at SELECT time and can't be referenced in WHERE; the frame must run in an inner query (CTE or derived table) and the threshold filters outside",
        "It returns the first breach row",
        "It silently ignores the WHERE",
      ],
      answer: 1,
      why: "The logical pipeline runs WHERE before SELECT, so the window doesn't exist yet when WHERE evaluates — the engine rejects it. The two-stage shape (stage the running total in a CTE, filter the breach outside) is the house pattern for every 'first day we crossed the line' read.",
      notes: [
        { choice: 2, why: "Even where the intent is right, the mechanism is wrong — filtering the window requires the outer stage, which is also where LIMIT 1 picks the FIRST breach cleanly." },
        { choice: 3, why: "SQLite errors rather than ignores — the rejection IS the lesson that windows execute late." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-20",
      prompt: "WAU: seven daily reads of COUNT(DISTINCT user_id) are summed: 20+18+22+19+21+17+23 = 140. What does the honest weekly unique count require?",
      choices: [
        "Nothing — 140 is WAU",
        "140 minus the daily average",
        "Re-applying DISTINCT across the whole window — fold user-days, then COUNT(DISTINCT user_id) over the seven days — because everyone active on 2+ days is counted twice in the sum",
        "140 divided by 7",
      ],
      answer: 2,
      why: "The daily counts are DISTINCT-within-day; summing them multiplies every multi-day user by their active days. The honest WAU is a distinct count over the whole window — structurally a different fold, and always <= the sum.",
      notes: [
        { choice: 0, why: "140 is user-DAYS, the impression-count of activity. Publishing it as unique weekly reach is the exact conflation the dedupe discipline exists to prevent." },
        { choice: 3, why: "That's the daily average, a fourth quantity — none of the three (sum, average, true uniques) equals another." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-21",
      prompt: "The trailing-7-day actives window: which WHERE keeps every event in the window and nothing outside?",
      choices: [
        "WHERE day BETWEEN start AND start + 6",
        "WHERE day >= start AND day < start + 7",
        "WHERE day > start AND day <= start + 7",
        "WHERE day IN (start, start+1, ..., start+6)",
      ],
      answer: 1,
      why: "Half-open: inclusive lower bound, exclusive upper bound. It survives timestamp granularity — a stamp at start+6 23:59:59 is inside, and the boundary the BETWEEN-style reads silently amputate stays in the window.",
      notes: [
        { choice: 0, why: "Correct only for bare dates. With datetime stamps, start+6 parses as midnight and the last day's events vanish — the weekly read loses a day, every week, quietly." },
        { choice: 2, why: "Drops the first day entirely — a different amputation, same class of bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-22",
      prompt: "`ORDER BY last_seen DESC` on the re-engagement list — where do users who have NEVER logged in (NULL last_seen) land in SQLite?",
      choices: [
        "First — NULLs lead on DESC",
        "Last — SQLite sorts NULLs first on ASC and last on DESC",
        "Randomly",
        "They're excluded",
      ],
      answer: 1,
      why: "SQLite treats NULL as smallest, so DESC sinks never-seen users to the bottom — usually the desired read. The trap is portability: Postgres sorts NULLs high, and the same query puts them on top after a migration. Engine NULL placement is part of the query's contract.",
      notes: [
        { choice: 0, why: "That's the Postgres behavior. On SQLite the never-seen users read last — know which engine's contract you're shipping." },
        { choice: 3, why: "ORDER BY never excludes rows — every row is ranked; NULL just needs a placement decision, which the engine makes for you." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-23",
      prompt: "Cross-surface reach: the same user appears on Feed and Stories. Which dedupe key makes 'unique reach' honest?",
      choices: [
        "user_id + surface — one row per user per surface",
        "user_id + day — one row per user per day, whichever surface won",
        "user_id alone across the whole period",
        "surface + hour",
      ],
      answer: 1,
      why: "Reach is people per time window, so the dedupe grain is user + day: the ROW_NUMBER picks one canonical event per user-day, and the same person on three surfaces counts once. Deduping by user+surface still triple-counts the cross-surface user — the exact number Meta refuses to publish.",
      notes: [
        { choice: 0, why: "That's surface reach, a different metric — useful for per-surface health, wrong for the deduplicated reach headline." },
        { choice: 2, why: "Collapsing to user alone destroys the time dimension — you can no longer say anything about days, frequency, or trends." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-24",
      prompt: "Reaction rate: `SUM(CASE WHEN type = 'reaction' THEN 1 ELSE 0 END) / COUNT(DISTINCT user_id)` over events joined to users-to-surface. What's wrong?",
      choices: [
        "Nothing — reactions over users is the reaction rate",
        "Mixed grains: the numerator folds EVENT rows while the denominator folds PEOPLE — the 'rate' divides things that don't share a population; the rate must fold from one grain (reactions per impression, or reactors per user, stated)",
        "The CASE should be COUNT",
        "DISTINCT never belongs in a denominator",
      ],
      answer: 1,
      why: "A rate's numerator and denominator must fold from the SAME rows — reactions per impression, or users-who-reacted per users-who-saw. Dividing event-grain by people-grain produces a number that grows when one heavy user reacts twice, which is frequency wearing a rate's name.",
      notes: [
        { choice: 0, why: "It runs, it's plausible, and it drifts with engagement intensity — the exact failure that makes two dashboards disagree." },
        { choice: 3, why: "COUNT(DISTINCT user) is a fine denominator when the numerator is ALSO at the user grain — the rule is same-grain, not no-DISTINCT." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-25",
      prompt: "The pacing read uses `LAG(spend, 1, 0) OVER (ORDER BY day)`. What changed versus plain `LAG(spend)`?",
      choices: [
        "Nothing — the extra arguments are decoration",
        "The first row now reads 0 instead of NULL — honest only if day one's baseline truly is zero spend; otherwise it fabricates a prior day",
        "LAG now skips one row",
        "The window becomes cumulative",
      ],
      answer: 1,
      why: "The third argument replaces the first row's NULL with 0. For a running-vs-plan read where nothing was delivered before day one, that 0 is a fact; for a day-over-day delta it prints day one's full spend as +100% growth — a number the review repeats forever. The default NULL ('no prior row') is the honest default.",
      notes: [
        { choice: 0, why: "The arguments are the semantics: 1 is the offset, 0 is the default. They change the first row — the one row nobody checks." },
        { choice: 2, why: "The offset argument (1) sets how far back to look — unchanged here. Only the default value is new." },
      ],
      difficulty: "medium",
    },
    {
      id: "meta-mcq-26",
      prompt: "A stacked report UNION ALLs an arm-level branch with a TOTAL branch. The second branch lists columns as (cents, arm, status). What breaks?",
      choices: [
        "Nothing — UNION ALL matches columns by name",
        "Column positions align positionally: the TOTAL branch's cents land under the first branch's arm column — the stack prints plausible garbage",
        "The query errors on type mismatch",
        "UNION ALL requires both branches to query the same table",
      ],
      answer: 1,
      why: "Set operations align by POSITION, never by name. The branches can run fine individually and still produce a scrambled stack — which is why every branch's SELECT list is checked left-to-right before a stack ships, and the reconciliation row (TOTAL must equal the branch sums) is checked by eye.",
      notes: [
        { choice: 2, why: "It often DOESN'T error — text coerces into numeric columns and numbers into text, which is what makes the misaligned stack dangerous rather than loud." },
        { choice: 3, why: "Branches can read different tables freely — only the column count and positional types must agree." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-27",
      prompt: "Friends-of-friends: 'users reachable from me through exactly one friend, excluding me and my direct friends'. Why does the nested EXISTS shape win here?",
      choices: [
        "It's the only shape that joins three tables",
        "It's NULL-safe and composes pairwise: EXISTS(an edge from me to a middle) AND EXISTS(an edge from the middle to them), with me and direct friends excluded — and the middle can reference the outer rows at all only because the probe is correlated",
        "It avoids GROUP BY for performance only",
        "IN would work identically with less code",
      ],
      answer: 1,
      why: "The question is existential over pairs of edges — precisely what correlated EXISTS expresses, with NULL-safety for free (an equality probe never matches NULL). The exclusions (self, direct friends) become two more NOT EXISTS probes, each reading as prose.",
      notes: [
        { choice: 0, why: "Join shape isn't the win — the correlation is. A join-based version needs deduping afterward because one second-degree contact reachable through two friends appears twice." },
        { choice: 3, why: "IN materializes the middle users per outer row and carries the NULL trap on the negative forms — the edge tables are exactly where NULLs live." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-28",
      prompt: "Consecutive-day streaks: two builders flag island starts — one with `day - ROW_NUMBER() OVER (ORDER BY day)`, one with a `LAG(day)` gap test. When do they DISAGREE?",
      choices: [
        "Never — both are the same identity",
        "When the dates aren't calendar-consecutive integers — the diff trick assumes day increments by exactly 1 per row; with month boundaries or gaps in the unit (hours, non-integer days), only the LAG-against-the-actual-gap test is correct",
        "Only on the first row",
        "When the days tie",
      ],
      answer: 1,
      why: "The row-number-minus-date trick works because consecutive DATES increment by exactly 1 while ROW_NUMBER does too — the difference stays constant inside an island. Switch the unit (timestamps, hours) or hit a DST/month boundary the arithmetic doesn't model, and the constant breaks. The LAG test compares actual elapsed time — unit-agnostic and honest.",
      notes: [
        { choice: 0, why: "They agree on pure integer-keyed consecutive dates — and nowhere else. The disagreement is exactly where the data stops being toy-shaped." },
        { choice: 2, why: "The first row's LAG is NULL — both builders treat it as an island start identically. The disagreement is mid-stream, at the boundary arithmetic." },
      ],
      difficulty: "hard",
    },
    {
      id: "meta-mcq-29",
      prompt: "The experiment readout is due and both artifacts are ready: the lift table and the SRM check. What order do you ship?",
      choices: [
        "Lift first — SRM is a footnote",
        "SRM first, and it GATES the lift: a ratio-mismatched arm voids every cross-arm comparison, so the integrity check travels on top of the readout or nothing travels",
        "Either order — they're independent numbers",
        "Lift first, and run SRM only if the lift looks wrong",
      ],
      answer: 1,
      why: "The SRM check validates the RANDOMIZATION the lift is built on — a mismatched arm means the comparison is fiction regardless of how good the lift looks. Gating is the whole point: the check runs first, ships attached, and its threshold was agreed before the experiment started.",
      notes: [
        { choice: 3, why: "That's motivated reasoning institutionalized — the SRM run only when convenient never runs. The gate is unconditional." },
        { choice: 2, why: "They're dependent by construction: the lift is computed OVER the assignment the SRM validates. Order isn't presentation; it's validity." },
      ],
      difficulty: "easy",
    },
    {
      id: "meta-mcq-30",
      prompt: "Ghost-arm filter: `arms LEFT JOIN payments p` then the WHERE. Why is the ghost test `COUNT(p.id) = 0` and not `COUNT(*) = 0`?",
      choices: [
        "They're equivalent",
        "COUNT(*) counts the preserved row itself — a ghost arm still has one row (with NULL payloads), so COUNT(*) = 0 matches nothing and the ghost list comes back empty; COUNT(p.id) counts the matched delivery value, which is 0 exactly for ghosts",
        "COUNT(*) is slower",
        "COUNT(p.id) is required because p.id is numeric",
      ],
      answer: 1,
      why: "After a LEFT JOIN every arm exists at least once — preservation guarantees a row even when the match fails. COUNT(*) counts preservation (never 0); COUNT(right.key) counts the match (0 exactly when nothing matched). The anti-join filter must count the match.",
      notes: [
        { choice: 0, why: "The two-character difference between a ghost list and an empty table — and the empty version looks perfectly plausible in review." },
        { choice: 3, why: "COUNT works on any non-NULL column, numeric or not — the requirement is a right-table column whose NULLness signals the failed match." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-meta-3",
      tier: "medium",
      topic: "q1",
      universe: "funnel",
      title: "Engaged users never randomized",
      brief:
        "Meta-flavored brief on the storefront db: the experiment-platform coverage audit. Arms (invoices) were randomized to a subset of users — but engagement (orders) kept flowing to everyone, and the growth review wants the coverage gap named: engaged users who never entered an experiment roster. Probed facts: 11 of the 16 users hold at least one arm; the other FIVE engaged users were never randomized — Keiko Sato (APAC, 4 events), Noah Meyer (EU, 4), Farid Nasser (APAC, 3), Bruno Silva (LATAM, 2) and Dmitri Volkov (EU, 2). The membership test is a subquery, and its direction is the whole case.",
      ask: "Return the engaged users with no experiment arm: name, region, event count — busiest first, name as tie-break.",
      template:
        "SELECT c.name,\n       c.region,\n       {1}(o.id) AS events\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE c.id {2} (SELECT {3} FROM invoices)\nGROUP BY c.id, c.name, c.region\nORDER BY events DESC, c.name;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the event counter",
          why: "COUNT(o.id) folds each user's engagement rows — Keiko Sato reads 4. SUM(o.id) adds primary keys together, a meaningless number that shifts when rows are re-keyed.",
        },
        {
          answer: "NOT IN",
          kind: "keyword",
          label: "the coverage-gap test",
          why: "NOT IN keeps users absent from the roster — the gap itself. IN would flip the query to the 11 randomized users, the population the audit already trusts. Safe here because invoices.customer_id is NOT NULL — and the audit notes the NOT EXISTS twin is the house default for exactly that reason.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the roster key",
          why: "The subquery must select the column the outer test compares against — customer_id, the user grain of the roster. Selecting the arm id instead compares users to arm ids and empties the read; selecting amount_cents compares users to dollar figures and returns everyone.",
        },
      ],
      distractors: ["SUM", "IN", "id", "amount_cents", "MAX"],
      walkthrough:
        "A coverage audit as a membership test. The subquery folds the roster to its user keys — SELECT customer_id FROM invoices, 11 distinct users — and the outer NOT IN keeps the customers whose engagement never intersected it. The join to orders guarantees the answer is the ENGAGED gap (all five hold events), GROUP BY folds each to the person, and the leaderboard reads: Keiko Sato 4, Noah Meyer 4, Farid Nasser 3, Bruno Silva 2, Dmitri Volkov 2. The direction IS the case: flip NOT IN to IN and the query returns the 11 randomized users — a correct query answering the opposite question; swap the subquery's column to id or amount_cents and the membership test compares users against keys from another grain, returning an empty or an all-everything read that both look plausible. The audit's follow-up is the NULL corollary: this works because customer_id is NOT NULL on the roster — the day a nullable key enters, the house twin (NOT EXISTS) replaces NOT IN without a second thought.",
    },
    {
      id: "cs-meta-4",
      tier: "hard",
      topic: "t8",
      universe: "expense",
      title: "The delivery pacing read",
      brief:
        "Meta-flavored brief on the storefront db: the delivery loop's pacing read. Delivery logs (payments) land against arms across the quarter, and the pacing memo wants the FIRST day the cumulative collected spend crossed 3,000,000 cents ($30,000) — the running total, one row, the breach date named. Probed facts: 27 delivery rows span 2024-02-20 to 2025-02-10 (the last day carries two rows); the running total opens at 243000, crosses the 3,000,000 line on 2024-08-02 with 296800 collected that day (running 3047000), and finishes the log at 6961200. The frame must count rows, because the last day's two delivery rows are exactly the tie the default frame would blur.",
      ask: "Return the first day the running delivery total reached 3,000,000 cents: day, that day's cents, running cents.",
      template:
        "WITH daily AS (\n  SELECT paid_on AS day,\n         SUM(amount_cents) AS cents\n  FROM payments\n  GROUP BY day\n),\nstaged AS (\n  SELECT day,\n         cents,\n         {1}({2}) OVER (ORDER BY day {3} BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_cents\n  FROM daily\n)\nSELECT day, cents, running_cents\nFROM staged\nWHERE running_cents >= {4}\nLIMIT 1;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the running adder",
          why: "SUM(cents) OVER (ORDER BY day …) is the cumulative fold the pacing memo reads. COUNT would run a row counter into the threshold and match on day 3,000,000 — never; the breach is measured in cents.",
        },
        {
          answer: "cents",
          kind: "keyword",
          label: "the running operand",
          why: "The fold runs over the daily cents column — money, by definition. SUM(day) coerces dates to zeros and the running total flatlines, never reaching the threshold.",
        },
        {
          answer: "ROWS",
          kind: "keyword",
          label: "the positional frame",
          why: "ROWS counts physical rows — sequential, one day at a time. The default RANGE frame absorbs peer rows, and this log ends with two delivery rows on one day: a frame that rides ties double-counts the very boundary day the memo quotes.",
        },
        {
          answer: "3000000",
          kind: "number",
          label: "the breach threshold",
          noVerify: true,
          why: "The memo fixed the line at 3,000,000 cents ($30,000) — the first day the running total reaches it is 2024-08-02 at 3047000. The threshold is a definition agreed before the read, which is why it ships as a parameter, not a guess.",
        },
      ],
      distractors: ["COUNT", "day", "PARTITION", "2000000", "DESC"],
      walkthrough:
        "Three stages, one breach. The daily CTE folds 27 delivery rows to one row per day (the 2025-02-10 double collapses to its 707600 sum — the fold that makes the frame's ORDER BY key unique). The staged CTE layers the window: SUM(cents) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) walks the calendar forward, 243000, 486000, 700300… 2750200 on 2024-07-15, then 2024-08-02's 296800 pushes the running total to 3047000 — the first row at or above 3,000,000. The outer query filters on the window's OUTPUT (legal only from outside, because windows execute at SELECT time) and LIMIT 1 names the breach: 2024-08-02, 296800 that day, 3047000 running. ROWS is the load-bearing chip: days are unique in the folded table, but the frame is written for the raw log's tie — the default RANGE absorbs peer rows and rewrites boundary days, and a pacing breach that moves when the frame changes is a breach nobody can defend. COUNT as the adder or day as the operand both replace money with a counter that never reaches the line; 2000000 moves the breach to 2024-06-10, a different memo. The threshold, the frame, and the operand are all definitions — and this query states all three.",
    },
    {
      id: "cs-meta-5",
      tier: "medium",
      topic: "s7",
      universe: "growth",
      title: "The surface-status pivot",
      brief:
        "Meta-flavored brief on the storefront db: the engagement review wants the status census pivoted per region — one row per region, one column per state, so the room sees the shape of engagement at a glance instead of scrolling four censuses. Probed facts: EU 24 completed / 12 in-progress / 6 queued / 3 skipped; APAC 21/8/5/3; US 5/10/3/1 (the inversion — the US in-progress pool outruns its completions); LATAM 2/0/0/0. Branch sums reconcile against COUNT(*) per region: 45, 37, 19, 2 — the identity the review checks before the shapes are discussed.",
      ask: "Return one row per region with completed, in-progress, queued and skipped counts — biggest completed count first, region as tie-break.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_progress,\n       SUM(CASE WHEN o.status = '{2}' THEN 1 ELSE 0 END) AS queued,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS skipped\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY {3} DESC, c.region;",
      slots: [
        {
          answer: "delivered",
          kind: "keyword",
          label: "the completed-state literal",
          why: "'delivered' is the event store's completed state — the branch counts the 24 EU completions. Any other literal (or another table's status word) reads a silent zero forever, and the review argues about a column that measures nothing.",
        },
        {
          answer: "pending",
          kind: "keyword",
          label: "the queued-state literal",
          why: "'pending' is the in-flight queue — EU's 6, APAC's 5. The queued pool is the denominator-drift suspect in every completion read, which is why the pivot carries it beside the census.",
        },
        {
          answer: "completed",
          kind: "keyword",
          label: "the shape-defining sort",
          why: "ORDER BY completed DESC leads with the deepest-engaged region — EU 24, APAC 21, US 5, LATAM 2. Sorting by the in-progress column would crown US's backlog instead, a different story wearing the same table.",
        },
      ],
      distractors: ["shipped", "cancelled", "in_progress", "region"],
      walkthrough:
        "One scan, four conditional folds, one shape per row. The join attaches each of the 103 events to its region; the CASE arms translate status codes into the engagement vocabulary — delivered to completed, shipped to in-progress, pending to queued, cancelled to skipped — and SUM over each arm folds the region's rows into four reconciling branches: EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2 = 2. The identity is checkable per row, which is what makes the pivot a census and not a collage. The sort defines the story: completed DESC puts the US inversion on display (its 10 in-progress against 5 completed is the row the room zooms into), while sorting by in_progress would lead the deck with the backlog instead of the engagement. The literal that kills the read silently is any word from another table's vocabulary — 'paid' or 'void' live on the arms, and a branch holding one prints zeros while the reconciliation still fails loudly enough to catch. One scan, four lenses, and every branch answers to the total.",
    },
    {
      id: "cs-meta-6",
      tier: "easy",
      topic: "x1",
      universe: "month-close",
      title: "The split-arm method ledger",
      brief:
        "Meta-flavored brief on the storefront db: the billing close's method ledger. Delivery logs (payments) settle arms (invoices) through two surfaces — card and wire — and the close wants the split-payment arms named with their method stacks in one cell, because an arm that paid through both surfaces reconciles differently than one that paid through either. Probed facts: 27 delivery rows settle 22 of the 28 arms (16 card, 11 wire); exactly FIVE arms pay in two rows — INV-2024-001, -005, -012, -019 and -022 — each stacking a card row and a wire row, banking 2,494,000 of the 6,961,200 total collected cents (35.8%).",
      ask: "Return the split-payment arms: arm number, delivery row count, and the method stack as one comma-separated cell — arm number order.",
      template:
        "SELECT i.number,\n       {1}(*) AS payment_rows,\n       {2}(p.method) AS method_stack\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id, i.number\n{3} COUNT(*) > 1\nORDER BY i.number;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the delivery-row counter",
          why: "COUNT(*) folds each arm's delivery rows — the split arms read 2. SUM(*) doesn't exist, and a method ledger built on a broken counter ships wrong before the stack is even read.",
        },
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the method stacker",
          why: "GROUP_CONCAT(p.method) folds the arm's method values into one cell — 'card,wire' for every split arm here, the both-surfaces signature the close reconciles against. MAX would print only the text-max method and erase the split.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the split-arm gate",
          why: "The threshold judges COUNT(*), a per-arm aggregate that only exists after the fold — so the gate is HAVING. WHERE runs before aggregation, can't see the count, and errors in this position.",
        },
      ],
      distractors: ["SUM", "MAX", "WHERE", "ORDER"],
      walkthrough:
        "A fold, a gate, and one text cell. The join carries each arm's delivery rows, GROUP BY i.id folds them to the arm grain, and COUNT(*) is the honest counter — 2 for the five split arms, 1 for the seventeen single-row settlements. HAVING COUNT(*) > 1 performs the business cut, and GROUP_CONCAT(p.method) stacks each survivor's methods into one cell: card,wire for all five — INV-2024-001, -005, -012, -019, -022 — the both-surfaces signature that tells the close these arms reconcile against TWO rows each. The read is deliberately conservative about order: the cell is a roster, not a sequence, so the memo says 'card and wire both present' — which is all the reconciliation needs. MAX in the stacker would print 'wire' for every split arm and quietly erase the card row; SUM in the counter errors before the fold; WHERE in the gate is a syntax error that at least fails loudly. Five rows, one cell each, and every split arm is named where the close can see it.",
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
    { slug: "ads-funnel", why: "Stage-to-stage delivery rates from offered to converted — the ads funnel arithmetic whose denominators decide whether a surface looks broken or underfunded." },
    { slug: "roas-by-campaign", why: "Revenue over spend per arm with the denominator guarded — the ROAS read where zero-sale campaigns must still print, at zero." },
    { slug: "card-launch-success", why: "Launch adoption read behind a product arm — the success-rate fold Meta computes before any launch is declared won." },
    { slug: "second-day-confirmation", why: "Day-2 retention off a first event — the confirmation-window read that decides whether activation stuck or bounced." },
    { slug: "friend-requests-i-overall-acceptance-rate", why: "Accepted over sent at the graph's edge — the acceptance-rate fold whose denominator is the sent population, stated or wrong." },
    { slug: "friend-requests-ii-who-has-the-most-friends", why: "Argmax over the follower graph — 'who has the most friends' as a grouped fold with a deterministic tie rule." },
    { slug: "page-recommendations", why: "Second-degree reach through the follow graph — recommendations built from friends-of-friends, deduped across paths." },
    { slug: "all-the-pairs-with-the-maximum-number-of-common-followers", why: "Pair overlap argmax on the social graph — the common-follower read with the a<b canonicalization and a tie rule stated first." },
    { slug: "friends-with-no-mutual-friends", why: "The anti-join on the graph: edges with no reciprocal path — the reached-but-never-mutual population, counted NULL-safe." },
    { slug: "symmetric-pairs", why: "Mutual-edge detection over unordered pairs — the self-join canonicalization that halves fan-out and kills self-pairs in one stroke." },
    { slug: "keep-latest-dedupe", why: "One row per identity, the most recent — the cross-surface dedupe layer every reach number is built on, tie-break included." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct actives — the WAU roll where summing daily counts double-counts every multi-day user." },
    { slug: "growth-accounting", why: "New, resurrected and churned users in one accounting — the growth loop's ledger, folded from first-seen and last-seen logic." },
    { slug: "week-over-week-churn", why: "Cohort-to-cohort loss on the calendar spine — the churn delta whose window definitions are the metric." },
    { slug: "email-engagement-funnel", why: "Sent-to-opened-to-clicked rates per stage — the notification funnel where each denominator is its own population." },
    { slug: "usage-tier-percentiles", why: "Users banded by usage percentiles — the targeting-tier read where NTILE or CUME_DIST decides whether ties split or hold." },
  ],
};
