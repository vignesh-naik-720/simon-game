using Microsoft.EntityFrameworkCore;
using Simon.Core.Entities;
using Simon.Core.Interfaces;
using Simon.Infrastructure.Data;

namespace Simon.Api.Endpoints;

public static class ScoreEndpoints
{
    public static void MapScoreEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/scores");

        group.MapPost("/", async (RecordScoreRequest req, HttpContext context, SimonDbContext db, IAuthService auth) =>
        {
            string? authHeader = context.Request.Headers.Authorization;
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Unauthorized();
            }

            string token = authHeader.Substring("Bearer ".Length).Trim();
            Guid? userId = auth.ValidateToken(token);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            if (req.Score < 0)
            {
                return Results.BadRequest(new { error = "Score cannot be negative." });
            }

            var gameScore = new GameScore
            {
                UserId = user.Id,
                Score = req.Score,
                RoundsCompleted = req.RoundsCompleted,
                DurationSeconds = req.DurationSeconds,
                PlayedAt = req.PlayedAt ?? DateTimeOffset.UtcNow,
            };

            db.GameScores.Add(gameScore);

            bool isNewHighest = req.Score > user.HighestScore;
            if (isNewHighest)
            {
                user.HighestScore = req.Score;
                user.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await db.SaveChangesAsync();

            return Results.Created($"/api/scores/{gameScore.Id}", new
            {
                scoreId = gameScore.Id,
                isNewHighest,
                highestScore = user.HighestScore,
            });
        });

        group.MapGet("/my-history", async (int? limit, HttpContext context, SimonDbContext db, IAuthService auth) =>
        {
            string? authHeader = context.Request.Headers.Authorization;
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Unauthorized();
            }

            string token = authHeader.Substring("Bearer ".Length).Trim();
            Guid? userId = auth.ValidateToken(token);
            if (userId == null)
            {
                return Results.Unauthorized();
            }

            int takeCount = Math.Clamp(limit ?? 10, 1, 100);
            var scores = await db.GameScores
                .Where(s => s.UserId == userId.Value)
                .OrderByDescending(s => s.PlayedAt)
                .Take(takeCount)
                .Select(s => new
                {
                    id = s.Id,
                    score = s.Score,
                    roundsCompleted = s.RoundsCompleted,
                    durationSeconds = s.DurationSeconds,
                    playedAt = s.PlayedAt,
                })
                .ToListAsync();

            return Results.Ok(scores);
        });

        group.MapGet("/leaderboard", async (int? limit, SimonDbContext db) =>
        {
            int takeCount = Math.Clamp(limit ?? 10, 1, 100);
            var topPlayers = await db.Users
                .Where(u => u.HighestScore > 0)
                .OrderByDescending(u => u.HighestScore)
                .Take(takeCount)
                .Select(u => new
                {
                    username = u.Username,
                    highestScore = u.HighestScore,
                    registeredAt = u.CreatedAt,
                })
                .ToListAsync();

            return Results.Ok(topPlayers);
        });
    }

    public record RecordScoreRequest(int Score, int RoundsCompleted, int DurationSeconds, DateTimeOffset? PlayedAt);
}
