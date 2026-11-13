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

            int takeCount = Math.Clamp(limit ?? 20, 1, 100);
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

        // DELETE /api/scores/{id} (EF Core CRUD Operation)
        group.MapDelete("/{id:guid}", async (Guid id, HttpContext context, SimonDbContext db, IAuthService auth) =>
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

            var score = await db.GameScores.FindAsync(id);
            if (score == null)
            {
                return Results.NotFound(new { error = "Score record not found." });
            }

            if (score.UserId != userId.Value)
            {
                return Results.Forbid();
            }

            var user = await db.Users.FindAsync(userId.Value);
            db.GameScores.Remove(score);

            if (user != null && score.Score == user.HighestScore)
            {
                // Recalculate highest score from remaining records using EF Core
                int newHighest = await db.GameScores
                    .Where(s => s.UserId == user.Id && s.Id != id)
                    .Select(s => (int?)s.Score)
                    .MaxAsync() ?? 0;

                user.HighestScore = newHighest;
                user.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                success = true,
                newHighestScore = user?.HighestScore ?? 0,
            });
        });
    }

    public record RecordScoreRequest(int Score, int RoundsCompleted, int DurationSeconds, DateTimeOffset? PlayedAt);
}
