using System.Collections.Generic;
using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibrarySys.BackEnd.Controllers
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

        [HttpGet("GetAllUsers")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<IEnumerable<UserDto>> GetAllUsers()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpGet("GetUserById/{id}")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> GetUserById(int id)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPut("UpdateFullName")]
        [Authorize]
        public IActionResult UpdateFullName([FromBody] UpdateFullNameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.FullName))
            {
                return BadRequest(new { message = "Username and FullName are required." });
            }

            var updatedUser = _userService.UpdateFullName(dto.Username, dto.FullName);
            if (updatedUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new { message = "Your Full Name has been updated successfully!" });
        }

        [HttpPost("BorrowBookforUser")]
        [AllowAnonymous]
        public ActionResult<UserDto> RegisterBorrower([FromBody] UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.FullName) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Username, Full Name, and Password are required.");
            }

            if (dto.Username.Length > 20)
            {
                return BadRequest("Username cannot be longer than 20 characters.");
            }

            if (dto.FullName.Length > 50)
            {
                return BadRequest("Full Name cannot be longer than 50 characters.");
            }

            if (dto.Password.Length < 6 || dto.Password.Length > 24)
            {
                return BadRequest("Password must be between 6 and 50 characters.");
            }

            var existingUser = _userService.GetAll().FirstOrDefault(u =>
                u.Username != null &&
                u.Username.Equals(dto.Username, StringComparison.OrdinalIgnoreCase));

            if (existingUser != null)
            {
                return BadRequest("That username is already taken. Please choose another.");
            }

            var user = _userService.RegisterBorrower(dto.Username, dto.FullName, dto.Password);
            return Ok(user);
        }

        [HttpPost("RegisterUser")]
        [Authorize(Roles = "Librarian")]
        public ActionResult<UserDto> RegisterUser([FromBody] UserDto user)
        {
            var existingUser = _userService.GetAll().FirstOrDefault(u =>
                u.Username != null &&
                u.Username.Equals(user.Username, StringComparison.OrdinalIgnoreCase));

            if (existingUser != null)
            {
                return BadRequest("That username is already taken. Please choose another.");
            }

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