using LibrarySys.DTOs;

namespace LibrarySys.Services
{
    public class AuthService
    {
        public Users Logout(Users user)
        {
            user.IsLoggedIn = false;
            return user;
        }
    }
}
