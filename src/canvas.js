/**
 * @module canvas
 * @description Canvas initialisation and all rendering: background, entities, HUD, screens.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_SCALE, SEQUENCE_TIMEOUT } from './game.js';
import { renderPlayer }     from './entities/player.js';
import { renderAlien }      from './entities/alien.js';
import { renderUnionist }   from './entities/unionist.js';
import { renderBoss }       from './entities/boss.js';
import { renderProjectile } from './entities/projectile.js';
import { renderShield }     from './entities/shield.js';
import { getComboMultiplier } from './systems/scoring.js';
import { renderParticles }  from './systems/particles.js';
import { renderCutscene }   from './systems/cutscene.js';
import { renderPowerup }    from './entities/powerup.js';

// ── Font constants ─────────────────────────────────────────────
const FONT_PIXEL  = '6px "Press Start 2P", "Courier New", monospace';
const FONT_TITLE  = '11px "Press Start 2P", "Courier New", monospace';
const FONT_SUB    = '6px "Press Start 2P", "Courier New", monospace';
const FONT_HUD    = '5px "Press Start 2P", "Courier New", monospace';
const FONT_SCORE  = '6px "Press Start 2P", "Courier New", monospace';
const FONT_MSG    = '7px "Press Start 2P", "Courier New", monospace';
const FONT_LARGE  = '9px "Press Start 2P", "Courier New", monospace';

// ── Cityscape state (module-scoped) ──────────────────────────
/** Horizontal scroll position of the cityscape (logical px). */
let _cityscapeOffset = 0;
/** Last timestamp used to compute cityscape dt (performance.now units). */
let _lastCityscapeTime = 0;
/** Scroll speed (logical px/s). */
const CITYSCAPE_SPEED = 15;
/** World width = one full loop of the cityscape panorama. */
const CITYSCAPE_WIDTH = CANVAS_WIDTH;

/** @type {Array<{x:number,w:number,h:number}>} Deterministic building silhouettes. */
const _BUILDINGS = (() => {
  const buildings = [];
  let x = 0;
  let seed = 0xc0ffee;
  const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
  // Generate enough buildings to cover CITYSCAPE_WIDTH * 2 (for seamless wrap)
  while (x < CITYSCAPE_WIDTH) {
    const w = Math.floor(rng() * 16) + 10;  // 10–26 px wide
    const h = Math.floor(rng() * 100) + 40; // 40–140 px tall
    buildings.push({ x, w, h });
    x += w + Math.floor(rng() * 4) + 2;     // 2–6 px gap
  }
  return buildings;
})();

/**
 * Scrolling corporate cityscape rendered as building silhouettes.
 * Advances _cityscapeOffset unless reducedMotion is true.
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} reducedMotion - When true the offset is not updated.
 * @returns {void}
 */
function _renderCityscape(ctx, reducedMotion) {
  const now = performance.now();
  if (_lastCityscapeTime > 0 && !reducedMotion) {
    const dt = (now - _lastCityscapeTime) / 1000;
    _cityscapeOffset = (_cityscapeOffset + CITYSCAPE_SPEED * dt) % CITYSCAPE_WIDTH;
  }
  _lastCityscapeTime = now;

  ctx.save();
  ctx.fillStyle = '#0a0a14';
  // Render buildings twice (shifted by CITYSCAPE_WIDTH) for seamless loop
  for (let pass = 0; pass < 2; pass++) {
    const worldShift = -_cityscapeOffset + pass * CITYSCAPE_WIDTH;
    for (const b of _BUILDINGS) {
      const screenX = b.x + worldShift;
      if (screenX + b.w < 0 || screenX > CANVAS_WIDTH) continue;
      ctx.fillRect(screenX, CANVAS_HEIGHT - b.h, b.w, b.h);
    }
  }
  // Window lights on buildings
  ctx.fillStyle = '#ffee88';
  for (let pass = 0; pass < 2; pass++) {
    const worldShift = -_cityscapeOffset + pass * CITYSCAPE_WIDTH;
    for (const b of _BUILDINGS) {
      const screenX = b.x + worldShift;
      if (screenX + b.w < 0 || screenX > CANVAS_WIDTH) continue;
      // Small windows every ~8px within the building
      for (let wy = CANVAS_HEIGHT - b.h + 6; wy < CANVAS_HEIGHT - 4; wy += 10) {
        for (let wx = screenX + 2; wx < screenX + b.w - 2; wx += 6) {
          if ((Math.floor(wx * 7 + wy * 13) & 3) !== 0) continue; // sparse
          ctx.fillRect(wx, wy, 2, 2);
        }
      }
    }
  }
  ctx.restore();
}

/**
 * Renders scanlines as the final compositing layer.
 * Draws 0.06-alpha black horizontal stripes every 4 logical pixels.
 * @param {CanvasRenderingContext2D} ctx
 * @returns {void}
 */
function _renderScanlines(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle   = '#000000';
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
  }
  ctx.restore();
}
const THEME_PALETTE = {
  it:         { bg: '#000511', accent: '#0a2a55', grid: '#0033aa', gridAlpha: 0.06 },
  accounting: { bg: '#010a00', accent: '#0a2200', grid: '#008822', gridAlpha: 0.06 },
  management: { bg: '#05000a', accent: '#1a001a', grid: '#550055', gridAlpha: 0.06 },
  default:    { bg: '#000000', accent: '#111111', grid: '#333333', gridAlpha: 0.04 },
};

/**
 * One-time canvas setup: sets dimensions and CSS upscaling.
 * Returns the 2D rendering context.
 * @param {HTMLCanvasElement} canvasEl - Target canvas element
 * @returns {CanvasRenderingContext2D}
 */
export function initCanvas(canvasEl) {
  canvasEl.width  = CANVAS_WIDTH;
  canvasEl.height = CANVAS_HEIGHT;
  canvasEl.style.imageRendering = 'pixelated';
  canvasEl.style.imageRendering = 'crisp-edges'; // Firefox fallback
  return canvasEl.getContext('2d');
}

/**
 * Scales the canvas element to fill the browser window while preserving aspect ratio.
 * Uses CSS width/height to scale the logical canvas (pixel-perfect without changing resolution).
 * @param {HTMLCanvasElement} canvasEl - Target canvas element
 * @returns {void}
 */
export function resizeCanvas(canvasEl) {
  const scale = Math.min(
    window.innerWidth  / CANVAS_WIDTH,
    window.innerHeight / CANVAS_HEIGHT,
  );
  canvasEl.style.width  = `${CANVAS_WIDTH  * scale}px`;
  canvasEl.style.height = `${CANVAS_HEIGHT * scale}px`;
}

/**
 * Main render function. Clears canvas and delegates to sub-renders based on state.phase.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ phase: string, level: number, levelPhase: string, player: Object, aliens: Object[], boss: Object|null, projectiles: Object[], shields: Object[], score: Object, levelConfig: Object|null, transitionTimer: number }} state
 * @returns {void}
 */
export function render(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  switch (state.phase) {
    case 'MENU':
      _renderMenu(ctx, state);
      break;
    case 'PLAYING':
      _renderPlaying(ctx, state);
      break;
    case 'PAUSED':
      _renderPlaying(ctx, state);
      _renderPauseOverlay(ctx, state);
      break;
    case 'GAMEOVER':
      _renderGameOver(ctx, state);
      break;
    case 'CUTSCENE':
      if (state.cutsceneState) renderCutscene(ctx, state.cutsceneState);
      break;
    case 'WIN':
      _renderWin(ctx, state);
      break;
    default:
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

/**
 * Draws the in-game HUD: HR Satisfaction Rate, Employee Engagement Bonus, lives, level.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ score: Object, player: Object, level: number, levelPhase: string }} state
 * @returns {void}
 */
export function renderHUD(ctx, state) {
  const { score, player, level, levelPhase } = state;
  const multiplier = getComboMultiplier(score);

  ctx.save();
  ctx.textBaseline = 'top';

  // KPI Dashboard panel — bordered neon box around score area
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth   = 1;
  ctx.strokeRect(2, 2, 96, multiplier > 1 ? 36 : 26);

  // Score — top left
  ctx.fillStyle = '#39ff14';
  ctx.font      = FONT_SCORE;
  ctx.textAlign = 'left';
  ctx.fillText('KPIs', 5, 4);
  ctx.font      = FONT_HUD;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SYNERGIES: ${score.points}`, 5, 14);

  // Combo multiplier — only when > 1
  if (multiplier > 1) {
    ctx.fillStyle = '#ffdd44';
    ctx.font      = FONT_PIXEL;
    ctx.fillText(`LEVERAGE x${multiplier}`, 5, 26);
  }

  // Lives — top right
  ctx.textAlign  = 'right';
  ctx.font       = FONT_SCORE;
  ctx.fillStyle  = '#ff6688';
  ctx.fillText('HEADCOUNT', CANVAS_WIDTH - 4, 4);
  ctx.font       = FONT_HUD;
  ctx.fillStyle  = '#ffffff';
  ctx.fillText(`\u2665`.repeat(Math.max(0, player.lives)), CANVAS_WIDTH - 4, 14);

  // Level indicator — top center
  ctx.textAlign  = 'center';
  ctx.font       = FONT_PIXEL;
  ctx.fillStyle  = '#88aaff';
  const theme    = state.levelConfig ? state.levelConfig.theme.toUpperCase() : '';
  ctx.fillText(`DEPT ${level}: ${theme}`, CANVAS_WIDTH / 2, 4);

  // Level phase indicator
  if (levelPhase === 'BOSS') {
    ctx.fillStyle = '#ff4444';
    ctx.fillText('! NEGOTIATOR !', CANVAS_WIDTH / 2, 14);
  }

  ctx.restore();
}

// ── Private render helpers ─────────────────────────────────────

/**
 * Renders the MENU (title) screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function _renderMenu(ctx, state) {
  // Background
  ctx.fillStyle = '#000511';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  _renderStarfield(ctx);

  // Title
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Glow effect
  ctx.shadowColor  = '#3af5ff';
  ctx.shadowBlur   = 12;
  ctx.fillStyle    = '#3af5ff';
  ctx.font         = FONT_TITLE;
  ctx.fillText('SYNDICAT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillText('GALACTIQUE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 35);
  ctx.shadowBlur   = 0;

  // Subtitle
  ctx.fillStyle = '#aaccff';
  ctx.font      = FONT_SUB;
  ctx.fillText('UNION SUPPRESSION DIVISION', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

  // Blinking start prompt
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffdd44';
    ctx.font      = FONT_PIXEL;
    ctx.fillText('[ SPACE ] LEVERAGE THIS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
  }

  // Controls reference panel
  const panelX = CANVAS_WIDTH / 2 - 100;
  const panelY = CANVAS_HEIGHT / 2 + 48;
  const panelW = 200;
  const panelH = 44;
  ctx.strokeStyle = '#334466';
  ctx.lineWidth   = 1;
  ctx.strokeRect(panelX, panelY, panelW, panelH);
  ctx.fillStyle = 'rgba(0,5,17,0.8)';
  ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
  ctx.fillStyle = '#556688';
  ctx.font      = FONT_PIXEL;
  ctx.fillText('\u2190\u2192 / A-D  MOVE', CANVAS_WIDTH / 2, panelY + 10);
  ctx.fillText('SPACE  FIRE', CANVAS_WIDTH / 2, panelY + 22);
  ctx.fillText('ESC/P  PAUSE    M  MUTE', CANVAS_WIDTH / 2, panelY + 34);

  ctx.restore();
}

/**
 * Renders the PLAYING game screen (background, entities, HUD, transition overlay).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function _renderPlaying(ctx, state) {
  const theme = state.levelConfig ? state.levelConfig.theme : 'default';
  _renderBackground(ctx, theme);
  _renderCityscape(ctx, state.reducedMotion ?? false);

  // Shields
  for (const shield of state.shields) {
    renderShield(ctx, shield);
  }

  // Particles (steam etc.) — drawn behind entities
  renderParticles(ctx, state.particles ?? [], state.reducedMotion ?? false);

  // Aliens
  for (const alien of state.aliens) {
    if (!alien.active) continue;
    if (alien.type === 'unionist') {
      renderUnionist(ctx, alien);
    } else {
      renderAlien(ctx, alien);
    }
  }

  // Boss
  if (state.levelPhase === 'BOSS' && state.boss && state.boss.active) {
    renderBoss(ctx, state.boss);
  }

  // Player
  renderPlayer(ctx, state.player);

  // Power-ups
  if (state.powerups) {
    for (const pu of state.powerups) {
      if (pu.active) renderPowerup(ctx, pu);
    }
  }

  // Projectiles
  for (const proj of state.projectiles) {
    renderProjectile(ctx, proj);
  }

  // HUD
  renderHUD(ctx, state);

  // Transition overlay
  if (state.levelPhase === 'TRANSITION') {
    _renderTransition(ctx, state);
  }

  // Scanlines — final layer
  _renderScanlines(ctx);
}

/**
 * Renders the pause overlay with Reduced Motion toggle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function _renderPauseOverlay(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#ffdd44';
  ctx.font         = FONT_TITLE;
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 22);

  ctx.font      = FONT_PIXEL;
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('P / ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 4);

  // Reduced Motion toggle panel
  const rmLabel = `REDUCED MOTION: ${state && state.reducedMotion ? 'ON ' : 'OFF'}`;
  const rmY     = CANVAS_HEIGHT / 2 + 28;
  const rmX     = CANVAS_WIDTH / 2 - 70;
  ctx.strokeStyle = state && state.reducedMotion ? '#39ff14' : '#555555';
  ctx.lineWidth   = 1;
  ctx.strokeRect(rmX, rmY - 6, 140, 14);
  ctx.fillStyle   = state && state.reducedMotion ? '#39ff14' : '#888888';
  ctx.font        = FONT_PIXEL;
  ctx.fillText(rmLabel, CANVAS_WIDTH / 2, rmY + 1);

  ctx.font      = FONT_PIXEL;
  ctx.fillStyle = '#445566';
  ctx.fillText('R to toggle', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 48);
  ctx.restore();
}

/**
 * Renders the GAMEOVER screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function _renderGameOver(ctx, state) {
  ctx.fillStyle = '#050000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  _renderStarfield(ctx);

  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#cc0000';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = '#ff2222';
  ctx.font        = FONT_LARGE;
  ctx.fillText('GENERAL STRIKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 55);
  ctx.fillText('DECLARED.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 35);
  ctx.shadowBlur  = 0;

  ctx.fillStyle = '#ffaaaa';
  ctx.font      = FONT_MSG;
  ctx.fillText('YOU ARE TERMINATED.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5);

  ctx.fillStyle = '#888888';
  ctx.font      = FONT_PIXEL;
  ctx.fillText(`UNION SUPPRESSION RATE: ${state.score.points}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 22);

  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffdd44';
    ctx.font      = FONT_PIXEL;
    ctx.fillText('[ SPACE ] SYNERGISE HARDER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 44);
  }
  ctx.restore();
}

/**
 * Renders the WIN screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function _renderWin(ctx, state) {
  ctx.fillStyle = '#000508';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  _renderStarfield(ctx);

  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#00ffaa';
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = '#00ffaa';
  ctx.font        = FONT_LARGE;
  ctx.fillText('GALAXY IS BACK', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
  ctx.fillText('TO WORK!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 35);
  ctx.shadowBlur  = 0;

  ctx.fillStyle = '#aaffdd';
  ctx.font      = FONT_MSG;
  ctx.fillText('Promoted to CHRO!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5);

  ctx.fillStyle = '#aaaaaa';
  ctx.font      = FONT_PIXEL;
  ctx.fillText(`Final HR Rate: ${state.score.points}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);

  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffdd44';
    ctx.font      = FONT_PIXEL;
    ctx.fillText('PRESS SPACE TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 52);
  }
  ctx.restore();
}

/**
 * Renders the level-complete transition overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ level: number, transitionTimer: number }} state
 */
function _renderTransition(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  if (state.boss && !state.boss.active) {
    // Boss defeated — show level complete
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = '#ffcc00';
    ctx.font        = FONT_TITLE;
    ctx.fillText(`LEVEL ${state.level} COMPLETE!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = '#aaaaaa';
    ctx.font        = FONT_PIXEL;
    ctx.fillText('Negotiator convinced!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
  } else {
    // Wave cleared — boss incoming
    ctx.fillStyle = '#ff8800';
    ctx.font      = FONT_TITLE;
    ctx.fillText('WAVE CLEARED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);
    ctx.fillStyle = '#ffaaaa';
    ctx.font      = FONT_PIXEL;
    ctx.fillText('THE NEGOTIATOR APPROACHES...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
  }
  ctx.restore();
}

/**
 * Renders the themed level background.
 * @param {CanvasRenderingContext2D} ctx
 * @param {'it'|'accounting'|'management'|string} theme
 */
function _renderBackground(ctx, theme) {
  const pal = THEME_PALETTE[theme] ?? THEME_PALETTE.default;

  // Base fill
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grid / pattern overlay
  ctx.save();
  ctx.globalAlpha = pal.gridAlpha;
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth   = 1;

  if (theme === 'it') {
    // IT: monitor grid pattern
    const gridSize = 20;
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }
  } else if (theme === 'accounting') {
    // Accounting: horizontal ledger lines
    for (let y = 0; y < CANVAS_HEIGHT; y += 12) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }
  } else if (theme === 'management') {
    // Management: diagonal boardroom lines
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#1a001a');
    grad.addColorStop(1, '#000508');
    ctx.globalAlpha = 1;
    ctx.fillStyle   = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = pal.gridAlpha;
    for (let d = -CANVAS_HEIGHT; d < CANVAS_WIDTH; d += 30) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + CANVAS_HEIGHT, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }
  ctx.restore();

  // (scanlines are rendered as final pass in _renderPlaying)
  ctx.restore();
}

/**
 * Renders a simple static starfield (seed-based, same each frame for consistency).
 * @param {CanvasRenderingContext2D} ctx
 */
function _renderStarfield(ctx) {
  ctx.save();
  // Use a deterministic seed to place stars consistently
  const stars = _getStars();
  for (const [sx, sy, brightness] of stars) {
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.restore();
}

/** @type {Array<[number, number, number]>|null} */
let _cachedStars = null;

/**
 * Returns a deterministic set of star positions (cached).
 * @returns {Array<[number, number, number]>}
 */
function _getStars() {
  if (_cachedStars) return _cachedStars;
  // Simple LCG pseudo-random for determinism
  let seed = 0xdeadbeef;
  const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0x100000000; };
  _cachedStars = Array.from({ length: 80 }, () => [
    Math.floor(rng() * CANVAS_WIDTH),
    Math.floor(rng() * CANVAS_HEIGHT),
    rng() * 0.5 + 0.1,
  ]);
  return _cachedStars;
}
