import json

def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed))    # by position ascending
    fleets = 0
    slowest = 0.0                           # arrival time of the fleet ahead
    for pos, spd in reversed(pairs):        # nearest the target first
        t = (target - pos) / spd            # FLOAT division — the trap
        if t > slowest:                     # can't catch up → new fleet
            fleets += 1
            slowest = t
    return fleets
cases = json.load(open("/home/z/my-project/.lc-verify/car-fleet.cases.json"))
results = []
for c in cases:
    results.append(carFleet(*c["args"]))
print(json.dumps(results))