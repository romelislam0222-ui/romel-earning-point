# ROMEL EARNING POINT

Micro-job & digital rewards platform (Express + WebSocket backend, React + Vite frontend).

## Setup
```bash
npm install
npm run dev
```
App runs at http://localhost:3000

## Build for production
```bash
npm run build
npm start
```

## Notes
- Data is stored in `data/db.json` (auto-created on first run) — this is a simple JSON file store, not a production database.
- Moderator password is not set in the provided code — check `App.tsx`'s `handleModeratorLogin` function and set your own secret.
- The `@google/genai` dependency is listed in package.json but not currently used anywhere in the code — you can remove it if unused, or wire it up if you plan to add AI features.
