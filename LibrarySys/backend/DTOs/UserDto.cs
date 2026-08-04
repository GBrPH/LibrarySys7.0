namespace LibrarySys.BackEnd.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; } = "Borrower";
        public bool IsActive { get; set; } = true;
        public bool IsLoggedIn { get; set; }
    }
    public class UpdateFullNameDto
    {
        public string? Username { get; set; }
        public string? FullName { get; set; }
    }
}