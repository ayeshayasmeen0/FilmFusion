using Microsoft.AspNetCore.Mvc;

namespace FilmFusion.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet("welcome")]
        public IActionResult Welcome()
        {
            return Ok(new { message = "Welcome to FilmFusion - AI Movie Recommendation System", status = "active" });
        }
    }
}