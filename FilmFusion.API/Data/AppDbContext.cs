using FilmFusion.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FilmFusion.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserMovieInteraction> UserMovieInteractions { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<CommentReply> CommentReplies { get; set; }
        public DbSet<Notification> Notifications { get; set; }

    }
}