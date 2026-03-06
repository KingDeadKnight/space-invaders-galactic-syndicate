# Entity Contracts: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Branch**: `001-rebrand-visual-overhaul` | **Date**: 2026-03-06

This document defines the public interface contracts for all entity modules that are **new** or **modified** in this feature. For each module, the exported functions are listed with their signatures, preconditions, postconditions, and side effects.

---

## `src/entities/powerup.js` *(NEW)*

### `createPowerup(x, y, type) → PowerUp`

- **Parameters**: `x` (number) — horizontal centre in logical px; `y` (number) — vertical centre in logical px; `type` (string) — only `'hr-meeting'` is defined in this feature.
- **Returns**: A new `PowerUp` plain object (see data-model.md §7).
- **Preconditions**: `x` and `y` are within the logical canvas bounds (0–480, 0–640). `type` is a valid power-up type string.
- **Postconditions**: The returned object has `active: true`, `vy: 40`, `width: 12`, `height: 12`.
- **Side effects**: None.

### `updatePowerup(powerup, dt) → void`

- **Parameters**: `powerup` (PowerUp); `dt` (number) — timestep in seconds.
- **Preconditions**: `powerup.active === true`.
- **Postconditions**: `powerup.y += powerup.vy * dt`. If `powerup.y > CANVAS_HEIGHT + 20`, sets `powerup.active = false`.
- **Side effects**: Mutates `powerup` in-place.

### `renderPowerup(ctx, powerup) → void`

- **Parameters**: `ctx` (CanvasRenderingContext2D); `powerup` (PowerUp).
- **Preconditions**: `powerup.active === true`.
- **Postconditions**: Draws a 12×12 cyan rectangle at `(powerup.x - 6, powerup.y - 6)` with `"HR"` text centred on it in red pixel font.
- **Side effects**: Mutates canvas state (all changes wrapped in `ctx.save()` / `ctx.restore()`).

---

## `src/entities/player.js` *(MODIFIED)*

### `createPlayer(canvasWidth, canvasHeight) → Player`

- **Returns**: Player object extended with `invincibilityTimer: 0` and `comboGlowTimer: 0`.
- **No other changes to signature or existing fields.**

### `updatePlayer(player, input, dt) → void`

- **Postconditions added**:
  - If `player.invincibilityTimer > 0`, decrements it by `dt`; clamps to 0.
  - If `player.comboGlowTimer > 0`, decrements it by `dt`; clamps to 0.
- **All existing movement/cooldown/slow logic unchanged.**

### `renderPlayer(ctx, player) → void`

- **Postconditions added**:
  - If `player.invincibilityTimer > 0` and `Math.floor(player.invincibilityTimer * 8) % 2 === 1`: returns early without drawing (blink pattern, ~8 Hz). Player ship is invisible on odd blink frames.
  - If `player.comboGlowTimer > 0`: sets `ctx.shadowColor = '#ffd700'` and `ctx.shadowBlur = 12` before drawing the sprite; restores on `ctx.restore()`.
  - **Player sprite updated**: briefcase pixel-art definition replaces previous design in `sprites.js` (see below).

---

## `src/entities/alien.js` *(MODIFIED)*

### `createAlien(x, y, theme) → Alien`

- **Returns**: Alien object extended with:
  - `protestSign: PROTEST_SLOGANS[Math.floor(Math.random() * PROTEST_SLOGANS.length)]`
  - `isPerformanceReview: false`
  - `speedMultiplier: 1.0`
  - `pointsMultiplier: 1.0`

### `renderAlien(ctx, alien) → void`

- **Postconditions added**:
  - Draws `alien.protestSign` text above the alien sprite in 6px pixel font, neon green.
  - If `alien.isPerformanceReview === true`: applies a red tint overlay (`ctx.globalCompositeOperation = 'source-atop'` fill over the sprite bounds) and adds `ctx.shadowColor = '#ff2244'; ctx.shadowBlur = 8`.
- **All existing animation logic unchanged.**

### `activatePerformanceReview(alien) → void` *(NEW export)*

- **Parameters**: `alien` (Alien to activate).
- **Preconditions**: `alien.active === true`.
- **Postconditions**: Sets `alien.isPerformanceReview = true`, `alien.speedMultiplier = 1.5`, `alien.pointsMultiplier = 2.0`.

### `deactivatePerformanceReview(alien) → void` *(NEW export)*

- **Parameters**: `alien` (Alien to deactivate).
- **Postconditions**: Sets `alien.isPerformanceReview = false`, `alien.speedMultiplier = 1.0`, `alien.pointsMultiplier = 1.0`.

---

## `src/entities/unionist.js` *(MODIFIED)*

### `updateUnionist(unionist, dt) → { shouldDropPowerup: boolean }`

- **Change**: Return value extended from `void` to `{ shouldDropPowerup: boolean }`.
- `shouldDropPowerup` is `true` exactly when the unionist transitions to `active = false` (i.e., hp reaches 0) on this tick **and** `Math.random() < POWERUP_DROP_CHANCE`.
- **Caller** (`game.js` update loop) reads `shouldDropPowerup` and calls `createPowerup(unionist.x, unionist.y, 'hr-meeting')` when true.

---

## `src/entities/boss.js` *(MODIFIED)*

### `createBoss(level) → Boss`

- **Returns**: Boss object extended with `preSequenceHighlightTimer: 0`.
- Called from `game.js` when `levelPhase` transitions to `BOSS`; immediately after creation, `game.js` sets `boss.preSequenceHighlightTimer = PRE_SEQUENCE_HIGHLIGHT_S`.

### `renderBoss(ctx, boss) → void`

- **Postconditions added**:
  - If `boss.preSequenceHighlightTimer > 0`: all hit zones rendered with an amber pulsing outline (`ctx.strokeStyle = '#ffaa00'`; alpha modulated by `0.5 + 0.5 * Math.sin(boss.preSequenceHighlightTimer * 10)`). Hit zones are not interactable until timer expires.

---

## `src/entities/projectile.js` *(MODIFIED)*

### `createFlyerProjectile(x, y, level) → Projectile`

- **Returns**: Projectile extended with `rotation: 0` and `rotationSpeed: 4.0` (radians/s).

### `updateProjectile(projectile, dt) → void`

- **Postconditions added**: if `projectile.owner === 'alien'`: `projectile.rotation += projectile.rotationSpeed * dt`.

### `renderProjectile(ctx, projectile) → void`

- **Postconditions updated**:
  - Flyer (alien): renders a spinning red rectangle drawn at `projectile.rotation` radians using `ctx.translate` + `ctx.rotate`. Sprite approximately 6×8 px, red fill (`#ff2244`), slight rounded corners.
  - Job offer (player): renders as a small white envelope shape (open flap, 4×6 px logical).
  - All transforms wrapped in `ctx.save()` / `ctx.restore()`.

---

## `src/entities/sprites.js` *(MODIFIED)*

Updated sprite definitions (2D colour arrays, same structure as original):

| Sprite | Key | Change |
|--------|-----|--------|
| Player ship | `SPRITES.player` | Replace with a 15×10 briefcase silhouette (brown body, handle arc, latch detail) |
| Job offer (player projectile) | `SPRITES.jobOffer` | Replace with a 4×6 white envelope (V-shaped flap line) |

> Protest flyer (alien projectile) uses dynamic rotation (`ctx.rotate`) rather than a SPRITES array entry — a plain filled rectangle is sufficient and avoids a per-angle sprite sheet.
