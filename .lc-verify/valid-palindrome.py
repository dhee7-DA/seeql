import json

def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1                  # skip junk on the left
        while l < r and not s[r].isalnum():
            r -= 1                  # skip junk on the right
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True
cases = json.load(open("/home/z/my-project/.lc-verify/valid-palindrome.cases.json"))
results = []
for c in cases:
    results.append(isPalindrome(*c["args"]))
print(json.dumps(results))