// JavaScript starter stubs for the algorithm sandbox. Keyed by problem slug;
// every entry matches the signature the problem's verify spec calls (same
// fn name, same arg order). The UI drops the user into the stub so the only
// work left is the idea — not guessing parameter names.
//
// Two class problems (MinStack, TimeMap) and one codec problem
// (encode-and-decode-strings) get structural skeletons instead of a single
// function, because their harness exercises multiple members.

const STARTERS: Record<string, string> = {
  // Arrays & Hashing
  "contains-duplicate": `function containsDuplicate(nums) {
  // idea: has this number been seen before?
}
`,
  "valid-anagram": `function isAnagram(s, t) {
  // idea: same letters, same counts
}
`,
  "two-sum": `function twoSum(nums, target) {
  // idea: value -> index map, look up the complement
}
`,
  "group-anagrams": `function groupAnagrams(strs) {
  // idea: a canonical key per anagram family
  // (any group order / any order inside a group is accepted)
}
`,
  "top-k-frequent-elements": `function topKFrequent(nums, k) {
  // idea: count first, then pick the k most frequent
  // (any order among the k is accepted)
}
`,
  "encode-and-decode-strings": `// Design both halves of the wire format.
function encode(strs) {
  // strings -> one string (must be reversible, commas alone are not enough)
}

function decode(s) {
  // one string -> the original strings
}
`,
  "product-of-array-except-self": `function productExceptSelf(nums) {
  // idea: prefix products one way, suffix products the other — no division
}
`,
  "valid-sudoku": `function isValidSudoku(board) {
  // idea: one seen-set per row, per column, per 3x3 box
  // board is 9x9, cells are digits or "."
}
`,
  "longest-consecutive-sequence": `function longestConsecutive(nums) {
  // idea: only start counting from numbers that begin a run
}
`,

  // Two Pointers
  "valid-palindrome": `function isPalindrome(s) {
  // idea: two pointers closing in, skipping non-alphanumerics
}
`,
  "two-sum-ii-input-array-is-sorted": `function twoSum(numbers, target) {
  // idea: the array is sorted — squeeze from both ends
  // return [index1, index2] with 1-based indices
}
`,
  "3sum": `function threeSum(nums) {
  // idea: sort, fix one number, two-pointer the rest
  // (any group order / any order inside a group is accepted)
}
`,
  "container-with-most-water": `function maxArea(heights) {
  // idea: widest container first; move the shorter wall inward
}
`,
  "trapping-rain-water": `function trap(heights) {
  // idea: water above i = min(maxLeft, maxRight) - height[i]
}
`,

  // Sliding Window
  "best-time-to-buy-and-sell-stock": `function maxProfit(prices) {
  // idea: track the cheapest buy so far while scanning
}
`,
  "longest-substring-without-repeating-characters": `function lengthOfLongestSubstring(s) {
  // idea: window grows right, shrinks from left on a repeat
}
`,
  "longest-repeating-character-replacement": `function characterReplacement(s, k) {
  // idea: window is valid while (window - max frequency) <= k
}
`,
  "permutation-in-string": `function checkInclusion(s1, s2) {
  // idea: fixed-size window over s2, compare letter counts
}
`,
  "minimum-window-substring": `function minWindow(s, t) {
  // idea: grow right until covered, then shrink left while still covered
}
`,
  "sliding-window-maximum": `function maxSlidingWindow(nums, k) {
  // idea: a monotonic decreasing deque of indices
}
`,

  // Stack
  "valid-parentheses": `function isValid(s) {
  // idea: push openers, match every closer against the stack top
}
`,
  "min-stack": `// A stack that answers getMin in O(1).
class MinStack {
  constructor() {
  }

  push(val) {
  }

  pop() {
  }

  top() {
  }

  getMin() {
  }
}
`,
  "evaluate-reverse-polish-notation": `function evalRPN(tokens) {
  // idea: operands on a stack; an operator pops two and pushes one
  // division truncates toward zero
}
`,
  "daily-temperatures": `function dailyTemperatures(temperatures) {
  // idea: a monotonic decreasing stack of indices waiting for a warmer day
}
`,
  "car-fleet": `function carFleet(target, position, speed) {
  // idea: sort by position; a car becomes its own fleet when its
  // arrival time exceeds the car ahead
}
`,
  "largest-rectangle-in-histogram": `function largestRectangleArea(heights) {
  // idea: monotonic increasing stack; a bar's rectangle dies when
  // a shorter bar appears
}
`,

  // Binary Search
  "binary-search": `function search(nums, target) {
  // idea: classic two-pointer binary search, return -1 when absent
}
`,
  "search-a-2d-matrix": `function searchMatrix(matrix, target) {
  // idea: the row-major flattening is sorted — binary search it
}
`,
  "koko-eating-bananas": `function minEatingSpeed(piles, h) {
  // idea: binary search the answer space (speed 1..max pile)
}
`,
  "find-minimum-in-rotated-sorted-array": `function findMin(nums) {
  // idea: compare mid against the right end to find the pivot side
}
`,
  "search-in-rotated-sorted-array": `function search(nums, target) {
  // idea: one half is always sorted — decide which, then range-check
}
`,
  "time-based-key-value-store": `// A map that remembers history and answers with the latest value
// at or before a timestamp.
class TimeMap {
  constructor() {
  }

  set(key, value, timestamp) {
  }

  get(key, timestamp) {
    // return "" when no entry exists at or before the timestamp
  }
}
`,
  "median-of-two-sorted-arrays": `function findMedianSortedArrays(nums1, nums2) {
  // idea: binary search the partition of the shorter array
}
`,

  // Linked List
  "reverse-linked-list": `function reverseList(head) {
  // idea: walk the list, flip each next pointer backwards
  // return the new head
}
`,
  "merge-two-sorted-lists": `function mergeTwoLists(list1, list2) {
  // idea: a dummy head; splice whichever front is smaller
  // return the merged head
}
`,
  "linked-list-cycle": `function hasCycle(head) {
  // idea: slow and fast pointers — a cycle means they meet
  // return true or false
}
`,
  "remove-nth-node-from-end-of-list": `function removeNthFromEnd(head, n) {
  // idea: a lead pointer walks n first; return the (possibly new) head
}
`,
  "reorder-list": `function reorderList(head) {
  // idea: find the middle, reverse the back half, interleave
  // mutate in place; return value is ignored
}
`,
};

/**
 * Starter code for a problem's JS editor: the curated stub when we have one,
 * else a generic signature-shaped fallback derived from the verify spec
 * (covers problems authored before this file — nothing should hit it for
 * the 38 wired algorithms).
 */
export function jsStarter(slug: string, verify: { fn: string; wrap: string }): string {
  const hit = STARTERS[slug];
  if (hit) return hit;
  if (verify.wrap === "class") {
    return `class ${verify.fn} {
  constructor() {
  }
}
`;
  }
  return `function ${verify.fn}() {
  // your solution
}
`;
}
