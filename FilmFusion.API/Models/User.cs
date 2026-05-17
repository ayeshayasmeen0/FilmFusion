namespace FilmFusion.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string Role { get; set; } = "User";
        public DateTime CreatedAt { get; set; }  // Yeh line same rakho
        public string? ProfilePicture { get; set; }  // Profile picture path/URL
        public string? Bio { get; set; }             // Short bio
        public DateTime? UpdatedAt { get; set; }     // Last profile update
    }
}