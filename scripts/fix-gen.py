# One-off fixer for gen-wf10-12.py specs (Task 41)
p = "scripts/gen-wf10-12.py"
s = open(p).read()
def rep(old, new):
    global s
    assert old in s, "MISSING: " + old[:80]
    s = s.replace(old, new, 1)

# auto-add: handle literal LIMIT too
rep('''            if ("LIMIT {%d};") % m in template:''',
    '''            import re as _re
            m2 = _re.search(r"LIMIT \\d+;", template)
            if ("LIMIT {%d};") % m in template:''')
rep('''                template = template.replace(("LIMIT {%d};") % m, ("LIMIT {%d} OFFSET {%d};" % (m, m + 1)))''',
    '''                template = template.replace(("LIMIT {%d};") % m, ("LIMIT {%d} OFFSET {%d};" % (m, m + 1)))
            elif m2:
                template = template.replace(m2.group(0), m2.group(0)[:-1] + (" OFFSET {%d};" % (m + 1)))''')

# 2333: rewrite spec cleanly (fold = {2}, limit = {3})
rep('''"WITH d AS (\\n  SELECT spent_on AS day, {3}(amount_cents) AS spend\\n  FROM expenses\\n  GROUP BY spent_on\\n)\\nSELECT day, spend,\\n       AVG(spend) OVER (ORDER BY day ASC {1}) AS ma3\\nFROM d\\nORDER BY day ASC\\nLIMIT {2};",''',
    '''"WITH d AS (\\n  SELECT spent_on AS day, {2}(amount_cents) AS spend\\n  FROM expenses\\n  GROUP BY spent_on\\n)\\nSELECT day, spend,\\n       AVG(spend) OVER (ORDER BY day ASC {1}) AS ma3\\nFROM d\\nORDER BY day ASC\\nLIMIT {3};",''')

# 2336: second window frame inline (marker once)
rep("CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC {1}) THEN 'low' ELSE 'ok' END AS mark",
    "CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) THEN 'low' ELSE 'ok' END AS mark")

# 2339/2347: vendor<->category equivalence -> spent_on
rep('s("category", "the type boundary", "Partitioning by category would give spend types meters instead of vendors.")',
    's("spent_on", "the day boundary", "Partitioning by spent date would weave the vendors into day-sized meters.")')
rep('s("vendor", "the relationship boundary", "Partitioning by vendor would meter relationships instead of spend types.")',
    's("spent_on", "the day boundary", "Partitioning by spent date would weave categories into day-sized meters.")')

# 2348 thin why
rep('s("COUNT", "the counter fold", "The clock counts baskets — COUNT(*).", True)',
    's("COUNT", "the counter fold", "The clock counts baskets as they land — COUNT(*) with the running frame.", True)')

# 2351: template gets {2}
rep('"SELECT name, category, price,\\n       {1}(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_champion\\nFROM products\\nORDER BY id;",',
    '"SELECT name, category, price,\\n       {1}(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_champion\\nFROM products\\nORDER BY id\\nLIMIT {2};",')

# 2352: template gets {2}
rep('"SELECT name, category, price,\\n       {1}(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS aisle_floor\\nFROM products\\nORDER BY id\\nLIMIT 8;",',
    '"SELECT name, category, price,\\n       {1}(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS aisle_floor\\nFROM products\\nORDER BY id\\nLIMIT {2};",')

# 2361: LIMIT 4 vs 5 same (4 statuses); change auto distractor target by fixing spec: keep, but change added distractor via explicit distractor list
rep('[s("SUM", "the grand denominator", "The empty-window SUM is the total revenue across all stages.", True),\n s("4", "the stage cut", "All four statuses fit; LIMIT 4 keeps the sheet complete.", True)],\n["AVG", "2"],',
    '[s("SUM", "the grand denominator", "The empty-window SUM is the total revenue across all stages.", True),\n s("4", "the stage cut", "All four statuses fit; LIMIT 4 keeps the sheet complete.", True)],\n["AVG", "3"],')

# 2369: FULL equivalent on ascending walk -> MOV3
rep('s(FULL, "the whole-frame chip", "The full frame would show the global floor everywhere — a level, not a walk.")',
    's("ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "the moving chip", "A three-row window takes the minimum of the last three shelves, not the running floor.")')

# 2374: RUN distractor equivalent (RUN frame shows bronze from row 3; with LIMIT 10 display all rows... fix by MOV3)
rep('["FIRST_VALUE", RUN, "5"],', '["FIRST_VALUE", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "5"],')

# 2377: LIMIT 12 -> 40 (divergence at row 27), distractor 6 -> 20
rep('s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the dealt ladder.", True)],\n["RANK", "3", "6"],',
    's("40", "the sheet cut", "LIMIT 40 reaches past row 27, where the three-tile and four-tile deals diverge.", True)],\n["RANK", "3", "20"],')

# 2379: slot3 4 -> 3, distractor 8 -> 2
rep('s("4", "the list cut", "The whale list fits on four rows — LIMIT 4.", True)],\n["RANK", "2", "8"],',
    's("3", "the list cut", "LIMIT 3 trims the whale list to its first three rows so the cut is provable.", True)],\n["RANK", "2", "5"],')

# 2393: 8 -> 3
rep('["LEAD", FULL, "8"],', '["LEAD", FULL, "3"],')

# 2394: RANK ambiguous (distinct due dates) -> NTILE; LIMIT 10 vs 4 same -> 3
rep('["RANK", "paid"],', '["NTILE", "paid"],')
print("gen patched ok")
