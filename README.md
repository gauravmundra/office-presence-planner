# Time Card — Office Presence Planner

A tiny, single-purpose tool: it tells you exactly what time to leave the office today, based on a weekly hour requirement split across your required office days.

**Author:** Gaurav Mundra

## How it works

1. Set your **weekly requirement** — total hours you need to be present, and how many office days that's spread across.
2. Pick **which day today is**, enter the hours you've already completed on previous days, and your in-time today.
3. The board shows how many hours you have left, splits them evenly across your remaining days, and tells you your exit time — live, as you type.

Everything runs client-side. Your last inputs are remembered in your browser's `localStorage` so you don't have to re-enter them each day (nothing is sent anywhere — it's a static site).

## Project structure

```
.
├── index.html      # markup
├── style.css       # styles
├── script.js       # app logic
├── .nojekyll       # tells GitHub Pages to serve files as-is
└── README.md
```

## Running locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, pick your default branch (e.g. `main`) and root (`/`).
4. Save — GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/`.

## License

MIT © Gaurav Mundra
