using System.ComponentModel.DataAnnotations;

namespace FilmFusion.API.Models
{
    public class Movie
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";
        public string OriginalTitle { get; set; } = "";
        public string Overview { get; set; } = "";
        public string PosterPath { get; set; } = "";
        public string BackdropPath { get; set; } = "";
        public string TrailerUrl { get; set; } = "";

        public int? TmdbId { get; set; }
        public int Year { get; set; }
        public string Genre { get; set; } = "";
        public double Rating { get; set; }
        public string Runtime { get; set; } = "";
        public string Director { get; set; } = "";
        public string Cast { get; set; } = "";

        public double AverageUserRating { get; set; }
        public int TotalRatings { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}