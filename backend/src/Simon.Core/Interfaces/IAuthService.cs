using Simon.Core.Entities;

namespace Simon.Core.Interfaces;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
    string GenerateToken(User user);
    Guid? ValidateToken(string token);
}

