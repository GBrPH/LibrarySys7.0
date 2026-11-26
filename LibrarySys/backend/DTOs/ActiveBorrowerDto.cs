namespace LibrarySys.BackEnd.DTOs
{
    public class ActiveBorrowerDto
    {
        public int BorrowingLogId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsOverdue { get; set; }
    }
}