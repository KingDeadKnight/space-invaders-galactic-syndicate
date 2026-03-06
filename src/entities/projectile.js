/**
 * @module projectile
 * @description Job offer (player) and protest flyer (alien) projectiles.
 */

import { SPRITES, drawFrame } from './sprites.js';
import { PIXEL_SCALE } from '../game.js';

/** Upward velocity for player job offer projectiles (px/s). */
export const JOB_OFFER_VY = -400;

/** Downward velocities for protest flyers per level (px/s). */
export const FLYER_VY = [0, 180, 220, 260];

/**
 * Creates a job offer projectile fired by the player.
 * @param {number} x - Horizontal centre (px)
 * @param {number} y - Vertical centre (px)
 * @returns {{ x: number, y: number, width: number, height: number, vy: number, owner: string, active: boolean, frameIndex: number, frameTimer: number }}
 */
export function createJobOffer(x, y) {
  return {
    x,
    y,
    width: 4,
    height: 8,
    vy: JOB_OFFER_VY,
    owner: 'player',
    active: true,
    frameIndex: 0,
    frameTimer: 0,
  };
}

/**
 * Creates a protest flyer projectile fired by an alien or boss.
 * @param {number} x - Horizontal centre (px)
 * @param {number} y - Vertical centre (px)
 * @param {number} [level=1] - Current level (1–3); affects flyer speed.
 * @returns {{ x: number, y: number, width: number, height: number, vy: number, owner: string, active: boolean, frameIndex: number, frameTimer: number, rotation: number, rotationSpeed: number }}
 */
export function createFlyerProjectile(x, y, level = 1) {
  const clampedLevel = Math.min(3, Math.max(1, level));
  return {
    x,
    y,
    width: 4,
    height: 8,
    vy: FLYER_VY[clampedLevel],
    owner: 'alien',
    active: true,
    frameIndex: 0,
    frameTimer: 0,
    rotation: 0,
    rotationSpeed: 4.0,
  };
}

/**
 * Advances a projectile's position. Sets active = false when off-canvas.
 * @param {{ x: number, y: number, vy: number, active: boolean, frameIndex: number, frameTimer: number, rotation?: number, rotationSpeed?: number }} projectile
 * @param {number} dt - Timestep (s)
 * @param {number} canvasHeight - Canvas height (px); used for boundary check.
 * @returns {void}
 */
export function updateProjectile(projectile, dt, canvasHeight) {
  projectile.y += projectile.vy * dt;
  // Spin alien flyers
  if (projectile.owner === 'alien' && projectile.rotationSpeed !== undefined) {
    projectile.rotation = (projectile.rotation ?? 0) + projectile.rotationSpeed * dt;
  }
  // Advance animation frame for player shots
  const sprite = SPRITES.jobOffer;
  if (projectile.owner === 'player') {
    projectile.frameTimer += dt;
    if (projectile.frameTimer >= 1 / sprite.fps) {
      projectile.frameTimer = 0;
      projectile.frameIndex = (projectile.frameIndex + 1) % sprite.frames.length;
    }
  }
  // Deactivate when out of bounds
  if (projectile.y < -20 || projectile.y > canvasHeight + 20) {
    projectile.active = false;
  }
}

/**
 * Renders a projectile on the canvas.
 * Player shot: white envelope sprite.
 * Alien shot: spinning red pamphlet using ctx.translate + ctx.rotate.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, owner: string, frameIndex: number, rotation?: number }} projectile
 * @returns {void}
 */
export function renderProjectile(ctx, projectile) {
  if (!projectile.active) return;
  ctx.save();
  if (projectile.owner === 'player') {
    // Envelope — rendered upright
    const sheet = SPRITES.jobOffer;
    const frame = sheet.frames[projectile.frameIndex % sheet.frames.length];
    drawFrame(ctx, frame, projectile.x, projectile.y, PIXEL_SCALE);
  } else {
    // Spinning red pamphlet
    const sheet = SPRITES.flyer;
    const frame = sheet.frames[0];
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.rotation ?? 0);
    drawFrame(ctx, frame, 0, 0, PIXEL_SCALE);
  }
  ctx.restore();
}
