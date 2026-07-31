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
    }
}
