import json

def longestConsecutive(nums):
    numset = set(nums)              # O(1) membership + dedupe
    best = 0
    for n in numset:
        if n - 1 in numset:         # a run continues here — not a start
            continue
        length = 1
        while n + length in numset: # walk the run forward
            length += 1
        best = max(best, length)
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/longest-consecutive-sequence.cases.json"))
results = []
for c in cases:
    results.append(longestConsecutive(*c["args"]))
print(json.dumps(results))