/**
 * @module powerup
 * @description HR Meeting power-up entity — drifts downward after alien defeat.
 * Collected by player to freeze all aliens for HR_FREEZE_DURATION seconds.
 */

import { CANVAS_HEIGHT } from '../game.js';

/**
 * Creates a PowerUp plain object at the given position.
 * @param {number} x - Horizontal centre (logical px)
 * @param {number} y - Vertical centre (logical px)
 * @param {'hr-meeting'} type - Power-up type identifier
 * @returns {{ x: number, y: number, width: number, height: number, vy: number, type: string, active: boolean }}
 */
export function createPowerup(x, y, type) {
  return {
    x,
    y,
    width: 12,
    height: 12,
    vy: 40,
    type,
    active: true,
  };
}

/**
 * Advances a power-up's position downward. Deactivates when it exits the bottom of the canvas.
 * @param {{ y: number, vy: number, active: boolean }} powerup
 * @param {number} dt - Fixed timestep (s)
 * @returns {void}
 */
export function updatePowerup(powerup, dt) {
  powerup.y += powerup.vy * dt;
  if (powerup.y > CANVAS_HEIGHT + 20) {
    powerup.active = false;
  }
}

/**
 * Renders a power-up as a 12×12 cyan rectangle with centred red "HR" label.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} powerup
 * @returns {void}
 */
export function renderPowerup(ctx, powerup) {
  if (!powerup.active) return;
  ctx.save();

  // Cyan background rect
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(powerup.x - 6, powerup.y - 6, 12, 12);

  // Border
  ctx.strokeStyle = '#006666';
  ctx.lineWidth   = 1;
  ctx.strokeRect(powerup.x - 6, powerup.y - 6, 12, 12);

  // "HR" label in red pixel font
  ctx.fillStyle    = '#ff2222';
  ctx.font         = '5px "Press Start 2P", "Courier New", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HR', powerup.x, powerup.y);

  ctx.restore();
}
