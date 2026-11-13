# Implementation Plan: Core Simon Game Loop with User Profiles & SQLite

**Branch**: `001-core-game-loop` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-game-loop/spec.md`

## Summary

This plan implements the complete Simon Game loop alongside user authentication and score tracking. The system consists of:
1. A **Decoupled Game Engine** written in TypeScript as a pure, deterministic state machine handling sequence generation, input comparison, progressive difficulty timing, and game over states.
2. An **Abstracted Audio Layer** synthesizing harmonic frequencies in real time via the Web Audio API without asset latency.
3. A **React Native / Web Client** providing an accessible, responsive 4-pad UI with animated illumination, timer countdown, and authenticated profile display.
4. A **.NET 10 Minimal API Backend** backed by a containerized **SQLite database** using Entity Framework Core 10, delivering simple registration, login, and historical score persistence with timestamps and personal best tracking.

---

## Technical Context

**Language/Version**: TypeScript 5.5+ (Client), C# 13 / .NET 10 (Backend)

**Primary Dependencies**:
- Client: React Native (with React Native for Web), Web Audio API
- Backend: ASP.NET Core Minimal APIs (.NET 10), `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.AspNetCore.Authentication.JwtBearer`

**Storage**: SQLite (`simon.db`) managed through Entity Framework Core 10 migrations, persisted via Docker volume mounts.

**Testing**:
- Client: Vitest / Jest, React Native Testing Library
- Backend: `dotnet test`, xUnit, FluentAssertions, `Microsoft.AspNetCore.Mvc.Testing` with in-memory SQLite

**Target Platform**: Web (Modern desktop and mobile browsers) and React Native mobile targets.

**Project Type**: Fullstack Web & Mobile Application with Containerized Microservice Backend.

**Performance Goals**:
- <50ms audio-visual latency upon pad interaction.
- <300ms profile and highest score retrieval on login.
- Deterministic 60 FPS UI transitions and zero audio clipping down to the 180ms speed floor.

**Constraints**:
- Core engine must run 100% offline without mandatory network connectivity.
- Backend Docker container footprint <150MB.
- Audio generated via mathematical waveform synthesis (zero pre-recorded audio files).

**Scale/Scope**: Single-player arcade gameplay, persistent user accounts, score history, and personal best tracking.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Compliance | Status |
|:---|:---|:---|:---|
| **I. Decoupled Core Game Engine** | Pure deterministic state machine; zero UI, audio, or DOM dependencies | Implemented in `client/src/engine/simon-engine.ts` with pure reducer pattern and seed-based sequence generator | **PASS** |
| **II. Abstracted Audio Presentation** | Unified audio hook contract; platform drivers; harmonic pitches | Implemented in `client/src/audio/` exposing `useAudioHooks` with Web Audio API synthesis | **PASS** |
| **III. Containerized .NET 10 Backend** | .NET 10, Docker, clean REST API contracts | .NET 10 Minimal API structured in Clean Architecture; Docker multi-stage build; OpenAPI contract defined | **PASS** |
| **IV. Strict Test-First & Quality Gates** | Unit test coverage for logic; xUnit tests for backend; strict typing | Comprehensive unit tests for state machine, xUnit integration tests for SQLite and API endpoints | **PASS** |
| **V. Cross-Platform Parity & Accessibility** | Dual audio-visual cues; WCAG 2.1 AA; keyboard support; responsive | Accessible color contrast, keyboard shortcuts, harmonic pitch differentiation, responsive CSS/Native layout | **PASS** |

**Gate Status**: **ALL CHECKS PASSED**. No architectural violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-loop/
├── plan.md              # Implementation Plan (this document)
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Database schema, entities & state machine model
├── quickstart.md        # Runnable verification and validation scenarios
├── contracts/
│   ├── openapi.json     # OpenAPI 3.0 specification for .NET 10 backend
│   └── audio-contract.ts # TypeScript contract for abstracted audio services
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
simon-game/
├── docker-compose.yml           # Local multi-container orchestration
│
├── client/                      # React Native / Web Client
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── engine/              # Decoupled Core Engine (Principle I)
│   │   │   ├── types.ts
│   │   │   ├── simon-engine.ts
│   │   │   └── difficulty.ts
│   │   ├── audio/               # Audio Abstraction & Synthesizer (Principle II)
│   │   │   ├── audio-service.ts
│   │   │   ├── web-audio-synth.ts
│   │   │   └── use-audio.ts
│   │   ├── api/                 # REST API Client
│   │   │   ├── client.ts
│   │   │   ├── auth-api.ts
│   │   │   └── scores-api.ts
│   │   ├── components/          # UI Presentation Layer
│   │   │   ├── SimonBoard.tsx
│   │   │   ├── Pad.tsx
│   │   │   ├── ScoreHeader.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── GameOverModal.tsx
│   │   └── App.tsx
│   └── tests/                   # Client Tests
│       ├── engine.test.ts
│       ├── audio.test.ts
│       └── components.test.ts
│
└── backend/                     # .NET 10 Backend (Principle III)
    ├── Simon.sln
    ├── Dockerfile
    ├── src/
    │   ├── Simon.Core/          # Domain Entities & Interfaces
    │   │   ├── Entities/
    │   │   │   ├── User.cs
    │   │   │   └── GameScore.cs
    │   │   └── Interfaces/
    │   │       ├── IUserRepository.cs
    │   │       └── IScoreRepository.cs
    │   ├── Simon.Infrastructure/# EF Core & SQLite Persistence
    │   │   ├── Data/
    │   │   │   └── SimonDbContext.cs
    │   │   ├── Repositories/
    │   │   └── Migrations/
    │   └── Simon.Api/           # Minimal API Endpoints & Configuration
    │       ├── Program.cs
    │       ├── Endpoints/
    │       │   ├── AuthEndpoints.cs
    │       │   └── ScoreEndpoints.cs
    │       └── appsettings.json
    └── tests/
        ├── Simon.UnitTests/     # Domain & Service Unit Tests
        └── Simon.IntegrationTests/ # WebApplicationFactory & SQLite Tests
```

**Structure Decision**:
Organized as a modular monorepo cleanly separating `client/` and `backend/`. This ensures the client remains deployable both as a web app and a mobile app while the .NET 10 backend cleanly encapsulates database management and API routes.

---

## Complexity Tracking

> **Violations**: None. All implementations strictly conform to constitutional principles and requirements.

