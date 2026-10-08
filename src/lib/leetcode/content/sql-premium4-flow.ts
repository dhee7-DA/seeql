// Deep-dives — SeeQL premium batch IV, file 1 of 6: flow-flavored reads —
// monthly delivery pledges, bike fleet returns, active-login gates, whole-word
// text counting, travel totals and interval buckets (6 problems: 2 Easy,
// 4 Medium). Engine-verified by scripts/tmp-68b1-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_FLOW: LcSqlDive[] = [
  {
    slug: "immediate-food-delivery-iii",
    statement:
      "Delivery logs one row per order: (delivery_id, customer_id, order_date, customer_pref, delivery_date). At checkout the customer marks the order 'immediate' or 'scheduled'. This report uses ONE definition of an immediate order: an order is immediate exactly when customer_pref = 'immediate' — delivery dates play no part, so a scheduled order that happens to be delivered the same day stays scheduled. Per month (the 'YYYY-MM' prefix of order_date), report columns month and immediate_pct, where immediate_pct is ROUND(100.0 * immediate orders / all orders, 2). One row per month present in Delivery, ordered by month ascending.",
    examples: [
      {
        input:
          "January holds four orders: 101 and 103 are 'immediate', 102 and 104 are 'scheduled' (both delivered days after ordering)",
        output: "2024-01 · 50.0",
        explanation:
          "2 of 4 are immediate by preference, and 100.0 * 2 / 4 lands exactly on the clean half.",
      },
      {
        input:
          "February holds three orders: 105 is 'immediate', 106 is 'scheduled' yet delivered the very day it was ordered, 107 is 'scheduled' and delivered late",
        output: "2024-02 · 33.33",
        explanation:
          "106's coinciding dates do not promote it — the preference decides — so 1 of 3 gives 33.33; a dates-based reading would print 66.67.",
      },
    ],
    constraints: [
      "month is the 'YYYY-MM' text of order_date; one row per month present in Delivery",
      "immediate_pct = ROUND(100.0 * pref-immediate orders / all orders in the month, 2) — the preference alone decides; delivery dates are never consulted",
      "columns month, immediate_pct — ordered by month ascending",
    ],
    breakdown: [
      "The report is a per-month ratio, and every part of it lives inside one grouped pass. The month key is CAST(strftime('%Y-%m', order_date) AS TEXT), which keeps the label as the 'YYYY-MM' text the statement asks for. Within each month group, SUM(CASE WHEN customer_pref = 'immediate' THEN 1 ELSE 0 END) counts the immediate orders while COUNT(*) counts all of them, because every row in the group is a delivery. The ratio is therefore an aggregate over an aggregate-shaped expression — one scan, one GROUP BY, no joins.",
      "Why insist on the preference-based definition? Because the dates tell a second, contradictory story: a scheduled order can be delivered the same day it was ordered, and seed row 106 is exactly that — customer_pref 'scheduled' with delivery_date equal to order_date. Under a dates-based definition February reads 2 of 3 (66.67); under the stated preference-based one it reads 1 of 3 (33.33). Both are defensible definitions of 'immediate', which is precisely why the statement must pin one and the query must encode only that one — a report whose answer depends on an unstated reading is a bug waiting for a stakeholder.",
      "The 100.0 literal is load-bearing, not cosmetic. SUM(CASE ...) and COUNT(*) both return integers, so an expression such as 100 * 1 / 3 evaluates in integer arithmetic and floors to 33 — the 100.0 forces the division into real numbers before it happens. ROUND(..., 2) then pins the report's two-decimal contract. The seed hides the bug on even splits: January's 100 * 2 / 4 is exact even in integer math (50), so only February's 1-of-3 exposes the floored result.",
    ],
    edges: [
      "Row 106 ('2024-02-09', 'scheduled', delivered '2024-02-09'): the dates coincide but the preference says scheduled — a definition built on delivery_date = order_date reports February as 66.67 instead of 33.33.",
      "Integer division: February's true share is 100 * 1 / 3 — all-integer arithmetic prints 33, and only the 100.0 keeps 33.33; January's 50 is exact either way, which is why the bug slips through casual testing.",
      "March is a single row (108): its group's COUNT(*) is 1, so the ratio is 100.0 with no division-by-zero risk — GROUP BY only forms months that actually exist.",
      "ORDER BY month is part of the contract: 'YYYY-MM' zero-padded text sorts in calendar order, but dropping the clause ships the engine's storage order — correct here only by insertion luck.",
    ],
    ladder: [
      { title: "Brute force — ratio per month by hand", body: "Bucket the orders by month in application code, count the 'immediate' marks, divide, and format two decimals per month. Three moving parts the engine folds into one grouped pass." },
      { title: "The pattern — grouped CASE ratio", body: "GROUP BY the 'YYYY-MM' key, count the preference inside SUM(CASE ...) and divide by COUNT(*): the CASE turns a logical predicate into a countable 1 or 0." },
      { title: "The optimal idea — encode the definition, force the float", body: "O(n). The durable rules: state which definition of the business term the report uses and write exactly that one into the CASE, and make the division real (100.0, not 100) before ROUND pins the decimals." },
    ],
    approach: "GROUP BY the strftime month key, pref-based immediate share via CASE inside SUM, 100.0 forcing real division, ROUND to 2dp",
    schema: {
      ddl: `CREATE TABLE Delivery (
  delivery_id   INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  order_date    TEXT NOT NULL,     -- 'YYYY-MM-DD'
  customer_pref TEXT NOT NULL,     -- 'immediate' or 'scheduled'
  delivery_date TEXT NOT NULL      -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Delivery (delivery_id, customer_id, order_date, customer_pref, delivery_date) VALUES
  (101, 10, '2024-01-03', 'immediate', '2024-01-03'),   -- January: immediate
  (102, 11, '2024-01-07', 'scheduled', '2024-01-09'),   -- scheduled, delivered late
  (103, 12, '2024-01-15', 'immediate', '2024-01-15'),   -- January: immediate
  (104, 13, '2024-01-22', 'scheduled', '2024-01-25'),   -- scheduled, delivered late
  (105, 14, '2024-02-02', 'immediate', '2024-02-02'),   -- February: immediate
  (106, 15, '2024-02-09', 'scheduled', '2024-02-09'),   -- the trap: same-day delivery, still 'scheduled'
  (107, 16, '2024-02-14', 'scheduled', '2024-02-20'),   -- scheduled, delivered late
  -- 108 is March's only order: a single-row month
  (108, 17, '2024-03-05', 'immediate', '2024-03-05');`,
      tables: [
        { name: "Delivery", note: "8 orders over three months — January 2 immediate of 4, February 1 of 3 (row 106 is same-day yet 'scheduled'), March 1 of 1" },
      ],
    },
    code: `SELECT
    CAST(strftime('%Y-%m', order_date) AS TEXT) AS month,   -- 'YYYY-MM' text key
    ROUND(
        100.0 * SUM(CASE WHEN customer_pref = 'immediate' THEN 1 ELSE 0 END)
        / COUNT(*),                                          -- 100.0 keeps the math real
        2
    ) AS immediate_pct
FROM Delivery
GROUP BY month        -- the alias: one pass over the month key
ORDER BY month;`,
    walkthrough: [
      "strftime stamps a month onto each row: 2024-01 groups {101, 102, 103, 104}, 2024-02 groups {105, 106, 107}, 2024-03 groups {108}.",
      "The CASE counts preferences: 2 immediate in January, 1 in February (106 stays out), 1 in March — against denominators of 4, 3 and 1.",
      "100.0 * 2 / 4 rounds to 50.0, 100.0 * 1 / 3 to 33.33 and 100.0 * 1 / 1 to 100.0, so ORDER BY month ships ('2024-01', 50.0), ('2024-02', 33.33), ('2024-03', 100.0).",
    ],
    time: "O(n) — one scan feeding one aggregate per month",
    space: "O(m) — one ratio row per month",
    followUps: [
      "Report each month's immediate share beside the PREVIOUS month's — what does LAG(immediate_pct) OVER (ORDER BY month) add, and what does the first month show for its missing neighbour?",
      "Reconcile the two definitions: report both the pref-based and the dates-based percentage per month — which month diverges, and what does the gap measure about the scheduled queue?",
    ],
    related: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "bikes-last-time-used",
    statement:
      "Trip records bike-share rides: (trip_id, bike_id, start_time, end_time), where end_time is when the bike was returned. A bike's last-used moment is the most recent end_time among its trips. Report columns bike_id, last_used — one row per bike found in Trip, where last_used is that bike's MAX(end_time). Order by bike_id ascending. Trip ids are booking artifacts, not a chronology: never use them to reason about recency.",
    examples: [
      {
        input:
          "bike 1 has three trips: trip 9 ended 2024-05-01 20:05, trip 4 ended 2024-05-02 08:40, trip 2 ended 2024-05-06 09:55",
        output: "1 · 2024-05-06 09:55",
        explanation:
          "The newest end_time wins — trip 2, which also happens to hold the smallest id, while MAX(trip_id) would have picked trip 9.",
      },
      {
        input:
          "bike 2's only trip ends 2024-05-03 11:25, and bike 3's latest trip ends at the very same timestamp",
        output: "2 · 2024-05-03 11:25 · 3 · 2024-05-03 11:25",
        explanation:
          "Equal last-used timestamps across two bikes still produce two rows — one per bike, never merged.",
      },
    ],
    constraints: [
      "one row per bike_id found in Trip; last_used is that bike's MAX(end_time)",
      "last_used is the timestamp value itself — never the trip_id that carried it, and never a start_time",
      "columns bike_id, last_used — ordered by bike_id ascending",
    ],
    breakdown: [
      "Each bike's most recent end_time is a per-group extreme, and the aggregate that answers it is short: GROUP BY bike_id with MAX(end_time). The output column IS the extreme value itself, so no join-back is needed — the report never asks for any other column of the winning trip. 'Last used' is read off the end of the trip, not its start: a bike is in use until it is returned, and the statement fixes that reading so start_time never leaks into the column.",
      "The tempting shortcut — take the trip with the biggest id and read its end_time — fails because trip_id is minted at insertion time and says nothing about when the ride happened. Bike 1's rows prove the inversion in one glance: trip 9 ended on 2024-05-01, days BEFORE trip 4, and trip 2 — the chronologically latest — holds the smallest id of the three. A query keyed on MAX(trip_id) pairs bike 1 with the oldest return in its history. Aggregates cannot see which row they came from, but here we never need them to: MAX(end_time) compares the timestamps directly, and 'YYYY-MM-DD HH:MM' text sorts correctly.",
      "Cross-bike coincidence needs no handling, and the seed proves it: bikes 2 and 3 both last return at '2024-05-03 11:25', yet each still owns exactly one output row. GROUP BY never merges rows across groups, so an equal value in two groups is no more a tie than two equal salaries in different departments. The determinism that matters lives in the ORDER BY: bike_id ascending fixes the report's row order, and the one-row-per-bike invariant needs no dedup and no window.",
    ],
    edges: [
      "Bike 1's trip 9 ends '2024-05-01 20:05' yet carries the LARGEST trip_id among bike 1's rows (9, 4, 2) — a MAX(trip_id) lookup reports bike 1's last_used as '2024-05-01 20:05' instead of '2024-05-06 09:55'.",
      "Bikes 2 and 3 both end at '2024-05-03 11:25' — a cross-bike tie on the VALUE, which is harmless: GROUP BY keeps one row per bike, while DISTINCT or a dedup pass would wrongly collapse them into one.",
      "Bike 2's single trip is its own maximum — a correct query needs no special case, but a HAVING COUNT(*) > 1 guard would erase bike 2 from the report entirely.",
      "'YYYY-MM-DD HH:MM' zero-padded text sorts lexicographically in true chronological order, so MAX(end_time) needs no casting — a format like 'D/M/YYYY HH:MM' would have broken the comparison silently.",
    ],
    ladder: [
      { title: "Brute force — scan per bike", body: "For each bike id, walk its trips and remember the newest end_time seen. Correct, but it is a hand-rolled per-group MAX the engine expresses in one clause." },
      { title: "The pattern — grouped MAX", body: "GROUP BY bike_id with MAX(end_time) computes every bike's newest return in one pass; the aggregate compares values, so id ordering is irrelevant." },
      { title: "The optimal idea — aggregate the value, not the row", body: "O(n). The transferable rule: when the output column is itself the extreme value, grouped MAX (or MIN) is the entire answer; the join-back and top-1-per-group machinery only earns its keep when a NON-aggregate column must ride along." },
    ],
    approach: "GROUP BY bike_id with MAX(end_time) — the report needs the extreme value itself, not the row that carried it",
    schema: {
      ddl: `CREATE TABLE Trip (
  trip_id    INTEGER PRIMARY KEY,
  bike_id    INTEGER NOT NULL,
  start_time TEXT NOT NULL,      -- 'YYYY-MM-DD HH:MM'
  end_time   TEXT NOT NULL       -- 'YYYY-MM-DD HH:MM'
);`,
      seed: `INSERT INTO Trip (trip_id, bike_id, start_time, end_time) VALUES
  (9, 1, '2024-05-01 19:30', '2024-05-01 20:05'),   -- bike 1, but ids are NOT chronology
  (4, 1, '2024-05-02 08:00', '2024-05-02 08:40'),   -- ended AFTER trip 9 despite the smaller id
  (2, 1, '2024-05-06 09:10', '2024-05-06 09:55'),   -- bike 1's true last return, smallest id
  (5, 2, '2024-05-03 11:00', '2024-05-03 11:25'),   -- bike 2's only trip
  (3, 3, '2024-05-02 09:00', '2024-05-02 09:20'),
  -- 7's return ties bike 2's timestamp exactly
  (7, 3, '2024-05-03 10:00', '2024-05-03 11:25');`,
      tables: [
        { name: "Trip", note: "6 rides over 3 bikes — bike 1's ids run 9, 4, 2 while its dates run forward, and bike 3's last return ties bike 2's" },
      ],
    },
    code: `SELECT
    bike_id,
    MAX(end_time) AS last_used   -- the newest RETURN per bike, ids play no part
FROM Trip
GROUP BY bike_id
ORDER BY bike_id;`,
    walkthrough: [
      "GROUP BY bike_id forms three groups: bike 1 holds trips {9, 4, 2}, bike 2 holds {5}, bike 3 holds {3, 7}.",
      "MAX(end_time) inside each group reads '2024-05-06 09:55' for bike 1 (trip 2), '2024-05-03 11:25' for bike 2, and '2024-05-03 11:25' for bike 3 (trip 7, whose 2024-05-02 return loses).",
      "ORDER BY bike_id ships (1, '2024-05-06 09:55'), (2, '2024-05-03 11:25'), (3, '2024-05-03 11:25') — the MAX(trip_id) wrong-turn would have shipped bike 1 with '2024-05-01 20:05'.",
    ],
    time: "O(n) — one grouped pass over the trips (plus the final order)",
    space: "O(b) — one row per bike",
    followUps: [
      "Report each bike's last trip in full — bike_id, trip_id, start_time, last_used — now that the winning ROW's other columns are needed: join-back on the max, or ROW_NUMBER() = 1, and which stays safe if two trips tie on end_time?",
      "Flag bikes idle for more than 24 hours since their last return — how do you compare two 'YYYY-MM-DD HH:MM' texts, and what would a fixed reference timestamp need from the statement?",
    ],
    related: ["the-latest-login-in-2020", "the-most-recent-orders-for-each-product", "uber-first-transaction"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-active-users",
    statement:
      "Login records one row per sign-in: (login_id, username, login_date). A user is ACTIVE if they signed in on at least 5 DISTINCT calendar days inside the closed 30-day window ending 2024-06-30 — that is, every date from 2024-06-01 through 2024-06-30 inclusive. Report columns username, active_days for every active user, where active_days counts distinct login dates inside the window. Order by active_days descending, then username ascending.",
    examples: [
      {
        input:
          "cleo signs in 7 times: twice on 2024-06-03, then on 2024-06-10, 2024-06-12, 2024-06-19, 2024-06-21 and 2024-06-30",
        output: "cleo · 6",
        explanation:
          "The double 2024-06-03 collapses to one day; 6 distinct days clear the 5-day bar.",
      },
      {
        input:
          "dov signs in on five May days — 2024-05-06, 2024-05-13, 2024-05-20, 2024-05-27, 2024-05-31 — and never in June",
        output: "(no row — dov is not active)",
        explanation:
          "All five days fall outside the closed June window, so the WHERE erases every dov row before any counting happens.",
      },
    ],
    constraints: [
      "the window is the closed 30-day range 2024-06-01 through 2024-06-30 inclusive; logins outside it count nothing for anyone",
      "active_days = COUNT(DISTINCT login_date) within the window; only users reaching 5 appear in the output",
      "columns username, active_days — ordered by active_days descending, then username ascending",
    ],
    breakdown: [
      "The grain of the count is the DAY, not the login, and the seed is built to punish forgetting that. Cleo signs in twice on 2024-06-03 — COUNT(login_date) reports 7 while COUNT(DISTINCT login_date) reports 6, and the two numbers disagree by exactly that one double. Fay makes the distinction decisive rather than cosmetic: five raw rows, but the duplicated 2024-06-04 leaves only four distinct days, so her membership in the answer flips entirely on the DISTINCT. An aggregate that counts rows instead of days answers a different question.",
      "The window is a row filter, so it belongs in a WHERE that runs before any grouping. The bounds are closed on both ends and stated in calendar terms: 2024-06-01 through 2024-06-30, thirty days total. The seed places bait on both edges and beyond them — esme's first login sits exactly on 2024-06-01, cleo's last on 2024-06-30, dov's five logins all sit in May, and ada carries a stray 2024-07-01. A WHERE that drops either bound, or is forgotten outright, reshapes the answer without ever erroring: dov counts 5 and joins the actives, ada climbs to 6 and leapfrogs cleo on the name tiebreak.",
      "The 5-day bar is a condition on GROUPS, not rows, so it lives in HAVING and not in the WHERE — WHERE filters which logins exist, HAVING filters which users survive. Writing it as HAVING COUNT(DISTINCT login_date) >= 5 keeps the day-grain consistent with the reported column. The final ORDER BY carries two keys because active_days alone is not unique: ada and esme both sit at 5, and username ASC is what makes their relative order a contract instead of a coin flip.",
    ],
    edges: [
      "dov's five May logins (2024-05-06 through 2024-05-31): a query with no window WHERE counts him at 5 and admits him — every one of his rows must be filtered away before the count.",
      "ada's 2024-07-01 row: forgetting only the upper bound inflates her to 6 and reshuffles the podium — she ties cleo at 6 and beats her alphabetically.",
      "esme's 2024-06-01 login sits exactly on the lower edge: an exclusive bound (dates after 06-01) drops her to 4 and deletes her row; cleo's 2024-06-30 pins the upper edge the same way.",
      "fay's five rows hold four distinct days (the 2024-06-04 pair): COUNT(login_date) reports her 5 and admits her — COUNT(DISTINCT login_date) is the difference between the right 3-row answer and a 4-row one.",
    ],
    ladder: [
      { title: "Brute force — day sets per user", body: "Collect each user's window dates into a set in application code, keep the sets of size 5 or more, and print the sizes. The engine expresses the whole walk as filter, group, count." },
      { title: "The pattern — WHERE, then GROUP BY, then HAVING", body: "WHERE keeps only window rows, GROUP BY username folds each user's rows, COUNT(DISTINCT login_date) scores days, and HAVING keeps the users at 5 or more." },
      { title: "The optimal idea — filter rows early, filter groups late", body: "O(n log n). The durable rules: row-level restrictions (the window) go in WHERE before aggregation, group-level thresholds go in HAVING after it, and the DISTINCT inside the aggregate is where the day-grain lives." },
    ],
    approach: "WHERE the closed June window, GROUP BY username, COUNT(DISTINCT login_date) >= 5 in HAVING, order by count then name",
    schema: {
      ddl: `CREATE TABLE Login (
  login_id   INTEGER PRIMARY KEY,
  username   TEXT NOT NULL,
  login_date TEXT NOT NULL      -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Login (login_id, username, login_date) VALUES
  (1,  'ada',  '2024-06-01'),   -- five June days for ada
  (2,  'ada',  '2024-06-05'),
  (3,  'ada',  '2024-06-09'),
  (4,  'ada',  '2024-06-13'),
  (5,  'ada',  '2024-06-17'),
  (6,  'ada',  '2024-07-01'),   -- outside the window: must not inflate her
  (7,  'bram', '2024-06-02'),   -- four June days: one short of the bar
  (8,  'bram', '2024-06-08'),
  (9,  'bram', '2024-06-15'),
  (10, 'bram', '2024-06-22'),
  (11, 'cleo', '2024-06-03'),   -- two logins on ONE day
  (12, 'cleo', '2024-06-03'),   -- the duplicate DISTINCT must collapse
  (13, 'cleo', '2024-06-10'),
  (14, 'cleo', '2024-06-12'),
  (15, 'cleo', '2024-06-19'),
  (16, 'cleo', '2024-06-21'),
  (17, 'cleo', '2024-06-30'),   -- on the upper edge exactly
  (18, 'dov',  '2024-05-06'),   -- all of dov lives in May
  (19, 'dov',  '2024-05-13'),
  (20, 'dov',  '2024-05-20'),
  (21, 'dov',  '2024-05-27'),
  (22, 'dov',  '2024-05-31'),
  (23, 'fay',  '2024-06-04'),   -- five rows, four distinct days
  (24, 'fay',  '2024-06-04'),   -- the duplicate that sinks her
  (25, 'fay',  '2024-06-11'),
  (26, 'fay',  '2024-06-18'),
  (27, 'fay',  '2024-06-25'),
  (28, 'esme', '2024-06-01'),   -- exactly on the lower edge
  (29, 'esme', '2024-06-07'),
  (30, 'esme', '2024-06-14'),
  (31, 'esme', '2024-06-21'),
  (32, 'esme', '2024-06-28');`,
      tables: [
        { name: "Login", note: "32 sign-ins over 6 users — ada straddles the window with a July row, cleo doubles a day, dov never leaves May, fay's duplicates sink her, esme rides the lower edge" },
      ],
    },
    code: `SELECT
    username,
    COUNT(DISTINCT login_date) AS active_days   -- days, not logins
FROM Login
WHERE login_date BETWEEN '2024-06-01' AND '2024-06-30'   -- closed 30-day window
GROUP BY username
HAVING COUNT(DISTINCT login_date) >= 5        -- a GROUP filter, not a row filter
ORDER BY active_days DESC, username ASC;`,
    walkthrough: [
      "The WHERE keeps only June rows: dov disappears outright, ada keeps 5 of her 6 rows, and bram, cleo, esme and fay keep 4, 7, 5 and 5.",
      "GROUP BY username with COUNT(DISTINCT login_date) scores them: cleo 6 (the 06-03 pair collapses), ada 5, esme 5, bram 4, fay 4 (her 06-04 pair collapses).",
      "HAVING keeps the users at 5 or more, and ORDER BY active_days DESC, username ships (cleo, 6), (ada, 5), (esme, 5) — the 5-tie broken by name.",
    ],
    time: "O(n log n) — one filtered pass, grouped counts, then the final sort",
    space: "O(u) — one count per username",
    followUps: [
      "Parameterise the window: active within the 30 days ending on a given day — which literals change, and how would you express 'trailing 30 days' with date arithmetic instead of two hardcoded bounds?",
      "Report each active user's most recent in-window login beside their count — which extra aggregate rides along without changing the grain, and what does it show for the user whose last sign-in is on the upper edge?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "user-activity-for-the-past-30-days-ii", "active-users"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "count-occurrences-in-text",
    statement:
      "Note holds short text snippets: (note_id, content). Count the notes whose content contains the whole word 'cache', case-insensitively, under this exact matcher: lowercase the text; a hyphen GLUES its neighbours into one token, so cache-coherent is the single fused word cachecoherent and never counts; a comma, period or colon SPLITS words, so 'cache: cleared' and 'cache, then' hold the bare word. An occurrence counts only when 'cache' is delimited on both sides by a boundary — the text's start, its end, a space, or one of those punctuation marks — so longer words that merely contain it ('cached', 'cachet') do not count. The grader normalises each snippet exactly this way, pads it with a space at both ends, and looks for the delimited token ' cache '. Output one column, matching_notes: a single row holding the number of matching notes.",
    examples: [
      {
        input:
          "notes 1, 3 and 5 — 'Cache hit', 'flush the cache, then flush again.' and 'the cache: cleared'",
        output: "all three match — they are the survivors the count adds up",
        explanation:
          "lower() folds the capital, and the comma and the colon each split the token so the bare word cache stands alone.",
      },
      {
        input:
          "note 4 — 'CACHE-COHERENT protocols' — and note 6 — 'the cachet of carried porcelain'",
        output: "neither matches",
        explanation:
          "The hyphen fuses the compound into cachecoherent, and cachet only contains cache as a leading substring — a whole-word match rejects both.",
      },
    ],
    constraints: [
      "one column matching_notes, one row — the count of notes matching under the stated matcher, 0 if none do",
      "matching is case-insensitive; boundaries are text start/end, spaces and , . : — a hyphen fuses its neighbours into one token, so hyphenated compounds never match",
      "content strings hold letters, spaces and only the punctuation , . : - (the normalisation is defined on exactly this alphabet); note_id plays no part",
    ],
    breakdown: [
      "The phrase 'whole word' is the entire problem: a plain substring search cannot express it. lower(content) LIKE '%cache%' matches every one of the six seed rows, because cached, cachecoherent and cachet all hide cache inside themselves — the substring is there, the word is not. The fix is to make the boundaries physical: normalise the text until words are separated by literal spaces, then demand the padded token '% cache %', where the surrounding spaces stand for start, end or punctuation. Padding both ends is what lets one pattern cover the middle, the head and the tail of the text.",
      "Punctuation adjacency is where a naive padded search dies in real text. 'The cache: cleared' has a colon pressed against the word — searched as-is the token reads cache: and '% cache %' misses it, so the normalisation must turn , . : into spaces, splitting the token cleanly. The hyphen is deliberately given the OPPOSITE treatment: cache-coherent is one compound word, so the matcher deletes the hyphen and fuses it into cachecoherent — a compound is a different word, not a bare occurrence of cache. A nested replace chain encodes the whole policy, and each rule owns its own characters, so the order of the rules cannot interfere.",
      "The counting shape keeps the normalisation in one place: a derived table produces the padded text, and the outer query filters and counts it. COUNT(*) over the filtered rows is the report — a whole-table aggregate, no GROUP BY, one row out. If no note matched, the same shape reports 0 rather than vanishing, which is the difference between an empty answer and a broken-looking one. Keeping the matcher in SQL rather than application code means the semantics travel with the query and every grader sees the same tokens.",
    ],
    edges: [
      "Note 6 ('the cachet of carried porcelain'): the substring pattern '%cache%' matches 'cachet' and reports 6 — only the padded '% cache %' rejects it, because the character after cache is a letter, not a boundary.",
      "Note 4 ('CACHE-COHERENT protocols'): a normaliser that converts '-' to a space instead of deleting it would split the compound into two tokens and wrongly count it — the fuse rule is what keeps the answer at 3.",
      "Notes 3 and 5 ('flush the cache, then flush again.' and 'the cache: cleared'): without turning , and : into spaces the tokens read cache, and cache: and the padded pattern misses both — punctuation splitting is worth two of the three matches.",
      "Note 1 ('Cache hit'): the leading capital and the end-of-text boundary are both absorbed by lower() plus the space padding — an unpadded match would demand a space after a word that sits at the very end of the snippet.",
    ],
    ladder: [
      { title: "Brute force — tokenise by hand", body: "Split each snippet on whitespace and punctuation in application code, lowercase the tokens, and compare each one to cache. Correct, but it drags a tokenizer into every consumer of the report." },
      { title: "The pattern — normalise, pad, LIKE the token", body: "lower() folds case, replace() turns , . : into spaces and deletes hyphens, and a LIKE '% cache %' against the padded text matches only delimited occurrences." },
      { title: "The optimal idea — put the word-boundary policy in the normalisation", body: "O(n × L). The durable rule: substring patterns cannot see word edges, so encode the boundary policy once — split what ends a word, fuse what joins words — and let a single padded LIKE do the matching." },
    ],
    approach: "normalise (lowercase, punctuation to spaces, hyphens fused away), pad with spaces, count rows matching the token ' cache '",
    schema: {
      ddl: `CREATE TABLE Note (
  note_id INTEGER PRIMARY KEY,
  content TEXT NOT NULL             -- letters, spaces and , . : - only
);`,
      seed: `INSERT INTO Note (note_id, content) VALUES
  (1, 'Cache hit'),                       -- case-fold proof: matches
  (2, 'cached results'),                  -- prefix word, not the whole word
  (3, 'flush the cache, then flush again.'),  -- comma and period flank the word
  (4, 'CACHE-COHERENT protocols'),        -- hyphen fuses the compound: no match
  (5, 'the cache: cleared'),              -- colon flanks the word: matches
  -- 6 holds the substring cachet only: no match
  (6, 'the cachet of carried porcelain');`,
      tables: [
        { name: "Note", note: "6 snippets — notes 1, 3 and 5 hold the bare word cache; 2, 4 and 6 each fail the delimiter test a different way" },
      ],
    },
    code: `SELECT COUNT(*) AS matching_notes
FROM (
    SELECT
        ' ' || lower(
            replace(
                replace(
                    replace(
                        replace(content, '-', ''),   -- hyphen FUSES: cache-coherent becomes cachecoherent
                    ',', ' '),                       -- comma SPLITS a word from what follows
                '.', ' '),                           -- period SPLITS even at sentence end
            ':', ' ')                                -- colon SPLITS before a clause
        ) || ' ' AS padded                           -- the padding covers start and end boundaries
    FROM Note
) padded_notes
WHERE padded LIKE '% cache %'
-- one row out: the clause keeps the exact-order contract
ORDER BY matching_notes;`,
    walkthrough: [
      "The derived table normalises and pads all six rows — note 1 becomes ' cache hit ', note 4 ' cachecoherent protocols ', note 6 ' the cachet of carried porcelain '.",
      "LIKE '% cache %' keeps three rows: note 1, note 3 (padded ' flush the cache  then flush again ') and note 5 (' the cache  cleared ') — notes 2, 4 and 6 fail on 'cached', the fused compound, and 'cachet' respectively.",
      "COUNT(*) over the three survivors ships the single row (matching_notes = 3).",
    ],
    time: "O(n × L) — every snippet is rewritten and pattern-matched once",
    space: "O(n × L) — the padded copies live until the count is taken",
    followUps: [
      "Count notes containing ANY of several words ('cache', 'index', 'buffer') — how does the padded LIKE generalise to a chain of ORs, and when do you reach for a token-splitting CTE instead?",
      "Report per-note occurrence COUNTS for the word cache (not just presence) — what does the LIKE shape fail at, and how does splitting each snippet into its tokens change the grain?",
    ],
    related: ["invalid-tweets", "patients-with-a-condition", "find-users-with-valid-e-mails"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "total-traveled-distance",
    statement:
      "User lists riders: (user_id, name). Trip records rides: (trip_id, user_id, distance, status), where status is 'completed' or 'cancelled'. Report columns user_id, name, total_distance — one row per user, where total_distance is the sum of distance over that user's COMPLETED trips. A user with no completed trips (no trips at all, or only cancelled ones) reports total_distance 0 — the row must appear, and the value must be 0, never NULL and never absent. Order by user_id ascending.",
    examples: [
      {
        input: "Ada's trips: 40 km, 60 km and 25 km completed, plus one 10 km cancelled ride",
        output: "1 · Ada · 125",
        explanation:
          "The cancelled 10 never attaches; 40 + 60 + 25 = 125 is the whole sum.",
      },
      {
        input: "Bram holds two cancelled trips (30 and 12) and Cleo holds no trips at all",
        output: "2 · Bram · 0 · 3 · Cleo · 0",
        explanation:
          "Bram's SUM is NULL over no attached rows — COALESCE makes it 0; Cleo's row exists only because the join starts from User.",
      },
    ],
    constraints: [
      "one row per user in User — zero completed trips report total_distance 0 (not NULL, not a missing row)",
      "total_distance sums distance over completed trips only; cancelled distance never enters any total",
      "columns user_id, name, total_distance — ordered by user_id ascending",
    ],
    breakdown: [
      "The spine of the report is User: every user must surface exactly once, so the FROM side is fixed before any arithmetic. An INNER join lets Trip decide who exists — Cleo, with no Trip rows at all, would vanish, and a distance report that loses a rider is wrong in a way that never errors. A LEFT JOIN threads all five User rows through regardless, and the trips attach where they match. The output shape — five rows for five users — is decided at the join, not at the aggregate.",
      "The status filter has exactly one safe home: the ON clause. Placed in a WHERE, t.status = 'completed' runs after the join, where Bram's unmatched row carries a NULL status — NULL never equals 'completed', so the rows the LEFT JOIN preserved get filtered away and the report collapses back to the INNER join's three users. Inside the ON, the condition merely decides which Trip rows may attach: Ada's three completed rides join, her cancelled 10 km ride never does. Filter-before-join and filter-after-join are different queries here, and only one of them keeps the zeros.",
      "SUM over a group whose trips all failed to attach returns NULL, not 0 — the sum of nothing is unknown, and Bram's row would read NULL exactly where the report demands 0. COALESCE(SUM(t.distance), 0) is the coercion that turns 'no rows joined' into the number the contract asks for. GROUP BY u.user_id, u.name groups on identity with the display name riding along, and ORDER BY u.user_id fixes the final order. Note the asymmetry: users drive the report, so a trip pointing at no user would appear in no row at all — that orphan direction is a different query.",
    ],
    edges: [
      "Bram's two cancelled rows (30 and 12 km): a status-blind SUM reports 42 — worse than NULL, it is a confidently wrong number; the ON-clause filter keeps both rows from ever attaching.",
      "Cleo has no Trip rows: an INNER join (or the status filter misplaced into WHERE) deletes her; LEFT JOIN plus COALESCE ships (3, 'Cleo', 0).",
      "Bram's SUM before COALESCE is NULL, because 30 and 12 are cancelled and no completed distance attaches: dropping the COALESCE prints NULL where the contract says 0.",
      "Ada's trip 104 (10 km, 'cancelled'): without the status filter her total reads 135 instead of 125 — the cancelled row sits inside her group and must be excluded before the SUM runs.",
    ],
    ladder: [
      { title: "Brute force — walk the users", body: "For each user, scan their trips, add the completed distances, and print 0 when there are none. Three loops the engine folds into a filtered join plus one aggregate." },
      { title: "The pattern — spine LEFT JOIN, ON-filtered, COALESCEd sum", body: "FROM User LEFT JOIN Trip ON the user key AND status = 'completed', GROUP BY the user, COALESCE(SUM(distance), 0) — each clause carries one line of the contract." },
      { title: "The optimal idea — join direction, ON placement, NULL coercion", body: "O(u + t). The durable trio of 'include the empties' reports: the spine table decides WHO appears, the ON clause decides WHAT attaches, and COALESCE decides WHAT a silent group prints." },
    ],
    approach: "User LEFT JOIN Trip with status in the ON, GROUP BY user, COALESCE(SUM(distance), 0)",
    schema: {
      ddl: `CREATE TABLE User (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);
CREATE TABLE Trip (
  trip_id  INTEGER PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES User(user_id),
  distance INTEGER NOT NULL,
  status   TEXT NOT NULL          -- 'completed' or 'cancelled'
);`,
      seed: `INSERT INTO User (user_id, name) VALUES
  (1, 'Ada'),
  (2, 'Bram'),
  (3, 'Cleo'),    -- no trips at all
  (4, 'Dov'),
  (5, 'Esme');
INSERT INTO Trip (trip_id, user_id, distance, status) VALUES
  (101, 1, 40, 'completed'),
  (102, 1, 60, 'completed'),
  (103, 1, 25, 'completed'),
  (104, 1, 10, 'cancelled'),   -- must never enter Ada's total
  (105, 2, 30, 'cancelled'),   -- Bram: cancelled only
  (106, 2, 12, 'cancelled'),
  (107, 4, 42, 'completed'),   -- Dov's single ride
  -- 108 is Esme's filler trip
  (108, 5, 7,  'completed');`,
      tables: [
        { name: "User", note: "5 riders — Cleo (3) owns no Trip rows" },
        { name: "Trip", note: "8 rides — Ada mixes completed and cancelled, Bram is cancelled-only, Dov and Esme completed, Cleo absent" },
      ],
    },
    code: `SELECT
    u.user_id,
    u.name,
    COALESCE(SUM(t.distance), 0) AS total_distance   -- 0, never NULL, never absent
FROM User u
LEFT JOIN Trip t
  ON t.user_id = u.user_id
 AND t.status = 'completed'      -- cancelled rows never attach, so they never sum
GROUP BY u.user_id, u.name
ORDER BY u.user_id;`,
    walkthrough: [
      "The LEFT JOIN pins all five User rows and lets only completed trips attach: Ada 3, Bram 0, Cleo 0, Dov 1, Esme 1.",
      "SUM reads 40 + 60 + 25 = 125 for Ada, 42 for Dov and 7 for Esme; Bram and Cleo have no attached distances, so their SUMs come back NULL.",
      "COALESCE rewrites the two NULLs to 0, and ORDER BY user_id ships (1, 'Ada', 125), (2, 'Bram', 0), (3, 'Cleo', 0), (4, 'Dov', 42), (5, 'Esme', 7).",
    ],
    time: "O(u + t) — one scan of each table, hashed on the key",
    space: "O(u) — one total per user",
    followUps: [
      "Add a cancelled_count column beside the total — what does COUNT(t.trip_id) report for Bram and Cleo, and why does COUNT(*) report 1 for both?",
      "Report only users whose completed distance is above the average completed distance — where does the average live (a second pass over the COALESCEd totals), and how do the zeros drag it down?",
    ],
    related: ["top-travellers", "trips-and-users", "count-apples-and-oranges"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "calculate-orders-within-each-interval",
    statement:
      "OrderRun records warehouse picks: (order_id, quantity). Bucket every order by quantity into three FIXED intervals with CLOSED bounds — small: 1 through 3, medium: 4 through 6, large: 7 through 10 — where each bound is inclusive, so quantity 3 is small and quantity 4 is medium. Report columns interval, order_count, total_quantity: one row per interval, where order_count is the number of orders in the bucket and total_quantity is their summed quantity. Order the rows by the interval's lower bound — small, then medium, then large — never by the label's alphabetical order.",
    examples: [
      {
        input: "orders of quantity 1, 3, 2 and 2",
        output: "small · 4 · 8",
        explanation:
          "Both edges (1 and 3) belong to the closed range; 1 + 3 + 2 + 2 = 8 across four orders.",
      },
      {
        input: "orders of quantity 7, 10 and 9",
        output: "large · 3 · 26",
        explanation:
          "7 and 10 are the bucket's closed edges; the row sorts LAST even though 'large' sorts FIRST alphabetically.",
      },
    ],
    constraints: [
      "intervals are closed: small = 1..3, medium = 4..6, large = 7..10; every quantity in OrderRun lies within 1..10, so no row is unbucketed",
      "one row per interval: order_count counts the bucket's orders, total_quantity sums their quantity",
      "columns interval, order_count, total_quantity — ordered by the interval's lower bound: small, then medium, then large",
    ],
    breakdown: [
      "Bucketing is a per-row mapping, and the CASE expression is its whole machinery: three WHEN branches, each testing a closed range. BETWEEN 1 AND 3 is inclusive at both ends — that is the statement's contract, and the seed plants both edges of every bucket to hold the query to it. Order 2 (quantity 3) must stay small while order 3 (quantity 4) must turn medium: one unit apart, different buckets. An exclusive-upper scheme (quantity < 4, quantity < 7) describes the same partition but invites off-by-one drift when the bounds are retyped; the closed form says exactly what it means.",
      "Once every row carries a label, GROUP BY interval collapses the table into three groups, and two aggregates answer two questions at once: COUNT(*) for how many orders and SUM(quantity) for how much volume. Both are plain group aggregates — no windows, no ranking functions — because the bucket label is attached BEFORE the grouping, inside a CTE. Computing the label in a CTE rather than inline keeps the buckets auditable on their own: select from the CTE without the GROUP BY and you can see exactly which row landed where. That audit trail matters precisely at the boundaries, where every bucketing bug will be found.",
      "The ordering is the trap the problem is really about. The three labels sort alphabetically as large, medium, small — precisely backwards for a report that reads like a size scale — so ORDER BY interval alone ships the rows inverted. The durable fix is to order by an explicit rank the query defines for itself: a CASE mapping small to 1, medium to 2, large to 3, placed in the ORDER BY. A second-order trap hides behind it: the seed's medium and large both hold 3 orders, so ordering by the visible order_count column cannot split them either — only the rank key is a contract.",
    ],
    edges: [
      "Order 2 (quantity 3) versus order 3 (quantity 4): an exclusive upper bound (quantity < 3 for small) pushes order 2 into medium — small prints (3, 5) instead of (4, 8) and medium inflates to (4, 18).",
      "ORDER BY interval ships large, medium, small — every row inverted, because 'large' sorts first alphabetically; only the CASE-mapped rank restores small, medium, large.",
      "medium and large both count 3 orders here: a tiebreak attempted on order_count is powerless (3 = 3), so the rank key is not cosmetic — it is the only deterministic ordering in the output.",
      "A quantity outside 1..10 would fall through the CASE to NULL and form its own NULL-labelled group instead of erroring — the stated guarantee that quantities stay within 1..10 is what lets the three-way CASE be total.",
    ],
    ladder: [
      { title: "Brute force — three filtered passes", body: "Filter quantities 1 through 3 and count and sum them, repeat for 4 through 6 and 7 through 10, then stitch the three result rows by hand. Three scans the engine folds into one labelling pass and one GROUP BY." },
      { title: "The pattern — CASE label, then GROUP BY the label", body: "A CTE stamps each row with its interval via closed-range CASE branches; GROUP BY interval with COUNT(*) and SUM(quantity) aggregates all buckets in a single pass." },
      { title: "The optimal idea — aggregate once, rank the labels yourself", body: "O(n). The durable rules: bucket labels are data, so let CASE (or a bounds table) mint them, and never trust a label's alphabetical luck — order by an explicit rank key that survives relabelling." },
    ],
    approach: "CASE maps quantity to closed buckets, GROUP BY the label, ORDER BY a CASE-mapped rank small-medium-large",
    schema: {
      ddl: `CREATE TABLE OrderRun (
  order_id INTEGER PRIMARY KEY,
  quantity INTEGER NOT NULL         -- guaranteed within 1..10
);`,
      seed: `INSERT INTO OrderRun (order_id, quantity) VALUES
  (1, 1),   -- small lower edge
  (2, 3),   -- small upper edge
  (3, 4),   -- medium lower edge
  (4, 5),   -- the middle of medium
  (5, 6),   -- medium upper edge
  (6, 7),   -- large lower edge
  (7, 10),  -- large upper edge
  (8, 2),   -- small filler
  (9, 9),   -- large filler
  -- 10 is another small filler
  (10, 2);`,
      tables: [
        { name: "OrderRun", note: "10 picks — every bucket edge (1, 3, 4, 6, 7, 10) plus fillers; small lands 4 orders for 8, medium 3 for 15, large 3 for 26" },
      ],
    },
    code: `WITH buckets AS (
    SELECT
        order_id,
        quantity,
        CASE
            WHEN quantity BETWEEN 1 AND 3  THEN 'small'    -- closed: 1 and 3 included
            WHEN quantity BETWEEN 4 AND 6  THEN 'medium'   -- closed: 4 and 6 included
            WHEN quantity BETWEEN 7 AND 10 THEN 'large'    -- closed: 7 and 10 included
        END AS interval
    FROM OrderRun
)
SELECT
    interval,
    COUNT(*)      AS order_count,
    SUM(quantity) AS total_quantity
FROM buckets
GROUP BY interval
-- scale order, not alphabetical
ORDER BY CASE interval WHEN 'small' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END;`,
    walkthrough: [
      "The CTE stamps a label on each of the ten orders: small picks up {1, 3, 2, 2}, medium {4, 5, 6}, large {7, 10, 9}.",
      "GROUP BY interval aggregates the three buckets: small counts 4 and sums 8, medium counts 3 and sums 15, large counts 3 and sums 26.",
      "The rank CASE orders the rows small (4, 8), medium (3, 15), large (3, 26) — ORDER BY interval alone would have printed large (3, 26) first.",
    ],
    time: "O(n) — one labelling pass and one grouped pass",
    space: "O(1) beyond the three buckets",
    followUps: [
      "Report an empty bucket instead of skipping it (say, no orders land in medium) — what spine do you need (the three intervals with their bounds), and how does a LEFT JOIN from it keep (medium, 0, 0) alive?",
      "Drive the bucket edges from data (a Bands table of lower and upper bounds) — how does join-based bucketing replace the CASE, and what happens to the ORDER BY rank?",
    ],
    related: ["count-salary-categories", "the-category-of-each-member-in-the-store", "create-a-session-bar-chart"],
    order: "exact",
    xp: 20,
  },
];
