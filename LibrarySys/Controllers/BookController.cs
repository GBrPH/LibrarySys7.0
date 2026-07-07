using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

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

        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<BookDto>> GetAllBooks() 
        { 
            return Ok(_bookService.GetAll()); 
        }

        [HttpGet("BookById/{id}")]
        public ActionResult<BookDto> GetBookById(int id)
        {
            var book = _bookService.GetById(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpGet("BookOverdue")]
        public ActionResult<IEnumerable<BookDto>> GetOverdueBooks()
        {
            var overdueBooks = _bookService.GetOverdueBooks();
            return Ok(overdueBooks);
        }

        [HttpPost("CreateBook")]
        public ActionResult<BookDto> CreateBook([FromBody] BookDto book)
        {
            var created = _bookService.Add(book);
            return CreatedAtAction(nameof(GetBookById), new { id = created.Id }, created);
        }

        [HttpPost("{bookId}/BorrowBook")]
        [Authorize(Roles = "Borrower")]
        public ActionResult<BookDto> BorrowBook(int bookId, [FromBody] UserDto borrower)
        {
            var book = _bookService.BorrowBook(bookId, borrower);
            if (book == null)
                return BadRequest("Book not available or invalid borrower.");

            return Ok(book);
        }

        [HttpPost("{bookId}/ReturnBook")]
        [Authorize(Roles = "Borrower")]
        public ActionResult<BookDto> ReturnBook(int bookId, [FromBody] UserDto borrower)
        {
            var book = _bookService.ReturnBook(bookId, borrower);
            if (book == null)
                return BadRequest("Book not borrowed by this user or invalid request.");

            return Ok(book);
        }

        [HttpPut("{id}/UpdateBook")]
        public ActionResult<BookDto> UpdateBook(int id, [FromBody] BookDto book)
        {
            if (id != book.Id) return BadRequest("ID mismatch");
            var updated = _bookService.Update(book);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}/DeleteBook")]
        public IActionResult DeleteBook(int id)
        {
            var deleted = _bookService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
