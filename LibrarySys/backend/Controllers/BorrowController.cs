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

            book.Copies--;
            book.BorrowedByUserId = user.Id;
            book.BorrowerName = string.IsNullOrEmpty(user.FullName) ? user.Username : user.FullName;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(14); // 14-day limit
            book.IsAvailable = book.Copies > 0;

            var log = new BorrowingLog
            {
                BookId = book.Id,
                BookTitle = book.Title,
                UserId = user.Id,
                Username = user.Username,
                BorrowDate = DateTime.UtcNow,
                IsOverdue = false
            };
            _db.BorrowingLogs.Add(log);
            _db.SaveChanges();

            return Ok(new { message = $"You have successfully borrowed '{book.Title}'." });
        }

        // --- NEW RETURN FEATURE ---
        [HttpPost("ReturnBook")]
        public IActionResult ReturnBook([FromBody] BorrowRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest(new { message = "Username is required to return a book." });

            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == request.Username.ToLower());
            if (user == null) return BadRequest(new { message = "User account not found." });

            var book = _db.Books.FirstOrDefault(b => b.Id == request.BookId);
            if (book == null) return NotFound(new { message = "Book not found." });

            // Find the active borrowing log for this specific user and book
            var log = _db.BorrowingLogs.FirstOrDefault(l => l.BookId == book.Id && l.UserId == user.Id && l.ReturnDate == null);
            if (log == null) return BadRequest(new { message = "No active borrow record found for this book." });

            log.ReturnDate = DateTime.UtcNow;
            log.IsOverdue = (DateTime.UtcNow - log.BorrowDate).TotalDays > 21;

            book.Copies++;
            book.IsAvailable = true;

            if (book.BorrowedByUserId == user.Id)
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

        // --- TEMPORARY TESTING ENDPOINT: SEED OVERDUE BOOK ---
        [HttpGet("SeedOverdue")]
        [AllowAnonymous] // So you can just type it in your browser!
        public IActionResult SeedOverdue()
        {
            // 1. Grab the first available user and book from the database
            var user = _db.Users.FirstOrDefault();
            var book = _db.Books.FirstOrDefault(b => b.Copies > 0);

            if (user == null || book == null)
            {
                return BadRequest("Make sure you have at least one user and one available book in the database first.");
            }

            // 2. Modify the book as if it was borrowed 15 days ago
            book.Copies--;
            book.BorrowedByUserId = user.Id;
            book.BorrowerName = string.IsNullOrEmpty(user.FullName) ? user.Username : user.FullName;

            // THE TIME TRAVEL MAGIC: Set dates to the past
            book.BorrowedDate = DateTime.UtcNow.AddDays(-15);
            book.DueDate = DateTime.UtcNow.AddDays(-1); // Due yesterday!
            book.IsAvailable = book.Copies > 0;

            // 3. Create the log entry from 15 days ago
            var log = new BorrowingLog
            {
                BookId = book.Id,
                BookTitle = book.Title,
                UserId = user.Id,
                Username = user.Username,
                BorrowDate = DateTime.UtcNow.AddDays(-15),
                IsOverdue = false // It hasn't been returned yet!
            };

            _db.BorrowingLogs.Add(log);
            _db.SaveChanges();

            return Ok(new
            {
                message = $"SUCCESS! Created a fake overdue record. '{book.Title}' was 'borrowed' 15 days ago by {user.Username}."
            });
        }
    }
}