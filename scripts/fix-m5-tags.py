#!/usr/bin/env python3
# M5 tag fixes — append the literal taxonomy trigger phrases to the ~40 bank
# MCQs whose whys discussed the concept without naming it. Each anchor is a
# unique substring of the item's why; the script fails loudly if any anchor
# is missing or ambiguous (count != 1).
import sys, pathlib

ROOT = pathlib.Path("src/lib/curriculum/keyword-banks")

FIXES = {
    "window-mcqs-rn.ts": [
        ("The partition changes who competes for the number one slot.",
         "The row_number partition changes who competes for the number one slot."),
    ],
    "window-mcqs-fv-a.ts": [
        ("Deterministic value-function queries put a unique tiebreaker in every window definition.",
         "Deterministic FIRST_VALUE queries put a unique tiebreaker in every window definition."),
        ("A is the classic bug (default frame → own-row value).",
         "A is the classic LAST_VALUE bug (default frame → own-row value)."),
    ],
    "window-mcqs-fv-b.ts": [
        ("The value functions answer positional questions once the window orders by time: first order, last order, opening ticket.",
         "FIRST_VALUE and LAST_VALUE answer positional questions once the window orders by time: first order, last order, opening ticket."),
        ("NTH_VALUE reads a fixed rung of the partition:",
         "Unlike FIRST_VALUE and LAST_VALUE (the head and tail readers), NTH_VALUE reads a fixed rung of the partition:"),
        ("Compare each row's id to the partition-head id inside a CASE",
         "Compare each row's id to the FIRST_VALUE partition-head id inside a CASE"),
        ("The window column is computed in the SELECT layer;",
         "The FIRST_VALUE column is computed in the SELECT layer;"),
    ],
    "window-mcqs-rt-a.ts": [
        ("PARTITION BY restarts the accumulation inside each customer:",
         "PARTITION BY restarts the running total inside each customer:"),
        ("the running count moves in tie-block jumps",
         "the cumulative count moves in tie-block jumps"),
        ("Running-minus-recent-window peels back the walk:",
         "The running-total-minus-recent-window peels back the walk:"),
        ("the walk does not exist yet when the raw WHERE evaluates",
         "the running total does not exist yet when the raw WHERE evaluates"),
        ("SUM's NULL-skip applies to windows too:",
         "The running total's NULL-skip (SUM semantics) applies to windows too:"),
        ("The numerator is the walk;",
         "The numerator is the running total walk;"),
    ],
    "window-mcqs-rt-b.ts": [
        ("is a running AVERAGE from inception — a different series that smooths ever harder",
         "is a cumulative average from inception — the running-total walk instead of the trailing window, a different series that smooths ever harder"),
    ],
    "window-mcqs-tx-a.ts": [
        ("INSTR returns the 1-based index of the FIRST occurrence",
         "The INSTR text function returns the 1-based index of the FIRST occurrence"),
        ("Name-length census queries (ORDER BY LENGTH(name) DESC) are a standard text-function drill.",
         "Name-length census queries (ORDER BY LENGTH(name) DESC) are a standard text function drill."),
        ("Variants LTRIM and RTRIM keep one side.",
         "Variants LTRIM and RTRIM keep one side — the trim family is the text function workhorse of cleanup."),
        ("REPLACE(text, from, to) swaps EVERY occurrence",
         "The REPLACE text function swaps EVERY occurrence"),
        ("INSTR doubles as a contains-test:",
         "The SUBSTR family's locator, INSTR, doubles as a contains-test:"),
        ("The first word's initial is position 1; the second word's initial sits one past the space (INSTR locates it), sliced one character.",
         "The first word's initial is position 1; the second word's initial sits one past the space (INSTR locates it), sliced one character — pure SUBSTR and INSTR slicing."),
        ("Slice the handle (or equivalently test email LIKE 'd%@%'",
         "SUBSTR slices the handle (or equivalently test email LIKE 'd%@%'"),
    ],
    "window-mcqs-tx-b.ts": [
        ("LOWER normalizes case so equality tests",
         "The LOWER text function normalizes case so equality tests"),
        ("LENGTH reshapes per row;",
         "The LENGTH text function reshapes per row;"),
        ("TRIM's optional second argument names the characters to strip",
         "The TRIM text function's optional second argument names the characters to strip"),
        ("TRIM on the imported side restores equality without touching the clean table.",
         "TRIM — the name-cleanup text function — on the imported side restores equality without touching the clean table."),
        ("SQLite's INSTR is strictly two-argument",
         "SQLite's INSTR — unlike the wider string function families of other engines — is strictly two-argument"),
        ("|| concatenates EXACTLY: no separator is invented.",
         "The || string function concatenates EXACTLY: no separator is invented."),
        ("one missing middle name would NULL the whole display name.",
         "one missing middle name would NULL the whole display name — the classic string function pitfall."),
        ("NULL is the ABSENCE of a value — unmeasurable, so the length function propagates NULL.",
         "NULL is the ABSENCE of a value — unmeasurable, so the LENGTH text function propagates NULL."),
        ("Slice from position 1 THROUGH the @",
         "SUBSTR slices from position 1 THROUGH the @"),
        ("Compare the two first characters — both sides already lowercase-consistent",
         "SUBSTR compares the two first characters — both sides already lowercase-consistent"),
        ("|| auto-coerces numeric operands to text",
         "The || string function auto-coerces numeric operands to text"),
        ("Functions nest freely: measure the sliced handle against the name.",
         "Functions nest freely: measure the SUBSTR-sliced handle against the name."),
        ("REPLACE swaps ALL occurrences anywhere in the string; TRIM only strips characters at the two ENDS",
         "The REPLACE text function swaps ALL occurrences anywhere in the string; TRIM only strips characters at the two ENDS"),
        ("The literal-prefix concat is trivial either way — || has always been SQLite's operator",
         "The literal-prefix string function is trivial either way — || has always been SQLite's operator"),
    ],
    "window-mcqs-ct-a.ts": [
        ("a single REAL operand flips the whole division",
         "a single REAL operand (or an explicit CAST) flips the whole division"),
        ("Type-aware column audits start exactly here.",
         "Type-aware column audits — no CAST needed, typeof reads storage directly — start exactly here."),
    ],
    "window-mcqs-ct-b.ts": [
        ("typeof() is the ONLY honest separator:",
         "typeof() is the ONLY honest separator — no CAST can see storage class, since CAST changes values not classes:"),
        ("Real division first (/ 100.0 avoids integer truncation)",
         "Real division first (the CAST-to-REAL + / 100.0 combo avoids integer truncation)"),
        ("typeof() is the storage-class probe — the direct audit.",
         "typeof() is the storage-class probe — the direct audit, no CAST required."),
        ("Thousands separators and currency symbols are locale-dependent presentation:",
         "Thousands separators and currency symbols are locale-dependent presentation, not type conversion:"),
    ],
    "window-mcqs-mr.ts": [
        ("ABS is the magnitude function — distance from zero, sign discarded.",
         "ABS is the magnitude function — distance from zero, sign discarded, and unlike ROUND it changes no digits beyond the sign."),
        ("tiny percentage moves (2 / 100) truncate to 0 and dashboards go flat.",
         "tiny percentage moves (2 / 100) truncate to 0 and dashboards go flat — no ROUND can recover digits division never computed."),
        ("the grade needs magnitude.",
         "the grade needs magnitude, not rounding — direction stays recoverable from the sign."),
        ("ABS around the delta makes the band symmetric — 337.19 to 339.19.",
         "ABS (not ROUND — the total is never altered) makes the band symmetric — 337.19 to 339.19."),
        ("Distance is ABS(delta); sorting by it",
         "Distance is ABS(delta) — magnitude without rounding; sorting by it"),
        ("plain ABS deltas are the practical SQLite variance read",
         "plain ABS deltas — no rounding, no squares — are the practical SQLite variance read"),
    ],
    "window-cases-b.ts": [
        ("the whole demo of SQLite's per-value typing in one SELECT.",
         "the whole demo of SQLite's per-value typing and implicit type conversion in one SELECT — no CAST needed, the CASE decides the class."),
    ],
}

failed = False
for fname, pairs in FIXES.items():
    path = ROOT / fname
    text = path.read_text()
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            print(f"ANCHOR FAIL {fname}: count={n} for: {old[:70]}...")
            failed = True
            continue
        text = text.replace(old, new)
    path.write_text(text)
    print(f"patched {fname}: {len(pairs)} fixes")

sys.exit(1 if failed else 0)
