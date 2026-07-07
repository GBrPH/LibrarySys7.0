using LibrarySys.Dtos;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.Repositories
{
    public class BorrowingLogRepository
    {
        private readonly List<BorrowingLogDto> _logs = new();
        private int _nextId = 1;

        public BorrowingLogDto LogBorrow(int bookId, string bookTitle, int userId, string username, DateTime borrowDate)
        {
            var log = new BorrowingLogDto
            {
                Id = _nextId++,
                BookId = bookId,
                BookTitle = bookTitle,
                UserId = userId,
                Username = username,
                BorrowDate = borrowDate,
                IsOverdue = false
            };
            _logs.Add(log);
            return log;
        }

        public IEnumerable<BorrowingLogDto> GetAll()
        {
            return _logs;
        }

        public IEnumerable<BorrowingLogDto> GetHistoryByUser(int userId)
        {
            return _logs.Where(l => l.UserId == userId).ToList();
        }

        public void LogReturn(int bookId, int userId, DateTime returnDate)
        {
            var log = _logs.LastOrDefault(l => l.BookId == bookId && l.UserId == userId && l.ReturnDate == null);
            if (log != null)
            {
                log.ReturnDate = returnDate;
                log.IsOverdue = returnDate > log.BorrowDate.AddDays(7); // Overdue rule
            }
        }
    }
}
