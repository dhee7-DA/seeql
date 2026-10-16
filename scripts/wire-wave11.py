#!/usr/bin/env python3
"""Wave-11 registry wiring: 24 new kits -> 208-company matrix (8 domains x 26)."""
import sys

REG = "src/lib/companies/registry.ts"

# (kitid, import name, meta line, kits line) in wave-11 domain order
META = {
    "bestbuy":    ("Best Buy",   "Big-ticket electronics retail: attach economics, price-match windows, member tiers"),
    "ikea":       ("IKEA",       "Flat-pack retail: range discipline, stock cover, the pickup funnel"),
    "zara":       ("Zara",       "Design-to-shelf in two weeks: drop clocks, sell-through speed, markdown windows"),
    "avis":       ("Avis",       "We Try Harder SQL: the reservation funnel, no-show leak and fleet-partner book"),
    "enterprise": ("Enterprise", "Neighborhood branches, corporate accounts: branch P&L, replacement billing"),
    "getaround":  ("Getaround",  "Instant-key car sharing: utilization, host earnings, no-show economics"),
    "soundcloud": ("SoundCloud", "Creator-first audio: plays-to-payout funnels, Next Pro tiers, royalty rails"),
    "threads":    ("Threads",    "Growth-loop velocity on the Instagram graph: ramp, retention, creator rollout"),
    "goodreads":  ("Goodreads",  "Reading depth by SQL: shelf funnels, challenge ladders, publisher benches"),
    "afterpay":   ("Afterpay",   "The 4-pay installment clock: approval funnel, merchant fees, split rails"),
    "paytm":      ("Paytm",      "Wallet + UPI rails at super-app scale: bill-pay, recharge, QR acquiring"),
    "venmo":      ("Venmo",      "Split-the-bill SQL: split legs, balance float, feed engagement"),
    "burgerking": ("Burger King","Franchisee economics at the flame grill: royalties, remittances, coupon traffic"),
    "chickfila":  ("Chick-fil-A","Drive-thru density: six-day weeks, sixteen SKUs, per-unit revenue"),
    "aldi":       ("ALDI",       "Hard-discount leanness: one-deep aisles, own-label concentration, basket depth"),
    "skyscanner": ("Skyscanner", "Flight metasearch: query-to-click funnels, partner share, fare-alert pulse"),
    "easyjet":    ("easyJet",    "Ancillary attach by SQL: fee bands, fare classes, the unbundled P&L"),
    "ihg":        ("IHG",        "The franchise lever: rate bands, RevPAR folds, royalty checks"),
    "sbi":        ("SBI",        "Public-sector banking at scale: branch censuses, priority-sector books, the deposit spine"),
    "axisbank":   ("Axis Bank",  "Cards and retail-lending growth, read through limit bands and the dunning book"),
    "usbank":     ("U.S. Bank",  "The regional network bank: branch markets, rails discipline, settlement coverage"),
    "intercom":   ("Intercom",   "Customer messaging SQL: resolution funnels, Fin containment, honest denominators"),
    "segment":    ("Segment",    "One source, many destinations: MTU billing and schema discipline"),
    "mailchimp":  ("Mailchimp",  "Email marketing by SQL: send funnels, contact tiers, deliverability denominators"),
}

DOMAIN_ORDER = [
    ("ecom",      ["bestbuy", "ikea", "zara"]),
    ("mobility",  ["avis", "enterprise", "getaround"]),
    ("media",     ["soundcloud", "threads", "goodreads"]),
    ("fintech",   ["afterpay", "paytm", "venmo"]),
    ("food",      ["burgerking", "chickfila", "aldi"]),
    ("travel",    ["skyscanner", "easyjet", "ihg"]),
    ("banking",   ["sbi", "axisbank", "usbank"]),
    ("saas",      ["intercom", "segment", "mailchimp"]),
]

def camel(c):
    return "".join(p for p in c.split("-"))  # ids are all lowercase single-word

src = open(REG).read()
orig = src

def sub1(text, old, new, tag):
    if text.count(old) != 1:
        print(f"ANCHOR FAIL ({tag}): count={text.count(old)} for {old[:80]!r}")
        sys.exit(1)
    return text.replace(old, new)

# 1. imports — after the last wave-10 import
anchor_import = 'import { retoolKit } from "./kits/retool";'
lines = [f'import {camel(c).capitalize() if False else camel(c) + "Kit"} }} from' for c in []]
imp = anchor_import + "\n// wave-11 (24 kits, 8 domains x 3)"
for _dom, ids in DOMAIN_ORDER:
    for c in ids:
        imp += f'\nimport {{{camel(c)}Kit }} from "./kits/{c}";'.replace("Kit }", "Kit}")
src = sub1(src, anchor_import, imp, "imports")

# 2. COMPANY_META — after retool meta entry (last wave-10 meta), before closing };
retool_meta = '  retool: { id: "retool", name: "Retool", tagline: "Internal tools in hours: apps on live data, seat expansion, governance" },'
meta_block = retool_meta + "\n  // wave-11"
for _dom, ids in DOMAIN_ORDER:
    for c in ids:
        name, tag = META[c]
        meta_block += f'\n  {c}: {{ id: "{c}", name: "{name}", tagline: "{tag}" }},'
src = sub1(src, retool_meta, meta_block, "COMPANY_META")

# 3. domain arrays — append 3 ids each
for dom, ids in DOMAIN_ORDER:
    # find the companies: [ ... ] line that contains a known first member of that domain's roster
    first_member = {"ecom": "amazon", "mobility": "uber", "media": "netflix", "fintech": "stripe",
                    "food": "doordash", "travel": "airbnb", "banking": "goldman", "saas": "salesforce"}[dom]
    # locate the array line by its opening and the domain id above it
    idx = src.find(f'id: "{dom}"')
    if idx < 0:
        print(f"domain {dom} not found"); sys.exit(1)
    arr_start = src.find("companies: [", idx)
    arr_end = src.find("]", arr_start)
    seg = src[arr_start:arr_end]
    if seg.count(f'"{ids[0]}"') or True:
        add = ", ".join(f'"{c}"' for c in ids)
        new_seg = seg.rstrip()[:-0]  # keep as-is; insert before final ]
        # seg ends right before ]; last char is ]
        new_seg = seg[:-1].rstrip().rstrip(",")
        new_seg = new_seg + ", " + add + "]"
        src = src[:arr_start] + new_seg + src[arr_end:]
        # sanity: length grew by expected
        if len(new_seg) <= len(seg):
            print(f"array grow fail for {dom}"); sys.exit(1)

# 4. COMPANY_KITS — after retool kit entry
retool_kit = "  retool: retoolKit,"
kits_block = retool_kit + "\n  // wave-11"
for _dom, ids in DOMAIN_ORDER:
    for c in ids:
        kits_block += f"\n  {c}: {camel(c)}Kit,"
src = sub1(src, retool_kit, kits_block, "COMPANY_KITS")

# 5. header comment
old_hdr = """// Company Interview Universe — the registry. 8 domains × 23 companies =
// the 184-company matrix (40 flagship + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10)."""
new_hdr = """// Company Interview Universe — the registry. 8 domains × 26 companies =
// the 208-company matrix (40 flagship + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10 + 24 wave-11)."""
src = sub1(src, old_hdr, new_hdr, "header")

# 6. COMPANY_KITS doc comment
old_doc = """/** Authored kits — keyed by company id. ALL 184 slots live: 40 flagship
 *  (batches A–I) + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10 additions. */"""
new_doc = """/** Authored kits — keyed by company id. ALL 208 slots live: 40 flagship
 *  (batches A–I) + 24 wave-5 + 24 wave-6 + 24 wave-7 + 24 wave-8 + 24 wave-9 + 24 wave-10 + 24 wave-11 additions. */"""
src = sub1(src, old_doc, new_doc, "kits doc")

open(REG, "w").write(src)
print("registry.ts wired OK")

# 7. types.ts header
t = "src/lib/companies/types.ts"
s = open(t).read()
old_t = """// The universe is organized as DOMAINS (industries) × 23 companies
// each (184-company matrix)."""
new_t = """// The universe is organized as DOMAINS (industries) × 26 companies
// each (208-company matrix)."""
s = sub1(s, old_t, new_t, "types header")
open(t, "w").write(s)
print("types.ts wired OK")

# 8. tools.ts copy
tp = "src/components/learn/tools.ts"
s = open(tp).read()
s = sub1(s, 'note: "8 domains × 23 companies, 184 kits"', 'note: "8 domains × 26 companies, 208 kits"', "tools note")
open(tp, "w").write(s)
print("tools.ts wired OK")

# 9. companies-view copy
cv = "src/components/learn/companies-view.tsx"
s = open(cv).read()
s = sub1(s, "Eight industries, twenty-three companies each,", "Eight industries, twenty-six companies each,", "companies-view copy")
open(cv, "w").write(s)
print("companies-view.tsx wired OK")

# 10. probe threshold
pr = "scripts/probe-companies.ts"
s = open(pr).read()
s = sub1(s, "// 1. matrix: every domain has 23 companies (184-company universe), every company has meta",
         "// 1. matrix: every domain has 26 companies (208-company universe), every company has meta", "probe comment")
s = sub1(s, "if (d.companies.length !== 23) bad(`domain ${d.id} has ${d.companies.length} companies`);",
         "if (d.companies.length !== 26) bad(`domain ${d.id} has ${d.companies.length} companies`);", "probe threshold")
open(pr, "w").write(s)
print("probe-companies.ts wired OK")
print("ALL WIRING DONE")
