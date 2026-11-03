import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l67-mcqs";
import { ROWS as PROBS } from "./banks/l67-problems";

export const lesson67: Lesson = {
  id: "lesson-67",
  num: 67,
  title: "Slowly changing dimensions — history that answers",
  blurb:
    "Buyers move. When Bruno's region changed on 2024-08-01, the warehouse didn't edit his row — it closed one version and opened another, half-open windows and all. This lesson builds both treatments hands-on: Type 1 corrections in place, Type 2 history by version, and the as-of joins that make 'region at sale time' a join instead of a guess",
  minutes: 22,
  blocks: [
    {
      kind: "p",
      text: "Lesson 66 promised that `dim_customer`'s 21 rows answer 'region at sale time'. This lesson makes you **build** that machinery. Sources change — a buyer relocates, an account flag was mislabeled, a company renames a region — and the warehouse must decide, attribute by attribute, whether the change **corrects** the past (Type 1) or **extends** it (Type 2). Pick wrong and either history becomes unprovable or the dimension balloons. The seed carries five real moves: Alice, Bruno, Grace, Jamal and Olivia each changed region mid-history, which is why 16 buyers are 21 versions.",
    },
    { kind: "diagram", figure: "m14-scd-timeline" },
    { kind: "h", text: "Type 1: the correction" },
    {
      kind: "code",
      caption: "The feed was wrong — fix it everywhere, keep no history of the mistake",
      sql: `UPDATE dim_customer SET active = 1
WHERE customer_id = 11;              -- Keiko: the inactive flag was a feed bug
-- Type 1 in one line: every version of the buyer, updated in place.
-- No new rows, no windows touched. The change becomes unprovable — deliberately.`,
    },
    {
      kind: "bullets",
      items: [
        "**Type 1 fits corrections, not events.** 'The flag was wrong' has no history worth keeping — the truth was always 'active'. A relocation is different: both regions were TRUE in their eras.",
        "**Type 1 hits ALL versions.** The mistake infected every row of the buyer — filtering to `is_current = 1` would leave the stale flag in history, and as-of probes would resurrect the bug.",
        "**The taxonomy in one breath**: Type 0 = never changes (birth date); Type 1 = overwrite (corrections); Type 2 = version (events); Type 3 = one step back ('previous_region' column); Type 4 = park high-churn attributes in their own mini-dimension.",
      ],
    },
    { kind: "h", text: "Type 2: the move, as two statements" },
    {
      kind: "code",
      caption: "Maya Patel (13) moves APAC → US effective 2025-02-01",
      sql: `-- 1. CLOSE the current era (half-open: its last day is Jan 31st)
UPDATE dim_customer
SET valid_to = '2025-02-01', is_current = 0
WHERE customer_id = 13 AND is_current = 1;

-- 2. OPEN the new era with a FRESH surrogate
INSERT INTO dim_customer (customer_sk, customer_id, name, region, active,
                          valid_from, valid_to, is_current)
SELECT MAX(customer_sk) + 1, customer_id, name, 'US', active,
       '2025-02-01', '9999-12-31', 1
FROM dim_customer
WHERE customer_id = 13;`,
    },
    {
      kind: "bullets",
      items: [
        "**Close, then open — never UPDATE the old row's attributes.** The old version keeps its region forever; only its `valid_to` moves. Rewriting it would falsify the era it recorded.",
        "**The new version gets a NEW surrogate** (`MAX(customer_sk) + 1` at course scale; sequences in production). Surrogates are never reused — that's what makes fact keys permanent addresses.",
        "**The window discipline is the invariant**: every date lands in exactly one version. After the move, Maya has two rows: APAC `[1900-01-01, 2025-02-01)` and US `[2025-02-01, 9999-12-31)`. An as-of probe at 2025-02-01 returns US — the change date belongs to the new era.",
      ],
    },
    { kind: "h", text: "The MERGE pattern, spelled out" },
    {
      kind: "p",
      text: "Warehouse engines wrap this in one statement — `MERGE INTO dim_customer USING feed ON … WHEN MATCHED THEN UPDATE (close) … WHEN NOT MATCHED THEN INSERT (open)` — and Snowflake makes the clause pairing explicit. SQLite has no MERGE; the UPDATE+INSERT pair **is** the merge logic, and writing it by hand once teaches what the engines do under the hood. The graded problems run both statements inside the course's sandboxed transaction — executed for real, then rolled back, exactly like module 7's write verbs.",
    },
    {
      kind: "code",
      caption: "The as-of probe — the load's receipt, and every report's first question",
      sql: `SELECT region FROM dim_customer
WHERE customer_id = 13
  AND '2025-02-15' >= valid_from
  AND '2025-02-15' <  valid_to;      -- → US · exactly one row, always`,
    },
    {
      kind: "warn",
      text: "BETWEEN is the SCD killer. `'2024-08-01' BETWEEN valid_from AND valid_to` matches BOTH of Bruno's versions on his change date — the probe errors, or worse, double-counts his sales. Half-open windows exist precisely so this class of bug is structurally impossible.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "MERGE with WHEN MATCHED THEN UPDATE SET valid_to = feed.effective_on, is_current = FALSE chains the close; the INSERT opens. Snowflake also offers ASOF JOIN semantics for time-series lookups — the same half-open logic, keyword-native.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres can make overlaps physically impossible: an EXCLUDE constraint (GiST on customer_id WITH =, daterange(valid_from, valid_to) WITH &&) rejects any load that would double-match a date. The database enforces the invariant, not just the code.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's MERGE runs the same two clauses; its scripting wraps the pair in one transaction. Remember BigQuery bills per column scanned — versioned dimensions keep history compact precisely because reports scan them by partition filters.",
    },
    {
      kind: "tip",
      text: "The reviewer's three checks for any Type 2 change: (1) exactly one current version per buyer, (2) no inverted or overlapping windows, (3) an as-of probe at the change date returns the NEW value in exactly one row. All three are one query each — the problems below grade all three.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A passport, not a driver's license. The license UPDATEs: change your address, the old one is gone, the registry keeps only now. The passport VERSIONS: page after page of visas, each stamped with its own window, and border control asks 'what did this passport hold on March 3rd?' — a question the license structurally cannot answer. Your dimension is a passport: every era physically present, half-open windows as stamps. The Type 1 UPDATE is the license habit — and it's correct exactly when the old value was never true.",
    },
    {
      kind: "engine",
      title: "What the load does when a feed row says 'Maya moved'",
      steps: [
        "Match on natural key: feed.customer_id = 13 finds her current version (is_current = 1).",
        "Attribute compare: region differs (APAC vs US) → this is an EVENT, not a correction.",
        "Close: UPDATE the current version's valid_to to the feed's effective date, is_current = 0.",
        "Open: INSERT a new version — new surrogate, new region, valid_from = effective date, open end = sentinel.",
        "Probe: as-of SELECT at effective date returns the new region in exactly one row. The invariant holds; the fact's keys never change.",
      ],
    },
    {
      kind: "myth",
      myth: "Type 2 is always better — history is free.",
      truth:
        "History costs storage, load complexity, and analyst attention: every as-of join must respect windows, every grouping must pick a version semantics. Calm attributes (region) earn it; high-churn attributes (cart contents, balances) explode a Type 2 dim — they belong on the fact, in a mini-dimension (Type 4), or nowhere.",
    },
    {
      kind: "myth",
      myth: "The fact's customer_key should be updated when the customer changes.",
      truth:
        "The key IS the truth: it points at the version that was valid when the sale happened. Updating it to the current version re-dates every historical sale to today — 'region at sale time' becomes 'region at last edit', and the whole warehouse quietly lies.",
    },
    {
      kind: "edge",
      items: [
        { c: "The change date falls on a sale day — whose region do that day's sales get?", r: "Half-open answers uniformly: the change date belongs to the NEW era (old window excludes its own valid_to). Sales on 2024-08-01 loaded with sk 4. If the business wants midnight-boundary semantics, the feed's effective_on says so — the load implements the feed, not folklore." },
        { c: "Two moves in one feed batch (APAC → US on Jan 1, US → EU on Feb 1).", r: "Apply in effective-date order: close current, open middle version with valid_to = second date, open final. The invariant check (one current per buyer, no overlaps) is what catches a mis-ordered batch." },
        { c: "The correction arrives that a move NEVER happened (wrong feed row).", r: "Type 2 must be UNDONE: delete the new version, re-open the old one (valid_to back to sentinel, is_current = 1). Fact keys that pointed at the deleted version must re-resolve — this is why re-loadable facts beat edited facts." },
        { c: "Can a version be zero days long (two moves same date)?", r: "With [from, to) the middle version would be empty [X, X) — legal but useless. Merge same-date moves into one transition (APAC → EU directly) at load time." },
        { c: "Why MAX(customer_sk) + 1 and not customer_id * 10 + version?", r: "Derived schemes encode meaning into the surrogate — the one thing it must not have. A monotonic counter is dumb on purpose; production assigns from sequences to survive concurrency." },
      ],
    },
  ],
  mcqs: mcqBank("l67", MCQS),
  problems: probBankX("l67", PROBS),
  takeaway:
    "Type 1 overwrites (corrections hit every version); Type 2 closes-and-opens (new surrogate, half-open windows, sentinel open end) — facts keep pointing at the era their sale happened in, and the as-of probe at any date returns exactly one version, always.",
};
