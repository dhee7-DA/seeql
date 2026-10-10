import json

def lengthOfLongestSubstring(s):
    last = {}                # char → index of its most recent appearance
    start = 0                # window start (inclusive)
    best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1     # jump past the previous copy
        last[ch] = i
        best = max(best, i - start + 1)
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/longest-substring-without-repeating-characters.cases.json"))
results = []
for c in cases:
    results.append(lengthOfLongestSubstring(*c["args"]))
print(json.dumps(results))