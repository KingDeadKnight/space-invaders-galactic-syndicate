/**
 * @module cutscene
 * @description Quarterly Review cutscene between WAVE clear and BOSS phase.
 * Shows an animated KPI bar-chart screen drawn entirely on the canvas.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';

// Font constants (local copies — avoids cross-module dependency on canvas.js)
const FONT_HEADER = '9px "Press Start 2P", "Courier New", monospace';
const FONT_SUB    = '5px "Press Start 2P", "Courier New", monospace';

/** Total seconds before the cutscene auto-advances. */
const CUTSCENE_DURATION = 4.0;
/** Seconds over which the KPI bars grow to full width. */
const BAR_GROW_DURATION = 1.5;

/**
 * Derives the four KPI values from the current score state.
 * @param {{ points: number, consecutiveHits: number }} score
 * @param {number} level - Completed level number
 * @returns {Array<{label:string,value:number,color:string}>}
 */
function _buildStats(score, level) {
  const usr = Math.min(100, Math.round(score.points / Math.max(1, level * 100)));
  const sa  = Math.min(100, Math.round((score.consecutiveHits / 20) * 100));
  const lu  = 40 + Math.floor(Math.random() * 56); // flavour: 40–95
  const ed  = 100 - usr;
  return [
    { label: 'UNION SUPPRESSION RATE', value: usr, color: '#39ff14' },
    { label: 'SYNERGY ALIGNMENT',      value: sa,  color: '#00aaff' },
    { label: 'LEVERAGE UTILISED',      value: lu,  color: '#ff2244' },
    { label: 'EMPLOYEE DISSATISFACTION', value: ed, color: '#ffdd44' },
  ];
}

/**
 * Creates the initial CutsceneState for the quarterly review screen.
 * @param {{ points: number, consecutiveHits: number }} score
 * @param {number} level - Completed level number
 * @returns {{ timer: number, duration: number, barProgress: number, skipped: boolean, stats: Array, level: number }}
 */
export function createCutsceneState(score, level) {
  return {
    timer:       0,
    duration:    CUTSCENE_DURATION,
    barProgress: 0.0,
    skipped:     false,
    stats:       _buildStats(score, level),
    level,
  };
}

/**
 * Advances the cutscene timer and bar animation. Returns true when the cutscene is complete.
 * The cutscene ends either when the timer exceeds `duration` or the player presses fire.
 * @param {{ timer: number, duration: number, barProgress: number, skipped: boolean }} cutsceneState
 * @param {number} dt - Fixed timestep (s)
 * @param {{ fire: boolean }} input - Current input snapshot
 * @returns {boolean} True when done (auto-advance or skip).
 */
export function updateCutscene(cutsceneState, dt, input) {
  if (cutsceneState.skipped) return true;

  cutsceneState.timer       += dt;
  cutsceneState.barProgress  = Math.min(1.0, cutsceneState.timer / BAR_GROW_DURATION);

  if (input.fire) {
    cutsceneState.skipped = true;
    return true;
  }
  return cutsceneState.timer >= cutsceneState.duration;
}

/**
 * Renders the quarterly review cutscene screen.
 * Draws a dark overlay, level header, four animated KPI `fillRect` bars, and a skip prompt.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ timer: number, barProgress: number, stats: Array, level: number }} cutsceneState
 * @returns {void}
 */
export function renderCutscene(ctx, cutsceneState) {
  ctx.save();

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Header
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor  = '#39ff14';
  ctx.shadowBlur   = 8;
  ctx.fillStyle    = '#39ff14';
  ctx.font         = FONT_HEADER;
  ctx.fillText('QUARTERLY REVIEW', CANVAS_WIDTH / 2, 30);
  ctx.shadowBlur   = 0;

  ctx.fillStyle = '#88aaff';
  ctx.font      = FONT_SUB;
  ctx.fillText(`PERFORMANCE PERIOD: Q${cutsceneState.level}`, CANVAS_WIDTH / 2, 52);

  // KPI bars
  const barMaxW = CANVAS_WIDTH - 80;   // 400px bar area (80px margins)
  const barH    = 14;
  const startX  = 40;

  for (let i = 0; i < cutsceneState.stats.length; i++) {
    const bar  = cutsceneState.stats[i];
    const barY = 75 + i * 52;

    // Label
    ctx.fillStyle    = '#aaaaaa';
    ctx.font         = FONT_SUB;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(bar.label, startX, barY);

    // Background track
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(startX, barY + 12, barMaxW, barH);

    // Animated fill
    const fillW = Math.round(barMaxW * (bar.value / 100) * cutsceneState.barProgress);
    ctx.fillStyle = bar.color;
    ctx.fillRect(startX, barY + 12, fillW, barH);

    // Border
    ctx.strokeStyle = '#555555';
    ctx.lineWidth   = 1;
    ctx.strokeRect(startX, barY + 12, barMaxW, barH);

    // Value percentage
    const displayVal = Math.round(bar.value * cutsceneState.barProgress);
    ctx.fillStyle    = '#ffffff';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${displayVal}%`, startX + barMaxW + 36, barY + 12);
  }

  // Skip prompt (blinking)
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle    = '#555555';
    ctx.font         = FONT_SUB;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[ SPACE ] SKIP', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16);
  }

  ctx.restore();
}
