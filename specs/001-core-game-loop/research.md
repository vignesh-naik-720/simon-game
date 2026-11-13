# Technical Research: Core Simon Game Loop with User Profiles & SQLite Score Tracking

**Feature**: `001-core-game-loop`
**Date**: 2026-11-12
**Status**: Completed

## Overview
This document consolidates architectural decisions, technology selections, best practices, and trade-off analyses supporting the implementation of the Simon Game client (React Native / React Native for Web) and backend (.NET 10, SQLite, Docker).

---

## 1. Core Game Engine Architecture

### Decision
Implement the core game loop as a pure, deterministic state machine (`SimonEngine`) with an immutable state model (`GameState`) driven by pure reducer transitions (`processAction(state, action): GameState`).

### Rationale
- **Constitution Compliance**: Fulfills Constitution Principle I (*Decoupled Core Game Engine*).
- **Zero UI/DOM Dependency**: Logic is 100% portable across React Native for Web, iOS, Android, and headless test runners without mocking DOM, window timers, or audio APIs.
- **Deterministic Testability**: State transitions can be unit-tested with 100% path coverage by supplying fixed action sequences and seed-based sequence generators.
- **Time-Travel & Replay**: Facilitates session replay, deterministic score verification, and pause/resume capabilities.

### Alternatives Considered
- *React Component State (`useState`/`useReducer` directly in UI)*: Rejected because game state would be coupled to React render cycles, component mounts, and platform UI lifecycles, making automated unit testing and cross-platform porting fragile.
- *Redux / Zustand*: Rejected because introducing global state library dependencies for a self-contained game engine adds unnecessary boilerplate and violates simplicity standards.

---

## 2. Audio Synthesis & Multi-Platform Abstraction

### Decision
Create a unified audio contract (`IAudioService`) exposed via a React hook (`useAudioHooks`). For web targets, audio is synthesized in real time via the native `AudioContext` (Web Audio API) using oscillator nodes with gain envelope shaping (exponential decay to eliminate click artifacts). For React Native mobile targets, the same contract is implemented using native audio players (e.g. `expo-av`).

### Sound Profile & Frequencies
- **Green Pad**: 415 Hz (G#4)
- **Red Pad**: 310 Hz (D#4)
- **Yellow Pad**: 252 Hz (B3)
- **Blue Pad**: 209 Hz (G#3)
- **Error Tone**: 42 Hz (Sawtooth/square low frequency buzzer)

### Rationale
- **Constitution Compliance**: Fulfills Constitution Principle II (*Abstracted Audio & Multi-Platform Presentation*).
- **Zero Asset Latency**: Synthesized tones require zero network bandwidth, eliminate asset loading spinners, and trigger with sub-10ms latency.
- **Accessibility**: Precise harmonic frequencies allow players with color-vision deficiencies to reliably distinguish pads strictly by pitch.

### Alternatives Considered
- *Pre-recorded MP3/WAV Audio Files*: Rejected due to asset packaging overhead, network loading delays on web, potential audio decode stalls on mobile, and licensing restrictions.

---

## 3. Backend Architecture & SQLite Persistence

### Decision
Build a lightweight .NET 10 ASP.NET Core Minimal API service with Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.Sqlite`). Data is persisted in a local/containerized SQLite database file (`simon.db`) mounted to a persistent volume when run via Docker.

### Rationale
- **Constitution Compliance**: Fulfills Constitution Principle III (*Containerized .NET 10 Backend & Clean API Contracts*) and Principle IV (*Strict Test-First & Quality Gates*).
- **Zero-Config Self-Containment**: SQLite requires no separate database server process, has near-zero memory footprint, and supports full ACID transactions and EF Core migrations.
- **High Performance**: .NET 10 Minimal APIs deliver sub-millisecond response times for auth and score recording endpoints.
- **Docker Integration**: A multi-stage Dockerfile (`mcr.microsoft.com/dotnet/sdk:10.0` for build, `mcr.microsoft.com/dotnet/aspnet:10.0` for runtime) produces a lean (~120MB) container with volume persistence at `/app/data/`.

### Alternatives Considered
- *PostgreSQL / SQL Server*: Rejected because running an external database cluster is unnecessary overhead for a lightweight arcade game and contradicts the user's explicit SQLite requirement.
- *JSON Flat-File Storage*: Rejected due to lack of atomic transactions, indexing, concurrent write protection, and migration tooling.

---

## 4. Authentication & Security Model

### Decision
Use lightweight, secure token-based authentication (JWT or cryptographically secure auth tokens) with ASP.NET Core PasswordHasher (PBKDF2 with SHA-512) for credential hashing.
- Endpoints:
  - `POST /api/auth/register`: Creates user account, generates token, returns user profile with highest score (`0`).
  - `POST /api/auth/login`: Validates credentials, generates token, returns user profile and current highest score.
  - `GET /api/user/me`: Retrieves current authenticated player stats and personal best.

### Rationale
- Stateless tokens are consumed effortlessly by both React Native for Web (storing in secure storage/localStorage) and mobile clients.
- Avoids cross-site cookie and CORS complexities between mobile clients and the API.

### Alternatives Considered
- *Cookie-based Sessions*: Rejected due to cross-origin and mobile WebView/native HTTP client friction.
- *Full OAuth2 / OpenID Connect Identity Server*: Rejected as excessive complexity for casual Simon game accounts.

---

## 5. Game Pacing & Difficulty Curves

### Decision
Define standard progressive difficulty tiers for playback speed and timing:

| Round Range | Pad On-Duration | Step Gap Duration | Total Step Time | Inactivity Timeout |
|:---|:---|:---|:---|:---|
| **Rounds 1–5** | 420 ms | 100 ms | 520 ms | 5000 ms |
| **Rounds 6–13** | 320 ms | 80 ms | 400 ms | 5000 ms |
| **Rounds 14–30** | 240 ms | 60 ms | 300 ms | 5000 ms |
| **Rounds 31+** | 180 ms (Floor) | 50 ms | 230 ms | 5000 ms |

### Rationale
- Balances accessibility for beginner players with escalating cognitive challenge for high-round players.
- Strict 180ms floor ensures tones remain distinctly audible and avoids audio clipping or visual rendering frame skipping.

---

## 6. Testing Strategy

### Client Testing (React Native / Web)
- **Unit Tests**: Test `SimonEngine` state transitions with Vitest / Jest. Test seed-based sequence generation, correct input advancement, wrong input game over, timeout handling, and pause/resume.
- **Component Tests**: Test UI rendering, pad illumination triggers, score updates, and login form states with React Native Testing Library.
- **Contract Tests**: Mock backend API responses to verify client state handling under success, auth errors, and offline modes.

### Backend Testing (.NET 10)
- **Domain & Unit Tests**: xUnit + FluentAssertions testing user registration validation, score calculation, and highest score updating logic.
- **Integration Tests**: `WebApplicationFactory<Program>` with an in-memory SQLite connection (`DataSource=:memory:`) testing all HTTP endpoints, auth validation, and database migrations.

