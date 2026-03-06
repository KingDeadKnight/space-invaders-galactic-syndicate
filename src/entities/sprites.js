/**
 * @module sprites
 * @description All pixel-art sprite definitions for Syndicat Galactique.
 * Each sprite entry has `frames` (array of 2D color arrays), `width`, `height` (in pixels at 1× scale), and `fps`.
 * Colors are hex strings; `null` = transparent pixel.
 * Rendered with: ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
 */

// ── Colour Palette ────────────────────────────────────────────
// Player
const PC  = '#3af5ff'; // cyan hull
const PW  = '#ffffff'; // white
const PD  = '#1a5fa0'; // dark blue
const PG  = '#ffcc00'; // gold
const PR  = '#ff3333'; // red accent

// IT Alien
const IC  = '#55ccff'; // cyan (IT)
const IS  = '#888caa'; // suit grey
const IW  = '#ffffff';
const IB  = '#333355'; // dark body

// Accounting Alien
const AC  = '#55dd88'; // green (Accounting)
const AS  = '#888c88'; // suit grey-green
const AW  = '#ffffff';
const AB  = '#224422'; // dark body

// Management Alien
const MC  = '#cc88ff'; // purple (Management)
const MS  = '#555588'; // suit slate
const MW  = '#ffffff';
const MB  = '#221133'; // dark body

// Unionist
const UF  = '#ff5500'; // fist orange
const US_ = '#dd3300'; // dark fist

// Boss
const BC  = '#ffd700'; // gold tie
const BD  = '#1a1a3a'; // dark suit
const BW  = '#ffffff';
const BS  = '#aaaacc'; // suit medium
const BR  = '#ff2222'; // red flash

// Shield (coffee pot)
const SHB = '#8b4513'; // brown
const SHL = '#d2996a'; // light tan
const SHW = '#ffffff';
const SHC = '#33aaff'; // steam blue

// Job offer (envelope)
const JO  = '#ffffaa'; // parchment
const JOB = '#cc9900'; // gold border
const JOG = '#00ff88'; // green glow

// Flyer (paper — red pamphlet)
const FW  = '#ffbbbb'; // red-tinted paper
const FL  = '#ff2222'; // red ink
const FD  = '#882222'; // dark edge

// Briefcase (player)
const BFK = '#1a1200'; // dark outline
const BFL = '#7a5c00'; // body leather
const BFM = '#c49100'; // highlight leather
const BFH = '#ffd700'; // gold hardware

// White envelope (job offer)
const EW  = '#ffffff'; // white body
const EB  = '#bbbbff'; // border
const EV  = '#5555cc'; // flap V

// ── Helper ────────────────────────────────────────────────────
const _ = null; // transparent

// ── Sprite Definitions ────────────────────────────────────────

/** Player (HR Manager) 15×10 logical pixels — corporate briefcase silhouette */
const playerFrame0 = [
  [_,   _,   _,   _,   _,   _,   BFH, BFH, BFH, _,   _,   _,   _,   _,   _ ],
  [_,   _,   _,   _,   _,   BFK, BFL, BFL, BFL, BFK, _,   _,   _,   _,   _ ],
  [BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK],
  [BFK, BFM, BFM, BFM, BFM, BFM, BFH, BFH, BFH, BFM, BFM, BFM, BFM, BFM, BFK],
  [BFK, BFM, BFL, BFL, BFL, BFL, BFH, BFH, BFH, BFL, BFL, BFL, BFL, BFM, BFK],
  [BFK, BFK, BFK, BFK, BFK, BFK, BFH, BFH, BFH, BFK, BFK, BFK, BFK, BFK, BFK],
  [BFK, BFM, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFM, BFK],
  [BFK, BFM, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFM, BFK],
  [BFK, BFM, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFL, BFM, BFK],
  [BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK, BFK],
];

/** IT Alien regular frame 0 (protest sign: laptop) 8×7 */
const itAlienFrame0 = [
  [_,  IS,  IS,  IC,  IC,  IS,  IS,  _ ],
  [IS,  IW,  IC,  IC,  IC,  IC,  IW,  IS ],
  [IS,  IC,  IB,  IC,  IC,  IB,  IC,  IS ],
  [IS,  IC,  IC,  IC,  IC,  IC,  IC,  IS ],
  [_,  IS,  IS,  IS,  IS,  IS,  IS,  _ ],
  [_,  IS,  IW,  IW,  IW,  IW,  IS,  _ ],
  [_,  IC,  IC,  IC,  IC,  IC,  IC,  _ ],
];

/** IT Alien regular frame 1 (sign up) */
const itAlienFrame1 = [
  [_,  IS,  IS,  IC,  IC,  IS,  IS,  _ ],
  [IS,  IW,  IC,  IC,  IC,  IC,  IW,  IS ],
  [IS,  IC,  IB,  IC,  IC,  IB,  IC,  IS ],
  [IS,  IC,  IC,  IC,  IC,  IC,  IC,  IS ],
  [_,  IS,  IS,  IS,  IS,  IS,  IS,  _ ],
  [_,  IW,  IW,  IW,  IW,  IW,  IW,  _ ],
  [_,  IC,  IC,  IC,  IC,  IC,  IC,  _ ],
];

/** Accounting Alien regular frame 0 (spreadsheet sign) */
const accountingAlienFrame0 = [
  [_,  AS,  AS,  AC,  AC,  AS,  AS,  _ ],
  [AS,  AW,  AC,  AC,  AC,  AC,  AW,  AS ],
  [AS,  AC,  AB,  AC,  AC,  AB,  AC,  AS ],
  [AS,  AC,  AC,  AC,  AC,  AC,  AC,  AS ],
  [_,  AS,  AS,  AS,  AS,  AS,  AS,  _ ],
  [_,  AS,  AW,  AW,  AW,  AW,  AS,  _ ],
  [_,  AC,  AC,  AC,  AC,  AC,  AC,  _ ],
];

/** Accounting Alien regular frame 1 */
const accountingAlienFrame1 = [
  [_,  AS,  AS,  AC,  AC,  AS,  AS,  _ ],
  [AS,  AW,  AC,  AC,  AC,  AC,  AW,  AS ],
  [AS,  AC,  AB,  AC,  AC,  AB,  AC,  AS ],
  [AS,  AC,  AC,  AC,  AC,  AC,  AC,  AS ],
  [_,  AS,  AS,  AS,  AS,  AS,  AS,  _ ],
  [_,  AW,  AW,  AW,  AW,  AW,  AW,  _ ],
  [_,  AC,  AC,  AC,  AC,  AC,  AC,  _ ],
];

/** Management Alien regular frame 0 (org-chart pointer) */
const managementAlienFrame0 = [
  [_,  MS,  MS,  MC,  MC,  MS,  MS,  _ ],
  [MS,  MW,  MC,  MC,  MC,  MC,  MW,  MS ],
  [MS,  MC,  MB,  MC,  MC,  MB,  MC,  MS ],
  [MS,  MC,  MC,  MC,  MC,  MC,  MC,  MS ],
  [_,  MS,  MS,  MS,  MS,  MS,  MS,  _ ],
  [_,  MS,  MW,  MW,  MW,  MW,  MS,  _ ],
  [_,  MC,  MC,  MC,  MC,  MC,  MC,  _ ],
];

/** Management Alien regular frame 1 */
const managementAlienFrame1 = [
  [_,  MS,  MS,  MC,  MC,  MS,  MS,  _ ],
  [MS,  MW,  MC,  MC,  MC,  MC,  MW,  MS ],
  [MS,  MC,  MB,  MC,  MC,  MB,  MC,  MS ],
  [MS,  MC,  MC,  MC,  MC,  MC,  MC,  MS ],
  [_,  MS,  MS,  MS,  MS,  MS,  MS,  _ ],
  [_,  MW,  MW,  MW,  MW,  MW,  MW,  _ ],
  [_,  MC,  MC,  MC,  MC,  MC,  MC,  _ ],
];

/**
 * Unionist — bigger (9 wide × 9 tall), distinct fist pose, per theme
 */
const unionistBaseFrame0 = (body, suit, white, dark) => [
  [_,   _,   suit, suit, body, suit, suit, _,   _ ],
  [_,   suit, white, body, body, body, white, suit, _ ],
  [suit, body, dark, body, body, dark, body, body, suit],
  [suit, body, body, body, body, body, body, body, suit],
  [_,   suit, suit, suit, suit, suit, suit, suit, _ ],
  [_,   suit, white, white, white, white, suit, _,   _ ],
  [_,   body, suit, body, body, suit, body, _,   _ ],
  [_,   body, _,   _,   _,   _,   body, _,   _ ],
  [_,   suit, _,   _,   _,   _,   suit, _,   _ ],
];

const unionistBaseFrame1 = (body, suit, white, dark) => [
  [_,   _,   suit, suit, body, suit, suit, _,   _ ],
  [_,   suit, white, body, body, body, white, suit, _ ],
  [suit, body, dark, body, body, dark, body, body, suit],
  [suit, body, body, body, body, body, body, body, suit],
  [_,   suit, suit, suit, suit, suit, suit, suit, _ ],
  [_,   white, white, white, white, white, white, _,   _ ],
  [_,   body, suit, body, body, suit, body, _,   _ ],
  [_,   body, _,   _,   _,   _,   body, _,   _ ],
  [_,   suit, _,   _,   _,   _,   suit, _,   _ ],
];

const fistShakeFrame = (body, suit, white, dark) => [
  [_,   suit, _,   suit, body, suit, _,   suit, _ ],
  [_,   suit, white, body, body, body, white, suit, _ ],
  [suit, body, dark, body, body, dark, body, body, suit],
  [suit, body, body, body, body, body, body, body, suit],
  [_,   suit, suit, suit, suit, suit, suit, suit, _ ],
  [_,   UF,  UF,  white, white, UF,  UF,  _,   _ ],
  [UF,  US_,  UF,  body, body, UF,  US_,  UF,  _ ],
  [_,   UF,  _,   _,   _,   _,   UF,  _,   _ ],
  [_,   _,   _,   _,   _,   _,   _,   _,   _ ],
];

/** Boss (The Negotiator) — 14×12 */
const bossFrame0 = [
  [_,   _,   _,   BD,  BD,  BD,  BD,  BD,  BD,  _,   _,   _,   _,   _ ],
  [_,   _,   BD,  BS,  BS,  BC,  BC,  BS,  BS,  BD,  _,   _,   _,   _ ],
  [_,   BD,  BS,  BW,  BS,  BC,  BC,  BS,  BW,  BS,  BD,  _,   _,   _ ],
  [BD,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _ ],
  [BD,  BS,  BW,  BD,  BS,  BS,  BS,  BS,  BD,  BW,  BS,  BD,  _,   _ ],
  [BD,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _ ],
  [_,   BD,  BD,  BS,  BS,  BD,  BD,  BS,  BS,  BD,  BD,  _,   _,   _ ],
  [_,   _,   BD,  BD,  BC,  BC,  BC,  BC,  BD,  BD,  _,   _,   _,   _ ],
  [_,   _,   BD,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _,   _,   _ ],
  [_,   BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  _,   _,   _ ],
  [_,   _,   BD,  _,   BD,  BD,  BD,  BD,  _,   BD,  _,   _,   _,   _ ],
  [_,   _,   BD,  _,   BD,  _,   _,   BD,  _,   BD,  _,   _,   _,   _ ],
];

const bossFrame1 = [
  [_,   _,   _,   BD,  BD,  BD,  BD,  BD,  BD,  _,   _,   _,   _,   _ ],
  [_,   _,   BD,  BS,  BS,  BC,  BC,  BS,  BS,  BD,  _,   _,   _,   _ ],
  [_,   BD,  BS,  BW,  BS,  BC,  BC,  BS,  BW,  BS,  BD,  _,   _,   _ ],
  [BD,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _ ],
  [BD,  BS,  BW,  BD,  BS,  BS,  BS,  BS,  BD,  BW,  BS,  BD,  _,   _ ],
  [BD,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _ ],
  [_,   BD,  BD,  BS,  BD,  BD,  BD,  BD,  BD,  BS,  BD,  _,   _,   _ ],
  [_,   _,   BD,  BD,  BC,  BC,  BC,  BC,  BD,  BD,  _,   _,   _,   _ ],
  [_,   _,   BD,  BS,  BS,  BS,  BS,  BS,  BS,  BD,  _,   _,   _,   _ ],
  [_,   BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  BD,  _,   _,   _ ],
  [_,   _,   BD,  _,   BD,  BD,  BD,  BD,  _,   BD,  _,   _,   _,   _ ],
  [_,   _,   BD,  _,   BD,  _,   _,   BD,  _,   BD,  _,   _,   _,   _ ],
];

/** Shield (coffee pot) degradation stages  — 10×8 */
const makeShield = (cracks) => {
  // Base coffee pot shape
  const base = [
    [_,   _,   SHL, SHL, SHL, SHL, SHL, _,   _,   _ ],
    [_,   SHB, SHL, SHW, SHW, SHW, SHL, SHB, _,   _ ],
    [_,   SHB, SHL, SHW, SHC, SHW, SHL, SHB, SHB, _ ],
    [_,   SHB, SHB, SHB, SHB, SHB, SHB, SHB, SHB, _ ],
    [_,   SHB, SHL, SHL, SHL, SHL, SHL, SHB, _,   _ ],
    [_,   SHB, SHB, SHB, SHB, SHB, SHB, SHB, _,   _ ],
    [_,   _,   SHB, SHB, SHB, SHB, SHB, _,   _,   _ ],
    [_,   _,   _,   SHB, SHB, SHB, _,   _,   _,   _ ],
  ];
  const frame = base.map(row => [...row]);
  // Apply cracks based on stage
  if (cracks >= 1) { frame[2][3] = '#555'; frame[3][5] = '#555'; }
  if (cracks >= 2) { frame[1][5] = '#555'; frame[4][3] = '#555'; }
  if (cracks >= 3) { frame[2][4] = '#333'; frame[3][3] = '#333'; frame[4][2] = '#555'; }
  return frame;
};

/** Job Offer (white envelope) — 4×6 */
const jobOfferFrame0 = [
  [EB, EB, EB, EB],
  [EB, EV, EV, EB],
  [EB, EW, EW, EB],
  [EB, EW, EW, EB],
  [EB, EW, EW, EB],
  [EB, EB, EB, EB],
];

const jobOfferFrame1 = [
  [EB, EB, EB, EB],
  [EB, EW, EW, EB],
  [EV, EW, EW, EV],
  [EB, EW, EW, EB],
  [EB, EW, EW, EB],
  [EB, EB, EB, EB],
];

/** Protest Flyer (paper) — 4×5 */
const flyerFrame0 = [
  [FD,  FW,  FW,  FD  ],
  [FW,  FL,  FL,  FW  ],
  [FW,  FL,  FW,  FW  ],
  [FW,  FL,  FL,  FW  ],
  [FD,  FW,  FW,  FD  ],
];

/**
 * @typedef {{ frames: Array<Array<Array<string|null>>>, width: number, height: number, fps: number }} SpriteSheet
 */

/**
 * All sprite definitions, keyed by entity type.
 * Access pattern examples:
 *   SPRITES.player.frames[0]
 *   SPRITES.alien.it.regular.frames[frameIndex]
 *   SPRITES.alien.it.unionist.frames[frameIndex]
 *   SPRITES.boss.frames[frameIndex]
 *   SPRITES.shield[stageIndex]
 *   SPRITES.jobOffer.frames[frameIndex]
 *   SPRITES.flyer.frames[0]
 */
export const SPRITES = {
  /** @type {SpriteSheet} */
  player: {
    frames: [playerFrame0],
    width: 15,
    height: 10,
    fps: 2,
  },

  alien: {
    it: {
      regular:  { frames: [itAlienFrame0, itAlienFrame1], width: 8, height: 7, fps: 4 },
      unionist: {
        frames: [
          unionistBaseFrame0(IC, IS, IW, IB),
          unionistBaseFrame1(IC, IS, IW, IB),
          fistShakeFrame(IC, IS, IW, IB),
        ],
        width: 9, height: 9, fps: 4,
      },
    },
    accounting: {
      regular:  { frames: [accountingAlienFrame0, accountingAlienFrame1], width: 8, height: 7, fps: 4 },
      unionist: {
        frames: [
          unionistBaseFrame0(AC, AS, AW, AB),
          unionistBaseFrame1(AC, AS, AW, AB),
          fistShakeFrame(AC, AS, AW, AB),
        ],
        width: 9, height: 9, fps: 4,
      },
    },
    management: {
      regular:  { frames: [managementAlienFrame0, managementAlienFrame1], width: 8, height: 7, fps: 4 },
      unionist: {
        frames: [
          unionistBaseFrame0(MC, MS, MW, MB),
          unionistBaseFrame1(MC, MS, MW, MB),
          fistShakeFrame(MC, MS, MW, MB),
        ],
        width: 9, height: 9, fps: 4,
      },
    },
  },

  boss: {
    frames: [bossFrame0, bossFrame1],
    width: 14,
    height: 12,
    fps: 3,
  },

  /**
   * Shield degradation stages indexed by durability (4=full, 0=destroyed).
   * Access: SPRITES.shield[shield.durability]
   * @type {Array<Array<Array<string|null>>>}
   */
  shield: [
    makeShield(0), // stage 0: heavily damaged (should not be rendered; durability=0 → inactive)
    makeShield(3), // stage 1: badly cracked (durability=1)
    makeShield(2), // stage 2: half cracked (durability=2)
    makeShield(1), // stage 3: first crack  (durability=3)
    makeShield(0), // stage 4: full (durability=4)
  ],

  jobOffer: {
    frames: [jobOfferFrame0, jobOfferFrame1],
    width: 4,
    height: 6,
    fps: 8,
  },

  flyer: {
    frames: [flyerFrame0],
    width: 4,
    height: 5,
    fps: 4,
  },
};

/**
 * Draws a sprite frame at the given canvas position.
 * The position (cx, cy) is the centre of the sprite.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Array<string|null>>} frame - 2D array of hex color strings or null
 * @param {number} cx - Canvas x centre
 * @param {number} cy - Canvas y centre
 * @param {number} scale - Pixels per sprite pixel (typically PIXEL_SCALE = 3)
 */
export function drawFrame(ctx, frame, cx, cy, scale) {
  const rows = frame.length;
  const cols = frame[0].length;
  const ox = cx - (cols * scale) / 2;
  const oy = cy - (rows * scale) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = frame[r][c];
      if (color !== null) {
        ctx.fillStyle = color;
        ctx.fillRect(ox + c * scale, oy + r * scale, scale, scale);
      }
    }
  }
}
