/**
 * @module collision
 * @description AABB collision detection and full-game collision processor.
 * All entity positions are centre-anchored.
 */

import { hitAlien }        from '../entities/alien.js';
import { hitUnionist }     from '../entities/unionist.js';
import { hitBoss }         from '../entities/boss.js';
import { damageShield }    from '../entities/shield.js';
import { applySlowDebuff } from '../entities/player.js';
import { addPoints, resetCombo } from './scoring.js';
import { emitSteamParticles }   from './particles.js';
import { INVINCIBILITY_DURATION, POWERUP_DROP_CHANCE, HR_FREEZE_DURATION } from '../game.js';
import { createPowerup }   from '../entities/powerup.js';

/**
 * Returns true if two centre-anchored axis-aligned bounding boxes overlap.
 * @param {{ x: number, y: number, width: number, height: number }} a
 * @param {{ x: number, y: number, width: number, height: number }} b
 * @returns {boolean}
 */
export function checkAABB(a, b) {
  const aLeft   = a.x - a.width  / 2;
  const aRight  = a.x + a.width  / 2;
  const aTop    = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft   = b.x - b.width  / 2;
  const bRight  = b.x + b.width  / 2;
  const bTop    = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

/**
 * Runs all game collision checks for the current frame. Mutates state in-place.
 * Deactivated entities (active = false) are filtered from their arrays at the end.
 *
 * Check order:
 *  1. Job offer vs alien (regular or unionist)
 *  2. Job offer vs boss (zone-sequence hit)
 *  3. Flyer vs shield
 *  4. Flyer vs player
 *  5. Alien vs bottom boundary → game over
 *
 * @param {{ player: Object, aliens: Object[], boss: Object|null, projectiles: Object[], shields: Object[], score: Object, level: number, levelPhase: string, canvasHeight: number }} state
 * @param {Object} audioManager - AudioManager handle for SFX playback.
 * @returns {void}
 */
export function processCollisions(state, audioManager) {
  const { player, aliens, projectiles, shields, score } = state;
  const canvasHeight = state.canvasHeight ?? 640;

  for (const proj of projectiles) {
    if (!proj.active) continue;

    if (proj.owner === 'player') {
      // ── Job offer vs boss (zone-sequence hit) ─────────────────
      if (state.levelPhase === 'BOSS' && state.boss && state.boss.active) {
        const boss = state.boss;
        if (checkAABB(proj, boss)) {
          // Determine which of the 3 horizontal zones the projectile hit
          const bossLeft  = boss.x - boss.width / 2;
          const zoneW     = boss.width / 3;
          const zoneIndex = Math.floor((proj.x - bossLeft) / zoneW);
          const clampedZone = Math.max(0, Math.min(2, zoneIndex));

          const result = hitBoss(boss, clampedZone);
          proj.active  = false;

          if (result === 'correct') {
            if (audioManager) audioManager.playSFX('bossCorrect');
          } else if (result === 'wrong') {
            if (audioManager) audioManager.playSFX('bossWrong');
            resetCombo(score);
          } else if (result === 'defeated') {
            addPoints(score, 'boss');
            if (audioManager) audioManager.playSFX('bossDefeated');
          }
          continue;
        }
      }

      // ── Job offer vs alien ─────────────────────────────────────
      if (state.levelPhase === 'WAVE') {
        for (const alien of aliens) {
          if (!alien.active) continue;
          if (checkAABB(proj, alien)) {
            proj.active = false;
            let remaining;
            if (alien.type === 'unionist') {
              remaining = hitUnionist(alien);
              if (audioManager) audioManager.playSFX(remaining === 0 ? 'convince' : 'hit');
              if (remaining === 0) {
                addPoints(score, 'unionist', alien.pointsMultiplier ?? 1.0);
                if (audioManager) audioManager.playAlienDestroyed?.('unionist');
                // Power-up drop chance
                if (Math.random() < POWERUP_DROP_CHANCE) {
                  if (!state.powerups) state.powerups = [];
                  state.powerups.push(createPowerup(alien.x, alien.y, 'hr-meeting'));
                }
              }
            } else {
              remaining = hitAlien(alien);
              if (audioManager) audioManager.playSFX(remaining === 0 ? 'convince' : 'hit');
              if (remaining === 0) {
                addPoints(score, 'regular', alien.pointsMultiplier ?? 1.0);
                if (audioManager) audioManager.playAlienDestroyed?.(alien.theme ?? 'it');
              }
            }
            break;
          }
        }
      }

    } else {
      // ── Flyer vs shield ────────────────────────────────────────
      let hitShield = false;
      for (const shield of shields) {
        if (!shield.active) continue;
        if (checkAABB(proj, shield)) {
          damageShield(shield);          emitSteamParticles(shield, state.particles ?? []);          proj.active = false;
          hitShield = true;
          break;
        }
      }
      if (hitShield) continue;

      // ── Flyer vs player ────────────────────────────────────────
      if (player.active && checkAABB(proj, player)) {
        proj.active = false; // always consume the projectile
        // Skip damage if player is in invincibility window
        if (player.invincibilityTimer && player.invincibilityTimer > 0) continue;
        applySlowDebuff(player);
        resetCombo(score);
        if (audioManager) audioManager.playSFX('playerHit');
        // Direct flyer hit costs a life and triggers invincibility
        player.lives -= 1;
        player.invincibilityTimer = INVINCIBILITY_DURATION;
        if (player.lives <= 0) {
          player.active = false;
          state.phase = 'GAMEOVER';
          if (audioManager) audioManager.playSFX('gameOver');
        }
      }
    }
  }

  // ── Power-up pickup ───────────────────────────────────────────
  if (state.powerups && state.powerups.length > 0) {
    for (const powerup of state.powerups) {
      if (!powerup.active) continue;
      if (player.active && checkAABB(powerup, player)) {
        powerup.active       = false;
        state.hrFreezeTimer  = HR_FREEZE_DURATION;
        if (audioManager) audioManager.playJingle?.();
      }
    }
    state.powerups = state.powerups.filter(p => p.active);
  }

  // ── Alien vs bottom boundary → game over ──────────────────────
  for (const alien of aliens) {
    if (!alien.active) continue;
    if (alien.y + alien.height / 2 >= canvasHeight - 48) {
      state.phase = 'GAMEOVER';
      if (audioManager) audioManager.playSFX('gameOver');
      return;
    }
  }

  // ── Filter deactivated entities ───────────────────────────────
  state.projectiles = projectiles.filter(p => p.active);
  state.aliens      = aliens.filter(a => a.active);
  state.shields     = shields.filter(s => s.active);
}
