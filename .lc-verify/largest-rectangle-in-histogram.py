import json

def largestRectangleArea(heights):
    stack = []               # indices with increasing heights
    best = 0
    for i, h in enumerate(heights + [0]):   # 0 sentinel flushes everyone
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/largest-rectangle-in-histogram.cases.json"))
results = []
for c in cases:
    results.append(largestRectangleArea(*c["args"]))
print(json.dumps(results))