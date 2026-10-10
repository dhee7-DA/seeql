import json

def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:              # left half [l..m] is sorted
            if nums[l] <= target < nums[m]:
                r = m - 1                   # target hides in the sorted half
            else:
                l = m + 1
        else:                               # right half [m..r] is sorted
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1
cases = json.load(open("/home/z/my-project/.lc-verify/search-in-rotated-sorted-array.cases.json"))
results = []
for c in cases:
    results.append(search(*c["args"]))
print(json.dumps(results))