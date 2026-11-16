/* Read Anyone · Ask: a chat over local study notes on Van Edwards, Hughes and Giang.
   No server, no AI API, no web results. Also owns the Generate / Ask switch. */
(function () {
  "use strict";
  const $ = function (s) { return document.querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  const KEY = "read-anyone-ask-v2";
  const norm = function (s) { return String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim(); };
  const FKEY = "read-anyone-ask-author";
  const WHO = { vve: "Van Edwards", vg: "Giang", ch: "Hughes", all: "All three", ra: "Read Anyone" };
  const FILTERS = [["all", "All"], ["vve", "Van Edwards"], ["ch", "Hughes"], ["vg", "Giang"]];
  const CAT = { openers: "Openers", smalltalk: "Small talk", listening: "Listening", body: "Body language", voice: "Voice", story: "Stories", deeper: "Going deeper", warmth: "Warmth", exits: "Endings", names: "Names", tough: "Hard moments", confidence: "Confidence", groups: "Groups", practice: "Practice", ideas: "Big idea", leftout: "Left out", about: "About", likeability: "Likeability", speaking: "Speaking", work: "Work", endings: "Endings", social: "Social life", growth: "Getting better", ethics: "Ethics", general: "General" };
  const STARTERS = {
    all: ["I get nervous meeting people", "What do I say?", "They seem bored", "How do I be more likeable?", "How do I end a conversation?", "Someone is being rude to me"],
    vve: ["Name Game", "What are the nine power questions?", "What is the triple nod?", "How do I end a conversation?", "What is Thread Theory?"],
    ch: ["What is the small-talk formula?", "What is FORK?", "What are the six needs?", "What is composure?", "What does Read Anyone leave out?"],
    vg: ["How does Vinh use pauses?", "What is the Power Sphere?", "High, Low, Buffalo", "What is Match, Mirror and Lead?", "What are the listening traps?"]
  };
  let ready = false, loading = null, state = { author: "all" }, hist = [];
  try { const a = localStorage.getItem(FKEY); if (a && WHO[a]) state.author = a; } catch (e) { /* private mode */ }

  function load() {
    if (ready) return Promise.resolve();
    if (loading) return loading;
    const add = function (src) { return new Promise(function (res, rej) { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); };
    loading = add("ask/kb.js").then(function () { return add("ask/engine.js"); }).then(function () {
      window.ASK_ENGINE.build(window.ASK_KB); ready = true; restore();
    }).catch(function (e) {
      loading = null;
      log().innerHTML = '<div class="msg bot"><div class="bub"><p>The notes didn’t load. Check your connection and tap Ask again.</p></div></div>';
      if (window.console) console.warn(e);
    });
    return loading;
  }
  const log = function () { return $("#askLog"); };
  const E = function (id) { return window.ASK_ENGINE ? window.ASK_ENGINE.byId(id) : null; };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-60))); } catch (e) { /* private mode */ } }
  function restore() {
    try { hist = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { hist = []; }
    log().innerHTML = ""; welcome();
    hist.forEach(function (h) { if (h.r === "u") drawUser(h.q, false); else drawBot(h.res, false); });
    const lb = hist.slice().reverse().find(function (h) { return h.r === "b" && h.res; });
    if (lb) setLast(lb.res);
    $("#askClear").hidden = !hist.length;
    if (hist.length) scrollEnd(false);
  }
  function welcome() {
    const d = document.createElement("div"); d.className = "msg bot welcome";
    const st = STARTERS[state.author] || STARTERS.all;
    d.innerHTML = '<div class="bub"><p>' + (state.author === "all" ? "Ask me anything about talking to people — vague is fine. I’ll blend Vanessa, Chase and Vinh into one answer you can use straight away." : "Ask anything, and I’ll answer from " + esc(WHO[state.author]) + "’s work only.") + '</p><div class="chips">' +
      st.map(function (s) { return '<button type="button" class="chip fu" data-q="' + esc(s) + '">' + esc(s) + "</button>"; }).join("") + "</div></div>";
    log().appendChild(d);
  }
  function scrollEnd(smooth) { requestAnimationFrame(function () { const l = log().lastElementChild; if (l) l.scrollIntoView({ behavior: smooth === false ? "auto" : "smooth", block: "end" }); }); }
  function drawUser(q, anim) { const d = document.createElement("div"); d.className = "msg user" + (anim === false ? "" : " in"); d.innerHTML = '<div class="bub">' + esc(q) + "</div>"; log().appendChild(d); }
  function whoTags(e) {
    let w = e.w.slice();
    if (w.indexOf("all") >= 0) w = ["all"];
    return w.map(function (x) { return '<span class="tag who who-' + esc(x) + '">' + esc(WHO[x] || x) + "</span>"; }).join("");
  }
  function srcLine(e) {
    const parts = (e.src || []).map(function (s) {
      if (s.u) {
        const lab = s.l || s.u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
        return '<a href="' + esc(s.u) + '" target="_blank" rel="noopener noreferrer">' + esc(lab) + "</a>";
      }
      return "<span>" + esc(s.l) + "</span>";
    });
    return parts.length ? '<details class="srcs"><summary>Where this comes from</summary><p class="src">' + parts.join(" · ") + "</p></details>" : "";
  }
  function chip(label, attr, val, cls) { return '<button type="button" class="chip fu' + (cls ? " " + cls : "") + '" ' + attr + '="' + esc(val) + '">' + esc(label) + "</button>"; }
  function followChips(e, extra) {
    const c = [];
    (e.f || []).slice(0, 2).forEach(function (f) { c.push(chip(f, "data-q", f)); });
    const SW = { the: 1, a: 1, an: 1, what: 1, is: 1, are: 1, do: 1, does: 1, how: 1, i: 1, why: 1, of: 1, and: 1, to: 1, say: 1, about: 1, vinh: 1, vanessa: 1, hughes: 1, chase: 1 };
    const words = function (t) { return norm(t).split(" ").filter(function (w) { return w && !SW[w]; }).map(function (w) { return w.replace(/s$/, ""); }); };
    const fw = (e.f || []).slice(0, 2).map(words);
    (e.r || []).map(E).filter(Boolean).filter(function (x) {
      const t = words(x.t.replace(/\(.*?\)/g, ""));
      return !fw.some(function (f) { const hit = t.filter(function (w) { return f.indexOf(w) >= 0; }).length; return t.length && hit / t.length >= 0.5; });
    }).slice(0, 2).forEach(function (x) { c.push(chip(x.t.replace(/ \(left out\)$/, ""), "data-id", x.i, "rel")); });
    if (extra) c.push.apply(c, extra);
    return c.length ? '<div class="fus"><p class="lbl">Ask next</p><div class="chips">' + c.join("") + "</div></div>" : "";
  }
  function deeper(e) {
    const p = [];
    if (e.d) p.push("<p>" + esc(e.d) + "</p>");
    if (e.e && e.e.length) p.push('<ul class="ex">' + e.e.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>");
    return p.length ? '<details class="deep"><summary>Go deeper</summary>' + p.join("") + "</details>" : "";
  }
  function head(e) {
    return '<div class="meta">' + whoTags(e) + '<span class="tag' + (e.c === "leftout" ? " out" : "") + '">' + esc(CAT[e.c] || e.c) + "</span></div>" +
      '<p class="a-title">' + esc(e.t) + "</p>";
  }
  function tryLine(e) { return e.u ? '<p class="tip"><b>' + (e.c === "leftout" && e.i !== "lo-overview" ? "Honest alternative. " : "Try this. ") + "</b>" + esc(e.u) + "</p>" : ""; }
  const TP = function (id) { return window.ASK_ENGINE ? window.ASK_ENGINE.topic(id) : null; };
  const unq = function (x) { return String(x || "").replace(/^[“"]|[”"]$/g, ""); };
  function tWho(t) { return (t.w || []).map(function (x) { return '<span class="tag who who-' + esc(x) + '">' + esc(WHO[x] || x) + "</span>"; }).join(""); }
  function tHead(t) { return '<div class="meta">' + tWho(t) + '<span class="tag">' + esc(CAT[t.c] || t.c) + '</span></div><p class="a-title">' + esc(t.t) + "</p>"; }
  function sayBlock(t) {
    const m = /^(“[^”]*”|"[^"]*")\s*(.*)$/.exec(t.say); const line = m ? unq(m[1]) : unq(t.say); const after = m && m[2] ? ' <span class="mute">' + esc(m[2]) + "</span>" : "";
    return '<div class="say"><p class="lbl">Try saying</p><p class="say-line">“' + esc(line) + "”" + after + "</p></div>";
  }
  function tChips(t, extra) {
    const c = [], seen = {}; seen[norm(t.t)] = 1;
    (extra || []).forEach(function (x) { if (x && !seen[norm(x.t)]) { seen[norm(x.t)] = 1; c.push(chip(x.t, "data-tid", x.i, "rel")); } });
    (t.f || []).forEach(function (f) { if (!seen[norm(f)] && c.length < 4) { seen[norm(f)] = 1; c.push(chip(f, "data-q", f)); } });
    return c.length ? '<div class="fus"><p class="lbl">Ask next</p><div class="chips">' + c.join("") + "</div></div>" : "";
  }
  function leadNote(e) {
    if (!e) return "";
    const nm = e.t.replace(/ \(left out\)$/, "").replace(/[?.!]$/, "");
    let h = '<p class="lead">' + (e.c === "about" ? "" : "<b>" + esc(nm) + ".</b> ") + esc(e.s) + "</p>";
    if (e.c === "leftout" && e.u && e.i !== "lo-overview") h += '<p class="tip"><b>The honest alternative. </b>' + esc(e.u.replace(/^(the )?honest alternative:\s*/i, "")) + "</p>";
    return h;
  }
  function topicBody(res) {
    const t = TP(res.main); if (!t) return "<p>That answer is no longer available.</p>";
    const lead = res.lead && E(res.lead);
    if (res.kind === "tfollow") {
      let h = tHead(t);
      const notes = t.n.map(E).filter(Boolean);
      if (res.mode === "example" || res.mode === "use") {
        const ex = []; notes.forEach(function (e) { (e.e || []).forEach(function (x) { if (ex.length < 3) ex.push(x); }); });
        h += sayBlock(t) + (ex.length ? '<p class="lbl">More lines you could use</p><ul class="ex">' + ex.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") + '<p class="tip"><b>How to say it. </b>' + esc(t.tip) + "</p>";
      } else if (res.mode === "related") {
        const rel = {}; t.n.forEach(function (n) { window.ASK_ENGINE.topics().forEach(function (o) { if (o.i !== t.i && o.n.indexOf(n) >= 0) rel[o.i] = (rel[o.i] || 0) + 1; }); });
        const ids = Object.keys(rel).sort(function (a, b) { return rel[b] - rel[a]; }).slice(0, 5);
        return h + "<p>Here’s what connects to this:</p><div class=\"chips\">" + ids.map(function (i) { const o = TP(i); return chip(o.t, "data-tid", o.i, "rel"); }).join("") + "</div>";
      } else {
        const pick = [], seenW = {};
        notes.forEach(function (e) { const w = e.w[0]; if (pick.length < 3 && !seenW[w] && e.c !== "leftout") { seenW[w] = 1; pick.push(e); } });
        h += "<p>A bit more on how each of them approaches it:</p>" + pick.map(function (e) { return "<p>" + esc(e.s) + "</p>"; }).join("") + (pick[0] && pick[0].u ? '<p class="tip"><b>Try this. </b>' + esc(pick[0].u) + "</p>" : "");
      }
      return h + srcLine(t) + tChips(t);
    }
    let h = tHead(t);
    if (res.general) h += '<p class="mute">I don’t have something specific on that, so here’s the general approach that works in most conversations.</p>';
    h += leadNote(lead);
    h += "<p>" + esc(t.b) + "</p>" + sayBlock(t) + '<p class="tip"><b>How to say it. </b>' + esc(t.tip) + "</p>";
    const br = res.bridge && TP(res.bridge.t);
    if (br) h += '<p class="bridge"><b>And since you mentioned ' + esc(res.bridge.words || br.t.replace(/\?$/, "").toLowerCase()) + ":</b> " + esc(br.short) + "</p>";
    const alts = (res.alts || []).map(TP).filter(Boolean);
    if (br) alts.unshift(br);
    return h + srcLine(t) + tChips(t, alts);
  }
  function offBody() {
    return "<p>That’s outside what Vanessa, Chase and Vinh teach, so I won’t guess. If it’s about a conversation, tell me about the person and the moment — like “my boss keeps interrupting me” or “I go blank at parties”.</p><div class=\"chips\">" +
      STARTERS.all.slice(0, 4).map(function (s) { return chip(s, "data-q", s); }).join("") + "</div>";
  }
  function body(res) {
    if (res.kind === "off") return offBody();
    if (res.kind === "topic" || res.kind === "tfollow") return topicBody(res);
    if (res.kind === "unsure") {
      const alts = (res.alts || []).map(E).filter(Boolean);
      const who = state.author && state.author !== "all" ? WHO[state.author] : null;
      const els = res.elsewhere && E(res.elsewhere);
      let h = "<p>" + (who ? "I don’t have that from " + esc(who) + "’s work." : "That isn’t covered in what I have from Van Edwards, Hughes or Giang, so I won’t guess.") + "</p>";
      if (els) h += '<p class="lbl">Covered by ' + esc(els.w.map(function (x) { return WHO[x]; }).join(" and ")) + "</p><div class=\"chips\">" + chip(els.t, "data-id", els.i, "rel") + "</div>";
      if (alts.length) h += '<p class="lbl">Closest topics</p><div class="chips">' + alts.map(function (x) { return chip(x.t.replace(/ \(left out\)$/, ""), "data-id", x.i, "rel"); }).join("") + "</div>";
      h += '<p class="tip">Try a technique name like “Name Game”, a word like “pause”, or a moment like “how do I end a conversation”.</p>';
      return h;
    }
    const e = E(res.main); if (!e) return "<p>That note is no longer available.</p>";
    if (res.kind === "related") {
      const alts = (res.alts || []).map(E).filter(Boolean);
      return head(e) + "<p>Topics connected to this:</p><div class=\"chips\">" + alts.map(function (x) { return chip(x.t, "data-id", x.i, "rel"); }).join("") + "</div>";
    }
    if (res.kind === "follow") {
      let t;
      if (res.mode === "example") t = e.e && e.e.length ? '<ul class="ex">' + e.e.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : '<p class="mute">There isn’t a set example for this one, but here’s how to use it.</p>' + tryLine(e);
      else if (res.mode === "use") t = tryLine(e) || "<p>" + esc(e.s) + "</p>";
      else t = "<p>" + esc(e.d || e.s) + "</p>" + (e.e && e.e.length && e.d ? '<ul class="ex">' + e.e.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") + tryLine(e);
      return head(e) + t + srcLine(e) + followChips(e);
    }
    const alt = (res.alts || []).map(E).filter(function (x) { return x && x.i !== e.i && (e.r || []).indexOf(x.i) < 0; }).slice(0, 1)
      .map(function (x) { return chip(x.t.replace(/ \(left out\)$/, ""), "data-id", x.i, "rel"); });
    const els = res.elsewhere && E(res.elsewhere);
    const elsH = els ? '<p class="lbl">' + esc(els.w.map(function (x) { return WHO[x]; }).join(" and ")) + " covers this directly</p><div class=\"chips\">" + chip(els.t, "data-id", els.i, "rel") + "</div>" : "";
    const via = res.via && TP(res.via);
    return head(e) + (via ? '<p class="mute">' + esc(WHO[state.author] || "") + "’s take on “" + esc(via.t.replace(/\?$/, "")) + "”:</p>" : "") + (res.conf === "low" ? '<p class="mute">Closest match I have from ' + esc(state.author && state.author !== "all" ? WHO[state.author] : "their work") + ":</p>" : "") + "<p>" + esc(e.s) + "</p>" + tryLine(e) + deeper(e) + srcLine(e) + elsH + followChips(e, alt);
  }
  function drawBot(res, anim) {
    const d = document.createElement("div"); d.className = "msg bot" + (anim === false ? "" : " in");
    d.innerHTML = '<div class="bub">' + body(res) + "</div>"; log().appendChild(d); return d;
  }
  function ask(q, id, tid) {
    q = (q || "").trim(); if (!q && !id && !tid) return;
    if (!ready) { load().then(function () { if (ready) ask(q, id, tid); }); return; }
    let res;
    const AE = window.ASK_ENGINE;
    if (tid) {
      const t = TP(tid); if (!t) return;
      q = q || t.t; res = { kind: "topic", main: t.i };
    } else if (id) {
      const e = E(id); if (!e) return;
      q = q || e.t.replace(/ \(left out\)$/, "");
      const tp = state.author === "all" ? AE.topicFor(e.i, AE.scoreTopics(q).list) : null;
      res = tp ? { kind: "topic", lead: e.i, main: tp.i } : { kind: "answer", main: e.i, alts: [] };
    } else if (state.author === "all") {
      const r = AE.answerAll(q, state);
      res = { kind: r.kind, mode: r.mode, main: r.main && r.main.i, lead: r.lead && r.lead.i, general: !!r.general, alts: (r.alts || []).map(function (x) { return x.i; }), bridge: r.bridge ? { t: r.bridge.t.i, words: r.bridge.words } : null };
      if (r.kind === "term") res.kind = "topic";
    } else {
      const r = AE.answerTeacher(q, state);
      res = { kind: r.kind, mode: r.mode, conf: r.conf, main: r.main && r.main.i, alts: (r.alts || []).map(function (x) { return x.i; }), elsewhere: r.elsewhere && r.elsewhere.i, via: r.via && r.via.i };
    }
    drawUser(q); hist.push({ r: "u", q: q });
    const typing = document.createElement("div"); typing.className = "msg bot typing"; typing.innerHTML = '<div class="bub"><i></i><i></i><i></i></div>'; log().appendChild(typing); scrollEnd();
    setTimeout(function () {
      typing.remove(); const el = drawBot(res); hist.push({ r: "b", res: res }); save();
      $("#askClear").hidden = false;
      setLast(res);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 240);
  }
  function setLast(res) {
    const isT = res.kind === "topic" || res.kind === "tfollow";
    state.lastT = isT ? res.main : null;
    state.last = !isT && res.main ? res.main : null;
    if (state.last) state.recent = [state.last].concat(state.recent || []).slice(0, 3);
  }
  function renderFilter() {
    $("#askFilter").innerHTML = FILTERS.map(function (f) {
      return '<button type="button" class="chip' + (state.author === f[0] ? " is-on" : "") + '" data-author="' + f[0] + '" aria-pressed="' + (state.author === f[0]) + '">' + esc(f[1]) + "</button>";
    }).join("");
  }
  function gloss() {
    if (!ready) { load().then(function () { if (ready) gloss(); }); return; }
    const all = window.ASK_KB.glossary.slice().sort(function (a, b) { return a[0].localeCompare(b[0]); });
    const g = all.filter(function (x) { const e = E(x[1]); return e && (state.author === "all" || e.w.indexOf(state.author) >= 0 || e.w.indexOf("all") >= 0 || e.w.indexOf("ra") >= 0); });
    const dlg = $("#askDlg"), b = $("#askDlgBody");
    b.innerHTML = "<h2>Glossary</h2><p class=\"note\">" + g.length + " terms" + (state.author !== "all" ? " from " + esc(WHO[state.author]) : "") + ". Tap one to ask about it.</p><div class=\"chips gloss\">" +
      g.map(function (x) { return '<button type="button" class="chip" data-gid="' + esc(x[1]) + '" data-gt="' + esc(x[0]) + '">' + esc(x[0]) + "</button>"; }).join("") + "</div>";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function initMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const m = $("#askMic");
    if (!SR) { m.hidden = true; return; }
    let rec = null;
    m.addEventListener("click", function () {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = "en-GB"; rec.interimResults = true; rec.maxAlternatives = 1;
      m.classList.add("on"); const inp = $("#askInput");
      rec.onresult = function (ev) {
        let t = ""; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
        inp.value = t;
        if (ev.results[ev.results.length - 1].isFinal) { rec.stop(); ask(t); inp.value = ""; }
      };
      rec.onend = function () { m.classList.remove("on"); rec = null; };
      rec.onerror = function () { m.classList.remove("on"); rec = null; };
      try { rec.start(); } catch (e) { m.classList.remove("on"); rec = null; }
    });
  }
  // Generate / Ask switch -------------------------------------------------
  function setMode(mode, push) {
    const isAsk = mode === "ask";
    $("#app").hidden = isAsk; $("#ask").hidden = !isAsk;
    document.querySelectorAll(".seg button").forEach(function (b) { const on = b.getAttribute("data-mode") === mode; b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    document.body.classList.toggle("asking", isAsk);
    if (push) {
      if (isAsk && location.hash !== "#ask") history.replaceState(null, "", "#ask");
      if (!isAsk && location.hash === "#ask") history.replaceState(null, "", location.pathname + location.search);
    }
    if (isAsk) load();
    window.scrollTo(0, 0);
  }
  function init() {
    if (!$("#ask")) return;
    document.querySelectorAll(".seg button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode"), true); }); });
    window.addEventListener("hashchange", function () { setMode(location.hash === "#ask" ? "ask" : "gen", false); });
    renderFilter();
    $("#askFilter").addEventListener("click", function (ev) {
      const t = ev.target.closest("[data-author]"); if (!t) return;
      state.author = t.getAttribute("data-author"); try { localStorage.setItem(FKEY, state.author); } catch (e) { /* private */ }
      renderFilter();
      if (ready && !hist.length) { log().innerHTML = ""; welcome(); }
    });
    $("#askBar").addEventListener("submit", function (ev) { ev.preventDefault(); const i = $("#askInput"); const v = i.value; i.value = ""; ask(v); });
    $("#ask").addEventListener("click", function (ev) {
      const t = ev.target.closest("button"); if (!t) return;
      if (t.dataset.q) ask(t.dataset.q);
      else if (t.dataset.tid) ask("", null, t.dataset.tid);
      else if (t.dataset.id) ask("", t.dataset.id);
      else if (t.dataset.gid) { $("#askDlg").close ? $("#askDlg").close() : $("#askDlg").removeAttribute("open"); ask("What is " + t.dataset.gt + "?", t.dataset.gid); }
    });
    $("#askGloss").addEventListener("click", gloss);
    $("#askDlgClose").addEventListener("click", function () { const d = $("#askDlg"); if (d.close) d.close(); else d.removeAttribute("open"); });
    $("#askClear").addEventListener("click", function () {
      if (!hist.length || !confirm("Clear this chat? Your saved lines are not affected.")) return;
      hist = []; state.last = null; state.lastT = null; state.recent = []; try { localStorage.removeItem(KEY); } catch (e) { /* private */ }
      if (ready) restore();
    });
    initMic();
    setMode(location.hash === "#ask" ? "ask" : "gen", false);
  }
  window.ASK_UI = { ask: ask, load: load, setMode: setMode };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
