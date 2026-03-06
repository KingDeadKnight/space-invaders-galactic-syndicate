# Module Contracts: Systems & Core

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06

---

## `src/main.js`

Entry point. No exported functions — this module bootstraps the game and is loaded via `<script type="module">` in `index.html`. Responsibilities:

1. Obtain the `<canvas>` element and initialise the rendering context via `initCanvas()`
2. Call `initGame()` to build initial `GameState`
3. Register `keydown` / `keyup` event listeners; update `InputState` in place
4. Start the `requestAnimationFrame` loop
5. On first user input (keydown), call `audioManager.resume()` to unblock `AudioContext`

---

## `src/game.js`

### `initGame(canvasWidth, canvasHeight) → GameState`

Constructs and returns the initial `GameState` with phase `'MENU'`.

---

### `startGame(state) → void`

Transitions `state.phase` to `'PLAYING'`, builds Level 1 alien formation and shields, resets score and player.

---

### `pauseGame(state) → void`

Transitions `state.phase` to `'PAUSED'`.

---

### `resumeGame(state) → void`

Transitions `state.phase` back to `'PLAYING'`. Must be called with the last rAF timestamp to reset the loop delta accumulator.

---

### `advanceLevel(state) → void`

Increments `state.level`; if `state.level > 3` transitions to `'WIN'`, otherwise builds the next level's alien formation, replaces shields, and applies new `LevelConfig` parameters.

---

### `triggerBoss(state) → void`

Transitions `state.levelPhase` from `'WAVE'` to `'BOSS'`; creates a `Boss` entity on `state.boss`.

---

### `gameOver(state) → void`

Transitions `state.phase` to `'GAMEOVER'`.

---

### `restartGame(state, canvasWidth, canvasHeight) → void`

Resets `state` to initial `MENU` conditions (equivalent to a fresh `initGame` result applied in-place).

---

### `updateGame(state, dt) → void`

Master update function. Called once per fixed timestep tick while `state.phase === 'PLAYING'`.

Internally calls (in order):
1. `updatePlayer(state.player, state.input, dt)`
2. Fire job offer if `input.fire` and cooldown allows → push to `state.projectiles`
3. `updateAliens(state, dt)` (formation movement, flyer firing)
4. `updateBoss(state.boss, dt)` if `state.levelPhase === 'BOSS'`
5. `updateProjectiles(state.projectiles, dt, canvasHeight)`
6. `updateShields(state.shields, dt)`
7. `processCollisions(state)`
8. Check win/lose conditions

---

## `src/canvas.js`

### `initCanvas(canvasEl) → CanvasRenderingContext2D`

Performs one-time canvas setup: sets `width`/`height`, applies CSS `image-rendering: pixelated`, and returns the 2D context.

| Parameter | Type | Description |
|-----------|------|-------------|
| `canvasEl` | `HTMLCanvasElement` | The target canvas element |

---

### `render(ctx, state) → void`

Main render function. Clears the canvas and delegates to sub-render functions based on `state.phase`:

- `MENU`: render title screen and start prompt
- `PLAYING` / `PAUSED`: render background, shields, aliens/boss, player, projectiles, HUD, pause overlay
- `GAMEOVER`: render game-over screen
- `WIN`: render win screen

---

### `renderHUD(ctx, state) → void`

Draws the in-game HUD: HR Satisfaction Rate (score), Employee Engagement Bonus multiplier, remaining lives, and current level.

---

## `src/systems/collision.js`

### `checkAABB(a, b) → boolean`

Returns `true` if two axis-aligned bounding boxes overlap.

| Parameter | Type | Description |
|-----------|------|-------------|
| `a` | `{ x, y, width, height }` | First entity (centre-anchored position) |
| `b` | `{ x, y, width, height }` | Second entity (centre-anchored position) |

> Position is treated as the entity's centre. Half-extents are computed internally: `left = x - width/2`, etc.

---

### `processCollisions(state) → void`

Runs all game collision checks for the current frame. Mutates `state` in-place.

**Checks performed** (in order):
1. Job offer vs alien → `hitAlien(alien)` or `hitUnionist(unionist)`; deactivate projectile; update score
2. Job offer vs boss (zone hit) → `hitBoss(boss, zoneIndex)` if projectile x aligns with a zone; deactivate projectile
3. Job offer vs top boundary → already handled in `updateProjectile`, but verified here as safety
4. Flyer vs shield → `damageShield(shield)`; deactivate projectile
5. Flyer vs player → `applySlowDebuff(player)`; `resetCombo(score)`; deactivate projectile; decrement lives if `FLYER_KILLS_ON_DIRECT_HIT` (implementation decision)
6. Alien vs bottom boundary → `gameOver(state)`

> Deactivated entities (`active = false`) are filtered out of their arrays at end of `processCollisions`.

---

## `src/systems/scoring.js`

### `createScore() → Score`

Returns an initial `Score` object with `points = 0`, `comboMultiplier = 1`, `consecutiveHits = 0`.

---

### `addPoints(score, entityType) → void`

Adds points for a convinced alien or boss defeat. Increments combo.

| Parameter | Type | Description |
|-----------|------|-------------|
| `score` | `Score` | Score singleton (mutated in-place) |
| `entityType` | `string` | `'regular'` / `'unionist'` / `'boss'` — determines base point value |

---

### `resetCombo(score) → void`

Resets `score.consecutiveHits` to 0 and `score.comboMultiplier` to 1.

---

### `getComboMultiplier(score) → number`

Returns the current multiplier. Pure function (no mutation).

---

## `src/systems/levels.js`

### `getLevelConfig(levelNum) → LevelConfig`

Returns the `LevelConfig` value object for the given level (1, 2, or 3).

---

### `buildAlienFormation(levelConfig, canvasWidth) → Alien[]`

Creates and returns a flat array of `Alien` / `Unionist` objects laid out in the formation grid according to `levelConfig`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `levelConfig` | `LevelConfig` | Config for the current level |
| `canvasWidth` | `number` | Used to centre the formation |

Each alien is positioned with uniform `ALIEN_SPACING_X` / `ALIEN_SPACING_Y` gaps. Unionists appear in the bottom 1–2 rows (ratio controlled by `levelConfig.regularRatio`).

---

### `updateFormationMovement(aliens, formationState, dt, canvasWidth) → void`

Advances the formation's horizontal sweep. On reaching either canvas edge, shifts the entire formation down one step and reverses direction. Mutates each alien's `x` and `y` in-place.

| Parameter | Type | Description |
|-----------|------|-------------|
| `aliens` | `Alien[]` | Active alien array |
| `formationState` | `FormationState` | `{ direction, speed, stepTimer }` — mutable state object |
| `dt` | `number` | Timestep (s) |
| `canvasWidth` | `number` | For edge detection |

---

### `FormationState` (shape)

```
{
  direction: number,   // 1 = right, -1 = left
  speed: number,       // Current px/s (increases as aliens are cleared)
  pendingStep: boolean // True when a wall has been hit and a y-step is pending
}
```

---

## `src/audio/soundManager.js`

### `initAudio() → AudioManager`

Creates the `AudioContext`, builds the lofi music scheduler, and returns an `AudioManager` handle. Does **not** start playback (deferred until user gesture).

---

### `resumeContext(audioManager) → void`

Calls `audioManager.ctx.resume()` — must be called on first user gesture to comply with browser autoplay policy.

---

### `startBGM(audioManager) → void`

Starts the look-ahead scheduler and begins lofi music playback.

---

### `stopBGM(audioManager) → void`

Cancels the scheduler interval. Ramps master gain to 0 to silence without clicks.

---

### `toggleMute(audioManager) → boolean`

Toggles mute state. Returns `true` if now muted, `false` if now playing.

| When muting | ramps master `GainNode` to 0 |
| When unmuting | ramps master `GainNode` back to nominal level |

---

### `playSFX(audioManager, type) → void`

Plays a one-shot sound effect.

| `type` | Event |
|--------|-------|
| `'hit'` | Alien takes a hit |
| `'convince'` | Alien convinced (removed) |
| `'playerHit'` | Player struck by flyer |
| `'bossCorrect'` | Correct boss zone hit |
| `'bossWrong'` | Wrong boss zone hit |
| `'bossDefeated'` | Boss defeated |
| `'levelComplete'` | Level cleared |
| `'gameOver'` | Game over |
| `'win'` | All levels cleared |

---

### `AudioManager` (shape — internal, documented for transparency)

```
{
  ctx: AudioContext,
  masterGain: GainNode,
  schedulerInterval: number | null,  // setInterval handle
  muted: boolean,
  nextNoteTime: number               // AudioContext.currentTime of next scheduled note
}
```
