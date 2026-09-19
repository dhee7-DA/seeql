// Predict-the-output bank — mental execution practice.
//
// Every correct grid below was produced by running the SQL against the live
// seed db (receipts: tool-results/practice-banks-facts*.txt). The wrong
// grids are engineered from real misconceptions: the = NULL myth, fanout
// counting, forgotten WHERE, reversed sorts, groups that don't exist.
// Learners see the query and the relevant table grain, pick the grid the
// engine will actually return, and every choice is coached.

import type { CellValue } from "@/lib/sql-types";

export interface PredictChoice {
  columns: string[];
  rows: CellValue[][];
  /** Coaching shown when THIS choice is picked — why it is (or isn't) what runs. */
  why: string;
}

export interface PredictItem {
  /** Stable id, e.g. "p1" — XP ledger key `predict:p1`. */
  id: string;
  title: string;
  /** In-world ask — what the stakeholder wants from this query. */
  blurb: string;
  /** Lesson flavor reference (the module that teaches the technique). */
  lessonNum: number;
  sql: string;
  /** Which tables the learner may peek at in the data explorer. */
  tables: string[];
  choices: PredictChoice[];
  answer: number;
  /** Mastery skill tag. */
  skill: string;
}

export const PREDICTS_XP = 8;

export const PREDICTS: PredictItem[] = [
  {
    id: "p1",
    title: "The regional head-count",
    blurb:
      "A board member asks: “how many of our sixteen members are in the US region?” — and sends this query. Before you run it: what does the engine return?",
    lessonNum: 3,
    sql: "SELECT COUNT(*)\nFROM customers\nWHERE region = 'US';",
    tables: ["customers"],
    choices: [
      {
        columns: ["COUNT(*)"],
        rows: [[2]],
        why: "Exactly — two customers carry region 'US'. COUNT(*) counts rows after the WHERE gate, and only two rows survive it.",
      },
      {
        columns: ["COUNT(*)"],
        rows: [[16]],
        why: "16 is the whole roster — that's COUNT(*) with no WHERE at all. The filter dropped every non-US row before the counting happened.",
      },
      {
        columns: ["COUNT(*)"],
        rows: [[0]],
        why: "0 would mean no row matched — as if the region were stored 'usa' or 'US ' with padding. It isn't: two rows hold exactly 'US', and = compares the stored text as-is.",
      },
      {
        columns: ["COUNT(*)"],
        rows: [[4]],
        why: "4 is the number of distinct regions (APAC, EU, LATAM, US) — a count of groups, not of members. One query counts rows; the other needs GROUP BY.",
      },
    ],
    answer: 0,
    skill: "where",
  },
  {
    id: "p2",
    title: "Top three cities",
    blurb:
      "“Which three cities have the most members?” The roster is small, and the query sorts by count then city. Freeze the exact grid you expect.",
    lessonNum: 5,
    sql: "SELECT city, COUNT(*) AS n\nFROM customers\nGROUP BY city\nORDER BY n DESC, city\nLIMIT 3;",
    tables: ["customers"],
    choices: [
      {
        columns: ["city", "n"],
        rows: [
          ["Austin", 1],
          ["Berlin", 1],
          ["Chicago", 1],
        ],
        why: "That's the grid. Every city holds exactly one member, so all counts tie at 1 — and the tiebreak ORDER BY city sorts the ties alphabetically. Austin, Berlin, Chicago.",
      },
      {
        columns: ["city", "n"],
        rows: [
          ["Berlin", 3],
          ["Austin", 1],
          ["Chicago", 1],
        ],
        why: "Berlin 3 feels right for a capital, but the roster has no duplicate cities — every GROUP BY bucket holds exactly one row. Check the data explorer: sixteen members, sixteen cities.",
      },
      {
        columns: ["city", "n"],
        rows: [
          ["Austin", 1],
          ["Berlin", 1],
          ["Chicago", 1],
          ["Denver", 1],
        ],
        why: "Four rows means the LIMIT didn't bite. LIMIT 3 cuts the output after sorting — the fourth city (alphabetically) never makes the grid.",
      },
      {
        columns: ["city", "n"],
        rows: [
          ["Chicago", 1],
          ["Berlin", 1],
          ["Austin", 1],
        ],
        why: "Reversed ties. ORDER BY n DESC, city means ties on n fall back to city ASC — A before B before C. For Z-first ties you'd need ORDER BY city DESC.",
      },
    ],
    answer: 0,
    skill: "groupby",
  },
  {
    id: "p3",
    title: "The example.com census",
    blurb:
      "An audit asks how many roster emails end in @example.com. The LIKE pattern looks loose. What comes back?",
    lessonNum: 3,
    sql: "SELECT COUNT(*) AS with_email_like\nFROM customers\nWHERE email LIKE '%@example.com';",
    tables: ["customers"],
    choices: [
      {
        columns: ["with_email_like"],
        rows: [[16]],
        why: "All sixteen. Every roster email ends in @example.com, the trailing % matches everything before it, and LIKE folds case only for ASCII letters — the addresses are lowercase, so all match.",
      },
      {
        columns: ["with_email_like"],
        rows: [[0]],
        why: "0 would mean the pattern matched nobody — that happens when the suffix is wrong ('@example.org') or the column holds NULLs. Here the domain is exactly @example.com and email is NOT NULL.",
      },
      {
        columns: ["with_email_like"],
        rows: [[15]],
        why: "15 implies one address breaks the pattern — a different domain or an uppercase variant. Peek in the data explorer: all sixteen are uniform lowercase @example.com addresses.",
      },
      {
        columns: ["with_email_like"],
        rows: [[1]],
        why: "1 would be right for a pattern with no leading % — LIKE 'c%@example.com' matches only addresses starting with c. The leading % is what makes this match every row.",
      },
    ],
    answer: 0,
    skill: "where",
  },
  {
    id: "p4",
    title: "The status ledger",
    blurb:
      "A finance one-pager wants per-status order counts and revenue. The query groups, sums, rounds, and sorts by status name. Freeze the grid.",
    lessonNum: 8,
    sql: "SELECT status,\n       COUNT(*) AS n,\n       ROUND(SUM(total), 2) AS value\nFROM orders\nGROUP BY status\nORDER BY status;",
    tables: ["orders"],
    choices: [
      {
        columns: ["status", "n", "value"],
        rows: [
          ["cancelled", 7, 1152.49],
          ["delivered", 52, 15571.07],
          ["pending", 14, 6113],
          ["shipped", 30, 11996.72],
        ],
        why: "Exactly the ledger. ORDER BY status sorts alphabetically — cancelled, delivered, pending, shipped — regardless of the numbers, and pending's ROUND displays as plain 6113 because the digits after the point are .00.",
      },
      {
        columns: ["status", "n", "value"],
        rows: [
          ["delivered", 52, 15571.07],
          ["shipped", 30, 11996.72],
          ["pending", 14, 6113],
          ["cancelled", 7, 1152.49],
        ],
        why: "Same numbers, wrong order — this is sorted by value. The query says ORDER BY status, and SQL sorts text alphabetically: c before d before p before s.",
      },
      {
        columns: ["status", "n", "value"],
        rows: [
          ["cancelled", 7, 1152.49],
          ["delivered", 52, 15571.07],
          ["pending", 14, 6113],
          ["shipped", 30, 11996.72],
          ["refunded", 0, 0],
        ],
        why: "GROUP BY only creates buckets for values that exist. A refunded status with zero orders never appears — there are no rows for it to group. Buckets come from data, not from wishes.",
      },
      {
        columns: ["status", "n", "value"],
        rows: [
          ["cancelled", 7, 1152.49],
          ["delivered", 52, 15571.07],
          ["pending", 14, 6113],
          ["shipped", 30, 11996.72],
          [null, 0, null],
        ],
        why: "A NULL bucket would appear only if status held NULLs. The column is NOT NULL, so every order lands in one of the four real buckets.",
      },
    ],
    answer: 0,
    skill: "groupby",
  },
  {
    id: "p5",
    title: "The unshipped pile",
    blurb:
      "Ops wants to know how many orders have never shipped. The query uses the dedicated emptiness test. What does it return?",
    lessonNum: 4,
    sql: "SELECT COUNT(*) AS shipped_null\nFROM orders\nWHERE shipped_at IS NULL;",
    tables: ["orders"],
    choices: [
      {
        columns: ["shipped_null"],
        rows: [[21]],
        why: "21. IS NULL is the only test that matches the emptiness itself — pending and cancelled orders all carry NULL shipped_at, and twenty-one rows qualify.",
      },
      {
        columns: ["shipped_null"],
        rows: [[0]],
        why: "0 is the = NULL myth answering: WHERE shipped_at = NULL matches nothing, because = with an unknown is unknown. The query here uses IS NULL, which is exactly the fix for that.",
      },
      {
        columns: ["shipped_null"],
        rows: [[82]],
        why: "82 is the flipped twin — IS NOT NULL. Those are the orders that DID ship. One character of SQL separates the shipped pile from the unshipped one.",
      },
      {
        columns: ["shipped_null"],
        rows: [[103]],
        why: "103 is every order — what you'd get with no WHERE at all. The gate keeps only the rows whose shipped_at hole is real.",
      },
    ],
    answer: 0,
    skill: "null",
  },
  {
    id: "p6",
    title: "The big-ticket count",
    blurb:
      "“How many orders hit 500 or more?” The boundary comparison matters here. What does the engine say?",
    lessonNum: 3,
    sql: "SELECT COUNT(*) AS big_orders\nFROM orders\nWHERE total >= 500;",
    tables: ["orders"],
    choices: [
      {
        columns: ["big_orders"],
        rows: [[25]],
        why: "25. The range is inclusive: >= admits orders at exactly 500.00 as well as anything above.",
      },
      {
        columns: ["big_orders"],
        rows: [[24]],
        why: "24 is the > 500 answer — it drops any order sitting exactly on the boundary. >= versus > is one character with real consequences on inclusive thresholds.",
      },
      {
        columns: ["big_orders"],
        rows: [[78]],
        why: "78 is the complement — total < 500. The comparison points the wrong way, so the query counts everything except the big tickets.",
      },
      {
        columns: ["big_orders"],
        rows: [[103]],
        why: "103 is the unfiltered count. The WHERE gate is what keeps the small orders out.",
      },
    ],
    answer: 0,
    skill: "where",
  },
  {
    id: "p7",
    title: "The region roll-call",
    blurb:
      "A dropdown needs the list of regions we actually sell in — deduplicated and sorted. Freeze the output.",
    lessonNum: 6,
    sql: "SELECT DISTINCT region\nFROM customers\nORDER BY region;",
    tables: ["customers"],
    choices: [
      {
        columns: ["region"],
        rows: [["APAC"], ["EU"], ["LATAM"], ["US"]],
        why: "Exactly. DISTINCT collapses duplicates before ORDER BY, and the four stored region codes sort alphabetically: APAC, EU, LATAM, US.",
      },
      {
        columns: ["region"],
        rows: [["US"], ["EU"], ["APAC"], ["LATAM"]],
        why: "That's the order of first appearance in the table, not a sorted order. Without ORDER BY, SQL promises no sequence at all — with it, the roll-call is alphabetical.",
      },
      {
        columns: ["region"],
        rows: [["APAC"], ["EU"], ["LATAM"], ["US"], [null]],
        why: "A fifth NULL row would mean some customer has no region. region is NOT NULL on this roster — there is no empty bucket to dedupe.",
      },
      {
        columns: ["region"],
        rows: [["LATAM"], ["US"], ["EU"], ["APAC"]],
        why: "Neither alphabetical nor by appearance — this looks like insertion order of a different table. Sorting is deterministic here: A first, U last.",
      },
    ],
    answer: 0,
    skill: "select",
  },
  {
    id: "p8",
    title: "The fanout invoice",
    blurb:
      "An analyst counts “line items on pending orders” by joining order_items to orders. The join fans out. What number comes back — and is it what they asked for?",
    lessonNum: 15,
    sql: "SELECT COUNT(*) AS pairs\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nWHERE o.status = 'pending';",
    tables: ["order_items", "orders"],
    choices: [
      {
        columns: ["pairs"],
        rows: [[36]],
        why: "36 — and that's the trap to flag. 14 pending orders own 36 line items: the join duplicates each order row once per item, so COUNT(*) counts order×item pairs, not orders.",
      },
      {
        columns: ["pairs"],
        rows: [[14]],
        why: "14 is the number of pending ORDERS — the intuitive answer. But the join fans out: each pending order contributes one row per line item, so the count lands on 36 pairs.",
      },
      {
        columns: ["pairs"],
        rows: [[0]],
        why: "0 would mean no pending order has items. Every order does — the join matches, and the pairs pile up to 36.",
      },
      {
        columns: ["pairs"],
        rows: [[251]],
        why: "251 is every line item in the database — the join with no status filter. The WHERE clause drops non-pending orders and their items before the count.",
      },
    ],
    answer: 0,
    skill: "joins",
  },
];
