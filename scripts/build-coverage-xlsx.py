# SeeQL keyword-coverage workbook — built from scripts/keyword-coverage.json
# (counts aggregated from the live curriculum registries by scripts/keyword-coverage.ts).
# Styling: skills/xlsx design system (templates/base.py) — professional palette.
import json
import sys
import os

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)

from base import (  # noqa: E402
    FONT_NAME, FORMATS, NEUTRAL_600, PRIMARY,
    setup_sheet, style_header_row, style_data_row, style_total_row,
    auto_fit_columns, font_caption, align_number,
)
from openpyxl import Workbook  # noqa: E402
from openpyxl.formatting.rule import DataBarRule  # noqa: E402
from openpyxl.styles import Alignment  # noqa: E402
from openpyxl.utils import get_column_letter  # noqa: E402

SRC = "/home/z/my-project/scripts/keyword-coverage.json"
OUT = "/home/z/my-project/download/seeql-keyword-coverage.xlsx"

with open(SRC) as f:
    data = json.load(f)

wb = Workbook()
wb.properties.creator = "Z.ai"

INT = FORMATS["integer"]
RIGHT = align_number()


def write_headers(ws, row, headers, col_start=2):
    for i, h in enumerate(headers, col_start):
        ws.cell(row=row, column=i, value=h)
    style_header_row(ws, row, col_start, col_start + len(headers) - 1)


def write_total(ws, row, col_start, col_end, label_col, label, sums):
    """sums: {col_letter: formula_or_value}; other cells stay empty."""
    ws.cell(row=row, column=label_col, value=label)
    for letter, v in sums.items():
        ws[f"{letter}{row}"] = v
        ws[f"{letter}{row}"].number_format = INT
        ws[f"{letter}{row}"].alignment = RIGHT
    style_total_row(ws, row, col_start, col_end)


def footnote(ws, row, col, lines):
    for i, text in enumerate(lines):
        c = ws.cell(row=row + i, column=col, value=text)
        c.font = font_caption()


# ---------------------------------------------------------------- Sheet 1
ws = wb.active
ws.title = "Keyword coverage"
HDR = ["Code", "Keyword / skill", "Module", "Lesson", "Case files",
       "Quiz MCQs", "Query problems", "Fill-ins", "Cases + queries"]
LAST = 2 + len(HDR) - 1  # J
setup_sheet(ws, "SeeQL — keyword coverage: case files & graded query problems", LAST)
write_headers(ws, 4, HDR)

r = 5
for i, t in enumerate(data["topics"]):
    vals = [t["code"], t["label"], t["moduleTitle"],
            t["lessonNum"] if t["lessonNum"] is not None else None,
            t["cases"], t["mcqs"], t["problems"], t["fills"], f"=F{r}+H{r}"]
    for j, v in enumerate(vals, 2):
        cell = ws.cell(row=r, column=j)
        if v is not None:
            cell.value = v
    style_data_row(ws, r, 2, LAST, i)
    for col in (5, 6, 7, 8, 9, 10):
        c = ws.cell(row=r, column=col)
        c.number_format = INT
        c.alignment = RIGHT
    ws.cell(row=r, column=5).alignment = Alignment(horizontal="center", vertical="center")
    r += 1

last_data = r - 1
tr = r
write_total(ws, tr, 2, LAST, 2, "Total",
            {"F": f"=SUM(F5:F{last_data})"})
footnote(ws, tr + 2, 2, [
    "Counts are computed live from the curriculum registries — the same modules the app ships with.",
    "Case files are keyed to exactly one keyword each, so this column sums to the full 1,692-file deck.",
    "Quiz MCQs, query problems and fill-ins belong to the teaching lesson; keywords that share a lesson",
    "(e.g. 'IN subqueries' + 'Scalar subqueries' → Lesson 25) repeat the lesson's counts. Unduplicated",
    "totals — 613 MCQs · 430 query problems · 289 fill-ins — are on the 'By lesson' sheet.",
])
ws.freeze_panes = "D5"
auto_fit_columns(ws, min_width=8, max_width=30, header_row=4, data_start_row=5)
ws.column_dimensions["C"].width = 24

# ---------------------------------------------------------------- Sheet 2
ws2 = wb.create_sheet("By lesson")
HDR2 = ["Lesson #", "Lesson title", "Module", "Minutes", "Quiz MCQs",
        "Query problems", "Case files", "Fill-ins", "Practice total"]
LAST2 = 2 + len(HDR2) - 1  # J
setup_sheet(ws2, "SeeQL — practice volume by lesson (unduplicated counts)", LAST2)
write_headers(ws2, 4, HDR2)

r = 5
for i, l in enumerate(data["lessons"]):
    vals = [l["num"], l["title"], l["moduleTitle"], l["minutes"],
            l["mcqs"], l["problems"], l["cases"], l["fills"], f"=F{r}+G{r}+H{r}+I{r}"]
    for j, v in enumerate(vals, 2):
        ws2.cell(row=r, column=j, value=v)
    style_data_row(ws2, r, 2, LAST2, i)
    for col in (2, 5, 6, 7, 8, 9, 10):
        c = ws2.cell(row=r, column=col)
        c.number_format = INT
        c.alignment = RIGHT
    r += 1
cap = data["capCases"]
ws2.cell(row=r, column=3, value="Cross-lesson capstone mix (topic 'cap')")
ws2.cell(row=r, column=4, value="Foundations")
ws2.cell(row=r, column=8, value=cap)
ws2.cell(row=r, column=10, value=f"=F{r}+G{r}+H{r}+I{r}")
style_data_row(ws2, r, 2, LAST2, len(data["lessons"]))
for col in (2, 5, 6, 7, 8, 9, 10):
    c = ws2.cell(row=r, column=col)
    c.number_format = INT
    c.alignment = RIGHT
last_data2 = r
r += 1
tr2 = r
write_total(ws2, tr2, 2, LAST2, 2, "Total", {
    "E": f"=SUM(E5:E{last_data2})",
    "F": f"=SUM(F5:F{last_data2})",
    "G": f"=SUM(G5:G{last_data2})",
    "H": f"=SUM(H5:H{last_data2})",
    "I": f"=SUM(I5:I{last_data2})",
    "J": f"=SUM(J5:J{last_data2})",
})
footnote(ws2, tr2 + 2, 2, [
    "57 lessons · 9 modules · one storefront database. Case files reach lessons through their keyword",
    "topic; the 6 'cap' files are the cross-lesson capstone mix. Practice total = MCQs + queries +",
    "case files + fill-ins. Beyond the sheet: 2,695 keyword-drill questions and 5 messy-data capstone",
    "projects (109 graded questions) live in the practice lab.",
])
ws2.freeze_panes = "D5"
auto_fit_columns(ws2, min_width=8, max_width=30, header_row=4, data_start_row=5)
ws2.column_dimensions["C"].width = 42

# ---------------------------------------------------------------- Sheet 3
ws3 = wb.create_sheet("By module")
HDR3 = ["Module #", "Module title", "Lessons", "Minutes", "Quiz MCQs",
        "Query problems", "Case files", "Fill-ins", "Keyword drills", "Exams"]
LAST3 = 2 + len(HDR3) - 1  # K
setup_sheet(ws3, "SeeQL — practice volume by module", LAST3)
write_headers(ws3, 4, HDR3)

r = 5
for i, m in enumerate(data["modules"]):
    vals = [m["num"], m["title"], m["lessons"], m["minutes"], m["mcqs"],
            m["problems"], m["cases"], m["fills"], m["drills"], m["exam"]]
    for j, v in enumerate(vals, 2):
        ws3.cell(row=r, column=j, value=v)
    style_data_row(ws3, r, 2, LAST3, i)
    for col in range(2, LAST3 + 1):
        c = ws3.cell(row=r, column=col)
        c.number_format = INT
        c.alignment = RIGHT
    r += 1
last_data3 = r - 1
tr3 = r
write_total(ws3, tr3, 2, LAST3, 2, "Total", {
    "D": f"=SUM(D5:D{last_data3})",
    "E": f"=SUM(E5:E{last_data3})",
    "F": f"=SUM(F5:F{last_data3})",
    "G": f"=SUM(G5:G{last_data3})",
    "H": f"=SUM(H5:H{last_data3})",
    "I": f"=SUM(I5:I{last_data3})",
    "J": f"=SUM(J5:J{last_data3})",
    "K": f"=SUM(K5:K{last_data3})",
})
ws3.conditional_formatting.add(
    f"H5:H{last_data3}",
    DataBarRule(start_type="min", end_type="max", color=PRIMARY, showValue=True),
)
footnote(ws3, tr3 + 2, 2, [
    "Each module also carries one graded exam. Keyword drills cover modules 1–5; the clinic, write,",
    "schema and finance modules practice through case files, problems and the capstone instead.",
])
ws3.freeze_panes = "D5"
auto_fit_columns(ws3, min_width=8, max_width=30, header_row=4, data_start_row=5)
ws3.column_dimensions["C"].width = 30

# ---------------------------------------------------------------- Sheet 4
ws4 = wb.create_sheet("Keyword drills")
HDR4 = ["Drill set", "Keyword family", "Module", "Questions"]
LAST4 = 2 + len(HDR4) - 1  # E
setup_sheet(ws4, "SeeQL — keyword drill sets (six angles per keyword)", LAST4)
write_headers(ws4, 4, HDR4)

r = 5
for i, d in enumerate(data["drills"]):
    for j, v in enumerate([d["label"], d["keyword"], d["module"], d["questions"]], 2):
        ws4.cell(row=r, column=j, value=v)
    style_data_row(ws4, r, 2, LAST4, i)
    for col in (4, 5):
        c = ws4.cell(row=r, column=col)
        c.number_format = INT
        c.alignment = RIGHT
    r += 1
last_data4 = r - 1
tr4 = r
write_total(ws4, tr4, 2, LAST4, 2, "Total", {"E": f"=SUM(E5:E{last_data4})"})
footnote(ws4, tr4 + 2, 2, [
    "Every keyword is drilled from six angles: syntax, semantics, edge case, read-the-error,",
    "predict-the-output and judgment. Misses enroll in the Leitner review deck automatically.",
])
ws4.freeze_panes = "C5"
auto_fit_columns(ws4, min_width=8, max_width=30, header_row=4, data_start_row=5)
ws4.column_dimensions["C"].width = 26

for sheet in (ws, ws2, ws3, ws4):
    sheet.page_setup.orientation = "landscape"
    sheet.page_setup.fitToWidth = 1
    sheet.page_setup.fitToHeight = 0
    sheet.print_title_rows = "4:4"

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print(f"saved {OUT}")
print(f"font={FONT_NAME}")
