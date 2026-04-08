# CSScout — Copilot Instructions

React frontend for scouting CS2 player statistics from ESEA/FACEIT leagues.
Deployed to Firebase Hosting; backend API on Google Cloud Run.

## Commands

```bash
npm run dev        # Dev server (Vite, hot reload)
npm run build      # tsc + vite build
npm run test       # Vitest watch mode
npm run test:run   # Vitest single run
npm run lint       # ESLint
```

## API Contract

Base URL configured in `src/config.ts` — uses Vite proxy (`/players` → `localhost:3000`) in dev, Cloud Run URL in production.
All requests include `X-API-Key` header from `VITE_API_KEY` env var.

| Endpoint | Returns |
|----------|---------|
| `GET /players/search?nickname=<name>` | `{ items: Player[] }` |
| `GET /players/:playerId` | `Player` (full profile with FACEIT data) |
| `GET /players/:playerId/esea` | `{ player_id, seasons: Season[] }` |
| `GET /players/:playerId/competitions/:competitionId/stats` | `PlayerStats` |

Types are in `src/types/api.ts`.

## Conventions

- Functional components with hooks, named exports
- Styling: Tailwind CSS + DaisyUI 5 (dark theme only). Use DaisyUI component classes (`btn`, `card`, `alert`, `loading`, `modal`, etc.)
- Custom `.glass` utility class for glassmorphism panels (defined in `index.css`)
- CSS custom properties for theming: `--color-primary` (orange #ff6b35), `--color-good`/`--color-avg`/`--color-poor` for stat coloring
- Barrel exports in `components/index.ts` and `pages/index.ts` — update these when adding components
- `font-mono` class uses JetBrains Mono; display font is Outfit

## Non-Obvious Patterns

- **Player caching**: `HomePage` stores selected player in `sessionStorage` keyed by nickname. `PlayerPage` reads this for instant display, then fetches full data in background.
- **Season stats prefetch**: `PlayerPage` fetches stats for ALL seasons in parallel on mount, populating `seasonStatsMap`. Stats modal reads from this cache.
- **Rating formula** (`utils/statAverages.ts`): `calculateRating(kd, adr)` = 60% K/D + 40% ADR/75. If `adr === 0` (CS:GO data), falls back to K/D only.
- **Vite proxy**: Dev server proxies `/players` and `/health` to `localhost:3000`. Don't prefix API calls with the base URL in dev.
- **Firebase Analytics**: Non-blocking init in `main.tsx`. Config from env vars. Do not import Firebase in components — only in `src/lib/firebase.ts`.

## Environment Variables

See `.env.example`. All prefixed with `VITE_`. The `VITE_API_KEY` is required for backend auth.

## CI/CD

- **CI**: lint + build + tests on every PR, plus a Firebase preview channel deploy (preview URL posted as PR comment)
- **Release**: release-please creates a Release PR on merge to `main`. Merging it bumps version, updates CHANGELOG, tags, creates a GitHub Release, and deploys to Firebase Hosting.
- **Secret required**: `FIREBASE_SERVICE_ACCOUNT` repo secret for deploys (see README for setup)

## Guardrails

- Do not change the routing library (React Router v7)
- Do not modify Firebase config structure — it maps 1:1 to Firebase console values
- Do not add server-side rendering — this is a client-only SPA
- Keep the dark-theme-only approach (DaisyUI `themes: dark` in index.css)
- Use Conventional Commits for PR titles (e.g. `feat: add X`, `fix: broken Y`). This drives automatic versioning via release-please.
- Run `npm run test:run` after changes to verify nothing breaks
- Run `npm run lint` to check code style
