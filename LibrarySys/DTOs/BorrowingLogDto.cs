namespace LibrarySys.Dtos
{
    public class BorrowingLogDto
    {
        public int Id { get; set; }

        public int BookId { get; set; }

        public string BookTitle { get; set; }

        public int UserId { get; set; }

        public string Username { get; set; }

        public DateTime BorrowDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public bool IsOverdue { get; set; }
    }
}
