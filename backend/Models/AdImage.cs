using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class AdImage
    {
        public int Id { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public int AdId { get; set; }

        [JsonIgnore]
        public Ad? Ad { get; set; }
    }
}
