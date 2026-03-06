# Tasks: Syndicat Galactique

**Input**: Design documents from `specs/001-syndicat-galactique/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Automated tests are explicitly **out of scope** (manual browser testing only — Chrome 90+, Firefox 90+). No test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US8)
- No Story label = Setup or Foundational phase task
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository skeleton and deployment wiring — zero game logic. Establishes the entry point and CI workflow required by all subsequent work.

- [X] T001 Create project file structure: `index.html` (canvas element, `<script type="module" src="src/main.js">`), and empty placeholder files for all `src/` modules per plan.md directory tree (`src/main.js`, `src/game.js`, `src/canvas.js`, `src/entities/sprites.js`, `src/entities/player.js`, `src/entities/alien.js`, `src/entities/unionist.js`, `src/entities/boss.js`, `src/entities/projectile.js`, `src/entities/shield.js`, `src/systems/collision.js`, `src/systems/scoring.js`, `src/systems/levels.js`, `src/audio/soundManager.js`)
- [X] T002 [P] Implement GitHub Pages deploy workflow in `.github/workflows/deploy.yml` (single-job, `actions/checkout@v4`, `upload-pages-artifact path: '.'`, `deploy-pages@v4`, `pages: write` + `id-token: write` permissions, triggers: push to main + `workflow_dispatch`)

**Checkpoint**: Repository opens in browser via `file://` in Firefox and `http://localhost:8080` in Chrome (blank canvas page, no errors in console).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core engine scaffolding that every user story builds on. Must be complete before any game feature can be wired together.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Define all game constants (`CANVAS_WIDTH=480`, `CANVAS_HEIGHT=640`, `PIXEL_SCALE=3`, `FIXED_STEP_S=1/60`, `SLOW_DURATION=2.5`, `SLOW_MULTIPLIER=0.4`, `SHIELD_DEGRADE_INTERVAL=8.0`, `SEQUENCE_TIMEOUT=5.0`, `BASE_POINTS=10`, `PLAYER_LIVES=3`, `SHOT_COOLDOWN=0.25`) as named exports at the top of `src/game.js` or a dedicated constants block (no separate file per KISS — inline in the module that owns them)
- [X] T004 [P] Implement `SPRITES` named export skeleton in `src/entities/sprites.js` — define the full map shape (`player`, `alien.it/accounting/management` for `regular`/`unionist`, `boss`, `shield`, `jobOffer`, `flyer`) with single-frame 2×2 solid-colour placeholder arrays so all render calls have a valid reference before artwork is finalised
- [X] T005 [P] Implement `initCanvas(canvasEl) → CanvasRenderingContext2D` in `src/canvas.js`: set `canvas.width = CANVAS_WIDTH`, `canvas.height = CANVAS_HEIGHT`, apply CSS `image-rendering: pixelated`, return `ctx`; add stub `render(ctx, state) → void` and stub `renderHUD(ctx, state) → void` so main.js can import them without errors
- [X] T006 Implement fixed-timestep rAF game loop and `InputState` in `src/main.js`: obtain `<canvas>` element, call `initCanvas()`, instantiate `InputState` (`{ left, right, fire, pause, mute }` all `false`), register `keydown`/`keyup` listeners (Arrow keys, A/D, Space, P/Escape, M), call `initGame()`, start rAF loop with accumulator pattern (`delta` clamped to 250 ms, drain in `FIXED_STEP_S` chunks calling `updateGame`, then `render`); wire first-keydown to call `audioManager.resumeContext()` placeholder

**Checkpoint**: Browser console shows no errors; canvas element is visible and correctly sized; key events log to console.

---

## Phase 3: User Story 1 — Core Gameplay Loop (Priority: P1) 🎯 MVP

**Goal**: Player opens the game, sees the title screen, starts a match, moves the HR Manager left/right, fires job offers upward, hits regular aliens to clear a wave, and progresses to the next wave.

**Independent Test**: Launch game → press Start → move with arrow keys → fire with Space → confirm projectile travels upward and disappears on alien hit → confirm alien is removed → confirm wave clears and next wave appears.

- [X] T007 [P] [US1] Implement `createPlayer(canvasWidth, canvasHeight) → Player`, `updatePlayer(player, input, dt) → void`, `fireJobOffer(player) → Projectile | null`, `applySlowDebuff(player) → void`, and `renderPlayer(ctx, player) → void` in `src/entities/player.js` using SPRITES.player and data-model.md field definitions; JSDoc required on all exports
- [X] T008 [P] [US1] Implement `createAlien(x, y, theme) → Alien`, `updateAlien(alien, dt) → void`, `hitAlien(alien) → number`, `shouldFire(alien, dt) → boolean`, and `renderAlien(ctx, alien) → void` (sprite + mood bar) in `src/entities/alien.js`; mood bar rendered as a small `fillRect` above sprite proportional to `mood/100`; JSDoc required
- [X] T009 [P] [US1] Implement `createJobOffer(x, y) → Projectile`, `createFlyerProjectile(x, y) → Projectile`, `updateProjectile(projectile, dt, canvasHeight) → void` (sets `active = false` on out-of-bounds), and `renderProjectile(ctx, projectile) → void` in `src/entities/projectile.js`; JSDoc required
- [X] T010 [US1] Implement `getLevelConfig(levelNum) → LevelConfig` (all 3 level configs) and `buildAlienFormation(levelConfig, canvasWidth) → Alien[]` (flat array, uniform `ALIEN_SPACING_X`/`ALIEN_SPACING_Y`, unionists in bottom rows per ratio) and `updateFormationMovement(aliens, formationState, dt, canvasWidth) → void` (horizontal sweep, wall-detect drop + reverse, speed increase as aliens cleared) with `FormationState` shape in `src/systems/levels.js`; JSDoc required
- [X] T011 [US1] Implement `checkAABB(a, b) → boolean` (half-extent AABB, centre-anchored) and `processCollisions(state) → void` (job-offer-vs-alien hit: call `hitAlien`, deactivate projectile, call `addPoints`; job-offer-vs-top-boundary deactivation safety; alien-vs-bottom-boundary → `gameOver`; filter `active = false` entities at end) in `src/systems/collision.js`; JSDoc required
- [X] T012 [US1] Implement `createScore() → Score`, `addPoints(score, entityType) → void` (BASE_POINTS × comboMultiplier for regular; ×3 for unionist; ×50 for boss; increments `consecutiveHits`; updates `comboMultiplier = 1 + floor(consecutiveHits/5)` capped at 8), `resetCombo(score) → void`, and `getComboMultiplier(score) → number` in `src/systems/scoring.js`; JSDoc required
- [X] T013 [US1] Implement `initGame(canvasWidth, canvasHeight) → GameState`, `startGame(state) → void` (phase → PLAYING, build Level 1 formation, no shields yet, reset score/player), `pauseGame(state) → void`, `resumeGame(state) → void` (reset delta seed), `gameOver(state) → void`, and `updateGame(state, dt) → void` (in contract order: updatePlayer → fire logic → updateAliens/formation → updateProjectiles → updateShields → processCollisions → win/lose check) in `src/game.js`; initial `levelPhase = 'WAVE'`; JSDoc required
- [X] T014 [US1] Fill in `render(ctx, state) → void` and `renderHUD(ctx, state) → void` in `src/canvas.js` for `MENU` phase (title "Syndicat Galactique", Start prompt) and `PLAYING` phase (clear canvas, render aliens, render player, render active projectiles, call `renderHUD`); HUD shows score label "HR Satisfaction Rate" and lives; JSDoc required
- [X] T015 [US1] Wire `src/main.js` fully: import `initGame`, `startGame`, `updateGame` from `game.js`; import `render` from `canvas.js`; on Space/Enter at MENU phase call `startGame`; handle pause toggle (P/Escape); confirm rAF loop drives update + render at 60fps

**Checkpoint**: Full US1 playable — title screen → start → move → shoot → clear aliens → next wave appears. No console errors. Chrome + Firefox manual test passing.

---

## Phase 4: User Story 7 — Win and Lose States (Priority: P1)

**Goal**: Game ends correctly in both win and loss. Correct end-screen message appears. Player can restart from either screen.

**Independent Test**: (a) Allow alien wave to descend past player boundary → confirm "General strike declared. You are fired." screen appears with restart option. (b) Manually trigger win state (modify level to 4) → confirm "Galaxy is back to work. Promoted to CHRO!" screen appears.

- [X] T016 [US7] Implement `advanceLevel(state) → void` in `src/game.js`: if `state.level >= 3` after boss defeated → `state.phase = 'WIN'`; otherwise increment level, rebuild alien formation with new `LevelConfig`, reset `levelPhase` to `'WAVE'`; also implement `restartGame(state, canvasWidth, canvasHeight) → void` (reset all fields to MENU initial conditions in-place); JSDoc required
- [X] T017 [US7] Implement `GAMEOVER` and `WIN` screen rendering in `src/canvas.js` `render()`: GAMEOVER shows "General strike declared. You are fired." centered; WIN shows "Galaxy is back to work. Promoted to CHRO!" centered; both show a "Press Space to restart" prompt; JSDoc updated
- [X] T018 [US7] Wire restart input in `src/main.js`: on Space/Enter when `state.phase === 'GAMEOVER'` or `'WIN'`, call `restartGame(state, CANVAS_WIDTH, CANVAS_HEIGHT)`

**Checkpoint**: Both end states reachable and display correct messages. Restart returns to title screen. US1 + US7 form a complete, releasable game loop.

---

## Phase 5: User Story 2 — Alien Variety and Mood Indicators (Priority: P2)

**Goal**: Waves contain both Regular Aliens (1 hit) and Hardened Unionists (3 hits). Each alien displays a live mood bar. Unionist is visually distinct and shows fist-shake on hit.

**Independent Test**: Start a wave that includes unionists → confirm hitting a unionist three times removes it while single hit does not → confirm mood bar decrements on each hit → confirm unionist is visually larger/angrier than regular alien.

- [X] T019 [P] [US2] Add Unionist sprite frames to `SPRITES` in `src/entities/sprites.js`: give the unionist a distinct appearance for all 3 themes (e.g., bigger body, angrier expression) plus a `fistShake` frame (2-frame animation); update the sprites map shape accordingly
- [X] T020 [P] [US2] Implement `createUnionist(x, y, theme) → Unionist`, `hitUnionist(unionist) → number` (3-hit logic, fist-shake trigger, mood state transitions per data-model.md), `updateUnionist(unionist, dt) → void` (extends updateAlien: tick `fistShakeTimer`, clear `fistShaking` on expiry), and `renderUnionist(ctx, unionist) → void` (fist-shake frame when `fistShaking === true`, mood bar) in `src/entities/unionist.js`; JSDoc required
- [X] T021 [US2] Update `buildAlienFormation` in `src/systems/levels.js` to instantiate `Unionist` objects (via `createUnionist`) in the bottom rows according to `levelConfig.regularRatio`; import `createUnionist` from `src/entities/unionist.js`
- [X] T022 [US2] Extend `processCollisions` in `src/systems/collision.js` to distinguish alien type: call `hitUnionist` for `type === 'unionist'` entities and call `addPoints(score, 'unionist')` on defeat; update imports

**Checkpoint**: Wave with mixed alien types works correctly. Mood bar visible and updating. Unionist requires 3 hits. Fist-shake animation plays on hit.

---

## Phase 6: User Story 3 — Alien Counter-Mechanics (Priority: P2)

**Goal**: Aliens fire protest flyers downward. Flyers hitting the player apply a slow debuff. Coffee pot shields absorb flyers and degrade visually (on hit and passively over time). Destroyed shields are removed.

**Independent Test**: Observe alien flyer projectiles descending → position player in path → confirm slow debuff activates and movement visibly slows → confirm flyer hits shield → shield shows visual crack → confirm after enough hits shield disappears.

- [X] T023 [P] [US3] Add shield sprite frames (5 degradation stages: full → badly cracked → destroyed) to `SPRITES.shield` in `src/entities/sprites.js`
- [X] T024 [P] [US3] Implement `createShields(canvasWidth, canvasHeight) → Shield[]` (4 evenly-spaced shields), `updateShield(shield, dt) → void` (passive `degradeTimer` countdown, apply `durability--` on timer expiry if `durability > 0`, reset timer), `damageShield(shield) → void` (`durability--`, set `active = false` if 0), and `renderShield(ctx, shield) → void` (draw `SPRITES.shield.frames[shield.durability]` stage) in `src/entities/shield.js`; JSDoc required
- [X] T025 [US3] Enable alien flyer firing in `updateGame` in `src/game.js`: each tick, iterate active aliens, call `shouldFire(alien, dt)`; on `true`, create a `createFlyerProjectile(alien.x, alien.y)` and push to `state.projectiles`; also initialise shields via `createShields` in `startGame`
- [X] T026 [US3] Extend `processCollisions` in `src/systems/collision.js` with: flyer-vs-shield → `damageShield(shield)`, deactivate flyer; flyer-vs-player → `applySlowDebuff(player)`, `resetCombo(score)`, deactivate flyer (decrement lives if `FLYER_KILLS_ON_DIRECT_HIT` per implementation decision — leave as `false` for now, direct hit just debuffs); alien-at-bottom-row check already present (US1) — verify still works
- [X] T027 [US3] Add shield rendering to the `PLAYING`/`PAUSED` render path in `src/canvas.js`: iterate `state.shields`, call `renderShield(ctx, shield)` for each active shield; JSDoc updated

**Checkpoint**: Alien flyers fire, slow debuff applies on player hit, shields absorb and degrade visually, passive degradation ticks, destroyed shields vanish.

---

## Phase 7: User Story 6 — Scoring System (Priority: P2)

**Goal**: HR Satisfaction Rate and Employee Engagement Bonus combo multiplier are both displayed live. Consecutive hits build the multiplier. Player hit resets it.

**Independent Test**: Hit 5 aliens without being hit → confirm bonus multiplier shows ×2 → get hit by flyer → confirm multiplier resets to ×1 → confirm score values increase with higher multiplier active.

- [X] T028 [US6] Verify and complete full point calculus in `src/systems/scoring.js` (already scaffolded in T012): ensure multiplier increment logic (`1 + floor(consecutiveHits/5)`, max 8×) is correct, and `resetCombo` wired from `processCollisions` (already done in US3/T026); add `getComboMultiplier` pure function if not yet present; JSDoc complete
- [X] T029 [US6] Implement full `renderHUD(ctx, state)` in `src/canvas.js`: display "HR Satisfaction Rate: [points]" prominently (top-left), "Employee Engagement Bonus: ×[multiplier]" (only show when > 1×), lives as icons or number (top-right), current level label; use pixel-art-appropriate font size and color; JSDoc updated

**Checkpoint**: HUD shows score and multiplier at all times. Score increases correctly. Multiplier builds with consecutive hits and resets on player hit.

---

## Phase 8: User Story 4 — Level Progression and Alien Themes (Priority: P2)

**Goal**: All 3 levels load in sequence with distinct alien themes, increasing speed, and larger formations. Level-complete transition works.

**Independent Test**: Clear Level 1 → confirm level-complete screen briefly appears → confirm Level 2 loads with Accounting theme sprites and slightly faster/denser formation → clear Level 2 → confirm Level 3 loads with Management theme at greater difficulty.

- [X] T030 [P] [US4] Flesh out themed alien sprite frames in `src/entities/sprites.js`: give `SPRITES.alien.it`, `accounting`, and `management` visually distinct `regular` and `unionist` frames (different accessories/signs per theme — e.g., laptop signs for IT, spreadsheets for Accounting, org-chart pointer for Management); protest-sign 2-frame animation per theme
- [X] T031 [P] [US4] Ensure `getLevelConfig` in `src/systems/levels.js` returns correct differentiated configs for all 3 levels (Level 1: 4 rows × 8 cols, Level 2: 5 × 9, Level 3: 5 × 10; `alienBaseSpeed` and `flyerFrequency` scaling; `regularRatio` decreasing; `bossSequenceLength` 3/4/5); update `buildAlienFormation` to apply theme from config to all aliens
- [X] T032 [US4] Add `TRANSITION` `levelPhase` handling to `updateGame` in `src/game.js`: when wave cleared (`aliens.filter(a => a.active).length === 0` and `levelPhase === 'WAVE'`) call `triggerBoss(state)`; after boss defeated call `advanceLevel(state)`; implement brief `TRANSITION` pause (1.5 s) between wave clear and boss spawn using a `transitionTimer` on `GameState`
- [X] T033 [US4] Add level-complete transition overlay and level indicator to `render` in `src/canvas.js`: during `levelPhase === 'TRANSITION'` show "Level [N] Complete!" overlay; add level label to HUD; ensure theme is read from `state.levelConfig.theme` for background tint or label

**Checkpoint**: All 3 levels load in sequence with correct themes, increasing difficulty. Level-complete transition visible. Formation speed and density scale as specified.

---

## Phase 9: User Story 5 — End-of-Level Boss: The Negotiator (Priority: P3)

**Goal**: After clearing each wave, a Boss Negotiator appears. Player must hit the displayed zone sequence correctly to defeat it. Wrong hits reset the sequence. Boss descends and fires flyers.

**Independent Test**: Trigger boss fight → confirm sequence indicator displays required zones → hit zones in correct order → confirm boss is defeated → hit wrong zone → confirm sequence resets → confirm boss fires flyers downward.

- [X] T034 [P] [US5] Add Boss sprite frames to `SPRITES.boss` in `src/entities/sprites.js`: suited executive, 2-frame idle animation, pixel art; add zone-hit flash overlay colours (green for correct, red for wrong)
- [X] T035 [P] [US5] Implement `createBoss(level, canvasWidth) → Boss`, `updateBoss(boss, dt, canvasWidth) → void` (horizontal bounce movement, sequence timer countdown → reset on expiry, decrement `flyerCooldown`, tick flash timer), `hitBoss(boss, zoneIndex) → 'correct' | 'wrong' | 'defeated'` (correct: advance progress or return 'defeated'; wrong: reset progress + timer + flash), `shouldBossFire(boss, dt) → boolean`, and `renderBoss(ctx, boss) → void` (sprite + zone indicator boxes above boss showing required sequence with progress highlighted + countdown bar) in `src/entities/boss.js`; JSDoc required
- [X] T036 [US5] Implement `triggerBoss(state) → void` in `src/game.js`: set `state.levelPhase = 'BOSS'`, create `Boss` via `createBoss(state.level, CANVAS_WIDTH)`, assign to `state.boss`; add boss update call in `updateGame` when `levelPhase === 'BOSS'`; add boss flyer firing logic (call `shouldBossFire`, push flyer projectile); on boss defeated (hitBoss returns 'defeated') call `addPoints(score, 'boss')` then start `TRANSITION` phase
- [X] T037 [US5] Extend `processCollisions` in `src/systems/collision.js` for boss: job-offer-vs-boss — compute which zone (0/1/2) the projectile's x falls in relative to boss bounds, call `hitBoss(boss, zoneIndex)`, handle result (`addPoints` on 'correct', `playSFX` stubs, `resetCombo` on 'wrong'), deactivate projectile; JSDoc updated
- [X] T038 [US5] Add boss rendering to `PLAYING`/`PAUSED` render branch in `src/canvas.js`: when `state.levelPhase === 'BOSS'` and `state.boss` is active, call `renderBoss(ctx, state.boss)`

**Checkpoint**: Boss appears after wave clear, zone sequence displays, correct hits advance/defeat boss, wrong hits reset, boss fires flyers, level advances on boss defeat.

---

## Phase 10: User Story 8 — Visual Style and Audio (Priority: P3)

**Goal**: Full pixel art presentation — aliens in suits, animated protest signs, theme backgrounds. Lofi background music plays throughout with mute toggle. SFX play on game events.

**Independent Test**: Launch game → confirm alien sprites clearly render as pixel-art suited characters with animated signs → confirm lofi music starts on first key press → press M → confirm music mutes/unmutes → confirm hit sound plays on alien hit.

- [X] T039 [P] [US8] Implement `initAudio() → AudioManager`, `resumeContext(audioManager) → void`, `startBGM(audioManager) → void` (look-ahead scheduler: `setInterval` at ~25 ms, schedule notes up to 100 ms ahead using `AudioContext.currentTime`; square/sawtooth oscillators for melody, triangle for bass, noise `AudioBufferSourceNode` for drums; detuned 2–3 voices, slow LFO for wobble), `stopBGM(audioManager) → void` (cancel interval, ramp master gain to 0), and `toggleMute(audioManager) → boolean` in `src/audio/soundManager.js`; JSDoc required
- [X] T040 [Depends: T039] [US8] Implement `playSFX(audioManager, type) → void` in `src/audio/soundManager.js` for all SFX types: `'hit'`, `'convince'`, `'playerHit'`, `'bossCorrect'`, `'bossWrong'`, `'bossDefeated'`, `'levelComplete'`, `'gameOver'`, `'win'`; each SFX is a short one-shot oscillator burst (new node per call per research.md); JSDoc required
- [X] T041 [P] [US8] Finalise all pixel-art sprite frames in `src/entities/sprites.js`: replace placeholder frames with full artwork — player ship (HR Manager), regular aliens per theme (2-frame protest-sign animation), unionist variants (distinct size/expression, fist-shake frame), boss (2-frame idle), shield (5 degradation stages), job offer (glowing envelope), protest flyer (paper sheet); all as 2D hex-colour string arrays with `null` for transparent pixels
- [X] T042 [US8] Wire audio into `src/main.js`: import `initAudio`, `resumeContext`, `startBGM`, `toggleMute`; initialise `AudioManager` on load; call `resumeContext` + `startBGM` on first keydown; wire M key to `toggleMute`; export `audioManager` for game.js/collision.js use
- [X] T043 [US8] Call `playSFX` at appropriate points: in `src/systems/collision.js` (hit, convince, playerHit, bossCorrect, bossWrong, bossDefeated) and in `src/game.js` (levelComplete, gameOver, win); pass `audioManager` as a **module-level import** (import from `src/audio/soundManager.js` directly — do NOT add to `GameState`; keeping state a pure data object is required per KISS)
- [X] T044 [US8] Add theme-specific background rendering in `src/canvas.js`: when `PLAYING`/`PAUSED`, draw a background fitting the current level theme — IT dept (blue glow, monitor grid pattern), Accounting (green-tinted ledger lines), Management (dark boardroom gradient); all drawn via `fillRect`/`ctx.createLinearGradient` — no image assets

**Checkpoint**: Aliens render with full artwork and animated signs. Lofi music plays from first keypress, mute/unmute works. SFX play on hit/convince/boss events. Themed backgrounds visible per level.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, code quality, and final validation across all stories.

- [X] T045 [P] Write `README.md` at repository root: project description, controls table (per quickstart.md), local run instructions (Firefox `file://` and Python3 HTTP server), GitHub Pages deploy steps, and browser requirements
- [X] T046 [P] Audit and complete JSDoc comments on all exported functions across all modules (`src/main.js`, `src/game.js`, `src/canvas.js`, all `src/entities/*.js`, all `src/systems/*.js`, `src/audio/soundManager.js`) — every exported function must have `@param` and `@returns` tags per constitution principle II
- [ ] T047 Manual browser test: run complete quickstart.md scenario end-to-end in Chrome (via `python3 -m http.server 8080`) — verify: title screen → start → play → clear wave → boss fight → level advance → all 3 levels → win screen; no console errors; **SC-001 check**: time from page load to first active gameplay input must not exceed 30 seconds without reading external documentation
- [ ] T048 Manual browser test: repeat quickstart.md scenario in Firefox via `file://` — verify same flow with no module loading errors; confirm `image-rendering: pixelated` upscale is crisp at `PIXEL_SCALE=3`
- [ ] T049 Performance check: use Chrome DevTools Performance tab to confirm consistent 60fps during active gameplay; verify no perceptible input lag on movement and firing; check audio scheduler produces no click artefacts or gaps

**Checkpoint**: Game is production-ready for GitHub Pages deployment. All constitution checks pass. Manual playthroughs complete without errors in both browsers.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational — no other story dependency
- **US7 (Phase 4)**: Depends on US1 (needs game loop, gameOver hook)
- **US2 (Phase 5)**: Depends on Foundational; US1 in-place recommended for manual test
- **US3 (Phase 6)**: Depends on Foundational; US1 in-place recommended; uses `applySlowDebuff` from US1
- **US6 (Phase 7)**: Depends on US1 (addPoints scaffolded there); extends scoring.js and HUD
- **US4 (Phase 8)**: Depends on US1 (formation/levels scaffolded); US2 recommended (themed sprites)
- **US5 (Phase 9)**: Depends on US1 (game loop, processCollisions) and US4 (level progression / advanceLevel)
- **US8 (Phase 10)**: Depends on all prior phases (audio wires into every game event; full sprites replace placeholders)
- **Polish (Phase 11)**: Depends on all desired user stories complete

### User Story Dependencies at a Glance

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        ├─► Phase 3: US1 (Core Loop) ──────────────────────────────┐
        │     └─► Phase 4: US7 (Win/Lose)                          │
        ├─► Phase 5: US2 (Alien Variety)                           │
        ├─► Phase 6: US3 (Counter-Mechanics) ──── uses US1 hooks   │
        ├─► Phase 7: US6 (Scoring)              ──── extends US1   │
        ├─► Phase 8: US4 (Level Progression) ── requires US1+US2  │
        ├─► Phase 9: US5 (Boss) ───────────── requires US1+US4 ◄──┘
        └─► Phase 10: US8 (Visual/Audio) ──── caps all stories
              └─► Phase 11 (Polish)
```

### Within Each Phase

- Tasks marked **[P]** within the same phase target different files and have no inter-dependencies — launch together
- Unmarked tasks must run after their phase's [P] tasks complete
- Never edit the same file in two parallel tasks

---

## Parallel Execution Examples

### Phase 3: US1 — Launch T007, T008, T009 together

```
[P] T007  src/entities/player.js       ← createPlayer, updatePlayer, fireJobOffer
[P] T008  src/entities/alien.js        ← createAlien, updateAlien, hitAlien
[P] T009  src/entities/projectile.js   ← createJobOffer, createFlyerProjectile, updateProjectile

then sequential:
T010  src/systems/levels.js     (needs alien shapes from T008)
T011  src/systems/collision.js  (needs hitAlien from T008, Projectile from T009)
T012  src/systems/scoring.js
T013  src/game.js               (orchestrates all above)
T014  src/canvas.js             (render needs game/entity shapes)
T015  src/main.js               (wires everything)
```

### Phase 5: US2 — Launch T019, T020 together

```
[P] T019  src/entities/sprites.js      ← unionist sprite frames
[P] T020  src/entities/unionist.js     ← createUnionist, hitUnionist, renderUnionist

then sequential:
T021  src/systems/levels.js     (wire unionist into formation)
T022  src/systems/collision.js  (wire hitUnionist into collisions)
```

### Phase 6: US3 — Launch T023, T024 together

```
[P] T023  src/entities/sprites.js  ← shield degradation frames
[P] T024  src/entities/shield.js   ← createShields, updateShield, damageShield

then sequential:
T025  src/game.js               (alien flyer firing, init shields)
T026  src/systems/collision.js  (flyer-vs-shield, flyer-vs-player)
T027  src/canvas.js             (render shields)
```

### Phase 10: US8 — Launch T039 and T041 together; run T040 after T039

```
[P] T039  src/audio/soundManager.js  ← initAudio, startBGM, stopBGM, toggleMute
[P] T041  src/entities/sprites.js    ← full pixel art frames (different file from T039)

then sequential:
T040  src/audio/soundManager.js  ← playSFX (same file as T039; depends on T039 completing first)
T042  src/main.js               (wire audio bootstrap)
T043  src/systems/collision.js + src/game.js  (playSFX call-sites; module-level import for audioManager)
T044  src/canvas.js             (themed backgrounds)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 7 Only — Phases 1–4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: User Story 1 — core gameplay loop
4. Complete Phase 4: User Story 7 — win/lose states
5. **STOP and VALIDATE**: Full game loop playable end-to-end (title → play → die or win → restart)
6. Deploy to GitHub Pages — this is a shippable, playable game

### Incremental Delivery

| Milestone | Phases Complete | What's Playable |
|-----------|----------------|-----------------|
| MVP | 1–4 | Full core loop, regular aliens only, win/lose states |
| + Alien Depth | + 5, 7 | Unionists, mood bars, scoring combo |
| + Defense Layer | + 6 | Shields, slow debuff, alien flyers |
| + Full Game | + 8 | All 3 themed levels, level progression |
| + Boss Fights | + 9 | Boss sequence mechanic, full 3-level campaign |
| + Polish | + 10, 11 | Full audio, all pixel art, README, JSDoc |

### Parallel Team Strategy

With 2+ developers, once Foundational (Phase 2) is complete:
- **Dev A**: US1 (Phase 3) → US7 (Phase 4) → US5 (Phase 9)
- **Dev B**: US2 (Phase 5) → US3 (Phase 6) → US4 (Phase 8)
- **Dev C**: US6 (Phase 7) → US8 (Phase 10) → Polish (Phase 11)

---

## Notes

- **No automated tests** — manual browser testing only per plan.md constitution (Chrome 90+, Firefox 90+)
- **No build step** — all paths relative; `<script type="module">` in index.html; openable via `file://` in Firefox
- **KISS enforced** — plain object factories (no classes); AABB only; no external dependencies
- `[P]` tasks target different files with no blocking inter-dependency — safe to run in parallel
- `[US#]` label maps each task to its user story for traceability and independent testing
- Commit after each checkpoint to keep main branch in a playable state (constitution principle III)
- Never merge without passing the manual browser check (constitution principle V)
