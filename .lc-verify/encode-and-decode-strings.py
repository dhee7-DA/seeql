import json

def encode(strs):
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(s):
    out, i = [], 0
    while i < len(s):
        j = i
        while s[j] != "#":              # scan the full length number
            j += 1
        length = int(s[i:j])            # multi-digit safe
        out.append(s[j + 1 : j + 1 + length])
        i = j + 1 + length              # jump past payload
    return out
cases = json.load(open("/home/z/my-project/.lc-verify/encode-and-decode-strings.cases.json"))
results = []
for c in cases:
    results.append(decode(encode(c["args"][0])))
print(json.dumps(results))