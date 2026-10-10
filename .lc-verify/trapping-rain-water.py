import json

def trap(height):
    l, r = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            water += left_max - height[l]   # right side is guaranteed taller
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]  # left side is guaranteed taller
            r -= 1
    return water
cases = json.load(open("/home/z/my-project/.lc-verify/trapping-rain-water.cases.json"))
results = []
for c in cases:
    results.append(trap(*c["args"]))
print(json.dumps(results))