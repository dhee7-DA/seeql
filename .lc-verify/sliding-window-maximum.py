import json

from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()             # indices; their values strictly decreasing
    out = []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] <= n:
            dq.pop()         # back-evict: smaller values can't win again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()     # front slid out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out
cases = json.load(open("/home/z/my-project/.lc-verify/sliding-window-maximum.cases.json"))
results = []
for c in cases:
    results.append(maxSlidingWindow(*c["args"]))
print(json.dumps(results))