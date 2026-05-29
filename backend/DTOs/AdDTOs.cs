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

        public string Category { get; set; } = string.Empty;

        public string ContactNumber { get; set; } = string.Empty;

        public List<string> ImageUrls { get; set; } = new();
    }
}
