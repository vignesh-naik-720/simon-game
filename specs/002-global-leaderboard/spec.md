# Feature Specification: Global Leaderboard & EF Core Score Management

**Feature Branch**: `002-global-leaderboard`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Display a leaderboard section on the side showing existing users and their highest scores from SQLite, using EF Core and REST APIs for CRUD operations, and clarify global champion record vs personal player record."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real-Time Global Leaderboard (Priority: P1) 🎯 MVP

A player (whether logged in or playing as a guest) navigates to the game screen. Beside the classic Simon pad circle, an interactive Leaderboard sidebar displays the rankings of top players retrieved from the SQLite database. Each row displays the player's rank (🥇 1st, 🥈 2nd, 🥉 3rd, 4th...), username, highest score achieved, and timestamp of their achievement.

**Why this priority**: Directly solves the user's primary requirement of seeing all existing users' scores and ranks side-by-side with the gameplay area.

**Independent Test**: Can be tested by navigating to the home screen with multiple registered users in SQLite (e.g. User1 with score 7, User2 with score 4) and verifying the sidebar renders User1 at rank #1 with score 7, and User2 at rank #2 with score 4.

**Acceptance Scenarios**:

1. **Given** users with saved high scores in SQLite, **When** the page loads, **Then** the sidebar displays the ranked list of players sorted by `HighestScore` descending.
2. **Given** the leaderboard is loaded, **When** the player views the top entry, **Then** a distinct champion medal (Gold 🥇) is rendered next to the #1 player.
3. **Given** a user is logged in as User2, **When** looking at the leaderboard list, **Then** User2's entry is visibly highlighted with a "You" badge.

---

### User Story 2 - Real-Time Leaderboard Update on New High Score (Priority: P2)

When any authenticated player completes a game that surpasses their previous best or claims the #1 position, the game records the score to SQLite via EF Core and immediately triggers a refresh of the leaderboard sidebar, animating the updated score and rank without requiring a full browser reload.

**Why this priority**: Provides instant gratification and competitive feedback when players beat their own or their friends' high scores.

**Independent Test**: Can be tested by playing as User2 (current record 4), scoring 8 (surpassing User1's 7), completing the round, and observing that the sidebar automatically refreshes to place User2 in 1st place.

**Acceptance Scenarios**:

1. **Given** User2 scores higher than their existing record, **When** Game Over triggers and the score is saved, **Then** the leaderboard sidebar updates dynamically to reflect User2's new score and updated rank.
2. **Given** the sidebar is open, **When** the player clicks a "Refresh" icon on the leaderboard, **Then** the latest rankings are re-fetched from the API.

---

### User Story 3 - Distinct Global Champion Record vs. Personal Best in Header (Priority: P2)

The main game header clearly disambiguates between the **Global Champion Record** (the highest score achieved across all users in the SQLite database, e.g. 7) and the **Personal Best** of the currently logged-in player (e.g. 4 for User2, or 0 for a new guest).

**Why this priority**: Eliminates user confusion where playing as User2 or Guest showed an ambiguous number in the header without context.

**Independent Test**: Can be tested by logging in as User2: verify the header displays "Personal Best: 4" alongside a badge for "Global Record: 7 (User1)". When logged out as Guest, verify the header displays "Global Record: 7".

**Acceptance Scenarios**:

1. **Given** User1 holds the global record of 7 and User2 has a personal best of 4, **When** User2 is logged in, **Then** the header displays "Personal Best: 4" and "Global Record: 7".
2. **Given** an unauthenticated guest plays, **When** viewing the header, **Then** "Global Record: 7" is displayed so the guest knows the community high score target.

---

### User Story 4 - Score Management & CRUD Operations via EF Core (Priority: P3)

Players can view their personal score history in a dedicated tab within the leaderboard sidebar and delete an unwanted game session record or reset their personal score record via EF Core API endpoints.

**Why this priority**: Fulfills the user's explicit requirement for EF Core CRUD API capabilities for score records.

**Independent Test**: Can be tested by submitting a test score, viewing it in the personal history list, clicking "Delete", and verifying the record is removed from SQLite and averages recalculated.

**Acceptance Scenarios**:

1. **Given** a logged-in user with score records, **When** they view "My History" in the sidebar, **Then** a list of their past games with timestamps is displayed.
2. **Given** a user deletes a score entry, **When** confirmed, **Then** the record is deleted from SQLite via EF Core and the history view updates immediately.

---

### Edge Cases

- **Empty Database / No Scores Yet**: If SQLite contains no recorded scores, the leaderboard displays an encouraging placeholder: "No scores recorded yet. Play a game to claim 1st place!".
- **Score Ties**: When two players have identical highest scores, the player who achieved the score earlier (by timestamp) is ranked higher.
- **Narrow / Mobile Screen Layout**: On desktop, the leaderboard sits comfortably beside the Simon board in a 2-column layout. On mobile screens (<768px), the leaderboard collapses into a smooth slide-out drawer or bottom sheet accessible via a floating "🏆 Leaderboard" button.
- **Offline / Server Disconnection**: If the backend API is unreachable, the leaderboard shows a cached state with a retry button instead of a broken UI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a persistent Leaderboard sidebar on the main application interface.
- **FR-002**: System MUST retrieve and display top players ranked in descending order of `HighestScore` from the SQLite database.
- **FR-003**: System MUST display rank number, medal icons for top 3, username, highest score, and date achieved for each entry.
- **FR-004**: System MUST visibly highlight the row corresponding to the currently authenticated player.
- **FR-005**: System MUST automatically refresh the leaderboard data upon completion of any game session.
- **FR-006**: System MUST provide a manual "Refresh" button on the leaderboard panel.
- **FR-007**: System MUST display the all-time Global Champion Record distinctly in the header alongside the player's personal best.
- **FR-008**: System MUST provide backend REST endpoints using EF Core:
  - `GET /api/leaderboard`: Returns ranked players list.
  - `GET /api/leaderboard/global-best`: Returns overall top record and holder.
  - `GET /api/scores/my-history`: Returns user's past game sessions.
  - `DELETE /api/scores/{id}`: Deletes a specific game session record.
- **FR-009**: System MUST recalculate the user's `HighestScore` if their deleted score was their personal best.
- **FR-010**: System MUST adapt the layout responsively for mobile screens using a toggleable leaderboard drawer.

### Key Entities

- **LeaderboardEntry**: Representation of a ranked player (rank: int, userId: string, username: string, highestScore: int, playedAt: string, isCurrentUser: boolean).
- **GlobalRecordInfo**: Global high score overview (highestScore: int, recordHolder: string, achievedAt: string).
- **GameScoreRecord**: Individual session score (id: string, userId: string, score: int, roundsCompleted: int, durationSeconds: int, playedAt: string).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Leaderboard sidebar loads and displays rankings within 300ms of page open.
- **SC-002**: Following game completion, the leaderboard updates with the new score in under 500ms without requiring page refresh.
- **SC-003**: 100% of score rankings accurately match the underlying SQLite database records.
- **SC-004**: The responsive layout renders cleanly on both desktop (>1024px) and mobile (<768px) viewports with zero horizontal scrolling.
- **SC-005**: Users can clearly identify the global best record versus their personal best score within 3 seconds of viewing the screen.

## Assumptions

- SQLite remains the persistence engine using Entity Framework Core 10.
- Top leaderboard view displays up to the top 20 players.
- Guest players cannot delete scores, but can view the public global leaderboard.

