# Feature Specification: Syndicat Galactique — Visual Overhaul & Gameplay Balancing

**Feature Branch**: `001-rebrand-visual-overhaul`  
**Created**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "REBRANDING: Visual overhaul and gameplay balancing for Syndicat Galactique."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fullscreen Immersive Layout (Priority: P1)

A player opens the game in their browser and the game canvas immediately fills the entire window with no borders, margins, or dead space. When the player resizes the browser window — including going fullscreen — the game scales instantly to fill the new dimensions while keeping all content proportional and centered.

**Why this priority**: Without a proper fullscreen layout the entire visual theme is undermined. This is foundational to every other visual improvement and must work before anything else.

**Independent Test**: Can be fully tested by opening the game at various window sizes and resizing the browser window, confirming no blank space, borders, or distortion appears at any resolution.

**Acceptance Scenarios**:

1. **Given** the browser window is any size, **When** the game loads, **Then** the canvas fills the full viewport with no visible gaps or borders.
2. **Given** the game is running, **When** the user resizes the browser window, **Then** the canvas adjusts within one frame to fill the new dimensions.
3. **Given** the game is running, **When** the canvas is resized, **Then** all game content (player, aliens, UI) remains fully visible, correctly scaled, and centered.

---

### User Story 2 - Corporate Hell Visual Theme (Priority: P1)

A player starts a game session and immediately recognises the "Corporate Hell" aesthetic: a dark background with a scrolling silhouetted cityscape, neon accent colours (toxic green, corporate blue, protest red), a subtle scanline overlay, and satirical protest signs held by alien characters. The player's ship looks like a flying briefcase, projectiles are tiny envelopes, enemy flyers are spinning red pamphlets, and coffee pot shields emit visible steam particles when struck.

**Why this priority**: The visual rebrand is the headline feature of this release. All individual art and atmosphere elements form a cohesive identity that needs to be perceived together to be meaningful.

**Independent Test**: Can be fully tested by playing through at least one wave and confirming every visual element (background, overlays, sprites, signs, particles) renders correctly in a single play session.

**Acceptance Scenarios**:

1. **Given** a game session starts, **When** the main game screen renders, **Then** a dark background with a scrolling silhouette cityscape skyline is visible.
2. **Given** the game is rendering, **When** the player observes the UI and game elements, **Then** neon accent colours (toxic green, corporate blue, protest red) are consistently applied.
3. **Given** the game screen is active, **When** the player observes it, **Then** a scanline overlay effect is visible across the full canvas.
4. **Given** aliens are present on the screen, **When** the player looks at them, **Then** each alien displays a readable protest sign with a satirical HR slogan (e.g., "MORE STARS, LESS WORK", "GRAVITY PAY GAP", "UNIONIZE THE UNIVERSE").
5. **Given** the game is running, **When** the player observes their ship and projectiles, **Then** the player ship appears as a flying briefcase and outgoing projectiles appear as miniature flying envelopes.
6. **Given** an alien fires at the player, **When** the projectile is visible, **Then** it appears as a spinning red pamphlet.
7. **Given** a coffee pot shield exists and is struck by a projectile, **When** the hit lands, **Then** a steam particle effect is visible emanating from the shield.

---

### User Story 3 - Corporate Typography & UI Skin (Priority: P2)

A player reads all on-screen text (score, lives, level, menus) and sees it rendered in a pixel font. The score is displayed as a styled corporate dashboard widget, and UI copy uses HR jargon ("KPIs", "Synergies", "Leverage") rather than generic gaming vocabulary.

**Why this priority**: Typography and UI copy reinforce the satirical identity. They can be developed independently of sprite artwork and do not block other stories.

**Independent Test**: Can be fully tested on the main menu, HUD during gameplay, and the game over screen without needing gameplay events.

**Acceptance Scenarios**:

1. **Given** any screen is displayed, **When** the player reads text on screen, **Then** all text is rendered in a pixel-style font.
2. **Given** gameplay is active, **When** the score area is visible, **Then** it is styled to resemble a corporate dashboard widget rather than plain text.
3. **Given** menus and HUD are displayed, **When** the player reads labels, **Then** HR jargon terms appear in appropriate places throughout the UI.

---

### User Story 4 - Gameplay Balancing for Fairness (Priority: P2)

A player finds the game noticeably fairer: aliens fire less frequently, the player briefly cannot be hurt again immediately after taking a hit, and the boss's targetable hit zones are highlighted clearly before the attack sequence begins.

**Why this priority**: Balancing directly affects player retention and perceived polish. It is self-contained and testable without any visual changes being complete.

**Independent Test**: Can be fully tested by playing a full game session and measuring alien fire rate, confirming the post-hit grace period, and observing boss hit zone highlighting.

**Acceptance Scenarios**:

1. **Given** aliens are firing, **When** the player counts projectile launches over a timed period, **Then** the firing frequency is approximately 40% lower than the pre-update baseline.
2. **Given** one alien has recently fired a flyer, **When** time passes, **Then** that same alien observes a cooldown before it can fire again.
3. **Given** the player's ship has just been hit, **When** the next 1.5 seconds pass, **Then** the player cannot receive additional damage and a visual cue confirms the invincibility window.
4. **Given** a boss encounter begins, **When** the attack sequence is about to start, **Then** the boss's hit zones are illuminated or highlighted in a clearly visible way before the sequence opens.

---

### User Story 5 - New Gameplay Mechanics (Priority: P2)

A player experiences three new interactive mechanics: (a) collecting an "HR Meeting" power-up that temporarily freezes all aliens; (b) noticing a "Performance Review" alien that turns red, moves faster, and is worth double points; (c) achieving a 5-hit combo streak that triggers an "Employee of the Month" golden glow on the player ship; and (d) watching an animated "Quarterly Review" cutscene between levels.

**Why this priority**: These mechanics add replayability and strategic depth. Each one is individually testable and delivers standalone value.

**Independent Test**: Each mechanic (power-up, performance review alien, combo streak, cutscene) can be tested independently by triggering its specific condition and observing the expected outcome.

**Acceptance Scenarios**:

1. **Given** a unionist alien is defeated, **When** the drop chance is met, **Then** an "HR Meeting" power-up item appears and can be collected by the player.
2. **Given** the player collects the "HR Meeting" power-up, **When** it activates, **Then** all aliens freeze in place for 3 seconds before resuming normal movement.
3. **Given** 30 seconds have elapsed in a game wave, **When** the interval triggers, **Then** one randomly selected alien turns visually red and moves at an increased speed.
4. **Given** a red "Performance Review" alien is destroyed, **When** the score is awarded, **Then** the player receives double the normal point value for that alien.
5. **Given** the player has scored 5 consecutive hits without missing, **When** the 5th consecutive hit is registered, **Then** the player ship displays a golden glow visual effect ("Employee of the Month").
6. **Given** a level is completed, **When** the inter-level transition begins, **Then** an animated "Quarterly Review" cutscene is shown displaying fake corporate satisfaction charts and HR stats before the next level starts.

---

### User Story 6 - Audio Improvements (Priority: P3)

A player hears contextually distinct audio throughout their session: each alien type makes a different sound when destroyed, boss fights play a tense elevator music track, picking up a power-up plays a motivational jingle, and game over plays a sad trombone followed by an HR voicemail clip.

**Why this priority**: Audio enriches atmosphere and provides feedback cues, but has no impact on core gameplay. It can be developed and tested fully independently of visuals and mechanics.

**Independent Test**: Can be fully tested by triggering each audio event (hit each alien type, reach a boss, collect a power-up, lose the game) and confirming the correct distinct sound plays each time.

**Acceptance Scenarios**:

1. **Given** different alien types exist, **When** any alien is destroyed, **Then** the sound played corresponds to that alien's type (each type has a unique sound).
2. **Given** a boss encounter begins, **When** the boss phase activates, **Then** the background music transitions to an elevator-music-style theme.
3. **Given** a power-up is collected, **When** the collection event fires, **Then** a motivational jingle plays.
4. **Given** the player's last life is lost, **When** the game over state triggers, **Then** a sad trombone sound plays followed by an HR voicemail audio clip.

---

### User Story 7 - Accessibility Controls & Reduced Motion (Priority: P3)

A player can press Escape at any point during gameplay to open a pause menu. The main menu displays a controls reference. Players who prefer reduced motion can toggle off parallax scrolling and particle effects from within the pause menu.

**Why this priority**: Accessibility options broaden the audience and are testable in isolation without dependency on other visual features.

**Independent Test**: Can be fully tested on the menu screen (controls reminder) and during a game session (Escape key, reduced motion toggle) without needing any other story to be complete.

**Acceptance Scenarios**:

1. **Given** gameplay is active, **When** the player presses the Escape key, **Then** a pause menu appears and the game halts.
2. **Given** the main menu is displayed, **When** the player views the screen, **Then** a visible controls reference panel is present showing all playable inputs.
3. **Given** the pause menu is open, **When** the player activates the "Reduced Motion" toggle, **Then** all parallax background scrolling and particle effects are disabled for the remainder of the session.
4. **Given** reduced motion is active, **When** the player resumes gameplay, **Then** the game runs normally with all animations present except parallax and particles.

---

### Edge Cases

- What happens when the browser window is resized to an extreme aspect ratio (very wide or very tall)? Content should remain fully visible with letterboxing or pillarboxing rather than clipping.
- How does the "Performance Review" alien mechanic interact if the 30-second interval fires again before the previous red alien is destroyed? Only one Performance Review alien should be active at a time; the interval should not apply while one is already active.
- What happens if the player is in the invincibility window and a projectile hits at the exact moment the window expires? The invincibility window takes precedence for its full 1.5 seconds.
- What happens if the "HR Meeting" power-up is collected during a boss fight? The freeze effect applies to the boss as well, for player clarity and consistency.
- What happens to the combo streak counter if the player misses a shot? The streak resets to zero immediately.
- What happens if the player toggles reduced motion mid-game via the pause menu? The change applies the moment the game is resumed, not retroactively to in-flight particles.
- What happens if no unionist aliens remain in a wave? The HR Meeting power-up simply cannot drop in that wave; no error state occurs.

## Requirements *(mandatory)*

### Functional Requirements

**Layout & Scaling**

- **FR-001**: The game canvas MUST fill the entire browser viewport with no margins, borders, or blank space visible at any window size.
- **FR-002**: The canvas MUST resize dynamically and immediately whenever the browser window dimensions change.
- **FR-003**: All game content MUST maintain its proportional aspect ratio and remain fully visible during any resize event, with centering applied when the viewport aspect ratio differs from the game's native ratio.

**Visual Theme**

- **FR-004**: The game background MUST display a dark base with a continuously scrolling silhouette cityscape skyline layer.
- **FR-005**: All game UI, sprites, and effects MUST use a palette anchored to neon toxic green, corporate blue, and protest red as accent colours.
- **FR-006**: A scanline overlay effect MUST be rendered across the full canvas at all times during gameplay (unless reduced motion is enabled).
- **FR-007**: Each alien MUST display a protest sign with one of the defined satirical HR slogans; slogans MUST be assigned randomly per alien instance.
- **FR-008**: The player's ship sprite MUST be visually redesigned as a flying briefcase.
- **FR-009**: Player projectiles MUST be rendered as miniature flying envelopes.
- **FR-010**: Enemy projectiles (protest flyers) MUST be rendered as spinning red pamphlets.
- **FR-011**: Coffee pot shields MUST emit a visible steam particle effect at the point of impact when struck.

**Typography & UI**

- **FR-012**: All on-screen text MUST be rendered using a pixel-style font.
- **FR-013**: The score display area MUST be styled to resemble a corporate dashboard widget.
- **FR-014**: UI copy throughout menus and HUD MUST incorporate HR jargon terms (e.g., "KPIs", "Synergies", "Leverage") where contextually appropriate.

**Gameplay Balancing**

- **FR-015**: Alien projectile firing frequency MUST be reduced by approximately 40% compared to the pre-update baseline.
- **FR-016**: Each individual alien MUST observe a minimum cooldown period between successive projectile launches.
- **FR-017**: After the player's ship is hit, the player MUST be granted an invincibility window of 1.5 seconds during which no further damage can be received.
- **FR-018**: During the player's invincibility window, a visual cue MUST be displayed on the player's ship to signal the invincibility state.
- **FR-019**: At the start of a boss attack sequence, the boss's targetable hit zones MUST be visually highlighted before the sequence opens to player interaction.

**New Mechanics**

- **FR-020**: Defeated unionist aliens MUST have a configurable chance of dropping an "HR Meeting" power-up item.
- **FR-021**: When collected, the "HR Meeting" power-up MUST freeze all active aliens (including bosses) for exactly 3 seconds.
- **FR-022**: Every 30 seconds of active gameplay within a wave, one randomly selected alien MUST become a "Performance Review" alien: visually turning red and moving at an increased speed.
- **FR-023**: Only one Performance Review alien MUST be active at any given time; a new interval MUST NOT create a second one while one is already active.
- **FR-024**: Destroying a Performance Review alien MUST award double the standard point value for that alien type.
- **FR-025**: After 5 consecutive hits without a miss, the player's ship MUST display an "Employee of the Month" golden glow effect for a visible duration.
- **FR-026**: The combo streak counter MUST reset to zero immediately upon any missed shot.
- **FR-027**: Upon completing a level, an animated "Quarterly Review" inter-level cutscene MUST play, showing fake corporate satisfaction charts and HR statistics before the next level begins.
- **FR-028**: The "Quarterly Review" cutscene MUST be skippable by player input to avoid blocking experienced players.

**Audio**

- **FR-029**: Each distinct alien type MUST trigger a unique sound effect upon destruction.
- **FR-030**: When a boss phase becomes active, the background music MUST transition to an elevator-music-style theme for the duration of the boss encounter.
- **FR-031**: Collecting any power-up MUST trigger a motivational jingle audio cue.
- **FR-032**: Upon game over, a sad trombone sound MUST play, followed sequentially by an HR voicemail audio clip.

**Accessibility**

- **FR-033**: Pressing the Escape key during active gameplay MUST open a pause menu and halt all game simulation.
- **FR-034**: The main menu screen MUST display a visible controls reference showing all player inputs.
- **FR-035**: The pause menu MUST include a "Reduced Motion" toggle option.
- **FR-036**: When "Reduced Motion" is enabled, all parallax background scrolling and all particle effects MUST be disabled until the option is toggled off.

### Key Entities

- **Power-up Item**: A collectible object that drops from defeated unionist aliens; carries a type identifier ("HR Meeting") and an activation effect definition.
- **Performance Review Alien**: A temporary state applied to a standard alien; carries attributes for visual state (red), movement speed multiplier, and point value multiplier (×2).
- **Combo Streak Counter**: A per-life counter that tracks consecutive hits; resets to zero on any miss or on life loss.
- **Invincibility Window**: A timed state applied to the player after being hit; carries a remaining duration (1.5 s) and a visual indicator flag.
- **Reduced Motion Preference**: A session-scoped boolean that controls parallax and particle system activation; configurable from the pause menu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can open the game at any tested browser window size and observe a fully canvas-filled layout with no visual dead space within the first second of loading.
- **SC-002**: All seven distinct visual theme elements (scrolling cityscape, neon palette, scanlines, protest signs, briefcase ship, envelope projectiles, pamphlet flyers) are simultaneously observable in a single gameplay session without additional configuration.
- **SC-003**: Players experience at least one of each new mechanic event (HR Meeting power-up freeze, Performance Review alien, Employee of the Month glow, Quarterly Review cutscene) within a complete run of three levels.
- **SC-004**: Post-balancing, measurable player survival time on the first wave increases compared to the pre-update baseline, reflecting reduced alien aggression.
- **SC-005**: Players who enable "Reduced Motion" observe zero parallax or particle visual events for the remainder of that session, verifiable by visual inspection.
- **SC-006**: All four audio improvement events (alien-type-specific hit sounds, boss music, power-up jingle, game over sequence) play correctly and are distinguishable from one another in a single playthrough.
- **SC-007**: The Escape key pause menu is reachable from any point during active gameplay within one key press, with no additional navigation required.

## Assumptions

- The pre-update alien firing frequency serves as the measurable baseline for the ~40% reduction (FR-015); exact values will be determined during planning.
- "Approximately 40%" permits minor tuning tolerance (±5%) during implementation without requiring a spec revision.
- The drop probability for the HR Meeting power-up follows the existing drop-rate mechanism; the exact probability will be determined during planning based on playtesting.
- The "Quarterly Review" cutscene is assumed to be skippable via a key press (FR-028), consistent with genre conventions for inter-level transitions.
- The pixel font is assumed to be a bundled asset; font sourcing and licensing are an implementation concern.
- "Corporate dashboard widget" styling for the score is interpreted as a bordered panel with a label header in the neon colour palette; exact layout is an implementation detail.
- Audio clips (sad trombone, HR voicemail, motivational jingle) are assumed to be original or royalty-free assets; sourcing is an implementation concern.
- The invincibility window visual cue is assumed to be a flashing effect on the player ship sprite, consistent with genre conventions.
- Letterboxing/pillarboxing (FR-003) is the assumed fallback for extreme aspect ratios; full-bleed cropping is not acceptable as it would hide game content.
