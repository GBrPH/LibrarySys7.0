using LibrarySys.BackEnd.Data;
using LibrarySys.BackEnd.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Repositories
{
    public class BookRepository
    {
        private readonly LibraryContext _bookdb;

        public BookRepository(LibraryContext bookdb)
        {
            _bookdb = bookdb;
            SeedData();
        }

        private void SeedData()
        {
            if (!_bookdb.Books.Any())
            {
                _bookdb.Books.AddRange(
                    new Book { Id = 1, Title = "The Clean Coder", Author = "Robert C. Martin", BorrowerName = "", Copies = 5, IsAvailable = true },
                    new Book { Id = 2, Title = "Design Patterns", Author = "Erich Gamma", BorrowerName = "", Copies = 3, IsAvailable = true },
                    new Book { Id = 3, Title = "React Key Concepts", Author = "Maximilian S.", BorrowerName = "John Doe", Copies = 0, IsAvailable = false, BorrowedByUserId = 2 },
                    new Book { Id = 4, Title = "Pro ASP.NET Core 7", Author = "Adam Freeman", BorrowerName = "", Copies = 2, IsAvailable = true }
                );
                _bookdb.SaveChanges();
            }
        }

        public IEnumerable<Book> GetAll() => _bookdb.Books.ToList();
        public Book GetById(int id) => _bookdb.Books.Find(id);
        public List<Book> GetOverdueBooks() => _bookdb.Books.Where(b => b.BorrowedByUserId != null && b.DueDate.HasValue && b.DueDate.Value < DateTime.UtcNow).ToList();

        public Book Insert(Book book)
        {
            _bookdb.Books.Add(book);
            _bookdb.SaveChanges();
            return book;
        }

        public Book Update(Book book)
        {
            var existing = _bookdb.Books.Find(book.Id);
            if (existing == null) return null;
            existing.Title = book.Title;
            existing.Author = book.Author;
            existing.Copies = book.Copies;
            existing.IsAvailable = book.IsAvailable;
            _bookdb.SaveChanges();
            return existing;
        }

        public Book BorrowBook(int bookId, int userId, int days = 14)
        {
            var book = _bookdb.Books.Find(bookId);
            if (book == null || book.Copies <= 0) return null;
            book.Copies--;
            book.BorrowedByUserId = userId;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(days);
            _bookdb.SaveChanges();
            return book;
        }

        public Book ReturnBook(int bookId)
        {
            var book = _bookdb.Books.Find(bookId);
            if (book == null || book.BorrowedByUserId == null) return null;
            book.Copies++;
            book.BorrowedByUserId = null;
            book.BorrowedDate = null;
            book.DueDate = null;
            _bookdb.SaveChanges();
            return book;
        }

        public bool Delete(int id)
        {
            var book = _bookdb.Books.Find(id);
            if (book == null) return false;
            _bookdb.Books.Remove(book);
            _bookdb.SaveChanges();
            return true;
        }
    }
}