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

        // GET: api/Movies
        [HttpGet]
        public async Task<IActionResult> GetAllMovies()
        {
            var movies = await _context.Movies.ToListAsync();
            return Ok(movies);
        }

        // GET: api/Movies/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }
            return Ok(movie);
        }

        // GET: api/Movies/search?query=...
        [HttpGet("search")]
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { message = "Query is required" });
            }

            var movies = await _context.Movies
                .Where(m => m.Title.Contains(query) ||
                            m.Genre.Contains(query) ||
                            m.Overview.Contains(query))
                .ToListAsync();
            return Ok(movies);
        }

        // GET: api/Movies/genre/{genre}
        [HttpGet("genre/{genre}")]
        public async Task<IActionResult> GetMoviesByGenre(string genre)
        {
            var movies = await _context.Movies
                .Where(m => m.Genre.ToLower().Contains(genre.ToLower()))
                .ToListAsync();
            return Ok(movies);
        }

        // POST: api/Movies
        [HttpPost]
        public async Task<IActionResult> AddMovie([FromBody] Movie movie)
        {
            if (movie == null)
            {
                return BadRequest(new { message = "Movie data is required" });
            }

            movie.CreatedAt = DateTime.UtcNow;
            movie.UpdatedAt = DateTime.UtcNow;

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Movie added successfully", movie });
        }

        // PUT: api/Movies/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, [FromBody] Movie updatedMovie)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

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

        // DELETE: api/Movies/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie deleted successfully" });
        }

        // ========== TMDB REAL MOVIE DATA ==========

        // GET: api/Movies/search-tmdb?query=...
        [HttpGet("search-tmdb")]
        public async Task<IActionResult> SearchTMDB([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { message = "Query is required" });
            }

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

        // POST: api/Movies/import/{tmdbId}
        [HttpPost("import/{tmdbId}")]
        public async Task<IActionResult> ImportMovie(int tmdbId)
        {
            try
            {
                // Check if already exists
                var existing = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId);
                if (existing != null)
                {
                    return BadRequest(new { message = "Movie already exists in database" });
                }

                // Get details from TMDB
                var movie = await _tmdbService.GetMovieDetailsAsync(tmdbId);
                if (movie == null)
                {
                    return NotFound(new { message = "Movie not found on TMDB" });
                }

                // Save to local database
                _context.Movies.Add(movie);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Movie imported successfully", movie });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error importing movie", error = ex.Message });
            }
        }

        // GET: api/Movies/popular?page=1
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

        // GET: api/Movies/top-rated?page=1
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

        // GET: api/Movies/{id}/trailer
        [HttpGet("{id}/trailer")]
        public async Task<IActionResult> GetTrailer(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            if (movie.TmdbId == null)
            {
                return NotFound(new { message = "No TMDB ID for this movie" });
            }

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

        // POST: api/Movies/favorite
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

        // DELETE: api/Movies/favorite?userId=1&movieId=1
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

        // GET: api/Movies/favorites/{userId}
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

        // POST: api/Movies/rate
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

            // Update movie's average rating
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

        // POST: api/Movies/comment
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

        // GET: api/Movies/{movieId}/comments
        [HttpGet("{movieId}/comments")]
        public async Task<IActionResult> GetMovieComments(int movieId)
        {
            var comments = await _context.UserMovieInteractions
                .Where(i => i.MovieId == movieId && i.Comment != null)
                .Include(i => i.User)
                .OrderByDescending(i => i.CommentDate)
                .Select(i => new {
                    i.User.Username,
                    i.Comment,
                    i.CommentDate
                })
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/Movies/watchlist
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

        // GET: api/Movies/watchlist/{userId}
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

        // POST: api/Movies/watched
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
    }

    // ========== REQUEST MODELS ==========
    public class FavoriteRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
    }

    public class RatingRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public int Rating { get; set; }
    }

    public class CommentRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public string Comment { get; set; } = "";
    }

    public class WatchlistRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
    }

    public class WatchedRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
    }
}