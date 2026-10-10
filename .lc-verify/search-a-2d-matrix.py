import json

def searchMatrix(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    l, r = 0, rows * cols - 1
    while l <= r:
        m = (l + r) // 2
        v = matrix[m // cols][m % cols]   # unwrap the virtual index
        if v == target:
            return True
        if v < target:
            l = m + 1
        else:
            r = m - 1
    return False
cases = json.load(open("/home/z/my-project/.lc-verify/search-a-2d-matrix.cases.json"))
results = []
for c in cases:
    results.append(searchMatrix(*c["args"]))
print(json.dumps(results))