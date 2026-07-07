using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace LibrarySys.Controllers
{
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
        public ActionResult<IEnumerable<UserDto>> GetAllUsers()
        {
            return Ok(_userService.GetAll());
        }

        [HttpGet("{id}/GetUserById")]
        public ActionResult<UserDto> GetUserById(int id)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("BorrowBookforUser")]
        public ActionResult<UserDto> RegisterBorrower([FromBody] UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest("Username and FullName are required.");

            var user = _userService.RegisterBorrower(dto.Username, dto.FullName);
            return Ok(user);
        }

        [HttpPost("RegisterUser")]
        public ActionResult<UserDto> RegisterUser([FromBody] UserDto user)
        {
            var created = _userService.Register(user);
            return CreatedAtAction(nameof(GetUserById), new { id = created.Id }, created);
        }


        [HttpPut("{id}/UpdateUser")]
        public ActionResult<UserDto> UpdateUser(int id, [FromBody] UserDto user)
        {
            if (id != user.Id) return BadRequest("ID mismatch");
            var updated = _userService.Update(user);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}/DeleteUser")]
        public IActionResult DeleteUser(int id)
        {
            var deleted = _userService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
