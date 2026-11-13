namespace Simon.Core.Entities;

public class GameScore
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public int RoundsCompleted { get; set; }
    public int DurationSeconds { get; set; }
    public DateTimeOffset PlayedAt { get; set; } = DateTimeOffset.UtcNow;

    public User? User { get; set; }
}

