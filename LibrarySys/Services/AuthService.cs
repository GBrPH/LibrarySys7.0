using LibrarySys.Dtos;

namespace LibrarySys.Services
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