using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AdCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        public string Location { get; set; } = string.Empty;

        public double? Latitude { get; set; }
        
        public double? Longitude { get; set; }

        public string Category { get; set; } = string.Empty;

        public string ContactNumber { get; set; } = string.Empty;

        public bool Available { get; set; } = true;

        public List<string> ImageUrls { get; set; } = new();

        public string? Currency { get; set; } = "USD";
    }

    public class AdResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Location { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Category { get; set; } = string.Empty;
        public List<AdImageResponseDto> Images { get; set; } = new();
        public string ContactNumber { get; set; } = string.Empty;
        public bool Available { get; set; }
        public DateTime CreatedAt { get; set; }
        public double? Distance { get; set; } // Distance in km
    }

    public class AdImageResponseDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
