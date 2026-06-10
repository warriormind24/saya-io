# saya io — Implementation checklist

## Plan (approved)
- [x] Create project scaffold for a simple, fast web app (HTML/CSS/JS) that works offline.
- [x] Implement core screens: onboarding, dashboard, records, crops/fields, tasks.
- [x] Implement local storage persistence (no backend required).
- [x] Add data model: farm/field, crop, season, activities/records, attachments (optional metadata).
- [x] Provide export/import of data as JSON.
- [x] Add basic analytics summary (counts, last activity, quick stats).
- [x] Add responsive UI and accessibility basics.
- [x] Add README with how to run.
- [x] Smoke test by running in browser (open index.html).

## Vercel rollout fixes
- [x] Fix “unclickable site” on Vercel by ensuring JS is served from public/ (copied src/ -> public/src).

## Current task
- [ ] Fix app so users can enter/select data successfully (keyboard/mouse interaction + input fields wiring).

