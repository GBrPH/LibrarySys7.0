namespace LibrarySys.Dtos
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public int CopiesAvailable { get; set; }

        // orrowing
        public DateTime? BorrowedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int? BorrowedByUserId { get; set; } 
    }

}
