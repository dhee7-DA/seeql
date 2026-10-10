import json

def checkInclusion(s1, s2):
    n1, n2 = len(s1), len(s2)
    if n1 > n2:
        return False
    need = {}                       # s1's requirement
    for ch in s1:
        need[ch] = need.get(ch, 0) + 1
    have = {}                       # current window's counts
    for i, ch in enumerate(s2):
        have[ch] = have.get(ch, 0) + 1      # enter the window
        if i >= n1:                         # evict the char that left
            out = s2[i - n1]
            have[out] -= 1
            if have[out] == 0:
                del have[out]
        if have == need:                    # exact multiset match
            return True
    return False
cases = json.load(open("/home/z/my-project/.lc-verify/permutation-in-string.cases.json"))
results = []
for c in cases:
    results.append(checkInclusion(*c["args"]))
print(json.dumps(results))