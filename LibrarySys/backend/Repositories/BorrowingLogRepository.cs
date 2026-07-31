using LibrarySys.BackEnd.Data;
using LibrarySys.BackEnd.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Repositories
{
    public class BorrowingLogRepository
    {
        private readonly LibraryContext _db;

        public BorrowingLogRepository(LibraryContext db)
        {
            _db = db;
        }

        public IEnumerable<BorrowingLog> GetAll() =>
            _db.BorrowingLogs.ToList();

        public IEnumerable<BorrowingLog> GetHistoryByUser(int userId) =>
            _db.BorrowingLogs
                .Where(l => l.UserId == userId)
                .ToList();

        public BorrowingLog LogBorrow(int bookId, string bookTitle, int userId, string username, DateTime borrowDate)
        {
            var log = new BorrowingLog
            {
                BookId = bookId,
                BookTitle = bookTitle,
                UserId = userId,
                Username = username,
                BorrowDate = borrowDate,
                IsOverdue = false
            };

            _db.BorrowingLogs.Add(log);
            _db.SaveChanges();
            return log;
        }

        public void LogReturn(int bookId, int userId, DateTime returnDate)
        {
            var log = _db.BorrowingLogs
                .FirstOrDefault(l => l.BookId == bookId && l.UserId == userId && l.ReturnDate == null);

            if (log != null)
            {
                log.ReturnDate = returnDate;
                _db.SaveChanges();
            }
        }
    }
}