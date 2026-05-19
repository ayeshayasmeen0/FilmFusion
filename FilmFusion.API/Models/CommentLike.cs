using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmFusion.API.Models
{
    public class CommentLike
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("UserMovieInteraction")]
        public int CommentId { get; set; }

        public DateTime LikedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual UserMovieInteraction Comment { get; set; } = null!;
    }
}