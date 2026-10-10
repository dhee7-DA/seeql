import json

def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:                # closed interval [l, r] still alive
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[m] < target:
            l = m + 1            # answer lives strictly right of m
        else:
            r = m - 1            # strictly left of m
    return -1
cases = json.load(open("/home/z/my-project/.lc-verify/binary-search.cases.json"))
results = []
for c in cases:
    results.append(search(*c["args"]))
print(json.dumps(results))