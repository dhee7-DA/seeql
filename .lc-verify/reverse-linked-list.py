import json
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def __build(vals):
    head = None
    for v in reversed(vals):
        head = ListNode(v, head)
    return head

def __build_cycle(vals, pos):
    nodes = [ListNode(v) for v in vals]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    head = nodes[0] if nodes else None
    if pos >= 0 and nodes:
        nodes[-1].next = nodes[pos]
    return head

def __tolist(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out

def __build_random(spec):
    nodes = [ListNode(v) for v, _ in spec]
    for i, (_, r) in enumerate(spec):
        if r is not None:
            nodes[i].random = nodes[r]
        if i:
            nodes[i - 1].next = nodes[i]
    return nodes[0] if nodes else None

def __unrandom(head):
    index = {}
    order = []
    cur = head
    while cur:
        index[id(cur)] = len(order)
        order.append(cur)
        cur = cur.next
    return [[n.val, index[id(n.random)] if n.random is not None else None] for n in order]

def __build_child(seq):
    head = None
    tail = None
    prev = None
    for item in seq:
        if isinstance(item, list):
            if prev is not None:
                prev.child = __build_child(item)
        else:
            node = ListNode(item)
            node.prev = tail
            if tail is None:
                head = node
            else:
                tail.next = node
            tail = node
            prev = node
    return head

def reverseList(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next      # save the rest BEFORE overwriting
        cur.next = prev     # flip the arrow
        prev = cur          # reversed chain grows
        cur = nxt           # walk forward
    return prev             # prev is the new head
cases = json.load(open("/home/z/my-project/.lc-verify/reverse-linked-list.cases.json"))
results = []
for c in cases:
    results.append(__tolist(reverseList(__build(c["args"][0]))))
print(json.dumps(results))