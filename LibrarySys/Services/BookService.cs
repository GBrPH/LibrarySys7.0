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

        public IEnumerable<BookDto> GetAll() => _repo.GetAll();
        public BookDto GetById(int id) => _repo.GetById(id);
        public BookDto Add(BookDto book) => _repo.Insert(book);
        public BookDto Update(BookDto book) => _repo.Update(book);
        public bool Delete(int id) => _repo.Delete(id);

        internal object BorrowBook(int id, int userId)
        {
            throw new NotImplementedException();
        }

        internal object ReturnBook(int id)
        {
            throw new NotImplementedException();
        }
    }
}
