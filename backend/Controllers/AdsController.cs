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
        public async Task<ActionResult<IEnumerable<AdResponseDto>>> GetAds([FromQuery] double? lat = null, [FromQuery] double? lng = null, [FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var query = _context.Ads
                .Include(a => a.Images)
                .Where(a => a.Available) // Only show available ads to the public
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(a => 
                    a.Title.ToLower().Contains(lowerSearch) || 
                    a.Description.ToLower().Contains(lowerSearch) || 
                    a.Category.ToLower().Contains(lowerSearch) || 
                    a.Location.ToLower().Contains(lowerSearch)
                );
            }

            var ads = await query.ToListAsync();

            var responseList = ads.Select(a => new AdResponseDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Price = a.Price,
                Location = a.Location,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                Category = a.Category,
                ContactNumber = a.ContactNumber,
                Available = a.Available,
                CreatedAt = a.CreatedAt,
                Images = a.Images.Select(i => new AdImageResponseDto { Id = i.Id, ImageUrl = i.ImageUrl }).ToList(),
                Distance = (lat.HasValue && lng.HasValue && a.Latitude.HasValue && a.Longitude.HasValue)
                    ? CalculateDistance(lat.Value, lng.Value, a.Latitude.Value, a.Longitude.Value)
                    : null
            });

            if (lat.HasValue && lng.HasValue)
            {
                responseList = responseList.OrderBy(a => a.Distance);
            }
            else
            {
                responseList = responseList.OrderByDescending(a => a.CreatedAt);
            }

            var paginatedResponse = responseList
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();

            return Ok(paginatedResponse);
        }

        // GET: api/Ads/batch?ids=1,2,3
        [HttpGet("batch")]
        public async Task<ActionResult<IEnumerable<AdResponseDto>>> GetAdsByIds([FromQuery] string ids)
        {
            if (string.IsNullOrEmpty(ids)) return Ok(new List<AdResponseDto>());
            
            var idList = ids.Split(',')
                            .Select(s => int.TryParse(s, out var id) ? id : (int?)null)
                            .Where(id => id.HasValue)
                            .Select(id => id.Value)
                            .ToList();

            var ads = await _context.Ads
                .Include(a => a.Images)
                .Where(a => idList.Contains(a.Id) && a.Available) // Only active
                .ToListAsync();

            var response = ads.Select(a => new AdResponseDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Price = a.Price,
                Location = a.Location,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                Category = a.Category,
                ContactNumber = a.ContactNumber,
                Available = a.Available,
                CreatedAt = a.CreatedAt,
                Images = a.Images.Select(i => new AdImageResponseDto { Id = i.Id, ImageUrl = i.ImageUrl }).ToList()
            });

            return Ok(response);
        }

        // GET: api/Ads/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAd(int id)
        {
            var ad = await _context.Ads
                .Include(a => a.Images)
                .Include(a => a.Publisher)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (ad == null)
            {
                return NotFound();
            }

            // Return a safe object without sensitive publisher data
            return new
            {
                ad.Id,
                ad.Title,
                ad.Description,
                ad.Price,
                ad.Location,
                ad.Latitude,
                ad.Longitude,
                ad.Category,
                ad.Images,
                ad.ContactNumber,
                ad.Available,
                ad.CreatedAt,
                Publisher = ad.Publisher != null ? new
                {
                    ad.Publisher.FirstName,
                    ad.Publisher.LastName,
                    ad.Publisher.Email,
                    ad.Publisher.Phone,
                    ad.Publisher.Location,
                    ad.Publisher.Bio,
                    ad.Publisher.ProfilePic
                } : null
            };
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
                Latitude = adDto.Latitude,
                Longitude = adDto.Longitude,
                Category = adDto.Category,
                ContactNumber = adDto.ContactNumber,
                Available = adDto.Available,
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
            ad.Latitude = adDto.Latitude;
            ad.Longitude = adDto.Longitude;
            ad.Category = adDto.Category;
            ad.ContactNumber = adDto.ContactNumber;
            ad.Available = adDto.Available;

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

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Earth's radius in km
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg)
        {
            return deg * (Math.PI / 180);
        }
    }
}
