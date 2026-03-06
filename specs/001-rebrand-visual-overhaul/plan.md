# Implementation Plan: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Branch**: `001-rebrand-visual-overhaul` | **Date**: 2026-03-06 | **Spec**: [specs/001-rebrand-visual-overhaul/spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-rebrand-visual-overhaul/spec.md`

## Summary

Rebrand the existing Syndicat Galactique game with a "Corporate Hell" visual identity (fullscreen scaling, scrolling cityscape, scanlines, neon palette, pixel font, redesigned sprites) and introduce four gameplay additions (HR Meeting power-up, Performance Review alien, Employee of the Month combo glow, Quarterly Review cutscene) on top of balancing changes (−40% alien fire rate, 1.5 s player invincibility window, boss pre-highlight). Audio gains five new synthesised themes/SFX sequences. Accessibility gains an Escape-key pause menu with a Reduced Motion toggle and a controls reminder on the main menu. All work uses the existing Vanilla JS + HTML5 Canvas + Web Audio API stack with no new dependencies.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020+), ES Modules  
**Primary Dependencies**: None — Web Audio API and HTML5 Canvas API are browser-native; one `<link>` to Google Fonts CDN for "Press Start 2P" pixel font (graceful fallback to Courier New)  
**Storage**: N/A — all state is session-scoped; `reducedMotion` preference is held in memory only (no localStorage per KISS)  
**Testing**: Manual browser testing (Chrome and Firefox); no automated tests in scope  
**Target Platform**: Modern browser (Chrome 90+, Firefox 90+); static hosting (GitHub Pages / `npx serve` / `file://`)  
**Project Type**: Browser game — single-page static application, no build step  
**Performance Goals**: 60 fps fixed-timestep maintained; no perceptible input lag; particle system capped at ~50 simultaneous particles  
**Constraints**: No bundler; no external image/audio assets; all sprites programmatically drawn via Canvas API; all audio procedurally synthesised via Web Audio API  
**Scale/Scope**: ~15 modified JS modules, 3 new JS modules, ~800–1200 lines net new/changed code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. KISS | Simplest solution; no unjustified complexity; YAGNI | ✅ PASS | Performance Review = state flag on existing alien; power-up = new plain-object factory; invincibility = one timer field on player; each mechanic is the minimal viable structure |
| II. Document Everything | All new/changed functions must have JSDoc | ✅ PASS (as requirement) | Enforced as acceptance criterion on every module delivered |
| III. Iterative Development | Every commit leaves game playable | ✅ PASS (as requirement) | Delivery ordered: fullscreen → visual theme → balancing → new mechanics → audio → accessibility |
| IV. Web-First, No Build Step | No bundler; ES modules; `file://` openable | ✅ PASS | Google Fonts `<link>` degrades to Courier New offline; no other additions |
| V. Playability Non-Negotiable | Canvas renders, player moves, enemies shoot at all times on main | ✅ PASS (as requirement) | Each iteration must be manually verified in browser before merge |

**Post-design re-check** (after Phase 1):

| Principle | Design Decision | Status |
|-----------|----------------|--------|
| I. KISS | `flyerBaseCooldown` single constant change for 40% fire reduction; invincibility as one timer; particles as flat array; cutscene as canvas `fillRect` charts | ✅ PASS |
| II. Document Everything | All new module exports documented in contracts/ | ✅ PASS |
| III. Iterative Development | New modules (`powerup.js`, `particles.js`, `cutscene.js`) are additive; no existing module is restructured | ✅ PASS |
| IV. Web-First | Pixel font via `<link>` CDN; all audio procedural in Web Audio API; no image files | ✅ PASS |
| V. Playability | Fullscreen scaling and balancing changes are isolated to `canvas.js`/`main.js`/`levels.js` — core loop untouched | ✅ PASS |

**No violations — no Complexity Tracking table required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-rebrand-visual-overhaul/
├── plan.md              # This file
├── research.md          # Phase 0 — scaling, font, particles, fire rate, audio themes, cutscene
├── data-model.md        # Phase 1 — updated entity schemas, new entity schemas, state extensions
├── quickstart.md        # Phase 1 — local run instructions, manual test checklist
├── contracts/
│   ├── entities.md      # Player, Alien, Projectile, Shield (updated) + PowerUp (new)
│   └── systems.md       # Particles (new), Cutscene (new) + Scoring, Collision, Levels (updated)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── index.html                           # MODIFIED: Google Fonts link; fullscreen body/canvas CSS
└── src/
    ├── main.js                          # MODIFIED: window resize handler; Escape key input; resizeCanvas call
    ├── game.js                          # MODIFIED: new constants (INVINCIBILITY_DURATION, HR_FREEZE_DURATION,
    │                                    #   PERF_REVIEW_INTERVAL, COMBO_GLOW_DURATION, POWERUP_DROP_CHANCE);
    │                                    #   GameState extended (invincibility, freeze, perf review, combo glow,
    │                                    #   powerups[], particles[], reducedMotion, cutsceneState, performanceReviewTimer)
    ├── canvas.js                        # MODIFIED: resizeCanvas(); scrolling cityscape; scanlines; pixel font;
    │                                    #   HUD corporate skin; pause menu with Reduced Motion toggle;
    │                                    #   controls reminder on menu; cutscene renderer call
    ├── entities/
    │   ├── sprites.js                   # MODIFIED: briefcase player sprite; envelope projectile sprite;
    │   │                                #   pamphlet projectile sprite
    │   ├── player.js                    # MODIFIED: invincibilityTimer field; comboGlowTimer field; flash blink
    │   │                                #   in renderPlayer; golden glow in renderPlayer
    │   ├── alien.js                     # MODIFIED: protestSign slogan field (random from pool); isPerformanceReview
    │   │                                #   flag; speedMultiplier; pointsMultiplier; red tint in renderAlien
    │   ├── unionist.js                  # MODIFIED: drop power-up flag on defeat
    │   ├── boss.js                      # MODIFIED: preSequenceHighlightTimer field; amber pulse in renderBoss
    │   │                                #   hit zone pre-highlight
    │   ├── projectile.js                # MODIFIED: pamphletRotation field; spin update in updateProjectile;
    │   │                                #   envelope/pamphlet sprites in renderProjectile
    │   ├── shield.js                    # MODIFIED: emit steam particles on hit (calls particles.js)
    │   └── powerup.js                   # NEW: createPowerup, updatePowerup, renderPowerup
    ├── systems/
    │   ├── collision.js                 # MODIFIED: powerup pickup; invincibility guard; combo miss on
    │   │                                #   projectile-out-of-bounds; doubled points for perf-review alien
    │   ├── scoring.js                   # MODIFIED: resetCombo also called on miss; EMPLOYEE_OF_MONTH_THRESHOLD
    │   ├── levels.js                    # MODIFIED: flyerBaseCooldown 5.0 → 8.3; cutscene phase insertion
    │   ├── particles.js                 # NEW: createParticle, updateParticles, renderParticles
    │   └── cutscene.js                  # NEW: createCutsceneState, updateCutscene, renderCutscene
    └── audio/
        └── soundManager.js             # MODIFIED: per-alien-type SFX; elevator music boss theme; motivational
                                        #   jingle; sad trombone; HR voicemail synthesis
```

**Structure Decision**: Single project (Option 1 adapted) — identical to the previous feature. No structural reorganisation. Three new modules added (`powerup.js`, `particles.js`, `cutscene.js`); all other changes are modifications to existing files. No tests directory — manual browser testing per constitution.
