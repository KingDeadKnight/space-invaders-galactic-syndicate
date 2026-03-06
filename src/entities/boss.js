/**
 * @module boss
 * @description Boss Negotiator entity — zone-sequence mechanic, bouncing movement, flyer firing.
 */

import { SPRITES, drawFrame } from './sprites.js';
import { PIXEL_SCALE, SEQUENCE_TIMEOUT, PRE_SEQUENCE_HIGHLIGHT_S } from '../game.js';

/** Flash VFX duration (s). */
const FLASH_DURATION = 0.3;

/** Zone labels for rendering. */
const ZONE_LABELS = ['LEFT', 'CTR', 'RIGHT'];

/** Zone colours for the UI boxes. */
const ZONE_DEFAULT  = '#334466';
const ZONE_PENDING  = '#226688';
const ZONE_CORRECT  = '#22cc55';
const ZONE_WRONG    = '#cc2233';
const ZONE_NEXT     = '#ffaa00';

/**
 * Generates a random zone sequence of the given length.
 * @param {number} length
 * @returns {number[]}
 */
function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 3));
}

/**
 * Creates a Boss entity for the specified level.
 * @param {number} level - 1, 2, or 3; controls sequence length and speed.
 * @param {number} canvasWidth - Logical canvas width (px).
 * @returns {{ x: number, y: number, width: number, height: number, hp: number, sequenceRequired: number[], sequenceProgress: number, sequenceTimer: number, zoneFlashState: string, zoneFlashTimer: number, speed: number, direction: number, flyerCooldown: number, active: boolean, level: number, frameIndex: number, frameTimer: number }}
 */
export function createBoss(level, canvasWidth) {
  const sequenceLengths = { 1: 3, 2: 4, 3: 5 };
  const speeds          = { 1: 80, 2: 110, 3: 140 };
  const seqLen = sequenceLengths[level] ?? 3;
  const seq    = generateSequence(seqLen);

  return {
    x: canvasWidth / 2,
    y: 64,
    width: 42,
    height: 36,
    hp: seqLen,
    sequenceRequired: seq,
    sequenceProgress: 0,
    sequenceTimer: SEQUENCE_TIMEOUT,
    zoneFlashState: 'idle',
    zoneFlashTimer: 0,
    speed: speeds[level] ?? 80,
    direction: 1,
    flyerCooldown: 1.5,
    active: true,
    level,
    frameIndex: 0,
    frameTimer: 0,
    preSequenceHighlightTimer: 0,
  };
}

/**
 * Advances boss state: horizontal bounce movement, sequence timer, flyer cooldown, flash timer.
 * @param {{ x: number, y: number, speed: number, direction: number, sequenceTimer: number, sequenceProgress: number, sequenceRequired: number[], zoneFlashState: string, zoneFlashTimer: number, flyerCooldown: number, frameIndex: number, frameTimer: number, width: number, preSequenceHighlightTimer: number }} boss
 * @param {number} dt - Timestep (s)
 * @param {number} canvasWidth - Canvas width for edge detection.
 * @returns {void}
 */
export function updateBoss(boss, dt, canvasWidth) {
  // Pre-sequence highlight timer
  if (boss.preSequenceHighlightTimer > 0) {
    boss.preSequenceHighlightTimer = Math.max(0, boss.preSequenceHighlightTimer - dt);
  }
  // Horizontal bounce
  boss.x += boss.speed * boss.direction * dt;
  const halfW = boss.width / 2;
  if (boss.x - halfW <= 0) {
    boss.x = halfW;
    boss.direction = 1;
  } else if (boss.x + halfW >= canvasWidth) {
    boss.x = canvasWidth - halfW;
    boss.direction = -1;
  }

  // Sequence timer (resets progress on timeout)
  boss.sequenceTimer -= dt;
  if (boss.sequenceTimer <= 0) {
    boss.sequenceProgress = 0;
    boss.sequenceTimer = SEQUENCE_TIMEOUT;
  }

  // Flash timer
  if (boss.zoneFlashTimer > 0) {
    boss.zoneFlashTimer -= dt;
    if (boss.zoneFlashTimer <= 0) {
      boss.zoneFlashTimer = 0;
      boss.zoneFlashState = 'idle';
    }
  }

  // Flyer cooldown
  boss.flyerCooldown -= dt;

  // Sprite animation
  boss.frameTimer += dt;
  const sheet = SPRITES.boss;
  if (boss.frameTimer >= 1 / sheet.fps) {
    boss.frameTimer -= 1 / sheet.fps;
    boss.frameIndex = (boss.frameIndex + 1) % sheet.frames.length;
  }
}

/**
 * Applies a hit to the boss at the given zone index.
 * @param {{ sequenceRequired: number[], sequenceProgress: number, sequenceTimer: number, zoneFlashState: string, zoneFlashTimer: number, active: boolean }} boss
 * @param {number} zoneIndex - 0 (left), 1 (center), 2 (right).
 * @returns {'correct'|'wrong'|'defeated'}
 */
export function hitBoss(boss, zoneIndex) {
  const expected = boss.sequenceRequired[boss.sequenceProgress];

  if (zoneIndex === expected) {
    boss.sequenceProgress += 1;
    boss.zoneFlashState = 'correct';
    boss.zoneFlashTimer = FLASH_DURATION;

    if (boss.sequenceProgress >= boss.sequenceRequired.length) {
      boss.active = false;
      return 'defeated';
    }
    // Reset timer on correct hit to give player more time
    boss.sequenceTimer = SEQUENCE_TIMEOUT;
    return 'correct';
  } else {
    boss.sequenceProgress = 0;
    boss.sequenceTimer = SEQUENCE_TIMEOUT;
    boss.zoneFlashState = 'wrong';
    boss.zoneFlashTimer = FLASH_DURATION;
    return 'wrong';
  }
}

/**
 * Returns true if the boss should fire a protest flyer this tick.
 * Resets flyerCooldown on fire.
 * @param {{ flyerCooldown: number }} boss
 * @param {number} dt - Timestep (not used directly; cooldown already decremented in updateBoss)
 * @returns {boolean}
 */
export function shouldBossFire(boss) {
  if (boss.flyerCooldown <= 0) {
    boss.flyerCooldown = 1.2 + Math.random() * 1.2;
    return true;
  }
  return false;
}

/**
 * Renders the boss sprite, zone indicator boxes, sequence progress, and countdown bar.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number, sequenceRequired: number[], sequenceProgress: number, sequenceTimer: number, zoneFlashState: string, active: boolean, frameIndex: number }} boss
 * @returns {void}
 */
export function renderBoss(ctx, boss) {
  if (!boss.active) return;

  const sheet = SPRITES.boss;
  const frame = sheet.frames[boss.frameIndex % sheet.frames.length];
  drawFrame(ctx, frame, boss.x, boss.y, PIXEL_SCALE);

  // Amber pulsing hit-zone outline during pre-sequence highlight
  if (boss.preSequenceHighlightTimer > 0) {
    ctx.save();
    const pulse = (Math.sin(boss.preSequenceHighlightTimer * 8) + 1) / 2; // 0–1 pulsing
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.4 + pulse * 0.5;
    ctx.strokeRect(
      boss.x - boss.width / 2 - 2,
      boss.y - boss.height / 2 - 2,
      boss.width + 4,
      boss.height + 4,
    );
    ctx.restore();
  }

  // Flash overlay
  if (boss.zoneFlashState !== 'idle') {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = boss.zoneFlashState === 'correct' ? ZONE_CORRECT : ZONE_WRONG;
    ctx.fillRect(boss.x - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Zone indicator boxes (3 zones above boss)
  const zoneW  = 28;
  const zoneH  = 14;
  const zoneY  = boss.y - boss.height / 2 - zoneH - 6;
  const totalW = 3 * zoneW + 2 * 3;
  let zx = boss.x - totalW / 2;

  for (let z = 0; z < 3; z++) {
    let boxColor = ZONE_DEFAULT;
    const isNextRequired = boss.sequenceRequired[boss.sequenceProgress] === z;
    if (boss.zoneFlashState === 'correct' && boss.sequenceProgress > 0 &&
        boss.sequenceRequired[boss.sequenceProgress - 1] === z) {
      boxColor = ZONE_CORRECT;
    } else if (boss.zoneFlashState === 'wrong') {
      boxColor = ZONE_WRONG;
    } else if (isNextRequired) {
      boxColor = ZONE_NEXT;
    } else {
      // Show zones already completed (dimmer)
      const completedZones = boss.sequenceRequired.slice(0, boss.sequenceProgress);
      boxColor = ZONE_PENDING;
    }

    ctx.fillStyle = boxColor;
    ctx.fillRect(zx, zoneY, zoneW, zoneH);

    // Zone label
    ctx.fillStyle = '#fff';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ZONE_LABELS[z], zx + zoneW / 2, zoneY + 9);
    zx += zoneW + 3;
  }

  // Sequence progress indicator dots above zone boxes
  const dotY = zoneY - 8;
  const dotSpacing = 8;
  const dotsX = boss.x - (boss.sequenceRequired.length * dotSpacing) / 2;
  for (let i = 0; i < boss.sequenceRequired.length; i++) {
    ctx.fillStyle = i < boss.sequenceProgress ? ZONE_CORRECT : '#555';
    ctx.fillRect(dotsX + i * dotSpacing, dotY, 5, 5);
  }

  // Sequence countdown bar
  const barW  = boss.width * 2;
  const barH  = 3;
  const barX  = boss.x - barW / 2;
  const barY2 = boss.y + boss.height / 2 + 4;
  const pct   = boss.sequenceTimer / SEQUENCE_TIMEOUT;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY2, barW, barH);
  ctx.fillStyle = pct > 0.4 ? '#22cc55' : pct > 0.2 ? '#ffaa00' : '#cc2233';
  ctx.fillRect(barX, barY2, barW * pct, barH);
}
