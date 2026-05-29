using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "publisher"; // "admin" or "publisher"

        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePic { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
