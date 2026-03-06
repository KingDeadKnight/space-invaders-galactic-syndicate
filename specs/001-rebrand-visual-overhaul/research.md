# Research: Syndicat Galactique — Visual Overhaul & Gameplay Balancing (Phase 0)

**Branch**: `001-rebrand-visual-overhaul` | **Date**: 2026-03-06

---

## R-001: Canvas Fullscreen Scaling Strategy

**Decision**: Replace the fixed `PIXEL_SCALE = 3` CSS-based upscale with a dynamic viewport-fitted scale computed on load and on every `window.resize` event. The logical coordinate space (480 × 640 px) remains unchanged throughout the entire codebase; only the CSS transform (or explicit `canvas.style.width/height`) changes.

**Approach**:

```js
function resizeCanvas(canvasEl) {
  const scaleX = window.innerWidth  / CANVAS_WIDTH;
  const scaleY = window.innerHeight / CANVAS_HEIGHT;
  const scale  = Math.min(scaleX, scaleY); // letterbox / pillarbox on extreme ratios
  canvasEl.style.width  = (CANVAS_WIDTH  * scale) + 'px';
  canvasEl.style.height = (CANVAS_HEIGHT * scale) + 'px';
}
```

`body` uses `display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; overflow: hidden` to centre the scaled canvas, with `background: #0a0a0a` matching the dark game backdrop so letterbox bars are invisible.

**Rationale**: All game logic coordinates reference the fixed 480 × 640 logical space — nothing changes in entity/system code. `Math.min(scaleX, scaleY)` guarantees the full canvas is always visible regardless of aspect ratio. The `window` resize event registration is the only addition to `main.js`.

**Alternatives considered**:
- `canvas.width/height` changed dynamically: rejected — would invalidate all hardcoded pixel coordinates and require every collision/rendering system to be rewritten.
- CSS `object-fit: contain` on canvas: rejected — `object-fit` does not apply to canvas elements.
- CSS `transform: scale(...)` centred: viable, chosen as the exact implementation mechanism (sets `canvas.style.transform` and `transformOrigin: '50% 50%'`).

---

## R-002: Pixel Font — "Press Start 2P"

**Decision**: Load Google Fonts `"Press Start 2P"` via a `<link>` tag in `index.html`. Replace all `FONT_*` constants in `canvas.js` with `"Press Start 2P"`. Fallback: `"Courier New", monospace`.

**Rationale**: "Press Start 2P" is the canonical web pixel font, widely recognised as game-authentic. A `<link rel="stylesheet">` in HTML requires no bundler, no npm package, and no binary assets in the repository — entirely consistent with the Web-First / No Build Step principle. The font loads before first frame paint in typical browser conditions; a FOUT (flash of unstyled text) on first frame is acceptable.

**Alternatives considered**:
- Embed font as base64 `@font-face` in a `<style>` block: avoids CDN dependency, but adds ~50 KB to the HTML source, which is disproportionate for a small game. Rejected for KISS.
- Use a Canvas `fillText` pixel font built from `SPRITES` bitmap characters: technically complete offline solution but requires implementing a full bitmapped glyph renderer for all ASCII, which is hundreds of lines. Violates KISS.
- Keep `"Courier New"`: already in use; does not achieve the "pixel font" requirement from FR-012.

**Font URL**: `https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap`

**Note on offline play**: The game currently requires a static server or `file://` for ES modules. In the `file://` case with no internet, the font gracefully degrades to Courier New — core gameplay is unaffected. This matches the constitution's intent.

---

## R-003: Scrolling Cityscape Skyline Background

**Decision**: Represent the cityscape as a pre-computed sequence of building silhouette rectangles drawn as a single Canvas `fillRect` path on each frame. The skyline scrolls horizontally at a fixed slow speed (approx. 15 px/s logical). When reduced motion is enabled, the scroll stops.

**Data structure**: A flat array of `{ x, w, h }` building descriptors, each representing one building column defined by left edge x, width, and height. The array is about 3× the canvas width so it can be repeated seamlessly. A scroll offset (`cityscapeOffsetX`) is stored in the game canvas state (not game state), updated on each render call.

**Signal layers**:
1. **Sky fill**: solid dark background per current `THEME_PALETTE` bg colour.
2. **Distant grid** (existing): very-low-opacity horizontal/vertical lines — retained as-is.
3. **Cityscape silhouette** (new): buildings drawn in a near-black colour (~`#0a0a14`) slightly lighter than the sky to appear as a silhouetted horizon.
4. **Scanline overlay** (new — see R-004).

**Rationale**: Pure Canvas drawing — no images, no external assets. The silhouette uses only `fillRect` calls (one per building) — 20–30 calls per frame is negligible. Colour is near-background to be a "subtle" effect as specified (FR-004).

**Alternatives considered**:
- A single large rasterised sprite stored as a JS string (data URI): rejected — requires encoding tooling and defeats the "no external assets" constraint.
- Canvas `Path2D` stored once and re-drawn with an offset transform: cleaner but Path2D shapes can't easily be offset without a `translate` matrix. Simple `fillRect` loop is simpler and equally fast for ~25 buildings.

---

## R-004: Scanline Overlay Effect

**Decision**: After all game content is rendered each frame, overlay a semi-transparent horizontal stripe pattern using `fillRect` for every other horizontal band of 2 px height. Global alpha is set to 0.06 for subtlety. Skipped entirely when `state.reducedMotion === true`.

**Approach**:
```js
function _renderScanlines(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#000';
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
  }
  ctx.restore();
}
```

Called last in each rendering phase (after HUD, before frame commit). The loop runs CANVAS_HEIGHT/4 = 160 iterations — negligible GPU cost.

**Rationale**: The simplest approach with the lowest overhead. No shader, no image, no pre-generated texture. Directly satisfies FR-006.

**Alternatives considered**:
- Pre-render scanlines to an off-screen canvas and `drawImage` each frame: marginally faster but adds code complexity. Rejected for KISS.
- CSS `repeating-linear-gradient` overlaid as an `<div>` above canvas: mixes CSS and Canvas rendering contexts. Rejected — keeps all visuals in one layer.

---

## R-005: Particle System — Steam & Glow Effects

**Decision**: Implement a minimal flat-object particle pool in a new `src/systems/particles.js` module. Particles are plain objects `{ x, y, vx, vy, life, maxLife, color, size }` stored in an array. The array is passed through game state (`state.particles`) and updated/rendered each frame.

**Steam particle emission** (shield hit): On each shield–projectile collision, emit 4–6 particles upward with small random velocity spread (`vy` between −40 and −90 px/s, `vx` ±20 px/s), white/grey colour, 0.4–0.8 s lifetime.

**Employee of the Month glow** (player combo): A ring of 6–8 golden particles orbiting the player at 360°/n increments, each pulsing alpha based on `Math.sin(time)`. Rendered as thick `arc()` segments instead of particle physics — cleaner and less CPU. Stored as a boolean `player.comboGlowActive` + timer; `canvas.js` renders the glow directly on the player.

**Rationale**: A plain array with a `dt`-step update loop is the minimal viable particle approach. No pooling/recycling required at the scale of this game (<50 simultaneous particles at peak). Satisfies FR-011 (steam) and FR-025 (glow) with ~80 lines.

**Alternatives considered**:
- Object pooling (pre-allocated array, reuse slots): not needed at this scale — adds complexity without benefit. Rejected for KISS.
- CSS animation overlay: mixing rendering contexts. Rejected.
- Canvas `shadowBlur` glow on player: simpler than particles for the glow effect — adopted for Employee of the Month glow specifically (`ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;`).

---

## R-006: Performance Review Alien — State Machine

**Decision**: Add a state overlay on an existing alien object rather than a new entity type. Fields added to the alien object:
- `isPerformanceReview: boolean` (default `false`)
- `speedMultiplier: number` (default `1.0`; set to `1.5` when activated)
- `pointsMultiplier: number` (default `1.0`; set to `2.0` when activated)

A single index reference `state.performanceReviewAlienIndex` (number|null) is stored in game state, set by the 30-second interval timer (`state.performanceReviewTimer`). When a Performance Review alien is destroyed, `addPoints` reads `alien.pointsMultiplier`; the index is cleared.

**Rationale**: Minimal state change on an existing object. No new entity class, no new array, no new collision handler needed. The existing `renderAlien` function simply checks `alien.isPerformanceReview` and applies a red tint. Satisfies FR-022–FR-024.

**Alternatives considered**:
- A separate `PerformanceReviewAlien` entity type: would require duplicating all alien logic, a new array, and new collision branches. Rejected — violates KISS significantly.
- Using a separate `performanceReviewAliens[]` list that mirrors an existing alien: adds synchronisation complexity. Rejected.

---

## R-007: HR Meeting Power-Up — Entity Design

**Decision**: Create `src/entities/powerup.js` with a plain object factory `createPowerup(x, y, type)` and `updatePowerup(powerup, dt)`. Power-ups float downward at 40 px/s. Power-ups are stored in `state.powerups[]`. Collision with player is handled in `collision.js`.

**Drop mechanic**: In `game.js` update loop, when a unionist alien is defeated, `Math.random() < POWERUP_DROP_CHANCE (0.20)` triggers `createPowerup(alien.x, alien.y, 'hr-meeting')` added to `state.powerups`.

**Freeze mechanic**: `state.hrFreezeTimer` (number, seconds remaining). When `> 0`, all alien `update` calls are skipped (aliens don't move or fire). Boss is also frozen. The timer is decremented each tick.

**Visual**: A small cyan rectangle with "HR" text drawn via `fillText`. No sprite sheet required — pixel art minimal approach consistent with existing projectile rendering.

**Rationale**: A standalone module keeps separation of concerns. The freeze is a game-state-level toggle rather than a per-entity flag — simpler and impossible to desync. Drop probability 20% gives ~1 power-up every 5 unionist kills on average, which feels attainable per SC-003.

**Alternatives considered**:
- Per-alien `frozen` flag: requires iterating all aliens to check/reset. State-level timer is O(1). Rejected.
- Drop probability 10%: too low, player unlikely to see the mechanic in a 3-level run. Rejected.
- Drop probability 33%: too generous, trivialises the boss. Rejected.

---

## R-008: Alien Fire Rate — 40% Reduction Calculation

**Decision**: Change `flyerBaseCooldown` in `levels.js` from `5.0` to `8.3` seconds. The `flyerFrequency` multipliers and existing per-alien random jitter are unchanged.

**Baseline analysis**:
| Level | Current cooldown range | Current avg shots/min per alien | New cooldown range | New avg shots/min |
|-------|------------------------|--------------------------------|--------------------|-------------------|
| 1 | 5.0–10.0 s | ~8.0 | 8.3–16.6 s | ~4.8 (−40%) |
| 2 | 4.0–8.0 s | ~10.0 | 6.6–13.3 s | ~6.0 (−40%) |
| 3 | 3.0–6.0 s | ~13.3 | 5.0–10.0 s | ~8.0 (−40%) |

**Derivation**: To reduce frequency by 40%, cooldown must increase by factor 1/0.6 ≈ 1.667. `5.0 × 1.667 = 8.33 → 8.3 s`. Level-2 and Level-3 scaling is preserved automatically via the existing `flyerFrequency` multipliers (0.8, 0.6).

**Rationale**: Minimal single-constant change; all existing architecture (shouldFire, per-alien cooldown tracking) is untouched. Satisfies FR-015 and FR-016 (the per-alien cooldown mechanism already exists; the baseline is now 40% longer).

**Alternatives considered**:
- Introduce a separate `FIRE_RATE_REDUCTION` constant and multiply at call site: adds indirection for no benefit. Rejected for KISS.
- Increase `flyerFrequency` per level instead of `flyerBaseCooldown`: equivalent numerically but touches 3 values instead of 1. Rejected.

---

## R-009: Invincibility Window Implementation

**Decision**: Add `invincibilityTimer: 0` to the player object. After receiving a hit (in `collision.js`), set `player.invincibilityTimer = INVINCIBILITY_DURATION (1.5)`. `updatePlayer` decrements the timer. Damage checks in `collision.js` skip the player when `player.invincibilityTimer > 0`.

**Visual cue**: A frame-level blink — the player sprite is skipped every other render frame when `invincibilityTimer > 0`. Computed in `renderPlayer`: `if (player.invincibilityTimer > 0 && Math.floor(player.invincibilityTimer * 8) % 2 === 0) return;` — produces ~8 Hz flicker, genre-conventional.

**Rationale**: One timer field on the player object + one guard in collision.js + one skip condition in renderPlayer. Zero new modules, zero new arrays. Satisfies FR-017 and FR-018.

**Alternatives considered**:
- A global invincibility flag (boolean): no timer means no auto-expiry. Rejected.
- State-machine phase on player (`normal` / `invincible` / `dead`): over-engineered for one timed flag. Rejected for KISS.

---

## R-010: Boss Hit Zone Pre-Sequence Highlight

**Decision**: The boss already has `zoneFlashState` and `zoneFlashTimer` for post-hit feedback. Add a new `preSequenceHighlightTimer: 0` field. When `levelPhase` transitions from `WAVE` to `BOSS`, set `preSequenceHighlightTimer = 2.0` seconds. During this window, `renderBoss` draws all hit zones with a pulsing amber/yellow outline using `ctx.strokeStyle` and `Math.sin()` alpha modulation for urgency. After the timer expires, the boss enters normal interactive state.

**Rationale**: 2 seconds of zone highlighting before sequence begins gives players a fair scanning window. Reuses existing `renderBoss` zone loop; only a draw-mode flag is added. No new fields except `preSequenceHighlightTimer`. Satisfies FR-019.

**Alternatives considered**:
- Blinking animation (CSS-style): already used for the PLAYING/interactive flash. Using a different effect (amber pulsing) for the "pre-sequence hint" vs. the "sequence flash" aids player distinction.
- Static always-on zone outlines: less clear to players that the sequence is about to begin. Rejected.

---

## R-011: Web Audio — Elevator Music, Motivational Jingle, Sad Trombone, HR Voicemail

**Decision**: All new sounds are procedurally synthesised using the existing Web Audio API infrastructure in `soundManager.js`. No external audio files.

**Elevator music** (boss theme): A slow descending chromatic bass motif at BPM 60, counter-melody on a `sawtooth` oscillator filtered through a bandpass at 800 Hz to simulate muted trumpets. Loop length: 8 bars. Activated on `levelPhase → BOSS`; deactivated on level end.

**Motivational jingle** (power-up pickup): A quick ascending major third fanfare on a `square` oscillator — three notes (C4 → E4 → G4) at 0.1 s each with fast attack. One-shot, non-looping.

**Sad trombone** (game over lead): A descending chromatic scale spanning a minor 7th (`B♭4 → A4 → A♭4 → G4`) with a `sawtooth` oscillator, vibrato LFO (~5 Hz) for the last 0.3 s of each note. Total duration: ~2.5 s.

**HR Voicemail** (game over tail): Synthesised: a DTMF-style "beep" (440 Hz + 480 Hz sine mix for 0.2 s), then a recorded-speech approximation via amplitude-modulated band-limited noise (formant at ~800 Hz, BPM-irrelevant, 1 s of "static speech"), then a final beep. Total ~2 s. Begins automatically after sad trombone completes (scheduled via AudioContext timing).

**Per-alien-type SFX**: Each alien theme (`it`, `accounting`, `management`) gets a distinct destruction sound:
- `it`: short high-frequency square blip (C6 descending to A5 in 0.15 s)
- `accounting`: coin-ish percussive ping (`triangle`, 880 Hz, 0.2 s, sharp decay)
- `management`: low thud (`sine`, 120 Hz → 60 Hz in 0.3 s, heavy release)
- `unionist`: buzzer (`sawtooth` with noise, 200 Hz, 0.2 s)
- `boss`: explosion-style noise burst (white noise through lowpass 300 Hz, 0.5 s)

**Rationale**: Reuses the existing `scheduleNote` / `AudioContext` infrastructure. All tones are mathematically defined — no samples. Satisfies FR-028 through FR-032.

---

## R-012: Quarterly Review Cutscene — Renderer

**Decision**: Add a `CUTSCENE` phase to the `GameState` phase machine. Cutscene state is `state.cutsceneState: { timer, stats[], barAnimProgress, skipped }`. `stats[]` is generated at level completion from current score/kills/accuracy. The cutscene renders 4 animated bar charts using `fillRect` with bars growing from 0 to their target height over ~1.5 s (eased). Labels use fake HR jargon copied from a static pool.

**Cutscene content** (FR-027): Shown after each level completion, before the next level loads:
- Header: `"Q[n] PERFORMANCE REVIEW"`  
- 4 KPI bars: `"UNION SUPPRESSION RATE"`, `"SYNERGY ALIGNMENT"`, `"LEVERAGE UTILISED"`,  `"EMPLOYEE DISSATISFACTION"`
- Values derived from actual session data (e.g., aliens killed / total × 100, score, hits, misses)
- A skip prompt: `"[ SPACE ] SKIP"` displayed from frame 1

**Skip mechanism**: Any `Fire` or `Space` keypress while in `CUTSCENE` phase advances immediately to the next level — sets `state.cutsceneState.skipped = true` and triggers `transitionToNextLevel`.

**Rationale**: Pure Canvas rendering — bar charts are just `fillRect` calls. Re-uses existing font constants and neon palette. No external charting library needed. Satisfies FR-027 and FR-028.

**Alternatives considered**:
- Canvas `<img>` with a PNG chart: requires an asset. Rejected.
- A DOM overlay (`<div>`) for the cutscene: mixes DOM and Canvas layers, harder to skip cleanly. Rejected.

---

## R-013: Combo Streak — "Employee of the Month" Threshold

**Decision**: The scoring module already tracks `score.consecutiveHits`. The threshold for triggering Employee of the Month is **5 consecutive hits** (FR-025). A new field `player.comboGlowTimer: 0` is set to `COMBO_GLOW_DURATION = 3.0 s` when `score.consecutiveHits` reaches 5 (or a multiple of 5). There is no UI pop-up — only the golden glow visual on the player ship via `ctx.shadowBlur` + `ctx.shadowColor = '#ffd700'`.

**Miss handling** (FR-026): A "miss" is defined operationally as a player projectile exiting the top of the canvas without hitting any target. Detected in `collision.js` projectile-out-of-bounds check. On miss: `resetCombo(score)` is called (already exists in scoring.js — currently called on player hit; now also called on projectile miss).

**Rationale**: Reuses the existing combo counter fully. Adding a miss-trigger for combo reset is the only new logic. The glow is entirely visual via `shadowBlur` in `renderPlayer`. Satisfies FR-025 and FR-026.

**Alternatives considered**:
- Pop-up "Employee of the Month!" text: additional render state needed. Opted for visual simplicity (glow only). Spec says "visual effect" — glow satisfies the requirement.
- Resetting combo on player-hit only (current behaviour): misses were not resetting combos. Now they will, per FR-026.
