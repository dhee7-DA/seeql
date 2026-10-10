import json

def maxProfit(prices):
    best = 0
    lo = float("inf")            # cheapest price seen so far
    for p in prices:
        best = max(best, p - lo) # sell today against the historical best buy
        lo = min(lo, p)          # today might be a better buy
    return best
cases = json.load(open("/home/z/my-project/.lc-verify/best-time-to-buy-and-sell-stock.cases.json"))
results = []
for c in cases:
    results.append(maxProfit(*c["args"]))
print(json.dumps(results))