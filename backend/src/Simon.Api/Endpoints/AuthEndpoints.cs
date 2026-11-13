using Microsoft.EntityFrameworkCore;
using Simon.Core.Entities;
using Simon.Core.Interfaces;
using Simon.Infrastructure.Data;

namespace Simon.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterRequest req, SimonDbContext db, IAuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Trim().Length < 3 || req.Username.Trim().Length > 30)
            {
                return Results.BadRequest(new { error = "Username must be between 3 and 30 characters." });
            }

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
            {
                return Results.BadRequest(new { error = "Password must be at least 6 characters." });
            }

            string cleanUsername = req.Username.Trim();
            bool exists = await db.Users.AnyAsync(u => u.Username.ToLower() == cleanUsername.ToLower());
            if (exists)
            {
                return Results.BadRequest(new { error = "Username is already taken." });
            }

            var user = new User
            {
                Username = cleanUsername,
                PasswordHash = auth.HashPassword(req.Password),
                HighestScore = 0,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            string token = auth.GenerateToken(user);
            return Results.Created($"/api/user/{user.Id}", new
            {
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    highestScore = user.HighestScore,
                    createdAt = user.CreatedAt,
                }
            });
        });

        group.MapPost("/login", async (LoginRequest req, SimonDbContext db, IAuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            {
                return Results.BadRequest(new { error = "Username and password are required." });
            }

            string cleanUsername = req.Username.Trim();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == cleanUsername.ToLower());
            if (user == null || !auth.VerifyPassword(req.Password, user.PasswordHash))
            {
                return Results.Json(new { error = "Invalid username or password." }, statusCode: StatusCodes.Status401Unauthorized);
            }

            string token = auth.GenerateToken(user);
            return Results.Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    highestScore = user.HighestScore,
                    createdAt = user.CreatedAt,
                }
            });
        });

        app.MapGet("/api/user/me", async (HttpContext context, SimonDbContext db, IAuthService auth) =>
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

            return Results.Ok(new
            {
                id = user.Id,
                username = user.Username,
                highestScore = user.HighestScore,
                createdAt = user.CreatedAt,
            });
        });
    }

    public record RegisterRequest(string Username, string Password);
    public record LoginRequest(string Username, string Password);
}
