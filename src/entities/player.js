/**
 * @module player
 * @description HR Manager ship entity — creation, update, firing, slow debuff, rendering.
 */

import { SPRITES, drawFrame } from './sprites.js';
import {
  PIXEL_SCALE,
  SLOW_DURATION,
  SLOW_MULTIPLIER,
  SHOT_COOLDOWN,
  CANVAS_WIDTH,
  INVINCIBILITY_DURATION,
} from '../game.js';
import { createJobOffer } from './projectile.js';

/**
 * Creates and returns an initialised Player object.
 * @param {number} canvasWidth - Logical canvas width (px)
 * @param {number} canvasHeight - Logical canvas height (px)
 * @returns {{ x: number, y: number, width: number, height: number, baseSpeed: number, speed: number, slowDebuffTimer: number, slowMultiplier: number, lives: number, shotCooldown: number, shotCooldownMax: number, active: boolean, frameIndex: number, frameTimer: number, invincibilityTimer: number, comboGlowTimer: number }}
 */
export function createPlayer(canvasWidth, canvasHeight) {
  return {
    x: canvasWidth / 2,
    y: canvasHeight - 48,
    width: 30,
    height: 24,
    baseSpeed: 180,
    speed: 180,
    slowDebuffTimer: 0,
    slowMultiplier: SLOW_MULTIPLIER,
    lives: 3,
    shotCooldown: 0,
    shotCooldownMax: SHOT_COOLDOWN,
    active: true,
    frameIndex: 0,
    frameTimer: 0,
    invincibilityTimer: 0,
    comboGlowTimer: 0,
  };
}

/**
 * Advances player state by one fixed timestep: handles movement, slow debuff decay, cooldown.
 * @param {{ x: number, y: number, speed: number, baseSpeed: number, slowDebuffTimer: number, slowMultiplier: number, width: number, shotCooldown: number, invincibilityTimer: number, comboGlowTimer: number }} player
 * @param {{ left: boolean, right: boolean }} input - Current keyboard snapshot
 * @param {number} dt - Fixed timestep (s)
 * @returns {void}
 */
export function updatePlayer(player, input, dt) {
  // Slow debuff decay
  if (player.slowDebuffTimer > 0) {
    player.slowDebuffTimer -= dt;
    if (player.slowDebuffTimer <= 0) {
      player.slowDebuffTimer = 0;
      player.speed = player.baseSpeed;
    }
  }

  // Invincibility window countdown
  if (player.invincibilityTimer > 0) {
    player.invincibilityTimer = Math.max(0, player.invincibilityTimer - dt);
  }

  // Combo glow countdown
  if (player.comboGlowTimer > 0) {
    player.comboGlowTimer = Math.max(0, player.comboGlowTimer - dt);
  }

  // Movement (clamped to canvas)
  if (input.left) {
    player.x -= player.speed * dt;
  }
  if (input.right) {
    player.x += player.speed * dt;
  }
  const halfW = player.width / 2;
  player.x = Math.max(halfW, Math.min(CANVAS_WIDTH - halfW, player.x));

  // Shot cooldown
  if (player.shotCooldown > 0) {
    player.shotCooldown -= dt;
  }
}

/**
 * Fires a job offer projectile if the player's cooldown allows.
 * Mutates player.shotCooldown when a shot is created.
 * @param {{ x: number, y: number, shotCooldown: number, shotCooldownMax: number }} player
 * @returns {{ x: number, y: number, vy: number, owner: string, active: boolean }|null} New projectile, or null if on cooldown.
 */
export function fireJobOffer(player) {
  if (player.shotCooldown > 0) return null;
  player.shotCooldown = player.shotCooldownMax;
  return createJobOffer(player.x, player.y - player.height / 2 - 4);
}

/**
 * Applies the protest-flyer slow debuff to the player.
 * @param {{ slowDebuffTimer: number, speed: number, baseSpeed: number, slowMultiplier: number }} player
 * @returns {void}
 */
export function applySlowDebuff(player) {
  player.slowDebuffTimer = SLOW_DURATION;
  player.speed = player.baseSpeed * player.slowMultiplier;
}

/**
 * Renders the player sprite at its current position.
 * Blinks during invincibility (returns early on odd blink frames).
 * Renders golden glow when comboGlowTimer > 0.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, frameIndex: number, invincibilityTimer: number, comboGlowTimer: number, slowDebuffTimer: number, width: number, height: number }} player
 * @returns {void}
 */
export function renderPlayer(ctx, player) {
  if (!player.active) return;

  // Blink during invincibility: return early on odd 8 Hz frames
  if (player.invincibilityTimer > 0 && Math.floor(player.invincibilityTimer * 8) % 2 === 1) {
    return;
  }

  const sheet = SPRITES.player;
  const frame = sheet.frames[player.frameIndex % sheet.frames.length];

  ctx.save();

  // Golden glow when Employee of the Month
  if (player.comboGlowTimer > 0) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur  = 12;
  }

  drawFrame(ctx, frame, player.x, player.y, PIXEL_SCALE);
  ctx.restore();

  // Slow debuff indicator: dim blue tint overlay
  if (player.slowDebuffTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#3af5ff';
    ctx.fillRect(
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
