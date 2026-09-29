#!/usr/bin/env python3
# Task 41 — generate the Module 10 case batches (n1 fill-up + n2..n6) from
# archetype matrices. Every generated case: single-SELECT, single-table,
# keyword slots audited by distractor consequence (bun case-audit.ts).
# Dedupe key: (template, tuple of slot answers). Prose banks rotate so
# briefs/walkthroughs do not repeat verbatim.

import itertools, json, random

random.seed(410)

OUT = "src/lib/curriculum/cases/"

UNIVERSES = ["month-close", "refund-audit", "pricing", "inventory", "funnel",
             "supplier", "expense", "growth", "fraud", "catalog"]


def fill(_t, *args, **kw):
    for k, v in kw.items():
        _t = _t.replace("%(" + k + ")s", str(v))
    i = _t.find("%(")
    while i != -1:
        j = _t.find(")s", i)
        if j == -1:
            break
        _t = _t[:i] + _t[j + 2:]
        i = _t.find("%(")
    for a in args:
        i = _t.find("%s")
        j = _t.find("%d")
        if j != -1 and (i == -1 or j < i):
            _t = _t[:j] + str(a) + _t[j + 2:]
            continue
        if i == -1:
            break
        _t = _t[:i] + str(a) + _t[i + 2:]
    return _t

def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

def emit(fname, topic, start_id, rows):
    lines = []
    lines.append("// Case batch %s — Module 10 window-function cases cs-%04d…" % (
        fname.replace("cases-", "").replace(".ts", "").upper().replace("N", "N").replace(".TS", ""),
        start_id))
    lines.append("// Generated from archetype matrices (scripts/gen-m10-cases.py); every case")
    lines.append("// mechanically audited against the seed db by scripts/case-audit.ts.")
    lines.append("")
    lines.append('import type { CaseStudy } from "./types";')
    lines.append('import { m10Cases } from "./m10-util";')
    lines.append("")
    lines.append("export const cases%s: CaseStudy[] = m10Cases(\"%s\", %d, [" % (
        fname.replace("cases-", "").replace(".ts", "").capitalize(), topic, start_id))
    for r in rows:
        tier, uni, title, brief, ask, template, slots, dis, walk = r
        lines.append("  [")
        lines.append('    "%s", "%s",' % (tier, uni))
        lines.append('    "%s",' % esc(title))
        lines.append('    "%s",' % esc(brief))
        lines.append('    "%s",' % esc(ask))
        lines.append('    "%s",' % esc(template))
        lines.append("    [")
        for a, k, l, w in slots:
            lines.append('      ["%s", "%s", "%s", "%s"],' % (esc(a), k, esc(l), esc(w)))
        lines.append("    ],")
        lines.append('    [%s],' % ", ".join('"%s"' % esc(d) for d in dis))
        lines.append('    "%s"' % esc(walk))
        lines.append("  ],")
    lines.append("]);")
    open(OUT + fname, "w").write("\n".join(lines) + "\n")
    print("wrote", fname, len(rows), "cases")

# ---------------------------------------------------------------- archetypes
# Marker-first: templates carry {1}{2}{3} at slot positions. Distractors:
# wrong function family (breaks or changes result), wrong table (breaks on
# missing columns), flipped direction (changes window values).

T = {
    "orders": ("total", "id", ["products", "customers"]),
    "products": ("price", "id", ["orders", "suppliers"]),
    "order_items": ("quantity", "id", ["orders", "suppliers"]),
    "suppliers": ("rating", "id", ["orders", "products"]),
    "customers": ("created_at", "id", ["orders", "products"]),
}
FNS = ["SUM", "AVG", "MIN", "MAX", "COUNT"]
RANKS = ["RANK", "ROW_NUMBER", "DENSE_RANK"]

def gen_share(n):
    out = []
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"],
                                  FNS, ["pct DESC", "pct ASC", "val DESC"]))
    for i in range(n):
        table, fn, order = axes[i % len(axes)]
        val, idc, _ = T[table]
        uni = UNIVERSES[i % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][i % 3]
        title = fill("Slice of the %s", val) if i % 2 == 0 else fill("Share of the %s, take %d", val, i // 7 + 1)
        brief = fill("The %(u)s team wants each row's slice of the whole %(v)s pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.", u=uni.replace("-", " ").title(), v=val)
        ask = fill("Show each row with its %s as a percent of the pooled total.", val)
        template = "SELECT %s, %s AS val,\n  ROUND(100.0 * %s / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};" % (idc, val, val)
        slots = [
            (fn + "(" + val + ")", "keyword", "the pool builder",
             fill("%s over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool.", fn)),
            (table, "keyword", "the source table",
             fill("The %s column lives in %s; any other table either lacks the column or pools the wrong population.", val, table)),
            (order, "keyword", "the display order",
             "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."),
        ]
        others = [f for f in FNS if f != fn]
        dis = [others[i % len(others)] + "(" + val + ")",
               T[table][2][i % 2],
               order.replace("DESC", "ASC") if "DESC" in order else order.replace("ASC", "DESC")]
        walk = fill("The empty OVER is one stage over the whole table. %(f)s folds it into one denominator, every row divides its own %(v)s by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for %(g)s and every percent collapses to %(v)s-over-%(g)s — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically.", f=fn, v=val, g=others[i % len(others)])
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_stamp(n):
    out = []
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers", "customers"],
                                  FNS, [0, 1]))
    for i in range(n):
        table, fn, oki = axes[i % len(axes)]
        order = "id"
        val, idc, _ = T[table]
        uni = UNIVERSES[(i * 3) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 2) % 3]
        title = fill("Stamped with the %s", fn.lower()) if i % 2 == 0 else fill("The %s passenger, pass %d", fn.lower(), i // 9 + 1)
        brief = fill("The %(u)s one-pager annotates every %(t)s row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.", u=uni.replace("-", " ").title(), t=table)
        ask = fill("Stamp every %s row with the %s computed over the whole table.", table, fn.lower())
        template = "SELECT %s, %s AS val,\n  {1}(%s) OVER {2} AS stamped\nFROM %s\nORDER BY {3}, %s;" % (idc, val, val, table, idc)
        slots = [
            (fn, "keyword", "the reducer",
             fill("%s over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number.", fn)),
            ("()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."),
            (order, "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."),
        ]
        others = [f for f in FNS if f != fn]
        dis = [others[(i + 1) % len(others)], "(ORDER BY id)", T[table][2][i % 2]]
        walk = fill("One pass over %(t)s: OVER () makes the whole table a single stage, %(f)s reduces it to one fact, and that fact is stamped on every row — the census without the collapse. %(g)s in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships.", t=table, f=fn, g=others[(i + 1) % len(others)])
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_partition(n):
    out = []
    parts = {"orders": ["status", "customer_id"], "products": ["category", "supplier_id"],
             "order_items": ["order_id", "product_id"], "suppliers": ["region"]}
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"],
                                  FNS, [0, 1]))
    for i in range(n):
        table, fn, ki = axes[i % len(axes)]
        val, idc, _ = T[table]
        part = parts[table][ki % len(parts[table])]
        order = ["pct_in_group DESC", "val ASC", "pct_in_group ASC"][i % 3]
        uni = UNIVERSES[(i * 7) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 5) % 3]
        title = fill("Within the %s pool", part) if i % 2 == 0 else fill("Inside the %s, spin %d", part, i // 11 + 1)
        brief = fill("Store-wide shares hide the structure: the %(u)s review measures every %(t)s row against its OWN %(p)s pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.", u=uni.replace("-", " ").title(), t=table, p=part)
        ask = fill("Show each row's %s as a percent of its own %s pool.", val, part)
        template = "SELECT %s, %s AS val,\n  ROUND(100.0 * %s / {1}(%s) OVER ({2} %s), 2) AS pct_in_group\nFROM %s\nORDER BY %s, {3};" % (idc, val, val, val, part, table, part)
        slots = [
            (fn, "keyword", "the pool builder",
             fill("%s pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible.", fn)),
            ("PARTITION BY", "keyword", "the pool clause",
             "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."),
            (part, "keyword", "the pool key",
             fill("The pool key defines the family each row competes in — %s is the grouping this report promises." % part,)),
        ]
        others = [f for f in FNS if f != fn]
        dis = [others[i % len(others)], "ORDER BY", {"orders": "products", "products": "orders", "order_items": "suppliers", "suppliers": "order_items"}[table]]
        walk = fill("The partition slices %(t)s into per-%(p)s stages, %(f)s pools each one, and every row divides its own %(v)s by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator.", t=table, p=part, f=fn, v=val)
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_rank(n):
    out = []
    parts = {"orders": ["status", "customer_id"], "products": ["category", "supplier_id"],
             "order_items": ["order_id", "product_id"], "suppliers": ["region"]}
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"],
                                  RANKS, ["DESC", "ASC"], [0, 1]))
    for i in range(n):
        table, fn, dr, ki = axes[i % len(axes)]
        val, idc, _ = T[table]
        part = parts[table][ki % len(parts[table])]
        uni = UNIVERSES[(i * 11) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 3) % 3]
        title = fill("The %s ladder", part) if i % 2 == 0 else fill("Podium in the %s, heat %d", part, i // 13 + 1)
        brief = fill("The %(u)s review needs standings: every %(t)s row ranked inside its own %(p)s stage by %(v)s, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.", u=uni.replace("-", " ").title(), t=table, p=part, v=val)
        ask = fill("Rank every row within its %s stage by %s %s.", part, val, dr)
        template = "SELECT %s, %s,\n  {1}() OVER (PARTITION BY %s ORDER BY %s {2}) AS rk\nFROM %s\nORDER BY %s, {3};" % (part, val, part, val, table, part)
        slots = [
            (fn, "keyword", "the ranker",
             fill("%s writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently.", fn)),
            (dr, "keyword", "the direction",
             "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."),
            ("rk", "keyword", "the display order",
             "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."),
        ]
        ties = val in ("quantity", "created_at", "status")
        others = [f for f in RANKS if f != fn]
        dis = [others[i % 2] if ties else "NTILE(4)", "ASC" if dr == "DESC" else "DESC", "val"]
        walk = fill("%(f)s numbers every row inside its %(p)s stage by %(v)s %(d)s — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched.", f=fn, p=part, v=val, d=dr)
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_offset(n):
    out = []
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"],
                                  ["LAG", "LEAD"], [1, 2, 3]))
    for i in range(n):
        table, fn, off = axes[i % len(axes)]
        val, idc, _ = T[table]
        order = {"orders": "created_at, id", "products": "price, id", "order_items": "id", "suppliers": "rating, id"}[table]
        alias = ("prev" if fn == "LAG" else "next") + "_" + val.replace("_", "")
        uni = UNIVERSES[(i * 13) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 4) % 3]
        title = fill("The %s neighbor, %d away", val, off) if i % 2 == 0 else fill("%s peek %d", fn, i // 9 + 1)
        brief = fill("Offsets answer 'compared to the row before/after?' without a self-join. The %(u)s sheet wants every %(t)s row to carry the %(v)s of the row %(o)d position(s) %(dir)s in the sort; the fetch, the distance and the sequence are the blanks.", u=uni.replace("-", " ").title(), t=table, v=val, o=off, dir="back" if fn == "LAG" else "ahead")
        ask = fill("Fetch the %s from %d position(s) %s onto every row.", val, off, "back" if fn == "LAG" else "ahead")
        template = "SELECT %s, %s AS val,\n  {1}(%s, {2}) OVER (ORDER BY %s) AS %s\nFROM {3}\nORDER BY %s;" % (order.split(",")[0], val, val, order, alias, order)
        slots = [
            (fn, "keyword", "the fetch direction",
             fill("%s reaches %s in the sort; its mirror reaches the other way and the column reports the wrong neighbor.", fn, "backwards" if fn == "LAG" else "forwards")),
            (str(off), "keyword", "the offset distance",
             fill("The second argument counts positions: %d here. Offset 1 is the default; a different distance fetches a different row entirely." % off,)),
            (table, "keyword", "the source table",
             fill("The timeline lives in %s; any other table either lacks the columns or walks the wrong rows." % table,)),
        ]
        dis = ["LEAD" if fn == "LAG" else "LAG", str(off + 1), T[table][2][i % 2]]
        walk = fill("%(f)s(%(v)s, %(o)d) OVER (ORDER BY %(ord)s) transports the value from %(o)d position(s) %(dir)s onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping %(f)s for %(g)s turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence.", f=fn, v=val, o=off, ord=order, dir="back" if fn == "LAG" else "ahead", g="LEAD" if fn == "LAG" else "LAG")
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_frame(n):
    out = []
    frames = [
        "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
    ]
    aggs = ["SUM(total)", "AVG(total)", "MAX(total)"]
    axes = [(f, a) for a in aggs for f in frames]
    for i in range(n):
        frame, agg = axes[i % len(axes)]
        fn = agg.split("(")[0]
        uni = UNIVERSES[(i * 17) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 6) % 3]
        title = fill("Through the %s frame", frame.split("BETWEEN")[1].strip().title()) if i % 2 == 0 else fill("Framed %s, pass %d", fn.lower(), i // 8 + 1)
        brief = fill("The aggregate is half the story — WHICH rows it sees is the other half. This %(u)s case pins the frame on orders: same %(a)s, different bounds, a completely different column. The bounds and the ordering spine are the blanks.", u=uni.replace("-", " ").title(), a=fn.lower())
        ask = fill("Compute the framed column: %s over the pinned frame on orders.", fn.lower())
        template = "SELECT id, ROUND(total, 2) AS total,\n  ROUND(%s OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};" % agg
        slots = [
            (frame, "keyword", "the frame bounds",
             "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."),
            ("orders", "keyword", "the source table",
             "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."),
            ("id", "keyword", "the row order",
             "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."),
        ]
        equiv = {"RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW": "GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
                 "GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW": "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"}
        others = [f for f in frames if f != frame and f != equiv.get(frame)]
        dis = [others[i % len(others)], "products", "total"]
        walk = fill("Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: %(f)s makes the %(a)s cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports.", f=frame, a=agg)
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_distribution(n):
    out = []
    fns = ["NTILE(4)", "NTILE(5)", "PERCENT_RANK()", "CUME_DIST()", "NTILE(2)", "NTILE(3)"]
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"], fns, ["DESC", "ASC"]))
    for i in range(n):
        table, fn, dr = axes[i % len(axes)]
        val, idc, _ = T[table]
        uni = UNIVERSES[(i * 19) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 8) % 3]
        title = fill("Standing by %s", val) if i % 2 == 0 else fill("The %s station, cut %d", val, i // 12 + 1)
        brief = fill("Distribution questions need every row to carry its standing. The %(u)s report stamps %(t)s rows along %(v)s: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.", u=uni.replace("-", " ").title(), t=table, v=val)
        ask = fill("Stamp every row with its %s standing along %s.", fn.replace("()", "").split("(")[0].lower(), val)
        template = "SELECT %s, %s AS val,\n  {1} OVER (ORDER BY %s {2}) AS standing\nFROM %s\nORDER BY {3}, val;" % (idc, val, val, table)
        slots = [
            (fn, "keyword", "the standing function",
             fill("%s computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely.", fn)),
            (dr, "keyword", "the ladder direction",
             "The direction decides which end of the distribution is 'first' — flipping it flips every standing."),
            ("standing", "keyword", "the display order",
             "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."),
        ]
        others = [f for f in fns if f != fn]
        dis = [others[i % len(others)], "ASC" if dr == "DESC" else "DESC", "id"]
        walk = fill("%(f)s over the %(v)s-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it.", f=fn, v=val)
        fn_disp = fn
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_delta(n):
    out = []
    axes = list(itertools.product(["orders", "products", "order_items", "suppliers"],
                                  ["LAG", "LEAD"], [1, 2]))
    for i in range(n):
        table, fn, off = axes[i % len(axes)]
        val, idc, _ = T[table]
        order = {"orders": "created_at, id", "products": "price, id", "order_items": "id", "suppliers": "rating, id"}[table]
        uni = UNIVERSES[(i * 23) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 9) % 3]
        title = fill("Delta vs the %s neighbor", val) if i % 2 == 0 else fill("The %s swing, offset %d", val, off)
        brief = fill("'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The %(u)s sheet wants the swing on %(t)s.%(v)s at offset %(o)d; the fetch, the distance and the direction are the blanks.", u=uni.replace("-", " ").title(), t=table, v=val, o=off)
        ask = fill("Add the swing column: %s at offset %d, current minus fetched.", val, off)
        template = "SELECT %s, %s AS val,\n  %s - {1}(%s, {2}) OVER (ORDER BY %s) AS swing\nFROM %s\nORDER BY {3};" % (order.split(",")[0], val, val, val, order, table)
        slots = [
            (fn, "keyword", "the fetch direction",
             fill("%s pulls the %s row's value onto this one; its mirror fetches the other side and flips every sign.", fn, "previous" if fn == "LAG" else "next")),
            (str(off), "keyword", "the offset distance",
             fill("Offset %d is the pinned distance; the default 1 would compare against the adjacent row instead." % off,)),
            (order, "keyword", "the sequence",
             "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."),
        ]
        seq_dis = {"orders": "total", "products": "stock", "order_items": "quantity", "suppliers": "name"}[table]
        dis = ["LEAD" if fn == "LAG" else "LAG", "OFFSET 2", seq_dis]
        walk = fill("%(f)s fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong.", f=fn, o=off)
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def gen_grouped(n):
    out = []
    aggs = ["SUM(total)", "COUNT(*)", "AVG(total)"]
    fns = ["RANK", "DENSE_RANK", "ROW_NUMBER", "PERCENT_RANK", "CUME_DIST"]
    keys = ["SUBSTR(created_at, 1, 7)", "status", "customer_id"]
    axes = list(itertools.product(aggs, fns, keys))
    for i in range(n):
        agg, fn, key = axes[i % len(axes)]
        uni = UNIVERSES[(i * 29) % len(UNIVERSES)]
        tier = ["easy", "medium", "hard"][(i * 7) % 3]
        title = fill("Grouped then ranked: %s", fn) if i % 2 == 0 else fill("The %s league, spin %d", key.split("(")[0].lower(), i // 15 + 1)
        brief = fill("Windows run AFTER grouping — this %(u)s case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.", u=uni.replace("-", " ").title())
        ask = "Group by the key, then rank the groups by the aggregate — one SELECT."
        template = "SELECT %s AS grp, ROUND(%s, 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};" % (key, agg)
        slots = [
            (fn, "keyword", "the ranker",
             fill("%s numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues.", fn)),
            (agg, "keyword", "the group metric",
             "The rank reads this aggregate — the window sees it only because GROUP BY ran first."),
            ("rk", "keyword", "the display order",
             "Presenting by rank reads the league top-down; any other order buries the podium."),
        ]
        mirror = "CUME_DIST()" if fn == "PERCENT_RANK" else "PERCENT_RANK()"
        other_aggs = [a for a in aggs if a != agg]
        dis = [mirror, "AVG(total)" if agg != "AVG(total)" else "SUM(total)", "grp"]
        walk = fill("Evaluation order does the work: GROUP BY collapses to one row per key, then %(f)s ranks those survivors by %(a)s. Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers.", f=fn, a=agg)
        out.append([tier, uni, title, brief, ask, template, slots, dis, walk])
    return out

def dedupe(rows):
    seen, out = set(), []
    for r in rows:
        key = (r[5], tuple(x[0] for x in r[6]))
        if key in seen: continue
        seen.add(key); out.append(r)
    return out

n1_fill = dedupe(gen_stamp(20) + gen_share(15) + gen_partition(15))[:40]
n2 = dedupe(gen_rank(30) + gen_delta(12) + gen_grouped(14))[:50]
n3 = dedupe(gen_offset(30) + gen_delta(20) + gen_stamp(22))[:50]
n4 = dedupe(gen_frame(30) + gen_share(10) + gen_partition(12) + gen_delta(8))[:50]
n5 = dedupe(gen_distribution(30) + gen_share(10) + gen_partition(12))[:50]
n6 = dedupe(gen_grouped(25) + gen_rank(15) + gen_offset(15))[:50]

emit("cases-n2.ts", "n2", 1726, n2)
emit("cases-n3.ts", "n3", 1776, n3)
emit("cases-n4.ts", "n4", 1826, n4)
emit("cases-n5.ts", "n5", 1876, n5)
emit("cases-n6.ts", "n6", 1926, n6)

s1 = open(OUT + "cases-n1.ts").read()
idx = s1.rfind("]);")
block = []
for r in n1_fill:
    tier, uni, title, brief, ask, template, slots, dis, walk = r
    block.append("  [")
    block.append('    "%s", "%s",' % (tier, uni))
    block.append('    "%s",' % esc(title))
    block.append('    "%s",' % esc(brief))
    block.append('    "%s",' % esc(ask))
    block.append('    "%s",' % esc(template))
    block.append("    [")
    for a, k, l, w in slots:
        block.append('      ["%s", "%s", "%s", "%s"],' % (esc(a), k, esc(l), esc(w)))
    block.append("    ],")
    block.append('    [%s],' % ", ".join('"%s"' % esc(d) for d in dis))
    block.append('    "%s"' % esc(walk))
    block.append("  ],")
s1 = s1[:idx] + "\n".join(block) + "\n" + s1[idx:]
open(OUT + "cases-n1.ts", "w").write(s1)
print("appended", len(n1_fill), "to cases-n1.ts")
