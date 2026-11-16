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
# ---- blended topics (research/ask-topics/*.txt) ----
RESEARCH = {
    "Brooks 2014": "https://doi.org/10.1037/a0035325",
    "Lieberman et al. 2007": "https://doi.org/10.1111/j.1467-9280.2007.01916.x",
    "Boothby et al. 2018": "https://doi.org/10.1177/0956797618783714",
    "Huang et al. 2017": "https://doi.org/10.1037/pspi0000097",
    "Mastroianni et al. 2021": "https://doi.org/10.1073/pnas.2011809118",
    "Kardas, Kumar & Epley 2022": "https://doi.org/10.1037/pspa0000281",
    "Fiske, Cuddy & Glick 2007": "https://doi.org/10.1016/j.tics.2006.11.005",
    "Chartrand & Bargh 1999": "https://doi.org/10.1037/0022-3514.76.6.893",
    "Bond & DePaulo 2006": "https://doi.org/10.1207/s15327957pspr1003_2",
    "Ranehill et al. 2015": "https://doi.org/10.1177/0956797614553946",
    "Schroeder & Epley 2015": "https://doi.org/10.1177/0956797615572906",
    "Yeager et al. 2014": "https://doi.org/10.1037/a0033906",
    "Liu et al. 2023": "https://doi.org/10.1037/pspi0000402",
    "Kumar & Epley 2018": "https://doi.org/10.1177/0956797618772506",
    "Gable et al. 2004": "https://doi.org/10.1037/0022-3514.87.2.228",
}
ALIAS = {"Fiske et al. 2007": "Fiske, Cuddy & Glick 2007"}
TSRC = os.path.join(HERE, "ask-topics")
topics = []
byid = {e["i"]: e for e in entries}
def words(x): return len(re.findall(r"[A-Za-z0-9'’]+", x))
for fn in sorted(glob.glob(os.path.join(TSRC, "*.txt"))):
    cur = None
    for ln in open(fn, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip(): continue
        if ln.startswith("## "):
            i, c, t = [x.strip() for x in ln[3:].split("|", 2)]
            cur = {"i": i, "c": c, "t": t, "q": [], "n": [], "b": "", "say": "", "tip": "", "short": "", "f": [], "res": []}
            topics.append(cur); continue
        m = re.match(r"^(\w+):\s?(.*)$", ln)
        if not m or cur is None:
            errs.append(f"{fn}: cannot parse: {ln[:60]}"); continue
        k, v = m.group(1), m.group(2).strip()
        if k == "q": cur["q"] = [x.strip() for x in v.split(";") if x.strip()]
        elif k == "n": cur["n"] = [x.strip() for x in v.split(",") if x.strip()]
        elif k in ("b", "say", "tip", "short"): cur[k] = v
        elif k == "f": cur["f"] = [x.strip() for x in v.split("||") if x.strip()]
        elif k == "src":
            # only outside research is kept from topic files; book refs come from the linked notes
            for x in re.split(r"\s*(?:\|\||·)\s*", v):
                x = re.sub(r",.*$", "", x.strip())
                x = ALIAS.get(x, x)
                if x in RESEARCH: cur["res"].append(x)
        else: errs.append(f"{cur['i']}: unknown key {k}")
tids = [t["i"] for t in topics]
if len(set(tids)) != len(tids): errs.append("duplicate topic ids")
for t in topics:
    for k in ("b", "say", "tip", "short"):
        if not t[k]: errs.append(f"{t['i']}: missing {k}")
    wc = words(t["b"]) + words(t["say"]) + words(t["tip"])
    if not (80 <= wc <= 180): errs.append(f"{t['i']}: {wc} words (want 80-180)")
    if len(t["f"]) < 2: errs.append(f"{t['i']}: needs follow-ups")
    if not t["q"]: errs.append(f"{t['i']}: no aliases")
    for n in t["n"]:
        if n not in byid: errs.append(f"{t['i']}: missing note {n}")
    # sources: linked notes' refs (deduped) + research
    src, seen_l = [], set()
    for r in t["res"]:
        src.append({"u": RESEARCH[r], "l": r}); seen_l.add(r)
    for n in t["n"]:
        for s_ in byid.get(n, {}).get("src", []):
            key = s_.get("u") or s_["l"]
            if key in seen_l: continue
            seen_l.add(key); src.append(s_)
    t["src"] = src[:7]
    who = []
    for n in t["n"]:
        for w in byid.get(n, {}).get("w", []):
            if w in ("vve", "vg", "ch") and w not in who: who.append(w)
    t["w"] = who
    t["wc"] = wc
    del t["res"]
if errs:
    print("\n".join(errs)); sys.exit(1)
for t in topics: del t["wc"]
data = {"v": 2, "n": len(entries), "entries": entries, "glossary": g2, "topics": topics}
with open(OUT, "w", encoding="utf-8") as f:
    f.write("/* Read Anyone · Ask knowledge base. Hand-written study notes in our own words on Vanessa Van Edwards, Vinh Giang and Chase Hughes, with source refs. Built by research/build_ask_kb.py from research/ask-kb/*.txt. */\n")
    f.write("window.ASK_KB=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
from collections import Counter
cnt = Counter()
for e in entries:
    for w in e["w"]: cnt[w] += 1
print("topics", len(topics), "entries", len(entries), "glossary", len(g2), dict(cnt), "leftout", sum(e["c"] == "leftout" for e in entries), "bytes", os.path.getsize(OUT))
