import json

def dailyTemperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []               # indices still waiting for a warmer day
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            j = stack.pop()  # day j just found its warmer day (i)
            answer[j] = i - j
        stack.append(i)
    return answer
cases = json.load(open("/home/z/my-project/.lc-verify/daily-temperatures.cases.json"))
results = []
for c in cases:
    results.append(dailyTemperatures(*c["args"]))
print(json.dumps(results))