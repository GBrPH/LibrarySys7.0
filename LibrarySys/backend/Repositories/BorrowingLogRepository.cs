using LibrarySys.BackEnd.DTOs;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Repositories
{
    public class BorrowingLogRepository
    {
        private readonly List<BorrowingLogDto> _logs = new();
        private int _nextId = 1;

        public BorrowingLogRepository()
        {
            _logs.Add(new BorrowingLogDto
            {
                Id = _nextId++,
                BookId = 1,
                BookTitle = "C# Fundamentals",
                UserId = 101,
                Username = "Alice Librarian",
                BorrowDate = DateTime.Now.AddDays(-5),
                ReturnDate = null,
                IsOverdue = false
            });

            _logs.Add(new BorrowingLogDto
            {
                Id = _nextId++,
                BookId = 2,
                BookTitle = "ASP.NET Core Guide",
                UserId = 102,
                Username = "Bob Borrower",
                BorrowDate = DateTime.Now.AddDays(-10),
                ReturnDate = DateTime.Now.AddDays(-2),
                IsOverdue = false
            });

            _logs.Add(new BorrowingLogDto
            {
                Id = _nextId++,
                BookId = 3,
                BookTitle = "React for Beginners",
                UserId = 103,
                Username = "Charlie Student",
                BorrowDate = DateTime.Now.AddDays(-12),
                ReturnDate = null,
                IsOverdue = true
            });
        }

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
            return log!;
        }

        public IEnumerable<BorrowingLogDto> GetAll() => _logs!;

        public IEnumerable<BorrowingLogDto> GetHistoryByUser(int userId)
        {
            return _logs.Where(l => l.UserId == userId).ToList()!;
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
