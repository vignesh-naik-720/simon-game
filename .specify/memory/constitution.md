<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1
- List of modified principles: None
- Added sections: None
- Removed sections: None
- Modifications: Specified SQLite database with Entity Framework Core in Technology Stack & Architecture Constraints
- Follow-up TODOs: None
-->

# Simon Game Constitution

## Core Principles

### I. Decoupled Core Game Engine
The core Simon game logic (sequence generation, player input evaluation, round progression, difficulty timing curves, and score tracking) MUST be implemented as a pure, deterministic state machine. The game engine MUST remain strictly decoupled from React Native components, DOM elements, audio drivers, and network I/O. All state transitions MUST be pure functions or self-contained state transitions that take user actions and emit immutable state snapshots.
*Rationale*: Decoupling pure logic guarantees comprehensive unit testability, deterministic replay capability, and seamless reuse across web and mobile platforms without UI lifecycle interference.

### II. Abstracted Audio & Multi-Platform Presentation
Audio output MUST be encapsulated behind an abstracted audio hook interface (`useAudioHooks` / platform audio contract). Platform-specific sound implementations (such as Web Audio API on web and native sound modules on React Native mobile) MUST implement a shared audio interface. View components MUST trigger sounds via semantic events (e.g., pad activated, error buzzer, game win) rather than calling platform audio primitives directly.
*Rationale*: Web and mobile operating systems have distinct audio rendering and lifecycle behaviors; an abstract hook layer guarantees cross-platform consistency and simplifies mocking during tests.

### III. Containerized .NET 10 Backend & Clean API Contracts
All server-side functionality (including high scores, leaderboard management, user profiles, and session validation) MUST be developed on .NET 10 and packaged using multi-stage Docker containers. Client-server communications MUST adhere to strictly typed, versioned API contracts (REST / OpenAPI / JSON). Docker container configurations MUST support reproducible local development via Docker Compose as well as standard cloud deployments.
*Rationale*: Standardizing backend microservices with .NET 10 and Docker provides high throughput, strong type safety, and identical runtime environments across local development and production.

### IV. Strict Test-First & Quality Gates
A test-first engineering discipline MUST be maintained across both the client state engine and the backend domain logic. Critical business logic—including sequence generation, state transitions, scoring, and leaderboard updates—MUST achieve high unit test coverage prior to integration. Code MUST pass automated quality gates (TypeScript strict type checking, C# nullable analysis, linting, and automated test suites) before pull requests are approved.
*Rationale*: Timing-sensitive interactive games and score leaderboards are vulnerable to subtle concurrency and edge-case regressions; rigorous automated test gates maintain stability.

### V. Cross-Platform Parity & Accessibility
The game experience MUST maintain operational and visual parity across Web and React Native mobile targets. Every color-based memory pad MUST provide synchronized dual-channel feedback (distinct visual illumination paired with unique audio pitch/frequency). The user interface MUST adhere to WCAG 2.1 AA standards, supporting keyboard navigation on web, screen reader announcements, and adequate touch target sizing.
*Rationale*: Simon is an audio-visual pattern game; ensuring accessible, dual-channel cues and responsive layout guarantees an inclusive experience across all form factors.

## Technology Stack & Architecture Constraints

1. **Client Platform**:
   - Framework: React Native with React Native for Web support.
   - Language: TypeScript with strict mode enabled (`"strict": true`).
   - State Management: Pure, deterministic game state machine.
   - Audio: Abstracted audio hook layer supporting Web Audio API (web) and native audio drivers (mobile).

2. **Backend Platform**:
   - Framework: .NET 10 (C# 13).
   - Architecture: Clean Architecture / Minimal APIs with strongly typed request/response contracts.
   - Persistence: SQLite database with Entity Framework Core migrations (containerized via Docker with persistent volume or local development).

3. **Containerization & DevOps**:
   - Containerization: Multi-stage Dockerfiles for .NET 10 backend services.
   - Local Orchestration: Docker Compose for local API, database, and tooling setup.

4. **Testing & Quality Tooling**:
   - Client: Jest / React Native Testing Library / Vitest for unit and component testing.
   - Backend: `dotnet test`, xUnit, and FluentAssertions.
   - Linters / Formatters: ESLint, Prettier, and dotnet format enforced via pre-commit or CI.

## Development Workflow & Quality Gates

1. **Test-First Implementation**:
   - Core game rules, state changes, and API contracts MUST be covered by unit tests written alongside or prior to feature implementation.
2. **Automated CI Validation**:
   - Every pull request MUST pass automated type checks, lint checks, unit tests, and Docker container build verification.
3. **API Contract Synchronization**:
   - Any backend schema change MUST generate updated client contracts or TypeScript interfaces before merging.
4. **Code Review & Standards**:
   - Code submissions MUST be reviewed by at least one engineer to verify conformance with core principles and absence of memory leaks in audio/timers.

## Governance

The Simon Game Constitution represents the foundational standard for architectural, technical, and quality decisions across this repository. It supersedes informal team conventions and temporary shortcuts.

- **Amendment Process**: Amendments to this constitution require a documented proposal detailing rationale, migration impact, and unanimous maintainer approval.
- **Versioning Policy**: Semantic versioning applies:
  - **MAJOR**: Incompatible principle removals or foundational architecture shifts (e.g., swapping primary platforms).
  - **MINOR**: Addition of new principles, sections, or significant governance expansions.
  - **PATCH**: Typo corrections, clarifications, and non-breaking wording refinements.
- **Compliance Review**: All feature specifications, design plans, and code reviews MUST explicitly check compliance against these constitutional principles.

**Version**: 1.0.1 | **Ratified**: 2026-11-12 | **Last Amended**: 2026-11-12
