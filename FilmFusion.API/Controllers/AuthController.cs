using FilmFusion.API.Data; //
using FilmFusion.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace FilmFusion.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "User already exists" });
                }

                var passwordHash = HashPassword(request.Password);

                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    Role = "User",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Bio = "",
                    ProfilePicture = ""
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully", userId = user.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                var passwordHash = HashPassword(request.Password);

                if (user.PasswordHash != passwordHash)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                return Ok(new
                {
                    message = "Login successful",
                    userId = user.Id,
                    username = user.Username,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        // GET: api/Auth/profile/{id}
        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Bio,
                    user.ProfilePicture,
                    user.Role,
                    user.CreatedAt,
                    user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        // PUT: api/Auth/profile/{id}
        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (!string.IsNullOrEmpty(request.Username))
                    user.Username = request.Username;

                if (!string.IsNullOrEmpty(request.Email))
                    user.Email = request.Email;

                if (request.Bio != null)
                    user.Bio = request.Bio;

                if (request.ProfilePicture != null)
                    user.ProfilePicture = request.ProfilePicture;

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Profile updated successfully",
                    user = new { user.Id, user.Username, user.Email, user.Bio, user.ProfilePicture, user.Role, user.CreatedAt, user.UpdatedAt }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }

    // Request Models
    public class RegisterRequest
    {
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class UpdateProfileRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePicture { get; set; }
    }
}