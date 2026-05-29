using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Profile
        [HttpGet]
        public async Task<ActionResult<UserInfo>> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return new UserInfo
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                Location = user.Location,
                Bio = user.Bio,
                ProfilePic = user.ProfilePic
            };
        }

        // PUT: api/Profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile(ProfileUpdateDto profileDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Check if email is already taken by another user
            if (user.Email.ToLower() != profileDto.Email.ToLower())
            {
                if (await _context.Users.AnyAsync(u => u.Email.ToLower() == profileDto.Email.ToLower()))
                {
                    return BadRequest("Email is already taken.");
                }
            }

            user.FirstName = profileDto.FirstName;
            user.LastName = profileDto.LastName;
            user.Email = profileDto.Email.ToLower();
            user.Phone = profileDto.Phone;
            user.Location = profileDto.Location;
            user.Bio = profileDto.Bio;
            user.ProfilePic = profileDto.ProfilePic;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
