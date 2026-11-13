using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Simon.Core.Entities;
using Simon.Core.Interfaces;

namespace Simon.Infrastructure.Services;

public class AuthService : IAuthService
{
    private static readonly byte[] SecretKey = Encoding.UTF8.GetBytes("SimonGameSecretSigningKey20261112LongEnoughForHMACSHA256!");
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA512,
            HashSize);

        byte[] combined = new byte[SaltSize + HashSize];
        Buffer.BlockCopy(salt, 0, combined, 0, SaltSize);
        Buffer.BlockCopy(hash, 0, combined, SaltSize, HashSize);

        return Convert.ToBase64String(combined);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            byte[] combined = Convert.FromBase64String(passwordHash);
            if (combined.Length != SaltSize + HashSize)
                return false;

            byte[] salt = new byte[SaltSize];
            byte[] expectedHash = new byte[HashSize];
            Buffer.BlockCopy(combined, 0, salt, 0, SaltSize);
            Buffer.BlockCopy(combined, SaltSize, expectedHash, 0, HashSize);

            byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA512,
                HashSize);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch
        {
            return false;
        }
    }

    public string GenerateToken(User user)
    {
        var payload = new TokenPayload(user.Id, user.Username, DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds());
        string payloadJson = JsonSerializer.Serialize(payload);
        string payloadB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson));

        using var hmac = new HMACSHA256(SecretKey);
        byte[] sigBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadB64));
        string sigB64 = Convert.ToBase64String(sigBytes);

        return $"{payloadB64}.{sigB64}";
    }

    public Guid? ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var parts = token.Split('.');
        if (parts.Length != 2)
            return null;

        string payloadB64 = parts[0];
        string sigB64 = parts[1];

        using var hmac = new HMACSHA256(SecretKey);
        byte[] expectedSig = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadB64));
        string expectedSigB64 = Convert.ToBase64String(expectedSig);

        if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(sigB64), Encoding.UTF8.GetBytes(expectedSigB64)))
            return null;

        try
        {
            string payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadB64));
            var payload = JsonSerializer.Deserialize<TokenPayload>(payloadJson);
            if (payload == null)
                return null;

            if (payload.Exp < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
                return null;

            return payload.Sub;
        }
        catch
        {
            return null;
        }
    }

    private record TokenPayload(Guid Sub, string Name, long Exp);
}

