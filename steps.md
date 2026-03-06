# Constitution

/specify.constitution Space-invaders is a web game. Document all the code. The project follows an iterative development approach and KISS solutions

# Specify 1
/specify.specify
Build a Space Invaders web game called "Syndicat Galactique".

The player is a Galactic HR Manager whose job is to convince
striking aliens to go back to work by shooting job offers at them.

GAME CONCEPT:
Aliens are on strike and slowly descend holding protest signs.
The player shoots "job offers" (projectiles) to convince them to leave.

ALIENS:
- Regular aliens: convinced in 1 hit, wear casual clothes with small signs
- Hardened unionists: require 3 hits, wear suits, shake their fists
- Each alien has a visible mood indicator above their head

SPECIAL MECHANICS:
- Aliens occasionally throw "protest flyers" that slow the player on hit
- Shields are replaced by coffee pots that degrade over time
- End-of-level boss: a suited alien that negotiates in real time,
  requiring a specific sequence of hits to accept the job offer

SCORING:
- Score is called "HR Satisfaction Rate"
- Combo multiplier called "Employee Engagement Bonus"

PROGRESSION:
- 3 levels of increasing difficulty
- Each level has a unique alien theme (IT dept, Accounting, Management)

GAME OVER:
- Win message: "Galaxy is back to work. Promoted to CHRO!"
- Lose message: "General strike declared. You are fired."

VISUAL STYLE:
Retro pixel art, lofi bureaucratic background music,
aliens wear tiny suits and animated protest signs.

# Plan 1
/speckit.plan
TECHNICAL STACK:

Vanilla JS (ES6+ modules)
HTML5 Canvas for rendering
Web Audio API for sound effects and lofi music
Single HTML entry point, JS split into modules
No dependencies, no build tool, no framework
DEPLOYMENT:

Target: GitHub Pages
No build step required — static files served directly
Entry point: index.html at repository root
All paths must be relative (no absolute paths)
Assets inlined or generated via Canvas API (no external CDN)
CI/CD:

GitHub Actions workflow to auto-deploy on push to main
Workflow file: .github/workflows/deploy.yml
Uses actions/deploy-pages@v2
PROJECT STRUCTURE:
/
├── index.html # Entry point (GitHub Pages root)
├── README.md # Setup and deploy instructions
├── .github/
│ └── workflows/
│ └── deploy.yml # Auto-deploy to GitHub Pages
└── src/
├── main.js # Entry point, game loop
├── game.js # Game state management
├── canvas.js # Rendering engine
├── entities/
│ ├── player.js # HR Manager ship
│ ├── alien.js # Base alien class
│ ├── unionist.js # Hardened unionist (extends alien)
│ ├── boss.js # Negotiating boss
│ ├── projectile.js # Job offers & protest flyers
│ └── shield.js # Coffee pot shields
├── systems/
│ ├── collision.js # Collision detection
│ ├── scoring.js # HR Satisfaction Rate logic
│ └── levels.js # Level progression & alien themes
└── audio/
└── soundManager.js # Web Audio API wrapper

GAME LOOP:

requestAnimationFrame-based loop
Fixed update step, variable render step
Clear state separation: MENU / PLAYING / PAUSED / GAMEOVER
ALIEN MOOD SYSTEM:

Each alien carries a mood value (0-100)
Rendered as a small pixel bar above the alien
Decreases on hit, triggers flee animation at 0
BOSS NEGOTIATION:

Boss exposes a random sequence of 3 hit zones
Player must hit them in correct order within a time limit
Wrong order resets the sequence
LEVELS:

Level 1: IT dept — fast, low resistance aliens
Level 2: Accounting — slow, high resistance aliens
Level 3: Management — mixed, with bonus protest flyers
COLLISION DETECTION:

Simple AABB (bounding box) — KISS principle
No physics engine
RENDERING:

Pixel art sprites drawn programmatically on Canvas
No external image assets — all shapes via Canvas API
Animated protest signs via sprite frame cycling
PROGRESSIVE DIFFICULTY:

Alien speed increases per level
Flyer frequency increases per level
Boss sequence length increases per level

# Tasks 1
/speckit.tasks

# Analyze 1
/speckit.analyze

# Implement 1
/speckit.implement

# Specify 2
/speckit.specify

REBRANDING: Visual overhaul and gameplay balancing for Syndicat Galactique.

FULLSCREEN LAYOUT:

Game must fill the entire browser window at all times
Canvas resizes dynamically on window resize
No visible borders, margins or blank space around the canvas
Responsive scaling maintains aspect ratio and centers content
VISUAL THEME — "Corporate Hell Aesthetic":

Dark background with subtle scrolling cityscape skyline silhouette
Neon accent colors: toxic green, corporate blue, protest red
Scanline overlay effect for retro-corporate atmosphere
Alien protest signs display random slogans:
"MORE STARS, LESS WORK", "GRAVITY PAY GAP", "UNIONIZE THE UNIVERSE"
Player ship redesigned as a flying briefcase
Job offer projectiles rendered as tiny flying envelopes
Protest flyers rendered as spinning red pamphlets
Coffee pot shields have a steam particle effect when hit
TYPOGRAPHY:

Pixel font for all UI elements
HR jargon used throughout: "KPIs", "Synergies", "Leverage"
Score display styled as a corporate dashboard widget
GAMEPLAY BALANCING:

Reduce alien firing frequency by 40%
Add a cooldown between successive flyer attacks per alien
Boss hit zones are highlighted more clearly before sequence starts
Player gets a brief invincibility window after being hit (1.5 sec)
NEW MECHANICS:

"HR Meeting" power-up: randomly drops from defeated unionists,
freezes all aliens for 3 seconds (nobody escapes a meeting)
"Performance Review" mode: every 30 seconds, one random alien
turns red and moves faster — worth double points if hit
Combo streak system: 5 consecutive hits triggers
"Employee of the Month" visual effect (golden glow on player)
Between levels: animated "Quarterly Review" cutscene
showing HR satisfaction stats with fake corporate charts
AUDIO IMPROVEMENTS:

Distinct sound per alien type when hit
Boss fight triggers a tense elevator music theme
Power-up pickup plays a motivational jingle
Game over plays a sad trombone followed by an HR voicemail
ACCESSIBILITY:

Pause menu accessible via Escape key
Controls reminder displayed on MENU screen
Reduced motion option in pause menu
(disables parallax and particle effects)


# Plan 2
/speckit.plan


# Tasks 2
/speckit.tasks

# Implement 2
/speckit.implement