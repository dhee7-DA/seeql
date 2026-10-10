import json

class TimeMap:
    def __init__(self):
        self.store = {}             # key → [(timestamp, value)]

    def set(self, key, value, timestamp):
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key, timestamp):
        pairs = self.store.get(key)
        if not pairs:
            return ""
        l, r = 0, len(pairs) - 1
        best = ""
        while l <= r:
            m = (l + r) // 2
            if pairs[m][0] <= timestamp:   # usable candidate
                best = pairs[m][1]
                l = m + 1                  # …but a later one may still fit
            else:
                r = m - 1
        return best
cases = json.load(open("/home/z/my-project/.lc-verify/time-based-key-value-store.cases.json"))
results = []
for c in cases:
    ops = c["args"][0]
    if ops and ops[0][0] == "TimeMap":
        ctor_args = ops[0][1:]
        obj = TimeMap(*ctor_args)
        ops = ops[1:]
    else:
        obj = TimeMap()
    case_results = []
    for op in ops:
        val = getattr(obj, op[0])(*op[1:])
        if op[0] not in ["set"]:
            case_results.append(val)
    results.append(case_results)
print(json.dumps(results))