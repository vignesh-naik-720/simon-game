using Microsoft.EntityFrameworkCore;
using Simon.Core.Entities;

namespace Simon.Infrastructure.Data;

public class SimonDbContext : DbContext
{
    public SimonDbContext(DbContextOptions<SimonDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<GameScore> GameScores => Set<GameScore>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(30);
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.HighestScore).HasDefaultValue(0);
            entity.HasIndex(u => u.HighestScore);

            entity.HasMany(u => u.Scores)
                  .WithOne(s => s.User)
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GameScore>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Score).IsRequired();
            entity.Property(s => s.RoundsCompleted).IsRequired();
            entity.Property(s => s.PlayedAt).IsRequired();
            entity.HasIndex(s => new { s.UserId, s.PlayedAt });
            entity.HasIndex(s => s.Score);
        });
    }
}

