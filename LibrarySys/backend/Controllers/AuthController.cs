using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace LibrarySys.BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly UserService _userService;

        public AuthController(IConfiguration config, UserService userService)
        {
            _config = config;
            _userService = userService;
        }

        [HttpPost("LogIn")]
        public IActionResult Login([FromBody] LoginDto login)
        {
            if (string.IsNullOrWhiteSpace(login.Username) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest("Username and password are required.");

            var users = _userService.GetAll();
            var user = users.FirstOrDefault(u =>
                u.Username != null && u.Username.Equals(login.Username, StringComparison.OrdinalIgnoreCase) &&
                u.Password == login.Password &&
                u.IsActive
            );

            if (user == null)
                return Unauthorized("Invalid credentials");

            // FIX: Pass the user.Id into the token generator
            var token = GenerateJwtToken(user.Username, user.Role ?? "Borrower", user.Id);

            return Ok(new { token });
        }

        // FIX: Add int userId to the parameters
        private string GenerateJwtToken(string username, string role, int userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(ClaimTypes.Role, role),
                
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("id", userId.ToString()),

                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}