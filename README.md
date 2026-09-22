# DCO_AI Reforger — website

Static site for [DCO_AI Reforger](https://reforger.armaplatform.com/workshop/5EDAAE0D3CC60D6B-DCO_AIReforger), served by GitHub Pages at https://817r.github.io/DCO_AIRoadmap/.

## Updating content

Almost everything that changes lives in `data/`. Edit the JSON, commit, push. No build step.

| What | Where |
|---|---|
| Version, downloads, rating, release count | `data/site.json` |
| Discord / Workshop / Ko-fi / email links | `data/site.json` → `links` |
| New donor | `data/site.json` → `donors` (total raised, ranks and progress bars update automatically) |
| Funding goal and tiers | `data/site.json` → `funding` |
| Videos on Media page | `data/site.json` → `videos` (YouTube IDs) |
| Features | `data/features.json` |
| Milestone titles and intros | `data/roadmap.json` (one per feature category) |

### Feature fields

- `cat` — must match a `cat` in `data/roadmap.json`
- `ver` — Workshop version it shipped in (e.g. `v0.4.134`), `dev` if only in the dev build, or `planned`
- `prog` — 0–100. Milestone progress on the roadmap is the average of its features
- `prio` — sort order within a category (higher first)
- `video` — optional YouTube URL or path to a local `.mp4`

Devlog entries are written directly in `devlog.html`.

## Local preview

The pages load JSON with `fetch`, so open them through a local server rather than `file://`, e.g. `npx serve .`.
