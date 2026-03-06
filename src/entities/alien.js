/**
 * @module alien
 * @description Regular alien entity — 1 hit to convince. Base type for all grid enemies.
 */

import { SPRITES, drawFrame } from './sprites.js';
import { PIXEL_SCALE } from '../game.js';

/**
 * Pool of HR protest slogans displayed on alien protest signs.
 * @type {string[]}
 */
export const PROTEST_SLOGANS = [
  'MORE STARS, LESS WORK',
  'GRAVITY PAY GAP',
  'UNIONIZE THE UNIVERSE',
  'NO UNPAID OVERTIME',
  'KPIs ARE VIOLENCE',
  'LEVERAGE THIS',
  'END SYNERGY CULTURE',
  'WELLNESS DAY \u2260 PAY RISE',
];

/**
 * Creates a regular Alien object.
 * @param {number} x - Horizontal centre (px)
 * @param {number} y - Vertical centre (px)
 * @param {'it'|'accounting'|'management'} theme - Departmental theme
 * @returns {{ x: number, y: number, width: number, height: number, type: string, theme: string, hp: number, maxHp: number, mood: number, moodState: string, frameIndex: number, frameTimer: number, animFps: number, active: boolean, flyerCooldown: number, protestSign: string, isPerformanceReview: boolean, speedMultiplier: number, pointsMultiplier: number }}
 */
export function createAlien(x, y, theme) {
  return {
    x,
    y,
    width: 24,
    height: 21,
    type: 'regular',
    theme,
    hp: 1,
    maxHp: 1,
    mood: 100,
    moodState: 'angry',
    frameIndex: 0,
    frameTimer: 0,
    animFps: 4,
    active: true,
    flyerCooldown: 2 + Math.random() * 4,
    protestSign: PROTEST_SLOGANS[Math.floor(Math.random() * PROTEST_SLOGANS.length)],
    isPerformanceReview: false,
    speedMultiplier: 1.0,
    pointsMultiplier: 1.0,
  };
}

/**
 * Advances alien animation and flyer cooldown.
 * Does NOT handle formation movement — that is driven by levels.js.
 * @param {{ frameIndex: number, frameTimer: number, animFps: number, flyerCooldown: number }} alien
 * @param {number} dt - Timestep (s)
 * @returns {void}
 */
export function updateAlien(alien, dt) {
  // Animate protest sign
  alien.frameTimer += dt;
  if (alien.frameTimer >= 1 / alien.animFps) {
    alien.frameTimer -= 1 / alien.animFps;
    const sheet = _getSheet(alien);
    alien.frameIndex = (alien.frameIndex + 1) % sheet.frames.length;
  }

  // Tick flyer cooldown (decremented here; caller checks shouldFire)
  alien.flyerCooldown -= dt;
}

/**
 * Returns true if the alien should fire a protest flyer this tick.
 * Resets flyerCooldown on fire.
 * @param {{ flyerCooldown: number }} alien
 * @param {number} baseCooldown - Base cooldown duration (s) for this level's frequency
 * @returns {boolean}
 */
export function shouldFire(alien, baseCooldown) {
  if (alien.flyerCooldown <= 0) {
    alien.flyerCooldown = baseCooldown + Math.random() * baseCooldown;
    return true;
  }
  return false;
}

/**
 * Applies one hit to a regular alien. Returns remaining HP.
 * Mutates hp, mood, moodState, and active.
 * @param {{ hp: number, mood: number, moodState: string, active: boolean }} alien
 * @returns {number} Remaining HP after the hit.
 */
export function hitAlien(alien) {
  alien.hp -= 1;
  if (alien.hp <= 0) {
    alien.hp = 0;
    alien.mood = 0;
    alien.moodState = 'convinced';
    alien.active = false;
  }
  return alien.hp;
}

/**
 * Activates Performance Review state on an alien — faster, worth more points.
 * @param {{ isPerformanceReview: boolean, speedMultiplier: number, pointsMultiplier: number }} alien
 * @returns {void}
 */
export function activatePerformanceReview(alien) {
  alien.isPerformanceReview = true;
  alien.speedMultiplier    = 1.5;
  alien.pointsMultiplier   = 2.0;
}

/**
 * Clears Performance Review state on an alien, resetting speed and points to defaults.
 * @param {{ isPerformanceReview: boolean, speedMultiplier: number, pointsMultiplier: number }} alien
 * @returns {void}
 */
export function deactivatePerformanceReview(alien) {
  alien.isPerformanceReview = false;
  alien.speedMultiplier    = 1.0;
  alien.pointsMultiplier   = 1.0;
}

/**
 * Renders the alien sprite, protest sign text, and mood bar.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, theme: string, type: string, frameIndex: number, mood: number, hp: number, maxHp: number, protestSign: string, isPerformanceReview: boolean }} alien
 * @returns {void}
 */
export function renderAlien(ctx, alien) {
  if (!alien.active) return;
  const sheet = _getSheet(alien);
  const frame = sheet.frames[alien.frameIndex % sheet.frames.length];

  // Performance Review: render with red shadow tint
  if (alien.isPerformanceReview) {
    ctx.save();
    ctx.shadowColor = '#ff2244';
    ctx.shadowBlur  = 8;
    drawFrame(ctx, frame, alien.x, alien.y, PIXEL_SCALE);
    ctx.restore();
    // Red tint overlay
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(alien.x - alien.width / 2, alien.y - alien.height / 2, alien.width, alien.height);
    ctx.restore();
  } else {
    drawFrame(ctx, frame, alien.x, alien.y, PIXEL_SCALE);
  }

  // Protest sign text above sprite (6px pixel font, neon green)
  if (alien.protestSign) {
    ctx.save();
    ctx.font      = '5px "Press Start 2P", "Courier New", monospace';
    ctx.fillStyle = '#39ff14';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(alien.protestSign, alien.x, alien.y - alien.height / 2 - 8);
    ctx.restore();
  }

  _renderMoodBar(ctx, alien);
}

// ── Internal helpers ──────────────────────────────────────────

/**
 * @param {{ theme: string, type: string }} alien
 * @returns {import('./sprites.js').SpriteSheet}
 */
function _getSheet(alien) {
  const themeSprites = SPRITES.alien[alien.theme] ?? SPRITES.alien.it;
  return alien.type === 'unionist' ? themeSprites.unionist : themeSprites.regular;
}

/**
 * Renders a small mood bar above the sprite.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, height: number, mood: number, maxHp: number, hp: number, width: number }} entity
 */
function _renderMoodBar(ctx, entity) {
  const barW = entity.width;
  const barH = 2;
  const barX = entity.x - barW / 2;
  const barY = entity.y - entity.height / 2 - 5;
  const fraction = entity.mood / 100;

  // Background
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);

  // Fill color: green → yellow → red
  const r = Math.round(255 * (1 - fraction));
  const g = Math.round(255 * fraction);
  ctx.fillStyle = `rgb(${r},${g},0)`;
  ctx.fillRect(barX, barY, barW * fraction, barH);
}

export { _renderMoodBar as renderMoodBar };
