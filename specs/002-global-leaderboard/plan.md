# Implementation Plan: Global Leaderboard & EF Core Score Management

**Branch**: `002-global-leaderboard` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-global-leaderboard/spec.md`

## Summary

This feature adds a real-time, side-by-side Leaderboard component to the Simon Game UI and expands the .NET 10 EF Core backend with full CRUD endpoints for leaderboards, score history, and score deletion. It also clearly disambiguates the Global Champion Record from the current user's personal best in the header.

---

## Technical Context

- **Backend**: .NET 10 Minimal APIs, Entity Framework Core 10 SQLite provider (`Microsoft.EntityFrameworkCore.Sqlite`)
- **Client**: React Native / Web (TypeScript, strict mode, Vite)
- **Database**: SQLite with indexed `HighestScore` queries
- **Testing**: xUnit integration tests for EF Core CRUD endpoints; Vitest for leaderboard UI state and client API client

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Compliance | Status |
|:---|:---|:---|:---|
| **I. Decoupled Core Game Engine** | Pure state machine remains untouched | Leaderboard is presentation/API-driven; core engine remains pure | **PASS** |
| **II. Abstracted Audio** | Sound unchanged | Audio hooks unchanged | **PASS** |
| **III. Containerized .NET 10 Backend** | .NET 10 + EF Core CRUD APIs | Clean Minimal API endpoints with EF Core queries and mutations | **PASS** |
| **IV. Strict Test-First & Quality Gates** | Unit & integration tests | Tests written first for leaderboard endpoint and score deletion | **PASS** |
| **V. Cross-Platform Parity & Accessibility** | Responsive layout | Desktop 2-column + mobile drawer layout with high contrast medals | **PASS** |

**Gate Status**: **ALL CHECKS PASSED**.

---

## Project Structure

```text
simon-game/
├── backend/
│   ├── src/
│   │   └── Simon.Api/
│   │       └── Endpoints/
│   │           ├── LeaderboardEndpoints.cs  # NEW: GET /api/leaderboard, GET /api/leaderboard/global-best
│   │           └── ScoreEndpoints.cs        # UPDATED: DELETE /api/scores/{id} (CRUD)
│   └── tests/
│       └── Simon.IntegrationTests/
│           └── LeaderboardEndpointsTests.cs # NEW: Integration tests for CRUD
└── client/
    └── src/
        ├── api/
        │   └── leaderboard-api.ts           # NEW: Leaderboard API client
        ├── components/
        │   ├── LeaderboardSidebar.tsx       # NEW: Responsive Leaderboard sidebar
        │   └── ScoreHeader.tsx              # UPDATED: Differentiates Global vs Personal best
        └── App.tsx                          # UPDATED: 2-column layout + auto-refresh
```

