# Final comprehensive fixer for gen-wf10-12.py (Task 41)
p = "scripts/gen-wf10-12.py"
s = open(p).read()
applied = []
def rep(tag, old, new):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        applied.append(tag)
    else:
        print("SKIP (not found):", tag)

# emit: literal LIMIT handling
rep("emit-literal-limit",
    '''            if ("LIMIT {%d};") % m in template:''',
    '''            import re as _re
            _lit = _re.search(r"LIMIT \\d+;", template)
            if ("LIMIT {%d};") % m in template:''')
rep("emit-literal-limit2",
    '''                template = template.replace(("LIMIT {%d};") % m, ("LIMIT {%d} OFFSET {%d};" % (m, m + 1)))''',
    '''                template = template.replace(("LIMIT {%d};") % m, ("LIMIT {%d} OFFSET {%d};" % (m, m + 1)))
            elif _lit:
                template = template.replace(_lit.group(0), _lit.group(0)[:-1] + (" OFFSET {%d};" % (m + 1)))''')

# 2333: fold = {2}
rep("2333-fold",
    "SELECT spent_on AS day, {3}(amount_cents) AS spend",
    "SELECT spent_on AS day, {2}(amount_cents) AS spend")

# 2336: second window frame inline
rep("2336-frame",
    "CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC {1}) THEN 'low' ELSE 'ok' END AS mark",
    "CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) THEN 'low' ELSE 'ok' END AS mark")

# 2339 / 2347: vendor<->category equivalence
rep("2339-partition",
    's("category", "the type boundary", "Partitioning by category would give spend types meters instead of vendors.")',
    's("spent_on", "the day boundary", "Partitioning by spent date would weave the vendors into day-sized meters.")')
rep("2347-partition",
    's("vendor", "the relationship boundary", "Partitioning by vendor would meter relationships instead of spend types.")',
    's("spent_on", "the day boundary", "Partitioning by spent date would weave categories into day-sized meters.")')

# 2348 thin why
rep("2348-why",
    's("COUNT", "the counter fold", "The clock counts baskets — COUNT(*).", True)',
    's("COUNT", "the counter fold", "The clock counts baskets as they land — COUNT(*) with the running frame.", True)')

# 2352: LIMIT {2} (2351 already fixed inline)
rep("2352-limit",
    'AS aisle_floor\\nFROM products\\nORDER BY id\\nLIMIT 8;",',
    'AS aisle_floor\\nFROM products\\nORDER BY id\\nLIMIT {2};",')

# 2361: distractor 5 -> 3 (LIMIT 4 vs 5 identical with 4 rows)
rep("2361-distractor",
    '["AVG", "2"],', '["AVG", "3"],')

# 2369: FULL equivalent on ascending walk -> MOV3
rep("2369-frame",
    's(FULL, "the whole-frame chip", "The full frame would show the global floor everywhere — a level, not a walk.")',
    's("ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "the moving chip", "A three-row window takes the minimum of the last three shelves, not the running floor.")')

# 2374: RUN distractor -> MOV3
rep("2374-frame",
    '["FIRST_VALUE", RUN, "5"],',
    '["FIRST_VALUE", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "5"],')

# 2377: LIMIT 12 -> 40, distractor 6 -> 20
rep("2377-cut",
    's("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the dealt ladder.", True)],\n["RANK", "3", "6"],',
    's("40", "the sheet cut", "LIMIT 40 reaches past row 27, where the three-tile and four-tile deals diverge.", True)],\n["RANK", "3", "20"],')

# 2379: slot3 4 -> 3, distractor 8 -> 5
rep("2379-cut",
    's("4", "the list cut", "The whale list fits on four rows — LIMIT 4.", True)],\n["RANK", "2", "8"],',
    's("3", "the list cut", "LIMIT 3 trims the whale list to its first three rows so the cut is provable.", True)],\n["RANK", "2", "5"],')

# 2384: third slot duplicate-marker — spec has LIMIT {3} with 2 slots; make 3rd slot LIMIT value and drop auto by giving 3 slots
rep("2384-slots",
    's("CUME_DIST", "the distribution chip", "The half-way split is the cumulative distribution — rows at or above 0.5 are the heavier half.", True),\n ("10", "the list cut", "The list prints ten rows — LIMIT 10 trims the upper half.", True)],',
    's("CUME_DIST", "the distribution chip", "The half-way split is the cumulative distribution — rows at or above 0.5 are the heavier half.", True),\n s("10", "the list cut", "The list prints ten rows — LIMIT 10 trims the upper half.", True)],')

# 2388: inspect-free fix — NTILE(4) vs distractor counts on 14 months: tiles 4/4/3/3; NTILE(2)=7/7 differs; NTILE(3)? — check its distractors later
rep("2388-why",
    's("4", "the tile count", "Four tiles is NTILE(4).", True)',
    's("4", "the tile count", "Four tiles is NTILE(4): the fourteen months deal 4/4/3/3.", True)')

# 2393: 8 -> 3
rep("2393-cut",
    '["LEAD", FULL, "8"],', '["LEAD", FULL, "3"],')

# 2394: RANK -> NTILE (distinct due dates make RANK==ROW_NUMBER), LIMIT 10 vs 4 same
rep("2394-fn",
    '["RANK", "paid"],', '["NTILE", "paid"],')

# 2395: rewrite (inline 0, single slot LIMIT {1})
rep("2395-spec",
    '''CASE WHEN days_past_due <= {2} THEN 'current\\n            WHEN days_past_due <= 30 THEN '1-30'''.replace("\\n            WHEN", "\\n            WHEN"),
    "PLACEHOLDER-NOPE") if False else None

old2395 = """CASE WHEN days_past_due <= {2} THEN 'current'"""
if old2395 in s:
    s = s.replace(old2395, """CASE WHEN days_past_due <= 0 THEN 'current'""", 1)
    applied.append("2395-case")
    # fix its limit marker and slots
    s = s.replace("""ORDER BY bucket, amount_cents DESC, number ASC\\nLIMIT {3};",
[s("0", "the current ceiling", "Current means not yet due — days at or below zero land in the first bucket.", True),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the bucketed book.", True)],""",
"""ORDER BY bucket, amount_cents DESC, number ASC\\nLIMIT {1};",
[s("12", "the sheet cut", "The sheet prints twelve bucketed rows — LIMIT 12 trims the aged book.", True)],""", 1)
    applied.append("2395-slots")

# 2397: slot3 4 -> 3, distractor 8 -> 2
rep("2397-cut",
    's("4", "the row cut", "Four ranks fit on four rows — LIMIT 4.", True)],\n["LEAD", "8", "14"],',
    's("3", "the display cut", "LIMIT 3 trims the display to three of the four podium months so the cut is provable.", True)],\n["LEAD", "2", "14"],')

# 2398: windowed census + status slot
rep("2398-spec",
    '''SELECT {1}(*) AS chase_count\\nFROM a\\nWHERE days_past_due > {2};",''',
    '''SELECT {1}(*) AS chase_count, ROUND(AVG(days_past_due) OVER (), 2) AS avg_age\\nFROM a\\nWHERE days_past_due > {2};",''')
rep("2398-slot3",
    '''WHERE status = 'open'\\n)\\nSELECT {1}(*) AS chase_count''',
    '''WHERE status = '{3}'\\n)\\nSELECT {1}(*) AS chase_count''')
rep("2398-distractors",
    '''["SUM", "1"],''',
    '''["SUM", "30", "paid"],''')
rep("2398-slot3add",
    ''' s("0", "the past-due floor", "Past due means strictly positive days — the filter keeps the aged receivables only.", True)],''',
    ''' s("0", "the past-due floor", "Past due means strictly positive days — the filter keeps the aged receivables only.", True),
 s("open", "the exposure gate", "WHERE open narrows the book to real receivables; paid bills would pollute the census.", True)],''')

open(p, "w").write(s)
print("applied:", applied)
