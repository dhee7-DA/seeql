import json

def twoSum(nums, target):
    seen = {}                       # value → index where it was met
    for i, n in enumerate(nums):
        need = target - n           # the partner this element wants
        if need in seen:
            return [seen[need], i]  # earlier index + current index
        seen[n] = i                 # remember AFTER checking

cases = json.load(open("/home/z/my-project/.lc-verify/two-sum.cases.json"))
results = []
for c in cases:
    results.append(twoSum(*c["args"]))
print(json.dumps(results))