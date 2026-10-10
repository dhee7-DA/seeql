import json

def evalRPN(tokens):
    stack = []
    ops = {"+", "-", "*", "/"}
    for tok in tokens:
        if tok in ops:
            b = stack.pop()          # right operand pops FIRST
            a = stack.pop()          # left operand second
            if tok == "+":   stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else:            stack.append(int(a / b))   # truncate toward 0
        else:
            stack.append(int(tok))   # operand (handles '-11' too)
    return stack[0]
cases = json.load(open("/home/z/my-project/.lc-verify/evaluate-reverse-polish-notation.cases.json"))
results = []
for c in cases:
    results.append(evalRPN(*c["args"]))
print(json.dumps(results))