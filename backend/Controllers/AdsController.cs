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
    public class AdsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Ads
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ad>>> GetAds()
        {
            return await _context.Ads
                .Include(a => a.Images)
                .ToListAsync();
        }

        // GET: api/Ads/my-ads
        [HttpGet("my-ads")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Ad>>> GetMyAds()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            return await _context.Ads
                .Where(a => a.PublisherId == userId)
                .Include(a => a.Images)
                .ToListAsync();
        }

        // POST: api/Ads
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Ad>> CreateAd(AdCreateDto adDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var ad = new Ad
            {
                Title = adDto.Title,
                Description = adDto.Description,
                Price = adDto.Price,
                Location = adDto.Location,
                Category = adDto.Category,
                ContactNumber = adDto.ContactNumber,
                PublisherId = userId,
                Images = adDto.ImageUrls.Select(url => new AdImage { ImageUrl = url }).ToList()
            };

            _context.Ads.Add(ad);
            await _context.SaveChangesAsync();

            return Ok(ad);
        }

        // PUT: api/Ads/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAd(int id, AdCreateDto adDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var ad = await _context.Ads.Include(a => a.Images).FirstOrDefaultAsync(a => a.Id == id);

            if (ad == null) return NotFound();
            if (ad.PublisherId != userId) return Forbid(); // Prevent editing other people's ads

            ad.Title = adDto.Title;
            ad.Description = adDto.Description;
            ad.Price = adDto.Price;
            ad.Location = adDto.Location;
            ad.Category = adDto.Category;
            ad.ContactNumber = adDto.ContactNumber;

            // Update images
            _context.AdImages.RemoveRange(ad.Images);
            ad.Images = adDto.ImageUrls.Select(url => new AdImage { ImageUrl = url, AdId = ad.Id }).ToList();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Ads/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAd(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var ad = await _context.Ads.FindAsync(id);

            if (ad == null) return NotFound();
            if (ad.PublisherId != userId) return Forbid(); // Prevent deleting other people's ads

            _context.Ads.Remove(ad);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
