#!/usr/bin/env python3
"""Round-4 fixes for medium-b cases."""
import pathlib

BASE = pathlib.Path("/home/z/my-project/src/lib/curriculum/gauntlet")
P = BASE / "m01-cases-medium-b.ts"
text = P.read_text()

pairs = [
    # cs-2080: thin why + '30' decoy coincidence (no products in 25-30)
    ('{ answer: "150", kind: "number", label: "the premium floor", noVerify: true, why: "The luxury threshold from the memo." }',
     '{ answer: "150", kind: "number", label: "the premium floor", noVerify: true, why: "The luxury threshold from the memo — only the Smart Watch clears it on the seed." }'),
    ('distractors: ["AND", "30", "200", "HAVING", "ASC"],',
     'distractors: ["AND", "20", "200", "HAVING", "ASC"],'),
    # cs-2081: 3-slot redesign pairing buyers with raw rows
    ('''    template: "SELECT COUNT({1} customer_id) AS buyers FROM {2};",
    slots: [
      { answer: "DISTINCT", kind: "keyword", label: "the dedup keyword", why: "COUNT(DISTINCT x) deduplicates inside the aggregate — repeat buyers collapse to one." },
      { answer: "orders", kind: "keyword", label: "the source table", why: "Buyers appear on order rows; customers would count the roster, not the buyers." },
    ],
    distractors: ["SUM", "ALL", "products", "AVG"],''',
     '''    template: "SELECT {1} AS buyers, {2} AS order_rows FROM {3};",
    slots: [
      { answer: "COUNT(DISTINCT customer_id)", kind: "keyword", label: "the buyer count", why: "COUNT(DISTINCT x) deduplicates inside the aggregate — repeat buyers collapse to one (16)." },
      { answer: "COUNT(*)", kind: "keyword", label: "the raw row count", why: "COUNT(*) counts every order — 103 — so the pair exposes repeat buying at a glance." },
      { answer: "orders", kind: "keyword", label: "the source table", why: "Buyers appear on order rows; customers would count the roster, not the buyers." },
    ],
    distractors: ["SUM(id)", "AVG(id)", "MIN(id)", "customers"],'''),
    # cs-2082: thin whys
    ('{ answer: "DESC", kind: "keyword", label: "the main direction", why: "Priciest first is descending on price." }',
     '{ answer: "DESC", kind: "keyword", label: "the main direction", why: "Priciest first is descending on price — the ladder runs from the Smart Watch down." }'),
    ('{ answer: "5", kind: "number", label: "the page size", noVerify: true, why: "Five rows per page, per the deck spec." }',
     '{ answer: "5", kind: "number", label: "the page size", noVerify: true, why: "Five rows per page, straight from the deck spec — the page width never varies." }'),
    # cs-2086: thin why
    ('{ answer: "ASC", kind: "keyword", label: "the direction", why: "Alphabetical categories, ascending." }',
     '{ answer: "ASC", kind: "keyword", label: "the direction", why: "Alphabetical categories ascending, so the print order matches the heading sequence." }'),
    # cs-2087: id-aggregate decoys coincide with COUNT(*) = 103
    ('distractors: ["SUM(id)", "MAX(id)", "customers", "COUNT(DISTINCT id)"],',
     'distractors: ["SUM(id)", "MIN(id)", "AVG(id)", "customers"],'),
    # cs-2089: 3-slot redesign
    ('''    template: "SELECT name, stock FROM products WHERE stock = {1} ORDER BY {2};",
    slots: [
      { answer: "0", kind: "number", label: "the stockout level", noVerify: true, why: "Exactly zero units — the predicate defines the audit even when nothing matches." },
      { answer: "name", kind: "keyword", label: "the sort key", why: "Any future stockout rows surface alphabetically for the pick list." },
    ],
    distractors: ["total", "HAVING", "COUNT"],''',
     '''    template: "SELECT name, {1} FROM products WHERE stock = {2} ORDER BY {3};",
    slots: [
      { answer: "stock", kind: "keyword", label: "the second output column", why: "The audit prints the level beside the name — stock completes the SELECT list." },
      { answer: "0", kind: "number", label: "the stockout level", noVerify: true, why: "Exactly zero units — the predicate defines the audit even when nothing matches." },
      { answer: "name", kind: "keyword", label: "the sort key", why: "Any future stockout rows surface alphabetically for the pick list." },
    ],
    distractors: ["total", "HAVING", "COUNT"],'''),
    # cs-2090: thin why
    ('{ answer: "3", kind: "number", label: "the podium size", noVerify: true, why: "Three rows for the CRM card." }',
     '{ answer: "3", kind: "number", label: "the podium size", noVerify: true, why: "Three rows for the CRM card — the frequency podium never grows past three." }'),
]

for old, new in pairs:
    if old not in text:
        print(f"MISS: {old[:70]!r}")
    else:
        text = text.replace(old, new, 1)
P.write_text(text)
print("done")
