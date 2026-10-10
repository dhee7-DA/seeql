import json

class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []              # running min at every depth

    def push(self, val):
        self.stack.append(val)
        m = val if not self.mins else min(val, self.mins[-1])
        self.mins.append(m)

    def pop(self):
        self.stack.pop()
        self.mins.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.mins[-1]
cases = json.load(open("/home/z/my-project/.lc-verify/min-stack.cases.json"))
results = []
for c in cases:
    ops = c["args"][0]
    if ops and ops[0][0] == "MinStack":
        ctor_args = ops[0][1:]
        obj = MinStack(*ctor_args)
        ops = ops[1:]
    else:
        obj = MinStack()
    case_results = []
    for op in ops:
        val = getattr(obj, op[0])(*op[1:])
        if op[0] not in ["push","pop"]:
            case_results.append(val)
    results.append(case_results)
print(json.dumps(results))