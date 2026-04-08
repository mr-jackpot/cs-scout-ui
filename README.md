# CSScout

React frontend for scouting Counter-Strike 2 player statistics from ESEA leagues.

## Features

- Search for players by nickname
- View player's ESEA season history
- Detailed stats per season (K/D, ADR, win rate, headshot %, multi-kills)

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Requires the [backend API](https://github.com/mr-jackpot/cs2-league-stats) running on `http://localhost:3000`.

## Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
npm run lint      # Run ESLint
```

## Configuration

The API URL is configured in `src/config.ts`:

```ts
export const config = {
  apiUrl: 'https://cs2-league-stats-857778773897.europe-west2.run.app',
};
```

## Deployment

### Firebase Hosting (Frontend)

Production deploys happen automatically when a release is created via release-please (see Versioning & CI below).

Preview deploys are created automatically on every PR — check the PR comments for the preview URL.

**Manual deploy (if needed):**

```bash
firebase login
npm run build
firebase deploy --only hosting
```

### Setup: `FIREBASE_SERVICE_ACCOUNT` Secret

For CI/CD deploys, add a GitHub repo secret:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON file
3. Go to your GitHub repo → Settings → Secrets and variables → Actions
4. Add a new secret named `FIREBASE_SERVICE_ACCOUNT` with the JSON file contents

### Configuration Files

- `firebase.json` - Firebase Hosting configuration
- `.firebaserc` - Firebase project settings

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Navbar.tsx
│   ├── PlayerSearch.tsx
│   ├── PlayerList.tsx
│   ├── PlayerProfile.tsx
│   ├── SeasonsList.tsx
│   └── PlayerStatsCard.tsx
├── pages/          # Page components
│   ├── HomePage.tsx
│   └── PlayerPage.tsx
├── services/       # API client
│   └── api.ts
├── types/          # TypeScript types
│   └── api.ts
└── test/           # Test setup
    └── setup.ts
```

## AI Agent Instructions

Copilot CLI and other AI agents: see [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for project conventions and patterns.

## Versioning & CI

This project uses automatic semantic versioning via [release-please](https://github.com/googleapis/release-please).

- **PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/)** format:
  - `feat: add player comparison` → minor bump
  - `fix: broken search on mobile` → patch bump
  - `feat!: redesign player page` → major bump (breaking change)
- On merge to `main`, release-please creates/updates a **Release PR** tracking pending changes
- Merging the Release PR bumps the version in `package.json`, updates `CHANGELOG.md`, creates a git tag, GitHub Release, and **deploys to Firebase Hosting**
- CI runs lint + build + tests on every PR, and deploys a **Firebase preview channel** (check PR comments for the preview URL)

## License

MIT
