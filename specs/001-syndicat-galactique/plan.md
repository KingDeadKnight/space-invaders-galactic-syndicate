# Implementation Plan: Syndicat Galactique

**Branch**: `001-syndicat-galactique` | **Date**: 2026-03-06 | **Spec**: [specs/001-syndicat-galactique/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-syndicat-galactique/spec.md`

## Summary

Build a complete browser-based Space Invaders clone called "Syndicat Galactique" — a comedic HR workplace narrative game. The player is a Galactic HR Manager who fires job offers at striking aliens across 3 department-themed levels (IT, Accounting, Management), each ending with a Boss Negotiator fight requiring a specific hit-sequence to defeat. The game runs as a static site on GitHub Pages with zero dependencies, using Vanilla JS ES modules, HTML5 Canvas for pixel-art rendering (all sprites drawn programmatically), and the Web Audio API for procedurally synthesised lofi background music and sound effects.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020+), ES Modules
**Primary Dependencies**: None — zero runtime dependencies; browser-native Web Audio API and HTML5 Canvas API only
**Storage**: N/A — no persistence; scores reset on page refresh (per spec assumptions)
**Testing**: Manual browser testing (Chrome 90+ and Firefox 90+); automated tests out of scope for this feature
**Target Platform**: Modern browser (Chrome, Firefox); static hosting on GitHub Pages
**Project Type**: Browser game — single-page static application, no build step
**Performance Goals**: 60 fps consistent motion; no perceptible input lag (SC-002); full playthrough 10–20 min (SC-003)
**Constraints**: No bundler/build tool; all paths relative; no external image or audio assets; directly openable via `file://` in Firefox; all sprites and audio synthesised in-browser
**Scale/Scope**: 3 levels, 1 player, ~8 game entities, ~12 JS modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. KISS | Simplest solution; no unjustified complexity; YAGNI | ✅ PASS | AABB collision, procedural sprites, no framework, no bundler |
| II. Document Everything | All functions/modules must have JSDoc or inline comments | ✅ PASS (as requirement) | Enforced as acceptance criterion on every module delivered |
| III. Iterative Development | Every commit leaves game playable and demonstrable | ✅ PASS (as requirement) | Delivery ordered P1 → P2 → P3; core loop first |
| IV. Web-First, No Build Step | No bundler; ES modules; direct `file://` openable | ✅ PASS | `<script type="module">`; no Vite/Webpack; relative paths throughout |
| V. Playability Non-Negotiable | Canvas renders, player moves, enemies shoot at all times on main | ✅ PASS (as requirement) | PR gate: manual browser check required before merge |

**Post-design re-check** (after Phase 1):

| Principle | Design Decision | Status |
|-----------|----------------|--------|
| I. KISS | Plain object factories (no classes); `SPRITES` as 2D arrays; AABB only | ✅ PASS |
| II. Document Everything | JSDoc required on all exported functions per contracts/ | ✅ PASS |
| III. Iterative Development | Module interface contracts enable incremental, independently testable slices | ✅ PASS |
| IV. Web-First | `soundManager.js` uses Web Audio API — no audio files; sprites drawn via Canvas API | ✅ PASS |
| V. Playability | Core loop (`main.js` → `game.js` → `canvas.js`) is a self-contained slice; other modules add on top | ✅ PASS |

**No violations — no Complexity Tracking table required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-syndicat-galactique/
├── plan.md              # This file
├── research.md          # Phase 0 — Web Audio synthesis, sprite rendering, game loop, deploy workflow
├── data-model.md        # Phase 1 — All entity shapes, state machines, constants
├── quickstart.md        # Phase 1 — Local run and GitHub Pages deploy instructions
├── contracts/
│   ├── README.md        # Contract index
│   ├── entities.md      # player, alien, unionist, boss, projectile, shield, sprites contracts
│   └── systems.md       # game, canvas, collision, scoring, levels, soundManager contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── index.html                       # Entry point; <script type="module" src="src/main.js">
├── README.md                        # Setup, controls, deploy instructions
├── .github/
│   └── workflows/
│       └── deploy.yml               # Auto-deploy to GitHub Pages on push to main
└── src/
    ├── main.js                      # rAF game loop (fixed timestep), input listener bootstrap
    ├── game.js                      # GameState machine: initGame, updateGame, phase transitions
    ├── canvas.js                    # Rendering engine: initCanvas, render, renderHUD
    ├── entities/
    │   ├── sprites.js               # All pixel-art sprite definitions (2D colour arrays)
    │   ├── player.js                # HR Manager ship entity
    │   ├── alien.js                 # Regular alien entity
    │   ├── unionist.js              # Hardened Unionist (3-hit) entity
    │   ├── boss.js                  # Boss Negotiator entity (sequence mechanic)
    │   ├── projectile.js            # Job offer + protest flyer projectiles
    │   └── shield.js                # Coffee pot shield entity
    ├── systems/
    │   ├── collision.js             # AABB collision detection and game collision processing
    │   ├── scoring.js               # HR Satisfaction Rate + Employee Engagement Bonus
    │   └── levels.js                # Level configs, alien formation builder, formation movement
    └── audio/
        └── soundManager.js          # Web Audio API lofi music (look-ahead scheduler) + SFX
```

**Structure Decision**: Single project layout (Option 1 adapted). No frontend/backend split — pure static browser game. All source under `src/`; entry point at repository root as required by GitHub Pages. No `tests/` directory in this feature — manual browser testing is the baseline per the constitution; automated tests are explicitly out of scope.
