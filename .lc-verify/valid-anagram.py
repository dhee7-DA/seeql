import json

def isAnagram(s, t):
    if len(s) != len(t):        # different sizes → impossible
        return False
    count = {}                  # char → surplus of s over t
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    for ch in t:
        if ch not in count:     # t has a char s lacks
            return False
        count[ch] -= 1
        if count[ch] == 0:
            del count[ch]       # keep the map empty iff anagram
    return not count            # empty dict → all counts cancelled
cases = json.load(open("/home/z/my-project/.lc-verify/valid-anagram.cases.json"))
results = []
for c in cases:
    results.append(isAnagram(*c["args"]))
print(json.dumps(results))