# Quickstart: Visual Overhaul & Gameplay Balancing

**Branch**: `001-rebrand-visual-overhaul` | **Date**: 2026-03-06

---

## Prerequisites

- A modern browser (Chrome 90+ or Firefox 90+) — no build tools or Node.js required to play.
- A static HTTP server to serve ES modules (required — `file://` does not support ES module `import`).
  - Quickest option: `npx serve .` (Node.js 14+ required for the serve tool only, not for the game).
  - Alternative: VS Code **Live Server** extension, Python `python3 -m http.server 8080`, or any static host.
- An internet connection for the first load to fetch the **Press Start 2P** pixel font from Google Fonts CDN. Subsequent loads may use the browser cache. If offline, the game runs with Courier New fallback.

---

## Running Locally

```bash
# Clone / stay on branch
git checkout 001-rebrand-visual-overhaul

# Serve from repository root
npx serve .

# Open in browser
# → http://localhost:3000
```

The game opens immediately at the MENU screen.

---

## Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `Space` | Fire job offer |
| `Escape` / `P` | Pause / unpause |
| `M` | Toggle mute |
| `Space` (cutscene) | Skip Quarterly Review cutscene |
| `Space` (menu) | Start game |

---

## Manual Test Checklist

Use this checklist to verify all new and changed features after implementation before merging.

### FR-001–003: Fullscreen Scaling

- [ ] Game opens at full browser window size with no visible margins or dead space
- [ ] Resize the browser window — canvas rescales immediately with no gap
- [ ] Shrink to a narrow window (portrait-ish) — canvas letterboxes; game content not clipped
- [ ] Expand to ultra-wide window — canvas pillarboxes; dark bars blend with background

### FR-004–006: Background & Atmosphere

- [ ] A dark background with a silhouetted cityscape visible at the bottom-horizon area
- [ ] Cityscape scrolls slowly leftward during gameplay
- [ ] Cityscape stops scrolling when Reduced Motion is enabled
- [ ] A subtle horizontal scanline overlay visible across the full canvas during gameplay
- [ ] Scanlines absent when Reduced Motion is enabled

### FR-007: Protest Signs

- [ ] Each alien in a fresh wave displays a unique text label above it (a slogan from the pool)
- [ ] Slogans include at least one of: "MORE STARS, LESS WORK", "GRAVITY PAY GAP", "UNIONIZE THE UNIVERSE"
- [ ] Labels are readable (pixel font, neon green)

### FR-008–010: Sprite Redesigns

- [ ] Player ship renders as a briefcase silhouette (not the old ship)
- [ ] Player projectiles render as small white envelope shapes
- [ ] Alien projectiles render as small rectangles that visibly spin as they descend

### FR-011: Shield Steam Particles

- [ ] Fire a projectile at a coffee pot shield — small white/grey particles emit upward from the impact point
- [ ] Particles fade out within ~0.6 s
- [ ] Particles do not appear when Reduced Motion is enabled

### FR-012–014: Typography & UI Skin

- [ ] All text (menu, HUD, game over, pause) uses the "Press Start 2P" pixel font (or Courier New if offline)
- [ ] Score area appears as a bordered corporate dashboard panel (not plain text)
- [ ] HR jargon visible in UI labels (e.g., "HR SATISFACTION RATE", "KPIs", "SYNERGIES")

### FR-015–016: Alien Fire Rate

- [ ] Aliens fire noticeably less often than before the update
- [ ] After one alien fires, it observes a cooldown before firing again; no rapid-repeat shots from the same alien

### FR-017–018: Player Invincibility Window

- [ ] After being hit, the player ship blinks rapidly for ~1.5 seconds
- [ ] During the blink period, additional projectile hits do not remove a life
- [ ] After ~1.5 s, blinking stops and normal vulnerability resumes

### FR-019: Boss Pre-Sequence Highlight

- [ ] When entering a boss fight, before the sequence becomes interactive, all hit zones glow with an amber/yellow pulse for ~2 seconds
- [ ] After 2 seconds, zones return to normal and the sequence becomes interactive

### FR-020–021: HR Meeting Power-Up

- [ ] Defeat several unionist aliens — eventually an "HR" cyan icon drops
- [ ] Fly the player ship over the icon to collect it
- [ ] On collection: all aliens (and boss if present) freeze in place and a jingle plays
- [ ] After 3 seconds: aliens resume movement normally
- [ ] While frozen, aliens do not fire

### FR-022–024: Performance Review Alien

- [ ] Wait ~30 seconds into a wave — one alien turns visually red with a glow
- [ ] The red alien moves slightly faster than the formation
- [ ] Destroy the red alien — score awarded is double what a normal alien of that type would give
- [ ] Only one red alien at a time; no second alien turns red while one is already active

### FR-025–026: Employee of the Month Combo

- [ ] Land 5 consecutive hits without missing — player ship develops a golden glow
- [ ] Glow persists for ~3 seconds then fades
- [ ] Miss a shot (projectile exits top of canvas without hitting) — combo streak resets to zero
- [ ] Next 5 consecutive hits after a reset triggers the glow again

### FR-027–028: Quarterly Review Cutscene

- [ ] Complete a wave (all aliens cleared) — a cutscene screen appears before the boss
- [ ] Cutscene header reads "Q[n] PERFORMANCE REVIEW"
- [ ] Four animated KPI bars grow from left over ~1.5 s
- [ ] Bar labels use HR jargon (e.g., "UNION SUPPRESSION RATE", "SYNERGY ALIGNMENT")
- [ ] "[ SPACE ] SKIP" prompt visible from the first frame
- [ ] Pressing Space skips immediately to the boss phase

### FR-029–032: Audio

- [ ] Destroy an IT-dept alien → short high-pitched blip
- [ ] Destroy an Accounting-dept alien → coin-ping sound
- [ ] Destroy a Management-dept alien → low thud
- [ ] Enter boss fight → background music changes to a tense elevator music theme
- [ ] Collect HR Meeting power-up → short ascending jingle plays
- [ ] Lose all lives → sad trombone plays, followed by a brief HR voicemail-style sound

### FR-033–036: Accessibility

- [ ] Press Escape during gameplay → pause menu appears, game halts
- [ ] Main menu screen shows a visible controls reference panel
- [ ] Open pause menu → a "Reduced Motion" toggle is present
- [ ] Enable Reduced Motion → cityscape stops scrolling, steam particles do not appear, scanlines invisible
- [ ] Disable Reduced Motion → effects return on resume

---

## Performance Verification

- [ ] Run for 2+ minutes at full speed — browser DevTools Performance tab shows consistent 60 fps
- [ ] No memory leaks visible in DevTools Memory tab over 3 full game cycles (menu → play → gameover → menu)
- [ ] Particle array does not grow unboundedly — check in DevTools console: `state.particles.length` stays < 50 during peak shield-hit sequences

---

## Deployment

No build step required. Push the branch to any static hosting provider.

**GitHub Pages** (if configured):
```bash
git push origin 001-rebrand-visual-overhaul
# Merge to main via PR; GitHub Pages deploys automatically from main branch
```

**Quick local preview**:
```bash
npx serve .
# → http://localhost:3000
```
