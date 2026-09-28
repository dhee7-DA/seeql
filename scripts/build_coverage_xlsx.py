# SeeQL — SQL Coverage by Keyword (.xlsx builder)
# Reads scripts/coverage-data.json (emitted by scripts/coverage-census.ts)
# and builds the styled workbook per the xlsx skill design system.
import sys, os, json, datetime

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)

from base import (  # noqa: E402
    FONT_NAME, HEADER_BOLD, PRIMARY, SECONDARY, ACCENT_NEGATIVE, ACCENT_POSITIVE,
    NEUTRAL_600, NEUTRAL_900, FORMATS,
    font_title, font_header, font_body, font_caption,
    fill_data_row, align_number, align_text,
    setup_sheet, style_header_row, style_data_row, style_total_row,
    auto_fit_columns,
)
from openpyxl import Workbook  # noqa: E402
from openpyxl.styles import Font, PatternFill, Alignment  # noqa: E402
from openpyxl.formatting.rule import CellIsRule, DataBarRule  # noqa: E402
from openpyxl.utils import get_column_letter  # noqa: E402

DATA = json.load(open("/home/z/my-project/scripts/coverage-data.json"))
OUT = "/home/z/my-project/download/SeeQL_SQL_Coverage_by_Keyword.xlsx"

S = DATA["sources"]
MODULES = DATA["modules"]
KEYWORDS = DATA["keywords"]
PER_MOD = DATA["perModuleKeywords"]

CAT_ORDER = [
    "Reading data", "Boolean logic", "NULL handling", "Aggregation", "Joins",
    "Set operations", "Conditional logic", "Subqueries", "CTEs",
    "Window functions", "Functions", "Writes", "Schema",
]

MOD_SHEET_NAMES = {
    1: "M1 Foundations", 2: "M2 Joins", 3: "M3 Sets & CASE", 4: "M4 Subqueries & CTEs",
    5: "M5 Toolkit", 6: "M6 Expert Clinic", 7: "M7 Writes", 8: "M8 Schema",
    9: "M9 Finance", 10: "M10 Windows",
}

zero_font = Font(name=FONT_NAME, size=11, color=ACCENT_NEGATIVE)
zero_fill = PatternFill(bgColor="FDEDEC")
pass_font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
pass_fill = PatternFill(bgColor="E8F5E9")
fail_font = Font(name=FONT_NAME, size=11, color=ACCENT_NEGATIVE)
fail_fill = PatternFill(bgColor="FDEDEC")


def num_cells(ws, row, cols):
    for c in cols:
        cell = ws.cell(row=row, column=c)
        cell.alignment = align_number()
        cell.number_format = FORMATS["integer"]


def add_zero_cf(ws, rng):
    ws.conditional_formatting.add(
        rng, CellIsRule(operator="equal", formula=["0"], font=zero_font, fill=zero_fill))


def add_databar(ws, rng):
    ws.conditional_formatting.add(
        rng, DataBarRule(start_type="min", end_type="max", color=PRIMARY, showValue=True))


def caption(ws, row, col, text):
    cell = ws.cell(row=row, column=col, value=text)
    cell.font = font_caption()
    cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=False)


wb = Workbook()

# ---------------------------------------------------------------------------
# Sheet 1 — Read Me
# ---------------------------------------------------------------------------
ws = wb.active
ws.title = "Read Me"
last_col = 3
setup_sheet(ws, title="SeeQL — SQL Coverage by Keyword", last_col=last_col)
for c, h in enumerate(["Item", "Description"], start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

readme = [
    ("What this file is",
     "A keyword-level coverage map of the SeeQL course: every SQL keyword/concept measured against the practice material that teaches it — quiz questions (MCQs), graded query problems, case files, fill-in-the-blank drills and keyword drills."),
    ("Generated",
     f"{datetime.date.today().isoformat()} from the live course registries: 10 modules, {S['lessons']} lessons, {S['mcqs']} MCQs, {S['queries']} graded query problems, {S['cases']} case files, {S['fills']} fills, {S['drillQuestions']} keyword-drill questions across {S['drillSets']} drill sets."),
    ("How to read coverage",
     "Counts are multi-label: one item can cover several keywords (a query using GROUP BY + CASE + LEFT JOIN counts once in each of those rows). Keyword rows therefore do not sum to module volumes — that is by design."),
    ("Exact volumes",
     "The Totals sheet counts every item exactly once; it is the module-level source of truth. The Review sheet cross-checks it with live formulas."),
    ("Red zeros",
     "A red-highlighted zero means the keyword has no material of that kind yet — the quickest gap signal. Red text anywhere else flags the thinnest coverage."),
    ("Data bars",
     "Total practice = MCQs + queries + cases + fills + drills for that keyword; the bar shows relative depth at a glance."),
    ("Drill attribution",
     f"Every drill set carries an explicit keyword and module. Generic sets (edges / syntax / judgment / capstones) map to their closest canonical keywords; all {S['drillQuestions']} drill questions are attributed."),
    ("Capstone cases",
     f"{S['crossModuleCases']} 'cap' case files deliberately mix modules. They appear on the Totals sheet as Cross-module and inside keyword rows, but not on the per-module sheets."),
    ("Sheet guide",
     "Totals — module volumes. Keywords — all keyword rows across the course. M1..M10 — keyword distribution inside each module. Review — self-check formulas (PASS/FAIL)."),
    ("Regeneration",
     "npx tsx scripts/coverage-census.ts --emit  &&  python3 scripts/build_coverage_xlsx.py — the workbook rebuilds from the live material banks, so it can never drift from the app."),
]
r = 5
for i, (label, desc) in enumerate(readme):
    ws.cell(row=r, column=2, value=label)
    ws.cell(row=r, column=3, value=desc)
    fill = fill_data_row(i)
    for c in (2, 3):
        cell = ws.cell(row=r, column=c)
        cell.fill = fill
        cell.font = font_body()
    ws.cell(row=r, column=2).alignment = Alignment(horizontal="left", vertical="top")
    ws.cell(row=r, column=3).alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    r += 1
ws.column_dimensions["B"].width = 24
ws.column_dimensions["C"].width = 96
caption(ws, r + 1, 2, "SeeQL coverage workbook — built from the live registries, never hand-edited.")

# ---------------------------------------------------------------------------
# Sheet 2 — Totals (exact, one row per module + cap row + TOTAL)
# ---------------------------------------------------------------------------
ws = wb.create_sheet("Totals")
headers = ["Module", "Level", "Lessons", "MCQs", "Query problems", "Case files",
           "Fills", "Drill questions", "Lesson minutes"]
last_col = len(headers) + 1  # B..J
setup_sheet(ws, title="Module volumes — the exact census", last_col=last_col)
for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

r = 5
for i, m in enumerate(MODULES):
    vals = [f"M{m['num']} — {m['title']}", m["level"], m["lessons"], m["mcqs"],
            m["queries"], m["cases"], m["fills"], m["drills"], m["minutes"]]
    for c, v in enumerate(vals, start=2):
        ws.cell(row=r, column=c, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=last_col, row_index=i)
    num_cells(ws, r, range(4, 11))
    r += 1

cap_row = r
cap_vals = ["Cross-module (cap)", "Mixed", 0, 0, 0, S["crossModuleCases"], 0, 0, 0]
for c, v in enumerate(cap_vals, start=2):
    ws.cell(row=r, column=c, value=v)
style_data_row(ws, row_num=r, col_start=2, col_end=last_col, row_index=len(MODULES))
num_cells(ws, r, range(4, 11))
r += 1

total_row = r
ws.cell(row=r, column=2, value="TOTAL")
for c in range(4, 11):
    letter = get_column_letter(c)
    ws.cell(row=r, column=c, value=f"=SUM({letter}5:{letter}{cap_row})")
style_total_row(ws, row_num=r, col_start=2, col_end=last_col)
num_cells(ws, r, range(4, 11))
add_zero_cf(ws, f"D5:I{cap_row}")
caption(ws, r + 2, 2, "Exact counts — each item appears in exactly one row. Lesson minutes exclude module exams (12 min each) and the drill-yard finale.")

# ---------------------------------------------------------------------------
# Sheet 3 — Keywords (master, 61 rows, multi-label)
# ---------------------------------------------------------------------------
ws = wb.create_sheet("Keywords")
headers = ["Keyword", "Category", "Primary module", "MCQs", "Query problems",
           "Case files", "Fills", "Drill questions", "Total practice"]
last_col = len(headers) + 1  # B..J
setup_sheet(ws, title="Keyword coverage across the whole course", last_col=last_col)
for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

kw_sorted = sorted(
    KEYWORDS,
    key=lambda k: (CAT_ORDER.index(k["category"]) if k["category"] in CAT_ORDER else 99,
                   -k["total"], k["keyword"]),
)
r = 5
for i, k in enumerate(kw_sorted):
    pm = f"M{k['primaryModule']}" if k.get("primaryModule") else "-"
    vals = [k["keyword"], k["category"], pm, k["mcqs"], k["queries"], k["cases"],
            k["fills"], k["drills"], k["total"]]
    for c, v in enumerate(vals, start=2):
        ws.cell(row=r, column=c, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=last_col, row_index=i)
    ws.cell(row=r, column=4).alignment = Alignment(horizontal="center", vertical="center")
    num_cells(ws, r, range(5, 11))
    r += 1
kw_last = r - 1
add_zero_cf(ws, f"E5:I{kw_last}")
add_databar(ws, f"J5:J{kw_last}")
ws.freeze_panes = "D5"
caption(ws, kw_last + 2, 2, "Multi-label tagging: one item can cover several keywords, so columns do not sum to course totals. Red zero = no material of that kind yet.")

# ---------------------------------------------------------------------------
# Sheets 4..13 — one per module
# ---------------------------------------------------------------------------
for m in MODULES:
    ws = wb.create_sheet(MOD_SHEET_NAMES[m["num"]])
    headers = ["Keyword", "Category", "MCQs", "Query problems", "Case files",
               "Fills", "Drill questions", "Total"]
    last_col = len(headers) + 1  # B..I
    setup_sheet(ws, title=f"Module {m['num']} — {m['title']} · keyword distribution", last_col=last_col)
    for c, h in enumerate(headers, start=2):
        ws.cell(row=4, column=c, value=h)
    style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

    rows = PER_MOD.get(str(m["num"]), [])
    r = 5
    for i, k in enumerate(rows):
        vals = [k["keyword"], k["category"], k["mcqs"], k["queries"], k["cases"],
                k["fills"], k["drills"], k["total"]]
        for c, v in enumerate(vals, start=2):
            ws.cell(row=r, column=c, value=v)
        style_data_row(ws, row_num=r, col_start=2, col_end=last_col, row_index=i)
        num_cells(ws, r, range(4, 10))
        r += 1
    if rows:
        mod_last = r - 1
        add_zero_cf(ws, f"D5:H{mod_last}")
        add_databar(ws, f"I5:I{mod_last}")
        caption(ws, mod_last + 2, 2,
                "Keyword-tagged counts (multi-label) — exact module volumes are on the Totals sheet. Red zero = thin for that source.")
    ws.freeze_panes = "D5"

# ---------------------------------------------------------------------------
# Sheet 14 — Review (cross-validation, live formulas)
# ---------------------------------------------------------------------------
ws = wb.create_sheet("Review")
ws.sheet_properties.tabColor = "FFC000"
headers = ["Check", "Expected", "Actual", "Status"]
last_col = len(headers) + 1  # B..E
setup_sheet(ws, title="Cross-validation — workbook vs live registries", last_col=last_col)
for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

checks = [
    ("Modules", 10, "=COUNTA(Totals!B5:B14)"),
    ("Lessons", S["lessons"], "=SUM(Totals!D5:D15)"),
    ("Quiz questions (MCQs)", S["mcqs"], "=SUM(Totals!E5:E15)"),
    ("Graded query problems", S["queries"], "=SUM(Totals!F5:F15)"),
    ("Case files", S["cases"], "=SUM(Totals!G5:G15)"),
    ("Fill-in-the-blank drills", S["fills"], "=SUM(Totals!H5:H15)"),
    ("Keyword drill questions", S["drillQuestions"], "=SUM(Totals!I5:I15)"),
    ("Lesson minutes", sum(m["minutes"] for m in MODULES), "=SUM(Totals!J5:J15)"),
    ("Keyword rows on Keywords sheet", len(KEYWORDS), f"=COUNTA(Keywords!B5:B{4 + len(KEYWORDS)})"),
    ("Cross-module (cap) case files", S["crossModuleCases"], "=Totals!G15"),
]
r = 5
for i, (label, expected, actual) in enumerate(checks):
    ws.cell(row=r, column=2, value=label)
    ws.cell(row=r, column=3, value=expected)
    ws.cell(row=r, column=4, value=actual)
    ws.cell(row=r, column=5, value=f'=IF(C{r}=D{r},"PASS","FAIL")')
    style_data_row(ws, row_num=r, col_start=2, col_end=last_col, row_index=i)
    ws.cell(row=r, column=3).alignment = align_number()
    ws.cell(row=r, column=3).number_format = FORMATS["integer"]
    ws.cell(row=r, column=4).alignment = align_number()
    ws.cell(row=r, column=4).number_format = FORMATS["integer"]
    ws.cell(row=r, column=5).alignment = Alignment(horizontal="center", vertical="center")
    r += 1
rev_last = r - 1
ws.conditional_formatting.add(
    f"E5:E{rev_last}", CellIsRule(operator="equal", formula=['"PASS"'], font=pass_font, fill=pass_fill))
ws.conditional_formatting.add(
    f"E5:E{rev_last}", CellIsRule(operator="equal", formula=['"FAIL"'], font=fail_font, fill=fail_fill))
caption(ws, rev_last + 2, 2, "Expected values come from the census JSON; Actual values are live formulas over the Totals sheet. Every row must read PASS.")

wb.properties.creator = "Z.ai"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print(f"saved {OUT} — sheets: {wb.sheetnames}")
