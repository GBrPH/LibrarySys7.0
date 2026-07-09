using LibrarySys.Dtos;
using LibrarySys.Repositories;
using System.Collections.Generic;

namespace LibrarySys.Services
{
    public class BorrowingLogService
    {
        private readonly BorrowingLogRepository _repo;

        public BorrowingLogService(BorrowingLogRepository repo)
        {
            _repo = repo;
        }

        public IEnumerable<BorrowingLogDto> GetAll() => _repo.GetAll();

        public IEnumerable<BorrowingLogDto> GetHistoryByUser(int userId)       
            => _repo.GetHistoryByUser(userId);

        public BorrowingLogDto LogBorrow(int bookId, string bookTitle, int userId, string username, DateTime borrowDate)
            => _repo.LogBorrow(bookId, bookTitle, userId, username, borrowDate);

        public void LogReturn(int bookId, int userId, DateTime returnDate) 
            => _repo.LogReturn(bookId, userId, returnDate);
    }
}
