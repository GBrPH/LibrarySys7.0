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

        [HttpGet("ActiveCount/{username}")]
        public IActionResult GetActiveBorrowCount(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Username is required.");

            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == username.ToLower());
            if (user == null) return NotFound("User not found.");

            int activeBorrows = _db.BorrowingLogs.Count(l =>
                l.UserId == user.Id &&
                (l.ReturnDate == null || l.ReturnDate == DateTime.MinValue));

            return Ok(new
            {
                activeBorrows = activeBorrows,
                maxLimit = 5
            });
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

            int maxTotalBooks = 5;
            int maxCopiesOfSameBook = 1;

            var totalActiveBorrows = _db.BorrowingLogs.Count(l =>
                l.UserId == user.Id &&
                (l.ReturnDate == null || l.ReturnDate == DateTime.MinValue));

            if (totalActiveBorrows >= maxTotalBooks)
            {
                return BadRequest(new { message = $"You have reached the maximum limit of {maxTotalBooks} borrowed books. Please return some books before borrowing more." });
            }

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

        
    }
}