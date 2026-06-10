# saya io — Smart Farming Digital Record Keeping

A lightweight offline-first web app for keeping digital farming records.

## Features
- Create **Fields** (name, crop, season)
- Log **Records** (planting, irrigation, spraying, fertilizing, harvesting, other + notes)
- Plan **Tasks** (type, due date, priority, notes)
- **Dashboard** summary + recent activity
- **Local persistence** using `localStorage`
- **Export/Import** data as JSON

## Run
Since this is plain static hosting via Node:

```bash
cd "c:/Users/dominic.tembo/Desktop/saya io"
npm run dev
```

Then open: http://localhost:5173

## Notes
- This is a demo/single-user app (no backend).
- Data stays in your browser under `localStorage`.
- Use **Settings → Export JSON** as a backup.

