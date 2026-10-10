import json

def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        width = r - l
        best = max(best, width * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1          # the short left wall is the bottleneck → retire it
        else:
            r -= 1          # retire the short right wall
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/container-with-most-water.cases.json"))
results = []
for c in cases:
    results.append(maxArea(*c["args"]))
print(json.dumps(results))