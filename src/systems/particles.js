/**
 * @module particles
 * @description Particle system for visual effects (steam on shield hits, etc.).
 * All particles are plain objects updated in a flat array stored on GameState.
 */

/**
 * Creates a single Particle object.
 * @param {number} x - Horizontal position (logical px)
 * @param {number} y - Vertical position (logical px)
 * @param {number} vx - Horizontal velocity (px/s)
 * @param {number} vy - Vertical velocity (px/s); negative = upward
 * @param {number} life - Initial life in seconds (counts down to 0)
 * @param {string} color - CSS colour string
 * @param {number} size - Side length in logical px
 * @returns {{ x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string, size: number }}
 */
export function createParticle(x, y, vx, vy, life, color, size) {
  return { x, y, vx, vy, life, maxLife: life, color, size };
}

/**
 * Emits 5 steam particles at the shield's position.
 * Particles travel upward with slight horizontal spread.
 * @param {{ x: number, y: number }} shield - Shield entity (centre-anchored)
 * @param {Array<Object>} particles - Particle array to push into
 * @returns {void}
 */
export function emitSteamParticles(shield, particles) {
  for (let i = 0; i < 5; i++) {
    const vx   = (Math.random() - 0.5) * 40;
    const vy   = -(40 + Math.random() * 50); // -40 to -90 px/s
    const life = 0.5 + Math.random() * 0.3;  // 0.5–0.8 s
    particles.push(createParticle(shield.x, shield.y, vx, vy, life, '#bbbbcc', 2));
  }
}

/**
 * Advances all particles by one timestep. Removes dead particles from the array in-place.
 * @param {Array<{ x: number, y: number, vx: number, vy: number, life: number }>} particles
 * @param {number} dt - Fixed timestep (s)
 * @returns {void}
 */
export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx * dt;
    p.y    += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Renders all active particles. Skipped entirely when reducedMotion is true.
 * Each particle is drawn as an alpha-faded square proportional to remaining life.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ x: number, y: number, life: number, maxLife: number, color: string, size: number }>} particles
 * @param {boolean} reducedMotion - When true, particles are not rendered.
 * @returns {void}
 */
export function renderParticles(ctx, particles, reducedMotion) {
  if (reducedMotion) return;
  ctx.save();
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
