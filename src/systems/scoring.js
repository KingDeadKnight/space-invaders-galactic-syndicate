/**
 * @module scoring
 * @description HR Satisfaction Rate (score) and Employee Engagement Bonus (combo multiplier).
 */

/** Maximum combo multiplier cap. */
const MAX_MULTIPLIER = 8;

/**
 * Number of consecutive hits required to trigger Employee of the Month glow.
 * @type {number}
 */
export const EMPLOYEE_OF_MONTH_THRESHOLD = 5;

/** Base points per entity type before multiplier. */
const POINTS = {
  regular:  10,
  unionist: 30,
  boss:     500,
};

/**
 * Creates an initial Score object.
 * @returns {{ points: number, comboMultiplier: number, consecutiveHits: number }}
 */
export function createScore() {
  return {
    points: 0,
    comboMultiplier: 1,
    consecutiveHits: 0,
  };
}

/**
 * Adds points for a convinced alien or boss defeat. Also increments the combo counter.
 * @param {{ points: number, comboMultiplier: number, consecutiveHits: number }} score
 * @param {'regular'|'unionist'|'boss'} entityType - Determines base point value.
 * @param {number} [multiplier=1.0] - Optional points multiplier (e.g. 2.0 for Performance Review alien).
 * @returns {void}
 */
export function addPoints(score, entityType, multiplier = 1.0) {
  const base = POINTS[entityType] ?? POINTS.regular;
  score.points += base * score.comboMultiplier * multiplier;
  score.consecutiveHits += 1;
  score.comboMultiplier = Math.min(
    MAX_MULTIPLIER,
    1 + Math.floor(score.consecutiveHits / 5)
  );
}

/**
 * Resets the combo counter and multiplier to 1 (on player hit).
 * @param {{ comboMultiplier: number, consecutiveHits: number }} score
 * @returns {void}
 */
export function resetCombo(score) {
  score.consecutiveHits = 0;
  score.comboMultiplier = 1;
}

/**
 * Returns the current combo multiplier (pure, no mutation).
 * @param {{ comboMultiplier: number }} score
 * @returns {number}
 */
export function getComboMultiplier(score) {
  return score.comboMultiplier;
}
