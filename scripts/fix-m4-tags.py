#!/usr/bin/env python3
# M4 tag-fix — append tailored technique-naming sentences to items the tagger
# missed (MCQs are tagged via prose only; solutions never reach the SQL regex).
import re, sys

BASE = "/home/z/my-project/src/lib/curriculum"

# id -> (sentence, target_field)  target_field: why | brief | walkthrough
S = {
 # ---- IN subqueries MCQs ----
 "kb-sq-q03": ("The IN subquery's derived id set is the whole mechanism here: membership, not joining.", "why"),
 "kb-sq-q04": ("The empty IN subquery is the trap this membership test is famous for.", "why"),
 "kb-sq-q05": ("One NULL in the IN subquery's list poisons the whole anti-membership test.", "why"),
 "kb-sq-q07": ("The IN subquery derives the EU key set and the outer count gathers its references.", "why"),
 "kb-sq-q10": ("SQLite's row-value IN subquery extension compares whole tuples against the derived set.", "why"),
 "kb-sq-q12": ("Each IN hop in the chain filters one table's keys toward the buyer set.", "why"),
 "kb-sq-q13": ("The IN subquery form derives its list at run time; the literal form hardcodes it.", "why"),
 "kb-sq-q15": ("The IN subquery builds the allowed key set first; the outer WHERE narrows within it.", "why"),
 "kb-sq-q17": ("The IN subquery projects the supplier region vocabulary the outer test matches against.", "why"),
 "kb-sq-q19": ("The IN subquery's NULL semantics are what the LEFT JOIN anti-join survives.", "why"),
 "kb-sq-q20": ("The IN subquery collects the sold key set and the outer test keeps the proven rows.", "why"),
 "kb-sq-q21": ("Negating the IN subquery's test flips the question without touching the derivation.", "why"),
 "kb-sq-q22": ("The IN subquery supplies the very vocabulary that makes its negation dead.", "why"),
 "kb-sq-q24": ("The IN subquery spans the items-to-products join and lands on supplier keys.", "why"),
 "kb-sq-q25": ("Duplicates inside the IN subquery's output are harmless — membership is set semantics.", "why"),
 "kb-sq-q28": ("The LEFT JOIN anti-join is NOT IN's NULL-safe sibling for the same membership question.", "why"),
 "kb-sq-q31": ("Swap the region literal and the IN subquery rebuilds the ledger for the other market.", "why"),
 "kb-sq-q32": ("Membership against a derived vocabulary is exactly what the IN subquery expresses.", "why"),
 "kb-sq-q35": ("The IN subquery filters rows; it never deduplicates the outer query's output.", "why"),
 "kb-sq-q36": ("The distinct count rides the filtered key set the IN subquery derives.", "why"),
 "kb-sq-q37": ("The IS NOT NULL guard keeps the IN subquery's list free of NULL poison.", "why"),
 "kb-sq-q38": ("A literal list and an IN subquery compose as two membership predicates joined by AND.", "why"),
 "kb-sq-q40": ("The outer reference makes the IN subquery correlated — re-derived per row.", "why"),
 "kb-sq-q41": ("The IN subquery collects the cancelled key set and the directory names its holders.", "why"),
 "kb-sq-q42": ("IN's set semantics collapse the cancelled fan-out — the IN subquery answers holders, not tickets.", "why"),
 "kb-sq-q45": ("The audit question is the IN subquery's anti-membership, and empty is an honest answer.", "why"),
 "kb-sq-q46": ("Correctness first: the IN subquery's set semantics decide the grain before speed does.", "why"),
 "kb-sq-q48": ("The IN subquery here yields a list of per-status averages — rarely the intended question.", "why"),
 "kb-sq-q49": ("Equal answers demand equal predicates — the aliasing is where the IN subquery and the EXISTS probe diverge.", "why"),
 "kb-sq-q50": ("customer_id is NOT NULL, so the IN subquery's list is clean and the anti-set is honestly empty.", "why"),
 # ---- IN problems ----
 "kb-sq-i07": ("The scalar benchmark here pairs with an IN subquery family: threshold tests against derived values.", "brief"),
 # ---- Scalar MCQs ----
 "kb-sc-q03": ("Averages manufacture values, which is why this scalar subquery equality matches nothing.", "why"),
 "kb-sc-q06": ("COUNT is the one aggregate that keeps a scalar subquery display-safe on empty sets.", "why"),
 "kb-sc-q13": ("MAX lands on a stored value, so this scalar subquery equality fetches a real row.", "why"),
 "kb-sc-q14": ("The multi-row scalar subquery is SQLite's quietest bug: first row, no error.", "why"),
 "kb-sc-q21": ("The correlated scalar subquery re-runs per outer row — O(outer × inner) is its cost shape.", "why"),
 "kb-sc-q23": ("One scalar threshold computed from an aggregate draws the whale line.", "why"),
 "kb-sc-q26": ("The correlated scalar subquery scopes each row's ceiling per customer.", "why"),
 "kb-sc-q27": ("Single-order customers are their own ceiling — the correlated scalar gap reads zero.", "why"),
 "kb-sc-q30": ("The correlated scalar test re-benchmarks every order against its own account's history.", "why"),
 "kb-sc-q31": ("Strict inequality means a single order can never beat its own scalar average.", "why"),
 "kb-sc-q33": ("The category-scoped correlated scalar test judges each product on its own shelf.", "why"),
 "kb-sc-q34": ("The correlation scopes the scalar subquery's average to the row's own category.", "why"),
 "kb-sc-q36": ("Two scalar subqueries compose: one correlated lifetime sum, one uncorrelated benchmark.", "why"),
 "kb-sc-q37": ("A scalar subquery in the SELECT list is a computed constant — one row, one cell.", "why"),
 "kb-sc-q38": ("Boundary probing decides whether the scalar comparison's strictness matters.", "why"),
 "kb-sc-q40": ("The correlated COUNT is a rank function written as a scalar subquery.", "why"),
 "kb-sc-q42": ("The correlated MAX answers 'when did this account last act' — a per-row scalar subquery.", "why"),
 "kb-sc-q43": ("The scalar subquery anchors the recency window's edge.", "why"),
 "kb-sc-q44": ("The multi-row scalar subquery silently stamps the first row's value on every row.", "why"),
 "kb-sc-q45": ("Segment-scoped scalar subqueries keep comparisons apples-to-apples.", "why"),
 "kb-sc-q47": ("The correlation scope must match the business question's scope — the correlated scalar subquery is the denominator.", "why"),
 # ---- Scalar cases ----
 "cs-2349": ("The correlated scalar subquery projects each row's own tally — no GROUP BY anywhere.", "walkthrough"),
 "cs-2351": ("The correlated MAX is the per-row ceiling this scalar subquery audit measures against.", "walkthrough"),
 "cs-2352": ("Two scalar subqueries compose: the correlated lifetime sum and the staged average benchmark.", "walkthrough"),
 "cs-2353": ("The correlated COUNT is the hand-rolled rank this scalar subquery ladder walks.", "walkthrough"),
 "cs-2354": ("The correlated AVG re-benchmarks every ticket — the scalar subquery scopes per account.", "walkthrough"),
 "cs-2355": ("The shelf correlation scopes this scalar subquery's average per category.", "walkthrough"),
 # ---- EXISTS MCQs ----
 "kb-ex-q01": ("The EXISTS probe is a boolean witness: one row is enough.", "why"),
 "kb-ex-q02": ("The EXISTS probe collapses the order book to one TRUE per customer.", "why"),
 "kb-ex-q03": ("NOT EXISTS flips the probe: keep the rows with no witness.", "why"),
 "kb-ex-q05": ("The uncorrelated EXISTS probe ignores the row it tests — a constant filter.", "why"),
 "kb-ex-q08": ("The probe's WHERE scoping makes EXISTS answer segment questions.", "why"),
 "kb-ex-q10": ("Two ANDed EXISTS probes intersect their holder sets.", "why"),
 "kb-ex-q11": ("The EXISTS probe's truth comes from matched rows, never compared values — NULL-immune.", "why"),
 "kb-ex-q12": ("The anti-existence probe keeps products with zero matching lines.", "why"),
 "kb-ex-q14": ("The probe can span joins — supplier existence over items to products.", "why"),
 "kb-ex-q15": ("The correlation can reference any outer column — the category-level EXISTS probe.", "why"),
 "kb-ex-q17": ("The probe direction flipped — directory probed from the orders side — and EXISTS answers the same.", "why"),
 "kb-ex-q18": ("The EXISTS early exit versus the IN list's full materialization is the plan-shape difference.", "why"),
 "kb-ex-q19": ("The EXISTS probe can aggregate internally: existence of a grouped result row.", "why"),
 "kb-ex-q20": ("NOT EXISTS states the anti-join intent the LEFT JOIN pattern achieves structurally.", "why"),
 "kb-ex-q21": ("Each fate needs its own EXISTS probe — one row never witnesses three statuses.", "why"),
 "kb-ex-q22": ("EXISTS is binary: the probe's match volume is irrelevant.", "why"),
 "kb-ex-q23": ("Two ANDed probes intersect holder sets — the EXISTS algebra of overlap.", "why"),
 "kb-ex-q24": ("Anti-existence over a join inside the probe is the NOT EXISTS pattern's full power.", "why"),
 "kb-ex-q26": ("The EXISTS rewrite evaluates row matches per outer row — NULLs never poison it.", "why"),
 "kb-ex-q28": ("EXISTS in the SELECT list becomes a per-row boolean flag column.", "why"),
 "kb-ex-q30": ("Two ANDed probes intersect: the shipped∩pending EXISTS overlap.", "why"),
 "kb-ex-q32": ("An empty probe makes EXISTS false everywhere — the constant-filter mirror.", "why"),
 "kb-ex-q33": ("The probe groups, sums, and compares — nested aggregation inside the EXISTS test.", "why"),
 "kb-ex-q34": ("EXISTS compresses any probe — grouped or not — to TRUE/FALSE per outer row.", "why"),
 "kb-ex-q35": ("NOT EXISTS keeps the customers for whom no cancelled witness exists.", "why"),
 "kb-ex-q37": ("The probe's active = 1 condition is what scopes the order book's existence test.", "why"),
 "kb-ex-q38": ("Compound existence: ALL decomposes into EXISTS plus NOT EXISTS of the counter-example.", "why"),
 "kb-ex-q39": ("The anti-existence arm hunts items in any OTHER category, scoped to the outer order.", "why"),
 "kb-ex-q40": ("EXISTS asks yes/no per row; a join projects columns — different intents.", "why"),
 "kb-ex-q41": ("The LEFT JOIN anti-join and NOT EXISTS agree on the same correlated predicate.", "why"),
 "kb-ex-q42": ("The outer rows drive EXISTS iterations; each probe exits at its first witness.", "why"),
 "kb-ex-q43": ("The order-grain EXISTS probe counts baskets, not holders.", "why"),
 "kb-ex-q44": ("Same predicate, different mechanism — the IN list and the EXISTS probe agree on clean keys.", "why"),
 "kb-ex-q45": ("Column tests answer on-row questions; the EXISTS probe answers cross-table ones.", "why"),
 "kb-ex-q48": ("Nesting depth must match quantifier depth — the inner EXISTS scopes Audio-absence to the outer order.", "why"),
 "kb-ex-q49": ("An index on the correlation key turns each EXISTS probe into a seek.", "why"),
 "kb-ex-q50": ("Presence and absence flags per row — the EXISTS family's signature questions.", "why"),
 # ---- Correlated MCQs ----
 "kb-co-q05": ("Probed directly: three of Chloe's tickets clear her correlated personal bar.", "why"),
 "kb-co-q12": ("The correlated COUNT inside the filter replaces GROUP BY entirely.", "why"),
 "kb-co-q13": ("The distribution makes the correlated thresholds' boundaries real.", "why"),
 "kb-co-q20": ("The correlated probe collapses each customer's big-ticket history to a boolean.", "why"),
 "kb-co-q21": ("Dropping the outer reference silently un-correlates the correlated aggregate.", "why"),
 "kb-co-q25": ("The derived rewrite trades per-row correlation for one staging pass.", "why"),
 "kb-co-q27": ("The probe may reference any outer column — correlated direction is free.", "why"),
 "kb-co-q31": ("Self-correlation scans the same table twice — the correlated alias discipline.", "why"),
 "kb-co-q33": ("The correlated COUNT threshold tunes where NOT EXISTS cannot.", "why"),
 # ---- Correlated problems ----
 "kb-co-i03": ("The correlated average re-benchmarks each order against its own account.", "brief"),
 "kb-co-i04": ("The correlation scopes the shelf average per product — the category-relative correlated test.", "brief"),
 "kb-co-i09": ("The correlated count threshold admits the fifth customer at the >= 5 boundary.", "brief"),
 "kb-co-i10": ("The correlated COUNT is the hand-rolled rank this second-place probe walks.", "brief"),
 "kb-co-i15": ("The correlated personal bar composes with the absolute materiality line.", "brief"),
 "kb-co-i18": ("Correlation over a computed column: the year slice scopes the correlated average.", "brief"),
 # ---- Derived MCQs ----
 "kb-dt-q26": ("Stage at the grain you consume — the derived table's fan-out discipline.", "why"),
 "kb-dt-q28": ("The LEFT JOIN from the counts side preserves the directory's footprint over the derived stages.", "why"),
 # ---- Recursive MCQs ----
 "kb-rc-q03": ("The recursive CTE's anchor manufactures its own seed rows.", "why"),
 "kb-rc-q06": ("The doubling recursive CTE tests the successor against the boundary.", "why"),
 "kb-rc-q10": ("The recursive CTE walks the calendar one date() step at a time.", "why"),
 "kb-rc-q12": ("Zero-padded month codes sort chronologically — the recursive CTE's TEXT-guard safety.", "why"),
 "kb-rc-q15": ("The CTE shadows the base table inside the recursive-capable statement scope.", "why"),
 "kb-rc-q16": ("The two-stage CTE chain reads top-down: filter the directory, match the ledger.", "why"),
 "kb-rc-q17": ("One named stage, two consumers — the reuse that justifies a recursive-capable CTE name.", "why"),
 "kb-rc-q18": ("WITH is legal at subquery depth — a private CTE inside the derived table.", "why"),
 "kb-rc-q19": ("WITH is a statement prefix, not an arm — the misplaced recursive-capable clause errors.", "why"),
 "kb-rc-q21": ("The recursive CTE spine manufactures the calendar the sparse facts scatter across.", "why"),
 "kb-rc-q22": ("LEFT JOIN from the recursive CTE keeps every day; COUNT(o.id) zero-fills the quiet ones.", "why"),
 "kb-rc-q23": ("COUNT of the joined key — not COUNT(*) — is the zero-fill inside the recursive spine's join.", "why"),
 "kb-rc-q25": ("Guard the walk, not the reader — the recursive CTE's termination discipline.", "why"),
 "kb-rc-q26": ("The counter spine guarantees the histogram's axis — the recursive CTE as axis-maker.", "why"),
 "kb-rc-q27": ("Inner ORDER BY plus LIMIT is honored in the CTE stage — top-N staging.", "why"),
 "kb-rc-q28": ("Plain WITH and the recursive CTE share syntax but account separately.", "why"),
 "kb-rc-q29": ("CTE staging plus a window walk — the two-act running-total structure.", "why"),
 "kb-rc-q31": ("Synthetic walks and spines teach the recursive CTE mechanics this seed's flat schema cannot.", "why"),
 "kb-rc-q32": ("The guard's first failing value is the last emitted successor — recursive CTE boundary arithmetic.", "why"),
 "kb-rc-q34": ("UNION's dedupe is the brake; UNION ALL needs the recursive CTE's guard.", "why"),
 "kb-rc-q35": ("Depth rides the queue as data — the recursive CTE's two-column lineage.", "why"),
 "kb-rc-q37": ("The CTE is a table to every consumer — joins, IN lists, EXISTS probes alike.", "why"),
 "kb-rc-q38": ("Spine plus LEFT JOIN plus COALESCE — the recursive CTE's calendar-integrity report.", "why"),
 "kb-rc-q40": ("The recursive CTE manufactured time — the one dimension the seed stores sparsely.", "why"),
 # ---- Recursive problems ----
 "kb-rc-i12": ("A named stage read twice — the CTE reuse the consumers both enjoy.", "brief"),
 "kb-rc-i14": ("A plain CTE stage feeding an IN probe — named staging for the EU id set.", "brief"),
 "kb-rc-i15": ("The two-stage CTE chain: filter the directory, then join the ledger.", "brief"),
 "kb-rc-i16": ("The per-order line-sum stage in WITH spelling — the derived-table classic renamed.", "brief"),
 "kb-rc-i17": ("WITH at subquery depth — a private CTE inside the derived table.", "brief"),
 "kb-rc-i18": ("The whale list in WITH form — stage, join, filter.", "brief"),
 "kb-rc-i19": ("Top-N staging: inner ORDER BY plus LIMIT inside the CTE.", "brief"),
 "kb-rc-i20": ("CTE plus window: stage the ranked orders, then walk the running sum.", "brief"),
 # ---- gm4 MCQs (any M4 keyword) ----
 "gm4-q03": ("The IN subquery membership collapses the order book to holder counts.", "why"),
 "gm4-q06": ("The IN subquery derives the EU key set; the ledger follows the references.", "why"),
 "gm4-q14": ("NOT IN over the sold key set — the IN subquery's anti-membership audit.", "why"),
 "gm4-q16": ("The recursive CTE spine manufactures the 424-day calendar.", "why"),
 "gm4-q22": ("ANDed EXISTS probes intersect holder sets — eight shared holders.", "why"),
 "gm4-q23": ("The scalar subquery benchmark reads 4.3 with an empty boundary.", "why"),
 "gm4-q24": ("Three IN subquery hops climb the foreign keys from products to customers.", "why"),
 "gm4-q26": ("The correlation scopes the shelf average — the category-relative scalar subquery.", "why"),
 "gm4-q29": ("An empty probe makes EXISTS false everywhere — the constant filter.", "why"),
 "gm4-q31": ("The multi-row scalar subquery silently takes the first row on this engine.", "why"),
 "gm4-q33": ("The recursive CTE month spine emits fourteen zero-padded codes.", "why"),
 "gm4-q35": ("The derived stage nests inside the scalar subquery — the best-of-best bar.", "why"),
 "gm4-q36": ("Boundary probes before decoys — the scalar comparisons' empty boundaries.", "why"),
 "gm4-q37": ("ALL decomposes into EXISTS plus NOT EXISTS of the counter-example.", "why"),
 "gm4-q40": ("COUNT of the joined key zero-fills the recursive CTE spine's quiet days.", "why"),
 "gm4-q41": ("IN subquery and EXISTS probe agree on NULL-free keys — 45 orders either way.", "why"),
 "gm4-q48": ("LEFT JOIN from the counts side protects the derived stages' footprint.", "why"),
 "gm4-q50": ("The recursive CTE spine plus LEFT JOIN plus COUNT is the zero-filled daily board.", "why"),
}

FIELD_ANCHOR = {"why": 'why: "', "brief": 'brief: "', "walkthrough": 'walkthrough: "'}

def patch(path, edits):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    changed = 0
    for item_id, (sentence, field) in edits.items():
        anchor = f'id: "{item_id}"'
        pos = src.find(anchor)
        if pos < 0:
            print(f"ANCHOR NOT FOUND: {item_id} in {path}")
            continue
        fpos = src.find(FIELD_ANCHOR[field], pos)
        if fpos < 0:
            print(f"FIELD NOT FOUND: {field} for {item_id}")
            continue
        # find closing ", of this string (first '",\n' after fpos)
        end = src.find('",', fpos)
        if end < 0:
            print(f"END NOT FOUND: {item_id}")
            continue
        insert_pos = end  # insert before the closing quote
        src = src[:insert_pos] + " " + sentence + src[insert_pos:]
        changed += 1
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    return changed

# group edits by file
import collections
file_map = {
    "keyword-banks/subquery-mcqs-a.ts": lambda i: i.startswith("kb-sq-q") and int(i.split("q")[-1]) <= 26,
    "keyword-banks/subquery-mcqs-b.ts": lambda i: i.startswith("kb-sq-q") and int(i.split("q")[-1]) > 26,
    "keyword-banks/subquery-mcqs-c.ts": lambda i: i.startswith("kb-sc-q") and int(i.split("q")[-1]) <= 24,
    "keyword-banks/subquery-mcqs-d.ts": lambda i: i.startswith("kb-sc-q") and int(i.split("q")[-1]) > 24,
    "keyword-banks/subquery-mcqs-e.ts": lambda i: i.startswith("kb-ex-q") and int(i.split("q")[-1]) <= 25,
    "keyword-banks/subquery-mcqs-f.ts": lambda i: i.startswith("kb-ex-q") and int(i.split("q")[-1]) > 25,
    "keyword-banks/subquery-mcqs-g.ts": lambda i: i.startswith("kb-co-q") and int(i.split("q")[-1]) <= 18,
    "keyword-banks/subquery-mcqs-h.ts": lambda i: i.startswith("kb-co-q") and int(i.split("q")[-1]) > 18,
    "keyword-banks/subquery-mcqs-i.ts": lambda i: i.startswith("kb-dt-q") and int(i.split("q")[-1]) <= 15,
    "keyword-banks/subquery-mcqs-j.ts": lambda i: i.startswith("kb-dt-q") and int(i.split("q")[-1]) > 15,
    "keyword-banks/subquery-mcqs-k.ts": lambda i: i.startswith("kb-rc-q") and int(i.split("q")[-1]) <= 20,
    "keyword-banks/subquery-mcqs-l.ts": lambda i: i.startswith("kb-rc-q") and int(i.split("q")[-1]) > 20,
    "keyword-banks/subquery-cases.ts": lambda i: i.startswith("cs-234") or i.startswith("cs-235"),
    "gauntlet/m04-mcqs.ts": lambda i: i.startswith("gm4-"),
}

groups = collections.defaultdict(dict)
for item_id, (sentence, field) in S.items():
    placed = False
    for fname, pred in file_map.items():
        if pred(item_id):
            groups[fname][item_id] = (sentence, field)
            placed = True
            break
    if not placed:
        # problems and remaining cases
        if item_id.startswith("kb-sq-i"):
            groups["keyword-banks/subquery-problems-a.ts"][item_id] = (sentence, field)
        elif item_id.startswith("kb-ex-i"):
            groups["keyword-banks/subquery-problems-b.ts"][item_id] = (sentence, field)
        elif item_id.startswith("kb-co-i"):
            groups["keyword-banks/subquery-problems-c.ts"][item_id] = (sentence, field)
        elif item_id.startswith("kb-rc-i"):
            groups["keyword-banks/subquery-problems-d.ts"][item_id] = (sentence, field)
        else:
            print(f"UNPLACED: {item_id}")

total = 0
for fname, edits in groups.items():
    n = patch(f"{BASE}/{fname}", edits)
    print(f"{fname}: {n} patched")
    total += n
print(f"TOTAL patched: {total}")
