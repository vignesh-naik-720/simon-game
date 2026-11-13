using Microsoft.EntityFrameworkCore;
using Simon.Api.Endpoints;
using Simon.Core.Interfaces;
using Simon.Infrastructure.Data;
using Simon.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure SQLite Connection
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=simon.db";

builder.Services.AddDbContext<SimonDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

builder.Services.AddScoped<IAuthService, AuthService>();

// CORS policy for client frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Auto-migrate / ensure SQLite database is created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SimonDbContext>();
    await db.Database.EnsureCreatedAsync();
}

// Map endpoints
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", database = "sqlite", timestamp = DateTimeOffset.UtcNow }));
app.MapAuthEndpoints();
app.MapScoreEndpoints();
app.MapLeaderboardEndpoints();

app.Run();

public partial class Program { }
