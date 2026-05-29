using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Ad
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        public string Location { get; set; } = string.Empty; // Full address string

        public double? Latitude { get; set; }
        
        public double? Longitude { get; set; }

        public string Category { get; set; } = string.Empty;

        public List<AdImage> Images { get; set; } = new();

        public string ContactNumber { get; set; } = string.Empty;

        public bool Available { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationship to User (Publisher)
        public int? PublisherId { get; set; }
        
        public User? Publisher { get; set; }
    }
}
