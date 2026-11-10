/* Say it — a simple line generator */
(function () {
  "use strict";

  const KEY = "cyrus-say-it-v1";
  const OLD_KEY = "cyrus-read-anyone-v1";

  const NEEDS = [
    { id: "any", name: "Anyone" },
    { id: "significance", name: "Significance" },
    { id: "approval", name: "Approval" },
    { id: "acceptance", name: "Acceptance" },
    { id: "intelligence", name: "Intelligence" },
    { id: "pity", name: "Hardship" },
    { id: "power", name: "Power" }
  ];
  const FEELINGS = [
    { id: "heard", name: "Heard" },
    { id: "understood", name: "Understood" },
    { id: "comfortable", name: "Comfortable" },
    { id: "liked", name: "Liked" },
    { id: "trusted", name: "Trusted" },
    { id: "respected", name: "Respected" },
    { id: "reassured", name: "Reassured" },
    { id: "included", name: "Included" },
    { id: "important", name: "Important" },
    { id: "smart", name: "Smart" },
    { id: "control", name: "In control" },
    { id: "reconciled", name: "Reconciled" },
    { id: "appreciated", name: "Appreciated" },
    { id: "curious", name: "Curious" }
  ];
  const SIMPLE_FEELINGS = ["heard", "understood", "comfortable", "liked", "trusted", "respected"];
  const SITS = [
    { id: "all", name: "Any moment" },
    { id: "opener", name: "Opener" },
    { id: "rapport", name: "Rapport" },
    { id: "disagree", name: "Disagree" },
    { id: "close", name: "Close" }
  ];
  const TEACHERS = [
    { id: "mix", name: "Mix" },
    { id: "vanessa", name: "Van Edwards" },
    { id: "chase", name: "Hughes" },
    { id: "vinh", name: "Giang" }
  ];
  const TEACHER_LABEL = { vanessa: "Van Edwards", chase: "Hughes", vinh: "Vinh Giang", mix: "Mix" };
  const TIPS = {
    slownod: "A slow nod at emotional moments. Fast nods feel like hurry up.",
    tilt: "Slight head tilt while they talk — tell me more.",
    highlight: "Briefly show their feeling on your face and voice, then relax.",
    lean: "Lean in a little when they say something that matters.",
    smile: "A relaxed smile that reaches the eyes.",
    soft: "Drop your volume a touch. People often relax when you do.",
    match: "Start near their pace and volume, then lead a notch at a time. Obvious copying backfires.",
    pause: "Pause just before and after the key words.",
    slowdown: "Slow right down on the one line that matters.",
    melody: "Add melody; end the key sentence on a slightly lower note.",
    palmsup: "Open, visible palms to invite them in.",
    palmsdown: "Palms down for a firm, calm point.",
    askstop: "Ask, then stop talking. Let the silence work.",
    computer: "Hand to chin or a slight tilt — you are taking it in.",
    warm: "Keep the same warm tone through the hard part.",
    congruent: "Face matches the message: serious when serious, bright for good news."
  };
  const FEELING_TIPS = {
    heard: ["computer", "slownod", "pause"],
    understood: ["highlight", "slownod", "soft"],
    liked: ["smile", "tilt", "match"],
    trusted: ["melody", "slowdown", "pause"],
    respected: ["melody", "palmsdown", "pause"],
    comfortable: ["soft", "match", "palmsup"],
    reassured: ["warm", "slowdown", "soft"],
    included: ["palmsup", "smile", "lean"],
    important: ["pause", "lean", "melody"],
    smart: ["askstop", "lean", "computer"],
    control: ["palmsup", "askstop", "melody"],
    reconciled: ["warm", "congruent", "match"],
    appreciated: ["pause", "warm", "smile"],
    curious: ["melody", "lean", "askstop"]
  };
  const NEED_TECHNIQUE = {
    significance: "Name the impact",
    approval: "Specific validation",
    acceptance: "Make room",
    intelligence: "Ask, then listen",
    pity: "Name the weight",
    power: "Options, they decide",
    any: "Speak to this moment"
  };
  const NEED_WHY = {
    significance: "Speak to the specific impact they just pointed to, without labelling them.",
    approval: "Give clear, specific validation — what was good, and why.",
    acceptance: "Use shared language and make room for them in the we.",
    intelligence: "Ask for their expert view, and mean it. Then let them explain.",
    pity: "Confirm it has been hard, pause, then gently move on. Do not fix yet.",
    power: "Keep it short. Offer options and let them make the call.",
    any: "Match what they are offering in this moment, then ask one follow-up."
  };

  const state = {
    need: "any",
    feeling: "heard",
    sit: "all",
    teacher: "mix",
    moreFeel: false,
    phrases: [],
    loaded: false,
    error: false,
    result: null,
    seen: [],
    favs: [],
    showFavs: false,
    view: "gen",
    copied: false,
    copyTimer: 0,
    filterKey: ""
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function hashStr(s) {
    let h = 0;
    const str = String(s);
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function teacherOfKey(key) {
    const k = String(key).split("@")[0];
    if (/^(VVE|V24|V26|VVC|VIG|VTK|VX)/.test(k)) return "vanessa";
    if (/^(VG|GIG|GTK)/.test(k)) return "vinh";
    if (/^(C24|C26|CS|NCI|NM|NS)/.test(k)) return "chase";
    return "mix";
  }
  function teachersOf(p) {
    const set = {};
    (p.sources || []).forEach(function (s) { set[teacherOfKey(s)] = true; });
    const out = Object.keys(set).filter(function (k) { return k !== "mix"; });
    return out.length ? out : ["mix"];
  }
  function teacherLabel(ids) {
    const unique = ids.filter(function (id, i, a) { return a.indexOf(id) === i; });
    if (!unique.length || (unique.length === 1 && unique[0] === "mix")) return "Mix";
    return unique.map(function (id) { return TEACHER_LABEL[id] || id; }).join(" · ");
  }
  function techniqueFor(p) {
    if (p.situation === "opener") return "A better opener";
    if (p.situation === "close") return "End on purpose";
    if (p.situation === "disagree") return "Stay with them";
    return NEED_TECHNIQUE[p.need] || NEED_TECHNIQUE.any;
  }
  function whyFor(p) {
    if (p.feeling === "heard" || p.feeling === "understood") {
      return "Follow-up questions help people feel heard, and are liked more (Huang et al., 2017).";
    }
    if (p.feeling === "liked") {
      return "After a chat, people usually liked you more than you think — say something kind only if it is true.";
    }
    if (p.situation === "close") {
      return "Conversations almost never end when both people want them to. Close warmly, then go.";
    }
    if (p.situation === "disagree") {
      return "Stay on their side of the problem. “Yes, and” keeps the door open; “yes, but” shuts it.";
    }
    return NEED_WHY[p.need] || NEED_WHY.any;
  }
  function tipFor(p) {
    if (p.delivery) return p.delivery;
    const ids = FEELING_TIPS[p.feeling] || ["pause"];
    return TIPS[ids[hashStr(p.id) % ids.length]] || TIPS.pause;
  }
  function matchesTeacher(p, teacher) {
    if (teacher === "mix") return true;
    return teachersOf(p).indexOf(teacher) >= 0;
  }

  function activePhrases() {
    return (state.phrases || []).filter(function (p) { return !p.supersededBy; });
  }

  function matchList(need, feeling, sit, teacher) {
    const pool = activePhrases();
    const needId = need && need !== "any" ? need : null;
    const sitId = sit && sit !== "all" ? sit : null;
    const seen = {};
    const out = [];
    function add(fn, loose) {
      pool.forEach(function (p) {
        if (seen[p.id] || !fn(p)) return;
        seen[p.id] = true;
        out.push({ p: p, loose: loose });
      });
    }
    function withTeacher(fn, loose, requireTeacher) {
      add(function (p) {
        if (requireTeacher && !matchesTeacher(p, teacher)) return false;
        return fn(p);
      }, loose);
    }
    const wantTeacher = teacher && teacher !== "mix";
    withTeacher(function (p) { return p.feeling === feeling && (!needId || p.need === needId || p.need === "any") && (!sitId || p.situation === sitId); }, false, wantTeacher);
    if (out.length < 1 && sitId) {
      withTeacher(function (p) { return p.feeling === feeling && (!needId || p.need === needId || p.need === "any"); }, true, wantTeacher);
    }
    if (out.length < 1 && needId) {
      withTeacher(function (p) { return p.feeling === feeling && p.need === "any"; }, true, wantTeacher);
    }
    if (out.length < 1) {
      withTeacher(function (p) { return p.feeling === feeling; }, true, wantTeacher);
    }
    if (out.length < 1 && needId) {
      withTeacher(function (p) { return p.need === needId; }, true, wantTeacher);
    }
    if (out.length < 1 && wantTeacher) {
      add(function (p) { return p.feeling === feeling && (!needId || p.need === needId || p.need === "any") && (!sitId || p.situation === sitId); }, true);
    }
    if (out.length < 1) add(function () { return true; }, true);
    return out;
  }

  function currentKey() {
    return [state.need, state.feeling, state.sit, state.teacher].join("|");
  }

  function pickLine() {
    const key = currentKey();
    if (state.filterKey !== key) {
      state.seen = [];
      state.filterKey = key;
    }
    const list = matchList(state.need, state.feeling, state.sit, state.teacher);
    if (!list.length) {
      state.result = null;
      return;
    }
    let choices = list.filter(function (m) { return state.seen.indexOf(m.p.id) < 0; });
    if (!choices.length) {
      state.seen = [];
      choices = list;
    }
    const m = choices[Math.floor(Math.random() * choices.length)];
    state.seen.push(m.p.id);
    state.result = {
      p: m.p,
      loose: m.loose,
      technique: techniqueFor(m.p),
      teacher: teacherLabel(teachersOf(m.p)),
      why: whyFor(m.p),
      tip: tipFor(m.p)
    };
    state.copied = false;
    state.showFavs = false;
  }

  function loadFavs() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.favs)) return data.favs;
        if (Array.isArray(data)) return data;
      }
    } catch (e) { /* private mode */ }
    try {
      const old = JSON.parse(localStorage.getItem(OLD_KEY) || "{}");
      if (Array.isArray(old.favs)) return old.favs;
    } catch (e) { /* ignore */ }
    return [];
  }
  function saveFavs() {
    try { localStorage.setItem(KEY, JSON.stringify({ favs: state.favs })); } catch (e) { /* private mode */ }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) { /* copy optional */ }
  }
  function copyText(text) {
    function done() {
      if (state.copyTimer) clearTimeout(state.copyTimer);
      state.copied = true;
      state.copyTimer = setTimeout(function () { state.copied = false; render(); }, 1600);
      render();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function chip(label, act, val, on) {
    return '<button type="button" class="chip' + (on ? " is-on" : "") + '" data-act="' + act + '" data-val="' + esc(val) + '">' + esc(label) + "</button>";
  }
  function picker(label, chips) {
    return '<div class="picker"><span class="label">' + esc(label) + '</span><div class="picks">' + chips + "</div></div>";
  }

  function resultCard() {
    const r = state.result;
    if (!r) return '<p class="status">Nothing in the bank for this mix. Try Mix, or set the moment to Any.</p>';
    const fav = state.favs.indexOf(r.p.id) >= 0;
    return '<article class="result">' +
      '<p class="technique">' + esc(r.technique) + "</p>" +
      '<p class="line">' + esc(r.p.text) + "</p>" +
      '<div class="meta">' +
        '<span class="tag">' + esc(r.teacher) + "</span>" +
        (r.loose ? '<span class="tag">Wider match</span>' : "") +
      "</div>" +
      '<p class="why"><b>Why. </b>' + esc(r.why) + "</p>" +
      '<p class="tip"><b>How to say it. </b>' + esc(r.tip) + "</p>" +
      '<div class="actions">' +
        '<button type="button" class="btn primary" data-act="copy">' + (state.copied ? "Copied" : "Copy") + "</button>" +
        '<button type="button" class="btn" data-act="generate">Another</button>' +
        '<button type="button" class="icon-btn' + (fav ? " is-on" : "") + '" data-act="fav" aria-label="' + (fav ? "Remove from saved lines" : "Save this line") + '">' + (fav ? "★" : "☆") + "</button>" +
      "</div>" +
    "</article>";
  }

  function favsView() {
    const items = state.favs.map(function (id) {
      return (state.phrases || []).find(function (p) { return p.id === id; });
    }).filter(Boolean);
    if (!items.length) {
      return '<p class="status">No saved lines yet. Generate one, then tap the star.</p>';
    }
    return '<div class="fav-list">' + items.map(function (p) {
      return '<button type="button" class="fav-card" data-act="open-fav" data-val="' + esc(p.id) + '"><b>' + esc(p.text) + "</b><small>" + esc(teacherLabel(teachersOf(p))) + " · " + esc(techniqueFor(p)) + "</small></button>";
    }).join("") + "</div>";
  }

  function sourcesView() {
    return '<section class="sources anim">' +
      '<p class="back"><button type="button" class="btn" data-act="home">Back to the generator</button></p>' +
      "<h2>Techniques &amp; sources</h2>" +
      '<p>This is a phrase bank, not a way to type someone. The six leans — significance, approval, acceptance, intelligence, hardship and power — are listening prompts from Chase Hughes. They are a coach’s view, untested. Most people show a mix. Do not name a type out loud. Only say what you mean.</p>' +
      "<h3>What usually works</h3>" +
      "<ul>" +
        "<li>Warmth first, then competence (Fiske, Cuddy and Glick, 2007).</li>" +
        "<li>Ask follow-up questions before you tell your own story (Huang et al., 2017).</li>" +
        "<li>People often liked you more than you think (Boothby et al., 2018). Say so only if it is true.</li>" +
        "<li>End on purpose. Conversations rarely stop when both people want them to (Mastroianni et al., 2021).</li>" +
        "<li>Match their pace and volume, then lead a little. Obvious copying backfires.</li>" +
      "</ul>" +
      "<h3>The three teachers</h3>" +
      "<ul>" +
        "<li><a href=\"https://www.scienceofpeople.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Vanessa Van Edwards</a> — better openers, warmth and competence cues, follow-ups. Books: <em>Captivate</em>, <em>Cues</em>, <em>Conversation</em> (2026). The full set of nine power questions stays in the book.</li>" +
        "<li><a href=\"https://vinhgiang.com/blog/how-to-build-rapport-with-absolutely-anyone\" target=\"_blank\" rel=\"noopener noreferrer\">Vinh Giang</a> — voice, Match Mirror and Lead, “yes, and”. Book: <em>Before We Forget How to Connect</em> (2026).</li>" +
        "<li><a href=\"https://nci.university/\" target=\"_blank\" rel=\"noopener noreferrer\">Chase Hughes</a> — composure and the six needs as prompts, not a six-minute profile. That method has no published validation.</li>" +
      "</ul>" +
      "<h3>Leave out</h3>" +
      "<p>Covert influence, fake common ground, diagnosing lies from body language (people are about 54% accurate — Bond and DePaulo, 2006), and the idea that 93% of communication is non-verbal. That last one is a misreading of Mehrabian.</p>" +
      "<p>The earlier full guide is kept on the <a href=\"https://github.com/mhccog/read-anyone/tree/v1-full-guide\" target=\"_blank\" rel=\"noopener noreferrer\">v1-full-guide</a> tag in the repo.</p>" +
    "</section>";
  }

  function generatorView() {
    const feelingList = state.moreFeel
      ? FEELINGS
      : FEELINGS.filter(function (f) { return SIMPLE_FEELINGS.indexOf(f.id) >= 0; });
    const lean = picker("Lean", NEEDS.map(function (n) {
      return chip(n.name, "need", n.id, state.need === n.id);
    }).join(""));
    const vibe = picker("Vibe", feelingList.map(function (f) {
      return chip(f.name, "feeling", f.id, state.feeling === f.id);
    }).join("") + chip(state.moreFeel ? "Fewer" : "More", "more-feel", "", state.moreFeel));
    const moment = picker("Moment", SITS.map(function (s) {
      return chip(s.name, "sit", s.id, state.sit === s.id);
    }).join(""));
    const teacher = picker("Teacher", TEACHERS.map(function (t) {
      return chip(t.name, "teacher", t.id, state.teacher === t.id);
    }).join(""));

    let body;
    if (!state.loaded && !state.error) {
      body = '<p class="status">Loading the phrase bank…</p>';
    } else if (state.error) {
      body = '<p class="status">The phrase bank did not load.</p><div class="actions"><button type="button" class="btn primary" data-act="retry">Try again</button></div>';
    } else if (state.showFavs) {
      body = favsView();
    } else {
      body =
        lean + vibe + moment + teacher +
        '<button type="button" class="generate" data-act="generate"' + (state.loaded ? "" : " disabled") + ">Generate</button>" +
        (state.result ? resultCard() : '<p class="note">Listening prompts, not a label. Only say what you mean.</p>');
    }

    return '<div class="top">' +
      '<div><div class="kicker">Read Anyone</div><h1>Say it</h1></div>' +
      '<button type="button" class="saved-btn' + (state.showFavs ? " is-on" : "") + '" data-act="favs">Saved · ' + state.favs.length + "</button>" +
    "</div>" +
    '<p class="lede">Pick a lean, a vibe and a moment. Get a line you can actually say.</p>' +
    body;
  }

  function render() {
    const root = document.getElementById("app");
    const inner = state.view === "sources" ? sourcesView() : generatorView();
    root.innerHTML = '<div class="app">' + inner +
      (state.view === "gen" ? '<div class="foot"><a href="#techniques" data-act="sources">Techniques &amp; sources</a><span>Only say what you mean.</span></div>' : "") +
      "</div>";
  }

  function setViewFromHash() {
    state.view = location.hash === "#techniques" ? "sources" : "gen";
  }

  function handle(act, val) {
    if (act === "need") { state.need = val; state.showFavs = false; render(); return; }
    if (act === "feeling") { state.feeling = val; state.showFavs = false; render(); return; }
    if (act === "sit") { state.sit = val; state.showFavs = false; render(); return; }
    if (act === "teacher") { state.teacher = val; state.showFavs = false; render(); return; }
    if (act === "more-feel") { state.moreFeel = !state.moreFeel; render(); return; }
    if (act === "generate") {
      if (!state.loaded || state.error) return;
      state.showFavs = false;
      pickLine();
      render();
      return;
    }
    if (act === "copy") {
      if (state.result) copyText(state.result.p.text);
      return;
    }
    if (act === "fav") {
      if (!state.result) return;
      const id = state.result.p.id;
      const i = state.favs.indexOf(id);
      if (i >= 0) state.favs.splice(i, 1);
      else state.favs.unshift(id);
      saveFavs();
      render();
      return;
    }
    if (act === "favs") {
      state.showFavs = !state.showFavs;
      render();
      return;
    }
    if (act === "open-fav") {
      const p = (state.phrases || []).find(function (x) { return x.id === val; });
      if (!p) return;
      state.showFavs = false;
      state.result = {
        p: p,
        loose: false,
        technique: techniqueFor(p),
        teacher: teacherLabel(teachersOf(p)),
        why: whyFor(p),
        tip: tipFor(p)
      };
      render();
      return;
    }
    if (act === "sources") {
      state.view = "sources";
      if (location.hash !== "#techniques") location.hash = "techniques";
      else render();
      window.scrollTo(0, 0);
      return;
    }
    if (act === "home") {
      state.view = "gen";
      if (location.hash) history.pushState("", document.title, location.pathname + location.search);
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (act === "retry") {
      state.loaded = false;
      state.error = false;
      render();
      loadPhrases();
    }
  }

  function loadPhrases() {
    fetch("phrases.json")
      .then(function (r) {
        if (!r.ok) throw new Error("phrases " + r.status);
        return r.json();
      })
      .then(function (data) {
        state.phrases = Array.isArray(data) ? data : [];
        state.loaded = true;
        state.error = false;
        render();
      })
      .catch(function () {
        state.loaded = true;
        state.error = true;
        render();
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    state.favs = loadFavs();
    setViewFromHash();
    const root = document.getElementById("app");
    root.addEventListener("click", function (e) {
      const t = e.target.closest("[data-act]");
      if (!t) return;
      if (t.getAttribute("data-act") === "sources") e.preventDefault();
      handle(t.getAttribute("data-act"), t.getAttribute("data-val"));
    });
    window.addEventListener("hashchange", function () {
      setViewFromHash();
      render();
    });
    render();
    loadPhrases();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline optional */ });
    }
  });
})();
