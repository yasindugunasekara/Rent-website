using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;
using backend.DTOs;
using BCrypt.Net;
using Google.Apis.Auth;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower()))
            {
                return BadRequest("User with this email already exists.");
            }

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = "publisher", // Default role
                AuthMethod = "local"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var email = loginDto.Email.ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null || (user.AuthMethod != "local" && !string.IsNullOrEmpty(user.AuthMethod)) || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                User = new UserInfo
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role
                }
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(GoogleLoginDto googleLoginDto)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(googleLoginDto.IdToken, settings);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == payload.Email.ToLower());

                if (user == null)
                {
                    user = new User
                    {
                        FirstName = payload.GivenName ?? "Google",
                        LastName = payload.FamilyName ?? "User",
                        Email = payload.Email.ToLower(),
                        AuthMethod = "google",
                        Role = "publisher",
                        ProfilePic = payload.Picture
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }
                else if (user.AuthMethod != "google")
                {
                    user.AuthMethod = "google";
                    if (string.IsNullOrEmpty(user.ProfilePic))
                    {
                        user.ProfilePic = payload.Picture;
                    }
                    await _context.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user);


                return Ok(new AuthResponseDto
                {
                    Token = token,
                    User = new UserInfo
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        Role = user.Role,
                        ProfilePic = user.ProfilePic
                    }
                });
            }
            catch (InvalidJwtException ex)
            {
                Console.WriteLine($"Invalid JWT: {ex.Message}");
                return Unauthorized(new { message = "Invalid Google token." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Google Login Error: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
