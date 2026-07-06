using LibrarySys.Dtos;
using LibrarySys.Services;
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

        [HttpGet]
        public ActionResult<IEnumerable<BookDto>> GetAllBooks() 
        { 
            return Ok(_bookService.GetAll()); 
        }

        [HttpGet("{id}")]
        public ActionResult<BookDto> GetBookById(int id)
        {
            var book = _bookService.GetById(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost]
        public ActionResult<BookDto> CreateBook([FromBody] BookDto book)
        {
            var created = _bookService.Add(book);
            return CreatedAtAction(nameof(GetBookById), new { id = created.Id }, created);
        }

        // POST: api/book/{id}/borrow
        [HttpPost("{id}/borrow")]
        public ActionResult<BookDto> BorrowBook(int id, [FromQuery] int userId)
        {
            var borrowed = _bookService.BorrowBook(id, userId);
            if (borrowed == null) return BadRequest("Book not available.");
            return Ok(borrowed);
        }

        // POST: api/book/{id}/return
        [HttpPost("{id}/return")]
        public ActionResult<BookDto> ReturnBook(int id)
        {
            var returned = _bookService.ReturnBook(id);
            if (returned == null) return BadRequest("Book not currently borrowed.");
            return Ok(returned);
        }


        [HttpPut("{id}")]
        public ActionResult<BookDto> UpdateBook(int id, [FromBody] BookDto book)
        {
            if (id != book.Id) return BadRequest("ID mismatch");
            var updated = _bookService.Update(book);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBook(int id)
        {
            var deleted = _bookService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
