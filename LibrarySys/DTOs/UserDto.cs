namespace LibrarySys.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }  

        public string? Username { get; set; }  

        public string? FullName { get; set; }  

        public string? Role { get; set; } = "Borrower";

        public bool IsActive { get; set; }       
    }
}
