# Say it

A simple word and sentence generator: pick a lean, a vibe, a moment and a teacher, and a “Say first” word plus a line update as you tap.

**Live site:** [https://mhccog.github.io/read-anyone/](https://mhccog.github.io/read-anyone/)

**Ask** (the second tab): type a question, a word or “what does … mean” and get a plain-English answer from Vanessa Van Edwards, Chase Hughes or Vinh Giang, tagged with the teacher and source. It runs entirely in the browser from hand-written notes (`ask/kb.js`), with no AI API and no web results. To edit the notes, change `research/ask-kb/*.txt` and run `python3 research/build_ask_kb.py`. Manipulative techniques are listed only to say what they are and why they’re left out.

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
