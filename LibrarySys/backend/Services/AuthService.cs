using LibrarySys.BackEnd.DTOs;

namespace LibrarySys.BackEnd.Services
{
    public class AuthService
    {
        public UserDto Logout(UserDto user)
        {
            user.IsActive = false;
            return user;
        }
    }
}