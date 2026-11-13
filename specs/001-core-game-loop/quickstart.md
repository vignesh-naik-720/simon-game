# Quickstart Validation Guide: Core Simon Game Loop with User Profiles & SQLite

**Feature**: `001-core-game-loop`
**Date**: 2026-11-12
**Status**: Ready

This guide outlines runnable scenarios to validate the Simon Game client, .NET 10 Minimal API backend, SQLite persistence, and decoupled game engine.

---

## Prerequisites

- **Client Runtime**: Node.js 20+ (LTS) & npm / pnpm
- **Backend Runtime**: .NET 10 SDK (or Docker 24+)
- **Docker Compose**: (Optional, for containerized backend execution)

---

## 1. Setup & Environment Initialization

### 1.1 Backend Setup (.NET 10 + SQLite)

```bash
# Navigate to backend directory
cd backend

# Restore dependencies and build solution
dotnet restore
dotnet build

# Apply SQLite database migrations (creates simon.db in /data or local directory)
dotnet ef database update

# Run backend service (listens on http://localhost:5000)
dotnet run --project src/Simon.Api
```

*Alternatively, run via Docker Compose:*
```bash
docker compose up --build -d backend
```

### 1.2 Client Setup (React Native / Web)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start web development server
npm run web
```

---

## 2. Validation Scenarios

### Scenario 1: Execute Automated Unit & Domain Test Suites

Proves Constitution Principle I (Decoupled Game Engine) and Principle IV (Strict Quality Gates).

```bash
# 1. Run Client Game Engine unit tests
cd client
npm test

# Expected Outcome:
# - All state machine transitions (START_GAME, INPUT_PAD, TIMEOUT, PAUSE) pass
# - Purity and determinism verified with fixed sequence seeds
# - Minimum 180ms speed floor test passes

# 2. Run Backend .NET tests
cd backend
dotnet test

# Expected Outcome:
# - Auth validation tests pass (username rules, password hashing)
# - SQLite integration tests execute against in-memory SQLite and pass
# - Score persistence and HighestScore recalculation logic passes
```

---

### Scenario 2: Validate User Registration & Login Contract

Proves User Story 3 (Player Authentication & Highest Record Display) against [contracts/openapi.json](file:///c:/Users/VigneshVijayNaik/OneDrive%20-%20McLaren%20Strategic%20Solutions%20US%20Inc/Desktop/simon-game/specs/001-core-game-loop/contracts/openapi.json).

```bash
# Register a test player
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"arcade_ace","password":"SecretPassword123!"}'

# Expected Response (HTTP 201 Created):
# {
#   "token": "<JWT_TOKEN>",
#   "user": {
#     "id": "<UUID>",
#     "username": "arcade_ace",
#     "highestScore": 0,
#     "createdAt": "..."
#   }
# }

# Login with registered credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"arcade_ace","password":"SecretPassword123!"}'

# Expected Response (HTTP 200 OK):
# Returns valid JWT token and user profile showing highestScore: 0
```

---

### Scenario 3: Validate Score Recording & Personal Best Escalation

Proves User Story 4 (Session Score Recording & Personal Best Updates).

```bash
# Submit a score session with score 14
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "score": 14,
    "roundsCompleted": 14,
    "durationSeconds": 48,
    "playedAt": "2026-11-12T10:15:30Z"
  }'

# Expected Response (HTTP 201 Created):
# {
#   "scoreId": "<UUID>",
#   "isNewHighest": true,
#   "highestScore": 14
# }

# Query user profile to verify highestScore persisted in SQLite
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Expected Response:
# "highestScore": 14
```

---

### Scenario 4: End-to-End Game Playthrough on Web

Proves User Stories 1, 2, and 5 via the browser UI.

1. Open `http://localhost:8081` (or Vite/Expo web port) in browser.
2. Sign in as `arcade_ace`. Verify the top status bar displays:
   - **Player**: `arcade_ace`
   - **Highest Record**: `14`
3. Click **"Start Game"**:
   - Verify pad 1 (e.g. Green) illuminates and plays 415 Hz tone.
   - Click the Green pad. Verify sound triggers with zero noticeable latency and score increments to 1.
4. Advance through Round 2–5:
   - Verify playback tempo accelerates noticeably at Round 6.
5. Intentionally tap an incorrect pad in Round 7:
   - Verify the 42 Hz error buzzer sounds, pad flashes red error cue, and Game Over modal displays:
     - "Final Score: 6"
     - "Highest Record: 14"
     - "Play Again" button.

