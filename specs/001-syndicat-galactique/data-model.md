# Data Model: Syndicat Galactique

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06

---

## Overview

All entities are plain JavaScript objects (no classes required — KISS principle). Each entity is created by a factory function that returns an object literal with all fields initialised to their starting values. State mutations happen in-place on the object within `update()` functions.

---

## Entity: `Player` (HR Manager)

The player-controlled ship at the bottom of the canvas.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `x` | `number` | canvas center | Horizontal centre position (px) |
| `y` | `number` | canvas height − 48 | Vertical position (px), fixed row |
| `width` | `number` | 32 | Sprite bounding width (px at 1× scale) |
| `height` | `number` | 24 | Sprite bounding height (px at 1× scale) |
| `baseSpeed` | `number` | 180 | Normal movement speed (px/s) |
| `speed` | `number` | 180 | Current movement speed; reduced during slow debuff |
| `slowDebuffTimer` | `number` | 0 | Remaining slow debuff duration (s); 0 = not slowed |
| `slowMultiplier` | `number` | 0.4 | Speed multiplier while slowed (40% of base) |
| `lives` | `number` | 3 | Remaining lives |
| `shotCooldown` | `number` | 0 | Frames remaining before next shot is allowed |
| `shotCooldownMax` | `number` | 0.25 | Minimum time between shots (s) |
| `active` | `boolean` | `true` | False when all lives lost |

**State transitions**:
- Hit by protest flyer → `slowDebuffTimer = SLOW_DURATION` (e.g. 2.5 s); speed set to `baseSpeed * slowMultiplier`
- `slowDebuffTimer` counts down each `update(dt)`; when ≤ 0 → `speed` restored to `baseSpeed`
- Lives decremented when alien breaches boundary or player is hit (by definition of lives mechanic per spec)

---

## Entity: `Alien` (Regular)

A grid enemy requiring 1 hit to convince. Base type; Hardened Unionist extends this shape.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `x` | `number` | formation position | Horizontal centre (px) |
| `y` | `number` | formation position | Vertical centre (px) |
| `width` | `number` | 24 | Bounding width (px at 1×) |
| `height` | `number` | 20 | Bounding height (px at 1×) |
| `type` | `string` | `'regular'` | `'regular'` or `'unionist'` |
| `theme` | `string` | level theme | `'it'` / `'accounting'` / `'management'` |
| `hp` | `number` | 1 | Hit points remaining |
| `maxHp` | `number` | 1 | Max HP (used to compute mood bar fraction) |
| `mood` | `number` | 100 | Mood value 0–100; decreases on hit |
| `moodState` | `string` | `'angry'` | `'angry'` / `'cautious'` / `'convinced'` |
| `frameIndex` | `number` | 0 | Current animation frame index |
| `frameTimer` | `number` | 0 | Elapsed time since last frame advance (s) |
| `animFps` | `number` | 4 | Protest sign animation frames per second |
| `active` | `boolean` | `true` | False when convinced (hp = 0) |
| `flyerCooldown` | `number` | random | Time (s) until this alien fires next flyer |

**Mood state transitions** (Regular Alien — 1 hp):
- HP hits 0 → `moodState = 'convinced'`, `active = false`

**Mood bar rendering**: `moodFraction = mood / 100` → rendered as a small pixel bar above the sprite

---

## Entity: `Unionist` (Hardened Unionist)

Extends the `Alien` shape with 3 HP and a fist-shake animation state.

Same fields as `Alien`, with the following overrides/additions:

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `type` | `string` | `'unionist'` | Discriminator |
| `hp` | `number` | 3 | Requires 3 hits |
| `maxHp` | `number` | 3 | Used for mood bar fraction |
| `mood` | `number` | 100 | Full mood at start |
| `fistShaking` | `boolean` | `false` | True while fist-shake animation is playing |
| `fistShakeTimer` | `number` | 0 | Remaining duration of fist-shake anim (s) |

**Mood state transitions**:
- hp = 3 → `moodState = 'angry'`, `mood = 100`
- hp = 2 → `moodState = 'angry'`, `mood = 66`, `fistShaking = true`
- hp = 1 → `moodState = 'cautious'`, `mood = 33`, `fistShaking = true`
- hp = 0 → `moodState = 'convinced'`, `active = false`

---

## Entity: `Boss` (The Negotiator)

Level-end unique enemy. Appears after all regular aliens in a level are cleared.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `x` | `number` | canvas center | Horizontal centre (px) |
| `y` | `number` | 64 | Vertical start position (px) |
| `width` | `number` | 48 | Bounding width (px at 1×) |
| `height` | `number` | 40 | Bounding height (px at 1×) |
| `hp` | `number` | from level config | Total hits required (equals `sequenceRequired.length`) |
| `sequenceRequired` | `number[]` | generated per level | Ordered array of zone indices (0=left, 1=center, 2=right) |
| `sequenceProgress` | `number` | 0 | Index into `sequenceRequired`; progress through sequence |
| `sequenceTimer` | `number` | SEQUENCE_TIMEOUT | Remaining time (s) to complete sequence before reset |
| `zoneFlashState` | `string` | `'idle'` | `'idle'` / `'correct'` / `'wrong'` — controls hit flash VFX |
| `zoneFlashTimer` | `number` | 0 | Remaining duration of flash VFX (s) |
| `speed` | `number` | from level config | Horizontal movement speed (px/s) |
| `direction` | `number` | 1 | 1 = right, −1 = left |
| `flyerCooldown` | `number` | 2.0 | Time (s) until next flyer (boss fires too per FR-016) |
| `active` | `boolean` | `true` | False when sequence fully completed |
| `level` | `number` | current level | 1, 2, or 3; affects sequence length |

**Sequence behaviour**:
- Correct zone hit → `sequenceProgress++`; if `sequenceProgress === sequenceRequired.length` → `active = false` (boss defeated)
- Wrong zone hit → `sequenceProgress = 0`, `sequenceTimer` reset, `zoneFlashState = 'wrong'`
- Timer elapses → `sequenceProgress = 0`, `sequenceTimer` reset

**Sequence length by level**: Level 1 → 3 zones; Level 2 → 4 zones; Level 3 → 5 zones

---

## Entity: `Projectile` (Job Offer / Protest Flyer)

Shared shape for both player and alien projectiles; discriminated by `owner`.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `x` | `number` | source entity x | Horizontal centre (px) |
| `y` | `number` | source entity y | Vertical centre (px) |
| `width` | `number` | 4 | Bounding width (px at 1×) |
| `height` | `number` | 8 | Bounding height (px at 1×) |
| `vy` | `number` | negative (up) or positive (down) | Vertical velocity (px/s); negative = job offer, positive = flyer |
| `owner` | `string` | `'player'` or `'alien'` | Discriminates hit logic |
| `active` | `boolean` | `true` | False when off-screen or on collision |

**Velocity constants**:
- Job offer: `vy = −400 px/s` (upward)
- Protest flyer: `vy = +180 px/s` baseline; increases with level (Level 2: +220, Level 3: +260 px/s)

---

## Entity: `Shield` (Coffee Pot)

A defensive object placed between the player and the alien grid.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `x` | `number` | fixed position | Horizontal centre (px) |
| `y` | `number` | fixed position | Vertical centre (px) |
| `width` | `number` | 32 | Bounding width (px at 1×) |
| `height` | `number` | 24 | Bounding height (px at 1×) |
| `durability` | `number` | 4 | Hit points before destruction (also used as stage index) |
| `maxDurability` | `number` | 4 | Used to compute degradation stage |
| `degradeTimer` | `number` | SHIELD_DEGRADE_INTERVAL | Time (s) until next passive degradation tick |
| `active` | `boolean` | `true` | False when `durability` reaches 0 |

**Degradation stages** (matches sprite frames):
- Stage 4 (full) → Stage 3 (first crack) → Stage 2 (half degraded) → Stage 1 (badly cracked) → Stage 0 (destroyed)
- Each hit: `durability--`; if `durability === 0` → `active = false`
- Passive timer (`FR-010`): every `SHIELD_DEGRADE_INTERVAL` seconds `durability--` if `durability > 0`

**Number of shields**: 4 (evenly spaced across the canvas width)

---

## Entity: `Score` (HR Satisfaction Rate)

A singleton object tracking points and combo state.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `points` | `number` | 0 | Total points earned |
| `comboMultiplier` | `number` | 1 | Employee Engagement Bonus multiplier; increments on consecutive hits |
| `consecutiveHits` | `number` | 0 | Internal counter used to drive multiplier |

**Multiplier rules**:
- Each alien convinced without being hit → `consecutiveHits++`; `comboMultiplier = 1 + floor(consecutiveHits / 5)` (increments every 5 consecutive hits, up to a max of 8×)
- Player hit by protest flyer → `consecutiveHits = 0`, `comboMultiplier = 1`
- Points per regular alien: `BASE_POINTS * comboMultiplier` (BASE_POINTS = 10)
- Points per unionist: `BASE_POINTS * 3 * comboMultiplier`
- Points per boss sequence completion: `BASE_POINTS * 50 * comboMultiplier`

---

## Value Object: `LevelConfig`

Configuration object returned by `getLevelConfig(levelNum)`.

| Field | Type | Description |
|-------|------|-------------|
| `levelNum` | `number` | 1, 2, or 3 |
| `theme` | `string` | `'it'` / `'accounting'` / `'management'` |
| `alienRows` | `number` | Number of alien rows (Level 1: 4, Level 2: 5, Level 3: 5) |
| `alienCols` | `number` | Number of alien columns (Level 1: 8, Level 2: 9, Level 3: 10) |
| `regularRatio` | `number` | Fraction of grid that is regular aliens (remaining = unionists) |
| `alienBaseSpeed` | `number` | Starting alien horizontal speed (px/s) |
| `alienSpeedIncrement` | `number` | Speed added each time a row moves down (px/s) |
| `flyerFrequency` | `number` | Multiplier on individual alien flyer cooldown (lower = more frequent) |
| `bossSequenceLength` | `number` | Number of zones in boss hit sequence |
| `bossSpeed` | `number` | Boss horizontal movement speed (px/s) |

---

## State Machine: `GameState`

Top-level game state held in `game.js`.

```
MENU ──[Start]──► PLAYING ──[all lives lost / aliens breach]──► GAMEOVER
                    │                                               │
                    ▼                                               │
                 PAUSED ──[Resume]──► PLAYING                      │
                    │                                               ▼
                    └──────────────────────────────────────────► MENU
                                                                (Restart)
PLAYING ──[all 3 levels + bosses cleared]──► WIN
WIN ──[Restart]──► MENU
```

**GameState object fields**:

| Field | Type | Description |
|-------|------|-------------|
| `phase` | `string` | `'MENU'` / `'PLAYING'` / `'PAUSED'` / `'GAMEOVER'` / `'WIN'` |
| `level` | `number` | Current level (1–3) |
| `levelPhase` | `string` | `'WAVE'` (aliens active) / `'BOSS'` (boss fight) / `'TRANSITION'` |
| `player` | `Player` | Single player entity |
| `aliens` | `Alien[]` | Active alien grid (flattened array) |
| `boss` | `Boss \| null` | Active boss entity or null |
| `projectiles` | `Projectile[]` | All active projectiles (player + alien) |
| `shields` | `Shield[]` | Active shield entities |
| `score` | `Score` | Score singleton |
| `input` | `InputState` | Current keyboard state snapshot |

---

## Value Object: `InputState`

Snapshot of keyboard state, polled each frame.

| Field | Type | Description |
|-------|------|-------------|
| `left` | `boolean` | Left arrow or A key held |
| `right` | `boolean` | Right arrow or D key held |
| `fire` | `boolean` | Spacebar held/pressed |
| `pause` | `boolean` | P or Escape — edge-triggered |
| `mute` | `boolean` | M key — edge-triggered |

---

## Constants Summary

| Constant | Value | Unit | Notes |
|----------|-------|------|-------|
| `CANVAS_WIDTH` | 480 | px | Logical canvas width |
| `CANVAS_HEIGHT` | 640 | px | Logical canvas height |
| `PIXEL_SCALE` | 3 | — | CSS upscale factor |
| `FIXED_STEP_S` | 1/60 | s | Game loop fixed timestep |
| `SLOW_DURATION` | 2.5 | s | Protest flyer slow debuff duration |
| `SLOW_MULTIPLIER` | 0.4 | — | Fraction of base speed while slowed |
| `SHIELD_DEGRADE_INTERVAL` | 8.0 | s | Seconds between passive shield ticks |
| `SEQUENCE_TIMEOUT` | 5.0 | s | Boss sequence reset timer |
| `BASE_POINTS` | 10 | pts | Base score per regular alien |
| `PLAYER_LIVES` | 3 | — | Starting lives |
| `SHOT_COOLDOWN` | 0.25 | s | Minimum time between player shots |
