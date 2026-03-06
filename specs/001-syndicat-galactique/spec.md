# Feature Specification: Syndicat Galactique – Space Invaders Web Game

**Feature Branch**: `001-syndicat-galactique`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Build a Space Invaders web game called 'Syndicat Galactique'. The player is a Galactic HR Manager whose job is to convince striking aliens to go back to work by shooting job offers at them."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Core Gameplay Loop (Priority: P1)

A player opens the game in their browser, sees the title screen, starts a new game, and controls the HR Manager character at the bottom of the screen. Waves of striking aliens descend from the top, holding protest signs. The player fires job offers upward to hit aliens, clearing waves to progress.

**Why this priority**: This is the foundational gameplay loop. Without it, no other feature has context. Delivering this alone constitutes a playable game.

**Independent Test**: Can be tested by launching the game, beginning a match, and verifying that the player can move, shoot, and clear a single wave of regular aliens.

**Acceptance Scenarios**:

1. **Given** the game is loaded, **When** the player presses Start, **Then** the game field appears with the HR Manager ship at the bottom and a grid of aliens descending from the top.
2. **Given** the game is running, **When** the player moves left or right, **Then** the HR Manager moves accordingly within screen bounds.
3. **Given** the game is running, **When** the player fires a job offer, **Then** a projectile travels upward and disappears on hitting an alien or the top boundary.
4. **Given** a regular alien is struck once by a job offer, **When** the hit registers, **Then** the alien is removed from the grid and the HR Satisfaction Rate score increases.
5. **Given** all aliens in a wave are cleared, **Then** the next wave or level begins.

---

### User Story 2 – Alien Variety and Mood Indicators (Priority: P2)

Players encounter two alien types: casual Regular Aliens (1 hit to convince) and Hardened Unionists in suits (3 hits to convince). Each alien displays a visible mood indicator above its head that updates as it takes hits, giving the player real-time feedback.

**Why this priority**: Alien variety creates strategic depth and visual storytelling. Can be implemented as an enhancement on top of the basic game loop and tested in isolation.

**Independent Test**: Can be tested by starting a wave that includes both alien types, confirming hit counts and mood indicator updates without requiring progression or bosses.

**Acceptance Scenarios**:

1. **Given** a wave contains Regular Aliens, **When** a job offer hits one, **Then** it is immediately removed and the mood indicator shows "Convinced".
2. **Given** a wave contains Hardened Unionists, **When** a job offer hits one for the first time, **Then** its mood indicator changes to reflect reduced resistance (e.g., from angry to cautious) but the alien remains.
3. **Given** a Hardened Unionist has been hit twice, **When** it is hit a third time, **Then** it is removed and the score increases.
4. **Given** any alien is on-screen, **Then** a visible mood indicator is displayed above it at all times.

---

### User Story 3 – Alien Counter-Mechanics (Priority: P2)

Aliens periodically throw protest flyers downward at the player. If a flyer hits the HR Manager, the player's movement speed is temporarily reduced (slowed). Coffee pot shields in front of the player degrade over time and from flyer impacts, providing partial protection.

**Why this priority**: These mechanics add defense and hazard layers that increase engagement. They are independently testable without requiring boss or level completion logic.

**Independent Test**: Can be tested by observing alien flyer projectiles, confirming the slow debuff applies on hit, and verifying that coffee pot shields absorb hits and visually degrade.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** an alien fires a protest flyer, **Then** the flyer travels downward toward the player character.
2. **Given** a protest flyer reaches the player, **When** it hits the HR Manager, **Then** the player's movement speed is visibly reduced for a fixed duration.
3. **Given** coffee pot shields are in place, **When** a protest flyer hits a shield, **Then** the shield absorbs the hit and shows visual degradation.
4. **Given** a shield has absorbed enough damage, **When** its degradation threshold is reached, **Then** it is destroyed and removed.
5. **Given** shields degrade over time, **When** time passes even without hits, **Then** shields visually degrade.

---

### User Story 4 – Level Progression and Alien Themes (Priority: P2)

The game has 3 levels of increasing difficulty. Each level has a distinct alien theme: Level 1 is the IT Department, Level 2 is Accounting, and Level 3 is Management. Aliens move faster and in larger numbers as levels increase.

**Why this priority**: Progression gives the game a narrative arc and replay value. It is testable as a standalone flow after the core loop is in place.

**Independent Test**: Can be tested by completing Level 1 and verifying that Level 2 loads with the Accounting theme, different visuals, and increased difficulty.

**Acceptance Scenarios**:

1. **Given** a player clears all aliens in Level 1 (IT Department), **Then** a level-complete screen shows and Level 2 (Accounting) begins.
2. **Given** Level 2 begins, **Then** alien sprites and/or signs reflect the Accounting theme (e.g., holding budget spreadsheets, wearing accountant attire).
3. **Given** Level 3 begins, **Then** the Management theme is applied and alien movement speed and/or formation size is greater than in Level 2.
4. **Given** increasing level number, **Then** aliens descend faster and/or there are more enemies per wave.

---

### User Story 5 – End-of-Level Boss: The Negotiator (Priority: P3)

At the end of a level, a special Boss alien (a suited executive) appears and "negotiates in real time". The player must hit the boss in a specific sequence to win the negotiation. Random or incorrect hit sequences do not complete the boss fight.

**Why this priority**: The boss is the narrative climax of each level. It is self-contained and can be tested independently from regular alien waves.

**Independent Test**: Can be tested by triggering a boss encounter and verifying that only the correct hit sequence defeats the boss while incorrect sequences do not.

**Acceptance Scenarios**:

1. **Given** all regular aliens in a level are cleared, **When** the boss phase begins, **Then** a distinct Boss Alien appears with a visual indicator showing the required hit sequence.
2. **Given** the boss is active, **When** the player delivers hits in the correct order, **Then** each correct hit is acknowledged and the sequence progresses.
3. **Given** the correct full sequence is completed, **Then** the boss is defeated and the level ends.
4. **Given** the player delivers an incorrect hit, **Then** the hit sequence resets or a penalty is applied (e.g., partial reset), and the boss does not disappear.
5. **Given** the boss is active, **Then** it continues descending and may fire its own projectiles.

---

### User Story 6 – Scoring System (Priority: P2)

The player's score is displayed as "HR Satisfaction Rate". Consecutive hits without being struck build an "Employee Engagement Bonus" combo multiplier that increases the point value of each subsequent alien convinced.

**Why this priority**: Scoring is table-stakes for the arcade genre and provides feedback loops. Testable without boss or progression logic.

**Independent Test**: Can be tested by hitting several aliens in a row and confirming the combo multiplier activates and the score reflects the multiplier.

**Acceptance Scenarios**:

1. **Given** the player convinces an alien, **Then** the HR Satisfaction Rate score increases by a base amount.
2. **Given** the player convinces multiple aliens consecutively without being hit, **Then** the Employee Engagement Bonus multiplier increments.
3. **Given** the Employee Engagement Bonus is active, **Then** score gains are multiplied by its current value.
4. **Given** the player is hit by a protest flyer, **Then** the Employee Engagement Bonus resets to its base value.
5. **Given** the game is running, **Then** the current HR Satisfaction Rate and Employee Engagement Bonus are displayed on-screen at all times.

---

### User Story 7 – Win and Lose States (Priority: P1)

The game ends in either a win or loss. Winning all 3 levels displays a win screen with the message "Galaxy is back to work. Promoted to CHRO!". Losing (aliens reach the player or the player loses all lives) displays "General strike declared. You are fired."

**Why this priority**: End states are essential to completing the game loop. Testable independently by forcing win/loss conditions.

**Independent Test**: Can be tested by clearing all 3 levels or allowing aliens to descend past the boundary, and confirming the correct end-screen appears.

**Acceptance Scenarios**:

1. **Given** the player clears all 3 levels including each boss, **When** the final level is completed, **Then** a win screen appears with the message "Galaxy is back to work. Promoted to CHRO!"
2. **Given** an alien wave descends past the player boundary, **Then** a loss screen appears with "General strike declared. You are fired."
3. **Given** the player loses all lives, **Then** a loss screen appears with "General strike declared. You are fired."
4. **Given** either end screen is shown, **Then** the player can choose to restart the game.

---

### User Story 8 – Visual Style and Audio (Priority: P3)

The game is rendered in retro pixel art. Aliens wear tiny suits and carry animated protest signs. Background music has a lofi bureaucratic aesthetic. The overall presentation reinforces the comedic HR/workplace narrative.

**Why this priority**: Visual and audio polish enhance the experience but the game is playable without them. These are the last items refined before release.

**Independent Test**: Can be tested by launching the game and observing alien sprites, backgrounds, and confirming background music plays.

**Acceptance Scenarios**:

1. **Given** the game starts, **Then** aliens are rendered as pixel art characters wearing small suits.
2. **Given** a Hardened Unionist alien is on-screen, **Then** it is visually distinct from Regular Aliens (e.g., larger, angrier expression, shaking fist animation).
3. **Given** the game is running, **Then** aliens display animated protest signs.
4. **Given** the game is running, **Then** lofi background music plays in a loop and can be muted by the player.
5. **Given** Level 1 is playing, **Then** the background reflects an IT department aesthetic; Level 2 an accounting office; Level 3 a corporate boardroom.

---

### Edge Cases

- What happens when the player fires while a job offer is already in flight? (Should allow multiple simultaneous projectiles or enforce a cooldown)
- What happens if the boss fight timer elapses without the player completing the sequence? (Boss descends further or triggers a penalty)
- What happens if all coffee pot shields are destroyed simultaneously? (Player has no cover and must rely on evasion)
- What happens if a protest flyer hits a demolished shield position? (Flyer passes through and can hit the player)
- What happens if the player attempts to move off-screen? (Movement is clamped to screen boundaries)
- What happens if the player pauses mid-combo? (Combo timer, if any, should be paused with the game)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST run entirely in a web browser without requiring installation or server-side processing.
- **FR-002**: The player MUST be able to move the HR Manager character left and right within horizontal screen bounds.
- **FR-003**: The player MUST be able to fire job offer projectiles upward toward aliens.
- **FR-004**: Regular Aliens MUST be removed from play after a single hit by a job offer.
- **FR-005**: Hardened Unionist Aliens MUST require exactly 3 hits before being removed from play.
- **FR-006**: Each alien MUST display a visible mood indicator above its head that reflects its current hit state.
- **FR-007**: Aliens MUST periodically fire protest flyer projectiles downward toward the player.
- **FR-008**: A protest flyer hitting the HR Manager MUST apply a temporary movement speed reduction (slow debuff) for a defined duration.
- **FR-009**: Coffee pot shields MUST absorb incoming protest flyers and degrade visually with each hit received.
- **FR-010**: Coffee pot shields MUST also degrade visually over time independent of hits.
- **FR-011**: When a coffee pot shield's durability is exhausted, it MUST be destroyed and removed.
- **FR-012**: The game MUST include exactly 3 levels: IT Department (Level 1), Accounting (Level 2), and Management (Level 3).
- **FR-013**: Each level MUST have visually distinct alien sprites and/or protest signs matching its departmental theme.
- **FR-014**: Alien movement speed and/or wave density MUST increase with each successive level.
- **FR-015**: At the end of each level, a Boss Alien MUST appear before the level is considered complete.
- **FR-016**: The Boss Alien MUST require the player to hit it in a specific sequence; incorrect hits MUST NOT defeat the boss.
- **FR-017**: The player's score MUST be labeled "HR Satisfaction Rate" and displayed prominently during play.
- **FR-018**: Consecutive alien hits without the player being struck MUST activate and increment an "Employee Engagement Bonus" multiplier.
- **FR-019**: Being hit by a protest flyer MUST reset the Employee Engagement Bonus multiplier.
- **FR-020**: Clearing all 3 levels MUST display the win message: "Galaxy is back to work. Promoted to CHRO!"
- **FR-021**: Losing all lives or allowing aliens to breach the player boundary MUST display: "General strike declared. You are fired."
- **FR-022**: End screens MUST offer the player an option to restart the game.
- **FR-023**: The game MUST render in retro pixel art style with aliens wearing animated tiny suits and protest signs.
- **FR-024**: Lofi background music MUST play throughout gameplay with a mute/unmute option accessible to the player.
- **FR-025**: Hardened Unionist Aliens MUST display an animated fist-shaking or visual trait distinct from Regular Aliens.

### Key Entities

- **HR Manager**: The player character. Has position, number of lives, current movement speed (affected by slow debuff), and current job offer cooldown state.
- **Regular Alien**: A grid enemy requiring 1 hit to convince. Has a departmental theme variant, a mood indicator, a position, and a movement state.
- **Hardened Unionist**: A grid enemy requiring 3 hits to convince. Has the same attributes as a Regular Alien plus a hit counter (0–3) and a fist-shaking animation state.
- **Boss Alien**: A level-end unique enemy. Has a required hit sequence, a current sequence progress state, a position, and a movement/attack pattern.
- **Job Offer (Projectile)**: A player-fired upward projectile. Has a position and an active/inactive state.
- **Protest Flyer (Projectile)**: An alien-fired downward projectile. Has a position, source alien reference, and an active/inactive state.
- **Coffee Pot Shield**: A defensive object. Has a position, a durability/degradation level (multiple stages), and a destroyed flag.
- **Level**: Contains the alien formation blueprint, boss configuration, departmental theme assets, and difficulty parameters.
- **Score (HR Satisfaction Rate)**: Tracks points earned during the session, with the current Employee Engagement Bonus multiplier.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can understand the core game objective and begin playing within 30 seconds of the game loading, without reading external documentation.
- **SC-002**: The game runs smoothly on a standard laptop browser, maintaining consistent motion with no perceptible stuttering or input lag during normal gameplay.
- **SC-003**: All 3 levels are completable from start to finish in a single session, with a full playthrough taking between 10 and 20 minutes at intended difficulty.
- **SC-004**: The hit sequence mechanic for the boss is discoverable; 80% of players attempting the boss for the second time succeed in completing the correct sequence.
- **SC-005**: The slow debuff from protest flyers is noticeable and meaningful—players can identify the moment they are slowed and adjust strategy accordingly.
- **SC-006**: The Employee Engagement Bonus multiplier visibly increases score output; players can observe the difference in point gain between hitting with and without an active combo.
- **SC-007**: Both win and loss end states are reached during normal play, and each displays the correct thematic message without error.
- **SC-008**: The game is fully playable with keyboard controls alone, requiring no mouse input for core gameplay actions.
- **SC-009**: Background music contributes to the comedic bureaucratic atmosphere; the mute option works reliably and persists across level transitions.
- **SC-010**: The game correctly tracks and displays the HR Satisfaction Rate at all times, including during boss encounters and level transitions.

---

## Assumptions

- The game is a single-player, browser-based experience with no multiplayer or leaderboard requirements in this version.
- Standard keyboard controls are used (arrow keys or WASD for movement, spacebar to fire); gamepad support is out of scope.
- The boss hit sequence is visually communicated in-game (e.g., through a sequence indicator) rather than requiring external reference.
- Each level has a fixed number of alien waves before the boss appears; procedural generation is out of scope.
- Lives/continues follow a classic arcade convention (e.g., 3 lives); the exact number is a tuning decision for implementation.
- The slow debuff from protest flyers has a fixed duration (e.g., 2–3 seconds); it does not stack from multiple simultaneous hits.
- High score persistence across sessions is considered out of scope for this feature; scores reset on page refresh.
- Audio assets (lofi music and sound effects) are assumed to be obtainable under appropriate licenses or created for the project.
- The pixel art assets for all three department themes are assumed to be created as part of this feature's delivery.
