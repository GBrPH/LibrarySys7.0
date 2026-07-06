namespace LibrarySys.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }  
        public string? Username { get; set; }  // Login name if possible the ID
        public string? FullName { get; set; }  // dA Name
        public string? Role { get; set; } // Librarian, Faculty, Student
        public bool IsActive { get; set; }       
    }
}
