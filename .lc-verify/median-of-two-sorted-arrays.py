import json

def findMedianSortedArrays(a, b):
    if len(a) > len(b):          # search the shorter array
        a, b = b, a
    m, n = len(a), len(b)
    total = m + n
    half = (total + 1) // 2      # size of the left pile
    l, r = 0, m
    while l <= r:
        i = (l + r) // 2         # a contributes its first i values
        j = half - i             # b contributes the rest
        a_left  = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i]     if i < m else float("inf")
        b_left  = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j]     if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:
            # valid partition: left pile holds exactly 'half' smallest
            if total % 2:
                return max(a_left, b_left)
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            r = i - 1            # a gave too many → take fewer
        else:
            l = i + 1            # a gave too few → take more

cases = json.load(open("/home/z/my-project/.lc-verify/median-of-two-sorted-arrays.cases.json"))
results = []
for c in cases:
    results.append(findMedianSortedArrays(*c["args"]))
print(json.dumps(results))