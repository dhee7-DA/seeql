import json

def productExceptSelf(nums):
    n = len(nums)
    out = [1] * n

    prefix = 1
    for i in range(n):          # out[i] = product of everything LEFT of i
        out[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):   # fold in everything RIGHT of i
        out[i] *= suffix
        suffix *= nums[i]
    return out
cases = json.load(open("/home/z/my-project/.lc-verify/product-of-array-except-self.cases.json"))
results = []
for c in cases:
    results.append(productExceptSelf(*c["args"]))
print(json.dumps(results))