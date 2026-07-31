using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Models;
using LibrarySys.BackEnd.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Services
{
    public class BorrowingLogService
    {
        private readonly BorrowingLogRepository _repo;

        public BorrowingLogService(BorrowingLogRepository repo)
        {
            _repo = repo;
        }

        private BorrowingLogDto ToDto(BorrowingLog log) =>
            log == null ? null : new BorrowingLogDto
            {
                Id = log.Id,
                BookId = log.BookId,
                BookTitle = log.BookTitle,
                UserId = log.UserId,
                Username = log.Username,
                BorrowDate = log.BorrowDate,
                ReturnDate = log.ReturnDate,
                IsOverdue = log.IsOverdue
            };

        public IEnumerable<BorrowingLogDto> GetAll()
        {
            var logs = _repo.GetAll();
            return logs.Select(ToDto);
        }

        public IEnumerable<BorrowingLogDto> GetHistoryByUser(int userId)
        {
            var logs = _repo.GetHistoryByUser(userId);
            return logs.Select(ToDto);
        }

        public BorrowingLogDto LogBorrow(int bookId, string bookTitle, int userId, string username, DateTime borrowDate)
        {
            var saved = _repo.LogBorrow(bookId, bookTitle, userId, username, borrowDate);
            return ToDto(saved);
        }

        public void LogReturn(int bookId, int userId, DateTime returnDate)
        {
            _repo.LogReturn(bookId, userId, returnDate);
        }
    }
}