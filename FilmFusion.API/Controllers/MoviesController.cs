using FilmFusion.API.Data;
using FilmFusion.API.Models;
using FilmFusion.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FilmFusion.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TmdbService _tmdbService;

        public MoviesController(AppDbContext context, TmdbService tmdbService)
        {
            _context = context;
            _tmdbService = tmdbService;
        }

        // ========== LOCAL DATABASE CRUD ==========

        [HttpGet]
        public async Task<IActionResult> GetAllMovies()
        {
            var movies = await _context.Movies.ToListAsync();
            return Ok(movies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound(new { message = "Movie not found" });
            return Ok(movie);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return BadRequest(new { message = "Query is required" });
            var movies = await _context.Movies
                .Where(m => m.Title.Contains(query) || m.Genre.Contains(query) || m.Overview.Contains(query))
                .ToListAsync();
            return Ok(movies);
        }

        [HttpGet("genre/{genre}")]
        public async Task<IActionResult> GetMoviesByGenre(string genre)
        {
            var movies = await _context.Movies
                .Where(m => m.Genre.ToLower().Contains(genre.ToLower()))
                .ToListAsync();
            return Ok(movies);
        }

        [HttpPost]
        public async Task<IActionResult> AddMovie([FromBody] Movie movie)
        {
            if (movie == null) return BadRequest(new { message = "Movie data is required" });
            movie.CreatedAt = DateTime.UtcNow;
            movie.UpdatedAt = DateTime.UtcNow;
            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie added successfully", movie });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, [FromBody] Movie updatedMovie)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound(new { message = "Movie not found" });
            movie.Title = updatedMovie.Title;
            movie.Genre = updatedMovie.Genre;
            movie.Year = updatedMovie.Year;
            movie.Rating = updatedMovie.Rating;
            movie.Overview = updatedMovie.Overview;
            movie.PosterPath = updatedMovie.PosterPath;
            movie.TrailerUrl = updatedMovie.TrailerUrl;
            movie.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie updated successfully", movie });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound(new { message = "Movie not found" });
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie deleted successfully" });
        }

        // ========== TMDB REAL MOVIE DATA ==========

        [HttpGet("search-tmdb")]
        public async Task<IActionResult> SearchTMDB([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return BadRequest(new { message = "Query is required" });
            try
            {
                var results = await _tmdbService.SearchMoviesAsync(query);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching from TMDB", error = ex.Message });
            }
        }

        [HttpPost("import/{tmdbId}")]
        public async Task<IActionResult> ImportMovie(int tmdbId)
        {
            try
            {
                var existing = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId);
                if (existing != null) return BadRequest(new { message = "Movie already exists" });
                var movie = await _tmdbService.GetMovieDetailsAsync(tmdbId);
                if (movie == null) return NotFound(new { message = "Movie not found on TMDB" });
                _context.Movies.Add(movie);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Movie imported successfully", movie });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error importing movie", error = ex.Message });
            }
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularMovies([FromQuery] int page = 1)
        {
            try
            {
                var movies = await _tmdbService.GetPopularMoviesAsync(page);
                return Ok(movies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching popular movies", error = ex.Message });
            }
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRatedMovies([FromQuery] int page = 1)
        {
            try
            {
                var movies = await _tmdbService.GetTopRatedMoviesAsync(page);
                return Ok(movies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching top rated movies", error = ex.Message });
            }
        }

        [HttpGet("{id}/trailer")]
        public async Task<IActionResult> GetTrailer(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound(new { message = "Movie not found" });
            if (movie.TmdbId == null) return NotFound(new { message = "No TMDB ID" });
            try
            {
                var movieDetails = await _tmdbService.GetMovieDetailsAsync(movie.TmdbId.Value);
                return Ok(new { trailerUrl = movieDetails.TrailerUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching trailer", error = ex.Message });
            }
        }

        // ========== USER INTERACTION METHODS ==========

        [HttpPost("favorite")]
        public async Task<IActionResult> AddToFavorite([FromBody] FavoriteRequest request)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.MovieId == request.MovieId);
            if (interaction == null)
            {
                interaction = new UserMovieInteraction
                {
                    UserId = request.UserId,
                    MovieId = request.MovieId,
                    IsFavorite = true,
                    FavoriteDate = DateTime.UtcNow
                };
                _context.UserMovieInteractions.Add(interaction);
            }
            else
            {
                interaction.IsFavorite = true;
                interaction.FavoriteDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Added to favorites" });
        }

        [HttpDelete("favorite")]
        public async Task<IActionResult> RemoveFromFavorite([FromQuery] int userId, [FromQuery] int movieId)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == userId && i.MovieId == movieId);
            if (interaction != null)
            {
                interaction.IsFavorite = false;
                interaction.FavoriteDate = null;
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Removed from favorites" });
        }

        [HttpGet("favorites/{userId}")]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            var favorites = await _context.UserMovieInteractions
                .Where(i => i.UserId == userId && i.IsFavorite)
                .Include(i => i.Movie)
                .Select(i => i.Movie)
                .ToListAsync();
            return Ok(favorites);
        }

        [HttpPost("rate")]
        public async Task<IActionResult> RateMovie([FromBody] RatingRequest request)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.MovieId == request.MovieId);
            if (interaction == null)
            {
                interaction = new UserMovieInteraction
                {
                    UserId = request.UserId,
                    MovieId = request.MovieId,
                    Rating = request.Rating,
                    RatingDate = DateTime.UtcNow
                };
                _context.UserMovieInteractions.Add(interaction);
            }
            else
            {
                interaction.Rating = request.Rating;
                interaction.RatingDate = DateTime.UtcNow;
            }
            var movie = await _context.Movies.FindAsync(request.MovieId);
            if (movie != null)
            {
                var allRatings = await _context.UserMovieInteractions
                    .Where(i => i.MovieId == request.MovieId && i.Rating.HasValue)
                    .Select(i => i.Rating.Value)
                    .ToListAsync();
                if (allRatings.Any())
                {
                    movie.AverageUserRating = allRatings.Average();
                    movie.TotalRatings = allRatings.Count;
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Rating added" });
        }

        [HttpPost("comment")]
        public async Task<IActionResult> AddComment([FromBody] CommentRequest request)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.MovieId == request.MovieId);
            if (interaction == null)
            {
                interaction = new UserMovieInteraction
                {
                    UserId = request.UserId,
                    MovieId = request.MovieId,
                    Comment = request.Comment,
                    CommentDate = DateTime.UtcNow
                };
                _context.UserMovieInteractions.Add(interaction);
            }
            else
            {
                interaction.Comment = request.Comment;
                interaction.CommentDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Comment added" });
        }

        [HttpPut("comment/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
        {
            var interaction = await _context.UserMovieInteractions.FindAsync(id);
            if (interaction == null) return NotFound(new { message = "Comment not found" });
            if (string.IsNullOrWhiteSpace(request.Comment)) return BadRequest(new { message = "Comment cannot be empty" });
            interaction.Comment = request.Comment;
            interaction.CommentDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Comment updated successfully" });
        }

        [HttpDelete("comment/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var interaction = await _context.UserMovieInteractions.FindAsync(id);
            if (interaction == null) return NotFound(new { message = "Comment not found" });
            interaction.Comment = null;
            interaction.CommentDate = null;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Comment deleted successfully" });
        }

        [HttpGet("{movieId}/comments")]
        public async Task<IActionResult> GetMovieComments(int movieId)
        {
            var comments = await _context.UserMovieInteractions
                .Where(i => i.MovieId == movieId && i.Comment != null)
                .Include(i => i.User)
                .OrderByDescending(i => i.CommentDate)
                .Select(i => new { i.Id, i.User.Username, i.Comment, i.CommentDate })
                .ToListAsync();
            return Ok(comments);
        }

        [HttpPost("watchlist")]
        public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistRequest request)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.MovieId == request.MovieId);
            if (interaction == null)
            {
                interaction = new UserMovieInteraction
                {
                    UserId = request.UserId,
                    MovieId = request.MovieId,
                    IsInWatchlist = true,
                    WatchlistDate = DateTime.UtcNow
                };
                _context.UserMovieInteractions.Add(interaction);
            }
            else
            {
                interaction.IsInWatchlist = true;
                interaction.WatchlistDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Added to watchlist" });
        }

        [HttpDelete("watchlist")]
        public async Task<IActionResult> RemoveFromWatchlist([FromQuery] int userId, [FromQuery] int movieId)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == userId && i.MovieId == movieId);
            if (interaction == null) return NotFound(new { message = "Movie not found in watchlist" });
            interaction.IsInWatchlist = false;
            interaction.WatchlistDate = null;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Removed from watchlist successfully" });
        }

        [HttpGet("watchlist/{userId}")]
        public async Task<IActionResult> GetUserWatchlist(int userId)
        {
            var watchlist = await _context.UserMovieInteractions
                .Where(i => i.UserId == userId && i.IsInWatchlist)
                .Include(i => i.Movie)
                .Select(i => i.Movie)
                .ToListAsync();
            return Ok(watchlist);
        }

        [HttpPost("watched")]
        public async Task<IActionResult> MarkAsWatched([FromBody] WatchedRequest request)
        {
            var interaction = await _context.UserMovieInteractions
                .FirstOrDefaultAsync(i => i.UserId == request.UserId && i.MovieId == request.MovieId);
            if (interaction == null)
            {
                interaction = new UserMovieInteraction
                {
                    UserId = request.UserId,
                    MovieId = request.MovieId,
                    IsWatched = true,
                    WatchedDate = DateTime.UtcNow
                };
                _context.UserMovieInteractions.Add(interaction);
            }
            else
            {
                interaction.IsWatched = true;
                interaction.WatchedDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Marked as watched" });
        }

        // ========== COMMENT LIKES ==========

        [HttpPost("comment/{commentId}/like")]
        public async Task<IActionResult> LikeComment(int commentId, [FromBody] LikeCommentRequest request)
        {
            var existingLike = await _context.CommentLikes
                .FirstOrDefaultAsync(l => l.CommentId == commentId && l.UserId == request.UserId);
            if (existingLike != null)
            {
                _context.CommentLikes.Remove(existingLike);
                await _context.SaveChangesAsync();
                return Ok(new { liked = false });
            }
            var like = new CommentLike { CommentId = commentId, UserId = request.UserId, LikedAt = DateTime.UtcNow };
            _context.CommentLikes.Add(like);
            var comment = await _context.UserMovieInteractions.FindAsync(commentId);
            if (comment != null && comment.UserId != request.UserId)
            {
                var liker = await _context.Users.FindAsync(request.UserId);
                var notification = new Notification
                {
                    UserId = comment.UserId,
                    Type = "like",
                    Message = $"{liker?.Username} liked your comment",
                    RelatedId = commentId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }
            await _context.SaveChangesAsync();
            return Ok(new { liked = true });
        }

        [HttpGet("comment/{commentId}/likes-count")]
        public async Task<IActionResult> GetCommentLikesCount(int commentId)
        {
            var count = await _context.CommentLikes.CountAsync(l => l.CommentId == commentId);
            return Ok(new { likesCount = count });
        }

        // ========== COMMENT REPLIES ==========

        [HttpPost("comment/{commentId}/reply")]
        public async Task<IActionResult> AddReply(int commentId, [FromBody] AddReplyRequest request)
        {
            var reply = new CommentReply
            {
                ParentCommentId = commentId,
                UserId = request.UserId,
                ReplyText = request.ReplyText,
                CreatedAt = DateTime.UtcNow
            };
            _context.CommentReplies.Add(reply);
            var comment = await _context.UserMovieInteractions.FindAsync(commentId);
            if (comment != null && comment.UserId != request.UserId)
            {
                var replier = await _context.Users.FindAsync(request.UserId);
                var notification = new Notification
                {
                    UserId = comment.UserId,
                    Type = "reply",
                    Message = $"{replier?.Username} replied to your comment",
                    RelatedId = commentId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Reply added" });
        }

        [HttpGet("comment/{commentId}/replies")]
        public async Task<IActionResult> GetCommentReplies(int commentId)
        {
            var replies = await _context.CommentReplies
                .Where(r => r.ParentCommentId == commentId)
                .Include(r => r.User)
                .OrderBy(r => r.CreatedAt)
                .Select(r => new { r.Id, r.UserId, Username = r.User.Username, ProfilePicture = r.User.ProfilePicture, r.ReplyText, r.CreatedAt })
                .ToListAsync();
            return Ok(replies);
        }

        // ========== NOTIFICATIONS ==========

        [HttpGet("notifications/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new { n.Id, n.Type, n.Message, n.RelatedId, n.IsRead, n.CreatedAt })
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpPut("notifications/{notificationId}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return NotFound();
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Marked as read" });
        }

        // ========== COMMENTS WITH DETAILS ==========

        [HttpGet("{movieId}/comments-with-details")]
        public async Task<IActionResult> GetMovieCommentsWithDetails(int movieId, [FromQuery] string sortBy = "latest")
        {
            var commentsQuery = _context.UserMovieInteractions.Where(i => i.MovieId == movieId && i.Comment != null);
            commentsQuery = sortBy switch
            {
                "latest" => commentsQuery.OrderByDescending(i => i.CommentDate),
                "oldest" => commentsQuery.OrderBy(i => i.CommentDate),
                "most-liked" => commentsQuery.OrderByDescending(i => _context.CommentLikes.Count(l => l.CommentId == i.Id)),
                _ => commentsQuery.OrderByDescending(i => i.CommentDate)
            };
            var comments = await commentsQuery
                .Include(i => i.User)
                .Select(i => new
                {
                    i.Id,
                    i.UserId,
                    Username = i.User.Username,
                    ProfilePicture = i.User.ProfilePicture,
                    i.Comment,
                    i.CommentDate,
                    LikesCount = _context.CommentLikes.Count(l => l.CommentId == i.Id),
                    RepliesCount = _context.CommentReplies.Count(r => r.ParentCommentId == i.Id)
                })
                .ToListAsync();
            return Ok(new { comments, totalCount = comments.Count });
        }

        [HttpPost("comment/{commentId}/like-status")]
        public async Task<IActionResult> GetUserLikeStatus(int commentId, [FromBody] GetLikeStatusRequest request)
        {
            var hasLiked = await _context.CommentLikes.AnyAsync(l => l.CommentId == commentId && l.UserId == request.UserId);
            return Ok(new { hasLiked });
        }
    }

    // ========== REQUEST MODELS ==========
    public class FavoriteRequest { public int UserId { get; set; } public int MovieId { get; set; } }
    public class RatingRequest { public int UserId { get; set; } public int MovieId { get; set; } public int Rating { get; set; } }
    public class CommentRequest { public int UserId { get; set; } public int MovieId { get; set; } public string Comment { get; set; } = ""; }
    public class UpdateCommentRequest { public string Comment { get; set; } = ""; }
    public class WatchlistRequest { public int UserId { get; set; } public int MovieId { get; set; } }
    public class WatchedRequest { public int UserId { get; set; } public int MovieId { get; set; } }
    public class LikeCommentRequest { public int UserId { get; set; } }
    public class AddReplyRequest { public int UserId { get; set; } public string ReplyText { get; set; } = ""; }
    public class GetLikeStatusRequest { public int UserId { get; set; } }
}