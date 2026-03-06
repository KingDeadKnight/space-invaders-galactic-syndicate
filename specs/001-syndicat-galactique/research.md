# Research: Syndicat Galactique — Phase 0 Findings

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06

---

## R-001: Web Audio API — Procedural Lofi Music Synthesis

**Decision**: Generate lofi background music entirely in-browser using the Web Audio API scheduling pattern ("look-ahead scheduler") with `OscillatorNode`, `GainNode`, `BiquadFilterNode`, and `DelayNode`. No external audio files or CDN.

**Rationale**: The project constraint "Assets inlined or generated via Canvas API (no external CDN)" extends to audio — no external files means all sound must be synthesised. The Web Audio API runs on a separate high-priority thread, making it reliable even during JS-heavy game frames. A look-ahead scheduler (a `setInterval` at ~25 ms that pre-schedules notes up to 100 ms ahead using `AudioContext.currentTime`) decouples audio from the main thread and produces click-free, jank-resistant playback.

**Architecture**:
- **Signal chain per voice**: `OscillatorNode → GainNode (ADSR envelope) → GainNode (voice volume) → BiquadFilterNode (lowpass ~3 kHz) → DelayNode (~350 ms feedback delay) → GainNode (master) → destination`
- **Oscillator types**: `square` / `sawtooth` for melody leads (8-bit character); `triangle` for bass; white-noise `AudioBufferSourceNode` for percussion transients
- **Lofi texture**: 2–3 detuned oscillators per voice (`detune ±5–15 cents`); slow LFO (0.3–1 Hz) modulating pitch for wobble
- **Start/stop/mute**: Single `AudioContext` for page lifetime; ramp master `GainNode` to 0 with `exponentialRampToValueAtTime` to silence without clicks; cancel the scheduler `setInterval` to stop note generation
- **Estimated size**: ~150–250 lines in `src/audio/soundManager.js`

**Key pitfalls**:
- Safari requires `AudioContext.resume()` inside a user gesture before any audio plays → call on first keypress or Start button click
- `OscillatorNode` is one-shot; never reuse after `stop()` — create a new node per note event

**Alternatives considered**:
- Linking to royalty-free audio files: Rejected — violates the "no external CDN / assets inlined" constraint and requires bundling binary assets
- `AudioWorklet` for synthesis: Over-engineered for this scope; violates KISS principle

---

## R-002: Canvas Pixel Art Sprites (No External Images)

**Decision**: Define sprites as 2D arrays of hex color strings (or `null` for transparent pixels). Render each frame with `ctx.fillRect(x + col * scale, y + row * scale, scale, scale)` per non-null cell.

**Rationale**: No image loading lifecycle, no external files, art data is plain JS literals editable directly in source. Perfectly aligned with the "all shapes via Canvas API" constraint.

**Architecture**:
- All sprite definitions live in a single `src/entities/sprites.js` ES module, exported as a map keyed by entity type and variant (e.g., `SPRITES.alien.it[0]`, `SPRITES.boss`)
- Each sprite entry: `{ frames: Array<Array<Array<string|null>>>, width, height, fps }`
- Animation: a `frameIndex` counter per entity, advanced from wall-clock delta (not rAF tick count) to be display-rate independent
- Scale: draw at 1× logical resolution; upscale via CSS `image-rendering: pixelated` on the `<canvas>` element (simpler than `ctx.scale`, GPU-handled)
- Per-entity rendering: always wrap draw calls in `ctx.save()` → `ctx.translate(entity.x, entity.y)` → draw at local origin → `ctx.restore()`

**Key pitfalls**:
- `fillStyle` must be set on every non-null cell (no batching by color for simple iteration)
- Drive animation from wall-clock `performance.now()` delta, not rAF tick count

**Alternatives considered**:
- External spritesheets (PNG): Rejected — violates "no external image assets" constraint
- `OffscreenCanvas` for pre-rendering: Valid optimisation, but premature — KISS; add only if profiling shows canvas is a bottleneck

---

## R-003: requestAnimationFrame Fixed-Timestep Game Loop

**Decision**: Use the "fixed timestep with accumulator" pattern (Glenn Fiedler's "Fix Your Timestep"). Fixed step: `FIXED_STEP = 1000/60 ms`. Delta clamped to 250 ms max.

**Rationale**: Keeps physics and collision deterministic regardless of display refresh rate. Separates simulation from rendering cleanly. Compatible with all game states without additional complexity.

**Architecture**:
- **Loop**: `delta = now - lastTime` (clamped to 250 ms) → drain accumulator in `FIXED_STEP` chunks calling `update(FIXED_STEP_S)` → call `render(alpha)` with `alpha = accumulator / FIXED_STEP`
- **Units**: velocities and distances in px/s (use seconds internally: `FIXED_STEP_S = 1/60`)
- **State machine**: `gameState ∈ { MENU, PLAYING, PAUSED, GAMEOVER }` — rAF loop always runs; only PLAYING drains the update accumulator and calls `update()`
- **Pause/resume**: On pause, set `lastTime = null`; on resume, seed from incoming rAF timestamp so first delta = 0 (prevents accumulated delta flood)
- **No `cancelAnimationFrame`** needed during normal state transitions; only on true teardown

**Alternatives considered**:
- Variable timestep (pass raw delta to update): Rejected — produces non-deterministic, frame-rate-dependent physics and collision; harder to reason about

---

## R-004: GitHub Pages Deployment Workflow

**Decision**: Single-job workflow with `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`. Artifact path: `'.'` (repo root). Trigger: `push` to `main` + `workflow_dispatch`.

**Rationale**: Single-job is correct for a no-build-step static site. Two-job is only warranted with real build steps. `configure-pages` is harmless for a plain HTML/JS project and follows the canonical `static.yml` template.

**Required permissions** (on the deploy job):
```yaml
permissions:
  pages: write
  id-token: write
  contents: read
```

**Key options**:
- `upload-pages-artifact path: '.'` — packages the entire repo root
- `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }}}`
- Workflow file location: `.github/workflows/deploy.yml`

**Pitfalls**:
- `path: '.'` captures everything in checkout — ensure `.gitignore` excludes secrets or large dev-only files
- `id-token: write` is mandatory for the OIDC JWT; omitting it produces a cryptic deployment failure
- Current action versions: `deploy-pages@v4` (not v2 as mentioned in spec — v2 is deprecated; v4 is current as of 2026)

---

## R-005: Boss Sequence UI Pattern

**Decision**: Render the boss sequence indicator as a horizontal row of zone highlight boxes drawn programmatically on Canvas. Boxes flash green on correct hit, flash red on wrong hit (triggering reset).

**Architecture**:
- Boss exposes `sequenceRequired: number[]` (array of zone indices 0–2) and `sequenceProgress: number` (current step index)
- Hit zones rendered as labelled boxes above the boss sprite; highlighted based on `sequenceProgress`
- A countdown timer bar (drawn as a `fillRect`) shows remaining time; on timeout, `sequenceProgress` resets
- Wrong hit: `sequenceProgress = 0`, brief red flash effect on boss sprite

**Alternatives considered**:
- Text-only sequence indicator: Weaker UX per SC-004 (80% second-attempt success); visual zones are more immediately scannable
