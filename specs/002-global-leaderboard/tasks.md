# Tasks: Global Leaderboard & EF Core Score Management

**Input**: Design documents from `/specs/002-global-leaderboard/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md)
**Tests**: Strict TDD required per Simon Game Constitution Principle IV.
**Organization**: Tasks organized by phase and component.

## Format: `- [X] [ID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup & API Contracts
- [X] T001 Define LeaderboardEntry and GlobalChampion interfaces and API methods in client/src/api/leaderboard-api.ts

---

## Phase 2: Backend EF Core CRUD Endpoints & Tests (US1, US3, US4)
- [X] T002 [P] [US1] Write integration tests for GET /api/leaderboard and DELETE /api/scores/{id} in backend/tests/Simon.IntegrationTests/LeaderboardEndpointsTests.cs
- [X] T003 [US1] Implement GET /api/leaderboard and GET /api/leaderboard/global-best in backend/src/Simon.Api/Endpoints/LeaderboardEndpoints.cs
- [X] T004 [US4] Implement DELETE /api/scores/{id} with automatic HighestScore recalculation via EF Core in backend/src/Simon.Api/Endpoints/ScoreEndpoints.cs
- [X] T005 Wire MapLeaderboardEndpoints into backend/src/Simon.Api/Program.cs

---

## Phase 3: Client Components & UI Integration (US1, US2, US3)
- [X] T006 [P] [US1] Implement LeaderboardSidebar component with top ranks, medals (🥇, 🥈, 🥉), and refresh in client/src/components/LeaderboardSidebar.tsx
- [X] T007 [US3] Update ScoreHeader component to show distinct Global Champion Record alongside Personal Best in client/src/components/ScoreHeader.tsx
- [X] T008 [US2] Update App.tsx with 2-column layout, leaderboard integration, and post-game auto-refresh in client/src/App.tsx

---

## Phase 4: Verification & CI/CD
- [X] T009 Run backend dotnet test and client npm test suites to ensure 100% test pass
- [X] T010 Commit and push changes to trigger automated Jenkins pipeline execution
