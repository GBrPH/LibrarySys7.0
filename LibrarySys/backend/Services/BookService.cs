using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Models;
using LibrarySys.BackEnd.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Services
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

        private BookDto ToDto(Book book) =>
            book == null ? null : new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                CopiesAvailable = book.CopiesAvailable,
                IsAvailable = book.IsAvailable,
                BorrowedByUserId = book.BorrowedByUserId,
                BorrowedDate = book.BorrowedDate,
                DueDate = book.DueDate
            };

        private Book ToModel(BookDto dto) =>
            dto == null ? null : new Book
            {
                Id = dto.Id,
                Title = dto.Title,
                Author = dto.Author,
                CopiesAvailable = dto.CopiesAvailable,
                IsAvailable = dto.IsAvailable,
                BorrowedByUserId = dto.BorrowedByUserId,
                BorrowedDate = dto.BorrowedDate,
                DueDate = dto.DueDate
            };

        public IEnumerable<BookDto> GetAll()
        {
            var books = _repo.GetAll();
            return books.Select(ToDto);
        }

        public BookDto GetById(int id)
        {
            var book = _repo.GetById(id);
            return ToDto(book);
        }

        public IEnumerable<BookDto> GetOverdueBooks()
        {
            var books = _repo.GetOverdueBooks();
            return books.Select(ToDto);
        }

        public BookDto Add(BookDto dto)
        {
            var model = ToModel(dto);
            var saved = _repo.Insert(model);
            return ToDto(saved);
        }

        public BookDto Update(BookDto dto)
        {
            var model = ToModel(dto);
            var updated = _repo.Update(model);
            return ToDto(updated);
        }

        public BookDto BorrowBook(int bookId, int userId)
        {
            var borrowed = _repo.BorrowBook(bookId, userId);
            if (borrowed != null && borrowed.BorrowedDate.HasValue)
            {
                _logService.LogBorrow(bookId, borrowed.Title, userId, "UnknownUser", borrowed.BorrowedDate.Value);
            }
            return ToDto(borrowed);
        }

        public BookDto ReturnBook(int bookId, int userId)
        {
            var returned = _repo.ReturnBook(bookId);
            if (returned != null)
            {
                _logService.LogReturn(bookId, userId, returned.DueDate ?? DateTime.UtcNow);
            }
            return ToDto(returned);
        }

        public bool Delete(int id) => _repo.Delete(id);
    }
}