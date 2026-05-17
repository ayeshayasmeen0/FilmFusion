using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmFusion.API.Models
{
    public class UserMovieInteraction
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("Movie")]
        public int MovieId { get; set; }

        // Favorites
        public bool IsFavorite { get; set; }
        public DateTime? FavoriteDate { get; set; }

        // Watchlist
        public bool IsInWatchlist { get; set; }
        public DateTime? WatchlistDate { get; set; }

        // Ratings (1-10)
        public int? Rating { get; set; }
        public DateTime? RatingDate { get; set; }

        // Comments
        public string? Comment { get; set; }
        public DateTime? CommentDate { get; set; }

        // Watch History
        public bool IsWatched { get; set; }
        public DateTime? WatchedDate { get; set; }

        // Navigation properties
        public virtual User? User { get; set; }
        public virtual Movie? Movie { get; set; }
    }
}