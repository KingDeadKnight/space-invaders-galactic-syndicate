# Module Contracts: Game Entities

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06

---

## `src/entities/player.js`

### `createPlayer(canvasWidth, canvasHeight) → Player`

Constructs and returns an initialised `Player` object.

| Parameter | Type | Description |
|-----------|------|-------------|
| `canvasWidth` | `number` | Logical canvas width (px); used to centre player horizontally |
| `canvasHeight` | `number` | Logical canvas height (px); used to set player y position |

Returns a `Player` object (see data-model.md).

---

### `updatePlayer(player, input, dt) → void`

Advances player state by one fixed timestep.

| Parameter | Type | Description |
|-----------|------|-------------|
| `player` | `Player` | Player object (mutated in-place) |
| `input` | `InputState` | Current keyboard snapshot |
| `dt` | `number` | Fixed timestep duration (s), typically `1/60` |

**Side effects**: Mutates `player.x`, `player.speed`, `player.slowDebuffTimer`, `player.shotCooldown`.

---

### `fireJobOffer(player) → Projectile | null`

Fires a job offer projectile from the player's position, if cooldown allows.

| Parameter | Type | Description |
|-----------|------|-------------|
| `player` | `Player` | Player object |

Returns a new `Projectile` if the shot is allowed, or `null` if on cooldown. Mutates `player.shotCooldown` when a shot is created.

---

### `applySlowDebuff(player) → void`

Applies the protest-flyer slow debuff to the player.

| Parameter | Type | Description |
|-----------|------|-------------|
| `player` | `Player` | Player object (mutated in-place) |

Sets `player.slowDebuffTimer` and reduces `player.speed` to `baseSpeed * slowMultiplier`.

---

### `renderPlayer(ctx, player) → void`

Draws the player sprite on the canvas.

| Parameter | Type | Description |
|-----------|------|-------------|
| `ctx` | `CanvasRenderingContext2D` | 2D rendering context |
| `player` | `Player` | Player object |

---

## `src/entities/alien.js`

### `createAlien(x, y, theme) → Alien`

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | `number` | Initial horizontal centre (px) |
| `y` | `number` | Initial vertical centre (px) |
| `theme` | `string` | `'it'` / `'accounting'` / `'management'` |

Returns a regular `Alien` object.

---

### `updateAlien(alien, dt) → void`

Advances alien animation and flyer cooldown. Does **not** handle movement (movement is driven by the formation system in `levels.js`).

| Parameter | Type | Description |
|-----------|------|-------------|
| `alien` | `Alien` | Alien object (mutated in-place) |
| `dt` | `number` | Timestep (s) |

---

### `hitAlien(alien) → number`

Applies one hit to the alien. Returns remaining HP.

| Parameter | Type | Description |
|-----------|------|-------------|
| `alien` | `Alien` | Alien object (mutated in-place) |

Returns `alien.hp` after the hit. Side effects: decrements `hp`, updates `mood`, `moodState`; sets `active = false` if `hp === 0`.

---

### `shouldFire(alien, dt) → boolean`

Returns `true` if the alien should fire a protest flyer this tick. Decrements `flyerCooldown`; resets it on fire.

---

### `renderAlien(ctx, alien) → void`

Draws the alien sprite and mood bar at its current position.

---

## `src/entities/unionist.js`

### `createUnionist(x, y, theme) → Unionist`

Returns a `Unionist` (Hardened Unionist) object with `hp = 3`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | `number` | Horizontal centre (px) |
| `y` | `number` | Vertical centre (px) |
| `theme` | `string` | Departmental theme |

---

### `hitUnionist(unionist) → number`

Same contract as `hitAlien` but also manages fist-shake state.

---

### `updateUnionist(unionist, dt) → void`

Extends `updateAlien` — additionally ticks `fistShakeTimer` and clears `fistShaking` when timer expires.

---

### `renderUnionist(ctx, unionist) → void`

Draws the unionist sprite with fist-shake frame when `fistShaking === true`.

---

## `src/entities/boss.js`

### `createBoss(level, canvasWidth) → Boss`

Creates a `Boss` entity configured for the given level.

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | `number` | 1, 2, or 3; determines sequence length and speed |
| `canvasWidth` | `number` | Logical canvas width (px) for horizontal boundary clamping |

---

### `updateBoss(boss, dt, canvasWidth) → void`

Advances boss position (horizontal bounce), sequence timer, flyer cooldown, and flash timer.

---

### `hitBoss(boss, zoneIndex) → 'correct' | 'wrong' | 'defeated'`

Applies a hit to the boss at the given zone index.

| Parameter | Type | Description |
|-----------|------|-------------|
| `boss` | `Boss` | Boss entity (mutated in-place) |
| `zoneIndex` | `number` | 0 (left), 1 (center), 2 (right) |

Returns:
- `'correct'` — hit was the right zone; `sequenceProgress` advanced
- `'wrong'` — hit was wrong zone; sequence reset
- `'defeated'` — sequence completed; `boss.active` set to `false`

---

### `shouldBossFire(boss, dt) → boolean`

Returns `true` if the boss should fire a protest flyer this tick.

---

### `renderBoss(ctx, boss) → void`

Draws the boss sprite, hit zone indicators, sequence progress, and countdown bar.

---

## `src/entities/projectile.js`

### `createJobOffer(x, y) → Projectile`

Creates an upward-moving job offer projectile originating at `(x, y)`.

---

### `createFlyerProjectile(x, y) → Projectile`

Creates a downward-moving protest flyer projectile originating at `(x, y)`.

---

### `updateProjectile(projectile, dt, canvasHeight) → void`

Advances projectile position. Sets `active = false` if projectile exits canvas bounds.

---

### `renderProjectile(ctx, projectile) → void`

Draws the projectile sprite (job offer or flyer based on `owner`).

---

## `src/entities/shield.js`

### `createShields(canvasWidth, canvasHeight) → Shield[]`

Creates and returns the array of 4 evenly-spaced `Shield` objects.

---

### `updateShield(shield, dt) → void`

Ticks `degradeTimer`; applies passive degradation when timer expires.

---

### `damageShield(shield) → void`

Applies one hit (flyer impact) to the shield: `durability--`; sets `active = false` if exhausted.

---

### `renderShield(ctx, shield) → void`

Draws the coffee pot shield at its current degradation stage.

---

## `src/entities/sprites.js`

### `SPRITES` (named export, `Object`)

A map of all sprite definitions.

```
SPRITES = {
  player: { frames: [...], width, height, fps },
  alien: {
    it:         { regular: {...}, unionist: {...} },
    accounting: { regular: {...}, unionist: {...} },
    management: { regular: {...}, unionist: {...} }
  },
  boss:   { frames: [...], width, height, fps },
  shield: { frames: [...], width, height, fps },   // 5 degradation stages = 5 frames
  jobOffer: { frames: [...], width, height, fps },
  flyer:    { frames: [...], width, height, fps }
}
```

Each sprite entry: `{ frames: Array<string[][]>, width: number, height: number, fps: number }`
Each frame: a 2D array `[row][col]` → hex colour string or `null` (transparent)
