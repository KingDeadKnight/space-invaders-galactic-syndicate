# Syndicat Galactique 🚀

A browser-based Space Invaders clone with a comedic HR workplace narrative. You are the Galactic HR Manager, firing job offers at striking aliens across 3 department-themed levels — each ending with a Boss Negotiator fight requiring a specific hit-sequence to defeat.

## Play It

**GitHub Pages**: [https://\<your-username\>.github.io/space-invaders](https://github.com)

**Local (recommended for Firefox)**:
```
# Just open in Firefox directly:
firefox index.html
```

**Local (Chrome / any browser)**:
```bash
python3 -m http.server 8080
# Then open: http://localhost:8080
```

## Controls

| Key | Action |
|-----|--------|
| `← Arrow` / `A` | Move left |
| `→ Arrow` / `D` | Move right |
| `Space` | Fire job offer / Start game / Restart |
| `Enter` | Start game / Restart |
| `P` / `Escape` | Pause / Resume |
| `M` | Toggle mute |

## Gameplay

- **Shoot aliens** to build your HR Satisfaction Rate (score)
- **Consecutive hits** build your Employee Engagement Bonus (combo multiplier, up to ×8)
- **Getting hit** by a protest flyer applies a **slow debuff** and resets your combo
- **Coffee pot shields** absorb flyers but degrade over time — protect them!
- **Clear the wave** to trigger the **Boss Negotiator** fight
- Hit the boss's zones **in the correct sequence** shown above it to defeat it
- **Wrong zone hit** resets the sequence; **timer runs out** also resets

## Level Progression

| Level | Department | Alien Rows × Cols | Theme |
|-------|------------|-------------------|-------|
| 1     | IT         | 4 × 8             | Cyan/tech grid |
| 2     | Accounting | 5 × 9             | Green/ledger lines |
| 3     | Management | 5 × 10            | Purple/boardroom |

Unions (3-hit aliens) appear in greater numbers at higher levels. The boss sequence gets longer each level (3 → 4 → 5 zones).

## Technical Notes

- **Zero dependencies** — pure Vanilla JS with ES modules, HTML5 Canvas, Web Audio API
- **No build step** — open `index.html` directly in Firefox, or serve with any static HTTP server for Chrome
- **All sprites** generated programmatically (2D pixel-art color arrays, no image files)
- **All audio** synthesised in-browser (procedural lofi BGM + SFX via Web Audio API)
- **Fixed timestep** game loop at 60 fps (Glenn Fiedler's "Fix Your Timestep" pattern)

## GitHub Pages Deploy

The repository auto-deploys on push to `main` via `.github/workflows/deploy.yml`.

To set up GitHub Pages manually:
1. Go to Settings → Pages → Source: `GitHub Actions`
2. Push to `main` — the workflow will build and deploy automatically

## Browser Requirements

- Chrome 90+ (requires local HTTP server — `file://` blocked by CORS for modules)
- Firefox 90+ (works with `file://` URL directly)

## Project Structure

```
/
├── index.html                   # Entry point
├── README.md
├── .github/workflows/deploy.yml # GitHub Pages auto-deploy
└── src/
    ├── main.js                  # rAF loop + input
    ├── game.js                  # Game state machine + constants
    ├── canvas.js                # Rendering
    ├── entities/
    │   ├── sprites.js           # Pixel-art sprite data
    │   ├── player.js            # HR Manager ship
    │   ├── alien.js             # Regular alien (1-hit)
    │   ├── unionist.js          # Hardened unionist (3-hit)
    │   ├── boss.js              # Boss Negotiator
    │   ├── projectile.js        # Job offers + protest flyers
    │   └── shield.js            # Coffee pot shields
    ├── systems/
    │   ├── collision.js         # AABB collision processor
    │   ├── scoring.js           # HR Satisfaction Rate + combo
    │   └── levels.js            # Level configs + formation
    └── audio/
        └── soundManager.js      # Web Audio API BGM + SFX
```
