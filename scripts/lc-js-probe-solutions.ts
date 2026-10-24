// Reference JS solutions for the harness probe (scripts/lc-js-probe.ts).
// One correct solution per NEW wrap the 212 wired dives use — if the real
// Blob-worker source grades all of these green, the in-app code lab grades
// the new dives correctly.

export const invertBinaryTree = `function invertTree(root) {
  if (!root) return null;
  var t = root.left; root.left = root.right; root.right = t;
  invertTree(root.left); invertTree(root.right);
  return root;
}`;

export const serializeTree = `function encode(root) {
  var out = [];
  function go(n) { if (!n) { out.push('N'); return; } out.push(String(n.val)); go(n.left); go(n.right); }
  go(root);
  return out.join(',');
}
function decode(s) {
  var toks = s.split(','), i = 0;
  function go() {
    var t = toks[i++];
    if (t === 'N') return null;
    var n = { val: Number(t), left: null, right: null };
    n.left = go(); n.right = go();
    return n;
  }
  return go();
}`;

export const kthLargest = `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.a = nums.slice().sort(function (x, y) { return y - x; }).slice(0, k);
  }
  add(val) {
    var a = this.a;
    if (a.length < this.k) { a.push(val); a.sort(function (x, y) { return y - x; }); }
    else if (val > a[a.length - 1]) { a[a.length - 1] = val; a.sort(function (x, y) { return y - x; }); }
    return a[a.length - 1];
  }
}`;

export const copyRandom = `function copyRandomList(head) {
  if (!head) return null;
  var map = new Map();
  var cur = head;
  while (cur) { map.set(cur, { val: cur.val, next: null, random: null }); cur = cur.next; }
  cur = head;
  while (cur) {
    var c = map.get(cur);
    c.next = map.get(cur.next) || null;
    c.random = map.get(cur.random) || null;
    cur = cur.next;
  }
  return map.get(head);
}`;

export const flattenChild = `function flatten(head) {
  var cur = head;
  while (cur) {
    if (cur.child) {
      var nxt = cur.next;
      var childHead = flatten(cur.child);
      cur.next = childHead; childHead.prev = cur; cur.child = null;
      var tail = childHead;
      while (tail.next) tail = tail.next;
      if (nxt) { tail.next = nxt; nxt.prev = tail; }
    }
    cur = cur.next;
  }
  return head;
}`;

export const dedupeK = `function removeDuplicates(nums) {
  if (!nums.length) return 0;
  var k = 1;
  for (var i = 1; i < nums.length; i++) if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];
  return k;
}`;

export const bstIterator = `class BSTIterator {
  constructor(root) { this.stack = []; this.pushLeft(root); }
  pushLeft(n) { while (n) { this.stack.push(n); n = n.left; } }
  next() { var n = this.stack.pop(); if (n.right) this.pushLeft(n.right); return n.val; }
  hasNext() { return this.stack.length > 0; }
}`;

export const encodeDecode = `function encode(strs) {
  return strs.map(function (s) { return s.length + '#' + s; }).join('');
}
function decode(s) {
  var out = [], i = 0;
  while (i < s.length) {
    var j = s.indexOf('#', i);
    var len = Number(s.slice(i, j));
    out.push(s.slice(j + 1, j + 1 + len));
    i = j + 1 + len;
  }
  return out;
}`;

export const sameTree = `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q) return false;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`;

export const lruCache = `class LRUCache {
  constructor(cap) { this.cap = cap; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    var v = this.map.get(key);
    this.map.delete(key); this.map.set(key, v);
    return v;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      var first = this.map.keys().next().value;
      this.map.delete(first);
    }
  }
}`;
