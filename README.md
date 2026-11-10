# Say it

A simple word and sentence generator: pick a lean, a vibe, a moment and a teacher, and the line updates as you tap.

**Live site:** [https://mhccog.github.io/read-anyone/](https://mhccog.github.io/read-anyone/)

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
