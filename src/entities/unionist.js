/**
 * @module unionist
 * @description Hardened Unionist — 3-hit alien with fist-shake animation.
 * Extends the Alien shape with additional fields.
 */

import { SPRITES, drawFrame } from './sprites.js';
import { PIXEL_SCALE } from '../game.js';
import { updateAlien, shouldFire, renderMoodBar } from './alien.js';

/** Duration of the fist-shake animation (s). */
const FIST_SHAKE_DURATION = 0.5;

/** Mood transition thresholds per HP. */
const MOOD_BY_HP = { 3: 100, 2: 66, 1: 33, 0: 0 };

/**
 * Creates a Hardened Unionist object with 3 HP.
 * @param {number} x - Horizontal centre (px)
 * @param {number} y - Vertical centre (px)
 * @param {'it'|'accounting'|'management'} theme - Departmental theme
 * @returns {{ x: number, y: number, width: number, height: number, type: string, theme: string, hp: number, maxHp: number, mood: number, moodState: string, frameIndex: number, frameTimer: number, animFps: number, active: boolean, flyerCooldown: number, fistShaking: boolean, fistShakeTimer: number }}
 */
export function createUnionist(x, y, theme) {
  return {
    x,
    y,
    width: 27,
    height: 27,
    type: 'unionist',
    theme,
    hp: 3,
    maxHp: 3,
    mood: 100,
    moodState: 'angry',
    frameIndex: 0,
    frameTimer: 0,
    animFps: 4,
    active: true,
    flyerCooldown: 1 + Math.random() * 3,
    fistShaking: false,
    fistShakeTimer: 0,
    protestSign: '',
    isPerformanceReview: false,
    speedMultiplier: 1.0,
    pointsMultiplier: 1.0,
  };
}

/**
 * Applies one hit to a Hardened Unionist.
 * Manages mood, moodState, fist-shake trigger, and active flag.
 * @param {{ hp: number, maxHp: number, mood: number, moodState: string, fistShaking: boolean, fistShakeTimer: number, active: boolean }} unionist
 * @returns {number} Remaining HP after the hit.
 */
export function hitUnionist(unionist) {
  unionist.hp -= 1;
  unionist.mood = MOOD_BY_HP[Math.max(0, unionist.hp)] ?? 0;

  if (unionist.hp <= 0) {
    unionist.hp = 0;
    unionist.moodState = 'convinced';
    unionist.active = false;
  } else {
    unionist.moodState = unionist.hp === 1 ? 'cautious' : 'angry';
    unionist.fistShaking = true;
    unionist.fistShakeTimer = FIST_SHAKE_DURATION;
    unionist.frameIndex = 2; // fist-shake frame index
  }

  return unionist.hp;
}

/**
 * Extends updateAlien — additionally ticks fistShakeTimer and clears fistShaking on expiry.
 * @param {{ fistShaking: boolean, fistShakeTimer: number, frameIndex: number }} unionist
 * @param {number} dt - Timestep (s)
 * @returns {void}
 */
export function updateUnionist(unionist, dt) {
  updateAlien(unionist, dt);

  if (unionist.fistShaking) {
    unionist.fistShakeTimer -= dt;
    if (unionist.fistShakeTimer <= 0) {
      unionist.fistShaking = false;
      unionist.fistShakeTimer = 0;
      unionist.frameIndex = 0; // back to idle animation
    }
  }
}

/**
 * Re-exports shouldFire from alien for unionist use.
 * @param {{ flyerCooldown: number }} unionist
 * @param {number} baseCooldown
 * @returns {boolean}
 */
export { shouldFire } from './alien.js';

/**
 * Renders the unionist sprite with fist-shake frame when active,
 * plus the mood bar overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, theme: string, frameIndex: number, fistShaking: boolean, mood: number, width: number, height: number }} unionist
 * @returns {void}
 */
export function renderUnionist(ctx, unionist) {
  if (!unionist.active) return;
  const themeSprites = SPRITES.alien[unionist.theme] ?? SPRITES.alien.it;
  const sheet = themeSprites.unionist;

  // Use fist-shake frame (index 2) when fistShaking
  const fi = unionist.fistShaking ? 2 : (unionist.frameIndex % 2);
  const frame = sheet.frames[fi];
  drawFrame(ctx, frame, unionist.x, unionist.y, PIXEL_SCALE);

  renderMoodBar(ctx, unionist);

  // Flash tint when hit
  if (unionist.fistShaking && unionist.fistShakeTimer > FIST_SHAKE_DURATION * 0.7) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ff5500';
    ctx.fillRect(
      unionist.x - unionist.width / 2,
      unionist.y - unionist.height / 2,
      unionist.width,
      unionist.height
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
