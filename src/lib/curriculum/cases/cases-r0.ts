// M5 audit-rule test batch — 2 cases (w1 text, w3 window) to shake out the new case-audit rules.
import type { CaseStudy } from "./types";

export const casesR0: CaseStudy[] = [
  {
    id: "cs-1201",
    tier: "easy",
    topic: "w1",
    universe: "growth",
    title: "Case-normalized region census",
    brief:
      "Growth board deck: the intern pasted region labels in whatever case the CRM exported, so 'EU', 'eu' and 'Eu' all showed up as separate rows in last quarter's census. Before this seed we normalized on write, but the report pattern still has to fold case variants together at read time. Produce the case-normalized region census for the EU group only, one row, with the customer count.",
    ask: "How many customers sit in the EU group once region is case-normalized with UPPER?",
    template:
      "SELECT {1}(region) AS norm, {2} AS n\nFROM customers\nGROUP BY norm\nHAVING norm = 'EU' AND n = {3};",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the case normalizer",
        why: "UPPER(region) folds 'EU'/'eu'/'Eu' into one comparable key — grouping by the normalized expression is the whole trick. Probed census: EU 8 / APAC 5 / US 2 / LATAM 1." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the rows folded into each group — exactly one group survives the HAVING, so the output is EU | 8. SUM(region) would coerce text to 0." },
      { answer: "8", kind: "number", label: "the EU customer count",
        why: "Probed: the EU bucket holds 8 of the 16 customers — the figure the deck quotes, and it must match the n column exactly or the census contradicts itself." },
    ],
    distractors: ["5", "LOWER", "MAX"],
    walkthrough:
      "The stakeholder's problem is case fragmentation, so the first move is normalizing the key: UPPER(region) in the SELECT makes every variant land in the same bucket, and GROUP BY norm folds 16 rows into 4 clean groups — EU 8, APAC 5, US 2, LATAM 1. The HAVING pins the EU bucket and asserts its count: n = 8. COUNT(*) is the honest counter — a constant chip like 5 would print EU | 5, LOWER would compare 'eu' against 'EU' and find nothing, and MAX(region) would grab 'US' (the text-max) and leave the HAVING empty. The figure 8 is both the answer chip and the value in the result — census and query agree.",
  },
  {
    id: "cs-1202",
    tier: "easy",
    topic: "w3",
    universe: "growth",
    title: "The one-row leaderboard",
    brief:
      "The growth deck opens with a single hero stat: our biggest customer. The team already agreed the leaderboard SQL should rank every customer by lifetime spend and keep just the champion, but the draft lost its sort direction and its LIMIT during a refactor. Rebuild the query so it returns exactly one row: the top spender with their total.",
    ask: "Which customer tops the lifetime-spend leaderboard, and what is their total?",
    template:
      "SELECT c.name, ROUND(SUM(o.total), {1}) AS spend, RANK() OVER (ORDER BY SUM(o.total) {2}) AS rk\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY rk\nLIMIT {3};",
    slots: [
      { answer: "2", kind: "number", noVerify: true, label: "the money rounding",
        why: "Two decimals is the ledger convention for money — probed, ROUND(SUM, 2) prints 7262.35. ROUND at 0 would flatten the hero stat to 7262 and cents would silently vanish from the deck." },
      { answer: "DESC", kind: "keyword", label: "the leaderboard direction",
        why: "Biggest spender first means sorting the window's crowd descending. ASC would crown the smallest spender — probed, that's Olivia Brown at 444.80, not the hero stat the deck wants." },
      { answer: "1", kind: "number", label: "the hero-row limit",
        why: "ORDER BY rk puts rank 1 on top, so LIMIT 1 keeps exactly the champion. Probed: Alice Chen, 7262.35 — the 16 spends are all distinct so RANK has no ties to fight." },
    ],
    distractors: ["ASC", "0", "MAX"],
    walkthrough:
      "Windows rank without collapsing: the join fans out to 103 orders, GROUP BY folds them into 16 customer-spends, and RANK() OVER (ORDER BY SUM(o.total) DESC) stamps each customer with its position in that descending crowd. ORDER BY rk is presentation — it puts rank 1 first — and LIMIT 1 keeps just the hero row. Probed: Alice Chen 7262.35, with Emma Wilson 6640.56 next. Flip the direction and the query still runs, but it crowns Olivia Brown 444.80 — a correct query answering the wrong question. LIMIT 16 would hand the deck all sixteen rows instead of the one-line opener.",
  },
];
