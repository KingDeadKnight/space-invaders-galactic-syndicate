/**
 * @module shield
 * @description Coffee pot shield entity — absorbs protest flyers, degrades passively over time.
 */

import { SPRITES, drawFrame } from './sprites.js';
import { PIXEL_SCALE, SHIELD_DEGRADE_INTERVAL, CANVAS_HEIGHT } from '../game.js';

/**
 * Creates 4 evenly-spaced coffee pot shields.
 * @param {number} canvasWidth - Logical canvas width (px)
 * @param {number} canvasHeight - Logical canvas height (px)
 * @returns {Array<{ x: number, y: number, width: number, height: number, durability: number, maxDurability: number, degradeTimer: number, active: boolean }>}
 */
export function createShields(canvasWidth, canvasHeight) {
  const count  = 4;
  const y      = canvasHeight - 120;
  const margin = 40;
  const step   = (canvasWidth - margin * 2) / (count - 1);

  return Array.from({ length: count }, (_, i) => ({
    x: margin + i * step,
    y,
    width: 30,
    height: 24,
    durability: 4,
    maxDurability: 4,
    degradeTimer: SHIELD_DEGRADE_INTERVAL,
    active: true,
  }));
}

/**
 * Advances a shield's passive degradation timer.
 * @param {{ durability: number, degradeTimer: number, active: boolean }} shield
 * @param {number} dt - Timestep (s)
 * @returns {void}
 */
export function updateShield(shield, dt) {
  if (!shield.active) return;
  shield.degradeTimer -= dt;
  if (shield.degradeTimer <= 0) {
    shield.degradeTimer = SHIELD_DEGRADE_INTERVAL;
    if (shield.durability > 0) {
      shield.durability -= 1;
      if (shield.durability === 0) {
        shield.active = false;
      }
    }
  }
}

/**
 * Reduces shield durability by 1 (on direct hit). Sets active = false when destroyed.
 * @param {{ durability: number, active: boolean }} shield
 * @returns {void}
 */
export function damageShield(shield) {
  if (!shield.active) return;
  shield.durability -= 1;
  if (shield.durability <= 0) {
    shield.durability = 0;
    shield.active = false;
  }
}

/**
 * Renders the shield at its current degradation stage.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, durability: number, active: boolean }} shield
 * @returns {void}
 */
export function renderShield(ctx, shield) {
  if (!shield.active) return;
  // SPRITES.shield is indexed by durability (4=full, 1=bad, 0=destroyed/not rendered)
  const stageIndex = Math.min(4, Math.max(0, shield.durability));
  if (stageIndex === 0) return;
  const frame = SPRITES.shield[stageIndex];
  drawFrame(ctx, frame, shield.x, shield.y, PIXEL_SCALE);
}
