import json

def minWindow(s, t):
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)         # characters still required (with multiplicity)
    l = 0
    best_len = float("inf")
    best_l = 0
    for r, ch in enumerate(s):
        if need.get(ch, 0) > 0:      # this char was genuinely missing
            missing -= 1
        need[ch] = need.get(ch, 0) - 1   # negatives = surplus
        if missing == 0:             # covered → tighten from the left
            while need.get(s[l], 0) < 0:     # left char is surplus
                need[s[l]] += 1
                l += 1
            if r - l + 1 < best_len:
                best_len = r - l + 1
                best_l = l
    return "" if best_len == float("inf") else s[best_l : best_l + best_len]
cases = json.load(open("/home/z/my-project/.lc-verify/minimum-window-substring.cases.json"))
results = []
for c in cases:
    results.append(minWindow(*c["args"]))
print(json.dumps(results))