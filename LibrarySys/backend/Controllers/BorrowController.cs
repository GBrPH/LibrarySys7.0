using LibrarySys.BackEnd.Data;
using LibrarySys.BackEnd.Models;
using LibrarySys.backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace LibrarySys.BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BorrowController : ControllerBase
    {
        private readonly LibraryContext _db;

        public BorrowController(LibraryContext db)
        {
            _db = db;
        }

        [HttpPost("BorrowBook")]
        public IActionResult BorrowBook([FromBody] BorrowRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest(new { message = "Username is required to borrow a book." });

            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == request.Username.ToLower());
            if (user == null) return BadRequest(new { message = "User account not found." });

            var book = _db.Books.FirstOrDefault(b => b.Id == request.BookId);
            if (book == null) return NotFound(new { message = "Book not found." });
            if (book.Copies <= 0) return BadRequest(new { message = "Book is out of stock." });

            int maxCopiesOfSameBook = 1;

            var activeBorrowsForThisBook = _db.BorrowingLogs.Count(l =>
                l.UserId == user.Id &&
                l.BookId == book.Id &&
                (l.ReturnDate == null || l.ReturnDate == DateTime.MinValue));

            if (activeBorrowsForThisBook >= maxCopiesOfSameBook)
            {
                return BadRequest(new { message = $"You have reached the limit of {maxCopiesOfSameBook} active borrow(s) for this specific title. Please return a copy before borrowing it again." });
            }

            book.Copies--;
            book.BorrowedByUserId = user.Id;
            book.BorrowerName = string.IsNullOrEmpty(user.FullName) ? user.Username : user.FullName;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(14);
            book.IsAvailable = book.Copies > 0;

            var log = new BorrowingLog
            {
                BookId = book.Id,
                BookTitle = book.Title,
                UserId = user.Id,
                Username = user.Username,
                BorrowDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14),
                IsOverdue = false
            };

            _db.BorrowingLogs.Add(log);
            _db.SaveChanges();

            return Ok(new { message = $"You have successfully borrowed '{book.Title}'." });
        }

        [HttpPost("ReturnBook")]
        public IActionResult ReturnBook([FromBody] BorrowRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest(new { message = "Username is required to return a book." });

            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == request.Username.ToLower());
            if (user == null) return BadRequest(new { message = "User account not found." });

            var book = _db.Books.FirstOrDefault(b => b.Id == request.BookId);
            if (book == null) return NotFound(new { message = "Book not found." });

            var log = _db.BorrowingLogs.FirstOrDefault(l =>
                l.BookId == book.Id &&
                l.UserId == user.Id &&
                (l.ReturnDate == null || l.ReturnDate == DateTime.MinValue));

            if (log == null) return BadRequest(new { message = "No active borrow record found for this book." });

            log.ReturnDate = DateTime.UtcNow;

            log.IsOverdue = (DateTime.UtcNow - log.BorrowDate).TotalDays > 14;

            book.Copies++;
            book.IsAvailable = true;

            var hasOtherActiveBorrows = _db.BorrowingLogs.Any(l =>
                l.BookId == book.Id &&
                l.UserId != user.Id &&
                (l.ReturnDate == null || l.ReturnDate == DateTime.MinValue));

            if (!hasOtherActiveBorrows)
            {
                book.BorrowedByUserId = null;
                book.BorrowerName = null;
                book.BorrowedDate = null;
                book.DueDate = null;
            }

            _db.SaveChanges();

            string statusMsg = log.IsOverdue ? "returned late (overdue)" : "returned successfully";
            return Ok(new { message = $"'{book.Title}' was {statusMsg}." });
        }

        [HttpGet("SeedOverdue")]
        [AllowAnonymous]
        public IActionResult SeedOverdue()
        {
            var user = _db.Users.FirstOrDefault();
            var book = _db.Books.FirstOrDefault(b => b.Copies > 0);

            if (user == null || book == null)
            {
                return BadRequest("Make sure you have at least one user and one available book in the database first.");
            }

            DateTime pastBorrowDate = DateTime.UtcNow.AddDays(-20);
            DateTime pastDueDate = pastBorrowDate.AddDays(14);

            book.Copies--;
            book.BorrowedByUserId = user.Id;
            book.BorrowerName = string.IsNullOrEmpty(user.FullName) ? user.Username : user.FullName;
            book.BorrowedDate = pastBorrowDate;
            book.DueDate = pastDueDate;
            book.IsAvailable = book.Copies > 0;

            var log = new BorrowingLog
            {
                BookId = book.Id,
                BookTitle = book.Title,
                UserId = user.Id,
                Username = user.Username,
                BorrowDate = pastBorrowDate,
                DueDate = pastDueDate,
                IsOverdue = true 
            };

            _db.BorrowingLogs.Add(log);
            _db.SaveChanges();

            string formattedDueDate = pastDueDate.ToString("MMM dd, yyyy");
            return Ok(new { message = $"Successfully seeded an OVERDUE borrow for '{book.Title}'. It was due on {formattedDueDate}." });
        }
    }
}