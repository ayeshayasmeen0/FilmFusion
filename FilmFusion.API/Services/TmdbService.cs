using TMDbLib.Client;
using TMDbLib.Objects.Movies;
using TMDbLib.Objects.Search;
using MyMovie = FilmFusion.API.Models.Movie;

namespace FilmFusion.API.Services
{
    public class TmdbService
    {
        private readonly TMDbClient _client;

        public TmdbService(IConfiguration config)
        {
            var apiKey = config["TMDB:ApiKey"];

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new Exception("TMDB API Key is missing");
            }

            _client = new TMDbClient(apiKey);
        }

        public async Task<List<SearchMovie>> SearchMoviesAsync(string query, int page = 1)
        {
            var result = await _client.SearchMovieAsync(
                query,
                language: "en-US",
                page: page
            );

            if (result != null && result.Results != null)
            {
                return result.Results.ToList();
            }

            return new List<SearchMovie>();
        }

        public async Task<MyMovie?> GetMovieDetailsAsync(int tmdbId)
        {
            var tmdbMovie = await _client.GetMovieAsync(
                tmdbId,
                MovieMethods.Credits | MovieMethods.Videos
            );

            if (tmdbMovie == null)
            {
                return null;
            }

            var movie = new MyMovie
            {
                TmdbId = tmdbId,
                Title = tmdbMovie.Title ?? "",
                OriginalTitle = tmdbMovie.OriginalTitle ?? "",
                Overview = tmdbMovie.Overview ?? "",
                PosterPath = tmdbMovie.PosterPath ?? "",
                BackdropPath = tmdbMovie.BackdropPath ?? "",

                Year = tmdbMovie.ReleaseDate != null
                    ? tmdbMovie.ReleaseDate.Value.Year
                    : 0,

                Genre = tmdbMovie.Genres != null
                    ? string.Join(", ", tmdbMovie.Genres.Select(g => g.Name))
                    : "",

                Rating = tmdbMovie.VoteAverage,

                Runtime = tmdbMovie.Runtime.HasValue
                    ? $"{tmdbMovie.Runtime} min"
                    : "N/A",

                Director = tmdbMovie.Credits != null &&
                           tmdbMovie.Credits.Crew != null
                    ? (tmdbMovie.Credits.Crew
                        .FirstOrDefault(c => c.Job == "Director")?.Name ?? "")
                    : "",

                Cast = tmdbMovie.Credits != null &&
                       tmdbMovie.Credits.Cast != null
                    ? string.Join(", ",
                        tmdbMovie.Credits.Cast
                            .Take(5)
                            .Select(c => c.Name ?? ""))
                    : ""
            };

            if (tmdbMovie.Videos != null &&
                tmdbMovie.Videos.Results != null)
            {
                var trailer = tmdbMovie.Videos.Results
                    .FirstOrDefault(v =>
                        v.Type == "Trailer" &&
                        v.Site == "YouTube");

                if (trailer != null && trailer.Key != null)
                {
                    movie.TrailerUrl =
                        "https://www.youtube.com/watch?v=" + trailer.Key;
                }
            }

            return movie;
        }

        public async Task<List<SearchMovie>> GetPopularMoviesAsync(int page = 1)
        {
            var result = await _client.GetMoviePopularListAsync(
                language: "en-US",
                page: page
            );

            if (result != null && result.Results != null)
            {
                return result.Results.ToList();
            }

            return new List<SearchMovie>();
        }

        public async Task<List<SearchMovie>> GetTopRatedMoviesAsync(int page = 1)
        {
            var result = await _client.GetMovieTopRatedListAsync(
                language: "en-US",
                page: page
            );

            if (result != null && result.Results != null)
            {
                return result.Results.ToList();
            }

            return new List<SearchMovie>();
        }
    }
}