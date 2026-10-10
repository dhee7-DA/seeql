import json

def isValid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)              # expectation pushed
        elif not stack or stack.pop() != pairs[ch]:
            return False                  # close with nothing / wrong type
    return not stack                      # no openers may dangle
cases = json.load(open("/home/z/my-project/.lc-verify/valid-parentheses.cases.json"))
results = []
for c in cases:
    results.append(isValid(*c["args"]))
print(json.dumps(results))