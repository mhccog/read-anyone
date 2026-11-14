#!/usr/bin/env python3
"""Build ask/kb.js from research/ask-kb/*.txt (hand-written notes, our own words)."""
import json, os, re, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "ask-kb")
OUT = os.path.join(HERE, "..", "ask", "kb.js")
ORDER = ["all.txt", "vve.txt", "vg.txt", "ch.txt", "lo.txt"]
AUTH = {"vve", "vg", "ch", "all", "ra"}
entries, gloss, errs = [], [], []
for fn in ORDER:
    cur = None
    for ln in open(os.path.join(SRC, fn), encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip():
            continue
        if ln.startswith("## "):
            i, w, c, t = [x.strip() for x in ln[3:].split("|", 3)]
            w = w.split(",")
            for x in w:
                if x not in AUTH: errs.append(f"{i}: bad author {x}")
            cur = {"i": i, "w": w, "c": c, "t": t, "a": [], "s": "", "d": "", "u": "", "e": [], "r": [], "f": [], "src": []}
            entries.append(cur)
            continue
        m = re.match(r"^(\w+):\s?(.*)$", ln)
        if not m or cur is None:
            errs.append(f"{fn}: cannot parse: {ln[:60]}"); continue
        k, v = m.group(1), m.group(2).strip()
        if k == "g":
            for term in [x.strip() for x in v.split(";") if x.strip()]:
                gloss.append([term, cur["i"]])
        elif k == "a": cur["a"] = [x.strip() for x in v.split(";") if x.strip()]
        elif k in ("s", "d", "u"): cur[k] = v
        elif k in ("e", "f"): cur[k] = [x.strip() for x in v.split("||") if x.strip()]
        elif k == "r": cur["r"] = [x.strip() for x in v.split(",") if x.strip()]
        elif k == "src":
            out = []
            for x in [x.strip() for x in v.split("||") if x.strip()]:
                mm = re.match(r"^(https?://\S+)\s*(.*)$", x)
                out.append({"u": mm.group(1), "l": mm.group(2) or ""} if mm else {"l": x})
            cur["src"] = out
        else: errs.append(f"{cur['i']}: unknown key {k}")
ids = {e["i"] for e in entries}
if len(ids) != len(entries): errs.append("duplicate ids")
for e in entries:
    for r in e["r"]:
        if r not in ids: errs.append(f"{e['i']}: missing related {r}")
    for k in ("s", "u"):
        if not e[k]: errs.append(f"{e['i']}: missing {k}")
    if not e["src"]: errs.append(f"{e['i']}: no source")
    if not e["f"]: errs.append(f"{e['i']}: no follow-ups")
# glossary: unique terms
seen, g2 = set(), []
for t, i in gloss:
    if t.lower() in seen: continue
    seen.add(t.lower()); g2.append([t, i])
if errs:
    print("\n".join(errs)); sys.exit(1)
data = {"v": 1, "n": len(entries), "entries": entries, "glossary": g2}
with open(OUT, "w", encoding="utf-8") as f:
    f.write("/* Read Anyone · Ask knowledge base. Hand-written study notes in our own words on Vanessa Van Edwards, Vinh Giang and Chase Hughes, with source refs. Built by research/build_ask_kb.py from research/ask-kb/*.txt. */\n")
    f.write("window.ASK_KB=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
from collections import Counter
cnt = Counter()
for e in entries:
    for w in e["w"]: cnt[w] += 1
print("entries", len(entries), "glossary", len(g2), dict(cnt), "leftout", sum(e["c"] == "leftout" for e in entries), "bytes", os.path.getsize(OUT))
