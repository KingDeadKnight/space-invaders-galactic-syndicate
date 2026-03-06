# System Contracts: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Branch**: `002-rebrand-visual-overhaul` | **Date**: 2026-03-06

This document defines the public interface contracts for all system modules that are **new** or **modified** in this feature.

---

## `src/systems/particles.js` *(NEW)*

### `createParticle(x, y, vx, vy, life, color, size) → Particle`

- **Parameters**: all matching the Particle schema in data-model.md §8.
- **Returns**: A new Particle plain object with `maxLife = life`.
- **Side effects**: None.

### `emitSteamParticles(shield, particles) → void`

- **Parameters**: `shield` (Shield object — provides x/y position); `particles` (Particle[] — the shared state array).
- **Postconditions**: Pushes 5 new Particle objects into `particles[]`. Each has:
  - `x` = `shield.x + (Math.random() - 0.5) * shield.width`
  - `y` = `shield.y - shield.height / 2`
  - `vx` = `(Math.random() - 0.5) * 40` px/s
  - `vy` = `-(40 + Math.random() * 50)` px/s
  - `life` = `0.5 + Math.random() * 0.3` s
  - `color` = `'#bbbbcc'`
  - `size` = `1 + Math.round(Math.random())` (1 or 2 px)
- **Side effects**: Mutates `particles[]` in-place (push).

### `updateParticles(particles, dt) → void`

- **Parameters**: `particles` (Particle[] — mutated in-place); `dt` (number) — timestep in seconds.
- **Postconditions**:
  - For each particle: `x += vx * dt`, `y += vy * dt`, `life -= dt`.
  - Particles with `life <= 0` are marked for removal.
  - Dead particles are spliced out of the array in a single pass after all updates.
- **Side effects**: Mutates each particle and the array in-place.

### `renderParticles(ctx, particles) → void`

- **Parameters**: `ctx` (CanvasRenderingContext2D); `particles` (Particle[]).
- **Postconditions**: For each particle, draws a filled rectangle of `size × size` at `(particle.x, particle.y)` with `ctx.globalAlpha = particle.life / particle.maxLife` (linear fade-out). All changes wrapped in `ctx.save()` / `ctx.restore()`.
- **Side effects**: Mutates canvas state (wrapped in save/restore).
- **Note**: Skipped entirely when `state.reducedMotion === true` (caller passes the flag).

---

## `src/systems/cutscene.js` *(NEW)*

### `createCutsceneState(score, level) → CutsceneState`

- **Parameters**: `score` (Score object from scoring.js); `level` (number 1–3).
- **Returns**: A new CutsceneState plain object (see data-model.md §9).
- **Postconditions**: `stats[]` is populated with four KPI bars derived from `score` and `level` as specified in data-model.md §9 KPI Value Derivation table.
- **Side effects**: None.

### `updateCutscene(cutsceneState, dt, input) → boolean`

- **Parameters**: `cutsceneState` (CutsceneState); `dt` (number) — timestep in seconds; `input` (Input object from game state).
- **Returns**: `true` when the cutscene is complete (either timer elapsed or skipped); `false` while still running.
- **Postconditions**:
  - `cutsceneState.timer += dt`.
  - `cutsceneState.barProgress = Math.min(1.0, cutsceneState.timer / 1.5)` — bars fully grown after 1.5 s.
  - If `input.fire === true` or `cutsceneState.timer >= cutsceneState.duration`: sets `cutsceneState.skipped = true`; returns `true`.
- **Side effects**: Mutates `cutsceneState` in-place.

### `renderCutscene(ctx, cutsceneState) → void`

- **Parameters**: `ctx` (CanvasRenderingContext2D); `cutsceneState` (CutsceneState).
- **Postconditions**: Renders overlay on dark background:
  1. Header: `"Q[level] PERFORMANCE REVIEW"` in pixel font, corporate blue colour.
  2. Four KPI bars: label above, filled `fillRect` bar of width proportional to `value * barProgress`, coloured per `KPIBar.color`.
  3. Skip prompt: `"[ SPACE ] SKIP"` in dim grey at bottom-centre, visible from frame 1.
- **All drawing wrapped in `ctx.save()` / `ctx.restore()`.**

---

## `src/systems/collision.js` *(MODIFIED)*

### Changes to `processCollisions(state) → void`

Three additions:

**1. Power-up pickup detection** (FR-020/FR-021):
- After existing projectile/alien/player collision passes, loop `state.powerups[]`.
- For each active powerup: AABB check against `state.player`.
- On overlap: set `powerup.active = false`, set `state.hrFreezeTimer = HR_FREEZE_DURATION`, call `_audioManager.playJingle()`.

**2. Player invincibility guard** (FR-017):
- Before applying damage to player from flyer hit: check `state.player.invincibilityTimer > 0`.
- If true: skip damage but still deactivate the projectile.
- If false: apply damage as before, then set `state.player.invincibilityTimer = INVINCIBILITY_DURATION`.

**3. Combo miss on player projectile out-of-bounds** (FR-026):
- Existing out-of-bounds check for player projectiles exiting `y < 0` (top of canvas).
- **New**: call `resetCombo(state.score)` when this triggers (projectile exited without hitting anything — i.e., a miss).
- A projectile that hits an alien and is deactivated in the same frame does not trigger miss reset (order: collision check before out-of-bounds check).

---

## `src/systems/scoring.js` *(MODIFIED)*

### `addPoints(score, entityType, multiplier = 1.0) → void`

- **Signature change**: optional third parameter `multiplier` (number, default `1.0`).
- **Behaviour**: `score.points += POINTS[entityType] * score.comboMultiplier * multiplier`.
- **Caller responsibility**: Pass `alien.pointsMultiplier` when any alien is destroyed.

### `resetCombo(score) → void` *(unchanged signature, extended call sites)*

- Called from `collision.js` in two places:
  1. When player is hit (existing behaviour).
  2. When player projectile exits canvas top without hitting a target (new — FR-026).

### New export: `EMPLOYEE_OF_MONTH_THRESHOLD = 5`

- Consumed by `game.js` update loop to check `score.consecutiveHits % EMPLOYEE_OF_MONTH_THRESHOLD === 0 && score.consecutiveHits > 0` → trigger `player.comboGlowTimer = COMBO_GLOW_DURATION`.

---

## `src/systems/levels.js` *(MODIFIED)*

### `getLevelConfig(level) → LevelConfig`

- **Change**: `flyerBaseCooldown` value changed from `5.0` to `8.3` for all levels.
- No other changes to return shape or other fields.

### Phase transition: CUTSCENE insertion

- In `game.js` update loop (not in `levels.js` directly): on `levelPhase === 'WAVE'` → all aliens cleared:
  - Set `state.phase = 'CUTSCENE'`
  - Set `state.cutsceneState = createCutsceneState(state.score, state.level)`
- On `updateCutscene()` returning `true`:
  - Clear `state.cutsceneState`
  - Set `state.phase = 'PLAYING'`, `state.levelPhase = 'BOSS'`
  - Proceed to boss spawn

> This replaces the existing `transitionTimer`-based direct WAVE→BOSS transition when a boss exists.

---

## `src/canvas.js` *(MODIFIED)*

### New export: `resizeCanvas(canvasEl) → void`

- **Parameters**: `canvasEl` (HTMLCanvasElement).
- **Postconditions**:
  - Computes `scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT)`.
  - Sets `canvasEl.style.width = (CANVAS_WIDTH * scale) + 'px'` and `canvasEl.style.height = (CANVAS_HEIGHT * scale) + 'px'`.
- **Called from**: `main.js` on load and in `window.addEventListener('resize', ...)`.

### Changes to `render(ctx, state) → void`

- New `case 'CUTSCENE'`: calls `renderCutscene(ctx, state.cutsceneState)`.
- New `case 'PAUSED'`: renders playing state then pause overlay; pause overlay now includes Reduced Motion toggle UI.
- All phases: `_renderScanlines(ctx)` called last (skipped if `state.reducedMotion === true`).
- `_renderBackground(ctx, theme)` extended: calls `_renderCityscape(ctx, state.reducedMotion)` after sky fill.
- `renderParticles(ctx, state.particles)` called after shields render, before aliens render.

### New private helpers

| Helper | Purpose |
|--------|---------|
| `_renderCityscape(ctx, reducedMotion)` | Draws scrolling dark building silhouettes; scroll stopped if `reducedMotion` |
| `_renderScanlines(ctx)` | Semi-transparent scanline stripe overlay across full canvas |
| `_renderPauseOverlay(ctx, state)` | Extended with Reduced Motion toggle button |

---

## `src/main.js` *(MODIFIED)*

### Resize handler

```js
window.addEventListener('resize', () => resizeCanvas(canvasEl));
resizeCanvas(canvasEl); // called once on load after initCanvas
```

### Escape key input mapping

- `keydown` handler: `if (key === 'escape') { /* trigger pauseGame (same as 'p') */ }` — added alongside existing P key mapping.

---

## `src/audio/soundManager.js` *(MODIFIED)*

### New public methods

| Method | Trigger | Description |
|--------|---------|-------------|
| `playAlienDestroyed(theme)` | Alien destroyed | Plays per-theme SFX: `'it'` → high blip; `'accounting'` → coin ping; `'management'` → low thud; `'unionist'` → buzzer; `'boss'` → noise burst (R-011) |
| `startBossTheme()` | `levelPhase → BOSS` | Starts elevator music loop (replaces lofi theme for boss duration) |
| `stopBossTheme()` | Boss defeated | Stops elevator music; resumes lofi |
| `playJingle()` | Power-up collected | One-shot ascending major-third fanfare (~0.3 s) |
| `playGameOver()` | Game over trigger | Schedules sad trombone (~2.5 s) then HR voicemail (~2 s) sequentially |

### Existing methods — unchanged contracts

`start()`, `stop()`, `toggleMute()` — no changes to signatures or behaviour.
