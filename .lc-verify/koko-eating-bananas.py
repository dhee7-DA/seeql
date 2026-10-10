import json

def minEatingSpeed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)   # ceil division

    l, r = 1, max(piles)
    while l < r:
        m = (l + r) // 2
        if hours(m) <= h:     # feasible → m might be minimal
            r = m
        else:                 # too slow → must eat faster
            l = m + 1
    return l
cases = json.load(open("/home/z/my-project/.lc-verify/koko-eating-bananas.cases.json"))
results = []
for c in cases:
    results.append(minEatingSpeed(*c["args"]))
print(json.dumps(results))