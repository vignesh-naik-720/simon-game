# Feature Specification: Core Simon Game Loop with User Profiles & Score Tracking

**Feature Branch**: `001-core-game-loop`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "Core Simon Game Loop (4 colored pads, sequence generation, audio-visual playback, player input validation, round progression, difficulty timing curves, and game over) + Lightweight SQLite database to store user details for simple login, save game score with timestamp, and display player's highest record on UI upon login."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Game & Initial Sequence (Priority: P1)

A player starts a new session of Simon. The game presents the classic 4-pad interface (Green, Red, Yellow, Blue). Upon initiating the game, Round 1 begins: the system generates a single random pad step, illuminates that pad, and plays its corresponding audio tone. The player repeats the pattern by selecting the highlighted pad. The system validates the input, awards positive feedback, increments the score, and advances to the next round.

**Why this priority**: This represents the foundational Minimum Viable Product (MVP). Without the ability to start a round, present an audio-visual cue, and accept player confirmation, no gameplay is possible.

**Independent Test**: Can be fully tested by loading the game, pressing "Start Game", observing a single light and sound cue, tapping the corresponding pad, and verifying that the score increments and Round 2 begins.

**Acceptance Scenarios**:

1. **Given** the player is at the start screen with an initial score of 0, **When** the player presses "Start Game", **Then** the game transitions to an active state and plays a 1-step sequence with matching audio and visual highlights.
2. **Given** the game just demonstrated the Green pad in Round 1, **When** the player activates the Green pad within the time limit, **Then** the pad flashes and sounds, the score increments to 1, and the game advances to Round 2.

---

### User Story 2 - Progressive Sequence Playback & Difficulty Scaling (Priority: P2)

As the player successfully matches sequences in consecutive rounds (Round 2 onwards), the game retains the previously established sequence and appends one new random color step at each new round. The system replays the entire accumulated sequence from start to finish before returning control to the player. To maintain escalating challenge, playback duration per step and intervals between steps progressively accelerate at predetermined round milestones.

**Why this priority**: Progressive sequence accumulation and escalating speed form the core cognitive challenge and replay value of Simon.

**Independent Test**: Can be tested across multiple rounds by observing that each subsequent round extends the sequence by exactly one step while the interval between playback cues decreases according to difficulty milestones.

**Acceptance Scenarios**:

1. **Given** the player successfully completed Round 4, **When** Round 5 begins, **Then** the game plays back the 4 previous steps in identical order followed by 1 newly generated 5th step.
2. **Given** the game reaches designated speed milestones (e.g., Round 6 and Round 14), **When** sequence playback occurs, **Then** step illumination and tone durations are measurably faster than in earlier rounds.
3. **Given** the game is actively demonstrating a sequence, **When** the player attempts to tap any pad, **Then** input is suppressed to prevent input collisions during demonstration.

---

### User Story 3 - Player Authentication & Highest Record Display (Priority: P2)

A player navigates to the game and logs in using simple credentials (username and password) or registers a new account. Upon successful authentication, the main UI displays the player's username and their all-time highest score record. If the player is new with no prior games, their highest record displays as 0.

**Why this priority**: Personal progression and persistent identity motivate players to return, track their improvement, and prepare for competitive scoring.

**Independent Test**: Can be tested by logging in as an existing user with known game history, verifying that the home UI immediately displays the user's name and highest recorded score.

**Acceptance Scenarios**:

1. **Given** an existing player with a personal best score of 12, **When** they log in with valid credentials, **Then** the game UI displays their username and "Highest Record: 12".
2. **Given** a new player registering for the first time, **When** the account is created, **Then** the player is automatically logged in and their UI displays "Highest Record: 0".
3. **Given** invalid credentials submitted during login, **When** authentication fails, **Then** a clear error message is shown and the game remains in guest/unauthenticated state.

---

### User Story 4 - Session Score Recording & Personal Best Updates (Priority: P2)

When a game session ends (via mistake or timeout), the system durably records the session outcome—including the player ID, final score, rounds completed, and completion timestamp. If the achieved score exceeds the player's previous all-time highest record, the system updates the player's record in the database and immediately updates the displayed record on the UI with a high-score notification.

**Why this priority**: Provides permanent accountability for achievements and guarantees that player effort is never lost across sessions.

**Independent Test**: Can be tested by completing a game session that beats the previous high score, verifying the database record contains the score and timestamp, and checking that the UI reflects the new record.

**Acceptance Scenarios**:

1. **Given** a logged-in player whose current record is 8 finishes a game with score 14, **When** Game Over triggers, **Then** a new game score record is saved with the current timestamp, and the UI highest record updates to 14 with a high-score banner.
2. **Given** a logged-in player finishes a game with score 5 (below their record of 10), **When** Game Over triggers, **Then** the score and timestamp are saved to history, but the displayed highest record remains 10.

---

### User Story 5 - Error Detection & Game Over (Priority: P3)

When a player selects an incorrect pad during sequence repetition or fails to select any pad before the turn timer expires, the game immediately flags a mistake. The system plays a distinct error sound and error visual animation, terminates the active round, displays the final score and total rounds completed, and provides an option to restart the game.

**Why this priority**: Closes the gameplay loop by establishing clear win/lose conditions, feedback for mistakes, and an immediate restart mechanism.

**Independent Test**: Can be tested by deliberately pressing an incorrect pad or letting the turn timer expire, verifying immediate error feedback, game termination, and accurate final score display.

**Acceptance Scenarios**:

1. **Given** the sequence expects Yellow as the next input, **When** the player presses Blue, **Then** the system immediately triggers the error audio tone and error visual cue, and displays the Game Over screen with the player's final score.
2. **Given** the player is in an active turn, **When** no pad is activated within 5 seconds of the previous action, **Then** the system registers a timeout error and transitions to Game Over.
3. **Given** the Game Over screen is displayed, **When** the player activates "Play Again", **Then** the game state completely resets and a fresh Round 1 begins.

---

### User Story 6 - Pause and Resume Session (Priority: P4)

During an active round while awaiting player input, the player can pause the game session. Pausing suspends active countdown timers and locks the interface. When unpaused, the game resumes with the exact remaining turn duration.

**Why this priority**: Essential convenience feature preventing unfair game over situations caused by external interruptions.

**Independent Test**: Can be tested by triggering pause mid-round, waiting for a duration longer than the turn timeout, and resuming to verify gameplay continues without premature timeout.

**Acceptance Scenarios**:

1. **Given** the player is awaiting input with 3 seconds remaining on the timer, **When** the player triggers "Pause", **Then** the timer freezes and pad inputs are suspended.
2. **Given** the game is paused, **When** the player triggers "Resume", **Then** the session resumes with 3 seconds remaining on the timer.

---

### Edge Cases

- **Guest / Unauthenticated Gameplay**: Players MUST be able to play without logging in. Scores in guest mode are tracked locally for the session, with an option to register/log in at Game Over to save the score to a persistent account.
- **Simultaneous / Rapid Multi-Input**: If a player triggers multiple pads at the same millisecond or double-taps rapidly, the system MUST process the first registered input atomically and evaluate it before considering subsequent touches, preventing race conditions or corrupted sequence indexing.
- **Input During Playback Phase**: Any input submitted while the sequence is being demonstrated to the player MUST be discarded without penalizing the player.
- **Application Blur / Backgrounding**: If the game application loses focus or transitions to background during an active turn, the game MUST automatically pause to prevent accidental turn timeouts.
- **High-Round Ceiling**: For extended games (Round 30+), playback speed MUST enforce a minimum step duration floor (e.g., 180ms tone + 50ms pause) so steps remain perceivable and audio synthesis does not clip.
- **Boundary Turn Expiration**: An input registered at the exact boundary of timer expiration (within standard input debounce) MUST be credited in favor of the player.
- **Database / Connection Interruption**: If persistent score recording encounters an error or network drop, the score MUST be stored in local resilient storage and synchronized once the connection recovers, ensuring no player high score is lost.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide four distinct, interactive color pads: Green, Red, Yellow, and Blue.
- **FR-002**: System MUST associate each color pad with a distinct audio pitch/tone and a distinct visual illumination state.
- **FR-003**: System MUST randomly generate an initial 1-step sequence upon starting a new game session.
- **FR-004**: System MUST append exactly one newly generated random step to the sequence upon each successful round completion.
- **FR-005**: System MUST play back the accumulated sequence with synchronized audio-visual cues at the start of each round.
- **FR-006**: System MUST suppress and ignore player input while sequence playback is in progress.
- **FR-007**: System MUST validate player inputs in strict sequential order against the current round's target sequence.
- **FR-008**: System MUST provide immediate audio and visual activation feedback whenever the player touches an active pad.
- **FR-009**: System MUST advance to the next round and award score progression immediately when the full sequence is successfully reproduced.
- **FR-010**: System MUST accelerate sequence playback speeds at predefined round milestones, maintaining a defined minimum duration floor.
- **FR-011**: System MUST enforce an input inactivity timer (5 seconds) between player inputs during their turn.
- **FR-012**: System MUST terminate the game and display Game Over upon either an incorrect pad input or turn timer expiration.
- **FR-013**: System MUST display the final score and total rounds completed on the Game Over screen.
- **FR-014**: System MUST allow the player to restart a new game session immediately from the Game Over screen.
- **FR-015**: System MUST support pausing and resuming an active game session without loss of round progress or remaining timer duration.
- **FR-016**: System MUST provide simple player registration and login using username and credentials.
- **FR-017**: System MUST persist user account profiles and credentials securely in a persistent database.
- **FR-018**: System MUST record each completed game session with the player ID, final score, rounds reached, and ISO completion timestamp.
- **FR-019**: System MUST maintain and update each player's all-time highest score record.
- **FR-020**: System MUST display the authenticated player's username and all-time highest score prominently on the game UI immediately upon login and on the main game dashboard.
- **FR-021**: System MUST update the displayed highest record immediately when a player surpasses their previous best score during a game session.

### Key Entities

- **UserAccount**: Represents an individual player. Attributes: unique user identifier, username, credential token/hash, created timestamp, and all-time highest score.
- **GameScoreRecord**: Represents a completed game session record. Attributes: record identifier, associated user identifier, score achieved, rounds completed, and completion timestamp.
- **GameSession**: The primary runtime entity encapsulating an active game playthrough. Attributes: session identifier, current state (`Idle`, `Demonstrating`, `PlayerTurn`, `Paused`, `GameOver`), current round number, accumulated score, and session duration.
- **PadDefinition**: Represents one of the four color pads. Attributes: pad identifier (`Green`, `Red`, `Yellow`, `Blue`), nominal color, active highlight color, tone frequency identifier, and accessibility label.
- **Sequence**: An ordered collection of `SequenceStep` items defining the target pattern to be reproduced by the player in the active round.
- **TurnTracker**: Manages the player's active input sequence. Attributes: current expected step index, remaining turn time, and input validation status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can start a new game and experience the initial demonstration step within 1 second of selecting "Start Game".
- **SC-002**: Audio tone and visual illumination trigger simultaneously with less than 50ms perceptual latency upon pad activation.
- **SC-003**: 100% of player input selections are evaluated accurately against the target sequence with zero false positives or false negatives.
- **SC-004**: Sequence playback speed progression scales smoothly across rounds, never dropping below the 180ms perceptibility floor regardless of how high the round number climbs.
- **SC-005**: Greater than 95% of new players are able to understand the core game rules and successfully complete Round 1 on their first attempt without external instructions.
- **SC-006**: Game session state transitions (Pause, Resume, Game Over, Restart) complete deterministically with zero state desynchronization.
- **SC-007**: Upon successful login, the player's profile and highest score record are retrieved and displayed on the UI in under 300ms.
- **SC-008**: 100% of completed game sessions for logged-in players are recorded to persistent storage with valid timestamps and accurate scores.
- **SC-009**: When a player achieves a new personal high score, the UI highest record indicator updates with zero refresh delay upon round completion.

## Assumptions

- Standard classic Simon rules apply: four color pads, one step added per round, single mistake results in Game Over.
- The default player inactivity timeout is 5 seconds per step.
- Audio synthesis generates unique harmonic frequencies for each pad (e.g., traditional frequencies: Green = 415 Hz, Red = 310 Hz, Yellow = 252 Hz, Blue = 209 Hz, Error = 42 Hz) to support accessibility for players with color vision deficiency.
- Scoring is directly proportional to rounds completed (1 point per correct round completed).
- Persistent storage for user credentials, scores, and timestamps uses a lightweight SQLite database managed by the backend service.
- Simple authentication focuses on straightforward username/password credentials suitable for arcade play.
- Guest play is supported without forcing immediate registration, but saving permanent score history requires an account.
