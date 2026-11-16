/* Read Anyone · Ask engine. Local search over window.ASK_KB.
   BM25-style scoring + aliases + synonyms + fuzzy matching. No network, no AI API.
   Structure adapted from the Ask tab on Read & Connect (mhccog/behavior-ops). */
(function () {
  "use strict";
  const STOP = new Set("a an the and or but if of to in on at by for with from as is are was were be been being am do does did doing have has had having i me my we our you your he him his she her they them their it its this that these those what which who whom whose why how when where can could would should will shall may might must just so very really about into over under than then there here also any some such not no yes please tell explain say says mean means meaning know want get got thing things something someone somebody person people one ones like give show let lets us im youre dont doesnt isnt whats hows according book books his her kind sort way ways use using used technique techniques".split(" "));
  const NORM = { behaviour: "behavior", behaviours: "behavior", colour: "color", favour: "favor", favourite: "favorite", organise: "organize", recognise: "recognize", realise: "realize", apologise: "apologize", apologising: "apologize", hypnotise: "hypnotize", hypnotised: "hypnotize", sympathise: "sympathize", socialise: "socialize", criticise: "criticize", centre: "center", judgement: "judgment", programme: "program", humour: "humor", humorous: "humor", labelling: "labeling", kinaesthetic: "kinesthetic", practise: "practice", practising: "practice", arguement: "argument", convo: "conversation", convos: "conversation", mins: "minutes" };
  const SYN = {
    lie: ["lying", "deception"], lies: ["lying", "deception"], lying: ["lie", "deception"], liar: ["lying", "lie"], liars: ["lying", "lie"], deceive: ["deception"],
    mirror: ["mirroring"], mirroring: ["mirror"], copy: ["mirroring", "mimic"], mimic: ["mirroring"], copying: ["mirroring"],
    end: ["exit", "leave", "ending"], ending: ["exit", "end"], leave: ["exit", "end"], exit: ["end", "leave"], goodbye: ["exit"], wrap: ["exit"], escape: ["exit"],
    start: ["opener", "begin"], begin: ["start", "opener"], opener: ["start", "openers"], openers: ["opener"], opening: ["opener"], icebreaker: ["opener", "buffalo"], approach: ["start", "opener"],
    name: ["names"], names: ["name"], forget: ["remember", "names"], forgot: ["remember", "forget"],
    pause: ["pauses", "silence"], pauses: ["pause"], silence: ["pause", "silent"], silent: ["silence"], um: ["filler", "pause"], umm: ["filler", "pause"], filler: ["um", "pause"],
    nod: ["nodding", "triple"], nodding: ["nod"], nods: ["nod"],
    voice: ["vocal", "tone"], vocal: ["voice"], tone: ["tonality", "voice"], pitch: ["melody"], monotone: ["melody"], loud: ["volume"], quiet: ["volume", "introverts"], volume: ["loud"], fast: ["rate", "speed"], speed: ["rate"],
    hands: ["gestures", "hand"], hand: ["gestures"], gesture: ["gestures"], gestures: ["hands", "gesture"], palms: ["palm", "gestures"], arms: ["blocking"],
    eyes: ["eye", "contact"], eye: ["contact"], stare: ["eye", "contact"], staring: ["eye", "contact"],
    nervous: ["nerves", "anxiety", "composure"], anxious: ["anxiety", "nervous"], anxiety: ["nervous"], scared: ["fear", "nervous"], afraid: ["fear"], shy: ["introverts", "confidence"], introvert: ["introverts"],
    angry: ["calm", "upset"], upset: ["calm", "angry"], mad: ["angry", "calm"], furious: ["angry", "calm"], calm: ["calm"],
    argue: ["argument", "disagree"], arguing: ["argument", "disagree"], argument: ["disagree", "conflict"], fight: ["argument", "conflict"], conflict: ["disagree"], disagree: ["disagreement", "conflict"], disagreement: ["disagree"],
    boss: ["vip", "manager"], manager: ["boss"], ceo: ["vip"],
    compliment: ["compliments", "praise"], compliments: ["compliment"], praise: ["compliment"], flattery: ["compliment"],
    persuade: ["persuasion", "influence"], persuasion: ["influence", "persuade"], convince: ["persuasion"], manipulate: ["manipulation", "manipulative"], manipulation: ["manipulative", "excluded"], manipulative: ["manipulation", "excluded"], covert: ["excluded", "hidden"], hidden: ["covert", "embedded"], dark: ["manipulation"],
    hypnotize: ["hypnosis"], trance: ["hypnosis"], nlp: ["embedded", "vak"],
    interrupt: ["interrupted", "interruptions"], interrupted: ["interrupt", "interruptions"], interrupts: ["interrupt"], interrupting: ["interrupt"], interrupter: ["interrupt"],
    story: ["stories", "storytelling"], stories: ["story", "storytelling"], storytelling: ["story"],
    listen: ["listening"], listening: ["listen"], listener: ["listening"],
    friend: ["friends"], friends: ["friend"], lonely: ["friends"],
    party: ["event", "networking"], event: ["networking", "party"], networking: ["event", "connector"],
    rapport: ["connection", "rapport"], connect: ["connection", "rapport"], bond: ["rapport"],
    confident: ["confidence"], confidence: ["confident"], insecure: ["confidence", "insecurities"],
    feedback: ["criticism"], criticism: ["feedback"], criticise: ["feedback"],
    funny: ["humor"], joke: ["humor"], jokes: ["humor"], laugh: ["humor"],
    awkward: ["silence", "awkward"], boring: ["boring"], bored: ["boring"],
    zoom: ["video"], teams: ["video"], camera: ["video"],
    need: ["needs"], needs: ["need"], lean: ["needs"], sincere: ["sincerity"], honest: ["sincerity", "honest"], ethics: ["sincerity", "ethical"], ethical: ["sincerity"],
    smalltalk: ["small", "talk"], chat: ["conversation"], talk: ["conversation"],
    sorry: ["apologize"], apologize: ["sorry"], posture: ["posture", "stance"], slouch: ["posture"],
    tilt: ["head"], likeable: ["likable", "liked"], likable: ["likeable"], liked: ["likeable"], charismatic: ["charisma"], magnetic: ["charisma"], rude: ["disrespect"], disrespect: ["rude"], dates: ["date"], dating: ["date"], text: ["texting"], texting: ["text"], meeting: ["meetings"], meetings: ["meeting"], interview: ["interviewing"], date: ["dating"], lonely: ["friends"], introvert: ["introverts", "shy"], overthink: ["overthinking"], overthinking: ["overthink"], blank: ["freeze"], freeze: ["blank"], girl: ["date", "flirt"], girls: ["date", "flirt"], guy: ["date"], guys: ["date"], crush: ["date", "flirt"], smarter: ["smart", "confident"], smart: ["confident"], apologise: ["apologize", "sorry"], apology: ["apologize", "sorry"], raise: ["pay", "salary"], salary: ["pay", "raise"], pace: ["rate", "speed"], pacing: ["rate", "movement"], smile: ["warmth"], warm: ["warmth"], friendly: ["warmth"]
  };
  // author words in the query act as a soft filter
  const AUTHOR_WORDS = { vanessa: "vve", edwards: "vve", van: "vve", vve: "vve", vinh: "vg", vin: "vg", giang: "vg", chase: "ch", hughes: "ch", hughess: "ch" };
  function stem(w) {
    if (w.length <= 4) return w;
    if (/ies$/.test(w)) return w.slice(0, -3) + "y";
    if (/(ss|us|is)$/.test(w)) return w;
    if (/ing$/.test(w) && w.length > 5) { w = w.slice(0, -3); if (/(.)\1$/.test(w)) w = w.slice(0, -1); return w; }
    if (/ed$/.test(w) && w.length > 5) { w = w.slice(0, -2); if (/(.)\1$/.test(w)) w = w.slice(0, -1); return w; }
    if (/(ch|sh|x|z)es$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function clean(s) { return (Array.isArray(s) ? s.join(" ") : String(s || "")).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function toks(s) { return clean(s).split(" ").filter(function (w) { return w && !STOP.has(w); }).map(function (w) { return NORM[w] || w; }); }
  function stems(s) { return toks(s).map(stem); }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const m = a.length, n = b.length; let p = new Array(n + 1), c = new Array(n + 1);
    for (let j = 0; j <= n; j++) p[j] = j;
    for (let i = 1; i <= m; i++) {
      c[0] = i; let best = c[0];
      for (let j = 1; j <= n; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (c[j] < best) best = c[j]; }
      if (best > max) return max + 1; const t = p; p = c; c = t;
    }
    return p[n];
  }
  let E = [], IDX = [], BYID = {}, VOCAB = [], DF = {}, N = 0, AVG = {}, GLOSS = {};
  const FW = { t: 4, a: 3.2, g: 3.4, s: 1.3, d: 0.6, x: 0.35 };
  function build(kb) {
    E = kb.entries; BYID = {}; E.forEach(function (e) { BYID[e.i] = e; }); N = E.length; DF = {};
    GLOSS = {}; (kb.glossary || []).forEach(function (g) { (GLOSS[g[1]] = GLOSS[g[1]] || []).push(g[0]); });
    const lens = { t: 0, a: 0, g: 0, s: 0, d: 0, x: 0 };
    IDX = E.map(function (e) {
      const gl = GLOSS[e.i] || [];
      const f = { t: stems(e.t), a: stems(e.a.join(" ")), g: stems(gl.join(" ")), s: stems(e.s), d: stems(e.d), x: stems([e.u, (e.e || []).join(" "), (e.f || []).join(" ")].join(" ")) };
      const tf = {}, len = {};
      for (const k in f) { lens[k] += f[k].length; len[k] = f[k].length; const m = {}; f[k].forEach(function (w) { m[w] = (m[w] || 0) + 1; }); tf[k] = m; }
      const all = new Set(); for (const k in f) f[k].forEach(function (w) { all.add(w); }); all.forEach(function (w) { DF[w] = (DF[w] || 0) + 1; });
      const phr = [clean(e.t.replace(/\(left out\)/i, ""))].concat(e.a.map(clean), gl.map(clean)).filter(Boolean);
      return { tf: tf, len: len, phr: phr, gl: gl.map(clean) };
    });
    for (const k in lens) AVG[k] = lens[k] / N || 1;
    VOCAB = Object.keys(DF);
  }
  function idf(w) { const df = DF[w] || 0; return Math.log(1 + (N - df + 0.5) / (df + 0.5)); }
  function authorsIn(q) {
    const out = {}; clean(q).split(" ").forEach(function (w) { if (AUTHOR_WORDS[w]) out[AUTHOR_WORDS[w]] = true; });
    return Object.keys(out);
  }
  function expand(q) {
    const out = {}; let unknown = 0;
    const raw = toks(q).filter(function (w) { return !AUTHOR_WORDS[w]; });
    function add(w, wt) { const s = stem(w); if (!s || STOP.has(s)) return; out[s] = Math.max(out[s] || 0, wt); }
    raw.forEach(function (w) { add(w, 1); (SYN[w] || SYN[stem(w)] || []).forEach(function (x) { x.split(" ").forEach(function (y) { add(y, 0.6); }); }); });
    Object.keys(out).forEach(function (s) {
      if (DF[s] || TDF[s]) return; if (s.length < 5) { if (out[s] === 1 && s.length >= 3) unknown++; return; }
      const max = s.length >= 7 ? 2 : 1; let best = null, bd = 9;
      for (const v of VOCAB) { if (Math.abs(v.length - s.length) > max || v[0] !== s[0]) continue; const d = lev(s, v, max); if (d < bd) { bd = d; best = v; } if (bd === 0) break; }
      if (best && bd <= max) out[best] = Math.max(out[best] || 0, out[s] * (bd === 1 ? 0.85 : 0.65));
      else if (out[s] === 1) unknown++;
    });
    Object.defineProperty(out, "_unknown", { value: unknown, enumerable: false });
    return out;
  }
  function intent(q) {
    const s = " " + clean(q) + " ";
    return {
      term: /( what (does|do|is|are) | what s | define | definition | meaning | mean )/.test(s) || clean(q).split(" ").length <= 3,
      how: /( how (do|can|should|would) (i|you|we) | how to | tips | what should i | what do i say | help me )/.test(s),
      ethics: /( manipulat| covert | dark psych| ethical | ethics | is it ok | is this ok )/.test(s)
    };
  }
  function matchesAuthor(e, author) {
    if (!author || author === "all") return true;
    return e.w.indexOf(author) >= 0 || e.w.indexOf("all") >= 0 || e.w.indexOf("ra") >= 0;
  }
  function score(q, opt) {
    opt = opt || {};
    if (!N) return [];
    const qs = expand(q); const qc = " " + clean(q) + " "; const it = intent(q);
    const named = authorsIn(q);
    const k1 = 1.2, b = 0.72, res = [];
    const nq = Object.keys(qs).filter(function (w) { return qs[w] >= 1; }).length || Object.keys(qs).length;
    for (let n = 0; n < N; n++) {
      const e = E[n];
      if (!matchesAuthor(e, opt.author)) continue;
      const ix = IDX[n]; let sc = 0, hit = 0;
      for (const w in qs) {
        const id = idf(w); let tfw = 0;
        for (const f in FW) { const t = ix.tf[f][w]; if (t) tfw += FW[f] * t / (1 - b + b * ix.len[f] / AVG[f]); }
        if (tfw > 0) { hit += qs[w]; sc += qs[w] * id * (tfw * (k1 + 1)) / (tfw + k1); }
      }
      let pb = 0;
      for (const p of ix.phr) {
        if (p.length < 3) continue;
        const pw = p.split(" ").length;
        if (qc.indexOf(" " + p + " ") >= 0) pb = Math.max(pb, pw > 1 ? 6 + p.length / 6 : 3);
        else if (pw > 1 && (" " + p + " ").indexOf(qc) >= 0 && qc.trim().split(" ").length > 1) pb = Math.max(pb, 4);
      }
      const orig = Object.keys(qs).filter(function (w) { return qs[w] >= 1; });
      if (orig.length && orig.length <= 3 && orig.every(function (w) { return ix.tf.t[w] || ix.tf.g[w]; })) pb = Math.max(pb, 3.5);
      sc += pb;
      if (sc <= 0) continue;
      const cov = hit / Math.max(1, nq); sc *= 0.35 + 0.65 * Math.min(1, cov);
      if (it.term && ix.gl.length) { for (const g of ix.gl) { if (qc.indexOf(" " + g + " ") >= 0) { sc *= 1.25; break; } } }
      if (it.ethics && e.c === "leftout") sc *= 1.1;
      if (named.length) { if (named.some(function (a) { return e.w.indexOf(a) >= 0; })) sc *= 1.6; else if (e.w.indexOf("all") < 0) sc *= 0.7; }
      if (opt.author && opt.author !== "all" && e.w.indexOf(opt.author) < 0) sc *= 0.85;
      if (opt.ctx && opt.ctx.indexOf(e.i) >= 0) sc *= 1.08;
      if (qs._unknown) sc *= Math.pow(0.6, qs._unknown);
      res.push({ e: e, sc: sc });
    }
    res.sort(function (x, y) { return y.sc - x.sc; });
    return res;
  }
  const FU = {
    deeper: /^(more|tell me more|more please|go deeper|deeper|explain( more| that| it| this)?|elaborate|why( is that| does that work| does it work)?|details?|go on|continue|keep going|say more)$/,
    example: /\b(examples?|for instance|show me|what would (i|that) say|script|phrase it|sound like)\b/,
    use: /\b(how do i (use|apply|do|practi[cs]e) (it|this|that)|use it|apply (it|this)|in practice|practically)\b/,
    related: /\b(related|similar|what else|anything else)\b/
  };
  function isFollow(q) {
    const c = clean(q); const w = c.split(" ");
    const pron = /\b(it|this|that|those|these)\b/.test(c);
    return w.length <= 7 && (pron || Object.keys(FU).some(function (k) { return FU[k].test(c); }));
  }
  function answer(q, state) {
    state = state || {}; const last = state.last && BYID[state.last]; const cq = clean(q);
    const opt = { author: state.author, ctx: state.recent || [] };
    if (last && isFollow(q)) {
      let mode = null; for (const k in FU) if (FU[k].test(cq)) { mode = k; break; }
      const bare = score(q, { author: state.author });
      const strong = bare[0] && bare[0].e.i !== last.i && bare[0].sc > (mode ? 11 : 9) && cq.split(" ").length > 3;
      if (!strong) {
        if (mode === "related") return { kind: "related", main: last, alts: (last.r || []).map(function (r) { return BYID[r]; }).filter(Boolean).slice(0, 5) };
        if (mode || !bare[0] || bare[0].sc < 9) return { kind: "follow", mode: mode || "deeper", main: last, alts: [] };
      }
    }
    const named = authorsIn(q);
    if (named.length === 1 && !Object.keys(expand(q)).filter(function (w) { return !/^(who|about|tell|background)$/.test(w); }).length) {
      const ab = BYID[{ vve: "vve-about", vg: "vg-about", ch: "ch-about" }[named[0]]];
      if (ab) return { kind: "answer", main: ab, alts: [], conf: "ok", score: 20 };
    }
    const sc = score(q, opt);
    const res = pack(sc, q);
    if (state.author && state.author !== "all") {
      // say so, and point to the teacher who does cover it
      const wide = score(q, {});
      const w0 = wide[0];
      if (w0 && w0.sc >= 6 && !matchesAuthor(w0.e, state.author) && (res.kind === "unsure" || w0.sc > res.score * 1.8)) res.elsewhere = w0.e;
    }
    return res;
  }
  function pack(sc, q) {
    if (!sc.length || sc[0].sc < 5.5) return { kind: "unsure", alts: sc.slice(0, 4).map(function (x) { return x.e; }) };
    const top = sc[0], alts = [];
    for (const x of sc.slice(1, 8)) { if (alts.length >= 3) break; if (x.sc >= top.sc * 0.5) alts.push(x.e); }
    return { kind: "answer", main: top.e, alts: alts, conf: top.sc < 8 ? "low" : "ok", score: top.sc };
  }
  // ---------- blended topics (All mode) ----------
  let T = [], TIDX = [], TBY = {}, TDF = {}, TN = 0, TAVG = {}, TTITLE = {}, NOTE2T = {};
  const TW = { t: 3.5, q: 3.6, s: 1.2, b: 0.9, l: 0.8, f: 0.25 };
  function buildTopics(kb) {
    T = kb.topics || []; TBY = {}; TDF = {}; TN = T.length; TTITLE = {}; NOTE2T = {};
    const lens = { t: 0, q: 0, s: 0, b: 0, l: 0, f: 0 };
    TIDX = T.map(function (t) {
      TBY[t.i] = t; TTITLE[clean(t.t)] = t.i;
      t.n.forEach(function (n, k) { (NOTE2T[n] = NOTE2T[n] || []).push([t.i, k]); });
      const ln = t.n.map(function (n) { const e = BYID[n]; return e ? [e.t, e.a.join(" "), (GLOSS[n] || []).join(" ")].join(" ") : ""; }).join(" ");
      const f = { t: stems(t.t), q: stems(t.q.join(" ")), s: stems(t.short), b: stems(t.b + " " + t.say + " " + t.tip), l: stems(ln), f: stems(t.f.join(" ")) };
      const tf = {}, len = {};
      for (const k in f) { lens[k] += f[k].length; len[k] = f[k].length; const m = {}; f[k].forEach(function (w) { m[w] = (m[w] || 0) + 1; }); tf[k] = m; }
      const all = new Set(); for (const k in f) f[k].forEach(function (w) { all.add(w); }); all.forEach(function (w) { TDF[w] = (TDF[w] || 0) + 1; });
      const phr = [clean(t.t)].concat(t.q.map(clean)).filter(Boolean);
      const gl = []; t.n.forEach(function (n) { (GLOSS[n] || []).forEach(function (g) { gl.push(clean(g)); }); const e = BYID[n]; if (e) e.a.forEach(function (a) { gl.push(clean(a)); }); });
      return { tf: tf, len: len, phr: phr, gl: gl };
    });
    for (const k in lens) TAVG[k] = lens[k] / TN || 1;
    VOCAB = Array.from(new Set(VOCAB.concat(Object.keys(TDF))));
  }
  function tidf(w) { const df = TDF[w] || 0; return Math.log(1 + (TN - df + 0.5) / (df + 0.5)); }
  function scoreTopics(q) {
    const qs = expand(q); const qc = " " + clean(q) + " "; const nWords = clean(q).split(" ").filter(Boolean).length;
    const orig = Object.keys(qs).filter(function (w) { return qs[w] >= 1; });
    const k1 = 1.2, b = 0.7, res = [];
    for (let n = 0; n < TN; n++) {
      const ix = TIDX[n]; let sc = 0, hit = 0; const hits = {};
      for (const w in qs) {
        let tfw = 0;
        for (const f in TW) { const c = ix.tf[f][w]; if (c) tfw += TW[f] * c / (1 - b + b * ix.len[f] / TAVG[f]); }
        if (tfw > 0) { hit += qs[w]; sc += qs[w] * tidf(w) * (tfw * (k1 + 1)) / (tfw + k1); if (ix.tf.q[w] || ix.tf.t[w] || ix.tf.s[w]) hits[w] = 1; }
      }
      const cov = orig.length ? hit / Math.max(1, orig.length) : 0;
      sc *= 0.4 + 0.6 * Math.min(1, cov);
      let pb = 0;
      for (const p of ix.phr) {
        if (p.length < 3) continue; const pw = p.split(" ").length;
        if (qc.indexOf(" " + p + " ") >= 0) pb = Math.max(pb, 5 + 1.6 * pw);
        else if (pw > 1 && nWords > 1 && (" " + p + " ").indexOf(qc) >= 0) pb = Math.max(pb, 5);
      }
      for (const g of ix.gl) { if (g.length > 3 && g.split(" ").length > 1 && qc.indexOf(" " + g + " ") >= 0) { pb = Math.max(pb, 4.5); break; } }
      sc += pb;
      if (qs._unknown) sc *= Math.pow(0.6, qs._unknown);
      if (sc > 0) res.push({ t: T[n], sc: sc, hits: hits, pb: pb });
    }
    res.sort(function (x, y) { return y.sc - x.sc; });
    return { list: res, qs: qs, orig: orig };
  }
  // the note whose glossary term / alias the question names directly ("what is the triple nod")
  function termNote(q) {
    const qc = " " + clean(q) + " "; let best = null, bl = 0;
    for (const e of E) {
      const cands = (GLOSS[e.i] || []).concat([e.t.replace(/\(.*?\)/g, "")]);
      for (const g of cands) { const c = clean(g); if (c.length < 4) continue; if (qc.indexOf(" " + c + " ") >= 0 && c.length > bl) { bl = c.length; best = e; } }
    }
    return best;
  }
  function topicFor(noteId, ranked) {
    const ts = NOTE2T[noteId] || []; if (!ts.length) return null;
    const rank = {}; (ranked || []).forEach(function (x, k) { rank[x.t.i] = k; });
    ts.sort(function (a, b) { const ra = rank[a[0]] == null ? 999 : rank[a[0]], rb = rank[b[0]] == null ? 999 : rank[b[0]]; return ra - rb || a[1] - b[1]; });
    return TBY[ts[0][0]];
  }
  const OFF = "That's outside what Vanessa, Chase and Vinh teach";
  function answerAll(q, state) {
    const cq = clean(q); const last = state.lastT && TBY[state.lastT];
    if (last && isFollow(q) && !TTITLE[cq]) {
      let mode = null; for (const k in FU) if (FU[k].test(cq)) { mode = k; break; }
      const r0 = scoreTopics(q).list[0];
      if (mode || !r0 || r0.sc < 7) return { kind: "tfollow", mode: mode || "deeper", main: last };
    }
    if (TTITLE[cq]) return { kind: "topic", main: TBY[TTITLE[cq]] };
    const named = authorsIn(q);
    if (named.length === 1 && !Object.keys(expand(q)).filter(function (w) { return !/^(who|about|tell|background)$/.test(w); }).length) {
      const ab = BYID[{ vve: "vve-about", vg: "vg-about", ch: "ch-about" }[named[0]]];
      if (ab) return { kind: "term", lead: ab, main: TBY["t-teachers"] };
    }
    const r = scoreTopics(q); const L = r.list; const top = L[0];
    const it = intent(q);
    const tn = termNote(q);
    // a named technique: lead with a one-line definition, then the blended topic it belongs to
    if (tn && (it.term || !top || top.sc < 9 || (NOTE2T[tn.i] || []).some(function (x) { return x[0] === top.t.i; }))) {
      const tp = topicFor(tn.i, L) || (top && top.t);
      return { kind: "topic", lead: tn, main: tp };
    }
    if (!top || top.sc < 4.2) {
      const known = r.orig.length - (r.qs._unknown || 0);
      if (!r.orig.length && !top) return { kind: "off" };
      if ((known <= 0 || r.qs._unknown) && (!top || top.pb === 0)) return { kind: "off" };
      return { kind: "topic", main: TBY["t-general"], general: true, alts: L.slice(0, 3).map(function (x) { return x.t; }) };
    }
    const out = { kind: "topic", main: top.t };
    // bridge: a second topic that covers words the first one doesn't
    for (const x of L.slice(1, 5)) {
      if (x.sc < top.sc * 0.55 || x.sc < 5) break;
      if (x.t.i === "t-general" || !x.pb) continue;
      const extra = Object.keys(x.hits).filter(function (w) { return !top.hits[w] && r.qs[w] >= 1; });
      if (extra.length) {
        const words = cq.split(" ").filter(function (w) { return extra.indexOf(stem(NORM[w] || w)) >= 0; });
        out.bridge = { t: x.t, words: words.length ? words.slice(0, 3).join(" ") : null };
        break;
      }
    }
    return out;
  }
  function answerTeacher(q, state) {
    // notes from one teacher; vague questions are routed through the matching topic's notes
    const res = answer(q, state);
    if (res.kind === "follow" || res.kind === "related") return res;
    const L = scoreTopics(q).list; const top = L[0];
    const own = res.main && res.main.w.indexOf(state.author) >= 0;
    if (top && top.sc >= 6 && (res.kind === "unsure" || res.score < 9 || !own)) {
      const ns = top.t.n.map(function (n) { return BYID[n]; }).filter(function (e) { return e && e.w.indexOf(state.author) >= 0; });
      if (ns.length) {
        const sc = score(q, { author: state.author }); const rank = {}; sc.forEach(function (x, k) { rank[x.e.i] = k; });
        ns.sort(function (a, b) { return (rank[a.i] == null ? 999 : rank[a.i]) - (rank[b.i] == null ? 999 : rank[b.i]); });
        return { kind: "answer", main: ns[0], alts: ns.slice(1, 3), conf: "ok", score: 10, via: top.t };
      }
    }
    return res;
  }
  window.ASK_ENGINE = { build: function (kb) { build(kb); buildTopics(kb); }, answerAll: answerAll, answerTeacher: answerTeacher, scoreTopics: scoreTopics, topic: function (id) { return TBY[id]; }, topics: function () { return T; }, topicFor: topicFor, OFF: OFF, buildNotes: build, score: score, answer: answer, expand: expand, clean: clean, byId: function (id) { return BYID[id]; }, all: function () { return E; } };
})();
