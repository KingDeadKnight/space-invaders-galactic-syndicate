# Data Model: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Branch**: `002-rebrand-visual-overhaul` | **Date**: 2026-03-06

This document defines all entity shapes and game-state extensions introduced or modified by this feature. Fields added to existing entities are marked **[NEW]**. Unchanged fields are omitted unless needed for context.

---

## 1. GameState — Extended Fields

`initGame()` in `src/game.js` returns the GameState object. The following fields are **new** in this feature:

```js
{
  // Existing fields (unchanged)
  phase: 'MENU' | 'PLAYING' | 'PAUSED' | 'CUTSCENE' | 'GAMEOVER' | 'WIN', // [NEW] 'CUTSCENE' added
  // ...

  // [NEW] Player invincibility
  // No field on GameState — carried on player object (see §2)

  // [NEW] HR Meeting power-up freeze
  hrFreezeTimer: 0,            // number — seconds remaining on alien freeze (0 = inactive)

  // [NEW] Performance Review alien
  performanceReviewTimer: 0,   // number — countdown until next Performance Review event (s)
                               //          reset to PERF_REVIEW_INTERVAL (30) each time it fires
  performanceReviewAlienIndex: null, // number|null — index into state.aliens[] of current
                                    //               Performance Review alien; null = none active

  // [NEW] Power-up collectibles
  powerups: [],                // PowerUp[] — active power-up items on screen

  // [NEW] Particles
  particles: [],               // Particle[] — active particle instances (steam, glow effects)

  // [NEW] Combo glow timer — no field on GameState; carried on player object (see §2)

  // [NEW] Reduced motion preference
  reducedMotion: false,        // boolean — disables parallax + particles when true

  // [NEW] Cutscene state
  cutsceneState: null,         // CutsceneState|null — null outside CUTSCENE phase
}
```

### New GameState Constants (in `game.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `INVINCIBILITY_DURATION` | `1.5` | Seconds of post-hit player invincibility (FR-017) |
| `HR_FREEZE_DURATION` | `3.0` | Seconds all aliens freeze on HR Meeting pickup (FR-021) |
| `PERF_REVIEW_INTERVAL` | `30.0` | Seconds between Performance Review alien triggers (FR-022) |
| `COMBO_GLOW_DURATION` | `3.0` | Seconds the Employee of the Month glow persists (FR-025) |
| `POWERUP_DROP_CHANCE` | `0.20` | Probability a defeated unionist drops an HR Meeting power-up (FR-020) |
| `PRE_SEQUENCE_HIGHLIGHT_S` | `2.0` | Seconds boss hit zones are highlighted before sequence opens (FR-019) |

---

## 2. Player — Updated Schema

`createPlayer()` in `src/entities/player.js`:

```js
{
  // Existing fields (unchanged)
  x, y, width, height, baseSpeed, speed,
  slowDebuffTimer, slowMultiplier,
  lives, shotCooldown, shotCooldownMax,
  active, frameIndex, frameTimer,

  // [NEW] Invincibility window
  invincibilityTimer: 0,   // number — seconds remaining (0 = vulnerable); set to
                           //          INVINCIBILITY_DURATION on hit (FR-017)

  // [NEW] Employee of the Month glow
  comboGlowTimer: 0,       // number — seconds remaining for golden glow visual (FR-025)
                           //          set to COMBO_GLOW_DURATION when consecutiveHits = 5
}
```

### Player State Transitions

```
[vulnerable] --hit--> [invincible: invincibilityTimer = 1.5s]
                            |
                     timer reaches 0
                            |
                       [vulnerable]
```

```
[no glow] --5 consecutive hits--> [glowing: comboGlowTimer = 3.0s]
                                          |
                                    timer reaches 0
                                          |
                                       [no glow]
```

---

## 3. Alien — Updated Schema

`createAlien()` in `src/entities/alien.js`:

```js
{
  // Existing fields (unchanged)
  x, y, width, height, type, theme,
  hp, maxHp, mood, moodState,
  frameIndex, frameTimer, animFps,
  active, flyerCooldown,

  // [NEW] Protest sign slogan
  protestSign: '',         // string — one of PROTEST_SLOGANS[], randomly assigned at creation (FR-007)

  // [NEW] Performance Review overlay
  isPerformanceReview: false, // boolean — true when this alien is the current Performance Review alien
  speedMultiplier: 1.0,       // number — 1.5 when isPerformanceReview = true; applied to
                              //          formation speed in levels.js movement update
  pointsMultiplier: 1.0,      // number — 2.0 when isPerformanceReview = true; read by addPoints (FR-024)
}
```

### Protest Sign Slogan Pool (`PROTEST_SLOGANS` constant in `alien.js`)

```js
const PROTEST_SLOGANS = [
  'MORE STARS, LESS WORK',
  'GRAVITY PAY GAP',
  'UNIONIZE THE UNIVERSE',
  'NO UNPAID OVERTIME',
  'KPIs ARE VIOLENCE',
  'LEVERAGE THIS',
  'END SYNERGY CULTURE',
  'WELLNESS DAY ≠ PAY RISE',
];
```

### Performance Review State Transitions

```
[normal alien] --30s timer fires (no active PR alien)--> [performance review alien]
                     isPerformanceReview = true
                     speedMultiplier = 1.5
                     pointsMultiplier = 2.0
                     performanceReviewAlienIndex = this alien's index
                            |
                     alien destroyed
                            |
               [cleared: performanceReviewAlienIndex = null]
```

---

## 4. Projectile — Updated Schema

`createJobOffer()` and `createFlyerProjectile()` in `src/entities/projectile.js`:

```js
// Job offer (player) — no new fields
{
  x, y, width, height, vy, owner: 'player',
  active, frameIndex, frameTimer,
  // unchanged from original
}

// Protest flyer (alien) — updated
{
  x, y, width, height, vy, owner: 'alien',
  active, frameIndex, frameTimer,

  // [NEW] Pamphlet spin
  rotation: 0,           // number — radians; incremented each frame (FR-010)
  rotationSpeed: 4.0,    // number — radians/s (approx 0.7 full rotations/sec)
}
```

---

## 5. Shield — Unchanged Schema

No structural changes. The shield's hit handler in `collision.js` now calls `emitSteamParticles(shield, state.particles)` from `particles.js` on each hit (FR-011). No new fields on the shield object.

---

## 6. Boss — Updated Schema

`createBoss()` in `src/entities/boss.js`:

```js
{
  // Existing fields (unchanged)
  x, y, width, height, hp,
  sequenceRequired, sequenceProgress, sequenceTimer,
  zoneFlashState, zoneFlashTimer,
  speed, direction, flyerCooldown,
  active, level, frameIndex, frameTimer,

  // [NEW] Pre-sequence hit zone highlight
  preSequenceHighlightTimer: 0, // number — counts down from PRE_SEQUENCE_HIGHLIGHT_S (2.0s)
                                //          when BOSS phase begins; zones pulse amber until 0 (FR-019)
}
```

---

## 7. PowerUp — New Entity

`src/entities/powerup.js` — entirely new module.

```js
{
  x: number,            // horizontal centre (logical px)
  y: number,            // vertical centre (logical px)
  width: 12,            // fixed sprite width (logical px)
  height: 12,           // fixed sprite height (logical px)
  vy: 40,               // downward drift speed (px/s)
  type: 'hr-meeting',   // string — power-up type identifier; only 'hr-meeting' in this feature
  active: true,         // boolean — false once collected or out-of-bounds
}
```

### PowerUp Lifecycle

```
[dropped at alien.x, alien.y]
         |
   drifts downward at 40 px/s
         |
   player AABB overlaps?
      Yes → activate freeze, deactivate powerup, play jingle
      No  → exits bottom of canvas → deactivate (no effect)
```

---

## 8. Particle — New Entity

`src/systems/particles.js` — entirely new module.

```js
{
  x: number,       // horizontal position (logical px)
  y: number,       // vertical position (logical px)
  vx: number,      // horizontal velocity (px/s); positive = right
  vy: number,      // vertical velocity (px/s); negative = up
  life: number,    // seconds of remaining life (counts down to 0)
  maxLife: number, // seconds at creation (used to compute alpha fade)
  color: string,   // CSS colour string (e.g., '#ffffff', '#aaaaaa')
  size: number,    // radius/side length in logical px (1–3)
}
```

### Particle Emission Events

| Event | Function | Count | Colour | `vy` range | Life |
|-------|----------|-------|--------|-----------|------|
| Shield hit (steam) | `emitSteamParticles(shield, particles)` | 5 | `'#bbbbcc'` | −40 to −90 px/s | 0.5–0.8 s |

> **Employee of the Month glow** does not use the particle array — rendered directly in `renderPlayer` via `ctx.shadowBlur = 12; ctx.shadowColor = '#ffd700'` while `player.comboGlowTimer > 0`. This avoids adding physics-tracked particles for a purely visual effect.

---

## 9. CutsceneState — New Entity

Stored as `state.cutsceneState` in GameState. Created by `createCutsceneState(score, level)` in `src/systems/cutscene.js`.

```js
{
  timer: 0,               // number — elapsed time since cutscene start (s)
  duration: 4.0,          // number — total auto-advance duration before next level (s)
  barProgress: 0.0,       // number — 0.0–1.0; drives bar chart grow animation
  skipped: false,         // boolean — true when player presses Space/Fire to skip
  stats: [                // KPIBar[] — four KPI bars
    { label: 'UNION SUPPRESSION RATE', value: number, color: '#39ff14' },
    { label: 'SYNERGY ALIGNMENT',      value: number, color: '#0af' },
    { label: 'LEVERAGE UTILISED',      value: number, color: '#ff2244' },
    { label: 'EMPLOYEE DISSATISFACTION', value: number, color: '#ffdd44' },
  ],
  level: number,          // number — completed level number (used for header text)
}
```

### KPI Value Derivation

| KPI | Derivation |
|-----|-----------|
| `UNION SUPPRESSION RATE` | `Math.round(score.points / (level * 100))` capped at 100 |
| `SYNERGY ALIGNMENT` | `Math.round((consecutiveHits / 20) * 100)` capped at 100 |
| `LEVERAGE UTILISED` | Random 40–95 (fake flavour value) |
| `EMPLOYEE DISSATISFACTION` | `100 - UNION_SUPPRESSION_RATE` (always bad news) |

---

## 10. Updated Level Configuration

`getLevelConfig()` in `src/systems/levels.js`:

| Field | Previous Value | New Value | Reason |
|-------|---------------|-----------|--------|
| `flyerBaseCooldown` | `5.0` s | `8.3` s | −40% fire frequency (R-008) |

All other level config fields (`flyerFrequency`, `alienBaseSpeed`, `alienSpeedIncrement`, etc.) are unchanged.

---

## 11. Scoring — Updated Behaviour

`src/systems/scoring.js` changes:

- `resetCombo(score)` is now also called when a player projectile exits the canvas top without hitting any target (miss detection in `collision.js`). Previously only called on player hit.
- `addPoints(score, entityType, multiplier)` signature extended with an optional `multiplier` parameter (default `1.0`). When a Performance Review alien is destroyed, caller passes `alien.pointsMultiplier` (2.0).
- New exported constant: `EMPLOYEE_OF_MONTH_THRESHOLD = 5` — used by `game.js` to check `score.consecutiveHits % EMPLOYEE_OF_MONTH_THRESHOLD === 0` for glow trigger.

```js
// Updated signature
export function addPoints(score, entityType, multiplier = 1.0) {
  const base = POINTS[entityType] ?? POINTS.regular;
  score.points += base * score.comboMultiplier * multiplier;
  // ... existing combo counter logic unchanged ...
}
```

---

## 12. Canvas Scaling State

`src/canvas.js` — module-scoped (not in GameState):

```js
let _cityscapeOffset = 0;  // number — scroll position of cityscape background (logical px)
                           //          incremented each render frame at CITYSCAPE_SPEED (15 px/s)
                           //          reset to 0 when it exceeds CITYSCAPE_WIDTH
```

The cityscape scroll offset is owned by the canvas module (pure render concern) and is not part of GameState. `reducedMotion` from `state.reducedMotion` is read on each render to gate the scroll update.

---

## 13. Input — Extended Fields

`state.input` in `game.js` / `main.js`:

```js
{
  // Existing fields (unchanged)
  left: boolean,
  right: boolean,
  fire: boolean,
  mute: boolean,

  // [NEW] Pause via Escape (or P — already handled; Escape now maps to same flag)
  pause: boolean,        // true while Escape or P is held; edge-triggered in main.js
}
```

> `pause` already exists in the current input object. The only change is that Escape key is now also mapped to it in `main.js` (currently only P is mapped).
