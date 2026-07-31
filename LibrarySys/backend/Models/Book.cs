namespace LibrarySys.BackEnd.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }

        public string? BorrowerName { get; set; }

        public int CopiesAvailable { get; set; }
        public int? BorrowedByUserId { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime? BorrowedDate { get; set; }
        public DateTime? DueDate { get; set; }
    }
}