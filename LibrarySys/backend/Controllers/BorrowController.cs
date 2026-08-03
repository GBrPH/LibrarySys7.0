using System.Security.Claims;
using LibrarySys.backend.DTOs;
using LibrarySys.BackEnd.Data;
using LibrarySys.BackEnd.Models; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrarySys.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BorrowController : ControllerBase
    {
        private readonly LibraryContext _context;

        public BorrowController(LibraryContext context)
        {
            _context = context;
        }

        [HttpPost("BorrowBook")]
        public async Task<IActionResult> BorrowBook([FromBody] BorrowRequestDto request)
        {
            // Aggressively search for the user's ID in the token claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("id")?.Value
                           ?? User.FindFirst("UserId")?.Value
                           ?? User.FindFirst("uid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                // Added extra debug text so you know exactly what is failing if it happens again
                return Unauthorized(new { message = "Invalid user authentication token. Missing User ID claim in JWT." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found in database." });
            }

            var book = await _context.Books.FindAsync(request.BookId);
            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }

            if (book.Copies <= 0)
            {
                return BadRequest(new { message = "No copies available for borrowing." });
            }

            // Process the borrowing logic
            book.Copies -= 1;
            book.BorrowedByUserId = user.Id;
            book.BorrowerName = user.FullName ?? user.Username;
            book.BorrowedDate = DateTime.UtcNow;
            book.DueDate = DateTime.UtcNow.AddDays(14);

            if (book.Copies == 0)
            {
                book.IsAvailable = false;
            }

            // Create the Log entry
            var log = new BorrowingLog
            {
                BookId = book.Id,
                BookTitle = book.Title,
                UserId = user.Id,
                Username = user.Username ?? "Unknown",
                BorrowDate = DateTime.UtcNow,
                ReturnDate = null,
                IsOverdue = false
            };

            _context.BorrowingLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Book successfully borrowed!", dueDate = book.DueDate });
        }
    }
}