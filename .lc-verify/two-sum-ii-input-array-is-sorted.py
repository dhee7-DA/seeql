import json

def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        total = numbers[l] + numbers[r]
        if total == target:
            return [l + 1, r + 1]      # 1-indexed answer
        if total < target:
            l += 1                     # need a bigger sum → bigger left
        else:
            r -= 1                     # need a smaller sum → smaller right

cases = json.load(open("/home/z/my-project/.lc-verify/two-sum-ii-input-array-is-sorted.cases.json"))
results = []
for c in cases:
    results.append(twoSum(*c["args"]))
print(json.dumps(results))