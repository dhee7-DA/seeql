import json

def groupAnagrams(strs):
    groups = {}                     # signature → members
    for s in strs:
        key = "".join(sorted(s))    # canonical form: letters in order
        groups.setdefault(key, []).append(s)
    return list(groups.values())
cases = json.load(open("/home/z/my-project/.lc-verify/group-anagrams.cases.json"))
results = []
for c in cases:
    results.append(groupAnagrams(*c["args"]))
print(json.dumps(results))