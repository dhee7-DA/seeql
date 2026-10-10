import json

def characterReplacement(s, k):
    count = {}               # char → count inside the window
    best = 0
    l = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        # invalid while rewrites needed exceed k
        while (r - l + 1) - max(count.values()) > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/longest-repeating-character-replacement.cases.json"))
results = []
for c in cases:
    results.append(characterReplacement(*c["args"]))
print(json.dumps(results))