# Quickstart: Syndicat Galactique

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06

---

## Prerequisites

- A modern browser (Chrome 90+ or Firefox 90+ recommended)
- A local static file server OR open directly via `file://` (Chrome requires a server for ES modules; Firefox supports `file://` for modules)
- Git (to clone and switch branches)
- A GitHub account with Pages enabled (for public deployment)

No Node.js, no build tools, no package manager required.

---

## Run Locally

### Option A: Direct file open (Firefox)

```bash
# Clone the repository
git clone https://github.com/<your-org>/space-invaders.git
cd space-invaders
git checkout 001-syndicat-galactique

# Open directly in Firefox
firefox index.html
```

### Option B: Simple HTTP server (Chrome or any browser)

```bash
# Python 3 (built-in)
python3 -m http.server 8080

# Then open: http://localhost:8080
```

```bash
# Or with npx serve (Node.js optional install)
npx serve .
```

---

## Controls

| Action | Key |
|--------|-----|
| Move left | ← Arrow or A |
| Move right | → Arrow or D |
| Fire job offer | Space |
| Pause / Resume | P or Escape |
| Mute / Unmute music | M |

No mouse required — the game is fully keyboard-controlled (SC-008).

---

## Game Objective

You are a **Galactic HR Manager**. Convince striking alien workers to return to their desks by shooting **job offers** upward at them. Clear all 3 waves (IT → Accounting → Management) to win promotion to **CHRO**.

- **Regular Aliens**: 1 hit to convince.
- **Hardened Unionists**: 3 hits — watch their mood bar drop with each hit.
- **Boss (The Negotiator)**: Hit the marked zones in the correct sequence displayed above the boss. Wrong order resets the sequence.
- **Coffee Pot Shields**: Block incoming protest flyers but degrade over time.
- **Protest Flyers**: If a flyer hits you, your movement speed is temporarily reduced.

---

## Project Structure

```
/
├── index.html                   # Entry point — open this
├── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml           # Auto-deploys to GitHub Pages on push to main
└── src/
    ├── main.js                  # Game loop (rAF fixed-timestep)
    ├── game.js                  # GameState management
    ├── canvas.js                # Rendering engine
    ├── entities/
    │   ├── sprites.js           # All pixel-art sprite definitions (2D arrays)
    │   ├── player.js
    │   ├── alien.js
    │   ├── unionist.js
    │   ├── boss.js
    │   ├── projectile.js
    │   └── shield.js
    ├── systems/
    │   ├── collision.js         # AABB collision detection
    │   ├── scoring.js           # HR Satisfaction Rate logic
    │   └── levels.js            # Level configs & alien formation builder
    └── audio/
        └── soundManager.js      # Web Audio API lofi music + SFX
```

---

## Deploy to GitHub Pages

### One-time Setup

1. In your GitHub repository, go to **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Ensure the `.github/workflows/deploy.yml` workflow file exists on `main`.

### Automatic Deploy

Every push to `main` triggers the workflow automatically:

```
push to main → build job (upload-pages-artifact path '.') → deploy job (deploy-pages@v4)
```

The deployed URL will be: `https://<org>.github.io/<repo>/`

### Manual Deploy

In the **Actions** tab, select the **Deploy to GitHub Pages** workflow and click **Run workflow**.

---

## Adding a New Level Theme

1. Add a new sprite frame set in `src/entities/sprites.js` under the new theme key.
2. Add a `LevelConfig` entry in `src/systems/levels.js` returning the new theme.
3. Increment the level count constant in `src/game.js`.

---

## Muting Audio

Press **M** at any time to toggle mute. Audio state persists across level transitions within a session (resets on page refresh — no localStorage used).

> **Note**: Audio requires a user interaction before the browser allows sound. The game starts the `AudioContext` on the first keypress or Start button click to comply with browser autoplay policies.
