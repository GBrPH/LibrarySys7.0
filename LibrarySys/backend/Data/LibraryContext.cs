namespace LibrarySys.BackEnd.Data
{
    using System.Collections.Generic;
    using LibrarySys.BackEnd.Models;
    using Microsoft.EntityFrameworkCore;

    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<BorrowingLog> BorrowingLogs { get; set; }
    }
}
