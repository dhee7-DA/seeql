import json

def isValidSudoku(board):
    rows  = [set() for _ in range(9)]
    cols  = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]

    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            b = (r // 3) * 3 + c // 3      # which 3x3 box (0..8)
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True
cases = json.load(open("/home/z/my-project/.lc-verify/valid-sudoku.cases.json"))
results = []
for c in cases:
    results.append(isValidSudoku(*c["args"]))
print(json.dumps(results))