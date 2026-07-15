using LibrarySys.Dtos;
using LibrarySys.Repositories;
using System.Collections.Generic;

namespace LibrarySys.Services
{
    public class BookService
    {
        private readonly BookRepository _repo;
        private readonly BorrowingLogService _logService;

        public BookService(BookRepository repo, BorrowingLogService logService)
        {
            _repo = repo;
            _logService = logService;
        }

        public IEnumerable<BookDto> GetAll() => _repo.GetAll()!;

        public BookDto GetById(int id) => _repo.GetById(id);
        
        public IEnumerable<BookDto> GetOverdueBooks() => _repo.GetOverdueBooks()!;

        public BookDto Add(BookDto book) => _repo.Insert(book)!;

        public BookDto Update(BookDto book) => _repo.Update(book);

        public BookDto BorrowBook(int bookId, int userId)
        {
            var book = _repo.GetById(bookId);
            if (book == null || book.CopiesAvailable <= 0)
                return null;

            book.CopiesAvailable--;
            book.IsAvailable = book.CopiesAvailable > 0;
            book.BorrowedByUserId = userId;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(14); // unified rule

            _logService.LogBorrow(book.Id, book.Title, userId, "User" + userId, book.BorrowedDate.Value);
            return book;
        }

        public BookDto ReturnBook(int bookId, int userId)
        {
            var book = _repo.GetById(bookId);
            if (book == null || book.BorrowedByUserId != userId)
                return null;

            book.CopiesAvailable++;
            book.IsAvailable = book.CopiesAvailable > 0;
            book.BorrowedByUserId = null;
            book.BorrowedDate = null;
            book.DueDate = null;

            _logService.LogReturn(book.Id, userId, DateTime.UtcNow);
            return book;
        }
        public bool Delete(int id) => _repo.Delete(id);
    }
}
