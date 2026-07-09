using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;

namespace LibrarySys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly BookService _bookService;

        public BookController(BookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet("GetAllBooks")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<BookDto>> GetAllBooks() 
        { 
            return Ok(_bookService.GetAll()); 
        }

        [HttpGet("GetBookById/{id}")]
        [AllowAnonymous]
        public ActionResult<BookDto> GetBookById(int id)
        {
            var book = _bookService.GetById(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost("CreateBook")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<BookDto> CreateBook([FromBody] BookDto book)
        {
            var created = _bookService.Add(book);
            return CreatedAtAction(nameof(GetBookById), new { id = created.Id }, created);
        }

        [HttpPost("BorrowingBook/{id}")]
        [Authorize(Roles = "Borrower")]
        public ActionResult<BookDto> BorrowBook(int id, [FromQuery] int userId)
        {
            var borrowed = _bookService.BorrowBook(id, userId);
            if (borrowed == null) return BadRequest("Book not available.");
            return Ok(borrowed);
        }

        [HttpPost("ReturnBook/{id}")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<BookDto> ReturnBook(int id, [FromQuery] int userId)
        {
            var returned = _bookService.ReturnBook(id, userId);
            if (returned == null) return BadRequest("Book not currently borrowed.");
            return Ok(returned);
        }

        [HttpPut("UpdateBook/{id}")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<BookDto> UpdateBook(int id, [FromBody] BookDto book)
        {
            if (id != book.Id) return BadRequest("ID mismatch");
            var updated = _bookService.Update(book);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("DeleteBook/{id}")]
        [Authorize(Roles = "Librarian")]
        public IActionResult DeleteBook(int id)
        {
            var deleted = _bookService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
