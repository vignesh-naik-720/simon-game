using Microsoft.EntityFrameworkCore;
using Simon.Core.Interfaces;
using Simon.Infrastructure.Data;

namespace Simon.Api.Endpoints;

public static class LeaderboardEndpoints
{
    public static void MapLeaderboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/leaderboard");

        // GET /api/leaderboard?limit=10
        group.MapGet("/", async (int? limit, HttpContext context, SimonDbContext db, IAuthService auth) =>
        {
            int takeCount = Math.Clamp(limit ?? 10, 1, 50);

            // Determine if requesting user is authenticated
            Guid? currentUserId = null;
            string? authHeader = context.Request.Headers.Authorization;
            if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                currentUserId = auth.ValidateToken(authHeader.Substring("Bearer ".Length).Trim());
            }

            var topUsers = await db.Users
                .AsNoTracking()
                .Where(u => u.HighestScore > 0)
                .OrderByDescending(u => u.HighestScore)
                .ThenBy(u => u.UpdatedAt)
                .Take(takeCount)
                .Select(u => new
                {
                    userId = u.Id,
                    username = u.Username,
                    highestScore = u.HighestScore,
                    achievedAt = u.UpdatedAt,
                })
                .ToListAsync();

            var ranked = topUsers.Select((u, index) => new
            {
                rank = index + 1,
                userId = u.userId,
                username = u.username,
                highestScore = u.highestScore,
                achievedAt = u.achievedAt,
                isCurrentUser = currentUserId.HasValue && u.userId == currentUserId.Value,
            });

            return Results.Ok(ranked);
        });

        // GET /api/leaderboard/global-best
        group.MapGet("/global-best", async (SimonDbContext db) =>
        {
            var top = await db.Users
                .AsNoTracking()
                .Where(u => u.HighestScore > 0)
                .OrderByDescending(u => u.HighestScore)
                .ThenBy(u => u.UpdatedAt)
                .Select(u => new
                {
                    highestScore = u.HighestScore,
                    championUsername = u.Username,
                    achievedAt = u.UpdatedAt,
                })
                .FirstOrDefaultAsync();

            if (top == null)
            {
                return Results.Ok(new
                {
                    highestScore = 0,
                    championUsername = "None",
                    achievedAt = DateTimeOffset.UtcNow,
                });
            }

            return Results.Ok(top);
        });
    }
}

