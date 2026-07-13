using System.Collections.Generic;
using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibrarySys.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<IEnumerable<UserDto>> GetAllUsers()
        {
            return Ok();
        }

        [HttpGet("GetUserById/{id}")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> GetUserById(int id)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("BorrowBookforUser")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> RegisterBorrower([FromBody] UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest("Username and FullName are required.");

            var user = _userService.RegisterBorrower(dto.Username, dto.FullName);
            return Ok(user);
        }

        [HttpPost("RegisterUser")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> RegisterUser([FromBody] UserDto user)
        {
            var created = _userService.Register(user);
            return CreatedAtAction(nameof(GetUserById), new { id = created.Id }, created);
        }


        [HttpPut("UpdateUser/{id}")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> UpdateUser(int id, [FromBody] UserDto user)
        {
            if (id != user.Id) return BadRequest("ID mismatch");
            var updated = _userService.Update(user);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("DeleteUser/{id}")]
        [Authorize(Roles = "Librarian")]
        public IActionResult DeleteUser(int id)
        {
            var deleted = _userService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
