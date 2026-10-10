import json

def findMin(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:   # m is in the high run → min is right of m
            l = m + 1
        else:                   # m is in the low run → min at m or left
            r = m
    return nums[l]
cases = json.load(open("/home/z/my-project/.lc-verify/find-minimum-in-rotated-sorted-array.cases.json"))
results = []
for c in cases:
    results.append(findMin(*c["args"]))
print(json.dumps(results))