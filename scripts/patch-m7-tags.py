#!/usr/bin/env python3
"""Task 52 pass 5 — prose-tag repairs: append keyword phrases to missed whys."""
import re, sys

UPD = [
    " The UPDATE statement's fine print is the lesson here: per-row evaluation, matched-row counting, and WHERE as the blast radius.",
    " Reading the UPDATE statement's contract turns this trap into routine for a write-savvy analyst.",
    " The UPDATE statement rewards writers who dry-ran the WHERE before the sweep.",
    " This is the UPDATE statement's fine print at work \u2014 count first, sweep second.",
    " The UPDATE statement never surprises a writer who pre-counted with the identical predicate.",
]
DEL = [
    " The DELETE statement's discipline \u2014 pre-count, transaction, captured ids \u2014 is the habit this question rehearses.",
    " Deleting rows safely starts with the DELETE statement's three rules: count first, wrap second, capture third.",
    " The DELETE statement never surprises a writer who counted the blast radius first.",
    " Every DELETE statement is a contract with the blast radius \u2014 this one included.",
    " Reading the DELETE statement's fine print \u2014 matched rows, orphaned children, irreversible windows \u2014 is the skill.",
]
RET = [
    " The RETURNING clause is the write's own receipt printer \u2014 this pattern is one of its core jobs.",
    " The RETURNING clause collapses the follow-up query into the write itself.",
    " That is the RETURNING clause doing its quietest, most valuable work.",
    " The RETURNING clause speaks SELECT's projection language over the changed rows.",
    " The RETURNING clause makes the write self-documenting \u2014 mutation and evidence in one statement.",
]
UPS = [
    " The upsert clause's OR-family ancestors still behave exactly this way \u2014 legacy spellings, modern care.",
    " That is the upsert clause's per-row arbitration at work: insert path, update arm, or error.",
    " The upsert clause's target must sit on a real constraint \u2014 the schema decides what can arbitrate.",
    " Upsert thinking \u2014 propose full, arm surgically \u2014 is what keeps this pattern honest.",
]
TXN = [
    " The transaction's boundary is the lesson: inside the unit, rollback undoes; outside it, commit endures.",
    " Transactions draw the wall around the unit of work \u2014 this edge lives exactly on that wall.",
]

PLANS = [
    ("src/lib/curriculum/keyword-banks/write-mcqs-update-a.ts", "kb-up", UPD,
     ["kb-up-q05","kb-up-q10","kb-up-q12","kb-up-q14","kb-up-q15","kb-up-q16","kb-up-q18","kb-up-q21","kb-up-q22","kb-up-q23","kb-up-q24","kb-up-q26"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-update-b.ts", "kb-up", UPD,
     ["kb-up-q28","kb-up-q29","kb-up-q30","kb-up-q31","kb-up-q32","kb-up-q33","kb-up-q34","kb-up-q35","kb-up-q36","kb-up-q37","kb-up-q38","kb-up-q39","kb-up-q40","kb-up-q41","kb-up-q42","kb-up-q43","kb-up-q45","kb-up-q46","kb-up-q47","kb-up-q48","kb-up-q49","kb-up-q50","kb-up-q52"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-delete-a.ts", "kb-de", DEL,
     ["kb-de-q03","kb-de-q04","kb-de-q05","kb-de-q06","kb-de-q08","kb-de-q10","kb-de-q11","kb-de-q13","kb-de-q14","kb-de-q15","kb-de-q17","kb-de-q18","kb-de-q20","kb-de-q22","kb-de-q23"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-delete-b.ts", "kb-de", DEL,
     ["kb-de-q25","kb-de-q26","kb-de-q27","kb-de-q28","kb-de-q31","kb-de-q33","kb-de-q34","kb-de-q35","kb-de-q36","kb-de-q37","kb-de-q38","kb-de-q39","kb-de-q41","kb-de-q42","kb-de-q43","kb-de-q44","kb-de-q46","kb-de-q47"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-upsert-a.ts", "kb-us", UPS,
     ["kb-us-q08"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-upsert-b.ts", "kb-us", UPS,
     ["kb-us-q31","kb-us-q33","kb-us-q35","kb-us-q36","kb-us-q37","kb-us-q40"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-returning-a.ts", "kb-re", RET,
     ["kb-re-q03","kb-re-q08","kb-re-q12","kb-re-q14","kb-re-q15","kb-re-q16","kb-re-q18","kb-re-q21","kb-re-q22"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-returning-b.ts", "kb-re", RET,
     ["kb-re-q23","kb-re-q25","kb-re-q26","kb-re-q29","kb-re-q35","kb-re-q38","kb-re-q39","kb-re-q40","kb-re-q41"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-transactions-a.ts", "kb-tr", TXN, ["kb-tr-q20"]),
    ("src/lib/curriculum/keyword-banks/write-mcqs-transactions-b.ts", "kb-tr", TXN, ["kb-tr-q22"]),
]

for path, prefix, variants, ids in PLANS:
    if not ids:
        continue
    s = open(path, encoding="utf-8").read()
    for i, cid in enumerate(ids):
        m = re.search(r'(id: "%s".*?why: ")((?:[^"\\]|\\.)*)(",)' % cid, s, re.S)
        if not m:
            print(f"MISS {cid} in {path}"); sys.exit(1)
        variant = variants[i % len(variants)]
        s = s[:m.end(2)] + variant + s[m.end(2):]
    open(path, "w", encoding="utf-8").write(s)
    print(f"ok {path}: {len(ids)} whys")

# upsert OR-family problems + case: add the "upsert" word to briefs
for path, subs in [
    ("src/lib/curriculum/keyword-banks/write-problems-upsert.ts", [
        ("using the LEGACY conflict spelling \u2014 INSERT OR IGNORE",
         "using the LEGACY upsert-ancestor spelling \u2014 INSERT OR IGNORE (the OR-family that predates ON CONFLICT)"),
        ("Quarter-close rehearses the OR REPLACE trap",
         "Quarter-close rehearses the upsert family's OR REPLACE trap"),
        ("The re-registration pipeline must use OR REPLACE",
         "The re-registration pipeline must use the upsert family's OR REPLACE"),
    ]),
    ("src/lib/curriculum/keyword-banks/write-cases-upsert-a.ts", [
        ("Month-close rehearses the OR REPLACE trap with the K1 row",
         "Month-close rehearses the upsert family's OR REPLACE trap with the K1 row"),
    ]),
]:
    s = open(path, encoding="utf-8").read()
    for old, new in subs:
        if old not in s:
            print(f"MISS brief in {path}: {old[:50]}"); sys.exit(1)
        s = s.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(s)
    print(f"ok briefs {path}")
print("done")
