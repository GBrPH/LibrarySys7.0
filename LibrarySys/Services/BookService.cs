using LibrarySys.Dtos;
using LibrarySys.Repositories;
using System.Collections.Generic;

namespace LibrarySys.Services
{
    public class BookService
    {
        private readonly BookRepository _repo;

        public BookService(BookRepository repo)
        {
            _repo = repo;
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

        public BookDto BorrowBook(int bookId, int userId, int days = 14)
        {
            return _repo.BorrowBook(bookId, userId, days);
        }

        public BookDto ReturnBook(int bookId)
        {
            return _repo.ReturnBook(bookId);
        }
    }
}
