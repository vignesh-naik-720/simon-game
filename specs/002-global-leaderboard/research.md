# Technical Research: Global Leaderboard & EF Core Score Management

**Feature**: `002-global-leaderboard`
**Date**: 2026-11-13
**Status**: Completed

## 1. EF Core Query Design & Indexing

### Decision
Implement read-only queries with `.AsNoTracking()` against the indexed `Users` table and `GameScores` table in SQLite:
- **Leaderboard query**:
  ```csharp
  await db.Users
      .AsNoTracking()
      .Where(u => u.HighestScore > 0)
      .OrderByDescending(u => u.HighestScore)
      .ThenBy(u => u.UpdatedAt)
      .Take(limit)
      .Select((u, index) => new LeaderboardDto(...))
      .ToListAsync();
  ```
- **Global Best query**:
  ```csharp
  await db.Users
      .AsNoTracking()
      .OrderByDescending(u => u.HighestScore)
      .Select(u => new GlobalBestDto(u.HighestScore, u.Username, u.UpdatedAt))
      .FirstOrDefaultAsync();
  ```

### Rationale
- High performance: `IX_Users_HighestScore` enables SQLite index scans with zero full-table scan overhead.
- Deterministic tie-breaking: `ThenBy(u => u.UpdatedAt)` ranks earlier achievers higher.

---

## 2. Score Deletion & Recalculation Flow (CRUD)

### Decision
When deleting a score via `DELETE /api/scores/{id}`:
1. Verify record belongs to authenticated user (`score.UserId == currentUserId`).
2. Delete the record: `db.GameScores.Remove(score)`.
3. If `score.Score == user.HighestScore`:
   - Query remaining scores:
     ```csharp
     int newHighest = await db.GameScores
         .Where(s => s.UserId == user.Id && s.Id != score.Id)
         .Select(s => (int?)s.Score)
         .MaxAsync() ?? 0;
     user.HighestScore = newHighest;
     ```
4. Commit transaction via `await db.SaveChangesAsync()`.

---

## 3. UI Layout & Accessibility (Desktop & Mobile)

### Decision
Use a 2-column flex container on desktop:
- **Left Column**: Main Simon Pad arena, Round indicators, Start/Pause/Reset controls.
- **Right Column**: Live Leaderboard card with Top 10 rankings, rank medals (🥇, 🥈, 🥉), tab switcher between "Global Top" and "My History".
- **Responsive Viewport (<960px)**: Leaderboard smoothly moves into a collapsible drawer or accordion toggled by a floating badge button.

