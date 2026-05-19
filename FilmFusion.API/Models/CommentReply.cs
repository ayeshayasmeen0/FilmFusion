using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmFusion.API.Models
{
    public class CommentReply
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("UserMovieInteraction")]
        public int ParentCommentId { get; set; }

        public string ReplyText { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; } = null!;
        public virtual UserMovieInteraction ParentComment { get; set; } = null!;
    }
}