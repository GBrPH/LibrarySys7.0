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

        public IEnumerable<BookDto> GetAll()
        {
             return  _repo.GetAll();
        }

        public BookDto GetById(int id)
        {
            return _repo.GetById(id);
        }

        public IEnumerable<BookDto> GetOverdueBooks()
        {
            return _repo.GetOverdueBooks();
        }

        public BookDto Add(BookDto book)
        {
            return _repo.Insert(book);
        }

        public BookDto Update(BookDto book)  
        { 
            return _repo.Update(book); 
        }

        public bool Delete(int id)  
        { 
            return _repo.Delete(id); 
        }

        public BookDto BorrowBook(int bookId, UserDto borrower)
        {
            var book = _repo.GetById(bookId);
            if (book == null || book.CopiesAvailable <= 0)
                return null;

            book.CopiesAvailable -= 1;
            book.BorrowedByUserId = borrower.Id;
            book.BorrowedDate = DateTime.Now;
            book.DueDate = book.BorrowedDate.Value.AddDays(7); // 👈 example rule

            // Log borrow action
            _logService.LogBorrow(book.Id, book.Title, borrower.Id, borrower.Username, book.BorrowedDate.Value);

            return book;
        }

        public BookDto ReturnBook(int bookId, UserDto borrower)
        {
            var book = _repo.GetById(bookId);
            if (book == null || book.BorrowedByUserId != borrower.Id)
                return null;

            book.CopiesAvailable += 1;
            book.BorrowedByUserId = null;
            book.BorrowedDate = null;
            book.DueDate = null;

            // Log return action
            _logService.LogReturn(book.Id, borrower.Id, DateTime.Now);

            return book;
        }

    }
}
