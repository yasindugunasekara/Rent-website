using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    //crate a controller for Ads (localhost:5000/api/ads)
    [Route("api/[controller]")]
    [ApiController]
    public class AdsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdsController(ApplicationDbContext context)
        {
            _context = context; //inject the database context to the controller
        }

        // show all the ads in the database (GET Method)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ad>>> GetAds()
        {
            return await _context.Ads.ToListAsync();
        }

        // create a new ad and save it to the database (POST Method)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Ad>> CreateAd(Ad ad)
        {
            _context.Ads.Add(ad);
            await _context.SaveChangesAsync(); // data save the database

            return Ok(ad); // return the created ad as a response
        }
    }
}