/**
 * @module levels
 * @description Level configurations, alien formation builder, formation movement system.
 */

import { createAlien } from '../entities/alien.js';
import { createUnionist } from '../entities/unionist.js';

/** Horizontal spacing between alien centres (px). */
const ALIEN_SPACING_X = 36;

/** Vertical spacing between alien rows (px). */
const ALIEN_SPACING_Y = 30;

/** Y position of the top row of aliens. */
const FORMATION_TOP_Y = 80;

/** Amount the formation shifts down on wall bounce (px). */
const FORMATION_STEP_DOWN = 16;

/** Speed boost applied every time the formation bounces (px/s). */
const BOUNCE_SPEED_INCREMENT = 4;

/**
 * Returns the LevelConfig for the given level number (1–3).
 * @param {number} levelNum - Level number (1, 2, or 3)
 * @returns {{ levelNum: number, theme: string, alienRows: number, alienCols: number, regularRatio: number, alienBaseSpeed: number, alienSpeedIncrement: number, flyerFrequency: number, flyerBaseCooldown: number, bossSequenceLength: number, bossSpeed: number }}
 */
export function getLevelConfig(levelNum) {
  const configs = {
    1: {
      levelNum: 1,
      theme: 'it',
      alienRows: 4,
      alienCols: 8,
      regularRatio: 0.75,       // 75% regular, 25% unionist
      alienBaseSpeed: 45,
      alienSpeedIncrement: 3,
      flyerFrequency: 1.0,      // multiplier on base cooldown (1.0 = normal)
      flyerBaseCooldown: 8.3,   // seconds between individual alien fires (×flyerFrequency) — R-008
      bossSequenceLength: 3,
      bossSpeed: 80,
    },
    2: {
      levelNum: 2,
      theme: 'accounting',
      alienRows: 5,
      alienCols: 9,
      regularRatio: 0.60,
      alienBaseSpeed: 60,
      alienSpeedIncrement: 4,
      flyerFrequency: 0.8,      // faster (lower = more frequent per alien.js shouldFire)
      flyerBaseCooldown: 4.0,
      bossSequenceLength: 4,
      bossSpeed: 110,
    },
    3: {
      levelNum: 3,
      theme: 'management',
      alienRows: 5,
      alienCols: 10,
      regularRatio: 0.45,
      alienBaseSpeed: 80,
      alienSpeedIncrement: 5,
      flyerFrequency: 0.6,
      flyerBaseCooldown: 3.0,
      bossSequenceLength: 5,
      bossSpeed: 140,
    },
  };
  return configs[levelNum] ?? configs[1];
}

/**
 * Builds and returns a flat array of Alien/Unionist objects arranged in the formation grid.
 * Unionists appear in the bottom rows according to levelConfig.regularRatio.
 * @param {{ theme: string, alienRows: number, alienCols: number, regularRatio: number }} levelConfig
 * @param {number} canvasWidth - Used to centre the formation horizontally.
 * @returns {Array<import('../entities/alien.js').Alien | import('../entities/unionist.js').Unionist>}
 */
export function buildAlienFormation(levelConfig, canvasWidth) {
  const { theme, alienRows, alienCols, regularRatio } = levelConfig;
  const totalAliens    = alienRows * alienCols;
  const unionistCount  = Math.round(totalAliens * (1 - regularRatio));
  // Put unionists in the bottom rows
  const unionistRowStart = alienRows - Math.ceil(unionistCount / alienCols);

  const totalGridW = (alienCols - 1) * ALIEN_SPACING_X;
  const startX     = (canvasWidth - totalGridW) / 2;

  const aliens = [];
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      const x = startX + col * ALIEN_SPACING_X;
      const y = FORMATION_TOP_Y + row * ALIEN_SPACING_Y;
      const isUnionist = row >= unionistRowStart && aliens.filter(a => a.type === 'unionist').length < unionistCount;
      if (isUnionist) {
        aliens.push(createUnionist(x, y, theme));
      } else {
        aliens.push(createAlien(x, y, theme));
      }
    }
  }
  return aliens;
}

/**
 * Advances the formation's horizontal sweep.
 * On reaching a canvas edge: shifts down and reverses direction.
 * Speed increases as aliens are cleared. Mutates each alien's x/y in-place.
 * @param {Array<{ x: number, y: number, active: boolean }>} aliens
 * @param {{ direction: number, speed: number, pendingStep: boolean }} formationState
 * @param {number} dt - Timestep (s)
 * @param {number} canvasWidth
 * @returns {void}
 */
export function updateFormationMovement(aliens, formationState, dt, canvasWidth) {
  const activeAliens = aliens.filter(a => a.active);
  if (activeAliens.length === 0) return;

  // Speed scales with how many aliens have been cleared
  const totalCount   = aliens.length;
  const clearedCount = totalCount - activeAliens.length;
  const speedBoost   = Math.floor(clearedCount / 4) * BOUNCE_SPEED_INCREMENT;
  const effectiveSpeed = formationState.speed + speedBoost;

  // Find bounding extremes of active aliens
  let minX = Infinity, maxX = -Infinity;
  for (const a of activeAliens) {
    const halfW = a.width / 2;
    if (a.x - halfW < minX) minX = a.x - halfW;
    if (a.x + halfW > maxX) maxX = a.x + halfW;
  }

  const dx = effectiveSpeed * formationState.direction * dt;
  const newMin = minX + dx;
  const newMax = maxX + dx;

  if (formationState.pendingStep) {
    // Shift all aliens down in a step
    for (const a of aliens) {
      a.y += FORMATION_STEP_DOWN;
    }
    formationState.pendingStep = false;
    formationState.direction *= -1;
  } else if (newMin <= 0 || newMax >= canvasWidth) {
    // Hit wall — schedule step
    formationState.pendingStep = true;
  } else {
    // Normal horizontal movement
    for (const a of aliens) {
      a.x += dx;
    }
  }
}

/**
 * Creates the initial FormationState for a level.
 * @param {{ alienBaseSpeed: number }} levelConfig
 * @returns {{ direction: number, speed: number, pendingStep: boolean }}
 */
export function createFormationState(levelConfig) {
  return {
    direction: 1,
    speed: levelConfig.alienBaseSpeed,
    pendingStep: false,
  };
}
