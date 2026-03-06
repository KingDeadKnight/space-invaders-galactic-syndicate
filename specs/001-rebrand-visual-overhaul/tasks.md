# Tasks: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Input**: Design documents from `specs/001-rebrand-visual-overhaul/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/entities.md ✅, contracts/systems.md ✅, quickstart.md ✅

**Tests**: No automated tests in scope (manual browser testing per constitution — plan.md §Technical Context).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Exact file paths included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: HTML/CSS prerequisites and GameState foundations that every user story builds on.

- [X] T001 Update `index.html` — add `<link>` for Google Fonts "Press Start 2P" in `<head>` and add fullscreen body/canvas CSS (`margin:0; display:flex; justify-content:center; align-items:center; width:100vw; height:100vh; overflow:hidden; background:#0a0a0a`)
- [X] T002 Add new gameplay constants to `src/game.js` (`INVINCIBILITY_DURATION=1.5`, `HR_FREEZE_DURATION=3.0`, `PERF_REVIEW_INTERVAL=30.0`, `COMBO_GLOW_DURATION=3.0`, `POWERUP_DROP_CHANCE=0.20`, `PRE_SEQUENCE_HIGHLIGHT_S=2.0`)
- [X] T003 Extend `GameState` returned by `initGame()` in `src/game.js` — add `hrFreezeTimer:0`, `performanceReviewTimer:PERF_REVIEW_INTERVAL`, `performanceReviewAlienIndex:null`, `powerups:[]`, `particles:[]`, `reducedMotion:false`, `cutsceneState:null`; add `'CUTSCENE'` to the `phase` enum comment

**Checkpoint**: Setup complete — all user story phases may now begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational phase required. Phase 1 captures all cross-cutting prerequisites. User story phases may proceed after Phase 1.

---

## Phase 3: User Story 1 — Fullscreen Immersive Layout (Priority: P1) 🎯 MVP

**Goal**: Canvas fills the entire browser window at any size and rescales instantly on resize, with letterbox/pillarbox centering on extreme aspect ratios.

**Independent Test**: Open the game at multiple window sizes and resize freely — canvas fills viewport with no borders, all content stays visible and proportional (quickstart.md FR-001–003 checklist).

- [X] T004 [US1] Implement `resizeCanvas(canvasEl)` export in `src/canvas.js` — compute `scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT)`; set `canvasEl.style.width` and `canvasEl.style.height` accordingly; export the function
- [X] T005 [US1] Wire up resize in `src/main.js` — call `resizeCanvas(canvasEl)` once on load after `initCanvas`; register `window.addEventListener('resize', () => resizeCanvas(canvasEl))`

**Checkpoint**: US1 independently testable — fullscreen layout works at any window size

---

## Phase 4: User Story 2 — Corporate Hell Visual Theme (Priority: P1)

**Goal**: Full "Corporate Hell" aesthetic — scrolling cityscape, scanlines, neon palette, protest signs on aliens, briefcase player sprite, envelope/pamphlet projectile sprites, and steam particles on shield hits.

**Independent Test**: Play through one wave — confirm all visual elements (background scroll, scanlines, alien protest signs, briefcase ship, envelope/pamphlet projectiles, shield steam) render correctly (quickstart.md FR-004–011 checklist).

- [X] T006 [P] [US2] Add `PROTEST_SLOGANS` constant array (eight HR slogans from data-model.md §3) and `protestSign` field to `createAlien()` in `src/entities/alien.js`; render sign text above sprite in `renderAlien()` using 6px pixel font in neon green
- [X] T007 [P] [US2] Replace player ship pixel-art array with 15×10 briefcase silhouette and update job-offer (player projectile) with 4×6 white envelope definition in `src/entities/sprites.js`
- [X] T008 [P] [US2] Add `rotation:0` and `rotationSpeed:4.0` fields to `createFlyerProjectile()` in `src/entities/projectile.js`; increment `rotation` by `rotationSpeed * dt` in `updateProjectile()`; render spinning red pamphlet (`ctx.translate`+`ctx.rotate`) and envelope player shot in `renderProjectile()`, all wrapped in `ctx.save()`/`ctx.restore()`
- [X] T009 [P] [US2] Create `src/systems/particles.js` — export `createParticle(x,y,vx,vy,life,color,size)`, `emitSteamParticles(shield, particles)` (5 steam particles per call, per contracts/systems.md spec), `updateParticles(particles, dt)` (physics step + dead-particle splice), `renderParticles(ctx, particles, reducedMotion)` (alpha-faded squares, skipped when reducedMotion)
- [X] T010 [US2] Implement `_renderCityscape(ctx, cityscapeOffset, reducedMotion)` (25–30 building `fillRect` silhouettes, near-black `#0a0a14`, scrolling at 15 px/s logical) and `_renderScanlines(ctx)` (0.06 alpha black stripes every 4 px) as private helpers in `src/canvas.js`; integrate both into `render()` — cityscape after sky fill, scanlines as final layer; advance `_cityscapeOffset` each frame unless `reducedMotion` is true
- [X] T011 [US2] Call `emitSteamParticles(shield, state.particles)` on each shield–projectile collision in `src/systems/collision.js`; add `updateParticles(state.particles, dt)` to game update loop in `src/game.js`; add `renderParticles(ctx, state.particles, state.reducedMotion)` call after shields render in `src/canvas.js`

**Checkpoint**: US2 independently testable — full visual theme visible in one play session

---

## Phase 5: User Story 3 — Corporate Typography & UI Skin (Priority: P2)

**Goal**: All text uses "Press Start 2P" pixel font; score area styled as a corporate dashboard widget; UI copy uses HR jargon throughout.

**Independent Test**: View main menu, HUD during play, and game-over screen — all text is in pixel font, score area has a bordered panel, and HR jargon labels are present (quickstart.md FR-012–014 checklist).

- [X] T012 [US3] Replace all `ctx.font` string assignments in `src/canvas.js` with `"Press Start 2P"` (with `"Courier New", monospace` fallback); adjust font size values where needed to preserve layout
- [X] T013 [US3] Style the score/HUD area as a bordered corporate dashboard panel in `src/canvas.js` (`strokeRect` with neon accent, label reads "KPIs" / "SYNERGIES" etc.); update main menu and game-over copy with HR jargon (e.g., "LEVERAGE THIS", "UNION SUPPRESSION RATE") throughout renderers in `src/canvas.js`

**Checkpoint**: US3 independently testable — pixel font and corporate UI visible on all screens

---

## Phase 6: User Story 4 — Gameplay Balancing for Fairness (Priority: P2)

**Goal**: Aliens fire ~40% less often; player has a 1.5 s invincibility window after being hit (with blink cue); boss hit zones pulse amber for 2 s before the sequence opens.

**Independent Test**: Play a full session — count alien fire rate (noticeably lower) and confirm post-hit blink for ~1.5 s during which no damage is taken; enter a boss fight and observe 2 s amber zone highlight (quickstart.md FR-015–019 checklist).

- [X] T014 [P] [US4] Change `flyerBaseCooldown` from `5.0` to `8.3` in `getLevelConfig()` in `src/systems/levels.js` (single constant change per R-008)
- [X] T015 [P] [US4] Add `invincibilityTimer:0` field to `createPlayer()` in `src/entities/player.js`; decrement by `dt` (clamp to 0) in `updatePlayer()`; add blink-skip in `renderPlayer()` — return early when `invincibilityTimer > 0 && Math.floor(invincibilityTimer * 8) % 2 === 1`
- [X] T016 [P] [US4] Add `preSequenceHighlightTimer:0` to `createBoss()` in `src/entities/boss.js`; add amber-pulsing hit-zone outline in `renderBoss()` when `preSequenceHighlightTimer > 0` (`ctx.strokeStyle='#ffaa00'`, alpha via `Math.sin`); set timer to `PRE_SEQUENCE_HIGHLIGHT_S` on boss spawn in the BOSS phase transition in `src/game.js`
- [X] T017 [US4] Add invincibility guard in `src/systems/collision.js` — skip damage when `state.player.invincibilityTimer > 0` (still deactivate the projectile); set `state.player.invincibilityTimer = INVINCIBILITY_DURATION` on damage application

**Checkpoint**: US4 independently testable — balancing changes observable in a single play session

---

## Phase 7: User Story 5 — New Gameplay Mechanics (Priority: P2)

**Goal**: HR Meeting power-up (alien freeze); Performance Review alien (red, faster, 2× points); Employee of the Month glow (5 consecutive hits); Quarterly Review cutscene between waves and boss.

**Independent Test**: Each mechanic can be triggered and verified independently — wait for power-up drop, 30 s for Performance Review, land 5 hits for glow, complete a wave for cutscene (quickstart.md FR-020–028 checklist).

- [X] T018 [P] [US5] Create `src/entities/powerup.js` — export `createPowerup(x, y, type)` (returns PowerUp plain object per data-model.md §7), `updatePowerup(powerup, dt)` (drift down at 40 px/s; deactivate when `y > CANVAS_HEIGHT + 20`), `renderPowerup(ctx, powerup)` (12×12 cyan rect, centred "HR" text in red pixel font)
- [X] T019 [P] [US5] Add `isPerformanceReview:false`, `speedMultiplier:1.0`, `pointsMultiplier:1.0` fields to `createAlien()` in `src/entities/alien.js`; export `activatePerformanceReview(alien)` (sets flags to 1.5/2.0) and `deactivatePerformanceReview(alien)` (resets to defaults); add red tint overlay + `shadowColor:#ff2244` in `renderAlien()` when `isPerformanceReview === true`
- [X] T020 [P] [US5] Add `comboGlowTimer:0` field to `createPlayer()` in `src/entities/player.js`; decrement by `dt` in `updatePlayer()`; add golden glow in `renderPlayer()` when `comboGlowTimer > 0` — set `ctx.shadowColor='#ffd700'; ctx.shadowBlur=12` before drawing sprite (wrapped in `ctx.save()`/`ctx.restore()`)
- [X] T021 [P] [US5] Export `EMPLOYEE_OF_MONTH_THRESHOLD = 5` from `src/systems/scoring.js`; extend `addPoints(score, entityType, multiplier = 1.0)` signature with optional `multiplier` param; multiply base points by `multiplier`; add second `resetCombo(score)` call site for projectile-miss out-of-bounds (top of canvas) in `src/systems/collision.js`
- [X] T022 [US5] Create `src/systems/cutscene.js` — export `createCutsceneState(score, level)` (builds CutsceneState with four KPI bars per data-model.md §9), `updateCutscene(cutsceneState, dt, input)` (advances timer, grows barProgress over 1.5 s, returns `true` when complete or skipped via `input.fire`), `renderCutscene(ctx, cutsceneState)` (dark overlay, header, four animated `fillRect` bars, `"[ SPACE ] SKIP"` prompt)
- [X] T023 [US5] Extend `updateUnionist()` in `src/entities/unionist.js` to return `{ shouldDropPowerup: boolean }` (true when alien just died and `Math.random() < POWERUP_DROP_CHANCE`); in the game update loop in `src/game.js`, read the return value and call `createPowerup(unionist.x, unionist.y, 'hr-meeting')` → push to `state.powerups[]` when true
- [X] T024 [US5] Add power-up pickup AABB check in `src/systems/collision.js` — on overlap with `state.player`: `powerup.active = false`, `state.hrFreezeTimer = HR_FREEZE_DURATION`; in game update loop in `src/game.js` skip alien/boss `update` calls when `state.hrFreezeTimer > 0` (decrement timer each tick); add `updatePowerup` loop and `renderPowerup` call into game/render flow in `src/game.js` and `src/canvas.js`
- [X] T025 [US5] Wire 30 s Performance Review timer in game update loop in `src/game.js` — decrement `state.performanceReviewTimer`; when it reaches 0 and `state.performanceReviewAlienIndex === null`, call `activatePerformanceReview` on a random active alien, store its index; clear index when that alien is destroyed; pass `alien.pointsMultiplier` to `addPoints()` in `src/systems/collision.js` for all alien-destruction scoring calls
- [X] T026 [US5] Wire combo-glow trigger in `src/game.js` update loop — after `addPoints`, check `score.consecutiveHits > 0 && score.consecutiveHits % EMPLOYEE_OF_MONTH_THRESHOLD === 0`; if true set `state.player.comboGlowTimer = COMBO_GLOW_DURATION`; also add projectile-miss combo reset in `src/systems/collision.js` (player projectile exits `y < 0` → call `resetCombo(state.score)`)
- [X] T027 [US5] Insert CUTSCENE phase in `src/game.js` — on wave-clear (all aliens inactive), set `state.phase = 'CUTSCENE'` and `state.cutsceneState = createCutsceneState(state.score, state.level)`; each tick call `updateCutscene(state.cutsceneState, dt, state.input)`; on return `true` clear `cutsceneState`, advance to BOSS phase; add `renderCutscene(ctx, state.cutsceneState)` to the `'CUTSCENE'` case in `src/canvas.js`

**Checkpoint**: US5 independently testable — all four mechanics triggerable and observable in one session

---

## Phase 8: User Story 6 — Audio Improvements (Priority: P3)

**Goal**: Each alien type has a unique destruction SFX; boss fight plays elevator music; power-up pickup plays jingle; game over plays sad trombone then HR voicemail.

**Independent Test**: Trigger each audio event (destroy each alien type, reach boss, collect power-up, lose game) and confirm correct distinct sound each time (quickstart.md FR-029–032 checklist).

- [X] T028 [US6] Add `playAlienDestroyed(theme)` to `src/audio/soundManager.js` — per-theme synthesised SFX: `'it'` → high-freq square blip (C6→A5, 0.15 s); `'accounting'` → triangle ping (880 Hz, 0.2 s); `'management'` → sine thud (120→60 Hz, 0.3 s); `'unionist'` → sawtooth buzzer (200 Hz, 0.2 s); `'boss'` → white noise burst (lowpass 300 Hz, 0.5 s)
- [X] T029 [US6] Add `startBossTheme()` and `stopBossTheme()` to `src/audio/soundManager.js` — elevator music: descending chromatic bass motif at 60 BPM, counter-melody on filtered sawtooth (~800 Hz bandpass), 8-bar loop; `stopBossTheme()` disconnects the loop node
- [X] T030 [US6] Add `playJingle()` to `src/audio/soundManager.js` — ascending C4→E4→G4 fanfare on square oscillator, 0.1 s per note, fast attack, one-shot
- [X] T031 [US6] Add `playGameOver()` to `src/audio/soundManager.js` — sad trombone descending chromatic scale (B♭4→G4, sawtooth + 5 Hz vibrato LFO, ~2.5 s); schedule HR voicemail immediately after (440+480 Hz DTMF beep → 1 s band-limited noise formant → final beep); use `AudioContext` time-scheduling
- [X] T032 [US6] Wire all audio calls in `src/game.js` and `src/systems/collision.js` — alien destroyed → `playAlienDestroyed(alien.theme)`; boss phase start → `startBossTheme()`; boss defeated → `stopBossTheme()`; power-up collected → `playJingle()`; game-over state trigger → `playGameOver()`

**Checkpoint**: US6 independently testable — all five audio events play distinct sounds

---

## Phase 9: User Story 7 — Accessibility Controls & Reduced Motion (Priority: P3)

**Goal**: Escape key pauses game; main menu shows controls reference; pause menu has Reduced Motion toggle that disables parallax and particles.

**Independent Test**: Test on main menu (controls panel visible) and during gameplay (Escape pause, Reduced Motion toggle disables cityscape scroll, particles, scanlines) without needing any other story complete (quickstart.md FR-033–036 checklist).

- [X] T033 [P] [US7] Map Escape key to the pause action in `src/main.js` `keydown` handler — add `case 'escape':` alongside the existing `'p'` case so both keys set `state.input.pause = true`
- [X] T034 [P] [US7] Add controls reference panel to the main menu render in `src/canvas.js` — draw a bordered panel listing all inputs (←/→/A/D Move, Space Fire, Esc/P Pause, M Mute) in pixel font below the start prompt
- [X] T035 [US7] Implement `_renderPauseOverlay(ctx, state)` in `src/canvas.js` with a semi-transparent dim overlay, "PAUSED" header, and a toggleable "REDUCED MOTION" button; wire the toggle to flip `state.reducedMotion` in `src/game.js` pause-input handler; ensure `reducedMotion` flag is read correctly by `_renderCityscape`, `_renderScanlines`, and `renderParticles` (already gated on reducedMotion per T009/T010)

**Checkpoint**: US7 independently testable — pause and accessible reduced-motion path verified

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: JSDoc coverage for all new/modified exports (required per plan.md constitution) and final manual verification pass.

- [X] T036 [P] Add JSDoc to all exported functions in new modules: `src/entities/powerup.js`, `src/systems/particles.js`, `src/systems/cutscene.js` (JSDoc per plan.md II. Document Everything)
- [X] T037 [P] Add JSDoc to all new/modified exports in `src/entities/alien.js`, `src/entities/player.js`, `src/entities/boss.js`, `src/entities/projectile.js`, `src/entities/unionist.js`
- [X] T038 [P] Add JSDoc to all new/modified exports in `src/systems/collision.js`, `src/systems/scoring.js`, `src/systems/levels.js`, `src/canvas.js`, `src/audio/soundManager.js`
- [ ] T039 Run the full manual test checklist in `specs/001-rebrand-visual-overhaul/quickstart.md`; fix any regressions before merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 3)**: Depends on Phase 1 (needs fullscreen CSS from T001 and `CANVAS_WIDTH`/`CANVAS_HEIGHT` constants)
- **US2 (Phase 4)**: Depends on Phase 1; best after US1 so fullscreen is visually correct during review
- **US3 (Phase 5)**: Depends on Phase 1; independent of US1/US2 (different canvas code paths)
- **US4 (Phase 6)**: Depends on Phase 1 (needs constants); independent of US1–US3
- **US5 (Phase 7)**: Depends on Phase 1; T009 (particles.js) from US2 must exist before T024 uses `state.particles`; T021 scoring changes must be done before T025/T026 wire calls
- **US6 (Phase 8)**: Depends on Phase 1; fully independent of all other user stories
- **US7 (Phase 9)**: Depends on Phase 1; T035 (pause overlay) integrates with reducedMotion flag set by T010 (US2) — best after US2
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Can start after | Hard dependency |
|-------|----------------|-----------------|
| US1 | Phase 1 | None |
| US2 | Phase 1 | None (US1 recommended first for visual review) |
| US3 | Phase 1 | None |
| US4 | Phase 1 | None |
| US5 | Phase 1 | T009 (particles.js from US2) must exist before T024 |
| US6 | Phase 1 | None |
| US7 | Phase 1 | T010 (reducedMotion flag from US2) should exist before T035 |

### Within Each User Story

- Implementation tasks that edit different files are marked [P] and can run concurrently
- Tasks that edit the same file (e.g., multiple canvas.js changes within US2) run sequentially
- Wire-up / integration tasks (T011, T017, T024–T027, T032, T035) always come last within their story

### Parallel Opportunities

- **Phase 1**: T002 and T003 edit the same file (game.js) — sequential
- **Phase 4 (US2)**: T006, T007, T008, T009 each edit different files — all four can run in parallel; T010 and T011 follow sequentially
- **Phase 6 (US4)**: T014 (levels.js), T015 (player.js), T016 (boss.js) — all three can run in parallel; T017 (collision.js) follows
- **Phase 7 (US5)**: T018 (powerup.js), T019 (alien.js), T020 (player.js), T021 (scoring.js) — all four can run in parallel; T022 (cutscene.js) also parallel; T023–T027 follow sequentially
- **Phase 10**: T036, T037, T038 each cover different files — all three can run in parallel

---

## Parallel Example: User Story 2 (Corporate Hell Visual Theme)

```bash
# Agent A                         # Agent B                         # Agent C
T006 alien.js protest signs       T007 sprites.js briefcase/env     T008 projectile.js pamphlet spin
                                                                     T009 particles.js (new module)
# All four complete
T010 canvas.js cityscape+scanline (sequential — builds on T009)
T011 collision.js+canvas.js wire  (sequential — integrates T009+T010)
```

## Parallel Example: User Story 5 (New Gameplay Mechanics)

```bash
# Agent A                         # Agent B                         # Agent C                       # Agent D
T018 powerup.js (new)             T019 alien.js perf-review         T020 player.js glow timer       T021 scoring.js multiplier
                                                                     T022 cutscene.js (new)
# All complete
T023 unionist.js + game.js drop logic (sequential)
T024 collision.js pickup + game.js freeze (sequential)
T025 game.js perf-review timer (sequential)
T026 game.js glow trigger + collision.js miss reset (sequential)
T027 game.js cutscene phase + canvas.js case (sequential)
```

---

## Implementation Strategy

**MVP scope** (suggested): Complete Phase 1 (Setup) + Phase 3 (US1 Fullscreen) only — game is playable and foundational visual scaffolding is in place. All subsequent phases add independently verifiable increments.

**Recommended delivery order** (single developer):
1. Phase 1 → Phase 3 (US1) — foundation visible immediately
2. Phase 4 (US2) — headline visual theme
3. Phase 5 (US3) — typography skin (mostly canvas.js, fast)
4. Phase 6 (US4) — balancing (three small targeted changes + collision guard)
5. Phase 7 (US5) — new mechanics (largest phase; do T018–T022 first as new modules, then wire up)
6. Phase 8 (US6) — audio (fully isolated, self-contained)
7. Phase 9 (US7) — accessibility (small, fully isolated)
8. Phase 10 — JSDoc + final test pass

**Total tasks**: 39 (T001–T039)
