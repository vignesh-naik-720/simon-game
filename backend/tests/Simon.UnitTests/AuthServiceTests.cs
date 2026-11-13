using Simon.Core.Entities;
using Simon.Infrastructure.Services;
using Xunit;

namespace Simon.UnitTests;

public class AuthServiceTests
{
    private readonly AuthService _authService = new();

    [Fact]
    public void HashPassword_ShouldReturnValidHash_AndVerifyCorrectly()
    {
        string password = "SecretPassword123!";
        string hash = _authService.HashPassword(password);

        Assert.NotEmpty(hash);
        Assert.True(_authService.VerifyPassword(password, hash));
        Assert.False(_authService.VerifyPassword("WrongPassword!", hash));
    }

    [Fact]
    public void GenerateToken_ShouldProduceValidToken_ForUser()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "TestPlayer",
            HighestScore = 10,
        };

        string token = _authService.GenerateToken(user);
        Assert.NotEmpty(token);

        Guid? validatedId = _authService.ValidateToken(token);
        Assert.Equal(user.Id, validatedId);
    }
}

