// Deep-dives — premium SQL batch V, file 5 of 6: trending hashtags (twice),
// bursty click days, events inside bounded sessions, Friday buckets and
// digit runs. All reads, all result-level ORDER BY. Own tables, own seeds,
// original phrasing throughout.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_TRENDS: LcSqlDive[] = [
  {
    slug: "find-trending-hashtags",
    statement:
      "A microblog table stores one row per post: Post(post_id, content, posted_at), with content as free text and dates in 'YYYY-MM-DD' form. A hashtag is a token that starts with '#', is immediately followed by at least one word character (letters, digits or underscore), and ends at the next whitespace — so a lone '#' hanging in a post is not a tag, and tags are case-sensitive exactly as typed. Report the top 3 tags by usage, where every occurrence counts: columns tag, usage_count, ordered by usage_count descending then tag ascending, keeping exactly the first three rows.",
    examples: [
      {
        input:
          "posts 1, 2, 3 and 5 all mention #Dawn (post 2 also carries #Peak, post 5 also carries #Trail)",
        output: "#Dawn · 4",
        explanation:
          "Four posts carry #Dawn, so its usage_count is 4 and it leads the board; the other tags on those same posts tally separately.",
      },
      {
        input:
          "post 6 reads '#Trail #Zen to close the week and #trail at night plus a stray # tag'",
        output: "#Trail · 1 from this post (plus #Zen · 1 and #trail · 1)",
        explanation:
          "Case-sensitivity keeps #Trail and #trail apart, and the bare '#' fails the word-character rule, so it never becomes a group at all.",
      },
    ],
    constraints: [
      "exactly three rows survive: rank tags by usage_count descending with tag ascending as the tie rule, then keep ROW_NUMBER <= 3",
      "tags are case-sensitive and reported with their '#': '#Trail' and '#trail' are two different tags, and the output shows '#Dawn', not 'Dawn'",
      "a hashtag must start with '#' followed by at least one word character and ends at whitespace — a lone '#' is not a tag",
    ],
    breakdown: [
      "The counting is easy; producing the tokens is the whole task. Content is free text, so there is no column to GROUP BY until each post has been chopped at whitespace into candidate tokens, and SQL ships no split function to lean on. The reliable engine shape is a WITH RECURSIVE walker: the anchor holds the whole content padded with one trailing space, and each step emits the text up to the next space as a token while carrying the remainder forward, stopping when nothing is left. The padding is not decoration — it guarantees the last token of a post also ends at a space, so the walk emits it instead of silently dropping it. Once tokens exist, the problem collapses into a plain GROUP BY token with COUNT(*).",
      "Filtering tokens deserves one precise predicate, not a loose one. The stated rule — a '#' immediately followed by at least one word character — is exactly the GLOB pattern '#[a-zA-Z0-9_]*', which is case-sensitive by nature and demands at least one character from the class right after the '#'. The tempting shortcut LIKE '#%' accepts any token that merely starts with '#', so post 6's stray '#' would be counted as a tag nobody typed, growing the tally from 5 groups to 6. GLOB is the right tool here precisely because it supports character classes AND compares case-sensitively, which the rules of this report demand. Lowercasing tokens before grouping would be a second, quieter bug: it fuses '#Trail' and '#trail' into one three-mention tag that never existed.",
      "The top-3 cut needs an ordering that survives ties, and the only defensible form names both keys. ROW_NUMBER() OVER (ORDER BY usage_count DESC, tag ASC) stamps a strict 1..N sequence over the tallied tags, and rn <= 3 keeps exactly three rows no matter how the counts cluster. The tie rule is not cosmetic: without tag ASC as the secondary key, equal counts ship in engine-dependent order, and any ties-included variant (RANK-style thinking) changes how many rows survive a cutoff. On this seed the cutoff lands cleanly — counts 4, 3, 2, 1, 1 leave the two one-mention tags '#Zen' and '#trail' below the boundary, so the third row ('#Trail', 2) is unique. The window's own ORDER BY does the ranking; the outer query repeats it as a result-level ORDER BY, because a WHERE clause never sorts anything.",
    ],
    edges: [
      "Post 6 ends '...plus a stray # tag': the bare '#' fails GLOB '#[a-zA-Z0-9_]*' and produces no group. A LIKE '#%' filter admits it — the full tally grows from 5 groups and 11 mentions to 6 groups and 12, a tag made of nothing, fatal to any variant of this report that prints more than the top 3.",
      "Post 4 is 'fog rolls over #Peak' — the content ENDS with a hashtag and carries no trailing space in storage. The anchor pads content with one space precisely so this token is emitted; a walker that forgets the pad loses it, '#Peak' falls to 2, and the rank-3 slot becomes a '#Peak' versus '#Trail' tie the seed never intended.",
      "Posts 5 and 6 both carry '#Trail', and post 6 also carries '#trail'. Lowercasing before grouping fuses them into a 3-count tag that ties '#Peak' and rewrites the podium with a count nobody measured; the rules make tags case-sensitive, so no normalisation is allowed.",
      "'#Zen' and '#trail' tie at 1 below the cutoff: harmless to the top 3 on this seed (counts 4-3-2 are distinct), but a query that extends the cut to include ties, or drops the tag ASC tiebreak, ships the pair in arbitrary order or adds rows the top 3 never asked for.",
    ],
    ladder: [
      { title: "Brute force — hash-map the tokens", body: "Read every post in application code, split content on spaces, collect '#' tokens into a map, sort by count descending and tag ascending, take the first three. Correct, but it is a pipeline the engine expresses in one statement." },
      { title: "The pattern — recursive tokenizer, GLOB filter, window cut", body: "A WITH RECURSIVE walker turns content into tokens once; GLOB '#[a-zA-Z0-9_]*' keeps real hashtags; GROUP BY counts them; ROW_NUMBER over (usage_count DESC, tag ASC) with rn <= 3 cuts the top three." },
      { title: "The optimal idea — pad the walk, class the filter, name the tie key", body: "O(C) characters walked plus O(t log t) to rank t tags. The durable rules: tokenize with a padded recursive walker (the trailing space makes the last token emitted), filter with a character-class GLOB (case-sensitive, word character required), and cut tops with ROW_NUMBER plus a stated tie key — never with LIMIT alone." },
    ],
    approach: "WITH RECURSIVE space-split tokenizer, GLOB '#[a-zA-Z0-9_]*' hashtag filter, GROUP BY tag, ROW_NUMBER over (count DESC, tag ASC) <= 3",
    schema: {
      ddl: `CREATE TABLE Post (
  post_id   INTEGER PRIMARY KEY,
  content   TEXT NOT NULL,
  posted_at TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Post (post_id, content, posted_at) VALUES
  (1, 'morning run at #Dawn then #Peak loops', '2024-06-01'),
  (2, '#Dawn walk, then a #Peak climb', '2024-06-02'),
  (3, 'chasing the #Dawn light on the ridge', '2024-06-03'),
  (4, 'fog rolls over #Peak', '2024-06-04'),  -- content ENDS with a hashtag: the padding test
  (5, '#Trail day and a #Dawn swim', '2024-06-05'),
  (6, '#Trail #Zen to close the week and #trail at night plus a stray # tag', '2024-06-06');`,
      tables: [
        { name: "Post", note: "6 posts, 11 hashtag tokens over 5 distinct tags — #Dawn 4, #Peak 3, #Trail 2, #Zen 1, #trail 1 (case-sensitive), plus one stray bare '#'" },
      ],
    },
    code: `WITH RECURSIVE split(post_id, token, rest) AS (
    SELECT post_id, '', content || ' '          -- pad: the last token must end at a space too
    FROM Post
  UNION ALL
    SELECT post_id,
           substr(rest, 1, instr(rest, ' ') - 1),  -- token up to the next space
           substr(rest, instr(rest, ' ') + 1)      -- remainder keeps the walk going
    FROM split
    WHERE rest <> ''
),
tags AS (
    SELECT token AS tag
    FROM split
    WHERE token GLOB '#[a-zA-Z0-9_]*'   -- '#', then >= 1 word character — kills the lone '#'
),
tally AS (
    SELECT tag, COUNT(*) AS usage_count
    FROM tags
    GROUP BY tag                        -- case-sensitive by default — #Trail != #trail
)
SELECT tag, usage_count
FROM (
    SELECT tag, usage_count,
           ROW_NUMBER() OVER (ORDER BY usage_count DESC, tag ASC) AS rn
    FROM tally
)
WHERE rn <= 3                            -- top 3 only — the 1-1 tail below never reaches it
ORDER BY usage_count DESC, tag ASC;`,
    walkthrough: [
      "The recursive walker chops six posts into whitespace tokens; post 6 alone yields '#Trail', '#Zen', '#trail' and the bare '#' — the GLOB filter keeps the first three and rejects the bare '#'.",
      "The tally counts the 11 surviving tokens: '#Dawn' 4 (posts 1, 2, 3, 5), '#Peak' 3 (posts 1, 2, 4), '#Trail' 2 (posts 5, 6), then '#Zen' and '#trail' at 1 each — two distinct tags, case kept.",
      "ROW_NUMBER over (usage_count DESC, tag ASC) ranks them 1 through 5, rn <= 3 keeps three rows, and the output ships ('#Dawn', 4), ('#Peak', 3), ('#Trail', 2) — the 1-1 tie never reaches the podium.",
    ],
    time: "O(C + t log t) — C characters walked once, t distinct tags ranked",
    space: "O(t) — one tally row per distinct tag",
    followUps: [
      "Print the full tally beside each tag's rank, including the 1-1 tail — where does the stray '#' surface if the filter weakens to LIKE '#%', and how would you show case-folded equivalents without merging them in the count?",
      "Make the cutoff a parameter k read from a one-row settings table — which literal moves, and what would the output become at k = 4 given the 1-1 tie waiting below the boundary?",
    ],
    related: ["count-occurrences-in-text", "rank-scores", "find-followers-count"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-trending-hashtags-ii",
    statement:
      "The same microblog table now carries its author: Post(post_id, author_id, content, posted_at). A hashtag follows the earlier rules — a '#' followed by at least one word character, ending at whitespace, case-sensitive — but trending is measured by REACH, not volume: an author who types a tag seven times is still one author. Report the top 3 tags by the number of DISTINCT authors who used them: columns tag, unique_authors, ordered by unique_authors descending then tag ascending, keeping exactly three rows.",
    examples: [
      {
        input:
          "#Glow appears 7 times across posts 1, 4, 5 and 6, written by four different authors (author 1 twice inside post 1, authors 2 and 3 twice each, author 4 once)",
        output: "#Glow · 4",
        explanation:
          "Repeats collapse: seven mentions from four people count 4, because the metric is COUNT(DISTINCT author_id), not the mention count.",
      },
      {
        input: "#Bloom appears 8 times, all from three authors (2, 5 and 6)",
        output: "#Bloom · 3",
        explanation:
          "More mentions, fewer people: 8 raw mentions lose to #Glow's 4 distinct authors, so a raw-count leaderboard would crown the wrong tag.",
      },
    ],
    constraints: [
      "unique_authors counts DISTINCT author_id per tag — an author repeating a tag inside one post or across many still counts once",
      "the tokenization rules carry over: '#' followed by at least one word character, ending at whitespace, tags case-sensitive and reported with their '#'",
      "exactly three rows: ROW_NUMBER over (unique_authors DESC, tag ASC) <= 3 — a tie at the cutoff is broken alphabetically and the loser drops out entirely",
    ],
    breakdown: [
      "The single word that separates this report from its predecessor is DISTINCT, and it flips the leaderboard. COUNT(DISTINCT author_id) counts people; COUNT(*) counts mentions — and the two disagree the moment anyone repeats a tag. On this seed #Bloom owns 8 mentions to #Glow's 7, yet those 8 come from only three authors while the 7 come from four: the raw tally crowns #Bloom, the reach tally crowns #Glow, and both queries compile and run without complaint. Deciding which count the metric means is the analysis; in SQL it is one keyword. A safer intermediate form deduplicates the (author_id, tag) pairs first, after which a plain COUNT(*) per tag means the same thing as the DISTINCT aggregate.",
      "The tokenizer carries over unchanged, with one addition: the recursive walker must now drag author_id through every step so each token knows who typed it. The anchor selects (post_id, author_id, '', content || ' ') and the recursive step repeats the author_id beside the substr work — omit it there and the tag loses its author by the time the filter runs. The GLOB predicate '#[a-zA-Z0-9_]*' again enforces the word-character rule, and again it is what keeps noise tokens out of the tally. Nothing about splitting on spaces changes when a second column rides along; the walker stays one deterministic statement with no host-language loop.",
      "The cutoff is where this problem earns its difficulty. The distinct-author counts land 4, 3, 2, 2 — a tie sits exactly at the third slot, and the alphabet is the only referee: ROW_NUMBER over (unique_authors DESC, tag ASC) puts '#Dusk' (D before P) at rank 3 and sends '#Peak' home with no row and no mention. That decision — the cutoff counts ROWS, not tied values — must be stated, because the ties-included reading (RANK over the count alone) would admit BOTH two-author tags and ship four rows for a top 3. Once the window function is chosen, the outer query re-applies the same two keys as a result-level ORDER BY; the output is graded row by row, and a three-row answer with the wrong third row is still wrong.",
    ],
    edges: [
      "#Bloom's 8 raw mentions (posts 3, 7, 8) beat #Glow's 7 (posts 1, 4, 5, 6) — a raw COUNT(*) query ships '#Bloom' first with 8, while the distinct-author truth puts ('#Glow', 4) on top. The seed is built so the two metrics disagree on the winner, not just the tail.",
      "The rank-3 slot is a 2-2 tie between '#Dusk' and '#Peak': tag ASC keeps '#Dusk' as row 3 and '#Peak' misses the output entirely — a ties-included RANK() over the count alone prints four rows.",
      "Author 5 tags #Dusk once in post 7 and again in post 9 — two posts, one person. A query that counts distinct (author, post) pairs per tag and sums them reads 3 for '#Dusk' and mislabels the third row; COUNT(DISTINCT author_id) reads 2, which is what keeps the 2-2 tie alive for '#Peak' to lose.",
      "Author 1 repeats '#Glow' twice inside post 1, and authors 2 and 3 repeat it inside posts 4 and 5 — every one of those repeats collapses to nothing under COUNT(DISTINCT author_id). A plain token count reports 7 for '#Glow' and inverts the podium with '#Bloom' first.",
    ],
    ladder: [
      { title: "Brute force — build the pair set by hand", body: "In application code, split every post, collect a SET of (author, tag) pairs, count authors per tag and sort. The set IS the DISTINCT — the engine expresses it inside one aggregate." },
      { title: "The pattern — tokenizer with a passenger, DISTINCT count, row-number cut", body: "Recursive tokenizer (author_id riding along) -> GLOB filter -> GROUP BY tag with COUNT(DISTINCT author_id) -> ROW_NUMBER over (unique_authors DESC, tag ASC) with rn <= 3." },
      { title: "The optimal idea — reach is a DISTINCT count, cutoffs declare their semantics", body: "O(C + t log t). The durable rules: reach is COUNT(DISTINCT key), and the pairs can be deduplicated early so the final aggregate is a plain count; a cutoff at a tie must declare rows-versus-ties semantics explicitly or it silently rewrites the answer." },
    ],
    approach: "recursive tokenizer with author_id, GLOB hashtag filter, GROUP BY tag with COUNT(DISTINCT author_id), ROW_NUMBER <= 3 on (count DESC, tag ASC)",
    schema: {
      ddl: `CREATE TABLE Post (
  post_id   INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  content   TEXT NOT NULL,
  posted_at TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Post (post_id, author_id, content, posted_at) VALUES
  (1, 1, '#Glow at dawn #Glow again by the lake', '2024-06-01'),
  (2, 1, '#Peak on a rest day', '2024-06-01'),
  (3, 2, '#Bloom #Bloom #Bloom through spring', '2024-06-02'),
  (4, 2, '#Glow morning, #Glow dusk', '2024-06-02'),
  (5, 3, '#Dusk #Dusk then #Glow #Glow late', '2024-06-03'),
  (6, 4, '#Glow once is enough', '2024-06-03'),
  (7, 5, '#Bloom #Bloom #Bloom and one #Dusk', '2024-06-04'),
  (8, 6, '#Bloom #Bloom then #Peak to finish', '2024-06-04'),
  -- row 9: author 5 repeats #Dusk across posts
  (9, 5, '#Dusk again after dark', '2024-06-05');`,
      tables: [
        { name: "Post", note: "9 posts from 6 authors — #Glow: 7 mentions over 4 authors, #Bloom: 8 over 3, #Dusk: 4 over 2, #Peak: 2 over 2" },
      ],
    },
    code: `WITH RECURSIVE split(post_id, author_id, token, rest) AS (
    SELECT post_id, author_id, '', content || ' '   -- author_id rides the anchor
    FROM Post
  UNION ALL
    SELECT post_id, author_id,                      -- and the recursion: tokens keep their author
           substr(rest, 1, instr(rest, ' ') - 1),
           substr(rest, instr(rest, ' ') + 1)
    FROM split
    WHERE rest <> ''
),
tags AS (
    SELECT author_id, token AS tag
    FROM split
    WHERE token GLOB '#[a-zA-Z0-9_]*'   -- same hashtag rule as before
),
tally AS (
    SELECT tag, COUNT(DISTINCT author_id) AS unique_authors   -- people, not mentions
    FROM tags
    GROUP BY tag
),
ranked AS (
    SELECT tag, unique_authors,
           ROW_NUMBER() OVER (ORDER BY unique_authors DESC, tag ASC) AS rn
    FROM tally
)
SELECT tag, unique_authors
FROM ranked
WHERE rn <= 3                            -- three ROWS — the 2-2 tie is broken alphabetically
ORDER BY unique_authors DESC, tag ASC;`,
    walkthrough: [
      "The walker chops 9 posts into author-tagged tokens and the GLOB filter keeps all 21 hashtag mentions — #Glow 7, #Bloom 8, #Dusk 4, #Peak 2.",
      "COUNT(DISTINCT author_id) collapses the repeats: author 1's double '#Glow' inside post 1 and author 5's '#Dusk' across posts 7 and 9 each count once — the tallies read 4, 3, 2, 2.",
      "ROW_NUMBER over (unique_authors DESC, tag ASC) ranks '#Glow' 1, '#Bloom' 2, then breaks the 2-2 tie alphabetically — '#Dusk' 3, '#Peak' 4 — and the output ships ('#Glow', 4), ('#Bloom', 3), ('#Dusk', 2): three rows exactly.",
    ],
    time: "O(C + t log t) — one walk over C characters, t tags ranked",
    space: "O(p) — one (author, tag) pair per distinct usage",
    followUps: [
      "Report each tag's raw mention count beside its reach and flag the tags where the two metrics disagree — which seed rows create the gap, and what single keyword separates the two columns?",
      "Extend the cutoff rule to 'all tags tied with the third row' — which window function expresses that, and what would the output become on this seed's 2-2 tie?",
    ],
    related: ["friend-requests-ii-who-has-the-most-friends", "find-followers-count", "article-views-ii"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-bursty-behavior",
    statement:
      "Activity logs one row per recorded user-day: Activity(activity_id, user_id, activity_date, clicks), dates in 'YYYY-MM-DD' text form — several rows may share a (user_id, activity_date) and their clicks add up to that day's total. A user is BURSTY when their peak single-day clicks is at least three times their AVERAGE daily clicks, where the average runs over the days they were actually active — and a user needs at least 2 active days to qualify at all. Report every bursty user: columns user_id, peak_day (the date of their maximum), peak_clicks, avg_clicks rounded to 2 decimals, ordered by user_id ascending.",
    examples: [
      {
        input: "user 1 logs 18 and 12 clicks on 2024-06-03, then 2, 2, 3 and 3 clicks on four later days",
        output: "1 · 2024-06-03 · 30 · 8.0",
        explanation:
          "The two same-day rows sum to a single-day 30; five active days total 40 clicks, so the average is 8.0 and 30 >= 24 makes the user bursty.",
      },
      {
        input: "user 2 logs exactly 10 clicks on each of three days",
        output: "(no row)",
        explanation:
          "A steady user has peak equal to average — 10 against 10 — and 10 is nowhere near the 30 the burst test demands, so no row ships.",
      },
    ],
    constraints: [
      "the average runs over ACTIVE days only — calendar days between a user's first and last activity with no logged rows contribute nothing",
      "users with fewer than 2 active days are excluded before the burst arithmetic is even evaluated",
      "columns user_id, peak_day, peak_clicks, avg_clicks (ROUND to 2 places), ordered by user_id; a user appears at most once, on their peak day",
    ],
    breakdown: [
      "The unit of analysis is the user-day, not the logged row. User 1's peak day arrives as two rows (18 and 12) — a window or aggregate applied over raw rows would read a maximum of 18 and an average over six rows instead of five, and the burst test would fail a user who is plainly bursty. So the first CTE collapses Activity to one row per (user_id, activity_date) with SUM(clicks) as day_clicks, and every later measurement runs over that daily grain. The GROUP BY here is not about removing duplicates — it defines what a DAY is before any ratio touches the data.",
      "With the daily rows in hand, the per-user facts are window facts: MAX, AVG and COUNT(*) over PARTITION BY user_id stamp each user's peak, average and active-day count onto every one of their rows. The AVG over the daily partition averages active days by construction — a gap day such as user 1's empty 2024-06-04 or 2024-06-07 never becomes a row, so it never dilutes the average the way a calendar-span average (40 over 8 days = 5.0) would. The same partition marks where the peak lives: the row whose day_clicks equals the partition MAX is the peak day, and on this seed every user's maximum is unique, so each surviving user keeps exactly one row. COUNT(*) OVER (...) is the quiet third fact — the two-active-days gate is just another column to filter on.",
      "Two filtering rules do the analytic work, and both are contractual. The >= 2 active days gate is not pedantry: a single-day user's average IS their peak, so the ratio degenerates — and on this seed user 3's lone day carries 0 clicks, where the ungated test 0 >= 3 × 0 happily passes and would print a bursty user with zero clicks. The comparison is >=, not >: user 4's peak of 12 sits at exactly three times an exact average of 4.0 — the five days 12, 2, 2, 2, 2 total 20 over 5 — and a strict > would silently drop the textbook boundary case. Rounding to 2 decimals is display-only; the comparison must run on the raw average, or a crafted near-boundary user could flip on a rounded value.",
    ],
    edges: [
      "User 1's 2024-06-03 is two rows (18 and 12): windowing RAW rows gives max 18 and average 40 over 6 rows, so 18 >= 20 fails and the burstiest user vanishes — grouping to the day first yields peak 30, average 8.0 and a clean admission.",
      "User 3 has exactly one active day, carrying 0 clicks: ungated, 0 >= 3 × 0 passes and prints (3, '2024-06-05', 0, 0.0) — the >= 2 active days gate is the only thing standing between the report and that nonsense row.",
      "User 4's peak of 12 is exactly 3 × 4.0: >= admits them, a strict > drops user 4 and the output shrinks to one row.",
      "User 1 is active 2024-06-03 through 2024-06-10 but logged nothing on 06-04, 06-07 and 06-09: an average over CALENDAR days (40 over 8 = 5.0) understates them — the average must run over the five ACTIVE days (8.0), which is what the daily CTE guarantees.",
    ],
    ladder: [
      { title: "Brute force — per-user day list, then arithmetic", body: "For each user, list their days, compute max and mean by hand, test the ratio, write out the peak row. Three moving parts — max, mean, gate — that map one-to-one onto window expressions over a daily CTE." },
      { title: "The pattern — daily CTE, then per-user windows", body: "CTE one: GROUP BY user_id, activity_date with SUM(clicks). CTE two: MAX, AVG and COUNT windows partitioned by user_id. Outer query: keep rows where active_days >= 2, day_clicks = peak, and day_clicks >= 3 × average." },
      { title: "The optimal idea — measure on the grain the ratio is defined on", body: "O(n log n) for the partitioned sort. The durable rules: ratios live on the grain they are defined over (user-day, not row), gates and boundaries compare raw values with rounding reserved for display, and a single-element partition never reaches a ratio test." },
    ],
    approach: "daily SUM per (user, day), then MAX/AVG/COUNT windows per user, filter active_days >= 2 AND peak >= 3x avg on the peak row",
    schema: {
      ddl: `CREATE TABLE Activity (
  activity_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  activity_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  clicks        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Activity (activity_id, user_id, activity_date, clicks) VALUES
  (1,  1, '2024-06-03', 18),  -- user 1's peak day arrives as TWO rows
  (2,  1, '2024-06-03', 12),  -- ...summing to a single-day 30
  (3,  1, '2024-06-05', 2),   -- gaps on 06-04, 06-07 and 06-09 are NOT active days
  (4,  1, '2024-06-06', 2),
  (5,  1, '2024-06-08', 3),
  (6,  1, '2024-06-10', 3),
  (7,  2, '2024-06-03', 10),
  (8,  2, '2024-06-04', 10),
  (9,  2, '2024-06-05', 10),
  (10, 3, '2024-06-05', 0),   -- one active day, zero clicks — the gate's punisher
  (11, 4, '2024-06-03', 2),
  (12, 4, '2024-06-04', 12),
  (13, 4, '2024-06-05', 2),
  (14, 4, '2024-06-06', 2),
  (15, 4, '2024-06-07', 2);`,
      tables: [
        { name: "Activity", note: "15 rows, 4 users — user 1: 6 rows over 5 active days (peak 30, avg 8.0), user 2: three 10s, user 3: one 0-click day, user 4: 5 days totalling 20 (peak 12, avg 4.0)" },
      ],
    },
    code: `WITH daily AS (
    SELECT
        user_id,
        activity_date,
        SUM(clicks) AS day_clicks          -- one row per ACTIVE day
    FROM Activity
    GROUP BY user_id, activity_date
),
framed AS (
    SELECT
        user_id,
        activity_date,
        day_clicks,
        MAX(day_clicks) OVER (PARTITION BY user_id) AS peak_clicks,
        AVG(day_clicks) OVER (PARTITION BY user_id) AS avg_clicks,
        COUNT(*)       OVER (PARTITION BY user_id) AS active_days
    FROM daily
)
SELECT
    user_id,
    activity_date AS peak_day,
    peak_clicks,
    ROUND(avg_clicks, 2) AS avg_clicks
FROM framed
WHERE active_days >= 2                     -- the gate — before any ratio is trusted
  AND day_clicks = peak_clicks             -- keep the peak day itself (unique on this seed)
  AND day_clicks >= 3 * avg_clicks         -- bursty — >= admits the exact boundary
ORDER BY user_id;`,
    walkthrough: [
      "The daily CTE merges user 1's two 2024-06-03 rows into one 30-click day and leaves the rest intact — five daily rows for user 1, three for user 2, one for user 3, five for user 4.",
      "The per-user windows stamp peak, average and day count: user 1 gets (30, 8.0, 5), user 2 (10, 10.0, 3), user 3 (0, 0.0, 1), user 4 (12, 4.0, 5).",
      "The filters admit user 1 (30 >= 24) and user 4 (12 >= 12 exactly), reject user 2 (10 < 30) and gate out user 3's single day — ORDER BY user_id ships (1, '2024-06-03', 30, 8.0) then (4, '2024-06-04', 12, 4.0).",
    ],
    time: "O(n log n) — one grouped pass plus partitioned window sorts",
    space: "O(d) — one row per active user-day",
    followUps: [
      "Report each user's peak-to-average ratio beside the verdict and include the users who failed — how does the gate interact with a zero average, and which seed row would force you to handle that division?",
      "Make the burst factor configurable (a row in a Params table instead of the hardcoded 3) — which literal moves, and does the exactly-at-boundary user still qualify at a factor of 3.5?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "game-play-analysis-iv", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "user-activities-within-time-bounds",
    statement:
      "Two tables describe app usage. UserSession holds listening sessions: (session_id, user_id, start_time, end_time), both timestamps in 'YYYY-MM-DD HH:MM:SS' text form. UserEvent holds discrete actions: (event_id, user_id, event_time, event_type). Count, for every session, the events that fall within it: an event belongs to a session only when its user_id matches the session's user AND start_time <= event_time <= end_time — both bounds closed. Report columns session_id, user_id, events_in_session, one row per session ordered by session_id ascending; sessions with no matching events report 0 and must still appear.",
    examples: [
      {
        input:
          "session 2 (user 2) runs 14:00:00 to 15:00:00 on 2024-06-04 — user 2 clicks at exactly 14:00:00 and scrolls at exactly 15:00:00",
        output: "2 · 2 · 2",
        explanation:
          "Both events sit ON the boundaries, and the bounds are closed — an event at start or at end is inside.",
      },
      {
        input:
          "session 3 (user 3) runs 18:30:00 to 19:30:00 on 2024-06-05 — user 2 scrolls at 19:00:00 (inside the window) and user 3 clicks at 19:30:01 (one second past the end)",
        output: "3 · 3 · 0",
        explanation:
          "The 19:00 event matches the window but not the user; the 19:30:01 event matches the user but misses the window by one second. Either arm failing means the event does not count.",
      },
    ],
    constraints: [
      "an event counts for a session only when BOTH arms hold: same user_id, and start_time <= event_time <= end_time with both bounds inclusive",
      "every session appears exactly once — a session matching nothing reports 0, never a missing row",
      "columns session_id, user_id, events_in_session, ordered by session_id ascending",
    ],
    breakdown: [
      "Matching events to sessions is a join whose ON clause IS the specification: equality on user_id plus two range comparisons on the timestamps. There is no BETWEEN-and-pray here — spelling the two comparisons explicitly (event_time >= start AND event_time <= end) keeps both bounds visibly closed, which is exactly where boundary bugs live. TEXT timestamps in 'YYYY-MM-DD HH:MM:SS' form compare correctly as strings because the format is fixed-width and most-significant-first, so no casting and no date arithmetic are needed. The join is naturally one-to-many — a session can hold many events — and the counting aggregate runs after the join has done the filtering.",
      "The requirement that empty sessions still report 0 decides the join direction before anything else. An INNER join keeps only matched session-event pairs, so session 4 — which matches nothing — would vanish from the output entirely, and the report would ship three rows where four sessions exist. A LEFT JOIN from UserSession threads every session through with NULLs on the event side when nothing matches, and COUNT(e.event_id) counts only the non-NULL event ids: 2, 2, 0, 0 on this seed. The aggregate choice is load-bearing — COUNT(*) counts the NULL-padded row itself and would report 1 for both empty sessions, a subtler and more confident wrong answer than a missing row.",
      "The user match and the time window are independent gates, and the seed punishes forgetting either one. Session 3's window (18:30 to 19:30) contains user 2's 19:00 scroll — a time-only join counts it and prints 1 for a session that truthfully holds none of its owner's events. The reverse arm fails too: user 3's own click at 19:30:01 is the right user but sits one second past end_time, so any bound loose by a second — or a join truncated to whole minutes — lets it in. Because both conditions live in the ON clause of a LEFT JOIN, a failing arm merely yields an unmatched row the LEFT JOIN absorbs; the same conditions in a WHERE would turn the LEFT JOIN into an INNER join for every NULL row they touch.",
    ],
    edges: [
      "Session 2's events sit exactly ON both boundaries (a 14:00:00 click and a 15:00:00 scroll): strict comparisons (> start, < end) drop both and print 0 — the bounds are closed, and the seed proves it twice inside one session.",
      "Event 7 is user 2's scroll at 2024-06-05 19:00:00, inside session 3's window but belonging to another user: dropping the user arm from the join prints session 3 as 1 instead of 0.",
      "Event 6 is user 3's click at 19:30:01 — one second AFTER session 3's end_time: a minute-truncated or second-sloppy bound admits it and prints 1; the exact TEXT comparison rejects it.",
      "Session 4 matches nothing: the LEFT JOIN plus COUNT(e.event_id) ships (4, 1, 0), while an INNER join deletes the row and COUNT(*) reports 1 — both wrong, in opposite directions.",
    ],
    ladder: [
      { title: "Brute force — scan events per session", body: "For each session, scan every event, check user and timestamps by hand, tally, and remember to print zero for empty sessions. The engine ships all of it as one LEFT JOIN with a three-clause ON." },
      { title: "The pattern — LEFT JOIN with the full predicate, then COUNT", body: "FROM UserSession LEFT JOIN UserEvent ON user match AND start <= event_time AND event_time <= end, GROUP BY session, COUNT(e.event_id) so zeros stay zero." },
      { title: "The optimal idea — interval membership is identity plus a closed range", body: "O(s + e) with a hash join on user_id. The durable rules: membership is a two-arm AND (identity plus closed range), empties survive only via LEFT JOIN plus a NULL-aware count, and fixed-width TEXT timestamps compare chronologically without casting." },
    ],
    approach: "LEFT JOIN UserEvent with ON user_id match AND closed time window, GROUP BY session, COUNT(event column) so zeros stay zero",
    schema: {
      ddl: `CREATE TABLE UserSession (
  session_id INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  start_time TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  end_time   TEXT NOT NULL   -- 'YYYY-MM-DD HH:MM:SS'
);
CREATE TABLE UserEvent (
  event_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  event_time TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  event_type TEXT NOT NULL
);`,
      seed: `INSERT INTO UserSession (session_id, user_id, start_time, end_time) VALUES
  (1, 1, '2024-06-03 09:00:00', '2024-06-03 10:00:00'),
  (2, 2, '2024-06-04 14:00:00', '2024-06-04 15:00:00'),
  (3, 3, '2024-06-05 18:30:00', '2024-06-05 19:30:00'),
  (4, 1, '2024-06-06 08:00:00', '2024-06-06 09:00:00');
INSERT INTO UserEvent (event_id, user_id, event_time, event_type) VALUES
  (1, 1, '2024-06-03 08:59:59', 'click'),   -- one second BEFORE session 1 opens
  (2, 1, '2024-06-03 09:10:00', 'click'),
  (3, 1, '2024-06-03 09:45:00', 'scroll'),
  (4, 2, '2024-06-04 14:00:00', 'click'),   -- exactly AT start — the closed lower bound
  (5, 2, '2024-06-04 15:00:00', 'scroll'),  -- exactly AT end — the closed upper bound
  (6, 3, '2024-06-05 19:30:01', 'click'),   -- one second AFTER session 3 closes
  -- event 7: user 2 inside session 3's window — the user-mismatch plant
  (7, 2, '2024-06-05 19:00:00', 'scroll');`,
      tables: [
        { name: "UserSession", note: "4 sessions over 3 users — session 2 matches two boundary events, sessions 3 and 4 match none of their owner's events" },
        { name: "UserEvent", note: "7 events — one 1s before session 1, two inside session 1, two ON session 2's boundaries, one 1s after session 3, one cross-user inside session 3" },
      ],
    },
    code: `SELECT
    s.session_id,
    s.user_id,
    COUNT(e.event_id) AS events_in_session   -- counts matched events — NULLs count as nothing
FROM UserSession s
LEFT JOIN UserEvent e
  ON e.user_id = s.user_id                   -- arm 1 — the event belongs to the session's user
 AND e.event_time >= s.start_time            -- arm 2 — closed lower bound
 AND e.event_time <= s.end_time              -- arm 3 — closed upper bound
GROUP BY s.session_id, s.user_id
ORDER BY s.session_id;`,
    walkthrough: [
      "The LEFT JOIN tests all 7 events against all 4 sessions under the three ON arms: session 1 matches events 2 and 3 (event 1 misses by one second on the start bound) and session 2 matches events 4 and 5 right ON its boundaries.",
      "Session 3 matches nothing: event 7 fails the user arm (user 2, not 3) and event 6 fails the end bound (19:30:01 > 19:30:00); session 4 matches nothing at all.",
      "COUNT(e.event_id) reads the matched ids only — 2, 2, 0, 0 — and ORDER BY session_id ships (1, 1, 2), (2, 2, 2), (3, 3, 0), (4, 1, 0), the empty sessions reporting zero instead of vanishing.",
    ],
    time: "O(s + e) — one pass over events hashed against sessions",
    space: "O(s) — one output row per session",
    followUps: [
      "Report each event beside its owning session (or NULL when it falls in none) — how does flipping the driving table change who can appear, and which seed events land outside every session of their user?",
      "Flag overlapping sessions of the same user — can one event legitimately belong to two sessions, and what would the per-session count do under double membership that a per-event assignment would not?",
    ],
    related: ["user-activity-for-the-past-30-days-ii", "students-and-examinations", "market-analysis-i"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "friday-purchase-iii",
    statement:
      "Purchase records every sale as one row: (purchase_id, user_id, item_name, amount, purchase_date), dates in 'YYYY-MM-DD' text form. Report monthly spending restricted to FRIDAY purchases: for each month and item bought on at least one Friday of that month, columns month (the 'YYYY-MM' text of the Friday's date), item_name and total_spent (the sum of that item's Friday-only amounts in the month), ordered by month ascending then item_name ascending. Purchases on any other weekday are invisible to this report — they neither add to totals nor create rows.",
    examples: [
      {
        input:
          "Mug bought on Friday 2024-06-07 for 4 and Friday 2024-06-14 for 6 — plus a 20 Mug purchase on Saturday 2024-06-08",
        output: "2024-06 · Mug · 10",
        explanation:
          "The two Friday amounts sum to 10; the Saturday 20 is excluded by the weekday filter and never reaches the sum.",
      },
      {
        input: "Kettle bought on Friday 2024-06-07 for 10 and again on Friday 2024-07-05 for 12",
        output: "2024-06 · Kettle · 10  and  2024-07 · Kettle · 12",
        explanation:
          "The month bucket keeps the two Fridays apart: one row per (month, item), never a merged all-time total.",
      },
    ],
    constraints: [
      "only purchases whose weekday is Friday contribute — the weekday test runs on each row BEFORE any grouping or summing",
      "month is derived from the purchase date itself ('YYYY-MM' via strftime), not from a separate column",
      "one row per (month, item_name) present among Friday purchases, ordered by month then item_name",
    ],
    breakdown: [
      "Two transformations stack here, and their order is forced. The weekday filter is a row-level WHERE — strftime('%w', purchase_date) returns the weekday as '0' (Sunday) through '6' (Saturday), so Friday is the literal '5' — and it must run before GROUP BY ever forms a bucket. Aggregate first and filter later is not merely slower, it is impossible to express honestly: once Mug's June group has formed, the 20 Saturday amount is already inside the SUM, and no HAVING can un-mix it. The seed plants that exact trap — dropping the WHERE turns June's Mug from 10 into 30, a number that includes a day the report was never allowed to see.",
      "The month bucket is a derived key, and deriving it from the date text keeps the statement honest. strftime('%Y-%m', purchase_date) reads the ISO date and yields '2024-06' or '2024-07' — a TEXT key that both groups correctly and orders correctly, since fixed-width ISO months sort lexicographically in calendar order. Grouping by item_name ALONE is the quiet mistake: Kettle is bought on a Friday in both months, and an item-only GROUP BY would merge 10 and 12 into one 22 row, reporting a total no month ever contained. The GROUP BY must carry both keys — the derived month and the item — so every (month, item) pair keeps its own row.",
      "The final shape falls out of the two-key GROUP BY plus the graded ORDER BY month, item_name. Ordering by a TEXT month is safe for the same reason the key itself is safe: fixed-width ISO strings sort in calendar order, so '2024-06' precedes '2024-07' without any date function in the ORDER BY. Item names break ties inside a month alphabetically — Kettle before Mug in both months on this seed. The output rows are totals, not shares: this report stops at SUM, and the percentage arithmetic that sibling problems hang off the same weekday filter has no role here.",
    ],
    edges: [
      "Row 4 is Mug's 20 on Saturday 2024-06-08 (strftime '%w' = '6'): dropping the Friday filter prints June's Mug as 30 — the planted Saturday amount mixed into a Friday-only total.",
      "Mug's June Fridays (4 on 06-07, 6 on 06-14) must sum to 10 — a query that groups before filtering, or filters with the wrong weekday code, changes either the contributing rows or the total itself.",
      "Kettle spans both months (10 in June, 12 in July): an item-only GROUP BY ships one ('Kettle', 22) row and the report loses a month — the derived month key must sit in the GROUP BY.",
      "strftime('%w') runs Sunday-'0' through Saturday-'6': a '%w' = '4' filter (Thursday) matches nothing on this seed and empties the report — Friday is '5', and '%W' (week of year) is a different creature entirely.",
    ],
    ladder: [
      { title: "Brute force — calendar in one hand, spreadsheet in the other", body: "Scan the purchases, keep the ones falling on a Friday (consulting a calendar for each date), then tally per month and item by hand. The engine does the calendar lookup with one strftime and one WHERE." },
      { title: "The pattern — weekday WHERE, then two-key GROUP BY", body: "WHERE strftime('%w', purchase_date) = '5' first, then GROUP BY strftime('%Y-%m', purchase_date), item_name with SUM(amount), then ORDER BY month, item_name." },
      { title: "The optimal idea — filter before the bucket, key with what you show", body: "O(n log n) for the grouped sort. The durable rules: weekday and month keys both come from strftime on the stored TEXT, the row filter runs BEFORE aggregation because a mixed bucket cannot be un-mixed, and every derived key in the SELECT must also sit in the GROUP BY." },
    ],
    approach: "WHERE strftime('%w', date) = '5' before GROUP BY strftime('%Y-%m'), item_name, SUM(amount), ORDER BY month, item_name",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  item_name     TEXT NOT NULL,
  amount        INTEGER NOT NULL,
  purchase_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Purchase (purchase_id, user_id, item_name, amount, purchase_date) VALUES
  (1, 1, 'Kettle', 10, '2024-06-07'),  -- Friday
  (2, 1, 'Mug',     4, '2024-06-07'),  -- Friday
  (3, 2, 'Mug',     6, '2024-06-14'),  -- Friday — Mug's June pair sums to 10
  (4, 2, 'Mug',    20, '2024-06-08'),  -- Saturday — the plant the %w filter must reject
  (5, 3, 'Kettle', 12, '2024-07-05'),  -- Friday — Kettle's July row
  -- row 6: Friday — Mug's only July Friday
  (6, 3, 'Mug',     5, '2024-07-12');`,
      tables: [
        { name: "Purchase", note: "6 purchases over 2 months — 5 Friday rows (Kettle 10; Mug 4 and 6 in June, Kettle 12 and Mug 5 in July) plus one planted Saturday Mug 20" },
      ],
    },
    code: `SELECT
    strftime('%Y-%m', purchase_date) AS month,
    item_name,
    SUM(amount) AS total_spent
FROM Purchase
WHERE strftime('%w', purchase_date) = '5'   -- Friday, BEFORE the month bucket
GROUP BY strftime('%Y-%m', purchase_date), item_name
ORDER BY month, item_name;`,
    walkthrough: [
      "The WHERE keeps five of the six rows: every 2024-06 Friday (07, 14) and every 2024-07 Friday (05, 12) passes the '%w' = '5' test, while the Saturday 06-08 row is dropped before any summing.",
      "GROUP BY month and item forms four buckets: June Kettle = 10, June Mug = 4 + 6 = 10, July Kettle = 12, July Mug = 5 — Kettle's two months stay two rows.",
      "ORDER BY month, item_name ships ('2024-06', 'Kettle', 10), ('2024-06', 'Mug', 10), ('2024-07', 'Kettle', 12), ('2024-07', 'Mug', 5) — the Saturday 20 appears nowhere.",
    ],
    time: "O(n log n) — one filtered pass, then a grouped sort",
    space: "O(g) — one row per surviving (month, item) group",
    followUps: [
      "Add each row's share of its month's Friday spending — where does the per-month denominator come from (a window over the groups, or a second pass), and which seed month would make that share exactly 100.0?",
      "Extend the filter to 'Friday or Saturday' with an IN list on the weekday code — what changes in the WHERE, and which planted row re-enters the totals?",
    ],
    related: ["friday-purchases-i", "friday-purchases-ii", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-products-with-three-consecutive-digits",
    statement:
      "Product is a catalogue of names: (product_id, product_name). Report the product_id of every product whose name contains at least three consecutive digits anywhere in the string — leading, embedded or trailing. One column, product_id, ordered by product_id ascending. The engine shape is a single GLOB predicate: character classes such as [0-9] work inside GLOB (which is case-sensitive overall), so a run of three digits is written directly into the pattern.",
    examples: [
      {
        input: "'Model X-1000 v2' — the model number carries four digits in a row",
        output: "2",
        explanation:
          "The rule is AT LEAST three consecutive digits: a four-digit run contains a three-digit run, so the row qualifies.",
      },
      {
        input: "'v1.2.3' — three digits in the name, but a dot between every one",
        output: "(no row)",
        explanation:
          "The digits never touch: consecutive means adjacent characters, and the dots break every run down to length 1.",
      },
    ],
    constraints: [
      "three consecutive digits ANYWHERE in the name — the pattern needs a leading and a trailing wildcard, not anchors",
      "the rule is at least three: longer digit runs match too",
      "one column product_id, ordered by product_id ascending",
    ],
    breakdown: [
      "Pattern matching over free-form names is exactly what GLOB exists for, and two of its properties fit this task perfectly. GLOB supports character classes — [0-9] is one digit, written three times for three digits — and it is case-sensitive, which matters for the surrounding letters and is harmless for digits. The full pattern '*[0-9][0-9][0-9]*' reads as a sentence: anything, then three digits side by side, then anything. The two wildcards are not decoration — dropping the leading one would only match names STARTING with three digits, and 'AB123CD', whose digits sit buried mid-string, would be missed.",
      "The nearest sibling operator fails silently here. LIKE looks superficially identical, but it does NOT support character classes — inside a LIKE pattern the text '[0-9]' matches a literal open bracket followed by those characters — so WHERE product_name LIKE '%[0-9][0-9][0-9]%' matches nothing at all on this catalogue and returns an empty report. The failure is quiet: no error, no warning, just zero rows that look plausible at a glance. Any formulation must be checked against a row that SHOULD match — an empty result is indistinguishable from a correct one by eyeball alone.",
      "The phrase 'contains three consecutive digits' carries an at-least reading, and the seed encodes the difference. 'Model X-1000 v2' holds a run of four — an exactly-three interpretation that demands the run END at a non-digit would fail it, yet any window of three adjacent digits inside a longer run satisfies 'three consecutive digits', which is the intent. The pattern needs no extra guards for this: '*[0-9][0-9][0-9]*' matches inside longer runs automatically. What it does need is both wildcards and the closed character class, and nothing more — guards such as a trailing non-digit turn a correct answer into a wrong one.",
    ],
    edges: [
      "'Model X-1000 v2' (id 2) matches through its four-digit run — an exactly-three reading that forbids a fourth adjacent digit drops a product the at-least rule admits.",
      "'Node 12' (id 4) holds only two adjacent digits and must stay out — relaxing the pattern to '*[0-9][0-9]*' admits it and inflates the output from four rows to five.",
      "'v1.2.3' (id 6) contains three digits in total but never three in a row — a 'three or more digits overall' check (or stripping the dots first) wrongly admits it.",
      "Swapping GLOB for LIKE empties the report: '%[0-9][0-9][0-9]%' is a literal-bracket pattern in LIKE, matches nothing on this seed, and fails without an error — '2024 edition' (id 5) is the row that proves a positive match exists.",
    ],
    ladder: [
      { title: "Brute force — count digit streaks per name", body: "Read each name, walk the characters counting digit streaks, and collect the ids whose streak reaches 3. The engine collapses that walk into one pattern predicate." },
      { title: "The pattern — one GLOB with a repeated digit class", body: "WHERE product_name GLOB '*[0-9][0-9][0-9]*' — wildcards on both sides, the digit class repeated three times, ORDER BY product_id to finish." },
      { title: "The optimal idea — GLOB owns classes, LIKE owns literals", body: "O(L) over the total length of all names. The durable rules: GLOB supports character classes while LIKE treats '[...]' as literal text, at-least-N runs need no boundary guards, and a leading plus trailing wildcard is what makes 'anywhere' true." },
    ],
    approach: "single GLOB '*[0-9][0-9][0-9]*' predicate, ORDER BY product_id",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES
  (1, 'Ultra 500 XL'),
  (2, 'Model X-1000 v2'),  -- four consecutive digits — at-least-3 still matches
  (3, 'AB123CD'),          -- embedded run
  (4, 'Node 12'),          -- only two adjacent digits
  (5, '2024 edition'),     -- leading run
  -- row 6: digits present, runs broken by dots
  (6, 'v1.2.3');`,
      tables: [
        { name: "Product", note: "6 catalogue rows — ids 1, 2, 3, 5 carry a 3+ digit run ('500', '1000', '123', '2024'); ids 4 ('12') and 6 ('v1.2.3') do not" },
      ],
    },
    code: `SELECT product_id
FROM Product
WHERE product_name GLOB '*[0-9][0-9][0-9]*'   -- three consecutive digits ANYWHERE
ORDER BY product_id;`,
    walkthrough: [
      "The GLOB scans six names: 'Ultra 500 XL' matches ('500'), 'Model X-1000 v2' matches ('1000' — a longer run containing three), 'AB123CD' matches ('123' embedded) and '2024 edition' matches (leading '2024').",
      "'Node 12' stops at two adjacent digits and 'v1.2.3' never stacks two — both fail the three-in-a-row run.",
      "ORDER BY product_id ships one column, four rows: 1, 2, 3, 5 — the at-least reading and the anywhere wildcards are what kept ids 2 and 5 in.",
    ],
    time: "O(L) — linear in the total length of all names",
    space: "O(k) — one output row per matching product",
    followUps: [
      "Report the matched run itself beside each product_id (the first three digits found) — which string function pairs with the GLOB filter, and what does 'Model X-1000 v2' show for its four-digit run?",
      "Invert the report to products with NO such run — which negation does the dialect offer (NOT GLOB), and which seed rows flip?",
    ],
    related: ["count-occurrences-in-text", "invalid-tweets", "patients-with-a-condition"],
    order: "exact",
    xp: 10,
  },
];
