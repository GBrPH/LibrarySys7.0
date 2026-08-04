using Microsoft.EntityFrameworkCore;
using LibrarySys.BackEnd.Models;

namespace LibrarySys.BackEnd.Data
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BorrowingLog> BorrowingLogs { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=LAPTOP-RICD4JTS\\SQLEXPRESS01;Database=LibrarySys;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }
    }
}