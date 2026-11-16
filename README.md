# Say it

A simple word and sentence generator: pick a lean, a vibe, a moment and a teacher, and a “Say first” word plus a line update as you tap.

**Live site:** [https://mhccog.github.io/read-anyone/](https://mhccog.github.io/read-anyone/)

**Ask** (the second tab): ask anything about talking to people, vague (“I’m nervous”, “they seem bored”) or specific (“what is the Name Game?”). With **All** selected you get one blended answer that weaves Vanessa Van Edwards, Chase Hughes and Vinh Giang together: a direct answer, a few concrete moves, a line to say and a delivery tip, with sources tucked into a closed “Where this comes from” toggle. Pick one teacher to hear only their view. It runs entirely in the browser from hand-written material (`ask/kb.js`) with no AI API and no web results. Blended answers live in `research/ask-topics/*.txt` (plus a little outside research, cited), per-teacher notes in `research/ask-kb/*.txt`; run `python3 research/build_ask_kb.py` after editing. Manipulative techniques are only named to explain why they’re left out, with an honest alternative.

The six needs are listening prompts from Chase Hughes (coach’s view, untested), not labels. Only say what you mean. Use this to make the conversation easier for the other person, never to push people.

The earlier full guide (Identify, Practice, Today, Playbook) is preserved on the `v1-full-guide` tag: [browse it](https://github.com/mhccog/read-anyone/tree/v1-full-guide).

## Add it to your phone

Open the live site in Safari (iPhone) or Chrome (Android), then **Share → Add to Home Screen** or **Install app**. It works offline after the first visit.

## Run it locally

No build step. From this folder:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Deploy

This is a static site on GitHub Pages (`main` branch, root). Push to `main` and the site updates.
