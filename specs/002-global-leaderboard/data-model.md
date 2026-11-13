# Data Model: Global Leaderboard & EF Core Score Management

**Feature**: `002-global-leaderboard`
**Date**: 2026-11-13
**Status**: Completed

## 1. DTOs & Contracts

### 1.1 LeaderboardEntryDto
```csharp
public record LeaderboardEntryDto(
    int Rank,
    Guid UserId,
    string Username,
    int HighestScore,
    DateTimeOffset AchievedAt,
    bool IsCurrentUser
);
```

### 1.2 GlobalChampionDto
```csharp
public record GlobalChampionDto(
    int HighestScore,
    string ChampionUsername,
    DateTimeOffset AchievedAt
);
```

### 1.3 Client TypeScript Interfaces
```typescript
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  highestScore: number;
  achievedAt: string;
  isCurrentUser: boolean;
}

export interface GlobalChampionInfo {
  highestScore: number;
  championUsername: string;
  achievedAt: string;
}

export interface UserScoreHistoryItem {
  id: string;
  score: number;
  roundsCompleted: number;
  durationSeconds: number;
  playedAt: string;
}
```

