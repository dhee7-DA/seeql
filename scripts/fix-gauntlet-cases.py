#!/usr/bin/env python3
"""Apply the case-audit round-1 fixes to M1 gauntlet case files."""
import pathlib

BASE = pathlib.Path("/home/z/my-project/src/lib/curriculum/gauntlet")

PATCHES = {
    "m01-cases-hard-a.ts": [
        # cs-2091: single-row result -> direction decoy ambiguous; OFFSET errors instead
        ('distractors: ["WHERE", ">=", "52", "ASC"],',
         'distractors: ["WHERE", ">=", "52", "OFFSET"],'),
        # cs-2092: 'stock' decoy comparison coincided; AVG errors
        ('distractors: ["ROUND(SUM(price), 2)", "stock", "WHERE", "<", "140"],',
         'distractors: ["ROUND(SUM(price), 2)", "WHERE", "<", "140", "AVG"],'),
        # cs-2094: duplicate COUNT(*) -> literal COUNT(*) in template gate
        ('template: "SELECT region, {1} AS customers FROM customers GROUP BY {2} {3} {4} {5} 2 ORDER BY customers DESC, region;",',
         'template: "SELECT region, COUNT(*) AS customers FROM customers GROUP BY {1} {2} COUNT(*) {3} {4} ORDER BY customers DESC, region;",'),
        ('''      { answer: "COUNT(*)", kind: "keyword", label: "the bucket measure", why: "Customers per region is a row count — COUNT(*)." },
      { answer: "region", kind: "keyword", label: "the bucket key", why: "Territories form the buckets; the bare SELECT column matches." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "The count exists only per bucket — HAVING is the gate that sees it." },
      { answer: "COUNT(*)", kind: "keyword", label: "the gated measure", why: "The gate re-tests the printed measure: COUNT(*) >= 2." },
      { answer: ">=", kind: "keyword", label: "the comparison", why: "'2 or more' includes exactly 2 — US survives with its pair." },''',
         '''      { answer: "region", kind: "keyword", label: "the bucket key", why: "Territories form the buckets; the bare SELECT column matches the grouping." },
      { answer: "HAVING", kind: "keyword", label: "the group gate", why: "The count exists only per bucket — HAVING is the gate that sees it." },
      { answer: "COUNT(*)", kind: "keyword", label: "the gated measure", why: "The gate re-tests the printed measure: COUNT(*) >= 2 keeps real territories." },
      { answer: ">=", kind: "keyword", label: "the comparison", why: "'2 or more' includes exactly 2 — US survives with its pair." },'''),
        ('distractors: ["SUM(id)", "city", "WHERE", ">", "5"],',
         'distractors: ["SUM(id)", "city", "WHERE", ">", "5"],'),
        # cs-2095: thin why
        ('{ answer: "6000", kind: "number", label: "the revenue line", noVerify: true, why: "The highlight threshold from the memo." }',
         '{ answer: "6000", kind: "number", label: "the revenue line", noVerify: true, why: "The highlight threshold from the memo — it decides which buckets print without ever appearing in a cell." }'),
        # cs-2096: restructure — literal tie-breaker, 4 slots
        ('template: "SELECT category, {1} AS top_price FROM products GROUP BY category ORDER BY top_price {2}, {3} {4} {5};",',
         'template: "SELECT category, {1} AS top_price FROM products GROUP BY category ORDER BY top_price {2}, category {3} {4};",'),
        ('''      { answer: "ROUND(MAX(price), 2)", kind: "keyword", label: "the ceiling measure", why: "Each category's priciest product, rounded — MAX, not AVG or MIN." },
      { answer: "DESC", kind: "keyword", label: "the direction", why: "Prestige ranking runs biggest ceiling first." },
      { answer: "category", kind: "keyword", label: "the tie-breaker", why: "Equal ceilings resolve alphabetically — deterministic slides." },
      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The board shows three; LIMIT trims after the sort." },
      { answer: "3", kind: "number", label: "the board size", noVerify: true, why: "The slide holds exactly three rows." },''',
         '''      { answer: "ROUND(MAX(price), 2)", kind: "keyword", label: "the ceiling measure", why: "Each category's priciest product, rounded — MAX, not AVG or MIN." },
      { answer: "DESC", kind: "keyword", label: "the direction", why: "Prestige ranking runs biggest ceiling first, with the alphabetical tie-breaker in the template." },
      { answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The board shows three; LIMIT trims after the sort has done its work." },
      { answer: "3", kind: "number", label: "the board size", noVerify: true, why: "The slide holds exactly three ranked rows." },'''),
        ('distractors: ["ROUND(MIN(price), 2)", "ASC", "stock", "HAVING", "7"],',
         'distractors: ["ROUND(MIN(price), 2)", "ASC", "WHERE", "7"],'),
        # cs-2097: thin why
        ('{ answer: "400", kind: "number", label: "the value line", noVerify: true, why: "The chase threshold from the memo." }',
         '{ answer: "400", kind: "number", label: "the value line", noVerify: true, why: "The chase threshold from the memo — it shapes the queue and never shows up in a cell." }'),
        # cs-2098: thin why
        ('{ answer: "\'pending\'", kind: "keyword", label: "the first state", why: "The open pipeline\'s first member." }',
         '{ answer: "\'pending\'", kind: "keyword", label: "the first state", why: "The open pipeline\'s first member — orders still waiting on the store\'s next move." }'),
        # cs-2099: thin why
        ('{ answer: "DESC", kind: "keyword", label: "the main direction", why: "The ledger ranks biggest totals first." }',
         '{ answer: "DESC", kind: "keyword", label: "the main direction", why: "The ledger ranks biggest totals first, so page one opens on the largest basket." }'),
        # cs-2100: thin why
        ('{ answer: "status", kind: "keyword", label: "the bucket key", why: "Four lifecycle buckets to characterize." }',
         '{ answer: "status", kind: "keyword", label: "the bucket key", why: "Four lifecycle buckets to characterize — one row each in the postmortem table." }'),
        # cs-2101: thin whys
        ('{ answer: "FROM", kind: "keyword", label: "the source keyword", why: "FROM names the orders table." }',
         '{ answer: "FROM", kind: "keyword", label: "the source keyword", why: "FROM names the orders table — the clause every aggregate query needs before WHERE can trim." }'),
        ('{ answer: "\'pending\'", kind: "keyword", label: "the status value", why: "The exact lifecycle string in scope." }',
         '{ answer: "\'pending\'", kind: "keyword", label: "the status value", why: "The exact lifecycle string in scope — the envelope describes pending orders only." }'),
        # cs-2102: thin why + ambiguous 'shipped'
        ('{ answer: "\'pending\'", kind: "keyword", label: "the status filter", why: "The review scope is pending only." }',
         '{ answer: "\'pending\'", kind: "keyword", label: "the status filter", why: "The review scope is pending only — shipped and cancelled orders left the queue already." }'),
        ('distractors: ["\'shipped\'", "OR", ">", "\'2024-05-01\'", "<=", "\'2024-08-01\'"],',
         'distractors: ["OR", ">=", "<", "\'2024-08-01\'", "AND"],'),
        # cs-2103: thin why
        ('{ answer: "3", kind: "number", label: "the sample size", noVerify: true, why: "Three rows for the manual review queue." }',
         '{ answer: "3", kind: "number", label: "the sample size", noVerify: true, why: "Three rows land in the manual review queue — the fraud playbook\'s sample width." }'),
        # cs-2105: thin whys
        ('{ answer: "category", kind: "keyword", label: "the bucket key", why: "One bucket per category, seven in all." }',
         '{ answer: "category", kind: "keyword", label: "the bucket key", why: "One bucket per category — seven in all on the seed catalog." }'),
        ('{ answer: "category", kind: "keyword", label: "the tie-breaker", why: "Equal floors resolve alphabetically." }',
         '{ answer: "category", kind: "keyword", label: "the tie-breaker", why: "Equal floors resolve alphabetically, so the value slate never reshuffles between runs." }'),
        ('{ answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three." }',
         '{ answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "The slate shows three rows — the cap applies after the ascending sort." }'),
    ],
    "m01-cases-hard-b.ts": [
        # cs-2106: thin whys + empty-result decoys
        ('{ answer: "5", kind: "number", label: "the page size", noVerify: true, why: "The ledger\'s page width." }',
         '{ answer: "5", kind: "number", label: "the page size", noVerify: true, why: "The ledger\'s page width — five ids per page, straight from the appendix spec." }'),
        ('{ answer: "200", kind: "number", label: "the skipped rows", noVerify: true, why: "40 pages × 5 rows = 200 rows skipped." }',
         '{ answer: "200", kind: "number", label: "the skipped rows", noVerify: true, why: "Forty full pages × five rows = 200 rows skipped before this page begins." }'),
        ('distractors: ["total", "DESC", "10", "WHERE", "100"],',
         'distractors: ["SUM(id)", "HAVING", "WHERE", "100", "COUNT"],'),
        # cs-2107: empty-result decoys must error or return rows
        ('distractors: ["total", "300", "LIMIT"],',
         'distractors: ["total", "HAVING", "COUNT"],'),
        # cs-2110: thin why
        ('{ answer: "WHERE", kind: "keyword", label: "the filter clause", why: "Only unshipped rows enter the sum." }',
         '{ answer: "WHERE", kind: "keyword", label: "the filter clause", why: "Only unshipped rows enter the sum — the shipped majority is priced out of the backlog." }'),
        # cs-2111: thin why
        ('{ answer: "1", kind: "number", label: "the flag value", noVerify: true, why: "active stores 1 for reachable accounts." }',
         '{ answer: "1", kind: "number", label: "the flag value", noVerify: true, why: "active stores 1 for reachable accounts — the flag the coverage target counts on." }'),
        # cs-2113: thin why
        ('{ answer: "120", kind: "number", label: "the band ceiling", noVerify: true, why: "The mid-band\'s upper edge." }',
         '{ answer: "120", kind: "number", label: "the band ceiling", noVerify: true, why: "The mid-band\'s upper edge — beyond it, products rejoin the audit list." }'),
        # cs-2114: thin whys
        ('{ answer: "status", kind: "keyword", label: "the bucket key", why: "Four lifecycle buckets to evaluate." }',
         '{ answer: "status", kind: "keyword", label: "the bucket key", why: "Four lifecycle buckets to evaluate — one strategy row each." }'),
        ('{ answer: "350", kind: "number", label: "the value line", noVerify: true, why: "The strategy threshold from the memo." }',
         '{ answer: "350", kind: "number", label: "the value line", noVerify: true, why: "The strategy threshold from the memo — it decides which statuses make the table." }'),
        # cs-2115: thin why
        ('{ answer: "5", kind: "number", label: "the agenda size", noVerify: true, why: "Five rows for the quarterly prep." }',
         '{ answer: "5", kind: "number", label: "the agenda size", noVerify: true, why: "Five agenda rows for the quarterly prep — the call never gets more than five." }'),
        # cs-2117: thin whys + '1' positional decoy
        ('{ answer: "COUNT(*)", kind: "keyword", label: "the bucket measure", why: "Orders per status bucket — a row count." }',
         '{ answer: "COUNT(*)", kind: "keyword", label: "the bucket measure", why: "Orders per status bucket — a plain row count of the account\'s tickets." }'),
        ('{ answer: "7", kind: "number", label: "the account id", noVerify: true, why: "The reviewed customer — a filter value." }',
         '{ answer: "7", kind: "number", label: "the account id", noVerify: true, why: "The reviewed customer — a filter value that never prints in the mix." }'),
        ('distractors: ["SUM(total)", "region", "1", "city"],',
         'distractors: ["SUM(total)", "region", "city", "AND"],'),
        # cs-2118: thin why + rounding-coincident decoys
        ('{ answer: "1", kind: "number", label: "the cap size", noVerify: true, why: "Exactly the top account." }',
         '{ answer: "1", kind: "number", label: "the cap size", noVerify: true, why: "Exactly the top account — the banner names one buyer, not a leaderboard." }'),
        ('distractors: ["SUM(total)", "COUNT(total)", "WHERE", "3"],',
         'distractors: ["SUM(id)", "MAX(id)", "MAX(total)", "MIN(total)", "WHERE", "3"],'),
        # cs-2119: thin why + coincident decoys
        ('{ answer: "ROUND(SUM(total), 2)", kind: "keyword", label: "the revenue measure", why: "Booked revenue per bucket, rounded." }',
         '{ answer: "ROUND(SUM(total), 2)", kind: "keyword", label: "the revenue measure", why: "Booked revenue per bucket, rounded to cents for the package table." }'),
        ('distractors: ["SUM(total)", "ROUND(MIN(total), 2)", "region", "ASC"],',
         'distractors: ["MAX(total)", "MIN(total)", "region", "ASC"],'),
        # cs-2120: thin whys + decoy cap
        ('{ answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "Top 3 only, trimmed after the sort." }',
         '{ answer: "LIMIT", kind: "keyword", label: "the cap clause", why: "Top 3 only — the cap trims the ranked buckets after the sort settles." }'),
        ('{ answer: "3", kind: "number", label: "the podium size", noVerify: true, why: "Three rows for the final slide." }',
         '{ answer: "3", kind: "number", label: "the podium size", noVerify: true, why: "Three rows for the final slide — the module\'s last cap, on its last build." }'),
        ('distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "1", "WHERE", "7"],',
         'distractors: ["SUM(price)", "ROUND(MAX(price), 2)", "stock", "<", "1", "WHERE"],'),
    ],
}

for fname, pairs in PATCHES.items():
    p = BASE / fname
    text = p.read_text()
    for old, new in pairs:
        if old not in text:
            print(f"MISS  {fname}: {old[:70]!r}")
        else:
            text = text.replace(old, new, 1)
    p.write_text(text)
    print(f"done  {fname}")
