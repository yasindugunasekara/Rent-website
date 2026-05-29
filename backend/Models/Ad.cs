using System;
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

        public string Location { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string ContactNumber { get; set; } = string.Empty;

        public bool Available { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}