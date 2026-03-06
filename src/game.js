/**
 * @module game
 * @description Game constants, GameState machine, and master update function.
 * All constants are exported as named constants for use by entity/system modules.
 */

import { createPlayer }              from './entities/player.js';
import { updatePlayer, fireJobOffer } from './entities/player.js';
import { updateAlien, shouldFire as alienShouldFire } from './entities/alien.js';
import { updateUnionist, shouldFire as unionistShouldFire } from './entities/unionist.js';
import { updateBoss, shouldBossFire }  from './entities/boss.js';
import { createBoss }                  from './entities/boss.js';
import { updateProjectile, createFlyerProjectile } from './entities/projectile.js';
import { updateShield, createShields }  from './entities/shield.js';
import { processCollisions }           from './systems/collision.js';
import { createScore, resetCombo, addPoints, EMPLOYEE_OF_MONTH_THRESHOLD } from './systems/scoring.js';
import { getLevelConfig, buildAlienFormation, createFormationState, updateFormationMovement } from './systems/levels.js';
import { updateParticles } from './systems/particles.js';
import { updatePowerup }   from './entities/powerup.js';
import { activatePerformanceReview, deactivatePerformanceReview } from './entities/alien.js';
import { createCutsceneState, updateCutscene } from './systems/cutscene.js';

// ── Game Constants ────────────────────────────────────────────
/** @type {number} Logical canvas width (px) */
export const CANVAS_WIDTH          = 480;
/** @type {number} Logical canvas height (px) */
export const CANVAS_HEIGHT         = 640;
/** @type {number} CSS upscale factor */
export const PIXEL_SCALE           = 3;
/** @type {number} Fixed timestep in seconds (1/60) */
export const FIXED_STEP_S          = 1 / 60;
/** @type {number} Slow debuff duration (s) */
export const SLOW_DURATION         = 2.5;
/** @type {number} Speed multiplier while slowed */
export const SLOW_MULTIPLIER       = 0.4;
/** @type {number} Passive shield degradation interval (s) */
export const SHIELD_DEGRADE_INTERVAL = 8.0;
/** @type {number} Boss sequence reset timeout (s) */
export const SEQUENCE_TIMEOUT      = 5.0;
/** @type {number} Base points per regular alien */
export const BASE_POINTS           = 10;
/** @type {number} Starting player lives */
export const PLAYER_LIVES          = 3;
/** @type {number} Minimum time between player shots (s) */
export const SHOT_COOLDOWN         = 0.25;
/** @type {number} Post-hit player invincibility window (s) */
export const INVINCIBILITY_DURATION = 1.5;
/** @type {number} Seconds all aliens freeze on HR Meeting power-up pickup */
export const HR_FREEZE_DURATION    = 3.0;
/** @type {number} Seconds between Performance Review alien triggers */
export const PERF_REVIEW_INTERVAL  = 30.0;
/** @type {number} Seconds the Employee of the Month glow persists */
export const COMBO_GLOW_DURATION   = 3.0;
/** @type {number} Probability a defeated unionist drops an HR Meeting power-up */
export const POWERUP_DROP_CHANCE   = 0.20;
/** @type {number} Seconds boss hit zones are highlighted before sequence opens */
export const PRE_SEQUENCE_HIGHLIGHT_S = 2.0;

// ── Level transition timer ─────────────────────────────────────
const TRANSITION_DURATION = 1.5;

// ── Audio manager reference (set by main.js) ──────────────────
/** @type {Object|null} AudioManager set from main.js */
let _audioManager = null;

/**
 * Sets the audio manager reference for use during game events.
 * @param {Object} am - AudioManager from soundManager.js
 * @returns {void}
 */
export function setAudioManager(am) {
  _audioManager = am;
}

// ── GameState Helpers ─────────────────────────────────────────

/**
 * Constructs and returns the initial GameState with phase 'MENU'.
 * @param {number} canvasWidth - Logical canvas width (px)
 * @param {number} canvasHeight - Logical canvas height (px)
 * @returns {{ phase: string, level: number, levelPhase: string, player: Object, aliens: Object[], boss: Object|null, projectiles: Object[], shields: Object[], score: Object, input: Object, formationState: Object|null, levelConfig: Object|null, transitionTimer: number, hrFreezeTimer: number, performanceReviewTimer: number, performanceReviewAlienIndex: number|null, powerups: Object[], particles: Object[], reducedMotion: boolean, cutsceneState: Object|null, canvasWidth: number, canvasHeight: number }}
 */
export function initGame(canvasWidth, canvasHeight) {
  return {
    phase: 'MENU', // 'MENU' | 'PLAYING' | 'PAUSED' | 'CUTSCENE' | 'GAMEOVER' | 'WIN'
    level: 1,
    levelPhase: 'WAVE',
    player: createPlayer(canvasWidth, canvasHeight),
    aliens: [],
    boss: null,
    projectiles: [],
    shields: [],
    score: createScore(),
    input: { left: false, right: false, fire: false, pause: false, mute: false },
    formationState: null,
    levelConfig: null,
    transitionTimer: 0,
    hrFreezeTimer: 0,
    performanceReviewTimer: PERF_REVIEW_INTERVAL,
    performanceReviewAlienIndex: null,
    powerups: [],
    particles: [],
    reducedMotion: false,
    cutsceneState: null,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Transitions to PLAYING, builds Level 1 formation and shields, resets score and player.
 * @param {{ phase: string, level: number, levelPhase: string, player: Object, aliens: Object[], boss: Object|null, projectiles: Object[], shields: Object[], score: Object, formationState: Object|null, levelConfig: Object|null, canvasWidth: number, canvasHeight: number }} state
 * @returns {void}
 */
export function startGame(state) {
  state.phase      = 'PLAYING';
  state.level      = 1;
  state.levelPhase = 'WAVE';
  state.boss       = null;
  state.projectiles = [];

  const cfg = getLevelConfig(1);
  state.levelConfig    = cfg;
  state.aliens         = buildAlienFormation(cfg, state.canvasWidth);
  state.formationState = createFormationState(cfg);
  state.shields        = createShields(state.canvasWidth, state.canvasHeight);
  state.score          = createScore();
  state.player         = createPlayer(state.canvasWidth, state.canvasHeight);
  state.transitionTimer = 0;
  state.hrFreezeTimer  = 0;
  state.performanceReviewTimer = PERF_REVIEW_INTERVAL;
  state.performanceReviewAlienIndex = null;
  state.powerups       = [];
  state.particles      = [];
  state.cutsceneState  = null;
}

/**
 * Pauses the game.
 * @param {{ phase: string }} state
 * @returns {void}
 */
export function pauseGame(state) {
  if (state.phase === 'PLAYING') {
    state.phase = 'PAUSED';
  }
}

/**
 * Resumes the game.
 * @param {{ phase: string }} state
 * @returns {void}
 */
export function resumeGame(state) {
  if (state.phase === 'PAUSED') {
    state.phase = 'PLAYING';
  }
}

/**
 * Transitions to GAMEOVER phase.
 * @param {{ phase: string }} state
 * @returns {void}
 */
export function gameOver(state) {
  if (state.phase !== 'GAMEOVER') {
    state.phase = 'GAMEOVER';
    if (_audioManager) {
      _audioManager.stopBossTheme?.();
      _audioManager.playGameOver?.();
    }
  }
}

/**
 * Advances to the next level or triggers WIN if all 3 levels complete.
 * @param {{ phase: string, level: number, levelPhase: string, aliens: Object[], boss: Object|null, shields: Object[], projectiles: Object[], formationState: Object|null, levelConfig: Object|null, canvasWidth: number, canvasHeight: number }} state
 * @returns {void}
 */
export function advanceLevel(state) {
  state.level += 1;
  if (state.level > 3) {
    state.phase = 'WIN';
    if (_audioManager) _audioManager.playSFX('win');
    return;
  }
  const cfg = getLevelConfig(state.level);
  state.levelConfig    = cfg;
  state.aliens         = buildAlienFormation(cfg, state.canvasWidth);
  state.formationState = createFormationState(cfg);
  state.shields        = createShields(state.canvasWidth, state.canvasHeight);
  state.boss           = null;
  state.projectiles    = state.projectiles.filter(p => p.owner === 'player'); // keep in-flight player shots
  state.levelPhase     = 'WAVE';
  state.transitionTimer = 0;
  if (_audioManager) _audioManager.playSFX('levelComplete');
}

/**
 * Transitions to BOSS phase and spawns the Boss Negotiator.
 * @param {{ levelPhase: string, boss: Object|null, level: number, canvasWidth: number }} state
 * @returns {void}
 */
export function triggerBoss(state) {
  state.levelPhase = 'BOSS';
  state.boss       = createBoss(state.level, state.canvasWidth);
  state.boss.preSequenceHighlightTimer = PRE_SEQUENCE_HIGHLIGHT_S;
  state.transitionTimer = 0;
  if (_audioManager) _audioManager.startBossTheme?.();
}

/**
 * Resets state to initial MENU conditions in-place (equivalent to a fresh initGame).
 * @param {{ phase: string, level: number, levelPhase: string, player: Object, aliens: Object[], boss: Object|null, projectiles: Object[], shields: Object[], score: Object, formationState: Object|null, levelConfig: Object|null, transitionTimer: number, canvasWidth: number, canvasHeight: number }} state
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {void}
 */
export function restartGame(state, canvasWidth, canvasHeight) {
  state.phase          = 'MENU';
  state.level          = 1;
  state.levelPhase     = 'WAVE';
  state.player         = createPlayer(canvasWidth, canvasHeight);
  state.aliens         = [];
  state.boss           = null;
  state.projectiles    = [];
  state.shields        = [];
  state.score          = createScore();
  state.formationState = null;
  state.levelConfig    = null;
  state.transitionTimer = 0;
  state.hrFreezeTimer  = 0;
  state.performanceReviewTimer = PERF_REVIEW_INTERVAL;
  state.performanceReviewAlienIndex = null;
  state.powerups       = [];
  state.particles      = [];
  state.cutsceneState  = null;
  state.canvasWidth    = canvasWidth;
  state.canvasHeight   = canvasHeight;
}

/**
 * Master update function. Called once per fixed timestep tick while phase is PLAYING or CUTSCENE.
 * @param {Object} state
 * @param {number} dt - Fixed timestep (s)
 * @returns {void}
 */
export function updateGame(state, dt) {
  // ── CUTSCENE phase handler ────────────────────────────────────
  if (state.phase === 'CUTSCENE') {
    if (state.cutsceneState) {
      const done = updateCutscene(state.cutsceneState, dt, state.input);
      if (done) {
        state.cutsceneState = null;
        state.phase = 'PLAYING';
        triggerBoss(state);
      }
    }
    return;
  }

  if (state.phase !== 'PLAYING') return;

  const { player, input, aliens, shields, levelConfig } = state;

  // ── 1. Update player ─────────────────────────────────────────
  updatePlayer(player, input, dt);

  // ── 2. Fire job offer ─────────────────────────────────────────
  if (input.fire) {
    const shot = fireJobOffer(player);
    if (shot) state.projectiles.push(shot);
  }

  // ── 2b. Decrement HR Freeze timer ────────────────────────────
  if (state.hrFreezeTimer > 0) {
    state.hrFreezeTimer = Math.max(0, state.hrFreezeTimer - dt);
  }

  // ── 3. Update aliens and formation ───────────────────────────
  if (state.levelPhase === 'WAVE' && state.hrFreezeTimer <= 0) {
    for (const alien of aliens) {
      if (!alien.active) continue;
      if (alien.type === 'unionist') {
        updateUnionist(alien, dt);
      } else {
        updateAlien(alien, dt);
      }
      // Alien flyer firing
      const baseCooldown = levelConfig.flyerBaseCooldown * levelConfig.flyerFrequency;
      const fires = alien.type === 'unionist'
        ? unionistShouldFire(alien, baseCooldown)
        : alienShouldFire(alien, baseCooldown);
      if (fires) {
        state.projectiles.push(createFlyerProjectile(alien.x, alien.y + alien.height / 2, state.level));
      }
    }
    if (state.formationState) {
      updateFormationMovement(aliens, state.formationState, dt, state.canvasWidth);
    }
  }

  // ── 3b. Performance Review timer (T025) ──────────────────────
  if (state.levelPhase === 'WAVE' && state.aliens.length > 0) {
    state.performanceReviewTimer -= dt;
    if (state.performanceReviewTimer <= 0) {
      const candidates = state.aliens.filter(a => a.active && !a.isPerformanceReview);
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        activatePerformanceReview(chosen);
        state.performanceReviewAlienIndex = state.aliens.indexOf(chosen);
      }
      state.performanceReviewTimer = PERF_REVIEW_INTERVAL;
    }
    // Clear index when PR alien is no longer active
    if (state.performanceReviewAlienIndex !== null) {
      const prAlien = state.aliens[state.performanceReviewAlienIndex];
      if (!prAlien || !prAlien.active || !prAlien.isPerformanceReview) {
        state.performanceReviewAlienIndex = null;
      }
    }
  }

  // ── 4. Update boss ────────────────────────────────────────────
  if (state.levelPhase === 'BOSS' && state.boss && state.boss.active && state.hrFreezeTimer <= 0) {
    updateBoss(state.boss, dt, state.canvasWidth);
    if (shouldBossFire(state.boss)) {
      state.projectiles.push(createFlyerProjectile(state.boss.x, state.boss.y + state.boss.height / 2, state.level));
    }
  }

  // ── 5. Update projectiles ─────────────────────────────────────
  for (const proj of state.projectiles) {
    if (!proj.active) continue;
    updateProjectile(proj, dt, state.canvasHeight);
    // Detect player shot that exited top (miss) → reset combo
    if (!proj.active && proj.owner === 'player' && proj.vy < 0) {
      resetCombo(state.score);
    }
  }

  // ── 6. Update shields ─────────────────────────────────────────
  for (const shield of shields) {
    if (shield.active) updateShield(shield, dt);
  }

  // ── 6b. Update particles ──────────────────────────────────────
  if (state.particles && state.particles.length > 0) {
    updateParticles(state.particles, dt);
  }

  // ── 6c. Update power-ups ──────────────────────────────────────
  if (state.powerups && state.powerups.length > 0) {
    for (const pu of state.powerups) {
      if (pu.active) updatePowerup(pu, dt);
    }
  }

  // ── 7. Process collisions ─────────────────────────────────────
  processCollisions(state, _audioManager);

  // ── 7b. Combo glow trigger (T026) ────────────────────────────
  if (state.score.consecutiveHits > 0 &&
      state.score.consecutiveHits % EMPLOYEE_OF_MONTH_THRESHOLD === 0) {
    const expectedTrigger = state.score.consecutiveHits;
    // Only trigger if we haven't already triggered for this hit count
    if (!state._lastComboGlowHits || state._lastComboGlowHits !== expectedTrigger) {
      state.player.comboGlowTimer = COMBO_GLOW_DURATION;
      state._lastComboGlowHits = expectedTrigger;
    }
  }

  // ── 8. Win / Lose checks ──────────────────────────────────────
  if (state.phase === 'GAMEOVER' || state.phase === 'WIN') return;

  // Check if wave is cleared → start CUTSCENE
  if (state.levelPhase === 'WAVE' && state.aliens.length === 0) {
    state.phase         = 'CUTSCENE';
    state.cutsceneState = createCutsceneState(state.score, state.level);
  }

  // Check if boss is defeated → start post-boss transition
  if (state.levelPhase === 'BOSS' && state.boss && !state.boss.active) {
    state.levelPhase      = 'TRANSITION';
    state.transitionTimer = TRANSITION_DURATION;
    if (_audioManager) {
      _audioManager.stopBossTheme?.();
      _audioManager.playSFX('levelComplete');
    }
  }

  // Single unified transition countdown handler (boss defeat only)
  if (state.levelPhase === 'TRANSITION') {
    state.transitionTimer -= dt;
    if (state.transitionTimer <= 0) {
      // Boss was just defeated → advance to next level
      advanceLevel(state);
    }
  }
}
