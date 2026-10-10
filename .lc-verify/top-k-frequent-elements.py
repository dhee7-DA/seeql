import json

def topKFrequent(nums, k):
    count = {}
    for n in nums:                       # 1) frequency map
        count[n] = count.get(n, 0) + 1

    buckets = [[] for _ in range(len(nums) + 1)]  # freq → values
    for n, f in count.items():           # 2) scatter into buckets
        buckets[f].append(n)

    out = []
    for f in range(len(buckets) - 1, 0, -1):      # 3) highest first
        for n in buckets[f]:
            out.append(n)
            if len(out) == k:
                return out
cases = json.load(open("/home/z/my-project/.lc-verify/top-k-frequent-elements.cases.json"))
results = []
for c in cases:
    results.append(topKFrequent(*c["args"]))
print(json.dumps(results))