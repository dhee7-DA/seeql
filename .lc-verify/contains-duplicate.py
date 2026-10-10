import json

def containsDuplicate(nums):
    seen = set()                # values met so far
    for n in nums:
        if n in seen:           # second sighting → duplicate
            return True
        seen.add(n)
    return False
cases = json.load(open("/home/z/my-project/.lc-verify/contains-duplicate.cases.json"))
results = []
for c in cases:
    results.append(containsDuplicate(*c["args"]))
print(json.dumps(results))