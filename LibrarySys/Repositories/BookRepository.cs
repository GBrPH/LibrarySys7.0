using LibrarySys.Dtos;
using System.Collections.Generic;

namespace LibrarySys.Repositories
{
    public class BookRepository
    {
        private readonly List<BookDto> _books;

        public BookRepository()
        {
            // Dumy Data
            _books = new List<BookDto>
            {
                new BookDto { Id = 1, Title = "C# in Depth", Author = "Jon Skeet", CopiesAvailable = 3 },
                new BookDto { Id = 2, Title = "Clean Code", Author = "Robert C. Martin", CopiesAvailable = 5 },
                new BookDto { Id = 3, Title = "Design Patterns", Author = "GoF", CopiesAvailable = 2 }
            };
        }

        public IEnumerable<BookDto> GetAll() 
        { 
            return _books; 
        }

        public BookDto GetById(int id)
        {
            return _books.Find(b => b.Id == id);
        }
    
        public BookDto Insert(BookDto book)
        {
            book.Id = _books.Count + 1;
            _books.Add(book);
            return book;
        }

        public BookDto Update(BookDto book)
        {
            var existing = _books.Find(b => b.Id == book.Id);
            if (existing != null)
            {
                existing.Title = book.Title;
                existing.Author = book.Author;
            }
            return existing;
        }

        public bool Delete(int id)
        {
            var book = _books.Find(b => b.Id == id);
            return _books.Remove(book);
        }
        public BookDto BorrowBook(int bookId, int userId, int days = 14)
        {
            var book = _books.Find(b => b.Id == bookId);
            if (book == null || book.CopiesAvailable <= 0) return null;

            book.CopiesAvailable--;
            book.BorrowedByUserId = userId;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(days);
            return book;
        }
        public BookDto ReturnBook(int bookId)
        {
            var book = _books.Find(b => b.Id == bookId);
            if (book == null || book.BorrowedByUserId == null) return null;

            book.CopiesAvailable++;
            book.BorrowedByUserId = null;
            book.BorrowedDate = null;
            book.DueDate = null;
            return book;
        }
        public List<BookDto> GetOverdueBooks()
        {
            var today = DateTime.UtcNow;
            return _books
                .Where(b => b.BorrowedByUserId != null
                            && b.DueDate.HasValue
                            && b.DueDate.Value < today)
                .ToList();
        }
    }
}
