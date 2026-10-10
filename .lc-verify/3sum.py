import json

def threeSum(nums):
    nums.sort()                          # order makes dedupe + pairing easy
    out = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:                  # anchor positive → impossible
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue                     # skip duplicate anchors
        l, r = i + 1, len(nums) - 1
        while l < r:
            total = nums[i] + nums[l] + nums[r]
            if total < 0:
                l += 1
            elif total > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1               # skip duplicate left values
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1               # skip duplicate right values
    return out
cases = json.load(open("/home/z/my-project/.lc-verify/3sum.cases.json"))
results = []
for c in cases:
    results.append(threeSum(*c["args"]))
print(json.dumps(results))