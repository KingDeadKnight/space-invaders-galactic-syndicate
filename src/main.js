/**
 * @module main
 * @description Entry point. rAF fixed-timestep game loop, input listener bootstrap, audio init.
 * Loaded via `<script type="module" src="src/main.js">` in index.html.
 *
 * Loop pattern: "Fix Your Timestep" (Glenn Fiedler)
 *   delta = min(now − lastTime, 250 ms)
 *   drain accumulator in FIXED_STEP_S chunks → updateGame(state, FIXED_STEP_S)
 *   render with current state
 */

import { initCanvas, render, resizeCanvas }   from './canvas.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FIXED_STEP_S,
  setAudioManager,
  initGame,
  startGame,
  pauseGame,
  resumeGame,
  restartGame,
  updateGame,
} from './game.js';
import { initAudio, resumeContext, startBGM, toggleMute, playSFX } from './audio/soundManager.js';

// ── Bootstrap ─────────────────────────────────────────────────

const canvasEl = /** @type {HTMLCanvasElement} */ (document.getElementById('game'));
const ctx      = initCanvas(canvasEl);

// Apply fullscreen scaling immediately and on every resize
resizeCanvas(canvasEl);
window.addEventListener('resize', () => resizeCanvas(canvasEl));

/** @type {GameState} */
const state = initGame(CANVAS_WIDTH, CANVAS_HEIGHT);

// Audio manager — created on load, started on first keydown (autoplay policy)
const audioManager = initAudio();

// Expose playSFX method for convenience
audioManager.playSFX = (type) => playSFX(audioManager, type);

// Wire audio manager into game.js
setAudioManager(audioManager);

let _audioStarted = false;

// ── Input Handling ────────────────────────────────────────────

/**
 * @type {{ left: boolean, right: boolean, fire: boolean, pause: boolean, mute: boolean }}
 * Shared with state.input — same object reference
 */
const input = state.input;

/** Keys currently held down. */
const keysHeld = new Set();

/**
 * Edge-triggered keys: pause and mute should only fire once per keydown, not while held.
 */
const edgeKeys = new Set(['p', 'escape', 'm']);

document.addEventListener('keydown', (e) => {
  // Resume AudioContext on first user gesture
  if (!_audioStarted) {
    resumeContext(audioManager);
    startBGM(audioManager);
    _audioStarted = true;
  }

  const key = e.key.toLowerCase();

  // Edge-triggered keys: only act if not already held
  if (!keysHeld.has(key)) {
    if (key === 'p' || key === 'escape') {
      if (state.phase === 'PLAYING') {
        pauseGame(state);
      } else if (state.phase === 'PAUSED') {
        resumeGame(state);
      }
    }
    if (key === 'm') {
      toggleMute(audioManager);
    }
    if (key === 'r' && state.phase === 'PAUSED') {
      state.reducedMotion = !state.reducedMotion;
    }
  }

  keysHeld.add(key);

  // Continuous keys
  if (key === 'arrowleft'  || key === 'a') input.left  = true;
  if (key === 'arrowright' || key === 'd') input.right = true;
  if (key === ' ' || key === 'space') {
    input.fire = true;
    // Start game from MENU
    if (state.phase === 'MENU') {
      startGame(state);
    }
    // Restart from GAMEOVER or WIN
    if (state.phase === 'GAMEOVER' || state.phase === 'WIN') {
      restartGame(state, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }
  if (key === 'enter') {
    if (state.phase === 'MENU') startGame(state);
    if (state.phase === 'GAMEOVER' || state.phase === 'WIN') {
      restartGame(state, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // Prevent default scrolling for arrow keys and space
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  keysHeld.delete(key);

  if (key === 'arrowleft'  || key === 'a') input.left  = false;
  if (key === 'arrowright' || key === 'd') input.right = false;
  if (key === ' ' || key === 'space')      input.fire  = false;
});

// ── Fixed-Timestep rAF Loop ───────────────────────────────────

const FIXED_STEP_MS  = FIXED_STEP_S * 1000;
const MAX_DELTA_MS   = 250;

let lastTime    = null;
let accumulator = 0;

/**
 * Main rAF loop callback.
 * @param {number} timestamp - DOMHighResTimeStamp from requestAnimationFrame
 */
function loop(timestamp) {
  requestAnimationFrame(loop);

  if (lastTime === null) {
    lastTime = timestamp;
    return;
  }

  const rawDelta  = timestamp - lastTime;
  lastTime        = timestamp;
  const delta     = Math.min(rawDelta, MAX_DELTA_MS);

  // Only update simulation while PLAYING or CUTSCENE
  if (state.phase === 'PLAYING' || state.phase === 'CUTSCENE') {
    accumulator += delta;
    while (accumulator >= FIXED_STEP_MS) {
      updateGame(state, FIXED_STEP_S);
      accumulator -= FIXED_STEP_MS;
    }
  }

  // Always render (menu, paused, gameover, win, playing)
  render(ctx, state);
}

// Kick off the loop
requestAnimationFrame(loop);

// Export audioManager for potential use by other modules
export { audioManager };
