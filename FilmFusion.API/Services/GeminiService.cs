using System.Text;
using System.Text.Json;

namespace FilmFusion.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        public GeminiService(IConfiguration config, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"] ?? "";
        }

        public async Task<string> GetRecommendationAsync(string userQuery, List<string> availableGenres)
        {
            var genresString = string.Join(", ", availableGenres);

            var prompt = $@"
You are a movie recommendation AI assistant. User says: '{userQuery}'

Based on their query, suggest 3-5 movies. Consider their mood, genre preferences, and any specific requests.

Return ONLY a JSON object in this exact format:
{{
  ""mood"": ""detected mood"",
  ""recommended_genres"": [""genre1"", ""genre2""],
  ""movies"": [
    {{
      ""title"": ""Movie Title"",
      ""year"": 2024,
      ""genre"": ""Genre"",
      ""why"": ""Why this matches their mood""
    }}
  ]
}}

Available genres: {genresString}

Respond with ONLY valid JSON, no extra text.";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            try
            {
                var response = await _httpClient.PostAsync($"{_apiUrl}?key={_apiKey}", content);
                var responseString = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseString);
                var textResponse = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return textResponse ?? "{}";
            }
            catch (Exception ex)
            {
                return $"{{\"error\": \"{ex.Message}\"}}";
            }
        }

        public async Task<string> GetMoodBasedRecommendation(string mood)
        {
            var prompt = $@"
User is feeling '{mood}'. Suggest 5 movies that match this mood.
Return ONLY JSON: 
{{
  ""mood"": ""{mood}"",
  ""movies"": [
    {{""title"": """", ""year"": 0, ""genre"": """", ""reason"": """"}}
  ]
}}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            try
            {
                var response = await _httpClient.PostAsync($"{_apiUrl}?key={_apiKey}", content);
                var responseString = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseString);
                var textResponse = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return textResponse ?? "{}";
            }
            catch (Exception ex)
            {
                return $"{{\"error\": \"{ex.Message}\"}}";
            }
        }
    }
}